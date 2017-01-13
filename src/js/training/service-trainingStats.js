
angular.module('ui.services')


// Training Reports factory
// ----------------------------------------
    
/*
GET api/stats/training/courses 
    Retrieves training course stats

GET api/stats/training/subjects 
    Retrieves training subject stats

GET api/stats/training/subjects/daily 
    Retrieves training subject daily completion stats over a date range
*/

.factory('ServiceTrainingStats', ['$server','API_BASE_URL','$filter',
        function($server, API_BASE_URL,$filter) {

          var TRAINING_NAMESPACE = API_BASE_URL + 'stats/training/';

          var TrainingStats = {


      getCourseStats: function() {

          var url = TRAINING_NAMESPACE + 'courses';
          return $server.get({'url': url });
        },

      getSubjectStats: function() {

          var url = TRAINING_NAMESPACE + 'subjects';
          return $server.get({'url': url });
        },

      getSubjectDailyStats: function(dateFrom, dateTo) {

          var df = $filter('dateStamp')(dateFrom);
          var dt = $filter('dateStamp')(dateTo);

          var url = TRAINING_NAMESPACE + 'subjects/daily';
          var query = {
              'df':df,
              'dt':dt,
            };

          return $server.get({
              'url': url,
              'query': query
            });
        },



    };

          return TrainingStats;

        }]);