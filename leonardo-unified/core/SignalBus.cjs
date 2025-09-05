// SignalBus.js
module.exports.publish = function(signal, source) {
    console.log(`[SIGNAL BUS] Señal publicada desde ${source}:`, signal);
};
