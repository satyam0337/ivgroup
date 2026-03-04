function displaySettlementSummaryDetails(ddmSettlementSummaryModel) {
	
	if(!ddmSettlementSummaryModel || jQuery.isEmptyObject(ddmSettlementSummaryModel))
		return;
	
	//Include CommonJsFunction.js to work these functions
	setValueToTextField('totalValueLRs', Math.round(ddmSettlementSummaryModel.totalRecoveryAmount));
	setValueToTextField('netReceived', Math.round(ddmSettlementSummaryModel.totalReceivedAmount));
	setValueToTextField('totalShort', Math.round(ddmSettlementSummaryModel.totalDiscountedAmount));
	setValueToTextField('shortCreditAmt', Math.round(ddmSettlementSummaryModel.totalShortCreditAmount));
	setValueToTextField('billCreditAmt', Math.round(ddmSettlementSummaryModel.totalBillCreditAmount));
	setValueToTextField('netBalance', Math.round(ddmSettlementSummaryModel.totalBalanceAmount));
	setValueToTextField('totalLRs', ddmSettlementSummaryModel.totalLRs);
	setValueToTextField('totalCashLRs', ddmSettlementSummaryModel.totalCashLRs);
	setValueToTextField('totalChequeLRs', ddmSettlementSummaryModel.totalChequeLRs);
	setValueToTextField('totalShortCreditLRs', ddmSettlementSummaryModel.totalShortCreditLRs);
	setValueToTextField('totalBillCreditLRs', ddmSettlementSummaryModel.totalBillCreditLRs);
	setValueToTextField('totalBalanceLRs', ddmSettlementSummaryModel.totalBalanceLRs);
	setValueToTextField('cashAmt', Math.round(ddmSettlementSummaryModel.totalCashAmount));
	setValueToTextField('chequeAmt', Math.round(ddmSettlementSummaryModel.totalChequeAmount));
}

function resetSettlementSummaryTbl () {
	
	setValueToTextField('totalValueLRs', 0);
	setValueToTextField('netReceived', 0);
	setValueToTextField('totalShort', 0);
	setValueToTextField('shortCreditAmt', 0);
	setValueToTextField('billCreditAmt', 0);
	setValueToTextField('netBalance', 0);
	setValueToTextField('totalLRs', 0);
	setValueToTextField('totalCashLRs', 0);
	setValueToTextField('totalChequeLRs', 0);
	setValueToTextField('totalShortCreditLRs', 0);
	setValueToTextField('totalBillCreditLRs', 0);
	setValueToTextField('totalBalanceLRs', 0);
	setValueToTextField('cashAmt', 0);
	setValueToTextField('chequeAmt', 0);
}