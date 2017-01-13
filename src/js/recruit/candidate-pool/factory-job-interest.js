angular.module('ui.recruit.candidatepool')

.factory('JobInterestFactory', ['Profile', 'ProfileFormFactory', 'Permissions', '$q', '$notify', function(Profile, ProfileFormFactory, Permissions, $q, $notify) {

    function JobInterest() {

        this.$userCan = {};
        this.$loading = true;
        this.$editing = false;
        this.$canEdit = false;
    }
    function createJobData() {
        var d = $q.defer();
        d.resolve({
            data: {
                Role: "dasdsad",
                Notification: [undefined, 1]
            }
        });
        return d.promise;
    }
    JobInterest.prototype.getJobInterestForm = function() {
        var form = this,
            OPTIONS = {
                serviceName: 'CandidatePool',
                dataPromise: createJobData(),
                getDataSuccessFn: function(that, res) {
                    res = angular.copy(res);
                    that.selectData = {
                        Role: [{ Label: "Test 1", Value: 0 }, { Label: "Test 2", Value: 1 }]
                    };
                    return res;
                },
                saveDataFn: function(that, data) {
                    return data;
                },
                saveDataSuccessFn: function(that, data) {
                    that.$editing = false;
                },
                customProperties: {

                },
                saveAction: 'saveJobInterest',
                successMsg: 'Your personal information has been updated successfully',
                errorMsg: 'Your personal information could not be updated at this time.  Please try again later'
            };

        return new ProfileFormFactory(OPTIONS);
    };

    return JobInterest;

}]);
