/**
 * Ported from https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/xregexp/xregexp-tests.ts
 */

import XRegExp = require('xregexp');
import TokenOpts = XRegExp.TokenOpts;

// --  --  --  --  --  --  --  --  --  --  --  --  --

let exp: RegExp = /test/;
const expArr: RegExp[] = [];
const expArrArr: RegExp[][] = [];
const strOrExpArr: Array<string | RegExp> = [];
const chain: RegExp[] = [];
const groupChain: Array<{ regex: RegExp; backref: string }> = [];
const groupChain1: Array<{ regex: RegExp; backref: number }> = [];
let regex: RegExp;
const value: any = "test";
let str: string = "";
const scope: string = "";
const search: string = "";
const searchEx: RegExp = /test/;
let bool: boolean;
let strArr: string[] = [];
let strOrStrArr: string | string[];
const strArrArr: string[][] = [];
const pattern: string = "";
const subs: { [name: string]: RegExp } = {};
const flags: string = "";
const right: string = "";
const left: string = "";
const sticky: boolean = false;
const pos: number = 0;
let num: number;
const limit: number = 1;
const obj: object = {};
let matchArr: RegExpExecArray;
const options: TokenOpts = {};
const replacer: (...args: any[]) => string = () => "";

// --  --  --  --  --  --  --  --  --  --  --  --  --

regex = XRegExp(str);
regex = XRegExp(str, flags);
regex = XRegExp(regex);

str =  XRegExp.version;

// --  --  --  --  --  --  --  --  --  --  --  --  --

regex = XRegExp(str);
regex = XRegExp(str, flags);
regex = XRegExp(regex);

str =  XRegExp.version;

// --  --  --  --  --  --  --  --  --  --  --  --  --

XRegExp.addToken(regex, (arr, scope) => {
	matchArr = arr;
	str = scope;
	return str;
});

XRegExp.addToken(regex, (arr, scope) => {
	matchArr = arr;
	str = scope;
	return str;
}, options);

// --  --  --  --  --  --  --  --  --  --  --  --  --

XRegExp.addUnicodeData([
    { name: "Test" },
    { name: "test2", inverseOf: "Test" },
]);

// --  --  --  --  --  --  --  --  --  --  --  --  --

regex = XRegExp.build(pattern, strArr, flags);
regex = XRegExp.build(pattern, strArr);
regex = XRegExp.build(pattern, subs, flags);
regex = XRegExp.build(pattern, subs);
regex = XRegExp.cache(pattern);
regex = XRegExp.cache(pattern, flags);

str = XRegExp.escape(str);

matchArr = XRegExp.exec(str, regex, pos, sticky);
matchArr = XRegExp.exec(str, regex, pos);
matchArr = XRegExp.exec(str, regex);

// --  --  --  --  --  --  --  --  --  --  --  --  --

XRegExp.forEach(str, regex, (match, index, input, regexp) => {
	exp = regexp;
	str = input;
	num = index;
	matchArr = match;
});

// --  --  --  --  --  --  --  --  --  --  --  --  --

regex = XRegExp.globalize(regex);

XRegExp.install(str);
XRegExp.install(obj);

bool = XRegExp.isInstalled(str);
bool = XRegExp.isRegExp(value);

strOrStrArr = XRegExp.match(str, regex);
strOrStrArr = XRegExp.match(str, regex, scope);
str = XRegExp.match(str, regex, "one");

strArr = XRegExp.matchChain(str, chain);
strArr = XRegExp.matchChain(str, groupChain);
strArr = XRegExp.matchChain(str, groupChain1);

// --  --  --  --  --  --  --  --  --  --  --  --  --

strArr = XRegExp.matchRecursive(str, left, right, flags, options);
strArr = XRegExp.matchRecursive(str, left, right, flags);
strArr = XRegExp.matchRecursive(str, left, right);

// --  --  --  --  --  --  --  --  --  --  --  --  --
str = XRegExp.replace(str, search, str, scope);
str = XRegExp.replace(str, search, str);
str = XRegExp.replace(str, search, replacer, scope);
str = XRegExp.replace(str, search, replacer);

str = XRegExp.replace(str, searchEx, str, scope);
str = XRegExp.replace(str, searchEx, str);
str = XRegExp.replace(str, searchEx, replacer, scope);
str = XRegExp.replace(str, searchEx, replacer);

// --  --  --  --  --  --  --  --  --  --  --  --  --
str = XRegExp.replaceEach(str, expArrArr);
str = XRegExp.replaceEach(str, strArrArr);
str = XRegExp.replaceEach(str, [[str, exp], [str, exp]]);

// --  --  --  --  --  --  --  --  --  --  --  --  --

strArr = XRegExp.split(str, search, limit);
strArr = XRegExp.split(str, search);
strArr = XRegExp.split(str, searchEx, limit);
strArr = XRegExp.split(str, searchEx);

// --  --  --  --  --  --  --  --  --  --  --  --  --

const h12 = /1[0-2]|0?[1-9]/;
const h24 = /2[0-3]|[01][0-9]/;
regex = XRegExp.tag('x')`${h12} : | ${h24}`;

// --  --  --  --  --  --  --  --  --  --  --  --  --

bool = XRegExp.test(str, regex, pos, bool);
bool = XRegExp.test(str, regex, pos);
bool = XRegExp.test(str, regex);

// --  --  --  --  --  --  --  --  --  --  --  --  --

XRegExp.uninstall(obj);
XRegExp.uninstall(str);

regex = XRegExp.union(strArr, flags);
regex = XRegExp.union(strArr);
regex = XRegExp.union(expArr, flags);
regex = XRegExp.union(expArr);
regex = XRegExp.union(strOrExpArr, flags);
regex = XRegExp.union(strOrExpArr);

// --  --  --  --  --  --  --  --  --  --  --  --  --
