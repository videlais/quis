# Quis

*Lightweight (~12 KiB) data sorting DSL.*

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
const values = (name) => {

    // Establish a default value. 
    let result = null;

    // Return value based on 'example'.
    if (name === 'example') {
        result = 2;
    }
    
    // Return value based on 'example2'.
    if (name === 'example2') {
        result = 5;
    }

    // Return object for key-value access examples.
    if (name === 'user') {
        result = {
            name: 'John',
            age: 25,
            profile: {
                score: 100,
                level: 'advanced'
            }
        };
    }

    // Return either default or set value.
    return result;
};
```

## Key-Value Access

Quis supports accessing object properties using both dot notation and bracket notation:

### Dot Notation

Access object properties using dot syntax:

- `$user.name` - Access the 'name' property of the user object
- `$user.age` - Access the 'age' property of the user object

### Bracket Notation

Access object properties using bracket syntax:

- `$user[name]` - Access using unquoted key
- `$user["name"]` - Access using double-quoted key
- `$user['name']` - Access using single-quoted key
- `$settings["theme-color"]` - Access keys with hyphens
- `$settings["auto save"]` - Access keys with spaces

Both notations can be used in any comparison operation supported by Quis.

## Example

```js
// Import parse() function.
const { parse } = require('quis');

// Create a values function. (This must be a callback returning a value.)
const values = (label) => {
    if(label == 'example') {
        return 2;
    }
    if(label == 'user') {
        return {
            name: 'John',
            age: 25,
            status: 'active'
        };
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
    },
    {
        condition: '$user.age >= 18',
        text: "C"
    },
    {
        condition: '$user["status"] == "active"',
        text: "D"
    }
];

// filter() the array based on values + parse().
const results = content.filter(
    (entry) => parse(entry.condition, { values: values } ) == true
);

// Results include entries B, C, and D.
console.log(results);

```
