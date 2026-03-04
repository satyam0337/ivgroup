define([ 'marionette'
         ,'JsonUtility'
         ,'messageUtility'
         ,'/ivcargo/resources/js/generic/urlparameter.js'
         ,'jquerylingua'
         ,'language'
         ,'nodvalidation'
		 ,'focusnavigation'
		 ,'slickGridWrapper2',
         ],
         function(Marionette, JsonUtility, MessageUtility, UrlParameter, jquerylingua, language, NodValidation, FocusNavigation, slickGridWrapper2) {
	'use strict';// this basically give strictness to this specific js
	var jsonObject	= new Object(),
	shortCreditCollLedgerId,
	masterLangObj,
	_this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(masterObj){
			//initialize is the first function called on call new view()
			_this = this;
			shortCreditCollLedgerId 				= UrlParameter.getModuleNameFromParam('shortCreditCollLedgerId');
		}, render: function() {
			jsonObject	= new Object();
			
			jsonObject.shortCreditCollLedgerId			= shortCreditCollLedgerId;
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/shortCreditBillPaymentWS/getSTBSBillPaymentDetails.do?', _this.setShortCreditPaymentDetails, EXECUTE_WITH_ERROR);

		}, setShortCreditPaymentDetails : function(response) {
			if(response.message != undefined) {
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
				setTimeout(() => {
					window.close();
				}, 1000);
				return;
			}
				
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/shortCreditBillPayment/stbsBillPaymentDetails.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				hideLayer();
				$('#blhpvPaymentDetails').empty();
				var ShortCreditBillPayment	= response.ShortCreditBillPayment;
				$("*[data-selector='header']").html("STBS Bill Settlement : <b>"+ShortCreditBillPayment[0].shortCreditCollLedgerNumber+"</b>");

				var totalReceiveAmount 	= 0;
				var totalTdsAmount		= 0;

				for(var i = 0; i < ShortCreditBillPayment.length; i++) {
					var columnArray			= new Array();
					var obj	= ShortCreditBillPayment[i];
				
					if(obj != undefined){
						columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' value='"+ obj.receivedTimestampString +"' >" + (obj.receivedTimestampString) + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + (obj.statusName) + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + (obj.billAmount) + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + (obj.tdsAmount) + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + (obj.receivedAmount) + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + (obj.executive) + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + (obj.sourceBranch) + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + (obj.paymentModeName) + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + (obj.chequeNumber) + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + (obj.chequeDateString) + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + (obj.bankName) + "</td>");
						
						$('#blhpvPaymentDetails').append('<tr id="shortCreditBillPaymentId_'+ obj.shortCreditBillPaymentId +'">' + columnArray.join(' ') + '</tr>');
						totalReceiveAmount 	+= obj.receivedAmount;
						totalTdsAmount		+= obj.tdsAmount;
					}
				}

				columnArray	= [];
				
				columnArray.push("<td colspan = '3'></td>");
				columnArray.push("<td style='text-align: center;''>" + totalTdsAmount + "</td>");
				columnArray.push("<td style='text-align: center;''>" + totalReceiveAmount + "</td>");
				columnArray.push("<td colspan = '6'></td>");
						
				$('#blhpvPaymentDetails').append('<tr>' + columnArray.join(' ') + '</tr>');
				
			});
		}
	});
});