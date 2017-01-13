angular.module('ui.common.directives')
 
/*
 * Sortable list
 * Makes list sortable
 * <ul sortable>
 *      <li>...</li>
 * </ul>
 * 
 */   

.directive('sortable', ['$timeout', function($timeout) {

    //Sort an array from an array on indicies
  function getSorted(arr, sortArr) {
      var result = [];

      for(var i=0; i<arr.length; i++) {
        result[i] = arr[sortArr[i]];
      }
      return result;
    }

  return {
      restrict: 'A',
      scope: {
          sortingList: '=sortable'
        },
      link: function(scope, element, attrs) {
            
          element.addClass('sortable');

          element = element[0];
            
          function buildIndecies() {
              var newSortIndexes = [];
              var liElements = element.getElementsByTagName('li');
                  
              angular.forEach(liElements, function(li) {
                  newSortIndexes.push(li.getAttribute('data-pos'));
                });

              $timeout(function() {
                  scope.sortingList = getSorted(scope.sortingList, newSortIndexes);
                });

            }

        }
    };

}]);