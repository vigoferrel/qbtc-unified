#!/usr/bin/env node

/**
 * LEONARDO QUANTUM STATUS CHECKER
 * ===============================
 * Script directo para verificar el estado de Leonardo sin interrumpir su operación
 */

const fs = require('fs');
const path = require('path');
const { CredentialsManager } = require('../quantum-core/CredentialsManager');

async function checkLeonardoStatus() {
    console.log('🔍 Verificando estado de Leonardo Quantum Liberation...');
    console.log('=' .repeat(60));
    
    try {
        // 1. Verificar PID activo
        const pidFile = 'leonardo-liberation.pid';
        if (fs.existsSync(pidFile)) {
            const pid = fs.readFileSync(pidFile, 'utf8').trim();
            console.log(`📍 PID registrado: ${pid}`);
            
            // Verificar si el proceso está corriendo (Windows)
            try {
                const { execSync } = require('child_process');
                const processCheck = execSync(`tasklist /FI "PID eq ${pid}"`, { encoding: 'utf8' });
                
                if (processCheck.includes(pid)) {
                    console.log('✅ Proceso Leonardo ACTIVO');
                    
                    // Obtener estadísticas del proceso
                    const stats = execSync(`wmic process where ProcessId=${pid} get WorkingSetSize,PageFileUsage,CreationDate /format:csv`, { encoding: 'utf8' });
                    console.log('📊 Estadísticas del proceso:');
                    console.log(stats.split('\n')[2]); // Línea con datos
                    
                } else {
                    console.log('❌ Proceso Leonardo NO ENCONTRADO');
                }
            } catch (error) {
                console.log('⚠️ No se pudo verificar el proceso');
            }
        } else {
            console.log('❌ No se encontró archivo PID');
        }
        
        // 2. Verificar logs recientes
        console.log('\n📝 Logs recientes:');
        console.log('-' .repeat(40));
        
        if (fs.existsSync('leonardo-liberation.log')) {
            const logs = fs.readFileSync('leonardo-liberation.log', 'utf8');
            const recentLogs = logs.split('\n').slice(-10).join('\n');
            console.log(recentLogs);
        } else {
            console.log('No hay logs disponibles');
        }
        
        // 3. Verificar configuración usando CredentialsManager
        console.log('\n🔧 Configuración (vía CredentialsManager):');
        console.log('-' .repeat(40));
        
        try {
            const credentialsManager = CredentialsManager.getInstance();
            const credStatus = credentialsManager.getCredentialStatus();
            
            console.log(`API_KEY: ${credStatus.apiKey ? 'SET' : 'MISSING'} ${credStatus.apiKeySource ? `(${credStatus.apiKeySource})` : ''}`);
            console.log(`SECRET_KEY: ${credStatus.secretKey ? 'SET' : 'MISSING'} ${credStatus.secretKeySource ? `(${credStatus.secretKeySource})` : ''}`);
            console.log(`TESTNET: ${credStatus.isTestnet ? 'ENABLED' : 'DISABLED'} ${credStatus.isTestnetSource ? `(${credStatus.isTestnetSource})` : ''}`);
            console.log(`Fuentes consultadas: ${credStatus.sourcesChecked || 'N/A'}`);
            
            // Verificación adicional con variables de entorno directas para comparación
            console.log('\n🔄 Comparación con process.env directo:');
            console.log(`process.env.BINANCE_API_KEY: ${process.env.BINANCE_API_KEY ? 'SET' : 'MISSING'}`);
            console.log(`process.env.BINANCE_SECRET_KEY: ${process.env.BINANCE_SECRET_KEY ? 'SET' : 'MISSING'}`);
            
        } catch (error) {
            console.log(`⚠️ Error cargando CredentialsManager: ${error.message}`);
            console.log('Fallback a variables de entorno:');
            console.log('BINANCE_API_KEY:', process.env.BINANCE_API_KEY ? 'SET' : 'MISSING');
            console.log('BINANCE_SECRET_KEY:', process.env.BINANCE_SECRET_KEY ? 'SET' : 'MISSING');
        }
        
        // 4. Verificar archivos críticos
        console.log('\n📁 Archivos del sistema:');
        console.log('-' .repeat(40));
        
        const criticalFiles = [
            'leonardo-quantum-liberation.js',
            'TradingEngineLayer.js',
            'FundsManager.js',
            'SmartQuantityCalculator.js',
            '.env'
        ];
        
        criticalFiles.forEach(file => {
            const exists = fs.existsSync(file);
            console.log(`${exists ? '✅' : '❌'} ${file}`);
        });
        
        // 5. Test de conectividad simple
        console.log('\n🌐 Test de conectividad:');
        console.log('-' .repeat(40));
        
        try {
            const https = require('https');
            const testUrl = 'https://api.binance.com/api/v3/ping';
            
            const req = https.get(testUrl, (res) => {
                if (res.statusCode === 200) {
                    console.log('✅ Conectividad a Binance OK');
                } else {
                    console.log(`⚠️ Respuesta Binance: ${res.statusCode}`);
                }
            });
            
            req.on('error', (error) => {
                console.log(`❌ Error de conectividad: ${error.message}`);
            });
            
            req.setTimeout(5000, () => {
                console.log('⏱️ Timeout de conectividad');
                req.destroy();
            });
            
        } catch (error) {
            console.log(`❌ Error en test: ${error.message}`);
        }
        
        // 6. Crear reporte de estado
        const statusReport = {
            timestamp: new Date().toISOString(),
            pid: fs.existsSync(pidFile) ? fs.readFileSync(pidFile, 'utf8').trim() : null,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            env: {
                hasApiKey: !!process.env.BINANCE_API_KEY,
                hasSecret: !!process.env.BINANCE_SECRET_KEY
            }
        };
        
        console.log('\n📊 Reporte de Estado:');
        console.log('-' .repeat(40));
        console.log(JSON.stringify(statusReport, null, 2));
        
    } catch (error) {
        console.error('❌ Error verificando estado:', error.message);
    }
}

// Ejecutar verificación
checkLeonardoStatus();
