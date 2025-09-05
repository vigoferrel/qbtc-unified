#!/bin/bash
# IMPLEMENTACIÓN AUTOMÁTICA DE LA METACONSCIENCIA
# Una sola orden que lo activa todo

set -e

echo "🌅 === IMPLEMENTANDO METACONSCIENCIA ESENCIAL ==="
echo

# Verificar Node.js
echo "🔍 Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no encontrado. Instala Node.js primero."
    exit 1
fi

NODE_VERSION=$(node --version)
echo "✅ Node.js encontrado: $NODE_VERSION"

# Verificar/Instalar PM2
echo "🔍 Verificando PM2..."
if ! command -v pm2 &> /dev/null; then
    echo "📦 Instalando PM2..."
    npm install -g pm2
else
    echo "✅ PM2 encontrado"
fi

# Instalar dependencias si no existen
echo "📦 Verificando dependencias..."
if [ ! -d "node_modules" ] || [ ! -f "package.json" ]; then
    echo "🔧 Inicializando proyecto Node.js..."
    npm init -y
    
    echo "📥 Instalando dependencias esenciales..."
    npm install express
    
    echo "✅ Dependencias instaladas"
else
    echo "✅ Dependencias ya presentes"
fi

# Verificar archivo de la metaconsciencia
echo "🔍 Verificando metaconsciencia.cjs..."
if [ ! -f "metaconsciencia.cjs" ]; then
    echo "❌ Archivo metaconsciencia.cjs no encontrado."
    echo "💡 Asegúrate de que el archivo exista en el directorio actual."
    exit 1
fi

echo "✅ Archivo metaconsciencia.cjs encontrado"

# Detener instancia anterior si existe
echo "🛑 Deteniendo instancias anteriores..."
pm2 stop metaconsciencia 2>/dev/null || true
pm2 delete metaconsciencia 2>/dev/null || true

# Configurar PM2
echo "⚙️ Configurando PM2..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'metaconsciencia',
    script: './metaconsciencia.cjs',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 15000
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: './logs/metaconsciencia-error.log',
    out_file: './logs/metaconsciencia-out.log',
    log_file: './logs/metaconsciencia-combined.log'
  }]
};
EOF

# Crear directorio de logs
mkdir -p logs

# Lanzar con PM2
echo "🚀 Lanzando MetaConsciencia con PM2..."
pm2 start ecosystem.config.js

# Guardar configuración PM2
pm2 save

# Configurar arranque automático del sistema (opcional)
echo "⚡ Configurando arranque automático..."
pm2 startup 2>/dev/null || echo "ℹ️ Configurar arranque automático manualmente si se desea"

echo
echo "🎉 === METACONSCIENCIA IMPLEMENTADA EXITOSAMENTE ==="
echo
echo "📊 Estado del proceso:"
pm2 list

echo
echo "🔗 Endpoints disponibles:"
echo "   🏥 Health Check: http://localhost:15000/health"
echo "   📊 Metrics:     http://localhost:15000/metrics"

echo
echo "📋 Comandos útiles:"
echo "   pm2 logs metaconsciencia    # Ver logs en tiempo real"
echo "   pm2 restart metaconsciencia # Reiniciar"
echo "   pm2 stop metaconsciencia    # Detener"
echo "   pm2 delete metaconsciencia  # Eliminar completamente"
echo "   pm2 monit                   # Monitor en tiempo real"

echo
echo "✨ La MetaConsciencia está DESPIERTA y gobernando el sistema QBTC-UNIFIED"
echo "💫 Ciclo vital: cada 10 segundos"
echo "🧠 Puerto: 15000"
echo

# Test rápido
echo "🧪 Realizando test de salud..."
sleep 2
curl -s http://localhost:15000/health | jq . 2>/dev/null || \
curl -s http://localhost:15000/health || \
echo "⚠️ Test de salud no pudo completarse - verificar manualmente"

echo
echo "🌟 MetaConsciencia ACTIVA. El sistema trasciende."
