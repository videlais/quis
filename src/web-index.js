// Import parse() function.
import quis from '../build/quis.cjs';

// Save a global property and function.
window.quis = {
    parse: quis.parse
};
