define([
	'slickGridWrapper2'
	,'errorshow'
	,'JsonUtility'
	,'messageUtility'
	], function (slickGridWrapper2) {
	'use strict';// this basically give strictness to this specific js
	let _this = ''; let jsonObject = new Object();

	return Marionette.LayoutView.extend({
		initialize: function(){
			_this 			= this;
			jsonObject		= JSON.parse(localStorage.getItem("jsonObject"));
			localStorage.removeItem("jsonObject");
		}, render: function(){
			if(jsonObject == null) {
				showMessage('error', 'No request found to get data, Please go back on previous report tab !');
				
				setTimeout(function() {
					window.close();
				}, 3000);
			} else
				getJSON(jsonObject, WEB_SERVICE_URL+'/partyWiseShortCreditOutStandingReportWS/getPartyWiseShortCreditOutStandingReportLRDetails.do', _this.setElementData, EXECUTE_WITH_ERROR);
		}, setElementData : function(response) {
			hideLayer();

			if(response.message != undefined){
				$('#middle-border-boxshadow').addClass('hide');
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
				return;
			}

			let loadelement		= new Array();
			let baseHtml		= new $.Deferred();

			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/report/partyWiseShortCreditOutStandingReport/partyWiseShortCreditOutStandingReportLRDetails.html",function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				$('#middle-border-boxshadow').removeClass('hide');
				hideAllMessages();
				if(response.lRDetails != undefined && response.lRDetails.CorporateAccount != undefined && response.lRDetails.CorporateAccount.length > 0) {
					$('#lRDetails').show();
					slickGridWrapper2.setGrid(response.lRDetails);
				}
				if(response.billDetails != undefined && response.billDetails.CorporateAccount != undefined && response.billDetails.CorporateAccount.length > 0) {
					$('#billDetails').show();
					slickGridWrapper2.setGrid(response.billDetails);
				}
			})
		}
	});
});
