angular.module('ui.activity')


// Template Directive for comments
// ------------------------------------------------

.directive('postComments', ['Activities', 'Url', function(Activities, Url) {
    return {
        restrict: 'E',
        templateUrl: '/interface/views/activity/partials/comments.html',
        replace: true,
        scope: {
            disableComment: '@',
            resourceType: '@',
            resourceId: '=',
            currentUser: '=',
            count: '=commentCount',
            showAddComment: '='
        },
        controller: function($scope, $element, $attrs) {
            // Our comments list
            var pageSize = $attrs.ps || 5;
            var currentPage = 0;
            $scope.comments = [];
            $scope.moreToLoad = false;
            $scope.gettingComments = false;
            $scope.count = Number($scope.count) || 0;

            // Get Comments
            $scope.getComments = function() {
                if ($scope.resourceId && !$scope.gettingComments) {

                    $scope.gettingComments = true;

                    // value for load more comment in lightbox of library
                    //if (loadMoreComment) {
                        currentPage++;
                    //} else {
                    //    currentPage = 1;
                    //}

                    Activities.getComments($scope.resourceType, $scope.resourceId, currentPage , pageSize).then(function(response) {
                        //Can we check for more
                        $scope.moreToLoad = (pageSize * currentPage < $scope.count);
                        $scope.commentsLoaded = true;
                        $scope.gettingComments = false;
                        $scope.showAddComment = true;
                        $scope.comments = response.data.reverse().concat($scope.comments);

                    });
                }

            };

            // Add a new comment

            $scope.addComment = function(newComment) {
                newComment = Url.stripHtml(newComment);
                if(newComment) {

                    var obj = {
                        CommentSummary: {
                            DateCommented: new Date().toUTCString(),
                            Comment:newComment,
                            HtmlComment: Url.parseText(newComment).text,
                            Owner: {
                                'MemberId': $scope.currentUser.MemberId,
                                'FirstName': $scope.currentUser.FirstName,
                                'Surname': $scope.currentUser.Surname,
                                'PhotoThumb': $scope.currentUser.MemberProfile.PhotoThumb
                            },
                            userCan: {
                                delete: true
                            }
                        },
                        loading: true,
                        failed: false
                    };
                    $scope.comments.push(obj);
                    $scope.count++;

                    $scope.newComment = '';

                    $scope.syncComment(obj);
                }
            };

            $scope.deleteComment = function(indx) {
                // call to delete
                var removed = $scope.comments.splice(indx, 1)[0];

                var id;
                //If there isn't an ID it hasn't been posted back from server yet, so let's just delete it
                if (removed.CommentSummary) {
                    id = removed.CommentSummary.Id;
                } else if (removed.BlogFeedEntry) {
                    id = removed.BlogFeedEntry.Id;
                } else if (removed.EventFeedEntry) {
                    id = removed.EventFeedEntry.Id;
                }

                $scope.count--;

                if(!id) { return; }

                Activities.removeComment($scope.resourceType, $scope.resourceId, id)
                    .then(function(ret) {
                        // console.log('comment removed');
                    }, function(ret) {
                        // console.log('failed: comment removed');
                    });

            };


            // Sync comment

            $scope.syncComment = function(comment) {
                comment.loading = true;
                
                var obj = {
                    'Comment': comment.CommentSummary.Comment
                };

                Activities.createComment($scope.resourceType, $scope.resourceId, obj)
                    .then(function(response) {
                        
                        angular.extend(comment, response);
                        comment.loading = false;
                    }, function(response) {
                        comment.loading = false;
                        comment.failed = true;
                    });

            };

            var watch = $scope.$watch('resourceId', function(newVal) {
                if($scope.count > 0 && newVal) {
                    $scope.getComments();
                    watch();
                }
            });

        }
    };
}]);