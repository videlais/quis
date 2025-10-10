import { Token, ASTNode } from './ast-types.js';
/**
 * Parser that builds an Abstract Syntax Tree from tokens
 * Handles operator precedence and creates a tree structure for evaluation
 */
export declare class Parser {
    private tokens;
    private current;
    constructor(tokens: Token[]);
    parse(): ASTNode;
    private parseOrExpression;
    private parseAndExpression;
    private parseComparisonExpression;
    private parseArithmeticExpression;
    private parseAdditionExpression;
    private parseMultiplicationExpression;
    private parseValue;
    private match;
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
}
//# sourceMappingURL=parser.d.ts.map