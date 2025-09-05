#!/usr/bin/env node
/**
 * QBTC-UNIFIED - PORT MANAGEMENT & ANTI-CONFLICT SYSTEM
 * =====================================================
 * 
 * Sistema de gestión de puertos con bandas anti-conflictos
 * Evita colisiones y optimiza el despliegue de servicios
 * 
 * "La simplicidad es la máxima sofisticación" - Leonardo da Vinci
 */

require('dotenv').config();
const net = require('net');

class PortManager {
    constructor() {
        // BANDAS DE PUERTOS ANTI-CONFLICTOS
        this.PORT_BANDS = {
            // BANDA LEONARDO CORE (30xx) - Servicios principales
            LEONARDO_CORE: {
                range: [3000, 3099],
                services: {
                    'LEONARDO_MAIN_DASHBOARD': 3003,      // ⭐ Dashboard principal
                    'LEONARDO_API': 3004,                 // API REST principal  
                    'LEONARDO_WEBSOCKET': 3005,           // WebSocket streams
                    'LEONARDO_BACKUP_API': 3006,          // API backup
                    'LEONARDO_ADMIN': 3007,               // Panel admin
                    'LEONARDO_DEV_SERVER': 3008           // Servidor desarrollo
                }
            },
            
            // BANDA QUANTUM ENGINES (90xx) - Motores cuánticos
            QUANTUM_ENGINES: {
                range: [9000, 9199], 
                services: {
                    'QUANTUM_CORE_ENGINE': 9090,          // ⚡ Motor principal cuántico
                    'QUANTUM_MARKET_MAKER': 9091,         // Market maker
                    'QUANTUM_DECISION_ENGINE': 9092,      // Motor de decisión  
                    'QUANTUM_CACHE_SERVER': 9093,         // Servidor de caché
                    'QUANTUM_STREAM_PROCESSOR': 9094,     // Procesador de streams
                    'QUANTUM_BACKUP_ENGINE': 9095         // Motor backup
                }
            },
            
            // BANDA MONITORING (91xx) - Monitoreo y métricas
            MONITORING: {
                range: [9100, 9199],
                services: {
                    'METRICS_SERVER': 9100,               // 📊 Métricas Prometheus
                    'HEALTH_CHECK': 9101,                 // Health checks
                    'PERFORMANCE_MONITOR': 9102,          // Monitor performance
                    'LOG_AGGREGATOR': 9103,               // Agregador de logs
                    'ALERT_MANAGER': 9104,                // Gestor de alertas
                    'GRAFANA_CUSTOM': 9105                // Grafana personalizado
                }
            },
            
            // BANDA TRADING ENGINES (92xx) - Motores de trading
            TRADING_ENGINES: {
                range: [9200, 9299],
                services: {
                    'TRADING_MAIN_ENGINE': 9200,          // 🚀 Motor principal trading
                    'TRADING_EXECUTION': 9201,            // Motor ejecución
                    'RISK_MANAGER': 9202,                 // Gestor de riesgo
                    'POSITION_MANAGER': 9203,             // Gestor de posiciones
                    'ORDER_ROUTER': 9204,                 // Enrutador órdenes
                    'TRADING_ANALYTICS': 9205             // Analytics de trading
                }
            },
            
            // BANDA DATA SERVICES (93xx) - Servicios de datos
            DATA_SERVICES: {
                range: [9300, 9399],
                services: {
                    'MARKET_DATA_FEED': 9300,             // 📡 Feed de datos
                    'BINANCE_CONNECTOR': 9301,            // Conector Binance
                    'DATA_PROCESSOR': 9302,               // Procesador datos
                    'DATA_STORAGE': 9303,                 // Almacenamiento
                    'BACKUP_DATA': 9304,                  // Backup de datos
                    'DATA_ANALYTICS': 9305                // Analytics de datos
                }
            },
            
            // BANDA LEGACY SYSTEMS (180xx) - Sistemas legacy
            LEGACY_SYSTEMS: {
                range: [18000, 18099],
                services: {
                    'UNIFIED_SERVER_LEGACY': 18020,       // Servidor unificado legacy
                    'OLD_QUANTUM_ENGINE': 18021,          // Motor cuántico legacy
                    'LEGACY_API': 18022,                  // API legacy
                    'MIGRATION_SERVICE': 18023            // Servicio migración
                }
            },
            
            // BANDA DEVELOPMENT (40xx) - Desarrollo y testing
            DEVELOPMENT: {
                range: [4000, 4099],
                services: {
                    'DEV_MAIN_SERVER': 4000,              // Servidor desarrollo
                    'DEV_API_SERVER': 4001,               // API desarrollo
                    'TEST_SUITE': 4002,                   // Suite de tests
                    'MOCK_BINANCE': 4003,                 // Mock Binance API
                    'DEBUG_SERVER': 4004,                 // Servidor debug
                    'QUANTUM_EDGE_DEV': 4005              // Quantum Edge desarrollo
                }
            }
        };
        
        // CONFIGURACIÓN ACTUAL DEL SISTEMA
        this.CURRENT_CONFIG = {
            'LEONARDO_PORT': parseInt(process.env.LEONARDO_PORT) || 3003,
            'QUANTUM_PORT': parseInt(process.env.QUANTUM_PORT) || 9090,
            'METRICS_PORT': parseInt(process.env.METRICS_PORT) || 9100,
            'UNIFIED_SERVER_PORT': parseInt(process.env.UNIFIED_SERVER_PORT) || 18020,
            'WS_PORT': parseInt(process.env.WS_PORT) || 3004
        };
        
        // PUERTOS DETECTADOS EN EL SISTEMA
        this.DETECTED_PORTS = [];
    }
    
    /**
     * Analizar conflictos de puertos en el sistema
     */
    async analyzePortConflicts() {
        console.log('🔍 QBTC-UNIFIED PORT CONFLICT ANALYSIS');
        console.log('======================================');
        console.log('🎨 Leonardo da Vinci Port Management System');
        console.log('⚡ Analyzing port conflicts and optimization...');
        console.log('');
        
        // 1. Verificar puertos actuales
        await this.checkCurrentPorts();
        
        // 2. Detectar conflictos
        await this.detectConflicts();
        
        // 3. Generar configuración optimizada
        await this.generateOptimizedConfig();
        
        // 4. Mostrar recomendaciones
        this.displayRecommendations();
    }
    
    /**
     * Verificar estado de puertos actuales
     */
    async checkCurrentPorts() {
        console.log('🔍 Checking Current Port Configuration...');
        
        for (const [service, port] of Object.entries(this.CURRENT_CONFIG)) {
            const isOpen = await this.isPortOpen(port);
            const inUse = await this.isPortInUse(port);
            
            const status = inUse ? '🔴 IN USE' : (isOpen ? '🟢 AVAILABLE' : '🟡 UNKNOWN');
            console.log(`   ${service}: ${port} - ${status}`);
            
            this.DETECTED_PORTS.push({
                service,
                port,
                inUse,
                isOpen
            });
        }
        
        console.log('   🔍 Current ports checked');
    }
    
    /**
     * Detectar conflictos de puertos
     */
    async detectConflicts() {
        console.log('⚠️ Detecting Port Conflicts...');
        
        let conflicts = [];
        
        // Verificar colisiones entre servicios
        const usedPorts = this.DETECTED_PORTS.filter(p => p.inUse);
        const duplicates = usedPorts.reduce((acc, port) => {
            const existing = acc.find(p => p.port === port.port);
            if (existing) {
                existing.services.push(port.service);
            } else {
                acc.push({ port: port.port, services: [port.service] });
            }
            return acc;
        }, []).filter(p => p.services.length > 1);
        
        if (duplicates.length > 0) {
            console.log('   ❌ Port conflicts detected:');
            duplicates.forEach(conflict => {
                console.log(`      Port ${conflict.port}: ${conflict.services.join(', ')}`);
                conflicts.push(conflict);
            });
        } else {
            console.log('   ✅ No port conflicts detected');
        }
        
        // Verificar bandas de puertos
        this.checkPortBandConflicts();
        
        this.conflicts = conflicts;
    }
    
    /**
     * Verificar conflictos en bandas de puertos
     */
    checkPortBandConflicts() {
        console.log('📊 Checking Port Band Allocation...');
        
        for (const [bandName, band] of Object.entries(this.PORT_BANDS)) {
            const [minPort, maxPort] = band.range;
            const conflicts = this.DETECTED_PORTS.filter(p => 
                p.port >= minPort && p.port <= maxPort && 
                !Object.values(band.services).includes(p.port)
            );
            
            if (conflicts.length > 0) {
                console.log(`   ⚠️ ${bandName} band conflicts:`);
                conflicts.forEach(conflict => {
                    console.log(`      ${conflict.service} (${conflict.port}) outside designated band`);
                });
            } else {
                console.log(`   ✅ ${bandName} band: No conflicts`);
            }
        }
    }
    
    /**
     * Generar configuración optimizada
     */
    async generateOptimizedConfig() {
        console.log('🎯 Generating Optimized Port Configuration...');
        
        this.optimizedConfig = {
            // LEONARDO CORE - Banda 30xx
            'LEONARDO_PORT': 3003,           // Dashboard principal
            'WS_PORT': 3005,                 // WebSocket streams  
            'LEONARDO_API_PORT': 3004,       // API REST
            'LEONARDO_ADMIN_PORT': 3007,     // Panel admin
            
            // QUANTUM ENGINES - Banda 90xx
            'QUANTUM_PORT': 9090,            // Motor principal cuántico
            'QUANTUM_MARKET_MAKER_PORT': 9091, // Market maker
            'QUANTUM_DECISION_PORT': 9092,   // Motor de decisión
            'QUANTUM_CACHE_PORT': 9093,      // Servidor de caché
            
            // MONITORING - Banda 91xx
            'METRICS_PORT': 9100,            // Métricas Prometheus
            'HEALTH_CHECK_PORT': 9101,       // Health checks
            'PERFORMANCE_MONITOR_PORT': 9102, // Monitor performance
            
            // TRADING ENGINES - Banda 92xx
            'TRADING_ENGINE_PORT': 9200,     // Motor principal trading
            'TRADING_EXECUTION_PORT': 9201,  // Motor ejecución
            'RISK_MANAGER_PORT': 9202,       // Gestor de riesgo
            
            // DATA SERVICES - Banda 93xx
            'MARKET_DATA_PORT': 9300,        // Feed de datos
            'BINANCE_CONNECTOR_PORT': 9301,  // Conector Binance
            'DATA_PROCESSOR_PORT': 9302,     // Procesador datos
            
            // LEGACY SYSTEMS - Banda 180xx
            'UNIFIED_SERVER_PORT': 18020,    // Servidor unificado legacy
            
            // DEVELOPMENT - Banda 40xx  
            'DEV_SERVER_PORT': 4000,         // Servidor desarrollo
            'TEST_SUITE_PORT': 4002          // Suite de tests
        };
        
        console.log('   🎯 Optimized configuration generated');
    }
    
    /**
     * Verificar si un puerto está abierto
     */
    async isPortOpen(port) {
        return new Promise((resolve) => {
            const server = net.createServer();
            
            server.listen(port, () => {
                server.close(() => {
                    resolve(true); // Puerto disponible
                });
            });
            
            server.on('error', () => {
                resolve(false); // Puerto no disponible
            });
        });
    }
    
    /**
     * Verificar si un puerto está en uso
     */
    async isPortInUse(port) {
        return new Promise((resolve) => {
            const socket = new net.Socket();
            
            socket.setTimeout(1000);
            
            socket.on('connect', () => {
                socket.destroy();
                resolve(true); // Puerto en uso
            });
            
            socket.on('timeout', () => {
                socket.destroy();
                resolve(false); // Puerto no en uso
            });
            
            socket.on('error', () => {
                resolve(false); // Puerto no en uso
            });
            
            socket.connect(port, 'localhost');
        });
    }
    
    /**
     * Mostrar recomendaciones
     */
    displayRecommendations() {
        console.log('');
        console.log('📋 PORT OPTIMIZATION RECOMMENDATIONS');
        console.log('===================================');
        
        // Mostrar configuración optimizada
        console.log('🎯 OPTIMIZED PORT CONFIGURATION:');
        console.log('');
        
        // Leonardo Core
        console.log('📂 LEONARDO CORE (30xx band):');
        console.log(`   LEONARDO_PORT=${this.optimizedConfig.LEONARDO_PORT}           # 🌟 Main Dashboard`);
        console.log(`   LEONARDO_API_PORT=${this.optimizedConfig.LEONARDO_API_PORT}       # 📡 REST API`);
        console.log(`   WS_PORT=${this.optimizedConfig.WS_PORT}                     # 🔗 WebSocket`);
        console.log(`   LEONARDO_ADMIN_PORT=${this.optimizedConfig.LEONARDO_ADMIN_PORT}     # ⚙️ Admin Panel`);
        console.log('');
        
        // Quantum Engines
        console.log('📂 QUANTUM ENGINES (90xx band):');
        console.log(`   QUANTUM_PORT=${this.optimizedConfig.QUANTUM_PORT}                  # ⚡ Main Quantum Engine`);
        console.log(`   QUANTUM_MARKET_MAKER_PORT=${this.optimizedConfig.QUANTUM_MARKET_MAKER_PORT}   # 🎯 Market Maker`);
        console.log(`   QUANTUM_DECISION_PORT=${this.optimizedConfig.QUANTUM_DECISION_PORT}       # 🧠 Decision Engine`);
        console.log(`   QUANTUM_CACHE_PORT=${this.optimizedConfig.QUANTUM_CACHE_PORT}          # 💾 Cache Server`);
        console.log('');
        
        // Monitoring
        console.log('📂 MONITORING (91xx band):');
        console.log(`   METRICS_PORT=${this.optimizedConfig.METRICS_PORT}                 # 📊 Prometheus Metrics`);
        console.log(`   HEALTH_CHECK_PORT=${this.optimizedConfig.HEALTH_CHECK_PORT}           # 💚 Health Checks`);
        console.log(`   PERFORMANCE_MONITOR_PORT=${this.optimizedConfig.PERFORMANCE_MONITOR_PORT}  # 📈 Performance`);
        console.log('');
        
        // Trading Engines
        console.log('📂 TRADING ENGINES (92xx band):');
        console.log(`   TRADING_ENGINE_PORT=${this.optimizedConfig.TRADING_ENGINE_PORT}        # 🚀 Main Trading Engine`);
        console.log(`   TRADING_EXECUTION_PORT=${this.optimizedConfig.TRADING_EXECUTION_PORT}     # ⚡ Execution Engine`);
        console.log(`   RISK_MANAGER_PORT=${this.optimizedConfig.RISK_MANAGER_PORT}          # 🛡️ Risk Manager`);
        console.log('');
        
        // Data Services
        console.log('📂 DATA SERVICES (93xx band):');
        console.log(`   MARKET_DATA_PORT=${this.optimizedConfig.MARKET_DATA_PORT}            # 📡 Market Data Feed`);
        console.log(`   BINANCE_CONNECTOR_PORT=${this.optimizedConfig.BINANCE_CONNECTOR_PORT}     # 🔗 Binance Connector`);
        console.log(`   DATA_PROCESSOR_PORT=${this.optimizedConfig.DATA_PROCESSOR_PORT}        # 🔄 Data Processor`);
        console.log('');
        
        // Generar archivo .env actualizado
        this.generateEnvFile();
        
        console.log('🚀 NEXT STEPS:');
        console.log('   1. ✅ Review the optimized configuration above');
        console.log('   2. 📝 Update .env file with new port assignments');
        console.log('   3. 🔄 Restart all services with new configuration');
        console.log('   4. ✅ Verify no port conflicts exist');
        console.log('');
        console.log('💡 BENEFITS:');
        console.log('   ✅ Zero port conflicts between services');
        console.log('   ✅ Logical port band organization');
        console.log('   ✅ Easy service identification by port range');
        console.log('   ✅ Scalable port allocation strategy');
        console.log('   ✅ Development and production separation');
        console.log('');
        console.log('🎨 "Simplicity is the ultimate sophistication" - Leonardo da Vinci');
    }
    
    /**
     * Generar archivo .env actualizado
     */
    generateEnvFile() {
        console.log('📝 Generating optimized .env configuration...');
        
        const envContent = `# ===============================================
# QBTC-UNIFIED PORT CONFIGURATION - OPTIMIZED
# ===============================================
# Generated by Port Management System
# "La simplicidad es la máxima sofisticación"

# ===============================================
# LEONARDO CORE SERVICES (30xx band)
# ===============================================
LEONARDO_HOST=localhost
LEONARDO_PORT=${this.optimizedConfig.LEONARDO_PORT}           # 🌟 Main Dashboard
LEONARDO_API_PORT=${this.optimizedConfig.LEONARDO_API_PORT}       # 📡 REST API
WS_PORT=${this.optimizedConfig.WS_PORT}                     # 🔗 WebSocket Streams
LEONARDO_ADMIN_PORT=${this.optimizedConfig.LEONARDO_ADMIN_PORT}     # ⚙️ Admin Panel

# ===============================================
# QUANTUM ENGINES (90xx band)
# ===============================================
QUANTUM_PORT=${this.optimizedConfig.QUANTUM_PORT}                  # ⚡ Main Quantum Engine
QUANTUM_MARKET_MAKER_PORT=${this.optimizedConfig.QUANTUM_MARKET_MAKER_PORT}   # 🎯 Market Maker
QUANTUM_DECISION_PORT=${this.optimizedConfig.QUANTUM_DECISION_PORT}       # 🧠 Decision Engine
QUANTUM_CACHE_PORT=${this.optimizedConfig.QUANTUM_CACHE_PORT}          # 💾 Cache Server

# ===============================================
# MONITORING SERVICES (91xx band)
# ===============================================
METRICS_PORT=${this.optimizedConfig.METRICS_PORT}                 # 📊 Prometheus Metrics
METRICS_HOST=0.0.0.0
HEALTH_CHECK_PORT=${this.optimizedConfig.HEALTH_CHECK_PORT}           # 💚 Health Checks
PERFORMANCE_MONITOR_PORT=${this.optimizedConfig.PERFORMANCE_MONITOR_PORT}  # 📈 Performance Monitor

# ===============================================
# TRADING ENGINES (92xx band)
# ===============================================
TRADING_ENGINE_PORT=${this.optimizedConfig.TRADING_ENGINE_PORT}        # 🚀 Main Trading Engine
TRADING_EXECUTION_PORT=${this.optimizedConfig.TRADING_EXECUTION_PORT}     # ⚡ Execution Engine
RISK_MANAGER_PORT=${this.optimizedConfig.RISK_MANAGER_PORT}          # 🛡️ Risk Manager

# ===============================================
# DATA SERVICES (93xx band)
# ===============================================
MARKET_DATA_PORT=${this.optimizedConfig.MARKET_DATA_PORT}            # 📡 Market Data Feed
BINANCE_CONNECTOR_PORT=${this.optimizedConfig.BINANCE_CONNECTOR_PORT}     # 🔗 Binance Connector
DATA_PROCESSOR_PORT=${this.optimizedConfig.DATA_PROCESSOR_PORT}        # 🔄 Data Processor

# ===============================================
# LEGACY SYSTEMS (180xx band)
# ===============================================
UNIFIED_SERVER_PORT=${this.optimizedConfig.UNIFIED_SERVER_PORT}        # Legacy Unified Server

# ===============================================
# DEVELOPMENT SERVICES (40xx band)
# ===============================================
DEV_SERVER_PORT=${this.optimizedConfig.DEV_SERVER_PORT}              # 🔧 Development Server
TEST_SUITE_PORT=${this.optimizedConfig.TEST_SUITE_PORT}              # 🧪 Test Suite

# ===============================================
# ANTI-CONFLICT CONFIGURATION
# ===============================================
PORT_MANAGEMENT_ENABLED=true           # Enable port management
PORT_CONFLICT_CHECK=true               # Auto-check conflicts on start
PORT_AUTO_INCREMENT=true               # Auto-increment on conflict
PORT_RETRY_ATTEMPTS=5                  # Retry attempts for port binding

# ===============================================
# BAND RESERVATIONS
# ===============================================
LEONARDO_BAND_START=3000              # Leonardo Core band start
QUANTUM_BAND_START=9000               # Quantum Engines band start  
MONITOR_BAND_START=9100               # Monitoring band start
TRADING_BAND_START=9200               # Trading Engines band start
DATA_BAND_START=9300                  # Data Services band start
LEGACY_BAND_START=18000               # Legacy Systems band start
DEV_BAND_START=4000                   # Development band start

# ===============================================
# PORT HEALTH MONITORING
# ===============================================
PORT_HEALTH_CHECK_INTERVAL=30000      # Health check every 30s
PORT_USAGE_MONITORING=true            # Monitor port usage
PORT_AVAILABILITY_LOG=true            # Log port availability
`;
        
        // Escribir archivo de configuración optimizada
        require('fs').writeFileSync('.env.optimized', envContent);
        
        console.log('   📝 Optimized configuration written to: .env.optimized');
        console.log('   💡 Review and replace .env with .env.optimized when ready');
    }
    
    /**
     * Obtener configuración de servicios
     */
    getServiceConfig() {
        return {
            services: Object.entries(this.optimizedConfig).map(([name, port]) => ({
                name: name.replace('_PORT', '').toLowerCase(),
                port,
                url: `http://localhost:${port}`,
                band: this.getPortBand(port)
            })),
            bands: this.PORT_BANDS
        };
    }
    
    /**
     * Obtener banda de un puerto
     */
    getPortBand(port) {
        for (const [bandName, band] of Object.entries(this.PORT_BANDS)) {
            if (port >= band.range[0] && port <= band.range[1]) {
                return bandName;
            }
        }
        return 'UNKNOWN';
    }
}

// Ejecutar análisis si el archivo es llamado directamente
if (require.main === module) {
    const portManager = new PortManager();
    portManager.analyzePortConflicts().catch(error => {
        console.error('💥 Port analysis failed:', error.message);
        process.exit(1);
    });
}

module.exports = PortManager;
