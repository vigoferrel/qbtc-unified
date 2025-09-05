// QBTC Unified Modules - Sistema de carga dinámica
import { config } from './config.json';

// Módulo Three.js y addons
export const loadThreeModules = async () => {
    const modules = {
        three: null,
        addons: null
    };
    
    try {
        // Cargar Three.js desde CDN
        const threeUrl = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
        await import(threeUrl).then(module => {
            modules.three = module.default;
            console.log('✅ Three.js cargado correctamente');
        });
        
        // Cargar addons necesarios
        const addonsUrl = 'https://cdn.jsdelivr.net/npm/three/examples/jsm/';
        await import(addonsUrl).then(module => {
            modules.addons = module;
            console.log('✅ Three.js addons cargados');
        });
        
    } catch (error) {
        console.error('❌ Error cargando módulos Three.js:', error);
    }
    
    return modules;
};

// Configuración unificada de conexiones
export const setupConnections = () => {
    const endpoints = config.endpoints;
    const port = config.ports.unified;
    
    const baseUrl = `http://localhost:${port}`;
    
    return {
        leonardoStream: new EventSource(`${baseUrl}${endpoints.leonardo}`),
        quantumStream: new EventSource(`${baseUrl}${endpoints.quantum}`),
        health: `${baseUrl}${endpoints.health}`,
        metrics: `${baseUrl}${endpoints.metrics}`,
        status: `${baseUrl}${endpoints.status}`
    };
};

// Sistema de consciencia unificado
export class UnifiedConsciousness {
    constructor() {
        this.consciousness = 0.801;
        this.coherence = 0.919;
        this.decisions = 9;
        this.status = 'QUANTUM_RESONANCE';
    }
    
    updateState(newState) {
        Object.assign(this, newState);
        this.notifyObservers();
    }
    
    addObserver(callback) {
        if (!this.observers) this.observers = [];
        this.observers.push(callback);
    }
    
    notifyObservers() {
        if (this.observers) {
            this.observers.forEach(callback => callback(this));
        }
    }
}
