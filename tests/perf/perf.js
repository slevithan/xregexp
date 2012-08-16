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

    function scrollToEnd() {
        window.scroll(0, document.body.scrollHeight);
    }

    bo.async = true;

    bso.onStart = function() {
        log('\n' + this.name + ':');
    };

    bso.onCycle = function(event) {
        log('\n' + String(event.target));
        scrollToEnd();
    };

    bso.onComplete = function() {
        log('\nFastest is ' + this.filter('fastest').pluck('name') + '\n');
        // Remove current suite from queue
        suites.shift();
        if (suites.length) {
            // Run next suite
            suites[0].run();
        } else {
            log('\nFinished. &#x263A;');
        }
        scrollToEnd();
    };

    // Start of perf suites...

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
            .add('Native exec', function() {
                regexG.lastIndex = pos;
                regexG.exec(strs[i++] || strs[i=0]);
            })
            .add('Shimmed exec', function() {
                regexG.lastIndex = pos;
                fixedExec.call(regexG, strs[i++] || strs[i=0]);
            })
            .add('XRegExp.exec', function() {
                XRegExp.exec(strs[i++] || strs[i=0], regexG, pos);
            })
        );

        suites.push(Benchmark.Suite('Sticky exec')
            .add('Sticky native exec', function() {
                regexG.lastIndex = pos;
                var match = regexG.exec(strs[i++] || strs[i=0]);
                if (match && match.index !== pos) {
                    match = null;
                }
            })
            .add('Sticky shimmed exec', function() {
                regexG.lastIndex = pos;
                var match = fixedExec.call(regexG, strs[i++] || strs[i=0]);
                if (match && match.index !== pos) {
                    match = null;
                }
            })
            .add('Sticky XRegExp.exec', function() {
                var match = XRegExp.exec(strs[i++] || strs[i=0], regexG, pos, 'sticky');
            })
        );
    }());

    (function() {
        var str = Array(50 + 1).join('hello world') + ' http://xregexp.com/path/to/file?q=1';
        var regexp = new RegExp('\\b([^:/?\\s]+)://([^/?\\s]+)([^?\\s]*)\\??([^\\s]*)');
        var xregexp = XRegExp('\\b([^:/?\\s]+)://([^/?\\s]+)([^?\\s]*)\\??([^\\s]*)');

        suites.push(Benchmark.Suite('Regex matching')
            .add('RegExp object', function() {
                regexp.exec(str);
            })
            .add('XRegExp object', function() {
                xregexp.exec(str);
            })
        );

        var xregexpNamed4 =
            XRegExp('\\b(?<scheme> [^:/?\\s]+ ) ://   # aka protocol   \n' +
                    '   (?<host>   [^/?\\s]+  )       # domain name/IP \n' +
                    '   (?<path>   [^?\\s]*   ) \\??  # optional path  \n' +
                    '   (?<query>  [^\\s]*    )       # optional query', 'x');
        var xregexpNamed1 =
            XRegExp('\\b(?<scheme> [^:/?\\s]+ ) ://   # aka protocol   \n' +
                    '   (          [^/?\\s]+  )       # domain name/IP \n' +
                    '   (          [^?\\s]*   ) \\??  # optional path  \n' +
                    '   (          [^\\s]*    )       # optional query', 'x');
        var xregexpNumbered =
            XRegExp('\\b( [^:/?\\s]+ ) ://   # aka protocol   \n' +
                    '   ( [^/?\\s]+  )       # domain name/IP \n' +
                    '   ( [^?\\s]*   ) \\??  # optional path  \n' +
                    '   ( [^\\s]*    )       # optional query', 'x');

        suites.push(Benchmark.Suite('Capturing')
            .add('Numbered capture', function() {
                XRegExp.exec(str, xregexpNumbered);
            })
            .add('Named capture (one name)', function() {
                XRegExp.exec(str, xregexpNamed1);
            })
            .add('Named capture (four names)', function() {
                XRegExp.exec(str, xregexpNamed4);
            })
        );
    }());

    suites.push(Benchmark.Suite('Unicode letter construction')
        .add('Incomplete set: /[A-Z]/i', function() {
            XRegExp('(?i)[A-Z]');
            XRegExp.cache.flush('patterns');
        })
        .add('BMP only: /\\pL/', function() {
            XRegExp('\\pL');
            XRegExp.cache.flush('patterns');
        })
        .add('Full Unicode: /\\pL/A', function() {
            XRegExp('(?A)\\pL');
            XRegExp.cache.flush('patterns');
        })
    );

    (function() {
        var asciiText = 'Now is the time for all good men to come to the aid of the party - Now is the time for all good men to come to the aid of the party - Now is the time for all good men to come to the aid of the party.';
        var mixedText = 'Daß dies das Leben sei, war eine Annahme, zu der Rönne, einen Arzt, das von leitender Stelle aus Geregelte seiner Tage, das staatliche Genehmigte, ja Vorgeschriebene seiner Bestimmung wohl berechtigte.';
        var unicodeText = 'Зоммерфельд получил ряд важных результатов в рамках «старой квантовой теории», предшествовавшей появлению современной квантовой механики: обобщил теорию Бора на случай эллиптических орбит с.';

        var azCaselessChar = XRegExp('(?i)[A-Z]\\.');
        var bmpLetterChar = XRegExp('\\pL\\.');
        var astralLetterChar = XRegExp('(?A)\\pL\\.');

        suites.push(Benchmark.Suite('Unicode letter matching')
            .add('/[A-Z]/i', function() {
                azCaselessChar.test(asciiText);
                azCaselessChar.test(mixedText);
                azCaselessChar.test(unicodeText);
            })
            .add('/\\pL/', function() {
                bmpLetterChar.test(asciiText);
                bmpLetterChar.test(mixedText);
                bmpLetterChar.test(unicodeText);
            })
            .add('/\\pL/A', function() {
                astralLetterChar.test(asciiText);
                astralLetterChar.test(mixedText);
                astralLetterChar.test(unicodeText);
            })
        );

        var azCaselessWord = XRegExp('(?i)[A-Z]+\\.');
        var bmpLetterWord = XRegExp('\\pL+\\.');
        var astralLetterWord = XRegExp('(?A)\\pL+\\.');

        suites.push(Benchmark.Suite('Unicode word matching')
            .add('/[A-Z]+/i', function() {
                azCaselessWord.test(asciiText);
                azCaselessWord.test(mixedText);
                azCaselessWord.test(unicodeText);
            })
            .add('/\\pL+/', function() {
                bmpLetterWord.test(asciiText);
                bmpLetterWord.test(mixedText);
                bmpLetterWord.test(unicodeText);
            })
            .add('/\\pL+/A', function() {
                astralLetterWord.test(asciiText);
                astralLetterWord.test(mixedText);
                astralLetterWord.test(unicodeText);
            })
        );
    }());

    run();
}());
