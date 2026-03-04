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
                    _this.setExecutiveDetails(responseOut)
                    _this.setCurrentDateTime(responseOut)
                    _this.setQRDetails(responseOut)
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
		}, setLrDetails : function(responseOut) {
			
			var config					= responseOut.configuration;
			var wayBillSourceCityName = responseOut.wayBillSourceCityName;
			var wayBillSourceBranchName			= responseOut.wayBillSourceBranchName;
			var wayBillDestinationCityName = responseOut.wayBillDestinationCityName;
			var wayBillDestinationBranchName	= responseOut.wayBillDestinationBranchName;
			var wayBillDestinationBranchMobileNumber	= responseOut.wayBillDestinationBranchMobileNumber;
			var wayBillDestinationBranchPhoneNumber     = responseOut.wayBillDestinationBranchPhoneNumber;
			var wayBillTypeId							= responseOut.wayBillTypeId;
			var wayBillRemark							= responseOut.wayBillRemark;
			var consignmentSummaryDeliveryToAddress		= responseOut.consignmentSummaryDeliveryToAddress;
 			var bookingCharges      					= responseOut.waybillBookingChargesList;
			//START :: Advance and Balance Calculation for Abbas LR Print - Ravi Prajapati
				
			$("*[data-lr='number']").html(responseOut.wayBillNumber);
			

			if(config.isCTFormConditionRequired == 'true' && responseOut.consignmentSummaryFormTypeId == CT_FORM_NOT_RECEIVED_ID)
				$("*[data-lr='number']").html("***" + responseOut.wayBillNumber);
			
			$("*[data-lr='date']").html(responseOut.bookingDateTimeString);
			$("*[data-lr='time']").html(responseOut.bookingTimeString);
			
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

			$("*[data-lr='lrCityWithSource']").html(wayBillSourceCityName + ' ( ' + wayBillSourceBranchName + ' )');
			
			$("*[data-lr='lrDestination']").html(wayBillDestinationBranchName);
			
			$("*[data-lr='lrCityWithDestination']").html(wayBillDestinationCityName + ' ( ' + wayBillDestinationBranchName + ' )');

			if (responseOut.wayBillSourceBranchAddress != undefined) {
				$("*[data-lr='lrSourceAddress']").html(responseOut.wayBillSourceBranchAddress.replace(/ /g, "&nbsp;"));	
			}

			if (responseOut.wayBillDestinationBranchAddress != undefined) {
				$("*[data-lr='lrDestinationAddress']").html(responseOut.wayBillDestinationBranchAddress.replace(/ /g, "&nbsp;"));
			}
			
			if (wayBillDestinationBranchPhoneNumber && wayBillDestinationBranchPhoneNumber != undefined) {

				if (zerosReg.test(wayBillDestinationBranchPhoneNumber)) {
					$("*[data-lr='DestinationNumber']").html('(' + wayBillDestinationBranchPhoneNumber + ')')
				} else if (wayBillDestinationBranchMobileNumber != undefined && zerosReg.test(wayBillDestinationBranchMobileNumber))
					$("*[data-lr='DestinationNumber']").html('(' + wayBillDestinationBranchMobileNumber + ')');
			} else if (wayBillDestinationBranchMobileNumber != undefined && zerosReg.test(wayBillDestinationBranchMobileNumber)) {
				$("*[data-lr='DestinationNumber']").html('(' + wayBillDestinationBranchMobileNumber + ')');
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
			
			if (responseOut.bookingTimeServiceTax > 0) {
				$("*[data-lr='bookingServicetax1']").html(Math.round(responseOut.bookingTimeServiceTax));
			} else {
				$("*[data-lr='bookingServicetax1']").html(Math.round(responseOut.bookingTimeUnAddedTaxAmount));
			}
			
			$("*[data-lr='bookedByExecutive']").html(responseOut.wayBillBookedBy);
						
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
			
		}, setCurrentDateTime : function(responseOut) {
			$("*[data-time='current']").html(responseOut.currentTime);
			$("*[data-date='current']").html(responseOut.currentDate);
		}, setPackingTypeNameWithQuantity: function(consignmentArr, responseOut) {
			var article = [];
			var artQuantity=0;
			var commaSepratedSaidToContained = [];
			var commaSepratedSaidToContainedWithQty = [];
			var commaSepratedPackingTypeWithSubstr = [];
			var commaSepratedQtyWithPackingTypeAndSaidToContained = [];
			var commaSepratedPackingType = [];
			var config = responseOut.configuration;

			for (var index in consignmentArr) {
				var pos = Number(index) + Number(1);
				var qty = consignmentArr[index].quantity;
				var packingTypeName = consignmentArr[index].packingTypeName;
				var saidToContain = consignmentArr[index].saidToContain;
				var amount = consignmentArr[index].amount;
				var privateMark = consignmentArr[index].amount;
				var freightAmount = consignmentArr[index].freightAmount;

				$("*[data-consignmentquantity='" + (pos) + "']").html(qty);
				$("*[data-consignmentserialNo='" + (pos) + "']").html(pos);
				$("*[data-consignmentpackingtype='" + (pos) + "']").html(packingTypeName);
				$("*[data-consignmentseperator='" + (pos) + "']").html('of ');
				$("*[data-consignmentsaidtocontain='" + (pos) + "']").html(saidToContain);
				$("*[data-consignmentrateamount='" + (pos) + "']").html(amount);
				$("*[data-consignmentpackingtype='" + (pos) + "']").html(packingTypeName);
				$("*[data-consignmentsaidtocontainwithbracket='" + (pos) + "']").html("(" + saidToContain + ")");
				$("*[data-consignmentChargedWeight='" + (pos) + "']").html(consignmentArr[index].chargeWeight);
				$("*[data-consignmentPrivateMark='" + (pos) + "']").html(privateMark);
				$("*[data-consignmentfreightamount='" + (pos) + "']").html(qty * amount);
				$("*[data-consignmentffreightAmount='" + (pos) + "']").html(freightAmount);

				if (responseOut.chargeTypeId == CHARGETYPE_ID_QUANTITY){
					$("*[data-consignmentArticleRate='" + (pos) + "']").html(amount + "/Art");
					$("*[data-consignmentArticleRateFix='" + (pos) + "']").html(amount + "/Art");
				}

				$("*[data-consignmentallpackingtype='" + (pos) + "']").html(packingTypeName + ' OF ' + saidToContain);

				if (config.showLBHOnPrint && responseOut.cftWeight > 0) {
					$("*[data-consignmentcftlength='" + (pos) + "']").html(consignmentArr[index].length);
					$("*[data-consignmentcftbreadth='" + (pos) + "']").html(consignmentArr[index].breadth);
					$("*[data-consignmentcftheight='" + (pos) + "']").html(consignmentArr[index].height);
					$("*[data-consignmentcftweight='" + (pos) + "']").html(responseOut.cftWeight);

					$("*[data-consignmentlength='" + (pos) + "']").html(' L = ');
					$("*[data-consignmentbreadth='" + (pos) + "']").html(', B = ');
					$("*[data-consignmentheight='" + (pos) + "']").html(', H = ');
				}

				$("*[data-selector='qty" + consignmentArr[index].consignmentDetailsId + "']").html(qty);
				$("*[data-selector='packingtype" + consignmentArr[index].consignmentDetailsId + "']").html(packingTypeName);
				$("*[data-selector='saidToCOntain" + consignmentArr[index].consignmentDetailsId + "']").html(saidToContain);

				if (saidToContain == "") {
					$("*[data-selector='saidToCOntain1" + consignmentArr[index].consignmentDetailsId + "']").html("As Per Invoice");
					$('.saidToContain').hide();
				} else {
					$("*[data-selector='saidToCOntain1" + consignmentArr[index].consignmentDetailsId + "']").html(saidToContain);
				}

				article.push(qty + " " + packingTypeName);
				artQuantity = artQuantity + qty;
				commaSepratedQtyWithPackingTypeAndSaidToContained.push(qty + "-" + packingTypeName + "-" + saidToContain);
				commaSepratedSaidToContained.push(saidToContain);
				commaSepratedSaidToContainedWithQty.push(saidToContain + " " + qty);
				commaSepratedPackingTypeWithSubstr.push((packingTypeName).substring(0, 10));
				commaSepratedPackingType.push(packingTypeName);
			}

			$("*[data-lr='pkgNameWithQty']").html("(" + article.join(', ') + ")");
			$("*[data-lr='artQuantity']").html(artQuantity);
			$("*[data-lr='pkgNameWithQtynoBrace']").html(article.join(', '));
			$("*[data-lr='commaSepratedQtyWithPackingTypeAndSaidToContained']").html(commaSepratedQtyWithPackingTypeAndSaidToContained.join(', '));
			$("*[data-lr='commaSeparetedSaidToContained']").html(commaSepratedSaidToContained.join(', '));
			$("*[data-lr='commaSepratedPackingTypeWithSubstr']").html(commaSepratedPackingTypeWithSubstr.join(', '));
			$("*[data-lr='commaSepratedSaidToContainedWithQty']").html(commaSepratedSaidToContainedWithQty.join(', '));
			$("*[data-lr='commaSepratedPackingType']").html("(" + commaSepratedPackingType.join(',') + ")");
			$("*[data-lr='packingTypeName']").html(commaSepratedPackingType.join(', '));
			$("*[data-lr='saidtocontainname']").html(commaSepratedSaidToContained.join(', '));
			commaSepratedArticleType = commaSepratedPackingType.join(', ');

			if (responseOut.chargeTypeId == CHARGETYPE_ID_WEIGHT){
				$("*[data-consignmentArticleRate='1']").html(responseOut.weigthFreightRate + '/Kg');
				$("*[data-consignmentArticleRateFix='1']").html(responseOut.weigthFreightRate + '/Kg');
			}
			
			if (responseOut.chargeTypeId != CHARGETYPE_ID_WEIGHT && responseOut.chargeTypeId != CHARGETYPE_ID_QUANTITY)
				$("*[data-consignmentArticleRateFix='1']").html(responseOut.wayBillBookingChargeChargeAmount);
			
			
		}, setQRDetails: function(responseOut) {
			var configuration = responseOut.configuration;
			var isQRCodePrintAllowed = configuration.QRCodePrintAllowed;
			var isBranchAbbrevationCode = configuration.BranchAbbrevationCode;
			var ifOnlyQRPrintNeeded = configuration.ifOnlyQRPrintNeeded;
			var isQrCodePrintBasedOnGSTN = configuration.qrCodePrintBasedOnGSTN;//For Falcon
			var isPrintIvcargoLableInQRCodePrint = configuration.isPrintIvcargoLableInQRCodePrint;
			var isPrintBranchNameInQRCodePrint = configuration.isPrintBranchNameInQRCodePrint;
			var isPrintPrivateMarkaInQRCodePrint = configuration.isPrintPrivateMarkaInQRCodePrint;
			var QRCodePrintType = configuration.QRCodePrintType;
			isQRPrintOnPopUpSelection = configuration.isQRPrintOnPopUpSelection;
			var consigneeGSTN = responseOut.consigneeGstn;
			var consignorGSTN = responseOut.consignorGstn;
			var consigneeName = responseOut.consigneeName;
			var showInvoiceNumberInQRCodePrint = configuration.showInvoiceNumberInQRCodePrint;
			var printOneQRCodeExtra = configuration.printOneQRCodeExtra;
			var printQRCodeRange = configuration.printQRCodeRange;
			printQRCodeOnLimit = configuration.printQRCodeOnLimit;
			var invoiceNumberData = "----";
			var destinationBranchName = "";
			var customerDetailsphoneNumber1 = responseOut.consigneePhn;
			var consigneePhn = customerDetailsphoneNumber1.substr(0, 2) + "******" + customerDetailsphoneNumber1.substr(8, 10);
			var branchWiseQRPrintData = responseOut.branchWiseQRPrintData;
			var hideQRCodeFromPrint = responseOut.hideQRCodeFromPrint;
			var _this = this;
			var branchArray = (configuration.branchWiseQROnLaserPrint).split(",");
			var branchAllowedforQr = isValueExistInArray(branchArray, responseOut.executiveBranchId);
			
			if (responseOut.desthandlingBranchName != undefined)
				destinationBranchName = responseOut.desthandlingBranchName;

			if (responseOut.wayBillDestinationBranchName != undefined && (destinationBranchName == "" || destinationBranchName.length == 0))
				destinationBranchName = responseOut.wayBillDestinationBranchName;

			if (responseOut.invoiceNumber != undefined && responseOut.invoiceNumber != "" && responseOut.invoiceNumber.length > 0)
				invoiceNumberData = responseOut.invoiceNumber;
			else
				invoiceNumberData = "----";
				
			if (isQRCodePrintAllowed || isQRCodePrintAllowed == true || ifOnlyQRPrintNeeded || ifOnlyQRPrintNeeded == true) {
				var accountGroupObj = responseOut.PrintHeaderModel;
				var waybIllNumberArr = new Array();
				var waybillArr = new Array();
				var totalArticleSize = 0;
				waybillArr = responseOut.wayBillNumber.split("/");

				for (var k = 0; k < waybillArr.length; k++) {
					waybIllNumberArr.push(waybillArr[k]);
				}

				var dataObjectColl = new Object();
				dataObjectColl.waybillId = responseOut.wayBillId;
				dataObjectColl.lrType = responseOut.wayBillTypeName;
				dataObjectColl.waybillNumber = waybIllNumberArr.join("/");
				//	dataObjectColl.numberOfPackages 			= responseOut.quantity;
				dataObjectColl.numberOfPackages = responseOut.consignmentSummaryQuantity;
				dataObjectColl.bookingDate = responseOut.bookingDateTimeString;
				dataObjectColl.bookingTime = responseOut.bookingTimeString;
				dataObjectColl.packingTypeMasterName = responseOut.packingTypeMasterName;
				dataObjectColl.consigneePhn = responseOut.consigneePhn;
				dataObjectColl.sourceBranch = responseOut.wayBillSourceBranchName;
				dataObjectColl.sourceBranchCode = responseOut.sourceBranchCode
				dataObjectColl.DeliveryToAddress = responseOut.lrDestinationBranchCode

				if (responseOut.desthandlingBranchName != undefined || responseOut.desthandlingBranchName != "undefined")
					dataObjectColl.desthandlingBranchName = responseOut.desthandlingBranchName;
				else
					dataObjectColl.desthandlingBranchName = "--";

				if (responseOut.destBranchAbrvtinCode != undefined || responseOut.destBranchAbrvtinCode != "undefined")
					dataObjectColl.destBranchAbrvtinCode = responseOut.destBranchAbrvtinCode;
				else
					dataObjectColl.destBranchAbrvtinCode = "--";

				if (isPrintBranchNameInQRCodePrint || isPrintBranchNameInQRCodePrint == true) {
					dataObjectColl.destinationTo = responseOut.wayBillDestinationBranchName;
					dataObjectColl.sourceFrom = responseOut.wayBillSourceBranchName;
					dataObjectColl.destinationBranch = responseOut.wayBillDestinationBranchName;
					dataObjectColl.sourceBranch = responseOut.wayBillSourceBranchName;
				} else {
					dataObjectColl.destinationTo = responseOut.wayBillDestinationCityName;
					dataObjectColl.sourceFrom = responseOut.wayBillSourceCityName;
				}

				if (isBranchAbbrevationCode == true) {
					dataObjectColl.destinationTo = responseOut.destBranchAbrvtinCode;
					dataObjectColl.sourceFrom = responseOut.srcBranchAbrvtinCode;
				}

				if (responseOut.privateMark != null && responseOut.privateMark != undefined) {
					if (responseOut.privateMark.length > 12)
						dataObjectColl.privateMark = (responseOut.privateMark).substring(0, 11);
					else
						dataObjectColl.privateMark = responseOut.privateMark;
				} else
					dataObjectColl.privateMark = "";
					
				dataObjectColl.qrCodeSize = 12;
				dataObjectColl.bodyStyle = "white-space: nowrap;width:100%;font-size:45px;margin:0;padding:0;font-weight:20px;font-weight:bold;font-family:sans-serif;";

				var consignmentDetailsArr = new Array();
				var consignmentArr = responseOut.consignmentMap;

				for (var index in consignmentArr) {
					consignmentDetailsArr.push({ quantity: consignmentArr[index].quantity, consignmentId: consignmentArr[index].consignmentDetailsId, packingTypeName: consignmentArr[index].packingTypeName, saidToContain: consignmentArr[index].saidToContain });
				}

				var templateArray = new Array();
				var consignmentVal = 1;

				if (printOneQRCodeExtra != undefined && (printOneQRCodeExtra || printOneQRCodeExtra == true)) {
					totalArticleSize = 0;

					for (var i = 0; i < consignmentDetailsArr.length; i++) {
						totalArticleSize = totalArticleSize + consignmentDetailsArr[i].quantity;
					}
				}

				for (var i = 0; i < consignmentDetailsArr.length; i++) {
					for (var j = 0; j < consignmentDetailsArr[i].quantity; j++) {
						var dataObject = new Object();
						_.map(dataObjectColl, function(val, key) {
							dataObject[key] = val;
						})

						dataObject.currentPackage = consignmentVal++;
						dataObject.currentPackingType = consignmentDetailsArr[i].packingTypeName;
						dataObject.saidToContain = consignmentDetailsArr[i].saidToContain

						if (isQrCodePrintBasedOnGSTN || isQrCodePrintBasedOnGSTN == true) {
							if (consigneeGSTN == '' && consignorGSTN == '')
								dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px;"><tr><td style="border-bottom: solid 1px; border-top:none; border-right: solid 1px; padding: 0px 10px 0px 10px;">LR No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.waybillNumber + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To City</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + responseOut.wayBillDestinationCityName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To Branch</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + responseOut.wayBillDestinationBranchName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Qty</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.currentPackage + ' of ' + dataObject.numberOfPackages + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">From</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.sourceFrom + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Type</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.lrType + '</td></tr></table>')({ dataObject: dataObject });
							else
								dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px;"><tr><td colspan="2" style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;text-align:center;">' + accountGroupObj.accountGroupName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">LR No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.waybillNumber + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To City</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + responseOut.wayBillDestinationCityName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To Branch</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + responseOut.wayBillDestinationBranchName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Qty</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.currentPackage + ' of ' + dataObject.numberOfPackages + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">From</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.sourceFrom + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Type</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.lrType + '</td></tr><tr style="width:25%; font-size: 20px;"><td></td><td style="text-align:right; padding: 0px 10px 0px 10px;">IVcargo</td></tr></table>')({ dataObject: dataObject });
						} else {
							if (isPrintIvcargoLableInQRCodePrint || isPrintIvcargoLableInQRCodePrint == true) {
								if (showInvoiceNumberInQRCodePrint || showInvoiceNumberInQRCodePrint == true) {
									var _this = this;
									var srsBranchName = _this.getLimitedLengthofBranches(dataObjectColl.sourceFrom);
									var destBranchName = _this.getLimitedLengthofBranches(destinationBranchName);

									if (totalArticleSize <= printQRCodeRange && !hideQRCodeFromPrint) {
										dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px;"><tr><td colspan="2" style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + accountGroupObj.accountGroupName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">LR No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.waybillNumber + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + destBranchName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Qty</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.currentPackage + ' of ' + dataObject.numberOfPackages + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">From</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + srsBranchName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Type</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.lrType + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Invoice</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + invoiceNumberData + '</td></tr><tr><td></td><td style="text-align:right; padding: 0px 10px 0px 10px;">IVCARGO</td></tr></table>')({ dataObject: dataObject });
										dataObject.qrCodeString = dataObject.waybillId + "~" + consignmentDetailsArr[i].consignmentId + "~" + QR_CODE_USING_CONSIGNMENT + "~" + j;
									}
								} else
									dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px;"><tr><td colspan="2" style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + accountGroupObj.accountGroupName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">LR No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.waybillNumber + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + destinationBranchName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Qty</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.currentPackage + ' of ' + dataObject.numberOfPackages + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">From</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.sourceFrom + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Type</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.lrType + '</td></tr><tr><td></td><td style="text-align:right; padding: 0px 10px 0px 10px;">IVCARGO</td></tr></table>')({ dataObject: dataObject });
							} else if (QRCodePrintType == 'customQRCodePrint_9' || QRCodePrintType == 'customQRCodePrint_584') {
								dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px;"><tr><td colspan="2" style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + accountGroupObj.accountGroupName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">LR No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.waybillNumber + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + destinationBranchName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Qty</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.currentPackage + ' of ' + dataObject.numberOfPackages + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">From</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.sourceFrom + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Type</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.lrType + '</td></tr><tr><td></td><td style="text-align:right; padding: 0px 10px 0px 10px;">IVCARGO</td></tr></table>')({ dataObject: dataObject });

								$('#popUpContentForQrCodeOption_9').bPopup({
								}, function() {
									var _thisMod = this;
									$(this).html("<div class='confirm' style='height:150px;width:250px; padding:5px'>"
										+ "<div style='font-size:18px; color:DodgerBlue;text-align:center;'><b>Print Option</b><div><br/>"
										+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' checked='checked' id='printLR'/>&nbsp;<b style='font-size:14px;'>Print LR</b><div><br/>"
										+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' checked='checked' id='printQR'/>&nbsp;<b style='font-size:14px;'>Print QR</b><div><br/>"
										+ "<button id='cancelButton'>Cancel</button>"
										+ "<button autofocus id='confirm'>Print</button></center></div>")

									$("#confirm").focus();

									$("#cancelButton").click(function() {
										window.close();
										_thisMod.close();
									})

									$('#confirm').click(function() {
										if ($('#printLR').prop('checked') && $('#printQR').prop('checked')) {
											_this.printAndCloseQRCodePrint();

											if (dataObject.numberOfPackages <= 50)
												_this.printQRCodeOnLimt(templateArray, 30);

											_thisMod.close();
										} else if ($('#printLR').prop('checked') == true) {
											_this.printAndCloseQRCodePrint();
											_thisMod.close();
										} else if ($('#printQR').prop('checked')) {
											if (dataObject.numberOfPackages <= 50)
												_this.printQRCodeOnLimt(templateArray, 30);

											_thisMod.close();
											window.close();
										} else
											window.close();

										_thisMod.close();
									});

									$('#confirm').on('keydown', function(e) {
										if (e.which == 27) {  //escape
											window.close();
										}
									});
								});
							} else {
								if (showInvoiceNumberInQRCodePrint || showInvoiceNumberInQRCodePrint == true) {
									if (totalArticleSize <= printQRCodeRange) {
										var srsBranchName = _this.getLimitedLengthofBranches(dataObjectColl.sourceFrom);
										var destBranchName = _this.getLimitedLengthofBranches(destinationBranchName);
										dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px;"><tr><td colspan="2" style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + accountGroupObj.accountGroupName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">LR No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.waybillNumber + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + destBranchName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Qty</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.currentPackage + ' of ' + dataObject.numberOfPackages + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">From</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + srsBranchName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Type</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.lrType + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Invoice</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + invoiceNumberData + '</td></tr><tr><td></td></table>')({ dataObject: dataObject });
										dataObject.qrCodeString = dataObject.waybillId + "~" + consignmentDetailsArr[i].consignmentId + "~" + QR_CODE_USING_CONSIGNMENT + "~" + j;
									}
								} else if (isPrintPrivateMarkaInQRCodePrint)
									dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px;"><tr><td colspan="2" style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + accountGroupObj.accountGroupName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">LR No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.waybillNumber + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.destinationTo + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Qty</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.currentPackage + ' of ' + dataObject.numberOfPackages + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">From</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.sourceFrom + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Type</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.lrType + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Pvt Mark</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObjectColl.privateMark + '</td></tr></table>')({ dataObject: dataObject });
								else
									dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px;"><tr><td colspan="2" style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + accountGroupObj.accountGroupName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">LR No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.waybillNumber + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.destinationTo + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Qty</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.currentPackage + ' of ' + dataObject.numberOfPackages + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">From</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.sourceFrom + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Type</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.lrType + '</td></tr></table>')({ dataObject: dataObject });
							}
						}

						dataObject.qrCodeString = dataObject.waybillId + "~" + consignmentDetailsArr[i].consignmentId + "~" + QR_CODE_USING_CONSIGNMENT + "~" + j;

						dataObject.srcBranchAbrvtinCode = "";
						dataObject.destinationAbrvtinCode = "";
						dataObject.waybillNo = "";
						dataObject.destinationBranch = "";
						dataObject.destBranchAbrvtinCode = "";
						dataObject.numberOfQuntity = "";
						dataObject.QrCodeForSugama = false;
						templateArray.push(dataObject);
					}
				}

				if (totalArticleSize <= printQRCodeRange && (printOneQRCodeExtra != undefined && (printOneQRCodeExtra || printOneQRCodeExtra == true)))
					this.printQRCode(templateArray);

				if ((printOneQRCodeExtra != undefined && (printOneQRCodeExtra || printOneQRCodeExtra == true))) {
					var srsBranchName = _this.getLimitedLengthofBranches(dataObjectColl.sourceFrom);
					var destBranchName = _this.getLimitedLengthofBranches(destinationBranchName);
					var templateArray = new Array();

					if (isPrintIvcargoLableInQRCodePrint || isPrintIvcargoLableInQRCodePrint == true)
						dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px;"><tr><td colspan="2" style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + accountGroupObj.accountGroupName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">LR No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.waybillNumber + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + destBranchName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Total Qty</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.numberOfPackages + '**</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">From</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + srsBranchName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Type</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.lrType + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Invoice</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + invoiceNumberData + '</td></tr><tr><td></td><td style="text-align:right; padding: 0px 10px 0px 10px;">IVCARGO</td></tr></table>')({ dataObject: dataObject });
					else if (QRCodePrintType == 'customQRCodePrint_565')
						dataObject.htmlTemplate = _.template('<table style="border: solid 1px;verical-align: top;"><tr><td colspan="2" style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;font-size:46px;">' + accountGroupObj.accountGroupName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;font-size:35px;"><span>LR No :</span>&nbsp;&nbsp;&nbsp;<span>' + dataObject.waybillNumber + '</span></td></td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;font-size:35px;"><span>Booking Date:</span>&nbsp;&nbsp;&nbsp;<span>' + dataObjectColl.bookingDate + '</span></td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;font-size:35px;"><span>FromCity :</span>&nbsp;&nbsp;&nbsp;<span>' + dataObject.sourceFrom + '</span></td></td></tr><tr><td style="border-bottom: solid 1px;border-right:solid 1px; padding: 0px 10px 0px 10px;font-size:35px;"><span>ToCity :</span>&nbsp;&nbsp;&nbsp;<span>' + dataObject.destinationTo + '</span></td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;font-size:35px;"><span>Booking Branch:</span>&nbsp;&nbsp;&nbsp;<span>' + dataObjectColl.sourceBranch + '</span></td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;font-size:35px;"><span>Receiver :</span>&nbsp;&nbsp;&nbsp;<span>' + consigneeName + '</span></td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;font-size:35px;"><span>RecMobileNo:</span>&nbsp;&nbsp;&nbsp;<span>' + dataObjectColl.consigneePhn + '</span></td></tr><tr><td style="border-bottom: solid 1px;border-right:solid 1px; padding: 0px 10px 0px 10px;font-size:35px;"><span>Quantity:</span>&nbsp;&nbsp;&nbsp;<span>' + dataObject.numberOfPackages + '</span></td></tr><tr><td style="border-right: solid 1px; padding: 0px 10px 0px 10px;font-size:35px;"><span>Item TYPE:</span>&nbsp;&nbsp;&nbsp;<span>' + dataObject.currentPackingType + '</span></td></tr></table>')({ dataObject: dataObject });
					else
						dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px;"><tr><td colspan="2" style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + accountGroupObj.accountGroupName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">LR No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.waybillNumber + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + destBranchName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Total Qty</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.numberOfPackages + '**</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">From</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + srsBranchName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Type</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.lrType + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Invoice</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + invoiceNumberData + '</td></tr></table>')({ dataObject: dataObject });

					dataObject.qrCodeString = dataObject.waybillId + "~" + dataObject.waybillNumber + "~" + QR_CODE_USING_WAYBILL_NUMBER + "~" + 0;
					templateArray.push(dataObject);
				}

				if (!isQRPrintOnPopUpSelection) {
					if (templateArray) {
						if (templateArray.length > 30) {
							var largeTemplateArray = breakArrays(templateArray, 30);

							for (var p = 0; p < largeTemplateArray.length; p++)
								this.printQRCode(largeTemplateArray[p]);
						} else
							this.printQRCode(templateArray);
					}
				}
			}
		}, printQRCode: function(templateArray) {
			//genericfunction.js
			printQRCode(templateArray);
		}, printAndCloseQRCodePrint: function() {
			window.resizeTo(0, 0);
			window.moveTo(0, 0);

			setTimeout(function() {
				window.print();
				window.close();
			}, 500);
		}, printQRCodeOnLimt: function(templateArray, breakSize) {
			if (templateArray) {
				if (templateArray.length > breakSize) {
					var largeTemplateArray = breakArrays(templateArray, breakSize);
					if (printQRCodeOnLimit)
						largeTemplateArray.length = 1;

					for (var p = 0; p < largeTemplateArray.length; p++) {
						if (isQRPrintOnPopUpSelection)
							this.printQRCode(largeTemplateArray[p]);
					}
				} else
					this.printQRCode(templateArray);
			}
		}, getLimitedLengthofBranches(branchName) {
			var newbranchName = "";

			if (typeof branchName != 'undefined' && branchName != undefined && branchName.length > 0)
				newbranchName = branchName.substring(0, 10);

			return newbranchName;
		}
	});
});	
