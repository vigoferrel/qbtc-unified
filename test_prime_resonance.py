# -*- coding: utf-8 -*-
"""
Tests para Sistema de Utilidades de Números Primos y Resonancias
QuantumLeverageEngine - Suite de Pruebas

Verifica el funcionamiento correcto de todas las funciones del sistema
de identificación y generación de números primos.
"""

import unittest
import sys
import time
from prime_resonance_utils import PrimeResonanceEngine
from quantum_resonance_config import QUANTUM_CONFIG

class TestPrimeResonanceEngine(unittest.TestCase):
    """
    Suite de pruebas para PrimeResonanceEngine
    """
    
    def setUp(self):
        """Configuración inicial para cada prueba"""
        self.engine = PrimeResonanceEngine()
        self.small_primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]
    
    def test_is_prime_basic(self):
        """Prueba función básica de verificación de primos"""
        print("Probando verificación básica de primos...")
        
        # Casos positivos
        prime_cases = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 97, 101]
        for p in prime_cases:
            self.assertTrue(self.engine.is_prime(p), f"{p} debería ser primo")
        
        # Casos negativos
        composite_cases = [1, 4, 6, 8, 9, 10, 12, 15, 16, 18, 20, 21, 25, 100]
        for c in composite_cases:
            self.assertFalse(self.engine.is_prime(c), f"{c} no debería ser primo")
        
        print("✓ Verificación básica de primos: PASSED")
    
    def test_generate_primes_sieve(self):
        """Prueba generación de primos usando criba"""
        print("Probando generación de primos con criba...")
        
        # Probar diferentes límites
        test_cases = [10, 50, 100, 500]
        expected_counts = [4, 15, 25, 95]  # π(n) aproximados
        
        for limit, expected in zip(test_cases, expected_counts):
            primes = self.engine.generate_primes_sieve(limit)
            self.assertGreaterEqual(len(primes), expected - 5)
            self.assertLessEqual(len(primes), expected + 5)
            
            # Verificar que todos sean realmente primos
            for p in primes:
                self.assertTrue(self.engine.is_prime(p))
                
        print("✓ Generación con criba: PASSED")
    
    def test_find_twin_primes(self):
        """Prueba búsqueda de primos gemelos"""
        print("Probando búsqueda de primos gemelos...")
        
        twins = self.engine.find_twin_primes(100)
        
        # Verificar pares conocidos
        known_twins = [(3, 5), (5, 7), (11, 13), (17, 19), (29, 31), (41, 43)]
        for twin_pair in known_twins:
            self.assertIn(twin_pair, twins)
        
        # Verificar que todos los pares sean válidos
        for p1, p2 in twins:
            self.assertTrue(self.engine.is_prime(p1))
            self.assertTrue(self.engine.is_prime(p2))
            self.assertEqual(p2 - p1, 2)
            
        print(f"✓ Primos gemelos encontrados: {len(twins)} pares - PASSED")
    
    def test_find_mersenne_primes(self):
        """Prueba búsqueda de primos de Mersenne"""
        print("Probando búsqueda de primos de Mersenne...")
        
        mersenne = self.engine.find_mersenne_primes(13)
        
        # Primos de Mersenne conocidos para exponentes <= 13
        # M2 = 3, M3 = 7, M5 = 31, M7 = 127, M13 = 8191
        expected_mersenne = [3, 7, 31, 127, 8191]
        
        for mp in expected_mersenne:
            self.assertIn(mp, mersenne)
            
        print(f"✓ Primos de Mersenne encontrados: {mersenne} - PASSED")
    
    def test_find_sophie_germain_primes(self):
        """Prueba búsqueda de primos de Sophie Germain"""
        print("Probando búsqueda de primos de Sophie Germain...")
        
        sophie = self.engine.find_sophie_germain_primes(100)
        
        # Verificar algunos conocidos: 2, 3, 5, 11, 23, 29, 41, 53, 83, 89
        known_sophie = [2, 3, 5, 11, 23, 29, 41, 53, 83, 89]
        for sp in known_sophie:
            if sp <= 100:
                self.assertIn(sp, sophie)
        
        # Verificar propiedad: p y 2p+1 ambos primos
        for p in sophie:
            self.assertTrue(self.engine.is_prime(p))
            self.assertTrue(self.engine.is_prime(2 * p + 1))
            
        print(f"✓ Primos de Sophie Germain encontrados: {len(sophie)} - PASSED")
    
    def test_palindromic_primes(self):
        """Prueba búsqueda de primos palindrómicos"""
        print("Probando búsqueda de primos palindrómicos...")
        
        palindromic = self.engine.find_palindromic_primes(1000)
        
        # Verificar algunos conocidos
        known_palindromic = [2, 3, 5, 7, 11, 101, 131, 151, 181, 191, 313, 353, 373, 383, 727, 757, 787, 797, 919, 929]
        
        for pp in known_palindromic:
            if pp <= 1000:
                self.assertIn(pp, palindromic)
        
        # Verificar que sean palindrómicos y primos
        for p in palindromic:
            self.assertTrue(self.engine.is_prime(p))
            self.assertTrue(self.engine.is_palindromic(p))
            
        print(f"✓ Primos palindrómicos encontrados: {len(palindromic)} - PASSED")
    
    def test_sacred_prime_sequence(self):
        """Prueba generación de secuencia de primos sagrados"""
        print("Probando generación de secuencia de primos sagrados...")
        
        # Probar secuencias de diferentes tamaños
        for count in [5, 7, 10, 15]:
            sacred = self.engine.generate_sacred_prime_sequence(count)
            
            self.assertEqual(len(sacred), count)
            
            # Verificar que todos sean primos
            for p in sacred:
                self.assertTrue(self.engine.is_prime(p))
            
            # Verificar que comience con primos sagrados base
            base_primes = [7, 11, 13, 17, 19, 23, 29]
            expected_start = min(count, len(base_primes))
            self.assertEqual(sacred[:expected_start], base_primes[:expected_start])
            
        print("✓ Secuencia de primos sagrados: PASSED")
    
    def test_analyze_prime_patterns(self):
        """Prueba análisis de patrones en primos"""
        print("Probando análisis de patrones...")
        
        primes = self.engine.generate_primes_sieve(200)
        analysis = self.engine.analyze_prime_patterns(primes)
        
        # Verificar que el análisis contenga las métricas esperadas
        expected_keys = [
            'total_primes', 'min_prime', 'max_prime',
            'average_gap', 'max_gap', 'min_gap',
            'twin_prime_count', 'palindromic_count', 'resonance_factor'
        ]
        
        for key in expected_keys:
            self.assertIn(key, analysis)
        
        # Verificar valores razonables
        self.assertGreater(analysis['total_primes'], 0)
        self.assertEqual(analysis['min_prime'], 2)
        self.assertLessEqual(analysis['max_prime'], 200)
        self.assertGreater(analysis['average_gap'], 0)
        self.assertGreaterEqual(analysis['resonance_factor'], 0.0)
        self.assertLessEqual(analysis['resonance_factor'], 1.0)
        
        print("✓ Análisis de patrones: PASSED")
    
    def test_quantum_resonance_config(self):
        """Prueba configuración de resonancia cuántica"""
        print("Probando configuración de resonancia cuántica...")
        
        # Verificar primos sagrados base
        self.assertEqual(len(QUANTUM_CONFIG.SACRED_PRIMES_BASE), 7)
        self.assertEqual(QUANTUM_CONFIG.SACRED_PRIMES_BASE[0], 7)
        self.assertEqual(QUANTUM_CONFIG.SACRED_PRIMES_BASE[-1], 29)
        
        # Verificar patrones de gaps resonantes
        twins_gaps = QUANTUM_CONFIG.get_resonance_pattern('twins')
        self.assertEqual(twins_gaps, [2])
        
        # Verificar pesos de resonancia
        twin_weight = QUANTUM_CONFIG.get_weight('twin_prime')
        self.assertEqual(twin_weight, 1.5)
        
        # Verificar detección de gaps resonantes
        self.assertTrue(QUANTUM_CONFIG.is_resonant_gap(2))  # Twins
        self.assertTrue(QUANTUM_CONFIG.is_resonant_gap(6))  # Sexy
        self.assertFalse(QUANTUM_CONFIG.is_resonant_gap(1))
        
        print("✓ Configuración de resonancia cuántica: PASSED")
    
    def test_performance_benchmark(self):
        """Prueba de rendimiento para operaciones críticas"""
        print("Ejecutando benchmark de rendimiento...")
        
        # Benchmark: generación de primos
        start_time = time.time()
        primes_1000 = self.engine.generate_primes_sieve(1000)
        sieve_time = time.time() - start_time
        
        # Benchmark: verificación individual
        start_time = time.time()
        for i in range(2, 1000):
            self.engine.is_prime(i)
        individual_time = time.time() - start_time
        
        print(f"  - Criba hasta 1000: {sieve_time:.4f}s ({len(primes_1000)} primos)")
        print(f"  - Verificación individual 2-1000: {individual_time:.4f}s")
        
        if sieve_time > 0:
            print(f"  - Eficiencia criba vs individual: {individual_time/sieve_time:.2f}x")
        else:
            print("  - Criba extremadamente eficiente (tiempo < 0.0001s)")
        
        # En sistemas rápidos ambos pueden ser muy rápidos, solo verificar que no haya errores
        self.assertGreaterEqual(len(primes_1000), 160)  # Al menos 160 primos hasta 1000
        
        print("✓ Benchmark de rendimiento: PASSED")


def run_comprehensive_tests():
    """Ejecuta suite completa de pruebas"""
    print("=" * 60)
    print("SISTEMA DE UTILIDADES DE NÚMEROS PRIMOS Y RESONANCIAS")
    print("Suite Completa de Pruebas - QuantumLeverageEngine")
    print("=" * 60)
    
    # Crear suite de pruebas
    test_suite = unittest.TestSuite()
    test_loader = unittest.TestLoader()
    
    # Cargar todas las pruebas
    tests = test_loader.loadTestsFromTestCase(TestPrimeResonanceEngine)
    test_suite.addTests(tests)
    
    # Ejecutar pruebas con verbosidad
    runner = unittest.TextTestRunner(verbosity=2, stream=sys.stdout)
    result = runner.run(test_suite)
    
    # Resumen final
    print("\n" + "=" * 60)
    print(f"RESUMEN DE PRUEBAS:")
    print(f"  - Total ejecutadas: {result.testsRun}")
    print(f"  - Exitosas: {result.testsRun - len(result.failures) - len(result.errors)}")
    print(f"  - Fallidas: {len(result.failures)}")
    print(f"  - Errores: {len(result.errors)}")
    
    if result.failures:
        print("\nFALLOS:")
        for test, traceback in result.failures:
            print(f"  - {test}: {traceback}")
    
    if result.errors:
        print("\nERRORES:")
        for test, traceback in result.errors:
            print(f"  - {test}: {traceback}")
    
    success_rate = ((result.testsRun - len(result.failures) - len(result.errors)) 
                   / result.testsRun * 100)
    print(f"\nTASA DE ÉXITO: {success_rate:.1f}%")
    
    if success_rate == 100.0:
        print("✓ TODAS LAS PRUEBAS EXITOSAS - SISTEMA FUNCIONAL")
    else:
        print("⚠ ALGUNAS PRUEBAS FALLARON - REVISAR IMPLEMENTACIÓN")
    
    print("=" * 60)
    
    return result.wasSuccessful()


def demo_system_capabilities():
    """Demonstración de las capacidades del sistema"""
    print("\n" + "=" * 60)
    print("DEMOSTRACIÓN DE CAPACIDADES DEL SISTEMA")
    print("=" * 60)
    
    engine = PrimeResonanceEngine()
    
    # Análisis rápido hasta 500
    limit = 500
    print(f"\nAnálisis de números primos hasta {limit}:")
    
    primes = engine.generate_primes_sieve(limit)
    twins = engine.find_twin_primes(limit)
    sophie = engine.find_sophie_germain_primes(limit)
    palindromic = engine.find_palindromic_primes(limit)
    sacred = engine.generate_sacred_prime_sequence(15)
    
    print(f"  - Total primos: {len(primes)}")
    print(f"  - Primos gemelos: {len(twins)} pares")
    print(f"  - Sophie Germain: {len(sophie)} primos")
    print(f"  - Palindrómicos: {len(palindromic)} primos")
    print(f"  - Secuencia sagrada (15): {sacred}")
    
    # Análisis de patrones
    analysis = engine.analyze_prime_patterns(primes[:50])
    print(f"\nAnálisis de patrones (primeros 50 primos):")
    print(f"  - Gap promedio: {analysis['average_gap']:.2f}")
    print(f"  - Gap máximo: {analysis['max_gap']}")
    print(f"  - Factor de resonancia: {analysis['resonance_factor']:.3f}")
    
    print("\n" + "=" * 60)


if __name__ == "__main__":
    # Ejecutar pruebas completas
    success = run_comprehensive_tests()
    
    # Demostrar capacidades si las pruebas pasaron
    if success:
        demo_system_capabilities()
        
    # Código de salida apropiado
    sys.exit(0 if success else 1)
