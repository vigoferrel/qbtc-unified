#!/usr/bin/env node

/*
  QBTC-UNIFIED PRODUCTION BACKGROUND STARTER
  Inicia el sistema completo en segundo plano con reportes de métricas
*/

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🌌 QBTC-UNIFIED PRODUCTION BACKGROUND STARTER');
console.log('============================================');
console.log('🎯 Iniciando sistema completo en segundo plano...');
console.log('📍 Backend: Supabase (https://hrvxsaolaxnqltomqaud.supabase.co)');
console.log('');

class BackgroundSystemStarter {
    constructor() {
        this.processes = new Map();
        this.startTime = Date.now();
        
        this.config = {
            leonardoPort: 3003,
            masterPort: 3203,
            frontendPort: 8080,
            mode: 'production'
        };
    }
    
    async start() {
        try {
            console.log('🚀 PASO 1: Iniciando Leonardo Consciousness en segundo plano');
            await this.startLeonardoBackground();
            
            console.log('⏳ PASO 2: Esperando estabilización (10 segundos)');
            await this.wait(10000);
            
            console.log('🌟 PASO 3: Iniciando Sistema Unificado Maestro');  
            await this.startUnifiedMaster();
            
            console.log('✅ PASO 4: Validación del sistema');
            await this.validateSystem();
            
            this.showSystemInfo();
            this.setupMonitoring();
            this.setupGracefulShutdown();
            
            // Mantener el script vivo para supervisión
            this.keepAlive();
            
        } catch (error) {
            console.error('❌ Error en inicio:', error.message);
            process.exit(1);
        }
    }
    
    async startLeonardoBackground() {
        console.log('🧠 Iniciando Leonardo Consciousness (BIG_BANG MODE)...');
        
        const leonardoProcess = spawn('node', ['leonardo-consciousness/start-leonardo.js'], {
            stdio: ['ignore', 'pipe', 'pipe'],
            detached: false,
            env: {
                ...process.env,
                AUTO_SELECT: '4', // BIG_BANG mode
                LEONARDO_PORT: this.config.leonardoPort.toString(),
                AUTO_START: 'true'
            }
        });
        
        this.processes.set('leonardo', leonardoProcess);
        
        // Configurar logging para Leonardo
        const leonardoLogStream = fs.createWriteStream('leonardo-background.log', { flags: 'a' });
        const leonardoErrorStream = fs.createWriteStream('leonardo-error.log', { flags: 'a' });
        
        leonardoProcess.stdout.on('data', (data) => {
            const output = data.toString();
            leonardoLogStream.write(`[${new Date().toISOString()}] ${output}`);
            // Solo mostrar líneas importantes
            if (output.includes('✅') || output.includes('🎉') || output.includes('❌')) {
                console.log(`[LEONARDO] ${output.trim()}`);
            }
        });
        
        leonardoProcess.stderr.on('data', (data) => {
            const error = data.toString();
            leonardoErrorStream.write(`[${new Date().toISOString()}] ERROR: ${error}`);
            console.error(`[LEONARDO ERROR] ${error.trim()}`);
        });
        
        leonardoProcess.on('error', (error) => {
            console.error(`[LEONARDO SPAWN ERROR] ${error.message}`);
        });
        
        leonardoProcess.on('close', (code) => {
            console.log(`[LEONARDO] Proceso terminado con código ${code}`);
            this.processes.delete('leonardo');
        });
        
        if (leonardoProcess.pid) {
            fs.writeFileSync('leonardo-background.pid', leonardoProcess.pid.toString());
            console.log(`✅ Leonardo iniciado en segundo plano (PID: ${leonardoProcess.pid})`);
        }
    }
    
    async startUnifiedMaster() {
        console.log('🌟 Iniciando Sistema Unificado Maestro...');
        
        const masterProcess = spawn('node', ['launch-quantum-unified-master.js'], {
            stdio: ['ignore', 'pipe', 'pipe'],
            detached: false,
            env: {
                ...process.env,
                HTTP_PORT: this.config.masterPort.toString(),
                DEPLOYMENT_MODE: this.config.mode
            }
        });
        
        this.processes.set('master', masterProcess);
        
        // Configurar logging para Master
        const masterLogStream = fs.createWriteStream('master-background.log', { flags: 'a' });
        const masterErrorStream = fs.createWriteStream('master-error.log', { flags: 'a' });
        
        masterProcess.stdout.on('data', (data) => {
            const output = data.toString();
            masterLogStream.write(`[${new Date().toISOString()}] ${output}`);
            // Solo mostrar líneas importantes
            if (output.includes('✅') || output.includes('🎉') || output.includes('❌')) {
                console.log(`[MASTER] ${output.trim()}`);
            }
        });
        
        masterProcess.stderr.on('data', (data) => {
            const error = data.toString();
            masterErrorStream.write(`[${new Date().toISOString()}] ERROR: ${error}`);
            console.error(`[MASTER ERROR] ${error.trim()}`);
        });
        
        masterProcess.on('error', (error) => {
            console.error(`[MASTER SPAWN ERROR] ${error.message}`);
        });
        
        masterProcess.on('close', (code) => {
            console.log(`[MASTER] Proceso terminado con código ${code}`);
            this.processes.delete('master');
        });
        
        if (masterProcess.pid) {
            fs.writeFileSync('master-background.pid', masterProcess.pid.toString());
            console.log(`✅ Master iniciado en segundo plano (PID: ${masterProcess.pid})`);
        }
    }
    
    async validateSystem() {
        console.log('🔍 Validando servicios...');
        
        // Esperar inicialización
        await this.wait(5000);
        
        // Verificar Leonardo
        try {
            const http = require('http');
            await new Promise((resolve, reject) => {
                const req = http.get(`http://localhost:${this.config.leonardoPort}/health`, { timeout: 3000 }, (res) => {
                    if (res.statusCode === 200) {
                        console.log('✅ Leonardo Consciousness: HEALTHY');
                        resolve();
                    } else {
                        console.log('⚠️ Leonardo Consciousness: Aún inicializando...');
                        resolve();
                    }
                });
                req.on('error', () => {
                    console.log('⚠️ Leonardo Consciousness: Aún inicializando...');
                    resolve();
                });
                req.on('timeout', () => {
                    req.abort();
                    resolve();
                });
            });
        } catch (error) {
            console.log('⚠️ Leonardo: Error en validación');
        }
        
        // Verificar Master
        try {
            const http = require('http');
            await new Promise((resolve, reject) => {
                const req = http.get(`http://localhost:${this.config.masterPort}/api/health`, { timeout: 3000 }, (res) => {
                    if (res.statusCode === 200) {
                        console.log('✅ Sistema Unificado: HEALTHY');
                        resolve();
                    } else {
                        console.log('⚠️ Sistema Unificado: Aún inicializando...');
                        resolve();
                    }
                });
                req.on('error', () => {
                    console.log('⚠️ Sistema Unificado: Aún inicializando...');
                    resolve();
                });
                req.on('timeout', () => {
                    req.abort();
                    resolve();
                });
            });
        } catch (error) {
            console.log('⚠️ Master: Error en validación');
        }
    }
    
    showSystemInfo() {
        const uptime = Math.round((Date.now() - this.startTime) / 1000);
        
        console.log('');
        console.log('🎉 SISTEMA INICIADO EN SEGUNDO PLANO! 🎉');
        console.log('======================================');
        console.log('');
        console.log('📊 INFORMACIÓN DEL SISTEMA:');
        console.log(`  • Tiempo de inicio: ${uptime} segundos`);
        console.log(`  • Procesos activos: ${this.processes.size}`);
        console.log(`  • Modo: ${this.config.mode}`);
        
        console.log('');
        console.log('🔢 PIDs DE PROCESOS:');
        if (fs.existsSync('leonardo-background.pid')) {
            const leonardoPid = fs.readFileSync('leonardo-background.pid', 'utf8').trim();
            console.log(`  • Leonardo Consciousness: ${leonardoPid}`);
        }
        if (fs.existsSync('master-background.pid')) {
            const masterPid = fs.readFileSync('master-background.pid', 'utf8').trim();
            console.log(`  • Sistema Unificado Maestro: ${masterPid}`);
        }
        
        console.log('');
        console.log('🌐 URLS DE ACCESO:');
        console.log(`  • Leonardo Dashboard: http://localhost:${this.config.leonardoPort}/dashboard`);
        console.log(`  • Leonardo Health: http://localhost:${this.config.leonardoPort}/health`);
        console.log(`  • Master Dashboard: http://localhost:${this.config.masterPort}`);
        console.log(`  • Master Health: http://localhost:${this.config.masterPort}/api/health`);
        console.log('  • Supabase Backend: https://hrvxsaolaxnqltomqaud.supabase.co');
        
        console.log('');
        console.log('📂 LOGS DE BACKGROUND:');
        console.log('  • Leonardo Output: leonardo-background.log');
        console.log('  • Leonardo Errors: leonardo-error.log');
        console.log('  • Master Output: master-background.log');
        console.log('  • Master Errors: master-error.log');
        
        console.log('');
        console.log('🔧 COMANDOS DE MONITOREO:');
        console.log('  • Estado del sistema: node check-system-status.js');
        console.log('  • Ver logs Leonardo: Get-Content leonardo-background.log -Tail 20 -Wait');
        console.log('  • Ver logs Master: Get-Content master-background.log -Tail 20 -Wait');
        console.log('  • Test Supabase: node supabase-integration.js');
        
        console.log('');
        console.log('✨ SISTEMA CORRIENDO EN BACKGROUND CON MÁXIMA EXTRACCIÓN DE JUGO CUÁNTICO! ✨');
        console.log('');
    }
    
    setupMonitoring() {
        // Monitoreo periódico cada 60 segundos
        setInterval(async () => {
            console.log('📊 Monitoreo periódico del sistema...');
            
            // Verificar procesos vivos
            let processesAlive = 0;
            for (const [name, process] of this.processes) {
                if (!process.killed) {
                    processesAlive++;
                } else {
                    console.log(`⚠️ Proceso ${name} no está activo`);
                }
            }
            
            console.log(`📈 Procesos activos: ${processesAlive}/${this.processes.size}`);
            
            // Log del estado cada hora
            const uptime = Math.round((Date.now() - this.startTime) / 1000);
            if (uptime % 3600 === 0) { // Cada hora
                console.log(`⏰ Sistema corriendo por ${Math.round(uptime/3600)} horas`);
            }
            
        }, 60000); // 60 segundos
    }
    
    setupGracefulShutdown() {
        const handleShutdown = async () => {
            console.log('');
            console.log('🔄 INICIANDO SHUTDOWN GRACEFUL DEL SISTEMA COMPLETO...');
            
            for (const [name, process] of this.processes) {
                try {
                    console.log(`🔒 Cerrando proceso ${name}...`);
                    process.kill('SIGTERM');
                } catch (error) {
                    console.error(`❌ Error cerrando ${name}:`, error.message);
                }
            }
            
            // Esperar que los procesos se cierren
            await this.wait(3000);
            
            console.log('🔒 SISTEMA COMPLETAMENTE CERRADO');
            process.exit(0);
        };
        
        process.on('SIGINT', handleShutdown);
        process.on('SIGTERM', handleShutdown);
    }
    
    keepAlive() {
        // Mantener el proceso supervisor vivo
        console.log('🔄 Supervisor activo - manteniendo sistema vivo...');
        console.log('💡 Usa Ctrl+C para cerrar todo el sistema');
        console.log('');
        
        // Loop infinito ligero
        setInterval(() => {
            // Heartbeat ligero cada 5 minutos
        }, 300000);
    }
    
    async wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Ejecutar
const starter = new BackgroundSystemStarter();
starter.start().catch(error => {
    console.error('💥 Error fatal:', error.message);
    process.exit(1);
});
