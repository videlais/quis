/**
 * Quis DSL Parser Types
 * 
 * Type definitions for the Quis domain-specific language parser.
 */

/**
 * Location information for parsing errors
 */
export interface Location {
  /** Source identifier */
  source?: string;
  /** Start position */
  start: {
    line: number;
    column: number;
    offset: number;
  };
  /** End position */
  end: {
    line: number;
    column: number;
    offset: number;
  };
}

/**
 * Expected token information for parsing errors
 */
export interface Expected {
  type: string;
  value?: string;
  description?: string;
}

/**
 * Parser syntax error with enhanced information
 */
export interface QuitSyntaxError extends Error {
  expected: Expected[];
  found: string | null;
  location?: Location;
  name: 'SyntaxError';
  format(sources?: { source: string; text: string }[]): string;
}

/**
 * Values callback function type for variable resolution
 */
export type ValuesCallback = (variableName: string) => unknown;

/**
 * Options for the parse function
 */
export interface ParseOptions {
  /** Callback function to resolve variable values */
  values?: ValuesCallback;
  /** Starting rule for parsing (defaults to "Start") */
  startRule?: string;
  /** Grammar source for better error reporting */
  grammarSource?: string;
}

/**
 * Result of parsing - can be any value depending on the expression
 */
export type ParseResult = boolean | number | string | null | undefined;

/**
 * Core parser interface
 */
export interface Parser {
  /** Available starting rules */
  StartRules: string[];
  /** Parser syntax error class */
  SyntaxError: new (
    message: string,
    expected: Expected[],
    found: string | null,
    location?: Location
  ) => QuitSyntaxError;
  /** Main parsing function */
  parse: (input: string, options?: ParseOptions) => ParseResult;
}

/**
 * Main Quis interface
 */
export interface Quis {
  /** Parse a DSL expression */
  parse: (input: string, options?: ParseOptions) => ParseResult;
  /** Syntax error class for enhanced error handling */
  SyntaxError: Parser['SyntaxError'];
}

/**
 * Global browser interface extension
 */
declare global {
  interface Window {
    quis?: Quis;
  }
  
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      quis?: Quis;
    }
  }
}

export default Quis;