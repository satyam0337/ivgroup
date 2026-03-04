var PaymentTypeConstant							= null;
var lrCreditConfig								= null;
var bankPaymentOperationRequired				= false;
var ModuleIdentifierConstant					= null;
var moduleId									= 0;
var incomeExpenseModuleId						= 0;
var executive									= null;
var GeneralConfiguration						= null;


function loadShortCreditCollectionPaymentModule() {
	showLayer();
	var jsonObject		= new Object();

	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/creditCollectionPaymentWS/loadCreditPayment.do',
		data		: jsonObject,
		dataType	: 'json',
		success: function(data) {
			hideLayer();
			lrCreditConfig						= data;
			PaymentTypeConstant					= data.PaymentTypeConstant;
			ModuleIdentifierConstant			= data.ModuleIdentifierConstant;
			moduleId							= data.moduleId;
			incomeExpenseModuleId				= data.incomeExpenseModuleId;
			GeneralConfiguration				= data.GeneralConfiguration;
			bankPaymentOperationRequired		= GeneralConfiguration.BankPaymentOperationRequired;
			
			if (bankPaymentOperationRequired) {
				setIssueBankAutocomplete();
				setAccountNoAutocomplete();
				$("#paymentDetails").removeClass("hide");
	
			}
				
			showHideSelection();		
			hideLayer();
		}
	});
}

function showHideChequeDetails(obj) {
    if(!obj || !obj.name) return;

    var objName = obj.name;
    var mySplitResult = objName.split("_");

    if(mySplitResult.length < 2) return;

    // safe hidden field update
    var hiddenEl = $('#hiddenPaymentMode_' + mySplitResult[1]);
    var payModeEl = $('#paymentMode_' + mySplitResult[1]);

    if(hiddenEl.length > 0 && payModeEl.length > 0) {
        hiddenEl.val(payModeEl.val());
    }

    if(bankPaymentOperationRequired) {

        if($('#billId_' + mySplitResult[1]).length > 0)
            $('#uniqueWayBillId').val($('#billId_' + mySplitResult[1]).val());

        if($('#billNumber_' + mySplitResult[1]).length > 0)
            $('#uniqueWayBillNumber').val($('#billNumber_' + mySplitResult[1]).val());

        if(payModeEl.length > 0) {
            $('#uniquePaymentType').val(payModeEl.val());
            $('#uniquePaymentTypeName').val($("#paymentMode_" + mySplitResult[1] + " option:selected").text());
        }

        hideShowBankPaymentTypeOptions(obj);

    } else {

        var chequeNumberEl = document.getElementById('chequeNumber_' + mySplitResult[1]);
        var chequeDateEl = document.getElementById('chequeDate_' + mySplitResult[1]);
        var chequeDateBtnEl = document.getElementById('fd-but-chequeDate_' + mySplitResult[1]);

        // if elements not found, simply return (no error)
        if(!chequeNumberEl || !chequeDateEl || !chequeDateBtnEl) {
            return;
        }

        if(obj.value == PAYMENT_TYPE_CHEQUE_ID) {
            chequeNumberEl.style.display = 'block';
            chequeDateEl.style.display = 'block';
            chequeDateBtnEl.style.display = 'block';
        } else {
            chequeNumberEl.style.display = 'none';
            chequeDateEl.style.display = 'none';
            chequeDateBtnEl.style.display = 'none';
        }
    }
}


function showHideSelection() {
	var maxDate = new Date();
	var minDate = null;
	if (isShowFromDateToDate) {
		if (oneYearSelectionInDate) {
			minDate = new Date();
			minDate.setFullYear(minDate.getFullYear() - 1);
		} else {
			minDate = new Date();
			minDate.setMonth(minDate.getMonth() - 1);
		}
	}
	
	$(function() {
		$('#fromDate').datepicker({
			maxDate: maxDate,
			minDate: minDate,
			showAnim: "fold",
			dateFormat: 'dd-mm-yy'
		});
	});
	
	$(function() {
		$('#fromDate1').datepicker({
			maxDate: maxDate,
			minDate: minDate,
			showAnim: "fold",
			dateFormat: 'dd-mm-yy'
		});
	});
	
	$(function() {
		$('#toDate1').datepicker({
			maxDate: maxDate,
			minDate: minDate,
			showAnim: "fold",
			dateFormat: 'dd-mm-yy'
		});
	});
}
