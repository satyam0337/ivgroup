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
	var	_this = '',
	myNodeDriver,
	jsonObject;
	return Marionette.ItemView.extend({
		initialize: function(jsonObjectData){
			myNodeDriver	= jsonObjectData.node;
			_this 			= this;
		}, render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL+'/driverWS/getCreateDriverElementConfiguration.do', _this.setElements, EXECUTE_WITHOUT_ERROR);
		}, setElements : function(response) {
			//elementtemplate.js
			//append value in template
			Elementtemplateutils.appendElementInTemplate(response.ElementModelArray, ElementModel, ElementTemplate, _this);
			//focus navigation initiates through this function
			setTimeout(_this.loadElements, 200);
		}, loadElements : function() {
			initialiseFocus('.modal-body');
			
			addElementToCheckEmptyInNode(myNodeDriver, 'newDriverNameEle', 'Cannot be left blank')
			addElementToCheckEmptyInNode(myNodeDriver, 'newDriverLicenceNumberEle', 'Cannot be left blank')
			addElementToCheckEmptyInNode(myNodeDriver, 'newDriverAddressEle', 'Cannot be left blank')
			addElementToCheckNumericInNode(myNodeDriver, 'newDriverMobileNumber', 'Should be numeric')
			addElementToCheckLength10InNode(myNodeDriver, 'newDriverMobileNumber', 'Please provide valid Mob No.')
			
			$('.modal-body:last *:input[type!=hidden]:first').focus();
		}
	});
});

