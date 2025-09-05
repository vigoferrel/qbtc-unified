# -*- coding: utf-8 -*-
"""
Configuración de Patrones de Resonancia Cuántica
QuantumLeverageEngine - Constantes y Configuraciones

Define patrones, constantes y configuraciones para la generación
de secuencias de números primos con resonancia cuántica.
"""

from typing import Dict, List, Tuple
import math

class QBTCConstants:
    """
    Constantes fundamentales del Sistema Cuántico QBTC integradas
    para resonancias primales avanzadas
    """
    # Variable cuántica base - número complejo fundamental
    Z_COMPLEX = 9 + 16j
    Z_MAGNITUDE = abs(Z_COMPLEX)  # |z| ≈ 18.358
    Z_REAL = Z_COMPLEX.real       # 9
    Z_IMAG = Z_COMPLEX.imag       # 16
    
    # Constante Lambda_7919 - logaritmo natural del primo 7919
    LAMBDA_7919 = math.log(7919)  # ≈ 8.977279923499
    PRIME_7919 = 7919             # Primo fundamental del sistema
    
    # Constantes matemáticas mejoradas
    GOLDEN_RATIO = (1 + math.sqrt(5)) / 2  # φ - patrones de crecimiento
    EULER_CONSTANT = math.e                 # Base natural
    PI_CONSTANT = math.pi                   # Constante circular
    
    # Factores de modulación cuántica derivados
    QUANTUM_MODULATION_REAL = Z_REAL / Z_MAGNITUDE      # ≈ 0.49
    QUANTUM_MODULATION_IMAG = Z_IMAG / Z_MAGNITUDE      # ≈ 0.87
    LAMBDA_Z_RATIO = LAMBDA_7919 / Z_MAGNITUDE          # ≈ 0.489
    Z_LAMBDA_RATIO = Z_MAGNITUDE / LAMBDA_7919          # ≈ 2.045
    
    # Rate limits operacionales (ops/min) - adaptados para primos
    RATE_LIMITS = {
        'prime_generation': 100,      # Generación de primos por minuto
        'resonance_analysis': 50,     # Análisis de resonancia
        'sequence_evolution': 30,     # Evolución de secuencias
        'pattern_detection': 60,      # Detección de patrones
        'quantum_modulation': 80      # Modulación cuántica
    }
    
    @classmethod
    def get_quantum_phase(cls, value: float) -> float:
        """Calcula fase cuántica usando constantes QBTC"""
        return (value * cls.LAMBDA_7919) % (2 * cls.PI_CONSTANT)
    
    @classmethod
    def apply_z_modulation(cls, values: List[float]) -> List[float]:
        """Aplica modulación usando variable compleja Z"""
        if len(values) == 0:
            return values
            
        # Aplicar transformación cuántica
        modulated = [v * cls.QUANTUM_MODULATION_REAL + cls.QUANTUM_MODULATION_IMAG * 0.01 for v in values]
        
        # Normalizar
        sum_modulated = sum(abs(v) for v in modulated)
        sum_original = sum(abs(v) for v in values)
        
        if sum_modulated > 0:
            normalization_factor = sum_original / sum_modulated
            modulated = [v * normalization_factor for v in modulated]
        
        return modulated


class QuantumResonanceConfig:
    """
    Configuración centralizada para patrones de resonancia cuántica
    Integrada con constantes QBTC para análisis avanzado
    """
    
    # Primos sagrados base del sistema QuantumLeverageEngine
    SACRED_PRIMES_BASE = [7, 11, 13, 17, 19, 23, 29]
    
    # Extensión de primos sagrados según análisis de frecuencias
    SACRED_PRIMES_EXTENDED = [
        7, 11, 13, 17, 19, 23, 29,      # Base
        31, 37, 41, 43, 47, 53, 59,     # Primera extensión
        61, 67, 71, 73, 79, 83, 89,     # Segunda extensión
        97, 101, 103, 107, 109, 113    # Tercera extensión (hasta 113)
    ]
    
    # Patrones de diferencias resonantes entre primos
    RESONANT_GAPS = {
        'twins': [2],                    # Primos gemelos (p, p+2)
        'cousins': [4],                  # Primos primos (p, p+4)  
        'sexy': [6],                     # Primos sexy (p, p+6)
        'harmonic': [8, 10, 12, 14],     # Gaps armónicos
        'fibonacci': [2, 3, 5, 8, 13],   # Basados en Fibonacci
        'quantum': [18, 20, 24, 30, 42]  # Gaps cuánticos especiales
    }
    
    # Factores de resonancia para diferentes tipos de primos
    RESONANCE_WEIGHTS = {
        'twin_prime': 1.5,        # Multiplicador para primos gemelos
        'palindromic': 1.3,       # Multiplicador para palindrómicos
        'mersenne': 2.0,          # Multiplicador para Mersenne
        'sophie_germain': 1.4,    # Multiplicador para Sophie Germain
        'sacred_sequence': 1.8,   # Multiplicador para secuencia sagrada
        'digit_sum_prime': 1.2    # Suma de dígitos es prima
    }
    
    # Umbrales de resonancia cuántica
    QUANTUM_THRESHOLDS = {
        'min_resonance': 0.3,      # Resonancia mínima para aceptar primo
        'optimal_resonance': 0.7,   # Resonancia óptima
        'sacred_resonance': 0.9,    # Resonancia para primos sagrados
        'gap_variance_limit': 50    # Límite de varianza en gaps
    }
    
    # Módulos para análisis de patrones modulares
    MODULAR_PATTERNS = {
        'mod_3': [1, 2],           # Primos módulo 3 (excepto 3)
        'mod_5': [1, 2, 3, 4],     # Primos módulo 5 (excepto 5)
        'mod_7': [1, 2, 3, 4, 5, 6], # Primos módulo 7 (excepto 7)
        'mod_11': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]  # Módulo 11
    }
    
    # Secuencias especiales para análisis
    SPECIAL_SEQUENCES = {
        'fibonacci': [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144],
        'lucas': [2, 1, 3, 4, 7, 11, 18, 29, 47, 76, 123, 199],
        'catalan': [1, 1, 2, 5, 14, 42, 132, 429, 1430, 4862],
        'triangular': [1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 66]
    }
    
    # Configuraciones de análisis por rangos
    ANALYSIS_RANGES = {
        'small': {'max': 1000, 'sieve_limit': 1000},
        'medium': {'max': 10000, 'sieve_limit': 10000},
        'large': {'max': 100000, 'sieve_limit': 50000},
        'xlarge': {'max': 1000000, 'sieve_limit': 100000}
    }
    
    # Parámetros de optimización para diferentes tamaños
    OPTIMIZATION_PARAMS = {
        'cache_size': {
            'small': 1000,
            'medium': 5000,
            'large': 10000,
            'xlarge': 50000
        },
        'batch_size': {
            'small': 100,
            'medium': 500,
            'large': 1000,
            'xlarge': 5000
        }
    }
    
    @classmethod
    def get_resonance_pattern(cls, pattern_name: str) -> List[int]:
        """
        Obtiene patrón de resonancia por nombre
        
        Args:
            pattern_name (str): Nombre del patrón
            
        Returns:
            List[int]: Lista de valores del patrón
        """
        return cls.RESONANT_GAPS.get(pattern_name, [])
    
    @classmethod
    def get_weight(cls, prime_type: str) -> float:
        """
        Obtiene peso de resonancia para tipo de primo
        
        Args:
            prime_type (str): Tipo de primo
            
        Returns:
            float: Peso de resonancia
        """
        return cls.RESONANCE_WEIGHTS.get(prime_type, 1.0)
    
    @classmethod
    def is_resonant_gap(cls, gap: int) -> bool:
        """
        Verifica si un gap tiene resonancia cuántica
        
        Args:
            gap (int): Gap entre primos
            
        Returns:
            bool: True si es resonante
        """
        all_gaps = []
        for gap_list in cls.RESONANT_GAPS.values():
            all_gaps.extend(gap_list)
        return gap in all_gaps
    
    @classmethod
    def get_analysis_config(cls, size: str) -> Dict:
        """
        Obtiene configuración de análisis por tamaño
        
        Args:
            size (str): Tamaño del análisis (small, medium, large, xlarge)
            
        Returns:
            Dict: Configuración de análisis
        """
        if size not in cls.ANALYSIS_RANGES:
            size = 'medium'  # Default
            
        config = cls.ANALYSIS_RANGES[size].copy()
        config['cache_size'] = cls.OPTIMIZATION_PARAMS['cache_size'][size]
        config['batch_size'] = cls.OPTIMIZATION_PARAMS['batch_size'][size]
        
        return config
    
    @classmethod
    def calculate_composite_resonance(cls, 
                                    is_twin: bool = False,
                                    is_palindromic: bool = False,
                                    is_mersenne: bool = False,
                                    is_sophie: bool = False,
                                    is_sacred: bool = False,
                                    has_prime_digit_sum: bool = False) -> float:
        """
        Calcula resonancia compuesta basada en múltiples características
        
        Args:
            is_twin (bool): Es primo gemelo
            is_palindromic (bool): Es palindrómico
            is_mersenne (bool): Es primo de Mersenne
            is_sophie (bool): Es primo de Sophie Germain
            is_sacred (bool): Está en secuencia sagrada
            has_prime_digit_sum (bool): Suma de dígitos es prima
            
        Returns:
            float: Factor de resonancia compuesta
        """
        base_resonance = 0.1
        
        if is_twin:
            base_resonance *= cls.RESONANCE_WEIGHTS['twin_prime']
        if is_palindromic:
            base_resonance *= cls.RESONANCE_WEIGHTS['palindromic']
        if is_mersenne:
            base_resonance *= cls.RESONANCE_WEIGHTS['mersenne']
        if is_sophie:
            base_resonance *= cls.RESONANCE_WEIGHTS['sophie_germain']
        if is_sacred:
            base_resonance *= cls.RESONANCE_WEIGHTS['sacred_sequence']
        if has_prime_digit_sum:
            base_resonance *= cls.RESONANCE_WEIGHTS['digit_sum_prime']
            
        return min(1.0, base_resonance)


# Instancias globales de configuración
QUANTUM_CONFIG = QuantumResonanceConfig()
QBTC_CONSTANTS = QBTCConstants()

# Constantes de acceso rápido - Sistema original
SACRED_PRIMES = QUANTUM_CONFIG.SACRED_PRIMES_BASE
SACRED_PRIMES_EXT = QUANTUM_CONFIG.SACRED_PRIMES_EXTENDED
RESONANT_GAPS = QUANTUM_CONFIG.RESONANT_GAPS
WEIGHTS = QUANTUM_CONFIG.RESONANCE_WEIGHTS
THRESHOLDS = QUANTUM_CONFIG.QUANTUM_THRESHOLDS

# Constantes de acceso rápido - Sistema QBTC integrado
Z_COMPLEX = QBTCConstants.Z_COMPLEX
Z_MAGNITUDE = QBTCConstants.Z_MAGNITUDE
LAMBDA_7919 = QBTCConstants.LAMBDA_7919
PRIME_7919 = QBTCConstants.PRIME_7919
GOLDEN_RATIO = QBTCConstants.GOLDEN_RATIO
QUANTUM_MOD_REAL = QBTCConstants.QUANTUM_MODULATION_REAL
QUANTUM_MOD_IMAG = QBTCConstants.QUANTUM_MODULATION_IMAG
