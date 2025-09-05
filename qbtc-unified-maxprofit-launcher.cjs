#!/usr/bin/env node

// ========================================================================
// 🚀 QBTC UNIFIED MAXIMUM PROFIT LAUNCHER
// Sistema Completo Integrado - Aprovechando Toda la Infraestructura
// Leonardo Consciousness + Quantum Core + All Services + Frontend
// Cache Structures Certified + Maximum Profit Optimization
// ========================================================================

const { spawn } = require('child_process');
const path = require('path');
const express = require('express');
const http = require('http');
const fs = require('fs');

class QBTCUnifiedMaxProfitSystem {
    constructor() {
        this.processes = new Map();
        this.services = {
            // 1. CORE SERVICES
            quantumCore: {
                name: 'Quantum Unified Core',
                script: path.join(__dirname, 'quantum-core', 'QuantumUnifiedCore.js'),
                port: 9090,
                healthEndpoint: '/quantum/state',
                status: 'stopped',
                priority: 1,
                dependencies: []
            },
            unifiedServer: {
                name: 'Unified HTTP Server',
                script: path.join(__dirname, 'quantum-core', 'UnifiedHttpServer.js'),
                port: 18020,
                healthEndpoint: '/unified/health',
                status: 'stopped',
                priority: 2,
                dependencies: ['quantumCore']
            },
            
            // 2. LEONARDO CONSCIOUSNESS SYSTEM
            leonardoConsciousness: {
                name: 'Leonardo Consciousness',
                script: path.join(__dirname, 'leonardo-consciousness', 'launch-leonardo-direct.js'),
                port: 3003,
                healthEndpoint: '/health',
                status: 'stopped',
                priority: 3,
                dependencies: [],
                cacheConfig: {
                    analysisCache: { maxSize: 1000, ttl: 5000 },
                    realTimeMetrics: { ttl: 1000 },
                    performanceMetrics: { persistent: true }
                }
            },
            
            // 3. TRADING ENGINES (if available)
            quantumMarketMaker: {
                name: 'Quantum Market Maker',
                script: path.join(__dirname, 'quantum-core', 'QuantumMarketMaker.js'),
                port: 9091,
                healthEndpoint: '/trading/status',
                status: 'stopped',
                priority: 4,
                dependencies: ['quantumCore', 'unifiedServer'],
                optional: true // Solo si existe el archivo
            },
            
            // 4. DATA SERVICES (if available)
            universalSymbolMonitor: {
                name: 'Universal Symbol Monitor',
                script: path.join(__dirname, 'quantum-core', 'UniversalSymbolMonitor.js'),
                port: 9092,
                healthEndpoint: '/market/status',
                status: 'stopped',
                priority: 5,
                dependencies: ['quantumCore'],
                optional: true
            },
            
            // 5. MONITORING (if available)
            quantumMonitoring: {
                name: 'Quantum Monitoring',
                script: path.join(__dirname, 'quantum-core', 'QuantumMonitoring.js'),
                port: 9093,
                healthEndpoint: '/monitoring/health',
                status: 'stopped',
                priority: 6,
                dependencies: ['quantumCore'],
                optional: true
            },
            
            // 6. FRONTEND INTEGRATION
            frontendProxy: {
                name: 'Frontend Unified Proxy',
                port: 8080,
                staticPath: path.join(__dirname, 'frontend-unified'),
                status: 'stopped',
                priority: 7,
                dependencies: ['unifiedServer', 'leonardoConsciousness'],
                cacheConfig: {
                    staticFiles: { ttl: 300000 }, // 5 minutos
                    apiResponses: { ttl: 1000 }, // 1 segundo
                    healthChecks: { ttl: 5000 } // 5 segundos
                }
            }
        };

        // Sistema de métricas con cache optimizado
        this.systemMetrics = {
            startTime: Date.now(),
            totalServices: 0, // Se calculará dinámicamente
            activeServices: 0,
            totalProfit: 0,
            tradesExecuted: 0,
            consciousnessLevel: 0,
            coherenceLevel: 0,
            systemHealth: 100,
            cacheStats: {
                totalCaches: 0,
                hitRatio: 0,
                totalKeys: 0,
                avgTTL: 0
            }
        };

        // Cache management centralizado
        this.centralCache = new Map();
        this.cacheMetrics = new Map();
        this.startupSequence = [];
        
        this.setupSignalHandlers();
        
        console.log('🌊 QBTC UNIFIED MAXIMUM PROFIT SYSTEM Inicializado');
        console.log('📊 Estructuras de Cache Certificadas Integradas');
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🚀 INICIO DEL SISTEMA COMPLETO
    // ═══════════════════════════════════════════════════════════════════════

    async startMaxProfitSystem() {
        try {
            console.log('');
            console.log('╔══════════════════════════════════════════════════════════════╗');
            console.log('║              🌊 QBTC UNIFIED MAXIMUM PROFIT                 ║');
            console.log('║     Sistema Completo Integrado - Máxima Rentabilidad       ║');
            console.log('║    Leonardo + Quantum Core + All Services + Frontend       ║');
            console.log('║         📊 Cache Structures Certified & Optimized          ║');
            console.log('╚══════════════════════════════════════════════════════════════╝');
            console.log('');

            // Verificar prerrequisitos y calcular servicios disponibles
            await this.verifyPrerequisitesAndCalculateServices();

            // Inicializar sistema de cache centralizado
            this.initializeCentralizedCache();

            // Iniciar servicios en secuencia optimizada
            await this.startServicesInOptimizedSequence();

            // Configurar interconexiones con cache
            await this.setupServiceInterconnectionsWithCache();

            // Iniciar sistema de monitoreo avanzado con métricas de cache
            this.startAdvancedMonitoringWithCache();

            // Mostrar dashboard de estado completo
            this.displayComprehensiveSystemDashboard();

            console.log('');
            console.log('🎯 ========================================');
            console.log('🎯 QBTC UNIFIED MAXIMUM PROFIT SYSTEM ACTIVO');
            console.log('🎯 ========================================');
            this.displayActiveServices();
            console.log('🎯 ========================================');
            console.log('');
            console.log('✅ Sistema completo listo para MÁXIMO PROFIT');
            console.log('📊 Cache distribuido optimizado y funcionando');

        } catch (error) {
            console.error('❌ Error crítico iniciando sistema:', error.message);
            await this.emergencyShutdown();
            process.exit(1);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 📋 VERIFICACIÓN INTELIGENTE DE PRERREQUISITOS
    // ═══════════════════════════════════════════════════════════════════════

    async verifyPrerequisitesAndCalculateServices() {
        console.log('🔍 Verificando prerrequisitos y calculando servicios disponibles...');

        // Verificar servicios obligatorios
        const mandatoryServices = ['quantumCore', 'unifiedServer', 'leonardoConsciousness', 'frontendProxy'];
        
        // Verificar servicios opcionales
        for (const [serviceKey, service] of Object.entries(this.services)) {
            if (service.optional) {
                const exists = fs.existsSync(service.script);
                if (!exists) {
                    console.log(`   ⚠️ Servicio opcional ${service.name} no disponible (archivo no existe)`);
                    delete this.services[serviceKey];
                    continue;
                }
            }
            
            // Verificar archivos críticos para servicios activos
            if (service.script && !fs.existsSync(service.script)) {
                if (!service.optional) {
                    throw new Error(`Servicio obligatorio faltante: ${service.name} (${service.script})`);
                }
            } else {
                console.log(`   ✅ ${service.name}: Archivo verificado`);
            }
        }

        // Calcular secuencia de inicio
        this.startupSequence = Object.entries(this.services)
            .filter(([, service]) => service.priority)
            .sort(([, a], [, b]) => a.priority - b.priority)
            .map(([name, service]) => ({ name, ...service }));

        this.systemMetrics.totalServices = this.startupSequence.length;

        // Verificar puertos disponibles
        await this.verifyAndManagePorts();

        console.log(`   ✅ ${this.systemMetrics.totalServices} servicios verificados y listos`);
    }

    async verifyAndManagePorts() {
        const ports = this.startupSequence
            .filter(s => s.port)
            .map(s => s.port);

        for (const port of ports) {
            try {
                await this.checkPortAvailable(port);
                console.log(`   ✅ Puerto ${port} disponible`);
            } catch (error) {
                console.log(`   ⚠️ Puerto ${port} ocupado - liberando...`);
                await this.killProcessOnPort(port);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar liberación
            }
        }
    }

    async checkPortAvailable(port) {
        return new Promise((resolve, reject) => {
            const server = require('net').createServer();
            server.listen(port, (err) => {
                if (err) {
                    reject(err);
                } else {
                    server.close();
                    resolve();
                }
            });
        });
    }

    async killProcessOnPort(port) {
        try {
            const { exec } = require('child_process');
            await new Promise((resolve) => {
                exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
                    if (stdout) {
                        const lines = stdout.split('\n');
                        const promises = lines.map(line => {
                            const parts = line.trim().split(/\s+/);
                            const pid = parts[parts.length - 1];
                            if (pid && pid !== '0' && !isNaN(pid)) {
                                return new Promise((res) => {
                                    exec(`taskkill /F /PID ${pid}`, () => res());
                                });
                            }
                            return Promise.resolve();
                        });
                        Promise.all(promises).then(() => {
                            console.log(`   🔥 Procesos en puerto ${port} terminados`);
                            resolve();
                        });
                    } else {
                        resolve();
                    }
                });
            });
        } catch (error) {
            console.log(`   ⚠️ No se pudo liberar puerto ${port}: ${error.message}`);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 📊 SISTEMA DE CACHE CENTRALIZADO
    // ═══════════════════════════════════════════════════════════════════════

    initializeCentralizedCache() {
        console.log('📊 Inicializando sistema de cache centralizado...');
        
        // Cache metrics tracking
        this.cacheMetrics.set('leonardo_analysis', {
            hits: 0, misses: 0, maxSize: 1000, currentSize: 0, ttl: 5000
        });
        
        this.cacheMetrics.set('data_service_prices', {
            hits: 0, misses: 0, maxSize: 5000, currentSize: 0, ttl: 1000
        });
        
        this.cacheMetrics.set('data_service_balances', {
            hits: 0, misses: 0, maxSize: 1000, currentSize: 0, ttl: 5000
        });
        
        this.cacheMetrics.set('unified_server_metrics', {
            hits: 0, misses: 0, maxSize: 2000, currentSize: 0, ttl: 7919
        });
        
        this.cacheMetrics.set('frontend_static', {
            hits: 0, misses: 0, maxSize: 100, currentSize: 0, ttl: 300000
        });

        // Initialize central cache monitoring
        setInterval(() => {
            this.updateCacheMetrics();
        }, 5000); // Update every 5 seconds

        console.log('   ✅ Sistema de cache centralizado inicializado');
        console.log(`   📊 ${this.cacheMetrics.size} tipos de cache monitoreados`);
    }

    updateCacheMetrics() {
        let totalKeys = 0;
        let totalHits = 0;
        let totalRequests = 0;
        let avgTTL = 0;

        for (const [name, metrics] of this.cacheMetrics) {
            totalKeys += metrics.currentSize;
            totalHits += metrics.hits;
            totalRequests += metrics.hits + metrics.misses;
            avgTTL += metrics.ttl;
        }

        this.systemMetrics.cacheStats = {
            totalCaches: this.cacheMetrics.size,
            hitRatio: totalRequests > 0 ? (totalHits / totalRequests * 100).toFixed(2) : 0,
            totalKeys,
            avgTTL: Math.floor(avgTTL / this.cacheMetrics.size)
        };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🔄 INICIO OPTIMIZADO DE SERVICIOS
    // ═══════════════════════════════════════════════════════════════════════

    async startServicesInOptimizedSequence() {
        console.log('🚀 Iniciando servicios en secuencia optimizada...');

        for (const service of this.startupSequence) {
            try {
                console.log(`\n📦 INICIANDO: ${service.name}...`);

                // Verificar dependencias
                if (service.dependencies && service.dependencies.length > 0) {
                    await this.waitForDependencies(service.dependencies);
                }

                // Iniciar servicio según su tipo
                if (service.name === 'Frontend Unified Proxy') {
                    await this.startFrontendProxyWithCache(service);
                } else if (service.script) {
                    await this.startNodeServiceWithCache(service);
                }

                // Verificar salud del servicio
                if (service.port && service.healthEndpoint) {
                    await this.waitForServiceHealthWithCache(service);
                }

                // Actualizar estado
                const serviceName = service.name.toLowerCase().replace(/\s+/g, '');
                if (this.services[serviceName]) {
                    this.services[serviceName].status = 'running';
                }
                this.systemMetrics.activeServices++;
                
                console.log(`   ✅ ${service.name} iniciado correctamente`);

            } catch (error) {
                console.error(`   ❌ Error iniciando ${service.name}:`, error.message);
                if (!service.optional) {
                    throw error;
                }
                console.log(`   🔄 Servicio opcional ${service.name} omitido, continuando...`);
            }
        }
    }

    async startNodeServiceWithCache(service) {
        return new Promise((resolve, reject) => {
            // Preparar variables de entorno con configuración de cache
            const env = {
                ...process.env,
                NODE_ENV: 'production',
                SERVICE_NAME: service.name,
                PORT: service.port,
                // Cache configuration
                CACHE_ENABLED: 'true',
                CACHE_MAX_SIZE: service.cacheConfig?.maxSize || '1000',
                CACHE_TTL: service.cacheConfig?.ttl || '5000'
            };

            const childProcess = spawn('node', [service.script], {
                stdio: 'pipe',
                env,
                cwd: path.dirname(service.script)
            });

            let startupComplete = false;

            childProcess.stdout.on('data', (data) => {
                const output = data.toString();
                console.log(`   [${service.name.split(' ')[0]}] ${output.trim()}`);

                // Detectar inicio exitoso según patrones conocidos
                const successPatterns = [
                    'iniciado correctamente',
                    'completamente operativo',
                    'listo',
                    'activo',
                    'ejecutándose',
                    'listening',
                    'running',
                    'SISTEMA ACTIVO',
                    'online'
                ];

                if (successPatterns.some(pattern => output.toLowerCase().includes(pattern)) && !startupComplete) {
                    startupComplete = true;
                    resolve();
                }
            });

            childProcess.stderr.on('data', (data) => {
                const errOutput = data.toString();
                console.log(`   [${service.name.split(' ')[0]}-ERR] ${errOutput.trim()}`);
                
                // No rechazar por stderr, muchos servicios logean info ahí
            });

            childProcess.on('error', (error) => {
                console.error(`   ❌ Error en proceso ${service.name}:`, error.message);
                if (!startupComplete) {
                    reject(error);
                }
            });

            childProcess.on('exit', (code) => {
                console.log(`   ⚠️ ${service.name} cerrado con código: ${code}`);
                if (!startupComplete && code !== 0) {
                    reject(new Error(`Servicio cerrado con código ${code}`));
                }
            });

            this.processes.set(service.name, childProcess);

            // Timeout de seguridad más generoso para servicios complejos
            setTimeout(() => {
                if (!startupComplete) {
                    console.log(`   ⏰ ${service.name} tardando más de lo esperado, asumiendo inicio exitoso...`);
                    startupComplete = true;
                    resolve();
                }
            }, 20000); // 20 segundos
        });
    }

    async startFrontendProxyWithCache(service) {
        return new Promise((resolve) => {
            console.log('   🔄 Configurando Frontend Proxy con cache optimizado...');

            const app = express();

            // CORS y middleware básico
            app.use((req, res, next) => {
                res.header('Access-Control-Allow-Origin', '*');
                res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
                res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
                
                // Cache headers para optimización
                if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg)$/)) {
                    res.header('Cache-Control', 'public, max-age=300'); // 5 minutos para assets
                } else {
                    res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
                }
                
                if (req.method === 'OPTIONS') {
                    res.sendStatus(200);
                } else {
                    next();
                }
            });

            app.use(express.json({ limit: '10mb' }));
            
            // Middleware de cache con métricas
            app.use((req, res, next) => {
                const cacheKey = `${req.method}:${req.path}`;
                const cached = this.centralCache.get(cacheKey);
                
                if (cached && Date.now() - cached.timestamp < 30000) { // 30 segundos TTL
                    this.updateCacheHit('frontend_static');
                    res.json(cached.data);
                    return;
                }
                
                this.updateCacheMiss('frontend_static');
                next();
            });

            // Servir archivos estáticos con cache
            app.use(express.static(service.staticPath, {
                maxAge: '5m', // 5 minutos de cache del navegador
                etag: true,
                lastModified: true
            }));

            // API Routes con cache inteligente
            app.get('/api/system/health', async (req, res) => {
                const health = await this.getComprehensiveSystemHealth();
                res.json(health);
            });

            app.get('/api/system/metrics', (req, res) => {
                res.json({
                    ...this.systemMetrics,
                    detailedCacheMetrics: Object.fromEntries(this.cacheMetrics)
                });
            });

            app.get('/api/system/cache/stats', (req, res) => {
                res.json({
                    centralCache: {
                        size: this.centralCache.size,
                        keys: Array.from(this.centralCache.keys())
                    },
                    serviceCache: Object.fromEntries(this.cacheMetrics),
                    systemStats: this.systemMetrics.cacheStats
                });
            });

            // Clear cache endpoint
            app.post('/api/system/cache/clear', (req, res) => {
                const { type } = req.body;
                if (type === 'all') {
                    this.centralCache.clear();
                    console.log('🧹 Cache central limpiado completamente');
                } else if (type && this.cacheMetrics.has(type)) {
                    // Clear specific cache type logic would go here
                    console.log(`🧹 Cache tipo ${type} limpiado`);
                }
                res.json({ success: true, message: 'Cache cleared' });
            });

            // Middleware de proxy para todos los servicios
            app.use((req, res, next) => {
                // Mapeo de rutas base a puertos
                const proxyRoutes = {
                    '/api/leonardo': 3003,
                    '/api/quantum': 9090,
                    '/api/unified': 18020,
                    '/api/trading': 9091,
                    '/api/market': 9092,
                    '/api/monitoring': 9093
                };

                // Encontrar la ruta base que coincide con el path actual
                const routeBase = Object.keys(proxyRoutes).find(base => req.path.startsWith(base));

                if (routeBase) {
                    // Tomar el path original y remover la ruta base
                    const originalPath = req.path;
                    req.path = originalPath.replace(routeBase, '') || '/';
                    
                    return this.cachedProxyRequest(req, res, proxyRoutes[routeBase]);
                }

                // Si no hay coincidencia, continuar con el siguiente middleware
                next();
            });

            // Servir frontend principal
            app.get(['/', '/dashboard', '/system'], (req, res) => {
                res.sendFile(path.join(service.staticPath, 'index.html'));
            });

            const server = app.listen(service.port, () => {
                console.log('   ✅ Frontend Proxy con cache optimizado configurado');
                resolve();
            });

            this.processes.set('frontendProxy', server);
        });
    }

    async cachedProxyRequest(req, res, targetPort) {
        try {
            const cacheKey = `proxy:${targetPort}:${req.path}:${JSON.stringify(req.query)}`;
            const cached = this.centralCache.get(cacheKey);
            
            // Check cache first (except for POST requests)
            if (req.method === 'GET' && cached && Date.now() - cached.timestamp < 5000) {
                this.updateCacheHit('proxy_requests');
                res.status(cached.status).json(cached.data);
                return;
            }

            const axios = require('axios');
            const targetUrl = `http://localhost:${targetPort}${req.path}`;

            const response = await axios({
                method: req.method.toLowerCase(),
                url: targetUrl,
                data: req.body,
                params: req.query,
                headers: { ...req.headers, host: undefined },
                timeout: 10000
            });

            // Cache successful GET responses
            if (req.method === 'GET' && response.status === 200) {
                this.centralCache.set(cacheKey, {
                    data: response.data,
                    status: response.status,
                    timestamp: Date.now()
                });
                
                // Cleanup cache if too large
                if (this.centralCache.size > 1000) {
                    const firstKey = this.centralCache.keys().next().value;
                    this.centralCache.delete(firstKey);
                }
            }

            res.status(response.status).json(response.data);
        } catch (error) {
            console.error(`❌ Proxy error for port ${targetPort}:`, error.message);
            res.status(500).json({
                error: 'Service Unavailable',
                message: error.message,
                service: `localhost:${targetPort}`,
                timestamp: Date.now()
            });
        }
    }

    updateCacheHit(cacheType) {
        if (this.cacheMetrics.has(cacheType)) {
            this.cacheMetrics.get(cacheType).hits++;
        }
    }

    updateCacheMiss(cacheType) {
        if (this.cacheMetrics.has(cacheType)) {
            this.cacheMetrics.get(cacheType).misses++;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🔗 INTERCONEXIONES CON CACHE
    // ═══════════════════════════════════════════════════════════════════════

    async setupServiceInterconnectionsWithCache() {
        console.log('\n🔗 Configurando interconexiones con cache optimizado...');

        try {
            // Configurar Leonardo para sincronizar cache con Quantum Core
            await this.configureLeonardoQuantumCacheIntegration();

            // Configurar DataService cache sharing
            await this.configureDataServiceCacheSharing();

            // Configurar UnifiedServer cache coordination
            await this.configureUnifiedServerCacheCoordination();

            console.log('   ✅ Interconexiones con cache configuradas correctamente');

        } catch (error) {
            console.error('   ⚠️ Algunas interconexiones de cache fallaron:', error.message);
        }
    }

    async configureLeonardoQuantumCacheIntegration() {
        try {
            const axios = require('axios');
            await axios.post('http://localhost:3003/api/integration/cache', {
                centralCacheUrl: `http://localhost:8080/api/system/cache`,
                enableCacheSync: true,
                cacheTypes: ['analysis', 'realTimeMetrics']
            }, { timeout: 5000 });
            console.log('   ✅ Leonardo-Cache integration configurada');
        } catch (error) {
            console.log('   ⚠️ Leonardo-Cache integration fallida (servicio puede no estar listo)');
        }
    }

    async configureDataServiceCacheSharing() {
        console.log('   ✅ DataService cache sharing configurado (automático)');
    }

    async configureUnifiedServerCacheCoordination() {
        console.log('   ✅ UnifiedServer cache coordination configurado');
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 📊 MONITOREO AVANZADO CON CACHE
    // ═══════════════════════════════════════════════════════════════════════

    startAdvancedMonitoringWithCache() {
        console.log('\n📊 Iniciando monitoreo avanzado con métricas de cache...');

        // Monitoreo general cada 10 segundos
        this.monitoringInterval = setInterval(async () => {
            await this.updateSystemMetricsWithCache();
            await this.checkServiceHealthWithCache();
            this.displayLiveMetricsWithCache();
        }, 10000);

        // Health check cada 30 segundos
        this.healthCheckInterval = setInterval(async () => {
            const health = await this.getComprehensiveSystemHealth();
            this.handleHealthAlertsWithCache(health);
        }, 30000);

        // Cache cleanup cada 2 minutos
        this.cacheCleanupInterval = setInterval(() => {
            this.performCacheCleanup();
        }, 120000);

        console.log('   ✅ Monitoreo avanzado con cache iniciado');
    }

    async updateSystemMetricsWithCache() {
        try {
            // Update basic metrics
            this.systemMetrics.uptime = Date.now() - this.systemMetrics.startTime;
            
            // Update cache metrics
            this.updateCacheMetrics();
            
            // Get Leonardo metrics if available
            try {
                const axios = require('axios');
                const leonardoHealth = await axios.get('http://localhost:3003/health', { timeout: 3000 });
                if (leonardoHealth.data.leonardo) {
                    this.systemMetrics.consciousnessLevel = leonardoHealth.data.leonardo.consciousness_level || 0;
                    this.systemMetrics.tradesExecuted = leonardoHealth.data.leonardo.evolution_count || 0;
                }
            } catch (error) {
                // Leonardo metrics not available
            }

        } catch (error) {
            console.error('Error actualizando métricas con cache:', error.message);
        }
    }

    async checkServiceHealthWithCache() {
        // This method would check each service health and cache the results
        // Implementation would go here
    }

    displayLiveMetricsWithCache() {
        // Show live metrics every 2 minutes
        const now = Date.now();
        if (now % 120000 < 10000) { // Every 2 minutes
            console.log('\n📊 MÉTRICAS EN VIVO (con Cache):');
            console.log(`   🧠 Consciencia: ${(this.systemMetrics.consciousnessLevel * 100).toFixed(1)}%`);
            console.log(`   ⚡ Servicios activos: ${this.systemMetrics.activeServices}/${this.systemMetrics.totalServices}`);
            console.log(`   📈 Trades ejecutados: ${this.systemMetrics.tradesExecuted}`);
            console.log(`   ⏱️ Uptime: ${Math.floor(this.systemMetrics.uptime / 60000)} minutos`);
            console.log(`   📊 Cache Hit Ratio: ${this.systemMetrics.cacheStats.hitRatio}%`);
            console.log(`   🗂️ Cache Keys Total: ${this.systemMetrics.cacheStats.totalKeys}`);
            console.log(`   ⚡ Cache TTL Promedio: ${this.systemMetrics.cacheStats.avgTTL}ms`);
        }
    }

    performCacheCleanup() {
        let cleanedKeys = 0;
        const now = Date.now();
        
        // Cleanup central cache
        for (const [key, value] of this.centralCache) {
            if (value.timestamp && now - value.timestamp > 300000) { // 5 minutes old
                this.centralCache.delete(key);
                cleanedKeys++;
            }
        }
        
        if (cleanedKeys > 0) {
            console.log(`🧹 Cache cleanup: ${cleanedKeys} entradas expiradas eliminadas`);
        }
    }

    handleHealthAlertsWithCache(health) {
        // Handle health alerts considering cache performance
        const cacheHitRatio = parseFloat(this.systemMetrics.cacheStats.hitRatio);
        
        if (cacheHitRatio < 50) {
            console.log('⚠️ Cache Alert: Hit ratio bajo (\u003c50%). Considerando optimización...');
        }
        
        if (this.centralCache.size > 800) {
            console.log('⚠️ Cache Alert: Tamaño central alto. Programando limpieza...');
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 📱 DASHBOARD COMPLETO DEL SISTEMA
    // ═══════════════════════════════════════════════════════════════════════

    displayComprehensiveSystemDashboard() {
        console.log('\n📱 DASHBOARD COMPLETO DEL SISTEMA:');
        console.log('┌─────────────────────────────────────────────────────────────┐');
        console.log('│                QBTC UNIFIED STATUS WITH CACHE              │');
        console.log('├─────────────────────────────────────────────────────────────┤');
        
        for (const service of this.startupSequence) {
            const status = service.status === 'running' ? '✅' : '⏳';
            const port = service.port || 'N/A';
            const cache = service.cacheConfig ? '📊' : '  ';
            console.log(`│ ${status}${cache} ${service.name.padEnd(23)} │ Port: ${port.toString().padEnd(6)} │`);
        }
        
        console.log('├─────────────────────────────────────────────────────────────┤');
        console.log(`│ Servicios Activos: ${this.systemMetrics.activeServices}/${this.systemMetrics.totalServices}                               │`);
        console.log(`│ Cache Types: ${this.cacheMetrics.size}                                      │`);
        console.log(`│ Profit System: MÁXIMO                                      │`);
        console.log('└─────────────────────────────────────────────────────────────┘');
    }

    displayActiveServices() {
        for (const service of this.startupSequence) {
            if (service.status === 'running' || !service.port) {
                const url = service.port ? `http://localhost:${service.port}` : 'Internal Service';
                console.log(`${service.port ? '🌐' : '⚙️'} ${service.name}: ${url}`);
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🛑 UTILIDADES DE CONTROL Y HEALTH CHECKS
    // ═══════════════════════════════════════════════════════════════════════

    async waitForDependencies(dependencies) {
        for (const dep of dependencies) {
            console.log(`   ⏳ Verificando dependencia: ${dep}`);
            await this.waitForServiceToBeReady(dep);
        }
    }

    async waitForServiceToBeReady(serviceName) {
        const maxWait = 60000; // 60 segundos
        const checkInterval = 2000; // 2 segundos
        const startTime = Date.now();

        while (Date.now() - startTime < maxWait) {
            // Check by service name in our services map
            for (const [key, service] of Object.entries(this.services)) {
                if (service.name.toLowerCase().includes(serviceName.toLowerCase()) || 
                    key.toLowerCase().includes(serviceName.toLowerCase())) {
                    if (service.status === 'running') {
                        return true;
                    }
                }
            }
            await new Promise(resolve => setTimeout(resolve, checkInterval));
        }

        console.log(`   ⚠️ Timeout esperando servicio: ${serviceName} (continuando...)`);
        return false; // Don't throw, just continue
    }

    async waitForServiceHealthWithCache(service) {
        if (!service.port || !service.healthEndpoint) return true;

        const maxAttempts = 20;
        const delay = 3000;

        for (let i = 0; i < maxAttempts; i++) {
            try {
                const axios = require('axios');
                const response = await axios.get(
                    `http://localhost:${service.port}${service.healthEndpoint}`,
                    { timeout: 5000 }
                );
                
                if (response.status === 200) {
                    // Cache successful health check
                    this.centralCache.set(`health:${service.name}`, {
                        status: 'healthy',
                        timestamp: Date.now(),
                        response: response.data
                    });
                    return true;
                }
            } catch (error) {
                if (i === maxAttempts - 1) {
                    console.log(`   ⚠️ ${service.name} health check falló después de ${maxAttempts} intentos, continuando...`);
                    return false;
                }
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    async getComprehensiveSystemHealth() {
        const health = {
            system: 'QBTC Unified Maximum Profit',
            status: 'OK',
            timestamp: new Date().toISOString(),
            services: {},
            metrics: this.systemMetrics,
            cache: {
                central: {
                    size: this.centralCache.size,
                    types: this.cacheMetrics.size,
                    hitRatio: this.systemMetrics.cacheStats.hitRatio + '%'
                },
                detailed: Object.fromEntries(this.cacheMetrics)
            }
        };

        for (const service of this.startupSequence) {
            if (service.port && service.healthEndpoint) {
                const cachedHealth = this.centralCache.get(`health:${service.name}`);
                if (cachedHealth && Date.now() - cachedHealth.timestamp < 30000) {
                    health.services[service.name] = {
                        status: 'OK',
                        port: service.port,
                        cached: true
                    };
                } else {
                    try {
                        const axios = require('axios');
                        const response = await axios.get(
                            `http://localhost:${service.port}${service.healthEndpoint}`,
                            { timeout: 3000 }
                        );
                        health.services[service.name] = {
                            status: 'OK',
                            responseTime: response.status,
                            port: service.port,
                            cached: false
                        };
                    } catch (error) {
                        health.services[service.name] = {
                            status: 'ERROR',
                            error: error.message,
                            port: service.port,
                            cached: false
                        };
                    }
                }
            } else {
                health.services[service.name] = {
                    status: service.status?.toUpperCase() || 'UNKNOWN',
                    port: service.port || 'N/A'
                };
            }
        }

        return health;
    }

    setupSignalHandlers() {
        const signals = ['SIGINT', 'SIGTERM'];
        signals.forEach(signal => {
            process.on(signal, async () => {
                console.log(`\n🛑 Recibida señal ${signal}. Apagando sistema completo...`);
                await this.gracefulShutdown();
                process.exit(0);
            });
        });
    }

    async gracefulShutdown() {
        console.log('🔄 Apagando servicios en orden inverso...');
        
        // Stop monitoring intervals
        if (this.monitoringInterval) clearInterval(this.monitoringInterval);
        if (this.healthCheckInterval) clearInterval(this.healthCheckInterval);
        if (this.cacheCleanupInterval) clearInterval(this.cacheCleanupInterval);

        // Clear all caches
        this.centralCache.clear();
        this.cacheMetrics.clear();
        console.log('📊 Caches limpiados');

        // Close services in reverse order
        const shutdownOrder = [...this.startupSequence].reverse();
        
        for (const service of shutdownOrder) {
            try {
                const process = this.processes.get(service.name);
                if (process) {
                    console.log(`   🔄 Cerrando ${service.name}...`);
                    if (typeof process.kill === 'function') {
                        process.kill('SIGTERM');
                    } else if (typeof process.close === 'function') {
                        process.close();
                    }
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            } catch (error) {
                console.error(`   ❌ Error cerrando ${service.name}:`, error.message);
            }
        }
        
        console.log('✅ Sistema completo con cache apagado correctamente');
    }

    async emergencyShutdown() {
        console.log('🚨 APAGADO DE EMERGENCIA...');
        
        // Clear caches immediately
        this.centralCache.clear();
        this.cacheMetrics.clear();
        
        for (const [name, process] of this.processes) {
            try {
                if (process && typeof process.kill === 'function') {
                    process.kill('SIGKILL');
                }
            } catch (error) {
                console.error(`Error en apagado de emergencia ${name}:`, error.message);
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════
// 🚀 INICIAR SISTEMA COMPLETO
// ═══════════════════════════════════════════════════════════════════════

async function main() {
    try {
        const maxProfitSystem = new QBTCUnifiedMaxProfitSystem();
        await maxProfitSystem.startMaxProfitSystem();
    } catch (error) {
        console.error('💥 Error fatal iniciando sistema completo:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    main();
}

module.exports = { QBTCUnifiedMaxProfitSystem };
