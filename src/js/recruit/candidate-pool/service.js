angular.module('ui.recruit.candidatepool')
    .service('CandidatePoolService', [
        '$server', 'API_BASE_URL', '$HTTPCache', '$routeParams', '$notify', '$q', '$cookies', 'FormatCandidates', 'Permissions',
        function($server, API_BASE_URL, $HTTPCache, $routeParams, $notify, $q, $cookies, FormatCandidates, Permissions) {

            var CANDIDATE_POOL_NAMESPACE = API_BASE_URL + 'candidate/';

            function formatCandidateListResult(res) {
                var result = res.data;
                var candidateList = {
                    Candidates: result.CandidatePoolSummaryItemResults.map(function(obj) {
                        return FormatCandidates.formatCandidateBySummaryItemResult(obj);
                    }),

                    Permissions: Permissions.formatPermissions(result.EntityActions),
                    Pagination: result.Pagination
                };

                res.data = candidateList;

                return res.data;
            }


            function formatCandidateJobHistoriesResult(res) {
                var result = res.data;
                if (!result.CandidateApplicationHistory) {
                    return null;
                }
                var candidateJobHistories = {
                    AppliedJobApplications: result.CandidateApplicationHistory.AppliedJobApplications,
                    CandidateContact: result.CandidateApplicationHistory.CandidateContact,
                    CandidateInformation: result.CandidateApplicationHistory.CandidateInformation,
                    Permissions: Permissions.formatPermissions(result.EntityActions)
                };

                res.data = candidateJobHistories;

                return res.data;
            }

            function formatTagsResult(res) {
                var result = res.data;
                var tags = {
                    JobTagItemResults: result.JobTagItemResults.map(function(item) {
                        return {
                            id: item.JobTag.JobTagId,
                            label: item.JobTag.TagDesc
                        };
                    }),
                    Permissions: Permissions.formatPermissions(result.EntityActions)
                };

                res.data = tags;
                return res.data;
            }


            var candidatePoolService = {


                //#region GET api/candidate?p={p}&ps={ps}&o={o}

                //#region URI Parameters
                // p: page
                // ps: pageSize
                // o: 
                //#endregion

                //#region Body Parameters
                // None
                //#endregion
                getCandidatesByNetwork: function(obj) {
                    var url = CANDIDATE_POOL_NAMESPACE;
                    var query = {
                        'p': obj.p ? obj.p : 1,
                        'ps': obj.ps ? obj.ps : 10,
                    };

                    return $server.get({
                        'url': url,
                        'query': query
                    }, true).then(function(res) {
                        if (res.status === 200) {
                            return formatCandidateListResult(res);
                        }
                        return res;
                    });
                },

                //#endregion

                //#region POST api/candidate/{id}/star

                //#region URI Parameters
                // id - integer
                //#endregion

                //#region Body Parameters
                // None
                //#endregion

                makeAsStar: function(id) {
                    var url = CANDIDATE_POOL_NAMESPACE + id + '/star';
                    return $server.update({
                        'url': url
                    }).then(function(res) {
                        if (res.status === 200 && res.data.Errors === null) {
                            $HTTPCache.clear(url);

                            $notify.add({
                                message: 'Make as star successfully!',
                                type: 'success',
                                visible: true
                            });
                        }

                        return res;
                    });
                },

                //#endregion

                //#region DELETE api/candidate/{id}/star

                //#region URI Parameters
                //id - integer
                //#endregion

                //#region Body Parameters
                //None
                //#endregion

                unStar: function(id) {
                    var candidateId = id;
                    var url = CANDIDATE_POOL_NAMESPACE + candidateId + '/star';
                    return $server.remove({
                        'url': url
                    }).then(function(res) {
                        if (res.status === 200) {
                            $HTTPCache.clear(url);

                            $notify.add({
                                message: 'Unstar successfully!',
                                type: 'success',
                                visible: true
                            });
                        }

                        return res;
                    });
                },

                //#endregion

                //#region GET api/candidate/{candidateId}/Profile

                //#region URI Parameters
                // 1. candidateId: integer
                //#endregion

                getCandidateDetail: function(id) {

                },

                //#endregion

                //#region GET api/candidate/{candidateId}

                //#region URI Parameters
                // 1. candidateId: integer
                //#endregion

                //#region Body Parameters
                // None
                //#endregion

                //#region Return data
                //{
                //    "CandidatePoolSummary": {
                //        "$id": "2",
                //        "CandidateInformation": {
                //            "$id": "3",
                //            "MemberId": 1,
                //            "Salutation": 2,
                //            "FirstName": "sample string 3",
                //            "Surname": "sample string 4",
                //            "PreferredName": "sample string 5",
                //            "Sex": "sample string 6",
                //            "BirthDay": "2016-03-23T08:30:46.2506063+07:00",
                //            "LastModified": "2016-03-23T08:30:46.2506063+07:00",
                //            "MemberType": "sample string 7",
                //            "Title": "sample string 8",
                //            "Active": true,
                //            "DateRegistered": "2016-03-23T08:30:46.2506063+07:00",
                //            "PhotoThumb": "sample string 10"
                //        },
                //        "CandidateDetails": [
                //          {
                //              "$id": "4",
                //              "ContactInfoId": 1,
                //              "Address": "sample string 2",
                //              "City": "sample string 3",
                //              "Suburb": "sample string 4",
                //              "Postcode": "sample string 5",
                //              "LinePhone1": "sample string 6",
                //              "LinePhone2": "sample string 7",
                //              "MobilePhone": "sample string 8",
                //              "Fax": "sample string 9",
                //              "Email": "sample string 10",
                //              "WebAddress": "sample string 11",
                //              "StateRegionId": 1,
                //              "StateName": "sample string 12",
                //              "CountryId": 1,
                //              "Type": "sample string 13"
                //          },
                //          {
                //              "$ref": "4"
                //          }
                //        ],
                //        "CommentsCount": 1,
                //        "Tags": [
                //          {
                //              "$id": "5",
                //              "JobTagId": 1,
                //              "TagDesc": "sample string 2",
                //              "TagCategory": "sample string 3"
                //          },
                //          {
                //              "$ref": "5"
                //          }
                //        ],
                //        "Stores": [
                //          {
                //              "$id": "6",
                //              "NetworkGroupId": 1,
                //              "NetworkId": 2,
                //              "GroupName": "sample string 3",
                //              "NetworkLevel": 4,
                //              "CreatedDateTime": "2016-03-23T08:30:46.2516067+07:00",
                //              "IsInactive": true
                //          },
                //          {
                //              "$ref": "6"
                //          }
                //        ],
                //        "RegisteredDate": "2016-03-23T08:30:46.2516067+07:00",
                //        "IsStarredByCurrentManager": true,
                //        "CvExtract": "sample string 2",
                //        "ResumeCandidateSummary": {
                //            "$id": "7",
                //            "CurrentOrLastPosition1": "sample string 2",
                //            "Employer1": "sample string 3",
                //            "TypeBusiness1": "sample string 4",
                //            "DescDuties1": "sample string 5",
                //            "Years1": "sample string 6"
                //        },
                //        "Job": {
                //            "$id": "8",
                //            "JobId": 1,
                //            "NetworkId": 2,
                //            "JobTitle": "sample string 3",
                //            "Summary": "sample string 4",
                //            "JobReference": "sample string 5",
                //            "JobStatusCode": "sample string 6",
                //            "JobLocation": "sample string 7",
                //            "ApplicationStatus": "sample string 8",
                //            "Logo": "sample string 9",
                //            "LogoUrl": "images/network/multipost/jobboards/sample string 9",
                //            "JobBoardId": 1
                //        },
                //        "IsBlackList": true,
                //        "ResumeDocumentId": 1
                //    },
                //    "EntityActions": null,
                //    "Status": 0
                //}
                //#endregion

                getCandidate: function(candidateId) {
                    var url = CANDIDATE_POOL_NAMESPACE + candidateId;

                    return $server.get({
                        'url': url
                    }, true).then(function(res) {
                        if (res.status === 200) {
                            $HTTPCache.clear(url);

                            return FormatCandidates.formatCandidatePoolSummaryItemResult(res);
                            //return res;
                        } else {
                            return res;
                        }
                    });
                },
                //#endregion

                //#region GET api/candidate/{candidateId}/jobhistories

                //#region URI Parameters
                // 1. candidateId: integer
                //#endregion

                //#region Body Parameters
                // None
                //#endregion

                //#region Return data
                //{
                //    "CandidateApplicationHistory": {
                //        "$id": "2",
                //        "CandidateInformation": {
                //            "$id": "3",
                //            "MemberId": 1,
                //            "FirstName": "sample string 2",
                //            "Surname": "sample string 3",
                //            "PhotoLarge": "sample string 4",
                //            "PhotoThumb": "sample string 5",
                //            "PhotoThumbMini": "sample string 6",
                //            "RoleTitle": "sample string 7",
                //            "DefaultNetworkGroupId": 8
                //        },
                //        "CandidateContact": {
                //            "$id": "4",
                //            "ContactInfoId": 1,
                //            "Address": "sample string 2",
                //            "City": "sample string 3",
                //            "Suburb": "sample string 4",
                //            "Postcode": "sample string 5",
                //            "LinePhone1": "sample string 6",
                //            "LinePhone2": "sample string 7",
                //            "MobilePhone": "sample string 8",
                //            "Fax": "sample string 9",
                //            "Email": "sample string 10",
                //            "WebAddress": "sample string 11",
                //            "StateRegionId": 1,
                //            "StateName": "sample string 12",
                //            "CountryId": 1,
                //            "Type": "sample string 13"
                //        },
                //        "AppliedJobApplications": [
                //          {
                //              "$id": "5",
                //              "ApplicationStatus": "sample string 2",
                //              "ApplyDate": "2016-03-23T08:31:41.052758+07:00",
                //              "HasOfferSent": true,
                //              "OfferSentDate": "2016-03-23T08:31:41.052758+07:00",
                //              "UploadedBy": {
                //                  "$ref": "3"
                //              },
                //              "TransferredBy": {
                //                  "$ref": "3"
                //              },
                //              "ApplicantInformation": {
                //                  "$ref": "3"
                //              },
                //              "ApplicantContact": {
                //                  "$ref": "4"
                //              },
                //              "ApplicantJobBoard": {
                //                  "$id": "6",
                //                  "JobBoardId": 1,
                //                  "JobBoardName": "sample string 2",
                //                  "Logo": "sample string 3",
                //                  "CanReNew": true,
                //                  "CanSetExpiry": true,
                //                  "SortOrder": 6
                //              },
                //              "JobSummary": {
                //                  "$id": "7",
                //                  "JobId": 1,
                //                  "NetworkId": 2,
                //                  "JobTitle": "sample string 3",
                //                  "Summary": "sample string 4",
                //                  "JobReference": "sample string 5",
                //                  "JobStatusCode": "sample string 6",
                //                  "JobLocation": "sample string 7",
                //                  "ApplicationStatus": "sample string 8",
                //                  "Logo": "sample string 9",
                //                  "LogoUrl": "images/network/multipost/jobboards/sample string 9",
                //                  "JobBoardId": 1
                //              },
                //              "Notes": "sample string 4",
                //              "ResumeDocumentId": 1,
                //              "CoverLetterDocumentId": 1
                //          },
                //          {
                //              "$ref": "5"
                //          }
                //        ]
                //    },
                //    "EntityActions": null,
                //    "Status": 0
                //}
                //#endregion
                getJobHistories: function(candidateId) {
                    var url = CANDIDATE_POOL_NAMESPACE + candidateId + '/jobhistories';

                    return $server.get({
                        'url': url
                    }, true).then(function(res) {

                        if (res.status === 200) {
                            $HTTPCache.clear(url);

                            return formatCandidateJobHistoriesResult(res);
                            //return res;
                        } else {
                            return res;
                        }
                    });
                },
                //#endregion

                //#region GET api/candidate/{candidateId}/comments?o={o}&p={p}&ps={ps}

                //#region URI Parameters
                // 1. candidateId: integer
                // 2. o: string
                // 3. p: integer
                // 4. ps: integer
                //#endregion

                //#region Body Parameters
                // None
                //#endregion

                //#region Return data
                //{
                //    "CandidatePoolCommentSummaryItemResults": [
                //      {
                //          "$id": "2",
                //          "CandidatePoolCommentSummary": {
                //              "$id": "3",
                //              "CommentDate": "2016-03-23T08:33:32.5786178+07:00",
                //              "Comment": "sample string 2",
                //              "Author": {
                //                  "$id": "4",
                //                  "MemberId": 1,
                //                  "FirstName": "sample string 2",
                //                  "Surname": "sample string 3",
                //                  "PhotoLarge": "sample string 4",
                //                  "PhotoThumb": "sample string 5",
                //                  "PhotoThumbMini": "sample string 6",
                //                  "RoleTitle": "sample string 7",
                //                  "DefaultNetworkGroupId": 8
                //              },
                //              "IsLike": true
                //          },
                //          "EntityActions": null,
                //          "Status": 0
                //      },
                //      {
                //          "$ref": "2"
                //      }
                //    ],
                //    "EntityActions": null,
                //    "Pagination": {
                //        "$id": "5",
                //        "TotalCount": 1,
                //        "TotalPages": 2,
                //        "PageSize": 1,
                //        "Page": 1
                //    },
                //    "Status": 0
                //}
                //#endregion

                //#endregion

                //#region PUT api/candidate/{id}/AddToBlackList?reason={reason}

                //#region URI Parameters
                // 1. id: integer
                // 2. reason: string
                //#endregion

                //#region Body Parameters
                // None
                //#endregion

                //#region Return data
                //{
                //    "Data": {
                //        "$id": "2"
                //    },
                //    "Status": 0
                //}
                //#endregion

                addToBlackList: function(obj) {
                    var candidateId = obj.candidateId;
                    var query = {
                        'reason': obj.reason
                    };
                    var url = CANDIDATE_POOL_NAMESPACE + candidateId + '/blacklist';

                    return $server.update({
                        'url': url,
                        'query': query
                    }, true).then(function(res) {
                        if (res.status === 200) {
                            $notify.add({
                                message: 'Add to blacklist successfully!',
                                type: 'success',
                                visible: true
                            });
                        }
                        return res;
                    });
                },

                //#endregion

                //#region DELETE api/candidate/{id}/blacklist

                //#region URI Parameters
                // 1. id: integer
                //#endregion

                //#region Body Parameters
                // None
                //#endregion

                //#region Return data
                //{
                //    "Data": {
                //        "$id": "2"
                //    },
                //    "Status": 0
                //}
                //#endregion

                removeFromBlackList: function(candidate) {
                    var candidateId = candidate.MemberId;
                    var candidateFullName = candidate.FullName;
                    var url = CANDIDATE_POOL_NAMESPACE + candidateId + '/blacklist';
                    return $server.remove({
                        'url': url
                    }).then(function(res) {
                        if (res.status === 200) {
                            $HTTPCache.clear(url);

                            $notify.add({
                                message: 'Remove ' + candidateFullName + ' from blacklist successfully!',
                                type: 'success',
                                visible: true
                            });
                        }

                        return res;
                    });
                },

                //#endregion

                //#region POST api/candidate/{id}/multiaddblacklist

                //#region URI Parameters
                // id: integer
                //#endregion

                //#region Body Parameters
                // Collection of integer
                //#endregion

                //#region Return data
                // [1, 2]
                //#endregion
                addMultibleCandidatesToBlackList: function(candidateIds) {
                    var url = CANDIDATE_POOL_NAMESPACE + 'blacklist';
                    return $server.create({
                        'url': url,
                        'data': candidateIds
                    }).then(function(res) {
                        if (res.status === 200) {
                            $HTTPCache.clear(url);

                            $notify.add({
                                message: 'Add candidates to blacklist successfully!',
                                type: 'success',
                                visible: true
                            });

                            return res;
                        }

                        return res;
                    });
                },
                //#endregion

                //#region DELETE api/candidate/{id}

                //#region URI Parameters
                // 1. id: integer
                //#endregion

                //#region Body Parameters
                // None
                //#endregion

                //#region Return data
                //{
                //    "Data": {
                //        "$id": "2"
                //    },
                //    "Status": 0
                //}
                //#endregion

                //#endregion

                //#region GET api/candidate/filter?s={s}&po={po}&l={l}&t={t}&so={so}&ta={ta}&ns={ns}&c={c}&p={p}&ps={ps}&o={o}

                //#region URI Parameters
                // 1. s: string
                // 2. po: 1 || 2 || 4 , (1: p, 2: r, 4: s)
                // 3. l : 0 || 1 || 2 || 3 || 4 || 5 || 6 , (0: ACT, 1: NSW, 2: NT, 3: QL, 4: SA, 5: Tas, 6: WA)
                // 4. t : 1 || 2 || 4 , (1: w, 2: m, 4: y)
                // 5. so: 1 || 2 || 4 || 5 || 6 || 7 || 8 || 9 || 10 || 11 || 12 || 13
                //   ( 1: Seek , 2: LinkMe, 4: Autopeople, 5: MyCareer, 6: OnSite, 7: CareerOne, 8: Internal, 9: AdCorp, 10: Agency, 11: Facebook, 12: Twitter, 13: TradeMe)
                // 6. ta: integer
                // 7. ns: integer
                // 8. c: intege
                // 9. p: integer
                // 10. ps: integer
                // 11. o: string
                //#endregion

                //#region Body Parameters
                // None
                //#endregion

                //#region Return data
                //{
                //    "CandidatePoolSummaryItemResults": [
                //      {
                //          "$id": "2",
                //          "CandidatePoolSummary": {
                //              "$id": "3",
                //              "CandidateInformation": {
                //                  "$id": "4",
                //                  "MemberId": 1,
                //                  "Salutation": 2,
                //                  "FirstName": "sample string 3",
                //                  "Surname": "sample string 4",
                //                  "PreferredName": "sample string 5",
                //                  "Sex": "sample string 6",
                //                  "BirthDay": "2016-03-23T08:41:08.9505976+07:00",
                //                  "LastModified": "2016-03-23T08:41:08.9505976+07:00",
                //                  "MemberType": "sample string 7",
                //                  "Title": "sample string 8",
                //                  "Active": true,
                //                  "DateRegistered": "2016-03-23T08:41:08.9505976+07:00",
                //                  "PhotoThumb": "sample string 10"
                //              },
                //              "CandidateDetails": [
                //                {
                //                    "$id": "5",
                //                    "ContactInfoId": 1,
                //                    "Address": "sample string 2",
                //                    "City": "sample string 3",
                //                    "Suburb": "sample string 4",
                //                    "Postcode": "sample string 5",
                //                    "LinePhone1": "sample string 6",
                //                    "LinePhone2": "sample string 7",
                //                    "MobilePhone": "sample string 8",
                //                    "Fax": "sample string 9",
                //                    "Email": "sample string 10",
                //                    "WebAddress": "sample string 11",
                //                    "StateRegionId": 1,
                //                    "StateName": "sample string 12",
                //                    "CountryId": 1,
                //                    "Type": "sample string 13"
                //                },
                //                {
                //                    "$ref": "5"
                //                }
                //              ],
                //              "CommentsCount": 1,
                //              "Tags": [
                //                {
                //                    "$id": "6",
                //                    "JobTagId": 1,
                //                    "TagDesc": "sample string 2",
                //                    "TagCategory": "sample string 3"
                //                },
                //                {
                //                    "$ref": "6"
                //                }
                //              ],
                //              "Stores": [
                //                {
                //                    "$id": "7",
                //                    "NetworkGroupId": 1,
                //                    "NetworkId": 2,
                //                    "GroupName": "sample string 3",
                //                    "NetworkLevel": 4,
                //                    "CreatedDateTime": "2016-03-23T08:41:08.9505976+07:00",
                //                    "IsInactive": true
                //                },
                //                {
                //                    "$ref": "7"
                //                }
                //              ],
                //              "RegisteredDate": "2016-03-23T08:41:08.9505976+07:00",
                //              "IsStarredByCurrentManager": true,
                //              "CvExtract": "sample string 2",
                //              "ResumeCandidateSummary": {
                //                  "$id": "8",
                //                  "CurrentOrLastPosition1": "sample string 2",
                //                  "Employer1": "sample string 3",
                //                  "TypeBusiness1": "sample string 4",
                //                  "DescDuties1": "sample string 5",
                //                  "Years1": "sample string 6"
                //              },
                //              "Job": {
                //                  "$id": "9",
                //                  "JobId": 1,
                //                  "NetworkId": 2,
                //                  "JobTitle": "sample string 3",
                //                  "Summary": "sample string 4",
                //                  "JobReference": "sample string 5",
                //                  "JobStatusCode": "sample string 6",
                //                  "JobLocation": "sample string 7",
                //                  "ApplicationStatus": "sample string 8",
                //                  "Logo": "sample string 9",
                //                  "LogoUrl": "images/network/multipost/jobboards/sample string 9",
                //                  "JobBoardId": 1
                //              },
                //              "IsBlackList": true,
                //              "ResumeDocumentId": 1
                //          },
                //          "EntityActions": null,
                //          "Status": 0
                //      },
                //      {
                //          "$ref": "2"
                //      }
                //    ],
                //    "EntityActions": null,
                //    "Pagination": {
                //        "$id": "10",
                //        "TotalCount": 1,
                //        "TotalPages": 2,
                //        "PageSize": 1,
                //        "Page": 1
                //    },
                //    "Status": 0
                //}
                //#endregion

                filterCandidates: function(obj) {
                    var query = obj;
                    var url = CANDIDATE_POOL_NAMESPACE + 'filter';

                    return $server.get({
                        'url': url,
                        'query': query
                    }, true).then(function(res) {

                        if (res.status === 200) {
                            $HTTPCache.clear(url);
                            return formatCandidateListResult(res);
                        } else {
                            return res;
                        }
                    });
                },
                //#endregion

                //#region POST api/candidate/register


                //#region Body Parameters
                //    {
                //        CandidatePersonalInfo : 
                //            {
                //                MemberId: 1,
                //                Salutation: 2,
                //                FirstName: 'string',
                //                Surname: 'string',
                //                PreferredName: 'string',
                //                Sex: 'string',
                //                BirthDay: date,
                //                LastModified: date,
                //                MemberType: 'string',
                //                Title: 'string',
                //                Active: true,
                //                DateRegistered: date,
                //                PhotoThumb: 'string'
                //            }
                //        CandidateContact:
                //            {
                //                MemberId: 1,
                //                ContactInfoId: 2,
                //                DateCreated: date,
                //                DateModified: date,
                //                IsPrimary: true,
                //                IsPrivate: true,
                //                Type: 'string',
                //                Address: 'string',
                //                City: 'string',
                //                Suburb: 'string',
                //                Postcode: 'string',
                //                MobilePhone: 'string',
                //                Phone: 'string',
                //                Fax: 'string',
                //                Email: 'string',
                //                WebAddress: 'string',
                //                StateName: 'string',
                //                StateRegionId: 12,
                //                StateRegion: {
                //                    StateRegionId: 1,
                //                    Name: 'string',
                //                    NameAbbreviated: 'string',
                //                    LookupUrl: 'string'
                //                },
                //                CountryId: {
                //                    LookupUrl: 'string',
                //                    Value: 1212,
                //                    Label: 'string'
                //                },
                //                CanAcceptSms: true,
                //                CanAcceptVoiceCall: true,
                //                CanAcceptFax: true,
                //                CanAcceptHtml: true
                //            }
                //        PreferredStores:
                //            [{
                //                NetworkGroupId: 2121,
                //                GroupName: 'string',
                //                Type: 'string',
                //                LookupUrl: 'string'
                //            },
                //            {
                //                NetworkGroupId: 2121,
                //                GroupName: 'string',
                //                Type: 'string',
                //                LookupUrl: 'string'
                //            }]
                //        JobAnswers:
                //            [{
                //                NetworkJobboardQuestionID: 2122,
                //                ParentNetworkJobboardQuestionID: 1212,
                //                LookupType: 0 || 1 || 2 || 3 || 4 || 5 || 6 (0: NotSet, 1: JobApplication, 2: MemberProfile, 3: JobSeekerRegistration, 4: ExitForm, 5: StoreRequest, 6: PerformanceAssessment) ,
                //                LookupId: 1212,
                //                Answer: 'string',
                //                QuestionType: 'string',
                //                Question: 'string',
                //                FieldName: 'string',
                //                DocumentID: 2121,
                //           }]
                //    JobTags: Collection of integer
                //    JobTypes: Collection of integer
                //    ResumeDocumentId: integer
                //    IsStoreEnquiryOn: true,
                //    IsCheckedAlertJob: true
                //}
                //#endregion

                //#region Return data
                //{
                //    "CandidatePersonalInfo": {
                //        "$id": "2",
                //        "MemberId": 1,
                //        "Salutation": 2,
                //        "FirstName": "sample string 3",
                //        "Surname": "sample string 4",
                //        "PreferredName": "sample string 5",
                //        "Sex": "sample string 6",
                //        "BirthDay": "2016-03-23T10:16:08.7612735+07:00",
                //        "LastModified": "2016-03-23T10:16:08.7612735+07:00",
                //        "MemberType": "sample string 7",
                //        "Title": "sample string 8",
                //        "Active": true,
                //        "DateRegistered": "2016-03-23T10:16:08.7612735+07:00",
                //        "PhotoThumb": "sample string 10"
                //    },
                //    "CandidateContact": {
                //        "$id": "3",
                //        "MemberId": 1,
                //        "ContactInfoId": 2,
                //        "DateCreated": "2016-03-23T10:16:08.7622887+07:00",
                //        "DateModified": "2016-03-23T10:16:08.7622887+07:00",
                //        "IsPrimary": true,
                //        "IsPrivate": true,
                //        "Type": "sample string 7",
                //        "Address": "sample string 8",
                //        "City": "sample string 10",
                //        "Suburb": "sample string 11",
                //        "Postcode": "sample string 12",
                //        "MobilePhone": "sample string 15",
                //        "Phone": "sample string 16",
                //        "Fax": "sample string 17",
                //        "Email": "sample string 18",
                //        "WebAddress": "sample string 19",
                //        "StateName": "sample string 20",
                //        "StateRegionId": 1,
                //        "StateRegion": {
                //            "$id": "4",
                //            "StateRegionId": 1,
                //            "Name": "sample string 2",
                //            "NameAbbreviated": "sample string 3",
                //            "LookupUrl": "sample string 4"
                //        },
                //        "CountryId": 1,
                //        "Country": {
                //            "$id": "5",
                //            "LookupUrl": "sample string 1",
                //            "Value": 2,
                //            "Label": "sample string 3"
                //        },
                //        "CanAcceptSms": true,
                //        "CanAcceptVoiceCall": true,
                //        "CanAcceptFax": true,
                //        "CanAcceptHtml": true
                //    },
                //    "PreferredStores": [
                //      {
                //          "$id": "6",
                //          "NetworkGroupId": 1,
                //          "GroupName": "sample string 2",
                //          "Type": "sample string 3",
                //          "LookupUrl": "sample string 4"
                //      },
                //      {
                //          "$ref": "6"
                //      }
                //    ],
                //    "JobAnswers": [
                //      {
                //          "$id": "7",
                //          "NetworkJobboardQuestionID": 1,
                //          "ParentNetworkJobboardQuestionID": 1,
                //          "LookupType": 0,
                //          "LookupId": 2,
                //          "Answer": "sample string 3",
                //          "QuestionType": "sample string 4",
                //          "Question": "sample string 5",
                //          "FieldName": "sample string 6",
                //          "DocumentID": 1
                //      },
                //      {
                //          "$ref": "7"
                //      }
                //    ],
                //    "JobTags": [
                //      1,
                //      2
                //    ],
                //    "JobTypes": [
                //      1,
                //      2
                //    ],
                //    "ResumeDocumentId": 1,
                //    "IsStoreEnquiryOn": true,
                //    "IsCheckedAlertJob": true
                //}
                //#endregion

                //#endregion

                //#region GET api/candidate/jobtags

                //#region URI Parameters
                // None
                //#endregion

                //#region Body Parameters
                // None
                //#endregion

                //#region Return data
                // Sample not available.
                //#endregion
                getJobTags: function() {
                    var url = CANDIDATE_POOL_NAMESPACE + 'jobtags';
                    return $server.get({
                        'url': url,
                    }, true).then(function(res) {
                        if (res.status === 200) {
                            $HTTPCache.clear(url);
                            return formatTagsResult(res);
                        } else {
                            return res;
                        }
                    });
                }
                //#endregion

                //#region POST api/candidate/export

                //#region URI Parameters
                // None
                //#endregion

                //#region Body Parameters
                // CadidateIds => [1, 2, 3]
                //#endregion

                //#region Return data
                //{
                //    "CadidateIds": [
                //      1,
                //      2
                //    ]
                //}
                //#endregion

                //#endregion
            };
            return candidatePoolService;
        }]);