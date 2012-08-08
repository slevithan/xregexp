describe('XRegExp.build addon:', function() {

    describe('XRegExp.build()', function() {

        it('should apply a mode modifier in the outer pattern to the full regex with interpolated values', function() {
            expect(XRegExp.build('(?x){{a}}', {a: /1 2/}).test('12')).toBe(true);
            // IE 7 and 8 (not 6 or 9) throw an Error rather than SyntaxError
            expect(function() {XRegExp.build('(?x)({{a}})', {a: /#/});}).toThrow();
        });

        it('should apply a mode modifier with a native flag in the outer pattern to the final result', function() {
            expect(XRegExp.build('(?m){{a}}', {a: /a/}).multiline).toBe(true);
            expect(XRegExp.build('(?i){{a}}', {a: /a/}).ignoreCase).toBe(true);
        });

        it('should throw an exception when a mode modifier with g or y is used in the outer pattern', function() {
            expect(function() {XRegExp.build('(?g){{a}}', {a: /a/});}).toThrow(SyntaxError);
            expect(function() {XRegExp.build('(?y){{a}}', {a: /a/});}).toThrow(SyntaxError);
            expect(function() {XRegExp.build('(?migs){{a}}', {a: /a/});}).toThrow(SyntaxError);
        });

        it('should not interpolate named subpatterns within character classes', function() {
            expect(XRegExp.build('^[{{a}}]$', {a: 'x'}).test('x')).toBe(false);
            expect(XRegExp.build('^{{a}}[{{a}}]$', {a: 'x'}).test('x{')).toBe(true);
        });

        it('should strip a leading ^ and trailing unescaped $ in subpatterns, when both are present', function() {
            expect(XRegExp.build('{{x}}', {x: '^123$'}).test('01234')).toBe(true);
            expect(XRegExp.build('{{x}}', {x: /^123$/}).test('01234')).toBe(true);
        });

        it('should not strip a leading ^ and trailing unescaped $ in subpatterns, when both are not present', function() {
            expect(XRegExp.build('{{x}}', {x: '^123'}).test('123')).toBe(true);
            expect(XRegExp.build('{{x}}', {x: '^123'}).test('01234')).toBe(false);
            expect(XRegExp.build('{{x}}', {x: '123$'}).test('123')).toBe(true);
            expect(XRegExp.build('{{x}}', {x: '123$'}).test('01234')).toBe(false);
        });

        it('should not strip a trailing escaped $ in subpatterns', function() {
            expect(XRegExp.build('{{x}}', {x: '^123\\$'}).test('123$')).toBe(true);
            expect(XRegExp.build('{{x}}', {x: '^123\\$'}).test('0123$4')).toBe(false);
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
            expect(match.n2).toBe(undefined);
            expect(match.nX).toBe('bb');
            expect(match.yo).toBe('a');
            expect(match.yo2).toBe('b');
        });

    });

});
