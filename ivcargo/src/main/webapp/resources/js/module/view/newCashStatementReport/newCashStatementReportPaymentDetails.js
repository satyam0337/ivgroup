define([
	PROJECT_IVUIRESOURCES + '/resources/js/module/view/newCashStatementReport/newCashStatementReportPaymentDetailsfilepath.js'
	,'jquerylingua'
	,'language'//import in require.config
	,'slickGridWrapper2'
	,'errorshow'
	,'JsonUtility'
	,'messageUtility'
	,'elementmodel'
	,'elementTemplateJs'
	,'constant'
	], function (FilePath,Lingua,Language,slickGridWrapper2,errorshow,JsonUtility,MessageUtility,ElementModel,Elementtemplateutils,constant) {
	'use strict';// this basically give strictness to this specific js
	var _this = '';
	var jsonObject = new Object(), myNod, corporateAccountId = 0,  _thisRender = '', gridObject, corporateAccountId = 0,crossingTypeComboBoxShow = false, customerAccessId = 0, masterLangObj, masterLangKeySet, caLangObj, caLangKeySet, fromDate = null, toDate = null, regionId = 0, subRegionId = 0, sourceBranchId = 0,wayBillTypeId = 0;

	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData){
			_this 			= this;
			jsonObject		= JSON.parse(localStorage.getItem("jsonObject"));

			localStorage.removeItem("jsonObject");
		},
		render: function(){
			getJSON(jsonObject, WEB_SERVICE_URL+'/newCashStatementReportWS/getNewCashStatementReportPaymentData.do', _this.setElementData, EXECUTE_WITHOUT_ERROR);
		},setElementData : function(response) {

			$("#reportDetailsTable").empty();
			$("#printCashStatementReport").empty();

			if(response.message != undefined){
				hideLayer();
				$('#middle-border-boxshadow').addClass('hide');
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);

				return;
			}

			var loadelement		= new Array();
			var baseHtml		= new $.Deferred();

			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/report/newCashStatementReport/newCashStatementReportPaymentDetails.html",function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				showLayer();

				masterLangObj 				= FilePath.loadLanguage();
				masterLangKeySet 			= loadLanguageWithParams(masterLangObj);

				var cashStatementTxnList	= response.cashStatementTxnList;
				var bankAccNo				= response.bankAccNo;
				var bankName				= response.bankName;
				var branch 					= response.branch;
				var accountGroup 			= response.accountGroup;
				var columnHeadArray			= new Array();
				var columnHeadSubArray		= new Array();
				var columnMainHeadArray		= new Array();
				var	srNo					= 0;
				var grandTotal				= 0;
				
				if(bankName != undefined)
					columnHeadArray.push("<th colspan='6' style='text-align: center; vertical-align: middle;'>Name Of Bank : "+bankName+"</th>");
				else 
					columnHeadArray.push("<th colspan='6' style='text-align: center; vertical-align: middle;'>Name Of Bank : --</th>");
				
				if(bankAccNo != undefined)
					columnHeadSubArray.push("<th colspan='6' style='text-align: center; vertical-align: middle;'>A/C No : "+bankAccNo+"</th>");
				else
					columnHeadSubArray.push("<th colspan='6' style='text-align: center; vertical-align: middle;'>A/C No : --</th>");
				
				columnMainHeadArray.push("<th style='text-align: center; vertical-align: middle;background-color: aliceblue;'>SR. No.</th>");
				columnMainHeadArray.push("<th style='text-align: center; vertical-align: middle;background-color: aliceblue;'>Cheque No.</th>");
				columnMainHeadArray.push("<th style='text-align: center; vertical-align: middle;background-color: aliceblue;'>Date</th>");
				columnMainHeadArray.push("<th style='text-align: center; vertical-align: middle;background-color: aliceblue;'>Party Name</th>");
				columnMainHeadArray.push("<th style='text-align: center; vertical-align: middle;background-color: aliceblue;'>Amount</th>");
				columnMainHeadArray.push("<th style='text-align: center; vertical-align: middle;background-color: aliceblue;'>Branch</th>");
				
				$('#reportDetailsHeadTable').append('<thead><tr id=""  class="text-danger warning  text-center first">' + columnHeadArray.join(' ') + 
						'</tr><tr id=""  class="text-danger active text-center second">' + columnHeadSubArray.join(' ') +'</thead>')
				$('#reportDetailsTable').append('<thead><tr id=""  class="text-danger text-center third">'+ columnMainHeadArray.join(' ') +'</tr> </thead>')

				for(var i = 0; i < cashStatementTxnList.length; i++){
					
					srNo++;
					
					var paymentDataRow		= createRowInTable('', '', '');
					
					var srNoCol				= createColumnInRow(paymentDataRow, '', '', '', 'center', '', '');
					var chequeNoCol			= createColumnInRow(paymentDataRow, '', '', '', '', '', '');
					var dateCol				= createColumnInRow(paymentDataRow, '', '', '', 'center', '', '');
					var partyNameCol		= createColumnInRow(paymentDataRow, '', '', '', '', '', '');
					var amountCol			= createColumnInRow(paymentDataRow, '', '', '', 'right', '', '');
					var branchCol			= createColumnInRow(paymentDataRow, '', '', '', 'center', '', '');
					grandTotal				+= cashStatementTxnList[i].amount;
					
					appendValueInTableCol(srNoCol, srNo);
					appendValueInTableCol(chequeNoCol, cashStatementTxnList[i].chequeNumber);
					appendValueInTableCol(dateCol, cashStatementTxnList[i].txnDateTimeString);
					appendValueInTableCol(partyNameCol, cashStatementTxnList[i].accountName);
					appendValueInTableCol(amountCol, Math.round(cashStatementTxnList[i].amount));
					appendValueInTableCol(branchCol, cashStatementTxnList[i].branchName);
					
					appendRowInTable('reportDetailsTable', paymentDataRow);
				}
				
				var grandTotalRow		= createRowInTable('', '', '');
				
				var grandTotalNameCol	= createColumnInRow(grandTotalRow, '', 'text-danger text-center', '', '', 'font-weight: bold;background-color: aliceblue;', '4');
				var grandTotalCol		= createColumnInRow(grandTotalRow, '', 'text-danger', '', 'right', 'font-weight: bold;background-color: aliceblue;', '');
				var blankCol			= createColumnInRow(grandTotalRow, '', 'text-danger', '', '', 'font-weight: bold;background-color: aliceblue;', '');
				
				appendValueInTableCol(grandTotalNameCol, 'Total');
				appendValueInTableCol(grandTotalCol, Math.round((grandTotal).toFixed(2)));
				appendValueInTableCol(blankCol, '');
				
				appendRowInTable('reportDetailsTable', grandTotalRow);
				
				hideLayer();

				var data = new Object();
				data.accountGroupNameForPrint	= accountGroup.accountGroupDescription;
				data.branchAddress				= branch.branchAddress;
				data.branchPhoneNumber			= branch.branchContactDetailPhoneNumber;
				data.isLaserPrintAllow			= 'true';
				data.isPlainPrintAllow			= 'true';
				data.isExcelButtonDisplay		= 'true';
				data.isPdfButtonDisplay			= 'false';
				printTable(data, 'reportData', 'cashStatementReport', 'Cash Statement Report', 'printCashStatementReport');
			})
		}
	});
});

