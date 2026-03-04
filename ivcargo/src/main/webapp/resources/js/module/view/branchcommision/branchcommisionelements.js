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
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/branchcommision/branchcommisionfilepath.js'//FilePath
        //filepath is defined to get the language path from where should the language file should be loaded for label
        ,'jquerylingua'//import in require.config
        ,'language'//import in require.config
        ,'nodvalidation'//import in require.config
        ,'errorshow'//import in require.config
        ,'focusnavigation'//import in require.config
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/branchcommision/loadbranchcommisionmodelurls.js'//ModelUrls
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

			getJSON(null, WEB_SERVICE_URL+'/branchCommisionReport/getBranchCommisionElement.do', _this.setElements, EXECUTE_WITH_ERROR);

			return _this;
		},
		onAfterRender: function() {
			//code which needs to be rendered after render
		},setElements : function(response){
			ElementModelArray = ModelUrls.urlModelCollection(response);
			deferred.resolve();

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
					selector: '#sourceBranchSelectEle',
					validate: 'validateAutocomplete:#sourceBranchSelectEle_primary_key',
					errorMessage: 'Select proper Source Branch'
				});

				myNod.add({
					selector: '#destinationBranchSelectEle',
					validate: 'validateAutocomplete:#destinationBranchSelectEle_primary_key',
					errorMessage: 'Select proper Destination Branch'
				});

				//set Date picker present in datepickerwrapper.js as a wrapper
				$("#dateEle").DatePickerCus({});

				if(response.configuration[2] == 'SourceSubRegion') {
					
					myNod.add({
						selector: '#sourceSubRegionSelectEle',
						validate: 'validateAutocomplete:#sourceSubRegionSelectEle_primary_key',
						errorMessage: 'Select proper Source SubRegion'
					});

					myNod.add({
						selector: '#destinationSubRegionSelectEle',
						validate: 'validateAutocomplete:#destinationSubRegionSelectEle_primary_key',
						errorMessage: 'Select proper Destination SubRegion'
					});
					
					var srcSubRegionAutoComplete = new Object();
					srcSubRegionAutoComplete.primary_key = 'subRegionId';
					srcSubRegionAutoComplete.callBack = _this.onSourceSubRegionSelect;
					srcSubRegionAutoComplete.field = 'subRegionName';
					$("#sourceSubRegionSelectEle").autocompleteCustom(srcSubRegionAutoComplete);

					var srcAutoSubRegionName = $("#sourceSubRegionSelectEle").getInstance();
					$(srcAutoSubRegionName).each(function() {
						this.option.source = response.subRegionList;
					});

					var toSubRegionAutoComplete = new Object();
					toSubRegionAutoComplete.primary_key = 'subRegionId';
					toSubRegionAutoComplete.callBack = _this.onDestinationSubRegionSelect;
					toSubRegionAutoComplete.field = 'subRegionName';
					$("#destinationSubRegionSelectEle").autocompleteCustom(toSubRegionAutoComplete);

					var toAutoSubRegionName = $("#destinationSubRegionSelectEle").getInstance();
					$(toAutoSubRegionName).each(function() {
						this.option.source = response.subRegionList;
					});

					var srcBranchAutoComplete = new Object();
					srcBranchAutoComplete.primary_key = 'branchId';
					srcBranchAutoComplete.field = 'branchName';
					$("#sourceBranchSelectEle").autocompleteCustom(srcBranchAutoComplete);

					var toBranchAutoComplete = new Object();
					toBranchAutoComplete.primary_key = 'branchId';
					toBranchAutoComplete.field = 'branchName';
					$("#destinationBranchSelectEle").autocompleteCustom(toBranchAutoComplete);
					
				} else {
					getJSON(null,'Ajax.do?pageId=314&eventId=2',_this.setSourceAndDestionJsonCollection,EXECUTE_WITH_ERROR);
				}

				hideLayer();
			})
		},setSourceAndDestionJsonCollection : function(jsonObj){
			var auto = Object();
			auto.url			= jsonObj.sourceBranchList;
			$('#sourceBranchSelectEle').autocompleteCustom(auto);
			auto.url			= jsonObj.destinationBranchList;
			$('#destinationBranchSelectEle').autocompleteCustom(auto);
		},onSourceSubRegionSelect : function() {
			var jsonArray = new Array();
			jsonArray.push('#sourceBranchSelectEle');
			_this.resetAutcomplete(jsonArray);
			jsonObject = new Object();
			jsonObject.subRegionSelectEle_primary_key = $("#" + $(this).attr("id") + "_primary_key").val();
			jsonObject.AllOptionsForBranch = true;
			getJSON(jsonObject,	WEB_SERVICE_URL + '/selectOptionsWS/getPhysicalBranchOption.do', _this.setSourceBranch,EXECUTE_WITHOUT_ERROR);
		},setSourceBranch : function (jsonObj) {
			var autoBranchName = $("#sourceBranchSelectEle").getInstance();

			$(autoBranchName).each(function() {
				this.option.source = jsonObj.sourceBranch;
			})
		},onDestinationSubRegionSelect : function() {
			var jsonArray = new Array();
			jsonArray.push('#destinationBranchSelectEle');
			_this.resetAutcomplete(jsonArray);
			jsonObject = new Object();
			jsonObject.subRegionSelectEle_primary_key = $("#" + $(this).attr("id") + "_primary_key").val();
			getJSON(jsonObject,	WEB_SERVICE_URL + '/selectOptionsWS/getPhysicalBranchOption.do', _this.setDestinationBranch,EXECUTE_WITHOUT_ERROR);
		},setDestinationBranch : function (jsonObj) {
			var autoBranchName = $("#destinationBranchSelectEle").getInstance();

			$(autoBranchName).each(function() {
				this.option.source = jsonObj.sourceBranch;
			})
		},resetAutcomplete : function (jsonArray) {
			for ( var eleId in jsonArray) {
				var elem = $(jsonArray[eleId]).getInstance();
				$(elem).each(function() {
					var elemObj = this.elem.combo_input;
					$(elemObj).each(function() {
						$("#" + $(this).attr("id")).val('');
						$("#" + $(this).attr("id") + '_primary_key').val("");
					})
				})
			}
		}
	});	
});