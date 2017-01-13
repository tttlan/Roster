describe("Unit: Directive:applicantsList", function() {

    var $scope, $compile, $controller, template, element;
    var $rootScope, JobApplicantListService, $routeParams, $location, $modal, JobApplicantSearchSingleton, EntityActionType, StatusChangeModel, StatusItemModel, DocumentViewerSingleton, DocumentList, ApplicantListOrderBy;

    beforeEach(function() {
        module('sherpa');
        module('ui.recruit.jobs');
        module('templates');

        inject(function(_$rootScope_, _$compile_, _$controller_, $injector, $templateCache) {
            $compile = _$compile_;
            $scope = _$rootScope_;
            $controller = _$controller_;

            JobApplicantListService = $injector.get('JobApplicantListService');
            $routeParams = $injector.get('$routeParams');
            $location = $injector.get('$location');
            $modal = $injector.get('$modal');
            JobApplicantSearchSingleton = $injector.get('JobApplicantSearchSingleton');
            EntityActionType = $injector.get('EntityActionType');
            StatusChangeModel = $injector.get('StatusChangeModel');
            StatusItemModel = $injector.get('StatusItemModel');
            DocumentViewerSingleton = $injector.get('DocumentViewerSingleton');
            DocumentList = $injector.get('DocumentList');
            ApplicantListOrderBy = $injector.get('ApplicantListOrderBy');

            element = $compile("<applicants-list></applicants-list>")($scope);
            //element = $templateCache.put('interface/views/recruit/job-application/partials/application-list.html', '<applicants-list></applicants-list>')($scope);
            $compile(element)($scope);
            $scope.$digest();
        })
    });

    /*beforeEach(function() {
        module('sherpa');
        module('templates');

        inject(function($rootScope, $compile) {
            $scope = $rootScope.$new();
            element = angular.element("<applicants-list></applicants-list>");

            $compile(element)($scope);
            $scope.$digest();

            controller = element.controller;
            $scope = element.isolateScope();
            debugger;
        });
    });*/

    it("Order by Applicant (Applicant Name)", function() {
        console.log('This is the scope', $scope);
        expect($scope.ApplicantListControls.sortingArrows.applicantSortingArrow).toBeTruthy();
        expect($scope.ApplicantListControls.sortingValue).toBeNull();
        $scope.orderBy('ApplicantInformation.FirstName');
        expect($scope.ApplicantListControls.sortingArrows.applicantSortingArrow).toBeFalsy();
        expect($scope.ApplicantListControls.sortingValue).toBe('ApplicantInformation.FirstName desc');
        $scope.orderBy('ApplicantInformation.FirstName');
        expect($scope.ApplicantListControls.sortingArrows.applicantSortingArrow).toBeTruthy();
        expect($scope.ApplicantListControls.sortingValue).toBe('ApplicantInformation.FirstName asc');
    });

    xit("Order by Application Status", function() {
        expect($scope.ApplicantListControls.sortingArrows.statusSortingArrow).toBeTruthy();
        expect($scope.ApplicantListControls.sortingValue).toBeNull();
        $scope.orderBy('ApplicationStatus');
        expect($scope.ApplicantListControls.sortingArrows.statusSortingArrow).toBeFalsy();
        expect($scope.ApplicantListControls.sortingValue).toBe('ApplicationStatus desc');
        $scope.orderBy('ApplicationStatus');
        expect($scope.ApplicantListControls.sortingArrows.statusSortingArrow).toBeTruthy();
        expect($scope.ApplicantListControls.sortingValue).toBe('ApplicationStatus asc');
    });

    xit("Order by Application Elapse Time", function() {
        expect($scope.ApplicantListControls.sortingArrows.elapsedSortingArrow).toBeTruthy();
        expect($scope.ApplicantListControls.sortingValue).toBeNull();
        $scope.orderBy('AppDate');
        expect($scope.ApplicantListControls.sortingArrows.elapsedSortingArrow).toBeFalsy();
        expect($scope.ApplicantListControls.sortingValue).toBe('AppDate desc');
        $scope.orderBy('AppDate');
        expect($scope.ApplicantListControls.sortingArrows.elapsedSortingArrow).toBeTruthy();
        expect($scope.ApplicantListControls.sortingValue).toBe('AppDate asc');
    });

    xit("Order by Application Note Count", function() {
        expect($scope.ApplicantListControls.sortingArrows.notesSortingArrow).toBeTruthy();
        expect($scope.ApplicantListControls.sortingValue).toBeNull();
        $scope.orderBy('CommentCount');
        expect($scope.ApplicantListControls.sortingArrows.notesSortingArrow).toBeFalsy();
        expect($scope.ApplicantListControls.sortingValue).toBe('CommentCount desc');
        $scope.orderBy('CommentCount');
        expect($scope.ApplicantListControls.sortingArrows.notesSortingArrow).toBeTruthy();
        expect($scope.ApplicantListControls.sortingValue).toBe('CommentCount asc');
    });

    xit("Order by Throw Error - Not a valid filter option", function() {
        expect($scope.ApplicantListControls.sortingValue).toBeNull();
        expect($scope.orderBy('I am not a sorting value')).toThrowError('Column I am not a sorting value does not exist');
        expect($scope.ApplicantListControls.sortingValue).toBeNull();
    });
});