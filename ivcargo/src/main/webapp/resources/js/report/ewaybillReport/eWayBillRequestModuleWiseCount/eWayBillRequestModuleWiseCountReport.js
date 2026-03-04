define([  
		  PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
		 ,'JsonUtility'
		  ,'messageUtility'
		  ,'nodvalidation'
		  ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
		  ,'focusnavigation'//import in require.config
		  ,PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
		  ],function(Selection) {
	'use strict';
	let jsonObject = new Object(), myNod, _this = '', fromDate = null, toDate = null;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/ewayBillRequestModuleWiseCountReportWS/getEwaybillRequestCountReportElementConfiguration.do?',	_this.setBookingRegisterReportsElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setBookingRegisterReportsElements : function(response) {
			let loadelement				= new Array();
			let baseHtml				= new $.Deferred();
			loadelement.push(baseHtml);
		
			$("#mainContent").load("/ivcargo/html/report/ewaybillReport/eWayBillRequestModuleWiseCountReport/eWayBillRequestModuleWiseCountReport.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				let keyObject = Object.keys(response);

				for (let i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]])
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
				}

				let elementConfiguration				= new Object();
				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');

				response.elementConfiguration		= elementConfiguration;
				response.isCalenderSelection		= true;
				response.monthLimit					= 1;
				response.sourceAreaSelection		= true;
				response.isDisplayDeActiveBranch	= false;
				response.AllOptionsForSubRegion		= true;
				response.AllOptionsForBranch		= true;
				response.isPhysicalBranchesShow		= true;
				Selection.setSelectionToGetData(response);
				
				myNod = Selection.setNodElementForValidation(response);
				
				hideLayer();

				$("#saveBtn").click(function() {
					myNod.performCheck();

					if(myNod.areAll('valid'))
						_this.onSubmit(_this);								
				});
			});
		}, onSubmit : function() {
			showLayer();
			let jsonObject = Selection.getElementData();

			fromDate		= $("#dateEle").attr('data-startdate'); 
			toDate			= $("#dateEle").attr('data-enddate'); 
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/ewayBillRequestModuleWiseCountReportWS/getEwaybillRequestCountReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData : function(response) {
			hideLayer();
			
			$('#reportDetailsTable thead').empty();
			$('#reportDetailsTable tbody').empty();
			$('#reportDetailsTable tfoot').empty();
			$("#printEwaybillCountReport").empty();

			if(response.message != undefined) {
				$('#middle-border-boxshadow').addClass('hide');
				return;
			}
			
			let inc					   = 2;
			let grandTotalCount		   = 0;
			let branch					= response.branch;
			let accountGroup			= response.accountGroup;
				
			let	ewaybillreportList		= response.ewaybillreportList;
			let	moduleIdentifierHM		= response.moduleIdentifierHM;
			let	branchwiseRequestCount	= response.branchwiseRequestCount;

			let columnHeadSubArray			= new Array();
			let columnTotalArray			= new Array();
			let columnArray					= new Array();
				
			columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Sr No.</th>");
			columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Branch Name.</th>");
				
			for(let key in moduleIdentifierHM) {
				let value = moduleIdentifierHM[key];
				columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>" + value + "</th>");
				inc++;
			}
				
			columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Total</th>");
			$('#reportDetailsTable thead').append('<tr id="reportDetailsTableHeader" class="text-success text-center">' + columnHeadSubArray.join(' ') + '</tr>');

			for(let i = 0; i < ewaybillreportList.length; i++) {
				let totalCount	= 0;
				let obj = ewaybillreportList[i];
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i + 1) + "</td>");
				columnArray.push("<td style='text-align: left;'><a style='color : blue; cursor : pointer;' href='Dispatch.do?pageId=340&eventId=3&modulename=eWaybillRequestCountSummaryReport&toDate="+toDate+"&fromDate="+fromDate+"&branchName="+obj.branchName+"&branch="+obj.branchId+"' target='_blank'>" +obj.branchName+ "</a></td>");
				let requestCountObj = branchwiseRequestCount[obj.branchId];
						
				for(let key in moduleIdentifierHM) {
					let reqCount  = requestCountObj[key];
						
					if(reqCount == undefined || reqCount == null)
						reqCount = 0;
						
					grandTotalCount = grandTotalCount + reqCount;
					totalCount		= totalCount + reqCount;
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>" + reqCount + "</td>");
				}
						
				columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>" + totalCount + "</td>");
				$('#reportDetailsTable tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
				columnArray = [];
			}
					
			columnTotalArray.push("<td colspan=" + inc + " style='text-align: center; vertical-align: middle;'><b style='font-size: 20px; color: #1d7596'>Grand Total</td>");
			columnTotalArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 20px; color: #1d7596'>" + grandTotalCount + "</td>");
					
			$('#reportDetailsTable').append('<tr id="reportDetailsTableHeader" class="text-success text-center">' + columnTotalArray.join(' ') + '</tr>');
					
			$('#middle-border-boxshadow').removeClass('hide');
			$('#bottom-border-boxshadow').removeClass('hide');
				
			let data = new Object();
			data.accountGroupNameForPrint	= accountGroup.accountGroupDescription;
			data.branchAddress				= branch.branchAddress;
			data.branchPhoneNumber			= branch.branchContactDetailPhoneNumber;
			data.isLaserPrintAllow			= 'true';
			data.isPlainPrintAllow			= 'false';
			data.isExcelButtonDisplay		= 'true';
			data.isPdfButtonDisplay			= 'false';
				
			printTable(data, 'reportData', 'ewayBillRequestCount', 'Ewaybill Request Count Details', 'printEwaybillCountReport');
		}
	});
});