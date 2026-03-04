define(function(require) {
	return {
		urlHTML:function(){
			
			var htmlArray = new Array();
			htmlArray.push(require('text!/ivcargo/resources/js/model/searchlrbylrnumber/searchlrnumbermodel.json'));
			
			return htmlArray;
		}
	}
})