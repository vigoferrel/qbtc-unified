/**
 * QBTC UNIFIED - Deterministic Math Utilities
 * Utilidades matemáticas deterministas para reemplazar Math.random()
 */

const { LEONARDO, QUANTUM } = require('../constants/QBTCConstants');

class DeterministicMath {
    constructor() {
        this.seed = Date.now();
        this.hashCache = new Map();
    }

    /**
     * Generar valor determinista basado en timestamp
     */
    calculateDeterministicValue(timestamp = Date.now()) {
        const hash = this.hashCode(timestamp.toString());
        return Math.abs(hash) / 2147483647; // Normalizar a [0, 1)
    }

    /**
     * Generar hash simple de una cadena
     */
    hashCode(str) {
        if (this.hashCache.has(str)) {
            return this.hashCache.get(str);
        }

        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convertir a entero de 32 bits
        }

        this.hashCache.set(str, hash);
        return hash;
    }

    /**
     * Generar número aleatorio determinista en rango [min, max)
     */
    randomDeterministic(min = 0, max = 1, timestamp = Date.now()) {
        const value = this.calculateDeterministicValue(timestamp);
        return min + value * (max - min);
    }

    /**
     * Generar número aleatorio determinista con distribución normal
     */
    randomNormalDeterministic(mean = 0, stdDev = 1, timestamp = Date.now()) {
        // Box-Muller transform
        const u1 = this.calculateDeterministicValue(timestamp);
        const u2 = this.calculateDeterministicValue(timestamp + 1);
        
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        
        return mean + z0 * stdDev;
    }

    /**
     * Generar número aleatorio determinista con distribución exponencial
     */
    randomExponentialDeterministic(lambda = 1, timestamp = Date.now()) {
        const u = this.calculateDeterministicValue(timestamp);
        return -Math.log(1 - u) / lambda;
    }

    /**
     * Generar número aleatorio determinista con distribución de Poisson
     */
    randomPoissonDeterministic(lambda = 1, timestamp = Date.now()) {
        let L = Math.exp(-lambda);
        let p = 1.0;
        let k = 0;

        do {
            k++;
            p *= this.calculateDeterministicValue(timestamp + k);
        } while (p > L);

        return k - 1;
    }

    /**
     * Generar array de números deterministas
     */
    generateDeterministicArray(length, min = 0, max = 1, timestamp = Date.now()) {
        const array = [];
        for (let i = 0; i < length; i++) {
            array.push(this.randomDeterministic(min, max, timestamp + i));
        }
        return array;
    }

    /**
     * Generar matriz determinista
     */
    generateDeterministicMatrix(rows, cols, min = 0, max = 1, timestamp = Date.now()) {
        const matrix = [];
        for (let i = 0; i < rows; i++) {
            const row = [];
            for (let j = 0; j < cols; j++) {
                row.push(this.randomDeterministic(min, max, timestamp + i * cols + j));
            }
            matrix.push(row);
        }
        return matrix;
    }

    /**
     * Calcular valor de consciencia determinista
     */
    calculateConsciousness(timestamp = Date.now()) {
        const baseValue = this.calculateDeterministicValue(timestamp);
        const evolution = this.calculateDeterministicValue(timestamp + 1000);
        
        return Math.min(1.0, LEONARDO.CONSCIOUSNESS.BASE_LEVEL + 
               (baseValue * LEONARDO.CONSCIOUSNESS.EVOLUTION_RATE * evolution));
    }

    /**
     * Calcular valor de coherencia cuántica determinista
     */
    calculateQuantumCoherence(timestamp = Date.now()) {
        const baseValue = this.calculateDeterministicValue(timestamp);
        const resonance = this.calculateDeterministicValue(timestamp + 2000);
        
        return Math.min(1.0, QUANTUM.STATES.COHERENCE + 
               (baseValue * resonance * LEONARDO.CONSCIOUSNESS.COHERENCE_FACTOR));
    }

    /**
     * Calcular valor de entropía determinista
     */
    calculateEntropy(timestamp = Date.now()) {
        const baseValue = this.calculateDeterministicValue(timestamp);
        const coherence = this.calculateQuantumCoherence(timestamp + 3000);
        
        return Math.max(0, Math.min(1, LEONARDO.CONSCIOUSNESS.ENTROPY_FACTOR + 
               (baseValue * (1 - coherence))));
    }

    /**
     * Calcular valor de energía determinista
     */
    calculateEnergy(timestamp = Date.now()) {
        const baseValue = this.calculateDeterministicValue(timestamp);
        const consciousness = this.calculateConsciousness(timestamp + 4000);
        
        return Math.max(0, Math.min(1, QUANTUM.STATES.ENERGY + 
               (baseValue * consciousness)));
    }

    /**
     * Calcular valor de resonancia determinista
     */
    calculateResonance(timestamp = Date.now()) {
        const baseValue = this.calculateDeterministicValue(timestamp);
        const goldenRatio = LEONARDO.GOLDEN_RATIO;
        
        return Math.max(0, Math.min(1, QUANTUM.STATES.RESONANCE + 
               (baseValue * goldenRatio)));
    }

    /**
     * Calcular valor de alineación determinista
     */
    calculateAlignment(timestamp = Date.now()) {
        const baseValue = this.calculateDeterministicValue(timestamp);
        const consciousness = this.calculateConsciousness(timestamp + 5000);
        
        return Math.max(0, Math.min(1, QUANTUM.STATES.ALIGNMENT + 
               (baseValue * consciousness)));
    }

    /**
     * Calcular valor de sincronización determinista
     */
    calculateSynchronization(timestamp = Date.now()) {
        const baseValue = this.calculateDeterministicValue(timestamp);
        const coherence = this.calculateQuantumCoherence(timestamp + 6000);
        
        return Math.max(0, Math.min(1, QUANTUM.STATES.SYNCHRONIZATION + 
               (baseValue * coherence)));
    }

    /**
     * Generar estado cuántico completo determinista
     */
    generateQuantumState(timestamp = Date.now()) {
        return {
            consciousness: this.calculateConsciousness(timestamp),
            coherence: this.calculateQuantumCoherence(timestamp + 1000),
            entropy: this.calculateEntropy(timestamp + 2000),
            energy: this.calculateEnergy(timestamp + 3000),
            resonance: this.calculateResonance(timestamp + 4000),
            alignment: this.calculateAlignment(timestamp + 5000),
            synchronization: this.calculateSynchronization(timestamp + 6000),
            timestamp: timestamp
        };
    }

    /**
     * Generar valores de Lambda 888 deterministas
     */
    generateLambda888Values(timestamp = Date.now()) {
        const baseValue = this.calculateDeterministicValue(timestamp);
        
        return {
            resonance: LEONARDO.LAMBDA_888.RESONANCE * (1 + baseValue * 0.1),
            frequency: LEONARDO.LAMBDA_888.FREQUENCY * (1 + baseValue * 0.05),
            harmonic: LEONARDO.LAMBDA_888.HARMONIC * (1 + baseValue * 0.2),
            coherence: Math.min(1.0, LEONARDO.LAMBDA_888.COHERENCE_THRESHOLD + baseValue * 0.1)
        };
    }

    /**
     * Generar valores de Hook Wheel deterministas
     */
    generateHookWheelValues(timestamp = Date.now()) {
        const baseValue = this.calculateDeterministicValue(timestamp);
        
        return {
            hookStrength: LEONARDO.HOOK_WHEEL.HOOK_STRENGTH * (1 + baseValue * 0.2),
            rotationSpeed: LEONARDO.HOOK_WHEEL.ROTATION_SPEED * (1 + baseValue * 0.5),
            harmonicSync: Math.min(1.0, LEONARDO.HOOK_WHEEL.HARMONIC_SYNC + baseValue * 0.1)
        };
    }

    /**
     * Generar valores de Colibrí-Halcón deterministas
     */
    generateColibriHalconValues(timestamp = Date.now()) {
        const baseValue = this.calculateDeterministicValue(timestamp);
        
        return {
            hummingbirdRatio: LEONARDO.COLIBRI_HALCON.HUMMINGBIRD_RATIO * (1 + baseValue * 0.1),
            hawkRatio: LEONARDO.COLIBRI_HALCON.HAWK_RATIO * (1 + baseValue * 0.1),
            symbiosisFactor: Math.min(1.0, LEONARDO.COLIBRI_HALCON.SYMBIOSIS_FACTOR + baseValue * 0.1),
            balanceThreshold: Math.min(1.0, LEONARDO.COLIBRI_HALCON.BALANCE_THRESHOLD + baseValue * 0.1),
            harmonicConvergence: Math.min(1.0, LEONARDO.COLIBRI_HALCON.HARMONIC_CONVERGENCE + baseValue * 0.05)
        };
    }

    /**
     * Limpiar caché de hashes
     */
    clearCache() {
        this.hashCache.clear();
    }

    /**
     * Obtener estadísticas de caché
     */
    getCacheStats() {
        return {
            size: this.hashCache.size,
            keys: Array.from(this.hashCache.keys())
        };
    }
}

// Exportar instancia única
module.exports = new DeterministicMath();