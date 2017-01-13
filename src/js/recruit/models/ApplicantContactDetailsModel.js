angular.module('ui.recruit.models')
    .factory('ApplicantContactDetailsModel', ['Permissions', (Permissions) => {
        return class ApplicantContactDetailsModel {
            constructor(ContactInfoId, Address, City, Suburb, Postcode, LinePhone1, LinePhone2, MobilePhone, Fax, Email, WebAddress, StateRegionId, StateName, CountryId, CountryName, Type, IsPrimary, IsPrivate) {
                this.ContactInfoId = ContactInfoId;
                this.Address       = Address;
                this.City          = City;
                this.Suburb        = Suburb;
                this.Postcode      = Postcode;
                this.LinePhone1    = LinePhone1;
                this.LinePhone2    = LinePhone2;
                this.MobilePhone   = MobilePhone;
                this.Fax           = Fax;
                this.Email         = Email;
                this.WebAddress    = WebAddress;
                this.StateRegionId = StateRegionId;
                this.StateName     = StateName;
                this.CountryId     = CountryId;
                this.CountryName   = CountryName;
                this.Type          = Type;
                this.IsPrimary     = IsPrimary;
                this.IsPrivate     = IsPrivate;

            }


            static fromApi(apiModel) {
                return new ApplicantContactDetailsModel(
                    apiModel.ContactInfoId,
                    apiModel.Address,
                    apiModel.City,
                    apiModel.Suburb,
                    apiModel.Postcode,
                    apiModel.LinePhone1,
                    apiModel.LinePhone2,
                    apiModel.MobilePhone,
                    apiModel.Fax,
                    apiModel.Email,
                    apiModel.WebAddress,
                    apiModel.StateRegionId,
                    apiModel.StateName,
                    apiModel.CountryId,
                    apiModel.CountryName,
                    apiModel.Type,
                    apiModel.IsPrimary,
                    apiModel.IsPrivate
                );
            }

            toApi() {
                return this;
            }
        };
    }
]);