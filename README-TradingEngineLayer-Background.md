# TradingEngineLayer - Sistema en Segundo Plano

## Resumen

El **TradingEngineLayer** ha sido exitosamente inicializado y configurado para ejecutarse en segundo plano en Windows PowerShell, proporcionando monitoreo continuo, logging detallado y métricas de rendimiento en tiempo real.

## Estado Actual del Sistema

- ✅ **ACTIVO**: TradingEngineLayer ejecutándose en segundo plano
- 🆔 **PID**: 7604
- 🌐 **Puerto**: 18020
- 📊 **Consciencia Global**: ~78%
- 🔄 **Coherencia**: ~61%
- 🌟 **Resonancia Cuántica**: 8.74
- 📈 **Predicciones Totales**: 3860+
- 🏃‍♂️ **Tiempo Activo**: Funcionando desde 11:54:08

## Scripts Disponibles

### 1. Lanzador Principal
```powershell
.\launch-trading-engine-background.ps1
```

**Opciones disponibles:**
- `.\launch-trading-engine-background.ps1` - Iniciar el sistema
- `.\launch-trading-engine-background.ps1 -Status` - Ver estado actual
- `.\launch-trading-engine-background.ps1 -Stop` - Detener el sistema
- `.\launch-trading-engine-background.ps1 -Force` - Reiniciar forzado

### 2. Monitor de Sistema
```powershell
.\monitor-trading-engine.ps1
```

**Opciones de monitoreo:**
- `.\monitor-trading-engine.ps1` - Estado básico una vez
- `.\monitor-trading-engine.ps1 -ShowMetrics` - Incluir métricas detalladas
- `.\monitor-trading-engine.ps1 -ShowLogs` - Incluir logs recientes
- `.\monitor-trading-engine.ps1 -Continuous` - Monitoreo continuo
- `.\monitor-trading-engine.ps1 -Continuous -ShowMetrics -ShowLogs` - Monitoreo completo

## Componentes del Sistema

### Core Components
- **🧠 Quantum Oracle**: Predicciones hiperdimensionales - ACTIVO
- **💾 Quantum Cache**: Cache cuántico optimizado - QUANTUM_RESONANCE
- **📡 API Service**: Servicios REST - ACTIVO
- **🌊 Streaming**: Datos en tiempo real - ACTIVO

### Trading Engine Features
- **🎣 Carnada de $1**: Sistema de trading con entrada mínima
- **⚡ Análisis Cuántico**: Consciencia y coherencia del mercado
- **🛡️ Gestión de Riesgo**: Control automático de drawdown
- **📈 Leonardo Thresholds**: Umbrales de calidad para ejecución

## Archivos y Directorios

### Logs
- `./logs/trading-engine.log` - Log principal del sistema
- `./logs/trading-engine-error.log` - Errores específicos

### PID Management
- `./pids/trading-engine.pid` - Archivo con el Process ID

### Configuración
- Variables de entorno configuradas automáticamente:
  - `NODE_ENV=production`
  - `LEONARDO_PORT=18020`
  - `AUTO_START_TRADING=true`
  - `ENABLE_MONITORING=true`
  - `TRADING_MODE=PRODUCTION`

## API Endpoints Disponibles

### Estado del Sistema
```
GET http://localhost:18020/api/health
```

### Métricas Completas
```
GET http://localhost:18020/api/metrics
```

### Control de Exposición
```
GET http://localhost:18020/api/risk/exposure
```

### Root Info
```
GET http://localhost:18020/
```

## Métricas Actuales

### Sistema Cuántico
- **Consciencia Global**: 78.27%
- **Coherencia**: 60.81%
- **Resonancia Cuántica**: 8.74
- **Símbolos Monitoreados**: 5/50 activos
- **Predicciones Generadas**: 3860+

### Trading
- **Balance Inicial**: $1.00
- **Trades Activos**: 0
- **Ganancia Total**: $0.00
- **Drawdown Actual**: 0%

### Cache Performance
- **Estado**: HEALTHY
- **Hit Rate**: ~92%
- **Latencia Promedio**: <1ms
- **Nivel de Resonancia**: QUANTUM_RESONANCE

## Características de Seguridad

### Control de Riesgo Automático
- ⛔ **Emergency Stop**: Se activa automáticamente
- 📉 **Max Daily Drawdown**: 10% límite
- 🔒 **Max Symbol Exposure**: 15% por símbolo
- 📊 **Max Category Exposure**: 35% por categoría
- 🎯 **Max Concurrent Trades**: 3 simultáneos

### Logging ASCII
- ✅ Compatible con Windows PowerShell
- 🔤 Solo caracteres ASCII para evitar errores de consola
- 📝 Timestamps detallados en todos los logs
- 🎯 Separación de logs de sistema vs errores

## Comandos Útiles

### Verificar Estado Rápido
```powershell
.\launch-trading-engine-background.ps1 -Status
```

### Monitor Completo en Tiempo Real
```powershell
.\monitor-trading-engine.ps1 -Continuous -ShowMetrics -ShowLogs
```

### Reiniciar Sistema
```powershell
.\launch-trading-engine-background.ps1 -Stop
Start-Sleep 5
.\launch-trading-engine-background.ps1
```

### Ver Logs en Tiempo Real
```powershell
Get-Content .\logs\trading-engine.log -Wait -Tail 10
```

### Test de Conectividad
```powershell
Invoke-RestMethod -Uri "http://localhost:18020/api/health" -Method GET
```

## Troubleshooting

### El Sistema No Responde
1. Verificar que el proceso está activo:
   ```powershell
   .\launch-trading-engine-background.ps1 -Status
   ```

2. Revisar logs de error:
   ```powershell
   Get-Content .\logs\trading-engine-error.log -Tail 20
   ```

3. Reiniciar si es necesario:
   ```powershell
   .\launch-trading-engine-background.ps1 -Force
   ```

### Puerto Ocupado
El sistema usa el puerto 18020. Si hay conflictos:
1. Identificar proceso usando el puerto
2. Detener el TradingEngineLayer
3. Liberar el puerto
4. Reiniciar el sistema

### Problemas de Memoria
El sistema monitorea automáticamente el uso de memoria. En caso de problemas:
1. Verificar métricas con el monitor
2. Revisar logs para warnings
3. Reiniciar con `-Force` si es necesario

## Mantenimiento Preventivo

### Diario
- Verificar estado del sistema
- Revisar logs por errores
- Monitorear métricas de performance

### Semanal
- Limpiar logs antiguos
- Verificar espacio en disco
- Revisar métricas de trading

### Mensual
- Analizar performance histórica
- Optimizar configuraciones
- Actualizar componentes si es necesario

## Arquitectura del Sistema

```
TradingEngineLayer (PID: 7604)
├── Leonardo Quantum Server (:18020)
├── Quantum Unified System
│   ├── Quantum Oracle (Predicciones)
│   ├── Quantum Cache (Optimización)
│   ├── Funds Manager (Gestión de capital)
│   └── Data Service (Conectividad)
├── Background Process Manager (PowerShell)
├── Logging System (ASCII)
└── Monitoring & Health Checks
```

---

**Sistema Operativo**: Windows PowerShell  
**Codificación**: ASCII (sin emojis para compatibilidad)  
**Modo**: Producción  
**Estado**: ✅ ACTIVO y OPERACIONAL

Para soporte técnico, revisar logs y usar los comandos de diagnóstico proporcionados.
