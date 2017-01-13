
// Libraries
// ----------------------------------------

angular.module('ui.libraries')


// Primary Libraries controller
// ------------------------------------------------

.controller('librariesCtrl', ['$scope', '$routeParams', 'Members', 'LibrariesFactory', 'LibrariesService', '$timeout', '$modal', '$window', '$notify',
    function($scope, $routeParams, Members, LibrariesFactory, LibrariesService, $timeout, $modal, $window, $notify) {

        var params = $routeParams;
        $('body').css('overflow', 'hidden');

        // initialise default folder
        // Might need a smarter way to do this
        $scope.start = {
            thisIndex: 0,
            paneIndex: 0,
            pane: {
                Type: 'Folder',
                Name: 'All',
                Id: 0,
                Items: []
            }
        };

        // push to panes event factory
        // requires timeout to get picked up by the watch
        $timeout(function() {
            LibrariesFactory.addPane($scope.start);
        }, 150);


        // -------------
        // Load in current Member

        Members.me().then(function(response) {
            $timeout(function() {
                $scope.currentUser = response.data;
            });
        });

        var clientWindowSize = 0;

        //#region global variable
        $scope.itemWidth = ''; // default is 12.5%
        $scope.StyleForBottomAction = {};
        $scope.panes = [];
        $scope.modalShown = false;
        $scope.predicate = 'Name';
        $scope.reverse = false;
        $scope.CurrentFileInfo = {}; // used for view file-info
        $scope.CurrentRelatedFile = {}; // insed for view related file
        $scope.sharedUnitsPaneInfo = [];
        $scope.pathDisplay = [{ name: 'My Media', id: null }];
        $scope.CurrentPath = 'My Media'; // cache location where user is standing
        $scope.searchString = ''; // this is variable use to search artiact to view
        $scope.searchLinkKeyword = ''; // this is variable use to search artiact to make linked
        $scope.ResultSearchArifact = [];// list artifact contain data return from method LibrariesService.artifactSearch();
        $scope.ParentContainerId = null;
        $scope.loading = true;
        // Set select tab in left pane
        //1- My Media
        //2- Shared Documents
        //3- Recent
        //4- Communication Templates
        //5- System Catagories
        $scope.tabPosition = 1;
        $scope.tabSystemCatagoriesPosition = 0;
        $scope.isActive = function(position, mode) {
            if (mode === 1) {
                if ($scope.tabPosition === position) {
                    return true;
                } else {
                    return false;
                }
            } else {
                if (mode === 2) {
                    if ($scope.tabSystemCatagoriesPosition === position) {
                        return true;
                    } else {
                        return false;
                    }
                }
            }
        };
        $scope.permissions = undefined;
        var searchObj = {
            Keyword: null,
            TagNames: null,
            MemberName: null,
            GroupName: null,
            RoleName: null,
            ArtifactTypeIds: []
        };

        //this obj used for searching  all artifact to make linked
        var searchRelated = {
            Keyword: '',
            TagNames: null, // don't change
            MemberName: null, // don't change
            GroupName: null, // don't change
            RoleName: null, // don't change
            ArtifactTypeIds: [1, 2, 9, 10]  //default is document and image type (maybe change later)
        };
        //#endregion

        //#region System Categories
        $scope.getpageTopLeft = function(element) {
            var rect = element.getBoundingClientRect();
            var docEl = document.documentElement;
            return {
                left: rect.left + (window.pageXOffset || docEl.scrollLeft || 0),
                top: rect.top + (window.pageYOffset || docEl.scrollTop || 0)
            };
        };

        $scope.isOpen = false;
        var systemCategories = $('#systemCategories');
        var leftPane = $('#leftPane');

        $scope.$watch(function() {
            return leftPane[0].offsetHeight;
        }, function(value) {
            var leftPaneHeight = value;
            var elementHeight = $scope.originalElementHeight;
            var elementTopLeft = $scope.getpageTopLeft(systemCategories[0]);
            $scope.elementBottom = leftPaneHeight + (window.scrollY || window.pageYOffset) - (elementTopLeft.top + elementHeight);
            $scope.collapse = $scope.isOpen === true ? { 'height': $scope.elementBottom + 10 + 'px' } : { 'height': '0px' };
        });

        $scope.showCategories = function() {
            $scope.isOpen = $scope.isOpen === false ? true : false;
            var leftPaneHeight = leftPane[0].offsetHeight;
            var elementHeight = systemCategories[0].offsetHeight;
            var elementTopLeft = $scope.getpageTopLeft(systemCategories[0]);
            $scope.originalElementHeight = elementHeight;
            $scope.elementBottom = leftPaneHeight + (window.scrollY || window.pageYOffset) - (elementTopLeft.top + elementHeight);
            $scope.collapse = $scope.isOpen === true ? { 'height': $scope.elementBottom + 10 + 'px' } : { 'height': '0px' };
        };
        //#endregion

        $scope.scrollbarConfig = {
            autoHideScrollbar: true,
            theme: 'minimal-dark',
            advanced: {
                updateOnContentResize: true
            },
            setWidth: 'auto',
            scrollInertia: 400
        };

        //TODO : call function calculateItemWidthByWindowsize() to get initial size for each item in grid view
        function calculateItemWidthByWindowsize() {
            clientWindowSize = $window.innerWidth - 216 - 16; // substract left panel's width and margin-left pixel

            if ($scope.isShowRightPane === true) {
                clientWindowSize = clientWindowSize - 300; // subtract right panel's width;
            }

            if (clientWindowSize >= 1434) {
                $scope.itemWidth = 'col-1-8';
            }

            else if (clientWindowSize >= 1134 && clientWindowSize < 1434) {
                $scope.itemWidth = 'col-1-7';
            }
            else if (clientWindowSize >= 834 && clientWindowSize < 1134) {
                $scope.itemWidth = 'col-1-6';
            }
            else if (clientWindowSize >= 534 && clientWindowSize < 834) {
                $scope.itemWidth = 'col-1-4';
            } else {
                $scope.itemWidth = 'col-1-2';
            }
        }

        calculateItemWidthByWindowsize(); // call to get initial width for each item in Grid view
        //#region showFilter : Open modal choice filter option
        //init value for search filter by
        $scope.searchBy = {
            option: 1 // search document by default
        };
        $scope.checkFilter = {
            searchDocument: true,
            searchImage: false,
            searchVideo: false,
            searchOtherType: false
        };
        $scope.showFilter = function() {
            var modal = $modal.open({
                templateUrl: '/interface/views/libraries/partials/modal-filter.html',
                templateType: 'drawer',
                title: 'Search',
                classes: 'drawer',
                scope: $scope
            });
        };

        //#endregion

        //#region onChangeSearchArtifact : Search Artifact and bind to autocomplete box
        $scope.onChangeSearchArtifact = function(isEnter) {
            $scope.isSearchingArtifact = false; // display spinning icon when searching artifact
            $scope.ResultSearchArifact = []; // clear list

            if ($scope.searchString !== '') { //not empty string
                //reset value
                $scope.isSearchingArtifact = true;

                searchObj.Keyword = null;
                searchObj.GroupName = null;
                searchObj.RoleName = null;
                searchObj.TagNames = null;

                // Search artifact by
                switch ($scope.searchBy.option) {
                    case '1':
                        searchObj.Keyword = $scope.searchString;
                        break;
                    case '2':
                        searchObj.GroupName = $scope.searchString;
                        break;
                    case '3':
                        searchObj.RoleName = $scope.searchString;
                        break;
                    case '4':
                        searchObj.TagNames = [];
                        searchObj.TagNames.push($scope.searchString);
                        break;
                    default:
                        searchObj.Keyword = $scope.searchString;
                }

                // Search artifact by type (multiple types)
                // Search Document : 1
                // Search Image : 2
                // Search Video : 9
                // Search Other Type : 10
                searchObj.ArtifactTypeIds = [];
                if ($scope.checkFilter.searchDocument) {
                    searchObj.ArtifactTypeIds.push(1);
                }
                if ($scope.checkFilter.searchImage) {
                    searchObj.ArtifactTypeIds.push(2);
                }
                if ($scope.checkFilter.searchVideo) {
                    searchObj.ArtifactTypeIds.push(9);
                }
                if ($scope.checkFilter.searchOtherType) {
                    searchObj.ArtifactTypeIds.push(10);
                }

                //Call LibrariesService.artifactSearch
                $scope.loading = isEnter;
                LibrariesService.artifactSearch(searchObj).then(function(res) {
                    $scope.isSearchingArtifact = false;
                    if (isEnter) {
                        $scope.containers = res.data ? res.data.ArtifactSummary : [];
                        $scope.pathDisplay = [{ name: 'Search Results', id: null }];
                        $scope.loading = false;
                        $scope.ResultSearchArifact = []; // reset result search
                        $scope.searchString = ''; // clear searchString
                    } else {
                        $scope.ResultSearchArifact = res.data ? res.data.ArtifactSummary : [];
                    }
                });
            }
        };
        //#endregion

        $scope.toggleModal = function() {
            $scope.modalShown = !$scope.modalShown;
        };

        // watch to update pane layout (scroll position) on open /close
        var watchBind = $scope.$watchCollection('panes', function(val) {

            $timeout(function() {
                angular.element('panes').scrollLeft(calcWidth());
            });

        });


        // on ADD pane event
        // ------------------------------------

        var onPaneAddedHandler = function(obj) {

            // remove trailing items
            $scope.panes.splice(parseInt(obj.paneIndex) + 1);

            // repopulate array with new item
            $scope.panes.push(obj.pane);
        };

        LibrariesFactory.onAddPane($scope, onPaneAddedHandler);


        // on CLOSE pane event
        // ------------------------------------

        var onPaneCloseHandler = function(index) {

            // Remove index and everything after
            $scope.panes.splice(index);
        };

        LibrariesFactory.onClosePane($scope, onPaneCloseHandler);

        //#region changeViewMode : Change view mode either grid or list view
        $scope.changeViewMode = function(str) {
            $scope.isListView = (str === 'listView') ? true : false;
        };
        //#endregion

        //#region order : sort list container and artifact by condition
        $scope.order = function(predicate) {
            $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
            $scope.predicate = predicate;
        };
        //#endregion


        //#region showFileInfo : Show file info pane
        $scope.showFileInfo = function(item) {

            if (item !== null && item !== '' && item.ArtifactId !== '') {

                $scope.isShowRightPane = true;
                //#region Set height to file info pane
                var fileInfoWrapper = $('#fileInfoWrapper');
                $scope.resizeScrollbar(fileInfoWrapper[0]);

                //if (!$scope.CurrentFileInfo.ArtifactId || ($scope.CurrentFileInfo.ArtifactId && $scope.CurrentFileInfo.ArtifactId !== item.ArtifactId)) {  --> use this if you want dont re-call api to boost performace

                $scope.StyleForBottomAction = {
                    'transform': 'translateX(' + (-($window.innerWidth - 110)) + 'px)'
                };

                $scope.isLoading = true;

                //Get Artifact by Id
                LibrariesService.getArtifactById(item.ArtifactId).then(function(res) {
                    $scope.isLoading = false;
                    $scope.CurrentFileInfo = res.data;
                    $scope.CurrentFileInfo.Thumbnail = item.Thumbnail;
                    $scope.CurrentFileInfo.sharedUnitsPaneInfo = $scope.CurrentFileInfo.SharedUsers.concat($scope.CurrentFileInfo.SharedGroups).concat($scope.CurrentFileInfo.SharedRoles);
                });

                $scope.isShowFileInfo = true;
                $scope.isShowLinkedFiles = false;
                calculateItemWidthByWindowsize();
                //}
            } else {
                $scope.StyleForBottomAction = {};// reset
                $scope.isShowFileInfo = false;
                $scope.isShowRightPane = false;
                $scope.CurrentFileInfo = {};
                $scope.CurrentRelatedFile = {};
                calculateItemWidthByWindowsize();
            }
        };

        $scope.scrollbarFileInfoConfig = {
            autoHideScrollbar: true,
            theme: 'minimal-dark',
            axis: 'y',
            advanced: {
                updateOnContentResize: true
            },
            setWidth: 300,
            setHeight: $scope.finalfileInfoWrapperHeight ? $scope.finalfileInfoWrapperHeight : 450,
            scrollInertia: 400
        };

        $scope.scrollbarGalleryConfig = {
            autoHideScrollbar: true,
            theme: 'minimal-dark',
            axis: 'y',
            advanced: {
                updateOnContentResize: true
            },
            setWidth: '100%',
            scrollInertia: 400
        };

        $scope.resizeScrollbar = function(element) {
            //#region Set height to file info pane
            var elementHeight = element.offsetHeight;
            var elementTopLeft = $scope.getpageTopLeft(element);
            $scope.fileInfoWrapperBottom = window.innerHeight + (window.scrollY || window.pageYOffset) - (elementTopLeft.top + elementHeight);
            $scope.finalfileInfoWrapperHeight = elementHeight + $scope.fileInfoWrapperBottom;
            //#endregion

            $scope.$watch(function() {
                return window.innerHeight;
            }, function(value) {
                var windowHeight = value;
                var elementHeight = element.offsetHeight;
                var elementTopLeft = $scope.getpageTopLeft(element);
                $scope.fileInfoWrapperBottom = windowHeight + (window.scrollY || window.pageYOffset) - (elementTopLeft.top + elementHeight);
                $scope.finalfileInfoWrapperHeight = elementHeight + $scope.fileInfoWrapperBottom;
            });
        };

        //#endregion

        //#region showRelatedFilePanel : show related files pane
        $scope.showRelatedFilePanel = function(item) {
            if (item !== null && item !== '' && item.ArtifactId !== '') {

                $scope.isShowRightPane = true;
                var fileInfoWrapper = $('#fileInfoWrapper');
                $scope.resizeScrollbar(fileInfoWrapper[0]);

                //if (!$scope.CurrentRelatedFile.MainArtifact || ($scope.CurrentRelatedFile.MainArtifact.ArtifactId && $scope.CurrentRelatedFile.MainArtifact.ArtifactId !== item.ArtifactId)) {  ---> use this if you won't re-call api to boost performace

                $scope.CurrentRelatedFile = {}; // clear data

                $scope.StyleForBottomAction = {
                    'transform': 'translateX(' + (-($window.innerWidth - 110)) + 'px)'
                };

                $scope.isLoading = true;

                //call LibrariesService.getRelatedItems
                LibrariesService.getRelatedArtifacts(item.ArtifactId).then(function(res) {
                    $scope.CurrentRelatedFile = res.data;
                    $scope.CurrentRelatedFile.MainArtifact = item; // set item again to CurrentArtifact for faster (although we got it from server)
                    $scope.isLoading = false;
                });

                $scope.isShowLinkedFiles = true;
                $scope.isShowFileInfo = false;
                calculateItemWidthByWindowsize();
                //} ---> end if boost performance
            }
            else {
                $scope.isShowLinkedFiles = false;
                $scope.isShowRightPane = false;
                $scope.StyleForBottomAction = {};
                $scope.CurrentFileInfo = {};
                $scope.CurrentRelatedFile = {};
                calculateItemWidthByWindowsize();
            }
        };
        //#endregion

        //#region deleteLinkedArtifact
        $scope.deleteLinkedArtifact = function(item) {
            //Call LibrariesService.deleteRelatedItems
            LibrariesService.deleteRelatedItems($scope.CurrentRelatedFile.CurrentArtifact.ArtifactId, item.ArtifactId)
            .then(function(res) {
                //remove item in list linked artifact of current artifact
                var index = $scope.CurrentRelatedFile.RelatedFiles.indexOf(item);
                $scope.CurrentRelatedFile.RelatedFiles.splice(index, 1);
            });
        };
        //#endregion

        //#region Hover remove related file link
        $scope.removeLink = false;
        $scope.showRemoveLink = function(index) {
            $scope.removeLink = true;
            $scope.removeLinkIndex = index;
        };
        $scope.hideRemoveLink = function(index) {
            $scope.removeLink = false;
            $scope.removeLinkIndex = index;
        };

        //#endregion

        //#region onChangeSearchRelatedArtifact : Search Related Artifacts and bind to autocomplete box
        $scope.onChangeSearchRelatedArtifact = function(keyword) {
            $scope.RelatedFileList = []; // clear list
            if (keyword !== '') { //not empty string
                $scope.isSearchingRelatedArtifact = true;
                searchRelated.Keyword = keyword;
                //Call LibrariesService.artifactSearch
                LibrariesService.artifactSearch(searchRelated).then(function(res) {
                    $scope.isSearchingRelatedArtifact = false;
                    $scope.RelatedFileList = []; // clear list
                    $scope.RelatedFileList = res.data ? res.data.ArtifactSummary : [];
                });
            } else {
                $scope.isSearchingRelatedArtifact = false;
                $scope.RelatedFileList = []; // clear list
            }
        };
        //#endregion

        //#region addLinkedFile : add more link artifact to current artifact
        $scope.addLinkedFile = function(file) {

            //get list linked artifact's id of current artifact
            var linkArtifactIds = $scope.CurrentRelatedFile.RelatedFiles.map(function(item) {
                return item.ArtifactId;
            });

            linkArtifactIds.push(file.ArtifactId);

            // Call LibrariesService.addRelatedItem to insert to DB
            LibrariesService.addRelatedItem($scope.CurrentRelatedFile.CurrentArtifact.ArtifactId, linkArtifactIds).then(function(res) {
                file.Permissions.deleterelatedartifact = true;

                //Add this file to current List Related File of current artifact
                $scope.CurrentRelatedFile.RelatedFiles.push(file);

                //clear current result
                $scope.RelatedFileList = []; // clear list
                $scope.searchLinkKeyword = '';
            });
        };
        //#endregion

        //#region Create New folder
        // ------------------------------------
        // Save current number of new folder if exist, Folder 1, Folder 2
        $scope.currentNewFolderNumber = 0;

        $scope.createFolder = function() {

            var modal = $modal.open({
                templateUrl: '/interface/views/libraries/partials/modal-createfolder.html',
                controller: SHRP.ctrl.ModalCreateFolderCTRL
            });
            var now = new Date();

            var createDate = new Date(Date.UTC(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                now.getHours(),
                now.getMinutes()
            ));
            // On save, create folder and send to service
            modal.result.then(function(data) {
                // Check if this folder exist
                var folderName = data.Name;

                var folder = {
                    ContainerType: 4,
                    Name: folderName,
                    Visibility: data.Visibility.val,
                    Description: data.Description,
                    ParentContainerId: $scope.ParentContainerId,
                    SharedUsers: data.SharedUsers.length > 0 ? data.SharedUsers : null,
                    SharedGroups: data.SharedGroups.length > 0 ? data.SharedGroups : null,
                    SharedRoles: data.SharedRoles.length > 0 ? data.SharedRoles : null,
                };
                LibrariesService.createUserContainer(folder).then(function(res) {

                    folder.ContainerId = res.ContainerId;
                    folder.IsContainer = true;

                    folder.LastModified = createDate;
                    folder.Author = res.Author;
                    folder.Permissions = res.Permissions;

                    $scope.containers.push(folder);

                });
            });
        };
        //#endregion

        //#region Upload New File
        // ------------------------------------
        $scope.uploadFiles = function() {
            // get parent container id
            var containerId = {
                folder: $scope.ParentContainerId
            };

            var modal = $modal.open({
                templateUrl: '/interface/views/libraries/partials/modal-fileuploader.html',
                templateType: 'drawer',
                controller: SHRP.ctrl.ModalLibraryUploadCTRL,
                title: 'Upload',
                classes: 'drawer__uploader',
                resolve: {
                    collection: function() {
                        return $scope.containers;
                    },
                    containerId: function() {
                        return containerId;
                    }
                }
            });

        };
        //#endregion

        //#region Open modal change title
        $scope.changeTitle = function(item) {
            var modal = $modal.open({
                templateUrl: '/interface/views/libraries/partials/modal-changetitle.html',
                controller: SHRP.ctrl.ModalChangeTitleCTRL,
                scope: $scope,
                resolve: {
                    detail: function() {
                        return item;
                    }
                }
            });
            modal.result.then(function(data) {
                var curIndex = $scope.containers.indexOf(item);
                $scope.containers[curIndex].FileName = data; // update filenam for current artifact
            });
        };
        //#endregion

        //#region Add tag
        $scope.addTags = function(file) {

            // user open add tag modal on avaible artifact or artifact which is have just uploaded directly
            // not through right panel file info
            if (!file.ContainerId || file.IsJustUploaded === true) {
                // call api get artifact detail to have full info
                LibrariesService.getArtifactById(file.ArtifactId).then(function(res) {
                    $scope.CurrentFileInfo = res.data;
                    $scope.CurrentFileInfo.Thumbnail = file.Thumbnail;
                    $scope.CurrentFileInfo.sharedUnitsPaneInfo = $scope.CurrentFileInfo.SharedUsers.concat($scope.CurrentFileInfo.SharedGroups).concat($scope.CurrentFileInfo.SharedRoles);

                    var modal = $modal.open({
                        templateUrl: '/interface/views/libraries/partials/modal-addtag.html',
                        controller: SHRP.ctrl.ModalAddTagCTRL,
                        scope: $scope,
                        resolve: {
                            file: function() {
                                return !file.ContainerId || file.IsJustUploaded === true ? $scope.CurrentFileInfo : file;
                            }
                        }
                    });

                    // On save, create folder and send to service
                    modal.result.then(function(data) {
                        if (data) {
                            // tags array for upload service
                            var tags = [];
                            // addedTags array for adding to current artifact.
                            var addedTags = [];
                            angular.forEach(data, function(obj, idx) {
                                if (obj) {
                                    var tag = obj.TagName;
                                    tags.push(tag);
                                    var t = {};
                                    t.TagName = obj.TagName,
                                    t.TagId = obj.TagId ? obj.TagId : null,
                                    t.label = obj.label ? obj.label : null,
                                    addedTags.push(t);
                                }
                            });

                            // Format for SharedRoles to update
                            var roles = [];
                            var groups = [];
                            var users = [];
                            if ($scope.CurrentFileInfo.SharedRoles.length) {
                                $scope.CurrentFileInfo.SharedRoles.forEach(function(obj, idx) {
                                    if (obj) {
                                        roles.push(obj.Id);
                                    }
                                });
                            }

                            if ($scope.CurrentFileInfo.SharedGroups.length) {
                                $scope.CurrentFileInfo.SharedGroups.forEach(function(obj, idx) {
                                    if (obj) {
                                        groups.push(obj.Id);
                                    }
                                });
                            }

                            if ($scope.CurrentFileInfo.SharedUsers.length) {
                                $scope.CurrentFileInfo.SharedUsers.forEach(function(obj, idx) {
                                    if (obj) {
                                        users.push(obj.Id);
                                    }
                                });
                            }

                            var temp = {
                                ArtifactTitle: $scope.CurrentFileInfo.ArtifactTitle,
                                Visibility: $scope.CurrentFileInfo.Visibility,
                                FileName: $scope.CurrentFileInfo.FileName,
                                FileSize: $scope.CurrentFileInfo.FileSize,
                                ContainerId: $scope.CurrentFileInfo.ContainerId,
                                SharedRoles: roles.length > 0 ? roles : null,
                                SharedUsers: users.length > 0 ? users : null,
                                SharedGroups: groups.length > 0 ? groups : null,
                                TagNames: tags.length > 0 ? tags : null
                            };
                            $scope.isLoading = true;
                            LibrariesService.updateArtifact($scope.CurrentFileInfo.ArtifactId, temp).then(function(res) {
                                // When done, stop loading
                                $scope.isLoading = false;

                                if (!res.data.Errors) {
                                    $notify.add({
                                        message: 'Update Tags successfully!',
                                        type: 'success',
                                        visible: true
                                    });
                                    // Check exist tag
                                    $scope.CurrentFileInfo.TagNames = [];
                                    $scope.CurrentFileInfo.TagNames = $scope.CurrentFileInfo.TagNames.concat(addedTags);

                                    //add tag to current item in current container
                                    for (var i = 0; i < $scope.containers.length; i++) {
                                        if ($scope.containers[i].ArtifactId === $scope.CurrentFileInfo.ArtifactId) {
                                            $scope.containers[i].TagNames = [];
                                            $scope.containers[i].TagNames = $scope.CurrentFileInfo.TagNames;
                                            $scope.containers[i].ContainerId = $scope.CurrentFileInfo.ContainerId; //set containerId in order to       prevent call Api when open tag modal directly not through pane file info
                                            $scope.containers[i].IsJustUploaded = false;
                                            break;
                                        }
                                    }
                                }
                            });
                        }
                    });
                });
            }

            else {
                var modal = $modal.open({
                    templateUrl: '/interface/views/libraries/partials/modal-addtag.html',
                    controller: SHRP.ctrl.ModalAddTagCTRL,
                    scope: $scope,
                    resolve: {
                        file: function() {
                            return file;
                        }
                    }
                });

                // On save, create folder and send to service
                modal.result.then(function(data) {
                    if (data) {
                        // tags array for upload service
                        var tags = [];
                        // addedTags array for adding to current artifact.
                        var addedTags = [];
                        angular.forEach(data, function(obj, idx) {
                            if (obj) {
                                var tag = obj.TagName;
                                tags.push(tag);
                                var t = {};
                                t.TagName = obj.TagName,
                                t.TagId = obj.TagId ? obj.TagId : null,
                                t.label = obj.label ? obj.label : null,
                                addedTags.push(t);
                            }
                        });

                        // Format for SharedRoles to update
                        var roles = [];
                        var groups = [];
                        var users = [];
                        if ($scope.CurrentFileInfo.SharedRoles.length) {
                            $scope.CurrentFileInfo.SharedRoles.forEach(function(obj, idx) {
                                if (obj) {
                                    roles.push(obj.Id);
                                }
                            });
                        }

                        if ($scope.CurrentFileInfo.SharedGroups.length) {
                            $scope.CurrentFileInfo.SharedGroups.forEach(function(obj, idx) {
                                if (obj) {
                                    groups.push(obj.Id);
                                }
                            });
                        }

                        if ($scope.CurrentFileInfo.SharedUsers.length) {
                            $scope.CurrentFileInfo.SharedUsers.forEach(function(obj, idx) {
                                if (obj) {
                                    users.push(obj.Id);
                                }
                            });
                        }

                        var temp = {
                            ArtifactTitle: $scope.CurrentFileInfo.ArtifactTitle,
                            Visibility: $scope.CurrentFileInfo.Visibility,
                            FileName: $scope.CurrentFileInfo.FileName,
                            FileSize: $scope.CurrentFileInfo.FileSize,
                            ContainerId: $scope.CurrentFileInfo.ContainerId,
                            SharedRoles: roles.length > 0 ? roles : null,
                            SharedUsers: users.length > 0 ? users : null,
                            SharedGroups: groups.length > 0 ? groups : null,
                            TagNames: tags.length > 0 ? tags : null
                        };
                        $scope.isLoading = true;
                        LibrariesService.updateArtifact($scope.CurrentFileInfo.ArtifactId, temp).then(function(res) {
                            // When done, stop loading
                            $scope.isLoading = false;

                            if (!res.data.Errors) {
                                $notify.add({
                                    message: 'Update Tags successfully!',
                                    type: 'success',
                                    visible: true
                                });
                                // Check exist tag
                                $scope.CurrentFileInfo.TagNames = [];
                                $scope.CurrentFileInfo.TagNames = $scope.CurrentFileInfo.TagNames.concat(addedTags);

                                //add tag to current item in current container
                                for (var i = 0; i < $scope.containers.length; i++) {
                                    if ($scope.containers[i].ArtifactId === $scope.CurrentFileInfo.ArtifactId) {
                                        $scope.containers[i].TagNames = [];
                                        $scope.containers[i].TagNames = $scope.CurrentFileInfo.TagNames;
                                        $scope.containers[i].ContainerId = $scope.CurrentFileInfo.ContainerId; //set containerId in order to       prevent call Api when open tag modal directly not through pane file info
                                        $scope.containers[i].IsJustUploaded = false;
                                        break;
                                    }
                                }
                            }
                        });
                    }
                });
            }

        };
        //#endregion

        //#region Show all tag modal
        $scope.openAllTagModal = function(file, currentTags, allTags) {
            var modal = $modal.open({
                templateUrl: '/interface/views/libraries/partials/modal-all-tags.html',
                templateType: 'drawer',
                title: 'All tags',
                classes: 'drawer__uploader',
                controller: SHRP.ctrl.ModalAllTagsCTRL,
                scope: $scope,
                resolve: {
                    file: function() {
                        return !file.ContainerId || file.IsJustUploaded === true ? $scope.CurrentFileInfo : file;
                    },
                    currentTags: function() {
                        return currentTags;
                    },
                    allTags: function() {
                        return allTags;
                    }
                }
            });
            modal.result.then(function(data) {
                if (data) {
                    // tags array for upload service
                    var tags = [];
                    // addedTags array for adding to current artifact.
                    var addedTags = [];
                    angular.forEach(data, function(obj, idx) {
                        if (obj) {
                            var tag = obj.TagName;
                            tags.push(tag);
                            var t = {};
                            t.TagName = obj.TagName,
                                t.TagId = obj.TagId ? obj.TagId : null,
                                t.label = obj.label ? obj.label : null,
                                addedTags.push(t);
                        }
                    });

                    // Format for SharedRoles to update
                    var roles = [];
                    var groups = [];
                    var users = [];
                    if ($scope.CurrentFileInfo.SharedRoles.length) {
                        $scope.CurrentFileInfo.SharedRoles.forEach(function(obj, idx) {
                            if (obj) {
                                roles.push(obj.Id);
                            }
                        });
                    }

                    if ($scope.CurrentFileInfo.SharedGroups.length) {
                        $scope.CurrentFileInfo.SharedGroups.forEach(function(obj, idx) {
                            if (obj) {
                                groups.push(obj.Id);
                            }
                        });
                    }

                    if ($scope.CurrentFileInfo.SharedUsers.length) {
                        $scope.CurrentFileInfo.SharedUsers.forEach(function(obj, idx) {
                            if (obj) {
                                users.push(obj.Id);
                            }
                        });
                    }

                    var temp = {
                        ArtifactTitle: $scope.CurrentFileInfo.ArtifactTitle,
                        Visibility: $scope.CurrentFileInfo.Visibility,
                        FileName: $scope.CurrentFileInfo.FileName,
                        FileSize: $scope.CurrentFileInfo.FileSize,
                        ContainerId: $scope.CurrentFileInfo.ContainerId,
                        SharedRoles: roles.length > 0 ? roles : null,
                        SharedUsers: users.length > 0 ? users : null,
                        SharedGroups: groups.length > 0 ? groups : null,
                        TagNames: tags.length > 0 ? tags : null
                    };
                    $scope.isLoading = true;
                    LibrariesService.updateArtifact($scope.CurrentFileInfo.ArtifactId, temp).then(function(res) {
                        // When done, stop loading
                        $scope.isLoading = false;

                        if (!res.data.Errors) {
                            $notify.add({
                                message: 'Update Tags successfully!',
                                type: 'success',
                                visible: true
                            });
                            // Check exist tag
                            $scope.CurrentFileInfo.TagNames = [];
                            $scope.CurrentFileInfo.TagNames = $scope.CurrentFileInfo.TagNames.concat(addedTags);

                            //add tag to current item in current container
                            for (var i = 0; i < $scope.containers.length; i++) {
                                if ($scope.containers[i].ArtifactId === $scope.CurrentFileInfo.ArtifactId) {
                                    $scope.containers[i].TagNames = [];
                                    $scope.containers[i].TagNames = $scope.CurrentFileInfo.TagNames;
                                    $scope.containers[i].ContainerId = $scope.CurrentFileInfo.ContainerId; //set containerId in order to prevent call Api when open tag modal directly not through pane file info
                                    $scope.containers[i].IsJustUploaded = false;
                                    break;
                                }
                            }
                        }
                    });
                }
            });
        };
        //#endregion
        //#region View container detail by Double click
        $scope.showContainerDetail = function(id, name, isRoot) {
            // If right pane is showing, hide it
            $scope.isShowFileInfo = false;
            $scope.isShowLinkedFiles = false;
            $scope.StyleForBottomAction = {};// reset
            $scope.loading = true;
            $scope.containers = [];
            $scope.ParentContainerId = id;
            $scope.pathDisplay = isRoot ? [] : $scope.pathDisplay;
            $scope.pathDisplay.push({ name: name, id: id });
            LibrariesService.getContainerById(id).then(function(res) {
                var detail = res.data.detail;
                $scope.containers = detail.SubContainers.concat(detail.ArtifactItems);
                $scope.loading = false;
                // When loading finish, set permission
                $scope.permissions = res.data.permissions;
            });
        };
        //#endregion

        //#region Select item
        $scope.activeItem = function(index) {
            var contextMenu = document.getElementById('context-menu-' + index);
            contextMenu.style.zIndex = '1000';
            $scope.selecting = index;
        };
        //#endregion

        //#region Get all tags
        $scope.listTag = function() {
            LibrariesService.Libraries.getTags.then(function(res) {
            });
        };
        //#endregion

        //#region Destroy
        $scope.$on('$destroy', function() {

            watchBind();

        });
        //#endregion

        // Calculate the with of the visible panes
        function calcWidth() {
            return ($scope.panes.length * 320) + 200;
        }

        // Used by view to generate styles
        $scope.getWidths = function() {
            return {
                width: calcWidth()
            };
        };

        $scope.changeShowTag = function(isShow) {
            if (isShow) {
                $scope.showTag = true;
            } else {
                $scope.showTag = false;
            }
        };

        //#region Get user container
        //Limit user container to 4
        $scope.userContainerLimited = 4;
        $scope.currentFilterCollection = 'all';

        // Get user container by order and shared property
        $scope.getUserContainer = function getUserContainer(order, shared) {
            $scope.isShowFileInfo = false;
            $scope.isShowLinkedFiles = false;
            $scope.StyleForBottomAction = {};// reset
            $scope.loading = true;
            $scope.currentFilterCollection = 'all';

            LibrariesService.getUserContainer(order, shared).then(function(res) {
                $scope.loading = false;
                $scope.containers = res.data ? res.data.items : [];
                $scope.pathDisplay = [{ name: shared ? 'Shared Documents' : 'My Media', id: null }];
                // When loading finish, set permission
                $scope.permissions = res.data.permissions;

            });
        };
        //#endregion

        //#region getRecentArtifact
        $scope.getRecentArtifact = function getRecentArtifact() {
            $scope.isShowFileInfo = false;
            $scope.isShowLinkedFiles = false;
            $scope.StyleForBottomAction = {};// reset
            $scope.containers = [];
            $scope.loading = true;
            LibrariesService.getRecentArtifact().then(function(res) {
                $scope.loading = false;
                $scope.containers = res.data.items;
                $scope.pathDisplay = [{ name: 'Recent files', id: null }];
                // When loading finish, set permission
                $scope.permissions = res.data.permissions;
            });
        };
        //#endregion

        //#region Get system container
        //Limit system container to 12
        $scope.systemContainerLimited = 12;
        LibrariesService.getSystemContainer().then(function(res) {
            // Splice the first element
            res.data.items.splice(0, 1);
            $scope.listSystemContainer = res.data;
        });
        //#endregion

        Array.prototype.indexOfArray = function(prop, value) {
            return this.map(function(e) { return e[prop]; }).indexOf(value);
        };

        $scope.goTo = function(path) {
            $scope.loading = true;
            var indexOfPath = $scope.pathDisplay.indexOfArray('id', path.id) + 1;
            $scope.pathDisplay.splice(indexOfPath, $scope.pathDisplay.length - indexOfPath);
            $scope.currentFilterCollection = 'all';

            if (!path.id) {
                $scope.ParentContainerId = null;
                if (path.name === 'My Media' || path.name === 'Search Results') {
                    $scope.ActiveFilter('all');
                    $scope.getUserContainer(1, false);
                } else if (path.name === 'Shared Documents') {
                    $scope.getUserContainer(1, true);
                } else if (path.name === 'Recent files') {
                    $scope.getRecentArtifact();
                }
            } else {
                $scope.ParentContainerId = path.id;
                LibrariesService.getContainerById(path.id).then(function(res) {
                    var detail = res.data.detail;
                    $scope.containers = detail.SubContainers.concat(detail.ArtifactItems);
                    $scope.loading = false;
                });
            }
        };
        // Set Root tab active
        $scope.setRootTabActive = function(position) {
            if (1 <= position && position <= 4) {
                $scope.tabSystemCatagoriesPosition = -1;
            }
            $scope.tabPosition = position;
        };
        //Set system catagories active
        $scope.setTabActiveInSystemCatagories = function(position) {
            $scope.tabPosition = -1;
            $scope.tabSystemCatagoriesPosition = position;
        };

        //#endregion

        //#region filter for my media
        $scope.ActiveFilter = function(opt) {
            $scope.currentFilterCollection = opt;
            $scope.containers = $scope.containers;
        };

        $scope.myFilter = function(item) {
            switch($scope.currentFilterCollection) {
                case 'all':
                    return item;

                case 'img':
                    return item.ArtifactTypeId === 2;

                case "video":
                    return item.ArtifactTypeId === 9;
            }
        };
        //#endregion

        //#region Open preview lightbox
        // ------------------------------------

        $scope.openLightbox = function(item, isOpenComment) {
            if (item.Permissions.viewartifact === true) {

                $scope.activityObj = {};
                $scope.relatedObj = {};

                var artifactId = item.ArtifactId;

                item.type = item.ArtifactTypeName;

                // Get activity id and comment count
                LibrariesService.getArtifactById(artifactId).then(function(res) {
                    $scope.activityObj.ActivityItemId = res.data.ActivityItemId;
                    $scope.activityObj.CommentCount = res.data.CommentCount;
                    $scope.activityObj.LikeCount = res.data.LikeCount;
                    $scope.activityObj.HasLiked = res.data.HasLiked;

                    //call related file
                    LibrariesService.getRelatedArtifacts(artifactId).then(function(res) {
                        $scope.relatedObj.RelatedFiles = res.data.RelatedFiles;
                        $scope.relatedObj.numRelatedFiles = res.data.RelatedFiles.length;
                    });

                    // Get url
                    if (item.type === 'Document') {
                        LibrariesService.getViewUrl(artifactId).then(function(res) {
                            if (res.status === 200) {
                                item.url = res.data.Url;
                                view(item);
                            }
                        });
                    } else if (item.type === 'Video' || item.type === 'Audio') {
                        LibrariesService.getDownloadUrlFromCloud(artifactId).then(function(res) {
                            if (res.status === 200) {
                                item.url = res.data.Url;
                                view(item);
                            }
                        });
                    } else {
                        item.url = item.Thumbnail;
                        view(item);
                    }
                });
            } else {
                return $notify.add({
                    message: 'This file could not be opened. Please download it',
                    type: 'warning',
                    visible: true
                });
            }

            function view(item) {
                $scope.items = [];
                // Check condition for get list file to view
                if (item.type === 'Image') {
                    angular.forEach($scope.containers, function(obj) {
                        if (obj.ArtifactTypeName === 'Image') {
                            obj.url = obj.Thumbnail;
                            obj.type = obj.ArtifactTypeName;
                            $scope.items.push(obj);

                            for (var i = 0 ; i < $scope.items.length ; i++) {
                                if (parseInt($scope.items[i].ArtifactId) === item.ArtifactId) {
                                    $scope.currentIndex = i;
                                }
                            }

                        }
                    });
                } else {
                    $scope.items.push(item);

                    $scope.currentIndex = 0;
                }

                var modal = $modal.open({
                    templateType: 'lightbox',
                    templateUrl: '/interface/views/libraries/partials/gallerybox.html',
                    //templateUrl: '/interface/views/common/partials/lightbox-gallery.html',
                    controller: SHRP.ctrl.ModalLibraryLightboxGalleryCTRL,
                    resolve: {
                        items: function() {
                            return $scope.items;
                        },
                        currentIndex: function() {
                            return $scope.currentIndex;
                        },
                        isOpenComment: function() {
                            return isOpenComment;
                        },
                        numberItems: function() {
                            return $scope.items.length;
                        },
                        relatedObj: function() {
                            return $scope.relatedObj;
                        },
                        activityObj: function() {
                            return $scope.activityObj;
                        },
                        containers: function() {
                            return $scope.containers;
                        }
                    }
                });
            }
        };
        //#endregion
    }]);



var SHRP = SHRP || {};
SHRP.ctrl = SHRP.ctrl || {};

// Create new folder Controller 
// ----------------------------------------

SHRP.ctrl.ModalCreateFolderCTRL = ['$scope', '$modalInstance', 'LibrariesService', function($scope, $modalInstance, LibrariesService) {

    //#region Define variables
    $scope.searchUnitsQuery = {
        s: '',
        p: 1,
        ps: 20
    };
    $scope.unitList = [];
    $scope.SharedUsers = [];
    $scope.SharedGroups = [];
    $scope.SharedRoles = [];

    //#endregion

    $scope.addUnits = function(unit) {
        if ($scope.unitList.indexOf(unit) === -1) {
            $scope.unitList.push(unit);
            if (unit.Type === 'u') {
                $scope.SharedUsers.push(unit.Id);
            } else if (unit.Type === 'g') {
                $scope.SharedGroups.push(unit.Id);
            } else if (unit.Type === 'r') {
                $scope.SharedRoles.push(unit.Id);
            }
        }
    };

    //#region Function showAutocomplete()
    $scope.showAutocomplete = function() {
        $('#share-unit-list-create-folder').show();
    };
    //#endregion

    $scope.tag = {
        addedTags: [],
        tags: [{ id: 1, label: 'architecture' }, { id: 2, label: 'food' }, { id: 3, label: 'design' }, { id: 4, label: 'specification' }, { id: 5, label: 'IT' },
        { id: 6, label: 'company' }, { id: 7, label: 'human resource' }]
    };

    function checkIdExist(array, id) {
        if (array) {
            for (var i = 0; i < array.length; i++) {
                if (array[i].id === id) {
                    return i;
                }
            }
        }
        return -1;
    }

    $scope.newTag = undefined;

    $scope.addTag = function(t) {
        if (t) {
            $scope.tag.addedTags.push(t);
            var index = checkIdExist($scope.tag.tags, t.id);
            $scope.newTag = undefined;
            if (index !== -1) {
                $scope.tag.tags.splice(index, 1);
            }
        }
    };

    $scope.removeTag = function(t) {
        if (t) {
            var index = checkIdExist($scope.tag.addedTags, t.id);
            if (index !== -1) {
                $scope.tag.addedTags.splice(index, 1);
                $scope.tag.tags.push(t);
            }
        }
    };

    $scope.visibilities = [{ val: 'h', title: 'Only Me' }, { val: 'v', title: 'Share' }, { val: 'p', title: 'Everyone' }];

    $scope.selectedVisibility = $scope.visibilities[0];

    $scope.addGroup = function(g) {
        $scope.data.selectedGroups.push(g);
    };


    $scope.removeGroup = function() {
        $scope.data.selectedGroups = null;
    };

    $scope.ok = function() {
        // check there is actually some data in there
        if ($scope.data.Name && $scope.data.Name.length) {
            // If the permission is not specific people, remove it.
            if ($scope.data.Visibility && $scope.data.Visibility.value !== 'v') {
                $scope.data.selectedGroups = null;
            }

            $scope.data.SharedUsers = $scope.SharedUsers;
            $scope.data.SharedGroups = $scope.SharedGroups;
            $scope.data.SharedRoles = $scope.SharedRoles;

            $modalInstance.close($scope.data);
        }
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

    //#region onChangeSearchUnitsToShare : Search Units (users, groups, roles) and bind to autocomplete box
    $scope.onChangeSearchUnitsToShare = function(keyword) {
        $scope.groups = []; // clear list
        $('#share-unit-list-create-folder').show();
        if (keyword !== '') { //not empty string
            $scope.isSearchingListShare = true;
            $scope.searchUnitsQuery.s = keyword;
            //$scope.searchUnitsQuery.p += 1;
            //Call LibrariesService.artifactSearch
            LibrariesService.searchInfos($scope.searchUnitsQuery).then(function(res) {
                $scope.isSearchingListShare = false;
                $scope.groups = []; // clear list
                $scope.groups = res.data ? res.data : [];
            });
        } else {
            $scope.isSearchingListShare = false;
            $scope.searchUnitsQuery.s = '';
            $scope.searchUnitsQuery.p = 1;
            $scope.groups = []; // clear list
        }
    };
    //#endregion

    $scope.scrollbarCreateFolderModalConfig = {
        autoHideScrollbar: true,
        theme: 'minimal-dark',
        axis: 'y',
        advanced: {
            updateOnContentResize: true
        },
        setWidth: 'auto',
        scrollInertia: 400
    };
}];


// Create new note Controller
// ----------------------------------------

SHRP.ctrl.ModalCreateNoteCTRL = ['$scope', '$modalInstance', function($scope, $modalInstance) {

    $scope.allGroups = [{ id: '1', name: 'Jonh', type: 'member' },
                        { id: '2', name: 'Eagle', type: 'group' },
                        { id: '3', name: 'Aleson', type: 'member' },
                        { id: '4', name: 'Manager', type: 'role' },
                        { id: '5', name: 'Jonh Alew', type: 'member' },
                        { id: '6', name: 'Gun', type: 'group' },
                        { id: '7', name: 'Aleson', type: 'member' },
                        { id: '8', name: 'Leader', type: 'role' },
                        { id: '9', name: 'Watson', type: 'member' },
                        { id: '10', name: 'Blood', type: 'group' }

    ];

    $scope.parentFolders = {
        selected: { value: 1, type: 'My Document' },
        folders: [
            { value: 1, type: 'My Document' },
            { value: 2, type: 'Shared Documents' },
            { value: 3, type: 'All Photos' },
            { value: 4, type: 'All Videos' },
            { value: 5, type: 'Default' }]
    };

    $scope.permission = {
        selected: { value: 1, type: 'Only Me' },
        permissionList: [
            { value: 1, type: 'Only Me' },
            { value: 2, type: 'Just my team (Hawthorn)' },
            { value: 3, type: 'Specific people' },
            { value: 4, type: 'Everyone' }]
    };

    $scope.addNewTimeInterval = function() {
        var timeInterval = {
            'from': undefined,
            'to': undefined
        };

        if (!$scope.data.timeIntervals) {
            $scope.data.timeIntervals = [];
        }
        $scope.data.timeIntervals.push(timeInterval);
    };

    $scope.ok = function() {
        // check there is actually some data in there
        if ($scope.data.name && $scope.data.name.length) {
            $modalInstance.close($scope.data);
        }
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
}];

// Add tag
// ----------------------------------------

SHRP.ctrl.ModalAddTagCTRL = ['$scope', '$modalInstance', 'LibrariesService', 'file', function($scope, $modalInstance, LibrariesService, file) {

    $scope.tag = {
        addedTags: angular.copy(file.TagNames),
        tags: undefined
    };

    $scope.getAllTag = function() {
        LibrariesService.getTags().then(function(res) {
            $scope.tag.tags = res.data;
        });
    };

    $scope.tagClone = undefined;

    // reload selected data for task manager
    $scope.reloadSelectData = function(str) {
        var dto = {
            s: str,
            p: 1,
            ps: 20
        };
        LibrariesService.searchTagByString(dto).then(function(res) {
            console.log(res);
        });
        //$scope.tag.tags =
    };

    $scope.addTagManual = function(tagClone) {
        if (tagClone && tagClone.newTag && !tagClone.newTag.TagId) {
            var newTag = {};
            newTag.TagName = tagClone;
            newTag.label = tagClone;
            $scope.tag.addedTags.push(newTag);
            tagClone.newTag = undefined;
        }
        else {
            var index = $scope.tag.tags.indexOf(tagClone.newTag);
            if (index !== -1) {
                $scope.tag.addedTags.push(tagClone.newTag);
                //$scope.tag.tags.splice(index, 1);
            }
            tagClone.newTag = undefined;
        }
    };

    $scope.closeAndOpenAllTagsModal = function() {
        $modalInstance.dismiss('cancel');
        $scope.openAllTagModal(file,$scope.tag.addedTags,$scope.tag.tags);
    };
    $scope.ok = function() {
        $modalInstance.close($scope.tag.addedTags);
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
}];

// Edit file Controller 
// ----------------------------------------

SHRP.ctrl.ModalEditFileCTRL = ['$scope', '$modalInstance', function($scope, $modalInstance) {

    $scope.ok = function() {
        // check there is actually some data in there
        if ($scope.data.name && $scope.data.name.length) {
            $modalInstance.close($scope.data);
        }
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
}];

// Change Title Controller
// ----------------------------------------

SHRP.ctrl.ModalChangeTitleCTRL = ['$scope', 'LibrariesService', '$notify', '$modalInstance', 'detail', function($scope, LibrariesService, $notify, $modalInstance, detail) {

    $scope.detail = detail;

    $scope.containerObject = undefined;
    $scope.fileObject = undefined;

    if (!detail.IsContainer) { // artifact
        var objFile = $scope.detail.FileName.split('.');
        $scope.editName = objFile[0] ? objFile[0] : $scope.detail.FileName;

        LibrariesService.getArtifactById(detail.ArtifactId).then(function(res) {
            $scope.fileObject = res.data;
        });
    }
    else { // container
        $scope.editName = $scope.detail.Name;
        LibrariesService.getContainerById(detail.ContainerId).then(function(res) {
            $scope.containerObject = res.data.detail;
        });
    }


    $scope.ok = function() {

        // check there is actually some data in there
        if ($scope.editName && $scope.editName.length && ($scope.containerObject || $scope.fileObject)) {

            // Begin loading
            $scope.loading = true;
            // set new name for sampleObj...need to replace sampleObj = $scope.item
            //Check if ContainerType is exist (exist --> folder, otherwise: artifact)
            // Declare array to contains data format for backend
            var roles = [];
            var groups = [];
            var users = [];
            var tags = [];

            if ($scope.containerObject) { // item is container
                //TODO : call PUT api/containers/{containerId}
                if ($scope.containerObject.SharedRoles.length) {
                    $scope.containerObject.SharedRoles.forEach(function(obj, idx) {
                        if (obj) {
                            roles.push(obj.Id);
                        }
                    });
                }

                if ($scope.containerObject.SharedGroups.length) {
                    $scope.containerObject.SharedGroups.forEach(function(obj, idx) {
                        if (obj) {
                            groups.push(obj.Id);
                        }
                    });
                }

                if ($scope.containerObject.SharedUsers.length) {
                    $scope.containerObject.SharedUsers.forEach(function(obj, idx) {
                        if (obj) {
                            users.push(obj.Id);
                        }
                    });
                }

                var container = {
                    Name: $scope.editName,
                    ParentContainerId: $scope.containerObject.ParentId ? $scope.containerObject.ParentId : null,
                    Visibility: $scope.containerObject.Visibility,
                    SharedRoles: roles.length > 0 ? roles : null,
                    SharedUsers: users.length > 0 ? users : null,
                    SharedGroups: groups.length > 0 ? groups : null,
                };

                LibrariesService.updateUserContainer($scope.detail.ContainerId, container).then(function(res) {
                    //TODO : update current item on global list item
                    $scope.loading = false;
                    // When save done, close modal
                    $modalInstance.close($scope.data);
                    if (!res.data.Errors) {
                        detail.Name = $scope.editName;
                        $notify.add({
                                    message: 'Update folder successfully!',
                                    type: 'success',
                                    visible: true
                        });
                    }
                });
            } else { // item is artifact
                //TODO : call PUT api/artifacts/{artifactId}

                if ($scope.fileObject.SharedRoles.length) {
                    $scope.fileObject.SharedRoles.forEach(function(obj, idx) {
                        if (obj) {
                            roles.push(obj.Id);
                        }
                    });
                }

                if ($scope.fileObject.SharedGroups.length) {
                    $scope.fileObject.SharedGroups.forEach(function(obj, idx) {
                        if (obj) {
                            groups.push(obj.Id);
                        }
                    });
                }

                if ($scope.fileObject.SharedUsers.length) {
                    $scope.fileObject.SharedUsers.forEach(function(obj, idx) {
                        if (obj) {
                            users.push(obj.Id);
                        }
                    });
                }

                if ($scope.fileObject.TagNames.length) {
                    $scope.fileObject.TagNames.forEach(function(obj, idx) {
                        if (obj) {
                            tags.push(obj.TagName);
                        }
                    });
                }

                var fileType = $scope.fileObject.ArtifactTitle.split('.').pop();
                $scope.editName = $scope.editName + '.' + fileType;

                var file = {
                    ArtifactTitle: $scope.fileObject.ArtifactTitle,
                    Visibility: $scope.fileObject.Visibility,
                    FileName: $scope.editName,
                    FileSize: $scope.fileObject.FileSize,
                    ContainerId: $scope.fileObject.ContainerId,
                    SharedRoles: roles.length > 0 ? roles : null,
                    SharedUsers: users.length > 0 ? users : null,
                    SharedGroups: groups.length > 0 ? groups : null,
                    TagNames: tags.length > 0 ? tags : null
                };

                LibrariesService.updateArtifact($scope.detail.ArtifactId, file).then(function(res) {
                    // When save done, close modal
                    $scope.loading = false;
                    $modalInstance.close($scope.editName);
                    if (!res.data.Errors) {
                        detail.Name = $scope.editName;
                        $notify.add({
                            message: 'Update Title successfully!',
                            type: 'success',
                            visible: true
                        });
                    }
                });
            }
        }
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
}];


// Uploader Controller
// ----------------------------------------

SHRP.ctrl.ModalLibraryUploadCTRL = ['$scope', '$modalInstance', 'containerId', 'collection', function($scope, $modalInstance, containerId, collection) {

    $scope.containerId = containerId || '';
    $scope.collection = collection || {};

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

}];

// Share file Controller
// ----------------------------------------
SHRP.ctrl.ModalShareFileCTRL = ['$scope', '$modalInstance', 'groups', 'selectedGroups', '$sce', 'LibrariesService', 'modalData', 'itemId', 'itemType', '$notify', function($scope, $modalInstance, groups, selectedGroups, $sce, LibrariesService, modalData, itemId, itemType, $notify) {

    function pauseVideo(isPause) {
        var elementVideo = $('.lightbox').find('.video__frame').get(0);

        if (elementVideo !== null && elementVideo !== undefined) {
            var elementRelatedModal = $('.modal__relatedfile--video');

            if (elementRelatedModal !== null && elementRelatedModal !== undefined) {
                $('.modal__relatedfile--video').trigger('mousedown');
            }

            if (elementVideo.currentTime > 0) {
                elementVideo.play();
            }

            if (isPause) {
                elementVideo.pause();
            }
        }
    }

    pauseVideo(true);

    //#region Define variables
    $scope.searchUnitsQuery = {
        s: '',
        p: 1,
        ps: 20
    };

    $scope.scrollbarConfig = {
        autoHideScrollbar: true,
        theme: 'minimal-dark',
        advanced: {
            updateOnContentResize: true
        },
        setWidth: '100%',
        scrollInertia: 400
    };

    //#endregion

    $scope.scrollbarShareModalConfig = {
        autoHideScrollbar: true,
        theme: 'minimal-dark',
        axis: 'y',
        advanced: {
            updateOnContentResize: true
        },
        setWidth: 'auto',
        scrollInertia: 400
    };

    //#region Init modal share
    $scope.listToShare = selectedGroups;
    $scope.groups = [];
    $scope.submitted = false;
    $scope.hideList = true;
    $scope.loading = false;
    //#endregion

    //#region To hover delete icon in list share
    $scope.iconDelete = false;
    $scope.showDeleteIcon = function(index) {
        $scope.iconDelete = true;
        $scope.deleteIconIndex = index;
    };
    $scope.hideDeleteIcon = function(index) {
        $scope.iconDelete = false;
        $scope.deleteIconIndex = index;
    };
    //#endregion

    //#region To Hide and Show groups list when click "change"
    $scope.showListGroup = function() {
        $scope.hideList = false;
    };

    $scope.hideListGroup = function() {
        $scope.hideList = true;
    };
    //#endregion

    $scope.sharedUserIds = [];
    $scope.sharedGroupIds = [];
    $scope.sharedRoleIds = [];
    $scope.visibility = 'h';

    if (selectedGroups.length > 0) {
        angular.forEach(selectedGroups, function(group, key) {
            if (group.Type === 'u') {
                $scope.sharedUserIds.push(group.Id);
            } else if (group.Type === 'g') {
                $scope.sharedGroupIds.push(group.Id);
            } else if (group.Type === 'r') {
                $scope.sharedRoleIds.push(group.Id);
            }
        });
    }

    //#region Set data to modal
    if (itemType === 'folder') {
        $scope.modalData = {
            Name: modalData.Name,
            Visibility: modalData.Visibility,
            ParentContainerId: modalData.ParentContainerId,
            Description: modalData.Description,
            SharedUsers: $scope.sharedUserIds,
            SharedGroups: $scope.sharedGroupIds,
            SharedRoles: $scope.sharedRoleIds
        };
    } else if (itemType === 'file') {
        $scope.modalData = {
            ArtifactTitle: modalData.ArtifactTitle,
            FileName: modalData.FileName,
            FileSize: modalData.FileSize,
            Visibility: modalData.Visibility,
            ContainerId: modalData.ContainerId,
            SharedUsers: $scope.sharedUserIds,
            SharedGroups: $scope.sharedGroupIds,
            SharedRoles: $scope.sharedRoleIds,
            TagNames: modalData.TagNames
        };
    }
    //#endregion

    //#region Save modal data
    $scope.ok = function() {
        $scope.loading = true;
        var obj;
        //set visibility
        if ($scope.listToShare.length > 0 && $scope.selected.id === 1) {
            $scope.visibility = 'v';
        } else if ($scope.listToShare.length === 0 && $scope.selected.id === 3) {
            $scope.visibility = 'p';
        } else {
            $scope.visibility = 'h';
        }

        if (itemType === 'folder') {

            obj = {
                'Name': $scope.modalData.Name,
                'Visibility': $scope.visibility,
                'ParentContainerId': $scope.modalData.ParentContainerId,
                'Description': $scope.modalData.Description,
                'SharedUsers': $scope.modalData.SharedUsers.length > 0 ? $scope.modalData.SharedUsers : null,
                'SharedGroups': $scope.modalData.SharedGroups.length > 0 ? $scope.modalData.SharedGroups : null,
                'SharedRoles': $scope.modalData.SharedRoles.length > 0 ? $scope.modalData.SharedRoles : null
            };

            LibrariesService.updateUserContainer(parseInt(itemId), obj).then(function(res) {
                if (!res.data.Errors) {
                    $notify.add({
                        message: 'Update folder successfully!',
                        type: 'success',
                        visible: true
                    });
                }
                $scope.loading = false;
                $scope.cancel();
            });
        } else if (itemType === 'file') {
            obj = {
                'ArtifactTitle': modalData.ArtifactTitle,
                'FileName': $scope.modalData.FileName,
                'FileSize': $scope.modalData.FileSize,
                'Visibility': $scope.visibility,
                'ContainerId': $scope.modalData.ContainerId,
                'SharedUsers': $scope.modalData.SharedUsers.length > 0 ? $scope.modalData.SharedUsers : null,
                'SharedGroups': $scope.modalData.SharedGroups.length > 0 ? $scope.modalData.SharedGroups : null,
                'SharedRoles': $scope.modalData.SharedRoles.length > 0 ? $scope.modalData.SharedRoles : null,
                'TagNames': $scope.modalData.TagNames.length > 0 ? $scope.modalData.TagNames : null
            };

            LibrariesService.updateArtifact(parseInt(itemId), obj).then(function(res) {
                if (!res.data.Errors) {
                    $notify.add({
                        message: 'Update file successfully!',
                        type: 'success',
                        visible: true
                    });

                    $scope.loading = false;
                    $scope.cancel();

                    if ($scope.artifact) {
                        $scope.artifact.sharedUnitsPaneInfo = $scope.sharedUnits;
                    }
                }
            });

        }
    };
    //#endregion

    //#region Function cancel to close modal
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
        pauseVideo();
    };
    //#endregion

    //#region Function removeGroup
    $scope.removeGroup = function(index, item) {
        $scope.listToShare.splice(index, 1);
        var type = item.Type;
        var id = item.Id;
        if (type === 'u') {
            $scope.modalData.SharedUsers.splice($scope.modalData.SharedUsers.indexOf(id));
        } else if (type === 'g') {
            $scope.modalData.SharedGroups.splice($scope.modalData.SharedGroups.indexOf(id));
        } else if (type === 'r') {
            $scope.modalData.SharedRoles.splice($scope.modalData.SharedRoles.indexOf(id));
        }
    };
    //#endregion

    //#region Select box
    $scope.items = [{
        id: 1,
        label: $sce.trustAsHtml('Shared'),
        disabled: false
    }, {
        id: 2,
        label: $sce.trustAsHtml('Only me'),
        disabled: true
    },
    {
        id: 3,
        label: $sce.trustAsHtml('Everyone'),
        disabled: true
    }
    ];

    //Set default select box
    if ($scope.listToShare.length > 0 && $scope.modalData.Visibility === 'v') {
        $scope.selected = $scope.items[0];
    } else if (($scope.listToShare.length === 0 && $scope.modalData.Visibility === 'p') || ($scope.listToShare.length === 0 && $scope.modalData.Visibility === 'v')) {
        $scope.selected = $scope.items[2];
    } else {
        $scope.selected = $scope.items[1];
    }

    $scope.selectShareOption = function(selected) {
        //clear list
        $scope.listToShare = [];
        $scope.modalData.SharedUsers = [];
        $scope.modalData.SharedGroups = [];
        $scope.modalData.SharedRoles = [];
        $scope.selected = selected;
    };
    //#endregion

    //#region Function shareWith
    $scope.shareWith = function(selectedGroups) {
        $scope.modalData.selectedGroups = [];
        angular.forEach(selectedGroups, function(group) {
            $scope.listToShare.push(group);
        });
    };
    //#endregion

    //#region onChangeSearchUnits : Search Units (users, groups, roles) and bind to autocomplete box
    $scope.onChangeSearchUnits = function(keyword) {
        $scope.groups = []; // clear list
        $('#share-unit-list').show();
        if (keyword !== '') { //not empty string
            $scope.isSearchingListShare = true;
            $scope.searchUnitsQuery.s = keyword;
            //$scope.searchUnitsQuery.p += 1;
            //Call LibrariesService.artifactSearch
            LibrariesService.searchInfos($scope.searchUnitsQuery).then(function(res) {
                $scope.isSearchingListShare = false;
                $scope.groups = []; // clear list
                $scope.groups = res.data ? res.data : [];
            });
        } else {
            $scope.isSearchingListShare = false;
            $scope.searchUnitsQuery.s = '';
            $scope.searchUnitsQuery.p = 1;
            $scope.groups = []; // clear list
        }
    };
    //#endregion

    //#region Function addUnits(unit)
    $scope.addUnits = function(unit) {
        $('#share-unit-list').hide();
        if ($scope.checkHasUnit(unit, $scope.listToShare) === false) {
            $scope.listToShare.push(unit);
            if (unit.Type === 'u') {
                $scope.modalData.SharedUsers.push(unit.Id);
            } else if (unit.Type === 'g') {
                $scope.modalData.SharedGroups.push(unit.Id);
            } else if (unit.Type === 'r') {
                $scope.modalData.SharedRoles.push(unit.Id);
            }

            //clear searchString and list result
            $scope.groups = [];
            $scope.searchUnitsKeyword = '';
        }
    };
    //#endregion

    $scope.checkHasUnit = function(unit, list) {
        var result = false;
        for (var i = 0; i < list.length; i++) {
            if (unit.Id === list[i].Id && unit.Type === list[i].Type) {
                result = true;
                break;
            }
        }
        return result;
    };

    //#region Function showAutocomplete()
    $scope.showAutocomplete = function() {
        $('#share-unit-list').show();
    };
    //#endregion

}];
SHRP.ctrl.ModalAllTagsCTRL = ['$scope', '$modalInstance', 'currentTags','allTags', function($scope, $modalInstance, currentTags, allTags) {

    $scope.scrollbarAllTagsConfig = {
        autoHideScrollbar: true,
        theme: 'minimal-dark',
        advanced: {
            updateOnContentResize: true
        },
        setWidth: 'auto',
        scrollInertia: 400
    };
    $scope.currentTags = currentTags;
    $scope.allTags = allTags;
    $scope.groupTags = _.chain($scope.allTags)
        .groupBy(function(obj) {
            return obj.TagName[0].toUpperCase();
        })
        .map(function(values, key) {
            return [key, values];
        })
        .value();
    $scope.sortTags = _.sortBy($scope.groupTags,function(obj) {
        return  obj[0];
    });
    $scope.addTag = function(tag) {
        var isAdded = false;
        if($scope.currentTags.length) {
            angular.forEach($scope.currentTags,function(currentTag) {
                // check tag is added
                if(tag.TagId === currentTag.TagId) {
                    isAdded = true;
                }
            });
        }
        if(!isAdded) {
            $scope.currentTags.push(tag);
        }
    };
    $scope.deleteTag = function(tag) {
        if($scope.currentTags.length) {
            angular.forEach($scope.currentTags, function(currentTag) {
                if (tag.TagId === currentTag.TagId) {
                    $scope.currentTags.splice($scope.currentTags.indexOf(currentTag),1);
                }
            });
        }
    };
    $scope.isDisabled = function(tag) {
        var result = false;
        if($scope.currentTags.length) {
            angular.forEach($scope.currentTags,function(currentTag) {
                if(tag.TagId === currentTag.TagId) {
                    result = true;
                }
            });
        }else{
            result = false;
        }
        return result;
    };
    $scope.ok = function() {// Send added tags to server
        $modalInstance.close($scope.currentTags);
    };
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
}];

