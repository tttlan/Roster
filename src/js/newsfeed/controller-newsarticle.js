
// Newsfeed
// ----------------------------------------

angular.module('ui.newsFeed')


// Blog Post Controller
// ------------------------------------------------

.controller('dashboardNewsArticleCtrl', ['$scope', 'BlogService', 'Members', '$window', '$timeout', '$routeParams', '$rootScope', '$location', '$templateCache',
    function($scope, BlogService, Members, $window, $timeout, $routeParams, $rootScope, $location, $templateCache) {

      var articleId = $routeParams.id;
      $rootScope.blackout = !!$routeParams.a;
      $scope.loading = true;
      $scope.blog = {};

    
    // GET article
    // ------------------------------------------------

      BlogService.getById(articleId).then(function(response) {
        
      angular.extend($scope.blog, response);
      $scope.loading = false;
      $rootScope.title = $scope.blog.Title;

        //populate fileStoreIds
      $scope.blog.Attachments = response.AttachmentsAttached
        .filter(function(file) {
          return file.FileStores[0].FileStoreId;
        })
        .map(function(file) {
          var fileStore = file.FileStores[0];
          return {
              FileName: fileStore.FileName,
              FileSize: fileStore.FileSize,
              FileExtension: fileStore.FileName.split('.').pop().toLowerCase(),
              FileStoreId: fileStore.FileStoreId
            };
        });

      $scope.readReceipt(response.ActivityId, 2);

    });

    // POST Read Receipt
    // -------------------------------------------------

      $scope.postingReceipt = false;
     
      function gotoReturnUrl() {
      var redirectPath = $routeParams.retUrl || '/dashboard';
      $scope.postingReceipt = false;
      $rootScope.blackout = false;
      $location.url(redirectPath);
    }

      $scope.readReceipt = function(id, status) {
        
      if(status > 3) {
          $scope.postingReceipt = true;
        }

      BlogService.createView(id, status).then(function(response) {
            
          if(status > 3) {
              gotoReturnUrl();
              $scope.postingReceipt = false;
            }
            
        }, function() {
            
          if(status > 3) {
              gotoReturnUrl();
              $scope.postingReceipt = false;
            }

        });
    };

    // Get likes and views
    // ------------------------------------------------

      $scope.showLikes = function(blog) {

      BlogService.showLikesModal(blog);
    };

      $scope.showViews = function(blog) {

      BlogService.showViewsModal(blog);
    };

    //Load in current Member
      Members.me().then(function(response) {
      $scope.currentUser = response.data;
    });


    // Get Likes
    // ------------------------------------------------
      BlogService.getLikesById(articleId, 1, 5).then(function(response) { // Limit to 5 likes

      $scope.blog.Likes = response.data.MemberSummaryItemResults;
    });

    }]);