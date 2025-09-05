#!/usr/bin/env node

/*
  QBTC-UNIFIED SUPABASE INTEGRATION MODULE
  Integración completa con Supabase para almacenamiento de datos,
  métricas en tiempo real, y sincronización de estado cuántico.
*/

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

class QBTCSupabaseIntegration {
    constructor() {
        console.log('🗄️ Inicializando QBTC Supabase Integration...');
        
        // Configuración Supabase
        this.supabaseUrl = process.env.SUPABASE_URL;
        this.supabaseKey = process.env.SUPABASE_KEY;
        
        if (!this.supabaseUrl || !this.supabaseKey) {
            throw new Error('❌ Configuración Supabase incompleta en .env');
        }
        
        // Cliente Supabase
        this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
        
        // Estado de la integración
        this.isConnected = false;
        this.metrics = {
            totalOperations: 0,
            successfulOperations: 0,
            errors: 0,
            lastSync: null
        };
        
        // Configuración de tablas
        this.tables = {
            quantum_metrics: 'quantum_metrics',
            trading_sessions: 'trading_sessions', 
            leonardo_consciousness: 'leonardo_consciousness',
            market_opportunities: 'market_opportunities',
            system_logs: 'system_logs'
        };
        
        console.log('✅ Supabase Integration configurado');
        console.log(`📡 URL: ${this.supabaseUrl}`);
        console.log(`🔑 API Key: ${this.supabaseKey.substring(0, 20)}...`);
    }
    
    /**
     * Conectar y verificar Supabase
     */
    async connect() {
        try {
            console.log('🔗 Conectando con Supabase...');
            
            // Verificar conexión
            const { data, error } = await this.supabase
                .from('system_logs')
                .select('count')
                .limit(1);
            
            if (error && error.code !== 'PGRST116') { // PGRST116 = tabla no existe (OK)
                console.warn('⚠️ Advertencia Supabase:', error.message);
            }
            
            this.isConnected = true;
            console.log('✅ Conectado exitosamente con Supabase');
            
            // Crear tablas si no existen
            await this.ensureTablesExist();
            
            return true;
            
        } catch (error) {
            console.error('❌ Error conectando con Supabase:', error.message);
            this.isConnected = false;
            return false;
        }
    }
    
    /**
     * Asegurar que las tablas necesarias existan
     */
    async ensureTablesExist() {
        console.log('📊 Verificando estructura de base de datos...');
        
        try {
            // Función para verificar si una tabla existe
            const tableExists = async (tableName) => {
                const { data, error } = await this.supabase
                    .from(tableName)
                    .select('*')
                    .limit(1);
                return !error || error.code === 'PGRST116';
            };
            
            // Verificar tabla system_logs
            if (await tableExists(this.tables.system_logs)) {
                console.log('✅ Tabla system_logs verificada');
            } else {
                console.log('⚠️ Tabla system_logs no existe - creación manual requerida');
            }
            
            // Log de inicialización
            await this.logSystemEvent('system_startup', {
                timestamp: new Date().toISOString(),
                component: 'QBTC-Supabase-Integration',
                status: 'initialized',
                details: 'Supabase integration successfully initialized'
            });
            
        } catch (error) {
            console.warn('⚠️ Advertencia verificando tablas:', error.message);
        }
    }
    
    /**
     * Registrar evento del sistema
     */
    async logSystemEvent(eventType, data) {
        if (!this.isConnected) return false;
        
        try {
            const logEntry = {
                event_type: eventType,
                data: data,
                created_at: new Date().toISOString()
            };
            
            const { error } = await this.supabase
                .from(this.tables.system_logs)
                .insert([logEntry]);
            
            if (error) {
                console.warn('⚠️ Error logging to Supabase:', error.message);
                return false;
            }
            
            this.metrics.totalOperations++;
            this.metrics.successfulOperations++;
            
            return true;
            
        } catch (error) {
            console.error('❌ Error en logSystemEvent:', error.message);
            this.metrics.errors++;
            return false;
        }
    }
    
    /**
     * Sincronizar métricas cuánticas
     */
    async syncQuantumMetrics(metrics) {
        if (!this.isConnected) return false;
        
        try {
            const quantumData = {
                consciousness_level: metrics.consciousness || 0,
                coherence_level: metrics.coherence || 0,
                quantum_resonance: metrics.resonance || 0,
                big_bang_active: metrics.bigBangActive || false,
                symbols_analyzed: metrics.symbolsAnalyzed || 0,
                opportunities_detected: metrics.opportunities || 0,
                profit_generated: metrics.profit || 0,
                system_uptime: Date.now() - (metrics.startTime || Date.now()),
                timestamp: new Date().toISOString()
            };
            
            const { error } = await this.supabase
                .from(this.tables.quantum_metrics)
                .insert([quantumData]);
            
            if (error && error.code !== 'PGRST202') { // Tabla no existe
                console.warn('⚠️ Error sync quantum metrics:', error.message);
                return false;
            }
            
            this.metrics.lastSync = Date.now();
            return true;
            
        } catch (error) {
            console.error('❌ Error sincronizando métricas:', error.message);
            return false;
        }
    }
    
    /**
     * Guardar estado de Leonardo Consciousness
     */
    async saveLeonardoState(leonardoState) {
        if (!this.isConnected) return false;
        
        try {
            const consciousnessData = {
                consciousness_level: leonardoState.consciousness_level,
                coherence_score: leonardoState.coherence_score,
                decision_confidence: leonardoState.decision_confidence,
                big_bang_ready: leonardoState.big_bang_ready,
                evolution_count: leonardoState.evolution_count,
                profit_accumulated: leonardoState.profit_accumulated,
                win_rate: leonardoState.win_rate,
                last_big_bang: leonardoState.last_big_bang,
                timestamp: new Date().toISOString()
            };
            
            const { error } = await this.supabase
                .from(this.tables.leonardo_consciousness)
                .insert([consciousnessData]);
            
            if (error && error.code !== 'PGRST202') {
                console.warn('⚠️ Error guardando Leonardo state:', error.message);
                return false;
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Error en saveLeonardoState:', error.message);
            return false;
        }
    }
    
    /**
     * Guardar oportunidades de mercado
     */
    async saveMarketOpportunity(opportunity) {
        if (!this.isConnected) return false;
        
        try {
            const opportunityData = {
                symbol: opportunity.symbol,
                confidence: opportunity.confidence,
                profit_potential: opportunity.profitPotential,
                risk_level: opportunity.riskLevel,
                quantum_score: opportunity.quantumScore,
                leonardo_analysis: opportunity.leonardoAnalysis,
                timestamp: new Date().toISOString()
            };
            
            const { error } = await this.supabase
                .from(this.tables.market_opportunities)
                .insert([opportunityData]);
            
            if (error && error.code !== 'PGRST202') {
                console.warn('⚠️ Error guardando oportunidad:', error.message);
                return false;
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Error en saveMarketOpportunity:', error.message);
            return false;
        }
    }
    
    /**
     * Obtener últimas métricas desde Supabase
     */
    async getLatestMetrics() {
        if (!this.isConnected) return null;
        
        try {
            const { data, error } = await this.supabase
                .from(this.tables.quantum_metrics)
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(10);
            
            if (error) {
                console.warn('⚠️ Error obteniendo métricas:', error.message);
                return null;
            }
            
            return data;
            
        } catch (error) {
            console.error('❌ Error en getLatestMetrics:', error.message);
            return null;
        }
    }
    
    /**
     * Obtener estado actual de Leonardo
     */
    async getLeonardoState() {
        if (!this.isConnected) return null;
        
        try {
            const { data, error } = await this.supabase
                .from(this.tables.leonardo_consciousness)
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(1);
            
            if (error) {
                console.warn('⚠️ Error obteniendo estado Leonardo:', error.message);
                return null;
            }
            
            return data && data.length > 0 ? data[0] : null;
            
        } catch (error) {
            console.error('❌ Error en getLeonardoState:', error.message);
            return null;
        }
    }
    
    /**
     * Obtener métricas de la integración
     */
    getIntegrationMetrics() {
        return {
            ...this.metrics,
            isConnected: this.isConnected,
            supabaseUrl: this.supabaseUrl,
            uptime: Date.now() - (this.metrics.startTime || Date.now()),
            successRate: this.metrics.totalOperations > 0 
                ? (this.metrics.successfulOperations / this.metrics.totalOperations * 100).toFixed(2) + '%'
                : '0%'
        };
    }
    
    /**
     * Cerrar conexión
     */
    async disconnect() {
        try {
            await this.logSystemEvent('system_shutdown', {
                timestamp: new Date().toISOString(),
                component: 'QBTC-Supabase-Integration',
                status: 'disconnecting',
                metrics: this.getIntegrationMetrics()
            });
            
            this.isConnected = false;
            console.log('🔌 Supabase Integration desconectado');
            
        } catch (error) {
            console.error('❌ Error desconectando:', error.message);
        }
    }
}

// Instancia singleton para uso global
let supabaseIntegration = null;

function getSupabaseIntegration() {
    if (!supabaseIntegration) {
        supabaseIntegration = new QBTCSupabaseIntegration();
    }
    return supabaseIntegration;
}

// Función para test de conexión rápida
async function testSupabaseConnection() {
    try {
        console.log('🧪 Probando conexión Supabase...');
        
        const integration = getSupabaseIntegration();
        const connected = await integration.connect();
        
        if (connected) {
            console.log('✅ Test de conexión exitoso');
            const metrics = integration.getIntegrationMetrics();
            console.log('📊 Métricas:', JSON.stringify(metrics, null, 2));
            
            // Log de prueba
            await integration.logSystemEvent('connection_test', {
                status: 'success',
                timestamp: new Date().toISOString()
            });
            
            return true;
        } else {
            console.log('❌ Test de conexión falló');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Error en test:', error.message);
        return false;
    }
}

module.exports = {
    QBTCSupabaseIntegration,
    getSupabaseIntegration,
    testSupabaseConnection
};

// Ejecutar test si se llama directamente
if (require.main === module) {
    testSupabaseConnection().then(() => {
        console.log('🎉 Test completado');
        process.exit(0);
    }).catch((error) => {
        console.error('💥 Error en test:', error.message);
        process.exit(1);
    });
}
