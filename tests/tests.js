// In Node.js, `module` is a predefined object, which makes the QUnit `module` definitions fail
// unless we redefine it
module = QUnit.module;

//-------------------------------------------------------------------
module('API');
//-------------------------------------------------------------------

test('Basic availability', function () {
    ok(XRegExp, 'XRegExp exists');
    ok(XRegExp.addToken, 'XRegExp.addToken exists');
    ok(XRegExp.cache, 'XRegExp.cache exists');
    ok(XRegExp.escape, 'XRegExp.escape exists');
    ok(XRegExp.exec, 'XRegExp.exec exists');
    ok(XRegExp.forEach, 'XRegExp.forEach exists');
    ok(XRegExp.globalize, 'XRegExp.globalize exists');
    ok(XRegExp.install, 'XRegExp.install exists');
    ok(XRegExp.isInstalled, 'XRegExp.isInstalled exists');
    ok(XRegExp.isRegExp, 'XRegExp.isRegExp exists');
    ok(XRegExp.match, 'XRegExp.match exists');
    ok(XRegExp.matchChain, 'XRegExp.matchChain exists');
    ok(XRegExp.replace, 'XRegExp.replace exists');
    ok(XRegExp.replaceEach, 'XRegExp.replaceEach exists');
    ok(XRegExp.split, 'XRegExp.split exists');
    ok(XRegExp.test, 'XRegExp.test exists');
    ok(XRegExp.uninstall, 'XRegExp.uninstall exists');
    ok(XRegExp.union, 'XRegExp.union exists');
    ok(XRegExp.version, 'XRegExp.version exists');
});

test('XRegExp', function () {
    var blankRegex = XRegExp('(?:)'),
        regexGIM = XRegExp('(?:)', 'gim');

    equal(XRegExp('').source, new RegExp('').source, 'Empty regex source (test 1)');
    equal(XRegExp('(?:)').source, /(?:)/.source, 'Empty regex source (test 2)');
    equal(XRegExp().source, new RegExp().source, 'undefined regex source');
    equal(XRegExp(null).source, new RegExp(null).source, 'null regex source');
    equal(XRegExp(NaN).source, new RegExp(NaN).source, 'NaN regex source');
    equal(XRegExp(1).source, new RegExp(1).source, 'numeric regex source');
    equal(XRegExp({}).source, new RegExp({}).source, 'object regex source');
    ok(!XRegExp('').global, 'Regex without flags is not global');
    ok(XRegExp('', 'g').global, 'Regex with global flag is global');
    ok(XRegExp('', 'i').ignoreCase, 'Regex with ignoreCase flag is ignoreCase');
    ok(XRegExp('', 'm').multiline, 'Regex with multiline flag is multiline');
    ok(regexGIM.global && regexGIM.ignoreCase && regexGIM.multiline, 'Regex with flags gim is global, ignoreCase, multiline');
    deepEqual(blankRegex, XRegExp(blankRegex), 'Regex copy and original are alike');
    notEqual(blankRegex, XRegExp(blankRegex), 'Regex copy is new instance');
    ok(XRegExp('').xregexp, 'XRegExp has xregexp property');
    notStrictEqual(XRegExp('').xregexp.captureNames, undefined, 'XRegExp has captureNames property');
    strictEqual(XRegExp('').xregexp.captureNames, null, 'Empty XRegExp has null captureNames');
    notStrictEqual(XRegExp('').xregexp.isNative, undefined, 'XRegExp has isNative property');
    ok(!XRegExp('').xregexp.isNative, 'XRegExp has isNative false');
    ok(!XRegExp(XRegExp('')).xregexp.isNative, 'Copied XRegExp has isNative false');
    ok(XRegExp(new RegExp('')).xregexp.isNative, 'Copied RegExp has isNative true');
    equal(XRegExp.exec('aa', XRegExp(XRegExp('(?<name>a)\\k<name>'))).name, 'a', 'Copied XRegExp retains named capture properties');
    raises(function () {XRegExp(/(?:)/, 'g');}, Error, 'Regex copy with flag throws');
    ok(XRegExp('') instanceof RegExp, 'XRegExp object is instanceof RegExp');
    equal(XRegExp('').constructor, RegExp, 'XRegExp object constructor is RegExp');
    raises(function () {XRegExp('', 'gg');}, SyntaxError, 'Regex with duplicate native flags throws');
    raises(function () {XRegExp('', 'ss');}, SyntaxError, 'Regex with duplicate nonnative flags throws (test 1)');
    raises(function () {XRegExp('', 'sis');}, SyntaxError, 'Regex with duplicate nonnative flags throws (test 2)');
    raises(function () {XRegExp('', '?');}, SyntaxError, 'Unsupported flag throws');
    ok(!XRegExp('(?:)', 'x').extended, 'Nonnative flag x does not set extended property');
});

test('XRegExp.addToken', function () {
    XRegExp.install('extensibility');

    // Include the `/` delimiters in case of naive string conversion of `RegExp` object
    raises(function () {XRegExp.addToken('/0/', function () {return '';});}, TypeError, 'Cannot provide string as regex pattern');

    XRegExp.addToken(/x00/, function () {return 'BOOM';});
    ok(XRegExp('^x\\x00$').test('x\x00'), 'Native multicharacter token in default scope handled correctly when not overriden');

    XRegExp.addToken(/\x00/, function () {return 'overridden';});
    XRegExp.addToken(/\x00/, function () {return '0';});
    ok(XRegExp('\x00').test('0'), 'More recently added token wins');

    // This token is deferred to by later token tests
    XRegExp.addToken(/\x01/, function () {return '1';});
    ok(XRegExp('\x01').test('1'), 'Default scope matches outside class');
    ok(!XRegExp('[\x01]').test('1'), 'Default scope does not match inside class');

    // This token is deferred to by later token tests
    XRegExp.addToken(/\x02/, function () {return '2';}, {scope: 'class'});
    ok(!XRegExp('\x02').test('2'), 'Explicit class scope does not match outside class');
    ok(XRegExp('[\x02]').test('2'), 'Explicit class scope matches inside class');

    XRegExp.addToken(/\x03/, function () {return '3';}, {scope: 'default'});
    ok(XRegExp('\x03').test('3'), 'Explicit default scope matches outside class');
    ok(!XRegExp('[\x03]').test('3'), 'Explicit default scope does not match inside class');

    XRegExp.addToken(/\x04/, function () {return '4';}, {scope: 'all'});
    ok(XRegExp('\x04').test('4'), 'Explicit all scope matches outside class');
    ok(XRegExp('[\x04]').test('4'), 'Explicit all scope matches inside class');

    XRegExp.addToken(/\x05/, function () {return '5';}, {
        trigger: function () {return this.hasFlag('5');},
        customFlags: '5'
    });
    ok(!XRegExp('\x05').test('5'), 'Trigger with hasFlag skips token when flag is missing');
    ok(XRegExp('\x05', '5').test('5'), 'Trigger with hasFlag uses token when flag is included');

    XRegExp.addToken(/^\x06/, function () {return '6';});
    ok(XRegExp('\x06').test('6'), 'Token with anchor is applied when found at start of pattern');
    ok(!XRegExp('a\x06').test('6'), 'Token with anchor is not applied when found after start of pattern');

    XRegExp.addToken(/\x07/, function () {return '\x01';});
    ok(XRegExp('\x07').test('\x01'), 'Tokens are not chained when reparse is not set');

    XRegExp.addToken(/\x07/, function () {return '\x01';}, {reparse: true});
    ok(XRegExp('\x07').test('1'), 'Tokens are chained when reparse is true');

    XRegExp.addToken(/\x07/, function () {return '\x01';}, {reparse: false});
    ok(XRegExp('\x07').test('\x01'), 'Tokens are not chained when reparse is false');

    XRegExp.addToken(/\x08/, function () {return '\x01.[\x02]';}, {reparse: true});
    ok(XRegExp('\x08').test('1x2'), 'Deferring to multiple tokens works when reparse is true');

    XRegExp.addToken(/\x09/, function () {return '\x08';}, {reparse: true});
    ok(XRegExp('\x09').test('1x2'), 'Token chaining works in a two-step chain');

    XRegExp.addToken(/\x0A/, function () {return '\x09';}, {reparse: true});
    ok(XRegExp('\x0A').test('1x2'), 'Token chaining works in a three-step chain');

    XRegExp.uninstall('extensibility');
});

test('XRegExp.cache', function () {
    var cached1 = XRegExp.cache('(?:)'),
        cached2 = XRegExp.cache('(?:)'),
        regexWithFlags = XRegExp('. +()\\1 1', 'gimsx');

    ok(cached1 instanceof RegExp, 'Returns RegExp');
    strictEqual(cached1, cached2, 'References to separately cached patterns refer to same object');
    deepEqual(XRegExp.cache('. +()\\1 1', 'gimsx'), regexWithFlags, 'Cached pattern plus flags');
});

test('XRegExp.escape', function () {
    equal(XRegExp.escape('[()*+?.\\^$|'), '\\[\\(\\)\\*\\+\\?\\.\\\\\\^\\$\\|', 'Metacharacters are escaped');
    equal(XRegExp.escape(']{}-, #'), '\\]\\{\\}\\-\\,\\ \\#', 'Occasional metacharacters are escaped');
    equal(XRegExp.escape('abc_<123>!\0\uFFFF'), 'abc_<123>!\0\uFFFF', 'Nonmetacharacters are not escaped');
});

test('XRegExp.exec', function () {
    var rX = /x/g,
        rA = /a/g,
        // Tests expect this to be nonglobal and use named capture
        xregexp = XRegExp('(?<name>a)'),
        str = 'abcxdef',
        match;

    ok(XRegExp.exec(str, rX, 2), 'Pos test 1');
    ok(!XRegExp.exec(str, rX, 5), 'Pos test 2');

    rX.lastIndex = 5;
    ok(XRegExp.exec(str, rX, 2), 'Pos ignores lastIndex (test 1)');

    rX.lastIndex = 0;
    ok(!XRegExp.exec(str, rX, 5), 'Pos ignores lastIndex (test 2)');

    rA.lastIndex = 5;
    ok(XRegExp.exec(str, rA), 'Pos ignores lastIndex test 3 (pos defaults to 0)');

    ok(XRegExp.exec(str, rX, 0), 'Undefined sticky allows matching after pos');
    ok(XRegExp.exec(str, rX, 0, false), 'Explicit sticky=false allows matching after pos');
    ok(!XRegExp.exec(str, rX, 0, true), 'Sticky match fails if match possible after (but not at) pos');
    ok(!XRegExp.exec(str, rX, 0, 'sticky'), 'String "sticky" triggers sticky mode');
    ok(XRegExp.exec(str, rX, 3, true), 'Sticky match succeeds if match at pos');
    strictEqual(XRegExp.exec(str, rX, 5), null, 'Result of failure is null');
    deepEqual(XRegExp.exec(str, xregexp), ['a', 'a'], 'Result of successful match is array with backreferences');

    match = XRegExp.exec(str, xregexp);
    equal(match.name, 'a', 'Match result includes named capture properties');

    xregexp.lastIndex = 5;
    XRegExp.exec(str, xregexp);
    equal(xregexp.lastIndex, 5, 'lastIndex of nonglobal regex left as is');

    rX.lastIndex = 0;
    XRegExp.exec(str, rX);
    equal(rX.lastIndex, 4, 'lastIndex of global regex updated to end of match');

    rX.lastIndex = 5;
    XRegExp.exec(str, rX, 2, true);
    equal(rX.lastIndex, 0, 'lastIndex of global regex updated to 0 after failure');

    strictEqual(XRegExp.exec('abc', /x/, 5), null, 'pos greater than string length results in failure');

    var sticky = !!RegExp.prototype.sticky,
        // Cannot hide /x/y within an `if` block, since that errors during compilation in IE9
        stickyRegex = sticky ? new RegExp('x', 'y') : /x/,
        stickyTest = !!XRegExp.exec(str, stickyRegex, 0);
    ok(XRegExp.exec(str, stickyRegex, 0, false), 'Explicit sticky=false overrides flag y');
    notEqual(stickyTest, sticky, 'Sticky follows flag y when not explicitly specified');
});

test('XRegExp.forEach', function () {
    var str = 'abc 123 def',
        regex = XRegExp('(?<first>\\w)\\w*'),
        regexG = XRegExp('(?<first>\\w)\\w*', 'g');

    deepEqual(XRegExp.forEach(str, regex, function (m) {this.push(m[0]);}, []), ['abc', '123', 'def'], 'Match strings with nonglobal regex');
    deepEqual(XRegExp.forEach(str, regexG, function (m) {this.push(m[0]);}, []), ['abc', '123', 'def'], 'Match strings with global regex');
    deepEqual(XRegExp.forEach(str, regex, function (m) {this.push(m.first);}, []), ['a', '1', 'd'], 'Named backreferences');
    deepEqual(XRegExp.forEach(str, regex, function (m) {this.push(m.index);}, []), [0, 4, 8], 'Match indexes');
    deepEqual(XRegExp.forEach(str, regex, function (m, i) {this.push(i);}, []), [0, 1, 2], 'Match numbers');
    deepEqual(XRegExp.forEach(str, regex, function (m, i, s) {this.push(s);}, []), [str, str, str], 'Source strings');
    deepEqual(XRegExp.forEach(str, regex, function (m, i, s, r) {this.push(r);}, []), [regex, regex, regex], 'Source regexes');

    var str2 = str;
    deepEqual(XRegExp.forEach(str2, regex, function (m, i, s) {this.push(s); s += s; str2 += str2;}, []), [str, str, str], 'Source string manipulation in callback does not affect iteration');

    var regex2 = XRegExp(regex);
    deepEqual(XRegExp.forEach(str, regex2, function (m, i, s, r) {this.push(i); r = /x/; regex2 = /x/;}, []), [0, 1, 2], 'Source regex manipulation in callback does not affect iteration');

    regexG.lastIndex = 4;
    deepEqual(XRegExp.forEach(str, regexG, function (m) {this.push(m[0]);}, []), ['abc', '123', 'def'], 'Iteration starts at pos 0, ignoring lastIndex');

    regex.lastIndex = 4;
    XRegExp.forEach(str, regex, function () {});
    equal(regex.lastIndex, 4, 'lastIndex of nonglobal regex unmodified after iteration');

    regexG.lastIndex = 4;
    XRegExp.forEach(str, regexG, function () {});
    equal(regexG.lastIndex, 0, 'lastIndex of global regex reset to 0 after iteration');

    var rgOrig = /\d+/g, interimLastIndex1 = 0, interimLastIndex2 = 0;
    XRegExp.forEach(str, rgOrig, function (m, i, s, r) {
        interimLastIndex1 = rgOrig.lastIndex;
        interimLastIndex2 = r.lastIndex;
    });
    equal(interimLastIndex1, 7, 'Global regex lastIndex updated during iterations (test 1)');
    equal(interimLastIndex2, 7, 'Global regex lastIndex updated during iterations (test 2)');

    var rOrig = /\d+/, interimLastIndex1 = 0, interimLastIndex2 = 0;
    XRegExp.forEach(str, rOrig, function (m, i, s, r) {
        interimLastIndex1 = rOrig.lastIndex;
        interimLastIndex2 = r.lastIndex;
    });
    equal(interimLastIndex1, 0, 'Nonglobal regex lastIndex not updated during iterations (test 1)');
    equal(interimLastIndex2, 0, 'Nonglobal regex lastIndex not updated during iterations (test 2)');

    // The `compile` method in Opera 11 has a bug (making `r.compile('.').source == '/./'`), so I
    // cannot test the entire result (Opera 11 gives `[false, true]` here instead of
    // `[false, true, true]`). This test merely checks that using `compile` to mutate the regex
    // within the callback works in principle and does not trigger an infinite loop
    var flagIResults = XRegExp.forEach('str', /./, function (m, i, s, r) {
            this.push(r.ignoreCase);
            r.compile('..', 'i');
        }, []);
    ok(!flagIResults[0], 'RegExp.prototype.compile in callback [0]');
    ok(flagIResults[1], 'RegExp.prototype.compile in callback [1]');
});

test('XRegExp.globalize', function () {
    var hasNativeY = typeof RegExp.prototype.sticky !== 'undefined',
        regex = XRegExp('(?<name>a)\\k<name>', 'im' + (hasNativeY ? 'y' : '')),
        globalCopy = XRegExp.globalize(regex),
        globalOrig = XRegExp('(?:)', 'g');

    notEqual(regex, globalCopy, 'Copy is new instance');
    ok(globalCopy.global, 'Copy is global');
    equal(regex.source, globalCopy.source, 'Copy has same source');
    ok(regex.ignoreCase === globalCopy.ignoreCase && regex.multiline === globalCopy.multiline && regex.sticky === globalCopy.sticky, 'Copy has same ignoreCase, multiline, and sticky properties');
    ok(XRegExp.exec('aa', globalCopy).name, 'Copy retains named capture capabilities');
    ok(XRegExp.globalize(globalOrig).global, 'Copy of global regex is global');
});

test('XRegExp.install', function () {
    expect(0);
    // TODO: Add tests
});

test('XRegExp.isInstalled', function () {
    XRegExp.install('natives extensibility astral');

    ok(XRegExp.isInstalled('natives'), 'natives is installed');
    ok(XRegExp.isInstalled('extensibility'), 'extensibility is installed');
    ok(XRegExp.isInstalled('astral'), 'astral is installed');
    ok(!XRegExp.isInstalled('natives extensibility'), 'Cannot check multiple features simultaneously (test 1)');
    ok(!XRegExp.isInstalled('natives,extensibility'), 'Cannot check multiple features simultaneously (test 2)');
    ok(!XRegExp.isInstalled('natives, extensibility'), 'Cannot check multiple features simultaneously (test 3)');
    ok(!XRegExp.isInstalled({natives: true}), 'Cannot check feature using object');
    ok(!XRegExp.isInstalled('bogus'), 'Unknown feature is not installed');

    XRegExp.uninstall('natives extensibility astral');

    ok(!XRegExp.isInstalled('natives'), 'natives is not installed');
    ok(!XRegExp.isInstalled('extensibility'), 'extensibility is not installed');
    ok(!XRegExp.isInstalled('astral'), 'astral is not installed');

    XRegExp.install('extensibility');
    XRegExp.install('extensibility');
    XRegExp.uninstall('extensibility');
    ok(!XRegExp.isInstalled('extensibility'), 'Single uninstall undoes multiple installs');
});

test('XRegExp.isRegExp', function () {
    ok(XRegExp.isRegExp(/(?:)/), 'Regex built by regex literal is RegExp');
    ok(XRegExp.isRegExp(RegExp('(?:)')), 'Regex built by RegExp is RegExp');
    ok(XRegExp.isRegExp(XRegExp('(?:)')), 'Regex built by XRegExp is RegExp');
    ok(!XRegExp.isRegExp(undefined), 'undefined is not RegExp');
    ok(!XRegExp.isRegExp(null), 'null is not RegExp');
    ok(!XRegExp.isRegExp({}), 'Object literal is not RegExp');
    ok(!XRegExp.isRegExp(function () {}), 'Function literal is not RegExp');

    var fakeRegex = {};
    fakeRegex.constructor = RegExp;
    ok(!XRegExp.isRegExp(fakeRegex), 'Object with assigned RegExp constructor is not RegExp');

    var tamperedRegex = /x/;
    tamperedRegex.constructor = {};
    ok(XRegExp.isRegExp(tamperedRegex), 'RegExp with assigned Object constructor is RegExp');

    // Check whether `document` exists and only run the frame test if so. This ensures the test is
    // run only in the browser and not in server-side environments without a DOM.
    if (typeof document !== 'undefined') {
        var iframe = document.createElement('iframe');
        iframe.width = iframe.height = iframe.border = 0; //iframe.style.display = 'none';
        document.body.appendChild(iframe);
        frames[frames.length - 1].document.write('<script>var regex = /x/;<\/script>');
        ok(XRegExp.isRegExp(iframe.contentWindow.regex), 'RegExp constructed in another frame is RegExp');
        iframe.parentNode.removeChild(iframe); // Cleanup
    }
});

test('XRegExp.match', function () {
    var nonglobal = /\d/,
        global = /\d/g,
        str = '1 2 3 z';
    nonglobal.lastIndex = global.lastIndex = 2;

    deepEqual(XRegExp.match(str, nonglobal, 'all'), ['1', '2', '3'], 'Regex without flag g matches all');
    equal(nonglobal.lastIndex, 2, 'lastIndex of nonglobal regex unmodified after search');
    deepEqual(XRegExp.match(str, global), ['1', '2', '3'], 'Regex with flag g matches all');
    equal(global.lastIndex, 0, 'lastIndex of global regex reset after search');
    raises(function () {XRegExp.match(str, '1');}, TypeError, 'String search throws error');
    raises(function () {XRegExp.match(str, new String('1'));}, TypeError, 'String object search throws error');

    deepEqual(XRegExp.match('a bc', /\w/), 'a');
    deepEqual(XRegExp.match('a bc', /\w/, 'one'), 'a');
    deepEqual(XRegExp.match('a bc', /\w/g, 'one'), 'a');
    deepEqual(XRegExp.match('a bc', /x/), null);
    deepEqual(XRegExp.match('a bc', /x/, 'one'), null);
    deepEqual(XRegExp.match('a bc', /x/g, 'one'), null);
    deepEqual(XRegExp.match('a bc', /\w/g), ['a', 'b', 'c']);
    deepEqual(XRegExp.match('a bc', /\w/g, 'all'), ['a', 'b', 'c']);
    deepEqual(XRegExp.match('a bc', /\w/, 'all'), ['a', 'b', 'c']);
    deepEqual(XRegExp.match('a bc', /x/g), []);
    deepEqual(XRegExp.match('a bc', /x/g, 'all'), []);
    deepEqual(XRegExp.match('a bc', /x/, 'all'), []);
});

test('XRegExp.matchChain', function () {
    var html = '<html><img src="http://x.com/img.png">' +
            '<script src="http://xregexp.com/path/file.ext">' +
            '<img src="http://xregexp.com/path/to/img.jpg?x">' +
            '<img src="http://xregexp.com/img2.gif"/></html>',
        xregexpImgFileNames = XRegExp.matchChain(html, [
            {regex: /<img\b([^>]+)>/i, backref: 1}, // <img> tag attributes
            {regex: XRegExp('(?ix) \\s src=" (?<src> [^"]+ )'), backref: 'src'}, // src attribute values
            {regex: XRegExp('^http://xregexp\\.com(/[^#?]+)', 'i'), backref: 1}, // xregexp.com paths
            /[^\/]+$/ // filenames (strip directory paths)
        ]);

    deepEqual(xregexpImgFileNames, ['img.jpg', 'img2.gif'], 'Four-level chain with plain regex and regex/backref objects (using named and numbered backrefs)');
    deepEqual(XRegExp.matchChain('x', [/x/, /y/]), [], 'Empty array returned if no matches');
    raises(function () {XRegExp.matchChain(html, []);}, Error, 'Empty chain regex throws error');
});

test('XRegExp.replace', function () {
    equal(XRegExp.replace('test', 't', 'x', 'all'),  'xesx', 'String search with scope="all"');
    equal(XRegExp.replace('test', 't', 'x', 'one'),  'xest', 'String search with scope="one"');
    equal(XRegExp.replace('test', 't', 'x'),         'xest', 'String search without scope');
    equal(XRegExp.replace('test', /t/, 'x', 'all'),  'xesx', 'Regex search with scope="all"');
    equal(XRegExp.replace('test', /t/, 'x', 'one'),  'xest', 'Regex search with scope="one"');
    equal(XRegExp.replace('test', /t/, 'x'),         'xest', 'Regex search without scope');
    equal(XRegExp.replace('test', /t/g, 'x', 'all'), 'xesx', 'Global regex search with scope="all"');
    equal(XRegExp.replace('test', /t/g, 'x', 'one'), 'xest', 'Global regex search with scope="one"');
    equal(XRegExp.replace('test', /t/g, 'x'),        'xesx', 'Global regex search without scope');

    // TODO: Add tests (above tests cover `scope` functionality only)
});

test('XRegExp.replaceEach', function () {
    equal(XRegExp.replaceEach('aabBccddeeffgghh', [
            [XRegExp('(?<name>a)'), 'z${name}'],
            [/b/gi, 'y'],
            [/c/g, 'x', 'one'],
            [/d/, 'w', 'all'],
            ['e', 'v', 'all'],
            [/f/g, function ($0) {return $0.toUpperCase();}],
            ['g', function ($0) {return $0.toUpperCase();}],
            ['h', function ($0) {return $0.toUpperCase();}, 'all']
        ]), 'zaayyxcwwvvFFGgHH', 'All basic search/replacement types and scopes');
    equal(XRegExp.replaceEach('<&>', [
            [/&/g, '&amp;'],
            [/</g, '&lt;'],
            [/a/g, 'b'],
            [/b/g, 'c']
        ]), '&lt;&cmp;>', 'Search string is output of prior replacements');

    // TODO: Add tests
});

test('XRegExp.split', function () {
    expect(0);
    // TODO: Add tests
});

test('XRegExp.test', function () {
    expect(0);
    // TODO: Add tests
});

test('XRegExp.uninstall', function () {
    expect(0);
    // TODO: Add tests
});

test('XRegExp.union', function () {
    deepEqual('a+b*c dogsdogs catscats'.match(XRegExp.union(['a+b*c', /(dogs)\1/, /(cats)\1/], 'g')),
        ['a+b*c', 'dogsdogs', 'catscats'], 'Strings escaped and backreferences rewritten');
    raises(function () {XRegExp.union([XRegExp('(?<pet>dogs)\\k<pet>'), XRegExp('(?<pet>cats)\\k<pet>')]);},
        SyntaxError, 'Groups with same name in separate regexes is an error');
    ok(XRegExp.union([XRegExp('(?<a>a)\\k<a>')], 'n').test('aa'), 'Apply flag n (test 1)');
    raises(function () {XRegExp.union([XRegExp('(?<a>a)\\k<a>'), /(b)\1/], 'n');},
        SyntaxError, 'Apply flag n (test 2)');
    raises(function () {XRegExp.union([XRegExp('(?<a>a)\\k<a>'), /(b)\1/, XRegExp('(?<x>)')], 'n');},
        SyntaxError, 'Apply flag n (test 3)');

    // TODO: Add tests
});

test('XRegExp.version', function () {
    var parts = XRegExp.version.split('.');

    equal(typeof XRegExp.version, 'string', 'Version is a string');
    equal(parts.length, 3, 'Version is three dot-delimited parts');
    ok(!(isNaN(+parts[0]) || isNaN(+parts[1])), 'Major and minor version parts are numeric');
});

//-------------------------------------------------------------------
module('Overriden natives');
//-------------------------------------------------------------------

test('RegExp.prototype.exec', function () {
    XRegExp.install('natives');

    deepEqual(/x/.exec('a'), null, 'Nonmatch returns null');
    deepEqual(/a/.exec('a'), ['a'], 'Match returns array');
    deepEqual(/(a)/.exec('a'), ['a', 'a'], 'Match returns array with backreferences');
    deepEqual(/()??/.exec('a'), ['', undefined], 'Backrefernces to nonparticipating capturing groups returned as undefined');
    equal(/a/.exec('12a').index, 2, 'Match array has index set to match start');
    equal(/a/.exec('12a').input, '12a', 'Match array has input set to target string');

    var regex = /x/;
    regex.exec('123x567');
    equal(regex.lastIndex, 0, 'Nonglobal regex lastIndex is 0 after match');

    regex.lastIndex = 1;
    regex.exec('123x567');
    equal(regex.lastIndex, 1, 'Nonglobal regex lastIndex is unmodified after match');

    regex.exec('abc');
    equal(regex.lastIndex, 1, 'Nonglobal regex lastIndex is unmodified after failure');

    var regexG = /x/g;
    regexG.exec('123x567');
    equal(regexG.lastIndex, 4, 'Global regex lastIndex is updated after match');

    regexG.lastIndex = 4;
    equal(regexG.exec('123x567'), null, 'Global regex starts match at lastIndex');

    equal(regexG.lastIndex, 0, 'Global regex lastIndex reset to 0 after failure');

    var regexZeroLength = /^/g;
    regexZeroLength.exec('abc');
    equal(regexZeroLength.lastIndex, 0, 'Global regex lastIndex is not incremented after zero-length match');

    regexG.lastIndex = '3';
    deepEqual(regexG.exec('123x567'), ['x'], 'lastIndex converted to integer (test 1)');

    regexG.lastIndex = '4';
    deepEqual(regexG.exec('123x567'), null, 'lastIndex converted to integer (test 2)');

    deepEqual(/1/.exec(1), ['1'], 'Numeric argument converted to string (test 1)');
    deepEqual(/1()/.exec(1), ['1', ''], 'Numeric argument converted to string (test 2)');
    deepEqual(/null/.exec(null), ['null'], 'null argument converted to string');
    deepEqual(/NaN/.exec(NaN), ['NaN'], 'NaN argument converted to string');
    // This is broken in old Firefox (tested in Firefox 2.0; it works in Firefox 8+), but not for
    // any fault of XRegExp. Uncomment this test if future XRegExp fixes it for old Firefox.
    //deepEqual(/undefined/.exec(), ['undefined'], 'undefined argument converted to string');
    raises(function () {RegExp.prototype.exec.call('\\d', '1');}, TypeError, 'TypeError thrown when context is not type RegExp');

    XRegExp.uninstall('natives');
});

test('RegExp.prototype.test', function () {
    XRegExp.install('natives');

    strictEqual(/x/.test('a'), false, 'Nonmatch returns false');
    strictEqual(/a/.test('a'), true, 'Match returns true');

    var regex = /x/;
    regex.test('123x567');
    equal(regex.lastIndex, 0, 'Nonglobal regex lastIndex is 0 after match');

    regex.lastIndex = 1;
    regex.test('123x567');
    equal(regex.lastIndex, 1, 'Nonglobal regex lastIndex is unmodified after match');

    regex.test('abc');
    equal(regex.lastIndex, 1, 'Nonglobal regex lastIndex is unmodified after failure');

    var regexG = /x/g;
    regexG.test('123x567');
    equal(regexG.lastIndex, 4, 'Global regex lastIndex is updated after match');

    regexG.lastIndex = 4;
    ok(!regexG.test('123x567'), 'Global regex starts match at lastIndex');

    equal(regexG.lastIndex, 0, 'Global regex lastIndex reset to 0 after failure');

    var regexZeroLength = /^/g;
    regexZeroLength.test('abc');
    equal(regexZeroLength.lastIndex, 0, 'Global regex lastIndex is not incremented after zero-length match');

    regexG.lastIndex = '3';
    ok(regexG.test('123x567'), 'lastIndex converted to integer (test 1)');

    regexG.lastIndex = '4';
    ok(!regexG.test('123x567'), 'lastIndex converted to integer (test 2)');

    ok(/1/.test(1), 'Argument converted to string');
    raises(function () {RegExp.prototype.test.call('\\d', '1');}, TypeError, 'TypeError thrown when context is not type RegExp');

    XRegExp.uninstall('natives');
});

test('String.prototype.match', function () {
    XRegExp.install('natives');

    deepEqual('a'.match(/x/), null, 'Nonglobal regex: Nonmatch returns null');
    deepEqual('a'.match(/a/), ['a'], 'Nonglobal regex: Match returns array');
    deepEqual('a'.match(/(a)/), ['a', 'a'], 'Nonglobal regex: Match returns array with backreferences');
    deepEqual('a'.match(/()??/), ['', undefined], 'Nonglobal regex: Backrefernces to nonparticipating capturing groups returned as undefined');
    equal('12a'.match(/a/).index, 2, 'Nonglobal regex: Match array has index set to match start');
    equal('12a'.match(/a/).input, '12a', 'Nonglobal regex: Match array has input set to target string');

    var regex = /x/;
    '123x567'.match(regex);
    equal(regex.lastIndex, 0, 'Nonglobal regex: lastIndex is 0 after match');

    regex.lastIndex = 1;
    '123x567'.match(regex);
    equal(regex.lastIndex, 1, 'Nonglobal regex: lastIndex is unmodified after match');

    'abc'.match(regex);
    equal(regex.lastIndex, 1, 'Nonglobal regex: lastIndex is unmodified after failure');

    var regexG = /x/g;
    '123x567'.match(regexG);
    equal(regexG.lastIndex, 0, 'Global regex: lastIndex is 0 after match');

    regexG.lastIndex = 4;
    deepEqual('123x567'.match(regexG), ['x'], 'Global regex: Search starts at pos zero despite lastIndex');

    regexG.lastIndex = 4;
    'abc'.match(regexG);
    equal(regexG.lastIndex, 0, 'Global regex: lastIndex reset to 0 after failure');

    deepEqual('1'.match('^(1)'), ['1', '1'], 'Argument converted to RegExp');
    deepEqual(String.prototype.match.call(1, /1/), ['1'], 'Nonstring context is converted to string');

    XRegExp.uninstall('natives');
});

test('String.prototype.replace', function () {
    XRegExp.install('natives');

    equal('xaaa'.replace(/a/, 'b'), 'xbaa', 'Basic nonglobal regex search');
    equal('xaaa'.replace(/a/g, 'b'), 'xbbb', 'Basic global regex search');
    equal('xaaa'.replace('a', 'b'), 'xbaa', 'Basic string search');
    equal('xaaa'.replace(/a(a)/, '$1b'), 'xaba', 'Backreference $1 in replacement string');
    equal('xaaa'.replace(/a(a)/, '$01b'), 'xaba', 'Backreference $01 in replacement string');
    equal('xaaa'.replace(/a()()()()()()()()()(a)/, '$10b'), 'xaba', 'Backreference $11 in replacement string');
    equal('xaaa'.replace(/a()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()(a)/, '$99b'), 'xaba', 'Backreference $99 in replacement string');
    equal('xaaa'.replace(/a()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()()(a)/, '$100b'), 'x0ba', '$100 in replacement string');
    equal('xaaa'.replace(/aa/, '$&b'), 'xaaba', 'Backreference $& in replacement string');
    equal('xaaa'.replace(/aa/, "$'b"), 'xaba', "Backreference $' in replacement string");
    equal('xaaa'.replace(/aa/, '$`b'), 'xxba', 'Backreference $` in replacement string');
    equal('xaaa'.replace(/aa/, '$$b'), 'x$ba', '$$ in replacement string');
    equal('xaaa'.replace('a(a)', '$1b'), 'xaaa', 'Parentheses in string search does not match');
    equal('xaaa'.replace('aa', '$&b'), 'xaaba', 'Backreference $& in replacement string for string search');
    equal('xaaa'.replace('aa', "$'b"), 'xaba', "Backreference $' in replacement string for string search");
    equal('xaaa'.replace('aa', '$`b'), 'xxba', 'Backreference $` in replacement string for string search');
    equal('xaaa'.replace('aa', '$$b'), 'x$ba', '$$ in replacement string for string search');
    equal('xaaa'.replace(/a/, function () {return 'b';}), 'xbaa', 'Nonglobal regex search with basic function replacement');
    equal('xaaa'.replace(/a/g, function () {return 'b';}), 'xbbb', 'Global regex search with basic function replacement');
    equal('xaaa'.replace(/aa/, function ($0) {return $0 + 'b';}), 'xaaba', 'Regex search with function replacement, using match');
    equal('xaaa'.replace(/a(a)/, function ($0, $1) {return $1 + 'b';}), 'xaba', 'Regex search with function replacement, using backreference 1');
    equal('xaaa'.replace(/a(a)/, function ($0, $1) {return '$1b';}), 'x$1ba', 'Regex search with function replacement, using $1 in return string');
    equal('xaaa'.replace(/a/, function () {return '$&b';}), 'x$&baa', 'Regex search with function replacement, using $& in return string');
    equal('xaaa'.replace(/a/g, function ($0, pos) {return '' + pos;}), 'x123', 'Regex search with function replacement, using pos in return string');
    equal('xaaa'.replace(/(a)/g, function ($0, $1, pos) {return '' + pos;}), 'x123', 'Regex (with capturing group) search with function replacement, using pos in return string');
    equal('xaaa'.replace(/a/, function ($0, pos, str) {return str;}), 'xxaaaaa', 'Regex search with function replacement, using source string in return string');
    equal('xaaa'.replace(/(a)/, function ($0, $1, pos, str) {return str;}), 'xxaaaaa', 'Regex (with capturing group) search with function replacement, using source string in return string');
    equal('xaaa'.replace('a', function () {return 'b';}), 'xbaa', 'String search with basic function replacement');
    equal('xaaa'.replace('a', function ($0) {return $0;}), 'xaaa', 'String search with function replacement, using match');
    // This is broken in Safari (tested in Safari 5.1.2/7534.52.7), but not for any fault of
    // XRegExp. Uncomment this test if future XRegExp fixes it for Safari.
    //equal('xaaa'.replace('a', function () {return '$&';}), 'x$&aa', 'String search with function replacement, using $& in return string');
    equal('xaaa'.replace('a', function ($0, pos) {return '' + pos;}), 'x1aa', 'String search with function replacement, using pos in return string');
    equal('xaaa'.replace('a', function ($0, pos, str) {return str;}), 'xxaaaaa', 'String search with function replacement, using source string in return string');
    equal(String.prototype.replace.call(100, /0/g, 'x'), '1xx', 'Number as context');
    equal(String.prototype.replace.call(100, /(0)/g, '$1x'), '10x0x', 'Number as context with backreference $1 in replacement string');
    equal(String.prototype.replace.call(100, /0/g, function ($0) {return $0 + 'x';}), '10x0x', 'Number as context with function replacement');
    equal(String.prototype.replace.call(100, '0', 'x'), '1x0', 'String search with number as context');
    equal(String.prototype.replace.call(100, '0', '$&x'), '10x0', 'String search with number as context, with backreference $& in replacement string');
    equal(String.prototype.replace.call(['a','b'], /,/g, 'x'), 'axb', 'Array as context');
    equal('10x10'.replace(10, 'x'), 'xx10', 'Number as search (converted to string)');
    equal('xaaa,ba,b'.replace(['a','b'], 'x'), 'xaaxa,b', 'Array as search (converted to string)');
    equal('xaaa'.replace(/a/g, 1.1), 'x1.11.11.1', 'Number as replacement (converted to string)');
    equal('xaaa'.replace(/a/g, ['a','b']), 'xa,ba,ba,b', 'Array as replacement (converted to string)');
    equal('100'.replace(/0/, function ($0, pos, str) {return typeof str;}), '1string0', 'typeof last argument in replacement function is string');
    equal(new String('100').replace(/0/, function ($0, pos, str) {return typeof str;}), '1string0', 'typeof last argument in replacement function is string, when called on String as context');
    equal(String.prototype.replace.call(100, /0/, function ($0, pos, str) {return typeof str;}), '1string0', 'typeof last argument in replacement function is string, when called on number as context');
    equal('xaaa'.replace(/a/), 'xundefinedaa', 'Replacement string is "undefined", when not provided');
    equal('x'.replace(/x/, /x/), '/x/', 'Regex search with RegExp replacement');
    equal('xaaa'.replace(), 'xaaa', 'Source returned when no replacement provided');
    equal('test'.replace(/t|(e)/g, '$1'), 'es', 'Numbered backreference to nonparticipating group');

    var regex = /x/;
    '123x567'.replace(regex, '_');
    equal(regex.lastIndex, 0, 'Unaltered nonglobal regex lastIndex is 0 after match');

    regex.lastIndex = 1;
    '123x567'.replace(regex, '_');
    equal(regex.lastIndex, 1, 'Nonglobal regex lastIndex is unmodified after match');

    'abc'.replace(regex, '_');
    equal(regex.lastIndex, 1, 'Nonglobal regex lastIndex is unmodified after failure');

    var regexG = /x/g;
    '123x567'.replace(regexG, '_');
    equal(regexG.lastIndex, 0, 'Unaltered global regex lastIndex is 0 after match');

    regexG.lastIndex = 5;
    equal('123x567'.replace(regexG, '_'), '123_567', 'Global regex ignores lastIndex as start position');

    regexG.lastIndex = 5;
    '123x567'.replace(regexG, '_');
    equal(regexG.lastIndex, 0, 'Global regex lastIndex reset to 0');

    var regex2 = /x/g,
        interimLastIndex = 0;
    '1x2'.replace(regex2, function () {
        interimLastIndex = regex2.lastIndex;
    });
    equal(interimLastIndex, 2, 'Global regex lastIndex updated during replacement iterations');

    XRegExp.uninstall('natives');
});

test('String.prototype.split', function () {
    XRegExp.install('natives');

    expect(0);
    // TODO: Add tests (basic functionality tests, not the long list from
    // the cross-browser fixes module)

    XRegExp.uninstall('natives');
});

//-------------------------------------------------------------------
module('Overriden natives extensions');
//-------------------------------------------------------------------

test('RegExp.prototype.exec', function () {
    XRegExp.install('natives');

    equal(XRegExp('(?<name>a)').exec('a').name, 'a', 'Match array has named capture properties');

    XRegExp.uninstall('natives');
});

// No tests needed for RegExp.prototype.test in this test module, because although the method is
// overridden by XRegExp, it is not *extended*
//test('RegExp.prototype.test', function () {});

test('String.prototype.match', function () {
    XRegExp.install('natives');

    equal('a'.match(XRegExp('(?<name>a)')).name, 'a', 'Match array has named capture properties');

    XRegExp.uninstall('natives');
});

test('String.prototype.replace', function () {
    XRegExp.install('natives');

    equal('xaaa'.replace(/aa/, '$0b'), 'xaaba', '$0 in replacement string works like $&');
    equal('xaaa'.replace(/aa/, '$00b'), 'xaaba', '$00 in replacement string works like $&');
    equal('xaaa'.replace(/aa/, '$000b'), 'xaa0ba', '$000 in replacement string works like $&0');
    raises(function () {'xaaa'.replace(/aa/, '$1b');}, SyntaxError, '$1 throws in replacement string for regex with no backreference');
    raises(function () {'xaaa'.replace(/aa/, '$01b');}, SyntaxError, '$01 throws in replacement string for regex with no backreference');
    equal('xaaa'.replace(/aa/, '$001b'), 'xaa1ba', '$001 works like $&1 in replacement string for regex with no backreference');
    raises(function () {'xaaa'.replace(/a(a)/, '$2b');}, SyntaxError, '$2 throws in replacement string for regex with less than 2 backreferences');
    raises(function () {'xa(a)a'.replace('a(a)', '$1b');}, SyntaxError, '$1 throws in replacement string for string search with parentheses');
    equal('xaaa'.replace('aa', '$0b'), 'xaaba', '$0 in replacement string for string search works like $&');
    equal('test'.replace(/t|(e)/g, '${1}'), 'es', 'Numbered backreference in curly brackets to nonparticipating group');
    raises(function () {'test'.replace(/t/, '${1}');}, SyntaxError, 'Numbered backreference to undefined group in replacement string');
    equal('test'.replace(XRegExp('(?<test>t)', 'g'), ':${test}:'), ':t:es:t:', 'Named backreference in replacement string');
    raises(function () {'test'.replace(XRegExp('(?<test>t)', 'g'), ':${x}:');}, SyntaxError, 'Named backreference to undefined group in replacement string');

    function mul(str, num) {
        return Array(num + 1).join(str);
    }
    // IE < 9 does not allow backrefs greater than \99 *within* a regex, but XRegExp still allows
    // backreferences to groups 100+ within replacement text
    var lottaGroups = new RegExp(
        '^(a)\\1' + mul('()', 8) +
        '(b)\\10' + mul('()', 89) +
        '(c)' + mul('()', 899) +
        '(d)$'
    );
    equal('aabbcd'.replace(lottaGroups, '$0 $01 $001 $0001 $1 $10 $100 $1000'), 'aabbcd a aabbcd1 aabbcd01 a b b0 b00', 'Regex with 1,000 capturing groups, without curly brackets for backreferences');
    equal('aabbcd'.replace(lottaGroups, '${0} ${01} ${001} ${0001} ${1} ${10} ${100} ${1000}'), 'aabbcd a a a a b c d', 'Regex with 1,000 capturing groups, with curly brackets for backreferences');

    // TODO: Add tests

    XRegExp.uninstall('natives');
});

// No tests needed for String.prototype.split in this test module, because although the method is
// overridden by XRegExp, it is not *extended*
//test('String.prototype.split', function () {});

//-------------------------------------------------------------------
module('New syntax and flags');
//-------------------------------------------------------------------

test('Named capture and backreferences', function () {
    expect(0);
    // TODO: Add tests
});

test('Inline comments', function () {
    ok(XRegExp('^a(?#)b$').test('ab'), 'Comment is ignored');
    ok(XRegExp('^a(?#)+$').test('aaa'), 'Quantifier following comment applies to preceding atom');
    ok(XRegExp('^(a)\\1(?#)2$').test('aa2'), 'Comment separates atoms');

    // TODO: Add tests
});

test('Leading mode modifier', function () {
    expect(0);
    // TODO: Add tests
});

test('Enhanced error handling', function () {
    raises(function () {XRegExp('\\1');}, SyntaxError, 'Octals throw');
    raises(function () {XRegExp('\\a');}, SyntaxError, 'Unknown letter escapes throw (test 1)');
    raises(function () {XRegExp('\\A');}, SyntaxError, 'Unknown letter escapes throw (test 2)');
    raises(function () {XRegExp('[\\B]');}, SyntaxError, 'Unknown letter escapes throw (test 3)');

    // TODO: Add tests

    // Python-style named capture syntax was added in XRegExp 2.0.0 to avoid octal-related errors
    // in Opera. Recent Opera supports (?P<name>..) and (?P=name) based on abandoned ES4 proposals.
    equal(XRegExp('(?P<name>a)(b)\\2').test('abb'), true, 'Numbered backreference to Python-style named capture not treated as octal (test 1)');
    equal(XRegExp('(?P<name>a)(b)\\1').test('aba'), true, 'Numbered backreference to Python-style named capture not treated as octal (test 2)');
});

test('n flag (explicit capture mode)', function () {
    expect(0);
    // TODO: Add tests
});

test('s flag (dotall mode)', function () {
    expect(0);
    // TODO: Add tests
});

test('x flag (extended mode)', function () {
    ok(XRegExp('^a b$', 'x').test('ab'), 'Whitespace is ignored');
    ok(XRegExp('^a#comment\nb$', 'x').test('ab'), 'Line comment is ignored');
    ok(XRegExp('^a +$', 'x').test('aaa'), 'Quantifier following whitespace applies to preceding atom');
    ok(XRegExp('^(a)\\1 2$', 'x').test('aa2'), 'Whitespace separates atoms');
    ok(XRegExp('^ [ #]+ $', 'x').test(' #'), 'Character classes do not use free-spacing');

    // TODO: Add tests
});

//-------------------------------------------------------------------
module('Cross-browser fixes');
//-------------------------------------------------------------------

test('Nonparticipating capture values', function () {
    expect(0);
    // TODO: Add tests
});

test('RegExp.prototype.lastIndex', function () {
    expect(0);
    // TODO: Add tests
});

test('String.prototype.split with regex separator', function () {
    XRegExp.install('natives');

    // Some of these tests are not known to fail (when using the native split) in any browser, but
    // many fail in at least one version of one browser

    deepEqual(''.split(), ['']);
    deepEqual(''.split(/./), ['']);
    deepEqual(''.split(/.?/), []);
    deepEqual(''.split(/.??/), []);
    deepEqual('ab'.split(/a*/), ['', 'b']);
    deepEqual('ab'.split(/a*?/), ['a', 'b']);
    deepEqual('ab'.split(/(?:ab)/), ['', '']);
    deepEqual('ab'.split(/(?:ab)*/), ['', '']);
    deepEqual('ab'.split(/(?:ab)*?/), ['a', 'b']);
    deepEqual('test'.split(''), ['t', 'e', 's', 't']);
    deepEqual('test'.split(), ['test']);
    deepEqual('111'.split(1), ['', '', '', '']);
    deepEqual('test'.split(/(?:)/, 2), ['t', 'e']);
    deepEqual('test'.split(/(?:)/, -1), ['t', 'e', 's', 't']);
    deepEqual('test'.split(/(?:)/, undefined), ['t', 'e', 's', 't']);
    deepEqual('test'.split(/(?:)/, null), []);
    deepEqual('test'.split(/(?:)/, NaN), []);
    deepEqual('test'.split(/(?:)/, true), ['t']);
    deepEqual('test'.split(/(?:)/, '2'), ['t', 'e']);
    deepEqual('test'.split(/(?:)/, 'two'), []);
    deepEqual('a'.split(/-/), ['a']);
    deepEqual('a'.split(/-?/), ['a']);
    deepEqual('a'.split(/-??/), ['a']);
    deepEqual('a'.split(/a/), ['', '']);
    deepEqual('a'.split(/a?/), ['', '']);
    deepEqual('a'.split(/a??/), ['a']);
    deepEqual('ab'.split(/-/), ['ab']);
    deepEqual('ab'.split(/-?/), ['a', 'b']);
    deepEqual('ab'.split(/-??/), ['a', 'b']);
    deepEqual('a-b'.split(/-/), ['a', 'b']);
    deepEqual('a-b'.split(/-?/), ['a', 'b']);
    deepEqual('a-b'.split(/-??/), ['a', '-', 'b']);
    deepEqual('a--b'.split(/-/), ['a', '', 'b']);
    deepEqual('a--b'.split(/-?/), ['a', '', 'b']);
    deepEqual('a--b'.split(/-??/), ['a', '-', '-', 'b']);
    deepEqual(''.split(/()()/), []);
    deepEqual('.'.split(/()()/), ['.']);
    deepEqual('.'.split(/(.?)(.?)/), ['', '.', '', '']);
    deepEqual('.'.split(/(.??)(.??)/), ['.']);
    deepEqual('.'.split(/(.)?(.)?/), ['', '.', undefined, '']);
    deepEqual('A<B>bold</B>and<CODE>coded</CODE>'.split(/<(\/)?([^<>]+)>/), ['A', undefined, 'B', 'bold', '/', 'B', 'and', undefined, 'CODE', 'coded', '/', 'CODE', '']);
    deepEqual('test'.split(/(.?)/), ['','t','','e','','s','','t','']);
    deepEqual('tesst'.split(/(s)*/), ['t', undefined, 'e', 's', 't']);
    deepEqual('tesst'.split(/(s)*?/), ['t', undefined, 'e', undefined, 's', undefined, 's', undefined, 't']);
    deepEqual('tesst'.split(/(s*)/), ['t', '', 'e', 'ss', 't']);
    deepEqual('tesst'.split(/(s*?)/), ['t', '', 'e', '', 's', '', 's', '', 't']);
    deepEqual('tesst'.split(/(?:s)*/), ['t', 'e', 't']);
    deepEqual('tesst'.split(/(?=s+)/), ['te', 's', 'st']);
    deepEqual('test'.split('t'), ['', 'es', '']);
    deepEqual('test'.split('es'), ['t', 't']);
    deepEqual('test'.split(/t/), ['', 'es', '']);
    deepEqual('test'.split(/es/), ['t', 't']);
    deepEqual('test'.split(/(t)/), ['', 't', 'es', 't', '']);
    deepEqual('test'.split(/(es)/), ['t', 'es', 't']);
    deepEqual('test'.split(/(t)(e)(s)(t)/), ['', 't', 'e', 's', 't', '']);
    deepEqual('.'.split(/(((.((.??)))))/), ['', '.', '.', '.', '', '', '']);
    deepEqual('.'.split(/(((((.??)))))/), ['.']);
    // Very large negative number test by Brian O
    deepEqual('a b c d'.split(/ /, -(Math.pow(2, 32) - 1)), ['a']);
    deepEqual('a b c d'.split(/ /, Math.pow(2, 32) + 1), ['a']);
    deepEqual('a b c d'.split(/ /, Infinity), []);

    XRegExp.uninstall('natives');
});

test('Regular expression syntax', function () {
    raises(function () {XRegExp('(?<n>1)(?<n>2)')}, SyntaxError, 'Multiple groups with same name throws');

    // TODO: Add tests
});

test('Replacement text syntax', function () {
    expect(0);
    // TODO: Add tests
});

test('Type conversion', function () {
    XRegExp.install('natives');

    // These are duplicated from String.prototype.replace tests in the overridden natives module
    equal(new String('100').replace(/0/, function ($0, pos, str) {return typeof str;}), '1string0', 'String.prototype.replace: typeof last argument in replacement function is string, when called on String as context');
    equal(String.prototype.replace.call(100, /0/, function ($0, pos, str) {return typeof str;}), '1string0', 'String.prototype.replace: typeof last argument in replacement function is string, when called on number as context');

    // TODO: Add tests

    XRegExp.uninstall('natives');
});

//-------------------------------------------------------------------
module('Addons');
//-------------------------------------------------------------------

test('Unicode Base', function () {
    ok(XRegExp.addUnicodeData, 'XRegExp.addUnicodeData exists');

    XRegExp.uninstall('extensibility');

    raises(function () {
            XRegExp.addUnicodeData([{name: 'Fail', bmp: '0'}]);
        }, Error, 'XRegExp.addUnicodeData throws when extensibility is not installed');

    XRegExp.install('extensibility');

    raises(function () {
            XRegExp.addUnicodeData([{bmp: '0'}]);
        }, Error, 'XRegExp.addUnicodeData throws when name not provided');
    raises(function () {
            XRegExp.addUnicodeData([{name: 'NoData'}]);
        }, Error, 'XRegExp.addUnicodeData throws when no bmp or astral data provided');

    XRegExp.addUnicodeData([{
        name: 'XDigit',
        alias: 'Hexadecimal',
        bmp: '0-9A-Fa-f'
    }]);
    ok(XRegExp('\\p{XDigit}\\p{Hexadecimal}').test('0F'), 'Added XDigit token with alias Hexadecimal');

    XRegExp.addUnicodeData([{
        name: 'NotXDigit',
        inverseOf: 'XDigit'
    }]);
    ok(XRegExp('\\p{NotXDigit}\\P{NotXDigit}').test('Z0'), 'Added NotXDigit token as inverse of XDigit');

    XRegExp.addUnicodeData([{
        name: 'MissingRef',
        inverseOf: 'MissingToken'
    }]);
    raises(function () {XRegExp('\\p{MissingRef}');}, ReferenceError, 'Missing inverseOf target throws error on use');

    XRegExp.addUnicodeData([{name: 'AstralOnly', astral: '0'}]);
    ok(XRegExp('\\p{AstralOnly}', 'A').test('0'), 'Astral-only token matches, when in astral mode');
    raises(function () {XRegExp('\\p{AstralOnly}');}, SyntaxError, 'Astral-only token is an error, when not in astral mode');

    XRegExp.addUnicodeData([{name: 'BmpOnly', bmp: '0'}]);
    ok(XRegExp('\\p{BmpOnly}').test('0'), 'BMP-only token matches, when not in astral mode');
    ok(XRegExp('\\p{BmpOnly}', 'A').test('0'), 'BMP-only token matches, when in astral mode');

    XRegExp.addUnicodeData([{name: 'BmpPlusAstral', bmp: '0', astral: '1'}]);
    ok(XRegExp('\\p{BmpPlusAstral}').test('0'), 'BMP+astral token matches BMP value, when not in astral mode');
    ok(!XRegExp('\\p{BmpPlusAstral}').test('1'), 'BMP+astral token does not match astral value, when not in astral mode');
    ok(XRegExp('\\p{BmpPlusAstral}', 'A').test('0'), 'BMP+astral token matches BMP value, when in astral mode');
    ok(XRegExp('\\p{BmpPlusAstral}', 'A').test('1'), 'BMP+astral token matches astral value, when in astral mode');

    XRegExp.uninstall('extensibility');

    raises(function () {XRegExp('\\pX');}, SyntaxError, 'Unrecognized Unicode name \\pX is an error');
    raises(function () {XRegExp('\\p{X}');}, SyntaxError, 'Unrecognized Unicode name \\p{X} is an error');
    raises(function () {XRegExp('\\p{^X}');}, SyntaxError, 'Unrecognized Unicode name \\p{^X} is an error');
    raises(function () {XRegExp('\\p{}');}, SyntaxError, 'Missing Unicode name \\p{} is an error');
    raises(function () {XRegExp('\\p{^}');}, SyntaxError, 'Missing Unicode name \\p{^} is an error');
    // Erroring on bare `\p` is actually handled by xregexp.js, not Unicode Base
    raises(function () {XRegExp('\\p');}, SyntaxError, 'Missing Unicode name \\p is an error');
    raises(function () {XRegExp('\\p^L');}, SyntaxError, 'Negated short form \\p^L is an error');
    ok(XRegExp('^\\p{L}+$').test('Café'), '\\p{L} matches Café');
    ok(XRegExp('^\\p{L}+$').test('Русский'), '\\p{L} matches Русский');
    ok(XRegExp('^\\p{L}+$').test('日本語'), '\\p{L} matches 日本語');
    ok(XRegExp('^\\p{L}+$').test('العربية'), '\\p{L} matches العربي');
    ok(XRegExp('^\\pL+$').test('Café'), '\\pL matches Café');
    ok(XRegExp('^\\p{Letter}+$').test('Café'), '\\p{Letter} is alias of \\p{L}');
    ok(!XRegExp('^\\pLetter+$').test('Café'), '\\pLetter+ does not match Café');
    ok(XRegExp('^\\pLetter+$').test('Aetterrr'), '\\pLetter+ matches Aetterrr');
    ok(XRegExp('^\\p{ _-l --}+$').test('Café'), 'Spaces, underscores, hyphens, and casing are ignored in Unicode token name');
    raises(function () {XRegExp('\\p{ ^L}');}, SyntaxError, 'Space before negating caret is an error');
    raises(function () {XRegExp('\\p{L+}');}, SyntaxError, 'Plus sign in name is an error');
    ok(!XRegExp('^\\P{L}+$').test('Café'), '\\P{L} does not match Café');
    ok(!XRegExp('^\\PL+$').test('Café'), '\\PL does not match Café');
    ok(XRegExp('^\\P{L}+$').test('1+(2-3)'), '\\P{L} matches 1+(2-3)');
    ok(XRegExp('^\\PL+$').test('1+(2-3)'), '\\PL matches 1+(2-3)');
    ok(!XRegExp('^\\p{^L}+$').test('Café'), '\\p{^L} does not match Café');
    ok(XRegExp('^\\p{^L}+$').test('1+(2-3)'), '\\p{^L} matches 1+(2-3)');
    raises(function () {XRegExp('\\P{^L}');}, SyntaxError, '\\P{^L} (double negation) is an error');
    raises(function () {XRegExp('[\\P{^L}]');}, SyntaxError, '\\P{^L} (double negation) is an error inside character class');
    raises(function () {XRegExp('[^\\P{^L}]');}, SyntaxError, '\\P{^L} (double negation) is an error inside negated character class');
    ok(XRegExp('^[\\p{L}]+$').test('Café'), '\\p{L} works inside character class');
    ok(XRegExp('^[\\pL]+$').test('Café'), '\\pL works inside character class');
    ok(!XRegExp('^[\\P{L}]+$').test('Café'), '\\P{L} works inside character class');
    ok(!XRegExp('^[\\PL]+$').test('Café'), '\\PL works inside character class');
    ok(!XRegExp('^[\\p{^L}]+$').test('Café'), '\\p{^L} works inside character class');
    ok(!XRegExp('^[^\\p{L}]+$').test('Café'), '\\p{L} works inside negated character class');
    ok(!XRegExp('^[^\\pL]+$').test('Café'), '\\pL works inside negated character class');
    ok(XRegExp('^[^\\P{L}]+$').test('Café'), '\\P{L} works inside negated character class');
    ok(XRegExp('^[^\\PL]+$').test('Café'), '\\PL works inside negated character class');
    ok(XRegExp('^[^\\p{^L}]+$').test('Café'), '\\p{^L} works inside negated character class');

    XRegExp.install('astral');

    ok(XRegExp('^\\p{L}$').test('\uD835\uDFCB'), '\\p{L} matches astral letter, in astral mode');
    ok(XRegExp('^\\pL$').test('\uD835\uDFCB'), '\\pL matches astral letter, in astral mode');
    ok(!XRegExp('^\\P{L}$').test('\uD835\uDFCB'), '\\P{L} does not match astral letter, in astral mode');
    ok(!XRegExp('^\\PL$').test('\uD835\uDFCB'), '\\PL does not match astral letter, in astral mode');
    ok(!XRegExp('^\\p{^L}$').test('\uD835\uDFCB'), '\\p{^L} does not match astral letter, in astral mode');
    raises(function () {XRegExp('[\\p{L}]');}, SyntaxError, 'Unicode token \\p{L} in character class is an error, in astral mode');
    raises(function () {XRegExp('[\\pL]');}, SyntaxError, 'Unicode token \\pL in character class is an error, in astral mode');
    raises(function () {XRegExp('\\P{^L}');}, SyntaxError, '\\P{^L} (double negation) is an error, in astral mode');

    XRegExp.uninstall('astral');

    ok(!XRegExp('^\\p{L}$').test('\uD835\uDFCB'), '\\p{L} does not match astral letter, in default (BMP) mode');
    ok(!XRegExp('^\\pL$').test('\uD835\uDFCB'), '\\pL does not match astral letter, in default (BMP) mode');
    ok(XRegExp('(?A)^\\p{L}$').test('\uD835\uDFCB'), '\\p{L} matches astral letter, with inline flag (?A)');
    ok(XRegExp('^\\p{L}$', 'A').test('\uD835\uDFCB'), '\\p{L} matches astral letter, with flag A');
    ok(!XRegExp('^\\P{L}$', 'A').test('\uD835\uDFCB'), '\\P{L} does not match astral letter, with flag A');
    ok(!XRegExp('^\\p{^L}$', 'A').test('\uD835\uDFCB'), '\\p{^L} does not match astral letter, with flag A');
    raises(function () {XRegExp('[\\p{L}]', 'A');}, SyntaxError, 'Unicode token in character class is an error, with flag A');
});

test('Unicode Categories', function () {
    // Tests for category L and Letter included in Unicode Base tests

    ok(XRegExp('\\p{P}').test('-'), '\\p{P} matches ASCII hyphen');
    ok(XRegExp('\\p{P}').test('\u00BF'), '\\p{P} matches U+00BF');
    ok(XRegExp('\\p{P}').test('\u301C'), '\\p{P} matches U+301C');
    ok(!XRegExp('\\p{P}').test('0'), '\\p{P} does not match 0');
    ok(XRegExp('\\p{Pe}').test(')'), '\\p{Pe} matches ASCII )');
    ok(XRegExp('\\p{Pe}').test('\u300B'), '\\p{Pe} matches U+300B');
    ok(!XRegExp('\\p{Pe}').test('0'), '\\p{Pe} does not match 0');
    ok(XRegExp('\\p{Sc}').test('$'), '\\p{Sc} matches $');
    ok(XRegExp('\\p{Sc}').test('\u20B9'), '\\p{Sc} matches U+20B9');
    ok(!XRegExp('\\p{Sc}').test('0'), '\\p{Sc} does not match 0');
    // Turkish Lira Sign U+20BA added in Unicode 6.2.0
    ok(XRegExp('\\p{Sc}').test('\u20BA'), '\\p{Sc} matches U+20BA (Unicode 6.2.0)');
    ok(!XRegExp('\\p{Cn}').test('\u20BA'), '\\p{Cn} does not match U+20BA (Unicode 6.2.0)');

    // TODO: Add tests
});

test('Unicode Scripts', function () {
    ok(XRegExp('^\\p{Katakana}+$').test('カタカナ'), '\\p{Katakana} matches カタカナ');
    ok(!XRegExp('^\\p{Katakana}+$').test('Latin'), '\\p{Katakana} does not match Latin');
    // U+065F moved from Inherited to Arabic script in Unicode 6.2.0
    ok(XRegExp('\\p{Arabic}').test('\u065F'), '\\p{Arabic} matches U+065F (Unicode 6.2.0)');
    ok(!XRegExp('\\p{Inherited}').test('\u065F'), '\\p{Inherited} does not match U+065F (Unicode 6.2.0)');

    // TODO: Add tests
});

test('Unicode Blocks', function () {
    XRegExp.install('astral');

    ok(XRegExp('^\\p{InBasic_Latin}$').test('A'), 'BMP-only block \\p{InBasic_Latin} matches A, in astral mode');
    ok(XRegExp('^\\p{InAegean_Numbers}$').test('\ud800\udd00'), 'Astral-only block \\p{InAegean_Numbers} matches U+10100, in astral mode');

    XRegExp.uninstall('astral');

    ok(XRegExp('^\\p{InBasic_Latin}$').test('A'), 'BMP-only block \\p{InBasic_Latin} matches A, in BMP mode');
    raises(function () {XRegExp('^\\p{InAegean_Numbers}$')}, SyntaxError, 'Astral-only block \\p{InAegean_Numbers} throws SyntaxError, in BMP mode');

    // TODO: Add tests
});

test('Unicode Properties', function () {
    ok(XRegExp('\\p{ASCII}').test('\0'), '\\p{ASCII} matches \\0');
    ok(XRegExp('\\p{ASCII}').test('\x7F'), '\\p{ASCII} matches \\x7F');
    ok(!XRegExp('\\p{ASCII}').test('\x80'), '\\p{ASCII} does not match \\x80');

    XRegExp.install('astral');

    ok(XRegExp('^\\p{Any}$').test('\uD800\uDC00'), '\\p{Any} matches surrogate pair, in astral mode');
    ok(XRegExp('\\p{Any}').test('\uD800'), '\\p{Any} matches orphan high surrogate, in astral mode');
    ok(XRegExp('\\p{Any}').test('\uDC00'), '\\p{Any} matches orphan low surrogate, in astral mode');
    ok(XRegExp('^\\p{Assigned}$').test('\uD800\uDC00'), '\\p{Assigned} matches U+10000, in astral mode');
    ok(!XRegExp('^\\P{Assigned}$').test('\uD800\uDC00'), '\\P{Assigned} does not match U+10000, in astral mode');

    XRegExp.uninstall('astral');

    ok(!XRegExp('^\\p{Any}$').test('\uD800\uDC00'), '\\p{Any} does not match surrogate pair, in BMP mode');
    ok(XRegExp('\\p{Any}').test('\uD800'), '\\p{Any} matches orphan high surrogate, in BMP mode');
    ok(XRegExp('\\p{Any}').test('\uDC00'), '\\p{Any} matches orphan low surrogate, in BMP mode');
    ok(XRegExp('\\p{Assigned}').test('A'), '\\p{Assigned} matches A, in BMP mode');
    ok(!XRegExp('\\P{Assigned}').test('A'), '\\P{Assigned} does not match A, in BMP mode');
    // Turkish Lira Sign U+20BA added in Unicode 6.2.0
    ok(XRegExp('\\p{Assigned}').test('\u20BA'), '\\p{Assigned} matches U+20BA (Unicode 6.2.0)');

    // TODO: Add tests
});

test('XRegExp.matchRecursive', function () {
    var str;

    ok(XRegExp.matchRecursive, 'XRegExp.matchRecursive exists');

    str = '(t((e))s)t()(ing)';
    deepEqual(XRegExp.matchRecursive(str, '\\(', '\\)', 'g'), ['t((e))s', '', 'ing'], 'Basic usage');

    str = 'Here is <div> <div>an</div></div> example';
    deepEqual(XRegExp.matchRecursive(str, '<div\\s*>', '</div>', 'gi', {
            valueNames: ['between', 'left', 'match', 'right']
        }), [
            {name: 'between', value: 'Here is ',       start: 0,  end: 8},
            {name: 'left',    value: '<div>',          start: 8,  end: 13},
            {name: 'match',   value: ' <div>an</div>', start: 13, end: 27},
            {name: 'right',   value: '</div>',         start: 27, end: 33},
            {name: 'between', value: ' example',       start: 33, end: 41}
        ], 'Extended information mode with valueNames');

    str = '...{1}\\{{function(x,y){return y+x;}}';
    deepEqual(XRegExp.matchRecursive(str, '{', '}', 'g', {
            valueNames: ['literal', null, 'value', null],
            escapeChar: '\\'
        }), [
            {name: 'literal', value: '...', start: 0, end: 3},
            {name: 'value',   value: '1',   start: 4, end: 5},
            {name: 'literal', value: '\\{', start: 6, end: 8},
            {name: 'value',   value: 'function(x,y){return y+x;}', start: 9, end: 35}
        ], 'Omitting unneeded parts with null valueNames, and using escapeChar');

    str = '<1><<<2>>><3>4<5>';
    deepEqual(XRegExp.matchRecursive(str, '<', '>', 'gy'), ['1', '<<2>>', '3'], 'Sticky mode via flag y');

    // TODO: Add tests
});

test('XRegExp.build', function () {
    ok(XRegExp.build, 'XRegExp.build exists');

    // Equivalent to `XRegExp('(?<n1>(?<yo>a)\\2)\\1(?<nX>(?<yo2>b)\\4)\\3()\\5\\1\\3\\k<nX>')`
    var built = XRegExp.build('({{n1}})\\1(?<nX>{{n2}})\\2()\\3\\1\\2\\k<nX>', {
            n1: XRegExp('(?<yo>a)\\1'),
            n2: XRegExp('(?<yo2>b)\\1')
        }),
        match = XRegExp.exec('aaaabbbbaabbbb', built);

    ok(match);
    equal(match.n1, 'aa');
    equal(match.n2, undefined);
    equal(match.nX, 'bb');
    equal(match.yo, 'a');
    equal(match.yo2, 'b');

    // IE 7 and 8 (not 6 or 9) throw an Error rather than SyntaxError
    raises(function () {XRegExp.build('(?x)({{a}})', {a: /#/});}, Error, 'Mode modifier in outer pattern applies to full regex with interpolated values (test 1)');
    equal(XRegExp.build('(?x){{a}}', {a: /1 2/}).test('12'), true, 'Mode modifier in outer pattern applies to full regex with interpolated values (test 2)');
    equal(XRegExp.build('(?m){{a}}', {a: /a/}).multiline, true, 'Mode modifier with native flag in outer pattern is applied to the final result');
    equal(XRegExp.build('^[{{a}}]$', {a: 'x'}).test('x'), false, 'Named subpattern not interpolated within character class (test 1)');
    equal(XRegExp.build('^{{a}}[{{a}}]$', {a: 'x'}).test('x{'), true, 'Named subpattern not interpolated within character class (test 2)');
    ok(XRegExp.build('{{x}}', {x: '^123$'}).test('123'), 'Leading ^ and trailing unescaped $ in subpattern (test 1)');
    ok(XRegExp.build('{{x}}', {x: '^123$'}).test('01234'), 'Leading ^ and trailing unescaped $ in subpattern (test 2)');
    ok(XRegExp.build('{{x}}', {x: '^123\\$'}).test('123$'), 'Leading ^ and trailing escaped $ in subpattern (test 1)');
    ok(!XRegExp.build('{{x}}', {x: '^123\\$'}).test('0123$4'), 'Leading ^ and trailing escaped $ in subpattern (test 2)');
    ok(XRegExp.build('{{x}}', {x: '^123'}).test('123'), 'Leading ^ without trailing unescaped $ in subpattern (test 1)');
    ok(!XRegExp.build('{{x}}', {x: '^123'}).test('01234'), 'Leading ^ without trailing unescaped $ in subpattern (test 2)');
    ok(XRegExp.build('{{x}}', {x: '123$'}).test('123'), 'Trailing unescaped $ without leading ^ in subpattern (test 1)');
    ok(!XRegExp.build('{{x}}', {x: '123$'}).test('01234'), 'Trailing unescaped $ without leading ^ in subpattern (test 2)');

    // TODO: Add tests
});

test('Prototypes', function () {
    var regex = XRegExp('x');

    ok(XRegExp.prototype.apply, 'XRegExp.prototype.apply exists');
    ok(regex.apply, 'apply exists for XRegExp instance');
    deepEqual(regex.apply(null, ['x']), regex.test('x'), 'Apply with match same as test');
    deepEqual(regex.apply(null, ['y']), regex.test('y'), 'Apply without match same as test');

    ok(XRegExp.prototype.call, 'XRegExp.prototype.call exists');
    ok(regex.call, 'call exists for XRegExp instance');
    deepEqual(regex.call(null, 'x'), regex.test('x'), 'Call with match same as test');
    deepEqual(regex.call(null, 'y'), regex.test('y'), 'Call without match same as test');

    ok(XRegExp.prototype.forEach, 'XRegExp.prototype.forEach exists');
    ok(regex.forEach, 'forEach exists for XRegExp instance');
    deepEqual(regex.forEach('x', function (m) {
            this.push(m);
        }, []), XRegExp.forEach('x', regex, function (m) {
            this.push(m);
        }, []), 'forEach method works like XRegExp.forEach');

    ok(XRegExp.prototype.globalize, 'XRegExp.prototype.globalize exists');
    ok(regex.globalize, 'globalize exists for XRegExp instance');
    deepEqual(regex.globalize(), XRegExp.globalize(regex), 'globalize method works like XRegExp.globalize');

    ok(XRegExp.prototype.match, 'XRegExp.prototype.match exists');
    ok(regex.match, 'match exists for XRegExp instance');
    deepEqual(regex.match('x x', 'all'), XRegExp.match('x x', regex, 'all'), 'match method works like XRegExp.match');

    ok(XRegExp.prototype.xexec, 'XRegExp.prototype.xexec exists');
    ok(regex.xexec, 'xexec exists for XRegExp instance');
    deepEqual(regex.xexec('x'), XRegExp.exec('x', regex), 'xexec method works like XRegExp.exec');

    ok(XRegExp.prototype.xtest, 'XRegExp.prototype.xtest exists');
    ok(regex.xtest, 'xtest exists for XRegExp instance');
    deepEqual(regex.xtest('x'), XRegExp.test('x', regex), 'xtest method works like XRegExp.test');
});
