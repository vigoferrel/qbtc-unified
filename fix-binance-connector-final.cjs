const fs = require('fs');
const path = require('path');

console.log('🔧 Arreglando completamente BinanceRealConnector...');

const filePath = path.join(__dirname, 'quantum-core', 'BinanceRealConnector.js');

// Leer el archivo actual
let content = fs.readFileSync(filePath, 'utf8');

// Buscar y eliminar el método mal ubicado
const lines = content.split('\n');
const fixedLines = [];
let skipSection = false;
let inPrototype = false;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detectar si estamos en la sección prototype
    if (line.includes('BinanceRealConnector.prototype.getRateLimitStats')) {
        inPrototype = true;
    }
    
    // Si estamos en prototype y encontramos el método mal ubicado, saltarlo
    if (inPrototype && line.includes('async get24hrTicker')) {
        skipSection = true;
        continue;
    }
    
    // Si estamos saltando y encontramos el cierre del prototype, parar de saltar
    if (skipSection && line.includes('};')) {
        skipSection = false;
        inPrototype = false;
        fixedLines.push(line);
        continue;
    }
    
    // Si estamos saltando, continuar sin agregar líneas
    if (skipSection) {
        continue;
    }
    
    fixedLines.push(line);
}

// Buscar el final de la clase para agregar el método correctamente
const classEndIndex = fixedLines.findIndex(line => line.trim() === '}');
if (classEndIndex === -1) {
    console.error('❌ No se pudo encontrar el final de la clase');
    process.exit(1);
}

// Método a agregar
const newMethod = [
    '',
    '    // Método para obtener ticker de 24 horas',
    '    async get24hrTicker(symbol) {',
    '        try {',
    '            const endpoint = \'/fapi/v1/ticker/24hr\';',
    '            const params = symbol ? { symbol: symbol } : {};',
    '            ',
    '            const response = await axios.get(`${this.baseURL}${endpoint}`, {',
    '                params: params,',
    '                timeout: 10000',
    '            });',
    '',
    '            if (response.data) {',
    '                return response.data;',
    '            } else {',
    '                throw new Error(\'No data received from Binance\');',
    '            }',
    '        } catch (error) {',
    '            console.error(`[BINANCE REAL] ❌ Error obteniendo 24hr ticker para ${symbol}:`, error.message);',
    '            throw error;',
    '        }',
    '    }',
    '',
    '    // Método para obtener todos los tickers de 24 horas',
    '    async getAll24hrTickers() {',
    '        try {',
    '            const endpoint = \'/fapi/v1/ticker/24hr\';',
    '            ',
    '            const response = await axios.get(`${this.baseURL}${endpoint}`, {',
    '                timeout: 15000',
    '            });',
    '',
    '            if (response.data && Array.isArray(response.data)) {',
    '                return response.data;',
    '            } else {',
    '                throw new Error(\'No data received from Binance\');',
    '            }',
    '        } catch (error) {',
    '            console.error(`[BINANCE REAL] ❌ Error obteniendo todos los 24hr tickers:`, error.message);',
    '            throw error;',
    '        }',
    '    }'
];

// Insertar el método antes del cierre de la clase
fixedLines.splice(classEndIndex, 0, ...newMethod);

// Guardar el archivo arreglado
const fixedContent = fixedLines.join('\n');
fs.writeFileSync(filePath, fixedContent, 'utf8');

console.log('✅ BinanceRealConnector arreglado correctamente');
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
