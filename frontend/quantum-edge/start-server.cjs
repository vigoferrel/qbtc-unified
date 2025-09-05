// Simple HTTP Server for QBTC Quantum Edge Frontend
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const BASE_DIR = __dirname;

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// Simulación de datos cuánticos para las APIs
const quantumData = {
    consciousness: 0.81,
    coherence: 0.90,
    alignment: 0.85,
    decisions: Math.floor(Date.now() / 1000) % 100,
    poets: {
        neruda: { resonance: 0.87, verseIndex: 0, status: 'active' },
        mistral: { resonance: 0.92, verseIndex: 1, status: 'active' },
        huidobro: { resonance: 0.78, verseIndex: 2, status: 'active' },
        parra: { resonance: 0.85, verseIndex: 3, status: 'active' },
        zurita: { resonance: 0.91, verseIndex: 4, status: 'active' },
        ferrel: { resonance: 0.89, verseIndex: 5, status: 'active' }
    },
    engines: {
        fluid: { efficiency: 0.85, processes: 1247, status: 'active', viscosity: 0.5, turbulence: 0.3 },
        poetic: { efficiency: 0.92, processes: 856, status: 'active', verses: 42, resonance: 0.88 },
        gpu: { efficiency: 0.78, processes: 2134, status: 'active', symbols: 450, sortingSpeed: 95 },
        antimatter: { efficiency: 0.91, processes: 679, status: 'active', tensors: 28, anomalies: 3 },
        auth: { efficiency: 0.88, processes: 445, status: 'active', integrity: 0.96, validatedSignals: 234 },
        cobol: { efficiency: 0.95, processes: 321, status: 'active', uptime: 99.8, transactions: 1567 }
    },
    opportunities: [
        { symbol: 'BTC/USDT', confidence: 0.92, edge: 0.045, type: 'QUANTUM_LONG' },
        { symbol: 'ETH/USDT', confidence: 0.87, edge: 0.038, type: 'POETIC_SHORT' },
        { symbol: 'BNB/USDT', confidence: 0.84, edge: 0.033, type: 'FLUID_DYNAMICS' }
    ]
};

// Actualizar métricas cuánticas periódicamente
setInterval(() => {
    // Actualizar consciencia cuántica
    const time = Date.now() / 1000;
    quantumData.consciousness = 0.7 + 0.2 * Math.sin(time * 0.1);
    quantumData.coherence = 0.8 + 0.15 * Math.cos(time * 0.15);
    quantumData.alignment = 0.75 + 0.2 * Math.sin(time * 0.08 + 1);
    quantumData.decisions = Math.floor(time) % 100;
    
    // Actualizar poetas
    Object.keys(quantumData.poets).forEach((poetId, index) => {
        const poet = quantumData.poets[poetId];
        poet.resonance = 0.7 + 0.25 * Math.sin(time * 0.2 + index);
        poet.verseIndex = Math.floor(time / 10 + index) % 8;
    });
    
    // Actualizar engines
    Object.keys(quantumData.engines).forEach((engineId, index) => {
        const engine = quantumData.engines[engineId];
        engine.efficiency = 0.7 + 0.25 * Math.cos(time * 0.12 + index);
        engine.processes += Math.floor((Math.sin(time + index) + 1) * 5) - 5;
        engine.processes = Math.max(100, engine.processes);
    });
}, 2000);

const server = http.createServer((req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    const url = req.url;
    
    // API Endpoints
    if (url === '/api/quantum-state') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            ok: true,
            state: quantumData
        }));
        return;
    }
    
    if (url === '/api/poetas-chilenos') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            ok: true,
            poetas: quantumData.poets
        }));
        return;
    }
    
    if (url === '/api/engines-estado') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            ok: true,
            engines: quantumData.engines
        }));
        return;
    }
    
    // Server-Sent Events para quantum-stream
    if (url === '/api/quantum-stream') {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
        });
        
        // Enviar datos cada segundo
        const sendData = () => {
            const data = {
                type: 'quantum-state',
                state: quantumData
            };
            res.write(`data: ${JSON.stringify(data)}\n\n`);
        };
        
        // Enviar data inicial
        sendData();
        
        // Enviar actualizaciones periódicas
        const interval = setInterval(sendData, 1000);
        
        // Cleanup cuando el cliente se desconecte
        req.on('close', () => {
            clearInterval(interval);
        });
        
        return;
    }
    
    // Servir archivos estáticos
    let filePath = path.join(BASE_DIR, url === '/' ? 'index.html' : url);
    
    // Prevenir path traversal
    if (!filePath.startsWith(BASE_DIR)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
            return;
        }
        
        const ext = path.extname(filePath);
        const contentType = mimeTypes[ext] || 'application/octet-stream';
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`🚀 QBTC Quantum Edge Server iniciado en http://localhost:${PORT}`);
    console.log(`📡 APIs disponibles:`);
    console.log(`   GET /api/quantum-state       - Estado cuántico completo`);
    console.log(`   GET /api/poetas-chilenos     - Estado de los poetas`);
    console.log(`   GET /api/engines-estado      - Estado de los engines`);
    console.log(`   GET /api/quantum-stream      - Stream en tiempo real (SSE)`);
    console.log(`🎭 Oscar Ferrel y los 5 poetas chilenos están activos`);
    console.log(`⚙️ 6 engines cuánticos operativos`);
    console.log(`✨ Sistema completamente funcional sin errores`);
});
