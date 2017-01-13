describe('Unit: Factories: Onboarding', function(){
    var OnboardingFactory, $q, $server, OnboardingConstants, mockDataService, mockOnboarding, $notify;
    var mockRouteParams, notificationObj, Permissions, $rootScope;
    
    function formatBulkOnboardById(res){
        res = res.data || res.data.Data;
        
        var BulkOnboardingDetail = res.BulkOnboardingDetail;
        var Onboardings = BulkOnboardingDetail.Onboardings;
        var ProposedRole = BulkOnboardingDetail.ProposedRole;
        
        // Format data for commonOnboard
        BulkOnboardingDetail.EffectiveDate = BulkOnboardingDetail.CommencementDate;
        BulkOnboardingDetail.OnboardRole = ProposedRole.OnboardRole;
        BulkOnboardingDetail.OnboardStore = ProposedRole.OnboardStore;
        BulkOnboardingDetail.SalaryType = ProposedRole.SalaryType;
        BulkOnboardingDetail.EmploymentType = ProposedRole.EmploymentType;
        BulkOnboardingDetail.EmploymentClassification = ProposedRole.EmploymentClassification;
        BulkOnboardingDetail.Payroll = ProposedRole.Payroll;
        BulkOnboardingDetail.SalaryPayRate = ProposedRole.SalaryPayRate;
        
        res.Onboardings = Onboardings;

        angular.forEach(res.Onboardings, function (oboarding, index) {
            oboarding.Status = BulkOnboardingDetail.Status;
            oboarding.OnboardRole = ProposedRole.OnboardRole;
            oboarding.OnboardStore = ProposedRole.OnboardStore;
            oboarding.SalaryType = ProposedRole.SalaryType;
            oboarding.EmploymentType = ProposedRole.EmploymentType;
            oboarding.PayRate = ProposedRole.SalaryType;
            oboarding.PayRate.SalaryPayRateId = oboarding.CandidatePersonalInfo.MemberId;
            oboarding.EffectiveDate = oboarding.CommencementDate;
            
            oboarding.HoursPerWeek = BulkOnboardingDetail.HoursPerWeek;
            
            if (index === 0) {
                oboarding.OutboundDocuments = BulkOnboardingDetail.OutboundDocuments;
            }
        });

        return res;
    }
    
    beforeEach(function () {
        module('sherpa');
        module('test.services');

        mockOnboarding = jasmine.createSpyObj('Onboarding', [
            'all', 
            'create', 
            'update', 
            "get",
            "remove", 
            "getOnboards",
            "getBulkOnboards",
            "getOnboard",
            "getBulkOnboardById",
            "createOnboardForNewMember",
            "createBulkOnboard",
            "updateBulkOnboardAfterUploadCsv",
            "isOnboardPhaseUndefined",
            "progressOnboard",
            "updateOnboard",
            "rollbackOnboard",
            "rejectOnboard",
            "deleteOnboard",
            "getOnboardingSettings",
            "updateSingleCandidateInfo",
            "updatePersonalInfo",
            "updateContacts"
        ]);
        
        Permissions = jasmine.createSpyObj('Permissions', [
            'formatPermissions'
        ]);
        
        mockRouteParams = { 
            onboardId: 7628,
            bulkId: '9464b031-0b5d-4d4a-91aa-806f0deeccef'
        }
        
        notificationObj = {
            createSingleOnboard: 'The onboard has been created',
            createBulkOnboard: 'The bulk onboard has been created',
            createAndApproveOnboardWithStatusNew: 'The onboard for has been created and sent for approval',
            createAndApproveOnboardWithStatusApprove: 'The onboard for has been created and sent for document',
        }
        
        module(function ($provide) {
            $provide.value('Onboarding', mockOnboarding);
            $provide.value('$routeParams', mockRouteParams);
        })

        inject(function ($injector, _$rootScope_, _$q_, _mockDataService_, _$notify_) {
            $rootScope = _$rootScope_;
            $q = _$q_;
            mockDataService = _mockDataService_;
            $notify = _$notify_;
            
            OnboardingFactory = $injector.get('Onboarding');
            $server = $injector.get('$server');
            OnboardingConstants = $injector.get('OnboardingConstants');
            Permissions = $injector.get('Permissions');
            
            mockOnboarding.getOnboards.and.returnValue(
                mockDataService.get('api/recruit/single_list.json')
            );
            mockOnboarding.getBulkOnboards.and.returnValue(
                mockDataService.get('api/recruit/bulk_list.json')
            );
            mockOnboarding.getOnboard.and.returnValue(
                mockDataService.get('api/recruit/single_by_id.json')
            );
            mockOnboarding.getBulkOnboardById.and.returnValue(
                mockDataService.get('api/recruit/bulk_by_id.json')
            );
            mockOnboarding.createOnboardForNewMember.and.returnValue(
                mockDataService.get('api/recruit/create_onboard_new_member.json')
            );
            mockOnboarding.createBulkOnboard.and.returnValue(
                mockDataService.get('api/recruit/create_bulk_onboard.json')
            );
            mockOnboarding.updateBulkOnboardAfterUploadCsv.and.returnValue(
                mockDataService.get('api/recruit/update_bulk_after_upload_csv.json')
            );
            mockOnboarding.progressOnboard.and.returnValue(
                mockDataService.get('api/recruit/success.json')
            );
            mockOnboarding.updateOnboard.and.returnValue(
                mockDataService.get('api/recruit/success.json')
            );
            mockOnboarding.rollbackOnboard.and.returnValue(
                mockDataService.get('api/recruit/success.json')
            );
            mockOnboarding.rejectOnboard.and.returnValue(
                mockDataService.get('api/recruit/success.json')
            );
            mockOnboarding.deleteOnboard.and.returnValue(
                mockDataService.get('api/recruit/success.json')
            );
            mockOnboarding.getOnboardingSettings.and.returnValue(
                mockDataService.get('api/recruit/onboard_setting.json')
            );
            mockOnboarding.updateSingleCandidateInfo.and.returnValue(
                mockDataService.get('api/recruit/success.json')
            );
            mockOnboarding.updatePersonalInfo.and.returnValue(
                mockDataService.get('api/recruit/success.json')
            );
            mockOnboarding.updateContacts.and.returnValue(
                mockDataService.get('api/recruit/success.json')
            );
        });
    });   
    
    it('should get right list single onboard', function(){
        OnboardingFactory.getOnboards().then(function(rs){
            expect(rs.hasOwnProperty('OnboardingSummaryItemResults')).toBe(true);
            expect(rs.OnboardingSummaryItemResults.length).toEqual(15);
            expect(rs.hasOwnProperty('EntityActions')).toBe(true);
            
            expect(rs.OnboardingSummaryItemResults[0].hasOwnProperty('OnboardingSummary')).toBe(true);            
        });
        
        $rootScope.$digest();
    });
    
    it('should get right list bulk onboard', function(){
        OnboardingFactory.getBulkOnboards().then(function(rs){
            expect(rs.hasOwnProperty('BulkOnboardingSummaryItemResult')).toBe(true);
            expect(rs.BulkOnboardingSummaryItemResult.length).toEqual(15);
            expect(rs.hasOwnProperty('EntityActions')).toBe(true);
            
            expect(rs.BulkOnboardingSummaryItemResult[0].hasOwnProperty('BulkOnboardingSummary')).toBe(true);   
            expect(mockOnboarding.getBulkOnboards, 'formatResponsePayload').toHaveBeenCalled();
        });     
        
        $rootScope.$digest();   
    });
    
    it('should get right single onboard details by id', function(){
        OnboardingFactory.getOnboard(mockRouteParams.onboardId).then(function(rs){
            expect(rs.hasOwnProperty('Onboarding')).toBe(true);
            expect(rs.Onboarding.OnboardId).toEqual(7628);
            
            expect(rs.Onboarding.hasOwnProperty('OnboardRole')).toBe(true);
            expect(rs.Onboarding.OnboardRole.hasOwnProperty('RoleId')).toBe(true);
            expect(rs.Onboarding.OnboardRole.RoleId).toEqual(738);
            
            expect(rs.Onboarding.hasOwnProperty('OnboardStore')).toBe(true);
            expect(rs.Onboarding.OnboardStore.hasOwnProperty('NetworkGroupId')).toBe(true);
            expect(rs.Onboarding.OnboardStore.NetworkGroupId).toEqual(11038);
            
            expect(rs.Onboarding.hasOwnProperty('SalaryType')).toBe(true);
            expect(rs.Onboarding.SalaryType.hasOwnProperty('SalaryTypeId')).toBe(true);
            expect(rs.Onboarding.SalaryType.SalaryTypeId).toEqual(1);
            
            expect(rs.Onboarding.hasOwnProperty('SalaryPayRate')).toBe(true);
            expect(rs.Onboarding.SalaryPayRate.hasOwnProperty('SalaryPayRateId')).toBe(true);
            expect(rs.Onboarding.SalaryPayRate.SalaryPayRateId).toEqual(null);
            
            expect(rs.Onboarding.hasOwnProperty('EmploymentType')).toBe(true);
            expect(rs.Onboarding.EmploymentType.hasOwnProperty('EmploymentTypeId')).toBe(true);
            expect(rs.Onboarding.EmploymentType.EmploymentTypeId).toEqual(22);
            
            expect(rs.Onboarding.hasOwnProperty('Option')).toBe(true);
            
            expect(rs.Onboarding.hasOwnProperty('CandidatePersonalInfo')).toBe(true);
            
            expect(rs.Onboarding.hasOwnProperty('EffectiveDate')).toBe(true);
            expect(rs.Onboarding.EffectiveDate).toEqual("2016-04-21T17:00:00");
            
            expect(rs.Onboarding.hasOwnProperty('CandidateContacts')).toBe(true);
            expect(rs.Onboarding.CandidateContacts.length).toEqual(3);
            
            expect(rs.Onboarding.hasOwnProperty('SourceDetail')).toBe(true);
            expect(rs.Onboarding.SourceDetail.hasOwnProperty('Source')).toBe(true);
             expect(rs.Onboarding.SourceDetail.Source).toEqual("w");
             
            expect(rs.Onboarding.hasOwnProperty('OutboundDocuments')).toBe(true);
            expect(rs.Onboarding.OutboundDocuments.hasOwnProperty('OnboardDocumentItemResults')).toBe(true);
            expect(rs.Onboarding.OutboundDocuments.OnboardDocumentItemResults).toEqual([]);
             
            expect(rs.Onboarding.hasOwnProperty('InboundRequirementListResult')).toBe(true);
            expect(rs.Onboarding.InboundRequirementListResult.hasOwnProperty('OnboardDocumentItemResults')).toBe(true);
            expect(rs.Onboarding.InboundRequirementListResult.OnboardDocumentItemResults).toEqual([]);
            
            expect(rs.Onboarding.hasOwnProperty('RegisterKey')).toBe(true);
            expect(rs.Onboarding.RegisterKey.hasOwnProperty('IsStoreKeyRequired')).toBe(true);
            expect(rs.Onboarding.RegisterKey.hasOwnProperty('IsAlarmCodeRequired')).toBe(true);
            expect(rs.Onboarding.RegisterKey.hasOwnProperty('IsTabletRequired')).toBe(true);
            
            expect(rs.Onboarding.hasOwnProperty('Creator')).toBe(true);
            
            expect(rs.Onboarding.hasOwnProperty('HoursPerWeek')).toBe(true);
            expect(rs.Onboarding.HoursPerWeek).toEqual(3);           
        });
        
        $rootScope.$digest();
    });
    
    it('should get right bulk onboard details by id', function(){
        mockOnboarding.getBulkOnboardById(mockRouteParams.bulkId).then(function(rs){
            expect(rs.hasOwnProperty('BulkOnboardingDetail')).toBe(true);
            expect(rs.BulkOnboardingDetail.BulkOnboardingId).toEqual('9464b031-0b5d-4d4a-91aa-806f0deeccef');
            expect(rs.BulkOnboardingDetail.hasOwnProperty('Onboardings')).toBe(true);
            expect(rs.BulkOnboardingDetail.Onboardings.length).toEqual(1);
            
            expect(rs.BulkOnboardingDetail.hasOwnProperty('ProposedRole')).toBe(true);
            expect(mockOnboarding.getBulkOnboardById, 'formatBulkOnboardById').toHaveBeenCalled();
        });
        
        $rootScope.$digest();
    });
    
    it('should return data correctly when create new member onboard with full data', function(){
        var obj = {
            "inboundDocument":null,
            "address":
            {
                "Address":"gfdgdfg",
                "Postcode":"7",
                "Suburb":"ABBOTSHAM",
                "StateName":"TAS",
                "CountryId":13
            },
            "phones":
            [
                {
                    "value":"546565",
                    "isPrimary":true,
                    "isPublic":false
                }
                ],
                "emails":
                [
                    {"value":"fdgf@gfhhgf.com",
                    "isPrimary":true,
                    "isPublic":false
                }
                ],
                "referringMemberId":null,
                "salutation":
                {
                    "$id":"2",
                    "Id":2,
                    "Name":"Ms"
                },
                "storeGroup":null,
                "role":null,
                "salaryType":null,
                "employmentType":null,
                "payRate":null,
                "registerKey":null,
                "outboundDocuments":[],
                "referencedocuments":
                [
                    {
                        "OnboardDocumentRecord":
                        {
                            "FileExt":"txt",
                            "FileName":"capture.png",
                            "LibraryDocumentId":162516
                        }
                    }
                ],
                "isSubmitting":true,
                "Status":"",
                "state":
                {
                    "showInboundDocumentInputFields":false,
                    "showOutboundDocumentInputFields":false,
                    "isCollapsedCandidateDetails":false,
                    "isCollapsedProposedRole":false,
                    "isCollapsedSourcingInformation":false,
                    "isCollapsedPayrollDetails":false,
                    "isCollapsedManagerApproval":false,
                    "isCollapsedSaveOptions":false,
                    "isCollapsedDetails":false,
                    "isEditable":false,
                    "isMenuBulkRemoveCandidateActive":false,
                    "isResendDocRequired":false,
                    "isCollapsedDocumentCandidate":false
                },
                "RegisterKey":
                {
                    "IsStoreKeyRequired":false,
                    "IsAlarmCodeRequired":false,
                    "IsTabletRequired":false
                },
                "CandidatePersonalInfo":
                {
                    "Salutation":2,
                    "FirstName":"vvv",
                    "Surname":"vv",
                    "BirthDay":"2016-04-12T17:00:00.000Z",
                    "Sex":"m",
                    "PreferredName":"gfdgfd"
                },
                "CandidateContacts":
                [
                    {
                        "Address":"gfdgdfg",
                        "Postcode":"7",
                        "Suburb":"ABBOTSHAM",
                        "StateName":"TAS",
                        "CountryId":13,
                        "Type":"ad"
                    },
                    {
                        "isPrimary":true,
                        "isPublic":false,
                        "Phone":"546565",
                        "Type":"p"
                    },
                    {
                        "isPrimary":true,
                        "isPublic":false,
                        "Email":"fdgf@gfhhgf.com",
                        "Type":"e"
                    }
                ],
                "SourceDetail":
                {
                       "IsReferenceChecked":true,
                       "Source":"w"
                    },
                    "OnboardRole":
                    {
                        "RoleId":775
                    },
                    "OnboardStore":
                    {
                        "NetworkGroupId":11038
                    },
                    "SalaryType":
                    {
                        "SalaryTypeId":1
                    },
                    "HoursPerWeek":3,
                    "EmploymentType":
                    {
                        "EmploymentTypeId":21
                    },
                    "CommencementDate":"2016-04-13T17:00:00.000Z"
          }
                
          mockOnboarding.createOnboardForNewMember(obj).then(function(rs){
              expect(rs.Data).toEqual(7629);
              expect(rs.Status).toEqual(0);
              
              $notify.add({message: notificationObj.createSingleOnboard, type: 'success', visible: true});
              
              expect($notify.get()).toEqual({
                message: notificationObj.createSingleOnboard,
                type: 'success',
                visible: true
            });
          });
          
          $rootScope.$digest();
    });
    
    it('should return data correctly when create new member onboard with empty EmploymentType and empty BirthDay and empty Address', function(){
        var obj = {
            "inboundDocument":null,
            "address":null,
            "phones":
            [
                {
                    "value":"546565",
                    "isPrimary":true,
                    "isPublic":false
                }
                ],
                "emails":
                [
                    {
                        "value":"fdgf@gfhhgf.com",
                        "isPrimary":true,
                        "isPublic":false
                    }
                ],
                "referringMemberId":null,
                "salutation":
                {
                    "$id":"2",
                    "Id":2,
                    "Name":"Ms"
                },
                "storeGroup":null,
                "role":null,
                "salaryType":null,
                "employmentType":null,
                "payRate":null,
                "registerKey":null,
                "outboundDocuments":[],
                "referencedocuments":
                [
                    {
                        "OnboardDocumentRecord":
                        {
                            "FileExt":"txt",
                            "FileName":"capture.png",
                            "LibraryDocumentId":162516
                        }
                    }
                ],
                "isSubmitting":true,
                "Status":"",
                "state":
                {
                    "showInboundDocumentInputFields":false,
                    "showOutboundDocumentInputFields":false,
                    "isCollapsedCandidateDetails":false,
                    "isCollapsedProposedRole":false,
                    "isCollapsedSourcingInformation":false,
                    "isCollapsedPayrollDetails":false,
                    "isCollapsedManagerApproval":false,
                    "isCollapsedSaveOptions":false,
                    "isCollapsedDetails":false,
                    "isEditable":false,
                    "isMenuBulkRemoveCandidateActive":false,
                    "isResendDocRequired":false,
                    "isCollapsedDocumentCandidate":false
                },
                "RegisterKey":
                {
                    "IsStoreKeyRequired":false,
                    "IsAlarmCodeRequired":false,
                    "IsTabletRequired":false
                },
                "CandidatePersonalInfo":
                {
                    "Salutation":2,
                    "FirstName":"vvv",
                    "Surname":"vv",
                    "Sex":"m",
                    "PreferredName":"gfdgfd"
                },
                "CandidateContacts":
                [
                    {
                        "isPrimary":true,
                        "isPublic":false,
                        "Phone":"546565",
                        "Type":"p"
                    },
                    {
                        "isPrimary":true,
                        "isPublic":false,
                        "Email":"fdgf@gfhhgf.com",
                        "Type":"e"
                    }
                ],
                "SourceDetail":
                {
                       "IsReferenceChecked":true,
                       "Source":"w"
                    },
                    "OnboardRole":
                    {
                        "RoleId":775
                    },
                    "OnboardStore":
                    {
                        "NetworkGroupId":11038
                    },
                    "SalaryType":
                    {
                        "SalaryTypeId":1
                    },
                    "HoursPerWeek":3,
                    "EmploymentType":null,
                    "CommencementDate":"2016-04-13T17:00:00.000Z"
          }
                
          mockOnboarding.createOnboardForNewMember(obj).then(function(rs){
              expect(rs.Data).toEqual(7629);
              expect(rs.Status).toEqual(0);
              
              $notify.add({message: notificationObj.createSingleOnboard, type: 'success', visible: true});
              
              expect($notify.get()).toEqual({
                message: notificationObj.createSingleOnboard,
                type: 'success',
                visible: true
            });
          });
          
          $rootScope.$digest();
    });
    
    it('should return data correctly when create bulk onboard from list candidates and not upload CSV file', function(){
        var obj = {
            "ProposedRoleDetail":
            {
                "HoursPerWeek":3,
                "EffectiveDate":"2016-04-21T17:00:00.000Z",
                "OnboardRole":
                {
                    "RoleId":644
                },
                "OnboardStore":
                {
                    "NetworkGroupId":11056
                },
                "SalaryType":
                {
                    "SalaryTypeId":1
                },
                "EmploymentType":
                {
                    "EmploymentTypeId":23
                },
                "SourceDetail":
                {
                    "IsReferenceChecked":true,
                    "Source":"w"
                },
                "CommencementDate":"2016-04-21T17:00:00.000Z"
            },
            "Candidates":
            [
                {
                    "Salutation":3,
                    "FirstName":"gfg",
                    "Surname":"fdg",
                    "Country":
                    {
                        "Value":13
                    },
                    "Address":"hfhgf",
                    "Suburb":"ABERFOYLE PARK",
                    "Postcode":"5",
                    "StateName":"SA",
                    "Sex":"m",
                    "Contacts":
                    [
                        {
                            "Address":"hfhgf",
                            "Postcode":"5",
                            "Suburb":"ABERFOYLE PARK",
                            "StateName":"SA",
                            "CountryId":13,
                            "Type":"ad"
                        },
                        {
                            "isPrimary":true,
                            "isPublic":false,
                            "Phone":"64654",
                            "Type":"p"
                        },
                        {
                            "isPrimary":true,
                            "isPublic":false,
                            "Email":"dfgf@ghgfh.com",
                            "Type":"e"
                        }
                   ]
                },
                {
                    "Salutation":4,
                    "FirstName":"rey",
                    "Surname":"yrey",
                    "Country":
                    {
                        "Value":13
                    },
                    "Address":"hfhgf",
                    "Suburb":"ABBOTSHAM",
                    "Postcode":"7",
                    "StateName":"TAS",
                    "Sex":"f",
                    "Contacts":
                    [
                        {
                            "Address":"hfhgf",
                            "Postcode":"7",
                            "Suburb":"ABBOTSHAM",
                            "StateName":"TAS",
                            "CountryId":13,
                            "Type":"ad"
                        },
                        {
                            "isPrimary":true,
                            "isPublic":false,
                            "Phone":"46456",
                            "Type":"p"
                        },
                        {
                            "isPrimary":true,
                            "isPublic":false,
                            "Email":"dfg@hdh.com",
                            "Type":"e"
                        }
                   ]
                }
          ]
        };
        
        mockOnboarding.createBulkOnboard(obj).then(function(rs){
            expect(rs.Data).toEqual('5bb07bc7-9ecb-4051-ba50-639233c7e35e');
            expect(rs.Status).toEqual(0);
            
            $notify.add({
                message: notificationObj.createBulkOnboard,
                type:'success',
                visible: true
            });
            
            expect($notify.get()).toEqual({
                message: notificationObj.createBulkOnboard,
                type:'success',
                visible: true
            });
        });
        
        $rootScope.$digest();
    });
    
    it('should return data correctly when create bulk onboard from list candidates and CSV file', function(){
        var obj = {
            "ProposedRoleDetail":
            {
                "HoursPerWeek":3,
                "EffectiveDate":"2016-04-21T17:00:00.000Z",
                "OnboardRole":
                {
                    "RoleId":644
                },
                "OnboardStore":
                {
                    "NetworkGroupId":11056
                },
                "SalaryType":
                {
                    "SalaryTypeId":1
                },
                "EmploymentType":
                {
                    "EmploymentTypeId":23
                },
                "SourceDetail":
                {
                    "IsReferenceChecked":true,
                    "Source":"w"
                },
                "CommencementDate":"2016-04-21T17:00:00.000Z"
            },
            "Candidates":
            [
                {
                    "Salutation":3,
                    "FirstName":"gfg",
                    "Surname":"fdg",
                    "Country":
                    {
                        "Value":13
                    },
                    "Address":"hfhgf",
                    "Suburb":"ABERFOYLE PARK",
                    "Postcode":"5",
                    "StateName":"SA",
                    "Sex":"m",
                    "Contacts":
                    [
                        {
                            "Address":"hfhgf",
                            "Postcode":"5",
                            "Suburb":"ABERFOYLE PARK",
                            "StateName":"SA",
                            "CountryId":13,
                            "Type":"ad"
                        },
                        {
                            "isPrimary":true,
                            "isPublic":false,
                            "Phone":"64654",
                            "Type":"p"
                        },
                        {
                            "isPrimary":true,
                            "isPublic":false,
                            "Email":"dfgf@ghgfh.com",
                            "Type":"e"
                        }
                   ]
                },
                {
                    "Salutation":4,
                    "FirstName":"rey",
                    "Surname":"yrey",
                    "Country":
                    {
                        "Value":13
                    },
                    "Address":"hfhgf",
                    "Suburb":"ABBOTSHAM",
                    "Postcode":"7",
                    "StateName":"TAS",
                    "Sex":"f",
                    "Contacts":
                    [
                        {
                            "Address":"hfhgf",
                            "Postcode":"7",
                            "Suburb":"ABBOTSHAM",
                            "StateName":"TAS",
                            "CountryId":13,
                            "Type":"ad"
                        },
                        {
                            "isPrimary":true,
                            "isPublic":false,
                            "Phone":"46456",
                            "Type":"p"
                        },
                        {
                            "isPrimary":true,
                            "isPublic":false,
                            "Email":"dfg@hdh.com",
                            "Type":"e"
                        }
                   ]
                }
          ]
        };
        
        mockOnboarding.createBulkOnboard(obj, 162517).then(function(rs){
            expect(rs.Data).toEqual('5bb07bc7-9ecb-4051-ba50-639233c7e35e');
            expect(rs.Status).toEqual(0);
            
            $notify.add({
                message: notificationObj.createBulkOnboard,
                type:'success',
                visible: true
            });
            
            expect($notify.get()).toEqual({
                message: notificationObj.createBulkOnboard,
                type:'success',
                visible: true
            });
        });
        
        $rootScope.$digest();
    });
    
    it('should return data correctly when upload csv success and update list candidates for bulk onboard', function(){
        var obj = [{"Salutation":4,"FirstName":"dfd","Surname":"fdsf","Country":{"Value":13},"Address":"gfgdfg","Suburb":"ABBEYWOOD","Postcode":"4","StateName":"QLD","Sex":"m","BirthDay":"2016-04-13T17:00:00.000Z","Contacts":[{"Address":"gfgdfg","Postcode":"4","Suburb":"ABBEYWOOD","StateName":"QLD","CountryId":13,"Type":"ad"},{"isPrimary":true,"isPublic":false,"Phone":"66346","Type":"p"},{"isPrimary":true,"isPublic":false,"Email":"vcx@fgdfg.com","Type":"e"}]}];
        
        mockOnboarding.updateBulkOnboardAfterUploadCsv(obj, mockRouteParams.bulkId).then(function(rs){
            expect(rs.Data).toEqual(null);
            expect(rs.Status).toEqual(0);
            $notify.add({
                message: notificationObj.createBulkOnboard,
                type:'success',
                visible: true
            });
            
            expect($notify.get()).toEqual({
                message: notificationObj.createBulkOnboard,
                type:'success',
                visible: true
            });
        });
        
        $rootScope.$digest();
    }); 
    
    it('should return data correctly when create and approve onboard with status draft', function(){
        var obj = {
            "inboundDocument":null,
            "address":
            {
                "Address":"gfdgdfg",
                "Postcode":"7",
                "Suburb":"ABBOTSHAM",
                "StateName":"TAS",
                "CountryId":13
            },
            "phones":
            [
                {
                    "value":"546565",
                    "isPrimary":true,
                    "isPublic":false
                }
            ],
            "emails":
            [
                {"value":"fdgf@gfhhgf.com",
                "isPrimary":true,
                "isPublic":false
                }
            ],
            "referringMemberId":null,
            "salutation":
            {
                "$id":"2",
                "Id":2,
                "Name":"Ms"
            },
            "storeGroup":null,
            "role":null,
            "salaryType":null,
            "employmentType":null,
            "payRate":null,
            "registerKey":null,
            "outboundDocuments":[],
            "referencedocuments":
            [
                {
                    "OnboardDocumentRecord":
                    {
                        "FileExt":"txt",
                        "FileName":"capture.png",
                        "LibraryDocumentId":162516
                    }
                }
            ],
            "isSubmitting":true,
            "Status":"",
            "state":
            {
                "showInboundDocumentInputFields":false,
                "showOutboundDocumentInputFields":false,
                "isCollapsedCandidateDetails":false,
                "isCollapsedProposedRole":false,
                "isCollapsedSourcingInformation":false,
                "isCollapsedPayrollDetails":false,
                "isCollapsedManagerApproval":false,
                "isCollapsedSaveOptions":false,
                "isCollapsedDetails":false,
                "isEditable":false,
                "isMenuBulkRemoveCandidateActive":false,
                "isResendDocRequired":false,
                "isCollapsedDocumentCandidate":false
            },
            "RegisterKey":
            {
                "IsStoreKeyRequired":false,
                "IsAlarmCodeRequired":false,
                "IsTabletRequired":false
            },
            "CandidatePersonalInfo":
            {
                "Salutation":2,
                "FirstName":"vvv",
                "Surname":"vv",
                "BirthDay":"2016-04-12T17:00:00.000Z",
                "Sex":"m",
                "PreferredName":"gfdgfd"
            },
            "CandidateContacts":
            [
                {
                    "Address":"gfdgdfg",
                    "Postcode":"7",
                    "Suburb":"ABBOTSHAM",
                    "StateName":"TAS",
                    "CountryId":13,
                    "Type":"ad"
                },
                {
                    "isPrimary":true,
                    "isPublic":false,
                    "Phone":"546565",
                    "Type":"p"
                },
                {
                    "isPrimary":true,
                    "isPublic":false,
                    "Email":"fdgf@gfhhgf.com",
                    "Type":"e"
                }
            ],
            "SourceDetail":
            {
                       "IsReferenceChecked":true,
                       "Source":"w"
                    },
                    "OnboardRole":
                    {
                        "RoleId":775
                    },
                    "OnboardStore":
                    {
                        "NetworkGroupId":11038
                    },
                    "SalaryType":
                    {
                        "SalaryTypeId":1
                    },
                    "HoursPerWeek":3,
                    "EmploymentType":
                    {
                        "EmploymentTypeId":21
                    },
                    "CommencementDate":"2016-04-13T17:00:00.000Z"
          }
          
          
        
        var result = {
            onboardId: null,
            isOnboardCreated: false,
            isOnboardSentToApproval: false,
            isOnboardSentToDocumention: false
        };
        
        expect(obj.Status).toEqual('');

        OnboardingFactory.createOnboardForNewMember(obj).then(function(res){
            expect(res.hasOwnProperty('Data')).toBe(true);
            expect(res.Data).toEqual(7629);
            
            let createdOnboardId = res.Data;
            expect(createdOnboardId).toEqual(7629);
            
            result.isOnboardCreated = true;
            result.onboardId = createdOnboardId;
            
            expect(result.isOnboardCreated).toEqual(true);
            expect(result.onboardId).toEqual(createdOnboardId);
            
            OnboardingFactory.progressOnboard(createdOnboardId).then(function(){
                result.isOnboardSentToApproval = true;
                expect(result).toBeDefined();
            });
        })
        
        $rootScope.$digest();
    });
    
    it('should return data correctly when approve onboard with status new and update details of onboard', function(){
        var obj = {
            "OnboardId": 7628,
            "PersonalDetails": {
                "$id": "2",
                "MemberId": 1,
                "Salutation": 2,
                "FirstName": "sample string 3",
                "Surname": "sample string 4",
                "PreferredName": "sample string 5",
                "Sex": "sample string 6",
                "BirthDay": "2016-04-08T20:08:54.5898425+07:00",
                "LastModified": "2016-04-08T20:08:54.5898425+07:00",
                "MemberType": "sample string 7",
                "Title": "sample string 8",
                "Active": true,
                "DateRegistered": "2016-04-08T20:08:54.5898425+07:00",
                "PhotoThumb": "sample string 10"
            },
            "Contacts": [
                {
                "$id": "3",
                "MemberId": 1,
                "ContactInfoId": 2,
                "DateCreated": "2016-04-08T20:08:54.5908421+07:00",
                "DateModified": "2016-04-08T20:08:54.5908421+07:00",
                "IsPrimary": true,
                "IsPrivate": true,
                "Type": "sample string 7",
                "Address": "sample string 8",
                "City": "sample string 10",
                "Suburb": "sample string 11",
                "Postcode": "sample string 12",
                "MobilePhone": "sample string 15",
                "Phone": "sample string 16",
                "Fax": "sample string 17",
                "Email": "sample string 18",
                "WebAddress": "sample string 19",
                "StateName": "sample string 20",
                "StateRegionId": 1,
                "StateRegion": {
                    "$id": "4",
                    "StateRegionId": 1,
                    "Name": "sample string 2",
                    "NameAbbreviated": "sample string 3",
                    "LookupUrl": "sample string 4"
                },
                "CountryId": 1,
                "Country": {
                    "$id": "5",
                    "LookupUrl": "sample string 1",
                    "Value": 2,
                    "Label": "sample string 3"
                },
                "CanAcceptSms": true,
                "CanAcceptVoiceCall": true,
                "CanAcceptFax": true,
                "CanAcceptHtml": true
                },
                {
                "$ref": "3"
                }
            ],
            "ProposedRole": {
                "$id": "6",
                "HoursPerWeek": 1.1,
                "EffectiveDate": "2016-04-08T20:08:54.5918428+07:00",
                "Comments": "sample string 2",
                "OnboardRole": {
                "$id": "7",
                "RoleId": 1,
                "Description": "sample string 2",
                "LookupUrl": "sample string 3"
                },
                "OnboardStore": {
                "$id": "8",
                "NetworkGroupId": 1,
                "GroupName": "sample string 2",
                "Type": "sample string 3",
                "LookupUrl": "sample string 4",
                "IsTrainingLocation": true
                },
                "SalaryType": {
                "$id": "9",
                "SalaryTypeId": 1,
                "Description": "sample string 2",
                "IsPermanent": true,
                "MiniumHours": 4,
                "PaymentType": "sample string 5",
                "LookupUrl": "sample string 6"
                },
                "SalaryPayRate": {
                "$id": "10",
                "SalaryPayRateId": 1,
                "Description": "sample string 1",
                "Allowence": 1.1,
                "Discount": 1.1,
                "ProbationAllowence": 1.1,
                "ProbationDiscount": 1.1,
                "IsPermanent": true,
                "MiniumHours": 1,
                "PaymentType": "sample string 3",
                "LookupUrl": "sample string 4"
                },
                "EmploymentType": {
                "$id": "11",
                "EmploymentTypeId": 1,
                "Description": "sample string 2",
                "LookupUrl": "sample string 3"
                },
                "EmploymentClassification": {
                "$id": "12",
                "EmploymentClassificationId": 1,
                "Description": "sample string 2",
                "LookupUrl": "sample string 3"
                },
                "Payroll": {
                "$id": "13",
                "OperatorId": "sample string 1",
                "DebtorId": "sample string 2"
                },
                "DesiredSalary": "sample string 3",
                "SourceDetail": {
                "$id": "14",
                "Source": "sample string 1",
                "AgencyName": "sample string 2",
                "ReferalMembers": [
                    {
                    "$id": "15",
                    "MemberId": 1,
                    "FirstName": "sample string 2",
                    "Surname": "sample string 3",
                    "PhotoLarge": "sample string 4",
                    "PhotoThumb": "sample string 5",
                    "PhotoThumbMini": "sample string 6",
                    "RoleTitle": "sample string 7",
                    "DefaultNetworkGroupId": 8
                    },
                    {
                    "$ref": "15"
                    }
                ],
                "IsReferenceChecked": true,
                "OnboardingTrialsInfoDetail": {
                    "$id": "16",
                    "TrialStart": "2016-04-08T20:08:54.5918428+07:00",
                    "TrialEnd": "2016-04-08T20:08:54.5918428+07:00",
                    "Hours": 3.1
                },
                "MemberBankingDetail": {
                    "$id": "17",
                    "LoginName": "sample string 1",
                    "MemberId": 2,
                    "LoginCount": 3,
                    "Password": "sample string 4",
                    "BankPassword": "sample string 5",
                    "BankingID": 1,
                    "AccountName": "sample string 6",
                    "BSB": "sample string 7",
                    "AccountNo": "sample string 8",
                    "SuperFund": "sample string 9",
                    "SuperNo": "sample string 10",
                    "BankName": "sample string 11",
                    "TaxFileNumber": "sample string 12"
                },
                "SourceName": ""
                },
                "OnboardOption": {
                "$id": "18",
                "IsBypassAcceptance": true,
                "IsSuppressEmail": true,
                "FinalInstruction": "sample string 3",
                "Comments": "sample string 4"
                },
                "RegisterKey": {
                "$id": "19",
                "IsKeyRegister": true,
                "IsStoreKeyRequired": true,
                "IsAlarmCodeRequired": true,
                "IsTabletRequired": true
                }
            }
         }
          
          
        
        var result = {
            onboardId: null,
            isOnboardCreated: false,
            isOnboardSentToApproval: false,
            isOnboardSentToDocumention: false
        };
        
        expect(obj.OnboardId).toEqual(7628);
        
        result.isOnboardCreated = true;
        result.onboardId = obj.OnboardId;
        
        expect(result.isOnboardCreated).toEqual(true);
        expect(result.onboardId).toEqual(7628);

        OnboardingFactory.updateOnboard(obj).then(function(res){
            OnboardingFactory.progressOnboard(obj.OnboardId).then(function(){
                result.isOnboardSentToApproval = true;
                expect(result).toBeDefined();
            });
        })
        
        $rootScope.$digest();
    });
    
    it('should return data correctly when approve onboard with status new and not update details of onboard', function(){
        var obj = {
            "OnboardId": 7628,
            "PersonalDetails": {
                "$id": "2",
                "MemberId": 1,
                "Salutation": 2,
                "FirstName": "sample string 3",
                "Surname": "sample string 4",
                "PreferredName": "sample string 5",
                "Sex": "sample string 6",
                "BirthDay": "2016-04-08T20:08:54.5898425+07:00",
                "LastModified": "2016-04-08T20:08:54.5898425+07:00",
                "MemberType": "sample string 7",
                "Title": "sample string 8",
                "Active": true,
                "DateRegistered": "2016-04-08T20:08:54.5898425+07:00",
                "PhotoThumb": "sample string 10"
            },
            "Contacts": [
                {
                "$id": "3",
                "MemberId": 1,
                "ContactInfoId": 2,
                "DateCreated": "2016-04-08T20:08:54.5908421+07:00",
                "DateModified": "2016-04-08T20:08:54.5908421+07:00",
                "IsPrimary": true,
                "IsPrivate": true,
                "Type": "sample string 7",
                "Address": "sample string 8",
                "City": "sample string 10",
                "Suburb": "sample string 11",
                "Postcode": "sample string 12",
                "MobilePhone": "sample string 15",
                "Phone": "sample string 16",
                "Fax": "sample string 17",
                "Email": "sample string 18",
                "WebAddress": "sample string 19",
                "StateName": "sample string 20",
                "StateRegionId": 1,
                "StateRegion": {
                    "$id": "4",
                    "StateRegionId": 1,
                    "Name": "sample string 2",
                    "NameAbbreviated": "sample string 3",
                    "LookupUrl": "sample string 4"
                },
                "CountryId": 1,
                "Country": {
                    "$id": "5",
                    "LookupUrl": "sample string 1",
                    "Value": 2,
                    "Label": "sample string 3"
                },
                "CanAcceptSms": true,
                "CanAcceptVoiceCall": true,
                "CanAcceptFax": true,
                "CanAcceptHtml": true
                },
                {
                "$ref": "3"
                }
            ],
            "ProposedRole": {
                "$id": "6",
                "HoursPerWeek": 1.1,
                "EffectiveDate": "2016-04-08T20:08:54.5918428+07:00",
                "Comments": "sample string 2",
                "OnboardRole": {
                "$id": "7",
                "RoleId": 1,
                "Description": "sample string 2",
                "LookupUrl": "sample string 3"
                },
                "OnboardStore": {
                "$id": "8",
                "NetworkGroupId": 1,
                "GroupName": "sample string 2",
                "Type": "sample string 3",
                "LookupUrl": "sample string 4",
                "IsTrainingLocation": true
                },
                "SalaryType": {
                "$id": "9",
                "SalaryTypeId": 1,
                "Description": "sample string 2",
                "IsPermanent": true,
                "MiniumHours": 4,
                "PaymentType": "sample string 5",
                "LookupUrl": "sample string 6"
                },
                "SalaryPayRate": {
                "$id": "10",
                "SalaryPayRateId": 1,
                "Description": "sample string 1",
                "Allowence": 1.1,
                "Discount": 1.1,
                "ProbationAllowence": 1.1,
                "ProbationDiscount": 1.1,
                "IsPermanent": true,
                "MiniumHours": 1,
                "PaymentType": "sample string 3",
                "LookupUrl": "sample string 4"
                },
                "EmploymentType": {
                "$id": "11",
                "EmploymentTypeId": 1,
                "Description": "sample string 2",
                "LookupUrl": "sample string 3"
                },
                "EmploymentClassification": {
                "$id": "12",
                "EmploymentClassificationId": 1,
                "Description": "sample string 2",
                "LookupUrl": "sample string 3"
                },
                "Payroll": {
                "$id": "13",
                "OperatorId": "sample string 1",
                "DebtorId": "sample string 2"
                },
                "DesiredSalary": "sample string 3",
                "SourceDetail": {
                "$id": "14",
                "Source": "sample string 1",
                "AgencyName": "sample string 2",
                "ReferalMembers": [
                    {
                    "$id": "15",
                    "MemberId": 1,
                    "FirstName": "sample string 2",
                    "Surname": "sample string 3",
                    "PhotoLarge": "sample string 4",
                    "PhotoThumb": "sample string 5",
                    "PhotoThumbMini": "sample string 6",
                    "RoleTitle": "sample string 7",
                    "DefaultNetworkGroupId": 8
                    },
                    {
                    "$ref": "15"
                    }
                ],
                "IsReferenceChecked": true,
                "OnboardingTrialsInfoDetail": {
                    "$id": "16",
                    "TrialStart": "2016-04-08T20:08:54.5918428+07:00",
                    "TrialEnd": "2016-04-08T20:08:54.5918428+07:00",
                    "Hours": 3.1
                },
                "MemberBankingDetail": {
                    "$id": "17",
                    "LoginName": "sample string 1",
                    "MemberId": 2,
                    "LoginCount": 3,
                    "Password": "sample string 4",
                    "BankPassword": "sample string 5",
                    "BankingID": 1,
                    "AccountName": "sample string 6",
                    "BSB": "sample string 7",
                    "AccountNo": "sample string 8",
                    "SuperFund": "sample string 9",
                    "SuperNo": "sample string 10",
                    "BankName": "sample string 11",
                    "TaxFileNumber": "sample string 12"
                },
                "SourceName": ""
                },
                "OnboardOption": {
                "$id": "18",
                "IsBypassAcceptance": true,
                "IsSuppressEmail": true,
                "FinalInstruction": "sample string 3",
                "Comments": "sample string 4"
                },
                "RegisterKey": {
                "$id": "19",
                "IsKeyRegister": true,
                "IsStoreKeyRequired": true,
                "IsAlarmCodeRequired": true,
                "IsTabletRequired": true
                }
            }
         }
          
          
        
        var result = {
            onboardId: null,
            isOnboardCreated: false,
            isOnboardSentToApproval: false,
            isOnboardSentToDocumention: false
        };
        
        expect(obj.OnboardId).toEqual(7628);
        
        result.isOnboardCreated = true;
        result.onboardId = obj.OnboardId;
        
        expect(result.isOnboardCreated).toEqual(true);
        expect(result.onboardId).toEqual(7628);

        OnboardingFactory.progressOnboard(obj.OnboardId).then(function(){
            result.isOnboardSentToApproval = true;
            expect(result).toBeDefined();
        });
        
        $rootScope.$digest();
    });
    
    it('roll back for single onboard', function(){
        OnboardingFactory.rollbackOnboard(mockRouteParams.onboardId).then(function(){
            $notify.add({message: 'roll back success', type: 'success', visible: true});
              
              expect($notify.get()).toEqual({
                message: 'roll back success',
                type: 'success',
                visible: true
            });
        });
        
        $rootScope.$digest();
    });
    
    it('roll back for bulk onboard', function(){
        OnboardingFactory.rollbackOnboard(mockRouteParams.bulkId).then(function(){
            $notify.add({message: 'roll back success', type: 'success', visible: true});
              
            expect($notify.get()).toEqual({
                message: 'roll back success',
                type: 'success',
                visible: true
            });
        });
        
        $rootScope.$digest();
    });
    
    it('delete single onboard', function(){
        OnboardingFactory.deleteOnboard(mockRouteParams.onboardId).then(function(){
            $notify.add({message: 'The onboard has been deleted', type: 'success', visible: true});
              
            expect($notify.get()).toEqual({
                message: 'The onboard has been deleted',
                type: 'success',
                visible: true
            });
        });
        
        $rootScope.$digest();
    });
    
    it('delete bulk onboard', function(){
        OnboardingFactory.deleteOnboard(mockRouteParams.bulkId, true).then(function(){
            $notify.add({message: 'The bulk onboard has been deleted', type: 'success', visible: true});
              
            expect($notify.get()).toEqual({
                message: 'The bulk onboard has been deleted',
                type: 'success',
                visible: true
            });
        });
        
        $rootScope.$digest();
    });
    
    it('should return right when get onboard setting', function(){
        mockOnboarding.getOnboardingSettings().then(function(res){
            expect(res).toEqual(jasmine.any(Object));
            expect(res.hasOwnProperty('OnboardingSetting')).toBe(true);
            expect(res.OnboardingSetting.hasOwnProperty('IsEmploymentTypeVisible')).toBe(true);
            expect(res.OnboardingSetting.hasOwnProperty('IsStoreKeyFieldVisible')).toBe(true);
            expect(res.OnboardingSetting.hasOwnProperty('IsAlarmCodeFieldVisible')).toBe(true);
            expect(res.OnboardingSetting.hasOwnProperty('IsTabletRequiredFieldVisible')).toBe(true);
            expect(res.OnboardingSetting.hasOwnProperty('IsRequireAddress')).toBe(true);
            expect(res.OnboardingSetting.hasOwnProperty('IsRequireBirthday')).toBe(true);
            expect(res.OnboardingSetting.hasOwnProperty('IsRemoveDefaultDocumentAllow')).toBe(true);
        });
        
        $rootScope.$digest();
    });
    
    xit('should return notify success when update single candidate info success', function () {
        //#region 
        var onboard = {};
        
        //action
        OnboardingFactory.updateSingleCandidateInfo(onboard);
        
        //assert
        expect(OnboardingFactory.updatePersonalInfo(onboard)).toHaveBeenCalled();
        expect(OnboardingFactory.updateContacts(onboard)).toHaveBeenCalled();
        
        $rootScope.$digest();
    });
});