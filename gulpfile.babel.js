import 'babel-polyfill'; // eslint-disable-line no-unused-vars
import copy from './tools/copy';
import runSequence from 'run-sequence';
import path from 'path';
import notify from 'gulp-notify';
import gulpWebpack from 'gulp-webpack';
import webpack, {DefinePlugin} from 'webpack';
import gulp from 'gulp';
import nodemon from 'gulp-nodemon';
import plumber from 'gulp-plumber';
import livereload from 'gulp-livereload';
import sass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import babel from 'gulp-babel';
import iconfont from 'gulp-iconfont';
import iconfontCss from 'gulp-iconfont-css';
import wait from 'gulp-wait';
import imagemin from 'gulp-imagemin';
import pngquant from 'imagemin-pngquant';
import rev from 'gulp-rev';
import revReplace from 'gulp-rev-replace';
import cdnify from 'gulp-cdnify';
import del from 'del';
import fs from 'fs';
import replace from 'gulp-replace';

const handleError = notify.onError({
  title: 'Gulp Error: <%= error.plugin %>',
  message: '<%= error.name %>: <%= error.toString() %>',
});


const args = process.argv.slice(2);
const DEBUG = !(args.indexOf('--release') > -1);
const VERBOSE = args.indexOf('--verbose') > -1;

const cdn = process.env.NODE_ENV === 'production' ?
  'https://o43236zpa.qnssl.com' :
  '';

const GLOBALS = {
  'process.env.NODE_ENV': DEBUG ? '"development"' : '"production"',
  __DEV__: DEBUG,
};

// 需要return gulp
gulp.task('sass', () => {
  return gulp.src(['./src/public/css/*.scss', '!./src/public/css/_*.scss'])
  .pipe(plumber().on('error', handleError))
  .pipe(sass({outputStyle: 'compressed'}).on('error', handleError))
  .pipe(autoprefixer({
    browsers: ['last 2 versions'],
    cascade: false,
  }))
  .pipe(gulp.dest('./build/public/css'))
  .pipe(livereload());
});

gulp.task('es6:server', () => {
  return gulp.src(['./src/**/*.js', '!./src/public/**/*.js'])
  .pipe(babel().on('error', handleError))
  .pipe(gulp.dest('./build/'));
});

gulp.task('es6', () => {
  gulp.src(['./src/public/**/*.js'])
  .pipe(gulpWebpack({
    entry: {
      home: './src/public/js/home.js',
      login: './src/public/js/login.js',
      profile: './src/public/js/profile.js',
      register: './src/public/js/register.js',
      forgot: './src/public/js/forgot.js',
      imota: './src/public/js/imota.js',
    },
    devtool: DEBUG ? 'source-map' : false,
    output: {
      filename: '[name].js',
    },
    watch: DEBUG,
    module: {
      loaders: [{
        test: /\.js$/, loader: 'babel-loader',
      }],
    },
    plugins: [
      new webpack.optimize.OccurenceOrderPlugin(),
      new DefinePlugin(GLOBALS),
      ...(!DEBUG && [
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin({compress: {warnings: VERBOSE}}),
        new webpack.optimize.AggressiveMergingPlugin(),
      ]),
    ],
  }, null, (err, stats) => {
    if (err) {
      console.error(err);
    }
    if (stats.compilation.errors && stats.compilation.errors.length && process.argv.indexOf('--watch') == -1) {
      console.log(stats.compilation.errors);
    }
    if (!DEBUG) {
      fs.writeFile('stats.json', JSON.stringify(stats.toJson()), 'utf8', (error) => {
        if (error) {
          console.log(error);
        }
      });
    }
  }).on('error', handleError))
  .pipe(gulp.dest('./build/public/js/'))
  .pipe(livereload());
});

gulp.task('watch', () => {
  gulp.watch('./src/public/css/**/*.scss', ['sass']);
  // gulp.watch('./src/public/**/*.js', ['es6']);
  gulp.watch(['./src/**/*.js', '!./src/public/**/*.js'], (file) => {
    try {
      const relPath = file.path.substr(path.join(__dirname, './src/').length);
      const relDir = relPath.split('/').slice(0, -1).join('/');
      return gulp.src(`src/${relPath}`)
      .pipe(babel().on('error', handleError))
      .pipe(gulp.dest(`./build/${relDir}`));
    } catch (err) {
      console.log(err);
    }
  });
  // libs
  gulp.watch(['./src/public/libs/**/*'], async (file) => {
    const relPath = file.path.substr(path.join(__dirname, './src/').length);
    await copy(`src/${relPath}`, `build/${relPath}`);
  });
  // views
  gulp.watch(['src/app/views/**/*'], async (file) => {
    const relPath = file.path.substr(path.join(__dirname, './src/').length);
    await copy(`src/${relPath}`, `build/${relPath}`);
  });
  // images
  gulp.watch(['./src/public/img/**/*'], async (file) => {
    const relPath = file.path.substr(path.join(__dirname, './src/').length);
    const relDir = relPath.split('/').slice(0, -1).join('/');
    return gulp.src(`src/${relPath}`)
      .pipe(
        imagemin({
          progressive: true,
          svgoPlugins: [{removeViewBox: false}],
          use: [pngquant()],
        }).on('error', handleError)
      )
      .pipe(gulp.dest(`./build/${relDir}`));
  });
});

gulp.task('copy', () => {
  return Promise.all([
    copy('src/app/views', 'build/app/views'),
    copy('src/public/libs', 'build/public/libs'),
    copy('package.json', 'build/package.json'),
  ]);
});

const fontName = 'shicon';

gulp.task('iconfont', () => {
  return gulp.src('src/public/img/svgs/*.svg')
  .pipe(iconfontCss({
    fontName: fontName,
    path: 'src/public/css/_iconsTpl.scss',
    targetPath: '../css/icons.scss',
    fontPath: '../fonts/',
  }))
  .pipe(iconfont({
    fontName: fontName,
  }))
  .pipe(gulp.dest('src/public/fonts/')).pipe(gulp.dest('build/public/fonts/'));
});

gulp.task('develop', async () => {
  livereload.listen();
  await wait(2);
  return nodemon({
    script: 'build/app.js',
    ext: 'js',
    watch: 'build',
    ignore: 'build/public',
    stdout: false,
    delay: 1,
  }).on('readable', function onReadable() {
    // this.stdout.on('data', function (chunk) {
    //   if(/^Express server listening on port/.test(chunk)){
    //     livereload.changed(__dirname);
    //   }
    // }); // reload when restart
    this.stdout.pipe(process.stdout);
    this.stderr.pipe(process.stderr);
  });
});

gulp.task('imagemin', () => {
  return DEBUG ? gulp.src('src/public/img/**/*').pipe(gulp.dest('build/public/img/')) :
  gulp.src('src/public/img/**/*')
  .pipe(imagemin({
    progressive: true,
    svgoPlugins: [{removeViewBox: false}],
    use: [pngquant()],
  }))
  .pipe(gulp.dest('build/public/img/'));
});

gulp.task('rev', () => {
  return gulp.src([
    'build/public/img/**/*',
    'build/public/js/**/*',
    'build/public/css/**/*',
    'build/public/fonts/**/*',
  ], {base: 'build/public'})
  .pipe(rev())
  .pipe(gulp.dest('build/public/'))
  .pipe(rev.manifest({}))
  .pipe(gulp.dest('build/public/'));
});

gulp.task('revReplace', ()=> {
  const manifest = gulp.src('build/public/rev-manifest.json');
  return gulp.src([
    'build/app/**/*.ejs', 'build/public/js/**/*',
    'build/public/css/**/*'], {
      base: 'build',
    }
  )
  .pipe(revReplace({
    manifest: manifest,
    replaceInExtensions: ['.js', '.css', '.html', '.ejs'],
  }))
  .pipe(gulp.dest('build'));
});

gulp.task('cdnify', () => {
  return gulp.src([
    'build/app/**/*.ejs', 'build/public/js/**/*',
    'build/public/css/**/*'], {
      base: 'build',
    }
  )
  .pipe(cdnify({
    base: cdn,
    rewriter: (url, process) => {
      let result;
      if (/^..\/fonts/.test(url)) {
        return url;
      }
      if (/^\/img\/PIE/.test(url)) {
        return url;
      }
      result = process(url);
      return result;
    },
  }))
  .pipe(replace(/stylesheet\('/, `stylesheet('${cdn}`))
  .pipe(replace(/script\('/, `script('${cdn}`))
  .pipe(gulp.dest('build/'));
});

gulp.task('clean', () => {
  return del(['build']);
});

gulp.task('default', () => {
  runSequence(
    'clean',
    'es6',
    'es6:server',
    'iconfont',
    'sass',
    'copy',
    'imagemin',
    'develop',
    'watch'
  );
});

gulp.task('build', () => {
  return runSequence(
    'clean',
    'es6',
    'es6:server',
    'iconfont',
    'sass',
    'copy',
    'imagemin',
    'rev',
    'revReplace',
    'cdnify'
  );
});
