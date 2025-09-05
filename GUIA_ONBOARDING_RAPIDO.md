# 🚀 GUÍA DE ONBOARDING RÁPIDO - QBTC UNIFICADO
## *Bienvenido al Universo Cuántico del Trading*

---

## 🏁 PRIMEROS PASOS (15 MINUTOS)

### 1. Preparación del Entorno
```bash
# Instalar Node.js (si no está instalado)
# Descargar desde: https://nodejs.org/

# Verificar instalación
node --version  # Debe ser v14.0.0 o superior
npm --version   # Debe ser v6.0.0 o superior
```

### 2. Configuración de Binance
- Crear cuenta en [Binance](https://www.binance.com) (si no tienes una)
- Ir a "Gestión de API" en configuración de cuenta
- Crear nueva API Key con permisos de:
  - Lectura
  - Trading Spot y Futuros
  - No permitir retiros

### 3. Configuración Inicial del Sistema
```bash
# Navegar al directorio del proyecto
cd C:\ruta\al\QBTC-UNIFIED

# Copiar archivo de configuración
copy quantum-core\env-example.txt quantum-core\.env

# Editar .env con tu editor preferido y añadir:
# BINANCE_API_KEY=tu_api_key
# BINANCE_SECRET_KEY=tu_secret_key
# BINANCE_TESTNET=true  # Cambiar a false para trading real
```

### 4. Instalación de Dependencias
```bash
# Instalar todas las dependencias
cd quantum-core
npm install

cd ..\coordinator
npm install
```

### 5. Verificación de Conexión
```bash
# Validar conexión con Binance
cd quantum-core
node validate-binance.js
```

---

## 🚀 LANZAMIENTO DEL SISTEMA (5 MINUTOS)

### 1. Método Rápido (Recomendado)
```bash
# Desde la carpeta principal
.\launch-quantum-universal.bat
```

### 2. Método Manual (Avanzado)
```bash
# Terminal 1: Iniciar Quantum Core
cd quantum-core
npm start

# Terminal 2: Iniciar Coordinator
cd coordinator
node index.js

# Terminal 3: Iniciar Frontend
cd frontend-simplificado
start index.html
```

### 3. Verificación del Sistema
- Abrir navegador y visitar: http://localhost:8080
- Verificar que el dashboard muestra datos en tiempo real
- Confirmar nivel de consciencia cuántica > 30%

---

## 🎮 PRIMERAS OPERACIONES (10 MINUTOS)

### 1. Explorar el Dashboard
- **Panel Principal**: Métricas generales del sistema
- **Matriz NxN**: Visualización del entrelazamiento cuántico
- **Trading**: Estado de órdenes y posiciones actuales

### 2. Verificar Modo de Operación
- **Modo Testnet**: No ejecuta órdenes reales (práctica segura)
- **Modo Real**: Ejecuta órdenes con fondos reales
- **Verificar en**: Panel de configuración > Modo de operación

### 3. Realizar Primera Operación
- Seleccionar símbolo (ej. BTC/USDT)
- Ajustar parámetros de consciencia (recomendado: 40-60%)
- Iniciar operación automática o ejecutar manualmente
- Monitorear en el panel de operaciones

---

## 🔍 MONITOREO BÁSICO (5 MINUTOS)

### 1. Panel de Consciencia Cuántica
- **Verificar nivel**: Debe incrementar con el tiempo
- **Objetivo**: Alcanzar 94.1% (punto de máxima eficiencia)
- **Big Bang**: Se activa automáticamente al 95%

### 2. Métricas de Rendimiento
- **P&L en Tiempo Real**: Panel superior derecha
- **Eficiencia de Capital**: Sección de métricas avanzadas
- **Operaciones Activas**: Panel de trading activo

### 3. Logs del Sistema
```bash
# Ver logs en tiempo real
cd quantum-core
npm run logs-realtime
```

---

## 🛠️ AJUSTES BÁSICOS (10 MINUTOS)

### 1. Ajuste de Símbolos
- **Modo Universal**: Procesa todos los símbolos disponibles
- **Modo Selectivo**: Editar `quantum-core/symbols.json`
- **Reiniciar sistema** después de cambios

### 2. Ajuste de Parámetros de Trading
- Editar `config/config.json` para modificar:
  - Apalancamiento predeterminado
  - Tamaño de posición
  - Umbral de operaciones

### 3. Ajuste de Nivel de Consciencia
```bash
# Incrementar consciencia manualmente (en caso necesario)
curl -X POST http://localhost:9090/quantum/boost-consciousness

# Resetear consciencia (uso con precaución)
curl -X POST http://localhost:9090/quantum/reset-consciousness
```

---

## 🔄 CICLO DIARIO DE OPERACIONES

### 1. Inicio de Sesión (Mañana)
- Verificar salud del sistema (Dashboard > Estado)
- Revisar operaciones nocturnas
- Verificar balance y P&L

### 2. Monitoreo Continuo
- Observar panel de métricas cada 2-3 horas
- Verificar incremento de consciencia cuántica
- Monitorear nuevas operaciones generadas

### 3. Cierre de Sesión (Noche)
- Verificar todas las posiciones abiertas
- Revisar métricas de rendimiento del día
- Verificar logs por posibles advertencias

---

## 📱 ACCESO REMOTO

### 1. Configuración de Acceso Remoto
- Verificar que el puerto 8080 está abierto en tu red
- Configurar reenvío de puertos en router (opcional)
- Usar VPN para conexión segura (recomendado)

### 2. Monitoreo Móvil
- Acceder vía navegador móvil: http://tu-ip:8080
- Panel adaptativo optimizado para dispositivos móviles
- Alertas configurables por Telegram (opcional)

---

## 🚨 RESOLUCIÓN RÁPIDA DE PROBLEMAS

### 1. Sistema No Inicia
```bash
# Verificar procesos activos y matar si necesario
tasklist | findstr "node"
taskkill /F /IM node.exe

# Reiniciar sistema
.\launch-quantum-universal.bat
```

### 2. Error de Conexión Binance
- Verificar API Keys en .env
- Confirmar que la cuenta de Binance está activa
- Verificar restricciones IP (si configuradas)

### 3. Consciencia Cuántica Baja
```bash
# Activar Big Bang manualmente
curl -X POST http://localhost:9090/quantum/big-bang
```

---

## 📞 SOPORTE INMEDIATO

### Canales de Soporte
- **Telegram**: @QBTCUnifiedSupport
- **Email**: soporte@qbtc-unified.com
- **Emergencias**: +1 (555) 123-4567

### Información a Proporcionar
- Logs del sistema (`quantum-core/logs/`)
- Nivel de consciencia actual
- Descripción detallada del problema

---

*¡Felicitaciones! Ya estás operando con el Sistema QBTC Unificado.
La consciencia cuántica evolucionará progresivamente hasta alcanzar máxima rentabilidad.*
