
define([  'JsonUtility'
	,'messageUtility'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/allbranchdaillycollectionreport/allbranchdaillycollectionreportfilepath.js'
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
	myNod,destinationWisePrintList,destinationWisePrintList1,weightWisePrintList,  
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
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/allBranchDaillyCollectionReportWS/getAllBranchDaillyCollectionReportElementConfiguration.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},getElementConfigDetails : function(response){

			console.log("response : " ,response);
			
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			var executive	= response.executive;

			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/allbranchdaillycollectionreport/AllBranchDaillyCollectionReport.html",function() {
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

				response.elementConfiguration	= elementConfiguration;
				response.sourceAreaSelection	= true;
				response.isCalenderSelection	= true;

				Selection.setSelectionToGetData(response);
				
			

				masterLangObj 		= FilePath.loadLanguage();
				masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
				myNod = nod();

				myNod.configure({
					parentClass:'validation-message'
				});
				hideLayer();

				$("#searchBtn").click(function() {
					myNod.performCheck();
					if(myNod.areAll('valid')){
						_this.onSubmit(_this);								
					}
				});
			});

		},setReportData : function(response) {


			$("#allBranchDaillyCollectionReportDiv").empty();

			if(response.message != undefined){
				hideLayer();
				$('#bottom-border-boxshadow').hide();
				$('#btnprint_allBranchDaillyCollectionReportDetails').hide();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}
			
			var allBranchWiseCollectionReportModelColumnConfig		= response.ALLBranchWiseCollectionReportModel.columnConfiguration;
			var allBranchWiseCollectionReportModelKeys				= _.keys(allBranchWiseCollectionReportModelColumnConfig);
			var bcolConfig									= new Object();
			
			for (var i=0; i<allBranchWiseCollectionReportModelKeys.length; i++) {
				var bObj	= allBranchWiseCollectionReportModelColumnConfig[allBranchWiseCollectionReportModelKeys[i]];
				if (bObj.show == true) {
					bcolConfig[allBranchWiseCollectionReportModelKeys[i]]	= bObj;
				}
			}
			
			response.ALLBranchWiseCollectionReportModel.columnConfiguration		= bcolConfig;
			response.ALLBranchWiseCollectionReportModel.Language					= masterLangKeySet;

			if(response.ALLBranchWiseCollectionReportModel.CorporateAccount != undefined && response.ALLBranchWiseCollectionReportModel.CorporateAccount.length > 0) {
				$('#bottom-border-boxshadow').show();
				$('#btnprint_allBranchDaillyCollectionReportDetails').show();
				gridObject = slickGridWrapper2.setGrid(response.ALLBranchWiseCollectionReportModel);
				$('#print_allBranchDaillyCollectionReportDetails').css("padding-left", "15px");
				$('#print_allBranchDaillyCollectionReportDetails').css("padding-top", "10px");
			} else {
				$('#bottom-border-boxshadow').hide();
				$('#btnprint_allBranchDaillyCollectionReportDetails').hide();
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
			getJSON(jsonObject, WEB_SERVICE_URL+'/allBranchDaillyCollectionReportWS/getAllBranchDaillyCollectionReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}
	});
});