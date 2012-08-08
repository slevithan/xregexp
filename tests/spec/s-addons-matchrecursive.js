describe('XRegExp.matchRecursive addon:', function() {

    describe('XRegExp.matchRecursive()', function() {

        it('should pass the readme example for basic usage', function() {
            var str = '(t((e))s)t()(ing)';
            expect(XRegExp.matchRecursive(str, '\\(', '\\)', 'g')).toEqual(['t((e))s', '', 'ing']);
        });

        it('should pass the readme example for extended information mode with valueNames', function() {
            var str = 'Here is <div> <div>an</div></div> example';
            expect(
                XRegExp.matchRecursive(str, '<div\\s*>', '</div>', 'gi', {
                    valueNames: ['between', 'left', 'match', 'right']
                }))
            .toEqual([
                {name: 'between', value: 'Here is ',       start: 0,  end: 8},
                {name: 'left',    value: '<div>',          start: 8,  end: 13},
                {name: 'match',   value: ' <div>an</div>', start: 13, end: 27},
                {name: 'right',   value: '</div>',         start: 27, end: 33},
                {name: 'between', value: ' example',       start: 33, end: 41}
            ]);
        });

        it('should pass the readme example for omitting unneeded parts with null valueNames, and using escapeChar', function() {
            var str = '...{1}\\{{function(x,y){return y+x;}}';
            expect(
                XRegExp.matchRecursive(str, '{', '}', 'g', {
                    valueNames: ['literal', null, 'value', null],
                    escapeChar: '\\'
                }))
            .toEqual([
                {name: 'literal', value: '...', start: 0, end: 3},
                {name: 'value',   value: '1',   start: 4, end: 5},
                {name: 'literal', value: '\\{', start: 6, end: 8},
                {name: 'value',   value: 'function(x,y){return y+x;}', start: 9, end: 35}
            ]);
        });

        it('should pass the readme example for sticky mode via flag y', function() {
            var str = '<1><<<2>>><3>4<5>';
            expect(XRegExp.matchRecursive(str, '<', '>', 'gy')).toEqual(['1', '<<2>>', '3']);
        });

        // TODO: Add complete specs

    });

});
