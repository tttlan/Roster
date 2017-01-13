function onboardingSignatureCtrl($rootScope, $scope, $route, $location, $q, $window, networks, paths, onboarding, onboardingConstants, fileStorage, uploadConstants, 
API_BASE_URL, onboardingTaxFileNumber, $notify) {

  (function init() {
      $scope.details = {};
      $scope.onboardSetting = {};
      $rootScope.progress = { length: '84%' };
      $scope.details.signedDate = moment().format('YYYY-MM-DD');

      $scope.isLoading = true;
      var salutationPromise = networks.getSalutations();
      var statePromise = networks.getStates();
      var countryPromise = networks.getCountries();
      var memberAcceptancePromise = onboarding.memberAcceptance();
      var getOnboardSetting = onboarding.getOnboardingSettings();
      
      $q.all([salutationPromise, statePromise, countryPromise, memberAcceptancePromise, getOnboardSetting]).then(function(data) {
          var salutations = data[0];
          var states = data[1].data;
          var countries = data[2].data;
          $scope.onboardSetting = data[4];

          var onboardingAcceptanceDetail = data[3].OnboardingAcceptanceDetail;
          var memberTfn = onboardingAcceptanceDetail.MemberTFN || { TaxFileNumber: '801682682', SalutationId: 1, Surname: 'Smith', FirstGivenName: 'john', DateOfBirth: '2015-08-26', Address: '34 Queens road', Suburb: 'Kew', AddressUsageCode: 'VIC', Postcode: 3126, CountryId: 13, BasisOfPaymentCode: 'F', ResidencyStatus: true, TaxFreeThresholdClaimed: true, SeniorAustraliansTaxOffsetClaimed: false, ZoneRebateClaimed: false, HelpIndicator: false, TradeSupportLoanIndicator: false };

          memberTfn.Salutation = salutations.filter(function(s) { return s.Id === memberTfn.SalutationId; }).map(function(s) { return s.Name; })[0];
          memberTfn.BasisOfPayment = onboarding.getBasisOfPaymentFromCode(memberTfn.BasisOfPaymentCode);
          memberTfn.Country = countries.filter(function(s) { return s.Value === memberTfn.CountryId; }).map(function(s) { return s.Label; })[0];

          if (memberTfn) {
              $scope.details = onboardingTaxFileNumber.setupMemberTfnFromModel(memberTfn);
          }

          $scope.details.SignatureType = 'Check box';
          $scope.typeSignatureChanged($scope.details.SignatureType);

          if (onboardingAcceptanceDetail.AcceptanceState !== onboardingConstants.ONBOARD_STATE_MEMBERTFNSIGNATURE) {
              $location.path(paths.get(onboarding.getRouteFromAcceptanceStage(onboardingAcceptanceDetail.AcceptanceState)).path);
          }
          else $scope.isLoading = false;
      }).catch(() => $scope.isLoading = false);

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

  $scope.downloadDivPdf = function() {
      $scope.isLoading = true;
      var fileName = ['declaration-form-', $scope.details.signedDate, '.pdf'].join('');
      onboardingTaxFileNumber.downloadTaxFormAsPdf(fileName)
      .then(function (res) {
              $window.open(res, '_self', '');
          })
      .finally(hideLoadingIndicator);
  };

  var hideLoadingIndicator=function() {
      $scope.isLoading = false;
  };
  
  $scope.update_tfnSignature = function (signaturePad) {
      $scope.isLoading = true;
      $scope.details.signature = signaturePad;
      
      $scope.details.tfnNumber = [$scope.details.tfnNumber1, $scope.details.tfnNumber2, $scope.details.tfnNumber3, $scope.details.tfnNumber4, $scope.details.tfnNumber5, $scope.details.tfnNumber6, $scope.details.tfnNumber7, $scope.details.tfnNumber8, $scope.details.tfnNumber9].join('');

      var memberTfnSignature = onboardingTaxFileNumber.setupMemberTfnSignatureFromView($scope.details);

      onboardingTaxFileNumber.tfnCandidateSignature(memberTfnSignature)
      .then(function(data) {
          $notify.add({
              message: 'Signature has been updated',
              type: 'success',
              visible: true
          });
      })
      .catch(function(){
          $notify.add({
              message: 'Signature could not be updated at this time. Please try again later',
              type: 'error',
              visible: true
          });
      })
      .finally(function () {
          hideLoadingIndicator();
      });
  };
  
  $scope.onboarding_tfnSignature = function() {
      if (!$scope.isSigned()) {
          return;
      }

      $scope.details.tfnNumber = [$scope.details.tfnNumber1, $scope.details.tfnNumber2, $scope.details.tfnNumber3, $scope.details.tfnNumber4, $scope.details.tfnNumber5, $scope.details.tfnNumber6, $scope.details.tfnNumber7, $scope.details.tfnNumber8, $scope.details.tfnNumber9].join('');

      var memberTfnSignature = onboardingTaxFileNumber.setupMemberTfnSignatureFromView($scope.details);
      $scope.isLoading = true;

      onboardingTaxFileNumber.updateTfnSignature(memberTfnSignature).then(function(data) {
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
      //onboardingTaxFileNumber.tfnNetworkInformation(tfnPayerNetworkInformationEntry).then(function (data) {
      //    $scope.isLoading = false;
      //});
  };
}

angular.module('ui.recruit.candidateonboard')
  .controller('onboardingSignatureCtrl', [
  '$rootScope', '$scope', '$route', '$location', '$q', '$window', 'Networks', 'Paths', 'Onboarding', 
  'OnboardingConstants', 'FileStorage', 'UploadConstants', 'API_BASE_URL', 'onboardingTaxFileNumber', '$notify',
  onboardingSignatureCtrl]);