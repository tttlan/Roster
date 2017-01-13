angular.module('ui.recruit.candidateonboard')

//onboarding welcome controller
    .controller('onboardingWelcomeCtrl', [
        '$scope', 'Members', '$location', '$q', 'Paths', 'Onboarding', 'OnboardingConstants', 'Networks', function($scope, members, $location, $q, paths, onboarding, onboardingConstants, networks) {
            
            
            (function init() {

                $scope.isOnboarding = true;

                $scope.progress = { length: '0%' };

                // -------------
                // Load in current Member
                $scope.currentUser = {};
                $scope.currentUser.network = { Name: 'Sherpa Systems' };
                $scope.onboarding = {};

                $scope.isLoading = true;
                $q.all([onboarding.memberAcceptance(), networks.getCompanyDescription(), members.me()]).then(function(data) {
                    $scope.isLoading = false;

                    $scope.onboarding = data[0].OnboardingAcceptanceDetail;

                    $scope.onboarding.NetworkName = data[1].NetworkName;
                    $scope.onboarding.companyDescription = data[1].CompanyDescription || data[1].NetworkName;

                    angular.extend($scope.currentUser, data[2].data);
                    $scope.currentUser.fullname = $scope.currentUser.FirstName + ' ' + $scope.currentUser.Surname;

                    if ($scope.onboarding.AcceptanceState !== onboardingConstants.ONBOARD_STATE_MEMBERWELCOME) {
                        $location.path(paths.get(onboarding.getRouteFromAcceptanceStage($scope.onboarding.AcceptanceState)).path);
                    }
                });
            })();

            $scope.onboarding_welcome = function() {
                $scope.isLoading = true;
                onboarding.processCandidateAcceptance().then(function(data) {
                    $scope.isLoading = false;
                    $location.path(paths.get('recruit.onboarding.terms').path);
                });

            };
        }
    ])
    .controller('onboardingTermsCtrl', [
        '$scope', '$location', '$sce', '$q', 'Networks', 'Paths', 'Onboarding', 'OnboardingConstants', function($scope, $location, $sce, $q, networks, paths, onboarding, onboardingConstants) {

            (function init() {
                $scope.terms = {};
                $scope.onboarding = {};
                $scope.isLoading = true;

                var termsPromise = networks.getTermsAndConditions();
                var onboardingPromise = onboarding.memberAcceptance();
                $q.all([termsPromise, onboardingPromise]).then(function(data) {
                    $scope.isLoading = false;
                    
                    $scope.terms.path = $sce.trustAsResourceUrl('http://' + data[0].Data);
                    $scope.terms.isAccepted = false;
                    $scope.progress = { length: '14%' };

                    $scope.onboarding = data[1].OnboardingAcceptanceDetail;
                    if ($scope.onboarding.AcceptanceState !== onboardingConstants.ONBOARD_STATE_MEMBERACCEPTTERMS) {
                        $location.path(paths.get(onboarding.getRouteFromAcceptanceStage($scope.onboarding.AcceptanceState)).path);
                    }
                });

            })();

            $scope.onboarding_terms = function() {

                if ($scope.terms.isAccepted) {
                    $scope.isLoading = true;
                    onboarding.processCandidateAcceptance().then(function(data) {
                        $scope.isLoading = false;
                        $location.path(paths.get('recruit.onboarding.documents').path);
                    });

                }
            };
        }
    ])
    .controller('onboardingDocumentsCtrl', [
        '$scope', '$location', '$modal', '$window', 'Networks', 'Paths', 'Onboarding', 'OnboardingConstants', function($scope, $location, $modal, $window, networks, paths, onboarding, onboardingConstants) {

            (function init() {

                $scope.onboarding = {};
                $scope.progress = { length: '28%' };
                $scope.isLoading = true;

                onboarding.memberAcceptance(false).then(function(data) {
                    $scope.isLoading = false;
                    $scope.onboarding = data.OnboardingAcceptanceDetail;
                    $scope.onboarding.documents = [];
                    if ($scope.onboarding.OutboundDocuments) {
                        $scope.onboarding.documents = $scope.onboarding.OutboundDocuments.OnboardDocumentItemResults.filter(function(d) {
                            return d.OnboardDocumentRecord.OnboardState === 'Documentation' && !d.OnboardDocumentRecord.AcceptedDate;
                        });
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
                });

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
                    $scope.isLoading = false;
                });

            };

            $scope.onboarding_openModal = function(fileName, entityActions, index) {
                $scope.metadata[index].isOpen = true;
                onboarding.setMetadata($scope.metadata);

                var modal = $modal.open({
                    templateType: 'drawer',
                    templateUrl: '/interface/views/recruit/partials/modal-open-document.html',
                    size: 'lg',
                    controller: SHRP.ctrl.ModalOpenDocument,
                    resolve: {
                        data: function() {
                            return {
                                //onboardId: $scope.onboarding.OnboardId,
                                //libraryDocumentId: libraryDocumentId,
                                entityActions: entityActions,
                                metadata: $scope.metadata[index]
                            };
                        }
                    },
                    //classes: 'drawer--shift',
                    title: fileName,
                });

                modal.result.then(function(data) {

                });
            };

            $scope.onboarding_openPdf = function(entityActions, index) {
                $scope.metadata[index].isOpen = true;
                onboarding.setMetadata($scope.metadata);

                var entityAction = entityActions.filter(function(a) {
                    return a.Description.toLowerCase() === 'viewpdfdocument';
                });

                $window.open(entityAction[0].ActionUrl);
            };

            $scope.onboarding_documents = function() {
                $scope.isLoading = true;
                onboarding.processCandidateAcceptance().then(function(data) {
                    $scope.isLoading = false;
                    $location.path(paths.get('recruit.onboarding.inboundDocuments').path);
                });
            };
        }
    ])
    .controller('onboardingDeclarationCtrl', [
        '$scope', '$location', '$q', '$modal', 'Networks', 'Paths', 'Onboarding', 'OnboardingConstants', function($scope, $location, $q, $modal, networks, paths, onboarding, onboardingConstants) {
            (function init() {
                $scope.details = {};
                $scope.lookups = {};
                $scope.progress = { length: '56%' };
                $scope.isLoading = true;

                var countryPromise = networks.getCountriesPromise();
                //var statePromise = networks.getStatesPromise();
                //var employmentTypesPromise = networks.getEmploymentTypes();
                var onboardingPromise = onboarding.memberAcceptance();

                $q.all([countryPromise, onboardingPromise]).then(function(data) {
                    $scope.isLoading = false;
                    $scope.lookups.countries = data[0];
                    //$scope.lookups.states = data[1];
                    //$scope.lookups.employmentTypes = data[2].map(function(e) {
                    //    return e.EmploymentClassificationSummaryDto;
                    //});
                    var memberTfn = data[1].OnboardingAcceptanceDetail.MemberTFN;
                    if (memberTfn) {
                        $scope.details = onboarding.setupMemberTfnFromModel(memberTfn);
                    }

                    if (data[1].OnboardingAcceptanceDetail.AcceptanceState !== onboardingConstants.ONBOARD_STATE_MEMBERTFNDECLARATION) {
                        $location.path(paths.get(onboarding.getRouteFromAcceptanceStage(data[1].OnboardingAcceptanceDetail.AcceptanceState)).path);
                    }
                });


            })();

            $scope.openTfnDeclarationHelp = function(fileName) {
                var modal = $modal.open({
                    templateType: 'drawer',
                    templateUrl: '/interface/views/recruit/partials/modal-open-help.html',
                    size: 'lg',
                    controller: SHRP.ctrl.ModalOpenHelp,
                    resolve: {
                        data: function() {
                            return {
                                fileName: '/interface/views/recruit/partials/' + fileName
                            };
                        }
                    },
                    title: 'Tax File Declaration Form',
                });

                modal.result.then(function(data) {

                });
            };

            $scope.showTfnNumberError = function() {
                return $scope.tfnForm.$dirty && !$scope.details.isTfnSeparate && !$scope.details.isTfnYouth && !$scope.details.isTfnPensioner &&
                    ($scope.tfnForm.txtTfnNumber1.$error.pattern || $scope.tfnForm.txtTfnNumber2.$error.pattern ||
                    $scope.tfnForm.txtTfnNumber3.$error.pattern || $scope.tfnForm.txtTfnNumber4.$error.pattern ||
                    $scope.tfnForm.txtTfnNumber5.$error.pattern || $scope.tfnForm.txtTfnNumber6.$error.pattern ||
                    $scope.tfnForm.txtTfnNumber7.$error.pattern || $scope.tfnForm.txtTfnNumber8.$error.pattern ||
                    $scope.tfnForm.txtTfnNumber9.$error.pattern);
            };

            $scope.onboarding_tfnDeclaration = function() {
                if ($scope.tfnForm.$invalid) {
                    $scope.tfnForm.$setDirty();
                    angular.forEach($scope.tfnForm.$error.required, function(field) {
                        field.$setDirty();
                    });
                    angular.forEach($scope.tfnForm.$error.pattern, function(field) {
                        field.$setDirty();
                    });
                    $scope.showTfnNumberError();
                    return;
                }
                $scope.isLoading = true;
                var memberTfnEntry = onboarding.setupMemberTfnFromView($scope.details);
                onboarding.updateTfnDeclaration(memberTfnEntry).then(function(data) {
                    $scope.isLoading =false;
                    $location.path(paths.get('recruit.onboarding.signature').path);
                });

            };
        }
    ])
    .controller('onboardingSignatureCtrl', [
        '$rootScope', '$scope', '$route', '$location', '$q', '$window', 'Networks', 'Paths', 'Onboarding', 'OnboardingConstants', 'FileStorage', 'UploadConstants', 'API_BASE_URL', function($rootScope, $scope, $route, $location, $q, $window, networks, paths, onboarding, onboardingConstants, fileStorage, uploadConstants, API_BASE_URL) {

            (function init() {
                $scope.details = {};
                $scope.progress = { length: '84%' };
                $scope.details.signedDate = moment().format('YYYY-MM-DD');

                $scope.isLoading = true;
                var salutationPromise = networks.getSalutations();
                var statePromise = networks.getStates();
                var countryPromise = networks.getCountries();
                var memberAcceptancePromise = onboarding.memberAcceptance();

                $q.all([salutationPromise, statePromise, countryPromise, memberAcceptancePromise]).then(function(data) {
                    $scope.isLoading = false;
                    var salutations = data[0];
                    var states = data[1].data;
                    var countries = data[2].data;

                    var onboardingAcceptanceDetail = data[3].OnboardingAcceptanceDetail;
                    var memberTfn = onboardingAcceptanceDetail.MemberTFN || { TaxFileNumber: '801682682', SalutationId: 1, Surname: 'Smith', FirstGivenName: 'john', DateOfBirth: '2015-08-26', Address: '34 Queens road', Suburb: 'Kew', AddressUsageCode: 'VIC', Postcode: 3126, CountryId: 13, BasisOfPaymentCode: 'F', ResidencyStatus: true, TaxFreeThresholdClaimed: true, SeniorAustraliansTaxOffsetClaimed: false, ZoneRebateClaimed: false, HelpIndicator: false, TradeSupportLoanIndicator: false };

                    memberTfn.Salutation = salutations.filter(function(s) { return s.Id === memberTfn.SalutationId; }).map(function(s) { return s.Name; })[0];
                    memberTfn.BasisOfPayment = onboarding.getBasisOfPaymentFromCode(memberTfn.BasisOfPaymentCode);
                    memberTfn.Country = countries.filter(function(s) { return s.Value === memberTfn.CountryId; }).map(function(s) { return s.Label; })[0];

                    if (memberTfn) {
                        $scope.details = onboarding.setupMemberTfnFromModel(memberTfn);
                    }

                    $scope.details.SignatureType = 'Check box';
                    $scope.typeSignatureChanged($scope.details.SignatureType);

                    if (onboardingAcceptanceDetail.AcceptanceState !== onboardingConstants.ONBOARD_STATE_MEMBERTFNSIGNATURE) {
                        $location.path(paths.get(onboarding.getRouteFromAcceptanceStage(onboardingAcceptanceDetail.AcceptanceState)).path);
                    }
                });


            })();

            $scope.isSigned = function() {
                return $scope.details.signature || $scope.details.signatureChecked || $scope.details.FileStoreId;
            };

            $rootScope.$on('routeChangeStart', function(event, next, current) {
                // Prevent the browser default action (Going back):
                event.preventDefault();
            });

            $scope.typeSignatureChanged=function(selected) {
                switch(selected) {
                    case 'Check box':
                        $scope.details.IsCheckboxSignature = true;
                        $scope.details.IsUploadSignature = false;
                        $scope.details.IsDirectSignature = false;
                        $scope.details.FileStoreId = null;
                        $scope.details.signature = null;
                        $scope.details.signatureChecked = false;
                        break;
                    case 'Upload':
                        $scope.details.IsCheckboxSignature = false;
                        $scope.details.IsUploadSignature = true;
                        $scope.details.IsDirectSignature = false;
                        $scope.details.signatureChecked = false;
                        $scope.details.signature = null;
                        $scope.details.containerId = uploadConstants.containerIds.onboarding;
                        break;
                    case 'Direct':
                        $scope.details.IsCheckboxSignature = false;
                        $scope.details.IsUploadSignature = false;
                        $scope.details.IsDirectSignature = true;
                        $scope.details.signatureChecked = false;
                        $scope.details.FileStoreId = null;
                        break;
                }

            };

            $scope.scrollToBottom= function() {
                $window.scrollTo(0, document.body.scrollHeight);
            };

            $scope.printDiv = function(divName) {

                var printContents = document.getElementById(divName).innerHTML;
                $window.print(printContents);

                return true;
            };

            $scope.downloadDivPdf = function(divName) {
                var printContents = document.getElementById(divName).innerHTML;
                $scope.isLoading = true;
                var fileName = ['declaration-form-', $scope.details.signedDate, '.pdf'].join('');
                onboarding.downloadTaxFormAsPdf(fileName).then(function(data) {

                    var url = data.data.Data.Url.replace('/api/', '');
                    $window.open(API_BASE_URL + url);
                    
                }).finally(hideLoadingIndicator);
            };

            var hideLoadingIndicator=function() {
                $scope.isLoading = false;
            };

            $scope.onboarding_tfnSignature = function() {
                if (!$scope.isSigned()) {
                    return;
                }

                $scope.details.tfnNumber = [$scope.details.tfnNumber1, $scope.details.tfnNumber2, $scope.details.tfnNumber3, $scope.details.tfnNumber4, $scope.details.tfnNumber5, $scope.details.tfnNumber6, $scope.details.tfnNumber7, $scope.details.tfnNumber8, $scope.details.tfnNumber9].join('');

                var memberTfnSignature = onboarding.setupMemberTfnSignatureFromView($scope.details);
                $scope.isLoading = true;

                onboarding.updateTfnSignature(memberTfnSignature).then(function(data) {
                    $scope.isLoading = false;
                    $location.path(paths.get('recruit.onboarding.profile').path);
                });

                /**setup network information**/
                //var tfnPayerNetworkInformationEntry = {
                //    'TFNPayerNetworkOrganisationDetail': {
                //        'Code': 'MN',
                //        'Text': 'sample string 2'
                //    },
                //    'TFNPayerNetworkAddressDetail': {
                //        'AddressOverseasAddressIndicator': true,
                //        'AddressUsageCode': 'VIC',
                //        'AddressDetailsAttentionTo': 'sample string 3',
                //        'AddressLine1': 'sample string 4',
                //        'AddressLine2': 'sample string 5',
                //        'AddressLine3': 'sample string 6',
                //        'AddressLine4': 'sample string 7',
                //        'SuburbOrTownOrCity': 'sample string 8',
                //        'Postcode': 3000,
                //        'StateOrTerritory': 'ACT',
                //        'Country': 'Australia',
                //        'AddressCountryCode': 13
                //    },
                //    'TFNPayerNetworkPersonUnstructuredName': {
                //        'Code': 'Contact',
                //        'Name': 'sample string 2'
                //    },
                //    'TFNPayerNetworkElectronicContactTelephone': {
                //        'NumberUsageCode': 3,
                //        'NumberServiceLineCode': 1,
                //        'AreaCode': 'sample string 3',
                //        'Number': '98123456'
                //    },
                //    'TFNPayerNetworkElectronicContactFacsmile': {
                //        'UsageCode': 3,
                //        'AreaCode': 'sample string 2',
                //        'Number': '98123456'
                //    },
                //    'TFNPayerNetworkElectronicContactElectronicMail': {
                //        'AddressUsageCode': 'sample string 1',
                //        'Address': 'asx@hotmail.com'
                //    },
                //    'Declaration': {
                //        'StatementTypeCode': 'sample string 1',
                //        'StatementAcceptedIndicator': true,
                //        'SignatureDate': '2015-12-31T17:27:25.4898611+07:00',
                //        'SignatoryIdentifierText': 'sample string 2'
                //    }
                //};
                //onboarding.tfnNetworkInformation(tfnPayerNetworkInformationEntry).then(function (data) {
                //    $scope.isLoading = false;
                //});
            };
        }
    ])
    .controller('onboardingProfileCtrl', [
        '$scope', '$location', '$q', 'Networks', 'Paths', 'Onboarding', 'OnboardingConstants', 'memberAcceptanceProfile', function($scope, $location, $q, networks, paths, onboarding, onboardingConstants, memberAcceptanceProfile) {

            (function init() {
                $scope.details = {};
                $scope.lookups = {};
                $scope.progress = { length: '70%' };
                $scope.isLoading = true;
                $scope.isCollapsedBanking = false;
                $scope.isCollapsedPersonalInfo= false;
                $scope.isCollapsedEmergency = false;

                $scope.toggleBankingCollapsed = function() {
                    $scope.isCollapsedBanking = !$scope.isCollapsedBanking;
                };
                
                $scope.togglePersonalCollapsed = function() {
                    $scope.isCollapsedPersonalInfo = !$scope.isCollapsedPersonalInfo;
                };

                $scope.toggleEmergencyCollapsed = function() {
                    $scope.isCollapsedEmergency = !$scope.isCollapsedEmergency;
                };



                var onboardingPromise = onboarding.memberAcceptance();
                var countryPromise = networks.getCountriesPromise();

                $q.all([onboardingPromise, countryPromise]).then(function(data) {
                    $scope.isLoading = false;
                    var onboardingDetails = data[0].OnboardingAcceptanceDetail;

                    $scope.details.CandidatePersonalInfo = onboardingDetails.CandidatePersonalInfo || {};

                    $scope.details.CandidateContact = {};
                    if (onboardingDetails.CandidateContacts) {
                        onboardingDetails.CandidateContacts.forEach(function(contact, index) {
                            angular.extend($scope.details.CandidateContact, contact);
                        });
                    }

                    $scope.details.CandidateEmergencyInfo = onboardingDetails.EmergencyContact || {};

                    $scope.details.CandidateBankInfo = onboardingDetails.MemberBankingDetail || {};

                    $scope.details.IsPIConfirmed = false;
                    $scope.details.IsEmergencyConfirmed = false;
                    $scope.details.IsBankConfirmed = false;
                    $scope.details.IsOnboardActivated = onboardingDetails.IsOnboardActivated;
                    $scope.lookups.countries = data[1];

                    if (onboardingDetails.AcceptanceState !== onboardingConstants.ONBOARD_STATE_MEMBERACCEPTPROF) {
                        $location.path(paths.get(onboarding.getRouteFromAcceptanceStage(onboardingDetails.AcceptanceState)).path);
                    }
                });
            })();

            $scope.onboarding_profile = function() {

                if ($scope.profileForm.$invalid) {
                    $scope.profileForm.$setDirty();
                    angular.forEach($scope.profileForm.$error.required, function(field) {
                        field.$setDirty();
                    });
                    return;
                }

                $scope.isLoading = true;

                $q.all([
                    memberAcceptanceProfile.updateEmergencyContact($scope.details.CandidateEmergencyInfo),
                    onboarding.memberPersonalInfo($scope.details.CandidatePersonalInfo),
                    onboarding.memberContacts($scope.details.CandidateContact),
                    onboarding.memberBankInfo($scope.details.CandidateBankInfo)
                ]).then(function(res) {
                    $scope.isLoading = true;
                    onboarding.processCandidateAcceptance().then(function(data) {                        
                        $scope.isLoading = false;
                        $location.path(paths.get('recruit.onboarding.completion').path);
                    });
                }).catch(function(res) {
                    $scope.isLoading = false;
                    return $q.reject(res);
                });

            };

            $scope.onboarding_profile_saveOnly = function() {
                if ($scope.profileForm.$invalid) {
                    $scope.profileForm.$setDirty();
                    angular.forEach($scope.profileForm.$error.required, function(field) {
                        field.$setDirty();
                    });
                    return;
                }

                $scope.isLoading = true;

                $q.all([
                    memberAcceptanceProfile.updateEmergencyContact($scope.details.CandidateEmergencyInfo),
                    onboarding.memberPersonalInfo($scope.details.CandidatePersonalInfo),
                    onboarding.memberContacts($scope.details.CandidateContact),
                    onboarding.memberBankInfo($scope.details.CandidateBankInfo),
                ]).then(function(res) {
                    $scope.isLoading = false;
                }).catch(function(res) {
                    $scope.isLoading = false;
                    return $q.reject(res);
                });
            };
        }
    ])
    .controller('onboardingCompletionCtrl', [
        '$scope', '$location', '$modal', '$q', 'Paths', 'Members', 'Onboarding', 'OnboardingConstants', function($scope, $location, $modal, $q, paths, members, onboarding, onboardingConstants) {
        (function init() {
            $scope.details = {};
            $scope.progress = { length: '96%' };

            $scope.isLoading = true;
            var memberAcceptancePromise = onboarding.memberAcceptance();
            var memberPromise = members.me();

            $q.all([memberAcceptancePromise, memberPromise]).then(function(data) {
                $scope.isLoading = false;
                $scope.details = data[0].OnboardingAcceptanceDetail;
                var member = data[1].data;
                $scope.details.isSsoNewMember = !member.Active && member.HasFedSite && member.UseFedLogin;
                $scope.member = member;
                if ($scope.details.AcceptanceState !== onboardingConstants.ONBOARD_STATE_COMPLETE) {
                    $location.path(paths.get(onboarding.getRouteFromAcceptanceStage($scope.details.AcceptanceState)).path);
                }
            });

            $scope.onboarding_completion = function() {
                $scope.isLoading = true;
                onboarding.processCandidateAcceptance().then(function(data) {
                    $scope.isLoading = false;
                    $location.path(paths.get('recruit.onboards.index').path);
                });//if requirements met, member will be activeted
            };

        })();
    }]);
    var SHRP = SHRP || {};
    SHRP.ctrl = SHRP.ctrl || {};

SHRP.ctrl.ModalOpenDocument = [
    '$scope', '$sce', '$modalInstance', '$location', 'Onboarding', 'data',
    function($scope, $sce, $modalInstance, $location, onboarding, data) {
        $scope.isLoading = true;
        $scope.data = data || {};
        
        $scope.cancel = function() {
            $modalInstance.dismiss('');
        };

        $scope.close = function() {
            $modalInstance.close();
        };

        var entityAction = $scope.data.entityActions.filter(function(a) {
            return a.Description.toLowerCase() === 'viewhtmldocument';
        });

        onboarding.DownloadAcceptanceDocumentAsHtml(entityAction[0].ActionUrl).then(function(html) {
            $scope.trustedHtml = $sce.trustAsHtml(html.data);
            $scope.isLoading = false;
        });
    }
];

SHRP.ctrl.ModalOpenHelp = [
    '$scope', '$modalInstance', 'data',
    function($scope, $modalInstance, data) {
        $scope.partialView = data.fileName;

        $scope.cancel = function() {
            $modalInstance.dismiss('');
        };

        $scope.close = function() {
            $modalInstance.close();
        };
    }
];

SHRP.ctrl.ModalLaunchEmployees = [
    '$scope', '$sce', '$modalInstance', 'data', 'Onboarding', '$timeout', 'onResize',
    function($scope, $sce, $modalInstance, data, Onboarding, $timeout, onResize) {

        $scope.isLoading = false;
        $scope.isCompleted = false;
        $scope.showTagsList = true;
        $scope.selectedType = 2; // default by group and member
        $scope.selectedOption = 2;// default to by new onboarding
        $scope.listType = [
            {
                value: 1,
                name: 'Inactive User'
            },
            {
                value: 2,
                name: 'Group and member'
            }
        ];
        $scope.listOption = [
            {
                value: 1,
                name: 'Email',
                alias: 'e'
            },
            {
                value: 2,
                name: 'New Onboard',
                alias: 'o'
            },
            {
                value: 3,
                name: 'Onboard bypassing approval',
                alias: 'p'
            }
        ];
        $scope.listFileName = [];
        $scope.listIds= [];
        $scope.changeSelectType = function(option) {
            $scope.selectedType = option;
            if ($scope.selectedType === 2) {
                $scope.showTagsList = true;
            } else {
                $scope.showTagsList = false;
            }
            onResize.triggerResize();
        };
        $scope.changeSelectOption = function(option) {
              $scope.selectedOption = option;
            onResize.triggerResize();
        };
        $scope.showOption = function(option) {
            if ($scope.selectedOption === option) {
                return true;
            } else {
                return false;
            }
            onResize.triggerResize();
        };

        // Search Group and member
        $scope.groupAndMember = {
            currentGroupAndMember: [],
            listGroupAndMember: []
        };
        Onboarding.getGroupAndMember().then(function(res) {
            if( res.status === 200 || res.status === 204) {
                if(res.data.LaunchPlatformSummaryItems.length>0) {
                    $scope.groupAndMember.listGroupAndMember = res.data.LaunchPlatformSummaryItems.map(function(item) {
                        return {
                            label: item.LaunchPlatformSummary.Name,
                            value: item.LaunchPlatformSummary.Id,
                            type: item.LaunchPlatformSummary.Type
                        };
                    });
                }
            }
        });
        $scope.checkShowComplete = function() {
            if($scope.selectedType === 2) {
                if($scope.selectedOption >0 &&  $scope.groupAndMember.currentGroupAndMember.length >0) {
                    return true;
                }else{
                    return false;
                }
            }else{
                if($scope.selectedType === 1 && $scope.selectedOption >0) {
                    return true;
                }else{
                    return false;
                }
            }
        };

        $scope.launchEmployeesSubmit = function() {
            if ($scope.checkShowComplete() === true) {// Complete launch employees
                $scope.isLoading = true;
                var result;
                var documentList = [];
                var documentObj ={
                    FileName:null ,
                    LibraryDocumentId: null,
                };
                // create document list
                if($scope.listIds.length>0 && $scope.listFileName.length>0 &&  $scope.listFileName.length === $scope.listIds.length) {
                    for(var j = 0; j< $scope.listIds.length;j++) {
                        documentObj.LibraryDocumentId =  $scope.listIds[j];
                        documentObj.FileName = $scope.listFileName[j];
                        documentList.push(angular.copy(documentObj));
                    }
                }
                //Launch by inactive member
                if ($scope.selectedType === 1) {
                    var dataForInactiveUser = {
                        OnboardDocuments: documentList
                    };
                    if($scope.selectedOption === 1) {
                        dataForInactiveUser = null;
                    }
                    Onboarding.setlaunchForInactiveMember($scope.listOption[$scope.selectedOption - 1].alias,dataForInactiveUser).then(function(res) {
                        if (res.status === 200 || res.status === 204) {
                            $scope.isCompleted = true;
                        } else {
                            $scope.isCompleted = false;
                        }
                        $scope.isLoading = false;
                        onResize.triggerResize();
                    });
                } else {
                    // Launch by group and member
                    if ($scope.selectedType === 2) {
                        var dataForGroupAndMember = {
                            MemberIds: [],
                            GroupIds: [],
                            OnboardDocuments: documentList
                        };
                        if($scope.selectedOption === 1) {
                            dataForGroupAndMember.OnboardDocuments = null;
                        }
                        // Create list group and member from selected list
                        for (var i = 0; i < $scope.groupAndMember.currentGroupAndMember.length; i++) {
                            var type = getTypeByIdAndName($scope.groupAndMember.currentGroupAndMember[i].label, $scope.groupAndMember.currentGroupAndMember[i].value);
                            if (type === 'Member') {
                                dataForGroupAndMember.MemberIds.push($scope.groupAndMember.currentGroupAndMember[i].value);
                            } else {
                                if (type === 'NetworkGroup') {
                                    dataForGroupAndMember.GroupIds.push($scope.groupAndMember.currentGroupAndMember[i].value);
                                }
                            }
                        }
                        Onboarding.setlaunchForGroupAndMember($scope.listOption[$scope.selectedOption - 1].alias, dataForGroupAndMember).then(function(res) {
                            if (res.status === 200 || res.status === 204) {
                                $scope.isCompleted = true;
                            } else {
                                $scope.isCompleted = false;
                            }
                            $scope.isLoading = false;
                            onResize.triggerResize();
                        });
                    }
                }
                onResize.triggerResize();
            }
        };

        function getTypeByIdAndName(label,id) {
            var type ='';
            for(var i= 0;i<$scope.groupAndMember.listGroupAndMember.length; i++ ) {
                if($scope.groupAndMember.listGroupAndMember[i].label === label && $scope.groupAndMember.listGroupAndMember[i].value === id) {
                    type = $scope.groupAndMember.listGroupAndMember[i].type;
                }
            }
            return type;
        }
        // Fix issue when data finish load
        $modalInstance.dataDone(function() {
            $timeout(function() {
                $scope.wait = true;
                $scope.$digest();
            }, 100);
            return $scope.wait;
        });
        $scope.cancel = function() {
            $modalInstance.close();
        };
}];
SHRP.ctrl.ModalUploadEmployees = [
    '$scope', '$sce', '$modalInstance',
    function($scope, $sce, $modalInstance) {
        // Fix issue when data finish load
        $scope.cancel = function() {
            $modalInstance.close();
        };
    }];