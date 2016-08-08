const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const sass = require('gulp-sass');
const babel = require('gulp-babel');
const rename = require('gulp-rename');

/**
Unused for the time being
const uglify = require('gulp-uglify');
const minifyCSS = require('gulp-minify-css');
*/

const inputStyle = './public/stylesheets/*.scss';
const outputStyle = './public/stylesheets/';
const inputJSBrowser = './public/javascripts/*.es6.js';
const outputJSBrowser = './public/javascripts/';


function notifyOfChanges(event) {
  console.log(`File ${event.path} was ${event.type}, running tasks...`);
};


/**
 * Watches for changes to certain files and builds the site accordingly.
 */
gulp.task('watch', () => {
  gulp.watch(inputStyle, ['sass']).on('change', (event) => notifyOfChanges(event));
  gulp.watch(inputJSBrowser, ['babel-browser']).on('change', (event) => notifyOfChanges(event));
});


/**
 * Compile sass code.
 */
gulp.task('sass', () => {
  const autoprefixerOptions = {
    browsers: ['last 2 versions', '> 5%'],
  };
  const sassOptions = {
    errLogToConsole: true,
    outputStyleStyle: 'expanded',
  };
  return gulp
    .src(inputStyle)
    .pipe(autoprefixer(autoprefixerOptions))
    // .pipe(minifyCSS())
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(gulp.dest(outputStyle));
    // .pipe(notify({ message: 'Styles task complete' }))
});


/**
 * Babel compilation for front-end JS ES6 support
 **/
gulp.task('babel-browser', () => (
  gulp
    .src(inputJSBrowser)
    .pipe(babel({
      presets: ['es2015'],
    }))
    .pipe(rename('navigation.js'))
    .pipe(gulp.dest(outputJSBrowser))
));


/**
 * Make watch the default task.
 */
gulp.task('default', ['watch']);


/**
 * Create a build task that does everything
 */
gulp.task('build', ['sass', 'babel-browser']);
