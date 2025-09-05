const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.FRONTEND_PORT ? parseInt(process.env.FRONTEND_PORT, 10) : 3004;
const BACKEND_URL = process.env.API_BASE || 'http://localhost:3003';

// Middleware para servir archivos estaticos
app.use(express.static(path.join(__dirname)));

// Proxy para todas las rutas /api hacia el backend Leonardo
app.use('/api', createProxyMiddleware({
    target: BACKEND_URL,
    changeOrigin: true,
    ws: true, // Soporte para WebSockets/SSE
    logLevel: 'info',
    onProxyReq: (proxyReq, req, res) => {
        console.log(`[PROXY] ${req.method} ${req.url} -> ${BACKEND_URL}${req.url}`);
    },
    onError: (err, req, res) => {
        console.error(`[PROXY ERROR] ${err.message}`);
        res.status(503).json({ error: 'Backend service unavailable' });
    }
}));

// Fallback: servir index.html para rutas no encontradas (SPA behavior)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Frontend server running on http://localhost:${PORT}`);
    console.log(`Proxying /api/* requests to ${BACKEND_URL}`);
    console.log(`Static files served from: ${__dirname}`);
    console.log(`Environment: FRONTEND_PORT=${process.env.FRONTEND_PORT || ''} API_BASE=${process.env.API_BASE || ''}`);
});

process.on('SIGINT', () => {
    console.log('\nShutting down frontend server...');
    process.exit(0);
});
