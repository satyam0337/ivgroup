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
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatchdestinationwisesummary/dispatchdestinationwisesummaryfilepath.js'//FilePath
        //filepath is defined to get the language path from where should the language file should be loaded for label
        ,'jquerylingua'//import in require.config
        ,'language'//import in require.config
        ,'nodvalidation'//import in require.config
        ,'errorshow'//import in require.config
        ,'focusnavigation'//import in require.config
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatchdestinationwisesummary/loaddispatchdestinationwisesummarymodelurls.js'//ModelUrls
        ,PROJECT_IVUIRESOURCES+'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
        ,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/populateregionsubregionandbranch.js'
        ,'autocompleteWrapper'//AutocompleteUtils
        ], function (Marionette, ElementModel,elementTemplateJs,ElementTemplate,FilePath,jquerylingua,Language,NodValidation
        		,Error,ElementFocusNavigation,ModelUrls,datePickerUI,CommonSelect,AutocompleteUtils) {
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
			
			getJSON(null, WEB_SERVICE_URL+'/destinationWiseDispatchSummaryReportWS2/getDestinationWiseDispatchSummaryElement.do', _this.setElements, EXECUTE_WITH_ERROR);

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
					selector: '#destSubRegionSelectEle',
					validate: 'validateAutocomplete:#destSubRegionSelectEle_primary_key',
					errorMessage: 'Select proper Dest Sub Region'
				});
				myNod.add({
					selector: '#destBranchSelectEle',
					validate: 'validateAutocomplete:#destBranchSelectEle_primary_key',
					errorMessage: 'Select proper Dest Branch'
				});

				/*$("#dateEle").DatePickerCus({});*/
				var options		= new Object();

				if(typeof minDateFromProperty !== "undefined")
					options.minDate	= minDateFromProperty; //calling from header.jsp
					
				var jsonObject = new Object();
			//	jsonObject.configuration =response.configuration;
				$("#dateEle").DatePickerCus(options);
				//Based on Executive Type the WS will call and Data will Populate
				CommonSelect.getRegionSubRegionBranchwithoutExecutiveType();
				//alert("executiveType "+executiveType);
				if(executiveType == EXECUTIVE_TYPE_GROUPADMIN || executiveType == EXECUTIVE_TYPE_REGIONADMIN){
				getJSON(null, WEB_SERVICE_URL
						+ '/selectOptionsWS/getAllSubRegionOption.do', _this.setAllDestSubRegions,EXECUTE_WITHOUT_ERROR);
				//getJSON(null, WEB_SERVICE_URL+'/destinationWiseDispatchSummaryReportWS2/getDestSubRegion.do', _this.setDestSubRegion, EXECUTE_WITH_ERROR);
				}else if(executiveType == EXECUTIVE_TYPE_SUBREGIONADMIN){
					getJSON(jsonObject, WEB_SERVICE_URL+'/selectOptionsWS/getDestBranchOption.do', _this.setDestBranches, EXECUTE_WITH_ERROR);
				}
				hideLayer();
			})
		},setAllDestSubRegions : function(jsonObj){

			var configuration = jsonObj.configuration;
				_this.setDestSubregionAutocompleteInstance();
				_this.setDestBranchesAutocompleteInstance();

			var autoDestSubRegionName = $("#destSubRegionSelectEle").getInstance();

			$( autoDestSubRegionName ).each(function() {
				this.option.source = jsonObj.subRegion;
			})
		},setDestSubregionAutocompleteInstance:function(){
			var autoDestSubRegionName = new Object();

			autoDestSubRegionName.primary_key = 'subRegionId';
			autoDestSubRegionName.field = 'subRegionName';
			autoDestSubRegionName.callBack = _this.onDestSubRegionSelect;
			$("#destSubRegionSelectEle").autocompleteCustom(autoDestSubRegionName);
		},onDestSubRegionSelect : function(obj){
			var jsonArray = new Array();
			jsonArray.push('#destBranchSelectEle');
			_thisPopulate.resetAutcomplete(jsonArray);
			var jsonObject = new Object();
			var $inputs = $('#ElementDiv :input');
			$inputs.each(function (index){if($(this).val() != ""){jsonObject[$(this).attr('name')] = $.trim($(this).val());}});

			getJSON(jsonObject, WEB_SERVICE_URL+'/selectOptionsWS/getDestBranchOption.do', _this.setDestBranches, EXECUTE_WITH_ERROR);
		},setDestBranches : function(jsonObj){	
			var configuration = jsonObj.configuration;
			if(configuration.DestSubRegion == 'false'){
				_this.setDestBranchesAutocompleteInstance();
			}
				//
			var autoBranchName = $("#destBranchSelectEle").getInstance();
			$( autoBranchName ).each(function() {
				this.option.source = jsonObj.destinationBranch;
			})
		},setDestBranchesAutocompleteInstance : function(){
			var autoBranchName = new Object();
			autoBranchName.primary_key = 'branchId';
			autoBranchName.field = 'branchName';

			$("#destBranchSelectEle").autocompleteCustom(autoBranchName)
		}
	});	
});