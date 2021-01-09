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
const svgstore = require("gulp-svgstore");

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
      baseDir: "build"
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
  gulp.watch("source/sass/**/*.scss", gulp.series(
    buildcss,
    gulp.parallel(copyCss, copyFonts),
  ));
  gulp.watch("source/img/**/*.*", gulp.series(
    gulp.parallel(optimizeImg, copyWebp, copySvg, spriteSvg)
  ));
  gulp.watch("source/js/**/*.js", gulp.series(
    gulp.parallel(copyJs, minifyJs),
    buildmapjs
  ));
  gulp.watch("source/*.html", gulp.series(
    gulp.parallel(copyHtml, copyFavicon)
  ));
  gulp.watch("build/**/*.*").on("change", sync.reload);
}

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


const optimizeImg = () => {
  return gulp.src("source/img/**/*.{jpg,png}")
    .pipe(imagemin([
      imagemin.mozjpeg({ progressive: true }),
      imagemin.optipng({ optimizationLevel: 3 }),
    ]))
    .pipe(gulp.dest("build/img"))
}

const copyWebp = () => {
  return gulp.src("source/img/**/*.webp")
    .pipe(gulp.dest("build/img"))
}

const copySvg = () => {
  return gulp.src("source/img/svg/*.svg")
    .pipe(imagemin([
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("build/img/svg"))
}

const spriteSvg = () => {
  return gulp.src("source/img/svg_sprite/*.svg")
    .pipe(imagemin([
      imagemin.svgo()
    ]))
    .pipe(svgstore())
    .pipe(rename("svg_sprite.svg"))
    .pipe(gulp.dest("build/img/svg"))
}

// ---------- временно для проверки работы SVG после сжатия
const copySpriteSvg = () => {
  return gulp.src("source/img/svg_sprite/*.svg")
    .pipe(imagemin([
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("build/img/svg_sprite"))
}
// ---------- временно для проверки работы SVG после сжатия

const buildcss = () => {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(replace("../../img/", "../img/"))
    .pipe(postcss([
      autoprefixer(),
      csso
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

// **********************************************************************

// полная сборка
const build = gulp.series(
  clear,
  buildcss,
  gulp.parallel(copyHtml, copyFavicon, copyCss, copyFonts, copyJs, minifyJs, optimizeImg, copyWebp, copySvg, spriteSvg, copySpriteSvg),
  buildmapjs
);

exports.build = build;

// **********************************************************************

exports.default = gulp.series(
  build, server, watcher // styles, server, watcher
);
