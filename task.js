var gulp = require('gulp');
var _ = require('lodash-node');
var babel = require('./babel');
var changed = require('@exponent/gulp-changed');
var plumber = require('gulp-plumber');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var watch = require('gulp-watch');

function getPaths(opts) {
  opts = opts || {};
  var paths = {
    dest: 'build',
    sourceMaps: 'sourcemaps',
    src: 'src/**/*.js',
  };
  if (opts.paths) {
    var keys = Object.keys(paths);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      paths[key] = opts.paths[key] || paths[key];
    }
  }
  return paths;
}

var babelTask = function (opts) {
  opts = opts || {};
  var paths = getPaths(opts);
  return function() {
    var src = paths.src;
    var task = gulp.src(src);
    if (opts.watch) {
      task = task
      .pipe(plumber())
      .pipe(watch(src))
      ;
    }
    var babelOpts = {
      stage: 1,
      blacklist: [
        'es6.constants',
        'es6.forOf',
        'es6.spec.symbols',
        'es6.spec.templateLiterals',
        'es6.templateLiterals',
      ],
      optional: [
        'asyncToGenerator',
        'runtime',
      ],
    };
    if (opts.babel) {
      _.assign(babelOpts, opts.babel);
    }
    task = task
      .pipe(changed(paths.dest))
      .pipe(sourcemaps.init())
      .pipe(babel(babelOpts))
      .pipe(sourcemaps.write(paths.sourceMaps))
      ;
    if (opts.watch) {
      task = task
      .pipe(plumber.stop())
      ;
    }
    task = task
      .pipe(gulp.dest(paths.dest));
    return task;
  };
}

module.exports = function(_gulp, opts) {
  _gulp.task('babel', babelTask(opts));
  opts = _.clone(opts) || {};
  opts.watch = true;
  _gulp.task('babel-watch', babelTask(opts));
};
module.exports.babelTask = babelTask;
