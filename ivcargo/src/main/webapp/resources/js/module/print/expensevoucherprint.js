/**
 *   Manish Kumar Singh Date: 13/07/2016
 */

var jsondata				= null;
var executive				= null;
var	lhpvModel				= null;
var voucherDetails			= null;
var wayBillExpenses			= null;
var dispatchLedgerArr		= null;
var reportViewModel			= null;
var LoggedInBranchDetails	= null;

function getExpenseDataToPrint(voucherDetailsId) {
var jsonObject		= new Object();
	
	jsonObject.VoucherDetailsId			= voucherDetailsId;
	jsonObject.filter					= 2;
	

	var jsonStr = JSON.stringify(jsonObject);
	//alert(jsonStr);
	$.getJSON("ExpenseVoucherAjaxAction.do?pageId=25&eventId=44",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription); // show message to show system processing error massage on top of the window.
				} else{
					console.log(data);
					jsondata				= data;
					 executive				= jsondata.executive;
					 lhpvModel				= jsondata.lhpvModel;
					 voucherDetails			= jsondata.voucherDetails;
					 wayBillExpenses		= jsondata.wayBillExpenses;
					 dispatchLedgerArr		= jsondata.dispatchLedgerArr;
					 reportViewModel		= jsondata.reportViewModel;
					 LoggedInBranchDetails	= jsondata.LoggedInBranchDetails;
					 
					 printExpenseVoucherWindow(executive.accountGroupId);
					
				}
			});
}

function setCommonData() {
	$('.VoucherNo').append(voucherDetails.paymentVoucherNumber);
	$('.IssueBranch').append(voucherDetails.branch);
	$('.ExpenseName').append(wayBillExpenses[0].expenseName);
	$('.Amount').append(wayBillExpenses[0].amount);
	$('.Remark').append(wayBillExpenses[0].remark);
	$('.subRegion').append(voucherDetails.subRegion);
	$('.executive').append(voucherDetails.executive);
	
	var	date = getDateInDMYFromTimestamp(voucherDetails.creationDateTime);
	$('.Date').append(date);
}

function printExpenseVoucherWindow(accountGroupId) {
	$("#tableContain").load('/ivcargo/html/print/expensevoucher/'+accountGroupId+'_expenseVoucher.html', function() {
		window.setTimeout(printAfterDelay, 500);	
		setCommonData();
	});
}

function printAfterDelay() {
	window.print();
	window.close();
}

 
