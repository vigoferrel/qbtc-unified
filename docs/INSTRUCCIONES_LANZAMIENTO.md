# 🚀 INSTRUCCIONES DE LANZAMIENTO - QBTC UNIFIED

## Requisitos Previos

1. **Node.js y NPM**
   - Descargar e instalar la última versión estable de Node.js desde [nodejs.org](https://nodejs.org/)
   - Verificar la instalación con los comandos:
     ```
     node --version
     npm --version
     ```

2. **Cuenta de Binance**
   - Crear una cuenta en [Binance](https://www.binance.com) si no tienes una
   - Generar API Keys desde: Account -> API Management
   - Asegurarte de habilitar permisos de lectura y trading

## Configuración del Sistema

### 1. Configuración de Binance

1. Navega al directorio del núcleo cuántico:
   ```
   cd quantum-core
   ```

2. Crea el archivo de configuración .env:
   ```
   copy env-example.txt .env
   ```

3. Edita el archivo .env con tus credenciales de Binance:
   - BINANCE_API_KEY=tu_api_key
   - BINANCE_SECRET_KEY=tu_secret_key
   - BINANCE_TESTNET=true (cambia a false para trading real)

### 2. Instalación de Dependencias

1. Instala las dependencias del núcleo cuántico:
   ```
   cd quantum-core
   npm install
   ```

2. Instala las dependencias del coordinador:
   ```
   cd ../coordinator
   npm install
   ```

### 3. Validación de Conexión con Binance

1. Ejecuta el script de validación:
   ```
   cd quantum-core
   node validate-binance.js
   ```

2. Verifica que la conexión se establezca correctamente y muestre tus balances

## Lanzamiento del Sistema

### 1. Método Manual (paso a paso)

1. Inicia el núcleo cuántico:
   ```
   cd quantum-core
   npm start
   ```

2. En una nueva terminal, inicia el coordinador:
   ```
   cd coordinator
   node index.js
   ```

3. Abre el frontend en tu navegador:
   - http://localhost:8080

### 2. Método Automático

1. Ejecuta el script de lanzamiento desde PowerShell:
   ```
   cd frontend-simplificado
   .\start-qbtc-real.ps1
   ```

## Monitoreo del Sistema

- **Dashboard principal**: http://localhost:8080
- **Estado del sistema cuántico**: http://localhost:9090/quantum/status
- **Métricas en tiempo real**: http://localhost:9093
- **Logs del sistema**:
  ```
  cd quantum-core
  npm run logs-nxn
  ```

## Detención del Sistema

Para detener todos los componentes, presiona Ctrl+C en cada terminal o ejecuta:
```
cd quantum-core
npm run emergency-stop
```

## Resolución de Problemas

1. **Error de conexión con Binance**:
   - Verifica las credenciales en el archivo .env
   - Asegúrate de que la API key tenga los permisos correctos

2. **Puertos en uso**:
   - Verifica si hay otros procesos usando los puertos requeridos (8080, 9090-9093)
   - Usa el administrador de tareas para cerrar procesos de Node.js

3. **Error de consciencia cuántica baja**:
   - Ejecuta el Big Bang manualmente:
     ```
     curl -X POST http://localhost:9090/quantum/big-bang
     ```

## Notas Importantes

- El sistema está diseñado para funcionar con Binance como única fuente de verdad
- En modo testnet no se ejecutarán órdenes reales
- Al cambiar a modo producción (BINANCE_TESTNET=false), se ejecutarán órdenes reales con fondos reales
- La consciencia cuántica evoluciona con el tiempo desde 37% hasta el objetivo Leonardo de 94.1%
- El Big Bang se activa automáticamente al alcanzar 95% de consciencia

---

*Desarrollado con pensamiento secuencial Leonardo y optimización cuántica para máxima rentabilidad*
