(() => {

  /**
   * Directive for searching applicants.
   * The list where you want selected applicants to be stored: selected-list
   *
   * <applicant-search-select job-id="1" selected-list="list">
   * </applicant-search-select>
   */

  let applicantSearchSelect = (JobApplicantListService) => {

    let link = (scope) => {

      scope.applicantResults = [];
      scope.cachedList = scope.cachedList || [];
      scope.cachedList = scope.selectedList || [];
      scope.isSelected = (applicant) => angular.isDefined(findById(applicant.id));
      scope.clearSearch = () => scope.searchQuery = "";
      let findById = (id, list=scope.selectedList) => _.find(list, { id });
      let xor = (listA, listB) => {
        return _.filter(listA, (e) => !_.any(listB, {id: e.id }));
      };
      let sortListBySelected = (list) => {
        return _.sortBy(list, (a) => !scope.isSelected(a));
      };

      let setDisplayList = () => {
        scope.applicantResults = angular.copy(scope.selectedList);
        if (_.isEmpty(scope.searchQuery)) {
          return true;
        }

        scope.applicantResults.push(...xor(scope.cachedList, scope.selectedList ));
        scope.applicantResults = sortListBySelected(scope.applicantResults);
        return false;
      };

      scope.toggleSelect = (applicant) => {
        const removedApplicant = _.remove(scope.selectedList, { id: applicant.id });
        if (_.isEmpty(removedApplicant)) {
          scope.selectedList.push(applicant);
        }
        setDisplayList();
      };

      //listeners
      scope.$watch('searchQuery', search);
      scope.$watch('cachedList', setDisplayList);

      function search(query) {
        if (setDisplayList()) {
          return;
        }

        scope.loading = true;
        query = query.toLowerCase();

        // These two models can vary a bit, so we compare only by id
        JobApplicantListService.searchJobApplications({
              jobId: scope.jobId,
              status: scope.statusFilter,
              candidateName: query
            })
            .then((response) => {
              //scope.applicantResults.push(...xor(response.data, scope.applicantResults));
              scope.cachedList = response.data;
              //scope.cachedList.push(...xor(response.data, scope.cachedList));
              scope.loading = false;
            });
      }

      scope.applicantResults.push(...xor(scope.selectedList, scope.cachedList));
    };

    return {
      restrict: 'E',
      scope: {
        selectedList: '=',
        cachedList: '=?',
        jobId: '=',
        limitTo: '@',
        statusFilter: '=?',
      },
      template: `
      <div class="applicant-search">
        <div class="form__field">
          <label class="field__after icon--cross" ng-click="clearSearch()" ng-show="searchQuery.length"></label>
          <input type="text" placeholder="Type to search and add applicants" 
            ng-model="searchQuery" ng-model-options="{ debounce: 250 }" />
        </div>
        <ul class="applicant-search__results">
          <li ng-repeat="applicant in applicantResults"
          ng-click="toggleSelect(applicant)" 
          ng-class="{'applicant-search__results--selected': isSelected(applicant)}">
            <div class="name-tag">
              <round-badge name-color-hash-race="applicant.hashedEmail" size="tiny">{{applicant.initials}}</round-badge>
              {{applicant.fullName}}
              <span class="remove-icon" ng-class="{'icon--round-minus': isSelected(applicant)}"></span>
            </div>
          </li>
        </ul>
        <loader ng-show="loading" align="center">
          searching for more...
        </loader>
      </div>
    `,
      link,
    };
  };

  angular.module('ui.recruit.jobs')
      .directive('applicantSearchSelect', ['JobApplicantListService', applicantSearchSelect]);

})();