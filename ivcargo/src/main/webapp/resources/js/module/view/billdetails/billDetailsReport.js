define([  
	'slickGridWrapper2'
	,'selectizewrapper'
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,'JsonUtility'
	,'messageUtility'
	,'autocomplete'
	,'autocompleteWrapper'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'focusnavigation'//import in require.config
	],function(slickGridWrapper2, Selectizewrapper, Selection) {
	'use strict';
	var jsonObject = new Object(), 
	myNod,  
	_this = '', 
	billTypeShow = false;
	
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/billDetailsReportWS/getBillDetailsReportElementConfiguration.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		}, getElementConfigDetails : function(response){

			var loadelement = new Array();
			var baseHtml = new $.Deferred();

			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/billdetailsreport/BillDetailsReport.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				$("*[data-selector=header]").html(response.reportName);

				var keyObject = Object.keys(response);
				
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]])
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
				}

				var elementConfiguration	= new Object();
				
				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
				elementConfiguration.partyNameElement	= $("#partyNameEle");
				elementConfiguration.collectionPersonNameElement	= $("#collectionPersonEle");
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.BillTypeConstantList,
					valueField		:	'billTypeId',
					labelField		:	'billType',
					searchField		:	'billType',
					elementId		:	'billTypeEle',
					create			: 	false,
					maxItems		: 	1
				});

				response.elementConfiguration		= elementConfiguration;
				response.isCalenderSelection		= true;
				response.executiveTypeWiseCollectionPersonSelection	= response.collectionPerson;
				
				if (response.billingPartyName) {
					response.billingPartySelectionWithSelectize = response.billingPartyName;
				} if (response.partyName) {
					response.partySelectionWithoutSelectize = response.partyName;
				}

				Selection.setSelectionToGetData(response);

				billTypeShow = response.billType;
				
				myNod = Selection.setNodElementForValidation(response);

				hideLayer();

				$("#searchBtn").click(function() {
					myNod.performCheck();

					if(myNod.areAll('valid'))
						_this.onSubmit(false);								
				});
				
				$("#downloadExcel").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit(true);								
				});
			});
		}, setReportData : function(response) {
			hideLayer();
			
			$("#billDetailsReportDiv").empty();

			if(response.message != undefined && response.message.messageId != EXCEL_GENERATED_SUCCESSFULLY) {
				$('#bottom-border-boxshadow').addClass('hide');
				return;
			}
			
			if(response.FilePath != undefined) {
				generateFileToDownload(response);
				return;
			}

			if(response.CorporateAccount != undefined && response.CorporateAccount.length > 0) {
				$('#bottom-border-boxshadow').removeClass('hide');
				response.tableProperties.callBackFunctionForPartial = _this.wayBillSearch;
				slickGridWrapper2.setGrid(response);
			} else
				$('#bottom-border-boxshadow').addClass('hide');
		}, onSubmit : function(isExcel) {
			var jsonObject = Selection.getElementData();

			jsonObject["billTypeId"] 	= $('#billTypeEle').val();
			jsonObject["isExcel"]		= isExcel;

			var id =
				$('#partyNameEle_primary_key').val() ||
				$('#billingPartyNameEle_primary_key').val() ||
				$('#partyNameEle').val() ||
				$('#billingPartyNameEle').val();

			jsonObject["corporateAccountId"] = id;

			if(billTypeShow && $('#billTypeEle').val() == "") {
				showAlertMessage('error', "Please Select Bill Type ! ");
				$('#controlinput_billTypeEle').focus();
				return false;
			}


			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL+'/billDetailsReportWS/getBillDetailsReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}
	});
});

function PaymentDetails(grid, dataView, row) {
	if(dataView.getItem(row).billId != undefined) {
		if(dataView.getItem(row).paymentStatus == PAYMENT_TYPE_STATUS_DUE_PAYMENT_ID || dataView.getItem(row).paymentStatus == PAYMENT_TYPE_STATUS_CANCELLED_ID)
			showAlertMessage('error',"No Payment Details");
		else
			childwin = window.open ('viewDetails.do?pageId=340&eventId=2&modulename=billPaymentDetails&billId='+dataView.getItem(row).billId,'newwindow', config='height=400,width=800, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	}
}

function billPaymentDetails(grid, dataView, row) {
	if(dataView.getItem(row).billId != undefined)
		window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId='+dataView.getItem(row).billId+'&wayBillNumber='+dataView.getItem(row).billNo+'&TypeOfNumber=6&BranchId='+dataView.getItem(row).branchId+'&CityId=0&searchBy='+dataView.getItem(row).branchStr);
}

function wayBillSearch(grid, dataView,row) {
	hideLayer();
	require([PROJECT_IVUIRESOURCES+'/resources/js/module/view/billdetails/billlrdetails.js'], function(LRDetails){
		if(dataView.getItem(row).billId != undefined) {
			var jsonObject 			= new Object();
			jsonObject.billId 		= dataView.getItem(row).billId;
			
			var object 				= new Object();
			object.elementValue 	= jsonObject;
			object.gridObj 			= grid;
			object.billId			= dataView.getItem(row).billId;
			
			if(dataView.getItem(row).billTypeId == NORMAL_BILL_TYPE_ID) {
				var btModal = new Backbone.BootstrapModal({
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

function openBillPrint(grid, dataView, row) {
	if(dataView.getItem(row).billId != undefined)
		window.open('BillPrint.do?pageId=215&eventId=6&billId='+dataView.getItem(row).billId, 'newwindow', config='height=610,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function getEditHistoryDetails(grid, dataView, row) {
	hideLayer();
	require([PROJECT_IVUIRESOURCES+'/resources/js/module/view/billdetails/billEditHistoryDetails.js'], function(BillEditHistoryDetails){
		if(dataView.getItem(row).billId != undefined){
			var jsonObject 			= new Object();
			jsonObject.billId 		= dataView.getItem(row).billId;
			
			var object 				= new Object();
			object.elementValue 	= jsonObject;
			object.gridObj 			= grid;
			object.billId			= dataView.getItem(row).billId;
			
			if(dataView.getItem(row).billTypeId == NORMAL_BILL_TYPE_ID && dataView.getItem(row).editHistoryExists) {
				var btModal = new Backbone.BootstrapModal({
					content: new BillEditHistoryDetails(object),
					modalWidth : 80,
					title:'Edit History'
	
				}).open();
				object.btModal = btModal;
				new BillEditHistoryDetails(object)
				btModal.open();
			} else {
				showAlertMessage('error',"No Edit History Found");
			}
		};
	});
}