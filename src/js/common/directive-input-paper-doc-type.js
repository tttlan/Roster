angular.module('ui.common')

/**
 * <input-paper-doc-type name="" ng-model="" object="" ng-required="" ng-disabled=""></input-paper-doc-type>
 * ng-model="" will get populated with the selected's id
 * object="" will get populated with the selected's object, which looks like this:
 * {
 *     Description: "Tax File Declaration",
 *     PaperDocTypeId: 8
 * }
 */

.directive('inputPaperDocType', function(Networks) {
    return {
        restrict: 'E',
        scope: {
            ngModel: '=',
            name: '@?',
            ngRequired: '=?',
            ngDisabled: '=?',
            selectedDocumentTypes: '=?',
            object: '=?'
        },
        template: [
            '<div class="select-wrapper">',
            '    <select',
            '        id="{{::name}}"',
            '        name="{{::name}}"',
            '        ng-model="ngModel"',
            '        ng-options="i.PaperDocTypeSummary.PaperDocTypeId as i.PaperDocTypeSummary.Description for i in items"',
            '        ng-required="ngRequired"',
            '        ng-disabled="ngDisabled"',
            '    >',
            '    </select>',
            '    <span class="select">{{object.Description}}</span>',
            '</div>'
        ].join(''),
        link: function(scope) {
            scope.items = [];
            
            Networks.getPaperDocTypes().then(function(items) {

                //filter away document types that are already added
                scope.items = _.filter(items, item => !_.any(scope.selectedDocumentTypes, {
                    InboundRequirement: { 
                        RequirementDocumentTypeId: item.PaperDocTypeSummary.PaperDocTypeId 
                    }
                }));
                scope.object = {};

                if (scope.items && scope.items.length > 0) {
                    scope.$watch('ngModel', function(newVal) {
                        var obj = scope.items.filter(function(item) {
                            return item.PaperDocTypeSummary.PaperDocTypeId === newVal;
                        })[0];

                        scope.object = obj && obj.PaperDocTypeSummary;
                    });
                }
            });
        }
    };
});
