// Password strength - show an indicator for the strength of a password as input is detected
// -----------------------------------------------------------------------------------------

angular.module('ui.common.directives')

.directive('passwordStrength', function($compile) {
  return {
      restrict: 'E',
      templateUrl: '/interface/views/common/partials/password-strength.html',
      replace: true,
      scope: {
          password: '='
        },
      controller: function($scope, $element, $attrs) {

          $scope.$watch('password', function(val) {
              if (val) {
                  $scope.strength = checkPassword(val);
                } else {
                  $scope.strength = 0;   
                }
            });

          function checkPassword(password) {

              var strength = [],
                  sum = 0;

              strength[0] = password.match(/[A-Z]/); // Give a point for an uppercase letter
              strength[1] = password.match(/[a-z]/); // Give a point for a lowercase letter
              strength[2] = password.match(/.{8}/); // Give a point for a password length of 8 or more
              strength[3] = password.match(/[0-9]+/); // Give a point for a number
              strength[4] = password.match(/[~!@#$%^&*_.-]+/); // Give a point for a special character

              for (var i = 0; i < strength.length; i++) {
                  sum += strength[i] ? 1 : 0;
                }

              return sum;
            }
        }
    };
});