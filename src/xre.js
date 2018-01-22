export function xre(callSite, ...substitutions) {
    return String.raw(callSite, ...substitutions).replace(/\s/g, '');
}
