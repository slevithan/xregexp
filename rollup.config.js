'use strict';
const pkg = require('./package.json');
const { join } = require('path');
const babel = require('rollup-plugin-babel');
const commonjs = require('@rollup/plugin-commonjs');
const { eslint } = require('rollup-plugin-eslint');

module.exports = {
    // Source code
    input: './src/index.js',

    // Output formats:
    output: [
        {
            banner,
            // umd covers most people.
            // It will:
            //  - define a global XRegExp if included as a script,
            //  - return XRegExp from a require()
            //  - export "default" XRegExp from esm-commonjs-interop.
            format: 'umd',
            // This defines the Global var for script tag usages
            name: 'XRegExp',

            file: './xregexp-all.js',

            // Informs rollup that external module references should come form a global variable.
            // For example, all `import $ from 'jquery'` reduce to `const $ = global.$;`
            globals: {
                // 'moduleId': 'globalVarName',
                // 'jquery': '$'
            },
        },
        {
            banner,
            // This will produce an esm module bundle.
            format: 'esm',
            file: './index.mjs'
        }
    ],

    // This function tells rollup what _NOT_ to include in bundle.
    // This will prevent any dependencies from getting "staticly-linked"...
    // allowing them to be added independently. If we need to add dependencies,
    // we should use the `output.[].globals` config.
    external: (id) => id.startsWith(join(__dirname, 'node_modules')),

    plugins: [
        // Enable referencing commonjs code. (also enables node's
        // node_module resolution algorithm)
        commonjs(),

        // Verify lint rules during build
        eslint({
            exclude: 'node_modules/**',
            throwOnError: true
        }),

        // Transform source to ES5
        babel({
            exclude: 'node_modules/**',
            // bundle the runtime into our bundle (same benefit as using
            // runtime, without adding a dependency)
            runtimeHelpers: true
        })
    ]
};


function banner() {
    return `
/*!
 * XRegExp ${pkg.version}
 * <xregexp.com>
 * Steven Levithan (c) 2007-present MIT License
 */

/**
 * XRegExp provides augmented, extensible regular expressions. You get additional regex syntax and
 * flags, beyond what browsers support natively. XRegExp is also a regex utility belt with tools to
 * make your client-side grepping simpler and more powerful, while freeing you from related
 * cross-browser inconsistencies.
 */
`;
}
