angular.module('ui.recruit.models')

    .factory('JobAdsAssessorModel', [ () => {
        return class JobAdsAssessorModel {
            constructor(id = null, name = null, type = null, description = null) {
                this.id               = id;
                this.name             = name;
                this.type             = type;
                this.description      = description;
            }

            /*
             * Create the object from the return payload
             */
            static fromApi(assessors) {
                let response = [];
                for(let assessor of assessors) {
                    if(typeof assessor === 'object') {
                        if(assessor.SearchMemberGroup) {
                            response.push(
                                new JobAdsAssessorModel(
                                    assessor.SearchMemberGroup.Id,
                                    assessor.SearchMemberGroup.Name,
                                    assessor.SearchMemberGroup.Type,
                                    (assessor.SearchMemberGroup.Description !== null)? assessor.SearchMemberGroup.Description :  assessor.SearchMemberGroup.Type
                                )
                            );
                        }else{
                            response.push(
                                new JobAdsAssessorModel(
                                    assessor.Id,
                                    assessor.Name,
                                    assessor.Type,
                                    assessor.Description
                                )
                            );
                        }

                    } else {
                        throw new Error('API has returned a none object type ${assessors}');
                    }

                }
                return response;
            }
            /*
             * Prepare the JSON payload to send to the API
             */
            static toApi(listAssessor) {
                let response = {
                    MemberIds: [],
                    GroupIds: []
                };
                for (let assessor of listAssessor) {
                    if (assessor.type === 'NetworkGroup' || assessor.type === 'Group') {
                        response.GroupIds.push(assessor.id);
                    } else if (assessor.type === 'Member')
                        response.MemberIds.push(assessor.id);
                }
                return response;
            }
        };
    }]);