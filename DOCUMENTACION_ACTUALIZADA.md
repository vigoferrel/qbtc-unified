# 🚀 DOCUMENTACIÓN SISTEMA QBTC UNIFICADO
## *"La Unificación Cuántica del Trading para Máxima Rentabilidad"*

---

## 📋 GUÍA DE INICIO RÁPIDO

### Requisitos Previos
1. **Node.js (v14+)**
2. **Cuenta de Binance con API Keys**
3. **Conexión a Internet estable**

### Instalación Rápida
```bash
# Clonar repositorio (si aplica)
git clone https://github.com/tu-usuario/qbtc-unified.git
cd qbtc-unified

# Instalar todas las dependencias
npm run setup-all

# Configurar credenciales
cp quantum-core/env-example.txt quantum-core/.env
# Editar .env con tus credenciales de Binance
```

### Lanzamiento Rápido
```bash
# Modo Universal (Todos los Símbolos)
./launch-quantum-universal.bat

# Modo Clásico (Símbolos Seleccionados)
./launch-qbtc-unified.bat
```

---

## 🏗️ ARQUITECTURA DEL SISTEMA

### Componentes Principales

1. **Núcleo Cuántico** (`quantum-core/`)
   - Motor principal del sistema
   - Procesamiento matemático cuántico
   - Integración con Binance

2. **Coordinador** (`coordinator/`)
   - Orquestación de componentes
   - Gestión de comunicaciones
   - Manejo de eventos

3. **Frontend** (`frontend/` y `frontend-simplificado/`)
   - Interfaz de usuario
   - Visualización de datos
   - Control del sistema

4. **Monitoreo** (`monitoring/`)
   - Métricas en tiempo real
   - Alertas y notificaciones
   - Logs del sistema

### Diagrama de Arquitectura

```
                 🌌 SISTEMA QBTC UNIFICADO 🌌
                           |
                    ┌──────┴──────┐
                    │             │
              🧠 QUANTUM CORE  ⚛️ COORDINATOR
                    │             │
              ┌─────┴─────┐   ┌───┴───┐
              │           │   │       │
         📊 TRADING   🔬 ANÁLISIS  📱 FRONTEND
              │           │          │
         ┌────┴────┐      │          │
         │         │      │          │
    💰 BINANCE     └──────┴──────────┘
```

---

## 🔧 CONFIGURACIÓN DETALLADA

### Variables de Entorno (`quantum-core/.env`)

```ini
# API de Binance
BINANCE_API_KEY=tu_api_key
BINANCE_SECRET_KEY=tu_secret_key
BINANCE_TESTNET=false  # true para modo de prueba, false para trading real

# Configuración del Sistema
DEBUG=false
LOG_LEVEL=info
MAX_SYMBOLS=0  # 0 = todos los símbolos disponibles
BATCH_SIZE=200

# Configuración Cuántica
CONSCIOUSNESS_TARGET=0.941
COHERENCE_TARGET=0.964
BIG_BANG_THRESHOLD=0.95
```

### Configuración del Sistema (`config/config.json`)

```json
{
  "system": {
    "port": 8080,
    "apiPort": 9090,
    "websocketPort": 9091,
    "logDirectory": "./logs"
  },
  "quantum": {
    "initialConsciousness": 0.37,
    "consciousnessTarget": 0.941,
    "coherenceTarget": 0.964,
    "evolutionRate": 0.001
  },
  "trading": {
    "maxSymbols": 0,
    "batchSize": 200,
    "defaultLeverage": 5,
    "maxLeverage": 20,
    "defaultMarginType": "ISOLATED"
  }
}
```

---

## 🚀 GUÍA DE DESPLIEGUE

### Modo Universal (Todos los Símbolos)

1. **Configuración**
   - Asegurarse que `MAX_SYMBOLS=0` en el archivo `.env`
   - Verificar suficiente RAM (mínimo 8GB)

2. **Lanzamiento**
   ```bash
   ./launch-quantum-universal.bat
   ```

3. **Monitoreo**
   - Dashboard: http://localhost:8080
   - Métricas: http://localhost:9093

### Modo Clásico (Símbolos Seleccionados)

1. **Configuración**
   - Editar `quantum-core/symbols.json` para personalizar los símbolos
   - Establecer `MAX_SYMBOLS=n` en `.env` (donde n = número deseado)

2. **Lanzamiento**
   ```bash
   ./launch-qbtc-unified.bat
   ```

3. **Monitoreo**
   - Igual que en modo universal

---

## 🔍 MONITOREO Y MANTENIMIENTO

### Logs del Sistema
```bash
# Ver logs del sistema en tiempo real
cd quantum-core
npm run logs-realtime

# Ver logs específicos de NxN Matrix
npm run logs-nxn
```

### Endpoints de Monitoreo
- **Estado General**: http://localhost:9090/quantum/status
- **Métricas**: http://localhost:9093
- **Dashboard**: http://localhost:8080

### Comandos de Emergencia
```bash
# Detención de emergencia del sistema
cd quantum-core
npm run emergency-stop

# Reset de la consciencia cuántica
curl -X POST http://localhost:9090/quantum/reset-consciousness
```

---

## 📊 ANÁLISIS DE RENDIMIENTO

### Métricas de Rendimiento
- **Rentabilidad**: Panel en http://localhost:8080/performance
- **Consciencia Cuántica**: Panel en http://localhost:9093/consciousness
- **Operaciones**: Historial en http://localhost:8080/operations

### Exportación de Datos
```bash
# Exportar histórico de operaciones a CSV
curl -X GET http://localhost:9090/api/export/operations > operations.csv

# Exportar métricas de rendimiento
curl -X GET http://localhost:9090/api/export/metrics > metrics.json
```

---

## 🛠️ RESOLUCIÓN DE PROBLEMAS

### Problemas Comunes

#### 1. Fallo de Conexión con Binance
```
[ERROR] No se pudo establecer conexión con Binance
```
**Solución**: Verificar API Keys y permisos. Asegurarse que tienen habilitados los permisos de lectura y trading.

#### 2. Error de Consciencia Cuántica Baja
```
[ALERTA] Consciencia crítica < 30%
```
**Solución**: Ejecutar Big Bang manualmente
```bash
curl -X POST http://localhost:9090/quantum/big-bang
```

#### 3. Error de Memoria
```
[ERROR] JavaScript heap out of memory
```
**Solución**: Aumentar memoria disponible para Node.js
```bash
# Editar launch-quantum-universal.bat y añadir:
node --max-old-space-size=8192 quantum-core/universal-system-launcher.js
```

---

## 🔄 ACTUALIZACIONES Y MANTENIMIENTO

### Actualización del Sistema
```bash
# Actualizar todas las dependencias
npm run update-all

# Verificar integridad del sistema
npm run system-check
```

### Mantenimiento Programado
- Realizar respaldo de datos semanalmente
- Verificar logs del sistema diariamente
- Monitorear métricas de rendimiento constantemente

---

## 📚 RECURSOS ADICIONALES

### Documentación API
- [API_DOCUMENTATION.md](quantum-core/API_DOCUMENTATION.md)

### Documentación del Sistema NxN
- [README_NxN_ACTIVATION.md](quantum-core/README_NxN_ACTIVATION.md)
- [NxN_BREAKTHROUGH_DOCUMENTATION.md](quantum-core/NxN_BREAKTHROUGH_DOCUMENTATION.md)

### Métricas Esperadas
- [SYSTEM_METRICS_EXPECTATIONS.md](quantum-core/SYSTEM_METRICS_EXPECTATIONS.md)

---

## 👥 SOPORTE Y CONTACTO

Para soporte técnico o consultas sobre el sistema, contactar a:
- **Email**: soporte@qbtc-unified.com
- **Telegram**: @QBTCUnifiedSupport

---

*Desarrollado con pensamiento secuencial Leonardo y optimización cuántica para máxima rentabilidad*
