angular.module('ui.common')
 // <input-member name="" ng-model="" object="" ng-required="" ng-disabled=""></input-member>
 // ng-model="" will get populated with the selected's id
 // object="" will get populated with the selected's object, which looks like this:

    .directive('inputMember', function(Members, $timeout) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                selectedMember: '=?ngModel',
                name: '@?',
                ngRequired: '=?',
                ngDisabled: '=?',
                object: '=?'
            },
            require: 'ngModel',
            templateUrl: '/interface/views/common/partials/directive-input-member.html',
            link: function(scope) {
                scope.uniqueId = scope.$id;
                scope.items = [];
                
                var array = [];
                
                if(!scope.selectedMember) {
                    scope.selectedMember = [];
                }else{
                    var memberList = scope.selectedMember;
                    
                    if(angular.isArray(memberList)){
                        angular.forEach(memberList, function(item, idx){
                            item.Fullname = item.FirstName + ' ' + item.Surname;
                        });
                    }
                }
                
                scope.getItems = function(searchQuery) {
                    return Members.getProfiles(1, 100, 2, searchQuery, 0)
                        .then(function(response) {
                            scope.items = response.data;
                            return response.data;
                        });
                };
                
                scope.$watch('textInput', function(newVal) {
                    if(!newVal || newVal !== undefined){
                        var obj;
                        obj = scope.items.filter(function(item) {
                            if (item.Fullname === newVal) {
                                if (scope.selectedMember.length < 1) {
                                    scope.selectedMember.push(item);
                                } else {
                                    var exist = false;
                                    for (var i = 0; i < scope.selectedMember.length; i++) {
                                        if (scope.selectedMember[i].MemberId === item.MemberId) {
                                            exist = true;
                                        }
                                    }
                                    if (!exist) {
                                        scope.selectedMember.push(item);
                                    }
                                }
                                scope.textInput = '';
                            }
                        })[0];
                        scope.object =  scope.selectMember;
                        
                        array = scope.selectedMember;
                        validate(array);
                    }
                });
                
                scope.remove = function(idx) {
                    scope.selectedMember.splice(idx, 1);
                    array = scope.selectedMember;
                    validate(array);
                };
                
                var validationRules = {
                    isRequired: function(value) {

                        if (!angular.isArray(value)) {
                            return false;
                        }

                        return value.length > 0;
                    }
                };

                //Runs through the validationRules and applys them to the ngModel
                function validate(value) {
                    if (scope.$memberForm && scope.$memberForm.memberModel) {
                        for (var rule in validationRules) {
                            var isValid = validationRules[rule](value);
                            scope.$memberForm.memberModel.$setValidity(rule, isValid);
                        }
                    }
                    return undefined;
                }

                $timeout(function() {
                    validate(scope.selectedMember);
                });
            }
        };
    });
