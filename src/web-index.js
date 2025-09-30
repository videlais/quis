// Import parse() function from the source.
import quis from './index.js';

// Save a global property and function.
if (typeof window !== 'undefined') {
    window.quis = {
        parse: quis.parse
    };
} else if (typeof global !== 'undefined') {
    global.quis = {
        parse: quis.parse
    };
}
