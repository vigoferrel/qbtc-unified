const fs = require('fs');
const path = require('path');

console.log('🔧 Arreglando BinanceRealConnector.js...');

const filePath = path.join(__dirname, 'quantum-core', 'BinanceRealConnector.js');
let content = fs.readFileSync(filePath, 'utf8');

// Buscar la línea exacta donde termina getRealDataStatus
const lines = content.split('\n');
const newLines = [];

let i = 0;
while (i < lines.length) {
    const line = lines[i];
    newLines.push(line);
    
    // Si encontramos el return status; del método getRealDataStatus
    if (line.trim() === 'return status;') {
        // Agregar el método get24hrTicker después de la llave de cierre
        newLines.push('    }');
        newLines.push('');
        newLines.push('    // Método para obtener ticker de 24 horas');
        newLines.push('    async get24hrTicker(symbol) {');
        newLines.push('        try {');
        newLines.push('            const endpoint = \'/fapi/v1/ticker/24hr\';');
        newLines.push('            const params = symbol ? { symbol: symbol } : {};');
        newLines.push('            ');
        newLines.push('            const response = await axios.get(`${this.baseURL}${endpoint}`, {');
        newLines.push('                params: params,');
        newLines.push('                timeout: 10000');
        newLines.push('            });');
        newLines.push('');
        newLines.push('            if (response.data) {');
        newLines.push('                return response.data;');
        newLines.push('            } else {');
        newLines.push('                throw new Error(\'No data received from Binance\');');
        newLines.push('            }');
        newLines.push('        } catch (error) {');
        newLines.push('            console.error(`[BINANCE REAL] ❌ Error obteniendo 24hr ticker para ${symbol}:`, error.message);');
        newLines.push('            throw error;');
        newLines.push('        }');
        newLines.push('    }');
        newLines.push('}');
        newLines.push('');
        newLines.push('// Métodos estáticos de singleton');
        
        // Saltar las líneas que ya no necesitamos
        i++;
        while (i < lines.length && !lines[i].includes('// Métodos estáticos de singleton')) {
            i++;
        }
        continue;
    }
    
    i++;
}

// Escribir el archivo corregido
const newContent = newLines.join('\n');
fs.writeFileSync(filePath, newContent, 'utf8');

console.log('✅ BinanceRealConnector.js arreglado correctamente');
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
