
define([
	 PROJECT_IVUIRESOURCES + '/resources/js/module/view/newCashStatementReport/newCashStatementReportbankAccDetailsfilepath.js'
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
	var _this = '', btModal;
	var jsonObject = new Object(), myNod, corporateAccountId = 0,  _thisRender = '', gridObject, corporateAccountId = 0,crossingTypeComboBoxShow = false, customerAccessId = 0, masterLangObj, masterLangKeySet, caLangObj, caLangKeySet, fromDate = null, toDate = null, regionId = 0, subRegionId = 0, sourceBranchId = 0,wayBillTypeId = 0;

	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData){
			_this 			= this;
			jsonObject		= jsonObjectData;
			btModal			= jsonObjectData.btModal;
		},
		render: function(){
			getJSON(jsonObject, WEB_SERVICE_URL+'/newCashStatementReportWS/getNewCashStatementReportbankAccDetails.do', _this.setElementData, EXECUTE_WITHOUT_ERROR);
		},setElementData : function(response) {

			$("#bankAccountDetailsDiv").empty();

			if(response.message != undefined){
				hideLayer();
				$('#bottom-border-boxshadow').addClass('hide');
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);

				return;
			}

			var loadelement		= new Array();
			var baseHtml		= new $.Deferred();

			loadelement.push(baseHtml);

			setTimeout(function(){
				$("#modalBody").load("/ivcargo/html/report/newCashStatementReport/newCashStatementReportbankAccDetails.html",function() {
					baseHtml.resolve();
				});
			},200);

			$.when.apply($, loadelement).done(function() {
				showLayer();

				masterLangObj 			= FilePath.loadLanguage();
				masterLangKeySet 		= loadLanguageWithParams(masterLangObj);

					if(response.CashStatementTxn != undefined){
						
						var CashStatementTxnColumnConfig 	= response.CashStatementTxn.columnConfiguration;
						var CashStatementColumnKeys			= _.keys(CashStatementTxnColumnConfig);
						var CashStatementConfig				= new Object();
						for (var i = 0; i < CashStatementColumnKeys.length; i++) {
							
							var bObj	= CashStatementTxnColumnConfig[CashStatementColumnKeys[i]];
							
							if (bObj.show == true) {
								CashStatementConfig[CashStatementColumnKeys[i]] = bObj;
							}
						}
						response.CashStatementTxn.columnConfiguration		= CashStatementConfig;
						response.CashStatementTxn.Language					= masterLangKeySet;
					}
					if(response.CashStatementTxn != undefined && response.CashStatementTxn.CorporateAccount != undefined) {
						hideAllMessages();
						gridObject = slickGridWrapper2.setGrid(response.CashStatementTxn);
					} else {
						$('#bottom-border-boxshadow').addClass('hide');
					}

					hideLayer();
			})
		}
	});
});

function transportSearch(grid, dataView, row){
	
	showLayer();

	var jsonObject = new Object();

	if($("#dateEle").attr('data-startdate') != undefined){
		jsonObject["fromDate"] = $("#dateEle").attr('data-startdate');
	}

	if($("#dateEle").attr('data-enddate') != undefined){
		jsonObject["toDate"] = $("#dateEle").attr('data-enddate');
	}

	jsonObject["sourceBranchId"] 	= $('#branchEle_primary_key').val();
	jsonObject["regionId"] 			= $('#regionEle_primary_key').val();
	jsonObject["subRegionId"] 		= $('#subRegionEle_primary_key').val();
	jsonObject["paymentTypeId"] 	= dataView.getItem(row).paymentTypeId;
	jsonObject["bankAccountId"] 	= dataView.getItem(row).bankAccountId;
	jsonObject["identifier"] 		= dataView.getItem(row).identifier;

	localStorage.setItem("jsonObject",JSON.stringify(jsonObject));

	childwin = window.open("Reports.do?pageId=340&eventId=3&modulename=newCashStatementReportPaymentDetails&masterid=&tab=4","_blank");

	hideLayer();
}

function getPaymentDetails(grid, dataView, row){
	
	showLayer();

	var jsonObject = new Object();

	if($("#dateEle").attr('data-startdate') != undefined){
		jsonObject["fromDate"] = $("#dateEle").attr('data-startdate');
	}

	if($("#dateEle").attr('data-enddate') != undefined){
		jsonObject["toDate"] = $("#dateEle").attr('data-enddate');
	}

	jsonObject["sourceBranchId"] 	= $('#branchEle_primary_key').val();
	jsonObject["regionId"] 			= $('#regionEle_primary_key').val();
	jsonObject["subRegionId"] 		= $('#subRegionEle_primary_key').val();
	jsonObject["paymentTypeId"] 	= dataView.getItem(row).paymentTypeId;
	jsonObject["bankAccountId"] 	= dataView.getItem(row).bankAccountId;
	jsonObject["identifier"] 		= dataView.getItem(row).identifier;

	localStorage.setItem("jsonObject",JSON.stringify(jsonObject));

	childwin = window.open("Reports.do?pageId=340&eventId=3&modulename=newCashStatementReportBankPaymentDetails&masterid=&tab=4","_blank");

	hideLayer();
}