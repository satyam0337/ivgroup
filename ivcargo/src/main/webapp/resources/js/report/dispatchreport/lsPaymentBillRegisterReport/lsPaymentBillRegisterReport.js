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
	let jsonObject = new Object(), 
	myNod, _this = '';
	
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/lsPaymentBillRegisterReportWS/getLSBillRegisterElement.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		}, getElementConfigDetails : function(response){
			let loadelement = new Array();
			let baseHtml = new $.Deferred();

			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/report/dispatchreport/lsPaymentBillRegisterReport/lsPaymentBillRegisterReport.html", function() {
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

				response.sourceAreaSelection = true;
				response.isCalenderSelection = true;

				let elementConfiguration = new Object();

				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
				elementConfiguration.dateElement		= $('#dateEle');

				response.elementConfiguration = elementConfiguration;

				Selection.setSelectionToGetData(response);

				myNod = Selection.setNodElementForValidation(response);

				hideLayer();

				$("#findBtn").click(function() {
					myNod.performCheck();

					if (myNod.areAll('valid'))
						_this.onFind(false);
				});
						
			});
		}, onFind : function(isExcel) {
			showLayer();
					
			let json = Selection.getElementData();
			
			getJSON(json, WEB_SERVICE_URL + '/lsPaymentBillRegisterReportWS/lsBillRegisterReportData.do', _this.setData, EXECUTE_WITH_NEW_ERROR);
		}, setData : function(response) {
			hideLayer();

			if (response.message != undefined) {
				$('#bottom-border-boxshadow').addClass('hide');
				return;
			}

			if (response.CorporateAccount != undefined) {
				$('#bottom-border-boxshadow').removeClass('hide');
				hideAllMessages();
				slickGridWrapper2.setGrid(response);
			}
		}
	});
});

function lsBillExpenseSearch(grid, dataView,row) {
	hideLayer();
	require([PROJECT_IVUIRESOURCES+'/resources/js/report/dispatchreport/lsPaymentBillRegisterReport/lsBillExpensedetails.js'], function(BillExpenseDetail){
		if(dataView.getItem(row).pendingLSPaymentBillId != undefined) {
			let jsonObject 			= new Object();
			jsonObject.billId		= dataView.getItem(row).pendingLSPaymentBillId;
			
			let object 				= new Object();
			object.elementValue 	= jsonObject;
			object.gridObj 			= grid;
			object.billId			= dataView.getItem(row).pendingLSPaymentBillId;
			
			let btModal = new Backbone.BootstrapModal({
				content: new BillExpenseDetail(object),
				modalWidth: 80,
				title: 'Expense Details'

			}).open();
			
			object.btModal = btModal;
			new BillExpenseDetail(object)
			btModal.open();
			
		};
	});
}

