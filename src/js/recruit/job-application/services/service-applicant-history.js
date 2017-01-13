angular.module('ui.recruit.jobs')

.factory('ApplicantHistoryService',['$server', '$HTTPCache', 'API_BASE_URL', 'ApplicantHistoryModel',
    function($server, $HTTPCache, API_BASE_URL, ApplicantHistoryModel) {
        let APPLICANT_HISTORY_NAMESPACE = API_BASE_URL;
        let factory ={
            getCandidateApplicationHistory(candidateId) {
                return $server.get({
                    url: APPLICANT_HISTORY_NAMESPACE + `candidate/${candidateId}/jobHistories`
                }).then ((res) => {
                    return ApplicantHistoryModel.fromApi(res.data);
                });
            }
        };
        return factory;
}]);
