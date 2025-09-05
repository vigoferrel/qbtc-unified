const https = require('https');

console.log('🔍 Verificando todas las IPs del sistema...\n');

// Función para obtener IP desde un servicio
function getIP(service) {
    return new Promise((resolve, reject) => {
        const req = https.request(service, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data.trim()));
        });
        req.on('error', reject);
        req.setTimeout(5000, () => {
            req.destroy();
            reject(new Error('Timeout'));
        });
        req.end();
    });
}

// Servicios para verificar IP
const services = [
    { name: 'ipify.org', url: 'https://api.ipify.org' },
    { name: 'ipinfo.io', url: 'https://ipinfo.io/ip' },
    { name: 'icanhazip.com', url: 'https://icanhazip.com' },
    { name: 'ident.me', url: 'https://ident.me' },
    { name: 'checkip.amazonaws.com', url: 'https://checkip.amazonaws.com' }
];

async function checkAllIPs() {
    const results = [];
    
    for (const service of services) {
        try {
            const ip = await getIP(service.url);
            results.push({ service: service.name, ip, status: '✅' });
        } catch (error) {
            results.push({ service: service.name, ip: 'ERROR', status: '❌' });
        }
    }
    
    console.log('📊 RESULTADOS:');
    console.log('==============');
    
    const uniqueIPs = new Set();
    results.forEach(result => {
        if (result.ip !== 'ERROR') {
            uniqueIPs.add(result.ip);
        }
        console.log(`${result.status} ${result.service}: ${result.ip}`);
    });
    
    console.log('\n🌐 IPs únicas detectadas:');
    uniqueIPs.forEach(ip => {
        console.log(`   - ${ip}`);
    });
    
    console.log('\n💡 RECOMENDACIONES:');
    console.log('==================');
    console.log('1. Agregar estas IPs a la whitelist de Binance:');
    uniqueIPs.forEach(ip => {
        console.log(`   - ${ip}`);
    });
    console.log('\n2. O configurar una VPN que proporcione la IP 181.43.212.196');
    console.log('\n3. O usar un proxy externo con la IP correcta');
}

checkAllIPs().catch(console.error);
