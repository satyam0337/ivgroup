/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
 var jsonObject;
define([
	'slickGridWrapper2'
	,'JsonUtility'
	,'messageUtility'
	,'nodvalidation'
	], function (slickGridWrapper2,NodValidation) {
	'use strict';// this basically give strictness to this specific js
	var 
	_this = '', pboData, btModal,filter = 0, sourceBranch = '',myNod;
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData) {
			_this 			= this;
			btModal			= jsonObjectData.btModal;
			pboData			= localStorage.getItem("PendingBranchOperationsJsonObject");
			
			if(pboData != undefined && pboData != null) {//for data in new tab
				jsonObject	= JSON.parse(pboData);
				
				sourceBranch	= jsonObject.sourceBranchName;
				filter			= jsonObject.filter;
			} else
				jsonObject 	= jsonObjectData.elementValue;
				
			if(jsonObject == undefined || jsonObject == null) {
				showMessage('error', 'Records not found, Search again !');
				
				setTimeout(function() {
					window.close();
				}, 2000);
			}
		}, render: function() {
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL + '/pendingBranchOperationsWS/getPendingLRDetailsBySourceBranchId.do', _this.setPendingLRDetails, EXECUTE_WITHOUT_ERROR);
		}, setPendingLRDetails : function(response) {
			hideLayer();
			
			if(response.message != undefined) {
				if(btModal != undefined) btModal.close()
				return;
			}

			hideAllMessages();
			
			localStorage.removeItem('PendingBranchOperationsJsonObject');
			
			let showDownloadToExcelButton	= response.showDownloadToExcelButton;
			
			if(pboData != undefined && pboData != null) {
				$("#mainContent").load("/ivcargo/html/module/pendingbranchoperations/PendingBranchOperationsDetails.html", function() {
					let heading	= '';
					switch (filter) {
						case 1:
							heading = 'Pending Dispatch LR Details';
							break;
						case 2:
							heading = 'Pending Receive LR Details';
							break;
						case 3:
							heading = 'Pending Delivery LR Details';
							break;
						case 4:
							heading = 'Pending DDM Settlement Details';
							break;
						case 5:
							heading = 'LR Booked But Not Dispatched';
							break;
						default:
							break;
					}
					
					$('#headerDetails').text(heading + " (Branch: " + sourceBranch + ")");
					
					if(showDownloadToExcelButton) {
						$("#downloadtoExcelBtn").removeClass('hide');
					
						$("#downloadtoExcelBtn").click(function() {
							_this.downloadToExcel();
						});
					} else
						$('#downloadtoExcelBtn').remove();
					
					let gridObject	= slickGridWrapper2.setGrid(response);
					//slickGridWrapper2.updateRowColor(gridObject, 'isTceBooking', true, 'highlight-row-lightBlue');
					slickGridWrapper2.updateRowColor(gridObject, 'mergingGroupLr', true, 'highlight-row-red');
				});
			} else {
				setTimeout(function() {
					let gridObject	= slickGridWrapper2.setGrid(response);

					//slickGridWrapper2.updateRowColor(gridObject, 'isTceBooking', true, 'highlight-row-lightBlue');
					slickGridWrapper2.updateRowColor(gridObject, 'mergingGroupLr', true, 'highlight-row-red');
				}, 1000);
			}
		}, downloadToExcel : function() {
			jsonObject["isExcel"] 		= true;
			jsonObject["reportTitle"] 	= $('#headerDetails').html();
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL + '/pendingBranchOperationsWS/getPendingLRDetailsBySourceBranchId.do', _this.setResponseForDownload, EXECUTE_WITHOUT_ERROR);
		}, setResponseForDownload : function(response) {
			hideLayer();
			
			let errorMessage = response.message;
			showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			
			if(response.message.messageId != 409)//excel id
				return;
			
			generateFileToDownload(response);
		}
	});
});