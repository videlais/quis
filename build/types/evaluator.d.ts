import { ASTNode } from './ast-types.js';
import { ParseOptions } from './types.js';
/**
 * Evaluates an Abstract Syntax Tree to produce the final result
 * Handles all node types and operations defined in the Quis DSL
 */
export declare class Evaluator {
    private options;
    constructor(options?: ParseOptions);
    evaluate(node: ASTNode): unknown;
    private evaluateLiteral;
    private evaluateVariable;
    private evaluatePropertyAccess;
    private isDangerousProperty;
    private evaluateBinaryOperation;
    private evaluateUnaryOperation;
    private evaluateCustomCondition;
    private evaluateArrayLiteral;
    private evaluateBetween;
    private evaluateTernary;
}
//# sourceMappingURL=evaluator.d.ts.map