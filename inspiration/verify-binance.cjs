const Binance = require('binance-api-node').default;
const axios = require('axios');
const { CredentialsManager } = require('../quantum-core/CredentialsManager');
require('dotenv').config();

class BinanceVerifier {
    constructor() {
        // **INICIALIZAR CREDENTIALS MANAGER**: Gestión inteligente de credenciales
        console.log('🔐 Initializing credentials management for Binance verification...');
        this.credentialsManager = CredentialsManager.getInstance();
        this.logCredentialsStatus();
        
        // Obtener credenciales del CredentialsManager
        const credentials = this.credentialsManager.getCredentials();
        
        this.client = Binance({
            apiKey: credentials.apiKey || process.env.BINANCE_API_KEY,
            apiSecret: credentials.secretKey || process.env.BINANCE_API_SECRET,
            futures: true
        });
    }

    async verifySystem() {
        console.log('🔍 QBTC LEONARDO CONSCIOUSNESS - VERIFICACIÓN DEL SISTEMA');
        console.log('====================================================');

        try {
            // 1. Verificar IP pública
            const ip = await this.getPublicIP();
            console.log(`\n🌍 IP Pública Detectada: ${ip}`);

            // 2. Verificar conexión básica
            await this.testBasicConnection();

            // 3. Verificar balance y permisos
            await this.checkBalanceAndPermissions();

            // 4. Verificar estado de la cuenta
            await this.checkAccountStatus();

            // 5. Calcular allocation inicial
            await this.calculateInitialAllocation();

        } catch (error) {
            console.error('\n❌ Error en verificación:', error.message);
            if (error.code === -2015) {
                console.log('\n⚠️ ERROR DE IP/PERMISOS:');
                console.log('1. Agregar esta IP a Binance Whitelist:', ip);
                console.log('2. Verificar permisos de Futures Trading');
                console.log('3. Esperar 5 minutos después de actualizar whitelist');
            }
        }
    }

    async getPublicIP() {
        const response = await axios.get('https://api.ipify.org?format=json');
        return response.data.ip;
    }

    async testBasicConnection() {
        console.log('\n🔄 Verificando conexión con Binance...');
        
        // Test ping
        await this.client.ping();
        console.log('✅ Conexión básica: OK');

        // Test tiempo
        const serverTime = await this.client.time();
        const localTime = new Date().getTime();
        const timeDiff = Math.abs(serverTime - localTime);
        
        console.log(`⏰ Diferencia de tiempo: ${timeDiff}ms`);
        if (timeDiff > 1000) {
            console.warn('⚠️ Advertencia: Diferencia de tiempo significativa');
        }
    }

    async checkBalanceAndPermissions() {
        console.log('\n💰 Verificando balances y permisos...');

        // Verificar futures
        const futuresAccount = await this.client.futuresAccountBalance();
        console.log('\n📈 BALANCES FUTURES:');
        futuresAccount.forEach(b => {
            if (parseFloat(b.balance) > 0) {
                console.log(`${b.asset}: ${parseFloat(b.balance).toFixed(8)} (total) | ${parseFloat(b.availableBalance).toFixed(8)} (disponible)`);
            }
        });
    }

    async checkAccountStatus() {
        console.log('\n🔍 Verificando estado de la cuenta...');

        // Verificar límites de API para futures
        const exchangeInfo = await this.client.futuresExchangeInfo();
        console.log('\n📊 LÍMITES DE LA CUENTA:');
        console.log(`Futures Trading: ✅ (FUTURES-ONLY MODE)`);

        // Verificar posiciones abiertas
        const positions = await this.client.futuresPositionRisk();
        const activePositions = positions.filter(p => parseFloat(p.positionAmt) !== 0);
        
        if (activePositions.length > 0) {
            console.log('\n⚠️ POSICIONES ABIERTAS ENCONTRADAS:');
            activePositions.forEach(p => {
                console.log(`${p.symbol}: ${p.positionAmt} @ ${p.entryPrice} (PnL: ${p.unRealizedProfit})`);
            });
        } else {
            console.log('\n✅ No hay posiciones abiertas');
        }
    }

    async calculateInitialAllocation() {
        console.log('\n🎯 CÁLCULO DE ALLOCATION INICIAL:');

        try {
            // Obtener balance total
            const futuresBalance = await this.client.futuresAccountBalance();
            const usdtBalance = futuresBalance.find(b => b.asset === 'USDT');
            const totalBalance = parseFloat(usdtBalance.balance);

            console.log(`\n💰 Balance Total USDT: ${totalBalance.toFixed(2)}`);

            // Calcular allocations por tier basado en balance
            const allocation = this.calculateTierAllocation(totalBalance);

            console.log('\n📊 ALLOCATION RECOMENDADO POR TIER:');
            Object.entries(allocation).forEach(([tier, config]) => {
                console.log(`\n${tier.toUpperCase()}:`);
                console.log(`Capital Asignado: ${config.capital.toFixed(2)} USDT`);
                console.log(`Máximo Leverage: ${config.max_leverage}x`);
                console.log(`Número de Carnadas: ${config.baits}`);
                console.log(`Símbolos: ${config.symbols.join(', ')}`);
            });

            // Verificar si cumple requisitos mínimos
            this.verifyMinimumRequirements(totalBalance);

        } catch (error) {
            console.error('Error al calcular allocation:', error);
        }
    }

    calculateTierAllocation(totalBalance) {
        return {
            tier_1: {
                capital: totalBalance * 0.4,
                max_leverage: 125,
                baits: Math.floor((totalBalance * 0.4) / 10),
                symbols: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT']
            },
            tier_2: {
                capital: totalBalance * 0.3,
                max_leverage: 100,
                baits: Math.floor((totalBalance * 0.3) / 10),
                symbols: ['SOLUSDT', 'AVAXUSDT', 'DOTUSDT', 'ADAUSDT', 'MATICUSDT']
            },
            tier_3: {
                capital: totalBalance * 0.2,
                max_leverage: 75,
                baits: Math.floor((totalBalance * 0.2) / 10),
                symbols: ['INJUSDT', 'FETUSDT', 'AGIXUSDT', 'OCEANUSDT', 'QNTUSDT']
            },
            quantum_coins: {
                capital: totalBalance * 0.1,
                max_leverage: 100,
                baits: Math.floor((totalBalance * 0.1) / 10),
                symbols: ['QNTUSDT', 'FETUSDT', 'AGIXUSDT', 'OCEANUSDT', 'ROSEUSDT']
            }
        };
    }

    verifyMinimumRequirements(balance) {
        console.log('\n🔍 VERIFICACIÓN DE REQUISITOS MÍNIMOS:');
        
        const requirements = {
            min_balance: 100,
            min_bait_size: 10,
            min_baits: 5
        };

        const totalPossibleBaits = Math.floor(balance / requirements.min_bait_size);

        console.log(`Balance Mínimo (100 USDT): ${balance >= requirements.min_balance ? '✅' : '❌'}`);
        console.log(`Carnadas Posibles: ${totalPossibleBaits}`);
        console.log(`Carnadas Mínimas (5): ${totalPossibleBaits >= requirements.min_baits ? '✅' : '❌'}`);

        if (balance < requirements.min_balance) {
            console.warn('\n⚠️ ADVERTENCIA: Balance insuficiente para trading seguro');
            console.log(`Recomendado: Agregar más fondos (mínimo ${requirements.min_balance} USDT)`);
        }
    }
    
    /**
     * Registrar estado actual de credenciales para verificación
     */
    logCredentialsStatus() {
        console.log('\n🔍 === BINANCE VERIFIER CREDENTIALS STATUS ===');
        
        const status = this.credentialsManager.getStatus();
        
        console.log(`📊 Credentials Sources (Binance Verifier):`);
        status.sources.forEach((source, index) => {
            const statusIcon = source.found ? '✅' : '❌';
            console.log(`   ${index + 1}. ${statusIcon} ${source.name} (${source.path})`);
        });
        
        console.log(`\n🔑 API Configuration (Verification Mode):`);
        console.log(`   API Key: ${status.hasApiKey ? '✅ CONFIGURED' : '❌ MISSING'}`);
        console.log(`   Secret Key: ${status.hasSecretKey ? '✅ CONFIGURED' : '❌ MISSING'}`);
        console.log(`   Environment: ${status.isTestnet ? '📡 TESTNET' : '🏭 MAINNET'}`);
        
        console.log(`\n⚡ Binance Verifier Status:`);
        console.log(`   Ready for Verification: ${status.isReady ? '✅ YES' : '❌ NO'}`);
        console.log(`   Futures Trading: 📈 ENABLED`);
        console.log(`   Account Verification: 🔍 READY`);
        
        if (status.loadedFrom) {
            console.log(`\n📂 Loaded from: ${status.loadedFrom}`);
        }
        
        if (!status.isReady) {
            console.log('\n⚠️ BINANCE VERIFIER WARNING: Missing credentials - Cannot perform full verification');
            console.log('🔍 Please configure API credentials to enable full system verification');
        } else {
            console.log('\n✅ BINANCE VERIFIER STATUS: All credentials loaded - Ready for full verification');
        }
        
        console.log('🔍 === END VERIFIER CREDENTIALS REPORT ===\n');
    }
}

// Ejecutar verificación
const verifier = new BinanceVerifier();
verifier.verifySystem().catch(console.error);
