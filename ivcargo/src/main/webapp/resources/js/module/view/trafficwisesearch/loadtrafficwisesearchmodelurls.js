/**
 * @Author Anant Chaudhary	13-07-0216
 */

define(function(require) {
	return {
		urlModelCollection:function(trafficWiseSearchConfig) {
			var urlArray 			= new Array();
			
			if(trafficWiseSearchConfig.Branches)
				urlArray.push(require('text!/ivcargo/resources/js/model/trafficwisesearch/branchesmodel.json'));
			
			if(trafficWiseSearchConfig.ToBranch)
				urlArray.push(require('text!/ivcargo/resources/js/model/trafficwisesearch/subregionmodel.json'));
			
			if(trafficWiseSearchConfig.ToSubBranch)
				urlArray.push(require('text!/ivcargo/resources/js/model/trafficwisesearch/tosubbranchmodel.json'));
			
			return urlArray;
		}
	}
})