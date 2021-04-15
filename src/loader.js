const path = require('path');
const fs = require('fs');

const { nano } = require('./nano');

const { registerTheme, generate, registerStyles, hash, getRegisteredClasses, getRegisteredGlobalClasses, registerGlobalStyles, setLogging } = require('./theme');

require('nano-css/addon/extract').addon(nano);

const regExFindStyles = /(\(theme\)\=\>\(\{[^\)]*\}\))/g,
    regExFindViewStyle = /(style\=\{[^\}]*\})/g,
    regExStyles = /(?<=styles\.)(.*?)(?=\,|\]|\})/g,
    regExComments = /[^:]\/\/.*/g;

    const cleanAndClear = (source) => {
        return source
            .replace(regExComments, "")
            .replace(/\s/g, "")
            .replace(/\n/g, "");
    };

    const cleanAndClearTheme = (source) => {
        return source
            .replace(regExComments, "")
            .replace(/\n/g, "");
    };

const loadFiles = (path, filter, processFileContent, callback) => {
    fs.readdir(path, function(err, files) {
        if(!err) {
            files = files.filter(filter);
            let callbacksCount = files.length;
            if(callbacksCount <= 0) {
                callback();
            } 
            for(let i in files) {
                fs.readFile(path + '/' + files[i], 'utf-8', function (err, fileContent) {
                    if(!err) { processFileContent(fileContent, this.fileName); }
                    callbacksCount--;
                    if(callbacksCount <= 0) {
                        callback();
                    } 
                }.bind({ fileName: files[i] }));
            }
        } else {
            callback();
        }
    });
};

module.exports = function loader(content) {
    const options = this.getOptions();

    setLogging(options.logging);

    var callback = this.async();

    if(this.mode === 'development') {
        callback(null, content);
        return;
    }

    this.cacheable(false);

    if(this.resourcePath.indexOf('node_modules') === -1) {
        const source = cleanAndClear(content);
        const matchClasses = source.match(regExFindViewStyle);

        if(matchClasses && matchClasses[0]) {
            let stylesHash = executeForStyles(source, this.resource);
            
            const themesPath = path.resolve(options.basePath, options.themesPath)
            this.addContextDependency(themesPath);
            loadFiles(themesPath, themeFile => themeFile.indexOf('index') === -1, (themeStyleSource, fileName) => {
                executeForThemes(
                    themeStyleSource, fileName.split('.')[0]
                );
            }, () => {

                const globalStylesPath = path.resolve(options.basePath, options.globalStylesPath)
                this.addContextDependency(globalStylesPath);
                loadFiles(globalStylesPath, stylesFile => stylesFile.indexOf('index') === -1, (globalStyleSource, fileName) => {
                    executeForGlobalStyles(
                        globalStyleSource, fileName.split('.')[0]
                    );
                }, () => {
                    executeForViews(content, stylesHash, this, options, false, (cnt) => {
                        fs.writeFile(path.resolve(options.basePath, options.outputCSSFile), generate(nano), 'utf-8', () => {});
                        callback(null, cnt);
                    });
                });
            });

        } else {
            fs.writeFile(path.resolve(options.basePath, options.outputCSSFile), generate(nano), 'utf-8', () => {});
            callback(null, content);
            return;
        }
    } else {
        fs.writeFile(path.resolve(options.basePath, options.outputCSSFile), generate(nano), 'utf-8', () => {});
        callback(null, content);
    }
};

const executeForViews = (content, stylesHash, self, options, doNotRepeat = false, callback) => {
    const source = cleanAndClear(content);
    const matchClasses = source.match(regExFindViewStyle);    

    if(matchClasses && matchClasses.length > 0) {        
        let classes = getRegisteredClasses(stylesHash, self.resource);
        let globalClasses = getRegisteredGlobalClasses();
        
        let classesProps = [];
        for (let matches in matchClasses) {
            const _newClasses = matchClasses[matches].match(regExStyles);
            if(_newClasses && _newClasses.length > 0) {
                classesProps = classesProps.concat(_newClasses)
            }
        }

        if(classesProps && classesProps.length) {
            classesProps = classesProps.sort().reverse();

            for( let j in classesProps ) {
                if(classesProps[j].startsWith('$')) {
                    const globalClass = classesProps[j].substring(1).split('.');
                    if(globalClasses[globalClass[0]] && globalClasses[globalClass[0]][globalClass[1]]) {
                        content = content.replace(
                            new RegExp(`(styles\\.\\${classesProps[j].replace(/\./g, '\\.')})`, 'g'),
                            `"${globalClasses[globalClass[0]][globalClass[1]]}"`
                        );
                    } else {
                        content = content.replace(
                            new RegExp(`(styles\\.\\${classesProps[j].replace(/\./g, '\\.')})`, 'g'),
                            '""'
                        );
                    }
                } else {
                    if(classes[classesProps[j]]) {
                        content = content.replace(
                            new RegExp(`(styles\\.${classesProps[j]})`, 'g'),
                            `"${classes[classesProps[j]]}"`
                        );
                    } else if(stylesHash) {
                        content = content.replace(
                            new RegExp(`(styles\\.${classesProps[j]})`, 'g'),
                            '""'
                        );
                    }
                }
            }
        }

        if(!stylesHash && !doNotRepeat) {

            let styleFileName = [];
            var stylesPath = self.resource.split('/');
            var fileName = stylesPath[stylesPath.length - 1],
                splitedFileName = fileName.split('.');
            
            styleFileName.push(splitedFileName[0]);
            if(splitedFileName.length > 2) {
                styleFileName.push(options.stylesFileSuffix);
            }
            styleFileName.push(splitedFileName[splitedFileName.length - 1]);
            stylesPath[stylesPath.length - 1] = styleFileName.join('.');
            stylesPath = stylesPath.join('/');
            
            self.addDependency(stylesPath);
            fs.readFile(stylesPath, 'utf-8', function (err, stylesSource) {
                if(!err) {
                    const _source = cleanAndClear(stylesSource);
                    let _s_hash = executeForStyles(_source, self.resource);
                    executeForViews(content, _s_hash, self, options, true, callback)
                } else {
                    callback(content);
                }
            });
        } else {
            callback(content);
        }
    }   
};

module.exports.pitch = function(remainingRequest, precedingRequest, data) {
    // console.log(remainingRequest, precedingRequest, data);
};

const executeForStyles = (content, resource) => {
    const match = content.match(regExFindStyles);
    let stylesHash;
    if(match && match[0]) {
        match[0] = match[0].replace(/(\@keyframes)/g, "\@keyframes ");
        const styles = eval(match[0]);
        stylesHash = hash(match[0]);
        registerStyles(stylesHash, styles, resource);
    }
    return stylesHash;
};

const executeForThemes = (content, themeName) => {
    const source = cleanAndClearTheme(content);
    const registerThemeArguments = eval('["' + themeName + '",' + source.replace(/(export\sdefault)/, "").replace(/(\;)/, "") + ']');
    registerTheme(...registerThemeArguments);
};

const executeForGlobalStyles = (content, stylesName) => {
    const source = cleanAndClear(content);
    const match = source.match(regExFindStyles);
    if(match && match[0]) {
        const registerGlobalStylesArguments = eval('["' + stylesName + '",' + match[0] + ']');
        registerGlobalStyles(...registerGlobalStylesArguments);
    }
};