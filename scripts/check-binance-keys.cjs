#!/usr/bin/env node
,
                    `CURRENT_PUBLIC_IP=${this.currentIP}`
                );
            } else {
                envContent += `\n# IP de conexión actual para whitelist\nCURRENT_PUBLIC_IP=${this.currentIP}\n`;
            }
            
            fs.writeFileSync(this.envPath, envContent);
            console.log(`   ✅ IP actualizada a ${this.currentIP} en .env`);
            console.log(`   🔔 Recuerda actualizar la whitelist en Binance también`);
            
        } catch (error) {
            console.error(`   ❌ Error actualizando .env: ${error.message}`);
        }
    }
}

// Ejecutar
if (require.main === module) {
    const checker = new SimpleBinanceChecker();
    checker.checkAPI().catch(console.error);
}

module.exports = SimpleBinanceChecker;
