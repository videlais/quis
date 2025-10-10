import { Token, TokenType } from './ast-types.js';

/**
 * Tokenizer for Quis expressions
 * Converts input string into array of tokens
 */
export class Tokenizer {
    private input: string;
    private position: number;
    private tokens: Token[];

    constructor(input: string) {
        this.input = input.trim();
        this.position = 0;
        this.tokens = [];
    }

    tokenize(): Token[] {
        this.tokens = [];
        this.position = 0;

        while (this.position < this.input.length) {
            this.skipWhitespace();
            
            if (this.position >= this.input.length) break;

            const char = this.peek();
            
            // Numbers (including negative)
            if (this.isDigit(char) || (char === '-' && this.isDigit(this.peekNext()))) {
                this.tokenizeNumber();
            }
            // Strings
            else if (char === '"' || char === "'") {
                this.tokenizeString();
            }
            // Variables
            else if (char === '$') {
                this.tokenizeVariable();
            }
            // Two-character operators
            else if (this.position + 1 < this.input.length) {
                const twoChar = this.input.slice(this.position, this.position + 2);
                if (this.tokenizeTwoCharOperator(twoChar)) {
                    continue;
                }
                // Single-character operators
                this.tokenizeSingleChar(char);
            }
            // Single-character operators
            else {
                this.tokenizeSingleChar(char);
            }
        }

        this.addToken(TokenType.EOF, '');
        return this.tokens;
    }

    private peek(): string {
        return this.position < this.input.length ? this.input[this.position] : '';
    }

    private peekNext(): string {
        return this.position + 1 < this.input.length ? this.input[this.position + 1] : '';
    }

    private advance(): string {
        return this.position < this.input.length ? this.input[this.position++] : '';
    }

    private skipWhitespace(): void {
        while (this.position < this.input.length && /\s/.test(this.input[this.position])) {
            this.position++;
        }
    }

    private isDigit(char: string): boolean {
        return /[0-9]/.test(char);
    }

    private isLetter(char: string): boolean {
        return /[a-zA-Z_]/.test(char);
    }

    private isAlphaNumeric(char: string): boolean {
        return /[a-zA-Z0-9_]/.test(char);
    }

    private addToken(type: TokenType, value: string): void {
        this.tokens.push({
            type,
            value,
            position: this.position - value.length
        });
    }

    private tokenizeNumber(): void {
        const start = this.position;
        let hasDecimal = false;

        // Handle negative sign
        if (this.peek() === '-') {
            this.advance();
        }

        // Read digits and decimal point
        while (this.position < this.input.length) {
            const char = this.peek();
            if (this.isDigit(char)) {
                this.advance();
            } else if (char === '.' && !hasDecimal) {
                hasDecimal = true;
                this.advance();
            } else {
                break;
            }
        }

        const value = this.input.slice(start, this.position);
        this.addToken(TokenType.NUMBER, value);
    }

    private tokenizeString(): void {
        const quote = this.advance(); // consume opening quote
        const start = this.position;

        while (this.position < this.input.length && this.peek() !== quote) {
            this.advance();
        }

        if (this.position >= this.input.length) {
            throw new Error(`Unterminated string starting at position ${start - 1}`);
        }

        const value = this.input.slice(start, this.position);
        this.advance(); // consume closing quote
        this.addToken(TokenType.STRING, value);
    }

    private tokenizeVariable(): void {
        const start = this.position;
        this.advance(); // consume '$'

        while (this.position < this.input.length && this.isAlphaNumeric(this.peek())) {
            this.advance();
        }

        const value = this.input.slice(start + 1, this.position); // exclude '$'
        this.addToken(TokenType.VARIABLE, value);
    }

    private tokenizeIdentifier(): string {
        const start = this.position;

        while (this.position < this.input.length && this.isAlphaNumeric(this.peek())) {
            this.advance();
        }

        return this.input.slice(start, this.position);
    }

    private tokenizeKeywordOrIdentifier(): void {
        const identifier = this.tokenizeIdentifier();
        
        // Check for keywords
        switch (identifier.toLowerCase()) {
            case 'true':
                this.addToken(TokenType.BOOLEAN, 'true');
                break;
            case 'false':
                this.addToken(TokenType.BOOLEAN, 'false');
                break;
            case 'null':
                this.addToken(TokenType.NULL, 'null');
                break;
            case 'and':
                this.addToken(TokenType.AND, 'and');
                break;
            case 'or':
                this.addToken(TokenType.OR, 'or');
                break;
            case 'not':
                this.addToken(TokenType.NOT, 'not');
                break;
            case 'is':
                // Check if followed by 'not'
                this.skipWhitespace();
                if (this.input.slice(this.position, this.position + 3).toLowerCase() === 'not') {
                    this.position += 3;
                    this.addToken(TokenType.IS_NOT, 'is not');
                } else {
                    this.addToken(TokenType.IS, 'is');
                }
                break;
            case 'gt':
                this.addToken(TokenType.GT, 'gt');
                break;
            case 'gte':
                this.addToken(TokenType.GTE, 'gte');
                break;
            case 'lt':
                this.addToken(TokenType.LT, 'lt');
                break;
            case 'lte':
                this.addToken(TokenType.LTE, 'lte');
                break;
            case 'custom':
                this.addToken(TokenType.CUSTOM, 'custom');
                break;
            default:
                this.addToken(TokenType.IDENTIFIER, identifier);
                break;
        }
    }

    private tokenizeTwoCharOperator(twoChar: string): boolean {
        switch (twoChar) {
            case '==':
                this.position += 2;
                this.addToken(TokenType.EQUALS, '==');
                return true;
            case '!=':
                this.position += 2;
                this.addToken(TokenType.NOT_EQUALS, '!=');
                return true;
            case '>=':
                this.position += 2;
                this.addToken(TokenType.GREATER_THAN_EQUAL, '>=');
                return true;
            case '<=':
                this.position += 2;
                this.addToken(TokenType.LESS_THAN_EQUAL, '<=');
                return true;
            case '&&':
                this.position += 2;
                this.addToken(TokenType.AND, '&&');
                return true;
            case '||':
                this.position += 2;
                this.addToken(TokenType.OR, '||');
                return true;
            default:
                // Check for words like 'AND', 'OR'
                if (this.isLetter(twoChar[0])) {
                    this.tokenizeKeywordOrIdentifier();
                    return true;
                }
                return false;
        }
    }

    private tokenizeSingleChar(char: string): void {
        switch (char) {
            case '>':
                this.advance();
                this.addToken(TokenType.GREATER_THAN, '>');
                break;
            case '<':
                this.advance();
                this.addToken(TokenType.LESS_THAN, '<');
                break;
            case '(':
                this.advance();
                this.addToken(TokenType.LPAREN, '(');
                break;
            case ')':
                this.advance();
                this.addToken(TokenType.RPAREN, ')');
                break;
            case '.':
                this.advance();
                this.addToken(TokenType.DOT, '.');
                break;
            case '[':
                this.advance();
                this.addToken(TokenType.LBRACKET, '[');
                break;
            case ']':
                this.advance();
                this.addToken(TokenType.RBRACKET, ']');
                break;
            case ':':
                this.advance();
                this.addToken(TokenType.COLON, ':');
                break;
            case '!':
                this.advance();
                this.addToken(TokenType.NOT, '!');
                break;
            case '+':
                this.advance();
                this.addToken(TokenType.PLUS, '+');
                break;
            case '-':
                // Check if this is a negative number
                if (!this.isDigit(this.peekNext())) {
                    this.advance();
                    this.addToken(TokenType.MINUS, '-');
                } else {
                    // This is handled by tokenizeNumber
                    throw new Error(`Unexpected character '${char}' at position ${this.position}`);
                }
                break;
            case '*':
                this.advance();
                this.addToken(TokenType.MULTIPLY, '*');
                break;
            case '/':
                this.advance();
                this.addToken(TokenType.DIVIDE, '/');
                break;
            default:
                if (this.isLetter(char)) {
                    this.tokenizeKeywordOrIdentifier();
                } else {
                    throw new Error(`Unexpected character '${char}' at position ${this.position}`);
                }
                break;
        }
    }
}