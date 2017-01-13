angular.module('ui.recruit.jobs')
    .controller('modalSendEmailCtrl', ['$scope', '$modalInstance', 'EmailService', 'EntityActionType', 'EmailSummaryModel', 'jobId', 'recipients','$notify', 'sendEmailUrl',
        function($scope, $modalInstance, EmailService, EntityActionType, EmailSummaryModel, jobId, recipients,$notify, sendEmailUrl) {
            $scope.email = new EmailSummaryModel();
            $scope.filterText = "";
            
            $scope.showApplicantSearch = true;

            $scope.jobId = jobId;
            $scope.email.recipients = angular.copy(recipients);

            $scope.EntityActionType = EntityActionType;
            
            EmailService.getEmailTemplates().then((res) =>{
                $scope.email.templates = res;
            });

            $scope.$$listeners.$locationChangeSuccess = [];

            $scope.getEmailTemplate = function(template) {
                var action = template.userCan(EntityActionType.GetContentOfEmail);
                if (!action) { return;}
                EmailService.getEmailTemplate(action.ActionUrl).then((res) => {
                    $scope.email.subject = res.data.EmailActivityDetail.Subject;
                    $scope.email.body = res.data.EmailActivityDetail.Email;
                });
            };

            $scope.cancel = function() {
                $modalInstance.close();
            };

            $scope.sendEmail = function() {
                $scope.submitted = true;
                if($scope.sendEmailForm.$valid && $scope.email.recipients.length > 0) {
                    EmailService.sendEmail($scope.email, sendEmailUrl).then((res) => {
                        $notify.add({
                            message: 'Email sent successfully!',
                            type: 'success',
                            visible: true
                        });
                        $scope.cancel();
                    });

                }

            };
        }]);