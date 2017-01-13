angular.module('ui.services')


// Notification handler factory
// ----------------------------------------

.factory('$notify', ['$rootScope', '$location', '$timeout', '$window', function( $rootScope, $location, $timeout, $window) {

  var fullLocation = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
    
  var errors = [];
  var onErrorCallBack = [];
  var onError = function(err) {

      angular.forEach(onErrorCallBack, function(callback) {
          callback(err);
        });

    };

    //sets up watch for page change
  $rootScope.$on('$locationChangeSuccess', function() {
        //clear errors
      errors = [];
        //send clear to watchers
      onError(false);
    });

  return {
      add: function(error) {
          errors.push(error);
          onError(error);
        },
      get: function() {
          return errors[errors.length - 1];
        },
      all: function() {
          return errors;
        },
      setCallback: function(func) {

          if( typeof func === 'function') {
                
              onErrorCallBack.push(func);

            }
        },
      removeCallback: function(ind) {
          onErrorCallBack.splice(ind, 1);
        },
      unauthorisedUser: function() {
          $window.location = fullLocation + '/dashboard';
        },
      kickUser: function() {
          $window.location = fullLocation + '/signin.aspx';
        }
    };

}]);
