angular.module('ui.recruit.onboard')
  .filter('onboardOrderBy', function() {
    return function(onboards, predicate, isReversed) {
      const isBulk = _.any(onboards) ? !!_.first(onboards).BulkOnboardingSummary : false;
      let lodash = _(onboards);
      let sortFn = null;

      switch (predicate) {
        case 'name':
          sortFn = o => isBulk ?
            o.BulkOnboardingSummary.OnboardRole.Description.toLowerCase() :
            o.OnboardingSummary.CandidatePersonalInfo.FirstName.toLowerCase();
          break;
        case 'elapsed':
          sortFn = o => isBulk ? 
            o.BulkOnboardingSummary.CreatedDate :
            o.OnboardingSummary.CreatedDate;
          break;
        case 'created':
          sortFn = o => isBulk ? 
            o.BulkOnboardingSummary.CreatedDate :
            o.OnboardingSummary.CreatedDate;
          break;
        case 'effective':
          //only for single
          sortFn = o => isBulk ? o :
            o.OnboardingSummary.CommencementDate;
          break;
        case 'role':
          sortFn = o => isBulk ? o.BulkOnboardingSummary.OnboardRole.Description.toLowerCase() :
            o.OnboardingSummary.OnboardRole.Description.toLowerCase();
          break;
        case 'type':
          //only for single
          sortFn = o => isBulk ? o :
            o.OnboardingSummary.IsPromotion;
        case 'candidates':
          //only for bulk
          sortFn = o => isBulk ? 
            o.BulkOnboardingSummary.NumberOfOnboard : o;
          break;
        default:
          sortFn = o => o;
          break;
      }

      lodash = lodash.sortBy(sortFn);
      if (isReversed) lodash = lodash.reverse();

      return lodash.value();
    };

  });