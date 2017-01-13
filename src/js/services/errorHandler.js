angular.module('ui.services')


// Error handler factory
// ----------------------------------------

.factory('$error', ['$rootScope', '$location', '$timeout', function( $rootScope, $location, $timeout) {

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
      kickUser: function() {
          console.log( '//' + window.location.hostname);
             //window.location = '//' + window.location.hostname;
        }
    };

}]);