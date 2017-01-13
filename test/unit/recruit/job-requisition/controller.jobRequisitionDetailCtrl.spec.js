describe('Unit: Controller:jobRequisitionDetailCtrl', function () {

    var $scope, $timeout, $window, $routeParams, createJobRequisitionDetailCtrl, mockRequisitionService, mockDataService, mockNetworksService;

    beforeEach(function () {
        module('sherpa');
        module('test.services');

        mockRequisitionService = jasmine.createSpyObj('JobRequisitionService',
            ['getJobRequisition', 'getRequisitionLocationList', 'createJobRequisition', 'submitJobRequisition', 'deleteRequisition', 'processCommonCase']);

        mockNetworksService = jasmine.createSpyObj('Networks', ['getRolesPromise']);
        module(function ($provide) {
            $provide.value('JobRequisitionService', mockRequisitionService);
            $provide.value('Networks', mockNetworksService);
        });

        inject(function ($rootScope, $controller, _$timeout_, _$window_, $injector, _mockDataService_, _Paths_, _$routeParams_, REQUISITION_STATUS, REQUISITION_ACTION) {
            $scope = $rootScope.$new();
            $routeParams = _$routeParams_;
            $routeParams.id = 1913;
            $timeout = _$timeout_;
            $window = _$window_;
            mockDataService = _mockDataService_;


            mockRequisitionService.getJobRequisition.and.callFake(function(obj){
                var model =  mockDataService.get('api/recruit/job-requisition/detail/formatted-data/requisition-detail.json')
                return model;
            });

            mockRequisitionService.processCommonCase.and.callFake(function(url, comment){
                switch (url) {
                    case '/recruitments/JobRequisitions/1913/process/1':
                        return mockDataService.get('api/recruit/job-requisition/detail/approved/index.json');
                        break;
                    case '/recruitments/JobRequisitions/1913/process/3':
                        return mockDataService.get('api/recruit/job-requisition/detail/rejected/index.json');
                        break;
                    case '/recruitments/JobRequisitions/1913/process/4':
                        return mockDataService.get('api/recruit/job-requisition/detail/cancelled/index.json');
                        break;
                    case '/recruitments/JobRequisitions/1913/archive':
                        return mockDataService.get('api/recruit/job-requisition/detail/archived/index.json');
                        break;
                    case '/recruitments/JobRequisitions/1508/execute':
                        return mockDataService.get('api/recruit/job-requisition/detail/executed/index.json');
                        break;

                }
            });

            mockNetworksService.getRolesPromise.and.returnValue(
                mockDataService.get('api/recruit/job-requisition/networks/getRoles.json')
            );

            mockRequisitionService.getRequisitionLocationList.and.returnValue(
                mockDataService.get('api/recruit/job-requisition/location/location.json')
            );

            mockRequisitionService.createJobRequisition.and.returnValue(
                mockDataService.get('api/recruit/job-requisition/create-as-draft/index.json')
            );

            mockRequisitionService.submitJobRequisition.and.returnValue(
                mockDataService.get('api/recruit/job-requisition/submit/index.json')
            );

            mockRequisitionService.deleteRequisition.and.returnValue(
                mockDataService.get('api/recruit/job-requisition/submit/index.json')
            );

            createJobRequisitionDetailCtrl = function () {
                return $controller('jobRequisitionDetailCtrl', {
                    '$scope': $scope
                });
            };
        });
    });

    it('should initialization the jobRequisitionDetailCtrl and global variables successfully', function () {
        var controller = createJobRequisitionDetailCtrl();
        $scope.$digest();

        expect($scope.REQUISITION_STATUS).not.toBe(null);
        expect($scope.REQUISITION_ACTION).not.toBe(null);
        expect($scope.isLoading).toBe(false);
        expect($scope.isEditingRequisition.Role).toBe(false);
        expect($scope.isEditingRequisition.Group).toBe(false);
        expect($scope.isEditingRequisition.CanSave).toBe(false);
        expect($scope.locationList).toBe(null);
        expect($scope.roleList).toBe(null);
        expect($scope.Requisition).toBe(null);
        expect(controller.tempRequisition).toBe(null);
    });

    it('Should initialization the $scope.Requisition, roleList and locationList successfully', function(){
        var controller = createJobRequisitionDetailCtrl();
        $scope.init();
        $scope.$digest();

        expect($scope.roleList).not.toBe(null);
        expect($scope.roleList.RoleSummaryItemResults.length).toEqual(69);

        expect($scope.locationList).not.toBe(null);
        expect($scope.locationList.length).toEqual(63);

        expect($scope.Requisition).not.toBe(null);
        expect($scope.Requisition.JobAdRequisitionId).toBeDefined();
        expect($scope.Requisition.JobAdRequisitionId).toEqual(1913);

    });

    it('Could select role from tag autocomplete box', function(){
        var controller = createJobRequisitionDetailCtrl();
        var roleObj = {
            RoleId: 1,
            Decsription: 'Role mockup name'
        };
        $scope.init();
        $scope.$digest();

        $scope.onSelect(roleObj, 'ROLE');

        expect($scope.Requisition.Role.RoleId).toBe(1);
        expect($scope.Requisition.Role.Decsription).toBe('Role mockup name');
        expect($scope.isEditingRequisition.CanSave).not.toBe(null);
    });

    it('Could select location from tag autocomplete box', function(){
        var controller = createJobRequisitionDetailCtrl();
        var locationObj =  {
            "NetworkGroupId": 1245,
            "GroupName": "Test Group",
            "Type": "s"
        };
        $scope.init();
        $scope.$digest();

        $scope.onSelect(locationObj, 'LOCATION');

        expect($scope.Requisition.Group.NetworkGroupId).toBe(1245);
        expect($scope.Requisition.Group.GroupName).toBe('Test Group');
        expect($scope.Requisition.Group.Type).toBe('s');
        expect($scope.isEditingRequisition.CanSave).not.toBe(null);
    });

    it('Should set to current value of role when user click on cancel button of role field', function(){
        var controller = createJobRequisitionDetailCtrl();
        var roleObj = {
            RoleId: 1,
            Decsription: 'Role mockup name'
        };
        $scope.init();
        $scope.$digest();
        $scope.onSelect(roleObj, 'ROLE');
        $scope.resetField('ROLE');

        expect($scope.Requisition.Role).toBe(controller.tempRequisition.Role);
        expect($scope.isEditingRequisition.CanSave).not.toBe(null);

    });

    it('Should set to current value of location when user click on cancel button of location field', function(){
        var controller = createJobRequisitionDetailCtrl();
        var locationObj =  {
            "NetworkGroupId": 1245,
            "GroupName": "Test Group",
            "Type": "s"
        };
        $scope.init();
        $scope.$digest();
        $scope.onSelect(locationObj, 'LOCATION');
        $scope.resetField('LOCATION');

        expect($scope.Requisition.Group).toBe(controller.tempRequisition.Group);
        expect($scope.isEditingRequisition.CanSave).not.toBe(null);

    });

    it('Could remove role field when user click on "x" button of role label', function(){
        var controller = createJobRequisitionDetailCtrl();
        $scope.init();
        $scope.$digest();

        $scope.removeField('ROLE');

        expect($scope.Requisition.Role).toBe(null);
    });

    it('Could remove location field when user click on "x" button of location label', function(){
        var controller = createJobRequisitionDetailCtrl();
        $scope.init();
        $scope.$digest();

        $scope.removeField('LOCATION');

        expect($scope.Requisition.Group).toBe(null);
    });

    it('Should change value of $scope.isEditingRequisition.Role from true to false or from false to true when clicking button edit/cancel', function(){
        var controller = createJobRequisitionDetailCtrl();
        $scope.$digest();

        $scope.updateRequisitionField('ROLE');
        expect($scope.isEditingRequisition.Role).toBe(true);
    });

    it('Should change value of $scope.isEditingRequisition.Group from true to false or from false to true when clicking button edit/cancel', function(){
        var controller = createJobRequisitionDetailCtrl();
        $scope.$digest();

        $scope.updateRequisitionField('Group');
        expect($scope.isEditingRequisition.Group).toBe(true);
    });

    it('Function "Save as draft" should be worked successfully', function () {
        var controller = createJobRequisitionDetailCtrl();
        $scope.init();
        $scope.$digest();

        var formatRequisition = {
            Owner: null,
            MemberRoleId: 621,
            NetworkGroupId: 11059,
            ContactPerson: null,
            ContactNumber: null,
            JobAdRequisitionId: null,
            JobAdRequisitionState:  null
        };

        $scope.Requisition.formatRequisitionToApi = function(){
            return {
                Owner: null,
                MemberRoleId: 621,
                NetworkGroupId: 11059,
                ContactPerson: null,
                ContactNumber: null,
                JobAdRequisitionId: null,
                JobAdRequisitionState:  null
            }
        }

        $scope.processRequisition($scope.REQUISITION_ACTION.SAVE_AS_DRAFT);
        expect($scope.isLoading).toBe(true);
        expect(mockRequisitionService.createJobRequisition).toHaveBeenCalledWith(formatRequisition);
        $scope.$digest();

        expect($scope.isLoading).toBe(false);
    });

    it('Function "Save" should be worked successfully', function () {
        var controller = createJobRequisitionDetailCtrl();
        $scope.init();
        $scope.$digest();

        var formatRequisition = {
            Owner: null,
            MemberRoleId: 621,
            NetworkGroupId: 11059,
            ContactPerson: null,
            ContactNumber: null,
            JobAdRequisitionId: null,
            JobAdRequisitionState:  null
        };

        $scope.Requisition.formatRequisitionToApi = function(){
            return {
                Owner: null,
                MemberRoleId: 621,
                NetworkGroupId: 11059,
                ContactPerson: null,
                ContactNumber: null,
                JobAdRequisitionId: null,
                JobAdRequisitionState:  null
            }
        }

        $scope.processRequisition($scope.REQUISITION_ACTION.SAVE);
        expect($scope.isLoading).toBe(true);
        expect(mockRequisitionService.createJobRequisition).toHaveBeenCalledWith(formatRequisition);
        $scope.$digest();

        expect($scope.isEditingRequisition.Role).toBe(false);
        expect($scope.isEditingRequisition.Group).toBe(false);
        expect($scope.isEditingRequisition.CanSave).toBe(false);
        expect(controller.tempRequisition).toEqual($scope.Requisition);
        expect($scope.isLoading).toBe(false);
    });

    it('Function "Submit" should be worked successfully', function () {
        var controller = createJobRequisitionDetailCtrl();
        $scope.init();
        $scope.$digest();

        var formatRequisition = {
            Owner: null,
            MemberRoleId: 621,
            NetworkGroupId: 11059,
            ContactPerson: null,
            ContactNumber: null,
            JobAdRequisitionId: null,
            JobAdRequisitionState:  null
        };

        $scope.Requisition.formatRequisitionToApi = function() {
            return {
                Owner: null,
                MemberRoleId: 621,
                NetworkGroupId: 11059,
                ContactPerson: null,
                ContactNumber: null,
                JobAdRequisitionId: null,
                JobAdRequisitionState: null
            }
        }

        $scope.processRequisition($scope.REQUISITION_ACTION.SUBMIT);
        expect($scope.isLoading).toBe(true);
        expect(mockRequisitionService.submitJobRequisition).toHaveBeenCalledWith(formatRequisition);
        $scope.$digest();

        expect($scope.isLoading).toBe(false);

    });

    it('Function "Remove Job Requisition" should be worked successfully', function(){
        var controller = createJobRequisitionDetailCtrl();
        $scope.init();
        $scope.$digest();

        var url = '/recruitments/JobRequisitions/1913';

        $scope.processRequisition($scope.REQUISITION_ACTION.DELETE);
        expect($scope.isLoading).toBe(true);

        expect(mockRequisitionService.deleteRequisition).toHaveBeenCalledWith(url);
        $scope.$digest();

        expect($scope.isLoading).toBe(false);
    });

    it('Function "Approve Job Requisition" should be worked successfully', function(){
        var controller = createJobRequisitionDetailCtrl();
        $scope.init();
        $scope.$digest();

        $scope.Requisition.State = 'Pending';
        var url = '/recruitments/JobRequisitions/1913/process/1';
        var obj = {
            Comment: ''
        }

        $scope.processRequisition($scope.REQUISITION_ACTION.APPROVE);
        expect($scope.isLoading).toBe(true);

        expect(mockRequisitionService.processCommonCase).toHaveBeenCalledWith(url, obj);
        $scope.$digest();
        expect($scope.Requisition.JobRequisitionDetail.State).toBe('Approved');
        expect($scope.isLoading).toBe(false);

    });

    it('Function "Reject Job Requisition" should be worked successfully', function(){
        var controller = createJobRequisitionDetailCtrl();
        $scope.init();
        $scope.$digest();

        $scope.Requisition.State = 'Pending';
        var url = '/recruitments/JobRequisitions/1913/process/3';
        var obj = {
            Comment: ''
        }
        $scope.processRequisition($scope.REQUISITION_ACTION.REJECT);
        expect($scope.isLoading).toBe(true);

        expect(mockRequisitionService.processCommonCase).toHaveBeenCalledWith(url, obj);
        $scope.$digest();

        expect($scope.Requisition.JobRequisitionDetail.State).toBe('Rejected');
        expect($scope.isLoading).toBe(false);

    });

    it('Function "Cancel Job Requisition" should be worked successfully', function(){
        var controller = createJobRequisitionDetailCtrl();
        $scope.init();
        $scope.$digest();

        $scope.Requisition.State = 'Pending';
        var url = '/recruitments/JobRequisitions/1913/process/4';
        var obj = {
            Comment: ''
        }

        $scope.processRequisition($scope.REQUISITION_ACTION.CANCEL);
        expect($scope.isLoading).toBe(true);

        expect(mockRequisitionService.processCommonCase).toHaveBeenCalledWith(url, obj);
        $scope.$digest();

        expect($scope.Requisition.JobRequisitionDetail.State).toBe('Cancelled');
        expect($scope.isLoading).toBe(false);

    });

    it('Function "Archive Job Requisition" should be worked successfully', function(){
        var controller = createJobRequisitionDetailCtrl();
        $scope.init();
        $scope.$digest();

        var url = '/recruitments/JobRequisitions/1913/archive';

        $scope.processRequisition($scope.REQUISITION_ACTION.ARCHIVE);
        expect($scope.isLoading).toBe(true);

        expect(mockRequisitionService.processCommonCase).toHaveBeenCalledWith(url, null);
        $scope.$digest();

        expect($scope.Requisition.JobRequisitionDetail.State).toBe('Archived');
        expect($scope.isLoading).toBe(false);

    });

    it('Function "Excuted Job Requisition" should be worked successfully', function(){
        var controller = createJobRequisitionDetailCtrl();
        $scope.init();
        $scope.$digest();

        var url = '/recruitments/JobRequisitions/1508/execute';
        var obj = {
            Comment: ''
        }

        $scope.processRequisition($scope.REQUISITION_ACTION.EXECUTE);
        expect($scope.isLoading).toBe(true);

        expect(mockRequisitionService.processCommonCase).toHaveBeenCalledWith(url, obj);
        $scope.$digest();

        expect($scope.isLoading).toBe(false);

    });




});