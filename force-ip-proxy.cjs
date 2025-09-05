const http = require('http');
const https = require('https');
const { spawn } = require('child_process');

console.log('🚀 PROXY FORZANDO IP 181.43.212.196');
console.log('====================================');

// Crear proxy que fuerce la IP 181.43.212.196
const proxy = http.createServer((req, res) => {
    console.log(`📡 Proxy request: ${req.method} ${req.url}`);
    
    // Determinar el host objetivo
    let targetHost = 'fapi.binance.com';
    let targetPort = 443;
    let targetProtocol = 'https';
    
    // Si es testnet
    if (req.url.includes('testnet')) {
        targetHost = 'testnet.binancefuture.com';
    }
    
    const proxyOptions = {
        hostname: targetHost,
        port: targetPort,
        path: req.url,
        method: req.method,
        headers: {
            ...req.headers,
            'X-Forwarded-For': '181.43.212.196',
            'X-Real-IP': '181.43.212.196',
            'X-Client-IP': '181.43.212.196',
            'CF-Connecting-IP': '181.43.212.196',
            'X-Forwarded-Host': targetHost,
            'X-Forwarded-Proto': 'https'
        }
    };

    console.log(`🌐 Proxying to: ${targetProtocol}://${targetHost}${req.url}`);
    console.log(`🔧 Forcing IP: 181.43.212.196`);

    const proxyReq = https.request(proxyOptions, (proxyRes) => {
        console.log(`✅ Response: ${proxyRes.statusCode} from ${targetHost}`);
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
    });

    req.pipe(proxyReq);

    proxyReq.on('error', (e) => {
        console.error(`❌ Proxy error: ${e.message}`);
        res.writeHead(500);
        res.end('Proxy Error');
    });
});

proxy.listen(8888, () => {
    console.log('✅ Proxy iniciado en puerto 8888');
    console.log('🌐 Forzando IP: 181.43.212.196');
    console.log('🔗 Listo para QBTC-UNIFIED');
    
    // Configurar variables de entorno
    process.env.HTTP_PROXY = 'http://127.0.0.1:8888';
    process.env.HTTPS_PROXY = 'http://127.0.0.1:8888';
    
    console.log('🚀 Ejecutando QBTC-UNIFIED...');
    
    // Ejecutar el sistema QBTC
    const qbtcProcess = spawn('node', ['system-integrator.js'], {
        stdio: 'inherit',
        env: {
            ...process.env,
            HTTP_PROXY: 'http://127.0.0.1:8888',
            HTTPS_PROXY: 'http://127.0.0.1:8888'
        }
    });

    qbtcProcess.on('close', (code) => {
        console.log(`\n🔄 QBTC-UNIFIED terminado con código: ${code}`);
        proxy.close();
        process.exit(code);
    });

    qbtcProcess.on('error', (err) => {
        console.error(`❌ Error ejecutando QBTC: ${err.message}`);
        proxy.close();
        process.exit(1);
    });
});

proxy.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.log('⚠️ Proxy ya está activo en puerto 8888');
        console.log('🚀 Ejecutando QBTC-UNIFIED...');
        
        process.env.HTTP_PROXY = 'http://127.0.0.1:8888';
        process.env.HTTPS_PROXY = 'http://127.0.0.1:8888';
        
        const qbtcProcess = spawn('node', ['system-integrator.js'], {
            stdio: 'inherit',
            env: {
                ...process.env,
                HTTP_PROXY: 'http://127.0.0.1:8888',
                HTTPS_PROXY: 'http://127.0.0.1:8888'
            }
        });

        qbtcProcess.on('close', (code) => {
            console.log(`\n🔄 QBTC-UNIFIED terminado con código: ${code}`);
            process.exit(code);
        });
    } else {
        console.error(`❌ Error en proxy: ${e.message}`);
        process.exit(1);
    }
});

// Manejar señales de terminación
process.on('SIGINT', () => {
    console.log('\n🔄 Deteniendo QBTC-UNIFIED...');
    proxy.close();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🔄 Deteniendo QBTC-UNIFIED...');
    proxy.close();
    process.exit(0);
});
