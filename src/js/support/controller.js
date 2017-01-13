angular.module('ui.support')

.controller('supportFAQS', ['$scope', '$timeout', 'Support', function($scope, $timeout, Support) {

    //$scope.faqs = Support.getFAQS('21199125');

  $scope.faqs = {
      'topics': [{
          'url': 'https://sherpasupport.zendesk.com/api/v2/topics/54009755.json',
          'id': 54009755,
          'title': 'I\'ve forgotten my password',
          'body': '<p>Oh no! You\'ve forgotten your password?</p>\r\n<p>Retrieving your password to access the Sherpa Platform is easy. Simply click the \'Forgotten Password?\' link on your platform\'s login screen, and enter the address linked to your Sherpa account.</p>\r\n<p>The process for retrieving your login details will then be sent to your email address.</p>',
          'topic_type': 'Articles',
          'submitter_id': 675527386,
          'updater_id': 675527386,
          'forum_id': 21199125,
          'locked': true,
          'pinned': true,
          'highlighted': false,
          'position': null,
          'tags': ['forgotten', 'password'],
          'attachments': [],
          'comments_count': 0,
          'created_at': '2014-09-17T05:47:47Z',
          'updated_at': '2014-09-17T05:47:47Z',
          'search_phrases': []
        }],
      'next_page': null,
      'previous_page': null,
      'count': 1
    };

}])

.controller('supportRequests', ['$scope', '$timeout', 'Support', function($scope, $timeout, Support) {

  $scope.sendSupportRequest = function(modelData) {
      return Support.sendSupportRequest(modelData);
    };

}]);