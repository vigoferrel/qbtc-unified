const http = require('http');
const net = require('net');
const fs = require('fs');
const path = require('path');

class QuantumHealthChecker {
    constructor(config = null) {
        this.config = config;
        this.baseDir = process.cwd();
    }

    checkPort(port) {
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

    verifyHttpEndpoint(port, path = '/health', timeout = 5000) {
        return new Promise((resolve) => {
            const req = http.get(`http://localhost:${port}${path}`, {
                timeout: timeout,
                headers: {
                    'Accept': 'application/json'
                }
            });

            let timer = setTimeout(() => {
                req.destroy();
                resolve(false);
            }, timeout);

            req.on('response', (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    clearTimeout(timer);
                    try {
                        const health = JSON.parse(data);
                        resolve(health.status === 'ok' || health.status === 'running');
                    } catch {
                        resolve(false);
                    }
                });
            });

            req.on('error', () => {
                clearTimeout(timer);
                resolve(false);
            });
        });
    }

    verifyFile(file) {
        try {
            fs.accessSync(file, fs.constants.R_OK);
            return true;
        } catch (e) {
            return false;
        }
    }

    verifyDirectory(dir) {
        try {
            fs.accessSync(dir, fs.constants.R_OK | fs.constants.W_OK);
            return true;
        } catch (e) {
            return false;
        }
    }

    verifyWritePermissions() {
        const testFile = path.join(this.baseDir, '.write-test');
        try {
            fs.writeFileSync(testFile, 'test');
            fs.unlinkSync(testFile);
            return true;
        } catch (e) {
            return false;
        }
    }

    async checkSystem() {
        console.log('🏥 Verificando estado del sistema...');

        // 1. Verificar puertos críticos
        console.log('\n🔍 Verificando puertos...');
        const ports = [18020, 18021, 18022, 18023];
        for (const port of ports) {
            const available = await this.checkPort(port);
            console.log(`${available ? '✅' : '❌'} Puerto ${port}: ${available ? 'disponible' : 'en uso'}`);
            if (!available) {
                return false;
            }
        }

        // 2. Verificar directorios críticos
        console.log('\n🔍 Verificando directorios...');
        const dirs = [
            path.join(this.baseDir, 'quantum-core'),
            path.join(this.baseDir, 'leonardo-consciousness'),
            path.join(this.baseDir, 'scripts')
        ];
        
        for (const dir of dirs) {
            const exists = this.verifyDirectory(dir);
            console.log(`${exists ? '✅' : '❌'} Directorio ${path.basename(dir)}: ${exists ? 'accesible' : 'no encontrado'}`);
            if (!exists) {
                return false;
            }
        }

        // 3. Verificar archivos críticos
        console.log('\n🔍 Verificando archivos...');
        const files = [
            path.join(this.baseDir, 'quantum-core', 'UnifiedHttpServer.js'),
            path.join(this.baseDir, 'quantum-core', 'QuantumUnifiedCore.js'),
            path.join(this.baseDir, 'quantum-core', 'config', 'quantum-unified.json')
        ];

        for (const file of files) {
            const exists = this.verifyFile(file);
            console.log(`${exists ? '✅' : '❌'} Archivo ${path.basename(file)}: ${exists ? 'encontrado' : 'faltante'}`);
            if (!exists) {
                return false;
            }
        }

        // 4. Verificar dependencias
        console.log('\n🔍 Verificando dependencias...');
        const deps = ['express', 'ws'];
        for (const dep of deps) {
            try {
                require(dep);
                console.log(`✅ ${dep}: instalado`);
            } catch (e) {
                console.log(`⚠️ ${dep}: no encontrado (opcional)`);
            }
        }

        // 5. Verificar permisos
        console.log('\n🔍 Verificando permisos...');
        const canWrite = this.verifyWritePermissions();
        console.log(`${canWrite ? '✅' : '❌'} Permisos de escritura: ${canWrite ? 'verificados' : 'error'}`);
        if (!canWrite) {
            return false;
        }

        console.log('\n✅ Sistema verificado y listo para iniciar');
        return true;
    }

    async monitorHealth(service) {
        try {
            const health = await this.verifyHttpEndpoint(service.port, service.healthPath || '/health');
            return {
                name: service.name,
                port: service.port,
                status: health ? 'healthy' : 'unhealthy',
                lastCheck: new Date().toISOString()
            };
        } catch (error) {
            return {
                name: service.name,
                port: service.port,
                status: 'error',
                error: error.message,
                lastCheck: new Date().toISOString()
            };
        }
    }
}

module.exports = { QuantumHealthChecker };

// Ejecutar verificación si se llama directamente
if (require.main === module) {
    const checker = new QuantumHealthChecker();
    checker.checkSystem()
        .then(ready => {
            if (ready) {
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
