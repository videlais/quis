import { Token } from './ast-types.js';
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
    private peekNext;
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