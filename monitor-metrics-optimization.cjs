#!/usr/bin/env node

/**
 * Monitor de Métricas Cuánticas - Análisis de Optimización
 * Copyright © 2025 VIGOLEONROCKS QUANTUM TECHNOLOGIES
 * 
 * Monitorea en tiempo real el impacto de la optimización de damping adaptativo
 */

const http = require('http');

class MetricsOptimizationMonitor {
    constructor() {
        this.serverUrl = 'http://localhost:18020';
        this.samples = [];
        this.startTime = Date.now();
        this.interval = null;
        this.sampleCount = 0;
        this.maxSamples = 50; // 50 muestras = ~2 minutos de datos
        
        console.log('🔍 MONITOR DE OPTIMIZACIÓN CUÁNTICA');
        console.log('=====================================');
        console.log('📊 Analizando el impacto del damping adaptativo');
        console.log('⏱️  Frecuencia: Cada 2.5 segundos');
        console.log('🎯 Objetivo: Validar estabilización de métricas');
        console.log('=====================================\n');
    }
    
    async fetchMetrics() {
        return new Promise((resolve, reject) => {
            const req = http.get(`${this.serverUrl}/api/coherence-state`, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        resolve(parsed.data);
                    } catch (error) {
                        reject(error);
                    }
                });
            });
            
            req.on('error', reject);
            req.setTimeout(5000, () => {
                req.destroy();
                reject(new Error('Timeout'));
            });
        });
    }
    
    analyzeSample(data) {
        const timestamp = Date.now();
        const globalState = data.globalQuantumState;
        
        const sample = {
            timestamp,
            elapsedTime: Math.round((timestamp - this.startTime) / 1000),
            consciousness: parseFloat(globalState.consciousness.toFixed(4)),
            coherence: parseFloat(globalState.coherence.toFixed(4)),
            entropy: parseFloat(globalState.entropy.toFixed(4)),
            energy: parseFloat(globalState.energy.toFixed(4)),
            resonance: parseFloat(globalState.resonance.toFixed(4)),
            alignment: parseFloat(globalState.alignment.toFixed(4)),
            version: globalState.version
        };
        
        // Calcular damping efectivo actual
        const dampingFactor = Math.max(0.3, sample.alignment);
        const effectiveOscillation = 0.05 * (1 - dampingFactor);
        sample.dampingFactor = parseFloat(dampingFactor.toFixed(4));
        sample.effectiveOscillation = parseFloat((effectiveOscillation * 100).toFixed(2)); // en porcentaje
        
        this.samples.push(sample);
        
        // Mantener solo las últimas N muestras
        if (this.samples.length > this.maxSamples) {
            this.samples.shift();
        }
        
        return sample;
    }
    
    calculateStatistics() {
        if (this.samples.length < 2) return null;
        
        const metrics = ['consciousness', 'coherence', 'entropy', 'energy', 'resonance', 'alignment'];
        const stats = {};
        
        metrics.forEach(metric => {
            const values = this.samples.map(s => s[metric]);
            const mean = values.reduce((a, b) => a + b) / values.length;
            const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2)) / values.length;
            const stdDev = Math.sqrt(variance);
            const min = Math.min(...values);
            const max = Math.max(...values);
            const range = max - min;
            
            // Calcular coeficiente de variación (estabilidad)
            const coefficientOfVariation = (stdDev / mean) * 100;
            
            stats[metric] = {
                mean: parseFloat(mean.toFixed(4)),
                stdDev: parseFloat(stdDev.toFixed(4)),
                min: parseFloat(min.toFixed(4)),
                max: parseFloat(max.toFixed(4)),
                range: parseFloat(range.toFixed(4)),
                stability: parseFloat((100 - coefficientOfVariation).toFixed(2)) // % de estabilidad
            };
        });
        
        // Estadísticas del damping
        const dampingValues = this.samples.map(s => s.dampingFactor);
        const oscillationValues = this.samples.map(s => s.effectiveOscillation);
        
        stats.damping = {
            avgDamping: parseFloat((dampingValues.reduce((a, b) => a + b) / dampingValues.length).toFixed(4)),
            avgOscillation: parseFloat((oscillationValues.reduce((a, b) => a + b) / oscillationValues.length).toFixed(2)),
            dampingStability: parseFloat((100 - (Math.sqrt(dampingValues.reduce((a, b) => a + Math.pow(b - stats.damping?.avgDamping || 0, 2)) / dampingValues.length) / (stats.damping?.avgDamping || 1)) * 100).toFixed(2))
        };
        
        return stats;
    }
    
    displayCurrentMetrics(sample) {
        console.clear();
        console.log('🔍 MONITOR DE OPTIMIZACIÓN CUÁNTICA - TIEMPO REAL');
        console.log('=' .repeat(80));
        console.log(`⏰ Tiempo transcurrido: ${sample.elapsedTime}s | Muestra #${this.sampleCount} | Versión: ${sample.version}`);
        console.log('');
        
        // Métricas actuales
        console.log('📊 MÉTRICAS ACTUALES:');
        console.log(`   Consciousness: ${sample.consciousness.toFixed(4)} ${this.getMetricStatus(sample.consciousness, 0.75)}`);
        console.log(`   Coherence:     ${sample.coherence.toFixed(4)} ${this.getMetricStatus(sample.coherence, 0.80)}`);
        console.log(`   Entropy:       ${sample.entropy.toFixed(4)} ${this.getEntropyStatus(sample.entropy)}`);
        console.log(`   Energy:        ${sample.energy.toFixed(4)} ${this.getMetricStatus(sample.energy, 0.65)}`);
        console.log(`   Resonance:     ${sample.resonance.toFixed(4)} ${this.getMetricStatus(sample.resonance, 0.85)}`);
        console.log(`   Alignment:     ${sample.alignment.toFixed(4)} ${this.getMetricStatus(sample.alignment, 0.82)}`);
        console.log('');
        
        // Optimización
        console.log('🎯 OPTIMIZACIÓN ACTIVA:');
        console.log(`   Damping Factor:        ${sample.dampingFactor.toFixed(4)} (${sample.dampingFactor >= 0.7 ? '✅ ALTO' : '⚠️  MEDIO'})`);
        console.log(`   Oscilación Efectiva:   ${sample.effectiveOscillation}% (${sample.effectiveOscillation < 2 ? '✅ ESTABLE' : '⚠️  ACTIVA'})`);
        console.log('');
        
        // Estadísticas si hay suficientes muestras
        const stats = this.calculateStatistics();
        if (stats && this.samples.length >= 10) {
            console.log('📈 ANÁLISIS DE ESTABILIDAD (últimas 10+ muestras):');
            console.log(`   Consciousness: ${stats.consciousness.stability}% estable (±${stats.consciousness.stdDev.toFixed(4)})`);
            console.log(`   Coherence:     ${stats.coherence.stability}% estable (±${stats.coherence.stdDev.toFixed(4)})`);
            console.log(`   Alignment:     ${stats.alignment.stability}% estable (±${stats.alignment.stdDev.toFixed(4)})`);
            console.log(`   Damping Prom:  ${stats.damping.avgDamping.toFixed(4)} | Osc Prom: ${stats.damping.avgOscillation}%`);
        }
        
        console.log('');
        console.log('💡 INTERPRETACIÓN:');
        if (sample.alignment > 0.8 && sample.effectiveOscillation < 1.5) {
            console.log('   🟢 ÓPTIMO: Alta alineación con mínima oscilación');
        } else if (sample.alignment > 0.7 && sample.effectiveOscillation < 2.5) {
            console.log('   🟡 BUENO: Convergiendo hacia estabilidad óptima');
        } else {
            console.log('   🟠 OPTIMIZANDO: Sistema ajustando parámetros');
        }
        
        console.log('\n[Presiona Ctrl+C para detener el monitoreo]');
    }
    
    getMetricStatus(value, target) {
        if (value >= target) return '✅';
        if (value >= target * 0.9) return '⚠️';
        return '❌';
    }
    
    getEntropyStatus(entropy) {
        if (entropy <= 0.25) return '✅';
        if (entropy <= 0.35) return '⚠️';
        return '❌';
    }
    
    async generateReport() {
        const stats = this.calculateStatistics();
        if (!stats) return;
        
        console.log('\n' + '=' .repeat(80));
        console.log('📋 REPORTE FINAL DE OPTIMIZACIÓN');
        console.log('=' .repeat(80));
        
        const totalTime = Math.round((Date.now() - this.startTime) / 1000);
        console.log(`⏱️  Duración total: ${totalTime}s | Muestras: ${this.samples.length}`);
        console.log('');
        
        console.log('📊 RESUMEN DE ESTABILIDAD:');
        Object.entries(stats).forEach(([metric, data]) => {
            if (metric !== 'damping') {
                console.log(`   ${metric.padEnd(12)}: ${data.stability}% estable | Rango: ${data.range.toFixed(4)} | Media: ${data.mean.toFixed(4)}`);
            }
        });
        
        console.log('');
        console.log('🎯 EFECTIVIDAD DEL DAMPING ADAPTATIVO:');
        console.log(`   Factor promedio:     ${stats.damping.avgDamping.toFixed(4)}`);
        console.log(`   Oscilación promedio: ${stats.damping.avgOscillation}%`);
        console.log(`   Estabilidad damping: ${stats.damping.dampingStability}%`);
        
        // Evaluar efectividad general
        const avgStability = Object.values(stats)
            .filter(s => s.stability !== undefined)
            .reduce((sum, s) => sum + s.stability, 0) / 6;
            
        console.log('');
        console.log('🏆 EVALUACIÓN GENERAL:');
        if (avgStability > 95 && stats.damping.avgOscillation < 1.5) {
            console.log('   🟢 EXCELENTE: Optimización funcionando perfectamente');
        } else if (avgStability > 90 && stats.damping.avgOscillation < 2.5) {
            console.log('   🟡 MUY BUENO: Sistema altamente estable');
        } else {
            console.log('   🟠 BUENO: Mejora notable en estabilidad');
        }
        
        console.log(`   Estabilidad promedio: ${avgStability.toFixed(1)}%`);
        console.log('=' .repeat(80));
    }
    
    async start() {
        console.log('🚀 Iniciando monitoreo...\n');
        
        this.interval = setInterval(async () => {
            try {
                const data = await this.fetchMetrics();
                const sample = this.analyzeSample(data);
                this.sampleCount++;
                this.displayCurrentMetrics(sample);
                
            } catch (error) {
                console.error('❌ Error obteniendo métricas:', error.message);
            }
        }, 2500); // Cada 2.5 segundos
        
        // Manejar Ctrl+C
        process.on('SIGINT', () => {
            clearInterval(this.interval);
            this.generateReport();
            process.exit(0);
        });
    }
}

// Ejecutar monitor
const monitor = new MetricsOptimizationMonitor();
monitor.start();
