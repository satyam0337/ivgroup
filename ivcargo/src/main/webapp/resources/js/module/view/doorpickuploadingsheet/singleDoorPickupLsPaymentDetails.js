define([  
	PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
	,'JsonUtility'
	,'messageUtility'
	],function(UrlParameter) {
	'use strict';// this basically give strictness to this specific js
	var _this = '', jsonObject, doorPickupLedgerId, incExpMappingId;
	return Marionette.LayoutView.extend({
		initialize: function() {
			_this = this;
			doorPickupLedgerId 	= UrlParameter.getModuleNameFromParam(MASTERID);
			incExpMappingId		= UrlParameter.getModuleNameFromParam('incExpMappingId');
		}, render: function() {
			jsonObject					= new Object();
			jsonObject.doorPickupLedgerId	= doorPickupLedgerId;
			jsonObject.incExpMappingId		= incExpMappingId;
			showLayer();
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/doorPickupDispatchWS/getDoorPickupLSPaymentDetail.do?', _this.loadElements, EXECUTE_WITHOUT_ERROR);
			
			return _this;
		},loadElements : function(response) {
			if(response.message != undefined){
				var errorMessage	= response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				return;
			}
						
			var loadelement 	= new Array();
			var baseHtml 		= new $.Deferred();
			
			$("#mainContent").load("/ivcargo/html/module/doorpickupls/singleDoorPickupLsPaymentDetails.html",
					function() {
						baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				hideLayer();
				
				setTimeout(() => {
					_this.setData(response);
				}, 100);
			});
			
		}, setData : function(response) {
			var expenseSettlementArr	= response.expenseSettlementArr;
			var columnArray				= new Array();
			var totalReceivedAmount		= 0;
			
			for(var i = 0; i < expenseSettlementArr.length; i++) {
				var expenseSettlement		= expenseSettlementArr[i];
				totalReceivedAmount 		+= expenseSettlement.receivedAmount;
				
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + expenseSettlement.paymentVoucherNumber + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + expenseSettlement.branchName + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + expenseSettlement.paymentModeName + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + expenseSettlement.chequeString + "</td>");
				columnArray.push("<td style='text-align: right; vertical-align: middle;'>" + expenseSettlement.receivedAmount + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + expenseSettlement.expenseDateTimeString + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + expenseSettlement.expenseBy + "</td>");
				
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

