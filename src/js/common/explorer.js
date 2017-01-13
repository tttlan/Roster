/**
 * Created by btnhai on 12/1/2015.
 * The same as accordion
 */
angular.module('ui.common.explorer', ['ui.bootstrap.collapse'])

    .constant('explorerConfig', {
        closeOthers: false
    })

    .controller('ExplorerController', ['$scope', '$attrs', 'explorerConfig', function($scope, $attrs, explorerConfig) {

        // This array keeps track of the explorer groups
        this.groups = [];

        // Ensure that all the groups in this explorer are closed, unless close-others explicitly says not to
        this.closeOthers = function(openGroup) {
            var closeOthers = angular.isDefined($attrs.closeOthers) ? $scope.$eval($attrs.closeOthers) : explorerConfig.closeOthers;
            if (closeOthers) {
                angular.forEach(this.groups, function(group) {
                    if (group !== openGroup) {
                        group.isOpen = false;
                    }
                });
            }
        };

        // This is called from the explorer-group directive to add itself to the explorer
        this.addGroup = function(groupScope) {
            var that = this;
            this.groups.push(groupScope);

            groupScope.$on('$destroy', function(event) {
                that.removeGroup(groupScope);
            });
        };

        // This is called from the explorer-group directive when to remove itself
        this.removeGroup = function(group) {
            var index = this.groups.indexOf(group);
            if (index !== -1) {
                this.groups.splice(this.groups.indexOf(group), 1);
            }
        };

    }])

// The explorer directive simply sets up the directive controller
// and adds an explorer CSS class to itself element.
    .directive('explorer', function() {
        return {
            restrict: 'EA',
            controller: 'ExplorerController',
            transclude: true,
            replace: true, // !!!!!  This has been changed, default Bootstrap value is false
            templateUrl: '/interface/views/common/partials/explorer.html'
        };
    })

// The explorer-group directive indicates a block of html that will expand and collapse in an explorer
    .directive('explorerRoot', ['$parse', function($parse) {
        return {
            require: '^explorer',         // We need this directive to be inside an explorer
            restrict: 'EA',
            transclude: true,              // It transcludes the contents of the directive into the template
            replace: true,                // The element containing the directive will be replaced with the template
            templateUrl: '/interface/views/common/partials/explorer-root.html',
            scope: {heading: '@'},        // Create an isolated scope and interpolate the heading attribute onto this scope
            controller: function() {
                this.setHeading = function(element) {
                    this.heading = element;
                };
            },
            link: function(scope, element, attrs, explorerCtrl) {
                var getIsOpen, setIsOpen;

                explorerCtrl.addGroup(scope);

                scope.isOpen = false;

                if (attrs.isOpen) {
                    getIsOpen = $parse(attrs.isOpen);
                    setIsOpen = getIsOpen.assign;

                    scope.$parent.$watch(getIsOpen, function(value) {
                        scope.isOpen = !!value;
                    });
                }

                scope.$watch('isOpen', function(value) {
                    if (value) {
                        explorerCtrl.closeOthers(scope);
                    }
                    if (setIsOpen) {
                        setIsOpen(scope.$parent, value);
                    }
                });
            }
        };
    }])

// Use explorer-heading below an explorer-group to provide a heading containing HTML
// <explorer-group>
//   <explorer-heading>Heading containing HTML - <img src="..."></explorer-heading>
// </explorer-group>
    .directive('explorerHeading', function() {
        return {
            restrict: 'EA',
            transclude: true,   // Grab the contents to be used as the heading
            template: '',       // In effect remove this element!
            replace: true,
            require: '^explorerRoot',
            compile: function(element, attr, transclude) {
                return function link(scope, element, attr, explorerGroupCtrl) {
                    // Pass the heading to the explorer-group controller
                    // so that it can be transcluded into the right place in the template
                    // [The second parameter to transclude causes the elements to be cloned so that they work in ng-repeat]
                    explorerGroupCtrl.setHeading(transclude(scope, function() {
                    }));
                    element.remove(); // !!!!!!!!! Custom change - remove this element once it's been transcluded
                };
            }
        };
    })

// Use in the explorer-group template to indicate where you want the heading to be transcluded
// You must provide the property on the explorer-group controller that will hold the transcluded element
// <div class="explorer-group">
//   <div class="explorer-heading" ><a ... explorer-transclude="heading">...</a></div>
//   ...
// </div>
    .directive('explorerTransclude', function() {
        return {
            require: '^explorerRoot',
            link: function(scope, element, attr, controller) {
                scope.$watch(function() {
                    return controller[attr.explorerTransclude];
                }, function(heading) {
                    if (heading) {
                        element.html('');
                        element.append(heading);
                    }
                });
            }
        };
    });