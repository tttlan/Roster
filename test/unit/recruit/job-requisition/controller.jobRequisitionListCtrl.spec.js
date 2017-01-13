/**
 * Created by nhxtai on 5/16/2016.
 */

describe('Unit: Controller:jobRequisitionListCtrl', function () {

    var $scope, $timeout, $window, createJobRequisitionListCtrl, mockRequisitionService, mockDataService;

    beforeEach(function () {
        module('sherpa');
        module('test.services');

        mockRequisitionService = jasmine.createSpyObj('JobRequisitionService', ['getListRequisition']);
        module(function ($provide) {
            $provide.value('JobRequisitionService', mockRequisitionService);
        });

        inject(function ($rootScope, $controller, _$timeout_, _$window_, $injector, _mockDataService_, _Paths_) {
            $scope = $rootScope.$new();

            $timeout = _$timeout_;
            $window = _$window_;
            mockDataService = _mockDataService_;

            mockRequisitionService.getListRequisition.and.returnValue(
              _mockDataService_.get('api/recruit/job-requisition/list/index.json')
            );

            createJobRequisitionListCtrl = function () {
                return $controller('jobRequisitionListCtrl', {
                    '$scope': $scope
                });
            };
        });
    });

    it('should initialization the jobRequisitionListCtrl and global variables successfully', function () {
        var controller = createJobRequisitionListCtrl();
        $scope.$digest();

        expect($scope.REQUISITION_STATUS).not.toBe(null);
        expect($scope.predicate).toBe('');
        expect($scope.reverse).toBe(null);
        expect($scope.searchString).toBe('');

    });

    it("should to order by list requisition when click on header Requisition Name of table", function () {
        var controller = createJobRequisitionListCtrl();
        $scope.$digest();

        $scope.orderBy('Name');

        expect($scope.reverse).toBe(false);
        expect($scope.predicate).toBe('Name');
    });

    it("should to order by list requisition when click on header Location of table", function () {
        var controller = createJobRequisitionListCtrl();
        $scope.$digest();

        $scope.orderBy('Location');

        expect($scope.reverse).toBe(false);
        expect($scope.predicate).toBe('Location');
    });

    it("should to order by list requisition when click on header Elapse of table", function () {
        var controller = createJobRequisitionListCtrl();
        $scope.$digest();

        $scope.orderBy('Elapse');

        expect($scope.reverse).toBe(false);
        expect($scope.predicate).toBe('Elapse');
    });

    it("should to order by list requisition when click on header Requestor of table", function () {
        var controller = createJobRequisitionListCtrl();
        $scope.$digest();

        $scope.orderBy('Requestor.FirstName');

        expect($scope.reverse).toBe(false);
        expect($scope.predicate).toBe('Requestor.FirstName');
    });

    it("should to order by list requisition when click on header Status of table", function () {
        var controller = createJobRequisitionListCtrl();
        $scope.$digest();

        $scope.orderBy('State');

        expect($scope.reverse).toBe(false);
        expect($scope.predicate).toBe('State');
    });

    it("should to be load data from api successfully", function () {
        var controller = createJobRequisitionListCtrl();
        $scope.$digest();

        $scope.getListRequisition(1);

        expect(mockRequisitionService.getListRequisition).toHaveBeenCalledWith(1, 10, {
            keyWord: '',
            statues: [],
            location: null,
            fromDate: null,
            toDate: null
        });
    });

    it("should be search job requisition when user type text in search box and press enter", function () {
        var controller = createJobRequisitionListCtrl();
       
        $scope.$digest();

        $scope.searchString = 'search Job';
        $scope.predicate = 'Name'; // assume table is ordering by Name
        $scope.reverse = true; //assume table is  descending

        $scope.searchRequisition();
        expect(controller.isSearchMode).toBe(true); // expect is using search function

        // // flush timeout(s) for all code under test.
        // $timeout.flush();
        //
        // // this will throw an exception if there are any pending timeouts.
        // $timeout.verifyNoPendingTasks();
        //
        // expect($scope.predicate).toBe('');
        // expect($scope.reverse).toBe(null);
        // expect(mockRequisitionService.getListRequisition).toHaveBeenCalledWith(1, 10, {
        //    keyWord: 'search Job',
        //    statues: [],
        //    location: null,
        //    fromDate: null,
        //    toDate: null
        // });
    });

    it("should be reset list requisition when user remove text on search box", function() {
        var controller = createJobRequisitionListCtrl();
        $scope.$digest();

        $scope.searchString = 'search Job'; // assume searching requisition like 'search Job'

        $scope.searchRequisition();// need to search first
        expect(controller.isSearchMode).toBe(true); // expect is using search function

        $scope.removeSearchRequistion();
        expect($scope.searchString).toBe('');
    });
});