angular.module('ui.profile')

.directive('tableFormEdit', ['$compile', function($compile) {
    return {
        restrict: 'E',
        replace: true,
        scope: false,
        link: function(scope, element, attrs) {
                    
            element.parent().addClass('table-form__edit-parent');
            
            var editString = (attrs.editName === 'all') ? 'Edit All' : 'Edit';
            var parentObj = attrs.parentData ? attrs.parentData : 'parentData';
            
            element.html($compile('<a href=""' +
                    'class="table-form__edit"' +
                    'title="Edit ' + attrs.editName + '"' +
                    'ng-click="' + parentObj + '.$edit(\'' + attrs.editName + '\'); ' + // Trigger the edit fn
                                (attrs.cancelEdit ? attrs.cancelEdit + '.$editing = false;' : '') + '"' + // If we want to cancel another editing property when triggering a new one
                    'ng-hide="' + parentObj + '.$editing === \'' + attrs.editName + '\' || ' + parentObj + '.$editing === \'all\'"' +
                '><span>' + editString + '</span></a>')(scope));
        }
    };
}])

.directive('tableFormButtons', function() {
    return {
        restrict: 'E',
        template: function(tElement, tAttrs) {
            return '<div class="button-group" ng-show="parentData.$editing === \'' + tAttrs.editName + '\'">' +
                '<a class="button button--small" href="" ng-click="parentData.$cancelEdit(); resetLookup ? resetLookup() : null; resetForm();">Cancel</a>' +
                '<button type="submit" class="button button--positive button--small" disable-toggle="' + tAttrs.loading + '" ng-click="' + tAttrs.saveAction + '">Save</button>' +
                '<error ng-show="parentData.$serverError">{{ parentData.$serverError }}</error>' +
            '</div>';
        },
        scope: false,
        replace: true
    };
})
.directive('buttonLoading', function() {
    return {
        restrict: 'E',
        template: function(tElement, tAttrs) {
            return '<button class="button {{btnClass}} loading-spinner__container--inline" >' +
                '<span class="loading-spinner"><span class="loading-spinner__icon" /></span>' +
                '<span ng-transclude />' +
            '</button>';
        },
        scope: {
            btnClass: '@?',
            disabled: '=?',
            loading: '=?'
        },
        replace: true,
        transclude: true,
        link: function(scope) {
        }
    };
})
.directive('noteItem', ['$timeout', function($timeout) {
    return {
        scope: {
            ngModel: '=',
            deleteFn: '&',
            updateFn: '&'
        },
        restrict: 'EA',
        templateUrl: '/interface/views/profile/partials/note-item.html',
        replace: true,
        link: function(scope, element, attrs) {
            scope.isShowOptions = function() {
                return scope.ngModel.userCan.candelete || scope.ngModel.userCan.canedit || scope.ngModel.userCan.canupdatefeedback;
            };
            scope.turnOffNewUpdated = function() {
                scope.ngModel.isNew = false;
                scope.ngModel.isUpdated = false;
            };
            scope.$watch(function() {
                return scope.ngModel.isNew || scope.ngModel.isUpdated;
            }, function(val) {
                if (val) {
                    $timeout(function() {
                        scope.turnOffNewUpdated();
                    }, 5000);
                }
            });
        }
    };
}])
.directive('autoHide', ['$timeout', function($timeout) {
    return {
        scope: {
            displayTime: '='
        },
        restrict: 'A',
        link: function(scope, element, attrs) {
            $timeout(function() {
                element.addClass('auto-hide');
            }, scope.displayTime || 10000 );
        }
    };
}]);
/*
 * Usage
 * 
 * <profile-photo-canvas photoUrl="the of the photo to place on the canvas"></profile-photo-canvas>
 *
 */

// Commented out until utilised.

/*
.directive('profilePhotoCanvas', ['$timeout', 'onResize', function ($timeout, onResize) {
    return {
        restrict: 'E',
        template:   '<div class="profile-photo-upload__wrapper">' + 
                        '<loader align="center" size="large"></loader>' +
                        '<canvas class="profile-photo-upload__canvas" width="{{canvasWidth}}" height="{{canvasHeight}}"></canvas>' + 
                    '</div>',
        replace: true,
        scope: false,
        link: function (scope, element, attrs) {
            
            //var photoUrl = scope.items.url,
            var photoUrl = '/interface/images/avatar4.jpg',
                theSelection,
                ctx,
                image,
                imageProperties = {};

            var that = this;

            var $canvas = element.find('canvas');
            
            // Timeout introduced to allow time for the element to render and have a width and height
            $timeout(function(){
                        
                // Set width and height attributes of canvas element, this is necessary for canvas to work properly
                scope.canvasWidth = $canvas.width();
                scope.canvasHeight = scope.canvasWidth * 0.75; // Set the canvas dimensions to a 3:4 ratio

                ctx = $canvas[0].getContext('2d');
                image = new Image();
                
                // Populate the image src and then wait for it to load
                image.src = photoUrl;

                image.onload = function(){

                    // Image has loaded, remove the loading spinner
                    element.find('.loading-spinner__container').remove();
                    
                    // Create a selection object
                    createSelection();

                    // Render the image and selection object onto the canvas
                    drawCanvas(); 
                }                
            });

            function updateForMobile(dimensions){
                
                scope.isMobile = dimensions.width <= 1024 && Modernizr.touch;
                
                // Update the size of the canvas
                scope.canvasWidth = $canvas.width();
                scope.canvasHeight = scope.canvasWidth * 0.75; // Set the canvas dimensions to a 3:4 
                
                if (ctx !== undefined) { // This can be undefined if the image hasn't loaded yet
                    createSelection();
                    drawCanvas();   
                }
            }

            onResize.register(updateForMobile);

            scope.$on('$destory', function(){
                onResize.deregister(updateIsMobileProfile);
            });

            function createSelection() {
                
                // create a selection object and place it in the middle of the canvas 
                var selectionSize = (scope.canvasHeight / 2.5);  // Make the selection object 2.5 times smaller than the height of the canvas

                theSelection = new Selection((scope.canvasWidth / 2) - (selectionSize / 2), (scope.canvasHeight / 2) - (selectionSize / 2), selectionSize, selectionSize);
            }

            // Generate an object with the current offsets and widths of the crop
            function generateCropData() {
                return {
                    offsetLeft: theSelection.x - imageProperties.targetLeft,
                    offsetTop: theSelection.y - imageProperties.targetTop,
                    width: theSelection.w,
                    height: theSelection.h
                }
            }

            // When we click the save changes button figure out what to send back to the server
            scope.saveSelection = function() {            
                
                var cropData = generateCropData();

                console.log('Call the API, save some data!');
                console.log('the id of the photo:', scope.items.id); 
                console.log('the position of the crop', cropData);    
                    
                // Send off the data in the cropData object

                // This function closes the lightbox and passes back scope.items to the parent.
                // Alternatively we could send the data back to the server here.
                //scope.ok();           
            }
                        
            function validateSelection() {

                var cropData = generateCropData();
                                
                // If there is no selection, validate as true
                if (isNaN(cropData.offsetLeft) && isNaN(cropData.offsetTop)) {
                    return true;
                }

                // If resizing was performed on the image, adjust the values by our resize ratio
                if (imageProperties.resized && imageProperties.resized === true) {

                    cropData.offsetLeft = cropData.offsetLeft / imageProperties.resizeRatio;
                    cropData.offsetTop = cropData.offsetTop / imageProperties.resizeRatio;
                    cropData.width = cropData.width / imageProperties.resizeRatio;
                    cropData.height = cropData.height / imageProperties.resizeRatio;
                }

                if (((cropData.offsetTop + cropData.height) <= image.height) && // The selection isn't too far down
                    ((cropData.offsetLeft + cropData.width) <= image.width) && // The selection isn't too far right
                    (cropData.offsetLeft >= 0) && // The selection isn't too far left
                    (cropData.offsetTop >= 0)) { // The selection isn't too far up
                    
                    return true;
                    
                } else { 
                    
                    return false;
                }
            }


            // Code here is based on this tutorial:  http://www.script-tutorials.com/html5-image-crop-tool/
            //  scaleImage function based on this: http://stackoverflow.com/questions/14087483/how-to-proportionally-resize-an-image-in-canvas

            // define Selection constructor
            function Selection(x, y, w, h){
                this.x = x; // initial positions
                this.y = y;
                this.w = w; // and size
                this.h = h;

                this.px = x; // extra variables to dragging calculations
                this.py = y;

                if (scope.isMobile) { // Increase the resize cubes size on mobile
                    this.csize = 12; // resize cubes size
                    this.csizeh = 16;
                } else {
                    this.csize = 4; // resize cubes size
                    this.csizeh = 6; // resize cubes size (on hover)
                }

                this.bHow = [false, false, false, false]; // hover statuses
                this.iCSize = [this.csize, this.csize, this.csize, this.csize]; // resize cubes sizes
                this.bDrag = [false, false, false, false]; // drag statuses
                this.bDragAll = false; // drag whole selection
            }
            
            function drawCanvas() {

                // Before we draw, validate and see if the selection area is still in a valid position.  If not, do nothing.
                if (validateSelection() === false) {
                    return false;
                }

                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // clear canvas

                 // If height and width are less than the canvas dimensions, center the image in the canvas, no need to resize
                if ((image.width < scope.canvasWidth) && (image.height < scope.canvasHeight)) {

                    imageProperties.resized = false;
                    imageProperties.targetLeft = (scope.canvasWidth - image.width) / 2;
                    imageProperties.targetTop = (scope.canvasHeight - image.height) / 2;
                    ctx.drawImage(image, imageProperties.targetLeft, imageProperties.targetTop);

                } else {
                    // Else we need need to resize the image to fix in the canvas
                    scaleImage(image.width, image.height, scope.canvasWidth, scope.canvasHeight);
                    ctx.drawImage(image, imageProperties.targetLeft, imageProperties.targetTop, imageProperties.width, imageProperties.height); 
                }    

                // make the main image darker and the selection fully transparent
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(0, 0, scope.canvasWidth, scope.canvasHeight);

                // draw selection
                theSelection.draw();
            }

            Selection.prototype.draw = function(){
                
                var red = '#e25856';

                ctx.strokeStyle = red;
                ctx.lineWidth = 2;
                ctx.setLineDash([6]);
                ctx.strokeRect(this.x - 1, this.y - 1, this.w + 2, this.h + 2); // Offset by a few pixels to allow for the line width

                // Draw a portion of the original image that isn't faded out, this is the box you adjust to select resize dimensions
                if (this.w > 0 && this.h > 0) {
                    
                    if (imageProperties.resized === true && imageProperties.landscape === true) { // If the image is wider than it is tall

                        // Magical!  This is really complicated stuff, suggest you read up on the drawImage method.  We are drawing the image twice here
                        ctx.drawImage(image, (this.x / imageProperties.resizeRatio), (this.y / imageProperties.resizeRatio) - (imageProperties.targetTop / imageProperties.resizeRatio), (this.w / imageProperties.resizeRatio), (this.h / imageProperties.resizeRatio), this.x, this.y, this.w, this.h);

                    } else if (imageProperties.resized === true && imageProperties.landscape === false) { // else the image is taller than it is wide

                        ctx.drawImage(image, (this.x / imageProperties.resizeRatio) - (imageProperties.targetLeft / imageProperties.resizeRatio), (this.y / imageProperties.resizeRatio), (this.w / imageProperties.resizeRatio), (this.h / imageProperties.resizeRatio), this.x, this.y, this.w, this.h);    
                    
                    } else if (imageProperties.resized === false) { // Else we didn't resize the image at all

                        ctx.drawImage(image, this.x - imageProperties.targetLeft, this.y - imageProperties.targetTop, this.w, this.h, this.x, this.y, this.w, this.h);  
                    }
                }

                // draw resize cubes.  The plus and minus one amounts are to allow some offset for the the 2px wide line
                ctx.fillStyle = red;
                ctx.fillRect(this.x - this.iCSize[0] - 1, this.y - this.iCSize[0] - 1, this.iCSize[0] * 2, this.iCSize[0] * 2);
                ctx.fillRect(this.x + this.w - this.iCSize[1] + 1, this.y - this.iCSize[1] - 1, this.iCSize[1] * 2, this.iCSize[1] * 2);
                ctx.fillRect(this.x + this.w - this.iCSize[2] + 1, this.y + this.h - this.iCSize[2] + 1, this.iCSize[2] * 2, this.iCSize[2] * 2);
                ctx.fillRect(this.x - this.iCSize[3] - 1, this.y + this.h - this.iCSize[3] + 1, this.iCSize[3] * 2, this.iCSize[3] * 2);
            }

            // Scale the image when placing it onto the canvas if the image is larger than the canvas
            function scaleImage(srcwidth, srcheight, targetwidth, targetheight) {

                imageProperties.resized = true;
                
                // scale to the target width
                var scaleX1 = targetwidth;
                var scaleY1 = (srcheight * targetwidth) / srcwidth;

                // scale to the target height
                var scaleX2 = (srcwidth * targetheight) / srcheight;
                var scaleY2 = targetheight;

                // now figure out which one we should use
                var fScaleOnWidth = (scaleX2 > targetwidth);
                
                // If we are scaling to fit the width
                if (fScaleOnWidth) {
                    
                    imageProperties.width = Math.floor(scaleX1);
                    imageProperties.height = Math.floor(scaleY1);
                    imageProperties.landscape = true;
                    imageProperties.resizeRatio = imageProperties.width / srcwidth;

                // Else we are scaling to fit the height
                } else {

                    imageProperties.width = Math.floor(scaleX2);
                    imageProperties.height = Math.floor(scaleY2);
                    imageProperties.landscape = false;
                    imageProperties.resizeRatio = imageProperties.height / srcheight;
                }

                imageProperties.targetLeft = Math.floor((targetwidth - imageProperties.width) / 2);
                imageProperties.targetTop = Math.floor((targetheight - imageProperties.height) / 2);
            } 

           

            $canvas.on('mousemove touchmove', function(e) { // binding mouse move event

                onMove(e);
            });

            function onMove(e) {
                if (typeof theSelection !== 'object') { // If the selection object has not been created yet, do nothing
                    return;
                }

                var canvasOffset = $canvas.offset();
                
                if (e.pageX === undefined) { // This is undefined on a touch screen, use the original event object instead
                    e = e.originalEvent.targetTouches[0];
                }

                // We're about to start changing things, take a copy of the original values
                var originalSelection = {
                    w: theSelection.w,
                    h: theSelection.h,                   
                    x: theSelection.x,
                    y: theSelection.y
                }

                iMouseX = Math.floor(e.pageX - canvasOffset.left);
                iMouseY = Math.floor(e.pageY - canvasOffset.top);

                // in case of drag of whole selector
                if (theSelection.bDragAll) {
                    theSelection.x = iMouseX - theSelection.px;
                    theSelection.y = iMouseY - theSelection.py;
                }

                for (i = 0; i < 4; i++) {
                    theSelection.bHow[i] = false;
                    theSelection.iCSize[i] = theSelection.csize;
                }

                // hovering over resize cubes
                if (iMouseX > theSelection.x - theSelection.csizeh && iMouseX < theSelection.x + theSelection.csizeh &&
                    iMouseY > theSelection.y - theSelection.csizeh && iMouseY < theSelection.y + theSelection.csizeh) {

                    theSelection.bHow[0] = true;
                    theSelection.iCSize[0] = theSelection.csizeh;
                }
                if (iMouseX > theSelection.x + theSelection.w-theSelection.csizeh && iMouseX < theSelection.x + theSelection.w + theSelection.csizeh &&
                    iMouseY > theSelection.y - theSelection.csizeh && iMouseY < theSelection.y + theSelection.csizeh) {

                    theSelection.bHow[1] = true;
                    theSelection.iCSize[1] = theSelection.csizeh;
                }
                if (iMouseX > theSelection.x + theSelection.w-theSelection.csizeh && iMouseX < theSelection.x + theSelection.w + theSelection.csizeh &&
                    iMouseY > theSelection.y + theSelection.h-theSelection.csizeh && iMouseY < theSelection.y + theSelection.h + theSelection.csizeh) {

                    theSelection.bHow[2] = true;
                    theSelection.iCSize[2] = theSelection.csizeh;
                }
                if (iMouseX > theSelection.x - theSelection.csizeh && iMouseX < theSelection.x + theSelection.csizeh &&
                    iMouseY > theSelection.y + theSelection.h-theSelection.csizeh && iMouseY < theSelection.y + theSelection.h + theSelection.csizeh) {

                    theSelection.bHow[3] = true;
                    theSelection.iCSize[3] = theSelection.csizeh;
                }

                // in case of dragging of resize cubes
                var iFW, iFH, iFX, iFY;
                if (theSelection.bDrag[0]) {
                    
                    // Get the current mouse position
                    iFX = iMouseX - theSelection.px;
                    iFY = iMouseY - theSelection.px; 
                   
                    // If the selection area is not a square
                    if (theSelection.w > theSelection.h) {
                        // Adjust the position of the top left corner's position vertically to be the amount that the corner just moved left/right
                        iFY = theSelection.y - (theSelection.x - iFX);
                    
                    } else {
                        // Else adjust the position of the top left corner's position horizontally to be the amount that the corner just moved up/down
                        iFX = theSelection.x - (theSelection.y - iFY);                        
                    }

                    iFW = theSelection.w + theSelection.x - iFX; 
                    iFH = theSelection.h + theSelection.y - iFY;                    
                }
                if (theSelection.bDrag[1]) {
                    iFX = theSelection.x;
                    iFY = iMouseY - theSelection.py;
                    iFH = theSelection.h + theSelection.y - iFY;
                    iFW = iFH; // Set these equal so the selection area is a square
                }
                if (theSelection.bDrag[2]) {
                    iFX = theSelection.x;
                    iFY = theSelection.y;
                    iFW = iMouseX - theSelection.px - iFX;
                    iFH = iFW; // Set these equal so the selection area is a square
                }
                if (theSelection.bDrag[3]) {
                    iFX = iMouseX - theSelection.px;
                    iFY = theSelection.y;
                    iFW = theSelection.w + theSelection.x - iFX;
                    iFH = iFW; // Set these equal so the selection area is a square
                }
                
                // If the width and height are both greater than the size of the (resize handles * 2)
                if (iFW > theSelection.csizeh * 2 && iFH > theSelection.csizeh * 2) {
                    theSelection.w = iFW;
                    theSelection.h = iFH;                   
                    theSelection.x = iFX;
                    theSelection.y = iFY;
                }

                if (validateSelection() === false) {
                    // undo all changes because it moved the selection area off the image
                    theSelection.w = originalSelection.w;
                    theSelection.h = originalSelection.h;                   
                    theSelection.x = originalSelection.x;
                    theSelection.y = originalSelection.y;
                }

                drawCanvas();
            }

            $canvas.on('mousedown touchstart', function(e) { // binding mousedown event

                if (scope.isMobile) {
                    // This would have normally been called already if the device supported hover, call it manually for a touch device
                    onMove(e);
                }

                if (typeof theSelection !== 'object') { // If the selection object has not been created yet, do nothing
                    return;
                }

                if (e.pageX === undefined) { // This is undefined on a touch screen, use the original event object instead
                    e = e.originalEvent.targetTouches[0];
                }

                var canvasOffset = $canvas.offset();
                iMouseX = Math.floor(e.pageX - canvasOffset.left);
                iMouseY = Math.floor(e.pageY - canvasOffset.top);

                theSelection.px = iMouseX - theSelection.x;
                theSelection.py = iMouseY - theSelection.y;

                if (theSelection.bHow[0]) {
                    theSelection.px = iMouseX - theSelection.x;
                    theSelection.py = iMouseY - theSelection.y;
                }
                if (theSelection.bHow[1]) {
                    theSelection.px = iMouseX - theSelection.x - theSelection.w;
                    theSelection.py = iMouseY - theSelection.y;
                }
                if (theSelection.bHow[2]) {
                    theSelection.px = iMouseX - theSelection.x - theSelection.w;
                    theSelection.py = iMouseY - theSelection.y - theSelection.h;
                }
                if (theSelection.bHow[3]) {
                    theSelection.px = iMouseX - theSelection.x;
                    theSelection.py = iMouseY - theSelection.y - theSelection.h;
                }
                

                if (iMouseX > theSelection.x + theSelection.csizeh && iMouseX < theSelection.x+theSelection.w - theSelection.csizeh &&
                    iMouseY > theSelection.y + theSelection.csizeh && iMouseY < theSelection.y+theSelection.h - theSelection.csizeh) {

                    theSelection.bDragAll = true;
                }

                for (i = 0; i < 4; i++) {
                    if (theSelection.bHow[i]) {
                        theSelection.bDrag[i] = true;
                    }
                }
            });

            $canvas.on('mouseup touchend', function(e) { // binding mouseup event

                if (typeof theSelection !== 'object') { // If the selection object has not been created yet, do nothing
                    return;
                }

                theSelection.bDragAll = false;

                for (i = 0; i < 4; i++) {
                    theSelection.bDrag[i] = false;
                }
                theSelection.px = 0;
                theSelection.py = 0;
            });

        }
    }
}])
*/
