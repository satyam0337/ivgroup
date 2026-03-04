/**
 * @Anant Chaudhary	28-12-2015
 */

/*
 * Please include VariableForErrMsg.js and CommonJsFunction.js to work this file
 */

function getWayBillDetails() {
	
	var jsonObject					= new Object();
    var wayBillNumber				= null;
    wayBillNumber					= getWaybillNumber();

    if(wayBillNumber == ''){
		return;
	}

    jsonObject.filter				= 2;
	jsonObject.wayBillNumber		= wayBillNumber;
	
	var jsonStr = JSON.stringify(jsonObject);
	showLayer();
	$.getJSON("GenerateCRAjax.do?pageId=288&eventId=3",
			{json:jsonStr}, function(data) {
			
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('info', data.errorDescription);
					removeTableRows('wayBillToGenerateCr', 'tbody');
					switchHtmlTagClass('middle-border-boxshadow', 'hide', 'show');
					
					if(data.wayBillId) {
						setViewStatusDetailsButtons(data.wayBillId);
						setViewDispatchDetailsButtons(data.wayBillId);
						setViewPartialDeliveryButtons(data.wayBillId);
					}
					
					hideLayer();
				} else if(configuration.allowMultipleLRForSingleParty && ConsigneePartyMasterIdArr.length > 0 && !isValueExistInArray(ConsigneePartyMasterIdArr, data.ConsigneePartyMasterId)){
					hideLayer();
					showMessage('error',"The Consignee name not match");
					return;
				} else {
					ConsigneePartyMasterIdArr.push(data.ConsigneePartyMasterId);
					
					completeDeliveryLocking 	= data.completeDeliveryLocking;
					shortCreditDeliveryLocking 	= data.shortCreditDeliveryLocking;
					ConsigneeName 				= data.ConsigneeName;
					if(completeDeliveryLocking){
						showMessage('info', 'Cannot Deliver any further LR of party - '+ConsigneeName+'. Please clear all short credit outstanding.');
						hideLayer();
						return;
					}
					removeTableRows('wayBillToGenerateCr', 'tbody');
					removeTableRows('taxes', 'tbody');
					wayBillNumber					= getWaybillNumber();
					
					$('#deliver').show();
					setValueToTextField('oldLrNumber', wayBillNumber);

					if(typeof data.wayBillCall !== 'undefined' && data.wayBillCall) {
						setMultipleLRData(data);
						hideLayer();
					} else {
						hideLayer();
						var waybillMod		= data.waybillMod;
						
						var wayBillId		= waybillMod.wayBillId;
						var status			= waybillMod.status;
						
						if(status == WAYBILL_STATUS_BOOKED) {
							switchHtmlTagClass('bottom-border-style', 'hide', 'show');
							displayBookedMsg(wayBillNumber);
							$("#dispatchDetails").empty();
							return;
						} else if(status == WAYBILL_STATUS_DISPATCHED) {
							if(typeof data.flagToReceive !== 'undefined' && data.flagToReceive) {
								setWaybillDetailsData(data);
							} else {
								displayDispatchedMsg(wayBillNumber);
								return;
							}	
						} else if(status == WAYBILL_STATUS_DELIVERED) {
							displayDeliverdMsg(wayBillNumber);
							return;
						} else if(status == WAYBILL_STATUS_CANCELLED) {
							displayCancelledMsg(wayBillNumber);
							return;
						} else { 
							setWaybillDetailsData(data);
							$("#statusDetails").empty();
							$("#dispatchDetails").empty();
							$("#partialDetails").empty();
						}
						
						if(data.showPODStatus)
							switchHtmlTagClass('poddispatchStatus', 'show', 'hide');
						else
							$('#poddispatchStatus').remove();
							
						if(data.ALLOW_DELIVERY_TIME_OTP === true && configuration.allowDeliveryTimeOTP)
							$('#OTPCheckbox').removeClass('hide');
						
						if(podConfiguration != undefined && typeof podConfiguration !== 'undefined' && podConfiguration.setDefaultPODStatusNo)
							switchHtmlTagClass('poddispatchStatus', 'hide', 'show');
						
						if(typeof setDefaultCharges != "undefined")
							setDefaultCharges(wayBillId);
						
						if(configuration.isAllowPopUpForPendingLRs == 'true')
							getLRByConsigneeNumber();

						setViewStatusDetailsButtons(wayBillId);
						setViewDispatchDetailsButtons(wayBillId);
						setViewPartialDeliveryButtons(wayBillId);
						
						hideLayer();
					}
				}
			});
}

function setMultipleLRData(data) {
	var wayBillData				= data.wayBillCall;
	var showReceivedLrDirectly 	= data.showReceivedLrDirectly;
	
	if(wayBillData.length > 1) {
		for(var i = 0; i < wayBillData.length; i++) {
			var wayBillToGenCR	= wayBillData[i];
			
			var wayBillId		= wayBillToGenCR.wayBillId;
			var wayBillNumber	= wayBillToGenCR.wayBillNumber;
			var bookingDate		= wayBillToGenCR.creationDateTime;
			var from			= wayBillToGenCR.sourceBranch;
			var	to				= wayBillToGenCR.destinationBranch;
			var type			= wayBillToGenCR.wayBillType;
			var total			= wayBillToGenCR.grandTotal;
			var status			= wayBillToGenCR.status;
			var wayBillStatus	= wayBillToGenCR.wayBillStatus;
			var agentName		= wayBillToGenCR.crossingAgentName;
			
			var row				= createRow('', '');
			
			var wayBillCol		= createColumn(row, '', '', '', '', '');
			var bookingDateCol	= createColumn(row, '', '', '', '', '');
			var fromCol			= createColumn(row, '', '', '', '', '');
			var toCol			= createColumn(row, '', '', '', '', '');
			var typeCol			= createColumn(row, '', '', '', '', '');
			var totalCol		= createColumn(row, '', '', '', '', '');
			var statusCol		= createColumn(row, '', '', '', '', '');
			var agentNameCol	= createColumn(row, '', '', '', '', '');
			
			if(status == WAYBILL_STATUS_BOOKED)
				appendValueInTableCol(wayBillCol, '<a href="javascript:displayBookedMsg(\''+wayBillNumber+'\')">'+wayBillNumber+'</a>');
			else if(status == WAYBILL_STATUS_DISPATCHED)
				appendValueInTableCol(wayBillCol, '<a href="javascript:displayDispatchedMsg(\''+wayBillNumber+'\')">'+wayBillNumber+'</a>');
			else if(status == WAYBILL_STATUS_DELIVERED)
				appendValueInTableCol(wayBillCol, '<a href="javascript:displayDeliverdMsg(\''+wayBillNumber+'\')">'+wayBillNumber+'</a>');
			else if(status == WAYBILL_STATUS_CANCELLED)
				appendValueInTableCol(wayBillCol, '<a href="javascript:displayCancelledMsg(\''+wayBillNumber+'\')">'+wayBillNumber+'</a>');
			else {
				appendValueInTableCol(wayBillCol, '<a href="javascript:getWaybillData('+wayBillId+')">'+wayBillNumber+'</a>');
				
				if(showReceivedLrDirectly)
					getWaybillData(wayBillId);
			}
			
			appendValueInTableCol(bookingDateCol, bookingDate);
			appendValueInTableCol(fromCol, from);
			appendValueInTableCol(toCol, to);
			appendValueInTableCol(typeCol, type);
			appendValueInTableCol(totalCol, total);
			appendValueInTableCol(statusCol, wayBillStatus);
			appendValueInTableCol(agentNameCol, agentName);
			
			appendRowInTable('wayBillToGenerateCr', row);
		}
		
		switchHtmlTagClass('middle-border-boxshadow', 'show', 'hide');
	}
}

function displayDeliverdMsg(wayBillNumber) {
	showMessage('info', lrNumberAlreadyDelivered(wayBillNumber));
}

function displayBookedMsg(wayBillNumber) {
	showMessage('info', lrNumberInBookedStatus(wayBillNumber));
}

function displayDispatchedMsg(wayBillNumber) {
	showMessage('info', lrNumberInDispatchedStatus(wayBillNumber));
}

function displayReceivedMsg(wayBillNumber) {
	showMessage('info', lrNumberInDispatchedStatus(wayBillNumber));
}

function displayCancelledMsg(wayBillNumber) {
	showMessage('info', lrNumberInCancelledStatus(wayBillNumber));
}

function viewStatusDetails(wayBillId) {
	childwin = window.open ('viewDetails.do?pageId=2&eventId=7&wayBillId='+wayBillId, 'newwindow', config='height=425,width=810, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function viewDispatchDetails(wayBillId) {
	childwin = window.open('sadfs.do?pageId=17&eventId=1&wayBillId='+wayBillId,'mywindow','width=970,height=250');
}

function setViewStatusDetailsButtons(wayBillId) {
	$("#statusDetails").empty();
	
	var jsonObject		= new Object();
	
	jsonObject.id		= '';
	jsonObject.name		= '';
	jsonObject.type		= 'button';
	jsonObject.class	= 'btn btn-info';
	jsonObject.html		= 'Status Details';
	jsonObject.onclick	= "viewStatusDetails("+wayBillId+")";

	createButton($('#statusDetails'), jsonObject);
}

function setViewDispatchDetailsButtons(wayBillId) {
	$("#dispatchDetails").empty();
	
	var jsonObject		= new Object();
	
	jsonObject.id		= '';
	jsonObject.name		= '';
	jsonObject.type		= 'button';
	jsonObject.class	= 'btn btn-danger';
	jsonObject.html		= 'Dispatch Details';
	jsonObject.onclick	= "viewDispatchDetails("+wayBillId+")";
	
	createButton($('#dispatchDetails'), jsonObject);
}

function setReceiveButtons(wayBillId) {
	$("#receiveSingleLR").empty();
	
	var jsonObject		= new Object();
	
	jsonObject.id		= 'ReceiveWB';
	jsonObject.name		= 'ReceiveWB';
	jsonObject.type		= 'button';
	jsonObject.class	= 'btn btn-success';
	jsonObject.html		= 'Receive';
	jsonObject.onclick	= "receiveSingleWayBill()";
	
	createButton($('#receiveSingleLR'), jsonObject);
}

function setDataForReceive(data) {
	var recivablesDispatchLedger	= data.recivablesDispatchLedger;
	
	$('#waybillId').val(data.wayBillId);
	$('#dispatchLedgerId').val(recivablesDispatchLedger.dispatchLedgerId);
	$('#dispatchLedgerWayBillCount').val(data.totalWayBillCount);
	$('#wayBillNumber').val(data.wayBillNumber);
}

function receiveSingleWayBill() {
	var answer = confirm ("Are you sure you want to Receive waybill ?")
	
	if (answer) {
		showLayer();	//Disable page
		
		var jsonObject				= new Object();
		
		jsonObject.dispatchLedgerId				= $('#dispatchLedgerId').val();
		jsonObject.dispatchLedgerWayBillCount	= $('#dispatchLedgerWayBillCount').val();
		jsonObject.WayBillId					= $('#waybillId').val();
		jsonObject.wayBillNumber				= $('#wayBillNumber').val();
		
		var jsonStr = JSON.stringify(jsonObject);

		$.getJSON("ReceiveSingleWayBillAjaxAction.do?pageId=18&eventId=16",
				{json:jsonStr}, function(data) {
					if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
						showMessage('error', data.errorDescription);
						removeTableRows('wayBillToGenerateCr', 'tbody');
						switchHtmlTagClass('middle-border-boxshadow', 'hide', 'show');
						hideLayer();
					} else {
						hideLayer();
						changeDisplayProperty('receiveSingleLR', 'none');
						getWaybillData(data.wayBillId);
					}
				});
	} else {
		return false;
	}
}

function setViewPartialDeliveryButtons(wayBillId) {
	if(showPatialDeliveryButton != undefined && showPatialDeliveryButton){
		$("#partialDetails").empty();
	
		var jsonObject		= new Object();
		
		jsonObject.id		= 'partialButton';
		jsonObject.name		= '';
		jsonObject.type		= 'button';
		jsonObject.class	= 'btn btn-primary';
		jsonObject.html		= 'Partial';
		jsonObject.onclick	= "getPendingDeliveryConsignmentDetails("+wayBillId+")";
		
		createButton($('#partialDetails'), jsonObject);
		partialConsignmentDataArr = [];
	}
}

function getPendingDeliveryConsignmentDetails(wayBillId) {
	var jsonObject			= new Object();
	jsonObject.waybillId	= wayBillId;
	
	$.ajax({
			type		: 	"POST",
			url			: 	WEB_SERVICE_URL + '/generatePartialCRWS/getPendingDeliveryConsignmentDetails.do',
			data		:	jsonObject,
			dataType	: 	'json',
			success		: 	function(data) {
				if(data.message != undefined) {
					let message	= data.message;
					showMessage('error', iconForErrMsg + ' ' + message.description);
				} else if(data != null && !data.invalid) {
					if(data.pendingDeliveryArticleDetails == undefined || data.pendingDeliveryArticleDetails == null || data.pendingDeliveryArticleDetails.length == 0)
						return;
					else {
						pendingDeliveryArticles	= data.pendingDeliveryArticleDetails;
						viewPartialDetails();
					}
				}
			},
		});
}
