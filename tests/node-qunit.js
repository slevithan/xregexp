// Use node-qunit to run the tests
var qunit = require('qunit');

qunit.run({
    code: {
        namespace: 'XRegExp',
        path: __dirname + '/../xregexp-all.js'
    },
    tests: __dirname + '/tests.js'
});
