angular.module('ui.recruit.models')
    .factory('JobRequisitionListModel', [
        'Permissions', 'FormatRequisition', 'EntityActionsMixin', 'REQUISITION_STATUS', (Permissions, FormatRequisition, EntityActionsMixin, REQUISITION_STATUS) => {

            function getStatePriority(state) {
                switch (state) {
                    case REQUISITION_STATUS.DRAFT:
                        return 0;
                        break;

                    case REQUISITION_STATUS.PENDING:
                        return 1;
                        break;

                    case REQUISITION_STATUS.REQ_CHANGES:
                        return 2;
                        break;

                    case REQUISITION_STATUS.APPROVED:
                        return 3;
                        break;

                    case REQUISITION_STATUS.REJECTED:
                        return 4;
                        break;

                    case REQUISITION_STATUS.EXECUTED:
                        return 5;
                        break;

                    case REQUISITION_STATUS.CANCELLED:
                        return 6;
                        break;

                    case REQUISITION_STATUS.DELETED:
                        return 7;
                        break;

                    case REQUISITION_STATUS.ARCHIVED:
                        return 8;
                        break;
                }
            }

            return class JobRequisitionListModel {

                static fromApi(requisitions) {
                    let response;
                    if (typeof requisitions === 'object') {
                        response = requisitions.data.JobRequisitionSummaryItemResult || [requisitions.data];

                        var obj = {
                            JobRequisitionItems: response.map((item) => {
                                EntityActionsMixin.$$mixInto(item);
                                item.setupEntityActionsFromApi(item.EntityActions);
                                return {
                                    Id: item.JobRequisitionSummary.JobAdRequisitionId,
                                    Name: item.JobRequisitionSummary.RoleTitle,
                                    Location: item.JobRequisitionSummary.NetworkGroup.GroupName,
                                    CreateDate: item.JobRequisitionSummary.CreatedDateTime,
                                    LastUpdateDate: item.JobRequisitionSummary.LastModifiedDateTime,
                                    Requestor: FormatRequisition.formatOwner(item.JobRequisitionSummary.Owner),
                                    State: (item.JobRequisitionSummary.SubState && item.JobRequisitionSummary.SubState != '')
                                        ? item.JobRequisitionSummary.SubState : item.JobRequisitionSummary.State,
                                    StatePriority: (item.JobRequisitionSummary.SubState && item.JobRequisitionSummary.SubState != '') ? getStatePriority(item.JobRequisitionSummary.SubState) : getStatePriority(item.JobRequisitionSummary.State),
                                    UserCan: item.userCan,
                                    $$actions: item.$$actions
                                };
                            })
                        };

                        EntityActionsMixin.$$mixInto(obj);
                        obj.setupEntityActionsFromApi(requisitions.data.EntityActions);

                        requisitions.data = obj;

                    } else {
                        throw new Error('API has returned a none object type ${JobRequisitionSummaryListItemResult}');
                    }

                    return requisitions;
                }
            };
        }]);