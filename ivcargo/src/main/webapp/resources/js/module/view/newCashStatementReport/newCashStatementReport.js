var IDENTIFIER_FOR_LR 	= 1;
var IDENTIFIER_FOR_CR 	= 2;
var IDENTIFIER_FOR_DELIVERY_BRANCH_COMMISSION 	= 24;
var IDENTIFIER_FOR_SHORT_CREDIT_BOOKING_TIME 	= 5;
var IDENTIFIER_FOR_SHORT_CREDIT_DELIVERY_TIME 	= 6;
var	showFromAndToDateInReportData				= false;
define([
	'JsonUtility'
    ,'messageUtility'
    ,PROJECT_IVUIRESOURCES + '/resources/js/module/view/newCashStatementReport/newCashStatementReportfilepath.js'
    ,'jquerylingua'
    ,'language'
    ,'nodvalidation'
	,'focusnavigation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js'
	],function(JsonUtility, MessageUtility, FilePath, Lingua, Language,NodValidation, FocusNavigation,
			 BootstrapModal, Selection){
	'use strict';
	var jsonObject = new Object(), myNod, masterLangObj, masterLangKeySet, gridObject,  _this;
	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/newCashStatementReportWS/getNewCashStatementReportElement.do?',	_this.setCashStatementReportsElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		},setCashStatementReportsElements : function(response){
			
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			var executive	= response.executive;
			
			showFromAndToDateInReportData = response.configuration.showFromAndToDateInReportData;
			
			loadelement.push(baseHtml);
			$("#mainContent").load( "/ivcargo/html/report/newCashStatementReport/newCashStatementReport.html" , function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function(){
				initialiseFocus();
				
				var keyObject = Object.keys(response);
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]].show == true) {
						$("*[data-attribute="+ keyObject[i]+ "]").addClass("show");
					}
				}
				
				var elementConfiguration	= new Object();
				
				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
				
				response.elementConfiguration	= elementConfiguration;
				response.sourceAreaSelection	= true;
				response.isCalenderSelection	= true;
				response.isPhysicalBranchesShow	= true;
				response.AllOptionsForRegion	= false;
				response.AllOptionsForSubRegion	= false;
				response.AllOptionsForBranch	= false;
				
				Selection.setSelectionToGetData(response);
				
				masterLangObj 		= FilePath.loadLanguage();
				masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				if (executive.executiveType == EXECUTIVE_TYPE_GROUPADMIN) {
					myNod.add({
						selector: '#regionEle',
						validate: 'validateAutocomplete:#regionEle_primary_key',
						errorMessage: 'Select proper Region !'
					});

					myNod.add({
						selector: '#subRegionEle',
						validate: 'validateAutocomplete:#subRegionEle_primary_key',
						errorMessage: 'Select proper Area !'
					});

					myNod.add({
						selector: '#branchEle',
						validate: 'validateAutocomplete:#branchEle_primary_key',
						errorMessage: 'Select proper Branch !'
					});
				}
				
				hideLayer();
				
				$("#saveBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid')) {
						_this.onSubmit(_this);								
					}
				});
				
			})
		},onSubmit : function(){
			showLayer();
			var jsonObject = new Object();
			if($("#dateEle").attr('data-startdate') != undefined){
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
			}
			if($("#dateEle").attr('data-enddate') != undefined){
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
			}
			jsonObject["regionId"] 			= $('#regionEle_primary_key').val();
			jsonObject["subRegionId"] 		= $('#subRegionEle_primary_key').val();
			jsonObject["sourceBranchId"] 	= $('#branchEle_primary_key').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/newCashStatementReportWS/getNewCashStatementReportData.do', _this.setReportData, EXECUTE_WITH_ERROR);
		} ,setReportData : function(response){
			
			if(response.message != undefined) {
				hideLayer();
				$('#middle-border-boxshadow').hide();
				
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}
			$('#reportDetailsTable').empty();
			$("#printCashStatementReport").empty();
			
			var finalModuleList			= response.finalModuleList;
			var branch 					= response.branch;
			var accountGroup 			= response.accountGroup;
			var	srNo					= 0;
			var fromDate				= $("#dateEle").attr('data-startdate');
			var toDate					= $("#dateEle").attr('data-enddate'); 
			var regionId				= $('#regionEle_primary_key').val();
			var subRegionId				= $('#subRegionEle_primary_key').val();
			var branchId				= $('#branchEle_primary_key').val();
			var columnHeadArray			= new Array();
			var columnArray				= new Array();
				
			if(showFromAndToDateInReportData){
				$("#showDate").html(fromDate + " to " + toDate);
			}else{
				$("#dateDiv").hide();
			}
				
							
			if(finalModuleList != null){
				
				columnHeadArray.push("<th style='text-align: center; vertical-align: middle;background-color: aliceblue;'>Sr. No.</th>");
				columnHeadArray.push("<th style='text-align: center; vertical-align: middle;background-color: aliceblue;'>A/C Name</th>");
				columnHeadArray.push("<th style='text-align: center; vertical-align: middle;background-color: aliceblue;'>A/C No.</th>");
				columnHeadArray.push("<th style='text-align: center; vertical-align: middle;background-color: aliceblue;'>No. With Type</th>");
				columnHeadArray.push("<th style='text-align: center; vertical-align: middle;background-color: aliceblue;'>LR</th>");
				columnHeadArray.push("<th style='text-align: center; vertical-align: middle;background-color: aliceblue;'>Payment Type</th>");
				columnHeadArray.push("<th style='text-align: center; vertical-align: middle;background-color: aliceblue;'>Cheque</th>");
				columnHeadArray.push("<th style='text-align: center; vertical-align: middle;background-color: aliceblue;'>Bank Name</th>");
				columnHeadArray.push("<th style='text-align: center; vertical-align: middle;background-color: aliceblue;'>Debit</th>");
				columnHeadArray.push("<th style='text-align: center; vertical-align: middle;background-color: aliceblue;'>Credit</th>");
				
				$('#reportDetailsTable').append('<thead><tr id=""  class="text-danger text-center first">' + columnHeadArray.join(' ') + '</tr></thead>');
				
				for(var i = 0;i < finalModuleList.length;i++){
					srNo++;
					
					columnArray.push("<td style='text-align: center;'>" + srNo + "</td>");
											console.log("finalModuleList[i]"+finalModuleList[i]);

					if(finalModuleList[i].accountName != undefined){
						console.log("finalModuleList[i].identifier "+finalModuleList[i].identifier);
						if(finalModuleList[i].identifier == IDENTIFIER_FOR_LR && finalModuleList[i].accountName != "Account Entry"){
							columnArray.push("<td style='text-align: left;'><a style='color : blue; cursor : pointer;' href='Reports.do?pageId=50&eventId=2&SetAutoData=true&fromDate="+finalModuleList[i].txnDateTimeString+"&toDate="+finalModuleList[i].txnDateTimeString+"&region="+regionId+"&subRegion="+subRegionId+"&branch="+branchId+"' target='_blank'>" +finalModuleList[i].accountName+ "</a></td>");
						} else if(finalModuleList[i].identifier == IDENTIFIER_FOR_CR && finalModuleList[i].accountName != "Cancel Account Entry"){
							columnArray.push("<td style='text-align: left;'><a style='color : blue; cursor : pointer;' href='Reports.do?pageId=50&eventId=40&SetAutoData=true&fromDate="+finalModuleList[i].txnDateTimeString+"&toDate="+finalModuleList[i].txnDateTimeString+"&region="+regionId+"&subRegion="+subRegionId+"&branch="+branchId+"&deliveryPaymentType="+1+"&executiveId="+-1+"&lrType="+0+"' target='_blank'>" +finalModuleList[i].accountName+ "</a></td>");
						} else if(finalModuleList[i].identifier == IDENTIFIER_FOR_SHORT_CREDIT_BOOKING_TIME || finalModuleList[i].identifier == IDENTIFIER_FOR_SHORT_CREDIT_DELIVERY_TIME){
							columnArray.push("<td style='text-align: left;'><a style='color : blue; cursor : pointer;' href='Reports.do?pageId=340&eventId=3&modulename=shortCreditPaymentRegister&isFromCashStatement=true&fromDate="+finalModuleList[i].txnDateTimeString+"&toDate="+finalModuleList[i].txnDateTimeString+"&regionId="+regionId+"&subRegionId="+subRegionId+"&sourceBranchId="+branchId+"&selectionType="+1+"' target='_blank'>" +finalModuleList[i].accountName+ "</a></td>");
						} else {
							columnArray.push("<td style='text-align: left;'>" + finalModuleList[i].accountName + "</td>");
						}
					} else {
						columnArray.push("<td style='text-align: left;'>&nbsp;</td>");
					}
					
					if(finalModuleList[i].bankAccountNo != undefined)
						columnArray.push("<td style='text-align: left;'> <span style='color : blue; cursor : pointer;' onclick ='getBankAccountData(this)' id = '" + finalModuleList[i].bankAccountId + "_"+finalModuleList[i].identifier+"'>" + finalModuleList[i].bankAccountNo + "</span></td>");
					else
						columnArray.push("<td style='text-align: left;'>&nbsp;</td>");
					
					if(finalModuleList[i].numberWithType != undefined)
						columnArray.push("<td style='text-align: center;'>" + finalModuleList[i].numberWithType + "</td>");
					else
						columnArray.push("<td style='text-align: left;'>&nbsp;</td>");
					
					if(finalModuleList[i].wayBillNumber != undefined)
						columnArray.push("<td style='text-align: center;'>" + finalModuleList[i].wayBillNumber + "</td>");
					else
						columnArray.push("<td style='text-align: left;'>&nbsp;</td>");
					
					if(finalModuleList[i].paymentType != undefined)
						columnArray.push("<td style='text-align: center;'>" + finalModuleList[i].paymentType + "</td>");
					else
						columnArray.push("<td style='text-align: left;'>&nbsp;</td>");
					
					if(finalModuleList[i].chequeNumber != undefined)
						columnArray.push("<td style='text-align: center;'>" + finalModuleList[i].chequeNumber + "</td>");
					else
						columnArray.push("<td style='text-align: left;'>&nbsp;</td>");
					
					if(finalModuleList[i].bankName != undefined)
						columnArray.push("<td style='text-align: center;'>" + finalModuleList[i].bankName + "</td>");
					else
						columnArray.push("<td style='text-align: left;'>&nbsp;</td>");
					
					columnArray.push("<td style='text-align: right;'>" + Math.round(Math.abs(finalModuleList[i].debitAmount)) + "</td>");
					columnArray.push("<td style='text-align: right;'>" + Math.round(Math.abs(finalModuleList[i].creditAmount)) + "</td>");
					
					$('#reportDetailsTable').append('<tr>' + columnArray.join(' ') + '</tr>');
					columnArray = [];
				}
			}
			
			$('#middle-border-boxshadow').show();
			hideLayer();
			
			var data = new Object();
			data.accountGroupNameForPrint	= accountGroup.accountGroupDescription;
			data.branchAddress				= branch.branchAddress;
			data.branchPhoneNumber			= branch.branchContactDetailPhoneNumber;
			data.isLaserPrintAllow			= 'true';
			data.isPlainPrintAllow			= 'true';
			data.isExcelButtonDisplay		= 'true';
			data.isPdfButtonDisplay			= 'false';
			data.showFromAndToDateInReportData			= showFromAndToDateInReportData;
			if($("#dateEle").attr('data-startdate') != undefined){
				data.fromDate = $("#dateEle").attr('data-startdate'); 
			}
			if($("#dateEle").attr('data-enddate') != undefined){
				data.toDate = $("#dateEle").attr('data-enddate'); 
			}
			
			printTable(data, 'reportData', 'cashStatementReport', 'Cash Statement Report', 'printCashStatementReport');
		}
	})
})

function getBankAccountData(obj){
	showLayer();
	var jsonObject = new Object();
	if($("#dateEle").attr('data-startdate') != undefined){
		jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
	}

	if($("#dateEle").attr('data-enddate') != undefined){
		jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
	}
	
	jsonObject["sourceBranchId"] 	= $('#branchEle_primary_key').val();
	jsonObject["regionId"] 			= $('#regionEle_primary_key').val();
	jsonObject["subRegionId"] 		= $('#subRegionEle_primary_key').val();
	jsonObject["bankAccountId"] 	= (obj.id).split('_')[0]; 
	jsonObject["identifier"] 		= (obj.id).split('_')[1]; 
	
	require([PROJECT_IVUIRESOURCES + '/resources/js/module/view/newCashStatementReport/newCashStatementReportbankAccDetails.js'], function(bankAccDetails){
		var btModal = new Backbone.BootstrapModal({
			content		: new bankAccDetails(jsonObject),
			modalWidth 	: 80,
			okText		: 'Close',
			showFooter 	: true,
			title		: '<center>Bank Account Details</center>'

		}).open();
	});
}