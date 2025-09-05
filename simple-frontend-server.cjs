#!/usr/bin/env node

// ========================================================================
// 🖥️ SIMPLE FRONTEND SERVER for LEONARDO CONSCIOUSNESS
// Servidor mínimo para servir el dashboard con proxy a Leonardo
// ========================================================================

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8080;
const LEONARDO_API = 'http://localhost:3003';

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// Server-Sent Events connections
const sseClients = new Set();

// Función para hacer proxy request a Leonardo API
async function proxyToLeonardo(apiPath) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3003,
            path: apiPath,
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Leonardo-Dashboard/1.0'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve(jsonData);
                } catch (e) {
                    resolve({ error: 'Invalid JSON response', raw: data });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.setTimeout(5000, () => {
            req.destroy();
            reject(new Error('Leonardo API timeout'));
        });

        req.end();
    });
}

// Broadcast data to all SSE clients
function broadcastToSSE(eventType, data) {
    const message = `event: ${eventType}
data: ${JSON.stringify(data)}

`;
    
    for (const client of sseClients) {
        try {
            client.write(message);
        } catch (error) {
            sseClients.delete(client);
        }
    }
}

// Servidor HTTP principal
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // CORS headers para todas las respuestas
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    try {
        // === Server-Sent Events endpoint ===
        if (pathname === '/api/leonardo-stream') {
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*'
            });

            // Keep connection alive
            const heartbeat = setInterval(() => {
                res.write(': heartbeat\n\n');
            }, 30000);

            // Add to SSE clients
            sseClients.add(res);

            // Clean up on disconnect
            req.on('close', () => {
                clearInterval(heartbeat);
                sseClients.delete(res);
            });

            req.on('aborted', () => {
                clearInterval(heartbeat);
                sseClients.delete(res);
            });

            // Send initial data
            try {
                const healthData = await proxyToLeonardo('/health');
                broadcastToSSE('health', healthData);
            } catch (error) {
                console.log('Error getting initial health data:', error.message);
            }

            return;
        }

        // === API Proxy endpoints ===
        if (pathname.startsWith('/api/leonardo-')) {
            const leonardoPath = pathname.replace('/api/leonardo-', '/');
            
            try {
                const data = await proxyToLeonardo(leonardoPath);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(data));
                
                // Broadcast to SSE clients if health data
                if (leonardoPath === '/health') {
                    broadcastToSSE('health', data);
                }
            } catch (error) {
                console.log('Proxy error:', error.message);
                res.writeHead(503, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    error: 'Leonardo API unavailable',
                    message: error.message
                }));
            }
            return;
        }

        // === Static file serving ===
        let filePath;
        if (pathname === '/') {
            filePath = path.join(__dirname, 'frontend-unified', 'index.html');
        } else {
            filePath = path.join(__dirname, 'frontend-unified', pathname);
        }

        // Security check
        const normalizedPath = path.normalize(filePath);
        const frontendDir = path.join(__dirname, 'frontend-unified');
        if (!normalizedPath.startsWith(frontendDir)) {
            res.writeHead(403, { 'Content-Type': 'text/plain' });
            res.end('403 Forbidden');
            return;
        }

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
        }

        // Get file stats
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            res.writeHead(403, { 'Content-Type': 'text/plain' });
            res.end('403 Forbidden - Directory listing not allowed');
            return;
        }

        // Determine content type
        const ext = path.extname(filePath).toLowerCase();
        const contentType = mimeTypes[ext] || 'application/octet-stream';

        // Serve file
        res.writeHead(200, { 'Content-Type': contentType });
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

    } catch (error) {
        console.error('Server error:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
    }
});

// Periodic data broadcast to SSE clients
setInterval(async () => {
    if (sseClients.size > 0) {
        try {
            const healthData = await proxyToLeonardo('/health');
            broadcastToSSE('health', healthData);
        } catch (error) {
            // Silently ignore errors during periodic updates
        }
    }
}, 2000); // Every 2 seconds

server.listen(PORT, () => {
    console.log('');
    console.log('🌟 LEONARDO CONSCIOUSNESS DASHBOARD');
    console.log('====================================');
    console.log(`🖥️  Frontend Server: http://localhost:${PORT}`);
    console.log(`🧠 Leonardo API: ${LEONARDO_API}`);
    console.log(`📊 Real-time stream: http://localhost:${PORT}/api/leonardo-stream`);
    console.log('');
    console.log('✅ Dashboard listo - Sistema Leonardo activo');
    console.log('💰 Trading automático disponible via interfaz web');
    console.log('');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Cerrando frontend server...');
    server.close(() => {
        console.log('✅ Frontend server cerrado correctamente');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n🛑 SIGTERM recibido, cerrando servidor...');
    server.close(() => {
        process.exit(0);
    });
});
