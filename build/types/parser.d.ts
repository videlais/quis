import { Token, ASTNode } from './ast-types.js';
/**
 * Parser that builds an Abstract Syntax Tree from tokens
 * Handles operator precedence and creates a tree structure for evaluation
 *
 * Precedence (lowest → highest):
 *   ternary → or → and → not/comparison → null-coalesce → addition → multiplication → exponent → unary → value
 */
export declare class Parser {
    private tokens;
    private current;
    constructor(tokens: Token[]);
    parse(): ASTNode;
    private parseTernaryExpression;
    private parseOrExpression;
    private parseAndExpression;
    private parseComparisonExpression;
    private parseArithmeticExpression;
    private parseNullCoalesceExpression;
    private parseAdditionExpression;
    private parseMultiplicationExpression;
    private parseExponentiationExpression;
    private parseUnaryExpression;
    private parseValue;
    private parseArrayLiteral;
    private match;
    private consumeWord;
    private matchComparison;
    private check;
    private advance;
    private isAtEnd;
    private peek;
    private previous;
    private consume;
    private createLiteralNode;
    private createVariableNode;
    private createPropertyAccessNode;
    private createBinaryNode;
    private createUnaryNode;
    private createCustomConditionNode;
    private createArrayLiteralNode;
    private createBetweenNode;
    private createTernaryNode;
}
//# sourceMappingURL=parser.d.ts.map