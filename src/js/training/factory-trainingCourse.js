// Training Course
// ----------------------------------------

angular.module('ui.training')

.factory('TrainingCourseFactory', ['$timeout', 'TrainingCourses', 'Members', 'TrainingSubjectFactory',
    function($timeout, TrainingCourses, Members, TrainingSubjectFactory) {
    
    // Constructor
    // ----------------------------------------
      function Course(futureData) {
      var self = this;

        // If it's a promise, then wait to unwrap it,
        // otherwise extend it straight away
      if(futureData && typeof futureData.then === 'function') {
            
            //open up promise directly onto object to hang
            // other then functions onto.
          this.$promise = futureData;
          this.$loading = true;

            // When it resolves, let's throw the data in
          futureData.then(function(res) {
                
              Course.$$timeout(function() {
                  angular.extend(self, res.data.TrainingCourseDetail);
                  self.$loading = false;
                });

              return res;
            });

        } else {
          angular.extend(this, futureData);
        }
        
    }



    // Inject services
    // ---
    // we give these a double $$ prefix to denote them as a global object,
    // and also removes them from any angular shallow copy shenanigans
    // ----------------------------------------
      Course.$$timeout = $timeout;
      Course.$$service = TrainingCourses;
      Course.$$memberService = Members;
      Course.$$SubjectFactory = TrainingSubjectFactory;


    // Constructor methods
    // ---
    // The methods can be used from a constructor, but wont carry through to child instances
    // we give these a methods a $ prefix to denote them as methods,
    // and also removes them from being watched on the scope
    // ----------------------------------------
    
    // Instantly returns Course, and will autopopulate the data when the promise resolves
      Course.$getById = function(id) {
        
      var futureCourseData = this.$$service.getById(id);

        //Build the new course
      var course = new Course( futureCourseData );

        // Also set the id to it right away, so other calls can be
        // made before the first call is returned
      course.TrainingCourseId = id;

      return course;
    };

    //Returns a promise, with a list of built course objects
      Course.$get = function(paginationData) {

      return this.$$service.get(paginationData).then(function(res) {
            
            //Build courses
          res.data = res.data.map(function(courseData) {
              return new Course(courseData);
            });

          return res;

        });
    
    };

    //Returns a promise, with a list of built courses for a particular member
      Course.$getForMember = function(paginationData) {

      return Course.$$memberService.getTrainingCourses(paginationData).then(function(res) {

            //  create an overdue marker on course
          res.data = res.data.TrainingCourseForMemberSummaryItemResults.map(function(courseData) {
              var course = courseData.TrainingCourseForMemberSummary,
                  endMoment = moment(course.EndDate);
                
              course.overdue = false;
                // if its date has past
                // and it is compulsary
                // and the count does not matche the completion count
                // then it is overdue
              if ( endMoment < moment() && course.Compulsory && course.SubjectsCompletedCount !== course.SubjectCount) {
                  course.overdue = true;
                  course.open = false;
                }

              return course;
            });

          return res;
        });

    };



    // Methods of each instance
    // ---
    // we give these a methods a $ prefix to denote them as methods,
    // and also removes them from being watched on the scope
    // ----------------------------------------
    
    //Checks for an ID, to either create or update the course.
    // On return of a create, it will prepopulate the ID into the course
      Course.prototype.$save = function() {
        
      var self = this,
          action = this.TrainingCourseId ? 'update' : 'create',
          data = {
              Active: this.Active,
              EndDate: this.EndDate,
              Objectives: this.Objectives, 
              Overview: this.Overview,
              StartDate: this.StartDate, 
              Title: this.Title, 
              TrainingCourseId: this.TrainingCourseId,
              AvailableDuringOnboarding: this.AvailableDuringOnboarding,
              PromptAtLogin: this.PromptAtLogin,
              Compulsory: this.Compulsory,
              Published: this.Published
            };
        
      this.$loading = true;

      return Course.$$service[action](data).then(function(res) {

          self.$loading = false;

            //Inject the id into the object if we return from a create
          if(action === 'create') {
              self.TrainingCourseId = res.data;
            }

          return res;

        }, function() {
          self.$loading = false;
        });

    };

    // A simple publish call
      Course.prototype.$publish = function() {
        
      var self = this,
          groups = this.allGroups ? [] : this.selectedTagGroups,
          roles = this.allRoles ? [] : this.selectedTagRoles;

      this.loading = true;
      this.serverError = '';

        //If the course isn't published, let's add a publish promise to the list
      return Course.$$service.publish( this.TrainingCourseId, groups, roles ).then(function(response) {
        
          self.loading = false;    
          self.serverError = '';

        }, function() {

          self.loading = false;
          self.serverError = 'An error has occured, please try again later';
        
        });

    };

    // Returns a promise of list of subjects connected to the course
    // It also prepends the subjects
      Course.prototype.$getSubjects = function() {

      var self = this;
        
        //If the subject has been loaded or is loading, back out
      if( this.$subjectsLoading || self.$subjectsLoaded ) { return; }

        // Set a loaded boolean for a loadning spinner
      this.$subjectsLoading = true;
        
      return Course.$$service.getSubjectsById( this.TrainingCourseId ).then(function(res) {
          Course.$$timeout(function() {
              self.TrainingSubjects = res.data;
              self.$subjectsLoaded = true;
              self.$subjectsLoading = false;
            });
        });

    };

    // Injects the subjects into course object with the progress data of the logged in member
    // returns the promise so it can be chained into other calls
      Course.prototype.$getSubjectsForMember = function() {

      var self = this;
        
        //If the subject has been loaded, back out
      if( this.$subjectsForMemberLoaded || this.$subjectsForMemberLoading ) { return; }

        // Set a loaded boolean for a loadning spinner
      this.$subjectsForMemberLoading = true;

      return Course.$$SubjectFactory.$getByIdForMember( this.TrainingCourseId ).then(function(res) {
            
          Course.$$timeout(function() {
                
              self.subjectsForMember = res.subjects;
              self.$nextSubjectForMemberId = res.nextSubjectIds[0];
              self.$subjectsForMemberLoaded = true;
              self.$subjectsForMemberLoading = false;

            });

          return res;
        });

    };

    
      Course.prototype.$getGroups = function() {
        
      var self = this;

      return Course.$$service.getGroupsById(this.TrainingCourseId).then(function(response) {
          Course.$$timeout(function() {
              if(response.data.length) {
                  self.selectedTagGroups = response.data;
                  self.allGroups = false;
                } else {
                  self.allGroups = true;
                }
            });
        });
    };

      Course.prototype.$getRoles = function() {
        
      var self = this;

      return Course.$$service.getRolesById(this.TrainingCourseId).then(function(response) {
          Course.$$timeout(function() {
              if(response.data.length) {
                  self.selectedTagRoles = response.data;
                  self.allRoles = false;
                } else {
                  self.allRoles = true;
                }
            });
        });
    };

      Course.prototype.$getMembers = function(paginationData) {
        
      return Course.$$service.getMembers( this.TrainingCourseId, paginationData );
    };

      Course.prototype.$getCSVUrlForMembers = function() {
      return TrainingCourses.getCsvUrlForMembers(this.id);
    };

      Course.prototype.$addSubjects = function(subjectIds) {
      return Course.$$service.assignSubjects(this.TrainingCourseId, subjectIds);
    };

      return Course;

    }]);