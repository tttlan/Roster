
angular.module('ui.services')


// Training Courses factory
// ----------------------------------------

.factory('TrainingCourses', ['$server', '$q', 'TrainingSubjects', 'API_BASE_URL', '$HTTPCache', '$filter', 'Networks',
        function($server, $q, TrainingSubjects, API_BASE_URL, $HTTPCache, $filter, Networks) {

    var TRAINING_NAMESPACE = API_BASE_URL + 'training-courses/';

    return {
        getById: function(id) {
            
            var url = TRAINING_NAMESPACE + id;

            return $server.get({'url': url });

        },
        getSubjectsById: function(id) {
            
            var url = TRAINING_NAMESPACE + id + '/training-subjects';

            return $server.get({'url': url }).then(function(res) {

                res.data = res.data.TrainingSubjectForCourseSummaryItemResults.map(function(subject) {
                    return subject.TrainingSubjectForCourseSummary;
                });

                return res;
            });

        },
        get: function(paginationData) {

            var query = {
                'p': paginationData.page,
                'ps': paginationData.pageSize,
                'o': paginationData.orderBy || 'Title'
            },
            url = TRAINING_NAMESPACE;

            if(paginationData.filterBy) {
                query.f = paginationData.filterBy;
            }

            // Append Ascending
            query.o += paginationData.acending ? '+Asc' : '+Desc';

            return $server.get({
                'url': url,
                'query': query
            }).then(function(res) {

                //Build the permissions and insert into the response
                res.userCan = {};
                res.data.EntityActions.forEach(function(actionData) {
                    
                    var action = String(actionData.Description).toLowerCase();

                    res.userCan[action] = true;

                });

                //clear the response data, to just contain the training courses array, as the paginate object needs
                res.data = res.data.TrainingCourseSummaryItemResults.map(function(course) {
                    return course.TrainingCourseSummary;
                });

                return res;
            });
        },
        getProgress: function(courseId, subjectId, paginationData) {

            var query = {
                'p': paginationData.page,
                'ps': paginationData.pageSize,
                'o': paginationData.orderBy
            };

            // Append Ascending
            if(!paginationData.acending) {
                query.o += '+Desc';
            }

            //selecting a subject ID is optional
            var subjectPath = subjectId ? '/training-subjects/' + subjectId : '' ;

            var url = TRAINING_NAMESPACE + courseId + subjectPath + '/progresses';
            
            return $server.get({
                'url': url,
                'query': query
            }).then(function(res) {

                res.data = res.data.TrainingSubjectMemberProgressDetailItemResults.map(function(progress) {
                    return progress.TrainingSubjectMemberProgressDetail;
                });

                return res;
            });
            
        },
        getMembers: function(courseId, paginationData) {
            
            var query = {
                'p': paginationData.page,
                'ps': paginationData.pageSize,
                'o': paginationData.orderBy
            };

            // Append Ascending
            if(!paginationData.acending) {
                query.o += '+Desc';
            }

            var url = TRAINING_NAMESPACE + courseId + '/members';
            
            return $server.get({
                'url': url,
                'query': query
            });
            
        },
        getCsvUrlForMembers: function(id) {
            return TRAINING_NAMESPACE + id + '/members?format=csv';
        },
        create: function(course) {
            
            var url = TRAINING_NAMESPACE;
            
            return $server.create({
                'url': url,
                'data': course
            }).then(function(res) {
                
                $HTTPCache.clear('training-courses');

                return res;
            });

        },
        update: function(course) {
            
            var url = TRAINING_NAMESPACE + course.TrainingCourseId;

            return $server.update({
                'url': url,
                'data': course
            }).then(function(res) {
                
                $HTTPCache.clear('training-courses');

                return res;
            });

        },
        publish: function(courseId, groups, roles) {
            
            var url = TRAINING_NAMESPACE + courseId + '/publish',
                groupIds = Networks.formatGroups(groups),
                roleIds = Networks.formatRoles(roles);

	        groupIds = groupIds.map(function(group) {
		        group.DistributionType = 2; //NetworkGroup
		        return group;
	        });

            return $server.update({
                'url': url,
                'data': {
                    Distributions: groupIds,
                    RoleIds: roleIds
                }
            }).then(function(res) {
                
                $HTTPCache.clear('training-courses');

                return res;
            });

        },
        assignSubjects: function(courseId, subjectIds) {

            var url = TRAINING_NAMESPACE + courseId + '/training-subjects';

            return $server.create({
                'url': url,
                'data': subjectIds
            }).then(function(res) {
                
                $HTTPCache.clear('training');

                return res;
            });
        },
        assignGroups: function(courseId, groupIds) {

            var url = TRAINING_NAMESPACE + courseId + '/distributions';

            return $server.create({
                'url': url,
                'data': groupIds
            }).then(function(res) {
                
                $HTTPCache.clear('training-courses');

                return res;
            });
        },
        getGroupsById: function( courseId ) {

            var url = TRAINING_NAMESPACE + courseId + '/distributions';
            
            return $server.get({
                'url': url
            }).then(function(res) {

                res.data = res.data.map(function(group) {
                    return {
                        label: group.Title,
                        value: {
                            DistributionId: group.DistributionId,
                            DistributionType: group.DistributionType
                        }
                    };
                });

                return res;

            });
            
        },
        assignRoles: function(courseId, RoleIds) {

            var url = TRAINING_NAMESPACE + courseId + '/roles';

            return $server.create({
                'url': url,
                'data': RoleIds
            }).then(function(res) {
                
                $HTTPCache.clear('training-courses');

                return res;
            });
        },
        getRolesById: function( courseId ) {

            var url = TRAINING_NAMESPACE + courseId + '/roles';
            
            return $server.get({
                'url': url
            }).then(function(res) {

                res.data = res.data.map(function(role) {
                    return {
                        label: role.Description,
                        id: role.RoleId
                    };
                });
                return res;

            });

        }

    };

}]);