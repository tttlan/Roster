angular.module('ui.services')


/*  on Scroll
    
    Sets up watch on window scroll event,
    Observer pattern sets up callback events to fire
    Remember to add in deregister event on scope destroy event

    var registerID = onScroll.register(function(){});

    $scope.$on('$destroy', function(){
      onScroll.deregister(registerID);
    });

*/
.service('onScroll', ['$timeout', '$window', function($timeout, $window) {

  // array of functions to call on screenSize change
  var registeredFuncs = [];
  
  //current screen position
  var scrollPosition = 0;
  
  //run all registered functions
  function callRegisteredFunc() {
    
    angular.forEach(registeredFuncs, function(changeFn) {

      changeFn(scrollPosition);
    
    });

  }

  //check window position
  function checkScrollPosition() {

    //if there are no funcs, lets not fire
    if(!registeredFuncs.length) { return false; }

    var newPos = window.pageYOffset || document.documentElement.scrollTop;

    if( scrollPosition !== newPos ) {
      
      scrollPosition = newPos;
      callRegisteredFunc();
      
    }

  }

  checkScrollPosition();
  angular.element($window).on('scroll', _.throttle(checkScrollPosition, 150));
  
  return {
    get: function() {
      return scrollPosition;
    },
    register: function(callback) {

      if(typeof callback === 'function') {
        
        registeredFuncs.push(callback);
        
        callback(scrollPosition);

        return registeredFuncs.length - 1;

      }
      
    },
    deregister: function(ind) {
      
      if( ind < registeredFuncs.length ) {

        registeredFuncs.splice( ind, 1 );

      }

    }
  };

}]);