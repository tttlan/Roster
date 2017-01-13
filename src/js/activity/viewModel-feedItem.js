angular.module('ui.activity')


// Feed item
// ----------------------------------------
    .factory('feedItemFactory', [
        '$modal', 'Activities', '$timeout', 'Paths', '$notify',
        function($modal, Activities, $timeout, Paths, $notify) {

            function FeedItem(FeedItemData) {
                angular.extend(this, FeedItemData);
            }

            FeedItem.prototype.hasAttachment = function() {
                var post = this;
                var hasMedia = (post.content.media && post.content.media.length ? true : false),
                    hasFile = (post.attachments && post.attachments.length ? true : false);
                return hasFile || hasMedia;
            };

            // Delete post
            FeedItem.prototype.delete = function() {
                this.isDeleted = true;
                this.content = {};
                this.userCan = {};
                this.owner = {};
                return this.$activities.removePostFromFeed(this.id);
            };

            // get members Likes for activity
            FeedItem.prototype.showLikes = function() {

                var feedItem = this;

                var modal = feedItem.$modal.open({
                    templateType: 'drawer',
                    templateUrl: '/interface/views/common/partials/peopleList.html',
                    controller: SHRP.ctrl.ModalPeopleListCTRL,
                    title: 'Likes',
                    name: 'd',
                    resolve: {
                        getItems: function() {
                            return function(pageNum) {
                                return feedItem.$activities.getLikes('news', feedItem.id, pageNum, 20).then(function(res) {
                                    res.data = res.data.MemberSummaryItemResults.map(function(member) {
                                        member = member.MemberSummary;
                                        member.body = member.RoleTitle;
                                        return member;
                                    });
                                    return res;
                                });
                            };
                        },
                        count: function() {
                            return feedItem.likeCount;
                        },
                        titleSyntax: function() {
                            return {
                                verb: {
                                    singular: 'has',
                                    plural: 'have'
                                },
                                noun: 'liked ' + (feedItem.owner.FirstName || feedItem.content.Owner.FirstName) + '\'s post'
                            };
                        }

                    }
                });
            };

            //Open up popup
            FeedItem.prototype.referFriend = function(job) {
                var feedItem = this;
                job.content.JobId = job.entityKey;

                var modal = feedItem.$modal.open({
                    templateType: 'modal',
                    templateUrl: '/interface/views/common/partials/modal-refer-friend.html',
                    controller: SHRP.ctrl.ModalReferFriendCTRL,
                    resolve: {
                        job: function() {
                            return job.content;
                        }
                    },
                    name: 'referFriend'
                }).result.then(function(data) {

                    feedItem.$notify.add({
                        message: 'Your Refer a Friend request has been sent! You\'re a good friend.',
                        type: 'success'
                    });

                });

            };

            // Sync post (creates post and injects the returned data into the feed)
            FeedItem.prototype.sync = function(feedType, postObj) {

                var feedItem = this;
                postObj = postObj || this;

                feedItem.loading = true;
                feedItem.failed = false;

                feedItem.$activities.createPostToFeed(feedType, postObj).then(function(response) {
                    feedItem.$timeout(function() {
                        feedItem.id = response.data.FeedEntrySummary.Id;
                        feedItem.attachmentCount = response.data.FeedEntrySummary.AttachmentCount;
                        feedItem.userCan = {
                            delete: true,
                            view: true,
                            like: true,
                            edit: true,
                            cancomment: true
                        };
                        feedItem.loading = false;
                        feedItem.failed = false;
                    });

                }, function(response) {
                    feedItem.$timeout(function() {
                        feedItem.loading = false;
                        feedItem.failed = true;
                    });
                });
            };

            // Inject services
            FeedItem.prototype.$modal = $modal;
            FeedItem.prototype.$activities = Activities;
            FeedItem.prototype.$timeout = $timeout;
            FeedItem.prototype.$notify = $notify;

            return {
                $init: function(data) {
                    var item = new FeedItem(data);
                    return item;
                }
            };

        }
    ]);