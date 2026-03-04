
 var jsonObject;
define([
	'slickGridWrapper2'
	,'JsonUtility'
	,'messageUtility'
	,'nodvalidation'
	], function (slickGridWrapper2,NodValidation) {
	'use strict';// this basically give strictness to this specific js
	var 
	_this = '', pboData, btModal;
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData) {
			_this 			= this;
			btModal			= jsonObjectData.btModal;
			pboData			= localStorage.getItem("DispatchMasterJsonObject");
			
			if(pboData != undefined && pboData != null) {//for data in new tab
				jsonObject	= JSON.parse(pboData);
			} else
				jsonObject 	= jsonObjectData.elementValue;
				
		}, render: function() {
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL + '/master/branchWiseDispatchMappingMasterWS/getAllBranchMappingDetails.do', _this.setTPTDetails, EXECUTE_WITHOUT_ERROR);
		}, setTPTDetails : function(response) {
			hideLayer();
			
			if (response.message != undefined) {
				hideLayer();
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				if(response.success == undefined || response.success == 'undefined')
					return;
			}
			hideAllMessages();
			
			localStorage.removeItem('DispatchMasterJsonObject');
			var maximumNoOfTPT	= response.maximumNoOfTPT;
			
			$("#mainContent").load("/ivcargo/html/master/branchWiseDispatchMappingMaster/viewAllBranchWiseDispatchMappingDetails.html", function() {
				$('#headerDetails').text("Branch Wise Dispatch Mapping Master");
				
			for(const element of response.dispatchMappingMaster.CorporateAccount) {
				let obj			= element;
				let sequenceHm	= response.destSequenceHm[obj.destinationMapId];
				for(var i = 1; i <= maximumNoOfTPT; i++){
					let model	= sequenceHm[i];
					obj["TPT"+i]	= sequenceHm != undefined ? (sequenceHm[i] != undefined ? model.crossingBranchName : "--") : "--";
				}
			}
			slickGridWrapper2.setGrid(response.dispatchMappingMaster);
		
			hideLayer();
			});
		}
	});
});