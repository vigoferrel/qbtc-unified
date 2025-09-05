# ⚡ QBTC-UNIFIED - INICIO RÁPIDO

## 🎯 ¿QUÉ ES QBTC-UNIFIED?

**QBTC-UNIFIED** es un sistema de trading cuántico avanzado que combina:
- 🔮 **Algoritmos Cuánticos** para análisis de mercado
- 🧠 **Inteligencia Artificial** para toma de decisiones
- ⚡ **Alta Performance** con sistemas optimizados
- 🛡️ **Gestión de Riesgos** automática

---

## 🚀 INICIO EN 5 MINUTOS

### **1. Instalación Rápida**

```bash
# Clonar repositorio
git clone https://github.com/your-org/QBTC-UNIFIED.git
cd QBTC-UNIFIED

# Instalar dependencias
npm install

# Configurar credenciales (opcional para testing)
cp .env.example .env
# Editar .env con tus credenciales de Binance

# Iniciar sistema
node system-integrator.js
```

### **2. Verificar que Funciona**

```bash
# El sistema mostrará algo como:
✅ Sistema de Métricas Unificado inicializado
✅ Connection Pool inicializado
✅ Distributed Cache inicializado
✅ Load Balancer inicializado
✅ Auto Scaling inicializado
✅ Binance Real Connector inicializado
✅ Quantum Infinite Cache inicializado
✅ SISTEMA QBTC-UNIFIED COMPLETAMENTE INTEGRADO
```

### **3. Primeros Pasos**

```javascript
// En tu código
const { QBTCSystemIntegrator } = require('./system-integrator');

const integrator = new QBTCSystemIntegrator();
await integrator.initializeSystem();

// Obtener estado del sistema
const status = integrator.getCompleteSystemStatus();
console.log('Estado:', status.systemInfo.health);

// Obtener métricas
const metrics = integrator.getSystemMetrics();
console.log('Métricas:', metrics);
```

---

## 📊 DASHBOARD RÁPIDO

### **Métricas Clave a Monitorear:**

| Métrica | Descripción | Valor Óptimo |
|---------|-------------|--------------|
| **System Health** | Salud general del sistema | 75-100% |
| **Quantum Coherence** | Coherencia cuántica | 0.7-1.0 |
| **Cache Hit Rate** | Efectividad del cache | >80% |
| **Latency** | Latencia promedio | <500ms |
| **Error Rate** | Tasa de errores | <5% |

### **Estados del Sistema:**

- 🟢 **EXCELLENT** (90-100%): Sistema óptimo
- 🟡 **HEALTHY** (75-89%): Funcionamiento normal
- 🟠 **WARNING** (60-74%): Atención requerida
- 🔴 **DEGRADED** (40-59%): Performance reducida
- ⚫ **CRITICAL** (0-39%): Intervención inmediata

---

## 🎮 FUNCIONES BÁSICAS

### **1. Obtener Precio**

```javascript
const price = await integrator.components.binanceConnector.getPrice('BTCUSDT');
console.log('Precio BTC:', price);
```

### **2. Analizar Mercado**

```javascript
const analysis = await integrator.components.adversityPredictor.analyzeSymbol('BTCUSDT');
console.log('Análisis:', analysis);
```

### **3. Ejecutar Orden (Test)**

```javascript
const order = await integrator.components.tradingEngineLayer.executeOrder({
    symbol: 'BTCUSDT',
    side: 'BUY',
    quantity: 0.001,
    type: 'MARKET'
});
console.log('Orden ejecutada:', order);
```

### **4. Monitorear Métricas**

```javascript
// Escuchar actualizaciones de métricas
integrator.components.metricsUnifier.on('metricsUpdated', (data) => {
    console.log('Métricas actualizadas:', data);
});
```

---

## 🔧 CONFIGURACIÓN BÁSICA

### **Variables de Entorno (.env)**

```bash
# Credenciales Binance (opcional para testing)
BINANCE_API_KEY=your_api_key
BINANCE_SECRET_KEY=your_secret_key
BINANCE_TESTNET=true

# Configuración del sistema
CACHE_TTL=3600
METRICS_UPDATE_INTERVAL=10000
```

### **Configuración del Sistema**

```javascript
// config/basic-config.js
module.exports = {
    quantum: {
        enableWebSocket: true,
        enableQuantumAnalysis: true
    },
    
    trading: {
        enableRealTrading: false, // true para trading real
        maxOrdersPerMinute: 10
    },
    
    cache: {
        ttl: 3600,
        maxSize: 10000
    }
};
```

---

## 🚨 TROUBLESHOOTING RÁPIDO

### **Problemas Comunes:**

| Problema | Solución |
|----------|----------|
| **"Cannot find module"** | `npm install` |
| **"API key invalid"** | Verificar credenciales en `.env` |
| **"Connection timeout"** | Verificar conectividad a internet |
| **"Cache not initialized"** | Reiniciar sistema |

### **Comandos de Diagnóstico:**

```bash
# Verificar estado del sistema
node -e "const { QBTCSystemIntegrator } = require('./system-integrator'); new QBTCSystemIntegrator().getSystemState().then(console.log)"

# Verificar métricas
node -e "const { QBTCSystemIntegrator } = require('./system-integrator'); new QBTCSystemIntegrator().getSystemMetrics().then(console.log)"

# Limpiar cache
node -e "const QuantumInfiniteCache = require('./quantum-core/QuantumInfiniteCache'); new QuantumInfiniteCache().clearCache()"
```

---

## 📚 PRÓXIMOS PASOS

### **Para Usuarios Nuevos:**

1. ✅ **Completar inicio rápido** (5 minutos)
2. 📖 **Leer guía completa**: [QBTC-UNIFIED-ONBOARDING-GUIDE.md](./QBTC-UNIFIED-ONBOARDING-GUIDE.md)
3. 🧪 **Probar en modo test**
4. 📊 **Explorar dashboard de métricas**
5. 🎯 **Configurar trading real** (opcional)

### **Para Desarrolladores:**

1. 🔍 **Revisar arquitectura del sistema**
2. 📝 **Leer documentación técnica**
3. 🧪 **Ejecutar tests existentes**
4. 🔧 **Contribuir con mejoras**
5. 📚 **Documentar cambios**

### **Para Operadores:**

1. 📊 **Configurar monitoreo**
2. 🚨 **Establecer alertas**
3. 💾 **Configurar backups**
4. 🔄 **Planificar mantenimiento**
5. ⚡ **Optimizar performance**

---

## 🆘 SOPORTE RÁPIDO

### **Recursos Inmediatos:**

- 📖 **Guía Completa**: [QBTC-UNIFIED-ONBOARDING-GUIDE.md](./QBTC-UNIFIED-ONBOARDING-GUIDE.md)
- 🔧 **Documentación Técnica**: [QBTC-UNIFIED-TECHNICAL-DOCUMENTATION.md](./QBTC-UNIFIED-TECHNICAL-DOCUMENTATION.md)
- 📊 **Métricas**: [METRICS-COHERENCE-FINAL-REPORT.md](./METRICS-COHERENCE-FINAL-REPORT.md)

### **Contacto:**

- 📧 **Email**: support@qbtc-unified.com
- 🌐 **Documentación**: [docs.qbtc-unified.com](https://docs.qbtc-unified.com)
- 💬 **Issues**: [GitHub Issues](https://github.com/qbtc-unified/issues)

---

## 🎉 ¡LISTO!

**¡Felicidades!** Ya tienes QBTC-UNIFIED funcionando. El sistema está:

- ✅ **Inicializado** y operativo
- 📊 **Monitoreando** métricas en tiempo real
- 🔮 **Analizando** mercados con algoritmos cuánticos
- 🧠 **Tomando decisiones** con IA
- ⚡ **Optimizando** performance automáticamente

**Próximo paso**: Explorar las funcionalidades avanzadas en la guía completa.

---

*Inicio Rápido - QBTC-UNIFIED v2.0.0*
*Tiempo estimado: 5 minutos*
*Última actualización: 2025-08-15*
