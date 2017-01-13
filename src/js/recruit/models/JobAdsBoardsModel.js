angular.module('ui.recruit.models')
    .factory('JobAdsBoardsModel', [() => {
        return class JobAdsBoardsModel {
            constructor(JobPostsInfo = {}) {
                let internalJobPost = (JobPostsInfo.InternalJobPost) ? JobPostsInfo.InternalJobPost.MultipostJobInternalDetail : null;
                let yourSiteJobPost = (JobPostsInfo.YourSiteJobPost) ? JobPostsInfo.YourSiteJobPost.MultipostJobYourSiteDetail : null;
                let seek = (JobPostsInfo.SeekJobPost) ? JobPostsInfo.SeekJobPost.MultipostJobSeekDetail : null;
                let oneShift = (JobPostsInfo.OneShiftJobPost) ? JobPostsInfo.OneShiftJobPost.MultipostJobOneShiftDetail : null;
                let careerone = (JobPostsInfo.CareerOneJobPost) ? JobPostsInfo.CareerOneJobPost.MultipostJobCareerOneDetail : null;
                let twitter = (JobPostsInfo.TwitterJobPost) ? JobPostsInfo.TwitterJobPost.MultipostJobTwitterDetail : null;
                let facebook = (JobPostsInfo.FacebookJobPost) ? JobPostsInfo.FacebookJobPost.MultipostJobFacebookDetail : null;
                let inExpiryDate = (internalJobPost) ? moment(internalJobPost.JobPost.ExpiredDate) : moment();
                let weExpiryDate = (yourSiteJobPost) ? moment(yourSiteJobPost.JobPost.ExpiredDate) : moment();
                let now = moment();
                let inDayEffective = moment(inExpiryDate).diff(now, 'days');
                let weDayEffective = moment(weExpiryDate).diff(now, 'days');

                //Sherpa Internal
                this.hasSherpaInternal = (JobPostsInfo.InternalJobPost) ? JobPostsInfo.InternalJobPost : false;
                this.siExpiredDateType = (inDayEffective === 29) ? 'default' : 'custom';  // check number days of ExpiredDate in api for set value radio button choice expired date.THIS WILL HAVE A BUG HERE, and probability is 1/30 * 1/12 = 1/360 * 100 = 0.278%
                this.siDayEffective = (internalJobPost) ? (inDayEffective + 1) : null;
                this.siExpiredDate = (internalJobPost) ? internalJobPost.JobPost.ExpiredDate : null;
                this.siUpdatedDate = (internalJobPost) ? internalJobPost.JobPost.UpdatedDate : null;
                this.siExpiredDateCustomDate = (internalJobPost) ? (this.siExpiredDateType === 'custom' ? (moment(internalJobPost.JobPost.ExpiredDate).format("MM/DD/YYYY")) : null) : null;
                this.siOldExpiredDateCustomDate = this.siExpiredDateCustomDate;
                this.siExpiredDateCustomViewDate = (internalJobPost && this.siExpiredDateType === 'default') ? null : this.siDayEffective;
                this.siExpiredDateDefaultDate = (internalJobPost && this.siExpiredDateType === 'default') ? inExpiryDate : null;
                this.siExpiredDateDefaultViewDate = (internalJobPost && this.siExpiredDateType === 'default') ? moment(inExpiryDate).format("MM/DD/YYYY") : null;
                this.siActive = (internalJobPost) ? internalJobPost.JobPost.PostHere : null;
                this.siJobId = (internalJobPost) ? internalJobPost.JobPost.JobId : null;
                this.siJobPostSubscriptionId = (internalJobPost) ? internalJobPost.JobPost.JobPostSubscriptionId : null;
                this.siReferFriend = (internalJobPost) ? internalJobPost.ReferFriend : null;
                this.siInterApplications = (internalJobPost) ? internalJobPost.MembersCanApply : null;
                this.siInternalMessage = (internalJobPost) ? internalJobPost.MembersCanApplyMsg : null;
                this.siKeyContactId = (internalJobPost) ? internalJobPost.KeyContact : null;
                this.siAllOrSelectedGroup = (internalJobPost && internalJobPost.InternalGroupIds) ? "selected" : "all";
                this.siSelectGroupIds = (internalJobPost) ? internalJobPost.InternalGroupIds : null;
                this.siNetworkGrousGroupIds = (internalJobPost) ? internalJobPost.InternalNetworkGrousGroupIds : null;
                this.siSelectGroups = [];
                this.siSelectKeyContacts = [];
                this.siKeyContact = '';

                //TODO: field name logo display image logo match by logo of difference companys,  In old system display logo mapping name in folder website/Sherpa/images/network/multipost/jobboards and hardcode images in some others folder by network. Curently, I'm not sure process and value hardcode :( I will investige old system to resolve it later
                this.siLogo = (internalJobPost) ? internalJobPost.JobBoard.Logo : null;
                //Use in page edit
                this.siCanReNew = (internalJobPost) ? internalJobPost.JobBoard.CanReNew : null;
                this.siCanSetExpiry = (internalJobPost) ? internalJobPost.JobBoard.CanSetExpiry : null;
                this.siApplicationCount = (internalJobPost) ? internalJobPost.JobPost.ApplicationCount : 0;
                this.siJobPostId = (internalJobPost) ? internalJobPost.JobPost.JobPostId : null;
                this.siJobId = (internalJobPost) ? internalJobPost.JobPost.JobId : null;
                this.siJobPostSubscriptionId = (internalJobPost) ? internalJobPost.JobPost.JobPostSubscriptionId : null;
                this.siJobBoardSummary = (internalJobPost) ? internalJobPost.JobPost.JobBoardSummary : null;
                this.siPreviouslyPostedHere = (internalJobPost) ? internalJobPost.JobPost.PreviouslyPostedHere : null;

                //Sherpa Website
                //TODO: Sherpa Website does not have any payload example now
                this.hasSherpaWebSite = (JobPostsInfo.YourSiteJobPost) ? JobPostsInfo.YourSiteJobPost : false;
                this.swExpiredDate = (yourSiteJobPost) ? yourSiteJobPost.JobPost.ExpiredDate : null;
                this.swUpdatedDate = (yourSiteJobPost) ? yourSiteJobPost.JobPost.UpdatedDate : null;
                this.swDayEffective = (yourSiteJobPost) ? (weDayEffective + 1) : null;
                this.swExpiredDateType = (weDayEffective === 29) ? 'default' : 'custom';  // check number days of ExpiredDate in api for set value radio button choice expired date.THIS WILL HAVE A BUG HERE, and probability is 1/30 * 1/12 = 1/360 * 100 = 0.278%
                this.swExpiredDateCustomDate = (yourSiteJobPost) ? ((this.swExpiredDateType === 'default') ? null : moment(yourSiteJobPost.JobPost.ExpiredDate).format("MM/DD/YYYY")) : null;
                this.swOldExpiredDateCustomDate = this.swExpiredDateCustomDate;
                this.swExpiredDateCustomViewDate = (yourSiteJobPost && this.swExpiredDateType === 'default') ? null : this.swDayEffective;
                this.swExpiredDateDefaultDate = (yourSiteJobPost && this.swExpiredDateType === 'default') ? weExpiryDate : null;
                this.swExpiredDateDefaultViewDate = (yourSiteJobPost && this.swExpiredDateType === 'default') ? moment(weExpiryDate).format("MM/DD/YYYY") : null;
                this.swActive = (yourSiteJobPost) ? yourSiteJobPost.JobPost.PostHere : null;
                this.swLogo = (yourSiteJobPost) ? yourSiteJobPost.JobBoard.Logo : null;
                //Use in page edit
                this.swCanReNew = (yourSiteJobPost) ? yourSiteJobPost.JobBoard.CanReNew : null;
                this.swCanSetExpiry = (yourSiteJobPost) ? yourSiteJobPost.JobBoard.CanSetExpiry : null;
                this.swJobId = (yourSiteJobPost) ? yourSiteJobPost.JobPost.JobId : null;
                this.swJobPostSubscriptionId = (yourSiteJobPost) ? yourSiteJobPost.JobPost.JobPostSubscriptionId : null;
                this.swLogo = (yourSiteJobPost) ? yourSiteJobPost.JobBoard.Logo : null;
                //Use in page edit
                this.swCanReNew = (yourSiteJobPost) ? yourSiteJobPost.JobBoard.CanReNew : null;
                this.swCanSetExpiry = (yourSiteJobPost) ? yourSiteJobPost.JobBoard.CanSetExpiry : null;

                this.swApplicationCount = (yourSiteJobPost) ? yourSiteJobPost.JobPost.ApplicationCount : 0;
                this.swJobPostId = (yourSiteJobPost) ? yourSiteJobPost.JobPost.JobPostId : null;
                this.swJobId = (yourSiteJobPost) ? yourSiteJobPost.JobPost.JobId : null;
                this.swJobPostSubscriptionId = (yourSiteJobPost) ? yourSiteJobPost.JobPost.JobPostSubscriptionId : null;
                this.swJobBoardSummary = (yourSiteJobPost) ? yourSiteJobPost.JobPost.JobBoardSummary : null;
                this.swPreviouslyPostedHere = (yourSiteJobPost) ? yourSiteJobPost.JobPost.PreviouslyPostedHere : null;

                //Seek
                this.hasSeek = (JobPostsInfo.SeekJobPost) ? JobPostsInfo.SeekJobPost : false;
                this.seExpiredDateDefault = (seek) ? seek.JobPost.ExpiredDate : null;
                this.seUpdatedDate = (seek) ? seek.JobPost.UpdatedDate : null;
                this.seExpiredDateDefaultViewDate = (seek) ? moment(seek.JobPost.ExpiredDate).format('MM/DD/YYYY') : null;
                this.seActive = (seek) ? seek.JobPost.PostHere : null;
                this.seJobId = (seek) ? seek.JobPost.JobId : null;
                this.seJobPostSubscriptionId = (seek) ? seek.JobPost.JobPostSubscriptionId : null;
                this.seMarket = (seek) ? seek.Market : null;
                this.seLocation = (seek) ? seek.Location : null;
                this.seArea = (seek) ? seek.Area : null;
                this.seRegion = (seek) ? JobAdsBoardsModel.determineRegion(seek.SeekRegionDetails, seek.Location) : null;
                this.seSubClassification = (seek) ? seek.SubClassification : null;
                this.seClassification = (seek) ? seek.Classification : null;
                this.seVideoLink = (seek) ? seek.VideoLink : null;
                this.seListingStandOutB1 = (seek) ? seek.ListingStandOutB1 : null;
                this.seListingStandOutB2 = (seek) ? seek.ListingStandOutB2 : null;
                this.seListingStandOutB3 = (seek) ? seek.ListingStandOutB3 : null;
                this.seListingStandouts = (seek) ? ((seek.ListingStandOutB1 || seek.ListingStandOutB2 || seek.ListingStandOutB3) ? true : false) : null;
                this.seClassificationDetails = (seek) ? seek.SeekClassificationDetails : null;
                this.seRegionDetails = (seek) ? seek.SeekRegionDetails : null;
                this.seMarketSegmentDetails = (seek) ? seek.SeekMarketSegmentDetails : null;
                this.seLogo = (seek) ? seek.JobBoard.Logo : null;
                //Use in page edit
                this.seCanReNew = (seek) ? seek.JobBoard.CanReNew : null;
                this.seCanSetExpiry = (seek) ? seek.JobBoard.CanSetExpiry : null;
                this.seCanReNew = (seek) ? seek.JobBoard.CanReNew : null;
                this.seCanSetExpiry = (seek) ? seek.JobBoard.CanSetExpiry : null;

                this.seApplicationCount = (seek) ? seek.JobPost.ApplicationCount : 0;
                this.seJobPostId = (seek) ? seek.JobPost.JobPostId : null;
                this.seJobId = (seek) ? seek.JobPost.JobId : null;
                this.seJobPostSubscriptionId = (seek) ? seek.JobPost.JobPostSubscriptionId : null;
                this.seJobBoardSummary = (seek) ? seek.JobPost.JobBoardSummary : null;
                this.sePreviouslyPostedHere = (seek) ? seek.JobPost.PreviouslyPostedHere : null;


                //OneShift
                this.hasOneShift = (JobPostsInfo.OneShiftJobPost) ? JobPostsInfo.OneShiftJobPost : false;
                this.onActive = (oneShift) ? oneShift.JobPost.PostHere : false;
                this.onJobId = (oneShift) ? oneShift.JobPost.JobId : null;
                this.onJobPostSubscriptionId = (oneShift) ? oneShift.JobPost.JobPostSubscriptionId : null;
                this.onExpiredDateDefault = (oneShift) ? oneShift.JobPost.ExpiredDate : null;
                this.onUpdatedDate = (oneShift) ? oneShift.JobPost.UpdatedDate : null;
                this.onExpiredDateDefaultViewDate = (oneShift) ? moment(oneShift.JobPost.ExpiredDate).format('MM/DD/YYYY') : null;
                this.onRegion = (oneShift) ? (oneShift.RegionId === 0 ? null : oneShift.RegionId) : null; //api backend return value 0 for not selected any value need set default value is null for validate required
                this.onArea = (oneShift) ? (oneShift.AreaId === 0 ? null : oneShift.AreaId) : null;
                this.onCategory = (oneShift) ? (oneShift.CategoryId === 0 ? null : oneShift.CategoryId) : null;
                this.onProfession = (oneShift) ? (oneShift.ProfessionId === 0 ? null : oneShift.ProfessionId) : null;
                this.onRegionDetails = (oneShift) ? oneShift.MultipostOneShiftRegionDetails : null;
                this.onAreaDetails = (oneShift) ? oneShift.MultipostOneShiftAreaDetails : null;
                this.onCategoryDetails = (oneShift) ? oneShift.MultipostOneShiftCategoryDetails : null;
                this.onProfessionDetails = (oneShift) ? oneShift.MultipostOneShiftProfessionDetails : null;
                this.onLogo = (oneShift) ? oneShift.JobBoard.Logo : null;
                //Use in page edit
                this.onCanReNew = (oneShift) ? oneShift.JobBoard.CanReNew : null;
                this.onCanSetExpiry = (oneShift) ? oneShift.JobBoard.CanSetExpiry : null;
                this.onApplicationCount = (oneShift) ? oneShift.JobPost.ApplicationCount : null;

                //CareerOne
                this.hasCareerOne = (JobPostsInfo.CareerOneJobPost) ? JobPostsInfo.CareerOneJobPost : false;
                this.caActive = (careerone) ? careerone.JobPost.PostHere : false;
                this.caJobId = (careerone) ? careerone.JobPost.JobId : null;
                this.caJobPostSubscriptionId = (careerone) ? careerone.JobPost.JobPostSubscriptionId : null;
                this.caExpiredDateDefault = (careerone) ? careerone.JobPost.ExpiredDate : null;
                this.caUpdatedDate = (careerone) ? careerone.JobPost.UpdatedDate : null;
                this.caExpiredDateDefaultViewDate = (careerone) ? moment(careerone.JobPost.ExpiredDate).format("MM/DD/YYYY") : null;
                this.caIndustry = (careerone) ? careerone.IndustryId : null;
                this.caLocation = (careerone) ? careerone.LocationId : null;
                this.caCategory = (careerone) ? careerone.CategoryId : null;
                this.caOccupation = (careerone) ? careerone.OccupationId : null;
                this.caTemplate = (careerone) ? careerone.TemplateId : null;
                this.caCompanyName = (careerone) ? careerone.CompanyName : null;
                this.caJobAdDuration = null;// no fields response api
                this.caIndustryDetails = (careerone) ? careerone.MultipostC1IndustryDetails : null;
                this.caCategoryDetails = (careerone) ? careerone.MultipostC1CategoryDetails : null;
                this.caAreaDetails = (careerone) ? careerone.MultipostC1AreaDetails : null;
                this.caTemplateDetails = (careerone) ? careerone.MultipostC1TemplateDetails : null;
                this.caCompanyNames = (careerone) ? careerone.CompanyNames : null;
                this.caOccupationDetails = (careerone) ? careerone.MultipostC1OccupationDetails : null;
                this.caLogo = (careerone) ? careerone.JobBoard.Logo : null;
                //Use in page edit
                this.caCanReNew = (careerone) ? careerone.JobBoard.CanReNew : null;
                this.caCanSetExpiry = (careerone) ? careerone.JobBoard.CanSetExpiry : null;

                this.caApplicationCount = (careerone) ? careerone.JobPost.ApplicationCount : 0;
                this.caJobPostId = (careerone) ? careerone.JobPost.JobPostId : null;
                this.caJobId = (careerone) ? careerone.JobPost.JobId : null;
                this.caJobPostSubscriptionId = (careerone) ? careerone.JobPost.JobPostSubscriptionId : null;
                this.caJobBoardSummary = (careerone) ? careerone.JobPost.JobBoardSummary : null;
                this.caPreviouslyPostedHere = (careerone) ? careerone.JobPost.PreviouslyPostedHere : null;

                //Twitter
                this.hasTwitter = (JobPostsInfo.TwitterJobPost) ? JobPostsInfo.TwitterJobPost : false; //TODO: Need to check the payload when twitter info is returned
                this.twActive = (twitter) ? twitter.JobPost.PostHere : false; //TODO: Need to check the payload when twitter info is returned
                this.twExpiredDate = (twitter) ? twitter.JobPost.ExpiredDate : null;
                this.twUpdatedDate = (twitter) ? twitter.JobPost.UpdatedDate : null;
                this.twJobId = (twitter) ? twitter.JobPost.JobId : null;
                this.twJobPostSubscriptionId = (twitter) ? twitter.JobPost.JobPostSubscriptionId : null;
                this.twLogo = (twitter) ? twitter.JobBoard.Logo : null;
                //Use in page edit
                this.twCanReNew = (twitter) ? twitter.JobBoard.CanReNew : null;
                this.twCanSetExpiry = (twitter) ? twitter.JobBoard.CanSetExpiry : null;

                this.twApplicationCount = (twitter) ? twitter.JobPost.ApplicationCount : 0;
                this.twJobPostId = (twitter) ? twitter.JobPost.JobPostId : null;
                this.twJobId = (twitter) ? twitter.JobPost.JobId : null;
                this.twJobPostSubscriptionId = (twitter) ? twitter.JobPost.JobPostSubscriptionId : null;
                this.twJobBoardSummary = (twitter) ? twitter.JobPost.JobBoardSummary : null;
                this.twPreviouslyPostedHere = (twitter) ? twitter.JobPost.PreviouslyPostedHere : null;

                //Facebook
                this.hasFacebook = (JobPostsInfo.FacebookJobPost) ? JobPostsInfo.FacebookJobPost : false; //TODO: Need to check the payload when facebook info is returned
                this.fbActive = (facebook) ? facebook.JobPost.PostHere : false;
                this.fbLogo = (facebook) ? facebook.JobBoard.Logo : null;
                //Use in page edit
                this.fbCanReNew = (facebook) ? facebook.JobBoard.CanReNew : null;
                this.fbCanSetExpiry = (facebook) ? facebook.JobBoard.CanSetExpiry : null;
                this.fbExpiredDate = (facebook) ? facebook.JobPost.ExpiredDate : null;
                this.fbUpdatedDate = (facebook) ? facebook.JobPost.UpdatedDate : null;
                this.fbApplicationCount = (facebook) ? facebook.JobPost.ApplicationCount : 0;
                this.fbJobPostId = (facebook) ? facebook.JobPost.JobPostId : null;
                this.fbJobId = (facebook) ? facebook.JobPost.JobId : null;
                this.fbJobPostSubscriptionId = (facebook) ? facebook.JobPost.JobPostSubscriptionId : null;
                this.fbJobBoardSummary = (facebook) ? facebook.JobPost.JobBoardSummary : null;
                this.fbPreviouslyPostedHere = (facebook) ? facebook.JobPost.PreviouslyPostedHere : null;

                this.totalApplication = this.siApplicationCount + this.swApplicationCount + this.seApplicationCount + this.onApplicationCount + this.caApplicationCount + this.twApplicationCount + this.fbApplicationCount;
                this.siApplicationPercent = (internalJobPost) ? JobAdsBoardsModel.determinePercent(this.totalApplication, this.siApplicationCount) : 0;
                this.swApplicationPercent = (yourSiteJobPost) ? JobAdsBoardsModel.determinePercent(this.totalApplication, this.swApplicationCount) : 0;
                this.seApplicationPercent = (seek) ? JobAdsBoardsModel.determinePercent(this.totalApplication, this.seApplicationCount) : 0;
                this.onApplicationPercent = (oneShift) ? JobAdsBoardsModel.determinePercent(this.totalApplication, this.onApplicationCount) : 0;
                this.caApplicationPercent = (careerone) ? JobAdsBoardsModel.determinePercent(this.totalApplication, this.caApplicationCount) : 0;
                this.twApplicationPercent = (twitter) ? JobAdsBoardsModel.determinePercent(this.totalApplication, this.twApplicationCount) : 0;
                this.fbApplicationPercent = (facebook) ? JobAdsBoardsModel.determinePercent(this.totalApplication, this.fbApplicationCount) : 0;
                this.maxApplicationPercentBoard = this.getMaxApplicationPercentBoard(this);

            }

            // Displays how many Sources have 1 or more applicants
            getSourceApplicantCount() {
                let count = 0;

                if (this.siApplicationCount > 0) {
                    count++;
                }

                if (this.swApplicationCount > 0) {
                    count++;
                }

                if (this.seApplicationCount > 0) {
                    count++;
                }

                if (this.onApplicationCount > 0 && this.onApplicationCount !== null) {
                    count++;
                }

                if (this.caApplicationCount > 0) {
                    count++;
                }

                if (this.twApplicationCount > 0) {
                    count++;
                }

                if (this.fbApplicationCount > 0) {
                    count++;
                }

                return count;
            }

            getMaxApplicationPercentBoard(JobPostsInfo) {
                var randomArray = [];

                if (JobPostsInfo.hasSherpaInternal) {
                    randomArray.push({
                        percent: JobPostsInfo.siApplicationPercent,
                        logo: '', // get later in directive job-details-board
                        usedFor: JobPostsInfo.siUpdatedDate,
                        source: 'internal',
                    })
                }

                if (JobPostsInfo.hasSherpaWebSite) {
                    randomArray.push({
                        percent: JobPostsInfo.swApplicationPercent,
                        logo: '', // get later in directive job-details-board
                        usedFor: JobPostsInfo.swUpdatedDate,
                        source: 'website',
                    })
                }

                if (JobPostsInfo.hasSeek) {
                    randomArray.push({
                        percent: JobPostsInfo.seApplicationPercent,
                        logo: 'seek-left.png',
                        usedFor: JobPostsInfo.seUpdatedDate,
                        source: '',
                    })
                }

                if (JobPostsInfo.hasOneShift) {
                    randomArray.push({
                        percent: JobPostsInfo.onApplicationPercent,
                        logo: 'oneshift-left.png',
                        usedFor: JobPostsInfo.onUpdatedDate,
                        source: '',
                    })
                }

                if (JobPostsInfo.hasCareerOne) {
                    randomArray.push({
                        percent: JobPostsInfo.caApplicationPercent,
                        logo: 'careerone-left.png',
                        usedFor: JobPostsInfo.caUpdatedDate,
                        source: '',
                    })
                }

                if (JobPostsInfo.hasTwitter) {
                    randomArray.push({
                        percent: JobPostsInfo.twApplicationPercent,
                        logo: 'twitter-left.png',
                        usedFor: JobPostsInfo.twUpdatedDate,
                        source: '',
                    })
                }

                if (JobPostsInfo.hasFacebook) {
                    randomArray.push({
                        percent: JobPostsInfo.fbApplicationPercent,
                        logo: 'facebook-left.png',
                        usedFor: JobPostsInfo.fbUpdatedDate,
                        source: '',
                    })
                }
           
                if (randomArray.length === 0) {
                    // return default is internal with percent is 0
                    return {
                        percent: 0,
                        logo: '', // get later in directive job-details-board
                        usedFor: 0,
                        source: 'internal',
                    }
                }

                // sort array by desecending percent
                randomArray = _.sortBy(randomArray, function (item) {
                    return -item.percent;
                });

                var max = randomArray[0]; // get max percent in array 

                // select random an item from array and compare with max
                var random = _.sample(randomArray);
                if (random.percent > max.percent) {
                     max = random;
                }
                else if (random.percent < max.percent) {
                    return max;
                }
                else {
                    //random again between 2 item
                    randomArray = [random, max];
                    max = _.sample(randomArray);
                }
                return max;
            }

            /*
             * Create the object from the return payload
             */
            static fromApi(JobPostsInfo) {
                return new JobAdsBoardsModel(JobPostsInfo);
            }

            /*
             * Prepare the JSON payload to send to the API
             */
            toApi() {
                let internalJobPost, yourSiteJobPost, seekJobPost, oneShiftJobPost, careerOneJobPost, twitterJobPost, facebookJobPost;
                internalJobPost = {
                    "MultipostJobInternalDetail": {
                        "ReferFriend": this.siReferFriend,
                        "MembersCanApply": this.siInterApplications,
                        "MembersCanApplyMsg": this.siInternalMessage,
                        "InternalGroupIds": this.siSelectGroups.map(function (item) { return item.Id; }),
                        "KeyContact": this.siKeyContact ? this.siKeyContact.Value : null,
                        "JobPost": {
                            "ExpiredDate": (this.siExpiredDateType === 'default') ? moment(this.siExpiredDateDefaultDate).format('YYYY-MM-DD[T]HH:mm:ss.SSS') : moment(this.siExpiredDateCustomDate).format('YYYY-MM-DD[T]HH:mm:ss.SSS'),
                            "ApplicationCount": this.siApplicationCount,
                            "JobPostId": this.siJobPostId,
                            "JobId": this.siJobId,
                            "PostHere": this.siActive,
                            "JobPostSubscriptionId": this.siJobPostSubscriptionId,
                            "PreviouslyPostedHere": this.siPreviouslyPostedHere,
                            "UpdatedDate": this.siUpdatedDate
                        }
                    }
                };
                yourSiteJobPost = {
                    "MultipostJobYourSiteDetail": {
                        "JobPost": {
                            "ExpiredDate": (this.swExpiredDateType === 'default') ? moment(this.swExpiredDateDefaultDate).format('YYYY-MM-DD[T]HH:mm:ss.SSS') : moment(this.swExpiredDateCustomDate).format('YYYY-MM-DD[T]HH:mm:ss.SSS'),
                            "PostHere": this.swActive,
                            "ApplicationCount": this.swApplicationCount,
                            "JobPostId": this.swJobPostId,
                            "JobId": this.swJobId,
                            "JobPostSubscriptionId": this.swJobPostSubscriptionId,
                            "PreviouslyPostedHere": this.swPreviouslyPostedHere,
                            "UpdatedDate": this.swUpdatedDate
                        }
                    }
                };
                seekJobPost = {
                    "MultipostJobSeekDetail": {
                        "Market": this.seMarket,
                        "Classification": this.seClassification,
                        "SubClassification": this.seSubClassification,
                        "Location": this.seLocation,
                        "Area": this.seArea,
                        "ListingStandOut": (this.seListingStandOutB1 || this.seListingStandOutB2 || this.seListingStandOutB3) ? true : false, //field update in api just variable flag for update ListingStandOutB1, ListingStandOutB2, ListingStandOutB3
                        "ListingStandOutB1": this.seListingStandOutB1,
                        "ListingStandOutB2": this.seListingStandOutB2,
                        "ListingStandOutB3": this.seListingStandOutB3,
                        "VideoLink": this.seVideoLink,
                        "JobPost": {
                            "PostHere": this.seActive,
                            "ApplicationCount": this.seApplicationCount,
                            "JobPostId": this.seJobPostId,
                            "JobId": this.seJobId,
                            "JobPostSubscriptionId": this.seJobPostSubscriptionId,
                            "PreviouslyPostedHere": this.sePreviouslyPostedHere,
                            "ExpiredDate": this.seExpiredDateDefault,
                            "UpdatedDate": this.seUpdatedDate

                        }
                    }
                };
                oneShiftJobPost = {
                    "MultipostJobOneShiftDetail": {
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
                };
                careerOneJobPost = {
                    "MultipostJobCareerOneDetail": {
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
                };
                twitterJobPost = {
                    "MultipostJobTwitterDetail": {
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
                };
                facebookJobPost = {
                    "MultipostJobFacebookDetail": {
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
                };

                let result = {};
                (this.hasSherpaInternal) ? result.InternalJobPost = internalJobPost : false;
                (this.hasSherpaWebSite) ? result.YourSiteJobPost = yourSiteJobPost : false;
                (this.hasSeek) ? result.SeekJobPost = seekJobPost : false;
                (this.hasOneShift) ? result.OneShiftJobPost = oneShiftJobPost : false;
                (this.hasCareerOne) ? result.CareerOneJobPost = careerOneJobPost : false;
                (this.hasTwitter) ? result.TwitterJobPost = twitterJobPost : false;
                (this.hasFacebook) ? result.FacebookJobPost = facebookJobPost : false;

                return result;
            }

            /*
             * Function get regionId by locationId
             */
            static determineRegion(regionDetails, location) {
                let result;
                regionDetails.forEach(function (regionDetail) {
                    let Location = regionDetail.LocationList.filter(function (locationItem) {
                        return locationItem.XmlValue === location;
                    });

                    if (Location.length) {
                        result = regionDetail.XmlValue;
                    }
                });
                return result;
            }

            static determinePercent(total, subtotal) {
                if (!total || total === 0) {
                    return 0;
                }
                return Math.round((subtotal / total) * 100);
            }

            /**
             * Count the number of active boards
             * @returns {number}
             */
            countActiveBoards() {
                let count = 0;

                if (this.siActive) count++;
                if (this.swActive) count++;
                if (this.seActive) count++;
                if (this.onActive) count++;
                if (this.caActive) count++;
                if (this.twActive) count++;
                if (this.fbActive) count++;

                return count;
            }
        };
    }]);