/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define([
        'marionette'//Marionette
        //marionette JS framework
        ,'elementmodel'//ElementModel
        //Elementmodel consist of default values which is passed when setting it in template
        ,'elementTemplateJs'//elementTemplateJs
        //elementtemplate is javascript utility which consist of functions that operate on elements
        ,'text!'+PROJECT_IVVIEWPAGES+'/template/elementtemplate.html'
        //text! is used to convert the html to plain text which helps to fetch HTML through require
        //template for element
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/dispatchfilepath.js'//FilePath
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/loaddispatchmodelurls.js'//ModelUrls
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/dispatchdetails.js'
        //filepath is defined to get the language path from where should the language file should be loaded for label
        ,'jquerylingua'//import in require.config
        ,'language'//import in require.config
        ,'nodvalidation'//import in require.config
        ,'validation'//import in require.config
        ,'errorshow'//import in require.config
        ,'focusnavigation'//import in require.config
        ,'JsonUtility'
        ,'messageUtility'
        ,PROJECT_IVUIRESOURCES+'/js/element/elementoperation.js'
        ], function (Marionette, ElementModel, elementTemplateJs, ElementTemplate, FilePath, ModelUrls, DispatchDetails) {
	var slickData, lsPropertyConfig,
	lorryHireDetails,
	lorryHireMessage,
	_this;
	return Marionette.ItemView.extend({
		initialize: function(data) {
			slickData				= data.slickData;
			lsPropertyConfig		= data.lsPropertyConfig;
			_this 					= this;
		},
		render: function(){
			//this is the first method called when this function is called
			//triggerMethod onBeforeRender
			this.triggerMethod("before:render");
			//triggerMethod onRender
			this.triggerMethod("render");
			//triggerMethod onAfterRender
			this.triggerMethod("after:render");
		},

		onBeforeRender: function() {}, 
		onRender: function(){
			_this.setElements();
			return _this;
		},
		onAfterRender: function() {},
		setElements : function(){
			var lorryHireModelArr	= ModelUrls.setLorryHireNumber(lsPropertyConfig);
			
			elementTemplateJs.appendElementInTemplate(lorryHireModelArr, ElementModel, ElementTemplate, _this);			
			
			//append value in template
			setTimeout(_this.executeFunctions,200);
		},executeFunctions:function(){
			initialiseFocus('#lorryHireModelBody');
			
			//load language is used to get the value of labels 
			var langObj 	= FilePath.loadLanguage();
			loadLanguageWithParams(langObj);
			
			$(".ok").on('click', function() {
				$("#vehicleTypeDetails").remove();
				
				if($('#lorryHireNumberEle').val() == '') {
					changeTextFieldColor('lorryHireNumberEle', '', '', 'red');
					showMessage('error', truckEngagementSlipNumErrMsg);
					return false;
				}
				
				_this.getVehicleDetails();
				
				hideLayer();
			});
		}, getVehicleDetails:function() {
			var jsonDataObject		= new Object();
			
			jsonDataObject.lorryHireNumber		= getValueFromInputField('lorryHireNumberEle');
			
			getJSON(jsonDataObject, WEB_SERVICE_URL+'/LorryHireWS/getLorryHireDetailsByLorryHireNumberForDispatch.do', _this.setLorryHireDetails, EXECUTE_WITHOUT_ERROR); //submit JSON
			showLayer();
		}, setLorryHireDetails : function(response) {
			if(response.message != undefined) {
				hideLayer();
				$("#vehicleTypeDetails").remove();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}
			
			lorryHireDetails		= response.lorryHire;
			lorryHireMessage		= response.lorryHireMessage;
			
			if(lorryHireDetails != undefined) {
				$('#lorryHireIdEle').val(lorryHireDetails.lorryHireId);
				$('#lhpvIdEle').val(lorryHireDetails.lHPVId);
				$('#lhpvNumberEle').val(lorryHireDetails.lHPVNo);
				$('#lhpvBranchIdEle').val(lorryHireDetails.lHPVBranchId);
				$('#vehicleTypeEle').val(lorryHireDetails.vehicleTypeName);
				$('#vehicleAgentEle').val(lorryHireDetails.driverMobileNo);
				
				if(lorryHireMessage == undefined) {
					lorryHireMessage	= '';
				}
				
				var vehicleTypeDetails	= '<b>' + lorryHireDetails.vehicleNumber + ' - ' + lorryHireDetails.vehicleOwner + ' - ' + lorryHireDetails.vehicleTypeName + ' ( ' + lorryHireDetails.capacity + ' ) ' + lorryHireMessage + '</b>';
				$("#lorryHireNumberRegion").append("<div id='vehicleTypeDetails'>" + vehicleTypeDetails + "</div>");
			}
			
			_this.openDispatchWindow(response);
			
			hideLayer();
		}, openDispatchWindow : function(response) {
			if(response.lorryHireMessage == undefined) {
				var object 			= new Object();
			
				object.slickData 				= slickData;
				object.lorryHireData			= lorryHireDetails;
				object.lorryHireMessage			= lorryHireMessage;
				object.lsPropertyConfig			= lsPropertyConfig;
				
				var btModal = new Backbone.BootstrapModal({
					content			: 	new DispatchDetails(object),
					modalWidth 		: 	90,
					title			:	'Truck Information',
					okText			:	'Dispatch',
					showFooter 		: 	true,
					okCloses		:	false,
					focusOk			:	false
				}).open();
			} else {
				showMessage('info', response.lorryHireMessage);
			}
		}
	});	
});
