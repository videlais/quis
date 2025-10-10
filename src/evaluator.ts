import { 
    ASTNode, 
    LiteralNode, 
    VariableNode, 
    PropertyAccessNode, 
    BinaryOpNode, 
    UnaryOpNode, 
    CustomConditionNode 
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    evaluate(node: ASTNode): any {
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
            
            default:
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                throw new Error(`Unknown AST node type: ${(node as any).type}`);
        }
    }

    private evaluateLiteral(node: LiteralNode): string | number | boolean | null {
        return node.value;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private evaluateVariable(node: VariableNode): any {
        if (this.options.values && typeof this.options.values === 'function') {
            try {
                return this.options.values(node.name);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
                // If values function throws, treat as undefined variable
                return null;
            }
        }
        return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private evaluatePropertyAccess(node: PropertyAccessNode): any {
        if (this.options.values && typeof this.options.values === 'function') {
            try {
                const obj = this.options.values(node.object);
                if (obj && typeof obj === 'object' && node.property in obj) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    return (obj as Record<string, any>)[node.property];
                }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
                // If values function throws, treat as null
                return null;
            }
        }
        return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private evaluateBinaryOperation(node: BinaryOpNode): any {
        const left = this.evaluate(node.left);
        const right = this.evaluate(node.right);
        const operator = node.operator.toLowerCase();

        switch (operator) {
            // Logical operators
            case '&&':
            case 'and':
                return !!left && !!right;
            
            case '||':
            case 'or':
                return left || right;

            // Comparison operators
            case '==':
            case 'is':
                return left == right;
            
            case '!=':
            case 'is not':
                return left != right;
            
            case '>':
            case 'gt':
                return left > right;
            
            case '>=':
            case 'gte':
                return left >= right;
            
            case '<':
            case 'lt':
                return left < right;
            
            case '<=':
            case 'lte':
                return left <= right;

            // Arithmetic operators
            case '+':
                // Handle both numeric addition and string concatenation
                return left + right;
            
            case '-':
                // Convert to numbers for arithmetic
                return Number(left) - Number(right);
            
            case '*':
                // Convert to numbers for arithmetic
                return Number(left) * Number(right);
            
            case '/':
                // Convert to numbers for arithmetic
                return Number(left) / Number(right);

            default:
                throw new Error(`Unknown binary operator: ${node.operator}`);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private evaluateUnaryOperation(node: UnaryOpNode): any {
        const operand = this.evaluate(node.operand);

        switch (node.operator) {
            case '!':
            case 'not':
                return !operand;
            
            default:
                throw new Error(`Unknown unary operator: ${node.operator}`);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private evaluateCustomCondition(node: CustomConditionNode): any {
        const left = this.evaluate(node.left);
        const right = this.evaluate(node.right);

        // Check if custom conditions are available in options
        if (this.options.customConditions && typeof this.options.customConditions[node.name] === 'function') {
            return this.options.customConditions[node.name](left, right);
        }

        // Throw error if custom condition is not defined
        throw new Error(`Custom condition '${node.name}' is not defined`);
    }
}