#!/usr/bin/env node

require('dotenv').config();
const BinanceRealConnector = require('./BinanceRealConnector');

async function checkBalance() {
    console.log('🔍 Verificando balance actual en Binance Futures...');
    console.log('⏰ Timestamp:', new Date().toISOString());
    console.log('');

    try {
        // Inicializar el conector con las credenciales del .env
        const binance = BinanceRealConnector.getInstance();
        
        console.log('📡 Conectando a Binance Futures API...');
        
        // Primero verificar conectividad
        const serverTime = await binance.getServerTime();
        console.log('✅ Conexión exitosa - Hora del servidor:', new Date(serverTime).toISOString());
        console.log('');
        
        // Obtener información de la cuenta
        console.log('📊 Obteniendo información de cuenta...');
        const accountInfo = await binance.getAccountInfo();
        
        console.log('='.repeat(60));
        console.log('💰 BALANCE DE CUENTA - BINANCE FUTURES');
        console.log('='.repeat(60));
        
        // Balance total USDT
        const usdtBalance = await binance.getUSDTBalance();
        console.log(`💵 Balance USDT: ${usdtBalance} USDT`);
        console.log('');
        
        // Balance disponible por activo
        console.log('📈 Balance por activos:');
        if (accountInfo.assets && accountInfo.assets.length > 0) {
            accountInfo.assets
                .filter(asset => parseFloat(asset.walletBalance) > 0)
                .forEach(asset => {
                    const balance = parseFloat(asset.walletBalance);
                    const available = parseFloat(asset.availableBalance);
                    console.log(`   ${asset.asset}: ${balance} (Disponible: ${available})`);
                });
        }
        
        console.log('');
        console.log('📊 Información adicional de cuenta:');
        console.log(`   Total Wallet Balance: ${accountInfo.totalWalletBalance} USDT`);
        console.log(`   Total Unrealized PNL: ${accountInfo.totalUnrealizedProfit} USDT`);
        console.log(`   Total Cross Margin: ${accountInfo.totalCrossWalletBalance} USDT`);
        console.log(`   Available Balance: ${accountInfo.availableBalance} USDT`);
        
        console.log('');
        console.log('📈 Posiciones actuales:');
        if (accountInfo.positions && accountInfo.positions.length > 0) {
            const activePositions = accountInfo.positions.filter(pos => 
                parseFloat(pos.positionAmt) !== 0
            );
            
            if (activePositions.length > 0) {
                activePositions.forEach(pos => {
                    console.log(`   ${pos.symbol}: ${pos.positionAmt} (PNL: ${pos.unrealizedProfit} USDT)`);
                });
            } else {
                console.log('   ✅ No hay posiciones abiertas');
            }
        }
        
        console.log('');
        console.log('🎯 Estado del sistema Leonardo:');
        console.log(`   Balance mínimo requerido: ${process.env.MIN_BALANCE_USDT || 100} USDT`);
        console.log(`   Bait amount configurado: ${process.env.BAIT_AMOUNT || 10} USDT`);
        console.log(`   Max leverage: ${process.env.TRADING_MAX_LEVERAGE || 125}x`);
        console.log(`   Trading real habilitado: ${process.env.REAL_TRADING_ENABLED || 'false'}`);
        
        // Verificar si el balance es suficiente para operar
        const minBalance = parseFloat(process.env.MIN_BALANCE_USDT || 100);
        const currentBalance = parseFloat(usdtBalance);
        
        console.log('');
        console.log('='.repeat(60));
        if (currentBalance >= minBalance) {
            console.log('✅ BALANCE SUFICIENTE PARA OPERAR');
            console.log(`   Balance actual: ${currentBalance} USDT >= Mínimo requerido: ${minBalance} USDT`);
        } else {
            console.log('⚠️  BALANCE INSUFICIENTE');
            console.log(`   Balance actual: ${currentBalance} USDT < Mínimo requerido: ${minBalance} USDT`);
        }
        console.log('='.repeat(60));
        
    } catch (error) {
        console.error('❌ Error al verificar balance:', error.message);
        if (error.response && error.response.data) {
            console.error('   Detalles del error:', error.response.data);
        }
        process.exit(1);
    }
}

// Ejecutar la verificación
checkBalance()
    .then(() => {
        console.log('');
        console.log('🏁 Verificación de balance completada');
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 Error fatal:', error.message);
        process.exit(1);
    });
