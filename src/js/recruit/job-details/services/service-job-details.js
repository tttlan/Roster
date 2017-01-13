angular.module('ui.recruit.jobs')
.factory('JobDetailsService', ['$server', '$HTTPCache', 'API_BASE_URL', 'JobAdsBoardsModel', 'JobAdsDetailsModel', ($server, $HTTPCache, API_BASE_URL, JobAdsBoardsModel, JobAdsDetailsModel) => {
    let JOB_NAMESPACE = API_BASE_URL + 'recruitments/jobs';

    let jobDetailsService = {
        permanentlyCloseJob(url, frm) {
            return $server.update({
                url  : url,
                data : this.prepareToApi(frm)
            }, true);
        },
        getJobDetailsByJobId(jobId) {
            let url = JOB_NAMESPACE + '/'+jobId; //GET api/recruitments/Jobs/{jobId}/JobPosts
            return $server.get({
                url   : url,
            }, true).then(function(response) {
                return {
                    jobAdsDetailsModel : JobAdsDetailsModel.fromApi(response.data),
                    headers : response.headers
                };
            });
        },

        duplicateJobById: function (jobId) {
             let url = JOB_NAMESPACE + '/'+ jobId + '/Duplicate';
             return $server.create({
                url: url,
             }, true).then(function(response){
                return response;
             });
        },

        prepareToApi(job) {
            let request = {
                IsJobExternal : (job.conclusion === 'successful') ? true : false,
                IsJobInternal : (job.conclusion === 'not filled') ? true : false,
                IsJobWithdrawn : (job.conclusion === 'withdrawn') ? true : false
            };

            if(job.communication) {
                request.IsSendEmail = job.communication;
                request.EmailDetail = {
                    Email : job.body,
                    Subject : job.subject,
                    InternalTitle : job.internalTitle,
                    EmailId : job.emailId
                };
            }

            return request;
        }
    };
    return jobDetailsService;
}]);