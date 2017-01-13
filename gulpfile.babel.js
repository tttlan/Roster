'use strict';

const plugins = require('gulp-load-plugins')();
const gulp = require('gulp');
const del = require('del');
const Fs = require('fs');
const lazypipe = require('lazypipe');
const merge = require('merge-stream');
const notifier = require('node-notifier');
const Path = require('path');
const runSequence = require('run-sequence').use(gulp);
const babel = require('gulp-babel');
const eslint = require('gulp-eslint');
import { Server as KarmaServer } from 'karma';

///////////////////////////////////////////////////
// All gulp tasks should be listed here, upfront //
///////////////////////////////////////////////////

gulp.task('default', defaultTask);
gulp.task('deploy', deployTask);
gulp.task('build', ['clean-deploy'], buildTask);
gulp.task('fonts-sass-deploy', iconFontDeploy);
gulp.task('clean', cleanTask);
gulp.task('clean-deploy', cleanDeploy);
gulp.task('stylus', stylus);
gulp.task('stylus-deploy', stylusDeploy);
gulp.task('vendor-css', vendorCss);
gulp.task('vendor-css-deploy', vendorCssDeploy);
gulp.task('iconfont', iconFont);
gulp.task('svg-sprite', svgSprite);
gulp.task('image-compress', imageCompress);
gulp.task('build-js-vendor', buildJsVendor);
gulp.task('build-js-sherpa', buildJsSherpa);
gulp.task('ng-templates-create', ngTemplatesCreate);
gulp.task('ng-templates-clean', ngTemplatesClean);
gulp.task('copy-views', copyViews);
gulp.task('copy-views-deploy', copyViewsDeploy);
gulp.task('copy-images', copyImages);
gulp.task('copy-svg-sprite', copySvgSprite);
gulp.task('appcache-manifest', appcacheManifest);
gulp.task('watch', watchTask);
gulp.task('lint:fix', lintFixTask);
gulp.task('lint:watch', lintWatchTask);

///////////////////////////////////////////////////
// Configurations                                //
///////////////////////////////////////////////////

let OPTIONS = {
  DO_UGLIFY: false,
  DO_SOURCEMAPS: true,
  watchInterval: 1000
};

// bundled to main sherpa.js file
const JS_COMMON = [
  'src/js/app.js',
  'src/js/activity/**/*.js',
  'src/js/common/**/*.js',
  'src/js/panes/**/*.js',
  'src/js/services/**/*.js',
  'src/js/**/models/**/*.js'
];

// bundles to sherpa-[modulename].js
const JS_PACKAGES = [
  'events',
  'libraries',
  'newsfeed',
  'onboarding',
  'profile',
  'roster',
  'support',
  'training',
  'recruit',
  'survey',
  'formbuilder'
];

const VENDOR_CSS = [
  'node_modules/ng-material-floating-button/mfb/dist/mfb.css',
  'node_modules/textangular/src/textAngular.css',
  'node_modules/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.css'
];

function defaultTask(cb) {
  runSequence('clean', [
    'build-js-vendor',
    'build-js-sherpa',
    'stylus',
    'vendor-css',
    'copy-views'
    ],
    'docs-start',
    'start-storage-emulator',
    'watch'
    ,cb);
}

function deployTask(cb) {
  OPTIONS.DO_UGLIFY = true;
  OPTIONS.DO_SOURCEMAPS = false;

  return runSequence(
    'build',
    'unit-tests',
    'appcache-manifest',
    'start-storage-emulator'
    ,cb);
}

function buildTask(cb) {
  OPTIONS.DO_UGLIFY = true;
  OPTIONS.DO_SOURCEMAPS = false;

  return runSequence(
    'fonts-sass-deploy',
    'vendor-css-deploy',
    'ng-templates-create',
    'build-js-vendor',
    'build-js-sherpa',
    'ng-templates-clean',
    'docs-copy',
    'appcache-manifest',
    cb);
}

function iconFontDeploy(cb) {
  return runSequence('iconfont', [
    'stylus-deploy',
    'image-compress',
    'copy-views-deploy',
    'copy-svg-sprite'
    ],
    cb);
}

function cleanTask() {
  return del([
    '../interface/app.manifest',
    '../interface/js/**'
  ], {
    force: true
  });
}

function cleanDeploy() {
  return del([
    '../interface/css/**',
    '../interface/fonts/**',
    '../interface/images/**',
    '../interface/js/**',
    '../interface/views/**',
    '../interface/svg/**',
    'docs/interface/**'
    ], {
    force: true
  });
}

function vendorCss() {
  return gulp.src(VENDOR_CSS)
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.concat('vendor.css'))
    .pipe(plugins.sourcemaps.write('./'))
    .pipe(gulp.dest('../interface/css/'));
}

function vendorCssDeploy() {
  return gulp.src(VENDOR_CSS)
    .pipe(plugins.minifyCss())
    .pipe(plugins.concat('vendor.css'))
    .pipe(gulp.dest('../interface/css/'));
}

function stylus() {
  return gulp.src('src/css/screen.styl')
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.stylus())
      .on('error', handleNotification)
    .pipe(plugins.rename(function (path) {
      path.basename = path.basename.replace('screen', 'sherpa');
    }))
    .pipe(plugins.sourcemaps.write('./'))
    .pipe(gulp.dest('../interface/css/'));
}

function stylusDeploy() {
  return gulp.src([
      'src/css/screen.styl',
      'src/css/screen-*.styl'
    ])
    .pipe(plugins.stylus())
    .on('error', handleNotification)
    .pipe(plugins.autoprefixer({
      browsers: ['last 2 versions', '> 0.5% in AU', 'ie 9'],
      cascade: false
    }))
    .pipe(plugins.minifyCss())
    .pipe(plugins.rename(function (path) {
      path.basename = path.basename.replace('screen', 'sherpa');
    }))
    .pipe(gulp.dest('../interface/css/'));
}

function iconFont() {
  return gulp.src('src/icons/**/*.svg')
    .pipe(plugins.iconfont({
      fontName: 'sherpa',
      normalize: true,
      startCodepoint: 0xE601
    }))
    .on('codepoints', codepoints => {
      gulp.src('src/css/elements/icons-template.tmpl')
        .pipe(plugins.consolidate('lodash', {
          glyphs: codepoints,
          className: 'icon--'
        }))
        .pipe(plugins.rename('icons.styl'))
        .pipe(gulp.dest('src/css/elements/'));

      gulp.src('src/css/elements/markup/icons.tmpl')
        .pipe(plugins.consolidate('lodash', {
          glyphs: codepoints,
          className: 'icon--'
        }))
        .pipe(plugins.rename('icons.hbs'))
        .pipe(gulp.dest('src/css/elements/markup/'));
    })
    .pipe(gulp.dest('../interface/fonts/'));
}

function svgSprite() {
  let filterStylus = plugins.filter('svg-sprite.styl');
  let filterSVG = plugins.filter('sprite.svg');

  return gulp.src('src/svg/*.svg')
    .pipe(plugins.svgSprites({
      cssFile: 'svg-sprite.styl',
      svg: {
          sprite: "sprite.svg"
        },
      svgPath: '../svg/sprite.svg',
      selector: "iconSVG-%f",
      preview: false
    }))
    .pipe(filterStylus)
    .pipe(gulp.dest('src/css/elements/'))
    .pipe(filterStylus.restore())
    .pipe(filterSVG)
    .pipe(plugins.svgmin())
    .pipe(gulp.dest('../interface/svg/'));
}

function imageCompress() {
  return gulp.src('src/images/**/*')
    .pipe(plugins.newer('../interface/images/'))
    .pipe(plugins.imagemin())
    .pipe(gulp.dest('../interface/images/'));
}

function buildJsVendor() {
    // don't do sourcemaps for vendor libs
  OPTIONS.DO_SOURCEMAPS = false;

  let lib = gulp.src([
    'node_modules/moment/moment.js',
    'node_modules/moment-timezone/moment-timezone.js',
    'node_modules/lodash/index.js',
    'node_modules/babel-polyfill/dist/polyfill.min.js',
    'node_modules/angular/angular.js',
    'node_modules/angular-animate/angular-animate.js',
    'node_modules/angular-cache/dist/angular-cache.js',
    'node_modules/angular-resource/angular-resource.js',
    'node_modules/angular-cookies/angular-cookies.js',
    'node_modules/angular-route/angular-route.js',
    'node_modules/angular-sanitize/angular-sanitize.js',
    'node_modules/angular-messages/angular-messages.js',
    'node_modules/angular-load/angular-load.js',
    'node_modules/angular-moment/angular-moment.min.js',
    'node_modules/ng-sortable/dist/ng-sortable.js',
    'node_modules/Sortable/Sortable.js',
    'node_modules/rangy/lib/rangy-core.js',
    'node_modules/rangy/lib/rangy-selectionsaverestore.js',
    'node_modules/textangular/src/textAngular.js',
    'node_modules/textangular/src/textAngularSetup.js',
    'node_modules/ng-material-floating-button/src/mfb-directive.js',
    'node_modules/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.js',
    'node_modules/ng-scrollbars/dist/scrollbars.min.js',
    'node_modules/angular-drag-and-drop-lists/angular-drag-and-drop-lists.js',
      // This is anything we don't manage with NPM
    'src/js/lib/*.js',

      // These files are NOT concatentated so they need to be excluded
    '!src/js/lib/pdf.js',
    '!src/js/lib/pdf.worker.js',
    '!src/js/lib/unsupported-browser.js'
  ])
  .pipe(packJS('sherpa-lib')());

    // Assets we don't want to concatentate into sherpa-lib.js
  let jquery = gulp.src('node_modules/jquery/dist/jquery.js')
    .pipe(packJS('jquery', 'jq')());

  let pfdjs = gulp.src('src/js/lib/pdf.js')
    .pipe(packJS('pdf', 'lib')());

  let pfdjsWorker = gulp.src('src/js/lib/pdf.worker.js')
    .pipe(packJS('pdf.worker', 'lib')());

  let respond = gulp.src('node_modules/respond.js/src/respond.js')
    .pipe(packJS('respond', 'polyfill')());

  let moxie = gulp.src('node_modules/moxie/bin/js/moxie.js')
    .pipe(packJS('moxie', 'polyfill')());

  let moxie2 = gulp.src('node_modules/moxie/bin/flash/Moxie.min.swf')
    .pipe(gulp.dest('../interface/js/polyfill/'));

  let xdomain = gulp.src('node_modules/xdomain/dist/xdomain.js')
    .pipe(packJS('xdomain', 'polyfill')());

  let d3 = gulp.src('node_modules/d3/d3.js')
    .pipe(packJS('d3', 'lib')());

  let unsupportedBrowser = gulp.src('src/js/lib/unsupported-browser.js')
    .pipe(packJS('unsupported-browser', 'jq')());

  return merge(lib,
    jquery,
    pfdjs,
    pfdjsWorker,
    respond,
    moxie,
    moxie2,
    xdomain,
    d3,
    unsupportedBrowser);
}

function lintFixTask() {
  return gulp.src(['src/js/**/*.js', '!src/js/lib/**/*.js'])
    .pipe(eslint({fix: true}))
    .pipe(eslint.format())
    .pipe(gulp.dest('src/js/'));
}

function lintWatchTask() {
  return gulp.watch('src/js/**/*.js', ['lint']);
}

function buildJsSherpa() {
  let common = gulp.src(JS_COMMON)
    .pipe(eslint({quiet: true}))
    .pipe(eslint.format())
    .pipe(babel())
    .pipe(packJS('sherpa')())
    .on('error', handleNotification)
    .pipe(gulp.dest('../interface/js/'));

  let jsPackagePipes = [];

  for (let i = 0; i < JS_PACKAGES.length; i++) {
      jsPackagePipes[i] = gulp.src('src/js/' + JS_PACKAGES[i] + '/**/*.js')
        .pipe(eslint({quiet: true}))
        .pipe(eslint.format())
        .pipe(babel())
        .pipe(packJS('sherpa-' + JS_PACKAGES[i])())
        .on('error', handleNotification)
        .pipe(gulp.dest('../interface/js/'));
    }

  return merge(common, jsPackagePipes);
}
 
function ngTemplatesCreate() {
  let streams = [];
  
  // existsSync has been deprecated. If it is removed, have a look into
  // `is-there` instead. `is-there` was not working correctly at the time
  // this was written which is why it wasn't used in the first place.
  // https://github.com/IonicaBizau/node-is-there
  let getFoldersWithPartials = dir => 
    Fs.readdirSync(dir)
    .filter(file => 
      Fs.existsSync(Path.join(dir, file) + '\\templates\\partials', () => 
        Fs.statSync(Path.join(dir, file)).isDirectory()));

  let addToTemplateCache = templateFolder =>
    lazypipe()
    .pipe(plugins.angularTemplatecache, {
      filename: 'z_ng-templates-combined.js',
      module: 'sherpa',
      root: '/interface/views/' + templateFolder + '/partials/'
    })
    .pipe(gulp.dest, 'src/js/' + templateFolder);

  let foldersWithPartials = getFoldersWithPartials('src/js/');

  for (let i = 0; i < foldersWithPartials.length; i++) {
    streams[i] = gulp
      .src('src/js/' + foldersWithPartials[i] + '/**/*.html')
      .pipe(addToTemplateCache(foldersWithPartials[i])());
  }

  return merge(streams);
}

function ngTemplatesClean() {
  return del('src/js/**/*ng-templates-combined.js', {
    force: false
  });
}

function copyViews() {
  return gulp.src('src/js/**/templates/**/*')
    .pipe(plugins.rename(function (path) {
      path.dirname = path.dirname.replace('\\templates', '');
    }))
    .pipe(gulp.dest('../interface/views/'));
}

function copyViewsDeploy() {
    // Return only the base level views and not the partials and also the form json structures
  return gulp.src([
      'src/js/**/templates/**/*.html',
      'src/js/**/templates/form-data/**'
    ])
    .pipe(plugins.rename(function (path) {
      path.dirname = path.dirname.replace('\\templates', '');
    }))
    .pipe(gulp.dest('../interface/views/'));
}

function copyImages() {
  return gulp.src('src/images/**/*')
    .pipe(gulp.dest('../interface/images/'));
}

function copyFonts() {
  return gulp.src('src/fonts/**/*')
    .pipe(gulp.dest('../interface/fonts/'));
}

function copySvgSprite() {
  return gulp.src('src/svg/sprite.svg')
    .pipe(plugins.svgmin())
    .pipe(gulp.dest('../interface/svg/'));
}

function appcacheManifest() {
  return gulp.src([
      // Ignore any files in the root of /interface/
      '../interface/*/**',
      // Ignore source maps and the media and app cache folders
      '!' + '../interface/**/*.map',
      '!' + '../interface/media/**',
      '!' + '../interface/app-cache/**'
    ])
    .pipe(plugins.rename(function (path) {
      path.dirname = '/interface/' + path.dirname;
    }))
    .pipe(plugins.manifest({
      timestamp: true,
      preferOnline: true,
      network: ['http://*', 'https://*', '*'],
      filename: 'app.manifest'
    }))
    // Add in leading slash
    .pipe(plugins.replace('interface/', '/interface/'))
    .pipe(gulp.dest('../interface/app-cache/'));
}

function docsClean() {
  return del('docs/*.html');
}

function docsCopy() {
  let images = gulp.src('src/images/**')
    .pipe(gulp.dest('docs/interface/images'));

  let fonts = gulp.src('../interface/fonts/**')
    .pipe(gulp.dest('docs/interface/fonts'));

  let svg = gulp.src('src/svg/**')
    .pipe(gulp.dest('docs/interface/svg'));

  let js = gulp.src('../interface/js/**')
    .pipe(gulp.dest('docs/interface/js'));

  let css = gulp.src('../interface/css/**')
    .pipe(gulp.dest('docs/interface/css'));

  let views = gulp.src('src/js/**/templates/**')
    .pipe(plugins.rename(function (path) {
      path.dirname = path.dirname.replace('\\templates', '');
    }))
    .pipe(gulp.dest('docs/interface/views'));

  return merge(images, fonts, svg, js, css, views);
}

function docsServer() {
  plugins.connect.server({
    root: 'docs',
    port: 3000
  });
  gulp.src('./index.html')
    .pipe(plugins.open({
      app: "chrome",
      uri: "http://localhost:3000"
    }));
}

function docsRebuild(cb) {
  return runSequence('docs-compile', 'docs-copy', cb);
}

function docsStart(cb) {
  return runSequence('docs-compile', 'docs-copy', 'docs-server', cb);
}

function watchTask() {
  plugins.livereload.listen();

  gulp.watch('src/css/**/*.styl', {
      interval: OPTIONS.watchInterval
    }, () => {
        runSequence('stylus', 'stylus-deploy', 'docs-rebuild');
    });

  gulp.watch('src/icons/**/*.svg', {
      interval: OPTIONS.watchInterval
    }, () => {
      runSequence('iconfont');
    });

  gulp.watch('src/images/**', {
      interval: OPTIONS.watchInterval
    }, () => {
      runSequence('copy-images', 'docs-copy');
    });

  gulp.watch('src/svg/sprite.svg', {
      interval: OPTIONS.watchInterval
    }, () => {
      runSequence('copy-svg-sprite', 'docs-copy');
    });

    // vendor JS
  gulp.watch([
      'src/js/lib/*.js'
    ], {
      interval: OPTIONS.watchInterval
    }, () => {
      runSequence('build-js-vendor', 'docs-copy');
    });

    // sherpa JS
  gulp.watch([
      'src/js/**/*.js',
      '!src/js/lib/*.js'
    ], {
      interval: OPTIONS.watchInterval
    }, () => {
        runSequence('build-js-sherpa', 'docs-copy');
    });

  gulp.watch('src/js/**/*.html', {
      interval: OPTIONS.watchInterval
    }, () => {
      runSequence('copy-views', 'docs-copy');
    });

  gulp.watch('docs/_template/**', {
      interval: OPTIONS.watchInterval
    }, () => {
      runSequence('stylus', 'docs-rebuild');
    });

    // The other watch tasks will trigger a change to the dist path, watch for it here
    // and LiveReload when anything in the dist path changes
  gulp.watch('../interface/**/*', {
      interval: OPTIONS.watchInterval
    }).on('change', function (file) {
      setTimeout(function () {
            // Allow time for the copy task to finish
          plugins.livereload.changed(file);
        }, 1000);
    });

  handleNotification('Watching for changes');
}

//////////////////////
// Helper functions //
//////////////////////
function packJS(name, subfolder) {
  let destPath = '../interface/js/' + (!!subfolder ? subfolder + '/' : '');
  let fileName = name + '.js';

  return lazypipe()
    .pipe(function () {
      return plugins.if(OPTIONS.DO_SOURCEMAPS, plugins.sourcemaps.init());
    })
    .pipe(plugins.concat, fileName)
    .pipe(plugins.ngAnnotate)
    .pipe(function () {
      return plugins.if(OPTIONS.DO_UGLIFY, plugins.uglify({
          preserveComments: 'some',
          compress: {
              drop_console: true
            }
        }));
    })
    .pipe(function () {
      return plugins.if(OPTIONS.DO_SOURCEMAPS, plugins.sourcemaps.write('./'));
    })
    .pipe(gulp.dest, destPath);
}

function handleNotification(message) {
  notifier.notify({
    message: message.toString()
  });
  console.log('error:', message); // can see proper error message
}

function buildUiTests(filenames, bundleName) {
  let files = [];
  files.push('test/visual/_partials/header.js');
  filenames.forEach(function (item) {
      files.push('test/visual/_partials/' + item + '.js');
    });
  files.push('test/visual/_partials/footer.js');

  return gulp.src(files)
    .pipe(plugins.concat(bundleName + '.js'))
    .pipe(gulp.dest('test/visual'));
}

function uiTestsCompile() {
  let dashboard = buildUiTests(['dashboard'], 'dashboard');
  let latestNews = buildUiTests(['latest-news'], 'latest-news');
  let directory = buildUiTests(['directory'], 'directory');
  let training = buildUiTests(['training'], 'training');
  let all = buildUiTests(['dashboard', 'latest-news', 'directory', 'training'], 'all');

  return merge(dashboard, latestNews, directory, training, all);
}

// lesser used tasks
gulp.task('docs-compile', plugins.shell.task([
  'kss-node ../../../src/css ../../../docs --template ../../../docs/_template'
], {
  cwd: 'node_modules/kss/bin/'
}));
gulp.task('docs-clean', docsClean);
gulp.task('docs-copy', docsCopy);
gulp.task('docs-server', docsServer);
gulp.task('docs-rebuild', docsRebuild);
gulp.task('docs-start', docsStart);

gulp.task('unit-tests', done => {
  // more proper way of running tests programmatically 
  // rather than using ugly shell tasks.
  return new KarmaServer({
      configFile: __dirname + '/test/karma.conf.js',
      singleRun: true,
      module: "rosterTimeOff"
    }, (result) => {
        if (result) {
          return done("Karma tests failed - forcing exit");
        }
        done();
     })
    .start();
});

gulp.task('unit-tests-roster-timeoff', plugins.shell.task('karma start test/karma.conf.js --single-run --module rosterTimeOff'));
gulp.task('unit-tests-cost-centers', plugins.shell.task([
  'karma start test/karma.conf.js  --single-run --module costCenter'
, '"C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe" --allow-file-access-from-files file:///E:/Dev/SherpaRoster/website/Sherpa/test_out/units.html']));

gulp.task('unit-tests-shift-positions', plugins.shell.task([
  'karma start test/karma.conf.js  --single-run --module shiftPosition'
, '"C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe" --allow-file-access-from-files file:///E:/Dev/SherpaRoster/website/Sherpa/test_out/units.html']));

gulp.task('unit-tests-timesheet', plugins.shell.task([
  'karma start test/karma.conf.js  --single-run --module timesheet'
, '"C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe" --allow-file-access-from-files file:///E:/Dev/SherpaRoster/website/Sherpa/test_out/units.html']));

gulp.task('ui-tests-compile', uiTestsCompile);
gulp.task('ui-tests', ['ui-tests-compile'], plugins.shell.task(['casperjs.bat test ../all.js'], {
  cwd: 'test/visual/PhantomCSS'
}));
gulp.task('ui-test-dashboard', ['ui-tests-compile'], plugins.shell.task(['casperjs.bat test ../dashboard.js'], {
  cwd: 'test/visual/PhantomCSS'
}));
gulp.task('ui-test-latest-news', ['ui-tests-compile'], plugins.shell.task(['casperjs.bat test ../latest-news.js'], {
  cwd: 'test/visual/PhantomCSS'
}));
gulp.task('ui-test-directory', ['ui-tests-compile'], plugins.shell.task(['casperjs.bat test ../directory.js'], {
  cwd: 'test/visual/PhantomCSS'
}));
gulp.task('ui-test-training', ['ui-tests-compile'], plugins.shell.task(['casperjs.bat test ../training.js'], {
  cwd: 'test/visual/PhantomCSS'
}));
gulp.task('start-storage-emulator', plugins.shell.task(['csrun.exe /devstore:start' ], {cwd: 'C:\\Program Files\\Microsoft SDKs\\Azure\\Emulator\\'}));