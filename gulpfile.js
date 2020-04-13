// Initalisation of our node modules
const {src, dest, watch, series, parallel} = require('gulp');
const autoprefixer                         = require('autoprefixer');
const cssnano                              = require('cssnano');
const concat                               = require('gulp-concat');
const postcss                              = require('gulp-postcss');
const replace                              = require('gulp-replace');
const sass                                 = require('gulp-sass');
const sourcemaps                           = require('gulp-sourcemaps');
const uglify                               = require('gulp-uglify');
const browserSync                          = require('browser-sync').create();
//const gulpNunjucks                       = require('gulp-nunjucks');
const nunjucks                             = require('nunjucks');

// File path variables
const files = {
  sassPath: 'app/sass/**/*.scss',
  jsPath:   'app/js/**/*.js',
  njkPath:  'app/templates/**/*.njk',
}

// Sass task
function sassTask(){
  return src(files.sassPath)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss( [autoprefixer(), cssnano()] ))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('public'))
    .pipe(browserSync.stream());
}

// Js task
function jsTask(){
  return src(files.jsPath)
    .pipe(concat('all.js'))
    .pipe(uglify())
    .pipe(dest('public'));
}

// Html template engine task
function njkTask(){
  return src(files.njkPath)
    .pipe(nunjucks.configure(files.njkPath, {autoescape: true}))
    .pipe(nunjucks.render('layout.njk', {website: 'website'}))
    .pipe(dest('public'))
};

// Cachebusting task
const cbString = new Date().getTime();
function cacheBustTask(){
  return src(['index.html'])
    .pipe(replace(/cb=\d+/g, 'cb=' + cbString))
    .pipe(dest('public'));
} 

// Watch task
function watchTask(){
  browserSync.init({
    server:{
      baseDir: 'public'
    }
  });

  watch([files.sassPath, files.jsPath, files.njkPath],
    parallel(sassTask, jsTask, njkTask));
}

// Default task runner
exports.default = series(
  parallel(sassTask, jsTask, njkTask),
  cacheBustTask,
  watchTask
);