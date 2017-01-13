angular.module('ui.recruit.models')

    .factory('JobAdsDetailsModel', ['SalaryType', 'JobLocation', 'EntityActionsMixin', 'JobAdsAssessorModel', 'JobAdsBoardsModel', 'JobAdsQuestionnaireModel', 'JobStatusConstants', '$log',
        (SalaryType, JobLocation, EntityActionsMixin, JobAdsAssessorModel, JobAdsBoardsModel, JobAdsQuestionnaireModel, JobStatusConstants, $log) => {
            return class JobAdsDetailsModel {
                constructor(refNumber = '',
                            jobTitle = '',
                            dateFirstPosted = '',
                            statusCode = null,
                            selectedLocations = [],
                            state = '',
                            area = '',
                            employmentTypeId = '',
                            employmentTypeTitle,
                            allowOverseas = false,
                            salaryType = SalaryType.ANNUAL,
                            salaryRangeOrAmount = SalaryType.RANGE,
                            salaryCurrency = '',
                            salaryMax = '',
                            salaryMin = '',
                            amount = '',
                            displaySalary = false,
                            addBenefits = '',
                            selectedJobTags = [],
                            jobSummary = '',
                            jobBody = '',
                            entityActions = [],
                            customQuestionTemplateDetails = [],
                            jobId = null,
                            jobPostsInfo = null,
                            lastJobHistory = '',
                            listDefaultAssessor = [],
                            owner = null,
                            locationText = '') {
                    this.refNumber = refNumber;
                    this.jobTitle = jobTitle;
                    this.dateFirstPosted = dateFirstPosted;
                    this.statusCode = statusCode;
                    this.locationOrRegion = state.Value ? JobLocation.REGION : JobLocation.LOCATION;
                    this.selectedLocations = selectedLocations;
                    this.state = state;
                    this.area = area;
                    this.employmentTypeId = employmentTypeId;
                    this.employmentTypeTitle = employmentTypeTitle;
                    this.allowOverseas = allowOverseas;
                    this.salaryType = salaryType;
                    this.salaryRangeOrAmount = salaryRangeOrAmount;
                    this.salaryCurrency = salaryCurrency;
                    this.salaryMax = salaryMax;
                    this.salaryMin = salaryMin;
                    this.amount = amount; //For some wierd reason 'amountValue' cannot be used
                    this.displaySalary = displaySalary;
                    this.addBenefits = addBenefits;
                    this.selectedJobTags = selectedJobTags;
                    this.jobSummary = jobSummary;
                    this.jobBody = jobBody;
                    this.networkId = owner !== null ? owner.NetworkId : null;
                    this.locationText = locationText;

                    //Add the entityactions behaviour
                    EntityActionsMixin.$$mixInto(this);

                    //Prepare entity actions
                    this.setupEntityActionsFromApi(entityActions);

                    this.customQuestionTemplateDetails = customQuestionTemplateDetails;
                    this.jobId = jobId;
                    this.jobPostsInfo = jobPostsInfo;
                    this.lastJobHistory = lastJobHistory;
                    this.listDefaultAssessor = listDefaultAssessor;
                }

                /*
                 * Create the object from the return job ads details
                 */
                static fromApi(apiModel) {
                    let salaryMax = {}, salaryMin = {}, area = {}, state = {};
                    if (apiModel.JobDetail.SalaryMax && apiModel.JobDetail.SalaryMin) {
                        salaryMax = {
                            Label: apiModel.JobDetail.SalaryMax.Title,
                            Value: apiModel.JobDetail.SalaryMax.SalaryId
                        };
                        salaryMin = {
                            Label: apiModel.JobDetail.SalaryMin.Title,
                            Value: apiModel.JobDetail.SalaryMin.SalaryId
                        };
                    }
                    if (apiModel.JobDetail.JobRegion && apiModel.JobDetail.JobArea) {
                        state = {
                            'Value': apiModel.JobDetail.JobRegion.JobRegionId,
                            'Label': apiModel.JobDetail.JobRegion.JobRegionName
                        };
                        area = {
                            'Value': apiModel.JobDetail.JobArea.JobAreaId,
                            'Label': apiModel.JobDetail.JobArea.JobAreaName
                        };
                    }
                if (apiModel.JobDetail.JobAssessmentTeamSummaries && apiModel.JobDetail.JobAssessmentTeamSummaries.length){
                        let assessor = JobAdsAssessorModel.fromApi(apiModel.JobDetail.JobAssessmentTeamSummaries);
                        apiModel.JobDetail.JobAssessmentTeamSummaries = assessor;
                    }
                    return new JobAdsDetailsModel(
                        apiModel.JobDetail.JobReference,
                        apiModel.JobDetail.JobTitle,
                        apiModel.JobDetail.DateFirstPosted,
                        JobAdsDetailsModel.determineStatus(apiModel.JobDetail.JobStatusCode),
                        apiModel.JobDetail.Locations.map(function (location) {
                            if (location.NetworkGroup) {
                                return {
                                    'label': location.NetworkGroup.GroupName,
                                    'value': {
                                        'DistributionId': location.NetworkGroup.NetworkGroupId,
                                        'DistributionType': location.NetworkGroup.Type
                                    }
                                };
                            }
                            return {};
                        }),
                        state,
                        area,
                        apiModel.JobDetail.JobType ? apiModel.JobDetail.JobType.JobTypeId : null,
                        apiModel.JobDetail.JobType ? apiModel.JobDetail.JobType.Title : null,
                        apiModel.JobDetail.AllowOverSeaApplications,
                        apiModel.JobDetail.SalaryType === null || apiModel.JobDetail.SalaryType === 0 ? SalaryType.ANNUAL : apiModel.JobDetail.SalaryType,
                        apiModel.JobDetail.AmountType === null || apiModel.JobDetail.AmountType === 0 ? SalaryType.RANGE : apiModel.JobDetail.AmountType,
                        {'Value': apiModel.JobDetail.Currencytype, 'Label': apiModel.JobDetail.Currencytype},
                        salaryMax,
                        salaryMin,
                        apiModel.JobDetail.SalaryRate,
                        apiModel.JobDetail.DisplaySalary,
                        apiModel.JobDetail.AdditionalSalaryInfo,
                        apiModel.JobDetail.Positions.map(function (jobTag) {
                            return {
                                'label': jobTag.TagDesc,
                                'value': jobTag.JobTagId
                            };
                        }),
                        apiModel.JobDetail.Summary,
                        apiModel.JobDetail.DisplayableInfo,
                        apiModel.EntityActions,
                        JobAdsQuestionnaireModel.fromApi(apiModel.JobDetail.CustomQuestionTemplateDetails),
                        apiModel.JobDetail.Id,
                        JobAdsBoardsModel.fromApi(apiModel.JobDetail.JobPostsInfo),
                        apiModel.JobDetail.LastJobHistory,
                        apiModel.JobDetail.JobAssessmentTeamSummaries,
                        apiModel.JobDetail.Owner,
                        apiModel.JobDetail.Location
                    );
                }

                /*
                 * Prepare the JSON job ads details to send to the API
                 */
                toApi() {
                    let groupIds = [];
                    if (this.locationOrRegion === JobLocation.LOCATION) {
                        groupIds = this.selectedLocations.map(function (location) {
                            return location.value.DistributionId;
                        });
                        this.area = {};
                        this.state = {};
                    }
                    return {
                        Reference: this.refNumber,
                        JobTitle: this.jobTitle,
                        GroupIds: groupIds,
                        RegionXmlValue: this.state.Label,
                        AreaXmlValue: this.area.Label,
                        JobTypeId: this.employmentTypeId,
                        AllowOverseaApplications: this.allowOverseas,
                        SalaryType: this.salaryType,
                        AmountType: this.salaryRangeOrAmount,
                        CurencyType: this.salaryCurrency.Value,
                        SalaryRate: this.amount,
                        AdvertisedSalaryMinId : this.salaryMin ? this.salaryMin.Value : null,
                        AdvertisedSalaryMaxId : this.salaryMax ? this.salaryMax.Value : null,
                        DisplaySalary: this.displaySalary,
                        AdditionalSalaryInfo: this.addBenefits,
                        JobTagIds: this.selectedJobTags.map(function (tag) {
                            return tag.value;
                        }),
                        Summary: this.jobSummary,
                        DisplayableInfo: this.jobBody
                    };
                }

                /**
                 * Check model is valid????
                 */
            

                isValid() {
                    var isValidLocation ;
                     if (this.locationOrRegion === JobLocation.LOCATION) { // choose Location
                        isValidLocation =  (_.isArray(this.selectedLocations) && !_.isEmpty(this.selectedLocations));
                    }
                    else { // choose REGION
                        isValidLocation =  (!_.isNull(this.state) && !_.isEmpty(this.state.Label) 
                            && !_.isNull(this.area) &&  !_.isEmpty(this.area.Label));
                    }
                    return isValidLocation && JobAdsDetailsModel.isValidWordsCount(this.jobSummary);
                }

                
                static isValidWordsCount(htmlString){
                    if (htmlString !== null) {
                        var div = document.createElement('div');
                        var stringObj = htmlString.split('</p><p>');
                        htmlString = stringObj.join(' ');
                        div.innerHTML = htmlString;
                        var text = div.textContent;
                        return text.replace(/\s+/g, " ").trim().split(' ').length <= 25;  
                    } else {
                        return false;
                    }
                      
                }

                /*
                 * Determine the status title and its styles
                 */
                static determineStatus(statusCode) {
                    switch (statusCode) {
                        case JobStatusConstants.JOB_STATUS_ACTIVE:
                            return {
                                statusTitle: 'ACTIVE',
                                statusStyle: 'label--caution'
                            };
                        case JobStatusConstants.JOB_STATUS_PUBLISHED:
                            return {
                                statusTitle: 'PUBLISHED',
                                statusStyle: 'label--positive'
                            };
                        case JobStatusConstants.JOB_STATUS_DRAFT:
                            return {
                                statusTitle: 'DRAFT',
                                statusStyle: 'label--dark'
                            };
                        case JobStatusConstants.JOB_STATUS_CLOSED:
                            return {
                                statusTitle: 'CLOSED',
                                statusStyle: 'label--negative'
                            };
                        default:
                            'Status code $(statusCode) does not exist';
                    }
                }
            };
        }]);
