// Quantum physics constants for visualization
export const PHI = 1.618033988749895;  // Golden ratio (Φ)
export const PI_QUANTUM = 3.14159265359; // π
export const E_QUANTUM = 2.71828182846;  // e (Euler's number)
export const SQRT2 = 1.4142135623730951; // √2
export const LN2 = 0.6931471805599453;   // ln(2)

// Prime numbers for quantum resonance
export const PRIMES = {
    TURBULENCE: 2,
    MOMENTUM: 3,
    VOLUME: 5,
    RESONANCE: 7,
    COHERENCE: 11,
    HARMONY: 13,
    TRANSFORMATION: 17,
    CONSCIOUSNESS: 19
};

// Quantum state calculation functions
export function calculateQuantumState(baseState, primeModulator) {
    return (
        Math.sin(baseState * primeModulator * PHI) * 0.5 +
        Math.cos(baseState * E_QUANTUM) * 0.3 +
        Math.sin(baseState * PI_QUANTUM * PHI) * 0.2
    );
}

export function normalizeQuantumValue(value, min = 0, max = 1) {
    return min + Math.abs(value % 1) * (max - min);
}

// Market quantum wave functions
export function calculateQuantumWave(time, phase, frequency) {
    return Math.sin(time * frequency + phase * PHI) * 0.5 + 
           Math.cos(time * frequency + phase * E_QUANTUM) * 0.3 +
           Math.sin(time * frequency + phase * PI_QUANTUM) * 0.2;
}

export function calculateQuantumHarmonic(baseState, primeNumber, amplitude = 1) {
    const phase = baseState * primeNumber;
    return (
        Math.sin(phase * PHI) * 0.5 * amplitude +
        Math.cos(phase * E_QUANTUM) * 0.3 * amplitude +
        Math.sin(phase * PI_QUANTUM) * 0.2 * amplitude
    );
}

// Color calculation based on quantum state
export function getQuantumHue(phase) {
    return (
        (Math.sin(phase * PHI) * 0.3 + 
         Math.cos(phase * PI_QUANTUM) * 0.2 + 
         Math.sin(phase * E_QUANTUM) * 0.1 + 0.5) % 1
    );
}

export function getQuantumColor(phase, saturation = 0.8, lightness = 0.6) {
    const hue = getQuantumHue(phase);
    return { h: hue, s: saturation, l: lightness };
}

// Vector calculations with quantum influence
export function calculateQuantumVector(time, position) {
    const xPhase = Math.sin(time * PHI + position.x * 0.1);
    const yPhase = Math.cos(time * E_QUANTUM + position.y * 0.1);
    const zPhase = Math.sin(time * PI_QUANTUM + position.z * 0.1);
    
    return {
        x: xPhase,
        y: yPhase,
        z: zPhase
    };
}

// Quantum turbulence and fluid dynamics
export function calculateQuantumTurbulence(time, position, turbulenceScale = 0.02) {
    const vector = calculateQuantumVector(time, position);
    return {
        x: vector.x * turbulenceScale,
        y: vector.y * turbulenceScale,
        z: vector.z * turbulenceScale
    };
}

// Price and volume calculations
export function calculateQuantumPrice(phase, basePrice = 1000, variation = 0.5) {
    const quantum = calculateQuantumHarmonic(phase, PRIMES.VOLUME);
    return basePrice * (1 + quantum * variation);
}

export function calculateQuantumVolume(phase, baseVolume = 1000000) {
    const quantum = calculateQuantumHarmonic(phase, PRIMES.VOLUME);
    return baseVolume * (1 + Math.abs(quantum));
}
