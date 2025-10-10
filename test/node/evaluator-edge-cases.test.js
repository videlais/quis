/**
 * Edge case tests for the Evaluator class to improve coverage
 */

const quis = require('../../build/quis.js');

describe('Evaluator Edge Cases', () => {
    test('should handle variable evaluation without values function', () => {
        // This tests the return null path in evaluateVariable
        expect(quis.parse('$undefined_var')).toBe(null);
    });

    test('should handle property access on non-objects', () => {
        const values = (name) => {
            if (name === 'primitiveValue') return 42;
            if (name === 'nullValue') return null;
            return undefined;
        };

        // These should return null since we can't access properties on primitives/null
        expect(quis.parse('$primitiveValue.property', { values })).toBe(null);
        expect(quis.parse('$nullValue.property', { values })).toBe(null);
        expect(quis.parse('$undefined.property', { values })).toBe(null);
    });

    test('should handle property access on object without the property', () => {
        const values = (name) => {
            if (name === 'obj') return { existingProp: 'value' };
            return null;
        };

        // Property doesn't exist, should return null
        expect(quis.parse('$obj.nonExistentProp', { values })).toBe(null);
    });

    test('should handle edge cases with arithmetic operations', () => {
        // Test division by zero
        expect(quis.parse('10 / 0')).toBe(Infinity);
        
        // Test with negative numbers
        expect(quis.parse('-5 + 3')).toBe(-2);
        expect(quis.parse('10 - -5')).toBe(15);
        
        // Test multiplication edge cases
        expect(quis.parse('0 * 999')).toBe(0);
        expect(quis.parse('5 * -3')).toBe(-15);
    });

    test('should handle string concatenation with +', () => {
        expect(quis.parse('"hello" + " world"')).toBe('hello world');
        expect(quis.parse('"number: " + 42')).toBe('number: 42');
    });

    test('should handle boolean coercion in logical operations', () => {
        // Test truthy/falsy coercion
        expect(quis.parse('0 && true')).toBe(false);
        expect(quis.parse('"" && true')).toBe(false);
        expect(quis.parse('null && true')).toBe(false);
        expect(quis.parse('1 && true')).toBe(true);
        expect(quis.parse('"hello" && true')).toBe(true);
        
        // OR operations with falsy values
        expect(quis.parse('0 || false')).toBe(false);
        expect(quis.parse('0 || "fallback"')).toBe('fallback');
        expect(quis.parse('null || 42')).toBe(42);
    });

    test('should handle comparison edge cases', () => {
        // String comparison
        expect(quis.parse('"apple" < "banana"')).toBe(true);
        expect(quis.parse('"zebra" > "apple"')).toBe(true);
        
        // Mixed type comparisons
        expect(quis.parse('5 == "5"')).toBe(true);  // loose equality
        expect(quis.parse('true == 1')).toBe(true); // boolean coercion
        expect(quis.parse('false == 0')).toBe(true); // boolean coercion
        
        // Null comparisons
        expect(quis.parse('null == null')).toBe(true);
        expect(quis.parse('null != "something"')).toBe(true);
    });

    test('should handle complex nested property access', () => {
        const values = (name) => {
            const data = {
                user: {
                    profile: {
                        settings: {
                            theme: 'dark',
                            notifications: true
                        }
                    }
                },
                config: {
                    version: '1.0.0'
                }
            };
            return data[name];
        };

        // Test deeply nested property access
        expect(quis.parse('$user.profile', { values })).toEqual({
            settings: { theme: 'dark', notifications: true }
        });
    });

    test('should handle custom condition error cases', () => {
        // Test that undefined custom conditions throw errors via the parse function
        expect(() => {
            quis.parse('5 custom:nonexistent 3');
        }).toThrow("Custom condition 'nonexistent' is not defined");
    });

    test('should handle priority of operations correctly', () => {
        // Test that multiplication happens before addition
        expect(quis.parse('2 + 3 * 4')).toBe(14); // 2 + (3 * 4) = 14, not (2 + 3) * 4 = 20
        
        // Test that division happens before subtraction  
        expect(quis.parse('10 - 8 / 2')).toBe(6); // 10 - (8 / 2) = 6, not (10 - 8) / 2 = 1
        
        // Complex expression with mixed operations
        expect(quis.parse('2 * 3 + 4 / 2 - 1')).toBe(7); // (2 * 3) + (4 / 2) - 1 = 6 + 2 - 1 = 7
    });
});