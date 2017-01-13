
// Directives
// ----------------------------------------


angular.module('ui.common.directives')


// Scrolling Directive
// ------------------------------------------------

.directive('whenScrolled', ['onScroll', '$timeout', function(onScroll, $timeout) {
    return function(scope, elm, attr) {

        var raw = elm[0];

        this.checkBounds = function() {
            var rectObject = raw.getBoundingClientRect();

            if (rectObject.bottom <= window.innerHeight) {
                $timeout(function() {
                    scope.$apply(attr.whenScrolled);
                });
            }

        };
        var regId = onScroll.register(this.checkBounds);

        scope.$on('$destroy', function() {
            onScroll.deregister(regId);
        });

    };
}])


// Disable buttons on click
// ------------------------------------------------

.directive('disableToggle', ['$timeout', function($timeout) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {

            //if there is no scoped Boolean passed in, lets make our own private varible
            var isDisabled = scope.isDisabled || false;
            var loader = '<span class="disable-toggle__loader"></span>';
            var toggleDisabled = function() {

                isDisabled = !isDisabled;
                setDisabled(isDisabled);
            };

            function setDisabled(bool) {

                if (bool) {

                    $timeout(function() { // This timeout allows a <button> element to be used to submit a form.  The timeout allows the submit event to fire before the button is disabled
                        element.attr('disabled', true);
                    });
                    element.prepend(loader);

                } else {

                    element.removeAttr('disabled');
                    element.find('.disable-toggle__loader').remove();
                }
            }

            element.addClass('disable-toggle');

            var watchedToggle = typeof scope.$watch(attrs.disableToggle) === 'function' ? true : null; // scope.$watch will register a fn if the scope property exists in the current OR parent scope

            //if we are binding a bool, lets setup a watch
            if( typeof watchedToggle === 'boolean' ) {

                var watch = scope.$watch(attrs.disableToggle, function(newVal, oldVal) {
                    setDisabled(newVal);
                });

            } else {
            //no bound scope boolean, set up a click event
                element.on('click', toggleDisabled);

            }

            //Remove click event on destroy
            scope.$on('$destroy', function() {
                element.off('click', toggleDisabled);
                watch();
            });

        }
    };
}])


/*
 * Enter Event
 * Enter key capture on element
 *
 * <div ng-app="" ng-controller="MainCtrl">
 *     <input type="text" ng-enter="doSomething()">
 * </div>
 *
 */

.directive('ngEnter', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {

            function onEnter(event) {
                if(event.which === 13) {
                    scope.$apply(function() {
                        scope.$eval(attrs.ngEnter);
                    });

                    event.preventDefault();
                }
            }

            element.on('keydown keypress', onEnter);

            scope.$on('$destroy', function() {
                element.off('keydown keypress', onEnter);
            });
        }
    };
})

/*
 * Back
 * adds a window back on click event to anything
 *
 * <a back class="button">Back please</a>
 *
 */

.directive('back', ['$window', function($window) {
    return {
        link: function(scope, element, attrs) {

            var goBack = function() {
              $window.history.back();
              return false;
            };

            element.on('click', goBack);

        }
    };
}])

/*
 * Target
 * When iOS is operating in standalone mode (ie you added a page to the homescreen) clicks to target=self links open in safari, not in the window you are in
 *
 * http://stanhub.com/how-to-prevent-ios-standalone-mode-web-apps-from-opening-links-in-safari/
 *
 * <a target="_self" href="/dashboard">Any old link</a>
 *
 */

.directive('target', function() {

    return {
        restrict: 'A',
        link: function(scope, element, attrs) {

            if (('standalone' in window.navigator) && window.navigator.standalone && (attrs.target === '_self')) {

                element.on('click', function(event) {

                    var noddy = event.target,
                        remotes = false;

                    while(noddy.nodeName !== 'A' && noddy.nodeName !== 'HTML') {
                        noddy = noddy.parentNode;
                    }

                    if('href' in noddy && noddy.href.indexOf('http') !== -1 && (noddy.href.indexOf(document.location.host) !== -1 || remotes)) {
                        event.preventDefault();
                        document.location.href = noddy.href;
                    }
                });
            }
        }
    };
})



/*
 *
 * Select box styling
 * Parse all select boxes, reformat HTML to acheive consistent cross browser/device styling
 * Use this directive when the form builder is not being used
 *
 * <select-box ng-model="form.country">
 *     <select select-i="" ng-model="form.country" ng-options="c.title for c in data.countries track by c.val"></select>
 * </select-box>
 *
 */

.directive('selectBox', function($compile) {
    return {
        restrict: 'E',
        template: '<div class="select-wrapper {{compact}}">' +
                       '<span class="select">{{ val }}</span>' +
                  '</div>',
        transclude: true,
        replace: true,
        require: 'ngModel',
        scope: true,
        link: function(scope, element, attrs, ngModel, transclude) {

          transclude(scope, function(content) {
              element.prepend(content);
            });

          scope.$watch(function() {
              return ngModel.$modelValue;
            }, function(val) {
              if (val) {
                  scope.val = val.label || val.title; //scope.val = val.title; //val.title does not exist in the object
                }
            });

            if (attrs.type && attrs.type === 'compact') {
                scope.compact = 'select-wrapper--compact';
        }
    }
    };
})


/*
 * Focus Input
 * Adds focus to a child input if it is clicked
 * ex. in the 'fake' tag input
 *
 * <div focus-input>
 *     <input type="text">
 * </div>
 *
 */

.directive('focusInput', ['$timeout', function($timeout) {
  return {
      link: function(scope, element, attrs) {

          function focusInput() {
              $timeout(function() {
                  element.find('input')[0].focus();
                });
            }

            element.on('click', focusInput);
        }
    };
}])

/*
 * AutoFill
 * If the input is auto filled by the browser,
 * we will manually check the value after 500ms
 *
 * <input ng-model="form.name auto-fill />
 *
 */

.directive('autoFill', ['$timeout', function($timeout) {
  return {
      require: 'ngModel',
      link: function(scope, elem, attrs, ngModel) {
          var origVal = elem.val();
          $timeout(function() {
              var newVal = elem.val();
              if(ngModel.$pristine && origVal !== newVal) {
                  ngModel.$setViewValue(newVal);
                }
            }, 500);
        }
    };
}])



/*
 * Allows easy adding of a dynamic background-image
 *
 * <div background-image="imageOBJ" ></div>
 *
 */

.directive('backgroundImage', ['FileStorage', function(FileStorage) {
  return {
      restrict: 'A',
      scope: {
          filestoreImageId: '=backgroundImage'
        },
      link: function(scope, element, attrs) {

            var src = FileStorage.getDownloadUrl(scope.filestoreImageId) + '?inline=true';

            if (src) {
                element.css({
                    'background-image': 'url(' + src +')',
                    'background-size' : 'cover'
                });
            }
        }
    };
}])


/*
 * Spinning Loader
 * Adds a a spinner with the atrributed scope
 *
 * <loader></loader>
 *
 * size = optional (large)
 * align = optional (left|center|right)
 *
 */

.directive('loader', function() {
  return {
      restrict: 'EA',
      replace: true,
      scope:true,
      transclude:true,
      link: function($scope, $element, $attr) {

          //add alignment and inline class, dependant on their align attr.
          $scope.alignClasses = $attr.align ? 'loading-spinner__container aligned--' + $attr.align : 'loading-spinner__container--inline';
          $scope.iconClass = $attr.size === 'large' ? 'loading-spinner__icon--large' : 'loading-spinner__icon';

        },
        template: '<div class="{{ alignClasses }}">' +
          '<div class="loading-spinner">' +
            '<div class="{{ iconClass }}"></div>' +
            '<span ng-transclude />' +
            '</div>' +
          '</div>'
    };
})


/*
 * Block Loader
 * Displays a loading block item. Used when swapping out content
 *
 * <loading-placeholder></loading-placeholder>
 *
 */

.directive('loadingPlaceholder', function() {
    return {
        restrict: 'EA',
        replace: true,
        scope:true,
        transclude:true,
        template: '<div class="loading-block">' +
                        '<span ng-transclude />' +
                    '</div>'
    };
})

/*
 * Progress Bar
 * Adds a progress bar
 *
 * <progress-bar value="55" type="caution" label="My label"></progress-bar>
 *
 * value = default = 0 (%)
 * type = optional (positive|negative|caution)
 * label = optional (string)
 *
 */

.directive('progressBar', function() {
  return {
      restrict: 'E',
      scope: {
          value: '=',
          label: '@'
        },
        replace: true,
        transclude: true,
        template: '<div>' +
                    '<div class="progress-bar is--{{type}}">' +
                      '<div class="progress-bar__range" ng-style="{ width: value + \'%\' }"></div>' +
                  '</div>' +
                  '<span ng-if="label" class="progress-bar-label">{{ label }}</span>' +
                  '</div>',
      link: function(scope, element, attrs) {

            scope.type = attrs.type;

            if (!scope.type) {

                if (scope.value > 30 && scope.value < 75) {
                    scope.type = 'caution';
                } else if (scope.value >= 75) {
                    scope.type = 'positive';
                } else {
                    scope.type = 'negative';
                }
            }
        }
    };
})

/*
 * CSS driven pie chart
 * Adds a pie chart to your page
 *
 * <pie-chart value-amount="55" value-base="100" verb="Liked"></pie-chart>
 *
 * value-base default is = 100 (mandatory)
 * value-amount is the size of the slice of the pie (mandatory)
 * verb is the word appearing under the percentage eg. 55% liked (mandatory)
 *
 */

.directive('pieChart', ['$timeout', 'onResize', function($timeout, onResize) {
  return {
      restrict: 'E',
      scope: {
          valueAmount: '=',
          valueBase: '=',
          verb: '@'
        },
      replace: true,
      templateUrl: '/interface/views/common/partials/pie-chart.html',
      link: function(scope, element, attrs) {

            var style;

          scope.getStyle = function() {
              return style;
            };

          function resizeWatcher() {
              element.css('font-size', element.parent().width());
            }

            onResize.register(resizeWatcher);

          scope.$on('$destroy', function() {
              onResize.deregister(resizeWatcher);
            });

          scope.$watch('valueAmount', function(val) {
              if (val !== undefined) {

                    scope.percentage = parseInt((scope.valueAmount / scope.valueBase) * 100) || 0;

                  if (scope.percentage > 100) {
                      scope.percentage = 100; // Cannot be more than 100%
                      scope.rotation = 360; // Cannot be more than 360
                    } else if (scope.percentage <= 0) {
                        scope.percentage = 0; // Cannot be less than zero
                        scope.rotation = 0; // Cannot be less than zero
                    } else {
                        scope.rotation = parseInt((scope.valueAmount / scope.valueBase) * 360);
                    }

                    // Set opacity to 1 for the pie slice only if it's percentage is greater than 0
                    scope.visible = (scope.percentage > 0) ? 1 : 0;

                    scope.timeoutVal = parseInt((50 / scope.percentage) * 750); // Calculate the point of the animation in which the pie chart will reach 50% and then toggle the class at that point.  Aniation runs for exactly 0.75s

                  $timeout(function() {
                      scope.greaterThan50 = scope.percentage > 50 ? true : false;
                    }, scope.timeoutVal);                    

                  style = {
                      '-ms-transform' : 'rotate(' + scope.rotation + 'deg)',
                      '-webkit-transform' : 'rotate(' + scope.rotation + 'deg)',
                      'transform' : 'rotate(' + scope.rotation + 'deg)',
                      'opacity' : scope.visible
                    };
                }
            });
        }
    };
}])


/*
 * Reload
 * Template to reload the current widget, after a failed load attempt
 *
 * <reload action="loadWidget" />
 * action = scoped function to be called when user clicks retry
 */

.directive('reload', function() {
  return {
      restrict: 'E',
      scope: {
          reload: '&action'
        },
        template: '<div class="message message--retry">' +
          '<p>This failed to load<br />' +
          '<a ng-click="reload()"><span class="icon--clockwise"></span> Retry</a></p>' +
          '</div>'
    };
})

/* Document focused / Container Blur directive
 *
 * Watches for an active attr to become truthy,
 * then binds the document click event to invoke the onContainerBlur function
 *
 * <div is-active="activeVar" on-container-blur="doThis()" />
 *
 * value = default = 0 (%)
 * type = optional (positive|negative|caution)
 *
 */
.directive('onContainerBlur', function($document) {
  return {
      link: function(scope, element, attrs) {

          function onClick(event) {

                var isChild = element.has(event.target).length > 0;
                var isSelf = element[0] === event.target;
                var isInside = isChild || isSelf;

                if (!isInside) {
                    scope.$apply(attrs.onContainerBlur);
                }
            }

          scope.$watch(attrs.isActive, function(newValue, oldValue) {
              if (newValue !== oldValue && newValue === true) {
                  $document.on('click', onClick);
                }
                else if (newValue !== oldValue && newValue === false) {
                    $document.off('click', onClick);
                }
            });

          scope.$on('$destroy', function() {
              $document.off('click', onClick);
            });
        }
    };
})


/* Error Input
 *
 * Adds in basic styling for form errors
 *
 * <error>This is an error</error>
 *
 *
 */
 .directive('error', function() {

    return {
        restrict: 'E',
        template: '<span class="form__note form__note--error" ng-transclude></span>',
        transclude: true,
        replace: true
    };
})


/* Set the page minheight
 *
 * Sets the page page min height to keep footer off content
 *
 * <div setMinHeight>
 *
 */
.directive('getMedia', function(onResize) {
  return function(scope, element) {

      function resizeWatcher(dim) {
          $('.page').css('min-height', dim.height - 170);
        }

        onResize.register(resizeWatcher);

      scope.$on('$destroy', function() {
          onResize.degregister(resizeWatcher);
        });
    };
})


 /* File Link
 *
 * Takes a Filestore ID and turns it into an image or link
 *
 * <img file-link="{{id}}" />
 * <a href="" file-link="{{id}}"></a>
 *
 */

.directive('fileLink', ['$timeout', 'FileStorage', function($timeout, FileStorage) {

  return {
      restrict: 'A',
      link: function($scope, $element, $attrs) {
          var url = FileStorage.getDownloadUrl( $attrs.fileLink );
            
            // Is an anchor
          if( $attrs.hasOwnProperty('href') ) {
              $element.attr('href', url);

            // Is image
            } else if( $element.is('img') ) {
              var img = new Image();

              FileStorage.getUrl( $attrs.fileLink ).then(function(res) {
                  $element.attr('src', res);
                });
            }

        }
    };

}])

 /* Path Link
 *
 * Takes a Path, and optional attributes, and using the Path service builds a href
 *
 * <a path="network.profile" path-params="member.id,member.state">Go to profile</a>
 *
 */

.directive('path', ['Paths', 'BASE_URL', function(Paths, BASE_URL) {

  function getPath(url, attrs) {
        
      attrs = attrs ? attrs.slice(0) : [];
      attrs.unshift(url);
        
      return Paths.get.apply(null, attrs);
    }

  function setUrl($attrs, pathObj) {

      if(pathObj.external) {
          $attrs.$set('target', '_self');
        } else {
            pathObj.path = BASE_URL + pathObj.path;
        }

        $attrs.$set('href', pathObj.path);
    }

  return {
      restrict: 'A',
      link: function($scope, $element, $attrs) {

                //Builds array from pathParams attr
            var pathParams = $attrs.pathParams ? $attrs.pathParams.split(',') : [],
                //Populates values from PathParams
                pathParamValues;

            // Sets up watch for param, and places it into the pathParamValue array, then updates the path
          function setWatch(param, ind) {

              $scope.$watch(param, function(newVal) {

                    var pathObj;

                    if (newVal) { // The value finally resolved

                        pathParamValues[ind] = newVal;

                        pathObj = getPath($attrs.path, pathParamValues);
                        setUrl($attrs, pathObj);

                    } else { // The value resolved but it null

                        pathObj = getPath($attrs.path);
                        setUrl($attrs, pathObj);
                    }
                });
            }

          if(pathParams.length) {

              pathParamValues = [];
              pathParamValues[pathParams.length - 1] = '';

              angular.forEach(pathParams, function(pathParam, index) {
                    //set up watch of each path Param
                    setWatch(pathParam, index);
                });

            } else {

              setUrl($attrs, getPath($attrs.path) );
            }
        }
    };
}])

/* OnlineStatus
 *
 * Pings back the the server to let it know the user is still alive.
 *
 * <div online-status>
 *
 */

.directive('onlineStatus', ['Members', 'IS_LOCALHOST', function(Members, IS_LOCALHOST) {

  return {
      restrict: 'A',
      link: function($scope, $element, $attrs) {

            // if (IS_LOCALHOST){
            //     return;
            // }
            
          var pingServer = function() {

                Members.stillOnline();

            };

            window.requestInterval(pingServer, 3 * 60 * 1000);

            pingServer();
        }
    };

}])


/*
 * Avatar Image
 * Adds in an avatar image with the passed in path, or defaults
 *
 * <avatar img-src="src" size="small"></avatar>
 *
 * path = image path
 * size = tiny|small|large - defaults to regular (44px)
 * type = single|group - defaults to single
 * current-user = true - set this to load the current users avatar
 * avatar-loaded - pass in a property that you would like to be set to true once a non-default avatar has loaded
 *
 */

.directive('avatar', ['Paths', '$compile', 'Members', '$timeout', function(Paths, $compile, Members, $timeout) {
    return {
        restrict: 'E',
        scope: {
            'imgSrc': '=',
            'avatarLoaded': '=?'
        },
      replace:true,
      template: '<img ng-src="{{img}}" alt="Avatar" class="avatar {{ classSize }}" />',
      controller: function($scope, $element, $attrs) {

          var fallback = $attrs.type === 'group' ? Paths.get('image.defaultGroupProfile').path : Paths.get('image.defaultProfile').path;

            function setImgSrc(val) {
                //$timeout(function(){
                    $scope.img = val || fallback;
                //});
            }
            $scope.img = fallback;
            $scope.classSize = $attrs.size ? 'avatar--' + $attrs.size : '';

          if ($attrs.currentUser) {
              Members.me().then(function(response) {
                  setImgSrc(response.data.MemberProfile.PhotoThumb);
                });
            }

          $scope.$watch('imgSrc', function(newVal) {
              setImgSrc(newVal);
            });

            $element.on('load', function(event) {

                // If an image has loaded that's not the default image ie. has 'default' in the URL
                if (event.target.src.indexOf('default') === -1) {
                    $timeout(function() {
                        $scope.avatarLoaded = true;
                    });
                }
            });
        }
    };
}])

/*
 * Sticky bar
 *
 */

.directive('fixOnScroll', ['$timeout', 'onScroll', 'onResize', function($timeout, onScroll, onResize) {
    return {
        restrict: 'A',
        link: function($scope, $elem, $attrs) {

            $timeout(function() {

                var offsetTop = $attrs.offset || 0,
                    fixedClass = $attrs.fixedClass,
                    $window = angular.element(window),
                    $body = $('body'),
                    doc = document.documentElement,
                    initialPositionStyle = $elem.css('position'),
                    stickyLine,
                    scrollTop;

                // Get the sticky line
              function setInitial() {
                  stickyLine = 0 - offsetTop;
                  setWidth();
                  checkSticky();
                }

                // Fixed elements need a px width applied once they are positioned relative to the page
              function setWidth() {
                  $elem.removeAttr('style');
                  $elem.css('width', $elem[0].offsetWidth);
                }

                // Check if the window has passed the sticky line                
              function checkSticky() {

                  scrollTop = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);

                  if ($body.hasClass('body--locked')) { // Special case for the header sticky - we don't want anything to stick when the body--locked class is present
                      return false;
                    }

                  if ( scrollTop >= stickyLine ) {
                      $elem.addClass(fixedClass);
                    } else {
                      $elem.removeClass(fixedClass);
                    }
                }

                // Handle the resize event
                //
              function resize() {
                  $timeout(setInitial);
                }

                // Attach our listeners
                //
              var scrollWatcher = onScroll.register(checkSticky);
              onResize.register(resize);

              function resizeWatcher() {
                  $elem.css('font-size', $elem.parent().width());
                }

              $scope.$on('$destroy', function() {
                  onScroll.deregister(scrollWatcher);
                  onResize.deregister(resizeWatcher);
                });

              setInitial();
            });
        },
    };
}])

/*
 * Nav arrow animation, set CSS for sliding nav arrow
 *
**/
.directive('menuArrow', ['$timeout', function($timeout) {
  return {
      restrict: 'AE',
      scope: true,
      controller: function($scope) {

            $scope.items = {
                index: -1, // Item currently hovered over
                active: -1, // Item currently selected in nav
                liWidth: 0,
                liHeight: 0
            };
        },
      link: function(scope, element, attrs) {

          var arrow = angular.element('<div class="menu-arrow"></div>'),
              $window = angular.element(window),
              fixedClass = attrs.fixedClass,
              doc = document.documentElement,
              $body = $('body'),
              stickyLine,
              offsetTop,
              scrollTop;

            element.prepend(arrow);

            scope.$root.$watch('activeArrowSync', function(val, oldVal) {
                if (angular.equals(val, oldVal)) { return; }
                scope.items.active = scope.$root.activeArrowSync;
            });
            scope.$watch('items.active', function(val, oldVal) {
                if (angular.equals(val, oldVal)) { return; }
                if (attrs.isSync) { scope.$root.activeArrowSync = val; }
            });
            scope.$watch('items.index', function(val, oldVal) {
                setArrow(val);
            });

          function setWidth() {
              element.removeAttr('style');
              element.css('width', element[0].offsetWidth);
            }

          function setInitial() {
              stickyLine = 0 - offsetTop;
              setWidth();
              checkSticky();
            }

          function checkSticky() {
              scrollTop = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);

                if ($body.hasClass('body--locked')) { // Special case for the header sticky - we don't want anything to stick when the body--locked class is present
                    return false;
                }

              if ( scrollTop >= stickyLine ) {
                  element.addClass(fixedClass);
                } else {
                    element.removeClass(fixedClass);
                }
            }

          function resize() {
              $timeout(setInitial);
            }

          $window.on('resize', function() {
              hideShowArrow(resize = true);
            });    

          function hideShowArrow(resize) {
              if (element.height() > scope.items.liHeight) {
                  element.removeClass('singleRow');
                } else {
                    element.addClass('singleRow');
                    if (resize === true) {
                        setArrow(scope.items.active);
                    }
                }
            }   
            
          function setArrow(val) {
                
              var w = scope.items.liWidth;
              var offset = (element.outerWidth() - element.find('.submenu--strip').outerWidth()) / 2;

                if (val < 0) { // If there is no active item, leave the arrow offscreen
                    arrow.removeAttr('style');
                } else {
                    arrow.css('left', offset + (val * w) + (w / 2) + 'px');
                }
            }

          $timeout(function() {
              hideShowArrow(); // Check arrow visibility on page load
            });            
        }
    };
}])


.directive('menuArrowChild', ['$timeout', function($timeout) {
  return {
      restrict: 'AE',
      scope: false,
      require: '^menuArrow',
      link: function(scope, element, attrs) {

          var elementIndex = element.index(),
              $window = angular.element(window);
            
            // Wait until an active class has been added to the active item
          $timeout(function() {
              if (element.hasClass('is--active')) {

                  scope.$apply(function() {
                      scope.items.active = elementIndex;
                    });

                    element.trigger('mouseenter').trigger('mouseleave'); // Initialise active arrow on first load
                }

                // Initialise this value and update on window resize    
              scope.$apply(function() {
                  scope.items.liHeight = element.outerHeight(true);
                });     
            });

          element.on('mouseenter', function() {

              scope.$apply(function() {
                  scope.items.index = elementIndex;
                  scope.items.liWidth = element.outerWidth();
                });
            });

          element.on('mouseleave', function() {

              scope.$apply(function() {
                  scope.items.index = scope.items.active;
                });
            });

          $window.on('resize', function() {

              scope.$apply(function() {
                  scope.items.liWidth = element.outerWidth();
                  scope.items.liHeight = element.outerHeight(true);
                });
            });
        }
    };
}])

/*
 * Select the contents of input in click
 *
**/
.directive('selectOnClick', function() {
  return {
      restrict: 'A',
      link: function(scope, element, attrs) {
          element.on('click', function() {
              this.select();
            });
        }
    };
})


/*
 * Add remove file extension when in input
 *
**/
.directive('removeExtension', function($parse) {
  return {
      require: 'ngModel',
      restrict:'A',
      link:function(scope, elm, attrs, ctrl) {

          ctrl.$formatters.unshift(function(modelValue) {
              scope = scope;
              if (!modelValue) {
                  return '';
                }
                var ext = modelValue.substr(modelValue.lastIndexOf('.') + 1);
                var f = modelValue.substr(0, modelValue.lastIndexOf('.'));

                elm.attr('ext', ext);

                return f;
            });

          ctrl.$parsers.unshift(function(viewValue) {
              scope = scope;
              var ext = elm.attr('ext');
              var f = viewValue + '.' + ext;
              return f;
            });

        }
    };
})

/*
 * Usage
 *
 * <div class="table-responsive">
 *     <table>
 *         ....
 *
 * This directive adds a small element to the end of the table wrapper making the RHS of the table not fully visible to indicate that there is more to see if you scroll
 * The small element is hidden once you have scrolled the entire length
 *
 */

.directive('tableResponsive', function() {
    return {
        restrict: 'C',
        scope: false,
        link: function(scope, element, attrs) {

            var table = element.find('table');

            // If table is scrollable
            if (table.width() > element.width()) {

                element.append('<span class="overflow-indicator"></span>');
                var $overflowIndicator = element.find('.overflow-indicator');

                element.on('scroll', function(e) {
                    if (e.target.scrollLeft + element.width() >= table.width()) {
                        $overflowIndicator.addClass('ng-hide');
                    } else {
                        element.find('.overflow-indicator.ng-hide').removeClass('ng-hide');
                        $overflowIndicator.css('right', '-' + e.target.scrollLeft + 'px');
                    }
                });
            }
        }
    };
})



/*
 * Usage
 *
 * <div class="radio-list">
 *     <div class="field__radio">
 *         ....
 *
 * This directive scrolls the radio list style to the selected radio option if an option has been selected
 *
 */

.directive('radioList', ['$timeout', function($timeout) {
    return {
        restrict: 'C',
        scope: false,
        link: function(scope, element, attrs) {

            $timeout(function() {

                angular.forEach(element.find('input'), function(value, key) {

                    var radio = angular.element(value);

                    if (radio.is(':checked')) {
                        element.scrollTop(radio.position().top - 20);
                    }
                });
            });
        }
    };
}])

/*
 *
 * Loading indicator on input
 * Used to template a loading indicator with an input.  Pass in a bool to toggle the looading indicator on/off
 *
 */

.directive('inputLoading', function() {
    return {
        restrict: 'A',
        scope: false,
        transclude: 'element',
        replace: true,
        template: '<div class="input--loading">' +
                       '<span ng-transclude></span>' +
                       '<loader ng-show="isLoading"></loader>' +
                   '</div>',
        link: function(scope, element, attrs) {

            attrs.$observe('inputLoading', function(val) {
                scope.isLoading = (val === 'true' || val === true) ? true : false; // Need to convert a string to a bool here because 'false' (as a string) is truthy
            });
        }
    };
})

/*
 * This is an additional text-angular directive used to fix the position of the the text angular toolbar on scroll
 * It runs alongside the original text-angular directive
 *
 */

.directive('textAngular', ['onScroll', 'onResize', 'mediaQuery', '$timeout', function(onScroll, onResize, mediaQuery, $timeout) {
  return {
      restrict: 'E',
      link: function(scope, element, attrs) {
            
          var toolbar, lockPosition,
              scrollWatcher, resizeWatcher;

            if (attrs.scrollFix) { // If the fix property has been set / do we want to run any of this code

                // Wait till the views content has loaded
              scope.$on('$viewContentLoaded', function() {
                  $timeout(function() { // Then run a timeout is used to ensure html is in the DOM before initialising
                      initialise();
                    });                    
                });
            }
            
          function initialise() {

              toolbar = element.children('.ta-toolbar');
              updateLockPosition();

              scrollWatcher = onScroll.register(scrolling);
              resizeWatcher = onResize.register(resizing);

              scope.$on('$destroy', function() {
                  onScroll.deregister(scrollWatcher);
                  onResize.deregister(resizeWatcher);
                });
            }
            
          function scrolling() {
                
              var toolbarPosition = toolbar[0].getBoundingClientRect();

                if (toolbarPosition.top < fixedPosition() && !toolbar.hasClass('ta-toolbar--fixed')) { // If the toolbar position is less than or equal to the height of the header in it's compact size and it doesn't already have the fixed class
                    toolbar.addClass('ta-toolbar--fixed');
                }

                //console.log(scrollPosition(), lockPosition)
                if (scrollPosition() < lockPosition) { // if the scroll position of the page is less than the position in which the toolbar locks into place
                    toolbar.removeClass('ta-toolbar--fixed');
                }
            }

            // This will be called on page load by the resize service and then again on subsequent resize events
          function resizing() {
                
              toolbar.css('width', element[0].offsetWidth - 1); // Fix the width of the toolbar as the width is needed when position fixed is used
                
                // Lock position is the offset on the page at which we begin to lock the toolbar
                // Only update it if the toolbar is currently not fixed.  If it is fixed we'll just be using the old value which isn't as accurate but it gives an ok experience
                if (!toolbar.hasClass('ta-toolbar--fixed')) {
                    updateLockPosition();
                }
            }
            
          function scrollPosition() {
              return window.pageYOffset || document.documentElement.scrollTop;
            }
            
          function updateLockPosition() {
              lockPosition = toolbar[0].getBoundingClientRect().top - fixedPosition();
            }

            // Fixed position is the amount of pixels from the top of the page we want to fix the toolbar
          function fixedPosition() {
              return (mediaQuery.get() === 'mobile' || mediaQuery.get() === 'phablet') ? 0 : attrs.scrollFix;
            }
        }
    };    
}]);
