# qbtc_kernel_server.py
# Servidor HTTP para el Kernel QBTC - versión para ejecutar en background
# con endpoints de salud y API REST

import json
import threading
import time
import logging
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from qbtc_pure_kernel import QBTCPureKernel

# Configuración
SERVER_HOST = 'localhost'
SERVER_PORT = 3000
LOG_FORMAT = '%(asctime)s - %(levelname)s - %(message)s'

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format=LOG_FORMAT,
    handlers=[
        logging.FileHandler('C:\\Users\\DELL\\Desktop\\QBTC-UNIFIED\\logs\\qbtc_kernel.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

class QBTCKernelHandler(BaseHTTPRequestHandler):
    """Handler para el servidor HTTP del Kernel QBTC"""
    
    def __init__(self, *args, kernel_instance=None, **kwargs):
        self.kernel = kernel_instance
        self.start_time = datetime.now()
        super().__init__(*args, **kwargs)
    
    def log_message(self, format, *args):
        """Redirigir logs del servidor HTTP al logger principal"""
        logger.info(f"HTTP: {format % args}")
    
    def do_GET(self):
        """Manejar peticiones GET"""
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/health':
            self.handle_health_check()
        elif parsed_path.path == '/status':
            self.handle_status()
        elif parsed_path.path == '/constants':
            self.handle_constants()
        else:
            self.send_error(404, 'Endpoint no encontrado')
    
    def do_POST(self):
        """Manejar peticiones POST"""
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/process':
            self.handle_process_state()
        elif parsed_path.path == '/manifest':
            self.handle_manifest_intention()
        else:
            self.send_error(404, 'Endpoint no encontrado')
    
    def handle_health_check(self):
        """Endpoint de health check"""
        response = {
            'status': 'healthy',
            'service': 'QBTC Kernel',
            'timestamp': datetime.now().isoformat(),
            'uptime_seconds': (datetime.now() - self.start_time).total_seconds(),
            'kernel_initialized': self.kernel.quantum_state.get('initialized', False)
        }
        self.send_json_response(200, response)
    
    def handle_status(self):
        """Endpoint de estado del sistema"""
        response = {
            'service': 'QBTC Pure Kernel Server',
            'version': '1.0.0',
            'status': 'running',
            'start_time': self.start_time.isoformat(),
            'quantum_state': self.kernel.quantum_state,
            'constants': self.kernel.constants
        }
        self.send_json_response(200, response)
    
    def handle_constants(self):
        """Endpoint para obtener las constantes universales"""
        self.send_json_response(200, self.kernel.constants)
    
    def handle_process_state(self):
        """Endpoint para procesar estados cuánticos"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            quantum_state = json.loads(post_data.decode('utf-8'))
            
            logger.info(f"Procesando estado cuántico: {quantum_state}")
            result = self.kernel.procesar_estado(quantum_state)
            
            self.send_json_response(200, result)
            
        except json.JSONDecodeError:
            self.send_error(400, 'JSON inválido')
        except Exception as e:
            logger.error(f"Error procesando estado: {e}")
            self.send_error(500, f'Error interno: {str(e)}')
    
    def handle_manifest_intention(self):
        """Endpoint para manifestar intenciones"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            pure_query = json.loads(post_data.decode('utf-8'))
            
            logger.info(f"Manifestando intención: {pure_query}")
            result = self.kernel.manifest_intention(pure_query)
            
            self.send_json_response(200, result)
            
        except json.JSONDecodeError:
            self.send_error(400, 'JSON inválido')
        except Exception as e:
            logger.error(f"Error manifestando intención: {e}")
            self.send_error(500, f'Error interno: {str(e)}')
    
    def send_json_response(self, status_code, data):
        """Enviar respuesta JSON"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
        response_json = json.dumps(data, indent=2, ensure_ascii=False)
        self.wfile.write(response_json.encode('utf-8'))

class QBTCKernelServer:
    """Servidor principal del Kernel QBTC"""
    
    def __init__(self, host=SERVER_HOST, port=SERVER_PORT):
        self.host = host
        self.port = port
        self.kernel = QBTCPureKernel()
        self.server = None
        self.running = False
        self.metrics = {
            'requests_processed': 0,
            'states_processed': 0,
            'intentions_manifested': 0,
            'uptime_start': datetime.now()
        }
        
        logger.info(f"Inicializando servidor QBTC Kernel en {host}:{port}")
    
    def create_handler(self):
        """Crear handler con instancia del kernel"""
        def handler(*args, **kwargs):
            return QBTCKernelHandler(*args, kernel_instance=self.kernel, **kwargs)
        return handler
    
    def start_server(self):
        """Iniciar el servidor HTTP"""
        try:
            handler_class = self.create_handler()
            self.server = HTTPServer((self.host, self.port), handler_class)
            self.running = True
            
            logger.info(f"Servidor QBTC Kernel iniciado en http://{self.host}:{self.port}")
            logger.info("Endpoints disponibles:")
            logger.info("  GET  /health   - Health check")
            logger.info("  GET  /status   - Estado del sistema")
            logger.info("  GET  /constants - Constantes universales")
            logger.info("  POST /process  - Procesar estado cuántico")
            logger.info("  POST /manifest - Manifestar intención")
            
            # Iniciar thread para métricas
            metrics_thread = threading.Thread(target=self.log_metrics, daemon=True)
            metrics_thread.start()
            
            # Servir indefinidamente
            self.server.serve_forever()
            
        except KeyboardInterrupt:
            logger.info("Recibida señal de interrupción...")
            self.stop_server()
        except Exception as e:
            logger.error(f"Error fatal del servidor: {e}")
            self.stop_server()
    
    def stop_server(self):
        """Detener el servidor"""
        if self.server and self.running:
            logger.info("Deteniendo servidor QBTC Kernel...")
            self.running = False
            self.server.shutdown()
            self.server.server_close()
            logger.info("Servidor detenido")
    
    def log_metrics(self):
        """Log periódico de métricas del sistema"""
        while self.running:
            time.sleep(60)  # Log cada minuto
            
            uptime = datetime.now() - self.metrics['uptime_start']
            logger.info(f"MÉTRICAS SISTEMA - Uptime: {uptime}, "
                       f"Requests: {self.metrics['requests_processed']}, "
                       f"States: {self.metrics['states_processed']}, "
                       f"Intentions: {self.metrics['intentions_manifested']}")

def main():
    """Función principal"""
    server = QBTCKernelServer()
    
    try:
        server.start_server()
    except Exception as e:
        logger.error(f"Error iniciando servidor: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
