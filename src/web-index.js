// Import parse() function.
const { parse } = require('../build/quis.js');

// Save a global property and function.
window.Quis = {
    parse: parse
};
