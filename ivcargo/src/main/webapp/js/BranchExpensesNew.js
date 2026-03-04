var letestBalanceMap =null;
var voucherType = 0;
var branchExpenseNewFlowAllow = false;
var branchExpense		= new Object();
var columnArray			= new Array();
var branchExpenseCount	= 0;
var key;
var voucherAmt	= 0;
var moduleId			= 0;
var ModuleIdentifierConstant		= null;
var bankPaymentOperationRequired	= false;
var paymentTypeArr					= null;
var PaymentTypeConstant				= null;
var executive						= null;
var incomeExpenseModuleId			= 0;
var BranchExpenseConfiguration		= null;
var isMaximumAmountForExpenseAllowed= false;
var maximumAmountForExpense			= 0;
var BranchExpenseTdsProperty		= null;
var isMaximumAmountForExpenseAllowed	= false;
var maximumAmountForExpense				= 0;
var tdsRateLst		= new Array();
var selectizeArea	= null;
var selectizeBank	= null;
var chequePopUpClearFlag	= true;
var voucherDetailsId				= 0;
var paymentVoucherSequenceNumber	= "";
var doneTheStuff					= false;
var debitToBranch					= false;
var branchExpenseVoucherSettlement	= false;
var expenseTypeIdsForDebitToBranch	= null;
var debitbranchModel				= null;
var flagForPendingVoucher			= false;
var allowDirectPrintPopupAfterExpenseCreation		= false;
var isExpenseChargeValidation= false;
var ExpenseVoucherConfig			= null;
var GeneralConfiguration			= null;

var allowExpenseDetailsPhotoUpload	= false;
var noOfFileToUpload				= 0;
var maxSizeOfFileToUpload			= 0;
var photoDataObject					= {};
var branchIdStr =null;
var expenseTypeIdsForVendorPayment 		= "";
var vendorPaymentExpenseTypeIdsArray 	= [];
var firstExpenseTypeCategory 			= null;
var allowVendorExpenses 				= false;
var allowNonVendorExpenses 				= false;

function loadBranchExpends() {
	var jsonObject			= new Object();
	
	showLayer();
	
	$.ajax({
		type		:	"POST",
		url			:	WEB_SERVICE_URL + '/branchIncomeExpenseWS/loadBranchExpense.do',
		data		:	jsonObject,
		dataType	:	'json',
		success		:	function(data) {
			if (!data || jQuery.isEmptyObject(data) || data.message) {
				showMessage('error', data.message.description); // show message to show system processing error massage on top of the window.
				hideLayer();
			} else if(typeof data.isAllowToCreateBranchExpense !== 'undefined' && !data.isAllowToCreateBranchExpense) {
				showMessage('info','To Create New Expense Voucher, Please Transfer Previous Expense Amount To Head Office !');
				hideLayer();
			} else {
				executive						= data.executive;
				PaymentTypeConstant				= data.PaymentTypeConstant;
				paymentTypeArr					= data.paymentTypeArr;
				moduleId						= data.moduleId;
				ModuleIdentifierConstant		= data.ModuleIdentifierConstant;
				incomeExpenseModuleId			= data.incomeExpenseModuleId;
				BranchExpenseConfiguration		= data.BranchExpenseConfiguration;
				BranchExpenseTdsProperty		= data.BranchExpenseTdsProperty;
				isMaximumAmountForExpenseAllowed= BranchExpenseConfiguration.isMaximumAmountForExpenseAllowed;
				maximumAmountForExpense			= BranchExpenseConfiguration.maximumAmountForExpense;
				branchExpenseNewFlowAllow		= BranchExpenseConfiguration.branchExpensePrintNewFlowAllow;
				isExpenseChargeValidation		= BranchExpenseConfiguration.isExpenseChargeValidation;
				debitToBranch					= data.debitToBranch;
				allowDirectPrintPopupAfterExpenseCreation					= data.allowDirectPrintPopupAfterExpenseCreation;
				ExpenseVoucherType					= data.ExpenseVoucherType;
				debitbranchModel				= data.debitbranchModel;
				expenseTypeIdsForDebitToBranch	= data.expenseTypeIdsForDebitToBranch;
				branchExpenseVoucherSettlement	= data.branchExpenseVoucherSettlement;
				GeneralConfiguration			= data.GeneralConfiguration;
				bankPaymentOperationRequired	= GeneralConfiguration.BankPaymentOperationRequired;
				allowExpenseDetailsPhotoUpload	= BranchExpenseConfiguration.allowExpenseDetailsPhotoUpload;
				noOfFileToUpload				= BranchExpenseConfiguration.noOfFileToUpload;
				maxSizeOfFileToUpload			= BranchExpenseConfiguration.maxSizeOfFileToUpload;
				letestBalanceMap				= data.letestBalanceMap;
				branchIdStr						= data.branchIdStr;
				
				if(BranchExpenseConfiguration.allowFundReceiveCheckingForExpenseCreation) {
					var pendingFundReceive = data.pendingFundReceive;
					
					if(pendingFundReceive != undefined && pendingFundReceive.length != 0){
						$("#top-border-boxshadow").hide();
						hideLayer();

						$('#popUpContentOnExpenseLoad').bPopup({
							modalClose: false,
							opacity: 0.6
						},function(){
							var _thisMod			= this;
							$(this).html("<div class='confirm' style='font-size:15px; font-color:white; width: 435px;height: 180px;padding: 20px; border-width:4px;margin-top:250px;'><h1 style='font-size:20px;'>To create new Expense, please Receive the Fund no :- <span style='font-size:20px;color:blue;'>"+pendingFundReceive+"</span></h1>" +
									"<br/><input type='button'class='btn btn-primary' id='cancel' value='CANCEL' style='width:45%'/><input type='button'class='btn btn-danger' id='receiveFund' value='Fund Receive' style='float:right;width:45%'/></div>" )

							$("#confirm").focus();
							$("#cancel").click(function(){
								location.reload(false);
								_thisMod.close();
							})

							$('#receiveFund').click(function() {
								window.location = "ReceiveFundTransfer.do?pageId=240&eventId=3";
							});
						});
						return false;
					}
				}

				
				if(!isExpenseChargeValidation)
					setExpenseTypeSelection();

				if(paymentTypeArr && !jQuery.isEmptyObject(paymentTypeArr)) {
					setPaymentTypeSelection('paymentType');
				} else {
					$("#paymenttypediv").hide();
				}
				
				if(bankPaymentOperationRequired) {
					setIssueBankAutocomplete();
					setAccountNoAutocomplete();
					$('#myModal').remove();
				} else {
					$('#paymentTypeSelection').remove();
				}

				if(!BranchExpenseConfiguration.allowMultipleExpenseType)
					$('#allowMultipleExpense').remove();

				if(!BranchExpenseTdsProperty.IsTdsAllow)
					$('#tdsTable').remove();

				if(!BranchExpenseTdsProperty.IsPANNumberRequired)
					$('#panNumberRow').remove();

				if(!BranchExpenseTdsProperty.IsTANNumberRequired)
					$('#tanNumberRow').remove();

				if(!BranchExpenseTdsProperty.Override_TDS)
					$('#overrideTDS').remove();
				else
					$('#notOerrideTDS').remove();
				
				if(!BranchExpenseConfiguration.IsPaymentMadeToRequired)
					$('#paymentMadeToDiv').remove();
					
				if(BranchExpenseConfiguration.manualExpenseNumber){
					$('#isManualCheck').prop('checked', false);
					$('#manualNumberMainDiv').removeClass('hide');
					$('#isManualCheck').click(function(){
						if($('#isManualCheck').is(':checked'))
							$('#manualNumberDiv').removeClass('hide');
						else
							$('#manualNumberDiv').addClass('hide');
						$('#manualNumber').val('');
					});
				}
				else{
					$('#manualNumberMainDiv').remove();
				}
				
				if(typeof data.previousDate != 'undefined') {
					$( function() {
						$('#expenseDateForAll').val(dateWithDateFormatForCalender(data.currentDate,"-"));
						$('#expenseDateForAll').datepicker({
							maxDate		: data.currentDate,
							minDate		: data.previousDate,
							showAnim	: "fold",
							dateFormat	: 'dd-mm-yy'
						});
					} );
				}

				$( "#expenseDateForAll" ).val(data.currentDate);
				$( "#expenseDateForAll" ).prop("readonly", true);

				if(BranchExpenseTdsProperty.IsTdsAllow) {
					if(typeof data.tdsChargeList == 'undefined') {
						$('.tdsRateCol').remove();
					} else {
						var tdsRateList	= data.tdsChargeList;

						for (var i = 0; i < tdsRateList.length; i++) {
							var tdsObject		= new Object();
							var tdsRate			= tdsRateList[i];
							tdsObject.tdsRate	= tdsRate + '%';
							tdsObject.tdsValue	= tdsRate;
							tdsRateLst.push(tdsObject);
						}

						$("#tdsRate").selectize({
							options			: tdsRateLst,
							valueField		: 'tdsValue',
							labelField		: 'tdsRate',
							searchField		: 'tdsRate',
							create			: false,
							maxItems		: 1,
							onChange: function () {
								var tdsRate		= $('#tdsRate').val();
								$('#tdsAmount').val(Math.round((voucherAmt * tdsRate) / 100));
							}
						});
					}
				}

				if(typeof data.subRegionList != 'undefined') {
					var subRegionList	= data.subRegionList;

					selectizeArea = $("#paymentGivenByArea").selectize({
						options		: subRegionList,
						valueField	: 'subRegionId',
						labelField	: 'subRegionName',
						searchField : 'subRegionName',
						create		: false,
						maxItems	: 1,
						items		: [executive.subRegionId]
					});
				}

				if(!bankPaymentOperationRequired && typeof data.bankAccountList != 'undefined') {
					var bankAccountList	= data.bankAccountList;

					selectizeBank = $("#bankName").selectize({
						options		: bankAccountList,
						valueField	: 'bankAccountId',
						labelField	: 'bankAccountName',
						searchField : 'bankAccountName',
						create		: false,
						maxItems	: 1
					});
				}

				if(typeof data.branchModelList != 'undefined') {
					var branchModelList	= data.branchModelList;

					$("#paymentGivenByBranch").selectize({
						options		: branchModelList,
						valueField	: 'branchId',
						labelField	: 'branchName',
						searchField : 'branchName',
						create		: false,
						maxItems	: 1,
						items		: [executive.executiveId]
					});
				}
				
				if(isExpenseChargeValidation) {
					$("#expenseTypeSelection").selectize({
						options		: data.IncomeExpenseChargeList,
						valueField	: 'incomeExpenseChargeMasterId',
						labelField	: 'chargeName',
						searchField : 'chargeName',
						create		: false,
						maxItems	: 1,
						onChange: function () {
							$('#modalExpenseTypeId').val($('#expenseTypeSelection').val());
							var expenseMasterId = $('#modalExpenseTypeId').val();
							checkExpenseEntry(expenseMasterId, null);
						}
					});
				}								
		
				$("#viewAllHeadsBtn").click(function(){
					childwin = window.open ('viewDetails.do?pageId=340&eventId=2&modulename=incomeExpenseHeadDetails&incExpType=4&chargeType=3','newwindow', config='height=500,width=650, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
				});

				$("#addExpenseBtn").click(function(){
					document.getElementById('appendExpenseBtn').style.display='block';
					var modal = document.getElementById('addExpenseModal');
					var span = document.getElementById("expenseSpan");
					
					span.onclick = function() {
						modal.style.display = "none";
					}
					
					modal.style.display = "block";
					setTimeout(function(){$('#expenseTypeSelection').focus(); }, 1000);

					if(branchExpenseVoucherSettlement){
						$('#paymentMadeToDiv').hide();
						$('#paymenttypediv').hide();
						$('#saveBranchExpense').hide();
						$('#payLaterSelectionDiv').removeClass('hide');
					} 
					
					if(allowExpenseDetailsPhotoUpload) {
						$('#photoUploadDiv').show();
						podUploadBranchExpense();
						
						if(!validateFileTypeAndSizeForMultiPhoto(noOfFileToUpload, maxSizeOfFileToUpload, false))
							return;
					} else {
						$('#photoUploadDiv').hide();
					}
						
				});
				
				$("#appendExpenseCancelBtn").click(function(){
					var modal = document.getElementById('addExpenseModal');
					$("#expenseTypeSelection").val("")
					$("#modalExpenseTypeId").val("")
					$("#modalAmount").val("")
					$("#modalRemark").val("")
					if (branchExpenseCount === 0) {
						resetExpenseBatch();
					}
					modal.style.display = "none";
				});
				
				$("#appendExpenseBtn").click(function(){
					if (validateExpenseForAppend() == true) {
						var modalAmount = $('#modalAmount').val();
						
						if(isMaximumAmountForExpenseAllowed && $('#paymentType') != undefined &&
								$('#paymentType').val() == PAYMENT_TYPE_CASH_ID) {
							if(Number(modalAmount) > maximumAmountForExpense) {
								showMessage('error', 'Please Enter Expense Amount Less Than '+maximumAmountForExpense);
								return false;
							}
						}
						
						if (BranchExpenseConfiguration.validateOpeningBalanceToCreateBranchExpense) {
							let letestBalance = letestBalanceMap[branchIdStr];
							if (letestBalance < modalAmount) {
								showMessage('error', 'Your  Branch Balance Is ' + letestBalance + ', It Should Be Greater Than Expense Amount ' + modalAmount + '.');
								hideLayer();
								return false;
							}
						}

						$("#addExpenseModal").css("display", "none");
						appendExpenseDetailsInTable();
						setTimeout(function(){ $('#tdsRate').focus(); }, 1000);
						var tdsRate		= $('#tdsRate').val();

						if(tdsRate > 0) {
							tdsAmount	= Math.round((voucherAmt * tdsRate) / 100);
						}

						$("#chequeAmountInfo").html(Math.round(voucherAmt) - Math.round($("#tdsAmount").val()));
						document.getElementById('expenseVoucherTableDiv').style.display='block';
					}
				});

				if(!bankPaymentOperationRequired) {
					$("#chequeSpan").bind("click", function() {
						$('#chequeNumber').val('');
						$('#bankName').val('');
						$('#chequeGivenTo').val('');
						$("#myModal").css("display", "none");
					});
				}

				$("#creditSpan").bind("click", function() {
					$("#creditDateInfo").html($('#chequedatepicker').val());
					$("#creditNumberInfo").html($('#creditSlipNumber').val());
					$("#creditACNameInfo").html($('#creditAccount').val());
					$("#myModalCredit").css("display", "none");
				});

				$("#chequeDetailsCancleBtn").click(function() {
					if (chequePopUpClearFlag) {
						$('#chequeNumber').val('');
						$('#bankName').val('');
						$('#chequeGivenTo').val('');
						var control = selectizeBank[0].selectize;
						control.clear();
					}
					$("#myModal").css("display", "none");
				});
				
				$("#chequeDetailsBtn").click(function(){
					if (ChequeValidation()) {
						$("#chequeDateInfo").html($('#chequedatepicker').val());
						$("#chequeNumberInfo").html($('#chequeNumber').val());
						var obj = selectizeBank[0].selectize;
						var item = obj.getItem($('#bankName').val());
						
						if (item[0] != undefined) {
							$("#bankNameInfo").html($(item[0].childNodes[0]).text());		
						}
						
						$("#chequeGivenToInfo").html($('#chequeGivenTo').val());
						var obj = selectizeArea[0].selectize;
						var item = obj.getItem($('#paymentGivenByArea').val());
					
						if (item[0] != undefined) {
							$("#paymentGivenByAreaInfo").html($(item[0].childNodes[0]).text());		
						}
						
						$("#chequeDetailsTable").css("display", "block");
						setTimeout(function(){ $('#saveExpense').focus(); }, 1000);
						$("#chequeAmountInfo").html(Math.round(voucherAmt) - Math.round($("#tdsAmount").val()));
						chequePopUpClearFlag	= false;
						$("#myModal").css("display", "none");
					}
				});

				$("#expenseCreditDetailsBtn").click(function(){
					if (CreditValidation()) {
						$("#creditDateInfo").html($('#creditdatepicker').val());
						$("#creditNumberInfo").html($('#creditSlipNumber').val());
						$("#creditACNameInfo").html($('#creditAccount').val());
						$("#myModalCredit").css("display", "none");
					}
				});
				
				$("#showChequeDetailsBtn").click(function(){
					$("#myModal").css("display", "block");
				});
				
				$("#showCreditDetailsBtn").click(function(){
					$("#myModalCredit").css("display", "block");
				});
				
				$(function() {
					$( "#chequedatepicker" ).datepicker({minDate: "-2M", maxDate: "+1M",dateFormat: 'dd-mm-yy'}).datepicker("setDate", data.currentDate);
					$( "#creditdatepicker" ).datepicker({minDate: "-2M", maxDate: "+1M",dateFormat: 'dd-mm-yy'}).datepicker("setDate", data.currentDate);
				});

				$("#paymentGivenByArea").bind("change", function() {
					getBranchList();
				});
				
				if(voucherDetailsId > 0){
					$('#datasaved').html('<b style="font-size: 16px;"> Office Expense Saved successfully ! Voucher No :</b> is <b>' + paymentVoucherSequenceNumber + '</b>&emsp;<button type="button" name="reprintBtn" id="reprintBtn" class="btn btn-success" data-tooltip="Reprint">Reprint</button><div class="row">&nbsp;</div>');

					if(voucherType != ExpenseVoucherType.CREDIT) {
						$("#reprintBtn").show();
						$("#reprintBtn").bind("click", function() {
							openPrintForVoucherBill(voucherDetailsId);
						});
					} else {
						$("#reprintBtn").hide();
					}
				}

				hideLayer();
			}
		}
	});
}
function checkExpense(){
	if(Number($('#modalExpenseTypeId').val()) <= 0){
		showMessage('error', 'Please enter expense first.');
		$('#modalAmount').val('');
		$('#expenseTypeSelection').focus();
		return false;
	}
}

function getBranchList() {
	var jsonObject		= new Object();
	
	jsonObject.subRegionSelectEle_primary_key	= $("#paymentGivenByArea").val();
	jsonObject.isDisplayDeActiveBranch			= false;
	jsonObject.displayOnlyPhysicalBranch		= false;
	
	showLayer();
	
	$.ajax({
		type		:	"POST",
		url			:	WEB_SERVICE_URL + '/selectOptionsWS/getSubRegionBranches.do',
		data		:	jsonObject,
		dataType	:	'json',
		success		:	function(data) {
			if (data.message != undefined) {
				hideLayer();
			} else {
				var subRegionBranches		= data.sourceBranch;

				var selectize = $("#paymentGivenByBranch")[0].selectize;
				selectize.clear();
				selectize.clearOptions();
				selectize.addOption(subRegionBranches);
			}
			
			hideLayer();
		}
	});
}

function ChequeValidation() {
	if ($('#chequedatepicker').val() == '' || !isValidDate($('#chequedatepicker').val())) {
		showMessage('error', 'Please Select Proper Date');
		changeError1('chequedatepicker','0','0');
		return false;
	}
	if ($('#chequeNumber').val() == '') {
		showMessage('error', 'Please Enter Proper Cheque Number');
		changeError1('chequeNumber','0','0');
		return false;
	}
	if (document.getElementById("chequeNumber").value.length < 6) {
		showMessage('error', 'Please Enter Six Digit Cheque Number');
		changeError1('chequeNumber','0','0');
		return false;
	}
	if ($("#bankName").val() == '') {
		showMessage('error', 'Please Select Proper Bank');
		changeError1('bankName','0','0');
		return false;
	}
	if ($("#paymentGivenByArea").val() == '') {
		showMessage('error', 'Please Select Proper Area');
		changeError1('paymentGivenByArea','0','0');
		return false;
	}
	if ($("#paymentGivenByBranch").val() == '') {
		showMessage('error', 'Please Select Proper Branch');
		changeError1('paymentGivenByBranch','0','0');
		return false;
	}
	return true
}

function CreditValidation() {
	if ($('#creditdatepicker').val() == '' || !isValidDate($('#creditdatepicker').val())) {
		showMessage('error', 'Please Select Proper Date');
		changeError1('creditdatepicker','0','0');
		return false;
	}
	if ($("#creditSlipNumber").val() == '') {
		showMessage('error', 'Please Enter Proper Credit Slip Number');
		changeError1('creditSlipNumber','0','0');
		return false;
	}
	if ($("#creditAccount").val() == '') {
		showMessage('error', 'Please Enter Proper Credit Account Name');
		changeError1('creditAccount','0','0');
		return false;
	}
	
	return true
}

function validateBranchExpense() {
	if(!bankPaymentOperationRequired) {
		if(($('#paymentType').val() == PAYMENT_TYPE_CHEQUE_ID && !ChequeValidation())
		|| ($('#paymentType').val() == PAYMENT_TYPE_LHPV_ADVANCE_CREDIT_ID && !CreditValidation())) {
			return false;
		}
	}
	
	return true;
}

function saveWayBillExpenses() {
	 if(BranchExpenseConfiguration.showVendorDropdownForPaymentMadeTo) { 
        if (!validateVendorBeforeSave())
            return false;
    }
	flagForPendingVoucher = $('#paymentSelection') != undefined && $('#paymentSelection').val() == 2;
	
	if($('#isManualCheck').is(':checked') && $('#manualNumber').val() == ''){
		showMessage('error','Please Enter Expense Number!');
		$('#manualNumber').focus();
		hideLayer();
		return false;
	}

	if(!flagForPendingVoucher) {
		if((isMaximumAmountForExpenseAllowed && $('#paymentType') != undefined && $('#paymentType').val() == PAYMENT_TYPE_CASH_ID)
		&& voucherAmt > maximumAmountForExpense) {
			showMessage('error','Please Enter Expense Amount Less Than ' + maximumAmountForExpense);
			hideLayer();
			return false;
		}
		
		if (BranchExpenseConfiguration.validateBalanceOnlyForPaymentModeCash) {
			let letestBalance = letestBalanceMap[branchIdStr];
			
			if ($('#paymentType').val() == PAYMENT_TYPE_CASH_ID && letestBalance < voucherAmt) {
				showMessage('error', 'Your  Branch Balance Is ' + letestBalance + ', It Should Be Greater Than Expense Amount ' + voucherAmt + '.');
				hideLayer();
				return false;
			}
		}
		
		if(bankPaymentOperationRequired) {
			var paymentType = $('#paymentType').val();

			if(paymentType == 0) {
				showMessage('error','Please, Select Payment Type for this expense !');
				hideLayer();
				return false;
			}

			if(isValidPaymentMode(paymentType)) { //Defined in paymentTypeSelection.js
				var trCount = $("#storedPaymentDetails	tr").length;
				
				if(trCount == 0) {
					showMessage('error','Please, Add Payment details for this expense !');
					hideLayer();
					return false;
				}	
			}
		} else{
			var paymentType = $('#paymentType').val();

			if(paymentType == 0) {
				showMessage('error','Please, Select Payment Type for this expense !');
				hideLayer();
				return false;
			}
		}
	}

	if(!validateBranchExpense()) {
		return false;
	}
	
	if (BranchExpenseTdsProperty.IsPANNumberMandetory && $('#tdsAmount').val() > 0) {
		if(!validateInputTextFeild(1, 'panNumber', 'panNumber', 'error', 'Please Enter Pan Number !')) {
			return false;
		}
		
		if(!validateInputTextFeild(8, 'panNumber', 'panNumber', 'error', 'Please Enter Proper Pan Number !')) {
			return false;
		}
	}
	
	if (BranchExpenseTdsProperty.IsTANNumberMandetory && $('#tdsAmount').val() > 0) {
		if(!validateInputTextFeild(1, 'tanNumber', 'tanNumber', 'error', 'Please Enter Tan Number !')) {
			return false;
		}
		
		if(!validateInputTextFeild(13, 'tanNumber', 'tanNumber', 'error', 'Please Enter Proper Tan Number !')) {
			return false;
		}
	}
	
	$('#saveExpense').hide();
	$("#saveExpense").attr("disabled", true);
	
	if(confirm('Are you sure you want to save these Branch Expenses ?')) {
		$('#branchExpensesCount').val(branchExpensesCount);
		var expenseDateForAll = $('#expenseDateForAll').val();

		var paymentType				= 1;

		var otherDetails	= new Object();
		
		otherDetails.branchExpenseCount		= branchExpenseCount;

		if($('#paymentType').exists()) {
			paymentType				= $('#paymentType').val();
		}
		
		otherDetails.paymentType	= paymentType;
		otherDetails.tdsRate		= $("#tdsRate").val();
		otherDetails.tdsAmount		= $("#tdsAmount").val();
		otherDetails.PanNumber		= $("#panNumber").val();
		otherDetails.TanNumber		= $("#tanNumber").val();
		otherDetails.isManualNumber	= $('#isManualCheck').is(':checked');
		if(otherDetails.isManualNumber)
			otherDetails.manualExpenseNumber	= $('#manualNumber').val();

		if(bankPaymentOperationRequired) {
			if($('#paymentType').val() == PAYMENT_TYPE_CHEQUE_ID
					|| $('#paymentType').val() == PAYMENT_TYPE_ONLINE_RTGS_ID
					|| $('#paymentType').val() == PAYMENT_TYPE_ONLINE_NEFT_ID) {
				otherDetails.chequeNumber		= $('#chequeNo').val();
				otherDetails.chequeDate			= $('#chequeDate').val();

				if($('#accountNo_primary_key').exists())
					otherDetails.bankAccountId		= $('#accountNo_primary_key').val();
				else
					otherDetails.bankAccountId		= $('#bankName').val();

				otherDetails.chequeGivenTo			= $('#chequeGivenTo').val();
			}

			if($('#paymentType').val() == PAYMENT_TYPE_CREDIT_CARD_ID 
					|| $('#paymentType').val() == PAYMENT_TYPE_DEBIT_CARD_ID) {
				otherDetails.chequeNumber				= $('#cardNo').val();
			}

			if($('#paymentType').val() == PAYMENT_TYPE_IMPS_ID 
					|| $('#paymentType').val() == PAYMENT_TYPE_PAYTM_ID
					|| $('#paymentType').val() == PAYMENT_TYPE_UPI_ID
					|| $('#paymentType').val() == PAYMENT_TYPE_PHONE_PAY_ID
					|| $('#paymentType').val() == PAYMENT_TYPE_GOOGLE_PAY_ID
					|| $('#paymentType').val() == PAYMENT_TYPE_WHATSAPP_PAY_ID) {
				otherDetails.chequeNumber				= $('#referenceNumber').val();
			}

			otherDetails.paymentValues	= $('#paymentCheckBox').val();
		} else {
			if (paymentType == PAYMENT_TYPE_CHEQUE_ID) {
				otherDetails.chequeNumber			= $("#chequeNumber").val();
				otherDetails.chequedatepicker		= $("#chequedatepicker").val();
				otherDetails.bankAccountId			= $('#bankName').val();

				var obj = selectizeBank[0].selectize;
				var item = obj.getItem($('#bankName').val());

				if (item[0] != undefined)
					otherDetails.bankAccountName	= ($(item[0].childNodes[0]).text());

				otherDetails.chequeGivenTo			= $("#chequeGivenTo").val();
				otherDetails.paymentGivenByBranch	= $('#paymentGivenByBranch').val();
			}
			
			if (paymentType == PAYMENT_TYPE_EXPENSE_CREDIT_ID) {
				otherDetails.creditSlipNumber	= $("#creditSlipNumber").val();
				otherDetails.creditdatepicker	= $("#creditdatepicker").val();
				otherDetails.creditAccountId	= 1; // need to change
			}
		}

		otherDetails.tdsOnAmount				= voucherAmt;
		otherDetails.expenseDateForAll			= expenseDateForAll;
		otherDetails.paymentType				= paymentType;
		otherDetails.branchExpenses				= JSON.stringify(getExpenses());
		otherDetails.isCashStmtEntryNotRequired	= branchExpenseVoucherSettlement && flagForPendingVoucher;
		otherDetails.paymentMadeTo				= $('#paymentMadeTo').val();
		otherDetails.vendorMasterId				= $('#paymentMadeTo_primary_key').val();

		showLayer();

		if(!doneTheStuff) {
			doneTheStuff	= true;
			$.ajax({
				type		:	"POST",
				url			:	WEB_SERVICE_URL + '/branchIncomeExpenseWS/insertBranchExpense.do',
				data		:	otherDetails,
				dataType	:	'json',
				success		:	function(data) {
					
					if (data.message != undefined) {
						hideLayer();
						var errorMessage = data.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						
						if(errorMessage.typeName == 'error') {
							$('#saveExpense').show();
							$("#saveExpense").attr("disabled", false);
							doneTheStuff = false; 
							hideLayer();
							return; 
						} else {
							if(allowDirectPrintPopupAfterExpenseCreation
									&& (data.voucherType != data.ExpenseVoucherType.CREDIT)) {
								openPrintForVoucherBill(data.exepenseVoucherDetailsId);
							}
							
							if (data.exepenseVoucherDetailsId != undefined) {
								location.replace("/ivcargo/BranchExpenses.do?pageId=52&eventId=1&voucherDetailsId=" + data.exepenseVoucherDetailsId + '&paymentVoucherSequenceNumber='+data.PaymentVoucherSequenceNumber + '&voucherType='+data.voucherType);
								setTimeout(function(){ 
									location.reload(); 
								}, 1000);
							}
							
							if(allowExpenseDetailsPhotoUpload && data.expenseDetailsHM && Object.keys(data.expenseDetailsHM).length > 0)
								uploadPhotos(data.expenseDetailsHM);
						}
					}
					
					hideLayer();
				}
			});
		}
	} else {
		doneTheStuff	= false;
		
		if(!flagForPendingVoucher) {
			$('#saveExpense').show();
			$("#saveExpense").attr("disabled", false);
		} else {
			flagForPendingVoucher = false;
		}
	}
}

function openPrintForVoucherBill(voucherDetailsId) {
	if(branchExpenseNewFlowAllow){
		newwindow=window.open('BillPrint.do?pageId=25&eventId=43&voucherDetailsId='+voucherDetailsId, 'newwindow', config='height=410,width=700, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	} else {
		newwindow=window.open('BillPrint.do?pageId=25&eventId=16&voucherDetailsId='+voucherDetailsId, 'newwindow', config='height=410,width=700, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	}
}

function setExpenseTypeSelection() {
	var issueBankAuto			= Object();

	issueBankAuto.url			= WEB_SERVICE_URL+'/autoCompleteWS/getActiveIncomeExpenseHeadersList.do?incExpType=2&chargeType=3';
	issueBankAuto.primary_key	= 'incomeExpenseChargeMasterId';
	issueBankAuto.field			= 'chargeName';
	issueBankAuto.callBack		= callBackBank;
	$("#expenseTypeSelection").autocompleteCustom(issueBankAuto);

	function callBackBank(res) {
		$('#modalExpenseTypeId').val($('#expenseTypeSelection_primary_key').val());
		if(isExpenseChargeValidation){
			var expenseMasterId = $('#modalExpenseTypeId').val();
			checkExpenseEntry(expenseMasterId, res);
		}
	}
}

function checkExpenseEntry(expenseMasterId, element) {
	var jsonObject = new Object;
	jsonObject.incomeExpenseChargeMasterId = expenseMasterId;
	
	showLayer();
	
	$.ajax({
		type		:	"POST",
		url			:	WEB_SERVICE_URL + '/expenseVoucherConfigWS/checkExpenseAllowEntry.do',
		data		:	jsonObject,
		dataType	:	'json',
		success		:	function(data) {
			hideLayer();
			
			if(data.chargeAllowed != null) {
				ExpenseVoucherConfig = data.ExpenseVoucherConfig;
				
				if(!data.chargeAllowed) {
					if(element != null) {
						element.target.value = '';
						$('#'+element.target.id).focus();
					}
					
					$('#modalExpenseTypeId').val(0);
					showMessage('info','Expense not allowed. Contact to your Head Office!');
					return;
				}
				
		//		$('#modalAmount').val(ExpenseVoucherConfig.limit);
			} else {
				ExpenseVoucherConfig = null;
			}
		}
	});
}

function checkExpenseLimit(object) {
	if($('#modalExpenseTypeId').val() > 0){
		var limit				= Number(object.value);
		if(ExpenseVoucherConfig != null) {
			if(limit > ExpenseVoucherConfig.limit){
				object.value = ExpenseVoucherConfig.limit;
				showMessage('info','Amount should be less than '+ExpenseVoucherConfig.limit);
				return;
			}
		}
	}
}

function setPaymentTypeSelection(elementId) {
	$('#' + elementId).find('option').remove().end();
	$('#' + elementId).append('<option value="' + 0 + '" id="' + 0 + '">-- Select Mode--</option>');

	if(!jQuery.isEmptyObject(paymentTypeArr)) {
		for(var i = 0; i < paymentTypeArr.length; i++) {
			if(paymentTypeArr[i] != null) {
				$('#' + elementId).append('<option value="' + paymentTypeArr[i].paymentTypeId + '" id="' + paymentTypeArr[i].paymentTypeId + '">' + paymentTypeArr[i].paymentTypeName + '</option>');
			}
		}
	}
}

function validateExpenseForAppend() {
	if (document.getElementById("modalExpenseTypeId").value == "" || document.getElementById("modalExpenseTypeId").value <= 0) {
		showMessage('error', 'Please Select Proper Office Expense !');
		document.getElementById("expenseTypeSelection").focus();
		return false;
	}

	if (document.getElementById("expenseTypeSelection").value == "") {
		showMessage('error', 'Please Select Proper Office Expense !');
		document.getElementById("expenseTypeSelection").focus();
		return false;
	}

    if (!isExpenseTypeAllowedInCurrentBatch(document.getElementById("modalExpenseTypeId").value)) {
        showMessage('error', 'Cannot mix vendor and non-vendor expenses in same batch!');
        document.getElementById("expenseTypeSelection").focus();
        return false;
    }
    
	if (document.getElementById("modalAmount").value == "" || document.getElementById("modalAmount").value <= 0) {
		showMessage('error', 'Please Enter Proper Amount !');
		document.getElementById("modalAmount").focus();
		return false;
	}

	if (document.getElementById("modalRemark").value == "") {
		showMessage('error', 'Please Enter Proper Remark !');
		document.getElementById("modalRemark").focus();
		return false;
	}

	return true;
}

function appendExpenseDetailsInTable() {
	columnArray	= [];
	branchExpenseCount++;
	
	var expenseTypeSelection	= '';
	var expenseTypeId 			= $("#modalExpenseTypeId").val();
	var isVendorType 			= isVendorExpense(expenseTypeId);

	var dataObject	= new Object();
	
	dataObject.wayBillId			= 0;
	dataObject.wayBillNo			= 0;
	
	if(isExpenseChargeValidation) {
		var selectize			= $('#expenseTypeSelection').get(0).selectize;
		var current				= selectize.getValue(); 
		var option				= selectize.options[ current ];
		expenseTypeSelection	= option.chargeName;
	} else
		expenseTypeSelection	= $("#expenseTypeSelection").val();
	
	dataObject.expenseHead			= expenseTypeSelection;
	dataObject.headId				= $("#modalExpenseTypeId").val();
	dataObject.amount				= $("#modalAmount").val();
	dataObject.remark				= $("#modalRemark").val();
	dataObject.branchExpenseCount	= branchExpenseCount;
	dataObject.isVendorExpense 		= isVendorType;
	 
	if (firstExpenseTypeCategory === 'non-vendor' && isVendorType) {
		$('#paymentMadeTo').val('');
		$('#paymentMadeTo_primary_key').val('');
		firstExpenseTypeCategory = 'vendor';
	}
	
	if (firstExpenseTypeCategory === 'vendor') {
		$('#paymentMadeTo').off('focus click input');
		$('#paymentMadeTo').closest('.ac_button').show();
		$('#paymentMadeTo').closest('.ac_result_area').show();
		$('#paymentMadeTo').siblings('.ac_button').show();
		$('#paymentMadeTo').siblings('.ac_result_area').show();

		if (!$('#paymentMadeTo').hasClass('autocomplete-initialized')) {
			setVendorAutocompleteForPaymentMadeTo();
			$('#paymentMadeTo').addClass('autocomplete-initialized');
		}
	} else {
		$('#paymentMadeTo').off('focus click input');
		$('#paymentMadeTo').removeClass('autocomplete-initialized');

		$('#paymentMadeTo').on('focus click input keydown', function(e) {
			e.stopImmediatePropagation();
			$('#paymentMadeTo').closest('.ac_button').hide();
			$('#paymentMadeTo').closest('.ac_result_area').hide();
			$('#paymentMadeTo').siblings('.ac_button').hide();
			$('#paymentMadeTo').siblings('.ac_result_area').hide();
		});

		$('#paymentMadeTo').closest('.ac_button').hide();
		$('#paymentMadeTo').closest('.ac_result_area').hide();
		$('#paymentMadeTo').siblings('.ac_button').hide();
		$('#paymentMadeTo').siblings('.ac_result_area').hide();

		$('#paymentMadeTo').val('');
		$('#paymentMadeTo_primary_key').val('');
	}
	
	if(debitToBranch == 'true' || debitToBranch == true ){
		$('.debitToBranch').css('display','block');
	}
	
	voucherAmt		= Math.round(voucherAmt) + Math.round(dataObject.amount);
	var dataKey		= dataObject.headId + "_" + dataObject.branchExpenseCount;

	if(allowExpenseDetailsPhotoUpload)	
	uploadPhotoDetailsData(dataKey);

	branchExpense[dataKey] = dataObject;
	columnArray.push("<td class='tableFont' style='text-align: center'>" + branchExpenseCount + "</td>");
	columnArray.push("<td class='tableFont hide headId' style='text-align: center'>" + dataObject.headId + "</td>");
	columnArray.push("<td id='head_"+dataObject.headId+"' class='tableFont head' style='text-align: center'>" + dataObject.expenseHead + "</td>");
	columnArray.push("<td id='amount_"+dataObject.headId+"' class='tableFont amount' style='text-align: right'>" + dataObject.amount + "</td>");
	columnArray.push("<td id='remark_"+dataObject.headId+"' class='tableFont remark' style='text-align: center'>" + dataObject.remark + "</td>");
	columnArray.push("<td style='text-align: center'><button type='button' id='remove_"+dataKey+"' class='btn btn-primary' onclick='removeBranchExpense(this)'>Remove</td>");
	
	if(debitToBranch == 'true' || debitToBranch == true ){
		var check = isValueExistInArray(expenseTypeIdsForDebitToBranch,dataObject.headId);
		
		if(check)
			columnArray.push("<td id='debitToBranch_"+dataObject.headId+"' class='tableFont ' style='text-align: center'><select class='debitToBranch' id='debitToBranchSelection_"+dataKey+"' ></select></td>");
		else
			columnArray.push("<td id='debitToBranch_"+dataObject.headId+"' class='tableFont ' style='text-align: center'></td>");
	}
	
	$('#expenseVoucherTable tbody').append("<tr id='row_"+dataKey+"'>'" + columnArray.join(' ') + "'</tr>");
	
	if(debitToBranch == 'true' || debitToBranch == true ){
		var check = isValueExistInArray(expenseTypeIdsForDebitToBranch,dataObject.headId);
		
		if(check)
			setDebitToBranch(dataKey);
	}
	
	document.getElementById('expenseVoucherDiv').style.display='block';
	
	if(!BranchExpenseConfiguration.allowMultipleExpenseType)
		document.getElementById('addExpenseBtn').style.display='none';
	
	$("#expenseTypeSelection").val("");
	$("#modalExpenseTypeId").val("");
	$("#modalAmount").val("");
	$("#modalRemark").val("");
	columnArray	= [];
	$("#totalExpense").html(voucherAmt);
}

function setDebitToBranch(dataKey){
	createOption('debitToBranchSelection_'+dataKey, 0, '---Select Expense---');
	
	if(!jQuery.isEmptyObject(debitbranchModel)) {	
		for(var i = 0; i < debitbranchModel.length; i++) {
			createOption('debitToBranchSelection_'+ dataKey, debitbranchModel[i].branchId, debitbranchModel[i].branchName);
		}
	}
}

function getExpenses() {
	var ary = [];
	
	$('.attrTable tr').each(function (a, b) {
		var head	= $('.head', b).text();
		var headId	= $('.headId', b).text();
		var amount	= $('.amount', b).text();
		var remark	= $('.remark', b).text();
		var debitToBranch	=  $('#debitToBranchSelection_' + headId+'_'+(a+1)).val();
		ary.push({ headId : headId, head : head, amount : amount, remark : remark ,debitToBranch : debitToBranch ,rowIdentifier : a + 1 });
	});
	
	return ary;
}

function removeBranchExpense(object) {
	var id = (object.id).substring((object.id).indexOf("_") + 1);
	$('#row_'+id).remove();
	
	voucherAmt	= Math.round(voucherAmt) - Math.round(branchExpense[id].amount);
	
	delete branchExpense[id];
	branchExpenseCount--;
	
	if (branchExpenseCount == 0) {
		document.getElementById('expenseVoucherDiv').style.display='none';
		document.getElementById('addExpenseBtn').style.display='block';
		resetExpenseBatch();
	}
	
	$("#totalExpense").html(voucherAmt)
	var tdsRate		= $('#tdsRate').val();
	var tdsAmount	= 0;
	
	if(tdsRate > 0) {
		tdsAmount	= Math.round((voucherAmt * tdsRate) / 100);
	}
	
	$('#tdsAmount').val(tdsAmount);
	$("#chequeAmountInfo").html(Math.round(voucherAmt) - Math.round($("#tdsAmount").val()));
	
	Object.keys(photoDataObject).forEach(function(key) {
		if (key.startsWith(id)) {
			delete photoDataObject[key];
		}
	});
}

function recalculateTDS() {
	if ($('#tdsAmount').val() == '') {
		$('#tdsAmount').val('0');
	}
}

function hideShowPaymentOption(obj) {
	
	if(bankPaymentOperationRequired) {
		$( "#storedPaymentDetails" ).empty();
		hideShowBankPaymentTypeOptions(obj);
	} else {
		$("#chequeDateInfo").html('');
		$("#chequeAmountInfo").html('');
		$("#chequeNumberInfo").html('');
		$("#bankNameInfo").html('');
		$("#chequeGivenToInfo").html('');
		$("#paymentGivenByAreaInfo").html('');
		$("#chequeGivenTo").val('');
		$("#chequeNumber").val('');
		$("#bankName").val('');
		var control = selectizeBank[0].selectize;
		control.clear();
		$("#creditDateInfo").html('');
		$("#creditNumberInfo").html('');
		$("#creditACNameInfo").html('');
		$("#creditSlipNumber").val('');
		$("#creditAccount").val('');
		chequePopUpClearFlag	= true;
		
		if (BranchExpenseConfiguration.allowDatePickerForPaymentMode == false) {
			$("#chequeDateRow").css("display", "none");
			$("#expenseCreditDateRow").css("display", "none");
		}
		
		if(obj.value == PAYMENT_TYPE_CHEQUE_ID) {
			$("#myModal").css("display", "block");
			$("#expenseCreditDetailsTable").css("display", "none");
			setTimeout(function(){$('#chequeNumber').focus(); }, 1000);
		} else if (obj.value == PAYMENT_TYPE_EXPENSE_CREDIT_ID) {
			$("#myModalCredit").css("display", "block");
			$("#chequeDetailsTable").css("display", "none");
		} else {
			$("#chequeDetailsTable").css("display", "none");
			$("#expenseCreditDetailsTable").css("display", "none");
		}
	}
}

function paymentHideShow(obj){
	
	if(obj != undefined) {
		if(obj.value == 2)	{
			$('#paymentMadeToDiv').hide();
			$('#paymenttypediv').hide();
			$('#saveBranchExpense').hide();
			$('#payLaterTable').removeClass('hide');
		} else if(obj.value == 1)  {
			
			if($('#paymentType') != undefined){
				$('#paymentType').val(0);
			}
			
			$('#paymentMadeToDiv').show();
			$('#paymenttypediv').show();
			$('#saveBranchExpense').show();
			$('#payLaterTable').addClass('hide');
		} else {
			$('#paymentMadeToDiv').hide();
			$('#paymenttypediv').hide();
			$('#saveBranchExpense').hide();
			$('#payLaterTable').addClass('hide');
		}
	}
}

function podUploadBranchExpense() {
	$("#addPhotoModal").modal({
		backdrop: 'static',
		keyboard: false
	});
	
	$('#photoContainer').empty();

	for(var i = 1; i <= noOfFileToUpload; i++){
		var fileInputId = 'photo_' + i;
		var fileInputHTML	  = '<input type="file" name="photo" id="' + fileInputId + '" class="form-control photo-upload" style="margin-top: 10px;" />';

		$('#photoContainer').append(fileInputHTML);
	}
}

function uploadPhotoDetailsData(id){
	var photosForExpense = [];

	$('.photo-upload').each(function(index, fileInput) {
		if (fileInput.files.length > 0) {
			var file = fileInput.files[0];
			var photoNumber = index + 1;
			var dataKey = id + '_' + photoNumber;
			photosForExpense.push({
				dataKey: dataKey,
				file: file,
			});
		}
	});	

	photosForExpense.forEach(function(photoData) {
		photoDataObject[photoData.dataKey] = photoData.file;
	});

}

function uploadPhotos(expenseDetailsHM) {
	var formData = new FormData();

	for(var dataKey in photoDataObject) {
		if(photoDataObject.hasOwnProperty(dataKey)) {
			formData.append('photos', photoDataObject[dataKey]);
			formData.append('dataKey[]', dataKey);
		}
	}

	formData.append('expenseDetailsHM', JSON.stringify(expenseDetailsHM));
	formData.append("accountGroupId", executive.accountGroupId);
	formData.append("executiveId", executive.executiveId);

	photoDataObject = [];

	$.ajax({
		type: "POST",
		enctype: 'multipart/form-data',
		url: "/ivwebservices/branchIncomeExpenseWS/uploadBranchExpensePhotos.do?",
		data: formData,
		contentType: false,
		processData: false,
		success: function(data) {
			if (response.message != undefined){
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			}
		},
		error: function(e) {
			console.log(e);
			hideLayer();
			showMessage('error', 'Some Error Occurred!');
		}
	})
}

function isVendorExpense(expenseTypeId) {
    if (BranchExpenseConfiguration.showVendorDropdownForPaymentMadeTo) { 
        expenseTypeIdsForVendorPayment 			= BranchExpenseConfiguration.expenseTypeIdsForVendorPayment;
        vendorPaymentExpenseTypeIdsArray 		= expenseTypeIdsForVendorPayment.split(',').map(id => id.trim());
    }
    
    if (!vendorPaymentExpenseTypeIdsArray || vendorPaymentExpenseTypeIdsArray.length === 0) {
        return false;
    }
    return vendorPaymentExpenseTypeIdsArray.includes(expenseTypeId.toString());
}

function isExpenseTypeAllowedInCurrentBatch(expenseTypeId) {
    var isVendorType = isVendorExpense(expenseTypeId);
    
    if (firstExpenseTypeCategory === null) {
        firstExpenseTypeCategory = isVendorType ? 'vendor' : 'non-vendor';
        allowVendorExpenses = isVendorType;
        allowNonVendorExpenses = !isVendorType;
        return true;
    }
    
    if (firstExpenseTypeCategory === 'vendor') {
        return isVendorType;
    } else {
        return !isVendorType;
    }
}

function resetExpenseBatch() {
    firstExpenseTypeCategory = null;
    // Remove all event blockers
    $('#paymentMadeTo').off('focus click input keydown');
    $('#paymentMadeTo').removeClass('autocomplete-initialized');
    
    // Show autocomplete elements
    $('#paymentMadeTo').closest('.ac_button').show();
    $('#paymentMadeTo').closest('.ac_result_area').show();
    $('#paymentMadeTo').siblings('.ac_button').show();
    $('#paymentMadeTo').siblings('.ac_result_area').show();
    
    $('#paymentMadeTo').val('');
    $('#paymentMadeTo_primary_key').val('');
    $('#isManualCheck').prop('checked', false);
    $('#manualNumber').val('');
}

function setVendorAutocompleteForPaymentMadeTo() {
	 // Only initialize if not already initialized
    if ($('#paymentMadeTo').data('autocomplete-initialized')) {
        return;
    }
    
	let vendorAuto 				= Object();
	vendorAuto.url 				= WEB_SERVICE_URL + '/autoCompleteWS/getVendorNamesAutocomplete.do?isActiveOnly=true';
	vendorAuto.primary_key 		= 'vendorMasterId';
	vendorAuto.field 			= 'displayName';
	vendorAuto.searchFields 	= ['name', 'mobileNumber'];
	vendorAuto.callBack 		= callBackVendor;

	$("#paymentMadeTo").autocompleteCustom(vendorAuto);
	
	function callBackVendor() {
		$('#paymentMadeTo_primary_key').val($('#paymentMadeTo_primary_key').val());
	}
}

function validateVendorBeforeSave() {
    let vendorName 				= $('#paymentMadeTo').val();
    let vendorPrimaryKey 		= $('#paymentMadeTo_primary_key').val(); 
    
    if (!$('#paymentMadeToDiv').is(':visible'))
        return true;

    const hasVendorExpenses 	= hasVendorExpensesInBatch();
    
    if (!hasVendorExpenses) {
        $('#paymentMadeTo_primary_key').val('');
        // Also clear any autocomplete suggestions
        $('#paymentMadeTo').siblings('.ac_result_area').hide();
        $('#paymentMadeTo').siblings('.ac_result_area').empty();
        return true;
    }
    
    if (hasVendorExpenses) {
        if (BranchExpenseConfiguration.isVendorMandatoryForPaidTo) {
            if (!vendorName || vendorName.trim() === '') {
                showMessage('error', 'Please select or enter a Vendor!');
                $('#paymentMadeTo').focus();
                return false;
            }
        }

        if (vendorName && vendorName.trim() !== '') {
            if (!vendorPrimaryKey || vendorPrimaryKey === '0' || vendorPrimaryKey === '') {
                showMessage('error', 'Vendor does not exist! Please create a new Vendor.');
                $('#paymentMadeTo').focus();
                return false;
            }
        }
    }
    
    return true;
}

function hasVendorExpensesInBatch() {
    let hasVendorExpenses = false;
    $('.attrTable tr').each(function (a, b) {
        var headId = $('.headId', b).text();
        if (isVendorExpense(headId)) {
            hasVendorExpenses = true;
            return false;
        }
    });
    return hasVendorExpenses;
}