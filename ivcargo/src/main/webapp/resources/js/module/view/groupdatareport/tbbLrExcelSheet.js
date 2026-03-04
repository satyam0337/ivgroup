define(['JsonUtility',
	 'messageUtility',
	  PROJECT_IVUIRESOURCES + '/resources/js/module/view/groupdatareport/tbbLrExcelSheetReportfilepath.js',
	 'jquerylingua',
	 'language',
	 'bootstrapSwitch',
	 'slickGridWrapper2',
	 'nodvalidation',
	 'focusnavigation',
	 PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
	 PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	],function(JsonUtility, MessageUtility,FilePath, Lingua, Language, BootstrapSwitch, slickGridWrapper2, 
			NodValidation, FocusNavigation,BootstrapModal, Selection){
	'use strict';
	var jsonObject = new Object(), myNod, masterLangObj, masterLangKeySet, gridObject,  _this;
	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/TBBLrExcelSheetReportWS/getTbbLrExcelSheetElementConfiguration.do?',_this.setReportsElements, EXECUTE_WITH_ERROR);
			return _this;
		},setReportsElements : function(response){

			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			
			loadelement.push(baseHtml);
				$("#mainContent").load("/ivcargo/html/module/groupdatareport/TBBLrExcelSheet.html",function() {
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
				
				response.elementConfiguration	        = elementConfiguration;
				response.sourceAreaSelection	        = true;
				response.isCalenderSelection	        = true;
				
				Selection.setSelectionToGetData(response);
				
				//masterLangObj 		= FilePath.loadLanguage();
				//masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				hideLayer();
				
				$("#saveBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid')) {
						_this.onSubmit(_this);								
					}
				});
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
			getJSON(jsonObject, WEB_SERVICE_URL+'/TBBLrExcelSheetReportWS/getTbbLrExcelSheetDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
	
		},setReportData : function(response){
			$("#tbbLrExcelSheetDetailsDiv").empty();
			if(response.message != undefined){
				hideLayer();
				var errorMessage = response.message;
				showMessage('error', errorMessage.typeSymble + '  ' +  errorMessage.description);
				$('#middle-border-boxshadow').addClass('hide');
				return;
			}
			
			var tbbLrExcelSheetReportColumnConfig	= response.TBBLrExcelSheetReport.columnConfiguration;
			var sequenceKeys	= _.keys(tbbLrExcelSheetReportColumnConfig);
			var dcolConfig		= new Object();
			for (var i=0; i<sequenceKeys.length; i++) {
				var dObj	= tbbLrExcelSheetReportColumnConfig[sequenceKeys[i]];
				if(dObj != null) {
					if (dObj.show == true) {
						dcolConfig[sequenceKeys[i]]	= dObj;
					}
				}
			}
			response.TBBLrExcelSheetReport.columnConfiguration	= dcolConfig;
			
			masterLangObj 		= FilePath.loadLanguage();
			masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
			
			response.TBBLrExcelSheetReport.Language	= masterLangKeySet;
			
			if(response.TBBLrExcelSheetReport.CorporateAccount != undefined && response.TBBLrExcelSheetReport.CorporateAccount.length > 0) {
				$('#middle-border-boxshadow').removeClass('hide');
				gridObject = slickGridWrapper2.setGrid(response.TBBLrExcelSheetReport);
				
			}
			hideLayer();
		}
	});
});