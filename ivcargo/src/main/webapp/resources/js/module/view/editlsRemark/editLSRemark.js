define([  '/ivcargo/resources/js/generic/urlparameter.js'
		, 'JsonUtility'
          ,'messageUtility'
          ,'nodvalidation'
          ,'focusnavigation'//import in require.config
          ,'/ivcargo/resources/js/module/redirectAfterUpdate.js'
          ],
          function(UrlParameter) {
	'use strict';
	let jsonObject = new Object(), myNod,  _this = '', dispatchLedgerId,redirectTo,oldRemark = '';
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
			dispatchLedgerId 				= UrlParameter.getModuleNameFromParam('dispatchLedgerId');
			redirectTo						= UrlParameter.getModuleNameFromParam('redirectTo');
			jsonObject.dispatchLedgerId		= dispatchLedgerId;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/editLSWS/getDispatchRemarkByDispatchLedgerId.do?', _this.renderUpdateLSRemark, EXECUTE_WITHOUT_ERROR);
			return _this;
		},renderUpdateLSRemark : function (response){
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
			$("#mainContent").load("/ivcargo/html/module/editLSRemark/editLSRemark.html",function() {
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
			let answer = confirm ("Are you Sure to Update LS Remark?");
			
			if (answer){
				let jsonObject = new Object();
				jsonObject["remark"] 					= oldRemark + '.' + $('#addRemark').val();
				jsonObject["dispatchLedgerId"] 			= dispatchLedgerId;
				jsonObject["redirectTo"]				= redirectTo;
				jsonObject["newRemark"]					= $('#addRemark').val();
				
				getJSON(jsonObject, WEB_SERVICE_URL+'/editLSWS/updateLSRemark.do', _this.setEditLsRemarkResponse, EXECUTE_WITH_ERROR);
			} else {
				hideLayer();
			}
		},setEditLsRemarkResponse : function(response) {
			if(response.message.typeName != undefined) {
				hideLayer();
				setTimeout(function(){redirectToAfterUpdate(response)}, 1500);
			}
			hideLayer();
		}
	});
});