# 📦 Webpack plugin for nextjs (CSS in JS)

## Installation

```
yarn add next-nano-css
```

## Usage

In your `next.config.js` file add the following code:

```javascript
const withNanoCss = require('next-nano-css/plugin')(/* Extra next-nano-css options */);

module.exports = withNanoCss({
    future: {
        webpack5: true
    }
});
```
## Custom Options

You can add the following custom options to modify the behaviour of plugin.

1. `logging`: Enables the debug logs (set this flag to **true**).

TBD.