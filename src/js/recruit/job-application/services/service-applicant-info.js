angular.module('ui.recruit.jobs')
    .factory('JobApplicantDetailsService', ['$q','$server', '$HTTPCache', 'API_BASE_URL', 'JobApplicantDetailsModel', 'EntityActionType',
        function($q, $server, $HTTPCache, API_BASE_URL, JobApplicantDetailsModel, EntityActionType) {
            let APPLICANT_DETAILS_NAMESPACE = API_BASE_URL;
            let factory = {
                getApplicantDetails(jobApplicationId) {
                    return $server.get({
                        url: APPLICANT_DETAILS_NAMESPACE + `recruitments/jobapplications/${jobApplicationId}`
                    }).then(function(res) {
                        return JobApplicantDetailsModel.fromApi(res.data);
                    }).catch(() => {
                        //Catch empty response and redirect to another page
                    });
                },
                updateApplicant(model) {
                    return $server.update({
                        url: model.userCan(EntityActionType.CanUpdateApplicantInformation).ActionUrl,
                        data: model.toApi()
                    }).then(function(res) {
                        $HTTPCache.clear(APPLICANT_DETAILS_NAMESPACE);
                        return res;
                    });

                },
                changeApplicationStatus(model, newStatus) {
                    return $server.update({
                        url: model.userCan(EntityActionType.CanChangeStatusApplication).ActionUrl,
                        data: model.updateStatusToApi(newStatus)
                    }).then(function(res) {
                        $HTTPCache.clear(APPLICANT_DETAILS_NAMESPACE);
                        return res;
                    });
                }
         };
         return factory;
}]);