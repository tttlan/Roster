angular.module('ui.recruit.candidatepool')
    .controller('candidatePoolListCtrl', [
        '$scope', '$modal', 'CandidatePoolService', '$filter', '$timeout', function($scope, $modal, CandidatePoolService, $filter, $timeout) {

            //#region Define globle variables

            $scope.fakeTags = [];
            $scope.selectAll = false;
            $scope.fakeCandidates = [
                {
                    id: 1,
                    firstName: 'Trieu',
                    lastName: 'Kiem Nhut',
                    avatar: '/interface/images/avatar2.jpg',
                    email: 'kntrieu@tma.com.vn',
                    label: 1,
                    star: 1,
                    tags: [
                        { id: 1, label: 'Group A' },
                        { id: 2, label: '2015' },
                        { id: 3, label: 'MH' }
                    ],
                    openApplications: [
                        {
                            title: 'Test Analyst',
                            warning: 1,
                            description: 'Part time, Vietnam',
                            label: { title: 'new', value: 1, type: 1 },
                            progress: 89,
                            date: '1 Oct 2015'
                        },
                        {
                            title: 'Test Analyst dsd dssd dssdsd',
                            warning: 0,
                            description: 'Full time, Vietnam',
                            label: { title: 'Assessing', value: 2, type: 2 },
                            progress: 20,
                            date: '4 Oct 2015'
                        },
                    ],
                    warning: 1,
                    blacklist: 0,
                    isSelected: false
                },

                {
                    id: 2,
                    firstName: 'Tai',
                    lastName: 'Nguyen Huynh Xuan',
                    avatar: '/interface/images/avatar.jpg',
                    email: 'nhxtai@tma.com.vn',
                    label: 2,
                    star: 0,
                    tags: [
                        { id: 1, label: 'Group A' },
                        { id: 2, label: '2015' },
                        { id: 3, label: 'MH' },
                        { id: 4, label: 'New Tag' }
                    ],
                    openApplications: [
                        {
                            title: 'Frontend',
                            warning: 1,
                            description: 'Part time, Cambodia',
                            label: { title: 'Assessing', value: 3, type: 2 },
                            progress: 89,
                            date: '1 Feb 2015'
                        },
                        {
                            title: 'Backend',
                            warning: 1,
                            description: 'Full time, Thailand',
                            label: { title: 'New', value: 1, type: 1 },
                            progress: 45,
                            date: '4 Dec 2015'
                        },
                        {
                            title: 'UX Design',
                            warning: 0,
                            description: 'Full time, Laos',
                            label: { title: 'Assessing', value: 1, type: 2 },
                            progress: 20,
                            date: '20 Jan 2015'
                        },
                    ],
                    warning: 0,
                    blacklist: 1,
                    isSelected: false
                },

                {
                    id: 3,
                    firstName: 'Trong',
                    lastName: 'Cao Duc',
                    avatar: '/interface/images/avatar3.jpg',
                    email: 'cdtrong@tma.com.vn',
                    label: 1,
                    star: 0,
                    tags: [
                        { id: 1, label: 'Group A' },
                        { id: 2, label: '2015' },
                        { id: 3, label: 'MH' },
                        { id: 4, label: 'New Tag' },
                        { id: 5, label: 'WTH' }
                    ],
                    openApplications: [
                        {
                            title: 'Vietnam next top model',
                            warning: 0,
                            description: 'Fulltime, USA',
                            label: { title: 'Assessing', value: 3, type: 2 },
                            progress: 89,
                            date: '5 Jun 2015'
                        },
                    ],
                    warning: 0,
                    blacklist: 0,
                    isSelected: false
                },

                {
                    id: 4,
                    firstName: 'Nhai',
                    lastName: 'Bui Thi',
                    avatar: '/interface/images/avatar2.jpg',
                    email: 'btnhai@tma.com.vn',
                    label: 2,
                    star: 1,
                    tags: [
                        { id: 1, label: 'Group A' },
                        { id: 2, label: '2015' },
                        { id: 3, label: 'MH' },
                        { id: 4, label: 'Tags' },
                        { id: 5, label: 'dsdsdsd' },
                        { id: 6, label: 'MH1' },
                        { id: 7, label: 'KNT' },
                        { id: 7, label: 'Short name' }
                    ],
                    openApplications: [
                        {
                            title: 'Test Analyst',
                            warning: 1,
                            description: 'Part time, Vietnam',
                            label: { title: 'new', value: 1, type: 1 },
                            progress: 89,
                            date: '1 Oct 2015'
                        },
                        {
                            title: 'Test Analyst dsd dssd dssdsd',
                            warning: 0,
                            description: 'Full time, Vietnam',
                            label: { title: 'Assessing', value: 2, type: 2 },
                            progress: 20,
                            date: '4 Oct 2015'
                        },
                    ],
                    warning: 1,
                    blacklist: 0,
                    isSelected: false
                },

                {
                    id: 5,
                    firstName: 'Ho',
                    lastName: 'Nguyen Dinh',
                    avatar: '/interface/images/avatar3.jpg',
                    email: 'ndho@tma.com.vn',
                    label: 2,
                    star: 0,
                    tags: [
                        { id: 1, label: 'Group A' },
                    ],
                    openApplications: [
                        {
                            title: 'Test Analyst',
                            warning: 1,
                            description: 'Part time, Vietnam',
                            label: { title: 'new', value: 1, type: 1 },
                            progress: 89,
                            date: '1 Oct 2015'
                        },
                        {
                            title: 'Fake application',
                            warning: 0,
                            description: 'Full time, Vietnam',
                            label: { title: 'Assessing', value: 2, type: 2 },
                            progress: 20,
                            date: '4 Oct 2015'
                        },

                        {
                            title: 'Test Analyst dsd dssd dssdsd',
                            warning: 0,
                            description: 'Part time, Vietnam',
                            label: { title: 'Assessing', value: 2, type: 2 },
                            progress: 20,
                            date: '4 Oct 2015'
                        },

                        {
                            title: 'Test application',
                            warning: 0,
                            description: 'Full time, Vietnam',
                            label: { title: 'Assessing', value: 2, type: 2 },
                            progress: 20,
                            date: '4 Oct 2015'
                        },
                    ],
                    warning: 0,
                    blacklist: 1,
                    isSelected: false
                },

                {
                    id: 5,
                    firstName: 'Lan',
                    lastName: 'Tran Thi Thuy',
                    avatar: '/interface/images/avatar2.jpg',
                    email: 'tttlan@tma.com.vn',
                    label: 1,
                    star: 1,
                    tags: [],
                    openApplications: [
                        {
                            title: 'Test Analyst',
                            warning: 1,
                            description: 'Part time, Vietnam',
                            label: { title: 'new', value: 1, type: 1 },
                            progress: 89,
                            date: '1 Oct 2015'
                        },
                        {
                            title: 'Fake application',
                            warning: 0,
                            description: 'Full time, Vietnam',
                            label: { title: 'Assessing', value: 2, type: 2 },
                            progress: 20,
                            date: '4 Oct 2015'
                        },
                    ],
                    warning: 0,
                    blacklist: 0,
                    isSelected: false
                }
            ];
            $scope.filterOptions = $scope.$parent.filterOptions || [ // for get older data

                {
                    Header: 'Candidate',
                    Options:
                    [
                        {
                            Title: 'Requires attention',
                            TemplateUrl: '/interface/views/recruit/candidate-pool/partials/modal-require-attention-filter.html',
                            Controller: SHRP.ctrl.FilterRequireAttentionCTRL,
                            Selected: []
                        },
                        {
                            Title: 'Starred or Blacklisted',
                            TemplateUrl: '/interface/views/recruit/candidate-pool/partials/modal-starred-blacklisted-filter.html',
                            Controller: SHRP.ctrl.FilterStarredOrBlacklistedCTRL,
                            Selected: []
                        },
                        {
                            Title: 'Tags',
                            TemplateUrl: '/interface/views/recruit/candidate-pool/partials/modal-tags-filter.html',
                            Controller: SHRP.ctrl.FilterTagsCTRL,
                            Selected: []
                        },
                        {
                            Title: 'Internal or External',
                            TemplateUrl: '/interface/views/recruit/candidate-pool/partials/modal-internal-external-filter.html',
                            Controller: SHRP.ctrl.FilterInternalOrExternalCTRL,
                            Selected: []
                        },
                        {
                            Title: 'Profile or Applications',
                            TemplateUrl: '/interface/views/recruit/candidate-pool/partials/modal-profile-application-filter.html',
                            Controller: SHRP.ctrl.FilterProfileOrApplicationCTRL,
                            Selected: []
                        },
                        {
                            Title: 'Postcode',
                            TemplateUrl: '/interface/views/recruit/candidate-pool/partials/modal-postcode-filter.html',
                            Selected: []
                        }
                    ]
                },
                {
                    Header: 'Application',
                    Options:
                    [
                        {
                            Title: 'Status',
                            TemplateUrl: '/interface/views/recruit/candidate-pool/partials/modal-status-filter.html',
                            Selected: []
                        },
                        {
                            Title: 'Suitability Score',
                            TemplateUrl: '/interface/views/recruit/candidate-pool/partials/modal-suitability-score-filter.html',
                            Selected: []
                        },
                        {
                            Title: 'Application Time',
                            TemplateUrl: '/interface/views/recruit/candidate-pool/partials/modal-application-time-filter.html',
                            Selected: []
                        },
                        {
                            Title: 'Source',
                            TemplateUrl: '/interface/views/recruit/candidate-pool/partials/modal-source-filter.html',
                            Selected: []
                        }
                    ]
                },
                {
                    Header: 'Job',
                    Options:
                    [
                        {
                            Title: 'Specific Job',
                            TemplateUrl: '/interface/views/recruit/candidate-pool/partials/modal-require-specific-job-filter.html',
                            Selected: []
                        },
                        {
                            Title: 'Job Location',
                            TemplateUrl: '/interface/views/recruit/candidate-pool/partials/modal-job-location-filter.html',
                            Selected: []
                        },
                        {
                            Title: 'Role',
                            TemplateUrl: '/interface/views/recruit/candidate-pool/partials/modal-role-filter.html',
                            Selected: []
                        }
                    ]
                }
            ];
            $scope.filterMode = false;
            $scope.openedList = [];
            $scope.selectedCandidates = [];
            $scope.candidateListSumary = null;
            $scope.page = 1;
            $scope.isLoadingMore = false;
            $scope.filterObj = {
                s: null,
                po: null,
                l: null,
                t: null,
                so: null,
                ta: null,
                ns: null,
                c: null,
                p: 1,
                ps: 10,
                o: null
            };

            $scope.tableFilter = {};

            $scope.currentFilter = null;
            $scope.isShowSearchResult = false;
            $scope.SearchResult = null;
            $scope.tempContainer = null;
            $scope.prevList = null;
            $scope.AllCandidates = null;

            //#endregion

            //#region Public functions

            //#region openFilterPanel function
            $scope.openFilterPanel = function() {
                var modal = $modal.open({
                    templateUrl: '/interface/views/recruit/candidate-pool/partials/modal-addfilter.html',
                    templateType: 'drawer',
                    controller: 'candidatePoolListCtrl',
                    scope: $scope,
                    title: 'Add Filter',
                    resolve: {

                    }
                });
            };
            //#endregion

            //#region openAddToBlacklistModal function
            $scope.openAddToBlacklistModal = function(id, index) {
                var modal = $modal.open({
                    templateUrl: '/interface/views/recruit/candidate-pool/partials/modal-add-to-blacklist.html',
                    controller: SHRP.ctrl.AddToBlacklistCTRL,
                    title: 'Add to blacklist',
                    resolve: {
                        data: function() {
                            return {
                                id: id,
                                index: index
                            };
                        }
                    }
                });

                modal.result.then(function(rs) {
                    var blackListObj = rs;
                    addToBlackList(blackListObj);
                });
            };
            //#endregion

            //#region addToBlackList function
            $scope.addToBlackList = function() {
                var obj = $scope.getSelectedCandidateId();
                var idList = obj.ids;
                var indexs = obj.indexs;
                if (idList.length > 0 && idList.length < 2) { // Add single candidate to blacklist with a reason
                    var candidateId = idList[0];
                    var index = indexs[0];
                    $scope.openAddToBlacklistModal(candidateId, index);
                } else if (idList.length >= 2) {
                    addMultipleCandidateToBlackList(obj);
                    console.log('Add multi candidates to blacklist without a reason');
                }
            };
            //#endregion

            //#region removeMultiCandidatesFromBlackList
            $scope.removeMultiCandidatesFromBlackList = function() {
                var obj = $scope.getSelectedCandidateId();
                removeMultiCandidatesFromBlackList(obj, obj.ids.length);
            };
            //#endregion removeMultiCandidatessFromBlackList function

            //#region openSubFilterModal function
            $scope.openSubFilterModal = function(opt) {
                var modal = $modal.open({
                    templateUrl: opt.TemplateUrl,
                    templateType: 'drawer',
                    controller: opt.Controller,
                    classes: 'sub-modal--filer',
                    title: opt.Title,
                    resolve: {
                        option: function() {
                            return opt;
                        },
                        removeFilter: function() {
                            return function(rs) {
                                var index = null;
                                for (var i = 0; i < $scope.$parent.fakeTags.length; i++) {
                                    if ($scope.$parent.fakeTags[i].unique === rs) {
                                        removeFilterAttribute($scope.$parent.fakeTags[i]);
                                        index = i;
                                        break;
                                    }
                                }

                                $scope.$parent.fakeTags.splice(index, 1);
                                $scope.$parent.filterMode = ($scope.$parent.fakeTags.length === 0) ? false : true;
                            };
                        }
                    }
                });

                modal.result.then(function(rs) {
                    switch (rs.unique) {
                        case 0:
                        case 1:
                        case 2:
                        case 3:
                        case 4:
                        case 5:
                            $scope.filterOptions[0].Options[rs.unique].Selected = [];
                            $scope.filterOptions[0].Options[rs.unique].Selected.push(rs.label);
                            $scope.$parent.filterOptions[0].Options[rs.unique].Selected = [];
                            $scope.$parent.filterOptions[0].Options[rs.unique].Selected.push(rs.label);
                            break;

                        case 6:
                        case 7:
                        case 8:
                        case 9:
                            break;

                        case 10:
                        case 11:
                        case 12:
                            break;
                    }

                    //add filter to list fakeTags
                    var isExistedFilter = false;
                    var index = null;
                    for (var i = 0; i < $scope.$parent.fakeTags.length; i++) {
                        if ($scope.$parent.fakeTags[i].unique === rs.unique) {
                            index = i;
                            isExistedFilter = true;
                            break;
                        }
                    }

                    if (isExistedFilter) {
                        $scope.$parent.fakeTags[index].label = rs.label;
                    }
                    else {
                        if (rs.unique === 2) {
                            var arrayLabels = rs.label;
                            var tempLabel = '';
                            angular.forEach(arrayLabels, function(label, index) {
                                tempLabel = (tempLabel === '') ? (tempLabel + label.label) : (tempLabel + ', ' + label.label);
                            });

                            rs.label = tempLabel;
                            $scope.$parent.fakeTags.push(rs);
                        } else {
                            $scope.$parent.fakeTags.push(rs);
                            $scope.currentFilter = rs;

                            switch ($scope.currentFilter.unique) {
                                case 1:
                                    addFilterByStarredOrBlackList();
                                    break;
                                case 2:
                                case 3:
                                    addFilterByInternalOrExternal();
                                    break;
                            }

                        }
                    }
                });
            };
            //#endregion

            //#region removeFilterTag function
            $scope.removeFilterTag = function(index) {
                var item = $scope.fakeTags[index];
                removeTableFilterAttribute(item);
                $scope.fakeTags.splice(index, 1);
                $scope.filterMode = ($scope.fakeTags.length === 0) ? false : true;
                switch (item.unique) {
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                        $scope.filterOptions[0].Options[item.unique].Selected = [];
                        break;

                    case 6:
                    case 7:
                    case 8:
                    case 9:
                        break;

                    case 10:
                    case 11:
                    case 12:
                        break;
                }

            };
            //#endregion

            //#region collapseOrExpand
            $scope.collapseOrExpand = function(index) {

                var position = $scope.openedList.indexOf(index);
                if (position > -1) {
                    // Close
                    $scope.openedList.splice(position, 1);
                } else {
                    // Open
                    $scope.openedList.push(index);
                    var candidateId = $scope.candidateListSumary.Candidates[index].MemberId;
                    getJobHistories(candidateId, index);
                }
            };
            //#endregion

            //#region openAllCandidates function
            $scope.openAllCandidates = function(count) {
                var newArray = [];
                if ($scope.openedList.length !== count) {
                    for (var i = 0; i < count; i++) {
                        var candidateId = $scope.candidateListSumary.Candidates[i].MemberId;
                        getJobHistories(candidateId, i);
                        newArray.push(i);
                    }
                    $scope.openedList = newArray;
                } else {
                    $scope.openedList = [];
                }
            };
            //#endregion

            //#region seelectAllRecords
            $scope.selectAllRecords = function(value) {
                $scope.selectAll = value;
                angular.forEach($filter('filter')($scope.candidateListSumary.Candidates, $scope.tableFilter), function(candidate, index) {
                    candidate.IsSelected = value;
                });
            };
            //#endregion

            //#region checkSelectAll
            $scope.checkSelectAll = function() {
                var length = $scope.candidateListSumary.Candidates.length;
                var count = 0;
                angular.forEach($scope.candidateListSumary.Candidates, function(candidate, index) {
                    if (candidate.IsSelected === true) count++;
                });

                $scope.selectAll = (count === length) ? true : false;
            };
            //#endregion

            //#region checkIsSelected
            $scope.checkIsSelected = function(candidate) {
                return candidate.IsSelected === true;
            };
            //#endregion

            //#region getCandidate
            $scope.getCandidate = function(candidateId) {
                getSingleCandidate(candidateId);
            };
            //#endregion

            //#region searchCandidates
            $scope.searchCandidates = function() {
                $scope.filterObj.p = 1;
                if ($scope.filterObj.s.trim().length > 0) {
                    $scope.isShowSearchResult = true;
                    clearAndBackupResult();
                    searchCandidates($scope.filterObj);
                }
            };
            //#endregion

            //#region resetResult
            $scope.resetResult = function() {
                $scope.isShowSearchResult = false;
                resetResult();
            };
            //#endregion

            //#region filterCandidateCanSelect function
            //Note : this function is used to filter candidates can be selected on listCandidateSummary
            //       depend on checked/unchecked candidate's status : Blacklist or Starred or Normal
            $scope.filterCandidatesCanSelect = function(candidate) {
                if (candidate.IsSelected) {
                    if (candidate.IsStarredByCurrentManager === true) {
                        angular.forEach($scope.candidateListSumary.Candidates, function(cd, index) {
                            if (cd.MemberId !== candidate.MemberId && cd.IsStarredByCurrentManager === false) {
                                cd.CanSelect = false;
                            }
                        });
                        $scope.candidateListSumary.IsSelectingStatus = 'Starred';
                    } else if (candidate.IsBlackList === true) {
                        angular.forEach($scope.candidateListSumary.Candidates, function(cd, index) {
                            if (cd.MemberId !== candidate.MemberId && cd.IsBlackList === false) {
                                cd.CanSelect = false;
                            }
                        });
                        $scope.candidateListSumary.IsSelectingStatus = 'Blacklisted';
                    } else {
                        angular.forEach($scope.candidateListSumary.Candidates, function(cd, index) {
                            if (cd.MemberId !== candidate.MemberId && (cd.IsBlackList === true || cd.IsStarredByCurrentManager === true)) {
                                cd.CanSelect = false;
                            }
                        });
                        $scope.candidateListSumary.IsSelectingStatus = 'Normal';
                    }
                } else {
                    var count = countSelected();
                    if (count === 0) {
                        angular.forEach($scope.candidateListSumary.Candidates, function(cd, index) {
                            cd.CanSelect = true;
                        });
                    }
                }
            };
            //#endregion

            //#region openModalAddTag function
            $scope.openModalAddTag = function(candidate) {
                var modal = $modal.open({
                    templateUrl: '/interface/views/recruit/candidate-pool/partials/modal-add-tag-for-candidate.html',
                    controller: SHRP.ctrl.AddTagForCandidateCTRL,
                    title: 'Add tag for candidate',
                    resolve: {
                        candidate: function() {
                            return candidate;
                        }
                    }
                });

                modal.result.then(function(rs) { // rs is list tag which is added on modal
                    candidate.Tags = candidate.Tags.concat(rs); // add rs into list current Tags of candidate
                });
            };
            //#endregion

            //#region removeSingleTagForCandidate function
            //Note: this function used to delete a tag for a candidate
            $scope.removeSingleTagForCandidate = function(candidate, tag) {
                //TODO : call Api delete tag for candidate

                var index = candidate.Tags.indexOf(tag);
                candidate.Tags.splice(index, 1);
            };
            //#endregion

            //#endregion

            //#region Feature functions

            // Init infomation
            init();

            function init() {
                //Get candidate list
                getCandateList();
            }

            //On click to get more candidate
            $scope.getMoreCandidate = function() {
                getMoreCandidate();
            };

            $scope.getMoreResult = function() {
                getMoreResult();
            };

            //Function refresh  candidates list
            $scope.refreshCandidatesList = function() {
                if ($scope.isShowSearchResult === false) {
                    clearAndBackupResult();
                    $scope.page = 1;
                    getCandateList();
                } else {
                    $scope.filterObj.p = 1;
                    $scope.searchCandidates();
                }
            };

            $scope.getSelectedCandidateId = function() {
                var ids = [];
                var indexs = [];
                angular.forEach($scope.candidateListSumary.Candidates, function(candidate, index) {
                    if (candidate.IsSelected === true) {
                        ids.push(candidate.MemberId);
                        indexs.push(index);
                    }
                });
                return {
                    ids: ids,
                    indexs: indexs
                };
            };



            $scope.makeAsStar = function() {
                var obj = $scope.getSelectedCandidateId();
                var idList = obj.ids;
                var indexs = obj.indexs;
                angular.forEach(idList, function(id, index) {
                    makeAsStar(id, indexs[index]);
                });
            };

            $scope.unStar = function() {
                var obj = $scope.getSelectedCandidateId();
                var idList = obj.ids;
                var indexs = obj.indexs;
                angular.forEach(idList, function(id, index) {
                    unStar(id, indexs[index]);
                });
            };


            // Function get Candidate list
            function getCandateList() {
                var obj = {
                    p: $scope.page,
                    ps: 10
                };

                CandidatePoolService.getCandidatesByNetwork(obj).then(function(res) {
                    $scope.candidateListSumary = res;
                    $scope.candidateListSumary.IsSelectingStatus = '';
                });

            }

            // Function get all candidate
            function getAllCandidates() {
                var obj = {
                    p: 1,
                    ps: $scope.candidateListSumary.Pagination.TotalCount,
                };

                CandidatePoolService.getCandidatesByNetwork(obj).then(function(res) {
                    $scope.AllCandidates = res;
                });
            }


            //Function get more candidate
            function getMoreCandidate() {
                $scope.page++;
                $scope.isLoadingMore = true;
                var obj = {
                    p: $scope.page,
                    ps: 10
                };

                var status = $scope.candidateListSumary.IsSelectingStatus;

                CandidatePoolService.getCandidatesByNetwork(obj).then(function(res) {
                    $scope.isLoadingMore = false;
                    angular.forEach(res.Candidates, function(candidate, index) {
                        if (status === 'Starred') {
                            if (candidate.IsBlackList === true || candidate.IsStarredByCurrentManager === false) {
                                candidate.CanSelect = false;
                            }
                        } else if (status === 'Blacklisted') {
                            if (candidate.IsBlackList === false || candidate.IsStarredByCurrentManager === true) {
                                candidate.CanSelect = false;
                            }
                        } else if (status === 'Normal') {
                            if (candidate.IsBlackList === true || candidate.IsStarredByCurrentManager === true) {
                                candidate.CanSelect = false;
                            }
                        }

                        $scope.candidateListSumary.Candidates.push(candidate);
                    });
                });
            }

            //Function get more search result
            function getMoreResult() {

                $scope.filterObj.p++;
                $scope.isLoadingMore = true;
                var newObj = createFilterObj($scope.filterObj);
                var status = $scope.candidateListSumary.IsSelectingStatus;
                CandidatePoolService.filterCandidates(newObj).then(function(res) {
                    $scope.isLoadingMore = false;
                    angular.forEach(res.Candidates, function(candidate, index) {
                        if (status === 'Starred') {
                            if (candidate.IsBlackList === true || candidate.IsStarredByCurrentManager === false) {
                                candidate.CanSelect = false;
                            }
                        } else if (status === 'Blacklisted') {
                            if (candidate.IsBlackList === false || candidate.IsStarredByCurrentManager === true) {
                                candidate.CanSelect = false;
                            }
                        } else if (status === 'Normal') {
                            if (candidate.IsBlackList === true || candidate.IsStarredByCurrentManager === true) {
                                candidate.CanSelect = false;
                            }
                        }

                        $scope.candidateListSumary.Candidates.push(candidate);
                    });
                });
            }

            function getSingleCandidate(candidateId) {
                CandidatePoolService.getJobHistories(candidateId).then(function(res) {
                });
            }

            function getJobHistories(candidateId, index) {
                if ($scope.candidateListSumary.Candidates[index].CandidateApplicationHistory === null) {
                    $scope.candidateListSumary.Candidates[index].IsLoading = true;
                    CandidatePoolService.getJobHistories(candidateId).then(function(res) {
                        $scope.candidateListSumary.Candidates[index].IsLoading = false;
                        $scope.candidateListSumary.Candidates[index].CandidateApplicationHistory = res;
                    });
                }
            }

            function searchCandidates(obj) {
                var newObj = createFilterObj(obj);
                CandidatePoolService.filterCandidates(newObj).then(function(res) {
                    $scope.candidateListSumary = res;
                });
            }

            function createFilterObj(obj) {
                var newObj = {};
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        if (obj[key] !== null) {
                            newObj[key] = obj[key];
                        }
                    }
                }
                return newObj;
            }

            function clearAndBackupResult() {
                if ($scope.tempContainer === null) {
                    $scope.tempContainer = angular.copy($scope.candidateListSumary);
                }

                $scope.candidateListSumary = null;
            }

            function resetResult() {
                $scope.candidateListSumary = null;
                $scope.candidateListSumary = angular.copy($scope.tempContainer);
                $scope.tempContainer = null;
                $scope.filterObj.s = '';
                $scope.filterObj.p = 1;
                $scope.openedList = [];
            }

            function makeAsStar(id, index) {
                $scope.candidateListSumary.Candidates[index].IsSettingStar = true;
                CandidatePoolService.makeAsStar(id).then(function(res) {
                    $timeout(function() {
                        $scope.candidateListSumary.Candidates[index].IsSettingStar = false;
                        $scope.candidateListSumary.Candidates[index].IsStarredByCurrentManager = true; // set candidate star to true
                        $scope.candidateListSumary.Candidates[index].IsSelected = false; // unckeck checkbox
                    }, 0);
                    //console.log(res);
                }, function(reason) {
                    $scope.candidateListSumary.Candidates[index].IsSettingStar = false;
                });
            }

            function unStar(id, index) {
                $scope.candidateListSumary.Candidates[index].IsSettingStar = true;
                CandidatePoolService.unStar(id).then(function(res) {
                    $timeout(function() {
                        $scope.candidateListSumary.Candidates[index].IsSettingStar = false;
                        $scope.candidateListSumary.Candidates[index].IsSelected = false; // unckeck checkbox
                        $scope.candidateListSumary.Candidates[index].IsStarredByCurrentManager = false; // set star candidate  to false
                    }, 0);

                }, function(reason) {
                    $scope.candidateListSumary.Candidates[index].IsSettingStar = false;
                });
            }

            function addToBlackList(obj) {
                var blackListObj = obj;
                var index = blackListObj.index;
                $scope.candidateListSumary.Candidates[index].IsSettingStar = true;
                var query = {
                    candidateId: blackListObj.candidateId,
                    reason: blackListObj.reason
                };

                CandidatePoolService.addToBlackList(query).then(function(res) {
                    $scope.candidateListSumary.Candidates[index].IsSettingStar = false;
                    $scope.candidateListSumary.Candidates[index].IsBlackList = true;
                    $scope.candidateListSumary.Candidates[index].IsSelected = false;
                }, function(reason) {
                    $scope.candidateListSumary.Candidates[index].IsSettingStar = false;
                });

            }

            function addMultipleCandidateToBlackList(obj) {
                
                var candidateIds = obj.ids;
                var indexs = obj.indexs;
                angular.forEach(indexs, function(index, i) {
                    $scope.candidateListSumary.Candidates[index].IsSettingStar = true;
                });
                CandidatePoolService.addMultibleCandidatesToBlackList(candidateIds).then(function(res) {
                    angular.forEach(indexs, function(index, i) {
                        $scope.candidateListSumary.Candidates[index].IsSettingStar = false;
                        $scope.candidateListSumary.Candidates[index].IsBlackList = true;
                        $scope.candidateListSumary.Candidates[index].IsSelected = false;
                    });
                }, function(reason) {
                    angular.forEach(indexs, function(index, i) {
                        $scope.candidateListSumary.Candidates[index].IsSettingStar = false;
                    });
                });
            }

            function removeMultiCandidatesFromBlackList(obj, length) {
                var ids = obj.ids;
                var indexs = obj.indexs;
                var idIndex = ids.length - length;
                var candidateId = ids[idIndex];
                var index = indexs[idIndex];

                if (length > 0) {
                    $scope.candidateListSumary.Candidates[index].IsSettingStar = true;
                    CandidatePoolService.removeFromBlackList($scope.candidateListSumary.Candidates[index]).then(function(res) {
                        $scope.candidateListSumary.Candidates[index].IsSettingStar = false;
                        $scope.candidateListSumary.Candidates[index].IsBlackList = false;
                        $scope.candidateListSumary.Candidates[index].IsSelected = false;
                        removeMultiCandidatesFromBlackList(obj, length - 1);
                    }, function(reason) {
                        $scope.candidateListSumary.Candidates[index].IsSettingStar = true;
                        removeMultiCandidatesFromBlackList(obj, length - 1);
                    });
                }
            }

            function addFilterByStarredOrBlackList() {
                $scope.$parent.filterMode = true;
                if ($scope.currentFilter.label === 'Starred') {
                    if ($scope.$parent.tableFilter.IsBlackList) {
                        delete $scope.$parent.tableFilter.IsBlackList;
                    }
                    $scope.$parent.tableFilter.IsStarredByCurrentManager = true;
                } else {
                    if ($scope.$parent.tableFilter.IsStarredByCurrentManager) {
                        delete $scope.$parent.tableFilter.IsStarredByCurrentManager;
                    }
                    $scope.$parent.tableFilter.IsBlackList = true;
                }
            }

            function addFilterByInternalOrExternal() {
                $scope.$parent.filterMode = true;
                if ($scope.currentFilter.label === 'Internal') {
                    $scope.$parent.tableFilter.MemberType = 'e';
                } else {
                    $scope.$parent.tableFilter.MemberType = 'j';
                }
            }

            function removeFilterAttribute(tag) {
                switch (tag.unique) {
                    case 0:
                    case 1:
                        if ($scope.$parent.tableFilter.IsBlackList) {
                            delete $scope.$parent.tableFilter.IsBlackList;
                        } else {
                            delete $scope.$parent.tableFilter.IsStarredByCurrentManager;
                        }
                        break;
                    case 2:
                    case 3:
                        delete $scope.$parent.tableFilter.MemberType;
                        break;
                }
            }

            function removeTableFilterAttribute(tag) {
                switch (tag.unique) {
                    case 0:
                    case 1:
                        if ($scope.tableFilter.IsBlackList) {
                            delete $scope.tableFilter.IsBlackList;
                        } else {
                            delete $scope.tableFilter.IsStarredByCurrentManager;
                        }
                        break;
                    case 2:
                    case 3:
                        delete $scope.tableFilter.MemberType;
                        break;
                }
            }

            function countSelected() {
                var result = 0;
                angular.forEach($scope.candidateListSumary.Candidates, function(candidate, index) {
                    if (candidate.IsSelected === true) {
                        result++;
                    }
                });

                return result;
            }


            //#endregion
        }
    ])

    .controller('candidatePoolDetailCtrl', [
        '$scope', '$routeParams', '$q', 'CandidatePoolService', function($scope, $routeParams, $q, CandidatePoolService) {

            //#region global variable
            $scope.isLoadingPage = true;
            $scope.jobInterest = {};
            $scope.candidateProfile = {};
            //#endregion

            var currentCandidateId = $routeParams.id;

            $scope.initPage = function() {
                CandidatePoolService.getCandidate(currentCandidateId).then(function(rs) {
                    CandidatePoolService.getJobHistories(currentCandidateId).then(function(data) {
                        $scope.isLoadingPage = false;

                        $scope.jobInterest.$editing = '';
                        $scope.jobInterest.$edit = function(opt) {
                            $scope.jobInterest.$editing = opt;
                        };
                        $scope.jobInterest.$cancelEdit = function() {
                            $scope.jobInterest.$editing = '';
                        };

                        $scope.currentCandidate = rs;
                        $scope.currentCandidate.$editing = '';
                        $scope.currentCandidate.$edit = function(opt) {
                            $scope.currentCandidate.$editing = opt;
                        };
                        $scope.currentCandidate.$cancelEdit = function() {
                            $scope.currentCandidate.$editing = '';
                        };

                    });
                });
            };
        }
    ]);

var SHRP = SHRP || {};
SHRP.ctrl = SHRP.ctrl || {};

//#region Controller Template for modal
// Maybe need to define some CTRL for directive or anythig
// Same format below:
//SHRP.ctrl.ModalCreateFolderCTRL = ['$scope', '$modalInstance', function ($scope, $modalInstance) {

//    $scope.ok = function () {
//        // check there is actually some data in there
//        if ($scope.data.name && $scope.data.name.length) {

//            $modalInstance.close($scope.data);
//        }
//    };

//    $scope.cancel = function () {
//        $modalInstance.dismiss('cancel');
//    };
//}];
//#endregion

SHRP.ctrl.FilterRequireAttentionCTRL = ['$scope', '$modal', '$modalInstance', 'option', 'removeFilter',
    function($scope, $modal, $modalInstance, option, removeFilter) {

        $scope.selectedOption = option;
        $scope.myValue = $scope.selectedOption.Selected.length > 0 ? $scope.selectedOption.Selected[0] : '';

        $scope.close = function() {
            $modalInstance.close({ unique: 0, label: $scope.myValue });
        };

        $scope.removeFilter = function() {
            removeFilter(0);
            $scope.myValue = '';
            $scope.selectedOption.Selected = [];
            // $modalInstance.close(null);
        };
    }];

SHRP.ctrl.FilterStarredOrBlacklistedCTRL = ['$scope', '$modal', '$modalInstance', 'option', 'removeFilter',
    function($scope, $modal, $modalInstance, option, removeFilter) {

        $scope.selectedOption = option;
        $scope.myValue = $scope.selectedOption.Selected.length > 0 ? $scope.selectedOption.Selected[0] : '';

        $scope.close = function() {
            $modalInstance.close({ unique: 1, label: $scope.myValue });
        };

        $scope.removeFilter = function() {
            removeFilter(1);
            $scope.myValue = '';
            $scope.selectedOption.Selected = [];
            // $modalInstance.close(null);
        };
    }];

SHRP.ctrl.FilterInternalOrExternalCTRL = ['$scope', '$modal', '$modalInstance', 'option', 'removeFilter',
    function($scope, $modal, $modalInstance, option, removeFilter) {

        $scope.selectedOption = option;
        $scope.myValue = $scope.selectedOption.Selected.length > 0 ? $scope.selectedOption.Selected[0] : '';

        $scope.close = function() {
            $modalInstance.close({ unique: 3, label: $scope.myValue });
        };

        $scope.removeFilter = function() {
            removeFilter(3);
            $scope.myValue = '';
            $scope.selectedOption.Selected = [];
            // $modalInstance.close(null);
        };
    }];

SHRP.ctrl.FilterProfileOrApplicationCTRL = ['$scope', '$modal', '$modalInstance', 'option', 'removeFilter',
    function($scope, $modal, $modalInstance, option, removeFilter) {

        $scope.selectedOption = option;
        $scope.myValue = $scope.selectedOption.Selected.length > 0 ? $scope.selectedOption.Selected[0] : '';

        $scope.close = function() {
            $modalInstance.close({ unique: 4, label: $scope.myValue });
        };

        $scope.removeFilter = function() {
            removeFilter(4);
            $scope.myValue = '';
            $scope.selectedOption.Selected = [];
            // $modalInstance.close(null);
        };
    }];

SHRP.ctrl.AddToBlacklistCTRL = ['$scope', '$modal', '$modalInstance', 'data',
    function($scope, $modal, $modalInstance, data) {
        $scope.reason = '';
        $scope.ok = function() {
            $modalInstance.close({
                candidateId: data.id,
                reason: $scope.reason,
                index: data.index,
            });
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    }];

SHRP.ctrl.AddTagForCandidateCTRL = ['$scope', '$modal', '$modalInstance', 'CandidatePoolService', 'candidate',
function($scope, $modal, $modalInstance, CandidatePoolService, candidate) {

    $scope.ok = function() {

        //TODO : call api PUT canidate tags (not available now)
        
        $modalInstance.close($scope.allTag);
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

    $scope.addTag = function($item) {
        var index = $scope.jobTagsSumary.JobTagItemResults.indexOf($item);
        if (index > -1) {
            $scope.jobTagsSumary.JobTagItemResults.splice(index, 1);
            $scope.allTag.push($item);
        }
    };

    function getJobTags() {
        CandidatePoolService.getJobTags().then(function(res) {
            $scope.jobTagsSumary = res;
            //$scope.jobTagsSumary.JobTagItemResults = angular.copy($scope.fakeTags); // This is fake tags
            $scope.jobTagsSumary.JobTagItemResults = res.JobTagItemResults;
            //if ($scope.addedTags.length > 0) {
            //    var ids = $scope.addedTags.map(function (tag) {
            //        return tag.id;
            //    });
            //    angular.forEach($scope.jobTagsSumary.JobTagItemResults, function (tag, i) {
            //        var id = tag.id;
            //        var index = ids.indexOf(id);
            //        if (index > -1) {
            //            $scope.jobTagsSumary.JobTagItemResults.splice(i, 1);
            //        }
            //    });
            //}
        });
    }

    getJobTags();
}];

SHRP.ctrl.FilterTagsCTRL = ['$scope', '$modal', '$modalInstance', 'option', 'removeFilter', 'CandidatePoolService',
    function($scope, $modal, $modalInstance, option, removeFilter, CandidatePoolService) {

        $scope.jobTagsSumary = null;
        $scope.fakeTags = [
            {
                id: 1,
                label: 'Trieu Kiem'
            },
            {
                id: 2,
                label: 'Tai Nguyen'
            },
            {
                id: 3,
                label: 'Ho Nguyen'
            },
            {
                id: 4,
                label: 'Xuan Tran'
            },
            {
                id: 5,
                label: 'Lan Tran'
            },
            {
                id: 6,
                label: 'Nhai Bui'
            },
            {
                id: 7,
                label: 'Trong Cao'
            },
            {
                id: 8,
                label: 'Dat Le'
            }
        ];
        $scope.selectedOption = option;

        $scope.myValue = null;
        $scope.addedTags = $scope.selectedOption.Selected.length > 0 ? $scope.selectedOption.Selected[0] : [];
        $scope.getJobTags = function() {
            getJobTags();
        };

        $scope.getJobTags();

        $scope.close = function() {
            $scope.myValue = $scope.addedTags;
            $modalInstance.close({ unique: 2, label: $scope.myValue });
        };

        $scope.removeFilter = function() {
            removeFilter(4);
            angular.forEach($scope.addedTags, function(tag, index) {
                $scope.jobTagsSumary.JobTagItemResults.push(tag);
            });

            $scope.addedTags = [];
            $scope.selectedOption.Selected = [];
        };

        $scope.addTagManual = function(tag) {
            var index = $scope.jobTagsSumary.JobTagItemResults.indexOf(tag);
            if (index > -1) {
                $scope.jobTagsSumary.JobTagItemResults.splice(index, 1);
                $scope.addedTags.push(tag);
            }
        };

        $scope.removeTag = function(index) {
            $scope.jobTagsSumary.JobTagItemResults.push($scope.addedTags[index]);
            $scope.addedTags.splice(index, 1);
        };

        function getJobTags() {
            CandidatePoolService.getJobTags().then(function(res) {
                $scope.jobTagsSumary = res;
                //$scope.jobTagsSumary.JobTagItemResults = angular.copy($scope.fakeTags); // This is fake tags
                $scope.jobTagsSumary.JobTagItemResults = res.JobTagItemResults;
                if ($scope.addedTags.length > 0) {
                    var ids = $scope.addedTags.map(function(tag) {
                        return tag.id;
                    });
                    angular.forEach($scope.jobTagsSumary.JobTagItemResults, function(tag, i) {
                        var id = tag.id;
                        var index = ids.indexOf(id);
                        if (index > -1) {
                            $scope.jobTagsSumary.JobTagItemResults.splice(i, 1);
                        }
                    });
                }
            });
        }
    }];
