angular.module('ui.services')


/*  onResize observer
    
    Sets up watch on media query change event,
    Observer pattern sets up callback events to fire
    Remember to add in deregister event on scope destroy event

    var screenEventIndex = screenSize.register(function(size){});

    $scope.$on('$destroy', function(){
      screenSize.deregister(screenEventIndex);
    });

*/
.service('onResize', ['$window', '$timeout', function($window, $timeout) {

  var $win = angular.element($window);
    // array of functions to call on screenSize change
  var onResizeChanges = [];

    //current Screensize
  var screenSize = {
      width: 0,
      height: 0
    };

  function callChanges() {
        
      angular.forEach(onResizeChanges, function(changeFn) {

          changeFn(screenSize);

        });

    }

  function getDimensions() {
      return {
          width: $win.width(),
          height: $win.height()
        };
    }

  function checkWidth() {
      var newDimensions = getDimensions();  

      if( newDimensions !== screenSize ) {
          
          screenSize = newDimensions;

          callChanges();
          
        }

    }
  $win.on('resize', function() {

      checkWidth();

    });

  return {
      get: function() {
          return getDimensions();
        },
      triggerResize: _.debounce( function() {
          screenSize = getDimensions();
          callChanges();
        }, 50),
      register: function(callback, dontCallOnLoad) {

          if(typeof callback === 'function') {
            
            onResizeChanges.push(callback);
            
            if(!dontCallOnLoad) {
              callback(getDimensions());              
            }

          }
          
        },
      deregister: function(fn) {
          var len = onResizeChanges.length;

          for(len;len--;) {
            if( onResizeChanges[len] === fn) {
             onResizeChanges.splice(len, 1);
           }
          }
        }
    };

}]);