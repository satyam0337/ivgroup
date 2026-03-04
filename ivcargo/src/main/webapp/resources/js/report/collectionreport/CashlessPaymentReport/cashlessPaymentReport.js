define([
	 'slickGridWrapper2'
	 ,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,'JsonUtility',
	 'messageUtility',
	 'nodvalidation',
	 'focusnavigation',
	 PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
	],function(slickGridWrapper2, Selection){
	'use strict';
	var jsonObject = new Object(), myNod,  _this;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/cashlessPaymentReportWS/getCashlessPaymentReportElement.do?', _this.setCashlessPaymentReportsElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setCashlessPaymentReportsElements : function(response) {
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			
			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/report/collectionreport/cashlesspaymentreport/CashlessPaymentReport.html", function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
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
				elementConfiguration.paymentTypeElement	= $('#paymentTypeEle');
				
				response.elementConfiguration	= elementConfiguration;
				response.sourceAreaSelection	= true;
				response.isCalenderSelection	= true;
				response.paymentTypeSelection	= true;
				
				Selection.setSelectionToGetData(response);
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				if($('#regionEle').exists() && $('#regionEle').is(":visible"))
					addAutocompleteElementInNode(myNod, 'regionEle', 'Select proper Region !');
				
				if($('#subRegionEle').exists() && $('#subRegionEle').is(":visible"))
					addAutocompleteElementInNode(myNod, 'subRegionEle', 'Select proper Area !');
				
				if($('#branchEle').exists() && $('#branchEle').is(":visible"))
					addAutocompleteElementInNode(myNod, 'branchEle', 'Select proper Branch !');
				
				if($('#paymentTypeEle').exists() && $('#paymentTypeEle').is(":visible"))
					addAutocompleteElementInNode(myNod, 'paymentTypeEle', 'Select proper Payment Type !');
					
				hideLayer();
				
				$("#findBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit();								
				});
			});
		}, onSubmit : function() {
			showLayer();
			
			var jsonObject = new Object();
			
			if($("#dateEle").attr('data-startdate') != undefined)
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
			
			if($("#dateEle").attr('data-enddate') != undefined)
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
			
			jsonObject["regionId"] 			= $('#regionEle_primary_key').val();
			jsonObject["subRegionId"] 		= $('#subRegionEle_primary_key').val();
			jsonObject["sourceBranchId"] 	= $('#branchEle_primary_key').val();
			jsonObject["paymentTypeId"] 	= $('#paymentTypeEle_primary_key').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/cashlessPaymentReportWS/getCashlessPaymentReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData : function(response){
			$("#cashlessPaymentDetailsDiv").empty();
			
			if(response.message != undefined) {
				hideLayer();
				$('#middle-border-boxshadow').addClass('hide');
				
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}
			
			if(response.CashlessPaymentReport != undefined && response.CashlessPaymentReport.CorporateAccount != undefined) {
				$('#middle-border-boxshadow').removeClass('hide');
				hideAllMessages();
				response.CashlessPaymentReport.Language				= {};
				slickGridWrapper2.setGrid(response.CashlessPaymentReport);
			} else {
				$('#middle-border-boxshadow').addClass('hide');
			}
			
			hideLayer();
		}
	});
});

function billPaymentDetails(grid, dataView, row) {
	if(dataView.getItem(row).documentTypeId == BILL_PAYMENT) {
		if(dataView.getItem(row).documentId != undefined)
			window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId='+dataView.getItem(row).documentId+'&wayBillNumber='+dataView.getItem(row).documentNumber+'&TypeOfNumber=6&BranchId='+dataView.getItem(row).documentBranchId+'&CityId=0&searchBy='+dataView.getItem(row).documenBranchName);
	} else if((dataView.getItem(row).documentTypeId == BOOKING 
			|| dataView.getItem(row).documentTypeId == GENERATE_CR
			|| dataView.getItem(row).documentTypeId == SHORT_CREDIT_PAYMENT) && dataView.getItem(row).documentId != undefined) {
			window.open('SearchWayBillAction.do?pageId=5&eventId=3&wayBillId=' + dataView.getItem(row).documentId + '&NumberType=1&BranchId=0');
	}
}