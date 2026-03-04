var PaymentTypeConstant;
var BillTypeConstant;
var dispatchWiseTopayLrSummryRprtData;
define([  'JsonUtility'
	,'messageUtility'
	,PROJECT_IVUIRESOURCES + '/resources/js/report/dispatchwiseTopayLrSummaryReport/dispatchWiseTopayLrSummaryReportfilepath.js'
	,'jquerylingua'
	,'language'
	,'autocomplete'
	,'autocompleteWrapper'
	,'selectizewrapper'
	,'slickGridWrapper2'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/module/view/newPartyBookingReport/LRDetailForNewPartyBookingReport.js'
	],function(JsonUtility, MessageUtility, FilePath, Lingua, Language, AutoComplete, AutoCompleteWrapper,
			Selectizewrapper,slickGridWrapper2, NodValidation, BootstrapModal,ElementFocusNavigation,Selection,LRDetails) {
	'use strict';
	var jsonObject = new Object(), 
	myNod,destinationWisePrintList,destinationWisePrintList1,weightWisePrintList,  
	_this = '', 
	gridObject, 
	masterLangObj, 
	masterLangKeySet, 
	btModal;
	
	
	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
			//jsonObject		= jsonObjectData.jsonObject;
			btModal			= masterObj.btModal;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/dispatchWiseTopayLrSummaryReportWS/getdispatchwiseTopayLrSummaryReportElementConfig.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},getElementConfigDetails : function(response){

			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			var executive	= response.executive;
			
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/report/dispatchWiseTopayLrSummaryReport/dispatchWiseTopayLrSummaryReport.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				var keyObject = Object.keys(response);
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]].show == true) {
						$("*[data-attribute="+ keyObject[i]+ "]").addClass("show");
					}
				}

				masterLangObj = FilePath.loadLanguage();
				masterLangKeySet = loadLanguageWithParams(masterLangObj);
				var elementConfiguration	= new Object();
				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
				
				response.elementConfiguration		= elementConfiguration;
				response.sourceAreaSelection		= true;
				response.isCalenderSelection		= true;
				response.AllOptionsForRegion		= response["dispatchWiseTopayLrSummaryConfiguration"].AllOptionsForRegion;
				response.AllOptionsForSubRegion		= response["dispatchWiseTopayLrSummaryConfiguration"].AllOptionsForSubRegion;
				response.AllOptionsForBranch		= response["dispatchWiseTopayLrSummaryConfiguration"].AllOptionsForBranch;
				response.isOneYearCalenderSelection	= response["dispatchWiseTopayLrSummaryConfiguration"].isOneYearCalenderSelection;
				response.monthLimit					= response["dispatchWiseTopayLrSummaryConfiguration"].monthLimit;
				Selection.setSelectionToGetData(response);
				
				myNod = nod();

				myNod.configure({
					parentClass:'validation-message'
				});
				
				if($('#regionEle').exists() && $('#regionEle').is(":visible")){
					myNod.add({
						selector: '#regionEle',
						validate: 'validateAutocomplete:#regionEle_primary_key',
						errorMessage: 'Select proper Region !'
					});
				}
				
				if($('#subRegionEle').exists() && $('#subRegionEle').is(":visible")){
					myNod.add({
						selector: '#subRegionEle',
						validate: 'validateAutocomplete:#subRegionEle_primary_key',
						errorMessage: 'Select proper Area !'
					});
				}
				
				if($('#branchEle').exists() && $('#branchEle').is(":visible")){
					myNod.add({
						selector: '#branchEle',
						validate: 'validateAutocomplete:#branchEle_primary_key',
						errorMessage: 'Select proper Branch !'
					});
				}
				
				var dataTypeList 		= new Array();
				 
				dataTypeList[0] = {'dataTypeId':1,'dataTypeName':'BranchWise'};
				dataTypeList[1] = {'dataTypeId':2,'dataTypeName':'LR Wise'};
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	dataTypeList,
					valueField		:	'dataTypeId',
					labelField		:	'dataTypeName',
					searchField		:	'dataTypeName',
					elementId		:	'dataTypeEle',
					create			: 	false,
					maxItems		: 	1,
				});
				
				
				myNod.add({
					selector		: '#dataTypeEle_wrapper',
					validate		: 'validateAutocomplete:#dataTypeEle',
					errorMessage	: 'Select Proper Data Type !'
				});
				hideLayer();

				$("#searchBtn").keyup(function(event) {
					if(event.which){
						var keycode = event.which;
						if(keycode == 13){
							next = 'searchBtn';
						}
					}
				});
			
				$("#searchBtn").click(function() {
					myNod.performCheck();
					if(myNod.areAll('valid')){
						_this.onSubmit(_this);								
					}
				});
				
			});

		},setReportData : function(response) {
			$("#dispatchWiseTopayLrSummrytDiv").empty();
				
			dispatchWiseTopayLrSummryRprtData = response.dispatchWiseTopayLrSummaryReport;
			if(response.message != undefined){
				hideLayer();
				$('#bottom-border-boxshadow').hide();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
				return;
			}
			var dispatchWiseTopayLrSummryRprtColumnConfig		= response.dispatchWiseTopayLrSummaryReport.columnConfiguration;
			var dispatchWiseTopayLrSummryRprtKeys				= _.keys(dispatchWiseTopayLrSummryRprtColumnConfig);
			var dispatchWiseTopayLrSummryRprtConfig				= new Object();
			
			for (var i=0; i<dispatchWiseTopayLrSummryRprtKeys.length; i++) {
				var bObj	= dispatchWiseTopayLrSummryRprtColumnConfig[dispatchWiseTopayLrSummryRprtKeys[i]];
				if (bObj.show == true) {
					dispatchWiseTopayLrSummryRprtConfig[dispatchWiseTopayLrSummryRprtKeys[i]] = bObj;
				}
			}
			
			response.dispatchWiseTopayLrSummaryReport.columnConfiguration		= dispatchWiseTopayLrSummryRprtConfig;
			response.dispatchWiseTopayLrSummaryReport.Language					= masterLangKeySet;
			
			if(response.dispatchWiseTopayLrSummaryReport.CorporateAccount != undefined && response.dispatchWiseTopayLrSummaryReport.CorporateAccount.length > 0) {
				$('#bottom-border-boxshadow').show();
				
				gridObject = slickGridWrapper2.setGrid(response.dispatchWiseTopayLrSummaryReport);
				$('#print_dispatchWiseTopayLrSummaryDetails').css("padding-left", "15px");
				$('#print_dispatchWiseTopayLrSummaryDetails').css("padding-top", "10px");
			} else {
				$('#bottom-border-boxshadow').hide();
			}
			
			hideLayer();
		},onSubmit : function() {
			showLayer();
			var jsonObject = new Object();
			var prevBranchId = $('#branchEle_primary_key').val();
			$("#prevBranchId").val(prevBranchId);
			
			if($("#dateEle").attr('data-startdate') != undefined){
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
			}

			if($("#dateEle").attr('data-enddate') != undefined){
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
			}
			jsonObject["regionId"] 					= $('#regionEle_primary_key').val();
			jsonObject["subRegionId"] 				= $('#subRegionEle_primary_key').val();
			jsonObject["sourceBranchId"] 			= $('#branchEle_primary_key').val();
			jsonObject["operationTypeId"] 			= $('#dataTypeEle').val();
			getJSON(jsonObject, WEB_SERVICE_URL+'/dispatchWiseTopayLrSummaryReportWS/getdispatchwiseTopayLrSummaryDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}
	});
});
function getPenddingLRDetail(grid, dataView,row){
	if(dataView.getItem(row).pendingTotal > 0){
		penddingLRDetail(grid, dataView,row);
	}
}
function penddingLRDetail(grid, dataView,row){
	
	showLayer();
	
	var jsonObject = new Object();
	
	if($("#dateEle").attr('data-startdate') != undefined){
		jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
	}

	if($("#dateEle").attr('data-enddate') != undefined){
		jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
	}
	jsonObject["regionId"] 					= $('#regionEle_primary_key').val();
	jsonObject["subRegionId"] 				= $('#subRegionEle_primary_key').val();
	jsonObject["sourceBranchId"] 			= $('#branchEle_primary_key').val();
	var corporateAccnt		= dispatchWiseTopayLrSummryRprtData.CorporateAccount;
	
	for(var i=0; i<corporateAccnt.length; i++ ){
		var obj = corporateAccnt[i];
		
		if(dataView.getItem(row).sourceBranchId != undefined 
		&& dataView.getItem(row).sourceBranchId == obj.sourceBranchId ) {
			jsonObject["srceBranchId"] 			= obj.sourceBranchId;
		}
	}
	require([PROJECT_IVUIRESOURCES + '/resources/js/report/dispatchwiseTopayLrSummaryReport/penddingLRDetailsForDispatchWiseTopayLrSumryReport.js'], function(LRDetails){
		var btModal = new Backbone.BootstrapModal({
			content		: new LRDetails(jsonObject),
			modalWidth 	: 80,
			okText		: 'Close',
			showFooter 	: true,
			title		: '<center>Pending LR Details</center>'

		}).open();
	});

	
}
