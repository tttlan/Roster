// File Viewer
// ----------------------------------------


angular.module('ui.common.directives')

.directive('fileViewer', ['FileStorage', 'Paths', '$modal', '$sce', '$HTTPCache', '$compile', '$timeout', '$window',
    function(FileStorage, Paths, $modal, $sce, $HTTPCache, $compile, $timeout, $window) {
    return {
        restrict: 'EA',
        replace:true,
        scope: {
            file: '=',
            inlineImages: '@',
            block: '@'
        },
      link: function($scope, $element, $attrs) {

            // This whole fileview thing has become a mess.
            // Lets clean it up when we get new Libraries
            
            var fileStoreId = $scope.file.FileStoreId || $scope.file;
            var IMAGE_TYPES = ['jpg','jpeg','png','gif'];
            $scope.isImage = IMAGE_TYPES.indexOf( $scope.file.FileExtension ) !== -1;

            $scope.downloadFile = function($event) {
                var downloadStatus = {
                    Expired: -1,
                    Downloading: 0,
                    Finished: 1,
                    Fail: 2
                };

                var element = angular.element($event.target);
                if($scope.file.DocumentGetUrl) {
                    FileStorage.getDownloadUrlFromLink($scope.file.DocumentGetUrl).then(function(res) {

                        var downloadKey = res.data.Key;
                        var url = res.data.Url;

                        $event.preventDefault();
                        window.open(url, '_self', '', true);
                    });
                }
            };

            if(!$scope.file.DocumentGetUrl) {
                $scope.url =  $scope.file.DocumentUrl || FileStorage.getDownloadUrl(fileStoreId);
            }

            $scope.isDownloadable = true;
            //if($scope.file.Visibility === 'h') {
            //    $scope.isDownloadable = false;
            //}

            // determine if file is previewable
            // if its an image or PDF
            $scope.isPreviewable = $scope.isImage || $scope.file.ContentType === 'Image' || $scope.file.FileExtension === 'pdf';
            // if its an old library PDF, its not previewable.
            $scope.isPreviewable = $scope.file.DocumentUrl && $scope.file.FileExtension === 'pdf' ? false : $scope.isPreviewable;

            // Preview file in Modal if applicable
            // ---------------------------------

            $scope.previewFile = function() {

                var file = $scope.file;

                $scope.loading = true;

                // Handle Library Documents
                if (file.DocumentUrl) {
                    showPreviewModal({
                        type: file.FileExtension === 'pdf' ? 'pdf' : 'img',
                        url: file.DocumentUrl,
                        filename: file.FileName
                    });
                    // else get normal filestores
                } else if ($scope.file.DocumentGetUrl) {
                    FileStorage.getDownloadUrlFromLink($scope.file.DocumentGetUrl + "?inline=true").then(function(res) {
                        if (res.data.Url) {
                            showPreviewModal({
                                type: file.FileExtension === 'pdf' ? 'pdf' : 'img',
                                url: res.data.Url,
                                filename: file.FileName
                            });
                        }
                    });
                    // else get normal filestores
                } else {
                    // get storage url
                    FileStorage.getUnsafeUrl(fileStoreId,true).then(function(resUrl) {
                        if (resUrl) {
                            showPreviewModal({
                                type: file.FileExtension === 'pdf' ? 'pdf' : 'img',
                                url: resUrl,
                                filename: file.FileName
                            });
                        }
                    });
                }
            };

            if ($attrs.fileViewer === undefined) { // Only load in the template if the directive is loaded with an element rather than an attribute

                $HTTPCache.getTemplate('/interface/views/common/partials/fileViewer.html').then(function(data) {
                    // http://stackoverflow.com/questions/19882506/form-validation-and-fields-added-with-compile
                    $element.empty();
                    var result = angular.element(data).appendTo($element);
                    result = angular.element(result).unwrap();
                    $compile(result)($scope);
                });

            } else {

                $element.on('click', $scope.previewFile);
            }

            // Open the lightbox
          function showPreviewModal(itemsObj) {
              $scope.loading = false;

                var modal = $modal.open({
                    templateType: 'lightbox',
                    templateUrl: '/interface/views/common/partials/lightbox-common.html',
                    controller: SHRP.ctrl.ModalLibraryLightboxCommonCTRL,
                    resolve: {
                        items: function() {
                            return [itemsObj];
                        },
                      currentIndex: function() {
                          return 0;
                        }
                    }
                });
            }

        },
      templateUrl: '/interface/views/common/partials/fileViewer.html'
    };
    }]);