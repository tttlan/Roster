describe('Unit: Service: JobAdsService', function () {
    var $q, mockServer, JobAdsService, mockDataService, mockNotify, Permissions, $rootScope,
        JobAdsModel, EntityActionsMixin, JobLocation,
        mockJobAdsItemsModel, mockJobAdsAssessorModel, mockJobAdsBoardsModel, mockJobAdsDetailsModel, mockJobAdsQuestionnaireModel,
        JOB_NAMESPACE, JOB_BOARD_INTEGRATION_NAMESPACE, API_BASE_URL;

    var URL = {};
    var DEFAULT_DATETIME = '2016-06-23T16:15:10.899';

    beforeEach(function () {
        module('sherpa');
        module('test.services');

        mockJobAdsItemsModel = jasmine.createSpyObj('JobAdsItemsModel', [
            'fromApi'
        ]);

        mockJobAdsAssessorModel = jasmine.createSpyObj('JobAdsAssessorModel', [
            'fromApi',
            'toApi'
        ]);

        mockJobAdsBoardsModel = jasmine.createSpyObj('JobAdsBoardsModel', [
            'fromApi',
            'toApi'
        ]);

        mockJobAdsDetailsModel = jasmine.createSpyObj('JobAdsDetailsModel', [
            'fromApi'
        ]);

        mockJobAdsQuestionnaireModel = jasmine.createSpyObj('JobAdsQuestionnaireModel', [
            'fromApi',
            'toApi'
        ]);

        mockServer = jasmine.createSpyObj('$server', [
            'create',
            'get',
            'remove',
            'update'
        ]);

        mockNotify = jasmine.createSpyObj('$notify', [
            'add'
        ]);

        module(function ($provide) {
            $provide.value('$server', mockServer);
            $provide.value('$notify', mockNotify);
            $provide.value('JobAdsItemsModel', mockJobAdsItemsModel);
            $provide.value('JobAdsAssessorModel', mockJobAdsAssessorModel);
            $provide.value('JobAdsBoardsModel', mockJobAdsBoardsModel);
            $provide.value('JobAdsDetailsModel', mockJobAdsDetailsModel);
            $provide.value('JobAdsQuestionnaireModel', mockJobAdsQuestionnaireModel);
        });

        inject(function ($injector, _$rootScope_, _$q_, _mockDataService_) {
            $rootScope = _$rootScope_;
            $q = _$q_;
            mockDataService = _mockDataService_;
            Permissions = $injector.get('Permissions');
            JobAdsService = $injector.get('JobAdsService');
            JobAdsModel = $injector.get('JobAdsModel');
            EntityActionsMixin = $injector.get('EntityActionsMixin');
            JobLocation = $injector.get('JobLocation');
            API_BASE_URL = $injector.get('API_BASE_URL');
            JOB_NAMESPACE = API_BASE_URL + 'recruitments/jobs';
            JOB_BOARD_INTEGRATION_NAMESPACE = API_BASE_URL + 'jobBoardIntegration/jobs';

            URL = {
                assessor: {
                    list: API_BASE_URL + 'recruitments/Assessors/Search',
                    add: API_BASE_URL + 'recruitments/Jobs/10785/Assessors'
                },
                jobAd: {
                    list: JOB_NAMESPACE + '/search?s=unittest&p=1&ps=20&o=',
                    create: JOB_NAMESPACE,
                    update: JOB_NAMESPACE + '/' + 10785,
                    publish: JOB_BOARD_INTEGRATION_NAMESPACE + '/10785/publish',
                    remove: JOB_NAMESPACE + '/' + 10785
                },
                jobPost: {
                    internal: API_BASE_URL + 'recruitments/Jobs/10785/JobPosts/Internal',
                    website: API_BASE_URL + 'recruitments/Jobs/10785/JobPosts/Website',
                    seek: API_BASE_URL + 'recruitments/Jobs/10785/JobPosts/Seek',
                    careerOne: API_BASE_URL + 'recruitments/Jobs/10785/JobPosts/CareerOne',
                    oneShift: API_BASE_URL + 'recruitments/Jobs/10785/JobPosts/Oneshift',
                    twitter: API_BASE_URL + 'recruitments/Jobs/10785/JobPosts/Twitter',
                    facebook: API_BASE_URL + 'recruitments/Jobs/10785/JobPosts/Facebook',
                    update: API_BASE_URL + 'recruitments/Jobs/10785/JobPosts'
                },
                tag: {
                    list: API_BASE_URL + 'Recruitments/Tags/Search?s='
                },
                questionnaire: {
                    add: API_BASE_URL + 'Recruitments/Jobs/' + 10785 + '/QuestionTemplates',
                },
                networkGroup: API_BASE_URL + 'network/information/search?q=a&type=4',
                keyContact: API_BASE_URL + 'network/information/search?q=a&type=0'
            }

            // mockServer ------------------------------
            mockServer.get.and.callFake(function (obj) {
                switch (obj.url) {
                    case URL.assessor.list:
                        return mockDataService.get('api/recruit/job-ads/assessor/list/index.json');
                    case URL.jobAd.list:
                        return mockDataService.get('api/recruit/job-ads/list/index.json');
                    case URL.tag.list:
                        return mockDataService.get('api/recruit/job-ads/tag/list/index.json');
                    case URL.networkGroup:
                        return mockDataService.get('api/recruit/job-ads/networkGroup/index.json');
                    case URL.keyContact:
                        return mockDataService.get('api/recruit/job-ads/keyContact/index.json');
                }
            });
            mockServer.update.and.callFake(function (obj) {
                switch (obj.url) {
                    case URL.assessor.add:
                    case URL.jobPost.internal:
                    case URL.jobPost.website:
                    case URL.jobPost.seek:
                    case URL.jobPost.careerOne:
                    case URL.jobPost.oneShift:
                    case URL.jobPost.twitter:
                    case URL.jobPost.facebook:
                    case URL.jobPost.update:
                    case URL.jobAd.update:
                    case URL.jobAd.publish:
                    case URL.questionnaire.add:
                        return mockDataService.get('api/recruit/job-ads/success.json');
                }
            });
            mockServer.create.and.callFake(function (obj) {
                switch (obj.url) {
                    case URL.jobAd.create:
                        return mockDataService.get('api/recruit/job-ads/success.json');
                }
            })
            mockServer.remove.and.callFake(function (obj) {
                switch (obj.url) {
                    case URL.jobAd.remove:
                        return mockDataService.get('api/recruit/job-ads/success.json');
                }
            })
            //end mockServer ----------------------------

            // mockJobAdsAssessorModel -----------------------------------
            mockJobAdsAssessorModel.fromApi.and.callFake(function (res) {
                let response = [];
                for (let assessor of res) {
                    if (typeof assessor === 'object') {
                        if (assessor.SearchMemberGroup) {
                            response.push(
                                {
                                    id: assessor.SearchMemberGroup.Id,
                                    name: assessor.SearchMemberGroup.Name,
                                    type: assessor.SearchMemberGroup.Type,
                                    description: (assessor.SearchMemberGroup.Description !== null) ? assessor.SearchMemberGroup.Description : assessor.SearchMemberGroup.Type
                                }
                            );
                        } else {
                            response.push(
                                {
                                    id: assessor.Id,
                                    name: assessor.Name,
                                    type: assessor.Type,
                                    description: assessor.Description
                                }
                            );
                        }
                    } else {
                        throw new Error('API has returned a none object type ${assessors}');
                    }
                }
                return response;
            });
            mockJobAdsAssessorModel.toApi.and.callFake(function (listAssessor) {
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
            });
            //end mockJobAdsAssessorModel --------------------------------

            // mockJobAdsItemsModel ---------------------------------
            mockJobAdsItemsModel.fromApi.and.callFake(function (res) {
                var response = {};
                EntityActionsMixin.$$mixInto(response);
                response.setupEntityActionsFromApi(res.EntityActions);

                response.data = res.JobSummaryItems.map((model) => {
                    return JobAdsModel.fromApi(model.JobSummary, model.EntityActions);
                });
                return response;
            });
            // end mockJobAdsItemsModel -----------------------------

            // mockJobAdsBoardsModel --------------------------------
            mockJobAdsBoardsModel.toApi.and.callFake(function (obj) {
                return {
                    MultipostJobInternalDetail: {
                        ReferFriend: obj.siReferFriend,
                        MembersCanApply: obj.siInterApplications,
                        MembersCanApplyMsg: obj.siInternalMessage,
                        InternalGroupIds: obj.siSelectGroups.map(function (item) { return item.Id; }),
                        KeyContact: obj.siKeyContact ? this.siKeyContact.Value : null,
                        JobPost: {
                            ExpiredDate: (obj.siExpiredDateType === 'default') ? moment(obj.siExpiredDateDefaultDate).format('YYYY-MM-DD[T]HH:mm:ss.SSS') : moment(obj.siExpiredDateCustomDate).format('YYYY-MM-DD[T]HH:mm:ss.SSS'),
                            ApplicationCount: obj.siApplicationCount,
                            JobPostId: obj.siJobPostId,
                            JobId: obj.siJobId,
                            PostHere: obj.siActive,
                            JobPostSubscriptionId: obj.siJobPostSubscriptionId,
                            PreviouslyPostedHere: obj.siPreviouslyPostedHere,
                            UpdatedDate: obj.siUpdatedDate
                        }
                    }
                }
            });
            //end mockJobAdsBoardsModel -----------------------------

            // mockJobAdsQuestionnaireModel -----------------------------
            mockJobAdsQuestionnaireModel.toApi.and.callFake(function (questionnaire, phoneQuestionnaire) {
                let response = [];
                _.each(questionnaire, ((question) => {
                    response.push(question.id);
                }));
                _.each(phoneQuestionnaire, ((phoneQuestion) => {
                    response.push(phoneQuestion.id);
                }));
                return response;
            });
            //end mockJobAdsQuestionnaireModel --------------------------
        });
    });

    it('should call `getAssessor` successful and return data with right format', function () {
        var searchQuery = 'unit-test';

        JobAdsService.getAssessor(searchQuery).then(function (rs) {
            expect(mockServer.get).toHaveBeenCalledWith({
                url: URL.assessor.list,
                query: {
                    's': searchQuery
                }
            });

            expect(mockJobAdsAssessorModel.fromApi).toHaveBeenCalled();
            expect(rs.data.length).toEqual(1);

            expect(rs.data[0].hasOwnProperty('id')).toBe(true);
            expect(rs.data[0].hasOwnProperty('name')).toBe(true);
            expect(rs.data[0].hasOwnProperty('type')).toBe(true);
            expect(rs.data[0].hasOwnProperty('description')).toBe(true);
        });
        $rootScope.$digest();
    });

    it('should call `addAssessor` successful', function () {
        var sampleData = [
            {
                type: 'NetworkGroup',
                id: 7777,
            },
            {
                type: 'Member',
                id: 8888
            }
        ]
        var formatedData = {
            MemberIds: [8888],
            GroupIds: [7777]
        }

        JobAdsService.addAssessor(sampleData, 10785).then(function (rs) {
            expect(mockJobAdsAssessorModel.toApi).toHaveBeenCalledWith(sampleData);
            expect(mockServer.update).toHaveBeenCalledWith({
                url: URL.assessor.add,
                data: formatedData
            });
        });

        $rootScope.$digest();
    });

    it('should call `searchJobAds` successful and return data with right format', function () {
        JobAdsService.searchJobAds('unittest', 1, 20, '').then(function (res) {
            expect(mockServer.get).toHaveBeenCalledWith({
                url: URL.jobAd.list
            }, true);
            expect(res.data.length).toEqual(10);

            expect(res.data[0]).toEqual(jasmine.any(JobAdsModel));
            expect(res.data[0].hasOwnProperty('id')).toBe(true);
            expect(res.data[0].hasOwnProperty('title')).toBe(true);
            expect(res.data[0].hasOwnProperty('location')).toBe(true);
            expect(res.data[0].hasOwnProperty('elapse')).toBe(true);
            expect(res.data[0].hasOwnProperty('applicantsActive')).toBe(true);
            expect(res.data[0].hasOwnProperty('totalApplicants')).toBe(true);
            expect(res.data[0].hasOwnProperty('status')).toBe(true);
            expect(res.data[0].hasOwnProperty('statusCode')).toBe(true);
            expect(res.data[0].hasOwnProperty('statusDate')).toBe(true);
            expect(res.data[0].hasOwnProperty('statusPriority')).toBe(true);
        });
        $rootScope.$digest();
    });

    it('should call `updateInternalJobPost` successful and input data has right format', function () {

        //setup
        var sampleData = {
            siReferFriend: 'abc',
            siInterApplications: true,
            siInternalMessage: true,
            siSelectGroups: [
                {
                    Id: 11,
                },
                {
                    Id: 12,
                }
            ],
            siKeyContact: {
                Value: 'Sherpa'
            },
            siExpiredDateType: 'default',
            siExpiredDateDefaultDate: new Date(DEFAULT_DATETIME),
            siApplicationCount: 10,
            siJobPostId: 1111,
            siJobId: 10785,
            siActive: true,
            siJobPostSubscriptionId: 1112,
            siPreviouslyPostedHere: false,
            siUpdatedDate: new Date(DEFAULT_DATETIME),
            toApi: function () {
                return {
                    InternalJobPost: {
                        MultipostJobInternalDetail: {
                            ReferFriend: this.siReferFriend,
                            MembersCanApply: this.siInterApplications,
                            MembersCanApplyMsg: this.siInternalMessage,
                            InternalGroupIds: this.siSelectGroups.map(function (item) { return item.Id; }),
                            KeyContact: this.siKeyContact ? this.siKeyContact.Value : null,
                            JobPost: {
                                ExpiredDate: (this.siExpiredDateType === 'default') ? moment(this.siExpiredDateDefaultDate).format('YYYY-MM-DD[T]HH:mm:ss.SSS') : moment(this.siExpiredDateCustomDate).format('YYYY-MM-DD[T]HH:mm:ss.SSS'),
                                ApplicationCount: this.siApplicationCount,
                                JobPostId: this.siJobPostId,
                                JobId: this.siJobId,
                                PostHere: this.siActive,
                                JobPostSubscriptionId: this.siJobPostSubscriptionId,
                                PreviouslyPostedHere: this.siPreviouslyPostedHere,
                                UpdatedDate: this.siUpdatedDate
                            }
                        }
                    }
                }
            }
        };
        var formattedData = {
            ReferFriend: 'abc',
            MembersCanApply: true,
            MembersCanApplyMsg: true,
            InternalGroupIds: [11, 12],
            KeyContact: 'Sherpa',
            JobPost: {
                ExpiredDate: moment(new Date(DEFAULT_DATETIME)).format('YYYY-MM-DD[T]HH:mm:ss.SSS'),
                ApplicationCount: 10,
                JobPostId: 1111,
                JobId: 10785,
                PostHere: true,
                JobPostSubscriptionId: 1112,
                PreviouslyPostedHere: false,
                UpdatedDate: new Date(DEFAULT_DATETIME)
            }
        }

        //action
        JobAdsService.updateInternalJobPost(10785, sampleData).then(function (res) {
            expect(mockServer.update).toHaveBeenCalledWith({
                url: URL.jobPost.internal,
                data: formattedData
            });
        });
        $rootScope.$digest();
    });

    it('should call `updateOnSiteJobPost` successful and input data has right format', function () {

        //setup
        var sampleData = {
            swExpiredDateType: 'default',
            swExpiredDateDefaultDate: new Date(DEFAULT_DATETIME),
            swApplicationCount: 10,
            swJobPostId: 1111,
            swJobId: 10785,
            swActive: true,
            swJobPostSubscriptionId: 1112,
            swPreviouslyPostedHere: false,
            swUpdatedDate: new Date(DEFAULT_DATETIME),
            toApi: function () {
                return {
                    YourSiteJobPost: {
                        MultipostJobYourSiteDetail: {
                            JobPost: {
                                ExpiredDate: (this.swExpiredDateType === 'default') ? moment(this.swExpiredDateDefaultDate).format('YYYY-MM-DD[T]HH:mm:ss.SSS') : moment(this.swExpiredDateCustomDate).format('YYYY-MM-DD[T]HH:mm:ss.SSS'),
                                ApplicationCount: this.swApplicationCount,
                                JobPostId: this.swJobPostId,
                                JobId: this.swJobId,
                                PostHere: this.swActive,
                                JobPostSubscriptionId: this.swJobPostSubscriptionId,
                                PreviouslyPostedHere: this.swPreviouslyPostedHere,
                                UpdatedDate: this.swUpdatedDate
                            }
                        }
                    }
                }
            }
        };
        var formattedData = {
            JobPost: {
                ExpiredDate: moment(new Date(DEFAULT_DATETIME)).format('YYYY-MM-DD[T]HH:mm:ss.SSS'),
                ApplicationCount: 10,
                JobPostId: 1111,
                JobId: 10785,
                PostHere: true,
                JobPostSubscriptionId: 1112,
                PreviouslyPostedHere: false,
                UpdatedDate: new Date(DEFAULT_DATETIME)
            }
        }

        //action
        JobAdsService.updateOnSiteJobPost(10785, sampleData).then(function (res) {
            expect(mockServer.update).toHaveBeenCalledWith({
                url: URL.jobPost.website,
                data: formattedData
            });
        });
        $rootScope.$digest();
    });

    it('should call `updateSeekJobPost` successful and input data has right format', function () {

        //setup
        var sampleData = {
            seMarket: 'default',
            seClassification: 'Sherpa',
            seSubClassification: 'Sherpa',
            seLocation: 'Sherpa',
            seArea: 'Sherpa',
            seListingStandOutB1: true,
            seListingStandOutB2: false,
            seListingStandOutB3: false,
            seApplicationCount: 10,
            seVideoLink: 'http://Sherpa.com.au',
            seJobPostId: 1111,
            seJobId: 10785,
            seActive: true,
            seJobPostSubscriptionId: 1112,
            sePreviouslyPostedHere: false,
            seExpiredDateDefault: new Date(DEFAULT_DATETIME),
            seUpdatedDate: new Date(DEFAULT_DATETIME),
            toApi: function () {
                return {
                    SeekJobPost: {
                        MultipostJobSeekDetail: {
                            Market: this.seMarket,
                            Classification: this.seClassification,
                            SubClassification: this.seSubClassification,
                            Location: this.seLocation,
                            Area: this.seArea,
                            ListingStandOut: (this.seListingStandOutB1 || this.seListingStandOutB2 || this.seListingStandOutB3) ? true : false, //field update in api just variable flag for update ListingStandOutB1, ListingStandOutB2, ListingStandOutB3
                            ListingStandOutB1: this.seListingStandOutB1,
                            ListingStandOutB2: this.seListingStandOutB2,
                            ListingStandOutB3: this.seListingStandOutB3,
                            VideoLink: this.seVideoLink,
                            JobPost: {
                                ExpiredDate: this.seExpiredDateDefault,
                                ApplicationCount: this.seApplicationCount,
                                JobPostId: this.seJobPostId,
                                JobId: this.seJobId,
                                PostHere: this.seActive,
                                JobPostSubscriptionId: this.seJobPostSubscriptionId,
                                PreviouslyPostedHere: this.sePreviouslyPostedHere,
                                UpdatedDate: this.seUpdatedDate
                            }
                        }
                    }
                }
            }
        };
        var formattedData = {
            Market: 'default',
            Classification: 'Sherpa',
            SubClassification: 'Sherpa',
            Location: 'Sherpa',
            Area: 'Sherpa',
            ListingStandOut: true,
            ListingStandOutB1: true,
            ListingStandOutB2: false,
            ListingStandOutB3: false,
            VideoLink: "http://Sherpa.com.au",
            JobPost: {
                ExpiredDate: new Date(DEFAULT_DATETIME),
                ApplicationCount: 10,
                JobPostId: 1111,
                JobId: 10785,
                PostHere: true,
                JobPostSubscriptionId: 1112,
                PreviouslyPostedHere: false,
                UpdatedDate: new Date(DEFAULT_DATETIME)
            }
        }

        //action
        JobAdsService.updateSeekJobPost(10785, sampleData).then(function (res) {
            expect(mockServer.update).toHaveBeenCalledWith({
                url: URL.jobPost.seek,
                data: formattedData
            });
        });
        $rootScope.$digest();
    });

    it('should call `updateCareerOneJobPost` successful and input data has right format', function () {

        //setup
        var sampleData = {
            caCompanyName: 'Sherpa',
            caCategory: 1,
            caOccupation: 1,
            caLocation: 1,
            caIndustry: 1,
            caTemplate: 1,
            caApplicationCount: 10,
            caJobPostId: 1111,
            caJobId: 10785,
            caActive: true,
            caJobPostSubscriptionId: 1112,
            caPreviouslyPostedHere: false,
            caExpiredDateDefault: new Date(DEFAULT_DATETIME),
            caUpdatedDate: new Date(DEFAULT_DATETIME),
            toApi: function () {
                return {
                    CareerOneJobPost: {
                        MultipostJobCareerOneDetail: {
                            "CompanyName": this.caCompanyName,
                            "CategoryId": this.caCategory,
                            "OccupationId": this.caOccupation,
                            "LocationId": this.caLocation,
                            "IndustryId": this.caIndustry,
                            "TemplateId": this.caTemplate,
                            "JobPost": {
                                "PostHere": this.caActive,
                                "ApplicationCount": this.caApplicationCount,
                                "JobPostId": this.caJobPostId,
                                "JobId": this.caJobId,
                                "JobPostSubscriptionId": this.caJobPostSubscriptionId,
                                "PreviouslyPostedHere": this.caPreviouslyPostedHere,
                                "ExpiredDate": this.caExpiredDateDefault,
                                "UpdatedDate": this.caUpdatedDate
                            }
                        }
                    }
                }
            }
        };
        var formattedData = {
            "CompanyName": 'Sherpa',
            "CategoryId": 1,
            "OccupationId": 1,
            "LocationId": 1,
            "IndustryId": 1,
            "TemplateId": 1,
            "JobPost": {
                "PostHere": true,
                "ApplicationCount": 10,
                "JobPostId": 1111,
                "JobId": 10785,
                "JobPostSubscriptionId": 1112,
                "PreviouslyPostedHere": false,
                "ExpiredDate": new Date(DEFAULT_DATETIME),
                "UpdatedDate": new Date(DEFAULT_DATETIME)
            }
        }

        //action
        JobAdsService.updateCareerOneJobPost(10785, sampleData).then(function (res) {
            expect(mockServer.update).toHaveBeenCalledWith({
                url: URL.jobPost.careerOne,
                data: formattedData
            });
        });
        $rootScope.$digest();
    });

    it('should call `updateOneshiftJobPost` successful and input data has right format', function () {

        //setup
        var sampleData = {
            onRegion: 1,
            onArea: 1,
            onCategory: 1,
            onProfession: 1,
            onApplicationCount: 10,
            onJobPostId: 1111,
            onJobId: 10785,
            onActive: true,
            onJobPostSubscriptionId: 1112,
            onPreviouslyPostedHere: false,
            onExpiredDateDefault: new Date(DEFAULT_DATETIME),
            onUpdatedDate: new Date(DEFAULT_DATETIME),
            toApi: function () {
                return {
                    OneShiftJobPost: {
                        MultipostJobOneShiftDetail: {
                            "RegionId": this.onRegion,
                            "AreaId": this.onArea,
                            "CategoryId": this.onCategory,
                            "ProfessionId": this.onProfession,
                            "JobPost": {
                                "PostHere": this.onActive,
                                "ApplicationCount": this.onApplicationCount,
                                "JobPostId": this.onJobPostId,
                                "JobId": this.onJobId,
                                "JobPostSubscriptionId": this.onJobPostSubscriptionId,
                                "PreviouslyPostedHere": this.onPreviouslyPostedHere,
                                "ExpiredDate": this.onExpiredDateDefault,
                                "UpdatedDate": this.onUpdatedDate
                            }
                        }
                    }
                }
            }
        };
        var formattedData = {
            "RegionId": 1,
            "AreaId": 1,
            "CategoryId": 1,
            "ProfessionId": 1,
            "JobPost": {
                "PostHere": true,
                "ApplicationCount": 10,
                "JobPostId": 1111,
                "JobId": 10785,
                "JobPostSubscriptionId": 1112,
                "PreviouslyPostedHere": false,
                "ExpiredDate": new Date(DEFAULT_DATETIME),
                "UpdatedDate": new Date(DEFAULT_DATETIME)
            }
        }

        //action
        JobAdsService.updateOneshiftJobPost(10785, sampleData).then(function (res) {
            expect(mockServer.update).toHaveBeenCalledWith({
                url: URL.jobPost.oneShift,
                data: formattedData
            });
        });
        $rootScope.$digest();
    });

    it('should call `updateTwitterJobPost` successful and input data has right format', function () {

        //setup
        var sampleData = {
            twApplicationCount: 10,
            twJobPostId: 1111,
            twJobId: 10785,
            twActive: true,
            twJobPostSubscriptionId: 1112,
            twPreviouslyPostedHere: false,
            twExpiredDate: new Date(DEFAULT_DATETIME),
            twUpdatedDate: new Date(DEFAULT_DATETIME),
            toApi: function () {
                return {
                    TwitterJobPost: {
                        MultipostJobTwitterDetail: {
                            "JobPost": {
                                "PostHere": this.twActive,
                                "ApplicationCount": this.twApplicationCount,
                                "JobPostId": this.twJobPostId,
                                "JobId": this.twJobId,
                                "JobPostSubscriptionId": this.twJobPostSubscriptionId,
                                "PreviouslyPostedHere": this.twPreviouslyPostedHere,
                                "ExpiredDate": this.twExpiredDate,
                                "UpdatedDate": this.twUpdatedDate
                            }
                        }
                    }
                }
            }
        };
        var formattedData = {
            "JobPost": {
                "PostHere": true,
                "ApplicationCount": 10,
                "JobPostId": 1111,
                "JobId": 10785,
                "JobPostSubscriptionId": 1112,
                "PreviouslyPostedHere": false,
                "ExpiredDate": new Date(DEFAULT_DATETIME),
                "UpdatedDate": new Date(DEFAULT_DATETIME)
            }
        }

        //action
        JobAdsService.updateTwitterJobPost(10785, sampleData).then(function (res) {
            expect(mockServer.update).toHaveBeenCalledWith({
                url: URL.jobPost.twitter,
                data: formattedData
            });
        });
        $rootScope.$digest();
    });

    it('should call `updateTwitterJobPost` successful and input data has right format', function () {

        //setup
        var sampleData = {
            fbApplicationCount: 10,
            fbJobPostId: 1111,
            fbJobId: 10785,
            fbActive: true,
            fbJobPostSubscriptionId: 1112,
            fbPreviouslyPostedHere: false,
            fbExpiredDate: new Date(DEFAULT_DATETIME),
            fbUpdatedDate: new Date(DEFAULT_DATETIME),
            toApi: function () {
                return {
                    FacebookJobPost: {
                        MultipostJobFacebookDetail: {
                            "JobPost": {
                                "PostHere": this.fbActive,
                                "ApplicationCount": this.fbApplicationCount,
                                "JobPostId": this.fbJobPostId,
                                "JobId": this.fbJobId,
                                "JobPostSubscriptionId": this.fbJobPostSubscriptionId,
                                "PreviouslyPostedHere": this.fbPreviouslyPostedHere,
                                "ExpiredDate": this.fbExpiredDate,
                                "UpdatedDate": this.fbUpdatedDate
                            }
                        }
                    }
                }
            }
        };
        var formattedData = {
            "JobPost": {
                "PostHere": true,
                "ApplicationCount": 10,
                "JobPostId": 1111,
                "JobId": 10785,
                "JobPostSubscriptionId": 1112,
                "PreviouslyPostedHere": false,
                "ExpiredDate": new Date(DEFAULT_DATETIME),
                "UpdatedDate": new Date(DEFAULT_DATETIME)
            }
        }

        //action
        JobAdsService.updateFacebookJobPost(10785, sampleData).then(function (res) {
            expect(mockServer.update).toHaveBeenCalledWith({
                url: URL.jobPost.facebook,
                data: formattedData
            });
        });
        $rootScope.$digest();
    });

    it('should call `searchJobTags successful and return data has right format`', function () {
        JobAdsService.searchJobTags().then(function (res) {
            expect(mockServer.get).toHaveBeenCalledWith({
                url: URL.tag.list
            })
            expect(res.data.length).toEqual(7);
            expect(res.data[0].hasOwnProperty('label')).toBe(true);
            expect(res.data[0].hasOwnProperty('value')).toBe(true);
        })
    });

    it('should call `createJobAds` successful and input data has right format', function () {
        var sampleData = {
            locationOrRegion: JobLocation.LOCATION,
            selectedLocations: [
                {
                    value: {
                        DistributionId: 1,
                    }
                }
            ],
            refNumber: 1,
            jobTitle: 'Sherpa',
            area: {
                label: 'Sherpa',
            },
            state: {
                label: 'Sherpa',
            },
            employmentTypeId: 1,
            allowOverseas: true,
            salaryType: 'Fulltime',
            salaryRangeOrAmount: 'range',
            salaryCurrency: {
                Value: 'NZD'
            },
            amount: 12000,
            salaryMin: {
                Value: 1
            },
            salaryMax: {
                Value: 2
            },
            displaySalary: true,
            addBenefits: 'Sherpa',
            selectedJobTags: [
                {
                    value: 'Sherpa'
                }
            ],
            jobSummary: 'Sherpa',
            jobBody: 'Sherpa',
            toApi: function () {
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
                    AdvertisedSalaryMinId: this.salaryMin ? this.salaryMin.Value : null,
                    AdvertisedSalaryMaxId: this.salaryMax ? this.salaryMax.Value : null,
                    DisplaySalary: this.displaySalary,
                    AdditionalSalaryInfo: this.addBenefits,
                    JobTagIds: this.selectedJobTags.map(function (tag) {
                        return tag.value;
                    }),
                    Summary: this.jobSummary,
                    DisplayableInfo: this.jobBody
                };
            }
        };

        var formattedData = {
            Reference: 1,
            JobTitle: 'Sherpa',
            GroupIds: [1],
            RegionXmlValue: undefined,
            AreaXmlValue: undefined,
            JobTypeId: 1,
            AllowOverseaApplications: true,
            SalaryType: 'Fulltime',
            AmountType: 'range',
            CurencyType: 'NZD',
            SalaryRate: 12000,
            AdvertisedSalaryMinId: 1,
            AdvertisedSalaryMaxId: 2,
            DisplaySalary: true,
            AdditionalSalaryInfo: 'Sherpa',
            JobTagIds: ['Sherpa'],
            Summary: 'Sherpa',
            DisplayableInfo: 'Sherpa'
        }

        JobAdsService.createJobAds(sampleData).then(function (res) {
            expect(mockServer.create).toHaveBeenCalledWith({
                url: URL.jobAd.create,
                data: formattedData
            })
        });
        $rootScope.$digest();
    });

    it('should call `updateJobAds` successful and input data has right format', function () {
        var sampleData = {
            jobId: 10785,
            locationOrRegion: JobLocation.LOCATION,
            selectedLocations: [
                {
                    value: {
                        DistributionId: 1,
                    }
                }
            ],
            refNumber: 1,
            jobTitle: 'Sherpa',
            area: {
                label: 'Sherpa',
            },
            state: {
                label: 'Sherpa',
            },
            employmentTypeId: 1,
            allowOverseas: true,
            salaryType: 'Fulltime',
            salaryRangeOrAmount: 'range',
            salaryCurrency: {
                Value: 'NZD'
            },
            amount: 12000,
            salaryMin: {
                Value: 1
            },
            salaryMax: {
                Value: 2
            },
            displaySalary: true,
            addBenefits: 'Sherpa',
            selectedJobTags: [
                {
                    value: 'Sherpa'
                }
            ],
            jobSummary: 'Sherpa',
            jobBody: 'Sherpa',
            toApi: function () {
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
                    AdvertisedSalaryMinId: this.salaryMin ? this.salaryMin.Value : null,
                    AdvertisedSalaryMaxId: this.salaryMax ? this.salaryMax.Value : null,
                    DisplaySalary: this.displaySalary,
                    AdditionalSalaryInfo: this.addBenefits,
                    JobTagIds: this.selectedJobTags.map(function (tag) {
                        return tag.value;
                    }),
                    Summary: this.jobSummary,
                    DisplayableInfo: this.jobBody
                };
            }
        };

        var formattedData = {
            Reference: 1,
            JobTitle: 'Sherpa',
            GroupIds: [1],
            RegionXmlValue: undefined,
            AreaXmlValue: undefined,
            JobTypeId: 1,
            AllowOverseaApplications: true,
            SalaryType: 'Fulltime',
            AmountType: 'range',
            CurencyType: 'NZD',
            SalaryRate: 12000,
            AdvertisedSalaryMinId: 1,
            AdvertisedSalaryMaxId: 2,
            DisplaySalary: true,
            AdditionalSalaryInfo: 'Sherpa',
            JobTagIds: ['Sherpa'],
            Summary: 'Sherpa',
            DisplayableInfo: 'Sherpa'
        }

        JobAdsService.updateJobAds(sampleData).then(function (res) {
            expect(mockServer.update).toHaveBeenCalledWith({
                url: URL.jobAd.update,
                data: formattedData
            })
        });
        $rootScope.$digest();
    });

    it('shoud call `addQuestionnaireToJobs` successful and input data has right format', function () {
        var sampleQuestionnaire = [
            {
                id: 1111,
            },
            {
                id: 1112
            }
        ];
        var samplePhoneQuestionnaire = [
            {
                id: 1113,
            },
            {
                id: 1114,
            }
        ];

        var formattedData = [1111, 1112, 1113, 1114];

        JobAdsService.addQuestionnaireToJob(sampleQuestionnaire, samplePhoneQuestionnaire, 10785).then(function (res) {
            expect(mockServer.update).toHaveBeenCalledWith({
                url: URL.questionnaire.add,
                data: formattedData
            })
        });
        $rootScope.$digest();
    });

    it('should call `updateJobPostsByJobId` successful', function () {
        var boards = {
            InternalJobPost: {
                MultipostJobInternalDetail: {
                    Value: 'this is data for InternalJobPost'
                }
            },
            YourWebsiteJobPost: {
                MultipostJobYourSiteDetail: {
                    Value: 'this is data for YourWebsiteJobPost'
                }
            },
            CareerOneJobPost: {
                MultipostJobCareerOneDetail: {
                    Value: 'this is data for CareerOne'
                }
            },
            OneShiftJobPost: {
                MultipostJobOneShiftDetail: {
                    Value: 'this is data for Oneshift'
                }
            },
            FacebookJobPost: {
                MultipostJobFacebookDetail: {
                    Value: 'this is data for Facebook'
                }
            },
            TwitterJobPost: {
                MultipostJobTwitterDetail: {
                    Value: 'this is data for Twitter'
                }
            },
            SeekJobPost: {
                MultipostJobSeekDetail: {
                    Value: 'this is data for Seek'
                }
            }
        }
        JobAdsService.updateJobPostsByJobId(10785, boards).then(function (res) {
            expect(mockServer.update).toHaveBeenCalledWith({
                url: URL.jobPost.update,
                data: boards
            })
        });
        $rootScope.$digest();
    });

    it('should call `publishJobAds` successfull', function () {
        JobAdsService.publishJobAds(10785).then(function (res) {
            expect(mockServer.update).toHaveBeenCalledWith({
                url: URL.jobAd.publish
            })
        });
        $rootScope.$digest();
    });

    it('should call `deleteJob` successfull', function () {
        JobAdsService.deleteJob(10785).then(function (res) {
            expect(mockServer.remove).toHaveBeenCalledWith({
                url: URL.jobAd.remove
            })
        });
        $rootScope.$digest();
    });

    it('should call `searchKeyContact` successfull and return data with right format', function () {
        JobAdsService.searchKeyContact().then(function (res) {
            expect(mockServer.get).toHaveBeenCalledWith({
                url: URL.keyContact
            });
            expect(res.data).toEqual(jasmine.any(Array));
            expect(res.data.length).toEqual(54);
            expect(res.data[0].hasOwnProperty('Id')).toBe(true);
            expect(res.data[0].hasOwnProperty('Value')).toBe(true);
            expect(res.data[0].hasOwnProperty('Label')).toBe(true);
        });
        $rootScope.$digest();
    });

    it('should call `searchNetworkGroups` successfull and return data with right format', function () {
        JobAdsService.searchNetworkGroups().then(function (res) {
            expect(mockServer.get).toHaveBeenCalledWith({
                url: URL.networkGroup
            });
            expect(res.data).toEqual(jasmine.any(Array));
            expect(res.data.length).toEqual(5);
            expect(res.data[0].hasOwnProperty('KeyValue')).toBe(true);
            expect(res.data[0].hasOwnProperty('SearchType')).toBe(true);
            expect(res.data[0].hasOwnProperty('Value')).toBe(true);
            expect(res.data[0].hasOwnProperty('Label')).toBe(true);
        });
        $rootScope.$digest();
    });
});