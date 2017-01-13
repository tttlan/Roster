/*
 * https://github.com/legalthings/signature-pad-angular
 * Copyright (c) 2015 ; Licensed MIT
 */

angular.module('signature', []);

angular.module('signature').directive('signaturePad', ['$window',
  function($window) {
    'use strict';

    var signaturePad, canvas, element, EMPTY_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=';
    return {
      restrict: 'EA',
      replace: true,
      template: '<div class="signature" ng-style="{height: height + \'px\'}"><canvas height="{{ height }}" width="{{ width }}"></canvas></div>',
      scope: {
        accept: '=',
        clear: '=',
        dataurl: '=',
        height: '@',
        width: '@'
      },
      controller: [
        '$scope',
        function($scope) {
          $scope.accept = function() {
            var signature = {};

            if (!signaturePad.isEmpty()) {
              signature.dataUrl = signaturePad.toDataURL();
              signature.isEmpty = false;
            } else {
              signature.dataUrl = EMPTY_IMAGE;
              signature.isEmpty = true;
            }

            return signature;
          };

          $scope.clear = function() {
            signaturePad.clear();
          };

          $scope.$watch("dataurl", function(dataUrl) {
            if (dataUrl) {
              signaturePad.fromDataURL(dataUrl);
            }
          });
        }
      ],
      link: function(scope, element) {
        canvas = element.find('canvas').get(0);
        signaturePad = new $window.SignaturePad(canvas);

        if (!scope.height) scope.height = 220;
        if (!scope.width) scope.width = 568;

        if (scope.signature && !scope.signature.$isEmpty && scope.signature.dataUrl) {
          signaturePad.fromDataURL(scope.signature.dataUrl);
        }

        scope.onResize = function() {
          var canvas = element.find('canvas').get(0);
          var ratio =  Math.max($window.devicePixelRatio || 1, 1);
          canvas.width = canvas.offsetWidth * ratio;
          canvas.height = canvas.offsetHeight * ratio;
          canvas.getContext("2d").scale(ratio, ratio);
        };

        scope.onResize();

        angular.element($window).bind('resize', function() {
            scope.onResize();
        });
      }
    };
  }
]);

// Backward compatibility
angular.module('ngSignaturePad', ['signature']);
