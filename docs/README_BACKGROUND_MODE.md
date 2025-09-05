# 🌌 SISTEMA NxN EN SEGUNDO PLANO

## Lanzamiento Automático con Monitoreo Continuo
**Validación + Activación + Monitoreo Automático**

---

## 🚀 LANZAMIENTO EN SEGUNDO PLANO

### **Comando Principal (Todo Automático)**
```bash
cd quantum-core
npm run launch-background
```

**Este comando ejecuta automáticamente:**
1. ✅ Validación completa de Binance
2. 🧠 Inicialización de Quantum Core
3. 🌌 Activación del sistema NxN
4. 📊 Monitoreo continuo cada 30 segundos
5. 📝 Logging automático a `logs/nxn-background.log`

---

## 📊 COMANDOS DE CONTROL

### **Ver Estado del Sistema**
```bash
npm run status-nxn
```
**Output esperado:**
```
📊 ESTADO DEL SISTEMA NxN
🌌 ESTADO NxN:
   Sistema: ACTIVE
   NxN Activo: SÍ
   Espacios infinitos: 47
   Multiplicador máximo: 234.67x
   Ciclos completados: 15

📊 MÉTRICAS:
   Score general: 0.938
   Estado: EXCELLENT
   ROI actual: 6.78%
   Leverage promedio: 67.8x
   Drawdown: 1.2%
```

### **Ver Logs en Tiempo Real**
```powershell
# PowerShell (recomendado en Windows)
Get-Content .\logs\nxn-background.log -Wait -Tail 100

# O vía script npm existente
npm run logs-nxn
```
**Muestra:**
```
[2025-01-XX] [MONITOR] Sistema activo: ACTIVE
[2025-01-XX] [MONITOR] Espacios infinitos: 47
[2025-01-XX] [MONITOR] Multiplicador máximo: 234.67x
[2025-01-XX] [ALERT] 🔥 MULTIPLICADOR EXTREMO: 567.89x
[2025-01-XX] [METRICS] Score general: 0.938
[2025-01-XX] [METRICS] ROI actual: 6.78%
```

### **Ver Métricas Detalladas**
```bash
npm run metrics-nxn
```

### **Detener Sistema**
```bash
npm run stop-nxn
```

---

## 🔄 FUNCIONAMIENTO AUTOMÁTICO

### **Validación Automática Inicial**
El sistema verifica automáticamente:
- ✅ Conexión a Binance
- ✅ Credenciales API válidas
- ✅ Balances suficientes
- ✅ Cálculo de allocation seguro
- ✅ Permisos de trading

### **Activación Automática**
Si la validación es exitosa:
- 🧠 Lanza Quantum Core en proceso separado
- 🌌 Activa sistema NxN vía API
- 📊 Inicia monitoreo continuo
- 📝 Comienza logging automático

### **Monitoreo Continuo**
Cada 30 segundos verifica:
- 🌌 Estado del sistema NxN
- 📊 Número de espacios infinitos detectados
- ⚡ Multiplicadores actuales
- 🚨 Alertas críticas

Cada 60 segundos registra:
- 📈 Score general del sistema
- 💰 ROI actual
- ⚡ Leverage promedio
- 📉 Drawdown actual

---

## 📝 SISTEMA DE LOGS

### **Archivo de Logs**
```
quantum-core/logs/nxn-background.log
```

### **Tipos de Logs**
```
[VALIDATION] - Proceso de validación Binance
[CORE] - Quantum Core events
[NxN] - Sistema NxN events
[MONITOR] - Monitoreo periódico
[METRICS] - Métricas del sistema
[ALERT] - Alertas críticas
[ERROR] - Errores del sistema
```

### **Alertas Automáticas**
- 🔥 **MULTIPLICADOR EXTREMO**: >1000x
- 🌌 **MUCHOS ESPACIOS INFINITOS**: >100
- 🚨 **DRAWDOWN ALTO**: >5%
- ⚡ **LEVERAGE EXTREMO**: >100x

---

## 🎮 WORKFLOW COMPLETO

### **1. Lanzamiento Inicial**
```bash
# Todo en un comando
npm run launch-background
```

### **2. Monitoreo Durante Operación**
```bash
# En terminal separada - logs en tiempo real
npm run logs-nxn

# En otra terminal - estado periódico (PowerShell)
while ($true) { npm run status-nxn; Start-Sleep -Seconds 60 }
```

### **3. Verificación de Métricas**
```bash
# Métricas cada 5 minutos (PowerShell)
while ($true) { npm run metrics-nxn; Start-Sleep -Seconds 300 }
```

### **4. Parada Controlada**
```bash
# Emergency stop + cleanup
npm run stop-nxn
```

---

## ⚠️ CONSIDERACIONES IMPORTANTES

### **Recursos del Sistema**
- **CPU**: Proceso continuo en background
- **RAM**: Matrices NxN consumen memoria creciente
- **Disk**: Logs crecen continuamente
- **Network**: Monitoreo API cada 30s

### **Archivos Generados**
```
logs/nxn-background.log    # Logs del sistema
nxn.pid                    # PID del proceso principal
```

### **Detección de Procesos**
- El sistema verifica si ya está corriendo
- Previene lanzamientos duplicados
- Usa PID para control de procesos

### **Recuperación de Errores**
- Continúa monitoreo aunque falle activación
- Logs de errores para debugging
- Cleanup automático al terminar

---

## 🚨 TROUBLESHOOTING

### **"Sistema NxN ya está corriendo"**
```bash
# Verificar estado
npm run status-nxn

# Si no responde, forzar parada
npm run stop-nxn

# Relanzar
npm run launch-background
```

### **"Validación Binance falló"**
```bash
# Verificar configuración
npm run validate-binance

# Revisar .env
cat .env

# Verificar conectividad
npm run quick-test
```

### **"No se puede conectar al sistema cuántico"**
```bash
# Verificar que el puerto 9090 esté libre
netstat -an | findstr 9090

# Verificar logs (PowerShell)
Get-Content .\logs\nxn-background.log -Wait -Tail 100

# Reiniciar sistema
npm run stop-nxn
npm run launch-background
```

### **Logs no aparecen**
```bash
# Verificar directorio logs (PowerShell)
Get-ChildItem .\logs

# Crear directorio si no existe
New-Item -ItemType Directory -Path .\logs -Force | Out-Null

# Verificar permisos de escritura
'test' | Set-Content .\logs\test.txt
```

---

## 🎯 VENTAJAS DEL MODO BACKGROUND

### **Operación Continua**
- ✅ Funciona 24/7 sin intervención
- ✅ Monitoreo automático
- ✅ Logging completo
- ✅ Alertas automáticas

### **Control Completo**
- 📊 Estado en tiempo real
- 📝 Historial completo en logs
- 🛑 Parada controlada
- 🔄 Recuperación automática

### **Optimización de Recursos**
- 🧠 Core independiente
- 📊 Monitoreo eficiente
- 📝 Logs rotativos (futuro)
- 🔧 Cleanup automático

---

## 🚀 COMANDOS RÁPIDOS

```bash
# FLUJO COMPLETO
npm run launch-background  # Lanzar todo
npm run logs-nxn          # Ver logs
npm run status-nxn        # Ver estado
npm run stop-nxn          # Detener

# MONITOREO AVANZADO
watch -n 30 "npm run status-nxn"    # Estado cada 30s
watch -n 60 "npm run metrics-nxn"   # Métricas cada 60s
```

---

**🌌 "El sistema NxN en background permite operación continua sin supervisión manual, con monitoreo automático y logging completo."**

**🚀 VIGOLEONROCKS QUANTUM TECHNOLOGIES © 2025**
