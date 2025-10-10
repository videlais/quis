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
        expect(typeof quis.addCustomCondition).toBe('function');
        expect(typeof quis.removeCustomCondition).toBe('function');
        expect(typeof quis.getCustomConditions).toBe('function');
        expect(typeof quis.clearCustomConditions).toBe('function');
        
        const result = quis.parse('5 > 3');
        expect(result).toBe(true);
    });

    test('Named exports should work correctly from main module', async () => {
        // Test named exports from the source module
        const { 
            parse, 
            addCustomCondition, 
            removeCustomCondition,
            getCustomConditions,
            clearCustomConditions
        } = await import('../../src/index.js');
        
        expect(typeof parse).toBe('function');
        expect(typeof addCustomCondition).toBe('function');
        expect(typeof removeCustomCondition).toBe('function');
        
        // Test parse function
        const result = parse('10 >= 5');
        expect(result).toBe(true);
        
        // Test custom conditions
        addCustomCondition('test', () => true);
        const conditions = getCustomConditions();
        expect(conditions).toHaveProperty('test');
        
        const customResult = parse('$val custom:test "anything"', {
            values: () => 'test'
        });
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
        
        const testExpression = '$value == "test"';
        const testOptions = {
            values: (name) => name === 'value' ? 'test' : null
        };
        
        const esmResult = esmQuis.parse(testExpression, testOptions);
        expect(esmResult).toBe(true);
        
        // Verify all methods are available
        expect(typeof esmQuis.parse).toBe('function');
        expect(typeof esmQuis.addCustomCondition).toBe('function');
        expect(typeof esmQuis.removeCustomCondition).toBe('function');
        expect(typeof esmQuis.getCustomConditions).toBe('function');
        expect(typeof esmQuis.clearCustomConditions).toBe('function');
    });
});