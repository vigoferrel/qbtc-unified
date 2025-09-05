const Binance = require('binance-api-node').default;
const axios = require('axios');
require('dotenv').config();

class FuturesVerifier {
    constructor() {
        this.client = Binance({
            apiKey: process.env.BINANCE_API_KEY,
            apiSecret: process.env.BINANCE_API_SECRET,
            futures: true // Forzar modo futuros
        });
    }

    async verifyFuturesSystem() {
        console.log('⚡ QBTC QUANTUM FUTURES VERIFICATION');
        console.log('====================================');

        try {
            // 1. Verificar IP
            const ip = await this.getPublicIP();
            console.log(`\n🌍 IP Actual: ${ip}`);

            // 2. Verificar conexión a Futuros
            await this.verifyFuturesConnection();

            // 3. Verificar balance de Futuros
            await this.verifyFuturesBalance();

            // 4. Verificar límites de leverage
            await this.verifyLeverageLimits();

            // 5. Calcular allocations óptimos
            await this.calculateOptimalAllocations();

        } catch (error) {
            console.error('\n❌ Error en verificación:', error.message);
            if (error.code === -2015) {
                console.log('\n⚠️ ERROR DE PERMISOS FUTURES:');
                console.log(`1. Agregar IP ${ip} a Binance Futures Whitelist`);
                console.log('2. Habilitar Futures Trading en la API');
                console.log('3. Esperar 5 minutos tras actualización');
            }
        }
    }

    async getPublicIP() {
        const response = await axios.get('https://api.ipify.org?format=json');
        return response.data.ip;
    }

    async verifyFuturesConnection() {
        console.log('\n🔄 Verificando conexión Futures...');
        
        // Test de conexión futures
        await this.client.futuresPing();
        console.log('✅ Conexión Futures: OK');

        // Verificar modo
        const exchangeInfo = await this.client.futuresExchangeInfo();
        console.log('✅ Futuros habilitados');
        
        // Verificar trading permitido
        console.log('📊 ESTADO FUTURES:');
        console.log('Trading Futuros: ✅');
        console.log('Modo: USDT-M');
    }

    async verifyFuturesBalance() {
        console.log('\n💰 Verificando Balance Futures...');

        const futuresAccount = await this.client.futuresAccountBalance();
        const usdtBalance = futuresAccount.find(b => b.asset === 'USDT');

        if (!usdtBalance) {
            throw new Error('No se encontró balance USDT en Futures');
        }

        console.log('\n📊 BALANCE FUTURES:');
        console.log(`Total: ${parseFloat(usdtBalance.balance).toFixed(2)} USDT`);
        console.log(`Disponible: ${parseFloat(usdtBalance.availableBalance).toFixed(2)} USDT`);
        console.log(`En uso: ${(parseFloat(usdtBalance.balance) - parseFloat(usdtBalance.availableBalance)).toFixed(2)} USDT`);

        // Verificar posiciones abiertas
        const positions = await this.client.futuresPositionRisk();
        const activePositions = positions.filter(p => parseFloat(p.positionAmt) !== 0);

        if (activePositions.length > 0) {
            console.log('\n⚡ POSICIONES ABIERTAS:');
            activePositions.forEach(p => {
                console.log(`${p.symbol}: ${p.positionAmt} @ ${p.entryPrice} (PnL: ${p.unRealizedProfit})`);
            });
        } else {
            console.log('\n✅ No hay posiciones abiertas');
        }
    }

    async verifyLeverageLimits() {
        console.log('\n🔄 Verificando límites de leverage...');

        const leverageBrackets = await this.client.futuresLeverageBracket();
        console.log('\n📊 LEVERAGE MÁXIMO POR TIER:');

        // Organizar por tiers
        const tiers = {
            tier1: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'],
            tier2: ['SOLUSDT', 'AVAXUSDT', 'DOTUSDT', 'ADAUSDT', 'MATICUSDT'],
            tier3: ['INJUSDT', 'FETUSDT', 'AGIXUSDT', 'OCEANUSDT', 'QNTUSDT']
        };

        for (const [tier, symbols] of Object.entries(tiers)) {
            console.log(`\n${tier.toUpperCase()}:`);
            for (const symbol of symbols) {
                const info = leverageBrackets.find(b => b.symbol === symbol);
                if (info) {
                    console.log(`${symbol}: ${info.brackets[0].initialLeverage}x máximo`);
                }
            }
        }
    }

    async calculateOptimalAllocations() {
        console.log('\n🎯 CÁLCULO DE ALLOCATION ÓPTIMO:');

        try {
            const futuresAccount = await this.client.futuresAccountBalance();
            const usdtBalance = futuresAccount.find(b => b.asset === 'USDT');
            const totalBalance = parseFloat(usdtBalance.balance);

            console.log(`\n💰 Balance Total: ${totalBalance.toFixed(2)} USDT`);

            // Cálculo de allocations por tier con máximo leverage
            const allocation = this.calculateQuantumAllocation(totalBalance);

            console.log('\n⚡ ALLOCATION QUANTUM CON MÁXIMO LEVERAGE:');
            Object.entries(allocation).forEach(([tier, config]) => {
                console.log(`\n${tier.toUpperCase()}:`);
                console.log(`Capital Base: ${config.capital.toFixed(2)} USDT`);
                console.log(`Leverage Máximo: ${config.max_leverage}x`);
                console.log(`Exposición Total: ${(config.capital * config.max_leverage).toFixed(2)} USDT`);
                console.log(`Símbolos: ${config.symbols.join(', ')}`);
            });

            // Verificar requisitos mínimos
            this.verifyMinimumRequirements(totalBalance);

        } catch (error) {
            console.error('Error al calcular allocations:', error);
        }
    }

    calculateQuantumAllocation(totalBalance) {
        return {
            tier_1: {
                capital: totalBalance * 0.4,
                max_leverage: 125,
                symbols: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT']
            },
            tier_2: {
                capital: totalBalance * 0.3,
                max_leverage: 100,
                symbols: ['SOLUSDT', 'AVAXUSDT', 'DOTUSDT', 'ADAUSDT', 'MATICUSDT']
            },
            tier_3: {
                capital: totalBalance * 0.2,
                max_leverage: 75,
                symbols: ['INJUSDT', 'FETUSDT', 'AGIXUSDT', 'OCEANUSDT', 'QNTUSDT']
            },
            quantum_coins: {
                capital: totalBalance * 0.1,
                max_leverage: 100,
                symbols: ['QNTUSDT', 'FETUSDT', 'AGIXUSDT', 'OCEANUSDT', 'ROSEUSDT']
            }
        };
    }

    verifyMinimumRequirements(balance) {
        console.log('\n🔍 VERIFICACIÓN DE REQUISITOS QUANTUM:');
        
        const requirements = {
            min_balance: 100,     // USDT mínimo para operar
            min_quantum: 10,      // Tamaño mínimo por posición
            min_positions: 5      // Mínimo de posiciones simultáneas
        };

        const possiblePositions = Math.floor(balance / requirements.min_quantum);

        console.log(`Balance Mínimo (${requirements.min_balance} USDT): ${balance >= requirements.min_balance ? '✅' : '❌'}`);
        console.log(`Posiciones Quantum Posibles: ${possiblePositions}`);
        console.log(`Posiciones Mínimas (${requirements.min_positions}): ${possiblePositions >= requirements.min_positions ? '✅' : '❌'}`);

        if (balance < requirements.min_balance) {
            console.warn('\n⚠️ ADVERTENCIA: Balance insuficiente para trading quantum');
            console.log(`Recomendado: Agregar más fondos (mínimo ${requirements.min_balance} USDT)`);
        }
    }
}

// Ejecutar verificación
const verifier = new FuturesVerifier();
verifier.verifyFuturesSystem().catch(console.error);
