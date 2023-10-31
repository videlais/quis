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
