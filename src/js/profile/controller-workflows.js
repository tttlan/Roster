angular.module('ui.profile')

.controller('profileWorkflows', ['$scope', 'ProfileWorkflowsFactory', function($scope, ProfileWorkflowsFactory) {
    
    /*
     *  Workflows
     */

    $scope.workflowsFactory = new ProfileWorkflowsFactory();
    
    $scope.workflows = {
        $loaded: false, // We may have more than one workflow
        data: []
    };
    
    $scope.workflowsFactory.$formDataPromise.then(function(res) { // For each set of workflow form elements we have generated (ie each workflow).  If the form data promise has returned, this means the api data has come back
        
        $scope.workflows.$loaded = true;
        
        angular.forEach(res, function(form, index) {  // Loop through them and create a form factory instance which will be used to bind to a form builder directive
            $scope.workflows.data[index] = $scope.workflowsFactory.getWorkflowsForm(index, $scope.profile.$userCan);
        });
    });
    
    $scope.workflowsSave = function(data) {
        // this is a hack because we are passing it to the form builder
        // through an &attr, then running it in the link. Doing this
        // loses the context binding of the ContactFactory
        // so we set up an interim func to call save properly
        return $scope.workflows.data[data.$formIndex].$save(data);
    };
    
}]);
