const http = require('http');
const https = require('https');
const { spawn } = require('child_process');

console.log('🚀 QBTC-UNIFIED con IP 181.43.212.196');
console.log('=====================================');

// Configurar variables de entorno para el proxy
process.env.HTTP_PROXY = 'http://127.0.0.1:8888';
process.env.HTTPS_PROXY = 'http://127.0.0.1:8888';

// Crear proxy que fuerce la IP 181.43.212.196
const proxy = http.createServer((req, res) => {
    const url = new URL(req.url);
    
    // Proxy todas las peticiones a Binance con IP forzada
    const isTestnet = process.env.BINANCE_TESTNET === 'true';
    const targetHost = isTestnet ? 'testnet.binancefuture.com' : 'fapi.binance.com';
    
    const proxyOptions = {
        hostname: targetHost,
        path: req.url,
        method: req.method,
        headers: {
            ...req.headers,
            'X-Forwarded-For': '181.43.212.196',
            'X-Real-IP': '181.43.212.196',
            'X-Client-IP': '181.43.212.196',
            'CF-Connecting-IP': '181.43.212.196'
        }
    };

    const proxyReq = https.request(proxyOptions, (proxyRes) => {
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
    console.log('🔗 Conectando a Binance...');
    
    // Ejecutar el sistema QBTC
    const qbtcProcess = spawn('node', ['system-integrator.cjs'], {
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
        
        const qbtcProcess = spawn('node', ['system-integrator.cjs'], {
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
