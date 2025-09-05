/*
  Copyright © 2025 VIGOLEONROCKS QUANTUM TECHNOLOGIES.
  Alert System - Sistema de alertas y notificaciones avanzadas
  Manejo de alertas críticas, trade signals y eventos cuánticos
*/

class AlertSystem {
    constructor() {
        this.alerts = [];
        this.subscribers = new Map();
        this.alertTypes = {
            INFO: 'INFO',
            WARNING: 'WARNING', 
            ERROR: 'ERROR',
            CRITICAL: 'CRITICAL',
            TRADE_SIGNAL: 'TRADE_SIGNAL',
            QUANTUM_EVENT: 'QUANTUM_EVENT',
            BIG_BANG: 'BIG_BANG',
            INFINITE_SPACE: 'INFINITE_SPACE'
        };
        
        this.alertHistory = [];
        this.maxHistorySize = 1000;
        this.isEnabled = true;
        
        console.log('[ALERT SYSTEM] 🚨 Sistema de alertas inicializado');
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

    // **EMITIR ALERTA**
    emit(type, title, message, data = {}) {
        if (!this.isEnabled) return;

        const alert = {
            id: this.generateAlertId(),
            type: type,
            title: title,
            message: message,
            data: data,
            timestamp: new Date().toISOString(),
            level: this.getAlertLevel(type)
        };

        // Agregar a historial
        this.alertHistory.unshift(alert);
        if (this.alertHistory.length > this.maxHistorySize) {
            this.alertHistory = this.alertHistory.slice(0, this.maxHistorySize);
        }

        // Log en consola con formato apropiado
        this.logAlert(alert);

        // Notificar suscriptores
        this.notifySubscribers(alert);

        return alert.id;
    }

    // **GENERAR ID DE ALERTA**
    generateAlertId() {
        const timestamp = Date.now();
        const deterministicValue = this.calculateDeterministicValue(timestamp);
        return 'alert_' + timestamp + '_' + deterministicValue.toString(36).substr(2, 9);
    }

    // **OBTENER NIVEL DE ALERTA**
    getAlertLevel(type) {
        const levels = {
            'INFO': 1,
            'WARNING': 2,
            'ERROR': 3,
            'CRITICAL': 4,
            'TRADE_SIGNAL': 2,
            'QUANTUM_EVENT': 3,
            'BIG_BANG': 4,
            'INFINITE_SPACE': 4
        };
        return levels[type] || 1;
    }

    // **LOG ALERTA EN CONSOLA**
    logAlert(alert) {
        const timestamp = new Date(alert.timestamp).toLocaleTimeString();
        let emoji = '📢';
        
        // Seleccionar emoji según tipo
        switch (alert.type) {
            case 'INFO': emoji = '📢'; break;
            case 'WARNING': emoji = '⚠️'; break;
            case 'ERROR': emoji = '❌'; break;
            case 'CRITICAL': emoji = '🚨'; break;
            case 'TRADE_SIGNAL': emoji = '📊'; break;
            case 'QUANTUM_EVENT': emoji = '🔮'; break;
            case 'BIG_BANG': emoji = '💥'; break;
            case 'INFINITE_SPACE': emoji = '🌌'; break;
        }

        console.log(`[ALERT ${timestamp}] ${emoji} ${alert.type}: ${alert.title}`);
        console.log(`[ALERT ${timestamp}] 📝 ${alert.message}`);
        
        if (Object.keys(alert.data).length > 0) {
            console.log(`[ALERT ${timestamp}] 📋 Data:`, alert.data);
        }
    }

    // **ALERTAS POR TIPO**
    info(title, message, data = {}) {
        return this.emit(this.alertTypes.INFO, title, message, data);
    }

    warning(title, message, data = {}) {
        return this.emit(this.alertTypes.WARNING, title, message, data);
    }

    error(title, message, data = {}) {
        return this.emit(this.alertTypes.ERROR, title, message, data);
    }

    critical(title, message, data = {}) {
        return this.emit(this.alertTypes.CRITICAL, title, message, data);
    }

    tradeSignal(title, message, data = {}) {
        return this.emit(this.alertTypes.TRADE_SIGNAL, title, message, data);
    }

    quantumEvent(title, message, data = {}) {
        return this.emit(this.alertTypes.QUANTUM_EVENT, title, message, data);
    }

    bigBang(title, message, data = {}) {
        return this.emit(this.alertTypes.BIG_BANG, title, message, data);
    }

    infiniteSpace(title, message, data = {}) {
        return this.emit(this.alertTypes.INFINITE_SPACE, title, message, data);
    }

    // **SUSCRIBIRSE A ALERTAS**
    subscribe(callback, types = []) {
        const timestamp = Date.now();
        const deterministicValue = this.calculateDeterministicValue(timestamp);
        const subscriberId = 'subscriber_' + timestamp + '_' + deterministicValue.toString(36).substr(2, 5);
        
        this.subscribers.set(subscriberId, {
            callback: callback,
            types: types.length > 0 ? types : Object.values(this.alertTypes),
            active: true
        });

        return subscriberId;
    }

    // **DESUSCRIBIRSE**
    unsubscribe(subscriberId) {
        return this.subscribers.delete(subscriberId);
    }

    // **NOTIFICAR SUSCRIPTORES**
    notifySubscribers(alert) {
        this.subscribers.forEach((subscriber, id) => {
            if (!subscriber.active) return;
            
            if (subscriber.types.includes(alert.type)) {
                try {
                    subscriber.callback(alert);
                } catch (error) {
                    console.error(`[ALERT SYSTEM] Error notificando suscriptor ${id}:`, error.message);
                }
            }
        });
    }

    // **OBTENER HISTORIAL**
    getHistory(limit = 50, types = []) {
        let history = this.alertHistory;
        
        if (types.length > 0) {
            history = history.filter(alert => types.includes(alert.type));
        }
        
        return history.slice(0, limit);
    }

    // **OBTENER ALERTAS CRÍTICAS**
    getCriticalAlerts(limit = 20) {
        return this.alertHistory
            .filter(alert => alert.level >= 3)
            .slice(0, limit);
    }

    // **LIMPIAR HISTORIAL**
    clearHistory() {
        this.alertHistory = [];
        console.log('[ALERT SYSTEM] 🧹 Historial de alertas limpiado');
    }

    // **OBTENER ESTADÍSTICAS**
    getStatistics() {
        const stats = {
            total: this.alertHistory.length,
            byType: {},
            byLevel: { 1: 0, 2: 0, 3: 0, 4: 0 },
            last24h: 0,
            lastHour: 0
        };

        const now = Date.now();
        const hour = 60 * 60 * 1000;
        const day = 24 * hour;

        this.alertHistory.forEach(alert => {
            // Por tipo
            stats.byType[alert.type] = (stats.byType[alert.type] || 0) + 1;
            
            // Por nivel
            stats.byLevel[alert.level]++;
            
            // Por tiempo
            const alertTime = new Date(alert.timestamp).getTime();
            if (now - alertTime < hour) {
                stats.lastHour++;
            }
            if (now - alertTime < day) {
                stats.last24h++;
            }
        });

        return stats;
    }

    // **CONFIGURAR SISTEMA**
    configure(options = {}) {
        if (options.hasOwnProperty('enabled')) {
            this.isEnabled = options.enabled;
        }
        
        if (options.maxHistorySize) {
            this.maxHistorySize = options.maxHistorySize;
        }

        console.log(`[ALERT SYSTEM] ⚙️ Sistema ${this.isEnabled ? 'habilitado' : 'deshabilitado'}`);
    }

    // **PAUSAR ALERTAS**
    pause() {
        this.isEnabled = false;
        console.log('[ALERT SYSTEM] ⏸️ Sistema pausado');
    }

    // **REANUDAR ALERTAS**
    resume() {
        this.isEnabled = true;
        console.log('[ALERT SYSTEM] ▶️ Sistema reanudado');
    }

    // **OBTENER ESTADO**
    getStatus() {
        return {
            enabled: this.isEnabled,
            totalAlerts: this.alertHistory.length,
            subscribers: this.subscribers.size,
            maxHistorySize: this.maxHistorySize,
            lastAlert: this.alertHistory[0] || null,
            statistics: this.getStatistics()
        };
    }
}

module.exports = { AlertSystem };
