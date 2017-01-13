
// Newsfeed
// ----------------------------------------

angular.module('ui.newsFeed')


// Blog Post Manage Controller
// ------------------------------------------------

.controller('dashboardDirectoryCtrl', ['$scope', '$routeParams', 'Members', 'mediaQuery', '$timeout', '$modal', '$window',
    function($scope, $routeParams, Members, mediaQuery, $timeout, $modal, $window) {
    
      var isMobile = (function() {
      var mediaSize = mediaQuery.get();
      return (mediaSize === 'mobile' || mediaSize === 'phablet');
    })();

      var optsVals = {
      2: 'name',
      5: 'role',
      1: 'group' 
    };

      var defaults = {
      current: 1,
      size: 30,
      searchOpts: 2,
      searchTerm: '',
      state: 1
    };

      var requestCount = 0;

    // reset the search

      function resetSearch() {
      $scope.page.searching = false;
      $scope.page.searchTermPrev = '';
        //$scope.page.searchOpts = defaults.searchOpts;
      $scope.searchVal = $scope.page.searchTerm = defaults.searchTerm;
      $scope.page.end = false;
    }

    // reset base results

      function resetItems() {
      $scope.page.items = [];
      $scope.page.current = 1;
    }


      function resetFilter() { 
      $scope.filterBy = {
          name: '',
          role: '',
          group: ''
        };
    }


    // Alphabet 

      $scope.chars = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
      $scope.nextChar = null;

    // page object for controller search

      $scope.page = {
      searchOpts: defaults.searchOpts,
      searchTerm: defaults.searchTerm,
      searchTermPrev: '',
      searchOptsName: optsVals[defaults.searchOpts],
      searching: false,
      current: defaults.current,
      state: defaults.state,
      size: defaults.size,
      grandTotal: 0,
      filter: { Fullname : this.searchTerm },
      items: []
    };

    // object to match filters against

      $scope.filterBy = {
      name: '',
      role: '',
      group: ''
    };

    // Run the search on form change

      $scope.searchQuery = function(searchVal) {

      resetFilter();

      var opts = optsVals[$scope.page.searchOpts];

        //set page vars
      $scope.page.searchOptsName = opts;
        
      $scope.filterBy[opts] = searchVal;

        // set up search query string
        // never send more than 3 chars to the server for searching,
        // anything over 3 is searched in the browser

      if (searchVal.length === 1 || searchVal.length === 2) {
          $scope.page.searchTerm = searchVal.substring(0,1);
        
        } else if (searchVal.length >= 3) {
          $scope.page.searchTerm = searchVal.substring(0,3);

        } else { 
          resetSearch();
          $scope.page.current = 1;

            // get items from server
          fetchItems(1);
        }

      if ($scope.page.searchTerm !== $scope.page.searchTermPrev) {

          $scope.page.searchTerm = $scope.page.searchTerm.trim();
          $scope.page.current = 1;
            // get items from server
          fetchItems(1);

          $scope.page.searchTermPrev = $scope.page.searchTerm;
        }

    };

    // override the contents of the search form

      $scope.setSearchQuery = function(searchTerm, searchOpts, updateInput) {
      resetSearch();

      if (updateInput) {
          $scope.searchVal = searchTerm;
        }

      $scope.page.items = [];
      $scope.page.searchOpts = searchOpts;
      $scope.searchQuery(searchTerm);
    };   


    // get next page

      $scope.fetchNext = function() {
        
      if( ($scope.page.total / $scope.page.size) > $scope.page.current && !$scope.page.loading ) {
            // get next page
          $scope.page.current++;
          fetchItems($scope.page.current);
        } else {
            // end of page
        }
    };

    // Get search items
    // ------------------------------------------------

      var fetchItems = function(pageNum) {
      requestCount++;

      pageNum = pageNum || 1;
      $scope.page.loading = true;

      var thisRequest = requestCount;

      if (pageNum === 1) {
          $window.scrollTo(0, 0);
          $scope.page.end = false;
        }

        // query service for items
      Members.getProfiles($scope.page.current, $scope.page.size, $scope.page.searchOpts, $scope.page.searchTerm, $scope.page.state).then(function( response ) {

          if (thisRequest < requestCount) {
              return;
            }

            // Pagination 
          var pagination = response.headers('x-pagination');

          if( pagination ) {
              pagination = angular.fromJson(pagination);

              $scope.page.size = pagination.PageSize || defaults.size;
              $scope.page.total = pagination.TotalCount;
              $scope.page.totalPages = pagination.TotalPages;
              $scope.page.grandTotal = $scope.page.grandTotal || pagination.TotalCount;
            }

            // SUCCESS
            if (response.data.length) {
                // fix can't filter on null value
                response.data = response.data.filter(function(item) {
                    item.DefaultGroupName = item.DefaultGroupName || '';
                    item.Fullname = item.Fullname || '';
                    item.RoleDescription = item.RoleDescription || '';
                    return item;
                });
            }
          if (pageNum > 1) {
                // if its another page, append it
              $scope.page.items = $scope.page.items.concat(response.data);

            } else {
                // if its the first page, replace data
              $scope.page.items = response.data;

            }
          $scope.page.loading = false;
          $scope.page.error = false;
          $scope.page.hasData = $scope.page.items.length ? true: false;

            // get more pages if possible limit to max 4
          if ($scope.page.searchTerm.length >= 3 && pageNum < 4) {
              $scope.fetchNext();
            }

        }, function(response) {
            // ERROR
          $scope.page.loading = false;
          $scope.page.error = true;
          $scope.page.hasData = $scope.page.items.length ? true: false;

        });
    };

    // initial fetch
      fetchItems(1);


    // Member details
    // ------------------------------------------------

      $scope.showDetails = function(member) {

      var modal = $modal.open({
          templateType: 'drawer',
          templateUrl: '/interface/views/common/partials/vcard.html',
          controller: SHRP.ctrl.ModalVcardCTRL,
          name: 'details',
          resolve: {
              items: function() {
                  return member;
                }
            }
        });
    };

    // Directory filtering 
    // ------------------------------------------------

      $scope.openSearchFilters = function(member) {

      var modal = $modal.open({
          templateType: 'drawer',
          templateUrl: '/interface/views/newsfeed/partials/search-filter-drawer.html',
          controller: SHRP.ctrl.ModalSearchCTRL,
          title: 'Search directory',
          name: 'search',
          resolve: {
              searchOpts: function() {
                  return $scope.page.searchOpts;
                },
              searchTerm: function() {
                  return $scope.searchVal;
                }
            }
        });
    
      modal.result.then(function(search) {

          resetSearch();

            // Update the view modal with the search term returned from the modal
          $scope.searchVal = search.searchTerm;

            //$scope.page.searchTerm = search.searchTerm;
          $scope.page.searchOpts = search.searchOpts;

            // Run the search with the new term returned from the modal
          $scope.searchQuery(search.searchTerm);

        }, function() {
            
        });

    };

    

    }]);
