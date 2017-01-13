angular.module('ui.recruit.candidateonboard')
    .controller('addEmployeeCtrl', [
        '$scope', 'Members', '$location', '$q', 'Paths', 'OnboardingFactory', 'EmployeeFormFactory', 'Networks', '$route',
         function($scope, members, $location, $q, paths, OnboardingFactory, EmployeeFormFactory, networks, $route) {

            $scope.employeeForm = new EmployeeFormFactory();

            $scope.addEmployeeFormSave = function(data) {
                $scope.employeeForm.$save(data);
            };

        }
    ])

;
