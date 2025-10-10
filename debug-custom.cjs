const quis = require('./build/quis.cjs');

console.log('Quis exports:', Object.keys(quis));
console.log('Quis default:', quis.default);
console.log('Quis type:', typeof quis);