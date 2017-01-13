describe('Unit: Directives:avatar', function() {

    var element, scope, API_BASE_URL, Members, $httpBackend, $timeout;

    beforeEach(function () {
        module('sherpa');
        module('templates');

        inject(function($rootScope, $compile, API_BASE_URL, $injector, _$timeout_) {

            scope = $rootScope.$new(); 
            $timeout = _$timeout_;            
            API_BASE_URL = $injector.get('API_BASE_URL');
            $httpBackend = $injector.get('$httpBackend');
            Members = $injector.get('Members');

            $httpBackend.when('GET', API_BASE_URL + 'members/me').respond(200, {"$id":"1","Member":{"$id":"2","MemberId":190946,"NetworkId":941,"MemberProfile":{"$id":"3","PhotoLarge":"/networkrepository/941/member/190946/profile_large.png","PhotoThumb":"/interfaceSource/test/mockData/static/barstools.jpg","PhotoThumbMini":"/networkrepository/941/member/190946/profile_small.png","RoleId":1034,"AustralianResident":false,"OnlineResume":false,"UploadedResume":false,"MinSalaryId":0,"MaxSalaryId":0,"JobTitle":null,"ResumeViews":0,"CareerObjectives":null,"BirthDay":"2009-01-04T00:00:00","NotificationSubscriptionID":11382,"BaseGroupNotificationSubscriptionID":11383,"PermissionSetId":5148},"MemberLogin":{"$id":"4","LoginName":"admin","LoginCount":2115},"Sex":"f","Active":true,"Deleted":false,"DefaultPermission":0,"IsSystemAccount":true,"NetworkAdmin":true,"FirstName":"Sherpa","Surname":"Admin","DefaultNetworkGroupId":11845},"EntityActions":[],"Status":0,"ResultStatuses":null}); 

            element = angular.element('<avatar img-src="src" size="small"></avatar> '); 
            $compile(element)(scope);
            scope.$digest();
        });
    });

    it('can load the correct fallback image for an individual and a group', function(){

        expect(element.attr('src')).toEqual('/interface/images/default-user.png');

        inject(function($compile) {
            element = angular.element('<avatar img-src="src" size="small" type="group"></avatar> '); 
            $compile(element)(scope);
            scope.$digest();
        });

        expect(element.attr('src')).toEqual('/interface/images/default-group.png');
    });

    it('can pass through an image path to the template and use the correct html', function(){
        
        inject(function($compile) {
            element = angular.element('<avatar img-src="myface.jpg" size="large" current-user="true"></avatar> '); 
            $compile(element)(scope);
            scope.$digest();
        });

        $httpBackend.flush();
        $timeout.flush();

        expect(element.attr('src')).toEqual('/interfaceSource/test/mockData/static/barstools.jpg');
        expect(element.attr('class')).toContain('avatar--large');
        expect(element.attr('alt')).toEqual('Avatar');
    });

});