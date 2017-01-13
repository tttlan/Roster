angular.module('ui.profile')

  // ProfileDetails Factory
  // ----------------------------------------

  .factory('ProfileEmployeeDetailsFactory', ['ProfileFormFactory', 'Profile', '$routeParams', '$modal', 'Permissions', '$filter', '$timeout', 'Paths',
    function(ProfileFormFactory, Profile, $routeParams, $modal, Permissions, $filter, $timeout, Paths) {

      function EmployeeDetails() {

        this.employeeData = {};
      }

      // This is used to create an object where a select boxes label can be looked up with the value
      function createSelectDataLookupObj(items) {

        var lookupObj = {};

        for (var i = items.length; i--;) {
          var type = items[i];
          lookupObj[type.Value] = type.Label;
        }

        return lookupObj;
      }

      EmployeeDetails.prototype.getEmployeeDetailsForm = function(globalPermission) {
        this.globalPermission = globalPermission;
        var emptyOption = {
          Value: -1,
          Label: "Please Select"
        };

        var employeeDetails = this,
          OPTIONS = {
            serviceName: 'Profile',
            getAction: 'getEmploymentInfo',
            getDataSuccessFn: function(that, res) {

              that.$userCan = Permissions.formatPermissions(res.data.EntityActions); // Pass entity actions back to the view

              // TODO finish applying these entity action to the template

              res.data = res.data.MemberEmploymentInfoDetail; // Note this is discarding the EntityActions property but we've already saved it

              // Set custom labels for a few fields
              that.customLabels = {
                OperatorIdDesc: res.data.OperatorIdDesc,
                DebtorIdDesc: res.data.DebtorIdDesc,
                PayrollMemberIdentifierDesc: res.data.PayrollMemberIdentifierDesc,
                PayrollLocationIdentifierDesc: res.data.PayrollLocationIdentifierDesc
              };

              // Some fields aren't editable, pass their values through here
              that.staticValues = {
                MemberId: res.data.MemberId,
                Allowance: res.data.Allowance,
                Discount: res.data.Discount,
                DisplayStoreKey: res.data.DisplayStoreKey,
                StoreKeyRequired: res.data.StoreKeyRequired,
                DisplayAlarmCode: res.data.DisplayAlarmCode,
                AlarmCodeRequired: res.data.AlarmCodeRequired,
                DisplayClockInPin: res.data.DisplayClockInPin,
                DisplayPayrollInfo: res.data.DisplayPayrollInfo,
                DisplaySalaryClassification: res.data.DisplaySalaryClassification,
                OnboardingStatus: res.data.OnboardingStatus === 'pending' ? true : false,
                OnboardingCommencementDate: res.data.OnboardingCommencementDate,
                OnboardDetailUrl: res.data.OnboardDetailUrl,
                DisplayDesiredSalary: res.data.DisplayDesiredSalary
              };

              // Pass select data to the form builder
              if (res.data.EmploymentClassification) {
                that.selectData.EmploymentTypeId = res.data.EmploymentClassification;
                var employmentTypeEmptyOption = angular.copy(emptyOption);
                employmentTypeEmptyOption.Label = "Please select";
                that.selectData.EmploymentTypeId.unshift(employmentTypeEmptyOption);
                that.selectData.EmploymentTypeIdObj = createSelectDataLookupObj(that.selectData.EmploymentTypeId);
              }

              if (res.data.SalaryRates) {
                that.selectData.RosterRoleId = res.data.SalaryRates;
                var rateEmptyOption = angular.copy(emptyOption);
                rateEmptyOption.Label = "Select pay rate";
                that.selectData.RosterRoleId.unshift(rateEmptyOption);
                that.selectData.RosterRoleIdObj = createSelectDataLookupObj(that.selectData.RosterRoleId);
              }
              if (res.data.Roles) {
                /*that.selectData.RosterRoleId = res.data.SalaryRates;
                 that.selectData.RosterRoleIdObj = createSelectDataLookupObj(that.selectData.RosterRoleId);*/
                /*res.data.Roles = res.data.Roles.map(function (item) {
                 if (item.Value === -1) {
                 item.Label = 'Please select a role';
                 }
                 return item;
                 });*/
              }
              if (res.data.SalaryClassifications) {
                that.selectData.SalaryClassificationId = res.data.SalaryClassifications;
                var salClasEmptyOption = angular.copy(emptyOption);
                salClasEmptyOption.Label = "Please select";
                that.selectData.SalaryClassificationId.unshift(salClasEmptyOption);
                that.selectData.SalaryClassificationIdObj = createSelectDataLookupObj(that.selectData.SalaryClassificationId);
              }

              if (res.data.PerformanceAssessmentForms) {
                that.selectData.PerformanceAssessmentFormID = res.data.PerformanceAssessmentForms.map(function(assessment) {
                  return {
                    Value: assessment.CustomFormId,
                    Label: assessment.Title
                  };
                });
                var paEmptyOption = angular.copy(emptyOption);
                paEmptyOption.Label = "None";
                that.selectData.PerformanceAssessmentFormID.unshift(paEmptyOption);
                that.selectData.PerformanceAssessmentFormIDObj = createSelectDataLookupObj(that.selectData.PerformanceAssessmentFormID);
              }
              res.data.Role = {
                id: res.data.RoleId,
                //label: res.data.Roles.length ? res.data.Roles[0].Label : ''
                label: res.data.Roletxt
              };

              res.data.Group = {
                Id: res.data.DefaultNetworkGroupId,
                Label: res.data.DefaultNetworkGroupName
              };

              employeeDetails.employeeData = res.data;
              res.data.CanByPassOnboard = globalPermission.isadmin;

              return res;
            },
            saveDataFn: function(that, data) {
              var saveData = angular.copy(data);

              // re-map roles and groups to a single ID
              saveData.RoleId = saveData.Role && (saveData.Role.id === -1 ? null : saveData.Role.id);
              saveData.DefaultNetworkGroupId = saveData.Group && saveData.Group.Id;

              // re-map rosterRoleId and SalaryTypeId
              var rosterrole = saveData.SalaryRates.filter(function(rate) {
                return rate.Value === saveData.RosterRoleId;
              })[0];
              saveData.SalaryTypeId = rosterrole ? rosterrole.SalaryTypeID : -1;

              delete saveData.Roles;
              delete saveData.NetworkGroups;
              delete saveData.EmploymentClassification;
              delete saveData.PerformanceAssessmentForms;
              delete saveData.SalaryTypes;
              delete saveData.SalaryRates;
              delete saveData.Role;
              delete saveData.Group;

              // TODO: Ashin Do shit here.
              // data.SalaryHourRate = {};

              return saveData;
            },
            customProperties: {
              $globalPermission: globalPermission ? globalPermission : {}
            },
            saveDataSuccessFn: function(that) {
              that.$editing = false;

              var profileIndex = Paths.get('network.profile', that.staticValues.MemberId ? that.staticValues.MemberId : []);
              $timeout(function() {
                window.location = profileIndex.path + "?tab=employment-details";
              }, 1000);

            },
            saveAction: 'updateEmploymentInfo',
            successMsg: ($routeParams.memberId ? 'The' : 'Your') + ' employment details have been updated successfully',
            errorMsg: ($routeParams.memberId ? 'The' : 'Your') + ' employment details could not be updated at this time.  Please try again later'
          };

        return new ProfileFormFactory(OPTIONS);
      };

      // When changes to an employee's details are pending (ie require approval) this modal can be opened to show the details of it
      EmployeeDetails.prototype.viewPendingChanges = function() {

        var data = this.employeeData;
        var role = data.Roles.filter(function(role) {
          return role.Value === data.RoleId;
        })[0];
        role = role ? role.Label : 'Not set';
        var salary = data.SalaryRates.filter(function(rate) {
          return rate.Value === data.RosterRoleId;
        })[0];
        salary = salary ? salary.Label : 'Not set';
        var employmentType = data.EmploymentClassification.filter(function(type) {
          return type.Value === data.EmploymentTypeId;
        })[0];
        employmentType = employmentType ? employmentType.Label : 'Not set';
        var pendingValues = {
          role: {
            label: 'Role',
            current: role,
            pending: data.OnboardingRoleTxt
          },
          group: {
            label: 'Group',
            current: data.Group.Label,
            pending: data.OnboardingStoreTxt
          },
          salary: {
            label: 'Salary and role',
            current: salary,
            pending: data.OnboardingSalaryRoleTxt
          },
          employmenttype: {
            label: 'Employment Type',
            current: employmentType,
            pending: data.OnboardingEmploymentClassificationTxt
          },
          commencement: {
            label: 'Commencement date',
            current: data.CommencementDate,
            pending: data.OnboardingCommencementDate
          },
          hoursperweek: {
            label: 'Hours per week',
            current: data.MinimumHours,
            pending: data.OnboardingHoursPerWeek
          }
        };

        var modal = $modal.open({
          templateUrl: '/interface/views/profile/partials/modal-pendingChanges.html',
          controller: SHRP.ctrl.ModalCTRL,
          title: 'Pending changes',
          animationType: 'flipVertical',
          resolve: {
            items: function() {
              return pendingValues;
            },
            dataUpload: function() {
                return {};
            }
          }
        });
      };

      // When an employee detail is changed that should trigger an onboard, this modal will open
      EmployeeDetails.prototype.confirmChanges = function(data) {

        var OnboardDetailUrl = data.old.OnboardDetailUrl;
        var CanByPassOnboard = data.old.CanByPassOnboard;

        // Using the fill reference to the fn as it will be called out of context and 'this' won't refer to EmployeeDetails
        var changeValues = EmployeeDetails.prototype.buildChangedValues(data);

        // If we have no changes, return nothing.
        if (!changeValues.length) {
          return;
        }

        var modal = $modal.open({
          templateUrl: '/interface/views/profile/partials/modal-infoChange.html',
          controller: SHRP.ctrl.ModalProfileConfirm,
          title: 'Confirm changes',
          animationType: 'flipVertical',
          resolve: {
            data: function() {
              return changeValues;
            },
            lastestOnboard: function() {
              return OnboardDetailUrl;
            },
            canByPassOnboard: function() {
              return CanByPassOnboard;
            }
          }
        });

        return modal.result.then(function(res) {
          // return our modal data, and extend it into data.new
          return angular.extend({}, data.new, res);
        });
      };

      // Format the changed values once the model has been confirmed
      EmployeeDetails.prototype.buildChangedValues = function(data) {

        // Grab the changeValues that have changed.
        var changed = changeValues.filter(function(changeValue) {
          var newVal = data.new[changeValue.id],
            oldVal = data.old[changeValue.id];

          return !( angular.equals(newVal, oldVal) || (!newVal && !oldVal) );
        });

        return changed.map(function(changeValue) {

          var oldVal = data.old[changeValue.id],
            newVal = data.new[changeValue.id];

          // Format if needed
          if (typeof changeValue.format === 'function') {
            if (oldVal) {
              oldVal = changeValue.format(oldVal, data.old);
            }
            if (newVal) {
              newVal = changeValue.format(newVal, data.new);
            }
          }
          /*if (oldVal && oldVal.id === -1) {
           oldVal.label = 'Not Set';
           }
           if (newVal && newVal.id === -1) {
           newVal.label = 'Not Set';
           }*/
          return {
            'type': changeValue.name,
            'oldValue': oldVal,
            'newValue': newVal
          };
        });
      };

      var changeValues = [
        {
          id: 'RosterRoleId',
          name: 'Salary Rate',
          format: function(val, data) {

            var salaryType,
              selectedRate;

            if (val) {

              if (angular.isArray(data.SalaryRates)) {
                selectedRate = data.SalaryRates.filter(function(rate) {
                  return rate.Value === val;
                })[0];
              }

              if (selectedRate) {

                var expression = /optEmpType>([A-Za-z]*)/,
                  foundStrs = expression.exec(selectedRate.Label);

                salaryType = (foundStrs && foundStrs.length) ? foundStrs[1] : false;
              }
            }

            return salaryType || val;
          }
        },
        {
          id: 'Role',
          name: 'Role',
          format: function(val, data) {
            return val.label;
          }
        },
        {
          id: 'Group',
          name: 'Location',
          format: function(val, data) {
            return val.Label;
          }
        },
        {
          id: 'PayrollLocationIdentifier',
          name: 'Payroll Location'
        },
        //Not using this anymore - employment type is only set by changing the roster role id
        {
          id: 'EmploymentTypeId',
          name: 'Employment Type',
          format: function(val, data) {
            var selectedLocation = data.EmploymentClassification.filter(function(location) {
              return location.Value === val;
            });

            return (selectedLocation.length) ? selectedLocation[0].Label : '';
          }
        },
        {
          id: 'SalaryClassificationId',
          name: 'Salary Classification',
          format: function(val, data) {
            var selectedLocation = data.SalaryClassifications.filter(function(location) {
              return location.Value === val;
            });

            return (selectedLocation.length) ? selectedLocation[0].Label : '';
          }
        },
        {
          id: 'MinimumHours',
          name: 'Minimum Hours'
        },
        {
          id: 'DesiredSalary',
          name: 'Desired Salary',
          format: function(val, data) {
            return $filter('currency')(val);
          }
        },
        {
          id: 'PerformanceAssessmentFormID',
          name: 'Performance Assessment',
          format: function(val, data) {
            console.log(data.PerformanceAssessmentForms);
            var selectedLocation = data.PerformanceAssessmentForms.filter(function(location) {
              return location.CustomFormId === val;
            });

            return (selectedLocation.length) ? selectedLocation[0].Title : 'None';
          }
        }
      ];

      return EmployeeDetails;

    }]);
