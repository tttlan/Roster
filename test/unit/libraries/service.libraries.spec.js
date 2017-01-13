describe('Unit: Services: Libraries', function () {
    var LibrariesService, $rootScope, $server, FormatLibraries, Permissions, $HTTPCache,
        $notify, $cookies, $window, $q,  API_BASE_URL,
        ARTIFACT_URL, spyOnGet, spyOnCreate, spyOnUpdate, spyOnRemove, spyOnFormatLibrariesFormatTag;
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
    beforeEach(function () {
        module('sherpa');
        inject(function ($injector, _$rootScope_, _$q_, _$notify_, _$window_, _$cookies_, _$HTTPCache_) {
            $rootScope = _$rootScope_;
            $q = _$q_;
            LibrariesService = $injector.get('LibrariesService');
            $notify = _$notify_;
            $window = _$window_;
            $cookies = _$cookies_;
            $HTTPCache = _$HTTPCache_;
            $server = $injector.get('$server');
            FormatLibraries = $injector.get('FormatLibraries');
            Permissions = $injector.get('Permissions');
            API_BASE_URL = $injector.get('API_BASE_URL');
            ARTIFACT_URL = API_BASE_URL + 'artifacts';

        });
        jasmine.getJSONFixtures().fixturesPath = 'base/interfaceSource/test/mockData/api/libraries/librariesService';

        spyOnUpdate = spyOn($server, "update").and.callFake(function () {
            var res = {};
            res.data = getJSONFixture('artifact/1/update/index.json');
            var d = $q.defer();
            d.resolve(res);
            return d.promise;
        });

        spyOnGet = spyOn($server, "get").and.callFake(function () {
            var res = {};
            res.data = getJSONFixture('tags/all/index.json');
            var d = $q.defer();
            d.resolve(res);
            return d.promise;
        });

        spyOn(FormatLibraries, "formatArtifactSummaryItemResults").and.callFake(function (item) {
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
                    Permissions: Permissions.formatPermissions(item.EntityActions)
                }
            }
            return obj;
        });

        spyOn(Permissions, "formatPermissions").and.callFake(function (EntityActions) {
            var permissions = {};

            angular.forEach(EntityActions, function(action){
                permissions[action.Caption.toLowerCase()] = true;
            });

            return permissions;
        });

        spyOn(FormatLibraries, "formatRelatedArtifacts").and.callFake(function (item) {
            var obj = {};

            if (item) {
                obj = {
                    ArtifactId: item.ArtifactSummary.ArtifactId,
                    ArtifactTypeName: item.ArtifactSummary.ArtifactTypeName,
                    ArtifactTitle: item.ArtifactSummary.ArtifactTitle,
                    FileName: item.ArtifactSummary.FileName,
                    Author: item.ArtifactSummary.Owner ? item.ArtifactSummary.Owner.FirstName + ' ' + item.ArtifactSummary.Owner.Surname : null,
                    FilePath: 'My Space/Gallery/', // hard code here
                    Permissions: Permissions.formatPermissions(item.EntityActions)
                }
            }
            return obj;
        });

        var errors = [];
        var onErrorCallBack = [];
        var onError = function(err){

            angular.forEach(onErrorCallBack, function(callback){
                callback(err);
            });

        };
        spyOn($notify, "add").and.callFake(function (error) {
            errors.push(error);
            onError(error);
        });
        //spyOnFormatLibrariesFormatTag = spyOn(FormatLibraries, "formatTag");
    });



    it('When get list all Tags, it should be return list Tags with format correctly ', function(){
        spyOn(FormatLibraries, "formatTag").and.callFake(function (tag) {
            var t = {};
            if (tag) {
                t = {
                    TagId: tag.TagId,
                    TagName: tag.TagName,
                    label: tag.TagName
                };
            }
            return t;
        });
        LibrariesService.getTags().then(function(res){
            expect(FormatLibraries.formatTag).toHaveBeenCalled();
            expect($server.get).toHaveBeenCalled();
            expect(res.length).not.toEqual(0);
            expect(res.data[0].hasOwnProperty('TagId')).toBe(true);
            expect(res.data[0].hasOwnProperty('TagName')).toBe(true);
            expect(res.data[0].hasOwnProperty('label')).toBe(true);
        });
        $rootScope.$digest();
    });
    it('When get list all recent Artifact, it should be return list Artifact with format correctly ', function(){
        spyOnGet.and.callThrough();
        spyOnGet.and.returnValue((function(){
            var res = {};
            res.data = getJSONFixture('artifact/1/recent/index.json');
            res.userCan = {};
            var d = $q.defer();
            d.resolve(res);
            return d.promise;
        })());

        LibrariesService.getRecentArtifact().then(function(res){
            expect(FormatLibraries.formatArtifactSummaryItemResults).toHaveBeenCalled();
            expect($server.get).toHaveBeenCalled();
            expect(res.data.items.length).not.toEqual(0);
            expect(res.data.items[0].hasOwnProperty('ArtifactId')).toBe(true);
            expect(res.data.items[0].hasOwnProperty('Thumbnail')).toBe(true);
            expect(res.data.items[0].hasOwnProperty('ArtifactTypeName')).toBe(true);
            expect(res.data.items[0].hasOwnProperty('ArtifactTypeId')).toBe(true);
            expect(res.data.items[0].hasOwnProperty('Extension')).toBe(true);
            expect(res.data.items[0].hasOwnProperty('FileName')).toBe(true);
            expect(res.data.items[0].hasOwnProperty('Name')).toBe(true);
            expect(res.data.items[0].hasOwnProperty('ArtifactTitle')).toBe(true);
            expect(res.data.items[0].hasOwnProperty('Author')).toBe(true);
            expect(res.data.items[0].hasOwnProperty('LastModified')).toBe(true);
            expect(res.data.items[0].hasOwnProperty('FilePath')).toBe(true);
            expect(res.data.items[0].hasOwnProperty('FileSize')).toBe(true);
            expect(res.data.items[0].hasOwnProperty('FormatedFileSize')).toBe(true);
            expect(res.data.items[0].hasOwnProperty('Permissions')).toBe(true);

        });
        $rootScope.$digest();
    });

    it('When search Artifact by name, it should be return Artifact with format correctly ', function(){
        spyOnGet.and.callThrough();
        spyOnGet.and.returnValue((function(){
            var res = {};
            res.data = getJSONFixture('artifact/1/searchbyname/index.json');
            res.userCan = {};
            var d = $q.defer();
            d.resolve(res);
            return d.promise;
        })());

        LibrariesService.getRecentArtifact().then(function(res){
            expect(FormatLibraries.formatArtifactSummaryItemResults).toHaveBeenCalled();
            expect($server.get).toHaveBeenCalled();
            expect(res.data.items.length).not.toEqual(0);
            expect(res.data.items[0].hasOwnProperty('ArtifactId')).toBe(true);
            expect(res.data.items[0].hasOwnProperty('Thumbnail')).toBe(true);
            expect(res.data.items[0].hasOwnProperty('ArtifactTypeName')).toBe(true);
            expect(res.data.items[0].hasOwnProperty('ArtifactTypeId')).toBe(true);
            expect(res.data.items[0].hasOwnProperty('Extension')).toBe(true);
            expect(res.data.items[0].hasOwnProperty('FileName')).toBe(true);
            expect(res.data.items[0].hasOwnProperty('Name')).toBe(true);
            expect(res.data.items[0].hasOwnProperty('ArtifactTitle')).toBe(true);
            expect(res.data.items[0].hasOwnProperty('Author')).toBe(true);
            expect(res.data.items[0].hasOwnProperty('LastModified')).toBe(true);
            expect(res.data.items[0].hasOwnProperty('FilePath')).toBe(true);
            expect(res.data.items[0].hasOwnProperty('FileSize')).toBe(true);
            expect(res.data.items[0].hasOwnProperty('FormatedFileSize')).toBe(true);
            expect(res.data.items[0].hasOwnProperty('Permissions')).toBe(true);

        });
        $rootScope.$digest();
    });

    it('When get relate Artifact, it should be return list Artifact with format correctly ', function(){
        spyOnGet.and.callThrough();
        spyOnGet.and.returnValue((function(){
            var res = {};
            res.data = getJSONFixture('artifact/1/relate/index.json');
            res.userCan = {};
            var d = $q.defer();
            d.resolve(res);
            return d.promise;
        })());

        LibrariesService.getRelatedArtifacts().then(function(res){
            expect(FormatLibraries.formatRelatedArtifacts).toHaveBeenCalled();
            expect($server.get).toHaveBeenCalled();
        });
        $rootScope.$digest();
    });

    it('When add Related Item, it should be call api create and notify correctly ', function(){
        spyOnCreate = spyOn($server, "create").and.callFake(function(){
            var res = {};
            res.data = getJSONFixture('artifact/1/relate/create/index.json');
            res.userCan = {};
            var d = $q.defer();
            d.resolve(res);
            return d.promise;
        });
        //
        LibrariesService.addRelatedItem(1, 1).then(function(res){
            expect($server.create).toHaveBeenCalled();
        });
        //expect(1).toBe(1);
        $rootScope.$digest();
    });

    it('When delete Related Item, it should be call api delete and notify correctly ', function(){
        spyOnRemove = spyOn($server, "remove").and.callFake(function(){
            var res = {};
            res.data = getJSONFixture('artifact/1/relate/remove/index.json');
            res.userCan = {};
            var d = $q.defer();
            d.resolve(res);
            return d.promise;
        });
        //
        LibrariesService.deleteRelatedItems(1, 1).then(function(res){
            expect($server.remove).toHaveBeenCalled();
        });
        //expect(1).toBe(1);
        $rootScope.$digest();
    });

    it('When delete Artifact, it should be call api delete and notify correctly ', function(){
        spyOnRemove = spyOn($server, "remove").and.callFake(function(){
            var res = {};
            res.data = getJSONFixture('artifact/1/relate/remove/index.json');
            res.userCan = {};
            var d = $q.defer();
            d.resolve(res);
            return d.promise;
        });
        //
        LibrariesService.deleteArtifact(1).then(function(res){
            expect($server.remove).toHaveBeenCalled();
        });
        //expect(1).toBe(1);
        $rootScope.$digest();
    });
    //deleteArtifact
    //updateArtifact
    it('When update Artifact, it should be call api update and notify correctly ', function(){
        spyOnRemove = spyOn($server, "remove").and.callFake(function(){
            var res = {};
            res.data = getJSONFixture('artifact/1/relate/remove/index.json');
            res.userCan = {};
            var d = $q.defer();
            d.resolve(res);
            return d.promise;
        });
        //
        LibrariesService.updateArtifact(1, {
            "$id": "3",
            "ArtifactId": 1,
            "ArtifactTitle": "sample string 2"
        }).then(function(res){
            expect($server.update).toHaveBeenCalled();
        });
        //expect(1).toBe(1);
        $rootScope.$digest();
    });
    // Container API
    it('When get System Container, it should be return list system container with right format', function(){
        spyOnGet.and.callThrough();
        spyOnGet.and.returnValue((function(){
            var res = {};
            res.data = getJSONFixture('container/systemContainer/index.json');
            var d = $q.defer();
            d.resolve(res);
            return d.promise;
        })());

        spyOn(FormatLibraries, "formatContainerSummaryItemResults").and.callFake(function (container) {
            var result = {};
            if (container) {
                result = {
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
            return result;
        });
        LibrariesService.getSystemContainer().then(function(res){
            // Call or not get request
            expect($server.get).toHaveBeenCalled();
            expect(FormatLibraries.formatContainerSummaryItemResults).toHaveBeenCalled();
            expect(res.length).not.toEqual(0);
            expect(res.data.itmes[1].hasOwnProperty('Name')).toBe(true);
            expect(res.data.itmes[1].hasOwnProperty('PathDisplay')).toBe(true);
            expect(res.data.itmes[1].hasOwnProperty('ContainerCount')).toBe(true);
            expect(res.data.itmes[1].hasOwnProperty('ContainerId')).toBe(true);
            expect(res.data.itmes[1].hasOwnProperty('LastModified')).toBe(true);
            expect(res.data.itmes[1].hasOwnProperty('Author')).toBe(true);
            expect(res.data.itmes[1].hasOwnProperty('Permissions')).toBe(true);
            expect(res.data.itmes[1].hasOwnProperty('IsContainer')).toBe(true);
            expect(res.data.itmes[1].hasOwnProperty('ParentContainerId')).toBe(true);
        })  ;
    });
    it('When get user container, it should be return list user container with right format', function(){
        spyOnGet.and.callThrough();

        spyOnGet.and.returnValue((function(){
            var res = {};
            res.data = getJSONFixture('container/userContainer/index.json');
            var d = $q.defer();
            d.resolve(res);
            return d.promise;
        })());

        spyOn(FormatLibraries, "formatContainerSummaryItemResults").and.callFake(function (container) {
            var result = {};
            if (container) {
                result = {
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
            return result;
        });
        LibrariesService.getSystemContainer().then(function(res){
            // Call or not get request
            expect(FormatLibraries.formatContainerSummaryItemResults).toHaveBeenCalled();
            expect(res.length).not.toEqual(0);
            expect(res.data.itmes[0].hasOwnProperty('Name')).toBe(true);
            expect(res.data.itmes[0].hasOwnProperty('PathDisplay')).toBe(true);
            expect(res.data.itmes[0].hasOwnProperty('ContainerCount')).toBe(true);
            expect(res.data.itmes[0].hasOwnProperty('ContainerId')).toBe(true);
            expect(res.data.itmes[0].hasOwnProperty('LastModified')).toBe(true);
            expect(res.data.itmes[0].hasOwnProperty('Author')).toBe(true);
            expect(res.data.itmes[0].hasOwnProperty('Permissions')).toBe(true);
            expect(res.data.itmes[0].hasOwnProperty('IsContainer')).toBe(true);
            expect(res.data.itmes[0].hasOwnProperty('ParentContainerId')).toBe(true);
        })  ;

    });
    it('When get container by Id  it should be return container detail with right format', function(){
        spyOnGet.and.callThrough();
        spyOnGet.and.returnValue((function(){
            var res = {};
            res.data = getJSONFixture('container/containerId/index.json');
            var d = $q.defer();
            d.resolve(res);
            return d.promise;
        })());

        spyOn(FormatLibraries, "formatContainerDetail").and.callFake(function (container) {
            var result = {};
            if (container) {
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
                }
            }
            return result;
        });
        LibrariesService.getContainerById().then(function(res){
            // Call or not get request
            expect($server.get).toHaveBeenCalled();
            expect(FormatLibraries.formatContainerSummaryItemResults).toHaveBeenCalled();
            expect(res.length).not.toEqual(0);
            expect(res.data.itmes[0].hasOwnProperty('Name')).toBe(true);
            expect(res.data.itmes[0].hasOwnProperty('Visibility')).toBe(true);
            expect(res.data.itmes[0].hasOwnProperty('ContainerType')).toBe(true);
            expect(res.data.itmes[0].hasOwnProperty('ContainerId')).toBe(true);
            expect(res.data.itmes[0].hasOwnProperty('ParentId')).toBe(true);
            expect(res.data.itmes[0].hasOwnProperty('Description')).toBe(true);
            expect(res.data.itmes[0].hasOwnProperty('Path')).toBe(true);
            expect(res.data.itmes[0].hasOwnProperty('PathDisplay')).toBe(true);
            expect(res.data.itmes[0].hasOwnProperty('ArtifactCount')).toBe(true);
            expect(res.data.itmes[0].hasOwnProperty('ContainerCount')).toBe(true);
            expect(res.data.itmes[0].hasOwnProperty('OwnerName')).toBe(true);
        })  ;
    });
    it('When create user container it should be return container Id of new container', function() {
        spyOnCreate = spyOn($server, "create").and.callFake(function () {
            var res = {};
            res.data = getJSONFixture('container/createContainer/index.json');
            var d = $q.defer();
            d.resolve(res);
            return d.promise;
        });
        LibrariesService.createUserContainer({
            "Name": "sample string 2",
            "Visibility": "sample string 3",
            "ParentContainerId": 1,
            "Description": "sample string 4",
            "SharedUsers": [
                1,
                2
            ],
            "SharedGroups": [
                1,
                2
            ],
            "SharedRoles": [
                1,
                2
            ]
        }).then(function (res) {
            expect($server.create().toHaveBeenCalled());
            expect(res.data.hasOwnProperty('Errors')).toBe(false);
            expect(res.data).toBeNull(false);
        });
    });
    it('When update user container it should be return container Id of the container', function() {
        spyOnUpdate.and.callThrough();
        spyOnUpdate.and.returnValue((function(){
            var res = {};
            res.data = getJSONFixture('container/updateContainer/index.json');
            var d = $q.defer();
            d.resolve(res);
            return d.promise;
        })());
        LibrariesService.updateUserContainer({
            "Name": "sample string 2",
            "Visibility": "sample string 3",
            "ParentContainerId": 1,
            "Description": "sample string 4",
            "SharedUsers": [
                1,
                2
            ],
            "SharedGroups": [
                1,
                2
            ],
            "SharedRoles": [
                1,
                2
            ]
        }).then(function (res) {
            expect($server.update().toHaveBeenCalled());
            expect(res.data.hasOwnProperty('Errors')).toBe(false);
            expect(res.data).toBeNull(false);
        });
    });
    it('When delete user container it should be return null', function() {
        var spyOnDelete = spyOn($server, "remove").and.callFake(function () {
            var res = {};
            res.data = null;
            var d = $q.defer();
            d.resolve(res);
            return d.promise;
        });
        LibrariesService.deleteUserContainer().then(function (res) {
            expect($server.delete().toHaveBeenCalled());
            expect(res.data).toBeNull(true);
        });
    });

    // Updown/ Download API
    it('When get url upload it should be return upload Url', function() {
        spyOnCreate = spyOn($server, "create").and.callFake(function () {
            var res = {};
            res.data = getJSONFixture('upload-download/getUploadUrl/index.json');
            var d = $q.defer();
            d.resolve(res);
            return d.promise;
        });
        LibrariesService.getUploadUrl({
            "FileName": "sample string 1",
            "FileSize": 2,
            "ContainerId": 1,
            "FileType": 0
        }).then(function (res) {
            expect($server.create().toHaveBeenCalled());
            expect(res.data.hasOwnProperty('Errors')).toBe(false);
            expect(res.data).toBeNull(false);
        });
    });
    it('When get url upload to cloud it should be return upload url to cloud', function() {
        spyOnCreate = spyOn($server, "create").and.callFake(function () {
            var res = {};
            res.data = getJSONFixture('upload-download/getUploadToCloud/index.json');
            var d = $q.defer();
            d.resolve(res);
            return d.promise;
        });
        LibrariesService.getUploadUrlToCloud({
            "FileName": "sample string 1",
            "FileSize": 2,
            "ContainerId": 1,
            "FileType": 0
        }).then(function (res) {
            expect($server.create().toHaveBeenCalled());
            expect(res.data.hasOwnProperty('Errors')).toBe(false);
            expect(res.data).toBeNull(false);
        });
    });
    it('When set upload status it should be return null', function() {
        spyOnUpdate.and.callThrough();
        spyOnUpdate.and.returnValue((function(){
            var res = {};
            res.data = null;
            var d = $q.defer();
            d.resolve(res);
            return d.promise;
        })());
        LibrariesService.setUploadStatus().then(function (res) {
            expect($server.update().toHaveBeenCalled());
            expect(res.data.hasOwnProperty('Errors')).toBe(false);
            expect(res.data).toBeNull(true);
        });
    });
    it('When get download url, it should be return download url', function(){
        spyOnGet.and.callThrough();
        spyOnGet.and.returnValue((function(){
            var res = {};
            res.data = getJSONFixture('upload-download/getDownloadUrl/index.json');
            var d = $q.defer();
            d.resolve(res);
            return d.promise;
        })());
        LibrariesService.getDownloadUrl().then(function(res){
            // Call or not get request
            expect($server.get).toHaveBeenCalled();
            expect(res.data.hasOwnProperty('Errors')).toBe(false);
            expect(res.data).toBeNull(false);
        })  ;
    });
    it('When get download url from cloud, it should be return download url from cloud', function(){
        spyOnGet.and.callThrough();
        spyOnGet.and.returnValue((function(){
            var res = {};
            res.data = getJSONFixture('upload-download/getDownloadUrlFromCloud/index.json');
            var d = $q.defer();
            d.resolve(res);
            return d.promise;
        })());
        LibrariesService.getDownloadUrlFromCloud().then(function(res){
            // Call or not get request
            expect($server.get).toHaveBeenCalled();
            expect(res.data.hasOwnProperty('Errors')).toBe(false);
            expect(res.data).toBeNull(false);
        })  ;
    });
    it('When download file it should be return success ', function(){
        spyOnGet.and.callThrough();
        spyOnGet.and.returnValue((function(){
            var res = {};
            res.data = null;
            var d = $q.defer();
            d.resolve(res);
            return d.promise;
        })());
        LibrariesService.downloadFile().then(function(res){
            // Call or not get request
            expect($server.get).toHaveBeenCalled();
            expect(res.data.hasOwnProperty('Errors')).toBe(false);
            expect(res.data).toBeNull(true);
        })  ;
    });
    it('When set download status it should be return null', function() {
        spyOnUpdate.and.callThrough();
        spyOnUpdate.and.returnValue((function(){
            var res = {};
            res.data = null;
            var d = $q.defer();
            d.resolve(res);
            return d.promise;
        })());
        LibrariesService.setDownloadStatus().then(function (res) {
            expect($server.update().toHaveBeenCalled());
            expect(res.data.hasOwnProperty('Errors')).toBe(false);
            expect(res.data).toBeNull(true);
        });
    });
});