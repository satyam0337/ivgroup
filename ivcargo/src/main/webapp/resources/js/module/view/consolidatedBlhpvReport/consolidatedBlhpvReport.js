define([  'JsonUtility'
	,'messageUtility'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/consolidatedBlhpvReport/consolidatedBlhpvReportFilePath.js'
	,'jquerylingua'
	,'language'
	,'autocomplete'
	,'autocompleteWrapper'
	,'slickGridWrapper2'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	],function(JsonUtility, MessageUtility, FilePath, Lingua, Language, AutoComplete, AutoCompleteWrapper,
			slickGridWrapper2, NodValidation, BootstrapModal,ElementFocusNavigation,Selection) {
	'use strict';
	var jsonObject = new Object(), 
	myNod,  
	_this = '', 
	gridObject, 
	masterLangObj, 
	masterLangKeySet, 
	caLangObj, 
	caLangKeySet;
	
	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/ConsolidatedBlhpvReportWS/getConsolidatedBlhpvReportElementConfiguration.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},getElementConfigDetails : function(response){

			console.log("response : " ,response);
			
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			var executive	= response.executive;

			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/report/consolidatedBlhpvReport/consolidatedBlhpvReport.html",function() {
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
				
				var elementConfiguration	= new Object();

				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');

				response.elementConfiguration		= elementConfiguration;
				response.sourceAreaSelection		= true;
				response.isCalenderSelection		= true;
				response.isOneYearCalenderSelection	= false;
				response.monthLimit					= 12;

				Selection.setSelectionToGetData(response);
				
				masterLangObj 		= FilePath.loadLanguage();
				masterLangKeySet 	= loadLanguageWithParams(masterLangObj);

				myNod = nod();

				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector: '#regionEle',
					validate: 'validateAutocomplete:#regionEle_primary_key',
					errorMessage: 'Select proper Region !'
				});
				
				myNod.add({
					selector: '#subRegionEle',
					validate: 'validateAutocomplete:#subRegionEle_primary_key',
					errorMessage: 'Select proper Area !'
				});
				
				myNod.add({
					selector: '#branchEle',
					validate: 'validateAutocomplete:#branchEle_primary_key',
					errorMessage: 'Select proper Branch !'
				});

				$("#searchBtn").click(function() {
					myNod.performCheck();
					if(myNod.areAll('valid')){
						_this.onSubmit(_this);								
					}
				});

				hideLayer();

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

			jsonObject["regionId"] 					= $('#regionEle_primary_key').val();
			jsonObject["subRegionId"] 				= $('#subRegionEle_primary_key').val();
			jsonObject["sourceBranchId"] 			= $('#branchEle_primary_key').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/ConsolidatedBlhpvReportWS/getConsolidatedBlhpvReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		},setReportData : function(response) {

			$("#consolidatedBlhpvReportDiv").empty();
			if(response.message != undefined){
				hideLayer();
				$('#middle-border-boxshadow').hide();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
				return;
			}
			
			var consolidatedBlhpvReportModelColumnConfig		= response.ConsolidatedBlhpvReportModel.columnConfiguration;
			var consolidatedBlhpvReportModelKeys				= _.keys(consolidatedBlhpvReportModelColumnConfig);
			var bcolConfig										= new Object();
			
			for (var i=0; i<consolidatedBlhpvReportModelKeys.length; i++) {
				var bObj	= consolidatedBlhpvReportModelColumnConfig[consolidatedBlhpvReportModelKeys[i]];
				if (bObj.show == true) {
					bcolConfig[consolidatedBlhpvReportModelKeys[i]]	= bObj;
				}
			}
			
			response.ConsolidatedBlhpvReportModel.columnConfiguration		= bcolConfig;
			response.ConsolidatedBlhpvReportModel.Language					= masterLangKeySet;

			if(response.ConsolidatedBlhpvReportModel.CorporateAccount != undefined && response.ConsolidatedBlhpvReportModel.CorporateAccount.length > 0) {
				$('#middle-border-boxshadow').show();
				hideAllMessages();
				gridObject = slickGridWrapper2.setGrid(response.ConsolidatedBlhpvReportModel);
			} 
			
			hideLayer();
		}
	});
});

function transportSearch(grid,dataView,row){
	if(dataView.getItem(row).consolidatedBLHPVId != undefined){
		window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId='+dataView.getItem(row).consolidatedBLHPVId+'&wayBillNumber='+dataView.getItem(row).consolidatedBLHPVNumber+'&TypeOfNumber=26&BranchId='+dataView.getItem(row).branchId);
	} 
}