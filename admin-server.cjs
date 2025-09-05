#!/usr/bin/env node
/**
 * ADMIN SERVER - PUERTO 8888
 * Servidor de administración para MetaConsciencia
 */

const express = require('express');

class AdminServer {
    constructor() {
        this.app = express();
        this.port = 8888;
        this.setupRoutes();
        console.log('🛠️ Admin Server inicializando...');
    }

    setupRoutes() {
        this.app.get('/health', (req, res) => {
            res.json({ status: 'OK', service: 'Admin Server', port: this.port, uptime: process.uptime() });
        });
        this.app.get('/metrics', (req, res) => {
            res.type('text/plain').send(`# Admin Metrics\nadmin_uptime_seconds ${process.uptime()}\n`);
        });
        this.app.get('/', (req, res) => res.send('Hermetic Admin Server - OK'));
    }

    start() {
        this.server = this.app.listen(this.port, () => {
            console.log(`🛠️ Admin Server ACTIVO en puerto ${this.port}`);
        });
    }
}

const server = new AdminServer();
if (require.main === module) server.start();
module.exports = { AdminServer };
