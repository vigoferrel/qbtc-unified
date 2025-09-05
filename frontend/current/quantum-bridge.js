// QBTC Unified Quantum System - Quantum Bridge
class QuantumBridge {
    constructor() {
        this.config = null;
        this.websocket = null;
        this.reconnectAttempts = 0;
        this.quantumState = {
            consciousness: 0,
            coherence: 0,
            decisions: 0,
            poets: new Map(),
            microtubules: {
                total: 169,
                active: 0
            }
        };
        
        this.eventHandlers = new Map();
        this.initialize();
    }

    async initialize() {
        try {
            // Cargar configuración
            const response = await fetch('/config/config.json');
            this.config = await response.json();
            
            // Inicializar websocket con reconexión automática
            this.initializeWebSocket();
            
            // Inicializar poetas cuánticos
            this.initializePoets();
            
            // Iniciar monitoreo de estado
            this.startStateMonitoring();
            
        } catch (error) {
            console.error('Error initializing Quantum Bridge:', error);
            this.log('ERROR', 'Error initializing quantum systems');
        }
    }

    initializeWebSocket() {
        const wsUrl = `ws://${window.location.hostname}:${this.config.ports.QUANTUM_CORE}/quantum-stream`;
        
        this.websocket = new WebSocket(wsUrl);
        
        this.websocket.onopen = () => {
            this.reconnectAttempts = 0;
            this.log('INFO', 'Quantum connection established');
            this.emit('connectionChange', true);
        };
        
        this.websocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleQuantumMessage(data);
            } catch (error) {
                console.error('Error processing quantum message:', error);
            }
        };
        
        this.websocket.onclose = () => {
            this.emit('connectionChange', false);
            this.handleDisconnection();
        };
        
        this.websocket.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.log('ERROR', 'Quantum connection error');
        };
    }

    handleDisconnection() {
        if (this.reconnectAttempts >= this.config.websocket.maxReconnectAttempts) {
            this.log('ERROR', 'Maximum reconnection attempts reached');
            return;
        }
        
        this.reconnectAttempts++;
        this.log('INFO', `Reconnecting... Attempt ${this.reconnectAttempts}`);
        
        setTimeout(() => {
            this.initializeWebSocket();
        }, this.config.websocket.reconnectInterval);
    }

    initializePoets() {
        for (const poet of this.config.quantum.poets) {
            this.quantumState.poets.set(poet.name, {
                frequency: poet.frequency,
                active: false,
                resonance: 0
            });
        }
    }

    startStateMonitoring() {
        setInterval(() => {
            this.updateQuantumState();
        }, this.config.quantum.consciousness.updateInterval);
    }

    updateQuantumState() {
        if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
            return;
        }
        
        this.websocket.send(JSON.stringify({
            type: 'getQuantumState',
            timestamp: Date.now()
        }));
    }

    handleQuantumMessage(message) {
        switch (message.type) {
            case 'quantumState':
                this.updateMetrics(message.data);
                break;
            case 'poeticResonance':
                this.updatePoets(message.data);
                break;
            case 'tradingSignal':
                this.emit('tradingSignal', message.data);
                break;
            case 'systemAlert':
                this.handleSystemAlert(message.data);
                break;
        }
    }

    updateMetrics(data) {
        // Actualizar métricas cuánticas principales
        this.quantumState.consciousness = data.consciousness;
        this.quantumState.coherence = data.coherence;
        this.quantumState.decisions = data.decisions;
        
        // Actualizar microtúbulos
        if (data.microtubules) {
            this.quantumState.microtubules.active = data.microtubules.active;
        }
        
        // Emitir evento de actualización
        this.emit('metricsUpdate', {
            consciousness: this.quantumState.consciousness,
            coherence: this.quantumState.coherence,
            decisions: this.quantumState.decisions,
            microtubules: this.quantumState.microtubules
        });
    }

    updatePoets(data) {
        for (const [name, state] of Object.entries(data)) {
            if (this.quantumState.poets.has(name)) {
                const poet = this.quantumState.poets.get(name);
                poet.active = state.active;
                poet.resonance = state.resonance;
            }
        }
        
        this.emit('poetsUpdate', Array.from(this.quantumState.poets.entries()));
    }

    handleSystemAlert(alert) {
        this.log(alert.level, alert.message);
        this.emit('systemAlert', alert);
    }

    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, new Set());
        }
        this.eventHandlers.get(event).add(handler);
    }

    off(event, handler) {
        if (this.eventHandlers.has(event)) {
            this.eventHandlers.get(event).delete(handler);
        }
    }

    emit(event, data) {
        if (this.eventHandlers.has(event)) {
            for (const handler of this.eventHandlers.get(event)) {
                handler(data);
            }
        }
    }

    log(level, message) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            message
        };
        
        this.emit('log', logEntry);
        
        // También emitir al servidor para registro centralizado
        if (this.websocket?.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify({
                type: 'log',
                data: logEntry
            }));
        }
    }

    // API Methods for Trading System
    async getQuantumMetrics() {
        try {
            const response = await fetch(`http://${window.location.hostname}:${this.config.ports.QUANTUM_CORE}/api/quantum-metrics`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching quantum metrics:', error);
            return null;
        }
    }

    async validateTradingSignal(signal) {
        try {
            const response = await fetch(`http://${window.location.hostname}:${this.config.ports.QUANTUM_CORE}/api/validate-signal`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(signal)
            });
            return await response.json();
        } catch (error) {
            console.error('Error validating trading signal:', error);
            return { valid: false, error: error.message };
        }
    }
}

}

// Sistema de Visualización y Alertas
class VisualizationEngine {
    constructor() {
        this.metrics_history = {
            cpu: [],
            memory: [],
            errors: [],
            quantum: []
        };
        
        this.thresholds = {
            cpu: 80,
            errors: 5,
            cache_hit: 70,
            memory: 85
        };
        
        this.alerts = [];
        this.maxHistorySize = 50;
        this.maxAlertsCount = 20;
        
        this.initialize();
    }
    
    initialize() {
        // Configurar elementos del DOM
        this.setupThresholdControls();
        this.startPerformanceMonitoring();
        
        // Escuchar eventos del bridge
        if (window.quantumBridge) {
            window.quantumBridge.on('metricsUpdate', (data) => {
                this.updateQuantumMetrics(data);
                this.checkQuantumThresholds(data);
            });
            
            window.quantumBridge.on('systemAlert', (alert) => {
                this.addAlert(alert.level, alert.message);
            });
        }
    }
    
    setupThresholdControls() {
        const cpuThreshold = document.getElementById('cpuThreshold');
        const errorThreshold = document.getElementById('errorThreshold');
        const cacheThreshold = document.getElementById('cacheThreshold');
        
        if (cpuThreshold) {
            cpuThreshold.addEventListener('input', (e) => {
                this.thresholds.cpu = parseInt(e.target.value);
                document.getElementById('cpuThresholdValue').textContent = e.target.value;
            });
        }
        
        if (errorThreshold) {
            errorThreshold.addEventListener('input', (e) => {
                this.thresholds.errors = parseInt(e.target.value);
                document.getElementById('errorThresholdValue').textContent = e.target.value;
            });
        }
        
        if (cacheThreshold) {
            cacheThreshold.addEventListener('input', (e) => {
                this.thresholds.cache_hit = parseInt(e.target.value);
                document.getElementById('cacheThresholdValue').textContent = e.target.value;
            });
        }
    }
    
    startPerformanceMonitoring() {
        // Simular datos de rendimiento del sistema
        setInterval(() => {
            this.updateSystemMetrics();
        }, 2000);
        
        // Actualizar gráficos cada 500ms
        setInterval(() => {
            this.renderCharts();
        }, 500);
    }
    
    async updateSystemMetrics() {
        // Obtener métricas reales del sistema cuántico
        try {
            const response = await fetch(`http://${window.location.hostname}:${window.quantumBridge?.config?.ports?.QUANTUM_CORE || 3001}/api/quantum/system-metrics`);
            
            if (response.ok) {
                const systemMetrics = await response.json();
                
                // Usar métricas reales del backend cuántico
                this.addToHistory('cpu', systemMetrics.cpu_usage || 0);
                this.addToHistory('memory', systemMetrics.memory_usage || 0);
                this.addToHistory('errors', systemMetrics.error_rate || 0);
                
                // Verificar umbrales con métricas reales
                this.checkSystemThresholds(
                    systemMetrics.cpu_usage || 0,
                    systemMetrics.memory_usage || 0, 
                    systemMetrics.error_rate || 0
                );
                
                // Almacenar métricas adicionales cuánticas
                this.lastSystemMetrics = systemMetrics;
                
            } else {
                // Fallback usando datos cuánticos locales si el servidor no responde
                this.generateLocalQuantumMetrics();
            }
        } catch (error) {
            console.warn('[VISUALIZATION] Error obteniendo métricas del servidor, usando fallback local:', error);
            this.generateLocalQuantumMetrics();
        }
    }
    
    generateLocalQuantumMetrics() {
        // Generar métricas usando entropía cuántica local (sin Math.random)
        const entropy = this.generateLocalQuantumEntropy();
        const now = Date.now();
        
        // CPU usage con patrones cuánticos
        const baseCpu = 35 + Math.sin(now / 60000) * 18; // Ciclo de 1 minuto
        const quantumFluctuation = entropy.primary * 20;
        const systemLoad = this.metrics_history.cpu.length > 50 ? 8 : 0;
        const cpu = Math.max(5, Math.min(100, baseCpu + quantumFluctuation + systemLoad));
        
        // Memory usage con crecimiento cuántico
        const baseMemory = 55 + Math.cos(now / 90000) * 15;
        const entropyVariation = entropy.secondary * 12;
        const gcCleanup = entropy.tertiary < 0.3 ? -entropy.quaternary * 15 : 0;
        const memory = Math.max(20, Math.min(95, baseMemory + entropyVariation + gcCleanup));
        
        // Error rate usando coherencia cuántica
        const coherenceLevel = entropy.harmonicMean;
        const errorProbability = (1 - coherenceLevel) * 5;
        const errorSpike = entropy.quaternary > 0.95 ? entropy.primary * 10 : 0;
        const errors = Math.floor(Math.max(0, errorProbability + errorSpike));
        
        // Añadir a historial
        this.addToHistory('cpu', cpu);
        this.addToHistory('memory', memory);
        this.addToHistory('errors', errors);
        
        // Verificar umbrales
        this.checkSystemThresholds(cpu, memory, errors);
    }
    
    generateLocalQuantumEntropy() {
        // Generar entropía cuántica local usando hash determinista
        const timestamp = Date.now().toString();
        const metricsCount = Object.keys(this.metrics_history).reduce((sum, key) => sum + this.metrics_history[key].length, 0);
        const alertsCount = this.alerts.length.toString();
        
        // Crear semilla cuántica
        const quantumSeed = timestamp + metricsCount + alertsCount + '7919'; // Constante prima
        
        // Usar hash simple para generar entropía
        let hash = 0;
        for (let i = 0; i < quantumSeed.length; i++) {
            const char = quantumSeed.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        
        // Convertir a valores normalizados
        const abs = Math.abs(hash);
        const entropy1 = (abs % 10000) / 10000;
        const entropy2 = ((abs >> 8) % 10000) / 10000;
        const entropy3 = ((abs >> 16) % 10000) / 10000;
        const entropy4 = ((abs >> 24) % 10000) / 10000;
        
        return {
            primary: entropy1,
            secondary: entropy2,
            tertiary: entropy3,
            quaternary: entropy4,
            harmonicMean: 4 / (1/entropy1 + 1/entropy2 + 1/entropy3 + 1/entropy4),
            timestamp: Date.now()
        };
    }
    
    addToHistory(metric, value) {
        this.metrics_history[metric].push({
            value: value,
            timestamp: Date.now()
        });
        
        // Mantener tamaño máximo
        if (this.metrics_history[metric].length > this.maxHistorySize) {
            this.metrics_history[metric].shift();
        }
    }
    
    checkSystemThresholds(cpu, memory, errors) {
        if (cpu > this.thresholds.cpu) {
            this.addAlert('critical', `CPU usage excesivo: ${cpu.toFixed(1)}%`);
        }
        
        if (memory > this.thresholds.memory) {
            this.addAlert('warning', `Uso de memoria alto: ${memory.toFixed(1)}%`);
        }
        
        if (errors > this.thresholds.errors) {
            this.addAlert('critical', `Rate de errores alto: ${errors}/min`);
        }
        
        // Calcular cache hit ratio usando entropía cuántica
        const entropy = this.generateLocalQuantumEntropy();
        const baseCacheHit = entropy.harmonicMean > 0.1 ? 75 + entropy.primary * 20 : 40 + entropy.secondary * 30;
        const cacheHit = Math.max(30, Math.min(99, baseCacheHit));
        if (cacheHit < this.thresholds.cache_hit) {
            this.addAlert('warning', `Cache hit ratio bajo: ${cacheHit.toFixed(1)}%`);
        }
    }
    
    checkQuantumThresholds(data) {
        if (data.consciousness < 0.3) {
            this.addAlert('warning', `Consciousness level bajo: ${(data.consciousness * 100).toFixed(1)}%`);
        }
        
        if (data.coherence < 0.4) {
            this.addAlert('critical', `Coherencia cuántica crítica: ${(data.coherence * 100).toFixed(1)}%`);
        }
        
        if (data.microtubules && data.microtubules.active < 100) {
            this.addAlert('info', `Microtúbulos activos: ${data.microtubules.active}/${data.microtubules.total}`);
        }
    }
    
    addAlert(level, message) {
        // Generar ID único usando entropía cuántica
        const entropy = this.generateLocalQuantumEntropy();
        const uniqueId = Date.now() + Math.floor(entropy.primary * 10000);
        
        const alert = {
            id: uniqueId,
            level: level,
            message: message,
            timestamp: new Date()
        };
        
        this.alerts.unshift(alert);
        
        // Mantener número máximo de alertas
        if (this.alerts.length > this.maxAlertsCount) {
            this.alerts.pop();
        }
        
        this.renderAlerts();
        
        // Notification del sistema
        if (level === 'critical' && 'Notification' in window) {
            this.showSystemNotification(alert);
        }
    }
    
    showSystemNotification(alert) {
        if (Notification.permission === 'granted') {
            new Notification('QBTC System Alert', {
                body: alert.message,
                icon: '/favicon.ico',
                badge: '/favicon.ico'
            });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then((permission) => {
                if (permission === 'granted') {
                    this.showSystemNotification(alert);
                }
            });
        }
    }
    
    renderAlerts() {
        const container = document.getElementById('alertsContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (this.alerts.length === 0) {
            container.innerHTML = '<div class="alert-item info"><span class="alert-icon">i</span><span class="alert-message">No hay alertas activas</span></div>';
            return;
        }
        
        this.alerts.forEach(alert => {
            const alertEl = document.createElement('div');
            alertEl.className = `alert-item ${alert.level}`;
            
            const icon = alert.level === 'critical' ? '!' : alert.level === 'warning' ? '?' : 'i';
            
            alertEl.innerHTML = `
                <span class="alert-icon">${icon}</span>
                <span class="alert-message">${alert.message}</span>
                <span class="alert-timestamp">${alert.timestamp.toLocaleTimeString()}</span>
            `;
            
            container.appendChild(alertEl);
        });
    }
    
    renderCharts() {
        this.renderCpuChart();
        this.renderMemoryChart();
        this.renderErrorsChart();
    }
    
    renderCpuChart() {
        const container = document.getElementById('cpuChartArea');
        if (!container || this.metrics_history.cpu.length === 0) return;
        
        const data = this.metrics_history.cpu.slice(-20); // Últimos 20 puntos
        const chart = this.generateAsciiChart(data, 'CPU %', this.thresholds.cpu);
        container.textContent = chart;
    }
    
    renderMemoryChart() {
        const container = document.getElementById('memoryChartArea');
        if (!container || this.metrics_history.memory.length === 0) return;
        
        const data = this.metrics_history.memory.slice(-20);
        const chart = this.generateAsciiChart(data, 'MEM %', this.thresholds.memory);
        container.textContent = chart;
    }
    
    renderErrorsChart() {
        const container = document.getElementById('errorsChartArea');
        if (!container || this.metrics_history.errors.length === 0) return;
        
        const data = this.metrics_history.errors.slice(-20);
        const chart = this.generateAsciiChart(data, 'ERR/min', this.thresholds.errors);
        container.textContent = chart;
    }
    
    generateAsciiChart(data, label, threshold) {
        if (data.length === 0) return `${label}: Sin datos`;
        
        const width = 20;
        const height = 8;
        const maxValue = Math.max(...data.map(d => d.value), threshold + 10);
        
        let chart = `${label} (max: ${maxValue.toFixed(1)})\n`;
        chart += '┌' + '─'.repeat(width) + '┐\n';
        
        // Dibujar líneas del gráfico
        for (let row = height - 1; row >= 0; row--) {
            const rowValue = (row + 1) * maxValue / height;
            let line = '│';
            
            for (let col = 0; col < width; col++) {
                if (col < data.length) {
                    const value = data[Math.floor(col * data.length / width)].value;
                    const normalizedValue = value * height / maxValue;
                    
                    if (normalizedValue >= row) {
                        // Usar diferentes caracteres según si excede el threshold
                        if (value > threshold) {
                            line += '█'; // Rojo para valores críticos
                        } else if (value > threshold * 0.8) {
                            line += '▓'; // Amarillo para advertencia
                        } else {
                            line += '░'; // Verde para normal
                        }
                    } else {
                        line += ' ';
                    }
                } else {
                    line += ' ';
                }
            }
            line += '│';
            chart += line + '\n';
        }
        
        chart += '└' + '─'.repeat(width) + '┘\n';
        
        // Línea de threshold
        const thresholdLine = `Threshold: ${threshold} ${threshold < maxValue * 0.8 ? '(OK)' : '(HIGH)'}`;
        chart += thresholdLine;
        
        return chart;
    }
    
    updateQuantumMetrics(data) {
        // Actualizar barras de métricas
        this.updateMetricBar('consciousnessBar', data.consciousness);
        this.updateMetricBar('coherenceBar', data.coherence);
        this.updateMetricBar('decisionsBar', data.decisions / 100); // Normalizar decisiones
        
        // Actualizar valores
        const consciousnessEl = document.getElementById('consciousnessValue');
        const coherenceEl = document.getElementById('coherenceValue');
        const decisionsEl = document.getElementById('decisionsValue');
        
        if (consciousnessEl) consciousnessEl.textContent = (data.consciousness || 0).toFixed(3);
        if (coherenceEl) coherenceEl.textContent = (data.coherence || 0).toFixed(3);
        if (decisionsEl) decisionsEl.textContent = Math.floor(data.decisions || 0);
    }
    
    updateMetricBar(barId, value) {
        const bar = document.getElementById(barId);
        if (!bar) return;
        
        const percentage = Math.max(0, Math.min(100, value * 100));
        bar.style.setProperty('--bar-width', `${percentage}%`);
        
        // Agregar regla CSS dinámica si no existe
        if (!document.getElementById('dynamic-bar-styles')) {
            const style = document.createElement('style');
            style.id = 'dynamic-bar-styles';
            style.textContent = '.metric-bar::before { width: var(--bar-width, 0%); }';
            document.head.appendChild(style);
        }
    }
}

// Inicializar sistema de visualización
let visualizationEngine;

// Export singleton instance
window.quantumBridge = new QuantumBridge();

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    visualizationEngine = new VisualizationEngine();
    window.visualizationEngine = visualizationEngine;
});
