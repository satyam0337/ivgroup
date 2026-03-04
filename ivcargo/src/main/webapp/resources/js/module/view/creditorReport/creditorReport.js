
define([  'JsonUtility'
	,'messageUtility'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/creditorReport/creditorReportFilePath.js'
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
	masterLangKeySet;
	
	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/CreditorReportWS/getCreditorReportConfiguration.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},getElementConfigDetails : function(response){

			console.log("response : " ,response);
			
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			var executive	= response.executive;

			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/creditorReport/CreditorReport.html",function() {
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
				
				var partyNameAutoComplete 					= new Object();
				partyNameAutoComplete.primary_key 			= 'corporateAccountId';
				partyNameAutoComplete.url 					= WEB_SERVICE_URL+'/autoCompleteWS/getPartyDetailsAutocomplete.do';
				partyNameAutoComplete.field 				= 'corporateAccountDisplayName';
				$("#partyNameEle").autocompleteCustom(partyNameAutoComplete);
				
				var elementConfiguration			= new Object();
				elementConfiguration.dateElement	= $('#dateEle');

				response.elementConfiguration		= elementConfiguration;
				response.isCalenderSelection		= true;

				Selection.setSelectionToGetData(response);

				masterLangObj 		= FilePath.loadLanguage();
				masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
				
				hideLayer();

				$('#viewAllEle').click(function(){
				    if($(this).is(':checked')){
				    	$('#partyNameDiv').addClass("hide");
				    	$("#partyNameEle").val('');
				    } else {
				    	$('#partyNameDiv').removeClass("hide");
				    }
				});
				$("#searchBtn").click(function() {
					
					if($('#partyNameEle').exists() && $('#partyNameEle').is(":visible")){
						if($('#partyNameEle').val() == "" || $('#partyNameEle').val() == undefined){
							showMessage('error', 'Please Select A Party !');
							$('#partyNameEle').focus();
							return;
						}
					}
					
					_this.onSubmit(_this);
				});
				
				
				
			});
		},setReportData : function(response) {
			console.log('response ',response)
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
			
			$("#printCreditorReport").empty();
			$("#selectedParty").html("Party : ");
			$("#selectedFromDate").html("From Date : ");
			$("#selectedToDate").html("To Date : ");
			if($("#partyNameEle").val() == ""){
				$("#selectedPartyValue").html("ALL");
			} else {
				$("#selectedPartyValue").html($("#partyNameEle").val());
			}
			$("#selectedFromDateValue").html(fromDate);
			$("#selectedToDateValue").html(toDate);
			
			$('#reportDetailsTable thead').empty();
			$('#reportDetailsTable tbody').empty();
			$('#reportDetailsTable tfoot').empty();
			
			var tr	= $("<tr class='danger' style='position: sticky;top: 0px;'></tr>");

			tr.append("<td class='text-center' ><b>Sr. No</b></td>");
			tr.append("<td class='text-center' ><b>Party Name</b></td>");
			tr.append("<td class='text-center' ><b>No of LR</b></td>");
			tr.append("<td class='text-center' ><b>No of Articles</b></td>");
			for(var key in charges){
				if(charges.hasOwnProperty(key)){
					var chargeName	= charges[key];
					tr.append("<td class='text-center' ><b>"+chargeName+"</b></td>");
				}
			}
			tr.append("<td class='text-center' ><b>Grand Total</b></td>");
			$('#reportDetailsTable').append(tr);
			
			var srNo = 0;
			var myMap = new Map();
			for(var i=0; i<CreditorReport.length; i++){
				var obj 		= CreditorReport[i];
				var tr2			= $("<tr></tr>");
				var chargeHM	= obj.wayBillChargeHM;
				srNo			= srNo + 1;
				
				tr2.append("<td class='text-center'>"+(srNo)+"</td>");
				tr2.append("<td style='background-color: lightblue;' class='text-center'>"+obj.partyName+"</td>");
				tr2.append("<td class='text-right'><a class='hyperLink' href='CreditorReportLRDetails.do?pageId=340&eventId=2&modulename=creditorReportLRDetails&filter=0&toDate="+toDate+"&fromDate="+fromDate+"&corporateAccountId="+obj.corporateAccountId+"' target='_blank'>"+obj.totalLR+"</a></td>");
				tr2.append("<td class='text-right'>"+obj.totalQuantity+"</td>");
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
				
				tr2.append("<td class='text-right' >"+obj.grandTotal+"</td>");
				
				finalLR 		= obj.totalLR + finalLR;
				finalArticles 	= obj.totalQuantity + finalArticles;
				finalTotal		= obj.grandTotal + finalTotal;
				$('#reportDetailsTable').append(tr2);
			}
			
			var tr3	= $("<tr></tr>");

			tr3.append("<td class='text-center' ><b>"+(srNo)+"</b></td>");
			tr3.append("<td><b>&nbsp;</b></td>");
			tr3.append("<td class='text-right' ><b>"+(finalLR)+"</b></td>");
			tr3.append("<td class='text-right' ><b>"+(finalArticles)+"</b></td>");
			for(var key in charges){
				if(myMap.has(key)){
					var chargeSum	= myMap.get(key);
					tr3.append("<td class='text-right' ><b>"+chargeSum+"</b></td>");
				} else {
					tr3.append("<td class='text-right' >"+0+"</td>");
				}
			}
			tr3.append("<td class='text-right' ><b>"+finalTotal+"</b></td>");
			$('#reportDetailsTable').append(tr3);
			
			
			$('#middle-border-boxshadow').removeClass('hide');
			
			var data = new Object();
			data.accountGroupNameForPrint	= accountGroup.accountGroupDescription;
			data.branchAddress				= branch.branchAddress;
			data.branchPhoneNumber			= branch.branchContactDetailPhoneNumber;
			data.isLaserPrintAllow			= 'true';
			data.isPlainPrintAllow			= 'true';
			data.isExcelButtonDisplay		= 'true';
			data.isPdfButtonDisplay			= 'true';
			printTable(data, 'reportData', 'creditorReport', 'Creditor Report', 'printCreditorReport');
			
			hideLayer();
			
		},onSubmit : function() {
			showLayer();
			var jsonObject = new Object();
			if($("#dateEle").attr('data-startdate') != undefined){
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
			}
			if($("#dateEle").attr('data-enddate') != undefined){
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
			}
			
			if($('#viewAllEle').prop('checked')){
				jsonObject["corporateAccountId"] 		= -1;
			} else {
				jsonObject["corporateAccountId"] 		= $('#partyNameEle_primary_key').val();
			}
			
			jsonObject["filter"] 						= 1;
				
			getJSON(jsonObject, WEB_SERVICE_URL+'/CreditorReportWS/getCreditorReportDetails.do?', _this.setReportData, EXECUTE_WITH_ERROR);
		}
	});
});

function setLRDetails(corporateAccountId){
	
	if($("#dateEle").attr('data-startdate') != undefined){
		var fromDate = $("#dateEle").attr('data-startdate'); 
	}
	if($("#dateEle").attr('data-enddate') != undefined){
		var toDate = $("#dateEle").attr('data-enddate'); 
	}
	
	window.open('CreditorReportLRDetails.do?pageId=340&eventId=2&modulename=creditorReportLRDetails&filter=0&corporateAccountId='+corporateAccountId+'&fromDate='+fromDate+'&toDate='+toDate,'newwindow', config='left=180,height=610,width=1055, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	
}