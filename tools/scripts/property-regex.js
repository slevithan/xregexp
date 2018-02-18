const {
    assemble,
    writeFile,
    unicodeVersion
} = require('./utils.js');

// This intentially includes only the binary properties required by UTS 18 Level 1 RL1.2 for Unicode
// regex support. To include all binary properties, change this to:
// `const properties = require(`${unicodeVersion}`).Binary_Property;`
const properties = [
    'ASCII',
    'Alphabetic',
    'Any',
    'Assigned',
    'Default_Ignorable_Code_Point',
    'Lowercase',
    'Noncharacter_Code_Point',
    'Uppercase',
    'White_Space'
];

const result = [];
for (const property of properties) {
    const codePoints = require(`${unicodeVersion}/Binary_Property/${property}/code-points.js`);
    result.push(assemble({
        name: property,
        codePoints
    }));
}
writeFile('properties.js', result);
