
// Common Controller
// ----------------------------------------
angular.module('ui.common.controllers')


// Header Controller
// ----------------------------------------
.controller('headerController',['$scope', 'activePage', function($scope, activePage) {

    //is Page Active function call
    $scope.isActive = activePage.isActive;

}]);


// Modal Controller (is injected at runtime)
// ----------------------------------------
var SHRP = SHRP || {};
SHRP.ctrl = SHRP.ctrl || {};

SHRP.ctrl.ModalCTRL = ['$scope', '$modalInstance', 'items', 'dataUpload', function($scope, $modalInstance, items, dataUpload) {

    $scope.items = items || [];
    $scope.dataUpload = dataUpload || {};
    $scope.isOldUploader = $scope.dataUpload.isOldUploader ? $scope.dataUpload.isOldUploader : false;
    $scope.containerId = $scope.dataUpload.containerId ? $scope.dataUpload.containerId : null;
    $scope.moduleUpload = $scope.dataUpload.moduleUpload ? $scope.dataUpload.moduleUpload : null;

    $scope.ok = function() {
        $modalInstance.close($scope.items);
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

}];


// Group Picker controller
// -----------------------------------------------

SHRP.ctrl.GroupPickerCtrl = ['$scope', '$modalInstance', 'groups', 'selectedGroups', function($scope, $modalInstance, groups, selectedGroups) {
        
    $scope.groups = groups;
    $scope.submitted = false;

    $scope.modalData = {
        selectedGroups: [].concat(selectedGroups) || [],
        allGroups: !selectedGroups.length || groups.length === selectedGroups.length
    };
    $scope.ok = function() {

        if(!$scope.submitted) { $scope.submitted = true; }
        if(!$scope.modalData.allGroups && !$scope.modalData.selectedGroups.length) { return; }
        $modalInstance.close({
            groups: $scope.modalData.allGroups ? [] : [].concat($scope.modalData.selectedGroups),
            allGroups: $scope.modalData.allGroups
        });
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
}];


// Category controller
// -----------------------------------------------

SHRP.ctrl.CategoryCtrl = ['$scope', '$modalInstance', 'items', 'BlogService', function($scope, $modalInstance, items, BlogService) {

    $scope.items = items;

    $scope.addCategory = function(cat) {
        if(cat) {
            var obj = {
                BlogCategorySummary: {
                    'Description': cat,
                    'CategoryName': cat 
                }
            };
            $scope.items.push(obj);
            createCategory(obj);
        }
        $scope.newCategory = null;

    };

    $scope.updateCategory = function(category, indx) {
        category.edit = false;
        updateCategory(category);
    };

    $scope.deleteCategory = function(category, indx) {
        $scope.items.splice(indx, 1);
        deleteCategory(category);
    };

    $scope.ok = function() {
        $modalInstance.close($scope.items);
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

    function createCategory(obj) {
        
        BlogService.createCategory({
          Description: obj.BlogCategorySummary.Description,
          CategoryName: obj.BlogCategorySummary.CategoryName
        })
        .then(function(ret) {
            obj.BlogCategorySummary.Id = ret.data;
        }, function(ret) {
            console.log('category failed');
        });
    }

    function updateCategory(obj) {
        // Update
        BlogService.updateCategory({
          CategoryId: obj.BlogCategorySummary.Id,
          Description: obj.BlogCategorySummary.CategoryName,
          CategoryName: obj.BlogCategorySummary.CategoryName
        })
        .then(function(ret) {
            
        }, function(ret) {
            console.log('category failed');
        });
    }

    function deleteCategory(obj) {
        // Delete
        BlogService.deleteCategory({
          CategoryId: obj.BlogCategorySummary.Id
        })
        .then(function(ret) {
            
        }, function(ret) {
            alert('Category Delete API isn\'t working');
        });

    }
}];


// Controller for member listings with counts
// -----------------------------------------------

SHRP.ctrl.ModalListingCTRL = ['$scope', '$modalInstance', 'items', 'count', 'type', function($scope, $modalInstance, items, count, type) {

    $scope.items = items || [];
    $scope.count = count || 0;
    $scope.type = type;

    $scope.ok = function() {
        $modalInstance.close($scope.items);
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

}];

// Controller for People list data
// ---------------------------------------
SHRP.ctrl.ModalPeopleListCTRL = ['$scope', '$modalInstance', 'getItems', 'count', 'titleSyntax', function($scope, $modalInstance, getItems, count, titleSyntax) {

    $scope.currentPage = 0;
    $scope.items = [];
    $scope.count = count || 0;
    $scope.titleSyntax = titleSyntax;

    $scope.getItems = function() {

        if($scope.loading || !$scope.count) { return; }

        $scope.loading = true;
        $scope.currentPage++;

        getItems($scope.currentPage).then(function(res) {
            $scope.loading = false;
            $scope.items = $scope.items.concat(res.data);
            $scope.canLoadMore = $scope.items.length < $scope.count;
        });
    };

    $scope.getItems(1);

    $scope.ok = function() {
        $modalInstance.close($scope.items);
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

}];

// Controller for group members modal
// ---------------------------------------
SHRP.ctrl.ModalGroupMembersCTRL = ['$scope', '$modalInstance', 'getItems', 'count', 'groupBio', function($scope, $modalInstance, getItems, count, groupBio) {

    $scope.items = [];
    $scope.count = count || 0;
    $scope.groupBio = groupBio;

    $scope.getItems = function() {

        if($scope.loading || !$scope.count) { return; }

        $scope.loading = true;

        getItems($scope.currentPage).then(function(res) {
            $scope.loading = false;
            $scope.items = res.data;
        });
    };

    $scope.getItems();

    $scope.ok = function() {
        $modalInstance.close($scope.items);
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

}];

SHRP.ctrl.ModalReferFriendCTRL = ['$scope', '$modalInstance', 'job', 'Recruitment', function($scope, $modalInstance, job, Recruitment) {
    $scope.job = job;
    $scope.loading = false;

    $scope.save = function(isValid, friend) {
        if(isValid) {
            var postObj = {
                JobId: job.JobId,
                JobAdTitle: job.JobTitle
            };

            angular.extend(postObj, friend);
            
            $scope.loading = true;
            $scope.serverError = '';
            
            Recruitment.referFriend(postObj).then(function() {
                //It passed
                $scope.loading = false;
                $modalInstance.close('success');

            }, function() {
                // It failed
                $scope.loading = false;
                $scope.serverError = 'There was a server error. Please try again soon';
            });
            
        }
    };
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
}];

// Shift details controller
// -----------------------------------------------

SHRP.ctrl.ModalShiftCTRL = ['$scope', '$modalInstance', 'Service', '$timeout', '$q', 'days', 'selectedIndex', function($scope, $modalInstance, Service, $timeout, $q, days, selectedIndex) {
    
    function getAdditionalShiftData(shift) {
        
        shift.loading = true;
        
        return Service.getRosterShift( shift.ShiftId ).then(function(response) {
            
            shift = angular.extend({}, response.data, shift);
            shift.loading = false;
            
            return shift;

        }, function() {

            shift.loading = false;
            return shift;

        });

    }

    $scope.dayCount = days.length - 1;
    $scope.selectedDayIndex = selectedIndex;
    $scope.selectedDay = days[selectedIndex];

    $scope.$watch('selectedDayIndex', function(newVal, oldVal) {
        
        if(typeof newVal === 'number') {

            $scope.selectedDay = days[newVal];

            if(!$scope.selectedDay.additionalInfoLoaded) {

                //load in more data for the shifts
                $scope.selectedDay.additionalInfoLoaded = true;
                $q.all( $scope.selectedDay.shifts.map(getAdditionalShiftData) ).then(function(returnedShifts) {
                    days[newVal].shifts = returnedShifts;
                });

            }

            

        }
    });

    $scope.ok = function() {
        $modalInstance.close($scope.shifts);
    };

    $scope.prevDay = function() {
        if($scope.selectedDayIndex === 0) { return; }

        $scope.selectedDayIndex--;
        
    };
    $scope.nextDay = function() {
        
        if($scope.selectedDayIndex === $scope.dayCount) { return; }
        

        $scope.selectedDayIndex++;
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

    $scope.updateShift = function(status, shift) {

        var data = {
            startShiftId: shift.ShiftId,
            isAccepted: status,
            denyReason: ''
        };

        Service.confirmRoster(data).then(function(res) {
            if (res.data) {
                shift.Status = status ? 'confirmed' : 'rejected';
            }
        });
    };

}];

// Controller for modal within directory that opens vcards

SHRP.ctrl.ModalVcardCTRL = ['$scope', '$modalInstance', 'items', 'mediaQuery', function($scope, $modalInstance, items, mediaQuery) {

    $scope.items = items || [];
    $scope.groupLimit = 3;

    $scope.isMobile = (function() {
        var mediaSize = mediaQuery.get();
        return (mediaSize === 'mobile' || mediaSize === 'phablet');
    })();

    $scope.ok = function() {
        $modalInstance.close($scope.items);
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

    $scope.showAllGroups = function() {
        $scope.groupLimit = $scope.items.GroupsList.length;
        $scope.hideToggle = true;
    };

}];


// Modal Controller (is injected at runtime)
// ----------------------------------------
SHRP.ctrl.ModalSearchCTRL = ['$scope', '$modalInstance', 'searchOpts', 'searchTerm', function($scope, $modalInstance, searchOpts, searchTerm) {

    $scope.searchOpts = searchOpts || '';
    $scope.searchTerm = searchTerm || '';

    $scope.ok = function() {
        
        var search = {
            searchOpts: $scope.searchOpts,
            searchTerm: $scope.searchTerm
        };

        $modalInstance.close(search);
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };


}];


SHRP.ctrl.ModalEventInviteesCTRL = ['$scope', '$modalInstance', 'invitees', 'onResize', function($scope, $modalInstance, invitees, onResize) {

    $scope.selectedInvitees = angular.copy(invitees) || {};

    $scope.relocateModal = function() {
        onResize.triggerResize();
    };
    $scope.ok = function() {
        $modalInstance.close($scope.selectedInvitees);
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

}];


// Lightbox gallery Controller
// ----------------------------------------

SHRP.ctrl.ModalLibraryLightboxGalleryCTRL = ['$scope', '$modalInstance', 'items', 'currentIndex', '$timeout', 'Members', 'LibrariesService', 'isOpenComment', 'numberItems', '$modal', '$notify', 'containers', 'isOpenSlideSimple',
    'RelatedFiles', 'numRelatedFiles', 'ActivityItemId', 'CommentCount',
function($scope, $modalInstance, items, currentIndex, $timeout, Members, LibrariesService, isOpenComment, numberItems, $modal, $notify, containers, isOpenSlideSimple,
    RelatedFiles, numRelatedFiles, ActivityItemId, CommentCount) {

    // Figure out if next is next in line or loop to start
    function getNext(ind) {
        return (ind < $scope.items.length - 1) ? ++ind : 0;
    }

    // Figure out if previous is prior in line or loop to end
    function getPrev(ind) {
        return (ind > 0) ? --ind : $scope.items.length - 1;
    }

    function getComment(item) {
        $scope.isLoading = true;

        // Get activity id and comment count
        LibrariesService.getArtifactById(item.ArtifactId).then(function(res) {
            $scope.ActivityItemId = res.data.ActivityItemId;
            $scope.CommentCount = res.data.CommentCount;
            $scope.isLoading = false;
        });
    }

    function getRelatedFile(item) {
        $scope.isLoading = true;
        //call api get related file
        LibrariesService.getRelatedArtifacts(item.ArtifactId).then(function(res) {
            $scope.RelatedFiles = res.data.RelatedFiles;
            $scope.numRelatedFiles = res.data.RelatedFiles.length;
            $scope.isLoading = false;
        });
    }

    function getFileInfo(artifactId) {
        if (artifactId !== null && artifactId !== '') {

            $scope.isLoading = true;
            //Get Artifact by Id
            LibrariesService.getArtifactById(artifactId).then(function(res) {
                $scope.artifact = res.data;
                $scope.sharedUnits = $scope.artifact.SharedUsers.concat($scope.artifact.SharedGroups).concat($scope.artifact.SharedRoles);
                $scope.isLoading = false;
            });

            $scope.isShowFileInfo = 1;
            $scope.isShowRightPane = 1;

        } else {
            $scope.isShowFileInfo = null;
            $scope.fileInfo = {};
            $scope.isShowRightPane = null;
        }
    }

    function getMultipleData(item) {
        getComment(item);
        getRelatedFile(item);
        getFileInfo(item.ArtifactId);
    }

    // General scope
    $scope.fullscreen = false;
    $scope.items = items;            // expose items to scope
    $scope.currentIndex = currentIndex;         // Which item is the visible one
    $scope.isOpenComment = isOpenComment ? true : false;    // open comment popup
    $scope.numberItems = numberItems; // get number item for light box
    $scope.RelatedFiles = RelatedFiles;
    $scope.numRelatedFiles = numRelatedFiles;
    $scope.ActivityItemId = ActivityItemId;
    $scope.CommentCount = CommentCount;
    $scope.containers = containers;   // get list current container
    $scope.isOpenSlideSimple = isOpenSlideSimple; // open light box when click related file
    $scope.scrollbarFileInfoConfig = {
        autoHideScrollbar: true,
        theme: 'minimal-dark',
        axis: 'y',
        advanced: {
            updateOnContentResize: true
        },
        setWidth: '270px',
        setHeight: $scope.finalfileInfoWrapperHeight ? $scope.finalfileInfoWrapperHeight : 450,
        scrollInertia: 400,
    };

    $scope.selectedSlide = {
        indx: 1,                // Which slide is visible
        loaded: true,           // bool to tell once the slider has finished animating in the slide
        offset: 0,              // progression of slides (can be negative or position depending on direction)
        showComments: $scope.isOpenComment,    // are comments for this slide visible?
        showRelatedFile: false, // are related files for this slide visible?
        showShareFile: false,   // are share file for this slide visible?
        showFileInfo: false     // are file info this slide visible?
    };

    //Load in current Member
    Members.me().then(function(response) {
        $timeout(function() {
            $scope.currentUser = response.data;
        });
    });

    // get data of comment if popup comment open

    $scope.openLightboxComment = function(item, isShowComment) {
        if (isShowComment === true) {
            $scope.selectedSlide.showComments = false;
        } else {
            $scope.selectedSlide.showComments = true;
        }

        $scope.selectedSlide.showRelatedFile = false;
        $scope.selectedSlide.showShareFile = false;
        $scope.selectedSlide.showFileInfo = false;

        getComment(item);
    };

    $scope.openLightboxRelatedFile = function(item, isShowRelatedFile) {
        if (isShowRelatedFile === true) {
            $scope.selectedSlide.showRelatedFile = false;
        } else {
            $scope.selectedSlide.showRelatedFile = true;
        }

        $scope.selectedSlide.showComments = false;
        $scope.selectedSlide.showShareFile = false;
        $scope.selectedSlide.showFileInfo = false;

        getRelatedFile(item);
    };

    $scope.showFileInfo = function(artifactId, isShowFileInfo) {
        if (isShowFileInfo === true) {
            $scope.selectedSlide.showFileInfo = false;
        } else {
            $scope.selectedSlide.showFileInfo = true;
        }

        $scope.selectedSlide.showComments = false;
        $scope.selectedSlide.showShareFile = false;
        $scope.selectedSlide.showRelatedFile = false;

        getFileInfo(artifactId);
    };

    // Add Tags
    // --------------------------------------
    $scope.addTags = function(file) {
        //var tagsClone = angular.copy(file.fileInfo.tags)
        //$scope.selectedFolderId = file.id;
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
                        t.TagName = obj.TagName;
                        t.TagId = obj.TagId ? obj.taTagId : null;
                        t.label = obj.label;
                        addedTags.push(t);
                    }
                });

                // Format for SharedRoles to update
                var roles = [];
                var groups = [];
                var users = [];
                if ($scope.artifact.SharedRoles.length) {
                    $scope.artifact.SharedRoles.forEach(function(obj, idx) {
                        if (obj) {
                            roles.push(obj.Id);
                        }
                    });
                }

                if ($scope.artifact.SharedGroups.length) {
                    $scope.artifact.SharedGroups.forEach(function(obj, idx) {
                        if (obj) {
                            groups.push(obj.Id);
                        }
                    });
                }

                if ($scope.artifact.SharedUsers.length) {
                    $scope.artifact.SharedUsers.forEach(function(obj, idx) {
                        if (obj) {
                            users.push(obj.Id);
                        }
                    });
                }

                var file = {
                    ArtifactTitle: $scope.artifact.ArtifactTitle,
                    Visibility: $scope.artifact.Visibility,
                    FileName: $scope.artifact.FileName,
                    FileSize: $scope.artifact.FileSize,
                    ContainerId: $scope.artifact.ContainerId,
                    SharedRoles: roles.length > 0 ? roles : null,
                    SharedUsers: users.length > 0 ? users : null,
                    SharedGroups: groups.length > 0 ? groups : null,
                    TagNames: tags.length > 0 ? tags : null
                };
                LibrariesService.updateArtifact($scope.artifact.ArtifactId, file).then(function(res) {
                    if (res.status === 200 || res.status === 204) {
                        $notify.add({
                            message: 'Update file successfully!',
                            type: 'success',
                            visible: true
                        });
                        $scope.artifact.TagNames = [];
                        $scope.artifact.TagNames = $scope.artifact.TagNames.concat(addedTags);

                    }
                });
            }
        });

        function findObjectByPropery(array, property, expect) {
            if (array) {
                for (var i = 0; i < array.length; i++) {
                    if (array[i][property] === expect) {
                        return i;
                    }
                }
            }
            return -1;
        }

    };

    // Share file modal
    // --------------------------------------
    $scope.shareFile = function(item) {
        var itemType = (item.ArtifactId) ? 'file' : 'folder';
        var itemId = (item.ArtifactId) ? item.ArtifactId : item.ContainerId;
        LibrariesService.getArtifactById(itemId).then(function(res) {
            $scope.artifactDetail = res.data ? res.data : [];

            var tags = [];
            if ($scope.artifactDetail.TagNames.length) {
                $scope.artifactDetail.TagNames.forEach(function(obj, idx) {
                    if (obj) {
                        tags.push(obj.TagName);
                    }
                });
            }

            $scope.modalData = {
                ArtifactTitle: $scope.artifactDetail.ArtifactTitle,
                FileName: $scope.artifactDetail.FileName,
                FileSize: $scope.artifactDetail.FileSize,
                Visibility: $scope.artifactDetail.Visibility,
                ContainerId: $scope.artifactDetail.ContainerId,
                TagNames: tags
            };

            $scope.sharedUnits = $scope.artifactDetail.SharedUsers.concat($scope.artifactDetail.SharedGroups).concat($scope.artifactDetail.SharedRoles);
            var modal = $modal.open({
                templateUrl: '/interface/views/libraries/partials/modal-sharefile.html',
                controller: SHRP.ctrl.ModalShareFileCTRL,
                scope: $scope,
                resolve: {
                    groups: function() {
                        return [];
                    },
                    selectedGroups: function() {
                        return $scope.sharedUnits;
                    },

                    modalData: function() {
                        return $scope.modalData;
                    },
                    itemId: function() {
                        return itemId;
                    },
                    itemType: function() {
                        return itemType;
                    }
                }
            });

        });
    };

    //#region delete artifact
    $scope.deleteFile = function(artifactId) {
        LibrariesService.deleteArtifact(artifactId).then(function(res) {
            if (!res.data.Errors) {
                //Notify successful
                var index = $scope.containers.indexOfArray('ArtifactId', artifactId);
                if (index > -1) {
                    $scope.containers.splice(index, 1);
                }

                $scope.cancel();
            }
        });
    };
    //#endregion

    // Slide view model
    // -------------------------------------------
    // This is a bit hacky until I find time to revise.
    if ($scope.items.length > 1) {
        // if there is more than 1 slide, then supply full slides
        $scope.slides = [
            { item: $scope.items[getPrev($scope.currentIndex)], pos: -1 },
            { item: $scope.items[$scope.currentIndex], pos: 0 },
            { item: $scope.items[getNext($scope.currentIndex)], pos: 1 }
        ];

    } else {
        // if its one slide, only provide one slide
        $scope.slides = [
            { item: $scope.items[$scope.currentIndex], pos: 0 }
        ];
        $scope.selectedSlide.indx = 0;
    }

    // Close and cancel buttons
    // -------------------------------------------
    $scope.ok = function() {
        $modalInstance.close();
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

    // Navigation
    // ----------------------------------------

    // Go to the previous slide
    $scope.prevSlide = function() {
        $scope.currentIndex = getPrev($scope.currentIndex);
        $scope.selectedSlide.offset--;

        $scope.selectedSlide.indx = $scope.selectedSlide.indx === 0 ? 2 : $scope.selectedSlide.indx - 1;

        updatePrevSlide();
    };

    // Go to the next slide
    $scope.nextSlide = function() {
        $scope.currentIndex = getNext($scope.currentIndex);
        $scope.selectedSlide.offset++;

        $scope.selectedSlide.indx = $scope.selectedSlide.indx === 2 ? 0 : $scope.selectedSlide.indx + 1;
        updateNextSlide();
    };

    // Update the contents of the previous slide
    function updatePrevSlide() {
        var cur = $scope.selectedSlide.indx,
            prev = cur === 0 ? 2 : cur - 1;

        getMultipleData($scope.items[$scope.currentIndex]);

        $scope.slides[prev] = {
            item: $scope.items[getPrev($scope.currentIndex)],
            pos: $scope.slides[cur].pos - 1
        };
        updateSlideLoaded();
    }

    // Update the contents of the next slide
    function updateNextSlide() {
        var cur = $scope.selectedSlide.indx,
            next = cur === 2 ? 0 : cur + 1;

        getMultipleData($scope.items[$scope.currentIndex]);

        $scope.slides[next] = {
            item: $scope.items[getNext($scope.currentIndex)],
            pos: $scope.slides[cur].pos + 1
        };

        updateSlideLoaded();
    }

    function updateSlideLoaded() {

        $scope.selectedSlide.loaded = false;

        $timeout(function() {
            $scope.selectedSlide.loaded = true;
        }, 650);

    }

    // Download file by artifactId
    // -----------------------------------
    $scope.downloadFile = function(item) {

        var downloadStatus = {
            Expired: -1,
            Downloading: 0,
            Finished: 1,
            Fail: 2
        };

        if (item.ArtifactId !== null && item.ArtifactId !== '') {
            // call api get download Url
            LibrariesService.getDownloadUrlFromCloud(item.ArtifactId).then(function(response) {
                var status = (response.status === 200) ? true : false;
                var downloadKey = response.data.Key;
                var url = response.data.Url;

                if (status) {
                    window.open(url, '_self', '');

                    // call api set download status
                    LibrariesService.setDownloadStatus(downloadKey, downloadStatus.Finished).then(function(res) {
                        var status = (res.status === 200) ? true : false;

                        if (status) {
                            console.log('set download status success');
                        } else {
                            console.log('set download status fail');
                        }
                    });
                } else {
                    // call api set download status
                    LibrariesService.setDownloadStatus(downloadKey, downloadStatus.Fail).then(function(res) {
                        var status = (res.status === 200) ? true : false;

                        if (status) {
                            console.log('set download status success');
                        } else {
                            console.log('set download status fail');
                        }
                    });
                }
            });
        } else {
            console.log('Not exist artifactId');
        }
    };

    // Destroy
    $scope.$on('$destroy', function() {
        $scope.slides = [];
    });


}];

// Lightbox gallery Controller
// ----------------------------------------

SHRP.ctrl.ModalLibraryLightboxCTRL = ['$scope', '$modalInstance', 'items', 'currentIndex', '$timeout',
    function($scope, $modalInstance, items, currentIndex, $timeout) {

        // helper functions

    // Figure out if next is next in line or loop to start
    function getNext(ind) {
        return (ind < $scope.items.length - 1) ? ++ind : 0;
    } 

    // Figure out if previous is prior in line or loop to end
    function getPrev(ind) {
        return (ind > 0) ? --ind : $scope.items.length - 1;
    }

        // General scope
        $scope.fullscreen = false;
        $scope.items = items;       // expose items to scope
        $scope.currentIndex = currentIndex;  // Which item is the visible one

    $scope.selectedSlide = {
        indx: 1,                // Which slide is visible
        loaded: true,           // bool to tell once the slider has finished animating in the slide
        offset: 0,              // progression of slides (can be negative or position depending on direction)
        showComments: true      // are comments for this slide visible?
    };


        // Slide view model
        // -------------------------------------------

    // This is a bit hacky until I find time to revise.
    if ($scope.items.length > 1) {
        // if there is more than 1 slide, then supply full slides
        $scope.slides = [
            { item: $scope.items[ getPrev($scope.currentIndex) ], pos: -1 },
            { item: $scope.items[ $scope.currentIndex ], pos: 0 },
            { item: $scope.items[ getNext($scope.currentIndex) ], pos: 1 }
        ];
    } else {
        // if its one slide, only provide one slide
        $scope.slides = [
            { item: $scope.items[ $scope.currentIndex ], pos: 0 }
        ];
        $scope.selectedSlide.indx = 0;
    }


        // Close and cancel buttons
        // -------------------------------------------

        $scope.ok = function() {
            $modalInstance.close();
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };


        // Navigation
        // ----------------------------------------

        // Go to the previous slide
        $scope.prevSlide = function() {
            $scope.currentIndex = getPrev($scope.currentIndex);
            $scope.selectedSlide.offset--;

            $scope.selectedSlide.indx = $scope.selectedSlide.indx === 0 ? 2 : $scope.selectedSlide.indx - 1;

            updatePrevSlide();
        };

        // Go to the next slide
        $scope.nextSlide = function() {
            $scope.currentIndex = getNext($scope.currentIndex);
            $scope.selectedSlide.offset++;

            $scope.selectedSlide.indx = $scope.selectedSlide.indx === 2 ? 0 : $scope.selectedSlide.indx + 1;

        updateNextSlide();
    };

        // Update the contents of the previous slide
        function updatePrevSlide() {
            var cur = $scope.selectedSlide.indx,
                prev = cur === 0 ? 2 : cur - 1;

        $scope.slides[prev] = {
            item: $scope.items[getPrev($scope.currentIndex)],
            pos: $scope.slides[cur].pos - 1
        };
        updateSlideLoaded();
    }

        // Update the contents of the next slide
        function updateNextSlide() {
            var cur = $scope.selectedSlide.indx,
                next = cur === 2 ? 0 : cur + 1;

        $scope.slides[next] = {
            item: $scope.items[getNext($scope.currentIndex)],
            pos: $scope.slides[cur].pos + 1
        };
        updateSlideLoaded();
    }

        function updateSlideLoaded() {

            $scope.selectedSlide.loaded = false;

            $timeout(function() {
                $scope.selectedSlide.loaded = true;
            }, 650);

        }

        // Destroy

        $scope.$on('$destroy', function() {
            $scope.slides = [];
        });

    }];