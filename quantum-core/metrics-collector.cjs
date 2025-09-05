// QBTC Metrics Collector - Background Process
// Compatible con ASCII y Windows PowerShell

const fs = require('fs');
const path = require('path');
const os = require('os');

class MetricsCollector {
    constructor() {
        this.logFile = path.join(__dirname, 'logs', 'metrics.log');
        this.interval = 30 * 1000; // segundos a milisegundos
        this.startTime = Date.now();
        
        console.log('[METRICS] Collector iniciado - Intervalo: 30s');
        this.start();
    }
    
    start() {
        this.collect(); // Primera recoleccion inmediata
        this.intervalId = setInterval(() => this.collect(), this.interval);
        
        // Graceful shutdown
        process.on('SIGINT', () => this.stop());
        process.on('SIGTERM', () => this.stop());
    }
    
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            console.log('[METRICS] Collector detenido');
        }
        process.exit(0);
    }
    
    collect() {
        const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
        const metrics = this.getSystemMetrics();
        
        // Escribir metricas a archivo
        const logEntries = [
            	imestamp|SYSTEM|CPU_USAGE|percentage|,
            	imestamp|SYSTEM|MEMORY_USAGE|percentage|,
            	imestamp|SYSTEM|FREE_MEMORY|mb|,
            	imestamp|SYSTEM|UPTIME|seconds|,
            	imestamp|PROCESS|PID|number|,
            	imestamp|PROCESS|MEMORY_RSS|mb|,
            	imestamp|PROCESS|CPU_TIME|seconds|
        ].map(entry => entry.replace('timestamp', timestamp));
        
        const metricsData = [
            	imestamp|SYSTEM|CPU_USAGE|percentage|,
            	imestamp|SYSTEM|MEMORY_USAGE|percentage|,
            	imestamp|SYSTEM|FREE_MEMORY|mb|,
            	imestamp|SYSTEM|UPTIME|seconds|,
            	imestamp|PROCESS|PID|number|,
            	imestamp|PROCESS|MEMORY_RSS|mb|,
            	imestamp|PROCESS|CPU_TIME|seconds|
        ].map((template, index) => {
            const values = [
                metrics.cpuUsage.toFixed(2),
                metrics.memoryUsage.toFixed(2),
                metrics.freeMemory.toFixed(2),
                metrics.uptime.toFixed(0),
                process.pid,
                metrics.processMemory.toFixed(2),
                metrics.processCpuTime.toFixed(2)
            ];
            return template.replace('timestamp', timestamp).replace('percentage|', values[index] + '|').replace('mb|', values[index] + '|').replace('seconds|', values[index] + '|').replace('number|', values[index] + '|');
        });
        
        // Escribir al archivo de logs
        metricsData.forEach(entry => {
            fs.appendFileSync(this.logFile, entry + '\n');
        });
        
        console.log([METRICS] Recolectadas - CPU: cpu%, MEM: mem%, metrics.cpuUsage.toFixed(1), metrics.memoryUsage.toFixed(1));
    }
    
    getSystemMetrics() {
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();
        const usedMemory = totalMemory - freeMemory;
        
        return {
            cpuUsage: this.getCpuUsage(),
            memoryUsage: (usedMemory / totalMemory) * 100,
            freeMemory: freeMemory / (1024 * 1024), // MB
            uptime: os.uptime(),
            processMemory: process.memoryUsage().rss / (1024 * 1024), // MB
            processCpuTime: process.cpuUsage().user / 1000000 // segundos
        };
    }
    
    getCpuUsage() {
        // Simulacion simple de CPU usage
        const loadavg = os.loadavg();
        return loadavg[0] * 10; // Aproximacion
    }
}

new MetricsCollector();
