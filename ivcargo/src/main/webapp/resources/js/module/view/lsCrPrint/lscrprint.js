var _this;
define(
		[
			'JsonUtility',
			'messageUtility',
			PROJECT_IVUIRESOURCES + '/resources/js/module/view/lsCrPrint/lscrprintfilepath.js',
			'jquerylingua',
			'language',
			'autocomplete',
			'autocompleteWrapper',
			'bootstrapSwitch',
			'slickGridWrapper3',
			'nodvalidation',
			'focusnavigation',
			PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
			PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js',//ModelUrls
			PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'],//PopulateAutocomplete

			function(JsonUtility, MessageUtility, FilePath, Lingua, Language, AutoComplete, AutoCompleteWrapper, BootstrapSwitch,slickGridWrapper3, NodValidation, FocusNavigation,
					BootstrapModal,datePickerUI, Selection) {
			'use strict';
			var
			filterConfiguration = new Object(),
			masterLangObj,
			masterLangKeySet,
			gridObject,
			selectedLRDetails = null,
			config,
			childwin,
			deliveryRunSheetLedgerId;

			var jsonObject = new Object(), myNod,myNod2, corporateAccountId = 0;
			return Marionette.LayoutView.extend({
				initialize : function(masterObj) {
					_this = this;
				}, render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/lsCRPrintWS/getLsCRPrintElement.do?',	_this.renderElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, renderElements : function(response) {
					showLayer();

					var jsonObject 	= new Object();
					var loadelement = new Array();
					var baseHtml 	= new $.Deferred();
					loadelement.push(baseHtml);
					$("#mainContent").load("/ivcargo/html/module/lsCrprint/lsCRPrint.html", function() {
						baseHtml.resolve();
					});

					$.when.apply($, loadelement).done(function() {
						hideLayer();

						masterLangObj 		= FilePath.loadLanguage();
						masterLangKeySet 	= loadLanguageWithParams(masterLangObj);

						response.executiveTypeWiseBranch	= true;

						var elementConfiguration	= new Object();

					//	elementConfiguration.branchElement		= $('#branchEle');

						response.elementConfiguration	= elementConfiguration;

						Selection.setSelectionToGetData(response);
						myNod = nod();
						myNod.configure({
							parentClass:'validation-message'
						});
						
						myNod.add({
							selector		: '#lsNumberEle',
							validate		: 'presence',
							errorMessage	: 'Enter LS No !'
						});
						/*myNod.add({
							selector		: '#branchEle',
							validate		: 'presence',
							errorMessage	: 'Select Branch !'
						});*/

						$("#findlsCR").click(function() {
							myNod.performCheck();
							
							if(myNod.areAll('valid'))
								_this.lsPrintDetails();
						});
						
						$("#printMultiCR").click(function() {
							_this.printMultiCR();
						});
					});
				},lsPrintDetails : function() {
					showLayer();
					var jsonObject = new Object();

					jsonObject["lsNumber"] 		= $('#lsNumberEle').val();
					//jsonObject["sourceBranchId"] 	= $('#branchEle_primary_key').val();

					getJSON(jsonObject, WEB_SERVICE_URL+'/lsCRPrintWS/getlsCrPrintDetails.do?', _this.lsDetailsByLsumber, EXECUTE_WITH_ERROR);
				},lsDetailsByLsumber : function(response) {
					
					
					if(response.message != undefined){
						hideLayer();
						$('#middle-border-boxshadow').hide();
						$('#bottom-border-boxshadow').hide();
						var errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + '  ' +  errorMessage.description);
						return;
					}
					
					deliveryRunSheetLedgerId	= response.deliveryRunSheetLedgerId;

					if(response.LsCrPrintList != undefined) {
						var LsPrintDetailsColumnConfig = response.LsCrPrintList.columnConfiguration;
						var LsPrintDetailsColumnKeys	= _.keys(LsPrintDetailsColumnConfig);

						for (var i = 0; i < LsPrintDetailsColumnKeys.length; i++) {
							var bObj	= LsPrintDetailsColumnConfig[LsPrintDetailsColumnKeys[i]];

							if (bObj.show != undefined && bObj.show == true)
								LsPrintDetailsColumnConfig[LsPrintDetailsColumnKeys[i]] = bObj;
						}

						response.LsCrPrintList.columnConfiguration	= _.values(LsPrintDetailsColumnConfig);
						response.LsCrPrintList.Language			= masterLangKeySet;
					}

					if(response.LsCrPrintList != undefined && response.LsCrPrintList.CorporateAccount != undefined) {

						$('#middle-border-boxshadow').show();
						hideAllMessages();

						gridObject = slickGridWrapper3.applyGrid(
								{
									ColumnHead:response.LsCrPrintList.columnConfiguration, // *compulsory // for table headers
									ColumnData:_.values(response.LsCrPrintList.CorporateAccount), 	// *compulsory // for table's data
									Language:response.LsCrPrintList.Language, 			// *compulsory for table's header row language
									ShowPrintButton:false,
									DivId:'lsDetailsDiv',				// *compulsary field // division id where slickgrid table has to be created
									SerialNo:[{						// optional field // for showing Row number
										showSerialNo:true,
										searchFilter:false,          // for search filter on serial no
										ListFilter:false				// for list filter on serial no
									}],
									InnerSlickId:'lsDetailsDivInner', // Div Id
									InnerSlickHeight	: '120px',
									NoVerticalScrollBar:false, //optional for no vertical scrolling & if set true remove height attribute to Grid Div
									CallBackFunctionForPartial	:	_this.getLrDetails
								});
					}
				
					_this.setLrDetails(response);

					hideLayer();
				},printMultiCR	: function(){
					var jsonObject	= {};
					var selectionMsg	= ' Please, Select atleast 1 LR for Print !';
					var selectedLRDetails	= slickGridWrapper3.getValueForSelectedData({InnerSlickId : 'lsDetailsSummaryDivInner'}, selectionMsg);

					if(typeof selectedLRDetails == 'undefined')
						return;

					if(typeof selectedLRDetails !== 'undefined') {
						var selectedLRDetailsLength	= selectedLRDetails.length;
						var	crIds					= [];

						for(var i = 0; i < selectedLRDetailsLength; i++) {
							crIds.push(selectedLRDetails[i].crId)
						}
						
						jsonObject.crIds		= crIds.join(',');
					}
					
					localStorage.setItem("crIdString", jsonObject.crIds);
					childwin = window.open('printWayBill.do?pageId=340&eventId=10&modulename=multiCRPrint&masterid=0','newwindow', config='height=300,width=425, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
				}/*printDDM	: function(){
					newwindow=window.open('DoorDeliveryPrint.do?pageId=304&eventId=5&deliveryRunSheetLedgerId='+deliveryRunSheetLedgerId, 'newwindow', config='height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
				}*/,printSingleCR(grid, dataView, row) {
					hideLayer();
					if(dataView.getItem(row).crId != undefined) {
						childwin = window.open('printWayBill.do?pageId=340&eventId=10&modulename=multiCRPrint&masterid='+dataView.getItem(row).crId,'newwindow', config='height=300,width=425, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
					} 
				}, setLrDetails : function(response){
					if(response.LrDetailsList != undefined) {
						var LrDetailsListColumnConfig 	= response.LrDetailsList.columnConfiguration;
						var lrSummaryDetailsColumnKeys	= _.keys(LrDetailsListColumnConfig);

						for (var i = 0; i < lrSummaryDetailsColumnKeys.length; i++) {
							var bObj	= LrDetailsListColumnConfig[lrSummaryDetailsColumnKeys[i]];

							if (bObj.show != undefined && bObj.show == true)
								LrDetailsListColumnConfig[lrSummaryDetailsColumnKeys[i]] = bObj;
						}

						response.LrDetailsList.columnConfiguration	= _.values(LrDetailsListColumnConfig);
						response.LrDetailsList.Language			= masterLangKeySet;
					}
					
					if(response.LrDetailsList != undefined && response.LrDetailsList.CorporateAccount != undefined) {
						$('#bottom-border-boxshadow').show();
						hideAllMessages();

						gridObject = slickGridWrapper3.applyGrid(
								{
									ColumnHead:response.LrDetailsList.columnConfiguration, // *compulsory // for table headers
									ColumnData:_.values(response.LrDetailsList.CorporateAccount), 	// *compulsory // for table's data
									Language:response.LrDetailsList.Language, 			// *compulsory for table's header row language
									ShowPrintButton:false,
									ShowCheckBox				: true,
									DivId:'lsDetailsSummaryDiv',				// *compulsary field // division id where slickgrid table has to be created
									SerialNo:[{						// optional field // for showing Row number
										showSerialNo:false,
										searchFilter:false,          // for search filter on serial no
										ListFilter:false				// for list filter on serial no
									}],
									InnerSlickId:'lsDetailsSummaryDivInner', // Div Id
									InnerSlickHeight	: '250px',
									NoVerticalScrollBar:false, //optional for no vertical scrolling & if set true remove height attribute to Grid Div
									ShowPartialButton:true, 
									CallBackFunctionForPartial	:	_this.printSingleCR
								});
					} else {
						$('#bottom-border-boxshadow').hide();
					}
				}
			});
		});


function getLrDetails(grid,dataView,row){
	if(dataView.getItem(row).dispatchLedgerId != undefined) {
		//_this = this;
		var jsonObject = new Object();

		jsonObject["dispatchLedgerId"] 			= dataView.getItem(row).dispatchLedgerId;
		jsonObject["isShowLrDetailsOnLink"] 	= true;

		getJSON(jsonObject, WEB_SERVICE_URL+'/lsCRPrintWS/getLrDetailsForLs.do?', _this.setLrDetails, EXECUTE_WITH_ERROR);
	} 
}
function transportSearch (grid,dataView,row){
	var LR_SEARCH_TYPE_ID		= 1;
	if(dataView.getItem(row).wayBillId != undefined && dataView.getItem(row).wayBillId != 'undefined') {
		window.open('SearchWayBillAction.do?pageId=5&eventId=3&wayBillId=' + dataView.getItem(row).wayBillId + '&NumberType=1&BranchId=0');
	} 
}