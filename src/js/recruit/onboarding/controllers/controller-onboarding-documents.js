function onboardingDocumentsCtrl($scope, $rootScope, $location, $modal, $window, networks, paths, onboarding, onboardingConstants, $notify) {

    (function init() {

        $scope.onboarding = {};
        $rootScope.progress = { length: '28%' };
        $scope.isLoading = true;

        onboarding.memberAcceptance(false).then(function(data) {
            $scope.isLoading = false;
            $scope.onboarding = data.OnboardingAcceptanceDetail;
            $scope.onboarding.documents = [];
            if ($scope.onboarding.OutboundDocuments) {
                $scope.onboarding.documents = $scope.onboarding.OutboundDocuments.OnboardDocumentItemResults;
            }

            $scope.metadata = onboarding.getMetadata();
            if ($scope.metadata.length === 0) {
                angular.forEach($scope.onboarding.documents, function(document, i) {

                    var fileExtensions = document.OnboardDocumentRecord.FileName.split('.');
                    if (fileExtensions.length) {
                        $scope.metadata.push({ fileExtension: fileExtensions[fileExtensions.length-1] });
                    }

                });
            }

            if ($scope.onboarding.AcceptanceState !== onboardingConstants.ONBOARD_STATE_DOCUMENTATION) {
                $location.path(paths.get(onboarding.getRouteFromAcceptanceStage($scope.onboarding.AcceptanceState)).path);
            }
            else $scope.isLoading = false;
        }).catch(() => $scope.isLoading = false);

        $scope.$watch('metadata', function(newVal, oldVal) {
            if (newVal === oldVal) {
                return;
            }
            var acceptedDoc = newVal.filter(function(d) { return d.isRead && d.isAccepted; });

            $scope.hasAllDocumentsRead = acceptedDoc.length === newVal.length;
        }, true);

    })();


    $scope.acceptDoc = function(documentId, index) {
        $scope.isLoading = true;
        onboarding.onboardDocumentAccept(documentId).success(function(data) {
            $scope.metadata[index].isAccepted = true;
            $scope.metadata[index].isOpen = !$scope.metadata[index].isOpen;
            $scope.isLoading = false;
        });

    };

    $scope.onboarding_openModal = function(document, index) {
        $scope.isLoading = true;
        document.name = document.FileName;
        
        if(document.FileExt === 'doc' || document.FileExt === 'docx') {
            $scope.ActionUrl = onboarding.getUrlViewDocument(document.LibraryDocumentId);
            document.type = 'doc';
            
            view(document);
        }else if(document.FileExt === 'img') {
            onboarding.getArtifactById(document.LibraryDocumentId).then(function(res) {
                document.type = 'img';
                $scope.ActionUrl = res;
                
                view(document);
            })
            .catch(function() {
                $scope.isLoading = false;
                $scope.metadata[index].isRead = !$scope.metadata[index].isRead;
            });
        }else if(document.FileExt === 'pdf') {
            onboarding.getViewUrlForDocument(document.LibraryDocumentId).then(function(res) {
                document.type = 'pdf';
                $scope.ActionUrl = res.data.Url;
                view(document);
            })
            .catch(function() {
                $scope.isLoading = false;
                $scope.metadata[index].isRead = !$scope.metadata[index].isRead;
            });
        }else{
            return $notify.add({
                message: 'This file could not be opened. Please download it',
                type: 'warning',
                visible: true
            });
        }
    
        function view(item) {
            if($scope.ActionUrl === null) {
                $notify.add({
                    message: 'This file may not exist',
                    type: 'warning',
                    visible: true
                });
            }else{
                var modal = $modal.open({
                    templateType: 'drawer',
                    templateUrl: 'modal-open-document.html',
                    size: 'lg',
                    controller: 'openDocumentOnboardingCtrl',
                    resolve: {
                        data: function() {
                            return {
                                ActionUrl: $scope.ActionUrl,
                                FieldType: item.type
                            };
                        }
                    },
                    title: item.name,
                });
                
                modal.result.finally(function(data) {
                    $scope.metadata[index].isOpen = true;
                    onboarding.setMetadata($scope.metadata);
                    $scope.isLoading = false;
                });
            }
        }
    };

    $scope.onboarding_documents = function() {
        $scope.isLoading = true;
        onboarding.processCandidateAcceptance().then(function(data) {
            return onboarding.memberAcceptance().then(function(data) {
                var AcceptanceState = data.OnboardingAcceptanceDetail.AcceptanceState;
                var route = onboarding.getRouteFromAcceptanceStage(AcceptanceState);
                $location.path(paths.get(route).path);
            });
        }).catch(() => $scope.isLoading = false);
    };
    
    $scope.DownloadDocument = function(outboundDocument, index) {
        $scope.isLoading = true;
        return onboarding.getDocumentDownloadUrl(outboundDocument)
            .then(function(url) {
                $window.open(url, '_blank');
            })
            .catch(function() {
                $scope.metadata[index].isRead = !$scope.metadata[index].isRead;
            })
            .finally(function() {
                $scope.isLoading = false;
                $scope.metadata[index].isOpen = true;
                onboarding.setMetadata($scope.metadata);
            });
    };
}

angular.module('ui.recruit.candidateonboard')
    .controller('onboardingDocumentsCtrl', [
    '$scope', '$rootScope', '$location', '$modal', '$window', 'Networks', 'Paths', 'Onboarding', 'OnboardingConstants', '$notify', 
    onboardingDocumentsCtrl]);