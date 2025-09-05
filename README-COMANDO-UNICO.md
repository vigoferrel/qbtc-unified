# QBTC-UNIFIED - COMANDO UNICO DE LANZAMIENTO

## Comando Principal Unificado

Se ha creado un **comando único** para lanzar todo el sistema QBTC-UNIFIED completo con un solo comando.

## Opciones de Lanzamiento

### 1. SUPER SIMPLE - Un Solo Click
```
QBTC-START.cmd
```
**Doble click en este archivo** y lanza todo el sistema con monitoreo en tiempo real.

### 2. Segundo Plano - Sin Interfaz
```
QBTC-START-BACKGROUND.cmd
```
Lanza el sistema completo en segundo plano sin monitoreo.

### 3. PowerShell Avanzado
```powershell
.\LAUNCH-QBTC-UNIFIED.ps1
```
Script maestro con opciones avanzadas y control completo.

## Comando Único - Opciones Avanzadas

### Lanzamiento Completo (Recomendado)
```powershell
.\LAUNCH-QBTC-UNIFIED.ps1
```
- Inicia Leonardo Backend (puerto 3003)
- Inicia Frontend Unificado (puerto 8080)
- Verifica conectividad
- Muestra status y pausa para monitoreo manual

### Con Monitoreo Automático
```powershell
.\LAUNCH-QBTC-UNIFIED.ps1 -Monitor
```
- Lanza sistema completo
- Inicia monitoreo automático en tiempo real
- Actualiza métricas cada 3 segundos

### En Segundo Plano
```powershell
.\LAUNCH-QBTC-UNIFIED.ps1 -Background
```
- Lanza todo en procesos ocultos
- No muestra interfaz de monitoreo
- Ideal para uso automatizado

### Modo Rápido
```powershell
.\LAUNCH-QBTC-UNIFIED.ps1 -Quick
```
- Salta verificaciones de prerequisites
- Lanzamiento ultra-rápido
- Para cuando ya sabes que todo funciona

### Solo Componentes Específicos
```powershell
# Solo frontend
.\LAUNCH-QBTC-UNIFIED.ps1 -Mode Frontend

# Solo backend
.\LAUNCH-QBTC-UNIFIED.ps1 -Mode Backend

# Solo monitoreo
.\LAUNCH-QBTC-UNIFIED.ps1 -Mode Monitor
```

### Combinaciones Potentes
```powershell
# Lanzamiento con monitoreo en segundo plano
.\LAUNCH-QBTC-UNIFIED.ps1 -Monitor -Background

# Solo frontend con monitoreo
.\LAUNCH-QBTC-UNIFIED.ps1 -Mode Frontend -Monitor

# Lanzamiento rápido con monitoreo
.\LAUNCH-QBTC-UNIFIED.ps1 -Quick -Monitor
```

## URLs del Sistema

Una vez lanzado, el sistema estará disponible en:

- **Frontend Principal**: http://localhost:8080
- **Backend API**: http://localhost:3003
- **Proxy API**: http://localhost:8080/api/*

## Alternativa con npm scripts (sin Docker)

Si prefieres usar npm scripts:

1) Backend Leonardo (3003)
```
npm run start:leonardo
```

2) Frontend Unificado (8080)
```
npm run start:frontend
```

3) Ambos en paralelo (dev)
```
npm run start:all
```

Opcional PM2:
```
npm run pm2:leonardo
npm run pm2:frontend
npm run pm2:ls
```

## Características del Comando Unificado

### ✅ Verificaciones Automáticas
- Node.js instalado y funcionando
- Directorios y archivos críticos presentes
- Scripts principales disponibles

### ✅ Lanzamiento Inteligente
- Detecta si los procesos ya están ejecutándose
- Evita duplicados
- Instala dependencias si es necesario

### ✅ Monitoreo Integrado
- Status de procesos en tiempo real
- Verificación de conectividad
- Métricas de sistema (CPU, memoria)
- Logs detallados con timestamps

### ✅ Manejo de Procesos
- Procesos en segundo plano (Hidden/NoWindow)
- PIDs guardados para control posterior
- Manejo limpio de errores

### ✅ Status y Logs
- Archivos JSON con estado del sistema
- Logs detallados para debugging
- Información de conectividad guardada

## Archivos Generados

El comando unificado genera varios archivos de status:

```
qbtc-unified-launch-YYYYMMDD-HHMMSS.log  # Log principal
qbtc-unified-status.json                  # Status del sistema
frontend-status.json                      # Status del frontend
frontend-process-info.json               # Info detallada de procesos
```

## Troubleshooting del Comando Único

### Error: "No se puede ejecutar scripts"
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Error: "Node.js no encontrado"
- Instala Node.js desde nodejs.org
- Reinicia PowerShell después de instalar

### Error: "Puerto en uso"
```powershell
# Ver qué proceso usa el puerto
netstat -ano | findstr :8080
netstat -ano | findstr :3003

# Detener proceso específico
Stop-Process -Id [PID] -Force
```

### Error: "Scripts no encontrados"
- Verifica que estés en el directorio correcto
- Verifica que los archivos UnifiedLeonardoServer.js y frontend-proxy-server.js existan

## Flujo Completo del Comando

1. **Verificación**: Node.js, directorios, scripts
2. **Leonardo Backend**: Inicia en puerto 3003
3. **Espera**: 3 segundos para inicialización
4. **Frontend**: Instala dependencias e inicia en puerto 8080
5. **Conectividad**: Verifica que todo responda
6. **Status**: Guarda información del sistema
7. **Monitoreo**: Opcional, monitoreo en tiempo real

## Comando de Emergencia

Si algo sale mal, puedes detener todos los procesos:

```powershell
Get-Process -Name "node" | Stop-Process -Force
```

## Logs y Debugging

Todos los comandos generan logs detallados:

```powershell
# Ver logs en tiempo real
Get-Content -Path "qbtc-unified-launch-*.log" -Wait -Tail 10

# Ver último status
Get-Content -Path "qbtc-unified-status.json" | ConvertFrom-Json
```

## Quick Start - Pasos Mínimos

1. **Abrir PowerShell como Administrador**
2. **Navegar al directorio**:
   ```powershell
   cd "C:\Users\DELL\Desktop\QBTC-UNIFIED"
   ```
3. **Ejecutar comando único**:
   ```powershell
   .\LAUNCH-QBTC-UNIFIED.ps1 -Monitor
   ```
4. **Acceder**: http://localhost:8080

## Comando Ultra-Simple

**Para el uso más simple posible, solo haz doble click en:**

```
QBTC-START.cmd
```

Este archivo batch hace todo automáticamente sin necesidad de abrir PowerShell o escribir comandos.

---

**¡El sistema QBTC-UNIFIED ahora se puede lanzar con un solo comando!**
