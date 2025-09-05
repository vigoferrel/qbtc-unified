const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const winston = require('winston');

// Configurar logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: '../logs/production-start-error.log', level: 'error' }),
        new winston.transports.File({ filename: '../logs/production-start.log' }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

// Función para iniciar un proceso
function startProcess(name, command, args, options = {}) {
    return new Promise((resolve, reject) => {
        logger.info(`Starting ${name}...`);
        
        const process = spawn(command, args, {
            ...options,
            stdio: 'pipe'
        });

        process.stdout.on('data', (data) => {
            logger.info(`[${name}] ${data.toString().trim()}`);
        });

        process.stderr.on('data', (data) => {
            logger.error(`[${name}] ${data.toString().trim()}`);
        });

        process.on('error', (error) => {
            logger.error(`Error starting ${name}:`, error);
            reject(error);
        });

        process.on('close', (code) => {
            if (code !== 0) {
                logger.error(`${name} process exited with code ${code}`);
                reject(new Error(`Process exited with code ${code}`));
            } else {
                logger.info(`${name} started successfully`);
                resolve(process);
            }
        });

        // Verificar inicio exitoso después de 5 segundos
        setTimeout(() => {
            if (process.exitCode === null) {
                resolve(process);
            }
        }, 5000);
    });
}

// Función para verificar que un puerto está disponible
function checkPort(port) {
    return new Promise((resolve, reject) => {
        const net = require('net');
        const server = net.createServer();
        
        server.once('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                resolve(false);
            } else {
                reject(err);
            }
        });
        
        server.once('listening', () => {
            server.close();
            resolve(true);
        });
        
        server.listen(port);
    });
}

// Función principal
async function startProduction() {
    try {
        logger.info('Starting production environment...');

        // Verificar puertos
        const ports = [18020, 9090, 9091, 9092, 9093];
        for (const port of ports) {
            const available = await checkPort(port);
            if (!available) {
                throw new Error(`Port ${port} is already in use`);
            }
        }

        // Crear directorio de logs si no existe
        const logsDir = path.join(__dirname, '../logs');
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir);
        }

        // Iniciar servicios en orden
        const services = [
            {
                name: 'QuantumCore',
                command: 'node',
                args: ['../quantum-core/index.js'],
                options: { cwd: path.join(__dirname, '../quantum-core') }
            },
            {
                name: 'LeonardoConsciousness',
                command: 'node',
                args: ['../leonardo-consciousness/UnifiedLeonardoServer.js'],
                options: { cwd: path.join(__dirname, '../leonardo-consciousness') }
            },
            {
                name: 'ProductionServer',
                command: 'node',
                args: ['production-server-quantum.cjs'],
                options: { cwd: __dirname }
            }
        ];

        // Iniciar servicios secuencialmente
        for (const service of services) {
            await startProcess(
                service.name,
                service.command,
                service.args,
                service.options
            );
            // Esperar 5 segundos entre servicios
            await new Promise(resolve => setTimeout(resolve, 5000));
        }

        logger.info('All production services started successfully');

        // Mantener el proceso principal vivo
        process.on('SIGINT', () => {
            logger.info('Shutting down production environment...');
            process.exit();
        });

    } catch (error) {
        logger.error('Error starting production:', error);
        process.exit(1);
    }
}

// Iniciar producción
startProduction();
