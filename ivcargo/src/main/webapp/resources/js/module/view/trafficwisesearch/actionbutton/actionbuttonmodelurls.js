/**
 * 
 */

define(function(require) {
	return {
		urlModelForActionButton:function() {
			var urlArray = new Array();
			urlArray.push(require('text!/ivcargo/resources/js/model/actionbutton/actionbuttonfindmodel.json'));

			return urlArray;
		},
		printActionBtton:function() {
			var urlArray = new Array();
			urlArray.push(require('text!/ivcargo/resources/js/model/actionbutton/printbuttonmodel.json'));
			
			return urlArray;
		}
	}
})