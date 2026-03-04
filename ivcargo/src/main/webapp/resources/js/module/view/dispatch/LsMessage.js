/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define([
        PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/dispatchfilepath.js',
		'elementTemplateJs',
        'language'
        ],
        function(filePath) {
	var lsjsonObj, _this

	return Marionette.ItemView.extend({
		initialize: function(jsonInObj) {
			//_this object is added because this object is not found in onRender function
			lsjsonObj = jsonInObj.lsNumber;
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
			//this object is created to synchronize the flow when data is fetched from the method
			var deferred = Marionette.Deferred();
			//default model to fetch data from webservice
			//data is fetch by .fetch method from model
			setTimeout(function(){deferred.resolve();}, 200);
			_.result(deferred, 'promise').then(function (target) {
				//elementtemplate.js
				var langObj 	= filePath.loadLanguage();
				var langKeySet	= loadLanguageWithParams(langObj);
				var msgDiv		= $("<div />");
				msgDiv.attr("id", "msgDiv");
				
				if(lsPropertyConfig.showLoadingHamaliPrintButton)
					msgDiv.html(langKeySet["reprintMsg"] + " " + lsjsonObj + ' <button type="button" name="reprintBtn" id="reprintBtn" class="btn btn-success" data-tooltip="Reprint"><span data-selector="reprintBtnLabel">Reprint</span></button> &nbsp; <button type="button" name="hamaliDetailsBtn" id="hamaliDetailsBtn" class="btn btn-success" data-tooltip="Hamali Details"><span data-selector="">Hamali Details</span></button>')
				else if(lsPropertyConfig.showMinifiedLsButton)
					msgDiv.html(langKeySet["reprintMsg"] + " " + lsjsonObj + ' <button type="button" name="reprintBtn" id="reprintBtn" class="btn btn-success" data-tooltip="Reprint"><span data-selector="reprintBtnLabel">Reprint</span></button> &nbsp; <button type="button" name="minifiedLsBtn" id="minifiedLsBtn" class="btn btn-success" data-tooltip="Mini LS Print"><span data-selector="minifiedLsBtnLabel">LR Details</span></button>')
				else
					msgDiv.html(langKeySet["reprintMsg"] + " " + lsjsonObj + ' <button type="button" name="reprintBtn" id="reprintBtn" class="btn btn-success" data-tooltip="Reprint"><span data-selector="reprintBtnLabel">Reprint</span></button>')
				
				_this.$el.append(msgDiv);
			})
			
			return _this;
		},
		onAfterRender: function() {}, 
	});	
});