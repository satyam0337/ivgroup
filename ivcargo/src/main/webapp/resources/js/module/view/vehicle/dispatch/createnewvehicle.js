define([
		PROJECT_IVUIRESOURCES+'/resources/js/module/view/vehicle/dispatch/createnewvehicletype.js'
		,PROJECT_IVUIRESOURCES+'/resources/js/module/view/vehicle/dispatch/createnewvehicleagent.js'
		,'text!'+PROJECT_IVVIEWPAGES+'/template/elementtemplate.html'
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
], function (CreateVehicleType, CreateVehicleAgent, ElementTemplate, ElementModel, Elementtemplateutils) {
	'use strict';// this basically give strictness to this specific js
	let	_this = '',
	myNode,
	myNodeVehicleType,
	myNodeVehicleAgent,
	btVehicleTypeModalConfirm,
	btVehicleAgentModalConfirm,
	newVehicle,
	jsonObject,
	validateRegOwner = true,
	isNewVehicleNumberValidate = true,
	automaticSetVehicleOwnerType = false,
	allowAlphaNumericVehicleNo	= false,
	vehicleOwnerTypeName,
	vehicleOwnerTypeId,
	moduleId = 0;
	return Marionette.ItemView.extend({
		initialize: function(jsonObjectData){
			myNode		= jsonObjectData.node;
			newVehicle 	= jsonObjectData.newVehicle;
			moduleId 	= jsonObjectData.moduleId;
			_this 	= this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL+'/vehicleWS/getCreateVehicleElement.do', _this.setElements, EXECUTE_WITHOUT_ERROR);
		}, setElements : function(response){
			validateRegOwner			= response.validateRegOwner;
			automaticSetVehicleOwnerType= response.automaticSetVehicleOwnerType;
			vehicleOwnerTypeName 		= response.vehicleOwnerTypeName;
			vehicleOwnerTypeId 			= response.vehicleOwnerTypeId;
			isNewVehicleNumberValidate 	= response.isNewVehicleNumberValidate;
			allowAlphaNumericVehicleNo	= response.allowAlphaNumericVehicleNo;
			
			//elementtemplate.js
			//append value in template
			Elementtemplateutils.appendElementInTemplate(response.ElementModelArray, ElementModel, ElementTemplate, _this);
			//focus navigation initiates through this function
				
			setTimeout(_this.loadElements, 200);
		}, loadElements : function() {
			//load language is used to get the value of labels
			initialiseFocus('.modal-content');
			setTimeout(function(){document.getElementById('newVehicleNumberEle').focus()}, 100);
			$('#newVehicleNumberEle').val(newVehicle);
			// auto complete for owner types
			
			addAutocompleteElementInNode(myNode, 'vehicleOwnerEle', 'Select Proper Ownership');
			addAutocompleteElementInNode(myNode, 'vehicleTypeEle', 'Select Proper Vehicle Type');
			addAutocompleteElementInNode(myNode, 'vehicleAgentEle', 'Select Proper Vehicle Agent');
			
			if(validateRegOwner)
				addElementToCheckEmptyInNode(myNode, 'vehicleRegisteredOwnerEle', 'Cannot be left blank')
			
			if(isNewVehicleNumberValidate) {
				myNode.add({
					selector: '#newVehicleNumberEle',
					validate: function (callback, value) {
					callback(_this.validateVehicleNumber(value));
				},
					errorMessage: 'Invalid Vehicle Number'
				});
			}
			
			myNode.add({
				selector: '#vehicleAgentPanNoEle',
				validate: function (callback, value) {
					callback(_this.validatePanNumber(value));
				},
				errorMessage: 'Invalid Pan Number'
			});
			
			let ownertypeauto			= Object();
			ownertypeauto.url			= WEB_SERVICE_URL+'/vehicleWS/getVehicleOwnerType.do';
			ownertypeauto.field			= 'vehicleOwnerType';
			ownertypeauto.primary_key	= 'vehicleOwner';
			$( '#vehicleOwnerEle').autocompleteCustom(ownertypeauto);
			
			if(automaticSetVehicleOwnerType) {
				$('#vehicleOwnerEle').val(vehicleOwnerTypeName);
				$('#vehicleOwnerEle_primary_key').val(vehicleOwnerTypeId);
			}
			
			// auto complete for vehicle types 
			let vehicletypeauto 			= Object();
			vehicletypeauto.url				= WEB_SERVICE_URL+'/vehicleTypeWS/getVehicleType.do';
			vehicletypeauto.field			= 'name'; // response variable from WS
			vehicletypeauto.primary_key		= 'vehicleTypeId';
			vehicletypeauto.blurFunction	= _this.checkForNewVehicleType;
			$( '#vehicleTypeEle' ).autocompleteCustom(vehicletypeauto);
			
			// auto complete for vehicle agent 
			let vehicleagentauto 			= Object();
			vehicleagentauto.url			= WEB_SERVICE_URL+'/vehicleAgentMasterWS/getVehicleAgentForDropDown.do';
			vehicleagentauto.field			= 'name'; // response variable from WS
			vehicleagentauto.primary_key	= 'vehicleAgentMasterId';
			vehicleagentauto.blurFunction	= _this.checkForNewAgent;
			$( '#vehicleAgentEle' ).autocompleteCustom(vehicleagentauto);
			
			$('.modal-body:last *:input[type!=hidden]:first').focus();
			//validate: _this.validateVehicleNumber,
		}, validateVehicleNumber : function(value) {
			let reg = null;
			
			if(allowAlphaNumericVehicleNo)
				reg = VEHICLE_NUMBER_FORMAT_5;
			else if(value.length == 12)
				reg = VEHICLE_NUMBER_FORMAT_1;
			else if(value.length == 8)
				reg = VEHICLE_NUMBER_FORMAT_2;
			else if(value.length == 7)
				reg = VEHICLE_NUMBER_FORMAT_3;
			else if(value.length == 13)
				reg = VEHICLE_NUMBER_FORMAT_4;
			else
				return false;
				
			return value.match(reg);
		}, validatePanNumber : function(value) {
			if(value.length != 10)
				return false;
				
			return value.match(PAN_NUMBER_FORMAT);
		}, checkForNewVehicleType : function() {
			let vehicleTypeValue 		= $('#'+$(this).attr('id')+'_primary_key').val();
			let vehicleTypeValueString	= $("#vehicleTypeEle").val();
			
			if (vehicleTypeValue == "" && vehicleTypeValueString.length > 0) {
				let btModalConfirm = new Backbone.BootstrapModal({
					content			: "Vehicle Type Not Present In Record. Do Want You To Create New?",
					modalWidth 		: 30,
					title			: 'New Vehicle Type',
					okText			: 'YES',
					showFooter 		: true,
					okCloses		: true,
					
				}).open();
				
				btModalConfirm.on('ok', function() {
					let jsonObjectData	= new Object();
					myNodeVehicleType 	= nod();
					jsonObjectData.node	= myNodeVehicleType;
					
					btVehicleTypeModalConfirm = new Backbone.BootstrapModal({
						modalId			: 'newVehicleType',
						content			: new CreateVehicleType(jsonObjectData),
						modalWidth 		: 50,
						title			: 'New Vehicle Type',
						okText			: 'SAVE',
						showFooter 		: true,
						okCloses		: false,
						focusOk			: true
					}).open();
					
					setTimeout(() => {
						$('#vehicleTypeNameEle').focus();
					}, 500);
					
					setTimeout(() => {
						$('#vehicleTypeNameEle').keyup(function(){
							if(Number($('#vehicleTypeNameEle').val()!= null)) {
								next ='vehicleTypeCapacityEle';
							}
						});
					}, 500);
					
					setTimeout(() => {
						$('#vehicleTypeCapacityEle').focus(function(){
							next ='okbtn';
						});
					}, 500);
					
					btVehicleTypeModalConfirm.on('ok', function() {
						myNodeVehicleType.performCheck();
						
						if(myNodeVehicleType.areAll('valid')){
							let jsonDataObject	= new Object();
							let $inputs = $('#newVehicleType :input');
							//this will iterate all elements and will set the name as key and value of Element as value in jsonObject
							$inputs.each(function (){if($(this).val() != ""){jsonDataObject[$(this).attr('name')] = $.trim($(this).val());}});
							jsonDataObject.moduleId = moduleId;
							getJSON(jsonDataObject, WEB_SERVICE_URL+'/vehicleTypeWS/saveVehicleType.do', _this.onSaveVehicleType, EXECUTE_WITHOUT_ERROR); //submit JSON
						}
					});				
				});				
				$("#vehicleTypeEle").val("");
			}
		}, onSaveVehicleType : function() {
			btVehicleTypeModalConfirm.close();
		}, checkForNewAgent : function() {
			let vehicleAgentValue 			= $('#'+$(this).attr('id')+'_primary_key').val();
			let vehicleAgentValueString 	= $("#vehicleAgentEle").val();
			let vehicleOwnerValue			= $("#vehicleOwnerEle_primary_key").val();
			
			if(vehicleOwnerValue <= 0) {
				showMessage('error', "Please Select Vehicle Owner First !");
				return false;
			}
			
			if (vehicleAgentValue == "" && vehicleAgentValueString.length > 0) {
				let btModalConfirm = new Backbone.BootstrapModal({
					content: "Vehicle Agent Not Present In Record. Do You Want To Create New?",
					modalWidth : 30,
					title:'New Vehicle Agent',
					okText:'YES',
					showFooter : true,
					okCloses:false,
					focusOk:true
				}).open();
				
				btModalConfirm.on('ok', function() {
					let jsonObjectData	= new Object();
					myNodeVehicleAgent = nod();
					jsonObjectData.node	= myNodeVehicleAgent;
					btVehicleAgentModalConfirm = new Backbone.BootstrapModal({
						modalId			: 'newVehicleAgent',
						content			: new CreateVehicleAgent(jsonObjectData),
						modalWidth 		: 50,
						title			: 'New Vehicle Agent',
						okText			: 'SAVE',
						showFooter 		: true,
						okCloses		: false,
						focusOk			: false
					}).open();
					
					setTimeout(() => {
						$('#vehicleAgentNameEle').focus();
					}, 500);
					
					setTimeout(() => {
						$('#vehicleAgentNameEle').keyup(function(){
							if(Number($('#vehicleAgentNameEle').val()!= null)) {
								next ='vehicleAgentPanNoEle';
							} 
						});
					}, 500);
					
					setTimeout(() => {
						$('#vehicleAgentPanNoEle').keyup(function(){
							if(Number($('#vehicleAgentPanNoEle').val()!= null)) {
								next ='vehicleAgentAddressEle';
							} 
						});
					}, 500);
					
					setTimeout(() => {
						$('#vehicleAgentAddressEle').focus(function(){
							next ='okbtn';
						});
					}, 500);
					
					btVehicleAgentModalConfirm.on('ok', function() {
						myNodeVehicleAgent.performCheck();
						
						if(myNodeVehicleAgent.areAll('valid')){
							let jsonDataObject	= new Object();
							jsonDataObject.vehicleOwner		=  $('#vehicleOwnerEle_primary_key').val();
							jsonDataObject.moduleId 		= moduleId;
							
							let $inputs = $('#newVehicleAgent :input');
							//this will iterate all elements and will set the name as key and value of Element as value in jsonObject
							$inputs.each(function (){if($(this).val() != ""){jsonDataObject[$(this).attr('name')] = $.trim($(this).val());}});
							getJSON(jsonDataObject, WEB_SERVICE_URL+'/vehicleAgentMasterWS/saveVehicleAgent.do', _this.onSaveVehicleAgent, EXECUTE_WITHOUT_ERROR); //submit JSON
							btModalConfirm.close();
						}
					});				
				});				
				$("#vehicleAgentEle").val("");
			}
		}, onSaveVehicleAgent : function() {
			btVehicleAgentModalConfirm.close();
		}
	});
});