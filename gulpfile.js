// Initalisation of our node modules
const {src, dest, watch, series, parallel} = require('gulp');
const nunjucksRender                       = require('gulp-nunjucks-render');
const sass                                 = require('gulp-sass');
const browserSync                          = require('browser-sync').create();
const autoprefixer                         = require('autoprefixer');
const cssnano                              = require('cssnano');
const concat                               = require('gulp-concat');
const postcss                              = require('gulp-postcss');
const replace                              = require('gulp-replace');
const sourcemaps                           = require('gulp-sourcemaps');
const uglify                               = require('gulp-uglify');
// for nunjucks data render install gulp-data

// File path variables
const files = {
  njkPath:  'app/pages/**/*.+(html|nunjucks)',
  sassPath: 'app/sass/**/*.scss',
  jsPath:   'app/js/**/*.js',
}

// Njk Task: njk's task function for compiling njk to html.
// CacheBusting Task: replaces the cb=1234 with the cbString variables time stamp
const cbString = new Date().getTime();
function njkTask(){
  return src(files.njkPath)
    .pipe(nunjucksRender({path:['app/templates']}))
    .pipe(replace(/cb=\d+/g, 'cb=' + cbString))
    .pipe(dest('public'));
}

// Sass Task
function sassTask(){
  return src(files.sassPath)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss( [autoprefixer(), cssnano()] ))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('public'))
    .pipe(browserSync.stream());
}

// Js Task: js to main.js Task
function jsTask(){
  return src(files.jsPath)
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(dest('public'));
}

// Watch Task: for automation
function watchTask(){
  browserSync.init({server: {baseDir: 'public'}})

  watch([files.njkPath], njkTask).on('change', browserSync.reload);
  watch([files.sassPath], sassTask);
  watch([files.jsPath], jsTask).on('change', browserSync.reload);
  
  parallel(njkTask, sassTask, jsTask);
}

// Default Task Runner: for automation
exports.default = series(
  parallel(njkTask, sassTask, jsTask),
  watchTask
);