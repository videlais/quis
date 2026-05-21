/**
 * v2 API Test Suite
 * Tests the new evaluate(), compile(), and parse()-as-AST API introduced in v2.
 */

let quis;

beforeAll(async () => {
    quis = (await import('../../src/index.js')).default;
});

afterEach(() => {
    quis.clearCustomConditions();
});

// ─── parse() returns AST ──────────────────────────────────────────────────────

describe('parse() returns AST', () => {
    test('returns an object with a type property', () => {
        const ast = quis.parse('5 > 3');
        expect(typeof ast).toBe('object');
        expect(typeof ast.type).toBe('string');
    });

    test('returns binary node for comparison expression', () => {
        const ast = quis.parse('5 > 3');
        expect(ast.type).toBe('binary');
    });

    test('returns literal node for simple literal', () => {
        const ast = quis.parse('42');
        expect(ast.type).toBe('literal');
        expect(ast.value).toBe(42);
    });

    test('returns variable node for variable reference', () => {
        const ast = quis.parse('$age');
        expect(ast.type).toBe('variable');
        expect(ast.name).toBe('age');
    });

    test('returns binary node for boolean operators', () => {
        const ast = quis.parse('true && false');
        expect(ast.type).toBe('binary');
    });

    test('throws SyntaxError for invalid expression', () => {
        expect(() => quis.parse('5 +')).toThrow();
    });

    test('parse result can be passed to Evaluator directly', () => {
        const { Evaluator } = require('../../src/evaluator');

        const ast = quis.parse('10 * 2');
        // ast from the public parse() is compatible with internal Evaluator
        const evaluator = new Evaluator({});
        expect(evaluator.evaluate(ast)).toBe(20);
    });
});

// ─── evaluate() ──────────────────────────────────────────────────────────────

describe('evaluate()', () => {
    test('evaluates a simple boolean expression', () => {
        expect(quis.evaluate('true && false')).toBe(false);
        expect(quis.evaluate('5 > 3')).toBe(true);
    });

    test('resolves variables from context object', () => {
        expect(quis.evaluate('$age > 18', { age: 25 })).toBe(true);
        expect(quis.evaluate('$age > 18', { age: 10 })).toBe(false);
    });

    test('resolves nested properties from context object', () => {
        const context = { user: { name: 'Alice', age: 30 } };
        expect(quis.evaluate('$user.name == "Alice"', context)).toBe(true);
        expect(quis.evaluate('$user.age >= 18', context)).toBe(true);
    });

    test('returns null for missing context variables', () => {
        expect(quis.evaluate('$missing > 5')).toBe(false);
        expect(quis.evaluate('$missing')).toBe(null);
    });

    test('accepts null as explicit context', () => {
        expect(quis.evaluate('42')).toBe(42);
        expect(quis.evaluate('42', null)).toBe(42);
    });

    test('uses values escape hatch when provided', () => {
        const result = quis.evaluate('$x + $y', null, {
            values: (name) => name === 'x' ? 10 : 5
        });
        expect(result).toBe(15);
    });

    test('values escape hatch takes precedence over context', () => {
        const result = quis.evaluate('$x', { x: 99 }, {
            values: () => 42
        });
        expect(result).toBe(42);
    });

    test('applies global custom conditions', () => {
        quis.addCustomCondition('startsWith', (value, prefix) =>
            String(value).startsWith(String(prefix))
        );
        expect(quis.evaluate('$name custom:startsWith "Al"', { name: 'Alice' })).toBe(true);
    });

    test('per-call customConditions in options', () => {
        const result = quis.evaluate('$val custom:local "test"', { val: 'test value' }, {
            customConditions: {
                local: (v, e) => String(v).includes(String(e))
            }
        });
        expect(result).toBe(true);
    });

    test('per-call customConditions override global', () => {
        quis.addCustomCondition('flag', () => false);
        const result = quis.evaluate('$v custom:flag "x"', { v: 'x' }, {
            customConditions: { flag: () => true }
        });
        expect(result).toBe(true);
    });

    test('throws SyntaxError for invalid expression', () => {
        expect(() => quis.evaluate('5 +')).toThrow();
    });
});

// ─── compile() ───────────────────────────────────────────────────────────────

describe('compile()', () => {
    test('returns a function', () => {
        const predicate = quis.compile('$age >= 18');
        expect(typeof predicate).toBe('function');
    });

    test('compiled predicate evaluates against context', () => {
        const isAdult = quis.compile('$age >= 18');
        expect(isAdult({ age: 25 })).toBe(true);
        expect(isAdult({ age: 10 })).toBe(false);
    });

    test('compiled predicate is reusable with different contexts', () => {
        const isExpensive = quis.compile('$price > 100');
        const items = [
            { price: 50 },
            { price: 150 },
            { price: 200 },
            { price: 25 }
        ];
        const expensive = items.filter(item => isExpensive(item));
        expect(expensive).toHaveLength(2);
        expect(expensive[0].price).toBe(150);
    });

    test('parses expression at compile time — throws immediately for bad syntax', () => {
        expect(() => quis.compile('5 +')).toThrow();
    });

    test('evaluates correctly when called with null context', () => {
        const pred = quis.compile('42 > 10');
        expect(pred(null)).toBe(true);
        expect(pred()).toBe(true);
    });

    test('returns null for missing context variables', () => {
        const pred = quis.compile('$x > 5');
        expect(pred({})).toBe(false); // $x resolves to null, null > 5 is false
        expect(pred(null)).toBe(false);
    });

    test('accepts global custom conditions at compile time', () => {
        quis.addCustomCondition('hasTag', (value, tag) => {
            return Array.isArray(value) && value.includes(tag);
        });
        const hasPremium = quis.compile('$tags custom:hasTag "premium"');
        expect(hasPremium({ tags: ['premium', 'vip'] })).toBe(true);
        expect(hasPremium({ tags: ['free'] })).toBe(false);
    });

    test('compiled expression retains custom conditions even after they are removed globally', () => {
        quis.addCustomCondition('alwaysTrue', () => true);
        const pred = quis.compile('$v custom:alwaysTrue "x"');
        quis.removeCustomCondition('alwaysTrue');

        // pred was compiled while alwaysTrue existed — should still work
        expect(pred({ v: 'anything' })).toBe(true);
    });

    test('compile with per-compile customConditions option', () => {
        const pred = quis.compile('$n custom:isEven "x"', {
            customConditions: {
                isEven: (value) => Number(value) % 2 === 0
            }
        });
        expect(pred({ n: 4 })).toBe(true);
        expect(pred({ n: 7 })).toBe(false);
    });

    test('values escape hatch in compile options applies to every call', () => {
        let callCount = 0;
        const pred = quis.compile('$x > 5', {
            values: (name) => {
                callCount++;
                return name === 'x' ? 10 : null;
            }
        });
        expect(pred()).toBe(true);
        expect(pred({ x: 999 })).toBe(true); // values fn takes precedence over context
        expect(callCount).toBe(2);
    });

    test('can be used for array filtering', () => {
        const isActive = quis.compile('$status == "active" && $score >= 50');
        const users = [
            { status: 'active', score: 80 },
            { status: 'inactive', score: 90 },
            { status: 'active', score: 30 },
            { status: 'active', score: 60 },
        ];
        const result = users.filter(u => isActive(u));
        expect(result).toHaveLength(2);
    });
});

// ─── Named exports ────────────────────────────────────────────────────────────

describe('Named exports', () => {
    test('evaluate, compile, and parse are available as named exports', async () => {
        const { evaluate, compile, parse } = await import('../../src/index.js');
        expect(typeof evaluate).toBe('function');
        expect(typeof compile).toBe('function');
        expect(typeof parse).toBe('function');
    });

    test('named evaluate works correctly', async () => {
        const { evaluate } = await import('../../src/index.js');
        expect(evaluate('$n * 2', { n: 5 })).toBe(10);
    });

    test('named compile works correctly', async () => {
        const { compile } = await import('../../src/index.js');
        const double = compile('$n * 2');
        expect(double({ n: 7 })).toBe(14);
    });

    test('named parse returns AST', async () => {
        const { parse } = await import('../../src/index.js');
        const ast = parse('true');
        expect(ast.type).toBe('literal');
    });
});
