
// Newsfeed
// ----------------------------------------

angular.module('ui.newsFeed')


// Blog Post Manage Controller
// ------------------------------------------------

    .controller('dashboardNewsCtrl', ['$scope', '$routeParams', 'BlogService', 'Members', '$timeout', 'Paths', '$rootScope', '$modal', '$location',
        function($scope, $routeParams, BlogService, Members, $timeout, Paths, $rootScope, $modal, $location) {
            $scope.cardCtrl = {};
            $scope.search = {
                categoryId: $routeParams.category,
                title: $routeParams.title,
                dateFrom: $routeParams.dateFrom,
                dateTo: $routeParams.dateTo
            };
            $scope.loading = true;

            $scope.getBlogFeed = function(page, pageSize, orderBy, ascending, filterBy) {

                return BlogService.getBlogs({
                    page: page || 1,
                    pageSize: pageSize || 32,
                    filterBy: filterBy || false,
                    categoryId: $scope.search.categoryId,
                    title: $scope.search.title,
                    dateFrom: $scope.search.dateFrom ? moment($scope.search.dateFrom).format('YYYY-MM-DD') : '',
                    dateTo: $scope.search.dateTo ? moment($scope.search.dateTo).format('YYYY-MM-DD') : ''
                }).then(function(res) {

                    $scope.userCan = res.data.permissions;

                    res.data = res.data.items;
                    return res;
                });
            };


            // Categories
            // ------------------------------------------------

            // get Categories list
            BlogService.getCategories(1, 50).then(function(response) {
                $scope.categories = response.data.BlogCategorySummaryItemResults.map(function(category) {
                    return category.BlogCategorySummary;
                });
                setPageTitle(); // Set the page title on page load
            });

            $scope.$watch('search', _.debounce(function(oldVal, newVal) { // Debounce by 500ms to limit searches fired while input is entered to the title field     

                if (newVal !== oldVal) {
                    if (angular.isFunction($scope.cardCtrl.resetCardLayout)) {
                        $scope.cardCtrl.resetCardLayout();
                    }
                    $location.search({
                        'category': $scope.search.categoryId ? $scope.search.categoryId : null,
                        'title': $scope.search.title ? $scope.search.title : null,
                        'dateFrom': $scope.search.dateFrom ? moment($scope.search.dateFrom).format('YYYY-MM-DD') : null,
                        'dateTo': $scope.search.dateTo ? moment($scope.search.dateTo).format('YYYY-MM-DD') : null
                    });
                    $scope.page.search(); // This method is defined within the pagination directive
                    $scope.$apply();

                }
            }, 500), true);

            // Update the page title as categories are changed    
            $scope.$watch('search.categoryId', function() {
                setPageTitle();
            });

            // Set the page title based on the selected category
            function setPageTitle() {
                angular.forEach($scope.categories, function(value) {
                    if (value.Id === parseInt($scope.search.categoryId)) {
                        $rootScope.title = 'News - ' + value.CategoryName;
                    }
                });
            }

            // Current Member
            // -----------------------------------------------
            Members.me().then(function(res) {

                $timeout(function() {
                    $scope.currentUser = res.data;
                });

            });

        }]);
