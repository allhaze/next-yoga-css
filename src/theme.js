const { rule } = require('./nano');

const _registeredThemes = {},
    _registeredStyles = {},
    _registeredGlobalStyles = {},
    _registeredGlobalClasses = {},
    _registeredClasses = {},
    _resourceNameToHash = {};

let _projector;
const getThemeProjector = () => {
    if(typeof _projector === 'undefined') {
        _projector = new Proxy({}, {
            get(target, name) {
              return "$" + name
            }
        });
    }
    return _projector;
}

const registerTheme = (themeName, themeValues) => {
    if(typeof window !== 'undefined') {
        return;
    }
    if(_registeredThemes[themeName]) {
        return _registeredThemes[themeName];
    } else {
        log('Registered theme: [' + themeName + ']');
        return _registeredThemes[themeName] = themeValues;
    }
};

const getTheme = (themeName) => {
    const reqTheme = _registeredThemes[themeName] || {};
    const defaultTheme = _registeredThemes['default'] || {};

    return {
        ...defaultTheme,
        ...reqTheme,
    };
};

const registerStyles = (stylesHash, stylesValues, resource) => {
    if(resource) {
        _resourceNameToHash[resource] = stylesHash;
    }
    if(_registeredStyles[stylesHash]) {
        return _registeredStyles[stylesHash];
    } else {
        log('Registered styles: [' + stylesHash + ']');
        if(typeof _registeredClasses[stylesHash] === 'undefined') {
            _registeredClasses[stylesHash] = {};
        } 
        const themeProjector = getThemeProjector();
        const styles = stylesValues(themeProjector);
        for(let styleKey in styles) {
            _registeredClasses[stylesHash][styleKey] = hash(JSON.stringify(styles[styleKey]));
            log('Registered class: [' + styleKey + ': .' + _registeredClasses[stylesHash][styleKey] + ']');
        }
        return _registeredStyles[stylesHash] = stylesValues;
    }
};

const registerGlobalStyles = (stylesName, stylesValues) => {
    if(typeof window !== 'undefined') {
        return;
    }
    const globalStylesKey = stylesName;
    if(_registeredGlobalStyles[globalStylesKey]) {
        return _registeredGlobalStyles[globalStylesKey];
    } else {
        log('Registered global styles: [$' + globalStylesKey + ']');
        if(typeof _registeredGlobalClasses[globalStylesKey] === 'undefined') {
            _registeredGlobalClasses[globalStylesKey] = {};
        } 
        const themeProjector = getThemeProjector();
        const styles = stylesValues(themeProjector);
        for(let styleKey in styles) {
            _registeredGlobalClasses[globalStylesKey][styleKey] = hash(JSON.stringify(styles[styleKey]));
            log('Registered global class: [' + styleKey + ': .' + _registeredGlobalClasses[globalStylesKey][styleKey] + ']');
        }
        return _registeredGlobalStyles[globalStylesKey] = stylesValues;
    }
};

const getRegisteredClasses = (stylesHash, resource) => {
    if(!stylesHash && resource) { 
        const _resource = resource.split('/'),
            resourceRootPath = _resource.slice(0, -1).join('/');
        for(let _path in _resourceNameToHash) {
            const _resPath = _path.split('/'),
                _resRootPath = _resPath.slice(0, -1).join('/');
            if(_resRootPath === resourceRootPath) {
                return _registeredClasses[_resourceNameToHash[_path]];
            }
        }
        return {};
    } else if(_registeredClasses[stylesHash]) {
        return _registeredClasses[stylesHash];
    } else {
        return {};
    }
};

const getRegisteredGlobalClasses = () => {
    return _registeredGlobalClasses;
};

let _processed = [];

const generate = (nano) => {
    
    for(let themeName in _registeredThemes) {
        for(let stylesHash in _registeredStyles) {
            const styles = _registeredStyles[stylesHash](getTheme(themeName));
            for(let styleKey in styles) {
                if(_processed.indexOf(`${styleKey}|${stylesHash}~${themeName}`) === -1) {
                    _processed.push(`${styleKey}|${stylesHash}~${themeName}`);
                    _normalizeRules(styles[styleKey]);
                    let themeKey = themeName === 'default' ? '' : `${themeName}_`;
                    rule(styles[styleKey], `${themeKey}${_registeredClasses[stylesHash][styleKey]}`);
                }
            }
        }

        for(let globalStylesKey in _registeredGlobalStyles) {
            const styles = _registeredGlobalStyles[globalStylesKey](getTheme(themeName));
            for(let styleKey in styles) {
                if(_processed.indexOf(`${styleKey}$${globalStylesKey}~${themeName}`) === -1) {
                    _processed.push(`${styleKey}$${globalStylesKey}~${themeName}`);
                    _normalizeRules(styles[styleKey]);
                    let themeKey = themeName === 'default' ? '' : `${themeName}_`;
                    rule(styles[styleKey], `${themeKey}${_registeredGlobalClasses[globalStylesKey][styleKey]}`);
                }
            }
        }
    }

    return nano.raw;
};

var hash = function (str) {
    var h = 5381, i = str.length;
    while (i) h = (h * 33) ^ str.charCodeAt(--i);
    return (h >>> 0).toString(36);
};

const _stylesCache = {};
const stylesToClassName = (styles, theme) => {
    if(process.env.NODE_ENV === 'development') {
        let _key = hash(JSON.stringify(styles) + theme);
        if(_stylesCache[_key]) {
            return _stylesCache[_key];
        }
        if(Array.isArray(styles)) {
            styles = _flatten(styles).filter(Boolean);
            _stylesCache[_key] = styles.map(st => {
                _normalizeRules(st);
                return rule(st);
            }).join(' ')
        } else {
            _normalizeRules(styles);
            _stylesCache[_key] = rule(styles);
        }
        return _stylesCache[_key];
    } else {
        if(!styles) {
            return '';
        }
        if(!Array.isArray(styles)) {
            styles = [styles];
        }
        styles = _flatten(styles).filter(Boolean);
        if(styles.length) {
            let themeKey = theme === 'default' ? '_' : ('_' + theme + '_');
            return styles.map(st => (themeKey + st)).join(' ');
        }
        return '';
    }
};

function _flatten(items) {
    const flat = [];
  
    items.forEach(item => {
      if (Array.isArray(item)) {
        flat.push(..._flatten(item));
      } else {
        flat.push(item);
      }
    });
  
    return flat;
  }

const _normalizeRules = (style) => {
    let __styles = Object.assign({}, style);

    for(let key in __styles) {
        if([
            'zIndex',
            'textShadow',
            'flex', 
            'fontWeight',
            'color', 
            'backgroundColor',
            'boxShadow',
            'transitionDelay',
            'transitionDuration',
            'filter',
            'background',
            'borderColor',
            'borderBottomColor',
            'borderTopColor',
            'borderLeftColor',
            'borderRightColor',
            'animationDuration', 
            'animationName',
            'opacity'
        ].indexOf(key) > -1) {
            continue;
        }

        if(key === 'paddingHorizontal') {

            style['paddingLeft'] = _normalizeValue(__styles[key]);
            style['paddingRight'] = _normalizeValue(__styles[key]);
            delete style[key];

        } else if(key === 'marginHorizontal') {

            style['marginLeft'] = _normalizeValue(__styles[key]);
            style['marginRight'] = _normalizeValue(__styles[key]);
            delete style[key];

        } else if(key === 'paddingVertical') {

            style['paddingTop'] = _normalizeValue(__styles[key]);
            style['paddingBottom'] = _normalizeValue(__styles[key]);
            delete style[key];

        } else if(key === 'marginVertical') {

            style['marginTop'] = _normalizeValue(__styles[key]);
            style['marginBottom'] = _normalizeValue(__styles[key]);
            delete style[key];

        } else if (typeof style[key] === 'object') {
            _normalizeRules(style[key]);
        } else {
            style[key] = _normalizeValue(style[key]);
        }
    }
};

const _normalizeValue = (value) => {
    if(typeof value === 'number') {
        value = value.toString();
    }
    if(typeof value === 'string') {
        value = value.replace(/\d*\.?\d+(?:px|vh|vw|%|em|rem|pt)?/ig, (match) => {
            return /(px|%|vh|vw|em|rem|pt)/ig.test(match) ? match : `${match}px`;
        });
    } 
    return value;
};

let _logging = false;
const log = (message) => {
    _logging === true && console.log(message);
};

const setLogging = (logging) => {
    _logging = logging;
}

module.exports = {
    registerTheme,
    registerStyles,
    getTheme,
    generate,
    getRegisteredClasses,
    getRegisteredGlobalClasses,
    hash,
    stylesToClassName,
    setLogging,
    registerGlobalStyles,
}