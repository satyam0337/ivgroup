define(function(require) {
	return {
		urlModelCollection:function(){
			urlArray = new Array();
				urlArray.push(require('text!/ivcargo/resources/js/model/sequencemaster/sourcebranchmodel.json'));
				urlArray.push(require('text!/ivcargo/resources/js/model/sequencemaster/sourceregionmodel.json'));
				urlArray.push(require('text!/ivcargo/resources/js/model/sequencemaster/sourcesubregionmodel.json'));
			return urlArray;
		}
		
	}
})