/**
 * Quis DSL Parser - Main Entry Point
 * 
 * A lightweight domain-specific language for data sorting and filtering.
 * Supports key-value pair access, complex boolean expressions, and more.
 */

import type { Quis, Parser, ParseOptions, ParseResult, CustomConditionRegistry, CustomConditionEvaluator } from './types.js';

// Import the generated parser - we'll type it properly
// eslint-disable-next-line @typescript-eslint/no-require-imports
const quis = require('../build/quis.cjs') as Parser;

// Global registry for custom conditions
const customConditions: CustomConditionRegistry = {};

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
     * 
     * // With custom conditions
     * quis.addCustomCondition('contains', (value, expected) => 
     *   String(value).includes(String(expected))
     * );
     * const customResult = quis.parse('$text custom:contains "hello"', {
     *   values: (name) => name === 'text' ? 'hello world' : null
     * }); // returns true
     * ```
     */
    parse: (input: string, options?: ParseOptions): ParseResult => {
        // Merge global custom conditions with options
        const mergedOptions: ParseOptions = {
            ...options,
            customConditions: {
                ...customConditions,
                ...options?.customConditions
            }
        };
        return quis.parse(input, mergedOptions);
    },

    /**
     * Enhanced syntax error class for better error handling
     */
    SyntaxError: quis.SyntaxError,

    /**
     * Add a custom condition evaluator
     * @param name - The name of the custom condition
     * @param evaluator - Function that evaluates the condition
     * 
     * @example
     * ```typescript
     * // Add a custom condition for string contains
     * quis.addCustomCondition('contains', (value, expected) => 
     *   String(value).includes(String(expected))
     * );
     * 
     * // Use in expressions: $text custom:contains "substring"
     * ```
     */
    addCustomCondition: (name: string, evaluator: CustomConditionEvaluator): void => {
        customConditions[name] = evaluator;
    },

    /**
     * Remove a custom condition evaluator
     * @param name - The name of the custom condition to remove
     * @returns True if the condition was removed, false if it didn't exist
     */
    removeCustomCondition: (name: string): boolean => {
        if (name in customConditions) {
            delete customConditions[name];
            return true;
        }
        return false;
    },

    /**
     * Get all registered custom conditions
     * @returns A copy of the custom condition registry
     */
    getCustomConditions: (): CustomConditionRegistry => {
        return { ...customConditions };
    },

    /**
     * Clear all custom conditions
     */
    clearCustomConditions: (): void => {
        Object.keys(customConditions).forEach(key => {
            delete customConditions[key];
        });
    }
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
    CustomConditionEvaluator,
    CustomConditionRegistry,
    Location,
    Expected,
    QuitSyntaxError
} from './types.js';