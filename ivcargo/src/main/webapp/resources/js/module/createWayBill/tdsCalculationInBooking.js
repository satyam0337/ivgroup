/**
 * @Author Anant Chuadhary	05-10-2018
 */

function getTDSOnAmount() {
	var paymentType				= $('#paymentType').val();
	var tdsOnAmount				= 0;
	
	if(paymentType == PaymentTypeConstant.PAYMENT_TYPE_CASH_ID 
			|| paymentType == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID
			|| paymentType == PaymentTypeConstant.PAYMENT_TYPE_ONLINE_RTGS_ID
			|| paymentType == PaymentTypeConstant.PAYMENT_TYPE_ONLINE_NEFT_ID
			|| paymentType == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_CARD_ID
			|| paymentType == PaymentTypeConstant.PAYMENT_TYPE_DEBIT_CARD_ID
			|| paymentType == PaymentTypeConstant.PAYMENT_TYPE_PAYTM_ID
			|| paymentType == PaymentTypeConstant.PAYMENT_TYPE_UPI_ID
			|| paymentType == PaymentTypeConstant.PAYMENT_TYPE_PHONE_PAY_ID
			|| paymentType == PaymentTypeConstant.PAYMENT_TYPE_GOOGLE_PAY_ID
			|| paymentType == PaymentTypeConstant.PAYMENT_TYPE_WHATSAPP_PAY_ID
			|| paymentType == PaymentTypeConstant.PAYMENT_TYPE_AMAZON_PAY_ID
			|| paymentType == PaymentTypeConstant.PAYMENT_TYPE_IMPS_ID) {
		tdsOnAmount	= $("#grandTotal").val();
	}
	
	return tdsOnAmount;
}

function calTDSAmount(id) {
	if(id == 'tdsAmount') {
		// no need to store tdsOnAmount bcoz onload its always goes in else part & tdsOnAmount will store that time
		var tdsAmount			= parseInt($('#tdsAmount').val());  
	} else {
		var isTDSAllowInPercent		= tdsConfiguration.IsTDSInPercentAllow;
		
		$('#tdsOnAmount').val(getTDSOnAmount());
		
		var tdsAmount			= 0;

		if(isTDSAllowInPercent) {
			if($('#tdsPercent').val() > -1)
				tdsAmount	= (getTDSOnAmount() * $('#tdsPercent').val()) / 100;
			else
				tdsAmount	= $('#tdsAmount').val();
		} else
			tdsAmount		= $('#tdsAmount').val();
		
		$('#tdsAmount').val(Math.round(tdsAmount));
	}
}