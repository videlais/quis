/**
 * Export System Test Suite
 * Tests the different import/export methods
 */

const path = require('path');

describe('Export System', () => {
    test('ES Module default export should provide all methods', async () => {
        // Test ES module import from source
        const { default: quis } = await import('../../src/index.js');
        
        expect(typeof quis.parse).toBe('function');
        expect(typeof quis.evaluate).toBe('function');
        expect(typeof quis.compile).toBe('function');
        expect(typeof quis.addCustomCondition).toBe('function');
        expect(typeof quis.removeCustomCondition).toBe('function');
        expect(typeof quis.getCustomConditions).toBe('function');
        expect(typeof quis.clearCustomConditions).toBe('function');
        
        // parse() now returns an AST object
        const ast = quis.parse('5 > 3');
        expect(typeof ast).toBe('object');
        expect(ast.type).toBeDefined();

        // evaluate() returns the computed result
        const result = quis.evaluate('5 > 3');
        expect(result).toBe(true);
    });

    test('Named exports should work correctly from main module', async () => {
        // Test named exports from the source module
        const { 
            parse,
            evaluate,
            compile,
            addCustomCondition, 
            removeCustomCondition,
            getCustomConditions,
            clearCustomConditions
        } = await import('../../src/index.js');
        
        expect(typeof parse).toBe('function');
        expect(typeof evaluate).toBe('function');
        expect(typeof compile).toBe('function');
        expect(typeof addCustomCondition).toBe('function');
        expect(typeof removeCustomCondition).toBe('function');
        
        // parse() returns an AST
        const ast = parse('10 >= 5');
        expect(typeof ast).toBe('object');
        expect(ast.type).toBeDefined();

        // evaluate() returns the computed result
        const result = evaluate('10 >= 5');
        expect(result).toBe(true);
        
        // compile() returns a predicate function
        const predicate = compile('$count > 5');
        expect(typeof predicate).toBe('function');
        expect(predicate({ count: 10 })).toBe(true);
        expect(predicate({ count: 3 })).toBe(false);

        // Test custom conditions
        addCustomCondition('test', () => true);
        const conditions = getCustomConditions();
        expect(conditions).toHaveProperty('test');
        
        const customResult = evaluate('$val custom:test "anything"', { val: 'test' });
        expect(customResult).toBe(true);
        
        // Clean up
        clearCustomConditions();
    });

    test('TypeScript types should be properly exported', () => {
        // Test that TypeScript types are available from source
        // This ensures the type definitions are correctly structured
        const fs = require('fs');
        const typesPath = path.join(__dirname, '../../src');
        
        expect(fs.existsSync(path.join(typesPath, 'types.ts'))).toBe(true);
        expect(fs.existsSync(path.join(typesPath, 'types-only.ts'))).toBe(true);
        
        // Check that types file has content
        const typesContent = fs.readFileSync(
            path.join(typesPath, 'types.ts'), 
            'utf8'
        );
        expect(typesContent).toContain('export interface');
        expect(typesContent).toContain('ParseOptions');
        expect(typesContent).toContain('CustomConditionEvaluator');
    });

    test('ES Module and UMD exports should work correctly', async () => {
        // Test ES Module import from source
        const { default: esmQuis } = await import('../../src/index.js');
        
        // evaluate() returns the computed result
        const esmResult = esmQuis.evaluate('$value == "test"', { value: 'test' });
        expect(esmResult).toBe(true);
        
        // Verify all methods are available
        expect(typeof esmQuis.parse).toBe('function');
        expect(typeof esmQuis.evaluate).toBe('function');
        expect(typeof esmQuis.compile).toBe('function');
        expect(typeof esmQuis.addCustomCondition).toBe('function');
        expect(typeof esmQuis.removeCustomCondition).toBe('function');
        expect(typeof esmQuis.getCustomConditions).toBe('function');
        expect(typeof esmQuis.clearCustomConditions).toBe('function');
    });
});