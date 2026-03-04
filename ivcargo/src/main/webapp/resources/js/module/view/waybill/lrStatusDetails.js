/**
 * Anant 05-Mar-2024 12:42:22 am 2024
 */
var imageDataCache = {}; // Global variable to cache image data

define(['marionette'
	, '/ivcargo/resources/js/generic/urlparameter.js'
	,'slickGridWrapper2'
	, 'JsonUtility'
	, 'messageUtility'
	, 'focusnavigation'
],
	function(Marionette, UrlParameter, SlickGridWrapper2) {
		'use strict';// this basically give strictness to this specific js
		let jsonObject = new Object(), wayBillId, _this = '';
		//this is used to get the access of key in onRender because this keyword is not found in onRender function
		return Marionette.LayoutView.extend({
			initialize: function() {
				//initialize is the first function called on call new view()
				_this = this;
				wayBillId 		= UrlParameter.getModuleNameFromParam(MASTERID);
				jsonObject.waybillId = wayBillId;
			}, render: function() {
				jsonObject = new Object();
				jsonObject.waybillId = wayBillId;

				getJSON(jsonObject, WEB_SERVICE_URL + '/searchWayBillDetails/getLRSatusDetails.do?', _this.setDetails, EXECUTE_WITHOUT_ERROR);
			}, setDetails: function(response) {
				let loadelement = new Array();
				let baseHtml = new $.Deferred();

				loadelement.push(baseHtml);

				$("#mainContent").load("/ivcargo/html/module/waybill/lrStatusDetails.html", function() {
					baseHtml.resolve();
				});

				$.when.apply($, loadelement).done(function() {
					initialiseFocus();

					if (response.message != undefined) {
						let errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						hideLayer();
						setTimeout(() => {
							window.close();
						}, 1000);
						return;
					}

					_this.setLRDetails(response);

					hideLayer();
				});
			}, setLRDetails: function(response) {
				response.CorporateAccount	= response.wayBillStatusDetailsArr;
				SlickGridWrapper2.setGrid(response);
			}
	});
});

function openWindowForLRView(grid, dataView, row) {
	var item 	= dataView.getItem(row);
	
	if(item.searchType != undefined) {
		switch(item.searchType) {
			case SEARCH_TYPE_ID_LR:
				lrSearch(grid, dataView, row);
				break;
			case SEARCH_TYPE_ID_LS:
				lsSearch(grid, dataView, row);
				break;
			case SEARCH_TYPE_ID_TUR:
				if(item.transferReceiveLedgerId > 0)
					trlSearch(grid, dataView, row);
				else
					turSearch(grid, dataView, row);
				break;
			case SEARCH_TYPE_ID_CR:
				crSearch(grid, dataView, row);
				break;
			case SEARCH_TYPE_ID_DOOR_DELIVERY_MEMO:
				ddmSearch(grid, dataView, row);
				break;
			case SEARCH_TYPE_ID_TRANSFER_LEDGER:
				tlSearch(grid, dataView, row);
				break;
			case SEARCH_TYPE_ID_TRANSFER_RECEIVE_LEDGER:
				trlSearch(grid, dataView, row);
				break;
			default:
				break;
		}
	}
}