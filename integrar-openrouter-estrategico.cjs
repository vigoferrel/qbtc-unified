// integrar-openrouter-estrategico.js
// Envío estratégico por áreas a OpenRouter/Gemini Flash
const fetch = require('node-fetch');
const fs = require('fs');

const apiKey = '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';
const url = 'https://openrouter.ai/api/v1/chat/completions';

// Leer el JSON generado por analizar-estructura.js
const payload = JSON.parse(fs.readFileSync('resultado-analisis.json', 'utf8'));

// Función para filtrar componentes por área
function filtrarPorArea(area) {
  const areas = {
    core: c => c.ruta.includes('quantum-core'),
    scripts: c => c.ruta.includes('scripts'),
    docs: c => c.nombre.endsWith('.md'),
    config: c => c.nombre.endsWith('.json'),
    tests: c => c.ruta.includes('tests') || c.nombre.startsWith('test'),
  };
  return payload.componentes.filter(areas[area]);
}

// Áreas estratégicas
const areas = ['core', 'scripts', 'docs', 'config', 'tests'];

// Enviar cada área por separado
areas.forEach(area => {
  const componentesArea = filtrarPorArea(area);
  const resumen = {
    fecha: payload.fecha,
    area,
    componentes: componentesArea.slice(0, 30) // máximo 30 por área para evitar límite
  };
  fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'google/gemini-flash-1.5-8b',
      messages: [{ role: 'user', content: `Analiza y optimiza el área '${area}' de esta estructura: ${JSON.stringify(resumen)}` }]
    })
  })
    .then(res => res.json())
    .then(data => {
      console.log(`Respuesta para área '${area}':`);
      console.log(data);
    })
    .catch(err => console.error(`Error en área '${area}':`, err));
});
