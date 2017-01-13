angular.module('ui.common')

.filter('roundTime', function() {
  
  return function(date, minutesToRoundBy) {

    var minutes = minutesToRoundBy || 5; // default to 5minutes
    var roundedMinutes = 1000 * 60 * minutes;
    
    return new Date(Math.round(date.getTime() / roundedMinutes) * roundedMinutes);
  
  };

});

angular.module('ui.bootstrap.timepicker', [])

.constant('timepickerConfig', {
  hourStep: 1,
  minuteStep: 5,
  showMeridian: true,
  meridians: null,
  readonlyInput: false,
  mousewheel: true
})

.directive('timepicker', ['$parse', '$log', 'timepickerConfig', '$locale', '$filter', function($parse, $log, timepickerConfig, $locale, $filter) {
  return {
    restrict: 'EA',
    require:'?ngModel',
    replace: true,
    transclude: 'element',
    scope: {},
    templateUrl: 'template/cache/timepicker.html',
    link: function(scope, element, attrs, ngModel, linker) {
      
      if ( !ngModel ) {
        return; // do nothing if no ng-model
      }

      scope.isVisible = false;

      linker(function(clone) {
        
        clone.on('focus', function() {
          scope.$apply(function() {
            scope.isVisible = true;
            updateTemplate();
          });

        
        });

        element.prepend(clone);

      });


      var selected = $filter('roundTime')(new Date(), 5),
        meridians = angular.isDefined(attrs.meridians) ? scope.$parent.$eval(attrs.meridians) : timepickerConfig.meridians || $locale.DATETIME_FORMATS.AMPMS;

      var hourStep = timepickerConfig.hourStep;
      if (attrs.hourStep) {
        scope.$parent.$watch($parse(attrs.hourStep), function(value) {
          hourStep = parseInt(value, 10);
        });
      }

      var minuteStep = timepickerConfig.minuteStep;
      if (attrs.minuteStep) {
        scope.$parent.$watch($parse(attrs.minuteStep), function(value) {
          minuteStep = parseInt(value, 10);
        });
      }

      // 12H / 24H mode
      scope.showMeridian = timepickerConfig.showMeridian;
      if (attrs.showMeridian) {
        scope.$parent.$watch($parse(attrs.showMeridian), function(value) {
          scope.showMeridian = !!value;

          if ( ngModel.$error.time ) {
            // Evaluate from template
            var hours = getHoursFromTemplate(), minutes = getMinutesFromTemplate();
            if (angular.isDefined( hours ) && angular.isDefined( minutes )) {
              selected.setHours( hours );
              refresh();
            }
          } else {
            updateTemplate();
          }
        });
      }

      // Get scope.hours in 24H mode if valid
      function getHoursFromTemplate( ) {
        var hours = parseInt( scope.hours, 10 );
        var valid = ( scope.showMeridian ) ? (hours > 0 && hours < 13) : (hours >= 0 && hours < 24);
        if ( !valid ) {
          return undefined;
        }

        if ( scope.showMeridian ) {
          if ( hours === 12 ) {
            hours = 0;
          }
          if ( scope.meridian === meridians[1] ) {
            hours = hours + 12;
          }
        }
        return hours;
      }

      function getMinutesFromTemplate() {
        var minutes = parseInt(scope.minutes, 10);
        return ( minutes >= 0 && minutes < 60 ) ? minutes : undefined;
      }

      function pad( value ) {
        return ( angular.isDefined(value) && value.toString().length < 2 ) ? '0' + value : value;
      }

      // Input elements
      var inputs = element.find('input'), hoursInputEl = inputs.eq(1), minutesInputEl = inputs.eq(2);

      // Respond on mousewheel spin
      var mousewheel = (angular.isDefined(attrs.mousewheel)) ? scope.$eval(attrs.mousewheel) : timepickerConfig.mousewheel;

      if ( mousewheel ) {

        var isScrollingUp = function(e) {
          if (e.originalEvent) {
            e = e.originalEvent;
          }
          //pick correct delta variable depending on event
          var delta = (e.wheelDelta) ? e.wheelDelta : -e.deltaY;
          return (e.detail || delta > 0);
        };

        hoursInputEl.bind('mousewheel wheel', function(e) {
          scope.$apply( (isScrollingUp(e)) ? scope.incrementHours() : scope.decrementHours() );
          e.preventDefault();
        });

        minutesInputEl.bind('mousewheel wheel', function(e) {
          scope.$apply( (isScrollingUp(e)) ? scope.incrementMinutes() : scope.decrementMinutes() );
          e.preventDefault();
        });
      }

      scope.readonlyInput = (angular.isDefined(attrs.readonlyInput)) ? scope.$eval(attrs.readonlyInput) : timepickerConfig.readonlyInput;
      if ( ! scope.readonlyInput ) {

        var invalidate = function(invalidHours, invalidMinutes) {
          ngModel.$setViewValue( null );
          ngModel.$setValidity('time', false);
          if (angular.isDefined(invalidHours)) {
            scope.invalidHours = invalidHours;
          }
          if (angular.isDefined(invalidMinutes)) {
            scope.invalidMinutes = invalidMinutes;
          }
        };

        scope.updateHours = function() {

          var hours = getHoursFromTemplate();

          if ( angular.isDefined(hours) ) {
            selected.setHours( hours );
            refresh( 'h' );
          } else {
            invalidate(true);
          }
        };

        hoursInputEl.bind('blur', function(e) {
          if ( !scope.validHours && scope.hours < 10) {
            scope.$apply( function() {
              scope.hours = pad( scope.hours );
            });
          }
        });

        scope.updateMinutes = function() {
          var minutes = getMinutesFromTemplate();

          if ( angular.isDefined(minutes) ) {
            selected.setMinutes( minutes );
            refresh( 'm' );
          } else {
            invalidate(undefined, true);
          }
        };

        minutesInputEl.bind('blur', function(e) {
          if ( !scope.invalidMinutes && scope.minutes < 10 ) {
            scope.$apply( function() {
              scope.minutes = pad( scope.minutes );
            });
          }
        });
      } else {
        scope.updateHours = angular.noop;
        scope.updateMinutes = angular.noop;
      }

      scope.$watch(function() {
        return ngModel.$modelValue;
      }, function(modelValue) {

        var date = modelValue ? new Date( modelValue ) : null;
        if ( isNaN(date) ) {
          ngModel.$setValidity('time', false);
          $log.error('Timepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.');
        } else {
          if ( date ) {
            selected = date;
          }
          makeValid();
          updateTemplate();
          inputs.eq(0).val( $filter('date')(date, 'h:mm a') );
        }
        
      });

      // Call internally when we know that model is valid.
      function refresh( keyboardChange ) {

        var date = new Date( selected );
        date = $filter('roundTime')(date, 5);

        makeValid();
        ngModel.$setViewValue( date );
        updateTemplate( keyboardChange );
        
        inputs.eq(0).val( $filter('date')(date, 'h:mm a') );
      }

      function makeValid() {
        ngModel.$setValidity('time', true);
        scope.invalidHours = false;
        scope.invalidMinutes = false;
      }

      function updateTemplate( keyboardChange ) {
        var hours = selected.getHours(), minutes = selected.getMinutes();
        if ( scope.showMeridian ) {
          hours = ( hours === 0 || hours === 12 ) ? 12 : hours % 12; // Convert 24 to 12 hour system
        }
        scope.hours =  keyboardChange === 'h' ? hours : pad(hours);
        scope.minutes = keyboardChange === 'm' ? minutes : pad(minutes);
        scope.meridian = selected.getHours() < 12 ? meridians[0] : meridians[1];

      }

      function addMinutes( minutes ) {
        var dt = new Date( selected.getTime() + minutes * 60000 );
        selected.setHours( dt.getHours(), dt.getMinutes() );
        refresh();
      }

      scope.incrementHours = function() {
        addMinutes( hourStep * 60 );
      };
      scope.decrementHours = function() {
        addMinutes( - hourStep * 60 );
      };
      scope.incrementMinutes = function() {
        addMinutes( minuteStep );
      };
      scope.decrementMinutes = function() {
        addMinutes( - minuteStep );
      };
      scope.toggleMeridian = function() {
        addMinutes( 12 * 60 * (( selected.getHours() < 12 ) ? 1 : -1) );
      };


    }
  };
}])

.run(function($templateCache) {
  $templateCache.put('template/cache/timepicker.html',
      '<div on-container-blur="isVisible = false" is-active="isVisible">' +
        '<div class="timepicker popout" ng-show="isVisible">' +
          '<table class="timepicker__table">' +
            '<tbody>' +
               '<tr>' +
                  '<td><a ng-click="incrementHours()" class="timepicker__button"><span class="icon--up"></span></a></td>' +
                   '<td><a ng-click="incrementMinutes()" class="timepicker__button"><span class="icon--up"></span></a></td>' +
                   '<td ng-show="showMeridian"></td>' +
              '</tr>' +
             '<tr>' +
                  '<td ng-class="{\'has-error\': invalidHours}">' +
                      '<input type="text" ng-model="hours" ng-change="updateHours()" ng-mousewheel="incrementHours()" ng-readonly="readonlyInput" maxlength="2">' +
                    '</td>' +
                    '<td ng-class="{\'has-error\': invalidMinutes}">' +
                        '<input type="text" ng-model="minutes" ng-change="updateMinutes()" ng-readonly="readonlyInput" maxlength="2">' +
                 '</td>' +
                 '<td ng-show="showMeridian"><button type="button" class="timepicker__toggle" ng-click="toggleMeridian()">{{meridian}}</button></td>' +
               '</tr>' +
             '<tr>' +
                  '<td><a ng-click="decrementHours()" class="timepicker__button"><span class="icon--down"></span></a></td>' +
                   '<td><a ng-click="decrementMinutes()" class="timepicker__button"><span class="icon--down"></span></a></td>' +
                 '<td ng-show="showMeridian"></td>' +
              '</tr>' +
            '</tbody>' +
          '</table>' +
        '</div>' +
      '</div>');
});