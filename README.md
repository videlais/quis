# Quis

*Lightweight (~11 KiB) story sorting DSL.*

Based on the Latin word *quis*, this project, like its origin, implies a question of existing complex data. Quis provides a domain specific language (DSL) for performing comparisons on values within a state or global collection using strings.

Primarily, Quis is designed for story sorting with quality-based or storylet structures where comparisons are needed to select or otherwise act on narrative modules. It uses a Parsing Expression Grammar (PEG) to define possible JavaScript and shorthand conditional comparisons:

- `==` / `is` Equality.
- `!=` / `is not` Inequality.
- `>` / `gt` Greater than.
- `<` / `lt` Less than.
- `<=` / `lte` Less than or equal.
- `>=` / `gte` Greater than or equal.
- `and` Boolean AND
- `or` Boolean OR

## Build

- `build/quis.js (40.1 KiB)`
- `build/quis.min.js (10.8 KiB)`

## Example

```js
// Import parse() function.
const { parse } = require('./build/quis.js');

// Create a values function. (This must be a function returning a value.)
const values = (label) => {
    if(label == 'example') {
        return 2;
    }
};

// Example contents array.
const content = [
    {
        condition: "$example > 3",
        text: "A"
    },
    {
        condition: "$example == 2",
        text: "B"
    }
];

// filter() the array based on values + parse().
const results = content.filter(
    (entry) => parse(entry.condition, { values: values } ) == true
);

// Single result.
// [ { condition: '$example == 2', text: 'B' } ]
console.log(results);

```
