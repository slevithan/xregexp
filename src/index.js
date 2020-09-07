import * as addons from './addons';
import XRegExp from './xregexp';

console.log(addons); // eslint-disable-line no-console

for (const name in addons) {
    addons[name](XRegExp);
}

export default XRegExp;
