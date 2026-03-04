define(function(require) {
	return {
		elementCollection:function() {
			var	urlArray	= new Array();
			
			urlArray.push(require('text!/ivcargo/resources/js/model/podwaybills/photo.json'));
			
			return urlArray;
		},remarkCollection:function() {
			var	urlArray	= new Array();
			
			urlArray.push(require('text!/ivcargo/resources/js/model/podwaybills/remark.json'));
			
			return urlArray;
		}
	}
});