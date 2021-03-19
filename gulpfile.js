const gulp = require('gulp');
const ghpages = require('gh-pages');

exports.copyDistFiles = () => {
      return gulp.src('package.json')
    .pipe(gulp.dest('./dist'));
}

exports.publishWebSite = (callback) => {
    ghpages.publish('website', (err) => {
        if (error) {
            console.error(err);
        }
        callback();
    });
}
    
 

