angular.module('ui.activity')

// Activity Feed
// ----------------------------------------

.directive('activityFeed', ['Members', 'Activities', '$window', '$timeout', '$modal', 'Url', '$parse', '$notify', 'feedItemFactory',
    function(Members, Activities, $window, $timeout, $modal, Url, $parse, $notify, feedItemFactory) {

      return {
      restrict: 'E',
      templateUrl: '/interface/views/activity/partials/feed.html',
      replace: true,
      controller: function($scope, $element, $attrs) {
    
          var pageCount = 0;
          var pageSize = 20;
          var feedType = $attrs.type;
          var typeId = $attrs.typeid ? $parse($attrs.typeid)($scope) : false;
         
          $scope.loading = true;
          $scope.postFocused = false;
          $scope.hideUploader = true;
          $scope.feedType = feedType;

          $scope.posts = [];

            //Load in current Member
          Members.me().then(function(response) {
              $timeout(function() {
                  $scope.currentUser = response.data;
                });
            });

            // watch for newpost changes
          $scope.$watchCollection('newPost', function(newVal, oldVal) {
              if (newVal) {
                  $scope.postExpanded = true;
                }
            });

            // Can the user post?
          function canUserPost(newPost) {
                // if object does not exist
              if (!newPost) {
                  return false;
                }
                // if is currently uploading
              if ($scope.uploadingAttachment) {
                  return false;
                }
                // if content is not empty
                // if file object exists and has length
              if ( (newPost.content && newPost.content !== '') || (newPost.files && newPost.files.length) ) {
                  return true;
                }
            }

            // is posting disabled 
          $scope.disabledPost = function() {
              return canUserPost($scope.newPost) ? false : true;
            };

            // Add a new text post
          $scope.addPost = function(newPost) {
                //Strip all tags from post
              newPost.content = Url.stripHtml(newPost.content);

              if( canUserPost(newPost) ) {

                  var enrichedContent = Url.parseText(newPost.content);
                    
                  var post = {
                      content: {
                          ContentText: enrichedContent.text,
                          media: enrichedContent.media,
                          Owner: {
                              FirstName: $scope.currentUser.FirstName,
                              PhotoThumb: $scope.currentUser.MemberProfile.PhotoThumb,
                              Surname: $scope.currentUser.Surname
                            }
                        },
                      userCan: {
                          delete: true,
                          view: true
                        },
                      feedGroup: 'richText',
                      feedType: 'MemberUpdate',
                      comments: [],
                      commentCount: 0,
                      likes: [],
                      likeCount: 0,
                      views: 0,
                      published: new Date(),
                      attachments: []
                    };

                    //Init post
                  post = feedItemFactory.$init(post);

                  var postObj = {
                      Content: newPost.content,
                      FileStoreIds: newPost.files || [],
                      PostDestination: 3
                    };

                    // Set the Type ID
                  postObj[ (feedType === 'profile') ? 'PostMemberId' : 'GroupId' ] = typeId;

                  $scope.page.items.unshift(post);
                  $scope.newPost = {};
                  $scope.postFocused = false;
                  $scope.postExpanded = false;

                    // sync data
                  post.sync(feedType, postObj);
                }
            };

            // Get posts from server
          $scope.getNewsFeed = function(page, pageSize, orderBy, acending, filterBy) {
              return Activities.getFeed(feedType, typeId, page, pageSize, orderBy, acending, filterBy).then(function(res) {
                    //If there is attachments, lets load them in
                  $scope.userCan = res.data.permissions;
                  res.data = res.data.items.map(function(feedItem) {
                      return feedItemFactory.$init(feedItem);
                    });

                  return res;
                });
            };

            // show the uploader
          $scope.triggerUploader = function() {
              $('.uploader').find('input[type=file]').click();
            };

        }
    };
    
    }]);
