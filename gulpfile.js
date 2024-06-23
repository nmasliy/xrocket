const { src, dest, series, watch } = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const del = require('del');
const browserSync = require('browser-sync').create();
const sass = require('sass');
const gulpSass = require('gulp-sass');
const gcmq = require('gulp-group-css-media-queries');
const gulpif = require('gulp-if');
const notify = require('gulp-notify');
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const mainSass = gulpSass(sass);
const webpackStream = require('webpack-stream');
const plumber = require('gulp-plumber');
const nunjucksRender = require('gulp-nunjucks-render');
const prettyHtml = require('gulp-pretty-html');
// paths
const srcFolder = './src';
const buildFolder = './app';
const paths = {
  images: `${srcFolder}/img`,
  scss: `${srcFolder}/scss/files/*.scss`,
  allScss: `${srcFolder}/scss/**/*.scss`,
  buildCss: `${buildFolder}/css`,
  allJs: `${srcFolder}/js/**/*.js`,
  mainJs: `${srcFolder}/js/*.js`,
  buildJs: `${buildFolder}/js`,
  files: `${srcFolder}/files`,
  html: `${srcFolder}/html`,
  buildImages: `${buildFolder}/img`,
};

let isMinified = false;
let isProduction = false;

const clean = () => {
  return del([buildFolder]);
};

const styles = () => {
  return (
    src(paths.allScss, { sourcemaps: !isMinified && !isProduction })
    // src(paths.scss, { sourcemaps: !isMinified && !isProduction })
      .pipe(
        plumber(
          notify.onError({
            title: 'SCSS',
            message: 'Error: <%= error.message %>',
          })
        )
      )
      .pipe(mainSass())
      .pipe(
        autoprefixer({
          cascade: false,
          grid: true,
          overrideBrowserslist: ['last 5 versions'],
        })
      )
      .pipe(gcmq())
      .pipe(
        gulpif(
          isMinified,
          cleanCSS({
            level: 2,
          })
        )
      )
      .pipe(dest(paths.buildCss, { sourcemaps: '.' }))
      .pipe(browserSync.stream())
  );
};

const scripts = () => {
  return src(paths.mainJs)
    // .pipe(
    //   plumber(
    //     notify.onError({
    //       title: 'JS',
    //       message: 'Error: <%= error.message %>',
    //     })
    //   )
    // )
    // .pipe(gulpif(
    //   isMinified,
    //   webpackStream({
    //     mode: 'production',
    //     output: {
    //       filename: 'main.js',
    //     },
    //     module: {
    //       rules: [
    //         {
    //           test: /\.m?js$/,
    //           exclude: /node_modules/,
    //           use: {
    //             loader: 'babel-loader',
    //             options: {
    //               presets: [
    //                 [
    //                   '@babel/preset-env',
    //                   {
    //                     targets: 'defaults',
    //                   },
    //                 ],
    //               ],
    //             },
    //           },
    //         },
    //       ],
    //     },
    //   })
    // ))
    .on('error', function (err) {
      console.error('WEBPACK ERROR', err);
      this.emit('end');
    })
    .pipe(dest(paths.buildJs))
    .pipe(browserSync.stream());
};

const files = () => {
  return src(`${paths.files}/**`).pipe(dest(buildFolder));
};

const images = () => {
  return src([`${paths.images}/*.{jpg,jpeg,png,svg}`])
    .pipe(
      imagemin([
        imagemin.mozjpeg({
          quality: 90,
          progressive: true,
        }),
        imagemin.optipng({
          optimizationLevel: 2,
        }),
      ])
    )
    .pipe(dest(paths.buildImages));
};

const webpImages = () => {
  return src([`${paths.images}/*.{jpg,jpeg,png}`])
    .pipe(webp({ quality: 85 }))
    .pipe(dest(paths.buildImages));
};

const html = () => {
  return src([`${paths.html}/pages/*.njk`])
    .pipe(nunjucksRender({
      path: [`${paths.html}/templates`, `${paths.html}/blocks`]
    }))
    .pipe(prettyHtml({
      indent_size: 2,
      preserve_newlines: true,
      max_preserve_newlines: 1
    }))
    .pipe(dest(buildFolder))
    .pipe(browserSync.stream());
};

const watchFiles = () => {
  browserSync.init({
    server: {
      baseDir: `${buildFolder}`,
    },
  });

  watch(paths.allScss, styles);
  watch(paths.allJs, scripts);
  watch(`${srcFolder}/**/*.html`, html);
  watch(`${paths.files}/**`, files);
  watch(`${paths.images}/**/**.{jpg,jpeg,png,svg}`, images);
  watch(`${paths.images}/**/**.{jpg,jpeg,png}`, webpImages);
  watch(`${paths.html}/**/**.{html,njk}`, html);
};

const toProductionBuild = (done) => {
  isMinified = true;
  done();
};

const toMinifiedBuild = (done) => {
  isMinified = true;
  done();
};

exports.default = series(
  clean,
  html,
  scripts,
  styles,
  files,
  images,
  webpImages,
  watchFiles
);

exports.build = series(
  toProductionBuild,
  clean,
  html,
  scripts,
  styles,
  files,
  images,
  webpImages,
);

exports.minifiedBuild = series(
  toMinifiedBuild,
  clean,
  html,
  scripts,
  styles,
  files,
  images,
  webpImages,
)