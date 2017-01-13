angular.module('ui.services')


// Members factory
// ----------------------------------------

.factory('Members', ['$server', 'API_BASE_URL', '$HTTPCache', function($server, API_BASE_URL, $HTTPCache) {

  var MEMBER_NAMESPACE = API_BASE_URL + 'members/';
    
  var Member = {
      me: function() {
          var url = MEMBER_NAMESPACE + 'me';
            
          return $server.get({'url': url}).then(function(response) {
              response.data = response.data.Member;
              return response;
            });
            
        },

        getMyProfile: function() {
            var url = API_BASE_URL + '/profilemanagement/me/profilerecord';

            return $server.get({ 'url': url }).then(function(response) {
                response.data = response.data.ProfileRecord;
                return response;
            });
        },

        all: function() {

            var url = API_BASE_URL + 'members?f=0&ps=200';

          return $server.get({'url': url});

        },

      get: function(memberId) {

          var url = MEMBER_NAMESPACE + memberId;
            
          return $server.get({'url': url});

        },

      getTrainingCourses: function(paginationData) {

          var query = {
              'p': paginationData.page,
              'o': paginationData.orderBy,
              'ps': paginationData.pageSize,
              'f': paginationData.filterBy || 'Open'
            };

          var url = MEMBER_NAMESPACE + 'me/training-courses';
            
          return $server.get({
              'url': url,
              'query': query
            });

        },

      getTrainingSubjectsByCourseId: function(courseId) {

          var url = MEMBER_NAMESPACE + 'me/training-courses/' + courseId + '/training-subjects';

          return $server.get({
              'url': url
            });

        },

      updateTrainingSubjectProgress: function(subjectId, data) {
            /*

            data = memberstatus or score

            TrainingSubjectMemberProgressStatus can equal 1 - 4:
                New: 1
                InProgress: 2
                Passed: 3
                Failed: 4
            
            */
            
          var url = MEMBER_NAMESPACE + 'me/training-subjects/' + subjectId + '/progresses';
          return $server.create({
              'url': url,
              'data': data
            }).then(function(res) {
                
              $HTTPCache.clear(['training-courses', 'training-subjects']);

              return res;
            });
        },

        //Get the member profile listing
      getProfiles: function(page, pageSize, searchOpts, searchTerm, state) {

          var query = {
              'sf': searchOpts,
              'st': searchTerm,
              'state': state,
              'p': page,
              'ps': pageSize,
              'rc': 1
            };

          var url = API_BASE_URL + 'profilemanagement/getmembersprofile';

          return $server.get({
              'url': url,
              'query': query
            }).then(function(res) {

              res.data.map(function(member) {
                  member.Fullname = member.FirstName + ' ' + member.Surname;
                  return member;
                });

              return res;

            });

        },

        // pings the server to set online status
      stillOnline: function() {
        
          var url = '/components/network/chat/ChatUpdate.ashx',
              data = {
                  sil: 1, // SilentMode will only send a .JSONSummaryUpdatesOnly instead of all messages
                  upd: -1 // Id of last chat update, which i guess being -1 will just fail and hopefully not bother returning anything
                };
                
          return $server.create({
              url: url,
              data: data,
              type: 'formData'
            });

        },
                
        updatePassword: function(data) {
        
            var url = API_BASE_URL + 'profilemanagement/memberpassword';
            
            return $server.update({
                'url': url,
                'data': data
            }).then(function(res) {
                
                $HTTPCache.clear('profilemanagement');
                return res;
            });
        }

    };

  return Member;

}]);