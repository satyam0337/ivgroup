define([  
	'slickGridWrapper2'
	,PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js'
	,'JsonUtility'
	,'messageUtility'
	,'jquerylingua'
	,'language'
	,'autocomplete'
	,'autocompleteWrapper'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
	,PROJECT_IVUIRESOURCES+'/resources/js/module/saveReportRequest.js'
	,'focusnavigation'//import in require.config
	],function(slickGridWrapper2, Selection) {
	'use strict';
	let jsonObject = new Object(), myNod,  _this = '';
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/gstr1ReportWS/getGstr1ReportElementConfiguration.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},getElementConfigDetails : function(response){

			let loadelement = new Array();
			let baseHtml = new $.Deferred();
			let executive	= response.executive;

			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/gstr1report/Gstr1Report.html", function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				let keyObject = Object.keys(response);
				
				for (const element of keyObject) {
					if (response[element])
						$("*[data-attribute="+ element+ "]").removeClass("hide");
				}
				
				_this.setSelectType();	

				response.isOneYearCalenderSelection	= false;
				response.monthLimit					= response.monthLimitToShowDate;
				response.companyWiseStateAndBranchSelection		= response.companyWiseGSTR1Report;
				response.branchWithStateSelection				= true;
				response.destinationBranchWithStateSelection	= true;
				response.isPhysicalBranchesShow					= true;
				response.isCalenderSelection					= true;
				response.AllOptionForDestinationBranch			= true;
				response.AllOptionForDivision					= false;
				response.divisionSelection						= response.showDivisionSelection;
		
				if(response.divisionSelection)
					$('#DivisionSelection').removeClass('hide');
				else
					$('#DivisionSelection').remove();
				
				let elementConfiguration	= {};
				
				elementConfiguration.companyNameElement	= $('#companyNameEle');
				elementConfiguration.srcStateElement	= $('#srcStateEle');
				elementConfiguration.destStateElement	= $('#toStateEle');
				elementConfiguration.branchElement		= $('#branchEle');
				elementConfiguration.destBranchElement	= $('#destBranchEle');
				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.divisionElement	= $('#divisionEle');
				
				response.elementConfiguration		= elementConfiguration;
				
				Selection.setSelectionToGetData(response);
;
				myNod = nod();

				myNod.configure({
					parentClass:'validation-message'
				});

				if (executive.executiveType == 1) {
					if(response.companyWiseGSTR1Report) {
						myNod.add({
							selector: '#companyNameEle',
							validate: 'validateAutocomplete:#companyNameEle_primary_key',
							errorMessage: 'Select Proper Company !'
						});
					}

					myNod.add({
						selector: '#srcStateEle',
						validate: 'validateAutocomplete:#srcStateEle_primary_key',
						errorMessage: 'Select Proper Source State !'
					});

					myNod.add({
						selector: '#branchEle',
						validate: 'validateAutocomplete:#branchEle_primary_key',
						errorMessage: 'Select Proper Source Branch !'
					});
				}

				hideLayer();

				$("#findBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit(this);								
				});
				
				$('#maxDaysToFindReport').val(response.maxDaysToFindReport);
				
				$("#dateEle").change(function(){
					checkDate();
				});
				
				$("#sendRequest").click(function(){
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						saveReportRequest(1);	
				});
				
				if(response.showDownloadExcelButton) {
					$("#downloadtoExcelBtn").removeClass('hide');
				
					$("#downloadtoExcelBtn").click(function() {
						myNod.performCheck();
					
						if(myNod.areAll('valid'))
							_this.onSubmit(this);						
					});
				} else
					$('#downloadtoExcelBtn').remove();
				
				if(response.showDownloadToJsonButton) {
					$("#downloadToJsonBtn").removeClass('hide');
				
					$("#downloadToJsonBtn").click(function() {
						myNod.performCheck();
					
						if(myNod.areAll('valid'))
							_this.onSubmit(this);							
					});
				} else
					$('#downloadToJsonBtn').remove();
			});
		}, onSubmit : function(obj) {
			showLayer();
			let jsonObject = Selection.getElementData();
			
			jsonObject["txnTypeId"] 			= $('#selectTypeEle_primary_key').val();
			jsonObject["isDownloadForJson"] 	= obj.id == 'downloadToJsonBtn';
			jsonObject["isDownloadForExcel"] 	= obj.id == 'downloadtoExcelBtn';
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/gstr1ReportWS/getGstr1ReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}, setSelectType : function() {
			
			_this.setSelectTypeAutocompleteInstance();
			
			let autoSelectType = $("#selectTypeEle").getInstance();
			
			let SelectTYPE = [
			        { "selectTypeId":1, "selectTypeName": "BOOKING" },
			        { "selectTypeId":2, "selectTypeName": "DELIVERY" },
			    ]
			
			$( autoSelectType ).each(function() {
				this.option.source = SelectTYPE;
			})
		},setSelectTypeAutocompleteInstance : function() {
			let autoSelectTypeName 			= new Object();
			autoSelectTypeName.primary_key 	= 'selectTypeId';
			autoSelectTypeName.field 		= 'selectTypeName';

			$("#selectTypeEle").autocompleteCustom(autoSelectTypeName)
		}, setReportData : function(response) {
			if(response.message != undefined) {
				hideLayer();
				let errorMessage = response.message;
				
				if(errorMessage.messageId == 21)//Missing records
					$('#bottom-border-boxshadow').addClass('hide');
				
				if(errorMessage.type == 2)
					return;
			
				if(response.FilePath != undefined && errorMessage.messageId == 546)//json
					downloadJsonFile(response, WEB_SERVICE_URL_CONSTANT);
			
				if(response.FilePath != undefined && errorMessage.messageId == 409)//excel
					generateFileToDownload(response);
			}

			if(response.CorporateAccount != undefined && response.CorporateAccount.length > 0) {
				$('#bottom-border-boxshadow').removeClass('hide');
				slickGridWrapper2.setGrid(response);
			}

			hideLayer();
		}
	});
});

function setJsonData(jsonObject){
	
		if($("#dateEle").attr('data-startdate') != undefined){
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
			}

			if($("#dateEle").attr('data-enddate') != undefined){
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
			}

			jsonObject["companyHeadMasterId"] 	= $("#companyNameEle_primary_key").val();
			jsonObject["stateId"] 				= $('#srcStateEle_primary_key').val();
			jsonObject["sourceBranchId"] 		= $('#branchEle_primary_key').val();
			jsonObject["toStateId"] 			= $('#toStateEle_primary_key').val();
			jsonObject["destinationBranchId"] 	= $('#destBranchEle_primary_key').val();
			jsonObject["divisionId"]			= $('#divisionEle_primary_key').val();  
			jsonObject["isExcel"] 				= true;
			jsonObject.filter					= 8;
}

function ValidateFormElement(type){
	if(type == 1 && !validateSelectedDate()){
		showMessage('error',"You can not find report for more than "+$('#maxDaysToFindReport').val()+" days , Please use request option !");
		return false;
	}
	
	return true;
}