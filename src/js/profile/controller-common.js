angular.module('ui.profile')

.controller('profileCommon', ['$scope', 'ProfileCommonFactory', '$modal', '$routeParams', 'FileStorage', '$timeout',
    function($scope, ProfileCommonFactory, $modal, $routeParams, FileStorage, $timeout) {

    $scope.profile = new ProfileCommonFactory();
    
    $scope.profile.loadProfile();
    
    $scope.$parent.profile = $scope.profile; // Share this data with the page controller

    $scope.tab = 'wall';

    $scope.changeTab = function(tab) {
        $scope.tab = tab;
    };

}]);


// var SHRP = SHRP || {};
// SHRP.ctrl = SHRP.ctrl || {};

// Upload new profile photo controller
// ----------------------------------------

// SHRP.ctrl.ModalProfilePhotoCTRL = ['$scope', '$modalInstance', function($scope, $modalInstance){
// 
//     $scope.image = '';
// 
//     $scope.ok = function() {
//         // check there is actually some data in there
//         $modalInstance.close($scope.image);
//     };
// 
//     $scope.cancel = function() {
//         $modalInstance.dismiss('cancel');
//     };
// }];
