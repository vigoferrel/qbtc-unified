const http = require('http');

// Verificar IP del proxy usando Binance
const proxyReq = http.request({
    hostname: '127.0.0.1',
    port: 8888,
    path: '/fapi/v1/ping',
    method: 'GET',
    headers: {
        'Host': 'fapi.binance.com'
    }
}, (res) => {
    console.log('Status del proxy:', res.statusCode);
    console.log('Headers del proxy:', res.headers);
    
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('Respuesta del proxy:', data);
    });
});

proxyReq.on('error', (error) => {
    console.error('Error del proxy:', error.message);
});

proxyReq.end();
