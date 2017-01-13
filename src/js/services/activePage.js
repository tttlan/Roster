angular.module('ui.services')


// Active Page factory
// - sets the active page state for controllers to leverage from
// ----------------------------------------
.service('activePage', ['$rootScope', '$location', function($rootScope, $location) {

  var activePaths = [];

  var getActivePath = function(path) {
      return path.split('/').splice(1) || '';
    };

    //sets up watch for page change
  $rootScope.$on('$locationChangeSuccess', function() {
      var newPath = $location.path();
      activePaths = getActivePath(newPath);
    });

  return {
      activePaths: activePaths,
      isActive: function(paths) {

          var isActive = true;
          var len = paths.length;

          if( len !== activePaths.length || !len || len > activePaths.length) {
              return;
            }
            
          for(var i=0; i < len; i++) {
                
              if( paths[i] !== activePaths[i] && paths[i] !== '*') {

                  isActive = false;
                  break;
                }

            }

          return isActive;
        }
    };

}]);
