# 🚀 QUANTUM UNIFIED CORE - APIs DOCUMENTATION

## Market Maker Cuántico sin Límites Determinísticos
**Copyright © 2025 VIGOLEONROCKS QUANTUM TECHNOLOGIES**

---

## 📡 APIs del Sistema Cuántico

### 🧠 Core APIs

#### `GET /quantum/status`
Estado general del sistema cuántico
```json
{
  "consciousness": 0.941,
  "coherence": 0.964, 
  "big_bang_activated": false,
  "zurita_multiplier": 1.0,
  "system_health": 0.95
}
```

#### `POST /quantum/input`
Procesar input cuántico
```json
{
  "message": "Análisis de BTCUSDT",
  "enable_trading": true
}
```

---

## 💰 Market Maker APIs

### 📊 Performance y Métricas

#### `GET /quantum/market-maker/performance`
Reporte de performance del Market Maker
```json
{
  "status": "success",
  "data": {
    "totalArbitrageTrades": 156,
    "totalProfitGenerated": 2847.32,
    "averageLeverageUsed": 67.5,
    "profitPerSecond": 0.0034,
    "quantumSuccessRate": 0.89,
    "maxSimultaneousPositions": 45,
    "lastScanTime": "2025-01-XX"
  }
}
```

#### `GET /quantum/market-maker/top-symbols/[count]`
Top símbolos con mejor performance (default: 50)
```json
{
  "status": "success", 
  "data": [
    {
      "symbol": "BTCUSDT",
      "score": 94.5,
      "leverage": 75.2,
      "profit": 0.045
    }
  ],
  "count": 50
}
```

#### `GET /quantum/market-maker/universe`
Universo completo de símbolos
```json
{
  "status": "success",
  "data": {
    "totalSymbols": 2847,
    "categories": ["majors", "memeCoins", "exotics", "darkSide"],
    "activeArbitrage": 23,
    "quantumCorrelations": 156
  }
}
```

#### `POST /quantum/market-maker/force-scan`
Forzar escaneo de oportunidades de arbitraje
```json
{
  "status": "success",
  "message": "Escaneo de arbitraje cuántico completado"
}
```

---

## 🎯 Profit Maximizer APIs

### 💎 Algoritmo de Profit Máximo

#### `GET /quantum/profit-maximizer/report`
Reporte completo del Profit Maximizer
```json
{
  "status": "success",
  "data": {
    "totalProfitGenerated": 15847.29,
    "profitPerSecond": 0.0089,
    "activeProfitStreams": 47,
    "edgesDetected": 234,
    "arbitragesExecuted": 89,
    "leverageUtilization": 78.5,
    "compoundingMultiplier": 3.21,
    "totalCapitalDeployed": 125000,
    "roiPercentage": 12.67,
    "maxDrawdownQuantum": 2.3,
    "winRate": 0.91,
    "averageWinSize": 0.034,
    "profitConsistency": 0.87,
    "quantumEfficiency": 0.94,
    "profitStreamsDetail": {
      "arbitrage": 15,
      "momentum": 12,
      "volatility": 8,
      "meanReversion": 7,
      "correlation": 5
    }
  }
}
```

#### `GET /quantum/profit-maximizer/top-opportunities/[count]`
Top oportunidades de profit (default: 20)
```json
{
  "status": "success",
  "data": [
    {
      "type": "ARBITRAGE",
      "symbol": "ETHUSDT",
      "profitPotential": 0.067,
      "leverage": 89.4,
      "currentProfit": 234.56,
      "runtime": 45000
    }
  ],
  "count": 20
}
```

---

## ⚡ Leverage Engine APIs

### 🔥 Leverage Cuántico Dinámico

#### `GET /quantum/leverage/stats`
Estadísticas del sistema de leverage
```json
{
  "status": "success",
  "data": {
    "maxLeverageRecommended": 125,
    "averageSystemLeverage": 67.8,
    "activeLeverageOpportunities": 89,
    "leverageUtilization": 0.78,
    "riskDistribution": {
      "EXTREME_EDGE": 12,
      "HIGH_EDGE": 28,
      "MODERATE_EDGE": 35,
      "CONSERVATIVE_EDGE": 20,
      "SAFE_BASE": 5
    }
  }
}
```

#### `GET /quantum/leverage/top-opportunities/[count]`
Top oportunidades de leverage (default: 20)
```json
{
  "status": "success", 
  "data": [
    {
      "symbol": "BTCUSDT",
      "recommendedLeverage": 124.7,
      "confidence": 0.89,
      "profitPotential": 0.089,
      "riskLevel": "EXTREME_EDGE",
      "executionRecommendation": "INSTANT_EXECUTION",
      "confluenceScore": 0.94,
      "quantumEdge": 0.067
    }
  ],
  "count": 20
}
```

---

## 🚨 Control y Emergencia

#### `POST /quantum/emergency-stop`
Parada de emergencia total del sistema
```json
{
  "status": "success",
  "data": {
    "status": "EMERGENCY_STOPPED",
    "timestamp": "2025-01-XX",
    "finalMetrics": {
      "totalProfitGenerated": 15847.29,
      "activeProfitStreams": 0
    }
  },
  "message": "Parada de emergencia ejecutada"
}
```

#### `GET /quantum/real-data-status`
Estado de datos reales de Binance
```json
{
  "status": "success",
  "data": {
    "binanceConnection": "CONNECTED",
    "totalSymbols": 2847,
    "priceDataFreshness": "< 1s",
    "dataCompleteness": 0.98,
    "noMockData": true,
    "realTradingReady": true
  }
}
```

---

## 🎛️ Configuración Avanzada

### Variables de Entorno Requeridas

```bash
# Binance Configuration
BINANCE_API_KEY=tu_api_key_real
BINANCE_SECRET_KEY=tu_secret_key_real
BINANCE_TESTNET=false

# Sistema Cuántico
QUANTUM_PORT=9090
QUANTUM_CONSCIOUSNESS_TARGET=0.941
QUANTUM_COHERENCE_TARGET=0.964
QUANTUM_BIG_BANG_THRESHOLD=0.95

# Trading Configuration
TRADING_MAX_LEVERAGE=125
TRADING_STOP_LOSS=0.02
TRADING_TAKE_PROFIT=0.04
TRADING_MAX_DRAWDOWN=0.05
```

### 🔧 Scripts de Gestión

```bash
# Iniciar sistema completo
npm start

# Desarrollo con auto-reload
npm run dev

# Configurar Binance
npm run setup-binance

# Activar Big Bang Cuántico
npm run big-bang

# Instalar dependencias
npm run install-deps

# Tests del sistema
npm test
```

---

## 📈 Métricas de Rendimiento Esperadas

### Operaciones Diarias Estimadas
- **Arbitrajes Cuánticos**: 150-300/día
- **Trades de Momentum**: 200-400/día  
- **Operaciones de Volatilidad**: 100-250/día
- **Mean Reversion**: 80-150/día
- **Breakouts**: 50-120/día

### Profit Esperado
- **Daily ROI**: 3-8%
- **Leverage Promedio**: 45-75x
- **Win Rate**: 85-95%
- **Profit per Second**: 0.005-0.015
- **Max Drawdown**: < 5%

### Sistema de Gestión de Riesgo
- **Quantum Risk Assessment**: Dinámico en tiempo real
- **Leverage Adjustment**: Automático según confluencia
- **Position Sizing**: Basado en edge cuántico
- **Emergency Stop**: Activación instantánea
- **Liquidity Protection**: Monitoreo continuo

---

## 🌙 Integración Lunar y Cuadrantes

### Fases Lunares
- **Luna Nueva**: Acumulación conservadora
- **Cuarto Creciente**: Momentum alcista
- **Luna Llena**: Máxima irracionalidad (memes/exóticos)
- **Cuarto Menguante**: Corrección y profit taking

### Cuadrantes de Mercado
- **ACCUMULATION_QUADRANT**: Majors con leverage moderado
- **CHAOS_QUADRANT**: Máximo leverage en exóticos
- **VIRAL_BIRTH_QUADRANT**: Detección temprana de memes
- **MAXIMUM_IRRATIONALITY_QUADRANT**: Aprovechamiento extremo

---

## ⚠️ Advertencias Importantes

1. **Trading Real**: Sistema conectado directamente a Binance
2. **No Simulaciones**: Todos los datos son reales, sin `Math.random()`
3. **Leverage Alto**: Puede generar pérdidas significativas
4. **Monitoreo Requerido**: Supervisión humana recomendada
5. **Capital en Riesgo**: Operar solo con capital que puedas permitirte perder

---

## 📊 Metrics Validator APIs

### 🎯 **Validación en Tiempo Real**

#### `GET /quantum/metrics/report`
Reporte completo de métricas en tiempo real
```json
{
  "status": "success",
  "data": {
    "realTimeMetrics": {
      "currentROI": 0.067,
      "currentDrawdown": 0.012,
      "currentSuccessRate": 0.89,
      "currentLatency": 34.5,
      "currentLeverage": 67.8,
      "currentTrades": 234,
      "currentCapitalDeployment": 0.87,
      "currentProfitPerSecond": 0.0078
    },
    "systemStatus": {
      "isOperational": true,
      "emergencyStop": false,
      "criticalAlerts": 0,
      "performanceWarnings": 2
    },
    "lastValidation": {
      "overallScore": 0.92,
      "timestamp": "2025-01-XX"
    }
  }
}
```

#### `GET /quantum/metrics/performance-summary`
Resumen de performance con score general
```json
{
  "status": "success",
  "data": {
    "overallScore": 0.92,
    "status": "EXCELLENT",
    "performance": {
      "currentROI": 0.067,
      "meetsMinROI": true,
      "meetsTargetROI": true,
      "score": 1.0
    },
    "latency": {
      "averageLatency": 34.5,
      "meetsArbitrageLatency": false,
      "score": 0.8
    },
    "leverage": {
      "currentLeverage": 67.8,
      "inTargetRange": true,
      "score": 1.0
    },
    "risk": {
      "currentDrawdown": 0.012,
      "meetsMaxDrawdown": true,
      "score": 1.0
    },
    "criticalAlerts": 0,
    "warnings": 2
  }
}
```

#### `GET /quantum/metrics/critical-alerts`
Alertas críticas del sistema
```json
{
  "status": "success",
  "data": [
    {
      "type": "LEVERAGE_EXCEEDED",
      "value": 130.5,
      "timestamp": "2025-01-XX",
      "severity": "CRITICAL",
      "requiresAction": true
    }
  ],
  "count": 1
}
```

#### `GET /quantum/metrics/warnings`
Advertencias de performance
```json
{
  "status": "success",
  "data": [
    {
      "type": "LATENCY_WARNING",
      "value": 87.3,
      "timestamp": "2025-01-XX",
      "severity": "WARNING",
      "requiresAction": false
    }
  ],
  "count": 1
}
```

#### `POST /quantum/metrics/reset-system`
Reset completo del sistema de métricas
```json
{
  "status": "success",
  "message": "Sistema reseteado exitosamente"
}
```

### 🚨 **Alertas y Límites Críticos**

#### **Hard Limits (Parada Automática)**
- **Max Drawdown**: 5% → Emergency Stop
- **Max Leverage**: 125x → Bloqueo de nuevas posiciones
- **Latencia > 200ms**: Reconexión automática
- **Success Rate < 60%**: Review de estrategias

#### **Performance Targets**
- **Daily ROI Mínimo**: 3%
- **Success Rate Global**: ≥ 85%
- **Latencia Arbitraje**: ≤ 25ms
- **Profit per Second**: ≥ 0.005

#### **Validation Frequency**
- **Métricas en tiempo real**: Cada 5 segundos
- **Alertas críticas**: Inmediatas
- **Performance summary**: Continuo
- **System health check**: Cada 10 segundos

---

## 🔮 Tecnologías Quantum Edge

- **Ingeniería Inversa**: Análisis de patrones de market makers institucionales
- **Edge Cuántico**: Detección de ineficiencias microscópicas
- **Confluencia Multifactorial**: Integración de señales técnicas, lunares y poéticas
- **Leverage Dinámico**: Ajuste automático según condiciones cuánticas
- **Arbitraje Paralelo**: Múltiples streams simultáneos de profit

---

*Sistema desarrollado con visión Leonardo da Vinci para maximización de profit sin límites determinísticos*

**🚀 VIGOLEONROCKS QUANTUM TECHNOLOGIES © 2025**
