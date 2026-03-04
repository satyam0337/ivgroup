var PaymentTypeConstant = null;
var type = 16;
define(
		[
		 'JsonUtility',
		 'messageUtility',
		 PROJECT_IVUIRESOURCES + '/resources/js/module/view/fastTagTollExpenseDetails/fastTagTollfilepath.js',
		 'jquerylingua',
		 'language',
		 'bootstrapSwitch',
		 'slickGridWrapper2',
		 'nodvalidation',
		 'focusnavigation',
		 PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
		 PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'],//PopulateAutocomplete
		 function(JsonUtility, MessageUtility, FilePath, Lingua, Language, BootstrapSwitch, slickGridWrapper2, NodValidation, FocusNavigation,
				 BootstrapModal, Selection) {
			'use strict';
			var jsonObject = new Object(), myNod, masterLangObj, masterLangKeySet, gridObject,  _this;
			return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
					this.$el.html(this.template);
				}, render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/tollExpensesDetailsWS/getFastTagTollExpenseReportElement.do?',	_this.renderPodWayBillsElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, renderPodWayBillsElements : function(response) {
					showLayer();
					var jsonObject 		= new Object();
					var loadelement 	= new Array();
					var baseHtml 		= new $.Deferred();
					loadelement.push(baseHtml);
					
					console.log("response",response);
				
					$("#mainContent").load("/ivcargo/html/module/fastTagTollDetails/fastTagTollDetailsReport.html",
							function() {
								baseHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						initialiseFocus();
						
						var keyObject 		= Object.keys(response);
						
						for (var i = 0; i < keyObject.length; i++) {
							if (response[keyObject[i]].show == true) {
								$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
							}
						}
						
					
						var elementConfiguration	= new Object();
						
						elementConfiguration.dateElement		= $('#dateEle');
						
						response.elementConfiguration	= elementConfiguration;
						response.isCalenderSelection	= true;
						
						Selection.setSelectionToGetData(response);
						
						masterLangObj 		= FilePath.loadLanguage();
											
						masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
						
						
						myNod = nod();
						myNod.configure({
							parentClass:'validation-message'
						});
						myNod.add([{
							selector: '#vehicleNumberEle',
							validate: 'validateAutocomplete:#vehicleNumberEle_primary_key',
							errorMessage: 'Select proper Fuel Pump'
						}]);
							
							
						var autoVehicleNumber 			= new Object();
						autoVehicleNumber.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getVehicleNumberAutocomplete.do?viewAll=false';

						autoVehicleNumber.primary_key 	= 'vehicleNumberMasterId';
						autoVehicleNumber.field 		= 'vehicleNumber';
						$("#vehicleNumberEle").autocompleteCustom(autoVehicleNumber);
						console.log("response",autoVehicleNumber);
						
						
						hideLayer();
						
			
					
						$("#findBtn").click(function() {
							myNod.performCheck();
							
							if(myNod.areAll('valid')) {
								_this.onFind(_this);
							}
						});
					});
				},onFind : function() {
					showLayer();
					var jsonObject 			= new Object();
					var vehicleNo	= $("#vehicleNumberEle").val();
					var fromDate	= document.getElementById("dateEle").getAttribute("data-startdate");
					var toDate		= document.getElementById("dateEle").getAttribute("data-enddate");
					
					if($("#dateEle").attr('data-startdate') != undefined) {
						jsonObject["fromDate"] 	= $("#dateEle").attr('data-startdate'); 
					}

					if($("#dateEle").attr('data-enddate') != undefined) {
						jsonObject["toDate"] 	= $("#dateEle").attr('data-enddate'); 
					}
					
					
					var inJson		= new Object();
					
					inJson.fromDate		= fromDate;
					inJson.toDate		= toDate;
					
					
			
						inJson.vehicleNo	= vehicleNo;
					
					
					getJSON(inJson, WEB_SERVICE_URL + '/tollExpensesDetailsWS/getFastTagTollExpenseReportData.do?', _this.setPODWayBillDetailsData, EXECUTE_WITH_ERROR);
				},setPODWayBillDetailsData : function(response) {
					console.log('response',response)
					if(response.message != undefined) {
						hideLayer();
						refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
						return;
					}
					
					if(response.tollExpenseDetailsList != undefined && response.tollExpenseDetailsList.CorporateAccount != undefined) {
						hideAllMessages();
						$('#bottom-border-boxshadow').show();
						
						var ColumnConfig 			= response.tollExpenseDetailsList.columnConfiguration;
						var columnKeys				= _.keys(ColumnConfig);
						
						var bcolConfig				= new Object();
						
						for (var i = 0; i < columnKeys.length; i++) {
							var bObj	= ColumnConfig[columnKeys[i]];
							
							if (bObj !=null && bObj.show == true) {
								bcolConfig[columnKeys[i]] = bObj;
							}
						}
						
						response.tollExpenseDetailsList.columnConfiguration								= bcolConfig;
						response.tollExpenseDetailsList.Language										= masterLangKeySet;
						response.tollExpenseDetailsList.tableProperties.callBackFunctionForPartial 		= _this.searchHistory;
						
						gridObject = slickGridWrapper2.setGrid(response.tollExpenseDetailsList);
					}
					
					hideLayer();
				}, searchHistory : function(grid, dataView, row) {
					hideLayer();
					if(dataView.getItem(row).wayBillId != undefined) {
						window.open ('viewDetails.do?pageId=340&eventId=2&modulename=viewPODStatusDetails&masterid='+dataView.getItem(row).wayBillId,'newwindow','left=300,top=100,width=600,height=350,toolbar=no,resizable=no,scrollbars=yes');
					}
				}
			});
});

function thvSearch(grid, dataView, row) {
	var LR_SEARCH_TYPE_ID		= 1;
	if(dataView.getItem(row).truckHisabVoucherId != undefined) {
		window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId=' + dataView.getItem(row).truckHisabVoucherId + '&wayBillNumber=' + dataView.getItem(row).truckHisabVoucherNumber+ '&TypeOfNumber=' + type+ '&BranchId=0');
	} 
}
