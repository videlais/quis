/**
 * Quis DSL Parser Types
 *
 * Type definitions for the Quis domain-specific language parser.
 */
import type { ASTNode } from './ast-types.js';
/**
 * Location information for parsing errors
 */
export interface Location {
    /** Source identifier */
    source?: string;
    /** Start position */
    start: {
        line: number;
        column: number;
        offset: number;
    };
    /** End position */
    end: {
        line: number;
        column: number;
        offset: number;
    };
}
/**
 * Expected token information for parsing errors
 */
export interface Expected {
    type: string;
    value?: string;
    description?: string;
}
/**
 * Parser syntax error with enhanced information
 */
export interface QuisSyntaxError extends Error {
    expected: Expected[];
    found: string | null;
    location?: Location;
    name: 'SyntaxError';
    format(sources?: {
        source: string;
        text: string;
    }[]): string;
}
/**
 * Values callback function type for variable resolution
 */
export type ValuesCallback = (variableName: string) => unknown;
/**
 * Custom condition evaluator function type
 */
export type CustomConditionEvaluator = (value: unknown, expected: unknown) => boolean;
/**
 * Registry of custom conditions
 */
export type CustomConditionRegistry = Record<string, CustomConditionEvaluator>;
/**
 * Options for the parse function
 */
export interface ParseOptions {
    /** Callback function to resolve variable values */
    values?: ValuesCallback;
    /** Registry of custom condition evaluators */
    customConditions?: CustomConditionRegistry;
    /** Starting rule for parsing (defaults to "Start") */
    startRule?: string;
    /** Grammar source for better error reporting */
    grammarSource?: string;
}
/**
 * Result of parsing - can be any value depending on the expression
 */
export type ParseResult = boolean | number | string | null | undefined | unknown[];
/**
 * A plain context object mapping top-level variable names to their values.
 * When evaluating `$user.age`, the evaluator looks up `context['user']` and
 * then traverses `.age` on the returned object.
 */
export type Context = Record<string, unknown>;
/**
 * Options for evaluate() and compile()
 */
export interface EvaluateOptions {
    /** Registry of custom condition evaluators */
    customConditions?: CustomConditionRegistry;
    /**
     * Escape hatch: a callback for computed or dynamic variable resolution.
     * When provided, this takes precedence over the context object.
     */
    values?: ValuesCallback;
}
/**
 * A compiled expression predicate returned by compile().
 * The AST is built once; the returned function can be called many times
 * with different context objects.
 */
export type CompiledExpression = (context?: Context | null) => ParseResult;
/**
 * Core parser interface
 */
export interface Parser {
    /** Available starting rules */
    StartRules: string[];
    /** Parser syntax error class */
    SyntaxError: new (message: string, expected: Expected[], found: string | null, location?: Location) => QuisSyntaxError;
    /** Main parsing function */
    parse: (input: string, options?: ParseOptions) => ParseResult;
}
/**
 * Main Quis interface
 */
export interface Quis {
    /**
     * Parse a DSL expression string and return its Abstract Syntax Tree.
     * Does not evaluate the expression.
     */
    parse: (input: string) => ASTNode;
    /**
     * Evaluate a DSL expression against a context object.
     * Variable names in the expression (e.g. `$age`) map to top-level keys of
     * the context (e.g. `{ age: 25 }`).
     *
     * Pass `options.values` as an escape hatch for computed / dynamic lookups.
     */
    evaluate: (input: string, context?: Context | null, options?: EvaluateOptions) => ParseResult;
    /**
     * Compile a DSL expression to a reusable predicate function.
     * The expression is tokenized and parsed once at compile time; the
     * returned function can be called many times with different contexts.
     */
    compile: (input: string, options?: EvaluateOptions) => CompiledExpression;
    /** Syntax error class for enhanced error handling */
    SyntaxError: Parser['SyntaxError'];
    /** Add a custom condition evaluator */
    addCustomCondition: (name: string, evaluator: CustomConditionEvaluator) => void;
    /** Remove a custom condition evaluator */
    removeCustomCondition: (name: string) => boolean;
    /** Get all registered custom conditions */
    getCustomConditions: () => CustomConditionRegistry;
    /** Clear all custom conditions */
    clearCustomConditions: () => void;
}
/**
 * Global browser interface extension
 */
declare global {
    interface Window {
        quis?: Quis;
    }
    namespace NodeJS {
        interface Global {
            quis?: Quis;
        }
    }
}
export default Quis;
//# sourceMappingURL=types.d.ts.map