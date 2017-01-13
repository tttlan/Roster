angular.module('ui.services')


// Rosters Factory
// ----------------------------------------

.factory('Roster', ['$server', '$HTTPCache', 'API_BASE_URL', function($server, $HTTPCache, API_BASE_URL) {

  var NAMESPACE = API_BASE_URL,
      cachedRosters;

  function getTimeDifference(start, end, inHours) {
      var diff = start.diff(end),
          divid = inHours ? 3600000 : 60000;
        //if there is no diff, just return 0. This calc does weird things when 0 is passed into it.
      return diff ? Math.floor(diff / divid * -1) : 0;
    }

    //Builds array of days to push shifts into
  function buildDays(numOfDays, startDate) {

      var days = [];

      for(var i = 0; i < numOfDays; i++) {
            
          var date = moment(startDate).add('days', i);

          days.push({
              date: date.format(),
              status: '',
              shifts: [],
              month: (date.format('DD') === '01') ? date.format('MMMM') : ''
            });

        }

      return days;

    }

  function populateDays(days, shifts, addHourDisplay) {

      return days.map(function(day) {

          angular.forEach(shifts, function(shift) {
                
              var startTime = shift.UpcomingShifts.StartTime;

              if (moment(day.date).isSame(startTime, 'day')) {
                  day.status = shift.UpcomingShifts.Status;

                  shift.UpcomingShifts.action = shift.UsEntityActions[0].ActionUrl;
                  day.shifts.push(shift.UpcomingShifts);
                }

            });

          if( addHourDisplay ) {
                //If we need to have a visual representation of hours worked
              day.shifts = addPositionOffsets(day.shifts);
              day.hoursInDay = buildHours(day);
                
            }

          return day;

        });
    }

    //Builds hours array to display shifts on
  function buildHours(day) {

      if(!day.shifts.length) { return []; }

      var lastInd = day.shifts.length - 1,
          startingDate = moment(day.shifts[0].StartTime),
          endingTime = day.shifts[lastInd].EndTime,
          hourRange = getTimeDifference(startingDate, endingTime, true) + 1,
          hours = [ startingDate.startOf('hour').format('H:mm') ];

      for(hourRange; hourRange--;) {
          var hour = startingDate.add(1, 'h').format('H:mm');
          hours.push(hour);
        }

      return hours;

    }

    //Add a position for shifts depending on where it starts within the hour array
  function addPositionOffsets(shifts) {
        
      if( !shifts.length ) { return shifts; }
        
      var startingHour = moment(shifts[0].StartTime).startOf('hour');

      return shifts.map(function(shift, ind) {
          var top = getTimeDifference(startingHour, shift.StartTime); 
          shift.pos = {
              top: top,
              bottom: getTimeDifference(startingHour, shift.EndTime) - top
            };

          return shift;

        });

    }

  var Roster = {

        // GET upcoming shifts

      getRoster: function(beginDate, days, addHourDisplay, removeDaysUntilFirstShift) {

          beginDate = beginDate ? moment(beginDate).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');

          var dayCount = days || 14;
          var url = NAMESPACE + 'roster/shift/upcomingshifts/' + beginDate + '/' + dayCount;

          return $server.get({ url: url }).then(function(response) {
                
              var rosters = response.data.UpcomingShiftsItemResults || [],
                  startingDay = (removeDaysUntilFirstShift && rosters.length) ? rosters[0].UpcomingShifts.StartTime : beginDate,
                  days = buildDays(dayCount, startingDay);

                // Loop through days and find any shifts on that day,
                // then push those found shifts into the Day object
              response.data.days = populateDays(days, rosters, addHourDisplay);

              return response;

            });

        },

        // GET single roster details

      getRosterShift: function(shiftId) {

          var url = NAMESPACE + 'roster/shift/shiftadditionalinfo/' + shiftId;

          return $server.get({ url: url }).then(function(res) {
                
              var shift = res.data;
                
                // If there is a break, lets add a top position for it
              if(shift.breakstarttime) {
                  shift.topPosition = getTimeDifference(moment(shift.StartTime), shift.breakstarttime);
                }
                
              return res;
            });

        },

        // PUT roster changes

      confirmRoster: function(obj) {

          var url = NAMESPACE + 'roster/shift/confirmshift/' + obj.startShiftId + '/' + obj.isAccepted;

          return $server.create({
              'url': url,
              'data': obj
            }).then(function(res) {
              $HTTPCache.clear('roster');
              return res;
            });

        },
      getDaysOfWeek: function() {
          return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday','Sunday'];
        }
    };

  return Roster;

}]);