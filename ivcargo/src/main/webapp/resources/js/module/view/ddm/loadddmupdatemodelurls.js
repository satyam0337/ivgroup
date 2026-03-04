define(function(require) {
	return {
		elementCollection:function(jsonObject) {
			var	urlArray	= new Array();
			
			if(jsonObject.editDriverDetails) {
				urlArray.push(require('text!/ivcargo/resources/js/model/ddmupdate/ddmUpdateDriverName.json'));
				urlArray.push(require('text!/ivcargo/resources/js/model/ddmupdate/ddmUpdateDriverNumber.json'));
			}
			
			if(jsonObject.updateLorryHire)
				urlArray.push(require('text!/ivcargo/resources/js/model/ddmupdate/ddmUpdateLorryHire.json'));
			
			if(jsonObject.updateTruckNumber)
				urlArray.push(require('text!/ivcargo/resources/js/model/ddmupdate/ddmUpdateTruckNumber.json'));
			
			if(jsonObject.updateDestination)
				urlArray.push(require('text!/ivcargo/resources/js/model/ddmupdate/ddmUpdateDestination.json'));
			
			if(jsonObject.updateVehicleAgentName)
				urlArray.push(require('text!/ivcargo/resources/js/model/ddmupdate/ddmUpdateVehicleAgentName.json'));
			
			if (jsonObject.updateRemark)
				urlArray.push(require('text!/ivcargo/resources/js/model/ddmupdate/ddmUpdateRemark.json'));
			
			return urlArray;
		}
	}
});