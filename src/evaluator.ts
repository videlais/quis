import {
    ASTNode,
    LiteralNode,
    VariableNode,
    PropertyAccessNode,
    BinaryOpNode,
    UnaryOpNode,
    CustomConditionNode,
    ArrayLiteralNode,
    BetweenNode,
    TernaryNode
} from './ast-types.js';
import { ParseOptions } from './types.js';

/**
 * Evaluates an Abstract Syntax Tree to produce the final result
 * Handles all node types and operations defined in the Quis DSL
 */
export class Evaluator {
    private options: ParseOptions;

    constructor(options: ParseOptions = {}) {
        this.options = options;
    }

    evaluate(node: ASTNode): unknown {
        switch (node.type) {
            case 'literal':
                return this.evaluateLiteral(node as LiteralNode);

            case 'variable':
                return this.evaluateVariable(node as VariableNode);

            case 'property':
                return this.evaluatePropertyAccess(node as PropertyAccessNode);

            case 'binary':
                return this.evaluateBinaryOperation(node as BinaryOpNode);

            case 'unary':
                return this.evaluateUnaryOperation(node as UnaryOpNode);

            case 'custom':
                return this.evaluateCustomCondition(node as CustomConditionNode);

            case 'array':
                return this.evaluateArrayLiteral(node as ArrayLiteralNode);

            case 'between':
                return this.evaluateBetween(node as BetweenNode);

            case 'ternary':
                return this.evaluateTernary(node as TernaryNode);

            default:
                throw new Error(`Unknown AST node type: ${(node as { type: string }).type}`);
        }
    }

    private evaluateLiteral(node: LiteralNode): string | number | boolean | null {
        return node.value;
    }

    private evaluateVariable(node: VariableNode): unknown {
        if (this.options.values && typeof this.options.values === 'function') {
            try {
                return this.options.values(node.name);
            } catch {
                // If values function throws, treat as undefined variable
                return null;
            }
        }
        return null;
    }

    private evaluatePropertyAccess(node: PropertyAccessNode): unknown {
        try {
            const obj = this.evaluate(node.object);
            if (obj !== null && obj !== undefined && typeof obj === 'object'
                && !this.isDangerousProperty(node.property)
                && Object.prototype.hasOwnProperty.call(obj, node.property)) {
                return (obj as Record<string, unknown>)[node.property];
            }
        } catch {
            // If evaluation throws, treat as null
            return null;
        }
        return null;
    }

    private isDangerousProperty(property: string): boolean {
        return property === '__proto__'
            || property === 'constructor'
            || property === 'prototype';
    }

    private evaluateBinaryOperation(node: BinaryOpNode): unknown {
        const operator = node.operator.toLowerCase();

        // Short-circuit logical operators (lazy evaluation)
        switch (operator) {
            case '&&':
            case 'and': {
                const l = this.evaluate(node.left);
                if (!l) return false;
                return !!this.evaluate(node.right);
            }
            case '||':
            case 'or': {
                const l = this.evaluate(node.left);
                if (l) return true;
                return !!this.evaluate(node.right);
            }
            case '??': {
                const l = this.evaluate(node.left);
                return (l !== null && l !== undefined) ? l : this.evaluate(node.right);
            }
        }

        // Eager evaluation for all other operators
        const left = this.evaluate(node.left);
        const right = this.evaluate(node.right);

        switch (operator) {
            // Comparison operators
            case '==':
            case 'is':
                return left === right;

            case '!=':
            case 'is not':
                return left !== right;

            case '>':
            case 'gt':
                return (left as number) > (right as number);

            case '>=':
            case 'gte':
                return (left as number) >= (right as number);

            case '<':
            case 'lt':
                return (left as number) < (right as number);

            case '<=':
            case 'lte':
                return (left as number) <= (right as number);

            // Arithmetic operators
            case '+':
                if (typeof left === 'string' || typeof right === 'string') {
                    return String(left) + String(right);
                }
                return Number(left) + Number(right);

            case '-':
                return Number(left) - Number(right);

            case '*':
                return Number(left) * Number(right);

            case '/': {
                const divisor = Number(right);
                if (divisor === 0) throw new Error('Division by zero');
                return Number(left) / divisor;
            }

            case '%': {
                const modulus = Number(right);
                if (modulus === 0) throw new Error('Division by zero');
                return Number(left) % modulus;
            }

            case '**':
                return Math.pow(Number(left), Number(right));

            // Collection operators
            case 'in':
                return Array.isArray(right) && (right as unknown[]).includes(left);

            case 'not in':
                return !(Array.isArray(right) && (right as unknown[]).includes(left));

            case 'like': {
                const pattern = String(right);
                const regexStr = pattern
                    .replace(/[.+^${}()|[\]\\-]/g, '\\$&')   // escape regex special chars (not * or ?)
                    .replace(/\*/g, '.*')                      // glob * → .*
                    .replace(/\?/g, '.');                      // glob ? → .
                return new RegExp(`^${regexStr}$`, 'i').test(String(left));
            }

            default:
                throw new Error(`Unknown binary operator: ${node.operator}`);
        }
    }

    private evaluateUnaryOperation(node: UnaryOpNode): unknown {
        const operand = this.evaluate(node.operand);

        switch (node.operator) {
            case '!':
            case 'not':
                return !operand;

            case '-':
                return -Number(operand);

            default:
                throw new Error(`Unknown unary operator: ${node.operator}`);
        }
    }

    private evaluateCustomCondition(node: CustomConditionNode): unknown {
        const left = this.evaluate(node.left);
        const right = this.evaluate(node.right);

        if (this.options.customConditions && typeof this.options.customConditions[node.name] === 'function') {
            return this.options.customConditions[node.name](left, right);
        }

        throw new Error(`Custom condition '${node.name}' is not defined`);
    }

    private evaluateArrayLiteral(node: ArrayLiteralNode): unknown[] {
        return node.elements.map(el => this.evaluate(el));
    }

    private evaluateBetween(node: BetweenNode): boolean {
        const value = Number(this.evaluate(node.value));
        const low = Number(this.evaluate(node.low));
        const high = Number(this.evaluate(node.high));
        return value >= low && value <= high;
    }

    private evaluateTernary(node: TernaryNode): unknown {
        const condition = this.evaluate(node.condition);
        return condition ? this.evaluate(node.consequent) : this.evaluate(node.alternate);
    }
}
