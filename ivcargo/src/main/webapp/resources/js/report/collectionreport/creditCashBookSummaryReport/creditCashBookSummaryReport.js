var CHARGE_TYPE	= 1,BOOKING_COMMISSION=3,IN_TOPAY=1,OUT_TOPAY=2,
totalDebitAmt = 0,
totalCreditAmt = 0;
var BRANCH_BALANCE_OUT	= 12;
var BRANCH_BALANCE_IN	= 13;
var CREDIT_NOTE	= 8;
var DEBIT_NOTE	= 9;
var branchList	= null;

define([
		PROJECT_IVUIRESOURCES +'/resources/js/populateautocomplete/selectoption.js'
		,'JsonUtility'
		,'messageUtility'
		,'nodvalidation'
		,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
		,'focusnavigation'//import in require.config
	],function(Selection) {
	'use strict';
	var jsonObject = new Object(), myNod, _this = '', printHeaderModel;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/creditLimitSummaryReportWS/getCreditLimitSummaryReportElement.do?',	_this.renderReportElements,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},renderReportElements : function(response){
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/report/collectionreport/creditCashBookSummaryReport/creditCashBookSummaryReport.html",function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();

				var elementConfiguration	= new Object();

				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.branchElement		= $('#branchEle');

				response.isCalenderSelection	= true;
				response.agentBranchSelection	= true;
				response.elementConfiguration	= elementConfiguration;
				branchList	= response.branchList;

				Selection.setSelectionToGetData(response);

				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector: '#branchEle',
					validate: 'validateAutocomplete:#branchEle',
					errorMessage: 'Select proper Branch !'
				});

				hideLayer();

				$("#saveBtn").click(function() {
					myNod.performCheck();

					if(myNod.areAll('valid'))
						_this.onSubmit();						
				});
			});
		}, onSubmit : function() {
			showLayer();
			let jsonObject = Selection.getElementData();

			getJSON(jsonObject, WEB_SERVICE_URL+'/creditLimitSummaryReportWS/getCreditLimitSummaryData.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData : function(response) {
			if(response.message != undefined) {
				hideLayer();
				$('#middle-border-boxshadow').addClass('hide');
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}
			
			var branchId	= $('#branchEle').val();
			
			$('#creditCashBookSummaryReportTable thead').empty();
			$('#creditCashBookSummaryReportTable tbody').empty();
			$('#printCreditCashBookSummaryReport').empty();
			$('#plainPrintAllData thead').empty();
			$('#plainPrintAllData tbody').empty();
			
			printHeaderModel	= response.PrintHeaderModel;
			totalDebitAmt		= response.collectionAmount + response.demurrage + response.inTopay + response.debitNoteAmount + response.balanceOutAmount + response.penaltyAmount + response.lrCancelPenaltyAmount;
			totalCreditAmt		= response.cartage + response.bookingCommission + response.deliveryCommission + response.outTopay + response.creditNoteAmount + response.balanceInAmount + response.prepaidPaymentReceived + response.onAccountAmount;
			
			var headerColumnArray		= new Array();
			var dataColumnArray			= new Array();
			var headerPrintColumnArray		= new Array();
			
			headerColumnArray.push("<tr><th class='textAlignCenter creditlevel' colspan = '5'>"+printHeaderModel.accountGroupName+"</th></tr>");
			headerColumnArray.push("<tr><th class='textAlignCenter creditlevel' colspan = '5' >"+response.sourceBranchName+"</th></tr>");
			headerColumnArray.push("<tr><th class='textAlignCenter creditlevel' colspan = '5' ><span>From Date : </span><span id ='selectedFromDate'></span>&nbsp;&nbsp;&nbsp;&nbsp<span> To Date :</span><span id='selectedToDate'></span><span class='hide' id='selectedToTime'></span></th></tr>");
			headerColumnArray.push("<tr><th class='textAlignCenter creditlevel' style='width:30%;text-align : left'>Details(Dr)</th><th class='textAlignCenter creditlevel' style='width:17%'>Amount</th><th class='textAlignCenter' style='width:5%'></th><th class='textAlignCenter creditlevel' style='width:30%;text-align : left'>Details(Cr)</th><th class='textAlignCenter creditlevel' style='width:17%'>Amount</th></tr>");
			$('#creditCashBookSummaryReportTable thead').append(headerColumnArray.join(' '));
			headerPrintColumnArray.push("<tr><th class='textAlignCenter creditlevel' colspan = '5'>"+printHeaderModel.accountGroupName+"</th></tr>");
			headerPrintColumnArray.push("<tr><th class='textAlignCenter creditlevel' colspan = '5' >"+response.sourceBranchName+"</th></tr>");
			headerPrintColumnArray.push("<tr><th class='textAlignCenter creditlevel' colspan = '5' ><span>From Date : </span><span id ='selectedFromDate1'></span>&nbsp;&nbsp;&nbsp;&nbsp<span> To Date :</span><span id='selectedToDate1'></span></th></tr>");
			headerPrintColumnArray.push("<tr><th class='' style='text-align:left;font-size:10px;' colspan = '5' ><span style='font-weight:bold;'>Notes : </span><br><span style='padding-left:30px;font-weight:initial;'>&#8226; If closing balance is negative means company has agent branch deposit.</span><br><span style='padding-left:30px;font-weight:initial;'>&#8226; If closing balance is positive means agnet has company money.</span></th></tr>");
			headerPrintColumnArray.push("<tr><th class='textAlignCenter creditlevel' colspan = '5' style='font-size:18px;padding-top:15px;'>Credit Limit Summary Report(Cash Book Type)</th></tr>");
			headerPrintColumnArray.push("<tr><th class='textAlignCenter creditlevel' style='width:30%;text-align:left;padding-top:15px;'>Details(Dr)</th><th class='textAlignCenter creditlevel' style='width:17%'>Amount</th><th class='textAlignCenter' style='width:5%'></th><th class='textAlignCenter creditlevel' style='width:30%;text-align : left'>Details(Cr)</th><th class='textAlignCenter creditlevel' style='width:17%'>Amount</th></tr>");

			$('#plainPrintAllData thead').append(headerPrintColumnArray.join(' '));
			
			dataColumnArray.push("<td class ='creditlevel' style='text-align: left'>Opening Balance</td>");
			dataColumnArray.push("<td class ='creditlevel' style='text-align: center; width:20%;background-color: #57db2796;'>"+ response.openingBalance +"</td>");
			dataColumnArray.push("<td style='width:5%'></td>");
			dataColumnArray.push("<td class ='creditlevel' style='text-align: left'></td>");
			dataColumnArray.push("<td class ='creditlevel' style='text-align: center'></td>");
			
			_this.appendTR(dataColumnArray);
			dataColumnArray	=[];
			
			dataColumnArray.push("<td class ='creditlevel'style='text-align: left'>Collection</td>");
			dataColumnArray.push("<td class ='creditlevel'style='text-align: center; width:20%;background-color: #57db2796;'>"+ response.collectionAmount +"</td>");
			dataColumnArray.push("<td style='width:5%'></td>");
			dataColumnArray.push("<td class ='creditlevel'style='text-align: left'>Cartage</td>");
			dataColumnArray.push("<td class ='creditlevel'style='text-align: center;background-color: #ff6e4a;'>"+ response.cartage +"</td>");
			
			_this.appendTR(dataColumnArray);
			dataColumnArray	=[];
			
			dataColumnArray.push("<td class ='creditlevel' style='text-align: left'>Demurrage</td>");
			dataColumnArray.push("<td class ='creditlevel'style='text-align: center; width:20%;background-color: #57db2796;'>"+ response.demurrage +"</td>");
			dataColumnArray.push("<td style='width:5%'></td>");
			dataColumnArray.push("<td class ='creditlevel'style='text-align: left'>Booking Commission</td>");
			dataColumnArray.push("<td class ='creditlevel' style='text-align: center;background-color: #ff6e4a;'>"+ response.bookingCommission +"</td>");
			
			_this.appendTR(dataColumnArray);
			dataColumnArray	=[];
			
			dataColumnArray.push("<td class ='creditlevel' style='text-align: left'></td>");
			dataColumnArray.push("<td class ='creditlevel'style='text-align: center; width:20%'></td>");
			dataColumnArray.push("<td style='width:5%'></td>");
			dataColumnArray.push("<td class ='creditlevel'style='text-align: left'>Delivery Commission</td>");
			dataColumnArray.push("<td class ='creditlevel' style='text-align: center;background-color: #ff6e4a;'>"+ response.deliveryCommission +"</td>");
			
			_this.appendTR(dataColumnArray);
			dataColumnArray	=[];
			
			dataColumnArray.push("<td class ='creditlevel'style='text-align: left'>Incoming ToPay</td>");
			dataColumnArray.push("<td class ='creditlevel' style='text-align: center; width:20%;background-color: #57db2796;'>"+ response.inTopay +"</td>");
			dataColumnArray.push("<td style='width:5%'></td>");
			dataColumnArray.push("<td class ='creditlevel'style='text-align: left'>Outgoing ToPay</td>");
			dataColumnArray.push("<td class ='creditlevel'style='text-align: center;background-color: #ff6e4a;'>"+ response.outTopay +"</td>");
			
			_this.appendTR(dataColumnArray);
			dataColumnArray	=[];
			
			dataColumnArray.push("<td class ='creditlevel' style='text-align: left'>Debit Note</td>");
			dataColumnArray.push("<td class ='creditlevel' style='text-align: center; width:20%;background-color: #57db2796;'> <a style = 'cursor: pointer;' onclick='getCreditDebitNoteDetails (" +branchId+","+DEBIT_NOTE+","+ response.debitNoteAmount +");'>"+ response.debitNoteAmount +"</a></td>");
			dataColumnArray.push("<td style='width:5%'></td>");
			dataColumnArray.push("<td class ='creditlevel'style='text-align: left'>Credit Note</td>");
			dataColumnArray.push("<td class ='creditlevel'style='text-align: center;background-color: #ff6e4a;'> <a style = 'cursor: pointer;' onclick='getCreditDebitNoteDetails (" +branchId+","+CREDIT_NOTE+","+ response.creditNoteAmount +");'>"+ response.creditNoteAmount +"</a></td>");
			
			_this.appendTR(dataColumnArray);
			dataColumnArray	=[];
			
			dataColumnArray.push("<td class ='creditlevel' style='text-align: left'>Balance Out</td>");
			dataColumnArray.push("<td class ='creditlevel' style='text-align: center; width:20%;background-color: #57db2796;'> <a style = 'cursor: pointer;' onclick='getCreditLimitTransactionDetails (" +branchId+","+BRANCH_BALANCE_OUT+","+ response.balanceOutAmount +");'>"+ response.balanceOutAmount +"</a></td>");
			dataColumnArray.push("<td style='width:5%'></td>");
			dataColumnArray.push("<td class ='creditlevel' style='text-align: left'>Balance In</td>");
			dataColumnArray.push("<td class ='creditlevel' style='text-align: center;background-color: #ff6e4a;'> <a style = 'cursor: pointer;' onclick='getCreditLimitTransactionDetails (" +branchId+","+BRANCH_BALANCE_IN+","+ response.balanceInAmount +");'>"+ response.balanceInAmount +"</a></td>");
			
			_this.appendTR(dataColumnArray);
			dataColumnArray	=[];
			
			dataColumnArray.push("<td style='text-align: left'></td>");
			dataColumnArray.push("<td class ='creditlevel' style='text-align:center; width:20%;'></td>");
			dataColumnArray.push("<td style='width:5%'></td>");
			dataColumnArray.push("<td class ='creditlevel'style='text-align: left'>Recharge</td>");
			dataColumnArray.push("<td class ='creditlevel' style='text-align: center;background-color: #ff6e4a;'> <a style = 'cursor: pointer;' onclick='getRechargeRequestDetails (" +branchId+","+response.prepaidPaymentReceived +");'>"+ response.prepaidPaymentReceived +"</a></td>");
			
			_this.appendTR(dataColumnArray);
			dataColumnArray	=[];
			
			dataColumnArray.push("<td class ='creditlevel' style='text-align: left'>Failed Txn Penalty</td>");
			dataColumnArray.push("<td class ='creditlevel' style='text-align: center; width:20%;background-color: #57db2796;'>"+ response.penaltyAmount +"</td>");
			dataColumnArray.push("<td style='width:5%'></td>");
			dataColumnArray.push("<td class ='creditlevel' style='text-align: left'>On Account Collection</td>");
			dataColumnArray.push("<td class ='creditlevel'style='text-align: center;background-color: #ff6e4a;'>"+ response.onAccountAmount +"</td>");
			
			_this.appendTR(dataColumnArray);
			dataColumnArray	=[];
			
			if(response.showLrCancelPenaltyAmount){
				dataColumnArray.push("<td  class ='creditlevel' style='text-align: left'>LR Cancel Penalty Amount</td>");
				dataColumnArray.push("<td class ='creditlevel' style='text-align: center;background-color: #57db2796;'> <a style = 'cursor: pointer;' onclick='getPenaltyReportDetails (" +branchId+","+response.lrCancelPenaltyAmount +");'>"+ response.lrCancelPenaltyAmount +"</a></td>");
				dataColumnArray.push("<td style='width:5%'></td>");
				dataColumnArray.push("<td class ='creditlevel' style='text-align: left'></td>");
				dataColumnArray.push("<td class ='creditlevel'style='text-align: center;background-color: #ff6e4a;'></td>");
	
				_this.appendTR(dataColumnArray);
				dataColumnArray	=[];
			}
			
			dataColumnArray.push("<td class ='creditlevel' style='text-align: left'>TOTAL</td>");
			dataColumnArray.push("<td class ='creditlevel'style='text-align: center; width:20%;background-color: #57db2796;'>"+ parseFloat(totalDebitAmt).toFixed(2) +"</td>");
			dataColumnArray.push("<td style='width:5%'></td>");
			dataColumnArray.push("<td class ='creditlevel' style='text-align: left'>TOTAL</td>");
			dataColumnArray.push("<td class ='creditlevel'style='text-align: center;background-color: #ff6e4a;'>"+ parseFloat(totalCreditAmt).toFixed(2) +"</td>");
			
			_this.appendTR(dataColumnArray);
			dataColumnArray	=	[];
			
			dataColumnArray.push("<td class ='creditlevel' style='text-align: left;font-weight : bold'>Closing Balance</td>");
			dataColumnArray.push("<td class ='creditlevel' style='text-align: center;font-weight : bold; width:20%;background-color: #57db2796;'>"+ response.closingBalance +"</td>");
			dataColumnArray.push("<td style='width:5%'></td>");
			dataColumnArray.push("<td style='text-align: center'></td>");
			dataColumnArray.push("<td style='text-align: right'></td>");
			
			_this.appendTR(dataColumnArray);
			dataColumnArray	=	[];
			
			var fromDate	= $("#dateEle").attr('data-startdate');
			var toDate		= $("#dateEle").attr('data-enddate');
			var subRegion	= $('#fromSubRegionEle').val();
				
			$('#selectedDate').html("From : " + fromDate + " To : " + toDate);
			$('#selectedSubregion').html("Owner Name : " + subRegion);
			$('#printDate').html("Print Date :" + new Date().toLocaleString());
				
			var data = new Object();
			data.accountGroupNameForPrint	= printHeaderModel.accountGroupName;
			data.branchAddress				= printHeaderModel.branchAddress;
			data.branchPhoneNumber			= printHeaderModel.branchContactDetailMobileNumber;
			data.isLaserPrintAllow				= 'true';
			data.isPlainPrintAllow				= 'false';
			data.isExcelButtonDisplay			= 'true';
			
			data.showFromAndToDateInReportData			= false;
			
			$('#sourceBranchName').html(response.sourceBranchName);

			if($("#dateEle").attr('data-startdate') != undefined) {
				data.fromDate = $("#dateEle").attr('data-startdate'); 
				$('#selectedFromDate').html($("#dateEle").attr('data-startdate'));
				$('#selectedFromDate1').html($("#dateEle").attr('data-startdate'));
				$('#selectedFromDate').val($("#dateEle").attr('data-startdate'));
			}
			
			var currentDate = new Date();
			var currentTime = currentDate.getHours() + "-" + currentDate.getMinutes() + "-" + currentDate.getSeconds();
			if($("#dateEle").attr('data-enddate') != undefined) {
				data.toDate = $("#dateEle").attr('data-enddate'); 
				$('#selectedToDate').html($("#dateEle").attr('data-enddate'));
				$('#selectedToDate1').html($("#dateEle").attr('data-enddate'));
				$('#selectedToDate').val($("#dateEle").attr('data-enddate'));
				$('#selectedToTime').val(currentTime);
			}

			var plainPrintJsonObject		= new Object();
			var tableRow		= createRowInTable('', '', '');
			var plainPrintCol	= createColumnInRow(tableRow, '', '', '', '', '', '');
				plainPrintJsonObject.type		= 'button';
				plainPrintJsonObject.id			= '';
				plainPrintJsonObject.class		= 'btn_print plainPrint';
				plainPrintJsonObject.style		= 'width: 90px;';
				plainPrintJsonObject.name		= '';
				plainPrintJsonObject.value		= 'Plain Print';
				plainPrintJsonObject.onclick	= 'printPlainData()';
				
			createInput(plainPrintCol, plainPrintJsonObject);

			appendRowInTable('printCreditCashBookSummaryReport', tableRow);
			
			$(".balanceColumn").css("background-color", "#f7dd0d96");
			$(".creditlevel").css("font-size", "16px");
			$(".table-height").css("font-size", "20px");
			$(".openingBalance").css("background", "lightgray");
			$(".closingBalance").css("background", "lightgray");
			$("#creditCashBookSummaryReportTable tbody tr td").attr('width', "20%");

			$('#middle-border-boxshadow').removeClass('hide');

			hideLayer();
		}, appendTR : function(columnArray) {
			$('#creditCashBookSummaryReportTable tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
			$('#plainPrintAllData tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
		}
	});
});

function getCreditLimitTransactionDetails(branchId, filter, amt) {
	let fromDate = $('#selectedFromDate').val();
	let toDate	= $('#selectedToDate').val();
	let toTime	= $('#selectedToTime').val();
	
	if(Number(amt) > 0)
		window.open('report.do?pageId=340&eventId=3&modulename=creditLimitTransactionReport&fromDate=' + fromDate + '&toDate=' + toDate + '&toTime='+ toTime + '&sourceBranchId=' + branchId + '&filter=' + filter +'&onDebitCreditFlag=true');
	else
		showMessage("error", "Amount is 0!")
}
function getCreditDebitNoteDetails(branchId, filter, amt) {
	var fromDate = $('#selectedFromDate').val();
	var toDate	= $('#selectedToDate').val();
	var toTime	= $('#selectedToTime').val();
	
	var branchObj = branchList.find(function(b) {
				if(b.branchId == branchId){
					return b;
				}
		});
	if(Number(amt) > 0)
		window.open('report.do?pageId=340&eventId=3&modulename=creditDebitNoteReport&fromDate=' + fromDate + '&toDate=' + toDate + '&toTime='+ toTime + '&region=' + branchObj.regionId + '&subRegion=' + branchObj.subRegionId + '&branch='+ branchObj.branchId + '&filter=' + filter +'&onDebitCreditFlag=true');
	else
		showMessage("error", "Amount is 0!")
}
function getRechargeRequestDetails(branchId, amt) {
	var fromDate = $('#selectedFromDate').val();
	var toDate	= $('#selectedToDate').val();
	var toTime	= $('#selectedToTime').val();
	
	var branchObj = branchList.find(function(b) {
				if(b.branchId == branchId){
					return b;
				}
		});
	if(Number(amt) > 0)
		window.open('report.do?pageId=340&eventId=3&modulename=rechargeRequestAndApprovedReport&fromDate=' + fromDate + '&toDate=' + toDate + '&toTime='+ toTime + '&region=' + branchObj.regionId + '&subRegion=' + branchObj.subRegionId + '&branch='+ branchObj.branchId + '&onRechargeRequestFlag=true');
	else
		showMessage("error", "Amount is 0!")
}

function printPlainData(){
	
    var printWindow = window.open('', 'newwindow', 'width=600,height=600');
    
    printWindow.document.write('<html><head><title>Print</title></head><body>');
    printWindow.document.write('<div id="data" align="center"></div>');
    printWindow.document.write('</body></html>');
    
   $('#printAllData').removeClass('hide');
	var reportdataAll =  getValueFromHtmlTag('printAllData');
	
		printWindow.window.setTimeout(function() { 
			printWindow.document.getElementById('data').innerHTML	= reportdataAll;
			hideLayer();
			printWindow.print();
			printWindow.close();
		}, 200);
		$('#printAllData').addClass('hide');
}
function getPenaltyReportDetails(branchId, amt) {
	let fromDate = $('#selectedFromDate').val();
	let toDate	= $('#selectedToDate').val();
	let toTime	= $('#selectedToTime').val();
	
	let branchObj = branchList.find(function(b) {
				if(b.branchId == branchId){
					return b;
				}
		});	
		
	if(Number(amt) > 0)
		window.open('report.do?pageId=340&eventId=3&modulename=penaltyReport&fromDate=' + fromDate + '&toDate=' + toDate + '&toTime='+ toTime + '&region=' + branchObj.regionId + '&subRegion=' + branchObj.subRegionId + '&branch='+ branchObj.branchId +'&lrCancelPenaltyFlag=true');
	else
		showMessage("error", "Amount is 0!")
}
