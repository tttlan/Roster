'use strict';

var docs = angular.module('docsApp', ['ngRoute', 'sherpa'])
  
.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    
    $locationProvider
        .html5Mode(false)
        .hashPrefix('');
 
    $routeProvider
         .otherwise({
             redirectTo: ''
         });
}])

// Load various modal styles
.controller('modalCtrl', ['$scope', '$modal',
    function($scope, $modal){

        $scope.showModalDefault = function(){
        
            var modal = $modal.open({
                templateUrl: '/public/views/modal.html'
            });
        }

        $scope.showModalFade = function(){
        
            var modal = $modal.open({
                templateUrl: '/public/views/modal.html',
                animationType: 'fade'
            });
        }

        $scope.showModalFlipHorizontal = function(){
        
            var modal = $modal.open({
                templateUrl: '/public/views/modal.html',
                animationType: 'flipHorizontal'
            });
        }

        $scope.showModalFlipVertical = function(){
        
            var modal = $modal.open({
                templateUrl: '/public/views/modal.html',
                animationType: 'flipVertical',
            });
        }

        $scope.showDrawer = function(){
        
            var modal = $modal.open({
                templateUrl: '/public/views/drawer.html',
                templateType: 'drawer',
                title: 'Optional Title'
            });
        }

        $scope.showDrawerLarge = function(){
        
            var modal = $modal.open({
                templateUrl: '/public/views/drawer.html',
                templateType: 'drawer',
                size: 'lg',
                title: 'Optional Title'
            });
        }

        $scope.showModalSign = function(){
        
            var modal = $modal.open({
                templateUrl: '/public/views/modal.html',
                animationType: 'sign'
            });
        }

        $scope.showModalLocked = function(){
        
            var modal = $modal.open({
                templateUrl: '/public/views/modal.html',
                locked: true
            });
        }

        $scope.showModalSmall = function(){
        
            var modal = $modal.open({
                templateUrl: '/public/views/modal.html',
                size: 'sm'
            });
        }

        $scope.showModalLarge = function(){
        
            var modal = $modal.open({
                templateUrl: '/public/views/modal.html',
                size: 'lg'
            });
        }
    }
])



// Load various lighbox styles
.controller('lightboxCtrl', ['$scope', '$modal',
    function($scope, $modal){

        $scope.openLightbox = function() {

            var files = [
                {
                    image: 'http://placehold.it/1024x768',
                    activityId: 2575653
                },
                {
                    image: 'http://placehold.it/1300x800',
                    activityId: 1222
                },
                {
                    image: 'http://placehold.it/800x1280',
                    activityId: 1234
                },
                {
                    image: 'http://placehold.it/900x380',
                    activityId: 1235
                },
                {
                    image: 'http://placehold.it/320x640',
                    activityId: 1236
                },
                {
                    image: 'http://placehold.it/1280x1024',
                    activityId: 1237
                },
                {
                    image: 'http://placehold.it/1280x800',
                    activityId: 1238
                }
            ]
            
            var modal = $modal.open({
                templateType: 'lightbox',
                templateUrl: '/interface/views/common/partials/lightbox-gallery.html',
                controller: SHRP.ctrl.ModalLibraryLightboxCTRL,
                resolve: {
                    items: function() {
                        return files;
                    },
                    currentIndex: function() {
                        return 0;
                    }
                }
            });

        }

    }
]);

// For fun!
$(function(){
    if ($('#kssref-0').length) {
        $.getJSON('http://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=dog', function( res ) {
            var img = '<img src="' + res.data.image_url + '" />';
            $('#kssref-0').append(img);
        });
    }    
});
