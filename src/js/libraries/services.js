
angular.module('ui.libraries')


// File Storage factory
// ----------------------------------------

.factory('LibrariesService', ['$server', 'API_BASE_URL', 'FormatLibraries', 'Permissions', '$HTTPCache', '$q', '$notify', '$cookies', '$window', function($server, API_BASE_URL, FormatLibraries, Permissions, $HTTPCache, $q, $notify, $cookies) {

    //#region FormatFunction
    function formatCollection(res) {
        var results = res.data.Collection || res.data;

        var collectionData = {
            permissions: Permissions.formatPermissions(results.EntityActions),
            pagination: results.Pagination,
            items: results.ContainerSummaryItemResults.map(function(item) {
                return FormatLibraries.formatContainerSummaryItemResults(item);
            })
        };
        res.data = collectionData;

        return res;
    }

    // Format container 
    function formatContainer(res) {
        var result = res.data.Collection || res.data;
        var containerData = {
            detail: FormatLibraries.formatContainerDetail(result.ContainerDetail),
            permissions: Permissions.formatPermissions(result.EntityActions)
        };
        res.data = containerData;
        return res;
    }

    function formatArtifactDetail(res) {
        var results = res.data.Artifact || res.data;
        var activityItem = results.ArtifactDetail.ActivityItem;
        var splitName = results.ArtifactDetail.FileName.split('.');

        var artifactData = {
            ArtifactTitle: results.ArtifactDetail.ArtifactTitle,
            ArtifactTypeId: results.ArtifactDetail.ArtifactTypeId,
            ArtifactTypeName: results.ArtifactDetail.ArtifactTypeName,
            FileName: results.ArtifactDetail.FileName,
            Name: results.ArtifactDetail.FileName, // Need this field for sort
            Extension: splitName[splitName.length - 1],
            Thumbnail: results.ArtifactDetail.Thumbnail ? results.ArtifactDetail.Thumbnail : '',
            ArtifactId: (results.EntityActions[0] && results.EntityActions[0].ActionUrl) ? FormatLibraries.getContainerId(results.EntityActions[0].ActionUrl) : null,
            FileSize: results.ArtifactDetail.FileSize ? results.ArtifactDetail.FileSize : null,
            FormatedFileSize: FormatLibraries.formatFileSize(results.ArtifactDetail.FileSize),
            LastModified: results.ArtifactDetail.LastModified ? results.ArtifactDetail.LastModified : null,
            TextContent: results.ArtifactDetail.TextContent,
            ContainerId: results.ArtifactDetail.ContainerId ? results.ArtifactDetail.ContainerId : null,
            Visibility: results.ArtifactDetail.Visibility ? results.ArtifactDetail.Visibility : 'p',
            ViewCount: results.ArtifactDetail ? results.ArtifactDetail.ViewedCount : 0,
            CommentCount: activityItem ? activityItem.CommentCount : 0,
            DownloadCount: results.ArtifactDetail ? results.ArtifactDetail.DownloadedCount : 0,
            ShareCount: results.ArtifactDetail.SharedCount ? results.ArtifactDetail.SharedCount : 0,
            Author: results.ArtifactDetail.Owner ? FormatLibraries.formatOwner(results.ArtifactDetail.Owner) : null,
            OwnerAvatar: activityItem ? activityItem.Content.Owner.PhotoThumb : null,
            ActivityItemId: activityItem ? activityItem.Id : null,
            LikeCount: activityItem ? activityItem.LikeCount : 0,
            HasLiked: activityItem ? activityItem.HasLiked : false,
            Likes: activityItem ? activityItem.Likes : [],
            SharedGroups: FormatLibraries.formatSharedGroups(results.ArtifactDetail.SharedGroups),
            SharedRoles: FormatLibraries.formatSharedRoles(results.ArtifactDetail.SharedRoles),
            SharedUsers: FormatLibraries.formatSharedUsers(results.ArtifactDetail.SharedUsers),
            TagNames: results.ArtifactDetail.TagNames ? results.ArtifactDetail.TagNames.map(function(tag) {
                return FormatLibraries.formatTag(tag);
            }) : [],
            Permissions: Permissions.formatPermissions(results.EntityActions),
            Status: results.Status,
        };

        res.data = artifactData;
        return res;
    }

    function formatRecentArtifact(res) {
        var results = res.data.ArtifactSummaryItemResults || res.data;
        var recentArtifactData = {
            permissions: Permissions.formatPermissions(results.EntityActions),
            status: results.Status,
            pagination: results.Pagination,
            items: results.map(function(item) {
                return FormatLibraries.formatArtifactSummaryItemResults(item);
            })
        };
        res.data = recentArtifactData;
        return res;
    }

    function formatUploadUrlToClound(res) {
        var result = res.data.Data;

        var uploadUrl = {
            Status: res.data.Status,
            URL: result.UploadUrl,
            ArtifactId: result.ArtifactId,
            FileStoreId: result.FileStoreId
        };

        res.data = uploadUrl;

        return res;
    }

    function formatTags(res) {
        var results = res.data;

        if (results.length === 0) {
            return [];
        }

        var listTags = results.map(function(item) {
            return FormatLibraries.formatTag(item);
        });
        res.data = listTags;
        return res;
    }

    function formatSearchInfos(res) {
        var result = res.data;
        var infos = [];
        var resultType = ['u', 'g', 'r'];

        if (result.length === 0) {
            return infos;
        }

        infos = result.map(function(info) {
            var obj = {
                Avatar: info.PhotoThumbMini,
                Id: info.Id,
                Name: info.Name,
                Type: resultType[info.Type - 1]
            };

            return obj;
        });

        res.data = infos;

        return res;
    }

    function formatArtifactSearch(res) {
        if (res && res.data.ArtifactSummaryItemResults) {
            var result = res.data;
            var listArtifactSearch = {
                ArtifactSummary: result.ArtifactSummaryItemResults.map(function(item) {
                    return FormatLibraries.formatArtifactSummaryItemResults(item);
                })
            };

            res.data = listArtifactSearch;
            return res;
        }
        return {};
    }

    function formatArtifactLinkDetail(res) {
        if (res && res.data.ArtifactLinkDetail) {
            var result = res.data;

            var obj = {
                CurrentArtifact: result.ArtifactLinkDetail.Artifact,
                RelatedFiles: result.ArtifactLinkDetail.RelatedArtifacts ? result.ArtifactLinkDetail.RelatedArtifacts.map(function(item) {
                    return FormatLibraries.formatRelatedArtifacts(item);
                }) : [],
                Permissions: Permissions.formatPermissions(result.EntityActions)
            };

            res.data = obj;
            return res;
        }
        return {};
    }


    //#endregion


    //#region Define API
    //var LIB_URL = API_BASE_URL + 'libraries/';
    var CONTAINER_URL = API_BASE_URL + 'containers';
    var ARTIFACT_URL = API_BASE_URL + 'artifacts';
    var FILESTORAGE_URL = API_BASE_URL + 'file-storage';

    var Libraries = {

        //#region Artifact API

        //#region GET api/usercontainers?o={o}&s={s}
        //#region Parameter:
        // o: ByName = 1; ByCreatedDate = 2; ByModifiedDate = 4
        // s: true || false
        //#endregion
        //#region Return Data 
        //   {
        //    "ContainerSummaryItemResults": [
        //      {
        //          "$id": "2",
        //          "ContainerSummary": {
        //              "$id": "3",
        //              "Name": "sample string 2",
        //              "PathDisplay": "sample string 4",
        //              "ArtifactCount": 5,
        //              "ContainerCount": 6
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
        //        "$id": "4",
        //        "TotalCount": 1,
        //        "TotalPages": 2,
        //        "PageSize": 1,
        //        "Page": 1
        //    },
        //    "Status": 0
        //}
        //#endregion

        getCollection: function(page, pageSize, orderBy) {

            var url = '/interfaceTemplates/mock-data/library-collection.json';

            var query = {
                'p': page,
                'ps': pageSize,
                'rc': 0
            };

            return $server.get({
                'url': url,
                'query': query
            }).then(formatCollection);

        },
        //#endregion


        //#region GET api/artifacts/{artifactId}
        //#region Return Data
        //{
        //"ArtifactDetail": {
        //    "$id": "2",
        //    "ArtifactTitle": "sample string 2",
        //    "ArtifactTypeId": 1,
        //    "ArtifactTypeName": "sample string 3",
        //    "Visibility": "A",
        //    "ContainerName": "sample string 6",
        //    "TextContent": "sample string 9",
        //    "SharedUsers": [
        //      {
        //          "$id": "3",
        //          "MemberId": 1,
        //          "FirstName": "sample string 2",
        //          "Surname": "sample string 3",
        //          "PhotoLarge": "sample string 4",
        //          "PhotoThumb": "sample string 5",
        //          "PhotoThumbMini": "sample string 6",
        //          "RoleTitle": "sample string 7",
        //          "DefaultNetworkGroupId": 8
        //      },
        //      {
        //          "$ref": "3"
        //      }
        //    ],
        //    "SharedGroups": [
        //      {
        //          "$id": "4",
        //          "NetworkGroupId": 1,
        //          "GroupName": "sample string 2"
        //      },
        //      {
        //          "$ref": "4"
        //      }
        //    ],
        //    "SharedRoles": [
        //      {
        //          "$id": "5",
        //          "RoleId": 1,
        //          "Description": "sample string 2"
        //      },
        //      {
        //          "$ref": "5"
        //      }
        //    ],
        //    "ActivityItem": {
        //        "$id": "6",
        //        "Id": 1,
        //        "EntityKey": 1,
        //        "FeedType": 0,
        //        "PostDestination": 0,
        //        "Owner": {
        //            "$ref": "3"
        //        },
        //        "Comments": [
        //          {
        //              "$id": "7",
        //              "Id": 1,
        //              "DateCommented": "2015-12-09T14:30:02.0346694+07:00",
        //              "Comment": "sample string 3",
        //              "Owner": {
        //                  "$ref": "3"
        //              },
        //              "FeedId": 4
        //          },
        //          {
        //              "$ref": "7"
        //          }
        //        ],
        //        "ViewMembers": [
        //          {
        //              "$ref": "3"
        //          },
        //          {
        //              "$ref": "3"
        //          }
        //        ],
        //        "Likes": [
        //          {
        //              "$ref": "3"
        //          },
        //          {
        //              "$ref": "3"
        //          }
        //        ],
        //        "AttachmentCount": 2,
        //        "HasLiked": true,
        //        "IsDeleted": true,
        //        "ViewedCount": 8,
        //        "ViewUniqueCount": 9,
        //        "LikeCount": 10,
        //        "CommentCount": 11,
        //        "DatePublish": "2015-12-09T14:30:02.0356704+07:00",
        //        "AccessGrantedDate": "2015-12-09T14:30:02.0356704+07:00"
        //    }
        //  },
        //      "EntityActions": null,
        //      "Status": 0
        //}
        //#endregion
        //#region Parameter:
        // artifactId
        //#endregion
        getArtifactById: function(id) {
            var artifactId = id;
            var url = ARTIFACT_URL + '/' + artifactId;
            return $server.get({
                'url': url
            }, true).then(function(res) {
                $HTTPCache.clear(url);

                return formatArtifactDetail(res);
            });
        },
        //#endregion


        //#region GET api/artifacts/recent
        //#region Return Data
        //
        //  {
        //    "ArtifactSummaryItemResults": [
        //      {
        //          "$id": "2",
        //          "ArtifactSummary": {
        //              "$id": "3",
        //              "ArtifactId": 1,
        //              "ArtifactTitle": "sample string 2",
        //              "FileName": "sample string 3",
        //              "ArtifactTypeId": 1,
        //              "ArtifactTypeName": "sample string 5"
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
        //        "$id": "4",
        //        "TotalCount": 1,
        //        "TotalPages": 2,
        //        "PageSize": 1,
        //        "Page": 1
        //    },
        //    "Status": 0
        //}
        //
        //#endregion
        getRecentArtifact: function() {
            var url = ARTIFACT_URL + '/recent';
            return $server.get({
                'url': url,
            }, true).then(formatRecentArtifact);
        },
        //#endregion


        //#region POST api/artifacts/searchbyname
        //#region Request Data
        //  {
        //      "Keyword": "sample string 1",
        //      "TagNames": [
        //        "sample string 1",
        //        "sample string 2"
        //      ],
        //      "MemberIds": [
        //        1,
        //        2
        //      ],
        //      "GroupIds": [
        //        1,
        //        2
        //      ],
        //      "RoleIds": [
        //        1,
        //        2
        //      ],
        //      "ArtifactTypeIds": [
        //        1,
        //        2
        //      ]
        //  }
        //#endregion
        //#region Return Data
        //{
        //  "ArtifactSummaryItemResults": [
        //  {
        //      "$id": "2",
        //      "ArtifactSummary": {
        //          "$id": "3",
        //          "ArtifactId": 1,
        //          "ArtifactTitle": "sample string 2",
        //          "FileName": "sample string 3",
        //          "ArtifactTypeId": 1,
        //          "ArtifactTypeName": "sample string 5"
        //      },
        //      "EntityActions": null,
        //      "Status": 0
        //  },
        //  {
        //      "$ref": "2"
        //  }
        //],
        //      "EntityActions": null,
        //      "Pagination": {
        //          "$id": "4",
        //          "TotalCount": 1,
        //          "TotalPages": 2,
        //          "PageSize": 1,
        //          "Page": 1
        //      },
        //      "Status": 0
        //  }
        //#endregion

        artifactSearch: function(data) {
            var url = ARTIFACT_URL + '/searchbyname';
            return $server.create({
                'url': url,
                'data': data
            }).then(formatArtifactSearch);
        },
        //#endregion


        //#region PUT api/artifacts/{artifactId}
        //#region Parameter:
        // artifactId: Artifact Id
        //#endregion
        //#region Request Data
        // {
        //"ArtifactTitle": "sample string 2",
        //      "FileName": "sample string 3",
        //      "FileSize": 4,
        //      "Visibility": "sample string 6",
        //      "ContainerId": 1,
        //      "IpRestrictions": [
        //        {
        //            "$id": "2",
        //            "IPAddress": "sample string 1"
        //        },
        //        {
        //            "$ref": "2"
        //        }
        //      ],
        //      "TimeRestrictions": [
        //        {
        //            "$id": "3",
        //            "FromTime": "sample string 1",
        //            "ToTime": "sample string 2"
        //        },
        //        {
        //            "$ref": "3"
        //        }
        //      ],
        //      "SharedUsers": [
        //        1,
        //        2
        //      ],
        //      "SharedGroups": [
        //        1,
        //        2
        //      ],
        //      "SharedRoles": [
        //        1,
        //        2
        //      ],
        //      "TagNames": [
        //        "sample string 1",
        //        "sample string 2"
        //      ]
        // }
        //#endregion
        updateArtifact: function(id, obj) {
            var artifactId = id;
            var url = ARTIFACT_URL + '/' + artifactId;
            return $server.update({
                'url': url,
                'data': obj
            }).then(function(res) {                
                //if (res.status === 200 || res.status === 204) {

                //    // notify Update Successfully here
                //    $notify.add({
                //        message: 'Update file title successfully!',
                //        type: 'success',
                //        visible: true
                //    });
                //}
                return res;

            }, function(e) {
                return e;
            });
        },
        //#endregion


        //#region DELETE api/artifacts/{artifactId}
        //#region Parameter
        // artifactId: Artifact Id 
        //#endregion
        deleteArtifact: function(id) {
            var artifactId = id;
            var url = ARTIFACT_URL + '/' + artifactId;

            return $server.remove({
                'url': url
            }).then(function(res) {
                if ((res.status === 200 || res.status === 204) && !res.data.Errors) {
                    // notify delete file Successfully here
                    $notify.add({
                        message: 'Delete file successfully!',
                        type: 'success',
                        visible: true
                    });
                }
                return res;
            });
        },
        //#endregion


        //#region GET api/artifacts/{artifactId}/relatedItems
        //#region Paramater:
        // artifactId: Artifact Id
        //#endregion
        //#region Return Data
        //{
        //  "ArtifactLinkDetail": {
        //    "$id": "2",
        //    "Artifact": {
        //        "$id": "3",
        //        "ArtifactId": 1,
        //        "ArtifactTitle": "sample string 2",
        //        "FileName": "sample string 3",
        //        "ArtifactTypeId": 1,
        //        "ArtifactTypeName": "sample string 5"
        //    },
        //    "RelatedArtifacts": [
        //      {
        //          "$id": "4",
        //          "ArtifactSummary": {
        //              "$ref": "3"
        //          },
        //          "EntityActions": null,
        //          "Status": 0
        //      },
        //      {
        //          "$ref": "4"
        //      }
        //    ]
        //   },
        //      "EntityActions": null,
        //      "Status": 0
        //}
        //#endregion
        getRelatedArtifacts: function(id) {
            var artifactId = id;
            var url = ARTIFACT_URL + '/' + artifactId + '/relatedItems';
            return $server.get({
                'url': url
            }).then(function(res) {
                $HTTPCache.clear(url);
                return formatArtifactLinkDetail(res);
            });
        },
        //#endregion


        //#region POST api/artifacts/{artifactId}/relatedItems
        //#region Parameter
        // - artifactId: Artifact Identification - Type: Integer
        // - linkItemId: link Item Id            - Type: Integer
        //#endregion
        addRelatedItem: function(artId, linkArtifactIds) {
            var artifactId = artId;
            var url = ARTIFACT_URL + '/' + artifactId + '/relatedItems';
            return $server.create({
                'url': url,
                'data': linkArtifactIds
            }).then(function(res) {
                if (res.status === 200 || res.status === 204) {
                    // notify link artifact Successfully here
                    $notify.add({
                        message: 'Linked artifact successfully!',
                        type: 'success',
                        visible: true
                    });
                }
            });
        },
        //#endregion 


        //#region DELETE api/artifacts/{artifactId}/relatedItems/{linkItemId}
        //#region Parameter
        // - artifactId: Artifact Identification - Type: Integer
        // - linkItemId: link Item Id            - Type: Integer
        //#endregion
        deleteRelatedItems: function(artId, linkId) {
            var artifactId = artId;
            var linkItemId = linkId;
            var url = ARTIFACT_URL + '/' + artifactId + '/relatedItems/' + linkItemId;
            return $server.remove({
                'url': url
            }).then(function(res) {
                $HTTPCache.clear(url);
                if (res.status === 200 || res.status === 204) {
                    // notify delete link artifact successfully here
                    $notify.add({
                        message: 'Removed linked artifact successfully!',
                        type: 'success',
                        visible: true
                    });
                }
            });
        },
        //#endregion


        //#endregion


        //#region Containers API

        //#region GET api/systemcontainers -- Get System Containers
        //#region Return Data
        //{
        //    "ContainerSummaryItemResults": [
        //    {
        //        "$id": "2",
        //        "ContainerSummary": {
        //            "$id": "3",
        //            "Name": "sample string 2",
        //            "PathDisplay": "sample string 4",
        //            "ArtifactCount": 5,
        //            "ContainerCount": 6
        //        },
        //        "EntityActions": null,
        //        "Status": 0
        //    },
        //    {
        //        "$ref": "2"
        //    }
        //],
        //    "EntityActions": null,
        //    "Pagination": {
        //    "$id": "4",
        //        "TotalCount": 1,
        //        "TotalPages": 2,
        //        "PageSize": 1,
        //        "Page": 1
        //},
        //    "Status": 0
        //}
        //#endregion
        getSystemContainer: function() {
            return $server.get({
                'url': API_BASE_URL + '/' + 'systemcontainers',
            }).then(function(res) {
                if (!res.data.Errors) {
                    // Format return data
                    return formatCollection(res);
                }
                return res;
            });
        },
        //#endregion

        //#region GET api/usercontainers?o={o}&s={s} -- Get User Containers
        //#region Parameter:
        // o: ByName = 1; ByCreatedDate = 2; ByModifiedDate = 4
        // s: true || false
        //#endregion
        //#region Return Data
        //{
        //    "ContainerSummaryItemResults": [
        //    {
        //        "$id": "2",
        //        "ContainerSummary": {
        //            "$id": "3",
        //            "Name": "sample string 2",
        //            "PathDisplay": "sample string 4",
        //            "ArtifactCount": 5,
        //            "ContainerCount": 6
        //        },
        //        "EntityActions": null,
        //        "Status": 0
        //    },
        //    {
        //        "$ref": "2"
        //    }
        //],
        //    "EntityActions": null,
        //    "Pagination": {
        //    "$id": "4",
        //        "TotalCount": 1,
        //        "TotalPages": 2,
        //        "PageSize": 1,
        //        "Page": 1
        //},
        //    "Status": 0
        //}
        //#endregion
        getUserContainer: function(orderBy, shared) {

            return $server.get({
                'url': API_BASE_URL + 'usercontainers',
                'query': {
                    'o': orderBy,
                    's': shared
                }
            }, true).then(function(res) {
                if (res.status === 204 || res.data === null) {
                    return res;
                } else {
                    return formatCollection(res);
                }
            });
        },
        //#endregion

        //#region GET api/containers/{containerId} --Get Container By Id
        getContainerById: function(containerId) {
            return $server.get({
                'url': CONTAINER_URL + '/' + containerId,
            }, true).then(function(res) {
                if (!res.data.Errors) {
                    // Format return data
                    return formatContainer(res);
                }
                return res;
            });
        },
        //#endregion

        //#region POST api/containers --Create a user container
        //#region Request format
        //{
        //    "Name": "sample string 2",
        //    "Visibility": "sample string 3",
        //    "ParentContainerId": 1,
        //    "Description": "sample string 4",
        //    "SharedUsers": [
        //    1,
        //    2
        //],
        //    "SharedGroups": [
        //    1,
        //    2
        //],
        //    "SharedRoles": [
        //    1,
        //    2
        //]
        //}
        //#endregion
        //#region Return data
        //Do not declare
        //#endregion
        createUserContainer: function(containerObj) {
            return $server.create({
                'url': CONTAINER_URL,
                'data': containerObj
            }).then(function(res) {
                return FormatLibraries.formatContainerSummaryItemResults(res.data);
            });
        },
        //#endregion

        //#region PUT api/containers/{containerId} --Update a user container
        //#region Parameter:
        // containerId:Container Identification
        //#endregion
        //#region Request format
        //  {
        //"Name": "sample string 2",
        //      "Visibility": "sample string 3",
        //      "ParentContainerId": 1,
        //      "Description": "sample string 4",
        //      "SharedUsers": [
        //        1,
        //        2
        //      ],
        //      "SharedGroups": [
        //        1,
        //        2
        //      ],
        //      "SharedRoles": [
        //        1,
        //        2
        //      ]
        //  }
        //#endregion
        //#region Return data
        //Do not declare
        //#endregion
        updateUserContainer: function(containerId, containerObj) {
            return $server.update({
                'url': CONTAINER_URL + '/' + containerId,
                'data': containerObj
            }).then(function(res) {
                return res;
            });
        },
        //#endregion

        //#region DELETE api/containers/{containerId} -- Delete a user container
        //#region Parameter:
        // containerId:Container Identification
        //#endregion
        //#region Return data
        //Do not declare
        //#endregion
        deleteUserContainer: function(containerId) {
            return $server.remove({
                'url': CONTAINER_URL + '/' + containerId
            }).then(function(res) {
                if ((res.status === 200 || res.status === 204) && !res.data.Errors) {
                    // notify Update Successfully here
                    $notify.add({
                        message: 'Delete folder successfully!',
                        type: 'success',
                        visible: true
                    });
                }
                return res;
            });
        },
        //#endregion

        //#endregion

        //#region Upload/Download API

        //#region POST api/artifacts/getUploadUrl

        //#region Parameter
        //FileName: file name of file upload
        //FileSize: file size of file upload (KB)
        //ContainerId: id of folder contain file uoload
        //FileType: 
        // 0: Image
        // 1: Other
        //#endregion

        //#region Return Data
        //{
        //  "UploadUrl": "sample string 1",
        //  "ArtifactId": 2,
        //  "FileStoreId": 3
        //}
        //#endregion

        getUploadUrl: function(fileObj) {
            var url = ARTIFACT_URL + '/getUploadUrl';
            return $server.create({
                'url': url,
                'data': fileObj
            }).then(formatUploadUrlToClound);
        },

        //#endregion

        //#region POST api/artifacts/getUploadUrlToCloud

        //#region Parameter
        //FileName: file name of file upload
        //FileSize: file size of file upload (KB)
        //ContainerId: id of folder contain file uoload
        //FileType: 
        // 0: Image
        // 1: Other
        //#endregion

        //#region Return Data
        //{
        //  "UploadUrl": "sample string 1",
        //  "ArtifactId": 2,
        //  "FileStoreId": 3
        //}
        //#endregion

        getUploadUrlToCloud: function(fileObj) {
            var url = ARTIFACT_URL + '/getUploadUrlToCloud';
            return $server.create({
                'url': url,
                'data': fileObj
            }).then(formatUploadUrlToClound);
        },

        //#endregion

        //#region PUT api/file-storage/upload/{uploadKey}
        //#region Parameter:
        // uploadKey: Document/Artifact Key
        //#endregion

        //#region Return Data
        // IHttpActionResult
        //#endregion

        uploadFile: function(obj) {
            var deferred = $q.defer();

            var xhr = new XMLHttpRequest();
            var data = new FormData();

            if (xhr.upload) {
                data.append('data', obj.file, obj.name);

                //File received/failed
                xhr.onreadystatechange = function(e) {
                    if (xhr.readyState === 4) {
                        deferred.resolve(e);
                    }
                };

                // Progress
                xhr.upload.addEventListener('progress', obj.progress, false);

                var authToken = 'Sherpa.aspxauth=' + $cookies.get('Sherpa.aspxauth');

                // Upload
                xhr.open(obj.action, obj.URL, true);
                xhr.setRequestHeader('X_FILENAME', obj.name);

                if (authToken) {
                    xhr.setRequestHeader('Authorization', authToken);
                }

                xhr.send(data);

            } else {
                deferred.reject();
            }

            return {
                abort: function() {
                    return xhr.abort();
                },
                responseUpload: function() {
                    return xhr.status;
                },
                promise: deferred.promise
            };
        },
        //#endregion

        //#region PUT api/artifacts/{artifactId}/setUploadStatus/{status}
        //#region Parameter:
        //artifactId: artifactId inside response of api/file-storage/getUploadUrlToClound
        //status: 
        // 1: New
        // 2: Processing
        // 3: Successed
        // 4: Failed
        //#endregion

        //#region Return Data
        //IHttpActionResult
        //#endregion

        setUploadStatus: function(artifactId, status) {
            var url = ARTIFACT_URL + '/' + artifactId + '/setUploadStatus/' + status;

            return $server.update({
                'url': url,
                'data': ''
            }).then(function(res) {
                $HTTPCache.clear(url);

                return res;
            });
        },
        //#endregion

        //#region GET api/artifacts/{artifactId}/getDownloadUrl
        //#region Parameter
        //artifactId: artifactId of file download
        //#endregion

        //#region Return Data
        //{
        //    "Url": "sample string 1",
        //    "Key": "sample string 2"
        //}
        //#endregion

        getDownloadUrl: function(artifactId) {
            var url = ARTIFACT_URL + '/' + artifactId + '/getDownloadUrl';

            return $server.get({
                'url': url,
                'data': ''
            }).then(function(response) {
                $HTTPCache.clear(url);
                return response;
            });
        },
        //#endregion

        //#region GET api/artifacts/{artifactId}/getDownloadUrlFromCloud
        //#region Parameter
        //artifactId: artifactId of file download
        //#endregion

        //#region Return Data
        //{
        //    "Url": "sample string 1",
        //    "Key": "sample string 2"
        //}
        //#endregion

        getDownloadUrlFromCloud: function(artifactId) {
            var url = ARTIFACT_URL + '/' + artifactId + '/getDownloadUrlFromCloud';

            return $server.get({
                'url': url,
                'data': ''
            }).then(function(response) {
                $HTTPCache.clear(url);
                return response;
            });
        },
        //#endregion

        //#region GET api/file-storage/download/{downloadKey}
        //#region Parameter
        //downloadKey: Key response from POST api/artifacts/{artifactId}/getDownloadUrlFromCloud
        //#endregion

        //#region Return Data
        //HttpResponseMessage:
        //Version
        //Content
        //StatusCode
        //ReasonPhrase
        //Headers
        //RequestMessage
        //IsSuccessStatusCode
        //#endregion
        downloadFile: function(downloadKey) {
            var url = FILESTORAGE_URL + '/download/' + downloadKey;

            return $server.get({
                'url': url,
                'query': ''
            }).then(function(res) {
                $HTTPCache.clear(url);
                return res;
            });
        },
        //#endregion

        //#region PUT api/artifacts/{downloadKey}/setDownloadStatus/{status}
        //#region Parameter:
        //downloadKey: downloadKey of api POST api/artifacts/{artifactId}/getDownloadUrlFromCloud
        //status:
        // -1: Expired
        // 0: Downloading
        // 1: Finished
        // 2: Fail
        //#endregion

        //#region Return Data
        //IHttpActionResult
        //#endregion

        setDownloadStatus: function(downloadKey, status) {
            var url = ARTIFACT_URL + '/' + downloadKey + '/setDownloadStatus/' + status;

            return $server.update({
                'url': url,
                'data': ''
            }).then(function(res) {
                $HTTPCache.clear(url);
                return res;
            });
        },
        //#endregion

        //#endregion

        //#region GET api/tags
        //#region Return Data
        //[
        //    {
        //        "$id": "1",
        //        "TagName": "TagNames Vu Test 1"
        //    },
        //    {
        //        "$id": "2",
        //        "TagName": "TagNames Vu Test 2"
        //    },
        //    {
        //        "$id": "3",
        //        "TagName": "TagNames Vu Test 3"
        //    },
        //    {
        //        "$id": "4",
        //        "TagName": "TagNames Vu Test 4"
        //    }
        //]
        //#endregion

        getTags: function() {
            var url = API_BASE_URL + 'tags';

            return $server.get({
                'url': url,
            }).then(function(res) {
                $HTTPCache.clear(url);
                return formatTags(res);
            });
        },

        // GET api/tags/search?s={s}&p={p}&ps={ps}
        searchTagByString: function(obj) {
            var url = API_BASE_URL + '/tags/search';
            var query = {
                's': obj.str,
                'p': obj.p,
                'ps': obj.ps
            };

            return $server.get({
                'url': url,
                'query': query
            }).then(function(res) {
                $HTTPCache.clear(url);
                return res;
            }, function(err) {
                return err;
            });
        },

        //#endregion

        //#region GET api/searchinfos?s={s}&p={p}&ps={ps}
        //#region Parameter:
        // s: Name of member, group, role
        // p: Page number (Default = 1)
        // ps: Records per page (Default = 20, Max = 200)
        //#endregion

        //#region Return Data
        //{
        //    "$id": "1",
        //    "Id": 1,
        //    "Name": "sample string 2",
        //    "Type": 1
        //},
        //  {
        //      "$ref": "1"
        //  }
        //#endregion

        searchInfos: function(obj) {
            var url = API_BASE_URL + 'searchinfos';
            var query = {
                's': obj.s,
                'p': obj.p,
                'ps': obj.ps
            };

            return $server.get({
                'url': url,
                'query': query
            }).then(function(res) {
                $HTTPCache.clear(url);
                return formatSearchInfos(res);
            });
        },
        //#endregion

        //#region GET api/artifacts/{artifactId}/getStreamingUrl
        //#region Parameter
        // artifactId
        //#endregion

        //#region Return data
        //{
        //    "Url": "sample string 1",
        //    "Key": "sample string 2"
        //}
        //#endregion

        getStreamingUrl: function(artifactId) {
            var url = ARTIFACT_URL + '/' + artifactId + '/getStreamingUrl';

            return $server.get({
                'url': url,
                'data': ''
            }).then(function(response) {
                $HTTPCache.clear(url);
                return response;
            });
        },

        //#endregion

        //#region GET api/artifacts/{artifactId}/getViewUrl
        //#region Parameter
        // artifactId
        //#endregion

        //#region Return data
        //{
        //    "Url": "sample string 1",
        //    "Key": "sample string 2"
        //}
        //#endregion

        getViewUrl: function(artifactId) {
            var url = ARTIFACT_URL + '/' + artifactId + '/getViewUrl';

            return $server.get({
                'url': url,
                'query': {
                    t: 'pdf'
                },
                'data': ''
            }).then(function(response) {
                $HTTPCache.clear(url);
                return response;
            });
    }

    //#endregion
    };

    return Libraries;
    //#endregion

}]);