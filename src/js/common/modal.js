// Content modal
// ----------------------------------------
// based off https://github.com/angular-ui/bootstrap/blob/master/src/modal/modal.js


angular.module('ui.common.modal')


    /**
     * A helper, internal data structure that acts as a map but also allows getting / removing
     * elements in the LIFO order
     */
    .factory('$$stackedMap', function() {
        return {
            createNew: function() {
                var stack = [];

                return {
                    add: function(key, value) {
                        stack.push({
                            key: key,
                            value: value
                        });
                    },
                    get: function(key) {
                        for (var i = 0; i < stack.length; i++) {
                            if (key === stack[i].key) {
                                return stack[i];
                            }
                        }
                    },
                    keys: function() {
                        var keys = [];
                        for (var i = 0; i < stack.length; i++) {
                            keys.push(stack[i].key);
                        }
                        return keys;
                    },
                    top: function() {
                        return stack[stack.length - 1];
                    },
                    remove: function(key) {
                        var idx = -1;
                        for (var i = 0; i < stack.length; i++) {
                            if (key === stack[i].key) {
                                idx = i;
                                break;
                            }
                        }
                        return stack.splice(idx, 1)[0];
                    },
                    removeTop: function() {
                        return stack.splice(stack.length - 1, 1)[0];
                    },
                    length: function() {
                        return stack.length;
                    }
                };
            }
        };
    })


    // Backdrop Directive
    // ----------------------------------------

    .directive('modalBackdrop', ['$timeout', function($timeout) {
        return {
            restrict: 'EA',
            replace: true,
            template: '<div class="backdrop fade {{backdropClass}}" ng-class="{in: animate}"><div class="loading-spinner__icon--large fade" ng-class="{in: animate}"></div></div>',
            link: function(scope, element, attrs) {

                scope.backdropClass = attrs.backdropClass || '';

                scope.animate = false;

                //trigger CSS transitions
                $timeout(function() {
                    scope.animate = true;
                });
            }
        };
    }])


    // Modal Window Directive
    // ----------------------------------------

    .directive('modalWindow', ['$modalStack', '$timeout', 'onResize', '$window', function($modalStack, $timeout, onResize, $window) {
        return {
            restrict: 'EA',
            scope: {
                index: '@',
                animate: '=',
                backdrop: '=',
                animationType: '@',
                loadedData: '='
            },
            replace: true,
            transclude: true,
            templateUrl: function(tElement, tAttrs) {
                return '/interface/views/common/partials/' + tAttrs.templateType + '.html';
            },
            link: function(scope, element, attrs) {

                element.addClass(attrs.windowClass || '');
                scope.size = attrs.size;
                scope.title = attrs.title;
                var $win = angular.element($window);

                $timeout(function() {
                    if (!scope.loadedData) {
                        var dataWatch = scope.$watch(_.throttle(function() {
                            return scope.loadedData;
                        }, 300), function(val) {
                            if (val) {
                                scope.animate = true;
                                dataWatch();
                            }
                        });
                        scope.$on('$destroy', function() {
                            dataWatch();
                        });
                    }
                    else {
                        scope.animate = true;
                    }

                    // focus a freshly-opened modal
                    element[0].focus();

                    var dialog = element.find('.modal__dialog');

                    function setTop(windowSize) {
                        var dialogHeight = dialog.height();
                        var dialogOffset = dialogHeight < windowSize.height ? dialogHeight / 2 : windowSize.height / 2 - 20;
                        dialog.css('margin-top', '-' + dialogOffset + 'px');
                    }

                    if (dialog.length) { // Make sure this block of code does not apply to drawers

                        onResize.register(setTop);

                        var heightWatch = scope.$watch(_.throttle(function() {
                            return element.children('.modal__dialog')[0].offsetHeight;
                        }, 150), function(newVal, oldVal) {
                            if (newVal !== oldVal && Math.abs(newVal - oldVal) > 100) {
                                setTop({width: $win.width(), height: $win.height()});
                            }
                        });

                        scope.$on('$destroy', function() {
                            onResize.deregister(setTop);
                            heightWatch();
                        });
                    }
                });

                scope.close = function(evt) {
                    var modal = $modalStack.getTop();
                    if (modal && modal.value.backdrop && modal.value.backdrop !== 'static' && (evt.target === evt.currentTarget)) {
                        evt.preventDefault();
                        evt.stopPropagation();
                        $modalStack.dismiss(modal.key, 'backdrop click');
                    }
                };
            }
        };
    }])


    // Transclude Directive
    // ----------------------------------------

    .directive('modalTransclude', function() {
        return {
            link: function($scope, $element, $attrs, controller, $transclude) {
                $transclude($scope.$parent, function(clone) {
                    $element.empty();
                    $element.append(clone);
                });
            }
        };
    })


    // Modal Factory
    // ----------------------------------------

    .factory('$modalStack', ['$transition', '$timeout', '$document', '$compile', '$rootScope', '$$stackedMap', '$location', '$window',
        function($transition, $timeout, $document, $compile, $rootScope, $$stackedMap, $location, $window) {

            var OPENED_MODAL_CLASS = 'body--locked';

            var backdropDomEl, backdropScope;
            var openedWindows = $$stackedMap.createNew();
            var $modalStack = {};

            function backdropIndex() {
                var topBackdropIndex = -1;
                var opened = openedWindows.keys();
                for (var i = 0; i < opened.length; i++) {
                    if (openedWindows.get(opened[i]).value.backdrop) {
                        topBackdropIndex = i;
                    }
                }
                return topBackdropIndex;
            }

            $rootScope.$watch(backdropIndex, function(newBackdropIndex) {
                if (backdropScope) {
                    backdropScope.index = newBackdropIndex;
                }
            });

            function removeModalWindow(modalInstance, reason) {

                var body = $document.find('body').eq(0),
                    scrollTop = parseInt($('body').css('top')),
                    modalWindow = openedWindows.get(modalInstance).value;

                //clean up the stack
                openedWindows.remove(modalInstance);

                // If the user is closing the module, without navigating away, let's replace the url
                if (reason !== 'navigated away') {
                    var topModal = openedWindows.top,
                    search = {};

                    if(topModal) {
                        if(topModal.name) {
                            search.m = topModal.name;
                        }
                    }

                    /**
                     * This below block of code (point 1) has been commented out as it seems to append ?m=top when closinbg a modal and in some instances causes a
                     * full page refresh which is not a desired result. If any issues arrise with in regards to this being commented out discuss with
                     * Eric Leung and/or Christian Sesta.
                     * 1. //$location.search(search).replace();
                     */
                }

                //remove window DOM element
                removeAfterAnimate(modalWindow.modalDomEl, modalWindow.modalScope, 300, function() {
                    modalWindow.modalScope.$destroy();
                    body.toggleClass(OPENED_MODAL_CLASS, openedWindows.length() > 0);
                    $('html,body').scrollTop(-scrollTop);
                });

                //remove backdrop if no longer needed
                if (backdropDomEl && backdropIndex() === -1) {
                    var backdropScopeRef = backdropScope;
                    removeAfterAnimate(backdropDomEl, backdropScope, 300, function() {
                        backdropScopeRef.$destroy();
                        backdropScopeRef = null;
                    });
                    backdropDomEl = undefined;
                    backdropScope = undefined;
                }
            }


            function removeAfterAnimate(domEl, scope, emulateTime, done) {
                // Closing animation
                scope.animate = false;

                var transitionEndEventName = $transition.transitionEndEventName;
                if (transitionEndEventName) {
                    // transition out
                    var timeout = $timeout(afterAnimating, emulateTime);

                    domEl.bind(transitionEndEventName, function() {
                        $timeout.cancel(timeout);
                        afterAnimating();
                        scope.$apply();
                    });
                } else {
                    // Ensure this call is async
                    $timeout(afterAnimating);
                }

                function afterAnimating() {
                    if (afterAnimating.done) {
                        return;
                    }
                    afterAnimating.done = true;

                    domEl.remove();
                    if (done) {
                        done();
                    }
                }
            }

            $document.bind('keydown', function(evt) {
                var modal;

                if (evt.which === 27) {
                    modal = openedWindows.top();
                    if (modal && modal.value.keyboard) {
                        evt.preventDefault();
                        $rootScope.$apply(function() {
                            $modalStack.dismiss(modal.key, 'escape key press');
                        });
                    }
                }
            });

            $modalStack.open = function(modalInstance, modal) {

                openedWindows.add(modalInstance, {
                    deferred: modal.deferred,
                    dataDeferred: modal.dataDeferred,
                    modalScope: modal.scope,
                    backdrop: modal.backdrop,
                    keyboard: modal.keyboard
                });

                var body = $document.find('body').eq(0),
                    currBackdropIndex = backdropIndex(),
                    top = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;

                if (modal.templateType === 'drawer') {
                    modal.backdropClass = 'drawer';
                }

                if (currBackdropIndex >= 0 && !backdropDomEl) {
                    backdropScope = $rootScope.$new(true);
                    backdropScope.index = currBackdropIndex;
                    var angularBackgroundDomEl = angular.element('<div modal-backdrop></div>');
                    angularBackgroundDomEl.attr('backdrop-class', modal.backdropClass);
                    backdropDomEl = $compile(angularBackgroundDomEl)(backdropScope);
                    body.append(backdropDomEl);
                }

                if (modalInstance.locked) {
                    modal.classes += ' modal--locked';
                }
                modal.scope.loadedData = typeof(modal.loadedData) === 'undefined' ? true : !!modal.loadedData;
                var angularDomEl = angular.element('<div modal-window></div>');
                angularDomEl
                    .attr({
                        'template-type': modal.templateType,
                        'window-class': modal.windowClass,
                        'class': modal.classes,
                        'size': modal.size,
                        'index': openedWindows.length() - 1,
                        'animate': 'animate',
                        'backdrop': modal.backdrop,
                        'animation-type': modal.animationType,
                        'title': modal.title,
                        'loaded-data': 'loadedData'
                    })
                    .html(modal.content);

                var modalDomEl = $compile(angularDomEl)(modal.scope);
                openedWindows.top().value.modalDomEl = modalDomEl;
                body.append(modalDomEl);
                body.addClass(OPENED_MODAL_CLASS);
                body.css('top', -top + 'px');

            };

            $modalStack.dataDone = function(modalInstance, f, timeout) {
                var modalWindow = openedWindows.get(modalInstance);
                if (modalWindow) {                                                                          // incase concurrence calling, this will auto turn off watch wating data
                    if (!modalWindow.value.modalScope.loadedData && angular.isFunction(f)) {
                        var waitingData = modalWindow.value.modalScope.$watch(_.throttle(function() {
                            $timeout(function() {
                                modalWindow.value.modalScope.$digest();                                         // seem to be a bit hacky, reason for using $digest in this $watch
                            });
                            return f();
                        }, 300), function(val) {
                            if (val) {
                                modalWindow.value.dataDeferred.resolve(true);
                                modalWindow.value.modalScope.loadedData = true;
                                waitingData();
                            }
                        });
                        if (angular.isDefined(timeout) && !isNaN(timeout)) {
                            $timeout(function() {
                                modalWindow.value.dataDeferred.reject(false);
                                waitingData();
                            }, timeout);
                        }
                        modalWindow.value.modalScope.$on('$destroy', function() {
                            waitingData();
                        });
                    }
                }
            };
            $modalStack.close = function(modalInstance, result) {
                var modalWindow = openedWindows.get(modalInstance);
                if (modalWindow) {
                    modalWindow.value.deferred.resolve(result);
                    removeModalWindow(modalInstance);
                }
            };

            $modalStack.dismiss = function(modalInstance, reason) {
                var modalWindow = openedWindows.get(modalInstance);

                if (modalWindow && !modalInstance.locked) {
                    modalWindow.value.deferred.reject(reason);
                    removeModalWindow(modalInstance, reason);
                }
            };

            $modalStack.dismissAll = function(reason) {
                var topModal = this.getTop();
                while (topModal) {
                    this.dismiss(topModal.key, reason);
                    topModal = this.getTop();
                }
            };

            $modalStack.getTop = function() {
                return openedWindows.top();
            };

            return $modalStack;
        }])


// Service Provider
// ----------------------------------------

    .provider('$modal', function() {

        var $modalProvider = {

            options: {
                templateType: 'modal',
                classes: '',
                backdrop: true,
                keyboard: true,
                animationType: 'fadeScale',
                title: null,
                locked: false
            },

            $get: ['$injector', '$rootScope', '$q', '$http', '$templateCache', '$controller', '$modalStack', '$location',
                function($injector, $rootScope, $q, $http, $templateCache, $controller, $modalStack, $location) {

                    var $modal = {};

                    function getTemplatePromise(options) {
                        return options.template ? $q.when(options.template) :
                            $http.get(options.templateUrl, {cache: $templateCache}).then(function(result) {
                                return result.data;
                            });
                    }

                    function getResolvePromises(resolves) {
                        var promisesArr = [];
                        angular.forEach(resolves, function(value) {
                            if (angular.isFunction(value) || angular.isArray(value)) {
                                promisesArr.push($q.when($injector.invoke(value)));
                            }
                        });
                        return promisesArr;
                    }

                    // Open the modal
                    $modal.open = function(modalOptions) {

                        var modalResultDeferred = $q.defer();
                        var modalOpenedDeferred = $q.defer();
                        var modalDataDeferred = $q.defer();
                        var dataDoneFn = function(f, timeout) {
                            if (dataDoneFn.toHaveBeenCalled) {
                                return;
                            }
                            dataDoneFn.toHaveBeenCalled = true;                         // just call once time, should or not
                                                                                        // due multiple call dataDone will be not caused the conflict
                            modalOpenedDeferred.promise.then(function(res) {           // wating for modal initialize
                                if (angular.isFunction(f)) {                            // should call back for result modal in case error throw the then will auto reject,
                                    $modalStack.dataDone(modalInstance, f, timeout);    // don't need to try cactch f
                                }
                            });
                        };
                        dataDoneFn.toHaveBeenCalled = false;

                        //merge and clean up options
                        modalOptions = angular.extend({}, $modalProvider.options, modalOptions);
                        modalOptions.resolve = modalOptions.resolve || {};

                        //prepare an instance of a modal to be injected into controllers and returned to a caller
                        var modalInstance = {
                            result: modalResultDeferred.promise,
                            opened: modalOpenedDeferred.promise,
                            untilData: modalDataDeferred.promise,
                            close: function(result) {
                                $modalStack.close(modalInstance, result);
                            },
                            dismiss: function(reason) {
                                $modalStack.dismiss(modalInstance, reason);
                            },
                            dataDone: dataDoneFn,
                            locked: modalOptions.locked
                        };

                        //verify options
                        if (!modalOptions.template && !modalOptions.templateUrl) {
                            throw new Error('One of template or templateUrl options is required.');
                        }

                        var templateAndResolvePromise =
                            $q.all([getTemplatePromise(modalOptions)].concat(getResolvePromises(modalOptions.resolve)));

                        // resolve the incoming data
                        templateAndResolvePromise.then(function resolveSuccess(tplAndVars) {

                            var modalScope = (modalOptions.scope || $rootScope).$new();
                            modalScope.$close = modalInstance.close;
                            modalScope.$dismiss = modalInstance.dismiss;
                            modalScope.$dataDone = modalInstance.dataDone;

                            var ctrlLocals = {};
                            var resolveIter = 1;

                            // manage the new controllers
                            if (modalOptions.controller) {
                                ctrlLocals.$scope = modalScope;
                                ctrlLocals.$modalInstance = modalInstance;
                                angular.forEach(modalOptions.resolve, function(value, key) {
                                    ctrlLocals[key] = tplAndVars[resolveIter++];
                                });

                                $controller(modalOptions.controller, ctrlLocals);
                            }

                            $modalStack.open(modalInstance, {
                                scope: modalScope,
                                deferred: modalResultDeferred,
                                dataDeferred: modalDataDeferred,
                                loadedData: modalOptions.loadedData,
                                content: tplAndVars[0],
                                backdrop: modalOptions.backdrop,
                                classes: modalOptions.classes,
                                keyboard: modalOptions.keyboard,
                                backdropClass: modalOptions.backdropClass,
                                windowClass: modalOptions.windowClass,
                                windowTemplateUrl: modalOptions.windowTemplateUrl,
                                templateType: modalOptions.templateType,
                                size: modalOptions.size,
                                animationType: modalOptions.animationType,
                                title: modalOptions.title
                            });

                        }, function resolveError(reason) {
                            modalResultDeferred.reject(reason);
                        });

                        templateAndResolvePromise.then(function() {
                            modalOpenedDeferred.resolve(true);
                        }, function() {
                            modalOpenedDeferred.reject(false);
                        });

                        //Set up location watches
                        if (modalOptions.name) {
                            $location.search({'m': modalOptions.name});

                            var unwatch = $rootScope.$watch(function() {
                                return $location.search();
                            }, function(params) {

                                if (!params.m) {
                                    $modalStack.dismiss(modalInstance, 'navigated away');
                                    unwatch();
                                    $location.search({});
                                }

                            });
                        }

                        return modalInstance;

            };


                    return $modal;

                }]

    };

        return $modalProvider;

});
