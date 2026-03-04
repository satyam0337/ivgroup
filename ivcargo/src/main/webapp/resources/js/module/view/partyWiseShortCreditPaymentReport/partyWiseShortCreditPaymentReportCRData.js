define([
	 PROJECT_IVUIRESOURCES + '/resources/js/module/view/partyWiseShortCreditPaymentReport/partyWiseShortCreditPaymentReportCRDatafilepath.js'
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
			getJSON(jsonObject, WEB_SERVICE_URL+'/partyWiseShortCreditPaymentReportWS/getPartyWiseShortCreditPaymentReportCRWiseData.do', _this.setElementData, EXECUTE_WITH_ERROR);
		},setElementData : function(response) {

			$("#partyWiseShortCreditPaymentReportCRDiv").empty();

			if(response.message != undefined){
				hideLayer();
				$('#middle-border-boxshadow').addClass('hide');
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
				return;
			}

			if(response.ShortCreditPaymentRegister.CorporateAccount.length == 0){
				hideLayer();
				$('#middle-border-boxshadow').addClass('hide');
				showMessage('error', "No Record Found !");
				return;
			}

			var loadelement		= new Array();
			var baseHtml		= new $.Deferred();

			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/report/partyWiseShortCreditPaymentReport/partyWiseShortCreditPaymentReportCRData.html",function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				showLayer();

				masterLangObj 			= FilePath.loadLanguage();
				masterLangKeySet 		= loadLanguageWithParams(masterLangObj);

				if(response.ShortCreditPaymentRegister != null){
					var shortCreditPaymentRegisterColumnConfig		= response.ShortCreditPaymentRegister.columnConfiguration;
					var shortCreditPaymentRegisterKeys				= _.keys(shortCreditPaymentRegisterColumnConfig);
					var bcolConfig									= new Object();

					for (var i=0; i<shortCreditPaymentRegisterKeys.length; i++) {
						var bObj	= shortCreditPaymentRegisterColumnConfig[shortCreditPaymentRegisterKeys[i]];
						if (bObj.show == true) {
							bcolConfig[shortCreditPaymentRegisterKeys[i]]	= bObj;
						}
					}
					response.ShortCreditPaymentRegister.columnConfiguration		= bcolConfig;
					response.ShortCreditPaymentRegister.Language				= masterLangKeySet;
				}

				if(response.ShortCreditPaymentRegister.CorporateAccount != undefined && response.ShortCreditPaymentRegister.CorporateAccount.length > 0) {

					var result = response.ShortCreditPaymentRegister.CorporateAccount;

					for(var i=0;result.length > i;i++) {

						var waybillDeliveryNumber							= result[i].deliveryWayBillNumber;
						result[i].waybillDeliveryNumberWithoutBranchCode	= Number(waybillDeliveryNumber.substr(waybillDeliveryNumber.indexOf("/") + 1));
					}

					response.ShortCreditPaymentRegister.CorporateAccount = _.sortBy(result,'waybillDeliveryNumberWithoutBranchCode');

					$('#middle-border-boxshadow').removeClass('hide');
					hideAllMessages();
					gridObject = slickGridWrapper2.setGrid(response.ShortCreditPaymentRegister);
				} else {
					$('#middle-border-boxshadow').addClass('hide');
				}

				hideLayer();
			})
		}
	});
});

