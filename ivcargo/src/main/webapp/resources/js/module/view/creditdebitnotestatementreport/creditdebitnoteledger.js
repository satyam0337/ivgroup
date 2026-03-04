var isGroupAdmin		= false,
isRegionAdmin		= false,
isSubRegionAdmin	= false,
isNormalUser		= false;
define([  'JsonUtility'
	,'messageUtility'
	,'/ivcargo/resources/js/generic/urlparameter.js'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/creditdebitnotestatementreport/creditdebitnoteledgerfilepath.js'
	,'jquerylingua'
	,'language'
	,'autocomplete'
	,'autocompleteWrapper'
	,'slickGridWrapper3'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	],function(JsonUtility, MessageUtility, UrlParameter, FilePath, Lingua, Language, AutoComplete, AutoCompleteWrapper,
			slickGridWrapper3, NodValidation, BootstrapModal,ElementFocusNavigation,Selection) {
	'use strict';
	var jsonObject = new Object(), 
	myNod,  
	_this = '', 
	gridObject, 
	masterLangObj, 
	masterLangKeySet,branchId,subRegionId,regionId,fromDate,toDate,toTime,filter,onDebitCreditFlag = false;
	
	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
			branchId		 	= UrlParameter.getModuleNameFromParam('branch');
			regionId		 	= UrlParameter.getModuleNameFromParam('region');
			subRegionId		 	= UrlParameter.getModuleNameFromParam('subRegion');
			fromDate			= UrlParameter.getModuleNameFromParam('fromDate');
			toDate 				= UrlParameter.getModuleNameFromParam('toDate');
			filter				= UrlParameter.getModuleNameFromParam('filter');
			toTime				= UrlParameter.getModuleNameFromParam('toTime');
			onDebitCreditFlag	= UrlParameter.getModuleNameFromParam('onDebitCreditFlag');
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/creditDebitNoteReportWS/getCreditDebitNoteReportElementConfiguration.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},getElementConfigDetails : function(response){

			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			var executive	= response.executive;

			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/creditdebitnoteledgerreport/creditDebitNoteReport.html",function() {
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

				masterLangObj 		= FilePath.loadLanguage();
				masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
				
				
				var elementConfiguration	= new Object();
				
				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');

				response.elementConfiguration		= elementConfiguration;
				response.sourceAreaSelection		= true;
				response.isCalenderSelection		= true;
				response.AllOptionsForRegion  		= true;
				response.AllOptionsForSubRegion 	= true;
				response.AllOptionsForBranch 		= true;
				response.isOneYearCalenderSelection	= true;
				response.monthLimit					= 12;
				Selection.setSelectionToGetData(response);

				myNod = nod();

				myNod.configure({
					parentClass:'validation-message'
				});
		
				if (executive.executiveType == EXECUTIVE_TYPE_GROUPADMIN) {
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
				}
				hideLayer();

				$("#searchBtn").click(function() {
					myNod.performCheck();
					if(myNod.areAll('valid')){
						_this.onSubmit(_this);								
					}
				});
				
				
					if(executive.executiveType == EXECUTIVE_TYPE_GROUPADMIN) {
						isGroupAdmin		= true;
					} else if(executive.executiveType == EXECUTIVE_TYPE_REGIONADMIN) {
						isRegionAdmin		= true;
					} else if(executive.executiveType == EXECUTIVE_TYPE_SUBREGIONADMIN) {
						isSubRegionAdmin	= true;	
					} else {
						isNormalUser		= true;
					}
						
				if(onDebitCreditFlag){
					var regionList = response.regionList;
					if(regionList != null ) {
						for(const element of regionList) {
							if(element.regionId == regionId) {
								$("#regionEle").val(element.regionName);
								$('#regionEle_primary_key').val(element.regionId);
							}
						}
					}
					
					var cashStatementObj 	= 	new Object();

					cashStatementObj.isFromCashStatement	= true;
					cashStatementObj.regionId				= regionId;
					cashStatementObj.subRegionId			= subRegionId;
					cashStatementObj.branchId				= branchId;
					cashStatementObj.subRegionEle			= $('#subRegionEle');
					cashStatementObj.branchEle				= $('#branchEle');
					cashStatementObj.isGroupAdmin			= isGroupAdmin;
					cashStatementObj.isRegionAdmin			= isRegionAdmin;
					cashStatementObj.isSubRegionAdmin		= isSubRegionAdmin;
					cashStatementObj.isNormalUser			= isNormalUser;
					
					Selection.setDropDownForCashStatementLink(cashStatementObj);
					
					$('#regionEle_primary_key').val(regionId);
					$('#subRegionEle_primary_key').val(subRegionId);
					$('#branchEle_primary_key').val(branchId);
					$("#dateEle").attr('data-startdate', fromDate);
					$("#dateEle").attr('data-enddate', toDate); 
					$('#dateEle').val(fromDate + " - " + toDate);
					_this.onSubmit();	
				}
			});

		},setReportData : function(response) {
			console.log("response = ",response);
			if(response.message != undefined) {
				hideLayer();
				$('#middle-border-boxshadow').hide();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				return;
			}
			
			var ColumnConfig = response.creditDebitNote.columnConfiguration;
			var columnKeys	= _.keys(ColumnConfig);
			
			var modelConfig		= new Object();

			for (var i = 0; i < columnKeys.length; i++) {
				var bObj	= ColumnConfig[columnKeys[i]];

				if (bObj.show != undefined && bObj.show == true)
					modelConfig[columnKeys[i]] = bObj;
			}
			
			response.creditDebitNote.columnConfiguration	= _.values(modelConfig);
			response.creditDebitNote.Language				= masterLangKeySet;
			
			if(response.creditDebitNote.CorporateAccount != undefined) {
				$('#middle-border-boxshadow').show();
				hideAllMessages();
				slickGridWrapper3.applyGrid(
							{
								ColumnHead					: response.creditDebitNote.columnConfiguration, // *compulsory // for table headers
								ColumnData					: _.values(response.creditDebitNote.CorporateAccount), 	// *compulsory // for table's data
								Language					: response.creditDebitNote.Language, 			// *compulsory for table's header row language
								ShowPrintButton				: true,
								ShowCheckBox				: false,
								removeSelectAllCheckBox		: 'true',
								fullTableHeight				: false,
								rowHeight 					: 	30,
								DivId						: 'billDetailsDiv',				// *compulsary field // division id where slickgrid table has to be created
								SerialNo:[{						// optional field // for showing Row number
									showSerialNo	: true,
									searchFilter	: false,          // for search filter on serial no
									ListFilter		: false				// for list filter on serial no
								}],
								InnerSlickId				: 'editReportDivInner', // Div Id
								InnerSlickHeight			: '350px',
								NoVerticalScrollBar			: false //optional for no vertical scrolling & if set true remove height attribute to Grid Div
							});
			}
			
			hideLayer();
		},onSubmit : function() {
			showLayer();
			jsonObject = new Object();
			if(onDebitCreditFlag){
				jsonObject["fromDate"] 			= fromDate;
				jsonObject["toDate"] 			= toDate;
				jsonObject["regionId"] 			= regionId
				jsonObject["subRegionId"] 		= subRegionId;
				jsonObject["sourceBranchId"]	= branchId;
				jsonObject["onDebitCreditFlag"]	= onDebitCreditFlag;
				jsonObject["filter"]			= filter;
				jsonObject["toTime"]			= toTime;
			} else{
				if($("#dateEle").attr('data-startdate') != undefined){
					jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
				}
				if($("#dateEle").attr('data-enddate') != undefined){
					jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
				}
				jsonObject["regionId"] 					= $('#regionEle_primary_key').val();
				jsonObject["subRegionId"] 				= $('#subRegionEle_primary_key').val();
				jsonObject["sourceBranchId"] 			= $('#branchEle_primary_key').val();
			}

			getJSON(jsonObject, WEB_SERVICE_URL+'/creditDebitNoteReportWS/getCreditDebitNoteReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}
	});
});