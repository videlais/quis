/**
 * Quis DSL Parser - Web/Browser Entry Point
 *
 * Exposes the Quis parser globally for browser environments.
 * Supports both window and global contexts for maximum compatibility.
 */
import type { Quis } from './types';
/**
 * Browser global interface extension
 */
declare global {
    interface Window {
        quis?: Quis;
    }
}
/**
 * Quis object to be exposed globally
 */
declare const quisGlobal: Quis;
export default quisGlobal;
export declare const parse: (input: string) => import("./ast-types").ASTNode, evaluate: (input: string, context?: import("./types").Context | null, options?: import("./types").EvaluateOptions) => import("./types").ParseResult, compile: (input: string, options?: import("./types").EvaluateOptions) => import("./types").CompiledExpression, SyntaxError: new (message: string, expected: import("./types").Expected[], found: string | null, location?: import("./types").Location) => import("./types").QuisSyntaxError, addCustomCondition: (name: string, evaluator: import("./types").CustomConditionEvaluator) => void, removeCustomCondition: (name: string) => boolean, getCustomConditions: () => import("./types").CustomConditionRegistry, clearCustomConditions: () => void;
//# sourceMappingURL=web-index.d.ts.map