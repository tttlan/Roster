angular.module('ui.libraries')

.factory('LibrariesUploadFactory', ['$modal', 'LibrariesService', '$timeout', '$notify', '$filter',
    function($modal, LibrariesService, $timeout, $notify, $filter) {

        var defaults = {
            fileTypes: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'pdf', 'txt', 'doc', 'ppt', 'docx', 'pptx', 'csv', 'xlsx', 'xls', 'xml', 'zip', 'mp3', 'wmv', 'avi'],
            imageTypes: ['jpg', 'jpeg', 'png', 'gif'],
            showDropArea: false,
            maxSize: 10 * 1000 * 1024, // 10MB,
            maxFiles: 1,
            onlyImages: false
        };

        var statusUpload = {
            New: 1,
            Processing: 2,
            Successed: 3,
            Failed: 4
        };

        var Units = {
            isSearchingListShare: true,
            groups: []
        };

        var updatingFileStatus = false;

        // Start upload Class
        // ------------------------------------------------

        function Upload(opts, files) {
            this.options = angular.extend({}, defaults, opts);
            this.statusUpload = angular.extend({}, statusUpload, opts);
            this.setupObj(files);
            this.Units = Units;
            this.updatingFileStatus = updatingFileStatus;
        }

        Upload.prototype.setupObj = function() {

            this.files = {};

            // add required scope vars
            this.files.showDropArea = this.options.showDropArea;
            this.files.reachedLimit = false;
            this.files.isUploading = false;
            this.files.uploadedCount = 0;
            this.files.items = [];
        };

        // Throw an error to user
        Upload.prototype.throwError = function(errorMsg) {
            // send to notification
            $notify.add({
                message: errorMsg.reason,
                type: 'error'
            });
        };

        // Is this an image?
        // returns 0 for true, 1 for false.
        // yeh I know, lol...
        Upload.prototype.isImage = function(file) {
            return new RegExp(this.options.imageTypes.join('|')).test(file.name.toLowerCase()) ? 0 : 1;
        };

        // If user if over the file upload limit
        Upload.prototype.isOverLimit = function() {
            if (this.files.items) {
                return this.files.items.length >= parseInt(this.options.maxFiles, 10);
            } else {
                return false;
            }
        };

        // clean out uploader
        Upload.prototype.resetFiles = function() {
            this.files.items = [];
            this.fireModelCallback();
        };

        // clean up file name
        Upload.prototype.cleanFileName = function(str) {
            return str.replace(/[^a-z0-9\._-]/gi, '_');
        };

        // Is a valid file
        //
        // Checks if user has reached upload limit
        // If it under the max allowable size
        // If it is a supported file type
        Upload.prototype.isValidFile = function(file) {

            var isValid = true;

            if (!file || !file.name) {

                this.throwError({
                    name: 'file name',
                    reason: 'Please upload a valid file'
                });

                isValid = false;
            }

            // check for max allowed files
            if (this.isOverLimit()) {

                this.throwError({
                    name: file.name,
                    reason: 'You have reached your upload limit'
                });

                isValid = false;
            }

            // check the file isnt too large
            if (file.size > this.options.maxSize) {

                this.throwError({
                    name: file.name,
                    reason: 'This file is too large. It must be smaller than ' + $filter('toBytes')(this.options.maxSize)
                });

                isValid = false;
            }

            // check if restricted to images
            if (this.options.onlyImages && !new RegExp(this.options.imageTypes.join('|')).test(file.name.toLowerCase())) {

                this.throwError({
                    name: file.name,
                    reason: 'This uploader only supports image embedding'
                });

                isValid = false;
            }

            // file type checks
            if (!new RegExp(this.options.fileTypes.join('|')).test(file.name.toLowerCase())) {

                this.throwError({
                    name: file.name,
                    reason: 'This file type (' + file.name.split('.').pop() + ') is not supported'
                });

                isValid = false;
            }

            return isValid;

        };

        // Add new file and process
        Upload.prototype.addFile = function(file, delayedUpload) {
            var _this = this;

            // If its a valid file
            if (this.isValidFile(file)) {

                var fileObj = {
                    file: file,
                    progress: 0,
                    name: file.name,
                    size: $filter('toBytes')(file.size),
                    ext: file.name.split('.').pop(),
                    success: false,
                    imagePreview: _this.isImage(file) ? false : true,
                    isNew: true,
                    containerId: this.files.getContainerId()
                };

                $timeout(function() {
                    _this.files.items.push(fileObj);
                    _this.files.reachedLimit = _this.isOverLimit();

                    _this.updateHeaderModalUpload();

                    if (!delayedUpload) {
                        // send the file immediately using the index
                        _this.sendFile(_this.files.items.length - 1);
                    }
                });

            }

        };

        // upload the file and respond with progress
        Upload.prototype.sendFile = function(index) {

            var _this = this,
                fileObj = this.files.items[index];

            // abort if already uploading
            if (fileObj.started || fileObj.success) {
                return;
            }

            $timeout(function() {
                _this.files.isUploading = true;
                fileObj.error = false;
                fileObj.editing = false;
            });

            // Generate Action and ID for File
            // This only sends the name and type to generate a storage key and location

            fileObj.transfer = LibrariesService.getUploadUrl({
                'FileName': fileObj.name,
                'FileSize': fileObj.file.size,
                'FileType': _this.isImage(fileObj.file),
                'ContainerId': fileObj.containerId
            });

            // Promise return
            fileObj.transfer.then(function(response) {
                upload(response.data);
            },
                function(response) {
                    _this.failed(fileObj);
                });

            // XHR upload function
            // sends physical file to storage location
            function upload(serverObj) {
                fileObj.id = serverObj.FileStoreId;
                fileObj.artifactId = serverObj.ArtifactId;
                fileObj.started = true;

                fileObj.transfer = LibrariesService.uploadFile({
                    action: 'PUT',
                    URL: serverObj.URL,
                    name: fileObj.name,
                    file: fileObj.file,
                    progress: function(e) {
                        var pc = parseInt((e.loaded / e.total * 100));
                        $timeout(function() {
                            _this.files.isUploading = true;
                            fileObj.progress = pc;
                        });
                    }
                });

                fileObj.transfer.promise.then(function(e) {
                    var status = fileObj.transfer.responseUpload();

                    // success can be either a 200 (POST) or a 201 (PUT) response
                    fileObj.success = (status === 200 || status === 201) ? true : false;

                    // on success, call the success callback
                    if (fileObj.success) {
                        _this.success(index, fileObj);

                    } else {
                        _this.failed(fileObj, index);
                    }

                    // remove abort callback
                    delete fileObj.transfer;

                }, function() {
                    _this.failed(fileObj);
                    // remove abort callback
                    delete fileObj.transfer;
                });

            }
        };

        // Update status for upload feature
        Upload.prototype.updateStatusUpload = function(index, status) {
            var _this = this;

            var fileObj = _this.files.items[index];

            fileObj.transfer = LibrariesService.setUploadStatus(fileObj.artifactId, status);

            fileObj.transfer.then(function(response) {
                var status = (response.data.Status === 0) ? true : false;

                if (status) {
                    console.log('set status success');
                    // Update title 
                    _this.updateTitleFile(index);

                    // Create artifact into view
                    _this.createArtifact(index);
                } else {
                    console.log('set status failed');
                }
            });
        };

        // Search Units to share
        Upload.prototype.searchUnit = function(searchUnitsQuery) {
            var results = LibrariesService.searchInfos(searchUnitsQuery);
            results.then(function(res) {
                Units.isSearchingListShare = false;
                Units.groups = res.data ? res.data : [];
            });
        };

        // Update title for file upload
        Upload.prototype.updateTitleFile = function(index) {
            var fileObj = this.files.items[index];

            var visibility = this.files.selectedVisibility;

            var containerId = fileObj.containerId;
            var artifactId = fileObj.artifactId;

            var obj = {
                ArtifactTitle: fileObj.name,
                FileName: fileObj.name,
                FileSize: fileObj.file.size,
                Visibility: visibility.val,
                ContainerId: containerId,
                IpRestrictions: null,
                TimeRestrictions: null,
                SharedUsers: null,
                SharedGroups: null,
                SharedRoles: null,
                TagNames: null
            };

            fileObj.transfer = LibrariesService.updateArtifact(artifactId, obj);

            fileObj.transfer.then(function(response) {
                var status = (response.status === 200) ? true : false;

                if (status) {
                    console.log('update success');
                } else {
                    console.log('update failed');
                }
            });
        };

        Upload.prototype.updateFile = function(file, index) {
            Upload.prototype.isLoading = true;
            var fileObj = file;
            var visibility = fileObj.Visibility.val;
            var containerId = fileObj.ContainerId;
            var artifactId = fileObj.ArtifactId;

            var fileIndex = -1;

            var collection = this.files.getCollection();
            //console.log(collection);
            for (var i = 0 ; i < collection.length ; i++) {
                if (parseInt(collection[i].ArtifactId) === artifactId) {
                    fileIndex = i;
                }
            }

            var obj = {
                ArtifactTitle: fileObj.FinalName,
                FileName: fileObj.FinalName,
                FileSize: fileObj.FileSize,
                Visibility: visibility,
                ContainerId: containerId,
                IpRestrictions: null,
                TimeRestrictions: null,
                SharedUsers: fileObj.SharedUsers.length > 0 ? fileObj.SharedUsers : null,
                SharedGroups: fileObj.SharedGroups.length > 0 ? fileObj.SharedGroups : null,
                SharedRoles: fileObj.SharedRoles.length > 0 ? fileObj.SharedRoles : null,
                TagNames: null
            };


            fileObj.transfer = LibrariesService.updateArtifact(artifactId, obj);

            fileObj.transfer.then(function(response) {
                var status = (!response.data.Errors) ? true : false;

                if (status) {
                    Upload.prototype.isLoading = false;
                    $notify.add({
                        message: 'Update file successfully!',
                        type: 'success',
                        visible: true
                    });

                    collection[fileIndex].Name = fileObj.FinalName;



                } else {
                    Upload.prototype.isLoading = false;
                    console.log('update failed');
                }
            });
        };

        Upload.prototype.isLoading = false;

        // On success
        Upload.prototype.success = function(index, fileObj) {
            // call success callback
            if (this.files.successCallback && typeof this.files.successCallback === 'function') {
                this.files.successCallback(index);
            }

            // updates the model
            this.fireModelCallback();

            // updates view
            $timeout(function() {
                fileObj.error = false;
                fileObj.success = true;
            });
        };

        // On failure
        Upload.prototype.failed = function(fileObj, index) {
            var _this = this;

            // Throws an error at the user
            _this.throwError({
                name: 'Connection Error',
                reason: 'Your file could not be uploaded. Please try again later.'
            });

            // Update status fail for upload file
            if (index) {
                // call fail callback
                if (this.files.failCallback && typeof this.files.failCallback === 'function') {
                    this.files.failCallback(index);
                }
            }

            // updates the model
            this.fireModelCallback();

            // updates view
            $timeout(function() {
                fileObj.error = true;
                fileObj.started = false;
            });
        };

        // cancel actual upload
        Upload.prototype.abortUpload = function(file) {
            // if transfer is an XHR request
            if (file && file.transfer && typeof file.transfer.abort === 'function') {
                file.transfer.abort();
            }

            // if transfer is a $http resolve
            /*if ( file.transfer && typeof file.transfer.resolve === 'function' ) {
                file.transfer.resolve();
            }*/
        };

        // Remove the file
        Upload.prototype.removeFile = function(index, file, completed) {

            if (!completed) {
                // cancel if still in progress
                this.abortUpload(file);
            }
            // remove from items array
            this.files.items.splice(index, 1);

            // updates the model
            this.fireModelCallback();

            // Update the upload limit
            this.files.reachedLimit = this.isOverLimit();
        };

        // Generates an array of IDs to apply to the ngModel
        Upload.prototype.fireModelCallback = function() {
            var _this = this;

            if (this.files.items) {

                var ids = [];

                this.files.items.forEach(function(file) {
                    if (file.success) {
                        ids.push(file.id);
                    }
                });

                // call exposed function
                if (this.files.modelCallback && typeof this.files.modelCallback === 'function') {
                    this.files.modelCallback(ids);
                }

                this.files.uploadedCount = ids.length;

                this.updateHeaderModalUpload();

                // check for limit
                this.files.reachedLimit = this.isOverLimit();

                $timeout(function() {
                    _this.files.isUploading = false;
                });
            }

        };

        // Update header of upload modal
        Upload.prototype.updateHeaderModalUpload = function() {
            var uploadCount = this.files.uploadedCount;
            var totalUpload = this.files.items.length;

            if (document.getElementById('drawer__title') !== null) {
                if (totalUpload > 0) {

                    document.getElementById('drawer__title').innerHTML = 'Uploading ' + uploadCount + '/' + totalUpload + ' file';
                } else {
                    document.getElementById('drawer__title').innerHTML = 'Upload';
                }
            }
        };

        // Limit files to max count
        Upload.prototype.fileLimit = function() {
            return parseInt(this.options.maxFiles, 10) - this.files.items.length;
        };

        // Add existing files
        Upload.prototype.addExistingFiles = function(files) {

            var _this = this;

            files.map(function(file) {

                // Mould data to expected data object    
                file.imagePreview = false;
                file.file = {
                    size: file.size
                };
                // set options
                file.size = $filter('toBytes')(file.size);
                file.started = true;
                file.progress = 100;
                file.success = true;

                $timeout(function() {
                    // on nex digest loop, push up file
                    _this.files.items.push(file);
                    // check that we aren't at the limit
                    _this.files.reachedLimit = _this.isOverLimit();
                    // manually update ngModel
                    _this.fireModelCallback();

                });

            });
        };

        // on input change event
        Upload.prototype.onInputEvent = function(el, delayedUpload) {

            var limit = this.fileLimit(),
                l = limit < el.files.length ? limit : el.files.length;

            if (!el.files) {
                return false;
            }

            if (!limit) {
                this.throwError({
                    name: 'file name',
                    reason: 'You have reached your upload limit'
                });
            }

            for (var i = 0; i < l; i++) {
                // Add the file
                this.addFile(el.files[i], delayedUpload);
            }
        };

        // On drop event
        Upload.prototype.onDropEvent = function(e, delayedUpload) {
            var _this = this;

            if (e.originalEvent.dataTransfer) {
                if (e.originalEvent.dataTransfer.files.length) {
                    e.preventDefault();
                    e.stopPropagation();
                    /* call render function */
                    var files = e.originalEvent.dataTransfer.files,
                        limit = _this.fileLimit(),
                        l = limit < files.length ? limit : files.length;

                    if (!limit) {
                        this.throwError({
                            name: 'file name',
                            reason: 'You have reached your upload limit'
                        });
                    }

                    for (var i = 0; i < l; i++) {

                        _this.addFile(files[i], delayedUpload);

                    }
                }
            }

        };

        // Add artifact file into current folder
        Upload.prototype.createArtifact = function(index) {
            var fileObj = this.files.items[index];

            var visibility = this.files.selectedVisibility;

            var containerId = fileObj.containerId;
            var artifactId = fileObj.artifactId;

            // Get current container detail
            var containerDetail = this.files.getCollection();

            // Get artifact type for file upload
            fileObj.transfer = LibrariesService.getArtifactById(artifactId);

            fileObj.transfer.then(function(response) {
                var status = (response.data.Status === 0) ? true : false;

                if (status) {
                    response.data.IsJustUploaded = true;
                    return containerDetail.push(response.data);
                } else {
                    console.log('Not create new file in UI');
                }
            });
        };

        Upload.prototype.$timeout = $timeout;
        Upload.prototype.$notify = $notify;

        return {
            $init: function(opts) {
                var item = new Upload(opts);
                return item;
            }
        };

    }]);