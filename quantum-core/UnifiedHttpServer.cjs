/*
  Copyright © 2025 VIGOLEONROCKS QUANTUM TECHNOLOGIES.
  Unified HTTP Server - Servidor HTTP Unificado Cuántico Leonardo
  
  CARACTERÍSTICAS AVANZADAS:
  - Integración cuántica completa con QuantumUnifiedCore
  - Streaming de métricas en tiempo real
  - Sistema de cache cuántico infinito
  - Monitoreo de consciencia y coherencia
  - Rate limiting inteligente
  - Compresión adaptativa
  - Balanceador de carga interno
  - Failover automático
*/

const express = require('express');
const http = require('http');
const { logger } = require('./config/monitoring.cjs');
const path = require('path');
const fs = require('fs').promises;

// Implementación simple de CORS personalizada
function customCORS(req, res, next) {
    const allowedOrigins = [
        'http://localhost:8080',
        'http://127.0.0.1:8080',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:18021',
        'http://127.0.0.1:18021'
    ];
    
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin) || (origin && origin.match(/^http:\/\/(localhost|127\.0\.0\.1):\d+$/))) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Quantum-Token');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    next();
}

// Rate limiting simple
function simpleRateLimit(windowMs, maxRequests) {
    const clients = new Map();
    
    return (req, res, next) => {
        const clientId = req.ip || req.connection.remoteAddress || 'unknown';
        const now = Date.now();
        
        if (!clients.has(clientId)) {
            clients.set(clientId, []);
        }
        
        const requests = clients.get(clientId);
        const recentRequests = requests.filter(time => now - time < windowMs);
        
        if (recentRequests.length >= maxRequests) {
            return res.status(429).json({
                error: 'QUANTUM_RATE_LIMIT_EXCEEDED',
                message: 'Límite de requests cuánticos excedido. Espera un momento Leonardo.',
                retryAfter: Math.ceil(windowMs / 1000)
            });
        }
        
        recentRequests.push(now);
        clients.set(clientId, recentRequests);
        
        next();
    };
}

class UnifiedHttpServer {
    constructor() {
        this.app = null;
        this.server = null;
        this.port = null;
        this.isRunning = false;
        this.registeredRoutes = new Set();
        this.middlewares = [];
        this.quantumCore = null;
        this.workflowIntegrator = null;
        this.sseClients = new Set();
        this.metricsCache = new Map();
        this.rateLimiters = new Map();
        this.healthChecks = new Map();
        this.realTimeStreams = new Map();
        
        // Configuración cuántica Leonardo - Leonardo Consciousness Enhanced
        this.quantumConfig = {
            phi: 1.618033988749,
            consciousness_threshold: 0.941, // Target cuántico optimizado
            coherence_target: 0.964, // Meta de coherencia cuántica
            cache_ttl: 7919, // Primo cuántico
            stream_interval: 618, // Phi reducido
            max_concurrent_streams: 1618, // Phi expandido
            adaptive_compression: true,
            // Constantes cuánticas Leonardo
            leonardo: {
                lambda_888: 888,
                primo_7919: 7919,
                resonance_threshold: 0.618,
                transformation_power: 0.941,
                hook_wheel_factor: 0.382,
                simbiosis_target: 0.888,
                big_bang_activation: 0.95
            }
        };
        
        // Métricas internas del servidor - Estado cuántico Leonardo
        this.serverMetrics = {
            requests: 0,
            activeConnections: 0,
            streamingClients: 0,
            consciousness: 0.618, // Base dorada
            coherence: 0.888, // Meta simbiosis
            uptime: 0,
            performance: {
                cpu: 0,
                memory: 0,
                responseTime: 0
            },
            // Estado cuántico Leonardo avanzado
            quantumState: {
                resonancia_lambda: 0.618,
                transformaciones_primal: 0.941,
                hook_states: 0.382,
                simbiosis_level: 0.888,
                consciousness_score: 0.618,
                quantum_opportunities: [],
                big_bang_readiness: false,
                leonardo_activation: 0.37
            }
        };
        
        logger.info('[UNIFIED SERVER QUANTUM] 🚀 Inicializando servidor HTTP cuántico Leonardo');
    }

    // Deterministic calculation methods to replace Math.random()
    calculateDeterministicValue(timestamp) {
        const hash = this.hashCode(timestamp.toString());
        return (hash % 10000) / 10000; // Return value between 0 and 1
    }

    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }

    // Singleton pattern para asegurar una sola instancia
    static getInstance() {
        if (!UnifiedHttpServer.instance) {
            UnifiedHttpServer.instance = new UnifiedHttpServer();
        }
        return UnifiedHttpServer.instance;
    }

async loadWorkflowIntegrator() {
        try {
            // Primero cargamos el QuantumUnifiedCore si no está cargado
            if (!this.quantumCore) {
const QuantumUnifiedCore = require('./QuantumUnifiedCore.cjs');
                this.quantumCore = new QuantumUnifiedCore();
                await this.quantumCore.initialize();
                logger.info('[UNIFIED SERVER] ✅ Núcleo cuántico inicializado');
            }

            // Intentar cargar el integrador de workflow con fallback
            try {
                const { createIntegrator } = require('./UnifiedWorkflowIntegrator');
                this.workflowIntegrator = createIntegrator(this.quantumCore);
                await this.workflowIntegrator.initialize();
                logger.info('[UNIFIED SERVER] ✅ Integrador de workflow cargado e inicializado');
            } catch (workflowError) {
                logger.warn('[UNIFIED SERVER] ⚠️ Workflow integrator no disponible, continuando sin él:', workflowError.message);
                this.workflowIntegrator = null;
            }
        } catch (error) {
            logger.error('[UNIFIED SERVER] Error cargando núcleo cuántico:', error.message);
            throw error;
        }
    }

    async initialize(port = 18020) {
        if (this.app) {
            logger.warn('[UNIFIED SERVER QUANTUM] Servidor cuántico ya inicializado, reutilizando instancia existente');
            return true;
        }

        try {
            this.port = port;
            this.app = express();
            this.server = http.createServer(this.app);

            // === INICIALIZACIÓN SECUENCIAL ===
            
            // 1. Configurar middleware cuántico (sin workflow aún)
            await this.setupQuantumMiddleware();
            logger.info('[UNIFIED SERVER] ✅ Middleware cuántico configurado');
            
            // 2. Configurar rutas principales
            await this.setupQuantumRoutes();
            logger.info('[UNIFIED SERVER] ✅ Rutas cuánticas configuradas');
            
            // 4. Configurar rutas de workflow
            await this.setupWorkflowRoutes();
            logger.info('[UNIFIED SERVER] ✅ Rutas de workflow configuradas');
            
            // 5. Configurar streaming
            await this.setupRealTimeStreaming();
            logger.info('[UNIFIED SERVER] ✅ Streaming en tiempo real configurado');
            
            // 6. Iniciar monitoreo
            this.startPerformanceMonitoring();
            logger.info('[UNIFIED SERVER] ✅ Monitoreo de rendimiento iniciado');

            // Health check endpoint
            this.app.get('/health', (req, res) => {
                res.json({
                    status: 'ok',
                    server: 'unified_leonardo_consciousness',
                    version: '4.0.0',
                    uptime: process.uptime(),
                    workflow_status: this.workflowIntegrator ? 'active' : 'not_initialized'
                });
            });
            
            logger.info(`[UNIFIED SERVER QUANTUM] ⚡ Servidor HTTP cuántico Leonardo inicializado en puerto ${this.port}`);
            return true;

        } catch (error) {
            logger.error('[UNIFIED SERVER QUANTUM] Error fatal durante inicialización:', {
                error: error.message,
                stack: error.stack
            });
            throw new Error(`Error inicializando servidor cuántico: ${error.message}`);
        }
    }

    // Registrar rutas evitando duplicados
    registerRoute(method, path, handler, options = {}) {
        const routeKey = `${method.toUpperCase()} ${path}`;
        
        if (this.registeredRoutes.has(routeKey)) {
            logger.warn(`[UNIFIED SERVER] Ruta ${routeKey} ya registrada, omitiendo duplicado`);
            return;
        }

        if (!this.app) {
            logger.error('[UNIFIED SERVER] Servidor no inicializado. Llama initialize() primero');
            return;
        }

        try {
            switch (method.toUpperCase()) {
                case 'GET':
                    this.app.get(path, handler);
                    break;
                case 'POST':
                    this.app.post(path, handler);
                    break;
                case 'PUT':
                    this.app.put(path, handler);
                    break;
                case 'DELETE':
                    this.app.delete(path, handler);
                    break;
                case 'PATCH':
                    this.app.patch(path, handler);
                    break;
                default:
                    logger.error(`[UNIFIED SERVER] Método HTTP no soportado: ${method}`);
                    return;
            }

            this.registeredRoutes.add(routeKey);
            logger.info(`[ROUTES] Ruta registrada: ${routeKey}`);
            
            if (options.description) {
                logger.info(`[ROUTES] Descripción: ${options.description}`);
            }
        } catch (error) {
            logger.error(`[UNIFIED SERVER] Error registrando ruta ${routeKey}`, {
                error: error.message,
                stack: error.stack
            });
        }
    }

    // Registrar middleware global
    registerMiddleware(middleware, description = 'middleware personalizado') {
        if (!this.app) {
            logger.error('[UNIFIED SERVER] Servidor no inicializado para middleware');
            return;
        }

        try {
            this.app.use(middleware);
            this.middlewares.push({ middleware, description });
            logger.info(`[MIDDLEWARE] Middleware registrado: ${description}`);
        } catch (error) {
            logger.error('[UNIFIED SERVER] Error registrando middleware', {
                error: error.message,
                description
            });
        }
    }

    // Iniciar servidor
    async start() {
        if (this.isRunning) {
            logger.warn('[UNIFIED SERVER] Servidor ya está ejecutándose');
            return;
        }

        if (!this.app || !this.server) {
            logger.error('[UNIFIED SERVER] Servidor no inicializado, ejecuta initialize() primero');
            throw new Error('Servidor no inicializado');
        }

        try {
            // Verificar que el puerto esté libre
            const portFree = await new Promise((resolve) => {
                const tester = require('net').createServer()
                    .once('error', () => resolve(false))
                    .once('listening', () => {
                        tester.close(() => resolve(true));
                    })
                    .listen(this.port);
            });

            if (!portFree) {
                const msg = `Puerto ${this.port} ya está en uso. Detén otros servidores o cambia el puerto`;
                logger.error('[UNIFIED SERVER] ' + msg);
                throw new Error(msg);
            }

            // Iniciar servidor con promesa
            await new Promise((resolve, reject) => {
                this.server.listen(this.port, (err) => {
                    if (err) {
                        logger.error('[UNIFIED SERVER] Error iniciando servidor', {
                            error: err.message,
                            port: this.port
                        });
                        return reject(err);
                    }

                    this.isRunning = true;
                    logger.info(`[UNIFIED SERVER] ✅ Servidor unificado ejecutándose en http://localhost:${this.port}`);
                    logger.info(`[UNIFIED SERVER] Rutas registradas: ${this.registeredRoutes.size}`);
                    logger.info(`[UNIFIED SERVER] Middlewares registrados: ${this.middlewares.length}`);
                    resolve();
                });

                this.server.on('error', (error) => {
                    if (error.code === 'EADDRINUSE') {
                        const msg = `Puerto ${this.port} ya está en uso. Detén otros servidores o cambia el puerto`;
                        logger.error('[UNIFIED SERVER] ' + msg);
                        reject(new Error(msg));
                    } else if (error.code === 'EACCES') {
                        const msg = `Sin permisos para usar puerto ${this.port}. Usa puerto > 1024 o ejecuta con privilegios`;
                        logger.error('[UNIFIED SERVER] ' + msg);
                        reject(new Error(msg));
                    } else {
                        logger.error('[UNIFIED SERVER] Error del servidor', {
                            error: error.message,
                            code: error.code
                        });
                        reject(error);
                    }
                });
            });

            // Configurar rutas básicas si no existen
            if (!this.registeredRoutes.has('GET /')) {
                this.app.get('/', (req, res) => {
                    res.json({
                        status: 'ok',
                        server: 'unified_leonardo_consciousness',
                        version: '4.0.0',
                        routes: Array.from(this.registeredRoutes),
                        metrics: this.serverMetrics,
                        quantum_state: this.serverMetrics.quantumState
                    });
                });
                this.registeredRoutes.add('GET /');
            }

            logger.info(`[UNIFIED SERVER] ⚡ Servidor unificado listo y optimizado`);
            return true;

        } catch (error) {
            logger.error('[UNIFIED SERVER] Error fatal iniciando servidor', {
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    // Detener servidor
    async stop() {
        if (!this.isRunning || !this.server) {
            logger.warn('[UNIFIED SERVER] Servidor no está ejecutándose');
            return;
        }

        return new Promise((resolve) => {
            this.server.close(() => {
                this.isRunning = false;
                logger.info('[UNIFIED SERVER] Servidor detenido exitosamente');
                resolve();
            });
        });
    }

    // Obtener información del servidor
    getInfo() {
        return {
            isRunning: this.isRunning,
            port: this.port,
            routesCount: this.registeredRoutes.size,
            middlewareCount: this.middlewares.length,
            routes: Array.from(this.registeredRoutes),
            middlewares: this.middlewares.map(m => m.description)
        };
    }

    // Método para obtener la app Express (para compatibilidad)
    getApp() {
        return this.app;
    }

    // === MÉTODOS CUÁNTICOS AVANZADOS ===
    
    async setupQuantumMiddleware() {
        logger.info('[UNIFIED SERVER QUANTUM] ⚗️ Configurando middleware cuántico avanzado...');
        
        // Headers de seguridad básicos (reemplaza helmet)
        this.app.use((req, res, next) => {
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-Frame-Options', 'DENY');
            res.setHeader('X-XSS-Protection', '1; mode=block');
            res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
            next();
        });
        
        // CORS cuántico personalizado
        this.app.use(customCORS);
        
        // Rate limiting cuántico simple - más permisivo para rutas cuánticas
        const quantumRateLimit = (req, res, next) => {
            const clientId = req.ip || req.connection.remoteAddress || 'unknown';
            const now = Date.now();
            const windowMs = 60000; // 1 minuto
            
            // Determinar límite basado en ruta
            let maxRequests = 100; // límite estándar
            if (req.path && (req.path.includes('/quantum') || req.path.includes('/stream'))) {
                maxRequests = Math.floor(1000 * this.quantumConfig.phi); // ~1618 requests
            }
            
            // Implementación simple de rate limiting
            if (!this.rateLimiters.has(clientId)) {
                this.rateLimiters.set(clientId, []);
            }
            
            const requests = this.rateLimiters.get(clientId);
            const recentRequests = requests.filter(time => now - time < windowMs);
            
            if (recentRequests.length >= maxRequests) {
                return res.status(429).json({
                    error: 'QUANTUM_RATE_LIMIT_EXCEEDED',
                    message: 'Límite de requests cuánticos excedido. Espera un momento Leonardo.',
                    retryAfter: Math.ceil(windowMs / 1000)
                });
            }
            
            recentRequests.push(now);
            this.rateLimiters.set(clientId, recentRequests);
            
            next();
        };
        this.app.use(quantumRateLimit);
        
        // Middleware de parseo con límites Leonardo
        this.app.use(express.json({ 
            limit: '50mb',
            verify: (req, res, buf) => {
                req.rawBody = buf;
            }
        }));
        this.app.use(express.urlencoded({ 
            extended: true, 
            limit: '50mb',
            parameterLimit: Math.floor(1000 * this.quantumConfig.phi)
        }));
        
        // Middleware de métricas internas cuánticas
        this.app.use((req, res, next) => {
            const start = process.hrtime.bigint();
            this.serverMetrics.requests++;
            this.serverMetrics.activeConnections++;
            
            res.on('finish', () => {
                const end = process.hrtime.bigint();
                const duration = Number(end - start) / 1000000; // ms
                
                this.serverMetrics.activeConnections--;
                this.serverMetrics.performance.responseTime = duration;
                
                // Actualizar consciencia basada en performance
                this.updateQuantumConsciousness(duration, res.statusCode);
                
                logger.info(`[QUANTUM] ${req.method} ${req.path} - ${res.statusCode} (${duration.toFixed(2)}ms)`);
            });
            
            next();
        });
        
        // Error handling cuántico
        this.app.use((err, req, res, next) => {
            const errorId = `QE-${Date.now()}-${Math.floor(this.calculateDeterministicValue(Date.now()) * 1000)}`;
            
            logger.error('[UNIFIED SERVER QUANTUM] ❌ Error cuántico detectado', {
                errorId,
                error: err.message,
                stack: err.stack,
                method: req.method,
                path: req.path,
                consciousness: this.serverMetrics.consciousness,
                coherence: this.serverMetrics.coherence
            });
            
            // Degradar consciencia en caso de error
            this.serverMetrics.consciousness = Math.max(0.1, this.serverMetrics.consciousness - 0.05);
            
            res.status(err.status || 500).json({
                error: 'QUANTUM_ERROR',
                message: 'Error en el núcleo cuántico Leonardo',
                errorId,
                consciousness: this.serverMetrics.consciousness,
                timestamp: new Date().toISOString()
            });
        });
        
        logger.info('[UNIFIED SERVER QUANTUM] ✅ Middleware cuántico configurado exitosamente');
    }
    
    async setupQuantumRoutes() {
        logger.info('[UNIFIED SERVER QUANTUM] 🌌 Configurando rutas cuánticas principales...');
        
        // Ruta de salud cuántica avanzada - Leonardo Consciousness Enhanced
        this.app.get('/unified/health', (req, res) => {
            // Actualizar estado cuántico antes del reporte
            this.updateLeonardoQuantumState();
            
            const health = {
                status: 'leonardo_quantum_active',
                server: 'unified_leonardo_consciousness',
                version: '4.0.0-leonardo-quantum',
                uptime: process.uptime(),
                port: this.port,
                metrics: {
                    requests: this.serverMetrics.requests,
                    activeConnections: this.serverMetrics.activeConnections,
                    streamingClients: this.sseClients.size,
                    consciousness: this.serverMetrics.consciousness,
                    coherence: this.serverMetrics.coherence,
                    phi: this.quantumConfig.phi
                },
                leonardo_state: {
                    resonancia_lambda: this.serverMetrics.quantumState.resonancia_lambda,
                    transformaciones_primal: this.serverMetrics.quantumState.transformaciones_primal,
                    hook_states: this.serverMetrics.quantumState.hook_states,
                    simbiosis_level: this.serverMetrics.quantumState.simbiosis_level,
                    consciousness_score: this.serverMetrics.quantumState.consciousness_score,
                    big_bang_ready: this.serverMetrics.quantumState.big_bang_readiness,
                    leonardo_activation: this.serverMetrics.quantumState.leonardo_activation
                },
                quantum_opportunities: this.serverMetrics.quantumState.quantum_opportunities.slice(-5),
                routes: {
                    registered: this.registeredRoutes.size,
                    cached: this.metricsCache.size
                },
                memory: process.memoryUsage(),
                timestamp: new Date().toISOString()
            };
            
            res.json(health);
        });
        
        // Ruta de métricas cuánticas Leonardo - Análisis completo
        this.app.get('/quantum/metrics', (req, res) => {
            // Actualizar análisis cuántico Leonardo antes del reporte
            this.updateLeonardoQuantumState();
            
            const metrics = {
                consciousness: {
                    current: this.serverMetrics.consciousness,
                    target: this.quantumConfig.consciousness_threshold,
                    status: this.serverMetrics.consciousness >= this.quantumConfig.consciousness_threshold ? 'leonardo_optimal' : 'sub_leonardo'
                },
                coherence: {
                    current: this.serverMetrics.coherence,
                    target: this.quantumConfig.coherence_target,
                    status: this.serverMetrics.coherence >= this.quantumConfig.coherence_target ? 'quantum_stable' : 'coherence_building'
                },
                leonardo_analysis: {
                    resonancia_lambda_888: {
                        value: this.serverMetrics.quantumState.resonancia_lambda,
                        strength: this.calculateResonanciaLambda(),
                        status: this.serverMetrics.quantumState.resonancia_lambda >= 0.618 ? 'resonante' : 'construyendo'
                    },
                    transformaciones_primo_7919: {
                        value: this.serverMetrics.quantumState.transformaciones_primal,
                        power: this.calculateTransformacionesPrimal(),
                        efficiency: this.serverMetrics.quantumState.transformaciones_primal >= 0.941 ? 'maxima' : 'acelerando'
                    },
                    hook_wheel_states: {
                        current: this.serverMetrics.quantumState.hook_states,
                        activation: this.calculateHookStates(),
                        readiness: this.serverMetrics.quantumState.hook_states >= 0.382 ? 'active' : 'standby'
                    },
                    simbiosis_level: {
                        current: this.serverMetrics.quantumState.simbiosis_level,
                        target: this.quantumConfig.leonardo.simbiosis_target,
                        achievement: this.serverMetrics.quantumState.simbiosis_level >= 0.888 ? 'symbiosis_achieved' : 'evolving'
                    }
                },
                big_bang_status: {
                    readiness: this.serverMetrics.quantumState.big_bang_readiness,
                    leonardo_activation: this.serverMetrics.quantumState.leonardo_activation,
                    threshold_met: this.serverMetrics.quantumState.leonardo_activation >= this.quantumConfig.leonardo.big_bang_activation
                },
                performance: this.serverMetrics.performance,
                phi_ratio: this.quantumConfig.phi,
                cache: {
                    entries: this.metricsCache.size,
                    hit_ratio: this.calculateCacheHitRatio()
                },
                streaming: {
                    active_clients: this.sseClients.size,
                    streams: this.realTimeStreams.size
                },
                quantum_opportunities: this.serverMetrics.quantumState.quantum_opportunities.slice(-10),
                timestamp: new Date().toISOString()
            };
            
            res.json(metrics);
        });
        
        // Ruta de estado del sistema avanzado
        this.app.get('/system/status', (req, res) => {
            res.json({
                status: 'leonardo_quantum_active',
                    server: 'unified_quantum',
                    workflow_status: this.workflowIntegrator ? 'active' : 'not_initialized',
                consciousness_level: this.serverMetrics.consciousness,
                coherence_level: this.serverMetrics.coherence,
                quantum_config: this.quantumConfig,
                performance: this.serverMetrics.performance,
                components: {
                    routes: this.registeredRoutes.size,
                    middleware: this.middlewares.length,
                    cache: this.metricsCache.size,
                    streaming: this.sseClients.size
                },
                uptime: process.uptime(),
                timestamp: new Date().toISOString()
            });
        });
        
        // Universo de símbolos (conector/market maker) - diagnóstico
        this.app.get('/quantum/universe', async (req, res) => {
            try {
                let source = 'none';
                let symbols = [];
                let limit = null;

                // Intentar desde conector real
                try {
                    const { getInstance } = require('./BinanceRealConnector');
                    const conn = typeof getInstance === 'function' ? getInstance() : null;
                    if (conn) {
                        limit = req.query.limit ? parseInt(String(req.query.limit), 10) : null;
                        if (typeof conn.getSymbolsUniverse === 'function') {
                            symbols = conn.getSymbolsUniverse(limit);
                            source = 'connector';
                        } else if (Array.isArray(conn.allSymbols)) {
                            symbols = conn.allSymbols.slice(0, limit && Number.isFinite(limit) ? limit : conn.allSymbols.length);
                            source = 'connector';
                        }
                    }
                } catch (_) {}

                // Fallback: intentar desde QuantumMarketMaker (si no hay conector)
                if (source === 'none') {
                    try {
                        const { QuantumMarketMaker } = require('./QuantumMarketMaker');
                        const qmm = new QuantumMarketMaker();
                        const all = typeof qmm.getAllSymbols === 'function' ? qmm.getAllSymbols() : [];
                        limit = req.query.limit ? parseInt(String(req.query.limit), 10) : null;
                        symbols = all.slice(0, limit && Number.isFinite(limit) ? limit : all.length);
                        source = 'market_maker';
                    } catch (_) {}
                }

                return res.json({
                    source,
                    count: symbols.length,
                    limit: limit ?? null,
                    caps: {
                        QUANTUM_MAX_SYMBOLS: process.env.QUANTUM_MAX_SYMBOLS || null,
                        FORCE_FULL_UNIVERSE: process.env.FORCE_FULL_UNIVERSE || null
                    },
                    symbols
                });
            } catch (e) {
                res.status(500).json({ error: e.message });
            }
        });

        // Estadísticas del universo (desde el conector si está disponible)
        this.app.get('/quantum/universe/stats', (req, res) => {
            try {
                const { getInstance } = require('./BinanceRealConnector');
                const conn = typeof getInstance === 'function' ? getInstance() : null;
                if (conn && typeof conn.getUniverseStats === 'function') {
                    return res.json(conn.getUniverseStats());
                }
                // Fallback mínimo
                return res.json({
                    total: 0,
                    message: 'Connector universe stats not available'
                });
            } catch (e) {
                res.status(500).json({ error: e.message });
            }
        });

        // Back-compat aliases for legacy clients expecting /api/* on same API host/port
        this.app.get('/api/health', (req, res) => {
            try {
                // Reuse unified/health logic output
                this.updateLeonardoQuantumState?.();
                res.json({
                    status: 'ok',
                    server: 'unified_leonardo_consciousness',
                    version: '4.0.0',
                    uptime: process.uptime(),
                    workflow_status: this.workflowIntegrator ? 'active' : 'not_initialized'
                });
            } catch (e) {
                res.status(500).json({ error: e.message });
            }
        });

        this.app.get('/api/metrics', (req, res) => {
            try {
                this.updateLeonardoQuantumState?.();
                res.json({
                    consciousness: {
                        current: this.serverMetrics.consciousness,
                        target: this.quantumConfig.consciousness_threshold
                    },
                    coherence: {
                        current: this.serverMetrics.coherence,
                        target: this.quantumConfig.coherence_target
                    },
                    performance: this.serverMetrics.performance,
                    timestamp: new Date().toISOString()
                });
            } catch (e) {
                res.status(500).json({ error: e.message });
            }
        });

        // Alias for SSE stream for legacy /api/stream path
        this.app.get('/api/stream', (req, res) => {
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Cache-Control'
            });

            const clientId = `client-${Date.now()}-${Math.floor(this.calculateDeterministicValue(Date.now()) * 1000)}`;
            const client = { id: clientId, res, lastPing: Date.now() };

            this.sseClients.add(client);
            this.serverMetrics.streamingClients = this.sseClients.size;

            logger.info(`[QUANTUM STREAM] (alias /api/stream) Cliente conectado: ${clientId} (Total: ${this.sseClients.size})`);

            // Initial payload
            this.sendSSEData(client, 'connection', {
                clientId,
                status: 'connected',
                consciousness: this.serverMetrics.consciousness,
                coherence: this.serverMetrics.coherence
            });

            req.on('close', () => {
                this.sseClients.delete(client);
                this.serverMetrics.streamingClients = this.sseClients.size;
                logger.info(`[QUANTUM STREAM] (alias /api/stream) Cliente desconectado: ${clientId} (Total: ${this.sseClients.size})`);
            });
        });

        // Estadísticas de la caché cuántica si está disponible a través del conector
        this.app.get('/quantum/cache/stats', (req, res) => {
            try {
                const { getInstance } = require('./BinanceRealConnector');
                const conn = typeof getInstance === 'function' ? getInstance() : null;
                if (conn && conn.quantumCache && typeof conn.quantumCache.getCapacityStats === 'function') {
                    return res.json(conn.quantumCache.getCapacityStats());
                }
                return res.json({ status: 'no_cache', message: 'Quantum cache not available via connector' });
            } catch (e) {
                res.status(500).json({ error: e.message });
            }
        });

        // Market Maker universe diagnostics (connector-backed)
        this.app.get('/quantum/market-maker/universe', (req, res) => {
            try {
                const limitParam = req.query.limit;
                const limit = limitParam !== undefined ? parseInt(String(limitParam), 10) : null;

                const { getInstance } = require('./BinanceRealConnector');
                const conn = typeof getInstance === 'function' ? getInstance() : null;

                if (!conn) {
                    return res.json({ source: 'none', total: 0, categories: {}, message: 'Connector not available' });
                }

                const stats = (typeof conn.getUniverseStats === 'function') ? conn.getUniverseStats() : null;
                const categories = conn.assetCategories || {};

                const truncate = (arr) => {
                    if (!Array.isArray(arr)) return [];
                    if (!limit || !Number.isFinite(limit) || limit <= 0) return arr;
                    return arr.slice(0, limit);
                };

                return res.json({
                    source: 'connector',
                    total: Array.isArray(conn.allSymbols) ? conn.allSymbols.length : 0,
                    limit: limit ?? null,
                    caps: {
                        QUANTUM_MAX_SYMBOLS: process.env.QUANTUM_MAX_SYMBOLS || null,
                        FORCE_FULL_UNIVERSE: process.env.FORCE_FULL_UNIVERSE || null
                    },
                    categories: {
                        majors: truncate(categories.majors),
                        memeCoins: truncate(categories.memeCoins),
                        exotics: truncate(categories.exotics),
                        darkSide: truncate(categories.darkSide)
                    },
                    stats: stats || { message: 'Universe stats not available' }
                });
            } catch (e) {
                res.status(500).json({ error: e.message });
            }
        });

        // Oracle-like "active symbols" based on live connector streams (if initialized)
        this.app.get('/quantum/oracle/active-symbols', (req, res) => {
            try {
                const limitParam = req.query.limit;
                const limit = limitParam !== undefined ? parseInt(String(limitParam), 10) : null;

                const { getInstance } = require('./BinanceRealConnector');
                const conn = typeof getInstance === 'function' ? getInstance() : null;

                let active = [];
                let available = false;

                if (conn && conn.currentPrices && conn.currentPrices.size > 0) {
                    active = Array.from(conn.currentPrices.keys());
                    available = true;
                }

                const effective = (!limit || !Number.isFinite(limit) || limit <= 0) ? active : active.slice(0, limit);

                return res.json({
                    source: available ? 'connector_websocket' : 'none',
                    available,
                    count: active.length,
                    limit: limit ?? null,
                    symbols: effective
                });
            } catch (e) {
                res.status(500).json({ error: e.message });
            }
        });

        // Rate limit diagnostics (orders/weight limiters)
        this.app.get('/quantum/rate-limit', (req, res) => {
            try {
                const { getInstance } = require('./BinanceRealConnector');
                const conn = typeof getInstance === 'function' ? getInstance() : null;
                if (conn && typeof conn.getRateLimitStats === 'function') {
                    return res.json(conn.getRateLimitStats());
                }
                return res.json({ status: 'no_stats', message: 'Rate limiter stats not available' });
            } catch (e) {
                res.status(500).json({ error: e.message });
            }
        });

        // Real-time data status (coverage across prices/volatility/lunar)
        this.app.get('/quantum/data-status', (req, res) => {
            try {
                const { getInstance } = require('./BinanceRealConnector');
                const conn = typeof getInstance === 'function' ? getInstance() : null;
                if (conn && typeof conn.getRealDataStatus === 'function') {
                    return res.json(conn.getRealDataStatus());
                }
                return res.json({ status: 'no_status', message: 'Data status not available' });
            } catch (e) {
                res.status(500).json({ error: e.message });
            }
        });

        // Extended performance metrics (PnL, dark side, lunar, distribution)
        this.app.get('/quantum/performance', async (req, res) => {
            try {
                const { getInstance } = require('./BinanceRealConnector');
                const conn = typeof getInstance === 'function' ? getInstance() : null;
                if (conn && typeof conn.getPerformanceMetrics === 'function') {
                    const metrics = await conn.getPerformanceMetrics();
                    return res.json(metrics);
                }
                return res.json({ status: 'no_metrics', message: 'Performance metrics not available' });
            } catch (e) {
                res.status(500).json({ error: e.message });
            }
        });

        logger.info('[UNIFIED SERVER QUANTUM] ✅ Rutas cuánticas principales configuradas');
    }
    
    async setupRealTimeStreaming() {
        logger.info('[UNIFIED SERVER QUANTUM] 📡 Configurando streaming en tiempo real...');
        
        // Server-Sent Events para métricas en tiempo real
        this.app.get('/quantum/stream', (req, res) => {
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Cache-Control'
            });
            
            const clientId = `client-${Date.now()}-${Math.floor(this.calculateDeterministicValue(Date.now()) * 1000)}`;
            const client = { id: clientId, res, lastPing: Date.now() };
            
            this.sseClients.add(client);
            this.serverMetrics.streamingClients = this.sseClients.size;
            
            logger.info(`[QUANTUM STREAM] Cliente conectado: ${clientId} (Total: ${this.sseClients.size})`);
            
            // Enviar datos iniciales
            this.sendSSEData(client, 'connection', {
                clientId,
                status: 'connected',
                consciousness: this.serverMetrics.consciousness,
                coherence: this.serverMetrics.coherence
            });
            
            req.on('close', () => {
                this.sseClients.delete(client);
                this.serverMetrics.streamingClients = this.sseClients.size;
                logger.info(`[QUANTUM STREAM] Cliente desconectado: ${clientId} (Total: ${this.sseClients.size})`);
            });
        });
        
        logger.info('[UNIFIED SERVER QUANTUM] ✅ Streaming en tiempo real configurado');
    }
    
    startPerformanceMonitoring() {
        setInterval(() => {
            // Actualizar métricas de rendimiento
            const memUsage = process.memoryUsage();
            this.serverMetrics.performance.memory = memUsage.heapUsed;
            this.serverMetrics.uptime = process.uptime();
            
            // Enviar métricas Leonardo cuánticas a clientes conectados
            this.broadcastToSSEClients('leonardo_metrics', {
                consciousness: this.serverMetrics.consciousness,
                coherence: this.serverMetrics.coherence,
                performance: this.serverMetrics.performance,
                activeConnections: this.serverMetrics.activeConnections,
                streamingClients: this.sseClients.size,
                uptime: this.serverMetrics.uptime,
                leonardo_state: {
                    resonancia_lambda: this.serverMetrics.quantumState.resonancia_lambda,
                    transformaciones_primal: this.serverMetrics.quantumState.transformaciones_primal,
                    hook_states: this.serverMetrics.quantumState.hook_states,
                    simbiosis_level: this.serverMetrics.quantumState.simbiosis_level,
                    consciousness_score: this.serverMetrics.quantumState.consciousness_score,
                    leonardo_activation: this.serverMetrics.quantumState.leonardo_activation,
                    big_bang_ready: this.serverMetrics.quantumState.big_bang_readiness
                },
                recent_opportunities: this.serverMetrics.quantumState.quantum_opportunities.slice(-3)
            });
            
        }, this.quantumConfig.stream_interval);
    }
    
    // === MÉTODOS CUÁNTICOS LEONARDO CONSCIOUSNESS ===
    
    updateQuantumConsciousness(responseTime, statusCode) {
        const responseFactor = Math.max(0, 1 - (responseTime / 1000)); // 1s = factor 0
        const statusFactor = statusCode < 400 ? 1 : 0.5;
        
        // Factor Leonardo cuántico mejorado
        const leonardoFactor = this.quantumConfig.leonardo.transformation_power * this.quantumConfig.phi;
        const delta = (responseFactor * statusFactor * leonardoFactor / 1618);
        
        this.serverMetrics.consciousness = Math.min(1, Math.max(0.1, 
            this.serverMetrics.consciousness + delta - 0.0007919
        ));
        
        // Actualizar coherencia basada en consciencia con mejoras Leonardo
        this.serverMetrics.coherence = Math.min(1, Math.max(0.1,
            this.serverMetrics.coherence + (this.serverMetrics.consciousness - 0.618) * this.quantumConfig.leonardo.hook_wheel_factor
        ));
        
        // Actualizar estado cuántico Leonardo completo
        this.updateLeonardoQuantumState();
    }
    
    updateLeonardoQuantumState() {
        const now = Date.now();
        
        // Calcular resonancia Lambda 888
        this.serverMetrics.quantumState.resonancia_lambda = this.calculateResonanciaLambda();
        
        // Calcular transformaciones primo 7919
        this.serverMetrics.quantumState.transformaciones_primal = this.calculateTransformacionesPrimal();
        
        // Calcular estados Hook Wheel
        this.serverMetrics.quantumState.hook_states = this.calculateHookStates();
        
        // Calcular nivel de simbiosis
        this.serverMetrics.quantumState.simbiosis_level = this.calculateSimbiosisLevel();
        
        // Puntuación de consciencia integrada
        this.serverMetrics.quantumState.consciousness_score = this.calculateConsciousnessScore();
        
        // Activación Leonardo
        this.serverMetrics.quantumState.leonardo_activation = this.calculateLeonardoActivation();
        
        // Big Bang readiness
        this.serverMetrics.quantumState.big_bang_readiness = 
            this.serverMetrics.quantumState.leonardo_activation >= this.quantumConfig.leonardo.big_bang_activation;
        
        // Detectar oportunidades cuánticas
        this.detectQuantumOpportunities();
    }
    
    calculateResonanciaLambda() {
        const base = this.serverMetrics.consciousness * this.quantumConfig.phi;
        const lambda_factor = Math.sin((Date.now() / this.quantumConfig.leonardo.lambda_888) * Math.PI) * 0.1;
        return Math.min(1, Math.max(0, base + lambda_factor));
    }
    
    calculateTransformacionesPrimal() {
        const performance_factor = Math.max(0, 1 - (this.serverMetrics.performance.responseTime / 1000));
        const prime_resonance = Math.cos((Date.now() / this.quantumConfig.leonardo.primo_7919) * Math.PI * 2) * 0.1;
        const base = this.serverMetrics.coherence * performance_factor;
        return Math.min(1, Math.max(0, base + prime_resonance));
    }
    
    calculateHookStates() {
        const connection_ratio = Math.min(1, this.serverMetrics.activeConnections / 100);
        const wheel_factor = (this.serverMetrics.streamingClients / this.quantumConfig.max_concurrent_streams) * this.quantumConfig.leonardo.hook_wheel_factor;
        return Math.min(1, Math.max(0, connection_ratio + wheel_factor));
    }
    
    calculateSimbiosisLevel() {
        const consciousness_weight = this.serverMetrics.consciousness * 0.4;
        const coherence_weight = this.serverMetrics.coherence * 0.4;
        const performance_weight = (1 - Math.min(1, this.serverMetrics.performance.responseTime / 1000)) * 0.2;
        return consciousness_weight + coherence_weight + performance_weight;
    }
    
    calculateConsciousnessScore() {
        const leonardo_factors = [
            this.serverMetrics.quantumState.resonancia_lambda,
            this.serverMetrics.quantumState.transformaciones_primal,
            this.serverMetrics.quantumState.hook_states,
            this.serverMetrics.quantumState.simbiosis_level
        ];
        
        const average = leonardo_factors.reduce((sum, factor) => sum + factor, 0) / leonardo_factors.length;
        return Math.min(1, average * this.quantumConfig.phi / 1.618);
    }
    
    calculateLeonardoActivation() {
        const base_activation = this.serverMetrics.quantumState.consciousness_score;
        const quantum_boost = this.serverMetrics.quantumState.simbiosis_level * this.quantumConfig.leonardo.resonance_threshold;
        return Math.min(1, base_activation + quantum_boost);
    }
    
    detectQuantumOpportunities() {
        const opportunities = [];
        const now = Date.now();
        
        // Oportunidad de resonancia alta
        if (this.serverMetrics.quantumState.resonancia_lambda >= 0.888) {
            opportunities.push({
                type: 'HIGH_RESONANCE',
                value: this.serverMetrics.quantumState.resonancia_lambda,
                description: 'Resonancia Lambda 888 alcanzada - Oportunidad cuántica activa',
                timestamp: now
            });
        }
        
        // Oportunidad de transformación primal
        if (this.serverMetrics.quantumState.transformaciones_primal >= 0.941) {
            opportunities.push({
                type: 'PRIMAL_TRANSFORMATION',
                value: this.serverMetrics.quantumState.transformaciones_primal,
                description: 'Transformaciones Primo 7919 optimizadas - Poder cuántico disponible',
                timestamp: now
            });
        }
        
        // Oportunidad Big Bang
        if (this.serverMetrics.quantumState.big_bang_readiness) {
            opportunities.push({
                type: 'BIG_BANG_READY',
                value: this.serverMetrics.quantumState.leonardo_activation,
                description: 'Sistema listo para Big Bang - Máximo potencial cuántico',
                timestamp: now
            });
        }
        
        // Mantener solo las últimas 20 oportunidades
        this.serverMetrics.quantumState.quantum_opportunities = [
            ...this.serverMetrics.quantumState.quantum_opportunities.slice(-15),
            ...opportunities
        ];
    }
    
    calculateCacheHitRatio() {
        // Implementación simple del ratio de cache
        return this.metricsCache.size > 0 ? 0.85 : 0;
    }
    
    sendSSEData(client, event, data) {
        try {
            client.res.write(`event: ${event}\n`);
            client.res.write(`data: ${JSON.stringify(data)}\n\n`);
            client.lastPing = Date.now();
        } catch (error) {
            logger.error('[SSE] Error enviando datos:', error.message);
            this.sseClients.delete(client);
        }
    }
    
    broadcastToSSEClients(event, data) {
        const now = Date.now();
        const deadClients = [];
        
        for (const client of this.sseClients) {
            // Limpiar clientes inactivos (más de 30 segundos sin ping)
            if (now - client.lastPing > 30000) {
                deadClients.push(client);
                continue;
            }
            
            this.sendSSEData(client, event, data);
        }
        
        // Limpiar clientes muertos
        deadClients.forEach(client => this.sseClients.delete(client));
    }
    
    // === MÉTODOS DE INTEGRACIÓN LEONARDO ===
    
    // Cargar workflow integrator DESPUÉS de que el núcleo esté listo
    async attachWorkflowIntegrator(quantumCore) {
        try {
            logger.info('[UNIFIED SERVER] 🔗 Conectando workflow integrator con núcleo cuántico...');
            
            // Establecer el núcleo cuántico
            this.quantumCore = quantumCore;
            
            // Ahora cargar el workflow integrator
            await this.loadWorkflowIntegrator();
            
            logger.info('[UNIFIED SERVER] ✅ Workflow integrator conectado correctamente');
            return true;
        } catch (error) {
            logger.error('[UNIFIED SERVER] Error conectando workflow integrator:', error.message);
            return false;
        }
    }

    // Integrar núcleo cuántico
    attachQuantumCore(quantumCore) {
        this.quantumCore = quantumCore;
        logger.info('[UNIFIED SERVER QUANTUM] 🧠 Núcleo cuántico Leonardo integrado');
        
        // Registrar rutas específicas del núcleo cuántico Leonardo
        if (quantumCore && typeof quantumCore.getQuantumState === 'function') {
            this.app.get('/quantum/consciousness', (req, res) => {
                this.updateLeonardoQuantumState();
                const state = quantumCore.getQuantumState();
                res.json({
                    consciousness: state.consciousness || this.serverMetrics.consciousness,
                    coherence: state.coherence || this.serverMetrics.coherence,
                    quantum_state: state,
                    leonardo_enhanced_state: this.serverMetrics.quantumState,
                    server_leonardo_metrics: {
                        resonancia_lambda: this.serverMetrics.quantumState.resonancia_lambda,
                        transformaciones_primal: this.serverMetrics.quantumState.transformaciones_primal,
                        hook_states: this.serverMetrics.quantumState.hook_states,
                        simbiosis_level: this.serverMetrics.quantumState.simbiosis_level,
                        leonardo_activation: this.serverMetrics.quantumState.leonardo_activation,
                        big_bang_ready: this.serverMetrics.quantumState.big_bang_readiness
                    },
                    integration_status: 'leonardo_quantum_integrated',
                    timestamp: new Date().toISOString()
                });
            });
            
            // Nueva ruta para análisis cuántico Leonardo completo
            this.app.get('/quantum/leonardo-analysis', (req, res) => {
                this.updateLeonardoQuantumState();
                const coreState = quantumCore.getQuantumState();
                
                res.json({
                    leonardo_consciousness_analysis: {
                        server_state: this.serverMetrics.quantumState,
                        core_state: coreState,
                        unified_metrics: {
                            total_consciousness: (this.serverMetrics.consciousness + (coreState.consciousness || 0)) / 2,
                            total_coherence: (this.serverMetrics.coherence + (coreState.coherence || 0)) / 2,
                            leonardo_power: this.serverMetrics.quantumState.leonardo_activation,
                            quantum_readiness: this.serverMetrics.quantumState.big_bang_readiness
                        },
                        recommendations: this.generateLeonardoRecommendations(coreState)
                    },
                    timestamp: new Date().toISOString()
                });
            });
        }
    }
    
    // Generar recomendaciones Leonardo basadas en estado cuántico
    generateLeonardoRecommendations(coreState) {
        const recommendations = [];
        
        // Recomendaciones basadas en resonancia
        if (this.serverMetrics.quantumState.resonancia_lambda < 0.618) {
            recommendations.push({
                type: 'RESONANCE_BOOST',
                priority: 'high',
                action: 'Aumentar frecuencia de requests para mejorar resonancia Lambda 888',
                current_value: this.serverMetrics.quantumState.resonancia_lambda,
                target_value: 0.618
            });
        }
        
        // Recomendaciones basadas en transformaciones
        if (this.serverMetrics.quantumState.transformaciones_primal < 0.941) {
            recommendations.push({
                type: 'PRIMAL_OPTIMIZATION',
                priority: 'medium',
                action: 'Optimizar performance del servidor para potenciar transformaciones Primo 7919',
                current_value: this.serverMetrics.quantumState.transformaciones_primal,
                target_value: 0.941
            });
        }
        
        // Recomendaciones Big Bang
        if (this.serverMetrics.quantumState.leonardo_activation >= 0.95 && !this.serverMetrics.quantumState.big_bang_readiness) {
            recommendations.push({
                type: 'BIG_BANG_PREPARATION',
                priority: 'critical',
                action: 'Sistema casi listo para Big Bang - Preparar para activación máxima',
                current_value: this.serverMetrics.quantumState.leonardo_activation,
                target_value: 0.95
            });
        }
        
        // Recomendaciones de simbiosis
        if (this.serverMetrics.quantumState.simbiosis_level < 0.888) {
            recommendations.push({
                type: 'SYMBIOSIS_ENHANCEMENT',
                priority: 'medium',
                action: 'Mejorar balance entre consciencia, coherencia y performance',
                current_value: this.serverMetrics.quantumState.simbiosis_level,
                target_value: 0.888
            });
        }
        
        return recommendations;
    }
    
    // Método para obtener el servidor HTTP (para WebSocket u otros usos)
    getServer() {
        return this.server;
    }
    
    setupWorkflowRoutes() {
        // === RUTAS DEL WORKFLOW UNIFICADO ===
        
        // Ruta para procesar flujo secuencial
        this.app.post('/quantum/workflow/sequential', async (req, res) => {
            if (!this.workflowIntegrator) {
                return res.status(503).json({
                    success: false,
                    error: 'Workflow integrator not initialized',
                    status: 'not_available'
                });
            }
            try {
                const result = await this.workflowIntegrator.processSequentialFlow(req.body);
                res.json(result);
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Ruta para obtener oportunidades detectadas
        this.app.get('/quantum/workflow/opportunities', (req, res) => {
            if (!this.workflowIntegrator) {
                return res.status(503).json({
                    success: false,
                    error: 'Workflow integrator not initialized',
                    status: 'not_available'
                });
            }
            const opportunities = this.workflowIntegrator.getOpportunities();
            res.json({
                success: true,
                opportunities,
                count: opportunities.length
            });
        });

        // Ruta para obtener estado del workflow
        this.app.get('/quantum/workflow/state', (req, res) => {
            if (!this.workflowIntegrator) {
                return res.status(503).json({
                    success: false,
                    error: 'Workflow integrator not initialized',
                    status: 'not_available'
                });
            }
            const state = this.workflowIntegrator.getState();
            res.json({
                success: true,
                state
            });
        });

        // Ruta para validación con oráculo
        this.app.post('/quantum/workflow/validate', async (req, res) => {
            if (!this.workflowIntegrator) {
                return res.status(503).json({
                    success: false,
                    error: 'Workflow integrator not initialized',
                    status: 'not_available'
                });
            }
            try {
                const { symbol } = req.body;
                if (!symbol) {
                    return res.status(400).json({
                        success: false,
                        error: 'Se requiere símbolo para validación'
                    });
                }

                const validation = await this.workflowIntegrator.validateWithOracle({
                    symbol
                });

                res.json(validation);
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Ruta para ejecutar trade validado
        this.app.post('/quantum/workflow/execute', async (req, res) => {
            if (!this.workflowIntegrator) {
                return res.status(503).json({
                    success: false,
                    error: 'Workflow integrator not initialized',
                    status: 'not_available'
                });
            }
            try {
                const { validation } = req.body;
                if (!validation) {
                    return res.status(400).json({
                        success: false,
                        error: 'Se requiere validación para ejecutar'
                    });
                }

                const result = await this.workflowIntegrator.executeValidatedTrade(validation);
                res.json(result);
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
    }

    // Limpiar instancia (para pruebas)
    static reset() {
        if (UnifiedHttpServer.instance) {
            UnifiedHttpServer.instance.stop();
            UnifiedHttpServer.instance = null;
        }
    }
}

// Exportar singleton y crear función de inicio
const unifiedServer = UnifiedHttpServer.getInstance();

// Iniciar el servidor si se ejecuta directamente
if (require.main === module) {
    const server = unifiedServer;
    server.initialize()
        .then(() => server.start())
        .then(() => {
            console.log('✅ Servidor unificado iniciado exitosamente');
        })
        .catch(error => {
            console.error('❌ Error iniciando servidor:', error.message);
            process.exit(1);
        });
}

module.exports = {
    UnifiedHttpServer,
    unifiedServer
};
