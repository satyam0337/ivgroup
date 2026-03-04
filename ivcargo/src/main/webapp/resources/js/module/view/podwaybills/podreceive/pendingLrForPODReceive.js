/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
var PODStatusConstant	= null;
var receive, receiveAndApprove, btModal;
define([
	'slickGridWrapper3'
	,'errorshow'
	,'JsonUtility'
	,'messageUtility'
	], function (slickGridWrapper3) {
	'use strict';// this basically give strictness to this specific js
	var 
	_this = '',
	jsonObject;
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData) {
			_this 				= this;
			jsonObject 			= jsonObjectData.elementValue;
			receive				= jsonObject.receive;
			receiveAndApprove	= jsonObject.receiveAndApprove;
			btModal				= jsonObjectData.btModal;
		}, render : function() {
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL + '/podReceiveWS/getPodLrDetailsByPodDispatchId.do', _this.setLrData, EXECUTE_WITH_ERROR);
		}, setLrData : function(response) {
			hideAllMessages();

			if(receive) {
				var $podReceive				= $('<button id="podReceive" class="btn btn-success" style="float:left;margin-left:20px;" data-tooltip="Receive"><span data-selector="receive">Receive</span></button>');
				var $podReject				= $('<button id="podReject" class="btn btn-danger" style="float:left;margin-left:20px;" data-tooltip="Reject"><span data-selector="reject">Reject</span></button>');
			} else if(receiveAndApprove) {
				var $receiveAndApproove		= $("<button id='receiveAndApproove' class='btn btn-success' style='float:left;' data-tooltip='Receive & Approove'><span data-selector='receiveApprove'>Receive Approve</span></button>");
				var $approoveReject			= $('<button id="approoveReject" class="btn btn-danger" style="float:left;margin-left:20px;" data-tooltip="Reject"><span data-selector="reject">Reject</span></button>');
			}
				
			PODStatusConstant	= response.PODStatusConstant;
				
			if(response.CorporateAccount != undefined) {
				setTimeout(function() {
					slickGridWrapper3.applyGrid({
						ColumnHead			:	_.values(response.columnConfiguration), // *compulsory // for table headers
						ColumnData			:	_.values(response.CorporateAccount), 	// *compulsory // for table's data
						Language			:	response.Language, 			// *compulsory for table's header row language
						DivId				:	'modalBody',				// *compulsary field // division id where slickgrid table has to be created
						InnerSlickId		:	'popupData',		//	*compulsary field // unique Key for id to be set in slickgrid table
						SerialNo			:[{					// optional field // for showing Row number
							showSerialNo	:	false,
							SearchFilter	:	false,          // for search filter on serial no
							ListFilter		:	false				// for list filter on serial no
						}],
						NoVerticalScrollBar			:	false, //optional for no vertical scrolling & if set true remove height attribute to Grid Div
						//FetchDataButtonId : '.ok',//Add button in modal pop-up
						ShowCheckBox 				: 	true,
						EditableColumn				: 	false,
						RemoveSelectAllCheckBox		:	false
					});
							
					if(receive) {
						$("#buttonDiv_popupData").append($podReceive);
						$("#buttonDiv_popupData").append($podReject);
					} else if(receiveAndApprove) {
						$("#buttonDiv_popupData").append($receiveAndApproove);
						$("#buttonDiv_popupData").append($approoveReject);
					}
						
					$("#podReceive").click(function() {
						_this.updatePODStatusToReceive();
					});
						
					$("#podReject").click(function() {
						_this.updatePODStatusToReject();
					});
						
					$("#receiveAndApproove").click(function() {
						_this.updatePODStatusFromReceiveToApproove();
					});
						
					$("#approoveReject").click(function() {
						_this.updatePODStatusToReject();
					});
				}, 500);
			}

			hideLayer();
		}, updatePODStatusToReceive : function() {
			var doneTheStuff 		= false;
			var selectedGridObject 	= slickGridWrapper3.getSlickGridInstance({InnerSlickId : 'popupData'});
			var selectedVal 		= slickGridWrapper3.getValueForSelectedData({InnerSlickId : 'popupData'});
			
			if(selectedVal == undefined)
				return;
			
			var wayBillIdWiseObj= [];
			var jsonObject		= {};
			var checkBoxArray	= [];
			
			if(selectedVal.length > 0)
				$("#podReceive").addClass('hide');
			
			for(var i = 0; i < selectedVal.length; i++) {
				var jsonPODObject = new Object();
	
				jsonPODObject["podDispatchId"] 			= selectedVal[i].podDispatchId;
				jsonPODObject["podDispatchSummaryId"] 	= selectedVal[i].podDispatchSummaryId;
				jsonPODObject["remark"] 				= selectedVal[i].podRemark;
				jsonPODObject["waybillId"] 				= selectedVal[i].wayBillId;
				
				checkBoxArray.push(selectedVal[i].wayBillId);
				wayBillIdWiseObj.push(jsonPODObject);
			}
			
			jsonObject["wayBillIdWiseData"]			= JSON.stringify(wayBillIdWiseObj);
			jsonObject["wayBillIds"]				= checkBoxArray.join(',');
	
			if(!doneTheStuff) {
				var btModalConfirm = new Backbone.BootstrapModal({
					content		: 	"Are you sure you want to Receive ?",
					modalWidth 	: 	30,
					title		:	'Receive',
					okText		:	'YES',
					showFooter 	: 	true,
					okCloses	:	true
				}).open();
	
				btModalConfirm.on('ok', function() {
					if(!doneTheStuff) {
						getJSON(jsonObject, WEB_SERVICE_URL+'/podReceiveWS/receivePodLrDetails.do', _this.setResponse, EXECUTE_WITH_ERROR); //submit JSON
						doneTheStuff = true;
					}
					
					if(selectedGridObject != undefined) {
						var dataView 	= selectedGridObject.getData();
						
						for(var i = 0; i < selectedVal.length; i++) {
							dataView.deleteItem(selectedVal[i].id);//RowID is the actual ID of the row and not the row number
							grid.invalidate();
							grid.render();
							$("#podReceive").removeClass('hide');
						}
					}
				});	
	
				btModalConfirm.on('cancel', function() {
					$("#podReceive").removeClass('hide');
					doneTheStuff = false;
					hideLayer();
				});
			}
		}, updatePODStatusToReject : function() {
			var doneTheStuff 		= false;
			var selectedGridObject 	= slickGridWrapper3.getSlickGridInstance({InnerSlickId : 'popupData'});
			var selectedVal 		= slickGridWrapper3.getValueForSelectedData({InnerSlickId : 'popupData'});
			
			if(selectedVal == undefined)
				return;
			
			var wayBillIdWiseObj= [];
			var jsonObject		= {};
			var checkBoxArray	= [];
			
			if(selectedVal.length > 0) {
				if(receive)
					$("#podReject").addClass('hide');
				else if(receiveAndApprove)
					$("#approoveReject").addClass('hide');
			}
			
			for(var i = 0; i < selectedVal.length; i++) {
				var jsonPODObject = new Object();
	
				jsonPODObject["podDispatchId"] 			= selectedVal[i].podDispatchId;
				jsonPODObject["podDispatchSummaryId"] 	= selectedVal[i].podDispatchSummaryId;
				jsonPODObject["remark"] 				= selectedVal[i].podRemark;
				jsonPODObject["waybillId"] 				= selectedVal[i].wayBillId;
				
				checkBoxArray.push(selectedVal[i].wayBillId);
				wayBillIdWiseObj.push(jsonPODObject);
			}
			
			jsonObject["wayBillIdWiseData"]			= JSON.stringify(wayBillIdWiseObj);
			jsonObject["wayBillIds"]				= checkBoxArray.join(',');
	
			if(!doneTheStuff) {
				var btModalConfirm = new Backbone.BootstrapModal({
					content		: 	"Are you sure you want to Reject ?",
					modalWidth 	: 	30,
					title		:	'Reject',
					okText		:	'YES',
					showFooter 	: 	true,
					okCloses	:	true
				}).open();
	
				btModalConfirm.on('ok', function() {
					if(!doneTheStuff) {
						getJSON(jsonObject, WEB_SERVICE_URL+'/podReceiveWS/rejectPodLrDetails.do', _this.setResponse, EXECUTE_WITH_ERROR); //submit JSON
						doneTheStuff  = true;
					}
					
					if(selectedGridObject != undefined) {
						var dataView 	= selectedGridObject.getData();
						
						for(var i = 0; i < selectedVal.length; i++) {
							dataView.deleteItem(selectedVal[i].id);//RowID is the actual ID of the row and not the row number
							grid.invalidate();
							grid.render();
							
							if(receive)
								$("#podReject").removeClass('hide');
							else if(receiveAndApprove)
								$("#approoveReject").removeClass('hide');
						}
					}
				});	
	
				btModalConfirm.on('cancel', function() {
					if(receive) {
						$("#podReject").removeClass('hide');
						doneTheStuff  = false;
					} else if(receiveAndApprove) {
						$("#approoveReject").removeClass('hide');
						doneTheStuff  = false;
					}
					
					hideLayer();
				});
			}
		}, updatePODStatusFromReceiveToApproove : function() {
			var doneTheStuff 		= false;
			var selectedGridObject 	= slickGridWrapper3.getSlickGridInstance({InnerSlickId : 'popupData'});
			var selectedVal 		= slickGridWrapper3.getValueForSelectedData({InnerSlickId : 'popupData'});
			
			if(selectedVal == undefined)
				return;
			
			var wayBillIdWiseObj= [];
			var jsonObject		= {};
			var checkBoxArray	= [];
			
			if(selectedVal.length > 0)
				$("#receiveAndApproove").addClass('hide');
			
			for(var i = 0; i < selectedVal.length; i++) {
				var jsonPODObject = new Object();
	
				jsonPODObject["podDispatchId"] 			= selectedVal[i].podDispatchId;
				jsonPODObject["podDispatchSummaryId"] 	= selectedVal[i].podDispatchSummaryId;
				jsonPODObject["remark"] 				= selectedVal[i].podRemark;
				jsonPODObject["waybillId"] 				= selectedVal[i].wayBillId;
				
				checkBoxArray.push(selectedVal[i].wayBillId);
				wayBillIdWiseObj.push(jsonPODObject);
			}
			
			jsonObject["wayBillIdWiseData"]			= JSON.stringify(wayBillIdWiseObj);
			jsonObject["wayBillIds"]				= checkBoxArray.join(',');
	
			if(!doneTheStuff) {
				var btModalConfirm = new Backbone.BootstrapModal({
					content		: 	"Are you sure you want to Receive & Approve ?",
					modalWidth 	: 	30,
					title		:	'Receive & Approve',
					okText		:	'YES',
					showFooter 	: 	true,
					okCloses	:	true
				}).open();
	
				btModalConfirm.on('ok', function() {
					if(!doneTheStuff) {
						getJSON(jsonObject, WEB_SERVICE_URL+'/podReceiveWS/receiveAndApprovePodLrDetails.do', _this.setResponse, EXECUTE_WITH_ERROR); //submit JSON
						doneTheStuff = true;
					}
					
					if(selectedGridObject != undefined) {
						var dataView 	= selectedGridObject.getData();
						
						for(var i = 0; i < selectedVal.length; i++) {
							dataView.deleteItem(selectedVal[i].id);//RowID is the actual ID of the row and not the row number
							grid.invalidate();
							grid.render();
							$("#receiveAndApproove").removeClass('hide');
						}
					}
				});	
	
				btModalConfirm.on('cancel', function() {
					$("#receiveAndApproove").removeClass('hide');
					doneTheStuff = false;
					hideLayer();
				});
			}
		}, setResponse : function(response) {
			btModal.close();
		}
	});
});