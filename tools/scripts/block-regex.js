const {
    assemble,
    writeFile,
    unicodeVersion
} = require('./utils.js');

const blocks = require(`${unicodeVersion}`).Block;

const result = [];
for (const block of blocks) {
    const codePoints = require(`${unicodeVersion}/Block/${block}/code-points.js`);
    result.push(assemble({
        name: `In${block}`,
        codePoints
    }));
}
writeFile('blocks.js', result);
