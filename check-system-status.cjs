#!/usr/bin/env node

/*
  QBTC-UNIFIED SYSTEM STATUS CHECKER
  Script de diagnóstico rápido para verificar estado de servicios
*/

const http = require('http');
const { exec } = require('child_process');

const services = {
    'Leonardo Consciousness': 3003,
    'Master Dashboard': 3203,
    'Main Frontend': 8080
};

async function checkService(name, port) {
    return new Promise((resolve) => {
        const req = http.get(`http://localhost:${port}/api/health`, 
            { timeout: 2000 }, 
            (res) => resolve({ name, port, status: res.statusCode === 200, statusCode: res.statusCode })
        );
        req.on('error', (error) => resolve({ name, port, status: false, error: error.message }));
        req.on('timeout', () => {
            req.abort();
            resolve({ name, port, status: false, error: 'TIMEOUT' });
        });
    });
}

async function checkProcesses() {
    return new Promise((resolve) => {
        exec('tasklist | findstr "node"', (error, stdout) => {
            if (error || !stdout) {
                resolve([]);
            } else {
                const processes = stdout.trim().split('\n')
                    .map(line => line.trim())
                    .filter(line => line.includes('node.exe'));
                resolve(processes);
            }
        });
    });
}

async function checkPorts() {
    const allPorts = [3003, 3203, 8080, 3001, 3101, 3301];
    const portStatus = [];
    
    for (const port of allPorts) {
        const isInUse = await new Promise((resolve) => {
            const server = require('net').createServer();
            server.listen(port, () => {
                server.once('close', () => resolve(false));
                server.close();
            });
            server.on('error', () => resolve(true));
        });
        
        portStatus.push({ port, inUse: isInUse });
    }
    
    return portStatus;
}

async function main() {
    console.log('🔍 QBTC-UNIFIED SYSTEM STATUS CHECK');
    console.log('===================================');
    console.log(`📅 ${new Date().toLocaleString()}\n`);
    
    // Check services
    console.log('🌐 SERVICIOS:');
    for (const [name, port] of Object.entries(services)) {
        const result = await checkService(name, port);
        const statusIcon = result.status ? '✅' : '❌';
        const errorInfo = result.error ? ` (${result.error})` : '';
        console.log(`   ${statusIcon} ${name}: ${result.status ? 'HEALTHY' : 'DOWN'} (puerto ${port})${errorInfo}`);
    }
    
    // Check Node processes
    console.log('\n🔄 PROCESOS NODE.JS:');
    const processes = await checkProcesses();
    if (processes.length === 0) {
        console.log('   ❌ No hay procesos Node.js activos');
    } else {
        processes.forEach((process, index) => {
            console.log(`   ✅ Proceso ${index + 1}: ${process}`);
        });
    }
    
    // Check ports
    console.log('\n🔌 PUERTOS:');
    const portStatus = await checkPorts();
    portStatus.forEach(({ port, inUse }) => {
        const statusIcon = inUse ? '🔴' : '🟢';
        const statusText = inUse ? 'EN USO' : 'LIBRE';
        console.log(`   ${statusIcon} Puerto ${port}: ${statusText}`);
    });
    
    console.log('\n📊 RESUMEN:');
    const healthyServices = Object.values(services).filter(async (port) => {
        const result = await checkService('', port);
        return result.status;
    }).length;
    
    console.log(`   • Servicios saludables: ${healthyServices}/${Object.keys(services).length}`);
    console.log(`   • Procesos Node activos: ${processes.length}`);
    console.log(`   • Puertos ocupados: ${portStatus.filter(p => p.inUse).length}`);
}

main().catch(error => {
    console.error('❌ Error en diagnóstico:', error.message);
    process.exit(1);
});
