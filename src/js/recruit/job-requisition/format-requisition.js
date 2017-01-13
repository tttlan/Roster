angular.module('ui.recruit.job-requisition')
    .service('FormatRequisition', [
        'Permissions', function(Permissions) {

            //#region formatOwner
            function formatOwner(obj) {
                return obj ? {
                    Id: obj.MemberId,
                    FirstName: obj.FirstName,
                    SurName: obj.Surname,
                    PhotoLarge: obj.PhotoLarge,
                    PhotoThumb: obj.PhotoThumb,
                    PhotoThumbMini: obj.PhotoThumbMini,
                    Role: obj.RoleTitle
                } : {};
            }
            //#endregion

            // function formatLocationBySummaryItemResult(obj) {
            //     var locationObj = {};
            //     if (obj) {
            //         locationObj = {
            //             GroupName: obj.NetworkGroupDetail.GroupName,
            //             IsTrainingLocation: obj.NetworkGroupDetail.IsTrainingLocation,
            //             LookupUrl: obj.NetworkGroupDetail.LookupUrl,
            //             NetworkGroupId: obj.NetworkGroupDetail.NetworkGroupId,
            //             Type: obj.NetworkGroupDetail.Type,
            //             Permissions: Permissions.formatPermissions(obj.EntityActions)
            //         }
            //     }
            //
            //     return locationObj;
            // }

            return {
                formatOwner : formatOwner,
                // formatLocationBySummaryItemResult: formatLocationBySummaryItemResult,
            };
        }
    ]);