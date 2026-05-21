import {
    Token,
    TokenType,
    ASTNode,
    LiteralNode,
    VariableNode,
    PropertyAccessNode,
    BinaryOpNode,
    UnaryOpNode,
    CustomConditionNode,
    ArrayLiteralNode,
    BetweenNode,
    TernaryNode
} from './ast-types.js';

/**
 * Parser that builds an Abstract Syntax Tree from tokens
 * Handles operator precedence and creates a tree structure for evaluation
 *
 * Precedence (lowest → highest):
 *   ternary → or → and → not/comparison → null-coalesce → addition → multiplication → exponent → unary → value
 */
export class Parser {
    private tokens: Token[];
    private current: number;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.current = 0;
    }

    parse(): ASTNode {
        const result = this.parseTernaryExpression();

        if (!this.isAtEnd()) {
            const token = this.peek();
            throw new Error(`Unexpected token '${token.value}' at position ${token.position}`);
        }

        return result;
    }

    // Ternary has lowest precedence: cond ? a : b
    private parseTernaryExpression(): ASTNode {
        const condition = this.parseOrExpression();

        if (this.match(TokenType.QUESTION)) {
            const consequent = this.parseTernaryExpression(); // right-associative
            this.consume(TokenType.COLON, "Expected ':' in ternary expression");
            const alternate = this.parseTernaryExpression();
            return this.createTernaryNode(condition, consequent, alternate);
        }

        return condition;
    }

    // OR has next lowest precedence
    private parseOrExpression(): ASTNode {
        let left = this.parseAndExpression();

        while (this.match(TokenType.OR)) {
            const operator = this.previous().value;
            const right = this.parseAndExpression();
            left = this.createBinaryNode(operator, left, right);
        }

        return left;
    }

    // AND has higher precedence than OR
    private parseAndExpression(): ASTNode {
        let left = this.parseComparisonExpression();

        while (this.match(TokenType.AND)) {
            const operator = this.previous().value;
            const right = this.parseComparisonExpression();
            left = this.createBinaryNode(operator, left, right);
        }

        return left;
    }

    // Comparison/NOT has higher precedence than AND
    private parseComparisonExpression(): ASTNode {
        // Handle unary NOT (preserves existing `not x > 5` → `not (x > 5)` semantics)
        if (this.match(TokenType.NOT)) {
            const operator = this.previous().value;
            const operand = this.parseComparisonExpression();
            return this.createUnaryNode(operator, operand);
        }

        const left = this.parseArithmeticExpression();

        // BETWEEN: $age between 18 65
        if (this.match(TokenType.BETWEEN)) {
            const low = this.parseArithmeticExpression();
            const high = this.parseArithmeticExpression();
            return this.createBetweenNode(left, low, high);
        }

        // Custom condition: $x custom:name $y
        // The condition name may be any word token, including DSL keywords
        if (this.match(TokenType.CUSTOM)) {
            this.consume(TokenType.COLON, "Expected ':' after 'custom'");
            const nameToken = this.consumeWord("Expected condition name after 'custom:'");
            const conditionName = nameToken.value;
            const right = this.parseArithmeticExpression();
            return this.createCustomConditionNode(conditionName, left, right);
        }

        // Standard comparison operators (including IN, NOT_IN, LIKE)
        if (this.matchComparison()) {
            const operator = this.previous().value;
            const right = this.parseArithmeticExpression();
            return this.createBinaryNode(operator, left, right);
        }

        return left;
    }

    // Entry point for arithmetic — passes through null-coalesce
    private parseArithmeticExpression(): ASTNode {
        return this.parseNullCoalesceExpression();
    }

    // Null coalescing: ?? sits between comparison and addition
    // So `$score ?? 0 > 50` parses as `($score ?? 0) > 50`
    private parseNullCoalesceExpression(): ASTNode {
        let left = this.parseAdditionExpression();

        while (this.match(TokenType.NULLISH_COALESCE)) {
            const operator = this.previous().value;
            const right = this.parseAdditionExpression();
            left = this.createBinaryNode(operator, left, right);
        }

        return left;
    }

    // Addition/Subtraction
    private parseAdditionExpression(): ASTNode {
        let left = this.parseMultiplicationExpression();

        while (this.match(TokenType.PLUS, TokenType.MINUS)) {
            const operator = this.previous().value;
            const right = this.parseMultiplicationExpression();
            left = this.createBinaryNode(operator, left, right);
        }

        return left;
    }

    // Multiplication/Division/Modulo
    private parseMultiplicationExpression(): ASTNode {
        let left = this.parseExponentiationExpression();

        while (this.match(TokenType.MULTIPLY, TokenType.DIVIDE, TokenType.MODULO)) {
            const operator = this.previous().value;
            const right = this.parseExponentiationExpression();
            left = this.createBinaryNode(operator, left, right);
        }

        return left;
    }

    // Exponentiation — right-associative: 2 ** 3 ** 2 = 2 ** (3 ** 2) = 512
    private parseExponentiationExpression(): ASTNode {
        const left = this.parseUnaryExpression();

        if (this.match(TokenType.EXPONENT)) {
            const operator = this.previous().value;
            const right = this.parseExponentiationExpression(); // right-associative recursion
            return this.createBinaryNode(operator, left, right);
        }

        return left;
    }

    // Unary minus: -expr
    private parseUnaryExpression(): ASTNode {
        if (this.match(TokenType.MINUS)) {
            const operand = this.parseUnaryExpression(); // right-associative for --x
            return this.createUnaryNode('-', operand);
        }

        return this.parseValue();
    }

    private parseValue(): ASTNode {
        // Literals
        if (this.match(TokenType.NUMBER)) {
            const value = parseFloat(this.previous().value);
            return this.createLiteralNode(value);
        }

        if (this.match(TokenType.STRING)) {
            const value = this.previous().value;
            return this.createLiteralNode(value);
        }

        if (this.match(TokenType.BOOLEAN)) {
            const value = this.previous().value === 'true';
            return this.createLiteralNode(value);
        }

        if (this.match(TokenType.NULL)) {
            return this.createLiteralNode(null);
        }

        // Parenthesized expressions
        if (this.match(TokenType.LPAREN)) {
            const expr = this.parseTernaryExpression();
            this.consume(TokenType.RPAREN, "Expected ')' after expression");
            return expr;
        }

        // Array literals: [a, b, c]
        if (this.match(TokenType.LBRACKET)) {
            return this.parseArrayLiteral();
        }

        // Variables with optional chained property access
        if (this.match(TokenType.VARIABLE)) {
            const varName = this.previous().value;
            let result: ASTNode = this.createVariableNode(varName);

            // Build chained property access iteratively: $a.b.c, $a["b"][0]
            while (this.check(TokenType.DOT) || this.check(TokenType.LBRACKET)) {
                if (this.match(TokenType.DOT)) {
                    const property = this.consume(TokenType.IDENTIFIER, "Expected property name after '.'").value;
                    result = this.createPropertyAccessNode(result, property, 'dot');
                } else if (this.match(TokenType.LBRACKET)) {
                    let property: string;
                    if (this.check(TokenType.STRING)) {
                        property = this.advance().value;
                    } else if (this.check(TokenType.IDENTIFIER)) {
                        property = this.advance().value;
                    } else if (this.check(TokenType.NUMBER)) {
                        property = this.advance().value;
                    } else {
                        throw new Error("Expected string, identifier, or number in bracket notation");
                    }
                    this.consume(TokenType.RBRACKET, "Expected ']' after property name");
                    result = this.createPropertyAccessNode(result, property, 'bracket');
                }
            }

            return result;
        }

        throw new Error(`Unexpected token '${this.peek().value}' at position ${this.peek().position}`);
    }

    // Parse array literal after the opening '[' has been consumed
    private parseArrayLiteral(): ArrayLiteralNode {
        const elements: ASTNode[] = [];

        if (!this.check(TokenType.RBRACKET)) {
            elements.push(this.parseTernaryExpression());
            while (this.match(TokenType.COMMA)) {
                elements.push(this.parseTernaryExpression());
            }
        }

        this.consume(TokenType.RBRACKET, "Expected ']' after array elements");
        return this.createArrayLiteralNode(elements);
    }

    // Utility methods
    private match(...types: TokenType[]): boolean {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }

    // Consume an identifier or any keyword token as a word (for custom condition names)
    private consumeWord(message: string): Token {
        const wordTokenTypes: TokenType[] = [
            TokenType.IDENTIFIER, TokenType.IN, TokenType.NOT_IN,
            TokenType.BETWEEN, TokenType.LIKE, TokenType.IS, TokenType.IS_NOT,
            TokenType.GT, TokenType.GTE, TokenType.LT, TokenType.LTE,
            TokenType.AND, TokenType.OR, TokenType.NOT, TokenType.NULL,
            TokenType.CUSTOM
        ];
        const token = this.peek();
        if (wordTokenTypes.includes(token.type)) {
            return this.advance();
        }
        throw new Error(`${message}. Got '${token.value}' at position ${token.position}`);
    }

    private matchComparison(): boolean {
        return this.match(
            TokenType.EQUALS,
            TokenType.NOT_EQUALS,
            TokenType.GREATER_THAN,
            TokenType.GREATER_THAN_EQUAL,
            TokenType.LESS_THAN,
            TokenType.LESS_THAN_EQUAL,
            TokenType.IS,
            TokenType.IS_NOT,
            TokenType.GT,
            TokenType.GTE,
            TokenType.LT,
            TokenType.LTE,
            TokenType.IN,
            TokenType.NOT_IN,
            TokenType.LIKE
        );
    }

    private check(type: TokenType): boolean {
        if (this.isAtEnd()) return false;
        return this.peek().type === type;
    }

    private advance(): Token {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }

    private isAtEnd(): boolean {
        return this.peek().type === TokenType.EOF;
    }

    private peek(): Token {
        return this.tokens[this.current];
    }

    private previous(): Token {
        return this.tokens[this.current - 1];
    }

    private consume(type: TokenType, message: string): Token {
        if (this.check(type)) return this.advance();

        const token = this.peek();
        throw new Error(`${message}. Got '${token.value}' at position ${token.position}`);
    }

    // AST node creation helpers
    private createLiteralNode(value: string | number | boolean | null): LiteralNode {
        return { type: 'literal', value };
    }

    private createVariableNode(name: string): VariableNode {
        return { type: 'variable', name };
    }

    private createPropertyAccessNode(object: ASTNode, property: string, notation: 'dot' | 'bracket'): PropertyAccessNode {
        return { type: 'property', object, property, notation };
    }

    private createBinaryNode(operator: string, left: ASTNode, right: ASTNode): BinaryOpNode {
        return { type: 'binary', operator, left, right };
    }

    private createUnaryNode(operator: string, operand: ASTNode): UnaryOpNode {
        return { type: 'unary', operator, operand };
    }

    private createCustomConditionNode(name: string, left: ASTNode, right: ASTNode): CustomConditionNode {
        return { type: 'custom', name, left, right };
    }

    private createArrayLiteralNode(elements: ASTNode[]): ArrayLiteralNode {
        return { type: 'array', elements };
    }

    private createBetweenNode(value: ASTNode, low: ASTNode, high: ASTNode): BetweenNode {
        return { type: 'between', value, low, high };
    }

    private createTernaryNode(condition: ASTNode, consequent: ASTNode, alternate: ASTNode): TernaryNode {
        return { type: 'ternary', condition, consequent, alternate };
    }
}
