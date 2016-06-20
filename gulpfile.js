require('es6-promise').polyfill();
var util = require('util');
var exec = require('child_process').exec;
var path = require('path');
var fs = require('fs');
//var babelify = require('babelify');
//var browserify = require('browserify');
var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var sass = require('gulp-sass');
var batch = require('gulp-batch');
var watch = require('gulp-watch');
var uglify = require('gulp-uglify');
var replace = require('gulp-replace');
var minifyCSS = require('gulp-minify-css');
//var transform = require('vinyl-transform');
//var source = require('vinyl-source-stream');

var input = "./public/stylesheets/*.scss";
var output = "./public/stylesheets/";

/**
 * Watches for changes to certain files and builds the site accordingly.
 */
gulp.task("watch", function() {
  return gulp
    .watch(input, ["sass"])
    .on('change', function(event) {
      console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });
});

/**
 * Compiles es6 code into a browserify bundle.
 * NOTE: Not used currently
 */
gulp.task('browserify', function () {
  fs.readdirSync('./scripts').forEach(function(file) {
    if (file.indexOf('.js') === -1) {
      return;
    }

    browserify('./scripts/' + file, { debug: true })
      .transform(babelify)
      .bundle()
      .pipe(source(file))
      .pipe(gulp.dest('./template/scripts/'));
  });
});

/**
 * Compile sass code.
 */
gulp.task('sass', function () {
  var autoprefixerOptions = {
      browsers: ["last 2 versions", "> 5%"]
  }
  var sassOptions = {
    errLogToConsole: true,
    outputStyle: 'expanded'
  };
  return gulp
    .src(input)
    .pipe(autoprefixer(autoprefixerOptions))
    //.pipe(minifyCSS())
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(gulp.dest(output))
    //.pipe(notify({ message: 'Styles task complete' }))
});

/**
 * Make watch the default task.
 */
gulp.task('default', ['watch']);

/**
 * Create a build task that does everything, including cache invalidation.
 */
gulp.task('build', ['sass', 'browserify']);
