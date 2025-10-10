/**
 * Comprehensive AST parser test suite
 * Tests all major functionality of the Quis DSL parser
 */

const quis = require('../../build/quis.js');

describe('Comprehensive AST Parser Tests', () => {
    const testCases = [
        // Simple expressions
        'true',
        'false', 
        'null',
        '42',
        '"hello"',
        
        // Boolean operations
        'true && false',
        'true || false',
        '!true',
        
        // Comparisons
        '5 > 3',
        '5 < 3', 
        '5 >= 5',
        '5 <= 4',
        '5 == 5',
        '5 != 3',
        
        // Shorthand operators
        '5 gt 3',
        '5 lt 3',
        '5 gte 5', 
        '5 lte 4',
        '5 is 5',
        '5 is not 3',
        
        // Complex expressions
        'true || false && false',
        '(true || false) && false',
        '!(5 < 3)',
        '5 > 3 && 10 < 20',
        '(5 > 3 || 2 < 1) && true'
    ];

    const testCasesWithOptions = [
        {
            expr: '$age > 18',
            options: { values: (name) => name === 'age' ? 25 : null }
        },
        {
            expr: '$user.name == "John"',
            options: { values: (name) => name === 'user' ? { name: 'John' } : null }
        },
        {
            expr: '$user["active"] == true',
            options: { values: (name) => name === 'user' ? { active: true } : null }
        },
        {
            expr: '$a > 5 && $b < 10',
            options: { values: (name) => ({ a: 6, b: 8 })[name] || null }
        }
    ];

    test.each(testCases)('Both parsers should return same result for: %s', (expression) => {
        const pegResult = quis.parse(expression);
        const astResult = quis.parse(expression, { useASTParser: true });
        
        expect(astResult).toBe(pegResult);
    });

    test.each(testCasesWithOptions)('Both parsers with options should return same result for: $expr', ({ expr, options }) => {
        const pegResult = quis.parse(expr, options);
        const astResult = quis.parse(expr, { ...options, useASTParser: true });
        
        expect(astResult).toBe(pegResult);
    });

    test('Custom conditions should work identically in both parsers', () => {
        const customConditions = {
            contains: (text, search) => String(text).includes(String(search)),
            between: (value, range) => {
                const [min, max] = range.split('-').map(Number);
                return value >= min && value <= max;
            }
        };

        const options = {
            values: (name) => {
                if (name === 'text') return 'Hello World';
                if (name === 'age') return 25;
                return null;
            },
            customConditions
        };

        const expressions = [
            '$text custom:contains "Hello"',
            '$age custom:between "18-30"',
            '$text custom:contains "Goodbye"'
        ];

        expressions.forEach(expr => {
            const pegResult = quis.parse(expr, options);
            const astResult = quis.parse(expr, { ...options, useASTParser: true });
            
            expect(astResult).toBe(pegResult);
        });
    });

    test('Error handling should be consistent', () => {
        const invalidExpressions = [
            '5 +',
            '5 > ',
            'invalid syntax here'
        ];

        invalidExpressions.forEach(expr => {
            expect(() => quis.parse(expr)).toThrow();
        });
    });
});