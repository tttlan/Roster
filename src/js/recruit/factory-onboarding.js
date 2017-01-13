angular.module('ui.services')

    .factory('Onboarding', function($q, $server, $modal, API_BASE_URL, OnboardingConstants, $HTTPCache, Permissions) {
        // var NETWORK_NAMESPACE = API_BASE_URL;
        // var PROFILES_NAMESPACE = API_BASE_URL + 'profiles/';
        var ARTIFACTS_NAMESPACE = API_BASE_URL + 'artifacts/';
        var ONBOARDING_NAMESPACE = API_BASE_URL + 'onboarding/';
        var document_metadata = [];

        function getOnboards(isBulk, searchQuery, page, pageSize, orderByField, isOrderByAscending) {
            var orderBy = '';

            if (!orderByField) {
                orderBy = 'CreatedDate DESC';
            } else {
                orderBy += orderByField;
                orderBy += isOrderByAscending ? ' ASC' : ' DESC';
            }

            var querySingle = {
                'n': searchQuery ? searchQuery : '',
                'p': page ? page : 1,
                'ps': pageSize ? pageSize : 15,
                'o': orderBy
            };
            var queryBulk= {
                'q': searchQuery ? searchQuery : '',
                'p': page ? page : 1,
                'ps': pageSize ? pageSize : 15,
                'o': orderBy
            };

            var url;

            if (isBulk) {
                url = ONBOARDING_NAMESPACE + 'bulks';
            } else {
                url = ONBOARDING_NAMESPACE;
            }

            var query = isBulk ? queryBulk : querySingle;

            return $server.get({
                url: url,
                query: query
            }, true).then(function(response) {
                return formatResponsePayload(response);
            });
        }

        /**
         * FormatResponsePayload
         * Format the payload for both 'Single' and 'Bulk' by applying the same format
         * @param response
         * @returns {*}
         */
        function formatResponsePayload(response) {
            var countOnboardingsWithNoDeletePermission = 0,
                results = response.data.OnboardingSummaryItemResults || response.data.BulkOnboardingSummaryItemResult;

            _.map(results, function(result) {
                var permissions = Permissions.formatPermissions(result.EntityActions);
                if((!permissions.deleteonboard) && (!permissions.candeletebulkonboard)) {
                    countOnboardingsWithNoDeletePermission += 1;
                }
                _.extend(result, {
                    permissions : permissions,
                });
            });

            _.extend(results, {
                countOnboardingsWithNoDeletePermission: countOnboardingsWithNoDeletePermission, //This is fix for the 'SelectAll' checkbox behaviour in the landing page
            });

            return response;
        }

        function formatBulkOnboardById(res) {
            res = res.data || res.data.Data;

            var BulkOnboardingDetail = res.BulkOnboardingDetail;
            var Onboardings = BulkOnboardingDetail.Onboardings;
            var ProposedRole = BulkOnboardingDetail.ProposedRole;

            // Format data for commonOnboard
            BulkOnboardingDetail.EffectiveDate = BulkOnboardingDetail.CommencementDate;
            BulkOnboardingDetail.OnboardRole = ProposedRole.OnboardRole;
            BulkOnboardingDetail.OnboardStore = ProposedRole.OnboardStore;
            BulkOnboardingDetail.SalaryType = ProposedRole.SalaryType;
            BulkOnboardingDetail.EmploymentType = ProposedRole.EmploymentType;
            BulkOnboardingDetail.EmploymentClassification = ProposedRole.EmploymentClassification;
            BulkOnboardingDetail.Payroll = ProposedRole.Payroll;
            BulkOnboardingDetail.SalaryPayRate = ProposedRole.SalaryPayRate;
            BulkOnboardingDetail.CandidatePersonalInfo = {};
            BulkOnboardingDetail.CandidatePersonalInfo.MemberId = 0;

            res.Onboardings = Onboardings;

            angular.forEach(res.Onboardings, function(onboarding, index) {
                onboarding.Status = angular.copy(BulkOnboardingDetail.Status);
                onboarding.OnboardRole = angular.copy(ProposedRole.OnboardRole);
                onboarding.OnboardStore = angular.copy(ProposedRole.OnboardStore);
                onboarding.SalaryType = angular.copy(ProposedRole.SalaryType);
                onboarding.EmploymentType = angular.copy(ProposedRole.EmploymentType);
                onboarding.PayRate = angular.copy(ProposedRole.SalaryType);
                onboarding.PayRate.SalaryPayRateId = angular.copy(onboarding.CandidatePersonalInfo.MemberId);
                onboarding.EffectiveDate = angular.copy(onboarding.CommencementDate);
                onboarding.Payroll = angular.copy(ProposedRole.Payroll);
                onboarding.HoursPerWeek = angular.copy(ProposedRole.HoursPerWeek);
                onboarding.DesiredSalary = angular.copy(ProposedRole.DesiredSalary);
                onboarding.EmploymentClassification = angular.copy(ProposedRole.EmploymentClassification);

                if (index === 0) {
                    onboarding.OutboundDocuments = BulkOnboardingDetail.OutboundDocuments;
                    onboarding.InboundRequirementListResult = BulkOnboardingDetail.InboundRequirements;
                    onboarding.Option = BulkOnboardingDetail.Option;
                }
            });

            return res;
        }
        
        function getThumnail(res) {
            var results = res.data.Artifact || res.data;
            var data = {};
            
            var Thumbnail = results.ArtifactDetail.Thumbnail ? results.ArtifactDetail.Thumbnail : '';
            data.Url = Thumbnail;
            
            return data;
        }
    
        var factory = {
        getOnboards: function(searchQuery, page, pageSize, orderByField, isOrderByAscending) {
                return getOnboards(false, searchQuery, page, pageSize, orderByField, isOrderByAscending);
            },
        getBulkOnboards: function(searchQuery, page, pageSize, orderByField, isOrderByAscending) {
                return getOnboards(true, searchQuery, page, pageSize, orderByField, isOrderByAscending);
            },
        getOnboard: function(id) {
                var url = ONBOARDING_NAMESPACE + id;

                return $server.get({
                    url: url
                }, true);
            },
            getOnboardsInBulkOnboard: function(id, page, pageSize, orderByField, isOrderByAscending) {
                var orderBy = '';

                if (!orderByField) {
                    orderBy = 'CreatedDate DESC';
                } else {
                    orderBy += orderByField;
                    orderBy += isOrderByAscending ? ' ASC' : ' DESC';
                }

                var query = {
                    'p': page ? page : 1,
                    'ps': pageSize ? pageSize : 15,
                    'o': orderBy
                };

                var url = ONBOARDING_NAMESPACE + 'bulk/' + id + '/onboardings';

                return $server.get({
                    url: url,
                    query: query
                }, true);
            },
            //#region GET api/onboarding/bulk/{bulkOnboardingId}
        getBulkOnboardById: function(bulkOnboardId) {
                return $server.get({
                    url: ONBOARDING_NAMESPACE + 'bulk/' + bulkOnboardId
            }, true).then(function(res) {
                    return formatBulkOnboardById(res);
                });
            },

            //#endregion
        createOnboardForExistingPerson: function() {
                // var url = ONBOARDING_NAMESPACE + 'candidateonboard';
            },
        createOnboardForNewMember: function(onboard) {
                var url = ONBOARDING_NAMESPACE + 'memberonboard';

                return $server.create({
                    url: url,
                    data: onboard
                });
            },
            createBulkOnboard: function(onboards, artifactId) {
                if (artifactId) {
                    return factory.createBulkOnboardFromCsv(onboards, artifactId)
                    .then(function(response) {
                            return response;
                        });
                } else {
                    return factory.createBulkOnboardNotUploadCsv(onboards)
                    .then(function(response) {
                            return response;
                        });
                }
            },

            //#region POST api/onboarding/bulk/filebulk/{artifactId}
            createBulkOnboardFromCsv: function(onboards, artifactId) {
                var url = ONBOARDING_NAMESPACE + 'bulk/filebulk/' + artifactId;

                return $server.create({
                    url: url,
                    data: onboards
                });
            },
            //#endregion

            //#region POST api/onboarding/bulk/candidates

            createBulkOnboardNotUploadCsv: function(onboards) {
                var url = ONBOARDING_NAMESPACE + 'bulk/candidates';

                return $server.create({
                    url: url,
                    data: onboards
                });
            },
            //#endregion

            //#region update bulk onboard after create bulk onboard from csv file
            updateBulkOnboardAfterUploadCsv: function(candidates, bulkOnboardId) {
                var url = ONBOARDING_NAMESPACE + 'bulk/' + bulkOnboardId + '/candidates';

                return $server.update({
                    url: url,
                    data: candidates
                });
            },
            //#endregion

            createOnboardForNewMemberAndSendToApproval: function(onboard, hasUpdate) {
                var result = {
                    onboardId: null,
                    isOnboardCreated: false,
                    isOnboardSentToApproval: false,
                    isOnboardSentToDocumention: false
                };
                
                var createdOnboardId;
                
                // create onboard and go to approve step
                if (factory.isOnboardPhaseUndefined(onboard)) {
                    return factory.createOnboardForNewMember(onboard)
                    .then(function(response) {
                            createdOnboardId = response.data.Data || response.Data;
                            result.isOnboardCreated = true;
                            result.onboardId = createdOnboardId;

                            return factory.progressOnboard(createdOnboardId);
                        })
                    .then(function() {
                            result.isOnboardSentToApproval = true;

                            return result;
                        })
                    .catch(function() {
                            return $q.reject(result);
                        });
                } else {
                    // onboard existed
                    result.isOnboardCreated = true;
                    result.onboardId = onboard.OnboardId;

                    // update and go to approve step
                if(hasUpdate) {
                        return factory.updateOnboard(onboard)
                        .then(function(response) {
                                return factory.progressOnboard(onboard.OnboardId)
                                .then(function() {
                                        result.isOnboardSentToApproval = true;

                                        return result;
                                    })
                                    .catch(function() {
                                        return $q.reject(result);
                                    });
                            })
                            .catch(function() {
                                return $q.reject(result);
                            });
                    } else {
                        // not update and go to approve step
                        return factory.progressOnboard(onboard.OnboardId)
                            .then(function() {
                                result.isOnboardSentToApproval = true;

                                return result;
                            })
                            .catch(function() {
                                return $q.reject(result);
                            });
                    }
                }
            },

        progressOnboard: function(id, onboardOption) {
            var url = ONBOARDING_NAMESPACE + id + '/Process';

            if (onboardOption) {
                return $server.update({
                    url: url,
                    data: onboardOption
                });
            } else {
                return $server.update({
                    url: url
                });
            }
        },
        progressBulkOnboard: function(bulkOnboardId, onboardOption) {
            var url = ONBOARDING_NAMESPACE + 'bulk/' + bulkOnboardId + '/Process';

            if (onboardOption) {
                return $server.update({
                    url: url,
                    data: onboardOption
                });
            } else {
                return $server.update({
                    url: url
                });
            }
        },
        rollbackOnboard: function(id, isBulk) {

            var bulkPartUrl = isBulk ? 'bulk/' : '';

            var url = ONBOARDING_NAMESPACE + bulkPartUrl + id + '/Process?action=' +
                OnboardingConstants.ONBOARD_PROCESS_ROLLBACK;

            return $server.update({
                url: url
            });
        },
        rejectOnboard: function(id, isBulk) {
                // wrapping this in a promise because we aren't interested in the promise from
                // dismissing (cancelling) the modal since there is nothing to do after
                // dismissing the modal.
                // we are, however, interested in the response from the server.
            return $q(function(resolve, reject) {
                    $modal.open({
                            templateUrl: '/interface/views/recruit/partials/modal-reject-reason.html',
                    controller: function($scope) {
                                $scope.data = {
                                    type: null,
                                    comments: null
                                };
                            }
                        })
                        .result
                        .then(function(rejectionData) {
                            var bulkPartUrl = isBulk ? 'bulk/' : '';
                            var url = ONBOARDING_NAMESPACE + bulkPartUrl + id + '/Process';

                            switch (rejectionData.type) {
                                case 'changesrequired':
                                    url += '?action=' + OnboardingConstants.ONBOARD_PROCESS_REJECT_CHANGES;
                                    break;
                                case 'notneeded':
                                    url += '?action=' + OnboardingConstants.ONBOARD_PROCESS_REJECT_NOTNEEDED;
                                    break;
                                case 'permanentlyreject':
                                    url += '?action=' + OnboardingConstants.ONBOARD_PROCESS_REJECT_PERMANENT;
                                    break;
                            }

                            $server.update({
                                url: url,
                                data: {
                                    Comments: rejectionData.comments
                                }
                        }).then(function(response) {
                                resolve(response);
                        }).catch(function(response) {
                                reject(response);
                            });
                        });
                });
        },
        resendOnboard: function(onboardId, rejectEntry) {
            var url = ONBOARDING_NAMESPACE + onboardId + '/Process' + '?action=r';
            return $server.update({
                url: url,
                data: rejectEntry
            });
        },
        deleteOnboard: function(id, isBulk) {
                var bulkPartUrl = isBulk ? 'bulk/' : '';

                var url = ONBOARDING_NAMESPACE + bulkPartUrl + id;

                return $server.remove({
                    url: url
                });
            },
        confirmAndActivateOnboard: function(id) {
            var url = ONBOARDING_NAMESPACE + id + '/Confirm';

            return $server.update({
                url: url
            });
        },
        activateOnboard: function(id) {
            var url = ONBOARDING_NAMESPACE + id + '/ConfirmAndActive';

            return $server.update({
                url: url
            });
        },
        updateOnboard: function(onboard) {
            var url = ONBOARDING_NAMESPACE + onboard.OnboardId + '/details';
            var editEntry = {
                PersonalDetails: onboard.CandidatePersonalInfo,
                Contacts: onboard.CandidateContacts,
                ProposedRole: onboard
            };

            return $server.update({
                url: url,
                data: editEntry
            });
        },
        updateBulkOnboard: function(onboard) {
            //var promises = [];
            //angular.forEach(onboards, function (onboard, index) {
            //    promises.push(factory.updateOnboard(onboard));
            //});
            //return factory.runPromises(promises);


        },
        updatePersonalInfo: function(onboard) {
            var url = ONBOARDING_NAMESPACE + onboard.OnboardId + '/CandidatePersonalInfo';

            return $server.update({
                url: url,
                data: onboard.CandidatePersonalInfo
            });
        },
        updateContacts: function(onboard) {
                var url = ONBOARDING_NAMESPACE + onboard.OnboardId + '/CandidateContacts';

                return $server.update({
                    url: url,
                    data: onboard.CandidateContacts
                });
            },
        updateRole: function(onboard) {
            var url = ONBOARDING_NAMESPACE + onboard.OnboardId + '/ProposedRole';

            return $server.update({
                url: url,
                data: onboard
            });
        },
        processCandidateAcceptance: function() {
            var url = ONBOARDING_NAMESPACE + 'member/acceptance/process';

            return $server.update({
                url: url
            });
        },
        runPromises: function(promises) {
            return $q.all(promises);
        },
        DownloadAcceptanceDocumentAsHtml: function(actionUrl) {
                //var url = actionUrl.replace('//download', ['/', libraryDocumentId, '/', 'download?type=html'].join(''));
            return $server.get({
                url: actionUrl
            }).then(function(res) {
                    return res;
                });
            },
        onboardDocumentAccept: function(documentId) {
            var url = ONBOARDING_NAMESPACE + 'member/outbounddocuments/' + documentId + '/accept';

            return $server.update({
                url: url
            });
        },
        getMetadata: function() {
            return document_metadata;
        },
        setMetadata: function(metadata) {
            document_metadata = metadata;
        },
        createInboundDocumentRequirement: function(onboardId, docRequirement) {
            return $server.create({
                url: ONBOARDING_NAMESPACE + onboardId + '/InboundRequirements',
                data: docRequirement
            });
        },
        createBulkInboundDocumentRequirement: function(bulkOnboardId, inboundRequirement) {
            return $server.create({
                url: ONBOARDING_NAMESPACE + 'bulk/' + bulkOnboardId + '/InboundRequirements',
                data: inboundRequirement
            });
        },
        removeInboundDocumentRequirement: function(onboardId, docRequirementId) {
            return $server.remove({
                url: ONBOARDING_NAMESPACE + onboardId + '/InboundRequirements/' + docRequirementId
            });
        },
        removeBulkInboundDocumentRequirement: function(bulkId, docRequirementId) {
            return $server.remove({
                url: ONBOARDING_NAMESPACE + 'bulk/' + bulkId + '/inboundrequirements/' + docRequirementId
            });
        },
        saveBulkProposedRole: function(bulkOnboardId, onboard) {
            var onboardProposedRole = {
                OnboardRole: onboard.OnboardRole,
                OnboardStore: onboard.OnboardStore,
                SalaryType: onboard.SalaryType,
                EmploymentType: onboard.EmploymentType,
                EmploymentClassification: onboard.EmploymentClassification,
                SalaryPayRate: onboard.SalaryPayRate,
                HoursPerWeek: onboard.HoursPerWeek,
                CommencementDate: onboard.EffectiveDate,
                EffectiveDate: onboard.EffectiveDate,
                SourceDetail: onboard.SourceDetail
            };

            return $server.update({
                url: ONBOARDING_NAMESPACE + 'bulk/' + bulkOnboardId + '/proposedrole',
                data: onboardProposedRole
            });
        },
        getDocumentDownloadUrl: function(onboardDocument) {
                var libraryDocumentId = onboardDocument.LibraryDocumentId;

                return $server.get({
                        url: ARTIFACTS_NAMESPACE + libraryDocumentId + '/getDownloadUrlFromCloud'
                    })
                .then(function(res) {
                        return res.data.Url;
                });
            },
        getViewUrlForDocument: function(artifactId) {
            var url = ARTIFACTS_NAMESPACE + '/' + artifactId + '/getViewUrl';

            return $server.get({
                'url': url,
                'query': {
                    t: 'pdf'
                },
                'data': ''
            }).then(function(response) {
                return response;
            });
        },
        getArtifactById: function(id) {
            var artifactId = id;
            var url = ARTIFACTS_NAMESPACE + '/' + artifactId;
            return $server.get({
                'url': url
            }, true).then(function(res) {
                return getThumnail(res);
            });
        },
        getOutboundDocuments: function(onboardId) {
                return $server.get({
                url: ONBOARDING_NAMESPACE + onboardId + '/outbounddocuments'
            }).then(function(res) {
                    return res.data;
                });
            },
        getReferenceDocuments: function(onboardId) {
                return $server.get({
                url: ONBOARDING_NAMESPACE + onboardId + '/referencedocuments'
            }, true).then(function(res) {
                    return res.data;
                });
            },
        removeReferenceDocuments: function(onboardId, documentId) {
            return $server.remove({
                url: ONBOARDING_NAMESPACE + onboardId + '/referencedocuments/' + documentId
            });
        },
        getOutboundDocumentsForBulkOnboard: function(bulkId) {
                return $server.get({
                    url: ONBOARDING_NAMESPACE + 'bulk/' + bulkId + '/outbounddocuments'
            }, true).then(function(res) {
                    return res.data;
                });
            },
        addOutboundDocument: function(onboardId, libraryDocumentId, bulkId) {
                var url = ONBOARDING_NAMESPACE + (bulkId ? 'bulk/' + bulkId : onboardId) + '/outbounddocuments/' ;
                return $server.create({
                    url: url,
                    data: {
                        LibraryDocumentId: libraryDocumentId
                    }
                });
            },
        addReferenceDocument: function(onboardId, libraryDocumentId, bulkId) {
                var url = ONBOARDING_NAMESPACE + (bulkId ? 'bulk/' + bulkId : onboardId) + '/referencedocuments/' ;
                return $server.create({
                    url: url,
                    data: {
                        LibraryDocumentId: libraryDocumentId
                    }
                });
            },
        removeOutboundDocument: function(onboardId, onboardDocumentId) {
                return $server.remove({
                    url: ONBOARDING_NAMESPACE + onboardId + '/documents/' + onboardDocumentId
                });
            },
        removeCandidateFromBulk: function(onboardId) {
                return $server.update({
                    url: ONBOARDING_NAMESPACE + onboardId + '/unbulk'
                });
            },
        removeBulkOutboundDocument: function(bulkId, onboardDocumentId) {
                return $server.remove({
                    url: ONBOARDING_NAMESPACE + 'bulk/' + bulkId + '/outbounddocuments/' + onboardDocumentId
                });
            },
        tfnCandidateDeclaration: function(request) {
                var url = ONBOARDING_NAMESPACE + 'member/TFNCandidateDeclaration';

                return $server.create({
                    url: url,
                    data: request
                });
            },
        tfnCandidateSignature: function(request) {
                var url = ONBOARDING_NAMESPACE + 'member/TFNCandidateAcceptance';

                return $server.create({
                    url: url,
                    data: request
                });
            },
            createInboundDocument: function(requirement, index) {
                var req = {
                    'LibraryDocumentId' : requirement.LibraryDocumentId,
                    'ExpirationDate': requirement.InboundRequirement.ExpireDate,
                    'Id': requirement.InboundRequirement.Id
                };
                var url = ONBOARDING_NAMESPACE + 'member/inboundrequirements/' + req.Id +'?libraryId=' + req.LibraryDocumentId;

                $server.create({
                    url: url,
                    data: req
            }).then(function() {
                    requirement.InboundRequirement.IsLodged = true;
                });

            },
        updateInboundDocument: function(requirement) {
                var url = ONBOARDING_NAMESPACE + 'member/inboundrequirements/' + requirement.Id;

                return $server.create({
                    url: url,
                    data: requirement
                });

            },
        removeInboundDocument: function(requirementId) {
                var url = ONBOARDING_NAMESPACE + 'member/inboundrequirements/' + requirementId;

                return $server.remove({
                    url: url,
                });
            },
        getInboundDocument: function(onboardId) {
            var url = ONBOARDING_NAMESPACE + onboardId + '/inboundrequirements';

            return $server.get({
                url: url,
            }, true).then(function(res) {
                return res.data.Data.OnboardDocumentItemResults || res.data.OnboardDocumentItemResults;
            });
        },
        getInboundDocumentForBulkOnboard: function(bulkId) {
            var url = ONBOARDING_NAMESPACE + 'bulk/' + bulkId + '/inboundrequirements';

            return $server.get({
                url: url,
            }, true).then(function(res) {
                return res.data.Data.OnboardDocumentItemResults || res.data.OnboardDocumentItemResults;
            });
        },    
        memberAcceptance: function(bypassCache) {
                var url = ONBOARDING_NAMESPACE + 'member/acceptance';
                if (bypassCache !== false) {
                    bypassCache = true;
                }

                return $server.get({
                    url: url
            }, bypassCache).then(function(res) {
                    return res.data;
                });
            },
        memberPersonalInfo: function(request) {
                var url = ONBOARDING_NAMESPACE + 'member/candidatepersonalInfo';
                $server.update({
                    url: url,
                    data: request
                });
            },
        memberContacts: function(request) {
                var url = ONBOARDING_NAMESPACE + 'member/candidatecontacts';
                $server.update({
                    url: url,
                    data: [request]
                });
            },
        memberBankInfo: function(request) {
                var url = ONBOARDING_NAMESPACE + 'member/candidatebanking';
                $server.update({
                    url: url,
                    data: request
                });
            },
        downloadTaxFormAsPdf: function(resultFileName) {
                var url = ONBOARDING_NAMESPACE + 'member/exportTFN?fileName=' + resultFileName || '';
                $server.get({
                    url: url
                });
            },
        updateTfnDeclaration: function(memberTfnEntry) {
            return $q.all([
                factory.tfnCandidateDeclaration(memberTfnEntry),
                factory.processCandidateAcceptance()
            ]);
        },
        updateTfnSignature: function(memberTfnSignature) {
            return factory.tfnCandidateSignature(memberTfnSignature).then(function(response) {
                return factory.processCandidateAcceptance();
            });
        },
        updateInboundRequirements: function(requirements) {
            return factory.processCandidateAcceptance().then(function(res) {
                return res;
            });
        },
        rejectInboundDocument: function(onboardId, requirementId, rejectEntry) {
                var url = ONBOARDING_NAMESPACE + onboardId + "/inboundrequirements/" + requirementId  + "/reject";
                return $server.update({
                    url: url,
                    data: rejectEntry
                });
            },
        acceptInboundDocument: function(onboardId, requirementId) {
                var url = ONBOARDING_NAMESPACE + onboardId + "/inboundrequirements/" + requirementId  + "/accept";
                return $server.update({
                    url: url,
                });
            },
        tfnNetworkInformation: function(tfnPayerNetworkInformationEntry) {
                var url = ONBOARDING_NAMESPACE + 'TFNNetworkInformation';
                $server.update({
                    url: url,
                    data: tfnPayerNetworkInformationEntry
                });
            },
        tfnKeyStore: function() {
                var url = ONBOARDING_NAMESPACE + 'TfnKeyStore';
                $server.create({
                    url: url
                });
            },
        setupMemberTfnSignatureFromView: function(memberTfn) {
            var signatureTypeCode = function(isCheckbox, isUpload, isDirect) {
                    var typeCode = '';
                    if (isCheckbox) {
                        typeCode = OnboardingConstants.ONBOARD_SIGNATURE_TYPE_CHECKBOX;
                    }
                    if (isUpload) {
                        typeCode = OnboardingConstants.ONBOARD_SIGNATURE_TYPE_UPLOAD;
                    }
                    if (isDirect) {
                        typeCode = OnboardingConstants.ONBOARD_SIGNATURE_TYPE_DIRECT;
                    }
                    return typeCode;
                };

                var memberTfnSignature = {};
                //memberTfnSignature.DateDeclarationSigned = moment().format('YYYY-MM-DD');
                memberTfnSignature.SignatoryIdentifierText = memberTfn.signature ? memberTfn.signature.dataUrl : null;
                memberTfnSignature.LibraryDocumentId = (memberTfn.FileStoreId && memberTfn.FileStoreId.length) ? memberTfn.FileStoreId[0] : null;
                memberTfnSignature.Accepted = memberTfn.signatureChecked;
                memberTfnSignature.StatementType = signatureTypeCode(memberTfn.IsCheckboxSignature, memberTfn.IsUploadSignature, memberTfn.IsDirectSignature);

                return memberTfnSignature;
            },
        setupMemberTfnFromModel: function(memberTFN) {
            var getYesNoFromTrueFalse = function(value) {
                    return value === true ? 'Yes' : value === false ? 'No' : 'n/a';
                };

                var details = {};

                if (memberTFN) {
                    var tfnNumbers = memberTFN.TaxFileNumber ? memberTFN.TaxFileNumber.split('') : '';
                    if (tfnNumbers.length === 9) {
                        details.tfnNumber1 = tfnNumbers[0];
                        details.tfnNumber2 = tfnNumbers[1];
                        details.tfnNumber3 = tfnNumbers[2];
                        details.tfnNumber4 = tfnNumbers[3];
                        details.tfnNumber5 = tfnNumbers[4];
                        details.tfnNumber6 = tfnNumbers[5];
                        details.tfnNumber7 = tfnNumbers[6];
                        details.tfnNumber8 = tfnNumbers[7];
                        details.tfnNumber9 = tfnNumbers[8];
                    }
                    details.SalutationId = memberTFN.SalutationId;
                    details.Salutation = memberTFN.Salutation;
                    details.Surname = memberTFN.Surname;
                    details.FirstName = memberTFN.FirstGivenName;
                    details.OtherName = memberTFN.SecondGivenName;
                    details.fullName = details.Salutation + ' ' + details.FirstName + ' ' + (details.OtherName ? details.OtherName + ' ' : '') + details.Surname;
                    details.previousName = 'n/a';
                    details.BirthDay = memberTFN.DateOfBirth ? moment(memberTFN.DateOfBirth).format('YYYY-MM-DD') : '';
                    details.Address = memberTFN.Address;
                    details.Suburb = memberTFN.Suburb;
                    details.State = memberTFN.AddressUsageCode;
                    details.Postcode = memberTFN.Postcode;
                    details.CountryId = memberTFN.CountryId;
                    details.Country = memberTFN.Country;
                    details.StateRegion = memberTFN.StateRegion;
                    details.fullAddress1 = details.Address + ' ' + details.Suburb + ' ' + details.Postcode;
                    details.fullAddress2 = memberTFN.AddressUsageCode + ' ' + details.Country;
                    details.EmploymentType = memberTFN.BasisOfPaymentCode;
                    details.BasisOfPayment = memberTFN.BasisOfPayment;
                    details.Resident = getYesNoFromTrueFalse(memberTFN.ResidencyStatus);
                    details.Threshold = getYesNoFromTrueFalse(memberTFN.TaxFreeThresholdClaimed);
                    details.senior = getYesNoFromTrueFalse(memberTFN.SeniorAustraliansTaxOffsetClaimed);
                    details.zone = getYesNoFromTrueFalse(memberTFN.ZoneRebateClaimed);
                    details.Help = getYesNoFromTrueFalse(memberTFN.HelpIndicator);
                    details.Sfss = getYesNoFromTrueFalse(memberTFN.TradeSupportLoanIndicator);

                    if (memberTFN.Accepted === true) {
                        details.SignatureType = 'Check box';
                        details.signatureChecked = memberTFN.Accepted;
                        details.IsCheckboxSignature = true;
                    }
                    if (memberTFN.SignatoryLibraryDocumentId) {
                        details.SignatureType = 'Upload';
                        details.FileStoreId = memberTFN.SignatoryLibraryDocumentId;
                        details.IsUploadSignature = true;
                    }
                    if (memberTFN.SignatoryIdentifierText) {
                        details.SignatureType = 'Direct';
                        details.signature = memberTFN.SignatoryIdentifierText;
                        details.IsDirectSignature = true;
                    }

                    details.signedDate = memberTFN.DateDeclarationSigned ? moment(memberTFN.DateDeclarationSigned).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');

                }

                return details;
            },
        setupMemberTfnFromView: function(memberTfn) {
            var getTrueFalseFromYesNo = function(value) {
                    return value === 'Yes' ? true : false;
                };

            var signatureTypeCode = function(isCheckbox, isUpload, isDirect) {
                    var typeCode = '';
                    if (isCheckbox) {
                        typeCode = 'Check box';
                    }
                    if (isUpload) {
                        typeCode = 'Upload';
                    }
                    if (isDirect) {
                        typeCode = 'Direct';
                    }
                    return typeCode;
                };

                var memberTfnEntry = {};
                memberTfnEntry.TaxFileNumber = [memberTfn.tfnNumber1, memberTfn.tfnNumber2, memberTfn.tfnNumber3, memberTfn.tfnNumber4, memberTfn.tfnNumber5, memberTfn.tfnNumber6, memberTfn.tfnNumber7, memberTfn.tfnNumber8, memberTfn.tfnNumber9].join('');
                memberTfnEntry.DateOfBirth = moment(memberTfn.BirthDay).format('YYYY-MM-DD');
                memberTfnEntry.ResidencyStatus = getTrueFalseFromYesNo(memberTfn.Resident);
                memberTfnEntry.BasisOfPaymentCode = memberTfn.EmploymentType;
                memberTfnEntry.TaxFreeThresholdClaimed = getTrueFalseFromYesNo(memberTfn.Threshold);
                memberTfnEntry.SeniorAustraliansTaxOffsetClaimed = getTrueFalseFromYesNo(memberTfn.senior);
                memberTfnEntry.ZoneRebateClaimed = getTrueFalseFromYesNo(memberTfn.zone);
                memberTfnEntry.OverseasForcesRebateClaimed = memberTfnEntry.ZoneRebateClaimed;
                memberTfnEntry.DependantSpouseRebateClaimed = memberTfnEntry.ZoneRebateClaimed;
                memberTfnEntry.HELPIndicator = getTrueFalseFromYesNo(memberTfn.Help);
                memberTfnEntry.TradeSupportLoanIndicator = getTrueFalseFromYesNo(memberTfn.Help);
                memberTfnEntry.Surname = memberTfn.Surname;
                memberTfnEntry.FirstGivenName = memberTfn.FirstName;
                memberTfnEntry.SecondGivenName = memberTfn.OtherName;
                memberTfnEntry.Address = memberTfn.Address;
                memberTfnEntry.Postcode = memberTfn.Postcode;
                memberTfnEntry.Suburb = memberTfn.Suburb;
                memberTfnEntry.CountryId = memberTfn.CountryId;
                memberTfnEntry.AddressUsageCode = memberTfn.State;
                memberTfnEntry.SalutationId = memberTfn.SalutationId;
                memberTfnEntry.TfnAddressTypeId = 3;
                memberTfnEntry.TfnExemptionCode = 1;
                memberTfnEntry.StartDate = moment().format('YYYY-MM-DD');
                memberTfnEntry.EndDate = moment().format('YYYY-MM-DD');
                memberTfnEntry.DateDeclarationSigned = moment().format('YYYY-MM-DD');
                memberTfnEntry.SignatoryIdentifierText = memberTfn.signature;
                memberTfnEntry.SignatoryLibraryDocumentId = memberTfn.FileStoreId;
                memberTfnEntry.AcceptedIndicator = memberTfn.signatureChecked;
                memberTfnEntry.StatementTypeCode = signatureTypeCode(memberTfn.IsCheckboxSignature, memberTfn.IsUploadSignature, memberTfn.IsDirectSignature);
                memberTfnEntry.PreviousSurname = memberTfn.PreviousSurname;
                memberTfnEntry.PreviousName = memberTfn.PreviousName;
                memberTfnEntry.PreviousOtherName = memberTfn.PreviousOtherName;
                memberTfnEntry.HasMadeSeparateEnquiry = memberTfn.HasMadeSeparateEnquiry;
                memberTfnEntry.IsExemption = memberTfn.IsExemption;
                memberTfnEntry.IsPensionerExemption = memberTfn.IsPensionerExemption;

                return memberTfnEntry;

            },
        getRouteFromAcceptanceStage: function(stage) {
                var route = '';
                switch (stage) {
                    case OnboardingConstants.ONBOARD_STATE_MEMBERWELCOME:
                        route = 'recruit.onboarding.welcome';
                        break;
                    case OnboardingConstants.ONBOARD_STATE_MEMBERACCEPTTERMS:
                        route = 'recruit.onboarding.terms';
                        break;
                    case OnboardingConstants.ONBOARD_STATE_DOCUMENTATION:
                        route = 'recruit.onboarding.documents';
                        break;
                    case OnboardingConstants.ONBOARD_STATE_INBOUNDDOCUMENTATION:
                        route = 'recruit.onboarding.inboundDocuments';
                        break;
                    case OnboardingConstants.ONBOARD_STATE_MEMBERTFNDECLARATION:
                        route = 'recruit.onboarding.declaration';
                        break;
                    case OnboardingConstants.ONBOARD_STATE_MEMBERTFNSIGNATURE:
                        route = 'recruit.onboarding.signature';
                        break;
                    case OnboardingConstants.ONBOARD_STATE_MEMBERACCEPTPROF:
                        route = 'recruit.onboarding.profile';
                        break;
                    case OnboardingConstants.ONBOARD_STATE_COMPLETE:
                        route = 'recruit.onboarding.completion';
                        break;
                    default:
                        route = 'recruit.onboarding.sorry';
                        break;
                }
                return route;
            },
        getBasisOfPaymentFromCode: function(code) {
                var basisOfPayment = '';
                switch (code) {
                    case 'F':
                        basisOfPayment = 'Full time';
                        break;
                    case 'P':
                        basisOfPayment = 'Part time';
                        break;
                    case 'C':
                        basisOfPayment = 'Casual';
                        break;
                    case 'L':
                        basisOfPayment = 'Labour hire';
                        break;
                    case 'S':
                        basisOfPayment = 'Superannuation Pension/annuity';
                        break;
                }
                return basisOfPayment;
            },
            //Launch Platform for Inactive members
        setlaunchForInactiveMember: function(option,data) {
                var url = ONBOARDING_NAMESPACE + 'PlatformForInactiveMembers' + '?op=' + option;
                return $server.create({
                    'url': url,
                    'data': data
                });
            },
            //Launch Platform For Group Or Members
        setlaunchForGroupAndMember: function(option, data) {
                var url = ONBOARDING_NAMESPACE + 'PlatformForGroupOrMembers' + '?op=' + option;
                return $server.create({
                    'url': url,
                    'data': data
                });
            },
            //Search Group and member
        searchGroup: function(obj) {
                var url = ONBOARDING_NAMESPACE + 'NetworkGroupInNetwork';
                var query = {
                    's': 'a',
                    'p': obj.p,
                    'ps': obj.ps
                };
                return $server.get({
                    url: url,
                    query: query
            }).then(function(res) {
                    $HTTPCache.clear(url);
                    return res;
            }, function(err) {
                    return err;
                });
            },
            // Get group and member
        getGroupAndMember: function() {
                var url = ONBOARDING_NAMESPACE + 'LaunchItems';
                $HTTPCache.clear(url);
                return $server.get({
                    url: url
                });
            },
        isOnboardPhaseUndefined: function(onboard) {
            return onboard.Status === '';
        },
        isOnboardPhaseNew: function(onboard) {
                return onboard.Status === 'New';
            },
        isOnboardPhaseAwaitingApproval: function(onboard) {
                return onboard.Status === 'Approval';
            },
        isOnboardPhaseDocumentation: function(onboard) {
                return onboard.Status === 'Documentation';
            },
        isOnboardPhaseAwaitingCandidateAcceptance: function(onboard) {
                return onboard.Status === 'Acceptance';
            },
        isOnboardPhaseAwaitingConfirmation: function(onboard) {
                return onboard.Status === 'Confirmation';
            },
        isOnboardPhaseComplete: function(onboard) {
                return onboard.Status === 'Complete' || onboard.Status === 'Pending';
            },
        isOnboardPhaseDeclined: function(onboard) {
                return onboard.Status === 'Declined';
            },
        isOnboardSourceMember: function(onboard) {
                return onboard.SourceDetail &&
                    onboard.SourceDetail.Source === OnboardingConstants.ONBOARD_SOURCE_MEMBER;
            },
        isOnboardSourceTrial: function(onboard) {
                return onboard.SourceDetail &&
                    onboard.SourceDetail.Source === OnboardingConstants.ONBOARD_SOURCE_TRIAL;
            },
        isOnboardSourceAgency: function(onboard) {
                return onboard.SourceDetail &&
                    onboard.SourceDetail.Source === OnboardingConstants.ONBOARD_SOURCE_AGENCY;
            },
        isOnboardSourceSherpa: function(onboard) {
            return onboard.SourceDetail &&
                onboard.SourceDetail.Source === OnboardingConstants.ONBOARD_SOURCE_SHERPA;
        },
        getOnboardingSettings: function() {
            return $server.get({
                url: ONBOARDING_NAMESPACE + 'settings'
            }, true).then(function(res) {
                return res.data.OnboardingSetting ? res.data.OnboardingSetting : res.data;
            });
        },
        deleteListOnboard: function(onboards) {
            return $server.update({
                url: API_BASE_URL + 'Onboarding',
                data: onboards
            });
        },
        updateSingleCandidateInfo: function(onboard) {
            var promise = [];
            
            promise.push(factory.updatePersonalInfo(onboard));
            promise.push(factory.updateContacts(onboard));
            
            return factory.runPromises(promise);
        }
    };

    return factory;
});