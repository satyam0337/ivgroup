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
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/godownstock/godownstockfilepath.js'//FilePath
        //filepath is defined to get the language path from where should the language file should be loaded for label
        ,'jquerylingua'//import in require.config
        ,'language'//import in require.config
        ,'nodvalidation'//import in require.config
        ,'errorshow'//import in require.config
        ,'focusnavigation'//import in require.config
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/godownstock/loadgodownstockmodelurls.js'//ModelUrls
        ,PROJECT_IVUIRESOURCES+'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
        ,'autocompleteWrapper'//AutocompleteUtils
        ], function (Marionette, ElementModel,elementTemplateJs,ElementTemplate,FilePath,jquerylingua,Language,NodValidation
        		,Error,ElementFocusNavigation,ModelUrls,datePickerUI,AutocompleteUtils) {
	var 
	//global objects
	ElementModelArray='',
	deferred,
	_this;

	return Marionette.ItemView.extend({
		initialize: function() {
		},
		render: function(){
			//_this object is added because this object is not found in onRender function
			_this = this; 

			//this is the first method called when this function is called
			//triggerMethod onBeforeRender
			this.triggerMethod("before:render");
			//triggerMethod onRender
			this.triggerMethod("render");
			//triggerMethod onAfterRender
			this.triggerMethod("after:render");
		},

		onBeforeRender: function() {
			//code which needs to be rendered before render
		}, 
		onRender: function(){
			//this object is created to synchronize the flow when data is fetched from the method
			deferred = Marionette.Deferred();

			getJSON(null, WEB_SERVICE_URL+'/godownStockReportWS/getGodownStockElement.do', _this.setElements, EXECUTE_WITH_ERROR);

			return _this;
		},
		onAfterRender: function() {
			//code which needs to be rendered after render
		},setElements : function(response){
			ElementModelArray = ModelUrls.urlModelCollection(response);
			deferred.resolve();

			var executiveType = parseInt(response.executiveType);

			_.result(deferred, 'promise').then(function (target) {
				//elementtemplate.js
				//append value in template
				elementTemplateJs.appendElementInTemplate(ElementModelArray,ElementModel,ElementTemplate,_this);
				//focus navigation initiates through this function
				initialiseFocus();
				//load language is used to get the value of labels 
				var langObj = FilePath.loadLanguage();
				loadLanguageWithParams(langObj);

				var checkPresence = nod.checkFunctions.presence();
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector: '#regionSelectEle',
					validate: 'validateAutocomplete:#regionSelectEle_primary_key',
					errorMessage: 'Select proper Region'
				});

				myNod.add({
					selector: '#subRegionSelectEle',
					validate: 'validateAutocomplete:#subRegionSelectEle_primary_key',
					errorMessage: 'Select proper Sub Region'
				});

				myNod.add({
					selector: '#branchSelectEle',
					validate: 'validateAutocomplete:#branchSelectEle_primary_key',
					errorMessage: 'Select proper Branch'
				});

				myNod.add({
					selector: '#godownEle',
					validate: 'validateAutocomplete:#godownEle_primary_key',
					errorMessage: 'Select proper Godown'
				});

				//Based on Executive Type the WS will call and Data will Populate
				
				if(executiveType == EXECUTIVE_TYPE_GROUPADMIN) {
					getJSON(null, WEB_SERVICE_URL+'/selectOptionsWS/getRegionOption.do', _this.setRegions, EXECUTE_WITH_ERROR);
				}else if(executiveType == EXECUTIVE_TYPE_REGIONADMIN){
					getJSON(null, WEB_SERVICE_URL+'/selectOptionsWS/getSubRegionOption.do', _this.setSubRegions, EXECUTE_WITH_ERROR);
				} else if(executiveType == EXECUTIVE_TYPE_SUBREGIONADMIN){
					getJSON(null, WEB_SERVICE_URL+'/selectOptionsWS/getBranchOption.do', _this.setBranches, EXECUTE_WITH_ERROR);
				}else{
					getJSON(null, WEB_SERVICE_URL+'/godownStockReportWS/getGodownForGodownStock.do', _this.setGodown, EXECUTE_WITH_ERROR);
				}

				hideLayer();
			})
		},setRegions : function(jsonObj){
			var configuration = jsonObj.configuration;

			if(configuration.Region == 'true'){
				_this.setSubregionAutocompleteInstance();
				_this.setBranchesAutocompleteInstance();
				_this.setGodownAutocompleteInstance();
			}

			var autoRegionName = new Object();
			autoRegionName.url = jsonObj.region;
			autoRegionName.primary_key = 'regionId';
			autoRegionName.field = 'regionName';
			autoRegionName.callBack = _this.onRegionSelect;

			$("#regionSelectEle").autocompleteCustom(autoRegionName)
		},onRegionSelect : function(obj){
			var jsonArray = new Array();

			jsonArray.push('#subRegionSelectEle');
			jsonArray.push('#branchSelectEle');
			jsonArray.push('#godownEle');

			_this.resetAutcomplete(jsonArray);

			var jsonObject = new Object();
			var $inputs = $('#ElementDiv :input');
			$inputs.each(function (index){if($(this).val() != ""){jsonObject[$(this).attr('name')] = $.trim($(this).val());}});

			getJSON(jsonObject, WEB_SERVICE_URL+'/selectOptionsWS/getSubRegionOption.do', _this.setSubRegions, EXECUTE_WITH_ERROR);

		},setSubRegions : function(jsonObj){
			var configuration = jsonObj.configuration;

			if(configuration.Region == 'false'){
				_this.setSubregionAutocompleteInstance();
				_this.setBranchesAutocompleteInstance();
				_this.setGodownAutocompleteInstance();
			}

			var autoSubRegionName = $("#subRegionSelectEle").getInstance();

			$( autoSubRegionName ).each(function() {
				this.option.source = jsonObj.subRegion;
			})
		},onSubRegionSelect : function(obj){
			var jsonArray = new Array();

			jsonArray.push('#branchSelectEle');
			jsonArray.push('#godownEle');

			_this.resetAutcomplete(jsonArray);

			var jsonObject = new Object();
			var $inputs = $('#ElementDiv :input');
			$inputs.each(function (index){if($(this).val() != ""){jsonObject[$(this).attr('name')] = $.trim($(this).val());}});

			getJSON(jsonObject, WEB_SERVICE_URL+'/selectOptionsWS/getBranchOption.do', _this.setBranches, EXECUTE_WITH_ERROR);
		},setBranches : function(jsonObj){	
			var configuration = jsonObj.configuration;

			if(configuration.SubRegion == 'false'){
				_this.setBranchesAutocompleteInstance();
				_this.setGodownAutocompleteInstance();
			}

			var autoBranchName = $("#branchSelectEle").getInstance();
			$( autoBranchName ).each(function() {
				this.option.source = jsonObj.sourceBranch;	
				
				this.elem.combo_input.context.value = 'ALL';
				document.getElementById(this.elem.combo_input.context.id+'_primary_key').value = 0;
			})
		},setSubregionAutocompleteInstance:function(){
			var autoSubRegionName = new Object();

			autoSubRegionName.primary_key = 'subRegionId';
			autoSubRegionName.field = 'subRegionName';
			autoSubRegionName.callBack = _this.onSubRegionSelect;
			$("#subRegionSelectEle").autocompleteCustom(autoSubRegionName);
		},resetAutcomplete:function(jsonArray){
			for(var eleId in jsonArray){
				var elem = $(jsonArray[eleId]).getInstance();
				$( elem ).each(function() {
					this.elem.combo_input.context.value = '';
					$(this.elem.combo_input.context.id+'_primary_key').val("");
				})
			}
		},setBranchesAutocompleteInstance : function(){
			var autoBranchName = new Object();
			autoBranchName.primary_key = 'branchId';
			autoBranchName.field = 'branchName';
			autoBranchName.callBack = _this.onBranchSelect;

			$("#branchSelectEle").autocompleteCustom(autoBranchName)
		},setGodownAutocompleteInstance : function() {
			var autoGodownName = new Object();
			autoGodownName.primary_key = 'godownId';
			autoGodownName.field = 'name';

			$("#godownEle").autocompleteCustom(autoGodownName)
		},onBranchSelect : function(){
			var jsonArray = new Array();
			jsonArray.push('#godownEle');

			_this.resetAutcomplete(jsonArray);

			var jsonObject = new Object();
			var $inputs = $('#ElementDiv :input');
			$inputs.each(function (index){if($(this).val() != ""){jsonObject[$(this).attr('name')] = $.trim($(this).val());}});

			getJSON(jsonObject, WEB_SERVICE_URL+'/godownStockReportWS/getGodownForGodownStock.do', _this.setGodown, EXECUTE_WITH_ERROR);
		},setGodown : function(jsonObj){
			var configuration = jsonObj.configuration;

			if(configuration.SourceBranch == 'false'){
				_this.setGodownAutocompleteInstance();
			}
			var autoGodown = $("#godownEle").getInstance();
			$( autoGodown ).each(function() {
				this.option.source = jsonObj.GODOWN;
			})
		}
	});	
});