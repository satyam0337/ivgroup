define([  
	'slickGridWrapper2'
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,'JsonUtility'
	,'messageUtility'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'focusnavigation'//import in require.config
	],function(slickGridWrapper2, Selection) {
	'use strict';
	let jsonObject = new Object(), myNod,  _this = ''; 
	
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/report/invoiceRegisterReportWS/getInvoiceRegisterReportEleConfiguration.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		}, getElementConfigDetails : function(response){

			let loadelement = new Array();
			let baseHtml = new $.Deferred();

			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/report/accountreport/invoiceRegisterReport/invoiceRegisterReport.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				$("*[data-selector=header]").html(response.reportName);

				let keyObject = Object.keys(response);
				
				for (const element of keyObject) {
					if (response[element])
						$("*[data-attribute="+ element+ "]").removeClass("hide");
				}

				let elementConfiguration	= new Object();
				
				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');

				response.elementConfiguration		= elementConfiguration;
				response.isCalenderSelection		= true;
				response.sourceAreaSelection		= true;

				Selection.setSelectionToGetData(response);
				
				myNod = Selection.setNodElementForValidation(response);

				hideLayer();

				$("#searchBtn").click(function() {
					myNod.performCheck();

					if(myNod.areAll('valid'))
						_this.onSubmit();								
				});
			});
		}, setReportData : function(response) {
			hideLayer();
			
			$("#invoiceRegisterReportDiv").empty();
			
			if(response.CorporateAccount != undefined && response.CorporateAccount.length > 0) {
				$('#bottom-border-boxshadow').removeClass('hide');
				response.tableProperties.callBackFunctionForPartial = _this.wayBillSearch;
				slickGridWrapper2.setGrid(response);
			} else
				$('#bottom-border-boxshadow').addClass('hide');
		}, onSubmit : function() {
			let jsonObject = Selection.getElementData();
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL+'/report/invoiceRegisterReportWS/getInvoiceRegisterDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}
	});
});

function billPaymentDetails(grid, dataView, row) {
	if(dataView.getItem(row).billId != undefined)
		window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId='+dataView.getItem(row).billId+'&wayBillNumber='+dataView.getItem(row).billNo+'&TypeOfNumber=6&BranchId='+dataView.getItem(row).billBranchId+'&CityId=0&searchBy='+dataView.getItem(row).billBranchNameStr);
}

function wayBillSearch(grid, dataView,row) {
	hideLayer();
	require([PROJECT_IVUIRESOURCES+'/resources/js/module/view/billdetails/billlrdetails.js'], function(LRDetails){
		if(dataView.getItem(row).billId != undefined) {
			let jsonObject 			= new Object();
			jsonObject.billId 		= dataView.getItem(row).billId;
			
			let object 				= new Object();
			object.elementValue 	= jsonObject;
			object.gridObj 			= grid;
			object.billId			= dataView.getItem(row).billId;
			
			if(dataView.getItem(row).billTypeId == NORMAL_BILL_TYPE_ID) {
				let btModal = new Backbone.BootstrapModal({
					content: new LRDetails(object),
					modalWidth : 80,
					title:'LR Details'
	
				}).open();
				object.btModal = btModal;
				new LRDetails(object)
				btModal.open();
			} else {
				showAlertMessage('error',"No LR Details");
			}
		};
	});
}