describe('Unit: Service: JobRequisitionService', function () {
    var $q, mockServer, JobRequisitionService, mockDataService, mockNotify,
        Permissions, $rootScope, mockJobRequisitionListModel, mockJobRequisitionDetailModel,
        REQUISITION_URL, API_BASE_URL, FormatRequisition;

    var URL = {};

    beforeEach(function () {
        module('sherpa');
        module('test.services');

        mockJobRequisitionListModel = jasmine.createSpyObj('JobRequisitionListModel', [
            'fromApi'
        ]);
        mockJobRequisitionDetailModel = jasmine.createSpyObj('JobRequisitionDetailModel', [
            'fromApi'
        ]);

        mockServer = jasmine.createSpyObj('$server', [
            'create',
            'get',
            'remove',
            'update'
        ]);

        mockNotify = jasmine.createSpyObj('$notify', [
            'add'
        ]);

        module(function ($provide) {
            $provide.value('$server', mockServer);
            $provide.value('$notify', mockNotify);
            $provide.value('JobRequisitionListModel', mockJobRequisitionListModel);
            $provide.value('JobRequisitionDetailModel', mockJobRequisitionDetailModel);
        });

        inject(function ($injector, _$rootScope_, _$q_, _mockDataService_) {
            $rootScope = _$rootScope_;
            $q = _$q_;
            mockDataService = _mockDataService_;
            Permissions = $injector.get('Permissions');
            FormatRequisition = $injector.get('FormatRequisition');
            JobRequisitionService = $injector.get('JobRequisitionService');
            API_BASE_URL = $injector.get('API_BASE_URL');
            REQUISITION_URL = API_BASE_URL + 'recruitments/JobRequisitions';

            URL = {
                list: REQUISITION_URL + "/search?p=1&ps=10&rc=1",
                action: {
                    create: REQUISITION_URL,
                    submit: REQUISITION_URL + "/submit",
                    delete: REQUISITION_URL + "/" + 1972,
                    cancel: REQUISITION_URL + "/" + 1922 + "/process/4",
                    reject: REQUISITION_URL + "/" + 1958 + "/process/3",
                    approve: REQUISITION_URL + "/" + 1953 + "/process/1",
                    execute: REQUISITION_URL + "/" + 1921 + "/execute",
                    archive: REQUISITION_URL + "/" + 1960 + "/archive"
                },
                detail: {
                    draft: REQUISITION_URL + "/" + 1913,
                    pending: REQUISITION_URL + "/" + 1917,
                    approved: REQUISITION_URL + "/" + 1953,
                    executed: REQUISITION_URL + "/" + 1921,
                    cancelled: REQUISITION_URL + "/" + 1922,
                    rejected: REQUISITION_URL + "/" + 1958,
                    archived: REQUISITION_URL + "/" + 1960
                }
            };

            mockServer.create.and.callFake(function (obj) {
                switch (obj.url) {
                    case URL.list:
                        return mockDataService.get('api/recruit/job-requisition/list/index.json');

                    case URL.action.create:
                        return mockDataService.get('api/recruit/job-requisition/create-as-draft/index.json');

                    case URL.action.submit:
                        return mockDataService.get('api/recruit/job-requisition/submit/index.json');

                    default:
                        break;
                }
            });

            mockServer.get.and.callFake(function (obj) {
                switch (obj.url) {
                    case URL.detail.draft:
                        return mockDataService.get('api/recruit/job-requisition/detail/draft/index.json');

                    case URL.detail.pending:
                        return mockDataService.get('api/recruit/job-requisition/detail/pending/index.json');

                    case URL.detail.approved:
                        return mockDataService.get('api/recruit/job-requisition/detail/approved/index.json');

                    case URL.detail.executed:
                        return mockDataService.get('api/recruit/job-requisition/detail/executed/index.json');

                    case URL.detail.cancelled:
                        return mockDataService.get('api/recruit/job-requisition/detail/cancelled/index.json');

                    case URL.detail.rejected:
                        return mockDataService.get('api/recruit/job-requisition/detail/rejected/index.json');

                    case URL.detail.archived:
                        return mockDataService.get('api/recruit/job-requisition/detail/archived/index.json');

                    default:
                        break;
                }
            });

            mockServer.remove.and.returnValue(
                mockDataService.get('api/recruit/job-requisition/detail/deleted/index.json')
            );

            mockServer.update.and.callFake(function (obj) {
                switch (obj.url) {
                    case URL.action.cancel:
                        return mockDataService.get('api/recruit/job-requisition/detail/cancelled/index.json');

                    case URL.action.reject:
                        return mockDataService.get('api/recruit/job-requisition/detail/rejected/index.json');

                    case URL.action.approve:
                        return mockDataService.get('api/recruit/job-requisition/detail/approved/index.json');

                    case URL.action.execute:
                        return mockDataService.get('api/recruit/job-requisition/detail/executed/index.json');

                    case URL.action.archive:
                        return mockDataService.get('api/recruit/job-requisition/detail/archived/index.json');

                }
            });

            mockJobRequisitionListModel.fromApi.and.callFake(function (res) {
                return {
                    Permissions: Permissions.formatPermissions(res.EntityActions),
                    JobRequisitionItems: res.JobRequisitionSummaryItemResult.map((item) => {
                        return {
                            Id: item.JobRequisitionSummary.JobAdRequisitionId,
                            Name: item.JobRequisitionSummary.RoleTitle,
                            Location: item.JobRequisitionSummary.NetworkGroup.GroupName,
                            CreateDate: item.JobRequisitionSummary.CreatedDateTime,
                            LastUpdateDate: item.JobRequisitionSummary.LastModifiedDateTime,
                            Requestor: FormatRequisition.formatOwner(item.JobRequisitionSummary.Owner),
                            Status: item.JobRequisitionSummary.JobAdRequisitionState,
                            UserCan: Permissions.formatPermissions(item.EntityActions)
                        };
                    })
                }
            });

            mockJobRequisitionDetailModel.fromApi.and.callFake(function (res) {
                var response = res.data.JobRequisitionDetail || [res.data];
                return {
                    Owner: response.Owner ? response.Owner : null,
                    Role: response.Role ? {
                        RoleId: response.Role.RoleId,
                        Description: response.Role.Description
                    } : null,
                    Group: response.Group ? {
                        NetworkGroupId: response.response.Group.NetworkGroupId,
                        GroupName: response.NetworkGroup.GroupName,
                        Type: response.NetworkGroup.Type
                    } : null,
                    ContactPerson: response.ContactPerson ? response.ContactPerson : null,
                    ContactNumber: response.ContactNumber ? response.ContactNumber : null,
                    JobAdRequisitionId: response.JobAdRequisitionId ? response.JobAdRequisitionId : null,
                    CreatedDateTime: response.CreatedDateTime ? response.CreatedDateTime : null,
                    LastModifiedDateTime: response.LastModifiedDateTime ? response.LastModifiedDateTime : null,
                    State: (response.SubState && response.SubState != '') ? response.SubState : response.State,
                    ExecutedJobId: response.ExecutedJobId,
                    Permissions: Permissions.formatPermissions(res.data.EntityActions)
                }
            });
        });
    });

    it('should get right list requisition', function () {
        var obj = {
            keyWord: '',
            statues: [],
            location: null,
            fromDate: null,
            toDate: null
        };

        JobRequisitionService.getListRequisition(1, 10, obj).then(function (rs) {

            expect(mockServer.create).toHaveBeenCalledWith({
                'url': URL.list,
                'data': {
                    "KeyWord": '',
                    "Statuses": [],
                    "Location": null,
                    "FromDate": null,
                    "ToDate": null
                }
            });
            expect(mockJobRequisitionListModel.fromApi).toHaveBeenCalled();

            expect(rs.hasOwnProperty('Permissions')).toBe(true);
            expect(rs.hasOwnProperty('JobRequisitionItems')).toBe(true);
            expect(rs.JobRequisitionItems.length).toBe(10);
            expect(rs.JobRequisitionItems[0].hasOwnProperty('Id')).toBe(true);
            expect(rs.JobRequisitionItems[0].hasOwnProperty('Name')).toBe(true);
            expect(rs.JobRequisitionItems[0].hasOwnProperty('Location')).toBe(true);
            expect(rs.JobRequisitionItems[0].hasOwnProperty('CreateDate')).toBe(true);
            expect(rs.JobRequisitionItems[0].hasOwnProperty('LastUpdateDate')).toBe(true);
            expect(rs.JobRequisitionItems[0].hasOwnProperty('Requestor')).toBe(true);
            expect(rs.JobRequisitionItems[0].hasOwnProperty('Status')).toBe(true);
            expect(rs.JobRequisitionItems[0].hasOwnProperty('UserCan')).toBe(true);
        });
        $rootScope.$digest();
    });

    it("should save as draft new requisition successfully, after then show notification", function () {
        var postObj =
            {
                Owner: null,
                MemberRoleId: 890,
                NetworkGroupId: 11059,
                ContactPerson: null,
                ContactNumber: null,
                JobAdRequisitionId: null,
                JobAdRequisitionState: null
            };

        JobRequisitionService.createJobRequisition(postObj).then(function (res) {
            expect(mockServer.create).toHaveBeenCalledWith({
                'url': URL.action.create,
                'data': postObj
            });

            expect(res.status).toBe(200);

            expect(mockNotify.add).toHaveBeenCalledWith({
                message: 'Saved job requisition successfully!',
                type: 'success',
                visible: true
            });

        });

        $rootScope.$digest();
    });

    it("should submit new requisition successfully, after then show notification", function () {
        var postObj =
            {
                Owner: null,
                MemberRoleId: 890,
                NetworkGroupId: 11059,
                ContactPerson: null,
                ContactNumber: null,
                JobAdRequisitionId: null,
                JobAdRequisitionState: null
            };

        JobRequisitionService.submitJobRequisition(postObj).then(function (res) {
            expect(mockServer.create).toHaveBeenCalledWith({
                'url': URL.action.submit,
                'data': postObj
            });
            expect(mockNotify.add).toHaveBeenCalledWith({
                message: 'Submitted job requisition successfully!',
                type: 'success',
                visible: true
            });
            expect(mockJobRequisitionDetailModel.fromApi).toHaveBeenCalled();

            expect(res.hasOwnProperty('Owner')).toBe(true);
            expect(res.hasOwnProperty('Role')).toBe(true);
            expect(res.hasOwnProperty('Group')).toBe(true);
            expect(res.hasOwnProperty('ContactPerson')).toBe(true);
            expect(res.hasOwnProperty('ContactNumber')).toBe(true);
            expect(res.hasOwnProperty('JobAdRequisitionId')).toBe(true);
            expect(res.hasOwnProperty('CreatedDateTime')).toBe(true);
            expect(res.hasOwnProperty('LastModifiedDateTime')).toBe(true);
            expect(res.hasOwnProperty('State')).toBe(true);
            expect(res.State).toBe('Pending');
            expect(res.hasOwnProperty('ExecutedJobId')).toBe(true);
            expect(res.hasOwnProperty('Permissions')).toBe(true);
        });

        $rootScope.$digest();
    });

    it('should return right data and right format when get detail of DRAFT requisition', function () {
        var requisitionId = 1913;
        JobRequisitionService.getJobRequisition(requisitionId).then(function (res) {
            expect(mockServer.get).toHaveBeenCalledWith({
                'url': URL.detail.draft
            });
            expect(mockJobRequisitionDetailModel.fromApi).toHaveBeenCalled();

            expect(res.hasOwnProperty('Owner')).toBe(true);
            expect(res.hasOwnProperty('Role')).toBe(true);
            expect(res.hasOwnProperty('Group')).toBe(true);
            expect(res.hasOwnProperty('ContactPerson')).toBe(true);
            expect(res.hasOwnProperty('ContactNumber')).toBe(true);
            expect(res.hasOwnProperty('JobAdRequisitionId')).toBe(true);
            expect(res.JobAdRequisitionId).toBe(requisitionId);
            expect(res.hasOwnProperty('CreatedDateTime')).toBe(true);
            expect(res.hasOwnProperty('LastModifiedDateTime')).toBe(true);
            expect(res.hasOwnProperty('State')).toBe(true);
            expect(res.State).toBe('Draft');
            expect(res.hasOwnProperty('ExecutedJobId')).toBe(true);
            expect(res.hasOwnProperty('Permissions')).toBe(true);
        });
        $rootScope.$digest();
    });

    it('should return right data and right format when get detail of PENDING requisition', function () {
        var requisitionId = 1917;
        JobRequisitionService.getJobRequisition(requisitionId).then(function (res) {
            expect(mockServer.get).toHaveBeenCalledWith({
                'url': URL.detail.pending
            });
            expect(mockJobRequisitionDetailModel.fromApi).toHaveBeenCalled();

            expect(res.hasOwnProperty('Owner')).toBe(true);
            expect(res.hasOwnProperty('Role')).toBe(true);
            expect(res.hasOwnProperty('Group')).toBe(true);
            expect(res.hasOwnProperty('ContactPerson')).toBe(true);
            expect(res.hasOwnProperty('ContactNumber')).toBe(true);
            expect(res.hasOwnProperty('JobAdRequisitionId')).toBe(true);
            expect(res.JobAdRequisitionId).toBe(requisitionId);
            expect(res.hasOwnProperty('CreatedDateTime')).toBe(true);
            expect(res.hasOwnProperty('LastModifiedDateTime')).toBe(true);
            expect(res.hasOwnProperty('State')).toBe(true);
            expect(res.State).toBe('Pending');
            expect(res.hasOwnProperty('ExecutedJobId')).toBe(true);
            expect(res.hasOwnProperty('Permissions')).toBe(true);
        });
        $rootScope.$digest();
    });

    it('should return right data and right format when get detail of APPROVED requisition', function () {
        var requisitionId = 1953;
        JobRequisitionService.getJobRequisition(requisitionId).then(function (res) {
            expect(mockServer.get).toHaveBeenCalledWith({
                'url': URL.detail.approved
            });
            expect(mockJobRequisitionDetailModel.fromApi).toHaveBeenCalled();

            expect(res.hasOwnProperty('Owner')).toBe(true);
            expect(res.hasOwnProperty('Role')).toBe(true);
            expect(res.hasOwnProperty('Group')).toBe(true);
            expect(res.hasOwnProperty('ContactPerson')).toBe(true);
            expect(res.hasOwnProperty('ContactNumber')).toBe(true);
            expect(res.hasOwnProperty('JobAdRequisitionId')).toBe(true);
            expect(res.JobAdRequisitionId).toBe(requisitionId);
            expect(res.hasOwnProperty('CreatedDateTime')).toBe(true);
            expect(res.hasOwnProperty('LastModifiedDateTime')).toBe(true);
            expect(res.hasOwnProperty('State')).toBe(true);
            expect(res.State).toBe('Approved');
            expect(res.hasOwnProperty('ExecutedJobId')).toBe(true);
            expect(res.hasOwnProperty('Permissions')).toBe(true);
        });
        $rootScope.$digest();
    });

    it('should return right data and right format when get detail of EXECUTED requisition', function () {
        var requisitionId = 1921;
        JobRequisitionService.getJobRequisition(requisitionId).then(function (res) {
            expect(mockServer.get).toHaveBeenCalledWith({
                'url': URL.detail.executed
            });
            expect(mockJobRequisitionDetailModel.fromApi).toHaveBeenCalled();

            expect(res.hasOwnProperty('Owner')).toBe(true);
            expect(res.hasOwnProperty('Role')).toBe(true);
            expect(res.hasOwnProperty('Group')).toBe(true);
            expect(res.hasOwnProperty('ContactPerson')).toBe(true);
            expect(res.hasOwnProperty('ContactNumber')).toBe(true);
            expect(res.hasOwnProperty('JobAdRequisitionId')).toBe(true);
            expect(res.JobAdRequisitionId).toBe(requisitionId);
            expect(res.hasOwnProperty('CreatedDateTime')).toBe(true);
            expect(res.hasOwnProperty('LastModifiedDateTime')).toBe(true);
            expect(res.hasOwnProperty('State')).toBe(true);
            expect(res.State).toBe('Executed');
            expect(res.hasOwnProperty('ExecutedJobId')).toBe(true);
            expect(res.hasOwnProperty('Permissions')).toBe(true);
        });
        $rootScope.$digest();
    });

    it('should return right data and right format when get detail of CANCELLED requisition', function () {
        var requisitionId = 1922;
        JobRequisitionService.getJobRequisition(requisitionId).then(function (res) {
            expect(mockServer.get).toHaveBeenCalledWith({
                'url': URL.detail.cancelled
            });
            expect(mockJobRequisitionDetailModel.fromApi).toHaveBeenCalled();

            expect(res.hasOwnProperty('Owner')).toBe(true);
            expect(res.hasOwnProperty('Role')).toBe(true);
            expect(res.hasOwnProperty('Group')).toBe(true);
            expect(res.hasOwnProperty('ContactPerson')).toBe(true);
            expect(res.hasOwnProperty('ContactNumber')).toBe(true);
            expect(res.hasOwnProperty('JobAdRequisitionId')).toBe(true);
            expect(res.JobAdRequisitionId).toBe(requisitionId);
            expect(res.hasOwnProperty('CreatedDateTime')).toBe(true);
            expect(res.hasOwnProperty('LastModifiedDateTime')).toBe(true);
            expect(res.hasOwnProperty('State')).toBe(true);
            expect(res.State).toBe('Cancelled');
            expect(res.hasOwnProperty('ExecutedJobId')).toBe(true);
            expect(res.hasOwnProperty('Permissions')).toBe(true);
        });
        $rootScope.$digest();
    });

    it('should return right data and right format when get detail of REJECTED requisition', function () {
        var requisitionId = 1958;
        JobRequisitionService.getJobRequisition(requisitionId).then(function (res) {
            expect(mockServer.get).toHaveBeenCalledWith({
                'url': URL.detail.rejected
            });
            expect(mockJobRequisitionDetailModel.fromApi).toHaveBeenCalled();

            expect(res.hasOwnProperty('Owner')).toBe(true);
            expect(res.hasOwnProperty('Role')).toBe(true);
            expect(res.hasOwnProperty('Group')).toBe(true);
            expect(res.hasOwnProperty('ContactPerson')).toBe(true);
            expect(res.hasOwnProperty('ContactNumber')).toBe(true);
            expect(res.hasOwnProperty('JobAdRequisitionId')).toBe(true);
            expect(res.JobAdRequisitionId).toBe(requisitionId);
            expect(res.hasOwnProperty('CreatedDateTime')).toBe(true);
            expect(res.hasOwnProperty('LastModifiedDateTime')).toBe(true);
            expect(res.hasOwnProperty('State')).toBe(true);
            expect(res.State).toBe('Rejected');
            expect(res.hasOwnProperty('ExecutedJobId')).toBe(true);
            expect(res.hasOwnProperty('Permissions')).toBe(true);
        });
        $rootScope.$digest();
    });

    it('should return right data and right format when get detail of ARCHIVED requisition', function () {
        var requisitionId = 1960;
        JobRequisitionService.getJobRequisition(requisitionId).then(function (res) {
            expect(mockServer.get).toHaveBeenCalledWith({
                'url': URL.detail.archived
            });
            expect(mockJobRequisitionDetailModel.fromApi).toHaveBeenCalled();

            expect(res.hasOwnProperty('Owner')).toBe(true);
            expect(res.hasOwnProperty('Role')).toBe(true);
            expect(res.hasOwnProperty('Group')).toBe(true);
            expect(res.hasOwnProperty('ContactPerson')).toBe(true);
            expect(res.hasOwnProperty('ContactNumber')).toBe(true);
            expect(res.hasOwnProperty('JobAdRequisitionId')).toBe(true);
            expect(res.JobAdRequisitionId).toBe(requisitionId);
            expect(res.hasOwnProperty('CreatedDateTime')).toBe(true);
            expect(res.hasOwnProperty('LastModifiedDateTime')).toBe(true);
            expect(res.hasOwnProperty('State')).toBe(true);
            expect(res.State).toBe('Archived');
            expect(res.hasOwnProperty('ExecutedJobId')).toBe(true);
            expect(res.hasOwnProperty('Permissions')).toBe(true);
        });
        $rootScope.$digest();
    });

    it('should delete a requisition successfully and data return from API has state is "Deleted"', function () {
        var requisitionId = 1972;
        var url = "recruitments/JobRequisitions/" + requisitionId;
        JobRequisitionService.deleteRequisition(url).then(function (res) {
            expect(mockServer.remove).toHaveBeenCalledWith({
                'url': URL.action.delete
            });
            expect(mockJobRequisitionDetailModel.fromApi).toHaveBeenCalled();
            expect(res.hasOwnProperty('Owner')).toBe(true);
            expect(res.hasOwnProperty('Role')).toBe(true);
            expect(res.hasOwnProperty('Group')).toBe(true);
            expect(res.hasOwnProperty('ContactPerson')).toBe(true);
            expect(res.hasOwnProperty('ContactNumber')).toBe(true);
            expect(res.hasOwnProperty('JobAdRequisitionId')).toBe(true);
            expect(res.JobAdRequisitionId).toBe(requisitionId);
            expect(res.hasOwnProperty('CreatedDateTime')).toBe(true);
            expect(res.hasOwnProperty('LastModifiedDateTime')).toBe(true);
            expect(res.hasOwnProperty('State')).toBe(true);
            expect(res.State).toBe('Deleted');
            expect(res.hasOwnProperty('ExecutedJobId')).toBe(true);
            expect(res.hasOwnProperty('Permissions')).toBe(true);
        });
        $rootScope.$digest();
    });

    it('should cancel a requisition successfully and data return from API has state is "Cancelled" ', function () {
        var comment = {
            Comment: ''
        };
        var url = 'recruitments/JobRequisitions/1922/process/4';
        JobRequisitionService.processCommonCase(url, comment).then(function (res) {
            expect(mockServer.update).toHaveBeenCalledWith({
                'url': URL.action.cancel,
                'data': comment
            });
            expect(mockJobRequisitionDetailModel.fromApi).toHaveBeenCalled();

            expect(res.hasOwnProperty('State')).toBe(true);
            expect(res.State).toBe('Cancelled');
        });
        $rootScope.$digest();
    });

    it('should reject a requisition successfully and data return from API has state is "Rejected" ', function () {
        var comment = {
            Comment: ''
        };
        var url = 'recruitments/JobRequisitions/1958/process/3';
        JobRequisitionService.processCommonCase(url, comment).then(function (res) {
            expect(mockServer.update).toHaveBeenCalledWith({
                'url': URL.action.reject,
                'data': comment
            });
            expect(mockJobRequisitionDetailModel.fromApi).toHaveBeenCalled();

            expect(res.hasOwnProperty('State')).toBe(true);
            expect(res.State).toBe('Rejected');
        });
        $rootScope.$digest();
    });

    it('should approve a requisition successfully and data return from API has state is "Approved" ', function () {
        var comment = {
            Comment: ''
        };
        var url = 'recruitments/JobRequisitions/1953/process/1';
        JobRequisitionService.processCommonCase(url, comment).then(function (res) {
            expect(mockServer.update).toHaveBeenCalledWith({
                'url': URL.action.approve,
                'data': comment
            });
            expect(mockJobRequisitionDetailModel.fromApi).toHaveBeenCalled();

            expect(res.hasOwnProperty('State')).toBe(true);
            expect(res.State).toBe('Approved');
        });
        $rootScope.$digest();
    });

    it('should execute a requisition successfully and data return from API has state is "Executed" ', function () {
        var comment = {
            Comment: ''
        };
        var url = 'recruitments/JobRequisitions/1921/execute';
        JobRequisitionService.processCommonCase(url, comment).then(function (res) {
            expect(mockServer.update).toHaveBeenCalledWith({
                'url': URL.action.execute,
                'data': comment
            });
            expect(mockJobRequisitionDetailModel.fromApi).toHaveBeenCalled();

            expect(res.hasOwnProperty('State')).toBe(true);
            expect(res.State).toBe('Executed');
        });
        $rootScope.$digest();
    });

    it('should archive a requisition successfully and data return from API has state is "Archived" ', function () {
        var comment = {
            Comment: ''
        };
        var url = 'recruitments/JobRequisitions/1960/archive';
        JobRequisitionService.processCommonCase(url, comment).then(function (res) {
            expect(mockServer.update).toHaveBeenCalledWith({
                'url': URL.action.archive,
                'data': comment
            });
            expect(mockJobRequisitionDetailModel.fromApi).toHaveBeenCalled();

            expect(res.hasOwnProperty('State')).toBe(true);
            expect(res.State).toBe('Archived');
        });
        $rootScope.$digest();
    });
});