angular.module('ui.recruit.jobs')
    .factory('DocumentViewerSingleton', () => {
        var instance = {
            data: null
        };

        return instance;
    });