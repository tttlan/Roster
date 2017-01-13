angular.module('ui.recruit')

    .directive('jobDetailsBoards', ['$q', '$notify', 'PathContants', function ($q, $notify, PathContants) {

        return {
            restrict: 'E',
            require: "^form",
            scope: {
                boards: '=',
                form: '=',
                id: '=',
                networkId: '=',
                statusCode: '='
            },
            templateUrl: '/interface/views/recruit/job-details/partials/job-details-boards.html',
            controller: ['$scope', 'JobAdsService','JobStatusConstants', function ($scope, JobAdsService,JobStatusConstants) {
                let originalBoards = angular.copy($scope.boards);

                $scope.JOB_STATUS_CONSTANTS =  JobStatusConstants; 
                $scope.tableBoardsLoading = false;
                $scope.sortingArrows = {
                    boardSortingArrow: true,
                    statusSortingArrow: true,
                    expirySortingArrow: true,
                    usedForSortingArrow: true,
                    applicantSortingArrow: true
                }

                let JOB_BOARD_LOGO_URL = PathContants.JOB_BOARD_LOGO;
                let JOB_BOARD_INTERNAL_LOGO_URL = '/client/' + $scope.networkId + '/common/profile/consolelogo.gif';

                // get logo for best source here since it was get from model -- trick here
                if($scope.boards.maxApplicationPercentBoard.source === 'internal' || $scope.boards.maxApplicationPercentBoard.source === 'website'){
                    $scope.boards.maxApplicationPercentBoard.logo = JOB_BOARD_INTERNAL_LOGO_URL;
                }

                $scope.turnOnDefaultAd = function (expiredDateCustomDate, expiredDateDefaultDate, expiredDateDefaultViewDate) {
                    //default value date 30 days from today Ex : "2016-06-09T13:47:33+07:00"
                    var defaultDate = moment().add(30, 'days').format();
                    $scope.boards[expiredDateCustomDate] = null;
                    $scope.boards[expiredDateDefaultDate] = defaultDate;
                    $scope.boards[expiredDateDefaultViewDate] = moment(defaultDate).format("MM/DD/YYYY");
                };

                $scope.updateViewExpiredDate = function (expiredDateCustomDate, expiredDateCustomViewDate) {
                    var viewDate = moment($scope.boards[expiredDateCustomDate]);
                    var now = moment();
                    if (viewDate.diff(now, 'days') + 1 > 0) {
                        //Caculation days from today
                        $scope.boards[expiredDateCustomViewDate] = viewDate.diff(now, 'days') + 1;
                    }
                };

                $scope.countExpiredDate = function (date) {
                    var countDay = moment(date);
                    var now = moment();
                    return countDay.diff(now, 'days') >= 0 ? countDay.diff(now, 'days') + 1 : 0;
                };

                $scope.countUsedForDate = function (date) {
                    var countDay = moment(date);
                    var now = moment();
                    return now.diff(countDay, 'days') >= 0 ? now.diff(countDay, 'days') + 1 : 0;
                };

                $scope.JobBoards = []; //This is a Hack that deals with the race condition as $scope.boards may not be loaded starting at this line 'HasBoard: $scope.boards.hasSherpaInternal'
                let fixing = $scope.$watch('boards', (newVal) => {
                    if (newVal) {
                        $scope.setJobBoards();
                        fixing();
                    }
                });

                $scope.setJobBoards = () => {
                    $scope.JobBoards = [
                        {
                            Type: 'Internal',
                            HasBoard: $scope.boards.hasSherpaInternal,
                            ApplicationCount: $scope.boards.siApplicationCount,
                            ApplicationPercent: $scope.boards.siApplicationPercent,
                            Logo: JOB_BOARD_INTERNAL_LOGO_URL,
                            UsedFor: $scope.boards.siUpdatedDate,
                            State: $scope.boards.siActive,
                            Expiry: $scope.boards.siExpiredDate,
                            IsEdit: false

                        },
                        {
                            Type: 'Website',
                            HasBoard: $scope.boards.hasSherpaWebSite,
                            ApplicationCount: $scope.boards.swApplicationCount,
                            ApplicationPercent: $scope.boards.swApplicationPercent,
                            Logo: JOB_BOARD_INTERNAL_LOGO_URL,
                            UsedFor: $scope.boards.swUpdatedDate,
                            State: $scope.boards.swActive,
                            Expiry: $scope.boards.swExpiredDate,
                            IsEdit: false

                        },
                        {
                            Type: 'Seek',
                            HasBoard: $scope.boards.hasSeek,
                            ApplicationCount: $scope.boards.seApplicationCount,
                            ApplicationPercent: $scope.boards.seApplicationPercent,
                            Logo: JOB_BOARD_LOGO_URL + $scope.boards.seLogo,
                            UsedFor: $scope.boards.seUpdatedDate,
                            State: $scope.boards.seActive,
                            Expiry: $scope.boards.seExpiredDateDefault,
                            IsEdit: false

                        },
                        {
                            Type: 'OneShift',
                            HasBoard: $scope.boards.hasOneShift,
                            ApplicationCount: $scope.boards.onApplicationCount,
                            ApplicationPercent: $scope.boards.onApplicationPercent,
                            Logo: JOB_BOARD_LOGO_URL + $scope.boards.onLogo,
                            UsedFor: $scope.boards.onUpdatedDate,
                            State: $scope.boards.onActive,
                            Expiry: $scope.boards.onExpiredDateDefault,
                            IsEdit: false

                        },
                        {
                            Type: 'CareerOne',
                            HasBoard: $scope.boards.hasCareerOne,
                            ApplicationCount: $scope.boards.caApplicationCount,
                            ApplicationPercent: $scope.boards.caApplicationPercent,
                            Logo: JOB_BOARD_LOGO_URL + $scope.boards.caLogo,
                            UsedFor: $scope.boards.caUpdatedDate,
                            State: $scope.boards.caActive,
                            Expiry: $scope.boards.caExpiredDateDefault,
                            IsEdit: false

                        },
                        {
                            Type: 'Twitter',
                            HasBoard: $scope.boards.hasTwitter,
                            ApplicationCount: $scope.boards.twApplicationCount,
                            ApplicationPercent: $scope.boards.twApplicationPercent,
                            Logo: JOB_BOARD_LOGO_URL + $scope.boards.twLogo,
                            UsedFor: $scope.boards.twUpdatedDate,
                            State: $scope.boards.twActive,
                            Expiry: $scope.boards.twExpiredDate,
                            IsEdit: false

                        },
                        {
                            Type: 'Facebook',
                            HasBoard: $scope.boards.hasFacebook,
                            ApplicationCount: $scope.boards.fbApplicationCount,
                            ApplicationPercent: $scope.boards.fbApplicationPercent,
                            Logo: JOB_BOARD_LOGO_URL + $scope.boards.fbLogo,
                            UsedFor: $scope.boards.fbUpdatedDate,
                            State: $scope.boards.fbActive,
                            Expiry: $scope.boards.fbExpiredDate,
                            IsEdit: false

                        }
                    ];
                }

                /**
                 * Toggle the right arrow for sorting
                 * @param column
                 */
                $scope.toggleSortingArrow = (column) => {
                    switch (column) {
                        case 'board':
                            $scope.sortingArrows.boardSortingArrow = !$scope.sortingArrows.boardSortingArrow;
                            $scope.orderByColumn('Logo', $scope.sortingArrows.boardSortingArrow);
                            break;
                        case 'State':
                            $scope.sortingArrows.statusSortingArrow = !$scope.sortingArrows.statusSortingArrow;
                            $scope.orderByColumn('State', $scope.sortingArrows.statusSortingArrow);
                            break;
                        case 'Expiry':
                            $scope.sortingArrows.expirySortingArrow = !$scope.sortingArrows.expirySortingArrow;
                            $scope.orderByColumn('Expiry', $scope.sortingArrows.expirySortingArrow);
                            break;
                        case 'UsedFor':
                            $scope.sortingArrows.usedForSortingArrow = !$scope.sortingArrows.usedForSortingArrow;
                            $scope.orderByColumn('UsedFor', $scope.sortingArrows.usedForSortingArrow);
                            break;
                        case 'ApplicationPercent':
                            $scope.sortingArrows.applicantSortingArrow = !$scope.sortingArrows.applicantSortingArrow;
                            $scope.orderByColumn('ApplicationPercent', $scope.sortingArrows.applicantSortingArrow);
                            break;
                        default:
                            throw new Error(`Column '${column}' does not exist`);
                    }
                };

                /**
                 * Order by
                 * Using lodash rather that angularJS 'orderBy'
                 * This works better
                 * @param column
                 * @param sort
                 */
                $scope.orderByColumn = (column, sort) => {
                    $scope.JobBoards = (sort) ? _.sortByOrder($scope.JobBoards, column, ['asc']) : _.sortByOrder($scope.JobBoards, column, ['desc']);
                };

                /*
                 * Modal for permanently close screen
                 */
                $scope.updateInternalJobPost = (jobId, boards) => {
                    $scope.tableBoardsLoading = true;
                    JobAdsService.updateInternalJobPost(jobId, boards).then(function (res) {
                        if (res.data.Errors && res.data.Errors.length > 0) {
                            $notify.add({
                                message: res.data.Errors[0].Message,
                                type: 'error'
                            });
                        } else {
                            $notify.add({
                                message: 'Your changes were saved.',
                                type: 'success'
                            });

                            $scope.JobBoards[0].Expiry = boards.toApi().InternalJobPost.MultipostJobInternalDetail.JobPost.ExpiredDate;
                            $scope.JobBoards[0].IsEdit = false;

                            originalBoards.siExpiredDateType = boards.siExpiredDateType;
                            originalBoards.siDayEffective = boards.siDayEffective;
                            originalBoards.siExpiredDate = boards.siExpiredDate;
                            originalBoards.siExpiredDateCustomDate = boards.siExpiredDateCustomDate;
                            originalBoards.siExpiredDateCustomViewDate = boards.siExpiredDateCustomViewDate;
                            originalBoards.siExpiredDateDefaultDate = boards.siExpiredDateDefaultDate;
                            originalBoards.siExpiredDateDefaultViewDate = boards.siExpiredDateDefaultViewDate;
                            originalBoards.siActive = boards.siActive;
                            originalBoards.siJobId = boards.siJobId;
                            originalBoards.siJobPostSubscriptionId = boards.siJobPostSubscriptionId;
                            originalBoards.siReferFriend = boards.siReferFriend;
                            originalBoards.siInterApplications = boards.siInterApplications;
                            originalBoards.siInternalMessage = boards.siInternalMessage;
                            originalBoards.siKeyContact = boards.siKeyContact;
                            originalBoards.siAllOrSelectedGroup = boards.siAllOrSelectedGroup;
                            originalBoards.siSelectGroups = boards.siSelectGroups;
                            originalBoards.siNetworkGrousGroupIds = boards.siNetworkGrousGroupIds;
                        }
                    }).finally(() => {
                        $scope.tableBoardsLoading = false;
                    });
                };

                $scope.updateOnSiteJobPost = (jobId, boards) => {
                    $scope.tableBoardsLoading = true;
                    JobAdsService.updateOnSiteJobPost(jobId, boards).then(function (res) {
                        if (res.data.Errors && res.data.Errors.length > 0) {
                            $notify.add({
                                message: res.data.Errors[0].Message,
                                type: 'error'
                            });
                        } else {
                            $notify.add({
                                message: 'Your changes were saved.',
                                type: 'success'
                            });
                            $scope.JobBoards[1].Expiry = boards.toApi().YourSiteJobPost.MultipostJobYourSiteDetail.JobPost.ExpiredDate;
                            $scope.JobBoards[1].IsEdit = false;

                            originalBoards.swExpiredDate = boards.swExpiredDate;
                            originalBoards.swDayEffective = boards.swDayEffective;
                            originalBoards.swExpiredDateType = boards.swExpiredDateType;
                            originalBoards.swExpiredDateCustomDate = boards.swExpiredDateCustomDate;
                            originalBoards.swExpiredDateCustomViewDate = boards.swExpiredDateCustomViewDate;
                            originalBoards.swExpiredDateDefaultDate = boards.swExpiredDateDefaultDate;
                            originalBoards.swExpiredDateDefaultViewDate = boards.swExpiredDateDefaultViewDate;
                            originalBoards.swActive = boards.swActive;
                        }
                    }).finally(() => {
                        $scope.tableBoardsLoading = false;
                    });
                };

                $scope.updateSeekJobPost = (jobId, boards) => {
                    $scope.tableBoardsLoading = true;
                    JobAdsService.updateSeekJobPost(jobId, boards).then(function (res) {
                        if (res.data.Errors && res.data.Errors.length > 0) {
                            $notify.add({
                                message: res.data.Errors[0].Message,
                                type: 'error'
                            });
                        } else {
                            $notify.add({
                                message: 'Your changes were saved.',
                                type: 'success'
                            });

                            $scope.JobBoards[2].Expiry = boards.toApi().SeekJobPost.MultipostJobSeekDetail.JobPost.ExpiredDate;
                            $scope.JobBoards[2].IsEdit = false;

                            originalBoards.seActive = boards.seActive;
                            originalBoards.seMarket = boards.seMarket;
                            originalBoards.seLocation = boards.seLocation;
                            originalBoards.seArea = boards.seArea;
                            originalBoards.seRegion = boards.seRegion;
                            originalBoards.seSubClassification = boards.seSubClassification;
                            originalBoards.seClassification = boards.seClassification;
                            originalBoards.seVideoLink = boards.seVideoLink;
                            originalBoards.seListingStandOutB1 = boards.seListingStandOutB1;
                            originalBoards.seListingStandOutB2 = boards.seListingStandOutB2;
                            originalBoards.seListingStandOutB3 = boards.seListingStandOutB3;
                            originalBoards.seListingStandouts = boards.seListingStandouts;
                        }
                    }).finally(() => {
                        $scope.tableBoardsLoading = false;
                    });
                };

                $scope.updateCareerOneJobPost = (jobId, boards) => {
                    $scope.tableBoardsLoading = true;
                    //JobAdsService.updateCareerOneJobPost(jobId, boards);
                    JobAdsService.updateCareerOneJobPost(jobId, boards).then(function (res) {
                        if (res.data.Errors && res.data.Errors.length > 0) {
                            $notify.add({
                                message: res.data.Errors[0].Message,
                                type: 'error'
                            });
                        } else {
                            $notify.add({
                                message: 'Your changes were saved.',
                                type: 'success'
                            });

                            $scope.JobBoards[4].Expiry = boards.toApi().CareerOneJobPost.MultipostJobCareerOneDetail.JobPost.ExpiredDate;
                            $scope.JobBoards[4].IsEdit = false;

                            originalBoards.caActive = boards.caActive;
                            originalBoards.caExpiredDateDefault = boards.caExpiredDateDefault;
                            originalBoards.caExpiredDateDefaultViewDate = boards.caExpiredDateDefaultViewDate;
                            originalBoards.caIndustry = boards.caIndustry;
                            originalBoards.caLocation = boards.caLocation;
                            originalBoards.caCategory = boards.caCategory;
                            originalBoards.caOccupation = boards.caOccupation;
                            originalBoards.caTemplate = boards.caTemplate;
                            originalBoards.caCompanyName = boards.seActive;
                            originalBoards.caJobAdDuration = boards.caCompanyName;
                        }
                    }).finally(() => {
                        $scope.tableBoardsLoading = false;
                    });
                };

                $scope.updateTwitterJobPost = (jobId, boards) => {
                    $scope.tableBoardsLoading = true;
                    JobAdsService.updateTwitterJobPost(jobId, boards).then(function (res) {
                        if (res.data.Errors && res.data.Errors.length > 0) {
                            $notify.add({
                                message: res.data.Errors[0].Message,
                                type: 'error'
                            });
                        } else {
                            $notify.add({
                                message: 'Your changes were saved.',
                                type: 'success'
                            });

                            $scope.JobBoards[6].Expiry = boards.toApi().TwitterJobPost.MultipostJobTwitterDetail.JobPost.ExpiredDate;
                            $scope.JobBoards[6].IsEdit = false;

                            originalBoards.twActive = boards.twActive;
                        }
                    }).finally(() => {
                        $scope.tableBoardsLoading = false;
                    });
                };

                $scope.updateFacebookJobPost = (jobId, boards) => {
                    $scope.tableBoardsLoading = true;
                    JobAdsService.updateFacebookJobPost(jobId, boards).then(function (res) {
                        if (res.data.Errors && res.data.Errors.length > 0) {
                            $notify.add({
                                message: res.data.Errors[0].Message,
                                type: 'error'
                            });
                        } else {
                            $notify.add({
                                message: 'Your changes were saved.',
                                type: 'success'
                            });

                            $scope.JobBoards[6].Expiry = boards.toApi().FacebookJobPost.MultipostJobFacebookDetail.JobPost.ExpiredDate;
                            $scope.JobBoards[6].IsEdit = false;
                            originalBoards.fbActive = boards.fbActive;
                        }
                    }).finally(() => {
                        $scope.tableBoardsLoading = false;
                    });
                };

                $scope.updateOneshiftJobPost = (jobId, boards) => {
                    $scope.tableBoardsLoading = true;
                    JobAdsService.updateOneshiftJobPost(jobId, boards).then(function (res) {
                        if (res.data.Errors && res.data.Errors.length > 0) {
                            $notify.add({
                                message: res.data.Errors[0].Message,
                                type: 'error'
                            });
                        } else {
                            $notify.add({
                                message: 'Your changes were saved.',
                                type: 'success'
                            });

                            $scope.JobBoards[3].Expiry = boards.toApi().OneShiftJobPost.MultipostJobOneShiftDetail.JobPost.ExpiredDate;
                            $scope.JobBoards[3].IsEdit = false;

                            originalBoards.onActive = boards.onActive;
                            originalBoards.onRegion = boards.onRegion;
                            originalBoards.onArea = boards.onArea;
                            originalBoards.onCategory = boards.onCategory;
                            originalBoards.onProfession = boards.onProfession;

                        }
                    }).finally(() => {
                        $scope.tableBoardsLoading = false;
                    });
                };

                $scope.cancelInternalJobPost = () => {

                    $scope.boards.hasSherpaInternal = originalBoards.hasSherpaInternal;
                    $scope.boards.siActive = originalBoards.siActive;
                    $scope.boards.siExpiredDateType = originalBoards.siExpiredDateType;
                    $scope.boards.siExpiredDateCustomDate = originalBoards.siExpiredDateCustomDate;
                    $scope.boards.siExpiredDateCustomViewDate = originalBoards.siExpiredDateCustomViewDate;
                    $scope.boards.siExpiredDateDefaultDate = originalBoards.siExpiredDateDefaultDate;
                    $scope.boards.siExpiredDateDefaultViewDate = originalBoards.siExpiredDateDefaultViewDate;
                    $scope.boards.siExpiredDate = originalBoards.siExpiredDate;
                    $scope.boards.siUpdatedDate = originalBoards.siUpdatedDate;
                    $scope.boards.siReferFriend = originalBoards.siReferFriend;
                    $scope.boards.siInterApplications = originalBoards.siInterApplications;
                    $scope.boards.siInternalMessage = originalBoards.siInternalMessage;
                    $scope.boards.siKeyContact = originalBoards.siKeyContact;
                    $scope.boards.siAllOrSelectedGroup = originalBoards.siAllOrSelectedGroup;
                    $scope.boards.siSelectGroups = originalBoards.siSelectGroups;
                    $scope.boards.siNetworkGrousGroupIds = originalBoards.siNetworkGrousGroupIds;
                    $scope.boards.siLogo = originalBoards.siLogo;
                    $scope.boards.siCanReNew = originalBoards.siCanReNew;
                    $scope.boards.siCanSetExpiry = originalBoards.siCanSetExpiry;

                };

                $scope.cancelWebsiteJobPost = () => {

                    $scope.boards.hasSherpaWebSite = originalBoards.hasSherpaWebSite;
                    $scope.boards.swExpiredDateType = originalBoards.swExpiredDateType;
                    $scope.boards.swExpiredDateCustomDate = originalBoards.swExpiredDateCustomDate;
                    $scope.boards.swExpiredDateCustomViewDate = originalBoards.swExpiredDateCustomViewDate;
                    $scope.boards.swExpiredDateDefaultDate = originalBoards.swExpiredDateDefaultDate;
                    $scope.boards.swExpiredDateDefaultViewDate = originalBoards.swExpiredDateDefaultViewDate;
                    $scope.boards.swActive = originalBoards.swActive;
                    $scope.boards.swLogo = originalBoards.swLogo;
                    $scope.boards.swCanReNew = originalBoards.swCanReNew;
                    $scope.boards.swCanSetExpiry = originalBoards.swCanSetExpiry;
                    $scope.boards.swExpiredDate = originalBoards.swExpiredDate;
                    $scope.boards.swUpdatedDate = originalBoards.swUpdatedDate;
                    $scope.boards.swApplicationCount = originalBoards.swApplicationCount;
                };

                $scope.cancelSeekJobPost = () => {

                    $scope.boards.hasSeek = originalBoards.hasSeek;
                    $scope.boards.seExpiredDateDefault = originalBoards.seExpiredDateDefault;
                    $scope.boards.seExpiredDateDefaultViewDate = originalBoards.seExpiredDateDefaultViewDate;
                    $scope.boards.seActive = originalBoards.seActive;
                    $scope.boards.seMarket = originalBoards.seMarket;
                    $scope.boards.seLocation = originalBoards.seLocation;
                    $scope.boards.seArea = originalBoards.seArea;
                    $scope.boards.seSubClassification = originalBoards.seSubClassification;
                    $scope.boards.seClassification = originalBoards.seClassification;
                    $scope.boards.seVideoLink = originalBoards.seVideoLink;
                    $scope.boards.seListingStandouts = originalBoards.seListingStandouts;
                    $scope.boards.seListingStandOutB1 = originalBoards.seListingStandOutB1;
                    $scope.boards.seListingStandOutB2 = originalBoards.seListingStandOutB2;
                    $scope.boards.seListingStandOutB3 = originalBoards.seListingStandOutB3;
                    $scope.boards.seClassificationDetails = originalBoards.seClassificationDetails;
                    $scope.boards.seRegionDetails = originalBoards.seRegionDetails;
                    $scope.boards.seMarketSegmentDetails = originalBoards.seMarketSegmentDetails;
                    $scope.boards.seRegion = originalBoards.seRegion;
                    $scope.boards.seLogo = originalBoards.seLogo;
                    $scope.boards.seCanReNew = originalBoards.seCanReNew;
                    $scope.boards.seCanSetExpiry = originalBoards.seCanSetExpiry;
                    $scope.boards.seUpdatedDate = originalBoards.seUpdatedDate;
                    $scope.boards.seApplicationCount = originalBoards.seApplicationCount;
                };

                $scope.cancelCareerOneJobPost = () => {

                    $scope.boards.hasCareerOne = originalBoards.hasCareerOne;
                    $scope.boards.caActive = originalBoards.caActive;
                    $scope.boards.caExpiredDateDefault = originalBoards.caExpiredDateDefault;
                    $scope.boards.caIndustry = originalBoards.caIndustry;
                    $scope.boards.caLocation = originalBoards.caLocation;
                    $scope.boards.caCategory = originalBoards.caCategory;
                    $scope.boards.caOccupation = originalBoards.caOccupation;
                    $scope.boards.caTemplate = originalBoards.caTemplate;
                    $scope.boards.caCompanyName = originalBoards.caCompanyName;
                    $scope.boards.caJobAdDuration = originalBoards.caJobAdDuration;
                    $scope.boards.caIndustryDetails = originalBoards.caIndustryDetails;
                    $scope.boards.caCategoryDetails = originalBoards.caCategoryDetails;
                    $scope.boards.caAreaDetails = originalBoards.caAreaDetails;
                    $scope.boards.caTemplateDetails = originalBoards.caTemplateDetails;
                    $scope.boards.caCompanyNames = originalBoards.caCompanyNames;
                    $scope.boards.caOccupationDetails = originalBoards.caOccupationDetails;
                    $scope.boards.caLogo = originalBoards.caLogo;
                    $scope.boards.caCanReNew = originalBoards.caCanReNew;
                    $scope.boards.caCanSetExpiry = originalBoards.caCanSetExpiry;
                    $scope.boards.caUpdatedDate = originalBoards.caUpdatedDate;
                    $scope.boards.caApplicationCount = originalBoards.caApplicationCount;

                };

                $scope.cancelOneShiftJobPost = () => {

                    $scope.boards.hasOneShift = originalBoards.hasOneShift;
                    $scope.boards.onActive = originalBoards.onActive;
                    $scope.boards.onExpiredDateDefault = originalBoards.onExpiredDateDefault;
                    $scope.boards.onExpiredDateDefaultViewDate = originalBoards.onExpiredDateDefaultViewDate;
                    $scope.boards.onRegion = originalBoards.onRegion;
                    $scope.boards.onArea = originalBoards.onArea;
                    $scope.boards.onCategory = originalBoards.onCategory;
                    $scope.boards.onProfession = originalBoards.onProfession;
                    $scope.boards.onRegionDetails = originalBoards.onRegionDetails;
                    $scope.boards.onAreaDetails = originalBoards.onAreaDetails;
                    $scope.boards.onCategoryDetails = originalBoards.onCategoryDetails;
                    $scope.boards.onProfessionDetails = originalBoards.onProfessionDetails;
                    $scope.boards.onLogo = originalBoards.onLogo;
                    $scope.boards.onCanReNew = originalBoards.onCanReNew;
                    $scope.boards.onCanSetExpiry = originalBoards.onCanSetExpiry;
                    $scope.boards.onUpdatedDate = originalBoards.onUpdatedDate;
                    $scope.boards.onApplicationCount = originalBoards.onApplicationCount;
                };

                $scope.cancelTwitterJobPost = () => {

                    $scope.boards.hasTwitter = originalBoards.hasTwitter;
                    $scope.boards.twActive = originalBoards.twActive;
                    $scope.boards.twLogo = originalBoards.twLogo;
                    $scope.boards.twCanReNew = originalBoards.twCanReNew;
                    $scope.boards.twCanSetExpiry = originalBoards.twCanSetExpiry;
                    $scope.boards.twExpiredDate = originalBoards.twExpiredDate;
                    $scope.boards.twUpdatedDate = originalBoards.twUpdatedDate;
                    $scope.boards.twApplicationCount = originalBoards.twApplicationCount;
                };

                $scope.cancelFacebookJobPost = () => {

                    $scope.boards.hasFacebook = originalBoards.hasFacebook;
                    $scope.boards.fbActive = originalBoards.fbActive;
                    $scope.boards.fbLogo = originalBoards.fbLogo;
                    $scope.boards.fbCanReNew = originalBoards.fbCanReNew;
                    $scope.boards.fbCanSetExpiry = originalBoards.fbCanSetExpiry;
                    $scope.boards.fbExpiredDate = originalBoards.fbExpiredDate;
                    $scope.boards.fbUpdatedDate = originalBoards.fbUpdatedDate;
                    $scope.boards.fbApplicationCount = originalBoards.fbApplicationCount;
                };

                $scope.showDropdownFor = '';
                $scope.isSelected = false;
                var currentLabel = null;
                $scope.tempLabel = '';
                $scope.isChangedInput = false;

                $scope.onFocusOrOnBlurDropdown = (field, data) => {
                    $scope.showDropdownFor = field;

                    if (!angular.isUndefined(data)) {
                        $scope.tempLabel = data;
                        $scope.isChangedInput = false;
                    }
                }

                //When user change the text box but don't select the option
                $scope.resetLabel = (field) => {
                    if (field === 'KeyContact' && $scope.isSelected === false) {
                        $scope.boards.siKeyContact = angular.copy($scope.tempLabel);
                    }
                }

                //When user type in the input on selectbox
                $scope.onChangeInput = (keyword) => {
                    if (keyword !== currentLabel) {
                        $scope.isChangedInput = true;
                        $scope.isSelected = false;
                    }
                }

                //When select a result from autocomplete
                $scope.selectKeyContact = function (data, option) { //option: KeyContact

                    $scope.showDropdownFor = ''; // hide dropdown

                    if (option === 'KeyContact') {
                        $scope.boards.siKeyContact = angular.copy(data);
                        currentLabel = angular.copy($scope.boards.siKeyContact.Label);
                    }
                    $scope.isChangedInput = false;
                    $scope.isSelected = true;
                };
            }]
        };
    }]);