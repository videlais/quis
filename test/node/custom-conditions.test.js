/**
 * Custom Conditions Test Suite
 * Tests the new custom condition functionality
 */

let quis;

beforeAll(async () => {
    quis = (await import('../../src/index.js')).default;
});

describe('Custom Conditions', () => {
    beforeEach(() => {
        // Clear all custom conditions before each test
        quis.clearCustomConditions();
    });

    afterEach(() => {
        // Clean up after each test
        quis.clearCustomConditions();
    });

    describe('addCustomCondition', () => {
        test('should add a custom condition', () => {
            quis.addCustomCondition('contains', (value, expected) => {
                return String(value).includes(String(expected));
            });

            const conditions = quis.getCustomConditions();
            expect(conditions).toHaveProperty('contains');
            expect(typeof conditions.contains).toBe('function');
        });

        test('should work with string contains condition', () => {
            quis.addCustomCondition('contains', (value, expected) => {
                return String(value).includes(String(expected));
            });

            const result = quis.parse('$text custom:contains "hello"', {
                values: (name) => name === 'text' ? 'hello world' : null
            });

            expect(result).toBe(true);
        });

        test('should work with false case', () => {
            quis.addCustomCondition('contains', (value, expected) => {
                return String(value).includes(String(expected));
            });

            const result = quis.parse('$text custom:contains "goodbye"', {
                values: (name) => name === 'text' ? 'hello world' : null
            });

            expect(result).toBe(false);
        });

        test('should work with numeric range condition', () => {
            quis.addCustomCondition('between', (value, range) => {
                const num = Number(value);
                const [min, max] = String(range).split('-').map(Number);
                return num >= min && num <= max;
            });

            const result = quis.parse('$age custom:between "18-65"', {
                values: (name) => name === 'age' ? 25 : null
            });

            expect(result).toBe(true);
        });

        test('should work in complex expressions', () => {
            quis.addCustomCondition('contains', (value, expected) => {
                return String(value).includes(String(expected));
            });

            quis.addCustomCondition('between', (value, range) => {
                const num = Number(value);
                const [min, max] = String(range).split('-').map(Number);
                return num >= min && num <= max;
            });

            const result = quis.parse(
                '($name custom:contains "John" && $age custom:between "20-30") || $admin == true',
                {
                    values: (name) => {
                        if (name === 'name') return 'John Doe';
                        if (name === 'age') return 25;
                        if (name === 'admin') return false;
                        return null;
                    }
                }
            );

            expect(result).toBe(true);
        });

        test('should allow overriding existing conditions', () => {
            quis.addCustomCondition('test', () => true);
            quis.addCustomCondition('test', () => false);

            const result = quis.parse('$value custom:test "anything"', {
                values: () => 'test'
            });

            expect(result).toBe(false);
        });
    });

    describe('removeCustomCondition', () => {
        test('should remove an existing condition', () => {
            quis.addCustomCondition('test', () => true);
            const removed = quis.removeCustomCondition('test');

            expect(removed).toBe(true);
            
            const conditions = quis.getCustomConditions();
            expect(conditions).not.toHaveProperty('test');
        });

        test('should return false for non-existent condition', () => {
            const removed = quis.removeCustomCondition('nonexistent');
            expect(removed).toBe(false);
        });

        test('should throw error when using removed condition', () => {
            quis.addCustomCondition('test', () => true);
            quis.removeCustomCondition('test');

            expect(() => {
                quis.parse('$value custom:test "anything"', {
                    values: () => 'test'
                });
            }).toThrow("Custom condition 'test' is not defined");
        });
    });

    describe('getCustomConditions', () => {
        test('should return empty object when no conditions', () => {
            const conditions = quis.getCustomConditions();
            expect(conditions).toEqual({});
        });

        test('should return all registered conditions', () => {
            quis.addCustomCondition('contains', () => true);
            quis.addCustomCondition('between', () => false);

            const conditions = quis.getCustomConditions();
            expect(Object.keys(conditions)).toEqual(['contains', 'between']);
        });

        test('should return a copy, not the original registry', () => {
            quis.addCustomCondition('test', () => true);
            
            const conditions = quis.getCustomConditions();
            conditions.newCondition = () => false;

            const conditions2 = quis.getCustomConditions();
            expect(conditions2).not.toHaveProperty('newCondition');
        });
    });

    describe('clearCustomConditions', () => {
        test('should remove all conditions', () => {
            quis.addCustomCondition('test1', () => true);
            quis.addCustomCondition('test2', () => false);

            quis.clearCustomConditions();

            const conditions = quis.getCustomConditions();
            expect(conditions).toEqual({});
        });
    });

    describe('error handling', () => {
        test('should throw error for undefined custom condition', () => {
            expect(() => {
                quis.parse('$value custom:undefined "test"', {
                    values: () => 'value'
                });
            }).toThrow("Custom condition 'undefined' is not defined");
        });

        test('should work with options-level custom conditions', () => {
            const result = quis.parse('$value custom:local "test"', {
                values: () => 'test value',
                customConditions: {
                    local: (value, expected) => String(value).includes(String(expected))
                }
            });

            expect(result).toBe(true);
        });

        test('should merge global and local custom conditions', () => {
            quis.addCustomCondition('global', () => true);

            const result = quis.parse('$a custom:global "x" && $b custom:local "value"', {
                values: (name) => name === 'a' ? 'test' : 'test value',
                customConditions: {
                    local: (value, expected) => String(value).includes(String(expected))
                }
            });

            expect(result).toBe(true);
        });

        test('should prioritize local conditions over global ones', () => {
            quis.addCustomCondition('test', () => false);

            const result = quis.parse('$value custom:test "anything"', {
                values: () => 'test',
                customConditions: {
                    test: () => true
                }
            });

            expect(result).toBe(true);
        });
    });
});