
define([  'JsonUtility'
	,'messageUtility'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/prepaidledgerstatementreport/prepaidledgerfilepath.js'
	,'jquerylingua'
	,'language'
	,'autocomplete'
	,'autocompleteWrapper'
	,'slickGridWrapper2'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	],function(JsonUtility, MessageUtility, FilePath, Lingua, Language, AutoComplete, AutoCompleteWrapper,
			slickGridWrapper2, NodValidation, BootstrapModal,ElementFocusNavigation,Selection) {
	'use strict';
	var jsonObject = new Object(), 
	myNod,  
	_this = '', 
	gridObject, 
	masterLangObj, prepaidLedgerList,
	masterLangKeySet;
	
	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/prepaidLedgerReportWS/getPrepaidLedgerReportElementConfiguration.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},getElementConfigDetails : function(response){

			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			var executive	= response.executive;

			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/prepaidledgerreport/PrepaidLedgerReport.html",function() {
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

				masterLangObj 		= FilePath.loadLanguage();
				masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
				
				
				var elementConfiguration	= new Object();
				
				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');

				response.elementConfiguration		= elementConfiguration;
				response.sourceAreaSelection		= true;
				response.isCalenderSelection		= true;
				response.isOneYearCalenderSelection	= true;
				response.monthLimit					= 12;
				Selection.setSelectionToGetData(response);

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

				$("#searchBtn").click(function() {
					myNod.performCheck();
					if(myNod.areAll('valid')){
						_this.onSubmit(_this);								
					}
				});
			});

		},setReportData : function(response) {
			refreshAndHidePartOfPage('right-border-boxshadow', 'hide');

			if(response.message != undefined) {
				hideLayer();
				$('#right1-border-boxshadow').addClass('hide');
				$('#prepaidLedgerReportDiv').addClass('hide');
				$('#prepaidLedgerReportDiv').empty();
				refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
				refreshAndHidePartOfPage('middle-border-boxshadow', 'hide');
				refreshAndHidePartOfPage('left-border-boxshadow', 'hide');
				return;
			}
			showPartOfPage('bottom-border-boxshadow');
			showPartOfPage('middle-border-boxshadow');
			showPartOfPage('left-border-boxshadow');
			
			prepaidLedgerList 		= response.CorporateAccount;
			
			_this.setMultipleLRDetails(prepaidLedgerList);
		
			hideLayer();
		}, setMultipleLRDetails : function(prepaidLedgerList) {

			$('#right1-border-boxshadow').removeClass('hide');
			$('#prepaidLedgerReportDiv').removeClass('hide');
			$('#prepaidLedgerReportDiv').empty();
			$('#prepaidLedgerReportDivExcel').empty();
			
			var columnArray	= new Array();
			var openingAdded = false;
			columnArray.push("<td style='text-align: center; vertical-align: middle;'><b> SR.No. </b></td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'><b> Date </b></td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'><b> Account Name </b></td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'><b> Details </b></td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'><b> Remark </b></td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'><b> Payment Type </b></td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'><b> TXN Number </b></td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'><b> Bank Name </b></td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'><b> Debit </b></td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'><b> Credit </b></td>");
			$('#prepaidLedgerReportDiv').append('<tr class="success">' + columnArray.join(' ') + '</tr>');

			columnArray	= [];
			var j = 0;
			var debitTotal = 0;
			var creditTotal = 0;
			for (var i = 0; i < prepaidLedgerList.length; i++) {
				var obj	= prepaidLedgerList[i];
				var remarkStr;
				if(obj.identifier == 3 && !openingAdded){
					columnArray.push("<td colspan='2' style='text-align: center; vertical-align: middle;'><b>" + obj.accountName + "</b></td>");
					columnArray.push("<td colspan='6' ></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>" + obj.debitAmount + "</b></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>" + obj.creditAmount + "</b></td>");
					$('#prepaidLedgerReportDiv').append('<tr class="info">' + columnArray.join(' ') + '</tr>');
					openingAdded = true;
					columnArray	= [];
					continue;
				} else if (obj.identifier == 3){
					continue;
				}
				if(obj.identifier == 4 && i == prepaidLedgerList.length - 1){
					var str ;
					if(debitTotal > creditTotal){
						str = "( Opening Balance + Debit Amount ) - ( Credit Amount )";
					} else {
						str = "( Opening Balance + Credit Amount ) - ( Debit Amount )";
					}
					columnArray.push("<td colspan='2'style='text-align: center; vertical-align: middle;'><b>Total</b></td>");
					columnArray.push("<td colspan='6'><b>" + str + "</b></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>" + debitTotal + "</b></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>" + creditTotal + "</b></td>");
					$('#prepaidLedgerReportDiv').append('<tr class="info">' + columnArray.join(' ') + '</tr>');
					columnArray	= [];
					
					columnArray.push("<td colspan='2' style='text-align: center; vertical-align: middle;'><b>" + obj.accountName + "</b></td>");
					columnArray.push("<td colspan='6' ></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>" + obj.debitAmount + "</b></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>" + obj.creditAmount + "</b></td>");
					$('#prepaidLedgerReportDiv').append('<tr class="info">' + columnArray.join(' ') + '</tr>');
					columnArray	= [];
					continue;
				}  else if (obj.identifier == 4){
					continue;
				}
				j++;
				debitTotal += obj.debitAmount;
				creditTotal += obj.creditAmount;
				remarkStr = obj.remark != undefined ? obj.remark : '--'
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (j) + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.systemDateTimeString + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.accountName + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.noWithType + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + remarkStr  + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.paymentTypeName + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.chequeNumber + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.bankName  + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>" + obj.debitAmount + "</b></td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>" + obj.creditAmount + "</b></td>");
				
				$('#prepaidLedgerReportDiv').append('<tr>' + columnArray.join(' ') + '</tr>');

				columnArray	= [];
			}
			
			var data = new Object(); 

			data.isPlainPrintAllow				= 'false';
			data.isExcelButtonDisplay			= 'true';
			printTable(data, 'reportData', 'prepaidLedgerReportDivExcel', ' Report', 'prepaidLedgerReportDivExcel');

		},onSubmit : function() {
			showLayer();
			jsonObject = new Object();
			if($("#dateEle").attr('data-startdate') != undefined){
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
			}

			if($("#dateEle").attr('data-enddate') != undefined){
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
			}

			jsonObject["regionId"] 					= $('#regionEle_primary_key').val();
			jsonObject["subRegionId"] 				= $('#subRegionEle_primary_key').val();
			jsonObject["sourceBranchId"] 			= $('#branchEle_primary_key').val();

			getJSON(jsonObject, WEB_SERVICE_URL+'/prepaidLedgerReportWS/getPrepaidLedgerStatementReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}
	});
});