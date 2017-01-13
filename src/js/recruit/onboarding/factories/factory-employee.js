angular.module('ui.recruit.candidateonboard')
    .factory('EmployeeFactory', ['$timeout', 'Employee', '$q',
        function($timeout, Employee, $q) {
            function EmployeeFactory(futureData) {
                futureData = typeof futureData === 'object' ? futureData : {};
                var self = this;
                if (futureData && typeof futureData.then === 'function') {
                    this.$promise = futureData;
                    this.$loading = true;
                    futureData.then(function(res) {
                        EmployeeFactory.$$timeout(function() {
                            angular.extend(self, res.data);
                            self.$loading = false;
                        });
                        return res;
                    });
                } else {
                    var d = $q.defer();
                    d.resolve({ data: futureData });
                    angular.extend(this, futureData);
                    this.$promise = d.promise;
                }
            }
            EmployeeFactory.$$timeout = $timeout;
            EmployeeFactory.$$service = Employee;
            EmployeeFactory.$$promise = $q.defer().promise;
            EmployeeFactory.$all = function(paginationData) {
                this.$$promise = this.$$service.all(paginationData).then(function(res) {
                    res.data = res.data.map(function(EmployeeData) {
                        return new EmployeeFactory(EmployeeData);
                    });
                    return res;
                });
                return this.$$promise;
            };
            EmployeeFactory.prototype.$save = function() {
                var self = this,
                    action = this.Id ? 'update' : 'create',

                    data = {
                        /*"Id": this.Id,
                        "RoleId": this.RoleId,
                        "RoleDescription": this.RoleDescription,
                        "SkillList": this.SkillList,
                        "ShiftPositionDescription": this.ShiftPositionDescription,
                        "ShiftPositionName": this.ShiftPositionName*/
                    };
                this.$loading = true;
                this.$promise = EmployeeFactory.$$service[action](data);
                return this.$promise.then(function(res) {
                    self.$loading = false;
                    if (action === 'create') {
                        self.Id = res.data.Data.$id;
                    }
                    return res;
                }, function(e) {
                    self.$loading = false;
                    return $q.reject(e);
                });
            };

            return EmployeeFactory;

        }]);