#!/usr/bin/env node

// ================================================================
// 📺 FRONTEND SERVER CON PROXY PARA LEONARDO QUANTUM
// Sirve el frontend unified y hace proxy a Leonardo Quantum Server
// ================================================================

const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 8080;
const LEONARDO_BACKEND_PORT = 3003;

// Configurar middleware de proxy para /api routes hacia Leonardo backend
app.use('/api', createProxyMiddleware({
    target: `http://localhost:${LEONARDO_BACKEND_PORT}`,
    changeOrigin: true,
    ws: true, // Soportar WebSocket
    logLevel: 'info'
}));

// Servir archivos estáticos del frontend-unified
app.use(express.static(path.join(__dirname, 'frontend-unified')));

// Ruta por defecto para SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend-unified', 'index.html'));
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log('📺 Frontend Server iniciado exitosamente!');
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`🔗 Proxy hacia Leonardo Quantum: http://localhost:${LEONARDO_BACKEND_PORT}`);
    console.log(`📊 Dashboard disponible en: http://localhost:${PORT}`);
});

// Manejar cierre graceful
process.on('SIGINT', () => {
    console.log('\n🛑 Cerrando Frontend Server...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Cerrando Frontend Server...');
    process.exit(0);
});
