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
	var jsonObject = new Object(), myNod,  _this = '',dispatchLedgerId,lsNumber,lsDate,redirectTo,isDuplicateLs = false;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
			dispatchLedgerId 				= UrlParameter.getModuleNameFromParam('dispatchLedgerId');
			lsNumber 						= UrlParameter.getModuleNameFromParam('lsNumber');
			lsDate 							= UrlParameter.getModuleNameFromParam('lsDate');
			redirectTo						= 13;
			jsonObject.dispatchLedgerId		= dispatchLedgerId;

		},render : function() {
			
			if(dispatchLedgerId > 0) {
				_this.renderUpdateManualLSNumber();
			}
			
		},renderUpdateManualLSNumber : function (){
			
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			loadelement.push(baseHtml);
			$("#mainContent").load("/ivcargo/html/module/editManualLSNumber/editManualLSNumber.html",function() {
				baseHtml.resolve();
			});
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				$("#prevLSNumber").html(lsNumber);
				
				$('#lsNumberEle').blur(function(event) {
					var jsonObject	= new Object();
					jsonObject.manualLSNumber = $('#lsNumberEle').val();
					jsonObject.lsDate = lsDate.substr(0,10);
					jsonObject.editManualLSNo = true;
					
					getJSON(jsonObject, WEB_SERVICE_URL + '/duplicateCheckingWS/validateManualLSNumber.do?', _this.checkIfManualLsNumberExist, EXECUTE_WITH_ERROR);
					
				});
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector: '#lsNumberEle',
					validate: 'presence',
					errorMessage: 'Please Enter LS Number !'
				});
				
				myNod.add({
					selector: '#LsRemark',
					validate: 'presence',
					errorMessage: 'Please Enter Remark !'
				});

				hideLayer();
				$("#updateBtn").click(function() {
					myNod.performCheck();
					if(myNod.areAll('valid')){
						_this.onSubmit(_this);								
					}
				});
			});
			return _this;
		
		},checkIfManualLsNumberExist : function(response) {
			
			isDuplicateLs	= response.isFTLDuplicateLs;
			if(isDuplicateLs) {
				// $('#lsNumberEle').val(' ');
				setTimeout(function(){ $('#lsNumberEle').focus(); }, 10);
			}
			
			if(response.message != undefined) {
				hideLayer();
				var errorMessage 	= response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			}
		},onSubmit : function() {

			if(isDuplicateLs) {
				//showMessage('error', 'LS Number ' + $('#lsNumberEle').val() + ' already exist');
				$('#lsNumberEle').focus();
				return false;
			}else {
				var answer = confirm ("Are you Sure to Update LS Number ?");
				if (answer){
					var jsonObject = new Object();
					
					jsonObject["dispatchLedgerId"] 			= dispatchLedgerId;
					jsonObject["lsNumber"] 					= $('#lsNumberEle').val();
					jsonObject["LsRemark"] 					= $('#LsRemark').val();
					jsonObject["redirectTo"]				= redirectTo;
			
					getJSON(jsonObject, WEB_SERVICE_URL+'/editLSWS/editLSNumberByDispatchLedgerId.do', _this.setEditLSNumberResponse, EXECUTE_WITH_ERROR);
				} else {
					hideLayer();
				}
			}
			
		},setEditLSNumberResponse : function(response) {
			if(response.message != undefined) {
				hideLayer();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				if(response.message.messageId != 20) {
					return;
				}else {
					setTimeout(() => {
						redirectToAfterUpdate(response);
					}, 1000);
				}
				
			}
		}
		
	});
});

function allowNumbersOnly(evt) {

	var keynum 		= null;
	var returnType	= true;

	if(window.event){ // IE
		keynum = evt.keyCode;
	} else if(evt.which){ // Netscape/Firefox/Opera
		keynum = evt.which;
	}

	if(keynum != null) {
		if(keynum == 8) {
			hideAllMessages();
			return true;
		} else if (keynum < 48 || keynum > 57 ) {
			returnType =  false;
		}
	}

	if(returnType == false){
		return false;
	}
	return true;
}
