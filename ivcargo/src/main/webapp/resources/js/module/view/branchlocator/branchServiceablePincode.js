define([ 
		PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js', 
		,'JsonUtility'
          ,'messageUtility'
          ,'jquerylingua'
          ,'language'
          ,'autocomplete'
          ,'autocompleteWrapper'
          ,'nodvalidation'
          ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
          ,'focusnavigation'//import in require.config
          ],function(Selection) {
	'use strict';
	let jsonObject = new Object(), myNod, _this = '';
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/branchPinCodeWS/getBranchPinCodeElements.do?',	_this.setPendingPaymentElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		},setPendingPaymentElements : function(response){
			let loadelement = new Array();
			let baseHtml 	= new $.Deferred();
			
			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/module/branch/branchserviceablepincode.html",function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();

				let elementConfiguration	= new Object();
				
				elementConfiguration.destSubregionElement	= $('#subRegionEle');
				elementConfiguration.destBranchElement		= $('#branchEle');
				
				response.elementConfiguration						= elementConfiguration;
				response.destinationSubRegionBranchSelection		= true;
				
				Selection.setSelectionToGetData(response);
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector: '#subRegionEle',
					validate: 'validateAutocomplete:#subRegionEle_primary_key',
					errorMessage: 'Select proper Area !'
				});

				myNod.add({
					selector: '#branchEle',
					validate: 'validateAutocomplete:#branchEle_primary_key',
					errorMessage: 'Select proper Branch !'
				});

			
				hideLayer();

				$("#saveBtn").click(function() {
					myNod.performCheck();

					if(myNod.areAll('valid'))
						_this.onSubmit();								
				});
			});
		}, onSubmit : function() {
			showLayer();
			let jsonObject = new Object();
			$('#bottom-border-boxshadow').hide();
			
			jsonObject["subRegionId"] 			= $('#subRegionEle_primary_key').val();
			jsonObject["sourceBranchId"] 		= $('#branchEle_primary_key').val();
			jsonObject["pinCode"] 				= $('#pinCodeEle').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/branchPinCodeWS/saveBranchPinCodeData.do', _this.result, EXECUTE_WITH_ERROR);
		}, result : function(response) {
			if(response.message != undefined) {
				hideLayer();
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}
			
			hideLayer();
		}		
	});
});

function showHidePincodeSaveDiv() {
	if(Number($('#subRegionEle_primary_key').val()) > 0 && Number($('#branchEle_primary_key').val()) > 0){
		$('#pinCodeDiv').show();
	}else{
		$('#pinCodeDiv').hide();
	}
}