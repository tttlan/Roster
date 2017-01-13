// Controller profilePayroll
// ----------------------------------------

describe('Unit: Controller:profileBanking', function() {

    var $scope, $location, createController, $httpBackend, Profile, API_BASE_URL;

    beforeEach(function () {
        module('sherpa');
        module('templates');

        inject(function($rootScope, $controller, _$location_, $injector) {
            
            $scope = $rootScope.$new();
            $location = _$location_;
            $httpBackend = $injector.get('$httpBackend');
            Profile = $injector.get('Profile');
            API_BASE_URL = $injector.get('API_BASE_URL');

            // For some reason base is needed here.  No idea why, found the answer here:
            // http://stackoverflow.com/questions/17370427/loading-a-mock-json-file-within-karmaangularjs-test
            jasmine.getJSONFixtures().fixturesPath = 'base/interfaceSource/test/mockData/api/profilemanagement/';

            $scope.profile = { $userCan: {} };
            createController = function() {
                return $controller('profileBanking', {
                    '$scope': $scope
                });
            };

            $httpBackend.when('POST', API_BASE_URL + 'profilemanagement/memberbankdetail', {
                MemberId: 1234, 
                LoginName: 'name',
                Password: 'password'                
            }).respond(200, 
                getJSONFixture('getmemberbankdetail/index.json')
            );
            
            $httpBackend.when('POST', API_BASE_URL + 'profilemanagement/memberbankdetail', {
                MemberId: 4321, 
                LoginName: 'name',
                Password: 'password', 
                BankingPassword: 'bankpassword'
            }).respond(200, 
                getJSONFixture('getmemberbankdetail/index.json')
            );

            $httpBackend.when('PUT', API_BASE_URL + 'profilemanagement/updateMemberBankDetail').respond(200, {Status: 0});            
        });
    });


    it('should be able to retrieve banking information for the current member', function() {
        
        var controller = createController();  

        $location.path('/profile/?tab=employment-details');
        expect($location.path()).toBe('/profile/?tab=employment-details');

        expect($scope.banking.$ownProfile).toEqual(true);

        $scope.profile = {}
        $scope.profile.MemberId = 1234; // Set a member id as this value is needed to make a banking request

        $scope.accessBankingInformationSave({
            Password: 'password',
            LoginName: 'name'
        }).then(function(res){
            expect(res.data.BankingID).toEqual(1364);
            expect(res.data.SuperFund).toEqual('MLC');
        });
        
        $httpBackend.flush();
        $scope.$apply();
    });
    
    it('should be able to retrieve banking information for a member other than the current member', function() {
        
        var controller = createController();  
    
        $location.path('/profile/1234/?tab=employment-details');
        expect($location.path()).toBe('/profile/1234/?tab=employment-details');
    
        expect($scope.banking.$ownProfile).toEqual(true);
    
        $scope.profile = {  // Set a member id as this value is needed to make a banking request
            MemberId: 4321
        }
    
        $scope.accessBankingInformationSave({
            LoginName: 'name',
            Password: 'password',
            BankingPassword: 'bankpassword'
        }).then(function(res){
            expect(res.data.AccountNo).toEqual('521351351');
            expect(res.data.SuperNo).toEqual('859647512');
        });
        
        $httpBackend.flush();
        $scope.$apply();
    });

    it('should be able to update banking information', function() {
        
        var controller = createController();

        $scope.banking.$authenticated = true;
        $location.path('/profile/?tab=employment-details');
        expect($location.path()).toBe('/profile/?tab=employment-details');
        
        var data = {"BankingID":1364,"AccountName":"Mr Peter Scarfington","BSB":"351351","AccountNo":"521351351","SuperFund":"MLC","SuperNo":"859647512","BankName":"Commonwealth Bank of Australia","TaxFileNumber":"888555444"}

        $scope.bankingInformationSave(data).then(function(res){
            expect(res.data.Status).toEqual(0);
            expect(res.status).toEqual(200);
        });
    
        $httpBackend.flush();    
        $scope.$apply();       
    });

});
