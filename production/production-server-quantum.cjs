const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const socketIo = require('socket.io');
const winston = require('winston');
const promClient = require('prom-client');

// Cargar configuración
const config = require('./production-config.json');

// Configurar logger
const logger = winston.createLogger({
    level: config.monitoring.log_level.toLowerCase(),
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: '../logs/production-error.log', level: 'error' }),
        new winston.transports.File({ filename: '../logs/production.log' })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

// Configurar métricas Prometheus
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// Contadores personalizados
const quantumMetrics = {
    consciousness: new promClient.Gauge({
        name: 'quantum_consciousness',
        help: 'Nivel actual de consciencia cuántica',
        registers: [register]
    }),
    coherence: new promClient.Gauge({
        name: 'quantum_coherence',
        help: 'Nivel actual de coherencia cuántica',
        registers: [register]
    }),
    tradingOperations: new promClient.Counter({
        name: 'trading_operations_total',
        help: 'Total de operaciones de trading',
        registers: [register]
    })
};

 // Crear aplicación Express
const app = express();

// Robust CORS allowlist middleware to ensure ACAO header on every response
const CORS_ALLOWLIST = (config.security && config.security.cors && config.security.cors.whitelist) || [];
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && CORS_ALLOWLIST.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});// Configurar middleware de seguridad y optimización
app.use(helmet());
app.use(compression());
app.use(express.json());

// Redacción de headers sensibles para cualquier logging descendente
app.use((req, res, next) => {
    const h = { ...req.headers };
    if (h['authorization']) h['authorization'] = 'REDACTED';
    if (h['x-mbx-apikey']) h['x-mbx-apikey'] = 'REDACTED';
    if (h['cookie']) h['cookie'] = 'REDACTED';
    req.sanitizedHeaders = h;
    next();
});

app.use(cors({
    origin: config.security.cors.whitelist,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Configurar rate limiting
app.use(rateLimit({
    windowMs: config.security.rate_limit.window_ms,
    max: config.security.rate_limit.max_requests
}));

// Endpoint raíz para compatibilidad de cliente (getSystemInfo)
app.get('/', (req, res) => {
    res.json({
        name: 'QBTC Unified Production API',
        version: config.system.version,
        mode: config.system.mode || 'PRODUCTION',
        environment: config.system.environment,
        endpoints: {
            health: '/health',
            metrics: '/metrics',
            estado_cuantico: '/api/estado-cuantico',
            socket: 'socket.io'
        },
        timestamp: new Date().toISOString()
    });
});

// Endpoint de salud
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        version: config.system.version,
        environment: config.system.environment
    });
});

// Endpoint de métricas
app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (err) {
        res.status(500).end(err);
    }
});

// Compatibilidad JSON para clientes que esperan /api/metrics (respuesta JSON)
app.get('/api/metrics', (req, res) => {
    const payload = {
        success: true,
        data: {
            consciousness: {
                current: Math.random() * (1 - 0.7) + 0.7,
                target: 0.941,
                status: 'leonardo_optimal'
            },
            coherence: {
                current: Math.random() * (1 - 0.65) + 0.65,
                target: 0.964,
                status: 'quantum_stable'
            },
            engineMetrics: {
                totalProfit: 0,
                currentDrawdown: Math.random() * 0.05
            },
            timestamp: new Date().toISOString()
        }
    };
    res.json(payload);
});

// Compatibilidad /api/health (mapea a /health)
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        version: config.system.version,
        environment: config.system.environment
    });
});

// Stream SSE básico para /api/stream (con eventos 'connected' y 'metrics')
app.get('/api/stream', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    const sendEvent = (event, data) => {
        res.write(`event: ${event}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // Evento de conexión
    sendEvent('connected', { clientId: Date.now() });

    // Emitir métricas periódicas
    const interval = setInterval(() => {
        sendEvent('metrics', {
            consciousness: Math.random() * (1 - 0.7) + 0.7,
            coherence: Math.random() * (1 - 0.65) + 0.65,
            timestamp: new Date().toISOString()
        });
    }, config.monitoring.metrics_interval || 1000);

    req.on('close', () => clearInterval(interval));
});

// API REST principal
app.get('/api/estado-cuantico', (req, res) => {
    const estado = {
        consciousness: Math.random() * (1 - 0.7) + 0.7,
        coherence: Math.random() * (1 - 0.65) + 0.65,
        timestamp: new Date().toISOString()
    };
    quantumMetrics.consciousness.set(estado.consciousness);
    quantumMetrics.coherence.set(estado.coherence);
    res.json(estado);
});

app.post('/api/control/:accion', (req, res) => {
    const { accion } = req.params;
    logger.info(`Control action received: ${accion}`);
    res.json({ status: 'success', action: accion });
});

// Manejo de errores
app.use((err, req, res, next) => {
    logger.error('Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message
    });
});

// Crear servidor HTTP para desarrollo
const server = http.createServer(app);

// En producción usaríamos HTTPS:
/*
const httpsOptions = {
    key: fs.readFileSync(config.security.ssl.key_path),
    cert: fs.readFileSync(config.security.ssl.cert_path)
};
const server = https.createServer(httpsOptions, app);
*/

// Configurar Socket.IO
const io = socketIo(server, {
    cors: {
        origin: config.security.cors.whitelist,
        methods: ["GET", "POST"]
    }
});

// Manejador de WebSocket
io.on('connection', (socket) => {
    logger.info('New client connected');
    
    let metricsInterval = setInterval(() => {
        const metrics = {
            consciousness: Math.random() * (1 - 0.7) + 0.7,
            coherence: Math.random() * (1 - 0.65) + 0.65,
            timestamp: new Date().toISOString()
        };
        socket.emit('metrics', metrics);
    }, config.monitoring.metrics_interval);

    socket.on('disconnect', () => {
        logger.info('Client disconnected');
        clearInterval(metricsInterval);
    });
});

// Iniciar servidor
const PORT = process.env.UNIFIED_PORT || config.servers.unified.port;
server.listen(PORT, () => {
    logger.info(`Production Quantum Server running on port ${PORT}`);
    logger.info(`Environment: ${config.system.environment}`);
    logger.info(`Version: ${config.system.version}`);
});

// Manejo de señales para cierre graceful
process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Starting graceful shutdown...');
    server.close(() => {
        logger.info('Server closed. Process terminating...');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    logger.info('SIGINT received. Starting graceful shutdown...');
    server.close(() => {
        logger.info('Server closed. Process terminating...');
        process.exit(0);
    });
});

// ===== Compatibility endpoints for LeonardoQuantumAPI (predictions, opportunities, trading) =====
/**
 * Load a broad symbols universe for mock endpoints.
 * Priority:
 * 1) ENV SYMBOLS_UNIVERSE (path to JSON array of symbols)
 * 2) config.symbols_universe.file (relative to this file)
 * 3) Built-in universe (80+ common futures symbols)
 */
let SYMBOLS_UNIVERSE = null;
function loadSymbolsUniverse() {
    if (SYMBOLS_UNIVERSE && Array.isArray(SYMBOLS_UNIVERSE) && SYMBOLS_UNIVERSE.length > 0) return SYMBOLS_UNIVERSE;

    const envPath = process.env.SYMBOLS_UNIVERSE;
    const cfgPath = (config.symbols_universe && config.symbols_universe.file) ? config.symbols_universe.file : null;
    const tryPaths = [envPath, cfgPath].filter(Boolean);

    for (const p of tryPaths) {
        try {
            const abs = path.isAbsolute(p) ? p : path.join(__dirname, p);
            const raw = fs.readFileSync(abs, 'utf8');
            const arr = JSON.parse(raw);
            if (Array.isArray(arr) && arr.length > 0) {
                SYMBOLS_UNIVERSE = arr.map(s => String(s).toUpperCase());
                logger.info(`Loaded symbols universe from ${abs} (${SYMBOLS_UNIVERSE.length} symbols)`);
                return SYMBOLS_UNIVERSE;
            }
        } catch (e) {
            logger.warn(`Failed to load symbols universe from ${p}: ${e.message}`);
        }
    }

    // Built-in expanded universe (majors + large-cap + popular alts)
    SYMBOLS_UNIVERSE = [
        'BTCUSDT','ETHUSDT','BNBUSDT','ADAUSDT','SOLUSDT','XRPUSDT','DOGEUSDT','DOTUSDT','LINKUSDT','LTCUSDT',
        'TRXUSDT','MATICUSDT','AVAXUSDT','ATOMUSDT','FILUSDT','NEARUSDT','APTUSDT','ARBUSDT','OPUSDT','INJUSDT',
        'AAVEUSDT','SNXUSDT','UNIUSDT','SUIUSDT','PEPEUSDT','SHIBUSDT','BCHUSDT','ETCUSDT','EOSUSDT','XLMUSDT',
        'XMRUSDT','ALGOUSDT','FTMUSDT','GALAUSDT','SANDUSDT','MANAUSDT','AXSUSDT','ADAUSDT','HBARUSDT','CRVUSDT',
        'KAVAUSDT','KSMUSDT','GMTUSDT','RUNEUSDT','EGLDUSDT','WAVESUSDT','ZILUSDT','DYDXUSDT','RLCUSDT','ARUSDT',
        'IMXUSDT','ROSEUSDT','APTUSDT','CHZUSDT','FLOWUSDT','1INCHUSDT','COMPUSDT','LDOUSDT','GMXUSDT','NEOUSDT',
        'ZRXUSDT','MASKUSDT','BLURUSDT','BATUSDT','TOMOUSDT','IOTAUSDT','QTUMUSDT','SUSHIUSDT','FXSUSDT','XEMUSDT',
        'COTIUSDT','ICPUSDT','ENSUSDT','ANKRUSDT','SKLUSDT','ARPAUSDT','BELUSDT','CTSIUSDT','ICXUSDT','RSRUSDT'
    ];
    logger.info(`Loaded built-in symbols universe (${SYMBOLS_UNIVERSE.length} symbols)`);
    return SYMBOLS_UNIVERSE;
}

function generateMockPredictions(count = 20) {
    const symbols = loadSymbolsUniverse();
    const timeframes = ['1m', '5m', '15m', '1h', '4h'];
    const directions = ['LONG', 'SHORT'];
    const n = Math.min(count, symbols.length);

    return Array(n).fill(null).map(() => {
        const sym = symbols[Math.floor(Math.random() * symbols.length)];
        return {
            symbol: sym,
            timeframe: timeframes[Math.floor(Math.random() * timeframes.length)],
            confidence: +(0.5 + Math.random() * 0.5).toFixed(3),
            direction: directions[Math.floor(Math.random() * directions.length)],
            compositeScore: +(0.6 + Math.random() * 0.4).toFixed(3),
            optimalLeverage: Math.floor(Math.random() * 10) + 1,
            publishedAt: new Date().toISOString()
        };
    });
}

app.get('/api/predictions', (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    const data = generateMockPredictions(limit);
    res.json({ success: true, data, count: data.length });
});

app.get('/api/opportunities', (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const mult = Math.max(3, Math.ceil(limit * 2.5)); // widen pool
    const base = generateMockPredictions(mult);
    // widen threshold slightly to avoid over-filtering in small samples
    const threshold = (config.quantum && config.quantum.opportunities_min_confidence) || 0.65;
    const data = base.filter(p => p.confidence >= threshold).slice(0, limit);
    res.json({ success: true, data, count: data.length });
});

app.get('/api/trading/balance', (req, res) => {
    res.json({
        success: true,
        data: {
            currentBalance: 1000 + Math.floor(Math.random() * 200) - 100,
            totalProfit: +(Math.random() * 250 - 100).toFixed(2),
            drawdown: +(Math.random() * 0.05).toFixed(3),
            winRate: +(0.5 + Math.random() * 0.4).toFixed(3)
        }
    });
});

app.get('/api/trading/positions', (req, res) => {
    res.json({ success: true, data: [] });
});

// Expose current symbol universe for diagnostics
app.get('/api/symbols', (req, res) => {
    const symbols = loadSymbolsUniverse();
    const max = (config.symbols_universe && config.symbols_universe.max) || 500;
    res.json({ success: true, count: Math.min(symbols.length, max), data: symbols.slice(0, max) });
});

// Risk exposure compatibility endpoint for frontend UI
app.get('/api/risk/exposure', (req, res) => {
    const equity = 1000 + Math.floor(Math.random() * 200) - 100;
    const bySymbol = {
        BTCUSDT: +(equity * (Math.random() * 0.08)).toFixed(2),
        ETHUSDT: +(equity * (Math.random() * 0.06)).toFixed(2),
        BNBUSDT: +(equity * (Math.random() * 0.04)).toFixed(2)
    };
    const byCategory = {
        majors: +(Object.values(bySymbol).reduce((a, b) => a + b, 0)).toFixed(2),
        memecoins: +(equity * (Math.random() * 0.02)).toFixed(2),
        darkside: +(equity * (Math.random() * 0.01)).toFixed(2)
    };
    const limits = {
        MAX_SYMBOL_EXPOSURE_PCT: 0.15,
        MAX_CATEGORY_EXPOSURE_PCT: 0.35
    };
    res.json({ success: true, data: { bySymbol, byCategory, limits } });
});
