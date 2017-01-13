angular.module('ui.training')

// Member's Training Course List Controller
// ----------------------------------------
.controller('trainingCtrl', ['$scope','TrainingCourseFactory',
    function($scope, TrainingCourseFactory) {

      $scope.getCourses = function(page, pageSize, orderBy, acending, filterBy) {
        
      return TrainingCourseFactory.$getForMember({
          'page': page,
          'pageSize': pageSize,
          'orderBy': orderBy,
          'acending': acending,
          'filterBy': filterBy
        });

    };

      $scope.onMemberReturn = function(members) {
        
      return members.map(function(member) {

          member.percentComplete = Math.floor(member.completedModules / member.totalModules * 100);
          member.name += $scope.page.current;

          return member;
        
        });

    };

    }])

// Member's Training Course Controller
// ----------------------------------------
.controller('trainingCourseCtrl', ['$scope', 'TrainingCourseFactory', '$routeParams', '$timeout', '$rootScope', 'Members',
    function($scope, TrainingCourseFactory, $routeParams, $timeout, $rootScope, Members) {

      function formatTime(time) {
        
      time = parseInt(time);

      if( !time ) {
            
          time = 'A few minutes';

        } else if( time < 60 ) {
        
          time = time + ' Minutes';
        
        } else {

          time = Math.floor(time/60) + ' Hours';
        
        }

      return time;

    }
    
      $scope.course = TrainingCourseFactory.$getById($routeParams.id);
      $scope.course.$promise.then(function(res) {
        
      var course = res.data.TrainingCourseDetail;

      var totalTime = course.TrainingSubjects.reduce(function(total, subject) {
          return subject.Duration ? total + parseInt(subject.Duration) : total;
        }, 0);

        //Generate total duration for course
      $scope.course.duration = formatTime(totalTime);
      $rootScope.title = course.Title;
    });

    //These are different to just normal subjects, and pull back the users status with each subject.
    // they populate into the course.MemberSubjects and course.nextMemberSubject
      $scope.course.$getSubjectsForMember();

    }])

// Member's Training Subject Controller
// ----------------------------------------
.controller('trainingSubjectsCtrl', ['$scope', 'Members', 'TrainingSubjectFactory', 'TrainingCourseFactory', '$routeParams', '$location', '$q', '$timeout', 'Paths', '$rootScope', '$route',
    function($scope, Members, TrainingSubjectFactory, TrainingCourseFactory, $routeParams, $location, $q, $timeout, Paths, $rootScope, $route) {

      $scope.course = TrainingCourseFactory.$getById($routeParams.courseId);
      var subjectsPromise = $scope.course.$getSubjectsForMember().then(function(res) {
      $timeout(function() {
          $scope.nextSubject = ( $routeParams.subjectId === res.nextSubjectIds[0] ) ? res.nextSubjectIds[1] : res.nextSubjectIds[0];
        });
    });

    // Get the subject you wanted By ID
      $scope.subject = TrainingSubjectFactory.$getByIdForLaunch($routeParams.subjectId);
      $scope.subject.$promise.then(function(res) {
      $rootScope.title = res.data.Title;
    });

      var goToNext = function() {

      var nextlocation = $scope.nextSubject ? Paths.get('training.subject', $routeParams.courseId, $scope.nextSubject).path : Paths.get('training.index').path;
      $location.path(nextlocation);

    };
    
      $scope.currentSubjectIsComplete = false;
      $scope.reloadPage = function() {
      $route.reload();
    };

    //When all the data is recieved, set loading to false
      $q.all([$scope.course.$promise, $scope.subject.$promise, subjectsPromise]).then(function() {
        
      $timeout(function() {
            
          $scope.loading = false;

            // Loop through subjects, get the selected subject and set the subject status of it
          $scope.course.subjectsForMember.map(function(subject) { 
              if( parseInt(subject.TrainingSubjectId) === parseInt($scope.subject.TrainingSubjectId) ) {
                  $scope.currentSubjectIsComplete = (subject.TrainingSubjectMemberProgressStatusId === 'Passed');
                  return;
                } 
            });
            
          if($scope.currentSubjectIsComplete ) {
                
              $scope.nextAction = $scope.nextSubject ? 'Next Subject' : 'Return to Courses';

            } else {

              $scope.nextAction = $scope.nextSubject ? 'Complete Subject' : 'Complete Course';

            }
        });

    });


      $scope.loading = true;

      $scope.completeSubject = function(id) {
        
      $scope.thirdPartyNotCompleteError = false;

      if( $scope.currentSubjectIsComplete ) {
            
            // If it's already complete, lets move to the next subject
          goToNext();
        
        } else {

          if($scope.subject.FileStore && $scope.subject.FileStore.type === 'video') {
              if(!$scope.subject.FileStore.finished) {
                  $scope.formSubmitted = true;
                  return false;
                }
            }
            
          $scope.loading = true;
        
          Members.updateTrainingSubjectProgress(id, {'TrainingSubjectMemberProgressStatus': 3}).then(function(response) {

              $scope.loading = false;

              if(response.data.Message) {
                    
                  $scope.serverError = response.data.Message;

                } else if(response.data.TrainingSubjectMemberProgressStatusId === 'Passed') {
                    
                    // Continue if we have confirmation member has Passed this subject
                  goToNext();
                
                } else {

                    // Member has clicked 'Complete Subject' but has not actually passed it yet
                  $scope.thirdPartyNotCompleteError = true;
                
                }

            });

        }

    };

    }])


// Manage Training Course List Controller
// ----------------------------------------
.controller('trainingManageCtrl', ['$scope', 'TrainingCourseFactory',
    function($scope, TrainingCourseFactory) {

      $scope.getCourses = function(page, pageSize, orderBy, acending, filterBy) {
      return TrainingCourseFactory.$get({
          'page': page,
          'pageSize': pageSize,
          'orderBy': orderBy,
          'acending': acending,
          'filterBy': filterBy
        }).then(function(res) {
            
            //Set permissions on first call.
          if(!$scope.userCan) {
              $scope.userCan = res.userCan;
            }

          return res;
        });

    };

    }])

// Manage Training Subject List Controllers
// ----------------------------------------
.controller('trainingManageSubjectsCtrl', ['$scope', 'TrainingSubjectFactory',
    function($scope, TrainingSubjectFactory) {

      $scope.getSubjects = function(page, pageSize, orderBy, acending, filterBy) {
        
      return TrainingSubjectFactory.$get({
          'page': page,
          'pageSize': pageSize,
          'orderBy': orderBy,
          'acending': acending,
          'filterBy': filterBy
        }).then(function(res) {
            
            //Set permissions on first call.
          if(!$scope.userCan) {
              $scope.userCan = res.userCan;
            }

          return res;
        });
    
    };

    }])


// Training Course Stats Controllers
// ----------------------------------------
.controller('trainingManageStatsCtrl', ['$scope', '$routeParams', 'TrainingCourseFactory', 'Paths', '$timeout', '$rootScope',
    function($scope, $routeParams, TrainingCourseFactory, Paths, $timeout, $rootScope) {
    
      $scope.courseId = $routeParams.id;
    
      $scope.course = TrainingCourseFactory.$getById($routeParams.id);

      $scope.course.$promise.then(function(res) {
      $timeout(function() {
          var courseData = res.data.TrainingCourseDetail;
          $scope.course.subjectCount = courseData.TrainingSubjects.length;
          $rootScope.title = 'Stats for ' + courseData.Title;
        });
    });

      $scope.getProgress = function(page, pageSize, orderBy, acending, filterBy) {
      return $scope.course.$getMembers({
          page: page,
          pageSize: pageSize,
          orderBy: orderBy,
          acending: acending,
          filterBy: filterBy
        }).then(function(response) {

          var tak = response.headers('x-tak');
          if(tak) {
              $scope.csvUrl = Paths.get('reporting.trainingCourseMembers', $scope.courseId, tak, 'csv').path;
            }
            
          return response;
        
        });

    };

    }])

// Training Subject Stats Controllers
// ----------------------------------------
.controller('trainingManageSubjectsStatsCtrl', ['$scope', '$routeParams', 'TrainingSubjectFactory', 'Paths', '$timeout', '$rootScope',
    function($scope, $routeParams, TrainingSubjectFactory, Paths, $timeout, $rootScope) {
    

      var subject = TrainingSubjectFactory.$getById($routeParams.subjectId);
    
    // Grab the title of the course and the subject from the subject object.
    // This is only needed for showing off headings
      subject.$promise.then(function(response) {
        
      var subject = response.data;
        
      $rootScope.title = 'Stats for ' + subject.Title;

      $timeout(function() {
            
          angular.forEach(subject.TrainingCourses, function(trainingCourse) {
              if ( Number(trainingCourse.TrainingCourseId) === Number($routeParams.courseId) ) {
                 $scope.course = {
                      title : trainingCourse.Title,
                      id : $routeParams.courseId
                    };
               }
            });

          $scope.subject = {
              title: subject.Title
            };

        });
    });

      $scope.getSubjectStats = function(page, pageSize, orderBy, acending, filterBy) {

      return subject.$getProgressInCourse( $routeParams.courseId, {
          page: page,
          pageSize: pageSize,
          orderBy: orderBy,
          acending: acending,
          filterBy: filterBy
        }).then(function(response) {
            
          var tak = response.headers('x-tak');
          if(tak) {
              $scope.csvUrl = Paths.get('reporting.trainingSubjectProgress', $routeParams.courseId, $routeParams.subjectId, 'csv', tak).path;
            }
          return response;
        
        });
    };

      $scope.courseId = $routeParams.courseId;

    }])


// Training Course Create / Edit Controller
// ----------------------------------------
.controller('trainingManageCreateCtrl', ['$scope', 'TrainingCourseFactory', '$routeParams', '$location', '$timeout', 'Paths',
    function($scope, TrainingCourseFactory, $routeParams, $location, $timeout, Paths) {
    
      $scope.page = {
      action: 'Create'
    };
      $scope.loading = false;
      $scope.serverError = false;

    //If we are editing, lets load in the course data
      if( $routeParams.id ) {

      $scope.page.action = 'Edit';

        // TODO: Figure out why removing this $timeout breaks the the scope.data.
        // It's got something to do with the ng-form within the view. If must be trying
        // to dodgey the object at clearing it, I'm not yet sure why.
      $timeout(function() {
          $scope.data = TrainingCourseFactory.$getById( $routeParams.id );
        });

    } else {
      $timeout(function() {
          $scope.data = new TrainingCourseFactory({
              Active: true,
              Compulsory: true,
              PromptAtLogin: false,
              AvailableDuringOnboarding: false,
              StartDate: moment().local().startOf('day').utc().toISOString(),
              EndDate: moment().local().endOf('day').millisecond(0).utc().toISOString(),
              Published: false
            });
        });

    }

    

      function displayServerError(errorMsg) {
      $scope.serverError = errorMsg;
    }

      $scope.saveCourse = function(valid, courseData, goToSubjects) {

      $scope.data.$save().then(function(response) {

          if(response && response.data && response.data.Message) {
                
              displayServerError(response.data.Message);
            
            } else {

              var courseId = $routeParams.id || response.data;
              var path = goToSubjects ? Paths.get('training.manage.courses.addSubjects', courseId).path : Paths.get('training.manage.index').path;

              $scope.serverError = false;
              $location.path(path);
            
            }
        
        }, function(response) {
          displayServerError('An error has occured, please try again later');
            
        });

    };

    }])

// Training Subject Create / Edit Controller
// ----------------------------------------
.controller('trainingManageSubjectsCreateCtrl', ['$scope', 'TrainingSubjectFactory', '$routeParams', '$location', '$timeout', 'Paths',
    function($scope, TrainingSubjectFactory, $routeParams, $location, $timeout, Paths) {

      $scope.page = {
      action: 'Create'
    };

      $scope.attachedCourseId = Number($routeParams.courseId);
    
      var completedLocation = $routeParams.courseId ? Paths.get('training.manage.courses.addSubjects', $routeParams.courseId).path : Paths.get('training.manage.subjects').path;

      $scope.serverError = false;

      if( $routeParams.id ) {

        //If we are editing, lets load in the course data
      $scope.page.action = 'Edit';

      $scope.subject = TrainingSubjectFactory.$getById( $routeParams.id );
      $scope.subject.$promise.then(function(response) {
            
          response.data.FileStore = response.data.FileStore ? [{
              'name': response.data.FileStore.FileName,
              'size': response.data.FileStore.FileSize,
              'ext': response.data.FileStore.FileName.split('.').pop(),
              'id': response.data.FileStore.FileStoreId
            }] : [];

          $timeout(function() {
              $scope.activeFileIndex = response.data.Uri ? 2 : 1;
            });

          return response;
        });

    } else {
        //new course, set upload tab to first
      $scope.activeFileIndex = 1;

      $scope.subject = new TrainingSubjectFactory({
          Active: true,
          trainingCourseIds: $scope.attachedCourseId ? [$scope.attachedCourseId] : []
        });


    }

      $scope.cancel = function() {
      $location.path(completedLocation);
    };

      $scope.saveSubject = function(valid, data) {
        
      if(!valid) { return; }

      $scope.subject.$save(data).then(function(response) {

          if(!response.data.Message) {
              $location.path( completedLocation );
            }
        });

    };

    }])

// Training Course - Add Subjects Controller
// ----------------------------------------
.controller('trainingManageAddSubjectsCtrl', ['$scope', '$routeParams', '$location', '$q', 'TrainingSubjectFactory', '$timeout', 'TrainingCourseFactory',
    function($scope, $routeParams, $location, $q, TrainingSubjectFactory, $timeout, TrainingCourseFactory) {
    
      $scope.trainingCourseId = $routeParams.id;

      $scope.loading = false;
      $scope.serverError = false;
      $scope.subjectsLoaded = false;
      $scope.data = {
      selectedSubjects: []
    };



    //Load in all subjects
      var subjectPromise = TrainingSubjectFactory.$get({acending: true});

    //Load in the course, and get the subjects from within
      var course = TrainingCourseFactory.$getById($routeParams.id);

      $q.all([subjectPromise, course.$promise]).then(function(response) {
        
      $timeout(function() {
            
            //Simplify the subject object
          $scope.subjects = response[0].data.map(function(subject) {
              return {
                  title: subject.Title,
                  id: subject.TrainingSubjectId,
                  active: subject.Active
                };
            });

          $scope.data.selectedSubjects = course.TrainingSubjects.map(function(subject) {
              return subject.TrainingSubjectId;
            });

          $scope.subjectsLoaded = true;
        
        });

    });

      $scope.addSubjectsToCourses = function(selectedSubjects, goToSubjects) {
        
      if(selectedSubjects.length) {

          $scope.loading = true;

          course.$addSubjects(selectedSubjects).then(function(response) {

              $scope.loading = false;

              if(response.data.Message) {
                    
                  $scope.serverError = response.data.Message;
                
                } else {

                  var courseId = $routeParams.id;
                  var path = goToSubjects ? '/training/manage/' + courseId + '/add_groups' : '/training/manage';

                  $scope.serverError = false;

                  $location.path(path);

                }

            });

        } else {

          $scope.loading = false;
          $scope.serverError = ('You need to add a subject to the course to continue.');
        
        }

    };

    }])

// Training Course - Add Groups and Roles Controller
// ----------------------------------------
.controller('trainingManageAddGroupsCtrl', ['$scope', '$routeParams', 'Networks', 'TrainingCourseFactory', '$location', '$q', '$timeout',
    function($scope, $routeParams, Networks, TrainingCourseFactory, $location, $q, $timeout) {

      $scope.loading = true;
      $scope.groups = [];
      $scope.roles = [];
      $scope.submitted = false;

      $scope.course = TrainingCourseFactory.$getById($routeParams.id);
      $scope.course.$getGroups();
      $scope.course.$getRoles();

      $scope.course.allRoles = true;
      $scope.course.allGroups = true;

    //When all the data is recieved, set loading to false
      $q.all([ $scope.course.$promise, Networks.getGroupsAndRoles().$promise]).then(function() {
      $timeout(function() {
          $scope.loading = false;
        });
    });

      $scope.saveGroups = function() {
        
      if(!$scope.submitted) { $scope.submitted = true; }
        
      $scope.course.$publish().then(function(response) {
          $location.path('/training/manage');
        });

    };


    }])


.controller('trainingManageReportsCtrl',['TrainingSubjectFactory', 'TrainingCourseFactory', '$scope', 'Networks', '$timeout', '$q', '$routeParams', 'ServiceTrainingReports', 'Paths', '$location','$sce','ServiceTrainingStats',
    function(TrainingSubjectFactory, TrainingCourseFactory, $scope, Networks, $timeout, $q, $routeParams, ServiceTrainingReports, Paths, $location,$sce,ServiceTrainingStats) {
    
      Array.prototype.get = function(val) {
      for (var i=0, len=this.length; i<len; i++) {
          if (typeof this[i] !== 'object') {
              continue;
            }
          if (this[i].val === val) {
              return this[i].title;
            }
        }
    };

      var makeIntoArray = function(str) {
      if (str) {
          return String(str).split(',');
        } else {
          return [];
        }
    };

      Date.prototype.addDays = function(days) {
      var dat = new Date(this.valueOf());
      dat.setDate(dat.getDate() + days);
      return dat;
    };

      $scope.breadcrumbs = [];

      $scope.reportTypes = [
        { val: 'members', title: 'Member' },
        { val: 'networkgroups', title: 'Network Group' },
        { val: 'roles', title: 'Role' },
        { val: 'courses', title: 'Training Course' },
        { val: 'subjects', title: 'Training Subject' }
    ];

      $scope.dateRanges = [
        { val: 30, title: '30 Days' },
        { val: 60, title: '60 Days' },
        { val: 365, title: '1 Year' }
    ];

    // Scope vars
      $scope.loading = true;
      $scope.loadingGroupsAndRoles = true;
      $scope.loadingBreadcrumbs = false;
      $scope.groups = []; // groups filter 
      $scope.roles = []; // roles filter
      $scope.selectedDailyStatsRange = {};

    // $scope.report = {
    //     loaded: false,
    //     limit: 20,
    //     totalCount: 0,
    //     items: []
    // };

      $scope.dataObj = {};
      $scope.downloadUrl = '';

      $scope.data = { 
      display: true,
      reportType: $scope.reportTypes.filter(function(reportType) { // Filter report types array to with the current report type which is retrieved from the route params
          if (reportType.val === $routeParams.type) {
              return reportType;
            }
        })[0],
      byMember: false,
      selectedTagGroups: [],
      selectedTagRoles: [],
      selectedGroupIds: makeIntoArray($routeParams.groups),
      selectedRoleIds: makeIntoArray($routeParams.roles),
      dateRange: $scope.dateRanges[0]
    };
      $scope.stats = {
      display: false,
      courses: [],
      subjects: [],
      daily: [],
      coursesLoaded: false,
      subjectsLoaded: false,
      dailyLoaded: false
    };

    //$scope.stats.selectedDailyStatsRange = $scope.stats.dailyStatsRange[0].val;

      Networks.getGroupsAndRoles().$promise.then(function(res) {
      $scope.loadingGroupsAndRoles = false;
    });

      var setStats = function(completed, inProgress, failed, notStarted) {
      var stats = [
            {'value':completed,'description':'COMPLETED','color':'green'},
            {'value':inProgress,'description':'IN PROGRESS','color':'orange'},
            {'value':failed,'description':'FAILED','color':'red'},
            {'value':notStarted,'description':'NOT STARTED','color':'grey'}
        ];
      return stats;
    };
      var setDailyStats = function(stats) {
      var s = [];
      for(var i = 0; i<stats.length;i++) {
          var d = {
              value: stats[i].SubjectsCompletedCount,
              date: new Date(stats[i].DateSubjectsCompleted)
            };
          s.push(d);
        }
      return s;
    };

      var getStats = function() {

      $scope.stats.coursesLoaded = false;
      $scope.stats.subjectsLoaded = false;

        // Training Stats functions
      ServiceTrainingStats.getCourseStats().then(function(res) {
          $scope.stats.courses = setStats(
                res.data.CoursesCompletedCount,
                res.data.CoursesInProgressCount,
                res.data.CoursesFailedCount,
                res.data.CoursesNotAttemptedCount
            );
          $scope.stats.coursesLoaded = true;
        });
      ServiceTrainingStats.getSubjectStats().then(function(res) {
          $scope.stats.subjects = setStats(
                res.data.SubjectsCompletedCount,
                res.data.SubjectsInProgressCount,
                res.data.SubjectsFailedCount,
                res.data.SubjectsNotAttemptedCount
            );
          $scope.stats.subjectsLoaded = true;
        });
    };
      $scope.getDailyStats = function(dateRange) {

      $scope.stats.dailyLoaded = false;
      var dt = new Date();
      var df = dt.addDays(-dateRange.val);
      ServiceTrainingStats.getSubjectDailyStats(df,dt).then(function(res) {
          $scope.stats.daily = setDailyStats(res.data.SubjectsCompletedForDays);
          $scope.stats.dailyLoaded = true;
        });
    };


    // Creates the breadcrumbs array
      var setupBreadcrumbs = function() {

      $scope.loadingBreadcrumbs = true;

      var reportType = $routeParams.type;
      var reportType2 = $routeParams.type2;
      var id = $routeParams.id;
      var id2 = $routeParams.id2;
      var qs = location.search;

      $scope.breadcrumbs = [
            {val:'Reporting',text:'/training/reports'}
        ];

      if(reportType)
        {
          var typeName = $scope.reportTypes.get(reportType);

          var url = id ? constructUrl({data:$scope.data, type:reportType}).path  : '#';

          $scope.breadcrumbs.push({val:typeName, text:url + qs});

          if(id) {
              url = id2 ? constructUrl({data:$scope.data, type:reportType, id:id}).path  : '#';
              setBreadcrumbById(reportType, id, url).then(function() {
                  if(id2) {
                      url = '#';
                      setBreadcrumbById(reportType2, id2, url).then(function() {
                          $scope.loadingBreadcrumbs = false;
                        });
                    }
                    else {
                      $scope.loadingBreadcrumbs = false;
                    }
                });

            }
            else {
              $scope.loadingBreadcrumbs = false;
            }

        }
    };

    // When we drill down to a specific course or subject, we need to display its name in the breadcrumbs
      var setBreadcrumbById = function(type, id, url) {

      switch(type) {

                            case 'courses':

                              return TrainingCourseFactory.$getById(id)
                    .$promise
                    .then(function(res) {
                      return $scope.breadcrumbs.push({val:res.data.TrainingCourseDetail.Title, text:url});
                    });

                            case 'subjects':

                              return TrainingSubjectFactory.$getById(id)
                    .$promise
                    .then(function(res) {
                      return $scope.breadcrumbs.push({val:res.data.Title, text:url});
                    });

        }

    };

    // Redirects to the Report Url
    // options takes data, type, id, roleId and networkGroupId
      $scope.generateUrl = function( options ) {

      var url = constructUrl(options);
      $location
            .path(url.path)
            .search(url.search);

    };
        // Creates the Report Url
        // options takes data, type, id, roleId and networkGroupId
      var constructUrl = function( options ) {

      var type = options.data ? options.data.reportType.val : options.type.val;

      if(options.data) {
          $scope.dataObj = Networks.formatIntoIds({
              roles: angular.copy(options.data.selectedTagRoles),
              groups: angular.copy(options.data.selectedTagGroups)
            });
        }
      var search = {};

      search.roles = options.roleId ?
            String(options.roleId) :
            ($scope.dataObj.RoleIds ? $scope.dataObj.RoleIds.join() : '');

      search.groups = options.networkGroupId ?
            String(options.networkGroupId) :
            ($scope.dataObj.NetworkGroupIds ? $scope.dataObj.NetworkGroupIds.join() : '');

      var url = {
          path: options.id ?
                Paths.get('reporting.training.members', type, options.id).path : Paths.get('reporting.training', type).path,
          search:search
        }; 

      return url;

    };

      var init = (function() {
      if(!$routeParams.type) {
          $scope.stats.display = true;
          getStats();
          $scope.getDailyStats($scope.data.dateRange);
        }
    })();

      $scope.resetDownloadUrl = function() {

      $scope.downloadUrl = '';
    };

    // Generates the report
      $scope.getReport = function(page, pageSize, orderBy, acending, filterBy) {

      var type = $routeParams.type;
      if(type) {
          var id = $routeParams.id;
          var type2 = $routeParams.type2;
          var id2 = $routeParams.id2;
          var groups = $scope.data.selectedGroupIds;
          var roles = $scope.data.selectedRoleIds;

          $scope.byMember = $routeParams.id||false;
          $scope.reportTemplate = type2 ? type2 : type;

          setupBreadcrumbs();

          return ServiceTrainingReports.getReport({
              'page': page,
              'pageSize': pageSize,
              'orderBy': orderBy,
              'acending': acending,
              'filterBy': filterBy
            }, type, id, groups, roles, type2, id2).then(function(res) {

                //$scope.report.items = res.data;

                // xtak for download
              var tak = res.headers('x-tak');
              if(tak) {
                    
                  $scope.page.key = tak;
                  $scope.downloadUrl = $sce.trustAsResourceUrl(ServiceTrainingReports.getDownloadUrl(type, id, tak, type2, id2));
                }

              return res;
            });            
        }
        else {
            $scope.page.loading = false;
            return $q(function(resolve) {
                resolve({
                    data: [],
                    headers: function() {}
                });
            });
        }
    };




    }]);
