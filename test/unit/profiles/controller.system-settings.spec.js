// Controller profileSystemSettings
// ----------------------------------------

describe('Unit: Controller:profileSystemSettings', function() {

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
            createController = function() {
                return $controller('profileSystemSettings', {
                    '$scope': $scope
                });
            };
            
            // Get system info for a specific user or the current user
            $httpBackend.when('GET', API_BASE_URL + 'profilemanagement/' + (memberId ? memberId : 'me') + '/systeminfo').respond(200, 
               getJSONFixture('profilemanagement/systeminfo/index.json')
            );

            // Get permissions for a specific user or the current user
            $httpBackend.when('GET', API_BASE_URL + 'profilemanagement/' + (memberId ? memberId : 'me') + '/permissions').respond(200,
                getJSONFixture('profilemanagement/permissions/index.json')
            );
            
            // Get all groups (populates a drop down)
            $httpBackend.when('GET', API_BASE_URL + 'NetworkGroups/othergroups').respond(200,
                getJSONFixture('NetworkGroups/othergroups/index.json')
            );
            // Get all groups (populates a drop down)
            $httpBackend.when('GET', API_BASE_URL + 'NetworkGroups/storegroups').respond(200,
                getJSONFixture('NetworkGroups/storegroups/index.json')
            );

            
            // Expected post for updating system info.  This verifies that data is sent back to the api in a correct format 
            $httpBackend.when('PUT', API_BASE_URL + 'profilemanagement/1234/systeminfo', {AccountRecruitment: 62, AccountRecruitmentEntry: {AccountRecruitmentId: 62, NetworkGroupId: 11660},CustomerPremisesName: 'Restaurants',DefaultNetworkGroupId: 0,DefaultNetworkGroupName: '',IsRoaming: false,MemberId: 247682, OtherNetworkGroups: [11042, 11043],StoreNetworkGroups: [11067, 11071]}).respond(200,
                {success: true, MemberSystemInfo: {}}
            );
            
            // Expected posts for sending permissions back to the server
            $httpBackend.when('PUT', API_BASE_URL + 'profilemanagement/1234/permissioncapabilities/14', { Override: true, PermissionLevel: 4}).respond(200, 
                {success: true}
            );
            $httpBackend.when('PUT', API_BASE_URL + 'profilemanagement/1234/permissioncapabilities/8', { Override: false, PermissionLevel: 0}).respond(200, 
                {success: true}
            );
            
        });
    });
    
    it('can load data from the system info and permissions apis for the current user', function(){

        var controller = createController();
        $location.path('/profile/?tab=system-settings');
        
        $httpBackend.flush();  
        
        memberId = 1234; // Set this for the next test
    });
    
    it('can load data from the system info api (for user 1234) and format it so it plays nicely with the formbuilder', function(){

        var controller = createController();
        $location.path('/profile/' + memberId + '/?tab=system-settings');
        
        $scope.systemInfo.$promise().then(function(res) {

            // It can create an object to look up the recruitment account label by the id
            expect($scope.systemInfo.selectData.AccountRecruitmentObj[83]).toEqual('AutoAccount100620142');

            // It can set permissions
            expect($scope.systemInfo.$userCan.canviewsysteminformation).toEqual(true);

            // It discards all data (basically entity actions) other than the system info
            expect(res.data.EntityActions).toBeUndefined();
            expect(res.data.MemberId).toEqual(247682);

            // It can setup the static values object
            expect($scope.systemInfo.$staticValues.primaryGroup).toEqual('My group');

            // It formats the account recruitment data correctly - discards all expect the id
            expect(res.data.AccountRecruitment).toEqual(62);

            // It can create a group object, which is used to toggle the display of groups in the UI
            expect($scope.systemInfo.groups.groupLimit).toEqual(3);
            expect($scope.systemInfo.groups.storeLimit).toEqual(3);

            $scope.systemInfo.groups.showAllGroups();
            $scope.systemInfo.groups.showAllStores();

            expect($scope.systemInfo.groups.groupLimit).toEqual(7);
            expect($scope.systemInfo.groups.storeLimit).toEqual(6);

            $scope.systemInfo.$storeGroupPromise.then(function(){

                expect($scope.systemInfo.selectData.StoreNetworkGroups[0].label).toEqual('VIC - Company ');
                expect($scope.systemInfo.selectData.StoreNetworkGroups[0].value).toEqual(11042);
            });

            $scope.systemInfo.$otherGroupsPromise.then(function(){

                expect($scope.systemInfo.selectData.OtherNetworkGroups[0].label).toEqual('VIC - Company ');
                expect($scope.systemInfo.selectData.OtherNetworkGroups[0].value).toEqual(11042);
            });

        });

        $httpBackend.flush();
    });
        
    it('can send system info data back to the server and format it correctly to be accepted by the api', function() {
    
        var controller = createController();
        $location.path('/profile/' + memberId + '/?tab=system-settings');
        
        // The test here is to asset that given this set of data, it is maniulated into the correct format for the api.  This is verified by the expected PUT request
        var systemInfoData = {
            AccountRecruitment: 62,
            AccountRecruitments: [{AccountRecruitmentId: 39,Description: 'Grill\'d Recruitment',NetworkGroupId: 11040}, {AccountRecruitmentId: 62, Description: 'AutomationAccount1', NetworkGroupId: 11660}],
            CustomerPremisesName: 'Restaurants',
            DefaultNetworkGroupId: 0,
            DefaultNetworkGroupName: '',
            IsRoaming: false,
            MemberId: 247682,
            OtherNetworkGroups: [{label: 'VIC - Company ',value: 11042}, {label: 'VIC - Franchise Recruitment ', value: 11043}],
            StoreNetworkGroups: [{label: 'Malvern',value: 11067}, {label: 'Chermside', value: 11071}]
        }
    
        $scope.systemInfoSave(systemInfoData);
        $httpBackend.flush();
    });
    
    it('can load data from the permissions api (for user 1234) and reformat/rearrange it so we can use it with the ui/formbuilder', function(){

        var controller = createController();
        $location.path('/profile/1234/?tab=system-settings');
            
        $scope.permissions.$promise().then(function(res){
            
            // Model data is being set correctly and being split into two fields - override and permission level
            expect(Object.keys(res.data).length).toEqual(56);
            expect(res.data.Recruitment_Override).toEqual(true);
            expect(res.data.Recruitment_PermissionLevel).toEqual(4);
            expect(res.data.PurchasingPlatform_Override).toEqual(false);
            expect(res.data.PurchasingPlatform_PermissionLevel).toEqual(0);
            
            // Permissions (the permissions for the permissions page) are set correctly
            expect(Object.keys($scope.permissions.$userCan).length).toEqual(28);
            expect($scope.permissions.$userCan.Dashboard.caneditpermission).toEqual('profilemanagement/247682/permissioncapabilities/8');
            expect($scope.permissions.$userCan.Notifications.caneditpermission).toEqual('profilemanagement/247682/permissioncapabilities/11');
            
            // The names for each permission set are formatted into an array that will be used by the view
            expect(Object.keys($scope.permissions.$permissionNames).length).toEqual(28);
            expect($scope.permissions.$permissionNames.Training.length).toEqual(4);
            expect($scope.permissions.$permissionNames.Training[3]).toEqual('Manage Training Courses');    
            expect($scope.permissions.$permissionNames['Clock-InLaunch'].length).toEqual(2);
            expect($scope.permissions.$permissionNames.Training[1]).toEqual('Participate In Training Courses');
            
            // The capability ids object is created and set correctly.  It's created here so when data is sent back to the server the correct id can be sent
            expect(Object.keys($scope.permissions.$capabilityIds).length).toEqual(28);
            expect($scope.permissions.$capabilityIds.Training).toEqual(9);
            expect($scope.permissions.$capabilityIds.PerformanceAssessments).toEqual(28);
            expect($scope.permissions.$capabilityIds.DesktopNotification).toEqual(7);
        });
        
        $httpBackend.flush();
    });
    
    it('can create an object describing the form builder elements based on the data coming from the api which will be used to create the form builder instance', function(){
        
        var controller = createController();
        $location.path('/profile/1234/?tab=system-settings');
            
        $scope.permissionsFactory.$formDataPromise.then(function(res){
            
            expect(res.length).toEqual(1);
            expect(res[0].id).toEqual('permissionsForm');
            expect(res[0].elements.length).toEqual(28);
            
            // For each permission it can set the name, label and add an array of two children
            expect(res[0].elements[2].label).toEqual('Attach Link');
            expect(res[0].elements[2].name).toEqual('AttachLink');
            expect(res[0].elements[2].children.length).toEqual(2);
            
            // It can set the name, label, type and validation rules correctly for each child element
            expect(res[0].elements[2].children[0].name).toEqual('AttachLink_Override');
            expect(res[0].elements[2].children[1].name).toEqual('AttachLink_PermissionLevel');
            expect(res[0].elements[2].children[0].label).toEqual('Override role default');
            expect(res[0].elements[2].children[1].label).toEqual('Attach Link permission level');
            expect(res[0].elements[2].children[0].type).toEqual('checkbox');
            expect(res[0].elements[2].children[1].type).toEqual('radio');
            expect(res[0].elements[2].children[1].validation).toEqual({required: true});
            
            // It can set the options correctly for each radio element
            expect(res[0].elements[8].children[1].options.length).toEqual(3);
            expect(res[0].elements[8].children[1].options[2].Label).toEqual('Create and edit competitions');
            expect(res[0].elements[8].children[1].options[2].Value).toEqual(2);
        });
        
        $httpBackend.flush();
    });
    
    it('can send permissions data back to the server and correctly format so it is accepted by the api', function(){
        
        var controller = createController();
        $location.path('/profile/1234/?tab=system-settings');
                        
        $scope.permissions.$save({
            element: {
                label:'Training',
                name:'Training',
                children:[
                    {val: true},
                    {val: 4}
                ]
            }, 
            capabilityIds: {
                Training: 14
            }
        });
        
        $httpBackend.flush();
        
        $scope.permissions.$save({
            element: {
                label:'Dashboard',
                name:'Dashboard',
                children:[
                    {val: false},
                    {val: 0}
                ]
            }, 
            capabilityIds: {
                Dashboard: 8
            }
        });
        
        $httpBackend.flush();
    });
    
});
