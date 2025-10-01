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

  test('Should expose parse function', () => {
    expect(Quis.parse).toBeDefined();
    expect(typeof Quis.parse).toBe('function');
  });

  describe('Basic Browser Functionality', () => {
    test('Should parse simple boolean expressions', () => {
      expect(Quis.parse('true')).toBe(true);
      expect(Quis.parse('false')).toBe(false);
      expect(Quis.parse('true && false')).toBe(false);
      expect(Quis.parse('true || false')).toBe(true);
    });

    test('Should handle numeric comparisons', () => {
      expect(Quis.parse('5 > 3')).toBe(true);
      expect(Quis.parse('2 < 1')).toBe(false);
      expect(Quis.parse('10 >= 10')).toBe(true);
      expect(Quis.parse('7 <= 5')).toBe(false);
    });

    test('Should handle string comparisons', () => {
      expect(Quis.parse('"hello" == "hello"')).toBe(true);
      expect(Quis.parse('"world" != "hello"')).toBe(true);
      expect(Quis.parse('"test" is "test"')).toBe(true);
    });
  });

  describe('Variable Resolution in Browser', () => {
    test('Should work with custom values function', () => {
      const values = (label) => {
        if (label === 'browserTest') return 42;
        if (label === 'user') return { name: 'WebUser', age: 30 };
        return null;
      };

      expect(Quis.parse('$browserTest > 40', { values })).toBe(true);
      expect(Quis.parse('$user.name == "WebUser"', { values })).toBe(true);
      expect(Quis.parse('$user.age >= 25', { values })).toBe(true);
    });

    test('Should handle browser-specific data structures', () => {
      const values = (label) => {
        if (label === 'window') {
          return {
            location: { href: 'https://example.com' },
            innerWidth: 1920,
            innerHeight: 1080
          };
        }
        if (label === 'document') {
          return {
            title: 'Test Page',
            readyState: 'complete'
          };
        }
        return null;
      };

      expect(Quis.parse('$window.innerWidth > 1000', { values })).toBe(true);
      expect(Quis.parse('$document.title == "Test Page"', { values })).toBe(true);
      expect(Quis.parse('$document.readyState is "complete"', { values })).toBe(true);
    });
  });

  describe('Complex Browser Scenarios', () => {
    test('Should handle user preferences and settings', () => {
      const values = (label) => {
        if (label === 'userPrefs') {
          return {
            theme: 'dark',
            notifications: true,
            'auto-save': true,
            fontSize: 16
          };
        }
        if (label === 'capabilities') {
          return {
            webgl: true,
            localStorage: true,
            geolocation: false
          };
        }
        return null;
      };

      expect(Quis.parse('$userPrefs.theme == "dark" && $userPrefs.notifications == true', { values })).toBe(true);
      expect(Quis.parse('$capabilities.webgl == true OR $capabilities.geolocation == true', { values })).toBe(true);
      expect(Quis.parse('$userPrefs["auto-save"] == true && $userPrefs.fontSize >= 14', { values })).toBe(true);
    });

    test('Should work with feature detection patterns', () => {
      const values = (label) => {
        if (label === 'features') {
          return {
            touch: 'ontouchstart' in window,
            webWorkers: typeof Worker !== 'undefined',
            canvas: !!document.createElement('canvas').getContext,
            sessionStorage: typeof sessionStorage !== 'undefined'
          };
        }
        return null;
      };

      // These tests work in JSDOM environment
      expect(Quis.parse('$features.sessionStorage == true', { values })).toBe(true);
      expect(Quis.parse('$features.webWorkers == true || $features.canvas == true', { values })).toBe(true);
    });

    test('Should handle responsive design conditions', () => {
      const values = (label) => {
        if (label === 'viewport') {
          return {
            width: 1200,
            height: 800,
            isMobile: false,
            isTablet: false,
            isDesktop: true
          };
        }
        return null;
      };

      expect(Quis.parse('$viewport.width >= 1024 && $viewport.isDesktop == true', { values })).toBe(true);
      expect(Quis.parse('$viewport.isMobile == false AND $viewport.width > 768', { values })).toBe(true);
    });
  });

  describe('Error Handling in Browser', () => {
    test('Should handle parsing errors gracefully', () => {
      expect(() => Quis.parse('invalid syntax')).toThrow();
      expect(() => Quis.parse('$undefined.property')).not.toThrow();
    });

    test('Should handle missing values function', () => {
      expect(() => Quis.parse('$variable > 5')).not.toThrow();
      expect(Quis.parse('$variable > 5')).toBe(false); // Should default to null/false
    });
  });

  describe('Browser Compatibility Features', () => {
    test('Should work with browser-style object access', () => {
      const values = (label) => {
        // Simulate browser-style nested objects
        if (label === 'navigator') {
          return {
            userAgent: 'Mozilla/5.0...',
            language: 'en-US',
            platform: 'Win32',
            cookieEnabled: true
          };
        }
        return null;
      };

      expect(Quis.parse('$navigator.cookieEnabled == true', { values })).toBe(true);
      expect(Quis.parse('$navigator.language == "en-US"', { values })).toBe(true);
    });

    test('Should handle DOM-style data attributes', () => {
      const values = (label) => {
        if (label === 'element') {
          return {
            'data-theme': 'dark',
            'data-user-id': '12345',
            'data-active': 'true',
            'data-count': '42'
          };
        }
        return null;
      };

      expect(Quis.parse('$element["data-theme"] == "dark"', { values })).toBe(true);
      expect(Quis.parse('$element["data-user-id"] == "12345"', { values })).toBe(true);
      expect(Quis.parse('$element["data-active"] == "true" && $element["data-count"] == "42"', { values })).toBe(true);
    });
  });
});