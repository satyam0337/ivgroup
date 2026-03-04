define(function(require) {
	return {
		urlModelCollection:function(pendingDispatch){
			urlArray = new Array();
			if(pendingDispatch.subregion)
				urlArray.push(require('text!/ivcargo/resources/js/model/dispatch/subregionmodel.json'));
			
			if(pendingDispatch.branch)
				urlArray.push(require('text!/ivcargo/resources/js/model/dispatch/branchmodel.json'));
			
			return urlArray;
		}
	}
})