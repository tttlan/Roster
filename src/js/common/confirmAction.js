
angular.module('ui.common.directives')


// Confirm click event
// ----------------------------------------

.directive('ngConfirmClick', ['$modal', function($modal) {

    var ModalInstanceCtrl = function($scope, $modalInstance, message, buttonText, buttonClasses) {
      $scope.message = message;
        $scope.buttonText = buttonText;
        $scope.buttonClasses = buttonClasses;

      $scope.ok = function() {
          $modalInstance.close();
        };

      $scope.cancel = function() {
          $modalInstance.dismiss('cancel');
        };
    };

  return {
      restrict: 'A',
      scope:{
          ngConfirmClick:'&',
          ngConfirmBypass:'='
        },
      link: function(scope, element, attrs) {
            
          element.bind('click', function() {

                // If we are nto bypassing confirm, do the confirmation action
              if(!scope.ngConfirmBypass) {

                    var message = attrs.ngConfirmMessage;
                    var buttonText = attrs.ngConfirmButtonText;
                    var buttonClasses = attrs.ngConfirmButtonClasses;

                  var modal = $modal.open({
                      templateUrl: '/interface/views/common/partials/modal-confirm.html',
                      controller: ModalInstanceCtrl,
                      size: 'sm',
                      animationType: 'flipVertical',
                      resolve: {
                          message: function() {
                              return message;
                            },
                            buttonText: function() {
                                return buttonText;
                            },
                            buttonClasses: function() {
                                return buttonClasses;
                            }
                        }
                    });

                  modal.result.then(function() {
                      scope.ngConfirmClick();
                    }, function() {
                        //Modal dismissed
                    });

                // If bypass is true, automatically call the callback
                } else {

                  scope.ngConfirmClick();

                }

            });
 
        }
    };
}]);