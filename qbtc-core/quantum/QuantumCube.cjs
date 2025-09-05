/**
 * QBTC UNIFIED - Cubo Cuántico Visual
 * Implementación del cubo cuántico para visualización y análisis
 */

// Importar constantes compartidas
const {
    SYSTEM,
    NETWORK,
    LEONARDO,
    QUANTUM,
    TRADING,
    FUNDS
} = require('../shared/constants/QBTCConstants.js');

// Importar utilidades deterministas
const { deterministicRandom } = require('../shared/utils/DeterministicMath.js');
const { hash32 } = require('../shared/utils/HashUtils.js');

class QuantumCube {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error(`Canvas con ID '${canvasId}' no encontrado`);
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Configuración del cubo
        this.size = QUANTUM.CUBE.SIZE;
        this.dimensions = QUANTUM.CUBE.DIMENSIONS;
        this.rotation = { x: 0, y: 0, z: 0 };
        this.rotationSpeed = QUANTUM.CUBE.ROTATION_SPEED;
        
        // Partículas dentro del cubo
        this.particles = [];
        this.maxParticles = Math.min(QUANTUM.CUBE.MAX_PARTICLES, 200);
        
        // Estado cuántico
        this.quantumState = {
            coherence: QUANTUM.STATES.COHERENCE,
            consciousness: QUANTUM.STATES.CONSCIOUSNESS,
            energy: QUANTUM.STATES.ENERGY,
            resonance: QUANTUM.STATES.RESONANCE
        };
        
        // Transformaciones poéticas
        this.poeticTransforms = LEONARDO.CHILEAN_POETS_PRIME_TRANSFORMS;
        this.currentPoet = null;
        this.poetTransformTime = 0;
        
        // Métricas de Feynman
        this.feynmanMetrics = {
            propagator: 0,
            scattering: 0,
            waveFunction: 1
        };
        
        // Inicialización
        this.initializeParticles();
        this.selectCurrentPoet();
        this.startAnimation();
    }

    // Inicializar partículas
    initializeParticles() {
        const timestamp = Date.now();
        
        for (let i = 0; i < this.maxParticles; i++) {
            const seed = `cube_particle_${i}_${timestamp}`;
            const hash = hash32(seed);
            
            this.particles.push({
                id: i,
                position: {
                    x: (deterministicRandom(hash) - 0.5) * this.size,
                    y: (deterministicRandom(hash + 1) - 0.5) * this.size,
                    z: (deterministicRandom(hash + 2) - 0.5) * this.size
                },
                velocity: {
                    x: (deterministicRandom(hash + 3) - 0.5) * 0.1,
                    y: (deterministicRandom(hash + 4) - 0.5) * 0.1,
                    z: (deterministicRandom(hash + 5) - 0.5) * 0.1
                },
                color: this.generateParticleColor(hash),
                size: deterministicRandom(hash + 6) * 3 + 1,
                energy: deterministicRandom(hash + 7) * 10,
                phase: deterministicRandom(hash + 8) * 2 * Math.PI,
                coherence: deterministicRandom(hash + 9) * 0.5 + 0.5
            });
        }
    }

    // Generar color de partícula basado en hash
    generateParticleColor(hash) {
        const hue = deterministicRandom(hash) * 360;
        const saturation = 70 + deterministicRandom(hash + 1) * 30;
        const lightness = 40 + deterministicRandom(hash + 2) * 40;
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }

    // Seleccionar poeta actual para transformación
    selectCurrentPoet() {
        const poets = Object.keys(this.poeticTransforms);
        const poetIndex = Math.floor(Date.now() / 10000) % poets.length;
        this.currentPoet = poets[poetIndex];
        this.poetTransformTime = Date.now();
    }

    // Proyectar coordenadas 3D a 2D
    project3D(point3D) {
        // Aplicar rotación
        const cosX = Math.cos(this.rotation.x);
        const sinX = Math.sin(this.rotation.x);
        const cosY = Math.cos(this.rotation.y);
        const sinY = Math.sin(this.rotation.y);
        const cosZ = Math.cos(this.rotation.z);
        const sinZ = Math.sin(this.rotation.z);
        
        // Rotación en X
        let y = point3D.y * cosX - point3D.z * sinX;
        let z = point3D.y * sinX + point3D.z * cosX;
        
        // Rotación en Y
        let x = point3D.x * cosY + z * sinY;
        z = -point3D.x * sinY + z * cosY;
        
        // Rotación en Z
        const tempX = x * cosZ - y * sinZ;
        y = x * sinZ + y * cosZ;
        x = tempX;
        
        // Proyección perspectiva
        const distance = 300;
        const scale = distance / (distance + z);
        
        return {
            x: x * scale + this.width / 2,
            y: y * scale + this.height / 2,
            scale: scale
        };
    }

    // Dibujar las aristas del cubo
    drawCubeEdges() {
        this.ctx.strokeStyle = 'rgba(100, 200, 255, 0.3)';
        this.ctx.lineWidth = 1;
        
        const halfSize = this.size / 2;
        
        // Vértices del cubo
        const vertices = [
            { x: -halfSize, y: -halfSize, z: -halfSize },
            { x: halfSize, y: -halfSize, z: -halfSize },
            { x: halfSize, y: halfSize, z: -halfSize },
            { x: -halfSize, y: halfSize, z: -halfSize },
            { x: -halfSize, y: -halfSize, z: halfSize },
            { x: halfSize, y: -halfSize, z: halfSize },
            { x: halfSize, y: halfSize, z: halfSize },
            { x: -halfSize, y: halfSize, z: halfSize }
        ];
        
        // Proyectar vértices
        const projectedVertices = vertices.map(v => this.project3D(v));
        
        // Aristas del cubo
        const edges = [
            [0, 1], [1, 2], [2, 3], [3, 0], // Cara frontal
            [4, 5], [5, 6], [6, 7], [7, 4], // Cara trasera
            [0, 4], [1, 5], [2, 6], [3, 7]  // Aristas conectando frente y atrás
        ];
        
        // Dibujar aristas
        edges.forEach(edge => {
            const start = projectedVertices[edge[0]];
            const end = projectedVertices[edge[1]];
            
            this.ctx.beginPath();
            this.ctx.moveTo(start.x, start.y);
            this.ctx.lineTo(end.x, end.y);
            this.ctx.stroke();
        });
    }

    // Dibujar partículas
    drawParticles() {
        this.particles.forEach(particle => {
            const projected = this.project3D(particle.position);
            
            // Calcular brillo basado en energía y coherencia
            const brightness = particle.energy * particle.coherence * 0.1;
            
            // Aplicar transformación poética al color
            const poet = this.poeticTransforms[this.currentPoet];
            const transformFactor = poet.TRANSFORMATION_MATRIX[particle.id % poet.TRANSFORMATION_MATRIX.length];
            
            // Modificar color basado en transformación
            const colorMatch = particle.color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
            if (colorMatch) {
                let hue = parseFloat(colorMatch[1]);
                const saturation = parseFloat(colorMatch[2]);
                const lightness = parseFloat(colorMatch[3]);
                
                hue = (hue + transformFactor * 50) % 360;
                
                this.ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${brightness})`;
            } else {
                this.ctx.fillStyle = particle.color;
            }
            
            // Dibujar partícula
            this.ctx.beginPath();
            this.ctx.arc(projected.x, projected.y, particle.size * projected.scale, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Dibujar halo para partículas con alta energía
            if (particle.energy > 7) {
                this.ctx.strokeStyle = `rgba(255, 255, 255, ${brightness * 0.5})`;
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.arc(projected.x, projected.y, (particle.size + 2) * projected.scale, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        });
    }

    // Dibujar líneas de entrelazamiento
    drawEntanglementLines() {
        // Seleccionar algunas partículas para mostrar entrelazamiento
        const entangledPairs = [];
        const maxPairs = Math.min(this.particles.length / 4, 20);
        
        for (let i = 0; i < maxPairs; i++) {
            const idx1 = Math.floor(deterministicRandom(Date.now() + i) * this.particles.length);
            const idx2 = Math.floor(deterministicRandom(Date.now() + i + 1000) * this.particles.length);
            
            if (idx1 !== idx2) {
                entangledPairs.push([idx1, idx2]);
            }
        }
        
        // Dibujar líneas de entrelazamiento
        entangledPairs.forEach(pair => {
            const p1 = this.particles[pair[0]];
            const p2 = this.particles[pair[1]];
            
            const proj1 = this.project3D(p1.position);
            const proj2 = this.project3D(p2.position);
            
            // Calcular opacidad basado en coherencia y entrelazamiento
            const avgCoherence = (p1.coherence + p2.coherence) / 2;
            const opacity = avgCoherence * 0.3;
            
            this.ctx.strokeStyle = `rgba(150, 100, 255, ${opacity})`;
            this.ctx.lineWidth = 1;
            
            this.ctx.beginPath();
            this.ctx.moveTo(proj1.x, proj1.y);
            this.ctx.lineTo(proj2.x, proj2.y);
            this.ctx.stroke();
        });
    }

    // Actualizar partículas
    updateParticles() {
        const currentTime = Date.now();
        const deltaTime = (currentTime - this.poetTransformTime) / 1000;
        
        // Cambiar poeta cada 10 segundos
        if (deltaTime > 10) {
            this.selectCurrentPoet();
        }
        
        this.particles.forEach(particle => {
            // Actualizar posición
            particle.position.x += particle.velocity.x;
            particle.position.y += particle.velocity.y;
            particle.position.z += particle.velocity.z;
            
            // Actualizar fase
            particle.phase += particle.energy * 0.01;
            
            // Aplicar condiciones de frontera
            const halfSize = this.size / 2;
            if (Math.abs(particle.position.x) > halfSize) {
                particle.velocity.x *= -1;
                particle.position.x = Math.sign(particle.position.x) * halfSize;
            }
            if (Math.abs(particle.position.y) > halfSize) {
                particle.velocity.y *= -1;
                particle.position.y = Math.sign(particle.position.y) * halfSize;
            }
            if (Math.abs(particle.position.z) > halfSize) {
                particle.velocity.z *= -1;
                particle.position.z = Math.sign(particle.position.z) * halfSize;
            }
            
            // Aplicar transformación poética
            const poet = this.poeticTransforms[this.currentPoet];
            const transformFactor = poet.TRANSFORMATION_MATRIX[particle.id % poet.TRANSFORMATION_MATRIX.length];
            
            // Modificar energía basado en transformación
            particle.energy *= (1 + (transformFactor - 0.5) * 0.01);
            particle.energy = Math.max(1, Math.min(10, particle.energy));
            
            // Modificar coherencia
            particle.coherence *= (1 + transformFactor * 0.001);
            particle.coherence = Math.max(0.1, Math.min(1, particle.coherence));
        });
    }

    // Actualizar rotación
    updateRotation() {
        this.rotation.x += this.rotationSpeed;
        this.rotation.y += this.rotationSpeed * 0.7;
        this.rotation.z += this.rotationSpeed * 0.3;
    }

    // Actualizar métricas de Feynman
    updateFeynmanMetrics() {
        // Calcular propagador
        const momentum = deterministicRandom(Date.now()) * 10;
        const energy = deterministicRandom(Date.now() + 1) * 10;
        this.feynmanMetrics.propagator = QUANTUM.FEYNMAN.FEYNMAN_DIAGRAMS.PRICE_PROPAGATOR(momentum, energy);
        
        // Calcular scattering
        const p1 = deterministicRandom(Date.now() + 2);
        const p2 = deterministicRandom(Date.now() + 3);
        const p3 = deterministicRandom(Date.now() + 4);
        const p4 = deterministicRandom(Date.now() + 5);
        this.feynmanMetrics.scattering = QUANTUM.FEYNMAN.FEYNMAN_DIAGRAMS.SCATTERING_AMPLITUDE(p1, p2, p3, p4);
        
        // Actualizar función de onda
        this.feynmanMetrics.waveFunction = QUANTUM.FEYNMAN.QUANTUM_OPTIMIZATION.MARKET_WAVE_FUNCTION(Date.now() / 1000);
    }

    // Dibujar información del sistema
    drawSystemInfo() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.font = '12px monospace';
        
        const info = [
            `Poeta: ${this.currentPoet}`,
            `Coherencia: ${(this.quantumState.coherence * 100).toFixed(1)}%`,
            `Consciencia: ${(this.quantumState.consciousness * 100).toFixed(1)}%`,
            `Energía: ${this.quantumState.energy.toFixed(2)}`,
            `Resonancia: ${this.quantumState.resonance.toFixed(2)}`,
            `Partículas: ${this.particles.length}`
        ];
        
        info.forEach((text, i) => {
            this.ctx.fillText(text, 10, 20 + i * 15);
        });
    }

    // Limpiar canvas
    clear() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    // Renderizar cubo
    render() {
        this.clear();
        this.drawCubeEdges();
        this.drawEntanglementLines();
        this.drawParticles();
        this.drawSystemInfo();
    }

    // Actualizar estado
    update() {
        this.updateParticles();
        this.updateRotation();
        this.updateFeynmanMetrics();
    }

    // Iniciar animación
    startAnimation() {
        const animate = () => {
            this.update();
            this.render();
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    // Actualizar estado cuántico
    setQuantumState(state) {
        this.quantumState = { ...this.quantumState, ...state };
    }

    // Obtener estado actual
    getState() {
        return {
            quantumState: this.quantumState,
            feynmanMetrics: this.feynmanMetrics,
            currentPoet: this.currentPoet,
            particleCount: this.particles.length
        };
    }

    // Optimizar para maximización z=9+16j
    optimizeForMaximization() {
        const targetReal = LEONARDO.MAXIMIZATION_FUNCTION.REAL_PART;
        const targetImaginary = LEONARDO.MAXIMIZATION_FUNCTION.IMAGINARY_PART;
        
        // Ajustar rotación basado en objetivo
        this.rotationSpeed = QUANTUM.CUBE.ROTATION_SPEED * (1 + targetReal / 100);
        
        // Ajustar partículas para optimización
        this.particles.forEach(particle => {
            // Modificar energía basado en objetivo
            const energyFactor = (targetReal + targetImaginary) / 25;
            particle.energy *= energyFactor;
            particle.energy = Math.max(1, Math.min(10, particle.energy));
        });
        
        return {
            optimized: true,
            target: { real: targetReal, imaginary: targetImaginary },
            rotationSpeed: this.rotationSpeed
        };
    }
}

// Exportar la clase
module.exports = QuantumCube;