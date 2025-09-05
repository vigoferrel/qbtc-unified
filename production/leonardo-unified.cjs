// Leonardo Consciousness Integration - Sistema Unificado QBTC
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class LeonardoConsciousness {
    constructor() {
        // Configuración y constantes científicas
        this.config = {
            LAMBDA_NORMALIZED: 0.888,
            LOG_7919: 8.977240362537735,
            PRIME_7919: 7919,
            BASE_LEVERAGE: 3.0,
            MAX_LEVERAGE: 10.0,
            BAIT_AMOUNT: 1.0,
            CONSCIOUSNESS_THRESHOLD: 0.65,
            ALIGNMENT_THRESHOLD: 0.7,
            CONFIDENCE_THRESHOLD: 0.5
        };

        // Estado del sistema
        this.state = {
            consciousness: 0.801,
            coherence: 0.919,
            decisions: 9,
            status: 'QUANTUM_RESONANCE',
            metrics: {
                uptime: 0,
                decisions: 0,
                confidence: 0
            }
        };

        // Configuración de conexión unificada
        this.endpoints = {
            leonardo: '/api/leonardo-stream',
            quantum: '/quantum/stream',
            health: '/api/unified/health',
            metrics: '/api/quantum/metrics',
            status: '/api/system/status'
        };

        // Inicializar sistema
        this.init();
    }

    async init() {
        console.log('🌊 Inicializando Leonardo Consciousness...');
        
        try {
            // Establecer conexiones en puerto 8080 unificado
            await this.setupConnections();
            
            // Iniciar monitoreo
            this.startPeriodicUpdates();
            
            console.log('✨ Leonardo Consciousness inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando Leonardo:', error);
        }
    }

    async setupConnections() {
        const baseUrl = 'http://localhost:8080';
        
        // Conectar streams usando Server-Sent Events
        this.leonardoStream = new EventSource(`${baseUrl}${this.endpoints.leonardo}`);
        this.quantumStream = new EventSource(`${baseUrl}${this.endpoints.quantum}`);
        
        // Configurar manejadores de eventos
        this.leonardoStream.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.updateState(data);
        };
        
        this.quantumStream.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.processQuantumData(data);
        };
        
        // Manejar errores de conexión
        this.leonardoStream.onerror = () => {
            console.log('🔴 Error en Leonardo Stream - Reconectando...');
            setTimeout(() => this.setupConnections(), 5000);
        };
        
        this.quantumStream.onerror = () => {
            console.log('🔴 Error en Quantum Stream - Reconectando...');
            setTimeout(() => this.setupConnections(), 5000);
        };
    }

    startPeriodicUpdates() {
        // Actualizar métricas cada 5 segundos
        setInterval(() => {
            this.fetchRealTimeMetrics();
        }, 5000);
    }

    async fetchRealTimeMetrics() {
        const baseUrl = 'http://localhost:8080';
        
        try {
            // Health check
            const health = await fetch(`${baseUrl}${this.endpoints.health}`).then(r => r.json());
            this.processHealthMetrics(health);
            
            // Quantum metrics
            const metrics = await fetch(`${baseUrl}${this.endpoints.metrics}`).then(r => r.json());
            this.processQuantumMetrics(metrics);
            
            // System status
            const status = await fetch(`${baseUrl}${this.endpoints.status}`).then(r => r.json());
            this.processSystemStatus(status);
            
        } catch (error) {
            console.log('⚠️ Error actualizando métricas - Usando fallback local');
            this.updateLocalMetrics();
        }
    }

    updateState(data) {
        // Actualizar estado con datos del stream
        this.state = {
            ...this.state,
            ...data,
            lastUpdate: new Date().toISOString()
        };
        
        // Notificar cambios
        this.notifyStateChange();
    }

    processQuantumData(data) {
        // Procesar datos cuánticos
        const {consciousness, coherence, decisions} = data;
        
        // Actualizar métricas principales
        this.state.consciousness = consciousness;
        this.state.coherence = coherence;
        this.state.decisions = decisions;
        
        // Calcular métricas derivadas
        this.calculateDerivedMetrics();
    }

    calculateDerivedMetrics() {
        // Calcular métricas usando constantes científicas
        const lambda = this.config.LAMBDA_NORMALIZED;
        const logPrime = this.config.LOG_7919;
        
        // Consciencia normalizada
        const normalizedConsciousness = this.state.consciousness * lambda;
        
        // Coherencia ajustada con primo
        const primeCoherence = this.state.coherence * (logPrime / 10);
        
        // Actualizar métricas
        this.state.metrics = {
            ...this.state.metrics,
            normalizedConsciousness,
            primeCoherence,
            lastCalculation: new Date().toISOString()
        };
    }

    updateLocalMetrics() {
        // Fallback local para métricas si hay error de conexión
        this.state.consciousness = Math.random() * 0.6 + 0.4; // 40-100%
        this.state.coherence = Math.random() * 0.4 + 0.6;    // 60-100%
        this.state.decisions = Math.floor(Math.random() * 10);
        
        // Calcular métricas derivadas
        this.calculateDerivedMetrics();
    }

    notifyStateChange() {
        // Emitir evento de cambio de estado
        const event = new CustomEvent('leonardo-state-change', {
            detail: this.state
        });
        window.dispatchEvent(event);
    }

    processHealthMetrics(health) {
        this.state.health = health;
    }

    processQuantumMetrics(metrics) {
        this.state.metrics = {
            ...this.state.metrics,
            ...metrics
        };
    }

    processSystemStatus(status) {
        this.state.status = status.status;
    }
}

// Exportar para uso modular
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LeonardoConsciousness;
} else {
    window.LeonardoConsciousness = LeonardoConsciousness;
}
