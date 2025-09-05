#!/usr/bin/env node

/**
 * QBTC Proxy Monitor Dashboard
 * Dashboard de monitoreo para todos los sistemas de proxy y VPN
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno
require('dotenv').config({ path: path.join(__dirname, '.env') });

class QBTCProxyMonitor {
    constructor() {
        this.port = process.env.MONITOR_PORT || 9099;
        this.systems = {
            masterLauncher: { status: 'unknown', lastCheck: null, details: {} },
            socks5Proxy: { status: 'unknown', lastCheck: null, details: {} },
            vpnConnector: { status: 'unknown', lastCheck: null, details: {} },
            httpProxy: { status: 'unknown', lastCheck: null, details: {} },
            smartProxy: { status: 'unknown', lastCheck: null, details: {} },
            directConnection: { status: 'unknown', lastCheck: null, details: {} }
        };

        this.server = null;
        console.log('📊 QBTC Proxy Monitor inicializando...');
    }

    /**
     * Verificar estado de un sistema
     */
    async checkSystemStatus(systemName, scriptPath) {
        return new Promise((resolve) => {
            const { spawn } = require('child_process');

            console.log(`🔍 Verificando ${systemName}...`);

            const child = spawn('node', [scriptPath, '--status'], {
                cwd: __dirname,
                stdio: ['pipe', 'pipe', 'pipe'],
                timeout: 10000
            });

            let output = '';
            let errorOutput = '';

            child.stdout.on('data', (data) => {
                output += data.toString();
            });

            child.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            child.on('close', (code) => {
                const status = code === 0 ? 'online' : 'offline';
                const details = {
                    exitCode: code,
                    output: output.trim(),
                    error: errorOutput.trim(),
                    lastCheck: new Date().toISOString()
                };

                console.log(`   ${systemName}: ${status.toUpperCase()}`);
                resolve({ status, details });
            });

            child.on('error', () => {
                resolve({
                    status: 'error',
                    details: {
                        error: 'Process failed to start',
                        lastCheck: new Date().toISOString()
                    }
                });
            });

            // Timeout después de 10 segundos
            setTimeout(() => {
                child.kill();
                resolve({
                    status: 'timeout',
                    details: {
                        error: 'Check timeout',
                        lastCheck: new Date().toISOString()
                    }
                });
            }, 10000);
        });
    }

    /**
     * Verificar todos los sistemas
     */
    async checkAllSystems() {
        console.log('🔄 Verificando estado de todos los sistemas...');

        const checks = [
            { name: 'masterLauncher', script: 'qbtc-master-launcher.cjs' },
            { name: 'socks5Proxy', script: 'qbtc-socks5-proxy.cjs' },
            { name: 'vpnConnector', script: 'qbtc-vpn-connector.cjs' },
            { name: 'httpProxy', script: 'qbtc-with-correct-ip.cjs' },
            { name: 'smartProxy', script: 'qbtc-smart-proxy.cjs' },
            { name: 'directConnection', script: 'system-integrator.cjs' }
        ];

        for (const check of checks) {
            try {
                const result = await this.checkSystemStatus(check.name, check.script);
                this.systems[check.name] = {
                    status: result.status,
                    lastCheck: new Date().toISOString(),
                    details: result.details
                };
            } catch (error) {
                this.systems[check.name] = {
                    status: 'error',
                    lastCheck: new Date().toISOString(),
                    details: { error: error.message }
                };
            }
        }

        console.log('✅ Verificación completa');
    }

    /**
     * Obtener estado general del sistema
     */
    getOverallStatus() {
        const systems = Object.values(this.systems);
        const onlineCount = systems.filter(s => s.status === 'online').length;
        const totalCount = systems.length;

        if (onlineCount === totalCount) return 'all_online';
        if (onlineCount > 0) return 'partial';
        return 'all_offline';
    }

    /**
     * Generar HTML del dashboard
     */
    generateDashboardHTML() {
        const overallStatus = this.getOverallStatus();
        const statusColors = {
            online: '#10b981',
            offline: '#ef4444',
            error: '#f59e0b',
            timeout: '#6b7280',
            unknown: '#6b7280'
        };

        const overallColor = overallStatus === 'all_online' ? '#10b981' :
                           overallStatus === 'partial' ? '#f59e0b' : '#ef4444';

        const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QBTC Proxy Monitor Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
            min-height: 100vh;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            color: white;
        }

        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .overall-status {
            background: rgba(255,255,255,0.1);
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 30px;
            text-align: center;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
        }

        .status-badge {
            display: inline-block;
            padding: 10px 20px;
            border-radius: 25px;
            color: white;
            font-weight: bold;
            font-size: 1.1rem;
        }

        .systems-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .system-card {
            background: rgba(255,255,255,0.95);
            border-radius: 15px;
            padding: 20px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
        }

        .system-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }

        .system-name {
            font-size: 1.3rem;
            font-weight: bold;
            color: #333;
        }

        .system-status {
            padding: 5px 12px;
            border-radius: 20px;
            color: white;
            font-size: 0.9rem;
            font-weight: bold;
        }

        .system-details {
            font-size: 0.9rem;
            color: #666;
            line-height: 1.4;
        }

        .system-details div {
            margin-bottom: 5px;
        }

        .actions {
            margin-top: 20px;
            text-align: center;
        }

        .btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 1rem;
            font-weight: bold;
            margin: 0 10px;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }

        .btn:active {
            transform: translateY(0);
        }

        .refresh-btn {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .footer {
            text-align: center;
            color: rgba(255,255,255,0.8);
            margin-top: 30px;
            font-size: 0.9rem;
        }

        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }

        .pulse {
            animation: pulse 2s infinite;
        }

        .last-update {
            font-size: 0.8rem;
            color: #999;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 QBTC Proxy Monitor Dashboard</h1>
            <p>Sistema de Monitoreo de Proxies y VPN</p>
        </div>

        <div class="overall-status">
            <h2>Estado General del Sistema</h2>
            <div class="status-badge" style="background-color: ${overallColor};">
                ${overallStatus === 'all_online' ? '✅ TODOS EN LÍNEA' :
                  overallStatus === 'partial' ? '⚠️ ESTADO PARCIAL' :
                  '❌ SISTEMAS FUERA DE LÍNEA'}
            </div>
        </div>

        <div class="systems-grid">
            ${Object.entries(this.systems).map(([key, system]) => `
                <div class="system-card">
                    <div class="system-header">
                        <div class="system-name">${this.formatSystemName(key)}</div>
                        <div class="system-status" style="background-color: ${statusColors[system.status] || '#6b7280'};">
                            ${system.status.toUpperCase()}
                        </div>
                    </div>
                    <div class="system-details">
                        <div><strong>Última verificación:</strong> ${system.lastCheck ? new Date(system.lastCheck).toLocaleString() : 'Nunca'}</div>
                        ${system.details.exitCode !== undefined ? `<div><strong>Código de salida:</strong> ${system.details.exitCode}</div>` : ''}
                        ${system.details.error ? `<div><strong>Error:</strong> ${system.details.error}</div>` : ''}
                        ${system.details.output ? `<div><strong>Output:</strong> ${system.details.output.substring(0, 100)}${system.details.output.length > 100 ? '...' : ''}</div>` : ''}
                    </div>
                </div>
            `).join('')}
        </div>

        <div class="actions">
            <button class="btn refresh-btn" onclick="location.reload()">🔄 Actualizar Estado</button>
            <a href="/api/status" class="btn">📊 API Status</a>
            <a href="/api/systems" class="btn">🔧 Detalles Completos</a>
        </div>

        <div class="footer">
            <p>QBTC Quantum Trading System - Proxy Monitor v1.0</p>
            <p class="last-update">Última actualización: ${new Date().toLocaleString()}</p>
        </div>
    </div>

    <script>
        // Auto-refresh cada 30 segundos
        setTimeout(() => {
            location.reload();
        }, 30000);

        // Añadir clase pulse a sistemas offline
        document.addEventListener('DOMContentLoaded', function() {
            const offlineSystems = document.querySelectorAll('.system-status');
            offlineSystems.forEach(status => {
                if (status.textContent.includes('OFFLINE') || status.textContent.includes('ERROR')) {
                    status.classList.add('pulse');
                }
            });
        });
    </script>
</body>
</html>`;

        return html;
    }

    /**
     * Formatear nombre del sistema para display
     */
    formatSystemName(key) {
        const names = {
            masterLauncher: '🎛️ Master Launcher',
            socks5Proxy: '🔒 SOCKS5 Proxy',
            vpnConnector: '🛡️ VPN Connector',
            httpProxy: '🌐 HTTP Proxy',
            smartProxy: '🧠 Smart Proxy',
            directConnection: '🔗 Conexión Directa'
        };
        return names[key] || key;
    }

    /**
     * Iniciar servidor de monitoreo
     */
    startServer() {
        this.server = http.createServer(async (req, res) => {
            // Headers CORS
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

            const url = req.url;

            if (url === '/' || url === '/dashboard') {
                // Verificar sistemas antes de mostrar dashboard
                await this.checkAllSystems();

                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(this.generateDashboardHTML());

            } else if (url === '/api/status') {
                await this.checkAllSystems();

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    overallStatus: this.getOverallStatus(),
                    systems: this.systems,
                    timestamp: new Date().toISOString()
                }, null, 2));

            } else if (url === '/api/systems') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(this.systems, null, 2));

            } else if (url === '/api/refresh') {
                await this.checkAllSystems();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'Systems refreshed' }));

            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
            }
        });

        this.server.listen(this.port, () => {
            console.log(`📊 QBTC Proxy Monitor Dashboard iniciado`);
            console.log(`🌐 Dashboard disponible en: http://localhost:${this.port}`);
            console.log(`🔗 API Status: http://localhost:${this.port}/api/status`);
            console.log(`🔄 Auto-refresh: Cada 30 segundos`);
            console.log(`\n💡 Presiona Ctrl+C para detener el monitor`);
        });
    }

    /**
     * Detener servidor
     */
    stopServer() {
        if (this.server) {
            this.server.close();
            console.log('🛑 Proxy Monitor detenido');
        }
    }
}

// Función para ejecutar verificación única
async function runQuickCheck() {
    const monitor = new QBTCProxyMonitor();
    await monitor.checkAllSystems();

    console.log('\n📊 RESULTADO DE VERIFICACIÓN:');
    console.log('==============================');

    Object.entries(monitor.systems).forEach(([key, system]) => {
        const status = system.status.toUpperCase();
        const color = system.status === 'online' ? '✅' :
                     system.status === 'offline' ? '❌' :
                     system.status === 'error' ? '⚠️' : '❓';
        console.log(`${color} ${monitor.formatSystemName(key)}: ${status}`);
    });

    console.log('\n📈 Estado General:', monitor.getOverallStatus().toUpperCase());
}

// Si se ejecuta directamente
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.includes('--dashboard') || args.includes('-d')) {
        // Modo dashboard (servidor web)
        const monitor = new QBTCProxyMonitor();
        monitor.startServer();
    } else if (args.includes('--check') || args.includes('-c')) {
        // Modo verificación rápida
        runQuickCheck();
    } else if (args.includes('--status') || args.includes('-s')) {
        // Modo status para otros scripts
        const monitor = new QBTCProxyMonitor();
        monitor.checkAllSystems().then(() => {
            console.log(JSON.stringify(monitor.systems));
        });
    } else {
        // Mostrar ayuda
        console.log('📊 QBTC Proxy Monitor');
        console.log('====================');
        console.log('Uso:');
        console.log('  node qbtc-proxy-monitor.cjs --dashboard    # Iniciar dashboard web');
        console.log('  node qbtc-proxy-monitor.cjs --check        # Verificación rápida');
        console.log('  node qbtc-proxy-monitor.cjs --status       # Status JSON para scripts');
        console.log('  node qbtc-proxy-monitor.cjs                # Esta ayuda');
        console.log('');
        console.log('Dashboard incluye:');
        console.log('  🌐 Web Dashboard: http://localhost:9099');
        console.log('  🔄 Auto-refresh cada 30 segundos');
        console.log('  📊 API endpoints para integración');
        process.exit(0);
    }

    // Manejar señales de terminación
    process.on('SIGINT', () => {
        console.log('\n🔄 Proxy Monitor detenido por SIGINT');
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('\n🔄 Proxy Monitor detenido por SIGTERM');
        process.exit(0);
    });
}

// Exportar la clase
module.exports = { QBTCProxyMonitor };