angular.module('ui.mockData').
factory('MockData', ['$http', '$q', function($http, $q) {
    var profileNotes = [];

    function getProfileNotes(p) {
        return profileNotes.slice(p.PageSize * (p.Page - 1), p.Page * p.PageSize);
    }
    function createProfileNoteResponsePost(obj) {
         var data = angular.copy(obj);
        data.id = profileNotes.data.length;
        profileNotes.push({ProfileNote: data});
        fakeRes.resolve({ data: 
            {
                "$id": "1",
                "Data": data.id,
                "Status": 0
            }
        });
         return fakeRes.promise;
    }

    $http({ method: 'GET', url: '/interfaceSource/src/js/mockdata/apidata/profile-notes.json'
    }).then(function successCallback(res) {
        profileNotes = res.data.ContentSummaryItemResults;
        for(var i  = 0; i < profileNotes.length ; i++) {
            profileNotes[i].ContentId = i;
        }
        return res;
    });

    function createProfileNoteResponseList(p) {
        var fakeRes = $q.defer();
        setTimeout(function() {
            fakeRes.resolve({
                data: { ContentSummaryItemResults: getProfileNotes(p) },
                headers: function() {
                    return {
                        TotalCount: profileNotes.length,
                        TotalPages: Math.ceil(profileNotes.length / p.PageSize),
                        PageSize: p.PageSize,
                        Page: p.Page
                    };
                }
            });
        }, 1000);

        return fakeRes.promise;
    }
    return {
        createProfileNoteResponsePost: createProfileNoteResponsePost,
        createProfileNoteResponseList: createProfileNoteResponseList   
    };
}]);