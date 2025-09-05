#!/usr/bin/env node

/**
 * START REAL TRADING
 * Inicio rápido del sistema completo de trading real
 * Ejecuta todo automáticamente en el orden correcto
 */

const { spawn } = require('child_process');
const path = require('path');

class StartRealTrading {
    constructor() {
        this.projectRoot = __dirname;
        console.log('🚀 START REAL TRADING');
        console.log('====================');
        console.log('Inicio automático del sistema de trading real');
        console.log('');
    }

    /**
     * Verificar si archivo existe
     */
    fileExists(filePath) {
        const fs = require('fs');
        return fs.existsSync(path.join(this.projectRoot, filePath));
    }

    /**
     * Ejecutar comando y esperar resultado
     */
    async runCommand(command, args = [], options = {}) {
        return new Promise((resolve, reject) => {
            console.log(`🔧 Ejecutando: ${command} ${args.join(' ')}`);

            const child = spawn(command, args, {
                cwd: this.projectRoot,
                stdio: options.silent ? 'pipe' : 'inherit',
                ...options
            });

            let output = '';
            let errorOutput = '';

            if (options.silent) {
                child.stdout.on('data', (data) => {
                    output += data.toString();
                });

                child.stderr.on('data', (data) => {
                    errorOutput += data.toString();
                });
            }

            child.on('close', (code) => {
                if (code === 0) {
                    resolve({ code, output, errorOutput });
                } else {
                    reject({ code, output, errorOutput });
                }
            });

            child.on('error', (error) => {
                reject(error);
            });
        });
    }

    /**
     * Verificar configuración
     */
    async verifyConfiguration() {
        console.log('🔍 Verificando configuración...');

        const fs = require('fs');
        const envPath = path.join(this.projectRoot, '.env');

        if (!fs.existsSync(envPath)) {
            console.log('❌ Archivo .env no encontrado');
            console.log('💡 Ejecuta: node setup-real-trading.cjs --interactive');
            return false;
        }

        const envContent = fs.readFileSync(envPath, 'utf8');
        const requiredVars = ['BINANCE_API_KEY', 'BINANCE_SECRET_KEY'];

        for (const varName of requiredVars) {
            if (!envContent.includes(`${varName}=`)) {
                console.log(`❌ ${varName} no configurado`);
                console.log('💡 Ejecuta: node setup-real-trading.cjs --interactive');
                return false;
            }
        }

        console.log('✅ Configuración verificada');
        return true;
    }

    /**
     * Iniciar monitor en background
     */
    async startMonitor() {
        console.log('📊 Iniciando monitor en background...');

        if (this.fileExists('qbtc-proxy-monitor.cjs')) {
            try {
                const monitor = spawn('node', ['qbtc-proxy-monitor.cjs', '--dashboard'], {
                    cwd: this.projectRoot,
                    stdio: 'ignore',
                    detached: true
                });

                monitor.unref();
                console.log('✅ Monitor iniciado: http://localhost:9099');

                // Esperar un poco para que inicie
                await new Promise(resolve => setTimeout(resolve, 2000));

                return true;
            } catch (error) {
                console.log('⚠️ Error iniciando monitor:', error.message);
                return false;
            }
        } else {
            console.log('⚠️ Monitor no disponible');
            return false;
        }
    }

    /**
     * Ejecutar sistema maestro
     */
    async runMasterSystem() {
        console.log('🎛️ Ejecutando sistema maestro...');

        if (!this.fileExists('qbtc-master-system.cjs')) {
            console.log('❌ Sistema maestro no encontrado');
            return false;
        }

        try {
            await this.runCommand('node', ['qbtc-master-system.cjs', '--auto']);
            return true;
        } catch (error) {
            console.log('❌ Error en sistema maestro:', error.code || error.message);
            return false;
        }
    }

    /**
     * Ejecutar sistema de trading real
     */
    async runRealTradingSystem() {
        console.log('💰 Iniciando sistema de trading real...');

        if (!this.fileExists('qbtc-real-trading-system.cjs')) {
            console.log('❌ Sistema de trading real no encontrado');
            return false;
        }

        try {
            await this.runCommand('node', ['qbtc-real-trading-system.cjs', '--interactive']);
            return true;
        } catch (error) {
            console.log('❌ Error en sistema de trading:', error.code || error.message);
            return false;
        }
    }

    /**
     * Mostrar opciones de inicio
     */
    async showStartOptions() {
        console.log('\n🎯 OPCIONES DE INICIO');
        console.log('=====================');
        console.log('1. 🚀 Todo automático (recomendado)');
        console.log('2. 🎛️ Solo sistema maestro');
        console.log('3. 💰 Solo trading real');
        console.log('4. 📊 Solo monitor');
        console.log('5. ⚙️ Configurar sistema');
        console.log('6. ❌ Salir');
        console.log('=====================');

        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const answer = await new Promise(resolve => {
            rl.question('Selecciona una opción (1-6): ', resolve);
        });

        rl.close();

        return answer.trim();
    }

    /**
     * Ejecutar inicio completo
     */
    async runCompleteStart() {
        console.log('🌟 INICIANDO SISTEMA COMPLETO DE TRADING REAL');
        console.log('=============================================');

        try {
            // Paso 1: Verificar configuración
            console.log('\n📋 PASO 1: VERIFICACIÓN DE CONFIGURACIÓN');
            const configOk = await this.verifyConfiguration();
            if (!configOk) {
                console.log('❌ Configuración incompleta');
                console.log('💡 Ejecuta: node setup-real-trading.cjs --interactive');
                return false;
            }

            // Paso 2: Iniciar monitor
            console.log('\n📋 PASO 2: INICIO DEL MONITOR');
            await this.startMonitor();

            // Paso 3: Ejecutar sistema maestro
            console.log('\n📋 PASO 3: SISTEMA MAESTRO');
            const masterOk = await this.runMasterSystem();
            if (!masterOk) {
                console.log('⚠️ Sistema maestro falló, intentando continuar...');
            }

            // Paso 4: Iniciar trading real
            console.log('\n📋 PASO 4: SISTEMA DE TRADING REAL');
            await this.runRealTradingSystem();

            console.log('\n🎉 SISTEMA COMPLETO INICIADO');
            console.log('============================');
            console.log('✅ Monitor: http://localhost:9099');
            console.log('✅ Sistema maestro operativo');
            console.log('✅ Trading real listo');

            return true;

        } catch (error) {
            console.error('❌ Error en inicio completo:', error.message);
            return false;
        }
    }

    /**
     * Ejecutar menú interactivo
     */
    async runInteractive() {
        console.log('🎯 MODO INTERACTIVO DE INICIO');
        console.log('============================');

        while (true) {
            const choice = await this.showStartOptions();

            try {
                switch (choice) {
                    case '1':
                        console.log('\n🚀 Ejecutando inicio completo...');
                        await this.runCompleteStart();
                        break;

                    case '2':
                        console.log('\n🎛️ Ejecutando sistema maestro...');
                        await this.runMasterSystem();
                        break;

                    case '3':
                        console.log('\n💰 Ejecutando trading real...');
                        await this.runRealTradingSystem();
                        break;

                    case '4':
                        console.log('\n📊 Iniciando monitor...');
                        await this.startMonitor();
                        console.log('✅ Monitor iniciado. Presiona Enter para continuar...');
                        await new Promise(resolve => {
                            const readline = require('readline');
                            const rl = readline.createInterface({
                                input: process.stdin,
                                output: process.stdout
                            });
                            rl.question('', () => rl.close());
                        });
                        break;

                    case '5':
                        console.log('\n⚙️ Ejecutando configuración...');
                        if (this.fileExists('setup-real-trading.cjs')) {
                            await this.runCommand('node', ['setup-real-trading.cjs', '--interactive']);
                        } else {
                            console.log('❌ Script de configuración no encontrado');
                        }
                        break;

                    case '6':
                        console.log('\n👋 ¡Hasta luego!');
                        return;

                    default:
                        console.log('\n❌ Opción no válida');
                }
            } catch (error) {
                console.error('\n❌ Error:', error.message);
            }

            // Pausa antes de mostrar menú nuevamente
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    /**
     * Mostrar estado del sistema
     */
    async showSystemStatus() {
        console.log('📊 ESTADO DEL SISTEMA');
        console.log('=====================');

        const systems = [
            { name: 'Sistema Maestro', file: 'qbtc-master-system.cjs' },
            { name: 'Trading Real', file: 'qbtc-real-trading-system.cjs' },
            { name: 'Smart Proxy', file: 'qbtc-smart-proxy.cjs' },
            { name: 'Proxy Monitor', file: 'qbtc-proxy-monitor.cjs' },
            { name: 'Setup Trading', file: 'setup-real-trading.cjs' }
        ];

        systems.forEach(system => {
            const status = this.fileExists(system.file) ? '✅' : '❌';
            console.log(`${status} ${system.name}`);
        });

        // Verificar configuración
        const configOk = await this.verifyConfiguration();
        console.log(`${configOk ? '✅' : '❌'} Configuración`);
    }
}

// Función para mostrar información
function showStartInfo() {
    console.log('🚀 START REAL TRADING');
    console.log('====================');
    console.log('Inicio rápido del sistema completo de trading real');
    console.log('');
    console.log('🎯 LO QUE HACE:');
    console.log('  ✅ Verifica configuración');
    console.log('  ✅ Inicia monitor en background');
    console.log('  ✅ Ejecuta sistema maestro');
    console.log('  ✅ Inicia trading real interactivo');
    console.log('');
    console.log('📋 REQUISITOS:');
    console.log('  • Sistema configurado (setup-real-trading.cjs)');
    console.log('  • Credenciales de Binance');
    console.log('  • Proxy/VPN configurado');
    console.log('');
}

// Si se ejecuta directamente
if (require.main === module) {
    const args = process.argv.slice(2);
    const startSystem = new StartRealTrading();

    if (args.includes('--auto') || args.includes('-a')) {
        // Inicio automático completo
        startSystem.runCompleteStart();
    } else if (args.includes('--interactive') || args.includes('-i')) {
        // Menú interactivo
        showStartInfo();
        startSystem.runInteractive();
    } else if (args.includes('--status') || args.includes('-s')) {
        // Solo mostrar estado
        startSystem.showSystemStatus();
    } else if (args.includes('--master') || args.includes('-m')) {
        // Solo sistema maestro
        startSystem.runMasterSystem();
    } else if (args.includes('--trading') || args.includes('-t')) {
        // Solo trading
        startSystem.runRealTradingSystem();
    } else if (args.includes('--monitor') || args.includes('-o')) {
        // Solo monitor
        startSystem.startMonitor();
    } else {
        // Mostrar ayuda
        showStartInfo();
        console.log('🎛️ START REAL TRADING');
        console.log('====================');
        console.log('Uso:');
        console.log('  node start-real-trading.cjs --auto         # Inicio completo automático');
        console.log('  node start-real-trading.cjs --interactive  # Menú interactivo');
        console.log('  node start-real-trading.cjs --status       # Ver estado del sistema');
        console.log('  node start-real-trading.cjs --master       # Solo sistema maestro');
        console.log('  node start-real-trading.cjs --trading      # Solo trading real');
        console.log('  node start-real-trading.cjs --monitor      # Solo monitor');
        console.log('  node start-real-trading.cjs                # Esta ayuda');
        console.log('');
        console.log('Ejemplos:');
        console.log('  node start-real-trading.cjs --auto         # Todo automático');
        console.log('  node start-real-trading.cjs --interactive  # Menú completo');
        process.exit(0);
    }

    // Manejar señales de terminación
    process.on('SIGINT', () => {
        console.log('\n🔄 Start Real Trading detenido por SIGINT');
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('\n🔄 Start Real Trading detenido por SIGTERM');
        process.exit(0);
    });
}

// Exportar la clase
module.exports = { StartRealTrading };