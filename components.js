
const React = require('react');

const { stylesToClassName } = require('./src/theme');

function View ({ children, style, theme, inline, ...props }) {
    return React.createElement('div', { 
        className: stylesToClassName(style, theme),
        style: inline,
        ...props,
     }, children);
}

function Text ({ children, style, theme, inline, ...props }) {
    return React.createElement('span', { 
        className: stylesToClassName(style, theme),
        style: inline,
        ...props,
     }, children);
}

function TextInput ({ children, style, theme, inline, ...props }) {
    return React.createElement('input', { 
        className: stylesToClassName(style, theme),
        style: inline,
        ...props,
     }, children);
}

function TextArea ({ children, style, theme, inline, ...props }) {
    return React.createElement('textarea', { 
        className: stylesToClassName(style, theme),
        style: inline,
        ...props,
     }, children);
}

function Link ({ children, style, theme, inline, ...props }) {
    return React.createElement('a', { 
        className: stylesToClassName(style, theme),
        style: inline,
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