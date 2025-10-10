/**
 * Comprehensive tests for the Parser class
 * Consolidates all parser-related tests into a single file
 */

import { Tokenizer } from '../../src/tokenizer.js';
import { Parser } from '../../src/parser.js';
import { TokenType } from '../../src/ast-types.js';

describe('Parser', () => {
    describe('Basic Parsing', () => {
        test('should parse literal values', () => {
            const expressions = [
                { expr: '42', expected: { type: 'literal', value: 42 } },
                { expr: '"hello"', expected: { type: 'literal', value: 'hello' } },
                { expr: 'true', expected: { type: 'literal', value: true } },
                { expr: 'false', expected: { type: 'literal', value: false } },
                { expr: 'null', expected: { type: 'literal', value: null } }
            ];

            expressions.forEach(({ expr, expected }) => {
                const tokenizer = new Tokenizer(expr);
                const tokens = tokenizer.tokenize();
                const parser = new Parser(tokens);
                const ast = parser.parse();
                expect(ast).toEqual(expected);
            });
        });

        test('should parse variables', () => {
            const tokenizer = new Tokenizer('$user');
            const tokens = tokenizer.tokenize();
            const parser = new Parser(tokens);
            const ast = parser.parse();

            expect(ast).toEqual({
                type: 'variable',
                name: 'user'
            });
        });

        test('should parse property access with dot notation', () => {
            const tokenizer = new Tokenizer('$user.name');
            const tokens = tokenizer.tokenize();
            const parser = new Parser(tokens);
            const ast = parser.parse();

            expect(ast).toEqual({
                type: 'property',
                object: 'user',
                property: 'name',
                notation: 'dot'
            });
        });

        test('should parse property access with bracket notation', () => {
            const tokenizer = new Tokenizer('$user["name"]');
            const tokens = tokenizer.tokenize();
            const parser = new Parser(tokens);
            const ast = parser.parse();

            expect(ast).toEqual({
                type: 'property',
                object: 'user',
                property: 'name',
                notation: 'bracket'
            });

            // Test with identifier in brackets
            const tokenizer2 = new Tokenizer('$user[name]');
            const tokens2 = tokenizer2.tokenize();
            const parser2 = new Parser(tokens2);
            const ast2 = parser2.parse();

            expect(ast2).toEqual({
                type: 'property',
                object: 'user',
                property: 'name',
                notation: 'bracket'
            });
        });
    });

    describe('Binary Operations', () => {
        test('should parse arithmetic operations', () => {
            const operators = ['+', '-', '*', '/'];

            operators.forEach(op => {
                const tokenizer = new Tokenizer(`5 ${op} 3`);
                const tokens = tokenizer.tokenize();
                const parser = new Parser(tokens);
                const ast = parser.parse();

                expect(ast).toEqual({
                    type: 'binary',
                    operator: op,
                    left: { type: 'literal', value: 5 },
                    right: { type: 'literal', value: 3 }
                });
            });
        });

        test('should parse comparison operations', () => {
            const operators = [
                '==', '!=', '>', '<', '>=', '<=',
                'is', 'is not', 'gt', 'gte', 'lt', 'lte'
            ];

            operators.forEach(op => {
                const tokenizer = new Tokenizer(`5 ${op} 3`);
                const tokens = tokenizer.tokenize();
                const parser = new Parser(tokens);
                const ast = parser.parse();

                expect(ast).toEqual({
                    type: 'binary',
                    operator: op,
                    left: { type: 'literal', value: 5 },
                    right: { type: 'literal', value: 3 }
                });
            });
        });

        test('should parse logical operations', () => {
            const operators = ['&&', '||', 'and', 'or'];

            operators.forEach(op => {
                const tokenizer = new Tokenizer(`true ${op} false`);
                const tokens = tokenizer.tokenize();
                const parser = new Parser(tokens);
                const ast = parser.parse();

                expect(ast).toEqual({
                    type: 'binary',
                    operator: op,
                    left: { type: 'literal', value: true },
                    right: { type: 'literal', value: false }
                });
            });
        });

        test('should handle operator precedence correctly', () => {
            // Test arithmetic precedence: 2 + 3 * 4 should be 2 + (3 * 4)
            const tokenizer = new Tokenizer('2 + 3 * 4');
            const tokens = tokenizer.tokenize();
            const parser = new Parser(tokens);
            const ast = parser.parse();

            expect(ast).toEqual({
                type: 'binary',
                operator: '+',
                left: { type: 'literal', value: 2 },
                right: {
                    type: 'binary',
                    operator: '*',
                    left: { type: 'literal', value: 3 },
                    right: { type: 'literal', value: 4 }
                }
            });
        });

        test('should handle mixed arithmetic and logical precedence', () => {
            // Test: 5 + 3 > 7 && true should be ((5 + 3) > 7) && true
            const tokenizer = new Tokenizer('5 + 3 > 7 && true');
            const tokens = tokenizer.tokenize();
            const parser = new Parser(tokens);
            const ast = parser.parse();

            expect(ast).toEqual({
                type: 'binary',
                operator: '&&',
                left: {
                    type: 'binary',
                    operator: '>',
                    left: {
                        type: 'binary',
                        operator: '+',
                        left: { type: 'literal', value: 5 },
                        right: { type: 'literal', value: 3 }
                    },
                    right: { type: 'literal', value: 7 }
                },
                right: { type: 'literal', value: true }
            });
        });
    });

    describe('Unary Operations', () => {
        test('should parse unary not operations', () => {
            const operators = ['not', '!'];

            operators.forEach(op => {
                const tokenizer = new Tokenizer(`${op} true`);
                const tokens = tokenizer.tokenize();
                const parser = new Parser(tokens);
                const ast = parser.parse();

                expect(ast).toEqual({
                    type: 'unary',
                    operator: op,
                    operand: { type: 'literal', value: true }
                });
            });
        });

        test('should parse unary not with complex expressions', () => {
            const tokenizer = new Tokenizer('not (true && false)');
            const tokens = tokenizer.tokenize();
            const parser = new Parser(tokens);
            const ast = parser.parse();

            expect(ast).toEqual({
                type: 'unary',
                operator: 'not',
                operand: {
                    type: 'binary',
                    operator: '&&',
                    left: { type: 'literal', value: true },
                    right: { type: 'literal', value: false }
                }
            });
        });
    });

    describe('Custom Conditions', () => {
        test('should parse custom conditions', () => {
            const tokenizer = new Tokenizer('$user.age custom:between 18');
            const tokens = tokenizer.tokenize();
            const parser = new Parser(tokens);
            const ast = parser.parse();

            expect(ast).toEqual({
                type: 'custom',
                name: 'between',
                left: {
                    type: 'property',
                    object: 'user',
                    property: 'age',
                    notation: 'dot'
                },
                right: { type: 'literal', value: 18 }
            });
        });
    });

    describe('Parentheses and Grouping', () => {
        test('should handle parenthesized expressions', () => {
            const tokenizer = new Tokenizer('(true)');
            const tokens = tokenizer.tokenize();
            const parser = new Parser(tokens);
            const ast = parser.parse();

            expect(ast).toEqual({
                type: 'literal',
                value: true
            });
        });

        test('should handle deeply nested parentheses', () => {
            const tokenizer = new Tokenizer('(((true)))');
            const tokens = tokenizer.tokenize();
            const parser = new Parser(tokens);
            const ast = parser.parse();

            expect(ast).toEqual({
                type: 'literal',
                value: true
            });
        });

        test('should handle parentheses changing precedence', () => {
            // Test: (2 + 3) * 4 should be (2 + 3) * 4, not 2 + (3 * 4)
            const tokenizer = new Tokenizer('(2 + 3) * 4');
            const tokens = tokenizer.tokenize();
            const parser = new Parser(tokens);
            const ast = parser.parse();

            expect(ast).toEqual({
                type: 'binary',
                operator: '*',
                left: {
                    type: 'binary',
                    operator: '+',
                    left: { type: 'literal', value: 2 },
                    right: { type: 'literal', value: 3 }
                },
                right: { type: 'literal', value: 4 }
            });
        });
    });

    describe('Error Handling', () => {
        test('should throw error for unexpected token after valid expression', () => {
            const tokenizer = new Tokenizer('true false');
            const tokens = tokenizer.tokenize();
            const parser = new Parser(tokens);

            expect(() => parser.parse()).toThrow("Unexpected token 'false' at position 5");
        });

        test('should throw error for invalid bracket notation - no string or identifier', () => {
            const tokenizer = new Tokenizer('$user[123]'); // number instead of string/identifier
            const tokens = tokenizer.tokenize();
            const parser = new Parser(tokens);

            expect(() => parser.parse()).toThrow("Expected string or identifier in bracket notation");
        });

        test('should throw error for missing closing bracket', () => {
            const tokenizer = new Tokenizer('$user["name"');
            const tokens = tokenizer.tokenize();
            const parser = new Parser(tokens);

            expect(() => parser.parse()).toThrow("Expected ']' after property name");
        });

        test('should throw error for missing closing parenthesis', () => {
            const tokenizer = new Tokenizer('(true');
            const tokens = tokenizer.tokenize();
            const parser = new Parser(tokens);

            expect(() => parser.parse()).toThrow("Expected ')' after expression");
        });

        test('should throw error for missing colon after custom', () => {
            const tokenizer = new Tokenizer('true custom invalid');
            const tokens = tokenizer.tokenize();
            const parser = new Parser(tokens);

            expect(() => parser.parse()).toThrow("Expected ':' after 'custom'");
        });

        test('should throw error for missing condition name after custom:', () => {
            const tokenizer = new Tokenizer('true custom: 123'); // number instead of identifier
            const tokens = tokenizer.tokenize();
            const parser = new Parser(tokens);

            expect(() => parser.parse()).toThrow("Expected condition name after 'custom:'");
        });

        test('should throw error for missing property name after dot', () => {
            const tokenizer = new Tokenizer('$user. 123'); // no identifier after dot
            const tokens = tokenizer.tokenize();
            const parser = new Parser(tokens);

            expect(() => parser.parse()).toThrow("Expected property name after '.'");
        });

        test('should throw error for unexpected token in value position', () => {
            const tokenizer = new Tokenizer('true && ]'); // unexpected ] token
            const tokens = tokenizer.tokenize();
            const parser = new Parser(tokens);

            expect(() => parser.parse()).toThrow("Unexpected token ']' at position 8");
        });

        test('should handle empty token stream', () => {
            const tokens = [{ type: TokenType.EOF, value: '', position: 0 }];
            const parser = new Parser(tokens);

            expect(() => parser.parse()).toThrow();
        });
    });

    describe('Complex Expressions', () => {
        test('should parse very long expressions', () => {
            const expr = 'true' + ' && true'.repeat(10);
            const tokenizer = new Tokenizer(expr);
            const tokens = tokenizer.tokenize();
            const parser = new Parser(tokens);

            expect(() => parser.parse()).not.toThrow();
        });

        test('should parse deeply nested expressions', () => {
            const expr = '('.repeat(10) + 'true' + ')'.repeat(10);
            const tokenizer = new Tokenizer(expr);
            const tokens = tokenizer.tokenize();
            const parser = new Parser(tokens);
            const ast = parser.parse();

            expect(ast).toEqual({
                type: 'literal',
                value: true
            });
        });

        test('should parse complex real-world expressions', () => {
            const tokenizer = new Tokenizer('$user.age >= 18 && $user.active == true && ($user.role == "admin" || $user.role == "moderator")');
            const tokens = tokenizer.tokenize();
            const parser = new Parser(tokens);

            const ast = parser.parse();
            expect(ast.type).toBe('binary');
            expect(ast.operator).toBe('&&');
        });
    });

    describe('Edge Cases', () => {
        test('should handle whitespace correctly', () => {
            const tokenizer = new Tokenizer('  true   &&   false  ');
            const tokens = tokenizer.tokenize();
            const parser = new Parser(tokens);
            const ast = parser.parse();

            expect(ast).toEqual({
                type: 'binary',
                operator: '&&',
                left: { type: 'literal', value: true },
                right: { type: 'literal', value: false }
            });
        });

        test('should handle special characters in bracket notation', () => {
            const tokenizer = new Tokenizer('$data["key-with-dashes"]');
            const tokens = tokenizer.tokenize();
            const parser = new Parser(tokens);
            const ast = parser.parse();

            expect(ast).toEqual({
                type: 'property',
                object: 'data',
                property: 'key-with-dashes',
                notation: 'bracket'
            });
        });

        test('should handle consecutive operators', () => {
            const tokenizer = new Tokenizer('5--3'); // Should parse as 5 - (-3)
            const tokens = tokenizer.tokenize();
            const parser = new Parser(tokens);
            const ast = parser.parse();

            expect(ast.type).toBe('binary');
            expect(ast.operator).toBe('-');
            expect(ast.left).toEqual({ type: 'literal', value: 5 });
            expect(ast.right).toEqual({ type: 'literal', value: -3 });
        });
    });
});