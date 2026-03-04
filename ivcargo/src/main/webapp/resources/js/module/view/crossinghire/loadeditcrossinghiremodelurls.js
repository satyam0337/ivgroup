define(function(require) {
	return {
		urlModelCollection:function(editblhpvConf){
			var urlArray 					= new Array();
			var editcrossinghire  			= new Object();
			
			
			
			var elements =  editcrossinghireConf.configuration;
			
			console.log(editcrossinghireConf);
			for (var key in elements) {
				if (key != null && editcrossinghire[elements[key]] != undefined) {
					urlArray.push(editcrossinghire[elements[key]]);
				}
			}
			
			return urlArray;
		}
	}
})