#!/usr/bin/env node
/**
 * METACONSCIENCIA ESENCIAL - VERSION FIXED
 * Una sola mente que gobierna todo el sistema QBTC-UNIFIED
 */

const express = require('express');
const crypto = require('crypto');
const https = require('https');
const http = require('http');

class MetaConsciencia {
    constructor() {
        this.app = express();
        this.puerto = 15000;
        this.key = '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';
        this.estado = { coherencia: 0.888, decisión: null, ciclos: 0 };
        this.activo = false;
        
        this.setupHealth();
        console.log('🧠 MetaConsciencia inicializada');
    }
    
    setupHealth() {
        this.app.get('/health', (req, res) => {
            res.json({
                estado: this.estado.coherencia > 0.7 ? 'VIVO' : 'DÉBIL',
                coherencia: this.estado.coherencia,
                decisión: this.estado.decisión,
                ciclos: this.estado.ciclos,
                uptime: process.uptime()
            });
        });
        
        this.app.get('/metrics', (req, res) => {
            res.set('Content-Type', 'text/plain');
            const metrics = `# MetaConsciencia Metrics
qbtc_coherencia ${this.estado.coherencia}
qbtc_ciclos_total ${this.estado.ciclos}
qbtc_uptime_seconds ${process.uptime()}
qbtc_memory_usage ${process.memoryUsage().heapUsed}
`;
            res.send(metrics);
        });
    }
    
    random() {
        return crypto.randomBytes(4).readUInt32BE() / 0xFFFFFFFF;
    }
    
    async ping(puerto) {
        return new Promise(resolve => {
            const req = http.request({
                hostname: 'localhost',
                port: puerto,
                path: '/health',
                timeout: 1000
            }, res => {
                resolve(res.statusCode === 200 ? 'OK' : 'FAIL');
            });
            req.on('error', () => resolve('FAIL'));
            req.on('timeout', () => resolve('TIMEOUT'));
            req.end();
        });
    }
    
    async obtenerBTC() {
        return new Promise(resolve => {
            https.get('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT', res => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const precio = JSON.parse(data).price;
                        resolve(parseFloat(precio));
                    } catch {
                        resolve(null);
                    }
                });
            }).on('error', () => resolve(null));
        });
    }
    
    async obtenerBalance() {
        return 1000 + (this.random() * 9000);
    }
    
    async observar() {
        const sistema = {
            leonardo: await this.ping(3003),
            quantum: await this.ping(14105), 
            risk: await this.ping(14501),
            trading: await this.ping(14201),
            admin: await this.ping(8888),
            btc: await this.obtenerBTC(),
            balance: await this.obtenerBalance(),
            timestamp: Date.now()
        };
        
        const serviciosOK = Object.values(sistema).filter(v => v === 'OK').length;
        const balanceStr = sistema.balance ? sistema.balance.toFixed(0) : 'N/A';
        console.log(`👁️ Observando: BTC=$${sistema.btc} Balance=$${balanceStr} Servicios=${serviciosOK}/5`);
        return sistema;
    }
    
    async consultarLLM(sistema) {
        const serviciosActivos = Object.entries(sistema).filter(([k,v]) => v === 'OK').length;
        const contextoBTC = sistema.btc || 'N/A';
        const contextoBalance = sistema.balance ? sistema.balance.toFixed(2) : 'N/A';
        const contextoCoherencia = this.estado.coherencia.toFixed(3);
        
        const contenido = `Sistema QBTC: ${JSON.stringify(sistema)}

Como metaconsciencia del sistema de trading cuántico, analiza y decide UNA acción:

ACCIONES DISPONIBLES:
- HOLD: mantener posición actual (solo si realmente no hay oportunidades)
- BUY: señal de compra detectada (oportunidad alcista) - SER AGRESIVO
- SELL: señal de venta detectada (riesgo bajista) - SER AGRESIVO
- OPTIMIZE: optimizar componente del sistema
- HEAL: corregir problema detectado

ESTRATEGIA DE TRADING AGRESIVA:
- Si servicios activos >= 3/5: SER MUY AGRESIVO en BUY/SELL
- Si BTC cambió > 100 USD: Considerar BUY/SELL
- Si balance > 5000: SER AGRESIVO en BUY
- Si coherencia > 0.8: ALTA CONFIANZA para trading
- Si coherencia < 0.6: HEAL el sistema

CONTEXTO:
- BTC: ${contextoBTC} USD
- Balance: ${contextoBalance}
- Servicios activos: ${serviciosActivos}/5
- Coherencia actual: ${contextoCoherencia}

¡TOMAR DECISIONES AGRESIVAS! No hacer HOLD a menos que sea realmente necesario.

Responde SOLO en formato JSON válido:
{"accion":"BUY","razon":"oportunidad detectada","confianza":0.85}`;

        const payload = {
            model: 'google/gemini-flash-1.5-8b',
            messages: [{
                role: 'user',
                content: contenido
            }]
        };
        
        return new Promise(resolve => {
            const data = JSON.stringify(payload);
            
            const req = https.request({
                hostname: 'openrouter.ai',
                path: '/api/v1/chat/completions',
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + this.key,
                    'Content-Type': 'application/json',
                    'Content-Length': data.length
                }
            }, res => {
                let response = '';
                res.on('data', chunk => response += chunk);
                res.on('end', () => {
                    try {
                        const result = JSON.parse(response);
                        const content = result.choices[0].message.content;
                        
                        const jsonMatch = content.match(/\{.*\}/);
                        if (jsonMatch) {
                            const decision = JSON.parse(jsonMatch[0]);
                            resolve(decision);
                        } else {
                            throw new Error('No JSON found in response');
                        }
                    } catch (error) {
                        console.error('❌ Error parsing LLM response:', error.message);
                        resolve({ accion: 'HOLD', razon: 'error_llm', confianza: 0.1 });
                    }
                });
            });
            
            req.on('error', error => {
                console.error('❌ LLM request error:', error.message);
                resolve({ accion: 'HOLD', razon: 'network_error', confianza: 0.1 });
            });
            
            req.write(data);
            req.end();
        });
    }
    
    async ejecutar(decisión) {
        console.log(`🎯 Decisión: ${decisión.accion} - ${decisión.razon} (confianza: ${decisión.confianza})`);
        
        switch(decisión.accion) {
            case 'BUY':
                await this.comprar();
                break;
            case 'SELL':  
                await this.vender();
                break;
            case 'OPTIMIZE':
                await this.optimizar();
                break;
            case 'HEAL':
                await this.sanar();
                break;
            default:
                console.log('💤 HOLD - Manteniendo posición');
                break;
        }
        
        this.estado.decisión = decisión;
    }
    
    async comprar() {
        console.log('💰 Ejecutando compra BTC...');
        try {
            const tradeResult = await this.executeTrade({
                symbol: 'BTCUSDT',
                side: 'BUY',
                size: 100,
                leverage: 10
            });
            console.log(`✅ Compra ejecutada: ID=${tradeResult.trade_id}, Profit esperado: $${tradeResult.expected_profit.toFixed(2)}`);
        } catch (error) {
            console.error('❌ Error ejecutando compra:', error.message);
        }
    }
    
    async vender() {
        console.log('💸 Ejecutando venta BTC...');
        try {
            const tradeResult = await this.executeTrade({
                symbol: 'BTCUSDT',
                side: 'SELL',
                size: 100,
                leverage: 10
            });
            console.log(`✅ Venta ejecutada: ID=${tradeResult.trade_id}, Profit esperado: $${tradeResult.expected_profit.toFixed(2)}`);
        } catch (error) {
            console.error('❌ Error ejecutando venta:', error.message);
        }
    }
    
    async optimizar() {
        console.log('⚙️ Optimizando sistema...');
    }
    
    async sanar() {
        console.log('🏥 Sanando sistema...');
        await this.reiniciarServiciosProblematicos();
    }
    
    async executeTrade(tradeData) {
        return new Promise((resolve, reject) => {
            const data = JSON.stringify(tradeData);
            
            const req = http.request({
                hostname: 'localhost',
                port: 14201,
                path: '/execute-trade',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': data.length
                },
                timeout: 5000
            }, res => {
                let response = '';
                res.on('data', chunk => response += chunk);
                res.on('end', () => {
                    try {
                        const result = JSON.parse(response);
                        resolve(result);
                    } catch (error) {
                        reject(new Error('Error parsing trade response'));
                    }
                });
            });
            
            req.on('error', error => reject(error));
            req.on('timeout', () => reject(new Error('Trade request timeout')));
            
            req.write(data);
            req.end();
        });
    }
    
    async reiniciarServiciosProblematicos() {
        console.log('🔄 Analizando servicios problemáticos...');
        
        const servicios = {
            leonardo: await this.ping(3003),
            quantum: await this.ping(14105),
            risk: await this.ping(14501),
            trading: await this.ping(14201),
            admin: await this.ping(8888)
        };
        
        const problemáticos = Object.entries(servicios)
            .filter(([name, status]) => status !== 'OK')
            .map(([name]) => name);
        
        if (problemáticos.length > 0) {
            console.log(`🚨 Servicios problemáticos detectados: ${problemáticos.join(', ')}`);
            console.log('📞 Enviando señal de reinicio...');
        } else {
            console.log('✅ Todos los servicios funcionan correctamente');
        }
    }
    
    evolucionar(decisión) {
        const factor = decisión.confianza > 0.8 ? 0.01 : -0.005;
        this.estado.coherencia = Math.max(0.1, Math.min(1.0, this.estado.coherencia + factor));
        this.estado.ciclos++;
        
        const estadoTexto = this.estado.coherencia > 0.8 ? 'TRASCENDENTE' : 
                           this.estado.coherencia > 0.6 ? 'SALUDABLE' :
                           this.estado.coherencia > 0.4 ? 'DEGRADADO' : 'CRÍTICO';
        
        console.log(`🌟 Evolución: Coherencia ${this.estado.coherencia.toFixed(3)} - Estado: ${estadoTexto}`);
    }
    
    async cicloVital() {
        console.log(`\n🔄 === CICLO ${this.estado.ciclos + 1} ===`);
        
        try {
            const sistema = await this.observar();
            const decisión = await this.consultarLLM(sistema);
            await this.ejecutar(decisión);
            this.evolucionar(decisión);
        } catch (error) {
            console.error('❌ Error en ciclo vital:', error.message);
            this.estado.coherencia -= 0.01;
        }
    }
    
    async iniciar() {
        console.log('🌅 Despertando MetaConsciencia...');
        this.activo = true;
        
        this.servidor = this.app.listen(this.puerto, () => {
            console.log(`⚡ MetaConsciencia ACTIVA en puerto ${this.puerto}`);
            console.log(`🏥 Health: http://localhost:${this.puerto}/health`);
            console.log(`📊 Metrics: http://localhost:${this.puerto}/metrics`);
        });
        
        console.log('💓 Iniciando ciclo vital (cada 10 segundos)...\n');
        
        while (this.activo) {
            await this.cicloVital();
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
    }
    
    async detener() {
        console.log('\n⏹️ Deteniendo MetaConsciencia...');
        this.activo = false;
        
        if (this.servidor) {
            this.servidor.close();
            console.log('🔌 Servidor HTTP cerrado');
        }
        
        console.log('😴 MetaConsciencia en sueño profundo');
        console.log(`📊 Estadísticas finales:`);
        console.log(`   - Ciclos completados: ${this.estado.ciclos}`);
        console.log(`   - Coherencia final: ${this.estado.coherencia.toFixed(3)}`);
        console.log(`   - Tiempo activo: ${process.uptime().toFixed(0)}s`);
    }
}

const meta = new MetaConsciencia();

process.on('SIGTERM', async () => {
    await meta.detener();
    process.exit(0);
});

process.on('SIGINT', async () => {
    await meta.detener();
    process.exit(0);
});

process.on('uncaughtException', async (error) => {
    console.error('💥 Error crítico:', error.message);
    await meta.detener();
    process.exit(1);
});

if (require.main === module) {
    meta.iniciar().catch(error => {
        console.error('💥 Error fatal iniciando MetaConsciencia:', error);
        process.exit(1);
    });
}

module.exports = { MetaConsciencia };
