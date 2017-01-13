angular.module('ui.libraries')

/*
 * <pane-type-folder></pane-type-folder>
 *
 */

// Directive - Pane - Folder listing for Library
// ------------------------------------------------

.directive('paneTypeFolder', ['$timeout', 'PanesFactory', '$modal', 'LibrariesService',
    function($timeout, PanesFactory, $modal, LibrariesService) {
    
      return {
      restrict: 'E',
      replace: true,
      templateUrl: '/interface/views/libraries/partials/pane--folder.html',
      controller: function($scope, $element, $attrs) {

          $scope.pane.activeItemId = null;
          $scope.pane.loading = true;
          $scope.pane.sortOrder = '';
          $scope.pane.upload = [];

            
            // Get pane contents from service
            // ------------------------------------

          LibrariesService.getCollection(1, 20).then(function(res) {
                
                // REMOVE : Delayed to simulate latency
              $timeout(function() {
                  $scope.pane.Items = res.data.Items;
                  $scope.pane.Type = res.data.Type;

                  $scope.pane.loading = false;
                },1000);
                
            });


            // Change order of items
            // ------------------------------------

          $scope.sortOrder = function(val) {
              $scope.pane.sortOrder = val;
            };


            // Close this pane
            // ------------------------------------

          $scope.closePane = function(index) {
              PanesFactory.closePane(index);
            };


            // Create New folder
            // ------------------------------------

          $scope.createFolder = function() {
                
              var modal = $modal.open({
                  templateUrl: '/interface/views/libraries/partials/modal-createfolder.html',
                  controller: SHRP.ctrl.ModalCreateFolderCTRL
                });

                // On save, create folder and send to service
              modal.result.then(function(data) {

                  var folder = {
                      Type: 'Folder',
                      Name: data.name,
                      DateCreated: moment().utc().format(),
                      Children: 0,
                      Owner: {},
                      Privacy: false
                    };

                  $scope.pane.Items.push(folder);

                });

            };


            // Upload files Modal
            // ------------------------------------

          $scope.uploadFiles = function() {
                
              var d = {
                  folder: $scope.pane.Name
                };

              var modal = $modal.open({
                  templateUrl: '/interface/views/libraries/partials/modal-fileuploader.html',
                  controller: SHRP.ctrl.ModalLibraryUploadCTRL,
                  resolve: {
                      data: function() {
                          return d;
                        }
                    }
                });
            };


            // Draggable files
            // ------------------------------------

          $scope.dragControlListeners = {
              accept: function(sourceItemHandleScope, destSortableScope) {

                  var si = sourceItemHandleScope.itemScope.item,
                      di = destSortableScope.$parent.pane;

                    // Cant drag a folder inside itself
                  if (si.Id === di.Id) { return false; }
                    // Cant drag an active folder
                  if (si.Id === sourceItemHandleScope.sortableScope.$parent.pane.activeItemId) { return false; }

                  return true;
                },
              itemMoved: function(event) { },
              orderChanged: function(event) { }
            };

        }
    };

    }]);