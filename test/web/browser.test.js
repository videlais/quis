/**
 * Web Browser Tests for Quis
 * Tests the minified web build (quis.min.js) in a JSDOM environment
 * to verify it works correctly in a browser context
 */

describe('Quis Web Build', () => {
  let Quis;

  beforeAll(async () => {
    // Simulate loading the script in a browser environment
    const fs = await import('fs');
    const path = await import('path');
    
    // Read the minified web build
    const webBuildPath = path.resolve('./build/quis.min.js');
    const webBuildContent = fs.readFileSync(webBuildPath, 'utf-8');
    
    // Create a script element and execute it in the global context
    const script = document.createElement('script');
    script.textContent = webBuildContent;
    document.head.appendChild(script);
    
    // The web build should expose quis globally on window
    Quis = window.quis || global.quis;
  });

  test('Should load quis globally in browser environment', () => {
    expect(Quis).toBeDefined();
    expect(typeof Quis).toBe('object');
  });

  test('Should expose evaluate and compile functions', () => {
    expect(Quis.evaluate).toBeDefined();
    expect(typeof Quis.evaluate).toBe('function');
    expect(Quis.compile).toBeDefined();
    expect(typeof Quis.compile).toBe('function');
    expect(Quis.parse).toBeDefined();
    expect(typeof Quis.parse).toBe('function');
  });

  describe('Basic Browser Functionality', () => {
    test('Should evaluate simple boolean expressions', () => {
      expect(Quis.evaluate('true')).toBe(true);
      expect(Quis.evaluate('false')).toBe(false);
      expect(Quis.evaluate('true && false')).toBe(false);
      expect(Quis.evaluate('true || false')).toBe(true);
    });

    test('Should handle numeric comparisons', () => {
      expect(Quis.evaluate('5 > 3')).toBe(true);
      expect(Quis.evaluate('2 < 1')).toBe(false);
      expect(Quis.evaluate('10 >= 10')).toBe(true);
      expect(Quis.evaluate('7 <= 5')).toBe(false);
    });

    test('Should handle string comparisons', () => {
      expect(Quis.evaluate('"hello" == "hello"')).toBe(true);
      expect(Quis.evaluate('"world" != "hello"')).toBe(true);
      expect(Quis.evaluate('"test" is "test"')).toBe(true);
    });
  });

  describe('Variable Resolution in Browser', () => {
    test('Should work with context object', () => {
      const context = {
        browserTest: 42,
        user: { name: 'WebUser', age: 30 }
      };

      expect(Quis.evaluate('$browserTest > 40', context)).toBe(true);
      expect(Quis.evaluate('$user.name == "WebUser"', context)).toBe(true);
      expect(Quis.evaluate('$user.age >= 25', context)).toBe(true);
    });

    test('Should handle browser-specific data structures', () => {
      const context = {
        window: {
          location: { href: 'https://example.com' },
          innerWidth: 1920,
          innerHeight: 1080
        },
        document: {
          title: 'Test Page',
          readyState: 'complete'
        }
      };

      expect(Quis.evaluate('$window.innerWidth > 1000', context)).toBe(true);
      expect(Quis.evaluate('$document.title == "Test Page"', context)).toBe(true);
      expect(Quis.evaluate('$document.readyState is "complete"', context)).toBe(true);
    });
  });

  describe('Complex Browser Scenarios', () => {
    test('Should handle user preferences and settings', () => {
      const context = {
        userPrefs: {
          theme: 'dark',
          notifications: true,
          'auto-save': true,
          fontSize: 16
        },
        capabilities: {
          webgl: true,
          localStorage: true,
          geolocation: false
        }
      };

      expect(Quis.evaluate('$userPrefs.theme == "dark" && $userPrefs.notifications == true', context)).toBe(true);
      expect(Quis.evaluate('$capabilities.webgl == true OR $capabilities.geolocation == true', context)).toBe(true);
      expect(Quis.evaluate('$userPrefs["auto-save"] == true && $userPrefs.fontSize >= 14', context)).toBe(true);
    });

    test('Should work with feature detection patterns', () => {
      const context = {
        features: {
          touch: 'ontouchstart' in window,
          webWorkers: typeof Worker !== 'undefined',
          canvas: !!document.createElement('canvas').getContext,
          sessionStorage: typeof sessionStorage !== 'undefined'
        }
      };

      // These tests work in JSDOM environment
      expect(Quis.evaluate('$features.sessionStorage == true', context)).toBe(true);
      expect(Quis.evaluate('$features.webWorkers == true || $features.canvas == true', context)).toBe(true);
    });

    test('Should handle responsive design conditions', () => {
      const context = {
        viewport: {
          width: 1200,
          height: 800,
          isMobile: false,
          isTablet: false,
          isDesktop: true
        }
      };

      expect(Quis.evaluate('$viewport.width >= 1024 && $viewport.isDesktop == true', context)).toBe(true);
      expect(Quis.evaluate('$viewport.isMobile == false AND $viewport.width > 768', context)).toBe(true);
    });
  });

  describe('Error Handling in Browser', () => {
    test('Should handle evaluation errors gracefully', () => {
      expect(() => Quis.evaluate('invalid syntax')).toThrow();
      expect(() => Quis.evaluate('$undefined.property')).not.toThrow();
    });

    test('Should handle missing context', () => {
      expect(() => Quis.evaluate('$variable > 5')).not.toThrow();
      expect(Quis.evaluate('$variable > 5')).toBe(false); // Should default to null/false
    });
  });

  describe('Browser Compatibility Features', () => {
    test('Should work with browser-style object access', () => {
      const context = {
        navigator: {
          userAgent: 'Mozilla/5.0...',
          language: 'en-US',
          platform: 'Win32',
          cookieEnabled: true
        }
      };

      expect(Quis.evaluate('$navigator.cookieEnabled == true', context)).toBe(true);
      expect(Quis.evaluate('$navigator.language == "en-US"', context)).toBe(true);
    });

    test('Should handle DOM-style data attributes', () => {
      const context = {
        element: {
          'data-theme': 'dark',
          'data-user-id': '12345',
          'data-active': 'true',
          'data-count': '42'
        }
      };

      expect(Quis.evaluate('$element["data-theme"] == "dark"', context)).toBe(true);
      expect(Quis.evaluate('$element["data-user-id"] == "12345"', context)).toBe(true);
      expect(Quis.evaluate('$element["data-active"] == "true" && $element["data-count"] == "42"', context)).toBe(true);
    });
  });
});