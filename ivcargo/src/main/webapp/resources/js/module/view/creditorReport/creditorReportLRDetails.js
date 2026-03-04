
define([  'JsonUtility'
	,'messageUtility'
	,'/ivcargo/resources/js/generic/urlparameter.js'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/creditorReport/creditorReportFilePath.js'
	,PROJECT_IVUIRESOURCES + '/resources/js/common/printReport.js'
	,'jquerylingua'
	,'language'
	,'autocomplete'
	,'autocompleteWrapper'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	],function(JsonUtility, MessageUtility, UrlParameter, FilePath, PrintTable, Lingua, Language, AutoComplete, AutoCompleteWrapper,
			 NodValidation, BootstrapModal,ElementFocusNavigation,Selection) {
	'use strict';
	var jsonObject = new Object(), 
	corporateAccountId,
	_this = '', 
	fromDate, 
	filter, 
	toDate;
	
	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this 				= this;
			corporateAccountId 	= UrlParameter.getModuleNameFromParam('corporateAccountId');
			fromDate			= UrlParameter.getModuleNameFromParam('fromDate');
			toDate 				= UrlParameter.getModuleNameFromParam('toDate');
			filter 				= UrlParameter.getModuleNameFromParam('filter');
			
		},render : function() {
			jsonObject	= new Object();
			
			jsonObject.corporateAccountId	= corporateAccountId;
			jsonObject.fromDate				= fromDate;
			jsonObject.toDate				= toDate;
			jsonObject.filter				= filter;
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL + '/CreditorReportWS/getCreditorReportDetails.do?', _this.setReportData, EXECUTE_WITHOUT_ERROR);
	
		},setReportData : function(response){

			console.log("response : " ,response);
			
			var loadelement = new Array();
			var baseHtml 	= new $.Deferred();

			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/creditorReport/CreditorReportLRDetails.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				if(response.message != undefined) {
					hideLayer();
					$('#middle-border-boxshadow').addClass('hide');
					
					var errorMessage = response.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
					return;
				}
				
				var fromDate			= response.fromDate;
				var toDate				= response.toDate;
				var CreditorReport		= response.CreditorReport;
				var charges			 	= response.charges;
				var branch 				= response.branch;
				var accountGroup 		= response.accountGroup;
				var finalArticles		= 0;
				var finalLR				= 0;
				var finalTotal			= 0;
				
				$("#printCreditorLRDetails").empty();
				$("#selectedParty").html("Party : ");
				$("#selectedFromDate").html("From Date : ");
				$("#selectedToDate").html("To Date : ");
				$("#selectedPartyValue").html(CreditorReport[0].partyName);
				$("#selectedFromDateValue").html(fromDate);
				$("#selectedToDateValue").html(toDate);
				
				$('#reportDetailsTable1 thead').empty();
				$('#reportDetailsTable1 tbody').empty();
				$('#reportDetailsTable1 tfoot').empty();
				
				var tr	= $("<tr class='danger' style='position: sticky;top: 0px;'></tr>");

				tr.append("<td class='text-center'><b>Sr. No</b></td>");
				tr.append("<td class='text-center'><b>LR No.</b></td>");
				tr.append("<td class='text-center'><b>No of Art</b></td>");
				tr.append("<td class='text-center'><b>From</b></td>");
				tr.append("<td class='text-center'><b>To</b></td>");
				tr.append("<td class='text-center'><b>Bkg Date</b></td>");
				tr.append("<td class='text-center'><b>Billing Date</b></td>");
				tr.append("<td class='text-center'><b>Bill No.</b></td>");
				for(var key in charges){
					if(charges.hasOwnProperty(key)){
						var chargeName	= charges[key];
						tr.append("<td class='text-center'><b>"+chargeName+"</b></td>");
					}
				}
				tr.append("<td class='text-center'><b>Grand Total</b></td>");
				tr.append("<td class='text-center'><b>LR Status</b></td>");
				$('#reportDetailsTable1').append(tr);
				var myMap = new Map();
				var srNo = 0;
				for(var i=0; i<CreditorReport.length; i++){
					var obj 		= CreditorReport[i];
					var tr2			= $("<tr></tr>");
					var chargeHM	= obj.wayBillChargeHM;
					srNo			= srNo + 1;
					tr2.append("<td class='text-center'>"+(srNo)+"</td>");
					tr2.append("<td style='background-color: lightblue;' class='text-center'>"+(obj.wayBillNumber)+"</td>");
					tr2.append("<td class='text-right'>"+(obj.totalQuantity)+"</td>");
					tr2.append("<td class='text-center'>"+(obj.wayBillSourceBranch)+"</td>");
					tr2.append("<td class='text-center'>"+(obj.wayBillDestinationBranch)+"</td>");
					tr2.append("<td class='text-center'>"+(obj.bookedDateStr)+"</td>");
					tr2.append("<td class='text-center'>"+(obj.billDateStr)+"</td>");
					tr2.append("<td class='text-center'>"+(obj.billNumber)+"</td>");
					
					for(var key in charges){
						if(chargeHM.hasOwnProperty(key)){
							var chargeAmount	= chargeHM[key];
							tr2.append("<td class='text-right' >"+chargeAmount+"</td>");
						} else {
							tr2.append("<td class='text-right' >"+0+"</td>");
						}
						if(myMap.has(key)){
							var amount = myMap.get(key);
							if(chargeHM.hasOwnProperty(key)){
								
								myMap.set(key,(chargeAmount + amount));
							} else {
								myMap.set(key,(0 + amount));
							}
							
						} else {
							if(chargeHM.hasOwnProperty(key)){
								myMap.set(key,chargeAmount);
							} else {
								myMap.set(key,0);
							}
						}
					}
					
					tr2.append("<td class='text-right'>"+(obj.grandTotal)+"</td>");
					tr2.append("<td style='background-color: lightpink;' class='text-center'>"+(obj.wayBillStatus)+"</td>");
					
					finalArticles 	= obj.totalQuantity + finalArticles;
					finalTotal		= obj.grandTotal + finalTotal;
					$('#reportDetailsTable1').append(tr2);
				}
				
				
				var tr3	= $("<tr></tr>");

				tr3.append("<td class='text-center'><b>"+(srNo)+"</b></td>");
				tr3.append("<td><b>&nbsp;</b></td>");
				tr3.append("<td class='text-right'><b>"+(finalArticles)+"</b></td>");
				tr3.append("<td><b>&nbsp;</b></td>");
				tr3.append("<td><b>&nbsp;</b></td>");
				tr3.append("<td><b>&nbsp;</b></td>");
				tr3.append("<td><b>&nbsp;</b></td>");
				tr3.append("<td><b>&nbsp;</b></td>");
				for(var key in charges){
					if(myMap.has(key)){
						var chargeSum	= myMap.get(key);
						tr3.append("<td class='text-right' ><b>"+chargeSum+"</b></td>");
					} else {
						tr3.append("<td class='text-right' >"+0+"</td>");
					}
				}
				tr3.append("<td class='text-right'><b>"+finalTotal+"</b></td>");
				tr3.append("<td><b>&nbsp;</b></td>");
				$('#reportDetailsTable1').append(tr3);
				
				$('#middle-border-boxshadow').removeClass('hide');
				hideLayer();
				var data = new Object();
				data.accountGroupNameForPrint	= accountGroup.accountGroupDescription;
				data.branchAddress				= branch.branchAddress;
				data.branchPhoneNumber			= branch.branchContactDetailPhoneNumber;
				data.isLaserPrintAllow			= 'true';
				data.isPlainPrintAllow			= 'true';
				data.isExcelButtonDisplay		= 'true';
				data.isPdfButtonDisplay			= 'true';
				printTable(data, 'reportData', 'creditorLRDetails', 'Creditor Report', 'printCreditorLRDetails');
				
				hideLayer();
				
				
			});
			
		}
	});
});