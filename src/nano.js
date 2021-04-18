const { create } = require('nano-css');

const isClient = typeof document === 'object';
const nano = create({
    sh: isClient ? document.getElementById('yoga-css') : null
});

require('nano-css/addon/cache').addon(nano);
require('nano-css/addon/hydrate').addon(nano);
require('nano-css/addon/stable').addon(nano);
require('nano-css/addon/nesting').addon(nano);
require('nano-css/addon/keyframes').addon(nano);
require('nano-css/addon/rule').addon(nano);
require('nano-css/addon/global').addon(nano);
require('nano-css/addon/sheet').addon(nano);

const { sheet, rule, keyframes, put } = nano;

module.exports = {
    nano,
    keyframes,
    sheet,
    rule,
    put,
};