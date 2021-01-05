const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const sync = require("browser-sync").create();
const modifyCssUrls = require("gulp-modify-css-urls");

// Styles

const styles = () => {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("source/css"))
    .pipe(sync.stream());
  }

exports.styles = styles;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'source'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

// Watcher

const watcher = () => {
  gulp.watch("source/sass/**/*.scss", gulp.series("styles"));
  gulp.watch("source/*.html").on("change", sync.reload);
}

exports.default = gulp.series(
  styles, server, watcher
);

// **********************************************************************

// Build

const copyHtml = () => {
  return gulp.src("source/*.html")
    .pipe(gulp.dest("build"))
}

const copyCss = () => {
  return gulp.src(["source/css/*.css", "source/css/*.css.map"])
    .pipe(gulp.dest("build/css"))
}

const copyFonts = () => {
  return gulp.src(["source/fonts/*.woff", "source/css/*.woff"])
    .pipe(gulp.dest("build/fonts"))
}

const copyJs = () => {
  return gulp.src(["source/js/*.css", "source/js/*.js.map"])
    .pipe(gulp.dest("build/js"))
}

const copyImg = () => {
  return gulp.src("source/img/**/*.*")
    .pipe(gulp.dest("build/img"))
}

const stylesbuild = () => {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(modifyCssUrls({
      modify: (url) => {
        return url.replace("../../img/", "../img/");
      },
    }))
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("source/css"))
    .pipe(sync.stream());
}

// pathincss


exports.build = gulp.series(stylesbuild, gulp.parallel(copyHtml, copyCss, copyFonts, copyJs, copyImg));

// **********************************************************************
