angular.module('ui.recruit.jobs')
    .factory('JobApplicantSearchSingleton', () => {

        var instance = {
            data: null
        };

        return instance;
    });