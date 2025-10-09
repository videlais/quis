/**
 * Quis DSL Parser - Main Entry Point
 *
 * A lightweight domain-specific language for data sorting and filtering.
 * Supports key-value pair access, complex boolean expressions, and more.
 */
import type { Quis, ParseOptions, ParseResult } from './types.js';
/**
 * Main Quis export with proper typing
 */
declare const QuisModule: Quis;
export default QuisModule;
export declare const parse: (input: string, options?: ParseOptions) => ParseResult;
export declare const SyntaxError: new (message: string, expected: import("./types.js").Expected[], found: string | null, location?: import("./types.js").Location) => import("./types.js").QuitSyntaxError;
export type { Quis, Parser, ParseOptions, ParseResult, ValuesCallback, Location, Expected, QuitSyntaxError } from './types.js';
//# sourceMappingURL=index.d.ts.map