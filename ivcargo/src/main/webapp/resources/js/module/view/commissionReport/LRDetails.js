/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
var operationType = 0;
define([
	PROJECT_IVUIRESOURCES + '/resources/js/module/view/commissionReport/LRDetailsfilepath.js'//FilePath
	,'language'//import in require.config
	,'slickGridWrapper3'
	,'errorshow'
	,'JsonUtility'
	,'messageUtility'
	,'elementmodel'
	,'elementTemplateJs'
	,'constant'
	], function (FilePath,Language,slickGridWrapper3,errorshow,JsonUtility,MessageUtility,ElementModel,Elementtemplateutils,constant) {
	'use strict';// this basically give strictness to this specific js
	var _this = '',
	filterConfiguration = new Object(),
	jsonObject,
	btModal,
	masterLangObj, 
	masterLangKeySet;
	
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData){
			_this 			= this;
			jsonObject		= jsonObjectData.jsonObject;
			btModal			= jsonObjectData.btModal;
			operationType	= jsonObject.operationType;
		},
		render: function(){
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/commissionReportWS/getCommissionLRDetails.do', _this.setElementData, EXECUTE_WITH_ERROR);
		},setElementData : function(response) {
			console.log("response",response)
			if(response.message != undefined){
				showMessage(response.message.typeName, response.message.description);
				hideLayer();
				btModal.close();
				return;
			} 
			if(response.CommissionLRDetails == undefined || response.CommissionLRDetails.CorporateAccount.length <= 0){
				showMessage('error', "No LR Found");
				hideLayer();
				btModal.close();
				return;
			}
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			loadelement.push(baseHtml);
			
			setTimeout(function(){
				$("#modalBody").load("/ivcargo/html/module/commissionReport/LRDetails.html",function() {
					baseHtml.resolve();
				});
			},200);
			
			$.when.apply($, loadelement).done(function() {
				showLayer();
					
				masterLangObj 			= FilePath.loadLanguage();
				masterLangKeySet 		= loadLanguageWithParams(masterLangObj);
				
				var ColumnConfig		= response.CommissionLRDetails.columnConfiguration;
				var columnKeys			= _.keys(ColumnConfig);
				var bcolConfig			= new Object();
				
				for (var i=0; i<columnKeys.length; i++) {
					var bObj		= ColumnConfig[columnKeys[i]];
					if (bObj.show == true) {
						bcolConfig[columnKeys[i]]	= bObj;
					}
				}
				
				response.CommissionLRDetails.columnConfiguration		= _.values(bcolConfig);
				response.CommissionLRDetails.Language					= masterLangKeySet;
				
				if(response.CommissionLRDetails.CorporateAccount != undefined && response.CommissionLRDetails.CorporateAccount.length  > 0) {
					
					slickGridWrapper3.applyGrid({
							ColumnHead					: response.CommissionLRDetails.columnConfiguration, // *compulsory // for table headers
							ColumnData					: _.values(response.CommissionLRDetails.CorporateAccount), 	// *compulsory // for table's data
							Language					: response.CommissionLRDetails.Language, 			// *compulsory for table's header row language
							ShowPrintButton				: true,
							ShowCheckBox				: false,
							removeSelectAllCheckBox		: 'false',
							fullTableHeight				: false,
							rowHeight 					: 	30,
							DivId						: 'lrDetailsDiv',	// *compulsary field division id where slickgrid table has to be created
							SerialNo:[{						// optional field // for showing Row number
								showSerialNo	: true,
								searchFilter	: false,          // for search filter on serial no
								ListFilter		: false				// for list filter on serial no
							}],
							InnerSlickId				: 'lrDetailsDivInner', // Div Id
							InnerSlickHeight			: '350px',
							NoVerticalScrollBar			: false //optional for no vertical scrolling & if set true remove height attribute to Grid Div
						});
				}
				
			hideLayer();
			})
		}
	});
});

function wayBillChargesDetails(grid,dataView,row){
	var wayBillId = dataView.getItem(row).waybillId;
	var wayBillNumber = dataView.getItem(row).waybillNumber;
	
	var jsonObject			= new Object();
	jsonObject.waybillId	= wayBillId;
	jsonObject.commissionTypeId	= operationType;;
	jsonObject.sourceBranchId	= dataView.getItem(row).sourceBranchId;
	jsonObject.destinationBranchId	= dataView.getItem(row).destinationBranchId;;
	jsonObject.wayBillTypeId	= dataView.getItem(row).waybillType;;
	
	$.ajax({
			type		: 	"POST",
			url			: 	WEB_SERVICE_URL + '/commissionReportWS/getCommissionCharges.do',
			data		:	jsonObject,
			dataType	: 	'json',
			success		: 	function(data) {
				if(data.message != undefined) {
					let errorMessage = data.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
					return;
				} else {
					viewCommissionCharges(data, wayBillNumber);
				}
		},
	});
}
function viewCommissionCharges(data, wayBillNumber){
	let commissionChargeHm = data.commissionChargeHm;
	let commissionChargesNameHm = data.commissionChargesNameHm;
	
	$('#popUpForCommissionCharges').html('').bPopup({},function(){
		var _thisMod = this;
		$(this).html(`
			<div class="modal" tabindex="-1" role="dialog" style='display: block;'>
			    <div class="modal-dialog" role="document">
			        <div class="modal-content">
			            <div class="modal-header"> <button type="button" class="close" data-dismiss="modal" aria-label="Close" id="cancelButton"> <span aria-hidden="true">&times;</span> </button> </div>
			            
			            <div id="lrNumber" style="margin-bottom: 10px; font-size: 16px"><b>LR No. `+ wayBillNumber +`</b></div>
			            <div style="margin-bottom: 10px; font-size: 16px"><b>Booking Charges</b></div>
			            
			            <div class="modal-body">
			                <table id="commiCharges" class="table table-bordered">
			                    <thead>
			                        <tr class="danger">
			                            <th>Charge</th>
			                            <th>Amount</th>
			                        </tr>
			                    </thead>
			                    <tbody id=""></tbody>
			                </table>
			            </div>
			        </div>
			    </div>
			</div>
		`);
		
		$("#cancelButton").click(function(){
			_thisMod.close();
		});
		
		if(commissionChargeHm != undefined){
			var columnArray		= [];
			var headerKey			= Object.keys(commissionChargeHm);
			for (var l = 0; l < headerKey.length; l++) {
	 			var chargeId = headerKey[l];
	 			var chargeAmt = commissionChargeHm[chargeId];
	 			var chargeName = commissionChargesNameHm[chargeId];
	 			
	 			columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + chargeName + "</td>");
	 			columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + chargeAmt + "</td>");
	 			$('#commiCharges tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
				columnArray = [];
			}
		}
	});
}

function commissionWayBillSearch(grid, dataView, row) {
	var item 	= dataView.getItem(row);
	
	if(item.waybillId != undefined && item.waybillId > 0)
		window.open('SearchWayBillAction.do?pageId=5&eventId=3&wayBillId=' + item.waybillId + '&TypeOfNumber=' + LR_SEARCH_TYPE_ID);
}
