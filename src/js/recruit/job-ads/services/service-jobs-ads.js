angular.module('ui.recruit.jobs')

    .factory('JobAdsService', ['$server', '$HTTPCache', 'API_BASE_URL', 'JobAdsItemsModel', 'JobAdsAssessorModel', '$q', 'JobAdsBoardsModel', 'JobAdsDetailsModel', 'JobAdsQuestionnaireModel',
        function ($server, $HTTPCache, API_BASE_URL, JobAdsItemsModel, JobAdsAssessorModel, $q, JobAdsBoardsModel, JobAdsDetailsModel, JobAdsQuestionnaireModel) {
            let JOB_NAMESPACE = API_BASE_URL + 'recruitments/jobs';
            let JOB_BOARD_INTEGRATION_NAMESPACE = API_BASE_URL + 'jobBoardIntegration/jobs';
            let factory = {
                getAssessor(searchQuery) {
                    /*return Promise.resolve({
                        data: JobAdsAssessorModel.fromApi(getFakeData().AssessorFakeData.SearchMemberGroupItems)
                    });*/
                    // API :/api/Recruitments/Assessors/Search?s={s}
                    let url = API_BASE_URL + 'recruitments/Assessors/Search';
                    return $server.get({
                        url: url,
                        query: {
                            's': searchQuery
                        }
                    }).then(function (response) {
                        $HTTPCache.clear(url);
                        if (response.data && response.data.SearchMemberGroupItems && response.data.SearchMemberGroupItems.length) {
                            response.data = JobAdsAssessorModel.fromApi(response.data.SearchMemberGroupItems);
                        }
                        return response;
                    });
                },

                addAssessor(listAssessor, jobId) {
                    // API :api/recruitments/Jobs/{jobId}/Assessors
                    let url = API_BASE_URL + 'recruitments/Jobs/' + jobId + '/Assessors';
                    let data = JobAdsAssessorModel.toApi(listAssessor);
                    //let data = JobAdsAssessorModel.toApi(getFakeData().AddAssessor);
                    return $server.update({
                        url: url,
                        data: data
                    }).then(function (response) {
                        $HTTPCache.clear(url);
                        return response;
                    });
                },

                searchJobAds(search = "", page = 1, pageSize = 50, orderBy = "") {
                    /*
                     * Both the search and list for the job ads uses the same API
                     * The only way to differentiate between them is the 'search' parameter.
                     * If it is left blank it will return a list else its a search
                     */

                    let url = `${JOB_NAMESPACE}/search?s=${search}&p=${page}&ps=${pageSize}&o=${orderBy || ''}`; //DO NOT use the 'query' in the $server ONLY for this case
                    return $server.get({
                        url: url
                    }, true).then(function (response) {
                        var result = JobAdsItemsModel.fromApi(response.data);
                        result.headers = response.headers;
                        return result;
                    });
                },

                updateInternalJobPost(jobId, boards) {
                    // API :api/recruitments/Jobs/{jobId:int}/JobPosts/Internal
                    let url = API_BASE_URL + 'recruitments/Jobs/' + jobId + '/JobPosts' + '/Internal';
                    let data = boards.toApi().InternalJobPost;
                    return $server.update({
                        url: url,
                        data: data.MultipostJobInternalDetail
                    }).then(function (response) {
                        $HTTPCache.clear(url);
                        return response;
                    });
                },

                updateOnSiteJobPost(jobId, boards) {
                    // API :api/recruitments/Jobs/{jobId:int}/JobPosts/Website
                    let url = API_BASE_URL + 'recruitments/Jobs/' + jobId + '/JobPosts' + '/Website';
                    let data = boards.toApi().YourSiteJobPost;
                    return $server.update({
                        url: url,
                        data: data.MultipostJobYourSiteDetail
                    }).then(function (response) {
                        $HTTPCache.clear(url);
                        return response;
                    });
                },

                updateSeekJobPost(jobId, boards) {
                    // API :api/recruitments/Jobs/{jobId:int}/JobPosts/Seek
                    let url = API_BASE_URL + 'recruitments/Jobs/' + jobId + '/JobPosts' + '/Seek';

                    let data = boards.toApi().SeekJobPost;

                    return $server.update({
                        url: url,
                        data: data.MultipostJobSeekDetail
                    }).then(function (response) {
                        $HTTPCache.clear(url);
                        return response;
                    });
                },
                updateCareerOneJobPost(jobId, boards) {
                    // API :api/recruitments/Jobs/{jobId:int}/JobPosts/CareerOne
                    let url = API_BASE_URL + 'recruitments/Jobs/' + jobId + '/JobPosts' + '/CareerOne';
                    let data = boards.toApi().CareerOneJobPost;
                    return $server.update({
                        url: url,
                        data: data.MultipostJobCareerOneDetail
                    }).then(function (response) {
                        $HTTPCache.clear(url);
                        return response;
                    });
                },
                updateTwitterJobPost(jobId, boards) {
                    // API :api/recruitments/Jobs/{jobId:int}/JobPosts/Twitter
                    let url = API_BASE_URL + 'recruitments/Jobs/' + jobId + '/JobPosts' + '/Twitter';
                    let data = boards.toApi().TwitterJobPost;
                    return $server.update({
                        url: url,
                        data: data.MultipostJobTwitterDetail
                    }).then(function (response) {
                        $HTTPCache.clear(url);
                        return response;
                    });
                },
                updateFacebookJobPost(jobId, boards) {
                    // API :api/recruitments/Jobs/{jobId:int}/JobPosts/Facebook
                    let url = API_BASE_URL + 'recruitments/Jobs/' + jobId + '/JobPosts' + '/Facebook';
                    let data = boards.toApi().FacebookJobPost;
                    return $server.update({
                        url: url,
                        data: data.MultipostJobFacebookDetail
                    }).then(function (response) {
                        $HTTPCache.clear(url);
                        return response;
                    });
                },
                updateOneshiftJobPost(jobId, boards) {
                    // API :api/recruitments/Jobs/{jobId:int}/JobPosts/Oneshift
                    let url = API_BASE_URL + 'recruitments/Jobs/' + jobId + '/JobPosts' + '/Oneshift';
                    let data = boards.toApi().OneShiftJobPost;
                    return $server.update({
                        url: url,
                        data: data.MultipostJobOneShiftDetail
                    }).then(function (response) {
                        $HTTPCache.clear(url);
                        return response;
                    });
                },

                getJobPostsByJobId(jobId) {
                    // GET api/recruitments/Jobs/{jobId}/JobPosts
                    let url = JOB_NAMESPACE + '/' + jobId;
                    return $server.get({
                        url: url,
                    }).then(function (response) {
                        $HTTPCache.clear(url);
                        let result = JobAdsBoardsModel.fromApi(response.data.JobDetail.JobPostsInfo);
                        result.headers = response.headers;
                        return result;
                    });
                },

                searchJobTags() {
                    let url = API_BASE_URL + 'Recruitments/Tags/Search?s=';
                    return $server.get({
                        url: url,
                    }).then(function (response) {
                        $HTTPCache.clear(url);
                        if (response.data && response.data.JobTagItemResults && response.data.JobTagItemResults.length) {
                            response.data = response.data.JobTagItemResults.map(function (item) {
                                return {
                                    label: item.JobTag.TagDesc,
                                    value: item.JobTag.JobTagId
                                };
                            });
                        }
                        return response;
                    });
                },

                createJobAds: function (model) {
                    let apiModel = model.toApi();
                    return $server.create({
                        url: JOB_NAMESPACE,
                        data: apiModel
                    }).then(function (res) {
                        $HTTPCache.clear('Recruitments');
                        return res;
                    });
                },

                updateJobAds: function (model) {
                    let url = JOB_NAMESPACE + '/' + model.jobId;
                    var apiModel = model.toApi();
                    return $server.update({
                        url: url,
                        data: apiModel
                    }).then(function (res) {
                        $HTTPCache.clear('Recruitments');
                        return res;
                    });
                },

                addQuestionnaireToJob(questionnaire, phoneQuestionnaire, jobId) {
                    let url = API_BASE_URL + 'Recruitments/Jobs/' + jobId + '/QuestionTemplates';
                    let data = [];
                    data = JobAdsQuestionnaireModel.toApi(questionnaire, phoneQuestionnaire);
                    return $server.update({
                        url: url,
                        data: data
                    }).then(function (response) {
                        $HTTPCache.clear(url);
                        return response;
                    });

                },

                updateJobPostsByJobId: function (jobId, boards) {
                    // API :api/recruitments/Jobs/{jobId:int}/JobPosts/Oneshift
                    let url = API_BASE_URL + 'recruitments/Jobs/' + jobId + '/JobPosts';
                    return $server.update({
                        url: url,
                        data: boards
                    }).then(function (response) {
                        $HTTPCache.clear(url);
                        return response;
                    });
                },

                publishJobAds: function (id) {
                    let url = JOB_BOARD_INTEGRATION_NAMESPACE + '/' + id + '/publish';
                    return $server.update({
                        url: url
                    }).then(function (res) {
                        $HTTPCache.clear('Recruitments');
                        return res;
                    });
                },

                deleteJob(jobId) {
                    let url = JOB_NAMESPACE + '/' + jobId;
                    return $server.remove({
                        url: url
                    }).then(function (response) {
                        $HTTPCache.clear(url);
                        return response;
                    });
                },
                searchKeyContact() {
                    let url = API_BASE_URL + 'network/information/search?q=a&type=0';
                    return $server.get({
                        url: url,
                    }).then(function (response) {
                        $HTTPCache.clear(url);
                        if (response.data.length) {
                            response.data = response.data.map(function (item) {
                                return {
                                    Id: item.Value,
                                    Value: item.KeyValue,
                                    Label: item.Label
                                };
                            });
                        }
                        return response;
                    });
                },
                searchNetworkGroups() {
                    let url = API_BASE_URL + 'network/information/search?q=a&type=4';
                    return $server.get({
                        url: url,
                    }).then(function (response) {
                        $HTTPCache.clear(url);
                        return response;
                    });
                }

            };

            return factory;
        }]);
