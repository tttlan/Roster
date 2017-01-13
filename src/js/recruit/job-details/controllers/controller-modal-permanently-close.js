angular.module('ui.recruit.jobs')
.controller('modalPermanentlyCloseCtrl', ['$scope', 'JobDetailsService', '$notify', '$modalInstance', 'EmailService', 'EntityActionType', 'closeUrl', '$window', ($scope, JobDetailsService, $notify, $modalInstance, EmailService, EntityActionType, closeUrl, $window) => {
    $scope.EntityActionType = EntityActionType;

    /*
     * Variables
     */
    $scope.job = {
        conclusion    : 'successful',
        communication : false,
        subject       : null,
        body          : '',
        emailId       : null,
        internalTitle : null
    };

    /*
     * Control variables
     */
    $scope.controls = {
        emailTemplateSearch         : null,
        allEmailTemplates           : null,
        showSpinner                 : false,
    };

    /*
     * Get the list of email templates
     */
    EmailService.getEmailTemplates().then((res) =>{
        $scope.templates = res;
        $scope.controls.allEmailTemplates = res; //Keep an origin copy so that we can search through it
    });

    /*
     * Search email template
     */
    $scope.searchEmailTemplate = () => {
        $scope.templates = angular.copy($scope.controls.allEmailTemplates); //Get a fresh new copy

        if($scope.controls.emailTemplateSearch.length) {
            $scope.templates = _.filter($scope.templates, (template) => {
                return _.startsWith(template.Title.toLowerCase(), $scope.controls.emailTemplateSearch.toLowerCase());
            });
        }
    };

    /*
     * Get the email template content
     */
    $scope.applyTemplate = (url) => {
        EmailService.getEmailTemplate(url).then((response) => {
            $scope.job.subject = response.data.EmailActivityDetail.Subject;
            $scope.job.body = response.data.EmailActivityDetail.Email;
            $scope.job.emailId = response.data.EmailActivityDetail.EmailId;
            $scope.job.internalTitle = response.data.EmailActivityDetail.InternalTitle;
        });
    };

    /*
     * Submit form
     * Note : $scope.job.communication is the checkbox. If it is not selected, then there is no need to validate the email part
     */
    $scope.save = function() {
        if($scope.frmPermanentlyCloseJob.$valid || !$scope.job.communication) {
            $scope.controls.showSpinner = true;
            JobDetailsService.permanentlyCloseJob(closeUrl, $scope.job).then((response) => {
                $modalInstance.close();
                $notify.add({
                    message: 'Job is permanently closed',
                    type: 'success'
                });
            }).finally(() => {
                $scope.controls.showSpinner = false;
            });
        }
    };

    /*
     * Close modal
     */
    $scope.close = () => {
        $modalInstance.close();
    };
}]);