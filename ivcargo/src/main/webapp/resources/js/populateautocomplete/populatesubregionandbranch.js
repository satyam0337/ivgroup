/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define([
        ,'autocompleteWrapper',//JqueryComboBox
        ,'JsonUtility'//JsonUtility
        ,'messageUtility'//MessageUtility
        ], function (JqueryComboBox,JsonUtility,MessageUtility) {
	'use strict'
	var _this,
	responseData,
	$branchSelect,
	configuration,
	sourceConfig,
	sourceResponseData;
	return {
		setSubregionAndBranch:function(elemData){
			/*
			 * Parameters
			 * url : Web Service URL for collection of Area and Branch
			 * areaElementId : Area ElementId default "#areaSelectEle"
			 * branchElementId : Branch ElementId default "#branchSelectEle"
			 * areaParameter : Value fetched from Web Service of Area Element default "areaCollection"
			 * branchParameter : Value fetched from Web Service of Branch Element default "branchCollection"
			 * areaPrimaryKey : Value fetched from Web Service as a key of each object and set as primary key / hidden id of Sub-region Element DTO name default "subRegionId"
			 * areaFieldName : Value fetched from Web Service as a key of each object and set as primary name / value of Sub-region Element DTO name default "subRegionName"
			 * branchPrimaryKey : Value fetched from Web Service as a key of each object and set as primary key / hidden id of Branch Element DTO name default "branchId"
			 * branchFieldName : Value fetched from Web Service as a key of each object and set as primary name / value of Branch Element DTO name default "branchName"
			 */

			_this = this;
			configuration = new Object();

			if(elemData != undefined && elemData.url != undefined){
				configuration.url = elemData.url;
			}

			if(elemData != undefined && elemData.showsubregion != undefined){
				configuration.showsubregion = elemData.showsubregion;
			}

			configuration.crossingAgentElement	= '#crossingAgentSelectEle';
			configuration.crossingPrimaryKey 	= 'crossingAgentMasterId';
			configuration.crossingFieldName 	= 'name';
			configuration.areaElementId 		= '#areaSelectEle';
			configuration.branchElementId 		= '#branchSelectEle';
			configuration.areaParameter 		= 'areaCollection';
			configuration.crossingAgent			= 'crossingAgents';
			configuration.areaPrimaryKey 		= 'subRegionId';
			configuration.areaFieldName 		= 'subRegionName';
			configuration.branchParameter 		= 'branchCollection';
			configuration.branchPrimaryKey 		= 'branchId';
			configuration.branchDependentId 	= 'branchSubregionId';
			configuration.branchFieldName 		= 'branchName';

			configuration = $.extend(configuration,elemData);
			
			var jsonObject = new Object();
			
			if(elemData != undefined && elemData.sourceBranchId != undefined){
				jsonObject["sourceBranchId"] = elemData.sourceBranchId;
			}

			getJSON(jsonObject, configuration.url, _this.setSourceAndDestinationCombobox, EXECUTE_WITH_ERROR);

		},setSourceAndDestinationCombobox:function(response){
			hideLayer();
			responseData = response;
			var auto = new Object();
			auto.url = responseData[configuration.areaParameter];
			auto.primary_key = configuration.areaPrimaryKey;
			auto.field = configuration.areaFieldName;
			auto.callBack = _this.onSubRegionSelect;
			
			var areCheck = 	$(configuration.areaElementId).getInstance();
			if(typeof areCheck != undefined && areCheck.length>0){
				areCheck.setSourceToAutoComplete(auto.url);
			}else{
				$(configuration.areaElementId).autocompleteCustom(auto);
			}

			var auto = new Object();
			auto.primary_key = configuration.branchPrimaryKey;
			auto.field = configuration.branchFieldName;
			
			var branchCheck = $(configuration.branchElementId).getInstance();
			if(typeof branchCheck != undefined && branchCheck.length > 0){
				branchCheck.setSourceToAutoComplete(configuration.url);
			}else{
				$(configuration.branchElementId).autocompleteCustom(auto);
			}
			
			if(configuration.showsubregion != undefined && (configuration.showsubregion == 'false' || configuration.showsubregion == false)) {
				_this.onSubRegionSelect(response);
			}
			
			_this.setCrossingAgentBox(response);
			
		},onSubRegionSelect:function (data){
			var setElementData = new Object();

			var selectedArea =  $('#'+$(this).attr('id')+'_primary_key').val();

			setElementData.dataCollection 		= responseData[configuration.branchParameter];
			setElementData.instanceElementId 	= configuration.branchElementId;
			setElementData.dependentId 			= configuration.branchDependentId;
			setElementData.equateValue 			= selectedArea;
			setElementData.primaryKey 			= configuration.branchPrimaryKey;
			setElementData.fieldName 			= configuration.branchFieldName;
			setElementData.showAllBranch 		= false;
			
			if(configuration.showsubregion != undefined && (configuration.showsubregion == 'false' || configuration.showsubregion == false)) {
				setElementData.showAllBranch = true;
			}

			setSpecificDataToElement(setElementData);
		},setSubregionAndBranchWithMultipleBranches:function(elemData){
			/*
			 * Parameters
			 * url : Web Service URL for collection of Area and Branch
			 * areaElementId : Area ElementId default "#areaSelectEle"
			 * branchElementId : Branch ElementId default "#branchSelectEle"
			 * areaParameter : Value fetched from Web Service of Area Element default "areaCollection"
			 * branchParameter : Value fetched from Web Service of Branch Element default "branchCollection"
			 * areaPrimaryKey : Value fetched from Web Service as a key of each object and set as primary key / hidden id of Sub-region Element DTO name default "subRegionId"
			 * areaFieldName : Value fetched from Web Service as a key of each object and set as primary name / value of Sub-region Element DTO name default "subRegionName"
			 * branchPrimaryKey : Value fetched from Web Service as a key of each object and set as primary key / hidden id of Branch Element DTO name default "branchId"
			 * branchFieldName : Value fetched from Web Service as a key of each object and set as primary name / value of Branch Element DTO name default "branchName"
			 */

			_this = this;
			configuration = new Object();

			if(elemData != undefined && elemData.url != undefined){
				configuration.url = elemData.url;
			}

			if(elemData != undefined && elemData.areaElementId != undefined){
				configuration.areaElementId = elemData.areaElementId;
			}else{
				configuration.areaElementId = '#areaSelectEle'
			}

			if(elemData != undefined && elemData.branchElementId != undefined){
				configuration.branchElementId = elemData.branchElementId;
			}else{
				configuration.branchElementId = '#branchSelectEle';
			}
			if(elemData != undefined && elemData.areaParameter != undefined){
				configuration.areaParameter = elemData.areaParameter;
			}else{
				configuration.areaParameter = 'areaCollection';
			}
			if(elemData != undefined && elemData.areaPrimaryKey != undefined){
				configuration.areaPrimaryKey = elemData.areaPrimaryKey;
			}else{
				configuration.areaPrimaryKey = 'subRegionId';
			}
			if(elemData != undefined && elemData.areaFieldName != undefined){
				configuration.areaFieldName = elemData.areaFieldName;
			}else{
				configuration.areaFieldName = 'subRegionName';
			}
			if(elemData != undefined && elemData.branchParameter != undefined){
				configuration.branchParameter = elemData.branchParameter;
			}else{
				configuration.branchParameter = 'branchCollection';
			}
			if(elemData != undefined && elemData.branchPrimaryKey != undefined){
				configuration.branchPrimaryKey = elemData.branchPrimaryKey;
			}else{
				configuration.branchPrimaryKey = 'branchId';
			}
			if(elemData != undefined && elemData.branchDependentId != undefined){
				configuration.branchDependentId = elemData.branchDependentId;
			}else{
				configuration.branchDependentId = 'branchSubregionId';
			}
			if(elemData != undefined && elemData.branchFieldName != undefined){
				configuration.branchFieldName = elemData.branchFieldName;
			}else{
				configuration.branchFieldName = 'branchName';
			}

			getJSON(null, configuration.url, _this.setSourceAndDestinationComboboxForMultipleBranches, EXECUTE_WITH_ERROR);

		}, setSourceAndDestinationComboboxForMultipleBranches : function(response) {
			hideLayer();
			responseData = response;
			
			var auto = new Object();
			auto.valueField = configuration.areaPrimaryKey;
			auto.labelField = configuration.areaFieldName;
			auto.searchField = configuration.areaFieldName;
			auto.options = responseData[configuration.areaParameter];
			auto.onChange = _this.onSubRegionSelectForMultipleBranches;
			
			if(responseData.allowMultipleSubregionSelection != undefined && responseData.allowMultipleSubregionSelection == true)
				auto.maxItems	= (responseData[configuration.areaParameter]).length;
			
			auto.create = false;

			$(configuration.areaElementId).selectize(auto);

			var auto = new Object();
			auto.valueField = configuration.branchPrimaryKey;
			auto.plugins = ['remove_button'];
			auto.labelField = configuration.branchFieldName;
			auto.searchField = configuration.branchFieldName;
			auto.maxItems= null;
			auto.create = false;
			auto.options = responseData[configuration.branchParameter];
			$branchSelect = $(configuration.branchElementId).selectize(auto);

		}, onSubRegionSelectForMultipleBranches : function(value) {
			var dataCollection = responseData[configuration.branchParameter];
			var resultArr = new Array(); 
			
			if(responseData.allowMultipleSubregionSelection != undefined && responseData.allowMultipleSubregionSelection == true){
				var arr = new Array();
				
				for(var k = 0; k < value.length; k++) {
					arr.push(parseInt(value[k]));
				}
				
				for(var i = 0; i < dataCollection.length; i++) {
					if(arr.includes(parseInt(dataCollection[i][configuration.branchDependentId])))
						resultArr.push(dataCollection[i]);
				}
			} else {
				for(var i = 0; i < dataCollection.length; i++) {
					if(parseInt(dataCollection[i][configuration.branchDependentId]) == parseInt(value))
						resultArr.push(dataCollection[i]);
				}	
			}	

			var control = $branchSelect[0].selectize;
			control.clear();
			control.clearOptions();
			control.addOption(resultArr)
			
			if(value == -1){
				var controls = $branchSelect[0].selectize;
				controls.addItem(-1,false);
			}
		},setSourceSubregionAndBranch:function(elemData){
			/*
			 * Parameters
			 * url : Web Service URL for collection of Area and Branch
			 * areaElementId : Area ElementId default "#areaSelectEle"
			 * branchElementId : Branch ElementId default "#branchSelectEle"
			 * areaParameter : Value fetched from Web Service of Area Element default "areaCollection"
			 * branchParameter : Value fetched from Web Service of Branch Element default "branchCollection"
			 * areaPrimaryKey : Value fetched from Web Service as a key of each object and set as primary key / hidden id of Sub-region Element DTO name default "subRegionId"
			 * areaFieldName : Value fetched from Web Service as a key of each object and set as primary name / value of Sub-region Element DTO name default "subRegionName"
			 * branchPrimaryKey : Value fetched from Web Service as a key of each object and set as primary key / hidden id of Branch Element DTO name default "branchId"
			 * branchFieldName : Value fetched from Web Service as a key of each object and set as primary name / value of Branch Element DTO name default "branchName"
			 */

			_this = this;
			sourceConfig = new Object();

			if(elemData != undefined && elemData.url != undefined){
				sourceConfig.url = elemData.url;
			}

			sourceConfig.areaElementId = '#sourceSubRegionSelectEle'
			sourceConfig.branchElementId = '#sourceSelectEle';
			sourceConfig.areaParameter = 'sourceAreaCollection';
			sourceConfig.areaPrimaryKey = 'subRegionId';
			sourceConfig.areaFieldName = 'subRegionName';
			sourceConfig.branchParameter = 'sourceBranchCollection';
			sourceConfig.branchPrimaryKey = 'branchId';
			sourceConfig.branchDependentId = 'branchSubregionId';
			sourceConfig.branchFieldName = 'branchName';
			
			sourceConfig = $.extend(sourceConfig,elemData);

			getJSON(null, sourceConfig.url, _this.setSourceSubregionAndBranchCombobox, EXECUTE_WITH_ERROR);

		},setSourceSubregionAndBranchCombobox : function(response) {
			hideLayer();
			sourceResponseData = response;

			var auto = new Object();
			auto.url = sourceResponseData[sourceConfig.areaParameter];
			auto.primary_key = sourceConfig.areaPrimaryKey;
			auto.field = sourceConfig.areaFieldName;
			auto.callBack = _this.onSourceSubRegionSelect;

			
			$(sourceConfig.areaElementId).autocompleteCustom(auto);

			var auto = new Object();
			auto.primary_key = sourceConfig.branchPrimaryKey;
			auto.field = sourceConfig.branchFieldName;
			auto.callBack = _this.onSourceBranchSelect;
			$(sourceConfig.branchElementId).autocompleteCustom(auto);
			
		},onSourceSubRegionSelect:function (data){
			var setElementData = new Object();

			var selectedArea =  $('#'+$(this).attr('id')+'_primary_key').val();

			setElementData.dataCollection = sourceResponseData[sourceConfig.branchParameter];
			setElementData.instanceElementId = sourceConfig.branchElementId;
			setElementData.dependentId = sourceConfig.branchDependentId;
			setElementData.equateValue = selectedArea;

			setSpecificDataToElement(setElementData);

			var areaCheck = $(configuration.areaElementId).getInstance();
			if(typeof areaCheck != undefined && areaCheck.length > 0){
				areaCheck.setSourceToAutoComplete({});
			}
			
			var branchCheck = $(configuration.branchElementId).getInstance();
			if(typeof branchCheck != undefined && branchCheck.length > 0){
				branchCheck.setSourceToAutoComplete({});
			}

		},onSourceBranchSelect:function () {
			var branchAreaAutoComplete = new Object();
			branchAreaAutoComplete.url = WEB_SERVICE_URL+'/dispatchWs/getPendingDispatchArea.do';
			branchAreaAutoComplete.sourceBranchId = $('#sourceSelectEle_primary_key').val();
			//populatesubregionandbranch.js
			_this.setSubregionAndBranch(branchAreaAutoComplete);
		},setCrossingAgentBox : function(response) {
			hideLayer();
			responseData = response;
		
			_this.setDestinationAreaAutocompleteInstance();
			
			var auto = new Object();
			auto.url 				= responseData[configuration.crossingAgent];
			auto.primary_key 		= configuration.crossingPrimaryKey;
			auto.field 				= configuration.crossingFieldName;
			auto.callBack 			= _this.onCrossingAgentSelect;
			
			$(configuration.crossingAgentElement).autocompleteCustom(auto);

		}, onCrossingAgentSelect : function (data) {
			var jsonArray 	= new Array();

			jsonArray.push('#destinationAreaEle');

			_this.resetAutcomplete(jsonArray);

			var jsonObject 	= new Object();
			
			jsonObject.crossingAgentId	= getValueFromInputField('crossingAgentSelectEle_primary_key');
			jsonObject.showAllOptionInCrossingAgentDestinationArea	= responseData.showAllOptionInCrossingAgentDestinationArea;
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/crossingDispatchWS/getCrossingAgentBranchIds.do', _this.setDestinationArea, EXECUTE_WITH_ERROR);
		}, setDestinationArea : function(jsonObj) {	
			var autoBranchName = $("#destinationAreaEle").getInstance();
			
			$('#agentDestinationAreaEle').val(jsonObj.crossingAgentBranchIds);
			
			$( autoBranchName ).each(function() {
				this.option.source = jsonObj.crossingAgentBranchArr;
			})
		}, setDestinationAreaAutocompleteInstance : function() {
			var autoBranchName 			= new Object();
			autoBranchName.primary_key 	= 'destinationBranches';
			autoBranchName.field 		= 'destinationBranchName';

			$("#destinationAreaEle").autocompleteCustom(autoBranchName);
		}, 
		resetAutcomplete:function(jsonArray) {
			for(var eleId in jsonArray) {
				var elem = $(jsonArray[eleId]).getInstance();
				$( elem ).each(function() {
					this.elem.combo_input.context.value = '';
					$(this.elem.combo_input.context.id + '_primary_key').val("");
				}) 
			}
		}
	}
});
