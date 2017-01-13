
// Overflow Directive
// ------------------------------------------------

angular.module('ui.common')


// Tab
// ------------------------------------------------


/*
 * Overflow TODO
 * Gets link data, in which is builds a list, and excess list.
 * When the list resizes it will show the excess list as needed.
 *
 * <ul overflow />
 * 
 */

.directive('overflow', ['onResize', '$compile', '$timeout', function(onResize, $compile, $timeout) {

    return {
        restrict: 'A',
        transclude: 'element',
        scope: true,
        replace:true,
        templateUrl: '/interface/views/common/partials/overflow.html',
        controller: function($scope, $element, $attrs, $transclude) {

            var that = this,
                visibleTabsWidth;

            $scope.overflowNavItems = [];

            // Overwrite classes applied inadvertently in the transclude
            $element.removeClass('nav').removeClass('nav--tabs');

            var $tabNavItems = [];
            that.navWidths = [];

            // Set some default values
            $scope.showToggle = false;
            $scope.showFrom = 99;

            // Initiate the process of checking which elements need to be hidden and shown
            this.checkWidths = function(listWrapper) {

                var maxListWidth = listWrapper.outerWidth() - $element.find('.overflow__toggle').outerWidth() - 2; // 2 for some buffer

                //get total item width
                var totalItemWidth = that.navWidths.reduce(function(totalWidth, item) {

                    return totalWidth + Math.floor(item);
                }, 0);

                if( maxListWidth <= totalItemWidth ) {
                    
                    $scope.showToggle = true;
                    $scope.showFrom = getHiddenIndex(maxListWidth);
                
                } else {

                    $scope.showToggle = false;
                    $scope.showFrom = that.navWidths.length;
                }

            };

            // Return an index to indicate the last element that is visible
            function getHiddenIndex(listWidth) {
                
                var len = that.navWidths.length,
                    itemsLength = 0;

                for (var i = 0; i < len; i++) {

                    itemsLength += that.navWidths[i];

                    if( listWidth < itemsLength ) {
                        break;
                    }
                }

                return i - 1;
            }

            // Sets the visibility of the overflow nav list items
            function setVisibility(ind) {
                
                var len = $tabNavItems.length;
                visibleTabsWidth = 0;

                for (var i=0; i < len; i++) {
                    
                    $tabNavItems.eq(i).removeClass('last-visible-child'); // Class is used for styling
                    if(i < ind) {
                        $tabNavItems.eq(i).removeClass('ng-hide');
                        visibleTabsWidth = visibleTabsWidth + $tabNavItems.eq(i).outerWidth();
                    } else {
                        $tabNavItems.eq(i).addClass('ng-hide');
                    }
                }

                // This class is used for styling purposes
                $tabNavItems.eq(ind - 1).addClass('last-visible-child');

                // Set the offset of the dropdown menu so that it aligns with it's toggle button
                positionOverflowList();
            }

            function positionOverflowList() {
                var overflowListOffset = $element.width() - visibleTabsWidth - $element.find('.overflow__toggle').outerWidth() - 1;
                $element.find('.overflow__excess').css('right', overflowListOffset + 'px');
            }

            // If the resize function has triggered a change in visible tabs, watch for it here and set visibility appropriately.
            $scope.$watch('showFrom', function(newVal, oldVal) {

                if(newVal !== oldVal) {
                    setVisibility(newVal + 1);
                }
            });

            // Toggle the visible tab when a link in the overflow menu is clicked
            $scope.toggleTab = function(index) {

                $timeout(function() {
                    angular.element($tabNavItems[index]).click();
                });
            };

            $scope.initialise = function() {
                // Store the list of tab items
                $tabNavItems = $element.find('.overflow__list').children('li');

                // Builds an object for excess item
                angular.forEach($tabNavItems, function(item) {
                    var $item = angular.element( item );
                    that.navWidths.push( $item.outerWidth());
                });

                //set resize binding for List we appended
                function resize() {
                    that.checkWidths($element.find('.nav--tabs'));
                    positionOverflowList();
                }

                onResize.register(resize);

                $scope.$on('$destroy', function() {
                    onResize.deregister(resize);
                });
            };
        },
        link: function(scope, element, attrs, ctrl, transclude) {

            transclude(function(clone) {

                // Listen for children on the clone if they are not there already.  Sometimes these are rendered in a ng-repeat which can be slow to load
                var listener = scope.$watch(
                    function() {
                        return clone.children('li');
                    },
                    function(newVal, oldVal) {

                        if (newVal !== oldVal) {

                            angular.forEach(clone.children('li'), function(item) {

                                item = angular.element(item).children('a')[0].outerHTML;
                                scope.overflowNavItems.push(item);
                            });

                            clone.addClass('overflow__list');
                            clone.append(element.find('.overflow__toggle'));
                            element.prepend(clone);

                            scope.initialise(); // Now that we have the nav items, start to figure out which ones to hide and show

                            listener(); // Clear scope watch
                        }
                    }
                );
            });
        }
    };
}])

.directive('compileOverflow', ['$compile', function($compile) {
    return function(scope, element, attrs) {
        element.html(scope.item);
        $compile(element.contents())(scope);
    };
}]);
