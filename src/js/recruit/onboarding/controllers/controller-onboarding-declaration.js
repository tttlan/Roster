function onboardingDeclarationCtrl($scope, $rootScope, $location, $q, $modal, networks, paths, onboarding, onboardingConstants, 
onboardingTaxFileNumber, Addresses, notify) {
  (function init() {
      $scope.details = {};
      $scope.lookups = {};
      $rootScope.progress = { length: '56%' };
      $scope.isLoading = true;
      $scope.onboardSetting = {};

      var countryPromise = networks.getCountriesPromise();
      //var statePromise = networks.getStatesPromise();
      //var employmentTypesPromise = networks.getEmploymentTypes();
      var onboardingPromise = onboarding.memberAcceptance();
      var getOnboardSetting = onboarding.getOnboardingSettings();
      
      $q.all([countryPromise, onboardingPromise, getOnboardSetting]).then(function(data) {
          $scope.lookups.countries = data[0];
          $scope.onboardSetting = data[2];
          
          var memberTfn = data[1].OnboardingAcceptanceDetail.MemberTFN;
          if (memberTfn) {
              $scope.details = onboardingTaxFileNumber.setupMemberTfnFromModel(memberTfn);
          }

          if (data[1].OnboardingAcceptanceDetail.AcceptanceState !== onboardingConstants.ONBOARD_STATE_MEMBERTFNDECLARATION) {
              $location.path(paths.get(onboarding.getRouteFromAcceptanceStage(data[1].OnboardingAcceptanceDetail.AcceptanceState)).path);
          }
          else $scope.isLoading = false;
      }).catch(() => $scope.isLoading = false);
      
      $scope.locationMatches = true;
      $scope.noMatchesLocation = false;
      $scope.allowInputState = false;
      
      $scope.$watch('details.CountryId', function(newVal, oldVal){
            if(newVal === undefined || newVal === null){
                $scope.allowInputPostCode = false;
                $('#txtTfnPostode').val(null);
                $('#ddlTfnState').val(null);
                $('#txtTfnSuburb').val(null);
                
                $scope.allowCustomAddressEntry = false;
                
                return;
            }
            
            if(newVal !== oldVal){
                $('#txtTfnPostode').val(null);
                $('#ddlTfnState').val(null);
                $('#txtTfnSuburb').val(null);
                
                $scope.allowCustomAddressEntry = false;
            }
            
            $scope.allowInputPostCode = true;
        });
            
      $scope.$watch('details.Postcode', function(newVal, oldVal) {
        if (!newVal || !newVal.length || (newVal === undefined)) {
            return;
        }
        
        if(newVal.length < 4) {
            return;
        }
                
        if(newVal === oldVal) {
            if($scope.details.Suburb !== null && $scope.details.AddressUsageCode !== null && $scope.details.CountryId !== null){
                return;
            }
        }
        
        $scope.isBusy = true;
        
        Addresses.lookupAddressByPostcode(newVal, $scope.details.CountryId).then(function(address) {
            if (address.data.length) {
                if (address.data.length === 1) {
                    if (address.data[0].Postcode === newVal) {
                        $scope.details.Suburb = address.data[0].Locality;
                        $scope.details.AddressUsageCode = address.data[0].StationRegion;
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
                    
                    $scope.details.AddressUsageCode = null;
                    $scope.locationMatches = false;
                }
                
            } else {
                $scope.locationMatches = true;
                $scope.details.Suburb = null;
                $scope.details.AddressUsageCode = null;
                $scope.allowCustomAddressEntry = true;
            }
            
        }).finally(function() {
            $scope.isBusy = false;
        });
      });

      $scope.changeSuburb = function (data) {
            $scope.details.Suburb = data.label;
            $scope.locationMatches = true;
            $scope.allowCustomAddressEntry = false;
            
            if (data.val.StationRegion) {
                $scope.details.AddressUsageCode = data.val.StationRegion;
            } else {
                $scope.details.AddressUsageCode = null;
            }
            
            if($scope.details.AddressUsageCode === null){
                $scope.allowInputState = true;
            }
        };
        
        $scope.allowInputAddress = function(){
            $scope.locationMatches = true;
            $scope.details.Suburb = null;
            $scope.allowCustomAddressEntry = true;
        };
  })();
           
  $scope.openTfnDeclarationHelp = function(fileName) {
      var modal = $modal.open({
          templateType: 'drawer',
          templateUrl: 'interface/views/recruit/partials/modal-open-help.html',
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

  $scope.onboarding_tfnDeclaration = function() {
      if ($scope.tfnForm.$invalid) {
          $scope.tfnForm.$setDirty();
          angular.forEach($scope.tfnForm.$error.required, function(field) {
              field.$setDirty();
          });
          angular.forEach($scope.tfnForm.$error.pattern, function(field) {
              field.$setDirty();
          });
          return;
      }
      
      $scope.isLoading = true;
      
      var memberTfnEntry = onboardingTaxFileNumber.setupMemberTfnFromView($scope.details);
      onboardingTaxFileNumber.updateTfnDeclaration(memberTfnEntry).then(function(data) {
          $location.path(paths.get('recruit.onboarding.signature').path);
      }).catch(function() {
          $scope.isLoading = false;
      });

  };
  
  $scope.skip_tfnDeclaration = function(){
      $scope.isLoading = true;
      
      return onboarding.skipTFNSteps(true).then(function(res){
          $location.path(paths.get('recruit.onboarding.profile').path);
      })     
      .catch(function(){
          $notify.add({
              message: 'TFN declaration could not be skiped at this time. Please try again later',
              type: 'error',
              visible: true
          });
      })
      .finally(function(){
          $scope.isLoading = false;
      });
  };
}

angular.module('ui.recruit.candidateonboard')
    .controller('onboardingDeclarationCtrl', [
    '$scope', '$rootScope', '$location', '$q', '$modal', 'Networks', 'Paths', 
    'Onboarding', 'OnboardingConstants', 'onboardingTaxFileNumber', 'Addresses', '$notify',
    onboardingDeclarationCtrl]);