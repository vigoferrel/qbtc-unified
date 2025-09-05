# 🤝 **Guía de Contribución - QBTC-UNIFIED**

¡Gracias por tu interés en contribuir al Ecosistema de Trading Cuántico QBTC-UNIFIED! Esta guía te ayudará a empezar y contribuir de manera efectiva.

## 📋 **Tabla de Contenidos**

- [Código de Conducta](#código-de-conducta)
- [¿Cómo puedo contribuir?](#cómo-puedo-contribuir)
- [Configuración del Entorno](#configuración-del-entorno)
- [Proceso de Desarrollo](#proceso-de-desarrollo)
- [Standards de Código](#standards-de-código)
- [Proceso de Pull Request](#proceso-de-pull-request)
- [Reporte de Bugs](#reporte-de-bugs)
- [Solicitud de Features](#solicitud-de-features)

---

## 📜 **Código de Conducta**

Este proyecto adhiere al [Contributor Covenant](https://www.contributor-covenant.org/). Al participar, se espera que mantengas este código. Por favor reporta comportamientos inaceptables a [vigoferrel@gmail.com](mailto:vigoferrel@gmail.com).

### **Nuestros Estándares**

- Usar lenguaje inclusivo y respetuoso
- Respetar diferentes puntos de vista y experiencias
- Aceptar críticas constructivas con gracia
- Enfocarse en lo que es mejor para la comunidad
- Mostrar empatía hacia otros miembros de la comunidad

---

## 🛠️ **¿Cómo puedo contribuir?**

### **Reportar Bugs**
- Busca primero en [Issues existentes](https://github.com/vigoferrel/qbtc-unified/issues)
- Usa la plantilla de bug report
- Incluye pasos para reproducir
- Agrega logs de error si están disponibles

### **Sugerir Features**
- Busca en issues existentes
- Usa la plantilla de feature request
- Explica el caso de uso comercial
- Considera el impacto en el ecosistema cuántico

### **Contribuciones de Código**
- Mejoras al sistema MetaConsciencia
- Optimizaciones del Quantum Engine
- Nuevas estrategias de trading
- Mejoras al sistema Guardian
- Optimizaciones de performance
- Tests adicionales para componentes críticos

### **Contribuciones Comerciales**
- Integración con nuevos exchanges
- Nuevos indicadores técnicos
- Mejoras de UI/UX
- Documentación empresarial
- Casos de estudio y análisis de ROI

---

## 🚀 **Configuración del Entorno**

### **Prerequisitos**
- Node.js 18+
- npm 8+ (o yarn/pnpm)
- Git 2.25+
- PM2 (para testing de servicios)

### **Setup Inicial**
```bash
# 1. Fork del repositorio en GitHub
# 2. Clonar tu fork
git clone https://github.com/TU-USERNAME/qbtc-unified.git
cd qbtc-unified

# 3. Agregar upstream
git remote add upstream https://github.com/vigoferrel/qbtc-unified.git

# 4. Instalar dependencias
npm install

# 5. Copiar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus valores de testing

# 6. Ejecutar tests básicos
npm run test --if-present

# 7. Iniciar servicios de desarrollo
npm run dev --if-present
```

### **Verificación de Setup**
```bash
# Verificar que todo funciona
node --version  # Debe ser v18+
npm --version   # Debe ser v8+

# Test de servicios críticos
node scripts/validate-step1.cjs
node scripts/system-health.cjs
```

---

## 🔄 **Proceso de Desarrollo**

### **Workflow Git**
```bash
# 1. Sincronizar con upstream
git fetch upstream
git checkout master
git merge upstream/master

# 2. Crear feature branch
git checkout -b feature/quantum-improvement-name

# 3. Desarrollar con commits frecuentes
git add .
git commit -m "feat: add quantum oscillator enhancement"

# 4. Push a tu fork
git push origin feature/quantum-improvement-name

# 5. Crear Pull Request en GitHub
```

### **Naming Conventions**

#### **Branches**
- `feature/quantum-engine-optimization` - Mejoras al Quantum Engine
- `feature/metaconsciencia-llm-integration` - MetaConsciencia improvements
- `bugfix/portfolio-allocation-fix` - Portfolio Manager fixes
- `enhancement/guardian-protection-rules` - Guardian enhancements
- `docs/api-documentation-update` - Documentación

#### **Commits (Conventional Commits)**
```bash
# Tipos de commit específicos para QBTC
feat: nueva funcionalidad de trading
fix: corrección de bug crítico
perf: mejora de performance en trading
security: mejora de seguridad
trading: nueva estrategia o algoritmo
quantum: mejoras al motor cuántico
ai: mejoras a MetaConsciencia/IA
docs: documentación

# Ejemplos
git commit -m "feat: add RSI quantum oscillator to trading engine"
git commit -m "fix: resolve portfolio allocation race condition"
git commit -m "perf: optimize MetaConsciencia decision latency"
git commit -m "security: enhance API key validation"
```

---

## 📏 **Standards de Código**

### **JavaScript/Node.js**
```javascript
// ✅ Bueno
const TradingEngine = {
  async executeQuantumDecision(signal, portfolioContext) {
    try {
      const result = await this.processSignal(signal);
      return {
        success: true,
        executionTime: Date.now(),
        result
      };
    } catch (error) {
      this.logger.error('Quantum decision failed', { error, signal });
      throw error;
    }
  }
};

// ❌ Malo
const executeDecision = async (signal) => {
  const result = await processSignal(signal);
  return result;
};
```

### **Configuration Files**
```javascript
// ✅ Bueno - ecosystem.config.cjs
module.exports = {
  apps: [{
    name: 'qbtc-quantum-engine',
    script: './quantum-engine-server.cjs',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'development',
      PORT: 14105
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 14105
    },
    // Configuración específica para trading
    max_memory_restart: '500M',
    restart_delay: 4000,
    error_file: './logs/quantum-engine-error.log',
    out_file: './logs/quantum-engine-out.log'
  }]
};
```

### **Error Handling & Logging**
```javascript
// ✅ Bueno
try {
  const tradingResult = await quantumEngine.execute(signal);
  logger.info('Trading execution successful', {
    signalId: signal.id,
    profit: tradingResult.profit,
    executionTime: tradingResult.duration
  });
} catch (error) {
  logger.error('Trading execution failed', {
    signalId: signal.id,
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
  
  // Activar Guardian en caso de error crítico
  await guardianSystem.handleTradingError(error, signal);
}
```

---

## 🔍 **Proceso de Pull Request**

### **Antes de crear el PR**
```bash
# 1. Asegúrate de que todos los tests pasen
npm run test --if-present

# 2. Verifica servicios críticos
node scripts/system-health.cjs

# 3. Verifica configuración PM2
pm2 validate ecosystem.config.cjs

# 4. Test de integración básica
node scripts/test-minimal.cjs
```

### **Plantilla de PR**
```markdown
## 📝 Descripción
Descripción clara de los cambios en el ecosistema QBTC-UNIFIED.

## 🧩 Componente Afectado
- [ ] MetaConsciencia (IA/LLM)
- [ ] Sistema Guardian (Protección)
- [ ] Portfolio Manager (Trading)
- [ ] Quantum Engine (Core)
- [ ] Risk Manager (Gestión Riesgos)
- [ ] Metrics System (Observabilidad)
- [ ] Scripts/Automatización
- [ ] Documentación

## 🔧 Tipo de Cambio
- [ ] Bug fix crítico (trading/seguridad)
- [ ] Nueva feature de trading
- [ ] Mejora de performance
- [ ] Optimización de algoritmos
- [ ] Breaking change
- [ ] Documentación

## 🧪 ¿Cómo se ha probado?
- [ ] Tests unitarios pasando
- [ ] Servicios PM2 funcionando
- [ ] Testing en entorno de desarrollo
- [ ] Validación con datos reales (si aplica)

## 📈 Impacto Esperado
Describe el impacto en performance, ROI, o estabilidad del sistema.

## 📋 Checklist
- [ ] Mi código sigue las guías de QBTC-UNIFIED
- [ ] He probado los servicios afectados
- [ ] He actualizado documentación si es necesario
- [ ] Los cambios no comprometen la seguridad
- [ ] He considerado el impacto en trading activo
```

---

## 🐛 **Reporte de Bugs**

### **Información Critical para Trading Bugs**
```markdown
**Componente Afectado:** MetaConsciencia/Guardian/Portfolio/etc.

**Severidad:**
- 🔥 Crítico - Sistema de trading no funciona
- ⚠️ Alto - Pérdidas financieras potenciales
- 📝 Medio - Funcionalidad degradada
- 🐛 Bajo - Bug cosmético

**Información del Trading Environment:**
- Exchange: Binance Futures/Spot
- Timeframe afectado
- Volumen de trading
- Configuración de riesgo

**Logs Específicos:**
- MetaConsciencia logs
- Guardian safety logs
- Portfolio allocation logs
- Error stack traces
```

---

## ✨ **Solicitud de Features**

### **Template Específico para Trading Features**
```markdown
**Tipo de Feature:**
- [ ] Nuevo algoritmo de trading
- [ ] Integración de exchange
- [ ] Mejora de IA/LLM
- [ ] Optimización de riesgo
- [ ] Dashboard/Monitoring
- [ ] API enhancement

**Impacto en Trading:**
- ROI esperado: X%
- Reducción de riesgo: X%
- Mejora de win rate: X%
- Optimización de latencia: Xms

**Casos de Uso:**
1. Como trader cuántico, quiero...
2. Para optimizar el portfolio, necesito...
3. El sistema Guardian debería...

**Consideraciones Técnicas:**
- Complejidad de implementación
- Recursos computacionales requeridos
- Impacto en servicios existentes
- Requerimientos de datos adicionales
```

---

## 🏷️ **Labels y Prioridades**

### **Labels Específicos de QBTC**
- `quantum-engine` - Mejoras al motor cuántico
- `metaconsciencia` - IA/LLM enhancements
- `guardian-system` - Protección y safety
- `portfolio-manager` - Trading y allocación
- `risk-management` - Gestión de riesgos
- `performance-critical` - Optimizaciones críticas
- `trading-strategy` - Nuevas estrategias
- `security-critical` - Seguridad crítica

### **Prioridad Comercial**
- `priority: revenue-impact` - Impacto directo en ingresos
- `priority: risk-reduction` - Reducción de riesgos
- `priority: performance` - Mejoras de performance
- `priority: compliance` - Compliance y regulaciones

---

## 📞 **Obtener Ayuda**

### **Canales de Comunicación**
- **GitHub Issues**: Para bugs y feature requests
- **GitHub Discussions**: Para preguntas técnicas
- **Email Comercial**: [vigoferrel@gmail.com](mailto:vigoferrel@gmail.com)
- **Soporte Empresarial**: Para clientes con licencia comercial

### **Recursos Útiles**
- [Documentación del Proyecto](README.md)
- [Arquitectura del Sistema](docs/) (si existe)
- [Guía de Configuración](.env.example)

---

## 🎉 **Reconocimiento**

Todos los contribuidores serán agregados al README y recibirán reconocimiento por sus contribuciones. Las contribuciones significativas que mejoren el ROI o reduzcan riesgos serán destacadas especialmente.

### **Tipos de Contribución**
- 💻 Código (algoritmos, optimizaciones)
- 📊 Trading Strategies (nuevas estrategias probadas)
- 🧠 AI/ML Improvements (MetaConsciencia)
- 🛡️ Security Enhancements (Guardian system)
- 📖 Documentación técnica
- 🔍 Testing y QA
- 💡 Ideas y análisis de mercado

---

## 💼 **Contribuciones Comerciales**

Para contribuciones que requieren acceso a datos de trading reales o configuraciones empresariales, contacta directamente a [vigoferrel@gmail.com](mailto:vigoferrel@gmail.com).

### **Oportunidades Especiales**
- Partnership en desarrollo de estrategias
- Consultoría técnica especializada
- Implementaciones custom para instituciones
- Investigación y desarrollo conjunto

---

**¡Gracias por contribuir al futuro del trading cuántico con QBTC-UNIFIED! 🚀**

---

*Guía actualizada: Septiembre 2025*  
*QBTC-UNIFIED - Ecosistema de Trading Cuántico Autogobernado*  
*© vigoferrel - Todos los derechos reservados*
