angular.module('ui.profile').factory('ProfileNoteFormFactory', ['FormFactory','$routeParams','$http','$q', ProfileNoteFormFactory]);

function ProfileNoteFormFactory(FormFactory, $routeParams, $http, $q) {
    function createPromise(data) {
        var d = $q.defer();
        if (data.DocumentsRelated) {
            data.DocumentIds = data.DocumentsRelated.map(function(item) {
                return {
                    FileName: item.FileName,
                    FileSize: item.FileSize,
                    FileStoreId: item.ArtifactId // fake data        
                };
            });
        }
        d.resolve({ data: data });
        return d.promise;
    }
    function getFormData(note, $globalConfig) {
        var editing = (note && !isNaN(parseInt(note.ContentId))) ? true : false;
        return $http.get('/interface/views/profile/form-data/note.json').then(function(response) {
            if ($globalConfig.$ownProfile) {
                response.data[0].elements[0].disabled = true; // can't update current if is owner
                response.data[0].elements[0].class = 'ng-hide';
            }
            if(editing) {
                if (note.userCan.canupdatefeedback && note.userCan.canedit) {
                }
                else if (note.userCan.canupdatefeedback) {
                    response.data[0].elements.splice(3, 1);
                    response.data[0].elements.splice(1, 2);
                }
                else if (note.userCan.canedit) {
                    response.data[0].elements.splice(0, 2);
                }
            }
            return response.data;
        });
    }
    function ProfileNoteForm(note, $globalConfig) {
        var editing = (note && !isNaN(parseInt(note.ContentId))) ? true : false;
        var extraMsg = $globalConfig.$ownProfile && !$globalConfig.isadmin ? ' This content will be visible to your manager' : '';
        var OPTIONS = {
            serviceName: 'Profile',
            /*offNotifySuccess: true,*/
            saveAction: editing ? 'updateProfileNote' : 'createProfileNote',
            successMsg: (editing ? 'Your profile note has been updated.': 'Your profile note has been created.') + extraMsg,
            errorMsg: editing ? 'Your profile note could not be updated at this time. Please try again later' : 'Your profile note could not be created at this time, please try again later',
            dataPromise: typeof note === 'object' ? createPromise(note) : null,
            customProperties: {
                $editing: editing,
                $ContentId: editing ? note.ContentId : null,
                $formPromise: getFormData(note, $globalConfig),
                $globalConfig: $globalConfig
            },
            saveDataFn: function(that, data) {
                return data;
            },
            saveDataSuccessFn: function(that, data) {
                return null; 
            },
            saveDataErrorFn: function(that, data) {
                return null; 
            }
        };
        return new FormFactory(OPTIONS);
    }

    return ProfileNoteForm;

}