var _this;
var dlyDisc;
var dispatchLedgerIds =  null; 
define([  'JsonUtility'
	,'messageUtility'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/commissionReport/commissionReportfilepath.js'
	,'jquerylingua'
	,'language'
	,'selectizewrapper'
	,'slickGridWrapper3'
	,'nodvalidation'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/module/saveReportRequest.js'
	
	],function(JsonUtility, MessageUtility, FilePath, Lingua, Language, Selectizewrapper, slickGridWrapper3, NodValidation, FocusNavigation,
			 BootstrapModal, Selection, SaveReportRequest) {
	'use strict';
	var jsonObject = new Object(), 
	myNod,
	_this = '',
	viewObject,
	gridObject, 
	masterLangObj, 
	masterLangKeySet, 
	commissionType,
	commissionReportConfiguration,
	groupWiseLanguageFileLoad,
	showBothOptionAndOtherReportData,
	accountGroupId;

	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/commissionReportWS/getCommissionReportElementConfiguration.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},getElementConfigDetails : function(response){
			showLayer();
			console.log("response",response)
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			var executive				= response.executive;
			commissionReportConfiguration = response.commissionReportConfiguration;
			groupWiseLanguageFileLoad 	= commissionReportConfiguration.groupWiseLanguageFileLoad;
			showBothOptionAndOtherReportData 	= commissionReportConfiguration.showBothOptionAndOtherReportData;
			accountGroupId				= executive.accountGroupId;
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/commissionReport/CommissionReport.html",function() {
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
				
				var elementConfiguration				= new Object();
				elementConfiguration.dateElement		= $('#dateEle');
				response.elementConfiguration			= elementConfiguration;
				response.isCalenderSelection			= true;
				
				Selection.setSelectionToGetData(response);
				
				var commissionTypeList 		= new Array();
				 
				commissionTypeList[0] = {'commissionTypeId':1,'commissionTypeName':'Booking'};
				commissionTypeList[1] = {'commissionTypeId':2,'commissionTypeName':'Delivery'};
				if(commissionReportConfiguration.showBothOptionInCommissionType || (showBothOptionAndOtherReportData && (executive.executiveId == 19551 || executive.executiveId == 22559))){
					commissionTypeList[2] = {'commissionTypeId':3,'commissionTypeName':'Both'};
				}
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	commissionTypeList,
					valueField		:	'commissionTypeId',
					labelField		:	'commissionTypeName',
					searchField		:	'commissionTypeName',
					elementId		:	'commissionTypeEle',
					create			: 	false,
					maxItems		: 	1,
					//onChange		:   _this.onCommissionTypeSelect
				});
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.branchList,
					valueField		:	'branchId',
					labelField		:	'branchName',
					searchField		:	'branchName',
					elementId		:	'branchEle',
					create			: 	false,
					maxItems		: 	1
				});
				
				/*Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.branchList,
					valueField		:	'branchId',
					labelField		:	'branchName',
					searchField		:	'branchName',
					elementId		:	'srcBranchEle',
					create			: 	false,
					maxItems		: 	1
				});
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.branchList,
					valueField		:	'branchId',
					labelField		:	'branchName',
					searchField		:	'branchName',
					elementId		:	'destBranchEle',
					create			: 	false,
					maxItems		: 	1
				});*/
				
				if(groupWiseLanguageFileLoad) {
					masterLangObj		= FilePath.loadLanguageGroupWise(accountGroupId);
					masterLangKeySet	= loadLanguageWithParams(masterLangObj);
				} else{
					masterLangObj 		= FilePath.loadLanguage();
					masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
				}
				
				if(showBothOptionAndOtherReportData && (executive.executiveId == 19551 || executive.executiveId == 22559 || executive.executiveId == 29332)){
					$('#submitBtn').show();
				} else{
					$('#saveBtn').show();
				}
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				

				myNod.add({
					selector		: '#commissionTypeEle_wrapper',
					validate		: 'validateAutocomplete:#commissionTypeEle',
					errorMessage	: 'Select Proper Commission Type !'
				});
				
				if(executive.executiveType != EXECUTIVE_TYPE_BRANCHADMIN 
						&&  executive.executiveType != EXECUTIVE_TYPE_EXECUTIVE){
					
					myNod.add({
						selector		: '#branchEle_wrapper',
						validate		: 'validateAutocomplete:#branchEle',
						errorMessage	: 'Select proper Branch !'
					});
				} else {
					$('#branchEle').val(executive.branchId);
				}
				
				hideLayer();

				$("#dateEle, #commissionTypeEle, #branchEle").on("change", function () {
				    const selectedCommissionTypeId = Number($("#commissionTypeEle").val());
				   	$('#maxDaysToFindReport').val(commissionReportConfiguration.maxDaysToFindReport);

				    if(selectedCommissionTypeId === 3 && $('#branchEle').val() == -1)
					    checkDate();   
					else
						$('#saveBtn').show();
				});

				$("#saveBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid')) {
						_this.onSubmit(_this);								
					}
				});
				
				$("#submitBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid')) {
						_this.onSave(_this);								
					}
				});
				if(commissionReportConfiguration.showDlyDiscountDetails){
					$('#dlydiscBtn').show();
				} else{
					$('#dlydiscBtn').hide();
				}
				if(commissionReportConfiguration.showBkgDDlyDetails){
					$('#BkgddlyChrgBtn').show();
				}else{
					$('#BkgddlyChrgBtn').hide();
				}
				$('#showAllButton').hide();
			});

		},onCommissionTypeSelect : function(){
			
			myNod.remove("#sourceBranchEle_wrapper");
			myNod.remove("#destBranchEle_wrapper");
			$('#destBranchEle').val(0);
			$('#srcBranchEle').val(0);
			
			if($("#commissionTypeEle").val() == 1){
				$("[data-attribute='sourceBranch']").removeClass("hide");
				$("[data-attribute='destBranch']").addClass("hide");
				myNod.add({
					selector		: '#srcBranchEle_wrapper',
					validate		: 'validateAutocomplete:#srcBranchEle',
					errorMessage	: 'Select proper Branch !'
				});
			} else {
				myNod.add({
					selector		: '#destBranchEle_wrapper',
					validate		: 'validateAutocomplete:#destBranchEle',
					errorMessage	: 'Select proper Branch !'
				});
				$("[data-attribute='destBranch']").removeClass("hide");
				$("[data-attribute='sourceBranch']").addClass("hide");
				
			}
		
		},onSubmit : function() {
			showLayer();
			var jsonObject = new Object();
			
			commissionType	= $('#commissionTypeEle').val();
			 
			if($("#dateEle").attr('data-startdate') != undefined){
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
			}
			if($("#dateEle").attr('data-enddate') != undefined){
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
			}
			jsonObject["operationType"] 	= commissionType;
			jsonObject["branchId"] 			= $('#branchEle').val();
			
			/*if(commissionType == 1){
				jsonObject["branchId"] 		= $('#srcBranchEle').val();
			} else {
				jsonObject["branchId"] 		= $('#destBranchEle').val();
			}*/
			if(commissionReportConfiguration.allowNewLogicForCommissionReport)
				getJSON(jsonObject, WEB_SERVICE_URL+'/commissionReportWS/getBookingAndDeliveryCommissionCustom.do', _this.setReportData, EXECUTE_WITH_ERROR);
			else
				getJSON(jsonObject, WEB_SERVICE_URL+'/commissionReportWS/getBookingAndDeliveryCommission.do', _this.setReportData, EXECUTE_WITH_ERROR);
			
		},setReportData : function(response){
			console.log("response after ", response)
			if(response.message != undefined){
				$('#middle-border-boxshadow').hide();
				$('#commissionReportDiv').hide();
				$('#commissionReportDiv1').hide();
				showMessage(response.message.typeName, response.message.description);
				hideLayer();
				return;
			} else if (response.CommissionReportModel == undefined){
				$('#middle-border-boxshadow').hide();
				$('#commissionReportDiv').hide();
				$('#commissionReportDiv1').hide();
				showMessage('error', "No Recodrd Found");
				hideLayer();
				return;
			}
			
			
			if(response.CommissionReportModel != undefined){
				$('#middle-border-boxshadow').hide();
				var ColumnConfig		= response.CommissionReportModel.columnConfiguration;
				var columnKeys			= _.keys(ColumnConfig);
				var bcolConfig			= new Object();
				var CorporateAccnt		= response.CommissionReportModel.CorporateAccount;
				var corporateAccntKeys	= _.keys(CorporateAccnt);
				
				for (var i=0; i<columnKeys.length; i++) {
					var bObj		= ColumnConfig[columnKeys[i]];
					if(commissionType == 1){
						if(bObj.labelId == 'doorDelyCharge'){
							bObj.show = false;
						}
					}else if(commissionType == 2){
						if(bObj.labelId == 'bookingDiscount'){
							bObj.show = false;
						}else if(bObj.labelId == 'bookingCommission'){
							bObj.show = false;
						}
					}
					
					if($('#commissionTypeEle').val() == 2) {
						if(commissionReportConfiguration.showDlyDiscountDetails || commissionReportConfiguration.showBkgDDlyDetails){
						$('#BkgddlyChrgBtn').show();
						$('#dlydiscBtn').show();
					}
					} else {
						$('#BkgddlyChrgBtn').hide();
						$('#dlydiscBtn').hide();
					}
					if (bObj.show == true) {
						bcolConfig[columnKeys[i]]	= bObj;
					}
				}
				
				dlyDisc = _.find(CorporateAccnt, function(value){ return value.deliveryDiscount > 0; });
				
				response.CommissionReportModel.columnConfiguration		= _.values(bcolConfig);
				response.CommissionReportModel.Language					= masterLangKeySet;
			
				if(response.CommissionReportModel.CorporateAccount != undefined && response.CommissionReportModel.CorporateAccount.length > 0) {
					hideLayer();
					$('#middle-border-boxshadow').show();
					$('#commissionReportDiv').show();
					$('#commissionReportDiv1').show();
					dispatchLedgerIds = new Array();
					
					
					response.CommissionReportModel.CorporateAccount =	_.sortBy(response.CommissionReportModel.CorporateAccount, 'sourceBranchName');
					var showAllButton = response.isCommissionCalculatedOnDeliverType;
					
					if(showAllButton && commissionType == 2 ) {
						$('#showAllButton').show();
						for(var i=0;response.CommissionReportModel.CorporateAccount.length > i; i++) {
							if(response.CommissionReportModel.CorporateAccount[i].lrExpensesAmount > 0) {
								dispatchLedgerIds.push(response.CommissionReportModel.CorporateAccount[i].dispatchLedgerId);
							}
						}
						
					}
					
					slickGridWrapper3.applyGrid({
							ColumnHead					: response.CommissionReportModel.columnConfiguration, // *compulsory // for table headers
							ColumnData					: _.values(response.CommissionReportModel.CorporateAccount), 	// *compulsory // for table's data
							Language					: response.CommissionReportModel.Language, 			// *compulsory for table's header row language
							ShowPrintButton				: true,
							ShowCheckBox				: false,
							removeSelectAllCheckBox		: 'false',
							fullTableHeight				: false,
							rowHeight 					: 30,
							DivId						: 'commissionReportDiv',				// *compulsary field // division id where slickgrid table has to be created
							SerialNo:[{						// optional field // for showing Row number
								showSerialNo	: false,
								searchFilter	: false,          // for search filter on serial no
								ListFilter		: false				// for list filter on serial no
							}],
							InnerSlickId				: 'editReportDivInner', // Div Id
							InnerSlickHeight			: '350px',
							NoVerticalScrollBar			: false, //optional for no vertical scrolling & if set true remove height attribute to Grid Div
							DataVieObject		        : viewObject,
							DataGridObject		        : gridObject,
							ShowPartialButton	        : false,
							CallBackFunctionForPartial	: _this.getLsDetails
						});
				} else {
					showMessage('error', "No Recodrd Found");
					hideLayer();
					return;
				}
			}
			
		hideLayer();
		
		},getLsDetails:function(grid, dataView,row){
			hideLayer();
			if(dataView.getItem(row).dispatchLedgerId != undefined && dataView.getItem(row).dispatchLedgerId > 0) {
				getLRDetails(dataView.getItem(row).dispatchLedgerId,dataView.getItem(row).accountGroupId);
			} else {
				showMessage('error', 'LS Not Found.');
			}
		},onSave : function() {
			showLayer();
			var jsonObject = new Object();
			
			commissionType	= $('#commissionTypeEle').val();
			
			if($("#dateEle").attr('data-startdate') != undefined){
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
			}
			if($("#dateEle").attr('data-enddate') != undefined){
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
			}
			jsonObject["operationType"] 	= commissionType;
			jsonObject["branchId"] 			= $('#branchEle').val();
			getJSON(jsonObject, WEB_SERVICE_URL+'/commissionReportWS/getBkgAndDlyCommWithOtherData.do', _this.setMultipleReportData, EXECUTE_WITH_ERROR);
			
		},setMultipleReportData:function(response){
			if(response.message != undefined){
				$('#bottom-border-boxshadow').hide();
				$('#commissionReportTableDiv').hide();
				$('#commissionReportTableDiv1').hide();
				showMessage(response.message.typeName, response.message.description);
				hideLayer();
				return;
			}
			
			var fundTrafTotalAmount			= 0;
			var fundRecTotalAmount			= 0;
			var expTotalAmount				= 0;
			var incTotalAmount				= 0;
			var blhpvTotal					= 0;
			var totalBlhpvAddCharge			= 0;
			var totalAddCharge				= 0;
			var totalAdvPaid				= 0;
			var totalBlhpvDeduc				= 0;
			var totalDeduc					= 0;
			var totalActBalTaken			= 0;
			
			var toPayTotal					= 0;
			var paidTotal					= 0;
			var tbbTotal					= 0;
			var Total						= 0;
			var balanceTotal				= 0;
			var bkgDiscTotal				= 0;
			var dlyDiscTotal				= 0;
			var bkgCommTotal				= 0;
			var dlyCommTotal				= 0;
			
			var dlyTotalDlyComm				= 0;
			var dlyTotalPayable				= 0;
			var dlyTotalLRExp				= 0;
			
			var fundTransferDataList		= null;
			var fundReceiveDataList			= null;
			var expenseDataList				= null;
			var incomeDataList				= null;
			var blhpvDataList				= null;
			var fundTransferCancelDataList	= null;
			var fundTrafCancelTotalAmount	= 0;
			
			$('#fundTransferTable').empty();
			$('#fundTransferDiv').hide();
			
			$('#fundReceiveTable').empty();
			$('#fundReceiveDiv').hide();
			
			$('#officeExpenseTable').empty();
			$('#officeExpenseDiv').hide();
			
			$('#officeIncomeTable').empty();
			$('#officeIncomeDiv').hide();
			
			$('#blhpvReportTable').empty();
			$('#blhpvReportDiv').hide();
			
			$("#printAllReportData").empty();
			$('#bottom-border-boxshadow').hide();
			
			$('#commissionReportTableDiv').hide();
			$('#commissionReportTableDiv1').hide();
			
			$('#fundTransferCancelTable').empty();
			$('#fundTransferCancelDiv').hide();
			
			if(response != undefined){
				var branch 			= response.branch;
				var accountGroup 	= response.accountGroup;
				//Commission Table

				if(response.CommissionReportModel != undefined){
					var ColumnConfig		= response.CommissionReportModel.columnConfiguration;
					var columnKeys			= _.keys(ColumnConfig);
					var bcolConfig			= new Object();
					var CorporateAccnt		= response.CommissionReportModel.CorporateAccount;
					var corporateAccntKeys	= _.keys(CorporateAccnt);
					
					for (var i=0; i<columnKeys.length; i++) {
						var bObj		= ColumnConfig[columnKeys[i]];
						if(response.typeOfCommission == 1){
							if(bObj.labelId == 'lrExpensesAmount' || bObj.labelId == 'payableCommissionAmount' || bObj.labelId == 'commissionType' 
								|| bObj.labelId == 'deliveryCommission'){
								bObj.show = false;
							}
						}else if(response.typeOfCommission == 2){
							if(bObj.labelId == 'bookingCommission' || bObj.labelId == 'commissionType'){
								bObj.show = false;
							} 
						}
						
						if($('#commissionTypeEle').val() == 2) {
							if(commissionReportConfiguration.showDlyDiscountDetails || commissionReportConfiguration.showBkgDDlyDetails){
							$('#BkgddlyChrgBtn').show();
							$('#dlydiscBtn').show();
						}
						} else {
							$('#BkgddlyChrgBtn').hide();
							$('#dlydiscBtn').hide();
						}
						if (bObj.show == true) {
							bcolConfig[columnKeys[i]]	= bObj;
						}
					}
					
					dlyDisc = _.find(CorporateAccnt, function(value){ return value.deliveryDiscount > 0; });
					
					response.CommissionReportModel.columnConfiguration		= _.values(bcolConfig);
					response.CommissionReportModel.Language					= masterLangKeySet;
				
					if(response.CommissionReportModel.CorporateAccount != undefined && response.CommissionReportModel.CorporateAccount.length > 0) {
						hideLayer();
						$('#bottom-border-boxshadow').show();
						$('#commissionReportTableDiv').show();
						$('#commissionReportTableDiv1').show();
						dispatchLedgerIds = new Array();
						
						response.CommissionReportModel.CorporateAccount =	_.sortBy(response.CommissionReportModel.CorporateAccount, 'sourceBranchName');
						var showAllButton = response.isCommissionCalculatedOnDeliverType;
						
						if(showAllButton && commissionType == 2) {
							$('#showAllButton').show();
							for(var i=0;response.CommissionReportModel.CorporateAccount.length > i; i++) {
								if(response.CommissionReportModel.CorporateAccount[i].lrExpensesAmount > 0) {
									dispatchLedgerIds.push(response.CommissionReportModel.CorporateAccount[i].dispatchLedgerId);
								}
							}
							
						}
						
						slickGridWrapper3.applyGrid({
								ColumnHead					: response.CommissionReportModel.columnConfiguration, // *compulsory // for table headers
								ColumnData					: _.values(response.CommissionReportModel.CorporateAccount), 	// *compulsory // for table's data
								Language					: response.CommissionReportModel.Language, 			// *compulsory for table's header row language
								ShowPrintButton				: true,
								ShowCheckBox				: false,
								removeSelectAllCheckBox		: 'false',
								fullTableHeight				: false,
								rowHeight 					: 30,
								DivId						: 'commissionReportTableDiv',				// *compulsary field // division id where slickgrid table has to be created
								SerialNo:[{						// optional field // for showing Row number
									showSerialNo	: false,
									searchFilter	: false,          // for search filter on serial no
									ListFilter		: false				// for list filter on serial no
								}],
								InnerSlickId				: 'editReportDivInner', // Div Id
								InnerSlickHeight			: '350px',
								NoVerticalScrollBar			: false, //optional for no vertical scrolling & if set true remove height attribute to Grid Div
								DataVieObject		        : viewObject,
								DataGridObject		        : gridObject,
								ShowPartialButton	        : false,
								CallBackFunctionForPartial	: _this.getLsDetails
							});
					} else {
						showMessage('error', "No Recodrd Found");
						hideLayer();
						return;
					}
				}
				
				//Fund Transfer Table
				if(response.finalFundTransferAndHistoryDataList != undefined){
					var columnHeadArray				= new Array();
					var columnArray					= new Array();
					var columnFooterArray			= new Array();
					
					fundTransferDataList = response.finalFundTransferAndHistoryDataList;
					
					if(fundTransferDataList != undefined && fundTransferDataList.length > 0){
						$('#bottom-border-boxshadow').show();
						$('#fundTransferDiv').show();
						
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Sr. No.</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Fund Tranf No.</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Received To</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Received Date</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Recieved Type</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Payment Type</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Cheque Date</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Cheque No.</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Amount</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Remark</th>");
						
						$('#fundTransferTable').append('<thead id="fundTransferTableHeader" class="text-info text-center">' + columnHeadArray.join(' ') + '</thead>');
						
						for(var i=0;i < fundTransferDataList.length;i++){
							fundTrafTotalAmount	+= fundTransferDataList[i].amount;
							
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i+1) + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + fundTransferDataList[i].fundtransfernumber + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + fundTransferDataList[i].branchName + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + fundTransferDataList[i].dateTimeStr + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + fundTransferDataList[i].transferTypeName + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + fundTransferDataList[i].paymentModeName + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + fundTransferDataList[i].chequeDateStr + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + fundTransferDataList[i].chequeNumber + "</td>");
							columnArray.push("<td style='text-align: right; vertical-align: middle;'>" + Math.round(fundTransferDataList[i].amount) + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + fundTransferDataList[i].remark + "</td>");
							
							$('#fundTransferTable').append('<tr>' + columnArray.join(' ') + '</tr>');
							columnArray = [];
						}
						columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>Total</th>");
						columnFooterArray.push("<th style='text-align: center; vertical-align: middle;' colspan='7'>&nbsp;</th>");
						columnFooterArray.push("<th style='text-align: right; vertical-align: middle;'>"+Math.round(fundTrafTotalAmount)+"</th>");
						columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>&nbsp;</th>");
						
						$('#fundTransferTable').append('<thead class="text-info">' + columnFooterArray.join(' ') + '</thead>');
					}
				}
				
				if(response.fundTransferCancelDataList != undefined){
					let columnHeadArray				= new Array();
					let columnArray					= new Array();
					let columnFooterArray			= new Array();
					
					fundTransferCancelDataList = response.fundTransferCancelDataList;
					
					if(fundTransferCancelDataList != undefined && fundTransferCancelDataList.length > 0){
						$('#bottom-border-boxshadow').show();
						$('#fundTransferCancelDiv').show();
						
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Sr. No.</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Fund Tranf No.</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Received To</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Received Date</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Recieved Type</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Payment Type</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Cheque Date</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Cheque No.</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Amount</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Remark</th>");
						
						$('#fundTransferCancelTable').append('<thead id="fundTransferCancelTableHeader" class="text-info text-center">' + columnHeadArray.join(' ') + '</thead>');
						
						for(let i=0;i < fundTransferCancelDataList.length;i++){
							fundTrafCancelTotalAmount	+= fundTransferCancelDataList[i].amount;
							
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i+1) + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + fundTransferCancelDataList[i].fundtransfernumber + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + fundTransferCancelDataList[i].branchName + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + fundTransferCancelDataList[i].dateTimeStr + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + fundTransferCancelDataList[i].transferTypeName + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + fundTransferCancelDataList[i].paymentModeName + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + fundTransferCancelDataList[i].chequeDateStr + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + fundTransferCancelDataList[i].chequeNumber + "</td>");
							columnArray.push("<td style='text-align: right; vertical-align: middle;'>" + Math.round(fundTransferCancelDataList[i].amount) + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + fundTransferCancelDataList[i].remark + "</td>");
							
							$('#fundTransferCancelTable').append('<tr>' + columnArray.join(' ') + '</tr>');
							columnArray = [];
						}
						columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>Total</th>");
						columnFooterArray.push("<th style='text-align: center; vertical-align: middle;' colspan='7'>&nbsp;</th>");
						columnFooterArray.push("<th style='text-align: right; vertical-align: middle;'>"+Math.round(fundTrafCancelTotalAmount)+"</th>");
						columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>&nbsp;</th>");
						
						$('#fundTransferCancelTable').append('<thead class="text-info">' + columnFooterArray.join(' ') + '</thead>');
					}
				}
				
				//Fund Receive Table
				if(response.fundReceivedDataArrList != undefined){
					var columnHeadArray				= new Array();
					var columnArray					= new Array();
					var columnFooterArray			= new Array();
					
					fundReceiveDataList = response.fundReceivedDataArrList;
					
					if(fundReceiveDataList != undefined && fundReceiveDataList.length > 0){
						$('#bottom-border-boxshadow').show();
						$('#fundReceiveDiv').show();
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Sr. No.</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Fund Rec No.</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Received To</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Received Date</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Recieved Type</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Payment Type</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Cheque Date</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Cheque No.</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Amount</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Remark</th>");
						
						$('#fundReceiveTable').append('<thead id="fundReceiveTableHeader" class="text-info text-center">' + columnHeadArray.join(' ') + '</thead>');
						
						columnHeadArray	= [];
						
						for(var i=0;i < fundReceiveDataList.length;i++){
							fundRecTotalAmount	+= fundReceiveDataList[i].amount;
							
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i+1) + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + fundReceiveDataList[i].fundtransfernumber + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + fundReceiveDataList[i].branchName + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + fundReceiveDataList[i].dateTimeStr + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + fundReceiveDataList[i].transferTypeName + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + fundReceiveDataList[i].paymentModeName + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + fundReceiveDataList[i].chequeDateStr + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + fundReceiveDataList[i].chequeNumber + "</td>");
							columnArray.push("<td style='text-align: right; vertical-align: middle;'>" + Math.round(fundReceiveDataList[i].amount) + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + fundReceiveDataList[i].remark + "</td>");
							
							$('#fundReceiveTable').append('<tr>' + columnArray.join(' ') + '</tr>');
							columnArray = [];
						}
						
						columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>Total</th>");
						columnFooterArray.push("<th style='text-align: center; vertical-align: middle;' colspan='7'>&nbsp;</th>");
						columnFooterArray.push("<th style='text-align: right; vertical-align: middle;'>"+Math.round(fundRecTotalAmount)+"</th>");
						columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>&nbsp;</th>");
						
						$('#fundReceiveTable').append('<thead class="text-info">' + columnFooterArray.join(' ') + '</thead>');
					}	
				}
				
				//Expense Table
				if(response.branchExpenseDataArrList != undefined){
					var columnHeadArray				= new Array();
					var columnArray					= new Array();
					var columnFooterArray			= new Array();
					
					expenseDataList	= response.branchExpenseDataArrList;
					
					if(expenseDataList != undefined && expenseDataList.length > 0){
						$('#bottom-border-boxshadow').show();
						$('#officeExpenseDiv').show();
					
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Sr. No.</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Voucher Date</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Voucher No.</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Executive Name</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Branch Name</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Particulars</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Amount</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Sub Total</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Remark</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Status</th>");
						
						$('#officeExpenseTable').append('<thead id="officeExpenseTableHeader" class="text-info text-center">' + columnHeadArray.join(' ') + '</thead>');
						
						for(var i=0;i < expenseDataList.length;i++){
							expTotalAmount	+= expenseDataList[i].amount;
							
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i+1) + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + expenseDataList[i].dateForUser + "</td>");
							columnArray.push("<td id="+expenseDataList[i].expOrIncDetailsId+" style='text-align: center; vertical-align: middle; display: none;'>" + expenseDataList[i].voucherNum + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'> <span style='color : blue; cursor : pointer;' onclick ='transportSearchForVocher("+expenseDataList[i].expOrIncDetailsId+","+expenseDataList[i].branchId+","+2+")'>" + expenseDataList[i].voucherNum + "</span></td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + expenseDataList[i].executiveName + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + expenseDataList[i].branchName + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + expenseDataList[i].charge + "</td>");
							columnArray.push("<td style='text-align: right; vertical-align: middle;'>" + Math.round(expenseDataList[i].amount) + "</td>");
							columnArray.push("<td style='text-align: right; vertical-align: middle;'>" + expenseDataList[i].amount + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + expenseDataList[i].remark + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + expenseDataList[i].statusForUser + "</td>");
							
							$('#officeExpenseTable').append('<tr>' + columnArray.join(' ') + '</tr>');
							columnArray = [];
						}
						
						columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>Total</th>");
						columnFooterArray.push("<th style='text-align: center; vertical-align: middle;' colspan='5'>&nbsp;</th>");
						columnFooterArray.push("<th style='text-align: right; vertical-align: middle;'>"+Math.round(expTotalAmount)+"</th>");
						columnFooterArray.push("<th style='text-align: center; vertical-align: middle;' colspan='3'>&nbsp;</th>");
						
						$('#officeExpenseTable').append('<thead class="text-info">' + columnFooterArray.join(' ') + '</thead>');
					}
				}
				
				//Income Table
				if(response.branchIncomeDataArrList != undefined){
					
					var columnHeadArray				= new Array();
					var columnArray					= new Array();
					var columnFooterArray			= new Array();
					
					incomeDataList	= response.branchIncomeDataArrList;
					
					if(incomeDataList != undefined && incomeDataList.length > 0){
						$('#bottom-border-boxshadow').show();
						$('#officeIncomeDiv').show();
					
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Sr. No.</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Voucher Date</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Voucher No.</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Executive Name</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Branch Name</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Particulars</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Amount</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Sub Total</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Remark</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Status</th>");
						
						$('#officeIncomeTable').append('<thead id="officeIncomeTableHeader" class="text-info text-center">' + columnHeadArray.join(' ') + '</thead>');
						
						for(var i=0;i < incomeDataList.length;i++){
							incTotalAmount	+= incomeDataList[i].amount;
							
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i+1) + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + incomeDataList[i].dateForUser + "</td>");
							columnArray.push("<td id="+incomeDataList[i].expOrIncDetailsId+" style='text-align: center; vertical-align: middle; display: none;'>" + incomeDataList[i].voucherNum + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'> <span style='color : blue; cursor : pointer;' onclick ='transportSearchForVocher("+incomeDataList[i].expOrIncDetailsId+","+incomeDataList[i].branchId+","+1+")'>" + incomeDataList[i].voucherNum + "</span></td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + incomeDataList[i].executiveName + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + incomeDataList[i].branchName + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + incomeDataList[i].charge + "</td>");
							columnArray.push("<td style='text-align: right; vertical-align: middle;'>" + Math.round(incomeDataList[i].amount) + "</td>");
							columnArray.push("<td style='text-align: right; vertical-align: middle;'>" + incomeDataList[i].amount + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + incomeDataList[i].remark + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + incomeDataList[i].statusForUser + "</td>");
							
							$('#officeIncomeTable').append('<tr>' + columnArray.join(' ') + '</tr>');
							columnArray = [];
						}
						
						columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>Total</th>");
						columnFooterArray.push("<th style='text-align: center; vertical-align: middle;' colspan='5'>&nbsp;</th>");
						columnFooterArray.push("<th style='text-align: right; vertical-align: middle;'>"+Math.round(incTotalAmount)+"</th>");
						columnFooterArray.push("<th style='text-align: center; vertical-align: middle;' colspan='3'>&nbsp;</th>");
						
						$('#officeIncomeTable').append('<thead class="text-info">' + columnFooterArray.join(' ') + '</thead>');
					}
				}
				
				//BLHPV Register Report
				if(response.blhpvDetailsDataArrList != undefined){
					
					var columnHeadArray				= new Array();
					var columnArray					= new Array();
					var columnFooterArray			= new Array();
					
					blhpvDataList	= response.blhpvDetailsDataArrList;
					
					if(blhpvDataList != undefined && blhpvDataList.length > 0){
						$('#bottom-border-boxshadow').show();
						$('#blhpvReportDiv').show();
					
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Sr. No.</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>BLHPV Date</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>BLHPV No.</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Truck No.</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>From</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Truck Rent</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>BLHPV Addition Chgs</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>LHPV Addition Chgs</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Advance</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>BLHPV Deduction Chgs</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>LHPV Deduction Chgs</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Balance</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>LHPV No.</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>LHPV Date</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Status</th>");
						
						$('#blhpvReportTable').append('<thead id="blhpvReportTableHeader" class="text-info text-center">' + columnHeadArray.join(' ') + '</thead>');
						
						for(var i=0;i < blhpvDataList.length;i++){
							
							blhpvTotal			+= blhpvDataList[i].total;
							totalBlhpvAddCharge	+= blhpvDataList[i].blhpvadditionCharges;
							totalAddCharge		+= blhpvDataList[i].additionCharges;
							totalAdvPaid		+= blhpvDataList[i].advancePaid;
							totalBlhpvDeduc		+= blhpvDataList[i].blhpvdeductionCharges;
							totalDeduc			+= blhpvDataList[i].deductionCharges;
							totalActBalTaken	+= blhpvDataList[i].actualBalanceAmountTaken;
							
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i+1) + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + blhpvDataList[i].blhpvDate + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'> <span style='color : blue; cursor : pointer;' onclick ='transportSearchForBLHPV("+blhpvDataList[i].blhpvId+","+blhpvDataList[i].blhpvNumber+","+blhpvDataList[i].branchId+")'>" + blhpvDataList[i].blhpvNumber + "</span></td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + blhpvDataList[i].vehicleNumber + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + blhpvDataList[i].lhpvSourceBranch + "</td>");
							columnArray.push("<td style='text-align: right; vertical-align: middle;'>" + Math.round(blhpvDataList[i].total) + "</td>");
							columnArray.push("<td style='text-align: right; vertical-align: middle;'>" + Math.round(blhpvDataList[i].blhpvadditionCharges) + "</td>");
							columnArray.push("<td style='text-align: right; vertical-align: middle;'>" + Math.round(blhpvDataList[i].additionCharges) + "</td>");
							columnArray.push("<td style='text-align: right; vertical-align: middle;'>" + Math.round(blhpvDataList[i].advancePaid) + "</td>");
							columnArray.push("<td style='text-align: right; vertical-align: middle;'>" + Math.round(blhpvDataList[i].blhpvdeductionCharges) + "</td>");
							columnArray.push("<td style='text-align: right; vertical-align: middle;'>" + Math.round(blhpvDataList[i].deductionCharges) + "</td>");
							columnArray.push("<td style='text-align: right; vertical-align: middle;'>" + Math.round(blhpvDataList[i].actualBalanceAmountTaken) + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'> <span style='color : blue; cursor : pointer;' onclick ='transportSearchForLHPV("+blhpvDataList[i].lhpvId+","+blhpvDataList[i].lhpvNumber+")'>" + blhpvDataList[i].lhpvNumber + "</span></td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + blhpvDataList[i].lhpvDateStr + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + blhpvDataList[i].paymentStatus + "</td>");
							
							$('#blhpvReportTable').append('<tr>' + columnArray.join(' ') + '</tr>');
							columnArray = [];
						}
						
						columnFooterArray.push("<th style='text-align: center; vertical-align: middle;' colspan='4'>&nbsp;</th>");
						columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>Total</th>");
						columnFooterArray.push("<th style='text-align: right; vertical-align: middle;'>"+Math.round(blhpvTotal)+"</th>");
						columnFooterArray.push("<th style='text-align: right; vertical-align: middle;'>"+Math.round(totalBlhpvAddCharge)+"</th>");
						columnFooterArray.push("<th style='text-align: right; vertical-align: middle;'>"+Math.round(totalAddCharge)+"</th>");
						columnFooterArray.push("<th style='text-align: right; vertical-align: middle;'>"+Math.round(totalAdvPaid)+"</th>");
						columnFooterArray.push("<th style='text-align: right; vertical-align: middle;'>"+Math.round(totalBlhpvDeduc)+"</th>");
						columnFooterArray.push("<th style='text-align: right; vertical-align: middle;'>"+Math.round(totalDeduc)+"</th>");
						columnFooterArray.push("<th style='text-align: right; vertical-align: middle;'>"+Math.round(totalActBalTaken)+"</th>");
						columnFooterArray.push("<th style='text-align: center; vertical-align: middle;' colspan='3'>&nbsp;</th>");
						
						$('#blhpvReportTable').append('<thead class="text-info">' + columnFooterArray.join(' ') + '</thead>');
					}
				}
			}
			var data = new Object();
			data.accountGroupNameForPrint	= accountGroup.accountGroupDescription;
			data.branchAddress				= branch.branchAddress;
			data.branchPhoneNumber			= branch.branchContactDetailPhoneNumber;
			data.isLaserPrintAllow			= 'true';
			data.isPlainPrintAllow			= 'true';
			data.isExcelButtonDisplay		= 'true';
			data.isPdfButtonDisplay			= 'false';
			
			printTable(data, 'reportData', 'commissionReport', 'Commission Report', 'printAllReportData');
			
			hideLayer();
		},
	});
});

function transportSearch(grid,dataView,row){
	if(dataView.getItem(row).dispatchLedgerId != undefined){
		window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId='+dataView.getItem(row).dispatchLedgerId+'&wayBillNumber='+dataView.getItem(row).lsNumber+'&TypeOfNumber=2&BranchId=0&CityId=0&searchBy=');
	} 
}
function transportSearchForLS(dispatchLedgerId, lsNumber){
	if(dispatchLedgerId != undefined){
		window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId='+dispatchLedgerId+'&wayBillNumber='+lsNumber+'&TypeOfNumber=2&BranchId=0&CityId=0&searchBy=');
	} 
}
function transportSearchForVocher(incOrExpId, branchId, incOrExpType){
	
	var incOrExpNum	= $('#'+incOrExpId).html();
	if(incOrExpId != undefined){
		if(incOrExpType == 1)
			window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId='+incOrExpId+'&wayBillNumber='+incOrExpNum+'&TypeOfNumber=8&BranchId='+branchId+'&CityId=0&searchBy=');
		else
			window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId='+incOrExpId+'&wayBillNumber='+incOrExpNum+'&TypeOfNumber=7&BranchId='+branchId+'&CityId=0&searchBy=');
	} 
}
function transportSearchForLHPV(lhpvid, lhpvNumber){
	if(lhpvid != undefined){
		window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId='+lhpvid+'&wayBillNumber='+lhpvNumber+'&TypeOfNumber=3&BranchId=0&searchBy=');
	} 
}
function transportSearchForBLHPV(blhpvid, blhpvNumber, branchId){
	if(blhpvid != undefined){
		window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId='+blhpvid+'&wayBillNumber='+blhpvNumber+'&TypeOfNumber=9&BranchId='+branchId+'&searchBy=');
	} 
}
function getLsDetails(grid,dataView,row){
	hideLayer();
	if(dataView.getItem(row).dispatchLedgerId != undefined && dataView.getItem(row).dispatchLedgerId > 0) {
		getLRDetails(dataView.getItem(row).dispatchLedgerId,dataView.getItem(row).accountGroupId);
	} else {
		showMessage('error', 'LS Not Found.');
	}
	
}
function getLsLrExpenseDetails(grid,dataView,row){
	hideLayer();
	if(dataView.getItem(row).dispatchLedgerId != undefined && dataView.getItem(row).dispatchLedgerId > 0 && dataView.getItem(row).lrExpensesAmount >0 ) {
		getLrExpenseDetails(dataView.getItem(row).dispatchLedgerId);
	} 
	
}
function getAllLsLrExpenseDetails(){
	hideLayer();
	if(dispatchLedgerIds != null && dispatchLedgerIds !='') {
		var dispatchIds = dispatchLedgerIds.join(",");
		if(dispatchIds.trim() !='') {
			getLrExpenseDetails(dispatchIds);
		}
		
	}
}

function getLrExpenseDetails(dispatchIds) {
	var jsonObject = new Object();
	
	jsonObject["destinationBranchId"] 	= $('#branchEle').val();
	jsonObject["dispatchLedgerIds"] 	= dispatchIds;
	
	var object 				= new Object();
	object.jsonObject		= jsonObject;
	
	require([PROJECT_IVUIRESOURCES + '/resources/js/module/view/commissionReport/lsLrExpenseDetails.js'], function(LRExpenseDetails){
		var btModal = new Backbone.BootstrapModal({
			content		: new LRExpenseDetails(object),
			modalWidth 	: 80,
			modalHeight : 80,
			okText		: 'Close',
			showFooter 	: true,
			title		: '<center>LR Expense Details</center>'

		}).open();
	});
}

function getLRDetails(dispatchLedgerId,accountGroupId){  
	//hideLayer();
	var jsonObject = new Object();
	if($("#dateEle").attr('data-startdate') != undefined){
		jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
	}
	if($("#dateEle").attr('data-enddate') != undefined){
		jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
	}
	
	jsonObject["dispatchLedgerId"] 	= dispatchLedgerId;
	jsonObject["accountGroupId"] 	= accountGroupId;
	jsonObject["branchId"] 			= $('#branchEle').val();
	jsonObject["operationType"] 	= $('#commissionTypeEle').val();
	
	var object 				= new Object();
	object.jsonObject		= jsonObject;
	
	require([PROJECT_IVUIRESOURCES + '/resources/js/module/view/commissionReport/LRDetails.js'], function(LRDetails){
		var btModal = new Backbone.BootstrapModal({
			content		: new LRDetails(object),
			modalWidth 	: 80,
			okText		: 'Close',
			showFooter 	: true,
			title		: '<center>LR Details</center>'

		}).open();
	});
}

function getDlyDiscountDetails(){
	if(dlyDisc){
		showLayer();

		var jsonObject = new Object();
		if($("#dateEle").attr('data-startdate') != undefined){
			jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
		}
		if($("#dateEle").attr('data-enddate') != undefined){
			jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
		}

		jsonObject["branchId"] 			= $('#branchEle').val();
		jsonObject["operationType"] 	= $('#commissionTypeEle').val();

		var object 				= new Object();
		object.jsonObject		= jsonObject;

		require([PROJECT_IVUIRESOURCES + '/resources/js/module/view/commissionReport/DlyDiscountDetails.js'], function(DlyDiscountDetails){
			var btModal = new Backbone.BootstrapModal({
				content		: new DlyDiscountDetails(object),
				modalWidth 	: 80,
				okText		: 'Close',
				showFooter 	: true,
				title		: '<center>DlyDiscount Details</center>'

			}).open();
		});
	} else {
		showMessage('error', 'No Dly Discount Details Found !');
		return false;
	}
} 

function getBkgDoorDlyChrgDetails(){

	showLayer();

	var jsonObject = new Object();
	if($("#dateEle").attr('data-startdate') != undefined){
		jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
	}
	if($("#dateEle").attr('data-enddate') != undefined){
		jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
	}

	jsonObject["branchId"] 			= $('#branchEle').val();
	jsonObject["operationType"] 	= $('#commissionTypeEle').val();


	var object 				= new Object();
	object.jsonObject		= jsonObject;

	require([PROJECT_IVUIRESOURCES + '/resources/js/module/view/commissionReport/BkgDoorDlyChrgeDetails.js'], function(BkgDoorDlyChrgeDetails){
		var btModal = new Backbone.BootstrapModal({
			content		: new BkgDoorDlyChrgeDetails(object),
			modalWidth 	: 80,
			okText		: 'Close',
			showFooter 	: true,
			title		: '<center>DoorDlyCharge Details</center>'

		}).open();
	});

}