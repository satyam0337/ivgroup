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
	myNodeVehicleAgent,
	jsonObject,
	vehicleAgentPanNumber = true;
	return Marionette.ItemView.extend({
		initialize: function(jsonObjectData) {
			myNodeVehicleAgent	= jsonObjectData.node;
			_this 	= this;
		}, render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL+'/vehicleAgentMasterWS/getCreateVehicleAgentElementConfiguration.do', _this.setElements, EXECUTE_WITHOUT_ERROR);
		}, setElements : function(response){
			vehicleAgentPanNumber	 = response.validateVehicleAgentPanNumber;

			//elementtemplate.js
			//append value in template
			Elementtemplateutils.appendElementInTemplate(response.ElementModelArray, ElementModel, ElementTemplate, _this);
			//focus navigation initiates through this function
			initialiseFocus();
			setTimeout(_this.loadElements, 200);
		}, loadElements : function() {
			addElementToCheckEmptyInNode(myNodeVehicleAgent, 'vehicleAgentNameEle', 'Cannot be left blank')
			addElementToCheckEmptyInNode(myNodeVehicleAgent, 'vehicleAgentAddressEle', 'Cannot be left blank')

			if(vehicleAgentPanNumber)
				addElementToCheckEmptyInNode(myNodeVehicleAgent, 'vehicleAgentPanNoEle', 'Cannot be left blank')
		}
	});
});