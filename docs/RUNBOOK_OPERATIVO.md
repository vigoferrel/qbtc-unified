# RUNBOOK OPERATIVO - QBTC-UNIFIED

## 🚨 PROCEDIMIENTOS DE EMERGENCIA

### PARADA DE EMERGENCIA TOTAL
```bash
# PANIC BUTTON - Detener todo inmediatamente
pm2 stop all
echo "Sistema en parada de emergencia - $(date)" >> /var/log/qbtc-emergency.log
```

### SAFETY-KILL ACTIVATION
```bash
# Activar kill switch del Guardian
curl -X POST http://localhost:14601/reset-kill-switch \
  -H "Content-Type: application/json" \
  -d '{"authCode": "RESET_GUARDIAN_2024"}'
```

### RECUPERACIÓN RÁPIDA
```bash
# Restart ordenado de todos los servicios
pm2 restart all --force
sleep 10
pm2 status
```

## 📊 MONITOREO DIARIO

### Checklist Matutino (8:00 AM)
```bash
# 1. Estado general del sistema
pm2 status

# 2. Métricas agregadas
curl -s http://localhost:14701/status | jq '.'

# 3. Estado del Guardian
curl -s http://localhost:14601/status | jq '.riskLevel,.status'

# 4. Cartera actual
curl -s http://localhost:14801/portfolio | jq '.totalValue,.riskMetrics'

# 5. Logs de errores críticos
pm2 logs --err --lines 20
```

### Verificación de Políticas
```bash
# Verificar que no se use Math.random
grep -r "Math\.random" . --exclude-dir=node_modules
# Debe retornar: Sin resultados

# Verificar servicios en PM2
pm2 list | grep -c "online"
# Debe retornar: 9
```

## 🔧 MANTENIMIENTO SEMANAL

### Limpieza de Logs (Domingos 2:00 AM)
```bash
# Rotar logs de PM2
pm2 flush

# Limpiar logs antiguos
find ./logs -name "*.log" -mtime +7 -delete

# Restart para limpiar memoria
pm2 restart all
```

### Backup de Configuración
```bash
# Backup de configuraciones PM2
cp -r ./**/ecosystem.config.cjs /backup/pm2-configs/

# Backup de métricas históricas
curl http://localhost:14701/metrics > /backup/metrics/$(date +%Y%m%d).txt
```

## 🐛 TROUBLESHOOTING

### Problema: Servicio No Responde
```bash
# Diagnóstico
pm2 describe <service-name>
pm2 logs <service-name> --lines 50

# Solución
pm2 restart <service-name>
sleep 5
pm2 logs <service-name> --lines 10
```

### Problema: Alta Latencia
```bash
# Verificar carga del sistema
pm2 monit

# Revisar métricas de performance
curl http://localhost:14701/services

# Restart si memoria alta
pm2 restart all
```

### Problema: Guardian en Estado Crítico
```bash
# Verificar alertas
curl http://localhost:14601/alerts

# Revisar métricas de riesgo
curl http://localhost:14801/risk-metrics

# Reset manual si necesario
curl -X POST http://localhost:14601/reset-kill-switch \
  -d '{"authCode": "RESET_GUARDIAN_2024"}'
```

## 📈 OPTIMIZACIÓN DE PERFORMANCE

### Ajustes de Memoria PM2
```javascript
// En ecosystem.config.cjs
{
  max_memory_restart: '500M',  // Aumentar si necesario
  node_args: ['--max-old-space-size=1024']
}
```

### Tuning de Red
```bash
# Aumentar límites de conexiones
echo 65536 > /proc/sys/net/core/somaxconn
echo 1 > /proc/sys/net/ipv4/tcp_tw_reuse
```

## 🔐 SEGURIDAD

### Verificación de Integridad
```bash
# Verificar que solo qbtc-runtime.cjs esté en uso
find . -name "*.js" -exec grep -l "Math.random" {} \;
# Debe estar vacío

# Validar entropía criptográfica
grep -r "crypto.randomBytes\|SecureRandom" ./services/
```

### Rotación de Logs Sensibles
```bash
# Limpiar logs que contengan decisiones de trading
pm2 logs --lines 1000 | grep -v "decision\|trade" > temp.log
mv temp.log pm2.log
```

## 📊 REPORTES AUTOMÁTICOS

### Reporte Diario (6:00 PM)
```bash
#!/bin/bash
# daily-report.sh

echo "=== REPORTE DIARIO QBTC $(date) ===" > daily-report.txt

echo "ESTADO SERVICIOS:" >> daily-report.txt
pm2 status >> daily-report.txt

echo "MÉTRICAS SISTEMA:" >> daily-report.txt
curl -s http://localhost:14701/status >> daily-report.txt

echo "CARTERA:" >> daily-report.txt
curl -s http://localhost:14801/portfolio >> daily-report.txt

echo "ALERTAS:" >> daily-report.txt
curl -s http://localhost:14601/alerts >> daily-report.txt

# Enviar reporte (implementar según necesidades)
# mail -s "Reporte QBTC" admin@empresa.com < daily-report.txt
```

### Reporte Semanal de Performance
```bash
#!/bin/bash
# weekly-performance.sh

echo "=== REPORTE SEMANAL $(date) ===" > weekly-report.txt

# Uptime de servicios
pm2 list | grep -E "online|stopped|errored" >> weekly-report.txt

# Métricas de negocio
echo "TRADING STATS:" >> weekly-report.txt
curl -s http://localhost:3001/stats >> weekly-report.txt

# Métricas de riesgo
echo "RISK METRICS:" >> weekly-report.txt
curl -s http://localhost:14801/risk-metrics >> weekly-report.txt
```

## 🚀 ESCALADO

### Incrementar Instancias
```bash
# Escalar servicio crítico
pm2 scale qbtc-metaconsciencia 2

# Balancear carga
pm2 reload all
```

### Monitoreo de Recursos
```bash
# CPU y memoria por servicio
pm2 monit

# Espacio en disco
df -h

# Conexiones de red
netstat -tulnp | grep -E ":3001|:14601|:14701|:14801"
```

## 🔄 ACTUALIZACIONES

### Deploy de Nueva Versión
```bash
# 1. Backup actual
pm2 save
cp -r . /backup/qbtc-$(date +%Y%m%d)/

# 2. Detener servicios gradualmente
pm2 stop qbtc-metaconsciencia
sleep 2
pm2 stop qbtc-guardian
pm2 stop qbtc-portfolio

# 3. Actualizar código
git pull origin main

# 4. Restart ordenado
pm2 start qbtc-guardian
sleep 5
pm2 start qbtc-portfolio
sleep 5
pm2 start qbtc-metaconsciencia

# 5. Verificar
pm2 status
curl http://localhost:14701/status
```

### Rollback en Caso de Error
```bash
# Restaurar desde backup
pm2 stop all
cp -r /backup/qbtc-YYYYMMDD/* .
pm2 start all
pm2 status
```

## 📞 CONTACTOS DE ESCALAMIENTO

### Nivel 1: Operaciones (0-30 min)
- Verificar estado básico
- Restart de servicios
- Verificación de logs

### Nivel 2: Desarrollo (30-120 min)
- Análisis de código
- Debugging profundo
- Hotfixes críticos

### Nivel 3: Arquitectura (2+ horas)
- Cambios estructurales
- Escalado de infraestructura
- Disaster recovery

## 📋 CHECKLIST PRE-PRODUCCIÓN

Antes de cualquier cambio mayor:

- [ ] Backup completo realizado
- [ ] Servicios críticos identificados
- [ ] Plan de rollback definido
- [ ] Ventana de mantenimiento coordinada
- [ ] Monitoreo intensivo activado
- [ ] Contactos de escalamiento notificados

## 🎯 MÉTRICAS SLA

### Objetivos de Servicio
- **Uptime**: 99.9% (8.77h down/año)
- **Latency P95**: <150ms
- **Error Rate**: <0.1%
- **MTTR**: <15 minutos
- **MTBF**: >30 días

### Alertas Críticas
- CPU > 90% por 5 min
- Memoria > 95% por 3 min
- Disk space > 90%
- Servicio down > 1 min
- Error rate > 1%

---

**RUNBOOK QBTC-UNIFIED v1.0**  
*Última actualización: 2025-09-04*  
*Próxima revisión: 2025-10-04*
