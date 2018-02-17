const aliasesToNames = require('unicode-property-value-aliases').get('General_Category');

const namesToAliases = new Map();
for (const [alias, name] of aliasesToNames) {
    if (!namesToAliases.has(name) || namesToAliases.get(name).length > name) {
        namesToAliases.set(name, alias);
    }
}

const {
    assemble,
    writeFile,
    unicodeVersion
} = require('./utils.js');

const categories = require(`${unicodeVersion}`).General_Category;

const aliases = [];
for (const category of categories) {
    const alias = namesToAliases.get(category);
    aliases.push({
        alias,
        category
    });
}
aliases.sort(function(a, b) {
    return a.alias < b.alias ? -1 : 1;
});

const result = [];
for (const {alias, category} of aliases) {
    const codePoints = require(`${unicodeVersion}/General_Category/${category}/code-points.js`);
    result.push(assemble({
        name: alias,
        alias: category,
        codePoints
    }));
}
writeFile('categories.js', result);
