/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
var branchModel;
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
        //filepath is defined to get the language path from where should the language file should be loaded for label
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/loaddispatchmodelurls.js'//ModelUrls
        ,'jquerylingua'//import in require.config
        ,'language'//import in require.config
        ,'nodvalidation'//import in require.config
        ,'validation'//import in require.config
        ,'errorshow'//import in require.config
        ,'focusnavigation'//import in require.config
        ,'JsonUtility'
        ,'messageUtility'
        ], function (Marionette, ElementModel, elementTemplateJs, ElementTemplate, FilePath, ModelUrls) {
	var  _this;

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
			_this.setElements();
			return _this;
		}, onAfterRender: function() {
			//code which needs to be rendered after render
		},setElements : function() {
			elementTemplateJs.appendElementInTemplate(ModelUrls.urlSearchOperationModelCollection(lsPropertyConfig), ElementModel, ElementTemplate, _this);
			
			branchModel					= lsPropertyConfig.branchModel;
			initialiseFocus();
			//load language is used to get the value of labels 
			var langObj = FilePath.loadLanguage();
			loadLanguageWithParams(langObj);
			
			if(lsPropertyConfig.searchOptionForDispatch){
				$("#CrossingElementDiv").hide();
				$("#ElementDiv").hide();
				$("#LRElementDiv").hide();
				$("#plsElementDiv").hide();
				$("#crossingAgentCheckBox").hide();
				$("#plsLabelDiv").hide();
			}
			
			myNod = nod();
			myNod.configure({
				parentClass:'validation-message'
			});
			
			if(lsPropertyConfig.searchByOption) {
				myNod.add({
					selector		: '#searchSelectEle',
					validate		: 'validateAutocomplete:#searchSelectEle_primary_key',
					errorMessage	: 'Please Select Search Mode'
				});
				_this.setSearchOperationMode();
			}
			
			hideLayer();
		},setSearchOperationMode : function() {
			var searchByList = new Array();
			
			var searchBy = new Object();
			searchBy.searchById = 1;
			searchBy.searchByName = 'Pending Dispatch';
			searchByList.push(searchBy);
			
			var searchBy = new Object();
			searchBy.searchById = 2;
			searchBy.searchByName = 'PLS Number';
			searchByList.push(searchBy);
			
			var searchByAutoComplete = new Object();
			searchByAutoComplete.primary_key = 'searchById';
			searchByAutoComplete.field = 'searchByName';
			searchByAutoComplete.callBack 		= _this.onSearchModeSelect;
			searchByAutoComplete.keyupFunction = _this.onSearchModeSelect;
			$("#searchSelectEle").autocompleteCustom(searchByAutoComplete);

			var autoSearchSelectType = $("#searchSelectEle").getInstance();
			$(autoSearchSelectType).each(function() {
				this.option.source = searchByList;
			});
		},onSearchModeSelect: function(){
			if($('#searchSelectEle_primary_key').val() == 1){
				$("#ElementDiv").show();
				$("#LRElementDiv").show();
				$("#crossingAgentCheckBox").show();
				$("#plsElementDiv").hide();
				$("#plsLabelDiv").hide();
			} else{
				$("#ElementDiv").hide();
				$("#LRElementDiv").hide();
				$("#crossingAgentCheckBox").hide();
				$("#plsElementDiv").show();
				$("#plsLabelDiv").show();
			}
		}
	});	
});