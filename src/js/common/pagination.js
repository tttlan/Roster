angular.module('ui.common')

.directive('paginate', ['$timeout', '$window', 'mediaQuery', 'onScroll', '$parse', '$q', '$route',
    function($timeout, $window, mediaQuery, onScroll, $parse, $q, $route ) {

      return {
      priority: 100,
      compile: function(element, attrs) {
            var pageModel = attrs.pageModel;
            
          var pageCount = Number(attrs.pageSize);
          var bufferSize = Number(attrs.bufferSize) || 4;
          var isMobile = (function() {
              var mediaSize = mediaQuery.get();
              return (mediaSize === 'mobile' || mediaSize === 'phablet');
            })();

          var buildHtml = function() {
              var html = '<reload action="page.setFilter()" ng-show="page.error && !page.loading" />';
                if(pageModel) {
                    html = '<reload action="' + pageModel + '.setFilter()" ng-show="'+ pageModel +'.error && !'+ pageModel +'.loading" />';
                }

                // If we need to paginate on scroll
                if( attrs.paginateOnScroll || attrs.paginateOnManualScroll) {
                    if(pageModel) {
                        if(attrs.paginateOnManualScroll) {
                            html += '<loader ng-hide="'+ pageModel + '.finished || !'+ pageModel + '.loading" size="large" align="center"></loader>';
                        }
                        else {
                            html += '<loader ng-hide="'+ pageModel + '.finished" size="large" align="center"></loader>';
                        }
                    }
                    else {
                  html += '<loader ng-hide="page.finished" size="large" align="center"></loader>';
                    }
                } else if(!attrs.disablePaging) {
                    if(pageModel) {
                        // This is not dependent on template, so we didn't take care about template cache
                        html += `<div class="paging" 
                            ng-show="${pageModel}.total > 0 && !${pageModel}.loading && !${pageModel}.error">
                            <pagination page="${pageModel}.current" 
                                total-items="${pageModel}.total" 
                                items-per-page="${pageModel}.size" 
                                max-size="5" 
                                ng-show="${pageModel}.loaded && !${pageModel}.error && ${pageModel}.totalPages > 0" 
                                ng-class="{'is--disabled-pagination': ${pageModel}.paginationDisabled}"/></div>`;
                    }
                    else {
                        html += `<div class="paging" ng-show="page.total > 0 && !page.loading && !page.error">
                            <pagination page="page.current" 
                                total-items="page.total" 
                                items-per-page="page.size" 
                                max-size="5" 
                                ng-show="page.loaded && !page.error && page.totalPages > 0" 
                                ng-class="{'is--disabled-pagination': paginationDisabled}"/></div>`;
                    }                    
                }

              return html;            
            };

          element.append( buildHtml() );
            
          return function(scope, element, attrs) {
                var collectionName = attrs.collectionName || 'items';
                function merge(object1, object2) { // replace in angularjs 1.4
                    for (var prop in object2) {
                        object1[prop] = object2[prop];
                    }
                }
                var model;                                      
                if(attrs.pageModel) {
                    model = $parse(attrs.pageModel)(scope);                 // how about page predefined model, undefined model or free style model
                    //scope.$watch(model, function() { });
                }
                else {
                    scope.page = scope.page || {};
                    model = scope.page;
                }
                model[collectionName] = model[collectionName] || [];
                merge(model, {
                  current: 1,
                  size: pageCount,
                  total: -1,
                  totalPages: 0,
                  loading: false,
                  loaded: false,
                  finished: false,
                    update: update,
                    refresh: refresh,
                    reloadEntirePage: reloadEntirePage,
                    refreshError: false,
                    refreshing: false,
                  error: false,
                    requestCount: 0,
                    filter: attrs.filterBy ? attrs.filterBy : attrs.filterBy === '' ? '' : false,
                  orderBy: attrs.orderBy || false,
                  orderAsc: true,
                  showing: pageCount,
                  next: function() {
                        if( (model.total / model.size) > model.current && !model.loading) {
                            model.current++;
                            if(model === scope.page) {
                          scope.hidePagination = false;
                        }
                            else {
                                model.hidePagination = false;
                            }
                        }
                        if(scope.page === model) {
                      if(scope.paginationDisabled) {
                                if(model.showing >= model[collectionName].length) {
                              $timeout(function() {
                                  scope.hidePagination = true;
                                });
                            }
                        }
                        }
                        else {
                            if(model.paginationDisabled) {
                                if(model.showing >= model[collectionName].length) {
                                    $timeout(function() {
                                        model.hidePagination = true;
                                    });
                                }
                            }
                        }
                    },
                  setFilter: function(filterBy) {
                        model.filter = filterBy || '';
                        model.current = 1;
                      update();
                    },
                    search: function() {
                        reset();                                               
                    },
                  setOrderBy: function(orderBy) {
                        //If the select the same order by, then toggle Acending Flag, otherwise, it's false
                        model.orderAsc = ( model.orderBy === orderBy ) ? !model.orderAsc : false;
                        model.orderBy = orderBy;
                        model.current = 1;
                      update();
                    }
                });

                var getItems = scope[attrs.paginate];

                var preload = {
                    buffer: bufferSize,                // get 4 pages loaded in advance
                    current: 0,                        // current preloads called
                    pageSize: bufferSize * pageCount,  // preload page size
                    totalPages: -1,                     // amount of pages we can call
                    refreshCount: 0,                  // number of last preload page to be updated from server in case delete the pagination's item
                    refreshSize: 0
                };


                // Reset all vars / scope vars so we are read for a new search
                function reset() {
                    
                    //scope.$apply(function(){
                        model[collectionName] = [];
                        model.current = 1; // There is a watch placed on page.current, updating this value will trigger a server fetch / update
                                           // this will not working in case paging without scrolling at current page is 1, watch can not detect changes
                                           // should be change this
                        model.total = -1;
                        model.totalPages = 0;
                        model.finished = false;
                        model.loading = false;
                        model.loaded = false;
                        model.refreshError = false;
                        model.refreshing = false;
                        preload.current = 0;
                    //});
                }
                function scrollToBottom() {
                    $timeout(function() {
                        if(attrs.paginateOnManualScroll && preload.current > 2) { // not scroll on 2 first page
                            window.scrollTo(0,document.body.scrollHeight);
                        }
                    }, 100);
                }
                if (attrs.autoUpdate) {
                    scope.$watch(function() {                                                      // the added new attribute will not impact to dashboard
                        return model[collectionName].length;                                        // current dashboard's feeds was buggy of redundant feed whenever add new item
                    }, function(newVal, oldVal) {                                                  // and lack of feeds whenever remove item at next loading preload buffer
                        var pS = model.size;                                                        // this will be auto update current page whenever the number of items modulo on page size isn't = 0
                                                                                                    // for scroll update we will remove or refetch the new items from databse for preload buffer
                        if(attrs.paginateOnScroll || attrs.paginateOnManualScroll) {                // for paging, we will refresh current page
                            pS = preload.pageSize;
                        }
                        if (newVal % pS !== 0 && !model.finished) {
                            if (!attrs.paginateOnScroll && !attrs.paginateOnManualScroll) {
                                update();
                            }
                            else if (newVal > oldVal) {
                                model[collectionName].splice(model[collectionName].length - (newVal - oldVal), (newVal - oldVal)); // reject the old value and new value
                            }
                            else if (newVal < oldVal) {
                                model.refreshCount = Math.ceil((oldVal - newVal) / preload.pageSize);
                                model.refreshCount = preload.current > model.refreshCount ? model.refreshCount : preload.current;
                                model.refreshSize = oldVal - newVal;
                                refresh();
                            }
                        }
                    });
                }
                function reloadEntirePage() {
                    $route.reload();
                }
                function refresh() {
                    if (attrs.paginateOnScroll || attrs.paginateOnManualScroll) {
                        if (model.refreshCount > 0 && model.refreshSize > 0) {
                            syncLastPages(function(refreshedItems) {
                                model[collectionName] = model[collectionName].concat(refreshedItems.splice(refreshedItems.length - 1, model.refreshSize));
                                model.refreshCount = 0;
                                model.refreshSize = 0;
                                model.finished = model.total <= model[collectionName].length;
                            });
                        }
                    }
                    else {
                        update();
                    }
                }
                function syncLastPages(returnFunc) {
                    if (model.refreshCount > 0) {                                                   // sync last pages from server
                        var promiseList = [];
                        if (typeof getItems === 'function') {                                       // errors occured if have not getItems on remove items
                            for (var i = model.refreshCount - 1; i >= 0; i--) {
                                promiseList.push(getItems(preload.current - i, preload.pageSize, model.orderBy, model.orderAsc, model.filter));
                            }
                        }
                        $q.all(promiseList).then(function(res) {
                            model.refreshError = false;
                            model.refreshing = true;
                            if (typeof returnFunc === 'function') {
                                var items = [];
                                for (var j = 0; j < res.length; j++) {
                                    items = items.concat(res[j].data); 
                                    if (j === res.length - 1) {
                                        checkForResponseHeaders(res[j]);
                                        var pagination = res[j].headers('x-pagination');

                                        updatePaginationData(pagination, res[j].data.length); // reupdated pagination

                                        model.finished = model.total <= model[collectionName].length;
                                        model.refreshing = false;
                                    }
                                }
                                returnFunc(items);
                            }
                        }, function(e) {
                            model.refreshError = true;
                            model.refreshing = false;
                        });
                    }
                }
              function update() {

                    if(attrs.paginateOnScroll || attrs.paginateOnManualScroll) {

                        if(model.loading) {
                          return false;
                        }
                        model.loading = true;

                        // Server fetch
                      if( needServerFetch() ) {
                            if( !model.loaded || (preload.current * preload.buffer === model.current) ) {

                              preload.current++;
                                
                                //If we have no more cached items, we need to block update till the server comes back
                              fetchItems(preload.current, preload.pageSize, function(fetchedItems) {
                                    model[collectionName] = model[collectionName].concat(fetchedItems);
                                  updateViewFromCache();
                                });

                            } else {
                                
                              preload.current++;
                                
                                //we still have pages up our sleeve, so lets async the request
                              fetchItems(preload.current, preload.pageSize, function(fetchedItems) {
                                    model[collectionName] = model[collectionName].concat(fetchedItems);
                              updateViewFromCache();
                                    scrollToBottom();
                                });
                            }


                        } else {
                            // update from cache
                          updateViewFromCache();
                            scrollToBottom();
                        }

                    } else {
                        model.loading = true;

                        //For Pagination

                        //block update till server returns
                        fetchItems(model.current, model.size, function(data) {
                            model[collectionName] = data;
                            //element[0].scrollIntoView( true );
                          $window.scrollTo(0, 0);
                          updateLoaders();
                        });
                    }
                }

              function needServerFetch() {
                    
                    var withinPreloadBuffer = model.showing + preload.pageSize > model[collectionName].length;
                    var itemsLeft = model[collectionName].length !== model.total;
                  return withinPreloadBuffer && itemsLeft;
                }

              function updateViewFromCache() {
                    
                    // Updates limitTo=
                    model.showing = model.showing + model.size;                    
                  updateLoaders();
                }

              function updateLoaders() {
                    model.loading = false;
                    model.loaded = true;
                    model.error = false;

                    //If we just have the first page, lets get some more
                    if(model.current === 1 && (attrs.paginateOnScroll || attrs.paginateOnManualScroll)) {
                        model.current = 2;
                    }
                }

              function checkForResponseHeaders(response) {
                if (angular.isFunction(response.headers) === false) {
                    throw new Error('headers function is missing.');
                  }
              }

              function fetchItems( pageNum, pageSize, returnFunc ) {

                    model.requestCount++;

                    var thisRequest = model.requestCount;

                    if( typeof getItems === 'function' ) {
                        
                        model.loading = true;
                               
                        getItems(pageNum, pageSize, model.orderBy, model.orderAsc, model.filter).then(function( response ) {
                            if (thisRequest < model.requestCount) {     // thisRequest count to prevent search key getting too fast
                                return;                                 // don't need a max value for this, a person can request page upto 1000 times/day
                                                                        // this addition will not cause bug:
                                                                        // + paging without scrolling will not update pagination's old data , it can still be accepted
                                                                        // + paging with scrolling : anyone can scroll two fast will cause old data is not loaded, and lack of data. But
                                                                        //   this is very hard to happen in normal case : scroll 20 element + next 20 element with time to get data is longer time to scroll through 20 element.
                            }
                              
                              checkForResponseHeaders(response);

                              var pagination = response.headers('x-pagination');

                              updatePaginationData( pagination, response.data.length );
                                
                              if( typeof returnFunc === 'function' ) {
                                  returnFunc(response.data);
                                }
                            model.loading = false;
                            model.finished = model.total <= model[collectionName].length;
                        }, function( response ) {
                            //if (model.refreshCount > 0) {     // don't need to using with refresh pagination without scroll
                            //    model.refreshError = true;
                            //}
                            model.loading = false;
                            model.error = true;
                            model.finished = true;
                        });
                    }
                }

              function updatePaginationData( pagination, numberOfItemsReturned ) {
                  if( pagination ) {
                      pagination = angular.fromJson(pagination);
                        model.total = pagination.TotalCount;
                        model.totalPages = Math.ceil(pagination.TotalCount / model.size);
                      preload.totalPages = pagination.TotalPages;

                    } else {
                        
                        var pageMultiplier = (attrs.paginateOnScroll || attrs.paginateOnManualScroll)? 4 : 1,
                        currentLoaded = (attrs.paginateOnScroll || attrs.paginateOnManualScroll) ? preload.current : model.current;

                        // For Andriod browsers and their inability to accept custom-headers, this is failed for profile note with only 1 at buffer size
                        var supposedPageSize = model.size * pageMultiplier;
                        
                        if(model === scope.page) {
                      scope.paginationDisabled = true;
                        }
                        else {
                            model.paginationDisabled = true;
                        }
                                                
                        if(supposedPageSize === numberOfItemsReturned || ((attrs.paginateOnScroll || attrs.paginateOnManualScroll)&& numberOfItemsReturned !== 0) ) {
                            
                            model.total = supposedPageSize * currentLoaded + 1;
                            model.totalPages = currentLoaded * pageMultiplier + 1;
                          preload.totalPages = currentLoaded + 1;

                        } else {
                            if(attrs.paginateOnScroll || attrs.paginateOnManualScroll) {
                                model.totalPages = model.current;
                            }
                        }
                    }                    
                }

                scope.$watch(
                  function() { return model.current; },
                  function(newValue, oldValue) {
                    update();
                    if ( newValue !== oldValue ) { // should be check ?
                      
                    }
                  }
                );
                //scope.$watch('page.current', update);

                // On scroll and not mobile, let's set up triggering update on scroll
              if(attrs.paginateOnScroll) {
                    //set up on paginate on scroll
                  var loadingScroll = false;
                  var regInd = onScroll.register(function(scrollPos) {
                        
                      if(element[0].getBoundingClientRect().bottom <= window.innerHeight ) {

                          if(loadingScroll) {
                              return;
                            }
                          loadingScroll = true;

                          $timeout(function() {
                                model.next();
                              loadingScroll = false;
                            });
                        }
                    });

                    //destory event
                  scope.$on('$destroy', function() {
                      onScroll.deregister(regInd);
                    });
                }
            };
        }
    };
    }])

.controller('PageCtrl', ['$scope', 'TrainingSubjects', function($scope, TrainingSubjects) {

  $scope.getSubjects = function(page, pageSize, orderBy, filterBy) {
        
      return TrainingSubjects.get(page, pageSize, orderBy, filterBy);    
    };
}])


.config(function(paginationConfig) {

  paginationConfig.nextText = 'next';
  paginationConfig.previousText = 'prev';
    
})

.run(function($templateCache) {

  $templateCache.put('template/pagination/pager.html', 
        '<div class="pagination">' +
            '<ul class="pagination__pages">' +
              '<li><a href ng-click="selectPage(page - 1)" ng-class="{\'is--disabled\': page === 1, previous: align}"><i class="icon--left"></a></li>' +
              '<li><a href ng-click="selectPage(page + 1)" ng-class="{\'is--disabled\': page === totalPages, next: align}"><i class="icon--right"></a></li>' +
            '</ul>' +
        '</div>');
  $templateCache.put('template/pagination/pagination.html',
        '<div class="pagination">' +
            '<ul class="pagination__pages" ng-show="totalPages > 1">' +
              '<li class="pagination__page" ng-repeat="page in pages track by $index" ng-class="{\'is--prev\': page.text==\'prev\', \'is--next\': page.text==\'next\'}">' +
                '<a href ng-click="selectPage(page.number)" ng-class="{\'is--disabled\': page.disabled, \'is--active\': page.active}">' +
                    '<span class="is--prev__text" ng-if="page.text == \'prev\'"><i class="icon--left" /><em> Prev</em></span>' +
                    '<span class="is--next__text" ng-if="page.text == \'next\'"><em>Next </em><i class="icon--right" /></span>' +
                    '<span ng-if="page.text !== \'prev\' && page.text !== \'next\'">{{page.text}}</span>' +
                '</a>' +
                '</li>' +
            '</ul>' +
            '<div class="pagination__count">Displaying <span ng-show="totalPages > 1">{{ (page - 1) * itemsPerPage + 1 }} - </span>{{ (page * itemsPerPage) < totalItems ? page * itemsPerPage : totalItems }} of {{ totalItems }}</div>' +
        '</div>');
 
});