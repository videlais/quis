/**
 * Comprehensive tests for the Evaluator class
 * Consolidates all evaluator-related tests into a single file
 */

const { Evaluator } = require('../../src/evaluator');
const { Tokenizer } = require('../../src/tokenizer');
const { Parser } = require('../../src/parser');

describe('Evaluator', () => {
    describe('Basic Evaluation', () => {
        let evaluator;

        beforeEach(() => {
            evaluator = new Evaluator({});
        });

        test('should evaluate literal nodes', () => {
            const literalNode = { type: 'literal', value: 42 };
            expect(evaluator.evaluate(literalNode)).toBe(42);

            const stringNode = { type: 'literal', value: 'hello' };
            expect(evaluator.evaluate(stringNode)).toBe('hello');

            const booleanNode = { type: 'literal', value: true };
            expect(evaluator.evaluate(booleanNode)).toBe(true);

            const nullNode = { type: 'literal', value: null };
            expect(evaluator.evaluate(nullNode)).toBe(null);
        });

        test('should evaluate variable nodes', () => {
            const evaluatorWithValues = new Evaluator({
                values: (name) => ({ user: 'Alice', age: 25 })[name]
            });

            const variableNode = { type: 'variable', name: 'user' };
            expect(evaluatorWithValues.evaluate(variableNode)).toBe('Alice');

            const ageNode = { type: 'variable', name: 'age' };
            expect(evaluatorWithValues.evaluate(ageNode)).toBe(25);
        });

        test('should return null for undefined variables', () => {
            const variableNode = { type: 'variable', name: 'undefined' };
            expect(evaluator.evaluate(variableNode)).toBeNull();
        });
    });

    describe('Binary Operations', () => {
        let evaluator;

        beforeEach(() => {
            evaluator = new Evaluator({});
        });

        test('should handle arithmetic operations', () => {
            const addNode = {
                type: 'binary',
                operator: '+',
                left: { type: 'literal', value: 5 },
                right: { type: 'literal', value: 3 }
            };
            expect(evaluator.evaluate(addNode)).toBe(8);

            const subtractNode = {
                type: 'binary',
                operator: '-',
                left: { type: 'literal', value: 10 },
                right: { type: 'literal', value: 3 }
            };
            expect(evaluator.evaluate(subtractNode)).toBe(7);

            const multiplyNode = {
                type: 'binary',
                operator: '*',
                left: { type: 'literal', value: 4 },
                right: { type: 'literal', value: 3 }
            };
            expect(evaluator.evaluate(multiplyNode)).toBe(12);

            const divideNode = {
                type: 'binary',
                operator: '/',
                left: { type: 'literal', value: 10 },
                right: { type: 'literal', value: 2 }
            };
            expect(evaluator.evaluate(divideNode)).toBe(5);
        });

        test('should handle comparison operations', () => {
            const gtNode = {
                type: 'binary',
                operator: '>',
                left: { type: 'literal', value: 5 },
                right: { type: 'literal', value: 3 }
            };
            expect(evaluator.evaluate(gtNode)).toBe(true);

            const eqNode = {
                type: 'binary',
                operator: '==',
                left: { type: 'literal', value: 5 },
                right: { type: 'literal', value: 5 }
            };
            expect(evaluator.evaluate(eqNode)).toBe(true);
        });

        test('should handle logical operations', () => {
            const andNode = {
                type: 'binary',
                operator: '&&',
                left: { type: 'literal', value: true },
                right: { type: 'literal', value: false }
            };
            expect(evaluator.evaluate(andNode)).toBe(false);

            const orNode = {
                type: 'binary',
                operator: '||',
                left: { type: 'literal', value: true },
                right: { type: 'literal', value: false }
            };
            expect(evaluator.evaluate(orNode)).toBe(true);
        });

        test('should handle type conversion in arithmetic', () => {
            const stringMultiply = {
                type: 'binary',
                operator: '*',
                left: { type: 'literal', value: '5' },
                right: { type: 'literal', value: '2' }
            };
            expect(evaluator.evaluate(stringMultiply)).toBe(10);
        });

        test('should handle division by zero', () => {
            const divideByZero = {
                type: 'binary',
                operator: '/',
                left: { type: 'literal', value: 5 },
                right: { type: 'literal', value: 0 }
            };
            expect(evaluator.evaluate(divideByZero)).toBe(Infinity);
        });

        test('should throw error for unknown binary operator', () => {
            const unknownOpNode = {
                type: 'binary',
                operator: '%',
                left: { type: 'literal', value: 5 },
                right: { type: 'literal', value: 2 }
            };
            expect(() => evaluator.evaluate(unknownOpNode)).toThrow('Unknown binary operator: %');
        });
    });

    describe('Unary Operations', () => {
        let evaluator;

        beforeEach(() => {
            evaluator = new Evaluator({});
        });

        test('should handle not operator', () => {
            const notNode = {
                type: 'unary',
                operator: '!',
                operand: { type: 'literal', value: true }
            };
            expect(evaluator.evaluate(notNode)).toBe(false);

            const notWordNode = {
                type: 'unary',
                operator: 'not',
                operand: { type: 'literal', value: false }
            };
            expect(evaluator.evaluate(notWordNode)).toBe(true);
        });

        test('should throw error for unknown unary operator', () => {
            const unknownUnaryNode = {
                type: 'unary',
                operator: 'unknownOperator',
                operand: { type: 'literal', value: true }
            };
            expect(() => evaluator.evaluate(unknownUnaryNode)).toThrow('Unknown unary operator: unknownOperator');
        });
    });

    describe('Property Access', () => {
        test('should handle dot notation property access', () => {
            const evaluator = new Evaluator({
                values: (name) => ({
                    user: { name: 'Alice', age: 25 }
                })[name]
            });

            const propertyNode = {
                type: 'property',
                object: 'user',
                property: 'name',
                notation: 'dot'
            };
            expect(evaluator.evaluate(propertyNode)).toBe('Alice');
        });

        test('should handle bracket notation property access', () => {
            const evaluator = new Evaluator({
                values: (name) => ({
                    data: { 'key-with-dashes': 'value', 'key with spaces': 'another value' }
                })[name]
            });

            const bracketNode = {
                type: 'property',
                object: 'data',
                property: 'key-with-dashes',
                notation: 'bracket'
            };
            expect(evaluator.evaluate(bracketNode)).toBe('value');
        });

        test('should return null when object is null', () => {
            const evaluator = new Evaluator({
                values: (name) => (name === 'nullObject' ? null : undefined)
            });

            const propertyNode = {
                type: 'property',
                object: 'nullObject',
                property: 'someProperty',
                notation: 'dot'
            };
            expect(evaluator.evaluate(propertyNode)).toBeNull();
        });

        test('should return null when property does not exist', () => {
            const evaluator = new Evaluator({
                values: (name) => (name === 'user' ? { name: 'John' } : null)
            });

            const propertyNode = {
                type: 'property',
                object: 'user',
                property: 'age', // This property doesn't exist
                notation: 'dot'
            };
            expect(evaluator.evaluate(propertyNode)).toBeNull();
        });

        test('should return null when values function returns non-object', () => {
            const evaluator = new Evaluator({
                values: (name) => (name === 'primitive' ? 'string value' : null)
            });

            const propertyNode = {
                type: 'property',
                object: 'primitive',
                property: 'length',
                notation: 'dot'
            };
            expect(evaluator.evaluate(propertyNode)).toBeNull();
        });

        test('should return null when no values function provided', () => {
            const evaluator = new Evaluator({});

            const propertyNode = {
                type: 'property',
                object: 'anything',
                property: 'property',
                notation: 'dot'
            };
            expect(evaluator.evaluate(propertyNode)).toBeNull();
        });
    });

    describe('Custom Conditions', () => {
        test('should evaluate custom conditions', () => {
            const evaluator = new Evaluator({
                customConditions: {
                    contains: (value, expected) => String(value).includes(String(expected)),
                    between: (value, range) => {
                        const [min, max] = String(range).split(',').map(Number);
                        return Number(value) >= min && Number(value) <= max;
                    }
                }
            });

            const containsNode = {
                type: 'custom',
                name: 'contains',
                left: { type: 'literal', value: 'hello world' },
                right: { type: 'literal', value: 'world' }
            };
            expect(evaluator.evaluate(containsNode)).toBe(true);

            const betweenNode = {
                type: 'custom',
                name: 'between',
                left: { type: 'literal', value: 25 },
                right: { type: 'literal', value: '18,65' }
            };
            expect(evaluator.evaluate(betweenNode)).toBe(true);
        });

        test('should throw error for undefined custom condition', () => {
            const evaluator = new Evaluator({});

            const customNode = {
                type: 'custom',
                name: 'undefined',
                left: { type: 'literal', value: 'test' },
                right: { type: 'literal', value: 'value' }
            };
            expect(() => evaluator.evaluate(customNode)).toThrow("Custom condition 'undefined' is not defined");
        });
    });

    describe('Error Handling', () => {
        test('should throw error for unknown AST node type', () => {
            const evaluator = new Evaluator({});

            const unknownNode = {
                type: 'unknownNodeType',
                someProperty: 'value'
            };
            expect(() => evaluator.evaluate(unknownNode)).toThrow('Unknown AST node type: unknownNodeType');
        });

        test('should handle values function that throws in variable evaluation', () => {
            const evaluator = new Evaluator({
                values: () => {
                    throw new Error('Values function error');
                }
            });

            const variableNode = { type: 'variable', name: 'anything' };
            expect(evaluator.evaluate(variableNode)).toBeNull();
        });

        test('should handle values function that throws in property access', () => {
            const evaluator = new Evaluator({
                values: (name) => {
                    if (name === 'errorObject') {
                        throw new Error('Cannot access this object');
                    }
                    return { safe: 'value' };
                }
            });

            const propertyNode = {
                type: 'property',
                object: 'errorObject',
                property: 'someProperty',
                notation: 'dot'
            };
            expect(evaluator.evaluate(propertyNode)).toBeNull();
        });

        test('should handle different types of thrown errors', () => {
            const evaluator = new Evaluator({
                values: (name) => {
                    if (name === 'throwsString') throw 'String error';
                    if (name === 'throwsNumber') throw 404;
                    if (name === 'throwsObject') throw { error: 'Object error' };
                    return null;
                }
            });

            const testCases = ['throwsString', 'throwsNumber', 'throwsObject'];

            testCases.forEach(objectName => {
                const propertyNode = {
                    type: 'property',
                    object: objectName,
                    property: 'property',
                    notation: 'dot'
                };
                expect(evaluator.evaluate(propertyNode)).toBeNull();
            });
        });
    });

    describe('Integration with Parser', () => {
        test('should work with tokenizer and parser for complex expressions', () => {
            const evaluator = new Evaluator({
                values: (name) => ({
                    user: { age: 25, active: true },
                    settings: { enabled: true }
                })[name]
            });

            // Test complex arithmetic expression
            const tokenizer1 = new Tokenizer('(2 + 3) * (4 - 1)');
            const tokens1 = tokenizer1.tokenize();
            const parser1 = new Parser(tokens1);
            const ast1 = parser1.parse();
            expect(evaluator.evaluate(ast1)).toBe(15);

            // Test string arithmetic
            const tokenizer2 = new Tokenizer('"5" * "2"');
            const tokens2 = tokenizer2.tokenize();
            const parser2 = new Parser(tokens2);
            const ast2 = parser2.parse();
            expect(evaluator.evaluate(ast2)).toBe(10);
        });
    });

    describe('Edge Cases', () => {
        test('should handle NaN in calculations', () => {
            const evaluator = new Evaluator({});

            const nanNode = {
                type: 'binary',
                operator: '*',
                left: { type: 'literal', value: 'not-a-number' },
                right: { type: 'literal', value: 5 }
            };
            expect(Number.isNaN(evaluator.evaluate(nanNode))).toBe(true);
        });

        test('should handle complex nested objects', () => {
            const evaluator = new Evaluator({
                values: (name) => ({
                    user: {
                        profile: {
                            settings: { theme: 'dark' }
                        },
                        preferences: null
                    }
                })[name]
            });

            const propertyNode = {
                type: 'property',
                object: 'user',
                property: 'profile',
                notation: 'dot'
            };
            const result = evaluator.evaluate(propertyNode);
            expect(result).toEqual({ settings: { theme: 'dark' } });
        });

        test('should handle all operator variations', () => {
            const evaluator = new Evaluator({});

            const operators = [
                { op: 'is', left: 5, right: 5, expected: true },
                { op: 'is not', left: 5, right: 3, expected: true },
                { op: 'gt', left: 5, right: 3, expected: true },
                { op: 'gte', left: 5, right: 5, expected: true },
                { op: 'lt', left: 3, right: 5, expected: true },
                { op: 'lte', left: 5, right: 5, expected: true },
                { op: 'and', left: true, right: true, expected: true },
                { op: 'or', left: true, right: false, expected: true }
            ];

            operators.forEach(({ op, left, right, expected }) => {
                const node = {
                    type: 'binary',
                    operator: op,
                    left: { type: 'literal', value: left },
                    right: { type: 'literal', value: right }
                };
                expect(evaluator.evaluate(node)).toBe(expected);
            });
        });
    });
});