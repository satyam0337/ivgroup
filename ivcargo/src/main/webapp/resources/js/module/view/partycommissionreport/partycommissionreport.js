
define([  'JsonUtility'
	,'messageUtility'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/partycommissionreport/partycommissionreportfilepath.js'
	,'jquerylingua'
	,'language'
	,'autocomplete'
	,'autocompleteWrapper'
	,'slickGridWrapper3'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
	],function(JsonUtility, MessageUtility, FilePath, Lingua, Language, AutoComplete, AutoCompleteWrapper,
			slickGridWrapper3, NodValidation, BootstrapModal,ElementFocusNavigation,Selection,DatePickerCus) {
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
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/partyCommissionReportWS/getPartyCommissionReportElementConfiguration.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},getElementConfigDetails : function(response){

			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			var executive	= response.executive;
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/partycommissionreport/PartyCommissionReport.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				var keyObject = Object.keys(response);
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]].show == true) {
						$("*[data-attribute="+ keyObject[i]+ "]").addClass("show");
					}
					if (keyObject[i] == 'date' && response[keyObject[i]].show == false) {
						$("*[data-attribute="+ keyObject[i]+ "]").empty();
					}
				}
				
				var options	= new Object();
				
				if(response.sixMonthDateRange != undefined){
					options.sixMonthDateRange	= response.sixMonthDateRange.allow;
					}

					if(response.threeMonthDateRange != undefined){
					options.threeMonthDateRange	= response.threeMonthDateRange.allow;
					}

					if(response.oneYearDateRange != undefined){
					options.oneYearDateRange	= response.oneYearDateRange.allow;
					}
					
					if(response.showMonthWiseDateSelection != undefined){
						options.showMonthWiseDateSelection	= response.showMonthWiseDateSelection.allow;
					}
					
				$("#dateEle").DatePickerCus(options);
				
				var elementConfiguration	= new Object();

				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
				
				response.elementConfiguration	= elementConfiguration;
				response.sourceAreaSelection	= true;
				response.isPhysicalBranchesShow	= true;
				response.AllOptionsForRegion	= true;
				
				Selection.setSelectionToGetData(response);

				masterLangObj 		= FilePath.loadLanguage();
				masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
				
				myNod = nod();

				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector: '#regionEle',
					validate: 'presence',
					errorMessage: 'Select proper Region !'
				});

				myNod.add({
					selector: '#subRegionEle',
					validate: 'presence',
					errorMessage: 'Select proper Area !'
				});

				myNod.add({
					selector: '#branchEle',
					validate: 'presence',
					errorMessage: 'Select proper Branch !'
				});
				
				myNod.add({
					selector: '#partyEle',
					validate: 'presence',
					errorMessage: 'Select proper Party !'
				});
				
				var autoPartyName = new Object();
				
				autoPartyName.primary_key 		 = 'corporateAccountId';
				autoPartyName.url 				 = WEB_SERVICE_URL+'/autoCompleteWS/getPartyDetailsAutocomplete.do?isSearchByAllParty=true';
				autoPartyName.field 			 = 'corporateAccountDisplayName';
				$("#partyEle").autocompleteCustom(autoPartyName);
				
				hideLayer();

				$("#find").click(function() {
					myNod.performCheck();
					if(myNod.areAll('valid')){
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
			
			jsonObject["regionId"] 				= $('#regionEle_primary_key').val();
			jsonObject["subRegionId"] 			= $('#subRegionEle_primary_key').val();
			jsonObject["branchId"] 				= $('#branchEle_primary_key').val();
			jsonObject["corporateAccountId"] 	= $('#partyEle_primary_key').val();
			getJSON(jsonObject, WEB_SERVICE_URL+'/partyCommissionReportWS/getPartyCommissionReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		},setReportData : function(response){
			if(response.message != undefined) {
				hideLayer();
				$('#bottom-border-boxshadow').addClass('hide');
				
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}
			if(response.partyCommissionReportDetails != undefined) {
				var partyCommissionReportDetailsColumnConfig 	= response.partyCommissionReportDetails.columnConfiguration;
				var partyCommissionReportDetailsColumnKeys		= _.keys(partyCommissionReportDetailsColumnConfig);
				var partyCommissionReportDetailsConfig			= new Object();

				for (var i = 0; i < partyCommissionReportDetailsColumnKeys.length; i++) {
					var bObj	= partyCommissionReportDetailsColumnConfig[partyCommissionReportDetailsColumnKeys[i]];

					if (bObj != null && bObj.show != undefined && bObj.show == true) {
						partyCommissionReportDetailsColumnConfig[partyCommissionReportDetailsColumnKeys[i]] = bObj;
					}
				}

				response.partyCommissionReportDetails.columnConfiguration	= _.values(partyCommissionReportDetailsColumnConfig);
				response.partyCommissionReportDetails.Language				= masterLangKeySet;
			}
			if(response.partyCommissionReportDetails != undefined && response.partyCommissionReportDetails.CorporateAccount != undefined) {

				$('#bottom-border-boxshadow').removeClass('hide');
				hideAllMessages();
				
				gridObject = slickGridWrapper3.applyGrid(
						{
							ColumnHead:response.partyCommissionReportDetails.columnConfiguration, // *compulsory // for table headers
							ColumnData:_.values(response.partyCommissionReportDetails.CorporateAccount), 	// *compulsory // for table's data
							Language:response.partyCommissionReportDetails.Language, 			// *compulsory for table's header row language
							ShowPrintButton:true,
							DivId:'partyCommissionReportDetailsDiv',				// *compulsary field // division id where slickgrid table has to be created
							SerialNo:[{						// optional field // for showing Row number
								showSerialNo:true,
								searchFilter:false,          // for search filter on serial no
								ListFilter:false				// for list filter on serial no
							}],
							InnerSlickId:'partyCommissionReportDetailsDivInner', // Div Id
							InnerSlickHeight	: '300px',
							NoVerticalScrollBar:false //optional for no vertical scrolling & if set true remove height attribute to Grid Div
						});
				}
			
			hideLayer();
		}
	});
});

function wayBillSearch(grid, dataView, row) {
	var LR_SEARCH_TYPE_ID		= 1;
	if(dataView.getItem(row).wayBillId != undefined) {
		window.open('SearchWayBillAction.do?pageId=5&eventId=3&wayBillId=' + dataView.getItem(row).wayBillId + '&NumberType=' + LR_SEARCH_TYPE_ID + '&BranchId=0');
	} 
}