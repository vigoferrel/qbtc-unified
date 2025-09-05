// QBTC Quantum Poets Manager - Real System Integration

import { 
    PHI, PI_QUANTUM as PI, E_QUANTUM as E, PRIMES,
    calculateQuantumState,
    calculateQuantumHarmonic,
    normalizeQuantumValue
} from './quantum-constants.js';
class QuantumPoetsManager {
    constructor() {
        this.poets = {
            neruda: {
                name: 'Pablo Neruda',
                frequency: 40.1,
                versesPrimos: [2, 3, 5, 7, 11, 13, 17, 19],
                currentVerseIndex: 0,
                resonance: 0,
                status: 'initializing'
            },
            mistral: {
                name: 'Gabriela Mistral',
                frequency: 40.3,
                versesPrimos: [23, 29, 31, 37, 41, 43, 47, 53],
                currentVerseIndex: 0,
                resonance: 0,
                status: 'initializing'
            },
            huidobro: {
                name: 'Vicente Huidobro',
                frequency: 40.5,
                versesPrimos: [59, 61, 67, 71, 73, 79, 83, 89],
                currentVerseIndex: 0,
                resonance: 0,
                status: 'initializing'
            },
            parra: {
                name: 'Nicanor Parra',
                frequency: 40.7,
                versesPrimos: [97, 101, 103, 107, 109, 113, 127, 131],
                currentVerseIndex: 0,
                resonance: 0,
                status: 'initializing'
            },
            zurita: {
                name: 'Raúl Zurita',
                frequency: 40.9,
                versesPrimos: [137, 139, 149, 151, 157, 163, 167, 173],
                currentVerseIndex: 0,
                resonance: 0,
                status: 'initializing'
            },
            ferrel: {
                name: 'Oscar Ferrel',
                frequency: 41.1,
                versesPrimos: [179, 181, 191, 193, 197, 199, 211, 223],
                currentVerseIndex: 0,
                resonance: 0,
                status: 'initializing'
            }
        };
        
        this.isRunning = false;
        this.backendConnected = false;
    }
    
    async start() {
        this.isRunning = true;
        console.log('🎭 Quantum Poets Manager iniciado - Conectando a sistema real');
        
        // Conectar al backend QBTC real
        await this.connectToQuantumBackend();
        return true;
    }
    
    async connectToQuantumBackend() {
        try {
            // Intentar conectar al sistema QBTC unificado
            const response = await fetch('/api/quantum-state');
            if (response.ok) {
                const quantumData = await response.json();
                this.updatePoetsFromQuantumState(quantumData);
                this.backendConnected = true;
                console.log('✅ Poetas conectados al sistema cuántico real');
            }
        } catch (error) {
            console.log('⚠️ Sistema cuántico no disponible, usando métricas internas');
            this.initializeWithQuantumCore();
        }
    }
    
    updatePoetsFromQuantumState(quantumState) {
        if (quantumState && quantumState.poets) {
            Object.keys(this.poets).forEach(poetId => {
                const quantumPoet = quantumState.poets[poetId];
                if (quantumPoet) {
                    const poet = this.poets[poetId];
                    poet.resonance = quantumPoet.resonance;
                    poet.currentVerseIndex = quantumPoet.verseIndex || 0;
                    poet.status = quantumPoet.status || 'active';
                    this.updatePoetUI(poetId, poet);
                }
            });
        }
    }
    
    initializeWithQuantumCore() {
        // Usar el QuantumUnifiedCore si está disponible
        if (window.quantumUnifiedCore) {
            this.connectToUnifiedCore();
        } else {
            this.initializeFromSystemMetrics();
        }
    }
    
    connectToUnifiedCore() {
        const core = window.quantumUnifiedCore;
        
        Object.keys(this.poets).forEach((poetId, index) => {
            const poet = this.poets[poetId];
            
            // Obtener coherencia cuántica real del core
            const coherence = core.getCoherence ? core.getCoherence() : 0.7;
            const consciousness = core.getConsciousness ? core.getConsciousness() : 0.6;
            
            // Calcular resonancia basada en métricas cuánticas reales
            poet.resonance = (coherence * 0.6 + consciousness * 0.4) * (0.8 + index * 0.03);
            poet.status = core.isActive ? 'active' : 'standby';
            
            this.updatePoetUI(poetId, poet);
        });
    }
    
    initializeFromSystemMetrics() {
        // Calculate initial quantum states for all poets
        const now = Date.now() * 0.001;
        const basePhase = (now * PHI) % (PI * 2);
        
        Object.keys(this.poets).forEach((poetId, index) => {
            const poet = this.poets[poetId];
            const poetPhase = basePhase + (index * PHI);
            
            // Calculate quantum state vector for this poet
            const poetVector = calculateQuantumState(poetPhase, {
                x: poetPhase * PHI,
                y: poetPhase * E,
                z: poetPhase * PI
            });
            
            // Calculate verse resonance based on prime sequence
            const primePhase = poetPhase * poet.versesPrimos[poet.currentVerseIndex];
            const verseHarmonic = calculateQuantumHarmonic(primePhase, PHI);
            
            // Combine quantum values for poet resonance
            const baseResonance = normalizeQuantumValue(
                (poetVector.x * verseHarmonic + poetVector.y + Math.abs(Math.sin(poetPhase * E))) / 3,
                0.6, 0.95
            );
            
            poet.resonance = baseResonance;
            poet.status = 'active';
            
            this.updatePoetUI(poetId, poet);
        });
    }
    
    updatePoetUI(poetId, poet) {
        const poetElement = document.querySelector(`[data-poet="${poetId}"]`);
        if (!poetElement) return;
        
        const elements = {
            name: poetElement.querySelector('.poet-name'),
            frequency: poetElement.querySelector('.poet-frequency'),
            verse: poetElement.querySelector('.poet-verse'),
            resonance: poetElement.querySelector('.poet-resonance'),
            status: poetElement.querySelector('.poet-status')
        };
        
        if (elements.name) elements.name.textContent = poet.name;
        if (elements.frequency) elements.frequency.textContent = `${poet.frequency.toFixed(1)}Hz`;
        if (elements.verse) elements.verse.textContent = poet.versesPrimos[poet.currentVerseIndex];
        if (elements.resonance) {
            elements.resonance.textContent = `${(poet.resonance * 100).toFixed(1)}%`;
            elements.resonance.style.width = `${poet.resonance * 100}%`;
        }
        if (elements.status) {
            elements.status.textContent = poet.status.toUpperCase();
            elements.status.className = `poet-status status-${poet.status}`;
        }
    }
    
    synchronizePoets() {
        console.log('🎭 Sincronizando poetas con resonancias cuánticas');
        
        const now = Date.now() * 0.001;
        const basePhase = (now * PHI) % (PI * 2);
        
        Object.values(this.poets).forEach((poet, index) => {
            // Calculate poet-specific quantum phase
            const poetPhase = basePhase + (index * PHI);
            const poetVector = calculateQuantumState(poetPhase, {
                x: poetPhase * PHI,
                y: poetPhase * E,
                z: poetPhase * PI
            });
            
            // Find optimal starting verse based on quantum resonance
            const verseResonances = poet.versesPrimos.map((prime, i) => {
                const versePhase = poetPhase * prime;
                const harmonic = calculateQuantumHarmonic(versePhase, PHI);
                return {
                    index: i,
                    resonance: (poetVector.x * harmonic + poetVector.y + Math.abs(Math.sin(versePhase * E))) / 3
                };
            });
            
            // Select verse with highest quantum resonance
            const optimalVerse = verseResonances.reduce((best, current) => 
                current.resonance > best.resonance ? current : best
            );
            
            poet.currentVerseIndex = optimalVerse.index;
            poet.status = 'synchronized';
            
            // Calculate new resonance
            const versePhase = poetPhase * poet.versesPrimos[poet.currentVerseIndex];
            const verseHarmonic = calculateQuantumHarmonic(versePhase, PHI);
            poet.resonance = normalizeQuantumValue(
                (poetVector.x * verseHarmonic + poetVector.y + Math.abs(Math.sin(poetPhase * E))) / 3,
                0.6, 0.95
            );
        });
        
        this.updateAllPoetsUI();
        return true;
    }
    
    advanceVerses() {
        const now = Date.now() * 0.001;
        const basePhase = (now * PHI) % (PI * 2);
        
        Object.values(this.poets).forEach((poet, index) => {
            const poetPhase = basePhase + (index * PHI);
            const poetVector = calculateQuantumState(poetPhase, {
                x: poetPhase * PHI,
                y: poetPhase * E,
                z: poetPhase * PI
            });
            
            // Advance to next verse
            poet.currentVerseIndex = (poet.currentVerseIndex + 1) % poet.versesPrimos.length;
            
            // Calculate new resonance
            const versePhase = poetPhase * poet.versesPrimos[poet.currentVerseIndex];
            const verseHarmonic = calculateQuantumHarmonic(versePhase, PHI);
            poet.resonance = normalizeQuantumValue(
                (poetVector.x * verseHarmonic + poetVector.y + Math.abs(Math.sin(poetPhase * E))) / 3,
                0.6, 0.95
            );
        });
        
        this.updateAllPoetsUI();
        return this.getCurrentVerses();
    }
    
    updateAllPoetsUI() {
        Object.keys(this.poets).forEach(poetId => {
            this.updatePoetUI(poetId, this.poets[poetId]);
        });
    }
    
    getCurrentVerses() {
        const verses = {};
        Object.keys(this.poets).forEach(poetId => {
            const poet = this.poets[poetId];
            verses[poetId] = poet.versesPrimos[poet.currentVerseIndex];
        });
        return verses;
    }
    
    getGlobalResonance() {
        const totalResonance = Object.values(this.poets)
            .reduce((sum, poet) => sum + poet.resonance, 0);
        return totalResonance / Object.keys(this.poets).length;
    }
    
    getAllPoets() {
        return this.poets;
    }
    
    stop() {
        this.isRunning = false;
        console.log('🛑 Quantum Poets Manager detenido');
    }
}

// Crear instancia global
window.quantumPoetsManager = new QuantumPoetsManager();

// Auto-iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    if (window.quantumPoetsManager) {
        window.quantumPoetsManager.start();
    }
});
