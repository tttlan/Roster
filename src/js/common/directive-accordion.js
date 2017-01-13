angular.module('ui.common')
// build new root accordion but ony used in the survey module
// to use this accodion, must create a dependency to the survey module
.directive('accordionSegment', ['accordionFactory', function(accordionFactory) {
    var accordionSegment = angular.copy(accordionFactory);
    accordionSegment.templateUrl = '/interface/views/common/partials/accordion-segment.html';
    return accordionSegment;
}])
.directive('accordionSegmentGroup', ['accordionGroupFactory', function(accordionGroupFactory) {
    var accordionSegmentGroup = angular.copy(accordionGroupFactory);
    accordionSegmentGroup.templateUrl = '/interface/views/common/partials/accordion-segment-group.html';
    return accordionSegmentGroup;
}])
.directive('accordionSegmentJobAdd', ['accordionFactory', function(accordionFactory) {
    var accordionSegmentJobAdd = angular.copy(accordionFactory);
    accordionSegmentJobAdd.templateUrl = '/interface/views/common/partials/accordion-segment-job-add.html';
    return accordionSegmentJobAdd;
}])
.directive('accordionSegmentJobProvider', ['accordionGroupFactory', function(accordionGroupFactory) {
    var accordionSegmentJobProvider= angular.copy(accordionGroupFactory);
    accordionSegmentJobProvider.templateUrl = '/interface/views/common/partials/accordion-segment-job-provider.html';
    return accordionSegmentJobProvider;
}]);
