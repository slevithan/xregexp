import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';
import replace from 'rollup-plugin-re';
import resolve from 'rollup-plugin-node-resolve';

const babelConfig = pkg.babel;
babelConfig.presets = babelConfig.presets.map(([name, options]) => {
    if (name !== 'env') {
        return [name, options];
    }
    return [name, Object.assign(options, {modules: false})];
});
babelConfig.plugins = [
    'external-helpers',
    ...babelConfig.plugins.filter((p) => p !== 'add-module-exports')
];

function getRollupObject({file, format = 'umd'} = {}) {
    return {
        input: 'src/index.js',
        output: {
            format,
            name: 'XRegExp',
            file: file || `dist/index-${format}.js`
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
}

export default [
    getRollupObject({file: 'xregexp-all.js'}),
    getRollupObject({
        format: 'es'
    })
];
