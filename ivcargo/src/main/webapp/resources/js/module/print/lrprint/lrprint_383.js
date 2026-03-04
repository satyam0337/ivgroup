var QR_CODE_USING_CONSIGNMENT		= 1;
var QR_CODE_USING_WAYBILL_NUMBER	= 2;
var zerosReg = /[1-9]/g;
var isQRPrintOnPopUpSelection = false;
var whitespace = /\S/;
var commaSepratedArticleType= '';
var PACKING_TYPE_PACKET	 = 342;
var PACKING_TYPE_LETTER	 = 335;
var PACKING_TYPE_LIFFAFA = 336;

define(['/ivcargo/resources/js/barcode/qrcode/qrcode.js',
	'language'
	],function(elementTemplateJs,language){
		var configuration,printFromDB,isSundryBooking;
	return ({
		renderElements : function(responseOut){
			_this = this;
			 configuration	   = responseOut.configuration;
			 printFromDB	 = responseOut.printFromDB;
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
				  _this.setQRDetails(responseOut);
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
			var consignorGSTN		= responseOut.consignorGstn;
			var consignorName		= responseOut.consignorName;
			var consigneeName		= responseOut.consigneeName;
			consignorName			= consignorName.toUpperCase();
			consigneeName			= consigneeName.toUpperCase();
			
			if (config.consignorNameSubstringLength > 0 && consignorName.length > config.consignorNameSubstringLength)
				$("*[data-consignor='name']").html(consignorName.substring(0, config.consignorNameSubstringLength) + '..');
			else
				$("*[data-consignor='name']").html(consignorName);
			
			if (consignorName.length > 15) {
				$(".consignorName").removeClass('Font15Size')
				$(".consignorName").addClass('font11px')
			}
			
			if(zerosReg.test(responseOut.consignorPhn))
				$("*[data-consignor='number']").html(responseOut.consignorPhn);

			if(consignorGSTN != undefined && consignorGSTN != null && consignorGSTN !='')
				$("*[data-consignor='gstn']").html(consignorGSTN.toUpperCase());
			
			if(config.consigneeNameSubstringLength > 0 && consigneeName.length > config.consigneeNameSubstringLength)
				$("*[data-consignee='name']").html(consigneeName.substring(0, config.consigneeNameSubstringLength) + '..');
			else
				$("*[data-consignee='name']").html(consigneeName);
			
			if (consigneeName.length > 15) {
				$(".consigneeName").removeClass('Font15Size');
				$(".consigneeName").addClass('font11px');
			}
			
			if(zerosReg.test(responseOut.consigneePhn))
				$("*[data-consignee='number']").html(responseOut.consigneePhn);
			
			if(consigneeGSTN != undefined && consigneeGSTN != null && consigneeGSTN !='')
				$("*[data-consignee='gstn']").html(consigneeGSTN.toUpperCase());
		
			if(config.isRateConfigCondition == 'true') {
				if(responseOut.consignorRateConfigured)
					$("*[data-consignor='name']").html($("*[data-consignor='name']").html() + " * ");
					
				if(responseOut.consigneeRateConfigured)
					$("*[data-consignee='name']").html($("*[data-consignee='name']").html() + " * ");
			}			
		}, setLrDetails : function(responseOut) {
			
			var config					= responseOut.configuration;
			var wayBillSourceBranchName			= responseOut.wayBillSourceBranchName;
			var wayBillSourceCityName = responseOut.wayBillSourceCityName
			var wayBillSourceBranchPhoneNumber = responseOut.wayBillSourceBranchPhoneNumber;
			var wayBillSourceBranchMobileNumber = responseOut.wayBillSourceBranchMobileNumber;
			var wayBillDestinationBranchName	= responseOut.wayBillDestinationBranchName;
			var wayBillDestinationBranchPhoneNumber = responseOut.wayBillDestinationBranchPhoneNumber;
			var wayBillDestinationBranchMobileNumber	= responseOut.wayBillDestinationBranchMobileNumber;
			var wayBillTypeId							= responseOut.wayBillTypeId;
			var wayBillRemark							= responseOut.wayBillRemark;
			var consignmentSummaryDeliveryToAddress		= responseOut.consignmentSummaryDeliveryToAddress;
			var bookingCharges							= responseOut.waybillBookingChargesList;
			//START :: Advance and Balance Calculation for Abbas LR Print - Ravi Prajapati
				
			$("*[data-lr='number']").html(responseOut.wayBillNumber);
			

			if(config.isCTFormConditionRequired == 'true' && responseOut.consignmentSummaryFormTypeId == CT_FORM_NOT_RECEIVED_ID)
				$("*[data-lr='number']").html("***" + responseOut.wayBillNumber);
			
			$("*[data-lr='date']").html(responseOut.bookingDateTimeString);
			$("*[data-lr='time']").html(responseOut.bookingTimeString);
			
			var branchTypeOfLocation		= responseOut.branchTypeOfLocation;
			var handlingBranchName			= responseOut.handlingBranchName;
					destBranchMobileNo	= wayBillDestinationBranchMobileNumber;
			
			if(config.appendHandlingBranchWithSourceBranch == 'true' && responseOut.bookingTypeId == BOOKING_TYPE_FTL_ID) {
				if(branchTypeOfLocation != undefined && branchTypeOfLocation == TYPE_OF_LOCATION_OPERATIONAL_PLACE && handlingBranchName != undefined)
					$("*[data-lr='lrSource']").html(handlingBranchName + '-' + wayBillSourceBranchName);
				else
					$("*[data-lr='lrSource']").html(wayBillSourceBranchName);
			} else {
				$("*[data-lr='lrSource']").html(wayBillSourceBranchName);
			}
			
			$("*[data-lr='lrSourceCity']").html(wayBillSourceCityName);
			
			$("*[data-lr='lrDestination']").html(wayBillDestinationBranchName);

			if (responseOut.wayBillSourceBranchAddress != undefined)
				$("*[data-lr='lrSourceAddress']").html(responseOut.wayBillSourceBranchAddress.replace(/ /g, "&nbsp;"));	

			if (responseOut.wayBillDestinationBranchAddress != undefined)
				$("*[data-lr='lrDestinationAddress']").html(responseOut.wayBillDestinationBranchAddress.replace(/ /g, "&nbsp;"));
			
			if (wayBillSourceBranchPhoneNumber != undefined && wayBillSourceBranchMobileNumber != undefined) {
				var replacedString = (wayBillSourceBranchPhoneNumber).replace('-', '');

				if (zerosReg.test(replacedString))
					$("*[data-lr='lrSourceMobileNumber1']").html(" " + wayBillSourceBranchMobileNumber);
				else
					$("*[data-lr='lrSourceMobileNumber1']").html(wayBillSourceBranchMobileNumber);
			} else if (wayBillSourceBranchMobileNumber != undefined)
				$("*[data-lr='lrSourceMobileNumber1']").html(wayBillSourceBranchMobileNumber);
			
			if (wayBillDestinationBranchPhoneNumber != undefined && wayBillDestinationBranchMobileNumber != undefined) {
				var replacedString = wayBillDestinationBranchPhoneNumber.replace('-', '');

				if (zerosReg.test(replacedString)) {
					if (wayBillDestinationBranchMobileNumber != undefined)
						$("*[data-lr='lrDestinationMobileNumber']").html(", " + wayBillDestinationBranchMobileNumber);
				} else
					$("*[data-lr='lrDestinationMobileNumber']").html(wayBillDestinationBranchMobileNumber);
			} else if (wayBillDestinationBranchMobileNumber != undefined)
				$("*[data-lr='lrDestinationMobileNumber']").html(wayBillDestinationBranchMobileNumber);
						
			if(responseOut.invoiceNumber != undefined && responseOut.invoiceNumber != 'NULL')
				$("*[data-lr='consignorInvoiceNo']").html(responseOut.invoiceNumber);
			
			$("*[data-lr='decalredValue']").html(responseOut.declaredValue);	
			$("*[data-lr='actualWeightConsignor']").html(responseOut.actualWeight);
			$("*[data-lr='chargedWeightConsignor']").html(responseOut.chargedWeight);
			$("*[data-lr='bookingServicetax']").html(responseOut.bookingTimeServiceTax);
			$("*[data-lr='grandTotal']").html(Math.round(responseOut.bookingTotal));
			$("*[data-lr='grandTotalWithComma']").html((Math.round(responseOut.bookingTotal)).toLocaleString("en-US"));
			$("*[data-lr='lrType']").html((responseOut.wayBillTypeName).toUpperCase());
			
			if(wayBillTypeId == WAYBILL_TYPE_PAID && responseOut.consignmentSummaryPaymentType == PAYMENT_TYPE_CREDIT_ID)
				$("*[data-lr='lrType']").html ((responseOut.wayBillTypeName).toUpperCase() + '- A/C');
			
			if(wayBillRemark != undefined && wayBillRemark != '')
				$("*[data-lr='remark']").html(wayBillRemark);
			
			if (config.removeRemarkLabel && wayBillRemark == '') {
				$("*[data-selector='remark']").remove();
				$("*[data-lr='remark']").remove();
			}
			
			$("*[data-lr='deliveryToAddress']").html(consignmentSummaryDeliveryToAddress);
			$("*[data-lr='totalQuantity']").html(responseOut.consignmentSummaryQuantity);

			var billSelectionId			= responseOut.billSelectionId;

			if(billSelectionId == BOOKING_WITHOUT_BILL) {
				$("*[data-selector='forCompanyName']").remove();
				$("*[data-selector='gstn']").remove();
				$("*[data-account='gstn']").remove();
			}

			if($("*[data-lr='grandTotalInWord']").length != 0)
				$("*[data-lr='grandTotalInWord']").html(convertNumberToWord(Math.round(responseOut.bookingTotal)));
			
			$("*[data-lr='chargeSum']").html(responseOut.bookingChargesSum);
			$("*[data-lr='bookedByExecutive']").html(responseOut.wayBillBookedBy);
			
			if (responseOut.sourceBranchGSTN != undefined)
				$("*[data-lr='lrSrcBranchGstn']").html(responseOut.sourceBranchGSTN);
						
			this.setSTPaidByDetails(responseOut);
			this.setBookingCharges(responseOut);
		}, setSTPaidByDetails : function(responseOut) {
			$("*[data-lr='taxPaidBy']").html(responseOut.consignmentSummaryTaxByString);
		}, setBookingCharges : function(responseOut){
			var classNameofName			= $("*[data-chargename='dynamic']").attr('class');
			var classNameofVal			= $("*[data-chargevalue='dynamic']").attr('class');
			var configuration			= responseOut.configuration;

			var bookingCharges			= responseOut.waybillBookingChargesList
			var sortedBookingChargeList = _.sortBy(bookingCharges,'wayBillBookingChargeSequenceNumber');

			var tbody = $("*[data-chargevalue='dynamic']").parent().parent();
			
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

			var tbody					= $("*[data-chargevaluewithoutname='dynamic']").parent().parent();

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
				else
					$("*[data-selector='chargeValue" + chargeObj.chargeTypeMasterId + "']").html(chargeObj.wayBillBookingChargeChargeAmount);
				
			}

			$("*[data-chargevalue='dynamic']").parent().remove()
		},setConsignment:function(responseOut){
			var consignmentArr = responseOut.consignmentMap
			_this.setPackingTypeNameWithQuantity(consignmentArr, responseOut)
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
			isQRPrintOnPopUpSelection = conf.isQRPrintOnPopUpSelection;
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
			
			if (conf.showHidePrintData || conf.duplicatePrint
				|| ((conf.showPopForTopayFTLLr || conf.showPopForTopayFTLLr == true)
					&& wayBillTypeId == WAYBILL_TYPE_TO_PAY
					&& responseOut.bookingTypeId == BOOKING_TYPE_FTL_ID)
				|| ((showLrPrintConfirmationPopup || showLrPrintConfirmationPopup == true)
					&& (wayBillTypeId == WAYBILL_TYPE_PAID || wayBillTypeId == WAYBILL_TYPE_TO_PAY))
				|| (conf.showPopUpContentForQrCodeOption || conf.showPopUpContentForQrCodeOption == true)
				|| (conf.showPopUpContentForPaidChargesOption || conf.showPopUpContentForPaidChargesOption == true)) {
				showPopup = true;
			}
			
			if(showPopup) {
			
			} else if (isQRPrintOnPopUpSelection == "false" || isQRPrintOnPopUpSelection == false)
				_this.printWindow(isPdfExportAllow);
		}, setCurrentDateTime : function(responseOut) {
			$("*[data-time='current']").html(responseOut.currentTime);
			$("*[data-date='current']").html(responseOut.currentDate);
		}, setPackingTypeNameWithQuantity : function(consignmentArr, responseOut) {
			var article = [];
			for(var index in consignmentArr) {
				var pos				= Number(index) + Number(1);
				var qty				= consignmentArr[index].quantity;
				var packingTypeName = consignmentArr[index].packingTypeName;
				var saidToContain	= consignmentArr[index].saidToContain;
				
				$("*[data-consignmentquantity='" + (pos) + "']").html(qty);
				$("*[data-consignmentpackingtype='" + (pos) + "']").html(packingTypeName);
				$("*[data-consignmentseperator='" + (pos) + "']").html('of ');
				$("*[data-consignmentsaidtocontain='" + (pos) + "']").html(saidToContain);
				article.push(qty + " " + packingTypeName);
			}
			$("*[data-lr='pkgNameWithQty']").html("(" + article.join(', ') + ")");
		}, setQRDetails: function(responseOut) {
			var configuration = responseOut.configuration;
			var isQRCodePrintAllowed = configuration.QRCodePrintAllowed;
			var isBranchAbbrevationCode = configuration.BranchAbbrevationCode;
			var ifOnlyQRPrintNeeded = configuration.ifOnlyQRPrintNeeded;
			var isPrintBranchNameInQRCodePrint = configuration.isPrintBranchNameInQRCodePrint;
			var QRCodePrintType = configuration.QRCodePrintType;
			isQRPrintOnPopUpSelection = configuration.isQRPrintOnPopUpSelection;
			printQRCodeOnLimit = configuration.printQRCodeOnLimit;
			var destinationBranchName = "";
			var _this = this;
			
			if (responseOut.desthandlingBranchName != undefined)
				destinationBranchName = responseOut.desthandlingBranchName;

			if (responseOut.wayBillDestinationBranchName != undefined && (destinationBranchName == "" || destinationBranchName.length == 0))
				destinationBranchName = responseOut.wayBillDestinationBranchName;
				
			if (isQRCodePrintAllowed || isQRCodePrintAllowed == true || ifOnlyQRPrintNeeded || ifOnlyQRPrintNeeded == true) {
				var waybIllNumberArr = new Array();
				var waybillArr = responseOut.wayBillNumber.split("/");

				for (var k = 0; k < waybillArr.length; k++) {
					waybIllNumberArr.push(waybillArr[k]);
				}

				var dataObjectColl = new Object();
				dataObjectColl.waybillId = responseOut.wayBillId;
				dataObjectColl.lrType = responseOut.wayBillTypeName;
				dataObjectColl.waybillNumber = waybIllNumberArr.join("/");
				dataObjectColl.numberOfPackages = responseOut.consignmentSummaryQuantity;
				dataObjectColl.bookingDate = responseOut.bookingDateTimeString;
				dataObjectColl.bookingTime = responseOut.bookingTimeString;
				dataObjectColl.packingTypeMasterName = responseOut.packingTypeMasterName;
				dataObjectColl.consigneePhn = responseOut.consigneePhn;
				dataObjectColl.sourceBranch = responseOut.wayBillSourceBranchName;
				dataObjectColl.sourceBranchCode = responseOut.sourceBranchCode
				dataObjectColl.DeliveryToAddress = responseOut.lrDestinationBranchCode
				dataObjectColl.bookingTotal		= responseOut.bookingTotal;
				
				var wayBillNoWithouBranchtCode = waybillArr.length > 1 ? waybillArr[1] : responseOut.wayBillNumber;

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
			
				dataObjectColl.qrCodeSize = 8;
				dataObjectColl.bodyStyle = "white-space: nowrap;width:100%;font-size:45px;margin:0;padding:0;font-weight:20px;font-weight:bold;font-family:sans-serif;";

				var consignmentDetailsArr = new Array();
				var consignmentArr = responseOut.consignmentMap;

				for (var index in consignmentArr) {
					consignmentDetailsArr.push({ quantity: consignmentArr[index].quantity, consignmentId: consignmentArr[index].consignmentDetailsId, packingTypeName: consignmentArr[index].packingTypeName, saidToContain: consignmentArr[index].saidToContain });
				}

				var templateArray = new Array();
				var consignmentVal = 1;
				
				for (var i = 0; i < consignmentDetailsArr.length; i++) {
					for (var j = 0; j < consignmentDetailsArr[i].quantity; j++) {
						var dataObject = new Object();
						_.map(dataObjectColl, function(val, key) {
							dataObject[key] = val;
						})

						dataObject.currentPackage = consignmentVal++;
						dataObject.currentPackingType = consignmentDetailsArr[i].packingTypeName;
						dataObject.saidToContain = consignmentDetailsArr[i].saidToContain
						dataObject.htmlTemplate = _.template('<table width="100%" style="margin-left:5px;margin-right:10px; border:solid 1px; border-collapse:collapse;"><tr style="border-bottom:solid 1px; padding:0px 10px;"><td style="border-bottom:solid 1px; padding:0px 10px; text-align:center; font-size:45px;height:50px" colspan="2">SUGAMA EXPRESS CARGO</td></tr><tr style="border-bottom:solid 1px;"><td style="border-right:solid 1px; padding:0px; text-align:left; text-transform:uppercase; white-space:nowrap; font-size:45px; width:20%; height:120px;padding-left:25px">From </td><td style="padding:0px; width:calc(80%); white-space:nowrap; height:120px;padding-left:25px"><span style="font-size:45px;">' + dataObjectColl.sourceBranch + '</span></td></tr><tr style="border-bottom:solid 1px;"><td style="border-right:solid 1px; padding:0px; text-align:left; text-transform:uppercase; white-space:nowrap; width:25%; font-size:81px; height:150px;padding-left:25px">To</td><td style="padding:0px; width:calc(85%); word-wrap: none;word-break: break-all;white-space: normal;height:150px;padding-left:25px; font-size:81px;">' + dataObjectColl.destinationBranch + '</td></tr><tr style="border-bottom:solid 1px;"><td style="border-right:solid 1px; padding:0px; text-align:left; text-transform:uppercase; white-space:nowrap; width:20%; height:170px;font-size:150px;padding-left:25px">LR</td><td style="padding:0px; width:calc(80%); white-space:nowrap; height:170px;"><span style="font-size:130px;padding-left:25px">' + wayBillNoWithouBranchtCode + '</span></td></tr><tr><td colspan="2" style="padding:0px;"><table width="100%" style="border-collapse:collapse; border:solid 1px;cellpadding:0px;cellspacing:0px"><tr><td style="border-right:solid 1px; padding:0px; width:26.4%; text-align:left; font-size:55px; height:50px;padding-left:25px">QNT</td><td style="border-right:solid 0px; padding:0px; width:30%; text-align:center; vertical-align:middle; height:50px;"><span style="font-size:55px;">(' + dataObject.currentPackage + '/' + dataObject.numberOfPackages + ')</span></td><td style="border-right:solid 0px; padding:0px; width:25%; text-align:center; font-size:55px; vertical-align:middle; height:50px;">' + dataObjectColl.lrType + ' =</td><td style="padding:0px; text-align:left; font-size:55px; vertical-align:middle; height:50px;">' + dataObjectColl.bookingTotal + '</td></tr></table></td></tr></table>')({ dataObject: dataObject });

						$('#popUpContentForQrCodeOption_383').bPopup({
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

						dataObject.qrCodeString = dataObject.waybillId + "~" + consignmentDetailsArr[i].consignmentId + "~" + QR_CODE_USING_CONSIGNMENT + "~" + j;
						dataObject.srcBranchAbrvtinCode = responseOut.srcBranchAbrvtinCode;
						dataObject.destinationAbrvtinCode = responseOut.destBranchAbrvtinCode;
						dataObject.waybillNo = dataObject.waybillNumber.split("/")[1];
						dataObject.destinationBranch = dataObjectColl.destinationBranch;
						dataObject.destBranchAbrvtinCode = dataObjectColl.destBranchAbrvtinCode;
						dataObject.numberOfQuntity = '[' + dataObject.currentPackage + '/' + dataObject.numberOfPackages + ']';
						dataObject.QrCodeForSugama = QRCodePrintType == 'customQRCodePrint_383';

						templateArray.push(dataObject);
					}
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
		}, printQRCode: function(templateArray) {
			//genericfunction.js
			//printQRCode(templateArray);
			printAllQRCodeWithoutLimit(templateArray);
		}
	});
});	

function breakArrays(myArray, chunk_size) {
	const chunks = [];
	let i = 0;

	while (i < myArray.length) {
		chunks.push(myArray.slice(i, i + chunk_size));
		i += chunk_size;
	}

	return chunks;
}
