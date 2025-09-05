/**
 * QBTC UNIFIED - Hash Utilities
 * Utilidades de hash para cálculos deterministas y criptográficos
 */

const crypto = require('crypto');
const { LEONARDO, QUANTUM } = require('../constants/QBTCConstants');

class HashUtils {
    constructor() {
        this.hashCache = new Map();
        this.maxCacheSize = 1000;
    }

    /**
     * Generar hash SHA-256 de una cadena
     */
    sha256(str) {
        const cacheKey = `sha256_${str}`;
        if (this.hashCache.has(cacheKey)) {
            return this.hashCache.get(cacheKey);
        }

        const hash = crypto.createHash('sha256').update(str).digest('hex');
        
        this.addToCache(cacheKey, hash);
        return hash;
    }

    /**
     * Generar hash MD5 de una cadena
     */
    md5(str) {
        const cacheKey = `md5_${str}`;
        if (this.hashCache.has(cacheKey)) {
            return this.hashCache.get(cacheKey);
        }

        const hash = crypto.createHash('md5').update(str).digest('hex');
        
        this.addToCache(cacheKey, hash);
        return hash;
    }

    /**
     * Generar hash simple de 32 bits
     */
    hashCode32(str) {
        const cacheKey = `hash32_${str}`;
        if (this.hashCache.has(cacheKey)) {
            return this.hashCache.get(cacheKey);
        }

        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convertir a entero de 32 bits
        }

        this.addToCache(cacheKey, hash);
        return hash;
    }

    /**
     * Generar hash simple de 64 bits
     */
    hashCode64(str) {
        const cacheKey = `hash64_${str}`;
        if (this.hashCache.has(cacheKey)) {
            return this.hashCache.get(cacheKey);
        }

        const hash1 = this.hashCode32(str);
        const hash2 = this.hashCode32(str + '_salt');
        const hash64 = (hash1 << 32) | (hash2 & 0xFFFFFFFF);

        this.addToCache(cacheKey, hash64);
        return hash64;
    }

    /**
     * Generar hash con golden ratio
     */
    goldenHash(str) {
        const cacheKey = `golden_${str}`;
        if (this.hashCache.has(cacheKey)) {
            return this.hashCache.get(cacheKey);
        }

        const hash = this.hashCode32(str);
        const golden = LEONARDO.GOLDEN_RATIO;
        const goldenHash = hash * golden;

        this.addToCache(cacheKey, goldenHash);
        return goldenHash;
    }

    /**
     * Generar hash con Fibonacci
     */
    fibonacciHash(str, index = 13) {
        const cacheKey = `fib_${str}_${index}`;
        if (this.hashCache.has(cacheKey)) {
            return this.hashCache.get(cacheKey);
        }

        const hash = this.hashCode32(str);
        const fib = LEONARDO.FIBONACCI.SEQUENCE[index % LEONARDO.FIBONACCI.SEQUENCE.length];
        const fibHash = hash * fib;

        this.addToCache(cacheKey, fibHash);
        return fibHash;
    }

    /**
     * Generar hash con Lambda 888
     */
    lambda888Hash(str) {
        const cacheKey = `lambda_${str}`;
        if (this.hashCache.has(cacheKey)) {
            return this.hashCache.get(cacheKey);
        }

        const hash = this.hashCode32(str);
        const lambda = LEONARDO.LAMBDA_888.VALUE;
        const lambdaHash = hash * lambda;

        this.addToCache(cacheKey, lambdaHash);
        return lambdaHash;
    }

    /**
     * Generar hash cuántico
     */
    quantumHash(str) {
        const cacheKey = `quantum_${str}`;
        if (this.hashCache.has(cacheKey)) {
            return this.hashCache.get(cacheKey);
        }

        const hash = this.hashCode64(str);
        const coherence = QUANTUM.STATES.COHERENCE;
        const consciousness = QUANTUM.STATES.CONSCIOUSNESS;
        const quantumHash = hash * coherence * consciousness;

        this.addToCache(cacheKey, quantumHash);
        return quantumHash;
    }

    /**
     * Generar hash de tiempo determinista
     */
    timeHash(timestamp = Date.now()) {
        const cacheKey = `time_${timestamp}`;
        if (this.hashCache.has(cacheKey)) {
            return this.hashCache.get(cacheKey);
        }

        const timeStr = timestamp.toString();
        const hash = this.sha256(timeStr);
        const hashNum = parseInt(hash.substring(0, 8), 16);

        this.addToCache(cacheKey, hashNum);
        return hashNum;
    }

    /**
     * Generar hash de estado cuántico
     */
    quantumStateHash(state) {
        const stateStr = JSON.stringify(state);
        const cacheKey = `qstate_${stateStr}`;
        if (this.hashCache.has(cacheKey)) {
            return this.hashCache.get(cacheKey);
        }

        const hash = this.quantumHash(stateStr);
        const normalizedHash = Math.abs(hash) / Number.MAX_SAFE_INTEGER;

        this.addToCache(cacheKey, normalizedHash);
        return normalizedHash;
    }

    /**
     * Generar hash de trading
     */
    tradingHash(symbol, side, quantity, price, timestamp = Date.now()) {
        const data = `${symbol}_${side}_${quantity}_${price}_${timestamp}`;
        const cacheKey = `trading_${data}`;
        if (this.hashCache.has(cacheKey)) {
            return this.hashCache.get(cacheKey);
        }

        const hash = this.fibonacciHash(data, 8);
        const normalizedHash = Math.abs(hash) / 2147483647;

        this.addToCache(cacheKey, normalizedHash);
        return normalizedHash;
    }

    /**
     * Generar hash de mercado
     */
    marketHash(symbol, price, volume, timestamp = Date.now()) {
        const data = `${symbol}_${price}_${volume}_${timestamp}`;
        const cacheKey = `market_${data}`;
        if (this.hashCache.has(cacheKey)) {
            return this.hashCache.get(cacheKey);
        }

        const hash = this.goldenHash(data);
        const normalizedHash = Math.abs(hash) / 2147483647;

        this.addToCache(cacheKey, normalizedHash);
        return normalizedHash;
    }

    /**
     * Generar hash de posición
     */
    positionHash(symbol, quantity, entryPrice, timestamp = Date.now()) {
        const data = `${symbol}_${quantity}_${entryPrice}_${timestamp}`;
        const cacheKey = `position_${data}`;
        if (this.hashCache.has(cacheKey)) {
            return this.hashCache.get(cacheKey);
        }

        const hash = this.lambda888Hash(data);
        const normalizedHash = Math.abs(hash) / 2147483647;

        this.addToCache(cacheKey, normalizedHash);
        return normalizedHash;
    }

    /**
     * Generar hash de orden
     */
    orderHash(symbol, side, type, quantity, price, timestamp = Date.now()) {
        const data = `${symbol}_${side}_${type}_${quantity}_${price}_${timestamp}`;
        const cacheKey = `order_${data}`;
        if (this.hashCache.has(cacheKey)) {
            return this.hashCache.get(cacheKey);
        }

        const hash = this.sha256(data);
        const hashNum = parseInt(hash.substring(0, 16), 16);

        this.addToCache(cacheKey, hashNum);
        return hashNum;
    }

    /**
     * Generar hash de sesión
     */
    sessionHash(sessionId, timestamp = Date.now()) {
        const data = `${sessionId}_${timestamp}`;
        const cacheKey = `session_${data}`;
        if (this.hashCache.has(cacheKey)) {
            return this.hashCache.get(cacheKey);
        }

        const hash = this.quantumHash(data);
        const hashStr = hash.toString();

        this.addToCache(cacheKey, hashStr);
        return hashStr;
    }

    /**
     * Generar hash de API key
     */
    apiKeyHash(apiKey) {
        const cacheKey = `apikey_${apiKey}`;
        if (this.hashCache.has(cacheKey)) {
            return this.hashCache.get(cacheKey);
        }

        const hash = this.sha256(apiKey + '_salt');
        const shortHash = hash.substring(0, 32);

        this.addToCache(cacheKey, shortHash);
        return shortHash;
    }

    /**
     * Verificar integridad de hash
     */
    verifyHash(data, expectedHash, algorithm = 'sha256') {
        let computedHash;
        
        switch (algorithm) {
            case 'sha256':
                computedHash = this.sha256(data);
                break;
            case 'md5':
                computedHash = this.md5(data);
                break;
            case 'hash32':
                computedHash = this.hashCode32(data).toString();
                break;
            case 'golden':
                computedHash = this.goldenHash(data).toString();
                break;
            case 'fibonacci':
                computedHash = this.fibonacciHash(data).toString();
                break;
            case 'lambda':
                computedHash = this.lambda888Hash(data).toString();
                break;
            case 'quantum':
                computedHash = this.quantumHash(data).toString();
                break;
            default:
                return false;
        }

        return computedHash === expectedHash;
    }

    /**
     * Agregar hash a caché
     */
    addToCache(key, hash) {
        if (this.hashCache.size >= this.maxCacheSize) {
            // Eliminar el primer elemento de la caché
            const firstKey = this.hashCache.keys().next().value;
            this.hashCache.delete(firstKey);
        }
        
        this.hashCache.set(key, hash);
    }

    /**
     * Limpiar caché
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
            maxSize: this.maxCacheSize,
            keys: Array.from(this.hashCache.keys())
        };
    }

    /**
     * Generar hash único basado en múltiples parámetros
     */
    generateUniqueId(...params) {
        const paramString = params.join('_');
        return this.sha256(paramString).substring(0, 16);
    }
}

// Exportar instancia única
module.exports = new HashUtils();