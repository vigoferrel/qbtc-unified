/**
 * QBTC UNIFIED - Constantes Unificadas
 * Todas las constantes del sistema en un solo archivo
 */

// Constantes del Sistema
const SYSTEM = {
    NAME: 'QBTC UNIFIED',
    VERSION: '2.0.0-Local',
    ENVIRONMENT: 'local',
    MODE: 'single-user',
    DEBUG: true,
    START_TIME: Date.now()
};

// Constantes de Red
const NETWORK = {
    DEFAULT_HOST: 'localhost',
    API_PORT: 18020,
    FRONTEND_PORT: 18021,
    METRICS_PORT: 18022,
    CORS_ORIGINS: ['http://localhost:18021', 'http://localhost:8080'],
    TIMEOUT: 30000,
    RECONNECT_INTERVAL: 5000
};

// Constantes de Leonardo Consciousness
const LEONARDO = {
    // Constantes de Razón Áurea
    GOLDEN_RATIO: 0.6180339887498948,
    GOLDEN_RATIO_CONJUGATE: 0.38196601125010515,
    GOLDEN_ANGLE: 137.50776405003785,
    
    // Constantes de Fibonacci
    FIBONACCI: {
        PHI: 1.6180339887498948,
        PSI: 0.6180339887498948,
        PRIME_7919: 7919,
        PRIME_INDEX: 13,
        SEQUENCE: [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987]
    },
    
    // Constantes de Lambda 888
    LAMBDA_888: {
        VALUE: 888,
        RESONANCE: 0.888,
        FREQUENCY: 888,
        HARMONIC: 0.0888,
        COHERENCE_THRESHOLD: 0.85
    },
    
    // Constantes de Hook Wheel
    HOOK_WHEEL: {
        SEGMENTS: 8,
        WHEEL_RADIUS: 1.0,
        HOOK_STRENGTH: 0.75,
        ROTATION_SPEED: 0.01,
        HARMONIC_SYNC: 0.92
    },
    
    // Constantes de Colibrí-Halcón
    COLIBRI_HALCON: {
        HUMMINGBIRD_RATIO: 0.618,
        HAWK_RATIO: 1.618,
        SYMBIOSIS_FACTOR: 0.786,
        BALANCE_THRESHOLD: 0.85,
        HARMONIC_CONVERGENCE: 0.923
    },
    
    // Constantes de Consciencia
    CONSCIOUSNESS: {
        BASE_LEVEL: 0.618,
        MAX_LEVEL: 1.0,
        EVOLUTION_RATE: 0.001,
        ENTROPY_FACTOR: 0.382,
        COHERENCE_FACTOR: 0.786,
        RESONANCE_FACTOR: 0.618
    },
    
    // Transformaciones Primas de Poetas Chilenos
    CHILEAN_POETS_PRIME_TRANSFORMS: {
        // Pablo Neruda - Transformación de la Amorosa
        NERUDA: {
            PRIME: 1009,  // Número primo asociado a Neruda
            LOVE_TRANSFORM: 0.739,  // Transformación del amor
            OCEANIC_RESONANCE: 0.924,  // Resonancia oceánica
            TWENTY_LOVE_POEMS: 20,  // Veinte poemas de amor
            ELEMENTAL_ODDES: 234,  // Odas elementales
            CANTO_GENERAL: 231,  // Canto general
            TRANSFORMATION_MATRIX: [0.739, 0.924, 0.816, 0.675, 0.583]
        },
        
        // Gabriela Mistral - Transformación de la Sabiduría
        MISTRAL: {
            PRIME: 1033,  // Número primo asociado a Mistral
            WISDOM_TRANSFORM: 0.847,  // Transformación de la sabiduría
            MOTHERLY_RESONANCE: 0.762,  // Resonancia maternal
            TERNURA: 1922,  // Año de Ternura
            LAGRIMAS: 0.891,  // Transformación de las lágrimas
            DESOLACION: 0.725,  // Desolación transformada
            TRANSFORMATION_MATRIX: [0.847, 0.762, 0.891, 0.725, 0.834]
        },
        
        // Vicente Huidobro - Transformación de la Vanguardia
        HIDOBRO: {
            PRIME: 1039,  // Número primo asociado a Huidobro
            AVANTGARDE_TRANSFORM: 0.691,  // Transformación de vanguardia
            CREATIONISM: 0.856,  // Creacionismo
            ALTazor: 1931,  // Año de Altazor
            NON_SERVIM: 0.773,  // Non serviam transformado
            SKY_PILLAR: 0.928,  // Pilar del cielo
            TRANSFORMATION_MATRIX: [0.691, 0.856, 0.773, 0.928, 0.805]
        },
        
        // Nicanor Parra - Transformación del Antipoesía
        PARRA: {
            PRIME: 1049,  // Número primo asociado a Parra
            ANTIPOETRY_TRANSFORM: 0.634,  // Transformación de la antipoesía
            QUASARS: 0.782,  // Quásares transformados
            EMERGENCY_POEMS: 1962,  // Año de Poemas y antipoemas
            ARTIFICES: 0.817,  // Artifices transformados
            SERMONS: 0.749,  // Sermones y predicas
            TRANSFORMATION_MATRIX: [0.634, 0.782, 0.817, 0.749, 0.745]
        },
        
        // Gonzalo Rojas - Transformación del Éxtasis
        ROJAS: {
            PRIME: 1051,  // Número primo asociado a Rojas
            ECSTASY_TRANSFORM: 0.873,  // Transformación del éxtasis
            OSCURO: 0.791,  // Oscuro transformado
            AGAINST_LIGHT: 0.826,  // Contra la luz
            DELIGHT: 0.864,  // Delicia transformada
            TRANSCENDENCE: 0.937,  // Trascendencia
            TRANSFORMATION_MATRIX: [0.873, 0.791, 0.826, 0.864, 0.937]
        }
    },
    
    // Logaritmo Natural 7919 para maximización
    LOG_7919: Math.log(7919),
    
    // Función de Maximización z = 9 + 16j
    MAXIMIZATION_FUNCTION: {
        REAL_PART: 9,
        IMAGINARY_PART: 16,
        COMPLEX_MAGNITUDE: Math.sqrt(9*9 + 16*16),  // |z| = sqrt(9² + 16²) = sqrt(337)
        COMPLEX_PHASE: Math.atan2(16, 9),  // φ = atan2(16, 9)
        OPTIMIZATION_EDGE: 0.618  // Edge de optimización con razón áurea
    }
};

// Constantes Cuánticas
const QUANTUM = {
    // Constantes de Estados Cuánticos
    STATES: {
        COHERENCE: 0.618,
        CONSCIOUSNESS: 0.618,
        ENTROPY: 0.382,
        ENERGY: 0.500,
        RESONANCE: 0.786,
        ALIGNMENT: 0.618,
        SYNCHRONIZATION: 1.0
    },
    
    // Constantes del Cubo Cuántico
    CUBE: {
        DIMENSIONS: 3,
        SIZE: 10,
        ROTATION_SPEED: 0.01,
        STATE_UPDATE_INTERVAL: 1000,
        MAX_PARTICLES: 1000,
        COHERENCE_THRESHOLD: 0.85
    },
    
    // Constantes de Campo Cuántico
    FIELD: {
        SCHUMANN_FREQUENCY: 7.83,
        PLANCK_CONSTANT: 6.62607015e-34,
        LIGHT_SPEED: 299792458,
        VACUUM_PERMEABILITY: 1.25663706212e-6,
        FINE_STRUCTURE: 0.0072973525693
    },
    
    // Constantes de Cálculo Cuántico
    CALCULATIONS: {
        PRECISION: 6,
        MAX_ITERATIONS: 1000,
        CONVERGENCE_THRESHOLD: 1e-10,
        ENTANGLEMENT_THRESHOLD: 0.9,
        SUPERPOSITION_THRESHOLD: 0.95
    },
    
    // Transformaciones Cuánticas de Poetas
    POETIC_QUANTUM_TRANSFORMS: {
        // Transformación Neruda-Cuántica
        NERUDA_QUANTUM: {
            LOVE_ENTANGLEMENT: 0.924,  // Entrelazamiento amoroso
            OCEANIC_SUPERPOSITION: 0.816,  // Superposición oceánica
            POETIC_DECOHERENCE: 0.001,  // Decoherencia poética
            TWENTY_QUANTUM_STATES: 20,  // Veinte estados cuánticos de amor
            ELEMENTAL_QUANTUM_ODYSSEY: 234  // Odisea cuántica elemental
        },
        
        // Transformación Mistral-Cuántica
        MISTRAL_QUANTUM: {
            WISDOM_ENTANGLEMENT: 0.891,  // Entrelazamiento de sabiduría
            MOTHERLY_SUPERPOSITION: 0.762,  // Superposición maternal
            TERNURA_QUANTUM_FIELD: 0.847,  // Campo cuántico de ternura
            LAGRIMAS_WAVEFUNCTION: 0.725,  // Función de onda de lágrimas
            DESOLATION_QUANTUM_TUNNEL: 0.834  // Túnel cuántico de desolación
        },
        
        // Transformación Huidobro-Cuántica
        HIDOBRO_QUANTUM: {
            CREATIONISM_SUPERPOSITION: 0.856,  // Superposición creacionista
            ALTazor_QUANTUM_LEAP: 0.928,  // Salto cuántico Altazor
            AVANTGARDE_ENTANGLEMENT: 0.773,  // Entrelazamiento de vanguardia
            NON_SERVIM_QUANTUM_REBELLION: 0.691,  // Rebelión cuántica non serviam
            SKY_PILLAR_QUANTUM_ASCENSION: 0.805  // Ascensión cuántica del pilar del cielo
        },
        
        // Transformación Parra-Cuántica
        PARRA_QUANTUM: {
            ANTIPOETRY_DECOHERENCE: 0.782,  // Decoherencia antipoética
            QUASARS_ENTANGLEMENT: 0.634,  // Entrelazamiento de quásares
            EMERGENCY_QUANTUM_POEMS: 0.817,  // Poemas cuánticos de emergencia
            ARTIFICES_SUPERPOSITION: 0.749,  // Superposición de artifices
            SERMONS_QUANTUM_IRONY: 0.745  // Ironía cuántica de sermones
        },
        
        // Transformación Rojas-Cuántica
        ROJAS_QUANTUM: {
            ECSTASY_ENTANGLEMENT: 0.873,  // Entrelazamiento del éxtasis
            OSCURO_SUPERPOSITION: 0.791,  // Superposición del oscuro
            LIGHT_QUANTUM_REBELLION: 0.826,  // Rebelión cuántica contra la luz
            DELIGHT_WAVEFUNCTION: 0.864,  // Función de onda de la delicia
            TRANSCENDENCE_QUANTUM_LEAP: 0.937  // Salto cuántico de trascendencia
        }
    },
    
    // Constantes Físico-Matemáticas de Feynman
    FEYNMAN: {
        // Constantes de Planck Adaptadas a Mercados
        MARKET_PLANCK_CONSTANT: 6.62607015e-34,  // ħ adaptado a mercados financieros
        MARKET_REDUCED_CONSTANT: 1.054571817e-34,  // ħ/2π para mercados
        
        // Integrales de Camino Cuántico-Financieras
        PATH_INTEGRALS: {
            PROPAGATOR: (x, t, x0, t0) => {
                // Propagador cuántico para precios: K(x,t;x0,t0) = sqrt(m/(2πiħ(t-t0))) * exp(im(x-x0)²/(2ħ(t-t0)))
                return Math.sqrt(1.0 / (2 * Math.PI * 1.054571817e-34 * (t - t0))) *
                       Math.exp(1.0 * Math.pow(x - x0, 2) / (2 * 1.054571817e-34 * (t - t0)));
            },
            
            ACTION_INTEGRAL: (path) => {
                // Integral de acción S = ∫ L dt donde L es el Lagrangiano del mercado
                let action = 0;
                for (let i = 1; i < path.length; i++) {
                    const dt = path[i].time - path[i-1].time;
                    const dx = path[i].price - path[i-1].price;
                    const velocity = dx / dt;
                    // Lagrangiano: L = (1/2)m*v² - V(x) donde V es el potencial del mercado
                    const kineticEnergy = 0.5 * 1.0 * velocity * velocity;  // m=1 para normalización
                    const potentialEnergy = path[i].volatility * path[i].volatility;  // V = σ²
                    action += (kineticEnergy - potentialEnergy) * dt;
                }
                return action;
            }
        },
        
        // Diagramas de Feynman para Correlaciones Financieras
        FEYNMAN_DIAGRAMS: {
            // Vertex de interacción entre activos
            INTERACTION_VERTEX: 0.618,  // Razón áurea para interacciones
            
            // Propagadores de partículas financieras
            PRICE_PROPAGATOR: (p, E) => {
                // Propagador de precio: 1/(E² - p²c² + iε)
                const c = 299792458;  // Velocidad de la luz
                const epsilon = 1e-10;  // Pequeño número para evitar singularidades
                return 1.0 / (E * E - p * p * c * c + 1.0 * epsilon);
            },
            
            // Amplitud de scattering para transacciones
            SCATTERING_AMPLITUDE: (p1, p2, p3, p4) => {
                // Amplitud de scattering M para interacciones entre activos
                const s = Math.pow(p1 + p2, 2);  // Variable de Mandelstam s
                const t = Math.pow(p1 - p3, 2);  // Variable de Mandelstam t
                const u = Math.pow(p1 - p4, 2);  // Variable de Mandelstam u
                return 0.618 * (1.0 / (s - 7919) + 1.0 / (t - 7919) + 1.0 / (u - 7919));
            }
        },
        
        // Ecuaciones Diferenciales de Feynman-Kac
        FEYNMAN_KAC: {
            // Ecuación de Feynman-Kac para opciones financieras
            OPTION_PRICING: (S, t, r, sigma, T, K) => {
                // u(S,t) = E[e^{-r(T-t)} payoff(S_T) | S_t = S]
                // Solución analítica para call europea
                const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * (T - t)) / (sigma * Math.sqrt(T - t));
                const d2 = d1 - sigma * Math.sqrt(T - t);
                return S * normalCDF(d1) - K * Math.exp(-r * (T - t)) * normalCDF(d2);
            },
            
            // Función de distribución normal acumulativa
            normalCDF: (x) => {
                const a1 = 0.254829592;
                const a2 = -0.284496736;
                const a3 = 1.421413741;
                const a4 = -1.453152027;
                const a5 = 1.061405429;
                const p = 0.3275911;
                const sign = x < 0 ? -1 : 1;
                x = Math.abs(x) / Math.sqrt(2.0);
                const t = 1.0 / (1.0 + p * x);
                const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
                return 0.5 * (1.0 + sign * y);
            }
        },
        
        // Constantes de Optimización Cuántica
        QUANTUM_OPTIMIZATION: {
            // Función de onda del mercado
            MARKET_WAVE_FUNCTION: (t) => {
                // Ψ_market(t) = A * e^(i(ωt + φ)) * ∏ ψ_j(t)
                const A = 1.0;  // Amplitud global
                const omega = 2 * Math.PI * 7.83;  // Frecuencia de resonancia Schumann
                const phi = 0.618;  // Fase global (razón áurea)
                return A * Math.exp(1.0 * (omega * t + phi));
            },
            
            // Hamiltoniano del sistema cuántico financiero
            HAMILTONIAN: {
                // Ĥ = -ħ²/(2m)∇² + V̂(r,t)
                KINETIC_TERM: -1.054571817e-34 * 1.054571817e-34 / (2 * 1.0),  // -ħ²/(2m)
                POTENTIAL_TERM: (r, t) => {
                    // V̂(r,t) = V₀(t) + ∑ᵢ Vᵢ(r-rᵢ, t)
                    const V0 = Math.sin(2 * Math.PI * t / 86400);  // Tendencia macroeconómica diaria
                    let V = V0;
                    // Aquí se sumarían las influencias de activos individuales
                    return V;
                }
            },
            
            // Matriz NxN de entrelazamiento financiero
            ENTANGLEMENT_MATRIX: (symbols) => {
                // M_NxN donde φᵢⱼ = ρᵢⱼ * e^(iθᵢⱼ)
                const n = symbols.length;
                const matrix = Array(n).fill().map(() => Array(n).fill(0));
                for (let i = 0; i < n; i++) {
                    for (let j = 0; j < n; j++) {
                        // Usar valores deterministas basados en los símbolos en lugar de Math.random()
                        const seed = symbols[i] + symbols[j] + i + j;
                        const hash1 = _deterministicHash(seed) % 1000 / 1000;  // Valor entre 0 y 1
                        const hash2 = _deterministicHash(seed + 1000) % 1000 / 1000;  // Valor entre 0 y 1
                        
                        const rho = hash1 * 0.5 + 0.5;  // Correlación entre 0.5 y 1.0
                        const theta = hash2 * 2 * Math.PI;  // Fase determinista
                        matrix[i][j] = rho * Math.exp(1.0 * theta);
                    }
                }
                return matrix;
            }
        }
    }
};

// Función de hash determinista para reemplazar Math.random()
function _deterministicHash(seed) {
    let hash = 0;
    if (typeof seed === 'string') {
        for (let i = 0; i < seed.length; i++) {
            const char = seed.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convertir a entero de 32 bits
        }
    } else if (typeof seed === 'number') {
        hash = seed;
    }
    return Math.abs(hash);
}

// Constantes de Trading
const TRADING = {
    // Configuración de Trading
    CONFIG: {
        MAX_POSITIONS: 5,
        RISK_PER_TRADE: 0.02,
        MAX_RISK: 0.10,
        STOP_LOSS: 0.05,
        TAKE_PROFIT: 0.10,
        MIN_CONFIDENCE: 0.75,
        MIN_EDGE: 0.0025
    },
    
    // Símbolos Principales
    SYMBOLS: {
        MAJOR: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'],
        MINOR: ['ADAUSDT', 'DOTUSDT', 'LINKUSDT', 'UNIUSDT'],
        EXOTIC: ['DOGEUSDT', 'SHIBUSDT', 'SOLUSDT']
    },
    
    // Intervalos de Tiempo
    INTERVALS: {
        M1: '1m',
        M5: '5m',
        M15: '15m',
        M30: '30m',
        H1: '1h',
        H4: '4h',
        D1: '1d'
    },
    
    // Tipos de Orden
    ORDER_TYPES: {
        MARKET: 'MARKET',
        LIMIT: 'LIMIT',
        STOP_MARKET: 'STOP_MARKET',
        STOP_LIMIT: 'STOP_LIMIT',
        TAKE_PROFIT_MARKET: 'TAKE_PROFIT_MARKET',
        TAKE_PROFIT_LIMIT: 'TAKE_PROFIT_LIMIT'
    },
    
    // Estados de Orden
    ORDER_STATUSES: {
        NEW: 'NEW',
        PARTIALLY_FILLED: 'PARTIALLY_FILLED',
        FILLED: 'FILLED',
        CANCELED: 'CANCELED',
        PENDING_CANCEL: 'PENDING_CANCEL',
        REJECTED: 'REJECTED',
        EXPIRED: 'EXPIRED'
    },
    
    // Modelo de Apalancamiento Óptimo No Determinista
    OPTIMAL_LEVERAGE: {
        // Función de apalancamiento óptimo basada en Feynman
        OPTIMAL_KELLY_FRACTION: (winRate, avgWin, avgLoss) => {
            // f* = (bp - q) / b donde b = avgWin/avgLoss, p = winRate, q = 1-p
            const b = avgWin / avgLoss;
            const p = winRate;
            const q = 1 - p;
            return Math.max(0, (b * p - q) / b);
        },
        
        // Apalancamiento cuántico ajustado por entrelazamiento de mercado
        QUANTUM_LEVERAGE: (marketEntanglement, volatility, correlation) => {
            // L_q = L_0 * (1 + φ * ρ * σ) donde φ es razón áurea, ρ es correlación, σ es volatilidad
            const baseLeverage = 1.0;
            const goldenRatio = 0.618;
            return baseLeverage * (1 + goldenRatio * correlation * volatility);
        },
        
        // Factor de Eficiencia Capital-Tiempo
        CAPITAL_TIME_EFFICIENCY: (capital, timeHorizon, opportunityCost) => {
            // η = C / (T * r) donde C es capital, T es horizonte temporal, r es costo de oportunidad
            return capital / (timeHorizon * opportunityCost);
        }
    }
};

// Constantes de Gestión de Fondos
const FUNDS = {
    // Configuración de Fondos
    CONFIG: {
        INITIAL_BALANCE: 1000,
        MAX_LEVERAGE: 3.0,
        KELLY_NUMERATOR: 0.25,
        MIN_POSITION_SIZE: 0.001,
        MAX_POSITION_SIZE: 1.0,
        MARGIN_CALL_RATIO: 0.8,
        LIQUIDATION_RATIO: 0.5
    },
    
    // Métricas de Rendimiento
    METRICS: {
        WIN_RATE: 'winRate',
        PROFIT_FACTOR: 'profitFactor',
        MAX_DRAWDOWN: 'maxDrawdown',
        SHARPE_RATIO: 'sharpeRatio',
        CALMAR_RATIO: 'calmarRatio'
    },
    
    // Métricas Cuánticas de Rendimiento
    QUANTUM_METRICS: {
        // Eficiencia de Kelly Cuántica
        QUANTUM_KELLY_EFFICIENCY: (classicalKelly, quantumEntanglement) => {
            // K_q = K_c * (1 + ψ * ρ) donde ψ es función de onda cuántica, ρ es entrelazamiento
            return classicalKelly * (1 + 0.618 * quantumEntanglement);
        },
        
        // VaR Cuántico (Value at Risk)
        QUANTUM_VAR: (portfolio, confidenceLevel, timeHorizon) => {
            // VaR_q = VaR_c * (1 + i*φ) donde φ es fase cuántica
            const classicalVaR = portfolio * confidenceLevel * Math.sqrt(timeHorizon);
            const quantumPhase = 0.618; // Fase cuántica basada en razón áurea
            return classicalVaR * (1 + 1.0 * quantumPhase);
        },
        
        // Ecuación de Evolución de Consciencia Cuántica
        QUANTUM_CONSCIOUSNESS_EVOLUTION: (initialConsciousness, time, learningRate) => {
            // ∂Ψ/∂t = -iĤΨ donde Ĥ es Hamiltoniano de aprendizaje
            const hBar = 1.054571817e-34;
            const hamiltonian = learningRate * 0.618; // Hamiltoniano con razón áurea
            return initialConsciousness * Math.exp(-1.0 * hamiltonian * time / hBar);
        }
    }
};

// Constantes de Binance
const BINANCE = {
    // Límites de API
    LIMITS: {
        REQUEST_WEIGHT: {
            MINUTE: 1200,
            DAY: 120000
        },
        ORDERS: {
            DAY: 10000,
            MINUTE: 100,
            SECOND: 10
        },
        CONNECTIONS: {
            MAX: 1,
            RECONNECT_DELAY: 5000
        }
    },
    
    // Endpoints de API
    ENDPOINTS: {
        BASE: 'https://api.binance.com',
        TESTNET: 'https://testnet.binance.vision',
        WS_BASE: 'wss://stream.binance.com:9443',
        WS_TESTNET: 'wss://testnet.binance.vision'
    },
    
    // Códigos de Error
    ERROR_CODES: {
        UNKNOWN: -1000,
        DISCONNECTED: -1001,
        UNAUTHORIZED: -1002,
        TOO_MANY_REQUESTS: -1003,
        DUPLICATE_IP: -1006,
        NO_SUCH_ORDER: -2013,
        BAD_API_KEY: -2014,
        INVALID_SIGNATURE: -2015
    }
};

// Constantes de Logging
const LOGGING = {
    LEVELS: {
        ERROR: 0,
        WARN: 1,
        INFO: 2,
        DEBUG: 3,
        TRACE: 4
    },
    
    COLORS: {
        ERROR: '\x1b[31m',
        WARN: '\x1b[33m',
        INFO: '\x1b[36m',
        DEBUG: '\x1b[35m',
        TRACE: '\x1b[37m',
        RESET: '\x1b[0m'
    },
    
    FORMATS: {
        TIMESTAMP: 'YYYY-MM-DD HH:mm:ss',
        MESSAGE: '[{timestamp}] {level}: {message}',
        ERROR: '[{timestamp}] {level}: {message}\n{stack}'
    }
};

// Constantes de Caché
const CACHE = {
    TTL: {
        SHORT: 60000,        // 1 minuto
        MEDIUM: 300000,      // 5 minutos
        LONG: 3600000,       // 1 hora
        DAY: 86400000        // 1 día
    },
    
    SIZES: {
        SMALL: 100,
        MEDIUM: 1000,
        LARGE: 10000
    },
    
    KEYS: {
        MARKET_DATA: 'market_data',
        BALANCE: 'balance',
        POSITIONS: 'positions',
        ORDERS: 'orders',
        METRICS: 'metrics'
    }
};

// Constantes de Métricas
const METRICS = {
    INTERVALS: {
        SECOND: 1000,
        MINUTE: 60000,
        HOUR: 3600000,
        DAY: 86400000
    },
    
    TYPES: {
        COUNTER: 'counter',
        GAUGE: 'gauge',
        HISTOGRAM: 'histogram',
        SUMMARY: 'summary'
    },
    
    NAMES: {
        API_REQUESTS: 'api_requests_total',
        API_ERRORS: 'api_errors_total',
        TRADING_VOLUME: 'trading_volume_total',
        PROFIT_LOSS: 'profit_loss_total',
        ACTIVE_POSITIONS: 'active_positions_count',
        MEMORY_USAGE: 'memory_usage_bytes',
        CPU_USAGE: 'cpu_usage_percent'
    }
};

// Exportar todas las constantes
module.exports = {
    SYSTEM,
    NETWORK,
    LEONARDO,
    QUANTUM,
    TRADING,
    FUNDS,
    BINANCE,
    LOGGING,
    CACHE,
    METRICS
};