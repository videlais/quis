/**
 * Integration Test Suite
 * Tests the built files to ensure they work correctly in production
 */

const fs = require('fs');
const path = require('path');

describe('Build Integration', () => {
    test('Built ES module should work correctly', async () => {
        // Skip if build doesn't exist
        const buildPath = path.join(__dirname, '../../build/quis.js');
        if (!fs.existsSync(buildPath)) {
            return;
        }
        
        const { default: quis } = await import('../../build/quis.js');
        
        expect(typeof quis.parse).toBe('function');
        const result = quis.parse('true && false');
        expect(result).toBe(false);
    });
    
    test('Built UMD bundle should exist', () => {
        const buildPath = path.join(__dirname, '../../build/quis.min.js');
        // Skip if build directory doesn't exist
        if (!fs.existsSync(path.dirname(buildPath))) {
            return;
        }
        
        expect(fs.existsSync(buildPath)).toBe(true);
    });
});