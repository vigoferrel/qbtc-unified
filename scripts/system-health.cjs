// ========================================================================
// 🏥 QUANTUM SYSTEM HEALTH CHECKER
// Verificación exhaustiva del sistema quantum unificado
// ========================================================================

const http = require('http');
const net = require('net');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class SystemHealthChecker {
    constructor(config = null) {
        this.config = config;
        this.baseDir = path.join(__dirname, '..');
        this.checkResults = new Map();
        this.maxRetries = 3;
        this.retryDelay = 2000;
    }

    async checkPort(port) {
        return new Promise((resolve) => {
            const server = net.createServer();
            
            let resolved = false;
            const timeout = setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    try { server.close(); } catch(e) {}
                    resolve(true);
                }
            }, 1000);

            server.on('error', (err) => {
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timeout);
                    resolve(err.code !== 'EADDRINUSE');
                }
            });

            server.on('listening', () => {
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timeout);
                    server.close(() => resolve(true));
                }
            });

            try {
                server.listen(port, '127.0.0.1');
            } catch (e) {
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timeout);
                    resolve(true);
                }
            }
        });
    }

    async verifyFile(filePath) {
        try {
            await fs.promises.access(filePath, fs.constants.R_OK);
            return true;
        } catch {
            return false;
        }
    }

    async verifyDirectory(dirPath) {
        try {
            await fs.promises.access(dirPath, fs.constants.R_OK | fs.constants.W_OK);
            return true;
        } catch {
            return false;
        }
    }

    async verifyHttpEndpoint(port, healthPath = '/health', timeout = 5000) {
        return new Promise((resolve) => {
            const tryPaths = ['/api/health', healthPath, '/'];
            let idx = 0;

            const tryNext = () => {
                if (idx >= tryPaths.length) return resolve(false);
                const p = tryPaths[idx++];

                const req = http.get(`http://localhost:${port}${p}`, {
                    timeout,
                    headers: { Accept: 'application/json' }
                }, (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => {
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            try {
                                const json = JSON.parse(data);
                                if (json && (json.status === 'ok' || json.status === 'running' || json.healthy === true)) {
                                    return resolve(true);
                                }
                            } catch {}
                            // 200 OK without strict payload is considered healthy for generic endpoints
                            return resolve(true);
                        }
                        tryNext();
                    });
                });

                req.on('error', tryNext);
                req.on('timeout', () => { req.destroy(); tryNext(); });
            };

            tryNext();
        });
    }

    async checkSystem() {
        console.log('🏥 Verificando estado del sistema...');
        const results = {
            ports: {},
            files: {},
            directories: {},
            dependencies: {},
            status: 'checking'
        };
        let hadError = false;

        // 1. Verificar puertos críticos (preflight y runtime-friendly)
        console.log('\n🔍 Verificando puertos...');
        const env = process.env;
        const candidatePorts = Array.from(new Set([
            parseInt(env.LEONARDO_PORT, 10),
            parseInt(env.HTTP_PORT, 10),
            parseInt(env.METRICS_PORT, 10),
            3003, // Backend API default
            8080, // Frontend default
            9100, // Métricas default
            18020, 18021, 18022 // Monousuario defaults
        ].filter(p => Number.isFinite(p))));

        for (const port of candidatePorts) {
            const available = await this.checkPort(port);
            results.ports[port] = { available };
            const state = available ? 'disponible (preflight)' : 'ocupado (servicio activo)';
            console.log(`${available ? '✅' : '🟡'} Puerto ${port}: ${state}`);
        }

        // 2. Verificar directorios críticos
        console.log('\n🔍 Verificando directorios...');
        const dirs = [
            path.join(this.baseDir, 'qbtc-core'),
            path.join(this.baseDir, 'frontend-unified'),
            path.join(this.baseDir, 'scripts'),
            path.join(this.baseDir, 'quantum-core')
        ];
        
        for (const dir of dirs) {
            const exists = await this.verifyDirectory(dir);
            results.directories[dir] = exists;
            console.log(`${exists ? '✅' : '❌'} Directorio ${path.basename(dir)}: ${exists ? 'accesible' : 'no encontrado'}`);
            if (!exists) {
                hadError = true;
            }
        }

        // 3. Verificar archivos críticos
        console.log('\n🔍 Verificando archivos...');
        const files = [
            path.join(this.baseDir, 'qbtc-core', 'server', 'QBTCServer.js'),
            path.join(this.baseDir, 'frontend-unified', 'simple-frontend-server.js'),
            path.join(this.baseDir, 'MASTER-ANTICONFLICT-LAUNCHER.js')
        ];
        
        for (const file of files) {
            const exists = await this.verifyFile(file);
            results.files[file] = exists;
            console.log(`${exists ? '✅' : '❌'} Archivo ${path.basename(file)}: ${exists ? 'encontrado' : 'faltante'}`);
            if (!exists) {
                hadError = true;
            }
        }

        // 4. Verificar dependencias
        console.log('\n🔍 Verificando dependencias...');
        const dependencies = ['express', 'ws'];
        for (const dep of dependencies) {
            try {
                require(dep);
                results.dependencies[dep] = true;
                console.log(`✅ ${dep}: instalado`);
            } catch (e) {
                results.dependencies[dep] = false;
                console.log(`⚠️ ${dep}: no encontrado (opcional)`);
            }
        }

        // 5. Verificar permisos de escritura
        console.log('\n🔍 Verificando permisos...');
        const logsDir = path.join(this.baseDir, 'logs');
        try {
            await fs.promises.mkdir(logsDir, { recursive: true });
            const testFile = path.join(logsDir, '.health-write');
            await fs.promises.writeFile(testFile, 'test');
            await fs.promises.unlink(testFile);
            console.log('✅ Permisos de escritura: verificados');
        } catch (e) {
            console.log('❌ Error de permisos de escritura');
            hadError = true;
        }

        results.status = hadError ? 'error' : 'ready';
        console.log(hadError ? '\n❌ Sistema con problemas. Revise los ítems marcados.' : '\n✅ Sistema verificado y listo para iniciar');
        return results;
    }

    async monitorHealth(port, healthPath = '/health') {
        try {
            const health = await this.verifyHttpEndpoint(port, healthPath);
            return {
                port,
                status: health ? 'healthy' : 'unhealthy',
                lastCheck: new Date().toISOString()
            };
        } catch (error) {
            return {
                port,
                status: 'error',
                error: error.message,
                lastCheck: new Date().toISOString()
            };
        }
    }
}

// Export class
module.exports = { SystemHealthChecker };

// Ejecutar verificación si se llama directamente
if (require.main === module) {
    const checker = new SystemHealthChecker();
    checker.checkSystem()
        .then(results => {
            if (results.status === 'ready') {
                console.log('\n✨ Sistema listo para iniciar');
                process.exit(0);
            } else {
                console.error('\n❌ Sistema no cumple requisitos mínimos');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('\n❌ Error durante verificación:', error.message);
            process.exit(1);
        });
}
