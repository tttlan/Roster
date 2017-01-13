angular.module('ui.common')

//Simple pdf directive, that opens up in an iframe
.directive('pdf', [function() {
  return {
      replace: true,
      restrict: 'E',
      templateUrl: '/interface/views/common/partials/pdf.html',
      link: function(scope, ele, attrs) {
          scope.embedURL = '/interface/media/pdf/viewer/viewer.html?file=' + encodeURIComponent(attrs.source);
          scope.downloadLink = attrs.source;
        }
    };
}])

// container for pdfCanvas
// this calls in the pdf, and appends it 
.directive('pdfCanvasContainer', ['$compile', 'onResize', '$timeout', function($compile, onResize, $timeout) {
  return {
      replace: true,
      restrict: 'E',
      scope: {
          height: '@',
          width: '@'
        },
      templateUrl: '/interface/views/common/partials/pdfCanvasContainer.html',
      link: function(scope, ele, attrs) {

          var pdfCanvas;

            // placeholder width and height
          scope.height = scope.height || '100%';
          scope.width = scope.width || '100%';

          scope.dimensions = {
              top:0,
              left:0,
              width:0,
              height:0,
              position: 'absolute'
            };

            // update dimensions object on resize
          function updateDimensions() {

              var offset = ele.offset();

              scope.dimensions.top = offset.top;
              scope.dimensions.left = offset.left;
              scope.dimensions.width = ele[0].offsetWidth;
              scope.dimensions.height = ele[0].offsetHeight;

            }

            // keep the width and height of the container, and the top and left position up to date
            
          $timeout(function() {

              onResize.register(function() {
                  updateDimensions();
                });

              scope.$on('$destroy', function() {
                    // destroy PDF viewer
                  pdfCanvas.remove();
                    // remove resize handler
                  onResize.deregister(updateDimensions);
                });
            });

            // Build PDF canvas
          pdfCanvas = $compile('<pdf-canvas src="' + attrs.src + '" dimensions="dimensions"></pdf-canvas>')(scope);
            // append to body
          $('body').append(pdfCanvas);

        }

    };
}])

// Builds canvas of the pdf, and scales acordingly
// <pdf-canvas src="{{ src }}" src-filename="{{ optional file name }}"></pdf-canvas>

.directive('pdfCanvas', ['$q', 'onResize', '$timeout', '$window', '$document', '$server', '$cookies',
    function($q, onResize, $timeout, $window, $document, $server, $cookies) {

      var scriptPromise;

      return {
      replace: true,
      restrict: 'E',
      scope: {
          src: '@',
          srcFilename: '@',
          dimensions: '='
        },
      templateUrl: '/interface/views/common/partials/pdfCanvas.html',
      link: function(scope, ele, attrs) {

          scope.downloadFile = (src) => {
              $server.get({
                  url : src,
                  responseType:'arraybuffer'
              }).then((response) => {
                  let versionSupport = detectIE();
                  let a = document.createElement('a');

                  let documentName = scope.doc.name+".pdf";
                  let file = new Blob([ response.data ], {
                      type : 'application/pdf'
                  });

                  if (versionSupport) {
                      window.navigator.msSaveBlob(file, documentName);
                  } else {
                      let fileURL = URL.createObjectURL(file);

                      a.href = fileURL;
                      a.target = '_blank';
                      a.download = documentName;
                      document.body.appendChild(a);
                      a.click();
                  }
              });
          };

          /**
           * detect IE
           * returns true or false depending on if ie supports createObjectURL or not.
           */
          function detectIE() {
              var ua = window.navigator.userAgent;

              // Test values; Uncomment to check result …

              // IE 10
              // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';

              // IE 11
              // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

              // Edge 12 (Spartan)
              // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';

              // Edge 13
              // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

              var msie = ua.indexOf('MSIE ');
              if (msie > 0) {
                  // IE 10 or older => return version number
                  return true
              }

              var trident = ua.indexOf('Trident/');
              if (trident > 0) {
                  // IE 11 => return version number
                  var rv = ua.indexOf('rv:');
                  return true
              }

              var edge = ua.indexOf('Edge/');
              if (edge > 0) {
                  // Edge (IE 12+) => return version number
                  return false
              }

              // other browser
              return false;
          }

          var body = $document.find('body').eq(0);

          var docPDF = {},
              canvasHolder = ele.find('.pdf__canvas-container'),
              canvasPositions = []; // canvas page element postitions

            // pages object
          scope.pages = {
              current: 1,
              total: 0,
              loaded: false,
              range: [],
              $get: function(num) {
                  moveToPage(num);
                },
              $next: function() {
                  moveToPage(scope.pages.current + 1);
                },
              $prev: function() {
                  moveToPage(scope.pages.current - 1);
                },
              $isNext: function() {
                  return scope.pages.current < scope.pages.total;
                },
              $isPrev: function() {
                  return scope.pages.current > 1;
                }
            };

            // This is the PDF object that gets passed through to the html template
          scope.doc = {
              name: scope.srcFilename || getNameFromUrl(scope.src),
              canExpand: angular.isDefined(scope.dimensions),
              isExpanded: false,
              docError: null,
              $expand: function() {
                  scope.doc.isExpanded = !scope.doc.isExpanded;
                  toggleBodyLock(scope.doc.isExpanded);
                  $timeout(function() {
                      resizeCanvas();
                    }, 290);
                },
              $print: function() {

                    //$window.open(scope.src).print();

                    /*var frame = $('<iframe />');
                    frame.attr('src', scope.src);
                    ele.append(frame);

                    $timeout(function(){
                        frame.focus();
                        frame.contentWindow.print();
                    })*/
                }
            };

          loadScript().then(function(res) {

              var docInitParams = {};
              docInitParams.url = scope.src;
              docInitParams.withCredentials = "true";
              docInitParams.httpHeaders = {
                  "Authorization" : "Sherpa.aspxauth=" + $cookies.get('Sherpa.aspxauth')
              };
              PDFJS.getDocument(docInitParams).then(function(pdfData) {

                  // ref the PDF object
                  docPDF.data = pdfData;
                  //grab the pages into scope
                  scope.pages.total = pdfData.numPages;

                  for(var len = scope.pages.total; len--;) {
                      scope.pages.range.push(len);
                  }

                  // build the canvases
                  buildCanvasPages();

                  // error handling on load
              }).then(null, function(error) {
                  $timeout(function() {
                      scope.doc.docError = error;
                  });
              });
          });
            
          function getNameFromUrl(url) {
                // if we are getting the pdf from our fileserver, they send the filename back
                // in a param of filename
              if(url.indexOf('filename=') > -1) {
                  return url.split('filename=').pop();
                } else {
                    // otherwise lets just get the full name
                  return url.split('/').pop();
                }
            }

          function buildCanvasPages() {
              var len = scope.pages.total,
                  canvases = [],
                  loadingPages = [],
                  currentCanvas;

              for(var i = 0; i < len; i++) {
                  currentCanvas = document.createElement('canvas');

                    // push the page loading promises
                  loadingPages.push(drawPage(currentCanvas, i + 1));
                  canvases.push(currentCanvas);

                }

                //wait for the pages to all load and canvas will start to draw
              $q.all(loadingPages).then(function() {
                    // Add to the dom
                  canvasHolder.find('.pdf__canvas-inner').html(canvases);
                    
                    // Cache the canvas top positions for scrolling sniffing
                  canvasPositions = canvasHolder.children().map(function(i, canvas) {
                        // beware this is jquery .map function, which sucks wang
                      return canvas.offsetTop;
                    });

                  scope.pages.loaded = true;

                });

            }

            // loads in pdf.js and the worker file
            // that holds all the modules like fonts and stuff
          function loadScript() {

              var defered;

              if( scriptPromise && typeof scriptPromise.then === 'function' ) {
                  return scriptPromise;
                } else {
                    
                  defered = $q.defer();

                  UTIL.loadScript('/interface/js/lib/pdf.js', function() {
                      PDFJS.workerSrc = '/interface/js/lib/pdf.worker.js';
                      defered.resolve(true);
                    });
                  scriptPromise = defered.promise;
                }

              return scriptPromise;

            }

            //scrolls the container to the right page
          function moveToPage(pageNum) {
                
              pageNum = pageNum || 1;
                
              if( scope.pages.scrolling || pageNum > scope.pages.total || pageNum < 1 ) {
                  return;
                }

              scope.pages.scrolling = true;
                
              canvasHolder.animate({scrollTop: canvasPositions[pageNum - 1] + 'px'}, 150, function() {
                  scope.pages.scrolling = false;
                });
            }

            // draws a page to a given canvas
          function drawPage(canvas, pageNum) {
                
                // get the needed page
              return docPDF.data.getPage(pageNum).then(function(page) {
                    
                  var context = canvas.getContext('2d'),
                      viewport = page.getViewport(1),
                      ratio;

                    // get the pages ratio for the container
                  ratio = canvasHolder.find('.pdf__canvas-inner').width() / viewport.width;

                    // This would be needed to set a ratio of either width and height, currentlt we only use width
                    // Math.min( (ele[0].offsetWidth / viewport.width), (ele[0].offsetHeight / viewport.height) );
                    
                    // set the canvas width and height
                  canvas.width = ratio * viewport.width;
                  canvas.height = ratio * viewport.height;

                    //render the page onto the canvas
                  page.render({
                      canvasContext: context,
                      viewport: page.getViewport(ratio)
                    });

                });
            }

            // On resize, rebuild the canvas pages if it's loaded
          function resizeCanvas() {
              if(docPDF.data) {
                  buildCanvasPages();
                }
            }

            // Toggle body scroll lock
          function toggleBodyLock( expand ) {
              if (expand) {
                    // get the current scroll offset and save it to the body tag.
                    // add a class to hide scrollbars
                  var documentTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
                  body.addClass('body--locked');
                  body.css('top', -documentTop + 'px');

                } else {
                    // retrieve the saved scroll position from body
                    // remove locking class
                    // scroll the page to the offset position
                  var scrollTop = parseInt(body.css('top'));
                  body.removeClass('body--locked');
                  $('html,body').scrollTop(-scrollTop);

                }
            }

          onResize.register(_.debounce(function() {
              resizeCanvas();
            }, 1000), true);

          scope.$on('$destroy', function() {
              onResize.deregister(resizeCanvas);
              canvasHolder.off('scroll');

              if (docPDF.data) {
                  docPDF.data.cleanup(); //cleans up loaded in modules like fonts, jpg
                  docPDF.data.destroy(); // removed the object and any references.
                }
            });

          canvasHolder.on('scroll', _.debounce(function(e) {
                
              var newPos = canvasHolder.scrollTop(),
                  len = canvasPositions.length;

              for(var i = 0; i < len; i++) {
                  if( canvasPositions[i] > newPos) {
                      break;
                    }
                }
              $timeout(function() {
                  scope.pages.current = i;
                });

            }, 50));

            // If dimensions are given we need to style
            /*if( angular.isDefined(scope.dimensions) ){
                ele[0].style.position = 'absolute';
                ele[0].style.zIndex = 210;
            }*/

          scope.getStyles = function() {
              if(scope.doc.isExpanded) {
                  return {
                      top:0,
                      left:0,
                      width:'100%',
                      height:'100%',
                      position: 'fixed',
                      background: 'rgba(0,0,0,0.5)'
                    };
                } else {
                  return scope.dimensions;
                }
            };

        }
    };
    }]);

/*
    An example of how to set up a pdf in a lightbox, use the normal lightbox method,
    and add in a pdf item with type pdf, and the url:
    {
        type: 'pdf',
        url: '/interface/media/pdf/jpdfunit_aShortIntroduction.pdf'
    }

*/
