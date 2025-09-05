#!/usr/bin/env node

require('dotenv').config();
const { BinanceConnectionValidator } = require('./BinanceConnectionValidator');

async function checkBalance() {
    console.log('🔍 Verificando balance actual en Binance Futures...');
    console.log('⏰ Timestamp:', new Date().toISOString());
    console.log('');

    try {
        // Inicializar el validador de conexión
        const validator = new BinanceConnectionValidator();
        
        console.log('📡 Validando conexión completa a Binance Futures API...');
        
        // Validar conexión completa
        const validation = await validator.validateBinanceConnection();
        
        if (!validation.success) {
            console.error('❌ Validación de conexión falló:');
            validation.errors.forEach(error => console.error(`   • ${error}`));
            if (validation.warnings.length > 0) {
                console.warn('⚠️ Advertencias:');
                validation.warnings.forEach(warning => console.warn(`   • ${warning}`));
            }
            process.exit(1);
        }
        
        console.log('✅ Conexión validada exitosamente');
        if (validation.serverTime) {
            console.log('   Hora del servidor:', new Date(validation.serverTime).toISOString());
        }
        console.log('');
        
        // Mostrar información de la cuenta si está disponible
        if (validation.accountInfo) {
            console.log('='.repeat(60));
            console.log('💰 BALANCE DE CUENTA - BINANCE FUTURES');
            console.log('='.repeat(60));
            
            const accountInfo = validation.accountInfo;
            console.log(`💵 Balance USDT total: ${accountInfo.totalWalletBalance} USDT`);
            console.log(`💵 Balance disponible: ${accountInfo.availableBalance} USDT`);
            console.log('');
            
            if (validation.balances) {
                console.log('📈 Balance por activos:');
                validation.balances.forEach(balance => {
                    console.log(`   ${balance.asset}: ${balance.walletBalance} (Disponible: ${balance.availableBalance})`);
                });
            }
            
            console.log('');
            console.log('📊 Información adicional de cuenta:');
            console.log(`   Tier de comisiones: ${accountInfo.feeTier}`);
            console.log(`   Margen total: ${accountInfo.totalMarginBalance} USDT`);
            console.log(`   PNL no realizado: ${accountInfo.totalUnrealizedProfit} USDT`);
            console.log(`   Margen de posiciones: ${accountInfo.totalPositionInitialMargin} USDT`);
            console.log(`   Margen de órdenes: ${accountInfo.totalOpenOrderInitialMargin} USDT`);
            
            // Verificar si hay posiciones abiertas
            if (validation.positions && validation.positions.length > 0) {
                console.log('');
                console.log('📈 Posiciones actuales:');
                validation.positions.forEach(pos => {
                    console.log(`   ${pos.symbol}: ${pos.positionAmt} (PNL: ${pos.unrealizedProfit} USDT)`);
                });
            } else {
                console.log('');
                console.log('📈 No hay posiciones abiertas actualmente');
            }
        }
        
        // Mostrar información de allocation si está disponible
        if (validation.allocation) {
            console.log('');
            console.log('='.repeat(60));
            console.log('📊 ALLOCATION RECOMENDADO');
            console.log('='.repeat(60));
            
            const allocation = validation.allocation;
            console.log(`💸 Capital disponible para trading: ${allocation.tradingCapital} USDT`);
            console.log(`🎯 Tamaño máximo por posición: ${allocation.maxPositionSize} USDT`);
            console.log(`⚠️ Riesgo máximo por trade: ${allocation.maxRiskPerTrade} USDT`);
            console.log(`🛡️ Reserva de seguridad: ${allocation.safetyReserve} USDT`);
            console.log(`📊 Max simultaneous positions: ${allocation.maxSimultaneousPositions}`);
            
            // Mostrar allocation por categoría si está disponible
            if (allocation.categoryAllocation) {
                console.log('');
                console.log('📋 Allocation por categoría:');
                Object.entries(allocation.categoryAllocation).forEach(([category, value]) => {
                    console.log(`   ${category}: ${value.percentage}% (${value.amount} USDT)`);
                });
            }
        }
        
        // Información de estado del sistema Leonardo
        console.log('');
        console.log('🎯 Estado del sistema Leonardo:');
        console.log(`   Balance mínimo requerido: ${process.env.MIN_BALANCE_USDT || 100} USDT`);
        console.log(`   Bait amount configurado: ${process.env.BAIT_AMOUNT || 10} USDT`);
        console.log(`   Max leverage: ${process.env.TRADING_MAX_LEVERAGE || 125}x`);
        console.log(`   Trading real habilitado: ${process.env.REAL_TRADING_ENABLED || 'false'}`);
        
        // Verificar si el balance es suficiente para operar
        if (validation.accountInfo) {
            const minBalance = parseFloat(process.env.MIN_BALANCE_USDT || 100);
            const currentBalance = validation.accountInfo.availableBalance;
            
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
        }
        
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
