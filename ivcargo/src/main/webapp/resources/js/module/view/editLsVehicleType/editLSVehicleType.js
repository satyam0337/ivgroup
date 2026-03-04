define([  'JsonUtility'
          ,'messageUtility'
          ,'/ivcargo/resources/js/generic/urlparameter.js'
          ,PROJECT_IVUIRESOURCES + '/resources/js/module/view/editLsVehicleType/editLSVehicleTypefilepath.js'
          ,'jquerylingua'
          ,'language'
          ,'autocomplete'
          ,'autocompleteWrapper'
          ,'nodvalidation'
          ,'focusnavigation'//import in require.config
          ,'selectizewrapper'
          ,'/ivcargo/resources/js/module/redirectAfterUpdate.js'
          ],
          function(JsonUtility, MessageUtility, UrlParameter, FilePath,Lingua, Language, AutoComplete, AutoCompleteWrapper,
        		 NodValidation,ElementFocusNavigation,Selectizewrapper) {
	'use strict';
	var jsonObject = new Object(), myNod,  _this = '', masterLangObj, masterLangKeySet,dispatchLedgerId,VehicleTypeIdCurr,redirectTo,dispatchDestinationSubregionId;
	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
			dispatchLedgerId 				= UrlParameter.getModuleNameFromParam('dispatchLedgerId');
			VehicleTypeIdCurr			= UrlParameter.getModuleNameFromParam('VehicleTypeId');
			redirectTo						= UrlParameter.getModuleNameFromParam('redirectTo');
			jsonObject.dispatchLedgerId		= dispatchLedgerId;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/selectOptionsWS/getVehicleTypeAutocomplete.do?', _this.renderUpdateLSVehicleType, EXECUTE_WITHOUT_ERROR);
			return _this;
		},renderUpdateLSVehicleType : function (response){
			console.log(response);
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			loadelement.push(baseHtml);
			$("#mainContent").load("/ivcargo/html/module/editLsVehicleType/editLSVehicleType.html",function() {
				baseHtml.resolve();
			});
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.vehicleTypeList,
					valueField		:	'vehicleTypeId',
					labelField		:	'name',
					searchField		:	'name',
					elementId		:	'vehicleTypeEle',
					create			: 	false,
					maxItems		: 	1
				});
				
				masterLangObj = FilePath.loadLanguage();
				masterLangKeySet = loadLanguageWithParams(masterLangObj);
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				
				myNod.add({
					selector: '#vehicleTypeEle',
					validate: 'validateAutocomplete:#vehicleTypeEle',
					errorMessage: 'Select proper Vehicle Type !'
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
			
			if(VehicleTypeIdCurr == Number($('#vehicleTypeEle').val())){
				showMessage('info', 'Please Enter other than current Vehicle Type');
				return false;
			}
			
			showLayer();
			var answer = confirm ("Are you Sure to Update LS Vehicle Type ?");
			if (answer){
				var jsonObject = new Object();
				
				jsonObject["vehicleTypeId"] 			= $('#vehicleTypeEle').val();
				jsonObject["dispatchLedgerId"] 			= dispatchLedgerId;
				jsonObject["redirectTo"]				= redirectTo;
				console.log('jsonObject ',jsonObject)
				getJSON(jsonObject, WEB_SERVICE_URL+'/editLSWS/editLSVehicleType.do', _this.setEditDestinationResponse, EXECUTE_WITH_ERROR);
			} else {
				hideLayer();
			}
		},setEditDestinationResponse : function(response) {
			if(response.message.typeName != undefined) {
				hideLayer();
				setTimeout(function(){redirectToAfterUpdate(response)}, 1500);
			}
			
			hideLayer();
		}
	});
});