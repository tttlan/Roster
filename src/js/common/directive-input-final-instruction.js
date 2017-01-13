angular.module('ui.common')

/**
 * <input-final-instruction name="" ng-model="" object="" ng-required="" ng-disabled=""></input-final-instruction>
 * ng-model="" will get populated with the selected's Message
 * object="" will get populated with the selected's object, which looks like this:
 * {
 *     WelcomeMessageId: 0,
 *     Message: "Lorem ipsum",
 *     Title: "Uniform Request"
 * }
 */

.directive('inputFinalInstruction', function(Networks) {
    return {
        restrict: 'E',
        scope: {
            ngModel: '=',
            name: '@?',
            ngRequired: '=?',
            ngDisabled: '=?',
            object: '=?'
        },
        template: [
            '<div class="select-wrapper">',
            '    <select',
            '        id="{{::name}}"',
            '        name="{{::name}}"',
            '        ng-model="ngModel"',
            '        ng-options="i.WelcomeMessageRecordSummary.Message as i.WelcomeMessageRecordSummary.Title for i in items track by i.WelcomeMessageRecordSummary.WelcomeMessageId"',
            '        ng-required="ngRequired"',
            '        ng-disabled="ngDisabled"',
            '    >',
            '    </select>',
            '    <span class="select">{{object.Title}}</span>',
            '</div>'
        ].join(''),
        link: function(scope) {
            scope.items = [];

            Networks.getFinalInstructions().then(function(items) {
                scope.items = items.WelcomeMessageRecordSummaryItemResults;

                scope.$watch('ngModel', function(newVal) {
                    if (newVal) {
                        var obj = scope.items.filter(function(item) {
                            return item.WelcomeMessageRecordSummary.Message === newVal;
                        })[0];

                        scope.object = obj.WelcomeMessageRecordSummary;
                    } 
                });
            });
        }
    };
});
