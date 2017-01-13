describe('Unit: Directives:progressBar', function() {

    var element, scope;

    beforeEach(function () {
        module('sherpa');
        module('templates');

        inject(function($rootScope, $compile) {

            scope = $rootScope.$new();

            element = angular.element('<progress-bar value="55" type="caution" label="Test label"></progress-bar>');
            $compile(element)(scope);
            scope.$digest();
        });
    });

    it('should take the value="55", type="caution" and label="Test label" attributes and output the corresponding classes correctly', function() {

        expect(element.find('.progress-bar__range').attr('style')).toEqual('width: 55%;');
        expect(element.find('div[class="progress-bar is--caution"]').length).toBeTruthy();
        expect(element.find('.progress-bar-label').text()).toEqual('Test label');
    });

    it('should correctly render the value attribute and apply the correct default values in lieu of them being specified', function() {

        inject(function($compile) {

            element = angular.element('<progress-bar value="20"></progress-bar>');
            $compile(element)(scope);
            scope.$digest();
        });
        // A negative (less than 30) value
        expect(element.find('.progress-bar__range').attr('style')).toEqual('width: 20%;');
        expect(element.find('div[class="progress-bar is--negative"]').length).toBeTruthy();
        expect(element.find('.progress-bar-label').text()).toEqual('');

        inject(function($compile) {

            element = angular.element('<progress-bar value="50"></progress-bar>');
            $compile(element)(scope);
            scope.$digest();
        });

        // A caution (more than 30, less than 75) value
        expect(element.find('.progress-bar__range').attr('style')).toEqual('width: 50%;');
        expect(element.find('div[class="progress-bar is--caution"]').length).toBeTruthy();

        inject(function($compile) {

            element = angular.element('<progress-bar value="80"></progress-bar>');
            $compile(element)(scope);
            scope.$digest();
        });

        // A positive (more than 75) value
        expect(element.find('.progress-bar__range').attr('style')).toEqual('width: 80%;');
        expect(element.find('div[class="progress-bar is--positive"]').length).toBeTruthy();
    });

});
