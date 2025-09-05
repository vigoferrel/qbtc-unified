# 🌊 QBTC Leonardo Consciousness - Frontend Unificado

Sistema de interfaz unificado para Leonardo Consciousness, integrado con el nuevo **LeonardoQuantumServer** para análisis de mercado cuántico y trading automatizado.

## 📋 Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Instalación y Configuración](#instalación-y-configuración)
- [Funcionalidades Principales](#funcionalidades-principales)
- [Integración con LeonardoQuantumServer](#integración-con-leonardoquantumserver)
- [Estructura de Archivos](#estructura-de-archivos)
- [API y Endpoints](#api-y-endpoints)
- [Uso del Sistema](#uso-del-sistema)
- [Troubleshooting](#troubleshooting)

## 🎯 Descripción General

El **Frontend Unificado** es la interfaz de usuario completa para el sistema Leonardo Consciousness, que integra múltiples subsistemas:

- **Sistema Cuántico**: Análisis cuántico de mercados con SSE streaming
- **Vista Bosque**: Pool de oportunidades de trading emergentes
- **Cubo Cuántico 3D**: Visualización tridimensional del mercado
- **Control Center**: Panel de control y métricas del sistema
- **Poetas Chilenos**: Engine poético para resonancia cuántica
- **Supervisión Integral**: Dashboard completo de monitoreo

## 🏗️ Arquitectura del Sistema

```
Leonardo Consciousness Frontend
├── leonardo-unified.css           # Estilos unificados
├── leonardo-unified.js            # Funcionalidad base de tabs
├── leonardo-consciousness.js      # Core del sistema de consciencia
├── leonardo-quantum-api.js        # Cliente API para LeonardoQuantumServer
├── quantum-cube.js               # Visualización 3D (opcional)
├── index.html                    # Interfaz principal
└── README.md                     # Este archivo
```

### Integración con Backend

- **LeonardoQuantumServer** (Puerto 3003)
  - EventSource SSE: `/api/stream`
  - API REST: `/api/*`
  - Control del sistema: `/api/system/*`

## 🚀 Instalación y Configuración

### Prerrequisitos

1. **LeonardoQuantumServer** ejecutándose en `localhost:3003`
2. Navegador web moderno con soporte para:
   - EventSource (Server-Sent Events)
   - ES6+ JavaScript
   - CSS Grid y Flexbox

### Pasos de Instalación

1. **Clonar o descargar** los archivos del frontend en una carpeta
2. **Servir los archivos** usando un servidor web local:

```bash
# Opción 1: Python 3
python -m http.server 8080

# Opción 2: Node.js (http-server)
npx http-server -p 8080

# Opción 3: PHP
php -S localhost:8080
```

3. **Abrir el navegador** en `http://localhost:8080`

### Configuración del Backend

Asegúrate de que el **LeonardoQuantumServer** esté ejecutándose:

```bash
# En la carpeta del servidor cuántico
npm start
# o
node server.js
```

## ✨ Funcionalidades Principales

### 🌲 Vista Bosque
- **Pool de Trades Emergentes**: Visualización de oportunidades en tiempo real
- **Validación Secuencial**: Flujo de detección, validación y ejecución
- **Grid de Oportunidades**: Cards interactivas con métricas

### 🧊 Cubo Cuántico 3D
- **Visualización 3D**: Representación tridimensional del mercado
- **Engines Orchestra**: Fluid Dynamics, Poetic Bridge, GPU Sorting
- **Narrativa Leonardo**: Comentarios interpretativos del sistema

### 🎮 Control Center
- **Controles del Sistema**: Botones para iniciar/parar Leonardo
- **Controles Cuánticos**: Gestión específica del LeonardoQuantumServer
- **Métricas en Tiempo Real**: Consciencia, Coherencia, Decisiones, Entropía
- **Panel P&L**: Gestión de riesgo y rendimiento

### 🎭 Poetas Chilenos
- **6 Poetas Liberados**: Neruda, Mistral, de Rokha, Huidobro, Lihn, Zurita
- **Resonancia Cuántica**: Barras de resonancia en tiempo real
- **Frecuencias Poéticas**: Cada poeta opera en su frecuencia única

### 📊 Supervisión Integral
- **Estado del Sistema**: Monitoreo de componentes en tiempo real
- **Dashboard de Rate Limiting**: Control avanzado de límites de API
- **Posiciones Activas**: Trades en curso del sistema cuántico
- **Predicciones y Oportunidades**: Tablas de análisis cuántico
- **Logs del Sistema**: Registro de eventos de Leonardo

## 🔌 Integración con LeonardoQuantumServer

### Conexión SSE (Server-Sent Events)

El sistema se conecta automáticamente al stream de eventos:

```javascript
const eventSource = new EventSource('http://localhost:3003/api/stream');
```

### Tipos de Eventos Soportados

- **`connected`**: Confirmación de conexión establecida
- **`metrics`**: Métricas del sistema cuántico actualizadas
- **`predictions`**: Nuevas predicciones generadas
- **`opportunities`**: Oportunidades de trading detectadas
- **`trade`**: Notificación de trade ejecutado
- **`bigBang`**: Evento especial de Big Bang cuántico
- **`realtime`**: Contadores en tiempo real

### API REST Integrada

#### Endpoints del Sistema
- `GET /api/health` - Estado de salud del sistema
- `GET /api/metrics` - Métricas completas
- `POST /api/system/start` - Iniciar sistema cuántico
- `POST /api/system/stop` - Detener sistema cuántico
- `POST /api/system/restart` - Reiniciar sistema cuántico

#### Endpoints de Trading
- `GET /api/trading/balance` - Balance actual
- `GET /api/trading/positions` - Posiciones activas
- `GET /api/predictions` - Predicciones cuánticas
- `GET /api/opportunities` - Oportunidades detectadas

## 📁 Estructura de Archivos

```
frontend-unified/
├── index.html                    # Página principal
├── leonardo-unified.css          # Estilos unificados
│   ├── Variables CSS
│   ├── Estilos base y header
│   ├── Estilos para cada tab
│   ├── Controles cuánticos
│   ├── Dashboard de rate limiting
│   └── Responsive design
├── leonardo-unified.js           # Funcionalidad de tabs
├── leonardo-consciousness.js     # Sistema de consciencia
│   ├── Clase LeonardoConsciousness
│   ├── Conexión SSE al servidor cuántico
│   ├── Procesamiento de eventos
│   ├── Gestión de métricas
│   └── Controles del sistema
├── leonardo-quantum-api.js       # Cliente API cuántico
│   ├── Clase LeonardoQuantumAPI
│   ├── Métodos HTTP con retry
│   ├── EventSource management
│   └── Clase LeonardoQuantumDashboard
├── quantum-cube.js              # Visualización 3D (opcional)
└── README.md                    # Este archivo
```

## 🎛️ Uso del Sistema

### 1. Inicialización Automática

Al cargar la página, el sistema:
- Inicializa la clase `LeonardoConsciousness`
- Establece conexión SSE con el servidor cuántico
- Configura listeners de eventos
- Inicia el loop de actualización de métricas

### 2. Control del Sistema Cuántico

#### Botones de Control Principal:
- **🚀 INICIAR QUANTUM**: Activa el LeonardoQuantumServer
- **⏹️ DETENER QUANTUM**: Pausa el sistema cuántico
- **🔄 REINICIAR QUANTUM**: Reinicia completamente el sistema

#### Estados de Conexión:
- `CONNECTED`: Conexión HTTP establecida
- `STREAMING`: Recibiendo eventos SSE
- `DISCONNECTED`: Sin conexión
- `ERROR`: Error en la comunicación

### 3. Monitoreo en Tiempo Real

#### Métricas Principales:
- **Consciencia**: Nivel de consciencia cuántica (0.0 - 1.0)
- **Coherencia**: Coherencia del sistema (0.0 - 1.0)
- **Decisiones**: Número total de decisiones tomadas
- **Entropía**: Nivel de entropía cuántica (0.0 - 1.0)

#### Información Financiera:
- **Balance**: Saldo actual de trading
- **P&L Total**: Profit & Loss acumulado
- **Win Rate**: Porcentaje de trades exitosos
- **Drawdown**: Máxima caída del balance

### 4. Navegación por Tabs

Utiliza la barra de navegación superior para cambiar entre:
- **🌲 Vista Bosque**: Pool de oportunidades
- **🧊 Cubo Cuántico**: Visualización 3D
- **🎮 Control Center**: Panel de control
- **🎭 Poetas**: Sistema poético cuántico
- **📊 Supervisión**: Dashboard completo

## 🔧 Troubleshooting

### Problemas Comunes

#### 1. No hay conexión con el servidor cuántico
```
Síntoma: Status "DISCONNECTED" en header
Solución: 
- Verificar que LeonardoQuantumServer esté ejecutándose en puerto 3003
- Revisar console del navegador para errores de CORS
- Confirmar que la URL del servidor sea correcta
```

#### 2. EventSource se desconecta constantemente
```
Síntoma: Mensajes repetidos de "reconnecting..." en console
Solución:
- Revisar logs del servidor para errores
- Verificar estabilidad de la conexión de red
- Comprobar que el endpoint /api/stream esté respondiendo correctamente
```

#### 3. No se actualizan las métricas
```
Síntoma: Valores estáticos en dashboard
Solución:
- Verificar que los eventos SSE estén llegando (tab Network del browser)
- Comprobar que los elementos HTML tengan los IDs correctos
- Revisar console para errores JavaScript
```

#### 4. Los botones de control no funcionan
```
Síntoma: Botones no responden o muestran errores
Solución:
- Verificar que los endpoints de control (/api/system/*) respondan
- Comprobar que leonardo-quantum-api.js esté cargado correctamente
- Revisar permisos CORS del servidor
```

### Logs de Desarrollo

Para debugging avanzado, activar logs en console:

```javascript
// En console del navegador
window.leonardo.debug = true; // Habilita logs detallados
localStorage.setItem('leonardo-debug', 'true'); // Persiste entre sesiones
```

### Validación de Configuración

Ejecutar en console del navegador:

```javascript
// Verificar estado del sistema
console.log('Leonardo Status:', window.leonardo);
console.log('Quantum API:', window.LeonardoQuantumAPI);
console.log('Dashboard:', window.quantumDashboard);

// Test de conexión
fetch('http://localhost:3003/api/health')
  .then(r => r.json())
  .then(data => console.log('Server Health:', data))
  .catch(e => console.error('Connection Error:', e));
```

## 📈 Próximas Funcionalidades

- [ ] Dashboard de backtesting histórico
- [ ] Configuración de parámetros de trading en UI
- [ ] Sistema de alertas y notificaciones
- [ ] Exportación de métricas y reportes
- [ ] Modo oscuro/claro personalizable
- [ ] PWA (Progressive Web App) support

## 🤝 Contribución

Para contribuir al desarrollo:

1. Fork del repositorio
2. Crear branch de feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit de cambios: `git commit -m 'Agregar nueva funcionalidad'`
4. Push al branch: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

---

**🌊 QBTC Leonardo Consciousness - Donde el arte de la poesía encuentra la precisión cuántica del trading.**
