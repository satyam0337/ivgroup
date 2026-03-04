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
        ,'text!'+PROJECT_IVVIEWPAGES+'/template/selectelementtemplate.html'
        //text! is used to convert the html to plain text which helps to fetch HTML through require
        //template for element
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/preloadingsheet/preloadingsheetfilepath.js'//FilePath
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/preloadingsheet/loadpreloadingsheetmodelurls.js'//ModelUrls
        ,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/populatesubregionandbranch.js'//PopulateAutocomplete
        //filepath is defined to get the language path from where should the language file should be loaded for label
        ,'jquerylingua'//import in require.config
        ,'language'//import in require.config
        ,'nodvalidation'//import in require.config
        ,'validation'//import in require.config
        ,'errorshow'//import in require.config
        ,'focusnavigation'//import in require.config
        ,'autocompleteWrapper',//ModelUrls
        ,'JsonUtility'
        ,'messageUtility'
        ,'selectize'
        ,'selectizewrapper'
        ], function (Marionette, ElementModel, elementTemplateJs, ElementTemplate, FilePath, ModelUrls, PopulateAutocomplete) {
	var 
	//global objects
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
		}, onBeforeRender: function() {
			//code which needs to be rendered before render
		}, onRender: function(){
			//jsonutility.js
			getJSON(null, WEB_SERVICE_URL+'/dispatchWs/getDispatchElement.do', _this.setElements, EXECUTE_WITH_ERROR);

			return _this;
		}, onAfterRender: function() {
			//code which needs to be rendered after render
		},setElements : function(response){
			//elementtemplate.js
			//append value in template
			elementTemplateJs.appendElementInTemplate(ModelUrls.urlModelCollection(response), ElementModel, ElementTemplate, _this);
			//focus navigation initiates through this function
			initialiseFocus();
			//load language is used to get the value of labels 
			var langObj = FilePath.loadLanguage();
			loadLanguageWithParams(langObj);
			hideLayer();

			var branchAreaAutoComplete = new Object();
			branchAreaAutoComplete.url = WEB_SERVICE_URL+'/dispatchWs/getPendingDispatchArea.do';
			//populatesubregionandbranch.js
			PopulateAutocomplete.setSubregionAndBranchWithMultipleBranches(branchAreaAutoComplete);
			myNod = nod();
			myNod.configure({
				parentClass:'validation-message'
			});

			myNod.add({
				selector: '#areaSelectEle',
				validate: 'presence',
				errorMessage: 'Select proper Area'
			});
			myNod.add({
				selector: '#branchSelectEle',
				validate: 'presence',
				errorMessage: 'Select proper Branch'
			});

		},OnChangeUpdate:function(value){
			console.log(value);
		}
	});	
});