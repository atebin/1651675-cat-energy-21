const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const sync = require("browser-sync").create();
const imagemin = require("gulp-imagemin");
const replace = require("gulp-replace");
const htmlmin = require("gulp-htmlmin");
const uglify = require("gulp-uglify-es").default;
const rename = require("gulp-rename");
const del = require("del");
const csso = require("postcss-csso");

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
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("build"))
}

const copyFavicon = () => {
  return gulp.src(["source/*.ico"])
    .pipe(gulp.dest("build"))
}

const copyCss = () => {
  return gulp.src(["source/css/*.css", "source/css/*.css.map"])
    .pipe(gulp.dest("build/css"))
}

const copyFonts = () => {
  return gulp.src("source/fonts/*.{woff,woff2}")
    .pipe(gulp.dest("build/fonts"))
}

const copyJs = () => {
  return gulp.src("source/js/*.js")
    .pipe(gulp.dest("build/js"))
}

const minifyJs = () => {
  return gulp.src("source/js/*.js")
    .pipe(uglify())
    .pipe(rename((path) => {
      path.dirname += "";
      path.basename += ".min";
      path.extname = ".js";
    }))
    .pipe(gulp.dest("build/js"))
}


const copyImg = () => {
  return gulp.src("source/img/**/*.{jpg,png,svg}")
    .pipe(imagemin([
      imagemin.mozjpeg({ progressive: true }),
      imagemin.optipng({ optimizationLevel: 3 }),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("build/img"))
}

const buildcss = () => {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(replace("../../img/", "../img/"))
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("source/css"))
    .pipe(sync.stream());
}

const buildmapjs = () => {
  return gulp.src("build/js/*.js")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/js"))
    .pipe(sync.stream());
}

const clear = () => {
  return del("build");
}


exports.build = gulp.series(
  clear,
  buildcss,
  gulp.parallel(copyHtml, copyFavicon, copyCss, copyFonts, copyJs, minifyJs, copyImg),
  buildmapjs
);

// **********************************************************************
