beforeEach(function() {
    global.resetFeatures();
    global.addToEqualMatchMatcher();
});

describe('XRegExp.matchRecursive addon:', function() {

    describe('XRegExp.matchRecursive()', function() {

        it('should pass the readme example for basic usage', function() {
            const str = '(t((e))s)t()(ing)';
            expect(XRegExp.matchRecursive(str, '\\(', '\\)', 'g')).toEqual(['t((e))s', '', 'ing']);
        });

        it('should pass the readme example for extended information mode with valueNames', function() {
            const str = 'Here is <div> <div>an</div></div> example';
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

        it('should pass the readme example for omitting unneeded parts with null valueNames and using escapeChar', function() {
            const str = '...{1}.\\{{function(x,y){return {y:x}}}';
            expect(
                XRegExp.matchRecursive(str, '{', '}', 'g', {
                    valueNames: ['literal', null, 'value', null],
                    escapeChar: '\\'
                }))
                .toEqual([
                    {name: 'literal', value: '...',  start: 0, end: 3},
                    {name: 'value',   value: '1',    start: 4, end: 5},
                    {name: 'literal', value: '.\\{', start: 6, end: 9},
                    {name: 'value',   value: 'function(x,y){return {y:x}}', start: 10, end: 37}
                ]);
        });

        it('should pass the readme example for sticky mode via flag y', function() {
            const str = '<1><<<2>>><3>4<5>';
            expect(XRegExp.matchRecursive(str, '<', '>', 'gy')).toEqual(['1', '<<2>>', '3']);
        });

        it('should pass the readme example for unbalanced delimiters', function() {
            const str = 'Here is <div> <div>an</div> unbalanced example';
            expect(XRegExp.matchRecursive(str, '<div\\s*>', '</div>', 'gi', {
                unbalanced: 'skip'
            })).toEqual(['an']);
        });

        it('should throw for unbalanced left delimiter in first match without flag g', function() {
            expect(function() {XRegExp.matchRecursive('<', '<', '>');}).toThrow();
            expect(function() {XRegExp.matchRecursive('<<>', '<', '>');}).toThrow();
        });

        it('should not throw for unbalanced left delimiter after first match without flag g', function() {
            expect(function() {XRegExp.matchRecursive('<><', '<', '>');}).not.toThrow();
        });

        it('should throw for unbalanced left delimiter anywhere in string with flag g', function() {
            expect(function() {XRegExp.matchRecursive('<', '<', '>', 'g');}).toThrow();
            expect(function() {XRegExp.matchRecursive('<<>', '<', '>', 'g');}).toThrow();
            expect(function() {XRegExp.matchRecursive('<><', '<', '>', 'g');}).toThrow();
            expect(function() {XRegExp.matchRecursive('.<.<>><', '<', '>', 'g');}).toThrow();
        });

        it('should throw for unbalanced right delimiter in first match without flag g', function() {
            expect(function() {XRegExp.matchRecursive('>', '<', '>');}).toThrow();
        });

        it('should not throw for unbalanced right delimiter after first match without flag g', function() {
            expect(function() {XRegExp.matchRecursive('<>>', '<', '>');}).not.toThrow();
        });

        it('should throw for unbalanced right delimiter anywhere in string with flag g', function() {
            expect(function() {XRegExp.matchRecursive('>', '<', '>', 'g');}).toThrow();
            expect(function() {XRegExp.matchRecursive('<>>', '<', '>', 'g');}).toThrow();
            expect(function() {XRegExp.matchRecursive('.<.<>>>', '<', '>', 'g');}).toThrow();
        });

        it('should handle unbalanced left delimiter with option unbalanced set to skip', function() {
            const matches = XRegExp.matchRecursive('<><<.>', '<', '>', 'g', {unbalanced: 'skip'});
            expect(matches).toEqual(['', '.']);
            const vnMatches = XRegExp.matchRecursive('<><<.>', '<', '>', 'g', {unbalanced: 'skip', valueNames: ['between', 'left', 'match', 'right']});
            expect(vnMatches).toEqual([
                {name: 'left',    value: '<', start: 0, end: 1},
                {name: 'match',   value: '',  start: 1, end: 1},
                {name: 'right',   value: '>', start: 1, end: 2},
                {name: 'between', value: '<', start: 2, end: 3},
                {name: 'left',    value: '<', start: 3, end: 4},
                {name: 'match',   value: '.', start: 4, end: 5},
                {name: 'right',   value: '>', start: 5, end: 6}
            ]);
        });

        it('should handle unbalanced right delimiter with option unbalanced set to skip', function() {
            const matches = XRegExp.matchRecursive('.<>>', '<', '>', 'g', {unbalanced: 'skip'});
            expect(matches).toEqual(['']);
            const vnMatches = XRegExp.matchRecursive('.<>>', '<', '>', 'g', {unbalanced: 'skip', valueNames: ['between', 'left', 'match', 'right']});
            expect(vnMatches).toEqual([
                {name: 'between', value: '.', start: 0, end: 1},
                {name: 'left',    value: '<', start: 1, end: 2},
                {name: 'match',   value: '',  start: 2, end: 2},
                {name: 'right',   value: '>', start: 2, end: 3},
                {name: 'between', value: '>', start: 3, end: 4}
            ]);
        });

        it('should handle unbalanced overlapping multichar left delimiter with option unbalanced set to skip', function() {
            const matches = XRegExp.matchRecursive('<<<<.>>', '<<', '>>', 'g', {
                unbalanced: 'skip',
                valueNames: ['between', 'left', 'match', 'right']
            });
            expect(matches).toEqual([
                {name: 'between', value: '<<', start: 0, end: 2},
                {name: 'left',    value: '<<', start: 2, end: 4},
                {name: 'match',   value: '.',  start: 4, end: 5},
                {name: 'right',   value: '>>', start: 5, end: 7}
            ]);
        });

        it('should handle unbalanced overlapping multichar left delimiter with option unbalanced set to skip-lazy', function() {
            const matches = XRegExp.matchRecursive('<<<<.>>', '<<', '>>', 'g', {
                unbalanced: 'skip-lazy',
                valueNames: ['between', 'left', 'match', 'right']
            });
            expect(matches).toEqual([
                {name: 'between', value: '<',  start: 0, end: 1},
                {name: 'left',    value: '<<', start: 1, end: 3},
                {name: 'match',   value: '<.', start: 3, end: 5},
                {name: 'right',   value: '>>', start: 5, end: 7}
            ]);
        });

        it('should handle zero-length delimiters', function() {
            expect(XRegExp.matchRecursive('<>', '(?=<)', '$')).toEqual(['<>']);
        });

        it('should handle unbalanced zero-length delimiters', function() {
            expect(function() {XRegExp.matchRecursive('<>', '(?=.)', '(?:)');}).toThrow();
            expect(XRegExp.matchRecursive('<>', '(?=.)', '(?:)', '', {unbalanced: 'skip'})).toEqual(['>']);
        });

        it('should return an empty array if no matches', function() {
            expect(XRegExp.matchRecursive('.', '<', '>')).toEqual([]);
            expect(XRegExp.matchRecursive('.', '<', '>', 'g')).toEqual([]);
            expect(
                XRegExp.matchRecursive('.', '<', '>', '', {
                    valueNames: ['between', 'left', 'match', 'right']
                })
            ).toEqual([]);
            expect(
                XRegExp.matchRecursive('.', '<', '>', 'g', {
                    valueNames: ['between', 'left', 'match', 'right']
                })
            ).toEqual([]);
        });

    });

});
