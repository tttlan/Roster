/*
 * angular-ui-bootstrap
 * http://angular-ui.github.io/bootstrap/

 * Based on: 0.10.0 - 2014-05-21
 * License: MIT
 */

 
angular.module('ui.bootstrap.accordion', ['ui.bootstrap.collapse'])

.constant('accordionConfig', {
  closeOthers: false
})

.controller('AccordionController', ['$scope', '$attrs', 'accordionConfig', function ($scope, $attrs, accordionConfig) {

  // This array keeps track of the accordion groups
  this.groups = [];

  // Ensure that all the groups in this accordion are closed, unless close-others explicitly says not to
  this.closeOthers = function(openGroup) {
    var closeOthers = angular.isDefined($attrs.closeOthers) ? $scope.$eval($attrs.closeOthers) : accordionConfig.closeOthers;
    if ( closeOthers ) {
      angular.forEach(this.groups, function (group) {
        if ( group !== openGroup ) {
          group.isOpen = false;
        }
      });
    }
  };
  
  // This is called from the accordion-group directive to add itself to the accordion
  this.addGroup = function(groupScope) {
    var that = this;
    this.groups.push(groupScope);

    groupScope.$on('$destroy', function (event) {
      that.removeGroup(groupScope);
    });
  };

  // This is called from the accordion-group directive when to remove itself
  this.removeGroup = function(group) {
    var index = this.groups.indexOf(group);
    if ( index !== -1 ) {
      this.groups.splice(this.groups.indexOf(group), 1);
    }
  };

}])

// The accordion directive simply sets up the directive controller
// and adds an accordion CSS class to itself element.
.factory('accordionFactory', function () {
  return {
        restrict: 'E',
    controller:'AccordionController',
        controllerAs: 'accordionCtrl',
    transclude: true,
    replace: true, // !!!!!  This has been changed, default Bootstrap value is false
    templateUrl: '/interface/views/common/partials/accordion.html'
  };
})

// The accordion-group directive indicates a block of html that will expand and collapse in an accordion
.factory('accordionGroupFactory', ['$parse', function ($parse) {
  return {
        restrict: 'E',
    transclude:true,              // It transcludes the contents of the directive into the template
    replace: true,                // The element containing the directive will be replaced with the template
    templateUrl:'/interface/views/common/partials/accordion-group.html',
    scope:{ heading:'@' },        // Create an isolated scope and interpolate the heading attribute onto this scope
    controller: function() {
      this.setHeading = function(element) {
        this.heading = element;
      };
    },
        controllerAs: 'accordionGroupCtrl',
        link: function (scope, element, attrs) {
            var accordionCtrl = scope.$parent.accordionCtrl;
      var getIsOpen, setIsOpen;

      accordionCtrl.addGroup(scope);

      scope.isOpen = false;
      
      if ( attrs.isOpen ) {
        getIsOpen = $parse(attrs.isOpen);
        setIsOpen = getIsOpen.assign;

        scope.$parent.$watch(getIsOpen, function(value) {
          scope.isOpen = !!value;
        });
      }

      scope.$watch('isOpen', function(value) {
        if ( value ) {
          accordionCtrl.closeOthers(scope);
        }
        if ( setIsOpen ) {
          setIsOpen(scope.$parent, value);
        }
      });
    }
  };
}])
// The accordion directive simply sets up the directive controller
// and adds an accordion CSS class to itself element.
.directive('accordion', ['accordionFactory', function (accordionFactory) {
    return accordionFactory;
}])

// The accordion-group directive indicates a block of html that will expand and collapse in an accordion
.directive('accordionGroup', ['accordionGroupFactory', function (accordionGroupFactory) {
    return accordionGroupFactory;
}])
// Use accordion-heading below an accordion-group to provide a heading containing HTML
// <accordion-group>
//   <accordion-heading>Heading containing HTML - <img src="..."></accordion-heading>
// </accordion-group>
.directive('accordionHeading', function() {
  return {
        restrict: 'E',
    transclude: true,   // Grab the contents to be used as the heading
    template: '',       // In effect remove this element!
    replace: true,
    compile: function(element, attr, transclude) {
            return function link(scope, element, attrl) {
                var accordionGroupCtrl = scope.$parent.accordionGroupCtrl;
        // Pass the heading to the accordion-group controller
        // so that it can be transcluded into the right place in the template
        // [The second parameter to transclude causes the elements to be cloned so that they work in ng-repeat]
        accordionGroupCtrl.setHeading(transclude(scope, function() {}));
        element.remove(); // !!!!!!!!! Custom change - remove this element once it's been transcluded
      };
    }
  };
})

// Use in the accordion-group template to indicate where you want the heading to be transcluded
// You must provide the property on the accordion-group controller that will hold the transcluded element
// <div class="accordion-group">
//   <div class="accordion-heading" ><a ... accordion-transclude="heading">...</a></div>
//   ...
// </div>
.directive('accordionTransclude', function() {
  return {
        link: function (scope, element, attr) {
            var controller = scope.accordionGroupCtrl;
      scope.$watch(function() { return controller[attr.accordionTransclude]; }, function(heading) {
        if ( heading ) {
          element.html('');
          element.append(heading);
        }
      });
    }
  };
});