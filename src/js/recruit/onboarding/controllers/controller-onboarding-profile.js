function onboardingProfileCtrl($scope, $rootScope, $location, $q, networks, paths, onboarding, onboardingConstants, memberAcceptanceProfile, Addresses) {

  (function init() {
      $scope.details = {};
      $scope.lookups = {};
      $scope.onboardSetting = {};
      
      $rootScope.progress = { length: '96%' };
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
      var getOnboardSetting = onboarding.getOnboardingSettings();

      $q.all([onboardingPromise, countryPromise, getOnboardSetting]).then(function(data) {
          $scope.isLoading = false;
          var onboardingDetails = data[0].OnboardingAcceptanceDetail;
          $scope.onboardSetting = data[2].BankingAndSuperannuationSetting;
          
          $scope.details.CandidatePersonalInfo = onboardingDetails.CandidatePersonalInfo || {};

          $scope.details.CandidateContact = {};
          if (onboardingDetails.CandidateContacts) {
              prepareOnboardContactsForView(onboardingDetails);
              $scope.details.CandidateContact.MemberId = $scope.details.CandidatePersonalInfo.MemberId ? $scope.details.CandidatePersonalInfo.MemberId : 0;
          }

          $scope.details.CandidateEmergencyInfo = onboardingDetails.EmergencyContact || {};

          $scope.details.CandidateBankInfo = onboardingDetails.MemberBankingDetail || {};
          
          if($scope.details.CandidateBankInfo.SuperFund && $scope.details.CandidateBankInfo.SuperFund === null){
              if($scope.onboardSetting.DefaultSuperannuationFund !== null) {
                  $scope.details.CandidateBankInfo.SuperFund = $scope.onboardSetting.DefaultSuperannuationFund;
              }
          }else{
              $scope.details.CandidateBankInfo.SuperFund = $scope.onboardSetting.DefaultSuperannuationFund;
          }
          
          $scope.details.IsPIConfirmed = false;
          $scope.details.IsEmergencyConfirmed = false;
          $scope.details.IsBankConfirmed = false;
          $scope.details.IsOnboardActivated = onboardingDetails.IsOnboardActivated;
          $scope.lookups.countries = data[1];

          if (onboardingDetails.AcceptanceState !== onboardingConstants.ONBOARD_STATE_MEMBERACCEPTPROF) {
              $location.path(paths.get(onboarding.getRouteFromAcceptanceStage(onboardingDetails.AcceptanceState)).path);
          }
          else $scope.isLoading = false;
      }).catch(() => $scope.isLoading = false)
      
      $scope.locationMatches = true;
      $scope.noMatchesLocation = false;
      
      $scope.$watch('details.CandidateContact.CountryId', function(newVal, oldVal){
            if(newVal === undefined || newVal === null){
                $scope.allowInputPostCode = false;
                $('#onboarding__Postcode').val(null);
                $('#onboarding__Suburb').val(null);
                $scope.allowCustomAddressEntry = false;
                
                return;
            }
            
            if(newVal !== oldVal){
                $('#onboarding__Postcode').val(null);
                $('#onboarding__Suburb').val(null);
                
                $scope.allowCustomAddressEntry = false;
            }
            
            $scope.allowInputPostCode = true;
        });
        
      $scope.$watch('details.CandidateContact.Postcode', function(newVal, oldVal) {
            if (!newVal || !newVal.length || (newVal === undefined)) {
                return;
            }
            
            if(newVal.length < 4) {
                return;
            }
            
            if(newVal === oldVal || oldVal === undefined) {
                if($scope.details.CandidateContact.Suburb !== null && $scope.details.CandidateContact.CountryId !== null){
                    return;
                }
            }
            
            $scope.isBusy = true;
            
            Addresses.lookupAddressByPostcode(newVal, $scope.details.CandidateContact.CountryId).then(function(address) {
                if (address.data.length) {
                    if (address.data.length === 1) {
                        if (address.data[0].Postcode === newVal) {
                            $scope.details.CandidateContact.Suburb = address.data[0].Locality;
                            //$scope.details.CandidateContact.AddressUsageCode = address.data[0].StationRegion;
                            $scope.allowCustomAddressEntry = false;
                            $scope.allowInputState = false;
                        }
                    
                    } else {
                        $scope.suburbData = address.data.map(function(location) {
                            return {
                                label: location.Locality,
                                id: location.Id,
                                val: {
                                    Locality: location.Locality,
                                    StationRegion: location.StationRegion,
                                    CountryId: location.CountryId,
                                    CountryLabel: location.CountryName
                                }
                            };
                        });
                        
                        //$scope.details.CandidateContact.AddressUsageCode = null;
                        $scope.locationMatches = false;
                    }
                    
                } else {
                    $scope.locationMatches = true;
                    $scope.details.CandidateContact.Suburb = null;
                    //$scope.details.CandidateContact.AddressUsageCode = null;
                    $scope.allowCustomAddressEntry = true;
                }
                
            }).finally(function() {
                $scope.isBusy = false;
            });
      });
      
      $scope.changeSuburb = function (data) {
            $scope.details.CandidateContact.Suburb = data.label;
            $scope.locationMatches = true;
            $scope.allowCustomAddressEntry = false;
            
            //if (data.val.StationRegion) {
            //    $scope.details.CandidateContact.AddressUsageCode = data.val.StationRegion;
            //} else {
            //    $scope.details.CandidateContact.AddressUsageCode = null;
            //}
        };
        
        $scope.allowInputAddress = function(){
            $scope.locationMatches = true;
            $scope.details.CandidateContact.Suburb = null;
            $scope.allowCustomAddressEntry = true;
        };
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
      
      var promise = [];
      
      promise.push(memberAcceptanceProfile.updateEmergencyContact($scope.details.CandidateEmergencyInfo));
      promise.push(onboarding.memberPersonalInfo($scope.details.CandidatePersonalInfo));
      
      promise.push(onboarding.memberContacts($scope.details.CandidateContact));
          
      if($scope.onboardSetting.IsBankingAndSuperannuationRequired === true){
          promise.push(onboarding.memberBankInfo($scope.details.CandidateBankInfo));
      }
      
      $q.all([
          promise
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
  
  function prepareOnboardContactsForView(onboard, index) {
        if (onboard.CandidateContacts && onboard.CandidateContacts.length) {
            var address = onboard.CandidateContacts.filter(function(item) {
                return item.Type === onboardingConstants.ONBOARD_CONTACT_TYPE_ADDRESS;
            })[0];

            var phones = onboard.CandidateContacts
                .filter(function(item) {
                    return item.Type === onboardingConstants.ONBOARD_CONTACT_TYPE_PHONE;
                })
                .map(function(item) {
                    return {
                        mobilephone: item.MobilePhone,
                        phone: item.Phone
                    };
                });

            var emails = onboard.CandidateContacts
                .filter(function(item) {
                    return item.Type === onboardingConstants.ONBOARD_CONTACT_TYPE_EMAIL;
                })
                .map(function(item) {
                    return {
                        value: item.Email
                    };
                });
                
            $scope.details.CandidateContact = address ? address : {};
            $scope.details.CandidateContact.MobilePhone = (angular.isObject(phones) && phones[0] !== undefined) ? phones[0].mobilephone : null;
            $scope.details.CandidateContact.Phone = (angular.isObject(phones) && phones[1] !== undefined) ? phones[1].mobilephone : null;
            $scope.details.CandidateContact.Email = (angular.isObject(emails) && emails[0] !== undefined) ? emails[0].value : null;
        }
    }
}
        
angular.module('ui.recruit.candidateonboard')
.controller('onboardingProfileCtrl', [
    '$scope', '$rootScope', '$location', '$q', 'Networks', 'Paths', 'Onboarding', 'OnboardingConstants', 'memberAcceptanceProfile', 'Addresses',
    onboardingProfileCtrl]);