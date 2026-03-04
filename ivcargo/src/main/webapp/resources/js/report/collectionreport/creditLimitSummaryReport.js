var CHARGE_TYPE	= 1,BOOKING_COMMISSION=3,IN_TOPAY=1,OUT_TOPAY=2;

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

			$("#mainContent").load("/ivcargo/html/report/collectionreport/creditLimitSummaryReport.html", function() {
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
			
			$('#creditLimitSummaryReportTable tbody').empty();
			$('#printCreditLimitSummaryReport').empty();
			
			printHeaderModel	= response.PrintHeaderModel;

			//--------------Opening Balance------------
			var columnArray				= [];

			columnArray.push("<th class = 'creditlevel' style='text-align: center; vertical-align: middle; width:20%'>Opening Balance (ob)</th>");
			columnArray.push("<th style='text-align: left; vertical-align: middle;' colspan = '3'></th>");
			columnArray.push("<th class = 'balanceColumn creditlevel' style='text-align: center; vertical-align: middle; background-color: #f7dd0d96;'>"+ response.openingBalance +"</th>");

			_this.appendTR(columnArray, 'openingBalance');
			
			//--------------Collection------------
			
			columnArray	= [];
			
			columnArray.push("<td style='text-align: center; vertical-align: middle;; width:20%'></td>");
			columnArray.push("<td class = 'creditlevel' style='text-align: left; vertical-align: middle; width:20%'>Collection (a)</td>");
			columnArray.push("<td class = 'creditlevel' style='text-align: center; vertical-align: middle; background-color: #57db2796; width:20%'>" + response.collectionAmount + "</td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;' colspan = '2'></td>");
			
			_this.appendTR(columnArray, '');
			
			//--------------Cartage------------

			columnArray	= [];
			
			columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
			columnArray.push("<td class = 'creditlevel' style='text-align: left; vertical-align: middle;' colspan = '2'>Pickup/Drop Cartage (b)</td>");
			columnArray.push("<td class = 'creditlevel' style='text-align: center; vertical-align: middle; background-color: #ff6e4a;'>" + response.cartage + "</td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
			
			_this.appendTR(columnArray, '');
			
			//--------------Demurrage------------

			columnArray	= [];
			
			columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
			columnArray.push("<td class = 'creditlevel' style='text-align: left; vertical-align: middle;'>Demurrage (c)</td>");
			columnArray.push("<td class = 'creditlevel' style='text-align: center; vertical-align: middle; background-color: #57db2796;'>" + response.demurrage + "</td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;' colspan = '2'></td>");
			
			_this.appendTR(columnArray, '');
			
			//--------------Booking Commission------------

			columnArray	= [];
			
			columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
			columnArray.push("<td class = 'creditlevel' style='text-align: left; vertical-align: middle;' colspan = '2'>Booking Commission (d)</td>");
			columnArray.push("<td class = 'creditlevel' style='text-align: center; vertical-align: middle; background-color: #ff6e4a;'>" + response.bookingCommission + "</td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
			
			_this.appendTR(columnArray, '');
			
			//--------------Delivery Commission------------

			columnArray	= [];
			
			columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
			columnArray.push("<td class = 'creditlevel' style='text-align: left; vertical-align: middle;' id='' colspan = '2'>Delivery Commission (e)</td>");
			columnArray.push("<td class = 'creditlevel' style='text-align: center; vertical-align: middle; background-color: #ff6e4a;'>" + response.deliveryCommission + "</td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
			
			_this.appendTR(columnArray, '');
			
			//--------------Net Booking------------

			columnArray	= [];
			
			columnArray.push("<td class = 'creditlevel' style='text-align: center; vertical-align: middle;'><b>Net Booking - n1</b></td>");
			columnArray.push("<td class = 'creditlevel' style='text-align: left; vertical-align: middle;' colspan = '3'><b>(a - b + c - d - e)</b></td>");
			columnArray.push("<td class = 'balanceColumn creditlevel' style='text-align: center; vertical-align: middle; background-color: #f7dd0d96;'>" + response.netBooking + "</td>");
			
			_this.appendTR(columnArray, '');
			
			//--------------Incoming ToPay------------

			columnArray	= [];
			
			columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
			columnArray.push("<td class = 'creditlevel' style='text-align: left; vertical-align: middle;'>Incoming ToPay (f)</td>");
			columnArray.push("<td class = 'creditlevel' style='text-align: center; vertical-align: middle; background-color: #57db2796;'>" + response.inTopay + "</td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;' colspan = '2'></td>");
			
			_this.appendTR(columnArray, '');
			
			//--------------Outgoing ToPay------------

			columnArray	= [];
			
			columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
			columnArray.push("<td class = 'creditlevel' style='text-align: left; vertical-align: middle;' colspan = '2'>Outgoing ToPay (g)</td>");
			columnArray.push("<td class = 'creditlevel' style='text-align: center; vertical-align: middle; background-color: #ff6e4a;'>" + response.outTopay + "</td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
			
			_this.appendTR(columnArray, '');
			
			//--------------Net Receivable------------

			columnArray	= [];
			
			columnArray.push("<td class = 'creditlevel' style='text-align: center; vertical-align: middle;'><b>Net Receivable - n2</b></td>");
			columnArray.push("<td class = 'creditlevel' style='text-align: left; vertical-align: middle;' colspan = '3'><b>(f - g)</b></td>");
			columnArray.push("<td class = 'balanceColumn creditlevel' style='text-align: center; vertical-align: middle; background-color: #f7dd0d96;'>" + response.netReceivable2 + "</td>");
			
			_this.appendTR(columnArray, '');
			
			//--------------Debit Note------------

			columnArray	= [];
			
			columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
			columnArray.push("<td class = 'creditlevel' style='text-align: left; vertical-align: middle;'>Debit Note (h)</td>");
			columnArray.push("<td class = 'creditlevel' style='text-align: center; vertical-align: middle; background-color: #57db2796;'>" + response.debitNoteAmount + "</td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;' colspan = '2'></td>");
			
			_this.appendTR(columnArray, '');
			
			//--------------Balance Out------------
			
			columnArray	= [];
			
			columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
			columnArray.push("<td class = 'creditlevel' style='text-align: left; vertical-align: middle;'>Balance Out (h1)</td>");
			columnArray.push("<td class = 'creditlevel' style='text-align: center; vertical-align: middle; background-color: #57db2796;'>" + response.balanceOutAmount + "</td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;' colspan = '2'></td>");
			
			_this.appendTR(columnArray, '');
			
			//--------------Credit Note------------

			columnArray	= [];
			
			columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
			columnArray.push("<td class = 'creditlevel' style='text-align: left; vertical-align: middle;' colspan = '2'>Credit Note (i)</td>");
			columnArray.push("<td class = 'creditlevel' style='text-align: center; vertical-align: middle; background-color: #ff6e4a;'>" + response.creditNoteAmount + "</td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
			
			_this.appendTR(columnArray, '');
			
			//--------------Balance In------------

			columnArray	= [];
			
			columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
			columnArray.push("<td class = 'creditlevel' style='text-align: left; vertical-align: middle;' colspan = '2'>Balance In (i1)</td>");
			columnArray.push("<td class = 'creditlevel' style='text-align: center; vertical-align: middle; background-color: #ff6e4a;'>" + response.balanceInAmount + "</td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
			
			_this.appendTR(columnArray, '');

			columnArray	= [];
			
			columnArray.push("<td class = 'creditlevel' style='text-align: center; vertical-align: middle;'><b>Net Receivable - n3</b></td>");
			columnArray.push("<td class = 'creditlevel' style='text-align: left; vertical-align: middle;' colspan = '3'><b>(h + h1 - i - i1)</b></td>");
			columnArray.push("<td class = 'balanceColumn creditlevel' style='text-align: center; vertical-align: middle; background-color: #f7dd0d96;'>" + response.netReceivable3 + "</td>");
			
			_this.appendTR(columnArray, '');

			columnArray	= [];
			
			columnArray.push("<td class = 'creditlevel' style='text-align: center; vertical-align: middle;'><b>Total Receivable - n4</b></td>");
			columnArray.push("<td class = 'creditlevel' style='text-align: left; vertical-align: middle;' colspan = '3'><b>(ob + n1 + n2 + n3)</b></td>");
			columnArray.push("<td class = 'creditlevel' style='text-align: center; vertical-align: middle; background-color: #4169e1;'>" + response.totalReceivable + "</td>");
			
			_this.appendTR(columnArray, '');

			columnArray	= [];
			
			columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
			columnArray.push("<td class = 'creditlevel' style='text-align: left; vertical-align: middle;' colspan = '2'>Payment received - j</td>");
			columnArray.push("<td class = 'creditlevel' style='text-align: center; vertical-align: middle; background-color: #ff6e4a;'>" + response.prepaidPaymentReceived + "</td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
			
			_this.appendTR(columnArray, '');

			columnArray	= [];
			
			let n5 = response.finalAmount;
			
			columnArray.push("<td class = 'creditlevel' style='text-align: center; vertical-align: middle;'><b>Final Amount - n5</b></td>");
			columnArray.push("<td class = 'creditlevel' style='text-align: left; vertical-align: middle;' colspan = '3'><b>(n4 - j)</b></td>");
			columnArray.push("<td class = 'creditlevel' style='text-align: center; vertical-align: middle; background-color: #4169e1;'>" + n5 + "</td>");
			
			_this.appendTR(columnArray, '');

			columnArray	= [];
			
			columnArray.push("<td style='text-align: center; vertical-align: middle;' colspan = '5'></td>");
			
			_this.appendTR(columnArray, '');

			columnArray	= [];
			
			let k = response.onAccountAmount;
			
			columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
			columnArray.push("<td class = 'creditlevel' style='text-align: left; vertical-align: middle;' colspan = '2'>On Account Collection (k)</td>");
			columnArray.push("<td class = 'creditlevel' style='text-align: center; vertical-align: middle; background-color: #ff6e4a;'>" + k + "</td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
			
			_this.appendTR(columnArray, '');
			
			columnArray	= [];
			
			let l = response.penaltyAmount;
			
			columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
			columnArray.push("<td class = 'creditlevel' style='text-align: left; vertical-align: middle;'>Failed Txn Penalty (l)</td>");
			columnArray.push("<td class = 'creditlevel' style='text-align: center; vertical-align: middle; background-color: #57db2796;'>" + l + "</td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;' colspan = '2'></td>");
			
			_this.appendTR(columnArray, '');

			columnArray	= [];
			
			let m = 0;
			
			if(response.showLrCancelPenaltyAmount) {
				m = response.lrCancelPenaltyAmount;
				columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
				columnArray.push("<td class = 'creditlevel' style='text-align: left; vertical-align: middle;'>LR Cancel Penalty Amount (m)</td>");
				columnArray.push("<td class = 'creditlevel' style='text-align: center; vertical-align: middle; background-color: #57db2796;'>" + m + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;' colspan = '2'></td>");
				
				_this.appendTR(columnArray, '');
	
				columnArray	= [];
			}
			
			columnArray.push("<th style='text-align: center; vertical-align: middle;'>Closing Balance (cb)</th>");
			
			if(response.showLrCancelPenaltyAmount)
				columnArray.push("<th style='text-align: left; vertical-align: middle;' colspan = '3'>(n5 - k + l + m)</th>");
			else
				columnArray.push("<th style='text-align: left; vertical-align: middle;' colspan = '3'>(n5 - k + l)</th>");
			
			columnArray.push("<th class = 'balanceColumn' style='text-align: center; vertical-align: middle; background-color: #f7dd0d96;'>"+ response.closingBalance +"</th>");

			_this.appendTR(columnArray, 'closingBalance');
			
			columnArray	= [];
			
			$('#branchLimit').html('<h4><b>Branch Limit : </b>' + response.branchLimit + '</h4>');
			
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
			}
			
			if($("#dateEle").attr('data-enddate') != undefined) {
				data.toDate = $("#dateEle").attr('data-enddate'); 
				$('#selectedToDate').html($("#dateEle").attr('data-enddate'));
			}
			
			printTable(data, 'reportData', 'creditLimitSummaryReport', 'Credit Limit Summary Report', 'printCreditLimitSummaryReport');

			$(".balanceColumn").css("background-color", "#f7dd0d96");
			$(".creditlevel").css("font-size", "16px");
			$(".table-height").css("font-size", "20px");
			$(".openingBalance").css("background", "lightgray");
			$(".closingBalance").css("background", "lightgray");
			$("#creditLimitSummaryReportTable tbody tr td").attr('width', "20%");

			$('#middle-border-boxshadow').removeClass('hide');

			hideLayer();
		}, appendTR : function(columnArray, className) {
			$('#creditLimitSummaryReportTable tbody').append('<tr class="' + className + '">' + columnArray.join(' ') + '</tr>');
		}, round : function(num) {
			var m = Number((Math.abs(num) * 100).toPrecision(15));
    		return Math.round(m) / 100 * Math.sign(num);
		}
	});
});