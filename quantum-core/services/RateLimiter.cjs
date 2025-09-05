class RateLimiter {
  constructor({ tokensPerInterval = 300, intervalMs = 10000 } = {}) {
    // Usar valores de configuración optimizados para Binance Futures
    this.tokensPerInterval = parseInt(process.env.BINANCE_RATE_LIMIT_ORDERS) || tokensPerInterval;
    this.intervalMs = parseInt(process.env.BINANCE_RATE_LIMIT_WINDOW) || intervalMs;
    this.tokens = this.tokensPerInterval;
    this.lastRefill = Date.now();
    this.queue = [];
    this.refillTimer = setInterval(() => this._refill(), Math.min(this.intervalMs / 4, 2500)).unref?.();
    
    console.log(`[RATE LIMITER] ⚡ Configurado: ${this.tokensPerInterval} tokens cada ${this.intervalMs}ms`);
  }

  _refill() {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    if (elapsed <= 0) return;
    const add = (elapsed / this.intervalMs) * this.tokensPerInterval;
    this.tokens = Math.min(this.tokensPerInterval, this.tokens + add);
    this.lastRefill = now;
    this._drain();
  }

  _drain() {
    while (this.tokens >= 1 && this.queue.length > 0) {
      this.tokens -= 1;
      const next = this.queue.shift();
      next();
    }
  }

  acquire() {
    return new Promise((resolve) => {
      if (this.tokens >= 1) {
        this.tokens -= 1;
        resolve();
      } else {
        this.queue.push(resolve);
      }
    });
  }

  // Exponer estadísticas para diagnóstico
  getStats() {
    return {
      tokensPerInterval: this.tokensPerInterval,
      intervalMs: this.intervalMs,
      tokensAvailable: Math.floor(this.tokens),
      queueLength: this.queue.length,
      lastRefill: this.lastRefill
    };
  }
}

module.exports = RateLimiter;

