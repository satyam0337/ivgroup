define([], function(){	
	var summeryObject				= new Object();
	pageCounter	= 1
	return {
		getConfiguration : function(flavourName) {
			let htmlPath = '/ivcargo/html/module/fundtranferprint/' + flavourName + '.html';

			if (!urlExists(htmlPath))
				htmlPath = '/ivcargo/html/module/fundtranferprint/fundTransferPrint_default.html';

			return 'text!' + htmlPath;
		}, getFilePathForLabel : function() {
			return '/ivcargo/resources/js/module/view/fundtranfer/fundtranferprint/fundTransferPrintFilePath.js';
		},setDataTableDetails:function(tableData) {
			$("[data-dataTableDetail='fundTransferNumber']").html(tableData[$("[data-dataTableDetail='fundTransferNumber']").attr("data-dataTableDetail")]);
			$("[data-dataTableDetail='amount']").html(tableData[$("[data-dataTableDetail='amount']").attr("data-dataTableDetail")]);
			$("[data-dataTableDetail='remark']").html(tableData[$("[data-dataTableDetail='remark']").attr("data-dataTableDetail")]);
			$("[data-dataTableDetail='dateTimeStampstr']").html(tableData[$("[data-dataTableDetail='dateTimeStampstr']").attr("data-dataTableDetail")]);
			$("[data-dataTableDetail='toBranchName']").html(tableData[$("[data-dataTableDetail='toBranchName']").attr("data-dataTableDetail")]);
			$("[data-dataTableDetail='fromBranchName']").html(tableData[$("[data-dataTableDetail='fromBranchName']").attr("data-dataTableDetail")]);
			$("[data-dataTableDetail='paymentModeStr']").html(tableData[$("[data-dataTableDetail='paymentModeStr']").attr("data-dataTableDetail")]);
			$("[data-dataTableDetail='executiveName']").html(tableData[$("[data-dataTableDetail='executiveName']").attr("data-dataTableDetail")]);
			$("[data-dataTableDetail='accountGroupName']").html(tableData[$("[data-dataTableDetail='accountGroupName']").attr("data-dataTableDetail")]);
			$("[data-dataTableDetail='branchAddress']").html(tableData[$("[data-dataTableDetail='branchAddress']").attr("data-dataTableDetail")]);
			$("[data-dataTableDetail='branchPhoneNumber']").html(tableData[$("[data-dataTableDetail='branchPhoneNumber']").attr("data-dataTableDetail")]);
			$("*[data-dataTableDetail='amountToWord']").html(convertNumberToWord(tableData.amount));
			$("[data-dataTableDetail='bankAccountNumber']").html(tableData[$("[data-dataTableDetail='bankAccountNumber']").attr("data-dataTableDetail")]);
			$("[data-dataTableDetail='issueBankName']").html(tableData[$("[data-dataTableDetail='issueBankName']").attr("data-dataTableDetail")]);
			$("[data-dataTableDetail='chequeNumber']").html(tableData[$("[data-dataTableDetail='chequeNumber']").attr("data-dataTableDetail")]);
			
			setTimeout(function(){window.print();},200);
		}
	}
});