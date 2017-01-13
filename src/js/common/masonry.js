
angular.module('ui.common.directives')

    /*
     *
     *
     */

    // Directive to create a masonry layout
    // ------------------------------------------------

    .directive('masonry', ['$q', 'onResize', '$timeout', '$rootScope', function($q, onResize, $timeout, $rootScope) {

        Array.prototype.min = function() { return Math.min.apply({}, this); };
        Array.prototype.max = function() { return Math.max.apply({}, this); };

        function getSmallestColumnIndex(columnCount, columns) {
            var ind;

            for (var n = columnCount - 1; n > -1; n--) {
                if (columns[n] === columns.min()) {
                    ind = n;
                }
            }

            return ind;
        }

        return {
            restrict: 'A',
            templateUrl: function(tElement, tAttrs) {
                return tAttrs.templateUrl;
            },
            scope: {
                cards: '=masonry',
                cardLimit: '=limitTo',
                cardCtrl: '=cardCtrl'
            },
            controller: function($scope, $attrs) {
                $scope.cardCtrl = {
                    resetCardLayout: resetCardLayout,
                    shouldRenderMasonry: shouldRenderMasonry
                };
                var that = this,
                    cardsReady = 0, lastCards, shouldRender = true; // alway render in the first time

                var isLoaded = true;

                var lockShouldRender;

                resetCardLayout();

                function shouldRenderMasonry() {
                    return shouldRender;
                }
                function resetCardLayout() {
                    // in case multiple click or reset, may be it will be take a 562.5ms for last click have the items
                    // for example data length such as 0 -> 1 -> 1 -> 0 will loss 562.5ms to waiting without do anything instead of no waiting
                    // But have no problem if 1 -> 0 -> 1, 1-> 0 -> 0, 1-> 1 -> 1 it always is exactly waiting time.
                    cardsReady = 0;
                    lastCards = $scope.cards;
                    shouldRender = true;
                    isLoaded = true;

                    if (lastCards && lastCards.length > 0) {
                        shouldRender = false;
                        lockShouldRender = false;
                        var gotoDataPostDigest = $scope.$watch(function() {   // this will be go to watch of the ng-repeat, so should be go with cards
                            return $scope.cards;
                        }, function(newVal, oldVal) {
                            if (newVal && newVal.length === 0) {
                                $timeout(function() {
                                    $rootScope.$$postDigest(function() {
                                        $timeout(function() {
                                            // If have no lock, it is falsy to assign to shouldRender
                                            // Javascript is single thread for function stack, it it not sure about the variable is used outside, for
                                            // example sometime have shouldRender is true for view rendering
                                            if (!lockShouldRender) {
                                                shouldRender = true;
                                            }
                                        }, 562.5);
                                    });
                                }, 0, false);
                                gotoDataPostDigest();
                            }
                        });
                    }
                }
                function getCardCount() {
                    return Math.min($scope.cardLimit, $scope.cards.length);
                }
                this.notifyToChildren = function() {
                    $scope.$broadcast('shouldRenderCard');
                };
                this.ready = function() {

                    // always disabled view ? . No, incase shouldRender is true we assign and have useless pending time
                    // should should be keep the old value and the browser can show it
                    cardsReady++;
                    if (lastCards && lastCards.length > 0 && (!lockShouldRender || shouldRender)) {
                        // always get lock and assign shouldRender is falsy
                        // in case of this render is longer 562.5ms, it will have problem
                        // but have no way to handle that bug
                        lockShouldRender = true;
                        shouldRender = false;
                    }
                    if (cardsReady === getCardCount()) {
                        if (!shouldRender) {
                            $rootScope.$$postDigest(function() {
                                // this is a bit crazy, but this how to caculated animation for card leaving
                                // this value may is diffrent from other browser. This value is only for one card item
                                // may be it make take more time to finish it
                                // or may be we need a event for animation
                                // this should be refactored to make a cross browser
                                // we should be caculation it based the following caculation
                                // total = (delayAnimation + durationAnimation + StaggerTime + LoadingInnerBufferTime)
                                $timeout(function() {
                                    $scope.layout($scope.cards, 0);
                                    shouldRender = true; // may be cause a bug in case scroll or load data faster this line, because it will
                                    // still call post digest, but this will not happen
                                }, 562.5);
                            });
                        }
                        else if (isLoaded) {             // should be refactored here what is for isResetLayout
                            $scope.layout($scope.cards, 0);
                            isLoaded = false;
                        }
                        else {
                            $scope.layout($scope.cards);
                        }
                    }
                };

                function resize() {

                    if (typeof $scope.layout === 'function') {
                        $scope.layout($scope.cards, 0);
                    }

                }
                onResize.register(resize);

                $scope.$on('$destroy', function() {
                    onResize.deregister(resize);
                });
            },

            link: function(scope, element, attrs, controller) {
                var $element = angular.element(element),
                    $items,
                    itemWidth,
                    columnCount,
                    columns = [],
                    offsetCount = 0;

                function setWidthsAndColumns() {

                    itemWidth = $items.eq(0).outerWidth();
                    columnCount = Math.floor($element.width() / itemWidth);
                    columns = [];

                    for (let i = 0; i < columnCount; i++) {
                        columns[i] = 0;
                    }
                }

                scope.layout = function(cards, forceOffset) {
                    $items = $element.children();
                    $element.removeClass('start-transition');

                    if (forceOffset > -1) {
                        offsetCount = forceOffset;
                        setWidthsAndColumns();
                    }

                    var this_col, i;

                    if (!itemWidth) {
                        setWidthsAndColumns();
                    }
                    for (var j = offsetCount; j < cards.length; j++) {
                        var card = cards[j];

                        if (columnCount === 1) {
                            card.position = {
                                position: 'relative',
                                top: 0,
                                left: 0
                            };
                        } else {

                            var $item = $items.eq(j),
                                itemHeight = $item.outerHeight(),
                                itemsColumn = getSmallestColumnIndex(columnCount, columns);

                            card.position = {
                                position: 'absolute',
                                top: columns[itemsColumn],
                                left: (itemWidth * itemsColumn) / $element.width() * 100 + '%',
                                'z-index': Math.abs(itemsColumn - 4)
                            };

                            columns[itemsColumn] += itemHeight;

                        }
                    }
                    offsetCount = $items.length;
                    $element.height(columns.max()).addClass('start-transition');
                    controller.notifyToChildren();
                };

            }

        };

    }])

    .directive('masonryBrick', ['$timeout', '$animate', function($timeout, $animate) {
        return {
            restrict: 'EA',
            require: '^masonry',
            link: function(scope, element, attrs, controller) {
                scope.$on('shouldRenderCard', function() {
                    scope.isVisible = true;
                });
                $timeout(function() {
                    controller.ready();
                });
            }
        };
    }]);
