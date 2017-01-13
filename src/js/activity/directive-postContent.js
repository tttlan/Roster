angular.module('ui.activity')

// Activity Post Content
// ----------------------------------------

.directive('postContent', ['$compile', '$http', '$templateCache', '$q', function($compile, $http, $templateCache, $q) {

  var POST_TEMPLATE_PATHS = {
      BlogEntry: 'post-blog-entry',
      HtmlContent: 'post-html',
      LibraryDocument: 'post-library-document',
      LibraryDocumentChanged: 'post-library-document',
      MemberUpdate: 'post-member-update',
      TeamPost: 'post-team-update',
      ProfilePost: 'post-profile',
      MemberProfileUpdate: 'post-profile-update',
      PrivateMessage: 'post-private-message',
      Job: 'post-job',
        Request: 'post-request',
        Event: 'post-event'
    };

  return {
      restrict: 'E',
      controller: function($scope, $element, $attrs) {
            
            //Wait for type attr to be populated
          $attrs.$observe('type', function(newVal) {
              if(newVal) {
                  loadTemplate(newVal);
                  delete $attrs.$$observers.type;
                }
            });

          function getTemplate(templateUrl) {

              var deferred = $q.defer();
              var fromCache = $templateCache.get(templateUrl);
                
              if( fromCache ) {
                  deferred.resolve(fromCache);
                } else {
                  $http.get(templateUrl).success(function(data) {
                      deferred.resolve(data);
                    });
                }

              return deferred.promise;
                
            }

          function loadTemplate(newVal) {
                
              var postPath = POST_TEMPLATE_PATHS[ newVal ] || 'post-default';
              var templateUrl = '/interface/views/activity/partials/' + postPath + '.html';

              getTemplate(templateUrl).then(function(data) {
                    
                  var html = $compile(data)($scope);

                  $element.replaceWith(html);

                });

            }
        }
    };
}]);