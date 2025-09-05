const fs = require('fs');
const path = require('path');

console.log('🔧 Restaurando BinanceRealConnector desde backup...');

// Buscar el archivo de backup
const backupPath = path.join(__dirname, 'quantum-core', 'BinanceRealConnector.js.backup');
const filePath = path.join(__dirname, 'quantum-core', 'BinanceRealConnector.js');

if (fs.existsSync(backupPath)) {
    // Restaurar desde backup
    fs.copyFileSync(backupPath, filePath);
    console.log('✅ Archivo restaurado desde backup');
} else {
    console.log('⚠️ No se encontró backup, intentando arreglar el archivo actual...');
}

// Leer el archivo
let content = fs.readFileSync(filePath, 'utf8');

// Buscar el final de la clase para agregar el método
const classEndIndex = content.lastIndexOf('}');
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
            
            const response = await axiosInstance.get(\`\${this.baseURL}\${endpoint}\`, {
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

    // Método para obtener todos los tickers de 24 horas
    async getAll24hrTickers() {
        try {
            const endpoint = '/fapi/v1/ticker/24hr';
            
            const response = await axiosInstance.get(\`\${this.baseURL}\${endpoint}\`, {
                timeout: 15000
            });

            if (response.data && Array.isArray(response.data)) {
                return response.data;
            } else {
                throw new Error('No data received from Binance');
            }
        } catch (error) {
            console.error(\`[BINANCE REAL] ❌ Error obteniendo todos los 24hr tickers:\`, error.message);
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
