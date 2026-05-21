import { Token } from './ast-types.js';
/**
 * Maximum allowed input length to prevent excessively large expressions.
 */
export declare const MAX_INPUT_LENGTH = 10000;
/**
 * Tokenizer for Quis expressions
 * Converts input string into array of tokens
 */
export declare class Tokenizer {
    private input;
    private position;
    private tokens;
    constructor(input: string);
    tokenize(): Token[];
    private peek;
    private advance;
    private skipWhitespace;
    private isDigit;
    private isLetter;
    private isAlphaNumeric;
    private addToken;
    private tokenizeNumber;
    private tokenizeString;
    private tokenizeVariable;
    private tokenizeIdentifier;
    private tokenizeKeywordOrIdentifier;
    private tokenizeTwoCharOperator;
    private tokenizeSingleChar;
}
//# sourceMappingURL=tokenizer.d.ts.map