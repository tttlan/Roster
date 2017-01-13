angular.module('ui.recruit.jobs')
    .factory('EmailService', ['$server', '$HTTPCache', 'API_BASE_URL', 'EmailTemplateModel',
        function($server, $HTTPCache, API_BASE_URL, EmailTemplateModel) {
            let EMAIL_TEMPLATE_NAMESPACE = API_BASE_URL + 'candidate/emailtemplates';
            // let EMAIL_SEND_NAMESPACE = API_BASE_URL + 'candidate/Emails/Send';
            let factory = {
                getEmailTemplates() {
                    return $server.get({
                        url: EMAIL_TEMPLATE_NAMESPACE
                    }).then((res) => {
                        return  EmailTemplateModel.fromApi(res.data);
                    });
                },

                getEmailTemplate(url) {
                    return  $server.get({ url });
                },

                sendEmail(email, sendEmailUrl) {
                    return $server.update({
                        url: sendEmailUrl,
                        data : email.toApi()
                    });
                },

            };

            return factory;
        }]);