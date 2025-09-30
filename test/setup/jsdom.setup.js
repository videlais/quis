// Setup for JSDOM environment tests
const { TextEncoder, TextDecoder } = require('util');

// Polyfill for TextEncoder/TextDecoder in JSDOM
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock console methods for cleaner test output if needed
global.console = {
  ...console,
  // Uncomment to suppress console output during tests
  // log: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};