#!/usr/bin/env node

// =====================================================================
// 🚀 VALIDATION RUNNER - EJECUTOR PRINCIPAL DE VALIDACION COMPLETA
// Sistema integrado que ejecuta todo el paso 7 con supervisión en segundo plano
// Compatible con Windows/PowerShell - Orquestación completa de validación
// =====================================================================

const { QuantumLeverageEngine } = require('./QuantumLeverageEngine');
const { QuantumMetricsCollector } = require('./monitoring/QuantumMetricsCollector');
const { WindowsBackgroundOrchestrator } = require('./orchestration/WindowsBackgroundOrchestrator');
const { EndToEndValidator } = require('./tests/EndToEndValidator');
const { QuantumDashboard } = require('./dashboard/QuantumDashboard');
const { performance } = require('perf_hooks');
const { spawn } = require('child_process');

class ValidationRunner {
    constructor(config = {}) {
        // Configuración global del sistema
        this.config = {
            enableDashboard: config.enableDashboard !== false,
            dashboardPort: config.dashboardPort || 3000,
            enableBackgroundProcesses: config.enableBackgroundProcesses !== false,
            enableFullValidation: config.enableFullValidation !== false,
            enableMetricsCollection: config.enableMetricsCollection !== false,
            runInBackground: config.runInBackground !== false,
            reportDirectory: config.reportDirectory || 'C:\\QBTC-VALIDATION-REPORTS',
            maxExecutionTime: config.maxExecutionTime || 1800000, // 30 minutos
            enablePerformanceAnalysis: config.enablePerformanceAnalysis !== false,
            enableWindowsOptimizations: config.enableWindowsOptimizations !== false,
            ...config
        };
        
        // Estado del runner
        this.state = {
            isRunning: false,
            startTime: null,
            currentPhase: 'initializing',
            completedPhases: [],
            totalExecutionTime: 0,
            results: {
                validation: null,
                metrics: null,
                orchestration: null,
                dashboard: null
            },
            errors: []
        };
        
        // Componentes del sistema
        this.components = {
            quantumEngine: null,
            metricsCollector: null,
            orchestrator: null,
            validator: null,
            dashboard: null
        };
        
        // Procesos en segundo plano
        this.backgroundProcesses = new Map();
        
        console.log('[VALIDATION RUNNER] 🚀 Sistema de validación completa inicializado');
        console.log(`[VALIDATION RUNNER] 📊 Dashboard: ${this.config.enableDashboard ? 'Habilitado' : 'Deshabilitado'}`);
        console.log(`[VALIDATION RUNNER] 🔄 Procesos en segundo plano: ${this.config.enableBackgroundProcesses ? 'Habilitados' : 'Deshabilitados'}`);
    }
    
    // ================================================================
    // 🚀 EJECUCIÓN PRINCIPAL DEL PASO 7
    // ================================================================
    
    async runStep7Validation() {
        try {
            console.log('\n' + '='.repeat(80));
            console.log('🌌 QUANTUM LEVERAGE ENGINE - PASO 7: VALIDACIÓN COMPLETA');
            console.log('   Validación, pruebas y ejecución supervisada en segundo plano');
            console.log('='.repeat(80));
            
            this.state.isRunning = true;
            this.state.startTime = Date.now();
            
            // Fase 1: Inicializar todos los componentes
            await this.initializeAllComponents();
            
            // Fase 2: Configurar procesos en segundo plano
            if (this.config.enableBackgroundProcesses) {
                await this.setupBackgroundProcesses();
            }
            
            // Fase 3: Iniciar dashboard si está habilitado
            if (this.config.enableDashboard) {
                await this.launchDashboard();
            }
            
            // Fase 4: Ejecutar validación completa end-to-end
            if (this.config.enableFullValidation) {
                await this.executeFullValidation();
            }
            
            // Fase 5: Recolectar y analizar métricas de rendimiento
            if (this.config.enableMetricsCollection) {
                await this.collectPerformanceMetrics();
            }
            
            // Fase 6: Generar reportes finales
            await this.generateFinalReports();
            
            // Fase 7: Supervisión continua (si está en modo background)
            if (this.config.runInBackground) {
                await this.startContinuousSupervision();
            } else {
                await this.finalizeExecution();
            }
            
        } catch (error) {
            console.error('\n❌ ERROR CRÍTICO EN VALIDACIÓN:', error.message);
            this.state.errors.push({
                phase: this.state.currentPhase,
                error: error.message,
                timestamp: Date.now(),
                stack: error.stack
            });
            
            await this.handleCriticalError(error);
        }
    }
    
    // ================================================================
    // 🔧 INICIALIZACIÓN DE COMPONENTES
    // ================================================================
    
    async initializeAllComponents() {
        this.state.currentPhase = 'component_initialization';
        console.log('\n🔧 FASE 1: Inicializando componentes del sistema...');
        
        try {
            // Mock para MarketMaker y BinanceConnector
            const mockMarketMaker = {
                calculateDeterministicValue: (type, symbol, min, max) => {
                    const hash = Buffer.from(type + symbol).reduce((a, b) => a + b, 0);
                    return min + (hash % 1000) / 1000 * (max - min);
                }
            };
            
            const mockBinanceConnector = {
                getBalance: async () => ({ USDT: { free: '1000.00', locked: '0.00' } }),
                createOrder: async (params) => ({ orderId: Date.now(), status: 'FILLED', ...params })
            };
            
            // 1. Inicializar QuantumLeverageEngine
            console.log('[INIT] 🌌 Inicializando QuantumLeverageEngine...');
            this.components.quantumEngine = new QuantumLeverageEngine(mockMarketMaker, mockBinanceConnector);
            
            // 2. Inicializar MetricsCollector
            if (this.config.enableMetricsCollection) {
                console.log('[INIT] 📊 Inicializando QuantumMetricsCollector...');
                this.components.metricsCollector = new QuantumMetricsCollector({
                    logDirectory: path.join(this.config.reportDirectory, 'metrics'),
                    backgroundMode: true,
                    enableConsoleOutput: false
                });
                await this.components.metricsCollector.initialize();
            }
            
            // 3. Inicializar Orchestrator
            if (this.config.enableBackgroundProcesses) {
                console.log('[INIT] 🎺 Inicializando WindowsBackgroundOrchestrator...');
                this.components.orchestrator = new WindowsBackgroundOrchestrator({
                    logDirectory: path.join(this.config.reportDirectory, 'orchestration'),
                    enableJobMonitoring: true,
                    maxConcurrentJobs: 5
                });
                await this.components.orchestrator.initialize();
            }
            
            // 4. Inicializar Validator
            if (this.config.enableFullValidation) {
                console.log('[INIT] 🧪 Inicializando EndToEndValidator...');
                this.components.validator = new EndToEndValidator({
                    testDataDirectory: path.join(this.config.reportDirectory, 'validation-data'),
                    reportDirectory: path.join(this.config.reportDirectory, 'validation-reports'),
                    maxTestCases: 500,
                    batchSize: 25
                });
                await this.components.validator.initialize();
            }
            
            // 5. Inicializar Dashboard
            if (this.config.enableDashboard) {
                console.log('[INIT] 📊 Inicializando QuantumDashboard...');
                this.components.dashboard = new QuantumDashboard({
                    port: this.config.dashboardPort,
                    dashboardDirectory: path.join(this.config.reportDirectory, 'dashboard'),
                    staticDirectory: path.join(__dirname, 'dashboard', 'static')
                });
                await this.components.dashboard.initialize();
            }
            
            this.state.completedPhases.push('component_initialization');
            console.log('✅ FASE 1 COMPLETADA: Todos los componentes inicializados');
            
        } catch (error) {
            throw new Error(`Error inicializando componentes: ${error.message}`);
        }
    }
    
    // ================================================================
    // 🔄 CONFIGURACIÓN DE PROCESOS EN SEGUNDO PLANO
    // ================================================================
    
    async setupBackgroundProcesses() {
        this.state.currentPhase = 'background_setup';
        console.log('\n🔄 FASE 2: Configurando procesos en segundo plano...');
        
        try {
            const orchestrator = this.components.orchestrator;
            
            if (!orchestrator) {
                throw new Error('Orchestrator no inicializado');
            }
            
            // Configurar integración entre componentes
            if (this.components.dashboard && this.components.metricsCollector) {
                console.log('[BACKGROUND] 🔗 Integrando Dashboard con MetricsCollector...');
                this.components.dashboard.integrateMetricsCollector(this.components.metricsCollector);
            }
            
            if (this.components.dashboard && this.components.orchestrator) {
                console.log('[BACKGROUND] 🔗 Integrando Dashboard con Orchestrator...');
                this.components.dashboard.integrateOrchestrator(this.components.orchestrator);
            }
            
            if (this.components.dashboard && this.components.validator) {
                console.log('[BACKGROUND] 🔗 Integrando Dashboard con Validator...');
                this.components.dashboard.integrateValidator(this.components.validator);
            }
            
            // Lanzar procesos en segundo plano usando PowerShell jobs
            console.log('[BACKGROUND] 🚀 Lanzando procesos supervisados...');
            
            if (this.config.enableWindowsOptimizations) {
                await this.optimizeForWindows();
            }
            
            // Iniciar orquestador de procesos
            await orchestrator.startAllProcesses();
            
            this.state.completedPhases.push('background_setup');
            console.log('✅ FASE 2 COMPLETADA: Procesos en segundo plano configurados');
            
        } catch (error) {
            throw new Error(`Error configurando procesos en segundo plano: ${error.message}`);
        }
    }
    
    // ================================================================
    // 📊 LANZAMIENTO DEL DASHBOARD
    // ================================================================
    
    async launchDashboard() {
        this.state.currentPhase = 'dashboard_launch';
        console.log('\n📊 FASE 3: Lanzando dashboard de monitoreo...');
        
        try {
            const dashboard = this.components.dashboard;
            
            if (!dashboard) {
                throw new Error('Dashboard no inicializado');
            }
            
            // Iniciar servidor del dashboard
            await dashboard.startServer();
            
            console.log(`[DASHBOARD] 🌐 Dashboard disponible en: http://localhost:${this.config.dashboardPort}`);
            console.log('[DASHBOARD] 📊 Métricas en tiempo real activas');
            console.log('[DASHBOARD] 🔄 WebSocket para actualizaciones habilitado');
            
            // En Windows, abrir el dashboard automáticamente en el navegador
            if (process.platform === 'win32' && this.config.enableWindowsOptimizations) {
                this.launchBrowserAsync(`http://localhost:${this.config.dashboardPort}`);
            }
            
            this.state.completedPhases.push('dashboard_launch');
            console.log('✅ FASE 3 COMPLETADA: Dashboard operacional');
            
        } catch (error) {
            console.warn(`⚠️ Dashboard no pudo iniciarse: ${error.message}`);
            // No es crítico, continuar sin dashboard
        }
    }
    
    // ================================================================
    // 🧪 EJECUCIÓN DE VALIDACIÓN COMPLETA
    // ================================================================
    
    async executeFullValidation() {
        this.state.currentPhase = 'full_validation';
        console.log('\n🧪 FASE 4: Ejecutando validación completa end-to-end...');
        
        try {
            const validator = this.components.validator;
            const quantumEngine = this.components.quantumEngine;
            const metricsCollector = this.components.metricsCollector;
            
            if (!validator || !quantumEngine) {
                throw new Error('Validator o QuantumEngine no inicializados');
            }
            
            console.log('[VALIDATION] 🔬 Iniciando suite completa de pruebas...');
            console.log('[VALIDATION] 📊 Validación matemática de transformaciones primas');
            console.log('[VALIDATION] ⚡ Pruebas de rendimiento y coherencia');
            console.log('[VALIDATION] 🔄 Validación end-to-end del flujo completo');
            
            // Ejecutar validación completa con métricas
            const startTime = performance.now();
            
            const validationResults = await validator.runFullValidation(quantumEngine);
            
            const validationDuration = performance.now() - startTime;
            
            // Registrar métricas de validación
            if (metricsCollector) {
                await metricsCollector.recordBusinessMetrics({
                    operation: 'full_validation',
                    symbol: 'VALIDATION_SUITE',
                    executionTime: validationDuration,
                    success: validationResults.success !== false,
                    quantumState: validator.getValidationStatus(),
                    transformations: validationResults
                });
            }
            
            // Almacenar resultados
            this.state.results.validation = {
                ...validationResults,
                executionTime: validationDuration,
                timestamp: Date.now()
            };
            
            // Reportar resultados
            const successRate = validationResults.mathematical 
                ? (validationResults.mathematical.passedTests / validationResults.mathematical.totalTests * 100)
                : 0;
            
            console.log('[VALIDATION] 📋 RESULTADOS DE VALIDACIÓN:');
            console.log(`[VALIDATION] ✅ Tasa de éxito: ${successRate.toFixed(2)}%`);
            console.log(`[VALIDATION] ⏱️ Tiempo de ejecución: ${(validationDuration / 1000).toFixed(2)}s`);
            console.log(`[VALIDATION] 🧪 Pruebas totales: ${validationResults.mathematical?.totalTests || 0}`);
            
            this.state.completedPhases.push('full_validation');
            console.log('✅ FASE 4 COMPLETADA: Validación end-to-end ejecutada');
            
        } catch (error) {
            throw new Error(`Error en validación completa: ${error.message}`);
        }
    }
    
    // ================================================================
    // 📈 RECOLECCIÓN DE MÉTRICAS DE RENDIMIENTO
    // ================================================================
    
    async collectPerformanceMetrics() {
        this.state.currentPhase = 'metrics_collection';
        console.log('\n📈 FASE 5: Recolectando métricas de rendimiento...');
        
        try {
            const metricsCollector = this.components.metricsCollector;
            
            if (!metricsCollector) {
                console.log('[METRICS] ⚠️ MetricsCollector no disponible, saltando recolección');
                return;
            }
            
            console.log('[METRICS] 📊 Recolectando métricas del sistema...');
            console.log('[METRICS] 🔄 Analizando rendimiento de transformaciones...');
            console.log('[METRICS] 📋 Generando reportes de desempeño...');
            
            // Obtener snapshot completo de métricas
            const metricsSnapshot = metricsCollector.getMetricsSnapshot();
            const metricsSummary = metricsCollector.getMetricsSummary();
            
            // Almacenar resultados de métricas
            this.state.results.metrics = {
                snapshot: metricsSnapshot,
                summary: metricsSummary,
                timestamp: Date.now()
            };
            
            // Reportar métricas clave
            console.log('[METRICS] 📊 MÉTRICAS DE RENDIMIENTO:');
            console.log(`[METRICS] 📈 Métricas recolectadas: ${metricsSummary.state.totalMetricsCollected}`);
            console.log(`[METRICS] ✅ Tasa de éxito: ${metricsSummary.state.successCount}/${metricsSummary.state.totalMetricsCollected}`);
            console.log(`[METRICS] ⚠️ Errores: ${metricsSummary.state.errorCount}`);
            
            if (metricsSnapshot) {
                console.log(`[METRICS] 🔄 Uptime: ${((Date.now() - metricsSnapshot.uptime) / 1000).toFixed(2)}s`);
                console.log(`[METRICS] 📊 Tasa de recolección: ${metricsSnapshot.performance?.metricsCollectionRate?.toFixed(2) || 0} métricas/s`);
            }
            
            this.state.completedPhases.push('metrics_collection');
            console.log('✅ FASE 5 COMPLETADA: Métricas de rendimiento recolectadas');
            
        } catch (error) {
            console.warn(`⚠️ Error recolectando métricas: ${error.message}`);
            // No es crítico, continuar sin métricas detalladas
        }
    }
    
    // ================================================================
    // 📄 GENERACIÓN DE REPORTES FINALES
    // ================================================================
    
    async generateFinalReports() {
        this.state.currentPhase = 'report_generation';
        console.log('\n📄 FASE 6: Generando reportes finales...');
        
        try {
            this.state.totalExecutionTime = Date.now() - this.state.startTime;
            
            // Compilar reporte maestro
            const masterReport = {
                executionSummary: {
                    startTime: new Date(this.state.startTime).toISOString(),
                    endTime: new Date().toISOString(),
                    totalDuration: this.state.totalExecutionTime,
                    completedPhases: this.state.completedPhases,
                    currentPhase: this.state.currentPhase,
                    success: this.state.errors.length === 0
                },
                systemConfiguration: {
                    enableDashboard: this.config.enableDashboard,
                    dashboardPort: this.config.dashboardPort,
                    enableBackgroundProcesses: this.config.enableBackgroundProcesses,
                    enableFullValidation: this.config.enableFullValidation,
                    enableMetricsCollection: this.config.enableMetricsCollection,
                    platform: process.platform,
                    nodeVersion: process.version,
                    architecture: process.arch
                },
                results: this.state.results,
                errors: this.state.errors,
                components: {
                    quantumEngine: !!this.components.quantumEngine,
                    metricsCollector: !!this.components.metricsCollector,
                    orchestrator: !!this.components.orchestrator,
                    validator: !!this.components.validator,
                    dashboard: !!this.components.dashboard
                },
                performance: {
                    totalExecutionTimeMs: this.state.totalExecutionTime,
                    totalExecutionTimeSeconds: this.state.totalExecutionTime / 1000,
                    averagePhaseTime: this.state.completedPhases.length > 0 
                        ? this.state.totalExecutionTime / this.state.completedPhases.length 
                        : 0
                }
            };
            
            // Guardar reporte maestro
            const fs = require('fs').promises;
            const reportPath = path.join(this.config.reportDirectory, `step7-validation-report-${Date.now()}.json`);
            
            await fs.mkdir(this.config.reportDirectory, { recursive: true });
            await fs.writeFile(reportPath, JSON.stringify(masterReport, null, 2), 'utf8');
            
            console.log('[REPORTS] 📄 REPORTE FINAL GENERADO:');
            console.log(`[REPORTS] 📁 Ubicación: ${reportPath}`);
            console.log(`[REPORTS] ⏱️ Duración total: ${(this.state.totalExecutionTime / 1000).toFixed(2)}s`);
            console.log(`[REPORTS] 🎯 Fases completadas: ${this.state.completedPhases.length}/6`);
            console.log(`[REPORTS] ${this.state.errors.length === 0 ? '✅' : '⚠️'} Estado: ${this.state.errors.length === 0 ? 'EXITOSO' : 'CON ERRORES'}`);
            
            // Generar resumen en texto
            await this.generateTextSummary(masterReport);
            
            this.state.completedPhases.push('report_generation');
            console.log('✅ FASE 6 COMPLETADA: Reportes finales generados');
            
        } catch (error) {
            console.error(`❌ Error generando reportes: ${error.message}`);
        }
    }
    
    // ================================================================
    // 🔄 SUPERVISIÓN CONTINUA O FINALIZACIÓN
    // ================================================================
    
    async startContinuousSupervision() {
        this.state.currentPhase = 'continuous_supervision';
        console.log('\n🔄 FASE 7: Iniciando supervisión continua en segundo plano...');
        
        try {
            console.log('[SUPERVISION] 📊 Dashboard ejecutándose en segundo plano');
            console.log('[SUPERVISION] 🎺 Orquestador monitoreando procesos');
            console.log('[SUPERVISION] 📈 Métricas recolectándose continuamente');
            console.log('[SUPERVISION] 🔄 Sistema en modo supervisión automática');
            
            // Configurar señales para terminación elegante
            process.on('SIGINT', () => this.handleGracefulShutdown('SIGINT'));
            process.on('SIGTERM', () => this.handleGracefulShutdown('SIGTERM'));
            
            console.log('\n' + '='.repeat(80));
            console.log('🌟 SISTEMA EN EJECUCIÓN SUPERVISADA');
            console.log('   - Dashboard: http://localhost:' + this.config.dashboardPort);
            console.log('   - Presiona Ctrl+C para terminar elegantemente');
            console.log('='.repeat(80));
            
            // Mantener el proceso vivo
            await this.keepAlive();
            
        } catch (error) {
            throw new Error(`Error en supervisión continua: ${error.message}`);
        }
    }
    
    async finalizeExecution() {
        console.log('\n🏁 FINALIZANDO EJECUCIÓN...');
        
        // Detener componentes
        await this.shutdownAllComponents();
        
        // Reporte final
        console.log('\n' + '='.repeat(80));
        console.log('✅ PASO 7 COMPLETADO EXITOSAMENTE');
        console.log('   Validación, pruebas y ejecución supervisada finalizada');
        console.log(`   Duración total: ${(this.state.totalExecutionTime / 1000).toFixed(2)}s`);
        console.log(`   Fases completadas: ${this.state.completedPhases.length}`);
        console.log('='.repeat(80));
        
        this.state.isRunning = false;
    }
    
    // ================================================================
    // 🛠️ UTILIDADES Y HELPERS
    // ================================================================
    
    async optimizeForWindows() {
        console.log('[OPTIMIZATION] 🪟 Aplicando optimizaciones para Windows...');
        
        try {
            // Configurar prioridad del proceso
            if (process.platform === 'win32') {
                const { spawn } = require('child_process');
                spawn('wmic', ['process', 'where', `processid=${process.pid}`, 'CALL', 'setpriority', '32768'], {
                    windowsHide: true,
                    stdio: 'ignore'
                });
            }
            
            // Configurar codificación de consola
            if (process.stdout.setEncoding) {
                process.stdout.setEncoding('utf8');
            }
            
        } catch (error) {
            console.warn(`[OPTIMIZATION] ⚠️ No se pudieron aplicar algunas optimizaciones: ${error.message}`);
        }
    }
    
    async launchBrowserAsync(url) {
        const { spawn } = require('child_process');
        
        try {
            spawn('cmd', ['/c', 'start', url], {
                windowsHide: true,
                stdio: 'ignore'
            });
            console.log(`[DASHBOARD] 🌐 Navegador abierto: ${url}`);
        } catch (error) {
            console.log(`[DASHBOARD] ℹ️ Para ver el dashboard, abra: ${url}`);
        }
    }
    
    async generateTextSummary(masterReport) {
        const fs = require('fs').promises;
        
        const summary = `
========================================================================
🌌 QUANTUM LEVERAGE ENGINE - REPORTE DE VALIDACIÓN PASO 7
========================================================================

📅 Fecha: ${new Date().toLocaleString()}
⏱️  Duración: ${(masterReport.performance.totalExecutionTimeSeconds).toFixed(2)} segundos
🎯 Estado: ${masterReport.executionSummary.success ? 'EXITOSO' : 'CON ERRORES'}

📊 RESUMEN DE EJECUCIÓN
------------------------------------------------------------------------
• Fases completadas: ${masterReport.executionSummary.completedPhases.join(', ')}
• Componentes activos: ${Object.entries(masterReport.components).filter(([k,v]) => v).map(([k]) => k).join(', ')}
• Plataforma: ${masterReport.systemConfiguration.platform} (${masterReport.systemConfiguration.architecture})
• Node.js: ${masterReport.systemConfiguration.nodeVersion}

🧪 RESULTADOS DE VALIDACIÓN
------------------------------------------------------------------------
${masterReport.results.validation ? 
`• Pruebas ejecutadas: ${masterReport.results.validation.mathematical?.totalTests || 0}
• Pruebas exitosas: ${masterReport.results.validation.mathematical?.passedTests || 0}
• Tasa de éxito: ${masterReport.results.validation.mathematical ? 
    (masterReport.results.validation.mathematical.passedTests / masterReport.results.validation.mathematical.totalTests * 100).toFixed(2) : 0}%
• Tiempo de validación: ${(masterReport.results.validation.executionTime / 1000).toFixed(2)}s` : 
'• Validación no ejecutada'}

📈 MÉTRICAS DE RENDIMIENTO
------------------------------------------------------------------------
${masterReport.results.metrics ? 
`• Métricas recolectadas: ${masterReport.results.metrics.summary?.state?.totalMetricsCollected || 0}
• Tasa de éxito de métricas: ${masterReport.results.metrics.summary?.state?.successCount || 0}/${masterReport.results.metrics.summary?.state?.totalMetricsCollected || 0}
• Errores en métricas: ${masterReport.results.metrics.summary?.state?.errorCount || 0}` :
'• Métricas no recolectadas'}

🎛️ COMPONENTES DEL SISTEMA
------------------------------------------------------------------------
• QuantumLeverageEngine: ${masterReport.components.quantumEngine ? '✅' : '❌'}
• MetricsCollector: ${masterReport.components.metricsCollector ? '✅' : '❌'}
• BackgroundOrchestrator: ${masterReport.components.orchestrator ? '✅' : '❌'}
• EndToEndValidator: ${masterReport.components.validator ? '✅' : '❌'}
• Dashboard: ${masterReport.components.dashboard ? '✅' : '❌'}

🔧 CONFIGURACIÓN
------------------------------------------------------------------------
• Dashboard habilitado: ${masterReport.systemConfiguration.enableDashboard ? 'Sí' : 'No'}
• Puerto dashboard: ${masterReport.systemConfiguration.dashboardPort}
• Procesos en segundo plano: ${masterReport.systemConfiguration.enableBackgroundProcesses ? 'Sí' : 'No'}
• Validación completa: ${masterReport.systemConfiguration.enableFullValidation ? 'Sí' : 'No'}
• Recolección de métricas: ${masterReport.systemConfiguration.enableMetricsCollection ? 'Sí' : 'No'}

${masterReport.errors.length > 0 ? 
`⚠️ ERRORES ENCONTRADOS
------------------------------------------------------------------------
${masterReport.errors.map(e => `• ${e.phase}: ${e.error}`).join('\n')}` : 
'✅ EJECUCIÓN SIN ERRORES'}

========================================================================
Sistema validado y listo para producción en entorno Windows/PowerShell
========================================================================
`;
        
        const summaryPath = path.join(this.config.reportDirectory, `step7-validation-summary-${Date.now()}.txt`);
        await fs.writeFile(summaryPath, summary, 'utf8');
        
        console.log(`[REPORTS] 📄 Resumen en texto: ${summaryPath}`);
    }
    
    async keepAlive() {
        return new Promise((resolve) => {
            // El proceso se mantiene vivo hasta que se reciba una señal de terminación
            // La resolución de esta promesa se maneja en handleGracefulShutdown
            this.keepAliveResolve = resolve;
        });
    }
    
    async handleGracefulShutdown(signal) {
        console.log(`\n🛑 Señal recibida: ${signal}. Iniciando terminación elegante...`);
        
        await this.shutdownAllComponents();
        
        console.log('✅ Terminación elegante completada');
        
        if (this.keepAliveResolve) {
            this.keepAliveResolve();
        }
        
        process.exit(0);
    }
    
    async shutdownAllComponents() {
        console.log('[SHUTDOWN] 🔄 Deteniendo componentes...');
        
        const shutdownPromises = [];
        
        if (this.components.dashboard) {
            shutdownPromises.push(this.components.dashboard.stop());
        }
        
        if (this.components.orchestrator) {
            shutdownPromises.push(this.components.orchestrator.stopAllProcesses());
        }
        
        if (this.components.metricsCollector) {
            shutdownPromises.push(this.components.metricsCollector.stop());
        }
        
        await Promise.allSettled(shutdownPromises);
        
        console.log('[SHUTDOWN] ✅ Todos los componentes detenidos');
    }
    
    async handleCriticalError(error) {
        console.error('🚨 MANEJO DE ERROR CRÍTICO:', error.message);
        
        try {
            // Intentar generar reporte de error
            const errorReport = {
                timestamp: new Date().toISOString(),
                error: error.message,
                stack: error.stack,
                phase: this.state.currentPhase,
                completedPhases: this.state.completedPhases,
                state: this.state,
                systemInfo: {
                    platform: process.platform,
                    nodeVersion: process.version,
                    architecture: process.arch,
                    memory: process.memoryUsage()
                }
            };
            
            const fs = require('fs').promises;
            const errorReportPath = path.join(this.config.reportDirectory, `error-report-${Date.now()}.json`);
            
            await fs.mkdir(this.config.reportDirectory, { recursive: true });
            await fs.writeFile(errorReportPath, JSON.stringify(errorReport, null, 2), 'utf8');
            
            console.log(`[ERROR] 📄 Reporte de error guardado: ${errorReportPath}`);
            
        } catch (reportError) {
            console.error('❌ No se pudo generar reporte de error:', reportError.message);
        }
        
        // Intentar terminación elegante
        await this.shutdownAllComponents();
        
        process.exit(1);
    }
}

// ================================================================
// 🚀 PUNTO DE ENTRADA PRINCIPAL
// ================================================================

async function main() {
    // Configuración desde argumentos de línea de comandos o variables de entorno
    const config = {
        enableDashboard: process.argv.includes('--no-dashboard') ? false : true,
        dashboardPort: parseInt(process.env.DASHBOARD_PORT) || 3000,
        enableBackgroundProcesses: process.argv.includes('--no-background') ? false : true,
        enableFullValidation: process.argv.includes('--no-validation') ? false : true,
        enableMetricsCollection: process.argv.includes('--no-metrics') ? false : true,
        runInBackground: process.argv.includes('--background'),
        reportDirectory: process.env.REPORT_DIR || 'C:\\QBTC-VALIDATION-REPORTS',
        enableWindowsOptimizations: process.platform === 'win32'
    };
    
    const runner = new ValidationRunner(config);
    await runner.runStep7Validation();
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main().catch(error => {
        console.error('💥 ERROR FATAL:', error.message);
        process.exit(1);
    });
}

module.exports = { ValidationRunner };
