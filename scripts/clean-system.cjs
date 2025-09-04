#!/usr/bin/env node

// ========================================================================
// 🧹 QUANTUM SYSTEM CLEANER
// Script para limpiar y verificar el sistema antes de iniciar
// ========================================================================

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const http = require('http');

class SystemCleaner {
    constructor() {
        this.criticalPorts = [18020, 18021, 18022, 18023];
        const baseDir = path.join(__dirname, '..');
        this.criticalFiles = [
            path.join(baseDir, 'quantum-core', 'UnifiedHttpServer.js'),
            path.join(baseDir, 'quantum-core', 'QuantumUnifiedCore.js'),
            path.join(baseDir, 'quantum-core', 'config', 'quantum-unified.json')
        ];
    }

    async killNodeProcesses() {
        return new Promise((resolve) => {
            if (process.platform === "win32") {
                exec('taskkill /F /IM node.exe', (error) => {
                    // Ignoramos errores aquí ya que puede no haber procesos
                    resolve();
                });
            } else {
                exec('pkill -f node', (error) => {
                    resolve();
                });
            }
        });
    }

    async checkPort(port) {
        return new Promise((resolve) => {
            const server = http.createServer();
            server.on('error', () => {
                resolve(false);
            });
            server.on('listening', () => {
                server.close();
                resolve(true);
            });
            server.listen(port);
        });
    }

    async verifyPorts() {
        console.log('🔍 Verificando puertos...');
        for (const port of this.criticalPorts) {
            const available = await this.checkPort(port);
            if (!available) {
                console.log(`❌ Puerto ${port} no está disponible`);
                return false;
            }
            console.log(`✅ Puerto ${port} disponible`);
        }
        return true;
    }

    async verifyFiles() {
        console.log('🔍 Verificando archivos críticos...');
        for (const file of this.criticalFiles) {
            try {
                await fs.access(file);
                console.log(`✅ Archivo encontrado: ${file}`);
            } catch (error) {
                console.log(`❌ Archivo faltante: ${file}`);
                return false;
            }
        }
        return true;
    }

    async verifyPermissions() {
        console.log('🔍 Verificando permisos...');
        const testFile = path.join(__dirname, 'test-write.tmp');
        
        try {
            await fs.writeFile(testFile, 'test');
            await fs.unlink(testFile);
            console.log('✅ Permisos de escritura verificados');
            return true;
        } catch (error) {
            console.log('❌ Error de permisos:', error.message);
            return false;
        }
    }

    async clean() {
        console.log('🧹 Iniciando limpieza del sistema...');

        // 1. Matar procesos node existentes
        await this.killNodeProcesses();
        console.log('✅ Procesos Node.js terminados');

        // Esperar un momento para asegurar que los procesos se liberaron
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 2. Verificar puertos
        const portsOk = await this.verifyPorts();
        if (!portsOk) {
            throw new Error('Verificación de puertos falló');
        }

        // 3. Verificar archivos
        const filesOk = await this.verifyFiles();
        if (!filesOk) {
            throw new Error('Verificación de archivos falló');
        }

        // 4. Verificar permisos
        const permissionsOk = await this.verifyPermissions();
        if (!permissionsOk) {
            throw new Error('Verificación de permisos falló');
        }

        console.log('✨ Sistema limpio y verificado. Listo para iniciar.');
        return true;
    }
}

// Si se ejecuta directamente, limpiar el sistema
if (require.main === module) {
    const cleaner = new SystemCleaner();
    cleaner.clean()
        .then(() => {
            console.log('✅ Limpieza completada exitosamente');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Error durante la limpieza:', error.message);
            process.exit(1);
        });
}

module.exports = { SystemCleaner };
