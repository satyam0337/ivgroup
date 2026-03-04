define([  
		PROJECT_IVUIRESOURCES +'/resources/js/populateautocomplete/selectoption.js'
		  ,'JsonUtility'
          ,'messageUtility'
          ,'nodvalidation'
          ,'focusnavigation'//import in require.config
          ],function(Selection) {
	'use strict';
	let jsonObject = new Object(), myNod, _this = '';
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/tcePendingOrderStatusReportWS/getPendingStatusReportElement.do?', _this.setPendingStatusReportElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setPendingStatusReportElements : function(response) {
			let loadelement 			= new Array();
			let baseHtml 				= new $.Deferred();
			loadelement.push(baseHtml);
		
			$("#mainContent").load("/ivcargo/html/report/trancereport/pendingOrderStatusReport.html",function() {
				baseHtml.resolve();
			});
		
			$.when.apply($, loadelement).done(function() {
				$("*[data-selector=header]").html(response.reportName);
				
				let elementConfiguration	= new Object();

				elementConfiguration.branchElement		= $('#branchEle');

				response.agentBranchSelection	= true;
				response.elementConfiguration	= elementConfiguration;

				Selection.setSelectionToGetData(response);
				
				response.branch	= true;
				
				myNod = Selection.setNodElementForValidation(response);
			
				$("#searchBtn").click(function() {
					myNod.performCheck();

					if(myNod.areAll('valid'))
						_this.onSubmit();
				});
			});
		}, onSubmit: function() {
			showLayer();
			let jsonObject = new Object();

			jsonObject["sourceBranchId"] = $('#branchEle').val();

			getJSON(jsonObject, WEB_SERVICE_URL + '/tcePendingOrderStatusReportWS/getPendingStatusReportData.do', _this.setReportData, EXECUTE_WITH_NEW_ERROR);
		}, setReportData: function(response) {
			hideLayer();
			$('#pendingOrderDetails').empty();
			$('#printPendingStatusReport').empty();
			
			if (response.message != undefined) {
				$("#bottom-border-boxshadow").addClass('hide');
				$('#FilterRow').hide();
				return;
			}

			let pendingOrders = response.pendingOrdersList;
			
			$("#bottom-border-boxshadow").removeClass('hide');
			$("#FilterRow").show();
			
			columnArray = [];
			
			for (var i = 0; i < pendingOrders.length; i++) {
				var obj = pendingOrders[i];

				var columnArray = new Array();

				var dotColorClass = '';
				
				if (obj.orderStatus === 1)
					dotColorClass = 'backgroundColorGreen';
				else if (obj.orderStatus === 3)
					dotColorClass = 'backgroundColorYellow';
				else if (obj.orderStatus === 2)
					dotColorClass = 'backgroundColorRed';

				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.communityOrderReference + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.orderCreationTimeStr + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;align-items: center;'>" +
					"<div class='dot " + dotColorClass + "' style='margin-left: 5px;'><span style='margin-left: 25px;'>" + obj.orderTypeStr + "</span></div>" +
					"</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.bookingBranchName + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.sourceName + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.destinationName + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.crossingBranchName + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.operatorDestinationName + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.expectedArriavalTimestampStr + "</td>");

				columnArray.push("</td>");

				$('#pendingOrderDetails').append('<tr>' + columnArray.join(' ') + '</tr>');
			}
			
			$('#sourceBranchName').html(response.sourceBranchName);
			
			let printHeaderModel	= response.PrintHeaderModel;
			
			let data = new Object();
			data.accountGroupNameForPrint	= printHeaderModel.accountGroupName;
			data.branchAddress				= printHeaderModel.branchAddress;
			data.branchPhoneNumber			= printHeaderModel.branchContactDetailMobileNumber;
			data.isLaserPrintAllow				= 'true';
			data.isPlainPrintAllow				= 'true';
			data.isExcelButtonDisplay			= 'true';
			
			printTable(data, 'reportData', 'pendingStatusReport', 'Pending Status Report', 'printPendingStatusReport');

			hideLayer();
		}
	});
});