/**
 * 
 */

var jsondata 										= null;
var Bill	 										= null;
var TransportCommonMaster	 					    = null;
var PaymentTypeConstant								= null;
var Total	 										= 0;
var TotalReceived									= 0;
var TotalBalnce	 									= 0;
var TotalReceivedAmt								= 0;
var GrandTotal	 									= 0;
var BalanceAMT		 								= 0;
var TotalBillCount	 								= 0;
var datefield  										= document.createElement("input");
var makepayementbillnolist 							= new Array();
var partialWaybill 									= new Array();
var clearWaybill 									= new Array();
var jsObjForWaybillids 								= new Object();
var jsObjForBalanceAmt 								= new Object();
var tdsConfiguration								= null;
var TDSTxnDetailsIdentifiers						= null;
var BillClearanceTDSChargeInPercent					= 0;
var isTDSChargeInPercentAllow						= null;
var IsPANNumberMandetory							= false;
var IsTANNumberMandetory							= false;
var allowBackDateEntryForBillPayment				= false;
var noOfDays										= 0;
var previousDate									= null;
var billPaymentConfig								= null;
var BankPaymentOperationRequired					= false;
var paymentTypeArr									= null;
var allowBillClearancePartialPayment				= false;
var allowBillClearanceNegotiatedPayment				= false;
var corporateAccountId								=0;
var ModuleIdentifierConstant						= null;
var isCheckboxOptionToAllowTDS						= null;
var discountInPercent								= 0;
var partialBillId 									= 0;
var partialBillAmt									= 0;
var billDateArray									= new Array();
var billcreationDateString							= null;

//Load data 
function loadDataForBillClearncePannel() {
	showLayer();
	let jsonObject		= new Object();
	jsonObject.filter	= 1;
	
	let jsonStr = JSON.stringify(jsonObject);

	$.getJSON("MakePaymentAjaxAction.do?pageId=303&eventId=1",
			{json:jsonStr}, function(data) {			
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', iconForErrMsg + ' ' + data.errorDescription); // show message to show system processing error massage on top of the window.
					hideLayer();
				} else{
					jsondata							= data;
					Bill								= jsondata.bill;
					TransportCommonMaster				= jsondata.TransportCommonMaster;
					PaymentTypeConstant					= jsondata.PaymentTypeConstant;
					tdsConfiguration					= jsondata.tdsConfiguration;
					TDSTxnDetailsIdentifiers			= jsondata.TDSTxnDetailsIdentifiers;
					IsPANNumberMandetory				= tdsConfiguration.IsPANNumberMandetory;
					IsTANNumberMandetory				= tdsConfiguration.IsTANNumberMandetory;
					isTDSChargeInPercentAllow			= tdsConfiguration.IsTDSInPercentAllow;
					BillClearanceTDSChargeInPercent		= tdsConfiguration.TDSChargeInPercent;
					allowBackDateEntryForBillPayment	= jsondata.allowBackDateEntryForBillPayment;
					previousDate						= jsondata.previousDate;
					billPaymentConfig					= jsondata.billPaymentConfig;
					BankPaymentOperationRequired		= billPaymentConfig.BankPaymentOperationRequired;
					paymentTypeArr						= jsondata.paymentTypeArr;
					allowBillClearancePartialPayment	= jsondata.allowBillClearancePartialPayment;
					allowBillClearanceNegotiatedPayment	= jsondata.allowBillClearanceNegotiatedPayment;
					ModuleIdentifierConstant			= jsondata.ModuleIdentifierConstant;
					isCheckboxOptionToAllowTDS			= tdsConfiguration.IsCheckboxOptionToAllowTDS;
					discountInPercent					= jsondata.discountInPercent;
					
					/*
					 * Function called from billClearanceSetReset.js
					 * 
					 */
					
					if(BankPaymentOperationRequired)
						setInvoicePaymentPanel();
					else {
						setPaymentType();
						setPaymentMode();
						setTotalAmt();
						setBalanceAmount();
						setTotalReceivedAmount();
						setReceivedAmount();
						setDataForBillWiseTable();
						showHideColIfTdsAllow();
						/*setDataForDataContentForPartialBill();*/
						loadChequeBounceModal();
					}
					
					hideLayer();
				}
			});
}

//Called In billClearanceSetReset.js
function displayPartialPaymentSelectionDropdown(billId) {
	if(!billPaymentConfig.DisplayPartialPaymentSelectionDropdown)
		return;
	
	let paymentType		= $("#makePaymentJsPannel #paymenttypeInnerTbl_" + billId).val();
	
	if(paymentType == PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_ID)
		switchHtmlTagClass('partialPaymentSelection_' + billId, 'show', 'hide');
	else
		switchHtmlTagClass('partialPaymentSelection_' + billId, 'hide', 'show');
}

//Open Payment Js pannel For selected Bills
function openPaymentPannel() {
	let typeOfSelection	= $('#typeOfSelection').val();
	
	if(typeOfSelection != SEARCH_BY_MULTIPLE_BILL) {
		//DataTable
		let table = $('#billClrTable').DataTable();
		//Apply the search
		table.columns().eq( 0 ).each( function ( colIdx ) {
			$( 'input', table.column( colIdx ).footer() ).each( function ( colIdx ) {
				$(this).val("");
				$(this).trigger("keyup");
			} );
		});
	}

	if(validateForm())
		loadDataForBillClearncePannel();
}

function setInvoicePaymentPanel() {
	if(BankPaymentOperationRequired) {
		Total	 				= 0;
		TotalReceived			= 0;
		TotalBalnce	 			= 0;
		TotalReceivedAmt		= 0;
		GrandTotal	 			= 0;
		BalanceAMT		 		= 0;
		TotalBillCount	 		= 0;
		balanceAmt 				= 0;
		grandReceivedAmount		= 0;
		GransTOt 				= 0;
		
		let typeOfSelection = $("#typeOfSelection").val();
		
		if(typeOfSelection == undefined || typeof typeOfSelection == 'undefined')
			typeOfSelection = 1;
			
		let billIds	= getBillids();
			
		clearTable();

		if(partialBillId != undefined && partialBillId != null && partialBillId > 0)
			window.open ('viewDetails.do?pageId=340&eventId=2&modulename=multipleBillClearance&typeOfSelection='+typeOfSelection+'&billIds=' + billIds + '&partialBillId='+partialBillId+'&partialBillAmt='+partialBillAmt,'newwindow', config='toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
		else
			window.open ('viewDetails.do?pageId=340&eventId=2&modulename=multipleBillClearance&typeOfSelection='+typeOfSelection+'&billIds=' + billIds,'newwindow', config='toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	} else {
		createJsPanel("Make Payment");
		$('#makePaymentJsPannel #ChequeDate').prop('id', 'jspanelchequedate');
		$('#makePaymentJsPannel #backDate').prop('id', 'jspanelbackDate');
		$('#makePaymentJsPannel #fd-but-ChequeDate').prop('id', 'fd-but-jspanelchequedate');

		if(billPaymentConfig.showReceivedAmountFeild)
			setJsDataPanelHM();//Defined in BillPayment.js

		setAmountForPayment();//Defined in billClearanceSetReset.js
	}
}

var jspanelforClearnce	= null;

function createJsPanel(title) {
	var jspanelContent	= $('#jsPanelClernceContent').html();
	jspanelforClearnce = $.jsPanel({
		id		: 'makePaymentJsPannel',
		content:  jspanelContent,
		size:    	 "auto",
		title:    title,
		position: "center",
		theme:    "primary",
		overflow: 'scroll',
		panelstatus: "maximized",
		paneltype: {
			type: 'modal',
			mode: 'extended'
		},
		controls: {
			maximize: true,
			minimize: true,
			normalize: true,
			smallify: true,
		}
	});
}
//validate from
function validateForm() {
	let rowFound 		= false;
	GrandTotal 			= 0;
	TotalReceivedAmt	= 0;
	BalanceAMT 			= 0;
	TotalBillCount 		= 0;
	
	if(billPaymentConfig.showReceivedAmountFeild && $('#receivedAmountValue').val() > balanceAmt) {
		showMessage('info', billAmountExceedInfoMsg(balanceAmt));
		$('#receivedAmountValue').val('');
		return false;
	}
	
	let tableEl 		= document.getElementById("billClrTable");
	
	for (let row = tableEl.rows.length - 2; row > 0; row--) {
		if(tableEl.rows[row].cells[1].getElementsByTagName("input")[0]) {
			if(tableEl.rows[row].cells[1].getElementsByTagName("input")[0].checked) {
				Total 				= parseFloat(tableEl.rows[row].cells[10].firstChild.nodeValue);
				TotalReceived		= parseFloat(tableEl.rows[row].cells[9].firstChild.nodeValue);
				TotalBalnce 		= parseFloat(tableEl.rows[row].cells[8].firstChild.nodeValue);
				GrandTotal 			+= Total;
				BalanceAMT 			+= TotalBalnce;	
				TotalReceivedAmt	+= TotalReceived;
				TotalBillCount++;
				rowFound 			= true;
			}
		}
	}
	
	if(!rowFound) {
		showMessage('error', selectBillNumberErrMsg);
		return false;
	}
	
	return true;
}

function showMessage1(type, msg) {
	hideAllMessages();

	$('.' + type).addClass("showElemnt");
	$('.' + type).removeClass("hideElemnt");
	$('.' + type).html('<h2>'+msg+'<span style="padding: 100px;">[X] Close</span></h2>');
	$('.' + type).animate({
		top : "0"
	}, 400);
}

function createBill() {
	
	if(validatePannel()  && validatePannelForInnerTable()) {
		calculateGrandTotal();
		
		if(confirm('Are you sure you want to receive payment ?')) {
			showLayer();
			let jsonObject				= new Object();
			let jsonObjectdata;
			let billArray				= new Array();

			for (let i = 0; i <= makepayementbillnolist.length - 1; i++) {
				let billData	= new Object();

				let billId = makepayementbillnolist[i];

				billData.billId 		= billId;

				billData.billNumber 	= $('#makePaymentJsPannel #billNoInnerTbl_' + billId).val();
				billData.creditorId 	= $('#makePaymentJsPannel #creditorIdInnerTbl_' + billId).val();
				billData.branchId	 	= $('#makePaymentJsPannel #branchIdInnerTbl_' + billId).val();
				

				if(tdsConfiguration.IsTdsAllow && tdsConfiguration.IsPANNumberRequired)
					billData.panNumber	= $('#makePaymentJsPannel #panNumberInnerTbl_' + billId).val();
				
				if(tdsConfiguration.IsTdsAllow && tdsConfiguration.IsTANNumberRequired)
					billData.tanNumber	= $('#makePaymentJsPannel #tanNumberInnerTbl_' + billId).val();

				billData.paymentMode	= $('#makePaymentJsPannel #paymentModeInnerTbl_' + billId).val();
				billData.remark			= $('#makePaymentJsPannel #remarkInnerTbl_' + billId).val();
				billData.bankName		= $('#makePaymentJsPannel #bankNameInnerTbl_' + billId).val();
				billData.OnlineTXNType  = $('#makePaymentJsPannel #OnlineTXNTypeInnerTbl_' + billId).val();
				billData.cheque			= $('#makePaymentJsPannel #chequeInnerTbl_' + billId).val();
				billData.chequeDate		= $('#makePaymentJsPannel #ChequeDateInnerTbl_' + billId).val();
				billData.paymentType	= $('#makePaymentJsPannel #paymenttypeInnerTbl_' + billId).val();
				billData.totalAmount	= $('#makePaymentJsPannel #totAmtInnerTbl_' + billId).val();

				if(tdsConfiguration.IsTdsAllow)
					billData.txnAmount	= $('#makePaymentJsPannel #txnAmtInnerTbl_' + billId).val();

				billData.recAmount		= $('#makePaymentJsPannel #recAmtInnerTbl_' + billId).val();

				if(tdsConfiguration.IsTdsAllow) {
					billData.tdsAmount	= $('#makePaymentJsPannel #tdsAmtInnerTbl_' + billId).val();
					billData.tdsRate	= Number(BillClearanceTDSChargeInPercent);
				}

				billData.balAmount		= $('#makePaymentJsPannel #balanceInnerTbl_' + billId).val();
				billData.partPmtSelec	= $('#makePaymentJsPannel #partialPaymentSelection_' + billId).val();
				
				if(chequeBounceRequired)
					billData.isAllowChequePayment	= $('#makePaymentJsPannel #isAllowChequePaymentInnerTbl_' + billId).val();

				billData.waybillids		= jsObjForWaybillids[billId];
				billData.billCreationDate	= $('#makePaymentJsPannel #billCreationDateInnerTbl_' + billId).val();
				billArray.push(billData);
			}
			
			jsonObjectdata = new Object();
			jsonObjectdata.filter = 2;
			jsonObjectdata.totalBillCount = TotalBillCount;

			jsonObjectdata.ReceivedAmount 	= $("#makePaymentJsPannel #receivedAmount").val();
			jsonObjectdata.BackDate			= $("#makePaymentJsPannel #jspanelbackDate").val();
			jsonObjectdata.PaymentType		= $("#makePaymentJsPannel #paymentType").val();
			
			if(tdsConfiguration.IsTdsAllow) {
				jsonObjectdata.TransactionAmount 	= $("#makePaymentJsPannel #txnAmount").val();
				jsonObjectdata.TDSGrandAmount 		= $("#makePaymentJsPannel #tdsAmount").val();
			}

			jsonObjectdata.billArray	= JSON.stringify(billArray);
			jsonObjectdata.clearWaybill	= clearWaybill;
			jsonObjectdata.typeOfSelection	= $("#typeOfSelection").val();
			jsonObjectdata.debitToBranchId	= 0;

			jsonObjectdata.billCreationDate	= billcreationDateString;
			jsonObjectdata.billDateStr	= billDateArray.join(',');
			
			jsonObject = jsonObjectdata;
			
			let jsonStr = JSON.stringify(jsonObject);

			$.post("MakePaymentAjaxAction.do?pageId=303&eventId=1",
					{json:jsonStr}, function(data) {
						if(!data || jQuery.isEmptyObject(data) || data.errorDescription){
							showMessage('error', iconForErrMsg + ' ' + "Sorry an error occourd in system !!"); // show message to show system processing error massage on top of the window.
							jspanelforClearnce.close();
							hideLayer();
						}else{		
							let notallow		= data.notallow;
							let noOfDays		= data.noOfDays;
							let backDateNotValid		= data.backDateNotValid;
							let futureDateNotAllowed	= data.futureDateNotAllowed;
							let billCreateDateTime		= data.billCreateDate;
							
							if(notallow != undefined && !notallow) {
								showMessage('info', billClearanceNotAllowed(noOfDays));
								hideLayer();
								return;
							}
							
							if(backDateNotValid != undefined && backDateNotValid && billCreateDateTime != undefined && billCreateDateTime != null) {
								showMessage('info', 'Back Date Should Not Be Less Than Bill Creation Date ' + billCreateDateTime);
								hideLayer();
								return;
							}
							
							if(futureDateNotAllowed != undefined && futureDateNotAllowed) {
								showMessage('info', futureDateNotAllowdErrMsg);
								hideLayer();
								return;
							}
							
							if(data.success) {
								showMessage('success', iconForSuccessMsg + ' ' + "Bill clearance process completed successfully!"); 
								let tableClr = $('#billClrTable').DataTable();
								tableClr.clear().draw();
								tableClr.destroy();
								balanceAmt 				= 0;
								grandReceivedAmount		= 0;
								GransTOt 				= 0;
								$('table#billClrTable tr#columnsCount').remove();
								refreshAndHidePartOfPage('top-border-boxshadow', 'refresh');
								refreshAndHidePartOfPage('bottom-border-boxshadow', 'hideAndRefresh');
								jspanelforClearnce.close();
								loadDataForBillClearnce(0, '', null);
							}
						}
						hideLayer();
					});
		}
	}
}

function createOption(Id,key,value) {
	let newOption = $("<option />");
	$('#'+Id).append(newOption);
	newOption.attr('id',key);
	newOption.val(key);
	newOption.html(value);
}

function setDateCalender() {
	$( function() {
		$("#makePaymentJsPannel #jspanelbackDate").datepicker({
	    	maxDate		: new Date(),
	    	minDate		: previousDate,
	    	showAnim	: "fold",
	    	dateFormat	: 'dd-mm-yy',
	    	onSelect: function(datetext){
	    		let d = new Date(); // for now
	    		let h = d.getHours();
	    		h = (h < 10) ? ("0" + h) : h ;

	    		let m = d.getMinutes();
	    		m = (m < 10) ? ("0" + m) : m ;

	    		let s = d.getSeconds();
	    		s = (s < 10) ? ("0" + s) : s ;

	    		datetext = datetext + " " + h + ":" + m + ":" + s;
	    		$("#makePaymentJsPannel #jspanelbackDate").val(datetext);
	        },
	    });
	    
	    $("#makePaymentJsPannel #jspanelbackDate").datepicker("setDate", new Date());
	  } );
	
	if(!allowBackDateEntryForBillPayment)
		$("#makePaymentJsPannel #jspanelbackDate").attr('disabled', true);
}

function setInnerTableDate(datetext) {
	for(const element of makepayementbillnolist) {
		$("#makePaymentJsPannel #ChequeDateInnerTbl_" + element).val(datetext);
	}
}

//Open JsPannel For Lr Details In bill 

var jspanelforLRView	= null;
function createJsPanelForLrDetails(title) {
	let jspanelContent	= $('#jsPanelLRDetailsContent').html();
	jspanelforLRView = $.jsPanel({
		id		: 'lrDetailsJsPannel',
		content:  jspanelContent,
		size:     {width: 350, height: 350},
		title:    title,
		position: "center",
		theme:    "primary",
		overflow: 'scroll',
		panelstatus: "maximized",
		paneltype: {
			type: 'modal',
			mode: 'extended'
		},
		controls: {
			maximize: true,
			minimize: true,
			normalize: true,
			smallify: true,
		}
	});
}

function openLrDetailsPannel(billId){
	showBillWiseLrs(billId);
	createJsPanelForLrDetails("Lr Details");
}

var cont = 0;

function showBillWiseLrs(billId) {
	showLayer();
	let jsonObjectdata		= new Object();
	jsonObjectdata.filter 	= 3;
	jsonObjectdata.billId 	= billId;
	let jsonStr 			= JSON.stringify(jsonObjectdata);
	
	$.getJSON("BillClearanceAjaxAction.do?pageId=303&eventId=1",
			{json:jsonStr}, function(data) {			
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					setDetailsWhileNoPatialLrFind(billId);
					hideLayer();
				} else{
					if(cont > 0 ){
						let table = $('#lrDetailsJsPannel #Lrdetails').DataTable();
						table.clear().draw();
						table.destroy();
						
					}
					$('#lrDetailsJsPannel #noReCordLR').hide();
					let jsonArr =  data.billsJsonArray;

					let k = 0;
					partialWaybill = new Array();
					
					for(let key in jsonArr) {
						k = k+1;
						
						if (jsonArr.hasOwnProperty(key)) {
							let waybillDtls = jsonArr[key];
							let waybillRow				= createRow('tr_'+waybillDtls.wayBillId, '');

							let srNo 					= createColumn(waybillRow ,'td_'+k,'10%','left','','');
							let lrNo					= createColumn(waybillRow ,'td_'+waybillDtls.wayBillNumber,'20%','left','','');
							let BkDate					= createColumn(waybillRow ,'td_'+waybillDtls.creationDateTimeStamp,'20%','left','','');
							let From					= createColumn(waybillRow ,'td_'+waybillDtls.sourceSubRegion,'20%','left','','');
							let TO						= createColumn(waybillRow ,'td_'+waybillDtls.destinationSubRegion,'10%','left','','');
							let Amount					= createColumn(waybillRow ,'td_'+waybillDtls.grandTotal,'10%','left','','');
							let waybillChk				= createColumn(waybillRow ,'td_'+waybillDtls.wayBillId,'10%','left','','');
							$(srNo).append(k);
							$(lrNo).append(waybillDtls.wayBillNumber);
							$(BkDate).append(waybillDtls.creationDateTimeStamp);
							$(From).append(waybillDtls.sourceSubRegion);
							$(TO).append(waybillDtls.destinationSubRegion);
							$(Amount).append(waybillDtls.grandTotal);
							$(Amount).append('<input align="right" name="grandTot_' + waybillDtls.wayBillId + '" id="grandTot_' + waybillDtls.wayBillId + '" value=' + waybillDtls.grandTotal + ' type="hidden">');
							$(waybillChk).append('<input align="right" name="waybillChk_' + waybillDtls.wayBillId + '" id="waybillChk_' + waybillDtls.wayBillId + '" type="checkbox" class="checkBox1">');
							$('#lrDetailsJsPannel #Lrdetails').append(waybillRow);
							partialWaybill.push(waybillDtls.wayBillId);
						}
					}
					
					if(cont == 0 ){
						resetTable1();
						cont++;
					} else {
						let table = $('#lrDetailsJsPannel #Lrdetails').DataTable();

						table.destroy();
						resetTable1();
					}

					$("#billId1").val(billId);
					hideLayer();
				}
			});
}

function resetTable1() {

	$('#lrDetailsJsPannel #Lrdetails').dataTable( {

		"bPaginate": false,
		"bInfo": true,
		/*"scrollY":        "300px",*/
		"scrollCollapse": true,
		"sDom": "frtiS",
		"bJQueryUI" : true,

		destroy: true,
	});

	changeDisplayProperty('Lrdetails_filter', 'none');
}

function adDataTable(){
	let tableId	= '#lrDetailsJsPannel #Lrdetails';
	setDatatable(tableId);
}

//Calculate total received amount.
function calulateFinalReceivedAmount() {
	let totalReceivedAmt 	= 0;
	let totalTxnAmount		= 0;
	let totalTdsAmount		= 0;
	
	for(const element of makepayementbillnolist) {
		let billId = element;
		totalReceivedAmt 	+= Number($('#makePaymentJsPannel #recAmtInnerTbl_' + billId).val());
		
		if(tdsConfiguration.IsTdsAllow) {
			totalTxnAmount		+= Number($('#makePaymentJsPannel #txnAmtInnerTbl_' + billId).val());
			totalTdsAmount		+= Number($('#makePaymentJsPannel #tdsAmtInnerTbl_' + billId).val());
		}
	}
	
	if(tdsConfiguration.IsTdsAllow) {
		$('#makePaymentJsPannel #txnAmount').val(totalTxnAmount);
		$('#makePaymentJsPannel #tdsAmount').val(totalTdsAmount);
		$('#makePaymentJsPannel #balanceAmount').val(BalanceAMT - totalTxnAmount);
	} else {
		$('#makePaymentJsPannel #balanceAmount').val(BalanceAMT - totalReceivedAmt);
	}
	
	$('#makePaymentJsPannel #receivedAmount').val(totalReceivedAmt);
	
	if(tdsConfiguration.IsTdsAllow && totalTdsAmount > totalTxnAmount && $('#makePaymentJsPannel #recAmtInnerTbl_' + billId).val() < 0) {
		showMessage('error', 'TDS Amount Cannot Be Greater Than Txn Amount');
		changeTextFieldColorNew($("#makePaymentJsPannel #tdsAmtInnerTbl_" + billId), '', '', 'red');
		return false;
	}
}

function calculatePartialAmt(billid){

	let grandTol		= 0;
	let balval				= 0;
	clearWaybill = new Array();

	for (const element of partialWaybill) {
		let wayBillId = element;
		
		if($('#lrDetailsJsPannel #waybillChk_' + wayBillId).is(':checked')) {
			grandTol += parseInt($('#lrDetailsJsPannel #grandTot_' + wayBillId).val());
			clearWaybill.push(wayBillId);
		}
	}

	jsObjForWaybillids[billid] = clearWaybill;

	$("#makePaymentJsPannel #recAmtInnerTbl_" + billid).val(grandTol);
	balval = jsObjForBalanceAmt[billid] - grandTol;
	$("#makePaymentJsPannel #balanceInnerTbl_" + billid).val(balval);
	jspanelforLRView.close();
}

function clearOnfocus(ele){
	if(ele.value=='0'){
		ele.value="";
	}
}

function openLrwiseCOnfigOnRceive(billId) {
	
	if(billPaymentConfig.DisplayPartialPaymentSelectionDropdown) {
		let partialPaymentType				= getValueFromInputField('paymenttypeInnerTbl_' + billId);
		let partialPaymentSelectionType		= getValueFromInputField('partialPaymentSelection_' + billId);
		
		if(partialPaymentType == PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_ID) {
			if(!validatePartialPaymentTypeSelection(billId)) {
				return false;
			} else if(partialPaymentSelectionType == TransportCommonMaster.LR_WISE_PARTIAL_PAYMENT_ID) {
				if($("#makePaymentJsPannel #paymenttypeInnerTbl_" + billId).val() == PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_ID && billPaymentConfig.LRWisePartialPaymentAllow) {
					$("#makePaymentJsPannel #recAmtInnerTbl_" + billId).attr('readonly', true);
					openLrDetailsPannel(billId);
				}
			} else if(partialPaymentSelectionType == TransportCommonMaster.WITHOUT_LR_WISE_PARTIAL_PAYMENT_ID) {
				if($("#makePaymentJsPannel #paymenttypeInnerTbl_" + billId).val() == PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_ID && billPaymentConfig.WithoutLRWisePartialPaymentAllow) {
					$("#makePaymentJsPannel #recAmtInnerTbl_" + billId).attr('readonly', false);
				}
			}
		}
	} else if($("#makePaymentJsPannel #paymenttypeInnerTbl_" + billId).val() == PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_ID && billPaymentConfig.LRWisePartialPaymentAllow) {
		$("#makePaymentJsPannel #recAmtInnerTbl_" + billId).attr('readonly', true);
		openLrDetailsPannel(billId);
	}
}

function selectAllLRBill(param) {
	for (const element of partialWaybill) {
		 $("#lrDetailsJsPannel #waybillChk_" + element).prop("checked", param);
	}
}

function calculateGrandTotal() {
	let grandTotalReceiveAmount		= 0;
	let grandTotalTxnAmount			= 0;
	let grandTotalTdsAmount			= 0;
	let grandTotalBalanceAmount		= 0;

	for (let i = 0; i <= makepayementbillnolist.length - 1; i++) {
		let billId = makepayementbillnolist[i];
		
		if(tdsConfiguration.IsTdsAllow) {
			grandTotalTxnAmount	+= Number($('#makePaymentJsPannel #txnAmtInnerTbl_' + billId).val());
			grandTotalTdsAmount	+= Number($('#makePaymentJsPannel #tdsAmtInnerTbl_' + billId).val());
		}

		grandTotalReceiveAmount	+= Number($('#makePaymentJsPannel #recAmtInnerTbl_' + billId).val());
		grandTotalBalanceAmount	+= Number($('#makePaymentJsPannel #balanceInnerTbl_' + billId).val());
	}
	
	if(tdsConfiguration.IsTdsAllow) {
		$("#makePaymentJsPannel #txnAmount").val(grandTotalTxnAmount);
		$("#makePaymentJsPannel #tdsAmount").val(grandTotalTdsAmount);
	}
	
	$("#makePaymentJsPannel #receivedAmount").val(grandTotalReceiveAmount);
	$("#makePaymentJsPannel #balanceAmount").val(grandTotalBalanceAmount);
}

function getBillids() {
	let tableEl 	= document.getElementById("billClrTable");
	let billIdList 	= new Array();
	
	for (let row = tableEl.rows.length-2; row > 0; row--) {
		if(tableEl.rows[row].cells[1].getElementsByTagName("input")[0]
			&& tableEl.rows[row].cells[1].getElementsByTagName("input")[0].checked
				&& tableEl.rows[row].cells[2].getElementsByTagName("input")[1] != undefined)
			billIdList.push(parseInt(tableEl.rows[row].cells[2].getElementsByTagName("input")[1].value));
	}

	return billIdList;
}

function appendBillsToMakePayment(GransTOt){
	
	let value 				= Number($('#amountToBeReceived').val());
	partialBillAmt 			= Number($('#amountToBeReceived').val());
	
	if(value > GransTOt){
		showMessage('info', 'Amount Cannot Be Greater Than All Bills Amount');
		changeTextFieldColorNew($("#amountToBeReceived"), '', '', 'red');
		return false;
	}
	
	let tableEl 				= document.getElementById("billClrTable");
	let rows					= tableEl.children[1].rows;
	let partialBillCheckBoxId 	= '';
	
	for(const element of rows) {
		let col 			= element.cells[1].childNodes[0];
		let billTotal 		= Number(element.cells[8].childNodes[0].data);
		let totalAmt		= totalAmt + billTotal;
		let id				= col.id;

		if(totalAmt > value) {
			partialBillId			= Number(element.id.split('_')[1]);
			partialBillCheckBoxId	= id;
			break;
		} else {
			partialBillAmt			= partialBillAmt - billTotal;
			$('#'+id).prop('checked', true);
		}
	}
	
	if(partialBillAmt > 0 && partialBillCheckBoxId != undefined)
		$('#' + partialBillCheckBoxId).prop('checked', true );
	
	$( "#makePayment" ).trigger( "click" );
	
}
