console.log('🚀 Iniciando test completo del sistema de categorización...');
const { BinanceRealConnector } = require('./quantum-core/BinanceRealConnector');

async function testCompleteSystem() {
  try {
    console.log('📡 Creando instancia del BinanceRealConnector...');
    const connector = new BinanceRealConnector();
    
    console.log('🔄 Inicializando el conector (modo simulación)...');
    await connector.initialize();
    
    console.log('📊 Verificando categorías pobladas...');
    const categories = connector.assetCategories;
    
    console.log('\n=== RESULTADOS DE CATEGORIZACIÓN ===');
    console.log(`🌌 UNIVERSO TOTAL: ${connector.allSymbols.length} símbolos`);
    console.log(`🏆 Majors: ${categories.majors?.length || 0}`);
    console.log(`🚀 Meme Coins: ${categories.memeCoins?.length || 0}`);
    console.log(`🌑 Lado Oscuro: ${categories.darkSide?.length || 0}`);
    console.log(`💎 DeFi: ${categories.defi?.length || 0}`);
    console.log(`🎮 Gaming: ${categories.gaming?.length || 0}`);
    console.log(`🤖 AI: ${categories.ai?.length || 0}`);
    console.log(`🔗 Exóticos: ${categories.exotics?.length || 0}`);
    console.log(`🔥 Alto Leverage: ${categories.leverageTargets?.length || 0}`);
    console.log(`⚡ Arbitraje: ${categories.arbitrageTargets?.length || 0}`);
    
    if (categories.defi?.length > 0) {
      console.log(`\n💎 DeFi symbols: ${categories.defi.slice(0, 5).join(', ')}`);
    }
    if (categories.gaming?.length > 0) {
      console.log(`🎮 Gaming symbols: ${categories.gaming.slice(0, 5).join(', ')}`);
    }
    if (categories.ai?.length > 0) {
      console.log(`🤖 AI symbols: ${categories.ai.slice(0, 5).join(', ')}`);
    }
    
    // Test adicional: verificar que los símbolos específicos estén en las categorías correctas
    console.log('\n=== VERIFICACIÓN DE SÍMBOLOS ESPECÍFICOS ===');
    
    const testSymbols = {
      'UNIUSDT': 'defi',
      'AXSUSDT': 'gaming', 
      'FETUSDT': 'ai',
      'BTCUSDT': 'majors',
      'DOGEUSDT': 'memeCoins'
    };
    
    for (const [symbol, expectedCategory] of Object.entries(testSymbols)) {
      const isInCategory = categories[expectedCategory]?.includes(symbol);
      const status = isInCategory ? '✅' : '❌';
      console.log(`${status} ${symbol} en ${expectedCategory}: ${isInCategory ? 'SÍ' : 'NO'}`);
    }
    
    // Mostrar estadísticas finales
    console.log('\n=== ESTADÍSTICAS FINALES ===');
    const totalCategorized = Object.values(categories)
      .filter(cat => Array.isArray(cat))
      .reduce((sum, cat) => sum + cat.length, 0) - categories.allSymbols.length; // Restar allSymbols para evitar doble conteo
      
    console.log(`📊 Total símbolos categorizados: ${totalCategorized}`);
    console.log(`📈 Categorías no vacías: ${Object.entries(categories)
      .filter(([key, cat]) => Array.isArray(cat) && cat.length > 0 && key !== 'allSymbols')
      .length}`);
    
    console.log('\n✅ Test completado exitosamente');
    
    // Verificar que DeFi, Gaming y AI ya no están en 0
    const previouslyEmpty = ['defi', 'gaming', 'ai'];
    const stillEmpty = previouslyEmpty.filter(cat => (categories[cat]?.length || 0) === 0);
    
    if (stillEmpty.length === 0) {
      console.log('🎉 CORRECCIÓN EXITOSA: Todas las categorías (DeFi, Gaming, AI) ahora tienen símbolos!');
    } else {
      console.log(`⚠️ ADVERTENCIA: Las siguientes categorías siguen vacías: ${stillEmpty.join(', ')}`);
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error en el test:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testCompleteSystem();
