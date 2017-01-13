angular.module('ui.common')

.directive('formErrors', function() {
    return {
        replace: 'true',
        restrict: 'E',
        template: [
            '<div class="form__errors" ng-messages="input.$error" ng-show="input.$dirty">',
            '    <div ng-transclude></div>',
            '</div>'
        ].join(''),
        transclude: true,
        scope: {
            input: '='
        }
    };
})

.directive('formError', function($compile) {
    return {
        replace: 'true',
        restrict: 'E',
        template: [
            '<span class="form__note form__note--error">',
            '    {{::errorText}}',
            '</span>'
        ].join(''),
        compile: function(tElement, tAttrs) {
            tAttrs.$set('ng-message', tAttrs.errorKey);

            var linkFn = function(scope, element, attrs) {
                if (!angular.isString(attrs.errorText)) {
                    // We have default messages for some validation types
                    scope.errorText = getDefaultMessage(attrs.errorKey);
                } else {
                    scope.errorText = attrs.errorText;
                }

                $compile(element)(scope);

                function getDefaultMessage(errorKey) {
                    switch (errorKey) {
                        case 'required':
                            return 'This field is required.';
                        default:
                            return 'There is an error with this field.';
                    }
                }
            };

            return linkFn;
        }
    };
});
