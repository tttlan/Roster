// Factory ProfileForm
// ----------------------------------------

xdescribe('Unit: Directive:FormBuilder', function() {

    var formBuilder, $scope, controller, createForm, $compile, $q, element, $httpBackend, $timeout, eleScope;

    beforeEach(function () {
        module('sherpa');
        module('templates');

        inject(function($rootScope, _$compile_, _$q_, _$timeout_, $injector) {

            // set up any required services
            $scope = $rootScope.$new();
            $compile = _$compile_;
            $q = _$q_;
            $timeout = _$timeout_;
            $httpBackend = $injector.get('$httpBackend');

            $scope.form = {
                submitFn: function(){

                    var deferred = $q.defer();
                    deferred.resolve({status: 200, data: 'success'});
                    return deferred.promise;
                },
                submitFnError: function(){

                    return $q.reject({
                        status: 200,
                        data: 'put error'
                    });
                },
                dataPromise: function(){

                    var deferred = $q.defer();
                    deferred.resolve({
                        data: {
                            email: 'email',
                            password: 'password',
                            url: 'url',
                            username: 'username',
                            textarea: 'textarea',
                            richtext: 'richtext',
                            checkbox: true,
                            radios: 'm',
                            toggle: true,
                            file: [{
                                'FileStoreId':1939,
                                'FileName':'z-09-mobile-roster-request.jpg',
                                'FileSize':33401,
                                'FileVersion':'1',
                                'FileExtension':'.jpg',
                                'LastUpdatedDate':'2014-09-02T02:27:38.93Z',
                                'IsProcessing':false,
                                'url':{},
                                'loaded':true,
                                'type':'image',
                                'name':'z-09-mobile-roster-request'
                            }],
                            date: '2014-09-19T16:25:27',
                            time: '2014-09-19T16:25:27',
                            datetime: '2014-09-19T16:25:27',
                            hidden: 'some hidden val',
                            select: 'male',
                            selectExtOpts: 'd',
                            input1: 'input1',
                            input2: 'input2',
                            input3: 'input3'
                        }
                    });

                    return deferred.promise;
                },
                dataPromiseError: function(){

                    return $q.reject({
                        data: {
                            service: 'get error'
                        }
                    });
                },
                parentData: {
                    selectData: {
                        selectExtOpts: [
                            {
                                'Label': 'Male',
                                'Value': 'm',
                            },
                            {
                                'Label': 'Female',
                                'Value': 'f'
                            },
                            {
                                'Label': 'Other',
                                'Value': 'o'
                            },
                            {
                                'Label': 'Monster',
                                'Value': 'm'
                            },
                            {
                                'Label': 'Dog',
                                'Value': 'd'
                            }
                        ]
                    }
                },
                beforeSubmitFn: function(res){

                    eleScope.beforeSubmitFnCalled = true;
                },
                beforeSubmitFnPromise: function(res){

                    res.old.testprop = true; // Add some data in here and test that it's reflected into the model

                    var deferred = $q.defer();
                    deferred.resolve(res.old);
                    return deferred.promise;
                }
            };

            jasmine.getFixtures().fixturesPath = 'base/interfaceSource/test/mockData/static/';
            jasmine.getJSONFixtures().fixturesPath = 'base/interfaceSource/test/mockData/static/';

            $httpBackend.when('GET', '/test/formbuilder-large.json').respond(200,
                getJSONFixture('formbuilder-large.json')
            );

            $httpBackend.when('GET', '/test/formbuilder-small.json').respond(200,
                getJSONFixture('formbuilder-small.json')
            );

            $httpBackend.when('GET', '/test/formbuilder.html').respond(200,
                readFixtures('formbuilder.html')
            );

            // Get the form-builder.html template
            createForm = function(type) {

                var opts;

                if (type === 'noModel') {

                    opts = ' template="/test/formbuilder.html"' +
                           ' form-data-url="/test/formbuilder-large.json"';

                } else if (type === 'noTemplate') {

                    opts = ' model-data="form.dataPromise"' +
                           ' form-data-url="/test/formbuilder-small.json"';

                } else if (type === 'modelError') {

                    opts = ' model-data="form.dataPromiseError"' +
                           ' form-data-url="/test/formbuilder-small.json"';

                } else if (type === 'submitError') {

                    opts = ' model-data="form.dataPromise"' +
                           ' form-data-url="/test/formbuilder-small.json"' +
                           ' submit="form.submitFnError"';

                } else if (type === 'beforeSubmitFn') {

                   opts = ' before-submit="form.beforeSubmitFn"' +
                          ' model-data="form.dataPromise"' +
                          ' form-data-url="/test/formbuilder-small.json"' +
                          ' submit="form.submitFn"';

                } else if (type === 'beforeSubmitFnPromise') {

                    opts = ' before-submit="form.beforeSubmitFnPromise"' +
                           ' model-data="form.dataPromise"' +
                           ' form-data-url="/test/formbuilder-small.json"' +
                           ' submit="form.submitFn"';

                } else {

                    opts = ' template="/test/formbuilder.html"' +
                           ' model-data="form.dataPromise"' +
                           ' form-data-url="/test/formbuilder-small.json"' +
                           ' submit="form.submitFn"';
                }

                element = angular.element('<form-builder' +
                    ' form-id="form"' +
                    ' parent-data="form.parentData"' +
                    opts +
                '></form-builder>');

                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
                eleScope = element.isolateScope();
                controller = element.controller('formBuilder');
                $httpBackend.flush(); // Trigger requests for all assets
            }
        });
    });

    it('can load a basic for with no model data correctly into scope', function() {

        createForm('noModel');

        // This is the only test that renders a template with the full 23 elements
        expect(controller.isModel).toEqual(false);
        expect(controller.modelData).toEqual(undefined);
        expect(eleScope.formData.elements.length).toEqual(23);
        expect(eleScope.formData.elements[17].options[2]).toEqual({'Label': 'Other', 'Value': 'o'}); // Select data is passed in correctly
    });

    it('can load a form with no template correctly', function() {

        createForm('noTemplate');

        expect(controller.isModel).toEqual(true);
        expect(controller.modelData.password).toEqual('password');
        expect(element.find('h3').length).toEqual(0);
        expect(element).toContainHtml('<input type="text" id="formbuilder__input" placeholder="Enter text" name="input" ng-model="element.val" ng-change="" ng-required="element.validation.required" ng-minLength="0" ng-maxLength="999" ng-disabled="form[element.name].$disabled" class="ng-pristine ng-untouched ng-valid ng-valid-required ng-valid-pattern ng-valid-minlength ng-valid-maxlength" required="required" />');
    });

    it('can load a form with a template correctly', function() {

        createForm();

        // The template has placeholders for 22 elements but we are sending json data for only 6 of them (5 fields plus a submit button)
        expect(element.find('h3').length).toEqual(22);
        expect(element.find('.form__field').length).toEqual(5);
        expect(element).toContainHtml('<h3>input type="text"</h3>');
        expect(element).toContainHtml('<h3>Reset button</h3>');
        expect(element).toContainHtml('<input type="text" id="formbuilder__input" placeholder="Enter text" name="input" ng-model="element.val" ng-change="" ng-required="element.validation.required" ng-minLength="0" ng-maxLength="999" ng-disabled="form[element.name].$disabled" class="ng-pristine ng-untouched ng-valid ng-valid-required ng-valid-pattern ng-valid-minlength ng-valid-maxlength" required="required" />');
        expect(element).toContainHtml('<input type="email" id="formbuilder__email" placeholder="Enter email Address" name="email" ng-model="element.val" ng-change="" ng-required="element.validation.required" ng-minlength="0" ng-maxlength="999" class="ng-pristine ng-untouched ng-invalid ng-invalid-email ng-valid-required ng-valid-pattern ng-valid-minlength ng-valid-maxlength" required="required">');
    });

    it('can load a form with model data and place model data into the elements and also data from the element json', function() {

        createForm();

        expect(controller.isModel).toEqual(true);
        expect(eleScope.formData.elements[0].val).toEqual('Text from the json');
        expect(eleScope.formData.elements[1].val).toEqual('email');
        expect(eleScope.formData.elements[4].val).toEqual(true);
    });

    it('can handle form with a failed request to load the model and display a reload button', function() {

        createForm('modelError');

        expect(controller.isModel).toEqual(true); // There's no model but we still expect there to be one
        expect(element).toContainHtml('<reload action="reloadForm()" class="ng-scope ng-isolate-scope"><div class="message message--retry"><p>This failed to load<br><a ng-click="reload()"><span class="icon--clockwise"></span> Retry</a></p></div></reload>');

        eleScope.reloadForm();
        $timeout.flush();

        // Expect a loader to be place as the element html once the reload button has been clicked
        expect(element).toContainHtml('<div class="loading-block ng-scope"><span ng-transclude=""></span></div>');

        $httpBackend.flush();

        // Now expect to be back to the reload button as the request will fail again
        expect(element).toContainHtml('<reload action="reloadForm()" class="ng-scope ng-isolate-scope"><div class="message message--retry"><p>This failed to load<br><a ng-click="reload()"><span class="icon--clockwise"></span> Retry</a></p></div></reload>');
    });

    it('an invalid form should not send a request to the server', function() {

        createForm();

        eleScope.submit(false); // Submit the form.  The submit function accepts a bool, false means the for is invalid.
        expect(eleScope.form.$submitting).toBe(undefined); // Expect this to be undefined as the the function should have exited before this property could be set
    });

    it('can submit form data back to the server sucessfully', function() {

        createForm();

        // Change some data on the elements to simulate someone entering data into the form
        eleScope.formData.elements[0].val = 'TESTDATA'; // input (note that there is no model data currenting in place for this)
        eleScope.formData.elements[1].val = 'TESTDATA'; // email
        eleScope.formData.elements[4].val = false; // toggle

        $scope.$apply(); // Apply changes made to element values

        eleScope.submit(true); // Submit the form

        $scope.form.submitFn().then(function(res) { // Get access to the res of the above submit function
            expect(res.status).toEqual(200);
            expect(res.data).toEqual('success');
        }).finally(function(res) {
            expect(eleScope.form.$submitting).toEqual(false);
        });

        expect(eleScope.form.$submitting).toEqual(true);

        $scope.$apply(); // Apply changes to fire the request

        // Test the data to make sure our changes are now applied to the model
        expect(controller.modelData.input).toEqual('TESTDATA');
        expect(controller.modelData.email).toEqual('TESTDATA');
        expect(controller.modelData.toggle).toEqual(false);

        // Test that the submtting flag is now false
        expect(eleScope.form.$submitting).toEqual(false);
    });

    it('if submitting the form back to the server throws an error, it is handled appropriately', function() {

        createForm('submitError');

        eleScope.formData.elements[0].val = 'TESTDATA'; // input
        eleScope.formData.elements[1].val = 'TESTDATA'; // email

        eleScope.submit(true); // Submit the form

        $scope.form.submitFnError().then(function(res) { // Get access to the res of the above submit function
            // Nothing happens in here as this function is called on success
        }, function(res) {
            expect(res.status).toEqual(200); // Our apis are returning 200 for errors, main difference is that our code executes the error fn
            expect(res.data).toEqual('put error');
        }).finally(function(res) {
            expect(eleScope.form.$submitting).toEqual(false);
        });

        expect(controller.modelData.input).toEqual(undefined); // Asset this does not get added to the model given it was not there in the first place
        expect(controller.modelData.email).toEqual('email'); // Assert our model does not get updated when the form submission fails

        $scope.$apply(); // Apply changes to fire the request
    });

    it('can use a before submit function with no callback or promise', function() {

        createForm('beforeSubmitFn');

        expect(eleScope.beforeSubmitFnCalled).toEqual();

        eleScope.submit(true);

        $scope.$apply();

        // Some data is added into the res in the beforeSubmitFnPromise.  Test that it gets passed through to the model
        expect(eleScope.beforeSubmitFnCalled).toEqual(true);
    });

    it('can use a before submit function that has a callback (then) function', function() {

        createForm('beforeSubmitFnPromise');

        eleScope.submit(true);

        $scope.$apply();

        // Some data is added into the res in the beforeSubmitFnPromise.  Test that it gets passed through to the model
        expect(controller.modelData.testprop).toEqual(true);
    });

    it('can reset the form', function() {

        createForm();

        // We don't expect the model values to change at any point in time
        function assertModelData() {
            expect(controller.modelData.input).toEqual(undefined); // This input does not have a model val yet as no data was retrieved from the server for it
            expect(controller.modelData.email).toEqual('email');
            expect(controller.modelData.url).toEqual('url');
            expect(controller.modelData.password).toEqual('password');
        }

        // Assert the initial view values
        expect(eleScope.form.input.$viewValue).toEqual('Text from the json');
        expect(eleScope.form.email.$viewValue).toEqual('email');
        expect(eleScope.form.url.$viewValue).toEqual('url');
        expect(eleScope.form.password.$viewValue).toEqual('password');

        // Check our model has not changed
        assertModelData();

        // Now set our inputs to a new value
        eleScope.form.input.$setViewValue('TESTDATA'); // input
        eleScope.form.email.$setViewValue('TESTDATA'); // email
        eleScope.form.url.$setViewValue('TESTDATA'); // url
        eleScope.form.password.$setViewValue('TESTDATA'); // password

        // Check that the view value was correctly set
        expect(eleScope.form.input.$viewValue).toEqual('TESTDATA');
        expect(eleScope.form.email.$viewValue).toEqual('TESTDATA');
        expect(eleScope.form.url.$viewValue).toEqual('TESTDATA');
        expect(eleScope.form.password.$viewValue).toEqual('TESTDATA');

        // Check the model data has not changed
        assertModelData();

        // Now reset the form
        eleScope.resetForm();

        // Check the model data again
        assertModelData();

        // Now finally test that the view vals have all reset back to their original values
        expect(eleScope.form.input.$viewValue).toEqual(null);
        expect(eleScope.form.email.$viewValue).toEqual('email');
        expect(eleScope.form.url.$viewValue).toEqual('url');
        expect(eleScope.form.password.$viewValue).toEqual('password');
    });

});
