// Leonardo Consciousness Core
// API base for unified server (maps 18021 frontend -> 18020 API)
const API_BASE = (typeof window !== 'undefined' && window.location)
    ? `http://${window.location.hostname}:3003`
    : 'http://localhost:3003';
// Only define if not already defined
if (typeof LeonardoConsciousness === 'undefined') {
class LeonardoConsciousness {
    constructor() {
        this.consciousness = 0;
        this.coherence = 0;
        this.decisions = 0;
        this.entropy = 0;
        this.lastUpdate = Date.now();
        this.poets = {
            neruda: { frequency: 40.1, verse: 2, resonance: 0 },
            mistral: { frequency: 40.3, verse: 23, resonance: 0 },
            rokha: { frequency: 40.5, verse: 59, resonance: 0 },
            huidobro: { frequency: 40.7, verse: 137, resonance: 0 },
            lihn: { frequency: 40.9, verse: 181, resonance: 0 },
            zurita: { frequency: 41.1, verse: 233, resonance: 0 }
        };
        this.init();
    }

    init() {
        // Initialize consciousness metrics
        this.updateConsciousnessMetrics();
        
        // Start quantum stream
        this.connectQuantumStream();
        
        // Initialize poets resonance
        this.updatePoetsResonance();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start update loop
        setInterval(() => this.update(), 1000);
    }

    connectQuantumStream() {
        const connectStream = () => {
            try {
                // Conectar al nuevo servidor Leonardo Quantum con SSE
                const eventSource = new EventSource(`${API_BASE}/api/stream`);
                
                eventSource.addEventListener('connected', (event) => {
                    const data = JSON.parse(event.data);
                    console.log('🎨 Leonardo Quantum Server Connected:', data.clientId);
                });
                
                eventSource.addEventListener('metrics', (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        this.processQuantumMetrics(data);
                    } catch (error) {
                        console.error('Error parsing metrics data:', error);
                    }
                });
                
                eventSource.addEventListener('predictions', (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        this.processPredictions(data);
                    } catch (error) {
                        console.error('Error parsing predictions data:', error);
                    }
                });
                
                eventSource.addEventListener('opportunities', (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        this.processOpportunities(data);
                    } catch (error) {
                        console.error('Error parsing opportunities data:', error);
                    }
                });
                
                eventSource.addEventListener('trade', (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        this.processTrade(data);
                    } catch (error) {
                        console.error('Error parsing trade data:', error);
                    }
                });
                
                eventSource.addEventListener('bigBang', (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        this.processBigBang(data);
                    } catch (error) {
                        console.error('Error parsing big bang data:', error);
                    }
                });
                
                eventSource.addEventListener('realtime', (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        this.processRealtime(data);
                    } catch (error) {
                        console.error('Error parsing realtime data:', error);
                    }
                });
                
                eventSource.addEventListener('error', (event) => {
                    console.warn('Leonardo Quantum Stream error, reconnecting...');
                    eventSource.close();
                    setTimeout(connectStream, 5000);
                });
                
                eventSource.addEventListener('open', () => {
                    console.log('🌊 Leonardo Quantum Stream conectado');
                    this.addSystemLog('Conectado al sistema cuántico Leonardo', 'success');
                });
                
            } catch (error) {
                console.warn('Leonardo Quantum stream connection failed, retrying in 5s...', error);
                setTimeout(connectStream, 5000);
            }
        };
        
        connectStream();
    }

    processQuantumMetrics(metricsData) {
        try {
            if (metricsData && metricsData.system) {
                const system = metricsData.system;
                
                // Update consciousness metrics from Quantum System
                this.consciousness = system.globalConsciousness || this.consciousness;
                this.coherence = system.globalCoherence || this.coherence;
                this.decisions = system.totalPredictions || this.decisions;
                this.entropy = system.quantumResonance || this.entropy;
                
                // Update UI with new data
                this.updateUI();
                
                // Update system status
                this.updateQuantumSystemStatus(metricsData);
            }
        } catch (error) {
            console.error('Error processing quantum metrics:', error);
        }
    }
    
    processPredictions(predictions) {
        try {
            if (Array.isArray(predictions) && predictions.length > 0) {
                console.log(`🔮 Received ${predictions.length} predictions`);
                this.addSystemLog(`Nuevas predicciones generadas: ${predictions.length}`, 'info');
                
                // Update predictions table if exists
                this.updatePredictionsTable(predictions.slice(0, 5)); // Show top 5
            }
        } catch (error) {
            console.error('Error processing predictions:', error);
        }
    }
    
    processOpportunities(opportunities) {
        try {
            if (Array.isArray(opportunities) && opportunities.length > 0) {
                console.log(`💰 Received ${opportunities.length} opportunities`);
                this.addSystemLog(`Oportunidades detectadas: ${opportunities.length}`, 'success');
                
                // Update opportunities table if exists
                this.updateOpportunitiesTable(opportunities);
            }
        } catch (error) {
            console.error('Error processing opportunities:', error);
        }
    }
    
    processTrade(trade) {
        try {
            console.log('💱 New trade executed:', trade);
            this.addSystemLog(`Trade ejecutado: ${trade.symbol} ${trade.side} ${trade.amount}`, 'success');
            
            // Update active trades display
            this.updateActiveTradesDisplay();
        } catch (error) {
            console.error('Error processing trade:', error);
        }
    }
    
    processBigBang(bigBangData) {
        try {
            console.log('💥 QUANTUM BIG BANG TRIGGERED!', bigBangData);
            this.addSystemLog('🌌 QUANTUM BIG BANG ACTIVADO - Sistema amplificado', 'warning');
            
            // Create special visual effect
            this.triggerBigBangEffect();
        } catch (error) {
            console.error('Error processing big bang:', error);
        }
    }
    
    processRealtime(realtimeData) {
        try {
            // Update realtime counters
            if (realtimeData.symbolsUpdated) {
                this.updateRealtimeCounters(realtimeData);
            }
        } catch (error) {
            console.error('Error processing realtime data:', error);
        }
    }
    
    // Legacy function for compatibility
    processHealthData(healthData) {
        console.warn('Using legacy processHealthData - consider updating to processQuantumMetrics');
        this.processQuantumMetrics(healthData);
    }
    
    updateSystemStatus(healthData) {
        // Update trading status
        if (healthData.server?.status) {
            const statusElement = document.getElementById('trading-status');
            if (statusElement) {
                statusElement.textContent = healthData.server.status;
                statusElement.className = `status ${healthData.server.status.toLowerCase().replace('_', '-')}`;
            }
        }
        
        // Update balance info
        if (healthData.funds) {
            const balanceElement = document.getElementById('balance-display');
            if (balanceElement) {
                balanceElement.textContent = `$${healthData.funds.totalBalance.toLocaleString()}`;
            }
            
            const winRateElement = document.getElementById('win-rate');
            if (winRateElement && healthData.funds.performanceMetrics) {
                winRateElement.textContent = 
                    `${(healthData.funds.performanceMetrics.winRate * 100).toFixed(1)}%`;
            }
        }
    }

    updateConsciousnessMetrics() {
        // Calculate consciousness metrics using quantum deterministic algorithm
        const now = Date.now();
        const timeDelta = (now - this.lastUpdate) / 1000;
        
        // Use deterministic hash-based calculations instead of Math.random
        const hash = this.hashCode(now.toString());
        
        this.consciousness = Math.abs(Math.sin(hash * 0.001)) * 0.3 + 0.7;
        this.coherence = Math.abs(Math.cos(hash * 0.002)) * 0.4 + 0.6;
        this.entropy = Math.abs(Math.sin(hash * 0.003)) * 0.5;
        
        this.decisions += Math.floor(Math.abs(Math.sin(hash)) * timeDelta);
        this.lastUpdate = now;
    }

    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash;
    }

    updatePoetsResonance() {
        const hash = this.hashCode(Date.now().toString());
        
        for (const poet in this.poets) {
            const poetHash = this.hashCode(poet + hash);
            this.poets[poet].resonance = Math.abs(Math.sin(poetHash * 0.01));
            
            // Update poet UI elements
            document.getElementById(`${poet}-resonance`).style.width = 
                `${this.poets[poet].resonance * 100}%`;
        }
    }

    setupEventListeners() {
        // Setup legacy trading control buttons
        document.getElementById('start-trading')?.addEventListener('click', () => {
            this.startTrading();
        });
        
        document.getElementById('stop-trading')?.addEventListener('click', () => {
            this.stopTrading();
        });
        
        document.getElementById('emergency-stop')?.addEventListener('click', () => {
            this.emergencyStop();
        });
        
        // Setup quantum system control buttons (integrates with LeonardoQuantumAPI)
        document.getElementById('start-quantum-system')?.addEventListener('click', async () => {
            await this.startQuantumSystem();
        });
        
        document.getElementById('stop-quantum-system')?.addEventListener('click', async () => {
            await this.stopQuantumSystem();
        });
        
        document.getElementById('restart-quantum-system')?.addEventListener('click', async () => {
            await this.restartQuantumSystem();
        });
    }

    startTrading() {
        const startBtn = document.getElementById('start-trading');
        const stopBtn = document.getElementById('stop-trading');
        
        if (startBtn && stopBtn) {
            startBtn.disabled = true;
            stopBtn.disabled = false;
        }
        
        this.addSystemLog('Sistema de trading iniciado');
    }

    stopTrading() {
        const startBtn = document.getElementById('start-trading');
        const stopBtn = document.getElementById('stop-trading');
        
        if (startBtn && stopBtn) {
            startBtn.disabled = false;
            stopBtn.disabled = true;
        }
        
        this.addSystemLog('Sistema de trading pausado');
    }

    emergencyStop() {
        this.addSystemLog('PARADA DE EMERGENCIA ACTIVADA', 'error');
        this.stopTrading();
    }

    addSystemLog(message, type = 'info') {
        const logContainer = document.getElementById('log-container');
        if (!logContainer) return;

        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        
        logContainer.insertBefore(logEntry, logContainer.firstChild);
        
        // Limit log entries
        while (logContainer.children.length > 100) {
            logContainer.removeChild(logContainer.lastChild);
        }
    }

    updateUI() {
        // Update header metrics
        document.getElementById('header-consciousness').textContent = 
            this.consciousness.toFixed(3);
        document.getElementById('header-coherence').textContent = 
            this.coherence.toFixed(3);
        document.getElementById('header-decisions').textContent = 
            this.decisions.toString();
        
        // Update main metrics
        document.getElementById('consciousness-main').textContent = 
            this.consciousness.toFixed(3);
        document.getElementById('coherence-main').textContent = 
            this.coherence.toFixed(3);
        document.getElementById('decisions-main').textContent = 
            this.decisions.toString();
        document.getElementById('entropy-main').textContent = 
            this.entropy.toFixed(3);
        
        // Update progress bars
        document.getElementById('consciousness-progress').style.width = 
            `${this.consciousness * 100}%`;
        document.getElementById('coherence-progress').style.width = 
            `${this.coherence * 100}%`;
        document.getElementById('decisions-progress').style.width = 
            `${Math.min(this.decisions / 100, 1) * 100}%`;
        document.getElementById('entropy-progress').style.width = 
            `${this.entropy * 100}%`;
    }

    update() {
        this.updateConsciousnessMetrics();
        this.updatePoetsResonance();
        this.updateUI();
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // 🆕 FUNCIONES AUXILIARES PARA EL NUEVO SISTEMA CUÁNTICO
    // ═══════════════════════════════════════════════════════════════════
    
    updateQuantumSystemStatus(metricsData) {
        try {
            // Update system status indicators
            if (metricsData.system) {
                const system = metricsData.system;
                
                // Update component status
                const components = system.components || {};
                Object.keys(components).forEach(component => {
                    const statusEl = document.getElementById(`${component}-status`);
                    if (statusEl) {
                        statusEl.textContent = components[component];
                        statusEl.className = `status-indicator ${components[component].toLowerCase()}`;
                    }
                });
                
                // Update big bang ready indicator
                const bigBangEl = document.getElementById('bigbang-ready');
                if (bigBangEl) {
                    bigBangEl.className = system.bigBangReady ? 'ready' : 'not-ready';
                    bigBangEl.textContent = system.bigBangReady ? 'READY' : 'NOT READY';
                }
            }
            
            // Update funds information
            if (metricsData.funds) {
                const funds = metricsData.funds;
                
                const balanceEl = document.getElementById('current-balance');
                if (balanceEl) {
                    balanceEl.textContent = `$${funds.balance?.toLocaleString() || '0'}`;
                }
                
                const profitEl = document.getElementById('total-profit');
                if (profitEl) {
                    profitEl.textContent = `$${funds.totalProfit?.toLocaleString() || '0'}`;
                }
                
                const drawdownEl = document.getElementById('drawdown');
                if (drawdownEl) {
                    drawdownEl.textContent = `${(funds.drawdown * 100)?.toFixed(2) || '0'}%`;
                }
                
                const winRateEl = document.getElementById('win-rate-display');
                if (winRateEl) {
                    winRateEl.textContent = `${(funds.winRate * 100)?.toFixed(1) || '0'}%`;
                }
            }
            
            // Update realtime counters
            if (metricsData.realtime) {
                const realtime = metricsData.realtime;
                
                const predictionsEl = document.getElementById('predictions-count');
                if (predictionsEl) {
                    predictionsEl.textContent = realtime.predictions || '0';
                }
                
                const opportunitiesEl = document.getElementById('opportunities-count');
                if (opportunitiesEl) {
                    opportunitiesEl.textContent = realtime.opportunities || '0';
                }
                
                const activeTradesEl = document.getElementById('active-trades-count');
                if (activeTradesEl) {
                    activeTradesEl.textContent = realtime.activeTrades || '0';
                }
            }
            
        } catch (error) {
            console.error('Error updating quantum system status:', error);
        }
    }
    
    updatePredictionsTable(predictions) {
        try {
            const tableBody = document.getElementById('predictions-table-body');
            if (!tableBody) return;
            
            tableBody.innerHTML = '';
            
            predictions.forEach(prediction => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${prediction.symbol}</td>
                    <td>${prediction.timeframe}</td>
                    <td>${(prediction.confidence * 100).toFixed(1)}%</td>
                    <td>${prediction.direction || 'N/A'}</td>
                    <td>${(prediction.compositeScore * 100).toFixed(1)}%</td>
                    <td>${prediction.optimalLeverage}x</td>
                `;
                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error updating predictions table:', error);
        }
    }
    
    updateOpportunitiesTable(opportunities) {
        try {
            const tableBody = document.getElementById('opportunities-table-body');
            if (!tableBody) return;
            
            tableBody.innerHTML = '';
            
            opportunities.forEach(opportunity => {
                const row = document.createElement('tr');
                row.className = 'opportunity-row';
                row.innerHTML = `
                    <td><strong>${opportunity.symbol}</strong></td>
                    <td>${opportunity.timeframe}</td>
                    <td>${(opportunity.confidence * 100).toFixed(1)}%</td>
                    <td>${opportunity.direction || 'N/A'}</td>
                    <td><span class="score-high">${(opportunity.compositeScore * 100).toFixed(1)}%</span></td>
                    <td>${opportunity.optimalLeverage}x</td>
                `;
                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error updating opportunities table:', error);
        }
    }
    
    updateActiveTradesDisplay() {
        try {
            // Fetch current trades from the server
            fetch(`${API_BASE}/api/trading/positions`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        this.displayActiveTrades(data.data);
                    }
                })
                .catch(error => console.error('Error fetching active trades:', error));
        } catch (error) {
            console.error('Error updating active trades display:', error);
        }
    }
    
    displayActiveTrades(trades) {
        try {
            const container = document.getElementById('active-trades-container');
            if (!container) return;
            
            container.innerHTML = '';
            
            if (trades.length === 0) {
                container.innerHTML = '<p class="no-trades">No hay trades activos</p>';
                return;
            }
            
            trades.forEach(trade => {
                const tradeEl = document.createElement('div');
                tradeEl.className = 'trade-item';
                tradeEl.innerHTML = `
                    <div class="trade-header">
                        <strong>${trade.symbol}</strong>
                        <span class="trade-side ${trade.side.toLowerCase()}">${trade.side}</span>
                    </div>
                    <div class="trade-details">
                        <div>Amount: ${trade.amount}</div>
                        <div>Entry: $${trade.entryPrice?.toFixed(4)}</div>
                        <div>Leverage: ${trade.leverage}x</div>
                        <div>PnL: <span class="pnl ${trade.pnl >= 0 ? 'positive' : 'negative'}">$${trade.pnl?.toFixed(2) || '0.00'}</span></div>
                    </div>
                `;
                container.appendChild(tradeEl);
            });
        } catch (error) {
            console.error('Error displaying active trades:', error);
        }
    }
    
    triggerBigBangEffect() {
        try {
            // Create visual effect for Big Bang event
            const body = document.body;
            body.classList.add('big-bang-effect');
            
            // Remove effect after animation
            setTimeout(() => {
                body.classList.remove('big-bang-effect');
            }, 3000);
            
            // Play sound effect if available
            const audio = document.getElementById('bigbang-sound');
            if (audio) {
                audio.play().catch(e => console.log('Could not play sound:', e));
            }
        } catch (error) {
            console.error('Error triggering big bang effect:', error);
        }
    }
    
    updateRealtimeCounters(realtimeData) {
        try {
            const lastUpdateEl = document.getElementById('last-update');
            if (lastUpdateEl) {
                lastUpdateEl.textContent = new Date().toLocaleTimeString();
            }
            
            const symbolsUpdatedEl = document.getElementById('symbols-updated');
            if (symbolsUpdatedEl && realtimeData.symbolsUpdated) {
                symbolsUpdatedEl.textContent = realtimeData.symbolsUpdated;
            }
        } catch (error) {
            console.error('Error updating realtime counters:', error);
        }
    }
    
    // API interaction methods
    async startQuantumSystem() {
        try {
            const response = await fetch(`${API_BASE}/api/system/start`, {
                method: 'POST'
            });
            const result = await response.json();
            
            if (result.success) {
                this.addSystemLog('Sistema cuántico iniciado', 'success');
            } else {
                this.addSystemLog('Error iniciando sistema: ' + result.error, 'error');
            }
        } catch (error) {
            this.addSystemLog('Error de conexión al iniciar sistema', 'error');
            console.error('Error starting quantum system:', error);
        }
    }
    
    async stopQuantumSystem() {
        try {
            const response = await fetch(`${API_BASE}/api/system/stop`, {
                method: 'POST'
            });
            const result = await response.json();
            
            if (result.success) {
                this.addSystemLog('Sistema cuántico detenido', 'info');
            } else {
                this.addSystemLog('Error deteniendo sistema: ' + result.error, 'error');
            }
        } catch (error) {
            this.addSystemLog('Error de conexión al detener sistema', 'error');
            console.error('Error stopping quantum system:', error);
        }
    }
    
    async restartQuantumSystem() {
        try {
            const response = await fetch(`${API_BASE}/api/system/restart`, {
                method: 'POST'
            });
            const result = await response.json();
            
            if (result.success) {
                this.addSystemLog('Sistema cuántico reiniciado', 'success');
            } else {
                this.addSystemLog('Error reiniciando sistema: ' + result.error, 'error');
            }
        } catch (error) {
            this.addSystemLog('Error de conexión al reiniciar sistema', 'error');
            console.error('Error restarting quantum system:', error);
        }
    }
}

// Initialize Leonardo Consciousness when document is ready
document.addEventListener('DOMContentLoaded', () => {
    window.leonardo = new LeonardoConsciousness();
});

} // End of if (typeof LeonardoConsciousness === 'undefined')
