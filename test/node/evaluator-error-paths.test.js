/**
 * Error path tests to improve coverage of error conditions
 * These tests focus on edge cases and error scenarios
 */

const quis = require('../../build/quis.js');

describe('Evaluator Error Paths', () => {
    test('should handle values function that throws an error', () => {
        const throwingValues = (name) => {
            if (name === 'throwError') {
                throw new Error('Values function error');
            }
            return name === 'valid' ? 'success' : null;
        };

        // Should handle the error gracefully and return null
        expect(quis.parse('$throwError', { values: throwingValues })).toBe(null);
        expect(quis.parse('$throwError.property', { values: throwingValues })).toBe(null);
        
        // Should still work for valid variables
        expect(quis.parse('$valid', { values: throwingValues })).toBe('success');
    });

    test('should handle various numeric edge cases', () => {
        // Test NaN handling
        const values = (name) => {
            const data = {
                nanValue: NaN,
                infinityValue: Infinity,
                negInfinityValue: -Infinity,
                zero: 0,
                negativeZero: -0
            };
            return data[name];
        };

        // NaN comparisons should work
        expect(quis.parse('$nanValue == $nanValue', { values })).toBe(false); // NaN != NaN
        expect(quis.parse('$infinityValue > 999999', { values })).toBe(true);
        expect(quis.parse('$negInfinityValue < -999999', { values })).toBe(true);
        
        // Test with arithmetic
        expect(quis.parse('$zero / $zero', { values })).toBeNaN();
        expect(quis.parse('$infinityValue - $infinityValue', { values })).toBeNaN();
    });

    test('should handle string to number coercion edge cases', () => {
        // Test arithmetic with strings that convert to numbers
        expect(quis.parse('"10" - "5"')).toBe(5);
        expect(quis.parse('"10" * "2"')).toBe(20);
        expect(quis.parse('"10" / "2"')).toBe(5);
        
        // Test with strings that don't convert to numbers
        expect(quis.parse('"hello" - "world"')).toBeNaN();
        expect(quis.parse('"abc" * "def"')).toBeNaN();
        expect(quis.parse('"xyz" / "123"')).toBeNaN();
    });

    test('should handle null and undefined in arithmetic', () => {
        const values = (name) => {
            const data = {
                nullValue: null,
                undefinedValue: undefined
            };
            return data[name];
        };

        // Null converts to 0 in arithmetic
        expect(quis.parse('$nullValue + 5', { values })).toBe(5);
        expect(quis.parse('$nullValue * 10', { values })).toBe(0);
        
        // Undefined converts to NaN in arithmetic
        expect(quis.parse('$undefinedValue + 5', { values })).toBeNaN();
        expect(quis.parse('$undefinedValue * 10', { values })).toBeNaN();
    });

    test('should handle boolean to number coercion', () => {
        // Test boolean arithmetic
        expect(quis.parse('true + false')).toBe(1); // true=1, false=0
        expect(quis.parse('true * 5')).toBe(5);
        expect(quis.parse('false * 10')).toBe(0);
        expect(quis.parse('true - false')).toBe(1);
    });

    test('should handle complex mixed-type operations', () => {
        // Mixed string and number addition (concatenation vs arithmetic)
        expect(quis.parse('"5" + 3')).toBe('53'); // String concatenation
        expect(quis.parse('5 + "3"')).toBe('53'); // String concatenation
        
        // Other operations force numeric conversion
        expect(quis.parse('"5" - 3')).toBe(2);
        expect(quis.parse('5 - "3"')).toBe(2);
    });
});