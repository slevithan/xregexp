const {
    assemble,
    writeFile,
    unicodeVersion
} = require('./utils.js');

// This includes only the binary properties required by UTS18 RL1.2 for level 1 Unicode regex
// support, minus `Assigned` which has special handling since it is the inverse of Unicode category
// `Unassigned`. To include all binary properties, change this to:
// `const properties = require(`${unicodeVersion}`).Binary_Property;`
const properties = [
    'ASCII',
    'Alphabetic',
    'Any',
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
