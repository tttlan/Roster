
// Tabs Directive
// ------------------------------------------------

angular.module('ui.common')


// Tab
// ------------------------------------------------

/*
 * Usage:
 * 
 * <tabs selected=" ID of active index ">
 *     <div tab-link tab-hash="first" classes="is--active">First tab</div>
 *     <div tab-link tab-hash="second">Second tab</div>
 *     <div tab-content>Content 1</div>
 *     <div tab-content>Content 2</div>
 * </tabs>
 * 
 * The 'tab-body' directives are optional. If they are not 
 * defined then the 'tab-link' requires an <a href> element.
 * This is used in situations where to tabs link to pages,
 * not internal content.
 * 'tab-hash' attributes are optional.  If defined a hash will
 * be applied to the url on load and click.  If not defined the url
 * will be unaffected by tabs
 * 
 */

.directive( 'tabs', ['$timeout', function($timeout) {
    return {
        scope: true,
        restrict: 'EA',
        priority:10,
        controller: function( $scope, $attrs ) {
            
            $scope.tabs = {
                index: 0,
                count: 0
            };

            this.bodyIndex = 0;

            this.getTabBodyIndex = function() {
                
                this.bodyIndex++;

                return this.bodyIndex;
            };

            // We can set the active index with a selected attr, that we then watch for a change
            // After a single change, we will remove the watch
            if($attrs.selected) {

                var selectedWatch = $scope.$watch($attrs.selected, function(newVal, oldVal) {
                
                    if(newVal) {
                        $timeout(function() {
                            $scope.tabs.index = newVal;
                        });

                        //clear watch
                        selectedWatch();
                    }
                });
            }

        },
        link: function(scope, element, attrs) {

            element.addClass('tabs');
        }
    };
}])


// Tab Link
// ------------------------------------------------

.directive( 'tabLink', ['$location', function($location) {
    return {
        scope: false,
        restrict: 'EAC',
        priority:10,
        link: function( scope, element, attributes) {
            
            var index = element.index() + 1,
                value = attributes.classes,
                active = attributes.active !== undefined ? true : false,
                tabUrl = attributes.tabHash;
            
            scope.tabs.index = scope.tabs.index || ( active ? index : null );

            // If there is a hash in the url, override the active index
            if ($location.hash() === tabUrl) {
                scope.tabs.index = index;
            }
            
            element.on('click', function() {
                
                if(element.is('.is--disabled')) { return; }

                // Update the hash in the url
                if (tabUrl) {
                    $location.hash(tabUrl);
                }

                scope.$apply(function() {
                    scope.tabs.index = index;
                });
            });

            scope.$watch( 'tabs.index', function(val) {
                element.find('a').toggleClass( 'is--active', val === index );
            });


            scope.$on('$destroy', function() {
                element.off('click');
            });
        }
    };
}])


// Tab Content
// ------------------------------------------------

.directive( 'tabContent', ['$compile', '$HTTPCache',
    function( $compile, $HTTPCache) {
    return {
        scope: false,
        restrict: 'EAC',
        require: '^tabs',
        priority:10,
        link: function( scope, element, attributes, controller ) {
            
            var index = controller.getTabBodyIndex();

            scope.$watch( 'tabs.index', function() {
                
                var isActive = scope.tabs.index === index,
                    externalContentUrl = attributes.tabContentUrl;
                
                // If it has a tabContentUrl attr, lets load in it's content
                // dynamically, just once though... this aint no charity.
                if(isActive && externalContentUrl) {
                    
                    //element.html('<div class="segment is--loading"></div>');
                    attributes.$set('tabContentUrl', '');

                    $HTTPCache.getTemplate(externalContentUrl).then(function(response) {
                        element.html(response);
                        $compile(element.contents())(scope);
                    });
                    
                }

                element.toggleClass( attributes.ngTabBody + ' is--active', isActive );
            
            });
        }
    };
}]);