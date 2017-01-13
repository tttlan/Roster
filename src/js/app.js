// Define Global Sherpa
var SHRP = SHRP || {};
SHRP.data = SHRP.data || {};
SHRP.isMinified = !/param/.test(function(param) {}); // Set a flag to test if the codebase is minfied

// Angular declaration
// ------------------------------------------------

// ref:
// structure: http://briantford.com/blog/huuuuuge-angular-apps.html
// modularized angular: http://henriquat.re/modularizing-angularjs/modularizing-angular-applications/modularizing-angular-applications.html
// pattern: http://clintberry.com/2013/modular-angularjs-application-design/


// Define Modules
angular.module('ui.common', []);
angular.module('ui.common.directives', ['ngAnimate']);
angular.module('ui.common.panes', []);
angular.module('ui.common.texteditor', []);
angular.module('ui.common.controllers', []);
angular.module('ui.common.filters', ['ngSanitize']);
angular.module('ui.common.modal', ['ui.bootstrap.transition']);
angular.module('ui.common.drawer', ['ui.common.modal']);
angular.module('ui.services', []);
angular.module('ui.newsFeed', ['ngAnimate']);
angular.module('ui.activity', ['ngAnimate']);
angular.module('ui.member', []);
angular.module('ui.formbuilder', []);
angular.module('ui.training', []);
angular.module('ui.recruit.models', []);
angular.module('ui.recruit.onboard', ['ng-mfb']);
angular.module('ui.recruit.candidatepool', ['ngAnimate', 'angularMoment', 'ng-mfb']);
angular.module('ui.recruit.job-requisition', ['ng-mfb']);
angular.module('ui.recruit.candidateonboard', ['ngSanitize', 'signature']);
angular.module('ui.recruit.jobs', []);
angular.module('ui.recruit.models', []);
angular.module('ui.recruit.jobs', ['ui.recruit.models']);
angular.module('ui.recruit', ['ui.recruit.onboard', 'ui.recruit.candidateonboard', 'ui.recruit.candidatepool', 'ui.recruit.job-requisition', 'ui.recruit.jobs']);
angular.module('ui.support', []);
angular.module('ui.roster', []);
angular.module('ui.profile', []);
angular.module('ui.survey', []);
angular.module('ui.libraries', ['as.sortable', 'ng-mfb']);
angular.module('ui.events', ['angularMoment']);
angular.module('ui.mockData', []);
angular.module('ui.common.explorer', ['ui.bootstrap.collapse']);

// Define a global sherpa app which includes the above
var sherpa = angular.module('sherpa', [
    'ngRoute',
    'textAngular',
    'angularLoad',
    'jmdobry.angular-cache',
    'ui.bootstrap',
    'ui.services',
    'ui.common.directives',
    'ui.common.panes',
    'ui.common.texteditor',
    'ui.common.controllers',
    'ui.common.filters',
    'ui.common.modal',
    'ui.common.drawer',
    'ui.common.explorer',
    'ui.common',
    'ui.newsFeed',
    'ui.activity',
    'ui.member',
    'ui.formbuilder',
    'ui.training',
    'ui.recruit',
    'ui.support',
    'ui.profile',
    'ui.events',
    'ui.libraries',
    'ui.mockData',
    'ngCookies',
    'ngMessages',
    'ui.survey',
    'ngScrollbars'
])


// Angular Configuration
// ------------------------------------------------

.constant('API_BASE_URL', SHRP.API_URL ? SHRP.API_URL.toLowerCase() : 'http://localhost:83/api/')
.constant('IS_LOCALHOST', window.location.href.indexOf('interfaceTemplates') !== -1)
.constant('BASE_URL', (window.location.href.indexOf('interfaceTemplates') !== -1) ? '/interfaceTemplates/' + SHRP.data.localSection + '.html#' : '')
.constant('TIME_ZONE_ID', 'Australia/Melbourne')
.constant('USE_PROFILE_TZ', true)

.run(['$rootScope', 'BASE_URL', '$anchorScroll', '$location', '$timeout', function($rootScope, BASE_URL, $anchorScroll, $location, $timeout) {

  $rootScope.$on('$routeChangeSuccess', function(event, current, previous) {

        // Set page title to the value in the pages route
      if (current.$$route && current.$$route.title) {
          $rootScope.title = current.$$route.title;
        }
        
        // If a hash has been passed into the URL, wait till the element the hash referes to is in the DOM and then scroll to it
        if ($location.hash()) {
            var anchorListener = $rootScope.$watch(function() {
               return angular.element('#' + $location.hash() + ':visible').length;
            }, function(val) {
                if (val) {
                    anchorListener(); // Clear watch
                    $timeout(function() {
                        $anchorScroll();
                    }, 1000); // Allow a little more time for the page to render
                }
            });
        }
    });

  $rootScope.$watch('title', function() {
        // When the title is set, add a pipe to the end of it.  Using a watch as some titles are set async
      if (($rootScope.title) && ($rootScope.title.indexOf('|') === -1)) {
          $rootScope.title += ' | ';
        }
    });

    //Push BASE_URL into rootscope
  $rootScope.BASE_URL = BASE_URL;

}]);
