angular.module('ui.common')

.factory('MemberContactDataFactory', function() {

    var MemberContact = {
        phones: {
            toServer: function(data) {
                return {
                    Phone: data.value.replace(/\s/g, ''), // Strip whitespace before sending to server
                    IsPrimary: data.isPrimary,
                    IsPrivate: !data.isPublic,
                    CanAcceptSms: data.isMobile,
                    CanAcceptVoiceCall: true,
                    CanAcceptFax: false
                };                
            },
            fromServer: function(serverData) {
                return {
                    value: serverData.MobilePhone, //This looks wrong like it's missing non-mobile numbers
                    isPrimary: serverData.IsPrimary,
                    isMobile: serverData.CanAcceptSms,
                    isPublic: !serverData.IsPrivate
                };
            }
        },
        emails: {
            toServer: function(data) {                
                return {
                    Email: data.value,
                    CanAcceptHtml: true, // is this needed for phone?
                    IsPrimary: data.isPrimary,
                    IsPrivate: !data.isPublic,
                };
            },
            fromServer: function(serverData) {
                return {
                    value: serverData.Email,
                    isPrimary: serverData.IsPrimary,
                    isPublic: !serverData.IsPrivate
                };
            }
        },
        addresses: {
            toServer: function(data) {
                return {
                    Address: data.Address,
                    Suburb: data.Suburb,
                    City: data.City,
                    Postcode: data.Postcode,
                    StateName: data.StateName,
                    CountryId: data.CountryId.Value,
                    CountryOriginId: data.CountryOriginId.Value,
                    IsMailingAddress: true,
                    IsPhysicalAddress: true
                };
            },
            fromServer: function(serverData) {
                return {
                    Address: serverData.Address,
                    Suburb: serverData.Suburb,
                    City: serverData.City,
                    Postcode: serverData.Postcode,
                    StateName: serverData.StateName,
                    CountryId: {
                        Value: serverData.CountryId,
                        Label: serverData.Country ? serverData.Country.Label : null
                    },
                    CountryOriginId: {
                        Value: serverData.CountryOriginId,
                        Label: serverData.CountryOrigin ? serverData.CountryOrigin.Label : null
                    }
                };
            }
        },
        typeNums: {
            addresses: 'ad',
            phones: 'p',
            emails: 'e',
        },
        process: {
            getType: function(val, fromNum) {
                
                if(fromNum) {
                    return Object.keys(MemberContact.typeNums).filter(function(key) {
                        return MemberContact.typeNums[key] === val;
                    })[0];
                } else {
                    return MemberContact.typeNums[val];
                }

            },
            toServer: function(data) {
                
                var type = data.Type;
                var typeData = MemberContact[type];

                if( typeData ) {
                    data = typeData.toServer(data);
                    data.Type = MemberContact.process.getType( type );
                }
                
                return data;
            },
            fromServer: function(serverData) {

                var data = {},
                    type = MemberContact.process.getType( serverData.Type, true ),
                    typeData = MemberContact[type];

                if( typeData ) {
                    data = typeData.fromServer(serverData);
                    data.Type = type;
                    data.ContactInfoId = serverData.ContactInfoId;
                }

                return data;
            },
            groupContacts: function(contacts) {
                
                // takes an array of contacts, and turns them into an object of 
                // contact type arrays.
                var returnObj = {};

                contacts.forEach(function(contact) {
                    
                    // If our object does not have a property for the type yet eg. ret.emails - create it.
                    if( !returnObj[contact.Type] ) {
                        returnObj[contact.Type] = [];
                    }

                    returnObj[contact.Type].push(contact);
                });

                return returnObj;
            }
        }
    };
    
    return MemberContact;
    
});
