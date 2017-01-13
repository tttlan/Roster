angular.module('ui.recruit.jobs')
    .directive('applicantDetailsTab', ['JobApplicantDetailsService', 'DocumentViewerSingleton', '$location', 'EntityActionType', 'DocumentList', function(JobApplicantDetailsService, DocumentViewerSingleton, $location, EntityActionType, DocumentList) {
        return {
            restrict: 'E',
            scope: {applicantDetails: '='},
            templateUrl: '/interface/views/recruit/job-application/partials/application-details-tab.html',
            link: function(scope) {
                scope.EntityActionType = EntityActionType;
                scope.editing = false;
                scope.updateApplicant = function(updateApplicantForm) {
                    if(updateApplicantForm.$valid) {
                        scope.updateApplicantDetails(scope.editingModel);
                    }
                };
                scope.toggleEditing = () => {
                    scope.editing = !scope.editing;
                    if (scope.editing) {
                        scope.editingModel = angular.copy(scope.applicantDetails);
                    }
                };
                scope.updateApplicantDetails = (model) => {
                    scope.isSaving = true;
                    JobApplicantDetailsService.updateApplicant(model)
                        .then ((res) => {
                            if (res.data.Data) {
                                model.Address.CountryName = res.data.Data;
                            }
                            _.extend(scope.applicantDetails, model);
                        })
                        .finally( () => {
                            scope.$emit('_SIBLINGCHANGE_'); // Emits to the applicant details controller that an applicants details has been changes
                            scope.isSaving = false;
                            scope.toggleEditing();
                        });
                };

                scope.viewDocument = (documentUrl, filename, docType) => {
                    let urlList = [],
                        documentName;

                    if (filename) {
                        filename = filename.replace(' ', '_').toLowerCase();

                        let extension = filename.split('.');

                        extension.splice(extension.length - 1, 1)
                        documentName = extension.join('_'); // .splice to remove old filetype from the name
                    } else {
                        documentName = docType; // used if api passes null for any reason.
                    }

                    urlList.push(documentUrl+'&filename='+documentName);

                    let list = new DocumentList(urlList);

                    DocumentViewerSingleton.data = list;
                    $location.path(`/recruit/jobs/documents`);
                };
            }
        };
    }]);