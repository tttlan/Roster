// Controller profileEmployeeDetails
// ----------------------------------------

describe('Unit: Controller:profileEmployeeDetails', function() {
    
    var $scope, $location, $timeout, createController, API_BASE_URL, $modal, modalResult, $httpBackend, memberId = '';

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
            $provide.provider('$modal',  function() {
                this.$get = function() {                    
                    return {
                        open: function(modal) {
                            modalResult = modal.resolve.items();
                        }    
                    }
                }
            });
        });
        
        inject(function($rootScope, $controller, _$location_, $injector, _$timeout_) {

            $scope = $rootScope.$new();
            $location = _$location_;
            $httpBackend = $injector.get('$httpBackend');
            API_BASE_URL = $injector.get('API_BASE_URL');
            $modal = $injector.get('$modal');
            $timeout = _$timeout_;

            // For some reason base is needed here.  No idea why, found the answer here:
            // http://stackoverflow.com/questions/17370427/loading-a-mock-json-file-within-karmaangularjs-test
            jasmine.getJSONFixtures().fixturesPath = 'base/interfaceSource/test/mockData/api/';

            $scope.profile = { $userCan: {} };
            $scope.profile.$userCan.viewprofileemploymentdetail = true;
            createController = function() {
                return $controller('profileEmployeeDetails', {
                    '$scope': $scope
                });
            };
            
            $httpBackend.when('GET', API_BASE_URL + 'profilemanagement/' + (memberId ? memberId : 'me') + '/employmentinfo').respond(200, 
               getJSONFixture('profilemanagement/employmentinfo/index.json')
            );
            
            $httpBackend.when('PUT', API_BASE_URL + 'profilemanagement/' + (memberId ? memberId : 'me') + '/employmentinfo', {RoleId: 1234, DefaultNetworkGroupId: 5678, TestProp: true}).respond(200, {success: true});
        });
    });
    
    it('should be able to load api data and format it correctly', function(){
        
        var controller = createController();
        $location.path('/profile/?tab=employment-details');

        $scope.employeeDetailsForm.$promise().then(function(res){
            
            // Basic non-maniplulated data is passed through at the root of the object
            expect(res.data.MemberId).toEqual(247682);
            expect(res.data.RoleId).toEqual(618);
            
            // Ensuring the entity actions are formatted into a user can object
            expect($scope.employeeDetailsForm.$userCan.viewprofileemploymentdetail).toEqual(true);
            
            // Setting custom labels that come back from the API
            expect($scope.employeeDetailsForm.customLabels.OperatorIdDesc).toEqual('Employee ID');
            expect($scope.employeeDetailsForm.customLabels.PayrollLocationIdentifierDesc).toEqual(null);
            
            // Setting static values that are displayed in the template
            expect($scope.employeeDetailsForm.staticValues.OnboardingStatus).toEqual(true);
            expect($scope.employeeDetailsForm.staticValues.DisplayAlarmCode).toEqual(false);
            
            // Select data is passed through for the employment classification and an object is created to look up the label by the val.  That obj is used in the template to display the current val
            expect($scope.employeeDetailsForm.selectData.EmploymentTypeId[2].Label).toEqual('Contract');
            expect($scope.employeeDetailsForm.selectData.EmploymentTypeIdObj[21]).toEqual('Full time');
            expect($scope.employeeDetailsForm.selectData.RosterRoleId[2].Label).toEqual('<span class=optTitle>02 Team Leader</span><span class=optEmpType>Hourly</span><span class=optRate>Age 20 ($17/hr)</span></span>');
            expect($scope.employeeDetailsForm.selectData.RosterRoleIdObj[494]).toEqual('<span class=optTitle>35,000</span><span class=optEmpType>Salaried</span><span class=optRate>$0</span></span>');
            expect($scope.employeeDetailsForm.selectData.SalaryClassificationId).toEqual(undefined);
            expect($scope.employeeDetailsForm.selectData.PerformanceAssessmentForm).toEqual(undefined);
            
            expect(res.data.Role.label).toEqual('HR - Office / Training Coordinator');
            expect(res.data.Group.Id).toEqual(0);
        });

        $httpBackend.flush();
        
        memberId = '1234'; // Set this for the next test
    });    
    
    it('can load data correctly for a specifc member as well as the currently logged in member', function(){
    
        var controller = createController();
        $location.path('/profile/1234/?tab=employment-details');
        
        $scope.employeeDetailsForm.$promise(); // Unwrap the promise so a http request is expected
        
        $httpBackend.flush();
        
        memberId = ''; // Set this for the next test
    });
    
    it('can correctly format a response to send back to the API', function(){
        
        var controller = createController();
        $location.path('/profile/?tab=employment-details');
        
        $scope.employeeDetailsFormSave({Roles: [1, 2, 3], NetworkGroups: [1, 2, 3], EmploymentClassification: [1, 2, 3], PerformanceAssessmentForms: [1, 2, 3], SalaryTypes: [1, 2, 3], SalaryRates: [1, 2, 3], Role: {id: 1234, label: 'The boss'}, Group: {Id: 5678, Label: 'My group'}, TestProp: true});
        
        $httpBackend.flush();
        
        // The properties that are currently sent are the ones that get manipulated before they are sent off to the API.  The rest will be sent through unchanged.
    });
    
    it('can format data to display in a modal with the ', function(){
        
        var controller = createController();
        $location.path('/profile/?tab=employment-details');
        
        $scope.employeeDetailsForm.$promise(); // Unwrap the promise so requests for data can be flushed in order to get data to work with
        
        $httpBackend.flush();
        
        $scope.employeeDetails.viewPendingChanges();
        
        // Pending change in the modal
        expect(modalResult.role.current).toEqual('HR - Office / Training Coordinator');
        expect(modalResult.role.pending).toEqual('OPS - General Manager - Operations');
        
        expect(modalResult.group.current).toEqual(''); // This will be shown as 'not set' in the modal
        expect(modalResult.group.pending).toEqual('Mt Lawley');
        
        // Pending change in modal
        expect(modalResult.salary.current).toEqual('<span class=optTitle>55,000</span><span class=optEmpType>Salaried</span><span class=optRate>$0</span></span>');
        expect(modalResult.salary.pending).toEqual('<span class=optTitle>56,000</span><span class=optEmpType>Salaried</span><span class=optRate>$0</span></span>');  
        
        expect(modalResult.commencement.current).toEqual('2015-08-03T14:00:00');
        expect(modalResult.commencement.pending).toEqual(null); // No onboard result to show here
    });
    
    it('can detect a change to the salary / employment value when changing profile employment details', function(){
        
        var controller = createController();
        $location.path('/profile/?tab=employment-details');
        
        var salaryRates = [{Label: '<span class=optTitle>01 Team Member</span><span class=optEmpType>Hourly</span><span class=optRate>Age 20 ($15.5/hr)</span></span>', Value: 478}, {Label: '<span class=optTitle>02 Team Leader</span><span class=optEmpType>Hourly</span><span class=optRate>Age 20 ($17/hr)</span></span>', Value: 493}, {Label: '<span class=optTitle>35,000</span><span class=optEmpType>Salaried</span><span class=optRate>$0</span></span>', Value: 494}];
        
        var changedValues = $scope.employeeDetails.buildChangedValues({
            new: {RosterRoleId: 493, SalaryRates: salaryRates}, 
            old: {RosterRoleId: 494, SalaryRates: salaryRates}
        });
        
        expect(changedValues[0].oldValue).toEqual('Salaried');
        expect(changedValues[0].newValue).toEqual('Hourly');
        
        changedValues = $scope.employeeDetails.buildChangedValues({
            new: {RosterRoleId: 493, SalaryRates: salaryRates}, 
            old: {RosterRoleId: 493, SalaryRates: salaryRates}
        });
        
        expect(changedValues).toEqual([]);
    });
    
    it('can detect a change to the role value when changing profile employment details', function(){
        
        var controller = createController();
        $location.path('/profile/?tab=employment-details');
        
        var changedValues = $scope.employeeDetails.buildChangedValues({
            new: {
                Role: {id: 608, label: 'OPS - Assistant Business Manager (Company)'}
            }, 
            old: {
                Role: {id: 622, label: 'MKT - Marketing Manager'}
            }
        });

        expect(changedValues[0].oldValue).toEqual('MKT - Marketing Manager');
        expect(changedValues[0].newValue).toEqual('OPS - Assistant Business Manager (Company)');
            
        changedValues = $scope.employeeDetails.buildChangedValues({
            new: {
                Role: {id: 608, label: 'OPS - Assistant Business Manager (Company)'}
            }, 
            old: {
                Role: {id: 608, label: 'OPS - Assistant Business Manager (Company)'}
            }
        });
        
        expect(changedValues).toEqual([]);
    });
    
    it('can detect a change to the group/location value when changing profile employment details', function(){
        
        var controller = createController();
        $location.path('/profile/?tab=employment-details');
        
        var changedValues = $scope.employeeDetails.buildChangedValues({
            new: {
                Group: {Id: 11059, Label: 'St Kilda'}
            }, 
            old: {
                Group: {Id: 11062, Label: 'Elsternwick'}
            }
        });

        expect(changedValues[0].newValue).toEqual('St Kilda');
        expect(changedValues[0].oldValue).toEqual('Elsternwick');
        
        changedValues = $scope.employeeDetails.buildChangedValues({
            new: {
                Group: {Id: 11059, Label: 'St Kilda'}
            }, 
            old: {
                Group: {Id: 11059, Label: 'St Kilda'}
            }
        });
        
        expect(changedValues).toEqual([]);
    });
    
    it('can detect a change to the payroll location identifier when changing profile employment details', function(){
        
        var controller = createController();
        $location.path('/profile/?tab=employment-details');
        
        var changedValues = $scope.employeeDetails.buildChangedValues({
            new: {
                PayrollLocationIdentifier: 'Some identifier'
            }, 
            old: {
                PayrollLocationIdentifier: 'A different identifier'
            }
        });

        expect(changedValues[0].newValue).toEqual('Some identifier');
        expect(changedValues[0].oldValue).toEqual('A different identifier');
        
        changedValues = $scope.employeeDetails.buildChangedValues({
            new: {
                PayrollLocationIdentifier: 'Some identifier'
            }, 
            old: {
                PayrollLocationIdentifier: 'Some identifier'
            }
        });
        
        expect(changedValues).toEqual([]);
    });
    
    it('can detect a change to the \'MinimumHours\' val when changing profile employment details', function(){
        
        var controller = createController();
        $location.path('/profile/?tab=employment-details');
        
        var changedValues = $scope.employeeDetails.buildChangedValues({
            new: {
                MinimumHours: 40
            }, 
            old: {
                MinimumHours: 50
            }
        });

        expect(changedValues[0].newValue).toEqual(40);
        expect(changedValues[0].oldValue).toEqual(50);
        
        changedValues = $scope.employeeDetails.buildChangedValues({
            new: {
                MinimumHours: 80
            }, 
            old: {
                MinimumHours: 80
            }
        });
        
        expect(changedValues).toEqual([]);
    });
    
    it('can detect a change to the \'DesiredSalary\' val when changing profile employment details', function(){
        
        var controller = createController();
        $location.path('/profile/?tab=employment-details');
        
        var changedValues = $scope.employeeDetails.buildChangedValues({
            new: {
                DesiredSalary: 457
            }, 
            old: {
                DesiredSalary: 456
            }
        });

        expect(changedValues[0].newValue).toEqual('$457.00');
        expect(changedValues[0].oldValue).toEqual('$456.00');
        
        changedValues = $scope.employeeDetails.buildChangedValues({
            new: {
                DesiredSalary: 1000
            }, 
            old: {
                DesiredSalary: 1000
            }
        });
        
        expect(changedValues).toEqual([]);
    });
    
});
