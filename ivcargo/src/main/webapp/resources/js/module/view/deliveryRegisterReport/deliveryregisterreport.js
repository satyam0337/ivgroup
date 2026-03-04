define([  
	'slickGridWrapper2'
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/module/saveReportRequest.js'
	,'JsonUtility'
	,'messageUtility'
	,'autocomplete'
	,'autocompleteWrapper'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'focusnavigation'//import in require.config
	],function(slickGridWrapper2, Selection, UrlParameter) {
	'use strict';
	var jsonObject = new Object(), 
	myNod, 
	_this = '', 
	gridObject, 
	isFromCashStatement	= false,
	fromDate 		= null,
	toDate			= null,
	srcRegionId		= 0,
	srcSubRegionId		= 0,
	srcBranchId	= 0,
	paymentType		= 0,
	showDownloadExelbutton,
	showDlyCommissionColumnInCancellationTable	= false,
	downloadToExcel	  = false;

	return Marionette.LayoutView.extend({
		initialize : function() {
			
			isFromCashStatement	= UrlParameter.getModuleNameFromParam("isFromCashStatement")
			fromDate 			= UrlParameter.getModuleNameFromParam("fromDate")
			toDate 				= UrlParameter.getModuleNameFromParam("toDate")
			srcRegionId			= UrlParameter.getModuleNameFromParam("regionId")
			srcSubRegionId 		= UrlParameter.getModuleNameFromParam("subRegionId")
			srcBranchId 		= UrlParameter.getModuleNameFromParam("sourceBranchId")
			paymentType 		= UrlParameter.getModuleNameFromParam("paymentTypeId")
			
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/report/deliveryRegisterReportWS/getDeliveryRegisterReportElementConfiguration.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},getElementConfigDetails : function(response){
			var loadelement = new Array();
			var baseHtml 	= new $.Deferred();

			showDownloadExelbutton 						= response.showDownloadExelbutton;
			showDlyCommissionColumnInCancellationTable	= response.showDlyCommissionColumnInCancellationTable;
			downloadToExcel								= response.downloadToExcel;
			
			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/module/deliveryregisterreport/DeliveryRegisterReport.html",function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				let keyObject = Object.keys(response);
				
				for (const element of keyObject) {
					if (response[element])
						$("*[data-attribute="+ element+ "]").removeClass("hide");
				}
				
				if(response.isActiveTCEGroup) {
					$('#selectUserTypeDiv').show();
					_this.setSelectUserType();		
				} else {
					$('#selectUserTypeDiv').hide();
				}
				
				if(response.partySelection) {
					$("*[data-attribute=partyType]").removeClass("hide");
					$("*[data-attribute=partyName]").removeClass("hide");
				}
										
				if(response.showBillSelection)
					$("*[data-attribute=billSelectionName]").removeClass("hide");
				
				let elementConfiguration				= new Object();

				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
				elementConfiguration.paymentTypeElement	= $('#paymentTypeEle');
				elementConfiguration.divisionElement	= $('#divisionEle');

				response.elementConfiguration			= elementConfiguration;
				response.sourceAreaSelection			= true;
				response.isCalenderSelection			= true;
				response.paymentTypeSelection			= true;
				response.isOneYearCalenderSelection		= false;
				response.monthLimit						= response.monthLimitToShowDate;
				response.divisionSelection				= response.division;
				
				Selection.setSelectionToGetData(response);
				
				if(showDownloadExelbutton || downloadToExcel)
					$('#downloadExcel').css('display','inline')

				if(response.partySelection)
					_this.setPartyType();
				
				myNod = Selection.setNodElementForValidation(response);

				hideLayer();
				
				if(isFromCashStatement != null && isFromCashStatement) {
					response.subRegionId	= srcSubRegionId;
					response.branchId		= srcBranchId;
					response.sourceBranchId	= srcBranchId;
					response.regionId		= srcRegionId;
					response.fromDate		= fromDate;
					response.toDate			= toDate;
					response.paymentType	= paymentType;
					response.isFromAnotherReport	= true;
							
					Selection.setSelectionDataFromAnotherReport(response);
					
					_this.onSubmit();
				}
				
				$("#findBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit(_this);								
				});
				
				$("#sendRequest").click(function() {
					myNod.performCheck();
				
					if(myNod.areAll('valid'))
						saveReportRequest(6);	
				});

				$('#maxDaysToFindReport').val(response.maxDaysToFindReport + 1);
				
				$("#dateEle").change(function(){
					checkDate();
				});
				
				$("#downloadExcel").click(function() {
					myNod.performCheck();

					if(myNod.areAll('valid'))
						_this.onSubmitForExcelDownload(_this);								
				});
			});

		},setReportData : function(response) {
			isFromCashStatement	= false;
			
			$('#left-border-boxshadow').addClass('hide');
			$('#right-border-boxshadow').addClass('hide');
			$("#deliveryRegisterReportDiv").empty();
			$('#deliveryCancellationDetails').empty();
			$("#paymentSummaryDiv").empty();

			if(response.message != undefined) {
				hideLayer();
				$('#bottom-border-boxshadow').hide();
				return;
			}

			if(response.DeliveryRegisterModel != undefined && response.DeliveryRegisterModel.CorporateAccount != undefined) {
				var chargesNameHM	= response.deliveryChargesNameHM;
				
				for(const obj of response.DeliveryRegisterModel.CorporateAccount) {
					let chargesMap	= obj.chargesCollection;
						
					for(let chargeId in chargesNameHM) {
						let chargeName	= chargesNameHM[chargeId].replace(/[' ',.,/]/g,"");
							
						obj[chargeName]	= chargesMap != undefined ? (chargesMap[chargeId] != undefined ? Math.round(chargesMap[chargeId]) : 0) : 0;
					}
				}
				
				$('#bottom-border-boxshadow').show();
				
				gridObject = slickGridWrapper2.setGrid(response.DeliveryRegisterModel);
				_this.cancelCRColour(gridObject);
			} else {
				$('#bottom-border-boxshadow').hide();
			}
			
			var finalDeliveryCancellationArrList	= response.finalDeliveryCancellationArrList;
			
			if(finalDeliveryCancellationArrList != undefined && finalDeliveryCancellationArrList.length > 0 ) {
				$('#left-border-boxshadow').removeClass('hide');
				
				var columnArray		= new Array();
				
				var totalQuantity				= 0;
				var totalActualWeight			= 0;
				var totalBookingAmt				= 0;
				var totalCancellationCharge		= 0;
				var totalDlyDisc				= 0;
				var totalDlyComm				= 0;
				var totalAmt					= 0;
				var totalQuantityAmt			= 0;
				
				for (var i = 0; i < finalDeliveryCancellationArrList.length; i++) {
					var obj		= finalDeliveryCancellationArrList[i];
					
					totalQuantity				+=  obj.quantity;
					totalActualWeight			+= 	obj.actualWeight;
					totalBookingAmt				+= 	obj.bookingAmount;
					totalCancellationCharge		+= 	obj.cancellationCharge;
					totalDlyDisc				+= 	obj.deliveryDiscount;
					totalDlyComm				+=  obj.deliveryCommission;
					totalAmt					+=  obj.bookingAmount;
					totalQuantityAmt			+= parseFloat(obj.invoiceQuantity);
					
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i + 1) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;' id='dlyDateTime_" + obj.wayBillId + "'>"+obj.deliveryDateTimeStr+"</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + (obj.wayBillDeliveryNumber) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + (obj.wayBillNumber) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + (obj.consignorName) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + (obj.consigneeName) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + (obj.deliveredToPersonDetails) + "</td>");
					columnArray.push("<td style='text-align: right; vertical-align: middle;'>" + (obj.quantity) + "</td>");
					columnArray.push("<td style='text-align: right; vertical-align: middle;'>" + (obj.actualWeight) + "</td>");
					columnArray.push("<td style='text-align: right; vertical-align: middle;'>" + (obj.bookingAmount) + "</td>");
					columnArray.push("<td style='text-align: right; vertical-align: middle;'>" + (obj.bookingAmount) + "</td>");
					columnArray.push("<td style='text-align: right; vertical-align: middle;'>" + (obj.deliveryDiscount) + "</td>");
					columnArray.push("<td class='dlyCommissionColumn' style='text-align: right; vertical-align: middle;'>" + (obj.deliveryCommission) + "</td>");
					columnArray.push("<td style='text-align: right; vertical-align: middle;'>" + (obj.cancellationCharge) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + (obj.wayBillTypeName) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + (obj.paymentTypeName) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + (obj.paymentStatusName) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + (obj.shortCreditChequeNumber) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + (obj.shortCreditPaymentTypeName) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + (obj.sourceBranchName) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + (obj.destinationBranchName) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + (obj.executiveName) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + (obj.cancellationRemark) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + (obj.bookingDateTimeStr) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + (obj.receivedDateTimeStr) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + (obj.invoiceNumberStr) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + (obj.invoicePartNoStr) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + (obj.invoiceQuantity) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + (obj.deliveryStatusStr) + "</td>");

					$('#deliveryCancellationDetailsTable tbody').append('<tr id="deliveryCancellationDetails_'+ obj.wayBillId +'">' + columnArray.join(' ') + '</tr>');

					columnArray	= [];
				}
				
				columnArray.push("<th class='table-bordered' height ='30px' colspan='7' style='background-color: #FFE5CC; padding-left: 285px;  text-center: middle'; vertical-align: middle; text-transform: uppercase'>Total</th>");
				columnArray.push("<td class='table-bordered' height ='30px' style='background-color: #FFE5CC; text-align: right; vertical-align: middle;'><b style='font-size: 12px'>"+ (totalQuantity) +"</b></td>");
				columnArray.push("<td class='table-bordered' height ='30px' style='background-color: #FFE5CC; text-align: right; vertical-align: middle;'><b style='font-size: 12px'>"+ (totalActualWeight) +"</b></td>");
				columnArray.push("<td class='table-bordered' height ='30px' style='background-color: #FFE5CC; text-align: right; vertical-align: middle;'><b style='font-size: 12px'>"+ (totalBookingAmt) +"</b></td>");
				columnArray.push("<td class='table-bordered' height ='30px' style='background-color: #FFE5CC; text-align: right; vertical-align: middle;'><b style='font-size: 12px'>"+ (totalBookingAmt) +"</b></td>");
				columnArray.push("<td class='table-bordered' height ='30px' style='background-color: #FFE5CC; text-align: right; vertical-align: middle;'><b style='font-size: 12px'>"+ (totalDlyDisc) +"</b></td>");
				columnArray.push("<td class='table-bordered dlyCommissionColumn' height ='30px' style='background-color: #FFE5CC; text-align: right; vertical-align: middle;'><b style='font-size: 12px'>"+ (totalDlyComm) +"</b></td>");
				columnArray.push("<td class='table-bordered' height ='30px' style='background-color: #FFE5CC; text-align: right; vertical-align: middle;'><b style='font-size: 12px'>"+ (totalCancellationCharge) +"</b></td>");
				
				for(let i = 0; i < 13; i++)
					columnArray.push("<td></td>");

				columnArray.push("<td class='table-bordered' height ='30px' style='background-color: #FFE5CC; text-align: right; vertical-align: middle; text-transform: uppercase'>"+(totalQuantityAmt)+"</td>");
				columnArray.push("<td></td>");

				$('#deliveryCancellationDetailsTable tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
			} else {
				$('#left-border-boxshadow').addClass('hide');
			}
			
			if(showDlyCommissionColumnInCancellationTable)
				$('.dlyCommissionColumn').show();
			else
				$('.dlyCommissionColumn').hide();
			
			if(response.PaymentWiseSummaryModel != undefined && response.PaymentWiseSummaryModel.length > 0 ) {
				
				$('#right-border-boxshadow').removeClass('hide');
				hideAllMessages();

				var table = $('<table class="table table-bordered" />');
				var totalAmount				= 0;
				var totalCancelledAmount	= 0;
				var totalBalanceAmount		= 0;

				for (var i = 0; i < response.PaymentWiseSummaryModel.length; i++){
					paymentTypeId = response.PaymentWiseSummaryModel[i].paymentTypeId;
					if(i == 0) {
						var tr 	=  $('<tr class="info"/>'); 

						var th1 	=  $('<th/>');
						var th2 	=  $('<th/>');
						var th3 	=  $('<th/>');
						var th4 	=  $('<th/>');

						th1.append("Payment Type");
						th2.append("Amount");
						th3.append("Cancelled Amount");
						th4.append("Total");
						
						tr.append(th1);
						tr.append(th2);
						tr.append(th3);
						tr.append(th4);

						table.append(tr);
					} 
					var tr 	=  $('<tr/>'); 

					var td1 	=  $('<td style="text-align: center;"/>');
					var td2 	=  $('<td style="text-align: right;"/>');
					var td3 	=  $('<td style="text-align: right;"/>');
					var td4 	=  $('<td style="text-align: right;"/>');

					td1.append(response.PaymentWiseSummaryModel[i].paymentTypeName);
					td2.append(toFixedWhenDecimal(response.PaymentWiseSummaryModel[i].amount));
					td3.append(-toFixedWhenDecimal(response.PaymentWiseSummaryModel[i].cancelledAmount));
					td4.append(toFixedWhenDecimal(response.PaymentWiseSummaryModel[i].amount - response.PaymentWiseSummaryModel[i].cancelledAmount));
							
					totalAmount				+= toFixedWhenDecimal(response.PaymentWiseSummaryModel[i].amount);
					totalCancelledAmount 	+= toFixedWhenDecimal(response.PaymentWiseSummaryModel[i].cancelledAmount);
					totalBalanceAmount		+= toFixedWhenDecimal(response.PaymentWiseSummaryModel[i].amount - response.PaymentWiseSummaryModel[i].cancelledAmount);
					
					tr.append(td1);
					tr.append(td2);
					tr.append(td3);
					tr.append(td4);

					table.append(tr);

					if(i == (response.PaymentWiseSummaryModel.length - 1)) {
						var tr 	=  $('<tr class="info"/>');

						var th1 	=  $('<th style="text-align: center;"/>');
						var th2 	=  $('<th style="text-align: right;"/>');
						var th3 	=  $('<th style="text-align: right;"/>');
						var th4 	=  $('<th style="text-align: right;"/>');
						
						th1.append("Total");
						th2.append(toFixedWhenDecimal(totalAmount));
						th3.append(-toFixedWhenDecimal(totalCancelledAmount));
						th4.append(toFixedWhenDecimal(totalBalanceAmount));

						tr.append(th1);
						tr.append(th2);
						tr.append(th3);
						tr.append(th4);

						table.append(tr);
					}
				}
				$('#paymentSummaryDiv').append(table);
			} else {
				$('#right-border-boxshadow').addClass('hide');
			}

			hideLayer();
		},cancelCRColour:function(gridObject){
			slickGridWrapper2.updateRowColor(gridObject,'currentDeliveredStatus',2,'highlight-row-onchange');
		},onSubmit : function() {
			showLayer();
			var jsonObject = new Object();
			
			if(isFromCashStatement != null && isFromCashStatement) {
				jsonObject["fromDate"] 			= fromDate; 
				jsonObject["toDate"] 			= toDate; 
				jsonObject["regionId"] 			= regionId;
				jsonObject["subRegionId"] 		= subRegionId;
				jsonObject["sourceBranchId"] 	= sourceBranchId;
				jsonObject["paymentTypeId"] 	= paymentType;
				jsonObject["billSelectionId"] 	= $('#billSelectionEle').val();
			} else {
				jsonObject = Selection.getElementData();
				jsonObject["selectUserTypeId"]	= $('#selectUserTypeEle_primary_key').val();
				jsonObject["partyTypeId"]		= $('#partyTypeEle_primary_key').val();
				jsonObject["billSelectionId"] 	= $('#billSelectionEle').val();
			}
				 
			getJSON(jsonObject, WEB_SERVICE_URL+'/report/deliveryRegisterReportWS/getDeliveryRegisterReportData.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}, onSubmitForExcelDownload : function() {
			showLayer();
			var jsonObject = Selection.getElementData();
			jsonObject.isExcel = true;
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/report/deliveryRegisterReportWS/getDeliveryRegisterReportData.do', _this.setExcelReportData, EXECUTE_WITH_ERROR);
		}, setExcelReportData : function(response){
			var data = response;
			hideLayer();
			
			if(data.message.messageId == 21)
				return;
			
			generateFileToDownload(data);
		},setSelectUserType : function(){

			_this.setSelectUserTypeAutocompleteInstance();
			
			let autoSelectUserType = $("#selectUserTypeEle");

			let SelectUserTYPE = [
				{ "selectUserTypeId":1, "selectUserTypeName": "IVCargo" },
				{ "selectUserTypeId":2, "selectUserTypeName": "TranCE" }
			   // { "selectUserTypeId":0, "selectUserTypeName": "BOTH" },
			]

			autoSelectUserType.getInstance().each(function() {

			 // autoSelectUserType.val("BOTH");
				this.option.source = SelectUserTYPE;
			})
		},setSelectUserTypeAutocompleteInstance : function() {
			let autoSelectUserTypeName 			= new Object();
			autoSelectUserTypeName.primary_key 	= 'selectUserTypeId';
			autoSelectUserTypeName.field 		= 'selectUserTypeName';

			$("#selectUserTypeEle").autocompleteCustom(autoSelectUserTypeName)
		},setPartyType : function() {
			_this.setPartyTypeAutoCompleteInstance();
			
			let autoPartyType = $("#partyTypeEle").getInstance();
			
			let partyType = [
				{ "partyTypeId":1, "partyTypeName": "Consignor" },
				{ "partyTypeId":2, "partyTypeName": "Consignee" },
			]
			
			$( autoPartyType ).each(function() {
				this.option.source = partyType;
			})
			
		},setPartyTypeAutoCompleteInstance : function (){
			let autoPartyTypeName 			= new Object;
			autoPartyTypeName.primary_key 	= 'partyTypeId';
			autoPartyTypeName.field			= 'partyTypeName';
			
			$("#partyTypeEle").autocompleteCustom(autoPartyTypeName);
		}
	});
});
function setJsonData(jsonObject){
    
      if($("#dateEle").attr('data-startdate') != undefined){
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
			}

			if($("#dateEle").attr('data-enddate') != undefined){
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
			}

			if($("#dateEle").attr('data-startdate') != undefined){
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
			}
			if($("#dateEle").attr('data-enddate') != undefined){
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
			}
			
            jsonObject["regionId"] 					= $('#regionEle_primary_key').val();
			jsonObject["subRegionId"] 				= $('#subRegionEle_primary_key').val();
			jsonObject["sourceBranchId"] 			= $('#branchEle_primary_key').val();
			jsonObject["paymentTypeId"] 			= $('#paymentTypeEle_primary_key').val();
			jsonObject["isExcel"]                     = true;
            jsonObject.filter                        = 4;
}

function ValidateFormElement(type){
    if(type == 1 && !validateSelectedDate()){
    	showMessage('error',"You can not find report for more than "+$('#maxDaysToFindReport').val()+" days , Please use request option !");
   		return false;
    }
    return true;
}

function wayBillSearch(grid, dataView, row) {
	window.open('SearchWayBillAction.do?pageId=50&eventId=156&fromDate='+ $("#dateEle").attr('data-startdate') + '&toDate=' +  $("#dateEle").attr('data-enddate')+'&regionId=' +  dataView.getItem(row).regionId+'&subRegionId=' +  dataView.getItem(row).subRegionId+'&branchId=' +  dataView.getItem(row).branchId);
}
