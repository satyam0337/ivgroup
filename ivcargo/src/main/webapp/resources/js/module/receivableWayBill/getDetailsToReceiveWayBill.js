/**
 * 
 */

var jsonData							= null;
var wayBillReceivableModel				= null;
var wayBillRecModelsHM					= null;
var LoadingSheetExcessEntryDetails		= null;
var isDDDV								= false;
var ddmSettlementSummaryModel			= null;
var godowns								= null;
var vehicleNumberId						= 0;
var TURSequenceCounter					= null;
var receivedLedger						= null;
var dispatchLedger						= null;
var discountTypes						= null;
var packingType							= null;
var ReportViewModel						= null;
var executive							= null;
var configuration						= null;
var isReceiveAndDispatchAllow			= false;
var isArriveAndDispatchAllow			= false;
var subRegionExistForReceiveAndDispatch	= false;
var subRegionExistForArriveAndDispatch	= false;
var manualTURDaysAllowed				= 0;
var deliveryCharges						= null;
var receiveLocationList					= null;
var branchExecutives					= null;
var godownNotFound						= null;
var executiveBranch						= null;
var destWiseRecWayBillHM				= null;
var InfoForDeliveryConstant				= null;
var TYPE_OF_LOCATION_PHYSICAL 				= 1;    
var TYPE_OF_LOCATION_OPERATIONAL_PLACE		= 2;    
var TYPE_OF_LOCATION_NON_OPERATIONAL_PLACE	= 3;
var showPartyIsBlackListedParty				= false;
var blackListedLRNoList					= null;
var isAllowBackDateInArrival			= false;
var arrivalDate							= null;
var endKilometer						= 0;
var bankPaymentOperationRequired		= false;
var isDefaultReceivePaymentType			= false;
var PaymentTypeConstant					= null;
var receiveAndDelivery					= false;
var flag								= false;
var shortCreditConfigLimit				= null;
var paymentTypeArr						= null;
var showReceiverToName					= false;
var isInterBranchLs						= false;
var deliveryPaymentType_0				= 0;
var allowTruckDeliveryReceive			= false;
var truckAlreadyArrived					= false;
var isAllWayBillReadyToDeliver			= false;
var WaybillNumbers 						= [];
var doNotAllowToReceiveLs				= false
let consigneeList						= null;
let filteredWayBillModel				= []; // filtered list based on cosignee selection


function getDetailsToReceiveWayBill(dispatchLedgerId, isForceReceive, flag) {
	var jsonObject		= new Object();

	jsonObject.dispatchLedgerId		= Number(dispatchLedgerId);
	jsonObject.isForceReceive		= isForceReceive;
	jsonObject.filter				= 3;
	
	showLayer();

	var jsonStr = JSON.stringify(jsonObject);
	//alert(jsonStr);
	$.getJSON("ViewReceivableWayBillAjaxAction.do?pageId=221&eventId=11",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription); // show message to show system processing error massage on top of the window.
					hideLayer();
				} else { 
					jsonData		= data;

					executiveBranch					= jsonData.executiveBranch;

					if(jsonData.godownNotFound) {
						$('#godownMissingMsg').append('<b class="danger">' + jsonData.godownNotFound + '</b>');
						showMessage('error', jsonData.godownNotFound);
						createLinkToInsertGodown(jsonData.isGodownMasterPermission);
						hideLayer();
						return;
					}

					wayBillReceivableModel				= jsonData.WayBillReceivableModel;
					wayBillRecModelsHM					= jsonData.wayBillRecModelsHM;
					LoadingSheetExcessEntryDetails		= jsonData.LoadingSheetExcessEntryDetails;
					isDDDV								= jsonData.isDDDV;
					ddmSettlementSummaryModel			= jsonData.ddmSettlementSummaryModel;
					godowns								= jsonData.godowns;
					vehicleNumberId						= jsonData.vehicleNumberId;
					TURSequenceCounter					= jsonData.TURSequenceCounter;
					receivedLedger						= jsonData.receivedLedger;
					discountTypes						= jsonData.discountTypes;
					packingType							= jsonData.packingType;
					ReportViewModel						= jsonData.ReportViewModel;
					dispatchLedger						= jsonData.dispatchLedger;
					executive							= jsonData.executive;
					configuration						= jsonData.receiveConfiguration;
					tripHisabProperties					= jsonData.tripHisabProperties;
					manualTURDaysAllowed				= jsonData.ManualTURDaysAllowed;
					receiveLocationList					= jsonData.receiveLocationList;
					branchExecutives					= jsonData.branchExecutives;
					destWiseRecWayBillHM				= jsonData.destWiseRecWayBillHM;
					InfoForDeliveryConstant				= jsonData.InfoForDeliveryConstant;
					truckAlreadyArrived					= jsonData.truckAlreadyArrived;
					isReceiveAndDispatchAllow			= jsonData.isReceiveAndDispatchAllow;
					isArriveAndDispatchAllow			= jsonData.isArriveAndDispatchAllow;
					subRegionExistForReceiveAndDispatch	= jsonData.subRegionExistForReceiveAndDispatch;
					subRegionExistForArriveAndDispatch	= jsonData.subRegionExistForArriveAndDispatch;
					var arrivalDate						= jsonData.arrivalDate;
					var arrivalTime						= jsonData.arrivalTime;
					var truckArrivalNumber				= jsonData.truckArrivalNumber;
					showPartyIsBlackListedParty			= jsonData.showPartyIsBlackListedParty;
					blackListedLRNoList					= jsonData.blackListedLRNoList;
					isAllowBackDateInArrival			= jsonData.isAllowBackDateInArrival;
					endKilometer						= jsonData.endKilometer;
					receiveAndDelivery					= jsonData.receiveAndDelivery;
					allowTruckDeliveryReceive			= jsonData.allowTruckDeliveryReceive;
					doNotAllowToReceiveLs				= jsonData.doNotAllowToReceiveLs;
					let hamalLeaderList					= jsonData.hamalLeaderList;
					consigneeList						= jsonData.ConsigneeList;
					
					lhpvId	                            = jsonData.lhpvId;
					
					if(receiveAndDelivery) {
						paymentTypeArr						= jsonData.paymentTypeArr;
						isInterBranchLs						= jsonData.isInterBranchLs;
						shortCreditConfigLimit				= jsonData.shortCreditConfigLimit;
						isDefaultReceivePaymentType			= jsonData.isDefaultReceivePaymentType;
						deliveryCharges						= jsonData.deliveryCharges;
						PaymentTypeConstant					= jsonData.PaymentTypeConstant;
						GeneralConfiguration				= jsonData.GeneralConfiguration;
						ModuleIdentifierConstant			= jsonData.ModuleIdentifierConstant;
						
						if(GeneralConfiguration != undefined) {
							bankPaymentOperationRequired 		= GeneralConfiguration.BankPaymentOperationRequired;
							incomeExpenseModuleId				= jsonData.incomeExpenseModuleId;
							moduleId							= jsonData.moduleId;
						}
						
						showReceiverToName					= jsonData.showReceiverToName;
						
						displayReceivedAndDeliveredButton(flag);
						
						if(ddmSettlementSummaryModel != undefined) {
							setDDMSettlementSummaryModel(ddmSettlementSummaryModel);
							$('#paymentDetailsDiv').removeClass('hide');
						} else
							$('#paymentDetailsDiv').remove();
						
						$('#receiveAndDelivery').val(receiveAndDelivery);
						changePageHeight('viewLRDetails', '500px');
					} else {
						displayReceivedAndArrivalButton(flag, dispatchLedgerId);
						$('#paymentDetailsDiv').remove();
					}
					
					$('#godownEntryLinkMissing').remove();
					setTurCreateMessage();
					
					if(!subRegionExistForArriveAndDispatch && configuration.TruckArrival) {
						changeDisplayProperty('arrivalButton', 'inline-block');

						if(subRegionExistForReceiveAndDispatch && isReceiveAndDispatchAllow) {
							$('#receiveDispatchButton').removeClass('hide');
							$('#receiveButtonId').addClass('hide');
							$('#subRegionExistForReceiveAndDispatch').val(subRegionExistForReceiveAndDispatch);
						}
					} else
						$('#receiveButtonId').removeClass('hide');

					if(subRegionExistForArriveAndDispatch && isArriveAndDispatchAllow) {
						if(Object.keys(destWiseRecWayBillHM).length > 0) {
							$('#arriveDispatchButton').removeClass('hide disabled');
							$('#receiveButtonId').addClass('hide');
							$('#receiveButton').addClass('hide');
							$('#subRegionExistForArriveAndDispatch').val(subRegionExistForArriveAndDispatch);
							
							$("#arriveDispatchButton").bind("click", function() {
								arriveDispatchAndReceiveWayBills('results');
							});
						}
					}

					if(truckAlreadyArrived) {
						$('#arrivalButton').addClass('disabled');
						$('#receiveButtonId').removeClass('hide');

						if(subRegionExistForReceiveAndDispatch && isReceiveAndDispatchAllow) {
							$('#receiveButtonId').addClass('hide');
							$('#receiveDispatchButton').removeClass('hide disabled');
							$('#subRegionExistForReceiveAndDispatch').val(subRegionExistForReceiveAndDispatch);

							$("#receiveDispatchButton").bind("click", function() {
								ReceiveDispatchWayBills('results');
							});
						}
						
						setTruckArrivedMessage(truckAlreadyArrived, arrivalDate, arrivalTime, truckArrivalNumber); //Defined in insertTruckArrivalDetail.js
					}
					
					if(isAllowBackDateInArrival)
						setReceiveDateAfterArrival(arrivalDate, jsonData.currentDate);
					else if(configuration.showManualDateForReceive) {
						$( function() {
							$('#manualTURDate').datepicker({
								minDate		: dispatchLedger.dispatchDateTime,
								maxDate		: jsonData.currentDate,
								showAnim	: "fold",
								dateFormat	: 'dd-mm-yy'
							});
						});
					}
					
					if(configuration.BydefaultSelectAllCheckBox)
						changeDisplayProperty('selectAllCol', 'none');
					else
						changeDisplayProperty('srNoCol', 'none');
					
					if(isAllowBackDateInArrival)
						$('#arrivalDateDiv').removeClass('hide')
					else
						$('#arrivalDateDiv').remove();
						
					if(configuration.showBackTimeFiledInArrival && isAllowBackDateInArrival)
						$('#arrivalTimeDiv').removeClass('hide');
					else
						$('#arrivalTimeDiv').remove();

					setHiddenInputValues(jsonData);
					setLoadingSheetDetails();
					setTurManualSequenceWarningMsg();
					setTrafficErrorMsg(jsonData);
					displayTurSequenceCounterRange();
					displayRemark();
					setWayBillReceivableModel();
					setUserAndGodown();
					displayLoadedByHamal();
					setReceiveAndDeliveryPayment();
					showHideForShortExcess();
					storeExcessEntriesFromDBData(LoadingSheetExcessEntryDetails);
					
					if(configuration.showUnloadingHamaliSettlementField)
						showUnloadingHamaliField();
					
					if(configuration.shortExcessEntryAllow) {
						shortReceiveConfig		= jsonData.shortReceiveConfig;
						damageReceiveConfig		= jsonData.damageReceiveConfig;
						excessReceiveConfig		= jsonData.excessReceiveConfig;
						
						// function calling from PropertiesEnableDisable.js
						showHideShortDetails();
						showHideDamageDetails();
						showHideExcessDetails();
						setPackingTypeForExcess(); //defined in ShortExcess.js
					}

					$('#loadingSheetDiv').switchClass('show', 'hide');
					$('.top-border-boxshadow').switchClass('show', 'hide');
					$('.bottom-border-boxshadow').switchClass('show', 'hide');
					
					if(tripHisabProperties.tripHisabRequired && tripHisabProperties.endKilometerRequired) {
						$('#endKilometer').append('<b>End Kilometer </b><br><br>');
						$('#endKilometer').append('<input type="text" name="endKilometerEle" id="endKilometerEle" placeholder="End Kilometer" style="width: 150px;" class="form-control" data-tooltip="End Kilometer" onkeypress="return allowOnlyNumeric(event);"/>');

						if(endKilometer > 0) {
							$('#endKilometerEle').val(endKilometer);
							$("#endKilometerEle").prop( "disabled", true );
						}
					}

					if(configuration.showHamalLeaderSelection && hamalLeaderList != null && hamalLeaderList != undefined)
						setUnloadedHamalName(hamalLeaderList);
									
					if(bankPaymentOperationRequired) {
						var bankPaymentOperationModel		= new $.Deferred();	//
						
						$("#bankPaymentOperationPanel").load("/ivcargo/html/module/paymentTypeSelection/paymentTypeSelection.html",function() {
							bankPaymentOperationModel.resolve();
						});
						
						var loadelement 	= new Array();

						loadelement.push(bankPaymentOperationModel);

						$.when.apply($, loadelement).done(function() {
							setIssueBankAutocomplete();
							setAccountNoAutocomplete();
							
							$('#displayUserAndGodownList').append('<li id="viewAddedPaymentDetailsLi"><button type="button" id="viewAddedPaymentDetails" data-tooltip = "View Payment Details" class="btn btn-info" onclick="openAddedPaymentTypeModel()">View Payment Details</button></li>');
						}).fail(function() {
							console.log("Some error occured");
						});
					}
					
					if (isDefaultReceivePaymentType) defaultReceivePaymentType();

					hideLayer();
				}
			}
	);
}

function createLinkToInsertGodown(isGodownMasterPermission) {
	var insertGodownLinkButton	= $("<button/>", { 
		type			: 'button', 
		class			: 'form-control btn btn-primary',
		html			: 'Create Godown',
		onclick			: 'javascript: openWindowForInsertGodown('+ isGodownMasterPermission +')',
		style			: 'margin-right : 20px'
	});

	$('#godownEntryLinkId').append(insertGodownLinkButton);

	var refreshLinkButton	= $("<button/>", { 
		type			: 'button', 
		class			: 'form-control btn btn-warning',
		html			: 'Try Again',
		onclick			: 'reload()'
	});

	$('#godownEntryLinkId').append(refreshLinkButton);

	$('#godownEntryLinkMissing').switchClass('show', 'hide');
}

function openWindowForInsertGodown(isGodownMasterPermission) {
	if(typeof isGodownMasterPermission != 'undefined') {
		childwin = window.open ('GodownMaster.do?pageId=229&eventId=1', 'newwindow', config='height=600,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	} else {
		showMessage('info', createGodownInfoMsg(executiveBranch.name));
	}
}

function reload() {
	window.location.reload();
}

function showHideForShortExcess() {
	if(configuration.shortExcessEntryAllow) {
		$('#shortExcessEntryAllow').switchClass('show', 'hide');
	} else
		$('#shortExcessEntryAllow').empty();

	if(configuration.allowToInsertShortArticle && !subRegionExistForArriveAndDispatch) {
		$('#shortEntryCounter').switchClass('display-inline', 'hide');
		$('#showHideViewShortButton').switchClass('display-inline', 'hide');
	} else {
		$('#dialogShortForm').empty();
	}

	if(configuration.allowToInsertDamageArticle && !subRegionExistForArriveAndDispatch) {
		$('#showHideViewDamageButton').switchClass('display-inline', 'hide');
		$('#damageEntryCounter').switchClass('display-inline', 'hide');
	} else {
		$('#dialogDamageForm').empty();
	}

	if(configuration.allowToInsertExcessArticle) {
		$('#showHideExcessButton').switchClass('display-inline', 'hide');
		$('#showHideViewExcessButton').switchClass('display-inline', 'hide');
		$('#excessEntryCounter').switchClass('display-inline', 'hide');
		setPackingTypeForExcess(); // Coming from ShortExcess.js
	} else {
		$('#dialogExcessForm').empty();
	}
}

function displayReceivedAndArrivalButton(flag, dispatchLedgerId) {
	if(wayBillReceivableModel != null && wayBillReceivableModel.length > 0) {
		if(flag) {
			$('#receivedAndArrivalButton').append('<button name="receiveButton" id="receiveButtonId" type="button" class="btn btn-primary hide">Receive</button> ');
			$('#receivedAndArrivalButton').append('<button name="arrivalButton" id="arrivalButton" data-tooltip="Truck Arrival" type="button" class="btn btn-info" style="display: none;">Arrival</button> ');

			$("#receiveButtonId").bind("click", function() {
				ReceivedWayBills('results');
			});

			$("#arrivalButton").bind("click", function() {
				insertTruckArrival();
			});
		} else {
			$('#receivedAndArrivalButton').append('<button name="receiveButton" id="receiveButton" type="button" class="btn btn-primary disabled">Receive</button> ');
		}

		$('#receivedAndArrivalButton').append('<button name="button" id = "printPreloadingSheet" class="btn btn-success" data-tooltip="Print All">Print All</button>');
		
		$("#printPreloadingSheet").bind("click", function(event) {
			event.preventDefault();
			printPreloadingSheet(dispatchLedgerId);
		});
	}
}

function printPreloadingSheet(dispatchLedgerId) {
	if(executive.accountGroupId == 50){ // For Temporary Basis
		window.open('/ivcargo/SearchWayBill.do?pageId=18&eventId=6&dispatchLedgerId=' + dispatchLedgerId,  'newwindow', config='height=600,width=850, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	} else {
		window.open('/ivcargo/SearchWayBill.do?pageId=340&eventId=10&modulename=preunloadingsheet&masterid=' + dispatchLedgerId,  'newwindow', config='height=600,width=850, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	}
	//setTimeout(function(){childwin.print();},500);
}

function displayReceivedAndDeliveredButton(flag) {
	if(wayBillReceivableModel != null && wayBillReceivableModel.length > 0) {
		if(flag) {
			$('#receivedAndDeliveredButton').append('<button name="receiveButton" id="receiveButtonId" type="button" class="btn btn-primary">Receive &amp; Deliver</button>');

			$("#receiveButtonId").bind("click", function() {
				ReceivedWayBills('results');
			});
		} else {
			$('#receivedAndDeliveredButton').append('<button name="receiveButton" id="receiveButton" type="button" class="btn btn-primary disabled">Receive &amp; Deliver</button>');
		}
	}
}

function setReceiveAndDeliveryPayment() {
	if(paymentTypeArr != null) {
		if(configuration.allowReceiveInterBranchLs && isInterBranchLs)
			var paymentTypeInput	= '<select id="deliveryPaymentType_0' + '" name="deliveryPaymentType_0' + '" onblur="hideInfo()" readonly = "readonly" class="form-control" data-tooltip="Rcv / Dlvr As"></select>';
		else
			var paymentTypeInput	= '<select id="deliveryPaymentType_0' + '" name="deliveryPaymentType_0' + '" onblur="hideInfo()" class="form-control" data-tooltip="Rcv / Dlvr As"></select>';

		$('#displayUserAndGodownList').append('<li id="receiveAndDeliveryPayment"><b>Rcv / Dlvr As :</b><br>' + paymentTypeInput + '</li>');
		
		operationOnSelectTag('deliveryPaymentType_0', 'addNew', '---Select---', 0);
		
		for(var j = 0; j < paymentTypeArr.length; j++) {
			operationOnSelectTag('deliveryPaymentType_0', 'addNew', paymentTypeArr[j].paymentTypeName, paymentTypeArr[j].paymentTypeId);
			
			if(configuration.allowReceiveInterBranchLs && isInterBranchLs && paymentTypeArr[j].paymentTypeId == PaymentTypeConstant.PAYMENT_TYPE_RECEIVE_AT_GODOWN_ID) {
				operationOnSelectTag('deliveryPaymentType_0', 'prepend', paymentTypeArr[j].paymentTypeName, paymentTypeArr[j].paymentTypeId);
			}
		}
		
		$("#deliveryPaymentType_0").bind("change", function() {
			deliveryPaymentType_0	= this.value;
			changeReceivePaymentType(this.value);
		});
	}
}

function setHiddenInputValues(jsonData) {
	if(dispatchLedger != null) {
		if(typeof dispatchLedger.lsNumber !== 'undefined') {
			$('#lsNumber').val(dispatchLedger.lsNumber);
		} else {
			$('#lsNumber').val(dispatchLedger.dispatchLedgerId);
		}

		$('#dispatchLedgerId').val(dispatchLedger.dispatchLedgerId);
		$('#scrSubRegion').val(dispatchLedger.sourceSubRegion);
		$('#scrBranch').val(dispatchLedger.sourceBranch);
		$('#desSubRegion').val(dispatchLedger.destinationSubRegion);
		$('#desBranch').val(dispatchLedger.destinationBranch);
		$('#date').val(dispatchLedger.dispatchDateTime);
		$('#vehicleNo').val(dispatchLedger.vehicleNumber);
		$('#vehicleNumberId').val(dispatchLedger.vehicleNumberMasterId);
		$('#driver').val(dispatchLedger.driverName);
		$('#cleaner').val(dispatchLedger.cleanerName);
		
		if(dispatchLedger.arrivalDateTimeString != undefined && dispatchLedger.arrivalDateTimeString != null) {
			$('#arrivalDate').val(dispatchLedger.arrivalDateTimeString);
		}
		
		$( function() {
			$('#arrivalDate').datepicker({
				minDate		: dispatchLedger.dispatchDateTime,
				maxDate		: new Date(),
				showAnim	: "fold",
				dateFormat	: 'dd-mm-yy'
			});
		} );
	}

	$('#manualTURDaysAllowed').val(manualTURDaysAllowed);
	$('#lorryHireId').val(jsonData.lorryHireId);
	$('#lsDesBranchId').val(jsonData.lsDesBranchId);
	$('#isForceReceive').val(jsonData.isForceReceive);
	
	$('#token').val(jsonData.token);

	if(jsonData.arrivalDateTime != undefined)
		$('#arrivalDateTime').val(jsonData.arrivalDateTime);

	if(receivedLedger != undefined && receivedLedger != null)
		$('#turId').val(receivedLedger.receivedLedgerId);
	else
		$('#turId').val(0);
}

function setTurCreateMessage() {
	$('.msg').empty();
	
	if(receivedLedger != undefined) {
		if(receivedLedger != null && receivedLedger.turNumber) {
			$('.msg').append('<span style="color: #14AB26;" id="turCreatedMsg">' + turNumberCreatedForLsInfoMsg(receivedLedger.turNumber) + '</span><br>');
			//setValueToHtmlTag('turCreatedMsg', turNumberCreatedForLsInfoMsg(receivedLedger.turNumber));
		} 
	}
}

function setTurManualSequenceWarningMsg() {
	if(configuration.DisplayManualTURSequenceMsg) {
		if(receivedLedger == undefined) {
			if(TURSequenceCounter == undefined) {
				changeDisplayProperty('turManualSeq-warning', 'block');
				setValueToHtmlTag('turManualSeq', manualTurSequenceNotDefinedInfoMsg);
			}
		}
	}
}

function setTrafficErrorMsg(jsonData) {

	if(jsonData.trafficErrorMsg != undefined) {
		$('#trafficErrorDiv').addClass('red-alert-box traffic-search-error messages');
		setValueToHtmlTag('trafficErrorDiv', jsonData.trafficErrorMsg);
	}

	if(jsonData.trafficErrorMsg) {
		$('#receiveButtonId').addClass('hide');
		$('#arrivalButton').addClass('hide');
	}
}

function displayTurSequenceCounterRange() {
	// For Manual Date Only
	if(configuration.showManualDateForReceive) {
		changeDisplayProperty('turSequenceCounter', 'block');
		//changeDisplayProperty('manualTURNumberDiv', 'block');
		changeDisplayProperty('manualTURDateDiv', 'block');
		$('#manualTURDate').val(jsonData.currentDate);
	}
	
	if(configuration.ShowManualTUR && receivedLedger == undefined) {
		changeDisplayProperty('manualTURChk', 'block');
		changeDisplayProperty('turSequenceCounter', 'block');
		$('#manualTURDate').val(jsonData.currentDate);

		if(TURSequenceCounter != undefined) {
			$('#MaxRange').val(Number(TURSequenceCounter.maxRange));
			$('#MinRange').val(Number(TURSequenceCounter.minRange));

			setValueToHtmlTag('turSequenceCounterRange', '[ ' + Number(TURSequenceCounter.minRange) + ' - ' + Number(TURSequenceCounter.maxRange) + ' ]');
		}
	} else if(TURSequenceCounter != undefined && receivedLedger == undefined) {
		changeDisplayProperty('turSequenceCounter', 'block');
		$('#manualTURDate').val(jsonData.currentDate);

		$('#MaxRange').val(Number(TURSequenceCounter.maxRange));
		$('#MinRange').val(Number(TURSequenceCounter.minRange));
		setValueToHtmlTag('turSequenceCounterRange', '[ ' + Number(TURSequenceCounter.minRange) + ' - ' + Number(TURSequenceCounter.maxRange) + ' ]');
	} 
}

function goToManualSelection() {
	var chk = document.getElementById("isManualTUR");

	if(chk != null) {
		if(chk.checked) {
			changeDisplayProperty('manualTURNumberDiv', 'block');
			changeDisplayProperty('manualTURDateDiv', 'block');
			document.getElementById("manualTURNumber").focus();
		} else {
			changeDisplayProperty('manualTURNumberDiv', 'none');
			changeDisplayProperty('manualTURDateDiv', 'none');
			document.getElementById("manualTURNumber").value='';
			changeDisplayProperty('msgbox', 'none');
		};
	};
}

function displayRemark() {
	if(configuration.isRemarkFeildDisplay) {
		if(receivedLedger == undefined) {
			$('#remark').append('<b>Remark</b><br>');
			$('#remark').append('<textarea rows="2.8" cols="27" maxlength="512" id="narrationRemark" class="form-control" name="narrationRemark" data-tooltip="Remark"></textarea>');
		}
	}
}

function setUserAndGodown() {
	if(!isDDDV || configuration.showGodownSelectionForDDDVLS && isDDDV) {
		changeDisplayProperty('displayUserAndGodownList', 'inline-block');
		
		$('#displayUserAndGodownList').append('<li id="godownList"><b id="selectGodown">Select Godown : </b><br><select id="godownIdMaster" name="godownIdMaster" style="width: 150px;" onchange="setGodown(this.value);" class="form-control" onkeyup="setGodown(this.value);" data-tooltip="Select Godown"><option value="0">-Select for ALL-</option></select></li>');

		if(branchExecutives != null) {
			if(configuration.TruckUnloadedByUser) {
				$('#displayUserAndGodownList').append('<li id="selectUser"><b>Select User :</b><br><select id="unloadByExecutiveId" name="unloadByExecutiveId" style="width: 150px;" class="form-control" data-tooltip="Select User" onblur="hideInfo();"><option value="0">-- Select User --</option></select></li>');

				for(var i = 0; i < branchExecutives.length; i++) {
					operationOnSelectTag('unloadByExecutiveId', 'addNew', branchExecutives[i].name, branchExecutives[i].executiveId);
				}
			}
		}
		
		if(configuration.showConsigneeSelection && consigneeList != undefined) {
			$('#displayUserAndGodownList').append('<li id="cosigneeList"><b id="selectConsignee">Select Consignee : </b><br><select id="consigneeId" name="consigneeId" style="width: 150px;" onchange="setReceiveDetailsOnConsignee(this.value);" class="form-control" onkeyup="setReceiveDetailsOnConsignee(this.value);" data-tooltip="Select Consignee"><option value="0">-Select for ALL-</option></select></li>');
			
			for(var i = 0; i < consigneeList.length; i++) {
				operationOnSelectTag('consigneeId', 'addNew', consigneeList[i].consigneeName, consigneeList[i].consigneeCorporateAccountId);
			}
		}

		if(godowns != null) {
			for(var j = 0; j < godowns.length; j++) {
				operationOnSelectTag('godownIdMaster', 'addNew', godowns[j].name, godowns[j].godownId);
			}

			if(configuration.preSelectedGodownAllowed && !configuration.hideGodown){
				$("#godownIdMaster option[value='0']").remove();
				setGodown($("#godownIdMaster").val());
			}
			
			if(configuration.preSelectedUserAllowed)
				$('#unloadByExecutiveId').val(executive.executiveId);
		}

		sortDropDownList('godownIdMaster');
		sortDropDownList('unloadByExecutiveId');
	}

	if(configuration.hideGodown)
		hideGodown();
	
	if(configuration.hideUser) {
		$('#selectUser').hide();
		$('#unloadByExecutiveId').hide();
	}
}

function displayLoadedByHamal() {
	if(configuration.TruckUnloadedByHamal) {
		$('#displayUserAndGodownList').append('<li id="TruckUnloadedBy"><b>Truck Unloaded By :</b><br><input type="text" name="unloadedByHamal" id="unloadedByHamal" placeholder="Unloaded By" style="width: 150px;" class="form-control" data-tooltip="Insert Hamal Name"/></li>');
	}
}

function setUnloadedHamalName(hamalLeaderList) {
	$('#hamalTeamLeader').append('<li id="selectHamalLeader"><b>Select Hamal Team Leader :</b><br><select id="hamalTeamLeaderEle" name="hamalTeamLeaderEle" style="width: 150px;" class="form-control" data-tooltip="Select Hamal Team Leader" onblur="hideInfo();"></select></li>');
							
	operationOnSelectTag('hamalTeamLeaderEle', 'addNew', '-- Select Hamal Team Leader --', 0);

	for(var i = 0; i < hamalLeaderList.length; i++) {
		operationOnSelectTag('hamalTeamLeaderEle', 'addNew', hamalLeaderList[i].displayName, hamalLeaderList[i].hamalMasterId);
	}		
}

function setGodown(value) {
	for (var k = 0; k < wayBillReceivableModel.length; k++) {
		var wayBillId = wayBillReceivableModel[k].wayBillId;
		var godownElement = document.getElementById('godownId_' + wayBillId);
		
		if (godownElement) 
			godownElement.value = value;
	}
}


function hideGodown() {
	$('#godownIdMaster').hide();
	$('#selectGodown').hide();
	$('#godownCol').hide();
	for(var k = 0; k < wayBillReceivableModel.length; k++) {
		var wayBillId		= wayBillReceivableModel[k].wayBillId;
		$('#godownId_'+ wayBillId).hide();
	}
}

function setLoadingSheetDetails() {
	var loadingSheetRow	= createRowInTable('', '', '');

	var lsNumberCol		= createColumnInRow(loadingSheetRow, '', '', '', '', '', '');
	var dateCol			= createColumnInRow(loadingSheetRow, '', '', '', '', '', '');
	var vehicleNoCol	= createColumnInRow(loadingSheetRow, '', '', '', '', '', '');
	var scrBranchCol	= createColumnInRow(loadingSheetRow, '', '', '', '', '', '');
	var desBranchCol	= createColumnInRow(loadingSheetRow, '', '', '', '', '', '');
	var driverCol		= createColumnInRow(loadingSheetRow, '', '', '', '', '', '');
	var phoneCol		= createColumnInRow(loadingSheetRow, '', '', '', '', '', '');
	var cleanerCol		= createColumnInRow(loadingSheetRow, '', '', '', '', '', '');

	if(dispatchLedger != null) {
		if(typeof dispatchLedger.lsNumber !== 'undefined')
			appendValueInTableCol(lsNumberCol, dispatchLedger.lsNumber);
		else
			appendValueInTableCol(lsNumberCol, dispatchLedger.dispatchLedgerId);

		appendValueInTableCol(dateCol, dispatchLedger.dispatchDateTime);
		appendValueInTableCol(vehicleNoCol, dispatchLedger.vehicleNumber);
		appendValueInTableCol(scrBranchCol, dispatchLedger.sourceBranch);
		appendValueInTableCol(desBranchCol, dispatchLedger.destinationBranch);
		appendValueInTableCol(driverCol, dispatchLedger.driverName);
		appendValueInTableCol(phoneCol, dispatchLedger.driver1MobileNumber1);
		appendValueInTableCol(cleanerCol, dispatchLedger.cleanerName);
	}

	appendRowInTable('loadingSheet', loadingSheetRow);
}

function createHeader() {
	$('#headingtr').empty();

	var createRow			= createRowInTable('', 'danger', '');

	if(configuration.BydefaultSelectAllCheckBox)
		var srNoCol				= createColumnInRow(createRow, 'srNoCol', '', '', '', '', '');
	else
		var selectAllCol		= createColumnInRow(createRow, 'selectAllCol', '', '', '', '', '');

	var lrNoCol					= createColumnInRow(createRow, '', '', '', '', '', '');
	var fromCol					= createColumnInRow(createRow, '', '', '', '', '', '');
	var toCol					= createColumnInRow(createRow, '', '', '', '', '', '');
	var lrTypeCol				= createColumnInRow(createRow, '', '', '', '', '', '');
	var amountCol				= createColumnInRow(createRow, '', '', '', '', '', '');
	
	if(receiveAndDelivery)
		var consignmentDetailsCol	= createColumnInRow(createRow, '', '', '', '', '', '');
	
	if(configuration.showNoOfArticleColumn)
		var noOfArtCol				= createColumnInRow(createRow, '', '', '', '', '', '');
	
	if(!receiveAndDelivery) {
		var artCol					= createColumnInRow(createRow, '', '', '', '', '', '');
		var actBookedWeightCol		= createColumnInRow(createRow, '', '', '', '', '', '');
		var actChargeWeightCol		= createColumnInRow(createRow, '', '', '', '', '', '');
	}
	
	var consigneeNameCol		= createColumnInRow(createRow, '', '', '', '', '', '');
	var consigneeNoCol			= createColumnInRow(createRow, '', '', '', '', '', '');
	
	if(configuration.showDeliveryAtColumn)
		var deliveryAt			= createColumnInRow(createRow, '', '', '', '', '', '');
	
	if(receiveAndDelivery) {
		var paymentTypeCol		= createColumnInRow(createRow, '', '', '', '', '', '');

		if(jsonData.allowPodReceiveOption)
			var podCol			= createColumnInRow(createRow, '', '', '', '', '', '');
		
		if(jsonData.showPODDocuments)
			var podDocCol		= createColumnInRow(createRow, '', '', '', '', '', '');
		
		var deliveryDetailsCol	= createColumnInRow(createRow, '', '', '', '', '', '');

		if(showReceiverToName)
			var showReceiverToNameCol	= createColumnInRow(createRow, '', '', '', '', '', '');
	
		for(var i = 0; i < deliveryCharges.length; i++) {
			var deliveryChargesCol	= createColumnInRow(createRow, '', '', '', '', '', '');
			appendValueInTableCol(deliveryChargesCol, '<b>' + deliveryCharges[i].chargeName + '</b>');
		}
	
	   if(executive.accountGroupId == 341){
		   var discountCol				= createColumnInRow(createRow, '', '', '', '', 'display: none;', '');
		   var discountTypeCol			= createColumnInRow(createRow, '', '', '', '', 'display: none;', '');
	   } else {
		   var discountCol				= createColumnInRow(createRow, '', '', '', '', '', '');
		   var discountTypeCol			= createColumnInRow(createRow, '', '', '', '', '', '');
	   }
	}
	
	if(configuration.showLrRemarkColumn) {
		var lrRemark				= createColumnInRow(createRow, '', '', '', '', '', '');
	}
	
	if(!configuration.hideGodown && !receiveAndDelivery){
		var godownCol				= createColumnInRow(createRow, 'godownCol', '', '', '', 'display: none;', '');
	}
	
	if(configuration.allowToInsertShortArticle)
		var shortReceiveCol			= createColumnInRow(createRow, 'shortHideShortReceive', '', '', '', '', '');
		
	if(configuration.allowToInsertDamageArticle)
		var damageReceiveCol		= createColumnInRow(createRow, 'shortHideDamageReceive', '', '', '', '', '');
	
	if(configuration.AllowToAddLRExpense)
		var addExpenseCol			= createColumnInRow(createRow, '', '', '', '', '', '');

	if(configuration.BydefaultSelectAllCheckBox) {
		appendValueInTableCol(srNoCol, '<b>Sr No.</b>');
	} else {
		createSelectAllCheckBoxFeild(selectAllCol);
		appendValueInTableCol(selectAllCol, '<b>ALL</b>');
	}

	appendValueInTableCol(lrNoCol, '<b>LR No.</b>');
	appendValueInTableCol(fromCol, '<b>From</b>');
	appendValueInTableCol(toCol, '<b>To</b>');
	appendValueInTableCol(lrTypeCol, '<b>LR Type</b>');
	appendValueInTableCol(amountCol, '<b>Amt</b>');
	
	if(receiveAndDelivery) appendValueInTableCol(consignmentDetailsCol, '<b>View</b>');
	if(configuration.showNoOfArticleColumn) appendValueInTableCol(noOfArtCol, '<b>No Art</b>');
	
	if(!receiveAndDelivery) {
		appendValueInTableCol(artCol, '<b>Art.</b>');
		appendValueInTableCol(actBookedWeightCol, '<b>Actual Weight</b>');
		appendValueInTableCol(actChargeWeightCol, '<b>Charge Weight</b>');
	}
	
	appendValueInTableCol(consigneeNameCol, '<b>C/nee Name</b>');
	appendValueInTableCol(consigneeNoCol, '<b>C/nee No</b>');
	
	if(configuration.showDeliveryAtColumn)
		appendValueInTableCol(deliveryAt, '<b>Delivery At</b>');
	
	if(receiveAndDelivery) {
		appendValueInTableCol(paymentTypeCol, '<b>Rcv / Dlvr As</b>');
		if(jsonData.allowPodReceiveOption) appendValueInTableCol(podCol, '<b>POD</b>');
		if(jsonData.showPODDocuments) appendValueInTableCol(podDocCol, '<b>POD Document</b>');
		appendValueInTableCol(deliveryDetailsCol, '<b>Delivery Details</b>');
		
		if(showReceiverToName) appendValueInTableCol(showReceiverToNameCol, '<b>Receiver Name</b>');
		appendValueInTableCol(discountCol, '<b>Discount</b>');
		appendValueInTableCol(discountTypeCol, '<b>Discount Type</b>');
	}
	
	if(configuration.showLrRemarkColumn) {
		appendValueInTableCol(lrRemark, '<b>LR Remark</b>');
	}
	
	if(!configuration.hideGodown || !receiveAndDelivery) {
		appendValueInTableCol(godownCol, '<b>Godown</b>');
	}
	
	if(configuration.allowToInsertShortArticle) appendValueInTableCol(shortReceiveCol, '<b>Short Receive</b>');
	if(configuration.allowToInsertDamageArticle) appendValueInTableCol(damageReceiveCol, '<b>Damage Receive</b>');
	if(configuration.AllowToAddLRExpense) appendValueInTableCol(addExpenseCol, '<b>Expense</b>');

	appendRowInTable('headingtr', createRow);
}

function setWayBillReceivableModel() {
	var noOfPackages		= 0;
	var totalAmount			= 0;
	var totalActWeight		= 0;
	var totalChargeWeight	= 0;
	var wayBillIdArray		= [];
	createHeader();

	if(!isDDDV && !configuration.hideGodown) {
		changeDisplayProperty('godownCol', 'table-cell');
	}
	
	var modelList = (filteredWayBillModel && filteredWayBillModel.length > 0) ? filteredWayBillModel : wayBillReceivableModel;

	if (modelList != null && modelList.length > 0) {
		for(var i = 0; i < modelList.length; i++) {

			var wayBillNumber					= modelList[i].wayBillNumber;
			var grandTotal						= parseInt(modelList[i].grandTotal);
			var dispatchedQuantity				= modelList[i].dispatchedQuantity;
			var dispatchedWeight				= modelList[i].dispatchedWeight;
			var wayBillId						= modelList[i].wayBillId;
			var consigneeName					= modelList[i].consigneeName;
			var consigneePhoneNumber			= modelList[i].consigneePhoneNumber;
			var lsNumber						= modelList[i].lsNumber;
			var dispatchLedgerId				= modelList[i].dispatchLedgerId;
			var vehicleNumber					= modelList[i].vehicleNumber;
			var vehicleNumberId					= modelList[i].vehicleNumberId;
			var chargeWeight					= modelList[i].chargeWeight;
			var isSubregionForArriveAndDispatch	= modelList[i].subregionForArriveAndDispatch;
			var wayBillTypeId					= modelList[i].wayBillTypeId;
			var consignmentSummaryDeliveryTo	= modelList[i].deliveryTo;
			var destinationBranchId				= modelList[i].destinationBranchId;
			var privateMarka					= modelList[i].privateMarka;
			var handlingBranchId				= modelList[i].handlingBranchId;
			
			var isCrossingLR					= modelList[i].crossingLR;
			var isExpressDeliveryLR				= modelList[i].expressDeliveryLR;
			var isPartyBlackListed				= modelList[i].partyBlackListed;
			var isPassengerDeliveryLR			= modelList[i].passengerDeliveryLR;
			var isTCEBooking					= modelList[i].isTceBooking;
			
			wayBillIdArray[i] = "godownId_" + wayBillId;	
			
			noOfPackages				+= modelList[i].dispatchedQuantity;
			totalAmount					+= modelList[i].grandTotal;
			totalActWeight				+= modelList[i].dispatchedWeight;
			totalChargeWeight			+= modelList[i].chargeWeight;

			var createRow			= createRowInTable('checkBoxtr_' + wayBillId, '', '');
			
			var checkBoxCol			= createColumnInRow(createRow, 'col_' + wayBillId, 'bgcolor_' + consignmentSummaryDeliveryTo + ' isCrossingLR_' + wayBillId +' isExpressDeliveryLR_'+wayBillId +' isBlackListedParty_'+wayBillId, '', '', '', '');
			var wayBillNumberCol	= createColumnInRow(createRow, 'lrcol_' + wayBillId, 'bgcolor_' + consignmentSummaryDeliveryTo + ' isCrossingLR_' + wayBillId +' isExpressDeliveryLR_'+wayBillId+' isBlackListedParty_'+wayBillId, '', '', '', '');
			var fromCol				= createColumnInRow(createRow, 'col_' + wayBillId, 'bgcolor_' + consignmentSummaryDeliveryTo + ' isCrossingLR_' + wayBillId +' isExpressDeliveryLR_'+wayBillId +' isBlackListedParty_'+wayBillId, '', '', '', '');
			var toCol				= createColumnInRow(createRow, 'col_' + wayBillId, 'bgcolor_' + consignmentSummaryDeliveryTo + ' isCrossingLR_' + wayBillId +' isExpressDeliveryLR_'+wayBillId +' isBlackListedParty_'+wayBillId, '', '', '', '');
			var lrTypeCol			= createColumnInRow(createRow, 'col_' + wayBillId, 'bgcolor_' + consignmentSummaryDeliveryTo + ' isCrossingLR_' + wayBillId +' isExpressDeliveryLR_'+wayBillId +' isBlackListedParty_'+wayBillId, '', '', '', '');
			var amountCol			= createColumnInRow(createRow, 'col_' + wayBillId, 'bgcolor_' + consignmentSummaryDeliveryTo + ' isCrossingLR_' + wayBillId +' isExpressDeliveryLR_'+wayBillId +' isBlackListedParty_'+wayBillId, '', '', 'background-color: #EEE8AA;', '');
			
			if(receiveAndDelivery)
				var consignmentDetailsCol	= createColumnInRow(createRow, 'col_' + wayBillId, 'bgcolor_' + consignmentSummaryDeliveryTo + ' isCrossingLR_' + wayBillId +' isExpressDeliveryLR_'+wayBillId +' isBlackListedParty_'+wayBillId, '', '', 'background-color: #EEE8AA;', '');
			
			if(configuration.showNoOfArticleColumn)
				var noOfArtCol		= createColumnInRow(createRow, 'col_' + wayBillId, 'bgcolor_' + consignmentSummaryDeliveryTo + ' isCrossingLR_' + wayBillId +' isExpressDeliveryLR_'+wayBillId +' isBlackListedParty_'+wayBillId, '', '', '', '');
			
			if(!receiveAndDelivery) {
				var artDetailsCol		= createColumnInRow(createRow, 'col_' + wayBillId, 'bgcolor_' + consignmentSummaryDeliveryTo + ' isCrossingLR_' + wayBillId +' isExpressDeliveryLR_'+wayBillId +' isBlackListedParty_'+wayBillId, '', '', '', '');
				var actBookedWeightCol	= createColumnInRow(createRow, 'col_' + wayBillId, 'bgcolor_' + consignmentSummaryDeliveryTo + ' isCrossingLR_' + wayBillId +' isExpressDeliveryLR_'+wayBillId +' isBlackListedParty_'+wayBillId, '', '', 'background-color: #E6E6FA;text-align: right;', '');
				var chargeWeightCol		= createColumnInRow(createRow, 'col_' + wayBillId, 'bgcolor_' + consignmentSummaryDeliveryTo + ' isCrossingLR_' + wayBillId +' isExpressDeliveryLR_'+wayBillId +' isBlackListedParty_'+wayBillId, '', '', 'background-color: #E6E6FA;text-align: right;', '');
			}
			
			var consigneeNameCol	= createColumnInRow(createRow, 'col_' + wayBillId, 'bgcolor_' + consignmentSummaryDeliveryTo + ' isCrossingLR_' + wayBillId +' isExpressDeliveryLR_'+wayBillId +' isBlackListedParty_'+wayBillId, '', '', '', '');
			var consigneeNoCol		= createColumnInRow(createRow, 'col_' + wayBillId, 'bgcolor_' + consignmentSummaryDeliveryTo + ' isCrossingLR_' + wayBillId +' isExpressDeliveryLR_'+wayBillId +' isBlackListedParty_'+wayBillId, '', '', '', '');
			
			if(configuration.showDeliveryAtColumn)
				var deliveryAt		= createColumnInRow(createRow, 'col_' + wayBillId, 'bgcolor_' + consignmentSummaryDeliveryTo + ' isCrossingLR_' + wayBillId +' isExpressDeliveryLR_'+wayBillId +' isBlackListedParty_'+wayBillId, '', '', '', '');
			
			if(receiveAndDelivery) {
				var paymentTypeCol			= createColumnInRow(createRow, 'col_' + wayBillId, 'bgcolor_' + consignmentSummaryDeliveryTo + ' isCrossingLR_' + wayBillId +' isExpressDeliveryLR_'+wayBillId +' isBlackListedParty_'+wayBillId, '', '', '', '');
				
				if(jsonData.allowPodReceiveOption)
					var podCol				= createColumnInRow(createRow, 'col_' + wayBillId, 'bgcolor_' + consignmentSummaryDeliveryTo + ' isCrossingLR_' + wayBillId +' isExpressDeliveryLR_'+wayBillId +' isBlackListedParty_'+wayBillId, '', '', '', '');
				
				if(jsonData.showPODDocuments)
					var podDocCol			= createColumnInRow(createRow, 'col_' + wayBillId, 'bgcolor_' + consignmentSummaryDeliveryTo + ' isCrossingLR_' + wayBillId +' isExpressDeliveryLR_'+wayBillId +' isBlackListedParty_'+wayBillId, '', '', '', '');
				
				var deliveryDetailsCol		= createColumnInRow(createRow, 'col_' + wayBillId, 'bgcolor_' + consignmentSummaryDeliveryTo + ' isCrossingLR_' + wayBillId +' isExpressDeliveryLR_'+wayBillId +' isBlackListedParty_'+wayBillId, '', '', '', '');
				
				if(showReceiverToName) 
					var showReceiverToNameCol	= createColumnInRow(createRow, 'col_' + wayBillId, 'bgcolor_' + consignmentSummaryDeliveryTo + ' isCrossingLR_' + wayBillId +' isExpressDeliveryLR_'+wayBillId +' isBlackListedParty_'+wayBillId, '', '', '', '');
				
				for(var m = 0; m < deliveryCharges.length; m++) {
					var deliveryChargesCol	= createColumnInRow(createRow, 'col_' + wayBillId, '', '', '', '', '');
					
					var deliveryChargesInput = '<input type="text" style="width: 50px;text-align: right; display: none;" value="0" class = "form-control" onkeypress="return noNumbers(event)" autocomplete="off" maxlength="5" placeholder="' + deliveryCharges[m].chargeName + '" title = "' + deliveryCharges[m].chargeName + '" onblur="clearIfNotNumeric(this, 0)" onkeyup="setTotalDeliveryAmount(' + wayBillId + ')" onfocus="resetTextFeild(this, 0);" name="deliveryCharge_' + deliveryCharges[m].chargeTypeMasterId + '_' + wayBillId + '" id="deliveryCharge_' + deliveryCharges[m].chargeTypeMasterId + '_' + wayBillId + '"/>';
					
					appendValueInTableCol(deliveryChargesCol, deliveryChargesInput);
				}
				
				if(executive.accountGroupId == 341) {
					var discountCol				= createColumnInRow(createRow, 'col_' + wayBillId, 'bgcolor_' + consignmentSummaryDeliveryTo + ' isCrossingLR_' + wayBillId +' isExpressDeliveryLR_'+wayBillId +' isBlackListedParty_'+wayBillId, '', '', 'display: none;', '');
					var discountTypeCol			= createColumnInRow(createRow, 'col_' + wayBillId, 'bgcolor_' + consignmentSummaryDeliveryTo + ' isCrossingLR_' + wayBillId +' isExpressDeliveryLR_'+wayBillId +' isBlackListedParty_'+wayBillId, '', '', 'display: none;', '');
				} else {
					var discountCol				= createColumnInRow(createRow, 'col_' + wayBillId, 'bgcolor_' + consignmentSummaryDeliveryTo + ' isCrossingLR_' + wayBillId +' isExpressDeliveryLR_'+wayBillId +' isBlackListedParty_'+wayBillId, '', '', '', '');
					var discountTypeCol			= createColumnInRow(createRow, 'col_' + wayBillId, 'bgcolor_' + consignmentSummaryDeliveryTo + ' isCrossingLR_' + wayBillId +' isExpressDeliveryLR_'+wayBillId +' isBlackListedParty_'+wayBillId, '', '', '', '');
				}
			}
			
			if(configuration.showLrRemarkColumn) {
				var lrRemarkCol		= createColumnInRow(createRow, 'col_' + wayBillId, 'bgcolor_' + consignmentSummaryDeliveryTo + ' isCrossingLR_' + wayBillId +' isExpressDeliveryLR_'+wayBillId +' isBlackListedParty_'+wayBillId, '', '', '', '');
			}

			if(!isDDDV && !configuration.hideGodown && !receiveAndDelivery) {
				var godownCol			= createColumnInRow(createRow, 'col_' + wayBillId, 'bgcolor_' + consignmentSummaryDeliveryTo + ' isCrossingLR_' + wayBillId + ' isExpressDeliveryLR_' + wayBillId + ' isBlackListedParty_' + wayBillId, '', '', '', '');
			}

			if(configuration.allowToInsertShortArticle && !isSubregionForArriveAndDispatch && !isPassengerDeliveryLR) {
				var shortReceiveCol		= createColumnInRow(createRow, 'col_' + wayBillId, 'bgcolor_' + consignmentSummaryDeliveryTo + ' isCrossingLR_' + wayBillId + ' isExpressDeliveryLR_' + wayBillId +' isBlackListedParty_' + wayBillId, '', '', '', '');
			}

			if(configuration.allowToInsertDamageArticle && !isSubregionForArriveAndDispatch && !isPassengerDeliveryLR) {
				var damageReceiveCol	= createColumnInRow(createRow, 'col_' + wayBillId, 'bgcolor_' + consignmentSummaryDeliveryTo + ' isCrossingLR_' + wayBillId + ' isExpressDeliveryLR_' + wayBillId + ' isBlackListedParty_' + wayBillId, '', '', '', '');
			}

			var creationDateTimeCol	= createColumnInRow(createRow, 'col_' + wayBillId, 'bgcolor_' + consignmentSummaryDeliveryTo + ' isCrossingLR_' + wayBillId + ' isExpressDeliveryLR_' + wayBillId + ' isBlackListedParty_' + wayBillId, '', '', 'display: none;', '');
			var isReceivableCol		= createColumnInRow(createRow, 'col_' + wayBillId, 'bgcolor_' + consignmentSummaryDeliveryTo + ' isCrossingLR_' + wayBillId + ' isExpressDeliveryLR_' + wayBillId + ' isBlackListedParty_' + wayBillId, '', '', 'display: none;', '');
			
			if(configuration.AllowToAddLRExpense)
				var addExpenseCol	= createColumnInRow(createRow, 'col_' + wayBillId, 'bgcolor_' + consignmentSummaryDeliveryTo + ' isCrossingLR_' + wayBillId + ' isExpressDeliveryLR_' + wayBillId + ' isBlackListedParty_' + wayBillId, '', '', '', '');
			//Column creation end
			
			//Append values in column started
			if(configuration.BydefaultSelectAllCheckBox) {
				appendValueInTableCol(checkBoxCol, i + 1);
			}
			
			appendValueInTableCol(wayBillNumberCol, "<a style='cursor:pointer;' id='lrview_" + wayBillId + "'><b>" + wayBillNumber + "<b></a>");
			createWayBillNumberFeild(wayBillNumberCol, wayBillId, wayBillNumber);
			createWayBillTypeInputFeild(lrTypeCol, wayBillId, wayBillTypeId);
			createConsigneeNameInputFeild(consigneeNameCol, wayBillId, consigneeName);
			createConsigneeNumberInputFeild(consigneeNoCol, wayBillId, consigneePhoneNumber);

			appendValueInTableCol(fromCol, modelList[i].sourceBranch);
			appendValueInTableCol(toCol, modelList[i].destinationBranch);
			createDestinationBranchInputFeild(toCol, wayBillId, destinationBranchId);
			createHandlingBranchInputFeild(toCol, wayBillId, handlingBranchId);
			appendValueInTableCol(lrTypeCol, modelList[i].wayBillType);
			appendValueInTableCol(amountCol, Math.round(grandTotal));
			
			if(receiveAndDelivery)
				appendValueInTableCol(consignmentDetailsCol, '<button type = "button" id = "viewConsignment_' + wayBillId + '" class = "btn btn-primary">Art. Details</button>');
			
			if(configuration.showNoOfArticleColumn) appendValueInTableCol(noOfArtCol, dispatchedQuantity);
			
			if(!receiveAndDelivery) {
				appendValueInTableCol(artDetailsCol, modelList[i].packageDetails);
				appendValueInTableCol(actBookedWeightCol, dispatchedWeight);
				appendValueInTableCol(chargeWeightCol, chargeWeight);
			}

			createCheckBoxFeild(checkBoxCol, wayBillId);
			createTotalArtFeild(consigneeNameCol, wayBillId, modelList[i].noOfPackages);
			createLRTotalArtFeild(consigneeNameCol, wayBillId, dispatchedQuantity);
			createDispatchedQuantityFeild(consigneeNameCol, wayBillId, dispatchedQuantity);
			createLRDispatchedWeightFeild(consigneeNameCol, wayBillId, dispatchedWeight);
			createLRTotalActWgtFeild(consigneeNameCol, wayBillId, dispatchedWeight);
			createActualUnloadWeightFeild(consigneeNameCol, wayBillId, dispatchedWeight);
			createPaidLoadingFeild(consigneeNameCol, wayBillId, modelList[i].paidLoading);
			createConsignorIdFeild(consigneeNameCol, wayBillId, modelList[i].consignorId);
			createConsigneeCorporateAccountFeild(consigneeNameCol, wayBillId, modelList[i].consigneeCorporateAccountId);

			appendValueInTableCol(consigneeNameCol, consigneeName);
			appendValueInTableCol(consigneeNoCol, consigneePhoneNumber);
			
			if(configuration.showDeliveryAtColumn) {
				appendValueInTableCol(deliveryAt, modelList[i].deliveryAt);
				createDeliveryToInputFeild(deliveryAt, wayBillId, consignmentSummaryDeliveryTo);
			}
			
			if(receiveAndDelivery) {
				if(paymentTypeArr != null) {
					if(configuration.allowReceiveInterBranchLs && modelList[i].typeOfLS == TYPE_OF_LS_ID_Inter_Branch)
						var paymentTypeInput	= '<select id="deliveryPaymentType_' + wayBillId + '" name="deliveryPaymentType_' + wayBillId + '" style="width: 90px;" onblur="hideInfo()" readonly = "readonly" class="form-control" data-tooltip="Rcv / Dlvr As" title = "Rcv / Dlvr As"></select>';
					else
						var paymentTypeInput	= '<select id="deliveryPaymentType_' + wayBillId + '" name="deliveryPaymentType_' + wayBillId + '" style="width: 90px;" onblur="hideInfo()" class="form-control" data-tooltip="Rcv / Dlvr As" title = "Rcv / Dlvr As"></select>';

					appendValueInTableCol(paymentTypeCol, paymentTypeInput);
				}
				
				if(jsonData.allowPodReceiveOption && modelList[i].showPod) {
					var podStatusInput	= '<select id="podStatus_' + wayBillId + '" name="podStatus_' + wayBillId + '" onblur="hideInfo()" class="form-control" data-tooltip="Rcv / Dlvr As" onchange="loadPodDocumentSelection(this);"><option selected value="1">NO</option><option value="2">YES</option></select>';
					appendValueInTableCol(podCol, podStatusInput);
				}
				
				if(jsonData.showPODDocuments) {
					var podDoc = '<div id="podDocumentTypeArr_' + wayBillId + '" style="visibility: hidden; width: 110px;">'
					
					if(podDocumentTypeArr != null) {
						for(var k = 0; k < podDocumentTypeArr.length; k++) {
							podDoc += '<input id = "inputcheck' + wayBillId + '" class = "inputcheck' + wayBillId + ' form-control" name="inputcheck_' + wayBillId + '" type="checkbox" value="' + podDocumentTypeArr[k].podDocumentTypeId + '">' + podDocumentTypeArr[k].podDocumentTypeName;
						}
					}
					
					podDoc += '</div>';
					
					appendValueInTableCol(podDocCol, podDoc);
				}
				
				appendValueInTableCol(deliveryDetailsCol, createDivForDeliveryDetails(wayBillId, consigneeName, consigneePhoneNumber));
				
				if(showReceiverToName) 
					appendValueInTableCol(showReceiverToNameCol, '<input type="text" name="receiverName_' + wayBillId + '" id="receiverName_' + wayBillId +'" class = "form-control" value="" style="width: 120px;" maxlength="100" data-tooltip="Receiver Name"/>');
				
				appendValueInTableCol(discountCol, '<input type="text" name="discount_' + wayBillId + '"  id="discount_' + wayBillId + '" class = "form-control" value="0" style="width: 45px; text-align: right; display: none;" maxlength="6" placeholder = "Discount" title = "Discount" onkeypress="return validAmount(event);" onfocus="resetTextFeild(this, 0)"/>');
				appendValueInTableCol(discountTypeCol, '<select id="discountTypes_' + wayBillId + '" name="discountTypes_' + wayBillId + '" class = "form-control" style="width: 55px;display: none;" data-tooltip="Discount Type" title = "Discount Type"></select>');
			}
			
			if(configuration.showLrRemarkColumn) {
				if(configuration.InsertLRRemark) {
					createLRRemarkFeild(lrRemarkCol, wayBillId);
				} else {
					appendValueInTableCol(lrRemarkCol, modelList[i].remark);
				}
			}
			
			if(!isDDDV && !receiveAndDelivery) {
				if(godowns != null) {
					var godownInput			= '<select id="godownId_' + wayBillId + '" name="godownId' + wayBillId + '" onblur="hideInfo()" class="form-control" data-tooltip="Godown" title = "Godown"></select>';

					appendValueInTableCol(godownCol, godownInput);
				}
			}
			
			if(configuration.allowToInsertShortArticle && !isSubregionForArriveAndDispatch && !isPassengerDeliveryLR) {
				var newLinkAttrForShort		= createLinkButtonForShort(wayBillNumber, lsNumber, dispatchLedgerId, vehicleNumber, vehicleNumberId, wayBillId, dispatchedWeight, privateMarka);
				appendValueInTableCol(shortReceiveCol, newLinkAttrForShort);
			}

			if(configuration.allowToInsertDamageArticle && !isSubregionForArriveAndDispatch && !isPassengerDeliveryLR) {
				var newLinkAttrForDamage	= createLinkButtonForDamage(wayBillNumber, lsNumber, dispatchLedgerId, vehicleNumber, vehicleNumberId, wayBillId, dispatchedWeight, privateMarka);
				appendValueInTableCol(damageReceiveCol, newLinkAttrForDamage);
			}

			createDateTimeFeild(creationDateTimeCol, wayBillId, modelList[i].creationDateTimeStamp);
			appendValueInTableCol(isReceivableCol, '<input style="display: none" name="isReceivable_' + wayBillId + '" id="isReceivable_' + wayBillId + '" type="text"  value="' + modelList[i].receivable +'" />');
			
			if(configuration.AllowToAddLRExpense)
				appendValueInTableCol(addExpenseCol, "<button type = 'button' class='btn btn-success btn-sm' onclick='addWayBillExpense(" + wayBillId + "," + modelList[i].consigneeCorporateAccountId +  ");'><b>Add</b></button>");
			
			appendRowInTable('results', createRow);
			
			$("input select").focus(function(){
				showInfo(this, this.placeholder);
			});

			if(receiveAndDelivery) {
				if(paymentTypeArr != null) {
					operationOnSelectTag('deliveryPaymentType_' + wayBillId, 'addNew', '---Select---', 0);
					
					for(var j = 0; j < paymentTypeArr.length; j++) {
						operationOnSelectTag('deliveryPaymentType_' + wayBillId, 'addNew', paymentTypeArr[j].paymentTypeName, paymentTypeArr[j].paymentTypeId);
						
						if(configuration.allowReceiveInterBranchLs && isInterBranchLs && paymentTypeArr[j].paymentTypeId == PaymentTypeConstant.PAYMENT_TYPE_RECEIVE_AT_GODOWN_ID) {
							operationOnSelectTag('deliveryPaymentType_' + wayBillId, 'prepend', paymentTypeArr[j].paymentTypeName, paymentTypeArr[j].paymentTypeId);
						}
					}
					
					$("#deliveryPaymentType_" + wayBillId).bind("change", function() {
						changeDeliveryDetails(this);
						
						var wayBillTypeId	= Number($('#wayBillType_' + (this.id).split('_')[1]).val());
						
						if(wayBillTypeId == WAYBILL_TYPE_TO_PAY) {
							calcSlctdAmntTyp();
						}
						
						changeColour();
					});
					
					$("#deliveryPaymentType_" + wayBillId).bind("click", function() {
						checkWayBIllReceivability($('#isReceivable_' + wayBillId).val());
					});
				}
				
				setPartyNameAutoComplete(wayBillId);
				
				if(wayBillTypeId == WAYBILL_TYPE_TO_PAY) {
					$("#discount_" + wayBillId).bind("keyup", function() {
						fillclearText(this, 0);
						clearIfNotNumeric(this, 0);changeColour();
						calcSlctdAmntTyp();
					});
					
					$("#discount_" + wayBillId).bind("keyup", function() {
						setTotalDeliveryAmount((this.id).split('_')[1]);
						calcDiscountLimit((this.id).split('_')[1]);
					});
				}
				
				if(discountTypes != null) {
					operationOnSelectTag('discountTypes_' + wayBillId, 'addNew', '---Select---', 0);
	
					for(var z = 0; z < discountTypes.length; z++) {
						operationOnSelectTag('discountTypes_' + wayBillId, 'addNew', discountTypes[z].split("_")[1], discountTypes[z].split("_")[0]);
					}
				}
				
				$("#wayBills_" + wayBillId).bind("click", function() {
					var wayBillTypeId	= Number($('#wayBillType_' + (this.id).split('_')[1]).val());
					
					if(wayBillTypeId == WAYBILL_TYPE_TO_PAY) {
						calcSlctdAmntTyp();
					}
					
					changeColour();
					
					checkWayBIllReceivability($('#isReceivable_' + wayBillId).val());
				});
				
				$( function() {
					$('#chequeDate_' + wayBillId).datepicker({
						minDate		: dispatchLedger.dispatchDateTime,
						maxDate		: new Date(),
						showAnim	: "fold",
						dateFormat	: 'dd-mm-yy'
					});
				} );
			}
			
			$("#lrview_" + wayBillId).bind("click", function() {
				var elementId		= $(this).attr('id');
				var wayBillId		= elementId.split('_')[1];
				viewWayBillDetails(wayBillId, wayBillNumber);
			});
			
			$("#viewConsignment_" + wayBillId).bind("click", function() {
				viewConsignmentDetails((this.id).split('_')[1]);
			});
			
			if(godowns != null) {
				operationOnSelectTag('godownId_' + wayBillId, 'addNew', '---Select---', 0);
				
				for(var l = 0; l < godowns.length; l++) {
					operationOnSelectTag('godownId_' + wayBillId, 'addNew', godowns[l].name, godowns[l].godownId);
				}
				
				if(!configuration.hideGodown) {
					sortDropDownList('godownId_' + wayBillId);
				}
			}

			if(isCrossingLR) {
				$('.isCrossingLR_' + wayBillId).css('background-color' , '#fadfd9');
				$('.isCrossingLR_' + wayBillId).css('color' , '#00394d');
			}
			
			if(isExpressDeliveryLR) {
				$('.isExpressDeliveryLR_' + wayBillId).css('background-color' , '#00BFFF');
				$('.isExpressDeliveryLR_' + wayBillId).css('color' , '#fbf5fb');
				$('.isExpressDeliveryLR_' + wayBillId).css('font-weight' , 'bold');
				$('.isExpressDeliveryLR_' + wayBillId).css('font-style' , 'oblique');
			}
			
			if(isPartyBlackListed) {
				$('.isBlackListedParty_' + wayBillId).css('background-color' , 'red');
				$('.isBlackListedParty_' + wayBillId).css('color' , '#fbf5fb');
				$('.isBlackListedParty_' + wayBillId).css('font-weight' , 'bold');
				$('.isBlackListedParty_' + wayBillId).css('font-style' , 'oblique');
			}
			
			if(isPassengerDeliveryLR) {
				$('.bgcolor_' + consignmentSummaryDeliveryTo).css('background-color' , '#e6f9ff');
				$('.bgcolor_' + consignmentSummaryDeliveryTo).css('color' , '#00394d');
			} 
			
			if(modelList[i].isTceBooking != undefined && modelList[i].isTceBooking) {
				
				$('.isCrossingLR_' + wayBillId).css({
					'background-color': '#1878f3',
					'color': 'white'
				});

				$('#lrview_' + wayBillId).css({
					'background': 'white',
					'padding': '2px',
					'border-radius': '3px'
				})
			} 
		}
	
		if(blackListedLRNoList != undefined && blackListedLRNoList.length > 0) {
			$("#left-border-boxshadow").removeClass("hide");
			$("#blackListedPartyLrs").html("Black Listed LR Number : " + blackListedLRNoList.join(','));
		}
		
		setFooter(noOfPackages, totalAmount, totalActWeight, totalChargeWeight);
	}
	
	if(configuration.navigateToNextGodownOnEnter){
			for (var i = 0; i < wayBillIdArray.length; i++) {
				$("#"+wayBillIdArray[i]).keydown(function(event){
			 		if(event.keyCode == 13){
			 			for (var i = 0; i < wayBillIdArray.length-1; i++) {
			 				if(event.target.id == wayBillIdArray[i]){
			 					document.getElementById(""+wayBillIdArray[i+1]+"").focus()
			 				}
			 			}
			 		}
			 			if(event.keyCode == 27){
				 			for (var i = wayBillIdArray.length-1; i > 0; i--) {
				 				if(event.target.id == wayBillIdArray[i]){
				 					document.getElementById(""+wayBillIdArray[i-1]+"").focus()
				 				}
				 			}
			 			
			 		}
			 	});
			}
		}

}

function createSelectAllCheckBoxFeild(checkBoxCol) {
	var checkBoxFeild		= new Object();

	checkBoxFeild.type		= 'checkbox';
	checkBoxFeild.name		= 'selectAll';
	checkBoxFeild.id		= 'selectAll';
	checkBoxFeild.class		= 'datatd';
	checkBoxFeild.value		= 'Select All';
	
	if(receiveAndDelivery) {
		checkBoxFeild.onclick	= 'selectAllWayBills(this.checked);calcSlctdAmntTyp();changeColour();';
	} else {
		checkBoxFeild.onclick	= 'selectAllWayBills(this.checked);';
	}

	createInput(checkBoxCol, checkBoxFeild);
}

function createCheckBoxFeild(checkBoxCol, wayBillId) {
	var checkBoxFeild		= new Object();

	checkBoxFeild.type		= 'checkbox';
	checkBoxFeild.name		= 'wayBills';
	checkBoxFeild.id		= 'wayBills_' + wayBillId;
	checkBoxFeild.class		= 'datatd';
	checkBoxFeild.value		= wayBillId;
	/*if(showPartyIsBlackListedParty){
		checkBoxFeild.onclick	= 'checkBlackListed(this.checked,'+wayBillId+');'
	}*/
	if(configuration.BydefaultSelectAllCheckBox) {
		checkBoxFeild.checked	= 'checked';
		checkBoxFeild.style		= 'display: none';
	}

	createInput(checkBoxCol, checkBoxFeild);
}

function createLinkButtonForShort(wayBillNumber, lsNumber, dispatchLedgerId, vehicleNumber, vehicleNumberId, wayBillId, actualWeight, privateMarka) {
	var shortReceiveFeild		= new Object();

	shortReceiveFeild.href		= 'javascript:openWindowForShortReceive("'+wayBillNumber+'", "'+lsNumber+'", "'+dispatchLedgerId+'", "'+vehicleNumber+'", "'+vehicleNumberId+'", "'+wayBillId+'","'+actualWeight+'","'+privateMarka+'")';
	shortReceiveFeild.class		= 'btn btn-primary';
	shortReceiveFeild.id		= 'hideLinkForShort_' + wayBillId;
	shortReceiveFeild.html		= 'Click Here';

	var newLinkAttrForShort		= createHyperLink(shortReceiveFeild);

	return newLinkAttrForShort;
}

function createLinkButtonForDamage(wayBillNumber, lsNumber, dispatchLedgerId, vehicleNumber, vehicleNumberId, wayBillId, actualWeight, privateMarka) {
	var damageReceiveFeild		= new Object();

	damageReceiveFeild.href		= 'javascript:openWindowForDamageReceive("'+wayBillNumber+'", "'+lsNumber+'", "'+dispatchLedgerId+'", "'+vehicleNumber+'", "'+vehicleNumberId+'", "'+wayBillId+'","'+actualWeight+'","'+privateMarka+'")';
	damageReceiveFeild.class	= 'btn btn-primary';
	damageReceiveFeild.id		= 'hideLinkForDamage_' + wayBillId;
	damageReceiveFeild.html		= 'Click Here';

	var newLinkAttrForDamage	= createHyperLink(damageReceiveFeild);

	return newLinkAttrForDamage;
}

function createTotalArtFeild(consigneeNameCol, wayBillId, noOfPackages) {
	var lrTotalArtFeild		= new Object();

	lrTotalArtFeild.type	= 'hidden';
	lrTotalArtFeild.name	= 'totalArt_' + wayBillId;
	lrTotalArtFeild.id		= 'totalArt_' + wayBillId;
	lrTotalArtFeild.value	= noOfPackages;

	createInput(consigneeNameCol, lrTotalArtFeild);
}

function createLRTotalArtFeild(consigneeNameCol, wayBillId, dispatchedQuantity) {
	var lrTotalArtFeild		= new Object();

	lrTotalArtFeild.type	= 'hidden';
	lrTotalArtFeild.name	= 'LRTotalArt' + wayBillId;
	lrTotalArtFeild.id		= 'LRTotalArt_' + wayBillId;
	lrTotalArtFeild.value	= dispatchedQuantity;

	createInput(consigneeNameCol, lrTotalArtFeild);
}

function createDispatchedQuantityFeild(consigneeNameCol, wayBillId, dispatchedQuantity) {
	var lrTotalArtFeild		= new Object();

	lrTotalArtFeild.type	= 'hidden';
	lrTotalArtFeild.name	= 'dispatchedQuantity_' + wayBillId;
	lrTotalArtFeild.id		= 'dispatchedQuantity_' + wayBillId;
	lrTotalArtFeild.value	= dispatchedQuantity;

	createInput(consigneeNameCol, lrTotalArtFeild);
}

function createLRDispatchedWeightFeild(consigneeNameCol, wayBillId, dispatchedWeight) {
	var dispatchedWeightFeild		= new Object();

	dispatchedWeightFeild.type	= 'hidden';
	dispatchedWeightFeild.name	= 'LRDispatchedWeight' + wayBillId;
	dispatchedWeightFeild.id	= 'LRDispatchedWeight_' + wayBillId;
	dispatchedWeightFeild.value	= dispatchedWeight;

	createInput(consigneeNameCol, dispatchedWeightFeild);
}

function createLRRemarkFeild(lrRemarkCol, wayBillId) {
	var lrRemarkFeild		= new Object();

	lrRemarkFeild.type			= 'text';
	lrRemarkFeild.name			= 'remark_' + wayBillId;
	lrRemarkFeild.id			= 'remark_' + wayBillId;
	lrRemarkFeild.class			= 'form-control';
	lrRemarkFeild.value			= '';
	lrRemarkFeild.placeholder	= 'Remark';

	createInput(lrRemarkCol, lrRemarkFeild);
}

function createLRTotalActWgtFeild(consigneeNameCol, wayBillId, dispatchedWeight) {
	var lrTotalActWgt		= new Object();

	lrTotalActWgt.type		= 'hidden';
	lrTotalActWgt.name		= 'LRTotalActWgt' + wayBillId;
	lrTotalActWgt.id		= 'LRTotalActWgt' + wayBillId;
	lrTotalActWgt.value		= dispatchedWeight;

	createInput(consigneeNameCol, lrTotalActWgt);
}

function createActualUnloadWeightFeild(consigneeNameCol, wayBillId, dispatchedWeight) {
	var actualUnloadWeight	= new Object();

	actualUnloadWeight.type		= 'hidden';
	actualUnloadWeight.name		= 'actualUnloadWeight_' + wayBillId;
	actualUnloadWeight.id		= 'actualUnloadWeight_' + wayBillId;
	actualUnloadWeight.value	= dispatchedWeight;
	actualUnloadWeight.class	= "form-control";

	createInput(consigneeNameCol, actualUnloadWeight);
}

function createPaidLoadingFeild(consigneeNameCol, wayBillId, paidLoading) {
	var paidLoadingObj	= new Object();

	paidLoadingObj.type		= 'hidden';
	paidLoadingObj.name		= 'paidLoading_' + wayBillId;
	paidLoadingObj.id		= 'paidLoading_' + wayBillId;
	paidLoadingObj.value	= paidLoading;

	createInput(consigneeNameCol, paidLoadingObj);
}

function createConsignorIdFeild(consigneeNameCol, wayBillId, consignorId) {
	var consignorIdObj	= new Object();

	consignorIdObj.type		= 'hidden';
	consignorIdObj.name		= 'ConsignorId_' + wayBillId;
	consignorIdObj.id		= 'ConsignorId_' + wayBillId;
	consignorIdObj.value	= consignorId;

	createInput(consigneeNameCol, consignorIdObj);
}

function createConsigneeCorporateAccountFeild(consigneeNameCol, wayBillId, consigneeCorporateAccountId) {
	var consigneeCorporateAccount	= new Object();

	consigneeCorporateAccount.type		= 'hidden';
	consigneeCorporateAccount.name		= 'consigneeCorporateAccountId_' + wayBillId;
	consigneeCorporateAccount.id		= 'consigneeCorporateAccountId_' + wayBillId;
	consigneeCorporateAccount.value		= consigneeCorporateAccountId;

	createInput(consigneeNameCol, consigneeCorporateAccount);
}

function createWayBillNumberFeild(wayBillNumberCol, wayBillId, wayBillNumber) {
	var wayBillNumberFeild	= new Object();

	wayBillNumberFeild.type		= 'text';
	wayBillNumberFeild.name		= 'wayBillNumber_' + wayBillId;
	wayBillNumberFeild.id		= 'wayBillNumber_' + wayBillId;
	wayBillNumberFeild.class	= 'datatd';
	wayBillNumberFeild.style	= 'display: none';
	wayBillNumberFeild.value	= wayBillNumber;

	createInput(wayBillNumberCol, wayBillNumberFeild);
}

function createDestinationBranchInputFeild(toCol, wayBillId, destinationBranchId){
	var wayBillDestinationFeild	= new Object();

	wayBillDestinationFeild.type	= 'text';
	wayBillDestinationFeild.name	= 'wayBillDestination_' + wayBillId;
	wayBillDestinationFeild.id		= 'wayBillDestination_' + wayBillId;
	wayBillDestinationFeild.class	= 'datatd';
	wayBillDestinationFeild.style	= 'display: none';
	wayBillDestinationFeild.value	= destinationBranchId;

	createInput(toCol, wayBillDestinationFeild);
}

function createDivForDeliveryDetails(wayBillId, consigneeName, consigneePhoneNumber) {
	var deliveryDetailsDiv = '<div id = "chequeDetails_' + wayBillId + '" style="display: none;">';
	
	deliveryDetailsDiv 	+= '<span><input value="' + jsonData.currentDate + '" name="chequeDate_' + wayBillId + '" type="text" id="chequeDate_' + wayBillId + '" data-tooltip="Cheque Date" title = "Cheque Date" placeholder = "Cheque Date" class="form-control" onblur="hideInfo();" readonly = "readonly"/></span>';
	deliveryDetailsDiv	+= '<span><input type="text" maxlength="12" value="" name="chequeNo_' + wayBillId + '" id="chequeNo_' + wayBillId + '" class = "form-control" onblur="hideInfo();clearIfNotNumeric(this, 0);" style="width: 70px;" onkeypress="return noNumbers(event)" data-tooltip="Cheque No" title = "Cheque No" plcaeholder = "Cheque No" onfocus="resetTextFeild(this, 0);" /></span>';
	deliveryDetailsDiv	+= '<span><input style="width: 70px;text-align: right;" type="text" maxlength="7" onblur=" hideInfo();clearIfNotNumeric(this, 0);totalChequeAmount(' + wayBillId + ');" value="0" name="chequeAmount_' + wayBillId + '" id="chequeAmount_' + wayBillId +'" class = "form-control" onkeypress="return noNumbers(event)"  data-tooltip="Cheque Amount" title = "Cheque Amount" placeholder = "Cheque Amount" onfocus="resetTextFeild(this, 0)" /></span>';
	deliveryDetailsDiv	+= '<span><input type="hidden" id="bankNameId_' + wayBillId + '" name="bankNameId_' + wayBillId + '" value="0" />';
	deliveryDetailsDiv	+= '<input value="" style="width: 100px;text-transform:uppercase;" type="text" id="bankName_' + wayBillId +'" name="bankName_' + wayBillId + '" maxlength="30" class="form-control" onblur="hideInfo();" data-tooltip="Bank Name" title = "Bank Name" placeholder = "Bank Name" onkeypress="return noSpclChars(event);"/></span>';
	deliveryDetailsDiv	+= '</div>';
	
	deliveryDetailsDiv  += '<div id = "godownSelect_' + wayBillId + '" style="display: none;">';
	deliveryDetailsDiv  += '<select id="godownId_' + wayBillId +'" name="godownId' + wayBillId +'" class = "form-control" style="width: 130px;" data-tooltip="Godown" title = "Godown"></select>';
	deliveryDetailsDiv  += '</div>';
	
	deliveryDetailsDiv  += '<div id = "deleveryCreditorDetails_' + wayBillId + '" style="display: none;">';
	deliveryDetailsDiv  += '<input type="hidden" id ="selectedDeliveryCreditorId_' + wayBillId + '" name="selectedDeliveryCreditorId_' + wayBillId + '" value="0"/>';
	deliveryDetailsDiv  += '<input placeholder="Delivery Creditor" name="deliveryCreditor_' + wayBillId + '" id="deliveryCreditor_' + wayBillId + '" type="text" data-tooltip="Delivery Creditor" title = "Delivery Creditor" class="form-control" style="display: block;" size="20" onkeyup="resetOnDelete(event, this);" maxlength="30"/>';
	deliveryDetailsDiv  += '</div>';
	
	deliveryDetailsDiv  += '<div id="deliveryContact_' + wayBillId + '" style="display: none;">';
	deliveryDetailsDiv  += '<span><input value="' + consigneeName + '" name="deliveredToName_' + wayBillId + '" id="deliveredToName_' + wayBillId + '" type="text" class = "form-control" style="text-transform:uppercase;" maxlength="30" onkeypress="return noSpclChars(event);" placeholder = "Delivered To Name" data-tooltip="Delivered To Name" />';
	deliveryDetailsDiv  += '<span><input value="' + consigneePhoneNumber + '" name="deliveredToPhoneNo_' + wayBillId + '" id="deliveredToPhoneNo_' + wayBillId + '" type="text" class="form-control" style="width: 150px" maxlength="10" onkeypress="return noNumbers(event)" placeholder = "Phone No" data-tooltip="Phone No"/></span>';
	deliveryDetailsDiv  += '</div>';
	
	return deliveryDetailsDiv;
}

function createDeliveryToInputFeild(deliveryAt, wayBillId, consignmentSummaryDeliveryTo){
	var wayBillDeliveryToFeild	= new Object();

	wayBillDeliveryToFeild.type		= 'text';
	wayBillDeliveryToFeild.name		= 'wayBillDeliveryTo_' + wayBillId;
	wayBillDeliveryToFeild.id		= 'wayBillDeliveryTo_' + wayBillId;
	wayBillDeliveryToFeild.class	= 'datatd';
	wayBillDeliveryToFeild.style	= 'display: none';
	wayBillDeliveryToFeild.value	= consignmentSummaryDeliveryTo;

	createInput(deliveryAt, wayBillDeliveryToFeild);
}

function createHandlingBranchInputFeild(toCol, wayBillId, handlingBranchId){
	var wayBillHandlingFeild	= new Object();

	wayBillHandlingFeild.type	= 'text';
	wayBillHandlingFeild.name	= 'wayBillHandling_' + wayBillId;
	wayBillHandlingFeild.id		= 'wayBillHandling_' + wayBillId;
	wayBillHandlingFeild.class	= 'datatd';
	wayBillHandlingFeild.style	= 'display: none';
	wayBillHandlingFeild.value	= handlingBranchId;

	createInput(toCol, wayBillHandlingFeild);
}

function createWayBillTypeInputFeild(lrTypeCol, wayBillId, wayBillTypeId) {
	var wayBillTypeFeild	= new Object();

	wayBillTypeFeild.type	= 'text';
	wayBillTypeFeild.name	= 'wayBillType_' + wayBillId;
	wayBillTypeFeild.id		= 'wayBillType_' + wayBillId;
	wayBillTypeFeild.class	= 'datatd';
	wayBillTypeFeild.style	= 'display: none';
	wayBillTypeFeild.value	= wayBillTypeId;

	createInput(lrTypeCol, wayBillTypeFeild);
}

function createConsigneeNameInputFeild(consigneeNameCol, wayBillId, consigneeName){
	var consigneeNameFeild	= new Object();

	consigneeNameFeild.type		= 'text';
	consigneeNameFeild.name		= 'consigneeName_' + wayBillId;
	consigneeNameFeild.id		= 'consigneeName_' + wayBillId;
	consigneeNameFeild.class	= 'datatd';
	consigneeNameFeild.style	= 'display: none';
	consigneeNameFeild.value	= consigneeName;

	createInput(consigneeNameCol, consigneeNameFeild);
}

function createConsigneeNumberInputFeild(consigneeNoCol, wayBillId, consigneePhoneNumber){
	var consigneeNumberFeild	= new Object();

	consigneeNumberFeild.type	= 'text';
	consigneeNumberFeild.name	= 'consigneeNo_' + wayBillId;
	consigneeNumberFeild.id		= 'consigneeNo_' + wayBillId;
	consigneeNumberFeild.class	= 'datatd';
	consigneeNumberFeild.style	= 'display: none';
	consigneeNumberFeild.value	= consigneePhoneNumber;

	createInput(consigneeNoCol, consigneeNumberFeild);
}

function createDateTimeFeild(creationDateTimeCol, wayBillId, creationDateTimeStamp) {
	var creationDateTimeFeild	= new Object();

	creationDateTimeFeild.type	= 'text';
	creationDateTimeFeild.name	= 'creationDateTime_' + wayBillId;
	creationDateTimeFeild.id	= 'creationDateTime_' + wayBillId;
	creationDateTimeFeild.class	= 'datatd';
	creationDateTimeFeild.style	= 'display: none';
	creationDateTimeFeild.value	= creationDateTimeStamp;

	createInput(creationDateTimeCol, creationDateTimeFeild);
}

function createNoOfPackagesFeild(col1, noOfPackages) {
	var noOfPackagesFeild		= new Object();

	noOfPackagesFeild.type			= 'hidden';
	noOfPackagesFeild.id			= 'noOfPackages';
	noOfPackagesFeild.name			= 'noOfPackages';
	noOfPackagesFeild.value			= noOfPackages;

	createInput(col1, noOfPackagesFeild);
}

function createDispatchLedgerIdFeild(col1, wayBillReceivableModel) {
	var dispatchLedgerId		= new Object();

	dispatchLedgerId.type		= 'hidden';
	dispatchLedgerId.name		= 'DispatchLedgerId';
	dispatchLedgerId.id			= 'DispatchLedgerId';
	dispatchLedgerId.value		= wayBillReceivableModel[0].dispatchLedgerId;

	createInput(col1, dispatchLedgerId);
}

function createDispatchLedgerCount(col1, wayBillReceivableModel) {
	var dispatchLedgerCount		= new Object();

	dispatchLedgerCount.type	= 'hidden';
	dispatchLedgerCount.name	= 'DispatchLedgerCount';
	dispatchLedgerCount.id		= 'DispatchLedgerCount';
	dispatchLedgerCount.value	= Number(wayBillReceivableModel.length);

	createInput(col1, dispatchLedgerCount);
}

function setFooter(noOfPackages, totalAmount, totalActWeight, totalChargeWeight) {
	var createRow			= createRowInTable('', '', 'background-color: lightgrey');

	var totalNameCol			= createColumnInRow(createRow, '', '', '', '', '', '');
	var col1					= createColumnInRow(createRow, '',  '', '', '', '', '');
	var col2					= createColumnInRow(createRow, '', '', '', '', '', '');
	var col3					= createColumnInRow(createRow, '', '', '', '', '', '');
	var col4					= createColumnInRow(createRow, '', '', '', '', '', '');
	var totalAmountCol			= createColumnInRow(createRow, '', '', '', '', '', '');
	
	if(receiveAndDelivery)
		var consignmentDetailsCol	= createColumnInRow(createRow, '', '', '', '', '', '');
	
	if(configuration.showNoOfArticleColumn)
		var noOfPackagesCol		= createColumnInRow(createRow, '', '', '', '', '', '');
	
	if(!receiveAndDelivery) {
		var col5					= createColumnInRow(createRow, '', '', '', '', '', '');
		var totalActWeightCol		= createColumnInRow(createRow, '', '', '', '', '', '');
		var totalchargeWeightCol	= createColumnInRow(createRow, '', '', '', '', '', '');
	}
	
	var consigneeNameCol		= createColumnInRow(createRow, '', '', '', '', '', '');
	var consigneeNoCol			= createColumnInRow(createRow, '', '', '', '', '', '');
	
	if(configuration.showDeliveryAtColumn)
		var deliveryAt			= createColumnInRow(createRow, '', '', '', '', '', '');
	
	if(receiveAndDelivery) {
		var paymentTypeCol			= createColumnInRow(createRow, '', '', '', '', '', '');
		
		if(jsonData.allowPodReceiveOption)
			var podCol				= createColumnInRow(createRow, '', '', '', '', '', '');
		
		if(jsonData.showPODDocuments)
			var podDocCol			= createColumnInRow(createRow, '', '', '', '', '', '');
		
		var deliveryDetailsCol		= createColumnInRow(createRow, '', '', '', '', '', '');
		
		if(showReceiverToName) 
			var showReceiverToNameCol	= createColumnInRow(createRow, '', '', '', '', '', '');
		
		for(var m = 0; m < deliveryCharges.length; m++) {
			var deliveryChargesCol	= createColumnInRow(createRow, '', '', '', '', '', '');
			appendValueInTableCol(deliveryChargesCol, '');
		}
		
		if(executive.accountGroupId == 341){
			var discountCol				= createColumnInRow(createRow, '', '', '', '', 'display: none;', '');
			var discountTypeCol			= createColumnInRow(createRow, '', '', '', '', 'display: none;', '');	
		} else {
			var discountCol				= createColumnInRow(createRow, '', '', '', '', '', '');
			var discountTypeCol			= createColumnInRow(createRow, '', '', '', '', '', '');
		}
	}
	
	if(configuration.showLrRemarkColumn) {
		var lrRemark				= createColumnInRow(createRow, '', '', '', '', '', '');
	}

	if(!isDDDV && !configuration.hideGodown && !receiveAndDelivery) {
		var col8			= createColumnInRow(createRow, '', '', '', '', '', '');
	}

	if(configuration.allowToInsertShortArticle) {
		var col9				= createColumnInRow(createRow, '', 'shortReceiveCol', '', '', '', '');
	}

	if(configuration.allowToInsertDamageArticle) {
		var col10				= createColumnInRow(createRow, '', 'damageReceiveCol', '', '', '', '');
	}
	
	var col11					= createColumnInRow(createRow, '', '', '', '', 'display: none;', '');
	
	if(configuration.AllowToAddLRExpense)
		var addExpenseCol		= createColumnInRow(createRow, '', '', '', '', '', '');

	appendValueInTableCol(totalNameCol, '<b>Total</b>');

	createDispatchLedgerCount(col1, wayBillReceivableModel);
	createNoOfPackagesFeild(col1, noOfPackages);
	createDispatchLedgerIdFeild(col1, wayBillReceivableModel);

	appendValueInTableCol(col2, '');
	appendValueInTableCol(col3, '');
	appendValueInTableCol(col4, '');
	appendValueInTableCol(totalAmountCol, '<b>' + Math.round(totalAmount) + '</b>');
	if(receiveAndDelivery) appendValueInTableCol(consignmentDetailsCol, '');
	if(configuration.showNoOfArticleColumn) appendValueInTableCol(noOfPackagesCol, '<b>' + noOfPackages + '</b>');
	
	if(!receiveAndDelivery) {
		appendValueInTableCol(col5, '');
		appendValueInTableCol(totalActWeightCol, '<b>' + truncateToTwoDecimals(totalActWeight) + '</b>');
		appendValueInTableCol(totalchargeWeightCol, '<b>' + truncateToTwoDecimals(totalChargeWeight) + '</b>');
	}
	
	appendValueInTableCol(consigneeNameCol, '');
	appendValueInTableCol(consigneeNoCol, '');
	if(configuration.showDeliveryAtColumn) appendValueInTableCol(deliveryAt, '');
	
	if(receiveAndDelivery) {
		appendValueInTableCol(paymentTypeCol, '');
		if(jsonData.allowPodReceiveOption) appendValueInTableCol(podCol, '');
		if(jsonData.showPODDocuments) appendValueInTableCol(podDocCol, '');
		appendValueInTableCol(deliveryDetailsCol, '');
		if(showReceiverToName) appendValueInTableCol(showReceiverToNameCol, '');
		appendValueInTableCol(discountCol, '');
		appendValueInTableCol(discountTypeCol, '');
	}

	if(configuration.showLrRemarkColumn) appendValueInTableCol(lrRemark, '');
	if(!isDDDV && !configuration.hideGodown) appendValueInTableCol(col8, '');
	if(configuration.allowToInsertShortArticle) appendValueInTableCol(col9, '');
	if(configuration.allowToInsertDamageArticle) appendValueInTableCol(col10, '');
	appendValueInTableCol(col11, '');
	if(configuration.AllowToAddLRExpense) appendValueInTableCol(addExpenseCol, '');

	appendRowInTable('totalRow', createRow);
	
}
function checkBlackListed(data,waybillid){
	if(data){
		for(var i = 0 ; i < Number(wayBillReceivableModel.length) ; i++){
			if(wayBillReceivableModel[i].wayBillId == waybillid){
				var wayBillNumber = wayBillReceivableModel[i].wayBillNumber;
				
				if(wayBillReceivableModel[i].consignorBlackListed > 0 && wayBillReceivableModel[i].tbbPartyBlackListed > 0){
					setTimeout(function(){
						showMessage('error', 'Consignor and TBB(LR NO:'+wayBillNumber+') Party are BlackListed ');
					},300);
				}else if(wayBillReceivableModel[i].consignorBlackListed > 0 ){
					setTimeout(function(){
						showMessage('error', 'Consignor(LR NO:'+wayBillNumber+') Party  is  BlackListed ');
					},300);
				}else if(wayBillReceivableModel[i].tbbPartyBlackListed > 0){
					setTimeout(function(){
						showMessage('error', 'TBB(LR NO:'+wayBillNumber+') Party is BlackListed');
					},300);
				}else if(wayBillReceivableModel[i].consigneeBlackListed > 0){
					setTimeout(function(){
						showMessage('error', 'Consignee(LR NO:'+wayBillNumber+') Party is BlackListed');
					},300);
				}
			}
		}
	}
}

function setReceiveDateAfterArrival(arrivalDate, currentDate) {
	if(arrivalDate != undefined && arrivalDate != null) {
		$('#arrivalDate').val(arrivalDate);
		
		setTimeout(() => {
			$( function() {
				$('#manualTURDate').datepicker({
					minDate		: arrivalDate,
					maxDate		: currentDate,
					showAnim	: "fold",
					dateFormat	: 'dd-mm-yy'
				});
			});
		}, 1000);
	} else {
		$("#arrivalDate").val(currentDate);
		
		$( function() {
			$('#manualTURDate').datepicker({
				minDate		: dispatchLedger.dispatchDateTime,
				maxDate		: currentDate,
				showAnim	: "fold",
				dateFormat	: 'dd-mm-yy'
			});
		} );
	}
}

function viewConsignmentDetails(wayBillId){
	childwin = window.open ('consignmentDetails.do?pageId=340&eventId=2&modulename=consignmentDetails&wayBillId=' + wayBillId,'newwindow', config='left=200,top=130,width=1055,height=490, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function viewWayBillDetails(wayBillId, wayBillNumber) {	
	window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId=' + wayBillId + '&NumberType=' + 1 + '&wayBillNumber=' + wayBillNumber);
}

function showUnloadingHamaliField() {
	changeDisplayProperty('unloadingHamaliSettlementAmount', 'inline-block');
	$('#unloadingHamaliSettlementAmount').append('<b>Unloading Hamali Settlement Amount:</b><br>');
	$('#unloadingHamaliSettlementAmount').append('<input type="text" id="unloadingHamaliAmount" name="unloadingHamaliAmount" class="form-control" data-tooltop="Unloading Hamali Settlement Amount" onkeydown="return allowOnlyNumeric(event)">')
}

function setReceiveDetailsOnConsignee(value) {
	let selectedGodownId = $('#godownIdMaster').val();

	$('#results tbody').empty();
	$('#results thead').empty(); 
	$('#results tfoot').empty();

	let selectedConsigneeId = parseInt(value);
	
	if (selectedConsigneeId === 0) {
		filteredWayBillModel = wayBillReceivableModel;
	} else {
		filteredWayBillModel = wayBillReceivableModel.filter(function(item) {
			return item.consigneeCorporateAccountId == selectedConsigneeId;
		});
	}

	setWayBillReceivableModel();

	if (selectedGodownId) {
		$('#godownIdMaster').val(selectedGodownId);
		setTimeout(function() {
			setGodown(selectedGodownId);
		}, 100);
	}
}

