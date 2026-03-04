define([ 'marionette'
         ,'JsonUtility'
         ,'messageUtility'
         ,'/ivcargo/resources/js/generic/urlparameter.js'
         ,PROJECT_IVUIRESOURCES + '/resources/js/module/view/creditpayment/blhpvPaymentDetailsFilePath.js'
         ,'jquerylingua'
         ,'language'
         ,'nodvalidation'
		 ,'focusnavigation'
		 ,'slickGridWrapper2',
         ],
         function(Marionette, JsonUtility, MessageUtility, UrlParameter, FilePath, jquerylingua, language, NodValidation, FocusNavigation, slickGridWrapper2) {
	'use strict';// this basically give strictness to this specific js
	var jsonObject	= new Object(),
	blhpvId,
	isShortCredit,
	blhpvBranchId,
	blhpvNumber,
	myNod,
	masterLangKeySet,
	gridObject,
	masterLangObj,
	_this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(masterObj){
			//initialize is the first function called on call new view()
			_this = this;
			blhpvId 				= UrlParameter.getModuleNameFromParam('blhpvId');
			jsonObject.blhpvId		= blhpvId;
		}, render: function() {
			
			jsonObject	= new Object();
			
			jsonObject.blhpvId			= blhpvId;
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/blhpvCreditPaymentWS/getBlhpvCreditPaymentDetails.do?', _this.setShortCreditPaymentDetails, EXECUTE_WITHOUT_ERROR);

		}, setShortCreditPaymentDetails : function(response) {
			
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			loadelement.push(baseHtml);
			$("#mainContent").load("/ivcargo/html/module/creditpayment/blhpvPaymentDetails.html",function() {
				baseHtml.resolve();
			});
			$.when.apply($, loadelement).done(function() {
				
				initialiseFocus();
				masterLangObj 		= FilePath.loadLanguage();
				masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
				
				if(response.message != undefined) {
					var errorMessage = response.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					hideLayer();
					setTimeout(() => {
						window.close();
					}, 1000);
					return;
				}
				
				hideLayer();
				$('#blhpvPaymentDetails').empty();

				var BlhpvPaymentDetailsModel	= response.BlhpvPaymentDetailsModel;
				var isTdsAllow					= response.IsTdsAllow;
				
				if(!isTdsAllow) $('#tdsCol').remove();
				
				var totalReceiveAmount	= 0;
				var totalTDSAmount		= 0;
				var isSplitLhpv			= false;

				for(var i = 0; i < BlhpvPaymentDetailsModel.length; i++){
					var columnArray			= new Array();
					var obj	= BlhpvPaymentDetailsModel[i];
					
					if(obj != undefined){	
						columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' value='"+ obj.creationDate +"' >" + (obj.creationDate) + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + (obj.paymentStatusName) + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + (obj.totalAmount) + "</td>");
						
						totalReceiveAmount += obj.settledAmount;
						
						if(obj.payableAmount > 0) {
							isSplitLhpv = true;
							$('#payableAmount').removeClass('hide');
							columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + (obj.payableAmount) + "</td>");
						}
						
						columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + (obj.settledAmount) + "</td>");
						
						if(isTdsAllow) {
							columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + (obj.tdsAmount) + "</td>");
							totalTDSAmount += obj.tdsAmount;
						}
						
						columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + (obj.receivedByExecutive) + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + (obj.receivedByBranch) + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + (obj.paymentTypeName) + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + (obj.chequeNumber) + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + (obj.chequeDateStr) + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + (obj.bankName) + "</td>");
						
						$('#blhpvPaymentDetails').append('<tr id="blhpvId_'+ obj.blhpvId +'">' + columnArray.join(' ') + '</tr>');
					}
				}
				
				var columnArray			= new Array();
				
				columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' colspan = '3'></td>");
				
				if(isSplitLhpv)
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'></td>");
				
				columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + (totalReceiveAmount) + "</td>");
				
				if(isTdsAllow)
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + (totalTDSAmount) + "</td>");
				
				columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' colspan = '6'></td>");
				
				$('#reportTable tfoot').append('<tr class="text-danger text-center success">' + columnArray.join(' ') + '</tr>');

				columnArray	= [];
				
			});
		}
	});
});