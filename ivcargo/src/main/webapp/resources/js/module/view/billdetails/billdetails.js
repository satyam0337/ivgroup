/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define([
        //the file which has only name they are are already  been loaded
        'marionette'//Marionette
		,'/ivcargo/resources/js/generic/urlparameter.js'
		//marionette JS framework
		,'slickGridWrapper2'
		,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
		,'messageUtility'
		], function(Marionette, UrlParameter, slickGridWrapper2, Selection) {

	'use strict';// this basically give strictness to this specific js 
	let myNod, billingPartyId = 0, _this, jsonObject = new Object();
	// to know about layout refer url:http://marionettejs.com/docs/v1.8.7/marionette.layout.html
	return Marionette.LayoutView.extend({
		initialize : function() {
			billingPartyId 	= UrlParameter.getModuleNameFromParam('masterid');
			_this = this;
		}, render : function() {
			jsonObject["BillingPartyId"] = billingPartyId;
			_this.getElementConfigDetails();
			//getJSON(jsonObject, CUSTOMER_ACCESS_URL_CONSTANT + '/lRRegisterReportWS/getLRRegisterReportElementConfiguration.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		}, getElementConfigDetails : function() {
			let loadelement 	= new Array();
			let baseHtml 		= new $.Deferred();

			loadelement.push(baseHtml);
					
			$("#mainContent").load("/ivcargo/html/report/accountreport/partyBillDetailsReport.html",function() {
				baseHtml.resolve();
			});
					
			$.when.apply($, loadelement).done(function() {
				let elementConfiguration	= new Object();
				let response	= new Object();
						
				elementConfiguration.dateElement		= $('#dateEle');
				response.elementConfiguration			= elementConfiguration;
				response.isCalenderSelection			= true
						
				Selection.setSelectionToGetData(response);

				hideLayer();
					
				$("#searchBtn").click(function() {
					_this.onSubmit();								
				});
			});
		}, onSubmit : function() {
			showLayer();
					
			let jsonObject = new Object();
					
			if($("#dateEle").attr('data-startdate') != undefined)
				jsonObject["startdate"] = $("#dateEle").attr('data-startdate'); 
					
			if($("#dateEle").attr('data-enddate') != undefined)
				jsonObject["enddate"] = $("#dateEle").attr('data-enddate'); 
					
			//temp basis testing purpose
			//no need to remove, just make it 0
			jsonObject["BillingPartyId"] = billingPartyId;
			jsonObject.isCRMPage = true;
			getJSON(jsonObject, CUSTOMER_ACCESS_URL_CONSTANT + '/partyBillDetailsReport/getPartyBillDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData : function(response) {
			hideLayer();

			if(response.message != undefined) {
				$('#bottom-border-boxshadow').addClass('hide');
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}

			if(response.PARTYBILLREPORT != undefined) {
				response.CorporateAccount = response.PARTYBILLREPORT;
				$('#bottom-border-boxshadow').removeClass('hide');
				slickGridWrapper2.setGrid(response);
			}
		}
	});
});

function billPaymentDetailsOnCRM(grid, dataView, row) {
	if (dataView.getItem(row).billBillNumber != undefined)
		window.open('header.do?modulename=searchDetails&masterid=' + dataView.getItem(row).billBillId + '&wayBillNumber=' + dataView.getItem(row).billBillNumber + '&isCRMPage=true&TypeOfNumber=' + SEARCH_TYPE_ID_CREDITOR_INVOICE);
}

function getpaymentDetailsofBill(grid,dataViewObject,row){
	require(['/ivcargo/resources/js/module/view/billdetails/showbillpaymentdetails.js',
		'/ivcargo/resources/js/backbone/backbone.bootstrap-modal.js'],function(ShowCharges,BootstrapModal){
		let object = new Object();
		object.row = dataViewObject.getItem(row)

		if(object.row.paymentDetails == undefined){
			showMessage('error','No Payment Details found for this bill');
			return false;
			
		}

		let btModal = new Backbone.BootstrapModal({
			content: new ShowCharges(object),
			title:"Payment Details",
			modalWidth : 50
		}).open();
		object.btModal = btModal;
		new ShowCharges(object)
		btModal.open();
	})
}
