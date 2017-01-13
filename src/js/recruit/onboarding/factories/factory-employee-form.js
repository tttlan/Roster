angular.module('ui.recruit.candidateonboard')
    .factory('EmployeeFormFactory', EmployeeFormFactory);

EmployeeFormFactory.$inject = ['FormFactory', 'EmployeeFactory', '$routeParams', 'OnboardingFactory', '$q', 'formBuilderService', '$timeout', 'Employee'];
function EmployeeFormFactory(FormFactory, EmployeeFactory, $routeParams, OnboardingFactory, $q, formBuilderService, $timeout, Employee) {
    function createSelectDataLookupObj(items) {

        var lookupObj = {};

        for (var i = items.length; i--;) {
            var type = items[i];
            lookupObj[type.Value] = type;
        }

        return lookupObj;
    }
    function EmployeeForm(employee) {
        var that = this;
        that.dataLoaded = false;
        var editing = (employee && !isNaN(parseInt(employee.Id))) ? true : false;
        var formObj = angular.copy(employee);
        var emptyOption = { Value: -1, Label: "Select" };
        var OPTIONS = {
            serviceName: 'EmployeeFormFactory', // using the service without data promise
            getAction: (typeof formObj === 'object') ? null :'getFormData',
            saveAction: editing ? 'update' : 'create',
            successMsg: editing ? 'Employee has been updated': 'Employee has been created',
            errorMsg: editing ? 'Employee could not be updated at this time. Please try again later' : 'Employee could not be created at this time, please try again later',
            dataPromise: (typeof formObj === 'object') ? new EmployeeFactory(formObj).$promise : null,
            customProperties: {
                $editing: editing,
                $id: editing ? employee.Id : null
            },
            getDataSuccessFn: function(that, res) {
                var salaryTypes = res[0], employmentTypes = res[1], salutations = res[2],
                    roles = res[3], payRates = res[4];

                if (employmentTypes.data) {
                    that.selectData.EmploymentTypeId = employmentTypes.data.map(function(item) {
                        return {
                            Value: item.Value,
                            Label: item.Label
                        };
                    });
                    that.selectData.EmploymentTypeId.unshift(emptyOption);
                }

                if (salaryTypes.data) {
                    that.selectData.SalaryTypeId = salaryTypes.data.map(function(item) {
                        return {
                            Value: item.SalaryTypeId,
                            Label: item.Description
                        };
                    });
                    that.selectData.SalaryTypeId.unshift(emptyOption);
                }
                if (roles.data) {
                    that.selectData.Role = roles.data.map(function(item) {
                        return {
                            Value: item.RoleId,
                            Label: item.Name
                        };
                    });
                }
                if (payRates.data) {
                    that.selectData.RosterRoleId = payRates.data;
                    that.selectData.RosterRoleIdObj = createSelectDataLookupObj(payRates.data);
                }
                // wating 200ms for finish data
                $timeout(function() {
                    that.dataLoaded = true;
                }, 300);
                return { data: {
                }}; 
            },
            saveDataFn: function(that, data) {
                var savedData = 
                {
                    "EmployeeInfo": {
                        "SalutationId": data.SalutationId,
                        "FirstName": data.FirstName,
                        "Surname": data.Surname,
                        "PreferredName": data.PreferredName,
                        "Sex": data.Sex,
                        "BirthDay": data.BirthDay,
                        "Title": ""
                    },
                    "AddressContact": {
                        "IsPrimary": true,
                        "IsPrivate": true,
                        "Address": data.Address,
                        "Address2": null,
                        "Suburb": data.Suburb,
                        "City": data.City,
                        "Postcode": data.Postcode,
                        "StateName": data.StateName,
                        "StateRegionId": null,
                        "CountryId": (!data.CountryId || data.CountryId.Value === -1) ? null : data.CountryId && data.CountryId.Value,
                        "Fax": null,
                        "WebAddress": null
                    },
                    "Role": {
                        "LoginName": data.LoginName,
                        "StartDate": null,
                        "RoleId": data.Role ? data.Role.id : null,
                        "NetworkGroupId": data.NetworkGroupId ? data.NetworkGroupId.Id : null,
                        "RosterRoleId": data.RosterRoleId === -1 ? null : data.RosterRoleId,
                        "SalaryTypeId": data.SalaryTypeId ===-1 ? null : data.SalaryTypeId,
                        "EmploymentTypeId": data.EmploymentTypeId === -1 ? null : data.EmploymentTypeId,
                        "HoursPerWeek": data.HoursPerWeek
                    },
                    "EmergencyContact": {
                        "FirstName": data.EFirstName,
                        "SurName": data.ESurname,
                        "Relationship": data.Relationship,
                        "Address": data.EAddress,
                        "Address2": null,
                        "City": data.ECity,
                        "Suburb": data.ESuburb,
                        "Postcode": data.EPostcode,
                        "LinePhone1": data.ContactNumber,
                        "LinePhone2": null,
                        "MobilePhone": null,
                        "Fax": null,
                        "Email": data.EEmail,
                        "WebAddress": null,
                        "StateName": data.EStateName,
                        "StateRegionId": null,
                        "CountryId": (!data.ECountryId || data.ECountryId.Value === -1) ? null : data.ECountryId && data.ECountryId.Value,
                        "CanAcceptSms": true,
                        "CanAcceptVoiceCall": true,
                        "CanAcceptFax": true,
                        "CanAcceptHtml": true
                    },
                    "MemberBank": {
                        "LoginName": data.LoginName,
                        "MemberId": null,
                        "LoginCount": null,
                        "Password": null,
                        "BankPassword": null,
                        "BankingID": null,
                        "AccountName": data.BankAccountName,
                        "BSB": data.BSB,
                        "AccountNo": data.AccountNo,
                        "SuperFund": data.SuperFund,
                        "SuperNo": data.SuperNo,
                        "BankName": data.BankName,
                        "TaxFileNumber": data.TaxFileNumber
                    }
                };
                savedData.EmailContacts = !data.EmailContacts ? [] : data.EmailContacts.map(function(item) {
                    return  {
                        "IsPrimary": item.isPrimary,
                        "IsPrivate": item.isPrivate,
                        "Email": item.value,
                        "CanAcceptHtml": true
                    };
                });
                savedData.PhoneContacts = !data.PhoneContacts ? [] : data.PhoneContacts.map(function(item) {
                    return  {
                        "IsPrimary": item.isPrimary,
                        "IsPrivate": item.isPrivate,
                        "Phone": item.value,
                        "CanAcceptSms": true,
                        "CanAcceptVoiceCall": true,
                        "CanAcceptFax": true
                    };
                });
                return savedData;
            },
            saveDataSuccessFn: function(that, data) {
                if (formObj) {
                }
                return null;
            },
            saveDataErrorFn: function(that, data) {
                return null;
            }
        };
        var formInstance = new FormFactory(OPTIONS);

        var formCycle = formBuilderService.cycleModule;
        formCycle.$addFunction(function(relatedElements, element) {
            // should change the element in the format
            if (element.name === 'RosterRoleId') {
                var salaryElement = relatedElements[0];
                if (element.val !== -1) {
                    var payrate = formInstance.selectData.RosterRoleIdObj[element.val];
                    if (payrate) {
                        salaryElement.val = payrate.SalaryTypeID;
                        salaryElement.class += ' is--blocked';
                    }
                }
                else {
                    //salaryElement.class.replace(/is--blocked/gi, ''); // allow select salary type
                    salaryElement.class = 'col-1-3';
                }
            }
        });
        return formInstance;
    }
    EmployeeForm.getFormData = function() {
        return $q(function(resolve, reject) {
            var promiseList = [];
            promiseList.push(OnboardingFactory.getSalaryTypes());
            promiseList.push(OnboardingFactory.getEmploymentTypes());
            promiseList.push(OnboardingFactory.getSalutations());
            promiseList.push(OnboardingFactory.getRoles());
            promiseList.push(OnboardingFactory.getRolePayrates());
            $q.all(promiseList).then(function(res) {
                resolve(res);
            }, function(e) {
                reject(e);
            });
            
        });
    };
    EmployeeForm.create = function(data) {
        return Employee.create(data);
    };
    EmployeeForm.update = function(data) {
        return Employee.update(data);
    };
    return EmployeeForm;
}