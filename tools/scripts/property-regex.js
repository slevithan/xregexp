const {
    assemble,
    writeFile,
    unicodeVersion
} = require('./utils.js');

const properties = require(`${unicodeVersion}`).Binary_Property;

const result = [];
for (const property of properties) {
    const codePoints = require(`${unicodeVersion}/Binary_Property/${property}/code-points.js`);
    result.push(assemble({ name: property, codePoints }));
}
writeFile('properties.js', result);
