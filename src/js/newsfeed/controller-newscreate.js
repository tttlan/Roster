// Newsfeed
// ----------------------------------------

angular.module('ui.newsFeed')


// Create Blog Controller
// ------------------------------------------------

.controller('dashboardNewsCreateCtrl', ['$scope', '$routeParams', '$filter', '$window', '$modal', '$location', 'Networks', 'BlogService', 'Members', '$notify', 'Paths', 'Groups',
    function($scope, $routeParams, $filter, $window, $modal, $location, Networks, BlogService, Members, $notify, Paths, Groups) {
    
      function getDateNow() {
      return moment().utc().format();
    }

    // Pass in html content and word limit, and it will return a string with line breaks
      function buildSummary(contentHtml, limitTo) {
      var paras = [],
          wordsLeft = limitTo || 100;
        
      var contentContainer = document.createElement('div');
      contentContainer.innerHTML = contentHtml;
        
      angular.forEach(contentContainer.childNodes, function(child) {
            
          var text = (function() {
            
            if(child.textContent) {
              return child.textContent.trim();
            } else if (child.innerText) {
              return child.innerText.trim();
            } else {
              return '';
            }

          })();

          if(wordsLeft < 1) { return; }

          if(text.length) {
              
            if(wordsLeft < text.split(' ').length) {
                
              text = text.split(' ').slice(0, wordsLeft).join(' ') + '...';
            }

            wordsLeft = wordsLeft - text.split(' ').length;
            
            paras.push(text);
              
          }

        });

      return paras.join('\n\n');
    
    }


      function prepareContent(contentHtml) {
        // clean up src
      contentHtml = contentHtml ? contentHtml.replace(/(src=[\"'](.*?)[\"'])/g, '') : '';
      return contentHtml;
    }


      function getFileIds(contentHtml) {
      var arr = [];
      var re = /file-link=[\"'](.*?)[\"']/gi;

      if (contentHtml.length) {
          contentHtml.replace(re, function($0, $1) {
              arr.push($1);
            });
        }

      return arr;
    }


      var DATE_NOW = getDateNow(),
      hasGroupListChanged = false,
      userHasChangedDatePublished;

      Members.me().then(function(res) {
      $scope.currentUser = res.data;
    });

      $scope.page = {
      action: $routeParams.id ? 'Edit' : 'Create',
      isDraft: true
    };
      $scope.loading = false;

    // Get groups the user is allowed to access
    // need to wait for resolve
      Groups.getMyGroupsList().then(function(data) {
      $scope.groups = data;
    });

      $scope.post = {
      Title: '',
      Content: '',
      ContentSummary: '',
      DatePublish: DATE_NOW,
      PostTargets: '',
      categories: {},
      selectedGroups: [],
      selectedRoles: [],
      allGroups: true
    };


      if( $routeParams.id ) {
      BlogService.getById($routeParams.id, true).then(function(res) {

            //populate fileStoreIds
          $scope.uploadedFiles = res.AttachmentsAttached
                .filter(function(file) {
                  return file.FileStores[0].FileStoreId;
                })
                .map(function(file) {
                  var fileStore = file.FileStores[0];
                  return {
                      'name': fileStore.FileName,
                      'size': fileStore.FileSize,
                      'ext': fileStore.FileName.split('.').pop(),
                      'id': fileStore.FileStoreId
                    };
                });

            //This is a hack we should remove
          res.RequiredView = res.RequiredView || res.RequireView;

          $scope.post = angular.extend($scope.post, res);
            
          if(res.PublishState < 2) {
              $scope.page.isDraft = true;
              $scope.post.DatePublish = DATE_NOW;
            } else {
              $scope.page.isDraft = false;
            }

          $scope.post.Sticky = (res.PostDestination === 7);

            // Set up categories
          $scope.post.categories = {};
          angular.forEach($scope.post.CategoryIds, function(val) {
              $scope.post.categories[val] = true;
            });

          var len = $scope.post.PostTargets.length;

          if(len) {
              $scope.post.allGroups = false;
            }
            
          for(len; len--;) {
              var target = $scope.post.PostTargets[len];
              $scope.post.selectedGroups.push({
                  label: target.Name,
                  value: {
                      'DistributionId': target.TargetId,
                      'DistributionType': target.TargetType
                    }
                });
            }

        });
    }


    // Watch for date changes
      $scope.$watch('post.DatePublish', function(newValue, oldValue) {
      if (newValue && newValue !== DATE_NOW) {
          $scope.DatePublish = $filter('dateTimeShort')(newValue);
          userHasChangedDatePublished = true;
        } else {
          $scope.DatePublish = 'Immediately';
        }
    });


      function formatToLocal(time) {
      var zone = moment().zone();
      return moment( time ).zone(zone).format();
    }
      $scope.savePost = function(isValid, post, shouldPublish) {

      if(!isValid || $scope.isUploading) {
          $scope.loading = false;
          return false;
        }
      var action = $scope.page.action === 'Create' ? 'createArticle' : 'updateArticle',
          postClone = angular.copy(post);

      $scope.loading = true;

      var sendObj = {
          DatePublish: formatToLocal( userHasChangedDatePublished ? postClone.DatePublish : getDateNow() ),
          ContentSummary: buildSummary( postClone.Content, 30 ),
          Content: prepareContent( postClone.Content ),
          Title: postClone.Title,
          PostDestination: postClone.Sticky ? 7 : 3,
          FileStoreIds: postClone.FileStoreIds || [],
          FileStoreInlineIds: getFileIds(postClone.Content) || [],
          CategoryIds: [],
          PublishState: $scope.page.isDraft  ? 1 : 2,
          RequiredView: postClone.RequiredView || false,
          GroupsUpdated: hasGroupListChanged
        };

        //populate Categories
      angular.forEach(postClone.categories, function(val, key) {
          if(val) {
              sendObj.CategoryIds.push(key);
            }
        });

      var groups = postClone.allGroups ? [] : Networks.formatGroups(postClone.selectedGroups, true),
          roles = [];

        // set publish state to 2 if the user has hit publish
      if(shouldPublish) {
          sendObj.PublishState = 2;
        }

        // if blog is publishing or the group list has changed
      if (shouldPublish || hasGroupListChanged) {
            //Once off jamming every group into the formatGroup
          if(postClone.allGroups) {
              groups = Networks.formatGroups($scope.groups.slice(0), true);
            }
        }

      sendObj.PostTargets = {
          PostToAll: false,
          RoleIds: roles,
          GroupIds: groups
        };

      BlogService[action](sendObj, postClone.Id).then(function(res) {
           
          if( $scope.page.action === 'Create') {
             $location.path(Paths.get('dashboard.news.edit', res.data.BlogFeedEntry.Id).path);
           }
          $scope.loading = false;

          $notify.add({
             message: shouldPublish ? 'Your post was published' : 'Your changes were saved.',
             type: 'success'
           });

          if(shouldPublish) {
              $scope.page.isDraft = false;
            }

        }, function(res) {
          $scope.page.serverError = 'Something went wrong, please try again later.';
          $scope.loading = false;
        });

    };

      $scope.deletePost = function() {
      BlogService.removeArticle($routeParams.id).then(function(res) {
          $location.path(Paths.get('dashboard.news.manage').path);
          $notify.add({
              message: 'This article has been deleted',
              type: 'success'
            });
        });
    };


    // Categories
    // ------------------------------------------------

      $scope.categories = [];

    // get Categories list
      BlogService.getCategories(1,50).then(function(response) {
      $scope.categories = response.data.BlogCategorySummaryItemResults;
    });

    // function to open categories editor
      $scope.openCategories = function() {

      var modal = $modal.open({
          templateType: 'drawer',
          templateUrl: '/interface/views/common/partials/manage-categories.html',
          controller: SHRP.ctrl.CategoryCtrl,
          title: 'Manage Categories',
          scope: $scope,
          resolve: {
              items: function() {
                  return $scope.categories;
                },
              BlogService: function() {
                  return BlogService;
                }
            },
          name: 'categories'
        });

      modal.result.then(function(items) {

        }, function() {
            
        });

    };

    //
    // function to open group picker
      $scope.showGroupPicker = function() {

      var modal = $modal.open({
          templateUrl: '/interface/views/common/partials/modal-group-picker.html',
          controller: SHRP.ctrl.GroupPickerCtrl,
          scope: $scope,
          resolve: {
              groups: function() {
                  return $scope.groups;
                },
              selectedGroups: function() {
                  return $scope.post.selectedGroups;
                }
            }
        });

      modal.result.then(function(items) {

          if ( !angular.equals($scope.post.selectedGroups, items.groups) ) {
              hasGroupListChanged = true;
            }

          $scope.post.allGroups = items.allGroups;
          $scope.post.selectedGroups = items.groups;
        });

    };

    // Get likes and viewws when editing a blog item
    // ------------------------------------------------

   
      $scope.showLikes = function(blog) {

      BlogService.showLikesModal(blog);
    };

      $scope.showViews = function(blog) {

      BlogService.showViewsModal(blog);
    };

    }]);

