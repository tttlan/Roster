angular.module('ui.services')


// Paths factory
// - Builds and stores link data
// ----------------------------------------
.service('Paths', ['API_BASE_URL', '$location', function(API_BASE_URL, $location) {
  var linkPaths = {
      network: {
          profile: {
                //url: '/network/ProfileFull.aspx?:member_id',
                external: true,
                url: '/profile/:member_id'                
            },
            filestore: {
                //url: '/network/ProfileFull.aspx?:member_id',
                //external: true
                url: '/profile/:member_id'
            },
            docLibrary: {
                url: '/network/LibraryImages.aspx?s=Doc&key=:key',
                external: true
            },
            roster: {
                url: '/network/MyRoster.aspx',
                external: true
            },
            internalJob: {
                url: '/network/InternalJob.aspx?view=detail&in_site=internal&jobid=:jobId',
                external: true
            }
        },
        inbox: {
            index: {
                url: '/network/inbox.aspx',
                external: true
            },
            message: {
                url: '/network/inbox.aspx?msgid=:id',
                external: true
            }
        },
        image: {
            defaultProfile: {
                url: '/interface/images/default-user.png'
            },
            defaultGroupProfile: {
                url: '/interface/images/default-group.png'
            }
        },
        requests: {
            details: {
                url: '/network/RequestForms.aspx?op=detail&frid=:id',
                external: true
            }
        },
        training: {
            index: {
                url: '/training'
            },
            course: {
                url: '/training/:course_id'
            },
            subject: {
                url: '/training/:course_id/:subject_id',
                thirdParty: {
                    url: '/training-subjects/:id/launch'
                }
            },
            manage: {
                index: {
                    url: '/training/manage'
                },
                courses: {
                    stats: {
                        url: 'training/manage/:course_id/stats'    
                    },
                    create: {
                        url: '/training/manage/create'
                    },
                    edit: {
                        url: '/training/manage/:course_id'
                    },
                    addSubjects: {
                        url: '/training/manage/:course_id/add_subjects'
                    },
                    addGroups: {
                        url: '/training/manage/:course_id/add_groups'
                    }
                },
                subjects: {
                    url: '/training/manage/subjects',
                    create: {
                        url: '/training/manage/subjects/create'
                    },
                    createForCourse: {
                        url: '/training/manage/subjects/create?courseId=:course_id'
                    },
                    edit: {
                        url: '/training/manage/subjects/:subject_id'
                    },
                    stats: {
                        url: '/training/manage/:course_id/:subject_id/stats'
                    }
                }
            }
        },
        dashboard: {
            index: {
                url: '/dashboard'
            },
            news: {
                index: {
                    url: '/dashboard/news'
                },
                manage: {
                    url: '/dashboard/news/manage'
                },
                article: {
                    url: '/dashboard/news/:blog_id'
                },
                create: {
                    url: '/dashboard/news/create'
                },
                edit: {
                    url: '/dashboard/news/:blog_id/edit'
                },
                category: {
                    url: '/dashboard/news/categories/:id'
                }
            }
        },
        profile: {
            changePassword: {
                url: 'profile/:member_id/change-password'
            },
            changeOwnPassword: {
                url: 'profile/change-password'
            }
        },
        events: {
            index: {
                url: 'events'
            },
            details: {
                url: 'events/:id'
            },
            create: {
                url: 'events/create'
            },
            edit: {
                url: 'events/:id/edit'
            },
            attendance: {
                url: 'events/:id/confirm-attendees'
            }
        },
        activity: {
            item: {
                url: '/activities/:id'
            }
        },
        groups: {
            group: {
                url: '/groups/:id'
            }
        },
        recruit: {
            index: {
                url: 'recruit'
            },
            jobs:{
                index:{
                    url: '/recruit/jobs'
                },
                view:{
                    url: '/recruit/jobs/:jobId/:tab'
                },
                edit:{
                    url: '/recruit/jobs/:jobId/edit'
                },
                applications:{
                    detail:{
                        url: '/recruit/jobs/:jobId/applications/:applicationId'
                    }
                }
            },
            onboards: {
                index: {
                    url: 'recruit/onboards'
                },
                create: {
                    single: {
                        url: 'recruit/onboards/create/single'
                    },
                    bulk: {
                        url: 'recruit/onboards/create/bulk'
                    }
                },
                addEmployees: {
                    url: 'recruit/onboards/addEmployees'
                },
                details: {
                    url: 'recruit/onboards/:id'
                },
                bulk: {
                    url: 'recruit/bulk-onboards'
                },
                bulkDetails: {
                    url: 'recruit/bulk-onboards/:bulkOnboardId'
                }
            },
            onboarding: {
                welcome: {
                    url: 'recruit/onboarding/welcome'
                },
                terms: {
                    url: 'recruit/onboarding/terms'
                },
                documents: {
                    url: 'recruit/onboarding/documents'
                },
                inboundDocuments: {
                    url: 'recruit/onboarding/inboundDocuments'
                },
                profile: {
                    url: 'recruit/onboarding/profile'
                },
                declaration: {
                    url: 'recruit/onboarding/declaration'
                },
                signature: {
                    url: 'recruit/onboarding/signature'
                },
                completion: {
                    url: 'recruit/onboarding/completion'
                },
                sorry: {
                    url: 'recruit/onboarding/sorry'
                }
            },
            requisition: {
                list : {
                    url: '/recruit/requisitions'
                },
                create: {
                     url: '/recruit/requisitions/create'
                },
                detail:{
                    url: '/recruit/requisitions/:id'
                 }
            }
        },
        reporting: {
            // Obsolete
            trainingSubjectProgress: {
                url: 'reporting/training-courses/:trainingCourseId/training-subjects/:trainingSubjectId/progresses?format=:format&key=:key',
                fromApi: true
            },
            // Obsolete
            trainingCourseMembers: {
                url: 'reporting/training-courses/:id/members?key=:key&format=:format',
                fromApi: true
            },
            trainingApi: {
                url: 'reporting/training/:type',
                fromApi: true,
                members: {
                    url: 'reporting/training/:type/:id/members',
                fromApi: true
                },
                courses: {
                    subjects: {
                        members: {
                            url: 'reporting/training/courses/:id/subjects/:id2/members',
                            fromApi: true
                        },
                    },
                },
            },
            trainingProgressForMember: {
                url: 'reporting/training/:type/:id/members?key=:key&format=:format',
                fromApi: true
            },
            trainingProgressForMemberBySubjectForCourse: {
                url: 'reporting/training/courses/:id/subjects/:id/members?key=:key&format=:format',
                fromApi: true
            },
            training: {
                url: '/training/reports/:type',
                members: {
                    url: '/training/reports/:type/:id/members'
                },
                courses: {
                    members: {
                        url: '/training/reports/courses/:trainingCourseId/members'
                    },
                    subjects: {
                        members: {
                            url: '/training/reports/courses/:trainingCourseId/subjects/:trainingSubjectId/members'
                        }
            }
        },
                subjects: {
                    members: {
                        url: '/training/reports/subjects/:id/members'
                    }
                }
            }

        },
        performanceAssessments: {
            index: {},
            edit: {
                url: '/Network/PerformanceAssessmentForm.aspx?PerformanceAssessmentID=:id&From=AdminManagePerformanceAssessment',
                external: true
            }
        },
    };

    // Traverses through an object, checks if the new path exists then continues
    function traversePath(currentPath, pathSegment) {
        
        if( !currentPath ) {
            return;
        }

        var newPathPosition = currentPath[pathSegment];

        return newPathPosition || false;

    }

    function injectIdsIntoUrl(url, ids) {

        //We should have atleast some ids to pass in, otherwise return the url without the token
      if(!ids || ids.length === 0) {
        return url.replace(/:(\w+)/ig, '');
      }

      // Match all varibles within the string, and shift in their respective Ids
      return url.replace(/:(\w+)/ig, function(match) {
        return ids.length ? ids.shift() : match;
      });

    }

  return {
      get: function(link_path, ...params) {

        // get the arguments passed through, that isn't the link_path
        var selectedPath = angular.extend({}, link_path.split('.').reduce(traversePath, linkPaths)) || {};

        // if there is a url then inject Ids into query
        if( selectedPath.url ) {
          selectedPath.url = injectIdsIntoUrl(selectedPath.url, params);
        } 
        else {
          console.warn('No path was accessible at ' + link_path);
          return { path: false };
        }

        //Prepend API BASE URL to the selected Path url if needed.
        if( selectedPath.fromApi ) {
          selectedPath.url = API_BASE_URL + selectedPath.url;
        }

        return {
          path: selectedPath.url,
          external: !!selectedPath.external,
          go: () => {
            //Helper for $location.path.
            const url = selectedPath.url.split('?');
            
            if (url.length === 2) {
              //GET parameters needs to be added with $location.search
              const keyValues = url[1].split('&');
              const params = _.zipObject(
                keyValues.map((kv) => kv.split('=')[0]),
                keyValues.map((kv) => kv.split('=')[1])
              );
              return $location.path(url[0]).search(params);
            }
            //if no GET-parameters:
            else return $location.path(selectedPath.url);
          }
        };
      },
      set: function(new_links) {
        angular.extend(linkPaths, new_links);
      }
    };

}]);