/**
 * Quis DSL Parser - Main Entry Point
 *
 * A lightweight domain-specific language for data sorting and filtering.
 * Supports key-value pair access, complex boolean expressions, and more.
 */
import type { Quis, ParseResult, CustomConditionRegistry, CustomConditionEvaluator, QuisSyntaxError as IQuisSyntaxError, Expected, Location, Context, EvaluateOptions, CompiledExpression } from './types.js';
import type { ASTNode } from './ast-types.js';
/**
 * Main Quis export with proper typing
 */
declare const QuisModule: Quis;
export default QuisModule;
export declare const parse: (input: string) => ASTNode;
export declare const evaluate: (input: string, context?: Context | null, options?: EvaluateOptions) => ParseResult;
export declare const compile: (input: string, options?: EvaluateOptions) => CompiledExpression;
export declare const SyntaxError: new (message: string, expected: Expected[], found: string | null, location?: Location) => IQuisSyntaxError;
export declare const addCustomCondition: (name: string, evaluator: CustomConditionEvaluator) => void;
export declare const removeCustomCondition: (name: string) => boolean;
export declare const getCustomConditions: () => CustomConditionRegistry;
export declare const clearCustomConditions: () => void;
export type { Quis, Parser, ParseOptions, ParseResult, Context, EvaluateOptions, CompiledExpression, ValuesCallback, CustomConditionEvaluator, CustomConditionRegistry, Location, Expected, QuisSyntaxError } from './types.js';
//# sourceMappingURL=index.d.ts.map