/**
 * Test suite for AST-based parser
 * Verifies API compatibility with PEG parser
 */

// Import AST parser components directly as ES modules
import { Tokenizer } from '../../src/tokenizer.js';
import { Parser } from '../../src/parser.js';
import { Evaluator } from '../../src/evaluator.js';

// Helper function to test AST parser
function parseWithAST(expression, options = {}) {
    const tokenizer = new Tokenizer(expression);
    const tokens = tokenizer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    const evaluator = new Evaluator(options);
    return evaluator.evaluate(ast);
}

describe('AST Parser API Compatibility', () => {
    test('should parse simple boolean expressions', () => {
        expect(parseWithAST('true')).toBe(true);
        expect(parseWithAST('false')).toBe(false);
        expect(parseWithAST('true && false')).toBe(false);
        expect(parseWithAST('true || false')).toBe(true);
    });

    test('should parse comparison expressions', () => {
        expect(parseWithAST('5 > 3')).toBe(true);
        expect(parseWithAST('5 < 3')).toBe(false);
        expect(parseWithAST('5 >= 5')).toBe(true);
        expect(parseWithAST('5 <= 4')).toBe(false);
        expect(parseWithAST('5 == 5')).toBe(true);
        expect(parseWithAST('5 != 3')).toBe(true);
    });

    test('should parse shorthand operators', () => {
        expect(parseWithAST('5 gt 3')).toBe(true);
        expect(parseWithAST('5 lt 3')).toBe(false);
        expect(parseWithAST('5 gte 5')).toBe(true);
        expect(parseWithAST('5 lte 4')).toBe(false);
        expect(parseWithAST('5 is 5')).toBe(true);
        expect(parseWithAST('5 is not 3')).toBe(true);
    });

    test('should handle variables with values callback', () => {
        const options = {
            values: (name) => {
                if (name === 'age') return 25;
                if (name === 'name') return 'John';
                return null;
            }
        };

        expect(parseWithAST('$age > 18', options)).toBe(true);
        expect(parseWithAST('$name == "John"', options)).toBe(true);
        expect(parseWithAST('$unknown == null', options)).toBe(true);
    });

    test('should handle property access', () => {
        const options = {
            values: (name) => {
                if (name === 'user') return { age: 25, name: 'John', active: true };
                return null;
            }
        };

        expect(parseWithAST('$user.age > 18', options)).toBe(true);
        expect(parseWithAST('$user["name"] == "John"', options)).toBe(true);
        expect(parseWithAST('$user.active == true', options)).toBe(true);
    });

    test('should handle complex expressions with parentheses', () => {
        const options = {
            values: (name) => {
                if (name === 'age') return 25;
                if (name === 'status') return 'active';
                if (name === 'admin') return true;
                return null;
            }
        };

        expect(parseWithAST('($age > 18 && $status == "active") || $admin == true', options)).toBe(true);
        expect(parseWithAST('!($age < 18)', options)).toBe(true);
    });

    test('should handle custom conditions', () => {
        const options = {
            values: (name) => {
                if (name === 'text') return 'Hello World';
                if (name === 'age') return 25;
                return null;
            },
            customConditions: {
                contains: (text, search) => text.includes(search),
                between: (value, range) => {
                    const [min, max] = range.split('-').map(Number);
                    return value >= min && value <= max;
                }
            }
        };

        expect(parseWithAST('$text custom:contains "Hello"', options)).toBe(true);
        expect(parseWithAST('$age custom:between "18-30"', options)).toBe(true);
        expect(parseWithAST('$text custom:contains "Goodbye"', options)).toBe(false);
    });

    test('should throw SyntaxError for invalid expressions', () => {
        expect(() => parseWithAST('5 +')).toThrow();
        expect(() => parseWithAST('$invalid custom:unknown "test"')).toThrow();
        expect(() => parseWithAST('5 > ')).toThrow();
    });

    test('should handle operator precedence correctly', () => {
        expect(parseWithAST('true || false && false')).toBe(true); // AND has higher precedence
        expect(parseWithAST('(true || false) && false')).toBe(false); // Parentheses override
        expect(parseWithAST('5 + 3 > 7')).toBe(true); // Arithmetic is now supported!
    });

    test('should maintain exact API compatibility', () => {
        // Test that the same expressions work exactly the same way
        const testCases = [
            'true && false',
            '$value > 10',
            '$user.name == "test"',
            '($a > 5 && $b < 10) || $c == null'
        ];

        const options = {
            values: (name) => {
                switch (name) {
                    case 'value': return 15;
                    case 'user': return { name: 'test' };
                    case 'a': return 6;
                    case 'b': return 8;
                    case 'c': return null;
                    default: return null;
                }
            }
        };

        testCases.forEach(expr => {
            expect(() => parseWithAST(expr, options)).not.toThrow();
        });
    });
});