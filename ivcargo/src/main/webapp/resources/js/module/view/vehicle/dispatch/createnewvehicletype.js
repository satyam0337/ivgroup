define([
		'text!'+PROJECT_IVVIEWPAGES+'/template/elementtemplate.html'
		,'elementmodel'
		,'elementTemplateJs'
		,'nodvalidation'//import in require.config
		,'validation'//import in require.config
		,'errorshow'
		,'JsonUtility'
		,'messageUtility'
		,'constant'
		,'autocomplete'
		,'autocompleteWrapper'
		,'focusnavigation'
], function (ElementTemplate, ElementModel, Elementtemplateutils) {
	'use strict';// this basically give strictness to this specific js
	let	_this = '',
	myNodeVehicleType,
	jsonObject;
	return Marionette.ItemView.extend({
		initialize: function(jsonObjectData){
			myNodeVehicleType	= jsonObjectData.node;
			_this 	= this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL+'/vehicleTypeWS/getCreateVehicleTypeElementConfiguration.do', _this.setElements, EXECUTE_WITHOUT_ERROR);
		}, setElements : function(response) {
			//elementtemplate.js
			//append value in template
			Elementtemplateutils.appendElementInTemplate(response.ElementModelArray, ElementModel, ElementTemplate, _this);
			//focus navigation initiates through this function
			initialiseFocus();
			setTimeout(_this.loadElements, 200);
		}, loadElements : function() {
			addElementToCheckEmptyInNode(myNodeVehicleType, 'vehicleTypeNameEle', 'Cannot be left blank')
			addElementToCheckEmptyInNode(myNodeVehicleType, 'vehicleTypeCapacityEle', 'Cannot be left blank')
			addElementToCheckFloatInNode(myNodeVehicleType, 'vehicleTypeCapacityEle', 'Please Enter Only Numbers')
			
			$('#modalBody:last *:input[type!=hidden]:first').focus();
		}
	});
});