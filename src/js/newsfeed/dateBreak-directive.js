
// Newsfeed
// ----------------------------------------

angular.module('ui.newsFeed')

// Template Directive for single news post
// ------------------------------------------------

.directive('dateBreak', [ '$compile', function($compile) {
    
  var TIME_PERIODS = [
      {
        time: moment().startOf('day'),
        text: 'Yesterday'
      },
      {
        time: moment().subtract('hours', 36),
        text: 'a few days ago'
      },
      {
        time: moment().subtract('weeks', 1),
        text: 'a week ago'
      },
      {
        time: moment().subtract('weeks', 2),
        text: 'a few weeks ago'
      },
      {
        time: moment().subtract('days', 25),
        text: 'a month ago'
      },
      {
        time: moment().subtract('days', 45),
        text: 'a few months ago'
      },
      {
        time: moment().subtract('days', 345),
        text: 'a year ago'
      },
      {
        time: moment().subtract('days', 548),
        text: 'a long time ago'
      }
    ];
  var TIME_PERIODS_LENGTH = TIME_PERIODS.length;
  var currentPeriod;

  function checkPeriod(date) {
      var newPeriod = -1;
        
      if(currentPeriod === TIME_PERIODS_LENGTH) { return; }

        // Set the index to find the last time period the date fits into
      for(var i = currentPeriod || 0; i < TIME_PERIODS_LENGTH; i++) {

          if( moment(date).isAfter(TIME_PERIODS[i].time) ) {
              break;
            } else {
              newPeriod = i;
            }
        }

        //If the index has progressed, lets return the new time period
      if(newPeriod !== -1 && newPeriod !== currentPeriod) {
          currentPeriod = newPeriod;
          return TIME_PERIODS[newPeriod].text;
        }
    }

  return {
      scope: {
          date: '=dateBreak',
          bypass: '=dateBreakBypass'
        },
      restrict: 'A',

      link: function(scope, element, attrs) {
            
          if (scope.bypass && scope.bypass > 3) {
              return;
            }

            //element.prepend('<div class="">{{ attrs.dateBreak }}</div>');
          var newTimePeriod = checkPeriod(scope.date);

          if(newTimePeriod) {
              var dateHtml = angular.element('<div class="post-line-break"><span class="label label--pill">' + newTimePeriod + '</span></div>');
              element.addClass('has--line-break').prepend($compile(dateHtml)(scope));
            }

            //On destory we want to reset the currentPeriod
          scope.$on('$destroy', function() {
              currentPeriod = false;
            });

        }

    };
}]);