angular.module('ui.recruit.models')
    .factory('JobRequisitionDetailModel', ['Permissions', 'EntityActionsMixin', (Permissions, EntityActionsMixin) => {
        return class JobRequisitionDetailModel {
            constructor(owner, role, networkGroup, contactPerson, contactNumber, jobAdRequisitionId, createdDateTime, lastModifiedDateTime, state, subState, jobId, entityActions) {
                this.Owner = owner ? owner : null;

                this.Role = role ? {
                    RoleId: role.RoleId,
                    Description: role.Description
                } : null;

                this.Group = networkGroup ? {
                    NetworkGroupId: networkGroup.NetworkGroupId,
                    GroupName: networkGroup.GroupName,
                    Type: networkGroup.Type
                } : null;

                this.ContactPerson = contactPerson ? contactPerson : null;
                this.ContactNumber = contactNumber ? contactNumber : null;
                this.JobAdRequisitionId = jobAdRequisitionId ? jobAdRequisitionId : null;
                this.CreatedDateTime = createdDateTime ? createdDateTime : null;
                this.LastModifiedDateTime = lastModifiedDateTime ? lastModifiedDateTime : null;
                this.State = state ? state : null;
                this.SubState = (subState && subState !== '' ) ? subState : state;
                this.ExecutedJobId = jobId;
                this.Permissions = Permissions ? Permissions.formatPermissions(entityActions) : null;
                /**
                 * @return {boolean}
                 */
                this.IsValid = function() {
                    return !!(this.Role !== null && this.Group !== null);
                };
                EntityActionsMixin.$$mixInto(this);
                this.setupEntityActionsFromApi(entityActions);
            }

            /*
             * Create the object from the return payload
             */
            static fromApi(res) {
                let response;
                if (typeof res === 'object') {
                    response = res.data.JobRequisitionDetail || [res.data];
                    var obj = new JobRequisitionDetailModel(
                        response.Owner,
                        response.Role,
                        response.NetworkGroup,
                        response.ContactPerson,
                        response.ContactNumber,
                        response.JobAdRequisitionId,
                        response.CreatedDateTime,
                        response.LastModifiedDateTime,
                        response.State,
                        response.SubState,
                        response.ExecutedJobId,
                        res.data.EntityActions);
                    res.data = obj;
                } else {
                    throw new Error('API has returned a none object type ${JobRequisitionDetailItemResult}');
                }
                return res;
            }

            /*
             * Create new object to for create new Job requisition
             */
            formatRequisitionToApi() {
                if (typeof this === 'object') {
                    return {
                        Owner: this.Owner || null,
                        MemberRoleId: this.Role.RoleId || null,
                        NetworkGroupId: this.Group.NetworkGroupId || null,
                        ContactPerson: this.ContactPerson || null,
                        ContactNumber: this.ContactNumber || null,
                        JobAdRequisitionId: this.JobAdRequisitionId || null,
                        JobAdRequisitionState: this.JobAdRequisitionState || null
                    };
                } else {
                    throw new Error('Input data is not an object');
                }
            }
        };
    }]);
