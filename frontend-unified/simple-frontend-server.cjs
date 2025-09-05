const express = require('express');
const path = require('path');
const http = require('http');

const app = express();
const PORT = process.env.FRONTEND_PORT ? parseInt(process.env.FRONTEND_PORT, 10) : 18021;
const BACKEND_URL = process.env.API_BASE || 'http://localhost:3000';

// Middleware para logs
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname), {
    index: false  // No servir automáticamente index.html
}));

// Proxy manual para /api
app.use('/api', (req, res) => {
    const proxyUrl = `${BACKEND_URL}${req.url}`;
    console.log(`[PROXY] ${req.method} ${req.url} -> ${proxyUrl}`);
    
    const target = new URL(BACKEND_URL);
    const options = {
        hostname: target.hostname,
        port: target.port ? parseInt(target.port, 10) : (target.protocol === 'https:' ? 443 : 80),
        path: `${target.pathname?.replace(/\/$/, '')}${req.url}`,
        method: req.method,
        headers: {
            ...req.headers,
            'host': `${target.hostname}${target.port ? ':' + target.port : ''}`
        }
    };
    
    const proxyReq = http.request(options, (proxyRes) => {
        // Copiar headers de respuesta
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        
        // Pipe data
        proxyRes.pipe(res);
    });
    
    proxyReq.on('error', (err) => {
        console.error(`[PROXY ERROR] ${err.message}`);
        res.status(503).json({ error: 'Backend service unavailable' });
    });
    
    // Pipe request body si existe
    req.pipe(proxyReq);
});

// Servir index.html para todas las rutas restantes (SPA behavior)
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'index.html');
    console.log(`[STATIC] Serving index.html for: ${req.url}`);
    res.sendFile(indexPath);
});

// Catch-all route for SPA
app.use((req, res) => {
    const indexPath = path.join(__dirname, 'index.html');
    console.log(`[SPA] Serving index.html for: ${req.url}`);
    res.sendFile(indexPath);
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log('========================================');
    console.log('QBTC FRONTEND UNIFIED SERVER STARTED');
    console.log('========================================');
    console.log(`Frontend server running on http://localhost:${PORT}`);
    console.log(`Proxying /api/* requests to ${BACKEND_URL}`);
    console.log(`Static files served from: ${__dirname}`);
    console.log(`Index.html: ${path.join(__dirname, 'index.html')}`);
    console.log('========================================');
});

process.on('SIGINT', () => {
    console.log('\nShutting down QBTC frontend server...');
    process.exit(0);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err.message);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
