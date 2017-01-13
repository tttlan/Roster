
angular.module('ui.common.panes')

/*
 * <panes></panes>
 *
 */

// Directive to handle panes
// ------------------------------------------------

.directive('panes', ['$timeout', 'PanesFactory', '$modal', 'LibrariesService', '$notify', '$window',
function($timeout, PanesFactory, $modal, LibrariesService, $notify, $window) {

    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/interface/views/panes/partials/panes.html',
        scope: {
            title: '@'
        },
        controller: function($scope, $element, $attrs) {

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
            $scope.pathDisplay = [{ name: 'My Space', id: null }];
            $scope.CurrentPath = 'My Space'; // cache location where user is standing
            $scope.searchString = ''; // this is variable use to search artiact to view
            $scope.searchLinkKeyword = ''; // this is variable use to search artiact to make linked
            $scope.ResultSearchArifact = [];// list artifact contain data return from method LibrariesService.artifactSearch();
            $scope.ParentContainerId = null;
            $scope.loading = true;
            // Set select tab in left pane
            //1- My Space
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
                    $element.scrollLeft(calcWidth());
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

            PanesFactory.onAddPane($scope, onPaneAddedHandler);


            // on CLOSE pane event
            // ------------------------------------

            var onPaneCloseHandler = function(index) {

                // Remove index and everything after
                $scope.panes.splice(index);
            };

            PanesFactory.onClosePane($scope, onPaneCloseHandler);

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

                        console.log(folder);

                        $scope.containers.push(folder);

                    });
                });
            };
            //#endregion

            //#region Upload New File
            // ------------------------------------
            $scope.uploadFiles = function() {
                // When upload file, hide it
                //$scope.isShowFileInfo = null;
                //$scope.isShowLinkedFiles = null;

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
                                        t.TagName = obj.TagName;
                                        t.TagId = obj.TagId ? obj.TagId : null;
                                        t.label = obj.label ? obj.label : null;
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

            //#region Get user container
            //Limit user container to 4
            $scope.userContainerLimited = 4;

            // Get user container by order and shared property
            $scope.getUserContainer = function getUserContainer(order, shared) {
                $scope.isShowFileInfo = false;
                $scope.isShowLinkedFiles = false;
                $scope.StyleForBottomAction = {};// reset
                $scope.loading = true;
                LibrariesService.getUserContainer(order, shared).then(function(res) {
                    $scope.loading = false;
                    $scope.containers = res.data ? res.data.items : [];
                    $scope.pathDisplay = [{ name: shared ? 'Shared Documents' : 'My Space', id: null }];
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

                if (!path.id) {
                    $scope.ParentContainerId = null;
                    if (path.name === 'My Space' || path.name === 'Search Results') {
                        $scope.getUserContainer(1, 0);
                    } else if (path.name === 'Shared Documents') {
                        $scope.getUserContainer(1, 1);
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

            //#region Open preview lightbox
            // ------------------------------------

            $scope.openLightbox = function(item, isOpenComment) {

                // Show light box view
                var artifactTypeName = angular.lowercase(item.ArtifactTypeName);
                var artifactId = item.ArtifactId;

                item.ArtifactTypeName = artifactTypeName;

                //call related file
                LibrariesService.getRelatedArtifacts(artifactId).then(function(res) {
                    $scope.RelatedFiles = res.data.RelatedFiles;
                    $scope.numRelatedFiles = res.data.RelatedFiles.length;
                });

                // Get activity id and comment count
                LibrariesService.getArtifactById(artifactId).then(function(res) {
                    $scope.ActivityItemId = res.data.ActivityItemId;
                    $scope.CommentCount = res.data.CommentCount;

                    // Get url
                    if (artifactTypeName === 'document') {
                        LibrariesService.getViewUrl(artifactId).then(function(res) {
                            if (res.status === 200) {
                                item.Thumbnail = res.data.Url;
                                view(item);
                            }
                        });
                    } else if (artifactTypeName === 'video' || artifactTypeName === 'audio') {
                        LibrariesService.getStreamingUrl(artifactId).then(function(res) {
                            if (res.status === 200) {
                                item.Thumbnail = res.data.Url;
                                view(item);
                            }
                        });
                    } else {
                        view(item);
                    }
                });

                function view(item) {
                    $scope.items = [];

                    // Check condition for get list file to view
                    if (item.ArtifactTypeName === 'Image' || item.ArtifactTypeName === 'image') {
                        angular.forEach($scope.containers, function(obj) {
                            var artifactTypeName = angular.lowercase(obj.ArtifactTypeName);
                            if (artifactTypeName === 'image') {
                                obj.ArtifactTypeName = artifactTypeName;
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
                        templateUrl: '/interface/views/common/partials/lightbox-gallery.html',
                        controller: SHRP.ctrl.ModalLibraryLightboxCTRL,
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
                            RelatedFiles: function() {
                                return $scope.RelatedFiles;
                            },
                            numRelatedFiles: function() {
                                return $scope.numRelatedFiles;
                            },
                            ActivityItemId: function() {
                                return $scope.ActivityItemId;
                            },
                            containers: function() {
                                return $scope.containers;
                            },
                            CommentCount: function() {
                                return $scope.CommentCount;
                            }
                        }
                    });
                }
            };
            //#endregion

        }
    };
}]);