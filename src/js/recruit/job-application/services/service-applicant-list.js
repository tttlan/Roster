angular.module('ui.recruit.jobs')
    .factory('JobApplicantListService',['$q', '$server', '$HTTPCache', 'API_BASE_URL', 'JobApplicationListModel', 'JobApplicationStatusListModel', 'JobApplicantSearchSingleton',
        function($q, $server, $HTTPCache, API_BASE_URL, JobApplicationListModel, JobApplicationStatusListModel) {
            const JOB_APPLICATION_NAMESPACE = API_BASE_URL + 'recruitments/jobapplications';
            let factory = {
                getApplicantsList(jobId, s, candidateName, p, ps, o) {
                    let url = JOB_APPLICATION_NAMESPACE;

                    let query = {jobId, s, candidateName, p, ps, o};
                    if (query.candidateName === null) delete query.candidateName; // removes candidate name from query params if null
                    if (query.s === null) delete query.s; // removes status from query params if null
                    if (query.o === null) delete query.o; // removes orderBy from query params if null

                    return $server.get({
                        url: url+'/search',
                        query
                    }, true).then(function(response) {
                        response.data = JobApplicationListModel.fromApi(response.data);
                        return response;
                     });
                },

                getStatusFilterData(jobId) {
                    let url = JOB_APPLICATION_NAMESPACE + "/statistics";

                    let query = {jobId};

                    return $server.get({
                        url: url,
                        query
                    }, true).then(function(response) {
                        return JobApplicationStatusListModel.fromApi(response.data);
                    });
                },

                searchJobApplications({jobId, candidateName, status}) {
                    //not sure how we're doing this yet
                    let url = JOB_APPLICATION_NAMESPACE;
                    let p = 0;
                    let ps = 20;
                    let s = status;

                    let query = {jobId, candidateName, s, p, ps};

                    return $server.get({
                        url: url+'/search',
                        query
                    }, true).then(function(response) {
                        response.data = JobApplicationListModel.fromApi(response.data);
                        return response.data;
                    });
                },


                changeStatus(data, url) {
                    return $server.update({
                        url: url,
                        data: data.toApi()
                    }, true).then(function(response) {
                        return response;
                    });
                }
            };

            return factory;
        }]);