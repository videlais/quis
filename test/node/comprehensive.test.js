/**
 * Comprehensive parser test suite
 * Tests all major functionality of the Quis DSL parser
 */

const quis = require('../../build/quis.js');

describe('Comprehensive Parser Tests', () => {
    test('Basic expressions should parse correctly', () => {
        expect(quis.parse('true')).toBe(true);
        expect(quis.parse('false')).toBe(false);
        expect(quis.parse('42')).toBe(42);
        expect(quis.parse('"hello"')).toBe('hello');
    });

    test('Boolean operations should work correctly', () => {
        expect(quis.parse('true and false')).toBe(false);
        expect(quis.parse('true or false')).toBe(true);
        expect(quis.parse('not true')).toBe(false);
        expect(quis.parse('!false')).toBe(true);
    });

    test('Comparison operations should work correctly', () => {
        expect(quis.parse('5 > 3')).toBe(true);
        expect(quis.parse('5 < 3')).toBe(false);
        expect(quis.parse('5 >= 5')).toBe(true);
        expect(quis.parse('5 <= 4')).toBe(false);
        expect(quis.parse('5 == 5')).toBe(true);
        expect(quis.parse('5 != 3')).toBe(true);
    });

    test('Variable resolution should work with valuesCallback', () => {
        const values = (name) => {
            const data = { count: 10, active: true, name: 'test' };
            return data[name];
        };

        expect(quis.parse('$count > 5', { values })).toBe(true);
        expect(quis.parse('$active', { values })).toBe(true);
        expect(quis.parse('$name == "test"', { values })).toBe(true);
    });

    test('Key-value access should work correctly', () => {
        const values = (name) => {
            const data = { user: { age: 25, name: 'John' } };
            return data[name];
        };
        
        expect(quis.parse('$user.age > 20', { values })).toBe(true);
        expect(quis.parse('$user.name == "John"', { values })).toBe(true);
        expect(quis.parse('$user["age"] >= 25', { values })).toBe(true);
    });

    test('Complex nested expressions should work', () => {
        const values = (name) => {
            const data = { 
                user: { active: true, score: 85 }, 
                threshold: 80 
            };
            return data[name];
        };

        const expr = '($user.active and $user.score > $threshold) or $user.score == 100';
        expect(quis.parse(expr, { values })).toBe(true);
    });

    test('String operations should work correctly', () => {
        expect(quis.parse('"hello" == "hello"')).toBe(true);
        expect(quis.parse('"hello" != "world"')).toBe(true);
        expect(quis.parse('"apple" < "banana"')).toBe(true);
    });

    test('Custom conditions should work', () => {
        quis.addCustomCondition('contains', (value, expected) => 
            String(value).includes(String(expected))
        );

        const values = (name) => {
            const data = { text: 'hello world' };
            return data[name];
        };
        expect(quis.parse('$text custom:contains "world"', { values })).toBe(true);
        expect(quis.parse('$text custom:contains "foo"', { values })).toBe(false);

        quis.removeCustomCondition('contains');
    });

    test('Parentheses should control operator precedence', () => {
        expect(quis.parse('(true or false) and false')).toBe(false);
        expect(quis.parse('true or (false and false)')).toBe(true);
        expect(quis.parse('(5 + 3) > (2 * 4)')).toBe(false);
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
            expect(() => quis.parse(expr)).toThrow();
        });
    });
});