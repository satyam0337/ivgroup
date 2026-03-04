var cashStatementTxnCreditList 	= null;
var cashStatementTxnDebitList 	= null;
var cashStatementTxn			= null;
var totalCredit					= 0.0;
var totalDebit					= 0.0;
define([
	PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js'
	,'JsonUtility'
    ,'messageUtility'
    ,'nodvalidation'
	,'focusnavigation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	],function(Selection) {
	'use strict';
	var jsonObject = new Object(), myNod, _this;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/cashStatementReportWS/getCashStatementReportElement.do?',	_this.setCashStatementReportsElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		},setCashStatementReportsElements : function(response){
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			
			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/module/cashstatement/cashStatementReport.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function(){
				initialiseFocus();
				
				var keyObject = Object.keys(response);
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]]) {
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
					}
				}
				
				var elementConfiguration	= new Object();
				
				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
				
				response.elementConfiguration	= elementConfiguration;
				response.sourceAreaSelection	= true;
				response.isCalenderSelection	= true;
				response.isPhysicalBranchesShow	= true;
				response.AllOptionsForRegion	= false;
				response.AllOptionsForSubRegion	= false;
				response.AllOptionsForBranch	= false;
				
				Selection.setSelectionToGetData(response);
				
				myNod = Selection.setNodElementForValidation(response);
				
				hideLayer();
				
				$("#saveBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid')) {
						_this.onSubmit(_this);								
					}
				});
				
			})
		},onSubmit : function(){
			showLayer();
			let jsonObject = Selection.getElementData();

			getJSON(jsonObject, WEB_SERVICE_URL+'/cashStatementReportWS/getCashStatementReportData.do', _this.setReportData, EXECUTE_WITH_ERROR);
		} ,setReportData : function(response){
			$("#cashStatementDetailsDiv").empty();
			
			if(response.message != undefined) {
				hideLayer();
				$('#middle-border-boxshadow').addClass('hide');
				$('#bottom-border-boxshadow').addClass('hide');
				
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}
			$('#printCashStatementReport').empty();
			
			cashStatementTxnCreditList 	= response.cashStatementTxnCreditList;
			cashStatementTxnDebitList	= response.cashStatementTxnDebitList;
			cashStatementTxn			= response.cashStatementTxn;
			totalCredit					= response.totalCredit;
			totalDebit					= response.totalDebit;
			
			$("#selectedBranch").html("Branch : ");
			$("#selectedFromDate").html("From Date : ");
			$("#selectedToDate").html("To Date : ");
			$("#SelectedBranchValue").html(cashStatementTxn.branchName);
			$("#selectedFromDateValue").html(cashStatementTxn.fromDateString);
			$("#selectedToDateValue").html(cashStatementTxn.toDateString);
			
			_this.createHeader();
			_this.setCreditDataResult(cashStatementTxnCreditList);
			_this.setDebitDataResult(cashStatementTxnDebitList);
			
			$("#totalCredit").html('Total : '+totalCredit+'&nbsp;&#x20B9;&nbsp;');
			$("#totalDebit").html('Total : '+totalDebit+'&nbsp;&#x20B9;&nbsp;');
			
			if(totalCredit > totalDebit){
				$("#captionHeader1").html("Total Credit : ");
				$("#captionHeaderAmount1").html(totalCredit+'&nbsp;&#x20B9;&nbsp;');
				$("#captionHeader2").html("Total Debit : ");
				$("#captionHeaderAmount2").html(totalDebit+'&nbsp;&#x20B9;&nbsp;');
				$("#finalCaptionHeader").html("Net Credit Outstanding : ");
				$("#finalCaptionHeaderAmount").html((totalCredit-totalDebit)+'&nbsp;&#x20B9;&nbsp;');
			} else if(totalDebit > totalCredit){
				$("#captionHeader1").html("Total Debit : ");
				$("#captionHeaderAmount1").html(totalDebit+'&nbsp;&#x20B9;&nbsp;');
				$("#captionHeader2").html("Total Credit : ");
				$("#captionHeaderAmount2").html(totalCredit+'&nbsp;&#x20B9;&nbsp;');
				$("#finalCaptionHeader").html("Net Debit Outstanding : ");
				$("#finalCaptionHeaderAmount").html((totalDebit-totalCredit)+'&nbsp;&#x20B9;&nbsp;');
			} else{
				$("#captionHeader1").html("Total Debit : ");
				$("#captionHeaderAmount1").html(totalDebit+'&nbsp;&#x20B9;&nbsp;');
				$("#captionHeader2").html("Total Credit : ");
				$("#captionHeaderAmount2").html(totalCredit+'&nbsp;&#x20B9;&nbsp;');
				$("#finalCaptionHeader").html("Net Outstanding : ");
				$("#finalCaptionHeaderAmount").html((0)+'&nbsp;&#x20B9;&nbsp;');
			}
			
			$('#middle-border-boxshadow').removeClass('hide');
			$('#bottom-border-boxshadow').removeClass('hide');
			
			let data = new Object();
			data.accountGroupNameForPrint	= cashStatementTxn.accountGroupName;
			data.branchAddress	= cashStatementTxn.branchAddress;
			data.branchPhoneNumber	= cashStatementTxn.branchPhoneNumber;
			data.isLaserPrintAllow	= 'true';
			data.isPlainPrintAllow	= 'true';
			data.isExcelButtonDisplay	= 'false';
			
			printTable(data, 'reportData', 'cashStatementReport', 'Cash Statement Report', 'printCashStatementReport');
			hideLayer();
			
		},createHeader : function(){
			$('#headingCredittr').empty();
			
			var createRow				= createRowInTable('', 'success', '');
			
			var creditAmtCol			= createColumnInRow(createRow, '', '', '', 'center', '', '');
			var creditNarrationCol		= createColumnInRow(createRow, '', '', '', 'center', '', '');
			
			appendValueInTableCol(creditAmtCol, '<b>Amount (&nbsp;&#x20B9;&nbsp;)</b>');
			appendValueInTableCol(creditNarrationCol, '<b>Description</b>');
			
			appendRowInTable('headingCredittr', createRow);
			
			$('#headingDebittr').empty();
			
			var createRow							= createRowInTable('', 'danger', '');

			var debitAmtCol					= createColumnInRow(createRow, '', '', '', 'center', '', '');
			var debitNarrationCol			= createColumnInRow(createRow, '', '', '', 'center', '', '');
			
			appendValueInTableCol(debitAmtCol, '<b>Amount (&nbsp;&#x20B9;&nbsp;)</b>');
			appendValueInTableCol(debitNarrationCol, '<b>Description</b>');
			
			appendRowInTable('headingDebittr', createRow);
		},setCreditDataResult : function(cashStatementTxnCreditList){
			removeTableRows('cashStatementCreditDetailsDiv', 'tbody');

			for(var i = 0; i < cashStatementTxnCreditList.length; i++){
				var createRow							= createRowInTable('', '', '');
				
				var creditAmt				= cashStatementTxnCreditList[i].creditAmount+'&nbsp;&#x20B9;&nbsp;';
				var creditNarration			= cashStatementTxnCreditList[i].accountName;
				
				if(i % 2 == 0) {
					var creditAmtCol				= createColumnInRow(createRow, '', '', '', 'right', '', '');
					var creditNarrationCol			= createColumnInRow(createRow, '', '', '', '', '', '');
				}else{
					var creditAmtCol				= createColumnInRow(createRow, '', '', '', 'right', 'background-color: #dff0d8;', '');
					var creditNarrationCol			= createColumnInRow(createRow, '', '', '', '', 'background-color: #dff0d8;', '');
				}
				
				appendValueInTableCol(creditAmtCol, creditAmt);
				appendValueInTableCol(creditNarrationCol, creditNarration);
				appendRowInTable('cashStatementCreditDetailsDiv', createRow);
			}
		},setDebitDataResult : function(cashStatementTxnDebitList){
			removeTableRows('cashStatementDebitDetailsDiv', 'tbody');

			for(var i = 0; i < cashStatementTxnDebitList.length; i++){
				var createRow							= createRowInTable('', '', '');
				
				var debitAmt				= cashStatementTxnDebitList[i].debitAmount+'&nbsp;&#x20B9;&nbsp;';
				var debitNarration			= cashStatementTxnDebitList[i].accountName;
				
				if(i % 2 == 0) {
					var debitAmtCol				= createColumnInRow(createRow, '', '', '', 'right', '', '');
					var debitNarrationCol		= createColumnInRow(createRow, '', '', '', '', '', '');
				} else{
					var debitAmtCol				= createColumnInRow(createRow, '', '', '', 'right', 'background-color: #f2dede;', '');
					var debitNarrationCol		= createColumnInRow(createRow, '', '', '', '', 'background-color: #f2dede;', '');
				}
				
				appendValueInTableCol(debitAmtCol, debitAmt);
				appendValueInTableCol(debitNarrationCol, debitNarration);
				appendRowInTable('cashStatementDebitDetailsDiv', createRow);
			}
		}
	})
})
