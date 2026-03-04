define([  'JsonUtility'
	,'messageUtility'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/lrPaidStatementDetails/lrPaidStatementDetailsfilepath.js'
	,'jquerylingua'
	,'language'
	,'autocomplete'
	,'autocompleteWrapper'
	,'slickGridWrapper2'
	,'slickGridWrapper3'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
	,'selectizewrapper'
	],function(JsonUtility, MessageUtility, FilePath, Lingua, Language, AutoComplete, AutoCompleteWrapper,
			slickGridWrapper2, slickGridWrapper3, NodValidation, BootstrapModal,datePickerUI,ElementFocusNavigation,Selection,UrlParameter,Selectizewrapper) {
	'use strict';
	var jsonObject = new Object(), myNod, corporateAccountId = 0,  _thisRender = '', gridObject, corporateAccountId = 0,crossingTypeComboBoxShow = false, customerAccessId = 0, masterLangObj, masterLangKeySet, caLangObj, caLangKeySet, fromDate = null, toDate = null, regionId = 0, subRegionId = 0, sourceBranchId = 0,wayBillTypeId = 0,
	wayBillTypeConstantList, childwin, showBookingCharegs = false;

	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_thisRender = this;
		}, render : function() {
			getJSON(null, WEB_SERVICE_URL + '/lrPaidStatementDetailsWS/getLRPaidStatementDetailsElement.do?',	_thisRender.loadViewForReport, EXECUTE_WITHOUT_ERROR);
			return _thisRender;
		}, loadViewForReport : function(response) {
			hideLayer();
			
			if(response.message != undefined) {
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}
			var loadelement		= new Array();
			var baseHtml		= new $.Deferred();
			
			var lrPaidStatementDetailsConfiguration	= response.lrPaidStatementDetailsConfiguration;
			showBookingCharegs						= lrPaidStatementDetailsConfiguration.showBookingCharegs;

			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/report/lrPaidStatementDetails/lrPaidStatementDetails.html",function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();

				var keyObject = Object.keys(response);

				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]].show == false) {
						$("*[data-attribute="+ keyObject[i]+ "]").hide();
					}
				}

				var elementConfiguration				= new Object();
				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');

				response.elementConfiguration			= elementConfiguration;
				response.isCalenderSelection			= true;
				response.isOneYearCalenderSelection		= false;
				response.monthLimit						= 12;
				response.sourceAreaSelection			= true;

				Selection.setSelectionToGetData(response);
				masterLangObj 		= FilePath.loadLanguage();
				masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				if($('#regionEle').is(":visible")){
					myNod.add({
						selector: '#regionEle',
						validate: 'validateAutocomplete:#regionEle_primary_key',
						errorMessage: 'Select proper Region !'
					});
				}

				if($('#subRegionEle').is(":visible")){
					myNod.add({
						selector: '#subRegionEle',
						validate: 'validateAutocomplete:#subRegionEle_primary_key',
						errorMessage: 'Select proper Area !'
					});
				}

				if($('#branchEle').is(":visible")){
					myNod.add({
						selector: '#branchEle',
						validate: 'validateAutocomplete:#branchEle_primary_key',
						errorMessage: 'Select proper Branch !'
					});
				}
				
				hideLayer();

				$("#searchBtn").click(function(){
					myNod.performCheck();
					if(myNod.areAll('valid')){
						_thisRender.onSubmit();
					}
				});
			});

		},onSubmit:function() {

			showLayer();
			var jsonObject = new Object();
			if($("#dateEle").attr('data-startdate') != undefined){
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate');
			}

			if($("#dateEle").attr('data-enddate') != undefined){
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate');
			}
			jsonObject["regionId"] 					= $('#regionEle_primary_key').val();
			jsonObject["subRegionId"] 				= $('#subRegionEle_primary_key').val();
			jsonObject["sourceBranchId"] 			= $('#branchEle_primary_key').val();

			getJSON(jsonObject, WEB_SERVICE_URL + '/lrPaidStatementDetailsWS/getLRPaidStatementDetails.do?', _thisRender.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData:function(response) {

			if(response.message != undefined) {
				hideLayer();
				$('#left-border-boxshadow').hide();
				$('#right-border-boxshadow').hide();
				$('#bottom-border-boxshadow').hide();
				
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}
			
			var branch 			= response.branch;
			var accountGroup 	= response.accountGroup;
			
			showLayer();
			
			if(!jQuery.isEmptyObject(response.BookedPaidLR)){
				if(showBookingCharegs) {
					_thisRender.setBookedLRDetailsWithCharges(response);
				} else {
					_thisRender.setBookedLRDetails(response);
				}
			}  
			
			if(!jQuery.isEmptyObject(response.CancelPaidLR)){
				if(showBookingCharegs){
					_thisRender.setCancelLRDetailsWithCharges(response);
				} else {
					_thisRender.setCancelLRDetails(response);
				}
			}
			
			$('#executiveWiseCashDiv').hide();
			$('#executiveWiseChequeDiv').hide();
			$('#executiveWiseCreditDiv').hide();
			$('#printAllReportData').empty();
			
			if(!jQuery.isEmptyObject(response.executiveWiseBookedColForCash)){
				_thisRender.setExecutiveWiseCashTable(response);
			}
			if(!jQuery.isEmptyObject(response.executiveWiseBookedColForCheque)){
				_thisRender.setExecutiveWiseChequeTable(response);
			}
			if(!jQuery.isEmptyObject(response.executiveWiseBookedColForCredit)){
				_thisRender.setExecutiveWiseCreditTable(response);
			}
			
			var data = new Object();
			data.accountGroupNameForPrint	= accountGroup.accountGroupDescription;
			data.branchAddress				= branch.branchAddress;
			data.branchPhoneNumber			= branch.branchContactDetailPhoneNumber;
			data.isLaserPrintAllow			= 'true';
			data.isPlainPrintAllow			= 'true';
			data.isExcelButtonDisplay		= 'true';
			data.isPdfButtonDisplay			= 'false';
			
			printTable(data, 'reportData', 'lrPaidStatementDetails', 'LR Paid Statement Details', 'printAllReportData');
			
			hideLayer();
			
		}, setBookedLRDetailsWithCharges :function(response) {
			
			masterLangObj 				= FilePath.loadLanguage();
			masterLangKeySet 			= loadLanguageWithParams(masterLangObj);
			
			var bookedPaidLRModelColumnConfig			= response.BookedPaidLR.columnConfiguration;
			var bookedPadiLRModelKeys					= _.keys(bookedPaidLRModelColumnConfig);
			var bcolConfig								= new Object();
			var newBookedPaidLRModelKeys	= new Array();
			
			for(var i = 0;bookedPadiLRModelKeys.length > i; i++) {

				if(bookedPadiLRModelKeys[i] != 'gst') {
					newBookedPaidLRModelKeys.push(bookedPadiLRModelKeys[i]);
				} else {
					break;
				}
			}
			
			if(!jQuery.isEmptyObject(response.chargesNameHM)) {
				var chargesNameHM	= response.chargesNameHM;
				for(var j in chargesNameHM) {
					if(chargesNameHM[j] != null) {
						newBookedPaidLRModelKeys.push(chargesNameHM[j].replace(/[' ',.,/]/g,""));
						bookedPaidLRModelColumnConfig[chargesNameHM[j].replace(/[' ',.,/]/g,"")] = {
								"dataDtoKey":chargesNameHM[j].replace(/[' ',.,/]/g,"")
								,"dataType":"number"
								,"languageKey":chargesNameHM[j].replace(/[' ',.,/]/g,"")
								,"searchFilter":true
								,"listFilter":true
								,"columnHidden":false
								,"displayColumnTotal":true
								,"columnMinimumDisplayWidthInPx":70
								,"columnInitialDisplayWidthInPx":90
								,"columnMaximumDisplayWidthInPx":90
								,"columnPrintWidthInPercentage":10
								,"elementCssClass":""
								,"columnDisplayCssClass":""
								,"columnPrintCssClass":""
								,"sortColumn":true
								,"show":true
						};
						masterLangKeySet[chargesNameHM[j].replace(/[' ',.,/]/g,"")] = chargesNameHM[j].replace(/[' ',.,/]/g,"");
					}
				}
			}
			
			newBookedPaidLRModelKeys = _.union(newBookedPaidLRModelKeys, bookedPadiLRModelKeys);
			
			for (var i = 0; i < newBookedPaidLRModelKeys.length; i++) {

				var bObj	= bookedPaidLRModelColumnConfig[newBookedPaidLRModelKeys[i]];

				if (bObj != null && bObj.show != undefined && bObj.show == true) {
					bcolConfig[newBookedPaidLRModelKeys[i]] = bObj;
				}
			}

			response.BookedPaidLR.columnConfiguration		= _.values(bcolConfig);
			response.BookedPaidLR.Language					= masterLangKeySet;

			if(response.BookedPaidLR.CorporateAccount.length > 0) {
			
				for(var i=0;response.BookedPaidLR.CorporateAccount.length > i; i++) {
					if(response.BookedPaidLR.CorporateAccount[i].chargesCollection != undefined) {
						var chargesHM	= response.BookedPaidLR.CorporateAccount[i].chargesCollection;
						for(var l in chargesHM) {
							if(l.split("_")[1] != undefined) {
								response.BookedPaidLR.CorporateAccount[i][l.split("_")[1].replace(/[' ',.,/]/g,"")] = chargesHM[l];
							}
						}
					}
				}
			
				$('#left-border-boxshadow').show();
				gridObject = slickGridWrapper2.setGrid(response.BookedPaidLR);
			} else {
				$('#left-border-boxshadow').hide();
			}

		}, setCancelLRDetailsWithCharges :function(response) {
			
			masterLangObj 			= FilePath.loadLanguage();
			masterLangKeySet 		= loadLanguageWithParams(masterLangObj);
			
			var bookedPaidLRModelColumnConfig			= response.CancelPaidLR.columnConfiguration;
			var bookedPadiLRModelKeys					= _.keys(bookedPaidLRModelColumnConfig);
			var bcolConfig								= new Object();
			var newBookedPaidLRModelKeys	= new Array();
			
			for(var i = 0;bookedPadiLRModelKeys.length > i; i++) {

				if(bookedPadiLRModelKeys[i] != 'gst') {
					newBookedPaidLRModelKeys.push(bookedPadiLRModelKeys[i]);
				} else {
					break;
				}
			}
			
			if(!jQuery.isEmptyObject(response.chargesNameHM)) {
				var chargesNameHM	= response.chargesNameHM;
				for(var j in chargesNameHM) {
					if(chargesNameHM[j] != null) {
						newBookedPaidLRModelKeys.push(chargesNameHM[j].replace(/[' ',.,/]/g,""));
						bookedPaidLRModelColumnConfig[chargesNameHM[j].replace(/[' ',.,/]/g,"")] = {
								"dataDtoKey":chargesNameHM[j].replace(/[' ',.,/]/g,"")
								,"dataType":"number"
								,"languageKey":chargesNameHM[j].replace(/[' ',.,/]/g,"")
								,"searchFilter":true
								,"listFilter":true
								,"columnHidden":false
								,"displayColumnTotal":true
								,"columnMinimumDisplayWidthInPx":70
								,"columnInitialDisplayWidthInPx":90
								,"columnMaximumDisplayWidthInPx":90
								,"columnPrintWidthInPercentage":10
								,"elementCssClass":""
								,"columnDisplayCssClass":""
								,"columnPrintCssClass":""
								,"sortColumn":true
								,"show":true
						};
						masterLangKeySet[chargesNameHM[j].replace(/[' ',.,/]/g,"")] = chargesNameHM[j].replace(/[' ',.,/]/g,"");
					}
				}
			}
			
			newBookedPaidLRModelKeys = _.union(newBookedPaidLRModelKeys, bookedPadiLRModelKeys);
			
			for (var i = 0; i < newBookedPaidLRModelKeys.length; i++) {

				var bObj	= bookedPaidLRModelColumnConfig[newBookedPaidLRModelKeys[i]];

				if (bObj != null && bObj.show != undefined && bObj.show == true) {
					bcolConfig[newBookedPaidLRModelKeys[i]] = bObj;
				}
			}

			response.CancelPaidLR.columnConfiguration		= _.values(bcolConfig);
			response.CancelPaidLR.Language					= masterLangKeySet;

			if(response.CancelPaidLR.CorporateAccount.length > 0) {
			
				for(var i=0;response.CancelPaidLR.CorporateAccount.length > i; i++) {
					if(response.CancelPaidLR.CorporateAccount[i].chargesCollection != undefined) {
						var chargesHM	= response.CancelPaidLR.CorporateAccount[i].chargesCollection;
						for(var l in chargesHM) {
							if(l.split("_")[1] != undefined) {
								response.CancelPaidLR.CorporateAccount[i][l.split("_")[1].replace(/[' ',.,/]/g,"")] = chargesHM[l];
							}
						}
					}
				}
			
				$('#right-border-boxshadow').show();
				gridObject = slickGridWrapper2.setGrid(response.CancelPaidLR);
			} else {
				$('#right-border-boxshadow').hide();
			}

		}, setBookedLRDetails: function(response){
			if(response.BookedPaidLR.CorporateAccount.length > 0){
					var ColumnConfig		= response.BookedPaidLR.columnConfiguration;
					var columnKeys			= _.keys(ColumnConfig);
					var bcolConfig			= new Object();
					
					for (var i=0; i<columnKeys.length; i++) {
						var bObj		= ColumnConfig[columnKeys[i]];
						if (bObj.show == true) {
							bcolConfig[columnKeys[i]]	= bObj;
						}
					}
					response.BookedPaidLR.columnConfiguration		= _.values(bcolConfig);
					response.BookedPaidLR.Language					= masterLangKeySet;
					
					$('#left-border-boxshadow').show();
					gridObject = slickGridWrapper2.setGrid(response.BookedPaidLR);
				} else {
					$('#left-border-boxshadow').hide();
				}
		}, setCancelLRDetails: function(response){
			if(response.CancelPaidLR.CorporateAccount.length > 0){
				var ColumnConfig		= response.CancelPaidLR.columnConfiguration;
				var columnKeys			= _.keys(ColumnConfig);
				var bcolConfig			= new Object();
				
				for (var i=0; i<columnKeys.length; i++) {
					var bObj		= ColumnConfig[columnKeys[i]];
					if (bObj.show == true) {
						bcolConfig[columnKeys[i]]	= bObj;
					}
				}
				response.CancelPaidLR.columnConfiguration		= _.values(bcolConfig);
				response.CancelPaidLR.Language					= masterLangKeySet;
				
				$('#right-border-boxshadow').show();
				gridObject = slickGridWrapper2.setGrid(response.CancelPaidLR);
			} else {
				$('#right-border-boxshadow').hide();
			}
		}, setExecutiveWiseCashTable: function(response){
			
			$('#bottom-border-boxshadow').show();
			$('#executiveWiseCashDiv').show();
			$('#executiveWiseCashTable').empty();
			
			var columnHeadArray		= new Array();
			var columnArray			= new Array();
			var columnFooterArray	= new Array();
			var executiveId			= 0;
			var count				= 1;
			var totalCashAmt		= 0;
			var totalCancelCashAmt	= 0;
			
			var executiveWiseBookedColForCash = response.executiveWiseBookedColForCash;
			
			if(!jQuery.isEmptyObject(response.executiveWiseCancelColForCash))
				var executiveWiseCancelColForCash = response.executiveWiseCancelColForCash;
			
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Sr No.</th>");
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Executive</th>");
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Booking Cash Amt</th>");
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Cancellation Cash Amt</th>");
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Total<br>( Bkg - Canc )</th>");
			
			$('#executiveWiseCashTable').append('<thead id="executiveWiseCashTableHeader" class="text-info text-center">' + columnHeadArray.join(' ') + '</thead>');
			
			for(executiveId in executiveWiseBookedColForCash) {
				var model = executiveWiseBookedColForCash[executiveId];
				
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (count++) + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + model.executiveName + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + Math.round(model.grandTotal) + "</td>");
				
				if(executiveWiseCancelColForCash != undefined && executiveWiseCancelColForCash[executiveId] != undefined){
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + Math.round(executiveWiseCancelColForCash[executiveId].grandTotal) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + Math.round(Math.abs(model.grandTotal - executiveWiseCancelColForCash[executiveId].grandTotal)) + "</td>");
					totalCancelCashAmt	+= executiveWiseCancelColForCash[executiveId].grandTotal;
				} else {
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>0</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + Math.round(model.grandTotal) + "</td>");
				}
				totalCashAmt	+= model.grandTotal;
				
				$('#executiveWiseCashTable').append('<tr>' + columnArray.join(' ') + '</tr>');
				columnArray = [];
			}
			
			columnFooterArray.push("<th colspan='2' style='text-align: center; vertical-align: middle;'>Total</th>");
			columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>"+Math.round(totalCashAmt)+"</th>");
			columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>"+Math.round(totalCancelCashAmt)+"</th>");
			columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>"+Math.round(Math.abs(totalCashAmt - totalCancelCashAmt))+"</th>");
			
			$('#executiveWiseCashTable').append('<thead class="text-info">' + columnFooterArray.join(' ') + '</thead>');
			
		}, setExecutiveWiseChequeTable: function(response){
			
			$('#bottom-border-boxshadow').show();
			$('#executiveWiseChequeDiv').show();
			$('#executiveWiseChequeTable').empty();
			
			var columnHeadArray		= new Array();
			var columnArray			= new Array();
			var columnFooterArray	= new Array();
			var executiveId			= 0;
			var count				= 1;
			var totalCashLessAmt		= 0;
			var totalCancelCashLessAmt	= 0;
			
			var executiveWiseBookedColForCheque = response.executiveWiseBookedColForCheque;
			
			if(!jQuery.isEmptyObject(response.executiveWiseCancelColForCheque))
				var executiveWiseCancelColForCheque = response.executiveWiseCancelColForCheque;
			
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Sr No.</th>");
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Executive</th>");
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Booking Cheque Amt</th>");
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Cancellation Cheque Amt</th>");
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Total<br>( Bkg - Canc )</th>");
			
			$('#executiveWiseChequeTable').append('<thead id="executiveWiseChequeTableHeader" class="text-info text-center">' + columnHeadArray.join(' ') + '</thead>');
			
			for(executiveId in executiveWiseBookedColForCheque) {
				var model = executiveWiseBookedColForCheque[executiveId];
				
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (count++) + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + model.executiveName + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + Math.round(model.grandTotal) + "</td>");
				
				if(executiveWiseCancelColForCheque != undefined && executiveWiseCancelColForCheque[executiveId] != undefined){
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + Math.round(executiveWiseCancelColForCheque[executiveId].grandTotal) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + Math.round(Math.abs(model.grandTotal - executiveWiseCancelColForCheque[executiveId].grandTotal)) + "</td>");
					totalCancelCashLessAmt	+= executiveWiseCancelColForCheque[executiveId].grandTotal;
				} else {
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>0</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + Math.round(model.grandTotal) + "</td>");
				}
				totalCashLessAmt	+= model.grandTotal;
				
				$('#executiveWiseChequeTable').append('<tr>' + columnArray.join(' ') + '</tr>');
				columnArray = [];
			}
			
			columnFooterArray.push("<th colspan='2' style='text-align: center; vertical-align: middle;'>Total</th>");
			columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>"+Math.round(totalCashLessAmt)+"</th>");
			columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>"+Math.round(totalCancelCashLessAmt)+"</th>");
			columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>"+Math.round(Math.abs(totalCashLessAmt - totalCancelCashLessAmt))+"</th>");
			
			$('#executiveWiseChequeTable').append('<thead class="text-info">' + columnFooterArray.join(' ') + '</thead>');
			
		}, setExecutiveWiseCreditTable: function(response){
			
			$('#bottom-border-boxshadow').show();
			$('#executiveWiseCreditDiv').show();
			$('#executiveWiseCreditTable').empty();
			
			var columnHeadArray		= new Array();
			var columnArray			= new Array();
			var columnFooterArray	= new Array();
			var executiveId			= 0;
			var count				= 1;
			var totalCreditAmt		= 0;
			var totalCancelCreditAmt= 0;
			
			var executiveWiseBookedColForCredit = response.executiveWiseBookedColForCredit;
			
			if(!jQuery.isEmptyObject(response.executiveWiseCancelColForCredit))
				var executiveWiseCancelColForCredit = response.executiveWiseCancelColForCredit;
			
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Sr No.</th>");
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Executive</th>");
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Booking Credit Amt</th>");
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Cancellation Credit Amt</th>");
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Total<br>( Bkg - Canc )</th>");
			
			$('#executiveWiseCreditTable').append('<thead id="executiveWiseCreditTableHeader" class="text-info text-center">' + columnHeadArray.join(' ') + '</thead>');
			
			for(executiveId in executiveWiseBookedColForCredit) {
				var model = executiveWiseBookedColForCredit[executiveId];
				
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (count++) + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + model.executiveName + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + Math.round(model.grandTotal) + "</td>");
				
				if(executiveWiseCancelColForCredit != undefined && executiveWiseCancelColForCredit[executiveId] != undefined){
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + Math.round(executiveWiseCancelColForCredit[executiveId].grandTotal) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + Math.round(Math.abs(model.grandTotal - executiveWiseCancelColForCredit[executiveId].grandTotal)) + "</td>");
					totalCancelCreditAmt	+= executiveWiseCancelColForCredit[executiveId].grandTotal;
				} else {
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>0</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + Math.round(model.grandTotal) + "</td>");
				}
				totalCreditAmt	+= model.grandTotal;
				
				$('#executiveWiseCreditTable').append('<tr>' + columnArray.join(' ') + '</tr>');
				columnArray = [];
			}
			
			columnFooterArray.push("<th colspan='2' style='text-align: center; vertical-align: middle;'>Total</th>");
			columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>"+Math.round(totalCreditAmt)+"</th>");
			columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>"+Math.round(totalCancelCreditAmt)+"</th>");
			columnFooterArray.push("<th style='text-align: center; vertical-align: middle;'>"+Math.round(Math.abs(totalCreditAmt - totalCancelCreditAmt))+"</th>");
			
			$('#executiveWiseCreditTable').append('<thead class="text-info">' + columnFooterArray.join(' ') + '</thead>');
		}
	});
});

function transportSearch(grid,dataView,row){
	var LR_SEARCH_TYPE_ID		= 1;
	if(dataView.getItem(row).wayBillId != undefined) {
		window.open('SearchWayBillAction.do?pageId=5&eventId=3&wayBillId=' + dataView.getItem(row).wayBillId + '&NumberType=' + LR_SEARCH_TYPE_ID + '&BranchId=0');
	}
}

function getShortCreditDetails1(grid,dataView,row){
	var PAYMENT_TYPE_CREDIT_ID	= 3;
	var BILL_CLEARANCE_STATUS_DUE_PAYMENT_ID	= 1;
	
	if (dataView.getItem(row).shortCreditCollectionLedgerId != undefined && dataView.getItem(row).shortCreditCollectionLedgerId > 0 && dataView.getItem(row).getPaymentType != PAYMENT_TYPE_CREDIT_ID
		&& dataView.getItem(row).getPaymentStatus != BILL_CLEARANCE_STATUS_DUE_PAYMENT_ID) {
		window.open('stbsBillPaymentDetails.do?pageId=340&eventId=2&modulename=stbsBillPaymentDetails&shortCreditCollLedgerId=' + dataView.getItem(row).shortCreditCollectionLedgerId, 'newwindow', config = 'height=310,width=1200, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	} else if (dataView.getItem(row).creditWayBillTxnId != undefined
		&& dataView.getItem(row).getPaymentType != PAYMENT_TYPE_CREDIT_ID
		&& dataView.getItem(row).getPaymentStatus != BILL_CLEARANCE_STATUS_DUE_PAYMENT_ID) {
		window.open('shortCreditPaymentDetails.do?pageId=340&eventId=2&modulename=shortCreditPaymentDetails&creditWayBillTxnId=' + dataView.getItem(row).creditWayBillTxnId, 'newwindow', config = 'height=600,width=825, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	}
}