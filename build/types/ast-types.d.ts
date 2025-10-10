/**
 * Token types for the Quis expression language
 */
export declare enum TokenType {
    NUMBER = "NUMBER",
    STRING = "STRING",
    BOOLEAN = "BOOLEAN",
    NULL = "NULL",
    VARIABLE = "VARIABLE",
    DOT = "DOT",
    LBRACKET = "LBRACKET",
    RBRACKET = "RBRACKET",
    EQUALS = "EQUALS",
    NOT_EQUALS = "NOT_EQUALS",
    GREATER_THAN = "GREATER_THAN",
    GREATER_THAN_EQUAL = "GREATER_THAN_EQUAL",
    LESS_THAN = "LESS_THAN",
    LESS_THAN_EQUAL = "LESS_THAN_EQUAL",
    PLUS = "PLUS",
    MINUS = "MINUS",
    MULTIPLY = "MULTIPLY",
    DIVIDE = "DIVIDE",
    IS = "IS",
    IS_NOT = "IS_NOT",
    GT = "GT",
    GTE = "GTE",
    LT = "LT",
    LTE = "LTE",
    AND = "AND",
    OR = "OR",
    NOT = "NOT",
    CUSTOM = "CUSTOM",
    COLON = "COLON",
    IDENTIFIER = "IDENTIFIER",
    LPAREN = "LPAREN",
    RPAREN = "RPAREN",
    EOF = "EOF",
    WHITESPACE = "WHITESPACE"
}
export interface Token {
    type: TokenType;
    value: string;
    position: number;
}
/**
 * AST Node types
 */
export interface ASTNode {
    type: string;
}
export interface LiteralNode extends ASTNode {
    type: 'literal';
    value: string | number | boolean | null;
}
export interface VariableNode extends ASTNode {
    type: 'variable';
    name: string;
}
export interface PropertyAccessNode extends ASTNode {
    type: 'property';
    object: string;
    property: string;
    notation: 'dot' | 'bracket';
}
export interface BinaryOpNode extends ASTNode {
    type: 'binary';
    operator: string;
    left: ASTNode;
    right: ASTNode;
}
export interface UnaryOpNode extends ASTNode {
    type: 'unary';
    operator: string;
    operand: ASTNode;
}
export interface CustomConditionNode extends ASTNode {
    type: 'custom';
    name: string;
    left: ASTNode;
    right: ASTNode;
}
//# sourceMappingURL=ast-types.d.ts.map