angular.module('ui.libraries')

/*
 * <pane></pane>
 *
 */

// Directive 
// ------------------------------------------------

.directive('paneTypeFile', ['$timeout', 'PanesFactory', 'LibrariesService', '$modal',
    function($timeout, PanesFactory, LibrariesService, $modal) {
    
      return {
      restrict: 'E',
      replace: true,
      templateUrl: '/interface/views/libraries/partials/pane--file.html',
      controller: function($scope, $element, $attrs) {

            $scope.file = {};
            $scope.pane.loading = true;

            // Get file details from service
            // ------------------------------------

          LibrariesService.getFile(123).then(function(res) {
                
                // TO REMOVE : Delayed to simulate latency
              $timeout(function() {
                  $scope.file = res.data;

                    $scope.pane.loading = false;
                },1000);

            });


            // Edit a files
            // ------------------------------------

          $scope.editFile = function(obj) {
                
                var modal = $modal.open({
                    templateUrl: '/interface/views/libraries/partials/modal-editfile.html',
                    controller: SHRP.ctrl.ModalEditFileCTRL
                });

                // On close save changes to service
              modal.result.then(function(data) {
                  console.log('close: edit file');
                  console.log(data);
                });

            };


            // Delete the file
            // ------------------------------------

          $scope.deleteFile = function() {
              console.log('delete');
            };

            // Close this pane
            // ------------------------------------

          $scope.closePane = function(index) {
              PanesFactory.closePane(index);
            };


            // Open preview lightbox
            // ------------------------------------

          $scope.openLightbox = function(file) {

                //var files = [];
                //files.push(file);

                var files = [
                    {
                        type: 'image',
                        url: 'http://placehold.it/1024x768'
                    },
                    {
                        type: 'image',
                        url: 'http://placehold.it/1300x800'
                    },
                    {
                        type: 'image',
                        filename: 'Food 3',
                        upload: 'Shikamaru',
                        url: '/interfaceTemplates/mock-data/media/food3.jpg'
                    },
                    {
                        type: 'image',
                        filename: 'Food 4',
                        upload: 'Sai',
                        url: '/interfaceTemplates/mock-data/media/food4.jpg'
                    },
                    {
                        type: 'image',
                        filename: 'Food 5',
                        upload: 'Sakura',
                        url: '/interfaceTemplates/mock-data/media/food5.jpg'
                    },
                    //{
                    //    type: 'pdf',
                    //    filename: 'file pdf',
                    //    url: '/interfaceTemplates/mock-data/media/abc.pdf'
                    //},
                    //{
                    //    type: 'audio',
                    //    filename: 'file mp3',
                    //    url: '/interfaceTemplates/mock-data/media/audio.mp3'
                    //},
                    //{
                    //    type: 'video',
                    //    filename: 'file video',
                    //    url: '/interfaceTemplates/mock-data/media/abc.pdf'
                    //}
                ];

                var modal = $modal.open({
                    templateType: 'lightbox',
                    templateUrl: '/interface/views/common/partials/lightbox-gallery.html',
                    controller: SHRP.ctrl.ModalLibraryLightboxCTRL,
                    resolve: {
                        items: function() {
                            return files;
                        },
                        currentIndex: function() {
                            return 0;
                        }
                    }
                });

            };

        }
    };

}]);