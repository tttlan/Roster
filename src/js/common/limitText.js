// Autogrow Directive
// ----------------------------------------

angular.module('ui.common.directives')

/* Limit Text
 *
 * Limits Text to the value of the directive, adds an elipse to it, with a read more toggle
 * Limit char defaults to 200
 *
 * <p limit-text="post.content" limit-char="300" />
 * 
 *
 */
 .directive('limitText', ['$filter', '$timeout', function($filter, $timeout) {

   return {
      scope: {
          text: '=limitText'
        },
      restrict: 'A',
      templateUrl: '/interface/views/common/partials/limitText.html',
      link: function(scope, element, attrs) {

            //Set the limit on load, this isn't watched for.
          var limit = parseInt(attrs.limitChar, 10) || 200;

            // toggle the limit text, a parameter can be passed in to force a state
          scope.toggle = function(set) {
                
              scope.limitText = set || !scope.limitText;

              if( scope.limitText ) {
                  scope.limitedText = $filter('limitTo')(scope.text, limit) + '...';
                } else {
                  scope.limitedText = scope.text;
                }

            };

          scope.$watch('text', function(newVal, oldVal) {

              if(newVal) {
                  scope.textIsLimited = newVal.length > limit;

                  if( scope.textIsLimited ) {
                       scope.toggle(true);
                     } else {
                       scope.limitedText = newVal;
                     }

                }

            });
        
        }
    };
 }]);