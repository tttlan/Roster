angular.module('ui.profile')

.factory('ProfileCommonFactory', ['$routeParams', 'Profile', '$rootScope', '$location', 'Permissions',
    function($routeParams, Profile, $rootScope, $location, Permissions) {
    
    function ProfileCommon(dataOptions) {
        
        var that = this;

        //this.$ownProfile = $routeParams.memberId ? false : true;
        this.$ownProfile = $routeParams.memberId && $routeParams.memberId !== 'me' ? false : true; // For demo new UI
        this.MemberId = this.$ownProfile ? null : $routeParams.memberId; // If you are loading a profile other than your own, set the member id now rather than waiting for the getProfileRecord API
        this.groupLimit = 3;
        this.$hideGroupToggle = false;
        this.$loaded = false;
        this.returnUrl = this.MemberId ? this.MemberId : 'me';
        this.returnOldUrl = this.MemberId ? this.MemberId : '';
    }

    ProfileCommon.prototype.loadProfile = function() {
        
        var that = this;

        Profile.getProfileRecord().then(function(res) {
            that.$loaded = true;
            that = angular.extend(that, res.data.ProfileRecord || {});
            that.$userCan = Permissions.formatPermissions(res.data.EntityActions); // Format the entity actions nicely   
            that.initTabs(); // Now that we have entity actions, initialise the tabs
            $rootScope.title = that.FirstName + '\'s profile - ' + $rootScope.title;
        }, function(res) {
            that.$loaded = true;
            that.$error = true;
            that.$noPermission = res.data.Errors.filter(function(error) {
                return error.Code === 2;
            }).length > 0;            
        });
    };
    
    ProfileCommon.prototype.initTabs = function() {
        
        var that = this;

        this.$tabData = [
            { title: 'Wall', path: 'wall' },
        ];
        
        if (this.$userCan.canviewcontact) {
            this.$tabData.push({ title: 'About', path: 'about' });
        }
        if (this.$userCan.viewprofileemploymentdetail || this.$userCan.canviewbankingdetails) {
            this.$tabData.push({ title: 'Employment Details', path: 'employment-details' });
        }
        if (this.$userCan.canviewemploymenthistory || this.$userCan.canviewtraining) {
            this.$tabData.push({ title: 'History', path: 'history' });
        }
        if (this.$userCan.canviewdocumentation) {
            this.$tabData.push({ title: 'Documentation', path: 'documentation'});
        }
        if (this.$userCan.canviewnotes) {
            this.$tabData.push({ title: 'Notes', path: 'notes'});
        } 
        if (this.$userCan.canviewsysteminformation) {
            this.$tabData.push({ title: 'System Settings', path: 'system-settings'});
        }
        if (this.$userCan.viewonboardworkflow || this.$userCan.viewjobadworkflow) {
            this.$tabData.push({ title: 'Workflows', path: 'workflows'});
        }

        function getIndOfPath(path) {
            for(var i = that.$tabData.length; i--;) {
                if(that.$tabData[i].path === path) {
                    return i;
                }
            }
            return -1;
        }
        
        var currentLocation = $location.search().tab,
            tabLocation = getIndOfPath(currentLocation);

        this.activeTabIndex = (currentLocation && tabLocation > -1) ? (tabLocation + 1) : 1;
    };
    
    ProfileCommon.prototype.updateUrl = function(ind) {
        $location.search({ tab: this.$tabData[ind].path });
    };

    
    ProfileCommon.prototype.showAllGroups = function() {
        this.groupLimit = this.GroupsList.length;
        this.$hideGroupToggle = true;
    };

    // ProfileCommon.prototype.updatePhoto = function(){
    //     
    //     var files = [],
    //         filesModal,
    //         editPhotoModal,
    //         photoUrl;
    // 
    //     // Open a modal to upload the new photo
    //     filesModal = $modal.open({
    //         templateUrl: '/interface/views/common/partials/modal-upload.html',
    //         size: 'sm',
    //         controller: SHRP.ctrl.ModalCTRL,
    //         title: 'Upload a profile photo',
    //         resolve: {
    //             items: function() {
    //                 return files;
    //             }
    //         }
    //     });
    // 
    //     // Then once the file upload has been successful, open another modal to edit the photo in
    //     filesModal.result.then(function (files) {
    //         
    //         var photo = {
    //             id: files[0],
    //             url: FileStorage.getDownloadUrl( files[0] ) + '?inline=true'
    //         }
    // 
    //         editPhotoModal = $modal.open({
    //             templateUrl: '/interface/views/profile/partials/modal-photo-upload.html',
    //             size: 'lg',
    //             controller: SHRP.ctrl.ModalCTRL,
    //             name: 'edit-profile-photo',
    //             resolve: {
    //                 items: function() {
    //                     return photo;
    //                 }
    //             }
    //         });
    //     });
    // };
    
    return ProfileCommon;
    
}]);
