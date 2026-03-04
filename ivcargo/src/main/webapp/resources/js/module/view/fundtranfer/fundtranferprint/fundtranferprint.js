define([
	PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js',
	PROJECT_IVUIRESOURCES+'/resources/js/module/view/fundtranfer/fundtranferprint/fundtranferview.js',
	'JsonUtility',
	//jsonutility consist of ajax calls to send json object as an ajax hit to the url specified and get call back as specified
	'messageUtility',
	// to get parameter from url to send it to ws
	'jquerylingua',
	'language'
	],
	function(UrlParameter,fundtranferview) {
	'use strict';// this basically give strictness to this specific js
	var 
	fundTransferId	= "0",
	jsonObject	= new Object(),
	pageBreaker,
	pageCounter,
	_this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(){
			fundTransferId = UrlParameter.getModuleNameFromParam(MASTERID)
			_this = this;
		}, render: function() {
			jsonObject.fundTransferId = fundTransferId;
			getJSON(jsonObject, WEB_SERVICE_URL + '/fundTransferWS/getFundTransferDetailsForPrintByFundTransferId.do?', _this.setFundTranferDetails, EXECUTE_WITHOUT_ERROR);

			return _this;
		}, setFundTranferDetails : function(response) {
			hideLayer();
			
			let fundTransfer	= response.FundTransfer;
			
			var tableData			= _this.getArrayForTableDetails(fundTransfer);
			var headerFooterData	= _this.getHeaderAndFooterObject(fundTransfer);
			
			let flavourName	= response.fundTranferPrintFlavor;
			
			if(flavourName == 'fundTransferPrint_538') {
				for (var j = 0; j < fundTransfer.length; j++) {
					var dataObj	= fundTransfer[j];
								
					if(dataObj.transferType != 5) {
						flavourName	= 'fundTransferPrint_default';
						break;
					}
				}
			}

			require([fundtranferview.getConfiguration(flavourName),
				fundtranferview.getFilePathForLabel()], function(View, FilePath) {
				pageBreaker		= 36;

				pageCounter		= Math.round(tableData.length/pageBreaker);

				var lastItrObj	= new Object();
				lastItrObj.lastITR	= false;
				if (pageCounter <= 0){
					var pageNumber = 0;
					lastItrObj.lastITR	= true;
					_this.$el.html(_.template(View));
					
					tableData.push(lastItrObj);
					fundtranferview.setDataTableDetails(headerFooterData);

					pageNumber++;
				}
				loadLanguageWithParams(FilePath.loadLanguage(flavourName));
			});
		},getArrayForTableDetails : function(FundTransfer) {
			var dataArray	= new Array();
			var fromBranchId		= 1;
			
			for (var j=0; j<FundTransfer.length; j++) {
				var dataObj	= FundTransfer[j];
				var dataObject	= new Object();
				dataObject.fromBranchId					= dataObj.fromBranchId;
				dataObject.toBranchId					= dataObj.toBranchId;
				dataObject.fundTransferNumber			= dataObj.fundTransferNumber;
				dataObject.amount						= dataObj.amount;
				dataObject.remark						= dataObj.remark;
				dataObject.chequeDate					= dataObj.chequeDate;
				dataObject.dateTimeStampstr				= dataObj.dateTimeStampstr;
				dataObject.chequeNumber					= dataObj.chequeNumber;
				dataObject.toBranchName					= dataObj.toBranchName;
				dataObject.fromBranchName				= dataObj.fromBranchName;
				dataObject.paymentModeStr				= dataObj.paymentModeStr;
				dataObject.executiveName				= dataObj.executiveName;
				dataObject.accountGroupName				= dataObj.accountGroupName;
				dataObject.branchAddress				= dataObj.branchAddress;
				dataObject.branchPhoneNumber			= dataObj.branchPhoneNumber;
				dataObject.issueBankName				= dataObj.issueBankName;
              
                dataArray.push(dataObject)
			}
			
			return dataArray;
		}, getHeaderAndFooterObject : function(FundTransfer) {
			
			var headerObject					= new Object();

			headerObject.fundTransferNumber		= FundTransfer[0].fundTransferNumber;
			headerObject.amount					= FundTransfer[0].amount;
			headerObject.amountToWord			= FundTransfer[0].amountToWord;
			headerObject.remark					= FundTransfer[0].remark;
			headerObject.dateTimeStampstr		= FundTransfer[0].dateTimeStampstr;
			headerObject.chequeNumber			= FundTransfer[0].chequeNumber;
			headerObject.fromBranchName			= FundTransfer[0].fromBranchName;
			headerObject.paymentModeStr			= FundTransfer[0].paymentModeStr;
			headerObject.executiveName			= FundTransfer[0].executiveName;
			headerObject.accountGroupName		= FundTransfer[0].accountGroupName;
			headerObject.branchAddress			= FundTransfer[0].branchAddress;
			headerObject.bankAccountNumber		= FundTransfer[0].bankAccountNumber;
			headerObject.issueBankName			= FundTransfer[0].issueBankName;

			if(FundTransfer[0].toBranchName != undefined) {
				headerObject.toBranchName	= FundTransfer[0].toBranchName;
			} else {
				headerObject.toBranchName	= '--'
			}
			
			if(FundTransfer[0].toBranchName != undefined) {
				headerObject.branchPhoneNumber	= FundTransfer[0].branchPhoneNumber;
			} else {
				headerObject.branchPhoneNumber	= '--'
			}
			
			return headerObject;
			
		}
	});
});