Add a radical, non-invasive bootstrap to centralize connector attachment without editing unknown launchers.

How to enable globally (CMD, not PowerShell):

1) Set the Node preload hook when starting any Node entry point:
   set NODE_OPTIONS=--require quantum-core\bootstrap\require-hooks.js
   node path\to\your\entry.js

2) What it does:
   - Scans for BinanceRealConnector in common paths and by content signature
   - Creates/loads a single connector instance
   - Attaches it to DataService singleton
   - Warms exchangeInfo cache asynchronously

3) Consumers usage:
   const { dataService } = require('quantum-core/services/SharedInstances');
   const price = await dataService.getPrice('BTCUSDT');
   const balances = await dataService.getBalances();
   const ex = await dataService.getExchangeInfo();
   const filters = dataService.getSymbolFilters('BTCUSDT');

4) Benefits:
   - No need to modify unknown launcher files
   - Enforces a single connector process-wide
   - Reduces duplicate API calls
   - Safe: if no connector is found, system continues and logs a warning

5) Optional: make it permanent for your environment
   - System-wide or session auto-var:
     setx NODE_OPTIONS "--require %CD%\quantum-core\bootstrap\require-hooks.js"
   - Or add to your start script before node invocation.

