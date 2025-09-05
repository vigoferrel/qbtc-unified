/**
 * QBTC-UNIFIED - API Key Integration
 * Integración del ApiKeyManager con el sistema existente
 */

const { ApiKeyManager } = require('./api-key-manager');
const { CredentialsManager } = require('./quantum-core/CredentialsManager');

/**
 * Integra el ApiKeyManager con el sistema
 */
function integrateApiKeyManager(app) {
    console.log('🔄 Integrando ApiKeyManager con el sistema...');
    
    try {
        // Inicializar gestores
        const credentialsManager = CredentialsManager.getInstance();
        const apiKeyManager = ApiKeyManager.getInstance();
        
        // Validar claves de manera asíncrona
        apiKeyManager.validateKeys().then(validationResult => {
            console.log(`✅ Validación de claves API: ${validationResult.valid ? 'EXITOSA' : 'FALLIDA'}`);
        }).catch(error => {
            console.error('❌ Error en validación de claves:', error.message);
        });
        
        // Si se proporciona una app Express, configurar endpoints adicionales
        if (app) {
            // Endpoint para obtener estado detallado de las claves
            app.get('/api/keys/status', (req, res) => {
                try {
                    const keyStatus = apiKeyManager.getKeyStatus();
                    res.json({
                        success: true,
                        data: keyStatus,
                        timestamp: Date.now()
                    });
                } catch (error) {
                    console.error('Error en /api/keys/status:', error);
                    res.status(500).json({
                        success: false,
                        error: 'Error interno del servidor',
                        timestamp: Date.now()
                    });
                }
            });
            
            // Endpoint para obtener permisos de las claves
            app.get('/api/keys/permissions', (req, res) => {
                try {
                    const permissions = apiKeyManager.getPermissions();
                    res.json({
                        success: true,
                        data: permissions,
                        timestamp: Date.now()
                    });
                } catch (error) {
                    console.error('Error en /api/keys/permissions:', error);
                    res.status(500).json({
                        success: false,
                        error: 'Error interno del servidor',
                        timestamp: Date.now()
                    });
                }
            });
            
            // Endpoint para validar claves
            app.post('/api/keys/validate', async (req, res) => {
                try {
                    const result = await apiKeyManager.validateKeys();
                    res.json({
                        success: true,
                        data: result,
                        timestamp: Date.now()
                    });
                } catch (error) {
                    console.error('Error en /api/keys/validate:', error);
                    res.status(500).json({
                        success: false,
                        error: error.message || 'Error interno del servidor',
                        timestamp: Date.now()
                    });
                }
            });
            
            console.log('✅ Endpoints de API Key Manager configurados:');
            console.log('   GET /api/keys/status');
            console.log('   GET /api/keys/permissions');
            console.log('   POST /api/keys/validate');
        }
        
        return {
            apiKeyManager,
            credentialsManager,
            endpoints: [
                '/api/keys/status',
                '/api/keys/permissions',
                '/api/keys/validate'
            ]
        };
    } catch (error) {
        console.error('❌ Error en integración de ApiKeyManager:', error);
        
        // Retornar configuración mínima en caso de error
        return {
            apiKeyManager: null,
            credentialsManager: null,
            endpoints: [],
            error: error.message
        };
    }
}

// Exportar función de integración
module.exports = {
    integrateApiKeyManager
};

// Si este script se ejecuta directamente
if (require.main === module) {
    console.log('🚀 Ejecutando integración de API Key Manager...');
    try {
        const result = integrateApiKeyManager();
        console.log('✅ Integración completada');
        console.log('📊 Resultado:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('❌ Error en ejecución directa:', error);
        process.exit(1);
    }
}
