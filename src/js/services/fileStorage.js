angular.module('ui.services')

// File Storage factory
// ----------------------------------------

.factory('FileStorage', function($http, $q, $sce, $cookies, $server, API_BASE_URL, $notify) {

    // old api, is going to to be deprecated
    var FILESTORE_URL = API_BASE_URL + 'file-storage/';

    // newer api, all new features should use this
    var ARTIFACTS_URL = API_BASE_URL + 'artifacts/';
        var UPLOAD_CSV_CREATE_MEMBER_URL = API_BASE_URL +'members/filecsv?';

    var FileStorage = {

        // Get File ID to store
        generate: function(data) {
            if(data.UploadCsv === true) {
                var futureData = {};

                if(data.ActiveMember) {
                    futureData = {
                        UploadUrl: UPLOAD_CSV_CREATE_MEMBER_URL + 'a=true'
                    };
                }else{
                    futureData = {
                        UploadUrl: UPLOAD_CSV_CREATE_MEMBER_URL + 'a=false'
                    };
                }
                var d = $q.defer();

                d.resolve(futureData);
                return d.promise;
            }

            if (data.ContainerId && data.OldUploader === false) {
                return $server.create({
                    url: ARTIFACTS_URL + 'getUploadUrl',
                    data: data
                }).then(function(res) {
                    return res.data.Data;
                });
            } else {
                // if no container id is specified, it's an upload done using the old api
                return $server.create({
                    url: FILESTORE_URL,
                    data: data
                }).then(function(res) {
                    return res.data;
                });
            }

        },

        // Returns file object
        getById: function(id) {

            var url = FILESTORE_URL + id;

            return $server.get({
                url: url
            });

        },

        // Removes file from server ( not working )
        remove: function(id) {

            var url = FILESTORE_URL + id;

            return $server.remove({
                url: url
            });

        },

        // Returns the rackspace download url
        getUrl: function(id) {
            var url = FILESTORE_URL + id + '/download/url';

            return $server.get({
                url: url
            }).then(function(res) {
                return $sce.trustAsResourceUrl(res.data.replace(/"/g, ''));
            });

        },

        // Returns the rackspace download url
        getUnsafeUrl: function(id) {
            var url = FILESTORE_URL + id + '/download/url';

            return $server.get({
                url: url
            }).then(function(res) {
                return res.data.replace(/"/g, '');
            });

        },

        // Redirects to file to auto download
        getDownloadUrl: function(id) {
            return FILESTORE_URL + id + '/download';
        },

        // Uploads a file to the server
        // This uses a plain XHR request because we need to attach a handler to the 'progress'
        // XHR event. Angular's $http does not support this, though it is planned for Angular 1.6+
        upload: function(options) {

            var deferred = $q.defer();

            var xhr = new XMLHttpRequest();
            var data = new FormData();

            if (xhr.upload) {
                xhr.upload.addEventListener('progress', options.onProgress, false);

                xhr.onreadystatechange = function(e) {
                    // put: 201 and post: 200
                    if (xhr.readyState === 4 && (xhr.status === 200 || xhr.status === 201)) {
                        // normally if we were making ajax requests via $server, these error
                        // conditions would already be handled for us. But since we have to use
                        // the XHR object directly here, we have to check for error conditions
                        // manually
                        
                        var response = xhr.response ? JSON.parse(xhr.response) : null;
                        
                        if(angular.isObject(response) && response !== null) {
                            if (response.Status && response.Status === 1) {
                                // notification for upload csv only
                                if (options.uploadCSV === true) {
                                    if(response && response.Errors && response.Errors.length >0) {
                                        var error ='';
                                        var properties ='';
                                        var detail= '';
                                        var detailProperties ='';
                                        if (response.Errors[0].ExtraInfos[0].Message) error = response.Errors[0].ExtraInfos[0].Message;
                                        if(response.Errors[0].ExtraInfos[0].Property) properties = response.Errors[0].ExtraInfos[0].Property;
                                        if(response.Errors[0].ExtraInfos.length >=2) {
                                            if(response.Errors[0].ExtraInfos[1].Message) detail = response.Errors[0].ExtraInfos[1].Message;
                                            if(response.Errors[0].ExtraInfos[1].Property) detailProperties = response.Errors[0].ExtraInfos[1].Property;
                                        }
                                        $notify.add({
                                            message: error + ': ' + properties + '. ' + detail + ': ' + detailProperties,
                                            type: 'error'
                                        });
                                    }
                                }

                                deferred.reject(e);
                            } else {
                                // notification for upload csv only
                                if (options.uploadCSV === true) {
                                    $notify.add({
                                        message: 'Upload CSV to create member success.',
                                        type: 'success'
                                    });
                                }

                                deferred.resolve(e);
                            }
                        }
                        else{
                            deferred.resolve(e);
                        }
                    }
                };

                var authToken = 'Sherpa.aspxauth=' + $cookies.get('Sherpa.aspxauth');

                xhr.open(options.action, options.path, true);
                xhr.setRequestHeader('X_FILENAME', options.name);
                
                if(options.oldUploader === false) {
                    xhr.setRequestHeader('Authorization', authToken);
                    data.append('data', options.file, options.name);
                    xhr.send(data);
                }
                else{ //send file without Authorization
                    xhr.send(options.file);
                }
            } else {
                deferred.reject();
            }

            return {
                abort: function() {
                    return xhr.abort();
                },
                promise: deferred.promise
            };

        },

        convertHtmlToPdf: function(html, fileName) {
            var url = FILESTORE_URL + 'parsehtml';
            return $server.create({
                url: url,
                data: { content: html, FileName: fileName }
            });
        },

        downloadPdf: function(url) {
            if (url) {
                url = url.replace('/api/', '');
            }

            var absoluteUrl = API_BASE_URL + url;
            return $server.get({ url: absoluteUrl });
        }
    };

    return FileStorage;

});
