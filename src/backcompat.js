/*!
 * XRegExp BackCompat 3.0.0-pre
 * <http://xregexp.com/>
 * Steven Levithan © 2012 MIT License
 */

/**
 * Provides backward compatibility with XRegExp 1.x-2.x.
 */
(function(XRegExp) {
    'use strict';

    var REGEX_DATA = 'xregexp',
        install = XRegExp.install,
        uninstall = XRegExp.uninstall;

    function getNativeFlags(regex) {
        return /\/([a-z]*)$/i.exec(String(regex))[1];
    }

/**
 * XRegExp 3.0.0 removed the 'all' shortcut.
 */
    XRegExp.install = function(options) {
        install(options === 'all' ? 'natives' : options);
    };

/**
 * XRegExp 3.0.0 removed the 'all' shortcut.
 */
    XRegExp.uninstall = function(options) {
        uninstall(options === 'all' ? 'natives' : options);
    };

/**
 * XRegExp 2.0.0 stopped overriding native methods by default.
 */
    XRegExp.install('natives');

/**
 * @deprecated As of XRegExp 2.0.0. Replaced by {@link #XRegExp.globalize}.
 */
    XRegExp.copyAsGlobal = XRegExp.globalize;

/**
 * @deprecated As of XRegExp 2.0.0. Replaced by {@link #XRegExp.exec}.
 */
    XRegExp.execAt = XRegExp.exec;

/**
 * @deprecated As of XRegExp 2.0.0. Replaced by {@link #XRegExp.forEach}.
 */
    XRegExp.iterate = XRegExp.forEach;

/**
 * @deprecated As of XRegExp 2.0.0. No replacement.
 */
    XRegExp.freezeTokens = function() {
        var errorFn = function() {
            throw new Error('Cannot change XRegExp syntax after running freezeTokens');
        };

        XRegExp.addToken = errorFn;

        // Don't replace `addUnicodeData` unless it exists, since it might be used to check whether
        // XRegExp's Unicode Base addon is available
        if (XRegExp.addUnicodeData) {
            XRegExp.addUnicodeData = errorFn;
        }
    };

/**
 * @deprecated As of XRegExp 2.0.0. Replaced by {@link #XRegExp.prototype.apply} in addon.
 */
    RegExp.prototype.apply = function(context, args) {
        return this.test(args[0]);
    };

/**
 * @deprecated As of XRegExp 2.0.0. Replaced by {@link #XRegExp.prototype.call} in addon.
 */
    RegExp.prototype.call = function(context, str) {
        return this.test(str);
    };

/**
 * @deprecated As of XRegExp 1.5.0. Replaced by {@link #XRegExp.matchChain}.
 */
    XRegExp.matchWithinChain = XRegExp.matchChain;

/**
 * @deprecated As of XRegExp 1.5.0. No replacement.
 */
    RegExp.prototype.addFlags = function(flags) {
        var regex = XRegExp(this.source, getNativeFlags(this) + (flags || '')),
            captureNames = this[REGEX_DATA] ? this[REGEX_DATA].captureNames : null;

        regex[REGEX_DATA] = {
            captureNames: captureNames ? captureNames.slice(0) : null,
            // Always passed through `XRegExp`
            isNative: false
        };

        return regex;
    };

/**
 * @deprecated As of XRegExp 1.5.0. No replacement.
 */
    RegExp.prototype.forEachExec = function(str, callback, context) {
        XRegExp.forEach(str, this, callback, context);
    };

/**
 * @deprecated As of XRegExp 1.5.0. No replacement.
 */
    RegExp.prototype.validate = function(str) {
        var regex = new RegExp('^(?:' + this.source + ')$(?!\\s)', getNativeFlags(this));

        if (this.global) {
            this.lastIndex = 0;
        }

        return str.search(regex) === 0;
    };

/**
 * @deprecated As of XRegExp 1.2.0. No replacement.
 */
    RegExp.prototype.execAll = function(str) {
        return XRegExp.forEach(str, this, function(match) {
            this.push(match);
        }, []);
    };

}(XRegExp));
