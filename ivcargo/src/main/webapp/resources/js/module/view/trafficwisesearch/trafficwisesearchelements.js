/**
 * @Author Anant Chaudhary	13-07-0216
 */

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
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/trafficwisesearch/trafficwisesearchfilepath.js'//FilePath
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/trafficwisesearch/loadtrafficwisesearchmodelurls.js'//ModelUrls
        ,'selectizewrapper'
        //filepath is defined to get the language path from where should the language file should be loaded for label
        ,'jquerylingua'//import in require.config
        ,'language'//import in require.config
        ,'nodvalidation'//import in require.config
        ,'errorshow'//import in require.config
        ,'focusnavigation'//import in require.config
        ,'autocompleteWrapper'//AutocompleteUtils
        ,'selectize'
        ], function (Marionette, ElementModel, elementTemplateJs, ElementTemplate, FilePath, ModelUrls, Selectizewrapper) {
	var 
	//global objects
	ElementModelArray='',
	deferred,
	_this;

	return Marionette.ItemView.extend({
		initialize: function() {
		},
		render: function() {
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
		onRender: function() { 
			//this object is created to synchronize the flow when data is fetched from the method
			deferred = Marionette.Deferred();
			
			showLayer();
			changeDisplayProperty('bottom-border-boxshadow', 'none');
			getJSON(null, WEB_SERVICE_URL+'/trafficWiseSearchWS/getTrafficWiseSearchElement.do', _this.setElements, EXECUTE_WITH_ERROR);

			return _this;
		},
		onAfterRender: function() {
			//code which needs to be rendered after render
		}, 
		setElements : function(response) {
			
			ElementModelArray = ModelUrls.urlModelCollection(response);
			deferred.resolve();

			_.result(deferred, 'promise').then(function (target) {
				//elementtemplate.js
				//append value in template
				elementTemplateJs.appendElementInTemplate(ElementModelArray, ElementModel, ElementTemplate, _this);
				//focus navigation initiates through this function
				initialiseFocus();
				//load language is used to get the value of labels 
				var langObj = FilePath.loadLanguage();
				loadLanguageWithParams(langObj);
				hideLayer();

				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector: '#excBranchesSelectEle',
					validate: 'validateAutocomplete:#excBranchesSelectEle_primary_key',
					errorMessage: 'Select, Branch Name !'
				});
				
				if(response.isNormalUser == 'undefined' || !response.isNormalUser) {
					getJSON(null, WEB_SERVICE_URL+'/trafficWiseSearchWS/getBranchWiseTrafficConfiguration.do', _this.setExeBranches, EXECUTE_WITH_ERROR);
					getJSON(null, WEB_SERVICE_URL+'/trafficWiseSearchWS/getSubRegionForTrafficWiseSearch.do', _this.setSubRegions, EXECUTE_WITH_ERROR);
				}
				
				TruckArrivalDetailsDisplay	= response.TruckArrivalDetailsDisplay;

				hideLayer();
			})
		},  setExeBranches : function(jsonObj) {
			let autoExeBranches 			= new Object();
			
			autoExeBranches.valueField 	= 'branchId';
			autoExeBranches.labelField 	= 'branchName';
			autoExeBranches.searchField = 'branchName';
			autoExeBranches.options 	= jsonObj.branchWiseTrafficConfig;
			autoExeBranches.create 		= false;

			$("#excBranchesSelectEle").selectize(autoExeBranches);
		},  setSubRegions : function(jsonObj) {
			let autoSubRegionName 			= new Object();
			autoSubRegionName.url 			= jsonObj.subRegion;
			autoSubRegionName.primary_key 	= 'subRegionId';
			autoSubRegionName.field 		= 'subRegionName';
			autoSubRegionName.callBack 		= _this.onSubRegionSelect;

			$("#subregionSelectEle").autocompleteCustom(autoSubRegionName)
		},  onSubRegionSelect : function() {
			var jsonArray 	= new Array();

			jsonArray.push('#branchesSelectEle');

			_this.resetAutcomplete(jsonArray);
			
			var jsonObject 	= new Object();
			var $inputs 	= $('#ElementDiv :input');
			$inputs.each(function (){if($(this).val() != ""){jsonObject[$(this).attr('name')] = $.trim($(this).val());}});

			getJSON(jsonObject, WEB_SERVICE_URL+'/trafficWiseSearchWS/getBranchForTrafficWiseSearchBySubregion.do', _this.setBranches, EXECUTE_WITH_ERROR);
		}, setBranches : function(jsonObj) {	
			if(jsonObj.showPrintOption)
				$("#printBtnDiv").show();
			
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	jsonObj.sourceBranch,
				valueField		:	'branchId',
				labelField		:	'branchName',
				searchField		:	'branchName',
				elementId		:	'branchesSelectEle',
				create			: 	false,
				maxItems		: 	jsonObj.allowToSelectMultipleBranches ? 1000 : 1
			});
			
			$("#branchesSelectEle").selectize(branchName);
			
			let autoBranchName = $("#branchesSelectEle").getInstance();
			
			$( autoBranchName ).each(function() {
				this.option.source = jsonObj.sourceBranch;
				
				this.elem.combo_input.context.value = 'ALL';
				document.getElementById(this.elem.combo_input.context.id+'_primary_key').value = 0;
			})
		}, setBranchesAutocompleteInstance : function() {
			let autoBranchName 			= new Object();
			autoBranchName.primary_key 	= 'branchId';
			autoBranchName.field 		= 'branchName';

			$("#branchesSelectEle").autocompleteCustom(autoBranchName)
		}, resetAutcomplete:function(jsonArray) {
			for(var eleId in jsonArray) {
				var elem = $(jsonArray[eleId]).getInstance();
				$( elem ).each(function() {
					this.elem.combo_input.context.value = '';
					$(this.elem.combo_input.context.id + '_primary_key').val("");
				}) 
			}
		}
	});	
});