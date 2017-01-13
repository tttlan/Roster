angular.module('ui.recruit.jobs')
    .controller('modalAddNoteCtrl', 
    ['$scope','$modalInstance', 'selectedApplicants', 'jobId', 'cachedApplicantList',
    'NotesItemModel', 'NotesService', 'Url', 'addCommentUrl',
      ($scope, $modalInstance, selectedApplicants, jobId, cachedApplicantList, NotesItemModel, NotesService, Url, addCommentUrl) => {
        $scope.jobId = jobId;
        $scope.selectedApplicants = angular.copy(selectedApplicants);
        $scope.cachedApplicantList = cachedApplicantList;
        $scope.newNote = new NotesItemModel();
        $scope.addCommentUrl = addCommentUrl;
        $scope.cancel = function() {
          $modalInstance.close();
        };

        $scope.submit = async function() {
          $scope.loading = true;
          $scope.newNote.commentString = Url.stripHtml($scope.newNote.commentString);
          $scope.newNote.multipleCandidateIds = _.map($scope.selectedApplicants, (a) => a.memberId);

          try {
            const res = await NotesService.postCandidateComments($scope.newNote, $scope.addCommentUrl, $scope.newNote.multipleCandidateIds);
            $modalInstance.close(res);
            $scope.$apply();
          }
          catch (err) {
            console.error(err);
          }
          finally {
            $scope.loading = false;
          }
        };
    }]);
