angular.module('ui.profile')

.factory('ProfileHistoryFactory', ['$routeParams', 'Profile', 'Permissions', '$notify',
    function($routeParams, Profile, Permissions, $notify) {
    
    function ProfileHistory() {
        
        // Training history
        this.employmentHistory = {};
        this.employmentHistory.$loaded = false;
        
        // Performance assessments
        this.performanceAssessments = {};
        this.performanceAssessments.$loaded = false;
                
        // Training history
        this.trainingHistory = {
            subjects: {
                $loading: true,
                $loaded: false,
                data: []
            },
            courses: {
                $loading: true,
                $loaded: false,
                data: []
            }
        };
    }

    /*
     * Employment History
     */
      
    ProfileHistory.prototype.getEmploymentHistoryAssessments = function() {
        
        var that = this;
        
        Profile.getMemberEmploymentHistory().then(function(res) {
           
            // if probabtion has passed, remove the thing a ding ding
            if (moment(res.data.ProbationEndDate).isBefore()) {
                delete res.data.ProbationEndDate;
            }
            
            that.$userCan = Permissions.formatPermissions(res.data.EntityActions); // Pass entity actions back to the view
            delete res.data.EntityActions; // Discard this data now that we have formatted and stored it

            // Mark data as loaded
            that.employmentHistory.$loaded = true;
            that.performanceAssessments.$loaded = true;

            that.employmentHistory.$isEmpty = (Object.keys(res.data.MemberEmploymentHistoryDetail).filter(function(key) {
                // Loop through all the keys and check all of them for vals if they don't start with a & and aren't MemberId or MemberExportHistories
                return (key.charAt(0) === '$' || key === 'MemberId' || key === 'MemberExportHistories') ? false : !!res.data.MemberEmploymentHistoryDetail[key];
            }).length === 0);
            
             // Place history data onto obj
            angular.extend(that.employmentHistory, res.data.MemberEmploymentHistoryDetail);

            // Place performance assessment data into obj and format permissions
            angular.extend(that.performanceAssessments, res.data.MemberEmploymentHistoryDetail.PerformanceAssessmentHistories); // Place performace assessment data onto obj
            that.performanceAssessments.$userCan = Permissions.formatPermissions(that.performanceAssessments.EntityActions); // Format performance assessment permissions
            delete that.performanceAssessments.EntityActions; // Delete now that this is stored in $userCan
            delete that.employmentHistory.PerformanceAssessmentHistories; // Delete this now that it has been moved to it's own object
            
            angular.forEach(that.performanceAssessments.PerformanceItemResults, function(val, key) {
                val.$userCan = Permissions.formatPermissions(val.EntityActions);   
                delete val.EntityActions;
            });
        });
    };
    
    /*
     * Training History
     */
    
    ProfileHistory.prototype.getTrainingSubjects = function() {
        
        var that = this;
        
        Profile.getMemberTrainingSubjects().then(function(res) {
            that.trainingHistory.subjects.$loading = false;
            that.trainingHistory.subjects.$loaded = true;
            that.trainingHistory.subjects.$userCan = Permissions.formatPermissions(res.data.EntityActions);
            that.trainingHistory.subjects.data = res.data.TrainingSubjectForMemberSummaryItemResults;
        }, function() {
            that.trainingHistory.subjects.$loading = false;
            that.trainingHistory.subjects.$loaded = true;
        });
    };
    
    ProfileHistory.prototype.getTrainingCourses = function() {
        
        var that = this;
        
        Profile.getMemberTrainingCourses().then(function(res) {
            that.trainingHistory.courses.$loading = false;
            that.trainingHistory.courses.$loaded = true;
            that.trainingHistory.courses.$userCan = Permissions.formatPermissions(res.data.EntityActions);
            that.trainingHistory.courses.data = res.data.TrainingCourseForMemberSummaryItemResults;
        }, function() {
            that.trainingHistory.courses.$loading = false;
            that.trainingHistory.courses.$loaded = true;
        });
    };
    
    ProfileHistory.prototype.openCourse = function($index) {
        
        var that = this,
            selectedCourse = this.trainingHistory.courses.data[$index];
        
        selectedCourse.$isOpen = !selectedCourse.$isOpen;
        
        if (!selectedCourse.$loadedSubjects && !selectedCourse.$loadingSubjects) {
            
            if ( selectedCourse.TrainingCourseForMemberSummary.SubjectCount > 0 ) {
                
                selectedCourse.$loadingSubjects = true;
    
                Profile.getMemberTrainingSubjectsByCourse(selectedCourse.TrainingCourseForMemberSummary.TrainingCourseId).then(function(res) {
                    
                    selectedCourse.$loadingSubjects = false;
                    selectedCourse.$loadedSubjects = true;
                    selectedCourse.subjects = res.data.TrainingSubjectForMemberSummaryItemResults;
    
                }, function() {
                    selectedCourse.$loadingSubjects = false;
                    selectedCourse.$loadedSubjects = true;
                });
    
            }
        }
    };
    
    return ProfileHistory;
    
}]);
