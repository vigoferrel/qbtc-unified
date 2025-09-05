// analizar-estructura.js
// Diagnóstico de estructura de directorios y componentes principales
const fs = require('fs');
const path = require('path');

// Función para analizar la estructura de directorios
function analizarDirectorio(raiz) {
    let resultado = [];
    function recorrer(dir, nivel = 0) {
        const elementos = fs.readdirSync(dir);
        elementos.forEach(el => {
            const ruta = path.join(dir, el);
            const stats = fs.statSync(ruta);
            resultado.push({
                nombre: el,
                ruta: ruta,
                tipo: stats.isDirectory() ? 'directorio' : 'archivo',
                nivel: nivel
            });
            if (stats.isDirectory()) {
                recorrer(ruta, nivel + 1);
            }
        });
    }
    recorrer(raiz);
    return resultado;
}

// Identificar componentes principales (ejemplo: archivos .js, .md, .json)
function identificarComponentes(estructura) {
    return estructura.filter(e =>
        ['.js', '.md', '.json'].includes(path.extname(e.nombre))
    );
}

// Preparar datos para enviar a OpenRouter/Gemini Flash
function prepararPayload(componentes) {
    return {
        fecha: new Date().toISOString(),
        componentes: componentes.map(c => ({
            nombre: c.nombre,
            ruta: c.ruta,
            tipo: c.tipo,
            nivel: c.nivel
        }))
    };
}

// Ejemplo de uso
const raiz = process.cwd(); // Directorio actual
const estructura = analizarDirectorio(raiz);
const componentes = identificarComponentes(estructura);
const payload = prepararPayload(componentes);

// Mostrar resultado en consola
console.log(JSON.stringify(payload, null, 2));

// Guardar resultado en archivo para integración
fs.writeFileSync('resultado-analisis.json', JSON.stringify(payload, null, 2));
