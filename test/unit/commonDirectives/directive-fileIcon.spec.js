describe('Unit: Directives:fileIcon', function () {

  var scope;

  beforeEach(function () {
    module('sherpa');

    inject(function ($rootScope) {
      scope = $rootScope.$new();
    });
  });

  it('can render the default icon', function () {
    var element = angular.element('<i file-icon ></i>');
    inject(function ($compile) {
      $compile(element)(scope);
      scope.$digest();
    });

    expect(element).toHaveClass('svg-icon--'); //has the default file icon class
  });

  it('can render the correct markup for a pdf with a full path', function () {
    var element = angular.element('<i file-icon="/some/thing.pdf"></i>');
    inject(function ($compile) {
      $compile(element)(scope);
      scope.$digest();
    });

    expect(element).toHaveClass('svg-icon--pdf'); //has the correct pdf class
  });

  it('reflects the value of the filename after the initial render', function () {
    //start with pdf
    scope.myFile = "blah.pdf";
    var element = angular.element('<i file-icon="{{myFile}}"></i>');

    inject(function ($compile) {
      $compile(element)(scope);
      scope.$digest();
    });

    expect(element).toHaveClass('svg-icon--pdf'); //has the correct pdf class

    //change to mp4 (maps to video)
    scope.myFile = "/some/vid.mp4";
    scope.$digest();
    expect(element).not.toHaveClass('svg-icon--pdf'); //has the correct 'video' class
    expect(element).toHaveClass('svg-icon--video')
  });
});