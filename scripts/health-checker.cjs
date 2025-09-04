// ========================================================================
// 🏥 QUANTUM SYSTEM HEALTH CHECKER
// Script para verificar la salud de los servicios antes de la inicialización
// ========================================================================

const http = require('http');
const net = require('net');

class HealthChecker {
    constructor(config) {
        this.config = config;
        this.checks = [];
        this.maxRetries = 3;
        this.retryDelay = 2000;
    }

    async checkPort(port) {
        return new Promise((resolve) => {
            const server = http.createServer();
            
            server.on('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    resolve(false);
                } else {
                    // Si es otro tipo de error, el puerto probablemente está libre
                    resolve(true);
                }
            });
            
            server.on('listening', () => {
                server.close(() => resolve(true));
            });
            
            server.listen(port, '127.0.0.1');
            
            // Timeout para evitar bloqueos
            setTimeout(() => {
                server.close();
                resolve(true);
            }, 1000);
        });
    }

    verifyHttpEndpoint(port, path = '/health', timeout = 5000) {
        return new Promise((resolve) => {
            const req = http.get(`http://localhost:${port}${path}`, {
                timeout: timeout
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const health = JSON.parse(data);
                        resolve(health.status === 'ok' || health.status === 'running');
                    } catch (e) {
                        resolve(false);
                    }
                });
            });

            req.on('error', () => resolve(false));
            req.on('timeout', () => {
                req.destroy();
                resolve(false);
            });
        });
    }

    async retryCheck(checkFn, retries = this.maxRetries) {
        for (let i = 0; i < retries; i++) {
            const result = await checkFn();
            if (result) return true;
            if (i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, this.retryDelay));
            }
        }
        return false;
    }

    async checkSystem() {
        console.log('🏥 Verificando estado del sistema...');

        // 1. Verificar puertos necesarios
        const requiredPorts = [18020, 18021, 18022, 18023];
        for (const port of requiredPorts) {
            const available = await this.checkPort(port);
            if (available) {
                console.log(`✅ Puerto ${port} disponible`);
            } else {
                console.error(`❌ Puerto ${port} ya está en uso`);
                return false;
            }
        }

        // 2. Verificar dependencias
        try {
            require('express');
            require('crypto');
            console.log('✅ Dependencias básicas verificadas');
        } catch (error) {
            console.error('❌ Dependencias faltantes:', error.message);
            console.log('   💡 Ejecuta: npm install');
            return false;
        }

        // 3. Verificar permisos de directorio
        try {
            const testFile = './quantum-core/test-write.tmp';
            require('fs').writeFileSync(testFile, 'test');
            require('fs').unlinkSync(testFile);
            console.log('✅ Permisos de escritura verificados');
        } catch (error) {
            console.error('❌ Error de permisos en directorio');
            return false;
        }

        // 4. Verificar archivos críticos
        const criticalFiles = [
            './quantum-core/UnifiedHttpServer.js',
            './quantum-core/QuantumUnifiedCore.js',
            './quantum-core/config/quantum-unified.json'
        ];

        for (const file of criticalFiles) {
            try {
                require('fs').accessSync(file);
            } catch (error) {
                console.error(`❌ Archivo crítico no encontrado: ${file}`);
                return false;
            }
        }
        console.log('✅ Archivos críticos verificados');

        console.log('✅ Sistema listo para inicialización');
        return true;
    }

    async monitorHealth(service) {
        const healthCheck = {
            name: service.name,
            port: service.port,
            path: service.healthPath || '/health',
            status: 'checking'
        };

        try {
            const isHealthy = await this.retryCheck(
                () => this.verifyHttpEndpoint(service.port, service.healthPath)
            );

            healthCheck.status = isHealthy ? 'healthy' : 'unhealthy';
            healthCheck.lastCheck = new Date().toISOString();

            return healthCheck;
        } catch (error) {
            healthCheck.status = 'error';
            healthCheck.error = error.message;
            return healthCheck;
        }
    }
}

module.exports = { HealthChecker };

// Si se ejecuta directamente, realizar verificación
if (require.main === module) {
    const config = require('../quantum-core/config/quantum-unified.json');
    const checker = new HealthChecker(config);
    
    checker.checkSystem()
        .then(ready => {
            if (ready) {
                console.log('✅ Sistema verificado y listo para iniciar');
                process.exit(0);
            } else {
                console.error('❌ Sistema no cumple requisitos mínimos');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('❌ Error verificando sistema:', error);
            process.exit(1);
        });
}
