
const React = require('react');

const { stylesToClassName } = require('./src/theme');

function View ({ children, style, theme, ...props }) {
    return React.createElement('div', { 
        className: stylesToClassName(style, theme),
        ...props,
     }, children);
}

function Text ({ children, style, theme, ...props }) {
    return React.createElement('span', { 
        className: stylesToClassName(style, theme),
        ...props,
     }, children);
}

function TextInput ({ children, style, theme, ...props }) {
    return React.createElement('input', { 
        className: stylesToClassName(style, theme),
        ...props,
     }, children);
}

function TextArea ({ children, style, theme, ...props }) {
    return React.createElement('textarea', { 
        className: stylesToClassName(style, theme),
        ...props,
     }, children);
}

function Link ({ children, style, theme, ...props }) {
    return React.createElement('a', { 
        className: stylesToClassName(style, theme),
        ...props,
     }, children);
}

module.exports = {
    View,
    Text,
    TextInput,
    TextArea,
    Link,
};