
// Events
// ----------------------------------------

angular.module('ui.newsFeed')


// Editing / creating an event
// ------------------------------------------------

.controller('eventsCreateEditCtrl', ['$scope', 'Events', 'Groups', '$routeParams', 'FileStorage', '$modal', '$timeout',
    function($scope, Events, Groups, $routeParams, FileStorage, $modal, $timeout) {
        
    // Used to pass data to the form builder
    $scope.parentData = {
        tagData: {},
        eventEnd: false,
        imageUploaded: false
    };

    //If we are editing, lets load in the events data
    if ($routeParams.id) {
        
        $scope.modelData = Events.getById($routeParams.id);
    }

    
    // Load tag data and pass to the form builder
    // 'Groups' needs to match the tags property in the forms json
    // ie. "tags": "Groups" = $scope.tagData.Groups
    // ToDo: This should be a form-builder elelemnt = groups.
    $scope.parentData.tagData.Groups = Groups.getMyGroupsList();

    $scope.saveEvent = function(modelData) {
        return Events.update(modelData);
    };

    // This should be it's own form-builder element upload image?
    $scope.parentData.addImage = function() {

        var files = [];

        var modal = $modal.open({
            templateUrl: '/interface/views/common/partials/modal-upload-image.html',
            size: 'sm',
            controller: SHRP.ctrl.ModalCTRL,
            resolve: {
                items: function() {
                    return files;
                },
                dataUpload: function() {
                    return {};
                }
            }
        });
        
        modal.result.then(function(files) {

            $scope.parentData.imageUploaded = true;
            var imageLink = FileStorage.getDownloadUrl( files[0] ) + '?inline=true';

            // Update the offscreen input with the image ID
            $('#__Image').val(files).triggerHandler('input');

            // Displaying the image
            if(imageLink && imageLink !== '' && imageLink !== 'http://') {
                var img = $('<img src="' + imageLink + '" file-link="' + files[0] + '"/>');
                $('.events-form__image').prepend(img);
            }

        });
    };

    $scope.parentData.removeImage = function() {
        $('.events-form__image img').remove();
        $scope.parentData.imageUploaded = false;
    };

}])

// All events
// ------------------------------------------------

.controller('eventsListingCtrl', ['$scope', 'Events', '$notify', '$timeout', function($scope, Events, $notify, $timeout) {    

    // Determine width for the google map so that it sizes nicely on mobile
    $scope.mapWidth = $('.event-tile').width();
    $scope.mapHeight = parseInt($scope.mapWidth * 0.5625);

    $scope.getEvents = function(page, pageSize, orderBy, acending, filterBy) {
        return Events.getAll(page, pageSize, orderBy, acending, filterBy, $scope.categoryId).then(function(res) {
            
            $timeout(function() {
                // Calculate height for create tile
                $scope.eventTileHeight = $('.event-tiles .event-tile:nth-child(2)').outerHeight();
            });

            // Do we need to filter events based on permissions????
            //$scope.userCan = res.data.permissions;
            //res.data = res.data.items;
            return res;
        });
    };

    $scope.joinEvent = function(event) {

        // If you haven't joined the event yet, mark the event as attending / yes
        if (event.Attendance === '') {
            event.Attendance = 'Yes';
        }

        Events.getRsvps(event.id, event.Attendance).then(function(res) {

            console.log(res);
            
            // Throw a notification if the res was not successful
            /* if (res was not good) {
                $notify.add({
                    message: 'Oops!',//res.reason,
                    type: 'error'
                });
            }
            */

        });
    };

}])

// A single event
// ------------------------------------------------

.controller('eventsDetailCtrl', ['$scope', 'Events', '$modal', '$routeParams', '$rootScope', 'mediaQuery', '$window', '$notify',
    function($scope, Events, $modal, $routeParams, $rootScope, mediaQuery, $window, $notify) {

    $scope.event = {};

    $scope.isMobile = (function() {
        var mediaSize = mediaQuery.get();
        return (mediaSize === 'mobile' || mediaSize === 'phablet');
    })(); 

    // Get event details
    Events.getById($routeParams.id).then(function(response) {
        
        angular.extend($scope.event, response.data);
        $rootScope.title = $scope.event.Name;
    }); 

    // Get list of attendees that sits in RHS panel
    Events.getAttendees($routeParams.id).then(function(response) {

        $scope.event.attendees = response.data;
    }); 

    // Determine width for the google map so that it sizes nicely on mobile
    $scope.mapWidth = $('.page__aside').width();

    // Update the events attendance, can either be 'Yes', 'Maybe' or 'No'
    $scope.setRsvp = function(rsvp) { 

        $scope.event.Attendance = rsvp;

        Events.setRsvp($routeParams.id, $scope.event.Attendance).then(function(res) {

            console.log(res);
            
            // Throw a notification if the res was not successful
            /* if (res was not good) {*/
                $notify.add({
                    message: 'Oops!',//res.reason,
                    type: 'error'
                });
            /*}*/
        });
    };

    $scope.showMap = function() {

        if ($scope.isMobile) {

            // Don't open a lightbox, open in new browser tab and potentially native google maps if device settings allow
            $window.open('http://www.google.com.au/maps/place/' + $scope.event.Address);

        } else {

            var modal = $modal.open({
                template: '<a href="" class="modal__close" ng-click="cancel()"><i class="icon--cross"></i></a>' + 
                          '<google-map address="' + $scope.event.Address + '" zoom="14"></google-map>',
                controller: SHRP.ctrl.ModalCTRL,
                resolve: {
                    items: function() {
                        
                    },
                    dataUpload: function() {
                        return {
                            moduleUpload: 'events'
                        };
                    }
                },
                animationType: 'flipVertical',
                size: 'lg',
            });
        }
    };

}]);
