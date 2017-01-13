describe('Unit: Factories: memberAcceptanceProfile', function(){
    var memberAcceptanceProfileFactory, $q, $server, mockDataService, $rootScope, $notify, mockServer;
    
    beforeEach(function () {
        module('sherpa');
        module('test.services');
        
        mockServer = jasmine.createSpyObj('$server', ['get', 'create', 'update']);

        module(function ($provide) {
            $provide.value('$server', mockServer);
        })

        inject(function ($injector, _$rootScope_, _$q_, _mockDataService_, _$notify_) {
            $rootScope = _$rootScope_;
            $q = _$q_;
            mockDataService = _mockDataService_;
            $notify = _$notify_;
            
            memberAcceptanceProfileFactory = $injector.get('memberAcceptanceProfile');
            
            mockServer.update.and.returnValue(
                mockDataService.get('api/recruit/update_emergency_contact.json')
            );
        });
    });   
    
    it('should update emergency info contact with full data successfully', function() {
        var obj = {
            "FirstName": "sample string 1",
            "SurName": "sample string 2",
            "Relationship": "sample string 3",
            "Address": "sample string 4",
            "Address2": "sample string 5",
            "City": "sample string 6",
            "Suburb": "sample string 7",
            "Postcode": "sample string 8",
            "LinePhone1": "sample string 9",
            "LinePhone2": "sample string 10",
            "MobilePhone": "sample string 11",
            "Fax": "sample string 12",
            "Email": "sample string 13",
            "WebAddress": "sample string 14",
            "StateName": "sample string 15",
            "StateRegionId": 1,
            "CountryId": 1,
            "CanAcceptSms": true,
            "CanAcceptVoiceCall": true,
            "CanAcceptFax": true,
            "CanAcceptHtml": true
        }
                
          memberAcceptanceProfileFactory.updateEmergencyContact(obj).then(function(rs){
              expect(mockServer.update).toHaveBeenCalled();
              expect(rs.Data).toEqual(7122);
              expect(rs.Status).toEqual(0);
              
              $notify.add({message: 'The emergency contact have been updated', type: 'success', visible: true});
              expect($notify.get()).toEqual({
                  message: 'The emergency contact have been updated', 
                  type: 'success',
                  visible: true
              });
          });
          
          $rootScope.$digest();
    });
});