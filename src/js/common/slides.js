
// Gallery Slides Directive
// ----------------------------------------

angular.module('ui.common.directives')


/* Infinite Slider
 *
 * Requires a lightbox controller to work.
 * Is a sliding content / image panel that can be scrolling infintiely.
 *
 * <ul slider-panel>  
 *     <slide ng-repeat="slide in slides"></slide>
 * </ul>
 * 
 *
 */
.directive('sliderPanel', ['$timeout', function($timeout) {
  return {
      restrict: 'AE',
      link: function(scope, element, attrs) {

            // this watches for the update the the slide offset count (x).
            // triggered by a next or previous event in the controller.
            // updates the slide container by 100 * x %
          scope.$watch('selectedSlide.offset', function(newVal, oldVal) {
              element[0].setAttribute('style', CSS.translate3d(-newVal * 100 + '%', 0, 0, 650));  
            });

        }
    };
}])


.directive('slide', ['$timeout', '$compile', function($timeout, $compile) {
    
  var ITEM_TYPES = {
        Image: '<div class="lightbox__image fade" image="slide.item" image-src="{{ slide.item.Thumbnail ? slide.item.Thumbnail : slide.item.url | trusted }}"></div>',
        //document: '<pdf-canvas src="{{ slide.item.Thumbnail ? slide.item.Thumbnail : slide.item.url | trusted }}" src-filename="{{ slide.item.FileName }}"></pdf-canvas>',
        Document: '<iframe class="document__frame" width="100%" height="100%" src="{{ slide.item.Thumbnail ? slide.item.Thumbnail : slide.item.url | trusted }}"></iframe>',
        Audio: '<audio class="audio__frame" controls autoplay="autoplay"><source src="{{ slide.item.Thumbnail ? slide.item.Thumbnail : slide.item.url | trusted }}"></audio>',
        Video: '<video class="video__frame" id="video" width="50%" height="50%" controls="controls" autoplay="autoplay"><source src="{{ slide.item.Thumbnail ? slide.item.Thumbnail : slide.item.url | trusted }}"></video>',
      img: '<div class="lightbox__image fade" image="slide.item" image-src="{{ slide.item.url | trusted }}"></div>',
        pdf: '<iframe class="document__frame" width="100%" height="100%" src="{{slide.item.url | trusted }}"></iframe>',
        //pdf: '<pdf-canvas src="{{slide.item.url | trusted }}" src-filename="{{ slide.item.filename }}"></pdf-canvas>'
    };

  return {
      restrict: 'AE',
      replace: true,
        template: '<li ng-style="slideStyle()" class="slide--{{slide.item.ArtifactTypeName ? scope.slide.item.ArtifactTypeName : scope.slide.item.type}}"></li>',
      link: function(scope, element, attrs) {
            
            var itemTemplate = ITEM_TYPES[scope.slide.item.ArtifactTypeName ? scope.slide.item.ArtifactTypeName : scope.slide.item.type];

          if(itemTemplate) {
              element.html( $compile(itemTemplate)(scope) );
            }

          scope.$watch('slide', function(val) {
              if (val) {

                  scope.slideStyle = function() {
                      return {
                          left : val.pos * 100 + '%'
                        };
                    };

                    scope.imagePath = val.item.Thumbnail ? val.item.Thumbnail : val.item.url;
                  scope.item = val.item;
                }
            });

        }
    };
}])


/* Lightbox Image
 *
 * Vertically cented / scaled image
 *
 * <li image="item" image-src="{{ src }}"></li>
 *
 */
.directive('image', ['$window', 'onResize', '$timeout', function($window, onResize, $timeout) {
    
    // Width, Height, Target Width, Target Height
  var genStyles = function(w, h, elem_w, elem_h) {

        var s = {
          left: 0,
          top: 0,
          width: '100%',
          height: 'auto'
        };

        // get image and target ratio (width / height)
        var r = w/h,
          elem_r = elem_w/elem_h;

        // if image ratio is higher than target
        if (r > elem_r) {
            // landscape layout

            // get new adjusted height
          var nh = Math.round( (elem_w/w) * h);
            // set top offset
          s.top = Math.abs( elem_h/2 - nh/2 ) + 'px';

        } else {
            //portrait layout

            // get new adjusted width
          var nw = Math.round( (elem_h/h) * w);
            // set left position and others
          s.left = Math.abs( elem_w/2 - nw/2 ) + 'px';
          s.top = '0px';
          s.width = 'auto';
          s.height = '100%';
        }
        return s;

      },

    // gets the size (width and height) of the parent element
    // happens on every resize event
      getElementSize = function(element) {
      return {
          elm_w : element[0].clientWidth,
          elm_h : element[0].clientHeight
        };
    },

    // gets the size (width and height) of the ima once its loaded
    // happens only once and gets stored
      getImageSize = function($img) {
      return {
          img_w : $img.width(),
          img_h : $img.height()
        };
    };

  return {
      restrict: 'A',
      link: function(scope, element, attrs) {

          var $img,
              img,
              imgSize;

          function resize() { 
              $timeout(function() {

                    // on resize,
                    // if image exists, then get the element size and img size
                    // generate css layout and apply to image
                  if ($img) {
                      var elmSize = getElementSize(element);
                      imgSize = imgSize || getImageSize($img);

                      var styles = genStyles(imgSize.img_w, imgSize.img_h, elmSize.elm_w, elmSize.elm_h);
                      $img.css(styles);
                    }

                });
            }

            // resize event
          onResize.register(resize);

            // Watch resize event
          scope.$watch('slideResize', function(newVal, oldVal) {
              if (newVal !== oldVal) {
                  resize();
                }
            });

            // Watch for src to change

          attrs.$observe('imageSrc', function() {
                
              element.find('img').remove();
                
                // preload the image
              var url = attrs.imageSrc;
                // preloading...
              img = new Image();
                
              img.onload = function() {
                  $img = angular.element(img);
                    
                    // append newly created image to page
                  element.append($img);

                    // add animation class and trigger resize
                  $timeout(function() {
                      element.addClass('in');
                      resize();
                    });
                };

              img.src = url;

            });

            // Destroy

          scope.$on('$destroy', function() {
              onResize.deregister(resize);
              img = null;
            });

        }
    };
}]);