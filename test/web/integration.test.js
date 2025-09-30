/**
 * Integration Tests for Web Build
 * Tests that verify the web build integrates correctly with browser APIs
 */

describe('Web Build Integration', () => {
  let originalWindow;
  
  beforeAll(() => {
    // Store original window for cleanup
    originalWindow = global.window;
  });

  afterAll(() => {
    // Restore original window
    global.window = originalWindow;
  });

  test('Should load and execute without errors in browser environment', () => {
    // This test verifies the build can be loaded without syntax errors
    expect(() => {
      const fs = require('fs');
      const webBuild = fs.readFileSync('./build/quis.min.js', 'utf-8');
      // Use eval in controlled test environment to verify syntax
      eval(webBuild);
    }).not.toThrow();
  });

  test('Should be compatible with module loading patterns', async () => {
    // Test various ways the web build might be loaded
    const fs = await import('fs');
    const webBuild = fs.readFileSync('./build/quis.min.js', 'utf-8');
    
    // Test IIFE pattern (immediate execution)
    expect(() => {
      eval(`(function() { ${webBuild} })()`);
    }).not.toThrow();
    
    // Test global assignment
    expect(() => {
      eval(webBuild);
      expect(global.quis).toBeDefined();
    }).not.toThrow();
  });

  test('Should work with common browser polyfills', () => {
    // Mock common browser APIs that might interact with Quis
    global.window = {
      ...global.window,
      document: global.document,
      localStorage: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn()
      },
      sessionStorage: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn()
      }
    };

    const fs = require('fs');
    const webBuild = fs.readFileSync('./build/quis.min.js', 'utf-8');
    
    expect(() => {
      eval(webBuild);
    }).not.toThrow();
  });

  describe('AMD/CommonJS/UMD Compatibility', () => {
    test('Should work with AMD pattern', () => {
      global.define = jest.fn();
      global.define.amd = true;
      
      const fs = require('fs');
      const webBuild = fs.readFileSync('./build/quis.min.js', 'utf-8');
      
      expect(() => {
        eval(webBuild);
      }).not.toThrow();
      
      delete global.define;
    });

    test('Should work with CommonJS pattern', () => {
      const mockModule = { exports: {} };
      global.module = mockModule;
      
      const fs = require('fs');
      const webBuild = fs.readFileSync('./build/quis.min.js', 'utf-8');
      
      expect(() => {
        eval(webBuild);
      }).not.toThrow();
      
      delete global.module;
    });
  });

  test('Should handle minification correctly', () => {
    const fs = require('fs');
    const webBuild = fs.readFileSync('./build/quis.min.js', 'utf-8');
    
    // Verify it's actually minified (should be much smaller than source)
    expect(webBuild.length).toBeLessThan(20000); // Should be under 20KB
    
    // Should not contain development artifacts
    expect(webBuild).not.toContain('console.log');
    expect(webBuild).not.toContain('debugger');
    
    // Should still contain essential functionality markers
    expect(webBuild).toContain('parse'); // Core function should exist
  });

  test('Should preserve essential API surface', () => {
    const fs = require('fs');
    const webBuild = fs.readFileSync('./build/quis.min.js', 'utf-8');
    
    // Execute the build
    eval(webBuild);
    
    // Verify essential API is preserved
    expect(global.quis).toBeDefined();
    expect(global.quis.parse).toBeDefined();
    expect(typeof global.quis.parse).toBe('function');
    
    // Test basic functionality works
    expect(global.quis.parse('true')).toBe(true);
    expect(global.quis.parse('false')).toBe(false);
    expect(global.quis.parse('1 < 2')).toBe(true);
  });
});