#!/usr/bin/env node

/**
 * Script para obtener balance real de Binance y calcular allocation inicial
 * Para el sistema QBTC Leonardo después de confirmar que el baneo terminó
 */

const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class RealBalanceAnalyzer {
    constructor() {
        this.envPath = path.join(__dirname, 'core', 'quantum-engine', '.env');
        this.loadConfig();
        this.balance = {
            futures: {},
            total: {}
        };
        this.allocationRecommendation = {};
    }

    loadConfig() {
        try {
            const envContent = fs.readFileSync(this.envPath, 'utf8');
            this.config = {};
            
            envContent.split('\n').forEach(line => {
                if (line.includes('=') && !line.startsWith('#')) {
                    const [key, ...valueParts] = line.split('=');
                    this.config[key.trim()] = valueParts.join('=').trim();
                }
            });

            // Forzar modo producción para este análisis
            this.config.BINANCE_TESTNET = 'false';
        } catch (error) {
            console.error('❌ Error leyendo configuración:', error.message);
            this.config = {};
        }
    }

    createSignature(queryString) {
        return crypto.createHmac('sha256', this.config.BINANCE_SECRET_KEY)
            .update(queryString)
            .digest('hex');
    }

    async makeAuthenticatedRequest(endpoint, baseUrl = 'https://fapi.binance.com') {
        return new Promise((resolve, reject) => {
            const timestamp = Date.now();
            const queryString = `timestamp=${timestamp}&recvWindow=5000`;
            const signature = this.createSignature(queryString);
            const fullPath = `${endpoint}?${queryString}&signature=${signature}`;

            const req = https.request({
                hostname: baseUrl.replace('https://', ''),
                path: fullPath,
                method: 'GET',
                headers: {
                    'X-MBX-APIKEY': this.config.BINANCE_API_KEY,
                    'User-Agent': 'QBTC-Real-Balance-Analyzer/1.0'
                },
                timeout: 10000
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        if (res.statusCode === 200) {
                            resolve(parsed);
                        } else {
                            reject({
                                status: res.statusCode,
                                error: parsed,
                                data
                            });
                        }
                    } catch (parseError) {
                        reject({
                            status: res.statusCode,
                            error: 'Parse error',
                            data
                        });
                    }
                });
            });

            req.on('error', reject);
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });

            req.end();
        });
    }

    async getFuturesBalance() {
        console.log('💰 OBTENIENDO BALANCE DE FUTURES...');
        
        try {
            const account = await this.makeAuthenticatedRequest('/fapi/v2/account');
            
            this.balance.futures = {
                totalWalletBalance: parseFloat(account.totalWalletBalance || '0'),
                totalUnrealizedProfit: parseFloat(account.totalUnrealizedProfit || '0'),
                totalMarginBalance: parseFloat(account.totalMarginBalance || '0'),
                totalPositionInitialMargin: parseFloat(account.totalPositionInitialMargin || '0'),
                totalOpenOrderInitialMargin: parseFloat(account.totalOpenOrderInitialMargin || '0'),
                availableBalance: parseFloat(account.availableBalance || '0'),
                maxWithdrawAmount: parseFloat(account.maxWithdrawAmount || '0'),
                canTrade: account.canTrade,
                canDeposit: account.canDeposit,
                canWithdraw: account.canWithdraw,
                updateTime: account.updateTime
            };

            // Procesar assets específicos
            if (account.assets && Array.isArray(account.assets)) {
                this.balance.futures.assets = account.assets
                    .filter(asset => parseFloat(asset.walletBalance) > 0 || parseFloat(asset.availableBalance) > 0)
                    .map(asset => ({
                        asset: asset.asset,
                        walletBalance: parseFloat(asset.walletBalance),
                        availableBalance: parseFloat(asset.availableBalance),
                        crossUnPnl: parseFloat(asset.crossUnPnl || '0'),
                        crossWalletBalance: parseFloat(asset.crossWalletBalance || '0')
                    }))
                    .sort((a, b) => b.walletBalance - a.walletBalance);
            }

            console.log(`   ✅ Total Wallet Balance: $${this.balance.futures.totalWalletBalance.toFixed(2)} USDT`);
            console.log(`   📊 Available Balance: $${this.balance.futures.availableBalance.toFixed(2)} USDT`);
            console.log(`   📈 Unrealized PnL: $${this.balance.futures.totalUnrealizedProfit.toFixed(2)} USDT`);

            return this.balance.futures;

        } catch (error) {
            console.error('❌ Error obteniendo balance de Futures:', error);
            throw error;
        }
    }


    calculateOptimalAllocation() {
        console.log('\n🧮 CALCULANDO ALLOCATION INICIAL ÓPTIMO...');

        const futuresBalance = this.balance.futures.availableBalance || 0;
        const totalBalance = futuresBalance;

        console.log(`   📊 Balance Futures disponible: $${futuresBalance.toFixed(2)}`);
        console.log(`   💰 Total para trading: $${totalBalance.toFixed(2)}`);

        // Calcular allocation basado en reglas de risk management
        const riskLimit = parseFloat(this.config.RISK_LIMIT || '0.01'); // 1%
        const maxPositionSize = parseFloat(this.config.MAX_POSITION_SIZE || '0.20'); // 20%
        const maxDailyTrades = parseInt(this.config.MAX_DAILY_TRADES || '20');
        const maxPositions = parseInt(this.config.MAX_POSITIONS || '5');
        const minBalanceUSDT = parseFloat(this.config.MIN_BALANCE_USDT || '100');

        // Validar si el balance es suficiente
        if (futuresBalance < minBalanceUSDT) {
            console.log(`   ⚠️ Balance insuficiente. Mínimo requerido: $${minBalanceUSDT}`);
            this.allocationRecommendation.status = 'insufficient_balance';
            return this.allocationRecommendation;
        }

        // Cálculos de allocation quantum
        const reserveAmount = futuresBalance * 0.20; // 20% reserva
        const tradingBalance = futuresBalance - reserveAmount;
        
        // Allocation por trade basado en risk limit
        const maxRiskPerTrade = tradingBalance * riskLimit;
        const maxCapitalPerPosition = tradingBalance * maxPositionSize;
        
        // Allocation con factores cuánticos
        const quantumMultiplier = parseFloat(this.config.QUANTUM_CAPITAL_MULTIPLIER || '1.618');
        const consciousnessTarget = parseFloat(this.config.QUANTUM_CONSCIOUSNESS_TARGET || '0.941');
        const coherenceTarget = parseFloat(this.config.QUANTUM_COHERENCE_TARGET || '0.964');
        
        // Factor de amplificación cuántica
        const quantumAmplification = quantumMultiplier * consciousnessTarget * coherenceTarget;
        
        // Allocation dinámico por levels
        const allocationLevels = {
            conservative: {
                riskPerTrade: maxRiskPerTrade * 0.5,
                capitalPerPosition: maxCapitalPerPosition * 0.3,
                maxPositions: Math.min(3, maxPositions),
                leverageMax: 10,
                description: "Modo conservador - entrada gradual"
            },
            balanced: {
                riskPerTrade: maxRiskPerTrade * 0.75,
                capitalPerPosition: maxCapitalPerPosition * 0.6,
                maxPositions: Math.min(4, maxPositions),
                leverageMax: 25,
                description: "Modo balanceado - operación normal"
            },
            aggressive: {
                riskPerTrade: maxRiskPerTrade,
                capitalPerPosition: maxCapitalPerPosition,
                maxPositions: maxPositions,
                leverageMax: 50,
                description: "Modo agresivo - máxima eficiencia"
            },
            quantum: {
                riskPerTrade: maxRiskPerTrade * quantumAmplification,
                capitalPerPosition: maxCapitalPerPosition * quantumAmplification,
                maxPositions: maxPositions * 2, // Amplificación cuántica
                leverageMax: 125,
                description: "Modo cuántico - Leonardo Consciousness activa"
            }
        };

        this.allocationRecommendation = {
            status: 'ready',
            totalBalance: futuresBalance,
            reserveAmount,
            tradingBalance,
            riskParameters: {
                riskLimit,
                maxPositionSize,
                maxDailyTrades,
                maxPositions,
                minBalanceUSDT
            },
            quantumFactors: {
                quantumMultiplier,
                consciousnessTarget,
                coherenceTarget,
                quantumAmplification
            },
            allocationLevels,
            recommendedStartLevel: futuresBalance > 1000 ? 'balanced' : 'conservative'
        };

        return this.allocationRecommendation;
    }

    displayAllocationReport() {
        console.log('\n' + '='.repeat(70));
        console.log('📊 REPORTE DE ALLOCATION INICIAL - QBTC LEONARDO');
        console.log('='.repeat(70));

        if (this.allocationRecommendation.status !== 'ready') {
            console.log(`❌ Estado: ${this.allocationRecommendation.status}`);
            return;
        }

        const rec = this.allocationRecommendation;
        const startLevel = rec.allocationLevels[rec.recommendedStartLevel];

        console.log(`\n💰 BALANCE ACTUAL:`);
        console.log(`   Total disponible: $${rec.totalBalance.toFixed(2)} USDT`);
        console.log(`   Reserva (20%): $${rec.reserveAmount.toFixed(2)} USDT`);
        console.log(`   Capital trading: $${rec.tradingBalance.toFixed(2)} USDT`);

        console.log(`\n⚙️ PARÁMETROS DE RIESGO:`);
        console.log(`   Risk limit: ${(rec.riskParameters.riskLimit * 100).toFixed(1)}%`);
        console.log(`   Max position size: ${(rec.riskParameters.maxPositionSize * 100).toFixed(0)}%`);
        console.log(`   Max daily trades: ${rec.riskParameters.maxDailyTrades}`);
        console.log(`   Max positions: ${rec.riskParameters.maxPositions}`);

        console.log(`\n🌟 FACTORES CUÁNTICOS:`);
        console.log(`   Quantum multiplier: ${rec.quantumFactors.quantumMultiplier}x`);
        console.log(`   Consciousness target: ${(rec.quantumFactors.consciousnessTarget * 100).toFixed(1)}%`);
        console.log(`   Coherence target: ${(rec.quantumFactors.coherenceTarget * 100).toFixed(1)}%`);
        console.log(`   Quantum amplification: ${rec.quantumFactors.quantumAmplification.toFixed(3)}x`);

        console.log(`\n🎯 NIVEL RECOMENDADO: ${rec.recommendedStartLevel.toUpperCase()}`);
        console.log(`   ${startLevel.description}`);
        console.log(`   Risk per trade: $${startLevel.riskPerTrade.toFixed(2)} USDT`);
        console.log(`   Capital per position: $${startLevel.capitalPerPosition.toFixed(2)} USDT`);
        console.log(`   Max positions: ${startLevel.maxPositions}`);
        console.log(`   Max leverage: ${startLevel.leverageMax}x`);

        console.log(`\n📋 TODOS LOS NIVELES DISPONIBLES:`);
        Object.entries(rec.allocationLevels).forEach(([level, config]) => {
            const marker = level === rec.recommendedStartLevel ? '👉' : '  ';
            console.log(`${marker} ${level.toUpperCase()}:`);
            console.log(`     Risk/trade: $${config.riskPerTrade.toFixed(2)} | Capital/pos: $${config.capitalPerPosition.toFixed(2)}`);
            console.log(`     Max positions: ${config.maxPositions} | Max leverage: ${config.leverageMax}x`);
        });

        console.log(`\n🚀 NEXT STEPS:`);
        console.log(`   1. Confirmar nivel de allocation deseado`);
        console.log(`   2. Configurar variables de entorno si es necesario`);
        console.log(`   3. Iniciar sistema QBTC Leonardo con el allocation seleccionado`);
        console.log(`   4. Monitorear performance y ajustar según resultados`);

        console.log('\n' + '='.repeat(70));
    }

    async run() {
        console.log('💰 ANALIZADOR DE BALANCE REAL Y ALLOCATION INICIAL');
        console.log('='.repeat(60));
        console.log(`⏰ ${new Date().toLocaleString()}`);
        console.log(`🌐 IP: Desbaneada y operativa`);
        console.log(`🔑 API Keys: Configuradas para PRODUCCIÓN`);

        try {
            // Obtener balance de futuros únicamente
            await this.getFuturesBalance();

            // Calcular allocation
            this.calculateOptimalAllocation();

            // Mostrar reporte
            this.displayAllocationReport();

            // Guardar resultados
            const resultsFile = path.join(__dirname, 'balance-allocation-results.json');
            fs.writeFileSync(resultsFile, JSON.stringify({
                timestamp: new Date().toISOString(),
                balance: this.balance,
                allocation: this.allocationRecommendation
            }, null, 2));

            console.log(`\n📄 Resultados guardados en: balance-allocation-results.json`);

            return this.allocationRecommendation;

        } catch (error) {
            console.error('\n❌ Error en análisis:', error);
            if (error.status === 401) {
                console.log('\n🔑 ERROR DE AUTENTICACIÓN:');
                console.log('   1. Verificar que BINANCE_TESTNET=false en .env');
                console.log('   2. Confirmar que API keys son de PRODUCCIÓN');
                console.log('   3. Verificar whitelist de IP en Binance');
            }
            process.exit(1);
        }
    }
}

// Ejecutar análisis
async function main() {
    const analyzer = new RealBalanceAnalyzer();
    await analyzer.run();
}

if (require.main === module) {
    main();
}

module.exports = RealBalanceAnalyzer;
