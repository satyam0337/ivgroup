var ModuleIdentifierConstant = null;
define([  'JsonUtility'
	,'messageUtility'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/pendingChequeBounceReport/pendingChequeBounceReportfilepath.js'
	,'jquerylingua'
	,'language'
	,'selectizewrapper'
	,'slickGridWrapper3'
	,'slickGridWrapper2'
	,'nodvalidation'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	
	],function(JsonUtility, MessageUtility, FilePath, Lingua, Language, Selectizewrapper, slickGridWrapper3, slickGridWrapper2, NodValidation, FocusNavigation,
			 BootstrapModal, Selection) {
	'use strict';
	var jsonObject = new Object(), 
	myNod,  
	viewObject,
	gridObject, 
	masterLangObj, 
	masterLangKeySet, 
	caLangObj, 
	caLangKeySet,
	selectionTypeAll = true,
	_this = '';

	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/pendingChequeBounceReportWS/getPendingChequeBounceReportElement.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},getElementConfigDetails : function(response){
			showLayer();
			console.log("response",response)
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();

			loadelement.push(baseHtml);
			$("#mainContent").load("/ivcargo/html/module/pendingChequeBounceReport/pendingChequeBounceReport.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				var keyObject = Object.keys(response);
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]].show == true) {
						$("*[data-attribute="+ keyObject[i]+ "]").addClass("show");
					}
					
					selectionTypeAll = response['selectionTypeAll'].show;
				}
				var elementConfiguration				= new Object();
				elementConfiguration.dateElement		= $('#dateEle');
				response.elementConfiguration			= elementConfiguration;
				response.isCalenderSelection			= true;
				
				Selection.setSelectionToGetData(response);
				
				var selectionTypeList 		= new Array();
				 
				selectionTypeList[0] = {'selectionTypeId':6,'selectionTypeName':'Booking'};
				selectionTypeList[1] = {'selectionTypeId':1,'selectionTypeName':'Delivery'};
				selectionTypeList[2] = {'selectionTypeId':12,'selectionTypeName':'Invoice'};
				selectionTypeList[3] = {'selectionTypeId':11,'selectionTypeName':'Short Credit'};
				if(selectionTypeAll){
					selectionTypeList[4] = {'selectionTypeId':0,'selectionTypeName':'ALL'};
				}
				
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
				//	jsonResultList	: 	response.subRegion,
					valueField		:	'subRegionId',
					labelField		:	'subRegionName',
					searchField		:	'subRegionName',
					elementId		:	'subRegionEle'
				});
				
				Selectizewrapper.setAutocomplete({
				//	jsonResultList	: 	response.sourceBranch,
					valueField		:	'branchId',
					labelField		:	'branchName',
					searchField		:	'branchName',
					elementId		:	'branchEle'
				});
				
				masterLangObj 		= FilePath.loadLanguage();
				masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
				
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
				
			
				$("#regionEle").change(function(){
					_this.getSubRegionByRegion();
				});
				
				$("#subRegionEle").change(function(){
					_this.getBranchBySubRegion();
				});
				
				
				hideLayer();
				
				$("#saveBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid')) {
						_this.onSubmit();								
					}
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
			var jsonObject = new Object();

			if($("#dateEle").attr('data-startdate') != undefined){
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
			}
			if($("#dateEle").attr('data-enddate') != undefined){
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
			}
			
			jsonObject["moduleId"] 			= $('#selectionTypeEle').val();
			jsonObject["regionId"] 			= $('#regionEle').val();
			jsonObject["subRegionId"] 		= $('#subRegionEle').val();
			jsonObject["branchId"] 			= $('#branchEle').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/pendingChequeBounceReportWS/getPendingChequeBounceReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
			
		},setReportData : function(response){
			
			$("#pendingChequeBounceBookingReportDiv").empty();
			$("#pendingChequeBounceDeliveryReportDiv").empty();
			$("#pendingChequeBounceInvoiceReportDiv").empty();
			$("#pendingChequeBounceShortCreditReportDiv").empty();
			
			if(response.message != undefined){
				$('#middle-border-boxshadow').hide();
				$('#bottom-border-boxshadow').hide();
				$('#pendingChequeBounceReportDiv').hide();
				$('#pendingChequeBounceReportDiv1').hide();
				$("#pendingChequeBounceBookingReportDiv").hide();
				$("#pendingChequeBounceDeliveryReportDiv").hide();
				$("#pendingChequeBounceInvoiceReportDiv").hide();
				$("#pendingChequeBounceShortCreditReportDiv").hide();
				showMessage(response.message.typeName, response.message.description);
				hideLayer();
				return;
			} 
			var flagForNoRecords		= false;
			ModuleIdentifierConstant	= response.ModuleIdentifierConstant;
			
			if(response.lrChequeBounceDetailsList != undefined  && response.lrChequeBounceDetailsList.CorporateAccount != undefined
					&& response.lrChequeBounceDetailsList.CorporateAccount.length > 0) {
				flagForNoRecords				= true;
				var PendingBookingColumnConfig  = response.lrChequeBounceDetailsList.columnConfiguration;
				var PendingBookingColumnKeys	= _.keys(PendingBookingColumnConfig);
				var PendingBookingConfig		= new Object();
				
				for (var i = 0; i < PendingBookingColumnKeys.length; i++) {
					
					var bObj	= PendingBookingColumnConfig[PendingBookingColumnKeys[i]];
					
					if (bObj.show == true) {
						PendingBookingConfig[PendingBookingColumnKeys[i]] = bObj;
					}
				}
			
				response.lrChequeBounceDetailsList.columnConfiguration	= PendingBookingConfig;
				response.lrChequeBounceDetailsList.Language				= masterLangKeySet;
				
				$('#middle-border-boxshadow').hide();
				$('#bottom-border-boxshadow').show();
				$('#pendingChequeBounceBookingReport').show();
				hideAllMessages();
				gridObject = slickGridWrapper2.setGrid(response.lrChequeBounceDetailsList);
			} else {
				$('#bottom-border-boxshadow').hide();
				$('#pendingChequeBounceBookingReport').hide();
			}
			if(response.deliveryChequeBounceDetailsList != undefined && response.deliveryChequeBounceDetailsList.CorporateAccount != undefined
					&& response.deliveryChequeBounceDetailsList.CorporateAccount.length > 0) {
				
				flagForNoRecords				= true;
				var PendingDeliveryColumnConfig = response.deliveryChequeBounceDetailsList.columnConfiguration;
				var PendingDeliveryColumnKeys	= _.keys(PendingDeliveryColumnConfig);
				var PendingDeliveryConfig		= new Object();
				
				for (var i = 0; i < PendingDeliveryColumnKeys.length; i++) {
					
					var bObj	= PendingDeliveryColumnConfig[PendingDeliveryColumnKeys[i]];
					
					if (bObj.show == true) {
						PendingDeliveryConfig[PendingDeliveryColumnKeys[i]] = bObj;
					}
				}
				
				response.deliveryChequeBounceDetailsList.columnConfiguration	= PendingDeliveryConfig;
				response.deliveryChequeBounceDetailsList.Language				= masterLangKeySet;
				
				$('#middle-border-boxshadow').hide();
				$('#bottom-border-boxshadow').show();
				$('#pendingChequeBounceDeliveryReport').show();
				hideAllMessages();
				gridObject = slickGridWrapper2.setGrid(response.deliveryChequeBounceDetailsList);
			} else {
				$('#bottom-border-boxshadow').hide();
				$('#pendingChequeBounceDeliveryReport').hide();
			}
			if(response.invoiceChequeBounceDetailsList != undefined && response.invoiceChequeBounceDetailsList.CorporateAccount != undefined
					&& response.invoiceChequeBounceDetailsList.CorporateAccount.length > 0) {
				
				flagForNoRecords				= true;
				var PendingInvoiceColumnConfig  = response.invoiceChequeBounceDetailsList.columnConfiguration;
				var PendingInvoiceColumnKeys	= _.keys(PendingInvoiceColumnConfig);
				var PendingInvoiceConfig		= new Object();
				
				for (var i = 0; i < PendingInvoiceColumnKeys.length; i++) {
					
					var bObj	= PendingInvoiceColumnConfig[PendingInvoiceColumnKeys[i]];
					
					if (bObj.show == true) {
						PendingInvoiceConfig[PendingInvoiceColumnKeys[i]] = bObj;
					}
				}
				
				response.invoiceChequeBounceDetailsList.columnConfiguration	= PendingInvoiceConfig;
				response.invoiceChequeBounceDetailsList.Language			= masterLangKeySet;
				
				$('#middle-border-boxshadow').hide();
				$('#bottom-border-boxshadow').show();
				$('#pendingChequeBounceInvoiceReport').show();
				hideAllMessages();
				gridObject = slickGridWrapper2.setGrid(response.invoiceChequeBounceDetailsList);
			} else {
				$('#bottom-border-boxshadow').hide();
				$('#pendingChequeBounceInvoiceReport').hide();
			}
			if(response.shortCreditChequeBounceDetailsList != undefined && response.shortCreditChequeBounceDetailsList.CorporateAccount != undefined
					&& response.shortCreditChequeBounceDetailsList.CorporateAccount.length > 0) {
				
				flagForNoRecords					= true;
				var PendingShortCreditColumnConfig  = response.shortCreditChequeBounceDetailsList.columnConfiguration;
				var PendingShortCreditColumnKeys	= _.keys(PendingShortCreditColumnConfig);
				var PendingShortCreditConfig		= new Object();
				
				for (var i = 0; i < PendingDeliveryColumnKeys.length; i++) {
					
					var bObj	= PendingShortCreditColumnConfig[PendingShortCreditColumnKeys[i]];
					
					if (bObj.show == true) {
						PendingShortCreditConfig[PendingShortCreditColumnKeys[i]] = bObj;
					}
				}
				
				response.shortCreditChequeBounceDetailsList.columnConfiguration	= _.values(PendingShortCreditConfig);
				response.shortCreditChequeBounceDetailsList.Language				= masterLangKeySet;
				
				$('#middle-border-boxshadow').hide();
				$('#bottom-border-boxshadow').show();
				$('#pendingChequeBounceShortCreditReport').show();
				hideAllMessages();
				gridObject = slickGridWrapper2.setGrid(response.shortCreditChequeBounceDetailsList);
			} else {
				$('#bottom-border-boxshadow').hide();
				$('#pendingChequeBounceShortCreditReport').hide();
			}
			if(response.PendingChequeBounceReportModel != undefined && response.PendingChequeBounceReportModel.CorporateAccount != undefined
					&& response.PendingChequeBounceReportModel.CorporateAccount.length > 0) {
				
				flagForNoRecords							= true;
				var PendingChequeBounceReportColumnConfig 	= response.PendingChequeBounceReportModel.columnConfiguration;
				var PendingChequeBounceReportColumnKeys		= _.keys(PendingChequeBounceReportColumnConfig);
				var PendingChequeBounceReportConfig			= new Object();
				
				for (var i = 0; i < PendingChequeBounceReportColumnKeys.length; i++) {
					
					var bObj	= PendingChequeBounceReportColumnConfig[PendingChequeBounceReportColumnKeys[i]];
					
					if (bObj.show == true) {
						PendingChequeBounceReportConfig[PendingChequeBounceReportColumnKeys[i]] = bObj;
					}
				}
				
				response.PendingChequeBounceReportModel.columnConfiguration	= _.values(PendingChequeBounceReportConfig);
				response.PendingChequeBounceReportModel.Language				= masterLangKeySet;
				
				$('#bottom-border-boxshadow').hide();
				$('#middle-border-boxshadow').show();
				$('#pendingChequeBounceReportDiv1').show();
				hideAllMessages();
				gridObject = slickGridWrapper2.setGrid(response.PendingChequeBounceReportModel);
			} else {
				$('#middle-border-boxshadow').hide();
				$('#pendingChequeBounceReportDiv1').hide();
			}
			if(!flagForNoRecords){
				console.log('flagForNoRecords --- ', flagForNoRecords)
				showMessage("error","No Records Found!");
				hideLayer();
				return;
			}	
		
		hideLayer();
		
		}
	});
});

function transportSearch(grid,dataView,row){
	if(dataView.getItem(row).operationId != undefined){
		if(dataView.getItem(row).moduleIdentifier == ModuleIdentifierConstant.BOOKING){
			window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId='+dataView.getItem(row).operationId+'&wayBillNumber='+dataView.getItem(row).operationNumber+'&TypeOfNumber=1&BranchId=0&CityId=0&searchBy=');
		}else if(dataView.getItem(row).moduleIdentifier == ModuleIdentifierConstant.GENERATE_CR){
			window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId='+dataView.getItem(row).operationId+'&wayBillNumber='+dataView.getItem(row).operationNumber+'&TypeOfNumber=5&BranchId='+dataView.getItem(row).sourceBranchId+'&CityId=0&searchBy='+dataView.getItem(row).branchName);
		}else if(dataView.getItem(row).moduleIdentifier == ModuleIdentifierConstant.BILL_PAYMENT){
			window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId='+dataView.getItem(row).operationId+'&wayBillNumber='+dataView.getItem(row).operationNumber+'&TypeOfNumber=6&BranchId='+dataView.getItem(row).sourceBranchId+'&CityId=0&searchBy='+dataView.getItem(row).branchName);
		}else if(dataView.getItem(row).moduleIdentifier == ModuleIdentifierConstant.SHORT_CREDIT_PAYMENT){
			window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId='+dataView.getItem(row).operationId+'&wayBillNumber='+dataView.getItem(row).operationNumber+'&TypeOfNumber=1&BranchId=0&CityId=0&searchBy=');
		}
	} 
}