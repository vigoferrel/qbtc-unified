#!/usr/bin/env node
/*
  scripts/scan-launchers.js
  Reverse-engineer potential launchers and port listeners across the repo.
  - Finds JS files that:
    * import/require express or http/https/net and call listen()
    * reference ports (e.g., 4000) or process.env.PORT
    * require/import BinanceRealConnector or define it
  - Prints a concise report with suspected launchers, ports, and connector usage.

  Usage (CMD):
    node scripts\scan-launchers.js
*/

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const IGNORE_DIRS = new Set(['node_modules', '.git', '.svn', '.hg', 'dist', 'build', 'out']);

function walk(dir, files = []) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return files; }
  for (const e of entries) {
    if (e.name.startsWith('.')) continue;
    if (e.isDirectory()) {
      if (IGNORE_DIRS.has(e.name)) continue;
      walk(path.join(dir, e.name), files);
    } else if (e.isFile()) {
      const ext = path.extname(e.name).toLowerCase();
      if (ext === '.js' || ext === '.mjs' || ext === '.cjs') {
        files.push(path.join(dir, e.name));
      }
    }
  }
  return files;
}

function analyzeFile(file) {
  let content = '';
  try { content = fs.readFileSync(file, 'utf8'); } catch { return null; }
  const lower = content.toLowerCase();

  const usesExpress = /require\(['"]express['"]\)|from\s+['"]express['"]/i.test(content);
  const createsServer = /(http|https)\.createServer\(|new\s+Server\(|new\s+WebSocketServer\(/i.test(content);
  const hasListen = /\.listen\s*\(/i.test(content);
  const mentionsPort4000 = /\b4000\b/.test(content) || /listen\s*\(\s*4000\s*\)/i.test(content);
  const mentionsEnvPort = /process\.env\.port|process\.env\[['"]port['"]\]/i.test(content);
  const mentionsAnyPortLiteral = /listen\s*\(\s*\d{2,5}\s*\)/i.exec(content)?.map(String) || [];
  const regexListen = /listen\s*\(\s*(\d{2,5})/ig;
  const listenPorts = [];
  let m;
  while ((m = regexListen.exec(content))) {
    listenPorts.push(Number(m[1]));
  }

  const mentionsConnectorRequire = /require\(.*BinanceRealConnector.*\)|from\s+.*BinanceRealConnector/i.test(content);
  const definesConnector = /class\s+BinanceRealConnector\b|function\s+BinanceRealConnector\b/i.test(content);

  if (usesExpress || createsServer || hasListen || mentionsConnectorRequire || definesConnector) {
    return {
      file,
      usesExpress,
      createsServer,
      hasListen,
      ports: Array.from(new Set(listenPorts)).sort((a,b)=>a-b),
      mentionsPort4000,
      mentionsEnvPort,
      mentionsConnectorRequire,
      definesConnector,
    };
  }
  return null;
}

function main() {
  const files = walk(ROOT);
  const report = [];
  for (const f of files) {
    const info = analyzeFile(f);
    if (info) report.push(info);
  }

  // Summaries
  const byPort = new Map();
  for (const r of report) {
    for (const p of r.ports) {
      if (!byPort.has(p)) byPort.set(p, []);
      byPort.get(p).push(r.file);
    }
    if (r.mentionsPort4000 && r.ports.length === 0) {
      if (!byPort.has(4000)) byPort.set(4000, []);
      byPort.get(4000).push(r.file + ' (literal 4000, no explicit listen match)');
    }
  }

  const connectorDefs = report.filter(r => r.definesConnector).map(r => r.file);
  const connectorReqs = report.filter(r => r.mentionsConnectorRequire).map(r => r.file);
  const launchers = report.filter(r => r.hasListen || r.usesExpress || r.createsServer).map(r => r.file);

  // Output
  console.log('=== Launcher/Server Scan Report ===');
  console.log('Root:', ROOT);
  console.log('Potential launchers (listen/express/createServer):', launchers.length);
  for (const f of launchers) console.log(' -', path.relative(ROOT, f));

  console.log('\nPorts detected (listen):');
  const sortedPorts = Array.from(byPort.keys()).sort((a,b)=>a-b);
  if (sortedPorts.length === 0) console.log(' - none');
  for (const p of sortedPorts) {
    console.log(` - ${p}`);
    for (const f of byPort.get(p)) console.log('    *', path.relative(ROOT, f));
  }

  if (connectorDefs.length > 0) {
    console.log('\nFiles defining BinanceRealConnector:');
    for (const f of connectorDefs) console.log(' -', path.relative(ROOT, f));
  }
  if (connectorReqs.length > 0) {
    console.log('\nFiles requiring/importing BinanceRealConnector:');
    for (const f of connectorReqs) console.log(' -', path.relative(ROOT, f));
  }

  // JSON output if requested
  if (process.argv.includes('--json')) {
    const json = { root: ROOT, launchers, ports: Object.fromEntries([...byPort.entries()]), connectorDefs, connectorReqs };
    try { fs.writeFileSync(path.join(ROOT, 'quantum-core', 'logs', 'launcher-scan.json'), JSON.stringify(json, null, 2)); } catch {}
    console.log('\nJSON saved to quantum-core/logs/launcher-scan.json (if directory exists).');
  }
}

main();

