/**
 * Comprehensive tests for the Tokenizer class
 * Consolidates all tokenizer-related tests into a single file
 */

const { Tokenizer } = require('../../src/tokenizer');
const { TokenType } = require('../../src/ast-types');

describe('Tokenizer', () => {
    describe('Number Tokenization', () => {
        test('should tokenize integers', () => {
            const tokenizer = new Tokenizer('42');
            const tokens = tokenizer.tokenize();

            expect(tokens).toHaveLength(2); // NUMBER + EOF
            expect(tokens[0]).toEqual({
                type: TokenType.NUMBER,
                value: '42',
                position: 0
            });
        });

        test('should tokenize decimal numbers', () => {
            const tokenizer = new Tokenizer('3.14');
            const tokens = tokenizer.tokenize();

            expect(tokens).toHaveLength(2); // NUMBER + EOF
            expect(tokens[0]).toEqual({
                type: TokenType.NUMBER,
                value: '3.14',
                position: 0
            });
        });

        test('should tokenize negative numbers', () => {
            const tokenizer = new Tokenizer('-15');
            const tokens = tokenizer.tokenize();

            expect(tokens).toHaveLength(2); // NUMBER + EOF
            expect(tokens[0]).toEqual({
                type: TokenType.NUMBER,
                value: '-15',
                position: 0
            });
        });

        test('should tokenize negative decimal numbers', () => {
            const tokenizer = new Tokenizer('-2.5');
            const tokens = tokenizer.tokenize();

            expect(tokens).toHaveLength(2);
            expect(tokens[0]).toEqual({
                type: TokenType.NUMBER,
                value: '-2.5',
                position: 0
            });
        });

        test('should tokenize zero', () => {
            const tokenizer = new Tokenizer('0');
            const tokens = tokenizer.tokenize();

            expect(tokens).toHaveLength(2);
            expect(tokens[0]).toEqual({
                type: TokenType.NUMBER,
                value: '0',
                position: 0
            });
        });
    });

    describe('String Tokenization', () => {
        test('should tokenize double-quoted strings', () => {
            const tokenizer = new Tokenizer('"hello world"');
            const tokens = tokenizer.tokenize();

            expect(tokens).toHaveLength(2);
            expect(tokens[0]).toEqual({
                type: TokenType.STRING,
                value: 'hello world',
                position: 2 // Position after opening quote
            });
        });

        test('should tokenize single-quoted strings', () => {
            const tokenizer = new Tokenizer("'test string'");
            const tokens = tokenizer.tokenize();

            expect(tokens).toHaveLength(2);
            expect(tokens[0]).toEqual({
                type: TokenType.STRING,
                value: 'test string',
                position: 2
            });
        });

        test('should tokenize empty strings', () => {
            const tokenizer = new Tokenizer('""');
            const tokens = tokenizer.tokenize();

            expect(tokens).toHaveLength(2);
            expect(tokens[0]).toEqual({
                type: TokenType.STRING,
                value: '',
                position: 2
            });
        });

        test('should throw error for unterminated double-quoted string', () => {
            const tokenizer = new Tokenizer('"unterminated');

            expect(() => tokenizer.tokenize()).toThrow('Unterminated string starting at position 0');
        });

        test('should throw error for unterminated single-quoted string', () => {
            const tokenizer = new Tokenizer("'also unterminated");

            expect(() => tokenizer.tokenize()).toThrow('Unterminated string starting at position 0');
        });
    });

    describe('Variable Tokenization', () => {
        test('should tokenize simple variables', () => {
            const tokenizer = new Tokenizer('$user');
            const tokens = tokenizer.tokenize();

            expect(tokens).toHaveLength(2);
            expect(tokens[0]).toEqual({
                type: TokenType.VARIABLE,
                value: 'user',
                position: 1 // Position after $ sign
            });
        });

        test('should tokenize variables with numbers', () => {
            const tokenizer = new Tokenizer('$user123');
            const tokens = tokenizer.tokenize();

            expect(tokens).toHaveLength(2);
            expect(tokens[0]).toEqual({
                type: TokenType.VARIABLE,
                value: 'user123',
                position: 1
            });
        });

        test('should tokenize variables with underscores', () => {
            const tokenizer = new Tokenizer('$user_name');
            const tokens = tokenizer.tokenize();

            expect(tokens).toHaveLength(2);
            expect(tokens[0]).toEqual({
                type: TokenType.VARIABLE,
                value: 'user_name',
                position: 1
            });
        });
    });

    describe('Keyword Tokenization', () => {
        test('should tokenize boolean keywords', () => {
            const tokenizer = new Tokenizer('true false null');
            const tokens = tokenizer.tokenize();

            expect(tokens).toHaveLength(4); // BOOLEAN + BOOLEAN + NULL + EOF
            expect(tokens[0]).toEqual({
                type: TokenType.BOOLEAN,
                value: 'true',
                position: 0
            });
            expect(tokens[1]).toEqual({
                type: TokenType.BOOLEAN,
                value: 'false',
                position: 5
            });
            expect(tokens[2]).toEqual({
                type: TokenType.NULL,
                value: 'null',
                position: 11
            });
        });

        test('should tokenize logical keywords', () => {
            const tokenizer = new Tokenizer('and or not');
            const tokens = tokenizer.tokenize();

            expect(tokens).toHaveLength(4);
            expect(tokens[0].type).toBe(TokenType.AND);
            expect(tokens[1].type).toBe(TokenType.OR);
            expect(tokens[2].type).toBe(TokenType.NOT);
        });

        test('should tokenize comparison keywords', () => {
            const tokenizer = new Tokenizer('gt gte lt lte');
            const tokens = tokenizer.tokenize();

            expect(tokens).toHaveLength(5);
            expect(tokens[0].type).toBe(TokenType.GT);
            expect(tokens[1].type).toBe(TokenType.GTE);
            expect(tokens[2].type).toBe(TokenType.LT);
            expect(tokens[3].type).toBe(TokenType.LTE);
        });

        test('should tokenize "is" keyword alone', () => {
            const tokenizer = new Tokenizer('is');
            const tokens = tokenizer.tokenize();

            expect(tokens).toHaveLength(2);
            expect(tokens[0]).toEqual({
                type: TokenType.IS,
                value: 'is',
                position: 0
            });
        });

        test('should tokenize "is not" keyword combination', () => {
            const tokenizer = new Tokenizer('is not');
            const tokens = tokenizer.tokenize();

            expect(tokens).toHaveLength(2);
            expect(tokens[0]).toEqual({
                type: TokenType.IS_NOT,
                value: 'is not',
                position: 0
            });
        });

        test('should tokenize custom keyword', () => {
            const tokenizer = new Tokenizer('custom');
            const tokens = tokenizer.tokenize();

            expect(tokens).toHaveLength(2);
            expect(tokens[0].type).toBe(TokenType.CUSTOM);
        });

        test('should tokenize identifiers that are not keywords', () => {
            const tokenizer = new Tokenizer('someIdentifier');
            const tokens = tokenizer.tokenize();

            expect(tokens).toHaveLength(2);
            expect(tokens[0].type).toBe(TokenType.IDENTIFIER);
            expect(tokens[0].value).toBe('someIdentifier');
        });
    });

    describe('Operator Tokenization', () => {
        test('should tokenize arithmetic operators', () => {
            const tokenizer = new Tokenizer('+ - * /');
            const tokens = tokenizer.tokenize();

            expect(tokens).toHaveLength(5); // 4 operators + EOF
            expect(tokens[0].type).toBe(TokenType.PLUS);
            expect(tokens[1].type).toBe(TokenType.MINUS);
            expect(tokens[2].type).toBe(TokenType.MULTIPLY);
            expect(tokens[3].type).toBe(TokenType.DIVIDE);
        });

        test('should tokenize comparison operators', () => {
            const tokenizer = new Tokenizer('== != > < >= <=');
            const tokens = tokenizer.tokenize();

            expect(tokens).toHaveLength(7); // 6 operators + EOF
            expect(tokens[0].type).toBe(TokenType.EQUALS);
            expect(tokens[1].type).toBe(TokenType.NOT_EQUALS);
            expect(tokens[2].type).toBe(TokenType.GREATER_THAN);
            expect(tokens[3].type).toBe(TokenType.LESS_THAN);
            expect(tokens[4].type).toBe(TokenType.GREATER_THAN_EQUAL);
            expect(tokens[5].type).toBe(TokenType.LESS_THAN_EQUAL);
        });

        test('should tokenize logical operators', () => {
            const tokenizer = new Tokenizer('&& || !');
            const tokens = tokenizer.tokenize();

            expect(tokens).toHaveLength(4);
            expect(tokens[0].type).toBe(TokenType.AND);
            expect(tokens[1].type).toBe(TokenType.OR);
            expect(tokens[2].type).toBe(TokenType.NOT);
        });
    });

    describe('Parentheses and Brackets', () => {
        test('should tokenize parentheses', () => {
            const tokenizer = new Tokenizer('()');
            const tokens = tokenizer.tokenize();

            expect(tokens).toHaveLength(3);
            expect(tokens[0].type).toBe(TokenType.LPAREN);
            expect(tokens[1].type).toBe(TokenType.RPAREN);
        });

        test('should tokenize brackets', () => {
            const tokenizer = new Tokenizer('[]');
            const tokens = tokenizer.tokenize();

            expect(tokens).toHaveLength(3);
            expect(tokens[0].type).toBe(TokenType.LBRACKET);
            expect(tokens[1].type).toBe(TokenType.RBRACKET);
        });

        test('should tokenize dot notation', () => {
            const tokenizer = new Tokenizer('.');
            const tokens = tokenizer.tokenize();

            expect(tokens).toHaveLength(2);
            expect(tokens[0].type).toBe(TokenType.DOT);
        });

        test('should tokenize colon', () => {
            const tokenizer = new Tokenizer(':');
            const tokens = tokenizer.tokenize();

            expect(tokens).toHaveLength(2);
            expect(tokens[0].type).toBe(TokenType.COLON);
        });
    });

    describe('Whitespace Handling', () => {
        test('should handle multiple spaces', () => {
            const tokenizer = new Tokenizer('  true   and   false  ');
            const tokens = tokenizer.tokenize();

            expect(tokens).toHaveLength(4);
            expect(tokens[0].value).toBe('true');
            expect(tokens[1].type).toBe(TokenType.AND);
            expect(tokens[2].value).toBe('false');
        });

        test('should handle tabs and newlines', () => {
            const tokenizer = new Tokenizer('\ttrue\nand\r\nfalse\t');
            const tokens = tokenizer.tokenize();

            expect(tokens).toHaveLength(4);
            expect(tokens[0].value).toBe('true');
            expect(tokens[1].type).toBe(TokenType.AND);
            expect(tokens[2].value).toBe('false');
        });
    });

    describe('Error Handling', () => {
        test('should throw error for unexpected character', () => {
            const tokenizer = new Tokenizer('@');

            expect(() => tokenizer.tokenize()).toThrow("Unexpected character '@' at position 0");
        });

        test('should throw error for unexpected symbol', () => {
            const tokenizer = new Tokenizer('#');

            expect(() => tokenizer.tokenize()).toThrow("Unexpected character '#' at position 0");
        });
    });

    describe('Complex Expressions', () => {
        test('should tokenize complex arithmetic expression', () => {
            const tokenizer = new Tokenizer('($price * 1.08) >= 100.00');
            const tokens = tokenizer.tokenize();

            expect(tokens).toHaveLength(8);
            expect(tokens[0].type).toBe(TokenType.LPAREN);
            expect(tokens[1].type).toBe(TokenType.VARIABLE);
            expect(tokens[1].value).toBe('price');
            expect(tokens[2].type).toBe(TokenType.MULTIPLY);
            expect(tokens[3].type).toBe(TokenType.NUMBER);
            expect(tokens[3].value).toBe('1.08');
            expect(tokens[4].type).toBe(TokenType.RPAREN);
            expect(tokens[5].type).toBe(TokenType.GREATER_THAN_EQUAL);
            expect(tokens[6].type).toBe(TokenType.NUMBER);
            expect(tokens[6].value).toBe('100.00');
        });

        test('should tokenize string comparison with variables', () => {
            const tokenizer = new Tokenizer('$user.name == "admin"');
            const tokens = tokenizer.tokenize();

            expect(tokens).toHaveLength(6);
            expect(tokens[0].type).toBe(TokenType.VARIABLE);
            expect(tokens[0].value).toBe('user');
            expect(tokens[1].type).toBe(TokenType.DOT);
            expect(tokens[2].type).toBe(TokenType.IDENTIFIER);
            expect(tokens[2].value).toBe('name');
            expect(tokens[3].type).toBe(TokenType.EQUALS);
            expect(tokens[4].type).toBe(TokenType.STRING);
            expect(tokens[4].value).toBe('admin');
        });

        test('should tokenize mixed logical expression', () => {
            const tokenizer = new Tokenizer('true and false or not null');
            const tokens = tokenizer.tokenize();

            expect(tokens).toHaveLength(7);
            expect(tokens[0].type).toBe(TokenType.BOOLEAN);
            expect(tokens[0].value).toBe('true');
            expect(tokens[1].type).toBe(TokenType.AND);
            expect(tokens[2].type).toBe(TokenType.BOOLEAN);
            expect(tokens[2].value).toBe('false');
            expect(tokens[3].type).toBe(TokenType.OR);
            expect(tokens[4].type).toBe(TokenType.NOT);
            expect(tokens[5].type).toBe(TokenType.NULL);
        });

        test('should tokenize consecutive minus signs', () => {
            const tokenizer = new Tokenizer('5--3');
            const tokens = tokenizer.tokenize();

            expect(tokens).toHaveLength(4);
            expect(tokens[0].type).toBe(TokenType.NUMBER);
            expect(tokens[0].value).toBe('5');
            expect(tokens[1].type).toBe(TokenType.MINUS);
            expect(tokens[2].type).toBe(TokenType.NUMBER);
            expect(tokens[2].value).toBe('-3');
        });
    });

    describe('Edge Cases', () => {
        test('should handle empty input', () => {
            const tokenizer = new Tokenizer('');
            const tokens = tokenizer.tokenize();

            expect(tokens).toHaveLength(1);
            expect(tokens[0].type).toBe(TokenType.EOF);
        });

        test('should handle whitespace-only input', () => {
            const tokenizer = new Tokenizer('   \t\n  ');
            const tokens = tokenizer.tokenize();

            expect(tokens).toHaveLength(1);
            expect(tokens[0].type).toBe(TokenType.EOF);
        });

        test('should handle very long identifiers', () => {
            const longId = 'a'.repeat(100);
            const tokenizer = new Tokenizer(longId);
            const tokens = tokenizer.tokenize();

            expect(tokens).toHaveLength(2);
            expect(tokens[0].type).toBe(TokenType.IDENTIFIER);
            expect(tokens[0].value).toBe(longId);
        });

        test('should handle complex property access', () => {
            const tokenizer = new Tokenizer('$user["complex-key-123"]');
            const tokens = tokenizer.tokenize();

            expect(tokens).toHaveLength(5);
            expect(tokens[0].type).toBe(TokenType.VARIABLE);
            expect(tokens[1].type).toBe(TokenType.LBRACKET);
            expect(tokens[2].type).toBe(TokenType.STRING);
            expect(tokens[2].value).toBe('complex-key-123');
            expect(tokens[3].type).toBe(TokenType.RBRACKET);
        });
    });
});