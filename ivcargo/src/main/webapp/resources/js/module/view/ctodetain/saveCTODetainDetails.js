define([  'JsonUtility'
          ,'messageUtility'
          ,'/ivcargo/resources/js/generic/urlparameter.js'
          ,'slickGridWrapper2'
          ,'nodvalidation'
          ,'focusnavigation'//import in require.config
          ,'selectizewrapper'
          ,'bootstrapSwitch'
          ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
          ],
          function() {
	'use strict';
	var jsonObject = new Object(), myNod,  _this = '', wayBillId, ctoDetainId, status;
	return Marionette.LayoutView.extend({
		initialize : function(jsonObjectData) {

			//initialize is the first function called on call new view()
			//append template first 
			//the html would be set in the el element
			//this object is not found in other function so _this has been created
			_this 				= this;
			jsonObject 			= jsonObjectData.elementValue;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/CTODetainWS/getCtoDetainAddNewTabElements.do?',	_this.setElements,	EXECUTE_WITHOUT_ERROR);
		}, setElements : function (response){
			wayBillId 	= jsonObject.wayBillId;
			ctoDetainId = jsonObject.ctoDetainId;
			status		= jsonObject.status;

			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			loadelement.push(baseHtml);
	
			setTimeout(function(){
				$("#modalBody").load("/ivcargo/html/module/ctodetain/saveCTODetainDetails.html", function() {
					baseHtml.resolve();
				});
			},200);
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				$("*[data-selector=header]").html(response.moduleName);
						
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector: '#ctoRemarkEle',
					validate: 'presence',
					errorMessage: 'Please Enter Remark !'
				});

				$("#updateBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onUpdate(_this);								
				});	
				
				hideLayer();
				return _this;
		 	});
		}, onUpdate : function() {
			var jsonObject = new Object();
			
			if (confirm('Are you sure you want to Save?')) {
				jsonObject["remark"] 					= $('#ctoRemarkEle').val();
				jsonObject["waybillId"] 				= wayBillId;
				jsonObject["ctoDetainId"] 				= ctoDetainId;
				jsonObject["status"] 					= status;
				
				showLayer();
				
				if(status > 0)
					getJSON(jsonObject, WEB_SERVICE_URL+'/CTODetainWS/updateCTODetainDataToReased.do', _this.setSavingResponse, EXECUTE_WITH_ERROR);
				else
					getJSON(jsonObject, WEB_SERVICE_URL+'/CTODetainWS/saveCTODetainData.do', _this.setSavingResponse, EXECUTE_WITH_ERROR);
			}
		}, setSavingResponse : function(response) {
			hideLayer();

			if(response.message != undefined) {
				setTimeout(function() {
					location.reload();
				},500);
			}
		}
	});
});
