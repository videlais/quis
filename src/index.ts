/**
 * Quis DSL Parser - Main Entry Point
 * 
 * A lightweight domain-specific language for data sorting and filtering.
 * Supports key-value pair access, complex boolean expressions, and more.
 */

import type { Quis, Parser, ParseOptions, ParseResult } from './types.js';

// Import the generated parser - we'll type it properly
// eslint-disable-next-line @typescript-eslint/no-require-imports
const quis = require('../build/quis.cjs') as Parser;

/**
 * Main Quis export with proper typing
 */
const QuisModule: Quis = {
    /**
     * Parse a DSL expression string
     * @param input - The DSL expression to parse
     * @param options - Optional parsing configuration
     * @returns The result of evaluating the expression
     * 
     * @example
     * ```typescript
     * import quis from 'quis';
     * 
     * // Simple boolean expression
     * const result = quis.parse('true && false'); // returns false
     * 
     * // With variables
     * const withVars = quis.parse('$user.age > 18', {
     *   values: (name) => name === 'user' ? { age: 25 } : null
     * }); // returns true
     * ```
     */
    parse: (input: string, options?: ParseOptions): ParseResult => {
        return quis.parse(input, options);
    },

    /**
     * Enhanced syntax error class for better error handling
     */
    SyntaxError: quis.SyntaxError
};

export default QuisModule;

// Named exports for convenience
export const parse = QuisModule.parse;
export const { SyntaxError } = QuisModule;

// Re-export types
export type {
    Quis,
    Parser,
    ParseOptions,
    ParseResult,
    ValuesCallback,
    Location,
    Expected,
    QuitSyntaxError
} from './types.js';