/**
 * @Author Anant Chaudhary	19-11-2016
 */

var loggedInBranchCode = '';
function getTokenWiseLrSequence(destinationBranchId, branchCode) {
	loggedInBranchCode = branchCode

	var jsonObject					= new Object();
	var billSelectionId				= $('#billSelection').val()
	
	if(billSelectionId == undefined)
		billSelectionId	= Number(configuration.defaultBillSelectionId);
	
	jsonObject.billSelection		= billSelectionId;
	jsonObject.destinationBranchId	= destinationBranchId;

	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("TokenWiseLrSequenceAjaxAction.do?pageId=9&eventId=23",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('info', lrSequnceCounterNotFoundInfoMsg);
				} else {
					if (data.Success) {
						SequenceCounter = data.SequenceCounter;
						setSequenceRange();
					}else if(data.empty) {
						showMessage('error', srcDestWiseSeqCounterNotFoundInfoMsg);
						setValueToHtmlTag('lrnumber', '');
						$('#lrNumberManual').val(0);
						SequenceCounter = null;
					}
				}
			});
}

function getPartyWiseLrSequence(corporateAccountId, partyDetails, partyType) {
	
	if(configuration.isPartySequenceBranchWise == 'true') {
		let branchIds 		= configuration.branchIdsForPartySequence;
		let executiveBranch = executive.branchId + "";
		
		if(!branchIds.includes(executiveBranch))
			return;
	}
	
	let jsonObject					= new Object();
	jsonObject.corporateAccountId	= corporateAccountId;

	let jsonStr = JSON.stringify(jsonObject);
	$.getJSON("PartyWiseLrSequenceAjaxAction.do?pageId=9&eventId=31"
			,{json:jsonStr}, function(data){
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('info', lrSequnceCounterNotFoundInfoMsg);
				} else if (configuration.branchAndPartyCodeWiseLrSequenceForConsignor == true || configuration.branchAndPartyCodeWiseLrSequenceForConsignor == 'true'){
					SequenceCounter 	= data.SequenceCounter;
					partyWiseSequence	= data.partyWiseSequence
					
					if(partyDetails.partyCode == undefined || partyDetails.partyCode == 'undefined') {
						if(configuration.resetBillingPartyIfPartyWiseSequenceNotPresent == 'true') {
							$('#billingPartyName').val('');
							$('#billingPartyId').val('0');
						}
								
						showMessage('error', "Party Code is Not Defined! ");
					} else if((partyType == PARTY_TYPE_CONSIGNOR || partyType == TAX_PAID_BY_TRANSPORTER_ID) && SequenceCounter != undefined)
						setBranchANdPartySequenceRange(partyDetails, SequenceCounter.branchCode);
				 } else
					partyWiseSequence	= data.partyWiseSequence
					
				if (partyWiseSequence) {
					SequenceCounter = data.SequenceCounter;
						
					if(configuration.partyCodeWiseLrSequenceCounter == 'true') {
						if(partyDetails.partyCode == undefined || partyDetails.partyCode == 'undefined') {
							if(configuration.resetBillingPartyIfPartyWiseSequenceNotPresent == 'true') {
								$('#billingPartyName').val('');
								$('#billingPartyId').val('0');
								$('#consignorName').val('');
							}
								
							showMessage('error', "Party Code is Not Defined! ");
						} else
							setPartySequenceRange(partyDetails);
					} else
						setPartySequenceRange(partyDetails);
				} else if(!partyWiseSequence) {
					if(configuration.partyCodeWiseLrSequenceCounter == 'true' 
						&& (configuration.useNormalSequenceForTbbPartyIfSeparateSequenceNotFound == 'false')) {
						if($('#SequenceTypeSelection').val() == 1 || !isManualWayBill) {
							if(configuration.resetBillingPartyIfPartyWiseSequenceNotPresent == 'true') {
								$('#billingPartyName').val('');
								$('#billingPartyId').val('0');
							}	
							
							if($('#wayBillType').val() == WayBillType.WAYBILL_TYPE_CREDIT)
								showMessage('error', "Party LR Sequence Not Found Please Add Party LR Sequence ");
						}
					} else {
						showMessage('error', partySequenceCounterError);
					}
						
					if(!isManualWayBill) {
						$('#lrNumberManual').val(0);
						$('#lrNumberManual').prop('disabled', true);
					}
						
					SequenceCounter = null;
					setWayBillNumber(jsondata);
				}
					
				if(data.SequenceCounter != null && data.SequenceCounter != undefined && data.SequenceCounter != 'undefined') {
					maxRangeForLrSequence = data.SequenceCounter.maxRange;
					minRangeForLrSequence = data.SequenceCounter.minRange;
				}
				
				isTransporter 		= partyDetails.transporter;
				
				getPartyWiseLrSequenceForManulLr();
				checkSequenceRangeInPartyWiseLrSequenceForManualLrField();
					
				if(partyWiseSequence) {
					let subRegionIds 			= configuration.doNotBookLrWithOutPartyCodeInTbb;
					let executiveSubRegionId 	= executive.subRegionId + "";
				
					if(subRegionIds.includes(executiveSubRegionId)) {
						partySequenceExists = true;
						tbbPartyCode 		= partyDetails.partyCode;
						
						if(isManualWayBill) {
							if((partyDetails.partyCode == null || partyDetails.partyCode == undefined || partyDetails.partyCode == 'undefined' || partyDetails.partyCode == '') && partyDetails.transporter){
								$('#billingPartyName').focus();
								$('#billingPartyName').val('');
								$('#billingPartyId').val('0');
								showMessage('error', "To Book Lr Enter Party Code In Party Master ! ");
								return;
							}
						} else if(isTransporter) {
							$('#billingPartyName').focus();
							$('#billingPartyId').val('0');
							$('#billingPartyName').val('');
							showMessage('error', "Auto Booking Not Allow For This ("+partyDetails.displayName+") Party ! ");
							return;
						}
					}

					return true;
				}
			});
}

function setBranchANdPartySequenceRange(partyDetails, branchCode) {
	if(SequenceCounter != null) {
		if($('#SequenceTypeSelection').val() == MANUAL_LR_AUTO_SEQUENCE )
			setValueToHtmlTag("");
		else
			setValueToHtmlTag('lrnumber', ' Next LR No : ' + branchCode + '/' + partyDetails.partyCode + '/' + (Number(SequenceCounter.nextVal) + 1));
	}
}

function setPartySequenceRange(partyDetails) {
	if(SequenceCounter != null) {
		tbbPartyCode = partyDetails.partyCode;
		
		if(configuration.partyCodeWiseLrSequenceCounter == 'true') {		
			if(!isManualWayBill) {
				if(configuration.partyCodeWiseWayBillNumberGeneration == 'true') {
					if(configuration.showSeqRangeInpartyCodeWiseWayBillNumberGeneration == 'true') {
						setValueToHtmlTag('lrnumber', ' ( ' + SequenceCounter.minRange + ' - ' + SequenceCounter.maxRange + ' ) ');
						setValueToHtmlTag('seqRange', ' ( ' + SequenceCounter.minRange + ' - ' + SequenceCounter.maxRange + ' ) ');
					} else {
						setValueToHtmlTag('lrnumber', partyDetails.partyCode + '/' + (Number(SequenceCounter.nextVal) + 1));
						setValueToHtmlTag('seqRange', partyDetails.partyCode + '/' + (Number(SequenceCounter.nextVal) + 1));
					}
				} else {
					setValueToHtmlTag('lrnumber', SequenceCounter.branchCode + '/' + partyDetails.partyCode + '/' + (Number(SequenceCounter.nextVal) + 1));
					setValueToHtmlTag('seqRange', SequenceCounter.branchCode + '/' + partyDetails.partyCode + '/' + (Number(SequenceCounter.nextVal) + 1));
				} 
			} else
				setValueToHtmlTag('seqRange', SequenceCounter.branchCode + '/' + partyDetails.partyCode + '/' + (Number(SequenceCounter.nextVal) + 1));
		} else if(configuration.allowPartyCodeWiseSequenceForLimitedPartiesAndBranch == 'true' && !isManualWayBill) {
			var branchesIdArr 	= (configuration.branchIdsForPartyCodeWiseSequence).split(',');
			var partyIdArr 		= (configuration.partyIdsForPartyCodeWiseSequence).split(',');
			
			if(isValueExistInArray(branchesIdArr, branchId) && isValueExistInArray(partyIdArr, partyDetails.corporateAccountId)) {
				if(partyDetails.partyCode != undefined) {
					setValueToHtmlTag('lrnumber', partyDetails.partyCode + '/' + (Number(SequenceCounter.nextVal) + 1));
					setValueToHtmlTag('seqRange', partyDetails.partyCode + '/' +  (Number(SequenceCounter.nextVal) + 1));
				} else {
					setValueToHtmlTag('lrnumber', ' ( ' + SequenceCounter.minRange + ' - ' + SequenceCounter.maxRange + ' ) ');
					setValueToHtmlTag('seqRange', ' ( ' + SequenceCounter.minRange + ' - ' + SequenceCounter.maxRange + ' ) ');
				}
			} else {
				setValueToHtmlTag('lrnumber', ' ( ' + SequenceCounter.minRange + ' - ' + SequenceCounter.maxRange + ' ) ');
				setValueToHtmlTag('seqRange', ' ( ' + SequenceCounter.minRange + ' - ' + SequenceCounter.maxRange + ' ) ');
			}
		} else {
			setValueToHtmlTag('lrnumber', ' ( ' + SequenceCounter.minRange + ' - ' + SequenceCounter.maxRange + ' ) ');
			setValueToHtmlTag('seqRange', ' ( ' + SequenceCounter.minRange + ' - ' + SequenceCounter.maxRange + ' ) ');
		}
			
		if(configuration.isEditAllowedForPartySequence == 'false' && (!isManualWayBill || ($('#SequenceTypeSelection').val() == 1 && isManualWayBill))
		&& configuration.partyCodeWiseLrSequenceCounter == 'false') {
			$('#lrNumberManual').val(Number(SequenceCounter.nextVal) + 1);
			$('#lrNumberManual').prop('disabled', true);
		} else if(configuration.allowPartyCodeWiseSequenceForLimitedPartiesAndBranch == 'true' && (!isManualWayBill || isManualWayBill && $('#SequenceTypeSelection').val() == 1)) {
			$('#lrNumberManual').val(Number(SequenceCounter.nextVal) + 1);
			$('#lrNumberManual').prop('disabled', true);
		} else if(configuration.partyCodeWiseManualWayBillNumberGenerationInAutoLr == 'true') {
			$('#lrNumberManual').val(Number(SequenceCounter.nextVal) + 1);
			$('#lrNumberManual').prop('disabled', false);
		} else
			$('#lrNumberManual').prop('disabled', false);
	}
}

function setSequenceRangeForAll() {
	if(SequenceCounter != null) {
		setValueToHtmlTag('lrnumber', ' ( ' + SequenceCounter.minRange + ' - ' + SequenceCounter.maxRange + ' ) ');
	}
}

function setSequenceRange() {
	if(SequenceCounter != null) {
		//setValueToHtmlTag('lrnumber', ' ( ' + SequenceCounter.minRange + ' - ' + SequenceCounter.maxRange + ' ) ');
		setSequenceRangeForAll();
		
		if(configuration.showNextLRNumber == 'true' || configuration.showNextLRNumber == true) {
			if(jsondata.SHOW_NEXT_LR_NUMBER) {
				if(Number(SequenceCounter.nextVal) > 0) {
					var jsonObject		= new Object();

					jsonObject.filter			= 3;
					
					if(configuration.showBranchCodeWiseTokenLrNumberInManualLRField == 'true')
						jsonObject.lrNumberManual	= loggedInBranchCode + '/' + SequenceCounter.nextVal;
					else
						jsonObject.lrNumberManual	= SequenceCounter.nextVal;

					var jsonStr = JSON.stringify(jsonObject);

                    $.getJSON("WayBillAjaxAction.do?pageId=3&eventId=13", {json:jsonStr}, function(data) {
						if(data.isDuplicateLR == undefined) {
							if(configuration.showBranchCodeWiseTokenLrNumberInManualLRField == 'true')
								$('#lrNumberManual').val(loggedInBranchCode + '/' + (Number(SequenceCounter.nextVal) + 1));
							else 
								$('#lrNumberManual').val(Number(SequenceCounter.nextVal) + 1);
						} else if(jsondata.SHOW_NEXT_LR_NUMBER_INITIAL_DIGITS && (SequenceCounter.nextVal).toString().length > 4)
							$('#lrNumberManual').val((SequenceCounter.nextVal).toString().substr(0, 4));
						else if(configuration.showBranchCodeWiseTokenLrNumberInManualLRField == 'true')
							$('#lrNumberManual').val(loggedInBranchCode + '/' + SequenceCounter.nextVal);
						else
							$('#lrNumberManual').val(SequenceCounter.nextVal);
					});
				}
			}
		}
	}
}

function setManualSequenceRange() {
	
	if(SequenceCounter != null || SequenceCounter != undefined) {
		if(configuration.allowLoginBranchCodeInReverseLrBooking == 'true' && (Number($('#manualEntryType').val()) == TransportCommonMaster.MANUAL_REVERSE_ENTRY)){
			setValueToHtmlTag('seqRange', '');
		}else if(configuration.operationalBranchWiseLRSeqCounter == 'true')
			setValueToHtmlTag('seqRange', ' Next LR No : '+ operationalBranchCode + '-' + SequenceCounter.nextVal);
		else if(configuration.handlingBranchWiseManualRangeSequenceCounter == 'true')
			setValueToHtmlTag('seqRange', '');
		else if(configuration.executiveBranchWiseOnlyManualRangeSequenceCounter == 'true' && $('#SequenceTypeSelection').val() == 1 	)
			setValueToHtmlTag('seqRange', '');
		else
			setValueToHtmlTag('seqRange', ' ( ' + SequenceCounter.minRange + ' - ' + SequenceCounter.maxRange + ' ) ');
	}
}

function setAutoSequenceRange(data) {
	if(SequenceCounter != null || SequenceCounter != undefined) {
		if(SequenceCounter.billSelection == 1) {
			if(configuration.BranchCodeWiseWayBillNumberGeneration == 'true')
				setValueToHtmlTag('lrnumber', ' Next LR No Bill : '+ data.NextWaybillNumberBranchCode + '/' + data.NextWaybillNumber);
			else
				setValueToHtmlTag('lrnumber', ' Next LR No Bill : '+ data.NextWaybillNumber);		
		} else if(SequenceCounter.billSelection == BOOKING_GST_BILL) {
			if(configuration.dateWiseWayBillNumberGeneration == 'true') {
				var today = new Date();
				var dd = String(today.getDate()).padStart(2, '0');

				setValueToHtmlTag('lrnumber', ' Next LR No : '+ dd + '/' + data.NextWaybillNumber);
			} else if(configuration.BranchCodeWiseWayBillNumberGeneration == 'true')
				setValueToHtmlTag('lrnumber', ' Next LR No : '+ data.NextWaybillNumberBranchCode + '/' + data.NextWaybillNumber);
			else
				setValueToHtmlTag('lrnumber', ' Next LR No : '+ data.NextWaybillNumber);
		} else if(configuration.BranchCodeWiseWayBillNumberGeneration == 'true') {
			let letterForMonth = getLetterForMonth(data.currentMonth);
			if(configuration.lrNumberFormatForWithoutBill == 20)
				setValueToHtmlTag('lrnumber', ' Next LR No Estimate : '+ data .NextWaybillNumberBranchCode + '/' + letterForMonth + '/' + data.NextWaybillNumber);
			else if(configuration.abbrCodeForEstimateLRSequence != undefined && configuration.abbrCodeForEstimateLRSequence != '')
				setValueToHtmlTag('lrnumber', ' Next LR No Estimate : '+ data .NextWaybillNumberBranchCode + '/' + configuration.abbrCodeForEstimateLRSequence + '/' + data.NextWaybillNumber);
			else
				setValueToHtmlTag('lrnumber', ' Next LR No Estimate : '+ data .NextWaybillNumberBranchCode + '/' + data.currentMonth + '/' + data.NextWaybillNumber);
		} else if(configuration.lrNumberGenerationForWithoutBillLRWithPrefix == 'true' && configuration.prefixForSequenceNumberGeneration !='')
			setValueToHtmlTag('lrnumber', ' Next LR No Estimate : ' + configuration.prefixForSequenceNumberGeneration + data.NextWaybillNumber);
		else
			setValueToHtmlTag('lrnumber', ' Next LR No Estimate : ' + data.NextWaybillNumber);

		if(configuration.showNextLRNumberInManualLrField == 'true')
			$('#lrNumberManual').val(data.NextWaybillNumber);
	}
}

function setBookingTypeWiseSequenceCounter() {
	if(configuration.isBookingTypeFTLWiseSequenceCounter == 'true')
		return;
	
	if(configuration.BookingTypeWiseSequenceCounter == 'false')
		return;

	var jsonObject					= new Object();

	jsonObject.bookingTypeId			= $("#bookingType").val();

	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("BookingTypeWiseSeqCounterAjaxAction.do?pageId=9&eventId=22",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('info', lrSequnceCounterNotFoundInfoMsg);
				} else {
					if (data.Success) {
						var SequenceCounter = data.SequenceCounter;
					
						if(configuration.SundryWiseBranchCodeWayBillNumberGeneration == 'true' && $("#bookingType").val() == BOOKING_TYPE_SUNDRY_ID)
							setBookingTypeWiseNextLRNumber(data);
						else if(SequenceCounter.nextVal >= SequenceCounter.minRange && SequenceCounter.nextVal <= SequenceCounter.maxRange)
							setBookingTypeWiseNextLRNumber(data);
						else {
							showMessage('error', lrSequnceCounterNotFoundInfoMsg);
							setValueToHtmlTag('lrnumber', '');
						}
					} else if(data.empty) {
						showMessage('error', lrSequnceCounterNotFoundInfoMsg);
					}
				}
			});
}

function setBookingTypeWiseNextLRNumber(data) {
	if(configuration.BookingTypeWiseSequenceCounter) {
		if(data.NextWaybillNumber != null) {
			if(configuration.isBookingTypeFTLWiseSequenceCounter == 'true'){

		/*if(valObjIn.getBoolean("isBranchExist")) {
			if(valObjIn.getShort("bookingType") == BookingTypeConstant.BOOKING_TYPE_FTL_ID){
				setValueToHtmlTag('lrnumber', ' Next LR No : '+ data.branchMod.branchCode + '/'+ BookingTypeConstant.BOOKING_TYPE_FTL_NAME + '/' + data.NextWaybillNumber);
			} else if(valObjIn.getShort("bookingType") == BookingTypeConstant.BOOKING_TYPE_SUNDRY_ID || valObjIn.getShort("bookingType") == BookingTypeConstant.DIRECT_DELIVERY_DIRECT_VASULI_ID){
				//setValueToHtmlTag('lrnumber', ' Next LR No : '+ data.NextWaybillNumberBranchCode + '/' + data.NextWaybillNumber);
				if(valObjIn.getShort("waybilltype") == WayBillTypeConstant.WAYBILL_TYPE_PAID) {
					setValueToHtmlTag('lrnumber', ' Next LR No : '+ data.NextWaybillNumberBranchCode + '/' + createDate + '/' + data.NextWaybillNumber);
				}else {
					setValueToHtmlTag('lrnumber', ' Next LR No : '+ data.NextWaybillNumberBranchCode + '/' + data.NextWaybillNumber);
				}
			}
			
		}else {
			if(valObjIn.getShort("bookingType") == BookingTypeConstant.BOOKING_TYPE_FTL_ID){
				setValueToHtmlTag('lrnumber', ' Next LR No : '+ data.branchMod.branchCode + '/'+ BookingTypeConstant.BOOKING_TYPE_FTL_NAME + '/' + data.NextWaybillNumber);
			} else if(valObjIn.getShort("bookingType") == BookingTypeConstant.BOOKING_TYPE_SUNDRY_ID || valObjIn.getShort("bookingType") == BookingTypeConstant.DIRECT_DELIVERY_DIRECT_VASULI_ID){
				setValueToHtmlTag('lrnumber', ' Next LR No : '+ data.NextWaybillNumberBranchCode + '/' + data.NextWaybillNumber);
			}
		}*/
	
				
				/*if($("#bookingType").val() == BookingTypeConstant.BOOKING_TYPE_FTL_ID) {
					setValueToHtmlTag('lrnumber', ' Next LR No : '+ data.branchMod.branchCode + '/'+ BookingTypeConstant.BOOKING_TYPE_FTL_NAME + '/' + data.NextWaybillNumber);
				}else {
					if(data.isBranchExist == 'true' || data.isBranchExist == true) {
						if($('#wayBillType').val() == WayBillType.WAYBILL_TYPE_PAID) {
							setValueToHtmlTag('lrnumber', ' Next LR No : '+ data.branchMod.branchId + '/' + data.NextWaybillNumber);
						}else {
							setValueToHtmlTag('lrnumber', ' Next LR No : '+ data.NextWaybillNumberBranchCode + '/' + data.NextWaybillNumber);
						}
					}else {
							setValueToHtmlTag('lrnumber', ' Next LR No : '+ data.NextWaybillNumberBranchCode + '/' + data.NextWaybillNumber);
					}
				}*/
			} else if(configuration.SundryWiseBranchCodeWayBillNumberGeneration == 'true' && $("#bookingType").val() == BOOKING_TYPE_SUNDRY_ID)
				setValueToHtmlTag('lrnumber', ' Next LR No : '+ data.NextWaybillNumberBranchCode + '/' + data.NextWaybillNumber);
			else
				setValueToHtmlTag('lrnumber', ' Next LR No : '+ data.NextWaybillNumber);
		}
	}
}

function checkSubRegionForManualRange(){
    if (configuration.allowSubRegionWiseSourceBranchManualRangeSequence == 'true'){
        var subRegionIdArr = configuration.subRegionIdsForSourceBranchManualRangeSequence.split(',');
        return isValueExistInArray(subRegionIdArr, executive.subRegionId);
    }
    
    return false;
}

function getSourceBranchWiseManualLrSequence(sourceBranchId) {
	if(isBookingFromDummyLS
		|| configuration.SourceBranchWiseManualRangeSequenceCounter == 'false' && configuration.operationalBranchWiseLRSeqCounter == 'false' && !checkSubRegionForManualRange())
		return;
	
	if(isExecutiveBranchWiseSeqCounterChecked)
		sourceBranchId	= executive.branchId;
	
	var jsonObject					= new Object();
	var	sequenceType				= 2;
	jsonObject.sourceBranchId		= sourceBranchId;
	
	if($('#SequenceTypeSelection').exists())
		sequenceType			= $('#SequenceTypeSelection').val();
	
	jsonObject.sequenceType		= sequenceType;

	var jsonStr = JSON.stringify(jsonObject);
	
	$("#lrNumberManual" ).val('');

	$.getJSON("SourceBranchWiseManualRangeSequenceAjaxAction.do?pageId=9&eventId=24",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('info', lrSequnceCounterNotFoundInfoMsg);
				} else {
					if (data.Success) {
						SequenceCounter = data.SequenceCounter;
						
						if(configuration.operationalBranchWiseLRSeqCounter)
							operationalBranchCode = data.branchCode;


						setManualSequenceRange();
					} else if(data.empty) {
						if(sequenceType != 2 || checkSubRegionForManualRange())
							showMessage('error', lrSequnceCounterNotFoundInfoMsg);
						
						setValueToHtmlTag('seqRange', '');
						SequenceCounter = null;
					}
				}
			});
}

function getLRSequenceOnBillSelection() {
	if(isBookingFromDummyLS 
		|| configuration.ManualLrSequenceOnBillSelection == 'false' && isManualWayBill 
		|| configuration.lrSequenceOnBillSelection == 'false')
		return;
	
	var jsonObject					= new Object();
	
	var billSelectionId				= $('#billSelection').val();
	
	if(billSelectionId == undefined)
		 billSelectionId = Number(configuration.defaultBillSelectionId);
		 
	if(configuration.groupLevelSeperateSequenceForWithoutBillLR == 'true' && billSelectionId == BOOKING_WITH_BILL)
		return;

	jsonObject.billSelection		= billSelectionId;
	
	if(isManualWayBill)
		jsonObject.sequenceType		= 2;
	else
		jsonObject.sequenceType		= 1;

	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("ManualLrSequenceOnBillSelectionAjaxAction.do?pageId=9&eventId=25",
			{json:jsonStr}, function(data) {
				
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('info', lrSequnceCounterNotFoundInfoMsg);
				} else {
					if (data.Success) {
						SequenceCounter = data.SequenceCounter;
						
						if(SequenceCounter.sequenceType = 1 && !isManualWayBill)
							setAutoSequenceRange(data);
						else if(SequenceCounter.sequenceType = 1 && isManualWayBill && configuration.seperateSequenceForWithoutBillForManualLr == 'true')
							setAutoSequenceRangeInManual(data);
						else
							setManualSequenceRange();
					} else if(data.empty) {
						showMessage('error', lrSequnceCounterNotFoundInfoMsg);
						setValueToHtmlTag('seqRange', '');
						SequenceCounter = null;
					}
				}
			});
}

function checkSourceDestinationWiseSequence(branchId) {

	var jsonObject					= new Object();
	var billSelectionId				= $('#billSelection').val();
	
	if(billSelectionId == undefined)
		 billSelectionId = Number(configuration.defaultBillSelectionId);
	 
	jsonObject.destBranchId			= branchId;
	jsonObject.billSelection		= billSelectionId;

	var jsonStr = JSON.stringify(jsonObject);
	$.getJSON("CheckSourceDestinationWiseSequenceAjaxAction.do?pageId=9&eventId=26",
			{json:jsonStr}, function(data) {
				if (!jQuery.isEmptyObject(data)) {
					if (data.errorCode) {
						if (data.errorDescription) {
							showMessage('error', iconForErrMsg + ' ' + data.errorDescription);
							setValueToHtmlTag('lrnumber', '');
							hideLayer();
							return;
						} else {
							hideAllMessages();
						}
					} else if(!isManualWayBill)
						setNextLRNumber(data);
				}
			});
}

function setNextLRNumber(data) {
	var nextWayBillNumber			= data.NextWaybillNumber;
	var nextWaybillNumberBranchCode	= data.NextWaybillNumberBranchCode;
	destBranch = data.destinationBranch;
	
	if(configuration.BranchCodeWiseWayBillNumberGeneration == 'true') {
		setValueToHtmlTag('lrnumber', ' Next LR No : '+ nextWaybillNumberBranchCode + '/' + (Number(nextWayBillNumber) + Number(1)));
	} else if(configuration.branchAbbrevationWiseWayBillNumberGenerationAllow == 'true') {
		if(destBranch.abbrevationName == undefined || destBranch.abbrevationName == 'undefined') {
			showMessage('error', iconForErrMsg + 'Destination Branch Abbrevation Not Found ! Please Update Destination Branch Abbrevation First To Create LR ! ! ! ');
			setValueToHtmlTag('lrnumber', '');
			return false;
		} else if(configuration.SeperateSequenceForWithoutBillLR == 'true') {
			if(Number(data.billSelectionId) == BOOKING_WITH_BILL)
				setValueToHtmlTag('lrnumber', ' Next LR No : '+ loggedInBranch.abbrevationName + destBranch.abbrevationName + Number(nextWayBillNumber + 1));
			else if(Number(data.billSelectionId) == BOOKING_WITHOUT_BILL)
				setValueToHtmlTag('lrnumber', ' Next LR No : ' + loggedInBranch.abbrevationName + destBranch.abbrevationName + '/' + data.currentMonth + '/' + Number(nextWayBillNumber + 1));
		} else
			setValueToHtmlTag('lrnumber', ' Next LR No : ' + loggedInBranch.abbrevationName + destBranch.abbrevationName + Number(nextWayBillNumber + 1));
	} else
		setValueToHtmlTag('lrnumber', ' Next LR No : '+ Number(nextWayBillNumber + 1));
}

function getLRNumberManual(jsonObject) {
	var manualLRNumber 	= '';
	
	if($('#lrNumberManual').exists() && $('#lrNumberManual').val() != '')
		manualLRNumber 	= $('#lrNumberManual').val().trim();
	
	var branchCode		= $('#branhCode').val();
	
	if(isManualWayBill || isDummyLR) {
		if(branchCode != undefined && (configuration.manualLrNoWithMonth == 'true' || doNotHideLRNumberManual))
			jsonObject.lrNumberManual	= branchCode + manualLRNumber.toUpperCase();
		else if (configuration.LRNumberManual == 'true' && !isAutoSequenceCounter)
			jsonObject.lrNumberManual	= manualLRNumber.toUpperCase();
	} else if (configuration.TokenWiseAutoLrSequence == 'true' && !isAutoSequenceCounter && !isManualWayBill) {
		jsonObject.lrNumberManual	= manualLRNumber.toUpperCase();
	} else if(configuration.LRNumberManual == 'true' && !isAutoSequenceCounter) {
		if(branchCode != undefined)
			jsonObject.lrNumberManual	= branchCode + manualLRNumber.toUpperCase();		
		else
			jsonObject.lrNumberManual	= manualLRNumber.toUpperCase();		
	} else if (configuration.partyCodeWiseManualWayBillNumberGenerationInAutoLr == 'true')
		jsonObject.lrNumberManual	= manualLRNumber.toUpperCase();
		
	jsonObject.lrNumberWithoutBranchCode = manualLRNumber;
}

function getPartyLRManualSequence(jsonObject){
	var wayBillType 	= $('#wayBillType').val();
	
	if(configuration.seperateSequenceRequiredForTbbParty == 'true' && wayBillType == WAYBILL_TYPE_CREDIT) {
		var manualLRNumber 	= $('#lrNumberManual').val();
		jsonObject.lrNumberManual	= manualLRNumber.toUpperCase();	
	}
}

/*
 * Function called in WayBillValidation.js to check Manaul LR Range
 */
function checkLrWithinRange() {
	if(isBookingFromDummyLS || (isManual && configuration.allowSubRegionWiseSourceBranchManualRangeSequence == 'true' && !checkSubRegionForManualRange()))
		return;
	
	var LrNumber = $('#lrNumberManual').val();

	if(SequenceCounter != null) {
		if(LrNumber < SequenceCounter.minRange || LrNumber > SequenceCounter.maxRange) {
			setTimeout(function(){showMessage('info', lrNumberWithinRangeInfoMsg(SequenceCounter.minRange, SequenceCounter.maxRange)) }, 0);
			toogleElement('error','block');
			changeError1('lrNumberManual','0','0');
			
			if(!isManualWayBill)
				$('#lrNumberManual').focus();
			
			setTimeout(function(){ $('#lrNumberManual').focus(); }, 0);
		}
	} else if(isManualWayBill) {
		showMessage('error', lrSequnceCounterNotFoundInfoMsg);
		toogleElement('error','block');
		changeError1('lrNumberManual','0','0');	
		setTimeout(function(){ $('#lrNumberManual').focus(); }, 0);
		$("#lrNumberManual" ).val('');
	} else {
		showMessage('error', firstDestinationBranchErrMsg);
		toogleElement('error','block');

		if(!isTokenThroughLRBooking && !isTokenWayBill) {
			changeError1('destination','0','0');
			$('#lrNumberManual').val(0);
		  	$('#destination').focus();
			setTimeout(function(){ $('#destination').focus(); }, 0);
		}
	}
}

// Function For Check LR Sequence within Range or Not
function checkLrWithinRangeForParty() {
	if(isBookingFromDummyLS)
		return;
	
	var LrNumber = $('#lrNumberManual').val();
	
	if(SequenceCounter != null) {
		if(LrNumber < SequenceCounter.minRange || LrNumber > SequenceCounter.maxRange) {
			setTimeout(function(){showMessage('info', lrNumberWithinRangeInfoMsg(SequenceCounter.minRange, SequenceCounter.maxRange)) }, 0);
			toogleElement('error','block');
			changeError1('lrNumberManual','0','0');
			setTimeout(function(){ $('#lrNumberManual').focus(); }, 0);
		}
	}
}

function checkIfLRNumberExist() {
	if (configuration.LRNumberManual != 'true' && isAutoSequenceCounter
		|| !lrNumberManualValidation())
		return false;

	if($('#lrNumberManual').val() != '')
		getWayBillDetailsByTokenNumber($('#lrNumberManual').val().trim());
}

function checkIfManualLRNumberAndDate() {
	// donot validate manual date from auto booking page
	if(configuration.validateLrManualNumberAndAutoSequenceOnAutoPage == 'false' && !isManualWayBill && !($('#lrNumberManual').exists()) && !($('#lrNumberManual').is(":visible"))
	&& !lrDateValidation())
		return false;
	
	if(configuration.isDuplicateManualLRGenerationAllow == 'true')
		return;
	
	if(isBookingFromDummyLS)
		return;

	if(isDummyLR)
		return;
	
	if(configuration.validateLrManualNumberAndAutoSequenceOnAutoPage == 'false' && !isManualWayBill && !($('#lrNumberManual').exists()) && !($('#lrNumberManual').is(":visible"))
	&& configuration.CheckNextLRNumberOnAutoManualLRBooking == 'false')
		return;

	if (configuration.LRNumberManual != 'true' && isAutoSequenceCounter || !lrNumberManualValidation())
		return false;

	if(isManualWayBill && configuration.hideManualLrDate == 'false' && $('#lrDateManual').val() != '' && $('#lrDateManual').val() != undefined && !isValidDate($('#lrDateManual').val())){
		showMessage('error',"Please Enter Valid Date");
		return false;
	}
	
	isManualLRNumberAlreadyExist		= false;
	
	if($('#lrNumberManual').val() != '') {
		var jsonObject		= new Object();

		jsonObject.filter			= 3;
		jsonObject.lrDateManual		= $('#lrDateManual').val();
		jsonObject.lrNumberManual	= isManualWayBill;
		getLRNumberManual(jsonObject);

		var jsonStr = JSON.stringify(jsonObject);

		$.getJSON("WayBillAjaxAction.do?pageId=3&eventId=13",
				{json:jsonStr}, function(data) {
					if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
						showMessage('error', iconForErrMsg + ' ' + data.errorDescription);

						isManualLRNumberAlreadyExist	= true;
						if(isManualLRNumberAlreadyExist){
							$('#lrNumberManual').focus();
							changeError1('lrNumberManual','0','0');
							return false;
						}else{
							removeError('lrNumberManual','0','0');
						}
					}
				});
	}
}

function getPartyWiseLrSequenceForManulLr() {
	if(isManualWayBill) {
		var subRegionIds = configuration.partyWiseSequenceBySubregionId;
		var executiveSubRegionId = executive.subRegionId + "";
		
		if(subRegionIds.includes(executiveSubRegionId)) {
			var lrNumberManual = Number($("#lrNumberManual").val());
			
			if(SequenceCounter != null && isTransporter) {
				if (maxRangeForLrSequence >= lrNumberManual && minRangeForLrSequence <= lrNumberManual) {
				} else if(maxRangeForLrSequence > 0 && minRangeForLrSequence > 0) {
					$('#lrNumberManual').focus();
					$('#lrNumberManual').val('');
					showMessage("error","Please Enter LR Number Within "+ minRangeForLrSequence +" - "+ maxRangeForLrSequence +" ! ");
				}
			}
		}
	}
}

function setNextLRNumberAfterBookingOnAutoBooking() {
	if(configuration.setNextLRNumberAfterBookingOnAutoBooking == 'true') {
		var nextWayBillNumber 	= '';
		
		if(prevLRNo != null && prevLRNo != undefined) {
			if (prevLRNo.includes(configuration.waybillNumberSeperator)) {
				var strArr = prevLRNo.split(configuration.waybillNumberSeperator);
				
				if(configuration.showBranchCodeWiseNextLRNumberInManualLrField == 'true')
					nextWayBillNumber = strArr[0] + configuration.waybillNumberSeperator + (Number(strArr[1]) + 1);
				else
					nextWayBillNumber = Number(strArr[1]) + 1;
			} else if(typeof wayBillNumber !== 'undefined' && wayBillNumber != null && wayBillNumber != undefined) {
				nextWayBillNumber = Number(wayBillNumber) + 1;
			}
			$('#lrNumberManual').val(nextWayBillNumber);
		}
	}
}

function checkWayBillTypeWiseLRSequence(party) {

	let jsonObject					= new Object();
	
	jsonObject.branchId				= loggedInBranch.branchId;
	jsonObject.wayBillTypeId		= $('#wayBillType').val();
	jsonObject.accountGroupId		= loggedInBranch.accountGroupId;
	jsonObject.branchCode			= loggedInBranch.branchCode;
	
	if (configuration.generateLRSequenceWithBranchCodeAndLRTypeShortCodeWise == 'true')
		jsonObject.filter = 5;
	else
		jsonObject.filter = 3;

	if(party != undefined && party.tBBParty) {
		jsonObject.tbbPartyCode	= party.partyCode;
		tbbPartyCode 			= party.partyCode;
	}

	let jsonStr = JSON.stringify(jsonObject);
	$.getJSON("SequenceCheckAjaxAction.do?pageId=9&eventId=10",
			{json:jsonStr}, function(data) {
				if (!jQuery.isEmptyObject(data)) {
					if (data.errorCode) {
						if (data.errorDescription) {
							showMessage('error', iconForErrMsg + ' ' + data.errorDescription);
							setValueToHtmlTag('lrnumber', '');
							hideLayer();
							return;
						} else {
							hideAllMessages();
						}
					} else {
						setValueToHtmlTag('lrnumber', ' Next LR No : '+ data.wayBillNumber);
					}
				}
			});
}

function setNextLrNumberLrTypeWise() {
	var jsonObject					= new Object();	
	jsonObject.filter				= 4;
	jsonObject.wayBillTypeId		= $('#wayBillType').val();
	jsonObject.accountGroupId		= loggedInBranch.accountGroupId;
	
	var jsonStr = JSON.stringify(jsonObject);
	$.getJSON("SequenceCheckAjaxAction.do?pageId=9&eventId=10",
			{json:jsonStr}, function(data) {
				if (!jQuery.isEmptyObject(data)) {
					if (data.errorCode) {
						if (data.errorDescription) {
							showMessage('error', iconForErrMsg + ' ' + data.errorDescription);
							setValueToHtmlTag('lrnumber', '');
							hideLayer();
							return;
						} else {
							hideAllMessages();
						}
					} else {
						setValueToHtmlTag('lrnumber', ' Next LR No : '+ data.wayBillNumber);
					}
				}
			});
}

function checkSequenceRangeInPartyWiseLrSequenceForManualLrField() {
	if(configuration.partyCodeWiseManualWayBillNumberGenerationInAutoLr == 'false')
  		return;
	
	var lrNumber = $('#lrNumberManual').val();
	
	if(SequenceCounter != null && (lrNumber < SequenceCounter.minRange || lrNumber > SequenceCounter.maxRange)) {
		setTimeout(function(){showMessage('info', lrNumberWithinRangeInfoMsg(SequenceCounter.minRange, SequenceCounter.maxRange)) }, 0);
		toogleElement('error','block');
		changeError1('lrNumberManual','0','0');
		setTimeout(function(){ $('#lrNumberManual').focus(); }, 0);
	}
}

function getLetterForMonth(monthNumber) {
	let letterForMonth = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
	if (monthNumber >= 1 && monthNumber <= 12) {
		return letterForMonth[monthNumber - 1];
	} else {
		return null;
	}
}

function setAutoSequenceRangeInManual(data) {
	if(SequenceCounter != null || SequenceCounter != undefined) {
		if(SequenceCounter.billSelection == 1) {
			if(configuration.BranchCodeWiseWayBillNumberGeneration == 'true'){
				if(configuration.allowZeroWithWaybillNumberInManualInAuto == 'true')
					setValueToHtmlTag('lrnumber', ' Next LR No Bill : '+ data.NextWaybillNumberBranchCode + '/0' + data.NextWaybillNumber);
			} else
				setValueToHtmlTag('lrnumber', ' Next LR No Bill : '+ data.NextWaybillNumber);		
		} else if(SequenceCounter.billSelection == 2 ) {
			let letterForMonth = getLetterForMonth(data.currentMonth);
			
			if(configuration.BranchCodeWiseWayBillNumberGeneration == 'true') {
				if(configuration.lrNumberFormatForWithoutBill == 20)
					setValueToHtmlTag('lrnumber', ' Next LR No Estimate : '+ data .NextWaybillNumberBranchCode + '/' + letterForMonth + '/0' + data.NextWaybillNumber);
				else
					setValueToHtmlTag('lrnumber', ' Next LR No Estimate : '+ data.NextWaybillNumber);
			}
		}
	}
}

function getLRSequenceOnDivisionSelection() {
	const jsonObject = { divisionId:  $("#waybillDivisionId").val() };

	$.ajax({
		type: "POST",
		url: WEB_SERVICE_URL + '/lrSequenceCounterWS/getDivisionWiseLrSequence.do',
		data: jsonObject,
		dataType: 'json',
		success: function(data) {
			if (data) {
				setValueToHtmlTag('lrnumber', ' Next LR No : ' + data.NextWaybillNumber);
			} else if (data.empty) {
				showMessage('error', lrSequnceCounterNotFoundInfoMsg);
				setValueToHtmlTag('seqRange', '');
				SequenceCounter = null;
			}
		},
	});

}
