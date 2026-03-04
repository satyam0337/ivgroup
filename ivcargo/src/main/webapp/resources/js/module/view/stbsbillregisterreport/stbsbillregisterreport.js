define([  'JsonUtility'
		 ,'messageUtility'
		 ,PROJECT_IVUIRESOURCES + '/resources/js/module/view/stbsbillregisterreport/stbsbillregisterreportfilepath.js'
		 ,PROJECT_IVUIRESOURCES + '/resources/js/module/view/stbsbillregisterreport/stbsbillregisterReportHandle.js'
		 ,'jquerylingua'
		 ,'language'
		 ,'autocomplete'
		 ,'autocompleteWrapper'
		 ,'slickGridWrapper2'
		 ,'nodvalidation'
		 ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
		 ,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
		 ,PROJECT_IVUIRESOURCES +'/resources/js/populateautocomplete/selectoption.js'//ModelUrls
		 ,'focusnavigation'//import in require.config
		 ],function(JsonUtility, MessageUtility, FilePath, Handle, Lingua, Language, AutoComplete, AutoCompleteWrapper,
				 slickGridWrapper2, NodValidation, BootstrapModal,datePickerUI, Selection, ElementFocusNavigation) {
			'use strict';
			var jsonObject = new Object(), myNod, _this = '', masterLangObj, masterLangKeySet;
			return Marionette.LayoutView.extend({
				initialize : function(masterObj) {
					_this = this;
				},render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/stbsBillRegisterReportWS/getSTBSBillRegisterReportElement.do?',	_this.renderSTBSBillRegisterElements,	EXECUTE_WITHOUT_ERROR);
					return _this;
				},renderSTBSBillRegisterElements : function(response){
					var loadelement = new Array();
					var baseHtml = new $.Deferred();
					loadelement.push(baseHtml);
					
					$("#mainContent").load("/ivcargo/html/module/stbsbillregisterreport/STBSBillRegisterReport.html",function() {
						baseHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						initialiseFocus();
						var keyObject = Object.keys(response);
						
						for (var i = 0; i < keyObject.length; i++) {
							if (!response[keyObject[i]].show) {
								$("*[data-attribute="+ keyObject[i]+ "]").addClass("hide");
							}
						}
						
						var executive				= response.executive;
						
						response.sourceAreaSelection	= true;
						response.isCalenderSelection	= true;
						
						var elementConfiguration	= new Object();
						
						elementConfiguration.regionElement		= $('#regionEle');
						elementConfiguration.subregionElement	= $('#subRegionEle');
						elementConfiguration.branchElement		= $('#branchEle');
						elementConfiguration.dateElement		= $('#dateEle');
						
						response.elementConfiguration	= elementConfiguration;
						response.isOneYearCalenderSelection	= response.groupConfigObj.isOneYearCalenderSelection;
						response.isPhysicalBranchesShow			= true;
						
						Selection.setSelectionToGetData(response);
						
						if(response.groupConfigObj.viewAllPendingBills == 'true' || response.groupConfigObj.viewAllPendingBills == true) {
							$('#viewAllDueBills').removeClass('hide');
							
							$('#viewAllCheck').click(function(){
								if ($('#viewAllCheck').is(':checked')) {
							       $('#dateDiv').addClass('hide');
							    } else {
							    	$('#dateDiv').removeClass('hide');
							    }
							});
						} else {
							$('#viewAllDueBills').addClass('hide');
						}
						
						masterLangObj = FilePath.loadLanguage();
						masterLangKeySet = loadLanguageWithParams(masterLangObj);
						
						myNod = nod();
						myNod.configure({
							parentClass:'validation-message'
						});

						if(executive.executiveType == EXECUTIVE_TYPE_GROUPADMIN) {
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

						if(executive.executiveType == EXECUTIVE_TYPE_REGIONADMIN) {
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

						if(executive.executiveType == EXECUTIVE_TYPE_SUBREGIONADMIN ) {

							myNod.add({
								selector: '#branchEle',
								validate: 'validateAutocomplete:#branchEle_primary_key',
								errorMessage: 'Select proper Branch !'
							});
						}

						hideLayer();
						$("#find").click(function() {
							myNod.performCheck();
							if(myNod.areAll('valid')){
								_this.onSubmit(_this);								
							}
						});
					});

				},setReportData : function(response) {
					if(response.message != undefined){

						hideLayer();
						$('#bottom-border-boxshadow').addClass('hide');
						var errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
						return;
					}
					
					var stbsReportColumnConfig		= response.tableConfig.columnConfiguration;
					var stbsReportKeys				= _.keys(stbsReportColumnConfig);
					var bcolConfig					= new Object();
					
					for (var i=0; i<stbsReportKeys.length; i++) {
						var bObj	= stbsReportColumnConfig[stbsReportKeys[i]];
						
						if (bObj.show) {
							bcolConfig[stbsReportKeys[i]]	= bObj;
						}
					}
					
					response.tableConfig.columnConfiguration	= bcolConfig;
					response.tableConfig.Language				= masterLangKeySet;
					
					if(response.tableConfig.CorporateAccount != undefined) {
						$('#bottom-border-boxshadow').removeClass('hide');
						slickGridWrapper2.setGrid(response.tableConfig);
					}
					hideLayer();
				},onSubmit : function() {
					showLayer();
					var jsonObject = new Object();
					
					jsonObject["fromDate"] 				= $("#dateEle").attr('data-startdate'); 
					jsonObject["toDate"] 				= $("#dateEle").attr('data-enddate'); 
					jsonObject["regionId"] 				= $('#regionEle_primary_key').val();
					jsonObject["subRegionId"] 			= $('#subRegionEle_primary_key').val();
					jsonObject["sourceBranchId"] 		= $('#branchEle_primary_key').val();
					jsonObject["viewAllDueBills"] 		= $('#viewAllCheck').is(':checked');
					getJSON(jsonObject, WEB_SERVICE_URL+'/stbsBillRegisterReportWS/getSTBSBillRegisterReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
				
				}, dueLRColour:function(slickgrid){
					slickGridWrapper2.updateRowColor(slickgrid,'billstatus',1,'highlight-row-onchange-blue');
				}
			});
		});

function lrModificationDetails(grid,dataView,row){
	
	if(dataView.getItem(row).edit) {
		window.open('ViewConfigHamaliLhPVSummary.do?pageId=50&eventId=97&wayBillId='+dataView.getItem(row).wayBillId+'&taxTxnTypeId='+dataView.getItem(row).taxTxnTypeId+'&wayBillNumber='+dataView.getItem(row).wayBillNumber+'', 'newwindow', config='height=610,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	} else {
		showMessage('info','WayBillNumber '+dataView.getItem(row).wayBillNumber+'  is not Modified !');
	}
	
}

function printStbs(grid,dataView,row){
	
	if(dataView.getItem(row).shortCreditCollLedgerId) {
		window.open('ShortCreditLegderBillPrint.do?pageId=286&eventId=4&accountGroupId='+dataView.getItem(row).accountgroupId+'&flag=true&billId='+dataView.getItem(row).shortCreditCollLedgerId+'', 'newwindow', config='height=610,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	}
}

function lrBillDetails(grid,dataView,row){
	
	showLayer();
	require([PROJECT_IVUIRESOURCES+'/resources/js/module/view/stbs/shortCreditLRSummary.js'], function(ShortCreditLRSummary){
		var jsonObject 		= new Object();
		jsonObject["shortCreditCollLedgerId"] 				= dataView.getItem(row).shortCreditCollLedgerId;
		jsonObject["accountGroupId"] 						= dataView.getItem(row).accountgroupId;
		
		var object 			= new Object();
		object.elementValue = jsonObject;
		
		var btModal = new Backbone.BootstrapModal({
			content		: new ShortCreditLRSummary(object),
			modalWidth 	: 80,
			showFooter	: true,
			cancelText	: false,
			okText		: 'Close',
			title		: 'LR SUMMARY'
		});
		
		object.btModal = btModal;
		new ShortCreditLRSummary(object);
		btModal.open();
	});
}

function stbsTransportSearch(grid,dataView,row){
	if(dataView.getItem(row).shortCreditCollLedgerId != undefined){
        window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId='+dataView.getItem(row).shortCreditCollLedgerId+'&wayBillNumber='+dataView.getItem(row).shortCreditCollLedgerNumber+'&TypeOfNumber='+12);
	}
}

function stbsBillPaymentDetails(grid,dataView,row){
	if(dataView.getItem(row).shortCreditCollLedgerId != undefined){
		window.open('stbsBillPaymentDetails.do?pageId=340&eventId=2&modulename=stbsBillPaymentDetails&shortCreditCollLedgerId='+dataView.getItem(row).shortCreditCollLedgerId,'newwindow', config='height=310,width=1200, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	}
}
