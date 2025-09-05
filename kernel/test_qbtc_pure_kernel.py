import pytest
from qbtc_pure_kernel import QBTCKernel

class TestQBTCKernel:
    @pytest.fixture
    def setup_kernel(self):
        return QBTCKernel()

    def test_inicializacion(self, setup_kernel):
        kernel = setup_kernel
        assert kernel is not None
        assert kernel.quantum_state is not None

    def test_procesar_estado(self, setup_kernel):
        kernel = setup_kernel
        quantum_state = {
            "entanglement_level": 0.95,
            "superposition_factor": 0.87
        }

        result = kernel.procesar_estado(quantum_state)
        assert "processing_id" in result
        assert result["status"] == "processed"
        assert "processed_state" in result
