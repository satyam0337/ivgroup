define(function(require) {
	return {
		elementCollection:function(jsonObject) {
			var	urlArray	= new Array();
			urlArray.push(require('text!/ivcargo/resources/js/model/editPODRemark/editPODRemark.json'));
			return urlArray;
		}
	}
});