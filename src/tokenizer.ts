import { Token, TokenType } from './ast-types.js';

/**
 * Maximum allowed input length to prevent excessively large expressions.
 */
export const MAX_INPUT_LENGTH = 10_000;

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
        if (this.input.length > MAX_INPUT_LENGTH) {
            throw new Error(`Input exceeds maximum length of ${MAX_INPUT_LENGTH} characters`);
        }

        this.tokens = [];
        this.position = 0;

        while (this.position < this.input.length) {
            this.skipWhitespace();

            if (this.position >= this.input.length) break;

            const char = this.peek();

            // Numbers (positive only — unary minus handled by parser)
            if (this.isDigit(char)) {
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
            // Two-character operators (checked before single-char)
            else if (this.position + 1 < this.input.length) {
                const twoChar = this.input.slice(this.position, this.position + 2);
                if (this.tokenizeTwoCharOperator(twoChar)) {
                    continue;
                }
                // Single-character operators
                this.tokenizeSingleChar(char);
            }
            // Single-character operators (last char in input)
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

        // Read digits and decimal point (negative sign handled by unary minus in parser)
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
        const openingQuotePos = this.position;
        const quote = this.advance(); // consume opening quote
        const chars: string[] = [];

        while (this.position < this.input.length && this.peek() !== quote) {
            if (this.peek() === '\\') {
                this.advance(); // consume backslash
                if (this.position >= this.input.length) {
                    throw new Error(`Unterminated string starting at position ${openingQuotePos}`);
                }
                const escaped = this.advance();
                switch (escaped) {
                    case '"':  chars.push('"');  break;
                    case "'":  chars.push("'");  break;
                    case '\\': chars.push('\\'); break;
                    case 'n':  chars.push('\n'); break;
                    case 't':  chars.push('\t'); break;
                    case 'r':  chars.push('\r'); break;
                    default:
                        // Unknown escape sequence — keep backslash and char
                        chars.push('\\');
                        chars.push(escaped);
                }
            } else {
                chars.push(this.advance());
            }
        }

        if (this.position >= this.input.length) {
            throw new Error(`Unterminated string starting at position ${openingQuotePos}`);
        }

        this.advance(); // consume closing quote
        this.addToken(TokenType.STRING, chars.join(''));
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
            case 'not': {
                // Check if followed by 'in' (not in operator) with word boundary
                this.skipWhitespace();
                if (this.isLetter(this.peek())) {
                    const savedPos = this.position;
                    const nextWord = this.tokenizeIdentifier();
                    if (nextWord.toLowerCase() === 'in' && !this.isAlphaNumeric(this.peek())) {
                        this.addToken(TokenType.NOT_IN, 'not in');
                    } else {
                        this.position = savedPos; // rewind — not 'not in'
                        this.addToken(TokenType.NOT, 'not');
                    }
                } else {
                    this.addToken(TokenType.NOT, 'not');
                }
                break;
            }
            case 'is':
                // Check if followed by 'not' with a word boundary
                this.skipWhitespace();
                if (
                    this.input.slice(this.position, this.position + 3).toLowerCase() === 'not' &&
                    !this.isAlphaNumeric(this.input[this.position + 3] ?? '')
                ) {
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
            case 'in':
                this.addToken(TokenType.IN, 'in');
                break;
            case 'between':
                this.addToken(TokenType.BETWEEN, 'between');
                break;
            case 'like':
                this.addToken(TokenType.LIKE, 'like');
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
            case '**':
                this.position += 2;
                this.addToken(TokenType.EXPONENT, '**');
                return true;
            case '??':
                this.position += 2;
                this.addToken(TokenType.NULLISH_COALESCE, '??');
                return true;
            default:
                // Check for words like 'AND', 'OR', keywords
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
                this.advance();
                this.addToken(TokenType.MINUS, '-');
                break;
            case '*':
                this.advance();
                this.addToken(TokenType.MULTIPLY, '*');
                break;
            case '/':
                this.advance();
                this.addToken(TokenType.DIVIDE, '/');
                break;
            case '%':
                this.advance();
                this.addToken(TokenType.MODULO, '%');
                break;
            case '?':
                this.advance();
                this.addToken(TokenType.QUESTION, '?');
                break;
            case ',':
                this.advance();
                this.addToken(TokenType.COMMA, ',');
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
