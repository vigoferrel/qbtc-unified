# QBTC-UNIFIED: Solución de Gestión Avanzada de Claves API

## Descripción General

Esta solución implementa un gestor avanzado de claves API para QBTC-UNIFIED que extiende el `CredentialsManager` existente con funcionalidades adicionales de seguridad, validación y gestión.

## Componentes Principales

### 1. ApiKeyManager

Extiende el `CredentialsManager` existente con funcionalidades avanzadas:

- **Encriptación de claves**: Utiliza AES-256-CBC para encriptar las claves API en reposo
- **Rotación de claves**: Sistema para detectar cuándo las claves necesitan rotación
- **Validación de permisos**: Verifica qué permisos tienen las claves API (futures, spot, solo lectura, etc.)
- **Historial de validación**: Mantiene un registro de las validaciones realizadas
- **Metadatos de claves**: Almacena información adicional sobre las claves

### 2. API Key Integration

Integra el `ApiKeyManager` con el sistema existente:

- **Endpoints REST**: Proporciona endpoints para consultar el estado de las claves y sus permisos
- **Validación bajo demanda**: Permite validar las claves mediante una solicitud POST
- **Integración con Express**: Se integra fácilmente con servidores Express existentes

### 3. Enhanced Key Dashboard Server

Servidor completo que integra:

- El `CredentialsManager` existente
- El nuevo `ApiKeyManager`
- El sistema de dashboard de métricas
- Todos los endpoints del servidor original

## Endpoints de Gestión de Claves

- **GET /api/keys/status**: Devuelve el estado detallado de las claves API
- **GET /api/keys/permissions**: Devuelve información sobre los permisos de las claves
- **POST /api/keys/validate**: Realiza una validación de las claves y actualiza su estado

## Características de Seguridad

- **Encriptación**: Las claves sensibles se encriptan usando AES-256-CBC
- **Ocultación parcial**: Las claves se muestran parcialmente en logs (solo primeros caracteres)
- **Almacenamiento seguro**: Los metadatos se almacenan localmente en archivos JSON
- **Validación periódica**: Sistema para validar la autenticidad y permisos de las claves

## Uso

1. **Iniciar el servidor mejorado**:
   ```
   .\Start-KeyDashboardServer.ps1
   ```

2. **Acceder a la información de claves**:
   ```
   Invoke-WebRequest -Uri http://localhost:18020/api/keys/status -UseBasicParsing | Select-Object -ExpandProperty Content
   ```

3. **Verificar permisos**:
   ```
   Invoke-WebRequest -Uri http://localhost:18020/api/keys/permissions -UseBasicParsing | Select-Object -ExpandProperty Content
   ```

4. **Validar claves**:
   ```
   Invoke-WebRequest -Uri http://localhost:18020/api/keys/validate -Method POST -UseBasicParsing | Select-Object -ExpandProperty Content
   ```

## Integración con el Sistema Existente

Esta solución honra y aprovecha el trabajo previo:

1. **Utiliza el `CredentialsManager` existente** como base, sin duplicar funcionalidad
2. **Extiende las capacidades** añadiendo características avanzadas de seguridad y gestión
3. **Mantiene compatibilidad** con todos los sistemas que ya utilizan el `CredentialsManager`
4. **Integra con el dashboard** existente para proporcionar una visión completa del sistema

## Ventajas

- **Mayor seguridad**: Protección adicional para las claves API sensibles
- **Mejor gestión**: Conocimiento detallado del estado y permisos de las claves
- **Alertas proactivas**: Detección de necesidad de rotación de claves
- **Validación mejorada**: Sistema robusto para verificar la validez de las claves
- **Integración perfecta**: Se integra con el sistema existente sin duplicar código

## Próximos Pasos

1. Implementar validación real con la API de Binance
2. Añadir sistema de notificaciones para alertar sobre problemas con las claves
3. Integrar con un sistema de secretos más robusto (como HashiCorp Vault)
4. Implementar rotación automática de claves
