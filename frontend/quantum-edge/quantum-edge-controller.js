// QBTC Quantum Edge Controller - Orquestador Principal del Frontend Cuántico

import { 
    PHI, PI_QUANTUM as PI, E_QUANTUM as E, PRIMES,
    calculateQuantumVector,
    calculateQuantumTurbulence,
    calculateQuantumPrice,
    calculateQuantumVolume,
    getQuantumColor
} from './quantum-constants.js';
class QBTCQuantumEdgeController {
    constructor() {
        this.isConnected = false;
        this.eventSource = null;
        this.reconnectTimer = null;
        this.updateInterval = null;
        this.emergencyStopActive = false;
        
        // Estados del sistema
        this.systemState = {
            symbolsProcessed: 0,
            enginesActive: 0,
            poetsResonating: 0,
            systemStatus: 'Inicializando...',
            harmony: 0,
            totalOpportunities: 0,
            highConfidence: 0,
            avgEdge: 0
        };
        
        // Datos de engines
        this.engines = {
            fluid: { active: false, viscosity: 0.5, turbulence: 0.3 },
            poetic: { active: false, verses: 0, resonance: 0 },
            gpu: { active: false, symbols: 0, efficiency: 0 },
            antimatter: { active: false, tensors: 0, anomalies: 0 },
            auth: { active: false, integrity: 0, signals: 0 },
            cobol: { active: false, uptime: 0, transactions: 0 }
        };
        
        // Datos de poetas
        this.poets = {
            neruda: { frequency: 40.1, verse: 2, resonance: 0 },
            mistral: { frequency: 40.3, verse: 23, resonance: 0 },
            huidobro: { frequency: 40.5, verse: 59, resonance: 0 },
            parra: { frequency: 40.7, verse: 97, resonance: 0 },
            zurita: { frequency: 40.9, verse: 137, resonance: 0 },
            ferrel: { frequency: 41.1, verse: 179, resonance: 0 }
        };
        
        // Oportunidades detectadas
        this.opportunities = [];
        
        this.init();
    }

    init() {
        console.log('🌊 Inicializando QBTC Quantum Edge Controller...');
        
        this.bindEvents();
        this.connectToQuantumStream();
        this.startSimulation();
        this.initializeUI();
        
        console.log('✅ QBTC Quantum Edge Controller iniciado correctamente');
    }

    bindEvents() {
        // Controles de fluidos
        document.getElementById('increase-viscosity')?.addEventListener('click', () => {
            this.engines.fluid.viscosity = Math.min(this.engines.fluid.viscosity + 0.1, 1.0);
            this.updateFluidControls();
        });

        document.getElementById('decrease-turbulence')?.addEventListener('click', () => {
            this.engines.fluid.turbulence = Math.max(this.engines.fluid.turbulence - 0.1, 0.0);
            this.updateFluidControls();
        });

        // Controles poéticos
        document.getElementById('sync-poets')?.addEventListener('click', () => {
            this.synchronizePoets();
        });

        document.getElementById('next-verses')?.addEventListener('click', () => {
            this.advancePoetryVerses();
        });

        // Controles del sistema
        document.getElementById('start-orchestrator')?.addEventListener('click', () => {
            this.showConfirmationModal('¿Iniciar el Orquestador Cuántico Completo?', () => {
                this.startQuantumOrchestrator();
            });
        });

        document.getElementById('emergency-stop')?.addEventListener('click', () => {
            this.showConfirmationModal('¿Activar PARADA DE EMERGENCIA?', () => {
                this.activateEmergencyStop();
            });
        });

        // Modal events
        document.getElementById('modal-close')?.addEventListener('click', () => {
            this.hideModal();
        });

        document.getElementById('cancel-action')?.addEventListener('click', () => {
            this.hideModal();
        });
    }

    connectToQuantumStream() {
        console.log('🔌 Conectando al stream cuántico...');
        
        try {
            // Intentar conexión al servidor cuántico
            this.eventSource = new EventSource('/api/quantum-stream');
            
            this.eventSource.onopen = () => {
                this.isConnected = true;
                this.updateConnectionStatus(true);
                this.log('🟢 Conexión cuántica establecida');
            };

            this.eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleQuantumUpdate(data);
                } catch (error) {
                    console.error('Error parsing quantum data:', error);
                }
            };

            this.eventSource.onerror = () => {
                this.isConnected = false;
                this.updateConnectionStatus(false);
                this.log('🔴 Error de conexión cuántica - Reintentando...');
                
                this.scheduleReconnection();
            };
        } catch (error) {
            console.error('Error al conectar:', error);
            this.startSimulation(); // Fallback a modo simulación
        }
    }

    scheduleReconnection() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }
        
        this.reconnectTimer = setTimeout(() => {
            if (!this.isConnected) {
                this.connectToQuantumStream();
            }
        }, 5000);
    }

    handleQuantumUpdate(data) {
        if (data.type === 'quantum-state') {
            this.updateSystemState(data.state);
        } else if (data.type === 'engines-update') {
            this.updateEnginesState(data.engines);
        } else if (data.type === 'poets-update') {
            this.updatePoetsState(data.poets);
        } else if (data.type === 'opportunities') {
            this.updateOpportunities(data.opportunities);
        } else if (data.type === 'symbols-data') {
            // Actualizar cubo de mercado con datos reales
            if (window.quantumMarketCube) {
                window.quantumMarketCube.updateSymbolData(data.symbols);
            }
        }
    }

    startSimulation() {
        console.log('🎭 Iniciando modo simulación cuántica...');
        
        this.updateInterval = setInterval(() => {
            if (!this.isConnected) {
                this.simulateQuantumData();
            }
        }, 1000);
    }

    simulateQuantumData() {
        // Incrementar fase cuántica con números deterministas
        const now = Date.now() * 0.001; // Tiempo en segundos
        const quantumPhase = (now * PHI) % (PI * 2); // Fase base usando proporción áurea
        
        // Calcular estado del sistema usando funciones cuánticas deterministas
        const baseVector = calculateQuantumVector(quantumPhase, {
            x: quantumPhase * PHI,
            y: quantumPhase * E,
            z: quantumPhase * PI
        });
        
        // Simular datos del sistema basados en fase cuántica
        const symbolPhase = Math.abs(Math.sin(quantumPhase * PHI));
        this.systemState.symbolsProcessed = Math.floor(450 + symbolPhase * 50);
        
        const enginePhase = Math.abs(Math.cos(quantumPhase * E));
        this.systemState.enginesActive = Math.floor(1 + enginePhase * 6);
        
        const poetPhase = Math.abs(Math.sin(quantumPhase * PI));
        this.systemState.poetsResonating = Math.floor(1 + poetPhase * 6);
        
        // Simular engines usando cálculos deterministas
        Object.keys(this.engines).forEach((engineKey, index) => {
            const engine = this.engines[engineKey];
            const engineSubPhase = quantumPhase + (index * PHI);
            const engineVector = calculateQuantumVector(engineSubPhase, {
                x: engineSubPhase * PHI,
                y: engineSubPhase * E,
                z: engineSubPhase * PI
            });
            
            engine.active = Math.abs(Math.sin(engineSubPhase)) > 0.3;
            
            switch (engineKey) {
                case 'fluid':
                    engine.viscosity = Math.max(0, Math.min(1, (engineVector.x + 1) / 2));
                    engine.turbulence = Math.max(0, Math.min(1, Math.abs(Math.sin(engineSubPhase * PHI))));
                    break;
                case 'poetic':
                    engine.verses = Math.floor(Math.abs(Math.sin(engineSubPhase * E)) * 100);
                    engine.resonance = (engineVector.y + 1) / 2;
                    break;
                case 'gpu':
                    engine.symbols = Math.floor(Math.abs(Math.cos(engineSubPhase * PI)) * 1000);
                    engine.efficiency = Math.floor((engineVector.z + 1) * 50);
                    break;
                case 'antimatter':
                    engine.tensors = Math.floor(Math.abs(Math.sin(engineSubPhase * PHI)) * 50);
                    engine.anomalies = Math.floor(Math.abs(Math.cos(engineSubPhase * E)) * 10);
                    break;
                case 'auth':
                    engine.integrity = Math.floor((engineVector.x + 1) * 50);
                    engine.signals = Math.floor(Math.abs(Math.sin(engineSubPhase * PI)) * 200);
                    break;
                case 'cobol':
                    engine.uptime = Math.floor((engineVector.y + 1) * 50);
                    engine.transactions = Math.floor(Math.abs(Math.cos(engineSubPhase)) * 10000);
                    break;
            }
        });

        // Simular poetas usando armónicos cuánticos
        Object.keys(this.poets).forEach((poetKey, index) => {
            const poet = this.poets[poetKey];
            const poetSubPhase = quantumPhase + (index * E);
            poet.resonance = Math.abs(Math.sin(poetSubPhase * PHI)) * 100;
        });

        // Simular oportunidades con cálculos deterministas
        this.opportunities = [];
        const opportunityPhase = Math.abs(Math.sin(quantumPhase * E));
        const opportunityCount = Math.floor(5 + opportunityPhase * 10);
        
        for (let i = 0; i < opportunityCount; i++) {
            const oppPhase = quantumPhase + (i * PHI);
            const oppVector = calculateQuantumVector(oppPhase, {
                x: oppPhase * PHI,
                y: oppPhase * E,
                z: oppPhase * PI
            });
            
            this.opportunities.push({
                symbol: `SYMBOL${PRIMES[i % PRIMES.length]}USDT`,
                edge: 5 + Math.abs(oppVector.x * 20),
                confidence: (oppVector.y + 1) / 2,
                price: 10 + Math.abs(oppVector.z * 1000)
            });
        }

        this.systemState.totalOpportunities = this.opportunities.length;
        this.systemState.highConfidence = this.opportunities.filter(o => o.confidence > 0.7).length;
        this.systemState.avgEdge = this.opportunities.reduce((sum, o) => sum + o.edge, 0) / this.opportunities.length;
        this.systemState.harmony = (baseVector.y + 1) / 2; // Usar componente Y del vector base para la armonía

        this.updateUI();
    }

    updateSystemState(state) {
        Object.assign(this.systemState, state);
        this.updateUI();
    }

    updateEnginesState(engines) {
        Object.assign(this.engines, engines);
        this.updateEnginesUI();
    }

    updatePoetsState(poets) {
        Object.assign(this.poets, poets);
        this.updatePoetsUI();
    }

    updateOpportunities(opportunities) {
        this.opportunities = opportunities;
        this.updateOpportunitiesUI();
    }

    updateConnectionStatus(connected) {
        const pulse = document.getElementById('system-pulse');
        const statusText = document.getElementById('quantum-status-text');
        
        if (pulse) {
            pulse.classList.toggle('active', connected);
        }
        
        if (statusText) {
            statusText.textContent = connected ? 'Sistema Cuántico Online' : 'Desconectado - Modo Simulación';
        }
    }

    updateUI() {
        // Actualizar header stats
        this.updateElement('symbols-processed', this.systemState.symbolsProcessed);
        this.updateElement('engines-active', `${this.systemState.enginesActive}/6`);
        this.updateElement('poetsResonating', `${this.systemState.poetsResonating}/6`);
        this.updateElement('harmony-level', `Armonía: ${this.systemState.harmony.toFixed(3)}`);
        
        // Actualizar stats de oportunidades
        this.updateElement('total-opportunities', this.systemState.totalOpportunities);
        this.updateElement('high-confidence', this.systemState.highConfidence);
        this.updateElement('avg-edge', `${this.systemState.avgEdge.toFixed(1)}x`);
        
        this.updateEnginesUI();
        this.updatePoetsUI();
        this.updateOpportunitiesUI();
    }

    updateEnginesUI() {
        Object.keys(this.engines).forEach(engineKey => {
            const engine = this.engines[engineKey];
            const engineCard = document.getElementById(`engine-${engineKey}`);
            const statusDot = document.getElementById(`${engineKey}-status`);
            
            if (engineCard) {
                engineCard.classList.toggle('active', engine.active);
            }
            
            if (statusDot) {
                statusDot.classList.toggle('active', engine.active);
            }
            
            // Actualizar métricas específicas
            switch (engineKey) {
                case 'fluid':
                    this.updateElement('fluid-viscosity', engine.viscosity.toFixed(2));
                    this.updateElement('fluid-turbulence', engine.turbulence.toFixed(2));
                    break;
                case 'poetic':
                    this.updateElement('poetic-verses', engine.verses);
                    this.updateElement('poetic-resonance', engine.resonance.toFixed(2));
                    break;
                case 'gpu':
                    this.updateElement('gpu-symbols', engine.symbols);
                    this.updateElement('gpu-efficiency', `${engine.efficiency}%`);
                    break;
                case 'antimatter':
                    this.updateElement('antimatter-tensors', engine.tensors);
                    this.updateElement('antimatter-anomalies', engine.anomalies);
                    break;
                case 'auth':
                    this.updateElement('auth-integrity', `${engine.integrity}%`);
                    this.updateElement('auth-signals', engine.signals);
                    break;
                case 'cobol':
                    this.updateElement('cobol-uptime', `${engine.uptime}%`);
                    this.updateElement('cobol-transactions', engine.transactions);
                    break;
            }
        });
    }

    updatePoetsUI() {
        Object.keys(this.poets).forEach(poetKey => {
            const poet = this.poets[poetKey];
            const poetCard = document.getElementById(`poet-${poetKey}`);
            const resonanceBar = document.getElementById(`${poetKey}-resonance`);
            const verseElement = document.getElementById(`${poetKey}-verse`);
            
            if (resonanceBar) {
                resonanceBar.style.width = `${poet.resonance}%`;
            }
            
            if (verseElement) {
                verseElement.textContent = `Verso primo: ${poet.verse}`;
            }
            
            if (poetCard) {
                poetCard.classList.toggle('resonating', poet.resonance > 70);
            }
        });
    }

    updateOpportunitiesUI() {
        const stream = document.getElementById('opportunities-stream');
        if (!stream) return;

        if (this.opportunities.length === 0) {
            stream.innerHTML = `
                <div class="opportunity-placeholder">
                    <div class="quantum-loading">
                        <div class="loading-cube"></div>
                        <p>Procesando 500+ símbolos simultáneamente...</p>
                    </div>
                </div>
            `;
            return;
        }

        // Mostrar las mejores oportunidades
        const topOpportunities = this.opportunities
            .sort((a, b) => b.edge - a.edge)
            .slice(0, 8);

        stream.innerHTML = topOpportunities.map(opp => `
            <div class="opportunity-card ${this.getOpportunityClass(opp)}">
                <div class="opportunity-symbol">${opp.symbol}</div>
                <div class="opportunity-edge">Edge: ${opp.edge.toFixed(1)}x</div>
                <div class="opportunity-confidence">Confianza: ${(opp.confidence * 100).toFixed(0)}%</div>
                <div class="opportunity-price">$${opp.price.toFixed(2)}</div>
            </div>
        `).join('');
    }

    getOpportunityClass(opportunity) {
        if (opportunity.edge > 15) return 'high-edge';
        if (opportunity.edge > 10) return 'medium-edge';
        return 'low-edge';
    }

    updateFluidControls() {
        // Actualizar cubo de mercado si está disponible
        if (window.quantumMarketCube) {
            window.quantumMarketCube.updateFluidProperties(
                this.engines.fluid.viscosity,
                this.engines.fluid.turbulence,
                0.7 // momentum base
            );
        }
        
        this.log(`🌊 Propiedades de fluido actualizadas: Viscosidad=${this.engines.fluid.viscosity.toFixed(2)}, Turbulencia=${this.engines.fluid.turbulence.toFixed(2)}`);
    }

    synchronizePoets() {
        const baseFreq = 40.0;
        const now = Date.now() * 0.001;
        const quantumPhase = (now * PHI) % (PI * 2);
        
        Object.keys(this.poets).forEach((poetKey, index) => {
            const poet = this.poets[poetKey];
            const poetPhase = quantumPhase + (index * PHI);
            const poetVector = calculateQuantumVector(poetPhase, {
                x: poetPhase * PHI,
                y: poetPhase * E,
                z: poetPhase * PI
            });
            
            poet.frequency = baseFreq + (index * 0.2);
            poet.resonance = Math.abs(Math.sin(poetPhase * PHI)) * 100;
        });
        
        this.updateElement('base-frequency', `${baseFreq} Hz`);
        this.updatePoetsUI();
        this.log('🎭 Poetas sincronizados con resonancias cuánticas especiales');
    }

    advancePoetryVerses() {
        const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223];
        
        Object.keys(this.poets).forEach(poetKey => {
            const poet = this.poets[poetKey];
            const currentIndex = primes.indexOf(poet.verse);
            if (currentIndex !== -1 && currentIndex < primes.length - 1) {
                poet.verse = primes[currentIndex + 1];
            } else {
                poet.verse = primes[0]; // Volver al principio
            }
        });
        
        this.updatePoetsUI();
        this.log('➡️ Poetas avanzando a siguientes versos primos');
    }

    startQuantumOrchestrator() {
        this.log('🚀 Iniciando Orquestador Cuántico Completo...');
        
        // Activar todos los engines
        Object.keys(this.engines).forEach(engineKey => {
            this.engines[engineKey].active = true;
        });
        
        // Sincronizar poetas
        this.synchronizePoets();
        
        // Actualizar estado del sistema
        this.systemState.systemStatus = 'Orquestador Activo';
        this.systemState.enginesActive = 6;
        this.systemState.poetsResonating = 6;
        
        this.updateUI();
        this.hideModal();
        
        this.log('✅ Orquestador Cuántico iniciado correctamente');
    }

    activateEmergencyStop() {
        this.emergencyStopActive = true;
        this.log('🛑 PARADA DE EMERGENCIA ACTIVADA');
        
        // Desactivar todos los engines
        Object.keys(this.engines).forEach(engineKey => {
            this.engines[engineKey].active = false;
        });
        
        // Resetear poetas
        Object.keys(this.poets).forEach(poetKey => {
            this.poets[poetKey].resonance = 0;
        });
        
        // Actualizar estado
        this.systemState.systemStatus = 'PARADA DE EMERGENCIA';
        this.systemState.enginesActive = 0;
        this.systemState.poetsResonating = 0;
        
        // Actualizar indicador de salud
        const healthIndicator = document.getElementById('system-health');
        if (healthIndicator) {
            healthIndicator.textContent = '🔴 Sistema Detenido (Emergencia)';
            healthIndicator.style.color = '#ff4040';
        }
        
        this.updateUI();
        this.hideModal();
    }

    showConfirmationModal(message, onConfirm) {
        const modal = document.getElementById('confirmation-modal');
        const messageElement = document.getElementById('modal-message');
        const confirmButton = document.getElementById('confirm-action');
        
        if (modal && messageElement) {
            messageElement.textContent = message;
            modal.classList.add('active');
            
            // Limpiar listeners previos
            const newConfirmButton = confirmButton.cloneNode(true);
            confirmButton.parentNode.replaceChild(newConfirmButton, confirmButton);
            
            // Agregar nuevo listener
            newConfirmButton.addEventListener('click', () => {
                onConfirm();
            });
        }
    }

    hideModal() {
        const modal = document.getElementById('confirmation-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    log(message) {
        console.log(`[QBTC Quantum Edge] ${message}`);
    }

    initializeUI() {
        // Inicializar estados de UI
        this.updateElement('base-frequency', '40.0 Hz');
        this.updateConnectionStatus(this.isConnected);
        
        // Configurar tooltips y efectos adicionales
        this.setupAdvancedFeatures();
    }

    setupAdvancedFeatures() {
        // Efecto de hover para cards de engines
        document.querySelectorAll('.engine-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });

        // Efecto de hover para cards de poetas
        document.querySelectorAll('.poet-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-3px) rotateZ(1deg)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) rotateZ(0deg)';
            });
        });
    }

    // Método para destruir el controlador
    destroy() {
        if (this.eventSource) {
            this.eventSource.close();
        }
        
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }
        
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        console.log('🔄 QBTC Quantum Edge Controller destruido');
    }
}

// Inicializar el controlador cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.qbtcQuantumEdge = new QBTCQuantumEdgeController();
});
