
// Select List
// ------------------------------------------------

angular.module('ui.common')
.directive('selectList', ['$timeout', function($timeout) {

  return {
      scope: {
          items: '=',
          itemsName: '@',
          unselectedTitle: '@',
          selectedTitle: '@',
          showSearch: '@',
          showInactiveToggle: '@',
          selectedIndexes: '=',
          loaded: '=',
          ngModel: '=',
          isSortable: '@',
          toggleInactive: '@'
        },
      controller: function($scope, $element, $attrs, $transclude) {

        },
      require: 'ngModel',
      restrict: 'E',
      templateUrl: '/interface/views/common/partials/selectList.html',
      replace: true,
      link: function($scope, iElm, iAttrs, ngModel) {
            
            //Get an item from an ID
          var getItemById = function(id) {
              var foundItem = false;

              angular.forEach($scope.items, function(item) {
                  if(item.id === id) {
                      foundItem = item;
                      return;
                    }
                });

              return foundItem;
            };

            // Empty array to load in the selected items
          $scope.selectedItems = [];

          $scope.selectThis = function(id, bypassActive) {
              $timeout(function() {
                  var item = getItemById(id);

                  if(!item.active && !bypassActive) {
                      return false;
                    }

                  if (!item.selected) {
                      item.selected = true;
                      $timeout(function() {
                          $scope.selectedItems.push(item);
                        });

                    } else {
                      $scope.unSelectThis(id);
                    }
                });

            };

          $scope.unSelectThis = function(id) {
              $timeout(function() {
                  var item = getItemById(id);
                  if(!item) { return; }

                  item.selected = false;

                    //remove from selectedItems
                  angular.forEach($scope.selectedItems, function(item, i) {
                      if(item.id === id) {
                          $scope.selectedItems.splice(i, 1);
                        }
                    });
                });
                    
            };

            //When selected Items is updated, we should repopulate ngModel
          $scope.$watch('selectedItems', function(newVal, oldVal) {
              $timeout(function() {
                  $scope.ngModel = newVal.map(function(item) {
                      return item.id;
                    });
                });
            
            }, true);

            //Watch for the data to be loaded, then push in the ngModel items into the selectedItems array
          $scope.$watch('loaded', function(newVal, oldVal) {

              if(newVal) {
                  angular.forEach($scope.ngModel, function(ind) {
                      $scope.selectThis( ind, true);
                    });
                }
            });

        }
    };
}]);