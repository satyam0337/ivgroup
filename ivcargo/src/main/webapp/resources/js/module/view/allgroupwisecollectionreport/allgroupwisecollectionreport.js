
define([  'JsonUtility'
	,'messageUtility'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/allgroupwisecollectionreport/allgroupwisecollectionreportfilepath.js'
	,'jquerylingua'
	,'language'
	,'autocomplete'
	,'autocompleteWrapper'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	],function(JsonUtility, MessageUtility, FilePath, Lingua, Language, AutoComplete, AutoCompleteWrapper,
			 NodValidation, BootstrapModal,ElementFocusNavigation,Selection) {
	'use strict';
	var jsonObject = new Object(), 
	myNod,
	_this = '', 
	masterLangObj, 
	masterLangKeySet,
	fromDate,
	toDate,
	showAmountWithGSTNColumn = false;
	var accountGroupId = 0;
	var serverIdentfier = 0;
	var accountGroupName ='';
	
	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/allGroupWiseCollectionReportWS/getAllGroupWiseCollectionReportElementConfiguration.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},getElementConfigDetails : function(response){

			showAmountWithGSTNColumn = response.allGroupWiseCollectionReport.showAmountWithGSTNColumn;
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			var executive	= response.executive;
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/allgroupwisecollectionreport/AllGroupWiseCollectionReport.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();

				var accountGroupAuto = Object();
				accountGroupAuto.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getAccountGroupDetailsByName.do';
				accountGroupAuto.primary_key 	= 'accountGroupId';
				accountGroupAuto.field 		    = 'accountGroupDescription';
				accountGroupAuto.keyupFunction = callBackBank;
				accountGroupAuto.blurFunction  = callBackBank;
				$("#accountGroupEle").autocompleteCustom(accountGroupAuto);
				function callBackBank(res) {
					accountGroupId   = $("#accountGroupEle_primary_key").val();
					accountGroupName = $("#accountGroupEle").val()
					if(accountGroupName!=''){
						 var n = accountGroupName.indexOf("(");
	                     var res = accountGroupName.substring(0, n);
	                     accountGroupName = res;
					}
				}
				var keyObject = Object.keys(response);
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]].show == true) {
						$("*[data-attribute="+ keyObject[i]+ "]").addClass("show");
					}
				}
				
				var elementConfiguration	= new Object();

				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');

				response.elementConfiguration	= elementConfiguration;
				response.sourceAreaSelection	= true;
				response.isCalenderSelection	= true;
				response.AllOptionsForRegion	= true;

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
						if(accountGroupId == 0){
							showMessage('info', "Select proper Account Group !");
						}else{
							_this.onSubmit(_this);
						}
														
					}
				});
			});

		},setReportData : function(response) {
			if(response.message != undefined) {
				hideLayer();
				$('#middle-border-boxshadow').addClass('hide');
				
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}
			
			var allBranchWiseCollectionMap 		= response.allBranchWiseCollectionMap;
			var bkgDlytotalAmtHM			 	= response.bkgDlytotalAmtHM;
			var totalAmountHM					= response.totalAmountHM;
			var aLLBranchWiseCollectionReport	= response.allGroupWiseCollectionReport;
			var branch = response.branch;
			var accountGroup = response.accountGroup;
			
			$("#printAllBranchWiseCollectionReport").empty();
			$("#selectedAcGroup").html("Account Group : ");
			$("#selectedFromDate").html("From Date : ");
			$("#selectedToDate").html("To Date : ");
			$("#SelectedAcGroupValue").html(accountGroupName);
			$("#selectedFromDateValue").html(aLLBranchWiseCollectionReport.fromDateStr);
			$("#selectedToDateValue").html(aLLBranchWiseCollectionReport.toDateStr);
			
			$('#reportDetailsTable thead').empty();
			$('#reportDetailsTable tbody').empty();
			$('#reportDetailsTable tfoot').empty();
			
			var columnHeadArray				= new Array();
			var columnHeadSubArray			= new Array();
			var columnArray					= new Array();
			var columnFooterArray			= new Array();
			
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>&nbsp;</th>");
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Branch</th>");
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>&nbsp;</th>");
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>&nbsp;</th>");
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>&nbsp;</th>");
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Booking</th>");
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>&nbsp;</th>");
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>&nbsp;</th>");
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>&nbsp;</th>");
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Cancel'n</th>");
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>&nbsp;</th>");
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Delivery</th>");
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>&nbsp;</th>");
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>&nbsp;</th>");
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>&nbsp;</th>");
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>&nbsp;</th>");
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>&nbsp;</th>");
			if(showAmountWithGSTNColumn)
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>&nbsp;</th>");
			$('#reportDetailsTable thead').append('<tr id="reportDetailsTableHeader" class="text-info text-center">' + columnHeadArray.join(' ') + '</tr>');
			
			columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Sr<br/>No.</th>");
			columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Branch</th>");
			columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Paid</th>");
			columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Paid<br/>Manual</th>");
			columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>ToPay</th>");
			columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>ToPay<br/>Manual</th>");
			columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>TBB</th>");
			columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>TBB<br/>Manual</th>");
			columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Total</th>");
			columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Cancel'n<br/>Charge</th>");
			columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Auto</th>");
			columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Manual</th>");
			columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Total</th>");
			columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Grand<br/>Total</th>");
			columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Total<br/>Cash</th>");
			columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Total<br/>Branch<br/>Coll'n</th>");
			if(showAmountWithGSTNColumn)
			columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>LR > 750<br/>with GSTN<br/></th>");
			$('#reportDetailsTable thead').append('<tr id="reportDetailsTableHeader" class="text-success text-center">' + columnHeadSubArray.join(' ') + '</tr>');
			
			var dataKey				= Object.keys(allBranchWiseCollectionMap);
			var grandTotalCash = 0;
			var grandTotalBranchCollection = 0;
			var grandTotalAmountWithGST	   = 0;
			for(var i = 0;i<dataKey.length;i++){
				var obj	= allBranchWiseCollectionMap[dataKey[i]];
				var bookingTotal  = bkgDlytotalAmtHM[obj.branchId+'_bkg'];
				if(bookingTotal == 'undefined' || bookingTotal == undefined){
					bookingTotal = 0;
				}
				var deliveryTotal  = bkgDlytotalAmtHM[obj.branchId+'_dly'];
				if(deliveryTotal == 'undefined' || deliveryTotal == undefined){
					deliveryTotal = 0;
				}
				var grandTotal  = bkgDlytotalAmtHM[obj.branchId+'_grandTotal'];
				if(grandTotal == 'undefined' || grandTotal == undefined){
					grandTotal = 0;
				}
				var totalCash = Number(obj.totalBookingPaidAmount)+ Number(obj.totalBookingPaidManaulAmount)
						+Number(obj.totalDeliveryAutoAmount)+Number(obj.totalDeliveryManaulAmount)+Number(obj.totalBookingCancelAmount);
				if(totalCash == 'undefined' || totalCash == undefined){
					totalCash = 0;
				}
				grandTotalCash += totalCash;
				var totalBranchCollection = Number(totalCash) + Number(obj.totalPaytmPaymentAmount) + Number(obj.totalUPIPaymentAmount) + Number(obj.totalCardPaymentAmount) + 
				Number(obj.totalOnlinePaymentAmount) + Number(obj.totalChequePaymentAmount);
				if(totalBranchCollection == 'undefined' || totalBranchCollection == undefined){
					totalBranchCollection = 0;
				}
				grandTotalBranchCollection += totalBranchCollection;
				grandTotalAmountWithGST += obj.totalAmountWithGST;
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i+1) + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.branchName + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (obj.totalBookingPaidAmount).toFixed(2) + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (obj.totalBookingPaidManaulAmount).toFixed(2) + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (obj.totalBookingToPayAmount).toFixed(2) + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (obj.totalBookingToPayManaulAmount).toFixed(2) + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (obj.totalBookingCreditorAmount).toFixed(2) + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (obj.totalBookingCreditorManaulAmount).toFixed(2) + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (bookingTotal).toFixed(2) + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (obj.totalBookingCancelAmount).toFixed(2) + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (obj.totalDeliveryAutoAmount).toFixed(2) + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (obj.totalDeliveryManaulAmount).toFixed(2) + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (deliveryTotal).toFixed(2) + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (grandTotal).toFixed(2) + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (totalCash).toFixed(2) + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (totalBranchCollection).toFixed(2) + "</td>");
				if(showAmountWithGSTNColumn){
					if(Number(obj.totalAmountWithGST) > 0){
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><a href='Allbranchwisecollectionreport.do?pageId=340&eventId=2&modulename=allBranchWiseCollectionLRDetails&toDate="+toDate+"&fromDate="+fromDate+"&branchId="+obj.branchId+"' target='_blank'>"+ obj.totalAmountWithGST+"</a></td>");
					} else {
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>"+ obj.totalAmountWithGST+"</td>");
					}
				} 
				$('#reportDetailsTable tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
				columnArray = [];
			}
			
			columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>&nbsp;</th>");
			columnFooterArray.push("<th style='text-align: center; vertical-align: middle;font-weight:bold;'>Total</th>");
			columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>" + (totalAmountHM['bkgPaid']).toFixed(2) + "</th>");
			columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>" + (totalAmountHM['bkgPaidManual']).toFixed(2) + "</th>");
			columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>" + (totalAmountHM['bkgToPay']).toFixed(2) + "</th>");
			columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>" + (totalAmountHM['bkgToPayManual']).toFixed(2) + "</th>");
			columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>" + (totalAmountHM['bkgCreditor']).toFixed(2) + "</th>");
			columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>" + (totalAmountHM['bkgCreditorManual']).toFixed(2) + "</th>");
			columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>" + (totalAmountHM['bkgTotal']).toFixed(2) + "</th>");
			columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>" + (totalAmountHM['cancellationCharges']).toFixed(2) + "</th>");
			columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>" + (totalAmountHM['dlyAuto']).toFixed(2) + "</th>");
			columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>" + (totalAmountHM['dlyManual']).toFixed(2) + "</th>");
			columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>" + (totalAmountHM['dlyTotal']).toFixed(2) + "</th>");
			columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>" + (totalAmountHM['totalGrandTotal']).toFixed(2) + "</th>");
			columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>" + (grandTotalCash).toFixed(2) + "</th>");
			columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>" + (grandTotalBranchCollection).toFixed(2) + "</th>");
			if(showAmountWithGSTNColumn)
			columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>" + (grandTotalAmountWithGST).toFixed(2) + "</th>");
			$('#reportDetailsTable tfoot').append('<tr class="text-info">' + columnFooterArray.join(' ') + '</tr>');
			
			$('#middle-border-boxshadow').removeClass('hide');
			
			var data = new Object();
			data.accountGroupNameForPrint	= accountGroup.accountGroupDescription;
			data.branchAddress	= branch.branchAddress;
			data.branchPhoneNumber	= branch.branchContactDetailPhoneNumber;
			data.isLaserPrintAllow	= 'true';
			data.isPlainPrintAllow	= 'true';
			data.isExcelButtonDisplay	= 'true';
			data.isPdfButtonDisplay	= 'false';
			printTable(data, 'reportData', 'allBranchWiseCollectionReport', 'All Group Wise Collection Report', 'printAllBranchWiseCollectionReport');
			
			hideLayer();
			
		},onSubmit : function() {
			showLayer();
			var jsonObject = new Object();
			if($("#dateEle").attr('data-startdate') != undefined){
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
				fromDate = jsonObject["fromDate"];
			}
			if($("#dateEle").attr('data-enddate') != undefined){
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
				toDate = jsonObject["toDate"];
			}
			jsonObject["accountGroupId"] 			= accountGroupId;
			getJSON(jsonObject, WEB_SERVICE_URL+'/allGroupWiseCollectionReportWS/getAllGroupWiseCollectionReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}
	});
});