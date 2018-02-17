const {
    assemble,
    writeFile,
    unicodeVersion
} = require('./utils.js');

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
