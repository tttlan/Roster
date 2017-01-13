// Roster
// ----------------------------------------

angular.module('ui.roster')

// Holds the Shift information
.factory('rosterShiftFactory', ['Roster', function(Roster) {
    
  function Shift(data) {
      angular.extend(this, data);
    }

    // Inject services
  Shift.prototype.$Roster = Roster;

  Shift.prototype.getAdditionalData = function() {
        
      var that = this;
      that.showAdditionalData = !that.showAdditionalData;

      if(!that.loading && !that.hasAdditionalData) {

          that.loading = true;
          that.$Roster.getRosterShift(that.ShiftId).then(function(res) {
              angular.extend(that, res.data);
              that.hasAdditionalData = true;
              that.loading = false;
            }, function(res) {
              that.hasAdditionalData = true;
              that.loading = false;
            });

        }

    };
    
  Shift.prototype.submitResponse = function(isAccepted) {
        
      var shift = this,
          data = {
              'startShiftId': shift.ShiftId,
              'isAccepted': isAccepted,
              'denyReason': ''
            };

      if(!shift.response) {
          shift.response = {};
        }
        
      if(shift.Status === 'notified') {
            
          shift.response.isAccepting = isAccepted;
          shift.response.loading = true;

          shift.$Roster.confirmRoster(data).then(function(res) {
              if (res.data) {
                  shift.Status = data.isAccepted ? 'confirmed' : 'rejected';
                  shift.response.error = '';
                }
              shift.response.loading = false;
            }, function() {
              shift.response.loading = false;
              shift.response.error = 'Something went wrong, please try again soon.';
            });
        
        }
    };

  return {
      $init: function(data) {
          return new Shift(data);
        }
    };
}]);