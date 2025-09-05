// =====================================================================
// 🎺 WINDOWS BACKGROUND ORCHESTRATOR - ORQUESTACION EN SEGUNDO PLANO
// Sistema completo de gestion de procesos para Windows/PowerShell
// Lanza y supervisa analisis, respuesta, metricas usando PowerShell Jobs
// =====================================================================

const { spawn, exec } = require('child_process');
const EventEmitter = require('events');
const path = require('path');
const fs = require('fs').promises;
const { performance } = require('perf_hooks');

class WindowsBackgroundOrchestrator extends EventEmitter {
    constructor(config = {}) {
        super();
        
        // Configuracion optimizada para Windows
        this.config = {
            workingDirectory: config.workingDirectory || 'C:\\Users\\DELL\\Desktop\\QBTC-UNIFIED\\quantum-core',
            powerShellPath: config.powerShellPath || 'powershell.exe',
            maxConcurrentJobs: config.maxConcurrentJobs || 10,
            jobTimeout: config.jobTimeout || 300000, // 5 minutos
            restartFailedJobs: config.restartFailedJobs || true,
            logDirectory: config.logDirectory || 'C:\\QBTC-LOGS\\orchestration',
            enableJobMonitoring: config.enableJobMonitoring !== false,
            processPriority: config.processPriority || 'Normal', // Normal, High, Low
            enableMemoryLimits: config.enableMemoryLimits || true,
            maxMemoryMB: config.maxMemoryMB || 1024,
            enablePerformanceCounters: config.enablePerformanceCounters || true,
            ...config
        };
        
        // Estado del orquestador
        this.orchestratorState = {
            isRunning: false,
            startTime: null,
            totalJobsLaunched: 0,
            activeJobs: new Map(),
            completedJobs: new Map(),
            failedJobs: new Map(),
            performanceMetrics: {
                avgJobDuration: 0,
                totalCpuTime: 0,
                totalMemoryUsed: 0,
                jobSuccessRate: 0
            }
        };
        
        // Configuracion de procesos a ejecutar
        this.processConfigurations = {
            quantumAnalysis: {
                name: 'Quantum Analysis Engine',
                command: 'node',
                args: ['QuantumLeverageEngine.js'],
                type: 'continuous',
                priority: 'High',
                memoryLimit: 512,
                restartOnFailure: true,
                dependsOn: [],
                environment: { NODE_ENV: 'production' }
            },
            metricsCollector: {
                name: 'Metrics Collection System',
                command: 'node',
                args: ['monitoring/QuantumMetricsCollector.js'],
                type: 'continuous',
                priority: 'Normal',
                memoryLimit: 256,
                restartOnFailure: true,
                dependsOn: [],
                environment: { METRICS_MODE: 'background' }
            },
            responseEngine: {
                name: 'Response Processing Engine',
                command: 'node',
                args: ['QuantumProfitMaximizer.js'],
                type: 'scheduled',
                schedule: '*/30 * * * * *', // Cada 30 segundos
                priority: 'High',
                memoryLimit: 768,
                restartOnFailure: true,
                dependsOn: ['quantumAnalysis'],
                environment: { RESPONSE_MODE: 'optimized' }
            },
            dataProcessor: {
                name: 'Market Data Processor',
                command: 'node',
                args: ['UniversalSymbolMonitor.js'],
                type: 'continuous',
                priority: 'Normal',
                memoryLimit: 384,
                restartOnFailure: true,
                dependsOn: [],
                environment: { DATA_PROCESSING: 'realtime' }
            },
            correlationAnalyzer: {
                name: 'Correlation Analysis Engine',
                command: 'node',
                args: ['UniversalCorrelationAnalyzer.js'],
                type: 'scheduled',
                schedule: '0 */5 * * * *', // Cada 5 minutos
                priority: 'Low',
                memoryLimit: 512,
                restartOnFailure: false,
                dependsOn: ['dataProcessor'],
                environment: { CORRELATION_MODE: 'deep_analysis' }
            }
        };
        
        // PowerShell jobs manager
        this.powerShellJobs = new Map();
        this.jobMonitors = new Map();
        this.scheduledTasks = new Map();
        
        console.log('[ORCHESTRATOR] 🎺 Windows Background Orchestrator inicializado');
        console.log(`[ORCHESTRATOR] 📁 Directorio de trabajo: ${this.config.workingDirectory}`);
        console.log(`[ORCHESTRATOR] ⚡ PowerShell: ${this.config.powerShellPath}`);
        console.log(`[ORCHESTRATOR] 🔢 Max jobs concurrentes: ${this.config.maxConcurrentJobs}`);
    }
    
    // ================================================================
    // 🚀 INICIALIZACION Y ARRANQUE DEL ORQUESTADOR
    // ================================================================
    
    async initialize() {
        try {
            console.log('[ORCHESTRATOR] 🔄 Inicializando orquestador de procesos...');
            
            // Verificar entorno Windows
            await this.verifyWindowsEnvironment();
            
            // Crear directorios necesarios
            await this.ensureDirectories();
            
            // Configurar PowerShell execution policy si es necesario
            await this.configurePowerShellEnvironment();
            
            // Inicializar monitoreo de jobs
            if (this.config.enableJobMonitoring) {
                await this.initializeJobMonitoring();
            }
            
            // Preparar scripts de PowerShell
            await this.preparePowerShellScripts();
            
            console.log('[ORCHESTRATOR] ✅ Orquestador inicializado correctamente');
            return true;
            
        } catch (error) {
            console.error('[ORCHESTRATOR] ❌ Error inicializando orquestador:', error.message);
            return false;
        }
    }
    
    async verifyWindowsEnvironment() {
        if (process.platform !== 'win32') {
            throw new Error('Este orquestador está optimizado para Windows');
        }
        
        // Verificar que PowerShell esté disponible
        return new Promise((resolve, reject) => {
            exec('powershell.exe -Command "Get-Host"', (error, stdout, stderr) => {
                if (error) {
                    reject(new Error('PowerShell no está disponible en el sistema'));
                } else {
                    console.log('[ORCHESTRATOR] ✅ PowerShell verificado');
                    resolve(true);
                }
            });
        });
    }
    
    async ensureDirectories() {
        const directories = [
            this.config.logDirectory,
            path.join(this.config.logDirectory, 'jobs'),
            path.join(this.config.logDirectory, 'performance'),
            path.join(this.config.logDirectory, 'scripts'),
            path.join(this.config.workingDirectory, 'temp')
        ];
        
        for (const dir of directories) {
            try {
                await fs.mkdir(dir, { recursive: true });
                console.log(`[ORCHESTRATOR] 📁 Directorio verificado: ${dir}`);
            } catch (error) {
                if (error.code !== 'EEXIST') {
                    throw error;
                }
            }
        }
    }
    
    async configurePowerShellEnvironment() {
        console.log('[ORCHESTRATOR] ⚙️ Configurando entorno PowerShell...');
        
        // Verificar y configurar execution policy para el proceso actual
        const configScript = `
            try {
                $currentPolicy = Get-ExecutionPolicy -Scope Process
                if ($currentPolicy -eq 'Restricted') {
                    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force
                    Write-Host "✅ ExecutionPolicy configurada para Process"
                } else {
                    Write-Host "✅ ExecutionPolicy ya configurada: $currentPolicy"
                }
                
                # Verificar disponibilidad de Start-Job
                if (Get-Command Start-Job -ErrorAction SilentlyContinue) {
                    Write-Host "✅ PowerShell Jobs disponibles"
                } else {
                    Write-Host "❌ PowerShell Jobs no disponibles"
                }
                
                # Configurar encoding para evitar problemas de caracteres
                $OutputEncoding = [System.Text.Encoding]::UTF8
                [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
                
                Write-Host "✅ Encoding configurado a UTF-8"
                
            } catch {
                Write-Host "❌ Error configurando PowerShell: $_"
                exit 1
            }
        `;
        
        return this.executePowerShellScript(configScript, 'config');
    }
    
    async preparePowerShellScripts() {
        console.log('[ORCHESTRATOR] 📝 Preparando scripts de PowerShell...');
        
        // Script para monitoreo de jobs
        const jobMonitorScript = this.generateJobMonitorScript();
        await this.saveScript('JobMonitor.ps1', jobMonitorScript);
        
        // Script para lanzamiento de procesos
        const processLauncherScript = this.generateProcessLauncherScript();
        await this.saveScript('ProcessLauncher.ps1', processLauncherScript);
        
        // Script para métricas de performance
        const performanceScript = this.generatePerformanceScript();
        await this.saveScript('PerformanceCollector.ps1', performanceScript);
        
        console.log('[ORCHESTRATOR] ✅ Scripts preparados');
    }
    
    // ================================================================
    // 🎯 LANZAMIENTO Y GESTION DE PROCESOS
    // ================================================================
    
    async startAllProcesses() {
        console.log('[ORCHESTRATOR] 🚀 Iniciando todos los procesos en segundo plano...');
        
        this.orchestratorState.isRunning = true;
        this.orchestratorState.startTime = Date.now();
        
        // Ordenar procesos por dependencias
        const sortedProcesses = this.sortProcessesByDependencies();
        
        // Lanzar procesos en orden de dependencias
        for (const processConfig of sortedProcesses) {
            await this.launchProcess(processConfig);
            
            // Pequena pausa entre lanzamientos
            await this.sleep(2000);
        }
        
        // Iniciar monitoreo continuo
        if (this.config.enableJobMonitoring) {
            await this.startContinuousMonitoring();
        }
        
        console.log(`[ORCHESTRATOR] ✅ ${sortedProcesses.length} procesos iniciados`);
        
        this.emit('orchestrator:started', {
            timestamp: Date.now(),
            processCount: sortedProcesses.length,
            activeJobs: this.orchestratorState.activeJobs.size
        });
    }
    
    async launchProcess(processConfig) {
        try {
            const jobId = `${processConfig.name}_${Date.now()}`;
            console.log(`[ORCHESTRATOR] 🔄 Lanzando: ${processConfig.name} (${jobId})`);
            
            let process;
            
            if (processConfig.type === 'continuous') {
                // Proceso continuo usando Start-Process
                process = await this.launchContinuousProcess(jobId, processConfig);
            } else if (processConfig.type === 'scheduled') {
                // Proceso programado usando PowerShell Jobs
                process = await this.scheduleProcess(jobId, processConfig);
            }
            
            // Registrar el job
            this.orchestratorState.activeJobs.set(jobId, {
                id: jobId,
                config: processConfig,
                process: process,
                startTime: Date.now(),
                status: 'running',
                restartCount: 0,
                lastHeartbeat: Date.now(),
                memoryUsage: 0,
                cpuUsage: 0
            });
            
            this.orchestratorState.totalJobsLaunched++;
            
            // Configurar monitoring específico del job
            await this.setupJobMonitoring(jobId, processConfig);
            
            console.log(`[ORCHESTRATOR] ✅ ${processConfig.name} lanzado correctamente`);
            
            this.emit('process:launched', {
                jobId,
                processName: processConfig.name,
                timestamp: Date.now()
            });
            
        } catch (error) {
            console.error(`[ORCHESTRATOR] ❌ Error lanzando ${processConfig.name}:`, error.message);
            
            this.orchestratorState.failedJobs.set(jobId, {
                config: processConfig,
                error: error.message,
                timestamp: Date.now(),
                attemptCount: 1
            });
        }
    }
    
    async launchContinuousProcess(jobId, config) {
        // Crear script de PowerShell para lanzar proceso continuo
        const scriptContent = `
            try {
                # Configurar directorio de trabajo
                Set-Location "${this.config.workingDirectory}"
                
                # Configurar variables de entorno
                ${Object.entries(config.environment).map(([key, value]) => 
                    `$env:${key} = "${value}"`
                ).join('\n                ')}
                
                # Configurar prioridad del proceso
                $Priority = "${config.priority}"
                
                # Lanzar proceso en segundo plano
                $Process = Start-Process -FilePath "${config.command}" -ArgumentList "${config.args.join(' ')}" -WindowStyle Hidden -PassThru -WorkingDirectory "${this.config.workingDirectory}"
                
                # Configurar prioridad si se especifica
                if ($Priority -ne "Normal") {
                    $Process.PriorityClass = $Priority
                }
                
                # Configurar límite de memoria si está habilitado
                if (${config.memoryLimit} -gt 0) {
                    # Monitorear memoria en job separado
                    $MemoryJob = Start-Job -ScriptBlock {
                        param($ProcessId, $MemoryLimit)
                        while ($true) {
                            $proc = Get-Process -Id $ProcessId -ErrorAction SilentlyContinue
                            if ($proc) {
                                $memoryMB = $proc.WorkingSet64 / 1MB
                                if ($memoryMB -gt $MemoryLimit) {
                                    Write-Host "⚠️ Proceso $ProcessId excede límite de memoria: $memoryMB MB > $MemoryLimit MB"
                                    # Opcional: terminar proceso que excede memoria
                                    # $proc.Kill()
                                }
                            } else {
                                break
                            }
                            Start-Sleep -Seconds 10
                        }
                    } -ArgumentList $Process.Id, ${config.memoryLimit}
                    
                    # Registrar memory job para cleanup posterior
                    $Process | Add-Member -NotePropertyName "MemoryJob" -NotePropertyValue $MemoryJob
                }
                
                # Log de inicio
                $LogFile = "${path.join(this.config.logDirectory, 'jobs', `${jobId}.log`)}"
                $LogEntry = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - Proceso iniciado: PID $($Process.Id)"
                Add-Content -Path $LogFile -Value $LogEntry -Encoding UTF8
                
                # Retornar información del proceso
                Write-Output @{
                    ProcessId = $Process.Id
                    ProcessName = $Process.ProcessName
                    StartTime = $Process.StartTime
                    JobId = "${jobId}"
                    Status = "Running"
                } | ConvertTo-Json
                
            } catch {
                Write-Error "Error lanzando proceso: $_"
                exit 1
            }
        `;
        
        return this.executePowerShellScript(scriptContent, jobId);
    }
    
    async scheduleProcess(jobId, config) {
        console.log(`[ORCHESTRATOR] ⏰ Programando proceso: ${config.name}`);
        
        // Para procesos programados, usar PowerShell Jobs con timer
        const scriptContent = `
            try {
                # Función para ejecutar el proceso
                function Execute-ScheduledProcess {
                    Set-Location "${this.config.workingDirectory}"
                    
                    # Configurar variables de entorno
                    ${Object.entries(config.environment).map(([key, value]) => 
                        `$env:${key} = "${value}"`
                    ).join('\n                    ')}
                    
                    # Ejecutar comando
                    $Output = & "${config.command}" ${config.args.join(' ')} 2>&1
                    
                    # Log del resultado
                    $LogFile = "${path.join(this.config.logDirectory, 'jobs', `${jobId}_scheduled.log`)}"
                    $Timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
                    Add-Content -Path $LogFile -Value "$Timestamp - Ejecución completada" -Encoding UTF8
                    Add-Content -Path $LogFile -Value "$Output" -Encoding UTF8
                    
                    return $Output
                }
                
                # Crear job programado que se ejecuta según schedule
                $ScheduleJob = Start-Job -ScriptBlock {
                    param($JobId, $Schedule, $ExecuteFunction)
                    
                    # Parsear schedule (simplificado para demo)
                    # En implementación real se usaría cron parser
                    $IntervalSeconds = 30 # Por defecto cada 30 segundos
                    
                    while ($true) {
                        try {
                            & $ExecuteFunction
                            Write-Host "$(Get-Date -Format 'HH:mm:ss') - Job $JobId ejecutado correctamente"
                        } catch {
                            Write-Error "Error en job programado $JobId : $_"
                        }
                        
                        Start-Sleep -Seconds $IntervalSeconds
                    }
                } -ArgumentList "${jobId}", "${config.schedule}", ${function:Execute-ScheduledProcess}
                
                # Retornar información del job
                Write-Output @{
                    JobId = $ScheduleJob.Id
                    Name = "${config.name}"
                    Schedule = "${config.schedule}"
                    Status = "Scheduled"
                } | ConvertTo-Json
                
            } catch {
                Write-Error "Error programando proceso: $_"
                exit 1
            }
        `;
        
        return this.executePowerShellScript(scriptContent, `${jobId}_scheduler`);
    }
    
    // ================================================================
    // 📊 MONITOREO Y SUPERVISION DE PROCESOS
    // ================================================================
    
    async startContinuousMonitoring() {
        console.log('[ORCHESTRATOR] 👁️ Iniciando monitoreo continuo...');
        
        // Monitoreo cada 30 segundos
        const monitoringInterval = setInterval(async () => {
            await this.monitorAllJobs();
        }, 30000);
        
        this.jobMonitors.set('continuous', monitoringInterval);
        
        // Recolección de métricas cada 60 segundos
        const metricsInterval = setInterval(async () => {
            await this.collectPerformanceMetrics();
        }, 60000);
        
        this.jobMonitors.set('metrics', metricsInterval);
        
        // Cleanup de jobs completados cada 5 minutos
        const cleanupInterval = setInterval(async () => {
            await this.cleanupCompletedJobs();
        }, 5 * 60000);
        
        this.jobMonitors.set('cleanup', cleanupInterval);
    }
    
    async monitorAllJobs() {
        try {
            console.log('[ORCHESTRATOR] 🔍 Monitoreando jobs activos...');
            
            const activeJobsCount = this.orchestratorState.activeJobs.size;
            if (activeJobsCount === 0) {
                return;
            }
            
            // Script para obtener estado de todos los procesos
            const monitorScript = `
                try {
                    # Obtener todos los jobs de PowerShell
                    $PowerShellJobs = Get-Job | ForEach-Object {
                        @{
                            Id = $_.Id
                            Name = $_.Name
                            State = $_.State
                            HasMoreData = $_.HasMoreData
                            Location = $_.Location
                        }
                    }
                    
                    # Obtener procesos Node.js activos
                    $NodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | ForEach-Object {
                        @{
                            Id = $_.Id
                            ProcessName = $_.ProcessName
                            StartTime = $_.StartTime
                            CPU = $_.CPU
                            WorkingSet = [math]::Round($_.WorkingSet / 1MB, 2)
                            PagedMemorySize = [math]::Round($_.PagedMemorySize64 / 1MB, 2)
                            VirtualMemorySize = [math]::Round($_.VirtualMemorySize64 / 1MB, 2)
                        }
                    }
                    
                    # Retornar estado combinado
                    @{
                        PowerShellJobs = $PowerShellJobs
                        NodeProcesses = $NodeProcesses
                        Timestamp = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
                    } | ConvertTo-Json -Depth 3
                    
                } catch {
                    Write-Error "Error monitoreando jobs: $_"
                }
            `;
            
            const result = await this.executePowerShellScript(monitorScript, 'monitor');
            
            if (result) {
                const monitorData = JSON.parse(result);
                await this.processMonitoringData(monitorData);
            }
            
        } catch (error) {
            console.error('[ORCHESTRATOR] ❌ Error en monitoreo:', error.message);
        }
    }
    
    async processMonitoringData(data) {
        // Actualizar estado de jobs activos
        for (const [jobId, jobData] of this.orchestratorState.activeJobs) {
            // Buscar proceso correspondiente en los datos de monitoreo
            const nodeProcess = data.NodeProcesses?.find(proc => {
                // Lógica para matchear proceso con job
                return true; // Simplificado para demo
            });
            
            if (nodeProcess) {
                jobData.lastHeartbeat = Date.now();
                jobData.memoryUsage = nodeProcess.WorkingSet;
                jobData.cpuUsage = nodeProcess.CPU || 0;
                jobData.status = 'running';
            } else {
                // Proceso podría haber terminado
                const timeSinceLastHeartbeat = Date.now() - jobData.lastHeartbeat;
                
                if (timeSinceLastHeartbeat > this.config.jobTimeout) {
                    console.warn(`[ORCHESTRATOR] ⚠️ Job ${jobId} sin heartbeat por ${timeSinceLastHeartbeat}ms`);
                    
                    if (jobData.config.restartOnFailure) {
                        await this.restartJob(jobId);
                    } else {
                        await this.markJobAsFailed(jobId, 'Timeout');
                    }
                }
            }
        }
        
        // Emitir evento de monitoreo
        this.emit('monitoring:update', {
            timestamp: Date.now(),
            activeJobs: this.orchestratorState.activeJobs.size,
            monitoringData: data
        });
    }
    
    async collectPerformanceMetrics() {
        try {
            const performanceScript = `
                try {
                    # Métricas del sistema
                    $SystemInfo = Get-ComputerInfo | Select-Object TotalPhysicalMemory, AvailablePhysicalMemory, ProcessorCount
                    
                    # Métricas de CPU
                    $CPU = Get-Counter "\\Processor(_Total)\\% Processor Time" -SampleInterval 1 -MaxSamples 3
                    $AvgCPU = ($CPU.CounterSamples | Measure-Object CookedValue -Average).Average
                    
                    # Métricas de memoria
                    $Memory = Get-Counter "\\Memory\\Available MBytes" -SampleInterval 1 -MaxSamples 1
                    $AvailableMemory = $Memory.CounterSamples[0].CookedValue
                    
                    # Métricas de procesos Node.js
                    $NodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Measure-Object CPU, WorkingSet, PagedMemorySize64 -Sum
                    
                    @{
                        Timestamp = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
                        System = @{
                            AvgCPU = [math]::Round($AvgCPU, 2)
                            AvailableMemoryMB = $AvailableMemory
                            TotalPhysicalMemoryGB = [math]::Round($SystemInfo.TotalPhysicalMemory / 1GB, 2)
                            ProcessorCount = $SystemInfo.ProcessorCount
                        }
                        NodeProcesses = @{
                            Count = $NodeProcesses.Count
                            TotalCPU = [math]::Round(($NodeProcesses | Where-Object Property -eq "CPU").Sum, 2)
                            TotalMemoryMB = [math]::Round(($NodeProcesses | Where-Object Property -eq "WorkingSet").Sum / 1MB, 2)
                            TotalPagedMemoryMB = [math]::Round(($NodeProcesses | Where-Object Property -eq "PagedMemorySize64").Sum / 1MB, 2)
                        }
                    } | ConvertTo-Json -Depth 3
                    
                } catch {
                    Write-Error "Error recolectando métricas: $_"
                }
            `;
            
            const result = await this.executePowerShellScript(performanceScript, 'performance');
            
            if (result) {
                const performanceData = JSON.parse(result);
                
                // Actualizar métricas del orquestador
                this.orchestratorState.performanceMetrics = {
                    ...this.orchestratorState.performanceMetrics,
                    lastUpdate: Date.now(),
                    systemMetrics: performanceData.System,
                    nodeMetrics: performanceData.NodeProcesses
                };
                
                // Log a archivo
                await this.logPerformanceMetrics(performanceData);
                
                this.emit('performance:collected', performanceData);
            }
            
        } catch (error) {
            console.error('[ORCHESTRATOR] ❌ Error recolectando métricas de performance:', error.message);
        }
    }
    
    // ================================================================
    // 🔧 UTILIDADES Y SCRIPTS DE POWERSHELL
    // ================================================================
    
    async executePowerShellScript(scriptContent, jobName) {
        return new Promise((resolve, reject) => {
            const powerShell = spawn(this.config.powerShellPath, [
                '-ExecutionPolicy', 'Bypass',
                '-NoProfile',
                '-NonInteractive',
                '-Command', scriptContent
            ], {
                cwd: this.config.workingDirectory,
                windowsHide: true,
                stdio: ['pipe', 'pipe', 'pipe']
            });
            
            let stdout = '';
            let stderr = '';
            
            powerShell.stdout.on('data', (data) => {
                stdout += data.toString();
            });
            
            powerShell.stderr.on('data', (data) => {
                stderr += data.toString();
            });
            
            powerShell.on('close', (code) => {
                if (code === 0) {
                    resolve(stdout.trim());
                } else {
                    reject(new Error(`PowerShell script failed (${jobName}): ${stderr}`));
                }
            });
            
            powerShell.on('error', (error) => {
                reject(new Error(`PowerShell execution error (${jobName}): ${error.message}`));
            });
            
            // Timeout del script
            setTimeout(() => {
                powerShell.kill();
                reject(new Error(`PowerShell script timeout (${jobName})`));
            }, this.config.jobTimeout);
        });
    }
    
    generateJobMonitorScript() {
        return `
            # Job Monitor Script - Generated by WindowsBackgroundOrchestrator
            param(
                [string]$LogDirectory = "${this.config.logDirectory}"
            )
            
            function Monitor-Jobs {
                try {
                    $Jobs = Get-Job | Where-Object { $_.State -in @('Running', 'Failed', 'Stopped') }
                    
                    foreach ($Job in $Jobs) {
                        $JobInfo = @{
                            Id = $Job.Id
                            Name = $Job.Name
                            State = $Job.State
                            StartTime = $Job.StartTime
                            Duration = (Get-Date) - $Job.StartTime
                            HasMoreData = $Job.HasMoreData
                        }
                        
                        # Log job status
                        $LogFile = Join-Path $LogDirectory "job_monitor.log"
                        $LogEntry = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - Job: $($Job.Name), State: $($Job.State), Duration: $($JobInfo.Duration)"
                        Add-Content -Path $LogFile -Value $LogEntry -Encoding UTF8
                        
                        # Handle failed jobs
                        if ($Job.State -eq 'Failed') {
                            $ErrorInfo = Receive-Job -Job $Job 2>&1
                            $ErrorLog = Join-Path $LogDirectory "job_errors.log"
                            Add-Content -Path $ErrorLog -Value "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - Job $($Job.Name) failed: $ErrorInfo" -Encoding UTF8
                        }
                    }
                    
                } catch {
                    Write-Error "Error monitoring jobs: $_"
                }
            }
            
            # Execute monitoring
            Monitor-Jobs
        `;
    }
    
    generateProcessLauncherScript() {
        return `
            # Process Launcher Script - Generated by WindowsBackgroundOrchestrator
            param(
                [string]$Command,
                [string[]]$Arguments = @(),
                [string]$WorkingDirectory = "${this.config.workingDirectory}",
                [string]$Priority = "Normal",
                [int]$MemoryLimitMB = 0,
                [hashtable]$Environment = @{}
            )
            
            function Launch-Process {
                try {
                    # Set working directory
                    Set-Location $WorkingDirectory
                    
                    # Configure environment variables
                    foreach ($EnvVar in $Environment.GetEnumerator()) {
                        Set-Item -Path "env:$($EnvVar.Key)" -Value $EnvVar.Value
                    }
                    
                    # Launch process
                    $ProcessArgs = @{
                        FilePath = $Command
                        ArgumentList = $Arguments
                        WindowStyle = 'Hidden'
                        PassThru = $true
                        WorkingDirectory = $WorkingDirectory
                    }
                    
                    $Process = Start-Process @ProcessArgs
                    
                    # Set priority
                    if ($Priority -ne "Normal") {
                        $Process.PriorityClass = $Priority
                    }
                    
                    return $Process
                    
                } catch {
                    Write-Error "Error launching process: $_"
                    return $null
                }
            }
            
            # Execute launch
            $Result = Launch-Process
            if ($Result) {
                Write-Output "Process launched successfully: PID $($Result.Id)"
            } else {
                Write-Error "Failed to launch process"
                exit 1
            }
        `;
    }
    
    generatePerformanceScript() {
        return `
            # Performance Collector Script - Generated by WindowsBackgroundOrchestrator
            param(
                [string]$LogDirectory = "${this.config.logDirectory}"
            )
            
            function Collect-PerformanceMetrics {
                try {
                    # System metrics
                    $ComputerInfo = Get-ComputerInfo -Property TotalPhysicalMemory, AvailablePhysicalMemory
                    
                    # CPU usage
                    $CPU = Get-Counter "\\Processor(_Total)\\% Processor Time" -SampleInterval 1 -MaxSamples 1
                    $CPUUsage = $CPU.CounterSamples[0].CookedValue
                    
                    # Memory usage
                    $Memory = Get-Counter "\\Memory\\Available MBytes" -SampleInterval 1 -MaxSamples 1
                    $AvailableMemory = $Memory.CounterSamples[0].CookedValue
                    
                    # Node.js processes
                    $NodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
                    
                    $Metrics = @{
                        Timestamp = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss.fff')
                        CPU = @{
                            Usage = [math]::Round($CPUUsage, 2)
                            Cores = $env:NUMBER_OF_PROCESSORS
                        }
                        Memory = @{
                            TotalGB = [math]::Round($ComputerInfo.TotalPhysicalMemory / 1GB, 2)
                            AvailableMB = $AvailableMemory
                            UsedPercentage = [math]::Round((1 - ($AvailableMemory / ($ComputerInfo.TotalPhysicalMemory / 1MB))) * 100, 2)
                        }
                        NodeProcesses = @{
                            Count = ($NodeProcesses | Measure-Object).Count
                            TotalMemoryMB = [math]::Round(($NodeProcesses | Measure-Object WorkingSet -Sum).Sum / 1MB, 2)
                            Processes = $NodeProcesses | ForEach-Object {
                                @{
                                    Id = $_.Id
                                    StartTime = $_.StartTime.ToString('yyyy-MM-dd HH:mm:ss')
                                    MemoryMB = [math]::Round($_.WorkingSet / 1MB, 2)
                                    CPU = $_.CPU
                                }
                            }
                        }
                    }
                    
                    # Save to log file
                    $LogFile = Join-Path $LogDirectory "performance_metrics.json"
                    $Metrics | ConvertTo-Json -Depth 4 | Add-Content -Path $LogFile -Encoding UTF8
                    
                    return $Metrics
                    
                } catch {
                    Write-Error "Error collecting performance metrics: $_"
                    return $null
                }
            }
            
            # Execute collection
            Collect-PerformanceMetrics
        `;
    }
    
    async saveScript(filename, content) {
        const scriptPath = path.join(this.config.logDirectory, 'scripts', filename);
        await fs.writeFile(scriptPath, content, { encoding: 'utf8' });
        console.log(`[ORCHESTRATOR] 📝 Script guardado: ${filename}`);
    }
    
    // ================================================================
    // 🔧 INTERFAZ PUBLICA Y CONTROL
    // ================================================================
    
    async stopAllProcesses() {
        console.log('[ORCHESTRATOR] 🛑 Deteniendo todos los procesos...');
        
        // Detener monitoreo
        for (const [name, monitor] of this.jobMonitors) {
            if (monitor) {
                clearInterval(monitor);
                console.log(`[ORCHESTRATOR] ⏹️ Monitor ${name} detenido`);
            }
        }
        
        // Script para terminar todos los jobs y procesos
        const stopScript = `
            try {
                # Stop PowerShell jobs
                Get-Job | Stop-Job -PassThru | Remove-Job -Force
                Write-Host "✅ PowerShell jobs detenidos"
                
                # Opcional: Terminar procesos Node.js específicos
                # Get-Process -Name "node" | Where-Object { $_.MainWindowTitle -match "QBTC" } | Stop-Process -Force
                
                Write-Host "✅ Procesos detenidos correctamente"
                
            } catch {
                Write-Error "Error deteniendo procesos: $_"
            }
        `;
        
        await this.executePowerShellScript(stopScript, 'stop_all');
        
        this.orchestratorState.isRunning = false;
        
        console.log('[ORCHESTRATOR] ✅ Todos los procesos detenidos');
        
        this.emit('orchestrator:stopped', {
            timestamp: Date.now(),
            totalJobsLaunched: this.orchestratorState.totalJobsLaunched,
            uptime: Date.now() - this.orchestratorState.startTime
        });
    }
    
    getOrchestratorStatus() {
        return {
            isRunning: this.orchestratorState.isRunning,
            startTime: this.orchestratorState.startTime,
            uptime: this.orchestratorState.startTime ? Date.now() - this.orchestratorState.startTime : 0,
            totalJobsLaunched: this.orchestratorState.totalJobsLaunched,
            activeJobs: this.orchestratorState.activeJobs.size,
            completedJobs: this.orchestratorState.completedJobs.size,
            failedJobs: this.orchestratorState.failedJobs.size,
            performanceMetrics: this.orchestratorState.performanceMetrics,
            config: this.config
        };
    }
    
    // Utilidades
    sortProcessesByDependencies() {
        const sorted = [];
        const visited = new Set();
        const visiting = new Set();
        
        const visit = (configName) => {
            if (visiting.has(configName)) {
                throw new Error(`Dependencia circular detectada: ${configName}`);
            }
            
            if (visited.has(configName)) {
                return;
            }
            
            visiting.add(configName);
            
            const config = this.processConfigurations[configName];
            if (config && config.dependsOn) {
                config.dependsOn.forEach(dep => visit(dep));
            }
            
            visiting.delete(configName);
            visited.add(configName);
            sorted.push({ ...config, name: configName });
        };
        
        Object.keys(this.processConfigurations).forEach(visit);
        
        return sorted;
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = { WindowsBackgroundOrchestrator };
