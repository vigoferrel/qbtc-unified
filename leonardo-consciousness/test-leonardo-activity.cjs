#!/usr/bin/env node

/**
 * TEST DIRECTO DE ACTIVIDAD LEONARDO
 * ==================================
 * Verifica si Leonardo está generando operaciones en tiempo real
 */

const fs = require('fs');
const { execSync } = require('child_process');

async function testLeonardoActivity() {
    console.log('🔥 TESTING LEONARDO QUANTUM LIBERATION ACTIVITY');
    console.log('=' .repeat(60));
    
    try {
        // 1. Verificar proceso activo
        const pidFile = 'leonardo-liberation.pid';
        if (!fs.existsSync(pidFile)) {
            console.log('❌ No hay proceso Leonardo activo');
            return;
        }
        
        const pid = fs.readFileSync(pidFile, 'utf8').trim();
        console.log(`📍 PID Leonardo: ${pid}`);
        
        // 2. Verificar actividad CPU
        console.log('\n⚡ Actividad del Proceso:');
        console.log('-' .repeat(40));
        
        try {
            const cpuInfo = execSync(`wmic process where ProcessId=${pid} get ProcessId,WorkingSetSize,PageFileUsage,CPUTime /format:list`, { encoding: 'utf8' });
            console.log(cpuInfo);
        } catch (error) {
            console.log('⚠️ No se pudo obtener información de CPU');
        }
        
        // 3. Monitorear actividad durante 10 segundos
        console.log('\n🔍 Monitoreando actividad por 10 segundos...');
        console.log('-' .repeat(40));
        
        const startTime = Date.now();
        let iterations = 0;
        
        for (let i = 0; i < 10; i++) {
            try {
                const memCheck = execSync(`tasklist /FI "PID eq ${pid}" /FO CSV`, { encoding: 'utf8' });
                const lines = memCheck.split('\n');
                
                if (lines.length > 1) {
                    const data = lines[1].split(',');
                    const memUsage = data[4] ? data[4].replace(/"/g, '') : 'N/A';
                    console.log(`${i + 1}/10 - Memoria: ${memUsage} - ${new Date().toLocaleTimeString()}`);
                    iterations++;
                } else {
                    console.log(`${i + 1}/10 - ❌ Proceso no encontrado`);
                    break;
                }
            } catch (error) {
                console.log(`${i + 1}/10 - ⚠️ Error obteniendo info`);
            }
            
            // Esperar 1 segundo
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // 4. Verificar archivos de log por actividad reciente
        console.log('\n📝 Verificando logs por actividad:');
        console.log('-' .repeat(40));
        
        const logFiles = ['leonardo-liberation.log'];
        
        logFiles.forEach(logFile => {
            if (fs.existsSync(logFile)) {
                const stats = fs.statSync(logFile);
                const lastModified = stats.mtime;
                const now = new Date();
                const timeSinceModified = now - lastModified;
                
                console.log(`📄 ${logFile}:`);
                console.log(`  Última modificación: ${lastModified.toLocaleString()}`);
                console.log(`  Hace: ${Math.round(timeSinceModified / 1000)}s`);
                
                if (timeSinceModified < 300000) { // 5 minutos
                    console.log('  ✅ Log reciente - Posible actividad');
                } else {
                    console.log('  ⚠️ Log antiguo - Sin actividad reciente');
                }
            } else {
                console.log(`📄 ${logFile}: No existe`);
            }
        });
        
        // 5. Test de conectividad real
        console.log('\n🌐 Test de conectividad Binance:');
        console.log('-' .repeat(40));
        
        try {
            const testResponse = await fetch('https://api.binance.com/api/v3/ping');
            if (testResponse.ok) {
                console.log('✅ Binance API accesible');
                
                // Test tiempo del servidor
                const timeResponse = await fetch('https://api.binance.com/api/v3/time');
                const timeData = await timeResponse.json();
                console.log(`🕐 Tiempo servidor: ${new Date(timeData.serverTime).toLocaleString()}`);
                
            } else {
                console.log(`❌ Error Binance API: ${testResponse.status}`);
            }
        } catch (error) {
            console.log(`❌ Error conectividad: ${error.message}`);
        }
        
        // 6. Intentar comunicación con el proceso (si es posible)
        console.log('\n📡 Intentando comunicación con Leonardo:');
        console.log('-' .repeat(40));
        
        // Verificar si hay algún puerto de comunicación activo
        try {
            const netstat = execSync('netstat -an | findstr ":3003\\|:3004\\|:8080\\|:9090"', { encoding: 'utf8' });
            if (netstat.trim()) {
                console.log('🔌 Puertos activos encontrados:');
                console.log(netstat);
            } else {
                console.log('⚠️ No se encontraron puertos de comunicación activos');
            }
        } catch (error) {
            console.log('⚠️ No se pudo verificar puertos de red');
        }
        
        // 7. Reporte final
        console.log('\n📊 REPORTE FINAL:');
        console.log('=' .repeat(60));
        console.log(`📍 Proceso PID ${pid}: ${iterations > 5 ? '✅ ESTABLE' : '⚠️ INESTABLE'}`);
        console.log(`⏱️ Monitoreo completado: ${iterations}/10 iteraciones exitosas`);
        console.log(`🔥 Estado: ${iterations > 8 ? 'OPERATIVO' : iterations > 5 ? 'PARCIAL' : 'PROBLEMÁTICO'}`);
        
        if (iterations < 8) {
            console.log('\n🔧 RECOMENDACIONES:');
            console.log('- Verificar configuración de credenciales');
            console.log('- Revisar conectividad de red');
            console.log('- Considerar reiniciar Leonardo');
        }
        
    } catch (error) {
        console.error('❌ Error en test de actividad:', error.message);
    }
}

// Función fetch para Node.js anterior a v18
global.fetch = global.fetch || (async (url) => {
    const https = require('https');
    const http = require('http');
    
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https:') ? https : http;
        const req = client.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    ok: res.statusCode >= 200 && res.statusCode < 300,
                    status: res.statusCode,
                    json: async () => JSON.parse(data)
                });
            });
        });
        req.on('error', reject);
        req.setTimeout(5000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
    });
});

// Ejecutar test
testLeonardoActivity();
