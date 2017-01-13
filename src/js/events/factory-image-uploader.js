angular.module('ui.events')

// Event Create / Edit Factory
// ----------------------------------------

.factory('EventImageUploaderFactory', ['FileStorage', '$modal', '$timeout', function(FileStorage, $modal, $timeout) {
    
    function EventImageUploader(dataPromise) {
        
        var that = this;
        
        this.$imageUploaded = false;
        
        dataPromise().then(function(res) {            

            if (res && res.data.PhotoLrgId) {
                that.imageId = res.data.PhotoLrgId;
                that.$imageUploaded = true;
            }            
        });
    }
    
    EventImageUploader.prototype.addImage = function() {

        var that = this,
            files = [];

        var modal = $modal.open({
            templateUrl: '/interface/views/common/partials/modal-upload.html',
            size: 'sm',
            controller: SHRP.ctrl.ModalCTRL,
            resolve: {
                items: function() {
                    return files;
                },
                dataUpload: function() {
                    return {
                        containerId: 10,
                        moduleUpload: 'events'
                    };
                }
            }
        });
        
        modal.result.then(function(files) {

            that.$imageUploaded = true;
            that.imageId = files[0]; // Store the ID of the image so we can pass it to the server later and also display it on the page
            
            // This code is for cropping images when the API supports this.
            // Doesn't work very well yet, needs to be reviewed
            //
            // $('.events-form__image img').on('load', function(){
            // 
            //     var width = img[0].width;
            //     var height = img[0].height;
            //     var containerWidth = $('.events-form__image').width();
            //     var containerHeight = parseInt(containerWidth * 0.5625);
            //     var crop;                
            //     
            //     // If it's height is greater than it's container
            //     if (height > containerHeight) {
            //         crop = Math.abs((containerHeight - height) / 2);
            //     }
            // 
            //     if (crop) {
            //     
            //         that.cropData = {
            //             x: 0,
            //             y: crop,
            //             w: width,
            //             h: height - (crop * 2)
            //         }                            
            //     }
            // });
        });
    };
        
    EventImageUploader.prototype.removeImage = function() {
        
        $('.events-form__image img').remove();
        this.$imageUploaded = false;
        this.imageId = null;
    };
    
    return EventImageUploader;
    
}]);    
