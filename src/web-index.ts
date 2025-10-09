/**
 * Quis DSL Parser - Web/Browser Entry Point
 * 
 * Exposes the Quis parser globally for browser environments.
 * Supports both window and global contexts for maximum compatibility.
 */

import QuisModule from './index';
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
const quisGlobal: Quis = {
    parse: QuisModule.parse,
    SyntaxError: QuisModule.SyntaxError,
    addCustomCondition: QuisModule.addCustomCondition,
    removeCustomCondition: QuisModule.removeCustomCondition,
    getCustomConditions: QuisModule.getCustomConditions,
    clearCustomConditions: QuisModule.clearCustomConditions
};

/**
 * Expose Quis globally for browser usage
 * Supports both window (browser) and global (Node.js/worker) contexts
 */
if (typeof window !== 'undefined') {
    // Browser environment
    window.quis = quisGlobal;
} else if (typeof global !== 'undefined') {
    // Node.js or web worker environment
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).quis = quisGlobal;
}

// Also export as ES module for modern bundlers
export default quisGlobal;
export const { 
    parse, 
    SyntaxError, 
    addCustomCondition, 
    removeCustomCondition, 
    getCustomConditions, 
    clearCustomConditions 
} = quisGlobal;