/**
 * Quis DSL Parser - Main Entry Point
 * 
 * A lightweight domain-specific language for data sorting and filtering.
 * Supports key-value pair access, complex boolean expressions, and more.
 */

import type { Quis, ParseOptions, ParseResult, CustomConditionRegistry, CustomConditionEvaluator, QuisSyntaxError as IQuisSyntaxError, Expected, Location, Context, EvaluateOptions, CompiledExpression } from './types.js';
import type { ASTNode } from './ast-types.js';
import { Tokenizer } from './tokenizer';
import { Parser } from './parser';
import { Evaluator } from './evaluator';

/**
 * SyntaxError class for parsing errors
 */
class QuisSyntaxError extends Error implements IQuisSyntaxError {
    expected: Expected[];
    found: string | null;
    location?: Location;
    name = 'SyntaxError' as const;
    
    constructor(message: string, expected: Expected[], found: string | null, location?: Location) {
        super(message);
        this.expected = expected;
        this.found = found;
        this.location = location;
    }

    format(): string {
        let result = this.message;
        if (this.location) {
            result += ` at line ${this.location.start.line}, column ${this.location.start.column}`;
        }
        return result;
    }
}

/**
 * Build an AST from an expression string
 */
function buildAST(input: string): ASTNode {
    const tokenizer = new Tokenizer(input);
    const tokens = tokenizer.tokenize();
    const parser = new Parser(tokens);
    return parser.parse();
}

/**
 * Build merged ParseOptions from a context object and EvaluateOptions.
 * Global custom conditions are always merged in; per-call options override.
 */
function buildParseOptions(context: Context | null | undefined, options?: EvaluateOptions): ParseOptions {
    const mergedConditions: CustomConditionRegistry = {};
    customConditions.forEach((fn, name) => { mergedConditions[name] = fn; });
    if (options?.customConditions) {
        Object.assign(mergedConditions, options.customConditions);
    }
    return {
        customConditions: mergedConditions,
        values: options?.values ?? ((name: string) => context?.[name] ?? null)
    };
}

// Global registry for custom conditions (Map prevents prototype pollution)
const customConditions = new Map<string, CustomConditionEvaluator>();

/**
 * Main Quis export with proper typing
 */
const QuisModule: Quis = {
    /**
     * Parse a DSL expression and return its Abstract Syntax Tree.
     * Does not evaluate the expression.
     *
     * @example
     * ```typescript
     * const ast = quis.parse('$age > 18');
     * console.log(ast.type); // 'comparison'
     * ```
     */
    parse: (input: string): ASTNode => {
        try {
            return buildAST(input);
        } catch (error) {
            if (error instanceof Error) {
                throw new QuisSyntaxError(error.message, [], null);
            }
            throw error;
        }
    },

    /**
     * Evaluate a DSL expression against a context object.
     *
     * @example
     * ```typescript
     * quis.evaluate('$user.age > 18', { user: { age: 25 } }); // true
     * quis.evaluate('$active == true', { active: true });       // true
     *
     * // Escape hatch for dynamic lookups
     * quis.evaluate('$x + $y', null, { values: (n) => n === 'x' ? 1 : 2 }); // 3
     * ```
     */
    evaluate: (input: string, context?: Context | null, options?: EvaluateOptions): ParseResult => {
        try {
            const ast = buildAST(input);
            const evaluator = new Evaluator(buildParseOptions(context, options));
            return evaluator.evaluate(ast) as ParseResult;
        } catch (error) {
            if (error instanceof QuisSyntaxError) throw error;
            if (error instanceof Error) {
                throw new QuisSyntaxError(error.message, [], null);
            }
            throw error;
        }
    },

    /**
     * Compile a DSL expression to a reusable predicate function.
     * The expression is parsed once; the returned function evaluates against
     * different context objects without re-parsing.
     *
     * @example
     * ```typescript
     * const isAdult = quis.compile('$age >= 18');
     * users.filter(u => isAdult({ age: u.age }));
     * ```
     */
    compile: (input: string, options?: EvaluateOptions): CompiledExpression => {
        // Parse eagerly — throw at compile time if the expression is invalid
        let ast: ASTNode;
        try {
            ast = buildAST(input);
        } catch (error) {
            if (error instanceof Error) {
                throw new QuisSyntaxError(error.message, [], null);
            }
            throw error;
        }
        // Snapshot global custom conditions at compile time
        const compiledConditions: CustomConditionRegistry = {};
        customConditions.forEach((fn, name) => { compiledConditions[name] = fn; });
        if (options?.customConditions) {
            Object.assign(compiledConditions, options.customConditions);
        }
        return (context?: Context | null): ParseResult => {
            const evalOptions: ParseOptions = {
                customConditions: compiledConditions,
                values: options?.values ?? ((name: string) => context?.[name] ?? null)
            };
            try {
                return new Evaluator(evalOptions).evaluate(ast) as ParseResult;
            } catch (error) {
                if (error instanceof QuisSyntaxError) throw error;
                if (error instanceof Error) {
                    throw new QuisSyntaxError(error.message, [], null);
                }
                throw error;
            }
        };
    },

    /**
     * Enhanced syntax error class for better error handling
     */
    SyntaxError: QuisSyntaxError,

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
        if (!/^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(name)) {
            throw new Error(`Invalid custom condition name: '${name}'. Names must start with a letter or underscore and contain only alphanumeric characters, underscores, or hyphens.`);
        }
        customConditions.set(name, evaluator);
    },

    /**
     * Remove a custom condition evaluator
     * @param name - The name of the custom condition to remove
     * @returns True if the condition was removed, false if it didn't exist
     */
    removeCustomCondition: (name: string): boolean => {
        return customConditions.delete(name);
    },

    /**
     * Get all registered custom conditions
     * @returns A copy of the custom condition registry
     */
    getCustomConditions: (): CustomConditionRegistry => {
        return Object.fromEntries(customConditions);
    },

    /**
     * Clear all custom conditions
     */
    clearCustomConditions: (): void => {
        customConditions.clear();
    }
};

export default QuisModule;

// Named exports for convenience and CommonJS compatibility
export const parse = QuisModule.parse;
export const evaluate = QuisModule.evaluate;
export const compile = QuisModule.compile;
export const SyntaxError = QuisModule.SyntaxError;
export const addCustomCondition = QuisModule.addCustomCondition;
export const removeCustomCondition = QuisModule.removeCustomCondition;
export const getCustomConditions = QuisModule.getCustomConditions;
export const clearCustomConditions = QuisModule.clearCustomConditions;

// Re-export types
export type {
    Quis,
    Parser,
    ParseOptions,
    ParseResult,
    Context,
    EvaluateOptions,
    CompiledExpression,
    ValuesCallback,
    CustomConditionEvaluator,
    CustomConditionRegistry,
    Location,
    Expected,
    QuisSyntaxError
} from './types.js';