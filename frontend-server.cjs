const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Configuración del servidor (puertos unificados)
const PORT = parseInt(process.env.FRONTEND_PORT || '18021', 10);
const LEONARDO_API_URL = process.env.API_BASE || 'http://localhost:18020';

// Allowlist CORS
const CORS_ALLOWLIST = [
    'http://localhost:18021',
    'http://127.0.0.1:18021',
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'https://qbtc-dashboard.com'
];
function setCors(res, origin) {
    if (origin && CORS_ALLOWLIST.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
}

// MIME types para servir archivos estáticos
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// Función para hacer proxy de requests al API de Leonardo
async function proxyToLeonardo(req, res, pathName) {
    return new Promise((resolve) => {
        try {
            const api = new URL(LEONARDO_API_URL);
            const options = {
                hostname: api.hostname,
                port: api.port ? parseInt(api.port, 10) : (api.protocol === 'https:' ? 443 : 80),
                path: pathName,
                method: req.method,
                headers: req.headers
            };

            const proxyReq = http.request(options, (proxyRes) => {
                // Propagar CORS de respuesta con allowlist
                const origin = req.headers['origin'];
                setCors(res, origin);

                res.writeHead(proxyRes.statusCode, proxyRes.headers);
                proxyRes.pipe(res);
                resolve();
            });

            proxyReq.on('error', (err) => {
                console.error('Proxy error:', err?.message || err);
                res.writeHead(502, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Bad Gateway to Leonardo API' }));
                resolve();
            });

            req.pipe(proxyReq);
        } catch (e) {
            console.error('Proxy build error:', e?.message || e);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Proxy configuration error' }));
            resolve();
        }
    });
}

// Crear servidor HTTP
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname;

    // CORS headers con allowlist
    const origin = req.headers['origin'];
    setCors(res, origin);

    // Manejar OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    console.log(`${req.method} ${pathname}`);

    // Proxy para rutas API de Leonardo
    if (pathname.startsWith('/api/') ||
        pathname.startsWith('/dashboard') ||
        pathname.startsWith('/health') ||
        pathname.startsWith('/analyze') ||
        pathname.startsWith('/positions') ||
        pathname.startsWith('/history') ||
        pathname.startsWith('/config')) {
        
        await proxyToLeonardo(req, res, pathname);
        return;
    }

    // Servir archivos estáticos desde frontend-unified
    if (pathname === '/' || pathname === '/index.html') {
        pathname = '/index.html';
    }

    const filePath = path.join(__dirname, 'frontend-unified', pathname);
    const ext = path.extname(filePath);

    try {
        // Verificar si el archivo existe
        await fs.promises.access(filePath);
        
        // Leer y servir el archivo
        const data = await fs.promises.readFile(filePath);
        const contentType = mimeTypes[ext] || 'text/plain';
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
        
    } catch (error) {
        // Archivo no encontrado
        console.error(`File not found: ${filePath}`);
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 - File not found');
    }
});

// Iniciar servidor
server.listen(PORT, () => {
    console.log(`🌊 QBTC Leonardo Frontend Server iniciado en puerto ${PORT}`);
    console.log(`📱 Dashboard: http://localhost:${PORT}/`);
    console.log(`🔗 Leonardo API Proxy: ${LEONARDO_API_URL}`);
    console.log(`📁 Sirviendo archivos desde: ./frontend-unified/`);
});

// Manejo de errores
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Puerto ${PORT} ya está en uso`);
        process.exit(1);
    } else {
        console.error('❌ Error del servidor:', err);
    }
});

// Cierre elegante
process.on('SIGINT', () => {
    console.log('\n🛑 Cerrando servidor frontend...');
    server.close(() => {
        console.log('✅ Servidor frontend cerrado');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Cerrando servidor frontend...');
    server.close(() => {
        console.log('✅ Servidor frontend cerrado');
        process.exit(0);
    });
});
