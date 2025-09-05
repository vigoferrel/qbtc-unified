// Quantum Market Cube Visualization - Canvas 2D simplificado
class QuantumCube {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.rotation = { x: 0, y: 0 };
        this.quantumState = {
            consciousness: 0,
            coherence: 0,
            energy: 0,
            entropy: 0
        };
        
        // Performance optimization variables
        this.lastFrameTime = 0;
        this.targetFPS = 30; // Limit to 30 FPS for battery conservation
        this.frameInterval = 1000 / this.targetFPS;
        this.isVisible = true;
        this.animationId = null;
        
        this.init();
    }

    init() {
        this.canvas = document.getElementById('market-cube-canvas');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) return;

        // Set canvas size
        this.canvas.width = this.canvas.offsetWidth || 400;
        this.canvas.height = this.canvas.offsetHeight || 300;

        // Start animation
        this.animate();

        // Handle resize - store bound function for proper cleanup
        this.boundHandleResize = this.handleResize.bind(this);
        window.addEventListener('resize', this.boundHandleResize);
        
        // Handle visibility change for performance optimization - store bound function for proper cleanup
        this.boundHandleVisibilityChange = this.handleVisibilityChange.bind(this);
        document.addEventListener('visibilitychange', this.boundHandleVisibilityChange);
    }

    handleResize() {
        if (!this.canvas) return;
        
        this.canvas.width = this.canvas.offsetWidth || 400;
        this.canvas.height = this.canvas.offsetHeight || 300;
    }

    updateQuantumState(state) {
        // Validate input state values for security
        const validatedState = {};
        
        if (typeof state.consciousness === 'number' && state.consciousness >= 0 && state.consciousness <= 1) {
            validatedState.consciousness = state.consciousness;
        } else {
            validatedState.consciousness = this.quantumState.consciousness || 0;
        }
        
        if (typeof state.coherence === 'number' && state.coherence >= 0 && state.coherence <= 1) {
            validatedState.coherence = state.coherence;
        } else {
            validatedState.coherence = this.quantumState.coherence || 0;
        }
        
        if (typeof state.energy === 'number' && state.energy >= 0 && state.energy <= 1) {
            validatedState.energy = state.energy;
        } else {
            validatedState.energy = this.quantumState.energy || 0;
        }
        
        if (typeof state.entropy === 'number' && state.entropy >= 0 && state.entropy <= 1) {
            validatedState.entropy = state.entropy;
        } else {
            validatedState.entropy = this.quantumState.entropy || 0;
        }
        
        this.quantumState = { ...this.quantumState, ...validatedState };
    }

    drawQuantumCube() {
        if (!this.ctx) return;
        
        try {
            const ctx = this.ctx;
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            
            // Clear canvas
            ctx.fillStyle = '#1a2332';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
            // Update rotation based on quantum state
            this.rotation.x += 0.01 * (this.quantumState.coherence + 0.1);
            this.rotation.y += 0.015 * (this.quantumState.consciousness + 0.1);
            
            // Calculate cube properties based on quantum state
            const size = 80 + (this.quantumState.consciousness * 40);
            const alpha = 0.5 + (this.quantumState.coherence * 0.5);
            
            // Generate color based on energy and entropy
            const hue = Math.floor(this.quantumState.energy * 360);
            const saturation = Math.floor(80 + (this.quantumState.entropy * 20));
            const lightness = Math.floor(40 + (this.quantumState.coherence * 20));
            
            ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
            ctx.lineWidth = 2;
            
            // Draw 3D-ish cube wireframe
            const cos = Math.cos(this.rotation.x);
            const sin = Math.sin(this.rotation.x);
            const cosY = Math.cos(this.rotation.y);
            const sinY = Math.sin(this.rotation.y);
            
            // Define cube vertices
            const vertices = [
                [-size/2, -size/2, -size/2],
                [size/2, -size/2, -size/2],
                [size/2, size/2, -size/2],
                [-size/2, size/2, -size/2],
                [-size/2, -size/2, size/2],
                [size/2, -size/2, size/2],
                [size/2, size/2, size/2],
                [-size/2, size/2, size/2]
            ];
            
            // Project 3D vertices to 2D
            const projected = vertices.map(([x, y, z]) => {
                // Simple 3D rotation
                const rotX = x * cosY - z * sinY;
                const rotZ = x * sinY + z * cosY;
                const rotY = y * cos - rotZ * sin;
                const finalZ = y * sin + rotZ * cos;
                
                // Perspective projection
                const perspective = 300 / (300 + finalZ);
                return [
                    centerX + rotX * perspective,
                    centerY + rotY * perspective
                ];
            });
            
            // Draw cube edges
            const edges = [
                [0,1], [1,2], [2,3], [3,0], // back face
                [4,5], [5,6], [6,7], [7,4], // front face
                [0,4], [1,5], [2,6], [3,7]  // connecting edges
            ];
            
            ctx.beginPath();
            edges.forEach(([start, end]) => {
                ctx.moveTo(projected[start][0], projected[start][1]);
                ctx.lineTo(projected[end][0], projected[end][1]);
            });
            ctx.stroke();
            
            // Add quantum state text
            ctx.fillStyle = '#00d4ff';
            ctx.font = '14px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText('Cubo Cuántico del Mercado', centerX, 30);
            
            ctx.font = '10px JetBrains Mono';
            ctx.fillText(`Consciencia: ${(this.quantumState.consciousness * 100).toFixed(1)}%`, centerX, this.canvas.height - 40);
            ctx.fillText(`Coherencia: ${(this.quantumState.coherence * 100).toFixed(1)}%`, centerX, this.canvas.height - 25);
            ctx.fillText(`Energía: ${(this.quantumState.energy * 100).toFixed(1)}%`, centerX, this.canvas.height - 10);
        } catch (error) {
            console.error('Error drawing quantum cube:', error);
            // Fallback: draw simple error message
            try {
                const ctx = this.ctx;
                ctx.fillStyle = '#1a2332';
                ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                ctx.fillStyle = '#ff4444';
                ctx.font = '14px JetBrains Mono';
                ctx.textAlign = 'center';
                ctx.fillText('Error en visualización del cubo', this.canvas.width / 2, this.canvas.height / 2);
            } catch (fallbackError) {
                console.error('Fallback error:', fallbackError);
            }
        }
    }

    animate(currentTime = 0) {
        // Frame rate limiting for performance optimization
        if (currentTime - this.lastFrameTime >= this.frameInterval) {
            this.lastFrameTime = currentTime;
            
            // Only draw if the tab is visible
            if (this.isVisible) {
                this.drawQuantumCube();
            }
        }
        
        // Continue animation loop
        this.animationId = requestAnimationFrame((time) => this.animate(time));
    }

    resetView() {
        this.rotation = { x: 0, y: 0 };
    }

    toggleMode(mode) {
        // Mode toggle functionality can be implemented here
        console.log(`Cubo cuántico cambiado a modo: ${mode}`);
    }

    handleVisibilityChange() {
        this.isVisible = !document.hidden;
        
        // If tab becomes visible again, force a redraw
        if (this.isVisible) {
            this.drawQuantumCube();
        }
    }

    // Calculate deterministic value based on hash instead of Math.random()
    calculateDeterministicValue(type, timestamp) {
        const hash = this.hashCode(timestamp.toString() + type);
        
        // Use different calculations for different types to ensure variety
        switch(type) {
            case 'energy':
                return Math.abs(Math.sin(hash * 0.001)) * 0.8 + 0.2; // 0.2 - 1.0
            case 'entropy':
                return Math.abs(Math.sin(hash * 0.002)) * 0.5; // 0.0 - 0.5
            default:
                return Math.abs(Math.sin(hash * 0.003)) * 0.5 + 0.25; // 0.25 - 0.75
        }
    }
    
    // Generate hash code for deterministic calculations
    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash;
    }

    // Cleanup method to prevent memory leaks
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Remove event listeners using the bound functions
        if (this.boundHandleResize) {
            window.removeEventListener('resize', this.boundHandleResize);
            this.boundHandleResize = null;
        }
        
        if (this.boundHandleVisibilityChange) {
            document.removeEventListener('visibilitychange', this.boundHandleVisibilityChange);
            this.boundHandleVisibilityChange = null;
        }
    }
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.quantumCube = new QuantumCube();
    
    // Integrate with Leonardo Consciousness system
    window.addEventListener('leonardo-state-change', (event) => {
        if (window.quantumCube) {
            const state = event.detail;
            window.quantumCube.updateQuantumState({
                consciousness: state.consciousness || 0,
                coherence: state.coherence || 0,
                energy: state.metrics?.energy || window.quantumCube.calculateDeterministicValue('energy', Date.now()),
                entropy: state.metrics?.entropy || window.quantumCube.calculateDeterministicValue('entropy', Date.now())
            });
        }
    });
    
    // Integrate with cube controls
    document.getElementById('rotate-cube')?.addEventListener('click', () => {
        if (window.quantumCube) {
            window.quantumCube.rotation.x += 0.5;
            window.quantumCube.rotation.y += 0.3;
        }
    });
    
    document.getElementById('zoom-reset')?.addEventListener('click', () => {
        if (window.quantumCube) {
            window.quantumCube.resetView();
        }
    });
    
    document.getElementById('cube-mode')?.addEventListener('click', (e) => {
        if (window.quantumCube) {
            const isFluid = e.target.textContent.includes('Fluidos');
            const newMode = isFluid ? 'puntos' : 'fluidos';
            window.quantumCube.toggleMode(newMode);
            e.target.textContent = isFluid ? '📍 Puntos' : '🌊 Fluidos';
        }
    });
});
