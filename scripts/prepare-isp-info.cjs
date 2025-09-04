#!/usr/bin/env node
/*
  PREPARACIÓN INFO TÉCNICA PARA ENTEL CHILE
  Script para recopilar toda la información necesaria antes de llamar al ISP
*/

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class ISPInfoPrep {
    constructor() {
        this.ispInfo = {
            provider: 'ENTEL CHILE',
            currentIP: '181.43.212.196',
            hostname: 'xxb212-196.entelchile.net',
            router: '192.168.100.1',
            supportPhone: '600 360 1000',
            website: 'https://www.entel.cl'
        };
        this.reportFile = path.join(__dirname, '..', 'reporte-red-actual.txt');
    }

    async generateCompleteReport() {
        console.log('🔍 PREPARANDO INFORMACIÓN TÉCNICA PARA ENTEL CHILE');
        console.log('================================================\n');

        let report = '';
        report += '='.repeat(60) + '\n';
        report += 'REPORTE TÉCNICO DE RED - SOLICITUD IP ESTÁTICA\n';
        report += '='.repeat(60) + '\n';
        report += `Fecha: ${new Date().toISOString()}\n`;
        report += `ISP Identificado: ${this.ispInfo.provider}\n`;
        report += `Hostname: ${this.ispInfo.hostname}\n`;
        report += `IP Actual: ${this.ispInfo.currentIP}\n\n`;

        // 1. Información básica de red
        console.log('📊 1. RECOPILANDO INFORMACIÓN DE RED...');
        try {
            const networkInfo = await this.getNetworkInfo();
            report += networkInfo + '\n';
        } catch (error) {
            console.log(`❌ Error obteniendo info de red: ${error.message}`);
        }

        // 2. Configuración del adaptador
        console.log('🔌 2. ANALIZANDO ADAPTADORES DE RED...');
        try {
            const adapterInfo = await this.getAdapterInfo();
            report += adapterInfo + '\n';
        } catch (error) {
            console.log(`❌ Error obteniendo adaptadores: ${error.message}`);
        }

        // 3. Información del router
        console.log('🏠 3. PROBANDO CONECTIVIDAD DEL ROUTER...');
        try {
            const routerInfo = await this.getRouterInfo();
            report += routerInfo + '\n';
        } catch (error) {
            console.log(`❌ Error probando router: ${error.message}`);
        }

        // 4. DNS y conectividad externa
        console.log('🌐 4. VERIFICANDO DNS Y CONECTIVIDAD EXTERNA...');
        try {
            const dnsInfo = await this.getDNSInfo();
            report += dnsInfo + '\n';
        } catch (error) {
            console.log(`❌ Error verificando DNS: ${error.message}`);
        }

        // 5. Información específica de Entel
        console.log('📞 5. PREPARANDO INFO ESPECÍFICA DE ENTEL...');
        const entelInfo = this.getEntelSpecificInfo();
        report += entelInfo + '\n';

        // 6. Script de llamada personalizado
        const callScript = this.generateCallScript();
        report += callScript + '\n';

        // Guardar reporte
        fs.writeFileSync(this.reportFile, report);
        console.log(`\n✅ Reporte técnico generado: ${this.reportFile}`);

        // Mostrar resumen
        this.showSummary();
    }

    async getNetworkInfo() {
        let info = '1. INFORMACIÓN DE RED ACTUAL\n';
        info += '-'.repeat(40) + '\n';

        try {
            // IPv4 Configuration
            const { stdout: ipv4Info } = await execAsync('ipconfig /all');
            const lines = ipv4Info.split('\n');
            
            // Extraer información relevante
            let currentAdapter = '';
            lines.forEach(line => {
                if (line.includes('Ethernet adapter') || line.includes('Wireless LAN adapter')) {
                    currentAdapter = line.trim();
                }
                if (line.includes('IPv4 Address') && currentAdapter) {
                    info += `Adaptador: ${currentAdapter}\n`;
                    info += `${line.trim()}\n`;
                }
                if (line.includes('Subnet Mask')) {
                    info += `${line.trim()}\n`;
                }
                if (line.includes('Default Gateway')) {
                    info += `${line.trim()}\n`;
                }
                if (line.includes('DHCP Server')) {
                    info += `${line.trim()}\n`;
                }
                if (line.includes('DNS Servers')) {
                    info += `${line.trim()}\n`;
                }
            });

        } catch (error) {
            info += `Error obteniendo configuración IPv4: ${error.message}\n`;
        }

        return info;
    }

    async getAdapterInfo() {
        let info = '2. ADAPTADORES DE RED\n';
        info += '-'.repeat(40) + '\n';

        try {
            // Información de adaptadores activos
            const { stdout: netAdapters } = await execAsync('powershell "Get-NetAdapter | Where-Object {$_.Status -eq \'Up\'} | Format-Table Name, InterfaceDescription, LinkSpeed, MediaType -AutoSize"');
            info += 'Adaptadores activos:\n';
            info += netAdapters + '\n';

            // Información de IP
            const { stdout: ipAddresses } = await execAsync('powershell "Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike \'127.*\'} | Format-Table IPAddress, InterfaceAlias, PrefixLength -AutoSize"');
            info += 'Direcciones IP asignadas:\n';
            info += ipAddresses + '\n';

        } catch (error) {
            info += `Error obteniendo adaptadores: ${error.message}\n`;
        }

        return info;
    }

    async getRouterInfo() {
        let info = '3. INFORMACIÓN DEL ROUTER/GATEWAY\n';
        info += '-'.repeat(40) + '\n';

        try {
            // Ping al router
            const { stdout: pingResult } = await execAsync(`ping -n 4 ${this.ispInfo.router}`);
            info += `Ping a ${this.ispInfo.router}:\n`;
            info += pingResult + '\n';

            // ARP table
            const { stdout: arpTable } = await execAsync('arp -a');
            info += 'Tabla ARP (dispositivos en la red):\n';
            const arpLines = arpTable.split('\n').slice(0, 10); // Limitar output
            info += arpLines.join('\n') + '\n';

        } catch (error) {
            info += `Error obteniendo info del router: ${error.message}\n`;
        }

        return info;
    }

    async getDNSInfo() {
        let info = '4. DNS Y CONECTIVIDAD EXTERNA\n';
        info += '-'.repeat(40) + '\n';

        try {
            // DNS Configuration
            const { stdout: dnsConfig } = await execAsync('nslookup google.com');
            info += 'Configuración DNS actual:\n';
            info += dnsConfig + '\n';

            // Traceroute a un servidor externo
            const { stdout: tracert } = await execAsync('tracert -h 5 8.8.8.8');
            info += 'Ruta a servidor externo (primeros 5 saltos):\n';
            info += tracert + '\n';

        } catch (error) {
            info += `Error verificando DNS: ${error.message}\n`;
        }

        return info;
    }

    getEntelSpecificInfo() {
        let info = '5. INFORMACIÓN ESPECÍFICA DE ENTEL CHILE\n';
        info += '-'.repeat(40) + '\n';
        
        info += `ISP Identificado: ${this.ispInfo.provider}\n`;
        info += `Hostname DNS: ${this.ispInfo.hostname}\n`;
        info += `IP Actual: ${this.ispInfo.currentIP}\n`;
        info += `Teléfono Soporte: ${this.ispInfo.supportPhone}\n`;
        info += `Website: ${this.ispInfo.website}\n\n`;

        info += 'INFORMACIÓN DE CONTACTO ENTEL:\n';
        info += '- Atención Residencial: 600 360 1000\n';
        info += '- Atención Empresas: 600 360 3000\n';
        info += '- WhatsApp: +56 9 4000 1000\n';
        info += '- Online: www.entel.cl\n';
        info += '- App: Entel Chile\n\n';

        info += 'SERVICIOS TÍPICOS DE IP ESTÁTICA ENTEL:\n';
        info += '- Nombre: "IP Fija Residencial" o "IP Pública Estática"\n';
        info += '- Costo estimado: $8.000 - $15.000 CLP/mes\n';
        info += '- Tiempo de activación: 3-7 días hábiles\n';
        info += '- Requiere: Plan de internet vigente\n\n';

        return info;
    }

    generateCallScript() {
        let script = '6. SCRIPT PARA LLAMADA A ENTEL CHILE\n';
        script += '-'.repeat(40) + '\n';
        
        script += 'SCRIPT OPTIMIZADO PARA ENTEL:\n\n';
        
        script += '"Hola, buenos días. Necesito solicitar una IP pública estática\n';
        script += 'para mi conexión de internet residencial.\n\n';
        
        script += 'Mi información:\n';
        script += '- RUT: [TU_RUT]\n';
        script += '- Dirección de instalación: [TU_DIRECCION]\n';
        script += '- Teléfono de contacto: [TU_TELEFONO]\n';
        script += '- Plan actual: [TU_PLAN_INTERNET]\n\n';
        
        script += 'Información técnica actual:\n';
        script += `- IP dinámica actual: ${this.ispInfo.currentIP}\n`;
        script += `- Hostname: ${this.ispInfo.hostname}\n`;
        script += '- Requiero IP IPv4 estática (no IPv6)\n\n';
        
        script += 'Motivo: Necesito IP fija para aplicaciones financieras\n';
        script += 'de trading que requieren whitelist de IP específica en\n';
        script += 'plataformas internacionales como Binance.\n\n';
        
        script += 'PREGUNTAS ESPECÍFICAS PARA ENTEL:\n';
        script += '1. ¿Cuál es el costo mensual del servicio "IP Fija"?\n';
        script += '2. ¿Puedo mantener mi plan actual de internet?\n';
        script += '3. ¿Cuánto tiempo demora la activación?\n';
        script += '4. ¿Requiere visita técnica o cambio de equipo?\n';
        script += '5. ¿La IP será IPv4 dedicada?\n';
        script += '6. ¿Incluye soporte técnico especializado?\n';
        script += '7. ¿Hay costo de instalación o activación?\n';
        script += '8. ¿Puedo cancelar el servicio sin penalidad?"\n\n';

        script += 'RESPUESTAS ESPERADAS DE ENTEL:\n';
        script += '- Servicio: "IP Fija Residencial"\n';
        script += '- Costo: $8.000-$15.000 CLP/mes aproximadamente\n';
        script += '- Activación: 3-7 días hábiles\n';
        script += '- Instalación: Posiblemente requiera visita técnica\n';
        script += '- Tipo: IPv4 estática dedicada\n\n';

        script += 'NEGOCIACIÓN:\n';
        script += '- Solicitar descuento por pago anual\n';
        script += '- Pedir exención de costo de instalación\n';
        script += '- Confirmar que mantendré la velocidad actual\n';
        script += '- Solicitar prioridad por ser uso comercial/profesional\n\n';

        return script;
    }

    showSummary() {
        console.log('\n' + '='.repeat(60));
        console.log('📋 RESUMEN PARA LLAMADA A ENTEL CHILE');
        console.log('='.repeat(60));

        console.log('\n🎯 INFORMACIÓN CLAVE:');
        console.log(`   ISP: ${this.ispInfo.provider}`);
        console.log(`   Teléfono: ${this.ispInfo.supportPhone}`);
        console.log(`   IP Actual: ${this.ispInfo.currentIP}`);
        console.log(`   Hostname: ${this.ispInfo.hostname}`);
        console.log(`   Router: ${this.ispInfo.router}`);

        console.log('\n📞 PASOS INMEDIATOS:');
        console.log('   1. Revisar el archivo: reporte-red-actual.txt');
        console.log('   2. Tener a mano tu RUT y datos de la cuenta');
        console.log('   3. Llamar a Entel: 600 360 1000');
        console.log('   4. Usar el script generado en el reporte');
        console.log('   5. Negociar precio y timeline');

        console.log('\n💰 PRESUPUESTO ESTIMADO:');
        console.log('   • Costo mensual: $8.000 - $15.000 CLP');
        console.log('   • Costo instalación: $0 - $20.000 CLP (negociable)');
        console.log('   • Timeline: 3-7 días hábiles');

        console.log('\n🎯 OBJETIVO:');
        console.log('   • Obtener IP IPv4 estática dedicada');
        console.log('   • Mantener plan de internet actual');
        console.log('   • Activación en máximo 7 días');
        console.log('   • Sin costo de instalación');

        console.log('\n📱 ALTERNATIVAS DE CONTACTO ENTEL:');
        console.log('   • Teléfono: 600 360 1000');
        console.log('   • WhatsApp: +56 9 4000 1000');
        console.log('   • Web: www.entel.cl (chat online)');
        console.log('   • App: "Entel Chile"');

        console.log('\n⚠️ IMPORTANTE:');
        console.log('   • Mencionar que es para uso comercial/profesional');
        console.log('   • Especificar que requiere IPv4 (no IPv6)');
        console.log('   • Confirmar que será IP dedicada permanente');
        console.log('   • Solicitar confirmación por escrito/email');

        console.log('\n✅ PRÓXIMOS PASOS DESPUÉS DE LA LLAMADA:');
        console.log('   1. Confirmar fecha de instalación');
        console.log('   2. Preparar backup del sistema QBTC');
        console.log('   3. Documentar nueva IP cuando se active');
        console.log('   4. Configurar nueva IP en Binance whitelist');
        console.log('   5. Probar sistema QBTC con nueva IP');
    }
}

// Ejecutar preparación
if (require.main === module) {
    const prep = new ISPInfoPrep();
    prep.generateCompleteReport().catch(console.error);
}

module.exports = ISPInfoPrep;
