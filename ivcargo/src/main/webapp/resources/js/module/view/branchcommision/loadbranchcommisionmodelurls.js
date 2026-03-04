define(function(require) {
	return {
		urlModelCollection:function(branchCommisionConf){
			var urlArray = new Array();
			var branchCommision  = new Object();

			branchCommision.Date 					= require('text!/ivcargo/resources/js/model/branchcommision/datemodel.json');
			branchCommision.SourceSubRegion 		= require('text!/ivcargo/resources/js/model/branchcommision/sourcesubregionmodel.json');
			branchCommision.SourceBranch 			= require('text!/ivcargo/resources/js/model/branchcommision/sourcebranchmodel.json');
			branchCommision.DestinationSubRegion    = require('text!/ivcargo/resources/js/model/branchcommision/destinationsubregionmodel.json');
			branchCommision.DestinationBranch 		= require('text!/ivcargo/resources/js/model/branchcommision/destinationbranchmodel.json');
			branchCommision.PaidAmount 				= require('text!/ivcargo/resources/js/model/branchcommision/paidamountmodel.json');
			branchCommision.TopayAmount 			= require('text!/ivcargo/resources/js/model/branchcommision/topayamountmodel.json');
			branchCommision.TopayLoading	 		= require('text!/ivcargo/resources/js/model/branchcommision/topayloadingamountmodel.json');
			branchCommision.CommissionAmount 		= require('text!/ivcargo/resources/js/model/branchcommision/commissionamountmodel.json');
			branchCommision.TotalAmount 			= require('text!/ivcargo/resources/js/model/branchcommision/totalamountmodel.json');

			var elements =  branchCommisionConf.configuration;
			for (var key in elements) {
				if (key != null && branchCommision[elements[key]] != undefined) {
					urlArray.push(branchCommision[elements[key]]);
				}
			}
			
			return urlArray;
		}
	}
})