// All events
// ------------------------------------------------

angular.module('ui.events')

.controller('eventsListingCtrl', ['$scope', 'Events', '$timeout', function($scope, Events, $timeout) {    

    // Determine width and height for the google map so we can request it in the correct dimensions
    // var unbindWatcher = $scope.$watch('page.items', function(val){
    // 
    //     if (val && val.length > 0) {
    //         
    //         $timeout(function(){
    //             $scope.mapWidth = $('.event-tile').outerWidth();
    //             $scope.mapHeight = parseInt($scope.mapWidth * 0.5625);
    //             unbindWatcher();
    //         });
    //     }
    // });
     $scope.cardCtrl = {};
    $scope.eventType = 1;
    
    $scope.setEventType = function(val) {
        $scope.eventType = val;
        $scope.showCats = false;
    };
    
    $scope.getEvents = function(page, pageSize, orderBy, ascending, filterBy) { // The server doesn't accept orderby or asscending, vars are passed in to preserve order

        return Events.getAll({
            page: page, 
            pageSize: pageSize, 
            filterBy: filterBy
        }).then(function(res) {

            $scope.$userCan = res.data.$userCan;
            $scope.loaded = true;
            res.data = res.data.EventFeedEntrySummaryItemResults;
            return res;
        });
    };

}]);
