#!/usr/bin/env node

console.log('🚀 Iniciando test simple del servidor cuántico...');

try {
    console.log('1. Verificando Node.js...');
    console.log('   - Versión Node:', process.version);
    console.log('   - Plataforma:', process.platform);
    
    console.log('2. Verificando módulos básicos...');
    const express = require('express');
    console.log('   - Express:', express ? '✅ OK' : '❌ ERROR');
    
    const http = require('http');
    console.log('   - HTTP:', http ? '✅ OK' : '❌ ERROR');
    
    const path = require('path');
    console.log('   - Path:', path ? '✅ OK' : '❌ ERROR');
    
    const fs = require('fs').promises;
    console.log('   - FS Promises:', fs ? '✅ OK' : '❌ ERROR');
    
    console.log('3. Verificando logging...');
    const { logger } = require('./core/quantum-engine/config/monitoring');
    console.log('   - Logger:', logger ? '✅ OK' : '❌ ERROR');
    logger.info('✅ Test del logger funcionando');
    
    console.log('4. Verificando servidor cuántico...');
    const { UnifiedHttpServer } = require('./core/quantum-engine/UnifiedHttpServer');
    console.log('   - UnifiedHttpServer:', UnifiedHttpServer ? '✅ OK' : '❌ ERROR');
    
    console.log('5. Creando instancia del servidor...');
    const server = new UnifiedHttpServer();
    console.log('   - Instancia creada:', server ? '✅ OK' : '❌ ERROR');
    
    console.log('✅ Todas las dependencias básicas funcionan correctamente');
    console.log('🎯 El servidor cuántico está listo para ejecutarse');
    
} catch (error) {
    console.error('❌ Error en el test:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
}
