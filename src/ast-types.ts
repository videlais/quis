/**
 * Token types for the Quis expression language
 */
export enum TokenType {
    // Literals
    NUMBER = 'NUMBER',
    STRING = 'STRING',
    BOOLEAN = 'BOOLEAN',
    NULL = 'NULL',

    // Variables
    VARIABLE = 'VARIABLE',
    DOT = 'DOT',
    LBRACKET = 'LBRACKET',
    RBRACKET = 'RBRACKET',

    // Operators
    EQUALS = 'EQUALS',
    NOT_EQUALS = 'NOT_EQUALS',
    GREATER_THAN = 'GREATER_THAN',
    GREATER_THAN_EQUAL = 'GREATER_THAN_EQUAL',
    LESS_THAN = 'LESS_THAN',
    LESS_THAN_EQUAL = 'LESS_THAN_EQUAL',

    // Arithmetic operators
    PLUS = 'PLUS',
    MINUS = 'MINUS',
    MULTIPLY = 'MULTIPLY',
    DIVIDE = 'DIVIDE',
    MODULO = 'MODULO',
    EXPONENT = 'EXPONENT',

    // Shorthand operators
    IS = 'IS',
    IS_NOT = 'IS_NOT',
    GT = 'GT',
    GTE = 'GTE',
    LT = 'LT',
    LTE = 'LTE',

    // Logical operators
    AND = 'AND',
    OR = 'OR',
    NOT = 'NOT',

    // Collection operators
    IN = 'IN',
    NOT_IN = 'NOT_IN',
    BETWEEN = 'BETWEEN',
    LIKE = 'LIKE',

    // Null coalescing
    NULLISH_COALESCE = 'NULLISH_COALESCE',

    // Custom conditions
    CUSTOM = 'CUSTOM',
    COLON = 'COLON',
    IDENTIFIER = 'IDENTIFIER',

    // Grouping
    LPAREN = 'LPAREN',
    RPAREN = 'RPAREN',

    // Array / collection
    COMMA = 'COMMA',

    // Ternary
    QUESTION = 'QUESTION',

    // Special
    EOF = 'EOF',
    WHITESPACE = 'WHITESPACE'
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
    object: ASTNode;
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

export interface ArrayLiteralNode extends ASTNode {
    type: 'array';
    elements: ASTNode[];
}

export interface BetweenNode extends ASTNode {
    type: 'between';
    value: ASTNode;
    low: ASTNode;
    high: ASTNode;
}

export interface TernaryNode extends ASTNode {
    type: 'ternary';
    condition: ASTNode;
    consequent: ASTNode;
    alternate: ASTNode;
}