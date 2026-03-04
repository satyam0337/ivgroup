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
			
			if (zerosReg.test(responseOut.consignorPhn)) {
				var customerDetailsphoneNumber = responseOut.consignorPhn;
				$("*[data-consignor='numberwithbracket']").html('(' + customerDetailsphoneNumber + ')');
			}
			
			if (zerosReg.test(responseOut.consigneePhn)) {
				var customerDetailsphoneNumber = responseOut.consigneePhn;
				$("*[data-consignee='numberwithbracket']").html('(' + customerDetailsphoneNumber + ')');
			}
			
		}, setLrDetails : function(responseOut) {
			
			var config					= responseOut.configuration;
			var wayBillSourceBranchName			= responseOut.wayBillSourceBranchName;
			var wayBillSourceBranchPhoneNumber = responseOut.wayBillSourceBranchPhoneNumber;
			var wayBillSourceBranchMobileNumber = responseOut.wayBillSourceBranchMobileNumber;
			var wayBillDestinationBranchName	= responseOut.wayBillDestinationBranchName;
			var wayBillDestinationBranchMobileNumber	= responseOut.wayBillDestinationBranchMobileNumber;
			var wayBillDestinationBranchPhoneNumber = responseOut.wayBillDestinationBranchPhoneNumber;
			var wayBillTypeId							= responseOut.wayBillTypeId;
			var wayBillRemark							= responseOut.wayBillRemark;
			var consignmentSummaryDeliveryToAddress		= responseOut.consignmentSummaryDeliveryToAddress;
 			var bookingCharges      					= responseOut.waybillBookingChargesList;
			var deliveryToString 							= responseOut.deliveryToString;

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
			
			if (responseOut.sourceBranchCode != undefined)
				$("*[data-lr='lrSourceBranchCode']").html(responseOut.sourceBranchCode);
			
			if (wayBillSourceBranchPhoneNumber != undefined) {
				if (zerosReg.test(wayBillSourceBranchPhoneNumber)) {
					$("*[data-lr='SourceNumber']").html('(' + wayBillSourceBranchPhoneNumber + ')');
				} else if (wayBillSourceBranchMobileNumber != undefined && zerosReg.test(wayBillSourceBranchMobileNumber)) {
					$("*[data-lr='SourceNumber']").html('(' + wayBillSourceBranchMobileNumber + ')');
				}
			} else if (wayBillSourceBranchMobileNumber != undefined && zerosReg.test(wayBillSourceBranchMobileNumber)) {
				$("*[data-lr='SourceNumber']").html('(' + wayBillSourceBranchMobileNumber + ')');
			}
			
			$("*[data-lr='lrDestination']").html(wayBillDestinationBranchName);
			
			if (wayBillDestinationBranchPhoneNumber && wayBillDestinationBranchPhoneNumber != undefined) {
				if (config.changeDestinationBranchNameInPrint) {
					if (responseOut.wayBillMappedDestinationBranchId > 0)
						$("*[data-lr='MappedDestinationBranchPhoneNumber']").html('(' + responseOut.wayBillMappedDestinationBranchPhoneNumber + ')')
					else if (zerosReg.test(wayBillDestinationBranchPhoneNumber))
						$("*[data-lr='MappedDestinationBranchPhoneNumber']").html('(' + wayBillDestinationBranchPhoneNumber + ')')
					else if (wayBillDestinationBranchMobileNumber != undefined && zerosReg.test(wayBillDestinationBranchMobileNumber))
						$("*[data-lr='MappedDestinationBranchPhoneNumber']").html('(' + wayBillDestinationBranchMobileNumber + ')')
				}

				if (zerosReg.test(wayBillDestinationBranchPhoneNumber)) {
					$("*[data-lr='DestinationNumber']").html('(' + wayBillDestinationBranchPhoneNumber + ')')
					$("*[data-lr='DestinationNumber1']").html(wayBillDestinationBranchPhoneNumber)
				} else if (wayBillDestinationBranchMobileNumber != undefined && zerosReg.test(wayBillDestinationBranchMobileNumber))
					$("*[data-lr='DestinationNumber']").html('(' + wayBillDestinationBranchMobileNumber + ')');
			} else if (wayBillDestinationBranchMobileNumber != undefined && zerosReg.test(wayBillDestinationBranchMobileNumber)) {
				$("*[data-lr='DestinationNumber']").html('(' + wayBillDestinationBranchMobileNumber + ')');

				if (config.changeDestinationBranchNameInPrint) {
					if (responseOut.wayBillMappedDestinationBranchId > 0)
						$("*[data-lr='MappedDestinationBranchPhoneNumber']").html('( ' + responseOut.wayBillMappedDestinationBranchPhoneNumber + ')')
					else
						$("*[data-lr='MappedDestinationBranchPhoneNumber']").html('( ' + wayBillDestinationBranchMobileNumber + ')')
				}
			}

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
			
			$("*[data-lr='actualWeight']").html(responseOut.actualWeight);
			$("*[data-lr='actualWeightConsignor']").html(responseOut.actualWeight);
			$("*[data-lr='chargedWeightConsignor']").html(responseOut.chargedWeight);
			$("*[data-lr='bookingServicetax']").html(responseOut.bookingTimeServiceTax);
			$("*[data-lr='privateMark']").html(responseOut.privateMark);

			
            
			
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
			$("*[data-lr='bookingTypeName']").html(responseOut.bookingTypeName);
			
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
			
			if (deliveryToString == "select")
				$("*[data-lr='deliveryTo']").html("");
			else
				$("*[data-lr='deliveryTo']").html(deliveryToString);
						
			$("*[data-lr='BillingPartyName']").html(responseOut.billingPartyName);
			
			if (responseOut.chargeTypeId == CHARGETYPE_ID_QUANTITY) {
				if (wayBillTypeId != WAYBILL_TYPE_CREDIT) {
					$("*[data-lr='rate']").html(responseOut.articleRate + '/Art');
				} else {
					$("*[data-lr='rate']").html(responseOut.articleRate);
				}
			} else if (responseOut.chargeTypeId == CHARGETYPE_ID_WEIGHT) {
				if (wayBillTypeId != WAYBILL_TYPE_CREDIT) {
					$("*[data-lr='rate']").html(responseOut.weigthFreightRate + '/Kg');
				} else {
					$("*[data-lr='rate']").html(responseOut.weigthFreightRate);
				}
			}
			
			if (config.showActualAndChargedWeightInMerticTon) {
				var actualWeightInMetric = responseOut.actualWeight;
				var chargeWeightInMetric = responseOut.chargedWeight;

				if (responseOut.bookingTypeId == DIRECT_DELIVERY_DIRECT_VASULI_ID) {
					if (wayBillTypeId != WAYBILL_TYPE_CREDIT)
						$("*[data-lr='weightRateTbb']").html(responseOut.weigthFreightRate + '/MT');

					$("*[data-lr='chargedWeight']").html((chargeWeightInMetric / 1000).toFixed(3));
					$("*[data-lr='actualWeight']").html((actualWeightInMetric / 1000).toFixed(3));
					$("*[data-lr='rate']").html(responseOut.weigthFreightRate + '/MT');
					$('#chargedWeightMeticTon').show();
					$('#actualWeightMeticTon').show();
					$('#frigthValue').show();
				} else {
					$("*[data-lr='chargedWeight']").html(chargeWeightInMetric);
					$("*[data-lr='actualWeight']").html(actualWeightInMetric);
				}
			}
			
			$("*[data-lr='chargeSum']").html(responseOut.bookingChargesSum);
			
			if (responseOut['formTypesObj_' + E_WAYBILL_ID] != undefined) {
				var formNumber = responseOut['formTypesObj_' + E_WAYBILL_ID];
				$("*[data-lr='EWayBillNo']").html(formNumber);
			}
			
			if (wayBillTypeId == WAYBILL_TYPE_CREDIT) {
				$("*[data-lr='BillingPartyName']").html(responseOut.billingPartyName);
			} else {
				$(".billingParty").hide();
			}
			
			$("*[data-lr='insuredBy']").html(responseOut.insuredBy);
			
			if (Number(responseOut.bookingTimeServiceTax) == 0)
				$(".servicetaxlabel").remove();
					
					
			var isRePrint = responseOut.isReprint;
			if (isRePrint) {
				$("*[data-lr='lrTypeWithDuplicateKeyword']").html("( Duplicate )");
			} else {
				$("*[data-lr='lrTypeWithDuplicateKeyword']").html(" ");
			}
						
			this.setSTPaidByDetails(responseOut);
			this.setBookingCharges(responseOut);
		}, setSTPaidByDetails : function(responseOut) {
			$("*[data-lr='taxPaidBy']").html(responseOut.consignmentSummaryTaxByString);
			var STPaidBy = responseOut.STPaidBy;
			
			if (STPaidBy == TAX_PAID_BY_CONSINGOR_ID) {
				$("*[data-lr='taxPaidByConsignorConsignee']").html('Consignor/Consignee');
			} else if (STPaidBy == TAX_PAID_BY_CONSINGEE_ID) {
				$("*[data-lr='taxPaidByConsignorConsignee']").html('Consignor/Consignee');
			}
			
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
		},setConsignment: function(responseOut) {
			var showQuantity = false;
			var showPackingType = false;
			var showSaidToContain = false;
			var showSaidToContain1 = false;
			var showSeperater = false;
			var showRateAmount = false;
			var showSerialNo = false;
			var freight = false;
			var freightAmount = 0;
			var cftLength = false;
			var cftHeight = false;
			var cftBreadth = false;
			var length = false;
			var breadth = false;
			var height = false;
			var config = responseOut.configuration;
			var wayBillTypeId = responseOut.wayBillTypeId;
			var chargedWeight = false;

			var consignmentArr = responseOut.consignmentMap
			var classNameofSerialNO = $("*[data-consignmentserialNo='dynamic']").attr('class');
			var classNameofQty = $("*[data-consignmentquantity='dynamic']").attr('class');
			var classNameofPackingType = $("*[data-consignmentpackingtype='dynamic']").attr('class');
			var classNameofSeperator = $("*[data-consignmentseperator='dynamic']").attr('class');
			var classNameofSaidToContain = $("*[data-consignmentsaidtocontain='dynamic']").attr('class');
			var classNameofSaidToContain1 = $("*[data-consignmentsaidtocontain1='dynamic']").attr('class');
			var classNameofRateAmount = $("*[data-consignmentrateamount='dynamic']").attr('class');
			var classNameofFreightAmount = $("*[data-consignmentfreightamount='dynamic']").attr('class');
			var classNameofFreightAmountPaid = $("*[data-consignmentfreightamountPaid='dynamic']").attr('class');
			var classNameofChargedWeight = $("*[data-consignmentChargedWeight='dynamic']").attr('class');

			if (config.showLBHOnPrint && responseOut.cftWeight > 0) {

				var classNameofCFTLength = $("*[data-consignmentcftlength='dynamic']").attr('class');
				var classNameofCFTBreadth = $("*[data-consignmentcftbreadth='dynamic']").attr('class');
				var classNameofCFTHeight = $("*[data-consignmentcftheight='dynamic']").attr('class');
				var classNameofLength = $("*[data-consignmentlength='dynamic']").attr('class');
				var classNameofBreadth = $("*[data-consignmentbreadth='dynamic']").attr('class');
				var classNameofHeight = $("*[data-consignmentheight='dynamic']").attr('class');

				$("*[data-consignmentcftweight='dynamic']").each(function() {
					cftWeight = true;
				});

				$("*[data-consignmentcftlength='dynamic']").each(function() {
					cftLength = true;
				});

				$("*[data-consignmentcftbreadth='dynamic']").each(function() {
					cftBreadth = true;
				});

				$("*[data-consignmentcftheight='dynamic']").each(function() {
					cftHeight = true;
				});

				$("*[data-consignmentlength='dynamic']").each(function() {
					length = true;
				});

				$("*[data-consignmentbreadth='dynamic']").each(function() {
					breadth = true;
				});

				$("*[data-consignmentheight='dynamic']").each(function() {
					height = true;
				});

			}

			$("*[data-consignmentquantity='dynamic']").each(function() {
				showQuantity = true;
			});

			$("*[data-consignmentpackingtype='dynamic']").each(function() {
				showPackingType = true;
			});

			$("*[data-consignmentseperator='dynamic']").each(function() {
				showSeperater = true;
			});
			$("*[data-consignmentrateamount='dynamic']").each(function() {
				showRateAmount = true;
			});

			$("*[data-consignmentsaidtocontain='dynamic']").each(function() {
				showSaidToContain = true;
			});

			$("*[data-consignmentsaidtocontain1='dynamic']").each(function() {
				showSaidToContain1 = true;
			});

			$("*[data-consignmentserialNo='dynamic']").each(function() {
				showSerialNo = true;
			});

			$("*[data-consignmentfreightamount='dynamic']").each(function() {
				freight = true;
			});

			$("*[data-consignmentfreightamountPaid='dynamic']").each(function() {
				freight = true;
			});

			$("*[data-consignmentChargedWeight='dynamic']").each(function() {
				chargedWeight = true;
			});


			var tbody = $("*[data-consignmentquantity='dynamic']").parent().parent();
			var tbody1 = "";

			if ((config.hideAllChargesInConsignorCopyForPaidLr == true || config.hideAllChargesInConsignorCopyForPaidLr) && wayBillTypeId == WAYBILL_TYPE_PAID)
				tbody1 = $("*[data-consignmentfreightamountPaid='dynamic']").parent().parent();
			else
				tbody1 = $("*[data-consignmentfreightamount='dynamic']").parent().parent();

			var count = 1;

			for (var index in consignmentArr) {
				var newtr = $("<tr/>")
				var newtr1 = $("<tr/>")

				if (consignmentArr[index].amount != 0)
					freightAmount = consignmentArr[index].quantity * consignmentArr[index].amount;
				else
					freightAmount = responseOut.chargeAmount;

				if (showSerialNo) {
					var newtdSrNO = $("<td></td>");
					newtdSrNO.attr("class", classNameofSerialNO);
					newtdSrNO.attr("data-selector", 'sNo' + index);
					newtdSrNO.html(count++);
					newtr.append(newtdSrNO);
				}

				if (showQuantity) {
					var newtdQuantity = $("<td></td>");
					newtdQuantity.attr("class", classNameofQty);
					newtdQuantity.attr("data-selector", 'qty' + consignmentArr[index].consignmentDetailsId);
					newtr.append(newtdQuantity);
				}

				if (showPackingType) {
					var newtdPackingType = $("<td></td>");
					newtdPackingType.attr("class", classNameofPackingType);
					newtdPackingType.attr("data-selector", 'packingtype' + consignmentArr[index].consignmentDetailsId);
					newtr.append(newtdPackingType);
				}

				if (showSeperater) {
					var newtdSeperator = $("<td></td>");
					newtdSeperator.attr("class", classNameofSeperator);
					newtdSeperator.attr("data-selector", 'seperator');
					newtr.append(newtdSeperator);
				}

				if (showSaidToContain) {
					var newtdSaidToContain = $("<td></td>");
					newtdSaidToContain.attr("class", classNameofSaidToContain);
					newtdSaidToContain.attr("data-selector", 'saidToCOntain' + consignmentArr[index].consignmentDetailsId);
					newtr.append(newtdSaidToContain);
				}

				if (showSaidToContain1) {
					var newtdSaidToContain = $("<td></td>");
					newtdSaidToContain.attr("class", classNameofSaidToContain1);
					newtdSaidToContain.attr("data-selector", 'saidToCOntain1' + consignmentArr[index].consignmentDetailsId);
					newtr.append(newtdSaidToContain);
				}

				if (showRateAmount) {
					var newtdSaidToContain = $("<td></td>");
					newtdSaidToContain.attr("class", classNameofRateAmount);
					newtdSaidToContain.attr("data-selector", 'amount' + consignmentArr[index].consignmentDetailsId);
					newtr.append(newtdSaidToContain);
				}

				if (chargedWeight) {
					var newtdChargedWeight = $("<td></td>");
					newtdChargedWeight.attr("class", classNameofChargedWeight);
					newtdChargedWeightn.attr("data-selector", 'ChargedWeight' + consignmentArr[index].consignmentDetailsId);
					newtr.append(newtdChargedWeight);
				}

				if (freight) {
					var newtdfreight = $("<td></td>");

					if ((config.hideAllChargesForTbbLr == true || config.hideAllChargesForTbbLr) && wayBillTypeId == WAYBILL_TYPE_CREDIT) {
						newtdfreight.attr("class", classNameofFreightAmount + "hideAllCharge");
					} else if ((config.hideAllChargesInConsignorCopyForPaidLr == true || config.hideAllChargesInConsignorCopyForPaidLr)) {
						if (wayBillTypeId == WAYBILL_TYPE_PAID) {
							newtdfreight.attr("class", classNameofFreightAmountPaid);
						} else {
							newtdfreight.attr("class", classNameofFreightAmountPaid + "hideAllChargeForPaid");
							newtdfreight.attr("class", classNameofFreightAmount + "hideSelectorForTopay");
						}
					} else {
						newtdfreight.attr("class", classNameofFreightAmount);
					}

					newtdfreight.attr("data-selector", 'freight' + index);
					newtdfreight.html(freightAmount);
					newtr1.append(newtdfreight);
				}

				if (config.showLBHOnPrint && responseOut.cftWeight > 0) {
					if (cftLength) {
						var newtdcftLength = $("<td></td>");
						newtdcftLength.attr("class", classNameofCFTLength);
						newtdcftLength.attr("data-selector", 'cftLength' + consignmentArr[index].consignmentDetailsId);
						//newtdcftWeight.html(freightAmount);
						newtr1.append(newtdcftLength);
					}

					if (cftHeight) {
						var newtdcftHeight = $("<td></td>");
						newtdcftHeight.attr("class", classNameofCFTHeight);
						newtdcftHeight.attr("data-selector", 'freight' + consignmentArr[index].consignmentDetailsId);
						//newtdfreight.html(freightAmount);
						newtr1.append(newtdcftHeight);
					}

					if (cftBreadth) {
						var newtdcftBreadth = $("<td></td>");
						newtdcftBreadth.attr("class", classNameofCFTBreadth);
						newtdcftBreadth.attr("data-selector", 'cftBreadth' + consignmentArr[index].consignmentDetailsId);
						//newtdcftBreadth.html(freightAmount);
						newtr1.append(newtdcftBreadth);
					}

					if (length) {
						var newtdlength = $("<td></td>");
						newtdlength.attr("class", classNameofLength);
						newtdlength.attr("data-selector", 'length');
						newtr.append(newtdlength);
					}

					if (breadth) {
						var newtdbreadth = $("<td></td>");
						newtdbreadth.attr("class", classNameofBreadth);
						newtdbreadth.attr("data-selector", 'breadth');
						newtr.append(newtdbreadth);
					}

					if (height) {
						var newtdheight = $("<td></td>");
						newtdheight.attr("class", classNameofHeight);
						newtdheight.attr("data-selector", 'height');
						newtr.append(newtdheight);
					}
				}

				$(tbody).before(newtr);
				$(tbody1).before(newtr1);
			}

			if ((config.hideAllChargesForTbbLr == true || config.hideAllChargesForTbbLr) && wayBillTypeId == WAYBILL_TYPE_CREDIT)
				$(".hideAllCharge").html("TBB");

			if (wayBillTypeId == WAYBILL_TYPE_PAID)
				$(".hideAllChargePaidForSakar").html(" ");

			if (wayBillTypeId == WAYBILL_TYPE_TO_PAY)
				$(".hideAllChargeTopayForSakar").html(" ");

			if (wayBillTypeId == WAYBILL_TYPE_CREDIT)
				$(".hideAllChargeTBBForSakar").html(" ");


			if ((config.hideAllChargesInConsignorCopyForPaidLr == true || config.hideAllChargesInConsignorCopyForPaidLr)) {
				if (wayBillTypeId == WAYBILL_TYPE_PAID)
					$(".hideSelectorForTopay").hide();
				else
					$(".hideAllChargeForPaid").hide();

			}
			this.setPackingTypeNameWithQuantity(consignmentArr, responseOut)
			this.setConsignmentReverseOrder(responseOut)
		}, setConsignmentReverseOrder: function(responseOut) {
			var showQuantity = false;
			var showPackingType = false;
			var showSaidToContain = false;
			var showSeperater = false;
			var showAmount = false;
	
			var consignmentArr = responseOut.consignmentMap;
			var classNameofQty = $("*[data-consignmentquantityreverse='dynamic']").attr('class');
			var classNameofPackingType = $("*[data-consignmentpackingtypereverse='dynamic']").attr('class');
			var classNameofSeperator = $("*[data-consignmentseperatorreverse='dynamic']").attr('class');
			var classNameofSaidToContain = $("*[data-consignmentsaidtocontainreverse='dynamic']").attr('class');
			var classNameofAmount = $("*[data-consignmentamountreverse='dynamic']").attr('class');
			var classNameofChargedWeight = $("*[data-consignmentChargedWeightreverse='dynamic']").attr('class');
	
			$("*[data-consignmentquantityreverse='dynamic']").each(function() {
				showQuantity = true;
			});
	
			$("*[data-consignmentpackingtypereverse='dynamic']").each(function() {
				showPackingType = true;
			});
	
			$("*[data-consignmentseperatorreverse='dynamic']").each(function() {
				showSeperater = true;
			});
	
			$("*[data-consignmentsaidtocontainreverse='dynamic']").each(function() {
				showSaidToContain = true;
			});
	
			$("*[data-consignmentamountreverse='dynamic']").each(function() {
				showAmount = true;
			});
	
			var tbody = $("*[data-consignmentquantityreverse='dynamic']").parent().parent();
	
			for (var index in consignmentArr) {
				var newtr = $("<tr/>")
	
				if (showPackingType) {
					var newtdPackingType = $("<td></td>");
					newtdPackingType.attr("class", classNameofPackingType);
					newtdPackingType.attr("data-selector", 'packingtype' + consignmentArr[index].consignmentDetailsId);
					newtr.append(newtdPackingType);
				}
	
				if (showSeperater) {
					var newtdSeperator = $("<td></td>");
					newtdSeperator.attr("class", classNameofSeperator);
					newtdSeperator.attr("data-selector", 'seperator');
					newtr.append(newtdSeperator);
				}
	
				if (showSaidToContain) {
					var newtdSaidToContain = $("<td></td>");
					newtdSaidToContain.attr("class", classNameofSaidToContain);
					newtdSaidToContain.attr("data-selector", 'saidToCOntain' + consignmentArr[index].consignmentDetailsId);
					newtr.append(newtdSaidToContain);
				}
	
				if (showQuantity) {
					var newtdQuantity = $("<td></td>");
					newtdQuantity.attr("class", classNameofQty);
					newtdQuantity.attr("data-selector", 'qty' + consignmentArr[index].consignmentDetailsId);
					newtr.append(newtdQuantity);
				}
	
				if (showAmount) {
					var newtdChargedWeight = $("<td></td>");
					newtdAmount.attr("class", classNameofChargedWeight);
					newtdAmount.attr("data-selector", 'amount' + consignmentArr[index].consignmentDetailsId);
					newtr.append(newtdChargedWeight);
				}
	
				if (showAmount) {
					var newtdAmount = $("<td></td>");
					newtdAmount.attr("class", classNameofAmount);
					newtdAmount.attr("data-selector", 'amount' + consignmentArr[index].consignmentDetailsId);
					newtr.append(newtdAmount);
				}
				if (showAmount) {
					var newtdPrivateMark = $("<td></td>");
					newtdAmount.attr("class", newtdPrivateMark);
					newtdAmount.attr("data-selector", 'amount' + consignmentArr[index].consignmentDetailsId);
					newtr.append(newtdAmount);
				}
	
				$(tbody).before(newtr);
	
				$("*[data-selector='qty" + consignmentArr[index].consignmentDetailsId + "']").html(consignmentArr[index].quantity);
				$("*[data-selector='packingtype" + consignmentArr[index].consignmentDetailsId + "']").html(consignmentArr[index].packingTypeName);
				$("*[data-selector='saidToCOntain" + consignmentArr[index].consignmentDetailsId + "']").html(consignmentArr[index].saidToContain);
				$("*[data-selector='amount" + consignmentArr[index].consignmentDetailsId + "']").html(consignmentArr[index].amount);
			}
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
			$('#popUpContent233').bPopup({
				}, function() {
					var _thisMod = this;
					var header;
					$(this).html("<div class='confirm'><table align='center'><tr><td colspan='2' style='text-align:center'><h1>Lr Print Options</h1>Edit LR Details<br/><br/></td></tr>"
						+ "<tr><td><input type='radio' name='actualWeight' value='true' checked>Show Actual Weight</td>"
						+ "<td><input type='radio'  name='actualWeight' value='false'>Hide Actual Weight</td></tr>"
						+ "<tr><td><input type='radio' name='chargedWeight' value='true' checked>Show Charged Weight</td>"
						+ "<td><input type='radio' name='chargedWeight' value='false'>Hide Charged Weight</td></tr>"
						+ "<tr><td><input type='radio' name='rate' value='true' checked >Show Rate</td>"
						+ "<td><input type='radio' name='rate' value='false'>Hide Rate</td></tr>"
						+ "<tr ><td class='headerbato'  ><input type='radio' name='header' value='true'  >Show Header</td>"
						+ "<td class='headerbato'><input type='radio' name='header' value='false' checked>Hide Header</td></tr></table>"
						+ "<button id='cancelButton'>NO</button><button autofocus id='confirm'>YES</button></div></div>")
					var actualWeightVal;
					var chargedWeightVal;
					var rateVal;
					$('#confirm').focus();

					if (responseOut.headerPopContentForLr == false || responseOut.headerPopContentForLr == 'false')
						$('.headerbato').hide();

					$("#confirm").click(function() {
						$("#batoLRPrintTable_3").css({ 'margin-top': '912px' });
						$("#batoLRPrintTable_3").css({ 'position': 'absolute' });
						$("#batoLRPrintTable_2").css({ 'margin-top': '500px' });
						$("#batoLRPrintTable_2").css({ 'position': 'absolute' });
						$("#batoLRPrintTable_1").css({ 'margin-top': '100px' });
						$("#batoLRPrintTable_1").css({ 'position': 'absolute' });
						actualWeightVal = $("input[name='actualWeight']:checked").val();
						if (actualWeightVal == 'false') {
							$("*[data-selector='actualWeightConsignor']").remove();
							$("*[data-lr='actualWeightConsignor']").remove();
							$("*[data-selector='actualWeightConsignee']").remove();
							$("*[data-lr='actualWeightConsignee']").remove();

						}
						chargedWeightVal = $("input[name='chargedWeight']:checked").val();
						if (chargedWeightVal == 'false') {
							$("*[data-selector='chargedWeightConsignor']").remove();
							$("*[data-lr='chargedWeightConsignor']").remove();
							$("*[data-selector='chargedWeightConsignee']").remove();
							$("*[data-lr='chargedWeightConsignee']").remove();
						}
						rateVal = $("input[name='rate']:checked").val();
						if (rateVal == 'false') {
							$("*[data-selector='rateConsignor']").remove();
							$("*[data-lr='rateConsignor']").remove();
							$("*[data-selector='rateConsignee']").remove();
							$("*[data-lr='rateConsignee']").remove();
						}
						header = $("input[name='header']:checked").val();
						if (responseOut.headerPopContentForLr == true || responseOut.headerPopContentForLr) {
							if (header == 'false') {
								$('.headerTable').hide();
							} else {
								$('.headerTable').show();
								$("#batoLRPrintTable_3").css({ 'margin-top': '912px' });
								$("#batoLRPrintTable_3").css({ 'position': 'absolute' });
								$("#batoLRPrintTable_2").css({ 'margin-top': '500px' });
								$("#batoLRPrintTable_2").css({ 'position': 'absolute' });
								$("#batoLRPrintTable_1").css({ 'margin-top': '100px' });
								$("#batoLRPrintTable_1").css({ 'position': 'absolute' });
							}
						}
						_thisMod.close();
						_this.printWindow(isPdfExportAllow);
					})

					$("#confirm").on('keydown', function(e) {
						if (e.which == 27) {  //escape
							_thisMod.close();
							window.close();

						}
					});

					$("#cancelButton").click(function() {
						$("#batoLRPrintTable_3").css({ 'margin-top': '912px' });
						$("#batoLRPrintTable_3").css({ 'position': 'absolute' });
						$("#batoLRPrintTable_2").css({ 'margin-top': '500px' });
						$("#batoLRPrintTable_2").css({ 'position': 'absolute' });
						$("#batoLRPrintTable_1").css({ 'margin-top': '100px' });
						$("#batoLRPrintTable_1").css({ 'position': 'absolute' });
						_thisMod.close();
						_this.printWindow(isPdfExportAllow);
					})

				});
				
			} else if (isQRPrintOnPopUpSelection == "false" || isQRPrintOnPopUpSelection == false)
				_this.printWindow(isPdfExportAllow);		
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
