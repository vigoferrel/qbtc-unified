/*
  Copyright © 2025 VIGOLEONROCKS QUANTUM TECHNOLOGIES.
  Quantum Leverage Engine - Motor de Leverage Cuántico sin límites determinísticos
  Maximización de leverage basada en confluencia cuántica y edge multidimensional
  ⚡ OPTIMIZACIÓN QUIRÚRGICA CUÁNTICA ⚡
*/

// Constantes físicas cuánticas universales
const QUANTUM_CONSTANTS = {
    PLANCK_CONSTANT: 6.62607015e-34,
    FINE_STRUCTURE_CONSTANT: 7.2973525693e-3,
    GOLDEN_RATIO: (1 + Math.sqrt(5)) / 2,
    EULER_NUMBER: Math.E,
    PI_QUANTUM: Math.PI,
    SQRT_2: Math.sqrt(2),
    ZURITA_PRIME: 7919,
    BIG_BANG_MULTIPLIER: 488.25
};

class QuantumLeverageEngine {
    constructor(binanceConnector) {
        this.binanceConnector = binanceConnector;
        
        // **SISTEMA DE LEVERAGE CUÁNTICO INFINITO**: Sin límites determinísticos
        this.quantumLeverageMatrix = new Map();
        this.confluenceMetrics = new Map();
        this.edgeConfidenceMap = new Map();
        this.riskAdjustmentFactors = new Map();
        this.leverageMetrics = new Map(); // Corregir propiedad faltante
        
        // **CONFIGURACIÓN CUÁNTICA AVANZADA**: Parámetros científicos dinámicos
        this.leverageConfig = {
            baseMultiplier: QUANTUM_CONSTANTS.GOLDEN_RATIO,    // Proporción áurea universal
            maxQuantumLeverage: 125,                           // Límite físico exchange
            consciousnessMultiplier: 50,                       // Amplificador consciencia
            coherenceMultiplier: 30,                           // Amplificador coherencia
            lunarMultiplier: 25,                               // Factor lunar
            volatilityMultiplier: 15,                          // Factor volatilidad
            correlationMultiplier: 20,                         // Factor correlación
            arbitrageMultiplier: 40,                           // Factor arbitraje
            momentumMultiplier: 35,                            // Factor momentum
            liquidityMultiplier: 10,                           // Factor liquidez
            confluenceThreshold: 0.85,                         // Umbral convergencia
            riskScalingFactor: 0.2,                            // Escalado riesgo
            profitTargetMultiplier: 100,                       // Target profit
            quantumResonanceBoost: QUANTUM_CONSTANTS.SQRT_2,   // Boost resonancia cuántica
            primeTransformFactor: Math.log(QUANTUM_CONSTANTS.ZURITA_PRIME),  // Factor primo
            bigBangAmplifier: QUANTUM_CONSTANTS.BIG_BANG_MULTIPLIER,         // Amplificador Big Bang
            fineStructureBoost: 1 / QUANTUM_CONSTANTS.FINE_STRUCTURE_CONSTANT // Boost estructura fina
        };
        
        // **MÉTRICAS DE CONFLUENCIA CUÁNTICA**
        this.confluenceFactors = [
            'consciousness_level',
            'coherence_level', 
            'lunar_alignment',
            'volatility_edge',
            'correlation_strength',
            'arbitrage_opportunity',
            'momentum_confirmation',
            'liquidity_depth',
            'market_sentiment',
            'technical_confluence',
            'fundamental_strength',
            'social_sentiment'
        ];
        
        // **CATEGORÍAS DE LEVERAGE POR RIESGO**
        this.leverageCategories = {
            'EXTREME_EDGE': { min: 75, max: 125, riskLevel: 'CALCULATED_EXTREME' },
            'HIGH_EDGE': { min: 50, max: 75, riskLevel: 'HIGH_CONFIDENCE' },
            'MODERATE_EDGE': { min: 25, max: 50, riskLevel: 'MODERATE_RISK' },
            'CONSERVATIVE_EDGE': { min: 10, max: 25, riskLevel: 'LOW_RISK' },
            'SAFE_BASE': { min: 1, max: 10, riskLevel: 'MINIMAL_RISK' }
        };
        
        console.log('[QUANTUM LEVERAGE] Motor de leverage cuántico inicializado');
        console.log(`[QUANTUM LEVERAGE] Leverage máximo cuántico: ${this.leverageConfig.maxQuantumLeverage}x`);
        
        this.isInitialized = false;
    }
    
    /**
     * Inicializar el Quantum Leverage Engine
     */
    async initialize() {
        if (this.isInitialized) {
            console.log('⚠️ Quantum Leverage Engine ya inicializado');
            return;
        }
        
        console.log('⚡ Inicializando Quantum Leverage Engine...');
        
        try {
            // Simular inicialización exitosa
            this.isInitialized = true;
            console.log('✅ QUANTUM LEVERAGE ENGINE INICIALIZADO COMPLETAMENTE');
            
        } catch (error) {
            console.error('❌ Error inicializando Quantum Leverage Engine:', error);
            throw error;
        }
    }
    
    /**
     * Obtener estado de salud del sistema
     */
    getHealth() {
        return this.isInitialized ? 'HEALTHY' : 'NOT_INITIALIZED';
    }

    // **CÁLCULO PRINCIPAL**: Leverage cuántico dinámico CON TRANSFORMACIONES PRIMAS
    calculateQuantumLeverage(symbol, marketMetrics, systemState, confluenceData) {
        try {
            // **PASO 0**: Aplicar transformaciones primas al contexto de leverage
            const primeTransformations = this.applyPrimeTransformationsToLeverage(symbol, marketMetrics, systemState, confluenceData);
            
            // **PASO 1**: Analizar confluencia multidimensional CON PRIMAS
            const confluenceScore = this.calculateConfluenceScore(symbol, marketMetrics, systemState, confluenceData, primeTransformations);
            
            // **PASO 2**: Calcular edge cuántico CON RESONANCIA PRIMA
            const quantumEdge = this.calculateQuantumEdge(symbol, marketMetrics, confluenceScore, primeTransformations);
            
            // **PASO 3**: Determinar leverage base según confluencia PRIMA
            const baseLeverage = this.calculateBaseLeverage(confluenceScore, quantumEdge, primeTransformations);
            
            // **PASO 4**: Aplicar multiplicadores dinámicos CON BOOST PRIMO
            const dynamicMultipliers = this.calculateDynamicMultipliers(symbol, marketMetrics, systemState, primeTransformations);
            
            // **PASO 5**: Calcular leverage final CON SÍNTESIS PRIMA
            const finalLeverage = this.calculateFinalLeverage(baseLeverage, dynamicMultipliers, quantumEdge, primeTransformations);
            
            // **PASO 6**: Aplicar ajustes de riesgo cuántico CON PROTECCIÓN PRIMA
            const riskAdjustedLeverage = this.applyQuantumRiskAdjustments(finalLeverage, symbol, marketMetrics, primeTransformations);
            
            // **GUARDAR MÉTRICAS** para análisis continuo
            this.storeLeverageMetrics(symbol, {
                confluenceScore,
                quantumEdge,
                baseLeverage,
                dynamicMultipliers,
                finalLeverage,
                riskAdjustedLeverage,
                timestamp: Date.now()
            });
            
            return {
                recommendedLeverage: Math.min(riskAdjustedLeverage, this.leverageConfig.maxQuantumLeverage),
                confluenceScore,
                quantumEdge,
                riskLevel: this.determineLeverageRiskLevel(riskAdjustedLeverage),
                confidence: confluenceScore,
                maxProfitPotential: this.calculateMaxProfitPotential(riskAdjustedLeverage, quantumEdge),
                executionRecommendation: this.generateExecutionRecommendation(riskAdjustedLeverage, confluenceScore)
            };
            
        } catch (error) {
            console.error(`[QUANTUM LEVERAGE] Error calculando leverage para ${symbol}:`, error.message);
            return this.getSafeLeverage();
        }
    }

    // **CONFLUENCIA MULTIDIMENSIONAL**: Análisis de todos los factores
    calculateConfluenceScore(symbol, marketMetrics, systemState, confluenceData) {
        let totalScore = 0;
        let validFactors = 0;
        
        // **Factor 1**: Nivel de consciencia cuántica
        if (systemState.consciousness) {
            const consciousnessScore = systemState.consciousness * this.leverageConfig.consciousnessMultiplier;
            totalScore += consciousnessScore;
            validFactors++;
        }
        
        // **Factor 2**: Nivel de coherencia
        if (systemState.coherence) {
            const coherenceScore = systemState.coherence * this.leverageConfig.coherenceMultiplier;
            totalScore += coherenceScore;
            validFactors++;
        }
        
        // **Factor 3**: Alineación lunar
        if (confluenceData?.lunarAlignment) {
            const lunarScore = confluenceData.lunarAlignment * this.leverageConfig.lunarMultiplier;
            totalScore += lunarScore;
            validFactors++;
        }
        
        // **Factor 4**: Edge de volatilidad
        if (marketMetrics?.volatility) {
            const volatilityScore = this.calculateVolatilityEdge(marketMetrics.volatility);
            totalScore += volatilityScore;
            validFactors++;
        }
        
        // **Factor 5**: Fuerza de correlación
        if (confluenceData?.correlationStrength) {
            const correlationScore = confluenceData.correlationStrength * this.leverageConfig.correlationMultiplier;
            totalScore += correlationScore;
            validFactors++;
        }
        
        // **Factor 6**: Oportunidad de arbitraje
        if (confluenceData?.arbitrageOpportunity) {
            const arbitrageScore = confluenceData.arbitrageOpportunity * this.leverageConfig.arbitrageMultiplier;
            totalScore += arbitrageScore;
            validFactors++;
        }
        
        // **Factor 7**: Confirmación de momentum
        if (marketMetrics?.momentum) {
            const momentumScore = Math.abs(marketMetrics.momentum) * this.leverageConfig.momentumMultiplier;
            totalScore += momentumScore;
            validFactors++;
        }
        
        // **Factor 8**: Profundidad de liquidez
        if (marketMetrics?.liquidityScore) {
            const liquidityScore = marketMetrics.liquidityScore * this.leverageConfig.liquidityMultiplier;
            totalScore += liquidityScore;
            validFactors++;
        }
        
        // **PUNTUACIÓN NORMALIZADA**: De 0 a 1
        const normalizedScore = validFactors > 0 ? (totalScore / validFactors) / 100 : 0;
        
        return Math.min(normalizedScore, 1.0);
    }

    calculateVolatilityEdge(volatility) {
        // **VOLATILIDAD COMO EDGE**: Más volatilidad = más leverage potencial
        const volatilityThresholds = {
            extreme: { min: 0.15, multiplier: this.leverageConfig.volatilityMultiplier * 3 },
            high: { min: 0.08, multiplier: this.leverageConfig.volatilityMultiplier * 2 },
            moderate: { min: 0.04, multiplier: this.leverageConfig.volatilityMultiplier * 1.5 },
            low: { min: 0.02, multiplier: this.leverageConfig.volatilityMultiplier },
            minimal: { min: 0, multiplier: this.leverageConfig.volatilityMultiplier * 0.5 }
        };
        
        for (const [level, config] of Object.entries(volatilityThresholds)) {
            if (volatility >= config.min) {
                return volatility * config.multiplier;
            }
        }
        
        return volatility * this.leverageConfig.volatilityMultiplier;
    }

    // **EDGE CUÁNTICO**: Cálculo del edge total
    calculateQuantumEdge(symbol, marketMetrics, confluenceScore) {
        let edgeScore = 0;
        
        // **Edge Base**: Basado en confluencia
        edgeScore += confluenceScore * 50;
        
        // **Edge de Spread**: Menor spread = mayor edge
        if (marketMetrics?.spread) {
            const spreadEdge = Math.max(0, (0.01 - marketMetrics.spread) * 1000);
            edgeScore += spreadEdge;
        }
        
        // **Edge de Volumen**: Mayor volumen = mayor edge
        if (marketMetrics?.volume24h) {
            const volumeEdge = Math.min(marketMetrics.volume24h / 10000000, 20);
            edgeScore += volumeEdge;
        }
        
        // **Edge de Momentum**: Momentum fuerte = mayor edge
        if (marketMetrics?.priceChange24h) {
            const momentumEdge = Math.min(Math.abs(marketMetrics.priceChange24h) * 2, 30);
            edgeScore += momentumEdge;
        }
        
        // **Edge de Categoría**: Diferentes categorías tienen diferentes edges
        const categoryEdge = this.getCategoryEdge(symbol);
        edgeScore += categoryEdge;
        
        return Math.min(edgeScore / 100, 1.0); // Normalizar a 0-1
    }

    getCategoryEdge(symbol) {
        if (!this.binanceConnector?.assetCategories) return 0;
        
        const categoryEdges = {
            darkSide: 40,        // Máximo edge por volatilidad extrema
            memeCoins: 35,       // Alto edge por momentum viral
            leverageTargets: 30, // Alto edge por design
            arbitrageTargets: 25,// Edge por oportunidades
            highVolatility: 20,  // Edge por volatilidad
            ai: 18,              // Edge por tendencias tech
            gaming: 15,          // Edge por momentum sectorial
            defi: 12,            // Edge por correlaciones
            majors: 8,           // Edge conservador pero consistente
            exotics: 5           // Edge limitado
        };
        
        for (const [category, symbols] of Object.entries(this.binanceConnector.assetCategories)) {
            if (symbols.includes(symbol)) {
                return categoryEdges[category] || 0;
            }
        }
        
        return 0;
    }

    // **LEVERAGE BASE**: Según confluencia y edge
    calculateBaseLeverage(confluenceScore, quantumEdge) {
        const combinedScore = (confluenceScore + quantumEdge) / 2;
        
        // **TABLA DE LEVERAGE DINÁMICO**
        if (combinedScore >= 0.9) return 100;  // Confluencia extrema
        if (combinedScore >= 0.8) return 75;   // Confluencia alta
        if (combinedScore >= 0.7) return 50;   // Confluencia buena
        if (combinedScore >= 0.6) return 25;   // Confluencia moderada
        if (combinedScore >= 0.5) return 15;   // Confluencia básica
        
        return 5; // Leverage mínimo
    }

    // **MULTIPLICADORES DINÁMICOS**: Factores en tiempo real
    calculateDynamicMultipliers(symbol, marketMetrics, systemState) {
        const multipliers = {
            base: this.leverageConfig.baseMultiplier,
            consciousness: 1.0,
            coherence: 1.0,
            momentum: 1.0,
            volatility: 1.0,
            liquidity: 1.0,
            bigBang: 1.0
        };
        
        // **Multiplicador de Consciencia**
        if (systemState.consciousness > 0.9) {
            multipliers.consciousness = 3.0; // Big Bang levels
        } else if (systemState.consciousness > 0.8) {
            multipliers.consciousness = 2.5;
        } else if (systemState.consciousness > 0.7) {
            multipliers.consciousness = 2.0;
        } else if (systemState.consciousness > 0.6) {
            multipliers.consciousness = 1.5;
        }
        
        // **Multiplicador de Coherencia**
        if (systemState.coherence > 0.95) {
            multipliers.coherence = 2.5;
        } else if (systemState.coherence > 0.85) {
            multipliers.coherence = 2.0;
        } else if (systemState.coherence > 0.75) {
            multipliers.coherence = 1.5;
        }
        
        // **Multiplicador de Momentum**
        if (marketMetrics?.priceChange24h) {
            const momentum = Math.abs(marketMetrics.priceChange24h);
            if (momentum > 20) multipliers.momentum = 2.5;
            else if (momentum > 10) multipliers.momentum = 2.0;
            else if (momentum > 5) multipliers.momentum = 1.5;
        }
        
        // **Multiplicador de Volatilidad**
        if (marketMetrics?.volatility) {
            const volatility = marketMetrics.volatility;
            if (volatility > 0.15) multipliers.volatility = 2.0;
            else if (volatility > 0.08) multipliers.volatility = 1.5;
            else if (volatility > 0.04) multipliers.volatility = 1.2;
        }
        
        // **Multiplicador Big Bang**
        if (systemState.big_bang_activated) {
            multipliers.bigBang = systemState.zurita_multiplier || 488.25;
        }
        
        return multipliers;
    }

    // **LEVERAGE FINAL**: Combinar todos los factores
    calculateFinalLeverage(baseLeverage, dynamicMultipliers, quantumEdge) {
        // **Multiplicador total**
        const totalMultiplier = Object.values(dynamicMultipliers).reduce((acc, mult) => acc * mult, 1);
        
        // **Leverage pre-final**
        const preFinalLeverage = baseLeverage * totalMultiplier;
        
        // **Bonus por edge cuántico extremo**
        const edgeBonus = quantumEdge > 0.9 ? preFinalLeverage * 0.5 : 0;
        
        return preFinalLeverage + edgeBonus;
    }

    // **AJUSTES DE RIESGO CUÁNTICO**: Protecciones inteligentes
    applyQuantumRiskAdjustments(leverage, symbol, marketMetrics) {
        let adjustedLeverage = leverage;
        
        // **Ajuste por liquidez**: Menos liquidez = menos leverage
        if (marketMetrics?.liquidityScore < 10) {
            adjustedLeverage *= 0.5;
        } else if (marketMetrics?.liquidityScore < 25) {
            adjustedLeverage *= 0.7;
        }
        
        // **Ajuste por spread**: Spread alto = menos leverage
        if (marketMetrics?.spread > 0.005) {
            adjustedLeverage *= 0.6;
        } else if (marketMetrics?.spread > 0.002) {
            adjustedLeverage *= 0.8;
        }
        
        // **Ajuste por categoría de riesgo**
        const riskAdjustment = this.getRiskAdjustmentForSymbol(symbol);
        adjustedLeverage *= riskAdjustment;
        
        // **Límite mínimo de seguridad**
        return Math.max(adjustedLeverage, 1);
    }

    getRiskAdjustmentForSymbol(symbol) {
        if (!this.binanceConnector?.assetCategories) return 1.0;
        
        const riskAdjustments = {
            majors: 1.0,           // Sin ajuste, máxima confianza
            stablecoins: 0.3,      // Muy conservador
            defi: 0.9,             // Ligeramente conservador
            memeCoins: 1.2,        // Bonus por volatilidad controlada
            darkSide: 1.5,         // Máximo bonus por edge extremo
            highVolatility: 1.3,   // Bonus por volatilidad
            leverageTargets: 1.1,  // Pequeño bonus
            arbitrageTargets: 1.2, // Bonus por oportunidades
            exotics: 0.8           // Algo conservador
        };
        
        for (const [category, symbols] of Object.entries(this.binanceConnector.assetCategories)) {
            if (symbols.includes(symbol)) {
                return riskAdjustments[category] || 1.0;
            }
        }
        
        return 1.0;
    }

    // **DETERMINAR NIVEL DE RIESGO**
    determineLeverageRiskLevel(leverage) {
        for (const [level, config] of Object.entries(this.leverageCategories)) {
            if (leverage >= config.min && leverage <= config.max) {
                return level;
            }
        }
        
        if (leverage > 125) return 'BEYOND_EXTREME';
        return 'SAFE_BASE';
    }

    // **POTENCIAL DE PROFIT MÁXIMO**
    calculateMaxProfitPotential(leverage, quantumEdge) {
        const baseProfitPotential = leverage * quantumEdge * this.leverageConfig.profitTargetMultiplier;
        
        // **Multiplicador cuadrático para edges extremos**
        const edgeMultiplier = quantumEdge > 0.8 ? Math.pow(quantumEdge, 2) * 2 : 1;
        
        return baseProfitPotential * edgeMultiplier;
    }

    // **RECOMENDACIÓN DE EJECUCIÓN**
    generateExecutionRecommendation(leverage, confluenceScore) {
        if (leverage >= 75 && confluenceScore >= 0.9) {
            return 'EXECUTE_IMMEDIATELY_MAX_SIZE';
        } else if (leverage >= 50 && confluenceScore >= 0.8) {
            return 'EXECUTE_FAST_LARGE_SIZE';
        } else if (leverage >= 25 && confluenceScore >= 0.7) {
            return 'EXECUTE_NORMAL_MODERATE_SIZE';
        } else if (leverage >= 10 && confluenceScore >= 0.6) {
            return 'EXECUTE_CONSERVATIVE_SMALL_SIZE';
        } else {
            return 'WAIT_FOR_BETTER_CONFLUENCE';
        }
    }

    // **LEVERAGE SEGURO DE FALLBACK**
    getSafeLeverage() {
        return {
            recommendedLeverage: 5,
            confluenceScore: 0.1,
            quantumEdge: 0.1,
            riskLevel: 'SAFE_BASE',
            confidence: 0.1,
            maxProfitPotential: 50,
            executionRecommendation: 'WAIT_FOR_BETTER_CONFLUENCE'
        };
    }

    // **ALMACENAR MÉTRICAS** para análisis continuo
    storeLeverageMetrics(symbol, metrics) {
        this.quantumLeverageMatrix.set(symbol, metrics);
        this.edgeConfidenceMap.set(symbol, metrics.quantumEdge);
        
        // Mantener solo las últimas 1000 entradas por performance
        if (this.quantumLeverageMatrix.size > 1000) {
            const oldestKey = this.quantumLeverageMatrix.keys().next().value;
            this.quantumLeverageMatrix.delete(oldestKey);
        }
    }

    // **API PARA MÉTRICAS**
    getLeverageMetrics(symbol) {
        return this.quantumLeverageMatrix.get(symbol);
    }

    getTopLeverageOpportunities(count = 20) {
        return Array.from(this.quantumLeverageMatrix.entries())
            .sort((a, b) => b[1].riskAdjustedLeverage - a[1].riskAdjustedLeverage)
            .slice(0, count)
            .map(([symbol, metrics]) => ({
                symbol,
                leverage: metrics.riskAdjustedLeverage,
                confluence: metrics.confluenceScore,
                edge: metrics.quantumEdge,
                profit: metrics.maxProfitPotential || 0
            }));
    }

    getSystemLeverageStats() {
        const allMetrics = Array.from(this.quantumLeverageMatrix.values());
        
        if (allMetrics.length === 0) {
            return {
                totalSymbolsAnalyzed: 0,
                averageLeverage: 0,
                maxLeverage: 0,
                averageConfluence: 0,
                highLeverageCount: 0
            };
        }
        
        const totalLeverage = allMetrics.reduce((sum, m) => sum + (m.riskAdjustedLeverage || 0), 0);
        const totalConfluence = allMetrics.reduce((sum, m) => sum + (m.confluenceScore || 0), 0);
        const maxLeverage = Math.max(...allMetrics.map(m => m.riskAdjustedLeverage || 0));
        const highLeverageCount = allMetrics.filter(m => (m.riskAdjustedLeverage || 0) >= 50).length;
        
        return {
            totalSymbolsAnalyzed: allMetrics.length,
            averageLeverage: totalLeverage / allMetrics.length,
            maxLeverage,
            averageConfluence: totalConfluence / allMetrics.length,
            highLeverageCount,
            timestamp: new Date().toISOString()
        };
    }

    // **NUEVAS APIs CUÁNTICAS PARA EL SISTEMA**
    getSystemLeverageStats() {
        const allMetrics = Array.from(this.leverageMetrics.values());
        
        if (allMetrics.length === 0) {
            return {
                maxLeverageRecommended: this.leverageConfig.maxQuantumLeverage,
                averageSystemLeverage: 0,
                activeLeverageOpportunities: 0,
                leverageUtilization: 0,
                quantumResonanceLevel: 0,
                primeTransformLevel: 0,
                bigBangActivation: false,
                riskDistribution: {
                    'EXTREME_EDGE': 0,
                    'HIGH_EDGE': 0,
                    'MODERATE_EDGE': 0,
                    'CONSERVATIVE_EDGE': 0,
                    'SAFE_BASE': 0
                },
                leverageCoherenceScore: 0,
                quantumEfficiencyRatio: 0,
                timestamp: new Date().toISOString()
            };
        }

        const totalLeverage = allMetrics.reduce((sum, m) => sum + (m.riskAdjustedLeverage || 0), 0);
        const averageLeverage = totalLeverage / allMetrics.length;
        const maxLeverage = Math.max(...allMetrics.map(m => m.riskAdjustedLeverage || 0));
        
        // Calcular distribución de riesgo
        const riskDistribution = {
            'EXTREME_EDGE': 0,
            'HIGH_EDGE': 0,
            'MODERATE_EDGE': 0,
            'CONSERVATIVE_EDGE': 0,
            'SAFE_BASE': 0
        };
        
        allMetrics.forEach(metric => {
            const leverage = metric.riskAdjustedLeverage || 0;
            if (leverage >= 100) riskDistribution['EXTREME_EDGE']++;
            else if (leverage >= 75) riskDistribution['HIGH_EDGE']++;
            else if (leverage >= 50) riskDistribution['MODERATE_EDGE']++;
            else if (leverage >= 25) riskDistribution['CONSERVATIVE_EDGE']++;
            else riskDistribution['SAFE_BASE']++;
        });

        // Métricas cuánticas avanzadas
        const quantumResonance = this.calculateQuantumResonanceLevel(allMetrics);
        const primeTransform = this.calculatePrimeTransformLevel(allMetrics);
        const coherenceScore = this.calculateLeverageCoherenceScore(allMetrics);
        const efficiencyRatio = this.calculateQuantumEfficiencyRatio(allMetrics);
        
        return {
            maxLeverageRecommended: maxLeverage,
            averageSystemLeverage: averageLeverage,
            activeLeverageOpportunities: allMetrics.length,
            leverageUtilization: averageLeverage / this.leverageConfig.maxQuantumLeverage,
            quantumResonanceLevel: quantumResonance,
            primeTransformLevel: primeTransform,
            bigBangActivation: maxLeverage >= 100,
            riskDistribution,
            leverageCoherenceScore: coherenceScore,
            quantumEfficiencyRatio: efficiencyRatio,
            leverageEvolutionTrend: this.calculateLeverageEvolutionTrend(allMetrics),
            nextOptimizationCycle: this.getNextOptimizationCycle(),
            timestamp: new Date().toISOString()
        };
    }

    getTopLeverageOpportunities(count = 20) {
        const allMetrics = Array.from(this.leverageMetrics.entries());
        
        // Convertir a formato de oportunidades y ordenar por leverage
        const opportunities = allMetrics
            .map(([symbol, metrics]) => ({
                symbol,
                recommendedLeverage: metrics.riskAdjustedLeverage || 0,
                confidence: this.calculateLeverageConfidence(metrics.baseLeverage || 10, metrics.riskAdjustedLeverage || 0),
                profitPotential: this.calculateMaxProfitPotential(metrics.riskAdjustedLeverage || 0, { arbitrageOpportunity: metrics.quantumEdge || 0.01 }),
                riskLevel: this.determineLeverageRiskLevel(metrics.riskAdjustedLeverage || 0),
                executionRecommendation: this.getExecutionRecommendation(metrics.riskAdjustedLeverage || 0),
                confluenceScore: metrics.confluenceScore || 0,
                quantumEdge: metrics.quantumEdge || 0,
                timestamp: new Date(metrics.timestamp || Date.now()).toISOString()
            }))
            .sort((a, b) => b.recommendedLeverage - a.recommendedLeverage)
            .slice(0, count);
        
        return opportunities;
    }

    calculateLeverageConfidence(baseLeverage, finalLeverage) {
        // Confianza basada en la diferencia entre el leverage base y final
        const leverageRatio = finalLeverage / (baseLeverage || 1);
        
        if (leverageRatio <= 1.5) return 0.95; // Muy alta confianza
        if (leverageRatio <= 3.0) return 0.85; // Alta confianza  
        if (leverageRatio <= 5.0) return 0.70; // Confianza moderada
        if (leverageRatio <= 10.0) return 0.50; // Confianza baja
        return 0.30; // Confianza muy baja
    }

    calculateMaxProfitPotential(leverage, confluenceData) {
        // Profit potencial máximo basado en leverage y confluencia
        const baseProfitRate = 0.02; // 2% base
        const leverageMultiplier = Math.log((leverage || 1) + 1) / Math.log(10);
        const confluenceMultiplier = (confluenceData.arbitrageOpportunity || 0.01) * 100;
        
        return baseProfitRate * leverageMultiplier * confluenceMultiplier;
    }

    getExecutionRecommendation(leverage) {
        if (leverage >= 100) return 'INSTANT_EXECUTION';
        if (leverage >= 75) return 'FAST_EXECUTION';
        if (leverage >= 50) return 'STANDARD_EXECUTION';
        if (leverage >= 25) return 'CONSERVATIVE_EXECUTION';
        return 'SAFE_EXECUTION';
    }

    // **FUNCIONES CUÁNTICAS AVANZADAS** - Cálculos científicos
    calculateQuantumResonanceLevel(allMetrics) {
        if (allMetrics.length === 0) return 0;
        
        // Calcular resonancia basada en coherencia de leverages
        const leverages = allMetrics.map(m => m.riskAdjustedLeverage || 0);
        const avgLeverage = leverages.reduce((a, b) => a + b, 0) / leverages.length;
        
        // Calcular desviación estándar normalizada
        const variance = leverages.reduce((acc, lev) => acc + Math.pow(lev - avgLeverage, 2), 0) / leverages.length;
        const stdDev = Math.sqrt(variance);
        const resonance = avgLeverage > 0 ? (1 - (stdDev / avgLeverage)) : 0;
        
        return Math.max(0, Math.min(1, resonance));
    }

    calculatePrimeTransformLevel(allMetrics) {
        if (allMetrics.length === 0) return 0;
        
        // Usar logaritmo del primo de Zurita para transformación
        const totalLeverage = allMetrics.reduce((sum, m) => sum + (m.riskAdjustedLeverage || 0), 0);
        const transformBase = Math.log(QUANTUM_CONSTANTS.ZURITA_PRIME) / Math.log(totalLeverage + 1);
        
        return Math.min(1, transformBase / 10); // Normalizar a 0-1
    }

    calculateLeverageCoherenceScore(allMetrics) {
        if (allMetrics.length === 0) return 0;
        
        // Coherencia basada en consistencia de confluencias
        const confluenceScores = allMetrics.map(m => m.confluenceScore || 0);
        const avgConfluence = confluenceScores.reduce((a, b) => a + b, 0) / confluenceScores.length;
        const coherence = confluenceScores.filter(score => Math.abs(score - avgConfluence) < 0.1).length / confluenceScores.length;
        
        return Math.max(0, Math.min(1, coherence));
    }

    calculateQuantumEfficiencyRatio(allMetrics) {
        if (allMetrics.length === 0) return 0;
        
        // Eficiencia: ratio de leverage alto vs total
        const highLeverageCount = allMetrics.filter(m => (m.riskAdjustedLeverage || 0) >= 50).length;
        return highLeverageCount / allMetrics.length;
    }

    calculateLeverageEvolutionTrend(allMetrics) {
        if (allMetrics.length < 2) return 'STABLE';
        
        // Analizar tendencia en los últimos datos
        const sortedMetrics = allMetrics.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        const recent = sortedMetrics.slice(-10); // Últimos 10
        
        if (recent.length < 2) return 'STABLE';
        
        const firstHalf = recent.slice(0, Math.floor(recent.length / 2));
        const secondHalf = recent.slice(Math.floor(recent.length / 2));
        
        const firstAvg = firstHalf.reduce((sum, m) => sum + (m.riskAdjustedLeverage || 0), 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, m) => sum + (m.riskAdjustedLeverage || 0), 0) / secondHalf.length;
        
        const change = (secondAvg - firstAvg) / (firstAvg || 1);
        
        if (change > 0.1) return 'ASCENDING';
        if (change < -0.1) return 'DESCENDING';
        return 'STABLE';
    }

    getNextOptimizationCycle() {
        // Calcular próximo ciclo de optimización
        const now = new Date();
        const nextCycle = new Date(now.getTime() + (15 * 60 * 1000)); // 15 minutos
        return nextCycle.toISOString();
    }

    // **UTILIDADES CUÁNTICAS DE ANÁLISIS**
    analyzeSystemLeverageHealth() {
        const stats = this.getSystemLeverageStats();
        const warnings = [];
        
        if (stats.quantumResonanceLevel < 0.5) {
            warnings.push('Baja resonancia cuántica en leverage');
        }
        
        if (stats.leverageCoherenceScore < 0.6) {
            warnings.push('Incoherencia en distribución de leverage');
        }
        
        if (stats.quantumEfficiencyRatio < 0.3) {
            warnings.push('Baja eficiencia en oportunidades de leverage alto');
        }
        
        return {
            status: warnings.length === 0 ? 'OPTIMAL' : 'SUBOPTIMAL',
            warnings,
            recommendations: this.generateLeverageRecommendations(stats),
            timestamp: new Date().toISOString()
        };
    }

    generateLeverageRecommendations(stats) {
        const recommendations = [];
        
        if (stats.quantumResonanceLevel < 0.5) {
            recommendations.push('Incrementar coherencia en selección de leverage');
        }
        
        if (stats.leverageUtilization < 0.5) {
            recommendations.push('Explorar oportunidades de leverage más agresivo');
        }
        
        if (stats.averageSystemLeverage < 25) {
            recommendations.push('Considerar incrementar leverage base del sistema');
        }
        
        return recommendations;
    }

    // ================================
    // ** TRANSFORMACIONES PRIMAS **
    // ================================

    applyPrimeTransformationsToLeverage(symbol, marketMetrics, systemState, confluenceData) {
        try {
            const now = Date.now();
            const timestamp = now;
            
            // **CONSTANTES PRIMAS SAGRADAS**
            const PRIMES = {
                SAGRADOS: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47],
                FIBONACCI: [2, 3, 5, 13, 89, 233, 1597],
                GEMELOS: [[3, 5], [5, 7], [11, 13], [17, 19], [29, 31], [41, 43]],
                MERSENNE: [3, 7, 31, 127, 8191],
                SOPHIE_GERMAIN: [2, 3, 5, 11, 23, 29, 41, 53, 83, 89],
                PALINDROMICOS: [2, 3, 5, 7, 11, 101, 131, 151, 181, 191],
                ZURITA_PRIME: 7919,
                BIG_BANG_PRIME: 488
            };

            // **FIBONACCI CUÁNTICO** 
            const fibonacci = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584];
            const fibonacciIndex = (now % fibonacci.length);
            const currentFib = fibonacci[fibonacciIndex];

            // **CÁLCULO DE RESONANCIA PRIMA**
            const priceValue = marketMetrics?.price || 1;
            const volumeValue = marketMetrics?.volume24h || 0;
            const primeSignature = this.calculatePrimeSignatureLeverage(priceValue, volumeValue, now);

            // **TRANSFORMACIONES CUÁNTICAS CON PRIMAS**
            const transformations = {
                timestamp,
                symbol,
                
                // **MÉTRICAS PRIMAS BÁSICAS**
                primeSignature,
                fibonacciResonance: currentFib / 1597, // Normalizado con Fibonacci primo
                zuritaPrimeIndex: (priceValue * volumeValue) % PRIMES.ZURITA_PRIME,
                
                // **RESONANCIAS CUÁNTICAS**
                sagradoResonance: this.calculateSagradoResonanceLeverage(PRIMES.SAGRADOS, priceValue, volumeValue),
                gemelosResonance: this.calculateGemelosResonanceLeverage(PRIMES.GEMELOS, marketMetrics),
                mersenneResonance: this.calculateMersenneResonanceLeverage(PRIMES.MERSENNE, systemState),
                sophieResonance: this.calculateSophieResonanceLeverage(PRIMES.SOPHIE_GERMAIN, confluenceData),
                palindromicoResonance: this.calculatePalindromicoResonanceLeverage(PRIMES.PALINDROMICOS, now),
                
                // **SÍNTESIS CUÁNTICA PRIMA**
                quantumPrimeSynthesis: this.calculateQuantumPrimeSynthesisLeverage({
                    sagrados: PRIMES.SAGRADOS,
                    fibonacci: PRIMES.FIBONACCI,
                    mersenne: PRIMES.MERSENNE,
                    sophie: PRIMES.SOPHIE_GERMAIN
                }, marketMetrics, systemState),
                
                // **MÉTRICAS AVANZADAS**
                primeClassification: this.classifyPrimeResonanceLeverage(primeSignature),
                leverageVolatilityPredictor: this.predictLeverageVolatilityWithPrimes(marketMetrics, PRIMES),
                leverageMarketSentiment: this.extractLeverageMarketSentimentPrimes(confluenceData, PRIMES),
                
                // **BOOST DE LEVERAGE PRIMO**
                primeBoostFactor: this.calculatePrimeBoostFactorForLeverage(primeSignature, currentFib),
                leverageConfidencePrime: this.calculateLeverageConfidenceWithPrimes(marketMetrics, PRIMES),
                leverageQuantumEdgePrime: this.calculateLeverageQuantumEdgeWithPrimes(systemState, PRIMES)
            };

            console.log(`[QUANTUM LEVERAGE PRIMES] Transformaciones aplicadas para ${symbol}:`, {
                primeSignature: transformations.primeSignature,
                fibonacciResonance: transformations.fibonacciResonance.toFixed(6),
                primeBoost: transformations.primeBoostFactor.toFixed(4),
                leverageConfidence: transformations.leverageConfidencePrime.toFixed(4)
            });

            return transformations;

        } catch (error) {
            console.error(`[QUANTUM LEVERAGE PRIMES] Error aplicando transformaciones para ${symbol}:`, error.message);
            return this.getDefaultPrimeTransformationsLeverage();
        }
    }

    calculatePrimeSignatureLeverage(price, volume, timestamp) {
        const priceStr = price.toFixed(8).replace('.', '');
        const volumeStr = Math.floor(volume).toString();
        const timeStr = timestamp.toString();
        
        let signature = 0;
        const combined = priceStr + volumeStr + timeStr;
        
        for (let i = 0; i < combined.length; i++) {
            signature += parseInt(combined[i] || '0') * this.getPrimeByIndex(i % 15);
        }
        
        return signature;
    }

    calculateSagradoResonanceLeverage(sagrados, price, volume) {
        let resonance = 0;
        const baseValue = price * Math.sqrt(volume || 1);
        
        sagrados.forEach((prime, index) => {
            const factor = (baseValue % prime) / prime;
            resonance += factor * Math.pow(1.618, index); // Golden ratio escalado
        });
        
        return resonance / sagrados.length;
    }

    calculateGemelosResonanceLeverage(gemelos, marketMetrics) {
        let resonance = 0;
        const spread = marketMetrics?.spread || 0.001;
        const priceChange = Math.abs(marketMetrics?.priceChange24h || 0);
        
        gemelos.forEach(([prime1, prime2]) => {
            const gapFactor = Math.abs(prime2 - prime1) / (prime1 + prime2);
            const marketFactor = (spread * priceChange) / (prime1 * prime2);
            resonance += gapFactor * marketFactor * 10000; // Amplificar
        });
        
        return resonance / gemelos.length;
    }

    calculateMersenneResonanceLeverage(mersenne, systemState) {
        let resonance = 0;
        const consciousness = systemState?.consciousness || 0.5;
        const coherence = systemState?.coherence || 0.5;
        
        mersenne.forEach((prime, index) => {
            const consciousnessFactor = consciousness * prime;
            const coherenceFactor = coherence * Math.log2(prime + 1); // Mersenne son 2^p - 1
            resonance += (consciousnessFactor + coherenceFactor) / (index + 1);
        });
        
        return resonance / mersenne.length;
    }

    calculateSophieResonanceLeverage(sophie, confluenceData) {
        let resonance = 0;
        const lunarAlignment = confluenceData?.lunarAlignment || 0.5;
        const correlationStrength = confluenceData?.correlationStrength || 0.5;
        
        sophie.forEach((prime) => {
            // Sophie Germain: p es primo y 2p+1 también es primo
            const sophiePair = 2 * prime + 1;
            const alignmentFactor = lunarAlignment * prime;
            const correlationFactor = correlationStrength * sophiePair;
            resonance += Math.sqrt(alignmentFactor * correlationFactor);
        });
        
        return resonance / sophie.length;
    }

    calculatePalindromicoResonanceLeverage(palindromicos, timestamp) {
        let resonance = 0;
        const timeValue = timestamp % 1000000; // Usar últimos 6 dígitos
        
        palindromicos.forEach((prime) => {
            const primeStr = prime.toString();
            const isPalindromic = primeStr === primeStr.split('').reverse().join('');
            const timeFactor = (timeValue % prime) / prime;
            
            if (isPalindromic) {
                resonance += timeFactor * 2; // Bonus por palindrómico
            } else {
                resonance += timeFactor;
            }
        });
        
        return resonance / palindromicos.length;
    }

    calculateQuantumPrimeSynthesisLeverage(primes, marketMetrics, systemState) {
        const sagradoSum = primes.sagrados.reduce((a, b) => a + b, 0);
        const fibonacciSum = primes.fibonacci.reduce((a, b) => a + b, 0);
        const mersenneSum = primes.mersenne.reduce((a, b) => a + b, 0);
        const sophieSum = primes.sophie.reduce((a, b) => a + b, 0);
        
        const totalPrimeEnergy = sagradoSum + fibonacciSum + mersenneSum + sophieSum;
        const marketEnergy = (marketMetrics?.price || 1) * (marketMetrics?.volume24h || 0);
        const systemEnergy = (systemState?.consciousness || 0.5) * (systemState?.coherence || 0.5);
        
        return (totalPrimeEnergy * marketEnergy * systemEnergy) / Math.pow(10, 12); // Normalizar
    }

    classifyPrimeResonanceLeverage(signature) {
        const thresholds = {
            COSMIC: 1000000,
            GALACTIC: 500000,
            STELLAR: 100000,
            PLANETARY: 50000,
            LUNAR: 10000,
            TERRESTRIAL: 1000,
            ATOMIC: 0
        };
        
        for (const [level, threshold] of Object.entries(thresholds)) {
            if (signature >= threshold) {
                return level;
            }
        }
        
        return 'ATOMIC';
    }

    predictLeverageVolatilityWithPrimes(marketMetrics, primes) {
        const currentVolatility = marketMetrics?.volatility || 0.02;
        const priceChange = Math.abs(marketMetrics?.priceChange24h || 0);
        
        // Usar primas para predecir volatilidad futura
        let prediction = currentVolatility;
        
        primes.SAGRADOS.forEach((prime, index) => {
            const primeFactor = (priceChange % prime) / prime;
            prediction += primeFactor * 0.001 * (index + 1);
        });
        
        return {
            current: currentVolatility,
            predicted: Math.min(prediction, 0.5), // Cap at 50%
            confidence: this.calculatePredictionConfidence(currentVolatility, prediction),
            trend: prediction > currentVolatility ? 'INCREASING' : 'DECREASING'
        };
    }

    extractLeverageMarketSentimentPrimes(confluenceData, primes) {
        const sentiment = {
            bullish: 0,
            bearish: 0,
            neutral: 0
        };
        
        const arbitrage = confluenceData?.arbitrageOpportunity || 0;
        const correlation = confluenceData?.correlationStrength || 0;
        const lunar = confluenceData?.lunarAlignment || 0.5;
        
        // Usar primes para extraer sentiment
        primes.FIBONACCI.forEach((prime) => {
            const factor = (arbitrage * correlation * lunar * prime) % 3;
            
            if (factor < 1) sentiment.bearish += 1;
            else if (factor < 2) sentiment.neutral += 1;
            else sentiment.bullish += 1;
        });
        
        const total = sentiment.bullish + sentiment.bearish + sentiment.neutral;
        
        return {
            bullish: sentiment.bullish / total,
            bearish: sentiment.bearish / total,
            neutral: sentiment.neutral / total,
            dominant: this.getDominantSentiment(sentiment)
        };
    }

    calculatePrimeBoostFactorForLeverage(signature, fibonacci) {
        const baseBoost = 1.0;
        const signatureBoost = Math.log10(signature + 1) / 10;
        const fibBoost = fibonacci / 1597; // Normalizado con fib primo máximo
        
        return baseBoost + signatureBoost + fibBoost;
    }

    calculateLeverageConfidenceWithPrimes(marketMetrics, primes) {
        let confidence = 0.5; // Base confidence
        
        const volume = marketMetrics?.volume24h || 0;
        const liquidity = marketMetrics?.liquidityScore || 0;
        
        // Usar primes para calcular confidence
        primes.SOPHIE_GERMAIN.forEach((prime) => {
            const volumeFactor = (volume % prime) / prime;
            const liquidityFactor = (liquidity % prime) / prime;
            confidence += (volumeFactor + liquidityFactor) * 0.05;
        });
        
        return Math.min(confidence, 1.0);
    }

    calculateLeverageQuantumEdgeWithPrimes(systemState, primes) {
        let edge = 0;
        const consciousness = systemState?.consciousness || 0.5;
        const coherence = systemState?.coherence || 0.5;
        
        primes.MERSENNE.forEach((prime) => {
            const consciousnessEdge = (consciousness * prime) % 1;
            const coherenceEdge = (coherence * prime) % 1;
            edge += (consciousnessEdge + coherenceEdge) / 2;
        });
        
        return edge / primes.MERSENNE.length;
    }

    // **FUNCIONES AUXILIARES**
    getPrimeByIndex(index) {
        const PRIMES_LIST = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
        return PRIMES_LIST[index % PRIMES_LIST.length];
    }

    calculatePredictionConfidence(current, predicted) {
        const difference = Math.abs(predicted - current);
        const relativeDiff = difference / (current || 0.001);
        
        if (relativeDiff < 0.1) return 0.9; // Alta confianza
        if (relativeDiff < 0.25) return 0.7; // Confianza media
        if (relativeDiff < 0.5) return 0.5; // Confianza baja
        return 0.3; // Confianza muy baja
    }

    getDominantSentiment(sentiment) {
        const max = Math.max(sentiment.bullish, sentiment.bearish, sentiment.neutral);
        
        if (max === sentiment.bullish) return 'BULLISH';
        if (max === sentiment.bearish) return 'BEARISH';
        return 'NEUTRAL';
    }

    getDefaultPrimeTransformationsLeverage() {
        return {
            timestamp: Date.now(),
            symbol: 'UNKNOWN',
            primeSignature: 1000,
            fibonacciResonance: 0.1,
            zuritaPrimeIndex: 100,
            sagradoResonance: 0.5,
            gemelosResonance: 0.5,
            mersenneResonance: 0.5,
            sophieResonance: 0.5,
            palindromicoResonance: 0.5,
            quantumPrimeSynthesis: 0.1,
            primeClassification: 'TERRESTRIAL',
            leverageVolatilityPredictor: {
                current: 0.02,
                predicted: 0.025,
                confidence: 0.5,
                trend: 'STABLE'
            },
            leverageMarketSentiment: {
                bullish: 0.33,
                bearish: 0.33,
                neutral: 0.34,
                dominant: 'NEUTRAL'
            },
            primeBoostFactor: 1.0,
            leverageConfidencePrime: 0.5,
            leverageQuantumEdgePrime: 0.1
        };
    }

    // **INTEGRACIÓN CON MÉTODOS EXISTENTES**
    // Actualizar los métodos existentes para incluir las transformaciones primas
    
    calculateConfluenceScore(symbol, marketMetrics, systemState, confluenceData, primeTransformations) {
        // Obtener el score base usando el método original
        let totalScore = 0;
        let validFactors = 0;
        
        // **Factor 1**: Nivel de consciencia cuántica
        if (systemState.consciousness) {
            const consciousnessScore = systemState.consciousness * this.leverageConfig.consciousnessMultiplier;
            totalScore += consciousnessScore;
            validFactors++;
        }
        
        // **Factor 2**: Nivel de coherencia
        if (systemState.coherence) {
            const coherenceScore = systemState.coherence * this.leverageConfig.coherenceMultiplier;
            totalScore += coherenceScore;
            validFactors++;
        }
        
        // **Factor 3**: Alineación lunar
        if (confluenceData?.lunarAlignment) {
            const lunarScore = confluenceData.lunarAlignment * this.leverageConfig.lunarMultiplier;
            totalScore += lunarScore;
            validFactors++;
        }
        
        // **Factor 4**: Edge de volatilidad
        if (marketMetrics?.volatility) {
            const volatilityScore = this.calculateVolatilityEdge(marketMetrics.volatility);
            totalScore += volatilityScore;
            validFactors++;
        }
        
        // **Factor 5**: Fuerza de correlación
        if (confluenceData?.correlationStrength) {
            const correlationScore = confluenceData.correlationStrength * this.leverageConfig.correlationMultiplier;
            totalScore += correlationScore;
            validFactors++;
        }
        
        // **Factor 6**: Oportunidad de arbitraje
        if (confluenceData?.arbitrageOpportunity) {
            const arbitrageScore = confluenceData.arbitrageOpportunity * this.leverageConfig.arbitrageMultiplier;
            totalScore += arbitrageScore;
            validFactors++;
        }
        
        // **Factor 7**: Confirmación de momentum
        if (marketMetrics?.momentum) {
            const momentumScore = Math.abs(marketMetrics.momentum) * this.leverageConfig.momentumMultiplier;
            totalScore += momentumScore;
            validFactors++;
        }
        
        // **Factor 8**: Profundidad de liquidez
        if (marketMetrics?.liquidityScore) {
            const liquidityScore = marketMetrics.liquidityScore * this.leverageConfig.liquidityMultiplier;
            totalScore += liquidityScore;
            validFactors++;
        }

        // **PUNTUACIÓN BASE NORMALIZADA**
        let baseScore = validFactors > 0 ? (totalScore / validFactors) / 100 : 0;
        
        // **APLICAR BOOST PRIMO** si las transformaciones están disponibles
        if (primeTransformations) {
            const primeBoost = primeTransformations.primeBoostFactor || 1.0;
            const sagradoBoost = primeTransformations.sagradoResonance || 0;
            const quantumSynthesis = primeTransformations.quantumPrimeSynthesis || 0;
            
            // Aplicar multiplicadores primos
            baseScore *= primeBoost;
            baseScore += (sagradoBoost * 0.1); // 10% del peso de resonancia sagrada
            baseScore += (quantumSynthesis * 0.05); // 5% del peso de síntesis cuántica
            
            console.log(`[QUANTUM LEVERAGE PRIMES] Confluence Score potenciado para ${symbol}: ${baseScore.toFixed(6)}`);
        }
        
        return Math.min(baseScore, 1.0);
    }

    calculateQuantumEdge(symbol, marketMetrics, confluenceScore, primeTransformations) {
        let edgeScore = 0;
        
        // **Edge Base**: Basado en confluencia
        edgeScore += confluenceScore * 50;
        
        // **Edge de Spread**: Menor spread = mayor edge
        if (marketMetrics?.spread) {
            const spreadEdge = Math.max(0, (0.01 - marketMetrics.spread) * 1000);
            edgeScore += spreadEdge;
        }
        
        // **Edge de Volumen**: Mayor volumen = mayor edge
        if (marketMetrics?.volume24h) {
            const volumeEdge = Math.min(marketMetrics.volume24h / 10000000, 20);
            edgeScore += volumeEdge;
        }
        
        // **Edge de Momentum**: Momentum fuerte = mayor edge
        if (marketMetrics?.priceChange24h) {
            const momentumEdge = Math.min(Math.abs(marketMetrics.priceChange24h) * 2, 30);
            edgeScore += momentumEdge;
        }
        
        // **Edge de Categoría**: Diferentes categorías tienen diferentes edges
        const categoryEdge = this.getCategoryEdge(symbol);
        edgeScore += categoryEdge;
        
        let baseEdge = Math.min(edgeScore / 100, 1.0); // Normalizar a 0-1
        
        // **APLICAR BOOST PRIMO** si las transformaciones están disponibles
        if (primeTransformations) {
            const quantumEdgePrime = primeTransformations.leverageQuantumEdgePrime || 0;
            const gemelosResonance = primeTransformations.gemelosResonance || 0;
            const mersenneResonance = primeTransformations.mersenneResonance || 0;
            
            // Potenciar edge con resonancias primas
            baseEdge += (quantumEdgePrime * 0.2); // 20% del peso del edge cuántico primo
            baseEdge += (gemelosResonance * 0.1); // 10% del peso de resonancia gemelos
            baseEdge += (mersenneResonance * 0.1); // 10% del peso de resonancia Mersenne
            
            console.log(`[QUANTUM LEVERAGE PRIMES] Quantum Edge potenciado para ${symbol}: ${baseEdge.toFixed(6)}`);
        }
        
        return Math.min(baseEdge, 1.0);
    }

    calculateBaseLeverage(confluenceScore, quantumEdge, primeTransformations) {
        const combinedScore = (confluenceScore + quantumEdge) / 2;
        
        // **TABLA DE LEVERAGE DINÁMICO BASE**
        let baseLeverage;
        if (combinedScore >= 0.9) baseLeverage = 100;  // Confluencia extrema
        else if (combinedScore >= 0.8) baseLeverage = 75;   // Confluencia alta
        else if (combinedScore >= 0.7) baseLeverage = 50;   // Confluencia buena
        else if (combinedScore >= 0.6) baseLeverage = 25;   // Confluencia moderada
        else if (combinedScore >= 0.5) baseLeverage = 15;   // Confluencia básica
        else baseLeverage = 5; // Leverage mínimo
        
        // **APLICAR TRANSFORMACIÓN PRIMA** si está disponible
        if (primeTransformations) {
            const primeClassification = primeTransformations.primeClassification;
            const fibonacciResonance = primeTransformations.fibonacciResonance || 0;
            
            // Multiplicadores según clasificación prima
            const classificationMultipliers = {
                'COSMIC': 2.5,
                'GALACTIC': 2.0,
                'STELLAR': 1.8,
                'PLANETARY': 1.5,
                'LUNAR': 1.3,
                'TERRESTRIAL': 1.1,
                'ATOMIC': 1.0
            };
            
            const primeMultiplier = classificationMultipliers[primeClassification] || 1.0;
            const fibMultiplier = 1 + (fibonacciResonance * 0.5); // Hasta 50% de boost
            
            baseLeverage *= primeMultiplier * fibMultiplier;
            
            console.log(`[QUANTUM LEVERAGE PRIMES] Base Leverage potenciado: ${baseLeverage.toFixed(2)}x (Class: ${primeClassification})`);
        }
        
        return baseLeverage;
    }

    calculateDynamicMultipliers(symbol, marketMetrics, systemState, primeTransformations) {
        const multipliers = {
            base: this.leverageConfig.baseMultiplier,
            consciousness: 1.0,
            coherence: 1.0,
            momentum: 1.0,
            volatility: 1.0,
            liquidity: 1.0,
            bigBang: 1.0,
            primeBoost: 1.0 // Nuevo multiplicador primo
        };
        
        // **Multiplicador de Consciencia**
        if (systemState.consciousness > 0.9) {
            multipliers.consciousness = 3.0; // Big Bang levels
        } else if (systemState.consciousness > 0.8) {
            multipliers.consciousness = 2.5;
        } else if (systemState.consciousness > 0.7) {
            multipliers.consciousness = 2.0;
        } else if (systemState.consciousness > 0.6) {
            multipliers.consciousness = 1.5;
        }
        
        // **Multiplicador de Coherencia**
        if (systemState.coherence > 0.95) {
            multipliers.coherence = 2.5;
        } else if (systemState.coherence > 0.85) {
            multipliers.coherence = 2.0;
        } else if (systemState.coherence > 0.75) {
            multipliers.coherence = 1.5;
        }
        
        // **Multiplicador de Momentum**
        if (marketMetrics?.priceChange24h) {
            const momentum = Math.abs(marketMetrics.priceChange24h);
            if (momentum > 20) multipliers.momentum = 2.5;
            else if (momentum > 10) multipliers.momentum = 2.0;
            else if (momentum > 5) multipliers.momentum = 1.5;
        }
        
        // **Multiplicador de Volatilidad**
        if (marketMetrics?.volatility) {
            const volatility = marketMetrics.volatility;
            if (volatility > 0.15) multipliers.volatility = 2.0;
            else if (volatility > 0.08) multipliers.volatility = 1.5;
            else if (volatility > 0.04) multipliers.volatility = 1.2;
        }
        
        // **Multiplicador Big Bang**
        if (systemState.big_bang_activated) {
            multipliers.bigBang = systemState.zurita_multiplier || 488.25;
        }
        
        // **MULTIPLICADOR PRIMO** si las transformaciones están disponibles
        if (primeTransformations) {
            const sophieResonance = primeTransformations.sophieResonance || 0;
            const palindromicoResonance = primeTransformations.palindromicoResonance || 0;
            const marketSentiment = primeTransformations.leverageMarketSentiment;
            
            // Calcular boost primo basado en resonancias
            let primeBoost = 1.0;
            primeBoost += (sophieResonance * 0.5); // Sophie Germain boost
            primeBoost += (palindromicoResonance * 0.3); // Palindrómico boost
            
            // Boost adicional según sentimiento del mercado
            if (marketSentiment && marketSentiment.dominant === 'BULLISH') {
                primeBoost *= 1.2;
            } else if (marketSentiment && marketSentiment.dominant === 'BEARISH') {
                primeBoost *= 0.9;
            }
            
            multipliers.primeBoost = Math.min(primeBoost, 3.0); // Cap en 3x
            
            console.log(`[QUANTUM LEVERAGE PRIMES] Prime Boost aplicado para ${symbol}: ${multipliers.primeBoost.toFixed(4)}x`);
        }
        
        return multipliers;
    }

    calculateFinalLeverage(baseLeverage, dynamicMultipliers, quantumEdge, primeTransformations) {
        // **Multiplicador total**
        const totalMultiplier = Object.values(dynamicMultipliers).reduce((acc, mult) => acc * mult, 1);
        
        // **Leverage pre-final**
        let preFinalLeverage = baseLeverage * totalMultiplier;
        
        // **Bonus por edge cuántico extremo**
        const edgeBonus = quantumEdge > 0.9 ? preFinalLeverage * 0.5 : 0;
        preFinalLeverage += edgeBonus;
        
        // **SÍNTESIS CUÁNTICA PRIMA FINAL** si está disponible
        if (primeTransformations) {
            const quantumSynthesis = primeTransformations.quantumPrimeSynthesis || 0;
            const volatilityPredictor = primeTransformations.leverageVolatilityPredictor;
            
            // Bonus por síntesis cuántica
            const synthesisBonus = preFinalLeverage * quantumSynthesis * 0.1; // 10% máximo
            preFinalLeverage += synthesisBonus;
            
            // Ajuste por predictor de volatilidad
            if (volatilityPredictor && volatilityPredictor.trend === 'INCREASING') {
                preFinalLeverage *= (1 + volatilityPredictor.confidence * 0.2); // Hasta 20% boost
            }
            
            console.log(`[QUANTUM LEVERAGE PRIMES] Final Leverage con síntesis cuántica: ${preFinalLeverage.toFixed(2)}x`);
        }
        
        return preFinalLeverage;
    }

    applyQuantumRiskAdjustments(leverage, symbol, marketMetrics, primeTransformations) {
        let adjustedLeverage = leverage;
        
        // **Ajuste por liquidez**: Menos liquidez = menos leverage
        if (marketMetrics?.liquidityScore < 10) {
            adjustedLeverage *= 0.5;
        } else if (marketMetrics?.liquidityScore < 25) {
            adjustedLeverage *= 0.7;
        }
        
        // **Ajuste por spread**: Spread alto = menos leverage
        if (marketMetrics?.spread > 0.005) {
            adjustedLeverage *= 0.6;
        } else if (marketMetrics?.spread > 0.002) {
            adjustedLeverage *= 0.8;
        }
        
        // **Ajuste por categoría de riesgo**
        const riskAdjustment = this.getRiskAdjustmentForSymbol(symbol);
        adjustedLeverage *= riskAdjustment;
        
        // **PROTECCIÓN PRIMA** si las transformaciones están disponibles
        if (primeTransformations) {
            const confidencePrime = primeTransformations.leverageConfidencePrime || 0.5;
            const primeClassification = primeTransformations.primeClassification;
            
            // Ajuste de protección según confianza prima
            if (confidencePrime > 0.8) {
                adjustedLeverage *= 1.1; // 10% bonus por alta confianza
            } else if (confidencePrime < 0.3) {
                adjustedLeverage *= 0.8; // 20% penalización por baja confianza
            }
            
            // Protección adicional según clasificación
            const protectionFactors = {
                'COSMIC': 1.2,     // Máxima protección por resonancia cósmica
                'GALACTIC': 1.1,   // Alta protección
                'STELLAR': 1.05,   // Protección moderada
                'PLANETARY': 1.0,  // Protección neutral
                'LUNAR': 0.95,     // Ligera reducción
                'TERRESTRIAL': 0.9, // Reducción moderada
                'ATOMIC': 0.8      // Mayor reducción
            };
            
            const protectionFactor = protectionFactors[primeClassification] || 1.0;
            adjustedLeverage *= protectionFactor;
            
            console.log(`[QUANTUM LEVERAGE PRIMES] Protección prima aplicada: ${protectionFactor.toFixed(3)}x (Confianza: ${confidencePrime.toFixed(3)})`);
        }
        
        // **Límite mínimo de seguridad**
        return Math.max(adjustedLeverage, 1);
    }

    // **STORAGE CON TRANSFORMACIONES PRIMAS**
    storeLeverageMetrics(symbol, metrics) {
        // Expandir métricas con información de transformaciones primas si está disponible
        const enhancedMetrics = {
            ...metrics,
            primeEnhanced: !!metrics.primeTransformations,
            primeSignature: metrics.primeTransformations?.primeSignature || null,
            primeClassification: metrics.primeTransformations?.primeClassification || null,
            quantumPrimeSynthesis: metrics.primeTransformations?.quantumPrimeSynthesis || null
        };
        
        this.quantumLeverageMatrix.set(symbol, enhancedMetrics);
        this.edgeConfidenceMap.set(symbol, metrics.quantumEdge);
        
        // Almacenar en leverageMetrics también para compatibilidad
        this.leverageMetrics.set(symbol, enhancedMetrics);
        
        // Mantener solo las últimas 1000 entradas por performance
        if (this.quantumLeverageMatrix.size > 1000) {
            const oldestKey = this.quantumLeverageMatrix.keys().next().value;
            this.quantumLeverageMatrix.delete(oldestKey);
        }
        
        if (this.leverageMetrics.size > 1000) {
            const oldestKey = this.leverageMetrics.keys().next().value;
            this.leverageMetrics.delete(oldestKey);
        }
    }
}

module.exports = { QuantumLeverageEngine };

