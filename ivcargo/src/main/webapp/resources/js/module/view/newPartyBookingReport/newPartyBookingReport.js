var PaymentTypeConstant;
var BillTypeConstant;
var newPartyBkngReprtData;
define([  'JsonUtility'
	,'messageUtility'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/newPartyBookingReport/newPartyBookingReportfilepath.js'
	,'jquerylingua'
	,'language'
	,'autocomplete'
	,'autocompleteWrapper'
	,'slickGridWrapper2'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/module/view/newPartyBookingReport/LRDetailForNewPartyBookingReport.js'
	],function(JsonUtility, MessageUtility, FilePath, Lingua, Language, AutoComplete, AutoCompleteWrapper,
			slickGridWrapper2, NodValidation, BootstrapModal,ElementFocusNavigation,Selection,LRDetails) {
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
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/newPartyBookingReportWS/getnewPartyBookingReportElementConfiguration.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},getElementConfigDetails : function(response){

			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			var executive	= response.executive;
			
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/newPartyBookingReport/newPartyBookingReport.html",function() {
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
				response.AllOptionsForRegion		= response["newPartyBookingReportConfiguration"].AllOptionsForRegion;
				response.AllOptionsForSubRegion		= response["newPartyBookingReportConfiguration"].AllOptionsForSubRegion;
				response.AllOptionsForBranch		= response["newPartyBookingReportConfiguration"].AllOptionsForBranch;
				response.isOneYearCalenderSelection	= response["newPartyBookingReportConfiguration"].isOneYearCalenderSelection;
				response.monthLimit					= response["newPartyBookingReportConfiguration"].monthLimit;
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
			$("#newPartyBookingReportDiv").empty();
				
			console.log("response001>>",response);
			newPartyBkngReprtData = response.newPartyBookingReport;
			console.log("newPartyBkngReprtData11111>>>",newPartyBkngReprtData);
			if(response.message != undefined){
				hideLayer();
				$('#bottom-border-boxshadow').hide();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
				return;
			}
			var newPartyBookingReportColumnConfig		= response.newPartyBookingReport.columnConfiguration;
			var newPartyBookingReportKeys			= _.keys(newPartyBookingReportColumnConfig);
			var newPartyBookingReportConfig				= new Object();
			
			for (var i=0; i<newPartyBookingReportKeys.length; i++) {
				var bObj	= newPartyBookingReportColumnConfig[newPartyBookingReportKeys[i]];
				if (bObj.show == true) {
					newPartyBookingReportConfig[newPartyBookingReportKeys[i]] = bObj;
				}
			}
			
			response.newPartyBookingReport.columnConfiguration		= newPartyBookingReportConfig;
			response.newPartyBookingReport.Language					= masterLangKeySet;

			if(response.newPartyBookingReport.CorporateAccount != undefined && response.newPartyBookingReport.CorporateAccount.length > 0) {
				$('#bottom-border-boxshadow').show();
				response.newPartyBookingReport.tableProperties.callBackFunctionForPartial = _this.LRDetailForNewPartyBkngRprt;
				$('#btnprint_newPartyBookingReportDetails').show();
				gridObject = slickGridWrapper2.setGrid(response.newPartyBookingReport);
				$('#print_newPartyBookingReportDetails').css("padding-left", "15px");
				$('#print_newPartyBookingReportDetails').css("padding-top", "10px");
			} else {
				$('#bottom-border-boxshadow').hide();
			}
			
			hideLayer();
		},onSubmit : function() {
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
			getJSON(jsonObject, WEB_SERVICE_URL+'/newPartyBookingReportWS/getNewPartyBookingReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}
	});
});

function LRDetailForNewPartyBkngRprt(grid, dataView,row){
	
	showLayer();
	
	var jsonObject = new Object();
	
	if($("#dateEle").attr('data-startdate') != undefined){
		jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
	}

	if($("#dateEle").attr('data-enddate') != undefined){
		jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
	}
	
	if($('#branchEle_primary_key').val() > 0){
		jsonObject["sourceBranchId"] = $('#branchEle_primary_key').val();
	}
	
	var corporateAccnt		= newPartyBkngReprtData.CorporateAccount;
	
	for(var i=0; i<corporateAccnt.length; i++ ){
		var obj = corporateAccnt[i];
		
		
		if(dataView.getItem(row).corporateAccntId != undefined 
		&& dataView.getItem(row).corporateAccntId == obj.corporateAccntId ) {
			jsonObject["corporateAccountId"] 			= obj.corporateAccntId;
			jsonObject["sourceBranchId"]				= obj.branchId;
		}
	}
	require([PROJECT_IVUIRESOURCES + '/resources/js/module/view/newPartyBookingReport/LRDetailForNewPartyBookingReport.js'], function(LRDetails){
		var btModal = new Backbone.BootstrapModal({
			content		: new LRDetails(jsonObject),
			modalWidth 	: 80,
			okText		: 'Close',
			showFooter 	: true,
			title		: '<center>LR Details</center>'

		}).open();
	});

	
}
