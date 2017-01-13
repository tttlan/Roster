angular.module('ui.profile')

.factory('ProfileMemberContactFactory', ['Profile', 'ProfileFormFactory', 'Permissions', '$q', '$notify', function(Profile, ProfileFormFactory, Permissions, $q, $notify) {

    function MemberContact() {

        this.emails = {
            cache: [],
            $submitting: false
        };

        this.phones = {
            cache: [],
            $submitting: false
        };
        
        this.addresses = {
            cache: [],
            $submitting: false
        };
        
        this.data = this.data || {
            emails: [{ isPrimary: true }],
            phones: [{ isPrimary: true }]
        };

        this.$loading = true;
        this.$editing = false;
        this.$canEdit = false;
    }

    MemberContact.prototype.initialise = function(res) {

        var that = this;

        this.$dataPromise = Profile.getMemberContact().then(function(res) {

            that.$loading = false;

            that.$userCan = Permissions.formatPermissions(res.data.EntityActions); // Format the entity actions nicely

            that.data = res.data.MemberContact.ContactDetailItemResults;
            that.MemberId = res.data.MemberContact.MemberId;
            
            if (that.data) {
                that.data.emails = that.data.emails || [{ isPrimary: true }];
                that.data.phones = that.data.phones || [{ isPrimary: true }];
                that.data.addresses = that.data.addresses;
                
                // Populate the cache object with a copy of the data.  This will be updated upon successful updates of the data.
                that.phones.cache = angular.copy(that.data.phones);
                that.emails.cache = angular.copy(that.data.emails);
                that.addresses.cache = angular.copy(that.data.addresses);
            }

            return res;
        });
    };

    MemberContact.prototype.getAddress = function(globalPermission) {

        var memberContact = this,
            OPTIONS = {
                serviceName: 'Profile',
                dataPromise: memberContact.$dataPromise,
                getDataSuccessFn: function(that, res) {
                    res = angular.copy(res);
                    res.data = res.data.MemberContact.ContactDetailItemResults.addresses[0]; // Discard all other data other than the address
                    that.$userCan = memberContact.$userCan; // Pass entity actions to the address object
                    return res;
                },
                saveDataSuccessFn: function(that) {
                    that.$editing = false;
                },
                customProperties: {
                    $globalPermission: (globalPermission ? globalPermission : {})
                },
                saveAction: 'updateMemberContact', // createMemberContact should be called if no address is recorded
                successMsg: 'Your address has been updated successfully',
                errorMsg: 'Your address could not be updated at this time.  Please try again later'
            };

        return new ProfileFormFactory(OPTIONS);
    };

    MemberContact.prototype.getPersonalInfo = function(globalPermission) {
        var memberContact = this,
            OPTIONS = {
                serviceName: 'Profile',
                dataPromise: memberContact.$dataPromise,
                getDataSuccessFn: function(that, res) {
                    res = angular.copy(res);
                    res.data = res.data.MemberContact; // Discard all other data other than the personal info
                    that.$userCan = memberContact.$userCan; // Pass entity actions to the personal info object
                    that.selectData= {
                        SalutationId : [
                                            {
                                                'Label': 'Please select',
                                                'Value': 0
                                            },
                                            {
                                                'Label': 'Mr',
                                                'Value': 1
                                            },
                                            {
                                                'Label': 'Ms',
                                                'Value': 2
                                            },
                                            {
                                                'Label': 'Mrs',
                                                'Value': 3
                                            },
                                            {
                                                'Label': 'Miss',
                                                'Value': 4
                                            },
                                            {
                                                'Label': 'Dr',
                                                'Value': 5
                                            }]
                    };
                    return res;
                },
                saveDataFn: function(that, data) {
                    // This is a workaround for consistency until UTC is properly implemented in all APIs.
                    data.BirthDay = moment(data.BirthDay).startOf('day').format('YYYY-MM-DD[T]HH:mm:ss');
                    return data;
                },
                saveDataSuccessFn: function(that) {
                    that.$editing = false;
                },
                customProperties: {
                    $globalPermission: (globalPermission ? globalPermission : {})
                },
                saveAction: 'updatePersonalInfo',
                successMsg: 'Your personal information has been updated successfully',
                errorMsg: 'Your personal information could not be updated at this time.  Please try again later'
            };

        return new ProfileFormFactory(OPTIONS);
    };

    MemberContact.prototype.$save = function(type) {

        var isValidInput = true;
        var message = '';
        var that = this,
            currentList = that.data[type],
            oldList = that[type].cache,
            stringifiedCacheList = oldList.map(function(cache) {
                return JSON.stringify(cache);
            });
        
        var preValues = [];
        for (var i = 0 ; i < currentList.length; i++) {
            var currentItem = currentList[i];
            
            if(type === 'addresses') {
                currentItem.value = currentItem.CountryOriginId;
            }
            
            if (currentItem.value === undefined) {
                isValidInput = false;
                message += 'Your contacts is empty or contains letters. Please check again.';
            }
            if (preValues.indexOf(currentItem.value) >= 0) {
                isValidInput = false;
                message += 'Your contacts is duplicated. Please check again.';
            }
            preValues.push(currentItem.value);
        }
        if (!isValidInput) {
            $notify.add({
                message: message,
                type: 'error'
            });
        }

        if (isValidInput) {
            var promises = []; // Each contact that is updated is sent to the server in a serparate request

            this[type].$submitting = true; // Set the saving flag to trigger loading indicators

            // Loop through all current items and if they aren't in the cache list ie. 
            // have not changed, then send them to the server
            currentList.forEach(function(item) {

                // New items don't have a type yet, set a type here if there isn't one already
                item.Type = item.Type ? item.Type : type;

                // $$hashkey buggers up the cache, so i duplicate the item and 
                // delete it, without removing it from the original item...
                // because I'm scared.
                var contactItem = angular.copy(item);
                delete contactItem.$$hashKey;

                var indexInCache = stringifiedCacheList.indexOf(JSON.stringify(contactItem));

                if (indexInCache === -1) { // If the item is not in our cache ie. not on the server already
                    promises.push(saveContact(item));
                }
            });
            
            var dataUpdate = 'email address';
            
            if(type === 'phones') {
                dataUpdate = 'phone number';
            }else if(type === 'addresses') {
                dataUpdate = 'country of origin';
            }
            
            // Once all posts to the server have finished
            $q.all(promises).then(function(res) {

                that.$editing = false; // This flag will hide the form from view
                
                $notify.add({
                    message: 'Your ' + dataUpdate + ' has been updated successfully',
                    type: 'success'
                });

                //update cache
                that[type].cache = angular.copy(that.data[type]);
                that[type].$submitting = false;

            }, function(res) {

                $notify.add({
                    message: 'Your ' + dataUpdate + ' could not be saved at this time.  Please try again later',
                    type: 'error'
                });

                that[type].$submitting = false;

                return $q.reject(res);
            });
        }

    };

    // Make a call to the service to send the contact data through to the server
    function saveContact(data) {

        var action = data.ContactInfoId && data.ContactInfoId > 0 ? 'updateMemberContact' : 'createMemberContact';

        return Profile[action](data).then(function(res) {
            data.ContactInfoId = data.ContactInfoId ? data.ContactInfoId : res.data; // Add in the contact id we get back from the server to the email / phone number
        });
    }

    MemberContact.prototype.$edit = function(section) {

        if (section !== this.$editing) {
            // save the current data, if it's cancelled we will save it back again
            this.$editing = section;
        }
    };

    MemberContact.prototype.$cancel = function(type) {
        this.$editing = false;
        this.data[type] = angular.copy(this[type].cache); // Reset data to the value we had stored before editing began
    };

    MemberContact.prototype.$remove = function(contacts, ind) {

        var that = this,
            contact = contacts[ind];

        if (contact.ContactInfoId) { // Testing if the contact info lives on the server or just in the UI

            that[contact.Type].$submitting = true;

            Profile.removeMemberContact(contact.ContactInfoId, that.MemberId).then(function(res) {
                that.data[contact.Type].splice(ind, 1);
                that[contact.Type].cache.splice(ind, 1);
                that[contact.Type].$submitting = false;
            });

        } else {
            contacts.splice(ind, 1);
        }
    };

    return MemberContact;

}]);
