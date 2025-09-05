require('dotenv').config();
const http = require('http');
const crypto = require('crypto');

// Cargar credenciales
const apiKey = process.env.BINANCE_API_KEY;
const secretKey = process.env.BINANCE_SECRET_KEY;

if (!apiKey || !secretKey) {
    console.error('❌ Credenciales no configuradas');
    process.exit(1);
}

// Generar firma para la prueba
const timestamp = Date.now();
const queryString = `timestamp=${timestamp}`;
const signature = crypto
    .createHmac('sha256', secretKey)
    .update(queryString)
    .digest('hex');

const path = `/fapi/v2/account?${queryString}&signature=${signature}`;

console.log('🔍 Probando credenciales a través del proxy...');
console.log('Path:', path);

// Hacer request a través del proxy
const proxyReq = http.request({
    hostname: '127.0.0.1',
    port: 8888,
    path: path,
    method: 'GET',
    headers: {
        'Host': 'fapi.binance.com',
        'X-MBX-APIKEY': apiKey,
        'User-Agent': 'QBTC-Proxy-Test/1.0'
    }
}, (res) => {
    console.log('Status:', res.statusCode);
    console.log('Headers:', res.headers);
    
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('Respuesta:', data);
        
        if (res.statusCode === 401) {
            const errorData = JSON.parse(data);
            console.log('❌ IP vista por Binance:', errorData.msg);
        } else if (res.statusCode === 200) {
            console.log('✅ Conexión exitosa a través del proxy');
        }
    });
});

proxyReq.on('error', (error) => {
    console.error('Error del proxy:', error.message);
});

proxyReq.end();
