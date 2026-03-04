define(function(require) {
	return {
		urlModelCollection:function(truckAnalyzingReportConf){
			var urlArray 				= new Array();
			var truckAnalyzingReport  			= new Object();
			
			truckAnalyzingReport.LSNo 			= require('text!/ivcargo/resources/js/model/truckanalyzingreport/lsno.json');
			
			var elements =  truckAnalyzingReportConf.configuration;

			for (var key in elements) {
				if (key != null && truckAnalyzingReport[elements[key]] != undefined) {
					urlArray.push(truckAnalyzingReport[elements[key]]);
				}
			}
			
			return urlArray;
		}
	}
})