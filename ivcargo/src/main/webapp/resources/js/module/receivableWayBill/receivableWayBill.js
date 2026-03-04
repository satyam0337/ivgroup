var checkedManualTUR 		= null;
var checkedManualTURSave 	= null;
var checkedManualTURCancel 	= null;
var wayBillsForDispatch		= null;
var wayBillsForReceive		= null;
var blackListLRNo 			= "";

function setUnloadedByHamal(obj, len) {

	for(var i = 0; i < wayBillReceivableModel.length; i++) {
		document.getElementById('unloadedByHamal_' + (i+1)).value = obj.value;
	}
}

function setUnloadedIn(obj, len) {

	for(var i = 0; i < wayBillReceivableModel.length; i++) {
		if(document.getElementById('unloadedIn_' + (i+1)) != null
				&& parseInt(document.getElementById('isGodownNeedToSelect_' + (i+1)).value, 10) == 1) {
			document.getElementById('unloadedIn_' + (i+1)).value = obj.value;
		}
	}
}

function setActualUnloadWeight(obj) {

	var objName 		= obj.name;
	var splitVal 		= objName.split("_");
	var entWgt			= parseInt(obj.value);
	var actWgt			= parseInt(document.getElementById("LRDispatchedWeight" + splitVal[1]).value);

	if(entWgt > actWgt) {
		document.getElementById(obj.id).value = actWgt;
		alert('You can not enter weight more than '+actWgt+'');
	}
}

function setActualUnloadWeightAfterShortDamage(obj, shortLugg, damageLugg) {

	var objName 			= obj.name;
	var splitVal 			= objName.split("_");
	var shortLuggObj		= document.getElementById(shortLugg + "_" + splitVal[1]).value;
	var damageLuggObj		= document.getElementById(damageLugg + "_" + splitVal[1]).value;
	var LRDispatchedWeight	= parseInt(document.getElementById("LRDispatchedWeight" + splitVal[1]).value);
	var enterWeight			= parseInt(document.getElementById("actualUnloadWeight_" + splitVal[1]).value);

	if((shortLuggObj > 0 || damageLuggObj > 0)
			&& LRDispatchedWeight == enterWeight) {
		setValueToTextField('actualUnloadWeight_' + splitVal[1], '0');
	}
}

function setDefaultActualWeight(obj) {

	var objName			= obj.name;
	var splitVal 		= objName.split("_");
	var shortLuggObj	= document.getElementById("shortLuggage_" + splitVal[1]).value;
	var damageLuggObj	= document.getElementById("damageLuggage_" + splitVal[1]).value;

	if(shortLuggObj == 0 && damageLuggObj == 0) {
		document.getElementById("actualUnloadWeight_" + splitVal[1]).value = parseInt(document.getElementById("LRDispatchedWeight" + splitVal[1]).value);
	}
}

function validateActualWeight(obj) {

	var objName			= obj.name;
	var splitVal 		= objName.split("_");

	if(!validateActualWeight(1, 'actualUnloadWeight_' + splitVal[1])) {return false;}
}

function validateActualWeight(filter, elementID) {
	if(!validateInputTextFeild(filter, elementID, elementID, 'error', actWeightErrMsg)) {
		return false;
	}

	return true;
}

function validateUnloadByExecutiveId(filter, elementID) {
	if(!validateInputTextFeild(filter, elementID, elementID, 'error', selectUserErrMsg)) {
		return false;
	}

	return true;
}

function validateGodownId(filter, elementID) {
	if(!validateInputTextFeild(filter, elementID, elementID, 'error', selectGoDownErrMsg)) {
		return false;
	}

	return true;
}

function validateManualTURNumber(filter, elementID) {
	if(!validateInputTextFeild(filter, elementID, elementID, 'error', manualTurErrMsg)) {
		return false;
	}

	return true;
}

function validateUnloadedByHamal(filter, elementID) {
	if(!validateInputTextFeild(filter, elementID, elementID, 'error', truckUnloadedByErrMsg)) {
		return false;
	}

	return true;
}

function validateTruckDestination(filter, elementID) {
	if(!validateInputTextFeild(filter, elementID, elementID, 'error', truckDestinationBranchErrMsg)) {
		return false;
	}

	return true;
}

function ReceivedWayBills(tableId) {
	if(doNotAllowToReceiveLs){
		showMessage('error', validateLSReceiveErrMsg);
		return;
	}
	
	disableButtons();
	var LrNo 	= null;
	
	var wayBills = getAllCheckBoxSelectValue('wayBills');
	
	var shortCreditLRArray = new Array();
	var shortCreditLimitLRArray = new Array();
	var totalShortCreditAmount = 0;

	for(var i = 0; i < wayBills.length; i++) {
		let wayBillId	= wayBills[i];
		
		if($('#wayBills_' + wayBillId).is(":checked")) {
			LrNo	= $('#wayBillNumber_' + wayBillId).val();
		
			if((showPartyIsBlackListedParty == true || showPartyIsBlackListedParty == 'true') && blackListedLRNoList){
				if(jQuery.inArray( LrNo, blackListedLRNoList ) >= 0)
					blackListLRNo 	+= LrNo + ",";
			}
			
			if (!isDDDV && !configuration.hideGodown && !validateGodownId(1, 'godownId_' + wayBillId))
				return false;

			//receiveAndDelivery.js
			if(receiveAndDelivery) {
				if(!validateLR(wayBillId))
					return false;

				if((configuration.allowShortCreditPaymentForSavedParties)
					&& (Number($("#deliveryPaymentType_" + wayBillId).val()) == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID
					&& Number($("#consigneeCorporateAccountId_" + wayBillId).val()) == 0))
						shortCreditLRArray.push(LrNo);
						
				if((configuration.shortCreditConfigLimitAllowed)
					&& shortCreditConfigLimit != null) {
					if(shortCreditConfigLimit.creditType == CREDIT_TYPE_LR_LEVEL) {
						let lrNumber	= shortCreditLimitOnLRLevel(wayBillId);
						
						if(lrNumber != null)
							shortCreditLimitLRArray.push(lrNumber);
					} else if (shortCreditConfigLimit.creditType == CREDIT_TYPE_BRANCH_LEVEL) {
						totalShortCreditAmount	+= shortCreditLimitOnBranchLevel(wayBillId);
					}
				}
			} 
		}
	}
	
	if(!validateForTruckDeliveryReceive())
		return false;

	if(receiveAndDelivery) {
		//receiveAndDelivery.js
		if(!validateForShortCreditDelivery(shortCreditLRArray))
			return false;
		
		//receiveAndDelivery.js
		if(!validateForShortCreditConfigLimit(shortCreditLimitLRArray, totalShortCreditAmount))
			return false;
	}
	
	if(!isDDDV && !configuration.hideGodown) {
		if(!validateGodownId(1, 'godownIdMaster'))
			return false;

		if(configuration.TruckUnloadedByUser && !validateUnloadByExecutiveId(1, 'unloadByExecutiveId'))
			return false;
	}

	if(configuration.TruckUnloadedByHamal && !validateUnloadedByHamal(1, 'unloadedByHamal'))
		return false;

	if(tripHisabProperties.tripHisabRequired && tripHisabProperties.endKilometerRequired && $('#endKilometerEle').exists()) {
		if($('#endKilometerEle').val() == 0) {
			showMessage('info', 'Please enter end kilometer');
			$('#endKilometerEle').focus();
			return false;
		}
	}
	
	if(!validateManualTURSequence(tableId))
		return false;
	
	finallyReceivedWayBills(wayBills.length);
}

function finallyReceivedWayBills(len) {

	checkedManualTURSave = null;

	if(len == 0) {
		showMessage('error', selectLrToReceiveErrMsg);
		toogleElement('selectError','block');
		enableButtons();
		return false;
	} else {
		//var ans	   = confirm("Any Short / receive/ Damage");
		if(configuration.shortExcessEntryAllow) {
			$.confirm({
				text: "Any Short Excess Damage ?",
				confirm: function() {
					enableButtons();
					if(document.getElementById("manualTURNumber")) {
						checkedManualTURCancel = document.getElementById("manualTURNumber").value.trim();
					}
					return false;

				},
				cancel: function() {
					setTimeout(function(){blackListedChecking(len);},500);
				},
				dialogClass			: "modal-dialog modal-sm",
				position			: 'center',
				confirmButton		: 'Yes',
				cancelButton		: 'NO',
				confirmButtonClass	: 'btn-info',
				cancelButtonClass	: 'btn-danger'
			});
		} else {
			blackListedChecking(len);
		}
	};
}
function blackListedChecking(len) {
	if(blackListLRNo == '')
		receiveLR(len);
	else {
		$.confirm({
			confirm: function() {
				setTimeout(function(){receiveLR(len);},500);
			},
			text				: 'Blacklisted Party LR : '+blackListLRNo.substring(0, blackListLRNo.length-1),
			dialogClass			: "modal-dialog modal-sm",
			position			: 'center',
			confirmButton		: 'Ok',
			confirmButtonClass	: 'btn-danger',
			cancelButtonClass	: 'hide'
		});
	}
}

function receiveLR(len) {
	//hideLinkForShortDamageButton();

	$.confirm({
		text: "Receive " + len +" LR?",
		confirm: function() {
			if(document.getElementById("manualTURNumber") != null
					&& document.getElementById("manualTURNumber").value == '') {
				document.getElementById("manualTURNumber").value = '0';
			}
			//Disable page
			showLayer();
			disableButtons();
			
			if(configuration.ReceiveThroughJSON) {
				receiveWithNew();
			} else {
				document.TransportReciveWayBillForm.pageId.value	= "221";
				document.TransportReciveWayBillForm.eventId.value	= "4";
				document.TransportReciveWayBillForm.action			= "receivableForm.do";
				document.TransportReciveWayBillForm.submit();
			}
		},
		cancel: function() {
			blackListLRNo = "";
			enableButtons();
			showLinkForShortDamageButton();
			
			$('#wayBillsForDispatch').val('');
			$('#wayBillsForReceive').val('');
			
			if(document.getElementById("manualTURNumber")) {
				checkedManualTURCancel = document.getElementById("manualTURNumber").value.trim();
			}
			return false;

		},
		dialogClass			: "modal-dialog modal-sm",
		position			: 'center',
		confirmButton		: 'Yes',
		cancelButton		: 'NO',
		confirmButtonClass	: 'btn-info',
		cancelButtonClass	: 'btn-danger'
	});
}

function receiveWithNew() {
	var jsonObject		= new Object();

	jsonObject.filter				= 4;
			
	getDataToReceive(jsonObject);
	
	var jsonStr = JSON.stringify(jsonObject);
			//alert(jsonStr);
	$.getJSON("ViewReceivableWayBillAjaxAction.do?pageId=221&eventId=11",
		{json:jsonStr}, function(data) {
			if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
				showMessage('error', data.errorDescription); // show message to show system processing error massage on top of the window.
				hideLayer();
			} else { 
				hideLayer();
				var dispatchLedgerId				= data.dispatchLedgerId;
				var lsNumber						= data.lsNumber;
				var SelectedWayBill					= data.SelectedWayBill;
				var DispatchLedgerTotalWayBill		= data.DispatchLedgerTotalWayBill;
				var noOfPackages					= data.noOfPackages;
				var noOfPackagesOfSelectedWayBills	= data.noOfPackagesOfSelectedWayBills;
				var message							= data.message;
				
				if(lsNumber != null && lsNumber != 'null'){}
  				else lsNumber		= dispatchLedgerId;
  				
  				if(opener.document.getElementById("Success_Message") != null) {
					if(DispatchLedgerTotalWayBill == SelectedWayBill) {
						opener.document.getElementById("Success_Message").innerHTML				= "All the WayBills have been received for the LSNo " + lsNumber;
						opener.document.getElementById("Success_Message").className 			= 'statusInfo';
						opener.document.getElementById("Success_Message").style.display			= 'block';
						opener.document.getElementById('DL' + dispatchLedgerId).innerHTML		= lsNumber;
						opener.document.getElementById('DL' + dispatchLedgerId).style.fontFamily= "bold";
						opener.document.getElementById('DL' + dispatchLedgerId).style.fontSize	= "18px";
		
						if(opener.document.getElementById("receiveButton_" + dispatchLedgerId) != null)
							opener.document.getElementById("receiveButton_" + dispatchLedgerId).disabled = true;
		
						opener.document.getElementById('WC' + dispatchLedgerId).innerHTML			= "0";
					} else {
						opener.document.getElementById("Success_Message").innerHTML			= SelectedWayBill + " WayBills have been received for the LSNo " + lsNumber;
						opener.document.getElementById("Success_Message").className 		= 'statusInfo';
						opener.document.getElementById("Success_Message").style.display		= 'block';
		
						opener.document.getElementById('WC' + dispatchLedgerId).innerHTML = noOfPackages - noOfPackagesOfSelectedWayBills;
					}
				}
				
				if(data.isTURAllow && data.receivedLedgerId > 0) {
					if(opener.document.getElementById("printButton_" + dispatchLedgerId) != null) {
						opener.document.getElementById("printButton_" + dispatchLedgerId).disabled 		= false;
			  			opener.document.getElementById("printButton_" + dispatchLedgerId).className 	= 'success';
			  			opener.document.getElementById("LS_" + dispatchLedgerId).value 					= dispatchLedgerId;
			  			opener.document.getElementById("TUR_" + dispatchLedgerId).value 				= data.receivedLedgerId;
			  			opener.document.getElementById("pageIdForPrint").value = '221';
			  			opener.document.getElementById("eventIdForPrint").value = '5';
		  			}
			  	  	
			  	  	if(data.showTurPrintAfterReceive) {
			  	  		turPrint(false, data.receivedLedgerId, dispatchLedgerId);
					} else if(data.receiveAndDeliveredWayBill || data.receiveAndDispatch) {}
					else window.close();
				} else if(data.receiveAndDeliveredWayBill || data.receiveAndDispatch)
					window.close();
					
				$('#successMessage').html('<h4><b class="text-danger"><span class="glyphicon glyphicon-ok"></span> ' + message.description + (data.TURNumber != null ? "TUR No - " + data.TURNumber : "") + ' </b></h4>');
				
				if(data.receiveAndDispatch) {
					$('#printDivBody').append('<button type="button" class="btn btn-primary" onclick="turPrint(false, ' + data.receivedLedgerId + ', ' + dispatchLedgerId + ');">TUR Print</button>');
					
					if(data.dispatchLedgerId > 0)
						$('#printDivBody').append('<button type="button" class="btn btn-info" onclick="dispatchPrint(' + data.dispatchLedgerId + ');">Dispatch Print</button>');
						
					$('#printDivBody').append('<button type="button" class="btn btn-danger" onclick="window.close()">Close</button>');
				} else if(data.receivedLedgerId > 0) {
					$('#printDivBody').append('<button type="button" class="btn btn-primary" onclick="turPrint(' + data.isPrintDuplicate + ', ' + data.receivedLedgerId + ', ' + dispatchLedgerId + ');">TUR Print</button>');
					$('#printDivBody').append('<button type="button" class="btn btn-danger" onclick="window.close()">Close</button>');
				}
				
				$('#printDiv').removeClass('hide');
				$('#mainDiv').addClass('hide');
			}
	});
}

function getDataToReceive(jsonObject) {
	var wayBills				= getAllCheckBoxSelectValue('wayBills');

	var totalLRDetailsArr		= null;

	totalLRDetailsArr			= new Array();
	
	var wayBillArr	= [];

	if(wayBillsForReceive != null && wayBillsForReceive.length > 0) {
		for(var i = 0; i < wayBillsForReceive.length; i++) {
			var totalLRDetailsData			= new Object();
			
			setLRWiseData(totalLRDetailsData, wayBillsForReceive[i]);
			
			totalLRDetailsArr.push(totalLRDetailsData);
			wayBillArr.push(wayBillsForReceive[i]);
		}
	} else {
		for(var i = 0; i < wayBills.length; i++) {
			var totalLRDetailsData			= new Object();
			
			setLRWiseData(totalLRDetailsData, wayBills[i]);

			totalLRDetailsArr.push(totalLRDetailsData);
			wayBillArr.push(wayBills[i]);
		}
	}

	jsonObject.TotalLRDetailsArr		= JSON.stringify(totalLRDetailsArr);

	jsonObject.receiveAndDelivery		= receiveAndDelivery;
	jsonObject.vehicleNumberId			= dispatchLedger.vehicleNumberMasterId;
	jsonObject.vehicleNumberMasterId	= dispatchLedger.vehicleNumberMasterId;
	jsonObject.driver					= dispatchLedger.driverName;
	jsonObject.vehicleNo				= dispatchLedger.vehicleNumber;
	jsonObject.vehicleNumber			= dispatchLedger.vehicleNumber;
	jsonObject.DispatchLedgerId			= dispatchLedger.dispatchLedgerId;
	jsonObject.dispatchLedgerId			= dispatchLedger.dispatchLedgerId;
	jsonObject.lsDesBranchId			= jsonData.lsDesBranchId;
	jsonObject.isForceReceive			= jsonData.isForceReceive;
	jsonObject.lorryHireId				= jsonData.lorryHireId;
	jsonObject.wayBillIdsForReceive		= wayBillArr.join(',');
	jsonObject.manualTURDate			= $('#manualTURDate').val();
	jsonObject.manualTURNumber			= $('#manualTURNumber').val();
	jsonObject.turId					= $('#turId').val();
	jsonObject.unloadedByHamal			= $('#unloadedByHamal').val();
	jsonObject.isManualTUR				= $('#isManualTUR').val();
	jsonObject.DispatchLedgerCount		= $('#DispatchLedgerCount').val();
	jsonObject.noOfPackages				= $('#noOfPackages').val();
	jsonObject.narrationRemark			= $('#narrationRemark').val();
	jsonObject.unloadByExecutiveId		= $('#unloadByExecutiveId').val();
	jsonObject.deductionAmt				= $('#deductionAmt').val();
	jsonObject.isAllWayBillReadyToDeliver	= $('#isAllWayBillReadyToDeliver').val();
	
	var shortCheckBox			= getAllCheckBoxSelectValue('shortCheckBox');
	var damageCheckBox			= getAllCheckBoxSelectValue('damageCheckBox');
	var shortArtCheckBox		= getAllCheckBoxSelectValue('shortArtCheckBox');
	var damageArtCheckBox		= getAllCheckBoxSelectValue('damageArtCheckBox');
	var excessCheckBox			= getAllCheckBoxSelectValue('excessCheckBox');
	
	if(shortCheckBox.length > 0) jsonObject.shortCheckBox							= shortCheckBox.join('~');
	if(damageCheckBox.length > 0) jsonObject.damageCheckBox							= damageCheckBox.join('~');
	if(shortArtCheckBox.length > 0) jsonObject.shortArtCheckBox						= shortArtCheckBox.join('~');
	if(damageArtCheckBox.length > 0) jsonObject.damageArtCheckBox					= damageArtCheckBox.join('~');
	if(excessCheckBox.length > 0) jsonObject.excessCheckBox							= excessCheckBox.join('~');
	
	jsonObject.subRegionExistForReceiveAndDispatch		= $('#subRegionExistForReceiveAndDispatch').val();
	jsonObject.subRegionExistForArriveAndDispatch		= $('#subRegionExistForArriveAndDispatch').val();
	jsonObject.waybillsStrForDispatch					= $('#wayBillsForDispatch').val();
	jsonObject.truckDestinationId						= $('#truckDestinationId').val();
	jsonObject.truckDestinationName						= $('#truckDestinationName').val();
	jsonObject.deliveryPaymentType_0					= $('#deliveryPaymentType_0').val();
	jsonObject.endKilometer								= $('#endKilometerEle').val();
	jsonObject.isTURAllow								= true;
	jsonObject.paymentValues							= $('#paymentCheckBox').val();
	jsonObject.hamalMasterId							= $('#hamalTeamLeaderEle').val();
}

function setLRWiseData(totalLRDetailsData, wayBillId) {
	totalLRDetailsData["waybillId"]						= wayBillId;
	totalLRDetailsData["NoOfArt"]						= $('#LRTotalArt_' + wayBillId).val();
	totalLRDetailsData["ActualUnloadWeight"]			= $('#actualUnloadWeight_' + wayBillId).val();
	totalLRDetailsData["remark"]						= $('#remark_' + wayBillId).val();
	totalLRDetailsData["godownId"]						= $('#godownId_' + wayBillId).val();
	
	if(receiveAndDelivery) {
		totalLRDetailsData["paymentType"]					= $('#deliveryPaymentType_' + wayBillId).val();
		totalLRDetailsData["receiverName"]					= $('#receiverName_' + wayBillId).val();
		totalLRDetailsData["deliveredToName"]				= $('#deliveredToName_' + wayBillId).val();
		totalLRDetailsData["consigneeName"]					= $('#consigneeName_' + wayBillId).val();
		totalLRDetailsData["deliveredToPhoneNo"]			= $('#deliveredToPhoneNo_' + wayBillId).val();
		totalLRDetailsData["consigneePhn"]					= $('#consigneeNo_' + wayBillId).val();
		totalLRDetailsData["podStatus"]						= $('#podStatus_' + wayBillId).val();
		totalLRDetailsData["chequeDate"]					= $('#chequeDate_' + wayBillId).val();
		totalLRDetailsData["chequeNo"]						= $('#chequeNo_' + wayBillId).val();
		totalLRDetailsData["chequeAmount"]					= $('#chequeAmount_' + wayBillId).val();
		totalLRDetailsData["bankName"]						= $('#bankName_' + wayBillId).val();
		totalLRDetailsData["selectedDeliveryCreditorId"]	= $('#selectedDeliveryCreditorId_' + wayBillId).val();
		totalLRDetailsData["discount"]						= $('#discount_' + wayBillId).val();
		totalLRDetailsData["discountTypes"]					= $('#discountTypes_' + wayBillId).val();
		totalLRDetailsData["paidLoading"]					= $('#paidLoading_' + wayBillId).val();
		totalLRDetailsData["ConsignorId"]					= $('#ConsignorId_' + wayBillId).val();
		totalLRDetailsData["wayBillNumber"]					= $('#wayBillNumber_' + wayBillId).val();
		totalLRDetailsData["wayBillTypeId"]					= $('#wayBillType_' + wayBillId).val();
		totalLRDetailsData["vehicleNumber"]					= dispatchLedger.vehicleNumber;

		if(deliveryCharges != null) {
			for(var m = 0; m < deliveryCharges.length; m++) {
				var id = "deliveryCharge_" + deliveryCharges[m].chargeTypeMasterId + '_' + wayBillId;
				
				if($("#" + id).val() > 0)
					totalLRDetailsData[id]	= $("#" + id).val();
			}
		}
		
		if(typeof podDocumentTypeArr !== 'undefined' && podDocumentTypeArr != null) {
			var checkBoxArray	= getAllCheckBoxSelectValue(inputName);
			
			if(checkBoxArray.length > 0)
				totalLRDetailsData["podDoc_" + wayBillId]	= checkBoxArray.join(",");
		}
	}
}

function turPrint(isRePrint, receivedLedgerId, dispatchLedgerId) {
	childwin = window.open('TURView.do?pageId=221&eventId=5&receivedLedgerId=' + receivedLedgerId + '&dispatchLedgerId=' + dispatchLedgerId + '&isReprint='+isRePrint,'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function hamaliPrint(isRePrint, receivedLedgerId, dispatchLedgerId) {
	childwin = window.open('HamaliDetails.do?pageId=340&eventId=10&modulename=unloadingHamaliDetailsPrint&receivedLedgerId=' + receivedLedgerId + '&dispatchLedgerId=' + dispatchLedgerId + '&isReprint='+isRePrint,'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function dispatchPrint(dispatchLedgerId) {
	newwindow=window.open('Dispatch.do?pageId=340&eventId=10&modulename=loadingSheetPrintDestinationWise&masterid=' + dispatchLedgerId + '&isReprint=true', 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function selectAllWayBills(param) {
	if(receiveAndDelivery) calcSlctdAmntTyp();
	
	for(var k = 0; k < wayBillReceivableModel.length; k++) {
		var wayBillId		= wayBillReceivableModel[k].wayBillId;
		
		$('#wayBills_' + wayBillId).prop('checked', param);
		
		if(configuration.checkReceivability) {
			var isReceivable	= wayBillReceivableModel[k].receivable;
			
			if(!isReceivable && $('#wayBills_' + wayBillId).is(":checked")) {
				$('#wayBills_' + wayBillId).prop('checked', false);
				showMessage('error', 'You can not Receive/Deliver LR whose  handling branch is not your branch. To Receive/Deliver this LR Please change the destination accordingly.');
				toogleElement('error', 'block');
				setTimeout(function(){ changeColour2(wayBillId); }, 500);
			}
		}	
	}
}

function fillclearTextArea(text,text1) {
	var textValue = text.value;
	if(textValue == '') {
		text.value = text1;
	};
}

function disableButtons() {
	var recieveBtn = document.getElementById("receiveButton");

	if(recieveBtn != null) {
		recieveBtn.className 		= 'btn_print_disabled';
		recieveBtn.disabled			= true;
		recieveBtn.style.display 	= 'none';
	};
};

function enableButtons() {
	var recieveBtn = document.getElementById("receiveButton");

	if(recieveBtn != null) {
		recieveBtn.className 		= 'button btn_print pure-button pure-button-primary';
		recieveBtn.disabled			= false;
		recieveBtn.style.display 	= 'initial';
	};
};

function checkManualTURRange(obj) {
	if(checkedManualTUR != obj.value){
		var reg = /\s/g; //Match any white space including space, tab, form-feed, etc.
		var str = obj.value.replace(reg, '');
		if(obj.value && str.length > 0) {
			if(configuration.RangeCheckInManualTUR) {
				if(parseInt(obj.value) >= parseInt($("#MinRange").val()) && parseInt(obj.value) <= parseInt($("#MaxRange").val()) ){
					$.get("/ivcargo/jsp/masters/MasterAjaxInterface2.jsp",{ filter:28,manualTURNumber:obj.value},function(data){
						if($.trim(data)=="true") {
							$("#msgbox").fadeTo(200,0.1,function(){
								showMessage('info', turAlreadyCreatedInfoMsg); //Defined in VariableForErrorMsg.js
								$('#manualTURNumber').focus();
							});
						} else {
							//$("#msgbox").html('').removeClass();
						};
					});
				} else {
					showMessage('error', manualTurWithinRngeErrMsg); //Defined in VariableForErrorMsg.js
					$('#manualTURNumber').focus();
					$('#manualTURNumber').val('');
				};
			} else {
				$.get("/ivcargo/jsp/masters/MasterAjaxInterface2.jsp",{ filter:28,manualTURNumber:obj.value},function(data){
					if($.trim(data)=="true"){
						showMessage('info', turAlreadyCreatedInfoMsg); //Defined in VariableForErrorMsg.js
						$('#manualTURNumber').focus();
					} else {
						//$("#msgbox").html('').removeClass();
					};
				});
			}
		}else {
			//$("#msgbox").html('').removeClass();
		}
		checkedManualTUR = obj.value;
	}
}

function validateManualTURSequence(tableId) {
	var wayBillIdDis 	= 0;
	var dispatchDate 	= 0;
	var wayBillNumber 	= null;
	
	var tableEl = document.getElementById(tableId);

	var count 	= parseInt(tableEl.rows.length - 1);
	
	var chk = document.getElementById("isManualTUR");

	if(chk != null && chk.checked || configuration.showManualDateForReceive) {
		var manualTURNumber 	= document.getElementById("manualTURNumber");
		var manualTURDate 		= document.getElementById("manualTURDate");
		var manualTURNumberVal 	= parseInt(manualTURNumber.value,10);

		if(!configuration.showManualDateForReceive){
			if(!validateManualTURNumber(1, 'manualTURNumber')) {
				setValueToTextField('manualTURNumber', '');
				enableButtons();
				return false;
			}
		}

		if(manualTURDate.value.length <= 0 || manualTURDate.value == 'TUR Date') {
			showMessage('error', manualTurDateErrMsg);  //Defined in VariableForErrorMsg.js
			toogleElement('error', 'block');
			changeError1('manualTURDate','0','0');
			return false;
		} else {
			for(var index = 1; index < count; index++) {
				if(tableEl.rows[index].cells[0].firstElementChild) {
					wayBillIdDis 	= tableEl.rows[index].cells[0].firstElementChild.value;
					dispatchDate 	= document.getElementById('creationDateTime_' + wayBillIdDis).value;
					wayBillNumber 	= document.getElementById('wayBillNumber_' + wayBillIdDis).value;

					if(chkDate(manualTURDate.value, dispatchDate, wayBillNumber)) {
					} else {
						return false;
					};
				}
			}
			var maxRange = parseInt(document.getElementById("MaxRange").value);
			var minRange = parseInt(document.getElementById("MinRange").value);

			if(configuration.RangeCheckInManualTUR && (manualTURNumberVal < minRange || manualTURNumberVal > maxRange)) {
				showMessage('error', manualTurWithinRngeErrMsg); //Defined in VariableForErrorMsg.js
				$('#manualTURNumber').val('');
				toogleElement('selectError','block');
				changeError1('manualTURNumber','0','0');
				enableButtons();
				return false;
			}
			
			if(!configuration.showManualDateForReceive){
				$.get("/ivcargo/jsp/masters/MasterAjaxInterface2.jsp",{
					filter:28,manualTURNumber:manualTURNumberVal},function(data) {
						var response = $.trim(data);
						if(response == 'true') {
							$('#manualTURNumber').val('');
							showMessage('info', turAlreadyCreatedInfoMsg); //Defined in VariableForErrorMsg.js
							toogleElement('selectError','block');
							changeError1('manualTURNumber','0','0');
							manualTURNumber.focus();
							enableButtons();
							
							return false;
						} else {
							toogleElement('selectError','none');
							removeError('manualTURNumber');
							return true;
						};
				});
			}
			
			return true;
		}
	} else {
		return true;
	}
}

function chkDate(turDate,creationDateTime,wayBillNumber) {
	
	if(isValidDate(turDate)) {
		var currentDate  	= new Date(curDate);
		var previousDate 	= new Date(curDate);
		var manualTURDate 	= new Date(curDate);
		var dispatchDate	= new Date(curDate);
		var pastDaysAllowed = document.getElementById("manualTURDaysAllowed").value;

		if(pastDaysAllowed == '0') {
			showMessage('warning', configureManualTURDaysWarningMsg);
			toogleElement('selectError','block');
			changeError1('manualTURDate','0','0');
			return false;
		}

		previousDate.setDate(previousDate.getDate() - parseInt(pastDaysAllowed, 10));
		previousDate.setHours(0, 0, 0, 0);

		var manualTURDateParts 		= new String(turDate).split("-");

		manualTURDate.setFullYear(parseInt(manualTURDateParts[2], 10));
		manualTURDate.setMonth(parseInt(manualTURDateParts[1]-1, 10));
		manualTURDate.setDate(parseInt(manualTURDateParts[0], 10));

		var dispatchDateParts 		= new String(creationDateTime).split("-");
		dispatchDate.setFullYear(parseInt(dispatchDateParts[0], 10));
		dispatchDate.setMonth(parseInt(dispatchDateParts[1]-1, 10));
		dispatchDate.setDate(parseInt(dispatchDateParts[2].split(" ")[0], 10));
		
		if(dispatchDate != null) {
			dispatchDate.setHours(0,0,0,0);

			if(manualTURDate.getTime() < dispatchDate.getTime()) {
				showMessage('warning', 'Receiving Date is earlier than LS date Of LR Number ' +wayBillNumber+ ' not allowed !!');
				toogleElement('selectError','block');
				changeError1('manualTURDate','0','0');
				return false;
			} else {
				if(manualTURDate.getTime() > currentDate.getTime()) {
					showMessage('error', futureDateNotAllowdErrMsg);
					toogleElement('selectError','block');
					changeError1('manualTURDate','0','0');
					return false;
				} else {
					if(manualTURDate.getTime() > previousDate.getTime()) {
						toogleElement('selectError','none');
						removeError('manualTURDate');
						return true;
					} else {
						showMessage('info', dateTillDayFromTodayInfoMsg(pastDaysAllowed));
						toogleElement('selectError', 'block');
						changeError1('manualTURDate','0','0');
						return false;
					};
				};
			};
		} else{
			if(manualTURDate.getTime() > currentDate.getTime()) {
				showMessage('error', futureDateNotAllowdErrMsg);
				toogleElement('selectError','block');
				changeError1('manualTURDate','0','0');
				return false;
			} else {
				if(manualTURDate.getTime() > previousDate.getTime()) {
					toogleElement('selectError','none');
					removeError('manualTURDate');
					return true;
				} else {
					showMessage('info', dateTillDayFromTodayInfoMsg(pastDaysAllowed));
					toogleElement('selectError','block');
					changeError1('manualTURDate','0','0');
					return false;
				};
			};
		};
	} else {
		showMessage('error', validDateErrMsg);
		toogleElement('selectError','block');
		changeError1('manualTURDate','0','0');
		return false;
	}
}

function createReceiveAndDispatchHeader() {

	$('#receiveAndDispatchHeadTr').empty();

	var createRow			= createRowInTable('', 'danger', '');

	var srNoCol					= createColumnInRow(createRow, 'srNoCol', '', '', '', '', '');
	var toCol					= createColumnInRow(createRow, '', '', '', '', '', '');
	var noOfArtCol				= createColumnInRow(createRow, '', '', '', '', '', '');

	appendValueInTableCol(srNoCol, '<b>Sr No.</b>');

	appendValueInTableCol(toCol, '<b>Destination Branch</b>');
	appendValueInTableCol(noOfArtCol, '<b>No of LR</b>');

	appendRowInTable('receiveAndDispatchHeadTr', createRow);
}

function setDestWiseWayBillReceivableModel() {

	createReceiveAndDispatchHeader();

	$('#receiveAndDispatchBodyTr').empty();

	var destinationBranches = new Array();

	for(var destId in destWiseRecWayBillHM) {
		destinationBranches.push(destId);

		var wayBillList	= destWiseRecWayBillHM[destId];
		
		var destinationBranchId		= wayBillList[0].destinationBranchId;
		var destinationBranch		= wayBillList[0].destinationBranch;
		var destinationSubRegion	= wayBillList[0].destinationSubRegion;

		var createRow			= createRowInTable('checkBoxtr', '', '');

		var checkBoxCol			= createColumnInRow(createRow, '', '', '', '', '', '');
		var toCol				= createColumnInRow(createRow, '', '', '', '', '', '');
		var noOfLR				= createColumnInRow(createRow, '', '', '', '', '', '');

		appendValueInTableCol(toCol, destinationBranch + ' (' + destinationSubRegion + ' )');
		appendValueInTableCol(noOfLR, wayBillList.length);
		var checkBoxFeild		= new Object();

		checkBoxFeild.type		= 'checkbox';
		checkBoxFeild.name		= 'destinationBranchId_' + destinationBranchId;
		checkBoxFeild.id		= 'destinationBranchId_' + destinationBranchId;
		checkBoxFeild.class		= 'datatd';
		checkBoxFeild.value		= destinationBranchId;

		createInput(checkBoxCol, checkBoxFeild);

		$('#receiveAndDispatch #receiveAndDispatchBodyTr').append(createRow);
	}

	var destinationBranchIds = destinationBranches.join(","); 
	getDispatchDestination(destinationBranchIds);
}

function getDispatchDestination(destinationBranchIds) {

	showLayer();
	var jsonObject			= new Object();

	jsonObject["destinationBranchIds"] 		= destinationBranchIds;
	console.log(jsonObject);
	$.ajax({
		url: WEB_SERVICE_URL+'/dispatchWs/getDispatchDestination.do',
		type: "POST",
		dataType: 'json',
		data:jsonObject,
		success: function(data) {
			if(data.message != undefined){
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
			} else {
				setTruckDestination(data.destinationBranch);
				
				sortDropDownList('truckDestination');
			}
			
			hideLayer();
		}
	});
}

function setTruckDestination(destinationBranchs) {
	removeOption('truckDestination', null);
	createOption('truckDestination', 0, '---- Select Destination ----');

	for(var i = 0; i < destinationBranchs.length; i++) {
		createOption('truckDestination', destinationBranchs[i].branchId, destinationBranchs[i].branchName);
	}
}

function getSourceDestinationWiseLSSequenceCounter() {

	showLayer();
	var jsonObject			= new Object();

	jsonObject["truckDestinationId"]		= $('#truckDestination').val();
	console.log(jsonObject);
	$.ajax({
		url: WEB_SERVICE_URL+'/dispatchWs/getSourceDestinationWiseLSSequenceCounter.do',
		type: "POST",
		dataType: 'json',
		data:jsonObject,
		success: function(data) {
			if(data.message != undefined){
				hideLayer();
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			} else {
				$('#truckDestinationId').val($('#truckDestination').val());
				$('#truckDestinationName').val($("#truckDestination option:selected").html());
				$('#receiveDispatch').removeAttr('disabled');
			}
			hideLayer();
		}
	});
}

function validateForTruckDeliveryReceive() {
	if(configuration.permissionBasedTruckDeliveryReceiveAllowed){
		var waybillArray = new Array();
		
		if(wayBillReceivableModel != null) {
			for(var k = 0; k < wayBillReceivableModel.length; k++) {
				var wayBillId		= wayBillReceivableModel[k].wayBillId;
				
				if($('#wayBills_' + wayBillId).is(":checked")) {
					if(Number($("#wayBillDeliveryTo_" + wayBillId).val()) == InfoForDeliveryConstant.DELIVERY_TO_TRUCK_DELIVERY_ID && !allowTruckDeliveryReceive) {
						waybillArray.push(wayBillReceivableModel[k].wayBillNumber);
					}
				}
			}
		}
		
		if(waybillArray.length > 0) {
			showMessage('info','Truck Delivery Receive Not Allowed For LR Nos ' + waybillArray.join() + ' !');
			return false;
		}
	}
	
	return true;
}