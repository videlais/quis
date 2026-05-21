# Quis

[![npm version](https://badge.fury.io/js/quis.svg)](https://badge.fury.io/js/quis)
[![Node.js CI](https://github.com/videlais/quis/actions/workflows/node.js.yml/badge.svg)](https://github.com/videlais/quis/actions/workflows/node.js.yml)
[![Coverage Status](https://img.shields.io/badge/coverage-97%25-brightgreen.svg)](https://github.com/videlais/quis)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Bundle Size](https://img.shields.io/badge/bundle%20size-12.7KB-brightgreen.svg)](https://github.com/videlais/quis)

Based on the Latin word *quis*, this project, like its origin, implies a question of existing complex data. Quis provides a lightweight domain specific language (DSL) for performing comparisons on values within a collection using a custom AST (Abstract Syntax Tree) parser built from scratch for optimal performance and minimal bundle size.

## Comparisons

- `==` / `is` Equality.
- `!=` / `is not` Inequality.
- `>` / `gt` Greater than.
- `<` / `lt` Less than.
- `<=` / `lte` Less than or equal.
- `>=` / `gte` Greater than or equal.
- `in` Membership — value exists in an array (`$role in ["admin", "user"]`).
- `not in` Non-membership — value does not exist in an array (`$role not in ["banned"]`).
- `between` Range check — value is between two bounds, inclusive (`$age between 18 65`).
- `like` Glob pattern match — supports `*` (any characters) and `?` (single character), case-insensitive (`$name like "J*"`).

## Arithmetic Operators

- `+` Addition (also string concatenation when either operand is a string).
- `-` Subtraction (or unary negation: `-$value`).
- `*` Multiplication.
- `/` Division (throws on divide-by-zero).
- `%` Modulo (throws on divide-by-zero).
- `**` Exponentiation, right-associative (`2 ** 3 ** 2` → `512`).

## Boolean Operators

- `&&` / `and` Boolean AND (short-circuits on false left side).
- `||` / `or` Boolean OR (short-circuits on true left side).
- `!` / `not` Boolean NOT (negation).
- `??` Null coalescing — returns left side unless it is `null` or `undefined`, then returns right side (lazy evaluation).
- `? :` Ternary — `condition ? valueIfTrue : valueIfFalse`.

## Array Literals

Array values can be written inline using square-bracket syntax:

```js
'$role in ["admin", "moderator", "editor"]'
'$score not in [0, -1]'
```

Arrays can contain any mix of numbers, strings, booleans, and `null`.

## Ternary Expressions

Ternary expressions follow the familiar `condition ? valueIfTrue : valueIfFalse` form and are right-associative:

```js
'$score >= 90 ? "A" : "B"'
'$active ? $score * 2 : 0'
```

## Null Coalescing

The `??` operator returns the left operand when it is not `null` or `undefined`, otherwise it returns the right operand. The right side is only evaluated if needed:

```js
'$nickname ?? $username'       // use nickname if set, otherwise username
'$score ?? 0 > 50'             // ($score ?? 0) > 50
```

## Complex Expressions

Quis supports complex boolean expressions with proper operator precedence:

- `$user.health > 50 && $user.level >= 5` - AND has higher precedence
- `$user.magic < 10 || $user.strength > 80` - OR has lower precedence  
- `($user.health > 30 && $user.magic > 10) || $inventory.potion == true` - Parentheses for grouping
- `$age between 18 65 && $role in ["user", "admin"]` - Range and membership checks
- `$score ** 2 % 100` - Exponentiation and modulo
- `$label like "item_*"` - Glob pattern matching

## Core API

### `evaluate(input, context?, options?)`

Parse and evaluate an expression in one step. Variables prefixed with `$` in the expression are resolved by looking up top-level keys of the `context` object.

```javascript
import quis from 'quis';

// Simple expression (no variables)
quis.evaluate('5 > 3');                          // true

// Variables resolved from a plain context object
quis.evaluate('$age >= 18', { age: 25 });        // true
quis.evaluate('$user.name == "Alice"', {
    user: { name: 'Alice', age: 30 }
});                                              // true

// Null is returned for variables that are not in the context
quis.evaluate('$missing > 5');                   // false

// Optional: values escape hatch for computed/dynamic lookups
quis.evaluate('$x + $y', null, {
    values: (name) => name === 'x' ? 10 : 5
});                                              // 15
```

### `compile(input, options?)`

Parse the expression once and return a reusable predicate function. Use this when the same expression is applied to many items (e.g. filtering an array).

```javascript
import quis from 'quis';

// Compile once
const isAdult = quis.compile('$age >= 18');

// Call many times with different contexts
isAdult({ age: 25 });   // true
isAdult({ age: 10 });   // false

// Ideal for array filtering
const users = [
    { name: 'Alice', age: 30, status: 'active' },
    { name: 'Bob',   age: 16, status: 'active' },
    { name: 'Carol', age: 22, status: 'inactive' },
];

const isActiveAdult = quis.compile('$age >= 18 && $status == "active"');
const activeAdults = users.filter(u => isActiveAdult(u));
// [{ name: 'Alice', age: 30, status: 'active' }]
```

Custom conditions available globally at the time `compile()` is called are captured by the compiled predicate — they continue to work even if the conditions are later removed.

### `parse(input)`

Parse an expression and return its raw Abstract Syntax Tree (AST) without evaluating it. Useful for static analysis, tooling, and debugging.

```javascript
import quis from 'quis';

const ast = quis.parse('$age > 18');
// {
//   type: 'binary',
//   operator: '>',
//   left:  { type: 'variable', name: 'age' },
//   right: { type: 'literal', value: 18 }
// }
```

### Custom Conditions

Register named condition functions that can be used in expressions with `namespace:name` syntax.

```javascript
quis.addCustomCondition('contains', (value, expected) =>
    String(value).includes(String(expected))
);

quis.evaluate('$text custom:contains "hello"', { text: 'hello world' }); // true

quis.removeCustomCondition('contains');
quis.clearCustomConditions();
quis.getCustomConditions(); // returns a copy of the current registry

// Per-call custom conditions (override or supplement global ones)
quis.evaluate('$n custom:isEven "x"', { n: 4 }, {
    customConditions: {
        isEven: (value) => Number(value) % 2 === 0
    }
});
```

## AST Parser Architecture

Quis uses a custom-built AST (Abstract Syntax Tree) parser designed for optimal performance and minimal bundle size. The parsing process consists of three distinct phases:

### 1. Tokenization

The **Tokenizer** breaks down the input expression string into a sequence of tokens (numbers, strings, variables, operators, keywords, etc.). Each token includes its type, value, and position for precise error reporting.

### 2. Parsing

The **Parser** processes the token sequence and builds an Abstract Syntax Tree that respects operator precedence and handles complex nested expressions. It supports:

- Arithmetic operations (`+`, `-`, `*`, `/`, `%`, `**`)
- Comparison operations (`==`, `!=`, `>`, `<`, `>=`, `<=`, `is`, `is not`, `in`, `not in`, `like`, `between`)
- Logical operations (`and`, `or`, `not`, `&&`, `||`, `!`)
- Null coalescing (`??`) and ternary (`? :`)
- Property access: dot notation, bracket notation, and chained access (`$user.address.city`)
- Array literals (`[1, 2, "three"]`)
- Parentheses for expression grouping

### 3. Evaluation

The **Evaluator** traverses the AST and computes the final result by resolving variables from the context object (or a `values` callback for dynamic lookups) and executing the appropriate operations.

The public `evaluate()` runs all three phases in sequence. `compile()` runs phases 1 and 2 once at compile time, then only runs phase 3 each time the predicate is called. `parse()` runs only phases 1 and 2 and returns the raw AST.

This three-phase architecture provides:

- **High Performance**: 79% smaller bundle size compared to grammar-based parsers
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Error Handling**: Clear, contextual error messages with position information
- **Extensibility**: Support for custom conditions and operators

## Key-Value Access

Quis supports accessing object properties using both dot notation and bracket notation, and they can be chained arbitrarily deep.

### Dot Notation

Access object properties using dot syntax:

- `$user.name` - Access the `name` property of the user object
- `$user.age` - Access the `age` property of the user object
- `$user.address.city` - Deep chained access

### Bracket Notation

Access object properties using bracket syntax:

- `$user[name]` - Access using unquoted identifier key
- `$user["name"]` - Access using double-quoted key
- `$user['name']` - Access using single-quoted key
- `$arr[0]` - Access by numeric index
- `$settings["theme-color"]` - Access keys with hyphens
- `$settings["auto save"]` - Access keys with spaces

### Chained Access

Dot and bracket notations can be mixed and chained to any depth:

```js
'$user.profile.settings["theme"] == "dark"'
'$data["users"][0].name == "Alice"'
```

Both notations can be used in any comparison operation supported by Quis.

## Boolean Expressions

Quis supports complex boolean expressions using both symbolic and word-based operators. See **Boolean Operators** above for the full list.

### Precedence

Operators follow standard precedence rules (highest to lowest):

1. Parentheses `()` — Highest precedence
2. Property access `.`, `[key]`
3. Unary minus `-`, NOT `!` / `not`
4. Exponentiation `**` (right-associative)
5. Multiplication `*`, Division `/`, Modulo `%`
6. Addition `+`, Subtraction `-`
7. Null coalescing `??`
8. Comparison operators (`==`, `!=`, `>`, `>=`, `<`, `<=`, `is`, `is not`, `in`, `not in`, `like`, `between`)
9. AND operators (`&&`, `and`)
10. OR operators (`||`, `or`)
11. Ternary `? :` — Lowest precedence

### Examples

```js
// Simple boolean expressions
'$user.age >= 18 && $user.verified == true'
'$health < 20 or $inventory.potion == true'

// Mixed symbolic and word operators
'$level >= 5 and ($gold > 100 || $gems >= 10)'

// Collection membership
'$role in ["admin", "moderator"]'
'$status not in ["banned", "suspended"]'

// Range check
'$age between 18 65'

// Glob pattern match
'$filename like "*.jpg"'

// Null coalescing
'$nickname ?? $username != ""'

// Ternary
'$score >= 90 ? "pass" : "fail"'

// Arithmetic in comparisons
'($score + $bonus) * $multiplier > 100'
'$level ** 2 + $xp % 50 > $threshold'

// Complex nested expressions
'($user.role == "admin" || $user.role == "moderator") && $user.active == true'
```

## Example

```javascript
import quis, { evaluate, compile } from 'quis';

// --- One-shot evaluation with a context object ---
evaluate('$user.age >= 18', { user: { name: 'Alice', age: 25, status: 'active' } });
// true

// --- Compile once, filter many ---
const isVisible = compile('$example > 3 || $example == 2');
const isUserContent = compile('$user.age >= 18');
const isPremium = compile('$user.age >= 21 && $user.status == "premium"');

const data = {
    example: 2,
    user: {
        name: 'Alice',
        age: 25,
        status: 'active'
    }
};

const content = [
    { condition: isVisible,    text: 'A' },
    { condition: isVisible,    text: 'B' },
    { condition: isUserContent, text: 'C' },
    { condition: isPremium,    text: 'D - Premium content' },
];

const results = content.filter(entry => entry.condition(data));
// Entries B and C pass (example == 2 is true, user.age >= 18 is true)
console.log(results.map(e => e.text)); // ['B', 'C']

// --- New features ---
evaluate('$score between 50 100', { score: 75 });                    // true
evaluate('$role in ["admin", "moderator"]', { role: 'admin' });      // true
evaluate('$tag like "item_*"', { tag: 'item_sword' });               // true
evaluate('$nickname ?? $username', { username: 'alice' });            // 'alice'
evaluate('$score >= 90 ? "A" : "B"', { score: 95 });                 // 'A'
evaluate('$level ** 2', { level: 4 });                               // 16

// --- Custom conditions ---
quis.addCustomCondition('startsWith', (value, prefix) =>
    String(value).startsWith(String(prefix))
);

const hasPrefix = compile('$code custom:startsWith "SWD"');
hasPrefix({ code: 'SWD001' }); // true
hasPrefix({ code: 'BOW002' }); // false
```



## Performance & Bundle Size

Quis is designed for optimal performance and minimal footprint:

- **Lightweight**: Only 12.7KB minified bundle size.
- **Fast**: Custom AST parser optimized for speed.
- **Zero Dependencies**: No external runtime dependencies.
- **TypeScript Native**: Built from the ground up with TypeScript.
- **Tree-Shakable**: ES modules support for optimal bundling.

## Features

- ✅ **Arithmetic Operations**: `+`, `-`, `*`, `/`, `%` (modulo), `**` (exponentiation)
- ✅ **Comparison Operations**: `==`, `!=`, `>`, `<`, `>=`, `<=`, `is`, `is not`
- ✅ **Collection Operators**: `in`, `not in`, `between`, `like` (glob matching)
- ✅ **Logical Operations**: `and`, `or`, `not`, `&&`, `||`, `!`
- ✅ **Null Coalescing**: `??` with lazy right-side evaluation
- ✅ **Ternary Expressions**: `condition ? valueIfTrue : valueIfFalse`
- ✅ **Array Literals**: `[1, "two", true]` for use with `in` / `not in`
- ✅ **Property Access**: Dot notation (`$user.name`), bracket notation (`$user["key"]`), numeric index (`$arr[0]`), and deep chains (`$user.address.city`)
- ✅ **Short-Circuit Evaluation**: `&&` and `||` skip the right side when possible
- ✅ **Operator Precedence**: Full 11-level precedence hierarchy
- ✅ **Parentheses Grouping**: Control evaluation order with parentheses
- ✅ **Input Length Guard**: Rejects inputs exceeding 10,000 characters
- ✅ **String Escapes**: `\n`, `\t`, `\r`, `\"`, `\'`, `\\` in string literals
- ✅ **Type Safety**: Full TypeScript support with comprehensive type definitions
- ✅ **Error Handling**: Clear error messages with position information
- ✅ **Custom Conditions**: Extensible with custom evaluation functions
- ✅ **Browser & Node.js**: Universal compatibility

## Installation

```bash
npm install quis
```

## License

MIT
