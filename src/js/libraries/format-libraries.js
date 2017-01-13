angular.module('ui.libraries')

.service('FormatLibraries', ['Permissions', function(Permissions) {

    //RULE :Naming each property must be same with name of property which return from api.(Do not lower case or upper case)

    //#region Containers
    //#region Function formatContainerSummaryItemResults
    // Sample data
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
    //      }

    function formatContainerSummaryItemResults(item) {
        var formatItem = {};
        // Hard code containerId = 4 for the folders in my space.
        if (item) {
            formatItem = {
                Name: item.ContainerSummary.Name,
                PathDisplay: item.ContainerSummary.PathDisplay,
                ArtifactCount: item.ContainerSummary.ArtifactCount,
                ContainerCount: item.ContainerSummary.NameContainerCount,
                ContainerId: item.EntityActions[0].ActionUrl ? getContainerId(item.EntityActions[0].ActionUrl) : null,
                LastModified: item.ContainerSummary.LastModified,
                Author: item.ContainerSummary.Owner ? item.ContainerSummary.Owner.FirstName + ' ' + item.ContainerSummary.Owner.Surname : null,
                Permissions: Permissions.formatPermissions(item.EntityActions),
                IsContainer: true,
                ParentContainerId: item.ContainerSummary.ParentContainerId ? item.ContainerSummary.ParentContainerId : null,
            };
        }
        return formatItem;
    }

    // Format Tag
    function formatTag(tag) {
        var t = {};
        if (tag) {
            t = {
                TagId: tag.TagId,
                TagName: tag.TagName,
                label: tag.TagName
            };
        }
        return t;
    }

    // Splice string ACtionUrl to get container Id
    function getContainerId(url) {
        if (url) {
            var parts = url.split('/');
            var result = parts[parts.length - 1];
            return  parseInt(result);
        }
        return null;
    }

    // Format sub container
    function formatSubContainer(item) {
        var c = {};
        if (item) {
            c = {
                Name: item.ContainerSummary.Name,
                PathDisplay: item.ContainerSummary.PathDisplay,
                ContainerType: item.ContainerType ? item.ContainerType : 4,
                ContainerId: item.EntityActions[0].ActionUrl ? getContainerId(item.EntityActions[0].ActionUrl) : null,
                Status: item.Status,
                IsContainer: true
            };
            return c;
        }
        return null;
    }

    //#endregion

    //#region Format Container Detail
    //#region Sample
    //    "ContainerDetail": {
    //        "$id": "2",
    //        "Name": "sample string 2",
    //        "ContainerType": 1,
    //        "Path": "sample string 5",
    //        "PathDisplay": "sample string 6",
    //        "Description": "sample string 7",
    //        "ArtifactCount": 9,
    //        "ContainerCount": 10,
    //        "SubArtifacts": [
    //          {
    //              "$id": "3",
    //              "ArtifactSummary": {
    //                  "$id": "4",
    //                  "ArtifactId": 1,
    //                  "ArtifactTitle": "sample string 2",
    //                  "FileName": "sample string 3",
    //                  "ArtifactTypeId": 1,
    //                  "ArtifactTypeName": "sample string 5"
    //              },
    //              "EntityActions": null,
    //              "Status": 0
    //          },
    //          {
    //              "$ref": "3"
    //          }
    //        ],
    //        "SubContainers": [
    //          {
    //              "$id": "5",
    //              "ContainerSummary": {
    //                  "$id": "6",
    //                  "Name": "sample string 2",
    //                  "PathDisplay": "sample string 4",
    //                  "ArtifactCount": 5,
    //                  "ContainerCount": 6
    //              },
    //              "EntityActions": null,
    //              "Status": 0
    //          },
    //          {
    //              "$ref": "5"
    //          }
    //        ],
    //        "SharedUsers": [
    //          {
    //              "$id": "7",
    //              "MemberId": 1,
    //              "FirstName": "sample string 2",
    //              "Surname": "sample string 3",
    //              "PhotoLarge": "sample string 4",
    //              "PhotoThumb": "sample string 5",
    //              "PhotoThumbMini": "sample string 6",
    //              "RoleTitle": "sample string 7",
    //              "DefaultNetworkGroupId": 8
    //          },
    //          {
    //              "$ref": "7"
    //          }
    //        ],
    //        "SharedGroups": [
    //          {
    //              "$id": "8",
    //              "NetworkGroupId": 1,
    //              "GroupName": "sample string 2"
    //          },
    //          {
    //              "$ref": "8"
    //          }
    //        ],
    //        "SharedRoles": [
    //          {
    //              "$id": "9",
    //              "RoleId": 1,
    //              "Description": "sample string 2"
    //          },
    //          {
    //              "$ref": "9"
    //          }
    //        ]
    //    }
    //#endregion
    function formatContainerDetail(item) {
        var result = {};
        if (item) {
            result = {
                Name: item.Name,
                Visibility: item.Visibility ? item.Visibility : 'p',
                ContainerType: item.ContainerType,
                ContainerId: item.ContainerId ? item.ContainerId : null,
                ParentId: item.ParentId ? parseInt(getContainerId(item.ParentId)) : null,
                Description: item.Description ? item.Description : null,
                Path: item.Path,
                PathDisplay: item.PathDisplay,
                ArtifactCount: item.ArtifactCount,
                ContainerCount: item.ContainerCount,
                OwnerName: item.OwnerName ? item.OwnerName : null,
                ArtifactItems: item.ArtifactItems ? item.ArtifactItems.map(function(artifact) {
                    //return formatArtifact(artifact);//waiting for Trieu write the module
                    return formatArtifactSummaryItemResults(artifact);
                }) : [],
                SubContainers: item.SubContainers ? item.SubContainers.map(function(containerItem) {
                    return formatContainerSummaryItemResults(containerItem);
                }) : [],
                SharedUsers: item.SharedUsers ? item.SharedUsers.map(function(userItem) {
                    return formatSharedUser(userItem);
                }) : [],
                SharedGroups: item.SharedGroups ? item.SharedGroups.map(function(groupItem) {
                    return formatSharedGroup(groupItem);
                }) : [],
                SharedRoles: item.SharedRoles ? item.SharedRoles.map(function(roleItem) {
                    return formatSharedRole(roleItem);
                }) : [],
                TagNames: item.TagNames ? item.TagNames.map(function(tag) {
                    return formatTag(tag);
                }) : []
            };
        }
        return result;
    }

    //#region Format User
    //Sample data
    //        {
    //            "$id": "7",
    //            "MemberId": 1,
    //            "FirstName": "sample string 2",
    //            "Surname": "sample string 3",
    //            "PhotoLarge": "sample string 4",
    //            "PhotoThumb": "sample string 5",
    //            "PhotoThumbMini": "sample string 6",
    //            "RoleTitle": "sample string 7",
    //            "DefaultNetworkGroupId": 8
    //        }
    function formatUser(userItem) {
        var result = {};
        if (userItem) {
            result = {
                MemberId: userItem.MemberId,
                FirstName: userItem.FirstName,
                Surname: userItem.Surname,
                PhotoLarge: userItem.PhotoLarge,
                PhotoThumb: userItem.PhotoThumb,
                PhotoThumbMini: userItem.PhotoThumbMini,
                RoleTitle: userItem.RoleTitle,
                DefaultNetworkGroupId: userItem.DefaultNetworkGroupId
            };
        }
        return result;
    }
    //#endregion

    //#region Format Shared User
    //Sample data
    //        {
    //            "$id": "7",
    //            "MemberId": 1,
    //            "FirstName": "sample string 2",
    //            "Surname": "sample string 3",
    //            "PhotoLarge": "sample string 4",
    //            "PhotoThumb": "sample string 5",
    //            "PhotoThumbMini": "sample string 6",
    //            "RoleTitle": "sample string 7",
    //            "DefaultNetworkGroupId": 8
    //        }
    function formatSharedUser(userItem) {
        var result = {};
        if (userItem) {
            result = {
                Id: userItem.MemberId,
                Name: userItem.FirstName + ' ' + userItem.Surname,
                Avatar: userItem.PhotoThumbMini,
                Type: 'u'
            };
        }
        return result;
    }
    //#endregion

    //#region Format group
    //Sample data
    //{
    //    "$id": "8",
    //    "NetworkGroupId": 1,
    //    "GroupName": "sample string 2"
    //},
    function formatGroup(groupItem) {
        var result = {};
        if (groupItem) {
            result = {
                NetworkGroupId: groupItem.NetworkGroupId,
                GroupName: groupItem.GroupName
            };
        }
        return result;
    }
    //#endregion

    //#region Format Shared group
    //Sample data
    //{
    //    "$id": "8",
    //    "NetworkGroupId": 1,
    //    "GroupName": "sample string 2"
    //},
    function formatSharedGroup(groupItem) {
        var result = {};
        if (groupItem) {
            result = {
                Id: groupItem.NetworkGroupId,
                Name: groupItem.GroupName,
                Avatar: '',
                Type: 'g'
            };
        }
        return result;
    }
    //#endregion

    //#region Format Role
    //Sample data
    //{
    //    "$id": "9",
    //    "RoleId": 1,
    //    "Description": "sample string 2"
    //},
    function formatRole(roleItem) {
        var result = {};
        if (roleItem) {
            result = {
                RoleId: roleItem.RoleId,
                Description: roleItem.Description
            };
        }
        return result;
    }
    //#endregion

    //#region Format Shared Role
    //Sample data
    //{
    //    "$id": "9",
    //    "RoleId": 1,
    //    "Description": "sample string 2"
    //},
    function formatSharedRole(roleItem) {
        var result = {};
        if (roleItem) {
            result = {
                Id: roleItem.RoleId,
                Name: roleItem.Description,
                Avatar: '',
                Type: 'r'
            };
        }
        return result;
    }
    //#endregion

    //#endregion
    //#endregion

    //#region Artifact
    //#region formatOwner
    function formatOwner(owner) {
        if (owner) {
            return owner.FirstName + ' ' + owner.Surname;
        } else {
            return '';
        }

    }
    //#endregion

    //#region Format SharedGroups
    // Sample data
    //  {
    //      "$id": "4",
    //      "NetworkGroupId": 1,
    //      "GroupName": "sample string 2"
    //  }
    function formatSharedGroups(groups) {
        if (groups) {
            var formatGroups = [];
            angular.forEach(groups, function(group, key) {
                var temp = {};
                temp.Name = group.GroupName;
                temp.Avatar = null;
                temp.Id = group.NetworkGroupId;
                temp.Type = 'g';
                formatGroups.push(temp);
            });
            return formatGroups;
        } else {
            return [];
        }
    }
    //#endregion

    //#region Format SharedRoles
    // Sample data
    //  {
    //    "$id": "5",
    //    "RoleId": 1,
    //    "Description": "sample string 2"
    //  }
    function formatSharedRoles(roles) {
        if (roles) {
            var formatRoles = [];
            angular.forEach(roles, function(role, key) {
                var temp = {};
                temp.Name = role.Description;
                temp.Avatar = null;
                temp.Id = role.RoleId;
                temp.Type = 'r';
                formatRoles.push(temp);
            });
            return formatRoles;
        } else {
            return [];
        }
    }
    //#endregion

    //#region Format SharedUsers
    // Sample data
    //  {
    //    "$id": "3",
    //    "MemberId": 1,
    //    "FirstName": "sample string 2",
    //    "Surname": "sample string 3",
    //    "PhotoLarge": "sample string 4",
    //    "PhotoThumb": "sample string 5",
    //    "PhotoThumbMini": "sample string 6",
    //    "RoleTitle": "sample string 7",
    //    "DefaultNetworkGroupId": 8
    //  }
    function formatSharedUsers(users) {
        if (users) {
            var formatUsers = [];
            angular.forEach(users, function(user, key) {
                var temp = {};
                temp.Name = user.FirstName + ' ' + user.Surname;
                temp.Avatar = user.PhotoThumbMini;
                temp.Id = user.MemberId;
                temp.Type = 'u';
                formatUsers.push(temp);
            });
            return formatUsers;
        } else {
            return [];
        }
    }
    //#endregion

    //#region formatArtifactSummaryItemResults
    //Json Format
    //{
    //"$id": "2",
    //    "ArtifactSummary": {
    //    "$id": "3",
    //    "ArtifactId": 27582,
    //    "ArtifactTitle": "VuTest.jpg",
    //    "FileName": "VuTest.jpg",
    //    "FileSize": 2,
    //    "Owner": {
    //        "$id": "4",
    //        "MemberId": 247682,
    //        "FirstName": "Sherpa",
    //        "Surname": "Admin",
    //        "PhotoLarge": null,
    //        "PhotoThumb": null,
    //        "PhotoThumbMini": null,
    //        "RoleTitle": null,
    //        "DefaultNetworkGroupId": 11038
    //    },
    //    "ArtifactTypeId": 2,
    //    "ArtifactTypeName": "Image",
    //    "Thumbnail": "",
    //    "Visibility": "h",
    //    "LastModified": "2015-12-04T08:25:22.15",
    //    "DisplayPath": "/Library"
    //     },
    //    "EntityActions": [
    //      {
    //          "$id": "4",
    //          "Id": "fbf4bdc9-873a-4b6f-9993-7bf0d8a0a15f",
    //          "Code": 3518,
    //          "Caption": "ViewArtifactInfo",
    //          "Description": "GET",
    //          "ActionUrl": "http://localhost:8888/Api/artifacts/27582",
    //          "Children": null
    //      },
    //      {
    //          "$id": "5",
    //          "Id": "8cbf655e-906f-4836-949b-b0bacd0828b6",
    //          "Code": 3532,
    //          "Caption": "PostRelatedArtifacts",
    //          "Description": "POST",
    //          "ActionUrl": "http://localhost:8888/Api/artifacts/27582/relatedItems",
    //          "Children": null
    //      },
    //      {
    //          "$id": "6",
    //          "Id": "be513a5e-d645-4e74-972f-4c9c6e9f028c",
    //          "Code": 3520,
    //          "Caption": "DownloadArtifactFile",
    //          "Description": "GET",
    //          "ActionUrl": "http://localhost:8888/Api/artifacts/27582/getDownloadUrlFromCloud",
    //          "Children": null
    //      },
    //      {
    //          "$id": "7",
    //          "Id": "83ce63b5-b74b-46fd-856e-7c211639fd62",
    //          "Code": 3516,
    //          "Caption": "UpdateArtifact",
    //          "Description": "PUT",
    //          "ActionUrl": "http://localhost:8888/Api/artifacts/27582",
    //          "Children": null
    //      },
    //      {
    //          "$id": "8",
    //          "Id": "b24bc134-25a9-4f86-9284-049735ad7288",
    //          "Code": 3517,
    //          "Caption": "DeleteArtifact",
    //          "Description": "DELETE",
    //          "ActionUrl": "http://localhost:8888/Api/artifacts/27582",
    //          "Children": null
    //      }
    //    ],
    //    "Status": 0
    //}
    function formatArtifactSummaryItemResults(item) {
        var obj = {};
        var splitName = item.ArtifactSummary.FileName.split('.');
        if (item) {
            obj = {
                ArtifactId: item.ArtifactSummary.ArtifactId,
                Thumbnail: item.ArtifactSummary.Thumbnail ? item.ArtifactSummary.Thumbnail : '',
                ArtifactTypeName: item.ArtifactSummary.ArtifactTypeName,
                ArtifactTypeId: item.ArtifactSummary.ArtifactTypeId,
                Extension: splitName[splitName.length -1],
                FileName: item.ArtifactSummary.FileName,
                Name: item.ArtifactSummary.FileName,
                ArtifactTitle: item.ArtifactSummary.ArtifactTitle,
                Author: item.ArtifactSummary.Owner ? item.ArtifactSummary.Owner.FirstName + ' ' + item.ArtifactSummary.Owner.Surname : null,
                FilePath: item.ArtifactSummary.DisplayPath? item.ArtifactSummary.DisplayPath : '',
                LastModified: item.ArtifactSummary.LastModified ? item.ArtifactSummary.LastModified : null,
                FileSize: item.ArtifactSummary.FileSize ? item.ArtifactSummary.FileSize : null,
                FormatedFileSize: formatFileSize(item.ArtifactSummary.FileSize),
                Permissions: Permissions.formatPermissions(item.EntityActions),
                DownloadCount: item.ArtifactSummary.DownloadedCount,
                ViewCount: item.ArtifactSummary.ViewedCount,
                ShareCount: item.ArtifactSummary.SharedCount,
                OwnerAvatar: item.ArtifactSummary.Owner.PhotoThumb ? item.ArtifactSummary.Owner.PhotoThumb : null,
                TagNames: item.ArtifactSummary.TagNames ? item.ArtifactSummary.TagNames.map(function(tag) {
                    return formatTag(tag);
                }) : []
            };
        }

        return obj;
    }
    //#endregion

    //#region formatRelatedArtifacts
    //JSON Format
    // {
    //    "$id": "4",
    //    "ArtifactSummary": {
    //        "ArtifactId": 1,
    //        "ArtifactTitle": "sample string 2",
    //        "FileName": "sample string 3",
    //        "ArtifactTypeId": 1,
    //        "ArtifactTypeName": "sample string 5"
    //    },
    //    "EntityActions": null,
    //    "Status": 0
    //},
    function formatRelatedArtifacts(item) {
        var obj = {};
        if (item) {
            obj = {
                ArtifactId: item.ArtifactSummary.ArtifactId,
                ArtifactTypeName: item.ArtifactSummary.ArtifactTypeName,
                ArtifactTitle: item.ArtifactSummary.ArtifactTitle,
                FileName: item.ArtifactSummary.FileName,
                Author: item.ArtifactSummary.Owner ? item.ArtifactSummary.Owner.FirstName + ' ' + item.ArtifactSummary.Owner.Surname : null,
                FilePath: 'My Space/Gallery/', // hard code here  
                Permissions: Permissions.formatPermissions(item.EntityActions),
                Thumbnail: item.ArtifactSummary.Thumbnail,
                LastModified: item.ArtifactSummary.LastModified,
                OwnerAvatar: item.ArtifactSummary.Owner ? item.ArtifactSummary.Owner.PhotoThumb : null,
                DownloadCount: item.ArtifactSummary ? item.ArtifactSummary.DownloadedCount : 0,
                ViewCount: item.ArtifactSummary ? item.ArtifactSummary.ViewedCount : 0,
                ShareCount: item.ArtifactSummary ? item.ArtifactSummary.SharedCount : 0
            };
        }
        return obj;
    }
    //#endregion

    //#region formatFileSize
    function formatFileSize(size) { // size is byte

        if (size < 1024) {
            return Math.floor(size / 1024).toFixed(2) + ' KB';
        }
        else if (size < 1048576 && size >= 1024) {
            return Math.floor(size / 1024).toFixed(0) + ' KB';
        } else if (size >= 1048576) {
            return Math.floor(size / 1048576).toFixed(0) + ' MB';
        }
    }
    //#endregion

    //#endregion

    //#region File-Storage
    //#endregion

    return {
        formatContainerSummaryItemResults: formatContainerSummaryItemResults,
        formatTag: formatTag,
        formatSubContainer: formatSubContainer,
        formatOwner: formatOwner,
        formatSharedGroups: formatSharedGroups,
        formatSharedRoles: formatSharedRoles,
        formatSharedUsers: formatSharedUsers,
        formatArtifactSummaryItemResults: formatArtifactSummaryItemResults,
        formatRelatedArtifacts: formatRelatedArtifacts,
        formatContainerDetail: formatContainerDetail,
        getContainerId: getContainerId,
        formatFileSize: formatFileSize
    };
}]);