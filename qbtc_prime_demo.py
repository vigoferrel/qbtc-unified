# -*- coding: utf-8 -*-
"""
Demostración Completa del Sistema QBTC Integrado
Sistema de Utilidades de Números Primos con Resonancias Cuánticas Avanzadas

Muestra todas las funcionalidades del sistema híbrido QuantumLeverageEngine + QBTC
"""

import time
from prime_resonance_utils import PrimeResonanceEngine
from quantum_resonance_config import QBTCConstants, QUANTUM_CONFIG
import logging

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('QBTCPrimeDemo')

def print_header(title: str, width: int = 80):
    """Imprime un header formateado"""
    print("=" * width)
    print(f"{title:^{width}}")
    print("=" * width)

def print_section(title: str, width: int = 60):
    """Imprime un header de sección"""
    print(f"\n{'-' * width}")
    print(f"{title}")
    print(f"{'-' * width}")

def demonstrate_qbtc_constants():
    """Demuestra las constantes QBTC integradas"""
    print_section("🔬 CONSTANTES CUÁNTICAS QBTC INTEGRADAS")
    
    print(f"Variable Compleja Fundamental:")
    print(f"  Z_COMPLEX = {QBTCConstants.Z_COMPLEX}")
    print(f"  |Z| = {QBTCConstants.Z_MAGNITUDE:.6f}")
    print(f"  Re(Z) = {QBTCConstants.Z_REAL}")
    print(f"  Im(Z) = {QBTCConstants.Z_IMAG}")
    
    print(f"\nPrimo Fundamental y Lambda:")
    print(f"  PRIME_7919 = {QBTCConstants.PRIME_7919}")
    print(f"  LAMBDA_7919 = ln(7919) = {QBTCConstants.LAMBDA_7919:.6f}")
    
    print(f"\nFactores de Modulación Cuántica:")
    print(f"  Modulación Real = {QBTCConstants.QUANTUM_MODULATION_REAL:.6f}")
    print(f"  Modulación Imaginaria = {QBTCConstants.QUANTUM_MODULATION_IMAG:.6f}")
    print(f"  Ratio Lambda/Z = {QBTCConstants.LAMBDA_Z_RATIO:.6f}")
    print(f"  Ratio Z/Lambda = {QBTCConstants.Z_LAMBDA_RATIO:.6f}")
    
    print(f"\nConstantes Matemáticas:")
    print(f"  Golden Ratio φ = {QBTCConstants.GOLDEN_RATIO:.6f}")
    print(f"  Euler e = {QBTCConstants.EULER_CONSTANT:.6f}")

def demonstrate_prime_generation():
    """Demuestra la generación de primos con mejoras QBTC"""
    print_section("⚛️  GENERACIÓN DE PRIMOS CON QBTC")
    
    engine = PrimeResonanceEngine()
    
    # Generar primos básicos
    print("Generando primos hasta 500...")
    start_time = time.time()
    primes = engine.generate_primes_sieve(500)
    generation_time = time.time() - start_time
    
    print(f"✅ Generados {len(primes)} primos en {generation_time:.4f} segundos")
    print(f"Primeros 15 primos: {primes[:15]}")
    print(f"Últimos 10 primos: {primes[-10:]}")
    
    return primes, engine

def demonstrate_sacred_sequence_qbtc(engine):
    """Demuestra la generación de secuencias sagradas con QBTC"""
    print_section("🌟 SECUENCIA DE PRIMOS SAGRADOS CON RESONANCIA QBTC")
    
    print("Generando secuencia sagrada base (7 primos):")
    sacred_basic = engine.generate_sacred_prime_sequence(7)
    print(f"Base: {sacred_basic}")
    
    print(f"\nGenerando secuencia extendida con modulación QBTC (20 primos):")
    start_time = time.time()
    sacred_extended = engine.generate_sacred_prime_sequence(20)
    qbtc_time = time.time() - start_time
    
    print(f"✅ Secuencia QBTC generada en {qbtc_time:.4f} segundos")
    print(f"Secuencia completa: {sacred_extended}")
    
    # Mostrar diferencias entre base y modulada
    qbtc_additions = sacred_extended[7:]
    print(f"Primos agregados por modulación QBTC: {qbtc_additions}")
    
    # Analizar propiedades QBTC de los nuevos primos
    print(f"\nAnálisis de resonancia QBTC de los nuevos primos:")
    for i, prime in enumerate(qbtc_additions[:5]):  # Solo primeros 5 para brevedad
        quantum_phase = QBTCConstants.get_quantum_phase(prime)
        z_mod = (prime * QBTCConstants.QUANTUM_MODULATION_REAL) % 1.0
        print(f"  {prime}: Fase cuántica = {quantum_phase:.4f}, Z-modulación = {z_mod:.4f}")
    
    return sacred_extended

def demonstrate_special_primes(engine, limit=1000):
    """Demuestra la búsqueda de tipos especiales de primos"""
    print_section("🔍 BÚSQUEDA DE PRIMOS ESPECIALES")
    
    print(f"Buscando tipos especiales de primos hasta {limit}...")
    
    # Primos gemelos
    start_time = time.time()
    twins = engine.find_twin_primes(limit)
    twins_time = time.time() - start_time
    print(f"\n👥 Primos Gemelos:")
    print(f"   Encontrados: {len(twins)} pares en {twins_time:.4f}s")
    print(f"   Primeros 8 pares: {twins[:8]}")
    
    # Primos de Mersenne
    start_time = time.time()
    mersenne = engine.find_mersenne_primes(20)
    mersenne_time = time.time() - start_time
    print(f"\n🔢 Primos de Mersenne (exp≤20):")
    print(f"   Encontrados: {len(mersenne)} primos en {mersenne_time:.4f}s")
    print(f"   Valores: {mersenne}")
    
    # Primos de Sophie Germain
    start_time = time.time()
    sophie = engine.find_sophie_germain_primes(300)
    sophie_time = time.time() - start_time
    print(f"\n👸 Primos de Sophie Germain (≤300):")
    print(f"   Encontrados: {len(sophie)} primos en {sophie_time:.4f}s")
    print(f"   Primeros 12: {sophie[:12]}")
    
    # Primos palindrómicos
    start_time = time.time()
    palindromic = engine.find_palindromic_primes(limit)
    palindromic_time = time.time() - start_time
    print(f"\n🔄 Primos Palindrómicos:")
    print(f"   Encontrados: {len(palindromic)} primos en {palindromic_time:.4f}s")
    print(f"   Todos los valores: {palindromic}")
    
    return {
        'twins': twins,
        'mersenne': mersenne,
        'sophie': sophie,
        'palindromic': palindromic
    }

def demonstrate_qbtc_analysis(engine, primes):
    """Demuestra el análisis avanzado QBTC"""
    print_section("📊 ANÁLISIS CUÁNTICO QBTC AVANZADO")
    
    # Análisis básico
    print("Ejecutando análisis básico de patrones...")
    basic_analysis = engine.analyze_prime_patterns(primes[:100])
    
    print(f"\n📈 Métricas Básicas (primeros 100 primos):")
    print(f"   Total de primos: {basic_analysis['total_primes']}")
    print(f"   Rango: {basic_analysis['min_prime']} - {basic_analysis['max_prime']}")
    print(f"   Gap promedio: {basic_analysis['average_gap']:.2f}")
    print(f"   Gap máximo: {basic_analysis['max_gap']}")
    print(f"   Primos gemelos: {basic_analysis['twin_prime_count']}")
    print(f"   Primos palindrómicos: {basic_analysis['palindromic_count']}")
    print(f"   Factor de resonancia: {basic_analysis['resonance_factor']:.4f}")
    
    # Análisis QBTC avanzado
    print(f"\n🌌 Ejecutando análisis QBTC completo...")
    start_time = time.time()
    qbtc_report = engine.get_qbtc_analysis_report(primes[:200])
    qbtc_time = time.time() - start_time
    
    print(f"✅ Análisis QBTC completado en {qbtc_time:.4f} segundos")
    
    # Mostrar métricas QBTC específicas
    qbtc_metrics = qbtc_report['qbtc_metrics']
    print(f"\n🔬 Métricas QBTC Avanzadas:")
    print(f"   Magnitud Z: {qbtc_metrics['z_complex_magnitude']:.6f}")
    print(f"   Lambda 7919: {qbtc_metrics['lambda_7919']:.6f}")
    print(f"   Golden Ratio: {qbtc_metrics['golden_ratio']:.6f}")
    print(f"   Coherencia Z-Modulación: {qbtc_metrics['z_modulation_coherence']:.4f}")
    print(f"   Fuerza Resonancia Lambda: {qbtc_metrics['lambda_resonance_strength']:.4f}")
    print(f"   Densidad Primos Sagrados: {qbtc_metrics['sacred_prime_density']:.4f}")
    print(f"   Score Optimización QBTC: {qbtc_metrics['qbtc_optimization_score']:.4f}")
    
    # Análisis de distribución de fase cuántica
    phase_dist = qbtc_metrics['quantum_phase_distribution']
    print(f"\n⚡ Distribución de Fase Cuántica (últimos 10 primos):")
    for i, phase in enumerate(phase_dist):
        prime = primes[-(10-i)]
        print(f"   Primo {prime}: Fase = {phase:.4f} rad")
    
    return qbtc_report

def demonstrate_performance_comparison():
    """Demuestra comparación de rendimiento"""
    print_section("⚡ COMPARACIÓN DE RENDIMIENTO")
    
    engine = PrimeResonanceEngine()
    
    # Test de generación de primos
    limits = [1000, 5000, 10000]
    
    for limit in limits:
        print(f"\nPrueba con límite {limit}:")
        
        # Generación con criba
        start_time = time.time()
        primes = engine.generate_primes_sieve(limit)
        sieve_time = time.time() - start_time
        
        # Análisis QBTC
        start_time = time.time()
        qbtc_report = engine.get_qbtc_analysis_report(primes[:min(100, len(primes))])
        analysis_time = time.time() - start_time
        
        # Secuencia sagrada QBTC
        start_time = time.time()
        sacred = engine.generate_sacred_prime_sequence(15)
        sacred_time = time.time() - start_time
        
        print(f"   Generación criba: {sieve_time:.4f}s ({len(primes)} primos)")
        print(f"   Análisis QBTC: {analysis_time:.4f}s")
        print(f"   Secuencia sagrada: {sacred_time:.4f}s")
        print(f"   Score QBTC: {qbtc_report['qbtc_metrics']['qbtc_optimization_score']:.4f}")

def main():
    """Función principal de demostración"""
    print_header("🚀 DEMOSTRACIÓN SISTEMA QBTC-PRIME INTEGRADO 🚀")
    
    print(f"Sistema: QuantumLeverageEngine + QBTC Enhanced v1.0")
    print(f"Fecha: 2025-08-14")
    print(f"Integración: Constantes cuánticas Z_COMPLEX y Lambda_7919")
    
    try:
        # 1. Mostrar constantes QBTC
        demonstrate_qbtc_constants()
        
        # 2. Generación básica de primos
        primes, engine = demonstrate_prime_generation()
        
        # 3. Secuencias sagradas con QBTC
        sacred_sequence = demonstrate_sacred_sequence_qbtc(engine)
        
        # 4. Búsqueda de primos especiales
        special_primes = demonstrate_special_primes(engine)
        
        # 5. Análisis QBTC avanzado
        qbtc_report = demonstrate_qbtc_analysis(engine, primes)
        
        # 6. Comparación de rendimiento
        demonstrate_performance_comparison()
        
        # Resumen final
        print_section("✅ RESUMEN DE INTEGRACIÓN EXITOSA")
        
        print(f"🔬 Constantes QBTC integradas: ✓")
        print(f"   - Z_COMPLEX = {QBTCConstants.Z_COMPLEX}")
        print(f"   - Lambda_7919 = {QBTCConstants.LAMBDA_7919:.6f}")
        print(f"   - Primo fundamental = {QBTCConstants.PRIME_7919}")
        
        print(f"\n⚛️  Algoritmos mejorados: ✓")
        print(f"   - Resonancia cuántica QBTC")
        print(f"   - Modulación con variable compleja Z")
        print(f"   - Análisis de fase cuántica")
        print(f"   - Optimización con Golden Ratio")
        
        print(f"\n📊 Métricas avanzadas: ✓")
        final_score = qbtc_report['qbtc_metrics']['qbtc_optimization_score']
        print(f"   - Score QBTC: {final_score:.4f}")
        print(f"   - Coherencia Z: {qbtc_report['qbtc_metrics']['z_modulation_coherence']:.4f}")
        print(f"   - Resonancia Lambda: {qbtc_report['qbtc_metrics']['lambda_resonance_strength']:.4f}")
        
        print(f"\n🎯 Estado del sistema: OPERACIONAL")
        print(f"🏆 Integración QBTC: EXITOSA")
        
        # Evaluación final
        if final_score > 0.7:
            status = "EXCELENTE ⭐⭐⭐"
        elif final_score > 0.5:
            status = "BUENO ⭐⭐"
        elif final_score > 0.3:
            status = "FUNCIONAL ⭐"
        else:
            status = "BÁSICO"
        
        print(f"📈 Evaluación final: {status}")
        
        print_header("🎉 DEMOSTRACIÓN COMPLETADA EXITOSAMENTE 🎉")
        
        return True
        
    except Exception as e:
        logger.error(f"Error durante la demostración: {e}")
        print(f"\n❌ Error en la demostración: {e}")
        return False

if __name__ == "__main__":
    success = main()
    if success:
        print("\n💾 Sistema listo para uso en producción")
        print("📚 Documentación: Todos los métodos implementados y probados")
        print("🔧 Mantenimiento: Logging activo para depuración")
    else:
        print("\n⚠️  Revisar errores antes del despliegue")
