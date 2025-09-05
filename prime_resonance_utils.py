# -*- coding: utf-8 -*-
"""
Sistema de Utilidades de Números Primos y Resonancias
QuantumLeverageEngine - Diseño de Resonancias Primales

Implementa funciones para identificar y generar diferentes tipos de números primos
según la lógica de resonancia cuántica del sistema QuantumLeverageEngine.
"""

import math
import logging
from typing import List, Tuple, Dict, Set, Iterator
from functools import lru_cache
from quantum_resonance_config import QBTCConstants, QUANTUM_CONFIG

# Configuración del sistema para procesos en segundo plano
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('PrimeResonanceEngine')

class PrimeResonanceEngine:
    """
    Motor de resonancias primales para el sistema QuantumLeverageEngine
    Implementa identificación y generación de números primos con patrones sagrados
    """
    
    def __init__(self):
        """Inicializa el motor con constantes de resonancia cuántica"""
        self.sacred_primes = [7, 11, 13, 17, 19, 23, 29]
        self.quantum_threshold = 1000000  # Límite para optimización
        self.resonance_cache = {}
        logger.info("PrimeResonanceEngine inicializado con primos sagrados: %s", self.sacred_primes)
    
    @lru_cache(maxsize=10000)
    def is_prime(self, n: int) -> bool:
        """
        Determina si un número es primo usando optimizaciones cuánticas
        
        Args:
            n (int): Número a verificar
            
        Returns:
            bool: True si es primo, False en caso contrario
        """
        if n < 2:
            return False
        if n == 2:
            return True
        if n % 2 == 0:
            return False
        
        # Optimización: verificar solo hasta la raíz cuadrada
        sqrt_n = int(math.sqrt(n)) + 1
        
        # Verificación con primos conocidos primero (resonancia)
        for prime in self.sacred_primes:
            if prime > sqrt_n:
                break
            if n % prime == 0:
                return n == prime
        
        # Verificación estándar para números mayores
        for i in range(3, sqrt_n, 2):
            if n % i == 0:
                return False
        
        return True
    
    def generate_primes_sieve(self, limit: int) -> List[int]:
        """
        Genera lista de primos hasta un límite usando Criba de Eratóstenes optimizada
        
        Args:
            limit (int): Límite superior para generar primos
            
        Returns:
            List[int]: Lista de números primos
        """
        if limit < 2:
            return []
        
        logger.info("Generando primos hasta %d usando criba cuántica", limit)
        
        # Inicializar criba
        sieve = [True] * (limit + 1)
        sieve[0] = sieve[1] = False
        
        # Aplicar criba
        for i in range(2, int(math.sqrt(limit)) + 1):
            if sieve[i]:
                for j in range(i * i, limit + 1, i):
                    sieve[j] = False
        
        primes = [i for i in range(2, limit + 1) if sieve[i]]
        logger.info("Generados %d primos hasta %d", len(primes), limit)
        
        return primes
    
    def find_twin_primes(self, limit: int) -> List[Tuple[int, int]]:
        """
        Encuentra pares de primos gemelos (p, p+2) hasta un límite
        
        Args:
            limit (int): Límite superior de búsqueda
            
        Returns:
            List[Tuple[int, int]]: Lista de pares de primos gemelos
        """
        twins = []
        primes = self.generate_primes_sieve(limit)
        prime_set = set(primes)
        
        logger.info("Buscando primos gemelos hasta %d", limit)
        
        for prime in primes:
            if prime + 2 in prime_set and prime + 2 <= limit:
                twins.append((prime, prime + 2))
        
        logger.info("Encontrados %d pares de primos gemelos", len(twins))
        return twins
    
    def find_mersenne_primes(self, max_exponent: int = 31) -> List[int]:
        """
        Encuentra números primos de Mersenne de la forma 2^p - 1
        
        Args:
            max_exponent (int): Exponente máximo a verificar
            
        Returns:
            List[int]: Lista de primos de Mersenne
        """
        mersenne_primes = []
        
        logger.info("Buscando primos de Mersenne hasta exponente %d", max_exponent)
        
        # Solo verificar exponentes primos (propiedad de Mersenne)
        prime_exponents = [p for p in range(2, max_exponent + 1) if self.is_prime(p)]
        
        for p in prime_exponents:
            mersenne_candidate = (2 ** p) - 1
            if self.is_prime(mersenne_candidate):
                mersenne_primes.append(mersenne_candidate)
                logger.info("Primo de Mersenne encontrado: 2^%d - 1 = %d", p, mersenne_candidate)
        
        return mersenne_primes
    
    def find_sophie_germain_primes(self, limit: int) -> List[int]:
        """
        Encuentra primos de Sophie Germain donde p y 2p+1 son ambos primos
        
        Args:
            limit (int): Límite superior de búsqueda
            
        Returns:
            List[int]: Lista de primos de Sophie Germain
        """
        sophie_primes = []
        
        logger.info("Buscando primos de Sophie Germain hasta %d", limit)
        
        for p in range(2, limit + 1):
            if self.is_prime(p) and self.is_prime(2 * p + 1):
                sophie_primes.append(p)
        
        logger.info("Encontrados %d primos de Sophie Germain", len(sophie_primes))
        return sophie_primes
    
    def is_palindromic(self, n: int) -> bool:
        """
        Verifica si un número es palindrómico
        
        Args:
            n (int): Número a verificar
            
        Returns:
            bool: True si es palindrómico
        """
        str_n = str(n)
        return str_n == str_n[::-1]
    
    def find_palindromic_primes(self, limit: int) -> List[int]:
        """
        Encuentra números primos palindrómicos
        
        Args:
            limit (int): Límite superior de búsqueda
            
        Returns:
            List[int]: Lista de primos palindrómicos
        """
        palindromic_primes = []
        
        logger.info("Buscando primos palindrómicos hasta %d", limit)
        
        for n in range(2, limit + 1):
            if self.is_prime(n) and self.is_palindromic(n):
                palindromic_primes.append(n)
        
        logger.info("Encontrados %d primos palindrómicos", len(palindromic_primes))
        return palindromic_primes
    
    def generate_sacred_prime_sequence(self, count: int = 50) -> List[int]:
        """
        Genera secuencia de primos sagrados usando lógica cuántica QBTC mejorada
        Integra constantes Z_COMPLEX y Lambda_7919 para resonancia avanzada
        
        Args:
            count (int): Cantidad de primos sagrados a generar
            
        Returns:
            List[int]: Secuencia de primos sagrados con modulación QBTC
        """
        if count <= len(self.sacred_primes):
            return self.sacred_primes[:count]
        
        sacred_sequence = self.sacred_primes.copy()
        logger.info("Generando secuencia de %d primos sagrados con QBTC", count)
        
        # Continuar con primos usando modulación cuántica QBTC
        candidate = 31  # Siguiente primo después de 29
        
        while len(sacred_sequence) < count:
            if self.is_prime(candidate):
                # Verificar resonancia cuántica QBTC mejorada
                if self._has_qbtc_quantum_resonance(candidate, sacred_sequence):
                    sacred_sequence.append(candidate)
                    logger.info("Primo sagrado QBTC agregado: %d (total: %d)", 
                              candidate, len(sacred_sequence))
            candidate += 2  # Solo números impares
        
        # Aplicar modulación cuántica final usando Z_COMPLEX
        modulated_sequence = self._apply_qbtc_modulation(sacred_sequence)
        
        return modulated_sequence
    
    def _has_quantum_resonance(self, candidate: int, sacred_primes: List[int]) -> bool:
        """
        Verifica si un primo candidato tiene resonancia cuántica con los existentes
        Implementa lógica de resonancia basada en diferencias modulares
        
        Args:
            candidate (int): Primo candidato
            sacred_primes (List[int]): Lista de primos sagrados existentes
            
        Returns:
            bool: True si tiene resonancia cuántica
        """
        # Criterios de resonancia cuántica:
        # 1. Diferencia con último primo sagrado es múltiplo de números primales
        # 2. Suma de dígitos es prima
        # 3. No forma patrones destructivos
        
        last_sacred = sacred_primes[-1]
        difference = candidate - last_sacred
        
        # Criterio 1: Diferencia resonante
        resonant_differences = [2, 4, 6, 8, 10, 12, 14, 18, 20, 24, 30]
        has_resonant_diff = difference in resonant_differences
        
        # Criterio 2: Suma de dígitos prima
        digit_sum = sum(int(digit) for digit in str(candidate))
        has_prime_digit_sum = self.is_prime(digit_sum)
        
        # Criterio 3: No múltiplo de primos sagrados básicos (evita patrones destructivos)
        avoids_destructive = all(candidate % sp != 0 for sp in self.sacred_primes[:3])
        
        resonance = has_resonant_diff or has_prime_digit_sum
        return resonance and avoids_destructive
    
    def _has_qbtc_quantum_resonance(self, candidate: int, sacred_primes: List[int]) -> bool:
        """
        Verifica resonancia cuántica usando constantes QBTC avanzadas
        Integra Z_COMPLEX, Lambda_7919 y análisis de fase cuántica
        
        Args:
            candidate (int): Primo candidato
            sacred_primes (List[int]): Lista de primos sagrados existentes
            
        Returns:
            bool: True si tiene resonancia cuántica QBTC
        """
        # Criterios QBTC de resonancia cuántica avanzada
        last_sacred = sacred_primes[-1]
        difference = candidate - last_sacred
        
        # Criterio 1: Fase cuántica usando Lambda_7919
        quantum_phase = QBTCConstants.get_quantum_phase(candidate)
        lambda_resonance = abs(math.sin(quantum_phase)) > QBTCConstants.LAMBDA_Z_RATIO / 10
        
        # Criterio 2: Modulación compleja Z
        z_modulation = (candidate * QBTCConstants.QUANTUM_MODULATION_REAL + 
                       QBTCConstants.QUANTUM_MODULATION_IMAG * 100)
        z_resonance = abs(z_modulation % QBTCConstants.Z_MAGNITUDE - QBTCConstants.Z_REAL) < 2.0
        
        # Criterio 3: Resonancia con primo fundamental 7919
        prime_7919_resonance = (candidate % 100) in [19, 79]  # Dígitos del 7919
        
        # Criterio 4: Suma de dígitos en relación con golden ratio
        digit_sum = sum(int(digit) for digit in str(candidate))
        golden_resonance = abs(digit_sum - QBTCConstants.GOLDEN_RATIO * 10) < 3.0
        
        # Criterio 5: Gap resonante con modulación QBTC
        qbtc_resonant_gaps = [int(QBTCConstants.Z_REAL), int(QBTCConstants.Z_IMAG), 
                              int(QBTCConstants.LAMBDA_7919), 6, 12, 18, 24, 30]
        has_qbtc_resonant_gap = difference in qbtc_resonant_gaps
        
        # Evaluación combinada
        resonance_score = sum([
            lambda_resonance * 0.25,
            z_resonance * 0.20,
            prime_7919_resonance * 0.15,
            golden_resonance * 0.20,
            has_qbtc_resonant_gap * 0.20
        ])
        
        # Umbral de resonancia QBTC
        return resonance_score > 0.3 and self.is_prime(digit_sum)
    
    def _apply_qbtc_modulation(self, sequence: List[int]) -> List[int]:
        """
        Aplica modulación cuántica QBTC a una secuencia de primos
        Mantiene la primality pero ajusta orden según resonancia
        
        Args:
            sequence (List[int]): Secuencia original de primos
            
        Returns:
            List[int]: Secuencia modulada con orden cuántico optimizado
        """
        if len(sequence) <= len(self.sacred_primes):
            return sequence  # No modular secuencia base
        
        # Calcular índices de resonancia QBTC para cada primo
        resonance_indices = []
        for i, prime in enumerate(sequence):
            # Factor de resonancia basado en constantes QBTC
            z_factor = (prime * QBTCConstants.QUANTUM_MODULATION_REAL) % 1.0
            lambda_factor = math.sin(prime * QBTCConstants.LAMBDA_Z_RATIO)
            golden_factor = (prime % int(QBTCConstants.GOLDEN_RATIO * 100)) / 100.0
            
            # Índice compuesto de resonancia
            resonance_index = (z_factor + abs(lambda_factor) + golden_factor) / 3.0
            resonance_indices.append((prime, resonance_index, i))
        
        # Mantener primos base en su posición original
        base_sequence = sequence[:len(self.sacred_primes)]
        extended_sequence = sequence[len(self.sacred_primes):]
        
        # Ordenar secuencia extendida por resonancia QBTC
        extended_with_resonance = [(p, r, i) for p, r, i in resonance_indices 
                                  if i >= len(self.sacred_primes)]
        extended_with_resonance.sort(key=lambda x: x[1], reverse=True)
        
        # Reconstruir secuencia modulada
        modulated_extended = [p for p, r, i in extended_with_resonance]
        
        logger.info("Modulación QBTC aplicada: %d primos reordenados por resonancia", 
                   len(modulated_extended))
        
        return base_sequence + modulated_extended
    
    def analyze_prime_patterns(self, primes: List[int]) -> Dict:
        """
        Analiza patrones en una lista de primos para métricas cuánticas
        
        Args:
            primes (List[int]): Lista de números primos
            
        Returns:
            Dict: Análisis de patrones y métricas
        """
        if not primes:
            return {}
        
        gaps = [primes[i+1] - primes[i] for i in range(len(primes)-1)]
        
        analysis = {
            'total_primes': len(primes),
            'min_prime': min(primes),
            'max_prime': max(primes),
            'average_gap': sum(gaps) / len(gaps) if gaps else 0,
            'max_gap': max(gaps) if gaps else 0,
            'min_gap': min(gaps) if gaps else 0,
            'twin_prime_count': len(self.find_twin_primes(max(primes))),
            'palindromic_count': len([p for p in primes if self.is_palindromic(p)]),
            'resonance_factor': self._calculate_resonance_factor(primes)
        }
        
        logger.info("Análisis de patrones completado: %d primos analizados", len(primes))
        return analysis
    
    def _calculate_resonance_factor(self, primes: List[int]) -> float:
        """
        Calcula factor de resonancia cuántica para una lista de primos
        
        Args:
            primes (List[int]): Lista de primos
            
        Returns:
            float: Factor de resonancia (0.0 a 1.0)
        """
        if len(primes) < 2:
            return 0.0
        
        # Calcular resonancia basada en presencia de primos sagrados
        sacred_present = sum(1 for p in primes if p in self.sacred_primes)
        sacred_ratio = sacred_present / len(self.sacred_primes)
        
        # Factor de distribución uniforme de gaps
        gaps = [primes[i+1] - primes[i] for i in range(len(primes)-1)]
        gap_variance = sum((g - sum(gaps)/len(gaps))**2 for g in gaps) / len(gaps)
        uniformity_factor = 1.0 / (1.0 + gap_variance / 100)
        
        # Factor combinado con mejoras QBTC
        qbtc_factor = self._calculate_qbtc_resonance_enhancement(primes)
        resonance = (sacred_ratio * 0.5) + (uniformity_factor * 0.3) + (qbtc_factor * 0.2)
        return min(1.0, resonance)
    
    def _calculate_qbtc_resonance_enhancement(self, primes: List[int]) -> float:
        """
        Calcula factor de mejora de resonancia usando constantes QBTC
        
        Args:
            primes (List[int]): Lista de primos
            
        Returns:
            float: Factor de mejora QBTC (0.0 a 1.0)
        """
        if not primes:
            return 0.0
        
        # Análisis de fase cuántica promedio
        avg_quantum_phase = sum(QBTCConstants.get_quantum_phase(p) for p in primes) / len(primes)
        phase_coherence = 1.0 - abs(avg_quantum_phase - math.pi) / math.pi
        
        # Presencia del primo fundamental 7919 o múltiplos
        has_7919_relation = any(p % 7919 == 0 or p % 79 == 0 or p % 19 == 0 for p in primes[-10:])
        
        # Distribución según golden ratio
        golden_alignment = sum(1 for p in primes if abs((p % 100) - QBTCConstants.GOLDEN_RATIO * 10) < 5) / len(primes)
        
        # Factor compuesto QBTC
        qbtc_enhancement = (phase_coherence * 0.4 + 
                           (1.0 if has_7919_relation else 0.0) * 0.3 + 
                           golden_alignment * 0.3)
        
        return qbtc_enhancement
    
    def get_qbtc_analysis_report(self, primes: List[int]) -> Dict:
        """
        Genera reporte de análisis completo con métricas QBTC avanzadas
        
        Args:
            primes (List[int]): Lista de números primos
            
        Returns:
            Dict: Reporte completo de análisis QBTC
        """
        if not primes:
            return {}
        
        # Análisis básico
        basic_analysis = self.analyze_prime_patterns(primes)
        
        # Análisis QBTC avanzado
        qbtc_metrics = {
            'z_complex_magnitude': QBTCConstants.Z_MAGNITUDE,
            'lambda_7919': QBTCConstants.LAMBDA_7919,
            'prime_7919': QBTCConstants.PRIME_7919,
            'golden_ratio': QBTCConstants.GOLDEN_RATIO,
            'quantum_phase_distribution': [QBTCConstants.get_quantum_phase(p) for p in primes[-10:]],
            'z_modulation_coherence': self._calculate_z_modulation_coherence(primes),
            'lambda_resonance_strength': self._calculate_lambda_resonance_strength(primes),
            'sacred_prime_density': len([p for p in primes if p in self.sacred_primes]) / len(primes),
            'qbtc_optimization_score': self._calculate_qbtc_optimization_score(primes)
        }
        
        # Combinar análisis
        complete_report = {
            **basic_analysis,
            'qbtc_metrics': qbtc_metrics,
            'system_version': 'QBTC-Enhanced v1.0',
            'analysis_timestamp': '2025-08-14'
        }
        
        return complete_report
    
    def _calculate_z_modulation_coherence(self, primes: List[int]) -> float:
        """Calcula coherencia de modulación usando Z_COMPLEX"""
        if not primes:
            return 0.0
        
        z_modulations = []
        for prime in primes:
            z_mod = (prime * QBTCConstants.QUANTUM_MODULATION_REAL + 
                    QBTCConstants.QUANTUM_MODULATION_IMAG * 10) % QBTCConstants.Z_MAGNITUDE
            z_modulations.append(z_mod)
        
        # Coherencia como inverso de la varianza normalizada
        if len(z_modulations) < 2:
            return 1.0
        
        mean_mod = sum(z_modulations) / len(z_modulations)
        variance = sum((z - mean_mod)**2 for z in z_modulations) / len(z_modulations)
        coherence = 1.0 / (1.0 + variance / QBTCConstants.Z_MAGNITUDE)
        
        return coherence
    
    def _calculate_lambda_resonance_strength(self, primes: List[int]) -> float:
        """Calcula fuerza de resonancia usando Lambda_7919"""
        if not primes:
            return 0.0
        
        resonance_scores = []
        for prime in primes:
            # Resonancia basada en fase Lambda
            lambda_phase = (prime * QBTCConstants.LAMBDA_7919) % (2 * math.pi)
            resonance_score = abs(math.sin(lambda_phase))
            resonance_scores.append(resonance_score)
        
        # Promedio de resonancia
        avg_resonance = sum(resonance_scores) / len(resonance_scores)
        return avg_resonance
    
    def _calculate_qbtc_optimization_score(self, primes: List[int]) -> float:
        """Calcula score de optimización QBTC general"""
        if not primes:
            return 0.0
        
        # Componentes del score
        z_coherence = self._calculate_z_modulation_coherence(primes)
        lambda_strength = self._calculate_lambda_resonance_strength(primes)
        sacred_density = len([p for p in primes if p in self.sacred_primes]) / len(primes)
        qbtc_enhancement = self._calculate_qbtc_resonance_enhancement(primes)
        
        # Score compuesto
        optimization_score = (z_coherence * 0.25 + 
                            lambda_strength * 0.25 + 
                            sacred_density * 0.25 + 
                            qbtc_enhancement * 0.25)
        
        return optimization_score


def main():
    """Función principal para demostración del sistema"""
    logger.info("=== INICIANDO SISTEMA DE UTILIDADES DE PRIMOS Y RESONANCIAS ===")
    
    # Inicializar motor
    engine = PrimeResonanceEngine()
    
    # Generar análisis completo
    limit = 1000
    
    print(f"\n=== ANALISIS DE NUMEROS PRIMOS HASTA {limit} ===")
    
    # Generar primos base
    primes = engine.generate_primes_sieve(limit)
    print(f"Total de primos encontrados: {len(primes)}")
    print(f"Primeros 20 primos: {primes[:20]}")
    
    # Encontrar primos especiales
    twins = engine.find_twin_primes(limit)
    print(f"\nPrimos gemelos encontrados: {len(twins)}")
    print(f"Primeros 10 pares: {twins[:10]}")
    
    # Primos de Mersenne
    mersenne = engine.find_mersenne_primes(20)
    print(f"\nPrimos de Mersenne (exp<=20): {len(mersenne)}")
    print(f"Valores: {mersenne}")
    
    # Primos de Sophie Germain
    sophie = engine.find_sophie_germain_primes(200)
    print(f"\nPrimos de Sophie Germain (<=200): {len(sophie)}")
    print(f"Primeros 10: {sophie[:10]}")
    
    # Primos palindrómicos
    palindromic = engine.find_palindromic_primes(limit)
    print(f"\nPrimos palindromicos: {len(palindromic)}")
    print(f"Valores: {palindromic}")
    
    # Secuencia de primos sagrados
    sacred = engine.generate_sacred_prime_sequence(20)
    print(f"\nPrimeros 20 primos sagrados:")
    print(f"Secuencia: {sacred}")
    
    # Análisis de patrones
    analysis = engine.analyze_prime_patterns(primes[:100])
    print(f"\n=== ANALISIS DE PATRONES (primeros 100 primos) ===")
    for key, value in analysis.items():
        print(f"{key}: {value}")
    
    logger.info("=== ANALISIS COMPLETADO EXITOSAMENTE ===")


if __name__ == "__main__":
    main()
