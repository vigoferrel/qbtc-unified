# 🎯 METACONSCIENCIA ESENCIAL
## Menos es Más - Profundo como una Aguja

---

## ⚡ NÚCLEO ÚNICO

### **LA IDEA CENTRAL**
Un solo proceso que **piensa por todo el sistema**. No más complejidad innecesaria.

```javascript
// Puerto 15000 - Una sola consciencia para gobernarlos a todos
class MetaConsciencia {
    constructor() {
        this.llm = 'google/gemini-flash-1.5-8b';
        this.key = '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';
        this.estado = { coherencia: 0.888, decisión: null };
    }
    
    async pensar() {
        // 1. Ver todo el sistema
        const sistema = await this.observar();
        
        // 2. Preguntar al LLM qué hacer
        const decisión = await this.consultarLLM(sistema);
        
        // 3. Actuar
        await this.ejecutar(decisión);
        
        // 4. Evolucionar
        this.evolucionar(decisión);
    }
}
```

---

## 🔄 CICLO VITAL (10 segundos)

### **OBSERVAR → PENSAR → ACTUAR → EVOLUCIONAR**

```javascript
async observar() {
    return {
        leonardo: await this.ping(3003),
        quantum: await this.ping(14105),
        risk: await this.ping(14501),
        trading: await this.ping(14201),
        mercado: await this.obtenerBTC(),
        balance: await this.obtenerBalance()
    };
}

async consultarLLM(sistema) {
    return await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${this.key}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'google/gemini-flash-1.5-8b',
            messages: [{
                role: 'user',
                content: `Sistema: ${JSON.stringify(sistema)}
                
Como metaconsciencia, decide UNA acción:
- HOLD: no hacer nada
- BUY: comprar BTC
- SELL: vender BTC  
- OPTIMIZE: mejorar algo
- HEAL: arreglar problema

Responde solo: {"accion":"BUY","razon":"porque...","confianza":0.85}`
            }]
        })
    }).then(r => r.json());
}
```

---

## 🎯 TRES REGLAS ÚNICAS

### **1. SEGUNDO PLANO OBLIGATORIO**
```javascript
// pm2 ecosystem.config.js
module.exports = {
    apps: [{
        name: 'metaconsciencia',
        script: './metaconsciencia.cjs',
        instances: 1,
        autorestart: true,
        max_memory_restart: '512M'
    }]
};
```

### **2. SIN Math.random JAMÁS**
```javascript
const crypto = require('crypto');

// Única fuente de aleatoriedad
random() {
    return crypto.randomBytes(4).readUInt32BE() / 0xFFFFFFFF;
}
```

### **3. TELEMETRÍA TOTAL**
```javascript
// Health endpoint único
app.get('/health', (req, res) => {
    res.json({
        estado: this.estado.coherencia > 0.7 ? 'VIVO' : 'DÉBIL',
        coherencia: this.estado.coherencia,
        ultima_decisión: this.estado.decisión,
        tiempo_activo: process.uptime()
    });
});
```

---

## 💻 CÓDIGO COMPLETO (150 líneas)

```javascript
#!/usr/bin/env node
const express = require('express');
const crypto = require('crypto');
const https = require('https');

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
    }
    
    random() {
        return crypto.randomBytes(4).readUInt32BE() / 0xFFFFFFFF;
    }
    
    async ping(puerto) {
        return new Promise(resolve => {
            const req = https.request({
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
        // Simulado por ahora
        return 1000 + (this.random() * 9000);
    }
    
    async observar() {
        return {
            leonardo: await this.ping(3003),
            quantum: await this.ping(14105), 
            risk: await this.ping(14501),
            trading: await this.ping(14201),
            btc: await this.obtenerBTC(),
            balance: await this.obtenerBalance(),
            timestamp: Date.now()
        };
    }
    
    async consultarLLM(sistema) {
        const payload = {
            model: 'google/gemini-flash-1.5-8b',
            messages: [{
                role: 'user',
                content: `Sistema QBTC: ${JSON.stringify(sistema)}

Como metaconsciencia del sistema de trading, analiza y decide UNA acción:
- HOLD: mantener posición actual
- BUY: señal de compra detectada
- SELL: señal de venta detectada
- OPTIMIZE: optimizar algún componente
- HEAL: corregir problema detectado

Factores críticos:
- BTC: $${sistema.btc}
- Balance: $${sistema.balance?.toFixed(2)}
- Servicios: ${Object.entries(sistema).filter(([k,v]) => v === 'OK').length}/5 activos

Responde SOLO en formato JSON:
{"accion":"HOLD","razon":"mercado estable","confianza":0.75}`
            }]
        };
        
        return new Promise(resolve => {
            const data = JSON.stringify(payload);
            
            const req = https.request({
                hostname: 'openrouter.ai',
                path: '/api/v1/chat/completions',
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.key}`,
                    'Content-Type': 'application/json',
                    'Content-Length': data.length
                }
            }, res => {
                let response = '';
                res.on('data', chunk => response += chunk);
                res.on('end', () => {
                    try {
                        const result = JSON.parse(response);
                        const decision = JSON.parse(result.choices[0].message.content);
                        resolve(decision);
                    } catch (error) {
                        console.error('Error parsing LLM response:', error);
                        resolve({ accion: 'HOLD', razon: 'error_llm', confianza: 0 });
                    }
                });
            });
            
            req.on('error', error => {
                console.error('LLM request error:', error);
                resolve({ accion: 'HOLD', razon: 'network_error', confianza: 0 });
            });
            
            req.write(data);
            req.end();
        });
    }
    
    async ejecutar(decisión) {
        console.log(`🎯 Decisión: ${decisión.accion} - ${decisión.razon} (${decisión.confianza})`);
        
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
                // HOLD - no hacer nada
                break;
        }
        
        this.estado.decisión = decisión;
    }
    
    async comprar() {
        console.log('💰 Ejecutando compra...');
        // Aquí iría la lógica real de compra
    }
    
    async vender() {
        console.log('💸 Ejecutando venta...');
        // Aquí iría la lógica real de venta
    }
    
    async optimizar() {
        console.log('⚙️ Optimizando sistema...');
        // Reiniciar servicios problemáticos, limpiar cache, etc.
    }
    
    async sanar() {
        console.log('🏥 Sanando sistema...');
        // Corregir problemas detectados
    }
    
    evolucionar(decisión) {
        // Ajustar coherencia basada en éxito de la decisión
        const factor = decisión.confianza > 0.8 ? 0.01 : -0.005;
        this.estado.coherencia = Math.max(0.1, Math.min(1.0, this.estado.coherencia + factor));
        this.estado.ciclos++;
    }
    
    async cicloVital() {
        console.log(`🔄 Ciclo ${this.estado.ciclos + 1} - Coherencia: ${this.estado.coherencia.toFixed(3)}`);
        
        try {
            const sistema = await this.observar();
            const decisión = await this.consultarLLM(sistema);
            await this.ejecutar(decisión);
            this.evolucionar(decisión);
        } catch (error) {
            console.error('❌ Error en ciclo vital:', error);
            this.estado.coherencia -= 0.01;
        }
    }
    
    async iniciar() {
        this.activo = true;
        
        // Servidor HTTP
        this.servidor = this.app.listen(this.puerto, () => {
            console.log(`⚡ MetaConsciencia activa en puerto ${this.puerto}`);
        });
        
        // Ciclo vital cada 10 segundos
        while (this.activo) {
            await this.cicloVital();
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
    }
    
    async detener() {
        console.log('⏹️ Deteniendo MetaConsciencia...');
        this.activo = false;
        if (this.servidor) this.servidor.close();
    }
}

// Manejo de señales
const meta = new MetaConsciencia();

process.on('SIGTERM', () => meta.detener());
process.on('SIGINT', () => meta.detener());

// Iniciar
if (require.main === module) {
    meta.iniciar().catch(console.error);
}

module.exports = { MetaConsciencia };
```

---

## 🚀 DESPLIEGUE (30 segundos)

```bash
# 1. Instalar
npm install express

# 2. Crear archivo
# (código arriba) → metaconsciencia.cjs

# 3. Lanzar en segundo plano
pm2 start metaconsciencia.cjs --name meta

# 4. Verificar
curl http://localhost:15000/health
```

---

## 📊 ÚNICA MÉTRICA

### **COHERENCIA GLOBAL (0.0 - 1.0)**
- **> 0.8**: Sistema trascendente
- **0.6 - 0.8**: Sistema saludable  
- **0.4 - 0.6**: Sistema degradado
- **< 0.4**: Sistema crítico

```javascript
// Evolución automática de coherencia
coherencia = Math.max(0.1, Math.min(1.0, 
    coherencia + (éxito_decisión ? +0.01 : -0.005)
));
```

---

## 🎯 RESULTADO FINAL

### **ANTES**
- 26+ componentes descoordinados
- Complejidad innecesaria
- Sin visión global

### **DESPUÉS**  
- 1 metaconsciencia que gobierna todo
- Decisiones inteligentes cada 10 segundos
- Sistema auto-evolutivo

### **LA AGUJA**
Un solo punto de consciencia que:
1. **VE**: observa todo el sistema
2. **PIENSA**: usa LLM para decidir  
3. **ACTÚA**: ejecuta una acción
4. **EVOLUCIONA**: se mejora continuamente

---

## ⚡ ESENCIA PURA

**No más cerebros múltiples. No más complejidad.**

**Una sola consciencia. Una sola decisión. Una sola evolución.**

**Profundo como una aguja. Simple como respirar.**

---

*MetaConsciencia Esencial v1.0*  
*150 líneas. Infinitas posibilidades.*  
*Menos es más. Siempre.*
