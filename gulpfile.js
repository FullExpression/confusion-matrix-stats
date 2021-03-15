const gulp = require('gulp');
exports.copyDistFiles = () => {
      return gulp.src('package.json')
    .pipe(gulp.dest('./dist'));
}