// Controller profileHistory
// ----------------------------------------

describe('Unit: Controller:profileHistory', function() {

    var $scope, $location, $timeout, createController, $httpBackend, Profile, API_BASE_URL, memberId = '';

    beforeEach(function() {
        module('sherpa');
        module('templates');
        
        module(function ($provide) {
            $provide.provider('$routeParams', function () {
                this.$get = function () {
                    return {
                        memberId: memberId
                    };
                };
            });
        });
        
        inject(function($rootScope, $controller, _$location_, $injector, _$timeout_) {

            $scope = $rootScope.$new();
            $location = _$location_;
            $httpBackend = $injector.get('$httpBackend');
            Profile = $injector.get('Profile');
            API_BASE_URL = $injector.get('API_BASE_URL');
            $timeout = _$timeout_;

            // For some reason base is needed here.  No idea why, found the answer here:
            // http://stackoverflow.com/questions/17370427/loading-a-mock-json-file-within-karmaangularjs-test
            jasmine.getJSONFixtures().fixturesPath = 'base/interfaceSource/test/mockData/api/';

            $scope.profile = { $userCan: {} };
            $scope.profile.$userCan.viewprofileemploymentdetail = true;
            createController = function() {
                return $controller('profileHistory', {
                    '$scope': $scope
                });
            };
            
            // Get employment history for the current user or a specific user
            $httpBackend.when('GET', API_BASE_URL + 'profilemanagement/' + (memberId ? memberId : 'me') + '/memberemploymenthistory').respond(200, 
               getJSONFixture('profilemanagement/memberemploymenthistory/index.json')
            );
                        
            $httpBackend.when('GET', API_BASE_URL + 'members/' + (memberId ? memberId : 'me') + '/training-subjects').respond(200, 
               getJSONFixture('members/me/training-subjects/index.json')
            );
            
            $httpBackend.when('GET', API_BASE_URL + 'members/' + (memberId ? memberId : 'me') + '/training-courses').respond(200, 
               getJSONFixture('members/me/training-courses/index.json')
            );            
            
            $httpBackend.when('GET', API_BASE_URL + 'members/' + (memberId ? memberId : 'me') + '/training-courses/614/training-subjects').respond(200, 
               getJSONFixture('members/me/training-courses/training-subjects/index.json')
            ); 
        });
    });
    
    it('can load all data from the training courses, training subjects and member employment history apis sucessfully', function(){
        
        var controller = createController();
        $location.path('/profile/?tab=history');
        
        $httpBackend.flush();  
    });
    
    it('can format the employment history data and performance assessment data correctly so it works nicely with the UI', function(){
        var controller = createController();
        $location.path('/profile/?tab=history');
        
        expect($scope.history.employmentHistory.$loaded).toEqual(false);
        expect($scope.history.performanceAssessments.$loaded).toEqual(false);
        
        $httpBackend.flush();  
        
        expect($scope.history.employmentHistory.$loaded).toEqual(true);
        expect($scope.history.performanceAssessments.$loaded).toEqual(true);
        
        expect($scope.history.$userCan).toBeDefined();
        expect($scope.history.$userCan.canviewemploymenthistory).toEqual(true);
        
        expect($scope.history.employmentHistory).toBeDefined();                
        expect($scope.history.employmentHistory.$isEmpty).toEqual(false);
        expect($scope.history.employmentHistory.MemberId).toEqual(290822);
        expect($scope.history.employmentHistory.Source).toEqual('Sherpa');
        expect($scope.history.employmentHistory.PromotionHistoryEntries.length).toEqual(2);
        expect($scope.history.employmentHistory.MemberExportHistories[0].ExportDate).toEqual('2014-08-12T16:41:30.567');

        expect($scope.history.performanceAssessments.PerformanceItemResults.length).toEqual(1);
        expect($scope.history.performanceAssessments.PerformanceItemResults[0].Performance.StartDate).toEqual('2014-09-17T00:00:00');
        expect($scope.history.performanceAssessments.PerformanceItemResults[0].Performance.CustomForm.Title).toEqual('Performance Review 2014/2015');        
        expect($scope.history.performanceAssessments.$userCan).toEqual({});
        
        memberId = 1234;
    });
    
    it('can load employment history data for a specific member', function(){
        
        var controller = createController();
        $location.path('/profile/1234/?tab=history');
        
        $httpBackend.flush(); 
    });
    
    it('can format the training history and training courses data correctly so it works nicely with the UI', function(){

        $scope.profile.$userCan.canviewtraining = true;
        var controller = createController();
        $location.path('/profile/?tab=history');

        expect($scope.history.trainingHistory.courses.$loading).toEqual(true);
        expect($scope.history.trainingHistory.subjects.$loading).toEqual(true);
        expect($scope.history.trainingHistory.courses.$loaded).toEqual(false);
        expect($scope.history.trainingHistory.subjects.$loaded).toEqual(false);
        expect($scope.history.trainingHistory.courses.data).toEqual([]);
        expect($scope.history.trainingHistory.subjects.data).toEqual([]);
        
        $httpBackend.flush();  
        
        expect($scope.history.trainingHistory.courses.$loading).toEqual(false);
        expect($scope.history.trainingHistory.subjects.$loading).toEqual(false);
        expect($scope.history.trainingHistory.courses.$loaded).toEqual(true);
        expect($scope.history.trainingHistory.subjects.$loaded).toEqual(true);
        
        expect($scope.history.trainingHistory.courses.data.length).toEqual(7);
        expect($scope.history.trainingHistory.courses.data[3].TrainingCourseForMemberSummary.Title).toEqual('Mad Mex Induction');
        expect($scope.history.trainingHistory.subjects.data.length).toEqual(4);
        expect($scope.history.trainingHistory.subjects.data[2].TrainingSubjectForMemberSummary.Description).toEqual('This is an overview of the new South Melbourne store');
    });
    
    it('can retrieve and show the history details of a course', function(){

        $scope.profile.$userCan.canviewtraining = true;
        var controller = createController();
        $location.path('/profile/?tab=history');
        
        $httpBackend.flush();
        
        $scope.history.openCourse(3);
        expect($scope.history.trainingHistory.courses.data[3].subjects).toBeUndefined();
        
        $httpBackend.flush();
    
        expect($scope.history.trainingHistory.courses.data[3].subjects.length).toEqual(4);
        expect($scope.history.trainingHistory.courses.data[3].subjects[0].TrainingSubjectForMemberSummary.Description).toEqual('ghfhgf');
    });
    
});
