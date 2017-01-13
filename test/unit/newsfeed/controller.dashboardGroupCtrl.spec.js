// Controller dashboardDirectoryCtrl
// ----------------------------------------

describe('Unit: Controller:dashboardGroupCtrl', function() {

    var $scope, $timeout, groupId = 1234, createController, API_BASE_URL, $httpBackend;

    beforeEach(function () {
        module('sherpa');
        module('templates');

        module(function ($provide) {
            $provide.provider('$routeParams', function () {
                this.$get = function () {
                    return {
                        id: groupId
                    };
                };
            });
        });

        inject(function($rootScope, $controller, _$location_, $injector, _$timeout_) {
            
            $scope = $rootScope.$new();
            $httpBackend = $injector.get('$httpBackend');
            API_BASE_URL = $injector.get('API_BASE_URL');
            $timeout = _$timeout_;

            // For some reason base is needed here.  No idea why, found the answer here:
            // http://stackoverflow.com/questions/17370427/loading-a-mock-json-file-within-karmaangularjs-test
            jasmine.getJSONFixtures().fixturesPath = 'base/interfaceSource/test/mockData/api/';

            createController = function() {
                return $controller('dashboardGroupCtrl', {
                    '$scope': $scope
                });
            };
            
            $httpBackend.when('GET', API_BASE_URL + 'NetworkGroups/groupprofile?id=' + groupId).respond(200, 
                getJSONFixture('NetworkGroups/groupprofile/index.json')
            );
            
            $httpBackend.when('GET', API_BASE_URL + 'profilemanagement/getmembersprofilebygroup?groupid=' + groupId + '&p=1&ps=12&rc=1').respond(function(method, url, data, headers){
                headers['x-pagination'] = '{"TotalCount":10,"TotalPages":1,"PageSize":30,"Page":1}';
                return [200, getJSONFixture('profilemanagement/membersprofilebygroup/index.json'), headers];         
            });           
            
            $httpBackend.when('GET', API_BASE_URL + 'NetworkGroups/membergroups').respond(200, 
                getJSONFixture('NetworkGroups/membergroups/index.json')
            );
        });
    });
    
    it('set\'s some basic variables', function(){
        
        var controller = createController();
                
        expect($scope.groupId).toEqual(1234); 
        expect($scope.groupBio).toEqual(null);
        expect($scope.myGroups).toEqual([]);
        expect($scope.groupLimit).toEqual(4);
    });
    
    it('can load load member data', function(){
        
        var controller = createController();
        
        $httpBackend.flush();
        
        expect($scope.members.count).toEqual(10); // 10 is the number returned in the pagination header
        expect($scope.members.list.length).toEqual(6); // But there are actually 6 records
        expect($scope.members.list[0].MemberId).toEqual('458730');
        expect($scope.members.list[0].RoleDescription).toEqual('Assistant Store Manager');
    });
    
    it('can load data for the groups the currently logged in member belongs to', function(){    
        
        var controller = createController();
        
        $httpBackend.flush();
    
        expect($scope.myGroups.length).toEqual(13);
        expect($scope.myGroups[0].NetworkGroupDetail.NetworkGroupId).toEqual(11042);
        expect($scope.myGroups[0].NetworkGroupDetail.GroupName).toEqual('VIC - Company ');
        
        $scope.showAllGroups();
        
        expect($scope.groupLimit).toEqual(13);
    });
    
    it('can load data about the group', function(){    
        
        var controller = createController();
        
        $httpBackend.flush();
        
        expect($scope.groupBio.GroupId).toEqual(11845);
        expect($scope.groupBio.Address).toEqual('Level 2, 325 Flinders Lane');
        expect($scope.groupBio.Country).toEqual('Australia');
        expect($scope.title).toEqual('All Vacancies | ');
    });
});
