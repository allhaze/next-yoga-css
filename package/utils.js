const { stylesToClassName } = require('./src/theme');
const { nano } = require('./src/nano');

module.exports = {
    stylesToClassName,
    combineStyledForDevelopment: (styles, themeName = 'default', themes = {}, globalStyles = {}) => {
        const defaultTheme = themes['default'] || {};
        const selectedTheme = themes[themeName] || {};
        const sumTheme = { 
        ...defaultTheme,
        ...selectedTheme
        }; 
        const _prGlobal = {};
        for(let i in globalStyles) {
        _prGlobal['$' + i] = globalStyles[i](sumTheme);
        }
        return { ...styles(sumTheme), ..._prGlobal };
    },
    getRawStyleSheet: () => {
        return (
            nano.raw
        );
    },
    rehydrate: () => {
        if(process.env.NODE_ENV !== 'production' && nano.client) {
            nano.hydrate(document.getElementById('nano-css'));
        }
    },
};
