/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define(['elementTemplateJs',
        PROJECT_IVUIRESOURCES+'/resources/js/module/view/actionbutton/actionbuttonfilepath.js',
        'language',
        PROJECT_IVUIRESOURCES+'/resources/js/model/element/actionbuttonmodel.js',
        'text!'+PROJECT_IVVIEWPAGES+'/template/actionbuttontemplate.html',
        PROJECT_IVUIRESOURCES+'/resources/js/module/view/actionbutton/actionbuttonmodelurls.js'],
        function(elementTemplateJs,filePath,language,actionButtonModel,actionButtonTemplate,loadModelUrls) {
	var 
	ElementModelArray='';
	var _this

	return Marionette.ItemView.extend({
		initialize: function() {
			//_this object is added because this object is not found in onRender function
			_this = this;
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
			//default model to fetch data from webservice
			//data is fetch by .fetch method from model
			ElementModelArray = loadModelUrls.printActionBtton();
				//elementtemplate.js
				elementTemplateJs.appendElementInTemplate(ElementModelArray,actionButtonModel,actionButtonTemplate,_this);

				var langObj = filePath.loadLanguage();
			var returnObj = loadLanguageWithParams(langObj);
			return _this;
		},
		onAfterRender: function() {}, 
	});	
});