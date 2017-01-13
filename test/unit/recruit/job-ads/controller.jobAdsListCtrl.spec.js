/**
 * Created by trieu.kiem on 6/22/2016.
 */
describe('Unit: Controller:jobAdsListCtrl', function () {

    //#region Prepare data, global variables and services
    var $scope, $timeout, $window, createjobAdsListCtrl, mockJobAdsService, mockDataService;

    beforeEach(function () {
        module('sherpa');
        module('test.services');

        mockJobAdsService = jasmine.createSpyObj('JobAdsService', ['searchJobAds']);

        module(function ($provide) {
            $provide.value('JobAdsService', mockJobAdsService);
        });

        inject(function ($rootScope, $controller, _$timeout_, _$window_, $injector, _mockDataService_) {
            $scope = $rootScope.$new();

            $timeout = _$timeout_;
            $window = _$window_;
            mockDataService = _mockDataService_;

            mockJobAdsService.searchJobAds.and.returnValue(
              _mockDataService_.get('api/recruit/job-ads/list/index.json')
            );

            createjobAdsListCtrl = function () {
                return $controller('jobAdsListCtrl', {
                    '$scope': $scope
                });
            };
        });
    });

    //#endregion

    //#region Define Test Case
    it('should initialization the jobAdsListCtrl and global variables successfully', () => {
        var controller = createjobAdsListCtrl();
        $scope.$digest();

        expect(controller.pageSize).toEqual(10);
        expect(controller.isSearchMode).toBe(false);
        expect($scope.predicate).toEqual('');
        expect($scope.column).toEqual('');
        expect($scope.reverse).toBe(null);
        expect($scope.EntityActionType).not.toBe(null);
        expect($scope.JOB_ADS_ORDER_BY).not.toBe(null);
        expect($scope.JOB_STATUS_CONSTANTS).not.toBe(null);
        expect($scope.jobAdsControls).not.toBe(null);

    });
    //#endregion

});