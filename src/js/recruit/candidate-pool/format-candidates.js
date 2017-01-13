angular.module('ui.recruit.candidatepool')
.service('FormatCandidates', ['Permissions', function(Permissions) {

    function formatCandidateBySummaryItemResult(obj) {
        var candidateObj = {};
        if (obj) {

            var candidatePoolSumary = obj.CandidatePoolSummary;
            var info = candidatePoolSumary.CandidateInformation;
            var details = candidatePoolSumary.CandidateDetails;

            candidateObj = {

                CandidateDetails: details,
                Active: info.Active,
                BirthDay: info.BirthDay,
                DateRegistered: info.DateRegistered,
                FirstName: info.FirstName,
                FullName: info.FirstName + ' ' + info.Surname,
                LastModified: info.LastModified,
                MemberId: info.MemberId,
                MemberType: info.MemberType,
                PhotoThumb: info.PhotoThumb,
                PreferredName: info.PreferredName,
                Salutation: info.Salutation,
                Sex: info.Sex,
                Surname: info.Surname,
                Title: info.Title,
                CommentsCount: candidatePoolSumary.CommentsCount,
                CvExtract: candidatePoolSumary.CvExtract,
                IsBlackList: candidatePoolSumary.IsBlackList,
                IsStarredByCurrentManager: candidatePoolSumary.IsStarredByCurrentManager,
                Jobs: candidatePoolSumary.Jobs,
                AppliedJobCount: candidatePoolSumary.AppliedJobCount,
                RegisteredDate: candidatePoolSumary.RegisteredDate,
                ResumeCandidateSummary: candidatePoolSumary.ResumeCandidateSummary,
                ResumeDocumentId: candidatePoolSumary.ResumeDocumentId,
                Stores: candidatePoolSumary.Stores,
                Tags: candidatePoolSumary.Tags.map(function(item) {
                    return {
                        id: item.JobTagId,
                        label: item.TagDesc
                    };
                }),
                CanSelect: true,
                IsSelected: false,
                Permissions: Permissions.formatPermissions(obj.EntityActions),
                Email: getCandidateEmail(details),
                CandidateApplicationHistory: null,
                IsLoading: false,
                IsSettingStar: false
            };
        }

        return candidateObj;
    }

    function formatCandidatePoolSummaryItemResult(res) {
        var obj = res.data;
        var CandidatePoolSummary = obj.CandidatePoolSummary;
        var CandidateInformation = CandidatePoolSummary.CandidateInformation;
        var candidateDetail = {
            ContactInfo: formatCandidateDetails(CandidatePoolSummary.CandidateDetails),
            Active: CandidateInformation.Active,
            BirthDay: CandidateInformation.BirthDay,
            DateRegistered: CandidateInformation.DateRegistered,
            FirstName: CandidateInformation.FirstName,
            FullName: CandidateInformation.FirstName + ' ' + CandidateInformation.Surname,
            LastModified: CandidateInformation.LastModified,
            MemberId: CandidateInformation.MemberId,
            MemberType: CandidateInformation.MemberType,
            PhotoThumb: CandidateInformation.PhotoThumb,
            PreferredName: CandidateInformation.PreferredName,
            Salutation: CandidateInformation.Salutation,
            Sex: CandidateInformation.Sex,
            Surname: CandidateInformation.Surname,
            Title: CandidateInformation.Title,
            CommentsCount: CandidatePoolSummary.CommentsCount,
            CvExtract: CandidatePoolSummary.CvExtract,
            IsBlackList: CandidatePoolSummary.IsBlackList,
            IsStarredByCurrentManager: CandidatePoolSummary.IsStarredByCurrentManager,
            Job: CandidatePoolSummary.Job,
            RegisteredDate: CandidatePoolSummary.RegisteredDate,
            ResumeCandidateSummary: CandidatePoolSummary.ResumeCandidateSummary,
            ResumeDocumentId: CandidatePoolSummary.ResumeDocumentId,
            Stores: CandidatePoolSummary.Stores,
            Tags: CandidatePoolSummary.Tags,
            Permission: Permissions.formatPermissions(obj.EntityActions)
        };
        res.data = candidateDetail;
        return res.data;
    }

    function getCandidateEmail(obj) {
        var email = null;
        angular.forEach(obj, function(detail, index) {
            if (detail.Type === 'e') {
                email = detail.Email;
            }
        });

        return email;
    }

    //#region private format function
    function formatCandidateDetails(array) {
        var contactInfo = {
            Address: null,
            City: null,
            CountryId: null,
            Emails: [],
            //Fax: null,
            //LinePhone1: null,
            //LinePhone2: null,
            MobilePhones: [],
            Postcode: null,
            StateName: null,
            StateRegionId: null,
            Suburb: null,
        };
        angular.forEach(array, function(item, index) {
            if (item.Type === 'e') {
                contactInfo.Emails.push({
                    value: item.Email,
                    isPrimary: false,
                    isPublic: false
                });
            }
            else if (item.Type === "p") {
                contactInfo.MobilePhones.push({
                    value: item.MobilePhone,
                    isPrimary: false,
                    isPublic: false
                }
                );
            }
            else if (item.Type === "ad") {
                contactInfo.Address = item.Address;
                contactInfo.City = item.City;
                contactInfo.Postcode = item.Postcode;
                contactInfo.StateName = item.StateName;
                contactInfo.StateRegionId = item.StateRegionId;
                contactInfo.Suburb = item.Suburb;
                contactInfo.CountryId = item.CountryId;
            }
        });

        return contactInfo;
    }
    //#endregion

    return {
        formatCandidateBySummaryItemResult: formatCandidateBySummaryItemResult,
        formatCandidatePoolSummaryItemResult: formatCandidatePoolSummaryItemResult,
    };
}]);