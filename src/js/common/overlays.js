angular.module('ui.common.directives')

 .directive('overlays', ['$overlay', '$timeout', function($overlay, $timeout) {

     return {
         scope: true,
         transclude: true,
         restrict: 'E',
         replace: true,
         templateUrl: '/interface/views/common/partials/overlays.html',
         link: function($scope, $element, $attrs) {

             $scope.$hideOverlay = function(ind) {

                 $scope.$apply(function() {
                     $scope.overlays[ind].visible = false;
                 });

             };

             //
             $scope.$timeouts = {
                 list: [],
                 clear: function() {

                     for (var i = 0; i < this.list.length; i++) {
                         clearTimeout(this.list[i]);
                     }

                     this.list = [];
                 }
             };

             $scope.overlays = [];

             var overlayCallBackRef = $overlay.setCallback(function(msg) {

                 if (!msg) {

                     //If we should clear
                     $scope.$timeouts.clear();

                 } else {

                     if (msg.visible === undefined) { // If nothing has been passed in, notifications show by default.  Server.js notifications are set to be invisible by default
                         msg.visible = true;
                     }

                     // Async Eval added to fix digest bug in uploader :(
                     $scope.$evalAsync(function() {
                         //Add an msgor
                         $scope.overlays.push({
                             type: msg.type,
                             title: msg.title,
                             message: msg.message,
                             visible: msg.visible
                         });

                         var ind = $scope.overlays.length - 1;

                         $scope.$timeouts.list.push($timeout(function() {

                             $scope.$hideOverlay(ind);

                         }, $attrs.displayTime || 10000));

                     });

                 }

             });

             $scope.$on('$destroy', function() {
                 $scope.$timeouts.clear();
             });

         }
     };
 }]);
