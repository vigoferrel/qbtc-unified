# QBTC Frontend Unificado - Puerto 8080

## Resumen del Setup Completo

El frontend unificado de QBTC ha sido configurado para ejecutarse en el puerto 8080 con scripts de PowerShell para lanzamiento en segundo plano y monitoreo completo.

## Archivos Creados

### Scripts de PowerShell
- `setup-frontend-8080.ps1` - Script maestro de configuracion completa
- `start-frontend-8080.ps1` - Script de monitoreo y control avanzado
- `launch-background.ps1` - Script simplificado para lanzamiento en segundo plano
- `verify-unified-connections.ps1` - Script de verificacion de conectividad con sistemas

### Configuración
- `package.json` - Dependencias y configuracion del frontend
- `frontend-proxy-server.js` - Servidor proxy configurado para puerto 8080
- `config.js` - Configuracion de endpoints y sistemas unificados

## Como Usar

### 1. Setup Inicial Completo
```powershell
# Configurar, instalar dependencias e iniciar
.\setup-frontend-8080.ps1

# Solo verificar prerequisitos
.\setup-frontend-8080.ps1 Check

# Solo instalar dependencias
.\setup-frontend-8080.ps1 Install
```

### 2. Lanzamiento en Segundo Plano
```powershell
# Metodo 1: Lanzamiento rapido
.\launch-background.ps1

# Metodo 2: Con monitoreo completo
.\start-frontend-8080.ps1 Start
```

### 3. Monitoreo y Control
```powershell
# Monitorear procesos activos
.\start-frontend-8080.ps1 Monitor

# Ver status actual
.\start-frontend-8080.ps1 Status

# Detener frontend
.\start-frontend-8080.ps1 Stop

# Reiniciar frontend
.\start-frontend-8080.ps1 Restart
```

### 4. Verificar Conectividad
```powershell
# Verificar conexiones con todos los sistemas unificados
.\verify-unified-connections.ps1
```

## Configuracion del Puerto 8080

### Frontend Local
- **URL**: http://localhost:8080
- **Descripcion**: Interfaz principal unificada
- **Proxy**: /api/* -> http://localhost:3003 (Leonardo Backend)

### Sistemas Conectados
- **Backend Leonardo**: http://localhost:3003 (Critico)
- **API Unificada**: https://qbtc-api.com:18020
- **Nucleo Cuantico**: https://qbtc-api.com:9090
- **Motor Trading**: https://qbtc-api.com:9091
- **Datos Mercado**: https://qbtc-api.com:9092
- **Monitoreo**: https://qbtc-api.com:9093

## Arquitectura de Segundo Plano

### Procesos Automaticos
- Frontend se ejecuta como proceso Node.js oculto
- Monitoreo automatico de metricas de rendimiento
- Logs detallados con timestamps
- Status reportado en archivos JSON

### Archivos de Status Generados
- `frontend-status.json` - Status del proceso activo
- `frontend-process-info.json` - Informacion detallada del proceso
- `last-connectivity-status.json` - Ultimo estado de conectividad
- `setup-frontend-*.log` - Logs de configuracion
- `frontend-8080-*.log` - Logs de ejecucion
- `connectivity-check-*.log` - Logs de verificacion

## Reportes de Metricas

### Metricas del Sistema
- Uso de CPU y memoria
- Estado de procesos Node.js
- Conectividad de puertos
- Tiempo de ejecucion

### Metricas de Conectividad
- Estado de todos los sistemas unificados
- Latencia de endpoints
- Codigos de respuesta HTTP
- Alertas de sistemas criticos

## Troubleshooting

### Puerto 8080 en Uso
```powershell
# Verificar que proceso usa el puerto
netstat -ano | findstr :8080

# Detener proceso especifico
Stop-Process -Id [PID] -Force
```

### Frontend No Responde
```powershell
# Verificar status
.\start-frontend-8080.ps1 Status

# Reiniciar
.\start-frontend-8080.ps1 Restart
```

### Backend Desconectado
```powershell
# Iniciar Leonardo Consciousness
cd ..\leonardo-consciousness
.\start-leonardo.ps1 Start
```

### Dependencias Faltantes
```powershell
# Reinstalar dependencias
npm install

# O usar el setup
.\setup-frontend-8080.ps1 Install
```

## Integracion con Sistemas Unificados

### Proxying de APIs
- Todas las rutas `/api/*` se redirigen al backend Leonardo
- Soporte para WebSockets y SSE
- Manejo automatico de errores de conectividad

### Headers y CORS
- Configuracion CORS habilitada
- Headers de seguridad con Helmet
- Compresion automatica de respuestas

### Rutas Estaticas
- Todos los archivos del directorio servidos estaticamente
- Fallback a `index.html` para SPA behavior
- Soporte para assets (CSS, JS, imagenes)

## Logs y Debugging

### Ubicacion de Logs
- Logs de setup: `setup-frontend-*.log`
- Logs de ejecucion: `frontend-8080-*.log`  
- Logs de conectividad: `connectivity-check-*.log`

### Niveles de Log
- **INFO**: Informacion general
- **SUCCESS**: Operaciones exitosas
- **WARN**: Advertencias
- **ERROR**: Errores criticos
- **METRICS**: Datos de rendimiento

### Formato de Log
```
[HH:mm:ss.fff] [NIVEL] Mensaje detallado
```

## Comandos Rapidos

```powershell
# Setup completo y iniciar
.\setup-frontend-8080.ps1

# Solo lanzar en segundo plano
.\launch-background.ps1

# Monitorear en tiempo real
.\start-frontend-8080.ps1 Monitor

# Verificar que todo funcione
.\verify-unified-connections.ps1

# Ver status actual
.\start-frontend-8080.ps1 Status
```

## URLs Importantes

- **Frontend Principal**: http://localhost:8080
- **Backend Leonardo**: http://localhost:3003
- **API Health Check**: http://localhost:8080/api/health (proxied)

## Notas Importantes

1. **Encoding**: Scripts configurados para UTF-8 sin emojis
2. **Segundo Plano**: Procesos ejecutados como Hidden/NoWindow
3. **Monitoreo**: Metricas reportadas cada 3-5 segundos
4. **Logs**: Archivos con timestamps para debugging
5. **Conectividad**: Verificacion automatica de sistemas criticos

Para soporte adicional, revisar los logs detallados generados por cada script.
