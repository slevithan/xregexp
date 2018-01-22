beforeEach(function() {
    global.disableOptInFeatures();
    global.addToEqualMatchMatcher();
});

describe('XRegExp.build addon:', function() {

    describe('XRegExp.tag()', function() {

        it('should escape the metacharacters of interpolated strings', function() {
            var inner = '.html';
            var re = XRegExp.tag()`^index${inner}$`;

            expect(re.test('index.html')).toBe(true);
            expect(re.test('index-html')).toBe(false);
        });

        it('should rewrite the backreferences of interpolated regexes', function() {
            var inner = /(.)\1/;
            var re = XRegExp.tag()`^${inner}${inner}$`;

            expect(re.test('aabb')).toBe(true);
            expect(re.test('aaba')).toBe(false);
        });

        it('should treat interpolated strings as atomic tokens', function() {
            var inner = 'ab';
            var re = XRegExp.tag()`^${inner}+$`;

            expect(re.test('abab')).toBe(true);
            expect(re.test('abb')).toBe(false);
        });

        it('should treat interpolated regexes as atomic tokens', function() {
            var inner = /ab/;
            var re = XRegExp.tag()`^${inner}+$`;

            expect(re.test('abab')).toBe(true);
            expect(re.test('abb')).toBe(false);
        });

        it('should support the "x" flag', function() {
            var inner = /ab/;
            var re = XRegExp.tag('x')`
                ^
                ${inner}
                +
                $
            `;

            expect(re.test('abab')).toBe(true);
            expect(re.test('abb')).toBe(false);
        });

        it('should support the "n" flag', function() {
            var inner = XRegExp('(unnamed), (?<name>named)');
            var re = XRegExp.tag('n')`${inner}`;

            expect(re.exec('unnamed, named')[1]).toBe('named');
        });

        it('should support the "g" flag', function() {
            var inner = 'a';
            var re = XRegExp.tag('g')`${inner}`;

            expect('aaa'.match(re)).toEqual(['a', 'a', 'a']);
        });

        it('should allow `false` to be interpolated', function() {
            var inner = false;
            var re = XRegExp.tag()`^${inner}$`;

            expect(re.test('false')).toBe(true);
        });

        it('should allow unescaped character classes', function() {
            var re = XRegExp.tag()`\d`;

            expect(re.test('1')).toBe(true);
        });

        it('should work as described in the comment @example', function() {
            var h12 = /1[0-2]|0?[1-9]/;
            var h24 = /2[0-3]|[01][0-9]/;
            var hours = XRegExp.tag('x')`${h12} : | ${h24}`;
            var minutes = /^[0-5][0-9]$/;
            var time = XRegExp.tag('x')`^ ${hours} (?<minutes>${minutes}) $`;

            expect(time.test('10:59')).toBe(true);
            expect(XRegExp.exec('10:59', time).minutes).toEqual('59');
        });

    });

    describe('XRegExp.build()', function() {

        it('should apply a mode modifier in the outer pattern to the full regex with interpolated values', function() {
            expect(XRegExp.build('(?x){{a}}', {a: /1 2/}).test('12')).toBe(true);
            // IE 7 and 8 (not 6 or 9) throw an Error rather than SyntaxError
            expect(function() {XRegExp.build('(?x)({{a}})', {a: /#/});}).toThrow();
        });

        it('should ignore newlines when using flag x', function() {
            expect(XRegExp.build('(?x)\n', {}).test('')).toBe(true);
            expect(XRegExp.build('\n', {}, 'x').test('')).toBe(true);
            expect(XRegExp.build('{{sub}}', {sub: '\n'}, 'x').test('')).toBe(true);
        });

        it('should apply a mode modifier with a native flag in the outer pattern to the final result', function() {
            expect(XRegExp.build('(?m){{a}}', {a: /a/}).multiline).toBe(true);
            expect(XRegExp.build('(?i){{a}}', {a: /a/}).ignoreCase).toBe(true);
        });

        it('should throw an exception when a mode modifier with g or y is used in the outer pattern', function() {
            expect(function() {XRegExp.build('(?g){{a}}', {a: /a/});}).toThrowError(SyntaxError);
            expect(function() {XRegExp.build('(?y){{a}}', {a: /a/});}).toThrowError(SyntaxError);
            expect(function() {XRegExp.build('(?migs){{a}}', {a: /a/});}).toThrowError(SyntaxError);
        });

        it('should not interpolate named subpatterns within character classes', function() {
            expect(XRegExp.build('^[{{a}}]$', {a: 'x'}).test('x')).toBe(false);
            expect(XRegExp.build('^{{a}}[{{a}}]$', {a: 'x'}).test('x{')).toBe(true);
        });

        it('should strip a leading ^ and trailing unescaped $ in subpatterns, when both are present', function() {
            expect(XRegExp.build('{{x}}', {x: /^123$/}).test('01234')).toBe(true);
            expect(XRegExp.build('{{x}}', {x: '^123$'}).test('01234')).toBe(true);
            expect(
                XRegExp.build(
                    ' (?#comment) {{sub}} ',
                    {sub: XRegExp(' (?#comment) ^123$ ', 'x')},
                    'x'
                ).test('01234')
            ).toBe(true);
        });

        it('should not strip a leading ^ and trailing unescaped $ in subpatterns, when both are not present', function() {
            expect(XRegExp.build('{{x}}', {x: '^123'}).test('123')).toBe(true);
            expect(XRegExp.build('{{x}}', {x: '^123'}).test('01234')).toBe(false);
            expect(XRegExp.build('{{x}}', {x: '123$'}).test('123')).toBe(true);
            expect(XRegExp.build('{{x}}', {x: '123$'}).test('01234')).toBe(false);
        });

        it('should not strip a leading ^ and trailing unescaped $ in subpatterns, when both are present but not leading/trailing', function() {
            expect(XRegExp.build('{{x}}', {x: '^1$'}).test('11')).toBe(true);
            expect(XRegExp.build('{{x}}', {x: '^1$\\b'}).test('11')).toBe(false);
        });

        it('should not strip a trailing escaped $ in subpatterns', function() {
            expect(XRegExp.build('{{x}}', {x: '^123\\$'}).test('123$')).toBe(true);
            expect(XRegExp.build('{{x}}', {x: '^123\\$'}).test('0123$4')).toBe(false);
        });

        it('should support flag n with mixed named and unnamed groups', function() {
            expect(function() {XRegExp.build('()(?<n>)\\k<n>', {}, 'n');}).not.toThrow();
            expect(function() {XRegExp.build('{{a}}', {a: '()(?<n>)\\k<n>'}, 'n');}).not.toThrow();
            expect(function() {XRegExp.build('()(?<x>)\\k<x>{{a}}', {a: '()(?<n>)\\k<n>'}, 'n');}).not.toThrow();
        });

        // TODO: Add complete specs

        it('should pass the readme example', function() {
            var time = XRegExp.build('(?x)^ {{hours}} ({{minutes}}) $', {
                hours: XRegExp.build('{{h12}} : | {{h24}}', {
                    h12: /1[0-2]|0?[1-9]/,
                    h24: /2[0-3]|[01][0-9]/
                }),
                minutes: /^[0-5][0-9]$/
            });

            expect(time.test('10:59')).toBe(true);
            expect(XRegExp.exec('10:59', time).minutes).toBe('59');
        });

        it('should pass a series of complex backreference rewrites', function() {
            // Equivalent to: XRegExp('(?<n1>(?<yo>a)\\2)\\1(?<nX>(?<yo2>b)\\4)\\3()\\5\\1\\3\\k<nX>')
            var built = XRegExp.build('({{n1}})\\1(?<nX>{{n2}})\\2()\\3\\1\\2\\k<nX>', {
                n1: XRegExp('(?<yo>a)\\1'),
                n2: XRegExp('(?<yo2>b)\\1')
            });
            var match = XRegExp.exec('aaaabbbbaabbbb', built);

            expect(match).toBeTruthy();
            expect(match.n1).toBe('aa');
            expect(match.n2).toBeUndefined();
            expect(match.nX).toBe('bb');
            expect(match.yo).toBe('a');
            expect(match.yo2).toBe('b');
        });

    });

});
