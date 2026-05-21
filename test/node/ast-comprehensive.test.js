/**
 * Comprehensive AST parser test suite
 * Tests all major functionality of the Quis DSL parser via the evaluate() API
 */

const quis = require('../../build/quis.js');

describe('Comprehensive AST Parser Tests', () => {
    const testCases = [
        // Simple expressions
        ['true', true],
        ['false', false],
        ['null', null],
        ['42', 42],
        ['"hello"', 'hello'],

        // Boolean operations
        ['true && false', false],
        ['true || false', true],
        ['!true', false],

        // Comparisons
        ['5 > 3', true],
        ['5 < 3', false],
        ['5 >= 5', true],
        ['5 <= 4', false],
        ['5 == 5', true],
        ['5 != 3', true],

        // Shorthand operators
        ['5 gt 3', true],
        ['5 lt 3', false],
        ['5 gte 5', true],
        ['5 lte 4', false],
        ['5 is 5', true],
        ['5 is not 3', true],

        // Complex expressions
        ['true || false && false', true],
        ['(true || false) && false', false],
        ['!(5 < 3)', true],
        ['5 > 3 && 10 < 20', true],
        ['(5 > 3 || 2 < 1) && true', true],
    ];

    test.each(testCases)('evaluate(%s) === %s', (expression, expected) => {
        expect(quis.evaluate(expression)).toBe(expected);
    });

    test('evaluate with context: variable resolution', () => {
        expect(quis.evaluate('$age > 18', { age: 25 })).toBe(true);
        expect(quis.evaluate('$user.name == "John"', { user: { name: 'John' } })).toBe(true);
        expect(quis.evaluate('$user["active"] == true', { user: { active: true } })).toBe(true);
        expect(quis.evaluate('$a > 5 && $b < 10', { a: 6, b: 8 })).toBe(true);
    });

    test('Custom conditions should work', () => {
        const customConditions = {
            contains: (text, search) => String(text).includes(String(search)),
            between: (value, range) => {
                const [min, max] = range.split('-').map(Number);
                return value >= min && value <= max;
            }
        };

        expect(quis.evaluate('$text custom:contains "Hello"', { text: 'Hello World' }, { customConditions })).toBe(true);
        expect(quis.evaluate('$age custom:between "18-30"', { age: 25 }, { customConditions })).toBe(true);
        expect(quis.evaluate('$text custom:contains "Goodbye"', { text: 'Hello World' }, { customConditions })).toBe(false);
    });

    test('Error handling should throw for invalid expressions', () => {
        const invalidExpressions = [
            '5 +',
            '5 > ',
            'invalid syntax here'
        ];

        invalidExpressions.forEach(expr => {
            expect(() => quis.evaluate(expr)).toThrow();
        });
    });
});
