Connector singleton policy and migration guide

Summary
- The BinanceRealConnector is now a process-wide singleton.
- Always import the shared instance: const { connector } = require('quantum-core/BinanceRealConnector')
- Avoid creating new instances with new BinanceRealConnector(); if you do, it returns the same singleton.
- initialize() is guarded to avoid double initialization.

Rationale
- Prevent duplicate WebSocket streams and API calls.
- Eliminate conflicting initializations from multiple launchers/subsystems.
- Ensure consistent account state, caches, and metrics.

How to use
- Launcher or entry point:
  const { connector } = require('./quantum-core/BinanceRealConnector');
  await connector.initialize();

- Consumers (services, engines, analyzers):
  const { connector } = require('./quantum-core/BinanceRealConnector');
  // Read-only usage is safe; initialize() can be called but is idempotent.

- If a class expects a connector parameter, pass the shared instance:
  const monitor = new UniversalSymbolMonitor(connector);

Do and Don’t
- Do: Pass the shared connector down via DI to modules that need it.
- Do: Replace new BinanceRealConnector() with the shared export in existing code.
- Don’t: Keep separate instances in subdirectories; they will point to the same singleton but create confusion.

Refactor checklist
- Search for requires/imports of BinanceRealConnector and replace with { connector } where feasible.
- Ensure launchers use await connector.initialize() once.
- For modules that constructed their own connector, change constructors to accept a connector or use the shared one directly.

Verification
- On startup, you should only see one set of logs:
  [BINANCE REAL] Conector inicializado
  [BINANCE REAL] 🚀 Inicializando Market Maker Cuántico...
- WebSocket connection counts should match the grouping logic and not duplicate per launcher.

Troubleshooting
- If streams or initialization still duplicate, the module may cache a previous require path. Confirm only one copy of quantum-core exists in node resolution. Prefer absolute or project-relative imports.
- If a different subdirectory bundles its own copy, enforce NODE_PATH or use monorepo tooling to avoid duplicate code copies.

Advanced
- DataService is available at quantum-core/services/DataService.js for central caching and rate limiting across modules. Attach the connector once and consume data via DataService to further reduce API calls.

