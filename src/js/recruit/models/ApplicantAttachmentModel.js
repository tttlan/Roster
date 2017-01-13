angular.module('ui.recruit.models')
    .factory('ApplicantAttachmentModel', [ () => {
            return class ApplicantAttachmentModel {
                constructor(resumeId, resumeFilename, coverLetterId, coverLetterFilename) {
                    this.resumeId = resumeId;
                    this.resumeFilename = resumeFilename;
                    this.coverLetterId = coverLetterId;
                    this.coverLetterFilename = coverLetterFilename;
                }
            };
}]);