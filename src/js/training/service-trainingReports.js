
angular.module('ui.services')


// Training Reports factory
// ----------------------------------------
    
/*
POST api/reporting/training/members?o={o}&p={p}&ps={ps} 
    Retrieves a training report by member

POST api/reporting/training/courses/{courseId}/members?o={o}&p={p}&ps={ps}
    Retrieves a training report by Member for a Training Course

POST api/reporting/training/subjects/{subjectId}/members?o={o}&p={p}&ps={ps}
    Retrieves a training report by Member for a Training Subject

POST api/reporting/training/courses/{courseId}/subjects/{subjectId}/members?o={o}&p={p}&ps={ps}
    Retrieves a training report by Member for a Training Subject by Training Course

POST api/reporting/training/networkgroups?o={o}&p={p}&ps={ps}   
    Retrieves a training report by network group

POST api/reporting/training/roles?o={o}&p={p}&ps={ps}   
    Retrieves a training report by role

POST api/reporting/training/courses?o={o}&p={p}&ps={ps} 
    Retrieves a training report by Training Course

POST api/reporting/training/subjects?o={o}&p={p}&ps={ps}
    Retrieves a training report by Training Subject
*/

.factory('ServiceTrainingReports', ['$server','API_BASE_URL','Paths', '$sce',
        function($server, API_BASE_URL, Paths, $sce) {

    var TRAINING_NAMESPACE = API_BASE_URL;

    var parseTrainingRoute = function(type, id, type2, id2) {

        var url = id && id2 ?
            Paths.get('reporting.trainingApi.courses.subjects.members', id, id2).path :
            type && id ?
                Paths.get('reporting.trainingApi.members', type, id).path :
                type ?
                    Paths.get('reporting.trainingApi', type).path :
                    '';


        return url;
    };

    var TrainingReports = {


        getReport: function(paginationData, type, id, groups, roles, type2, id2) {

            var trainingRoute = parseTrainingRoute(type, id, type2, id2);

            var query = {
                'p': paginationData.page,
                'ps': paginationData.pageSize
            };

            if(paginationData.filterBy) {
                query.f = paginationData.filterBy;
            }

            var data = {
                NetworkGroupIds: groups,
                RoleIds: roles
            };

            var url = trainingRoute + '/preview?' + Object.keys(query)
                .map(function(key) {

                    return key + '=' + query[key];

                }).join('&');

            return $server.create({
                'url': url,
                'data': data
            });
        },

        getDownloadUrl: function(type, id, tak, type2, id2) {

            var qs = '?key=' + tak + '&format=csv';
            var url = id && id2 ?
                Paths.get('reporting.trainingApi.courses.subjects.members', id, id2).path :
                id ?
                    Paths.get('reporting.trainingApi.members', type, id).path :
                    Paths.get('reporting.trainingApi', type).path;

            url += qs;

            return url;
        },

    };

    return TrainingReports;

}]);
