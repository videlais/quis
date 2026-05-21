/**
 * Comprehensive parser test suite
 * Tests all major functionality of the Quis DSL parser
 */

const quis = require('../../build/quis.js');

describe('Comprehensive Parser Tests', () => {
    test('Basic expressions should evaluate correctly', () => {
        expect(quis.evaluate('true')).toBe(true);
        expect(quis.evaluate('false')).toBe(false);
        expect(quis.evaluate('42')).toBe(42);
        expect(quis.evaluate('"hello"')).toBe('hello');
    });

    test('Boolean operations should work correctly', () => {
        expect(quis.evaluate('true and false')).toBe(false);
        expect(quis.evaluate('true or false')).toBe(true);
        expect(quis.evaluate('not true')).toBe(false);
        expect(quis.evaluate('!false')).toBe(true);
    });

    test('Comparison operations should work correctly', () => {
        expect(quis.evaluate('5 > 3')).toBe(true);
        expect(quis.evaluate('5 < 3')).toBe(false);
        expect(quis.evaluate('5 >= 5')).toBe(true);
        expect(quis.evaluate('5 <= 4')).toBe(false);
        expect(quis.evaluate('5 == 5')).toBe(true);
        expect(quis.evaluate('5 != 3')).toBe(true);
    });

    test('Variable resolution should work with context object', () => {
        const context = { count: 10, active: true, name: 'test' };

        expect(quis.evaluate('$count > 5', context)).toBe(true);
        expect(quis.evaluate('$active', context)).toBe(true);
        expect(quis.evaluate('$name == "test"', context)).toBe(true);
    });

    test('Key-value access should work correctly', () => {
        const context = { user: { age: 25, name: 'John' } };

        expect(quis.evaluate('$user.age > 20', context)).toBe(true);
        expect(quis.evaluate('$user.name == "John"', context)).toBe(true);
        expect(quis.evaluate('$user["age"] >= 25', context)).toBe(true);
    });

    test('Complex nested expressions should work', () => {
        const context = {
            user: { active: true, score: 85 },
            threshold: 80
        };

        const expr = '($user.active and $user.score > $threshold) or $user.score == 100';
        expect(quis.evaluate(expr, context)).toBe(true);
    });

    test('String operations should work correctly', () => {
        expect(quis.evaluate('"hello" == "hello"')).toBe(true);
        expect(quis.evaluate('"hello" != "world"')).toBe(true);
        expect(quis.evaluate('"apple" < "banana"')).toBe(true);
    });

    test('Custom conditions should work', () => {
        quis.addCustomCondition('contains', (value, expected) => 
            String(value).includes(String(expected))
        );

        expect(quis.evaluate('$text custom:contains "world"', { text: 'hello world' })).toBe(true);
        expect(quis.evaluate('$text custom:contains "foo"', { text: 'hello world' })).toBe(false);

        quis.removeCustomCondition('contains');
    });

    test('Parentheses should control operator precedence', () => {
        expect(quis.evaluate('(true or false) and false')).toBe(false);
        expect(quis.evaluate('true or (false and false)')).toBe(true);
        expect(quis.evaluate('(5 + 3) > (2 * 4)')).toBe(false);
    });

    test('Error handling should work for invalid expressions', () => {
        const invalidExpressions = [
            '5 +',
            '5 > ',
            'invalid syntax here',
            '($unmatched',
            'true and and false'
        ];

        invalidExpressions.forEach(expr => {
            expect(() => quis.evaluate(expr)).toThrow();
        });
    });
});