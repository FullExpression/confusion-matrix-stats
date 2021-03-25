const gulp = require('gulp');
const ghpages = require('gh-pages');

exports.copyDistFiles = () => {
    return gulp.src([
        'package.json',
        'README.md'
    ]).pipe(gulp.dest('./dist'));
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
    
 

