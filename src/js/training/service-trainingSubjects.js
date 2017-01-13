angular.module('ui.services')


// Training subjects factory
// ----------------------------------------

.factory('TrainingSubjects', ['$server', 'API_BASE_URL', '$HTTPCache', 'Paths', function($server, API_BASE_URL, $HTTPCache, Paths) {

  var TRAINING_NAMESPACE = API_BASE_URL + 'training-subjects/';

  var TrainingSubjects = {
      get: function(data) {

          var query = {
              'p': data.page,
              'ps': data.pageSize,
              'o': data.orderBy || 'Title'
            };

          if( data.filterBy ) {
              query.a = (data.filterBy === 'Active') ? 'True': 'False';
            }

            // Append Ascending
          query.o += data.acending ? '+Asc' : '+Desc';

          var url = TRAINING_NAMESPACE;

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
                
              res.data = res.data.TrainingSubjectSummaryItemResults.map(function(subject) {
                  return subject.TrainingSubjectSummary;
                });

              return res;
            });

        },
      getById: function(id) {
            
          var url = TRAINING_NAMESPACE + id;
          return $server.get({
              'url': url
            }).then(function(res) {
                
              res.data = res.data.TrainingSubjectDetail;
                
                // Special manipulation for FileStore if it exists
              var subject = res.data;

                //Setting up the selected training courses to be in the same data format needed to submit
              if(subject.trainingCourseIds) {
                  subject.trainingCourseIds = subject.TrainingCourses.map(function(course) {
                      return course.TrainingCourseId;
                    });
                }

              return res;

            });

        },
      getByIdForLaunch: function(id) {
            
          var url = TRAINING_NAMESPACE + id + '/launch';
          return $server.get({
              'url': url
            }).then(function(res) {
                
                
                // Special manipulation for FileStore if it exists
              var subject = res.data.TrainingSubjectLaunch;

              if(res.data.IsThirdParty) {
                  $HTTPCache.clear([url]);
                }
                
              return res;

            });

        },
      getThirdPartyUrl: function(id) {
            
          var url = TRAINING_NAMESPACE + id + '/launch-url';

          return $server.get({
              url: url
            });
        },
      getByCourseId: function(courseId) {

          var url = API_BASE_URL + 'training-courses/' + courseId + '/training-subjects';

          return $server.get({
              'url': url
            });

        },
      create: function(subject) {

          var url = TRAINING_NAMESPACE;

            //A copy needs to be done, to prevent side-effects to the original subject data on the controller
          var subjectData = angular.copy(subject);
            
          if(subjectData.FileStoreId) {
              subjectData.FileStoreId = subjectData.FileStoreId[0];
            }
            
          return $server.create({
              'url': url,
              'data': subjectData
            }).then(function(res) {
                
              $HTTPCache.clear([TRAINING_NAMESPACE, 'training-courses']);

              return res;
            });

        },
      update: function(subject) {

          var url = TRAINING_NAMESPACE + subject.TrainingSubjectId;
            
            //A copy needs to be done, to prevent side-effects to the original subject data on the controller
          var subjectData = angular.copy(subject);

          if(subjectData.FileStoreId) {
              subjectData.FileStoreId = subjectData.FileStoreId[0];
            }

          return $server.update({
              'url': url,
              'data': subjectData
            }).then(function(res) {
                
              $HTTPCache.clear([TRAINING_NAMESPACE, 'training-courses']);
                
              return res;
            });

        },
      reset: function(subjectId) {
            
          var url = TRAINING_NAMESPACE + subjectId + '/progresses/reset';
            
          return $server.update({
              'url': url
            }).then(function(res) {

              $HTTPCache.clear([TRAINING_NAMESPACE, 'training-courses']);
                
              return res;
            });

        }
    };

  return TrainingSubjects;

}]);