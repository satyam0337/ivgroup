define([  '/ivcargo/resources/js/generic/urlparameter.js'
		, 'JsonUtility'
          ,'messageUtility'
          ,'nodvalidation'
          ,'focusnavigation'//import in require.config
          ,'/ivcargo/resources/js/module/redirectAfterUpdate.js'
          ],
          function(UrlParameter) {
	'use strict';
	let jsonObject = new Object(), myNod,  _this = '', moneyReceiptId,moduleIdentifier,redirectTo,oldRemark = '';
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
			moneyReceiptId 					= UrlParameter.getModuleNameFromParam('moneyReceiptId');
			moduleIdentifier				= UrlParameter.getModuleNameFromParam('moduleIdentifier');
			redirectTo						= UrlParameter.getModuleNameFromParam('redirectTo');
			
			jsonObject.moneyReceiptId		= moneyReceiptId;
			jsonObject.moduleId				= moduleIdentifier;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/moneyReceiptTxnWS/getRemarkByMoneyReceiptId.do?', _this.renderUpdateMRRemark, EXECUTE_WITHOUT_ERROR);
			return _this;
		},renderUpdateMRRemark : function (response){
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
			$("#mainContent").load("/ivcargo/html/module/editMRRemark/editMRRemark.html",function() {
				baseHtml.resolve();
			});
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				oldRemark = response.remark;
				
				 $('#oldRemark').val(oldRemark)
				 
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector	: '#addRemark',
					validate	: 'presence',
					errorMessage: 'Enter Remark !'
				});
				
				hideLayer();

				$("#saveBtn").click(function() {
					myNod.performCheck();
					if(myNod.areAll('valid')){
						_this.onSubmit(_this);								
					}
				});
			});
			return _this;
		
		},onSubmit : function() {
			showLayer();
			let answer = confirm ("Are you Sure to Update MR Remark?");
			
			if (answer){
				let jsonObject = new Object();
				jsonObject["remark"] 					= oldRemark+'.'+$('#addRemark').val();
				jsonObject["moneyReceiptId"] 			= moneyReceiptId;
				jsonObject["redirectTo"]				= redirectTo;
				jsonObject["newRemark"]					= $('#addRemark').val();
				jsonObject["moduleId"]					= moduleIdentifier;
				
				getJSON(jsonObject, WEB_SERVICE_URL+'/moneyReceiptTxnWS/updateMRRemark.do', _this.setEditMRRemarkResponse, EXECUTE_WITH_ERROR);
			} else {
				hideLayer();
			}
		},setEditMRRemarkResponse : function(response) {
			if(response.message.typeName != undefined) {
				hideLayer();
				setTimeout(function(){redirectToAfterUpdate(response)}, 1500);
			}
			hideLayer();
		}
	});
});