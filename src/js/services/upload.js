angular.module('ui.services')

.constant('UploadConstants', {
    containerIds: {
        memberProfile: 1,
        onboarding: 2,
        recruitment: 3,
        task: 4,
        training: 5,
        activity: 6,
        dashboard: 7,
        teamWall: 8,
        inbox: 9,
        event: 10,
        request: 11,
        roster: 12,
        communicationTemplate: 13
    }
})

// Upload Factory
// ----------------------------------------

.factory('UploadFactory', function($modal, FileStorage, $timeout, $notify, $filter, $window, onResize, UploadConstants) {

    var defaults = {
        fileTypes: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'pdf', 'txt', 'doc', 'ppt', 'docx', 'doc', 'pptx','csv', 'xlsx', 'xls', 'xml', 'zip'],
        imageTypes: ['jpg', 'jpeg', 'png', 'gif'],
        showDropArea: false,
        ctaMessage: 'Attach a file',
        maxSize: 10 * 1000 * 1024, // 10MB,
        maxFiles: 1,
        onlyImages: false,
        containerId: null,
        activeMember: false,
        uploadCsv: false,
        isModalDrawer: false,
        attachmentList: [],
        moduleUpload: null,
        delayedUpload: false,
        oldUploader: false
    };

    // Start upload Class
    // ------------------------------------------------

    function Upload(opts, files) {
        this.options = angular.extend({}, defaults, opts);
        this.setupObj(files);
    }

    Upload.prototype.setupObj = function() {

        this.files = {};

        // add required scope vars
        this.files.ctaMessage = this.options.ctaMessage;
        this.files.showDropArea = this.options.showDropArea;
        this.files.reachedLimit = false;
        this.files.isUploading = false;
        this.files.uploadedCount = 0;
        this.files.items = [];
        this.files.containerId = this.options.containerId;
        this.files.uploadCsv = this.options.uploadCsv;
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
        return str.replace(/[^a-z0-9\._-]/gi, '_').toLowerCase();
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
        if (!new RegExp('(' + this.options.fileTypes.join('|') + ')$').test(file.name.toLowerCase())) {

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
                name: _this.cleanFileName(file.name),
                size: $filter('toBytes')(file.size),
                ext: file.name.split('.').pop(),
                success: false,
                imagePreview: _this.isImage(file) ? false : true,
                isNew: true
            };

            $timeout(function() {
                _this.files.items.push(fileObj);
                _this.files.reachedLimit = _this.isOverLimit();

                if (_this.options.isModalDrawer === true) {
                    _this.updateHeaderModalUpload();
                }

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
        
        if(_this.options.moduleUpload === 'insert-image-from-text-angular') {
            _this.options.containerId = -1;
        }
        
        fileObj.transfer = FileStorage.generate({
            'FileName': fileObj.name,
            'FileSize': fileObj.file.size,
            'ContainerId': _this.options.containerId,
            'UploadCsv': _this.options.uploadCsv,
            'ActiveMember':_this.options.activeMember,
            'OldUploader': _this.options.oldUploader
        });

        // Promise return
        fileObj.transfer.then(function(res) {
            upload(res);
        }).catch(function() {
            _this.failed(fileObj);
        });
        
        function fileStoreId() {
            if(_this.options.oldUploader || (_this.options.moduleUpload === 'dashboard' && _this.options.containerId === UploadConstants.containerIds.dashboard)
                || (_this.options.moduleUpload === 'events' && _this.options.containerId === UploadConstants.containerIds.event)
                || (_this.options.moduleUpload === 'insert-image-from-text-angular' && _this.options.containerId === -1)) {
                    return true;
                }
            return false;   
        }
        // XHR upload function
        // sends physical file to storage location
        function upload(serverObj) {
            fileObj.action = 'PUT';

            if (_this.options.containerId) {
		if(fileStoreId()) {
			fileObj.id = serverObj.FileStoreId;
		}else{
			fileObj.id = serverObj.ArtifactId;
		}
            } else {
                fileObj.id = serverObj.FileStoreId;
            }

            if(_this.options.uploadCsv) {
                fileObj.id = null;
                fileObj.action = 'POST';
            }

            fileObj.started = true;

            fileObj.transfer = FileStorage.upload({
                action: fileObj.action,
                path: serverObj.UploadUrl,
                name: fileObj.name,
                file: fileObj.file,
                oldUploader: _this.options.oldUploader,
		uploadCSV: _this.options.uploadCsv,
                onProgress: function(e) {
                    var pc = parseInt((e.loaded / e.total * 100));
                    $timeout(function() {
                        _this.files.isUploading = true;
                        fileObj.progress = pc;
                    });
                }

            });

            // Promise return
            fileObj.transfer.promise.then(function(e) {
                // success can be either a 200 (POST) or a 201 (PUT) response
                fileObj.success = true;

                // on success, call the success callback
                _this.success(index, fileObj);

                // remove abort callback
                delete fileObj.transfer;

            }, function() {
                _this.failed(fileObj);
                // remove abort callback
                delete fileObj.transfer;
            });

        }

    };

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

        if (typeof this.files.failCallback === 'function') {
            this.files.failCallback(index);
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

        // remove file csv upload for create bulk onboarding
        if (this.options.containerId === UploadConstants.containerIds.onboarding && this.options.moduleUpload === 'create-bulk-onboard') {
            this.options.attachmentList.splice(index, 1);
        }
        
        // remove file csv upload for create bulk onboarding
        if (this.options.containerId === UploadConstants.containerIds.onboarding && this.options.moduleUpload === 'onboard-referencedocuments') {
            this.options.attachmentList.splice(index, 1);
        }

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
            var fileNames = [];

            this.files.items.forEach(function(file) {
                if (file.success) {
                    ids.push(file.id);
                    fileNames.push(file.name);
                }
            });

            // call exposed function
            if (this.files.modelCallback && typeof this.files.modelCallback === 'function') {
                this.files.modelCallback(ids, fileNames);
            }

            this.files.uploadedCount = ids.length;

            if (_this.options.isModalDrawer === true) {
                _this.updateHeaderModalUpload();
            }

            // check for limit
            this.files.reachedLimit = this.isOverLimit();

            $timeout(function() {
                _this.files.isUploading = false;
            });
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

    Upload.prototype.onCompleteUpload = function(files, activeMember) {
        var _this = this;
        this.options.activeMember = activeMember;
        for(var i= 0; i<files.items.length; i++) {
            _this.sendFile(i);
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

    // Add file upload success into current attachment list
    Upload.prototype.addAttachment = function(index) {
        var fileObj = this.files.items[index];
        var file = {};
        
        function FileType(ext) {
            switch (ext) {
                case 'jpg':
                case 'jpeg':
                case 'png':
                case 'gif':
                    return 'img';
                case 'pdf':
                    return 'pdf';
                case 'doc':
                case 'docx':
                    return 'doc';
                case 'xls':
                case 'xlsx':
                    return 'xls';
                default:
                    return 'txt';
            }
        } 
                    
        // Add file for candidate portal
        if (this.options.containerId === UploadConstants.containerIds.recruitment && this.options.moduleUpload === 'candidate-portal') {
            FileStorage.getCandidateFile(fileObj.id).then(function(data) {
                file = data.data;
            });
        }

        // Get artifact id for upload bulk onboarding
        if (this.options.containerId === UploadConstants.containerIds.onboarding && this.options.moduleUpload === 'create-bulk-onboard') {
            file = {
                ArtifactId: fileObj.id
            };
        }
        
        if (this.options.containerId === UploadConstants.containerIds.onboarding) {
            if(this.options.moduleUpload === 'onboard-referencedocuments') {
                var OnboardDocumentRecord = {
                        FileExt: FileType(fileObj.FileExt),
                        FileName: fileObj.FinalName,
                        LibraryDocumentId: fileObj.id
                };
                
                file = {
                    OnboardDocumentRecord
                };
                
                this.files.items = [];
            }
        }
        
         if (this.options.containerId === UploadConstants.containerIds.onboarding) {
            if(this.options.moduleUpload === 'onboard-extra-document') {
                file = {
                    LibraryDocumentId: fileObj.id
                };
                
                this.files.items = [];
            }
        }
        
        this.options.attachmentList.push(file);
    };
    
    Upload.prototype.$timeout = $timeout;
    Upload.prototype.$notify = $notify;

    return {
        $init: function(opts) {
            var item = new Upload(opts);
            return item;
        }
    };
    
});