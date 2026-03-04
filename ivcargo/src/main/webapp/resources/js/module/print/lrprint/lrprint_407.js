var QR_CODE_USING_CONSIGNMENT		= 1;
var QR_CODE_USING_WAYBILL_NUMBER	= 2;
var zerosReg = /[1-9]/g;
var isQRPrintOnPopUpSelection = false;
var whitespace = /\S/;
var commaSepratedArticleType= '';
var PACKING_TYPE_PACKET  = 342;
var PACKING_TYPE_LETTER  = 335;
var PACKING_TYPE_LIFFAFA = 336;

define(['/ivcargo/resources/js/barcode/qrcode/qrcode.js',
    'language'
    ],function(elementTemplateJs,language){
        var configuration,printFromDB,isSundryBooking;
    return ({
        renderElements : function(responseOut){
            _this = this;
             configuration     = responseOut.configuration;
             printFromDB     = responseOut.printFromDB;
             isSundryBooking = configuration.bookingTypeChange == 'true' && responseOut.bookingTypeId == BOOKING_TYPE_SUNDRY_ID;
            
            this.setDataForView(responseOut);
            
        }, setDataForView : function(responseOut) {
            require(['text!/ivcargo/template/lrprint/' + responseOut.lrPrintType + '.html','/ivcargo/resources/js/module/print/lrprint/lrprintfilepath.js'],function(lrprint,FilePath){
                    $("#myGrid").addClass('visible-print-block');
                        $("#myGrid").append(lrprint);
                    _this.setHeaderData(responseOut);
                    _this.setConsignorname(responseOut);
                    _this.setLrDetails(responseOut);
                    _this.setConsignment(responseOut);
                    _this.showPopUp(responseOut);
                    _this.setExecutiveDetails(responseOut)
                    _this.setCurrentDateTime(responseOut)
                    loadLanguageWithParams(FilePath.loadLanguage(responseOut.lrPrintType));
            })
       		}, setHeaderData : function(responseOut){
				var accountGroupObj = responseOut.PrintHeaderModel;
			
			$("*[data-account='address']").html(accountGroupObj.branchAddress + ". ");
			$("*[data-account='number']").html(accountGroupObj.branchContactDetailPhoneNumber);
			$("*[data-account='gstn']").html(accountGroupObj.branchGSTN);
			
			if (accountGroupObj.branchContactDetailPhoneNumber != undefined && accountGroupObj.branchContactDetailPhoneNumber != null)
				$("*[data-account='branchNumber']").html('(' + accountGroupObj.branchContactDetailPhoneNumber + ')');
			else
				$("*[data-account='branchNumber']").html('');
							
		}, setConsignorname : function(responseOut) {
				var config				= responseOut.configuration;
			var consigneeGSTN		= responseOut.consigneeGstn;
			var consignorGSTN 		= responseOut.consignorGstn;
			var consignorName		= responseOut.consignorName;
			var consigneeName		= responseOut.consigneeName;
			consignorName			= consignorName.toUpperCase();
			consigneeName			= consigneeName.toUpperCase();

			
			if (config.consignorNameSubstringLength > 0 && consignorName.length > config.consignorNameSubstringLength) {
				var consignorNameWithSub	= consignorName.substring(0, config.consignorNameSubstringLength);
				$("*[data-consignor='name']").html(consignorNameWithSub + '..');
			} else {
				$("*[data-consignor='name']").html(consignorName);
			}
			
			if (consignorName.length > 15) {
				$(".consignorName").removeClass('Font15Size')
				$(".consignorName").addClass('font11px')
			}
            
			if(zerosReg.test(responseOut.consignorPhn)) {
				var customerDetailsphoneNumber	= responseOut.consignorPhn;
				$("*[data-consignor='number']").html(customerDetailsphoneNumber);
			}

			if(consignorGSTN != undefined && consignorGSTN != null && consignorGSTN !='') {
				consignorGSTN	= consignorGSTN.toUpperCase();
				$("*[data-consignor='gstn']").html(consignorGSTN);
			}
			
			if(config.consigneeNameSubstringLength > 0 && consigneeName.length > config.consigneeNameSubstringLength) {
				var consigneeNameWithSub	= consigneeName.substring(0, config.consigneeNameSubstringLength);
				$("*[data-consignee='name']").html(consigneeNameWithSub + '..');
			} else {
				$("*[data-consignee='name']").html(consigneeName);
			}
			
			if (consigneeName.length > 15) {
				$(".consigneeName").removeClass('Font15Size');
				$(".consigneeName").addClass('font11px');
			}
			
			if(zerosReg.test(responseOut.consigneePhn)) {
				var customerDetailsphoneNumber	= responseOut.consigneePhn;
				$("*[data-consignee='number']").html(customerDetailsphoneNumber);
			}
			
			if(consigneeGSTN != undefined && consigneeGSTN != null && consigneeGSTN !='') {
				consigneeGSTN		= consigneeGSTN.toUpperCase();
				$("*[data-consignee='gstn']").html(consigneeGSTN);
			}

			
		
			if(config.isRateConfigCondition == 'true') {
				if(responseOut.consignorRateConfigured)
					$("*[data-consignor='name']").html($("*[data-consignor='name']").html() + " * ");
					
				if(responseOut.consigneeRateConfigured)
					$("*[data-consignee='name']").html($("*[data-consignee='name']").html() + " * ");
			}			
		}, setLrDetails : function(responseOut) {
			
			var config					= responseOut.configuration;
			var wayBillSourceBranchName			= responseOut.wayBillSourceBranchName;
			var wayBillDestinationBranchName	= responseOut.wayBillDestinationBranchName;
			var wayBillDestinationBranchMobileNumber	= responseOut.wayBillDestinationBranchMobileNumber;
			var wayBillTypeId							= responseOut.wayBillTypeId;
			var wayBillRemark							= responseOut.wayBillRemark;
			var consignmentSummaryDeliveryToAddress		= responseOut.consignmentSummaryDeliveryToAddress;
 			var bookingCharges      					= responseOut.waybillBookingChargesList;
			//START :: Advance and Balance Calculation for Abbas LR Print - Ravi Prajapati
				
			$("*[data-lr='number']").html(responseOut.wayBillNumber);
			

			if(config.isCTFormConditionRequired == 'true' && responseOut.consignmentSummaryFormTypeId == CT_FORM_NOT_RECEIVED_ID)
				$("*[data-lr='number']").html("***" + responseOut.wayBillNumber);
			
			$("*[data-lr='date']").html(responseOut.bookingDateTimeString);
			
			var branchTypeOfLocation		= responseOut.branchTypeOfLocation;
			var handlingBranchName			= responseOut.handlingBranchName;
					destBranchMobileNo  = wayBillDestinationBranchMobileNumber;
          	
          	if(config.appendHandlingBranchWithSourceBranch == 'true' && responseOut.bookingTypeId == BOOKING_TYPE_FTL_ID) {
				if(branchTypeOfLocation != undefined && branchTypeOfLocation == TYPE_OF_LOCATION_OPERATIONAL_PLACE && handlingBranchName != undefined)
					$("*[data-lr='lrSource']").html(handlingBranchName + '-' + wayBillSourceBranchName);
				else
					$("*[data-lr='lrSource']").html(wayBillSourceBranchName);
			} else {
				$("*[data-lr='lrSource']").html(wayBillSourceBranchName);
			}
			
			$("*[data-lr='lrDestination']").html(wayBillDestinationBranchName);

			if (responseOut.wayBillSourceBranchAddress != undefined) {
				$("*[data-lr='lrSourceAddress']").html(responseOut.wayBillSourceBranchAddress.replace(/ /g, "&nbsp;"));	
			}

			if (responseOut.wayBillDestinationBranchAddress != undefined) {
				$("*[data-lr='lrDestinationAddress']").html(responseOut.wayBillDestinationBranchAddress.replace(/ /g, "&nbsp;"));
			}
						
			if(responseOut.invoiceNumber != undefined && responseOut.invoiceNumber != 'NULL') {
				$("*[data-lr='consignorInvoiceNo']").html(responseOut.invoiceNumber);
			}
			
			$("*[data-lr='decalredValue']").html(responseOut.declaredValue);	
			
			$("*[data-lr='actualWeightConsignor']").html(responseOut.actualWeight);
			$("*[data-lr='chargedWeightConsignor']").html(responseOut.chargedWeight);
			$("*[data-lr='bookingServicetax']").html(responseOut.bookingTimeServiceTax);

			
            
			
			if(config.showDecimalValueAfterCharge == true || config.showDecimalValueAfterCharge == 'true') {
				if(config.showDecimalValueForGrandTotal	== true || config.showDecimalValueForGrandTotal	== 'true')
					$("*[data-lr='grandTotal']").html((parseFloat(responseOut.bookingTotal)));
				else
					$("*[data-lr='grandTotal']").html((Math.round(responseOut.bookingTotal + ".00")));
			} else if(config.BranchWiseDataHide == 'true' || config.BranchWiseDataHide == true) {
				var branchIdsToHide = config.branchIdsToHide;
				var branchArray 	= branchIdsToHide.split(",");
				var branchAllowed 	= isValueExistInArray(branchArray, responseOut.executiveBranchId);
					
				if(branchAllowed) {
					for(var index in bookingCharges) {
						if(bookingCharges[index].chargeTypeMasterId == FREIGHT) {
							$("*[data-lr='grandTotal']").html(Math.round(bookingCharges[index].wayBillBookingChargeChargeAmount));
							break;
						}
					}
				} else {
					$("*[data-lr='grandTotal']").html(Math.round(responseOut.bookingTotal));
				}
			} else if((config.showVisibleAmount == 'true' || config.showVisibleAmount == true) && bookingCharges != undefined && bookingCharges.length > 0) {
				let visibleFreightAmount	= this.getVisibleRate(responseOut);
				let freightAmount 			= bookingCharges[0].wayBillBookingChargeChargeAmount;
				
				if(visibleFreightAmount > 0)
					$("*[data-lr='grandTotal']").html(Math.round(responseOut.bookingTotal + visibleFreightAmount - freightAmount));
				else 
					$("*[data-lr='grandTotal']").html(Math.round(responseOut.bookingTotal));
			} else {
				$("*[data-lr='grandTotal']").html(Math.round(responseOut.bookingTotal));
				$("*[data-lr='grandTotalWithComma']").html((Math.round(responseOut.bookingTotal)).toLocaleString("en-US"));
			}

			
			$("*[data-lr='lrType']").html((responseOut.wayBillTypeName).toUpperCase());
			
			if(wayBillTypeId == WAYBILL_TYPE_PAID) {

				if(responseOut.consignmentSummaryPaymentType == PAYMENT_TYPE_CREDIT_ID) {
					$("*[data-lr='lrType']").html ((responseOut.wayBillTypeName).toUpperCase() + '- A/C');
				}
				
			}
			if(wayBillRemark != undefined && wayBillRemark != '') {
				$("*[data-lr='remark']").html(wayBillRemark);
			}
			
			
			
			$("*[data-lr='deliveryToAddress']").html(consignmentSummaryDeliveryToAddress);
			$("*[data-lr='totalQuantity']").html(responseOut.consignmentSummaryQuantity);
			

			var billSelectionId			= responseOut.billSelectionId;

			if(billSelectionId == BOOKING_WITHOUT_BILL) {
				$("*[data-selector='forCompanyName']").remove();
				$("*[data-selector='gstn']").remove();
				$("*[data-account='gstn']").remove();
			}

			if(config.removeRemarkLabel  == "true" && wayBillRemark == '') {
				$("*[data-selector='remark']").remove();
				$("*[data-lr='remark']").remove();
			}

			if(config.removeInvoiceLable  == "true" && responseOut.invoiceNumber == '') {
				$("*[data-selector='invoiceNo']").remove();
				$("*[data-lr='consignorInvoiceNo']").remove();
			}

			if($("*[data-lr='grandTotalInWord']").length != 0) {
				if(config.showDecimalValueForGrandTotal	== true || config.showDecimalValueForGrandTotal	== 'true')
					$("*[data-lr='grandTotalInWord']").html(convertNumberToWord(responseOut.bookingTotal));
				else
					$("*[data-lr='grandTotalInWord']").html(convertNumberToWord(Math.round(responseOut.bookingTotal)));
			}
			
			if (responseOut.consignmentSummaryInvDate != undefined && responseOut.consignmentSummaryInvDate != 'NULL')
				$("*[data-lr='consignorInvoiceDate']").html(responseOut.consignmentSummaryInvDate);
				
			var deliveryToString = responseOut.deliveryToString;
			if (deliveryToString == "select")
				$("*[data-lr='deliveryTo']").html("");
			else
				$("*[data-lr='deliveryTo']").html(deliveryToString);
					
			if (responseOut.sourceBranchGSTN != undefined) {
				$("*[data-lr='lrSrcBranchGstn']").html(responseOut.sourceBranchGSTN);
			}
			
			if (responseOut['formTypesObj_' + E_WAYBILL_ID] != undefined) {
				var formNumber = responseOut['formTypesObj_' + E_WAYBILL_ID];
				$("*[data-lr='EWayBillNo']").html(formNumber);
			}
			
			$("*[data-lr='vehicleNumber']").html(responseOut.vehicleNumber != undefined ? responseOut.vehicleNumber : "--");
			
			var wayBillSourceBranchMobileNumber = responseOut.wayBillSourceBranchMobileNumber;
			var wayBillSourceBranchPhoneNumber = responseOut.wayBillSourceBranchPhoneNumber;
			
			if (wayBillSourceBranchMobileNumber != undefined) {
				if (zerosReg.test(wayBillSourceBranchMobileNumber)) {
					$("*[data-lr='SourceMobileAndPhoneNumber']").html('(' + wayBillSourceBranchMobileNumber + ')')
				} else if (wayBillSourceBranchPhoneNumber != undefined && zerosReg.test(wayBillSourceBranchPhoneNumber)) {
					$("*[data-lr='SourceMobileAndPhoneNumber']").html('(' + wayBillSourceBranchPhoneNumber + ')');
				}
			} else if (wayBillSourceBranchPhoneNumber != undefined && zerosReg.test(wayBillSourceBranchPhoneNumber))
				$("*[data-lr='SourceMobileAndPhoneNumber']").html('(' + wayBillSourceBranchPhoneNumber + ')');
						
			var wayBillDestinationBranchPhoneNumber = responseOut.wayBillDestinationBranchPhoneNumber;
			var wayBillDestinationBranchMobileNumber = responseOut.wayBillDestinationBranchMobileNumber;
			
			if (wayBillDestinationBranchPhoneNumber && wayBillDestinationBranchPhoneNumber != undefined) {
				if (zerosReg.test(wayBillDestinationBranchPhoneNumber)) {
					$("*[data-lr='DestinationNumber']").html('(' + wayBillDestinationBranchPhoneNumber + ')')
				} else if (wayBillDestinationBranchMobileNumber != undefined && zerosReg.test(wayBillDestinationBranchMobileNumber))
					$("*[data-lr='DestinationNumber']").html('(' + wayBillDestinationBranchMobileNumber + ')');
			} else if (wayBillDestinationBranchMobileNumber != undefined && zerosReg.test(wayBillDestinationBranchMobileNumber)) {
				$("*[data-lr='DestinationNumber']").html('(' + wayBillDestinationBranchMobileNumber + ')');
			}				
			
			this.setSTPaidByDetails(responseOut);
			this.setBookingCharges(responseOut);
		}, setSTPaidByDetails : function(responseOut) {
			$("*[data-lr='taxPaidBy']").html(responseOut.consignmentSummaryTaxByString);
		}, setBookingCharges : function(responseOut){
			var classNameofName 		= $("*[data-chargename='dynamic']").attr('class');
			var classNameofVal 			= $("*[data-chargevalue='dynamic']").attr('class');
			var configuration 			= responseOut.configuration;
			var wayBillTypeId			= responseOut.wayBillTypeId;
			var chargeTypeModelArr		= responseOut.chargeTypeModelArr;

			if(configuration.removeStaticChargesTrWithZeroAmt  == "true") {
				var waybillBookingChargesList =  _.omit(responseOut.waybillBookingChargesList, function(value, key) {
					return value.wayBillBookingChargeChargeAmount == 0;
				});
				responseOut.waybillBookingChargesList = waybillBookingChargesList;
			}

			var bookingCharges 			= responseOut.waybillBookingChargesList
			var sortedBookingChargeList = _.sortBy(bookingCharges,'wayBillBookingChargeSequenceNumber');

			if((configuration.showZeroAmountInLr == true || configuration.showZeroAmountInLr == 'true') && responseOut.executiveType != EXECUTIVE_TYPE_GROUPADMIN && wayBillTypeId == WAYBILL_TYPE_CREDIT){
				sortedBookingChargeList	= '';
			}

			var tbody = $("*[data-chargevalue='dynamic']").parent().parent();
			
			let visibleFreightAmount	= _this.getVisibleRate(responseOut);
			
			for(var index in sortedBookingChargeList){
				var newtr = $("<tr/>")

				var newtdChargename = $("<td></td>");
				newtdChargename.attr("class",classNameofName);
				newtdChargename.attr("data-selector",'chargeName'+sortedBookingChargeList[index].chargeTypeMasterId);

				newtr.append(newtdChargename);
				
				var newtdChargeVal = $("<td></td>");
				newtdChargeVal.attr("class",classNameofVal);
				newtdChargeVal.attr("data-selector",'chargeValue'+sortedBookingChargeList[index].chargeTypeMasterId);
				newtr.append(newtdChargeVal);
				
				$(tbody).before(newtr);
			}

			var tbody 					= $("*[data-chargevaluewithoutname='dynamic']").parent().parent();

			for(var index in sortedBookingChargeList){
				var newtr = $("<tr/>")

				var newtdChargename = $("<td></td>");
				newtr.append(newtdChargename);

				var newtdChargeVal = $("<td></td>");
				newtdChargeVal.attr("class", $("*[data-chargevaluewithoutname='dynamic']").attr('class'));
				newtdChargeVal.attr("data-selector",'chargeValue'+sortedBookingChargeList[index].chargeTypeMasterId);
				newtr.append(newtdChargeVal);

				$(tbody).before(newtr);
			}

			for(var index in sortedBookingChargeList) {
				var chargeObj	= sortedBookingChargeList[index];
				
				if(chargeObj.chargeTypeMasterDisplayName != undefined)
					$("*[data-selector='chargeName" + chargeObj.chargeTypeMasterId + "']").html(chargeObj.chargeTypeMasterDisplayName);
				else
					$("*[data-selector='chargeName" + chargeObj.chargeTypeMasterId + "']").html(chargeObj.chargeTypeMasterName);

				if(configuration.showDecimalValueAfterCharge == true || configuration.showDecimalValueAfterCharge == 'true')
					$("*[data-selector='chargeValue" + chargeObj.chargeTypeMasterId + "']").html(Math.round(chargeObj.wayBillBookingChargeChargeAmount) + ".00");
				else if(configuration.showRoundOffValue == true || configuration.showRoundOffValue == 'true')
					$("*[data-selector='chargeValue" + chargeObj.chargeTypeMasterId + "']").html(Math.round(chargeObj.wayBillBookingChargeChargeAmount));
				else if(configuration.showVisibleAmount == 'true' || configuration.showVisibleAmount == true) {
					if(chargeObj.chargeTypeMasterId == FREIGHT && visibleFreightAmount > 0)
						$("*[data-selector='chargeValue" + chargeObj.chargeTypeMasterId + "']").html(visibleFreightAmount);
					else
						$("*[data-selector='chargeValue" + chargeObj.chargeTypeMasterId + "']").html(chargeObj.wayBillBookingChargeChargeAmount);
				}else
					$("*[data-selector='chargeValue" + chargeObj.chargeTypeMasterId + "']").html(chargeObj.wayBillBookingChargeChargeAmount);
				
			}

			if(configuration.showLRCharge == "true")
				this.setLRCharge(sortedBookingChargeList);
			
			if(configuration.addCarreirRiskandInsurance == "true")
				this.addCarreirRiskandInsurance(sortedBookingChargeList);

			$("*[data-chargevalue='dynamic']").parent().remove()
			if (responseOut.dummyWayBillId > 0) {
				$("*[data-lr='grandTotal']").html(0);
			}
			
			if(configuration.showZeroAmountInLRPrintForGstnNumber == "true") {
				var gstNumbersForZeroAmountInLRPrintArr  = responseOut.configuration.gstNumbersForZeroAmountInLRPrint.split(",");
				
				if(isValueExistInArray(gstNumbersForZeroAmountInLRPrintArr, responseOut.consignorGstn) || isValueExistInArray(gstNumbersForZeroAmountInLRPrintArr, responseOut.consigneeGstn) || isValueExistInArray(gstNumbersForZeroAmountInLRPrintArr, responseOut.billingPartyGstn)){
					for(var index in chargeTypeModelArr) {
						$("*[data-selector='chargeValue" + chargeTypeModelArr[index].chargeTypeMasterId + "']").html('0');
					}
			
					$("*[data-lr='grandTotal']").html('0');
				}
			}
			
		},setLRCharge : function(sortedBookingChargeList) {
			for(var index in sortedBookingChargeList) {
				if(Number(sortedBookingChargeList[index].chargeTypeMasterId) == LR_CHARGE) {
					if (Number(sortedBookingChargeList[index].wayBillBookingChargeChargeAmount) != 30) {
						$("*[data-selector='chargeValue"+sortedBookingChargeList[index].chargeTypeMasterId+"']").html(sortedBookingChargeList[index].wayBillBookingChargeChargeAmount);
					} 
				}
			}
		}, addCarreirRiskandInsurance : function(sortedBookingChargeList) {
			var carreirRiskCharge	= 0;
			
			for(var index in sortedBookingChargeList) {
				if(Number(sortedBookingChargeList[index].chargeTypeMasterId) == CARRIER_RISK_CHARGE || Number(sortedBookingChargeList[index].chargeTypeMasterId) == CR_INSUR_BOOKING) {
					if (Number(sortedBookingChargeList[index].wayBillBookingChargeChargeAmount) > 0) {
						carreirRiskCharge	+= sortedBookingChargeList[index].wayBillBookingChargeChargeAmount;
					} 
				}
			}
			
			$("*[data-selector='chargeValue121']").html(Math.round(carreirRiskCharge));
		},setConsignment:function(responseOut){
			var consignmentArr = responseOut.consignmentMap
			_this.setPackingTypeNameWithQuantity(consignmentArr, responseOut)
		
			
		}, getVisibleRate : function(responseOut) {
			let visibleWeightRate 	= responseOut.visibleRate;
			let consignmentArr 		= responseOut.consignmentMap;
			let weightFreightRate 	= responseOut.weigthFreightRate;
			let chargeWeight		= responseOut.chargedWeight;
			let visibleFreightAmount	= 0;
			
			if(responseOut.chargeTypeId == CHARGETYPE_ID_QUANTITY) {
				for(var index in consignmentArr) {
					if(consignmentArr[index].visibleRate != undefined && consignmentArr[index].visibleRate != 0)
						visibleFreightAmount += consignmentArr[index].quantity * consignmentArr[index].visibleRate;
					else if(consignmentArr[index].amount != 0)
						visibleFreightAmount += consignmentArr[index].quantity * consignmentArr[index].amount;
				}
			} else if (responseOut.chargeTypeId == CHARGETYPE_ID_WEIGHT) {
				if(visibleWeightRate != undefined && visibleWeightRate != 0)
					visibleFreightAmount += chargeWeight * visibleWeightRate;
				else 
					visibleFreightAmount += chargeWeight * weightFreightRate;
			}
			
			return visibleFreightAmount;
		}, setExecutiveDetails : function(responseOut,isPdfExportAllow) {
			$("*[data-executive='name']").html(responseOut.executiveName);
		},printWindow : function(isPdfExportAllow){
			if(!isPdfExportAllow){
				hideLayer();
				setTimeout(function(){ window.print();window.close();
				localStorage.removeItem("lrDataPrint");
				localStorage.removeItem("imageObjet");
				},500);
			}
			
		}, showPopUp : function(responseOut) {
			hideLayer();
			var showPopup = false;
			var conf = responseOut.configuration;
			var wayBillTypeId = responseOut.wayBillTypeId;
			var showLrPrintConfirmationPopup = responseOut.showLrPrintConfirmationPopup;
			var isWayBillTypeWisePopupAllowed = conf.isWayBillTypeWisePopupAllowed;
			isQRPrintOnPopUpSelection = conf.isQRPrintOnPopUpSelection;
			var bookingCharges = responseOut.waybillBookingChargesList;
			var chargeTypeModelArr = responseOut.chargeTypeModelArr;
			var partyIdsToShowBillingPartyWisePopupArr = responseOut.configuration.partyIdsToShowBillingPartyWisePopup.split(",");
			var showBillingPartyWisePopUpToHideCharges = responseOut.configuration.showBillingPartyWisePopUpToHideCharges;
			var billingPartyId = responseOut.billingPartyId;
			var isPdfExportAllow = responseOut.isPdfExportAllow;
			var _this = this;

			if (printFromDB)
				_this.printWindow(false);

			if (responseOut.bookingTypeId == BOOKING_TYPE_FTL_ID)
				$('.vehiclenoforbcm').show();
			else
				$('.vehiclenoforbcm').hide();

			$("*[data-popup='popup']").each(function() {
				showPopup = true;
			});

			$("*[data-popup='popup1']").each(function() {
				showPopup = true;
			});

			$("*[data-popup='popup2']").each(function() {
				showPopup = true;
			});

			if (isWayBillTypeWisePopupAllowed || isWayBillTypeWisePopupAllowed == true) {
				var wayBillTypeIdsForPopup = conf.wayBillTypeIdsForPopup;
				var wayBillTypeIdList = wayBillTypeIdsForPopup.split(',');

				showPopup = isValueExistInArray(wayBillTypeIdList, responseOut.wayBillTypeId);
			}

			if (conf.isPopupAskToPrintFor || conf.isPopupAskToPrintFor == true
				|| conf.showHidePrintData || conf.duplicatePrint
				|| ((conf.showPopForTopayFTLLr || conf.showPopForTopayFTLLr == true)
					&& wayBillTypeId == WAYBILL_TYPE_TO_PAY
					&& responseOut.bookingTypeId == BOOKING_TYPE_FTL_ID)
				|| ((showLrPrintConfirmationPopup || showLrPrintConfirmationPopup == true)
					&& (wayBillTypeId == WAYBILL_TYPE_PAID || wayBillTypeId == WAYBILL_TYPE_TO_PAY))
				|| (conf.showPopUpContentForQrCodeOption || conf.showPopUpContentForQrCodeOption == true)
				|| (conf.showPopUpContentForPaidChargesOption || conf.showPopUpContentForPaidChargesOption == true)) {
				showPopup = true;
			}

			if (conf.setCustomMarginFromCookie || conf.setCustomMarginFromCookie == true) {
				var LrFirstTableMarginTop = getCookie("LrFirstTableMarginTop");
				var LrSecondTableMarginTop = getCookie("LrSecondTableMarginTop");
				var LrThirdTableMarginTop = getCookie("LrThirdTableMarginTop");
				if (!jQuery.isEmptyObject(LrFirstTableMarginTop) && !jQuery.isEmptyObject(LrSecondTableMarginTop) && !jQuery.isEmptyObject(LrThirdTableMarginTop)) {
					$("#mainTable1").css("margin-top", "" + LrFirstTableMarginTop + "px");
					$("#mainTable2").css("margin-top", "" + LrSecondTableMarginTop + "px");
					$("#mainTable3").css("margin-top", "" + LrThirdTableMarginTop + "px");
					showPopup = false;
				}
			}
			
		if(showPopup) {
			
			
			$('#popUpContent407').bPopup({
				}, function() {

					var _thisMod = this;
					$(this).html("<div class='confirm' style='height:180px'><h1>Print option</h1><br><center>" +
						"<input type='checkbox' name='setAmount' id='setAmount' style='font-weight: bold;font-size: 20px;' unchecked />Print Charges</center> " +
						"<br><br><button type='button' name='cancel' id='cancel' class='btn-primary'>Cancel</button>" +
						"<button type='button' name='printCharges' id='printCharges' class='btn-primary' style='margin-left: 50px;'>Print</button>");

					$('.confirm').focus();
					$('#printCharges').focus();

					$("#cancel").click(function() {
						_thisMod.close();
						_this.setZeroAmount(chargeTypeModelArr);
						_this.printWindow();
					})

					$("#printCharges").click(function() {
						if ($("#setAmount").is(":checked")) {
							_thisMod.close();
							_this.printWindow();
						} else if ($("#setAmount").not(":checked")) {
							_this.setZeroAmount(chargeTypeModelArr);
							_thisMod.close();
							_this.printWindow();
						}
					});

				});
						
				
			} else if (isQRPrintOnPopUpSelection == "false" || isQRPrintOnPopUpSelection == false)
				_this.printWindow(isPdfExportAllow);
		}, setZeroAmount: function(chargeTypeModelArr) {
			for (var index in chargeTypeModelArr) {
				$("*[data-consignor-selector='chargeValue" + chargeTypeModelArr[index].chargeTypeMasterId + "']").html('0');
				$("*[data-selector='chargeValue" + chargeTypeModelArr[index].chargeTypeMasterId + "']").html('0');
				$("*[data-consignorLrCharges='chargeValue" + chargeTypeModelArr[index].chargeTypeMasterId + "']").html('0');
			}

			$("*[data-lr='grandTotal']").html('0');
			$("*[data-lr='bookingServicetax']").html('0');
			$("*[data-lr='bookingReceived']").html('0');
			$("*[data-lr='bookingBalance']").html('0');
			$("*[data-lr='chargeSum']").html('0');
			$("*[data-lr='advanceAmount']").html('0');
			$("*[data-consignorLrCharges='chargeSum']").html('0');
			$("*[data-consignorLrCharges='grandTotal']").html('0');
			$("*[data-lr='grandTotalInWord']").html("Zero");
			$("*[data-gst='sgst']").html('0');
			$("*[data-gst='cgst']").html('0');
			$("*[data-gst='igst']").html('0');
			$("*[data-gst='consignorsgst']").html('0');
			$("*[data-gst='consignorcgst']").html('0');
			$("*[data-gst='consignorigst']").html('0');
			$("*[data-gst='consigneeigst']").html('0');
			$("*[data-gst='transporterigst']").html('0');
		}, setCurrentDateTime : function(responseOut) {
			$("*[data-time='current']").html(responseOut.currentTime);
			$("*[data-date='current']").html(responseOut.currentDate);
		}, setPackingTypeNameWithQuantity : function(consignmentArr, responseOut) {
			for(var index in consignmentArr) {
				var pos 			= Number(index) + Number(1);
				var qty				= consignmentArr[index].quantity;
				var packingTypeName = consignmentArr[index].packingTypeName;
				var saidToContain	= consignmentArr[index].saidToContain;
				
				$("*[data-consignmentquantity='" + (pos) + "']").html(qty);
				$("*[data-consignmentpackingtype='" + (pos) + "']").html(packingTypeName);
				$("*[data-consignmentseperator='" + (pos) + "']").html('of ');
				$("*[data-consignmentsaidtocontain='" + (pos) + "']").html(saidToContain);
			}
		}
	});
});	

function getCookie(cookieName) {
	var name = cookieName + "=";
	var decodedCookie = decodeURIComponent(document.cookie);
	var cookieArray = decodedCookie.split(';');
	for (var i = 0; i < cookieArray.length; i++) {
		var cookie = cookieArray[i];
		while (cookie.charAt(0) === ' ') {
			cookie = cookie.substring(1);
		}
		if (cookie.indexOf(name) === 0) {
			return cookie.substring(name.length, cookie.length);
		}
	}
	return "";
}