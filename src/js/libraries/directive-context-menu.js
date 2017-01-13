angular.module('ui.libraries')

.directive('contextMenu', ['$timeout', 'PanesFactory', 'LibrariesService', '$modal', function($timeout, PanesFactory, LibrariesService, $modal) {
    return {
        restrict: 'E',
        replace: 'element',
        templateUrl: '/interface/views/libraries/partials/context-menu.html',
        controller: function($scope, $element, $attrs) {

            $scope.fileInfo = {
                uploader: 'Jaquie Smith',
                fileSize: 569,
                fileName: 'Strawberry.png',
                views: 5,
                downloads: 5,
                lastUpdated: 'Nov 20, 2015',
                tags: ['Architecture', 'Food'],
                sharedWith: ['Emma Tellitthowits', 'Green Group', 'Micheal Jackson', 'Hanie Nguyen', 'Bruce Lee'],
                relatived: [{
                    uploader: 'Jaquie Smith',
                    fileSize: 569,
                    fileName: 'Strawberry.png',
                    views: 5,
                    downloads: 5,
                    lastUpdated: 'Nov 20, 2015',
                    tags: ['Architecture', 'Food']
                }, {
                    uploader: 'Jaquie Smith',
                    fileSize: 569,
                    fileName: 'Strawberry.png',
                    views: 5,
                    downloads: 5,
                    lastUpdated: 'Nov 20, 2015',
                    tags: ['Architecture', 'Food']
                }]
            };

            // Delete Artifact
            $scope.deleteArtifact = function(item) {
                LibrariesService.deleteArtifact(item.ArtifactId).then(function(res) {
                    if (!res.data.Errors) {
                        //Notify successful
                        var index = $scope.containers.indexOfArray('ArtifactId', item.ArtifactId);
                        if (index > -1) {
                            $scope.containers.splice(index, 1);
                        }
                    }
                });
            };
            // Delete container
            $scope.deleteUserContainer = function(item) {
                LibrariesService.deleteUserContainer(item.ContainerId).then(function(res) {
                    if (!res.data.Errors) {
                        //Notify successful
                        var index = $scope.containers.indexOfArray('ContainerId', item.ContainerId);
                        if (index > -1) {
                            $scope.containers.splice(index, 1);
                        }
                    }
                });
            };

            //#region Open modal share file
            // ------------------------------------
            $scope.shareFile = function(item) {
                var itemType = (item.ArtifactId) ? 'file' : 'folder';
                var itemId = (item.ArtifactId) ? item.ArtifactId : item.ContainerId;
                if (itemType === 'folder') {
                    LibrariesService.getContainerById(itemId).then(function(res) {
                        $scope.containerDetail = res.data ? res.data : [];
                        $scope.modalData = {
                            Name: $scope.containerDetail.detail.Name,
                            Visibility: $scope.containerDetail.detail.Visibility,
                            ParentContainerId: $scope.containerDetail.detail.ParentId ? $scope.containerDetail.detail.ParentId : null,
                            Description: $scope.containerDetail.detail.Description,
                        };

                        $scope.sharedUnits = $scope.containerDetail.detail.SharedUsers.concat($scope.containerDetail.detail.SharedGroups).concat($scope.containerDetail.detail.SharedRoles);
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
                } else {
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
                }
            };

            //#region Download file by artifactId
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
            //#endregion
        }
    };

}]);