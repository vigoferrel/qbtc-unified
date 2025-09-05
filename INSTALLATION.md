# 🔧 **Guía de Instalación - QBTC-UNIFIED Trading System**

## 📋 **Prerrequisitos del Sistema**

### **⚙️ Requisitos Técnicos Mínimos**
- **Node.js**: v18.0.0 o superior
- **npm**: v8.0.0 o superior
- **Git**: v2.25.0 o superior
- **RAM**: 8GB mínimo (16GB recomendado para trading en vivo)
- **CPU**: 4 cores mínimo (8 cores recomendado)
- **Almacenamiento**: 5GB libres
- **Red**: Conexión estable (baja latencia para trading)

### **🌐 Sistemas Operativos Soportados**
- **Windows**: 10/11 (probado)
- **macOS**: 10.15+ 
- **Linux**: Ubuntu 20.04+, Debian 11+, CentOS 8+

### **📊 Cuentas de Trading (Opcional)**
- **Binance**: Cuenta con API habilitado (recomendado usar Testnet primero)
- **Capital**: Mínimo $1,000 USD para trading en vivo

---

## 🚀 **Instalación Rápida**

### **1. Clonar el Repositorio**
```bash
# Opción 1: HTTPS
git clone https://github.com/vigoferrel/qbtc-unified.git

# Opción 2: SSH (recomendado para contribuidores)
git clone git@github.com:vigoferrel/qbtc-unified.git

cd qbtc-unified
```

### **2. Verificar Versiones del Sistema**
```bash
# Verificar Node.js (debe ser v18+)
node --version

# Verificar npm (debe ser v8+)
npm --version

# Verificar Git (debe ser v2.25+)
git --version
```

### **3. Instalación de Dependencias**
```bash
# Instalar dependencias del sistema
npm install

# Verificar instalación exitosa
npm run health-check --if-present
```

**Tiempo estimado**: 2-3 minutos

---

## ⚙️ **Configuración del Sistema**

### **🔐 Variables de Entorno**
```bash
# Crear archivo de configuración
cp .env.example .env

# Editar con tu editor preferido
nano .env  # o notepad .env en Windows
```

### **📋 Configuración de .env Básica**
```bash
# ======================
# CONFIGURACIÓN GENERAL
# ======================
NODE_ENV=development
LOG_LEVEL=info

# ======================
# BINANCE API (TESTNET PRIMERO)
# ======================
BINANCE_API_KEY=tu_testnet_api_key_aqui
BINANCE_SECRET_KEY=tu_testnet_secret_key_aqui
BINANCE_TESTNET=true  # SIEMPRE usar testnet primero

# ======================
# CONFIGURACIÓN DE PORTFOLIO
# ======================
PORTFOLIO_INITIAL_CAPITAL=100000  # $100k por defecto
MAX_PORTFOLIO_VAR=0.02            # Máximo 2% VaR
MAX_POSITION_SIZE=20000           # $20k máximo por posición
MIN_POSITION_SIZE=100             # $100 mínimo por posición

# ======================
# LEONARDO IA CONFIGURATION
# ======================
CONSCIOUSNESS_TARGET=0.941        # 94.1% target
COHERENCE_TARGET=0.964           # 96.4% target
BIG_BANG_THRESHOLD=0.95          # 95% threshold

# ======================
# PUERTOS DE MICROSERVICIOS
# ======================
LEONARDO_SERVER_PORT=8090
PORTFOLIO_MANAGER_PORT=14801
GUARDIAN_SYSTEM_PORT=14601
METRICS_SERVER_PORT=14701

# ======================
# QUANTUM CACHE CONFIG
# ======================
QUANTUM_CACHE_MAX_SYMBOLS=1979
QUANTUM_PARALLEL_FETCHES=144
QUANTUM_BATCH_SIZE=88
QUANTUM_CACHE_TTL=300000  # 5 minutos

# ======================
# SEGURIDAD
# ======================
USE_SECURE_RANDOM=true
ENABLE_TRADE_VALIDATION=true
ENABLE_AUDIT_LOGS=true
```

---

## 🏗️ **Arquitectura del Sistema**

### **📊 Microservicios y Puertos**

| **Servicio** | **Puerto** | **Archivo Principal** | **Estado** |
|--------------|------------|----------------------|------------|
| **Leonardo IA Server** | 8090 | `leonardo-server.js` | Core |
| **Portfolio Manager** | 14801 | `portfolio-manager.js` | Core |
| **Guardian System** | 14601 | `guardian-system.js` | Seguridad |
| **Metrics Server** | 14701 | `metrics-server.js` | Monitor |

### **🔧 Configuración Avanzada por Servicio**

#### **Leonardo IA Server (Puerto 8090)**
```bash
# Variables específicas para Leonardo
LEONARDO_AI_MODEL=gpt-4-0125-preview  # Modelo de IA
LEONARDO_DECISION_TIMEOUT=5000        # 5 segundos max
LEONARDO_LEARNING_MODE=enabled        # Aprendizaje activo
LEONARDO_RISK_TOLERANCE=medium        # Conservative/Medium/Aggressive
```

#### **Portfolio Manager (Puerto 14801)**
```bash
# Configuración de gestión de cartera
REBALANCE_INTERVAL=120000             # 2 minutos
RISK_CHECK_INTERVAL=30000             # 30 segundos
CORRELATION_UPDATE_INTERVAL=600000     # 10 minutos
KELLY_FRACTION_LIMIT=0.25             # Máximo 25% Kelly
```

#### **Guardian System (Puerto 14601)**
```bash
# Configuración de protección
GUARDIAN_ENABLED=true
MAX_DRAWDOWN_THRESHOLD=0.15           # 15% máximo drawdown
CIRCUIT_BREAKER_ENABLED=true
EMERGENCY_LIQUIDATION_THRESHOLD=0.25 # 25% pérdida = liquidación
```

---

## 🧪 **Testing del Sistema**

### **✅ Verificación de Instalación**
```bash
# Test básico de sistema
npm run system-test --if-present

# Verificar configuración
node scripts/validate-config.cjs

# Test de conexión (sin API keys reales)
node scripts/test-connections.cjs
```

### **📊 Tests de Componentes Core**
```bash
# Test Portfolio Manager
npm run test:portfolio --if-present

# Test Leonardo IA
npm run test:leonardo --if-present

# Test Quantum Cache
npm run test:quantum --if-present

# Test completo del sistema
npm run test:integration --if-present
```

---

## 🚀 **Primer Arranque**

### **🎯 Modo Desarrollo (Recomendado)**
```bash
# Iniciar todos los servicios en desarrollo
npm run dev

# O iniciar servicios individualmente:
npm run start:leonardo     # Puerto 8090
npm run start:portfolio    # Puerto 14801
npm run start:guardian     # Puerto 14601
npm run start:metrics      # Puerto 14701
```

### **📊 Verificar que Todo Funciona**
```bash
# Verificar puertos abiertos
netstat -tulpn | grep ":8090"     # Leonardo
netstat -tulpn | grep ":14801"    # Portfolio
netstat -tulpn | grep ":14601"    # Guardian
netstat -tulpn | grep ":14701"    # Metrics

# Health check de servicios
curl http://localhost:8090/health
curl http://localhost:14801/health
curl http://localhost:14601/health
curl http://localhost:14701/health
```

---

## 🔐 **Configuración de Seguridad**

### **🛡️ Binance API Setup (TESTNET PRIMERO)**

#### **1. Crear cuenta en Binance Testnet**
```bash
# 1. Ir a https://testnet.binance.vision/
# 2. Crear cuenta de prueba
# 3. Generar API Key y Secret
# 4. NUNCA usar claves de producción en desarrollo
```

#### **2. Configurar API Keys de Manera Segura**
```bash
# Usar variables de entorno del sistema (recomendado)
export BINANCE_API_KEY="tu_testnet_key_aqui"
export BINANCE_SECRET_KEY="tu_testnet_secret_aqui"

# O usar archivo .env (solo para desarrollo)
echo "BINANCE_API_KEY=tu_testnet_key" >> .env
echo "BINANCE_SECRET_KEY=tu_testnet_secret" >> .env
```

#### **3. Verificar Configuración de API**
```bash
# Test de conexión a Binance Testnet
node scripts/test-binance-connection.cjs

# Debe retornar: "✅ Conexión a Binance Testnet exitosa"
```

### **🔒 SecureRandom Implementation**
El sistema usa entropía criptográfica del kernel:
```javascript
// Verificar que SecureRandom funciona
node -e "
const SecureRandom = require('./lib/qbtc-runtime.cjs').SecureRandom;
console.log('Random:', SecureRandom.random());
console.log('UUID:', SecureRandom.uuid());
"
```

---

## 📊 **Configuración de Monitoreo**

### **📈 Métricas en Tiempo Real**
```bash
# Habilitar métricas detalladas
echo "ENABLE_DETAILED_METRICS=true" >> .env

# Configurar intervalos de métricas
echo "METRICS_COLLECTION_INTERVAL=10000" >> .env  # 10 segundos
echo "HEALTH_CHECK_INTERVAL=300000" >> .env       # 5 minutos
```

### **📊 Dashboard de Métricas**
```bash
# Acceder al dashboard (si está implementado)
open http://localhost:14701/dashboard

# Ver métricas en formato JSON
curl http://localhost:14701/metrics
```

---

## 🔧 **Configuración por Entorno**

### **🧪 Desarrollo Local**
```bash
# .env.development
NODE_ENV=development
BINANCE_TESTNET=true
LOG_LEVEL=debug
ENABLE_AUDIT_LOGS=true
PORTFOLIO_INITIAL_CAPITAL=10000  # Capital pequeño para pruebas
```

### **🚢 Staging (Pre-producción)**
```bash
# .env.staging  
NODE_ENV=staging
BINANCE_TESTNET=true  # Aún usar testnet
LOG_LEVEL=info
PORTFOLIO_INITIAL_CAPITAL=50000
MAX_PORTFOLIO_VAR=0.015  # Más conservador
```

### **🌟 Producción (¡CUIDADO!)**
```bash
# .env.production
NODE_ENV=production
BINANCE_TESTNET=false  # ¡API REAL! Usar con extremo cuidado
LOG_LEVEL=warn
PORTFOLIO_INITIAL_CAPITAL=100000  # Capital real
MAX_PORTFOLIO_VAR=0.01  # Muy conservador
ENABLE_CIRCUIT_BREAKER=true
```

---

## 🐛 **Troubleshooting**

### **❌ Problemas Comunes**

#### **1. Error: Puerto ya en uso**
```bash
# Error: Port 8090 is already in use
# Solución: Cambiar puerto o matar proceso
lsof -ti:8090 | xargs kill -9  # Linux/Mac
netstat -ano | findstr :8090   # Windows - encontrar PID y matar
```

#### **2. Error: Binance API inválida**
```bash
# Error: Invalid API key
# Verificar:
echo $BINANCE_API_KEY  # Debe tener valor
echo $BINANCE_TESTNET  # Debe ser 'true' para desarrollo

# Test manual
node -e "console.log(process.env.BINANCE_API_KEY?.length || 'NO API KEY')"
```

#### **3. Error: Memoria insuficiente**
```bash
# Error: JavaScript heap out of memory
# Solución: Aumentar memoria Node.js
export NODE_OPTIONS="--max-old-space-size=4096"
npm run dev
```

#### **4. Error: Conexión de red**
```bash
# Error: Network timeout
# Verificar conectividad
ping api.binance.com
ping testnet.binance.vision

# Verificar firewall
telnet testnet.binance.vision 443
```

### **🔍 Logs de Debug**
```bash
# Habilitar logs detallados
DEBUG=qbtc:* npm run dev

# Ver logs de componentes específicos
DEBUG=qbtc:portfolio npm run start:portfolio
DEBUG=qbtc:leonardo npm run start:leonardo
DEBUG=qbtc:guardian npm run start:guardian
```

### **📊 Verificación de Estado**
```bash
# Script completo de verificación de sistema
node scripts/full-system-check.cjs

# Debe reportar:
# ✅ Node.js version: v18+
# ✅ Dependencies installed
# ✅ Configuration valid
# ✅ Ports available
# ✅ Binance connection (testnet)
# ✅ All services healthy
```

---

## 📈 **Performance y Optimización**

### **⚡ Configuración de Performance**
```bash
# Optimizaciones para trading
echo "QUANTUM_CACHE_PRELOAD=true" >> .env
echo "ENABLE_CONNECTION_POOLING=true" >> .env
echo "BINANCE_REQUEST_TIMEOUT=3000" >> .env
```

### **📊 Monitoreo de Recursos**
```bash
# Instalar herramientas de monitoreo (opcional)
npm install -g pm2 clinic htop

# Monitorear uso de recursos
pm2 monit  # Si usas PM2
clinic doctor -- node leonardo-server.js  # Profiling
```

---

## 🚢 **Deployment en Producción**

### **⚠️ ADVERTENCIA CRÍTICA**
**🚨 NUNCA ejecutar en producción sin:**
1. **Extensivo testing** en testnet
2. **Capital que puedes permitirte perder**
3. **Monitoreo 24/7**
4. **Circuit breakers** activados
5. **Backups** de configuración

### **🏭 Configuración de Producción**
```bash
# Usar PM2 para gestión de procesos
npm install -g pm2

# Configurar ecosystem
cp ecosystem.example.config.cjs ecosystem.config.cjs
# Editar con configuración de producción

# Iniciar en producción
pm2 start ecosystem.config.cjs --env production
pm2 save  # Guardar configuración
pm2 startup  # Auto-start en boot
```

---

## 📞 **Soporte**

### **🆘 Canales de Ayuda**
- **Bugs Críticos**: [GitHub Issues](https://github.com/vigoferrel/qbtc-unified/issues)
- **Preguntas**: [GitHub Discussions](https://github.com/vigoferrel/qbtc-unified/discussions)
- **Email**: support@qbtc-unified.com
- **Documentación**: [Wiki del proyecto](https://github.com/vigoferrel/qbtc-unified/wiki)

### **📊 Información para Reportar Problemas**
```bash
# Recopilar información del sistema
npm run collect-debug-info --if-present

# Incluir siempre:
# 1. Output del script anterior
# 2. Logs de error completos
# 3. Configuración (sin API keys)
# 4. Pasos para reproducir
# 5. Comportamiento esperado vs actual
```

---

## 🎓 **Próximos Pasos**

### **📚 Después de la Instalación**
1. **Leer la documentación técnica**: `TECHNICAL_ANALYSIS.md`
2. **Entender los algoritmos**: Portfolio Theory + Leonardo IA
3. **Configurar monitoreo**: Métricas y alertas
4. **Empezar con testnet**: ¡NUNCA con dinero real inicialmente!
5. **Unirse a la comunidad**: GitHub Discussions

### **🎯 Roadmap de Aprendizaje**
```
Semana 1: Setup + Testnet + Documentación
Semana 2: Entender Portfolio Manager + Kelly Criterion
Semana 3: Leonardo IA + Quantum Systems
Semana 4: Guardian + Risk Management
Mes 2: Backtesting + Optimización
Mes 3: Paper trading + Monitoreo
Mes 6: Considerar capital real (solo si profitable)
```

---

**⚡ ¡Sistema QBTC-UNIFIED instalado exitosamente! Ahora a conquistar los mercados cuánticamente! 📊🚀**

---

*Guía actualizada: Septiembre 2025*  
*Sistema: QBTC-UNIFIED v2.0*  
*Autor: @vigoferrel*
