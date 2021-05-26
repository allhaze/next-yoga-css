# 📦 [experimental] Webpack plugin for nextjs (CSS in JS)

## Installation

```
yarn add https://github.com/allhaze/next-yoga-css
```

## Usage

In your `next.config.js` file add the following code:

```javascript
const withYogaCss = require('next-yoga-css/plugin')(/* Extra next-yoga-css options */);

module.exports = withYogaCss({
    future: {
        webpack5: true
    }
});
```
## Custom Options

You can add the following custom options to modify the behaviour of plugin.

1. `logging`: Enables the debug logs (set this flag to **true**).
2. `withRtl`: Enables the right-to-left styles.

TBD.
