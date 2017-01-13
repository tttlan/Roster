angular.module('ui.events')

// Event Create / Edit Factory
// ----------------------------------------

.factory('DocumentUploaderFactory', ['FileStorage', '$modal', '$timeout', 'Profile', function(FileStorage, $modal, $timeout, Profile) {
    
    function documentUploader() {
        this.$documentUploaded = false;
    }

    documentUploader.prototype.addDocument = function() {

        //var pendingValues = {
        //    commencement: {
        //        label: 'Commencement date',
        //        current: data.CommencementDate,
        //        pending: data.OnboardingCommencementDate
        //    }
        //};
        //
        //var modal = $modal.open({
        //    templateUrl: '/interface/views/profile/partials/modal-pendingChanges.html',
        //    controller: SHRP.ctrl.ModalCTRL,
        //    title: 'Pending changes',
        //    animationType: 'flipVertical',
        //    resolve: {
        //        items: function() {
        //            return pendingValues;
        //        }
        //    }
        //});

        var that = this,
            fileUpload = {
                //TODO add URL and DATA
            };

        var modal = $modal.open({
            templateUrl: '/interface/views/profile/partials/modal-upload.html',
            size: 'sm',
            controller: SHRP.ctrl.ModalCTRL,
            resolve: {
                items: function() {
                    return fileUpload;
                },
                dataUpload: function() {
                    return {};
                }
            }
        });
        
        modal.result.then(function(files) {
            that.$documentUploaded = true;
            that.documentId = files[0]; // Store the ID of the image so we can pass it to the server later and also display it on the page
            var data = {
                'DocumentId': that.documentId,
                'Status': 0,
                'MemberId': 180665
            };
            Profile.createEmployeeDocuments(data).then(function(res) {
                console.log(res);
            });

        });
    };
    
    return documentUploader;
    
}]);    
