/**
 * Final coverage tests to hit remaining uncovered lines in evaluator.ts
 */

const { Quis } = require('../../build/quis.cjs');
const { Tokenizer } = require('../../src/tokenizer');
const { Parser } = require('../../src/parser');
const { Evaluator } = require('../../src/evaluator');

describe('Evaluator Final Coverage Tests', () => {
    let evaluator;

    beforeEach(() => {
        evaluator = new Evaluator({});
    });

    describe('Binary Operations - Division and Multiplication', () => {
        test('should handle division operator', () => {
            const tokenizer = new Tokenizer('10 / 2');
            const tokens = tokenizer.tokenize();
            const parser = new Parser(tokens);
            const ast = parser.parse();
            
            const result = evaluator.evaluate(ast);
            expect(result).toBe(5);
        });

        test('should handle multiplication operator', () => {
            const tokenizer = new Tokenizer('3 * 4');
            const tokens = tokenizer.tokenize();
            const parser = new Parser(tokens);
            const ast = parser.parse();
            
            const result = evaluator.evaluate(ast);
            expect(result).toBe(12);
        });

        test('should handle subtraction operator', () => {
            const tokenizer = new Tokenizer('10 - 3');
            const tokens = tokenizer.tokenize();
            const parser = new Parser(tokens);
            const ast = parser.parse();
            
            const result = evaluator.evaluate(ast);
            expect(result).toBe(7);
        });

        test('should throw error for unknown binary operator', () => {
            // Create a mock binary operation node with unknown operator
            const mockNode = {
                type: 'binary',
                left: { type: 'literal', value: 5 },
                operator: '%', // Unknown operator
                right: { type: 'literal', value: 2 }
            };
            
            expect(() => evaluator.evaluate(mockNode)).toThrow('Unknown binary operator: %');
        });
    });

    describe('Values Function Exception Handling', () => {
        test('should handle values function that throws in try-catch', () => {
            const throwingValues = () => {
                throw new Error('Values function error');
            };
            
            const evaluatorWithThrowingValues = new Evaluator({
                values: throwingValues
            });

            // Create a variable node directly since parser requires known variables
            const variableNode = {
                type: 'variable',
                name: 'someVariable'
            };
            
            // Should return null when values function throws
            const result = evaluatorWithThrowingValues.evaluate(variableNode);
            expect(result).toBeNull();
        });

        test('should handle values function that throws during variable resolution', () => {
            const throwingValues = (key) => {
                if (key === 'problematic') {
                    throw new Error('Cannot resolve this variable');
                }
                return { normal: 'value' };
            };
            
            const evaluatorWithThrowingValues = new Evaluator({
                values: throwingValues
            });

            // Create a variable node directly
            const variableNode = {
                type: 'variable',
                name: 'problematic'
            };
            
            // Should return null when values function throws for specific variable
            const result = evaluatorWithThrowingValues.evaluate(variableNode);
            expect(result).toBeNull();
        });
    });

    describe('Edge Cases for Complete Coverage', () => {
        test('should handle complex arithmetic with type conversion', () => {
            const tokenizer = new Tokenizer('"5" * "2"');
            const tokens = tokenizer.tokenize();
            const parser = new Parser(tokens);
            const ast = parser.parse();
            
            const result = evaluator.evaluate(ast);
            expect(result).toBe(10);
        });

        test('should handle division by zero', () => {
            const tokenizer = new Tokenizer('5 / 0');
            const tokens = tokenizer.tokenize();
            const parser = new Parser(tokens);
            const ast = parser.parse();
            
            const result = evaluator.evaluate(ast);
            expect(result).toBe(Infinity);
        });

        test('should handle complex nested arithmetic', () => {
            const tokenizer = new Tokenizer('(2 + 3) * (4 - 1)');
            const tokens = tokenizer.tokenize();
            const parser = new Parser(tokens);
            const ast = parser.parse();
            
            const result = evaluator.evaluate(ast);
            expect(result).toBe(15);
        });
    });
});