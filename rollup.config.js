import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import {minify} from 'uglify-es';
import pkg from './package.json';
import replace from 'rollup-plugin-re';
import resolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';

const babelConfig = pkg.babel;
babelConfig.presets[0][1].modules = false;
babelConfig.plugins.splice(0, 1); // Get rid of add-module-exports

function getRollupObject({file, minifying = false, format = 'umd'} = {}) {
    const nonMinified = {
        input: 'src/index.js',
        output: {
            format,
            sourcemap: minifying,
            name: 'XRegExp',
            file: file || `dist/index-${format}${minifying ? '.min' : ''}.js`
        },
        plugins: [
            replace({
                patterns: [
                    {
                        match: /tools\/output/,
                        test: 'module.exports = [',
                        replace: 'export default ['
                    }
                ]
            }),
            babel(
                Object.assign(
                    {
                        babelrc: false
                    },
                    babelConfig
                )
            ),
            resolve(),
            commonjs()
        ]
    };
    if (minifying) {
        nonMinified.plugins.push(uglify(null, minify));
    }
    return nonMinified;
}

export default [
    getRollupObject({file: 'xregexp-all.js'}),
    getRollupObject(),
    getRollupObject({
        minifying: true
    }),
    getRollupObject({
        format: 'es'
    }),
    getRollupObject({
        minifying: true,
        format: 'es'
    })
];
