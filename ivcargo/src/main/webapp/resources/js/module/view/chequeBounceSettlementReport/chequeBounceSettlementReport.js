define([  
	PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,'selectizewrapper'
	,'slickGridWrapper2'
	,'JsonUtility'
	,'messageUtility'
	,'jquerylingua'
	,'language'
	,'nodvalidation'
	,'focusnavigation'//import in require.config
	
	], function(Selection, Selectizewrapper, slickGridWrapper2) {
	'use strict';
	let jsonObject = new Object(), myNod, _this = '';

	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/chequeBounceSettlementReportWS/getChequeBounceSettlementReportElement.do?',	_this.getElementConfigDetails, EXECUTE_WITHOUT_ERROR);
			return _this;
		},getElementConfigDetails : function(response){
			showLayer();
			let loadelement 			= new Array();
			let baseHtml 				= new $.Deferred();

			loadelement.push(baseHtml);
			$("#mainContent").load("/ivcargo/html/module/chequeBounceSettlementReport/chequeBounceSettlementReport.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				let keyObject = Object.keys(response);
				
				for (const element of keyObject) {
					if (response[element])
						$("*[data-attribute="+ element+ "]").removeClass("hide");
				}
				
				let elementConfiguration				= new Object();
				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
				response.elementConfiguration				= elementConfiguration;
				response.isCalenderSelection				= true;
			
			//	response.sourceAreaSelectionWithSelectize	= true;
						
				Selection.setSelectionToGetData(response);
				
				let selectionTypeList 		= new Array();
				 
				selectionTypeList[0] = {'selectionTypeId':BOOKING,'selectionTypeName':'Booking'};
				selectionTypeList[1] = {'selectionTypeId':GENERATE_CR,'selectionTypeName':'Delivery'};
				selectionTypeList[2] = {'selectionTypeId':BILL_PAYMENT,'selectionTypeName':'Invoice'};
				selectionTypeList[3] = {'selectionTypeId':SHORT_CREDIT_PAYMENT,'selectionTypeName':'Short Credit'};
				selectionTypeList[4] = {'selectionTypeId':0,'selectionTypeName':'ALL'};
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	selectionTypeList,
					valueField		:	'selectionTypeId',
					labelField		:	'selectionTypeName',
					searchField		:	'selectionTypeName',
					elementId		:	'selectionTypeEle',
					create			: 	false,
					maxItems		: 	1,
				});
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.regionList,
					valueField		:	'regionId',
					labelField		:	'regionName',
					searchField		:	'regionName',
					elementId		:	'regionEle',
					create			: 	false,
					maxItems		: 	1
				});
				
				Selectizewrapper.setAutocomplete({
			//		jsonResultList	: 	response.subRegion,
					valueField		:	'subRegionId',
					labelField		:	'subRegionName',
					searchField		:	'subRegionName',
					elementId		:	'subRegionEle'
				});
				
				Selectizewrapper.setAutocomplete({
			//		jsonResultList	: 	response.sourceBranch,
					valueField		:	'branchId',
					labelField		:	'branchName',
					searchField		:	'branchName',
					elementId		:	'branchEle'
				});
				
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector		: '#selectionTypeEle_wrapper',
					validate		: 'validateAutocomplete:#selectionTypeEle',
					errorMessage	: 'Select Proper Selection Type !'
				});
				
				myNod.add({
					selector		: '#regionEle_wrapper',
					validate		: 'validateAutocomplete:#regionEle',
					errorMessage	: 'Select proper Region !'
				});
				
				myNod.add({
					selector		: '#subRegionEle_wrapper',
					validate		: 'validateAutocomplete:#subRegionEle',
					errorMessage	: 'Select proper SubRegion !'
				});
				
				myNod.add({
					selector		: '#branchEle_wrapper',
					validate		: 'validateAutocomplete:#branchEle',
					errorMessage	: 'Select proper Branch !'
				});
				
				$("#regionEle").change(function() {
					_this.getSubRegionByRegion();
				});

				$("#subRegionEle").change(function() {
					_this.getBranchBySubRegion();
				});
				
				
				hideLayer();
				
				$("#saveBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit();								
				});
			});
		},getSubRegionByRegion : function() {
			var jsonObject = new Object();
			jsonObject.regionSelectEle_primary_key 		= Number($('#regionEle').val());
			jsonObject.AllOptionsForSubRegion 	   		= AllOptionsForSubRegion;
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/selectOptionsWS/getSubRegionOption.do', _this.setSubRegionOnRegion,EXECUTE_WITH_ERROR);
			
		},getBranchBySubRegion : function() {
			
			var jsonObject = new Object();
			jsonObject.subRegionSelectEle_primary_key 	= Number($('#subRegionEle').val());
			jsonObject.AllOptionsForBranch 			 	= AllOptionsForBranch;
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/selectOptionsWS/getPhysicalBranchOption.do', _this.setBranchOnSubRegion, EXECUTE_WITH_ERROR);
			
		},setSubRegionOnRegion : function(response) {
			
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	response.subRegion,
				valueField		:	'subRegionId',
				labelField		:	'subRegionName',
				searchField		:	'subRegionName',
				elementId		:	'subRegionEle'
			});
			
		},setBranchOnSubRegion : function(response) {
			
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	response.sourceBranch,
				valueField		:	'branchId',
				labelField		:	'branchName',
				searchField		:	'branchName',
				elementId		:	'branchEle'
			});
			
		},onSubmit : function() {
			showLayer();
			
			let jsonObject = new Object();

			if($("#dateEle").attr('data-startdate') != undefined)
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
			
			if($("#dateEle").attr('data-enddate') != undefined)
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
			
			jsonObject["txnTypeId"] 		= $('#selectionTypeEle').val();
			jsonObject["regionId"] 			= $('#regionEle').val();
			jsonObject["subRegionId"] 		= $('#subRegionEle').val();
			jsonObject["sourceBranchId"] 	= $('#branchEle').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/chequeBounceSettlementReportWS/getChequeBounceSettlementReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
			
		}, setReportData : function(response) {
			$("#chequeBounceSettlementBookingReportDiv").empty();
			$("#chequeBounceSettlementDeliveryReportDiv").empty();
			$("#chequeBounceSettlementInvoiceReportDiv").empty();
			$("#chequeBounceSettlementShortCreditReportDiv").empty();
			
			if(response.message != undefined) {
				$('#middle-border-boxshadow').addClass('hide');
				$('#bottom-border-boxshadow').addClass('hide');
				$('#left-border-boxshadow').addClass('hide');
				$('#right-border-boxshadow').addClass('hide');
				showMessage(response.message.typeName, response.message.description);
				hideLayer();
				return;
			} 
			
			if(response.lrChequeBounceDetailsList != undefined && response.lrChequeBounceDetailsList.CorporateAccount != undefined) {
				$('#middle-border-boxshadow').removeClass('hide');
				slickGridWrapper2.setGrid(response.lrChequeBounceDetailsList);
			} else
				$('#middle-border-boxshadow').addClass('hide');
			
			if(response.deliveryChequeBounceDetailsList != undefined && response.deliveryChequeBounceDetailsList.CorporateAccount != undefined) {
				$('#bottom-border-boxshadow').removeClass('hide');
				slickGridWrapper2.setGrid(response.deliveryChequeBounceDetailsList);
			} else
				$('#bottom-border-boxshadow').addClass('hide');
			
			if(response.invoiceChequeBounceDetailsList != undefined && response.invoiceChequeBounceDetailsList.CorporateAccount != undefined) {
				$('#left-border-boxshadow').removeClass('hide');
				slickGridWrapper2.setGrid(response.invoiceChequeBounceDetailsList);
			} else
				$('#left-border-boxshadow').addClass('hide');

			if(response.shortCreditChequeBounceDetailsList != undefined && response.shortCreditChequeBounceDetailsList.CorporateAccount != undefined) {
				$('#right-border-boxshadow').removeClass('hide');
				slickGridWrapper2.setGrid(response.shortCreditChequeBounceDetailsList);
			} else
				$('#right-border-boxshadow').addClass('hide');
		
			hideLayer();
		}
	});
});

function transportSearch(grid, dataView, row) {
	if(dataView.getItem(row).operationId != undefined) {
		if(dataView.getItem(row).moduleIdentifier == BOOKING)
			window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId='+dataView.getItem(row).operationId+'&wayBillNumber='+dataView.getItem(row).operationNumber+'&TypeOfNumber=1&BranchId=0&CityId=0&searchBy=');
		else if(dataView.getItem(row).moduleIdentifier == GENERATE_CR)
			window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId='+dataView.getItem(row).operationId+'&wayBillNumber='+dataView.getItem(row).operationNumber+'&TypeOfNumber=5&BranchId='+dataView.getItem(row).branchId+'&CityId=0&searchBy='+dataView.getItem(row).branchName);
		else if(dataView.getItem(row).moduleIdentifier == BILL_PAYMENT)
			window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId='+dataView.getItem(row).operationId+'&wayBillNumber='+dataView.getItem(row).operationNumber+'&TypeOfNumber=6&BranchId='+dataView.getItem(row).branchId+'&CityId=0&searchBy='+dataView.getItem(row).branchName);
		else if(dataView.getItem(row).moduleIdentifier == SHORT_CREDIT_PAYMENT)
			window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId='+dataView.getItem(row).operationId+'&wayBillNumber='+dataView.getItem(row).operationNumber+'&TypeOfNumber=1&BranchId=0&CityId=0&searchBy=');
	} 
}