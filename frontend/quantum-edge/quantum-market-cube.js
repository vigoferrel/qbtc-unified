// QBTC Quantum Market Cube - Visualización 3D del Mar de Binance

import { 
    PHI, PI_QUANTUM as PI, E_QUANTUM as E, PRIMES,
    calculateQuantumVector,
    calculateQuantumTurbulence,
    calculateQuantumPrice,
    calculateQuantumVolume,
    getQuantumColor
} from './quantum-constants.js';
class QuantumMarketCube {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.cube = null;
        this.particles = [];
        this.symbols = [];
        this.fluidMode = 'fluid';
        this.animationId = null;
        this.isRotating = false;
        
        // Configuración del cubo
        this.cubeSize = 10;
        this.particleCount = 500;
        this.maxSymbols = 100;
        
        // Variables de fluido
        this.viscosity = 0.5;
        this.turbulence = 0.3;
        this.momentum = 0.7;
        
        this.init();
        this.createParticles();
        this.bindEvents();
        this.animate();
    }

    init() {
        const canvas = document.getElementById('market-cube-canvas');
        const container = canvas.parentElement;

        // Configurar scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);

        // Configurar cámara
        this.camera = new THREE.PerspectiveCamera(
            75, 
            container.clientWidth / container.clientHeight, 
            0.1, 
            1000
        );
        this.camera.position.set(15, 15, 15);

        // Configurar renderer
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas, 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Configurar controles - verificar si OrbitControls está disponible
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        } else {
            console.warn('OrbitControls no disponible, usando controles básicos');
            this.controls = this.createBasicControls();
        }
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.1;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 50;
        this.controls.maxPolarAngle = Math.PI;

        // Crear luces
        this.createLights();
        
        // Crear cubo principal
        this.createMainCube();

        // Manejar resize
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    createBasicControls() {
        // Controles básicos cuando OrbitControls no está disponible
        return {
            enableDamping: true,
            dampingFactor: 0.1,
            screenSpacePanning: false,
            minDistance: 5,
            maxDistance: 50,
            maxPolarAngle: Math.PI,
            autoRotate: false,
            autoRotateSpeed: 0,
            update: function() {
                // Rotación automática básica si está habilitada
                if (this.autoRotate) {
                    // Implementación básica de rotación automática
                }
            },
            reset: function() {
                // Reset básico
            }
        };
    }

    createLights() {
        // Luz ambiental suave
        const ambientLight = new THREE.AmbientLight(0x00ffff, 0.2);
        this.scene.add(ambientLight);

        // Luz direccional principal (cyan)
        const directionalLight1 = new THREE.DirectionalLight(0x00ffff, 0.8);
        directionalLight1.position.set(10, 10, 10);
        directionalLight1.castShadow = true;
        directionalLight1.shadow.mapSize.width = 2048;
        directionalLight1.shadow.mapSize.height = 2048;
        directionalLight1.shadow.camera.near = 0.5;
        directionalLight1.shadow.camera.far = 100;
        this.scene.add(directionalLight1);

        // Luz direccional secundaria (purple)
        const directionalLight2 = new THREE.DirectionalLight(0x8000ff, 0.4);
        directionalLight2.position.set(-10, 5, -10);
        this.scene.add(directionalLight2);

        // Punto de luz dinámico (gold)
        const pointLight = new THREE.PointLight(0xffaa00, 0.6, 30);
        pointLight.position.set(0, 5, 5);
        this.scene.add(pointLight);

        // Almacenar referencias para animación
        this.lights = {
            directional1: directionalLight1,
            directional2: directionalLight2,
            point: pointLight
        };
    }

    createMainCube() {
        // Geometría del cubo wireframe
        const geometry = new THREE.BoxGeometry(this.cubeSize, this.cubeSize, this.cubeSize);
        const edges = new THREE.EdgesGeometry(geometry);
        
        // Material con efecto de flujo
        const material = new THREE.LineBasicMaterial({ 
            color: 0x00ffff,
            transparent: true,
            opacity: 0.6,
            linewidth: 2
        });
        
        this.cube = new THREE.LineSegments(edges, material);
        this.scene.add(this.cube);

        // Crear ejes de referencia
        this.createAxes();
    }

    createAxes() {
        const axesGroup = new THREE.Group();
        
        // Eje X (Volumen) - Rojo
        const xGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, -this.cubeSize/2 - 1, -this.cubeSize/2 - 1),
            new THREE.Vector3(this.cubeSize/2 + 2, -this.cubeSize/2 - 1, -this.cubeSize/2 - 1)
        ]);
        const xMaterial = new THREE.LineBasicMaterial({ color: 0xff4040 });
        const xLine = new THREE.Line(xGeometry, xMaterial);
        axesGroup.add(xLine);

        // Eje Y (Volatilidad) - Verde
        const yGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(this.cubeSize/2 + 1, -this.cubeSize/2, -this.cubeSize/2 - 1),
            new THREE.Vector3(this.cubeSize/2 + 1, this.cubeSize/2 + 2, -this.cubeSize/2 - 1)
        ]);
        const yMaterial = new THREE.LineBasicMaterial({ color: 0x00ff80 });
        const yLine = new THREE.Line(yGeometry, yMaterial);
        axesGroup.add(yLine);

        // Eje Z (Momentum) - Azul
        const zGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(this.cubeSize/2 + 1, -this.cubeSize/2 - 1, -this.cubeSize/2),
            new THREE.Vector3(this.cubeSize/2 + 1, -this.cubeSize/2 - 1, this.cubeSize/2 + 2)
        ]);
        const zMaterial = new THREE.LineBasicMaterial({ color: 0x0080ff });
        const zLine = new THREE.Line(zGeometry, zMaterial);
        axesGroup.add(zLine);

        this.scene.add(axesGroup);
        this.axes = axesGroup;
    }

    createParticles() {
        const particleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        
        for (let i = 0; i < this.particleCount; i++) {
            // Quantum-based color calculations
            const phase = (i / this.particleCount) * PI * 2;
            const quantumColor = getQuantumColor(phase);
            const color = new THREE.Color().setHSL(
                quantumColor.h,
                quantumColor.s,
                quantumColor.l
            );
            
            const material = new THREE.MeshPhongMaterial({ 
                color: color,
                transparent: true,
                opacity: 0.8,
                shininess: 100
            });
            
            const particle = new THREE.Mesh(particleGeometry, material);
            
            // Posición inicial dentro del cubo
            particle.position.set(
                (Math.random() - 0.5) * this.cubeSize,
                (Math.random() - 0.5) * this.cubeSize,
                (Math.random() - 0.5) * this.cubeSize
            );
            
            // Propiedades de fluido
            // Initial velocity based on quantum phase calculations
            const velPhase = (i / this.particleCount) * PI * 2;
            const velVector = calculateQuantumVector(velPhase, {
                x: velPhase * PHI,
                y: velPhase * E,
                z: velPhase * PI
            });
            particle.velocity = new THREE.Vector3(
                velVector.x * 0.1,
                velVector.y * 0.1,
                velVector.z * 0.1
            );
            
            particle.mass = Math.random() * 0.5 + 0.5;
            particle.life = Math.random() * 100;
            particle.maxLife = 100;
            
            // Propiedades del símbolo simulado
            particle.volume = Math.random() * 10000000;
            particle.volatility = Math.random();
            particle.momentum = (Math.random() - 0.5) * 2;
            particle.price = Math.random() * 1000 + 10;
            
            this.scene.add(particle);
            this.particles.push(particle);
        }
    }

    updateFluidDynamics() {
        const time = Date.now() * 0.001;
        
        this.particles.forEach((particle, index) => {
            // Actualizar propiedades basadas en el tiempo
            particle.life += 1;
            if (particle.life > particle.maxLife) {
                particle.life = 0;
                // Reinicializar propiedades al renovar partícula
                particle.volume = Math.random() * 10000000;
                particle.volatility = Math.random();
                particle.momentum = (Math.random() - 0.5) * 2;
                particle.price = Math.random() * 1000 + 10;
            }

            // Cálculo de fuerzas de fluido
            const viscosityForce = particle.velocity.clone().multiplyScalar(-this.viscosity * 0.01);
            const turbulenceForce = new THREE.Vector3(
                (Math.random() - 0.5) * this.turbulence * 0.02,
                (Math.random() - 0.5) * this.turbulence * 0.02,
                (Math.random() - 0.5) * this.turbulence * 0.02
            );

            // Fuerza gravitacional hacia el centro
            const centerForce = particle.position.clone().multiplyScalar(-0.001);

            // Aplicar fuerzas
            particle.velocity.add(viscosityForce);
            particle.velocity.add(turbulenceForce);
            particle.velocity.add(centerForce);

            // Aplicar momentum
            particle.velocity.multiplyScalar(this.momentum);

            // Actualizar posición
            particle.position.add(particle.velocity);

            // Mantener partículas dentro del cubo con rebote
            const bounds = this.cubeSize / 2;
            ['x', 'y', 'z'].forEach(axis => {
                if (Math.abs(particle.position[axis]) > bounds) {
                    particle.position[axis] = Math.sign(particle.position[axis]) * bounds;
                    particle.velocity[axis] *= -0.8; // Rebote con pérdida de energía
                }
            });

            // Actualizar color basado en propiedades
            const normalizedVolume = Math.min(particle.volume / 5000000, 1);
            const normalizedVolatility = particle.volatility;
            const normalizedMomentum = (particle.momentum + 2) / 4;

            const hue = (normalizedVolume * 0.3 + normalizedVolatility * 0.4 + normalizedMomentum * 0.3) % 1;
            particle.material.color.setHSL(hue * 0.6 + 0.2, 0.8, 0.6);

            // Actualizar tamaño basado en volumen
            const scale = 0.5 + normalizedVolume * 1.5;
            particle.scale.setScalar(scale);

            // Actualizar opacidad basada en vida
            const lifeRatio = particle.life / particle.maxLife;
            particle.material.opacity = 0.3 + Math.sin(lifeRatio * Math.PI) * 0.5;
        });
    }

    updateSymbolData(symbolsData) {
        if (!symbolsData || symbolsData.length === 0) return;

        // Actualizar hasta maxSymbols partículas con datos reales
        const realDataCount = Math.min(symbolsData.length, this.maxSymbols);
        
        for (let i = 0; i < realDataCount; i++) {
            const symbol = symbolsData[i];
            const particle = this.particles[i];
            
            if (particle && symbol) {
                // Mapear datos reales a propiedades de partícula
                particle.volume = parseFloat(symbol.volume) || particle.volume;
                particle.volatility = Math.min(Math.abs(parseFloat(symbol.priceChangePercent) || 0) / 10, 1);
                particle.momentum = (parseFloat(symbol.priceChangePercent) || 0) / 10;
                particle.price = parseFloat(symbol.price) || particle.price;
                
                // Actualizar posición basada en métricas
                const normalizedVolume = Math.min(particle.volume / 100000000, 1);
                const normalizedVolatility = particle.volatility;
                const normalizedMomentum = (particle.momentum + 1) / 2;
                
                // Mapear a posición en el cubo
                const targetX = (normalizedVolume - 0.5) * this.cubeSize * 0.8;
                const targetY = (normalizedVolatility - 0.5) * this.cubeSize * 0.8;
                const targetZ = (normalizedMomentum - 0.5) * this.cubeSize * 0.8;
                
                // Suavizar transición
                particle.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.02);
                
                // Almacenar datos del símbolo
                particle.symbolData = symbol;
            }
        }
    }

    switchMode(mode) {
        this.fluidMode = mode;
        const modeButton = document.getElementById('cube-mode');
        
        switch (mode) {
            case 'fluid':
                modeButton.textContent = '🌊 Fluidos';
                modeButton.dataset.mode = 'particle';
                break;
            case 'particle':
                modeButton.textContent = '⚛️ Partículas';
                modeButton.dataset.mode = 'network';
                break;
            case 'network':
                modeButton.textContent = '🕸️ Red';
                modeButton.dataset.mode = 'fluid';
                break;
        }
        
        this.updateNarrative(`Modo cambiado a: ${mode}`);
    }

    updateNarrative(message) {
        const narrativeElement = document.getElementById('narrative-message');
        if (narrativeElement) {
            const narratives = [
                "Los patrones emergen desde las profundidades cuánticas...",
                "Las corrientes del mar de Binance revelan oportunidades ocultas.",
                "La mecánica de fluidos cuántica detecta anomalías en la liquidez.",
                "Los poetas chilenos susurran números primos al viento digital.",
                "El caos y el orden danzan en perfecta armonía cuántica.",
                "Las partículas de capital siguen las leyes de la física financiera.",
                message || "Observando la sinfonía del mercado en tiempo real..."
            ];
            
            const randomNarrative = narratives[Math.floor(Math.random() * narratives.length)];
            narrativeElement.textContent = randomNarrative;
        }
    }

    toggleRotation() {
        this.isRotating = !this.isRotating;
        if (this.isRotating) {
            this.controls.autoRotate = true;
            this.controls.autoRotateSpeed = 2;
        } else {
            this.controls.autoRotate = false;
        }
    }

    resetCamera() {
        this.camera.position.set(15, 15, 15);
        this.camera.lookAt(0, 0, 0);
        this.controls.reset();
    }

    bindEvents() {
        // Control de rotación
        document.getElementById('rotate-cube')?.addEventListener('click', () => {
            this.toggleRotation();
        });

        // Reset de cámara
        document.getElementById('zoom-reset')?.addEventListener('click', () => {
            this.resetCamera();
        });

        // Cambio de modo
        document.getElementById('cube-mode')?.addEventListener('click', (e) => {
            const currentMode = e.target.dataset.mode;
            this.switchMode(currentMode);
        });

        // Actualizar narrativa periódicamente
        setInterval(() => {
        // Narrative update based on quantum phase
        const now = Date.now() * 0.001;
        const narrativePhase = Math.sin(now * PHI) * Math.cos(now * Math.PI);
        if (narrativePhase > 0.9) { // Deterministic narrative trigger
            this.updateNarrative();
        }
        }, 3000);
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        // Actualizar mecánica de fluidos
        this.updateFluidDynamics();
        
        // Rotar cubo principal suavemente
        if (this.cube) {
            this.cube.rotation.y += 0.002;
            this.cube.rotation.x += 0.001;
        }
        
        // Animar luces
        const time = Date.now() * 0.001;
        if (this.lights.point) {
            this.lights.point.position.x = Math.sin(time * 0.5) * 8;
            this.lights.point.position.z = Math.cos(time * 0.5) * 8;
        }
        
        // Actualizar controles
        this.controls.update();
        
        // Renderizar escena
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        const container = document.querySelector('.cube-container');
        if (container) {
            const width = container.clientWidth;
            const height = container.clientHeight;
            
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        }
    }

    // Método para actualizar propiedades de fluido desde controles externos
    updateFluidProperties(viscosity, turbulence, momentum) {
        this.viscosity = viscosity || this.viscosity;
        this.turbulence = turbulence || this.turbulence;
        this.momentum = momentum || this.momentum;
        
        this.updateNarrative(`Propiedades de fluido actualizadas: Viscosidad=${this.viscosity.toFixed(2)}, Turbulencia=${this.turbulence.toFixed(2)}`);
    }

    // Método para obtener estadísticas del cubo
    getStats() {
        const activeParticles = this.particles.filter(p => p.life < p.maxLife * 0.9).length;
        const avgVolume = this.particles.reduce((sum, p) => sum + p.volume, 0) / this.particles.length;
        const avgVolatility = this.particles.reduce((sum, p) => sum + p.volatility, 0) / this.particles.length;
        
        return {
            activeParticles,
            totalParticles: this.particles.length,
            avgVolume: avgVolume.toFixed(0),
            avgVolatility: (avgVolatility * 100).toFixed(1),
            viscosity: this.viscosity.toFixed(2),
            turbulence: this.turbulence.toFixed(2),
            momentum: this.momentum.toFixed(2)
        };
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Limpiar geometrías y materiales
        this.particles.forEach(particle => {
            if (particle.geometry) particle.geometry.dispose();
            if (particle.material) particle.material.dispose();
        });
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        window.removeEventListener('resize', this.onWindowResize);
    }
}

// Inicializar el cubo solo si estamos en entorno navegador
if (typeof document !== 'undefined' && typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        // Esperar a que Three.js se cargue
        if (typeof THREE !== 'undefined') {
            window.quantumMarketCube = new QuantumMarketCube();
        } else {
            console.error('Three.js no está disponible. El cubo de mercado no se puede inicializar.');
        }
    });
}
