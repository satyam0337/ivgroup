define([], function() {	
	return {
		getConfiguration : function(configuration) {
			return '/ivcargo/html/print/crossingBillReceiptPrint/' + configuration.printFlavor + '.html';
		}, getFilePathForLabel : function() {
			return '/ivcargo/resources/js/module/view/print/crossingBillReceiptPrint/crossingBillReceiptPrintFilePath.js';
		}, getCrossingBillData : function(crossingBillData) {
			$("[data-info='billAmount']").html(Math.abs(crossingBillData.billAmount));
			$("[data-info='billNumber']").html(crossingBillData[$("[data-info='billNumber']").attr("data-info")]);
			$("[data-info='branchName']").html(crossingBillData[$("[data-info='branchName']").attr("data-info")]);
			$("[data-info='crossingAgentName']").html(crossingBillData[$("[data-info='crossingAgentName']").attr("data-info")]);
			$("[data-info='balanacedAmount']").html(crossingBillData[$("[data-info='balanacedAmount']").attr("data-info")]);
			$("[data-info='paymentMode']").html(crossingBillData[$("[data-info='paymentMode']").attr("data-info")]);
			$("[data-info='receiptDateStr']").html(crossingBillData[$("[data-info='receiptDateStr']").attr("data-info")]);
			$("[data-info='receiptNumber']").html(crossingBillData[$("[data-info='receiptNumber']").attr("data-info")]);
			$("[data-info='receivedAmount']").html(Math.abs(crossingBillData.receivedAmount));
			$("[data-info='chequeNumber']").html(crossingBillData[$("[data-info='chequeNumber']").attr("data-info")]);
			$("[data-info='paymentReceivedBy']").html(crossingBillData[$("[data-info='paymentReceivedBy']").attr("data-info")]);
			$("[data-info='totalReceivedAmount']").html(crossingBillData[$("[data-info='totalReceivedAmount']").attr("data-info")]);
			$("[data-info='totalBalanacedAmount']").html(crossingBillData[$("[data-info='totalBalanacedAmount']").attr("data-info")]);
			$("[data-info='receivedAmountInWord']").html(convertNumberToWord(Math.abs(crossingBillData.receivedAmount)));
			$("[data-info='billCreationDateStr']").html(crossingBillData[$("[data-info='billCreationDateStr']").attr("data-info")]);
			
			let billAmount	= crossingBillData.billAmount;

			if(billAmount < 0) {
				$('.payment').html('CROSSING PAYMENT');
				$('.PaymentDate').html('Payment Date:-');
				$('.PaymentMadeBy').html('Payment Made By :');
			} else if (billAmount > 0) {
				$('.receipt').html('CROSSING RECEIPT');
				$('.ReceiptDate').html(' Receipt Date:-');
				$('.PaymentReceivedBy').html('Payment Received By :');
			}
		}, getCrossingBillHeaderData : function(PrintHeaderModel, customGroupLogoAllowed) {
			$("[data-info='AccountGroupName']").html(PrintHeaderModel[$("[data-info='AccountGroupName']").attr("data-info")]);
			$("[data-info='CrossingBillReceiptBranchMobileNumber']").html(PrintHeaderModel[$("[data-info='CrossingBillReceiptBranchMobileNumber']").attr("data-info")]);
			$("[data-info='ImagePath']").html(PrintHeaderModel[$("[data-info='ImagePath']").attr("data-info")]);
			$("[data-info='DispatchByBranchId']").html(PrintHeaderModel[$("[data-info='DispatchByBranchId']").attr("data-info")]);
		
			if(customGroupLogoAllowed && PrintHeaderModel.ImagePath != undefined && PrintHeaderModel.ImagePath != null && PrintHeaderModel.ImagePath != 'null') {
				$(".header").css('height','145px');
				$("#imgSrc").attr('src', PrintHeaderModel.ImagePath);
				$("#imgSrc").css('width','100%');
				$("#imgSrc").css('height','145px');
			}
		}
	}
});