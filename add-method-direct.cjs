const fs = require('fs');
const path = require('path');

console.log('🔧 Agregando método get24hrTicker directamente...');

const filePath = path.join(__dirname, 'quantum-core', 'BinanceRealConnector.js');
let content = fs.readFileSync(filePath, 'utf8');

// Buscar el final de la clase (antes del cierre })
const classEndIndex = content.lastIndexOf('    }');
if (classEndIndex === -1) {
    console.error('❌ No se pudo encontrar el final de la clase');
    process.exit(1);
}

// Método a agregar
const newMethod = `
    // Método para obtener ticker de 24 horas
    async get24hrTicker(symbol) {
        try {
            const endpoint = '/fapi/v1/ticker/24hr';
            const params = symbol ? { symbol: symbol } : {};
            
            const response = await axios.get(\`\${this.baseURL}\${endpoint}\`, {
                params: params,
                timeout: 10000
            });

            if (response.data) {
                return response.data;
            } else {
                throw new Error('No data received from Binance');
            }
        } catch (error) {
            console.error(\`[BINANCE REAL] ❌ Error obteniendo 24hr ticker para \${symbol}:\`, error.message);
            throw error;
        }
    }
`;

// Insertar el método antes del cierre de la clase
const newContent = content.substring(0, classEndIndex) + newMethod + content.substring(classEndIndex);

// Guardar el archivo
fs.writeFileSync(filePath, newContent, 'utf8');

console.log('✅ Método get24hrTicker agregado correctamente');
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
