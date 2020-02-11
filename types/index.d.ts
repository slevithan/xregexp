// Definitions by: Bart van der Schoor <https://github.com/Bartvds>,
//                 Johannes Fahrenkrug <https://github.com/jfahrenkrug>
//                 Mateusz Jagiełło <https://github.com/sigo>

export = xregexp;

declare function xregexp(pattern: string, flags?: string): RegExp;
declare function xregexp(pattern: RegExp): RegExp;

declare namespace xregexp {
    interface TokenOpts {
        /**
         * 'default', 'class', or 'all'
         */
        scope?: string;
        trigger?: () => boolean;
        /**
         * Native flags:
         * g - global
         * i - ignore case
         * m - multiline anchors
         * y - sticky (Firefox 3+)
         *
         * Additional XRegExp flags:
         * n - explicit capture
         * s - dot matches all (aka singleline)
         * x - free-spacing and line comments (aka extended)
         */
        customFlags?: string;
    }

    interface UnicodeData {
        name: string;
        alias?: string;
        isBmpLast?: boolean;
        inverseOf?: string;
        bmp?: string;
        astral?: string;
    }

    const version: string;

    function addToken(regex: RegExp, handler: (matchArr: RegExpExecArray, scope: string) => string, options?: TokenOpts): void;

    function addUnicodeData(data: UnicodeData[]): void;

    function build(pattern: string, subs: string[] | {[name: string]: RegExp}, flags?: string): RegExp;

    function cache(pattern: string, flags?: string): RegExp;

    function escape(str: string): string;

    function exec(str: string, regex: RegExp, pos?: number, sticky?: boolean): RegExpExecArray;

    function forEach(str: string, regex: RegExp, callback: (matchArr: RegExpExecArray, index: number, input: string, regexp: RegExp) => void): void;

    function globalize(regex: RegExp): RegExp;

    function install(options: string | object): void;

    function isInstalled(feature: string): boolean;

    function isRegExp(value: any): boolean;

    function match(str: string, regex: RegExp, scope?: string): string | string[];
    function match(str: string, regex: RegExp, scope: "one"): string;
    function match(str: string, regex: RegExp, scope: "all"): string[];

    function matchChain(str: string, chain: RegExp[] | Array<{ regex: RegExp; backref: string | number }>): string[];

    function matchRecursive(str: string, left: string, right: string, flags?: string, options?: object): string[];

    function replace(str: string, search: string | RegExp, replacement: string | ((...args: any[]) => string), scope?: string): string;

    function replaceEach(str: string, replacements: Array<Array<RegExp | string>>): string;

    function split(str: string, separator: string | RegExp, limit?: number): string[];

    function tag(flags: string): (literals: TemplateStringsArray, ...substitutions: RegExp[]) => RegExp;

    function test(str: string, regex: RegExp, pos?: number, sticky?: boolean): boolean;

    function uninstall(options: string | object): void;

    function union(patterns: Array<string | RegExp>, flags?: string, options?: { conjunction?: string }): RegExp;

    namespace cache {
        function flush(cacheName: string): void;
    }
}
