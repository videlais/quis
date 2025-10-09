/**
 * Quis DSL Parser - Web/Browser Entry Point
 *
 * Exposes the Quis parser globally for browser environments.
 * Supports both window and global contexts for maximum compatibility.
 */
import * as QuisModule from './index';
import type { Quis } from './types';
/**
 * Browser global interface extension
 */
declare global {
    interface Window {
        quis?: Quis;
    }
}
/**
 * Quis object to be exposed globally
 */
declare const quisGlobal: Quis;
export default quisGlobal;
export declare const parse: (input: string, options?: QuisModule.ParseOptions) => QuisModule.ParseResult, SyntaxError: new (message: string, expected: QuisModule.Expected[], found: string | null, location?: QuisModule.Location) => QuisModule.QuitSyntaxError;
//# sourceMappingURL=web-index.d.ts.map