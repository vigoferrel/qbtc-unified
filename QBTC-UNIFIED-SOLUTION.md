# QBTC-UNIFIED: Solución de Problemas de Conexión y Credenciales

## Problema Identificado

El sistema QBTC-UNIFIED presentaba problemas de conexión entre el frontend y el backend:

1. **Error de conexión**: El frontend intentaba conectarse al backend en el puerto 18020 pero recibía errores `ERR_CONNECTION_REFUSED`.

2. **Causa raíz**: El servidor backend (`QBTCServer.js`) no podía inicializarse correctamente porque requería credenciales de API de Binance válidas. El error específico era:
   ```
   Error: You need to pass an API key and secret to make authenticated calls.
   ```

3. **Problema secundario**: En `SystemConfig.js`, la configuración estaba forzando el modo producción con `testnet: false`, lo que requiere credenciales reales de Binance.

## Solución Implementada

### 1. Servidor Mock para Desarrollo

Se crearon dos versiones de un servidor mock que simula todas las respuestas del backend sin necesidad de conectarse a Binance:

- **mock-backend-server.js**: Versión básica que simula todos los endpoints críticos
- **enhanced-mock-server.js**: Versión mejorada que integra el `CredentialsManager` para una gestión óptima de credenciales

Ambos servidores implementan:
- Todos los endpoints críticos: `/`, `/api/health`, `/api/metrics`, `/api/opportunities`, `/api/predictions`, `/api/risk/exposure`, `/api/stream`
- Datos simulados que siguen la estructura esperada por el frontend
- SSE (Server-Sent Events) para streaming en tiempo real

### 2. Integración con CredentialsManager

Se aprovechó el `CredentialsManager` existente en el sistema para:

- Buscar credenciales de Binance en múltiples ubicaciones (.env, variables de entorno, etc.)
- Validar el formato de las credenciales
- Proporcionar una interfaz unificada para acceder a las credenciales
- Diagnosticar problemas relacionados con credenciales

Se creó un módulo de integración (`credentials-integration.js`) que:
- Crea un archivo `.env` temporal si no existe
- Inicializa el `CredentialsManager`
- Proporciona credenciales simuladas si no se encuentran reales

### 3. Scripts de Lanzamiento

Se crearon scripts para facilitar el uso del sistema:

- **launch-mock-server.ps1**: Script PowerShell para iniciar el servidor mock
  - Parámetro `-Enhanced` para usar la versión con `CredentialsManager`
  - Parámetro `-Background` para ejecutar en segundo plano

- **Start-MockServer.ps1**: Script simplificado para iniciar el servidor mock mejorado

Además, se actualizó el launcher principal (`LAUNCH-QBTC-UNIFIED.ps1`) para:
- Incluir los nuevos scripts como componentes críticos
- Añadir opciones para usar el servidor mock (`-UseMockServer` y `-UseEnhancedMock`)

### 4. Modificación de la Configuración

Se modificó `SystemConfig.js` para:
- Cambiar `testnet: false` a `testnet: true` para permitir el uso de credenciales de prueba

## Cómo Usar la Solución

### Para Desarrollo (Sin Credenciales Reales)

1. **Iniciar el servidor mock mejorado**:
   ```
   .\Start-MockServer.ps1
   ```
   o
   ```
   .\launch-mock-server.ps1 -Enhanced
   ```

2. **Verificar que el servidor esté respondiendo**:
   ```
   Invoke-WebRequest -Uri http://localhost:18020/api/health -UseBasicParsing
   ```

3. **Acceder al frontend**: Navegar a `http://localhost:18021` para usar la interfaz con el servidor mock

### Para Pruebas con Testnet

1. **Crear archivo `.env` con credenciales de testnet**:
   ```
   BINANCE_API_KEY=tu_api_key_de_testnet
   BINANCE_SECRET_KEY=tu_secret_key_de_testnet
   BINANCE_TESTNET=true
   ```

2. **Iniciar el sistema completo**:
   ```
   .\LAUNCH-QBTC-UNIFIED.ps1
   ```

### Para Producción

1. **Crear archivo `.env` con credenciales reales**:
   ```
   BINANCE_API_KEY=tu_api_key_real
   BINANCE_SECRET_KEY=tu_secret_key_real
   BINANCE_TESTNET=false
   ```

2. **Modificar `SystemConfig.js` para usar modo producción**:
   ```javascript
   testnet: false // Producción real
   ```

3. **Iniciar el sistema completo**:
   ```
   .\LAUNCH-QBTC-UNIFIED.ps1
   ```

## Beneficios de la Solución

1. **Desarrollo sin dependencias**: Permite desarrollar y probar el frontend sin necesidad de credenciales reales de Binance

2. **Gestión inteligente de credenciales**: Utiliza el `CredentialsManager` existente para buscar y validar credenciales en múltiples ubicaciones

3. **Flexibilidad**: Ofrece múltiples opciones de lanzamiento según las necesidades (desarrollo, pruebas, producción)

4. **Simulación completa**: El servidor mock simula todos los aspectos del backend, incluyendo streaming en tiempo real

5. **Integración con el sistema existente**: Se integra perfectamente con los componentes existentes sin modificaciones invasivas
