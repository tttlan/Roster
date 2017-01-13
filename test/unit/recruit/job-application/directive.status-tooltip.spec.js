// Directive status tooltip
// ----------------------------------------

describe('Unit: Directives:status-tooltip', function() {

    var el,
        $scope,
        htmlTemplate = '<status-tooltip status-change-count="statusChangeCount" status="status"></status-tooltip>';

    beforeEach(function () {
        module('sherpa');
        module('templates');

        inject(function($rootScope, $compile) {
            $scope = $rootScope.$new();

            el = $compile(angular.element(htmlTemplate))($scope);
        });
    });

    it('Checks status change display output', function() {
        // Default Status Test Data
        $scope.statusChangeCount = 10;

        $scope.$digest();

        expect(el.find('strong').text()).toEqual('10 status changes');
        $scope.statusChangeCount = 1;
        $scope.$digest();
        expect(el.find('strong').text()).toEqual('1 status change');
        $scope.statusChangeCount = 0;
        $scope.$digest();
        expect(el.find('strong').text()).toEqual('0 status change');
});

    xit('Checks if status data is displayed correctly (when both previous and current status data is present)', function() {
        $scope.status = {
            "status": "NEW",
            "statusColor": "red",
            "previousStatus": "SHORTLIST",
            "previousStatusColor": "orange"
        };

        $scope.$digest();

        expect(element.find('span').index(0).attr('class')).toContain('label--'+scope.previousStatusColor); // checks to see if the previous status color class is applied.
        expect(element.find('span').index(2).attr('class')).toContain('label--'+scope.currentStatusColor); // checks to see if the current status color class is applied.
        expect(element.find('span').index(0).text()).toEqual('SHORTLIST'); // checks to see if the previous status name is correctly displayed.
        expect(element.find('span').index(2).text()).toEqual('NEW'); // checks to see if the current status name is correctly displayed.
        expect(element.find('span').length).toEqual(3); // check's to see if all requires spans are present, if all status values are present in status array object 3 spans should exist.
     });

    xit('Checks if status data is displayed correctly (only current status data is present)', function() {
        $scope.status = {
            "status": "NEW",
            "statusColor": "red",
            "previousStatus": null,
            "previousStatusColor": null
        };

        $scope.$digest();

        expect(element.find('span').index(0).attr('class')).toContain('label--'+scope.currentStatusColor); // checks to see if the current status color class is applied.
        expect(element.find('span').index(0).text()).toEqual('NEW'); // checks to see if the current status name is correctly displayed.
        expect(element.find('span').length).toEqual(1); // Only one span should exist if previous status data is null
    });
});