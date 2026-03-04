define([  
        PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
		,'JsonUtility'
        ,'messageUtility'
        ,'nodvalidation'
        ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
        ,'focusnavigation'//import in require.config
      ], function(Selection) {
	'use strict';
	let jsonObject = new Object(), myNod, _this = '', PrintHeaderModel;
	
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/sourceDestinationBookingSummaryReportWS/getSourceDestinationBookingSummaryReportElement.do?',	_this.setBookingRegisterReportsElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setBookingRegisterReportsElements : function(response) {
			let loadelement 			= new Array();
			let baseHtml 				= new $.Deferred();
			loadelement.push(baseHtml);
		
			$("#mainContent").load("/ivcargo/html/report/collectionreport/sourceDestinationBookingSummaryReport/sourceDestinationBookingSummaryReport.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				let keyObject = Object.keys(response);
				
				for (const element of keyObject) {
					if (response[element])
						$("*[data-attribute="+ element+ "]").removeClass("hide");
				}
				
				let elementConfiguration				= new Object();
				elementConfiguration.dateElement			= $('#dateEle');
				elementConfiguration.regionElement			= $('#regionEle');
				elementConfiguration.subregionElement		= $('#subRegionEle');
				elementConfiguration.branchElement			= $('#branchEle');
				elementConfiguration.destSubregionElement 	= $('#destSubRegionEle');
				elementConfiguration.destBranchElement 		= $('#destBranchEle');
				elementConfiguration.lrTypeEle		 		= $('#lrTypeEle');

				response.elementConfiguration					= elementConfiguration;
				response.sourceAreaSelection					= true;
				response.destinationSubRegionBranchSelection	= true;
				response.AllOptionForDestinationBranch			= true;
				response.isCalenderSelection					= true;
				response.isLRTypeSelection						= response.lrType;
				response.lrType	= false;
				
				Selection.setSelectionToGetData(response);
				
				response.lrType = response.isLRTypeSelection;
				
				myNod = Selection.setNodElementForValidation(response);
				
				hideLayer();
				
				$("#saveBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit();								
				});
			});
		}, setReportData : function(response) {
			hideLayer();
			
			$('#dispatchtable thead').empty();
			$('#dispatchtable tbody').empty();
			$('#dispatchtable tfoot').empty();
			$('#sourceDestBkgSummWiseCollectionReport').empty();

			if(response.message != undefined) {
				$('#bottom-border-boxshadow').addClass('hide');
				return;
			}
			
			$('#bottom-border-boxshadow').removeClass('hide');
			
			PrintHeaderModel 	= response.PrintHeaderModel;
				
			$('#bottom-border-boxshadow').removeClass('hide');
				
			let destinationBranchHm					= response.destinationBranchHm;
			let srcDestBkgSummaryAmtDetailsHm		= response.srcDestBkgSummaryAmtDetailsHm;
			let srcBkgSummaryAmtDetailsHm			= response.srcBkgSummaryAmtDetailsHm;
			let destBkgSummaryAmtDetailsHm			= response.destBkgSummaryAmtDetailsHm;
			let reprtHeaderColumnArray		= new Array();
			let headerColumnArray		= new Array();
			let dataColumnArray			= new Array();
			let footerColumnarray		= new Array();
			let counter				= 0;
			let colspan				= 0;
			let fromDate 	= $("#dateEle").attr('data-startdate'); 
			let toDate 		= $("#dateEle").attr('data-enddate'); 
			let today 		= new Date();
			let time 		= today.getHours() + ":" + today.getMinutes();
			$('#bottom-border-boxshadow').removeClass('hide');
			
			
			headerColumnArray.push("<th class='textAlignCenter'>Sr No.</th>");
			headerColumnArray.push("<th class='textAlignCenter'>Source / Destination</th>");
			
			footerColumnarray.push("<td class='tfoot'></td>");
			footerColumnarray.push("<td class='tfoot textAlignCenter'>Total</td>");
			
			let destLength = Object.keys(destinationBranchHm).length;
			
			if(destLength > 8)
				$('#reportData').addClass('scrollit');
			else
				$('#reportData').removeClass('scrollit');
				
			for(let src in srcDestBkgSummaryAmtDetailsHm) {
				let srcBranchName		= src.split("_")[0];
				let srcBranchId			= src.split("_")[1];
				let srcRegionId			= src.split("_")[2];
				let srcSubRegionId		= src.split("_")[3];
				
				let	destWiseTotal	= srcDestBkgSummaryAmtDetailsHm[src];//destination wise HM
				
				dataColumnArray.push("<td class='textAlignCenter'>" + (++counter) + "</td>");
				dataColumnArray.push("<td class='textAlignCenter'>" + srcBranchName + "</td>");//Source branch name
					
				for(let destBranchSub in destinationBranchHm) {
					let destid			= destBranchSub.split("_")[0];
					let destSubRegionId	= destBranchSub.split("_")[1];
					
					colspan++;
					
					if(destWiseTotal.hasOwnProperty(destid))
						dataColumnArray.push("<td class = 'textAlignRight'> <a style = 'cursor: pointer;' onclick='getBookingSummaryDestinationWise(" + srcBranchId + "," + srcRegionId + "," + srcSubRegionId + "," + destid + "," + destSubRegionId + ");'>" + Math.round(destWiseTotal[destid]) + "</a></td>");
					else
						dataColumnArray.push("<td class = 'textAlignRight'>0</td>");
							
					if(counter == 1) {
						headerColumnArray.push("<th class='textAlignCenter'>" + destinationBranchHm[destBranchSub] + "</th>");
						footerColumnarray.push("<td class='tfoot textAlignRight'>" + Math.round(destBkgSummaryAmtDetailsHm[destid]) + "</td>");
					}
				}
					
				dataColumnArray.push("<td class='textAlignRight'>" + Math.round(srcBkgSummaryAmtDetailsHm[srcBranchId]) + "</td>");
				$('#dispatchtable tbody').append('<tr>' + dataColumnArray.join(' ') + '</tr>');
				dataColumnArray = [];
			}
			
			headerColumnArray.push("<th>Total</th>");
			
			reprtHeaderColumnArray.push("<th class='textAlignCenter'>"+ fromDate + "---" +toDate+"</th>");
			reprtHeaderColumnArray.push("<th colspan='"+(destLength + 1)+"' style='text-align: center;font-size:35 px;' >SOURCE DESTINATION REPORT</th>");
			reprtHeaderColumnArray.push("<th style='text-align: left;'>" +"Time :"+  time + "</th>");
			
			footerColumnarray.push("<td class='tfoot textAlignRight'>" + Math.round(response.grandTotal) + "</td>");
			
			$('#dispatchtable thead').append('<tr class="">' + reprtHeaderColumnArray.join(' ') + '</tr>');
			$('#dispatchtable thead').append('<tr class="">' + headerColumnArray.join(' ') + '</tr>');
			$('#dispatchtable tbody').append('<tr class="success">' + footerColumnarray.join(' ') + '</tr>');
			
			let data = new Object();
			data.accountGroupNameForPrint	= PrintHeaderModel.accountGroupName;
			data.branchAddress				= PrintHeaderModel.branchAddress;
			data.branchPhoneNumber			= PrintHeaderModel.branchPhoneNumber;
			data.isLaserPrintAllow			= 'true';
			data.isPlainPrintAllow			= 'true';
			data.isExcelButtonDisplay		= 'true';
			data.showFromAndToDateInReportData		= true;
			data.fromDate 					= $("#dateEle").attr('data-startdate'); 
			data.toDate						= $("#dateEle").attr('data-enddate');
			console.log('data11',data)
			printTable(data, 'reportData', 'sourceDestBkgSummWiseCollectionReport', 'Source Destination Booking Summary Report', 'sourceDestBkgSummWiseCollectionReport');
			
			hideLayer();
		}, onSubmit : function() {
			showLayer();
			let jsonObject = Selection.getElementData();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/sourceDestinationBookingSummaryReportWS/getSourceDestinationBookingSummaryReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}
	});
});

function getBookingSummaryDestinationWise(fromBranch, region, subRegion, toBranch, tosubRegion) {
	let fromDate 	= $("#dateEle").attr('data-startdate'); 
	let toDate 		= $("#dateEle").attr('data-enddate'); 
	let lrType		= $('#lrTypeEle_primary_key').val();
	
	window.open('BookingSummaryDestinationWiseReport.do?pageId=50&eventId=78&fromDate=' + fromDate + '&toDate=' + toDate + '&region=' + region + '&subRegion=' + subRegion + '&branch=' + fromBranch + '&tobranch=' + toBranch + '&tosubRegion=' + tosubRegion + '&type=2&reportType=1&lrType=' + lrType + '');
}
