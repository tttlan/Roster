// Controller profileContactDetails
// ----------------------------------------

describe('Unit: Controller:profileContactDetails', function() {

    var $scope, $location, $timeout, $routeParams, $httpBackend, createController, API_BASE_URL, memberId = 1234, $notify;

    beforeEach(function () {
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
            
            // Fake the $notify service
            $provide.value('$notify', {
                list: [],
                add: function(notify){
                    this.list.push(notify);
                }
            });
        });

        inject(function($rootScope, $controller, _$location_, _$timeout_, $injector, _$routeParams_) {
            
            $scope = $rootScope.$new();
            $location = _$location_;
            $timeout = _$timeout_;
            $routeParams = _$routeParams_;
            $httpBackend = $injector.get('$httpBackend');
            $notify = $injector.get('$notify');
            API_BASE_URL = $injector.get('API_BASE_URL');
                        
            // For some reason base is needed here.  No idea why, found the answer here:
            // http://stackoverflow.com/questions/17370427/loading-a-mock-json-file-within-karmaangularjs-test
            jasmine.getJSONFixtures().fixturesPath = 'base/interfaceSource/test/mockData/api/profilemanagement/';

            $scope.profile = { $userCan: {} };
            createController = function() {
                return $controller('profileContactDetails', {
                    '$scope': $scope
                });
            };
            
            // Get member contacts for a specific member or 'me'
            $httpBackend.when('GET', API_BASE_URL + 'profilemanagement/' + (memberId ? memberId : 'me') + '/membercontacts').respond(200, 
                getJSONFixture('membercontacts/index.json')
            );
            
            // Get emergency contact details for a specific member or 'me'
            $httpBackend.when('GET', API_BASE_URL + 'profilemanagement/' + (memberId ? memberId : 'me') + '/emergencycontact').respond(200, 
                getJSONFixture('emergencycontact/index.json')
            );
            
            // Saving an address
            $httpBackend.when('PUT', API_BASE_URL + 'profilemanagement/' + (memberId ? memberId : 'me') + '/addresses/85282').respond(200, {success: true});    
            
            // Saving personal info
            $httpBackend.when('PUT', API_BASE_URL + 'profilemanagement/' + (memberId ? memberId : 'me') + '/personalinfo').respond(200, {'$id':'1','MemberId':180665,'FirstName':'Sherpa','Surname':'Admin','PreferredName':'sherpy','Sex':'m','BirthDay':'1928-05-10T14:00:00Z','ContactDetail':[]}); 
            
            // Saving emergency contact details
            $httpBackend.when('PUT', API_BASE_URL + 'profilemanagement/' + (memberId ? memberId : 'me') + '/emergencycontact').respond(200, {success: true});
            
            // Adding new emails and phones.  Note that the data being sent to the server is being tested here
            $httpBackend.when('POST', API_BASE_URL + 'profilemanagement/' + (memberId ? memberId : 'me') + '/phones', {CanAcceptFax: false, CanAcceptVoiceCall: true, IsPrimary: false, IsPrivate: true, Phone: '123456789', Type: 'p'}).respond(200, 100001);
            $httpBackend.when('POST', API_BASE_URL + 'profilemanagement/' + (memberId ? memberId : 'me') + '/phones', {CanAcceptFax: false, CanAcceptVoiceCall: true, IsPrimary: false, IsPrivate: true, Phone: '123456780', Type: 'p'}).respond(200, 100001)

            $httpBackend.when('POST', API_BASE_URL + 'profilemanagement/' + (memberId ? memberId : 'me') + '/emails', {CanAcceptHtml: true, IsPrimary: false, IsPrivate: true, Email: 'test1@test.com', Type: 'e'}).respond(400, 100002);   
                
            // Deleting emails and phones
            $httpBackend.when('DELETE', API_BASE_URL + 'profilemanagement/247682/membercontact/146211').respond(200, {success: true});  
            
            $httpBackend.when('DELETE', API_BASE_URL + 'profilemanagement/247682/membercontact/146212').respond(200, {success: true});
        });
    });
    
    /*
     *  Contact details (multiple contacts)
     */
     
    it('should be able to retrieve data for multiple email addresses and phone numbers for a specific member', function() {
        
        var controller = createController(); // Member id is set to 1234 at this stage
    
        $location.path('/profile/' + memberId + '/?tab=about');
        expect($location.path()).toBe('/profile/' + memberId + '/?tab=about'); 
        
        $scope.contactDetails.$dataPromise.then(function(res){
            
            expect($scope.contactDetails.data.emails.length).toEqual(2);
            expect($scope.contactDetails.data.phones.length).toEqual(3);
            expect($scope.contactDetails.data.addresses.length).toEqual(1);
            
            expect($scope.contactDetails.data.emails[0]).toEqual({value: 'test3@test.com',isPrimary: true,isPublic: false,Type: 'emails',ContactInfoId: 146205});
            
            expect($scope.contactDetails.data.phones[2]).toEqual({value: '5',isPrimary: false,isMobile: false,isPublic: false,Type: 'phones',ContactInfoId: 146213});
            
            expect($scope.contactDetails.data.addresses[0]).toEqual({Address: 'Something street', Suburb: 'Arapuni, Putaruru',City: '',Postcode: '3415',StateName: null,CountryId: {Value: 153,Label: 'New Zealand'},Type: 'addresses',ContactInfoId: 85282});
            
            expect($scope.contactDetails.emails.cache.length).toEqual(2);
            expect($scope.contactDetails.phones.cache.length).toEqual(3);
            
            expect($scope.contactDetails.$editing).toEqual(false);
            expect($scope.contactDetails.$userCan.caneditcontact).toEqual(true);
            expect($scope.contactDetails.MemberId).toEqual(247682);
        });
        
        $httpBackend.flush(); 
        
        memberId = ''; // Set this for the next test
    });
    
    it('should be able to retrieve data for multiple email addresses and phone numbers for the current member', function() {
        
        var controller = createController();

        $location.path('/profile?tab=about');
        expect($location.path()).toBe('/profile?tab=about'); 
        
        $scope.contactDetails.$dataPromise.then(function(res){
            
            expect($scope.contactDetails.data.emails.length).toEqual(2);
        });
        
        $httpBackend.flush(); 
        
        memberId = 1234; // Set this for the next test
    });
    
    it('can toggle the edit ...toggle', function() {
        
        var controller = createController();
        $httpBackend.flush(); 
        
        $scope.contactDetails.$edit('testSection');
        
        expect($scope.contactDetails.$editing).toEqual('testSection');
    });
    
    it('can toggle the edit ...toggle', function() {
        
        var controller = createController();
        $httpBackend.flush(); 
        
        $scope.contactDetails.$edit('testSection');
        
        expect($scope.contactDetails.data.phones[0].value).toEqual('2'); // Test the original number
        expect($scope.contactDetails.data.phones[0].isPublic).toEqual(true);
        
        $scope.contactDetails.data.phones[0].value = '123456789'; // Change the phone number
        $scope.contactDetails.data.phones[0].isPublic = false; // And the public flag
        
        $scope.contactDetails.$cancel('phones'); // Then cancel the edit
        
        expect($scope.contactDetails.$editing).toEqual(false); // Check that this flag is reset
        expect($scope.contactDetails.data.phones[0].value).toEqual('2'); // And that the phone number has reverted
        expect($scope.contactDetails.data.phones[0].isPublic).toEqual(true);
    });
    
    it('can remove a phone number that has already been stored on the server', function() {
        
        var controller = createController();
        $httpBackend.flush(); 
        
        expect($scope.contactDetails.data.phones.length).toEqual(3);
        expect($scope.contactDetails.phones.cache.length).toEqual(3);
                
        $scope.contactDetails.$remove($scope.contactDetails.data.phones, 1);
        expect($scope.contactDetails.phones.$submitting).toEqual(true);
            
        $httpBackend.flush();
        
        expect($scope.contactDetails.phones.$submitting).toEqual(false);
        expect($scope.contactDetails.data.phones.length).toEqual(2);
        expect($scope.contactDetails.phones.cache.length).toEqual(2);
    });
    
    it('can remove an email address that has already been stored on the server', function() {
        
        var controller = createController();
        $httpBackend.flush(); 
        
        expect($scope.contactDetails.data.emails.length).toEqual(2);
        expect($scope.contactDetails.emails.cache.length).toEqual(2);
                
        $scope.contactDetails.$remove($scope.contactDetails.data.emails, 1);
        expect($scope.contactDetails.emails.$submitting).toEqual(true);
            
        $httpBackend.flush();
        
        expect($scope.contactDetails.emails.$submitting).toEqual(false);
        expect($scope.contactDetails.data.emails.length).toEqual(1);
        expect($scope.contactDetails.emails.cache.length).toEqual(1);
    });
    
    it('can remove a phone number or email address that only exists in memory', function() {
        
        var controller = createController();
        $httpBackend.flush();
        
        expect($scope.contactDetails.data.phones.length).toEqual(3); // We have three phone numbers
        expect($scope.contactDetails.data.emails.length).toEqual(2); // We have two email addresses
        $scope.contactDetails.data.phones.push({value: '123456789',isPrimary: false,isPublic: false});
        $scope.contactDetails.data.emails.push({value: 'test@test.com',isPrimary: false,isPublic: false});
        
        expect($scope.contactDetails.data.phones.length).toEqual(4); // Now we have four
        expect($scope.contactDetails.data.emails.length).toEqual(3); // Now we have three
        
        $scope.contactDetails.$remove($scope.contactDetails.data.phones, 3); // Remove the newly added phone number
        $scope.contactDetails.$remove($scope.contactDetails.data.emails, 2); // Remove the newly added email address
        
        expect($scope.contactDetails.data.phones.length).toEqual(3); // Back to three
        expect($scope.contactDetails.data.emails.length).toEqual(2); // Back to four
    });
    
    it('knows that when saving emails or phone numbers, if there are no changes, we should not send data to the server', function() {
        
        var controller = createController();
        $httpBackend.flush();
        
        $scope.contactDetails.$save('phones');
        $scope.$digest();
        $httpBackend.verifyNoOutstandingRequest();
        
        $scope.contactDetails.$save('emails');
        $scope.$digest();
        $httpBackend.verifyNoOutstandingRequest();
    });
    
    it('can send a request for a changed email address or phone number', function() {
        
        var controller = createController();
        $httpBackend.flush();
        
        $scope.contactDetails.data.phones.push({value: '123456789',isPrimary: false,isPublic: false});
        $scope.contactDetails.data.phones.push({value: '123456780',isPrimary: false,isPublic: false});
        $scope.contactDetails.$save('phones');        
        expect($scope.contactDetails.phones.$submitting).toEqual(true);
        
        $httpBackend.flush();
        
        expect($scope.contactDetails.phones.$submitting).toEqual(false);
        expect($scope.contactDetails.data.phones[3].ContactInfoId).toEqual(100001);
        expect($scope.contactDetails.data.phones[4].ContactInfoId).toEqual(100001);
        
        // Testing that the cache is updated after the post
        expect($scope.contactDetails.data.phones).toEqual($scope.contactDetails.phones.cache);
    
        // Make sure the $notify service has sent up our custom message 
        expect($notify.list.length).toBe(1);
        expect($notify.list[0].type).toBe('success');
    });
    
    it('can handle an error coming back from the server appropriately', function() {
        
        var controller = createController();
        $httpBackend.flush();
        
        $scope.contactDetails.data.emails.push({value: 'test1@test.com',isPrimary: false,isPublic: false});
        $scope.contactDetails.$save('emails');        
        expect($scope.contactDetails.emails.$submitting).toEqual(true);
        
        $httpBackend.flush();
        
        expect($scope.contactDetails.phones.$submitting).toEqual(false);
    
        // Make sure the $notify service has sent up our custom message 
        expect($notify.list.length).toBe(2);
        expect($notify.list[0].type).toBe('error');
    });
    
    /*
     *  Member address
     */

    it('should be able to retrieve address data from the profile service correctly for a specific member', function() {
        
        var controller = createController();  

        $location.path('/profile/' + memberId + '/?tab=about');
        expect($location.path()).toBe('/profile/' + memberId + '/?tab=about');   

        expect($scope.memberAddress.dict.saveAction).toEqual('updateMemberContact'); // Test that the form builder was instantiated and has the correct service defined

        $scope.memberAddress.$promise().then(function(res){

            expect(res.data.Address).toEqual('Something street');
            expect(res.data.Suburb).toEqual('Arapuni, Putaruru');
            expect(res.data.Postcode).toEqual('3415');
            expect(res.data.Type).toEqual('addresses');
            expect(res.data.MemberContact).toBeUndefined();
            expect($scope.memberAddress.$userCan.caneditcontact).toEqual(true);
        });
        
        $httpBackend.flush(); 
    });

    it('should be able to retrieve address data from the profile service correctly for the current member', function() {
        
        var controller = createController();  
    
        $location.path('/profile/?tab=about');
        expect($location.path()).toBe('/profile/?tab=about');
    
        $scope.memberAddress.$promise().then(function(res){
            expect(res.data.Address).toEqual('Something street');
        });
    
        $httpBackend.flush();
    });
    
    it('should be able to send address information back to the server', function() {
        
        var controller = createController();    
    
        $location.path('/profile/' + memberId + '?tab=about');
        expect($location.path()).toBe('/profile/' + memberId + '?tab=about');
    
        var data = {Address: '324 Flinders Lane',City: '',ContactInfoId: 85282,CountryId: {Value: 13, Label: 'Australia'},Postcode: '3000',StateName: 'VIC',Suburb: 'MELBOURNE',Type: 'addresses'};
    
        $scope.memberAddressSave(data).then(function(res){
            expect(res.data.success).toEqual(true);
            expect($scope.memberAddress.$editing).toEqual(false);
        });
    
        $httpBackend.flush(); // Flush requests and timeouts
        $timeout.flush();
    });


    /*
     *  Personal information
     */

    it('should be able to retrieve personal information data from the profile service correctly for a specific member', function() {
        
        var controller = createController();  

        $location.path('/profile/' + memberId + '/?tab=about');
        expect($location.path()).toBe('/profile/' + memberId + '/?tab=about');   

        expect($scope.personalInformation.dict.saveAction).toEqual('updatePersonalInfo'); // Test that the form builder was instantiated and has the correct service defined

        $scope.personalInformation.$promise().then(function(res){
            expect(res.data.MemberId).toEqual(247682);
            expect(res.data.PreferredName).toEqual('SherpyAdmin!');
            expect(res.data.EntityActions).toBeUndefined();
            expect($scope.personalInformation.$userCan.canviewcontact).toEqual(true);
        });
        
        $httpBackend.flush(); 
    });

    it('should be able to retrieve personal information data from the profile service correctly for the current member', function() {
        
        var controller = createController();  
    
        $location.path('/profile/?tab=about');
        expect($location.path()).toBe('/profile/?tab=about');
    
        $scope.personalInformation.$promise().then(function(res){
            expect(res.data.MemberId).toEqual(247682);
            expect(res.data.PreferredName).toEqual('SherpyAdmin!');
        });
    
        $httpBackend.flush();
    });
    
    it('should be able to send personal information back to the server', function() {
        
        var controller = createController();
    
        $location.path('/profile/' + memberId + '?tab=about');
        expect($location.path()).toBe('/profile/' + memberId + '?tab=about');
    
        var data = {'$id':'1','MemberId':180665,'FirstName':'Sherpa','Surname':'Admin','PreferredName':'sherpy','Sex':'m','BirthDay':'1928-05-10T14:00:00Z','ContactDetail':[]}
    
        $scope.personalInfoSave(data).then(function(res){
    
            expect(res.data.MemberId).toEqual(180665);
            expect(res.data.PreferredName).toEqual('sherpy');
            expect(res.data.Sex).toEqual('m');
            expect($scope.personalInformation.$editing).toEqual(false);
        });
    
        $httpBackend.flush(); // Flush requests and timeouts
        $timeout.flush();
    });
    
    /*
     *  GET emergency contact details
     */
    
    it('should be able to retrieve emergency contact data from the profile service correctly for a specificmember', function() {        
        
        var controller = createController();
    
        $location.path('/profile/1234/?tab=about');
        expect($location.path()).toBe('/profile/1234/?tab=about');
        
        expect($scope.emergencyContactInformation.dict.saveAction).toEqual('updateEmergencyContact'); // Test that the form builder was instantiated and has the correct service defined
        
        $scope.emergencyContactInformation.$promise().then(function(res){
            expect(res.data.LinePhone1).toEqual('0396588547');
            expect(res.data.Address).toEqual('barkly street');
            expect(res.data.EntityActions).toBeUndefined();
            expect($scope.emergencyContactInformation.$userCan.canviewprofileemergencycontact).toEqual(true);
        });
        
        $httpBackend.flush();
    });
    
    it('should be able to retrieve emergency contact data from the profile service correctly for the current member', function() {
        
        var controller = createController();  
    
        $location.path('/profile/?tab=about');
        expect($location.path()).toBe('/profile/?tab=about');
        
        $scope.emergencyContactInformation.$promise().then(function(res){
            expect(res.data.LinePhone1).toEqual('0396588547');
            expect(res.data.Address).toEqual('barkly street');
        });
    
        $httpBackend.flush();
    });
            
    it('should be able to send emergency contact information back to the server', function() {
        
        var controller = createController();
    
        $location.path('/profile/1234?tab=about');
        expect($location.path()).toBe('/profile/1234?tab=about');
    
        var data = {'$id':'1','FirstName':'Someone','SurName':'S','Relationship':'sp','ContactInfo':{'$id':'2','Address':'11 Flinders Lane','City':'','Suburb':'MELBOURNE','Postcode':'3000','LinePhone1':'0410222222','LinePhone2':null,'MobilePhone':'0410222222','Fax':'','Email':'b@f.com','WebAddress':'','StateName':'VIC','StateRegionId':null,'CountryId':13}}
    
        $scope.emergencyContactInfoSave(data).then(function(res){
            expect(res.data.success).toEqual(true);
            expect($scope.emergencyContactInformation.$editing).toEqual(false);
        });
    
        $httpBackend.flush(); // Flush requests and timeouts
        $timeout.flush();
    });

});
