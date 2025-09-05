const fs = require('fs');
const path = require('path');

console.log('🔧 Arreglando error de sintaxis en BinanceRealConnector...');

const filePath = path.join(__dirname, 'quantum-core', 'BinanceRealConnector.js');
let content = fs.readFileSync(filePath, 'utf8');

// Buscar y eliminar las llaves duplicadas
const lines = content.split('\n');
const fixedLines = [];

let skipNext = false;
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Si encontramos el patrón de llaves duplicadas, saltamos la segunda
    if (line.trim() === '}' && i + 1 < lines.length && lines[i + 1].trim() === '}') {
        fixedLines.push(line);
        skipNext = true;
    } else if (skipNext && line.trim() === '}') {
        skipNext = false;
        continue; // Saltamos esta línea
    } else {
        fixedLines.push(line);
        skipNext = false;
    }
}

const fixedContent = fixedLines.join('\n');

// Guardar el archivo arreglado
fs.writeFileSync(filePath, fixedContent, 'utf8');

console.log('✅ Error de sintaxis arreglado');
console.log('🚀 Ejecutando sistema QBTC...');

// Ejecutar el sistema
const { spawn } = require('child_process');
const qbtcProcess = spawn('node', ['system-integrator.js'], {
    stdio: 'inherit'
});

qbtcProcess.on('close', (code) => {
    console.log(`\n🔄 QBTC-UNIFIED terminado con código: ${code}`);
    process.exit(code);
});

qbtcProcess.on('error', (err) => {
    console.error(`❌ Error ejecutando QBTC: ${err.message}`);
    process.exit(1);
});
