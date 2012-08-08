describe('Prototypes addon:', function() {

    function hasMethod(name) {
        expect(typeof XRegExp.prototype[name]).toBe('function');
        expect(typeof new XRegExp('')[name]).toBe('function');
        expect(typeof XRegExp('')[name]).toBe('function');
        expect(typeof XRegExp(XRegExp(''))[name]).toBe('function');
        expect(typeof XRegExp.globalize(XRegExp(''))[name]).toBe('function');
    }

    describe('XRegExp.prototype.apply()', function() {

        it('should be available for an XRegExp instance', function() {
            hasMethod('apply');
        });

        it('should produce the same result as RegExp.prototype.test()', function() {
            var regex = XRegExp('x');
            expect(regex.apply(null, ['x'])).toBe(regex.test('x'));
            expect(regex.apply(null, ['y'])).toBe(regex.test('y'));
        });

    });

    describe('XRegExp.prototype.call()', function() {

        it('should be available for an XRegExp instance', function() {
            hasMethod('call');
        });

        it('should produce the same result as RegExp.prototype.test()', function() {
            var regex = XRegExp('x');
            expect(regex.call(null, 'x')).toBe(regex.test('x'));
            expect(regex.call(null, 'y')).toBe(regex.test('y'));
        });

    });

    describe('XRegExp.prototype.forEach()', function() {

        it('should be available for an XRegExp instance', function() {
            hasMethod('forEach');
        });

        it('should work like XRegExp.forEach()', function() {
            var regex = XRegExp('x');
            expect(
                regex.forEach('x', function(m) {
                    this.push(m);
                }, [])
            ).toEqual(
                XRegExp.forEach('x', regex, function(m) {
                    this.push(m);
                }, [])
            );
        });

    });

    describe('XRegExp.prototype.globalize()', function() {

        it('should be available for an XRegExp instance', function() {
            hasMethod('globalize');
        });

        it('should work like XRegExp.globalize()', function() {
            var regex = XRegExp('x');
            expect(regex.globalize()).toBeEquiv(XRegExp.globalize(regex));
        });

    });

    describe('XRegExp.prototype.match()', function() {

        it('should be available for an XRegExp instance', function() {
            hasMethod('match');
        });

        it('should work like XRegExp.match()', function() {
            var regex = XRegExp('x');
            expect(regex.match('x x', 'all')).toEqual(XRegExp.match('x x', regex, 'all'));
        });

    });

    describe('XRegExp.prototype.xexec()', function() {

        it('should be available for an XRegExp instance', function() {
            hasMethod('xexec');
        });

        it('should work like XRegExp.xexec()', function() {
            var regex = XRegExp('x');
            expect(regex.xexec('x')).toEqual(XRegExp.exec('x', regex));
        });

    });

    describe('XRegExp.prototype.xtest()', function() {

        it('should be available for an XRegExp instance', function() {
            hasMethod('xtest');
        });

        it('should work like XRegExp.xtest()', function() {
            var regex = XRegExp('x');
            expect(regex.xtest('x')).toEqual(XRegExp.test('x', regex));
        });

    });

});
