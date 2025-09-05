const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const config = require('./quantum-core/config/quantum-unified.json');

class UnifiedSystemStarter {
    constructor() {
        this.services = [];
        this.serviceStatus = new Map();
        this.retryAttempts = new Map();
        this.maxRetries = 3;
        this.restartDelay = 5000;
    }

    async startService(serviceName, command, args, dependencies = []) {
        // Check dependencies
        for (const dep of dependencies) {
            if (!this.serviceStatus.get(dep)) {
                console.log(`Waiting for dependency ${dep} before starting ${serviceName}`);
                await this.waitForDependency(dep);
            }
        }

        return new Promise((resolve, reject) => {
            console.log(`Starting ${serviceName}...`);
            
            const process = spawn('node', [command, ...args], {
                stdio: 'inherit',
                cwd: path.dirname(command)
            });

            this.services.push({ name: serviceName, process });
            
            process.on('error', (error) => {
                console.error(`Error starting ${serviceName}:`, error);
                this.serviceStatus.set(serviceName, false);
                this.handleServiceFailure(serviceName, command, args, dependencies);
                reject(error);
            });

            process.on('exit', (code) => {
                if (code !== 0) {
                    console.error(`${serviceName} exited with code ${code}`);
                    this.serviceStatus.set(serviceName, false);
                    this.handleServiceFailure(serviceName, command, args, dependencies);
                }
            });

            // Mark service as started after short delay to ensure initialization
            setTimeout(() => {
                this.serviceStatus.set(serviceName, true);
                resolve();
            }, 2000);
        });
    }

    async waitForDependency(dependencyName, timeout = 30000) {
        const startTime = Date.now();
        while (!this.serviceStatus.get(dependencyName)) {
            if (Date.now() - startTime > timeout) {
                throw new Error(`Timeout waiting for dependency ${dependencyName}`);
            }
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    async handleServiceFailure(serviceName, command, args, dependencies) {
        const attempts = this.retryAttempts.get(serviceName) || 0;
        if (attempts < this.maxRetries) {
            console.log(`Retrying ${serviceName} (Attempt ${attempts + 1}/${this.maxRetries})`);
            this.retryAttempts.set(serviceName, attempts + 1);
            await new Promise(resolve => setTimeout(resolve, this.restartDelay));
            await this.startService(serviceName, command, args, dependencies);
        } else {
            console.error(`${serviceName} failed after ${this.maxRetries} attempts. Stopping system.`);
            this.stopAll();
        }
    }

    stopAll() {
        console.log('Stopping all services...');
        for (const service of this.services) {
            if (service.process) {
                service.process.kill();
            }
        }
        process.exit(1);
    }

    async startAll() {
        try {
            // 1. Start Core Quantum Services
            await this.startService(
                'UnifiedHttpServer',
                path.join(__dirname, 'quantum-core', 'UnifiedHttpServer.js'),
                [JSON.stringify(config)]
            );

            await this.startService(
                'QuantumUnifiedCore',
                path.join(__dirname, 'quantum-core', 'QuantumUnifiedCore.js'),
                [JSON.stringify(config)],
                ['UnifiedHttpServer']
            );

            // 2. Start Market Data & Monitoring Services
            await this.startService(
                'UniversalSymbolMonitor',
                path.join(__dirname, 'quantum-core', 'UniversalSymbolMonitor.js'),
                [JSON.stringify(config)],
                ['QuantumUnifiedCore']
            );

            await this.startService(
                'QuantumMonitoring',
                path.join(__dirname, 'quantum-core', 'QuantumMonitoring.js'),
                [JSON.stringify(config)],
                ['UniversalSymbolMonitor']
            );

            // 3. Start Trading & Market Making Services
            await this.startService(
                'QuantumMarketMaker',
                path.join(__dirname, 'quantum-core', 'QuantumMarketMaker.js'),
                [JSON.stringify(config)],
                ['QuantumUnifiedCore', 'UniversalSymbolMonitor']
            );

            // 4. Start Leonardo Consciousness with different configurations
            const leonardoConfigs = ['Conservative', 'Balanced', 'Aggressive', 'BigBang'];
            for (const config of leonardoConfigs) {
                await this.startService(
                    `LeonardoConsciousness-${config}`,
                    path.join(__dirname, 'leonardo-consciousness', 'start-leonardo.js'),
                    [config],
                    ['QuantumMarketMaker', 'QuantumMonitoring']
                );
            }

            console.log('All services started successfully!');
            
            // Setup graceful shutdown
            process.on('SIGINT', () => this.stopAll());
            process.on('SIGTERM', () => this.stopAll());

        } catch (error) {
            console.error('Error starting services:', error);
            this.stopAll();
        }
    }
}

// Start the system
const starter = new UnifiedSystemStarter();
starter.startAll().catch(console.error);
