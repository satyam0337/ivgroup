define(
		function(require) {
			var 
			Backbone = require('backbone');
			
			var model = Backbone.Model.extend({
				defaults:{
					"buttonName":"",
					"buttonId":"",
					"buttonClass":"",
					"tooltipName":"",
					"buttonSpanId":"",
					"glyphiconClass":""
				}
			});
			return model;
		}
);
