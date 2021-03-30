const gulp = require('gulp');
const ghpages = require('gh-pages');
const del = require('del');


exports.deleteUnnecessaryFiles = () => {
    return del('./dist/src');
}

exports.afterTsc = () => {
    return gulp.src('./dist/src/**/*').pipe(gulp.dest('dist'));
};

exports.copyDistFiles = () => {
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
    
 

