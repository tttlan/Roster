angular.module('ui.recruit.candidatepool')

.factory('CandidateProfileFactory', ['Profile', 'ProfileFormFactory', 'Permissions', '$q', '$notify', function(Profile, ProfileFormFactory, Permissions, $q, $notify) {

    function CandidateProfile() {

        this.$userCan = {};
        this.$loading = true;
        this.$editing = false;
        this.$canEdit = false;
    }
    function createJobData()
    {
        var d = $q.defer();
        d.resolve({
            data: {
                Type: "dasdsad",
                CommencementDate: [undefined, 1],
                FisrtName: '',
                SurName: '',
                MobilePhone: '',
                Email: '',
                Address: '',
                Suburb: '',
                City: '',
                StateName: '',
                Postcode: '',
                CountryId : 10000
            }
        });
        return d.promise;
    }
    CandidateProfile.prototype.getJobInterestForm = function() {
        var form = this,
            OPTIONS = {
                serviceName: 'CandidatePool',
                dataPromise: createJobData(),
                getDataSuccessFn: function(that, res) {
                    res = angular.copy(res);
                    that.selectData = {
                        Role: [{Label: "Test 1", Value: 0}, {Label: "Test 2", Value: 1}]
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

    CandidateProfile.prototype.getCandidateForm = function() {
        var candidateForm = this,
            OPTIONS = {
                serviceName: 'CandidatePool',
                dataPromise: candidateForm.$dataPromise,
                getDataSuccessFn: function(that, res) {
                    res = angular.copy(res);
                    //res.data = res.data.MemberContac;
                    that.$userCan = candidateForm.$userCan; // Pass entity actions to the personal info object
                    that.selectData= {

                    };
                    return res;
                },
                saveDataSuccessFn: function(that) {
                    that.$editing = false;
                },
                customProperties: {
                    
                },
                saveAction: 'updatePersonalInfo',
                successMsg: 'Your personal information has been updated successfully',
                errorMsg: 'Your personal information could not be updated at this time.  Please try again later'
            };

        return new ProfileFormFactory(OPTIONS);
    };

    CandidateProfile.prototype.$save = function(type) {

    };



    return CandidateProfile;

}]);
