angular.module('ui.recruit')

    .directive('jobAdsBoards', ['$q', function($q) {

        return {
            restrict   : 'E',
            require:"^form",
            scope      : {
                boards : '=',
                form: '=',
            },
            templateUrl : '/interface/views/recruit/job-ads/partials/create-job-ads-boards.html',
            controller: ['$scope', function($scope) {
                $scope.$watch('boards.networkId', function(val){
                    if(val){
                        $scope.internalLogoUrl = '/client/'+ val +'/common/profile/consolelogo.gif';
                    }
                })
                $scope.turnOnDefaultAd = function(expiredDateCustomDate, expiredDateDefaultDate, expiredDateDefaultViewDate) {
                    //default value date 30 days from today Ex : "2016-06-09T13:47:33+07:00"
                    var defaultDate = moment().add(30, 'days').format();
                    $scope.boards[expiredDateCustomDate] = null;
                    $scope.boards[expiredDateDefaultDate] = defaultDate;
                    $scope.boards[expiredDateDefaultViewDate] = moment(defaultDate).format("MM/DD/YYYY");
                };


                $scope.updateViewExpiredDate = function(expiredDateCustomDate , expiredDateCustomViewDate) {
                    var viewDate = moment($scope.boards[expiredDateCustomDate]),
                        now = moment();

                    if(viewDate.diff(now, 'days') + 1 > 0) {
                        $scope.boards[expiredDateCustomViewDate] = viewDate.diff(now, 'days') + 1; //Caculation days from today
                    }
                };
                $scope.showDropdownFor = '';
                $scope.isSelected = false;
                var currentLabel = null;
                $scope.tempLabel = '';
                $scope.isChangedInput = false;

                $scope.onFocusOrOnBlurDropdown = (field, data) => {
                    $scope.showDropdownFor = field;

                    if(!angular.isUndefined(data)){
                        $scope.tempLabel = data;
                        $scope.isChangedInput = false;
                    }
                }

                //When user change the text box but don't select the option
                $scope.resetLabel = (field) => {
                    if(field === 'KeyContact' && $scope.isSelected === false) {
                        $scope.boards.siKeyContact = angular.copy($scope.tempLabel);
                    }
                }

                //When user type in the input on selectbox
                $scope.onChangeInput = (keyword) => {
                    if(keyword !== currentLabel) {
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