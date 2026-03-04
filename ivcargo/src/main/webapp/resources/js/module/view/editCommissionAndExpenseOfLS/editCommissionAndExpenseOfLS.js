define([  
        '/ivcargo/resources/js/generic/urlparameter.js'
		,'JsonUtility'
          ,'messageUtility'
          ,'nodvalidation'
          ,'focusnavigation'//import in require.config
          ,'/ivcargo/resources/js/module/redirectAfterUpdate.js'
          ],
          function(UrlParameter) {
	'use strict';
	let jsonObject = new Object(), myNod,  _this = '', dispatchLedgerId,redirectTo, isLSCommissionEditAllow = false,
	isLSExpenseEditAllow = false;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
			dispatchLedgerId 				= UrlParameter.getModuleNameFromParam('dispatchLedgerId');
			redirectTo						= UrlParameter.getModuleNameFromParam('redirectTo');
			jsonObject.dispatchLedgerId		= dispatchLedgerId;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/editLSWS/getDispatchCommissionAndExpenseByDispatchLedgerId.do?', _this.renderUpdateLSDestination, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, renderUpdateLSDestination : function (response){
			hideLayer();
			
			if(response.message != undefined) {
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						
				setTimeout(() => {
					window.close();
				}, 2000);
			}
					
			let loadelement = new Array();
			let baseHtml = new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/editCommissionAndExpenseOfLS/editCommissionAndExpenseOfLS.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				isLSCommissionEditAllow			= response.isLSCommissionEditAllow;
				isLSExpenseEditAllow			= response.isLSExpenseEditAllow;
				
				if(isLSCommissionEditAllow)
					$('.commissionLS').removeClass("hide");
				
				if(isLSExpenseEditAllow)
					$('.ExpenseLS').removeClass("hide");
				
				oldCommission = response.commission;
				
				$('#oldCommission').val(oldCommission)
				$('#addCommission').val(oldCommission)
				
				oldExpense = response.expense;
				$('#oldExpense').val(oldExpense)
				$('#addExpense').val(oldExpense)
				 
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				hideLayer();

				$("#saveBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit(_this);								
				});
			});
		}, onSubmit : function() {
			showLayer();
			let answer = confirm ("Are you Sure to Update LS Commission and Expense?");
			
			if (answer){
				let jsonObject = new Object();
				jsonObject["dispatchLedgerId"] 			= dispatchLedgerId;
				jsonObject["redirectTo"]				= redirectTo;
				jsonObject["newCommission"]				= $('#addCommission').val();
				jsonObject["newExpense"]				= $('#addExpense').val();
				
				if(!isLSCommissionEditAllow)
					jsonObject["newCommission"] 		= oldCommission;
				
				if(!isLSExpenseEditAllow)
					jsonObject["newExpense"] 			= oldExpense;
				
				getJSON(jsonObject, WEB_SERVICE_URL+'/editLSWS/updateDispatchCommissionAndExpense.do', _this.setEditLsCommissionAndExpenseResponse, EXECUTE_WITH_ERROR);
			} else {
				hideLayer();
			}
		}, setEditLsCommissionAndExpenseResponse : function(response) {
			if(response.message != undefined) {
				hideLayer();
				setTimeout(function(){redirectToAfterUpdate(response)}, 1500);
			}
			hideLayer();
		}
	});
});