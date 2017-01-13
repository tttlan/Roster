
// Uploader
// ------------------------------------------------

angular.module('ui.common')

// Uploader Directive
// ------------------------------------------------
// <uploader
//      maxsize="10 * 1000 * 1024" 
//      maxfiles="1"
//      ng-model="data.model"
//      start-open="boolean"
//      existing="[]"
//      is-uploading="func()"
//      cta="string"
//      only-images="boolean"
//      delayed-upload="boolean"
//      upload-csv="boolean"
//      is-modal-drawer="boolean"
//      attachment-list="[]"
//      module-upload="string"
//      container-id="integer"
//      old-uploader='boolean'
// ></uploader>

.directive('uploader', ['$timeout', '$window', '$notify', 'UploadFactory',
    function($timeout, $window, $notify, UploadFactory) {

    return {
        restrict: 'EA',
        replace: true,
        templateUrl: '/interface/views/common/partials/uploader.html',
        require: '?ngModel',
      scope: {
        action: '@',
        grid: '@',
        maxsize: '=?',
        maxfiles: '=?',
        existing: '=?',
        isUploading: '=?',
        cta: '@',
        startOpen: '=?',
        onlyImages: '=?',
        containerId: '=?',
        fileName: '=?',
        delayedUpload: '=?',
        uploadCsv: '=?',
        isModalDrawer: '=?',
        attachmentList: '=?',
        moduleUpload: '@?',
        fileTypes: '=?',
        large: '=?',
          required: '=?'
      },
      link: function(scope, element, attrs, ngModel) {

            // Setup
            // ------------------------------------------------
            scope.activeMember = false;
            // Starting options and file container
            var opts = {};
            var target = angular.element('html');
            var tmt = -1;
            var fileInputEl = element.find('input[type=file]');
            var showDrag;

            if (scope.maxsize) { opts.maxSize = scope.maxsize; }
            if (scope.maxfiles) { opts.maxFiles = scope.maxfiles; }
            if (scope.startOpen) { opts.showDropArea = true; }
            if (scope.onlyImages) { opts.onlyImages = true; }
            if (scope.cta) { opts.ctaMessage = scope.cta; }
            if (scope.containerId) { opts.containerId = scope.containerId; }
            if (scope.delayedUpload) { opts.delayedUpload = scope.delayedUpload;}
            if (scope.uploadCsv) { opts.uploadCsv = scope.uploadCsv;}
            if (scope.isModalDrawer) { opts.isModalDrawer = scope.isModalDrawer; }
            if (scope.attachmentList) { opts.attachmentList = scope.attachmentList; }
            if (scope.moduleUpload) { opts.moduleUpload = scope.moduleUpload; }
            if (scope.fileTypes) { opts.fileTypes = scope.fileTypes; }
            if (scope.oldUploader) { opts.oldUploader = scope.oldUploader; }
            
            // init uploader
            // ------------------------------------------------

            scope.uploader = UploadFactory.$init(opts);

            // add files object to scope
            scope.files = scope.uploader.files;

            // Watch for uploading change
            scope.$watch('uploader.files.isUploading', function(val) {
                scope.isUploading = val;
            });

            //Get any files from ngModel, or start with an empty array
            scope.files.items = ngModel ? ngModel.$modelValue || [] : [];

            // Model scope callback
            //if there is an NgModel, we update it with the new values.
            scope.files.modelCallback = function(ids, fileNames) {
                if (ngModel) {
		            ngModel.$isFile = true; // should also check this field in case create complie model
                    ngModel.$fileIds = ids;        // however, this will be not impact to formData
                    ngModel.$setViewValue(ids.length === 0 ? null : ids);
                }
                scope.fileName = fileNames || [];
            };

            // Success callback
            scope.files.successCallback = function(index) {
                console.log('upload success');

                var thisFile = scope.files.items[index];

                if (thisFile) {
                    // If the file does not already have a name, create a default
                    if (!thisFile.FinalName) {
                        thisFile.FinalName = thisFile.name;
                    }
                }

                if (scope.attachmentList !== undefined) {
                    scope.uploader.addAttachment(index);
                }
            };

            // Fail callback
            scope.files.failCallback = function(index) {
                console.log('Upload fail');
            };

            // UI Events
            // ------------------------------------------------

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
                clearTimeout(tmt);
                tmt = setTimeout(function() {
                    if (!showDrag) {
                        $timeout(function() {
                            scope.isDragging = false;
                        });
                    }
                }, 200);
                e.preventDefault();
            });

            target.bind('click.uploader', function() {
                $timeout(function() {
                    scope.isDragging = false;
                });
            });

            // drag drop
            element.on('drop', function(e) {
                scope.isDragging = false;
                scope.uploader.onDropEvent(e,scope.delayedUpload);
            });

            // Model Watch events
            // ------------------------------------------------

            //if we are clearing all model content, remove all files
            // This happens when we clear out the newsfeed post data and want to reset everything
            scope.$watch(function() {
                return ngModel.$modelValue;
            }, function(newVal, oldVal) {

                if (oldVal && !newVal) {
                    scope.uploader.resetFiles();
                    scope.clearInput();
                }

            });

            // Watch for preSelected files to be loaded in from the API

            var existingWatch = scope.$watch('existing', function(files) {
                if (files) {
                    scope.uploader.addExistingFiles(files);
                    // clear watch
                    existingWatch();
                }
            });

            // Input trigger events
            // ------------------------------------------------

            if (!!$window.mOxie) {

                //If Moxie is required, lets setup the faux element and the change event
                var moxieFile = new $window.mOxie.FileInput({
                    browse_button: element.find('.uploader__action')[0]
                });

                moxieFile.onchange = function(e) {
                    scope.uploader.onInputEvent(e.target,scope.delayedUpload);
                    scope.isDragging = false;
                };

                moxieFile.init();

            } else {

                // If Not Moxie, lets set up our change event
                fileInputEl.change(function() {
                    scope.uploader.onInputEvent(fileInputEl[0], scope.delayedUpload);
                    scope.isDragging = false;

                    // Now clear the input
                    // TODO test bug 5425 on IE9/10 once the uploader is working in IE* (it's broken at present).
                    fileInputEl.val(null);
                });

            }

            scope.$on('$destroy', function() {

                target.off('drop click.uploader');
                element.off('dragenter dragover dragleave');
                angular.element('body').find('.trigger--browse').off('click.uploader');
                fileInputEl.off('change');

            });

            scope.completeUpload = function() {
                scope.uploader.onCompleteUpload(scope.files,scope.activeMember);
                 };
        }
    };

}])

// Triggers file browse on click

.directive('triggerBrowse', ['$window', function($window) {

    return {
        restrict: 'A',
        link: function(scope, element) {
            if (!$window.mOxie) {
                element.on('click', function() {
                    // Click event to bind to input[file]
                    scope.browse();
                });
            }
        }
    };
}])

// thumbnail drawing directive

.directive('uploaderThumb', [function() {
    return {
        restrict: 'A',
        link: function(scope, element) {

            if (!scope.file.imagePreview) {
                element.remove();
                return;
            }

            var canvas = element[0],
                ctx = canvas.getContext('2d'),
                f = scope.file.file,
                img = new Image();

            img.onload = function() {

                // canvas size
                var cW = element.width(),
                    cH = element.height();

                // set canvas size
                canvas.width = cW;
                canvas.height = cH;

                // original image size
                var imgW = img.width,
                    imgH = img.height;

                // clipping coordinates
                var sourceX = 0,
                    sourceY = 0,
                    sourceWidth = 0,
                    sourceHeight = 0;

                if (imgW > imgH) {
                    sourceX = (imgW / 2) - (imgH / 2);
                    sourceWidth = sourceHeight = imgH;
                } else {
                    sourceY = (imgH / 2) - (imgW / 2);
                    sourceWidth = sourceHeight = imgW;
                }

                ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, cW, cH);
                //ctx.drawImage(img, 0, 0, 60, 60);
                URL.revokeObjectURL(img.src);
                img = null;

            };
            img.src = URL.createObjectURL(f);

        }
    };

}]);
