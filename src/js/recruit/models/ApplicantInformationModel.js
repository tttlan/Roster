angular.module('ui.recruit.models')
    .factory('ApplicantInformationModel', ['Permissions', (Permissions) => {
        return class ApplicantInformationModel {
            constructor(MemberId, FirstName, Surname, PhotoLarge, PhotoThumb, PhotoThumbMini, RoleTitle, DefaultNetworkGroupId, Birthday) {
                this.MemberId = MemberId;
                this.FirstName = FirstName;
                this.Surname = Surname;
                this.PhotoLarge = PhotoLarge;
                this.PhotoThumb = PhotoThumb;
                this.PhotoThumbMini = PhotoThumbMini;
                this.RoleTitle = RoleTitle;
                this.DefaultNetworkGroupId = DefaultNetworkGroupId;
                this.Birthday = Birthday;

            }


            static fromApi(apiModel) {
                return new ApplicantInformationModel(
                    apiModel.MemberId,
                    apiModel.FirstName,
                    apiModel.Surname,
                    apiModel.PhotoLarge,
                    apiModel.PhotoThumb,
                    apiModel.PhotoThumbMini,
                    apiModel.RoleTitle,
                    apiModel.DefaultNetworkGroupId,
                    apiModel.Birthday

                );

            }

            toApi() {
                return this;
            }
        };
    }
]);