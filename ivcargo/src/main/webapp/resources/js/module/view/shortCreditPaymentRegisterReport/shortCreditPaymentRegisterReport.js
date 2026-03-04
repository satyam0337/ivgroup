define([  
	'slickGridWrapper2'
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
	,'JsonUtility'
	,'messageUtility'
	,'jquerylingua'
	,'language'
	,'autocomplete'
	,'autocompleteWrapper'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
	,'focusnavigation'//import in require.config
	],function(slickGridWrapper2, Selection, UrlParameter) {
	'use strict';
	var jsonObject = new Object(), 
	myNod,  
	_this = '', 
	showSearchByOptions = false,
	ShortCreditPaymentRegisterConstant,
	isFromCashStatement	= false,
	fromDate 		= null,
	toDate			= null,
	srcRegionId		= 0,
	srcSubRegionId		= 0,
	srcBranchId	= 0,
	selectionType	= 0;
	return Marionette.LayoutView.extend({
		initialize : function() {
			
			isFromCashStatement	= UrlParameter.getModuleNameFromParam("isFromCashStatement")
			fromDate 			= UrlParameter.getModuleNameFromParam("fromDate")
			toDate 				= UrlParameter.getModuleNameFromParam("toDate")
			srcRegionId 		= UrlParameter.getModuleNameFromParam("regionId")
			srcSubRegionId 		= UrlParameter.getModuleNameFromParam("subRegionId")
			srcBranchId 		= UrlParameter.getModuleNameFromParam("sourceBranchId")
			selectionType 		= UrlParameter.getModuleNameFromParam("selectionType")
			
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/shortCreditPaymentRegisterReportWS/getShortCreditPaymentRegisterElementConfiguration.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		}, getElementConfigDetails : function(response) {
			var loadelement = new Array();
			var baseHtml = new $.Deferred();

			showSearchByOptions	= response.showSearchByOptions;
			ShortCreditPaymentRegisterConstant	= response.ShortCreditPaymentRegisterConstant;
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/shortCreditPaymentRegisterReport/shortCreditPaymentRegisterReport.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				var keyObject = Object.keys(response);
				
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]])
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
				}
				
				_this.setTypeOption(response);
				_this.setSearchBy(response);
				
				var elementConfiguration	= new Object();

				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
				elementConfiguration.dateElement		= $('#dateEle');

				response.elementConfiguration	= elementConfiguration;
				response.sourceAreaSelection	= true;
				response.isCalenderSelection	= true;
				response.isPhysicalBranchesShow	= true;
				response.AllOptionsForRegion  	= false;
				response.AllOptionsForSubRegion = true;
				response.AllOptionsForBranch 	= true;
				response.partySelection 		= response.searchByParty;

				Selection.setSelectionToGetData(response);

				myNod = Selection.setNodElementForValidation(response);
				
				hideLayer();
				
				if(isFromCashStatement != null && isFromCashStatement) {
					var selectionTypeArr = response.TYPE_LIST;
					
					if(selectionTypeArr != undefined && selectionTypeArr.length > 0) {
						for(var i = 0; i < selectionTypeArr.length; i++) {
							if(selectionType == selectionTypeArr[i].typeId) {
								$('#typeEle').val(selectionTypeArr[i].typeName);
								$('#typeEle_primary_key').val(selectionTypeArr[i].typeId);
							}
						}
					}

					response.subRegionId	= srcSubRegionId;
					response.branchId		= srcBranchId;
					response.sourceBranchId	= srcBranchId;
					response.regionId		= srcRegionId;
					response.fromDate		= fromDate;
					response.toDate			= toDate;
					response.isFromAnotherReport	= true;
					
					setTimeout(() => {
						Selection.setSelectionDataFromAnotherReport(response);
					}, 100);
					
					setTimeout(() => {
						_this.onSubmit();
					}, 300);
				}

				$("#searchBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid')) {
						srcBranchId	= 0;
						_this.onSubmit(_this);
					}							
				});
			});
		}, setTypeOption : function(response) {
			_this.setTypeAutocompleteInstance();
			
			var autoType = $("#typeEle").getInstance();
			
			$( autoType ).each(function() {
				this.option.source = response.TYPE_LIST;
			})
		}, setTypeAutocompleteInstance : function() {
			var autoTypeName 				= new Object();
			autoTypeName.primary_key 		= 'typeId';
			autoTypeName.callBack 			= _this.showSearchByOption;
			autoTypeName.field 				= 'typeName';

			$("#typeEle").autocompleteCustom(autoTypeName)
		}, showSearchByOption : function(){
			if(showSearchByOptions && $('#typeEle_primary_key').val() == ShortCreditPaymentRegisterConstant.LR_TYPE_ID) {
				$('#searchByDiv').removeClass('hide');
			} else {
				$('#searchByDiv').addClass('hide');
				$('#partyDiv').addClass('hide');
				$('#lrNumberDiv').addClass('hide');
				$('#crNumberDiv').addClass('hide');
				$('#searchByEle').val("");
				$('#searchByEle_primary_key').val("");
				myNod.remove('#searchByEle');
			}
		}, setSearchBy : function(response) {
			_this.setSearchByAutocompleteInstance();
			
			var autoSearchBy = $("#searchByEle").getInstance();
			
			$( autoSearchBy ).each(function() {
				this.option.source = response.SEARCH_BY_LIST;
			})
		},setSearchByAutocompleteInstance : function() {
			var autoSearchByName 			= new Object();
			autoSearchByName.primary_key 	= 'searchById';
			autoSearchByName.callBack 		= _this.showSearchByFeild;
			autoSearchByName.keyupFunction	= _this.showSearchByFeild;
			autoSearchByName.field 			= 'searchByName';

			$("#searchByEle").autocompleteCustom(autoSearchByName)
		}, showSearchByFeild : function() {
			if($('#searchByEle_primary_key').val() == ShortCreditPaymentRegisterConstant.SEARCH_BY_LR_ID) {
				$('#partyDiv').addClass('hide');
				$('#crNumberDiv').addClass('hide');
				$('#lrNumberDiv').removeClass('hide');
				myNod.add({
					selector: '#lrNumberEle',
					validate: 'presence',
					errorMessage: 'Enter LR Number !'
				});
				myNod.remove('#crNumberEle');
				myNod.remove('#partyNameEle');
			} else if($('#searchByEle_primary_key').val() == ShortCreditPaymentRegisterConstant.SEARCH_BY_CR_ID) {
				$('#partyDiv').addClass('hide');
				$('#lrNumberDiv').addClass('hide');
				$('#crNumberDiv').removeClass('hide');
				myNod.add({
					selector: '#crNumberEle',
					validate: 'presence',
					errorMessage: 'Enter CR Number !'
				});
				myNod.remove('#lrNumberEle');
				myNod.remove('#partyNameEle');
			} else if($('#searchByEle_primary_key').val() == ShortCreditPaymentRegisterConstant.SEARCH_BY_PARTY_ID) {
				$('#partyDiv').removeClass('hide');
				$('#lrNumberDiv').addClass('hide');
				$('#crNumberDiv').addClass('hide');
				myNod.add({
					selector: '#partyNameEle',
					validate: 'validateAutocomplete:#partyNameEle_primary_key',
					errorMessage: 'Select proper Party !'
				});
				myNod.remove('#lrNumberEle');
				myNod.remove('#crNumberEle');
			} else {
				$('#partyDiv').addClass('hide');
				$('#lrNumberDiv').addClass('hide');
				$('#crNumberDiv').addClass('hide');
				
				myNod.remove('#partyNameEle');
				myNod.remove('#lrNumberEle');
				myNod.remove('#crNumberEle');
			}
		},setReportData : function(response) {
			$("#shortCreditPaymentRegisterDiv").empty();
			$("#shortCreditPaymentRegisterCancellationDiv").empty();
			$("#paymentSummaryDiv").empty();
			
			if(response.message != undefined){
				hideLayer();
				$('#middle-border-boxshadow').addClass('hide');
				$('#bottom-border-boxshadow').addClass('hide');
				$('#left-border-boxshadow').addClass('hide');
				return;
			}
			
			if(response.ShortCreditPaymentRegister.CorporateAccount.length == 0 && (response.ShortCreditPaymentCancellationRegister != undefined 
			&& response.ShortCreditPaymentCancellationRegister.CorporateAccount == 0)){
				hideLayer();
				$('#middle-border-boxshadow').addClass('hide');
				$('#bottom-border-boxshadow').addClass('hide');
				$('#left-border-boxshadow').addClass('hide');
				return;
			}
			
			if(response.ShortCreditPaymentRegister.CorporateAccount != undefined && response.ShortCreditPaymentRegister.CorporateAccount.length > 0) {
				$('#middle-border-boxshadow').removeClass('hide');
				hideAllMessages();
				slickGridWrapper2.setGrid(response.ShortCreditPaymentRegister);
			} else {
				$('#middle-border-boxshadow').addClass('hide');
			}
			
			if(response.ShortCreditPaymentCancellationRegister != undefined &&
			 response.ShortCreditPaymentCancellationRegister.CorporateAccount != undefined && response.ShortCreditPaymentCancellationRegister.CorporateAccount.length > 0) {
				$('#bottom-border-boxshadow').removeClass('hide');
				hideAllMessages();
				slickGridWrapper2.setGrid(response.ShortCreditPaymentCancellationRegister);
			} else {
				$('#bottom-border-boxshadow').addClass('hide');
			}

			if(response.PaymentWiseSummaryModel != undefined && response.PaymentWiseSummaryModel.length > 0) {
				$('#left-border-boxshadow').removeClass('hide');
				$("#paymentSummaryDiv").show();
				hideAllMessages();
				
				var table = $('<table class="table table-bordered" />');
				var totalAmount	= 0;
				var totalReceivedAmount	= 0;
				var totalCancelledAmount	= 0;
				var totalTDSAmount	= 0;
				var shortCreditPaymentRegister	=  response.ShortCreditPaymentRegister.CorporateAccount;
				
				for (var j = 0; j < shortCreditPaymentRegister.length; j++){
					totalTDSAmount += shortCreditPaymentRegister[j].tdsAmount;
				}
				
				for (var i = 0; i < response.PaymentWiseSummaryModel.length; i++){
					if(i == 0) {
						var tr 	=  $('<tr class="info"/>'); 
						
						var th1 	=  $('<th/>');
						var th2 	=  $('<th/>');
						var th3 	=  $('<th/>');
						var th4 	=  $('<th/>');
						
						th1.append("Payment Type");
						th2.append("Received Amount");
						th3.append("Cancelled Amount");
						th4.append("Total Balance Amount");
						
						tr.append(th1);
						tr.append(th2);
						tr.append(th3);
						tr.append(th4);
						
						table.append(tr);
					} 
						var tr 	=  $('<tr/>'); 

						var td1 	=  $('<td/>');
						var td2 	=  $('<td/>');
						var td3 	=  $('<td/>');
						var td4 	=  $('<td/>');
						
						td1.append(response.PaymentWiseSummaryModel[i].paymentTypeName);
						td2.append(response.PaymentWiseSummaryModel[i].amount);
						td3.append(response.PaymentWiseSummaryModel[i].cancelledAmount);
						td4.append(response.PaymentWiseSummaryModel[i].amount - response.PaymentWiseSummaryModel[i].cancelledAmount);
						
						totalAmount				+=	(response.PaymentWiseSummaryModel[i].amount - response.PaymentWiseSummaryModel[i].cancelledAmount);
						totalReceivedAmount		+= 	response.PaymentWiseSummaryModel[i].amount;
						totalCancelledAmount	+= 	response.PaymentWiseSummaryModel[i].cancelledAmount;
						
						tr.append(td1);
						tr.append(td2);
						tr.append(td3);
						tr.append(td4);
						
						table.append(tr);
						
						if(i == (response.PaymentWiseSummaryModel.length - 1)) {
							var tr1 	=  $('<tr/>'); 

							var td1 	=  $('<td/>');
							var td2 	=  $('<td/>');
							
							td1.append("TDS Amount");
							td2.append(totalTDSAmount);
							
							tr1.append(td1);
							tr1.append(td2);
							
							var tr 	=  $('<tr class="info"/>');
							
							var th1 	=  $('<th/>');
							var th2 	=  $('<th/>');
							var th3 	=  $('<th/>');
							var th4 	=  $('<th/>');
							
							th1.append("Total");
							th2.append(totalReceivedAmount);
							th3.append(totalCancelledAmount);
							th4.append(totalAmount);

							tr.append(th1);
							tr.append(th2);
							tr.append(th3);
							tr.append(th4);
							
							if(totalTDSAmount > 0)
								table.append(tr1);
							
							table.append(tr);
						}
				}
				
				$('#paymentSummaryDiv').append(table);
			} else {
				$("#paymentSummaryDiv").hide();
				$('#left-border-boxshadow').addClass('hide');
			}
			
			hideLayer();
		}, onSubmit : function() {
			showLayer();
			let jsonObject = Selection.getElementData();

			jsonObject["typeId"] 		= $('#typeEle_primary_key').val();
			jsonObject["searchById"]	= $('#searchByEle_primary_key').val();
			jsonObject["lrNumber"]		= $('#lrNumberEle').val();
			jsonObject["crNumber"]		= $('#crNumberEle').val();
			
			if(srcBranchId > 0)
				jsonObject["sourceBranchId"]		= srcBranchId;
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/shortCreditPaymentRegisterReportWS/getShortCreditPaymentRegisterDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}
	});
});