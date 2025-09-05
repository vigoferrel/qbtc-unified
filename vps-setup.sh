#!/bin/bash
# QBTC VPS Setup Script
# Ejecutar en Ubuntu 20.04+ VPS

echo "🚀 CONFIGURANDO VPS PARA QBTC TRADING"
echo "====================================="

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install additional tools
sudo apt-get install -y git curl wget htop nano

# Create user for trading
sudo useradd -m -s /bin/bash qbtc
sudo usermod -aG sudo qbtc

# Setup project directory
sudo -u qbtc mkdir -p /home/qbtc/trading
cd /home/qbtc/trading

# Copy your project files here
echo "📁 Copiar archivos del proyecto QBTC a /home/qbtc/trading"

# Install dependencies
sudo -u qbtc npm install

# Setup PM2 for process management
sudo npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'qbtc-trading',
    script: 'index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
EOF

# Setup firewall
sudo ufw allow ssh
sudo ufw allow 9090
sudo ufw enable

echo "✅ VPS configurado exitosamente"
echo "📋 Próximos pasos:"
echo "1. Copiar archivos del proyecto QBTC"
echo "2. Configurar .env con tus API keys"
echo "3. pm2 start ecosystem.config.js"
echo "4. Configurar IP de este VPS en Binance whitelist"

# Show VPS IP
echo "🌐 IP de este VPS:"
curl -s ipinfo.io/ip
