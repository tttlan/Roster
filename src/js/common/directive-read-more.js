// Readmore text 
// ------------------------------------------------

angular.module('ui.common')

.directive('readMore', function() {
    return {
        restrict: 'AE',
        replace: true,
        scope: {
            text: '=ngModel'
        },
        template: '<p class="read-more"> <span ng-bind-html="text | readMoreFilter:[text, countingWords, textLength] | unsafe"></span>' +
            '&nbsp;<a ng-show="showLinks" ng-click="changeLength()" class="read-more-link" ng-bind="isExpanded ? \'Read Less\' : \'Read More\' ">' +
            '</a>' +
            '</p>',
        controller: ['$scope', '$attrs', '$element',
            function($scope, $attrs) {
                $scope.textLength = $attrs.length;
                $scope.isExpanded = false;
                $scope.countingWords = $attrs.words !== undefined ? ($attrs.words === 'true') : true;
                
                if($scope.text) {
                    if (!$scope.countingWords && $scope.text.length > $attrs.length) {
                        $scope.showLinks = true;
                    } else if ($scope.countingWords && $scope.text.split(' ').length > $attrs.length) {
                        $scope.showLinks = true;
                    } 
                }
                else {
                    $scope.showLinks = false;
                }

                $scope.changeLength = function(card) {
                    $scope.isExpanded = !$scope.isExpanded;
                    $scope.textLength = $scope.textLength !== $attrs.length ? $attrs.length : $scope.text.length;
                };
            }]
    };
})
.filter('readMoreFilter', function() {
    return function(str, args) {
        var strToReturn = str,
            length = str ? str.length : 0,
            foundWords = [],
            countingWords = (!!args[1]);

        if (!str || str === null) {
        }
        if (!args[2] || args[2] === null) {
        } else if (typeof args[2] !== 'number') {
            length = Number(args[2]);
        }
        if (length <= 0) {
            return '';
        }


        if (str) {
            if (countingWords) {

                foundWords = str.split(/\s+/);

                if (foundWords.length > length) {
                    strToReturn = foundWords.slice(0, length).join(' ') + '...&nbsp;';
                }

            } else {

                if (str.length > length) {
                    strToReturn = str.slice(0, length) + '...&nbsp;';
                }

            }
        }

        return strToReturn;
    };
});