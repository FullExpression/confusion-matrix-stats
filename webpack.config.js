//webpack.config.js
const path = require('path');
const {
    version
} = require('./package.json');

module.exports = {
    mode: "production",
    entry: {
        main: "./dist/index.js",
    },
    output: {
        path: path.resolve(__dirname, `./versions/${version}/`),
        filename: "index.js",
        libraryTarget: "umd"
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
    },
    module: {
        rules: [{
            test: /\.tsx?$/,
            loader: "ts-loader"
        }]
    }
};