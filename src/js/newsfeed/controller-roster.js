
// Newsfeed
// ----------------------------------------

angular.module('ui.newsFeed')
//Calendar, holds days, ability to move between the months.
.factory('rosterCalendarFactory', ['Roster', 'rosterShiftFactory', function(Roster, rosterShift) {
    
  function Calendar() {
      this.showingFrom = moment('2014-06-30').startOf('week');  // Start of days shown
      this.totalDays = 7 * 5;                       // Total days in array
      this.days = [];                               // Days array that holds shifts
      this.daysOfWeek = Roster.getDaysOfWeek();     // Days of the week for heading
      this.loading = true;                          // If calendar is loading
      this.currentMonth = '';                       // String of the current month
      this.selectedDays = [];                       // Selected Days to be shown in the days list.
      this.weeklyMode = false;                         // BOOL if we show list or calendar view.
      this.limitedPageSize = 7;                     // How many days we show in list view
      this.currentLimitedPage = 0;                  // Position of current limited page
      this.totalLimitedPages = Math.ceil(this.totalDays / this.limitedPageSize);
      this.weeklyDays = [];                          // Partial list of days viewable in WeeklyView
    }

    //Select which day to show in list
  Calendar.prototype.select = function(day) {

      if( !this.weeklyMode ) {
          this.selectedDays = [day];
        } else {
            // open up
        }
    };

    //Select the next month to load in
  Calendar.prototype.getNextMonth = function(ret) {
      var nextMonth = this.showingFrom.add(this.totalDays, 'day');
      getMonth(nextMonth, ret);
    };

    //Get the previous month to load in
  Calendar.prototype.getPrevMonth = function(ret) {
      var nextMonth = this.showingFrom.subtract(this.totalDays, 'day');
      getMonth(nextMonth, ret);
    };

    //Select the next month to load in
  Calendar.prototype.getNextWeek = function() {
      var c = this;
      if(c.totalLimitedPages - 1 !== c.currentLimitedPage) {
          c.currentLimitedPage++;
        } else {
          c.getNextMonth(function() {
              c.currentLimitedPage = 0;
            });
        }
    };

    //Get the previous month to load in
  Calendar.prototype.getPrevWeek = function() {
      var c = this;
      if(c.currentLimitedPage > 0) {
          c.currentLimitedPage--;
        } else {
          c.getPrevMonth(function() {
              c.currentLimitedPage = c.totalLimitedPages - 1;
            });
        }
    };
    
    //Toggle between list and calendar view
  Calendar.prototype.toggleWeeklyMode = function() {

      this.weeklyMode = !this.weeklyMode;

      if(this.weeklyMode) {
          this.selectedDays = this.days[0];
        }
    };

  var calendar = new Calendar();

    // Get month starting from
  function getMonth(from, ret) {

        //update showing from if needed
      if(from) {
          calendar.showingFrom = from;
        }
        
      calendar.loading = true;
        
      Roster.getRoster(calendar.showingFrom, calendar.totalDays).then(function(res) {
            
          calendar.loading = false;
          calendar.currentMonth = formatMonth();

            //Loop through all shifts, within days, and get the proper shift data
          calendar.days = res.data.days.map(function(day) {
              day.shifts.map(function(shift) {
                  return rosterShift.$init(shift);
                });

              return day;
            });

          if(ret && typeof ret === 'function') {
              ret();
            }

        });

    }
    // Format the month to string for use in the view
  function formatMonth() {
      return calendar.showingFrom.format('MMMM');
    }
    
    //Auto fetch the first month
  getMonth(false, function() {
      calendar.toggleWeeklyMode();
    });

  return calendar;

}])

.factory('rosterShiftFactory', ['Roster', '$timeout', function(Roster, $timeout) {
    
  function Shift(data) {
      angular.extend(this, data);
      this.getAdditionalData();
    }

  Shift.prototype.getAdditionalData = function() {

      var that = this;
      console.log(that);

      if(!that.loading && !that.hasAdditionalData) {

          that.loading = true;
          that.$Roster.getRosterShift(that.ShiftId).then(function(res) {
              that.$timeout(function() {
                  angular.extend(that, res.data);
                  that.hasAdditionalData = true;
                  that.loading = false;

                  console.log( that );
                });
            });

        }

    };

     // Inject services
  Shift.prototype.$Roster = Roster;
  Shift.prototype.$timeout = $timeout;

  return {
      $init: function(data) {
          return new Shift(data);
        }
    };
}])

.controller('dashboardRosterCtrl', ['$scope', 'rosterCalendarFactory', function($scope, Calendar) {
    
  $scope.calendar = Calendar;

}]);