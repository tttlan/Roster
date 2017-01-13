angular.module('ui.activity')

// Activities service
// ----------------------------------------
// Description:
// This is resource adnostic, we pass in which data type it needs to get from, this allows us to extend out from
// this service, instead of duplicating these same calls from within all of the various resource services
// ----------------------------------------

.factory('Activities', ['$server', '$HTTPCache', 'API_BASE_URL', 'Url', 'Permissions',
    function($server, $HTTPCache, API_BASE_URL, Url, Permissions) {

    // Acitivity feed items
    var FEED_TYPES = {
        0: 'None',
        1: 'Job',
        9: 'HtmlContent',
        22: 'LibraryDocumentChanged',
        26: 'MemberUpdate',
        27: 'InternalJob',
        32: 'MemberReferal',
        33: 'ProfilePost',
        34: 'TeamPost',
        39: 'BlogEntry',
        40: 'LibraryDocument',
        41: 'Request',
        42: 'PrivateMessage',
        44: 'Event',
        51: 'MemberProfileUpdate',
        54: 'InternalJobUpdate',
        98: 'TextContent',
        99: 'HtmlContent'
    };
    //Activity feed group type
    var FEED_GROUPS = {
        0: 'none',
        1: 'job',
        9: 'text',
        22: 'library',
        26: 'richText',
        27: 'job',
        32: 'Referal',
        33: 'richText',
        34: 'richText',
        39: 'text',
        40: 'library',
        41: 'request',
        42: 'message',
        51: 'text',
        98: 'text',
        99: 'text'
    };

    //Different URL Paths to build the Base API URL path from.
    var URL_PATHS = {
        blog: 'blogs/',
        news:  'feeds/',
        event:  'events/',
        onboarding: 'onboarding/',
        bulk: 'onboarding/bulk/'
    };

    var FEED_PATHS = {
        group: 'myteamfeed',
        profile: 'myprofilefeed'
    };
    var UPDATE_PATHS = {
        network: 'memberupdates',
        profile: 'memberprofilepost',
        group: 'memberteamwallpost'
    };

    //Builds the selected Base API Base Path
    function buildBasePath(type) {
        return API_BASE_URL + ( URL_PATHS[type] || '' );
    }

    function buildFeedPath(type, id) {
        
        var idPath = id ? id + '/' : '';
        var feedPath = FEED_PATHS[type] || '';

        return API_BASE_URL + 'feeds/' + idPath + feedPath ;
    }

    // formats the feed JSON object to a better model for the view
    function formatFeedModel(res) {

        var results = res.data.FeedEntrySummaryItemResults || [res.data];

        var feedData = {
            permissions: Permissions.formatPermissions(res.data.EntityActions),
            items: results.map(function(item) {
                
                var feedItem = {};

                if (item.IsDeleted) {
                    
                    feedItem = {
                        isDeleted: true,
                        content: {}
                    };

                } else {

                    var publishDate = moment(item.FeedEntrySummary.DatePublish),
                        accessDate = moment(item.FeedEntrySummary.AccessGrantedDate);

                    feedItem = {
                        content: item.FeedEntrySummary.Content,
                        userCan: Permissions.formatPermissions(item.EntityActions),
                        owner: item.FeedEntrySummary.Owner,
                        feedGroup: FEED_GROUPS[item.FeedEntrySummary.FeedType] || item.FeedEntrySummary.FeedType,
                        feedType: FEED_TYPES[item.FeedEntrySummary.FeedType] || item.FeedEntrySummary.FeedType,
                        comments: item.FeedEntrySummary.Comments,
                        commentCount: item.FeedEntrySummary.CommentCount,
                        likes: item.FeedEntrySummary.Likes,
                        likeCount: item.FeedEntrySummary.LikeCount,
                        liked: item.FeedEntrySummary.HasLiked,
                        views: item.FeedEntrySummary.ViewCount,
                        published: item.FeedEntrySummary.AccessGrantedDate,
                        id: item.FeedEntrySummary.Id,
                        attachmentCount: item.FeedEntrySummary.AttachmentCount,
                        attachments: [],
                        isUpdated: Math.abs(publishDate.diff(accessDate)) > (1000 * 60 * 15) ? true : false,  // date difference more than 15 minutes?
                        entityKey: item.FeedEntrySummary.EntityKey,
                        status: item.FeedEntrySummary.Status
                    };

                    // pretty links and add in external media links
                    if( feedItem.feedGroup === 'richText') {
                        
                        var content = feedItem.content.ContentText || feedItem.content.Message,
                            enrichedText = Url.parseText(content);

                        feedItem.content.ContentText = enrichedText.text;
                        feedItem.content.media = enrichedText.media;
                    }

                    //If library document ( doesn't follow file object patterns)
                    if( feedItem.content.LibraryDocumentId ) {
                        feedItem.attachments.push({
                            FileStoreId: feedItem.content.LibraryDocumentId,
                            FileName: feedItem.content.FileName,
                            FileSize: feedItem.content.FileSize,
                            FileExtension: feedItem.content.FileName.split('.').pop().toLowerCase(),
                            StorageKey: feedItem.content.StorageKey,
                            DocumentUrl: feedItem.content.DocumentUrl
                        });
                    }

                }

                return feedItem;

            })
        };

        res.data = feedData;

        return res;

    }

    function formatComment(comment) {

        if(comment.BlogCommentSummary) { // Blogs only - standise the object format for the different comment types
            comment.CommentSummary = comment.BlogCommentSummary;
            delete comment.BlogCommentSummary;
        }
        
        // Format the comment as per the rules in the url parse text fn
        if(comment.EventCommentSummary) { // Events only - standise the object format for the different comment types
            comment.CommentSummary = comment.EventCommentSummary;
            delete comment.EventCommentSummary;
        }

        if (comment.CommentSummary) { // If a comment has just been posted it won't have any html content
     
            comment.CommentSummary.HtmlComment = Url.parseText(comment.CommentSummary.Comment).text;
            comment.userCan = Permissions.formatPermissions(comment.EntityActions);
            delete comment.EntityActions;
        
        } else { // Comment has just been posted

            comment.userCan = {
                delete: true,
                view: true
            };    
        }

        return comment;
    }

    return {

        // Updates a like to liked/unliked
        updateLike: function(dataType, dataId, shouldLike) {

            var basePath = buildBasePath(dataType);
            var url =  basePath + dataId + '/likes';

            return $server.create({
                'url': url,
                'data': {
                  HasLiked: shouldLike
                }
            }).then(function(res) {
                $HTTPCache.clear(basePath);
                return res;
            });

        },

        // Gets the list of likes for an activty item
        getLikes: function(dataType, dataId, page, pageSize) {

            var url = buildBasePath(dataType) + dataId + '/likes';
            var query = {
                'p': page,
                'ps': pageSize,
                'rc': 0
            };
            
            return $server.get({
                'url': url,
                'query': query
            });

        },

        // gets the list of comments for an activity item
        getComments: function(dataType, dataId, page, pageSize, orderBy, acending, filterBy) {

            var query = {
                'p': page,
                'ps': pageSize,
                'rc': 1
            };

            var url = buildBasePath(dataType) + dataId + '/comments';
            
            return $server.get({
                'url': url,
                'query': query
            }).then(function(response) {
                var results;
                if (response.data.BlogCommentSummaryItemResults) {
                    results = 'BlogCommentSummaryItemResults';
                } else if (response.data.CommentSummaryItemResults) {
                    results = 'CommentSummaryItemResults';
                } else if (response.data.EventCommentSummaryItemResults) {
                    results = 'EventCommentSummaryItemResults';
                }

                //To hack the returned object into the same data structure.
                response.data = response.data[results].map(function(comment) {
                    return formatComment(comment);
                });

                return response;

            });

        },

        // Create a new comment attached to a post
        createComment: function(dataType, dataId, commentObj) {
            var basePath = buildBasePath(dataType);
            var url = basePath + dataId + '/comments';

            return $server.create({
                'url': url,
                'data': commentObj
            }).then(function(res) {
                $HTTPCache.clear(basePath);

                var query = {
                    'p': 1,
                    'ps': 5,
                    'rc': 1
                };

                var url = buildBasePath(dataType) + dataId + '/comments';

                return $server.get({
                    'url': url,
                    'query': query
                }).then(function(response) {

                    var results = response.data.BlogCommentSummaryItemResults ? 'BlogCommentSummaryItemResults' :
                                        response.data.EventCommentSummaryItemResults ? 'EventCommentSummaryItemResults' : 'CommentSummaryItemResults';
                    var numberComment = response.data[results].length;
                    var comments = [];
                        // reverse comment array from server
                        comments = response.data[results].reverse();
                    var comment = comments[numberComment - 1];

                    return formatComment(comment);
                }
                );
            });

        },

        // Delete a comment from a post
        removeComment: function(dataType, dataId, commentId) {
            var basePath = buildBasePath(dataType);
            var url = basePath + dataId + '/comments/' + commentId;

            return $server.remove({
                'url': url
            }).then(function(res) {
                $HTTPCache.clear(basePath);
                return res;
            });
        },

        // Get the activity attachments
        getAttachments: function(dataType, dataId, page, pageSize, orderBy, acending, filterBy) {

            var query = {
                'p': page,
                'ps': pageSize,
                'rc': 1/*,
                'o': orderBy,
                'a': acending,
                'f': filterBy, */
            };

            var url = buildBasePath(dataType) + dataId + '/attachments';
            
            return $server.get({
                'url': url,
                'query': query
            }).then(function(res) {

                return res.data.AttachmentSummaryItemResults[0].AttachmentSummary.FileStores.map(function(file) {
                    file.FileExtension = file.FileExtension.split('.').pop().toLowerCase();
                    return file;
                }) || [];

            });

        },

        // Get a single activity item
        getActivity: function(dataId) {

            var url = API_BASE_URL + 'activities/' + dataId;
            
            return $server.get({
                'url': url
            }).then(formatFeedModel).then(function(model) {
                return model;
            });
        },

        // get the activity feed listing
        getFeed: function(feedType, feedId, page, pageSize, orderBy, acending, filterBy) {

            var query = {
                'p': page,
                'ps': pageSize,
                'rc': 1
            };

            var url = buildFeedPath(feedType, feedId);
            
            return $server.get({
                'url': url,
                'query': query
            }).then(formatFeedModel);

        },

        // Create a new activity post
        createPostToFeed: function(feedType, postObj) {

            var url = API_BASE_URL + UPDATE_PATHS[feedType];

            return $server.create({
                'url': url,
                'data': postObj
            }).then(function(res) {
                $HTTPCache.clear('/feeds/');
                return res;
            });
        },

        // Remove an activty post
        removePostFromFeed: function(feedEntryId) {

            var url = API_BASE_URL + 'feeds/feedEntry/' + feedEntryId;

            return $server.remove({
                'url': url
            }).then(function(res) {
                $HTTPCache.clear('/feeds/');
                return res;
            });

        },

        setEventRsvp: function(eventId, rsvp) {

            var url = API_BASE_URL + 'events/' + eventId + '/invitestatus/' + rsvp;

            return $server.create({
                'url': url
            }).then(function(res) {
                $HTTPCache.clear('/feeds/');
                return res;
            });
        }
    };

}]);
