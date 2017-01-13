
angular.module('ui.newsFeed')


// Newsfeed factory
// ----------------------------------------

.factory('BlogService', ['$server', '$HTTPCache', 'API_BASE_URL', 'FileStorage', '$modal', 'Permissions',
    function($server, $HTTPCache, API_BASE_URL, FileStorage, $modal, Permissions) {

    var BLOG_NAMESPACE = API_BASE_URL + '';

    function replaceSrc(contentHtml, editor) {
        
        if(!contentHtml) { return; }
        var string = contentHtml;

        // Find images
        var fileReg = /file-link=[\"'](.*?)[\"']/gi;
        // replace images
        string = string.replace(fileReg, function($0, $1) {
            var url = FileStorage.getDownloadUrl( $1 );
            var path = 'src="' + url + '?inline=true" ' + $0;
            return path;
        });

        if (!editor) {
            // Find video tags
            var vidReg = /<img\s[^>]*?ta-insert-video=['\"]([^'\"]*?)['\"][^>]*?>/gi;
            // replace videos
            string = string.replace(vidReg, function($0, $1) {
                return '<div class="youtube__wrapper"><iframe src="' + $1 + '?rel=0" class="youtube__player" frameborder="0"></iframe></div>';
            });
        }

        // return inline img and vids
        return string;

    }

    // formats the blog JSON object to a better model for the view
    function formatBlogModel(res) {

        //Object name changes from listing and single article
        var entrySummary = res.data.BlogFeedEntrySummaryItemResults || res.data.BlogEntrySummaryItemResults; 

        var feedData = {
            permissions: Permissions.formatPermissions(res.data.EntityActions),
            items: entrySummary.map(function(item) {

                var feedItem = item.BlogFeedEntrySummary;
                
                feedItem.userCan = Permissions.formatPermissions(item.EntityActions);
                feedItem.isPending = moment(feedItem.DatePublish).isAfter() && feedItem.PublishState === 2;
                
                feedItem.position = {
                    top:0,
                    left:0,
                    visibility:'hidden'
                };

                return feedItem;

            })
        };

        res.data = feedData;

        return res;
    }

    function isImage(ext) {
        return ['.jpg', '.png', '.gif'].indexOf(ext.toLowerCase()) !== -1;
    }

    return {
        // get a single article
        getById: function(blogId, editor) {

            editor = editor || false;

            var url = BLOG_NAMESPACE + 'blogs/' + blogId;
            
            return $server.get({
                'url': url
            }).then(function(res) {
                
                var blog = res.data.BlogFeedEntry;
                blog.Content = replaceSrc( blog.Content, editor );
                blog.userCan = Permissions.formatPermissions(res.data.EntityActions);

                return blog;
            });

        },

        getBlogs: function(page, pageSize, orderBy, acending, filterBy, categoryId) {
            var query = {
                'p': page,
                'ps': pageSize,
                'rc': 1,
                'f': filterBy || 1,
                'c': categoryId
            };

            var url = BLOG_NAMESPACE + 'blogs';
            
            return $server.get({
                'url': url,
                'query': query
            }).then(formatBlogModel);
        },

        getMyBlogs: function(page, pageSize, orderBy, acending, filterBy, categoryId) {

            // api/members/me/blogs?p={p}&ps={ps}&f={f}&c={c}&rc={rc}
            var query = {
                'p': page,
                'ps': pageSize,
                'rc': 1,
                'f': filterBy || 4,
                'c': categoryId
            };
            
            var url = API_BASE_URL + 'members/me/blogs';
            
            return $server.get({
                'url': url,
                'query': query
            }).then(formatBlogModel);

        },

        // Get list of categories
        getCategories: function(page, pageSize) {
            
            var query = {
                'p': page,
                'ps': pageSize,
                'rc': 1
            };

            var url = BLOG_NAMESPACE + 'blogcategories';

            return $server.get({
                'url': url,
                'query': query
            });
        },

        
        // Gets a list of people who have a read a specific article
        getViewsById: function(blogId, page, pageSize) {

            var url = BLOG_NAMESPACE + 'blogs/' + blogId + '/views';

            var query = {
                'p': page,
                'ps': pageSize,
                'rc': 1
            };

            return $server.get({
                'url': url,
                'query': query
            });

        },

        // Gets a list of people who have a read a specific article
        getLikesById: function(blogId, page, pageSize) {

            var url = BLOG_NAMESPACE + 'blogs/' + blogId + '/likes';

            var query = {
                'p': page,
                'ps': pageSize,
                'rc': 1
            };

            return $server.get({
                'url': url,
                'query': query
            });

        },

        // Create an article
        createArticle: function(obj) {

            var url = BLOG_NAMESPACE + 'blogs';

            return $server.create({
                'url': url,
                'data': obj
            }).then(function(res) {
                $HTTPCache.clear('blogs');
                return res;
            });

        },

         // Create an article
        updateArticle: function(obj, id) {

            //set updated flag
            obj.DateUpdated = moment().format();
            
            var url = BLOG_NAMESPACE + 'blogs/' + id;

            return $server.update({
                'url': url,
                'data': obj
            }).then(function(res) {
                $HTTPCache.clear('blogs');
                return res;
            });

        },

        removeArticle: function(id) {
            
            var url = BLOG_NAMESPACE + 'blogs/' + id;

            return $server.remove({
                'url': url
            }).then(function(res) {
                $HTTPCache.clear('blogs');
                return res;
            });
        },

        // Create a category
        createCategory: function(obj) {

            var url = BLOG_NAMESPACE + 'blogcategories';

            return $server.create({
                'url': url,
                'data': obj
            }).then(function(res) {
                $HTTPCache.clear('blog');
                return res;
            });

        },

        // Update a category
        updateCategory: function(obj) {

            var url = BLOG_NAMESPACE + 'blogcategories/' + obj.CategoryId;

            return $server.update({
                'url': url,
                'data': obj
            }).then(function(res) {
                $HTTPCache.clear('blog');
                return res;
            });

        },
        // Delete a category
        deleteCategory: function(obj) {

            var url = BLOG_NAMESPACE + 'blogcategories/' + obj.CategoryId;

            return $server.remove({
                'url': url
            }).then(function(res) {
                $HTTPCache.clear('blog');
                return res;
            });

        },

        // Views
        // -------------------------------------------------
        createView: function(id, status) {

            var url = BLOG_NAMESPACE + 'activities/' + id + '/viewschedules';

            return $server.create({
                url: url,
                data: {
                  'ViewScheduleStatus': status
                }
            }).then(function(res) {
                return res;
            });

        },

        showViewsModal: function(blog) {

            var _this = this;

            return $modal.open({
                templateType: 'drawer',
                templateUrl: '/interface/views/common/partials/peopleList.html',
                controller: SHRP.ctrl.ModalPeopleListCTRL,
                title: 'Unique Views',
                name: 'd',
                resolve: {
                    getItems: function() {
                        return function(pageNum) {
                            return _this.getViewsById(blog.Id, pageNum, 20).then(function(res) {
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
                        return blog.ViewUniqueCount;
                    },
                    titleSyntax: function() {
                        return {
                            verb: {
                                singular: 'has',
                                plural: 'have'
                            },
                            noun: 'viewed this article'
                        };
                    }
                    
                }
            });
        },

        showLikesModal: function(blog) {

            var _this = this;

            var modal = $modal.open({
                templateType: 'drawer',
                templateUrl: '/interface/views/common/partials/peopleList.html',
                controller: SHRP.ctrl.ModalPeopleListCTRL,
                title: 'Likes',
                name: 'd',
                resolve: {
                    getItems: function() {
                        return function(pageNum) {
                            return _this.getLikesById(blog.Id, pageNum, 20).then(function(res) {
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
                        return blog.LikeCount;
                    },
                    titleSyntax: function() {
                        return {
                            verb: {
                                singular: 'has',
                                plural: 'have'
                            },
                            noun: 'liked this article'
                        };
                    }
                    
                }
            });
        }

    };


}]);
