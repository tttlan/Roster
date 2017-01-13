angular.module('ui.newsFeed')

// Roster Shifts
// -----------------------------------------------

.controller('NextShiftCtrl', ['Roster', 'Permissions', '$scope', '$modal', '$timeout', '$q', 'mediaQuery',
  function(Roster, Permissions, $scope, $modal, $timeout, $q, mediaQuery) {
  
    $scope.loadRoster = function() {

    $scope.loading = true;
    $scope.error = false;
    $scope.isVisible = false;

    Permissions.canIHas('mnuRosters').then(function(isVisible) {
          
        if(isVisible) {
            $scope.isVisible = true;

            Roster.getRoster(false,false,true, true).then(function(response) {

                $scope.days = response.data.UpcomingShiftsItemResults.length ? response.data.days : [];

                $scope.loading = false;

              }, function() {
                $scope.loading = false;
                $scope.error = true;
              });
          }
      });
  
  };

    $scope.showDetails = function(days, selectedIndex) {

    var modal = $modal.open({
        templateType: 'drawer',
        templateUrl: '/interface/views/common/partials/modal-shift-details.html',
        controller: SHRP.ctrl.ModalShiftCTRL,
        classes: 'drawer--shift',
        name: 'shifts',
        resolve: {
            Service: function() {
                return Roster;
              },
            $timeout: function() {
                return $timeout;
              },
            $q: function() {
                return $q;
              },
            days: function() {
                return days;
              },
            selectedIndex: function() {
                return selectedIndex;
              }
          }
      });

  };

    $scope.loadRoster();
  
  //Mobile checking to reformat
    $scope.isMobile = angular.element('body').width() < 700;
    var mediaWatch = mediaQuery.register(updateIsMobile);

    function updateIsMobile(media) {
    $timeout(function() {
        $scope.isMobile = media === 'phablet' || media === 'mobile';
      });
  }

    $scope.$on('$destory', function() {
    mediaQuery.deregister(updateIsMobile);
  });

}]);