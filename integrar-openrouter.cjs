// integrar-openrouter.js
// Script para enviar el diagnóstico a OpenRouter/Gemini Flash
const fetch = require('node-fetch');
const fs = require('fs');

const apiKey = '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';
const url = 'https://openrouter.ai/api/v1/chat/completions';

// Leer el JSON generado por analizar-estructura.js
const payload = JSON.parse(fs.readFileSync('resultado-analisis.json', 'utf8'));

fetch(url, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'google/gemini-flash-1.5-8b',
    messages: [{ role: 'user', content: `Analiza y optimiza esta estructura: ${JSON.stringify(payload)}` }]
  })
})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
