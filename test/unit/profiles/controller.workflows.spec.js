// Controller profileWorkflows
// ----------------------------------------

describe('Unit: Controller:profileWorkflows', function() {

    var $scope, $location, $timeout, createController, $httpBackend, API_BASE_URL,
        memberId = 'me';

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
            API_BASE_URL = $injector.get('API_BASE_URL');
            $timeout = _$timeout_;

            // For some reason base is needed here.  No idea why, found the answer here:
            // http://stackoverflow.com/questions/17370427/loading-a-mock-json-file-within-karmaangularjs-test
            jasmine.getJSONFixtures().fixturesPath = 'base/';

            $scope.profile = { $userCan: {} };
            createController = function() {
                return $controller('profileWorkflows', {
                    '$scope': $scope
                });
            };
            
            // Get system info for a specific user
            $httpBackend.when('GET', API_BASE_URL + 'profilemanagement/' + memberId + '/workflows').respond(200, 
               getJSONFixture('interfaceSource/test/mockData/api/profilemanagement/workflows/index.json')
            );

            $httpBackend.when('GET', '/interface/views/profile/form-data/workflows.json').respond(200, 
               getJSONFixture('interface/views/profile/form-data/workflows.json')
            );
        
        });
    });
    
    it('should set up basic values before the api calls are made and set a loaded flag after they are made', function(){

        var controller = createController();
                
        expect($scope.workflows).toEqual({
            $loaded: false, // We may have more than one workflow
            data: []
        });
        
        $httpBackend.flush();
        
        expect($scope.workflows.$loaded).toEqual(true);
        
        expect($scope.workflows.data.length).toEqual(2);
    });
    
    it('can generate an object with form feilds for each of the workflow forms', function(){
        
        var controller = createController();
        
        // A request is sent for a json template for workflows.  Each individual form is a copy of the template
        $scope.workflowsFactory.$formDataPromise.then(function(res){
            
            expect(res.length).toEqual(2); // Testing that two forms are returned
            expect(res[0].id).toEqual('workflowsForm0');
            
            // Then test the 2nd form to see if it's been formatted appropriately
            expect(res[1].id).toEqual('workflowsForm1');
            expect(res[1].name).toEqual('workflowsForm1');
            expect(res[1].elements.length).toEqual(2);
            expect(res[1].elements[0].type).toEqual('select');
            expect(res[1].elements[1].type).toEqual('form-fields');
            expect(res[1].elements[1].children[0].type).toEqual('date');
            expect(res[1].elements[1].children[1].type).toEqual('date');
        });
        
        $httpBackend.flush();
    });
    
    it('can format the workflow data that comes back from the server into separate forms for each workflow', function(){

        $scope.profile.$userCan.viewonboardworkflow = true;
        var controller = createController();
        $httpBackend.flush();
        
        // Checking that we have formbuilder instances for two workflows
        expect($scope.workflows.data.length).toEqual(2);
                
        $scope.workflows.data[1].$promise().then(function(res){
            
            // Testing the res here
            expect(res.data.StartDate).toEqual('2015-10-29T00:00:00');
            expect(res.data.EndDate).toEqual('2015-10-30T00:00:00');
            expect(res.data.$formIndex).toEqual(1);
        });
        
        $scope.$apply(); // This will trigger the promise        
        
        // Testing data attached to the obj here
        
        // $userCan takes entity actions from the root object and also from each individual workflow.  View actions are in the root and edit actions apply to individual workflows
        expect($scope.workflows.data[1].$userCan.editworkflow).toEqual('api/profilemanagement/247682/workflow');
        expect($scope.workflows.data[1].$userCan.viewworkflows).toEqual('api/profilemanagement/247682/workflow');
        
        expect($scope.workflows.data[1].selectData.TargetMemberId.length).toEqual(37); // There are 19 select box options passed back to the UI
        expect($scope.workflows.data[1].selectData.TargetMemberId[7]).toEqual({Label: 'Myles Roberts', Value: 264562});
        
        // This obj is used to translate vals to labels in the ui
        expect($scope.workflows.data[1].selectData.TargetMemberIdObj[264527]).toEqual('Thomas Truscott');
        
        expect($scope.workflows.data[1].staticValues).toEqual({name: 'Onboarding'})
    });
    
});
