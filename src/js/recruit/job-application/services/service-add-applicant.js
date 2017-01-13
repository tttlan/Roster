angular.module('ui.recruit.jobs')
    .factory('AddApplicantService',['$q', '$server', '$HTTPCache', 'API_BASE_URL',
        function($q, $server, $HTTPCache, API_BASE_URL) {
            let JOB_APPLICATION_NAMESPACE = API_BASE_URL + 'recruitments/jobapplications';
            let factory = {
                postApplicant(data) {
                    return $server.create({
                        url: JOB_APPLICATION_NAMESPACE,
                        data: data.toApi()
                    }).then(function(response) {
                        return response;
                    });
                }
            };

            return factory;
        }]);