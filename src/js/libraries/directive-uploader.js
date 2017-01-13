angular.module('ui.libraries')

/*
 * <lib-uploader></lib-uploader>
 *
 */

// Directive to the library uploader
// ------------------------------------------------

.directive('libUploader', ['$timeout', '$notify', 'UploadFactory', 'onResize',
    function($timeout, $notify, UploadFactory, onResize) {
    
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/interface/views/libraries/partials/uploader.html',
        scope: {
            maxsize: '=',
            maxfiles: '=',
            isUploading: '=?',
            startOpen: '=',
            paneData: '='
        },
        link: function(scope, element, attrs, ngModel) {

            // Setup
            // ------------------------------------------------

            // Starting options and file container
            var opts = {
                maxFiles: 20
            };

            var target = $('html');
            var tmt = -1;
            var fileInputEl = element.find('input[type=file]');

            if (scope.maxsize)     { opts.maxsize = scope.maxsize; }
            if (scope.maxfiles)     { opts.maxFiles = scope.maxfiles; }
            if (scope.startOpen)    { opts.showDropArea = true; }

            scope.uploadStarted = false;
            scope.showCollapse = false;

            // init uploader
            // ------------------------------------------------

            scope.uploader = UploadFactory.$init(opts);

            // add files object to scope
            scope.files = scope.uploader.files;

            //Get any files from ngModel, or start with an empty array
            scope.files.items = ngModel ?  ngModel.$modelValue || [] : [];


            // Success callback
            // on upload success we push the file to the library
            scope.files.successCallback = function(index) {
                // update status upload
                scope.uploader.updateStatusUpload(index, scope.statusUpload.Successed);
                var thisFile = scope.files.items[index];
                if (thisFile) {
                    // If the file does not already have a name, create a default
                    if (!thisFile.FinalName) {
                        thisFile.FinalName = thisFile.name;
                    }
                }
                var temp = {
                    ArtifactId: thisFile.artifactId,
                    Visibility: { val: 'h', title: 'Only Me' },
                    ListShare: [],
                    KeyWord: '',
                    FinalName: thisFile.FinalName,
                    ArtifactTitle: thisFile.name,
                    FileName: thisFile.name,
                    FileSize: thisFile.file.size,
                    ContainerId: thisFile.containerId,
                    SharedUsers: [],
                    SharedGroups: [],
                    SharedRoles: [],
                    TagNames: [],
                    ShowCollapse: false
                };


                scope.filesToSave.push(temp);

            };

            // trigger a resize event if the file items collection changes
            // this will make the modal reposition itself
            scope.$watchCollection('files.items', function(val) {
                onResize.triggerResize();
            });

            // UI Events
            // ------------------------------------------------

            // Upload all files regardless of status
            scope.uploadAll = function() {
                scope.$evalAsync(function() {
                    scope.uploadStarted = true;
                });

                angular.forEach(scope.files.items, function(file, key) {
                    scope.uploader.sendFile(key);
                });
            };

            // Upload single file
            scope.saveChanges = function(file, $index) {
                file.name = file.FinalName;
                // open next accordian
                scope.editFile( $index + 1 );
            };

            // Cancel single file chnages
            scope.cancelChanges = function($index) {
                var thisFile = scope.files.items[$index];
                // Editing = false, toggles the panel
                thisFile.editing = false;
            };

            // Remove single file uplaod
            scope.removeFile = function($index) {
                scope.uploader.removeFile($index);
            };

            // Open file editor - accorddian style
            scope.editFile = function($index) {

                angular.forEach(scope.files.items, function(file, key) {
                    scope.files.items[key].editing = false;
                });

                var thisFile = scope.files.items[$index];

                // If there is a next file, open it
                if (thisFile) {
                    // If the file does not already have a name, create a default
                    if (!thisFile.FinalName) {
                        thisFile.FinalName = thisFile.name;
                        thisFile.Folder = scope.paneData.folder;
                    }
                    // Editing = true, toggles the panel
                    thisFile.editing = true;
                }
            };

            // Browser event is triggerd
            scope.browse = function() {
                fileInputEl.trigger('click');
            };

            // Clear the file input value
            scope.clearInput = function() {
                fileInputEl.val('');
            };


            // Drag and Drop Events
            // ------------------------------------------------
            let showDrag;

            target.bind('dragenter', function(e) {
                showDrag = true;
                $timeout(function() {
                    scope.isDragging = true;
                });
                e.preventDefault();
            });

            target.bind('dragover', function(e) {
                showDrag = true;
                e.preventDefault();
            });

            target.bind('dragleave', function(e) {
                showDrag = false;
                clearTimeout( tmt );
                tmt = setTimeout( function() {
                    if( !showDrag ) {
                        $timeout(function() {
                            scope.isDragging = false;
                        });
                    }
                }, 200 );
                e.preventDefault();
            });

            target.bind('click.uploader', function(e) {
                scope.isDragging = false;
            });

            // drag drop
            element.on('drop', function(e) {
                scope.isDragging = false;
                scope.uploader.onDropEvent(e, true);
            });


            // Input trigger events
            // ------------------------------------------------

            fileInputEl.change(function() {
                scope.isDragging = false;
                scope.uploader.onInputEvent(fileInputEl[0], true);
                onResize.triggerResize();
            });

            scope.$on('$destroy', function() {

                target.off('drop click.uploader');
                element.off('dragenter dragover dragleave');
                $('body').find('.trigger--browse').off('click.uploader');
                fileInputEl.off('change');
            
            });

        }
    
    };

}]);