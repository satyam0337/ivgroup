define([  'JsonUtility'
          ,'messageUtility'
          ,'/ivcargo/resources/js/generic/urlparameter.js'
          ,'jquerylingua'
          ,'language'
          ,'autocomplete'
          ,'autocompleteWrapper'
          ,'nodvalidation'
          ,'focusnavigation'//import in require.config
          ,'selectizewrapper'
          ,'/ivcargo/resources/js/module/redirectAfterUpdate.js'
          ],
          function(JsonUtility, MessageUtility, UrlParameter,Lingua, Language, AutoComplete, AutoCompleteWrapper,
        		 NodValidation,ElementFocusNavigation,Selectizewrapper) {
	'use strict';
	var jsonObject = new Object(), myNod,  _this = '', masterLangObj, masterLangKeySet,lhpvId,lhpvNumber,lhpvDate,VehicleTypeIdCurr,redirectTo,dispatchDestinationSubregionId,lhpvNumber,lhpvDateStr,isDuplicateLHPV = false;
	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
			lhpvId 							= UrlParameter.getModuleNameFromParam('lhpvId');
			lhpvNumber 						= UrlParameter.getModuleNameFromParam('lhpvNumber');
			lhpvDate 						= UrlParameter.getModuleNameFromParam('lhpvDate');
			console.log("lhpvDate222255555",lhpvDate)
			redirectTo						= UrlParameter.getModuleNameFromParam('redirectTo');
		},render : function() {
			
			if(lhpvId > 0) {
				_this.renderUpdateManualLHPVNumber();
			}
			
			//getJSON(jsonObject, WEB_SERVICE_URL+'/LHPVWS/getDataToUpdateLHPVData.do', _this.renderUpdateManualLHPVNumber, EXECUTE_WITH_ERROR);
			return _this;
			
		},renderUpdateManualLHPVNumber : function (){

			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			loadelement.push(baseHtml);
			$("#mainContent").load("/ivcargo/html/module/editManualLHPVNo/editManualLHPVNo.html",function() {
				baseHtml.resolve();
			});
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				$('#prevLHPVNumber').html(lhpvNumber);
				
				$('#lhpvNumberEle').blur(function(event) {
					var jsonObject	= new Object();
					jsonObject.manualLHPVNumber = $('#lhpvNumberEle').val();
					jsonObject.lhpvDate = lhpvDate.substr(0,10);
					jsonObject.editManualLhpv = true;
					getJSON(jsonObject, WEB_SERVICE_URL + '/duplicateCheckingWS/validateManualLHPVNumber.do?', _this.checkIfManualLHPVNumberExist, EXECUTE_WITH_ERROR);
					
				});
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				
				myNod.add({
					selector: '#lhpvNumberEle',
					validate: 'presence',
					errorMessage: 'Please Enter LHPV Number !'
				});
				
				myNod.add({
					selector: '#lhpvRemark',
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
		
		},checkIfManualLHPVNumberExist : function(response) {
			
			isDuplicateLHPV	= response.isFTLDuplicateLHPV;
			if(isDuplicateLHPV) {
				// $('#lsNumberEle').val(' ');
				setTimeout(function(){ $('#lhpvNumberEle').focus(); }, 10);
			}
			
			if(response.message != undefined) {
				hideLayer();
				var errorMessage 	= response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			}
		},onSubmit : function() {

			if(isDuplicateLHPV) {
				$('#lhpvNumberEle').focus();
				return false;
			}else {
				var answer = confirm ("Are you Sure to Update LHPV Number ?");
				if (answer){
					var jsonObject = new Object();

					//jsonObject["vehicleTypeId"] 			= $('#vehicleTypeEle').val();
					jsonObject["lhpvId"] 					= lhpvId;
					jsonObject["lhpvNumber"] 				= $('#lhpvNumberEle').val();
					jsonObject["lhpvRemark"] 				= $('#lhpvRemark').val();
					jsonObject["redirectTo"]				= 13;

					getJSON(jsonObject, WEB_SERVICE_URL+'/LHPVWS/updateLHPVNumber.do', _this.setEditDestinationResponse, EXECUTE_WITH_ERROR);
				} else {
					hideLayer();
				}
			}
		},setEditDestinationResponse : function(response) {
			console.log("responseeeee",response)
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