var PaymentTypeConstant;

define([
	PROJECT_IVUIRESOURCES + '/resources/js/module/view/deliveryDetailsReport/deliveryDetailsReportLRDetailsfilepath.js'
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
			getJSON(jsonObject, WEB_SERVICE_URL+'/deliveryDetailsReportWS/getDeliveryDetailsReportLRWiseData.do', _this.setElementData, EXECUTE_WITHOUT_ERROR);
		},setElementData : function(response) {

			$("#deliveryDetailsReportLRDetailsDiv").empty();

			if(response.message != undefined){
				hideLayer();
				$('#middle-border-boxshadow').addClass('hide');
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);

				return;
			}

			var loadelement		= new Array();
			var baseHtml		= new $.Deferred();
			PaymentTypeConstant	= response.PaymentTypeConstant;

			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/report/deliveryDetailsReport/deliveryDetailsReportLRDetails.html",function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				showLayer();

				masterLangObj 			= FilePath.loadLanguage();
				masterLangKeySet 		= loadLanguageWithParams(masterLangObj);

				if(response.DeliveryDetailsModel != undefined) {
					var DeliveryDetailsModelColumnConfig = response.DeliveryDetailsModel.columnConfiguration;
					var DeliveryDetailsModelColumnKeys	= _.keys(DeliveryDetailsModelColumnConfig);
					var DeliveryDetailsModelConfig		= new Object();

					var NewDeliveryDetailsModelColumnKeys	= new Array();
					for(var i = 0;DeliveryDetailsModelColumnKeys.length > i; i++) {

						if(DeliveryDetailsModelColumnKeys[i] != 'deliveryDiscount') {
							NewDeliveryDetailsModelColumnKeys.push(DeliveryDetailsModelColumnKeys[i]);
						} else {
							break;
						}
					}

					if(response.deliveryChargesNameHM != undefined) {
						var chargesNameHM	= response.deliveryChargesNameHM;
						for(var j in chargesNameHM) {
							if(chargesNameHM[j] != null) {
								NewDeliveryDetailsModelColumnKeys.push(chargesNameHM[j].replace(/[' ',.,/]/g,""));
								DeliveryDetailsModelColumnConfig[chargesNameHM[j].replace(/[' ',.,/]/g,"")] = {
										"dataDtoKey":chargesNameHM[j].replace(/[' ',.,/]/g,"")
										,"dataType":"number"
										,"languageKey":chargesNameHM[j].replace(/[' ',.,/]/g,"")
										,"searchFilter":false
										,"listFilter":false
										,"columnHidden":false
										,"displayColumnTotal":true
										,"columnMinimumDisplayWidthInPx":70
										,"columnInitialDisplayWidthInPx":90
										,"columnMaximumDisplayWidthInPx":120
										,"columnPrintWidthInPercentage":8
										,"elementCssClass":""
										,"columnDisplayCssClass":""
										,"columnPrintCssClass":""
										,"sortColumn":true
										,"show":true
								};
								masterLangKeySet[chargesNameHM[j].replace(/[' ',.,/]/g,"")] = chargesNameHM[j].replace(/[' ',.,/]/g,"");
							}
						}
					}

					NewDeliveryDetailsModelColumnKeys = _.union(NewDeliveryDetailsModelColumnKeys, DeliveryDetailsModelColumnKeys);

					for (var i = 0; i < NewDeliveryDetailsModelColumnKeys.length; i++) {

						var bObj	= DeliveryDetailsModelColumnConfig[NewDeliveryDetailsModelColumnKeys[i]];

						if (bObj != null && bObj.show != undefined && bObj.show == true) {
							DeliveryDetailsModelConfig[NewDeliveryDetailsModelColumnKeys[i]] = bObj;
						}
					}

					response.DeliveryDetailsModel.columnConfiguration	= _.values(DeliveryDetailsModelConfig);
					response.DeliveryDetailsModel.Language				= masterLangKeySet;
				}

				if(response.DeliveryDetailsModel != undefined && response.DeliveryDetailsModel.CorporateAccount != undefined) {
					for(var i=0;response.DeliveryDetailsModel.CorporateAccount.length > i; i++) {
						var chargesNameHM	= response.chargesNameHM;
						for(var k in chargesNameHM) {
							if(chargesNameHM[k] != null) {
								response.DeliveryDetailsModel.CorporateAccount[i][chargesNameHM[k].replace(/[' ',.,/]/g,"")] = 0;
							}
						}
						if(response.DeliveryDetailsModel.CorporateAccount[i].chargesCollection != undefined) {
							var chargeHM	= response.DeliveryDetailsModel.CorporateAccount[i].chargesCollection;
							for(var l in chargeHM) {
								if(l.split("_")[1] != undefined) {
									response.DeliveryDetailsModel.CorporateAccount[i][l.split("_")[1].replace(/[' ',.,/]/g,"")] = chargeHM[l];
								}
							}
						}
					}
					var result = response.DeliveryDetailsModel.CorporateAccount;

					for(var i=0;result.length > i;i++) {

						var waybillDeliveryNumber	= result[i].wayBillDeliveryNumber;
						result[i].waybillDeliveryNumberWithouBranchCode	= Number(waybillDeliveryNumber.substr(waybillDeliveryNumber.indexOf("/") + 1));
					}
					response.DeliveryDetailsModel.CorporateAccount = _.sortBy(result,'waybillDeliveryNumberWithouBranchCode');

					$('#middle-border-boxshadow').removeClass('hide');
					gridObject = slickGridWrapper2.setGrid(response.DeliveryDetailsModel);

					hideLayer();
				}

			})
		}
	});
});

function getShortCreditDetails(grid, dataView, row){
	if(dataView.getItem(row).paymentTypeId == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID){
		childwin = window.open('shortCreditPaymentDetails.do?pageId=340&eventId=2&modulename=shortCreditPaymentDetails&creditWayBillTxnId=' + dataView.getItem(row).creditWayBillTxnId,'newwindow', config='height=600,width=825, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	}
}