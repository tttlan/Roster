angular.module('ui.profile')

.controller('profileBanking', ['$scope', 'Profile', 'ProfileBankingFactory','$interval', '$rootScope','$route',
    function($scope, Profile, ProfileBankingFactory, $interval, $rootScope, $route) {
    
        $scope.banking = new ProfileBankingFactory($scope.profile.$userCan);

        var intervalPromise;

        $rootScope.$on('$routeUpdate', function() {
            if ($route.current.params.tab === 'employment-details') {
                //not do anything here

            } else {
                $interval.cancel(intervalPromise);
                $scope.banking.$authenticated = false;
            }
        }); 

    $scope.accessBankingInformationSave = function(data) {
        // this is a hack because we are passing it to the form builder
        // through an &attr, then running it in the link. Doing this
        // loses the context binding of the ContactFactory
        // so we set up an interim func to call save properly
        $interval.cancel(intervalPromise);
        intervalPromise = $interval(function() {
            $scope.banking.$authenticated = false;
        }, 120000);
        
        data.MemberId = $scope.profile.MemberId;
        return $scope.banking.accessBankingInformation.$save(data);
    };
    
    $scope.bankingInformationSave = function(data) {
        // this is a hack because we are passing it to the form builder
        // through an &attr, then running it in the link. Doing this
        // loses the context binding of the ContactFactory
        // so we set up an interim func to call save properly
        
        if ($scope.banking.$authenticated) {
            $interval.cancel(intervalPromise);
            intervalPromise = $interval(function() {
                $scope.banking.$authenticated = false;
            }, 120000);
            return $scope.banking.bankingInformation.$save(data);
        }
        return null;
    };
}]);
