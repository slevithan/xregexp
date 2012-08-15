(function() {
    var outputEl = document.getElementById('log');
    var suites = [];
    var bo = Benchmark.options;
    var bso = Benchmark.Suite.options;

    function log(msg) {
        outputEl.innerHTML += msg.replace(/\n/g, '<br>');
    }

    function run() {
        log('Sit back and relax; this might take a while.\n');
        suites[0].run();
    }

    bo.async = true;

    bso.onStart = function() {
        log('\n' + this.name + ':');
    };

    bso.onCycle = function(event) {
        log('\n' + String(event.target));
    };

    bso.onComplete = function() {
        log('\nFastest is ' + this.filter('fastest').pluck('name') + '\n');
        // Remove current suite from queue
        suites.shift();
        if (suites.length) {
            // Run next suite
            suites[0].run();
        } else {
            log('\nFinished.');
        }
    };

    (function() {
        var pattern = '^([.])\\1+$';

        suites.push(Benchmark.Suite('Constructor')
            .add('XRegExp with pattern cache flush', function() {
                XRegExp(pattern, 'g');
                XRegExp.cache.flush('patterns');
            })
            .add('XRegExp', function() {
                XRegExp(pattern, 'g');
            })
            .add('XRegExp.cache', function() {
                XRegExp.cache(pattern, 'g');
            })
            .add('RegExp', function() {
                new RegExp(pattern, 'g');
            })
        );
    }());

    (function() {
        var regexG = /(\b(?=x).(?=x).()??\2)+/g;
        var str = Array(50 + 1).join('hello x world') + ' xx!';
        var strs = [];
        var pos = 5;

        XRegExp.install('natives');
        var fixedExec = RegExp.prototype.exec;
        XRegExp.uninstall('natives');

        // Use lots of different strings so Opera can't cheat with its regex/string match cache
        for (var i = 0; i < 1e5; ++i) {
            strs.push(str + i);
        }

        suites.push(Benchmark.Suite('exec')
            .add('native exec', function() {
                regexG.lastIndex = pos;
                regexG.exec(strs[i++] || strs[i=0]);
            })
            .add('shimmed exec', function() {
                regexG.lastIndex = pos;
                fixedExec.call(regexG, strs[i++] || strs[i=0]);
            })
            .add('XRegExp.exec', function() {
                XRegExp.exec(strs[i++] || strs[i=0], regexG, pos);
            })
        );

        suites.push(Benchmark.Suite('Sticky exec')
            .add('sticky native exec', function() {
                regexG.lastIndex = pos;
                var match = regexG.exec(strs[i++] || strs[i=0]);
                if (match && match.index !== pos) {
                    match = null;
                }
            })
            .add('sticky shimmed exec', function() {
                regexG.lastIndex = pos;
                var match = fixedExec.call(regexG, strs[i++] || strs[i=0]);
                if (match && match.index !== pos) {
                    match = null;
                }
            })
            .add('sticky XRegExp.exec', function() {
                var match = XRegExp.exec(strs[i++] || strs[i=0], regexG, pos, 'sticky');
            })
        );
    }());

    run();
}());
