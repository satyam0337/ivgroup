var GeneralConfiguration			= null;
var BankPaymentOperationRequired	= false;
let paymentTypeConstantsList,paymentStatusConstants, moduleId = 0, expenseTypeArr,ModuleIdentifierConstant = null,pendingDispatchIdList;

define([
        'marionette'
        ,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'//PopulateAutocomplete
        ,PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
        ,'errorshow'
        ,'JsonUtility'
        ,'messageUtility'
        ,'nodvalidation'
        ,'validation'
        ,'autocompleteWrapper'
        ,'focusnavigation'
        ,'/ivcargo/resources/js/backbone/backbone.bootstrap-modal.js'
        ], function(Marionette, Selection, UrlParameter) {
		let myNod,
		doneTheStuff = false,
		_this;
		return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
		}, render : function() {
			getJSON(null, WEB_SERVICE_URL + '/pendingLSForPaymentWS/getPendingLSPaymentElementData.do?',_this.loadViewForReport, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, loadViewForReport : function(response) {
			hideLayer();

			if(response.message != undefined)
				return;

			GeneralConfiguration			= response.GeneralConfiguration;
			BankPaymentOperationRequired	= GeneralConfiguration.BankPaymentOperationRequired;
			moduleId						= response.moduleId;
			ModuleIdentifierConstant		= response.ModuleIdentifierConstant;
			PaymentTypeConstant				= response.PaymentTypeConstant;
						
			let loadelement 	= new Array();
			let baseHtml 		= new $.Deferred();
			let paymentHtml		= new $.Deferred();
			
			loadelement.push(baseHtml);
			
			if(BankPaymentOperationRequired)
				loadelement.push(paymentHtml);
		
			$("#mainContent").load("/ivcargo/html/module/pendingLSForPayment/pendingLSForPayment.html",function() {
				baseHtml.resolve();
			});
			
			if(BankPaymentOperationRequired) {
				$("#bankPaymentOperationPanel").load("/ivcargo/html/module/paymentTypeSelection/paymentTypeSelection.html", function() {
						paymentHtml.resolve();
				});
			}
			
			paymentTypeConstantsList		= response.paymentTypeArr;
			paymentStatusConstants			= response.paymentStatusConstants;
			expenseTypeArr					= response.expenseTypeArr;

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				let elementConfiguration = new Object();

				elementConfiguration.dateElement		= "#dateEle";
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement 	= $('#subRegionEle');
				elementConfiguration.branchElement 		= $('#branchEle');

				response.elementConfiguration = elementConfiguration;
				response.isCalenderSelection	= true;
				response.sourceAreaSelection 	= true;
				response.AllOptionsForRegion 	= false;
				response.AllOptionsForSubRegion	= false;
				response.AllOptionsForBranch	= false;

				Selection.setSelectionToGetData(response);
				
				if(!jQuery.isEmptyObject(paymentTypeConstantsList)) {
					$("#paymentType").append($("<option>").attr('value', 0).text('---Select Mode---'));
					let paymentTypeArr = paymentTypeConstantsList;

					for (const element of paymentTypeArr) {
						$("#paymentType").append($("<option>").attr('value', element.paymentTypeId).text(element.paymentTypeName));
					}
				}

				if (!jQuery.isEmptyObject(response.paymentStatusConstants)) {
					$("#paymentStatus").append($("<option>").attr('value', 0).text('---Select Type---'));
					let paymentStatusArr = response.paymentStatusConstants;

					for (const element of paymentStatusArr) {
						$("#paymentStatus").append($("<option>").attr('value', element.paymentStatusId).text(element.paymentStatusName));
					}
				}

				if(BankPaymentOperationRequired) {
					$("#viewPaymentDetails").click(function() {
						openAddedPaymentTypeModel();
					});
					
					document.getElementById('addedPayment').onclick = function() {
						if (modal1) {
							modal1.hide();
						}
					};
					
					setIssueBankAutocomplete();
					setAccountNoAutocomplete();
				}
				
				if(!BankPaymentOperationRequired)
					$('#viewPaymentDetails').hide();
					
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				if($('#regionEle').exists() && $('#regionEle').is(":visible")) {
					myNod.add({
						selector: '#regionEle',
						validate: 'validateAutocomplete:#regionEle_primary_key',
						errorMessage: 'Select proper Region !'
					});
				}
				
				if($('#subRegionEle').exists() && $('#subRegionEle').is(":visible")) {
					myNod.add({
						selector: '#subRegionEle',
						validate: 'validateAutocomplete:#subRegionEle_primary_key',
						errorMessage: 'Select proper Area !'
					});
				}
				
				if($('#branchEle').exists() && $('#branchEle').is(":visible")) {
					myNod.add({
						selector: '#branchEle',
						validate: 'validateAutocomplete:#branchEle_primary_key',
						errorMessage: 'Select proper Branch !'
					});
				}
				
				$("#findBtn").click(function() {
					myNod.performCheck();
					
					if (myNod.areAll('valid'))
						_this.onSubmit();
				});
				
				$(".saveBtn").click(function() {
					_this.createBill(_this);
				});
				
				$(document).ready(function() {
					$("#summaryTableContainer").empty();
					$('#bottom-border-boxshadow').addClass('hide');
				});
			});
		}, onSubmit : function() {
			showLayer();
			let jsonObject	= Selection.getElementData();

			getJSON(jsonObject, WEB_SERVICE_URL+'/pendingLSForPaymentWS/getPendingLSDetailsForPayment.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData : function (response) {
			if (response.message != undefined) {
				hideLayer();
				$('#middle-border-boxshadow').addClass('hide');
				return;
			}
			
			hideLayer();
			
			$('#middle-border-boxshadow').removeClass('hide');
						
			$('#storedPaymentDetails').empty();
			$('#paymentType').val(0);
			$('#paymentStatus').val(0);
			
			setPendingPaymentDataForClearPayment(response);
			
			hideLayer();
			},createBill: function() {
				let dispatchLedgerIdArrList = [];

				$('.srNoCheckbox:checked').each(function() {
					let dispatchLedgerId = $(this).val();
					dispatchLedgerIdArrList.push(dispatchLedgerId);
				});

				if (!_this.validateBeforeBillCreation(dispatchLedgerIdArrList))
					return;

				$("#UpSaveButton").addClass('hide');
				$("#DownSaveButton").addClass('hide');

				ans = confirm("Are you sure you want to do LS Payment?");
				
				if (!ans) {
					$("#UpSaveButton").removeClass('hide');
					$("#DownSaveButton").removeClass('hide');
					hideLayer();
				}

				if (ans) {
					let billData = null;

					let totalBillArr = new Array();

					for (const element of dispatchLedgerIdArrList) {
						let receiveAmt = $('#receiveAmt_' + element).val();

						if (receiveAmt > 0) {
							billData = new Object();

							let dispatchLedgerId = element;

							billData.dispatchLedgerId = dispatchLedgerId;
							billData.chequeDate = $('#chequeDate_' + dispatchLedgerId).val();
							billData.chequeNumber = $('#chequeNumber_' + dispatchLedgerId).val();
							billData.bankName = $('#bankName_' + dispatchLedgerId).val();
							billData.lsNumber = $('#lsNumber_' + dispatchLedgerId).val();
							billData.totalAmount = $('#totalBillAmount_' + dispatchLedgerId).val();
							billData.paymentMode = $('#paymentMode_' + dispatchLedgerId).val();
							billData.paymentStatus = $('#paymentStatus_' + dispatchLedgerId).val();
							billData.totalReceivedAmount = receiveAmt;
							billData.expenseAmount = $('#expenseAmt_' + dispatchLedgerId).val();
							billData.balanceAmount = $('#totalBalanceAmt_' + dispatchLedgerId).val();
							billData.remark = $('#remark_' + dispatchLedgerId).val();
							billData.pendingLSForPaymentId = $('#pendingLSForPaymentId_' + dispatchLedgerId).val();
							billData.expenses = expenseMap[dispatchLedgerId] || [];

							totalBillArr.push(billData);

							delete expenseMap[dispatchLedgerId];
							$(`#existingExpenseTable_${dispatchLedgerId} tbody`).empty();
							$(`#expenseTotal_${dispatchLedgerId}`).text("0.00");
						}
					}

					let jsonObjectData = new Object();

					jsonObjectData.BillDataArr = JSON.stringify(totalBillArr);
					jsonObjectData.dispatchLedgerIds = dispatchLedgerIdArrList.join(',');
					jsonObjectData.paymentType = $('#paymentType').val();

					let rowCount = $('#storedPaymentDetails tr').length;

					if (!$('#storedPaymentDetails').is(':empty') && rowCount > 0) {
						let paymentCheckBoxArr = getAllCheckBoxSelectValue('paymentCheckBox');
						jsonObjectData.paymentValues = paymentCheckBoxArr.join(',');
					}

					getJSON(jsonObjectData, WEB_SERVICE_URL + '/pendingLSForPaymentWS/receivePendingLSPaymentAmount.do', _this.getResponseData, EXECUTE_WITH_ERROR);
					showLayer();
				}

			}, getResponseData: function(response) {
				if (response.message !== undefined) {
					let msg = response.message;
					
					$('#middle-border-boxshadow').addClass('hide');
					$("#UpSaveButton").removeClass('hide');
					$("#DownSaveButton").removeClass('hide');

					if (msg.type === MESSAGE_TYPE_SUCCESS && Array.isArray(response.lsBillSummaryList)) {
						let summaryList = response.lsBillSummaryList;

						let html = '<table class="table table-bordered"><thead><tr>'
							+ '<th>Bill No</th>'
							+ '<th>LS No</th>'
							+ '<th>Bill Amount</th>'
							+ '<th>Expense Amount</th>'
							+ '<th>Received Amount</th>'
							+ '</tr></thead><tbody>';

						summaryList.forEach(item => {
							html += `<tr>
								<td>${item.pendingLSPaymentBillNumber}</td>
								<td>${item.lsNumber}</td>
								<td>${item.billAmount}</td>
								<td>${item.expenseAmount}</td>
								<td>${item.receivedAmount}</td>
							</tr>`;
						});

						html += '</tbody></table>'

						$("#summaryTableContainer").html(html);
						$('#bottom-border-boxshadow').removeClass('hide');
					}
				}

				doneTheStuff = true;
				hideLayer();
			}, validateBeforeBillCreation: function(dispatchLedgerIdArrList) {
				if (!dispatchLedgerIdArrList || dispatchLedgerIdArrList.length === 0) {
					showMessage('error', 'Please select at least one record to proceed.');
					return false;
				}

				let paymentModeForAll = $('#paymentType').val();
				let isReceivedAmountExist = false;

				for (const element of dispatchLedgerIdArrList) {
					let dispatchLedgerId 	= element;
					let receiveAmount 		= $('#receiveAmt_' + dispatchLedgerId).val();
					let currentPaymentMode  = $('#paymentMode_' + dispatchLedgerId).val();
					let paymentStatus 		= $('#paymentStatus_' + dispatchLedgerId).val();
					let totalBalanceAmt 	= $('#totalBalanceAmt_' + dispatchLedgerId).val();

					if(!validatePaymentMode(1, 'paymentMode_' + dispatchLedgerId))
						return false;

					if(!validatePaymentType(1, 'paymentStatus_' + dispatchLedgerId))
						return false;

					if(BankPaymentOperationRequired && isValidPaymentMode(currentPaymentMode) && receiveAmount > 0) {
						if ((currentPaymentMode != paymentModeForAll && !$('#paymentDataTr_' + dispatchLedgerId).exists()) || (currentPaymentMode == paymentModeForAll && !$('#paymentDataTr_0').exists() && !$('#paymentDataTr_' + dispatchLedgerId).exists())) {
							showMessage('info', iconForInfoMsg + 'Please, Add Payment details for this LS Payment ' + openFontTag + $('#lsNumber_' + dispatchLedgerId).val() + closeFontTag + ' !');
							return false;
						}
					}

					if(!isReceivedAmountExist && receiveAmount > 0)
						isReceivedAmountExist = true
						
					if(paymentStatus == PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID && totalBalanceAmt > 0) {
						showMessage('info', iconForInfoMsg + ' Select Proper Payment Status !');
						changeTextFieldColor('paymentStatus_' + dispatchLedgerId, '', '', 'red');
						return false;
					} else if ((paymentStatus == PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_ID || paymentStatus == PAYMENT_TYPE_STATUS_NEGOTIATED_ID) && totalBalanceAmt <= 0) {
						showMessage('info', iconForInfoMsg + ' Select Proper Payment Status !');
						changeTextFieldColor('paymentStatus_' + dispatchLedgerId, '', '', 'red');
						return false;
					} else
						changeTextFieldColorWithoutFocus('paymentStatus_' + dispatchLedgerId, '', '', 'green');		
				}

				if(!isReceivedAmountExist) {
					showMessage('error', billAmountForReceiveErrMsg);
					return false;
				}

				return true;
			}
	});
});

function setPendingPaymentDataForClearPayment(response) {
	const pendingLSList 	= response.pendingLSForPayment || [];
	pendingDispatchIdList	= response.pendingDispatchIdList;
			
	$('#middle-border-boxshadow').removeClass('hide');
	removeTableRows('billDetails', 'table');
	removeTableRows('grandTotalRow', 'table');
	removeTableRows('reportTable2', 'tbody');
	$('#selectAllSrNo').prop('checked', false);
	$("#summaryTableContainer").empty();
	$('#bottom-border-boxshadow').addClass('hide');
	
	let totalAmountSum = 0;
	let receivedAmountSum = 0;

	pendingLSList.forEach((pendingLS, i) => {
		const srNo = i + 1;
		const dispatchLedgerId = pendingLS.dispatchLedgerId;

		const tableRow = createRowInTable('tr_' + dispatchLedgerId, '', '');

		const checkbox = $("<input/>", {
			type: 'checkbox',
			class: 'form-check-input srNoCheckbox',
			id: 'srNoCheckbox_' + dispatchLedgerId,
			value: dispatchLedgerId,
			checked: false
		});
		

		const columns = {
			srNoCol:           createColumnInRow(tableRow, '', '', '', '', '', ''),
			dateTimeCol:       createColumnInRow(tableRow, '', '', '', '', '', ''),
			lsNumberCol:       createColumnInRow(tableRow, '', '', '', '', '', ''),
			lsSrcCol:          createColumnInRow(tableRow, '', '', '', '', '', ''),
			lsDestCol:         createColumnInRow(tableRow, '', '', '', '', '', ''),
			totalAmountCol:    createColumnInRow(tableRow, '', '', '', '', '', ''),
			receivedCol:       createColumnInRow(tableRow, '', '', '', '', '', ''),
			paymentModeCol:    createColumnInRow(tableRow, '', '', '', '', '', ''),
			paymentStatusCol:  createColumnInRow(tableRow, '', '', '', '', '', ''),
			receiveAmountCol:  createColumnInRow(tableRow, '', '', '', '', '', ''),
			hiddenCol:         createColumnInRow(tableRow, '', 'hide', '', '', '', ''),
			paymentBalanceCol: createColumnInRow(tableRow, '', '', '', '', '', ''),
			expenseButtonCol:  createColumnInRow(tableRow, '', '', '', '', '', ''),
			expenseAmountCol:  createColumnInRow(tableRow, '', '', '', '', '', ''),
			totalBalanceCol:   createColumnInRow(tableRow, '', '', '', '', '', ''),
			remarkCol:         createColumnInRow(tableRow, '', '', '', '', '', '')
		};
		
		totalAmountSum 		+= pendingLS.totalAmount || 0;
		receivedAmountSum 	+= pendingLS.receivedAmount || 0;

		appendValueInTableCol(columns.srNoCol, checkbox);
		appendValueInTableCol(columns.srNoCol, ' ' + srNo);
		appendValueInTableCol(columns.dateTimeCol, pendingLS.creationDateTimeString);
		appendValueInTableCol(columns.lsNumberCol, pendingLS.lsNumber);
		appendValueInTableCol(columns.lsSrcCol, pendingLS.lsSrcBranchName);
		appendValueInTableCol(columns.lsDestCol, pendingLS.lsDestBranchName);
		appendValueInTableCol(columns.totalAmountCol, pendingLS.totalAmount.toFixed(2));
		appendValueInTableCol(columns.receivedCol, pendingLS.receivedAmount.toFixed(2));
		appendValueInTableCol(columns.paymentModeCol, createPaymentModeSelection(paymentTypeConstantsList, dispatchLedgerId));
		appendValueInTableCol(columns.paymentStatusCol, createPaymentStatusSelection(paymentStatusConstants, dispatchLedgerId));
		appendValueInTableCol(columns.receiveAmountCol, createReceiveAmountFeild(dispatchLedgerId));
		
		const hiddenFields = [
			{ name: 'billId', value: dispatchLedgerId },
			{ name: 'lsNumber', value: pendingLS.lsNumber },
			{ name: 'totalBillAmount', value: pendingLS.totalAmount },
			{ name: 'pendingLSForPaymentId', value: pendingLS.pendingLSForPaymentId }
		];

		hiddenFields.forEach(field => {
			const input = createInputField(field.name, dispatchLedgerId, 'form-control text-right', field.value, '', true);
			appendValueInTableCol(columns.hiddenCol, input);
		});

		const balanceAmtField = createInputField('balanceAmt', dispatchLedgerId, 'form-control text-right', pendingLS.balanceAmount.toFixed(2), 'Balance', true);
		balanceAmtField.attr("data-original-balance", pendingLS.balanceAmount.toFixed(2));
		appendValueInTableCol(columns.paymentBalanceCol, balanceAmtField);


		const expenseBtn = $("<button/>", {
			type: 'button',
			class: 'btn btn-primary btn-sm',
			text: 'Add Expenses',
			click: function() {
				const lsNumber = $(columns.lsNumberCol).text();
				openExpensePopup(dispatchLedgerId, lsNumber);
			}
		});
		
		appendValueInTableCol(columns.expenseButtonCol, expenseBtn);
		appendValueInTableCol(columns.expenseAmountCol, createExpenseAmountFeild(dispatchLedgerId));
		appendValueInTableCol(columns.totalBalanceCol, createInputField('totalBalanceAmt', dispatchLedgerId, 'form-control text-right', 0, 'Total Balance', true));
		appendValueInTableCol(columns.remarkCol, createInputField('remark', dispatchLedgerId, 'form-control', '', 'Remark', false));

		appendRowInTable('billDetails', tableRow);
		calculateTotalBalance(dispatchLedgerId);
	});

	const grandTotalRow = $("<tr/>", {style: "background-color: navy; color: white; font-weight: bold; text-align: left;"});

	grandTotalRow.append($("<th colspan='5'>").text(""));
	grandTotalRow.append($("<th>").text(totalAmountSum.toFixed(2)));
	grandTotalRow.append($("<th>").text(receivedAmountSum.toFixed(2)));
	grandTotalRow.append($("<th colspan='8'>").text(""));

	$("#grandTotalRow").append(grandTotalRow);
	
	$('#selectAllSrNo').off('change').on('change', function () {
		const isChecked = this.checked;
		$('.srNoCheckbox').prop('checked', isChecked);
	});

	$(document).off('change', '.srNoCheckbox').on('change', '.srNoCheckbox', function () {
		const allChecked = $('.srNoCheckbox').length === $('.srNoCheckbox:checked').length;
		$('#selectAllSrNo').prop('checked', allChecked);
	});
}

function onPaymentTypeSelect() {
	let paymentType		= $('#paymentType').val();
	
	$('.paymentMode').val(paymentType);
	
	if(paymentType > 0) {
		$('#uniqueWayBillId').val(0);
		$('#uniqueWayBillNumber').val('0');
		$('#uniquePaymentType').val(0);
		$('#uniquePaymentTypeName').val('');
	}
	
	$('#storedPaymentDetails').empty();
	
	if(BankPaymentOperationRequired)
		hideShowBankPaymentTypeOptions(document.getElementById("paymentType"));
}

function createInputField(fieldName, fieldIdSuffix, fieldClass, fieldValue, fieldPlaceholder,isReadonly) {
	return $("<input/>", {
		type: 'text',
		id: fieldName + '_' + fieldIdSuffix,
		class: fieldClass,
		name: fieldName + '_' + fieldIdSuffix,
		readonly	: isReadonly,
		value: fieldValue,
		placeholder: fieldPlaceholder
	});
}

function createExpenseAmountFeild(dispatchLedgerId) {
	let expenseAmountFeild		= $("<input/>", { 
		type		: 'text', 
		id			: 'expenseAmt_' + dispatchLedgerId, 
		class		: 'form-control text-right', 
		name		: 'expenseAmt_' + dispatchLedgerId, 
		value 		: 0,
		placeholder	: 'Expense Amount',
		readonly	: true,
		onfocus		: 'resetTextFeild(this, 0);',
		onblur 		: "resetTextFeild(this, 0);clearIfNotNumeric(this, 0);",
		onkeypress 	: "return noNumbers(event ,this);calculateTotalBalance("+ dispatchLedgerId +");",
		onchange	: "calculateTotalBalance("+ dispatchLedgerId +");",
		onkeyup 	: "calculateTotalBalance("+ dispatchLedgerId +");"})
	

	return expenseAmountFeild;
}

function onPaymentStatusSelect() {
	let paymentStatus		= $('#paymentStatus').val();

	for(const element of pendingDispatchIdList) {
		$('.paymentStatus').val(paymentStatus);

		if(paymentStatus == BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID) {
			$('#receiveAmt_' + element).val(Number($('#balanceAmt_' + element).val()) + Number($('#receiveAmt_' + element).val()));
			$('#balanceAmt_' + element).val(0);
		} else if($('#receiveAmt_' + element).val() > 0) {
			$('#balanceAmt_' + element).val(Number($('#balanceAmt_' + element).val()) + Number($('#receiveAmt_' + element).val()));
			$('#receiveAmt_' + element).val(0);
		}
		
		calculateTotalBalance(element);
	}
}


function createPaymentModeSelection(paymentTypeConstantsList, dispatchLedgerId) {
	let paymentModeSel = $('<select id="paymentMode_'+ dispatchLedgerId +'" name="paymentMode_'+ dispatchLedgerId +'" class="form-control col-xs-2 paymentMode" onchange="hideShowChequeDetails('+ dispatchLedgerId +', this);"/>');
	paymentModeSel.append($("<option>").attr('value', 0).text('---Select Mode---'));

	$(paymentTypeConstantsList).each(function() {
		paymentModeSel.append($("<option>").attr('value', this.paymentTypeId).text(this.paymentTypeName));
	});
	
	return paymentModeSel;
}

function createPaymentStatusSelection(PaymentStatusConstants, dispatchLedgerId) {
	let paymentStatusSel = $('<select id="paymentStatus_'+ dispatchLedgerId +'" name="paymentStatus_'+ dispatchLedgerId +'" class="form-control col-xs-2 paymentStatus" onchange="setReceiveAmountOnPaymentStatus(this);"/>');
	paymentStatusSel.append($("<option>").attr('value', 0).text('---Select Type---'));

	$(PaymentStatusConstants).each(function() {
		paymentStatusSel.append($("<option>").attr('value', this.paymentStatusId).text(this.paymentStatusName));
	});
	
	return paymentStatusSel;
}

function calculateTotalBalance(dispatchLedgerId) {
	let expenseAmt = Number($('#expenseAmt_' + dispatchLedgerId).val()) || 0;
	let receiveAmt = Number($('#receiveAmt_' + dispatchLedgerId).val()) || 0;

	let originalBalance = Number($('#balanceAmt_' + dispatchLedgerId).attr('data-original-balance')) || 0;

	if (receiveAmt > originalBalance) {
		showAlertMessage('error', "Receive Amount cannot be greater than Balance Amount.");
		$('#receiveAmt_' + dispatchLedgerId).val(0);
		receiveAmt = 0;
	}

	let totalPaymentBalanceAmt = originalBalance - receiveAmt;

	if (expenseAmt > totalPaymentBalanceAmt) {
		showAlertMessage('error', 'Expense Amount cannot be greater than Remaining Balance after Payment.');
		$('#expenseAmt_' + dispatchLedgerId).val(0);
		expenseAmt = 0;
	}

	let totalBalanceAmt = totalPaymentBalanceAmt - expenseAmt;

	$('#balanceAmt_' + dispatchLedgerId).val(totalPaymentBalanceAmt);
	$('#totalBalanceAmt_' + dispatchLedgerId).val(totalBalanceAmt);
}

function createReceiveAmountFeild(dispatchLedgerId) {
	let receivedAmountFeild		= $("<input/>", { 
		type		: 'text', 
		id			: 'receiveAmt_' + dispatchLedgerId, 
		class		: 'form-control text-right', 
		name		: 'receiveAmt_' + dispatchLedgerId, 
		value 		: 0,
		placeholder	: 'Receive Amount',
		onfocus		: 'resetTextFeild(this, 0);',
		onblur 		: "resetTextFeild(this, 0);clearIfNotNumeric(this, 0);",
		onkeypress 	: "return noNumbers(event ,this);calculateTotalBalance("+ dispatchLedgerId +");",
		onchange	: "calculateTotalBalance("+ dispatchLedgerId +");",
		onkeyup 	: "calculateTotalBalance("+ dispatchLedgerId +");"});

	return receivedAmountFeild;
}

function openExpensePopup(dispatchLedgerId, lsNumber) {
	$('#expensePopupModal').remove();

	const existingExpenses = expenseMap[dispatchLedgerId] || [];

	let existingRowsHtml = '';
	let existingTotal = 0;
	existingExpenses.forEach((item, index) => {
		const expenseType = expenseTypeArr.find(e => e.incomeExpenseChargeMasterId == item.id);
		const chargeName = expenseType ? expenseType.chargeName : 'Unknown';
		existingRowsHtml += `
			<tr data-index="${index}">
				<td>${chargeName}</td>
				<td>₹ ${item.amount.toFixed(2)}</td>
				<td><button class="btn btn-danger btn-sm" onclick="removeExistingExpense(${dispatchLedgerId}, ${index})">Remove</button></td>
			</tr>`;
		existingTotal += item.amount;
	});

	const popupHtml = `
		<div id="expensePopupModal" class="modal" tabindex="-1" role="dialog" style="display:block;">
		  <div class="modal-dialog" role="document">
			<div class="modal-content">
			  <div class="modal-header">
				<h5 class="modal-title">Add Expenses for LS NO.: ${lsNumber}</h5>
				<button type="button" class="close" onclick="$('#expensePopupModal').remove();">&times;</button>
			  </div>
			  <div class="modal-body">
				<table class="table table-bordered" id="expenseTable_${dispatchLedgerId}">
				  <thead>
					<tr>
					  <th>Expense Name</th>
					  <th>Amount</th>
					  <th>Action</th>
					</tr>
				  </thead>
				  <tbody></tbody>
				</table>
				<button type="button" class="btn btn-success btn-sm" onclick="addExpenseRow('${dispatchLedgerId}')">Add Expense</button>

				<hr>
				<h6>Previously Added Expenses</h6>
				<table class="table table-sm table-bordered" id="existingExpenseTable_${dispatchLedgerId}">
				  <thead>
					<tr>
					  <th>Expense Name</th>
					  <th>Amount</th>
					  <th>Action</th>
					</tr>
				  </thead>
				  <tbody>
					${existingRowsHtml}
				  </tbody>
				</table>

				<b>Total: ₹<span id="expenseTotal_${dispatchLedgerId}">${existingTotal.toFixed(2)}</span></b>
			  </div>
			  <div class="modal-footer">
				<button type="button" class="btn btn-primary" onclick="saveExpenses('${dispatchLedgerId}')">Save</button>
				<button type="button" class="btn btn-secondary" onclick="$('#expensePopupModal').remove();">Close</button>
			  </div>
			</div>
		  </div>
		</div>`;

	$('body').append(popupHtml);
}

function removeExistingExpense(dispatchLedgerId, index) {
	if (expenseMap[dispatchLedgerId]) {
		expenseMap[dispatchLedgerId].splice(index, 1);
		openExpensePopup(dispatchLedgerId, $(`#lsNumber_${dispatchLedgerId}`).text());
	}
}

function addExpenseRow(dispatchLedgerId) {
	const tableBody = $(`#expenseTable_${dispatchLedgerId} tbody`);
	const row = $("<tr></tr>");

	const select = $("<select></select>")
		.addClass("form-control expense-name-select")
		.append($("<option>").attr("value", "").text("-- Select --"));

	expenseTypeArr.forEach(function(item) {
		select.append(
			$("<option>").attr("value", item.incomeExpenseChargeMasterId).text(item.chargeName)
		);
	});

	const expenseNameTd = $("<td></td>").append(select);
	const amountTd = $("<td></td>").append(
		$("<input>").attr("type", "number").addClass("form-control expense-amount").val(0)
	);
	const actionTd = $("<td></td>").append(
		$("<button>")
			.addClass("btn btn-danger btn-sm")
			.text("Remove")
			.click(function () {
				row.remove();
				recalculateExpenseTotal(dispatchLedgerId);
			})
	);

	row.append(expenseNameTd, amountTd, actionTd);
	tableBody.append(row);

	select.change(() => recalculateExpenseTotal(dispatchLedgerId));
	amountTd.find("input").on("input", () => recalculateExpenseTotal(dispatchLedgerId));
}

function recalculateExpenseTotal(dispatchLedgerId) {
	let total = 0;
	
	$(`#expenseTable_${dispatchLedgerId} .expense-amount`).each(function () {
		const val = parseFloat($(this).val());
		if (!isNaN(val)) total += val;
	});

	const max = parseFloat($(`#totalBalanceAmt_${dispatchLedgerId}`).val());
	
	if (total > max) {
		showAlertMessage('error', 'Total expense cannot exceed Total Balance.');
		return;
	}

	$(`#expenseTotal_${dispatchLedgerId}`).text(total.toFixed(2));
}

const expenseMap = {};
function saveExpenses(dispatchLedgerId) {
	const newExpenses = [];
	let newTotal = 0;

	$(`#expenseTable_${dispatchLedgerId} tbody tr`).each(function () {
		const id = $(this).find('.expense-name-select').val();
		const amt = parseFloat($(this).find('.expense-amount').val());

		if (id && !isNaN(amt)) {
			newExpenses.push({ id, amount: amt });
			newTotal += amt;
		}
	});

	const existingExpenses = expenseMap[dispatchLedgerId] || [];
	let existingTotal = existingExpenses.reduce((acc, exp) => acc + exp.amount, 0);
	let combinedTotal = newTotal + existingTotal;

	const max = parseFloat($(`#balanceAmt_${dispatchLedgerId}`).val());
	
	if (combinedTotal > max) {
		showMessage('error', 'Total expense exceeds balance amount.');
		return;
	}

	expenseMap[dispatchLedgerId] = existingExpenses.concat(newExpenses);

	$(`#expenseAmt_${dispatchLedgerId}`).val(combinedTotal.toFixed(2));

	$('#expensePopupModal').remove();
	
	calculateTotalBalance(dispatchLedgerId);
}

function hideShowChequeDetails(dispatchLedgerId, obj) {
	if(BankPaymentOperationRequired) {
		$('#uniqueWayBillId').val($('#billId_' + dispatchLedgerId).val());
		$('#uniqueWayBillNumber').val($('#lsNumber_' + dispatchLedgerId).val());
		$('#uniquePaymentType').val($('#paymentMode_' + dispatchLedgerId).val());
		$('#uniquePaymentTypeName').val($("#paymentMode_" + dispatchLedgerId + " option:selected").text());

		hideShowBankPaymentTypeOptions(obj);
	} else if(obj.value != PAYMENT_TYPE_CASH_ID && obj.value != 0) {
		switchHtmlTagClass('chequeNumber_' + dispatchLedgerId, 'hide', 'show');
		switchHtmlTagClass('bankName_' + dispatchLedgerId, 'hide', 'show');
		switchHtmlTagClass('chequeDate_' + dispatchLedgerId, 'hide', 'show');
	} else { 
		switchHtmlTagClass('chequeNumber_' + dispatchLedgerId, 'show', 'hide');
		switchHtmlTagClass('bankName_' + dispatchLedgerId, 'show', 'hide');
		switchHtmlTagClass('chequeDate_' + dispatchLedgerId, 'show', 'hide');
	}
}

function setReceiveAmountOnPaymentStatus(obj) {
	let objName = obj.name;
	let mySplitResult = objName.split("_");
	let dispatchLedgerId = mySplitResult[1];

	if ($('#paymentStatus_' + dispatchLedgerId).val() == BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID) {
		$('#receiveAmt_' + dispatchLedgerId).val(Number($('#balanceAmt_' + dispatchLedgerId).val()) + Number($('#receiveAmt_' + dispatchLedgerId).val()));
		$('#balanceAmt_' + dispatchLedgerId).val(0);
	} else if ($('#receiveAmt_' + dispatchLedgerId).val() > 0) {
		$('#balanceAmt_' + dispatchLedgerId).val(Number($('#balanceAmt_' + dispatchLedgerId).val()) + Number($('#receiveAmt_' + dispatchLedgerId).val()));
		$('#receiveAmt_' + dispatchLedgerId).val(0);
	}

	calculateTotalBalance(dispatchLedgerId);
}
