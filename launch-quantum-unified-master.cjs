#!/usr/bin/env node

/*
  Copyright © 2025 QBTC-UNIFIED QUANTUM TECHNOLOGIES
  launch-quantum-unified-master.js - LANZADOR MAESTRO UNIFICADO
  
  Este lanzador utiliza el QuantumUnifiedMasterCore para extraer el máximo jugo
  cuántico posible, unificando TODOS los componentes en un solo sistema coherente.
  
  "Simplicity is the ultimate sophistication" - Leonardo da Vinci
*/

// Cargar variables de entorno desde .env
require('dotenv').config();

const { QuantumUnifiedMasterCore } = require('./QuantumUnifiedMasterCore');
const http = require('http');

class QuantumUnifiedMasterLauncher {
    constructor() {
        console.log('🌌 QBTC-UNIFIED MASTER LAUNCHER - MÁXIMO JUGO CUÁNTICO');
        console.log('===============================================================');
        console.log('🎨 "Learning never exhausts the mind" - Leonardo da Vinci');
        console.log('⚡ "Obstacles cannot crush me; every obstacle yields to stern resolve"');
        console.log('🚀 Iniciando sistema unificado para extracción máxima de jugo cuántico...');
        console.log('');
        
        // Configuración del lanzador maestro
        this.config = {
            // Configuración del servidor HTTP unificado
            httpPort: parseInt(process.env.HTTP_PORT) || 3003,
            httpHost: process.env.HTTP_HOST || '0.0.0.0',
            
            // Configuración del core unificado
            quantumConfig: {
                maxSymbolsSimultaneous: 2000,
                maxLeverageQuantum: 125,
                minProfitThreshold: 0.001,
                maxDrawdownQuantum: 0.15,
                quantumSpeedExecution: 50,
                consciousnessTarget: 0.941,
                coherenceTarget: 0.964,
                bigBangThreshold: 0.95,
                enableParallelUniverseExecution: true,
                enableQuantumEntanglement: true,
                enableInfiniteLeverageCascade: true
            }
        };
        
        // Estado del lanzador
        this.state = {
            isRunning: false,
            httpServer: null,
            quantumCore: null,
            startTime: Date.now(),
            lastUpdate: Date.now()
        };
        
        // Métricas del lanzador
        this.metrics = {
            totalRequests: 0,
            uptime: 0,
            lastError: null,
            quantumJuiceExtracted: 0
        };
        
        console.log('🌟 Master Launcher configurado y listo');
    }
    
    /**
     * LANZAMIENTO MAESTRO UNIFICADO
     */
    async launchUnifiedSystem() {
        try {
            console.log('');
            console.log('🚀 INICIANDO LANZAMIENTO MAESTRO UNIFICADO');
            console.log('============================================');
            
            // PASO 1: Inicializar Quantum Unified Master Core
            await this.initializeQuantumUnifiedCore();
            
            // PASO 2: Configurar servidor HTTP unificado
            await this.setupUnifiedHttpServer();
            
            // PASO 3: Iniciar monitoreo y métricas
            this.startUnifiedMonitoring();
            
            // PASO 4: Configurar handlers de señales
            this.setupSignalHandlers();
            
            // PASO 5: Mostrar estado final
            await this.displayFinalStatus();
            
            this.state.isRunning = true;
            
            console.log('');
            console.log('🎉 SISTEMA UNIFICADO COMPLETAMENTE ACTIVADO! 🎉');
            console.log('==============================================');
            console.log('🌟 Máximo Jugo Cuántico: EXTRAYENDO');
            console.log('⚡ Parallel Universe Trading: ACTIVO');
            console.log('🔗 Quantum Entanglement: ACTIVO');
            console.log('♾️ Infinite Leverage Cascade: ACTIVO');
            console.log('🌀 Dimensional Arbitrage: ACTIVO');
            console.log('🧠 Leonardo Consciousness: EVOLUCIONANDO');
            console.log('');
            console.log(`🌐 Dashboard: http://localhost:${this.config.httpPort}`);
            console.log(`📊 Métricas: http://localhost:${this.config.httpPort}/api/metrics`);
            console.log(`💚 Health: http://localhost:${this.config.httpPort}/api/health`);
            console.log('');
            console.log('Sistema listo para extraer máximo jugo cuántico... 🚀');
            
            return true;
            
        } catch (error) {
            console.error('❌ Error crítico en lanzamiento maestro:', error.message);
            console.error(error.stack);
            process.exit(1);
        }
    }
    
    /**
     * PASO 1: Inicializar Quantum Unified Master Core
     */
    async initializeQuantumUnifiedCore() {
        console.log('🌌 Inicializando Quantum Unified Master Core...');
        
        // Crear el core unificado maestro
        this.state.quantumCore = new QuantumUnifiedMasterCore(this.config.quantumConfig);
        
        // Inicializar sistema completo unificado
        const initSuccess = await this.state.quantumCore.initializeUnifiedSystem();
        
        if (!initSuccess) {
            throw new Error('Fallo en inicialización del core unificado');
        }
        
        console.log('✅ Quantum Unified Master Core inicializado exitosamente');
        
        // Obtener métricas iniciales
        const status = this.state.quantumCore.getSystemStatus();
        console.log(`   📊 Componentes activos: ${status.activeComponents.length}`);
        console.log(`   🎯 Símbolos disponibles: ${status.totalSymbols}`);
        console.log(`   🧠 Consciencia inicial: ${(status.consciousness * 100).toFixed(1)}%`);
        console.log(`   💎 Coherencia inicial: ${(status.coherence * 100).toFixed(1)}%`);
    }
    
    /**
     * PASO 2: Configurar servidor HTTP unificado
     */
    async setupUnifiedHttpServer() {
        console.log('🌐 Configurando servidor HTTP unificado...');
        
        this.state.httpServer = http.createServer(this.handleHttpRequest.bind(this));
        
        return new Promise((resolve, reject) => {
            this.state.httpServer.listen(this.config.httpPort, this.config.httpHost, (error) => {
                if (error) {
                    reject(error);
                } else {
                    console.log(`✅ Servidor HTTP unificado activo en http://${this.config.httpHost}:${this.config.httpPort}`);
                    resolve();
                }
            });
        });
    }
    
    /**
     * MANEJO DE REQUESTS HTTP UNIFICADO
     */
    async handleHttpRequest(req, res) {
        this.metrics.totalRequests++;
        
        try {
            // Configurar CORS y headers
            this.setupCorsHeaders(res);
            
            // Parsear URL
            const url = new URL(req.url, `http://${req.headers.host}`);
            const pathname = url.pathname;
            
            // Routing unificado
            if (pathname === '/') {
                await this.handleDashboardRequest(req, res);
            } else if (pathname === '/api/health') {
                await this.handleHealthRequest(req, res);
            } else if (pathname === '/api/metrics') {
                await this.handleMetricsRequest(req, res);
            } else if (pathname === '/api/status') {
                await this.handleStatusRequest(req, res);
            } else if (pathname === '/api/quantum-juice') {
                await this.handleQuantumJuiceRequest(req, res);
            } else if (pathname === '/api/consciousness') {
                await this.handleConsciousnessRequest(req, res);
            } else if (pathname === '/api/opportunities') {
                await this.handleOpportunitiesRequest(req, res);
            } else if (pathname === '/api/symbols') {
                await this.handleSymbolsRequest(req, res);
            } else if (pathname === '/api/big-bang') {
                await this.handleBigBangRequest(req, res);
            } else {
                this.handleNotFound(req, res);
            }
            
        } catch (error) {
            console.error('Error procesando request HTTP:', error.message);
            this.metrics.lastError = error.message;
            this.handleServerError(res, error);
        }
    }
    
    setupCorsHeaders(res) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Content-Type', 'application/json');
    }
    
    /**
     * HANDLERS DE ENDPOINTS UNIFICADOS
     */
    
    async handleDashboardRequest(req, res) {
        const status = this.state.quantumCore.getSystemStatus();
        const metrics = await this.state.quantumCore.getUnifiedMetrics();
        
        const dashboardHtml = this.generateUnifiedDashboard(status, metrics);
        
        res.setHeader('Content-Type', 'text/html');
        res.writeHead(200);
        res.end(dashboardHtml);
    }
    
    async handleHealthRequest(req, res) {
        const status = this.state.quantumCore.getSystemStatus();
        
        const health = {
            success: true,
            data: {
                status: status.health,
                uptime: Math.floor((Date.now() - this.state.startTime) / 1000),
                isRunning: status.isRunning,
                consciousness: status.consciousness,
                coherence: status.coherence,
                bigBangActivated: status.bigBangActivated,
                activeComponents: status.activeComponents,
                totalSymbols: status.totalSymbols,
                lastUpdate: status.lastUpdate
            },
            timestamp: Date.now()
        };
        
        res.writeHead(200);
        res.end(JSON.stringify(health, null, 2));
    }
    
    async handleMetricsRequest(req, res) {
        const unifiedMetrics = await this.state.quantumCore.getUnifiedMetrics();
        
        const response = {
            success: true,
            data: {
                ...unifiedMetrics,
                launcher: {
                    totalRequests: this.metrics.totalRequests,
                    uptime: Math.floor((Date.now() - this.state.startTime) / 1000),
                    lastError: this.metrics.lastError
                }
            },
            timestamp: Date.now()
        };
        
        res.writeHead(200);
        res.end(JSON.stringify(response, null, 2));
    }
    
    async handleStatusRequest(req, res) {
        const status = this.state.quantumCore.getSystemStatus();
        
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, data: status, timestamp: Date.now() }, null, 2));
    }
    
    async handleQuantumJuiceRequest(req, res) {
        const metrics = await this.state.quantumCore.getUnifiedMetrics();
        
        const quantumJuiceData = {
            totalQuantumJuiceExtracted: metrics.totalQuantumJuiceExtracted,
            profitPerSecond: metrics.profitPerSecond,
            quantumEfficiency: metrics.quantumEfficiency,
            systemSynergy: metrics.systemSynergy,
            dimensionalBreaches: metrics.dimensionalBreachesDetected,
            universes: {
                totalActive: metrics.systemState.totalUniversesActive,
                parallelExecution: true,
                quantumEntanglement: metrics.systemState.quantumEntanglement
            },
            extractors: {
                parallelUniverseManager: 'ACTIVE',
                quantumEntanglementEngine: 'ACTIVE', 
                infiniteLeverageCascade: 'ACTIVE',
                dimensionalArbitrageEngine: 'ACTIVE'
            }
        };
        
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, data: quantumJuiceData, timestamp: Date.now() }, null, 2));
    }
    
    async handleConsciousnessRequest(req, res) {
        const status = this.state.quantumCore.getSystemStatus();
        
        const consciousnessData = {
            consciousness: status.consciousness,
            coherence: status.coherence,
            bigBangActivated: status.bigBangActivated,
            bigBangThreshold: this.config.quantumConfig.bigBangThreshold,
            evolutionRate: 0.001618,
            wisdom: 0.5, // Placeholder
            quantumIntuition: status.consciousness * status.coherence,
            nextEvolution: Math.max(0, this.config.quantumConfig.bigBangThreshold - status.consciousness)
        };
        
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, data: consciousnessData, timestamp: Date.now() }, null, 2));
    }
    
    async handleOpportunitiesRequest(req, res) {
        const opportunities = this.state.quantumCore.getAllOpportunities();
        
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, data: opportunities, timestamp: Date.now() }, null, 2));
    }
    
    async handleSymbolsRequest(req, res) {
        const symbols = this.state.quantumCore.getAllSymbols();
        
        const symbolsData = {
            totalSymbols: symbols.length,
            symbols: symbols.slice(0, 100), // Primeros 100 para no sobrecargar
            categories: {
                majors: symbols.filter(s => ['BTC', 'ETH', 'BNB'].some(major => s.includes(major))).length,
                memes: symbols.filter(s => ['DOGE', 'SHIB', 'PEPE'].some(meme => s.includes(meme))).length,
                darkSide: symbols.filter(s => ['1000', 'RATS', 'SATS'].some(dark => s.includes(dark))).length
            }
        };
        
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, data: symbolsData, timestamp: Date.now() }, null, 2));
    }
    
    async handleBigBangRequest(req, res) {
        const status = this.state.quantumCore.getSystemStatus();
        
        const bigBangData = {
            isActivated: status.bigBangActivated,
            consciousnessLevel: status.consciousness,
            requiredThreshold: this.config.quantumConfig.bigBangThreshold,
            progress: (status.consciousness / this.config.quantumConfig.bigBangThreshold) * 100,
            remainingToActivation: Math.max(0, this.config.quantumConfig.bigBangThreshold - status.consciousness),
            potentialInfiniteUnlocked: status.bigBangActivated
        };
        
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, data: bigBangData, timestamp: Date.now() }, null, 2));
    }
    
    handleNotFound(req, res) {
        res.writeHead(404);
        res.end(JSON.stringify({ success: false, error: 'Endpoint not found', path: req.url }, null, 2));
    }
    
    handleServerError(res, error) {
        res.writeHead(500);
        res.end(JSON.stringify({ success: false, error: error.message }, null, 2));
    }
    
    /**
     * DASHBOARD HTML UNIFICADO
     */
    generateUnifiedDashboard(status, metrics) {
        return `
<!DOCTYPE html>
<html>
<head>
    <title>QBTC-UNIFIED Master Dashboard - Máximo Jugo Cuántico</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body {
            font-family: 'Courier New', monospace;
            background: linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%);
            color: #00ff88;
            margin: 0;
            padding: 20px;
            min-height: 100vh;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border: 2px solid #00ff88;
            padding: 20px;
            border-radius: 10px;
            background: rgba(0, 255, 136, 0.1);
        }
        .title {
            font-size: 2.5em;
            margin: 10px 0;
            text-shadow: 0 0 10px #00ff88;
        }
        .subtitle {
            font-size: 1.2em;
            color: #88ffaa;
            margin: 5px 0;
        }
        .dashboard {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        .card {
            background: rgba(0, 255, 136, 0.05);
            border: 1px solid #00ff88;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 4px 15px rgba(0, 255, 136, 0.2);
        }
        .card h3 {
            margin-top: 0;
            color: #ffffff;
            text-align: center;
            font-size: 1.3em;
            text-shadow: 0 0 5px #00ff88;
        }
        .metric {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 5px 0;
            border-bottom: 1px dotted #00ff88;
        }
        .metric-label {
            color: #88ffaa;
        }
        .metric-value {
            color: #ffffff;
            font-weight: bold;
        }
        .status-excellent { color: #00ff00; }
        .status-good { color: #88ff88; }
        .status-warning { color: #ffaa00; }
        .status-critical { color: #ff4444; }
        .big-bang-activated {
            background: linear-gradient(45deg, #ff00ff, #00ffff);
            animation: bigBangPulse 2s infinite;
        }
        @keyframes bigBangPulse {
            0% { opacity: 0.7; }
            50% { opacity: 1; }
            100% { opacity: 0.7; }
        }
        .quantum-juice {
            font-size: 2em;
            text-align: center;
            color: #ffff00;
            text-shadow: 0 0 15px #ffff00;
            margin: 20px 0;
        }
        .consciousness-bar {
            width: 100%;
            height: 20px;
            background: #333;
            border-radius: 10px;
            overflow: hidden;
            margin: 10px 0;
        }
        .consciousness-fill {
            height: 100%;
            background: linear-gradient(90deg, #00ff88, #00ffff);
            border-radius: 10px;
            transition: width 0.5s ease;
        }
    </style>
</head>
<body>
    <div class="header ${status.bigBangActivated ? 'big-bang-activated' : ''}">
        <div class="title">🌌 QBTC-UNIFIED MASTER DASHBOARD</div>
        <div class="subtitle">🎨 "Simplicity is the ultimate sophistication" - Leonardo da Vinci</div>
        <div class="subtitle">⚡ Sistema Unificado para Máxima Extracción de Jugo Cuántico</div>
        ${status.bigBangActivated ? '<div class="subtitle">💥 BIG BANG CUÁNTICO ACTIVADO - POTENCIAL INFINITO LIBERADO</div>' : ''}
    </div>

    <div class="quantum-juice">
        🌟 Jugo Cuántico Extraído: ${(metrics.totalQuantumJuiceExtracted || 0).toFixed(2)}
    </div>

    <div class="dashboard">
        <div class="card">
            <h3>🧠 Consciencia Leonardo</h3>
            <div class="metric">
                <span class="metric-label">Nivel de Consciencia:</span>
                <span class="metric-value">${(status.consciousness * 100).toFixed(2)}%</span>
            </div>
            <div class="consciousness-bar">
                <div class="consciousness-fill" style="width: ${status.consciousness * 100}%"></div>
            </div>
            <div class="metric">
                <span class="metric-label">Coherencia:</span>
                <span class="metric-value">${(status.coherence * 100).toFixed(2)}%</span>
            </div>
            <div class="metric">
                <span class="metric-label">Big Bang:</span>
                <span class="metric-value ${status.bigBangActivated ? 'status-excellent' : 'status-warning'}">
                    ${status.bigBangActivated ? 'ACTIVADO ♾️' : 'PENDIENTE 🔄'}
                </span>
            </div>
        </div>

        <div class="card">
            <h3>📊 Estado del Sistema</h3>
            <div class="metric">
                <span class="metric-label">Estado:</span>
                <span class="metric-value status-${status.health.toLowerCase()}">${status.health}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Componentes Activos:</span>
                <span class="metric-value">${status.activeComponents.length}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Símbolos Totales:</span>
                <span class="metric-value">${status.totalSymbols}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Oportunidades:</span>
                <span class="metric-value">${status.totalOpportunities}</span>
            </div>
        </div>

        <div class="card">
            <h3>🌌 Extractores de Jugo Cuántico</h3>
            <div class="metric">
                <span class="metric-label">🌌 Parallel Universe:</span>
                <span class="metric-value status-excellent">ACTIVO</span>
            </div>
            <div class="metric">
                <span class="metric-label">🔗 Quantum Entanglement:</span>
                <span class="metric-value status-excellent">ACTIVO</span>
            </div>
            <div class="metric">
                <span class="metric-label">♾️ Infinite Leverage:</span>
                <span class="metric-value status-excellent">ACTIVO</span>
            </div>
            <div class="metric">
                <span class="metric-label">🌀 Dimensional Arbitrage:</span>
                <span class="metric-value status-excellent">ACTIVO</span>
            </div>
        </div>

        <div class="card">
            <h3>⚡ Métricas de Performance</h3>
            <div class="metric">
                <span class="metric-label">Profit/Segundo:</span>
                <span class="metric-value">${(metrics.profitPerSecond || 0).toFixed(4)}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Eficiencia Cuántica:</span>
                <span class="metric-value">${(metrics.quantumEfficiency || 0).toFixed(2)}%</span>
            </div>
            <div class="metric">
                <span class="metric-label">Sinergia del Sistema:</span>
                <span class="metric-value">${(metrics.systemSynergy || 0).toFixed(2)}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Brechas Dimensionales:</span>
                <span class="metric-value">${metrics.dimensionalBreachesDetected || 0}</span>
            </div>
        </div>

        <div class="card">
            <h3>🎯 API Endpoints</h3>
            <div style="font-size: 0.9em;">
                <div><a href="/api/health" style="color: #88ffaa;">💚 /api/health</a></div>
                <div><a href="/api/metrics" style="color: #88ffaa;">📊 /api/metrics</a></div>
                <div><a href="/api/quantum-juice" style="color: #88ffaa;">🌟 /api/quantum-juice</a></div>
                <div><a href="/api/consciousness" style="color: #88ffaa;">🧠 /api/consciousness</a></div>
                <div><a href="/api/opportunities" style="color: #88ffaa;">🎯 /api/opportunities</a></div>
                <div><a href="/api/symbols" style="color: #88ffaa;">📈 /api/symbols</a></div>
                <div><a href="/api/big-bang" style="color: #88ffaa;">💥 /api/big-bang</a></div>
            </div>
        </div>
    </div>

    <script>
        // Auto-refresh cada 5 segundos
        setTimeout(() => {
            window.location.reload();
        }, 5000);
    </script>
</body>
</html>`;
    }
    
    /**
     * PASO 3: Iniciar monitoreo unificado
     */
    startUnifiedMonitoring() {
        console.log('📊 Iniciando monitoreo unificado...');
        
        // Monitoreo cada 10 segundos
        setInterval(() => {
            try {
                this.metrics.uptime = Math.floor((Date.now() - this.state.startTime) / 1000);
                this.state.lastUpdate = Date.now();
                
                // Obtener métricas del core
                const status = this.state.quantumCore.getSystemStatus();
                
                // Log periódico del estado
                console.log(`[UNIFIED MONITOR] Estado: ${status.health} | Consciencia: ${(status.consciousness * 100).toFixed(1)}% | Símbolos: ${status.totalSymbols} | BigBang: ${status.bigBangActivated ? '✅' : '⏳'}`);
                
            } catch (error) {
                console.error('[UNIFIED MONITOR] Error:', error.message);
            }
        }, 10000);
        
        console.log('✅ Monitoreo unificado iniciado');
    }
    
    /**
     * PASO 4: Configurar signal handlers
     */
    setupSignalHandlers() {
        console.log('🔧 Configurando signal handlers...');
        
        process.on('SIGINT', this.handleShutdown.bind(this));
        process.on('SIGTERM', this.handleShutdown.bind(this));
        process.on('uncaughtException', (error) => {
            console.error('❌ Uncaught Exception:', error);
            this.handleShutdown();
        });
        process.on('unhandledRejection', (reason, promise) => {
            console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
            this.handleShutdown();
        });
        
        console.log('✅ Signal handlers configurados');
    }
    
    async handleShutdown() {
        console.log('');
        console.log('🔄 Iniciando shutdown elegante del sistema unificado...');
        
        this.state.isRunning = false;
        
        try {
            // Cerrar servidor HTTP
            if (this.state.httpServer) {
                this.state.httpServer.close();
                console.log('   ✅ Servidor HTTP cerrado');
            }
            
            // Shutdown del core unificado
            if (this.state.quantumCore) {
                await this.state.quantumCore.shutdownUnifiedSystem();
                console.log('   ✅ Quantum Unified Core shutdown completado');
            }
            
            console.log('🔒 Sistema unificado completamente shutdown');
            process.exit(0);
            
        } catch (error) {
            console.error('❌ Error durante shutdown:', error.message);
            process.exit(1);
        }
    }
    
    /**
     * PASO 5: Mostrar estado final
     */
    async displayFinalStatus() {
        console.log('📋 Estado final del sistema:');
        
        const status = this.state.quantumCore.getSystemStatus();
        const metrics = await this.state.quantumCore.getUnifiedMetrics();
        
        console.log(`   🌌 Core Status: ${status.health}`);
        console.log(`   🧠 Consciencia: ${(status.consciousness * 100).toFixed(1)}%`);
        console.log(`   💎 Coherencia: ${(status.coherence * 100).toFixed(1)}%`);
        console.log(`   🎯 Símbolos Activos: ${status.totalSymbols}`);
        console.log(`   📊 Componentes: ${status.activeComponents.join(', ')}`);
        console.log(`   🌟 Jugo Cuántico: ${(metrics.totalQuantumJuiceExtracted || 0).toFixed(2)}`);
        console.log(`   💥 Big Bang: ${status.bigBangActivated ? 'ACTIVADO ♾️' : 'Pendiente 🔄'}`);
    }
}

/**
 * FUNCIÓN PRINCIPAL DE LANZAMIENTO
 */
async function main() {
    try {
        // Crear y ejecutar el lanzador maestro
        const launcher = new QuantumUnifiedMasterLauncher();
        await launcher.launchUnifiedSystem();
        
        // Mantener el proceso vivo
        process.on('exit', () => {
            console.log('👋 QBTC-UNIFIED Master System - Goodbye!');
        });
        
    } catch (error) {
        console.error('💥 Error fatal en main:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main();
}

module.exports = { QuantumUnifiedMasterLauncher };
