
angular.module('ui.libraries')

/*
 * <panes></panes>
 *
 */

// Directive to handle panes
// ------------------------------------------------

.directive('mainFolder', ['$timeout', 'PanesFactory', '$modal',
    function($timeout, PanesFactory, $modal) {

        return {
            restrict: 'E',
            templateUrl: '/interface/views/libraries/partials/pane-main-folder.html',
            scope: {
                title: '@'
            },
            controller: function($scope, $element, $attrs) {
                
                // Change view mode either grid or list view
                $scope.changeViewMode = function(str) {
                    if (str === '') {
                        $scope.isListView = null;
                    } else {
                        $scope.isListView = 1;
                    }
                };

                $scope.folders = [
                    {
                        id: 1,
                        name: 'Stuff', type: 'folder',
                        tags: [],
                        owner: 'Me',
                        createdAt: 'Jan 8',
                        fileSize: 12,
                    },
                    {
                        id: 2,
                        name: 'Training.doc', type: 'doc',
                        tags: [{ id: 4, label: 'specification' }, { id: 5, label: 'IT' }],
                        owner: 'Julie Hunt',
                        createdAt: 'Dec 12',
                        fileSize: 2
                    },
                    {
                        id: 3,
                        name: 'Image', type: 'image',
                        tags: [{ id: 4, label: 'specification' }, { id: 5, label: 'IT' }],
                        owner: 'Jonh Hunt',
                        createdAt: 'Nov 12',
                        fileSize: 7
                    },
                    {
                        id: 4,
                        name: 'Recruitment.pdf', type: 'pdf',
                        tags: [{ id: 6, label: 'company' }, { id: 7, label: 'human resource' }],
                        owner: 'Watson Hunt',
                        createdAt: 'Oct 15',
                        fileSize: 1
                    },
                    {
                        id: 5,
                        name: 'Slide.ppt', type: 'ppt',
                        tags: [{ id: 6, label: 'company' }, { id: 7, label: 'human resource' }],
                        owner: 'Watson Hunt',
                        createdAt: 'Oct 15',
                        fileSize: 1
                    },
                    {
                        id: 6,
                        name: 'Memo.txt', type: 'txt',
                        tags: [{ id: 6, label: 'company' }, { id: 7, label: 'human resource' }],
                        owner: 'Watson Hunt',
                        createdAt: 'Oct 15',
                        fileSize: 1
                    },
                    {
                        id: 7,
                        name: 'Video', type: 'video',
                        tags: [{ id: 6, label: 'company' }, { id: 7, label: 'human resource' }],
                        owner: 'Watson Hunt',
                        createdAt: 'Oct 15',
                        fileSize: 1
                    },
                    {
                        id: 8,
                        name: 'Employees.xls', type: 'xls',
                        tags: [{ id: 6, label: 'company' }, { id: 7, label: 'human resource' }],
                        owner: 'Watson Hunt',
                        createdAt: 'Oct 15',
                        fileSize: 1
                    },
                    {
                        id: 9,
                        name: 'Document.zip', type: 'zip',
                        tags: [{ id: 6, label: 'company' }, { id: 7, label: 'human resource' }],
                        owner: 'Watson Hunt',
                        createdAt: 'Oct 15',
                        fileSize: 1
                    },
                    {
                        id: 10,
                        name: 'Document.zip', type: 'zip',
                        tags: [{ id: 6, label: 'company' }, { id: 7, label: 'human resource' }],
                        owner: 'Me',
                        createdAt: 'Oct 15',
                        fileSize: 10
                    }
                ];

                $scope.predicate = 'name';
                $scope.reverse = false;
                $scope.order = function(predicate) {
                    $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
                    $scope.predicate = predicate;
                };

                // Create New folder
                // ------------------------------------

                $scope.createFolder = function() {

                    var modal = $modal.open({
                        templateUrl: '/interface/views/libraries/partials/modal-createfolder.html',
                        controller: SHRP.ctrl.ModalCreateFolderCTRL
                    });
                    var dateNew = moment().utc().format('MMM DD');
                    // On save, create folder and send to service
                    modal.result.then(function(data) {
                        var tags = data.tags;
                        var folder = {
                            type: 'folder',
                            name: data.name,
                            createdAt: dateNew,
                            Children: 0,
                            owner: 'Me',
                            privacy: false,
                            fileSize: 5,
                            tags: tags,
                            description: data.description,
                            id: Math.random()
                        };

                        $scope.folders.push(folder);

                    });

                };

                $scope.selectedFolderId = null;
                // Add tag
                // ------------------------------------

                $scope.addTags = function(folder) {
                    var tagsClone = angular.copy(folder.tags);
                    $scope.selectedFolderId = folder.id;
                    var modal = $modal.open({
                        templateUrl: '/interface/views/libraries/partials/modal-addtag.html',
                        controller: SHRP.ctrl.ModalAddTagCTRL,
                        resolve: {
                            addedTags: function() {
                                return tagsClone;
                            }
                        }
                    });



                    // On save, create folder and send to service
                    modal.result.then(function(data) {
                        var index = findObjectByPropery($scope.folders, 'id', $scope.selectedFolderId);
                        if (index !== -1) {
                            var selectedFolder = $scope.folders[index];
                            if (selectedFolder.tags) {
                                selectedFolder.tags = [];
                                selectedFolder.tags = data;
                            }
                        }
                        //var tags = {                        
                        //    Name: data.name,
                        //    DateCreated: moment().utc().format(),
                        //    Children: 0,
                        //    Owner: {},
                        //    Privacy: false
                        //}

                        //$scope.pane.Items.push(folder);

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


                // Select item
                // ------------------------------------
                $scope.activeItem = function(index) {
                    var contextMenu = document.getElementById('context-menu-' + index);
                    contextMenu.style.zIndex = '0';
                    $scope.selecting = index;
                };

            }
        };

    }]);