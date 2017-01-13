angular.module('ui.recruit.job-requisition')
    .controller('jobRequisitionListCtrl',
        [
            '$scope', '$modal', '$window', '$q', '$timeout', 'Paths', 'JobRequisitionService', 'REQUISITION_STATUS', '$location', 'EntityActionType',
            function($scope, $modal, $window, $q, $timeout, Paths, JobRequisitionService, REQUISITION_STATUS, $location, EntityActionType) {

                var _this = this;
                //#region Define globle variable
                $scope.EntityActionType = EntityActionType;
                $scope.REQUISITION_STATUS = REQUISITION_STATUS;
                $scope.predicate = ''; // default is not order by 
                $scope.reverse = null;
                $scope.searchString = '';

                _this.isSearchMode = false; // detect when we use Search function
                _this.pageSize = 10; // get 10 item per page

                //#endregion

                //#region redirectToCreatePage function
                $scope.redirectToCreatePage = () => {
                    //$window.location = Paths.get('recruit.requisition.create').path;
                    $location.path(Paths.get('recruit.requisition.create').path);
                };
                //#endfunction

                //#region redirectToDetail function
                $scope.redirectToDetail = (id) => {
                    $location.path(Paths.get('recruit.requisition.detail', id).path);
                };
                //#endregion

                //#region orderBy function
                $scope.orderBy = (predicate) => {

                    if (predicate === 'State') {
                        var reverse = _.isEqual($scope.predicate, ['StatePriority', '-LastDateUpdate']) ? !$scope.reverse : false;

                        if (reverse) {
                            predicate = ['-StatePriority', 'LastDateUpdate'];
                        } else {
                            predicate = ['StatePriority', '-LastDateUpdate'];
                        }
                        $scope.reverse = null;
                    }
                    else {
                        $scope.reverse = _.isEqual($scope.predicate, predicate) ? !$scope.reverse : false;
                    }
                    $scope.predicate = predicate;
                };
                //#endregion       

                //#region getListRequisition function
                $scope.getListRequisition = (page) => {

                    //build object body
                    var obj = {
                        keyWord: $scope.searchString,
                        statues: [], // don't need this property at this time ..so  default is empty
                        location: null, // don't need this property at this time ..so  default is Null
                        fromDate: null, //don't need this property at this time ..so  default is Null
                        toDate: null //don't need this property at this time ..so  default is Null  
                    };
                    return JobRequisitionService.getListRequisition(page, _this.pageSize, obj)
                        .then(function(res) {
                            $scope.ListRequisition = res.data;
                            res.data = res.data.JobRequisitionItems;
                            return res;
                        });
                };
                //#endregion

                //#region searchRequisition function
                $scope.searchRequisition = () => {
                    _this.isSearchMode = true;
                    resetListRequisition();
                };
                //#endregion

                //#region removeSearchRequisition function
                $scope.removeSearchRequisition = () => {
                    $scope.searchString = '';
                    if (_this.isSearchMode) {
                        resetListRequisition();
                    }
                };
                //#endregion

                //#region onSearchStringChanged function
                $scope.onSearchStringChanged = () => {
                    if ($scope.searchString === '' && _this.isSearchMode) {
                        resetListRequisition();
                    }
                };
                //#enderegion

                //#region private function

                var resetListRequisition = () => {
                    $timeout(() => {
                            $scope.predicate = ''; // reset order by
                            $scope.reverse = null; //reset direction
                            $scope.page.search(); // clean current data in table
                        },
                        0);
                };
                //#endregion

                //#region Maybe reuse in future --- DONT DELETE IT

                //$scope.openFilterModal = function() {
                //    var modal = $modal.open({
                //        templateUrl: '/interface/views/recruit/job-requisition/partials/modal-requisition-filter.html',
                //        templateType: 'drawer',
                //        controller: SHRP.ctrl.SearchFilterCTRL,
                //        scope: $scope,
                //        title: 'Search Filter',
                //        resolve: {

                //        }
                //    });
                //};

                //$scope.openTemplateModal = function() {
                //    var modal = $modal.open({
                //        templateUrl: '/interface/views/recruit/job-requisition/partials/modal-requisition-template.html',
                //        templateType: 'drawer',
                //        controller: SHRP.ctrl.RequisitionTemplateCTRL,
                //        scope: $scope,
                //        classes: 'modal-requisition-template',
                //        title: 'Requisition Templates',
                //        resolve: {

                //        }
                //    });
                //};

                //#endregion

            }
        ]);