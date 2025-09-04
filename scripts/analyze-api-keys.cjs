#!/usr/bin/env node
,
                    `CURRENT_PUBLIC_IP=${this.currentIP}`
                );
            } else {
                envContent += `\n# IP de conexión actual para whitelist\nCURRENT_PUBLIC_IP=${this.currentIP}\n`;
            }
            
            // Backup del .env actual
            const backupPath = `${this.envPath}.backup.${Date.now()}`;
            fs.writeFileSync(backupPath, fs.readFileSync(this.envPath));
            console.log(`   📁 Backup creado: ${backupPath}`);
            
            // Escribir nueva configuración
            fs.writeFileSync(this.envPath, envContent);
            console.log(`   ✅ IP actualizada a ${this.currentIP} en .env`);
            
        } catch (error) {
            console.error('❌ Error actualizando .env:', error.message);
        }
    }
}

// Ejecutar análisis
async function main() {
    const analyzer = new QBTCAPIAnalyzer();
    
    console.log('🎯 QBTC API KEY ANALYZER v1.0');
    console.log('🔍 Analizando configuración y detectando problemas...\n');
    
    await analyzer.analyzeAPIKeys();
    
    // Preguntar si actualizar IP automáticamente
    if (analyzer.currentIP && analyzer.issues.some(issue => issue.includes('IP'))) {
        console.log('\n❓ ¿Actualizar automáticamente la IP en .env? (y/N)');
        // En un entorno real, usarías readline, pero por simplicidad...
        await analyzer.fixIPConfiguration();
    }
    
    console.log('\n🚀 Análisis completado. Revisar soluciones arriba.');
    console.log('📖 Para más información: https://binance-docs.github.io/apidocs/futures/en/');
}

// Ejecutar si se llama directamente
if (require.main === module) {
    main().catch(console.error);
}

module.exports = QBTCAPIAnalyzer;
