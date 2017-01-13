angular.module('ui.profile')

.controller('profileNotes', ['$scope', 'ProfileNoteFactory', '$modal', '$notify', function($scope, ProfileNoteFactory, $modal, $notify) {

    $scope.documentation = new ProfileNoteFactory();

    $scope.loadNotes = function(page, pageSize, orderBy, acending, filterBy) {
        return $scope.documentation.loadNotes({Page: page, PageSize: pageSize, OrderBy: orderBy, Acending: acending, FilterBy: filterBy}).then(function(res) {
            $scope.documentation.note.userCan = res.userCan; return res;
        });
    };
    
    $scope.delete = function(model) {
        $scope.documentation.deleteNoteById(model.ContentId).then(function() {
            var notes = $scope.documentation.note.documents;
            for(var i = notes.length - 1; i >= 0; i--) {
                if(notes[i].ContentId === model.ContentId) {
                    notes.splice(i,1);
                    break;
                }
            }
        }, function(res) {
            $notify.add({
                type: 'error',
                message: res
            });
        });
    };
    $scope.openModalCreateEditNote = function(model) {
        var modal = $modal.open({
            templateUrl: '/interface/views/profile/partials/modal-create-edit-note.html',
            controller: 'modalCreateEditNoteCtrl',
            classes: 'profile',
            loadedData: false,
            resolve: {
                $globalConfig: function() {
                    return $scope.profile;
                },
                updateNotes: function() {
                    return function(model, isEditing) {
                        // page will update from view cache
                        // add item to cache add first position
                        // in case failed , have no way to handle for it due to api
                        $scope.documentation.getNoteById(model.ContentId).then(function(res) {
                            if (isEditing === true) {
                                model.isUpdated = true;
                                
                                model.Document = res.data.Document; // reupdate document
                                model.DocumentsRelated = res.data.DocumentsRelated; // reupdate document
                                model.Feedback = res.data.Feedback;

                                //if (res.data.Document) {
                                //    model.Document = res.data.Document; // reupdate document
                                //} else {
                                //    delete model.Document;
                                //}
                            }
                            if (isEditing === false) {
                                res.data.isNew = true;
                                $scope.documentation.note.documents.unshift(res.data);
                            }
                        }); 
                    };
                },
                model: function() {
                    return model;
                }
            }
        });
    };
}])
.controller('modalCreateEditNoteCtrl', ['$scope','ProfileNoteFormFactory' ,'$modalInstance', 'updateNotes', 'Url','model','$globalConfig', function($scope, ProfileNoteFormFactory, $modalInstance, updateNotes, Url, model, $globalConfig) {
    $scope.profileNoteForm = new ProfileNoteFormFactory(model, $globalConfig);
    $modalInstance.dataDone(function() {
        return $scope.profileNoteForm.isBuilt;
    });
    $scope.submitData = function(data) {
        var noteObj = angular.copy(data);
        noteObj.Description = Url.parseText(Url.stripHtml(noteObj.Description)).text;
        return $scope.profileNoteForm.$save(noteObj).then(function(res) {
            updateNotes((!!$scope.profileNoteForm.$editing) ? model : { ContentId: res.data.Data}, !!$scope.profileNoteForm.$editing);
            $modalInstance.close();
            return res;
        });
    };
    
    $scope.save = function() {
        $scope.$broadcast('submitProfileNoteData', function(isSuccess) {
            //if(isSuccess) $modalInstance.close();
        });
    };
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
}]);
