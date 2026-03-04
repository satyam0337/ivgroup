/**
 * Anant 18-06-2024
 */

 function loadSubRegionMaster() {
	 document.getElementById('searchRegion').focus();
	 setRegionAutocomplete();
 }
 
 function setRegionAutocomplete() {
	$("#searchRegion").autocomplete({
	    source: function (request, response) {
	        $.getJSON(WEB_SERVICE_URL+'/autoCompleteWS/getRegionAutocomplete.do?term=' + request.term, function (data) {
	            response($.map(data.result, function (item) {
	                return {
	                    label				: item.regionName,
	                    value				: item.regionName,
	                    toBranchId			: item.regionId
	                };
	            }));
	        });
	    }, select: function (e, u) {
			getSubRegionByRegionId(u.item.regionId);
	    },
	    minLength	: 2,
	    delay		: 10,
	    autoFocus	: true
	});
}
 
 function getSubRegionByRegionId(regionId) {
	let jsonObject				= new Object();
	jsonObject["regionId"]		= regionId;
	
	showLayer();

	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/selectOptionsWS/getSubRegionListByRegion.do',
		data		: jsonObject,
		dataType	: 'json',
		success: function(data) {
			var subRegionList	= data.subRegion;
			
			operationOnSelectTag('subRegion', 'removeAll', '', ''); //function calling from genericfunction.js
			operationOnSelectTag('subRegion', 'addNew', '---- Select  Sub Region ----', 0); //function calling from genericfunction.js
			
			if(subRegionList != null && typeof subRegionList !== 'undefined') {
				for(var i = 0; i < subRegionList.length; i++) {
					operationOnSelectTag('subRegion', 'addNew', subRegionList[i].subRegionName, subRegionList[i].subRegionId);
				} 
			}
			
			hideLayer();
		}
	});
}

function getSeletedItemData(subRegionId) {
	let jsonObject				= new Object();
	jsonObject["subRegionId"]	= subRegionId;
	
	showLayer();

	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/subRegionWS/getSubRegionBySubRegionId.do',
		data		: jsonObject,
		dataType	: 'json',
		success: function(data) {
			var subRegion	= data.subRegion;
			
			hideLayer();
		}
	});
}