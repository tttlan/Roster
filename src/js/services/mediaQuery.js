angular.module('ui.services')


/*  onResize, that also grabs the current media query, if needed
    
    Sets up watch on media query change event,
    Observer pattern sets up callback events to fire
    Remember to add in deregister event on scope destroy event

    var screenEventIndex = screenSize.register(function(size){});

    $scope.$on('$destroy', function(){
      screenSize.deregister(screenEventIndex);
    });

*/
.service('mediaQuery', ['onResize', '$window', '$timeout', function(onResize, $window, $timeout) {

  var screenSize;
  var onScreenChanges = [];
  function checkMediaQuery() {

    var newScreenSize = $window.getComputedStyle(document.body,':after').getPropertyValue('content').replace(/'/g, '');

    if( newScreenSize !== screenSize ) {
      
      screenSize = newScreenSize;

      callChanges();
      
    }

  }

  function callChanges() {

    angular.forEach(onScreenChanges, function(changeFn) {

        changeFn(screenSize);

      });

  }

  angular.element(document).ready(function() {
    $timeout(function() {
      checkMediaQuery();
    }, 100);
    
  });

  onResize.register(checkMediaQuery);

  return {
    get: function() {
      checkMediaQuery();

      return screenSize;
    },
    register: function(callback) {

      if(typeof callback === 'function') {
        
        onScreenChanges.push(callback);
        
        callback(screenSize);

        return onScreenChanges.length - 1;

      }
      
    },
    deregister: function(fn) {

      var len = onScreenChanges.length;

      for(len;len--;) {
        if( onScreenChanges[len] === fn) {
         onScreenChanges.splice(len, 1);
       }
      }
    }
  };

}]);
