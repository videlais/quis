/**
 * Quis DSL Parser - Main Entry Point
 *
 * A lightweight domain-specific language for data sorting and filtering.
 * Supports key-value pair access, complex boolean expressions, and more.
 */
import type { Quis, ParseOptions, ParseResult, CustomConditionRegistry, CustomConditionEvaluator, QuitSyntaxError, Expected, Location } from './types.js';
/**
 * Main Quis export with proper typing
 */
declare const QuisModule: Quis;
export default QuisModule;
export declare const parse: (input: string, options?: ParseOptions) => ParseResult;
export declare const SyntaxError: new (message: string, expected: Expected[], found: string | null, location?: Location) => QuitSyntaxError;
export declare const addCustomCondition: (name: string, evaluator: CustomConditionEvaluator) => void;
export declare const removeCustomCondition: (name: string) => boolean;
export declare const getCustomConditions: () => CustomConditionRegistry;
export declare const clearCustomConditions: () => void;
export type { Quis, Parser, ParseOptions, ParseResult, ValuesCallback, CustomConditionEvaluator, CustomConditionRegistry, Location, Expected, QuitSyntaxError } from './types.js';
//# sourceMappingURL=index.d.ts.map