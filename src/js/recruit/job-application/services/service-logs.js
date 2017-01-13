angular.module('ui.recruit.jobs')
.factory('ApplicantLogsService', ['$server', '$HTTPCache', 'API_BASE_URL', 'ApplicantLogsModel', 'EntityActionType',
    function($server, $HTTPCache, API_BASE_URL, ApplicantLogsModel, EntityActionType) {
        let APPLICANT_LOGS_NAMESPACE = API_BASE_URL;
        let factory = {
            getApplicantLogs(applicationId) {
                return $server.get({
                    url: APPLICANT_LOGS_NAMESPACE + `recruitments/jobapplications/${applicationId}/Logs`
                }, true).then((res) => {
                   return ApplicantLogsModel.fromApi(res.data);
                });
            }
        };
        return factory;
    }]);