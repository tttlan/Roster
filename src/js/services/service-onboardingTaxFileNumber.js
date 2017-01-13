function onboardingTaxFileNumber($server, API_BASE_URL, $q, Onboarding, OnboardingConstants) {
  
  const ONBOARDING_NAMESPACE = API_BASE_URL + 'onboarding/';

  let tfnCandidateDeclaration = (request) => {
    var url = ONBOARDING_NAMESPACE + 'member/TFNCandidateDeclaration';

    return $server.create({
      url: url,
      data: request
    });
  };

  let tfnCandidateSignature = (request) => {
    var url = ONBOARDING_NAMESPACE + 'member/TFNCandidateAcceptance';

    return $server.create({
        url: url,
        data: request
    });
  };

  let downloadTaxFormAsPdf = (resultFileName) => {
    var url = ONBOARDING_NAMESPACE + 'exportTFN?fileName=' + resultFileName + '&inline=false';
    return $server.get({
        url: url
    }).then(function(res){
        var downloadUrl = API_BASE_URL + res.data
        return downloadUrl;
    });
  };

  let updateTfnDeclaration = (memberTfnEntry) => 
      tfnCandidateDeclaration(memberTfnEntry)
      .then((response) => Onboarding.processCandidateAcceptance());

  let updateTfnSignature = (memberTfnSignature) => 
    tfnCandidateSignature(memberTfnSignature)
    .then((response) => Onboarding.processCandidateAcceptance());

  let tfnNetworkInformation = (tfnPayerNetworkInformationEntry) => {
    var url = ONBOARDING_NAMESPACE + 'TFNNetworkInformation';
    $server.update({
      url: url,
      data: tfnPayerNetworkInformationEntry
    });
  };

  let tfnKeyStore = () => {
    var url = ONBOARDING_NAMESPACE + 'TfnKeyStore';
    $server.create({
      url: url
    });
  };

  let setupMemberTfnSignatureFromView = (memberTfn) => {
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
  };

  let setupMemberTfnFromModel = (memberTFN) => {
    const getYesNoFromTrueFalse = (value) => value === true ? 'Yes' : value === false ? 'No' : 'n/a';

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
      angular.extend(details, _.pick(memberTFN, ['SalutationId','Salutation','Surname','FirstGivenName','SecondGivenName','Address',
        'Suburb','AddressUsageCode','Postcode','CountryId','Country','StateRegion', 'OtherName', 'AddressUsageCode',
        'BasisOfPaymentCode','BasisOfPayment'
      ]));

      details.fullName = details.Salutation + ' ' + details.FirstGivenName + ' ' + (details.OtherName ? details.OtherName + ' ' : '') + details.Surname;
      details.previousName = (memberTFN.PreviousName ? memberTFN.PreviousName + ' ' : '') + (memberTFN.PreviousSurname ? memberTFN.PreviousSurname + ' ' : '') + (memberTFN.PreviousOtherName ? memberTFN.PreviousOtherName + ' ' : '');
      details.BirthDay = memberTFN.DateOfBirth ? moment(memberTFN.DateOfBirth).format('YYYY-MM-DD') : '';
      details.fullAddress1 = details.Address + ' ' + (details.Suburb ? details.Suburb + ' ' : '') + ' ' + (details.Postcode ? details.Postcode + ' ' : '');
      details.fullAddress2 = (memberTFN.AddressUsageCode ? memberTFN.AddressUsageCode + ' ' : '') + ' ' + (details.Country ? details.Country + ' ' : '');
      details.Resident = getYesNoFromTrueFalse(memberTFN.ResidencyStatus);
      details.Threshold = getYesNoFromTrueFalse(memberTFN.TaxFreeThresholdClaimed);
      details.senior = getYesNoFromTrueFalse(memberTFN.SeniorAustraliansTaxOffsetClaimed);
      details.zone = getYesNoFromTrueFalse(memberTFN.ZoneRebateClaimed);
      details.Help = getYesNoFromTrueFalse(memberTFN.HelpIndicator);
      details.Sfss = getYesNoFromTrueFalse(memberTFN.TradeSupportLoanIndicator);
      details.AddressUsageCode = (memberTFN.AddressUsageCode ? memberTFN.AddressUsageCode: '');
      details.PreviousName = (memberTFN.PreviousName ? memberTFN.PreviousName: '');
      details.PreviousSurname = (memberTFN.PreviousSurname ? memberTFN.PreviousSurname: '');
      details.PreviousOtherName = (memberTFN.PreviousOtherName ? memberTFN.PreviousOtherName: '');
      details.OtherName = (memberTFN.OtherName ? memberTFN.OtherName: '');
      
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
  };

  let setupMemberTfnFromView = (memberTfn) => {

    const getTrueFalseFromYesNo = (value) => value === 'Yes';
    const signatureTypeCode = function(isCheckbox, isUpload, isDirect) {
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

    let memberTfnEntry = {};

    memberTfnEntry.TaxFileNumber = [memberTfn.tfnNumber1, memberTfn.tfnNumber2, memberTfn.tfnNumber3, memberTfn.tfnNumber4, memberTfn.tfnNumber5, memberTfn.tfnNumber6, memberTfn.tfnNumber7, memberTfn.tfnNumber8, memberTfn.tfnNumber9].join('');
    memberTfnEntry.DateOfBirth = moment(memberTfn.BirthDay).format('YYYY-MM-DD');
    memberTfnEntry.ResidencyStatus = getTrueFalseFromYesNo(memberTfn.Resident);
    memberTfnEntry.TaxFreeThresholdClaimed = getTrueFalseFromYesNo(memberTfn.Threshold);
    memberTfnEntry.SeniorAustraliansTaxOffsetClaimed = getTrueFalseFromYesNo(memberTfn.senior);
    memberTfnEntry.ZoneRebateClaimed = getTrueFalseFromYesNo(memberTfn.zone);
    memberTfnEntry.OverseasForcesRebateClaimed = memberTfnEntry.ZoneRebateClaimed;
    memberTfnEntry.DependantSpouseRebateClaimed = memberTfnEntry.ZoneRebateClaimed;
    memberTfnEntry.HELPIndicator = getTrueFalseFromYesNo(memberTfn.Help);
    memberTfnEntry.TradeSupportLoanIndicator = getTrueFalseFromYesNo(memberTfn.Help);
    memberTfnEntry.TfnAddressTypeId = 3;
    memberTfnEntry.TfnExemptionCode = 1;
    memberTfnEntry.StartDate = moment().format('YYYY-MM-DD');
    memberTfnEntry.EndDate = moment().format('YYYY-MM-DD');
    memberTfnEntry.DateDeclarationSigned = moment().format('YYYY-MM-DD');
    memberTfnEntry.StatementTypeCode = signatureTypeCode(memberTfn.IsCheckboxSignature, memberTfn.IsUploadSignature, memberTfn.IsDirectSignature);
    memberTfnEntry.AddressUsageCode = memberTfn.AddressUsageCode;
    
    angular.extend(memberTfnEntry, _.pick(memberTfn, [
      'Surname','FirstGivenName','OtherName','Address','Postcode','Suburb','CountryId', 'BasisOfPaymentCode',
      'State','SalutationId','signature','FileStoreId','signatureChecked','PreviousSurname',
      'PreviousName','PreviousOtherName','HasMadeSeparateEnquiry','IsExemption','IsPensionerExemption', 'AddressUsageCode'
    ]));

    return memberTfnEntry;
  };

  return {
    tfnCandidateDeclaration,
    tfnCandidateSignature,
    downloadTaxFormAsPdf,
    updateTfnDeclaration,
    updateTfnSignature,
    tfnNetworkInformation,
    tfnKeyStore,
    setupMemberTfnSignatureFromView,
    setupMemberTfnFromModel,
    setupMemberTfnFromView,
  };

}

angular.module('ui.services')
    .service('onboardingTaxFileNumber',  ['$server', 'API_BASE_URL', '$q', 'Onboarding', 'OnboardingConstants', onboardingTaxFileNumber]);