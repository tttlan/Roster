
// Form Directives
// ------------------------------------------------


angular.module('ui.common')



// Tag input Controller
// ------------------------------------------------

/*
 * Usage:
 * 
 * <div ng-controller="TagCtrl">
 *     <tag-manager tags="tags" placeholder="Enter a tag"></tag-manager>
 * </div>
 * 
 */

.controller('FormCtrl', function( $scope, $http ) {
  $scope.results = [
        {name:'Group', body: 'this is cool1'},
        {name:'Managers', body: 'this is cool2'},
        {name:'People', body: 'this is cool3'},
        {name:'Plebs', body: 'this is cool 4'},
        {name:'Retailers', body: 'this is cool1'},
        {name:'Developers', body: 'this is cool2'},
        {name:'Designers', body: 'this is cool3'}
    ];

  $scope.getLocation = function(val) {
      return $http.get('http://maps.googleapis.com/maps/api/geocode/json', {
          params: {
              address: val,
              sensor: false
            }
        }).then(function(res) {
          var addresses = [];
          angular.forEach(res.data.results, function(item) {
              addresses.push(item.formatted_address);
            });
            return addresses;
        });
    };

})

// Tag manager Directive
// ------------------------------------------------


.directive('tagManager', function($timeout) {
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        scope: {
            tags: '=ngModel',
            selectData: '=',
            element: '=element',
            formData: '=formData'
        },
      template:
            '<div class="fake-input" focus-input>' + 
                '<div class="tags">' +
                    '<a ng-repeat="(idx, tag) in tags track by $index" class="tag" ng-click="remove(idx)">{{tag.label}}<i class="icon--cross"></i></a>' +
                '</div>' +
            '</div>',
      link: function( $scope, $element, $attrs, $ctrls, $transclude ) {
            
          $scope.tags = $scope.tags || [];
 
            // This is the ng-click handler to remove an item
            $scope.remove = function(idx) {
                $scope.selectData.push($scope.tags[idx]); // add deleted tag to original array 
                $scope.tags.splice(idx, 1);
            };

            //We need to disable the submission of tags when we have typeahead to select from
          if( !angular.isArray($scope.selectData) ) {
              $timeout(function() {
                  $element.find('input').bind('keypress', function(event) {

                        if (event.which === 13) {

                            if (this.value.length) {

                                $scope.tags.push(this.value);
                                this.value = '';
                                $scope.$apply();

                            }

                            event.preventDefault();

                        }

                    });
                    
                  $scope.$on('$destroy', function() {
                      $element.find('input').off('keypress');
                    });

                }, 200);
            }

          $timeout(function() {

              $element.find('input').bind('keydown', function(event) {

                    if (event.which === 8) {
                        if (($scope.tags.length > 0) && ($(this).val().length === 0)) { // Don't do anything if there are no tags
                            $scope.remove($scope.tags.length - 1); // Remove the last item in the array
                            $scope.$apply();
                        }
                    }
                });
            });

             $transclude($scope, function(clone) {

                //AddTag is called on typeAhead select, it's in the child scope so it can access it's ng-model
                // without it needing to be hoisted up on init.
              $scope.addTag = function($item, $model, $label) {
                    
                    //Make sure we are pushing into an array
                    if (!angular.isArray($scope.tags)) {
                        $scope.tags = [];
                    }
                    // If the item doesn't already exist in the array, lets add it
                    if (!$scope.tags.filter(function(tag) {return angular.toJson($item) === angular.toJson(tag);}).length) {
                        $scope.tags.push($item);
                    }
                    //clear the input field regardless of outcome
                    $scope.typeAheadTag = undefined;
                };

              $element.append(clone);
            });
        }
    };
})



.run(function($templateCache) {

    $templateCache.put('template/typeahead/typeahead-match.html',
          '<a class="typeahead__link" tabindex="-1" bind-html-unsafe="match.label | typeaheadHighlight:query"></a>');

    $templateCache.put('template/typeahead/typeahead-popup.html',
          '<ul class="typeahead__list popout" ng-show="isOpen()" ng-style="{top: position.top+\'px\'}" style="display: block;" role="listbox" aria-hidden="{{!isOpen()}}">' +
              '<li ng-repeat="match in matches track by $index" class="typeahead__item" ng-class="{\'is--active\': isActive($index) }" ng-mouseenter="selectActive($index)" ng-click="selectMatch($index)" role="option">' +
                  '<div typeahead-match index="$index" match="match" query="query" template-url="templateUrl"></div>' +
              '</li>' +
          '</ul>');

});