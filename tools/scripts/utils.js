const fs = require('fs');
const jsesc = require('jsesc');

const pkg = require('../../package.json');
const dependencies = Object.keys(pkg.devDependencies);
const unicodeVersion = dependencies.find((name) => /^unicode-\d/.test(name));

// https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
const highSurrogate = (codePoint) => Math.floor((codePoint - 0x10000) / 0x400) + 0xD800;

const lowSurrogate = (codePoint) => ((codePoint - 0x10000) % 0x400) + 0xDC00;

const codePointToString = (codePoint) => {
    const string = String.fromCodePoint(codePoint);
    // Important: escape RegExp meta-characters.
    if (/[$()*+\-\./?\[\]^{|}]/.test(string)) {
        return `\\${string}`;
    }
    return string;
};

const createRange = (codePoints) => {
    // Does the range contain lone high surrogates?
    let isBmpLast = false;
    // Does the range contain astral code points?
    let hasAstralCodePoints = false;
    const bmp = [];
    const supplementary = new Map();
    for (const codePoint of codePoints) {
        if (codePoint >= 0xD800 && codePoint <= 0xDBFF) {
            isBmpLast = true;
            bmp.push(codePoint);
        } else if (codePoint <= 0xFFFF) {
            bmp.push(codePoint);
        } else { // It’s a supplementary code point.
            const hi = highSurrogate(codePoint);
            const lo = lowSurrogate(codePoint);
            if (supplementary.has(hi)) {
                supplementary.get(hi).push(lo);
            } else {
                supplementary.set(hi, [lo]);
            }
            hasAstralCodePoints = true;
        }
    }

    const supplementaryByLowRanges = new Map();
    for (const [hi, lo] of supplementary) {
        const key = createBmpRange(lo);
        if (supplementaryByLowRanges.has(key)) {
            supplementaryByLowRanges.get(key).push(hi);
        } else {
            supplementaryByLowRanges.set(key, [hi]);
        }
    }
    // `supplementaryDictByLowRanges` looks like this:
    // { 'low surrogate range': [list of high surrogates that have this exact low surrogate range] })

    const bmpRange = createBmpRange(bmp, {addBrackets: false});

    const buf = [];
    let astralRange = '';

    // [bmpRange (including orphaned high surrogates), astralRange, isBmpLast]
    if (hasAstralCodePoints) {
        for (const [lo, hi] of supplementaryByLowRanges) {
            buf.push(createBmpRange(hi) + lo);
        }
        astralRange = buf.join('|');
    }

    return {
        bmp: bmpRange,
        astral: astralRange,
        isBmpLast: isBmpLast && hasAstralCodePoints
    };
};

const createBmpRange = (r, {addBrackets} = {addBrackets: true}) => {
    if (r.length === 0) {return '';}

    const buf = [];
    let start = r[0];
    let end = r[0];
    let predict = start + 1;
    r = r.slice(1);

    let counter = 0;
    for (const code of r) {
        if (predict == code) {
            end = code;
            predict = code + 1;
            continue;
        } else {
            if (start == end) {
                buf.push(codePointToString(start));
                counter++;
            } else if (end == start + 1) {
                buf.push(`${codePointToString(start)}${codePointToString(end)}`);
                counter += 2;
            } else {
                buf.push(`${codePointToString(start)}-${codePointToString(end)}`);
                counter += 2;
            }
            start = code;
            end = code;
            predict = code + 1;
        }
    }

    if (start == end) {
        buf.push(codePointToString(start));
        counter++;
    } else if (end == start + 1) {
        buf.push(`${codePointToString(start)}${codePointToString(end)}`);
        counter += 2;
    } else {
        buf.push(`${codePointToString(start)}-${codePointToString(end)}`);
        counter += 2;
    }

    const output = buf.join('');
    if (!addBrackets || counter == 1) {
        return output;
    }
    return `[${output}]`;
};

const assemble = ({name, alias, codePoints}) => {
    const {bmp, astral, isBmpLast} = createRange(codePoints);
    const result = {name};
    if (alias) {
        result.alias = alias;
    }
    if (isBmpLast) {
        result.isBmpLast = true;
    }
    if (bmp) {
        result.bmp = bmp;
    }
    if (astral) {
        result.astral = astral;
    }
    return result;
};

const writeFile = (name, object) => {
    console.log(`Saving ${name}…`);
    const output = jsesc(object, {
        compact: false,
        indent: '    '
    });
    fs.writeFileSync(
        `${__dirname}/../output/${name}`,
        `module.exports = ${output};\n`
    );
};

module.exports = {
    assemble,
    writeFile,
    unicodeVersion
};
