describe('Unit: Controller:jobRequisitionCreateCtrl', function () {

    var $scope, $q, $timeout, $window, createJobRequisitionCreateCtrl, mockRequisitionService, mockDataService,
        mockNetworks, mockMember;

    beforeEach(function () {
        module('sherpa');
        module('test.services');

        mockRequisitionService = jasmine.createSpyObj('JobRequisitionService', [
            'getRequisitionLocationList',
            'createJobRequisition',
            'submitJobRequisition',
        ]);
        mockNetworks = jasmine.createSpyObj('Networks', [
            'getRolesPromise'
        ]);
        mockMember = jasmine.createSpyObj('Members', [
            'getMyProfile'
        ]);


        module(function ($provide) {
            $provide.value('JobRequisitionService', mockRequisitionService);
            $provide.value('Networks', mockNetworks);
            $provide.value('Members', mockMember);
        });

        inject(function ($rootScope, $controller, _$timeout_, _$q_, _$window_, $injector, _mockDataService_) {
            $scope = $rootScope.$new();
            $q = _$q_;
            $timeout = _$timeout_;
            $window = _$window_;
            mockDataService = _mockDataService_;


            mockNetworks.getRolesPromise.and.returnValue(
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

            mockMember.getMyProfile.and.returnValue(
                mockDataService.get('api/profilemanagement/profilerecord/index.json')
            );


            createJobRequisitionCreateCtrl = function () {
                return $controller('jobRequisitionCreateCtrl', {
                    '$scope': $scope
                });
            };
        });
    });

    it('should initial controller and global variables successfully with right data', function () {
        var controller = createJobRequisitionCreateCtrl();
        $scope.$digest();

        expect($scope.IsLoading).toBe(false);
        expect($scope.ownerInfo).toBe(null);
        expect($scope.locationList).toBe(null);
        expect($scope.roleList).toBe(null);
        expect($scope.Requisition).not.toBe(null);
    });

    it('Function $scope.init should be worked successfully', function () {
        var controller = createJobRequisitionCreateCtrl();
        $scope.$digest();

        $scope.init();
        expect($scope.IsLoading).toBe(true);
        expect($scope.ownerInfo).not.toBe(null);

        $scope.$digest(); // execute call service

        expect($scope.locationList).not.toBe(null);
        expect($scope.locationList.length).toBe(63);
        expect($scope.roleList).not.toBe(null);
        expect($scope.roleList.RoleSummaryItemResults.length).toBe(69);
        expect($scope.ownerInfo).not.toBe({});
        expect($scope.ownerInfo.hasOwnProperty('ProfileRecord')).toBe(true);
        expect($scope.IsLoading).toBe(false);
    });

    it('Function $scope.selectRoleOrLocation should be worked successfully when user selecting ROLE', function () {
        var controller = createJobRequisitionCreateCtrl();
        $scope.$digest();

        expect($scope.Requisition.Role).toBe(null);
        expect($scope.Requisition.Group).toBe(null);

        var expectData = {
            RoleId: 1992,
            Description: "FE Tester"
        };
        $scope.selectRoleOrLocation({
            RoleId: 1992,
            Description: "FE Tester"
        }, "ROLE");

        expect($scope.Requisition.Role).toEqual(expectData);
    });

    it('Function $scope.selectRoleOrLocation should be worked successfully when user selecting LOCATION', function () {
        var controller = createJobRequisitionCreateCtrl();
        $scope.$digest();

        expect($scope.Requisition.Role).toBe(null);
        expect($scope.Requisition.Group).toBe(null);

        var expectData = {
            NetworkGroupId: 1992,
            Description: "HR"
        };
        $scope.selectRoleOrLocation({
            NetworkGroupId: 1992,
            Description: "HR"
        }, "LOCATION");

        expect($scope.Requisition.Group).toEqual(expectData);
    });

    it('Function $scope.removeField should be worked successfully when user discard select ROLE', function () {
        var controller = createJobRequisitionCreateCtrl();
        $scope.$digest();

        //assume user is selecting ROLE
        $scope.Requisition.Role = {
            RoleId: 1992,
            Description: "FE Tester"
        };

        $scope.removeField("ROLE");
        expect($scope.Requisition.Role).toBe(null);
    });

    it('Function $scope.removeField should be worked successfully when user discard select LOCATION', function () {
        var controller = createJobRequisitionCreateCtrl();
        $scope.$digest();

        //assume user is selecting ROLE
        $scope.Requisition.Group = {
            NetworkGroupId: 1992,
            Description: "HR"
        };

        $scope.removeField("LOCATION");
        expect($scope.Requisition.Group).toBe(null);
    });

    it('Function $scope.createJobRequisition should be worked successfully', function () {
        var controller = createJobRequisitionCreateCtrl();
        $scope.$digest();

        $scope.Requisition.Role = {
            RoleId: 1992,
            Description: "FE Tester"
        };
        $scope.Requisition.Group = {
            NetworkGroupId: 1992
        };

        var formatRequisition = {
            Owner: null,
            MemberRoleId: 1992,
            NetworkGroupId: 1992,
            ContactPerson: null,
            ContactNumber: null,
            JobAdRequisitionId: null,
            JobAdRequisitionState:  null
        };

        $scope.createJobRequisition();
        expect($scope.IsLoading).toBe(true);
        expect(mockRequisitionService.createJobRequisition).toHaveBeenCalledWith(formatRequisition);
        $scope.$digest();

        expect($scope.IsLoading).toBe(false);
    });

    it('Function $scope.submitJobRequisition should be worked successfully', function () {
        var controller = createJobRequisitionCreateCtrl();
        $scope.$digest();

        $scope.Requisition.Role = {
            RoleId: 1992,
            Description: "FE Tester"
        };
        $scope.Requisition.Group = {
            NetworkGroupId: 1992
        };

        var formatRequisition = {
            Owner: null,
            MemberRoleId: 1992,
            NetworkGroupId: 1992,
            ContactPerson: null,
            ContactNumber: null,
            JobAdRequisitionId: null,
            JobAdRequisitionState:  null
        };

        $scope.submitJobRequisition();
        expect($scope.IsLoading).toBe(true);
        expect(mockRequisitionService.submitJobRequisition).toHaveBeenCalledWith(formatRequisition);
        $scope.$digest();

        expect($scope.IsLoading).toBe(false);
    });
});