#!/usr/bin/env node

/**
 * Script para verificar el estado actual del baneo de Binance
 * Verifica si la IP sigue baneada o si ya se levantó la restricción
 */

const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class BinanceBanChecker {
    constructor() {
        this.envPath = path.join(__dirname, 'core', 'quantum-engine', '.env');
        this.loadConfig();
        this.currentIP = null;
        this.results = {
            publicTests: [],
            authTests: [],
            ipInfo: {},
            banStatus: 'unknown',
            recommendations: []
        };
    }

    loadConfig() {
        try {
            const envContent = fs.readFileSync(this.envPath, 'utf8');
            this.config = {};
            
            envContent.split('\n').forEach(line => {
                if (line.includes('=') && !line.startsWith('#')) {
                    const [key, ...valueParts] = line.split('=');
                    this.config[key.trim()] = valueParts.join('=').trim();
                }
            });
        } catch (error) {
            console.error('❌ Error leyendo configuración:', error.message);
            this.config = {};
        }
    }

    async checkBanStatus() {
        console.log('🔍 VERIFICADOR DE ESTADO DE BANEO - BINANCE');
        console.log('=' .repeat(50));
        console.log(`⏰ Fecha: ${new Date().toLocaleString()}\n`);

        // 1. Obtener IP actual
        await this.getCurrentIP();

        // 2. Probar endpoints públicos (sin autenticación)
        await this.testPublicEndpoints();

        // 3. Probar endpoints con autenticación
        await this.testAuthenticatedEndpoints();

        // 4. Analizar resultados
        this.analyzeResults();

        // 5. Mostrar conclusiones
        this.showConclusions();

        return this.results;
    }

    async getCurrentIP() {
        console.log('🌐 1. OBTENIENDO IP ACTUAL...');
        
        try {
            const ip = await this.getIPFromService('https://api.ipify.org');
            this.currentIP = ip;
            this.results.ipInfo.current = ip;
            console.log(`   ✅ IP Actual: ${ip}`);

            // También obtener información adicional de la IP
            await this.getIPDetails();
        } catch (error) {
            console.log(`   ❌ Error obteniendo IP: ${error.message}`);
        }
    }

    async getIPFromService(url) {
        return new Promise((resolve, reject) => {
            const req = https.get(url, { timeout: 5000 }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve(data.trim()));
            });
            
            req.on('error', reject);
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Timeout'));
            });
        });
    }

    async getIPDetails() {
        try {
            const ipInfo = await this.getIPFromService(`https://ipinfo.io/${this.currentIP}/json`);
            const parsed = JSON.parse(ipInfo);
            
            this.results.ipInfo = {
                ...this.results.ipInfo,
                country: parsed.country,
                region: parsed.region,
                city: parsed.city,
                isp: parsed.org,
                timezone: parsed.timezone
            };
            
            console.log(`   📍 Ubicación: ${parsed.city}, ${parsed.region}, ${parsed.country}`);
            console.log(`   🏢 ISP: ${parsed.org}`);
        } catch (error) {
            console.log(`   ⚠️ No se pudo obtener información detallada de IP`);
        }
    }

    async testPublicEndpoints() {
        console.log('\n🌐 2. PROBANDO ENDPOINTS PÚBLICOS...');
        
        const publicEndpoints = [
            { name: 'Ping', path: '/fapi/v1/ping', description: 'Test básico de conectividad' },
            { name: 'Server Time', path: '/fapi/v1/time', description: 'Hora del servidor' },
            { name: 'Exchange Info', path: '/fapi/v1/exchangeInfo', description: 'Información del exchange' },
            { name: 'Ticker Price', path: '/fapi/v1/ticker/price?symbol=BTCUSDT', description: 'Precio de BTCUSDT' }
        ];

        for (const endpoint of publicEndpoints) {
            const result = await this.testEndpoint(endpoint, false);
            this.results.publicTests.push(result);
            
            const status = result.success ? '✅' : '❌';
            const details = result.success ? `(${result.responseTime}ms)` : `(${result.error})`;
            console.log(`   ${status} ${endpoint.name}: ${details}`);
        }
    }

    async testAuthenticatedEndpoints() {
        console.log('\n🔑 3. PROBANDO ENDPOINTS CON AUTENTICACIÓN...');
        
        const apiKey = this.config.BINANCE_API_KEY;
        const secretKey = this.config.BINANCE_SECRET_KEY;
        
        if (!apiKey || !secretKey) {
            console.log('   ❌ No se encontraron credenciales API');
            return;
        }

        const authEndpoints = [
            { name: 'Account Info', path: '/fapi/v2/account', description: 'Información de cuenta' },
            { name: 'Balance', path: '/fapi/v2/balance', description: 'Balances de la cuenta' },
            { name: 'Position Risk', path: '/fapi/v2/positionRisk', description: 'Información de posiciones' }
        ];

        for (const endpoint of authEndpoints) {
            const result = await this.testEndpoint(endpoint, true);
            this.results.authTests.push(result);
            
            const status = result.success ? '✅' : '❌';
            let details;
            
            if (result.success) {
                details = `(${result.responseTime}ms)`;
            } else {
                // Analizar tipos específicos de error
                if (result.statusCode === 401) {
                    details = `(401 - API Key/Permissions issue)`;
                } else if (result.statusCode === 403) {
                    details = `(403 - IP BANNED!)`;
                } else if (result.error.includes('timeout')) {
                    details = `(Timeout - Posible bloqueo)`;
                } else {
                    details = `(${result.error})`;
                }
            }
            
            console.log(`   ${status} ${endpoint.name}: ${details}`);
        }
    }

    async testEndpoint(endpoint, requiresAuth) {
        const isTestnet = this.config.BINANCE_TESTNET === 'true';
        const hostname = isTestnet ? 'testnet.binancefuture.com' : 'fapi.binance.com';
        
        let path = endpoint.path;
        let headers = {
            'User-Agent': 'QBTC-Ban-Checker/1.0'
        };

        if (requiresAuth) {
            const timestamp = Date.now();
            const queryString = `timestamp=${timestamp}`;
            const signature = crypto
                .createHmac('sha256', this.config.BINANCE_SECRET_KEY)
                .update(queryString)
                .digest('hex');
            
            path += (path.includes('?') ? '&' : '?') + `${queryString}&signature=${signature}`;
            headers['X-MBX-APIKEY'] = this.config.BINANCE_API_KEY;
        }

        return new Promise((resolve) => {
            const startTime = Date.now();
            
            const req = https.request({
                hostname,
                path,
                method: 'GET',
                headers,
                timeout: 10000
            }, (res) => {
                const responseTime = Date.now() - startTime;
                let data = '';
                
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    resolve({
                        name: endpoint.name,
                        success: res.statusCode === 200,
                        statusCode: res.statusCode,
                        responseTime,
                        dataSize: data.length,
                        error: res.statusCode !== 200 ? `HTTP ${res.statusCode}` : null
                    });
                });
            });

            req.on('error', (error) => {
                resolve({
                    name: endpoint.name,
                    success: false,
                    error: error.message,
                    responseTime: Date.now() - startTime
                });
            });

            req.on('timeout', () => {
                req.destroy();
                resolve({
                    name: endpoint.name,
                    success: false,
                    error: 'timeout',
                    responseTime: 10000
                });
            });

            req.end();
        });
    }

    analyzeResults() {
        console.log('\n📊 4. ANALIZANDO RESULTADOS...');
        
        const publicSuccessRate = this.results.publicTests.filter(t => t.success).length / this.results.publicTests.length * 100;
        const authSuccessRate = this.results.authTests.filter(t => t.success).length / Math.max(this.results.authTests.length, 1) * 100;
        
        console.log(`   📈 Endpoints públicos: ${publicSuccessRate.toFixed(0)}% exitosos`);
        console.log(`   🔑 Endpoints autenticados: ${authSuccessRate.toFixed(0)}% exitosos`);

        // Determinar estado del ban
        const hasIPBan = this.results.authTests.some(t => t.statusCode === 403);
        const hasAuthIssues = this.results.authTests.some(t => t.statusCode === 401);
        const hasTimeouts = [...this.results.publicTests, ...this.results.authTests]
            .some(t => t.error && t.error.includes('timeout'));

        if (publicSuccessRate === 100 && authSuccessRate === 100) {
            this.results.banStatus = 'no_ban';
            this.results.recommendations.push('✅ Todo funciona correctamente - No hay baneo');
        } else if (hasIPBan) {
            this.results.banStatus = 'ip_banned';
            this.results.recommendations.push('🚫 IP BANEADA - Necesitas cambiar IP o usar VPN');
        } else if (hasAuthIssues && publicSuccessRate > 80) {
            this.results.banStatus = 'auth_issues';
            this.results.recommendations.push('🔑 Problema con credenciales API - Verificar keys y permisos');
        } else if (hasTimeouts) {
            this.results.banStatus = 'connection_issues';
            this.results.recommendations.push('🌐 Problemas de conectividad - Posible throttling');
        } else {
            this.results.banStatus = 'partial_issues';
            this.results.recommendations.push('⚠️ Problemas parciales - Revisar configuración');
        }
    }

    showConclusions() {
        console.log('\n🎯 5. CONCLUSIONES FINALES');
        console.log('=' .repeat(50));
        
        console.log(`\n📍 IP Actual: ${this.currentIP}`);
        if (this.results.ipInfo.isp) {
            console.log(`🏢 Proveedor: ${this.results.ipInfo.isp}`);
            console.log(`🌍 Ubicación: ${this.results.ipInfo.city}, ${this.results.ipInfo.country}`);
        }

        console.log(`\n🚦 Estado del Ban: ${this.getBanStatusText()}`);
        
        console.log('\n💡 RECOMENDACIONES:');
        this.results.recommendations.forEach(rec => {
            console.log(`   ${rec}`);
        });

        // Recomendaciones específicas según el estado
        if (this.results.banStatus === 'ip_banned') {
            console.log('\n🛠️ ACCIONES PARA IP BANEADA:');
            console.log('   1. Usar VPN para cambiar IP');
            console.log('   2. Contactar ISP para IP dinámica');
            console.log('   3. Usar proxy/túnel (ngrok, etc.)');
            console.log('   4. Esperar 24-48 horas para auto-unban');
        } else if (this.results.banStatus === 'auth_issues') {
            console.log('\n🔑 ACCIONES PARA PROBLEMAS DE AUTH:');
            console.log('   1. Verificar API Key activa en Binance');
            console.log('   2. Confirmar IP en whitelist');
            console.log('   3. Verificar permisos de Futures Trading');
            console.log('   4. Regenerar API Key si es necesario');
        } else if (this.results.banStatus === 'no_ban') {
            console.log('\n✅ SISTEMA LISTO:');
            console.log('   - Binance API funcional');
            console.log('   - IP no está baneada');
            console.log('   - Credenciales válidas');
            console.log('   - Listo para trading');
        }

        console.log('\n' + '=' .repeat(50));
        console.log(`⏰ Verificación completada: ${new Date().toLocaleString()}`);
    }

    getBanStatusText() {
        const statusMap = {
            'no_ban': '🟢 SIN BANEO - Todo OK',
            'ip_banned': '🔴 IP BANEADA',
            'auth_issues': '🟡 PROBLEMAS DE AUTENTICACIÓN',
            'connection_issues': '🟠 PROBLEMAS DE CONEXIÓN',
            'partial_issues': '⚠️ PROBLEMAS PARCIALES',
            'unknown': '❓ ESTADO DESCONOCIDO'
        };
        
        return statusMap[this.results.banStatus] || statusMap.unknown;
    }
}

// Ejecutar el checker
async function main() {
    const checker = new BinanceBanChecker();
    const results = await checker.checkBanStatus();
    
    // Guardar resultados en archivo
    const resultsFile = path.join(__dirname, 'ban-status-results.json');
    fs.writeFileSync(resultsFile, JSON.stringify({
        timestamp: new Date().toISOString(),
        ...results
    }, null, 2));
    
    console.log(`\n📄 Resultados guardados en: ban-status-results.json`);
    
    // Devolver código de salida basado en el estado
    const exitCodes = {
        'no_ban': 0,
        'auth_issues': 1,
        'ip_banned': 2,
        'connection_issues': 3,
        'partial_issues': 4,
        'unknown': 5
    };
    
    process.exit(exitCodes[results.banStatus] || 5);
}

if (require.main === module) {
    main();
}

module.exports = BinanceBanChecker;
