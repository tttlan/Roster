// timeRangePicker directive
// ------------------------------------------------

angular.module('ui.common')

.directive('timeRangeInput', ['$dateFormatter', function($dateFormatter) {
    return {
        require: ['ngModel', '?^timeRangePicker'],
        scope: {
            ngModel: '=',
            ctrl: '=?'
        },
        link: function($scope, element, attrs, controllers) {
            var controller = controllers[0];
            var picker = controllers[1];
            //var ctrl = attrs.ctrl ? $scope.$eval(attrs.ctrl) : null;
            $scope.ctrl = $scope.ctrl || {};
            var ctrl = $scope.ctrl;
            $scope.$watch('ngModel', function(n, o, s) {
            });
            function setValidations(ngModel) {
                ngModel.$setValidity('outsideTimeRangeRule', ngModel.$valid);
            }
            if (ctrl) {
                controller.$render = function() {
                    element.val(ctrl.getRenderValue());
                };
                controller.$formatters.push(function(modelValue) {
                    return modelValue;
                });

                ctrl.runValidations = function(ngModel) {
                    setValidations(ngModel);
                };
                ctrl.render = function() {
                    controller.$render();
                };
            }
        }
    };
}])
.directive('timeRangePicker', ['$document', '$dateFormatter', '$compile', '$timeout', function($document, $dateFormatter, $compile, $timeout) {
    function generateRandomId() {
        return new Date().getTime();
    }
    return {
        require: 'ngModel',
        scope: {
            ngModel: '=?'
        },
        replace: true,
        link: {
            pre: function($scope, element, attrs) {
            },
            post: function($scope, element, attrs, controller, transcludeFn) {
                var cloned = angular.copy(element);

                $scope.ctrl = {
                    getRenderValue: function() {
                        return bindPrev.val();
                    }
                };
                $scope.tooltipCtrl = {
                    ok: function() {
                        /*$scope.ngModel.$dateValue1 = $scope.innerModel.$dateValue1;
                        $scope.ngModel.$dateValue2 = $scope.innerModel.$dateValue2;*/
                        $scope.ngModel = angular.copy($scope.innerModel);
                        $scope.ctrl.render(); // reason for this render not updated, should remove this hacky

                        backupNgModel = angular.copy($scope.ngModel);
                        $scope.ctrl.runValidations(bindPrev.controller('ngModel'));
                    },
                    cancel: function() {
                        $scope.innerModel.$dateValue1 = backupNgModel.$dateValue1;
                        $scope.innerModel.$dateValue2 = backupNgModel.$dateValue2;
                    }
                };

                var editable = !!attrs.edittable;
                var backupNgModel = angular.copy($scope.ngModel);
                $scope.innerModel = angular.copy($scope.ngModel);

                var randomId = 'time_' + generateRandomId();
                var template = '<div class="timepicker-wrapper">';
                var rangeInput = '<input type="text" time-range-input ctrl=ctrl class="form-control" size="8" ng-required="true" ng-model="ngModel" '; // ng require will be used as parameter
                rangeInput += ('id="' + randomId + '"');
                if (editable) {
                    /* Todo : current disabled editable */
                }
                rangeInput += ' />';

                /* Todo: support keyboard or mouse scroll */
                // support full option of bs time range picker , format time, extend this directive to support it instead of default options
                var hiddenInput = '<input style="display: none;" ng-model = "innerModel" bs-time-range-picker ctrl="tooltipCtrl" ';
                angular.forEach(['template', 'bs-show', 'min-time', 'max-time', 'templateUrl', 'controller', 'controllerAs', 'placement', 'container', 'delay', 'trigger', 'keyboard', 'html', 'animation', 'autoclose', 'timeType', 'timeFormat', 'timezone', 'modelTimeFormat', 'useNative', 'hourStep', 'minuteStep', 'secondStep', 'length', 'arrowBehavior', 'iconUp', 'iconDown', 'roundDisplay', 'id', 'prefixClass', 'prefixEvent'], function(key) {
                    if (angular.isDefined(attrs[key])) {
                        hiddenInput = " " + key + "='" + attrs[key] + "' ";
                    }
                });

                angular.forEach(['html', 'container', 'autoclose', 'useNative', 'roundDisplay'], function(key) {
                    if (angular.isDefined(attrs[key])) {
                        hiddenInput = " " + key + "='" + attrs[key] + "' ";
                    }
                });

                hiddenInput += (" target='#" + randomId + "' ");

                hiddenInput += ' />';

                template += (hiddenInput + rangeInput);
                template += '</div>';

                element.append($compile(template)($scope));

                var bind = element.find('input[type=text]');
                var bindPrev = bind.prev();

                bind.on('click', function() {
                    if ($scope.tooltipCtrl && $scope.tooltipCtrl.show) {
                        $scope.tooltipCtrl.show();
                    }
                });
                bind.on('blur', function() {
                    if ($scope.tooltipCtrl && $scope.tooltipCtrl.hide) {
                        $scope.tooltipCtrl.cancel();
                        $scope.tooltipCtrl.hide();
                    }
                });


                function runValidations() {
                    // validation input will impact on hidden input
                    // there's no way to validation on time range input, this case will implement for later,
                    // currently it was disabled for editting
                    // the validation parameter will affect only hidden input
                    if ($scope.ctrl.runValidations) {
                        $scope.ctrl.runValidations(bindPrev.controller('ngModel'));
                    }
                }
                runValidations();
                $scope.$on('$destroy', function() {
                    bind = null;
                    bindPrev = null;
                });
            }
        }
    };
}]);