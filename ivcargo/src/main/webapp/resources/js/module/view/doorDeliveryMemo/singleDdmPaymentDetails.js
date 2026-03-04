define([  'JsonUtility'
	,'messageUtility'
	,'jquerylingua'
	,'language'
	,PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
	],function(JsonUtility, MessageUtility, Lingua, Language, UrlParameter) {
	'use strict';// this basically give strictness to this specific js
	var _this = '', jsonObject, deliveryRunSheetLedgerId, incExpMappingId;
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData) {
			_this = this;
			
			deliveryRunSheetLedgerId 	= UrlParameter.getModuleNameFromParam(MASTERID);
			incExpMappingId				= UrlParameter.getModuleNameFromParam('incExpMappingId');
		}, render: function() {
			jsonObject								= new Object();
			jsonObject.deliveryRunSheetLedgerId 	= deliveryRunSheetLedgerId
			jsonObject.incExpMappingId 				= incExpMappingId
			
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL+'/ddmLorryHireAmountSettlementWS/getDDMPaymentDetail.do', _this.loadElements, EXECUTE_WITH_ERROR); //submit JSON
			return _this;
		}, loadElements : function(response) {
			hideLayer();
			
			if(response.message != undefined) {
				var errorMessage	= response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				
				setTimeout(() => {
					window.close();
				}, 2000);
				return;
			}
			
			var loadelement 	= new Array();
			var baseHtml 		= new $.Deferred();
			
			$("#mainContent").load("/ivcargo/html/module/ddm/singleDdmPaymentDetails.html",
					function() {
						baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				setTimeout(() => {
					_this.setData(response);
				}, 100);
			});
			
		}, setData : function(response) {
			var ddmLorryHireSummary		= response.expenseSettlementList;
			var columnArray				= new Array();
			var totalReceivedAmount		= 0;
			
			for(var i = 0; i < ddmLorryHireSummary.length; i++) {
				totalReceivedAmount 		+= ddmLorryHireSummary[i].receivedAmount;
				
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + ddmLorryHireSummary[i].paymentVoucherNumber  + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + ddmLorryHireSummary[i].branchName + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + ddmLorryHireSummary[i].paymentModeName + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + ddmLorryHireSummary[i].chequeString + "</td>");
				columnArray.push("<td style='text-align: right; vertical-align: middle;'>" + ddmLorryHireSummary[i].receivedAmount + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + ddmLorryHireSummary[i].expenseDateTimeString + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + ddmLorryHireSummary[i].expenseBy + "</td>");
				
				$('#expenseSettlementDetails tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
				columnArray	= [];
			}
			
			columnArray	= [];
			
			columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>Total</b></td>");		
			columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");						
			columnArray.push("<td style='text-align: right; vertical-align: middle;'><b>" + totalReceivedAmount + "</b></td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");						
			
			$('#expenseSettlementDetails tfoot').append('<tr>' + columnArray.join(' ') + '</tr>');
			columnArray	= [];
		}
	});
});