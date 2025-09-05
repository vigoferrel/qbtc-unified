const express = require('express');
const path = require('path');
const app = express();

// Servir archivos estáticos desde frontend-unified
app.use(express.static(path.join(__dirname, '../frontend-unified')));

// Ruta principal sirve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend-unified/index.html'));
});

// Puerto para el frontend
const port = 8090;
app.listen(port, () => {
    console.log(`Frontend server running on http://localhost:${port}`);
});
