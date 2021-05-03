const gulp = require('gulp');
const ghpages = require('gh-pages');
const del = require('del');
const fs = require('fs');

exports.deleteUnnecessaryFiles = () => {
    return del('./dist/src');
}

exports.afterTsc = () => {
    return gulp.src('./dist/src/**/*').pipe(gulp.dest('dist'));
};

exports.handlesPackageInfo = async () => {
    return new Promise((resolve) => {
        let packageData = fs.readFileSync('./dist/src/package-data.js').toString();
        console.log(packageData);
        packageData = packageData.replace(`const info = require('../package.json');`, `const info = require('./package.json');`);
        fs.writeFile('./dist/src/package-data.js', packageData, resolve)
    })

}

exports.copyDistFiles = async () => {

    return gulp.src([
        'package.json',
        'README.md'
    ]).pipe(gulp.dest('./dist/src'));
}

exports.publishWebSite = () => {
    return new Promise((resolve, reject) => {
        ghpages.publish('website', (error) => {
            if (error) {
                reject(error)
            } else {
                console.info('Published Successfully!');
            }
            resolve();
        });
    });
}