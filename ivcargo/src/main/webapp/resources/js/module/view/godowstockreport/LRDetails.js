/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define([
	'slickGridWrapper2'
	,'errorshow'
	,'JsonUtility'
	,'messageUtility'
	,'constant'
	], function (slickGridWrapper2) {
	'use strict';// this basically give strictness to this specific js
	var 
	_this = '',
	pboData,
	btModal,
	jsonObject,
	filter = 0,
	sortByLastNumber,
	showGodownStockDetailsInSeparateTab;
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData){
			//initialize is the first function called on call new view()
			//append template first 
			//the html would be set in the el element
			//this object is not found in other function so _this has been created
			_this 				= this;
			btModal			= jsonObjectData.btModal;
			pboData			= localStorage.getItem("godownStockreportjsonObject");

			if( pboData != undefined && pboData != null){
				jsonObject	= JSON.parse(pboData).elementValue;
				filter			= jsonObject.stockTypeId;
			} else {
				jsonObject 				= jsonObjectData.elementValue;
				sortByLastNumber 		= jsonObject.sortByLastNumber;
			}
		}, render: function() {
			showLayer();
			
			if(jsonObject.godownId > 0)
				getJSON(jsonObject, WEB_SERVICE_URL + '/godownStockReportWS/getPendingLRDetailsByGodownId.do', _this.setElements, EXECUTE_WITH_ERROR);
			else
				getJSON(jsonObject, WEB_SERVICE_URL + '/godownStockReportWS/getPendingLRDetailsByDestinationId.do', _this.setElements, EXECUTE_WITH_ERROR);
		}, setElements : function(response) {
			if(response.CorporateAccount != undefined) {
				if(sortByLastNumber) {
					let dataSorting = response.CorporateAccount;
					
					for(const element of dataSorting) {
						let wayBillNo  = element.wayBillNumber;
						let lastNumber = wayBillNo.substring(wayBillNo.length - 1, wayBillNo.length);
						element.lastNumber = lastNumber;
					}
					
					response.CorporateAccount = _.sortBy(dataSorting,"lastNumber");
				}
				
				if( pboData != undefined && pboData != null) {
					$("#mainContent").load("/ivcargo/html/module/godownstockreport/godownStockReportLRDetails.html", function() {
					let heading	= '';
					switch (filter) {
						case 1:
							heading = 'Pending Dispatch';
							break;
						case 2:
							heading = 'Pending Delivery';
							break;
						case 3:
							heading = 'Pending Crossing';
							break;
						case 4:
							heading = 'Arrived';
							break;
						case 5:
							heading = 'Pending Stock Out';
							break;
						default:
							break;
					}
					
					$('#headerDetails').text(heading);
					slickGridWrapper2.setGrid(response);
				});
			} else {
				setTimeout(function() {
					slickGridWrapper2.setGrid(response);
				}, 1000);
				}
			}
			
			hideLayer();
		}
	});
});

