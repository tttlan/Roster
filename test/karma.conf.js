// reading material

// http://jasmine.github.io/2.0/introduction.html
// http://kwilson.me.uk/blog/use-karma-and-grunt-to-run-your-jasmine-tests-in-real-time/

//http://daginge.com/technology/2013/12/14/testing-angular-templates-with-jasmine-and-karma/

module.exports = function(config) {
    config.set({

        basePath: '../../',

        files: [
            // Reason for using jquery 1.x rather than 2.x
            // https://github.com/angular/angular.js/issues/4640
            'http://code.jquery.com/jquery-1.11.3.min.js',
            'interface/js/sherpa-lib.js',
            'interface/js/sherpa.js',
            'interface/js/*.js',
            'interfaceSource/node_modules/angular-mocks/angular-mocks.js',
            'interfaceSource/test/unit/**/*.js',
            'interfaceSource/test/mockDataService.js',
            'interface/views/**/**/*.html',
            'interface/views/**/**/*.json',
            // Config for jasmine-jquery
            'interfaceSource/node_modules/jasmine-jquery/lib/jasmine-jquery.js', {
                pattern: 'interfaceSource/test/mockData/api/**/*.json',
                watched: true,
                served: true,
                included: false
            },
            //'interfaceSource/test/unit/recruit/**/*.spec.js'
        ],

        exclude: [],

        preprocessors: {
            'interface/views/**/**/*.html': ['ng-html2js'],
            'interfaceSource/test/unit/**/*.js': ['babel'],
        },

        babelPreprocessor: {
          options: {
            presets: ['es2015'],
            sourceMap: 'inline'
          }
        },

        ngHtml2JsPreprocessor: {
            'moduleName': 'templates',

            cacheIdFromPath: function(filepath) {
                // we want our view to begin with "/views"
                return filepath.replace("interface\/", "/interface\/");
            }
        },

        autoWatch: true,

        frameworks: ['jasmine'],

        browsers: ['PhantomJS2'],

        plugins: [
            'karma-chrome-launcher',
            'karma-jasmine',
            'karma-junit-reporter',
            'karma-ng-html2js-preprocessor',
            'karma-htmlfile-reporter',
            'karma-phantomjs2-launcher',
            'karma-babel-preprocessor',
        ],

        reporters: ['progress', 'html'],

        htmlReporter: {
            outputFile: 'test_out/units.html',
        },

        junitReporter: {
            outputFile: 'test_out/unit.xml',
            suite: 'unit'
        }

    });
};
