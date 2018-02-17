const {
    assemble,
    writeFile,
    unicodeVersion
} = require('./utils.js');

const scripts = require(`${unicodeVersion}`).Script;

const result = [];
for (const script of scripts) {
    const codePoints = require(`${unicodeVersion}/Script/${script}/code-points.js`);
    result.push(assemble({
        name: script,
        codePoints
    }));
}
writeFile('scripts.js', result);
