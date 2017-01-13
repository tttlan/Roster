angular.module('ui.profile')

.filter('state', function() {
    return function(input, modelData) {
        var returnVal;
        angular.forEach(modelData.StateRegion, function(value, key) {
            if (value.Value === input) {
                returnVal = value.Label;
            }              
        });
        return returnVal;        
    };
})
.filter('feedBack', function() {
  return function(arr, f) {
    return (arr || []).filter(function(item) {
        if(typeof(f) === 'undefined' || f === -1) { return true ;} 
        return item.Feedback === f;
    });
  };
});