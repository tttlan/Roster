// Training Subject
// ----------------------------------------

angular.module('ui.training')

.factory('TrainingSubjectFactory', ['$timeout', 'TrainingSubjects', 'Members', 'TrainingCourses',
    function($timeout, TrainingSubjects, Members, TrainingCourses) {
    
    // Constructor
    // ----------------------------------------
      function Subject(futureData) {
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
                
              Subject.$$timeout(function() {
                  angular.extend(self, res.data);
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

      Subject.$$timeout = $timeout;
      Subject.$$service = TrainingSubjects;
      Subject.$$memberService = Members;
      Subject.$$courseService = TrainingCourses;


    // Constructor methods
    // ---
    // The methods can be used from a constructor, but wont carry through to child instances
    // we give these a methods a $ prefix to denote them as methods,
    // and also removes them from being watched on the scope
    // ----------------------------------------
    
    // Instantly returns a new subject(), which will unwrap when the promise is returned
      Subject.$getById = function(id) {
        
      var futureSubjectData = this.$$service.getById(id);

        //Build the new Subject
      var subject = new Subject( futureSubjectData );

        // Also set the id to it right away, so other calls can be
        // made before the first call is returned
      subject.TrainingSubjectId = id;

      return subject;
    };

    
    // Instantly returns a new launched subject(), which will unwrap when the promise is returned
      Subject.$getByIdForLaunch = function(id) {
        
      var futureSubjectData = this.$$service.getByIdForLaunch(id);

        //Build the new Subject
      var subject = new Subject( futureSubjectData );

        // Also set the id to it right away, so other calls can be
        // made before the first call is returned
      subject.TrainingSubjectId = id;

      return subject;
    };

    // Returns the promise, with a list of new subjects. This is leveraged by pagination.
      Subject.$get = function(paginationData) {

      return this.$$service.get(paginationData).then(function(res) {
            //Build Subjects
          res.data = res.data.map(function(SubjectData) {
              return new Subject(SubjectData);
            });

          return res;

        });
    
    };
    
    // Returns the promise, with a list of subjects within a course a member is completing
      Subject.$getByIdForMember = function(courseId) {

      return Subject.$$memberService.getTrainingSubjectsByCourseId( courseId ).then(function(response) {

          var nextSubjectIds = [],
              subjects = [];

          response.data.TrainingSubjectForMemberSummaryItemResults.forEach(function(subject) {
                
              var sub = subject.TrainingSubjectForMemberSummary;

                //If it's not passed add the IDs to the next to complete list
              if( sub.TrainingSubjectMemberProgressStatusId !== 'Passed' ) {
                  nextSubjectIds.push( sub.TrainingSubjectId );
                }

              subjects.push( new Subject(sub) );

            });

          return {
              subjects: subjects,
              nextSubjectIds: nextSubjectIds
            };

        });

    };



    // Methods of each instance
    // ---
    // we give these a methods a $ prefix to denote them as methods,
    // and also removes them from being watched on the scope
    // ----------------------------------------

    // Save checks for an ID, if there is none, it will create the Subject, otherwise an update is given
    // When a create is called, it will return an ID that will be injected into the subject
      Subject.prototype.$save = function(data) {
        
      var self = this,
          action = this.TrainingSubjectId ? 'update' : 'create';
        
      this.$loading = true;

      data.TrainingSubjectContentTypeId = data.Uri ? 'Uri' : 'FileStore';

      return Subject.$$service[action](data).then(function(res) {

          self.$loading = false;

            //Inject the id into the object if we return from a create
          if(action === 'create') {
              self.TrainingSubjectId = res.data;
            }

          return res;

        }, function() {
          self.$loading = false;
        });

    };

    // Reset call that is used to clear all users progress on a subject.
    // There are 2 flags used that we can check against with the status of the reset
      Subject.prototype.$reset = function() {

      var self = this;

      if( this.$isResetting || this.$isReset ) { return; }

      this.$isResetting = true;

      return Subject.$$service.reset(this.TrainingSubjectId).then(function(res) {

          Subject.$$timeout(function() {
              self.$isReset = true;
              self.$isResetting = false;
            });
            
          return res;

        }, function(res) {

          Subject.$$timeout(function() {
              self.$isReset = false;
              self.$isResetting = false;
            });

          return res;

        });

    };

    // Returns a promise with a list of users and their progress in the subject in a particular course
      Subject.prototype.$getProgressInCourse = function(courseId, paginationData) {
      return Subject.$$courseService.getProgress(courseId, this.TrainingSubjectId, paginationData);
    };

      return Subject;

    }]);