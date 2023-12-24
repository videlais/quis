# Quis

*Lightweight (~11 KiB) story sorting DSL.*

Based on the Latin word *quis*, this project, like its origin, implies a question of existing complex data. Quis provides a domain specific language (DSL) for performing comparisons on values within a collection using string-based comparisons.

Quis is designed for story sorting with dynamic narrative structures where comparisons are needed to select or sort content. It uses a Parsing Expression Grammar (PEG) to define possible JavaScript and shorthand conditional comparisons:

## Comparisons

- `==` / `is` Equality.
- `!=` / `is not` Inequality.
- `>` / `gt` Greater than.
- `<` / `lt` Less than.
- `<=` / `lte` Less than or equal.
- `>=` / `gte` Greater than or equal.
- `and` Boolean AND
- `or` Boolean OR

## Values Collection

To be as lightweight as possible, Quis does not contain state or database functionality. This must be provided by developers while also matching the expected callback structure expected.

Based on the underlining PEG compilation process, Quis expects a *values()* callback function returning values based on the passed-in variable name. For example, a simple collection returning specific values based on labels might be the following:

```javascript
const values = (label) => {

    // Establish a default value. 
    let result = null;

    // Return value based on 'example'.
    if (label === 'example') {
        result = 2;
    }
    
    // Return value based on 'example2'.
    if (label === 'example2') {
        result = 5;
    }

    // Return either default or set value.
    return result;
};
```

## Build

- `build/quis.js (40.1 KiB)`
- `build/quis.min.js (10.8 KiB)`

## Example

```js
// Import parse() function.
const { parse } = require('quis');

// Create a values function. (This must be a callback returning a value.)
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
