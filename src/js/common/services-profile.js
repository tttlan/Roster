angular.module('ui.common')


// Profiles factory
// ----------------------------------------

.factory('Profile', ['$server', 'API_BASE_URL', '$HTTPCache', '$routeParams', 'MemberContactDataFactory', 'Url', '$q', '$cookies',
    function($server, API_BASE_URL, $HTTPCache, $routeParams, MemberContactDataFactory, Url, $q, $cookies) {

    var PROFILE_NAMESPACE = API_BASE_URL + 'profilemanagement/';
    var DOCUMENTS_URL = API_BASE_URL + 'documents/';
    var PROFILE_CONTENT = API_BASE_URL + 'profilecontents/';

    var ARTIFACT_TYPE = {
        0: 'None',
        8: 'Audio',
        10: 'Compress',
        1: 'Document',
        2: 'Image',
        5: 'PaySlip',
        4: 'ProfilePhoto',
        6: 'ShortCut',
        3: 'Template',
        7: 'TextNote',
        9: 'Video'
    };
    
    // Get the current member id for a request
    function getMemberId() {
        return $routeParams.memberId ? $routeParams.memberId : 'me';
    }
    
    // Function that takes an object property and copies it's contents to a level higher
    function flattenObjectProperty(property, data) {

        angular.forEach(data[property], function(value, key) { // Loop through the items in the passed in object property 
            data[key] = value; // And place the value of the item at the root of the object so it goes nicely into the form builder
        });
        
        delete data[property]; // Delete the nested object property

        return data;
    }

    var Profile = {

        getProfileRecord: function() {         

            var url = PROFILE_NAMESPACE + getMemberId() + '/profilerecord';

            return $server.get({
                'url': url
            });
        },

        updatePersonalInfo: function(data) {
            var url = PROFILE_NAMESPACE + getMemberId() + '/personalinfo';
                                    
            return $server.update({
                'url': url,
                'data': data
            }).then(function(res) {
                
                $HTTPCache.clear('profilemanagement');
                return res;
            });
        },

        getMemberContact: function() {

            var url = PROFILE_NAMESPACE + getMemberId() + '/membercontacts';

            return $server.get({
                'url': url
            }).then(function(res) {
                    
                if (res.data.MemberContact.ContactDetailItemResults) {
                    res.data.MemberContact.ContactDetailItemResults = MemberContactDataFactory.process.groupContacts(res.data.MemberContact.ContactDetailItemResults.ContactInfoItemResults.map(function(contact) {
                        return MemberContactDataFactory.process.fromServer(contact.ContactInfoDetail);
                    }));
                }

                return res;
            });
        },

        createMemberContact: function(data) {

            var url = PROFILE_NAMESPACE + getMemberId() + '/' + data.Type;

            data = MemberContactDataFactory.process.toServer(data);

            return $server.create({
                'url': url,
                'data': data
            }).then(function(res) {
                $HTTPCache.clear('profilemanagement');
                return res;
            });
        },

        createMemberContacts: function (data, type) {

            var url = PROFILE_NAMESPACE + getMemberId() + '/' + type + '/multiple';

            data = data.map(function (item) {
                return MemberContactDataFactory.process.toServer(item);
            });
            
            list = { ContactList : data};

            return $server.create({
                'url': url,
                'data': list
            }).then(function (res) {
                $HTTPCache.clear('profilemanagement');
                return res;
            });
        },

        updateMemberContact: function(data) {
            
            var url = PROFILE_NAMESPACE + getMemberId() + '/' + data.Type + '/' + data.ContactInfoId;

            data = MemberContactDataFactory.process.toServer(data);

            return $server.update({
                'url': url,
                'data': data
            }).then(function(res) {
                $HTTPCache.clear('profilemanagement');
                return res;
            });

        },

        removeMemberContact: function(contactInfoId, memberId) {

            var url = PROFILE_NAMESPACE + memberId + '/membercontact/' + contactInfoId;
            
            return $server.remove({
                'url': url
            }).then(function(res) {
                
                $HTTPCache.clear('profilemanagement');
                return res;
            });

        },

        getEmergencyContact: function() {

            var url = PROFILE_NAMESPACE + getMemberId() + '/emergencycontact';

            return $server.get({
                'url': url
            }).then(function(res) {
                
                res.data.MemberEmergencyContactDetail = flattenObjectProperty('ContactInfo', res.data.MemberEmergencyContactDetail);
                return res;
            });
        },

        updateEmergencyContact: function(data) {

            var url = PROFILE_NAMESPACE + getMemberId() + '/emergencycontact';
            
            data.CountryId = data.CountryId ? data.CountryId.Value : null;
            data.StateRegionId = data.StateRegionId ? data.StateRegionId.Value : null;
            
            angular.forEach(['LinePhone1', 'LinePhone2', 'MobilePhone'], function(value) {
                if (data[value]) {
                    data[value] = data[value].replace(/\s/g, ''); // Strip whitespace from phone numbers
                }
            });
                       
            return $server.update({
                'url': url,
                'data': data
            }).then(function(res) {
                
                $HTTPCache.clear('profilemanagement');
                return res;
            });
        },

        getEmploymentInfo: function() {

            var url = PROFILE_NAMESPACE + getMemberId() + '/employmentinfo';

            return $server.get({
                'url': url
            });
        },

        updateEmploymentInfo: function(data) {

            var url = PROFILE_NAMESPACE +  getMemberId() + '/employmentinfo';

            return $server.update({
                'url': url,
                'data': data
            }).then(function(res) {
                
                $HTTPCache.clear('profilemanagement');
                return res;
            });
        },

        getMemberEmploymentHistory: function(memberId) {
            
            var url = PROFILE_NAMESPACE + getMemberId() + '/memberemploymenthistory';

            return $server.get({
                'url': url
            }).then(function(res) {

                if (res.data.PromotionHistoryEntries) {
                    res.data.PromotionHistoryEntries.map(function(item, i) {
                        var prev = res.data.PromotionHistoryEntries[i-1];
                        item.EndDate = prev ? prev.CommencementDate : null;
                        return item;
                    });
                }

                return res;
            });
        },

        // ToDo: Change call URI to point to the right namespace
        getMemberTrainingSubjects: function() {
            
            var MEMBERS_NAMESPACE = API_BASE_URL + 'members/',
                url = MEMBERS_NAMESPACE + getMemberId() + '/training-subjects';
                    
            return $server.get({
                'url': url
            });

        },
        getMemberTrainingCourses: function() {
            
            var url = API_BASE_URL + 'members/' + getMemberId() + '/training-courses';
            return $server.get({
                'url': url
            });

        },

        getMemberTrainingSubjectsByCourse: function(courseId) {
            
            var MEMBERS_NAMESPACE = API_BASE_URL + 'members/',
                url = MEMBERS_NAMESPACE + getMemberId() + '/training-courses/' + courseId + '/training-subjects';
                    
            return $server.get({
                'url': url
            });

        },

        getMemberBankDetail: function(data) {

            var url = PROFILE_NAMESPACE + 'memberbankdetail';

            return $server.create({
                url: url,
                data: data
            });
        },
        
        updateMemberBankDetail: function(data) {

            var url = PROFILE_NAMESPACE + 'updateMemberBankDetail';

            return $server.update({
                'url': url,
                'data': data
            }).then(function(res) {
                
                $HTTPCache.clear('profilemanagement');
                return res;
            });
        },
        
        getAddressDetails: function(data, format) {
            var url = PROFILE_NAMESPACE + 'locationlookup';
            
            return $server.get({
                'url': url,
                'query': {
                    st: data.postcode ? data.postcode : '',
                    countryId: data.countryId ? data.countryId : ''
                }
            }).then(function(res) {
                
                $HTTPCache.clear('profilemanagement');
                if (format) {
                    if(res.data.length) {
                        res.data = res.data.map(function(state) {
                            return {
                                    'Label': state.Locality,
                                    'Value': state.Id
                                   };
                        });
                    }
                }
                return res;
            });
        },
        
        
        
        /*
         * Documents
         */
        
        getEmployeeDocuments: function() {
            
            var url = DOCUMENTS_URL + getMemberId() + '/hardcopy';

            return $server.get({
                'url': url
            });        
        },
        
        getOnboardingDocuments: function() {
            
            var url = DOCUMENTS_URL + getMemberId() + '/onboarddocument';

            return $server.get({
                'url': url
            });        
        },

        getNotes: function(p) {
            var url = PROFILE_CONTENT + getMemberId() + '/contents';
            var filterBy = p.FilterBy ? p.FilterBy : '';
            var query = {
                'p': p.Page,
                'ps': p.PageSize,
                'f': filterBy
            };
            return $server.get({
                'url': url,
                'query': query
            }).then(function(res) {
                res.data.ContentSummaryItemResults = res.data.ContentSummaryItemResults.map(function(item) {
                    if(item.ContentSummary.Description) {
                        item.ContentSummary.Description = Url.parseText(item.ContentSummary.Description).text;
                    }
                    if(item.ContentSummary.Document && item.ContentSummary.Document.ArtifactTypeId) { item.ContentSummary.Document.ArtifactType = ARTIFACT_TYPE[item.ContentSummary.Document.ArtifactTypeId];}
                    return item;
                });
                return res;
            });        
        },
        createProfileNote: function(obj) {
            var data = angular.copy(obj);
            data = (data);
            var memberId = getMemberId();
            data.ContentType = 1;
            if(data.DocumentIds && data.DocumentIds.length) {
                data.DocumentId = data.DocumentIds[0];
                data.ContentType = 2;
            }
            var url = PROFILE_CONTENT + (memberId === 'me' ? 'me' : 'member/' + memberId);
            return $server.create({
                'url': url,
                'data': data
            }).then(function(res) {
                $HTTPCache.clear('profilecontents');
                return res;
            });
        },
        updateProfileNote: function(obj) {
            var data = angular.copy(obj);
            var promiseList = [];
            if (!obj.userCan.canupdatefeedback) {
                data.Feedback = null;
            }
            if (obj.userCan.canedit) {
                var url = PROFILE_CONTENT + obj.ContentId;
                data.ContentType = 1;                                   // modify files
                if (data.DocumentIds && data.DocumentIds.length) {
                    data.DocumentId = data.DocumentIds[0];
                    data.ContentType = 2;
                }
                promiseList.push($server.update({
                    'url': url,
                    'data': data
                }));
            }
            if (promiseList.length === 0) {
                return $q.reject('No permission to update profile\'s notes.');
            }
            return $q.all(promiseList).then(function(res) {
                $HTTPCache.clear('profilecontents');
                return res;
            });
        },
        getNoteById: function(id) {
            var url = PROFILE_CONTENT + id;
            return $server.get({
                'url': url
            }).then(function(res) {
                if(res.data.ProfileContentDetail.Description) { // should be check error format
                    res.data.ProfileContentDetail.Description =  Url.parseText(res.data.ProfileContentDetail.Description).text;
                }
                return res;
            });
        },
        deleteNoteById: function(id) {
            var url = PROFILE_CONTENT + id;
            return $server.remove({
                'url': url
            }).then(function(res) { 
                $HTTPCache.clear('profilecontents');
                return res;
            });
        },
        /*
         * System settings
         */
        
        getSystemInfo: function() {
    
            var url = PROFILE_NAMESPACE + getMemberId() + '/systeminfo';
            
            return $server.get({
                'url': url
            });            
        },
        
        updateSystemInfo: function(data) {
    
            var url = PROFILE_NAMESPACE + getMemberId() + '/systeminfo';
            
            return $server.update({
                'url': url,
                'data': data
            }).then(function(res) {
                
                $HTTPCache.clear('profilemanagement');
                if (res.data.MemberSystemInfo.EncryptTicket) {
                    $cookies['Sherpa.aspxauth'] = res.data.MemberSystemInfo.EncryptTicket;

                    var url = 'ws/AjaxServices.asmx/ChangeLoginName';
                    $.ajax({
                        type: "POST",
                        url: url,
                        data: '{ "loginName":"' + res.data.MemberSystemInfo.LoginName + '", "encTicket": "' + res.data.MemberSystemInfo.EncryptTicket + '"}',
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function() {
                            console.log("update authorization successfully.");
                        }
                    });
                }

                return res;
            });            
        },
        
        // Get select data for recruitment accounts
        getRecruitmentAccounts: function() {
            
            var url = PROFILE_NAMESPACE + 'accountrecruitments';
            
            return $server.get({
                'url': url
            });
        },       
        
        /*
         * Permissions
         */
        
        getPermissions: function() {
   
            var url = PROFILE_NAMESPACE + getMemberId() + '/permissions';

            return $server.get({
                'url': url
            });            
        },
        
        setPermission: function(data) {
                        
            var url = PROFILE_NAMESPACE + getMemberId() + '/permissioncapabilities/' + data.CapabilityId;
            delete data.CapabilityId;

            return $server.update({
                'url': url,
                'data': data
            }).then(function(res) {
                
                $HTTPCache.clear('profilemanagement');
                return res;
            });
        },
        
        /*
         * Workflows
         */
        
        getWorkflows: function() {

            var url = PROFILE_NAMESPACE + getMemberId() + '/workflows';
            //var url = 'http://localhost/interfaceSource/test/mockData/api/profilemanagement/workflows/'
            return $server.get({
                'url': url
            });            
        },
        
        setWorkflow: function(data) {
                        
            var url = PROFILE_NAMESPACE + getMemberId() + '/workflows';
            data.StartDate = moment(data.StartDate).utc();
            data.EndDate = moment(data.EndDate).utc();

            return $server.create({
                'url': url,
                'data': data
            }).then(function(res) {
                
                $HTTPCache.clear('profilemanagement');
                return res;
            });
        }
    };

    return Profile;

}]);
