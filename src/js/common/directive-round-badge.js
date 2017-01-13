angular.module('ui.common').directive('roundBadge', () => {
  /**
   * random color based of hash:                    <round-badge name-color-hash="[hash value]">JS</round-badge>
   * Random color based off Hash with Race Checker: <round-badge name-color-hash-race="[hash value]">JS</round-badge>
   * size:                                          <round-badge color-name="pink" size="small">JS</round-badge>
   */
  let linkFn = (scope, elem, attrs) => {
    if(scope.nameColorHash) {
      elem.css('background',  hexToColor(scope.nameColorHash));
    } else if(scope.nameColorHashRace !== 'undefined') {
      let racing = scope.$watch('nameColorHashRace', (newVal) => {
        if(newVal) {
          elem.css('background', hexToColor(newVal));
          racing();
        }
      });
    } else {
      elem.css('background', '#000000');
    }

    if(scope.size) {
      elem.addClass(`round-badge--${scope.size}`);
    } else {
      elem.addClass(`round-badge--small`);
    }
  };

  var hexToColor = function(hash) {
    var color = '#';

    for (var i = 0; i < 3; i++) {
      var value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }

    return color;
  };

  return {
    restrict: 'E',
    scope: {
      nameColorHash: '@',
      size: '@',
      nameColorHashRace: '=?'
    },
    link: linkFn,
    transclude: true,
    replace: true,
    template:
        `<span class="round-badge" ng-transclude></span>`
  };
});
