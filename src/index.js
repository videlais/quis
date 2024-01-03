// Import quis.js and export parse function.
import quis from '../build/quis.cjs';

export default {
    parse: quis.parse,
    SyntaxError: quis.SyntaxError
};
