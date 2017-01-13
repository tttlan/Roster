
// Newsfeed
// ----------------------------------------

angular.module('ui.newsFeed')


// Blog Post Manage Controller
// ------------------------------------------------

.controller('dashboardNewsManageCtrl', ['$scope', 'BlogService', '$window', '$timeout', '$modal', '$notify',
    function($scope, BlogService, $window, $timeout, $modal, $notify) {

      $scope.permissions = null;

      $scope.getBlogFeed = function(page, pageSize, orderBy, acending, filterBy) {
      return BlogService.getMyBlogs(page, pageSize, orderBy, acending, filterBy).then(function(res) {

          if (!$scope.permissions) {
              $scope.permissions = res.data.permissions || {};
            }
            
          res.data = res.data.items;
          return res;
        });
    };

      $scope.deleteBlog = function(blog, $index) {

      BlogService.removeArticle(blog.Id).then(function(res) {
          $notify.add({
              message: 'Your article has been deleted',
              type: 'success'
            });
        });
        //blog.hide = true;
      $scope.page.items.splice($index, 1);
    };

    }]);