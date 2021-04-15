module.exports = (pluginOptions = {}) => (nextConfig = {}) => {
    return Object.assign({}, nextConfig, {
      webpack(config, options) {
        config.module.rules.push({
            test: /\.js$/,
            use: [{
                loader: 'next-yoga-css',
                options: Object.assign({}, {
                  stylesFileSuffix: 'styles',
                  globalStylesPath: './styles',
                  themesPath: './themes',
                  outputCSSFile: './public/yoga.min.css',
                  basePath: options.dir,
                }, pluginOptions),
            },],
        });
        if (typeof nextConfig.webpack === 'function') {
          return nextConfig.webpack(config, options);
        }
        return config;
      },
    });
};
