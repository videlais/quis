import { 
    Token, 
    TokenType, 
    ASTNode, 
    LiteralNode, 
    VariableNode, 
    PropertyAccessNode, 
    BinaryOpNode, 
    UnaryOpNode, 
    CustomConditionNode 
} from './ast-types.js';

/**
 * Parser that builds an Abstract Syntax Tree from tokens
 * Handles operator precedence and creates a tree structure for evaluation
 */
export class Parser {
    private tokens: Token[];
    private current: number;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.current = 0;
    }

    parse(): ASTNode {
        const result = this.parseOrExpression();
        
        if (!this.isAtEnd()) {
            const token = this.peek();
            throw new Error(`Unexpected token '${token.value}' at position ${token.position}`);
        }
        
        return result;
    }

    // OR has lowest precedence
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

    // Comparison has higher precedence than AND
    private parseComparisonExpression(): ASTNode {
        // Handle unary NOT
        if (this.match(TokenType.NOT)) {
            const operator = this.previous().value;
            const operand = this.parseComparisonExpression();
            return this.createUnaryNode(operator, operand);
        }

        const left = this.parseArithmeticExpression();

        // Check for custom condition
        if (this.match(TokenType.CUSTOM)) {
            this.consume(TokenType.COLON, "Expected ':' after 'custom'");
            const conditionName = this.consume(TokenType.IDENTIFIER, "Expected condition name after 'custom:'").value;
            const right = this.parseArithmeticExpression();
            return this.createCustomConditionNode(conditionName, left, right);
        }

        // Check for comparison operators
        if (this.matchComparison()) {
            const operator = this.previous().value;
            const right = this.parseArithmeticExpression();
            return this.createBinaryNode(operator, left, right);
        }

        return left;
    }

    // Arithmetic expression parsing with proper precedence  
    private parseArithmeticExpression(): ASTNode {
        return this.parseAdditionExpression();
    }

    // Addition/Subtraction (lowest arithmetic precedence)
    private parseAdditionExpression(): ASTNode {
        let left = this.parseMultiplicationExpression();

        while (this.match(TokenType.PLUS, TokenType.MINUS)) {
            const operator = this.previous().value;
            const right = this.parseMultiplicationExpression();
            left = this.createBinaryNode(operator, left, right);
        }

        return left;
    }

    // Multiplication/Division (higher arithmetic precedence)
    private parseMultiplicationExpression(): ASTNode {
        let left = this.parseValue();

        while (this.match(TokenType.MULTIPLY, TokenType.DIVIDE)) {
            const operator = this.previous().value;
            const right = this.parseValue();
            left = this.createBinaryNode(operator, left, right);
        }

        return left;
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

        // Handle parenthesized expressions
        if (this.match(TokenType.LPAREN)) {
            const expr = this.parseOrExpression();
            this.consume(TokenType.RPAREN, "Expected ')' after expression");
            return expr;
        }

        // Variables and property access
        if (this.match(TokenType.VARIABLE)) {
            const varName = this.previous().value;
            
            // Check for property access
            if (this.match(TokenType.DOT)) {
                const property = this.consume(TokenType.IDENTIFIER, "Expected property name after '.'").value;
                return this.createPropertyAccessNode(varName, property, 'dot');
            }
            
            if (this.match(TokenType.LBRACKET)) {
                let property: string;
                if (this.check(TokenType.STRING)) {
                    property = this.advance().value;
                } else if (this.check(TokenType.IDENTIFIER)) {
                    property = this.advance().value;
                } else {
                    throw new Error("Expected string or identifier in bracket notation");
                }
                this.consume(TokenType.RBRACKET, "Expected ']' after property name");
                return this.createPropertyAccessNode(varName, property, 'bracket');
            }
            
            return this.createVariableNode(varName);
        }

        throw new Error(`Unexpected token '${this.peek().value}' at position ${this.peek().position}`);
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
            TokenType.LTE
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private createLiteralNode(value: any): LiteralNode {
        return {
            type: 'literal',
            value
        };
    }

    private createVariableNode(name: string): VariableNode {
        return {
            type: 'variable',
            name
        };
    }

    private createPropertyAccessNode(object: string, property: string, notation: 'dot' | 'bracket'): PropertyAccessNode {
        return {
            type: 'property',
            object,
            property,
            notation
        };
    }

    private createBinaryNode(operator: string, left: ASTNode, right: ASTNode): BinaryOpNode {
        return {
            type: 'binary',
            operator,
            left,
            right
        };
    }

    private createUnaryNode(operator: string, operand: ASTNode): UnaryOpNode {
        return {
            type: 'unary',
            operator,
            operand
        };
    }

    private createCustomConditionNode(name: string, left: ASTNode, right: ASTNode): CustomConditionNode {
        return {
            type: 'custom',
            name,
            left,
            right
        };
    }
}