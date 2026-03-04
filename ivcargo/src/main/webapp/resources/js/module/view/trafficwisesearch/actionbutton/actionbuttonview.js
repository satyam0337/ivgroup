/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define(['elementTemplateJs',
        PROJECT_IVUIRESOURCES+'/resources/js/module/view/trafficwisesearch/actionbutton/actionbuttonfilepath.js',
        'language',
        PROJECT_IVUIRESOURCES+'/resources/js/model/element/actionbuttonmodel.js',
        'text!'+PROJECT_IVVIEWPAGES+'/template/actionbuttontemplate.html',
        PROJECT_IVUIRESOURCES+'/resources/js/module/view/trafficwisesearch/actionbutton/actionbuttonmodelurls.js'
        ],
        function(elementTemplateJs, filePath, language, actionButtonModel, actionButtonTemplate, loadModelUrls) {
	var ElementModelArray	= '';
	var _this

	var ActionButtonView = Marionette.ItemView.extend({
		initialize: function() {
			//_this object is added because this object is not found in onRender function
			_this = this;
		},
		render: function() {
			//this is the first method called when this function is called
			//triggerMethod onBeforeRender
			this.triggerMethod("before:render");
			//triggerMethod onRender
			this.triggerMethod("render");
			//triggerMethod onAfterRender
			this.triggerMethod("after:render");
		},
		onBeforeRender: function() {
			
		}, 
		onRender: function() {
			//this object is created to synchronize the flow when data is fetched from the method
			var deferred = Marionette.Deferred();
			//default model to fetch data from webservice
			//data is fetch by .fetch method from model
			ElementModelArray = loadModelUrls.urlModelForActionButton();
			setTimeout(function(){deferred.resolve();}, 200);
			_.result(deferred, 'promise').then(function (target) {
				//elementtemplate.js
				elementTemplateJs.appendElementInTemplate(ElementModelArray, actionButtonModel, actionButtonTemplate, _this);

				var langObj = filePath.loadLanguage();
				loadLanguageWithParams(langObj);
			})
			
			return _this;
		},
		onAfterRender: function() {
			
		}, 
	});	
	return ActionButtonView;
});