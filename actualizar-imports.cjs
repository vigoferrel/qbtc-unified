// actualizar-imports.js
// Script para actualizar imports/rutas en los archivos reorganizados

const fs = require('fs');
const path = require('path');

const cambios = [
  // Ejemplo: [archivo, búsqueda, reemplazo]
  ['core/quantum-engine/QuantumProfitMaximizer.js', "require('./QuantumPrimeMetricsManager')", "require('../../quantum-core/QuantumPrimeMetricsManager')"],
  ['core/quantum-engine/QuantumProfitMaximizer.js', "require('../leonardo-consciousness/SignalBus')", "require('../../leonardo-unified/core/SignalBus')"],
  ['core/quantum-engine/QuantumMarketMaker.js', "require('./QuantumLeverageEngine')", "require('./QuantumLeverageEngine')"],
  ['core/quantum-engine/QuantumLeverageEngine.js', "require('./QuantumMarketMaker')", "require('./QuantumMarketMaker')"],
  // Agrega aquí más reglas según los movimientos realizados
];

cambios.forEach(([archivo, busqueda, reemplazo]) => {
  const ruta = path.join(__dirname, archivo);
  if (!fs.existsSync(ruta)) {
    console.log(`No existe: ${ruta}`);
    return;
  }
  let contenido = fs.readFileSync(ruta, 'utf8');
  if (contenido.includes(busqueda)) {
    contenido = contenido.replace(new RegExp(busqueda, 'g'), reemplazo);
    fs.writeFileSync(ruta, contenido, 'utf8');
    console.log(`Actualizado: ${archivo}`);
  }
});

console.log('Actualización de imports/rutas completada.');
