angular.module('ui.profile')

.controller('profileHistory', ['$scope', 'ProfileHistoryFactory', function($scope, ProfileHistoryFactory) {
    
    /*
     *  History
     */
    
    $scope.history = new ProfileHistoryFactory();

    // Load employment history and performance assessments data
    $scope.history.getEmploymentHistoryAssessments();
    
    // Load training data
    if ($scope.profile.$userCan.canviewtraining) {
        $scope.history.getTrainingSubjects();
        $scope.history.getTrainingCourses();
    }
}]);
