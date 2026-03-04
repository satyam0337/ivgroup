
define([  'JsonUtility'
	,'messageUtility'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/allbranchwisecollectionreport/allbranchwisecollectionreportfilepath.js'
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
	showAmountWithGSTNColumn = false,
	gstOnAnyAmount = false, isShowSeparateBkgAndDelvryUpiPaymentColumn = false;
	
	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/allBranchWiseCollectionReportWS/getAllBranchWiseCollectionReportElementConfiguration.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},getElementConfigDetails : function(response){
			let loadelement = new Array();
			let baseHtml = new $.Deferred();
			let executive	= response.executive;

			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/allbranchwisecollectionreport/AllBranchWiseCollectionReport.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				let keyObject = Object.keys(response);
				
				for (const element of keyObject) {
					if (response[element])
						$("*[data-attribute="+ element+ "]").removeClass("hide");
				}
				
				showAmountWithGSTNColumn 					= response.showAmountWithGSTNColumn;
				isShowSeparateBkgAndDelvryUpiPaymentColumn	= response.isShowSeparateBkgAndDelvryUpiPaymentColumn;
				
				let elementConfiguration	= new Object();

				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');

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
				
				if (response['region']) {
					myNod.add({
						selector: '#regionEle',
						validate: 'validateAutocomplete:#regionEle_primary_key',
						errorMessage: 'Select proper Region !'
					});
				}
				
				hideLayer();

				$("#searchBtn").click(function() {
					myNod.performCheck();
					if(myNod.areAll('valid')){
						_this.onSubmit(_this);								
					}
				});
				
				if(showAmountWithGSTNColumn) {
					$('#gstOnAnyAmount').removeClass('hide');
					$('#gstOnAmountCheck').removeClass('hide');
				} else {
					$('#gstOnAnyAmount').addClass('hide');
					$('#gstOnAmountCheck').addClass('hide');
				}
			});

		},setReportData : function(response) {
			if(response.message != undefined) {
				hideLayer();
				$('#middle-border-boxshadow').addClass('hide');
				return;
			}
			
			let allBranchWiseCollectionMap 		= response.allBranchWiseCollectionMap;
			let bkgDlytotalAmtHM			 	= response.bkgDlytotalAmtHM;
			let totalAmountHM					= response.totalAmountHM;
			let aLLBranchWiseCollectionReport	= response.aLLBranchWiseCollectionReport;
			let branch = response.branch;
			let accountGroup = response.accountGroup;
			
			$("#printAllBranchWiseCollectionReport").empty();
			$("#selectedRegion").html("Region : ");
			$("#selectedFromDate").html("From Date : ");
			$("#selectedToDate").html("To Date : ");
			$("#SelectedRegionValue").html(aLLBranchWiseCollectionReport.regionName);
			$("#selectedFromDateValue").html(aLLBranchWiseCollectionReport.fromDateStr);
			$("#selectedToDateValue").html(aLLBranchWiseCollectionReport.toDateStr);
			
			$('#reportDetailsTable thead').empty();
			$('#reportDetailsTable tbody').empty();
			$('#reportDetailsTable tfoot').empty();
			
			let columnHeadArray				= new Array();
			let columnHeadSubArray			= new Array();
			let columnArray					= new Array();
			let columnFooterArray			= new Array();
			
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
			
			if (isShowSeparateBkgAndDelvryUpiPaymentColumn)
				columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>&nbsp;</th>");
			
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Cash<br/>less</th>");
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
			columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Paytm</th>");
		
			if (isShowSeparateBkgAndDelvryUpiPaymentColumn) {
				columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Booking UPI</th>");
				columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Delivery UPI</th>");
			} else {
				columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>UPI</th>");
			}
			
			columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Credit<br/>Debit<br/>Card</th>");
			columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Online<br/>PYMT</th>");
			columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Cheque<br/>PYMT</th>");
			columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Total<br/>Branch<br/>Coll'n</th>");
			
			if(showAmountWithGSTNColumn) {
				if($('#gstOnAmountCheck').is(':checked')){
					columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>LR with GSTN </th>");
				} else {
					columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>LR > 750<br/>with GSTN<br/></th>");
				}
			}
			
			$('#reportDetailsTable thead').append('<tr id="reportDetailsTableHeader" class="text-success text-center">' + columnHeadSubArray.join(' ') + '</tr>');
			
			let dataKey				= Object.keys(allBranchWiseCollectionMap);
			let grandTotalCash = 0;
			let grandTotalBranchCollection = 0;
			let grandTotalAmountWithGST	   = 0;
			let regionId	 			   = $('#regionEle_primary_key').val();
			
			for(let i = 0;i<dataKey.length;i++){
				let obj	= allBranchWiseCollectionMap[dataKey[i]];

 				let bookingTotal  = bkgDlytotalAmtHM[obj.branchId+'_bkg'];
				
				if(bookingTotal == 'undefined' || bookingTotal == undefined){
					bookingTotal = 0;
				}
				
				let deliveryTotal  = bkgDlytotalAmtHM[obj.branchId+'_dly'];
				
				if(deliveryTotal == 'undefined' || deliveryTotal == undefined){
					deliveryTotal = 0;
				}
				
				let grandTotal  = bkgDlytotalAmtHM[obj.branchId+'_grandTotal'];
				
				if(grandTotal == 'undefined' || grandTotal == undefined){
					grandTotal = 0;
				}
				
				let totalCash = Number(obj.totalBookingPaidAmount) + Number(obj.totalBookingPaidManaulAmount)
						+Number(obj.totalDeliveryAutoAmount) + Number(obj.totalDeliveryManaulAmount) + Number(obj.totalBookingCancelAmount);
				
				if(totalCash == 'undefined' || totalCash == undefined){
					totalCash = 0;
				}
				
				grandTotalCash += totalCash;
				
				let totalBranchCollection = Number(totalCash) + Number(obj.totalPaytmPaymentAmount) + Number(obj.totalUPIPaymentAmount) + Number(obj.totalCardPaymentAmount) + 
				Number(obj.totalOnlinePaymentAmount) + Number(obj.totalChequePaymentAmount);
				
				if(totalBranchCollection == 'undefined' || totalBranchCollection == undefined){
					totalBranchCollection = 0;
				}
				
				grandTotalBranchCollection += totalBranchCollection;
				grandTotalAmountWithGST += obj.totalAmountWithGST;
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i+1) + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.branchName + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.totalBookingPaidAmount + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.totalBookingPaidManaulAmount + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.totalBookingToPayAmount + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.totalBookingToPayManaulAmount + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.totalBookingCreditorAmount + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.totalBookingCreditorManaulAmount + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + bookingTotal + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.totalBookingCancelAmount + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.totalDeliveryAutoAmount + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.totalDeliveryManaulAmount + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + deliveryTotal + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + grandTotal + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + totalCash + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.totalPaytmPaymentAmount + "</td>");
				
				if (isShowSeparateBkgAndDelvryUpiPaymentColumn) {
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.totalUPIBookingAmount + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.totalUPIDeliveryAmount + "</td>");
				} else {
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.totalUPIPaymentAmount + "</td>");
				}
				
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.totalCardPaymentAmount + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.totalOnlinePaymentAmount + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.totalChequePaymentAmount + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + totalBranchCollection + "</td>");
				
				if(showAmountWithGSTNColumn){
					if(Number(obj.totalAmountWithGST) > 0){
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><a href='Allbranchwisecollectionreport.do?pageId=340&eventId=2&modulename=allBranchWiseCollectionLRDetails&toDate="+toDate+"&fromDate="+fromDate+"&branchId="+obj.branchId+"&gstOnAnyAmount="+gstOnAnyAmount+"' target='_blank'>"+ obj.totalAmountWithGST+"</a></td>");
					} else {
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>"+ obj.totalAmountWithGST+"</td>");
					}
				} 
				$('#reportDetailsTable tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
				columnArray = [];
			}
			
			columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>&nbsp;</th>");
			columnFooterArray.push("<th style='text-align: center; vertical-align: middle;font-weight:bold;'>Total</th>");
			columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>" + totalAmountHM['bkgPaid'] + "</th>");
			columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>" + totalAmountHM['bkgPaidManual'] + "</th>");
			columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>" + totalAmountHM['bkgToPay'] + "</th>");
			columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>" + totalAmountHM['bkgToPayManual'] + "</th>");
			columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>" + totalAmountHM['bkgCreditor'] + "</th>");
			columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>" + totalAmountHM['bkgCreditorManual'] + "</th>");
			columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>" + totalAmountHM['bkgTotal'] + "</th>");
			columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>" + totalAmountHM['cancellationCharges'] + "</th>");
			columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>" + totalAmountHM['dlyAuto'] + "</th>");
			columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>" + totalAmountHM['dlyManual'] + "</th>");
			columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>" + totalAmountHM['dlyTotal'] + "</th>");
			columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>" + totalAmountHM['totalGrandTotal'] + "</th>");
			columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>" + grandTotalCash + "</th>");
			columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>" + totalAmountHM['bkgpaytm'] + "</th>");
			
			if (isShowSeparateBkgAndDelvryUpiPaymentColumn) {
				columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>" + (totalAmountHM['bkgUPIPaymentTotal'] ?? 0) + "</th>");
				columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>" + (totalAmountHM['delvryUPIPaymentTotal'] ?? 0) + "</th>");

			} else {
				columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>" + totalAmountHM['bkgUPIPayment'] + "</th>");
			}
		    
			columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>" + totalAmountHM['bkgCardPayment'] + "</th>");
			columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>" + totalAmountHM['bkgOnlinePayment'] + "</th>");
			columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>" + totalAmountHM['bkgChequePayment'] + "</th>");
			columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>" + grandTotalBranchCollection + "</th>");
			
			if(showAmountWithGSTNColumn)
				columnFooterArray.push("<td style='text-align: center; vertical-align: middle;'><a href='Allbranchwisecollectionreport.do?pageId=340&eventId=2&modulename=allBranchWiseCollectionLRDetails&toDate="+toDate+"&fromDate="+fromDate+"&bookingAndDeliveryLrs=true&regionId="+regionId+"&gstOnAnyAmount="+gstOnAnyAmount+"' target='_blank'>"+ grandTotalAmountWithGST+"</a></td>");
		
			$('#reportDetailsTable tfoot').append('<tr class="text-info">' + columnFooterArray.join(' ') + '</tr>');
			
			$('#middle-border-boxshadow').removeClass('hide');
			
			let data = new Object();
			data.accountGroupNameForPrint	= accountGroup.accountGroupDescription;
			data.branchAddress	= branch.branchAddress;
			data.branchPhoneNumber	= branch.branchContactDetailPhoneNumber;
			data.isLaserPrintAllow	= 'true';
			data.isPlainPrintAllow	= 'true';
			data.isExcelButtonDisplay	= 'true';
			data.isPdfButtonDisplay	= 'false';
			printTable(data, 'reportData', 'allBranchWiseCollectionReport', 'All Branch Wise Collection Report', 'printAllBranchWiseCollectionReport');
			
			hideLayer();
			
		},onSubmit : function() {
			showLayer();
			let jsonObject = new Object();
			if($("#dateEle").attr('data-startdate') != undefined){
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
				fromDate = jsonObject["fromDate"];
			}
			if($("#dateEle").attr('data-enddate') != undefined){
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
				toDate = jsonObject["toDate"];
			}
			if($('#regionEle_primary_key').exists()){
				jsonObject["regionId"] 			= $('#regionEle_primary_key').val();
			}
			
			
			if(showAmountWithGSTNColumn && $("#gstOnAmountCheck").exists() && $('#gstOnAmountCheck').is(':checked')){
				gstOnAnyAmount = true;
				getJSON(jsonObject, WEB_SERVICE_URL+'/allBranchWiseCollectionReportWS/getAllBranchWiseCollectionReportDetailsOfAnyAmount.do', _this.setReportData, EXECUTE_WITH_ERROR);	
			} else {
				gstOnAnyAmount = false;
				getJSON(jsonObject, WEB_SERVICE_URL+'/allBranchWiseCollectionReportWS/getAllBranchWiseCollectionReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
			}
		}
	});
});