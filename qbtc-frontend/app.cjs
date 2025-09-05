/**
 * QBTC UNIFIED - Aplicación Frontend Unificada
 * Lógica principal para la interfaz de usuario unificada
 */

// Importar constantes compartidas
const {
    SYSTEM,
    NETWORK,
    LEONARDO,
    QUANTUM,
    TRADING,
    FUNDS,
    BINANCE,
    LOGGING
} = require('../qbtc-core/shared/constants/QBTCConstants.js');

// Clase principal de la aplicación
class QBTCUnifiedApp {
    constructor() {
        this.apiBaseUrl = `http://${NETWORK.DEFAULT_HOST}:${NETWORK.API_PORT}`;
        this.wsUrl = `ws://${NETWORK.DEFAULT_HOST}:${NETWORK.API_PORT}`;
        this.isConnected = false;
        this.metrics = {
            consciousness: LEONARDO.CONSCIOUSNESS.BASE_LEVEL,
            quantumCoherence: QUANTUM.STATES.COHERENCE,
            tradingVolume: 0,
            profitLoss: 0
        };
        // Resumen de edge cuántico de Futuros (microestructura)
        this.edgeSummary = null;

        this.initializeEventListeners();
        this.initializeWebSocket();
        this.initializeQuantumCube();
        this.updateUI();
    }

    // Inicializar listeners de eventos
    initializeEventListeners() {
        // Eventos de navegación
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.handleNavigation(e.target.dataset.section);
            });
        });

        // Eventos de trading
        document.getElementById('start-trading').addEventListener('click', () => {
            this.startTrading();
        });

        document.getElementById('stop-trading').addEventListener('click', () => {
            this.stopTrading();
        });

        // Eventos de configuración
        document.getElementById('save-config').addEventListener('click', () => {
            this.saveConfiguration();
        });

        // Eventos de métricas
        document.getElementById('refresh-metrics').addEventListener('click', () => {
            this.refreshMetrics();
        });
    }

    // Manejar navegación entre secciones
    handleNavigation(section) {
        // Ocultar todas las secciones
        document.querySelectorAll('.section').forEach(s => {
            s.classList.remove('active');
        });

        // Mostrar sección seleccionada
        document.getElementById(section).classList.add('active');

        // Actualizar navegación activa
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Actualizar contenido específico de la sección
        this.updateSectionContent(section);
    }

    // Actualizar contenido de la sección
    updateSectionContent(section) {
        switch (section) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'trading':
                this.updateTradingPanel();
                break;
            case 'quantum':
                this.updateQuantumVisualization();
                break;
            case 'metrics':
                this.updateMetricsDisplay();
                break;
            case 'config':
                this.updateConfigurationPanel();
                break;
        }
    }

    // Inicializar conexión WebSocket
    initializeWebSocket() {
        try {
            this.ws = new WebSocket(this.wsUrl);
            
            this.ws.onopen = () => {
                this.isConnected = true;
                this.updateConnectionStatus('connected');
                console.log('Conexión WebSocket establecida');
            };

            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleWebSocketMessage(data);
            };

            this.ws.onclose = () => {
                this.isConnected = false;
                this.updateConnectionStatus('disconnected');
                console.log('Conexión WebSocket cerrada');
                // Intentar reconectar después de 5 segundos
                setTimeout(() => this.initializeWebSocket(), NETWORK.RECONNECT_INTERVAL);
            };

            this.ws.onerror = (error) => {
                console.error('Error en WebSocket:', error);
                this.updateConnectionStatus('error');
            };
        } catch (error) {
            console.error('Error al inicializar WebSocket:', error);
        }
    }

    // Manejar mensajes WebSocket
    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'metrics':
                // El servidor envía { type:'metrics', data: getServerMetrics(), ... }
                this.updateMetrics(data.data || data.metrics || {});
                break;
            case 'trade':
                this.updateTradeStatus(data.trade);
                break;
            case 'quantum':
                this.updateQuantumState(data.quantum);
                break;
            case 'consciousness':
                this.updateConsciousnessLevel(data.consciousness);
                break;
            case 'edge':
                // Si se transmite edge en un canal dedicado
                if (data.summary) {
                    this.edgeSummary = data.summary;
                    this.updateEdgeDisplay();
                }
                break;
            default:
                console.log('Mensaje no manejado:', data);
        }
    }

    // Inicializar cubo cuántico
    initializeQuantumCube() {
        const canvas = document.getElementById('quantum-cube');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const cube = {
            size: QUANTUM.CUBE.SIZE,
            rotation: { x: 0, y: 0, z: 0 },
            particles: []
        };

        // Inicializar partículas
        for (let i = 0; i < QUANTUM.CUBE.MAX_PARTICLES / 10; i++) {
            cube.particles.push({
                x: (Math.random() - 0.5) * cube.size,
                y: (Math.random() - 0.5) * cube.size,
                z: (Math.random() - 0.5) * cube.size,
                color: `hsl(${Math.random() * 360}, 70%, 50%)`
            });
        }

        // Animación del cubo
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Actualizar rotación
            cube.rotation.x += QUANTUM.CUBE.ROTATION_SPEED;
            cube.rotation.y += QUANTUM.CUBE.ROTATION_SPEED;
            
            // Dibujar partículas
            cube.particles.forEach(particle => {
                const x = particle.x * Math.cos(cube.rotation.y) - particle.z * Math.sin(cube.rotation.y);
                const z = particle.x * Math.sin(cube.rotation.y) + particle.z * Math.cos(cube.rotation.y);
                const y = particle.y * Math.cos(cube.rotation.x) - z * Math.sin(cube.rotation.x);
                
                const scale = 200 / (200 + z);
                const xPos = x * scale + canvas.width / 2;
                const yPos = y * scale + canvas.height / 2;
                
                ctx.beginPath();
                ctx.arc(xPos, yPos, 2 * scale, 0, Math.PI * 2);
                ctx.fillStyle = particle.color;
                ctx.fill();
            });
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    // Actualizar estado de conexión
    updateConnectionStatus(status) {
        const statusElement = document.getElementById('connection-status');
        if (statusElement) {
            statusElement.textContent = status;
            statusElement.className = `status ${status}`;
        }
    }

    // Actualizar métricas
    updateMetrics(metrics) {
        // Mapear métricas cuánticas del backend (si existen)
        if (metrics.quantum) {
            this.metrics.quantumCoherence = metrics.quantum.coherence ?? this.metrics.quantumCoherence;
            this.metrics.consciousness = metrics.quantum.consciousness ?? this.metrics.consciousness;
        }
        // Conservar compatibilidad con otros campos
        this.metrics = { ...this.metrics, ...metrics };

        // Edge summary del servidor (microestructura Futuros)
        if (metrics.edge) {
            this.edgeSummary = metrics.edge;
        }

        this.updateMetricsDisplay();
        this.updateEdgeDisplay();
    }

    // Actualizar display de métricas
    updateMetricsDisplay() {
        // Actualizar nivel de consciencia
        const consciousnessElement = document.getElementById('consciousness-level');
        if (consciousnessElement) {
            consciousnessElement.textContent = (this.metrics.consciousness * 100).toFixed(2) + '%';
            consciousnessElement.style.width = (this.metrics.consciousness * 100) + '%';
        }

        // Actualizar coherencia cuántica
        const coherenceElement = document.getElementById('quantum-coherence');
        if (coherenceElement) {
            coherenceElement.textContent = (this.metrics.quantumCoherence * 100).toFixed(2) + '%';
            coherenceElement.style.width = (this.metrics.quantumCoherence * 100) + '%';
        }

        // Actualizar volumen de trading
        const volumeElement = document.getElementById('trading-volume');
        if (volumeElement) {
            volumeElement.textContent = this.metrics.tradingVolume.toFixed(2);
        }

        // Actualizar profit/loss
        const pnlElement = document.getElementById('profit-loss');
        if (pnlElement) {
            pnlElement.textContent = this.metrics.profitLoss.toFixed(2);
            pnlElement.className = this.metrics.profitLoss >= 0 ? 'positive' : 'negative';
        }
    }

    // Actualizar dashboard
    updateDashboard() {
        this.updateMetricsDisplay();
        this.updateEdgeDisplay();
        this.updateMarketOverview();
        this.updateRecentTrades();
    }

    // Actualizar panel de trading
    updateTradingPanel() {
        const symbols = TRADING.SYMBOLS.MAJOR.concat(TRADING.SYMBOLS.MINOR);
        const symbolsSelect = document.getElementById('trading-symbol');
        if (symbolsSelect) {
            symbolsSelect.innerHTML = '';
            symbols.forEach(symbol => {
                const option = document.createElement('option');
                option.value = symbol;
                option.textContent = symbol;
                symbolsSelect.appendChild(option);
            });
        }
    }

    // Actualizar visualización cuántica
    updateQuantumVisualization() {
        // La visualización se actualiza mediante la animación del cubo cuántico
        // Aquí se pueden actualizar parámetros adicionales si es necesario
        this.updateEdgeDisplay();
    }

    // Actualizar panel de configuración
    updateConfigurationPanel() {
        // Cargar configuración actual del servidor
        this.fetchConfiguration();
    }

    // Obtener configuración del servidor
    async fetchConfiguration() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/config`);
            if (response.ok) {
                const config = await response.json();
                this.populateConfigurationForm(config);
            }
        } catch (error) {
            console.error('Error al obtener configuración:', error);
        }
    }

    // Llenar formulario de configuración
    populateConfigurationForm(config) {
        // Implementar según la estructura del formulario
        console.log('Configuración recibida:', config);
    }

    // Guardar configuración
    async saveConfiguration() {
        const config = this.getConfigurationFromForm();
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/config`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(config)
            });
            
            if (response.ok) {
                this.showNotification('Configuración guardada exitosamente', 'success');
            } else {
                this.showNotification('Error al guardar configuración', 'error');
            }
        } catch (error) {
            console.error('Error al guardar configuración:', error);
            this.showNotification('Error al guardar configuración', 'error');
        }
    }

    // Obtener configuración del formulario
    getConfigurationFromForm() {
        // Implementar según la estructura del formulario
        return {};
    }

    // Iniciar trading
    async startTrading() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/trading/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                this.showNotification('Trading iniciado', 'success');
                document.getElementById('start-trading').disabled = true;
                document.getElementById('stop-trading').disabled = false;
            } else {
                this.showNotification('Error al iniciar trading', 'error');
            }
        } catch (error) {
            console.error('Error al iniciar trading:', error);
            this.showNotification('Error al iniciar trading', 'error');
        }
    }

    // Detener trading
    async stopTrading() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/trading/stop`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                this.showNotification('Trading detenido', 'success');
                document.getElementById('start-trading').disabled = false;
                document.getElementById('stop-trading').disabled = true;
            } else {
                this.showNotification('Error al detener trading', 'error');
            }
        } catch (error) {
            console.error('Error al detener trading:', error);
            this.showNotification('Error al detener trading', 'error');
        }
    }

    // Refrescar métricas
    async refreshMetrics() {
        try {
            const [metricsRes, edgeRes] = await Promise.all([
                fetch(`${this.apiBaseUrl}/api/metrics`),
                fetch(`${this.apiBaseUrl}/api/edge/summary`)
            ]);

            if (metricsRes.ok) {
                const metrics = await metricsRes.json();
                this.updateMetrics(metrics);
            }
            if (edgeRes.ok) {
                const edgePayload = await edgeRes.json();
                if (edgePayload && edgePayload.summary) {
                    this.edgeSummary = edgePayload.summary;
                }
            }

            this.updateEdgeDisplay();
        } catch (error) {
            console.error('Error al refrescar métricas:', error);
        }
    }

    // Actualizar estado de trade
    updateTradeStatus(trade) {
        // Implementar actualización de estado de trade
        console.log('Trade actualizado:', trade);
    }

    // Actualizar estado cuántico
    updateQuantumState(quantum) {
        this.metrics.quantumCoherence = quantum.coherence || QUANTUM.STATES.COHERENCE;
        this.updateMetricsDisplay();
    }

    // Actualizar nivel de consciencia
    updateConsciousnessLevel(consciousness) {
        this.metrics.consciousness = consciousness.level || LEONARDO.CONSCIOUSNESS.BASE_LEVEL;
        this.updateMetricsDisplay();
    }

    // Actualizar resumen de mercado
    updateMarketOverview() {
        // Implementar actualización de resumen de mercado
        console.log('Actualizando resumen de mercado');
    }

    // Actualizar trades recientes
    updateRecentTrades() {
        // Implementar actualización de trades recientes
        console.log('Actualizando trades recientes');
    }

    // Mostrar notificación
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Panel de Edge de Futuros (si los elementos existen)
    updateEdgeDisplay() {
        const edge = this.edgeSummary;
        if (!edge || !edge.gauges) return;

        const safeSet = (id, value, suffix = '') => {
            const el = document.getElementById(id);
            if (el) el.textContent = `${Number(value ?? 0).toFixed(4)}${suffix}`;
        };

        // Gauges clave
        safeSet('edge-score', edge.gauges.edge_score);
        safeSet('edge-funding', edge.gauges.funding_rate);
        safeSet('edge-oi-delta', edge.gauges.open_interest_delta);
        safeSet('edge-kyle', edge.gauges.kyle_lambda);
        safeSet('edge-liq-density', edge.gauges.liquidation_density);

        // Si existen barras de progreso
        const edgeBar = document.getElementById('edge-score-bar');
        if (edgeBar) {
            const v = Number(edge.gauges.edge_score ?? 0);
            const pct = Math.max(0, Math.min(100, (v + 1.5) / 3.0 * 100)); // map [-1.5..1.5] -> [0..100]
            edgeBar.style.width = `${pct}%`;
        }
    }

    // Actualizar UI general
    updateUI() {
        // Actualizar información del sistema
        const systemInfo = document.getElementById('system-info');
        if (systemInfo) {
            systemInfo.textContent = `${SYSTEM.NAME} v${SYSTEM.VERSION} - ${SYSTEM.ENVIRONMENT}`;
        }

        // Actualizar sección inicial
        this.handleNavigation('dashboard');
    }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.qbtcApp = new QBTCUnifiedApp();
});

// Exportar la clase para uso externo
module.exports = QBTCUnifiedApp;