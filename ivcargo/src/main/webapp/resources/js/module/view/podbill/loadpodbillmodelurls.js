define(function(require) {
	return {
		photoCollection:function() {
			var	urlArray	= new Array();
			
			urlArray.push(require('text!/ivcargo/resources/js/model/billPod/photo.json'));
			
			return urlArray;
		},signatureCollection:function() {
			var	urlArray	= new Array();
			
			urlArray.push(require('text!/ivcargo/resources/js/model/billPod/signature.json'));
			
			return urlArray;
		}
	}
});