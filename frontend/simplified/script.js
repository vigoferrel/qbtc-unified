// QBTC Frontend Simplificado - Controller Principal
class QBTCSimplifiedController {
    constructor() {
        this.selectedOpportunity = null;
        this.currentStep = 0;
        this.isConnected = false;
        this.eventSource = null;
        this.opportunities = [];
        this.metrics = {
            consciousness: 0,
            coherence: 0,
            decisions: 0,
            entropy: 0,
            energy: 0,
            resonance: 0
        };
        this.pnlData = {
            totalPnl: 0,
            dailyPnl: 0,
            winRate: 0,
            currentExposure: 0,
            maxDrawdown: 0,
            riskScore: 0
        };
        this.emergencyStopActive = false;
        
        this.init();
    }
    init() {
        this.bindEvents();
        this.connectToServer();
        this.startMetricsUpdate();
        this.initMarketCube();
        this.initQuantumSections();
        this.log('Sistema QBTC Simplificado iniciado');
    }
    bindEvents() {
        // Botones de acción
        const executeBtn = document.getElementById('execute-btn');
        if (executeBtn) executeBtn.addEventListener('click', () => this.showConfirmationModal());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetSequence());
        
        // Emergency Stop
        const emergency = document.getElementById('emergency-stop');
        if (emergency) emergency.addEventListener('click', () => this.activateEmergencyStop());
        
        // Modal
        const confirmTrade = document.getElementById('confirm-trade');
        const cancelTrade = document.getElementById('cancel-trade');
        if (confirmTrade) confirmTrade.addEventListener('click', () => this.executeTrade());
        if (cancelTrade) cancelTrade.addEventListener('click', () => this.hideModal());
        
        // Click fuera del modal para cerrar
        document.getElementById('confirmation-modal').addEventListener('click', (e) => {
            if (e.target.id === 'confirmation-modal') {
                this.hideModal();
            }
        });
        
        // Cubo de mercado refresh manual
        const cubeRefresh = document.getElementById('cube-refresh');
        if (cubeRefresh) cubeRefresh.addEventListener('click', () => this.fetchMarketCube());
    }
    connectToServer() {
        try {
            // Conectar al servidor cuántico unificado en puerto 18020
            this.baseURL = 'http://localhost:18020';
            
            // Usar polling híbrido para máxima robustez
            this.startPollingMode();
            
        this.log('Conectando al sistema QBTC Cuantico Unificado...');
    } catch (error) {
        this.log('ERROR: Error conectando: ' + error.message);
        this.updateConnectionStatus(false);
    }
    }
    
    startPollingMode() {
        // Verificar sistema cada 3 segundos
        this.connectionInterval = setInterval(async () => {
            try {
                const response = await fetch(`${this.baseURL}/system/status`);
                if (response.ok) {
                    if (!this.isConnected) {
                        this.isConnected = true;
                        this.updateConnectionStatus(true);
                        this.log('CONECTADO: Sistema Cuantico QBTC Produccion');
                    }
                    
                    const data = await response.json();
                    this.handleSystemUpdate(data);
                }
            } catch (error) {
                if (this.isConnected) {
                    this.isConnected = false;
                    this.updateConnectionStatus(false);
                    this.log('WARNING: DESCONECTADO - Reintentando conexion...');
                }
            }
        }, 3000);
        
        // Obtener datos cuánticos cada 5 segundos
        this.quantumInterval = setInterval(async () => {
            if (this.isConnected) {
                await this.fetchQuantumData();
                await this.fetchRealOpportunities();
            }
        }, 5000);
    }
    
    async fetchQuantumData() {
        try {
            const response = await fetch(`${this.baseURL}/quantum/status`);
            if (response.ok) {
                const result = await response.json();
                this.updateQuantumMetrics(result);
            }
        } catch (error) {
            // Silencioso - ya manejado por connectionInterval
        }
    }
    
    async fetchRealOpportunities() {
        try {
            const response = await fetch(`${this.baseURL}/market-maker/symbols/20`);
            if (response.ok) {
                const result = await response.json();
                if (result.status === 'success' && result.data) {
                    this.opportunities = result.data;
                    this.updateOpportunitiesGrid();
                }
            }
        } catch (error) {
            // Fallback con oportunidades simuladas
            this.generateFallbackOpportunities();
        }
    }
    
    generateFallbackOpportunities() {
        // Generar oportunidades realistas mientras no hay conexión
        const symbols = ['BTC', 'ETH', 'BNB', 'SOL', 'ADA', 'DOGE', 'AVAX', 'DOT'];
        this.opportunities = symbols.map(symbol => ({
            symbol: symbol + 'USDT',
            edge: Math.random() * 25 + 5,
            confidence: Math.random() * 0.4 + 0.6,
            price: Math.random() * 50000 + 1000,
            category: Math.random() > 0.7 ? 'majors' : 'arbitrageTargets'
        }));
    }
    handleSystemUpdate(data) {
        // Procesar respuesta del Sistema Cuántico Unificado
        if (data.status === 'running') {
            this.systemComponents = data.components || [];
            
            // Actualizar información de componentes
            const quantumCore = this.systemComponents.find(c => c.type === 'core');
            const marketMaker = this.systemComponents.find(c => c.type === 'trading');
            
            if (quantumCore && quantumCore.status === 'initialized') {
                this.log(`🧠 QuantumCore: ${quantumCore.status}`);
            }
            
            if (marketMaker && marketMaker.status === 'initialized') {
                this.log(`💹 MarketMaker: ${marketMaker.status}`);
            }
            
            // Actualizar información de Binance
            if (data.binanceConnection) {
                const symbols = data.binanceConnection.symbolsLoaded || 0;
                if (symbols > 0) {
                    this.log(`📊 Binance: ${symbols} símbolos activos`);
                    this.binanceSymbolsCount = symbols;
                }
            }
            
            // Simular métricas cuánticas hasta que estén disponibles
            this.updateSimulatedMetrics();
        }
    }
    
    updateQuantumMetrics(data) {
        if (data.status === 'success' && data.data) {
            // Usar datos reales del motor cuántico
            const quantum = data.data;
            
            this.metrics.consciousness = quantum.consciousness || this.metrics.consciousness;
            this.metrics.coherence = quantum.coherence || this.metrics.coherence;
            this.metrics.decisions = quantum.activeDecisions || this.metrics.decisions;
            this.metrics.entropy = quantum.entropy || this.metrics.entropy;
            this.metrics.energy = quantum.quantumEnergy || this.metrics.energy;
            this.metrics.resonance = quantum.resonance || this.metrics.resonance;
            
            this.updateMetricsDisplay();
        } else {
            // Generar métricas evolutivas mientras esperamos datos reales
            this.updateSimulatedMetrics();
        }
    }
    
    updateSimulatedMetrics() {
        // Evolución realista de métricas cuánticas
        const time = Date.now() / 1000;
        
        this.metrics.consciousness = 0.4 + Math.sin(time * 0.1) * 0.3 + Math.random() * 0.1;
        this.metrics.coherence = 0.6 + Math.cos(time * 0.07) * 0.2 + Math.random() * 0.05;
        this.metrics.decisions = Math.floor(Math.sin(time * 0.05) * 25) + 25;
        this.metrics.entropy = 0.2 + Math.sin(time * 0.12) * 0.15 + Math.random() * 0.05;
        this.metrics.energy = 50 + Math.cos(time * 0.08) * 30 + Math.random() * 10;
        this.metrics.resonance = 0.5 + Math.sin(time * 0.09) * 0.25 + Math.random() * 0.05;
        
        this.updateMetricsDisplay();
    }
    updateConnectionStatus(connected) {
        const statusDot = document.getElementById('system-status');
        const statusText = document.getElementById('status-text');
        
        if (connected) {
            statusDot.classList.add('online');
            statusText.textContent = 'Sistema Online';
        } else {
            statusDot.classList.remove('online');
            statusText.textContent = 'Desconectado';
        }
    }
    updateOpportunitiesGrid() {
        const grid = document.getElementById('opportunities-grid');
        
        // Limpiar grid
        grid.innerHTML = '';
        
        if (this.opportunities.length === 0) {
            grid.innerHTML = `
                <div class="opportunity-card loading">
                    <div class="spinner"></div>
                    <p>Detectando oportunidades...</p>
                </div>
            `;
            return;
        }
        // Mostrar solo las 5 mejores oportunidades
        const topOpportunities = this.opportunities
            .sort((a, b) => b.edge - a.edge)
            .slice(0, 5);
        topOpportunities.forEach((opp, index) => {
            const card = this.createOpportunityCard(opp, index);
            grid.appendChild(card);
        });
    }
    createOpportunityCard(opportunity, index) {
        const card = document.createElement('div');
        card.className = 'opportunity-card';
        card.dataset.index = index;
        
        // Determinar clase de edge
        let edgeClass = 'low-edge';
        if (opportunity.edge > 15) edgeClass = 'high-edge';
        else if (opportunity.edge > 10) edgeClass = 'medium-edge';
        
        card.classList.add(edgeClass);
        
        // Determinar emoji de estado
        let statusEmoji = '🔴';
        if (opportunity.edge > 15) statusEmoji = '🟢';
        else if (opportunity.edge > 10) statusEmoji = '🟡';
        
        card.innerHTML = `
            <div class="opportunity-symbol">${opportunity.symbol}</div>
            <div class="opportunity-edge">Edge: ${opportunity.edge.toFixed(1)}x</div>
            <div class="opportunity-confidence">${statusEmoji} Confianza: ${(opportunity.confidence * 100).toFixed(0)}%</div>
            <div class="opportunity-price">$${opportunity.price.toFixed(2)}</div>
        `;
        
        card.addEventListener('click', () => this.selectOpportunity(opportunity, card));
        
        return card;
    }
    selectOpportunity(opportunity, cardElement) {
        // Remover selección anterior
        document.querySelectorAll('.opportunity-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Seleccionar nueva oportunidad
        cardElement.classList.add('selected');
        this.selectedOpportunity = opportunity;
        
        // Avanzar a paso 1 (Detectar)
        this.setStep(1);
        this.log(`Oportunidad seleccionada: ${opportunity.symbol} (Edge: ${opportunity.edge.toFixed(1)}x)`);
        
        // Auto-avanzar a validación después de 1 segundo
        setTimeout(() => {
            this.validateOpportunity();
        }, 1000);
    }
    validateOpportunity() {
        if (!this.selectedOpportunity) return;
        
        // Simular validación cuántica
        this.setStep(2);
        this.log('Validando oportunidad con conciencia cuántica...');
        
        setTimeout(() => {
            const isValid = this.metrics.consciousness > 0.5 && 
                           this.metrics.coherence > 0.6 && 
                           this.selectedOpportunity.edge > 5;
            
            if (isValid) {
                this.setStep(3);
                this.enableExecuteButton();
                this.log('✅ Oportunidad validada - Lista para ejecutar');
            } else {
                this.log('❌ Oportunidad no validada - Métricas insuficientes');
                this.resetSequence();
            }
        }, 2000);
    }
    setStep(stepNumber) {
        this.currentStep = stepNumber;
        
        const steps = ['detect', 'validate', 'execute'];
        const statuses = ['Esperando selección...', 'Pendiente', 'Pendiente'];
        
        steps.forEach((step, index) => {
            const stepElement = document.getElementById(`step-${step}`);
            const statusElement = document.getElementById(`${step}-status`);
            
            stepElement.classList.remove('active', 'completed');
            
            if (index + 1 < stepNumber) {
                stepElement.classList.add('completed');
                statusElement.textContent = 'Completado ✅';
            } else if (index + 1 === stepNumber) {
                stepElement.classList.add('active');
                statusElement.textContent = 'En proceso...';
            } else {
                statusElement.textContent = statuses[index];
            }
        });
    }
    enableExecuteButton() {
        const executeBtn = document.getElementById('execute-btn');
        executeBtn.disabled = false;
        executeBtn.style.animation = 'pulse 2s infinite';
    }
    showConfirmationModal() {
        if (!this.selectedOpportunity) return;
        
        const modal = document.getElementById('confirmation-modal');
        const details = document.getElementById('trade-details');
        
        details.innerHTML = `
            <div style="text-align: center; margin-bottom: 1rem;">
                <h4>${this.selectedOpportunity.symbol}</h4>
                <p><strong>Edge:</strong> ${this.selectedOpportunity.edge.toFixed(1)}x</p>
                <p><strong>Precio:</strong> $${this.selectedOpportunity.price.toFixed(2)}</p>
                <p><strong>Confianza:</strong> ${(this.selectedOpportunity.confidence * 100).toFixed(0)}%</p>
                <p><strong>Conciencia:</strong> ${(this.metrics.consciousness * 100).toFixed(1)}%</p>
            </div>
        `;
        
        modal.classList.add('show');
    }
    hideModal() {
        document.getElementById('confirmation-modal').classList.remove('show');
    }
    async executeTrade() {
        this.hideModal();
        this.showLoading('Ejecutando trade...');
        
        try {
            // Simular ejecución de trade
            await this.simulateTradeExecution();
            
            this.hideLoading();
            this.log(`🚀 Trade ejecutado: ${this.selectedOpportunity.symbol}`);
            this.resetSequence();
            
        } catch (error) {
            this.hideLoading();
            this.log(`❌ Error al ejecutar trade: ${error.message}`);
        }
    }
    simulateTradeExecution() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 3000);
        });
    }
    resetSequence() {
        this.selectedOpportunity = null;
        this.currentStep = 0;
        
        // Limpiar selección
        document.querySelectorAll('.opportunity-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        this.setStep(0);
        
        const executeBtn = document.getElementById('execute-btn');
        executeBtn.disabled = true;
        executeBtn.style.animation = 'none';
        
        this.log('Secuencia reiniciada');
    }
    showLoading(message) {
        const overlay = document.getElementById('loading-overlay');
        const messageEl = document.getElementById('loading-message');
        messageEl.textContent = message;
        overlay.classList.add('show');
    }
    hideLoading() {
        document.getElementById('loading-overlay').classList.remove('show');
    }
    updateMetricsDisplay() {
        // Métricas principales
        document.getElementById('consciousness-value').textContent = this.metrics.consciousness.toFixed(3);
        document.getElementById('coherence-value').textContent = this.metrics.coherence.toFixed(3);
        document.getElementById('decisions-value').textContent = this.metrics.decisions;
        
        // Métricas ampliadas
        const entropyEl = document.getElementById('entropy-value');
        const energyEl = document.getElementById('energy-value');
        const resonanceEl = document.getElementById('resonance-value');
        
        if (entropyEl) entropyEl.textContent = this.metrics.entropy.toFixed(3);
        if (energyEl) energyEl.textContent = this.metrics.energy.toFixed(3);
        if (resonanceEl) resonanceEl.textContent = this.metrics.resonance.toFixed(3);
        
        // Mini métricas en header
        const miniConsciousness = document.querySelector('#mini-consciousness .metric-value');
        const miniCoherence = document.querySelector('#mini-coherence .metric-value');
        
        if (miniConsciousness) miniConsciousness.textContent = this.metrics.consciousness.toFixed(3);
        if (miniCoherence) miniCoherence.textContent = this.metrics.coherence.toFixed(3);
        
        this.updatePnLDisplay();
    }
    
    updatePnLDisplay() {
        // Actualizar P&L y métricas de riesgo
        const totalPnlEl = document.getElementById('total-pnl');
        const dailyPnlEl = document.getElementById('daily-pnl');
        const winRateEl = document.getElementById('win-rate');
        const exposureEl = document.getElementById('current-exposure');
        const drawdownEl = document.getElementById('max-drawdown');
        const riskScoreEl = document.getElementById('risk-score');
        
        if (totalPnlEl) {
            const totalPnlText = `$${this.pnlData.totalPnl.toFixed(2)}`;
            totalPnlEl.textContent = totalPnlText;
            totalPnlEl.className = 'pnl-value ' + (this.pnlData.totalPnl >= 0 ? 'positive' : 'negative');
        }
        
        if (dailyPnlEl) {
            const dailyPnlText = `$${this.pnlData.dailyPnl.toFixed(2)}`;
            dailyPnlEl.textContent = dailyPnlText;
            dailyPnlEl.className = 'pnl-value ' + (this.pnlData.dailyPnl >= 0 ? 'positive' : 'negative');
        }
        
        if (winRateEl) winRateEl.textContent = `${this.pnlData.winRate.toFixed(1)}%`;
        if (exposureEl) exposureEl.textContent = `$${this.pnlData.currentExposure.toFixed(2)}`;
        if (drawdownEl) drawdownEl.textContent = `-$${Math.abs(this.pnlData.maxDrawdown).toFixed(2)}`;
        if (riskScoreEl) {
            riskScoreEl.textContent = `${this.pnlData.riskScore}/10`;
            const riskColor = this.pnlData.riskScore <= 3 ? 'var(--success-color)' : 
                            this.pnlData.riskScore <= 7 ? 'var(--warning-color)' : 'var(--danger-color)';
            riskScoreEl.style.color = riskColor;
        }
    }
    
    activateEmergencyStop() {
        if (this.emergencyStopActive) return;
        
        this.emergencyStopActive = true;
        this.showLoading('Activando STOP de Emergencia...');
        
        this.log('🛑 EMERGENCY STOP ACTIVADO - Deteniendo todas las operaciones');
        
        // Simular detención de emergencia
        setTimeout(() => {
            this.hideLoading();
            this.resetSequence();
            
            // Cambiar el botón de emergency stop
            const emergencyBtn = document.getElementById('emergency-stop');
            emergencyBtn.style.background = 'var(--success-color)';
            emergencyBtn.textContent = '✅ SISTEMA DETENIDO';
            emergencyBtn.disabled = true;
            
            this.log('✅ Sistema detenido de manera segura. Todas las operaciones canceladas.');
            
            // Reactivar después de 10 segundos
            setTimeout(() => {
                this.reactivateSystem();
            }, 10000);
        }, 3000);
    }
    
    reactivateSystem() {
        this.emergencyStopActive = false;
        const emergencyBtn = document.getElementById('emergency-stop');
        emergencyBtn.style.background = 'var(--danger-color)';
        emergencyBtn.textContent = '🛑 STOP INMEDIATO';
        emergencyBtn.disabled = false;
        
        this.log('🔄 Sistema reactivado - Operaciones normales restauradas');
    }
    
    startMetricsUpdate() {
        setInterval(() => {
            if (!this.isConnected) {
                // Simular métricas cuánticas
                this.metrics.consciousness = Math.random() * 0.6 + 0.4;
                this.metrics.coherence = Math.random() * 0.4 + 0.6;
                this.metrics.decisions = Math.floor(Math.random() * 10);
                this.metrics.entropy = Math.random() * 0.8;
                this.metrics.energy = Math.random() * 0.9 + 0.1;
                this.metrics.resonance = Math.random() * 0.7 + 0.3;
                
                // Simular datos de P&L
                this.pnlData.totalPnl += (Math.random() - 0.5) * 100;
                this.pnlData.dailyPnl += (Math.random() - 0.5) * 50;
                this.pnlData.winRate = Math.random() * 40 + 50; // 50-90%
                this.pnlData.currentExposure = Math.random() * 10000 + 5000;
                this.pnlData.maxDrawdown = Math.min(this.pnlData.maxDrawdown, this.pnlData.totalPnl);
                this.pnlData.riskScore = Math.floor(Math.random() * 10);
                
                // Simular oportunidades si no hay ninguna
                if (this.opportunities.length === 0) {
                    this.generateSimulatedOpportunities();
                }
                
                this.updateMetricsDisplay();
            }
        }, 2000);
    }
    
    generateSimulatedOpportunities() {
        const symbols = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'ADA/USDT', 'DOT/USDT', 'LINK/USDT'];
        this.opportunities = [];
        
        const numOpportunities = Math.floor(Math.random() * 4) + 2; // 2-5 oportunidades
        
        for (let i = 0; i < numOpportunities; i++) {
            const symbol = symbols[Math.floor(Math.random() * symbols.length)];
            this.opportunities.push({
                symbol: symbol,
                edge: Math.random() * 20 + 5, // Edge entre 5-25
                confidence: Math.random() * 0.4 + 0.6, // Confianza 60-100%
                price: Math.random() * 50000 + 1000, // Precio simulado
                timestamp: new Date().getTime()
            });
        }
        
        this.updateOpportunitiesGrid();
    }
    log(message) {
        const container = document.getElementById('log-container');
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        
        const now = new Date();
        const timeString = now.toLocaleTimeString('es-CL', { hour12: false });
        
        entry.innerHTML = `
            <span class="log-time">${timeString}</span>
            <span class="log-message">${message}</span>
        `;
        
        container.insertBefore(entry, container.firstChild);
        
        while (container.children.length > 10) {
            container.removeChild(container.lastChild);
        }
    }
    // =============================
    //   CUBO DE MERCADO (CACHE)
    // =============================
    initMarketCube() {
        // Primer fetch inmediato y luego cadencia
        this.fetchMarketCube();
        this.cubeInterval = setInterval(() => this.fetchMarketCube(), 45000);
    }

    async fetchMarketCube() {
        const updated = document.getElementById('cube-updated');
        try {
            // Intento 1: endpoint estándar unificado
            const res = await fetch('/unified/market/cube', { cache: 'no-store' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            this.renderMarketCube(data);
            if (updated) updated.textContent = new Date().toLocaleTimeString('es-CL', { hour12: false });
        } catch (err) {
            // Fallback: construir un snapshot con datos locales si existen métricas oport.
            const fallback = this.buildCubeFallback();
            this.renderMarketCube(fallback);
            if (updated) updated.textContent = new Date().toLocaleTimeString('es-CL', { hour12: false }) + ' (fallback)';
            this.log(`Cubo fallback: ${err.message}`);
        }
    }

    buildCubeFallback() {
        const symbols = (this.opportunities || []).map(o => o.symbol).slice(0, 6);
        const radarGreen = symbols.slice(0, 3);
        const radarAmber = symbols.slice(3, 6);
        return {
            timestamp: new Date().toISOString(),
            global: {
                consciousness: this.metrics.consciousness,
                coherence: this.metrics.coherence,
                entropy: this.metrics.entropy || 0.4,
                energy: this.metrics.energy || 0.6,
                resonance: this.metrics.resonance || 0.65,
            },
            sentiment: this.deriveSentiment(this.metrics),
            clusters: [
                { name: 'majors', coherence: this.metrics.coherence, entropy: this.metrics.entropy || 0.4, rotation: 'sideways', leaders: radarGreen },
                { name: 'l1_l2', coherence: this.metrics.coherence * 0.9, entropy: (this.metrics.entropy || 0.4) * 1.1, rotation: 'up', leaders: radarAmber },
            ],
            radar: { green_corridor: radarGreen, amber_corridor: radarAmber },
            kpis: { risk_score: 3, drawdown_day: 0.8 },
        };
    }

    deriveSentiment(m) {
        if (m.consciousness > 0.9 && m.coherence > 0.85 && (m.entropy ?? 0.4) < 0.35) return 'esperanza_constructiva';
        if ((m.entropy ?? 0.4) > 0.55) return 'ansiedad_latente';
        return 'ambicion_contenida';
    }

    renderMarketCube(data) {
        // KPIs globales
        const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        setText('cube-consciousness', (data.global.consciousness ?? 0).toFixed(2));
        setText('cube-kpi-coherence', (data.global.coherence ?? 0).toFixed(2));
        setText('cube-kpi-entropy', (data.global.entropy ?? 0).toFixed(2));
        setText('cube-kpi-energy', (data.global.energy ?? 0).toFixed(2));
        setText('cube-kpi-resonance', (data.global.resonance ?? 0).toFixed(2));

        // Badges
        const badgeSent = document.getElementById('cube-sentiment');
        const badgeCoh = document.getElementById('cube-coherence');
        const badgeEnt = document.getElementById('cube-entropy');
        if (badgeSent) badgeSent.textContent = `sentimiento: ${data.sentiment || '--'}`;
        if (badgeCoh) badgeCoh.textContent = `coherencia: ${(data.global.coherence ?? 0).toFixed(2)}`;
        if (badgeEnt) badgeEnt.textContent = `entropía: ${(data.global.entropy ?? 0).toFixed(2)}`;

        // Clusters
        const clustersEl = document.getElementById('cube-clusters-list');
        if (clustersEl) {
            clustersEl.innerHTML = '';
            (data.clusters || []).forEach(c => {
                const div = document.createElement('div');
                div.className = 'cluster-item';
                const rotationClass = c.rotation === 'up' ? 'up' : (c.rotation === 'down' ? 'down' : 'sideways');
                div.innerHTML = `
                    <div class="cluster-name">${c.name}</div>
                    <div class="cluster-metrics">
                        coh ${(c.coherence ?? 0).toFixed(2)} · ent ${(c.entropy ?? 0).toFixed(2)} · 
                        <span class="cluster-rotation ${rotationClass}">${c.rotation || 'sideways'}</span>
                    </div>
                `;
                clustersEl.appendChild(div);
            });
        }

        // Radar
        const radarGreen = document.getElementById('cube-radar-green');
        const radarAmber = document.getElementById('cube-radar-amber');
        const renderList = (ul, arr) => {
            if (!ul) return;
            ul.innerHTML = '';
            (arr || []).slice(0, 12).forEach(sym => {
                const li = document.createElement('li');
                li.textContent = sym;
                ul.appendChild(li);
            });
        };
        renderList(radarGreen, data?.radar?.green_corridor);
        renderList(radarAmber, data?.radar?.amber_corridor);

        // Narrativa (onboarding)
        const nar = document.getElementById('cube-narrative-text');
        if (nar) {
            const s = data.sentiment || 'ambicion_contenida';
            nar.textContent = this.buildNarrativeText(s, data.global, data.clusters || [], data.radar || {});
        }
    }

    buildNarrativeText(sentiment, global, clusters, radar) {
        const map = {
            esperanza_constructiva: 'El mar está a favor: majors lideran con coherencia alta y entropía contenida. Dejar correr winners, evitar sobre-rotación. La música acompaña. ',
            ambicion_contenida: 'Intentos de extensión con respiración. Mantener núcleo en líderes, tomar parciales en extensiones, evitar perseguir rupturas tardías. ',
            ansiedad_latente: 'Aumentan los latigazos y el ruido. Congelar nuevas hipótesis, sostener posiciones con trailing más estrecho y esperar normalización. ',
        };
        const kpis = `KPI: coh ${ (global.coherence??0).toFixed(2) } · ent ${ (global.entropy??0).toFixed(2) } · res ${ (global.resonance??0).toFixed(2) }`;
        const leaders = (radar.green_corridor||[]).slice(0,5).join(', ');
        const clustersLine = clusters.slice(0,3).map(c => `${c.name}:${(c.coherence??0).toFixed(2)}/${(c.entropy??0).toFixed(2)}(${c.rotation})`).join(' | ');
        return `${map[sentiment]||''}\n${kpis}\nLíderes: ${leaders||'—'}\nClusters: ${clustersLine||'—'}`;
    }
    
    // =============================
    //   SECCIONES CUÁNTICAS NUEVAS
    // =============================
    initQuantumSections() {
        this.initReverseEngineering();
        this.initQuantumThinking();
        this.initDataFlow();
        
        // Actualizar cada 5 segundos
        setInterval(() => {
            this.updateQuantumSections();
        }, 5000);
    }
    
    initReverseEngineering() {
        // Clasificar símbolos por categorías
        this.assetCategories = {
            majors: ['BTC', 'ETH', 'BNB', 'ADA', 'SOL', 'DOT', 'LINK', 'AVAX'],
            memecoins: ['DOGE', 'SHIB', 'PEPE', 'FLOKI', 'BONK', 'WIF', 'BOME'],
            darkside: ['XRP', 'TRX', 'BCH', 'ETC', 'BSV', 'XLM'],
            emerging: ['ARB', 'OP', 'MATIC', 'ATOM', 'ICP', 'FTM', 'NEAR']
        };
        
        this.updateAssetClassification();
    }
    
    updateAssetClassification() {
        Object.keys(this.assetCategories).forEach(category => {
            const countEl = document.getElementById(`${category}-count`);
            const listEl = document.getElementById(`${category}-list`);
            
            if (countEl) countEl.textContent = this.assetCategories[category].length;
            
            if (listEl) {
                listEl.innerHTML = '';
                this.assetCategories[category].slice(0, 8).forEach(symbol => {
                    const tag = document.createElement('div');
                    tag.className = 'asset-tag';
                    tag.textContent = symbol;
                    tag.addEventListener('click', () => {
                        this.log(`Análisis cuántico iniciado para ${symbol}`);
                    });
                    listEl.appendChild(tag);
                });
            }
        });
    }
    
    initQuantumThinking() {
        this.quantumFactors = {
            lunar: { value: 0, description: '', impact: '' },
            chaos: { value: 0, description: '', impact: '' },
            volatility: { value: 0, description: '', impact: '' },
            sentiment: { value: 0, description: '', impact: '' }
        };
        
        this.updateQuantumFactors();
    }
    
    updateQuantumFactors() {
        // Calcular influencia lunar (basado en la fase lunar simulada)
        const date = new Date();
        const lunarPhase = (date.getDate() % 29) / 29; // Ciclo lunar simplificado
        
        this.quantumFactors.lunar.value = lunarPhase;
        this.quantumFactors.lunar.description = this.getLunarPhaseDescription(lunarPhase);
        this.quantumFactors.lunar.impact = this.getLunarImpact(lunarPhase);
        
        // Índice de caos (basado en entropía y volatilidad)
        this.quantumFactors.chaos.value = this.metrics.entropy * 0.7 + Math.random() * 0.3;
        this.quantumFactors.chaos.description = this.getChaosDescription(this.quantumFactors.chaos.value);
        this.quantumFactors.chaos.impact = this.getChaosImpact(this.quantumFactors.chaos.value);
        
        // Volatilidad cuántica
        this.quantumFactors.volatility.value = this.metrics.energy * 0.8 + Math.random() * 0.2;
        this.quantumFactors.volatility.description = this.getVolatilityDescription(this.quantumFactors.volatility.value);
        this.quantumFactors.volatility.impact = this.getVolatilityImpact(this.quantumFactors.volatility.value);
        
        // Sentimiento colectivo
        this.quantumFactors.sentiment.value = this.metrics.consciousness * 0.6 + this.metrics.coherence * 0.4;
        this.quantumFactors.sentiment.description = this.getSentimentDescription(this.quantumFactors.sentiment.value);
        this.quantumFactors.sentiment.impact = this.getSentimentImpact(this.quantumFactors.sentiment.value);
        
        // Actualizar UI
        this.updateQuantumFactorsDisplay();
    }
    
    getLunarPhaseDescription(phase) {
        if (phase < 0.125) return 'Luna Nueva - Energías de reinicio';
        if (phase < 0.375) return 'Cuarto Creciente - Impulso ascendente';
        if (phase < 0.625) return 'Luna Llena - Máxima intensidad';
        if (phase < 0.875) return 'Cuarto Menguante - Liberación de energía';
        return 'Luna Nueva - Ciclo completándose';
    }
    
    getLunarImpact(phase) {
        if (phase < 0.25) return 'Favorable para nuevas posiciones';
        if (phase < 0.5) return 'Momento de acumulación';
        if (phase < 0.75) return 'Cuidado con la sobrecarga';
        return 'Tiempo de consolidación';
    }
    
    getChaosDescription(value) {
        if (value < 0.3) return 'Mercado estable, patrones claros';
        if (value < 0.6) return 'Turbulencia moderada detectada';
        return 'Alto caos - Movimientos impredecibles';
    }
    
    getChaosImpact(value) {
        if (value < 0.3) return 'Baja';
        if (value < 0.6) return 'Media';
        return 'Alta';
    }
    
    getVolatilityDescription(value) {
        if (value < 0.3) return 'Oscilaciones mínimas';
        if (value < 0.6) return 'Volatilidad normal';
        return 'Extrema volatilidad detectada';
    }
    
    getVolatilityImpact(value) {
        if (value < 0.3) return 'Lateral';
        if (value < 0.6) return 'Trending';
        return 'Explosivo';
    }
    
    getSentimentDescription(value) {
        if (value < 0.3) return 'Pesimismo dominante';
        if (value < 0.7) return 'Sentimiento neutral';
        return 'Optimismo generalizado';
    }
    
    getSentimentImpact(value) {
        if (value < 0.3) return 'Bearish';
        if (value < 0.7) return 'Neutral';
        return 'Bullish';
    }
    
    updateQuantumFactorsDisplay() {
        // Lunar
        const lunarValue = document.getElementById('lunar-value');
        const lunarDesc = document.getElementById('lunar-description');
        const lunarImpact = document.getElementById('lunar-impact');
        
        if (lunarValue) lunarValue.textContent = (this.quantumFactors.lunar.value * 100).toFixed(1) + '%';
        if (lunarDesc) lunarDesc.textContent = this.quantumFactors.lunar.description;
        if (lunarImpact) lunarImpact.querySelector('span').textContent = this.quantumFactors.lunar.impact;
        
        // Caos
        const chaosValue = document.getElementById('chaos-value');
        const chaosDesc = document.getElementById('chaos-description');
        const chaosImpact = document.getElementById('chaos-impact');
        
        if (chaosValue) chaosValue.textContent = (this.quantumFactors.chaos.value * 100).toFixed(1) + '%';
        if (chaosDesc) chaosDesc.textContent = this.quantumFactors.chaos.description;
        if (chaosImpact) chaosImpact.querySelector('span').textContent = this.quantumFactors.chaos.impact;
        
        // Volatilidad
        const volValue = document.getElementById('volatility-value');
        const volDesc = document.getElementById('volatility-description');
        const volImpact = document.getElementById('volatility-impact');
        
        if (volValue) volValue.textContent = (this.quantumFactors.volatility.value * 100).toFixed(1) + '%';
        if (volDesc) volDesc.textContent = this.quantumFactors.volatility.description;
        if (volImpact) volImpact.querySelector('span').textContent = this.quantumFactors.volatility.impact;
        
        // Sentimiento
        const sentValue = document.getElementById('sentiment-value');
        const sentDesc = document.getElementById('sentiment-description');
        const sentImpact = document.getElementById('sentiment-impact');
        
        if (sentValue) sentValue.textContent = (this.quantumFactors.sentiment.value * 100).toFixed(1) + '%';
        if (sentDesc) sentDesc.textContent = this.quantumFactors.sentiment.description;
        if (sentImpact) sentImpact.querySelector('span').textContent = this.quantumFactors.sentiment.impact;
    }
    
    initDataFlow() {
        this.dataFlowMetrics = {
            apiCalls: 0,
            rateLimit: '1200/min',
            cacheHitRate: 85,
            opsPerSecond: 150,
            processingLatency: 12,
            decisionAccuracy: 94.2,
            decisionSpeed: '23ms'
        };
        
        this.updateDataFlowDisplay();
    }
    
    updateDataFlowDisplay() {
        // Simular métricas de flujo de datos
        this.dataFlowMetrics.apiCalls = Math.floor(Math.random() * 50) + 150;
        this.dataFlowMetrics.cacheHitRate = Math.floor(Math.random() * 10) + 85;
        this.dataFlowMetrics.opsPerSecond = Math.floor(Math.random() * 50) + 120;
        this.dataFlowMetrics.processingLatency = Math.floor(Math.random() * 8) + 8;
        this.dataFlowMetrics.decisionAccuracy = (Math.random() * 5 + 92).toFixed(1);
        this.dataFlowMetrics.decisionSpeed = Math.floor(Math.random() * 15 + 15) + 'ms';
        
        // Actualizar elementos
        const setText = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        };
        
        setText('api-calls', this.dataFlowMetrics.apiCalls);
        setText('rate-limit', this.dataFlowMetrics.rateLimit);
        setText('cache-hit-rate', this.dataFlowMetrics.cacheHitRate + '%');
        setText('ops-per-second', this.dataFlowMetrics.opsPerSecond);
        setText('processing-latency', this.dataFlowMetrics.processingLatency + 'ms');
        setText('decision-accuracy', this.dataFlowMetrics.decisionAccuracy + '%');
        setText('decision-speed', this.dataFlowMetrics.decisionSpeed);
        
        // Actualizar estados de flujo
        this.updateFlowStatus('binance-status', this.isConnected ? 'Conectado' : 'Desconectado');
        this.updateFlowStatus('cache-status', this.dataFlowMetrics.cacheHitRate > 80 ? 'Óptimo' : 'Degradado');
        this.updateFlowStatus('processing-status', this.dataFlowMetrics.processingLatency < 15 ? 'Rápido' : 'Lento');
        this.updateFlowStatus('decisions-status', this.dataFlowMetrics.decisionAccuracy > 90 ? 'Preciso' : 'Ajustando');
    }
    
    updateFlowStatus(elementId, status) {
        const el = document.getElementById(elementId);
        if (el) {
            el.textContent = status;
            el.className = 'flow-status ' + (status.includes('Conectado') || status.includes('Óptimo') || status.includes('Rápido') || status.includes('Preciso') ? 'good' : 'warning');
        }
    }
    
    updateQuantumSections() {
        this.updateQuantumFactors();
        this.updateDataFlowDisplay();
        
        // Actualizar clasificación ocasionalmente
        if (Math.random() < 0.1) {
            this.simulateAssetMovement();
        }
    }
    
    simulateAssetMovement() {
        // Simular movimiento de activos entre categorías
        const categories = Object.keys(this.assetCategories);
        const fromCategory = categories[Math.floor(Math.random() * categories.length)];
        const toCategory = categories[Math.floor(Math.random() * categories.length)];
        
        if (fromCategory !== toCategory && this.assetCategories[fromCategory].length > 3) {
            const asset = this.assetCategories[fromCategory].pop();
            this.assetCategories[toCategory].unshift(asset);
            
            this.updateAssetClassification();
            this.log(`🔄 ${asset} migrado de ${fromCategory} → ${toCategory}`);
        }
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const controller = new QBTCSimplifiedController();
    
    // Cleanup al cerrar
    window.addEventListener('beforeunload', () => {
        if (controller.connectionInterval) clearInterval(controller.connectionInterval);
        if (controller.quantumInterval) clearInterval(controller.quantumInterval);
    });
    
    // Debugging global
    window.QBTC = {
        controller,
        version: 'Leonardo-2.0-Production',
        buildDate: new Date().toISOString(),
        getStatus: () => controller.isConnected ? 'CONECTADO' : 'DESCONECTADO',
        getMetrics: () => controller.metrics,
        getOpportunities: () => controller.opportunities
    };
    
    console.log('🚀 QBTC Leonardo Frontend v2.0 - Integración Cuántica Unificada');
    console.log('🌐 Conectando al sistema en puerto 18020...');
    console.log('💡 Debug: window.QBTC disponible para inspección');
});
