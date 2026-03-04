define([], function(){	
	var pageCounter	= 1;
	var totalCollection;
	var totalBookingDelivery;
	var totalLongLength;
	var totalHandling;
	var grandTotalInword;
	var grandTotalRound;
	var executiveName;
	var totalAoc;
	var totalDD;
	var totalhamali;
	var isBranchWisePrintFormatPopup = false; 
	var FCM = 1;
	var RCM = 2;
	var loadingPrintWindowOnrefresh=true;
	var grandTotalWithTaxAndAdditionalCharge;
	var billDataForEMail;
	return {
		getConfiguration : function(invoicePrintFlavor,tableData,invoicePrintForBitlaGroup,invoicePrintForNewGroups) {
			if(invoicePrintForBitlaGroup){
				return 'text!/ivcargo/html/print/invoice/invoicePrint_bitla.html';
			} else if(invoicePrintForNewGroups){
				return 'text!/ivcargo/html/print/invoice/invoicePrint_defaultNew.html';
			} else if(invoicePrintFlavor == "invoicePrint_407") {
				var length	= tableData.length;
				
				if(length <= 1)
					return 'text!/ivcargo/html/print/invoice/invoicePrint_407.html';

				return 'text!/ivcargo/html/print/invoice/invoicePrint_407_2.html';
			} else	{
				let isPreview = new URLSearchParams(window.location.search).get("isPreview") === "true";
				if (isPreview) invoicePrintFlavor = `${invoicePrintFlavor}_preview`;
					
				return 'text!/ivcargo/html/print/invoice/' + invoicePrintFlavor + '.html';
			}
		}, getFilePathForLabel:function() {
			return '/ivcargo/resources/js/module/view/invoiceprint/invoiceprint_filepath.js';
		}, setHeadersForPrint:function(headerData,pageNumber, billData, configuration ,isExcel) {
			if(configuration.isFromIVEditor) { // properties from Creditor invoice print  
				$('.invoiceTableHeader').closest('tr').attr('id', 'dataTable');
				$('.invoiceTableRow').closest('tr').attr('data-row', 'dataTableDetails');
				$('.invoiceTableFooter').closest('tr').attr('class', 'lastPage');

				if(isExcel == true || isExcel == 'true')
				$('table').first().wrap('<div id="downloadToExcel"></div>');

			}
			
			billDataForEMail = billData
			if(configuration.showBranchWisePrintFormatPopup) {
				let branchIdsArr = (configuration.branchIdsToShowPrintFormatPopup).split(",");
				isBranchWisePrintFormatPopup	= isValueExistInArray(branchIdsArr, billData.branchID)
			}
			
			var pageNo = Number(pageNumber)+Number(1);
			 
			if(pageNo > 1)
				$("#pagenoheight").css("font-size", "13px");
	
			$("[data-group]").html(headerData[$("[data-group]").attr("data-group")]);
			var headerbreak			= $("[data-group='name']");
			var headerbreakPrint	= $("[data-group='print']");
			
			var accountGroupName	= headerData.name

			$("*[data-group='accountGroupName']").html(accountGroupName.toUpperCase());
			$("*[data-group='branchName']").html(headerData.branchName);
			$("*[data-group='accountGroupAddress']").html(headerData.branchAddress);
			$("*[data-group='accountGroupDescription']").html(accountGroupName);
			$("*[data-group='branchMobileNumber']").html(headerData.branchMobileNumber);
			$("*[data-group='branchPanNumber']").html(headerData.branchPanNumber);
			$("*[data-group='sourceBranch']").html(headerData.sourceBranch);
			$("*[data-group='destinationBranch']").html(headerData.destinationBranch);
			$("*[data-group='branchPhoneNumber1']").html(headerData.branchPhoneNumber);
			$("*[data-group='companyGstNumber']").html(headerData.companyGstNumber);
			$("*[data-group='branchPhoneNoMoNoForChittor']").html( (headerData.branchContactDetailPhoneNumber || '--') + ' / ' +  (headerData.branchContactDetailPhoneNumber2 || '--') + ' / ' + (headerData.branchMobileNumber || '--'));
			
			if(headerData.branchGSTN != undefined && headerData.branchGSTN != null)
				$("*[data-group='branchGSTN']").html(headerData.branchGSTN);
			else
				$("*[data-group='branchGSTN']").html("--");
			
			if (pageCounter > 1) {
				var indexToRemove = 0;
				var numberToRemove = 1;
				
				headerbreak.splice(indexToRemove, numberToRemove);
				headerbreakPrint.splice(indexToRemove, numberToRemove);
				
				headerbreak.each(function(){	
					$(this).attr("class","page-break");
				});
					
				headerbreakPrint.each(function(){					
					$(this).attr("class","page-break"); 
				}) ;
				
				$('.page1').removeClass('hide');
				$('.page1Head').addClass("hide");
			} else {
				$('.hideFirstHeader').addClass("page1");
				$('.page1').removeClass('hide');
				$('.showSecondHeader').addClass("page1Head");
				$('.page1Head').addClass("hide");
			}
		
			$("[data-selector='branchAddressLabel']").html($("[data-selector='branchAddressLabel']").attr("data-addressLabel")+":");
			
			if(configuration.hoBranchID == billData.branchID) {
				$('.branchAddress').hide();
				$('.forAHMEDABADRAM').removeClass('hide');
				$('.elsebranch').addClass('hide');
			} else
				$("[data-address]").html(headerData[$("[data-address]").attr("data-address")]);
			
			$("[data-selector='branchPhoneNumberLabel']").html($("[data-phoneNumberLabel='branchPhoneNumberLabel']").attr("data-phoneNumberLabel")+":");

			var zerosReg = /[1-9]/g;

			if(headerData[$("[data-phoneNumber]").attr("data-phoneNumber")] != undefined) {
				var replacedString =  (headerData[$("[data-phoneNumber]").attr("data-phoneNumber")]).replace('-','');
				
				if(zerosReg.test(replacedString))
					$("[data-phoneNumber]").html(headerData[$("[data-phoneNumber]").attr("data-phoneNumber")]);
				else if(zerosReg.test(headerData[$("[data-mobileNumber]").attr("data-mobileNumber")]))
					$("[data-phoneNumber]").html(headerData[$("[data-mobileNumber]").attr("data-mobileNumber")]);
				else
					$("[data-phoneNumber]").html('');
			} 
			
			if(headerData[$("[data-phoneNumber]").attr("data-phoneNumber")] != undefined) {
				var phoneNoString = (headerData[$("[data-phoneNumber]").attr("data-phoneNumber")]).replace('-','');
				
				if(zerosReg.test(phoneNoString)) {
					$("[data-phoneNumber]").html(headerData[$("[data-phoneNumber]").attr("data-phoneNumber")]);
					$("#mobileNumber").addClass("hideNumber");
				}
			} else {
				$("#phoneNumber").addClass("hideNumber");
				
				if(headerData[$("[data-mobileNumber]").attr("data-mobileNumber")] != undefined) {
					var mobNoString = (headerData[$("[data-mobileNumber]").attr("data-mobileNumber")]).replace('-','');
					
					if(zerosReg.test(mobNoString))
						$("[data-mobileNumber]").html(headerData[$("[data-mobileNumber]").attr("data-mobileNumber")]);
				} else
					$("[data-mobileNumber]").html('');
			}
			
			let paymentQrBasePath = '/ivcargo/images/QR/' + configuration.accountGroupId + '/' + billData.branchID;
			let possibleExtensions = ['.jpeg', '.jpg', '.png'];
			let paymentQrPath = null;

			for (let i = 0; i < possibleExtensions.length; i++) {
				let currentPath = paymentQrBasePath + possibleExtensions[i];

				if (imageSrcExists(currentPath)) {
					paymentQrPath = currentPath;
					break;
				}
			}
			setCompanyLogos(configuration.accountGroupId);
			
			if (paymentQrPath != undefined && paymentQrPath != null)
				$(".paymentQr").attr("src", paymentQrPath);
			
			if(!configuration.showCompanyLogo)
				$('.logoRow').remove();
			
			if(configuration.showCompanyWaterMarkLogo)
					$(".companyWaterMarkLogo").removeClass('hide');
				
			pageCounter++;
		},setInformationDivs:function(infoData) {
			$("[data-info='DispatchNumber']").html(infoData[$("[data-info='DispatchNumber']").attr("data-info")]);
			$("[data-info='DispatchDate']").html(infoData[$("[data-info='DispatchDate']").attr("data-info")]);
			$("[data-info='DispatchFromBranch']").html(infoData[$("[data-info='DispatchFromBranch']").attr("data-info")]);
			$("[data-info='DispatchToBranch']").html(infoData[$("[data-info='DispatchToBranch']").attr("data-info")]);
			$("[data-info='vehicleNumber']").html(infoData[$("[data-info='vehicleNumber']").attr("data-info")]);
			$("[data-info='lorryHire']").html(infoData[$("[data-info='lorryHire']").attr("data-info")]);
			$("[data-info='driverName']").html(infoData[$("[data-info='driverName']").attr("data-info")]);
			$("[data-info='driverMobileNumber']").html(infoData[$("[data-info='driverMobileNumber']").attr("data-info")]);
			$("[data-info='branchGSTN']").html(infoData[$("[data-info='branchGSTN']").attr("data-info")]);
			$("[data-info='branchPanNumber']").html(infoData[$("[data-info='branchPanNumber']").attr("data-info")]);
			$("[data-info='branchMobileNumber']").html(infoData[$("[data-info='branchMobileNumber']").attr("data-info")]);
			$("[data-info='branchMobileNumber2']").html(infoData[$("[data-info='branchMobileNumber2']").attr("data-info")]);
			$("[data-info='branchContactDetailEmailAddress']").html(infoData[$("[data-info='branchContactDetailEmailAddress']").attr("data-info")]);
			if(infoData.showVehicleNumber){
				$(".hideVehicleNumber").css('display','none');
				$(".showColumn").css('display','block');
			}
			if(infoData.vehicleNumber == '--'){
		  		$(".hideVehicleNumberRow").html('')
			}
			
		}, setBillData : function(billData, suppBillData, customTaxForSrst, isBkgDlyTimeInvoicePrint) {
			  const [day, month, year] = billData.creationDateTimeStampStr.split('-');
			  const numericYear = parseInt(year);
			  const lastTwoDigits = numericYear % 100;
			  const formattedYear = `${lastTwoDigits}-${(lastTwoDigits + 1) % 100}`;
			  const fyStartYear = month < 4 ? numericYear - 1 : numericYear;
			  const fyEndYear = fyStartYear + 1;
			  let grandTotalWithRoundOffVLJL = Number(billData.grandTotalDecimal) + billData.roundOffAmount 			
			if(billData.wayBillTypeId == WAYBILL_TYPE_PAID){
				$('.forTopay').remove()
				$('.forTbb').remove()
			}else if(billData.wayBillTypeId == WAYBILL_TYPE_TO_PAY){
				$('.forPaid').remove()
				$('.forTbb').remove()
			}else{
				$('.forPaid').remove()
				$('.forTopay').remove()
			}
			
			if(billData.branchId == NOID_BRANCHID_68313 || billData.branchId == GHAZIABAD_BRANCHID_68317){
				$('.hideGSTN').hide()
			}else{
				$('.hideHardCodeGSTN').hide()
			}

			$("[data-bill='bookingTotalWithadditionalChargeWithoutTax']").html(billData.grandTotalIncludeGST - billData.totalTaxAmount);
			$("[data-bill='destBranchAddress']").html(billData[$("[data-bill='destBranchAddress']").attr("data-bill")]);
			$("[data-bill='destBranchAddressPincode']").html(billData[$("[data-bill='destBranchAddressPincode']").attr("data-bill")]);
			$("[data-bill='destBranchEmailAddress']").html(billData[$("[data-bill='destBranchEmailAddress']").attr("data-bill")]);
			$("[data-bill='destBranchPhoneNumber1']").html(billData[$("[data-bill='destBranchPhoneNumber1']").attr("data-bill")]);
			$("[data-bill='sourceBranchPhoneNumber1']").html(billData[$("[data-bill='sourceBranchPhoneNumber1']").attr("data-bill")]);
			$("[data-bill='sourceBranchGSTN']").html(billData[$("[data-bill='sourceBranchGSTN']").attr("data-bill")]);
			$("[data-bill='sourceBranchAddress']").html(billData[$("[data-bill='sourceBranchAddress']").attr("data-bill")]);
			$("[data-bill='emailAddress']").html(billData[$("[data-bill='emailAddress']").attr("data-bill")]);
			$("[data-bill='destinationBranchGSTN']").html(billData[$("[data-bill='destinationBranchGSTN']").attr("data-bill")]);
			$("[data-bill='deliveryAmount']").html(billData[$("[data-bill='deliveryAmount']").attr("data-bill")]);
			
			$("[data-bill='fyYear']").html(`${fyStartYear}-${fyEndYear}`);
			$("[data-bill='billNumberAbbas']").html("ATC/"+billData.billNumber+"/"+getFinancialYear());
			$("[data-bill='billNumber']").html(billData[$("[data-bill='billNumber']").attr("data-bill")]);
			$("[data-bill='dueDateStr']").html(billData[$("[data-bill='dueDateStr']").attr("data-bill")]);
			$("[data-bill='billingPartyAddress']").html(billData[$("[data-bill='billingPartyAddress']").attr("data-bill")]);
			$("[data-bill='creationDateTimeStampStr']").html(billData[$("[data-bill='creationDateTimeStampStr']").attr("data-bill")]);
			$("[data-bill='branchName']").html(billData[$("[data-bill='branchName']").attr("data-bill")]);
			$("[data-bill='branchAddress']").html(billData[$("[data-bill='branchAddress']").attr("data-bill")]);
			$("[data-bill='branchState']").html(billData[$("[data-bill='branchState']").attr("data-bill")]);
			$("[data-bill='creditorName']").html(billData[$("[data-bill='creditorName']").attr("data-bill")]);
			$("[data-bill='corporateAccountName']").html(billData[$("[data-bill='corporateAccountName']").attr("data-bill")]);
			$("[data-bill='corporateAccountEmailAddress']").html(billData[$("[data-bill='corporateAccountEmailAddress']").attr("data-bill")])
			$("[data-bill='creditorAddress']").html(billData[$("[data-bill='creditorAddress']").attr("data-bill")]);
			$("[data-bill='creditorAddressSpaceAfterComma']").html(billData.creditorAddress.replaceAll(",", ", "));
			$("[data-bill='creditorBranchName']").html(billData[$("[data-bill='creditorBranchName']").attr("data-bill")]);
			$("[data-bill='billNumberktc']").html("KTC/"+billData.billNumber).attr("data-bill");
			$("[data-bill='headOfficeBranchAddress']").html(billData[$("[data-bill='headOfficeBranchAddress']").attr("data-bill")]);
			$("[data-bill='headOfficeBranchName']").html(billData[$("[data-bill='headOfficeBranchName']").attr("data-bill")]);
			$("[data-bill='headOfficeBranchPincode']").html(billData[$("[data-bill='headOfficeBranchPincode']").attr("data-bill")]);
			
	
			if(billData.creditorMobileNumber != "0000000000" && billData.creditorMobileNumber != undefined) 
				$("[data-bill='creditorMobileNumber']").html(billData[$("[data-bill='creditorMobileNumber']").attr("data-bill")]);
			else
				$("[data-bill='creditorMobileNumber']").html(billData[$("[data-bill='']").attr("data-bill")]);
			
			$("[data-bill='creditorGstn']").html(billData[$("[data-bill='creditorGstn']").attr("data-bill")]);
			$("[data-bill='creditorState']").html(billData[$("[data-bill='creditorState']").attr("data-bill")]);

			$("[data-bill='grandTotal']").html(billData[$("[data-bill='grandTotal']").attr("data-bill")]);
			$("[data-bill='grandTotalForPCPL']").html(billData.grandTotal.toLocaleString());
			$("[data-bill='grandTotalRound']").html(billData[$("[data-bill='grandTotalRound']").attr("data-bill")]);
			$("[data-bill='grandTotalRoundInWord']").html(convertNumberToWords(billData.grandTotalRound)+ " Only");
			$("[data-bill='grandTotalDecimal']").html(billData[$("[data-bill='grandTotalDecimal']").attr("data-bill")]);
			$("[data-bill='roundOffAmount']").html(billData[$("[data-bill='roundOffAmount']").attr("data-bill")]);
			$("[data-bill='roundOffAmountWithSign']").html(billData.roundOffAmountWithSign);
			$("[data-bill='grandTotalInWord']").html(convertNumberToWord(Math.round(billData.grandTotal)) +' '+ 'Only');
			$("[data-bill='grandTotalWithoutRoundoffInWords']").html(convertNumberToWords(billData.grandTotal) + " Only");
			$("[data-bill='totalAmount']").html(billData.grandTotal);
			$("[data-bill='grandtotalForNM']").html("INR "+"&#X20B9;" +billData.grandTotal );
			$("[data-bill='grandTotalWithoutRoundOff'").html(billData.grandTotal - billData.roundOffAmount);
			$("[data-bill='grandTotalWithRoundOffVLJL'").html(grandTotalWithRoundOffVLJL);
			$("[data-bill='grandTotalWithRoundOffInWordVLJL'").html(convertNumberToWords(grandTotalWithRoundOffVLJL) + " only");
			$("[data-bill='grandTotalWithRoundOff'").html(billData.grandTotal + billData.roundOffAmount);
			$("[data-bill='grandTotalWithRoundOffInWord'").html(convertNumberToWords(billData.grandTotal + billData.roundOffAmount) + " only");
			$("[data-bill='grandTotalForTCS']").html(billData.grandTotalForTCS)
			$("[data-bill='grandTotalInWordsForTCS']").html(convertNumberToWords(billData.grandTotalForTCS) + " only")
			$("[data-bill='totalAmountRoundOff']").html(Math.round(billData.grandTotal).toFixed(2));
			$("[data-bill='totalTax']").html(billData[$("[data-bill='totalTax']").attr("data-bill")]);
			$("[data-bill='totalTaxRoundOff']").html(billData[$("[data-bill='totalTaxRoundOff']").attr("data-bill")]);
			$("[data-bill='totalExcludingtax']").html(billData[$("[data-bill='totalExcludingtax']").attr("data-bill")]);
			$("[data-bill='stateCode']").html(billData[$("[data-bill='stateCode']").attr("data-bill")]);
			$("[data-bill='partyStateCode']").html(billData[$("[data-bill='partyStateCode']").attr("data-bill")]);
			$("[data-bill='billRemark']").html(billData[$("[data-bill='billRemark']").attr("data-bill")]);
			$("[data-bill='billRemarkDash']").html(billData[$("[data-bill='billRemarkDash']").attr("data-bill")]);
			$("[data-bill='additionalCharge']").html(billData[$("[data-bill='additionalCharge']").attr("data-bill")]);
            $("[data-bill='additionalChargePercentMgllp']").html(Math.round((billData.additionalCharge / billData.grandTotalForTCS) * 100) + "%");
			$("[data-bill='additionalChargePercent']").html(Math.round((billData.additionalCharge / billData.grandTotalDecimal) * 100) + "%");
			$("[data-bill='unAddedTaxAmount']").html(billData[$("[data-bill='unAddedTaxAmount']").attr("data-bill")]);
			$("[data-bill='fromDateStr']").html(billData[$("[data-bill='fromDateStr']").attr("data-bill")]);
			$("[data-bill='toDateStr']").html(billData[$("[data-bill='toDateStr']").attr("data-bill")]);
			$("[data-bill='cgst']").html(billData[$("[data-bill='cgst']").attr("data-bill")]);
			$("[data-bill='sgst']").html(billData[$("[data-bill='sgst']").attr("data-bill")]);
			$("[data-bill='igst']").html(billData[$("[data-bill='igst']").attr("data-bill")]);
			$("[data-bill='IGSTtaxPecentage']").html(billData.IGSTtaxPecentage);
			$("[data-bill='GrandTotalIncludingTaxes']").html(billData[$("[data-bill='GrandTotalIncludingTaxes']").attr("data-bill")]);
			$("[data-bill='GrandTotalIncludingTaxesInWord']").html(convertNumberToWord(Math.round(billData.GrandTotalIncludingTaxes)) + ' only');
			$("[data-bill='grandTotalWithTaxAndAdditional']").html(convertNumberToWord(Math.round(billData.grandTotalWithTaxAndAdditionalCharge)) + ' only');
			$("[data-bill='grandTotalWithTaxAndAdditionalWithDecimal']").html(billData.grandTotalWithTaxAndAdditionalWithDecimal);
			$("[data-bill='partyStateName']").html(billData[$("[data-bill='partyStateName']").attr("data-bill")]);
			$("[data-bill='creditorPartyCityName']").html(billData[$("[data-bill='creditorPartyCityName']").attr("data-bill")]);
			$("[data-bill='creditorPartyPincode']").html(billData[$("[data-bill='creditorPartyPincode']").attr("data-bill")]);
			$("[data-bill='branchID']").html(billData[$("[data-bill='branchID']").attr("data-bill")]);
			$("[data-bill='executiveName']").html(billData[$("[data-bill='executiveName']").attr("data-bill")]);
			$("[data-bill='executiveLoginName']").html(billData[$("[data-bill='executiveLoginName']").attr("data-bill")]);
			$("[data-bill='customCreationDateTimeStampStr']").html(billData[$("[data-bill='customCreationDateTimeStampStr']").attr("data-bill")]);
			$("[data-bill='customCreationMonthYear']").html(convertDateToOtheFormat(billData.customCreationDateTimeStampStr, 2, "/"));
		 
		     let addedDaysToDueDate 	=  addDaysToDueDate(billData.customCreationDateTimeStampStr,15)
			$("[data-bill='DueDateBillDateBy15']").html(addedDaysToDueDate)
			$("[data-bill='prevBillNumber']").html(billData[$("[data-bill='prevBillNumber']").attr("data-bill")]);
			$("[data-bill='prevCreationDate']").html(billData[$("[data-bill='prevCreationDate']").attr("data-bill")]);
			$("[data-bill='totalBillClearenceAmount']").html(round2(billData[$("[data-bill='totalBillClearenceAmount']").attr("data-bill")]));
			$("[data-bill='currentBillAmount']").html(round2(billData[$("[data-bill='currentBillAmount']").attr("data-bill")]));
			$("[data-bill='totalAmnt']").html(billData[$("[data-bill='totalAmnt']").attr("data-bill")]);
			$("[data-bill='pdlGrandTotal']").html(billData[$("[data-bill='pdlGrandTotal']").attr("data-bill")]);
			$("[data-bill='grandTotalWithTaxAndAdditionalCharge']").html(billData[$("[data-bill='grandTotalWithTaxAndAdditionalCharge']").attr("data-bill")]);
			$("[data-bill='grandTotalWithTaxAndAdditionalChargeInDecimal']").html(billData[$("[data-bill='grandTotalWithTaxAndAdditionalChargeInDecimal']").attr("data-bill")]);
			$("[data-bill='grandTotalWithTaxAndAdditionalChargeInDecimalWithCommas']").html(Number(billData.grandTotalWithTaxAndAdditionalChargeInDecimal).toLocaleString("en-IN", { minimumFractionDigits: 2 }));
			$("[data-bill='grandTotalWithTaxAndAdditionalChargeInDecimalInword']").html(convertNumberToWords(billData.grandTotalWithTaxAndAdditionalChargeInDecimal) + ' only');
  

			$("[data-bill='pdlGrandTotalinWords']").html(convertNumberToWord(Math.round(billData.grandTotal + billData.additionalCharge)) + ' only');
			$("[data-bill='creditorPanNumber']").html(billData[$("[data-bill='creditorPanNumber']").attr("data-bill")]);
			$("[data-bill='grandTotalforHanumann']").html(billData.grandTotal+".00");
			$("[data-bill='totalAmount']").html(`<span class="rupeeSymbol">&#X20B9;</span>`+billData.grandTotal);
			$("[data-bill='totalAmntInWords']").html(convertNumberToWord(Math.round(billData.totalAmnt)) + ' only');
			$("[data-bill='TotalTaxGst']").html(Math.round(billData.totalTax));
			$("[data-bill='TotalTaxGstWithoutRoundOff']").html(billData.totalTax);
			$("[data-bill='totalAmntWithoutRoundOff']").html(round2(billData.totalAmntWithoutRoundOff));
			
			$("[data-bill='creditorNameForPrint']").html(billData[$("[data-bill='creditorNameForPrint']").attr("data-bill")]);
			$("[data-bill='creditorGstnForPrint']").html(billData[$("[data-bill='creditorGstnForPrint']").attr("data-bill")]);
			$("[data-bill='creditorAddressForPrint']").html(billData[$("[data-bill='creditorAddressForPrint']").attr("data-bill")]);
			
			$("[data-bill='creditorBranchGstn']").html(billData[$("[data-bill='creditorBranchGstn']").attr("data-bill")]);
			
			$("[data-bill='totalAmntInWordsDecimal']").html(billData.billTotalInWords);
			$("[data-bill='prevTotalAmntInWords']").html(billData.preBillTotalInWords); 
			
			$("[data-bill='cgstwithoutRoundOff']").html(billData[$("[data-bill='cgstwithoutRoundOff']").attr("data-bill")]);
			$("[data-bill='sgstwithoutRoundOff']").html(billData[$("[data-bill='sgstwithoutRoundOff']").attr("data-bill")]);
			$("[data-bill='igstwithoutRoundOff']").html(billData[$("[data-bill='igstwithoutRoundOff']").attr("data-bill")]);
			$("[data-bill='branchCode']").html(billData[$("[data-bill='branchCode']").attr("data-bill")]);
			$("[data-bill='cityName']").html(billData[$("[data-bill='cityName']").attr("data-bill")]);
			$("[data-bill='pinCode']").html(billData[$("[data-bill='pinCode']").attr("data-bill")]);
			$("[data-bill='billSubRegion']").html(billData[$("[data-bill='billSubRegion']").attr("data-bill")]);
			$("[data-bill='billingBranchCode']").html(billData[$("[data-bill='billingBranchCode']").attr("data-bill")]);
			$("[data-bill='creditorBranchAddress']").html(billData[$("[data-bill='creditorBranchAddress']").attr("data-bill")]);
			$("[data-bill='creditorBranchPinCode']").html(billData[$("[data-bill='creditorBranchPinCode']").attr("data-bill")]);
			$("[data-bill='creditorBranchCityName']").html(billData[$("[data-bill='creditorBranchCityName']").attr("data-bill")]);
			$("[data-bill='creditorBranchState']").html(billData[$("[data-bill='creditorBranchState']").attr("data-bill")]);
			$("[data-bill='creditorBranchEmailAddress']").html(billData[$("[data-bill='creditorBranchEmailAddress']").attr("data-bill")]);
			$("[data-bill='corporateAccountBranch']").html(billData[$("[data-bill='corporateAccountBranch']").attr("data-bill")]);
			$("[data-bill='corporateAccountBranchCity']").html(billData[$("[data-bill='corporateAccountBranchCity']").attr("data-bill")]);
			$("[data-bill='billingBranchGstn']").html(billData[$("[data-bill='billingBranchGstn']").attr("data-bill")]);
			$("[data-bill='billingBranchPan']").html(billData[$("[data-bill='billingBranchPan']").attr("data-bill")]);
			$("[data-bill='billingBranchPhonNumber1']").html(billData[$("[data-bill='billingBranchPhonNumber1']").attr("data-bill")]);
			$("[data-bill='emailAddress']").html(billData[$("[data-bill='emailAddress']").attr("data-bill")]);
			$("[data-bill='sacCode']").html(billData[$("[data-bill='sacCode']").attr("data-bill")]);
			$("[data-bill='vcode']").html(billData[$("[data-bill='vcode']").attr("data-bill")]);
			$("[data-bill='poDateStr']").html(billData[$("[data-bill='poDateStr']").attr("data-bill")]);
			$("[data-bill='roundOffTaxAmount']").html(billData[$("[data-bill='roundOffTaxAmount']").attr("data-bill")]);
			$("[data-bill='additionalDiscount']").html(billData[$("[data-bill='additionalDiscount']").attr("data-bill")]);
			$("[data-bill='TotalTaxGstAmount']").html(Math.round(billData.totalTaxAmount));
			$("[data-bill='cgstWithoutRoundOff']").html(billData[$("[data-bill='cgstWithoutRoundOff']").attr("data-bill")]);
			$("[data-bill='sgstWithoutRoundOff']").html(billData[$("[data-bill='sgstWithoutRoundOff']").attr("data-bill")]);
			$("[data-bill='igstWithoutRoundOff']").html(billData[$("[data-bill='igstWithoutRoundOff']").attr("data-bill")]);
			var sgstCgstWithoutRoundOff = parseFloat(billData.cgstWithoutRoundOff) + parseFloat(billData.sgstWithoutRoundOff);
			$("[data-bill='sgstCgstWithoutRoundOff']").html(sgstCgstWithoutRoundOff);
			$("[data-bill='grandTotalWithGST']").html(Math.round(billData.totalExcludingtax + billData.igst + billData.sgst + billData.cgst));
			$("[data-bill='grandTotalWithGSTinWords']").html(convertNumberToWord(Math.round(billData.totalExcludingtax + billData.igst + billData.sgst + billData.cgst)));
			$("[data-bill='grandTotalIncludingTaxesAndAdditionalChargeInWord']").html(convertNumberToWord(Math.round(billData.GrandTotalIncludingTaxes)) + ' only');
			$("[data-bill='hsnCode']").html(billData[$("[data-bill='hsnCode']").attr("data-bill")]);
			$("[data-bill='totalAmountWithAdditionalChg']").html(Math.round(billData.totalExcludingtax+billData.additionalCharge));
			$("[data-bill='totalAmountWithAdditionalChgWithoutRoundOff']").html(billData.totalExcludingtax+billData.additionalCharge);
			$("[data-bill='totalRoundOffslpl']").html(billData.totalExcludingtax+billData.additionalCharge + billData.sgst + billData.cgst + billData.igst);
			$("[data-bill='totalRoundOffSlplInWord']").html(convertNumberToWord(billData.totalExcludingtax + billData.additionalCharge + billData.sgst + billData.cgst + billData.igst) +' '+ 'only');
			//	$("[data-bill='bbbb']").html(Math.round(billData.TotalTaxGstAmount+billData.));
			$("[data-bill='totalAmountWithAdditionalChg']").html(Math.round(billData.totalExcludingtax + billData.additionalCharge));
			$("[data-bill='totalAmountWithAdditionalChgAndAdditonalDisc']").html(Math.round(billData.totalExcludingtax + billData.additionalCharge));
			$("[data-bill='totalAmountWithAdditionalChgAndAdditonalDiscInWord']").html(convertNumberToWord(Math.floor(billData.totalExcludingtax + billData.additionalCharge)) + ' only');

			$("[data-bill='sourceBranchWithState']").html(billData.sourceBranchWithState);
			$("[data-bill='destinationBranchWithState']").html(billData.destinationBranchWithState);
			$("[data-bill='consigneeStateCode']").html(billData.consigneeStateCode);
			$("[data-bill='consigneeState']").html(billData.consigneeState);
			$("[data-bill='ftlBookingVehicleNumber']").html(billData.ftlBookingVehicleNumber);
			$("[data-bill='consignorState']").html(billData.consignorState);
			$("[data-bill='consignorStateCode']").html(billData.consignorStateCode);
			$("[data-bill='consignorGSTN']").html(billData.consignorGSTN);
			$("[data-bill='consignorName']").html(billData.consignorName);
			
			$("[data-bill='consignorAddress']").html(billData.consignorAddress);
			$("[data-bill='deliveryCgst']").html(billData[$("[data-bill='deliveryCgst']").attr("data-bill")]);
			$("[data-bill='deliverySgst']").html(billData[$("[data-bill='deliverySgst']").attr("data-bill")]);
			$("[data-bill='deliveryIgst']").html(billData[$("[data-bill='deliveryIgst']").attr("data-bill")]);
			$("[data-bill='consigneePincode']").html(billData.consigneePincode);
			
			if(billData.taxTypeId == FCM) {
				$("[data-bill='CGST']").html("CGST " + 6 + "%");
				$("[data-bill='SGST']").html("SGST " + 6 + "%");
				$("[data-bill='IGST']").html("IGST " + 12 + "%");
				$("[data-bill='totalAmountt']").html(Math.round(billData.grandTotal + billData.additionalCharge));
				$("[data-bill='totalAmountntInWords']").html(convertNumberToWord(Math.round(billData.grandTotal + billData.additionalCharge)) + ' only');
			} if(billData.taxTypeId == RCM){
				$("[data-bill='CGST']").html("CGST " + 2.5 + "%");
				$("[data-bill='SGST']").html("SGST " + 2.5 + "%");
				$("[data-bill='IGST']").html("IGST " + 5 + "%");
				$("[data-bill='totalAmountt']").html(Math.round(billData.totalExcludingtax + billData.additionalCharge));
				$("[data-bill='totalAmountntInWords']").html(convertNumberToWord(Math.round(billData.totalExcludingtax + billData.additionalCharge)) + ' only');
			}
			
			if(billData.billOfSupply)
				$("[data-selector='billOfSupply']").html("Bill Of Supply");
			else
				$("[data-selector='billOfSupply']").html("Tax Invoice");
			
			$("*[data-bill='modifiedDate']").html(convertDateToOtheFormat(billData.creationDateTimeStampStr, 1, '-')); 
				
			if(billData.consignorName == billData.creditorName){
				$('.hideConsignorName').hide();	
			}
				
			var datetetete = billData.creationDateTimeStampStr;
			var arr = datetetete.split("-");
			var finalDate = arr[0] + "-" + arr[1] + "-" + arr[2].substring(2, 4);
			$("[data-bill='date']").html(finalDate);
			
			grandTotalInword	= convertNumberToWord(Math.round(billData.grandTotal)) + ' only';
			grandTotalRound		= Math.round(billData.grandTotal);
			grandTotal			= billData.grandTotal;
			roundOffAmount		= billData.grandTotal - Math.round(billData.grandTotal);
			grandTotalWithTaxAndAdditionalCharge = Math.round(billData.grandTotalWithTaxAndAdditionalCharge);
			
			$("[data-bill='grandTotalRoundwithdecimal']").html(Math.round(billData.grandTotal).toFixed(2));
			
			if(billData.executiveName != undefined && billData.executiveName != 'undefined')
				executiveName = billData.executiveName;
			
			if(suppBillData != undefined && suppBillData.length > 0)
				$("[data-bill='totalAmount1']").html(billData.grandTotal + suppBillData[0].grandTotal);
			else
				$("[data-bill='totalAmount1']").html(billData.grandTotal);
		
			if(!billData.additionalCharge > 0) {
				$('.additionalChargerow').hide();
				$('.additionalCharge').hide();
			}
			
			if(billData.additionalDiscount <= 0)
				$('.additionalDiscountrow').hide();	
						
			if((billData.sgstwithoutRoundOff <= 0 && billData.cgstwithoutRoundOff) && billData.igstwithoutRoundOff <= 0)	
				$('.gsttable').hide();	
			
			if (billData.igst > 0)
				$(".showCgst").hide();
			else if (billData.cgst > 0 || billData.sgst > 0)
				$(".showIgst").hide();
			else {
				$(".showCgst, .showIgst").hide();
				$("[data-bill='totalTaxRoundOff']").closest("tr").hide();
			}

			if(billData.igst > 0)
				$(".showIgst").show();
			else
				$(".showIgst").hide();
			
			if(billData.cgst > 0)
				$(".showCgst").show();
			else
				$(".showCgst").hide();	
				
			if(billData.sgstwithoutRoundOff > 0 || billData.cgstwithoutRoundOff > 0) {
				var gstCalculationForSrst = Number(((customTaxForSrst * 6) / 100).toFixed(2));
				$("[data-bill='sgstForSrst']").html(gstCalculationForSrst);
				$("[data-bill='cgstForSrst']").html(gstCalculationForSrst);
				$("[data-bill='igstForSrst']").html(0);
			} else if(billData.igstwithoutRoundOff > 0) {
				$("[data-bill='sgstForSrst']").html(0);
				$("[data-bill='cgstForSrst']").html(0);
				$("[data-bill='igstForSrst']").html(Number(((customTaxForSrst * 12) / 100).toFixed(2)));				
			}
			
			var grandTotalForSrst =	 Math.round(customTaxForSrst + Number(((customTaxForSrst * 12) / 100).toFixed(2)));
			 $("[data-bill='grandTotalForSrst']").html(grandTotalForSrst);
			
			$("[data-bill='grandTotalForSrstInWords']").html(convertNumberToWord(Math.round(grandTotalForSrst)) + ' only');				
			$("[data-bill='grandtotalKmp']").html('Rs.'+billData.grandTotal + '/-');
			$("[data-bill='grandTotalIncludeGST']").html(billData[$("[data-bill='grandTotalIncludeGST']").attr("data-bill")]);
			$("[data-bill='consigneeName']").html(billData[$("[data-bill='consigneeName']").attr("data-bill")]);
			$("[data-bill='consigneeAddress']").html(billData[$("[data-bill='consigneeAddress']").attr("data-bill")]);
			$("[data-bill='consigneeGSTN']").html(billData[$("[data-bill='consigneeGSTN']").attr("data-bill")]);
			$("[data-bill='collectionPreson']").html(billData[$("[data-bill='collectionPreson']").attr("data-bill")]);
			$("[data-bill='grandTotalIncludeAdditionalChrgInWord']").html(convertNumberToWord(Math.round(billData.grandTotal+billData.additionalCharge)) + ' only');
			
			if(billData.showDetailsForSngt)
				$(".hideOldDetailsSngt").hide();
			else
				$(".hideNewDetailsForSngt").hide();
			
			if(billData.billRemark != undefined)
				$(".hideRemark").show();
			else
				$(".hideRemark").hide();
			
			if(!billData.prevBillNumber > 0)
				$(".hidePrevBillTotal").hide();
				
			if(billData.poNumber != undefined){
				$("[data-selector='poNumber']").html("PO NO.  :");
				$("[data-bill='poNumber']").html(billData.poNumber);
			}
			
			if(billData.msmiNumber != undefined){
				$("[data-selector='msmiNumber']").html("MSMI NO.  :");
				$("[data-bill='msmiNumber']").html(billData.msmiNumber);
			}
			
			if(billData.IGSTtaxPecentage != undefined && billData.CGSTtaxPecentage != undefined){
				$("[data-selector='CGSTWithPercent']").html("CGST Amount @ "+ billData.CGSTtaxPecentage +"%");
				$("[data-selector='SGSTWithPercent']").html("SGST Amount @ "+ billData.CGSTtaxPecentage +"%");
				$("[data-selector='IGSTWithPercent']").html("IGST Amount @ "+ billData.IGSTtaxPecentage +"%");
			}
			if(billData.igstPercentage	 != undefined && billData.sgstPercentage != undefined && billData.cgstPercentage != undefined ) {
				$("[data-selector='CGSTWithPercentNM']").html("CGST	 @ "+ billData.cgstPercentage +"%");
				$("[data-selector='SGSTWithPercentNM']").html("SGST	 @ "+ billData.sgstPercentage +"%");
				$("[data-selector='IGSTWithPercentNM']").html("IGST	 @ "+ billData.igstPercentage +"%");
				$("[data-selector='CGSTSGSTWithPercentNM']").html("CGST & SGST	@ "+ billData.igstPercentage +"%");
			}
			
			if(billData.IGSTtaxPecentage != undefined && billData.CGSTtaxPecentage != undefined){
				$("[data-selector='CGSTWithPercentage']").html(billData.CGSTtaxPecentage +"%");
				$("[data-selector='IGSTWithPercentage']").html(billData.IGSTtaxPecentage +"%");
			}

			if (isBkgDlyTimeInvoicePrint == 'true')
				$('.hideNameGstLable').addClass("hide");
			else
				$('.hideNameGstLable').removeClass('hide');
			
			//GST CALCULATION FOR DASHMESH
			
			var gstCalculation = ((billData.grandTotal - billData.totalTaxAmount) * 2.5) / 100;
			$("[data-table='cgstForDashmesh']").html(gstCalculation);
			$("[data-table='sgstForDashmesh']").html(gstCalculation);
			$("[data-table='totalgstForDashmesh']").html(gstCalculation * 2);
			
			var gstCalculation = ((billData.grandTotal + billData.additionalCharge) * 2.5) / 100;
			$("[data-table='cgstForJtm']").html(gstCalculation);
			$("[data-table='sgstForJtm']").html(gstCalculation);
			$("[data-table='totalgstForJtm']").html(gstCalculation * 2);
			
			if(billData.billSubRegionId == CHENNAI_SUBREGION_14546)
				$('.hydrabadBankDetails').hide();
			else
				$('.chennaiBankDetails').hide();

			if(billData.accountGroupId == ACCOUNT_GROUP_ID_MGLLP && billData.billSubRegionId == DELHI_NCR_SUBREGION_13586 || billData.accountGroupId == ACCOUNT_GROUP_ID_MGTS && billData.billSubRegionId == DELHI_NCR_SUBREGION_14196){
				$("[data-bill='branchAddress']").html('Shop No. 67, Near Tis Hazari Court, Delhi')
			}
			
			$("[data-bill='igstForSFC']").html((Math.round(billData.grandTotal) * 0.05).toFixed(2))
			
			let sgstCgstForVector = Number((billData.grandTotal * 0.025).toFixed(2))
			$("[data-bill='sgstForVector']").html(sgstCgstForVector)
			$("[data-bill='cgstForVector']").html(sgstCgstForVector)
			$("[data-bill='totalGstForVector']").html(sgstCgstForVector + sgstCgstForVector)
			
			if (billData.accountGroupId == ACCOUNT_GROUP_ID_SMTS) {
				if (billData.partyStateCode == "33") {
					if(billData.CGSTtaxPecentage == 6)
						$("[data-selector='gstLabelForSmts']").html("SGST 6.0% + CGST 6.0% :")
					else if(billData.CGSTtaxPecentage == 2.5)
						$("[data-selector='gstLabelForSmts']").html("SGST 2.5% + CGST 2.5% :")
					else if(billData.CGSTtaxPecentage == 9)
						$("[data-selector='gstLabelForSmts']").html("SGST 9% + CGST 9% :")
				} else {
					if(billData.IGSTtaxPecentage == 12)
						$("[data-selector='gstLabelForSmts']").html("IGST 12.0% :")
					else if(billData.IGSTtaxPecentage == 5)
						$("[data-selector='gstLabelForSmts']").html("IGST 5.0% :")
					else if(billData.CGSTtaxPecentage == 18)
						$("[data-selector='gstLabelForSmts']").html("IGST 18.0% :")
				}
			
				if(billData.IGSTtaxPecentage!= undefined) {
					var igstForSmts = (billData.grandTotal * billData.IGSTtaxPecentage)/100;
					$("[data-bill='gstForSmts']").html(igstForSmts.toFixed(2));
				} else if(billData.CGSTtaxPecentage!= undefined){
					var cgstForSmts =(2* (billData.grandTotal * billData.CGSTtaxPecentage))/100;
					$("[data-bill='gstForSmts']").html(cgstForSmts.toFixed(2));
				}
			}
			
			if (billData.creditorGstn && billData.creditorGstn.substring(0, 2) == 33) {
				$('.igstRow').remove()
				$("[data-bill='GstForPanIndia']").html(Math.round(billData.totalTaxAmount / 2));
			} else {
				$('.sgstcgstRow').remove()
				$("[data-bill='GstForPanIndia']").html(Math.round(billData.totalTaxAmount));
			}
			
		}, setBranchWiseBankDetails : function(branchWiseBankDetails, createBranchId) {
			if(branchWiseBankDetails == undefined || branchWiseBankDetails == null || branchWiseBankDetails.length == 0) {
				$('.branchWiseBankDetails').hide();
				return;
			}
				
			$('.branchWiseBankDetails').show();
			
			var columnArray						= new Array();
			for(i = 0; i < branchWiseBankDetails.length; i++){	
				columnArray.push("<td class='letterSpacing centerAlign' id='bankAccountName'>"+branchWiseBankDetails[i].bankAccountName+"</td> ");
				columnArray.push("<td class='letterSpacing centerAlign' id='bankAccountNumber'>"+branchWiseBankDetails[i].bankAccountNumber + "</td> ");
				columnArray.push("<td class='letterSpacing centerAlign' id='ifscCode'>"+branchWiseBankDetails[i].ifscCode + "</td> ");
				columnArray.push("<td class='letterSpacing centerAlign' id='micrCode'>"+branchWiseBankDetails[i].micrCode + "</td> ");
				columnArray.push("<td class='letterSpacing centerAlign' id='address'>"+branchWiseBankDetails[i].address +"</td> ");
				$('#bankDetailsTable tbody').append("<tr>" + columnArray.join(' ') + '</tr>');
				columnArray = [];
				if(branchWiseBankDetails[i].branchId == createBranchId){
					$("*[data-bankData='bankAccountName']").html(branchWiseBankDetails[i].bankAccountName);
					$("*[data-bankData='bankAccountNumber']").html(branchWiseBankDetails[i].bankAccountNumber);
					$("*[data-bankData='address']").html(branchWiseBankDetails[i].bankAddress);
					$("*[data-bankData='ifscCode']").html(branchWiseBankDetails[i].ifscCode);
					$("*[data-bankData='micrCode']").html(branchWiseBankDetails[i].micrCode);
				}
			}
			
			if (branchWiseBankDetails[0]) {
				$("*[data-firstBankData='bankAccountName']").html(branchWiseBankDetails[0].bankAccountName);
				$("*[data-firstBankData='bankAccountNumber']").html(branchWiseBankDetails[0].bankAccountNumber);
				$("*[data-firstBankData='ifscCode']").html(branchWiseBankDetails[0].ifscCode);
				$("*[data-firstBankData='branchName']").html(branchWiseBankDetails[0].branchName);
				$("*[data-firstBankData='address']").html(branchWiseBankDetails[0].bankAddress);
			}
		}, setCurrentDateTime : function(response) {
			$("*[data-time='current']").html(response.currentTime);
			$("*[data-date='current']").html(response.currentDate);
		}, setSuppBillDetails : function(suppBillData) {
			if(suppBillData == undefined)
				return;
			
			var columnArray			= new Array();
			var	srNo				= 0;
			var totalSuppBillAmt	= 0;
			
			if(suppBillData.length > 0){
				$('#suppBillTableTD').show();
				
				var suppsupplementaryBillNo	= suppBillData[0].supplementaryBillNo;
				$('#suppsupplementaryBillNo').html(suppsupplementaryBillNo);
				
				for(i = 0; i < suppBillData.length; i++) {
					srNo++;
					columnArray.push("<td class='textCenter BorderBottom BorderLeft BorderRight'>"+srNo+"</td> ");
					columnArray.push("<td class='textCenter BorderBottom BorderRight pageBreakNeeded'>"+suppBillData[i].description+"</td> ");
					columnArray.push("<td class='textCenter BorderBottom BorderRight'>"+suppBillData[i].amount+"</td> ");
					columnArray.push("<td class='textCenter BorderBottom BorderRight pageBreakNeeded'>"+suppBillData[i].remark+"</td> ");
					totalSuppBillAmt	+= suppBillData[i].amount;
					
					$('#suppBillTable tbody').append("<tr>" + columnArray.join(' ') + '</tr>');
					columnArray = [];
				}	
				
				$('#grandTotal').html(totalSuppBillAmt);
			}
		
		}, setDataTableDetails : function(tableData, configuration, dynamicCharges) {
			var	 purchaseOrder;
			var emailAddress;
			var accountGroupId	= configuration.accountGroupId;
			const chargeMap = new Map();
			
			for(const element of tableData) {
				purchaseOrder			= element.purchaseOrderNumber;
				emailAddress 			= element.emailAddress;
				break;
			}
			
			for (var index in tableData) {
				var pos = Number(index) + Number(1);

				$("*[data-consignmentPackingTypeWithSaidToContain='" + (pos) + "']").html(tableData[index].packageDetailsWithSaidTocontain);
				$("*[data-consignmentHSNCode='" + (pos) + "']").html(tableData[index].lrHsnCode);
				$("*[data-consignmentLrNumber='" + (pos) + "']").html(tableData[index].lrNumber);
				$("*[data-consignmentBokkingDate='" + (pos) + "']").html(tableData[index].custimezBookingDateTimeStr);
				$("*[data-consignmentTotalArticle='" + (pos) + "']").html(tableData[index].totalArticle);
				$("*[data-consignmentTotalWeight='" + (pos) + "']").html(tableData[index].totalWeight);
				$("*[data-consignmentAtricleRate='" + (pos) + "']").html(tableData[index].articalRateforSES);
				$("*[data-consignmentBokkingCharge='" + (pos) + "']").html(tableData[index].TotalBookingCharge);
			}
			
			$("[data-table='lrcount']").html(tableData.length - 1)
			$("[data-dataTableDetail='poNumberEdisafe']").html(purchaseOrder);
			$("[data-dataTableDetail='emailAddress']").html(emailAddress);
			
			$("[data-bill='billPeriod']").html(tableData[0].custimezBookingDateTimeStr + " TO " + tableData[tableData.length-2].custimezBookingDateTimeStr);
			$("*[data-bill='billPeriodModified']").html(convertDateToOtheFormat(tableData[0].custimezBookingDateTimeStr, 1, '/'));
			$("[data-bill='billPeriodInMonth']").html(
				convertDateToOtheFormat(tableData[0].custimezBookingDateTimeStr, 3, "/") + " to " +
				convertDateToOtheFormat(tableData[tableData.length-2].custimezBookingDateTimeStr, 3, "/")
			);
			
			tableData.pop();
			var tbody	= $("[data-dataTableDetail='srNumber']").parent().parent();
			var tbody1	= $("[data-dataTableDetail2='srNumber1']").parent().parent();
		
			tbody		= (tbody[tbody.length-1]);
			tbody1		= (tbody1[tbody1.length-1]);
			columnObjectForDetails		= $("[data-row='dataTableDetails']").children();
			columnObjectForDetails2		= $("[data-row='dataTableDetails2']").children();
			var TableDataHtml	= $("#TableDataHtml")
			var TableDataHtml2	= $("#TableDataHtml2")
			$(tbody).before(TableDataHtml);
			$(tbody1).before(TableDataHtml2);
			
			if(!configuration.autoPageBreak && !configuration.removeAutoPageBreak) {
				var dataTable	= $("#dataTable").clone();
				$("#dataTable").remove();
				$(dataTable).removeClass('hide');
				$(tbody).before(dataTable);
				$(tbody1).before(dataTable);
			}
			
			var totalChargeWt =0;
			var totalArticle =0;
			var totalfreight =0;
			var totallrFreight =0;
			var totalStatisticalCharge =0;
			var TotalOtherCharge =0;
			var totalAmount =0;
			var grandTotalInWord=" ";
			
			if(configuration.accountGroupId == ACCOUNT_GROUP_ID_SRRS){//SRRS
				require(['/ivcargo/resources/js/module/view/invoiceprint/invoiceprintsetup_' + accountGroupId + '.js'], function(SheetSetUp) {
					SheetSetUp.setCutomDataForSrrs(tableData, columnObjectForDetails, tbody);
				});
			} else {
				for(const element of tableData) {
					var page =	tableData.length;
				
					totalChargeWt		+= element.chargeWeight;
					totalArticle		+= element.totalArticle;
					totalfreight		+= element.lrFreight;
					totallrFreight		+= element.freight;
					totalStatisticalCharge += element.StatisticalCharge;
					totalAmount			+= element.lrGrandTotal;
					TotalOtherCharge	+= element.otherChargeForCustom;
					grandTotalInWord	= (convertNumberToWord(Math.round(totalAmount)) + ' only')
				
					let lrBookingCharges = element.bookingCharges;
				
					if(lrBookingCharges != undefined) {
						lrBookingCharges.forEach(charge => {
							const key = charge.chargeTypeMasterName;
						
							if (chargeMap.has(key)) {
								// If the charge type already exists, update the existing charge amount
								const existingCharge = chargeMap.get(key);
								existingCharge.wayBillBookingChargeChargeAmount += charge.wayBillBookingChargeChargeAmount;
							} else {
								// If the charge type does not exist, add it to the map
								// Clone the charge object to avoid mutating the original
								chargeMap.set(key, { ...charge });
							}
						});
					}
				
					$("[data-bill='pageCount']").html(page);
				
					var newtr = $("<tr></tr>");
					var newtr1 = $("<tr></tr>");
				
					for(var j = 0; j < columnObjectForDetails.length; j++) {
						var newtd = $("<td></td>");
						var dataPicker = $(columnObjectForDetails[j]).attr("data-dataTableDetail");
						
						if(configuration.isFromIVEditor) {
							var templateTd = $(columnObjectForDetails[j]);
							newtd.attr("style", templateTd.attr("style"));
							newtd.attr("class", templateTd.attr("class"));
						}
							
						if( dataPicker =="lrBookingDateTimeStrFormatYY"){
							var datetetete = element.lrBookingDateTimeStr;
							var arr = datetetete.split("-");
							var finalDate = arr[0]+"-"+arr[1]+"-"+arr[2].substring(2, 4);
							$(newtd).html(finalDate);
						}
				
						if( dataPicker =="lrNumberWithDate"){
							var datetetete = element.lrBookingDateTimeStr;
							var arr = datetetete.split("-");
							var finalDate = arr[0]+"-"+arr[1]+"-"+arr[2].substring(2, 4);
							$(newtd).html( element.lrNumber +" /   "+finalDate);
						}
						
						if (dataPicker == "lrBookingDateDayMonth") {
							let [day, month] = element.lrBookingDateTimeStr.split("-")
							$(newtd).html(day + "/" + month)
						}
						
						if (dataPicker == "actualWeightInQuintal") {
							$(newtd).html((element.actualWeight/100).toFixed(2))
						}
						
						if (dataPicker == "noOfInvoices") {
							if (element.invoiceNo != undefined) {
								if (element.invoiceNo == "") { $(newtd).html(0) }
								else { $(newtd).html(element.invoiceNo.split(",").length) }
							}
						}
						
						if (dataPicker == "weightRatePerTonn") {
							$(newtd).html(element.weightRate*1000)
						}
						
						if (dataPicker == "chargeWeightInTonn") {
							$(newtd).html(element.chargeWeight/1000)
						}
					
						$(newtd).attr("class",$(columnObjectForDetails[j]).attr("class"));
						$(newtd).attr("data-dataTableDetail",$(columnObjectForDetails[j]).attr("data-dataTableDetail"));
						
						$("*[data-dataTableDetail='saccode']").html('996511');
				
						$(newtd).html(element[dataPicker]);
						
						if (dataPicker == "invoiceNoSubstring10") {
							if (element.invoiceNo && element.invoiceNo.toString().length > 10) {
								$(newtd).html(element.invoiceNo.toString().substring(0,10) + "...")
							}
						}
						
						$(newtr).append($(newtd));
						$(tbody).before(newtr);
					}
				
					for(var j = 0; j < columnObjectForDetails2.length; j++) {
						var newtd1 = $("<td></td>");
						var dataPicker = $(columnObjectForDetails2[j]).attr("data-dataTableDetail2");
						$(newtd1).attr("class",$(columnObjectForDetails2[j]).attr("class"));
						$(newtd1).attr("data-dataTableDetail2",$(columnObjectForDetails2[j]).attr("data-dataTableDetail2"));
					
						$("*[data-dataTableDetail='saccode']").html('996511');
			
						$(newtd1).html(element[dataPicker]);
						$(newtr1).append($(newtd1));
						$(tbody1).before(newtr1);
					}
				
					if(configuration != undefined && configuration.showAllCharges != undefined && configuration.showAllCharges) {
						var bookingCharges		= element.bookingCharges;
					
						for(var k = 0; k < bookingCharges.length; k++){
							if(bookingCharges[k].chargeTypeMasterId != FREIGHT && 
								bookingCharges[k].chargeTypeMasterId != DOCKET_CHARGE) {
								var newtrCharge = $("<tr></tr>");
								var newtd	= $("<td  class =''colspan='4'></td>");
								var newtd3	= $("<td class ='docketChargeCol textRight '></td>");
								var newtd1	= $("<td class =' ' colspan='5'></td>");
								var newtd2	= $("<td class ='textRight bold'></td>");
								count = k ;
								$(newtd1).html(bookingCharges[k].chargeTypeMasterName);	
								$(newtd2).html(bookingCharges[k].wayBillBookingChargeChargeAmount.toFixed(2));	
								$(newtrCharge).append($(newtd));
								$(newtrCharge).append($(newtd3));
								$(newtrCharge).append($(newtd1));
								$(newtrCharge).append($(newtd2));
								$(tbody).before(newtrCharge);
							}
						}
					} else if(configuration != undefined && configuration.accountGroupId == ACCOUNT_GROUP_ID_ASHEESH){//asheesh group work
						var bookingCharges				= element.bookingCharges;
						
						for(var k = 0; k < bookingCharges.length; k++){
							if(bookingCharges[k].chargeTypeMasterId != FREIGHT && 
								bookingCharges[k].chargeTypeMasterId != DOCKET_CHARGE) {
								var newtrCharge		= $("<tr></tr>");
								var newtd	= $("<td style='text-align: left; border:1px solid black;' class =''colspan='6'></td>");
								var newtd3	= $("<td style='text-align: left; border:1px solid black;' class ='docketChargeCol textRight '></td>");
								var newtd1	= $("<td style='text-align: left; border:1px solid black;' colspan='2' class =' ' colspan=''></td>");
								var newtd4	= $("<td style='text-align: left; border:1px solid black;' class ='' colspan=''></td>");
								var newtd2	= $("<td style='text-align: left; border:1px solid black;' class ='textRight bold'></td>");
								count = k ;
								$(newtd1).html(bookingCharges[k].chargeTypeMasterName);	
								$(newtd2).html(bookingCharges[k].wayBillBookingChargeChargeAmount.toFixed(2));	
								$(newtrCharge).append($(newtd));
								$(newtrCharge).append($(newtd3));
								$(newtrCharge).append($(newtd1));
								$(newtrCharge).append($(newtd4));
								$(newtrCharge).append($(newtd2));
								$(tbody).before(newtrCharge);
							}
						}
					} else if(configuration != undefined && configuration.accountGroupId == ACCOUNT_GROUP_ID_EDISAFE){//edisafe
						if(dynamicCharges) {
							configuration.showPopup = false;

							var bookingCharges				= element.bookingCharges;
				
							if(bookingCharges != undefined){
								for(var k = 0; k < bookingCharges.length; k++) {
									if(bookingCharges[k].chargeTypeMasterId != FREIGHT && bookingCharges[k].chargeTypeMasterId != DOCKET_CHARGE) {
										var newtrCharge		= $("<tr></tr>");
										var newtd8	= $("<td style='text-align: left;'></td>");
										var newtd5	= $("<td style='text-align: left;'></td>");
										var newtd9	= $("<td style='text-align: left;'></td>");
										var newtd6	= $("<td style='text-align: left;border-right: 1px solid black;'></td>");
										var newtd7	= $("<td style='text-align: left;border-right: 1px solid black;'></td>");
										var newtd	= $("<td style='text-align: left;border-left:1px solid black; border-right: 1px solid black;'></td>");
										var newtd3	= $("<td style='text-align: left; ' class ='docketChargeCol textRight '></td>");
										var newtd1	= $("<td style='text-align: left; border-right: 1px solid black;border-left:1px solid black; text-indent: 20px;' class =' ' colspan='2'></td>");
										var newtd15 = $("<td style='text-align: center; border-right: 1px solid black;' class ='textRight bold'></td>");
										var newtd2	= $("<td style='text-align: center; border-right: 1px solid black;' class ='textRight bold'></td>");
										var newtd10 = $("<td style='text-align: left; border-right: 1px solid black;border-left:1px solid black; text-indent: 20px;' class =' '></td>");
										var newtd11 = $("<td style='text-align: left; border-right: 1px solid black;border-left:1px solid black; text-indent: 20px;' class =' '></td>");
										var newtd12 = $("<td style='text-align: left; border-right: 1px solid black;border-left:1px solid black; text-indent: 20px;' class =' '></td>");
										var newtd13 = $("<td style='text-align: left; border-right: 1px solid black;border-left:1px solid black; text-indent: 20px;' class =' '></td>");
										var newtd14 = $("<td style='text-align: left; border-right: 1px solid black;border-left:1px solid black; text-indent: 20px;' class =' '></td>");

										count = k ;
										$(newtd1).html(bookingCharges[k].chargeTypeMasterName);	
										$(newtd2).html(bookingCharges[k].wayBillBookingChargeChargeAmount.toFixed(2));	
										$(newtrCharge).append($(newtd));
										$(newtrCharge).append($(newtd8));
										$(newtrCharge).append($(newtd9));
										$(newtrCharge).append($(newtd6));
										$(newtrCharge).append($(newtd7));
										$(newtrCharge).append($(newtd5));
										$(newtrCharge).append($(newtd3));
										$(newtrCharge).append($(newtd1));
										$(newtrCharge).append($(newtd15));
										$(newtrCharge).append($(newtd4));
										$(newtrCharge).append($(newtd2));
										$(newtrCharge).append($(newtd10));
										$(newtrCharge).append($(newtd11));
										$(newtrCharge).append($(newtd12));
										$(newtrCharge).append($(newtd13));
										$(newtrCharge).append($(newtd14));
										$(tbody).before(newtrCharge);
									}
								}
							}
						}
					} else if(configuration != undefined && configuration.accountGroupId == ACCOUNT_GROUP_ID_ABBAS){//abbas
						var bookingCharges				= element.bookingCharges;
				
						for(var k = 0; k < bookingCharges.length; k++) {
							if(bookingCharges[k].chargeTypeMasterId != FREIGHT && bookingCharges[k].chargeTypeMasterId != DOCKET_CHARGE) {
								var newtrCharge		= $("<tr></tr>");
								var newtd6	= $("<td style='text-align: left;border-right: 1px solid black;border-bottom: 1px solid black;'></td>");
								var newtd7	= $("<td style='text-align: left;border-right: 1px solid black;border-bottom: 1px solid black;'></td>");
								var newtd	= $("<td style='text-align: left;border-right: 1px solid black;border-bottom: 1px solid black;'></td>");
								var newtd3	= $("<td style='text-align: left; border:1px solid black;border-bottom: 1px solid black;' class ='docketChargeCol textRight '></td>");
								var newtd1	= $("<td style='text-align: left; border-right: 1px solid black;border-bottom: 1px solid black;' class =' ' colspan=''></td>");
								var newtd5	= $("<td style='text-align: left;border-right: 1px solid black; border-bottom: 1px solid black;' class ='' colspan=''></td>");
								var newtd4	= $("<td style='text-align: left;border-right: 1px solid black; border-bottom: 1px solid black;' class ='' colspan=''></td>");
								var newtd8	= $("<td style='text-align: left;border-right: 1px solid black; border-bottom: 1px solid black;' class ='' colspan=''></td>");
								var newtd2	= $("<td style='text-align: center; border-right: 1px solid black; border-bottom: 1px solid black;' class ='textRight bold'></td>");
								count = k ;
								$(newtd1).html(bookingCharges[k].chargeTypeMasterName);	
								$(newtd2).html(bookingCharges[k].wayBillBookingChargeChargeAmount.toFixed(2));	
								$(newtrCharge).append($(newtd));
								$(newtrCharge).append($(newtd6));
								$(newtrCharge).append($(newtd7));
								$(newtrCharge).append($(newtd3));
								$(newtrCharge).append($(newtd1));
								$(newtrCharge).append($(newtd5));
								$(newtrCharge).append($(newtd4));
								$(newtrCharge).append($(newtd8));
								$(newtrCharge).append($(newtd2));
								$(tbody).before(newtrCharge);
							}
						}
					} else if(configuration != undefined && configuration.accountGroupId == ACCOUNT_GROUP_ID_SAPAN){//abbas
						var bookingCharges				= element.bookingCharges;
						var wayBillDeliveryCharges		= element.wayBillDeliveryCharges;
				
						for(var k = 0; k < bookingCharges.length; k++) {
							if(bookingCharges[k].chargeTypeMasterId != FREIGHT){
								var newtrCharge		= $("<tr></tr>");
								var newtd	= $("<td style='text-align: left;'colspan='6'></td>");
								var newtd1	= $("<td style='text-align: left; border-left: 1px solid black; padding-left: 6px; border-bottom: 1px solid black;' class =' ' colspan='6'></td>");
								var newtd2	= $("<td style='text-align: right; border-left: 1px solid black;' class ='textRight' colspan='2'></td>");
								count = k ;
								$(newtd1).html(bookingCharges[k].chargeTypeMasterName);	
								$(newtd2).html(bookingCharges[k].wayBillBookingChargeChargeAmount.toFixed(2));	
								$(newtrCharge).append($(newtd));
								$(newtrCharge).append($(newtd1));
								$(newtrCharge).append($(newtd2));
								$(tbody).before(newtrCharge);
							}
						}
						
					if(wayBillDeliveryCharges != undefined){
						for(var k = 0; k < wayBillDeliveryCharges.length; k++) {
								var newtrCharge		= $("<tr></tr>");
								var newtd	= $("<td style='text-align: left;'colspan='6'></td>");
								var newtd1	= $("<td style='text-align: left; border-left: 1px solid black; padding-left: 6px; border-bottom: 1px solid black;' class =' ' colspan='6'></td>");
								var newtd2	= $("<td style='text-align: right; border-left: 1px solid black;' class ='textRight' colspan='2'></td>");
								count = k ;
								$(newtd1).html(wayBillDeliveryCharges[k].chargeTypeMasterName);	
								$(newtd2).html(wayBillDeliveryCharges[k].wayBillDeliverychargeAmount.toFixed(2));	
								$(newtrCharge).append($(newtd));
								$(newtrCharge).append($(newtd1));
								$(newtrCharge).append($(newtd2));
								$(tbody).before(newtrCharge);
							}
						}
					}else if(configuration != undefined && configuration.accountGroupId == ACCOUNT_GROUP_ID_SWARAJ){//SWARAJ
						var bookingCharges				= element.bookingCharges;
				
						for(var k = 0; k < bookingCharges.length; k++) {
								var newtrCharge		= $("<tr></tr>");
								var newtd	= $("<td style='text-align: left;'colspan='11'></td>");
								var newtd1	= $("<td style='text-align: left; border-left: 1px solid black; padding-left: 6px; border-bottom: 1px solid black;' class =' ' ></td>");
								var newtd2	= $("<td style='text-align: right; border-left: 1px solid black;border-bottom: 1px solid black;border-right: 1px solid black;' class ='textRight' ></td>");
								var newtd3	= $("<td style='text-align: left;' > </td>");
								count = k ;
								$(newtd1).html(bookingCharges[k].chargeTypeMasterName);	
								$(newtd2).html(bookingCharges[k].wayBillBookingChargeChargeAmount.toFixed(2));	
								$(newtrCharge).append($(newtd));
								$(newtrCharge).append($(newtd1));
								$(newtrCharge).append($(newtd2));
								$(newtrCharge).append($(newtd3));
								$(tbody).before(newtrCharge);
						}
						
					} else if(configuration != undefined && configuration.accountGroupId == ACCOUNT_GROUP_ID_HRUTWIK){
						var bookingCharges				= element.bookingCharges;
						var wayBillDeliveryCharges		= element.wayBillDeliveryCharges;
						var bookingAmount				= element.bookingAmount;
						
						for(var k = 0; k < bookingCharges.length; k++) {
							if(bookingCharges[k].chargeTypeMasterId != FREIGHT){
								var newtrCharge		= $("<tr></tr>");
								var newtd	= $("<td style='text-align: left;'colspan='4'></td>");
								var newtd1	= $("<td style='text-align: left; ' class =' ' colspan='6'></td>");
								var newtd2	= $("<td style='text-align: right; padding-right: 5px;' class ='textRight' colspan='2'></td>");
								count = k ;
								$(newtd1).html(bookingCharges[k].chargeTypeMasterName);	
								$(newtd2).html(bookingCharges[k].wayBillBookingChargeChargeAmount.toFixed(2));	
								$(newtrCharge).append($(newtd));
								$(newtrCharge).append($(newtd1));
								$(newtrCharge).append($(newtd2));
								$(tbody).before(newtrCharge);
							}
						}
						
						var newtrCharge		= $("<tr></tr>");
						var newtd	= $("<td style='text-align: left;'colspan='4'></td>");
						var newtd1	= $("<td style='text-align: left; ' class =' ' colspan='6'></td>");
						var newtd2	= $("<td style='text-align: right; padding-right: 10px;' class ='textRight' colspan='2'></td>");
						$(newtrCharge).append($(newtd));
						$(newtrCharge).append($(newtd1));
						$(newtrCharge).append($(newtd2));
						$(tbody).before(newtrCharge);
						$(newtd1).html("TOTAL");	
						$(newtd2).html(bookingAmount);	
					}else if(configuration != undefined && configuration.accountGroupId == ACCOUNT_GROUP_ID_REPORTER) {//reporter
						var chargesData				= element.bookingCharges;

						if(chargesData != undefined){
							for (var i = 0; i < chargesData.length; i++) {
								var newRow = $("<tr></tr>");
					
								newRow.append("<td class='bold'>" + chargesData[i].chargeTypeMasterName + "</td>");
								newRow.append("<td></td>");
								newRow.append("<td class='textAlignRight'>" + chargesData[i].wayBillBookingChargeChargeAmount.toFixed(2) + "</td>");
					
								$('.chargestable700').before(newRow);
							}
						}
					}else if(configuration != undefined && configuration.accountGroupId == ACCOUNT_GROUP_ID_AAA){//AAA
						var bookingCharges				= element.bookingCharges;
				
						for(var k = 0; k < bookingCharges.length; k++) {
							if(bookingCharges[k].chargeTypeMasterId != FREIGHT){
								var newtrCharge		= $("<tr></tr>");
								var newtd	= $("<td style='text-align: left; border-left: 1px solid black;'colspan='12'></td>");
								var newtd1	= $("<td style='text-align: left; border-left: 1px solid black; padding-left: 6px; border-bottom: 1px solid black;' class =' ' colspan='2'></td>");
								var newtd2	= $("<td style='text-align: right; border-left: 1px solid black;border-bottom: 1px solid black;border-right: 1px solid black;' class ='textRight'></td>");
								count = k ;
								$(newtd1).html(bookingCharges[k].chargeTypeMasterName);	
								$(newtd2).html(bookingCharges[k].wayBillBookingChargeChargeAmount);	
								$(newtrCharge).append($(newtd));
								$(newtrCharge).append($(newtd1));
								$(newtrCharge).append($(newtd2));
								$(tbody).before(newtrCharge);
							}
						}
					}else if((configuration != undefined && configuration.accountGroupId == ACCOUNT_GROUP_ID_KALPAKA) || (configuration != undefined && configuration.accountGroupId == ACCOUNT_GROUP_ID_KTC)){//AAA
						var bookingCharges				= element.bookingCharges;
				
						for(var k = 0; k < bookingCharges.length; k++) {
								var newtrCharge		= $("<tr></tr>");
								var newtd	= $("<td style='text-align: left; border-left: 1px solid black;'colspan='11'></td>");
								var newtd1	= $("<td style='text-align: left; border-left: 1px solid black; padding-left: 6px; border-bottom: 1px solid black;' class =' ' colspan='2'></td>");
								var newtd2	= $("<td style='text-align: right; border-left: 1px solid black;border-bottom: 1px solid black;border-right: 1px solid black;' class ='textRight'></td>");
								count = k ;
								$(newtd1).html(bookingCharges[k].chargeTypeMasterName);	
								$(newtd2).html(bookingCharges[k].wayBillBookingChargeChargeAmount);	
								$(newtrCharge).append($(newtd));
								$(newtrCharge).append($(newtd1));
								$(newtrCharge).append($(newtd2));
								$(tbody).before(newtrCharge);
						}
					} else if(configuration != undefined && (configuration.accountGroupId == ACCOUNT_GROUP_ID_BHOR
						|| configuration.accountGroupId == ACCOUNT_GROUP_ID_SFC || configuration.accountGroupId == ACCOUNT_GROUP_ID_BTRANCE)) {//bhor
						var bookingCharges	= element.bookingCharges;
					
						if(bookingCharges == undefined)
							bookingCharges	= [];

						for(var k = 0; k < bookingCharges.length; k++) {
							if(bookingCharges[k].chargeTypeMasterId != FREIGHT && bookingCharges[k].chargeTypeMasterId != DOCKET_CHARGE) {
								var newtrCharge		= $("<tr></tr>");
								var newtd	= $("<td style='text-align: center;' class ='t1'	colspan=''></td>");
								var newtd1	= $("<td style='text-align: center;' class ='docketChargeCol textRight t2'></td>");
								var newtd2	= $("<td style='text-align: center;' class ='textRight t3'></td>");
								var newtd3	= $("<td style='text-align: center;' class ='t4' colspan=''></td>");
								var newtd4	= $("<td style='text-align: center;' class ='textRight	vhNum2 vhNum3 vhNum4 t5'></td>");
								var newtd5	= $("<td style='text-align: center;' class ='textRight	invNum2 invNum3 invNum5 t6'></td>");
								var newtd6	= $("<td style='text-align: center;' class ='textRight hidet4'></td>");
								var newtd7	= $("<td style='text-align: center;' class ='textRight t8'></td>");
								var newtd8	= $("<td style='text-align: center;' class ='textRight	catg1 t9'></td>");
								var newtd9	= $("<td style='text-align: center;' class ='textRight	catg2 catg3 t10'></td>");
								var newtd10	= $("<td style='text-align: center;' class ='textRight formate4Cat t10'></td>");
								var newtd11	= $("<td style='text-align: center;' class ='textRight	type1 type2 t11'></td>");
								var newtd12	= $("<td style='text-align: center;' class ='textRight	actWght1 actWght2 actWght5 t12'></td>");
								var newtd13 = $("<td style='text-align: center;' class ='textRight	chargedwght1 chargedwght2 chargedwght4 t13'></td>");
								var newtd14 = $("<td style='text-align: center;' class ='textRight t7 articleRateForFromate4'></td>");
								var newtd15 = $("<td style='text-align: center;' class ='textRight t8 articleRateForFromate5'></td>");
								var newtd18 = $("<td class='extraFor2and5 hide'></td>")
								var newtd16	= $("<td colspan='2' style='text-align: center;' class ='textRight	'></td>");
								var newtd17	= $("<td style='text-align: center;' class ='textRight	 t15'></td>");
							
								count = k ;
								$(newtd16).html(bookingCharges[k].chargeTypeMasterName);	
								$(newtd17).html(Math.round(bookingCharges[k].wayBillBookingChargeChargeAmount).toFixed(2));	
								$(newtrCharge).append($(newtd));
								$(newtrCharge).append($(newtd1));
								$(newtrCharge).append($(newtd2));
								$(newtrCharge).append($(newtd3));
								$(newtrCharge).append($(newtd4));
								$(newtrCharge).append($(newtd5));
								$(newtrCharge).append($(newtd6));
								$(newtrCharge).append($(newtd7));
								$(newtrCharge).append($(newtd8));
								$(newtrCharge).append($(newtd9));
								$(newtrCharge).append($(newtd10));
								$(newtrCharge).append($(newtd11));
								$(newtrCharge).append($(newtd12));
								$(newtrCharge).append($(newtd13));
								$(newtrCharge).append($(newtd14));
								$(newtrCharge).append($(newtd15));
								$(newtrCharge).append($(newtd18))
								$(newtrCharge).append($(newtd16));
								$(newtrCharge).append($(newtd17));
								$(tbody).before(newtrCharge);
							}
						}
						
						if(element.waybillAdditionalRemark != undefined ){
							var newtrCharge		= $("<tr></tr>");
							var newtd	= $("<td style='text-align: center;' class =''colspan=''></td>");
							var newtd1	= $("<td style='text-align: center;' class ='docketChargeCol textRight '></td>");
							var newtd2	= $("<td style='text-align: center;' class ='textRight '></td>");
							var newtd3	= $("<td style='text-align: center;' class ='' colspan=''></td>");
							var newtd4	= $("<td style='text-align: center;' class ='textRight	vhNum2 vhNum3 vhNum4'></td>");
							var newtd5	= $("<td style='text-align: center;' class ='textRight	invNum2 invNum3 invNum5'></td>");
							var newtd6	= $("<td style='text-align: center;' class ='textRight	catg1'></td>");
							var newtd7	= $("<td style='text-align: center;' class ='textRight	catg2 catg3'></td>");
							var newtd8	= $("<td style='text-align: center;' class ='textRight formate4Cat'></td>");
							var newtd9	= $("<td style='text-align: center;' class ='textRight	type1 type2'></td>");
							var newtd10	= $("<td style='text-align: center;' class ='textRight	actWght1 actWght2 actWght5'></td>");
							var newtd11	= $("<td style='text-align: center;' class ='textRight	chargedwght1 chargedwght2 chargedwght4'></td>");
							var newtd12	= $("<td style='text-align: center;' class ='textRight	' colspan='6'></td>");
							var newtd13 = $("<td style='text-align: center;' class ='1233231323' colspan=''></td>");
							
							$(newtd12).html(element.waybillAdditionalRemark);	
							$(newtrCharge).append($(newtd));
							$(newtrCharge).append($(newtd1));
							$(newtrCharge).append($(newtd2));
							$(newtrCharge).append($(newtd3));
							$(newtrCharge).append($(newtd4));
							$(newtrCharge).append($(newtd5));
							$(newtrCharge).append($(newtd6));
							$(newtrCharge).append($(newtd7));
							$(newtrCharge).append($(newtd8));
							$(newtrCharge).append($(newtd9));
							$(newtrCharge).append($(newtd10));
							$(newtrCharge).append($(newtd11));
							$(newtrCharge).append($(newtd12));
							$(newtrCharge).append($(newtd13));
							$(tbody).before(newtrCharge);
						}
					} else if (configuration != undefined && configuration.accountGroupId == ACCOUNT_GROUP_ID_S_DOT_F_DOT_C) { // S.F.C and SFC are different groups
						var bookingCharges	= element.bookingCharges;
					
						if(bookingCharges == undefined)
							bookingCharges	= [];
	
						for(var k = 0; k < bookingCharges.length; k++) {
							if(bookingCharges[k].chargeTypeMasterId != FREIGHT && bookingCharges[k].chargeTypeMasterId != DOCKET_CHARGE) {
								var newtrCharge		= $("<tr></tr>");
								var newtd	= $("<td style='text-align: center;' class ='t1'	colspan=''></td>");
								var newtd1	= $("<td style='text-align: center;' class ='docketChargeCol textRight t2'></td>");
								var newtd2	= $("<td style='text-align: center;' class ='textRight t3'></td>");
								var newtd3	= $("<td style='text-align: center;' class ='t4' colspan=''></td>");
								var newtd4	= $("<td style='text-align: center;' class ='textRight	vhNum2 vhNum3 vhNum4 t5'></td>");
								var newtd5	= $("<td style='text-align: center;' class ='textRight	invNum2 invNum3 invNum5 t6'></td>");
								var newtd6	= $("<td style='text-align: center;' class ='textRight hidet4'></td>");
								var newtd7	= $("<td style='text-align: center;' class ='textRight t8'></td>");
								var newtd8	= $("<td style='text-align: center;' class ='textRight	catg1 t9'></td>");
								var newtd9	= $("<td style='text-align: center;' class ='textRight	catg2 catg3 t10'></td>");
								var newtd10	= $("<td style='text-align: center;' class ='textRight formate4Cat t10'></td>");
								var newtd11	= $("<td style='text-align: center;' class ='textRight	type1 type2 t11'></td>");
								var newtd13 = $("<td style='text-align: center;' class ='textRight	chargedwght1 chargedwght2 chargedwght4 t13'></td>");
								var newtd15 = $("<td style='text-align: center;' class ='textRight t8 articleRateForFromate5'></td>");
								var newtd18 = $("<td class='extraFor2and5 hide'></td>")
								var newtd16	= $("<td colspan='2' style='text-align: center;' class ='textRight	'></td>");
								var newtd17	= $("<td style='text-align: center;' class ='textRight	 t15'></td>");	var newtd18 = $("<td class='lolsob'></td>")
							
								count = k ;
								$(newtd16).html(bookingCharges[k].chargeTypeMasterName);	
								$(newtd17).html(Math.round(bookingCharges[k].wayBillBookingChargeChargeAmount).toFixed(2));	
								$(newtrCharge).append($(newtd));
								$(newtrCharge).append($(newtd1));
								$(newtrCharge).append($(newtd2));
								$(newtrCharge).append($(newtd3));
								$(newtrCharge).append($(newtd4));
								$(newtrCharge).append($(newtd5));
								$(newtrCharge).append($(newtd6));
								$(newtrCharge).append($(newtd7));
								$(newtrCharge).append($(newtd8));
								$(newtrCharge).append($(newtd9));
								$(newtrCharge).append($(newtd10));
								$(newtrCharge).append($(newtd11));
								$(newtrCharge).append($(newtd13));
								$(newtrCharge).append($(newtd15));
								$(newtrCharge).append($(newtd18))
								$(newtrCharge).append($(newtd16));
								$(newtrCharge).append($(newtd17));
								$(tbody).before(newtrCharge);
							}
						}
						
						if(element.waybillAdditionalRemark != undefined ){
							var newtrCharge		= $("<tr></tr>");
							var newtd	= $("<td style='text-align: center;' class =''colspan=''></td>");
							var newtd1	= $("<td style='text-align: center;' class ='docketChargeCol textRight '></td>");
							var newtd2	= $("<td style='text-align: center;' class ='textRight '></td>");
							var newtd3	= $("<td style='text-align: center;' class ='' colspan=''></td>");
							var newtd4	= $("<td style='text-align: center;' class ='textRight	vhNum2 vhNum3 vhNum4'></td>");
							var newtd5	= $("<td style='text-align: center;' class ='textRight	invNum2 invNum3 invNum5'></td>");
							var newtd6	= $("<td style='text-align: center;' class ='textRight	catg1'></td>");
							var newtd7	= $("<td style='text-align: center;' class ='textRight	catg2 catg3'></td>");
							var newtd8	= $("<td style='text-align: center;' class ='textRight formate4Cat'></td>");
							var newtd9	= $("<td style='text-align: center;' class ='textRight	type1 type2'></td>");
							var newtd10	= $("<td style='text-align: center;' class ='textRight	actWght1 actWght2 actWght5'></td>");
							var newtd11	= $("<td style='text-align: center;' class ='textRight	chargedwght1 chargedwght2 chargedwght4'></td>");
							var newtd12	= $("<td style='text-align: center;' class ='textRight	' colspan='6'></td>");
							var newtd13 = $("<td style='text-align: center;' class ='1233231323' colspan=''></td>");
							
							$(newtd12).html(element.waybillAdditionalRemark);	
							$(newtrCharge).append($(newtd));
							$(newtrCharge).append($(newtd1));
							$(newtrCharge).append($(newtd2));
							$(newtrCharge).append($(newtd3));
							$(newtrCharge).append($(newtd4));
							$(newtrCharge).append($(newtd5));
							$(newtrCharge).append($(newtd6));
							$(newtrCharge).append($(newtd7));
							$(newtrCharge).append($(newtd8));
							$(newtrCharge).append($(newtd9));
							$(newtrCharge).append($(newtd10));
							$(newtrCharge).append($(newtd11));
							$(newtrCharge).append($(newtd12));
							$(newtrCharge).append($(newtd13));
							$(tbody).before(newtrCharge);
						}
					}
			
					$("[data-table='poNumber']").html(element.purchaseOrderNumber);
					$("[data-table='poDate']").html(element.purchaseOrderDatestr);
				}
		   
				if(configuration != undefined && configuration.showPageWiseTotal != undefined && configuration.showPageWiseTotal) {
					var newtr = $("<tr></tr>");
					var newtd1 = $("<td colspan='8' class ='bold centerAlign font12 borderBottom borderLeft'>Total</td>");
					var newtd2 = $("<td class ='bold rightAlign font12 borderBottom borderLeft'></td>");
					var newtd3 = $("<td class ='bold rightAlign font12 borderBottom borderLeft'></td>");
					var newtd4 = $("<td class ='bold rightAlign font12 borderBottom borderLeft'></td>");
					var newtd5 = $("<td class ='bold rightAlign font12 borderBottom borderLeft'></td>");
					var newtd6 = $("<td class ='bold rightAlign font12 borderBottom borderLeft '></td>");
					var newtd7 = $("<td class ='bold rightAlign font12 borderBottom borderLeft borderRight'></td>");
						
					$(newtd2).html(totalChargeWt)
					$(newtd3).html(totalArticle)
					$(newtd4).html(totalfreight)
					$(newtd5).html(totalStatisticalCharge)
					$(newtd6).html(TotalOtherCharge)
					$(newtd7).html(totalAmount)
						
					$(newtr).append($(newtd1));
					$(newtr).append($(newtd2));
					$(newtr).append($(newtd3));
					$(newtr).append($(newtd4));
					$(newtr).append($(newtd5));
					$(newtr).append($(newtd6));
					$(newtr).append($(newtd7));
					$(tbody).before(newtr);
					
					var newtr2 = $("<tr></tr>");
					var newtd1 = $("<td colspan='14' class ='bold leftAlign font12 borderBottom borderLeft borderRight'></td>");
						
					$(newtr2).append($(newtd1));
					$(tbody).before(newtr2);
				} else if(configuration != undefined && configuration.accountGroupId == ACCOUNT_GROUP_ID_SES) {
					//this condtion is to add dynamic charges total on footer
					let aggregatedCharges = Array.from(chargeMap.values());
					var classNameofName = $("*[data-chargename='dynamic']").attr('class');
					var classNameofVal = $("*[data-chargevalue='dynamic']").attr('class');
					var tbody = $("*[data-chargevalue='dynamic']").parent().parent();
							
					for(var k = 0; k < aggregatedCharges.length; k++) {
						if(aggregatedCharges[k].chargeTypeMasterId != FREIGHT){
							var newtr = $("<tr/>")
	
							var newtdChargename = $("<td></td>").html(aggregatedCharges[k].chargeTypeMasterName);
							newtdChargename.attr("class", classNameofName);
							newtdChargename.attr("data-selector", 'chargeName' + aggregatedCharges[k].chargeTypeMasterId);
									
							newtr.append(newtdChargename);
									
							var newtdChargeVal = $("<td></td>").html(aggregatedCharges[k].wayBillBookingChargeChargeAmount.toFixed(2));
							newtdChargeVal.attr("class", classNameofVal);
							newtdChargeVal.attr("data-selector", 'chargeValue' + aggregatedCharges[k].chargeTypeMasterId);
							newtr.append(newtdChargeVal);
								
							$(tbody).before(newtr);
						}
					}
				}
			}
		   
			$("[data-row='dataTableDetails']").remove();
			$("[data-row='dataTableDetails2']").remove();
			
			if (configuration.accountGroupId == ACCOUNT_GROUP_ID_TCS) {
				if (tableData.map(d => d.docketCharge).every(v => v === 0)) {
					$(".docketChargeCell").addClass("hide")
				}
				
				if (tableData.map(d => d.fov).every(v => v === 0)) {
					$(".fovChargeCell").addClass("hide")
				}
				
				if (tableData.map(d => d.fsCharge).every(v => v === 0)) {
					$(".fsChargeCell").addClass("hide")
				}
				
				if (tableData.map(d => d.BookingDelivery).every(v => v === 0)) {
					$(".doorDeliveryChargeCell").addClass("hide")
				}
				
				if (tableData.map(d => d.doorPickupCharge).every(v => v === 0)) {
					$(".doorPickupChargeCell").addClass("hide")
				}
				
				if (tableData.map(d => d.extraWt).every(v => v === 0)) {
					$(".extraWeightChargeCell").addClass("hide")
				}
				
				if (tableData.map(d => d.otherChargeForAtc).every(v => v === 0)) {
					$(".otherChargeCell").addClass("hide")
				}
			}
			
			if (configuration.showExtraRows) {
				let heightOfRow = configuration.heightOfRow
				let noOfLrOnFirstPage = configuration.noOfLrOnFirstPage
				let noOfLrPerPage = configuration.noOfLrPerPage
				let noOfLrOnLastPage = configuration.noOfLrOnLastPage
				
				let totalLrs = tableData.length
				let footerHeight = (noOfLrPerPage - noOfLrOnLastPage) * heightOfRow
				$(".extraRowTd").height(
					totalLrs <= noOfLrOnFirstPage ? ((noOfLrOnFirstPage - totalLrs) * heightOfRow) - footerHeight :
					(totalLrs - noOfLrOnFirstPage) <= noOfLrOnLastPage ? (noOfLrOnLastPage - ((totalLrs - noOfLrOnFirstPage))) * heightOfRow :
					(noOfLrOnLastPage - ((totalLrs - noOfLrOnFirstPage) % noOfLrPerPage)) * heightOfRow
				)
			}
			
		}, setFooterDiv : function(billData, footerData, configuration, isExcel, isSearchBillPDFEmail,tableData) {
			//for cxl only
			$('.cxlheader').css('height','757px');
			
			$("[data-info='lsRemark']").html(footerData[$("[data-info='lsRemark']").attr("data-info")]);
			var _this = this;
			var showpopUp						= configuration.showPopup;
			var	showPrintWindowForDownldToExecl = configuration.showPrintWindowForDownldToExecl;
			
			if(showpopUp)
				_this.showPopup(billData, isExcel, showPrintWindowForDownldToExecl, isSearchBillPDFEmail,tableData,configuration);
			else if(isSearchBillPDFEmail == 'false' || isSearchBillPDFEmail == false)
				setTimeout(function(){window.print();},200);
			

		}, setPickupChargesDetails:function(pickupChargeData) {
			$("[data-pickupCharge='lorryhire']").html(pickupChargeData.lorryHire);
			$("[data-pickupCharge='extra']").html(pickupChargeData.extra);
			$("[data-pickupCharge='lorryHireAmt']").html(pickupChargeData.lorryHireAmount);
			$("[data-pickupCharge='lorryHireAdvance']").html(pickupChargeData.lorryHireAdvance);
			$("[data-pickupCharge='lorryHireBalance']").html(pickupChargeData.lorryHireBalance);
		}, setDataTableDetailsForTotal : function(billDetailsForPrintingBill, tableData, totalLR, lastItrObj, configuration){
			var totalfreight				= tableData[tableData.length - 1].totalfreight;
			var lrFreight					= tableData[tableData.length - 1].lrFreight;
			var freight						= tableData[tableData.length - 1].freight;
			totalhamali						= tableData[tableData.length - 1].totalhamali;
			var totaldocketCharge			= tableData[tableData.length - 1].totaldocketCharge;
			var totalWeight					= tableData[tableData.length - 1].totalWeight;
			var totalQuantity				= tableData[tableData.length - 1].totalQuantity;
			var totalOthercharge			= tableData[tableData.length - 1].totalOthercharge;
			var totalweightRate				= tableData[tableData.length - 1].totalweightRate;
			var totalarticleRate			= tableData[tableData.length - 1].totalarticleRate;
			var totalweightRatetoFixed		= tableData[tableData.length - 1].totalweightRatetoFixed;
			var totalFinalAmount			= tableData[tableData.length - 1].totalFinalAmount;
			var totalGST					= tableData[tableData.length - 1].totalGST;
			var totaldlycharge				= tableData[tableData.length - 1].totaldlycharge;
			var totalgrandtotalkps			= tableData[tableData.length - 1].totalgrandtotalkps;
			var totalOtherCharges			= tableData[tableData.length - 1].totalOtherCharges;
			var bookingTotalWithoutTax		= tableData[tableData.length - 1].bookingTotalWithoutTax;
			var totalLocalCharge			= tableData[tableData.length - 1].totalLocalCharge;
			var totalLabourCharge			= tableData[tableData.length - 1].totalLabourCharge;
			var totalOtherBkgCharge			= tableData[tableData.length - 1].totalOtherBkgCharge;
			var totaldetentionCharge		= tableData[tableData.length - 1].totaldetentionCharge;
			var grandTotalbookingcharwithoutDly	  = tableData[tableData.length - 1].grandTotalbookingcharwithoutDly;
			var totalStatisticalCharge		= tableData[tableData.length - 1].totalStatisticalCharge;
			var totalRiskCharge				= tableData[tableData.length - 1].totalRiskCharge;
			var totalotherChargeForCustom	= tableData[tableData.length - 1].totalotherChargeForCustom;
			var totalOtherChargesAmount		= tableData[tableData.length - 1].totalOtherChargesAmount;
			var totalSTChargeBooking		= tableData[tableData.length - 1].totalSTChargeBooking;
			var totalCCACharge				= tableData[tableData.length - 1].totalCCACharge;
			var totalTollCharge				= tableData[tableData.length - 1].totalTollCharge;
			var totalDoorCollection			= tableData[tableData.length - 1].totalDoorCollection;
			var totalDD							= tableData[tableData.length - 1].totalDD;
			var totalDC						= tableData[tableData.length - 1].totalDC;
			var totalStationaryCharge		= tableData[tableData.length - 1].totalStationaryCharge;
			var totalFOV					= tableData[tableData.length - 1].totalFOV;
			var totalhalting				= tableData[tableData.length - 1].totalhalting;
			var totalExtraWt				= tableData[tableData.length - 1].totalExtraWt;
			var totalServiceCharge			= tableData[tableData.length - 1].totalServiceCharge;
			var totalOtherCharge1			= tableData[tableData.length - 1].totalOtherCharge1;
			var totalCGST					= tableData[tableData.length - 1].totalCGST;
			var totalSGST					= tableData[tableData.length - 1].totalSGST;
			var totalIGST					= tableData[tableData.length - 1].totalIGST;
			var totalnewOtherCharge			= tableData[tableData.length - 1].totalnewOtherCharge;
			var totalOtherChargeExcFreight	= tableData[tableData.length - 1].totalOtherChargeExcFreight;
			var totalOtherChargeExcFreightRoundoff	= tableData[tableData.length - 1].totalOtherChargeExcFreightRoundoff;
			var totalLoading				= tableData[tableData.length - 1].totalLoading;
			var totalUnloading				= tableData[tableData.length - 1].totalUnloading;
			var totalUnion					= tableData[tableData.length - 1].totalUnion;
			var	totalBookCharge				= tableData[tableData.length - 1].totalBookCharge;
			var	totalCrossingCharge			= tableData[tableData.length - 1].totalCrossingCharge;
			var	totalBcCharge				= tableData[tableData.length - 1].totalBcCharge;
			var	totalDoubleDelivery			= tableData[tableData.length - 1].totalDoubleDelivery;
			var	totalLoadingDetention		= tableData[tableData.length - 1].totalLoadingDetention;
			var	totalUnloadingDetention		= tableData[tableData.length - 1].totalUnloadingDetention;
			var	totalOtherChargeHtc			= tableData[tableData.length - 1].totalOtherChargeHtc;
			var	totalQuantityForHtc			= tableData[tableData.length - 1].totalQuantityForHtc;
			var	totalCGSTWithDecimal		= tableData[tableData.length - 1].totalCGSTWithDecimal.toFixed(2);
			var	totalSGSTWithDecimal		= tableData[tableData.length - 1].totalSGSTWithDecimal.toFixed(2);
			var	totalIGSTWithDecimal		= tableData[tableData.length - 1].totalIGSTWithDecimal.toFixed(2);
			var totalnewOtherChargedecimal	= tableData[tableData.length - 1].totalnewOtherCharge.toFixed(2);
			var totalOtherNew				= tableData[tableData.length - 1].totalOtherNew;
			var totalAcCharge				= tableData[tableData.length - 1].totalAcCharge;
			var totalIandSCharge			= tableData[tableData.length - 1].totalIandSCharge;
			var totalPickupCharge			= tableData[tableData.length - 1].totalPickupCharge;
			var totalDoorPickupCharge		= tableData[tableData.length - 1].totalDoorPickupCharge;
			var totalOctroiChrg				= tableData[tableData.length - 1].totalOctroiChrg;
			var totOtherChrgSngt			= tableData[tableData.length - 1].totOtherChrgSngt;
			var wayBillNumberForTransporter = tableData[tableData.length - 1].wayBillNumberForTransporter;
			var showDetailsForSngt			= tableData[tableData.length - 1].showDetailsForSngt;
			var wayBillNumberForUnaddedTaxAmnt	= tableData[tableData.length - 1].wayBillNumberForUnaddedTaxAmnt;
			var totalPickUpAndDdCharge			= tableData[tableData.length - 1].totalPickUpAndDdCharge;
			var totalHamaliAndIAndSCharges		= tableData[tableData.length - 1].totalHamaliAndIAndSCharges;
			var lrGrandTotalForRectus			= tableData[tableData.length - 1].lrGrandTotalForRectus;
			var bookingAmount					= tableData[tableData.length - 1].bookingAmount;
			var deliveryDiscount				= tableData[tableData.length - 1].deliveryDiscount;
			var totalBuiltyChrg					= tableData[tableData.length-1].totalBuiltyChrg;
			var totalBkgDelivery				= tableData[tableData.length-1].totalBkgDelivery;
			var grandTotalForSSTS				= tableData[tableData.length - 1].grandTotalForSSTS;			
			var totalOtherForAtc				= tableData[tableData.length - 1].otherChargeForAtc;
			var totalToPayHamali				= tableData[tableData.length - 1].totalToPayHamali;
			var totalDdcCharge					= tableData[tableData.length - 1].totalDdcCharge;
			var totalArtRate					= tableData[tableData.length - 1].totalArtRate;
			var totalPodCharge					= tableData[tableData.length - 1].totalPodCharge;
			var totalEwayBillCharge				= tableData[tableData.length - 1].totalEwayBillCharge;
			var totalCODDOD						= tableData[tableData.length - 1].totalCODDOD;	
			var totalFuelSurCharge				= tableData[tableData.length - 1].totalFuelSurCharge;	
			var RtcCostPerTPT					= tableData[tableData.length - 1].RtcCostPerTPT;
			var totalStatisticalCharge			= tableData[tableData.length - 1].totalStatisticalCharge;
			var hamaliCharge					= tableData[tableData.length - 1].hamaliCharge;
			var totalRtc						= tableData[tableData.length - 1].totalRtc;
			var totalPacking					= tableData[tableData.length - 1].totalPacking;
			var totalDelCollCharge				= tableData[tableData.length - 1].totalDelCollCharge;
			var totalInsurace					= tableData[tableData.length - 1].totalInsurace;
			var totalOda						= tableData[tableData.length - 1].totalOda;
			var totalHamalisct					= tableData[tableData.length - 1].totalHamalisct;
			var totalothersct					= tableData[tableData.length - 1].totalothersct;
			var totalFreightAmountForReporter	= tableData[tableData.length - 1].totalFreightAmountForReporter;
			var bookingTypeId					= tableData[tableData.length - 1].bookingTypeId
			var totalscCharge					= tableData[tableData.length - 1].totalscCharge;
			var totalhcCharge					= tableData[tableData.length - 1].totalhcCharge;
			var totaleicCharge					= tableData[tableData.length - 1].totaleicCharge;
			var totalwpCharge					= tableData[tableData.length - 1].totalwpCharge;
			var totaldbcCharge					= tableData[tableData.length - 1].totaldbcCharge;
			var customTaxForSrst				= tableData[tableData.length - 1].customTaxForSrst;
			var totalCGSTWithDecimalforVLJL		= parseFloat(tableData[tableData.length - 1].totalCGSTWithDecimal);
			var totalSGSTWithDecimalforVLJL		= parseFloat(tableData[tableData.length - 1].totalSGSTWithDecimal);
			var	totalSGSTCGSTWithDecimal		= (tableData[tableData.length - 1].totalCGSTWithDecimal +tableData[tableData.length - 1].totalSGSTWithDecimal).toFixed(2);
			var totalHamaliDelyChrge			= tableData[tableData.length - 1].totalHamaliDelyChrge;
			var totalDelyChrgExcHamali			= tableData[tableData.length - 1].totalDelyChrgExcHamali;
			var grandBookingTotalDelyTotal		= tableData[tableData.length - 1].grandBookingTotalDelyTotal;
			var bookingTotalforGldts			= tableData[tableData.length - 1].bookingTotalforGldts;
			var lrGrandTotalWithDelivery		= tableData[tableData.length - 1].lrGrandTotalWithDelivery;
			var totalGCCharge					= tableData[tableData.length - 1].totalGCCharge;
			var totalOtherForSET					= tableData[tableData.length - 1].totalOtherForSET;
			var totalDDForSET					= tableData[tableData.length - 1].totalDDForSET;
			var totalGrCharge					= tableData[tableData.length - 1].totalGrCharge;
			var totalOtherChargesForMGLLP		= tableData[tableData.length - 1].totalOtherChargesForMGLLP;
			var totalLabourChg					= tableData[tableData.length - 1].totalLabourChg;
			var totalODACharge					= tableData[tableData.length - 1].totalODACharge;
			var totalDeliveryCharge				= tableData[tableData.length - 1].totalDeliveryCharge;
			var totalspHandlingDICCharge		= tableData[tableData.length - 1].totalspHandlingDICCharge;
			var totalCWBCharge					= tableData[tableData.length - 1].totalCWBCharge;
			var totalWithPassCharge				= tableData[tableData.length - 1].totalWithPassCharge;
			var totalParkingChg					= tableData[tableData.length - 1].totalParkingChg;
			var totalOtherChargeExcFreightAndDDC	= tableData[tableData.length - 1].totalOtherChargeExcFreightAndDDC;
			var totalGrandTotalForMGLLP		= tableData[tableData.length - 1].totalGrandTotalForMGLLP;
			var	totalCgstSgstOfbookingAmount	= tableData[tableData.length - 1].totalCgstSgstOfbookingAmount.toFixed(2);
			var	totalIgstOfbookingAmount		= tableData[tableData.length - 1].totalIgstOfbookingAmount.toFixed(2);
			
			var grandTotalPanIndia		= tableData[tableData.length - 1].grandTotalPanIndia;
			var doorPickupCharge            = tableData[tableData.length - 1].doorPickupCharge;
			
			totalDDCharge				= tableData[tableData.length - 1].totalDDCharge;
			totalAoc					= tableData[tableData.length - 1].totalAoc;
			totalBookingDelivery		= tableData[tableData.length - 1].totalBookingDelivery;
			totalHandling				= tableData[tableData.length - 1].totalHandling;
			totalCollection				= tableData[tableData.length - 1].totalCollection;
			totalLongLength				= tableData[tableData.length - 1].totalLongLength;
			
			var totalfreight			= 0;
			var actualTotalfreight		= 0;
			var lrFreight				= 0;
			var freight					= 0;
			totalhamali					= 0;
			var totalWeight				= 0;
			var totalQuantity			= 0;
			var totalOthercharge		= 0;
			var totalunAddedTaxAmount	= 0;
			var totaldlycharge			= 0;
			var totalgrandtotalkps		= 0;
			var totalOtherCharges		= 0;
			var totalOtherChargesAmount = 0;
			var grandtotalcustomAOCCharge = 0;
			var grandtotalcustomcharge = 0;
			var grandTotalbookingcharwithoutDly = 0;
			totalHandling						= 0;
			var totalfreightdecimal				= 0;
			var totalHalting					= 0;
			var deliveryDiscount				= 0;
			var bookingAmount					= 0;
			var grandtotalforptc				= 0;
			var totalAmountReceivedPtc			= 0;
			var grandTotalForSts				= 0;
			var totalActualWeight				= 0;
			var totalBuiltyChrg					= 0;
			var totalAmountForNm1				= 0;
			var totalBookingDelivery			= 0;
			var totalarticleRate				= 0;
			var totalArticleRate1				= 0;
			var totalBkgDelivery				= 0;
			var totalLocalChrg					= 0;
			var grandTotalForSSTS				= 0;
			var totalOtherForAtc				= 0;
			var totalArtRate					= 0;
			var totalEwayBillCharge				= 0;
			var totalCODDOD						= 0;
			var totalFuelSurCharge				= 0;
			var totalSurCharge					= 0;
			var	totalhandling					=0;
			var chargeWeight					= 0;
			var	RtcCostPerTPT					= 0;
			var totalStatisticalCharge			= 0;
			var hamaliCharge					= 0;
			var totalRtc						= 0;
			var lrNoWithoutTransporterGst	= new Array();
			var	 totalRTOCharge					= 0;
			var totalomkarfreight				= 0;
			var TotalslplOtherF1				= 0;
			var TotalslplOtherF3				= 0;
			var totalHamalisct					= 0;
			var totalothersct					= 0;
			var totalFreightAmountForReporter	= 0;
			var totalBookingAmtRenuka			= 0;
			var deliverychargesforSrst			= 0;
			var totalAmountForVljl1				= 0;
			var totalGSTSES						=0;
			var bookingTotalSRST				= 0;
			var totalOtherForSET				=0;
			var totalDDForSET				=0;
            var customBookingAmtRenukaCgst			= 0;
			var customBookingAmtRenukaSgst			= 0;
			var customBookingAmtRenukaIgst			= 0;
			var totalBookingRenuka = 0;		
			var totalBookingRenuka2 = 0;
			var taxPercentage = 0;

			
			for(i = 0; i < tableData.length; i++){	
				
				totalfreight				= tableData[i].totalfreight;
				lrFreight					+= tableData[i].lrFreight;
				freight						+= tableData[i].freight;
				totalfreightdecimal			= tableData[i].totalfreight.toFixed(2);
				totalhamali					= tableData[i].totalhamali;
				totalWeight					= tableData[i].totalWeight;
				totalQuantity				= tableData[i].totalQuantity;
				totalOthercharge			= tableData[i].totalOthercharge;
				totalCollection				= tableData[i].totalCollection;
				totallrCharge				= tableData[i].totallrCharge;
				totaldlycharge				= tableData[i].totaldlycharge;
				totalgrandkps				= tableData[i].totalgrandtotal;
				totalgrandtotalkps			= tableData[i].totalgrandtotalkps;
				totalunAddedTaxAmount		= tableData[i].sum;
				totalOtherChargesAmount		= tableData[i].totalOtherChargesAmount;
				TotalunAddedTaxAmount		= Math.ceil(totalunAddedTaxAmount);
				totalHandling				= tableData[i].totalHandling;
				totalOtherCharges			= tableData[i].totalOtherCharges;
				grandtotalcustomAOCCharge	= tableData[i].grandtotalcustomAOCCharge;
				grandtotalcustomcharge		= tableData[i].grandtotalcustomcharge;
				grandTotalbookingcharwithoutDly		= tableData[i].grandTotalbookingcharwithoutDly;
				totalBookingDelivery				= tableData[i].totalBookingDelivery;
				totalLongLength				= tableData[i].totalLongLength;
				totalHalting				= tableData[i].totalhalting;
				totalOtherBkgCharge			= tableData[i].totalOtherBkgCharge;	
				bookingAmount				+= tableData[i].bookingAmount;
				deliveryDiscount			+= tableData[i].deliveryDiscount;
				grandtotalforptc			+= tableData[i].grandTotalForPtc;
				totalAmountReceivedPtc		+= tableData[i].totalAmountReceivedPtc;
				grandTotalForSts			+= tableData[i].totalgrandtotal - (tableData[i].STChargeBooking + tableData[i].extraWt);
				totalActualWeight			+= tableData[i].actualWeight;
				totalBuiltyChrg				= tableData[i].totalBuiltyChrg;
				totalAmountForNm1			+=tableData[i].totalgrandtotal
				totalarticleRate			+= Number(tableData[i].articleRate);
				totalArticleRate1			= totalarticleRate.toFixed(2);
				totalBkgDelivery			= tableData[i].totalBookingDelivery;
				totalLocalChrg				= tableData[i].totalLocalChrg;
				grandTotalForSSTS			= tableData[i].totalfreight + tableData[i].totalhamali + tableData[i].totalPickupCharge	 + tableData[i].totallrCharge + tableData[i].totallateNeight + tableData[i].totalwaiting + tableData[i].totalGST;
				totalOtherForAtc			= tableData[i].totalhamali + tableData[i].totalOtherBkgCharge + tableData[i].totalTollCharge;
				totalArtRate				+= Number(tableData[i].artRate);
				totalEwayBillCharge			= tableData[i].totalEwayBillCharge;
				totalCODDOD					= tableData[i].totalCODDOD;
				totalFuelSurCharge			= tableData[i].totalFuelSurCharge;
				totalSurCharge				= tableData[i].totalSurCharge;
				totalhandling				= tableData[i].totalhandling;
				totalRTOCharge				= tableData[i].totalRTOCharge;
				RtcCostPerTPT				+= tableData[i].RtcCostPerTPT;
				totalStatisticalCharge		=tableData[i].totalStatisticalCharge;
				hamaliCharge				+=tableData[i].hamaliCharge;
				totalRtc					+=tableData[i].totalRtc;
				actualTotalfreight			=tableData[i].actualTotalfreight;
				totalomkarfreight			+=tableData[i].totalomkarfreight;
				TotalslplOtherF1			+=tableData[i].slplOtherF1;
				TotalslplOtherF3			+=tableData[i].slplOtherF3;
				totalHamalisct				+=tableData[i].totalHamalisct;
				totalothersct				+=tableData[i].totalothersct;
				totalFreightAmountForReporter += tableData[i].totalFreightAmountForReporter;
				totalBookingAmtRenuka		   = tableData[i].totalBookingAmtRenuka;
				deliverychargesforSrst		  += tableData[i].deliverychargesforSrst; 
				totalAmountForVljl1			  += parseFloat(tableData[i].lrGrandTotalForNM);
				totalGSTSES						+= tableData[i].totalGstAmt;
				bookingTotalSRST  		+= parseFloat(tableData[i].bookingTotalSRST);
				totalOtherForSET  		+= tableData[i].totalOtherForSET;
				totalDDForSET	  		+= tableData[i].totalDDForSET;
				
				if(tableData[i].customBookingAmtRenukaCgstSgst != undefined)
					customBookingAmtRenukaCgst		   += tableData[i].customBookingAmtRenukaCgstSgst;

				if(tableData[i].customBookingAmtRenukaCgstSgst != undefined)
					customBookingAmtRenukaSgst		   += tableData[i].customBookingAmtRenukaCgstSgst;
				
				if(tableData[i].customBookingAmtRenukaIgst != undefined)
					customBookingAmtRenukaIgst		   += tableData[i].customBookingAmtRenukaIgst;
				
				if(totalunAddedTaxAmount > 0) {
					lrNoWithoutTransporterGst.push(tableData[i].lrNoWithoutTransporterGst);
					var lrNumberCommaSeparated = lrNoWithoutTransporterGst.join();
				}
				
				if(configuration.accountGroupId == 619 && tableData[i].taxPercentage > 0) {
					if(tableData[i].taxPercentage == 2.5 || tableData[i].taxPercentage == 5) {
						taxPercentage = tableData[i].taxPercentage;
						$(".newGstDataForRenuka").show();
						totalBookingRenuka += tableData[i].bookingAmount;
					} else {
						$(".oldGstDataForRenuka").show();
						totalBookingRenuka2 += tableData[i].bookingAmount;
					}
				}
			}
			
			if(configuration.accountGroupId == 619) {
				var cgstwithoutRoundOffRENUKA1 = 0;
				var cgstwithoutRoundOffRENUKA2 = 0;
				var igstwithoutRoundOffRENUKA1 = 0;
				var igstwithoutRoundOffRENUKA2 = 0;
							
				for(i = 0; i < tableData.length; i++) {
					if(tableData[i].taxPercentage == 2.5 || tableData[i].taxPercentage == 5) {
						if(taxPercentage == 2.5) {
							cgstwithoutRoundOffRENUKA1 = round2(totalBookingRenuka * 2.5 / 100);
							$("[data-bill='cgstwithoutRoundOffRenuka1']").html(cgstwithoutRoundOffRENUKA1);
							$("[data-bill='sgstwithoutRoundOffRenuka1']").html(cgstwithoutRoundOffRENUKA1);
						} else {
							igstwithoutRoundOffRENUKA1 = round2(totalBookingRenuka * 5 / 100);
							$("[data-bill='igstwithoutRoundOffRENUKA1']").html(igstwithoutRoundOffRENUKA1);
						}
					} else if(parseFloat(customBookingAmtRenukaCgst) > 0) {
						cgstwithoutRoundOffRENUKA2 = round2(totalBookingRenuka2 * 6 / 100);
						$("[data-bill='cgstwithoutRoundOffRenuka2']").html(cgstwithoutRoundOffRENUKA2);
						$("[data-bill='sgstwithoutRoundOffRenuka2']").html(cgstwithoutRoundOffRENUKA2);
					} else {
						igstwithoutRoundOffRENUKA2 = round2(totalBookingRenuka2 * 12 / 100);
						$("[data-bill='igstwithoutRoundOffRENUKA2']").html(igstwithoutRoundOffRENUKA2);
					}
				}
				
				let grandTotalForRenuka = billDetailsForPrintingBill.grandTotal.toFixed(2);
				$("[data-table='totalRoundOffGSTAmount']").html((Number(Number(grandTotalForRenuka) + Number(billDetailsForPrintingBill.additionalDiscount)) - (Number(bookingAmount) + Number(cgstwithoutRoundOffRENUKA1 + cgstwithoutRoundOffRENUKA2) + Number(cgstwithoutRoundOffRENUKA1 + cgstwithoutRoundOffRENUKA2) + Number(igstwithoutRoundOffRENUKA1 + igstwithoutRoundOffRENUKA2))).toFixed(2));
				$("[data-bill='grandTotalForRenuka']").html(Number(Number(grandTotalForRenuka) + Number(billDetailsForPrintingBill.additionalDiscount)).toFixed(2))
				$("[data-bill='grandTotalForRenukaInWord']").html(convertNumberToWords(Number(Number(grandTotalForRenuka) + Number(billDetailsForPrintingBill.additionalDiscount)).toFixed(2)));
			}	
			
			if(totalBookingAmtRenuka > 0)
				$("[data-table='totalBookingAmtRenuka']").html((totalBookingAmtRenuka).toFixed(2));
			else
				$("[data-table='totalBookingAmtRenuka']").html("");

			$("[data-bill='bookingTotalWithoutTaxInWords']").html(convertNumberToWords(bookingTotalWithoutTax));
			
			/*let diffamount = grandTotalWithTaxAndAdditionalCharge - (Number(bookingTotalWithoutTax) + Number(totalTaxWithDecimal)) ;

			if(totalCGSTWithDecimal > 0) {
				$("[data-table='totalCGSTWithDecimalRenuka']").html(Number(totalCGSTWithDecimal) + Number(diffamount.toFixed(2) / 2));	  
				$("[data-table='totalIGSTWithDecimalRenuka']").html(0);	   
			} else {
				$("[data-table='totalCGSTWithDecimalRenuka']").html(0);
				$("[data-table='totalIGSTWithDecimalRenuka']").html(Number(totalIGSTWithDecimal) + Number(diffamount.toFixed(2)));
			}*/
			
			if(totalCGSTWithDecimal > 0) {
				$("[data-table='totalCGSTWithDecimalRenuka']").html(Number(((totalBookingAmtRenuka * 6) / 100).toFixed(2)));	
				$("[data-table='totalIGSTWithDecimalRenuka']").html(0);	   
			} else {
				$("[data-table='totalCGSTWithDecimalRenuka']").html(0);
				$("[data-table='totalIGSTWithDecimalRenuka']").html(Number(((totalBookingAmtRenuka * 12) / 100).toFixed(2)));
			}
			
			$("[data-table='grandTotalWithTaxRenuka']").html((Number(totalBookingAmtRenuka) + Number(((totalBookingAmtRenuka * 12) / 100).toFixed(2))).toFixed(2));
			
			if(lrNumberCommaSeparated != undefined)
				$("[data-table='lrNumberCommaSeparated']").html(lrNumberCommaSeparated);
			
			if(totalActualWeight > 0) {
				$("[data-table='actualCharge']").html(totalActualWeight);
				$("[data-table='totalActualWeight']").html(totalActualWeight);
				$("[data-table='totalActualWeightInQuintal']").html((totalActualWeight/100).toFixed(2));
			} else
				$("[data-table='actualCharge']").html("");
			
			if(totalnewOtherCharge > 0)
				$("[data-table='totalOtherForAtc']").html(totalnewOtherCharge - (totallrCharge + totalBookingDelivery + totalDoorCollection));
			else
				$("[data-table='totalOtherForAtc']").html("");
			
			if(totaldocketCharge > 0)
				$("[data-table='totaldocketCharge']").html(totaldocketCharge);
			else
				$("[data-table='totaldocketCharge']").html("");
			
			if(totalFinalAmount > 0)
				$("[data-table='totalFinalAmount']").html(totalFinalAmount);
			else
				$("[data-table='totalFinalAmount']").html("0");
			
			if(totalfreight > 0){
				$("[data-table='totalfreight']").html(totalfreight);
				$("[data-table='totalfreightRoundoff']").html(Math.round(totalfreight));
			}else{
				$("[data-table='totalfreight']").html("0");
				$("[data-table='totalfreightRoundoff']").html("0");
			}
				
			if(actualTotalfreight > 0)
				$("[data-table='actualTotalfreight']").html(actualTotalfreight);
			else
				$("[data-table='actualTotalfreight']").html("0");
			
			if(RtcCostPerTPT > 0)
				$("[data-table='totalRtcCostPerTPT']").html(RtcCostPerTPT);
			else
				$("[data-table='totalRtcCostPerTPT']").html("");
				
			if(totalStatisticalCharge > 0)
				$("[data-table='totalStatisticalCharge']").html(totalStatisticalCharge);
			else
				$("[data-table='totalStatisticalCharge']").html("");
			
			if(hamaliCharge > 0)
				$("[data-table='totalhamaliCharge']").html(hamaliCharge);
			else
				$("[data-table='totalhamaliCharge']").html("");
				
			if(totalRtc > 0)
				$("[data-table='totaltotalRtcCharge']").html(totalRtc);
			else
				$("[data-table='totaltotalRtcCharge']").html("");
			
			if(totalOtherForAtc > 0)
				$("[data-table='totalOtherForAtc']").html(totalOtherForAtc);
			else
				$("[data-table='totalOtherForAtc']").html("0");
				
			if(lrFreight > 0)
				$("[data-table='lrFreight']").html(lrFreight);
			else
				$("[data-table='lrFreight']").html("0");
				
			if(freight > 0)
				$("[data-table='freight']").html(freight);
			else
				$("[data-table='freight']").html("0");
			
			if(totalfreightdecimal > 0)
				$("[data-table='totalfreightdecimal']").html(totalfreightdecimal);
			else
				$("[data-table='totalfreightdecimal']").html("0");
				
			if(totalGST > 0)
				$("[data-table='totalgst']").html(totalGST);
			else
				$("[data-table='totalgst']").html("0");
			
			if(totalfreight > 0) {
				var newTotal	= (totalOtherNew);
				var finalTotal	= newTotal.toFixed(2);
				$("[data-table='newGrandTotal']").html(finalTotal);
				$("[data-table='newGrandTotalRoundOff']").html((Math.round(finalTotal)));
				$("[data-table='newGrandTotalInWord']").html(convertNumberToWord(Math.round(finalTotal)) +' '+ 'only');
			} else {
				$("[data-table='newGrandTotal']").html("0");
				$("[data-table='newGrandTotalRoundOff']").html("0");
				$("[data-table='newGrandTotalInWord']").html("0");
			}
			
			if(chargeWeight > 0 && totalArtRate > 0) {
				$("[data-table='RtcCostPerTPT']").html(chargeWeight*totalArtRate);
			}

			if(totalfreight > 0)
				$("[data-table='totalfreightinword']").html(convertNumberToWord(Math.round(totalfreight)) +' '+ 'only');
			else
				$("[data-table='totalfreightinword']").html("Zero only");
			
			$("[data-table='totalLr']").html(totalLR);
			
			if(totalGST > 0)
				$("[data-table='totalGST']").html(totalGST);
			else if(configuration.removeChargesColumnWithZeroTotal)
				$(".totalGST").hide();
			else
				$("[data-table='totalGST']").css('display','none');
			
			if(totalWeight > 0) {
				$("[data-table='totalWeightRoundOff']").html(Math.round(totalWeight));
				$("[data-table='totalWeight']").html(totalWeight.toFixed(3));
				$("[data-table='totalWeightInQuintal']").html((totalWeight/100).toFixed(2));
			} else{
				$("[data-table='totalWeight']").html("");
				$("[data-table='totalWeightRoundOff']").html("");
				$(".hideTotalWeight").hide();
			}
			
			if(grandTotalbookingcharwithoutDly > 0)
				$("[data-table='grandTotalbookingcharwithoutDly']").html(grandTotalbookingcharwithoutDly);
			else
				$("[data-table='grandTotalbookingcharwithoutDly']").html("");
			
			if(totalhamali > 0)
				$("[data-table='totalhamali']").html(totalhamali);
			else if(configuration.removeChargesColumnWithZeroTotal)
				$(".hamali").hide();
			else
				$("[data-table='totalhamali']").html("");
			
			if(totalQuantity > 0)
				$("[data-table='totalQuantity']").html(totalQuantity);
			else
				$("[data-table='totalQuantity']").html("");
			
			if(totalOthercharge > 0)
				$("[data-table='totalOthercharge']").html(totalOthercharge);
			else
				$("[data-table='totalOthercharge']").html("0");
			
			if(totalunAddedTaxAmount > 0)
				$("[data-table='totalunAddedTaxAmount']").html(TotalunAddedTaxAmount);
			else
				$("[data-table='totalunAddedTaxAmount']").html("");
			
			if(grandTotalForSts > 0)
				$("[data-table='grandTotalForSts']").html(grandTotalForSts);
			else
				$("[data-table='grandTotalForSts']").html("");
			
			if(totalBuiltyChrg > 0)
				$("[data-table='totalBuiltyChrg']").html(totalBuiltyChrg);
			else
				$("[data-table='totalBuiltyChrg']").html("0");
				
			if(totalEwayBillCharge > 0)
				$("[data-table='totalEwayBillCharge']").html(totalEwayBillCharge);
			else
				$("[data-table='totalEwayBillCharge']").html("");
				
			if(totalFuelSurCharge > 0)
				$("[data-table='totalFuelSurCharge']").html(totalFuelSurCharge);
			else
				$("[data-table='totalFuelSurCharge']").html("0");
			
			if(totalSurCharge > 0)
				$("[data-table='totalSurCharge']").html(totalSurCharge);
			else
				$("[data-table='totalSurCharge']").html("0");
				
			if(totalhandling > 0)
				$("[data-table='totalhandling']").html(totalhandling);
			else
				$("[data-table='totalhandling']").html("0");
				
			if(totalCODDOD > 0)
				$("[data-table='totalCODDOD']").html(totalCODDOD);
			else
				$("[data-table='totalCODDOD']").html("0");
				
			if(totalBkgDelivery > 0)
				$("[data-table='totalBkgDelivery']").html(totalBkgDelivery);
			else
				$("[data-table='totalBkgDelivery']").html("");
				
			$("[data-table='totalRTOCharge']").html(totalRTOCharge);
			
			if(lastItrObj.lastITR == true || lastItrObj.lastITR == 'true') {
				$('.klfooter').append("<table class='footer borderTop borderRight borderLeft borderBottom'	width= '100%' cellpadding='0' cellspacing='0' border='0'><tr><td colspan='2' class='borderBottom'><table width='100%' cellpadding='0' cellspacing='0' border='0'><tr><td class='valignBottom pageBreakNeeded' width='85%'><table width= '100%' cellpadding='0' cellspacing='0' border='0' class=''><tr class='' style='height: 33px;'><td class='paddingLeft5 bold' width='14%'><span data-selector='amountInWords'></span></td><td class='textCenter bold	pageBreakNeeded' style='font-size: 17px;' width='90%'><span>"+grandTotalInword+"</span></td></tr></table></td><td class='valignBottom'><table width= '100%' cellpadding='0' cellspacing='0' border='0' class=''><tr class='' style='height: 33px;'><td class='paddingLeft5 bold'><span >Rs</span></td><td class='textRight borderLeft paddingRight5 bold '><span>"+grandTotalRound+"</span></td></tr></table></td></tr></table></td></tr><tr><td width='70%' class='paddingLeft5' style='padding-top: 5px;'><table width= '100%' cellpadding='0' cellspacing='0' border='0' style='font-size: 12px;'><tr><td data-selector='line1' class='bold'></td></tr><tr><td data-selector='line2'></td></tr><tr><td data-selector='line3'></td></tr><tr><td data-selector='line4'></td></tr><tr><td data-selector='line5'></td></tr></table></td><td width='30%' style='padding-top: 5px;'><table width= '100%' cellpadding='0' cellspacing='0' border='0'><tr><td data-selector='line6' class='textLeft paddingRight5'></td></tr><tr><td data-selector='line7' class='textLeft paddingRight5'>&nbsp;</td></tr><tr><td>&nbsp;</td></tr><tr><td>&nbsp;</td></tr><tr><td  class='textLeft paddingRight5'>&nbsp;</td></tr></table></td></tr><tr><td colspan='2'><table width= '100%' cellpadding='0' cellspacing='0' border='0' style='height: 60px;'><tr><td width='33%' class=' textCenter '><span>Prepared By</span><br><span >"+executiveName+"</span></td><td width='33%' class=' textCenter '><span>Checked by</span><br><span>&nbsp;</span></td><td width='33%' class='' style='position: relative;left: 27px;bottom: 5px;'><span data-selector='line8'></span><br><span>&nbsp;</span></td></tr></table></td></tr></table>" );
				$('.kxcplFooter').append("<table class='' width= '100%' cellpadding='0' cellspacing='0' border='0'><tr><td class='height20 textCenter bold' style='font-size: 14px;'><span>Total</span></td></tr></table><table class='' width= '100%' cellpadding='0' cellspacing='0' border='0'><tr><td><table width= '100%' cellpadding='0' cellspacing='0' border='0'><tr><td width='80%' class='borderTop borderRight borderBottom'><table width= '100%' cellpadding='0' cellspacing='0' border='0'><tr class='height20'><td><span>&nbsp;</span></td></tr><tr class='height20'><td><span>&nbsp;</span></td></tr><tr class='height20'><td class='paddingLeft5 borderTop pageBreakNeeded bold'><span data-selector='amountInWords'></span><span>"+grandTotalInword+"</span></td></tr></table></td> " 
						+ "<td width='20%' class='borderTop borderBottom'><table width= '100%' cellpadding='0' cellspacing='0' border='0'><tr class='height20'><td class='borderRight borderBottom paddingLeft5 bold'><span class=''>Sub Total</span></td><td class='borderBottom paddingLeft5 textRight paddingRight5 bold'><span>"+grandTotal+"</span></td></tr><tr class='height20'><td class='borderRight borderBottom paddingLeft5 bold'><span >Round Off</span></td><td class='borderBottom textRight paddingRight5 bold' ><span>"+roundOffAmount+"</span></td></tr><tr class='height20'><td class='borderRight paddingLeft5 bold'> " 
						+ "<span >Net Amount</span></td><td class='textRight paddingRight5 bold'><span>"+grandTotalRound+"</span></td></tr></table></td></tr></table></td></tr></table><table class='' width= '100%' cellpadding='0' cellspacing='0' border='0'><tr><td width='80%' class='paddingLeft5'><table width= '100%' cellpadding='0' cellspacing='0' border='0'><tr><td data-selector='line1' class='bold'></td></tr><tr><td class='font14px' data-selector='line2'></td></tr><tr><td data-selector='line3' class='pageBreakNeeded font14px'></td></tr><tr><td class='font14px' data-selector='line4'></td></tr><tr><td class='font14px' data-selector='line5'></td></tr><tr><td class='font14px' data-selector='line6'></td></tr> " 
						+ "<tr><td class='font14px' data-selector='line7'></td></tr><tr><td class='font14px' data-selector='line8'></td></tr><tr><td class='font14px' data-selector='line9'></td></tr><tr><td class='font14px' data-selector='line10'></td></tr><tr><td class='font14px' data-selector='line11'></td></tr><tr><td class='font14px' data-selector='line12'></td></tr><tr><td class='font14px' data-selector='line13'></td></tr></table></td><td width='20%'><table width= '100%' cellpadding='0' cellspacing='0' border='0'><tr><td data-selector='line14' class='textRight paddingRight5'></td></tr><tr><td>&nbsp;</td></tr><tr><td>&nbsp;</td></tr><tr><td>&nbsp;</td></tr><tr><td>&nbsp;</td></tr><tr><td>&nbsp;</td></tr><tr><td>&nbsp;</td></tr><tr><td>&nbsp;</td></tr> " 
						+ "<tr><td>&nbsp;</td></tr><tr><td>&nbsp;</td></tr><tr><td>&nbsp;</td></tr><tr><td>&nbsp;</td></tr><tr><td data-selector='line15' class='textRight paddingRight5 bold'></td></tr></table></td></tr></table><table class='' width= '100%' cellpadding='0' cellspacing='0' border='0'><tr class='height60'><td width='33%' class='textLeft paddingLeft5 borderTop borderBottom '><span>Received By</span></td><td width='34%' class='textCenter borderTop borderBottom bold'><span>Prepared By</span><br><span>"+executiveName+"</span></td><td width='33%' class='textRight paddingRight5 borderTop borderBottom'><span>Checked By</span></td></tr></table></td></tr></table> ");
				if(configuration.showFooterOnLastPageBottom)
					$('.spacer').css('height', 0);
			}

			if(lastItrObj.lastITR == false || lastItrObj.lastITR == 'false'){
				if(configuration.showFooterOnLastPageBottom){
					$('.lastPage').empty();
					$('.spacer').remove();
				} else {
					 $('.lastPage').css('display','none');
				}
			}
			
			if(lastItrObj.firstITR	== true	 || lastItrObj.firstITR	 == 'true')
				$('#firstpage').removeClass("hide");
			
			if(totaldocketCharge == 0)
				$('.docketChargeCol').css('display','none');
			
			if(totalGST == 0)
				$('.totalTaxRow').css('display','none');
			
			if(totalweightRate >= 0)
				$("[data-table='totalweightRate']").html(totalweightRate);
			else
				$("[data-table='totalweightRate']").html("");
			
			if(totalArtRate >= 0)
				$("[data-table='totalArtRate']").html(totalArtRate);
			else
				$("[data-table='totalArtRate']").html("");
			
			$("[data-table='totalweightRatetoFixed']").html(totalweightRatetoFixed);
			
			if(totalarticleRate >= 0)
				$("[data-table='totalarticleRate']").html(totalarticleRate);
			else
				$("[data-table='totalarticleRate']").html("");

			if(totalArticleRate1 >= 0)
				$("[data-table='totalarticleRate1']").html(totalArticleRate1);
			else
				$("[data-table='totalarticleRate1']").html("");
			
			if(totallrCharge > 0)
				$("[data-table='totallrCharge']").html(totallrCharge);	
			else
				$("[data-table='totallrCharge']").html("0");
			
			if(totaldlycharge > 0)
				$("[data-table='totaldlycharge']").html(totaldlycharge);	
			else
				$("[data-table='totaldlycharge']").html("");
			
			if(totalgrandtotalkps > 0){
				$("[data-table='totalgrandtotalkps']").html(totalgrandtotalkps);
				$("[data-table='totalgrandtotalkpsInWord']").html(convertNumberToWord(Math.round(totalgrandtotalkps)) +' '+ 'Only');
			}
			else
				$("[data-table='totalgrandtotalkps']").html("");
			
			if(bookingAmount > 0) {
				$("[data-table='totalgrandtotalnm']").html("&#X20B9;"+ (bookingAmount).toFixed(2));
				$("[data-table='totalgrandtotalvljl']").html("&#X20B9;" + (bookingAmount).toFixed(2));
				$("[data-table='bookingAmntReporter']").html((bookingAmount).toFixed(2));
			} else {
				$("[data-table='totalgrandtotalnm']").html("");
				$("[data-table='totalgrandtotalvljl']").html("");
			}
			
			if(totalAmountForNm1  > 0){
				$("[data-table='totalgrandtotalnm1']").html("INR "+"&#X20B9;" + totalAmountForNm1);	
				$("[data-table='totalgrandtotalnm1InWords']").html(convertNumberToWord(totalAmountForNm1) + ' ' + 'Only');
			} else{
				$("[data-bill='totalgrandtotalnm1InWords']").html('');
				$("[data-table='totalamountfornm1']").html("");

			}
				
			if(totalAmountForVljl1	> 0) {
				$("[data-table='totalamountforVljl1']").html("INR "+"&#X20B9;" + (totalAmountForVljl1).toFixed(2));
				$("[data-table='totalamountforVljlDue']").html("&#X20B9;" + (totalAmountForVljl1).toFixed(2));
			} else {
				$("[data-table='totalamountforVljl1']").html("");
				$("[data-table='totalamountforVljlDue']").html("" );
			}
			
			if(totalotherChargeForCustom > 0)
				$("[data-table='totalotherChargeForCustom']").html(totalotherChargeForCustom);	
			else
				$("[data-table='totalotherChargeForCustom']").html("");
			
			if(totalHandling  > 0)
				$("[data-table='totalHandling']").html(totalHandling );
			else if(configuration.removeChargesColumnWithZeroTotal)
				$(".totalHandling").hide();
			else
				$("[data-table='totalHandling']").html("");

			if(totalOtherCharges  > 0)
				$("[data-table='totalOtherCharges']").html(totalOtherCharges );
			else
				$("[data-table='totalOtherCharges']").html(0);
			
			if(grandtotalcustomAOCCharge  > 0)
				$("[data-table='grandtotalcustomAOCCharge']").html(grandtotalcustomAOCCharge );
			else
				$("[data-table='grandtotalcustomAOCCharge']").html("");
			
			if(grandtotalcustomcharge  > 0)
				$("[data-table='grandtotalcustomcharge']").html(grandtotalcustomcharge );
			else
				$("[data-table='grandtotalcustomcharge']").html("");
			
			if(totalOtherChargesAmount > 0)
				$("[data-table='totalOtherChargesAmount']").html(totalOtherChargesAmount);	
			else
				$("[data-table='totalOtherChargesAmount']").html("");
		
			if(bookingTotalWithoutTax > 0)
				$("[data-table='bookingTotalWithoutTax']").html(bookingTotalWithoutTax);	
			else
				$("[data-table='bookingTotalWithoutTax']").html("");
			
			if(totalLocalCharge > 0)
				$("[data-table='totalLocalCharge']").html(totalLocalCharge);
			else if(configuration.removeChargesColumnWithZeroTotal)
				$(".totalLocalCharge").hide();
			else
				$("[data-table='totalLocalCharge']").html("");

			if(totalOtherBkgCharge > 0)
				$("[data-table='totalOtherBkgCharge']").html(totalOtherBkgCharge);	
			else if(configuration.removeChargesColumnWithZeroTotal)
				$(".totalOtherBkgCharge").hide();
			else
				$("[data-table='totalOtherBkgCharge']").html("");

			if(totalDDCharge > 0)
				$("[data-table='totalDDCharge']").html(totalDDCharge);
			else if(configuration.removeChargesColumnWithZeroTotal)
				$(".totalDDCharge").hide();
			else
				$("[data-table='totalDDCharge']").html("");

			if(totalLabourCharge > 0)
				$("[data-table='totalLabourCharge']").html(totalLabourCharge);
			else if(configuration.removeChargesColumnWithZeroTotal)
				$(".totalLabourCharge").hide();
			else
				$("[data-table='totalLabourCharge']").html("");
				

			if(totalOtherBkgCharge > 0)
				$("[data-table='totalOtherBkgCharge']").html(totalOtherBkgCharge);
			else if(configuration.removeChargesColumnWithZeroTotal)
				$(".totalOtherBkgCharge").hide();
			else
				$("[data-table='totalOtherBkgCharge']").html("");
			
			if(totaldocketCharge > 0)
				$("[data-table='totaldocketCharge']").html(totaldocketCharge);
			else if(configuration.removeChargesColumnWithZeroTotal)
				$(".totaldocketCharge").hide();
			else
				$("[data-table='totaldocketCharge']").html("");
			
			if(totalDoorCollection > 0)
				$("[data-table='totalDoorCollection']").html(totalDoorCollection);
			else if(configuration.removeChargesColumnWithZeroTotal)
				$(".totalDoorCollection").hide();
			else
				$("[data-table='totalDoorCollection']").html("");
			
			if(totalFOV > 0)
				$("[data-table='totalFOV']").html(totalFOV);
			else if(configuration.removeChargesColumnWithZeroTotal)
				$(".totalFOV").hide();
			else
				$("[data-table='totalFOV']").html("");

			if(totalDD > 0)
				$("[data-table='totalDD']").html(totalDD);
			else if(configuration.removeChargesColumnWithZeroTotal)
				$(".totalDD").hide();
			else
				$("[data-table='totalDD']").html("");

			if(totalDC > 0)
				$("[data-table='totalDC']").html(totalDC);
			else if(configuration.removeChargesColumnWithZeroTotal)
				$(".totalDC").hide();
			else
				$("[data-table='totalDC']").html("");

			if(totalStationaryCharge > 0)
				$("[data-table='totalStationaryCharge']").html(totalStationaryCharge);
			else if(configuration.removeChargesColumnWithZeroTotal)
				$(".totalStationaryCharge").hide();
			else
				$("[data-table='totalStationaryCharge']").html("");
			
			if(totalBookingDelivery > 0)
				$("[data-table='totalBookingDelivery']").html(totalBookingDelivery);
			else if(configuration.removeChargesColumnWithZeroTotal)
				$(".totalBookingDelivery").hide();
			else
				$("[data-table='totalBookingDelivery']").html("0");
				
			if(totallrCharge > 0)
				$("[data-table='totallrCharge']").html(totallrCharge);
			else if(configuration.removeChargesColumnWithZeroTotal)
				$(".totallrCharge").hide();
			else
				$("[data-table='totallrCharge']").html("0");
			
			if(totalHalting > 0)
				$("[data-table='totalHalting']").html(totalHalting);
			else if(configuration.removeChargesColumnWithZeroTotal)
				$(".totalHalting").hide();
			else
				$("[data-table='totalHalting']").html("");

			if(totalSTChargeBooking > 0)
				$("[data-table='totalSTChargeBooking']").html(totalSTChargeBooking);
			else if(configuration.removeChargesColumnWithZeroTotal)
				$(".totalSTChargeBooking").hide();
			else
				$("[data-table='totalSTChargeBooking']").html("");
			
			if(totalhalting > 0)
				$("[data-table='totalhalting']").html(totalhalting);
			else
				$("[data-table='totalhalting']").html("");
				
			if(totalExtraWt > 0)
				$("[data-table='totalExtraWt']").html(totalExtraWt);
			else
				$("[data-table='totalExtraWt']").html("");
			
			if(totalServiceCharge > 0)
				$("[data-table='totalServiceCharge']").html(totalServiceCharge);
			else if(configuration.removeChargesColumnWithZeroTotal)
				$(".totalServiceCharge").hide();
			else
				$("[data-table='totalServiceCharge']").html("0");
			
			if(totalDelCollCharge > 0)
				$("[data-table='totalDelCollCharge']").html(totalDelCollCharge);
			else if(configuration.removeChargesColumnWithZeroTotal)
				$(".totalDelCollCharge").hide();
			else
				$("[data-table='totalDelCollCharge']").html("0");
				
			if(totalInsurace > 0)
			
				$("[data-table='totalInsurace']").html(totalInsurace);
			else if(configuration.removeChargesColumnWithZeroTotal)
				$(".totalInsurace").hide();
			else
				$("[data-table='totalInsurace']").html("0");
			
			if(totalCCACharge > 0)
				$("[data-table='totalCCACharge']").html(totalCCACharge);
			else if(configuration.removeChargesColumnWithZeroTotal)
				$(".totalCCACharge").hide();
			else
				$("[data-table='totalCCACharge']").html("");
				
			if(totalTollCharge > 0)
				$("[data-table='totalTollCharge']").html(totalTollCharge);
			else if(configuration.removeChargesColumnWithZeroTotal)
				$(".totalTollCharge").hide();
			else
				$("[data-table='totalTollCharge']").html("");
			
			if(totaldetentionCharge > 0)
				$("[data-table='totaldetentionCharge']").html(totaldetentionCharge);
			else if(configuration.removeChargesColumnWithZeroTotal)
				$(".detentionCharge").hide();
			else
				$("[data-table='totaldetentionCharge']").html("");

			if(totalStatisticalCharge > 0)
				$("[data-table='totalStatisticalCharge']").html(totalStatisticalCharge);
			else if(configuration.removeChargesColumnWithZeroTotal)
				$(".statisticalCharge").hide();
			else
				$("[data-table='totalStatisticalCharge']").html("");

			if(totalRiskCharge > 0)
				$("[data-table='totalRiskCharge']").html(totalRiskCharge);
			else if(configuration.removeChargesColumnWithZeroTotal)
				$(".riskCharge").hide();
			else
				$("[data-table='totalRiskCharge']").html("");

			if(totalCollection > 0)
				$("[data-table='totalCollection']").html(totalCollection);
			else if(configuration.removeChargesColumnWithZeroTotal)
				$(".totalCollection").hide();
			else
				$("[data-table='totalCollection']").html("0");
			
			if(totalAoc > 0)
				$("[data-table='totalAoc']").html(totalAoc);
			else if(configuration.removeChargesColumnWithZeroTotal)
				$(".totalAoc").hide();
			else
				$("[data-table='totalAoc']").html("");
			
			if(totalLongLength > 0)
				$("[data-table='totalLongLength']").html(totalLongLength);
			else if(configuration.removeChargesColumnWithZeroTotal)
				$(".totalLongLength").hide();
			else
				$("[data-table='totalLongLength']").html("");
			
			if(totalOtherCharge1 > 0){
				$("[data-table='totalOtherCharge1']").html(totalOtherCharge1);	
				$("[data-table='totalOtherCharge2']").html(totalOtherCharge1);	
			}else{
				$("[data-table='totalOtherCharge1']").html("");
			}
			
			if(totalCGST > 0)
				$("[data-table='totalCGST']").html(totalCGST);	
			else {
				$('gsthide').hide();
				$("[data-table='totalCGST']").html("0");
			}

			if(totalSGST > 0)
				$("[data-table='totalSGST']").html(totalSGST);	
			else {
				$('.sgsthide').hide();
				$("[data-table='totalSGST']").html("0");
				$('.gstLabel').html("(SGST + CGST)");
			}
			
			if(totalSGST > 0 || totalCGST > 0)
				$("[data-table='totalSGSTCGST']").html(totalSGST + totalCGST);
			else {
				$('.sgsthide').hide();
				$("[data-table='totalSGSTCGST']").html("0");
				$('.gstLabel').html("(SGST + CGST)");
			}
			
			if(totalCGSTWithDecimalforVLJL > 0 || totalSGSTWithDecimalforVLJL > 0)
				$("[data-table='totalSGSTandCGSTForVLJL']").html((totalCGSTWithDecimalforVLJL + totalSGSTWithDecimalforVLJL).toFixed(2));	
			else
				$("[data-table='totalSGSTandCGSTForVLJL']").html("0.00");
			
			if(totalCGST > 0)
				$("[data-table='totalCGST']").html(totalCGST);	
			else {
				$('.sgsthide').hide();
				$("[data-table='totalCGST']").html("0");
				$('.gstLabel').html("(SGST + CGST)");
			}

			if(totalIGST > 0) {
				$("[data-table='totalIGST']").html(totalIGST);
				$('.gstLabel').html("(IGST)");
			} else{
				$('.Igsthide').hide();
				$("[data-table='totalIGST']").html("0");
			}
			
			if(totalSGSTCGSTWithDecimal > 0)
				$("[data-table='totalSGSTCGSTWithDecimal']").html(totalSGSTCGSTWithDecimal);	
			else {
				$('.sgsthide').hide();
				$("[data-table='totalSGSTCGSTWithDecimal']").html("0");
				$('.gstLabel').html("(SGST + CGST)");
			}
			
			if(totalGSTSES > 0)
				$("[data-table='totalGSTSES']").html(totalGSTSES);	
			else
				$("[data-table='totalGSTSES']").html("0");
			
			if(totalnewOtherCharge > 0)
				$("[data-table='totalnewOtherCharge']").html(totalnewOtherCharge);	
			else
				$("[data-table='totalnewOtherCharge']").html("0");
			
			if(totalnewOtherChargedecimal > 0)
				$("[data-table='totalnewOtherChargedecimal']").html(totalnewOtherChargedecimal);	
			else
				$("[data-table='totalnewOtherChargedecimal']").html("0");
			
			if(totalOtherChargeExcFreight > 0) 
				$("[data-table='totalOtherChargeExcFreight']").html(totalOtherChargeExcFreight);
			else
				$("[data-table='totalOtherChargeExcFreight']").html("");
			
			if(totalOtherChargeExcFreightRoundoff > 0) 
				$("[data-table='totalOtherChargeExcFreightRoundoff']").html(totalOtherChargeExcFreightRoundoff);
			else
				$("[data-table='totalOtherChargeExcFreightRoundoff']").html(0);
				
			if(totalOtherChargeExcFreight > 0)
				$("[data-table='totalOtherChargeExcFreightAndDDC']").html(totalOtherChargeExcFreightAndDDC);
			else
				$("[data-table='totalOtherChargeExcFreightAndDDC']").html("");
				
			if(totalLoading > 0)
				$("[data-table='totalLoading']").html(totalLoading);
			else if(configuration.removeChargesColumnWithZeroTotal)
				$(".totalLoading").hide();
			else
				$("[data-table='totalLoading']").html("");

			if(totalUnloading > 0)
				$("[data-table='totalUnloading']").html(totalUnloading);
			else if(configuration.removeChargesColumnWithZeroTotal)
				$(".totalUnloading").hide();
			else
				$("[data-table='totalUnloading']").html("");

			if(totalUnion > 0)
				$("[data-table='totalUnion']").html(totalUnion);
			else if(configuration.removeChargesColumnWithZeroTotal)
				$(".totalUnion").hide();
			else
				$("[data-table='totalUnion']").html("");

			if(totalBookCharge > 0)
				$("[data-table='totalBookCharge']").html(totalBookCharge);
			else
				$("[data-table='totalBookCharge']").html("");
			
			if(totalCrossingCharge > 0)
				$("[data-table='totalCrossingCharge']").html(totalCrossingCharge);
			else
				$("[data-table='totalCrossingCharge']").html("");
			
			if(totalBcCharge > 0)
				$("[data-table='totalBcCharge']").html(totalBcCharge);
			else if(configuration.removeChargesColumnWithZeroTotal)
				$(".totalBcCharge").hide();
			else
				$("[data-table='totalBcCharge']").html("");
					
			if(totalDoubleDelivery > 0)
				$("[data-table='totalDoubleDelivery']").html(totalDoubleDelivery);
			else
				$("[data-table='totalDoubleDelivery']").html(0);
			
			if(totalLoadingDetention > 0)
				$("[data-table='totalLoadingDetention']").html(totalLoadingDetention);
			else
				$("[data-table='totalLoadingDetention']").html(0);
			
			if(totalUnloadingDetention > 0)
				$("[data-table='totalUnloadingDetention']").html(totalUnloadingDetention);
			else
				$("[data-table='totalUnloadingDetention']").html(0);

			if(totalOtherChargeHtc > 0)
				$("[data-table='totalOtherChargeHtc']").html(totalOtherChargeHtc);
			else
				$("[data-table='totalOtherChargeHtc']").html(0);
			
			if(totalQuantityForHtc > 0)
				$("[data-table='totalQuantityForHtc']").html(totalQuantityForHtc);
			else
				$("[data-table='totalQuantityForHtc']").html("");
			
			if(totalCGSTWithDecimal > 0)
				$("[data-table='totalCGSTWithDecimal']").html(totalCGSTWithDecimal);	
			else
				$("[data-table='totalCGSTWithDecimal']").html("0");

			if(totalSGSTWithDecimal > 0)
				$("[data-table='totalSGSTWithDecimal']").html(totalSGSTWithDecimal);	
			else
				$("[data-table='totalSGSTWithDecimal']").html("0");
			
			if(totalIGSTWithDecimal > 0)
				$("[data-table='totalIGSTWithDecimal']").html(totalIGSTWithDecimal);	
			else
				$("[data-table='totalIGSTWithDecimal']").html("0");
			

			$("[data-table='totalCgstSgstOfbookingAmount']").html(totalCgstSgstOfbookingAmount);
			$("[data-table='totalIgstOfbookingAmount']").html(totalIgstOfbookingAmount);

			if(totalAcCharge > 0)
				$("[data-table='totalAcCharge']").html(totalAcCharge);	
			else if(configuration.removeChargesColumnWithZeroTotal)
				$(".totalAcCharge").hide();
			else
				$("[data-table='totalAcCharge']").html("0");

			if(totalIandSCharge > 0)
				$("[data-table='totalIandSCharge']").html(totalIandSCharge);
			else if(configuration.removeChargesColumnWithZeroTotal)
				$(".IandSCharge").hide();
			else
				$("[data-table='totalIandSCharge']").html("");
				
			if(totalPickupCharge > 0)
				$("[data-table='totalPickupCharge']").html(totalPickupCharge);
			else if(configuration.removeChargesColumnWithZeroTotal)
				$(".PickupCharge").hide();
			else
				$("[data-table='totalPickupCharge']").html("0");
				
			if(totalDoorPickupCharge > 0)
				$("[data-table='totalDoorPickupCharge']").html(totalDoorPickupCharge);	
			else
				$("[data-table='totalDoorPickupCharge']").html("0");
				
			if(totalOctroiChrg > 0)
				$("[data-table='totalOctroiChrg']").html(totalOctroiChrg);	
			else
				$("[data-table='totalOctroiChrg']").html("0");
			
			if(totOtherChrgSngt > 0)
				$("[data-table='totOtherChrgSngt']").html(totOtherChrgSngt);
			else
				$("[data-table='totOtherChrgSngt']").html("");
			
			if(wayBillNumberForTransporter != undefined)
				$("[data-table='wayBillNumberForTransporter']").html(wayBillNumberForTransporter);
			else
				$("[data-table='wayBillNumberForTransporter']").html("");
			
			if(wayBillNumberForUnaddedTaxAmnt != undefined)
				$("[data-table='wayBillNumberForUnaddedTaxAmnt']").html(wayBillNumberForUnaddedTaxAmnt);
			else
				$("[data-table='wayBillNumberForUnaddedTaxAmnt']").html("");
			
			if(showDetailsForSngt == true || showDetailsForSngt == "true")
				$(".hideAddedTaxAmount1").hide();
			else
				$(".hideAddedTaxAmount2").hide();
				
			if(totalPickupCharge > 0)
				$("[data-table='totalPickupCharge']").html(totalPickupCharge);
			else if(configuration.removeChargesColumnWithZeroTotal)
				$(".totalPickupCharge").hide();
			else
				$("[data-table='totalPickupCharge']").html("");
				
			if(totalDD > 0)
				$("[data-table='totalDD']").html(totalDD);
			else if(configuration.removeChargesColumnWithZeroTotal)
				$(".totalDD").hide();
			else
				$("[data-table='totalDD']").html("");
				
			if(totalhamali > 0)
				$("[data-table='totalhamali']").html(totalhamali);
			else if(configuration.removeChargesColumnWithZeroTotal)
				$(".totalhamali").hide();
			else
				$("[data-table='totalhamali']").html("");
			
			if(totalPickUpAndDdCharge > 0)
				$("[data-table='totalPickUpAndDdCharge']").html(totalPickUpAndDdCharge);
			else if(configuration.removeChargesColumnWithZeroTotal)
				$(".totalPickUpAndDdCharge").hide();
			else
				$("[data-table='totalPickUpAndDdCharge']").html("");

			if(totalHamaliAndIAndSCharges > 0)
				$("[data-table='totalHamaliAndIAndSCharges']").html(totalHamaliAndIAndSCharges);
			else if(configuration.removeChargesColumnWithZeroTotal)
				$(".totalHamaliAndIAndSCharges").hide();
			else
				$("[data-table='totalHamaliAndIAndSCharges']").html("");

			if(deliveryDiscount > 0)
				$("[data-table='deliveryDiscount']").html(deliveryDiscount);
			else
				$("[data-table='deliveryDiscount']").html("");
			
			if(totalLocalChrg > 0)
				$("[data-table='totalLocalChrg']").html(totalLocalChrg);
			else
				$("[data-table='totalLocalChrg']").html("0");
		
			if(totalToPayHamali > 0)
				$("[data-table='totalToPayHamali']").html(totalToPayHamali);
			else
				$("[data-table='totalToPayHamali']").html("");
				
			if(totalDdcCharge > 0)
				$("[data-table='totalDdcCharge']").html(totalDdcCharge);
			else
				$("[data-table='totalDdcCharge']").html("");
				
			if(totalPodCharge > 0)
				$("[data-table='totalPodCharge']").html(totalPodCharge);
			else
				$("[data-table='totalPodCharge']").html("");
			
			if(totalHamalisct > 0)
				$("[data-table='totalHamalisct']").html(totalHamalisct);
			else
				$("[data-table='totalHamalisct']").html("");
				
			if(totalothersct > 0)
				$("[data-table='totalothersct']").html(totalothersct);
			else
				$("[data-table='totalothersct']").html("");
			
			if(totalFreightAmountForReporter > 0)
				$("[data-table='totalFreightAmountForReporter']").html(totalFreightAmountForReporter);
			else
				$("[data-table='totalFreightAmountForReporter']").html("");
			
			if(totalOda > 0)
				$("[data-table='totalOda']").html(totalOda);
			else if(configuration.removeChargesColumnWithZeroTotal)
				$(".totalOda").hide();
			else
				$("[data-table='totalOda']").html("");
				
			if(TotalslplOtherF1 > 0)
				$("[data-table='TotalslplOtherF1']").html(TotalslplOtherF1);
			else if(configuration.removeChargesColumnWithZeroTotal)
				$(".TotalslplOtherF1").hide();
			else
				$("[data-table='TotalslplOtherF1']").html("");
				
			if(TotalslplOtherF3 > 0)
				$("[data-table='TotalslplOtherF3']").html(TotalslplOtherF3);
			else if(configuration.removeChargesColumnWithZeroTotal)
				$(".TotalslplOtherF3").hide();
			else
				$("[data-table='TotalslplOtherF3']").html("");
		
			$("[data-table='grandtotalforptc']").html(grandtotalforptc);
			$("[data-table='grandtotalforptcwihdly']").html(totalAmountReceivedPtc);
			$("[data-table='lrGrandTotalForRectus']").html(lrGrandTotalForRectus);
				
			if(bookingAmount > 0)
				$("[data-table='bookingAmount']").html(bookingAmount.toFixed(2));
			else
				$("[data-table='bookingAmount']").html("");
			
			if(grandTotalForSSTS > 0)
				$("[data-table='grandTotalForSSTS']").html(grandTotalForSSTS);	
			else
				$("[data-table='grandTotalForSSTS']").html("");
				
			if(totalHandling > 0)	
				$(".handlingChargeMtl").show();
			else if(totalLoading > 0)
				$(".loadingChargeMtl").show();
			
			if(totalhalting == 0)
				$(".totalhaltingAtc").hide();
			
			if(totalLoading == 0)
				$(".totalLoadingAtc").hide();
				
			if(totalUnloading == 0)
				$(".totalUnloadingAtc").hide();
			
			if(totalStatisticalCharge == 0)
				$(".totalStatisticalChargeAtc").hide();
				
			if(totalRTOCharge == 0)
				$(".totalRTOChargeAtc").hide();
				
			if(totalOthercharge == 0)
				$(".totalOtherchargeAtc").hide();
				
			if(bookingTypeId == BOOKING_TYPE_SUNDRY_ID) {
				$(".hdfcBankReporter").hide();
				$(".iciciBankReporter").show();
			} else if(bookingTypeId == BOOKING_TYPE_FTL_ID || bookingTypeId == DIRECT_DELIVERY_DIRECT_VASULI_ID) {
				$(".hdfcBankReporter").show();
				$(".iciciBankReporter").hide();
			}			 
			
			if(totalomkarfreight > 0){
				$("[data-table='totalomkarfreight']").html(totalomkarfreight);
				$("[data-bill='grandTotalInWord1']").html(convertNumberToWord(Math.round(totalomkarfreight)) +' '+ 'Only');
			} else
				$("[data-table='totalomkarfreight']").html("");
				
			if(bookingTotalSRST > 0){
				$("[data-table='bookingTotalSRST']").html(bookingTotalSRST.toFixed(2));
				$("[data-table='taxForSrst']").html(parseFloat(customTaxForSrst.toFixed(2)) + parseFloat(bookingTotalSRST.toFixed(2)));
			} else{
				$("[data-table='bookingTotalSRST']").html("");
				$("[data-table='taxForSrst']").html("");
			}
			
			if(totalfreight == 0)
				$(".totalfreightAtc").hide();
				
			if(totalPacking > 0)	
				$(".packingChargeMtl").show();

			$("[data-bill='dashmeshGrandTotalinWords']").html(convertNumberToWord(Math.round(bookingAmount)) +' '+ 'only');
			if(totalscCharge > 0)
				$("[data-table='totalscCharge']").html(totalscCharge);
			else
				$("[data-table='totalhcCharge']").html("");
			
			if(totalhcCharge > 0)
				$("[data-table='totalhcCharge']").html(totalhcCharge);
			else
				$("[data-table='totalhcCharge']").html("");
			if(totaleicCharge > 0)
				$("[data-table='totaleicCharge']").html(totaleicCharge);
			else
				$("[data-table='totaleicCharge']").html("");
			
			if(totalwpCharge > 0)
				$("[data-table='totalwpCharge']").html(totalwpCharge);
			else
				$("[data-table='totalwpCharge']").html("");
				
			if(totaldbcCharge > 0)
				$("[data-table='totaldbcCharge']").html(totaldbcCharge);
			else
				$("[data-table='totaldbcCharge']").html("");
				
			if(totalLabourChg > 0)
				$("[data-table='totalLabourChg']").html(totalLabourChg);
			else
				$("[data-table='totalLabourChg']").html("0");

			if(totalODACharge > 0)
				$("[data-table='totalODACharge']").html(totalODACharge);
			else
				$("[data-table='totalODACharge']").html("0");
			
			if(totalDeliveryCharge > 0)
				$("[data-table='totalDeliveryCharge']").html(totalDeliveryCharge);
			else
				$("[data-table='totalDeliveryCharge']").html("0");
			
			if(totalspHandlingDICCharge > 0)
				$("[data-table='totalspHandlingDICCharge']").html(totalspHandlingDICCharge);
			else
				$("[data-table='totalspHandlingDICCharge']").html("0");
			
			if(totalCWBCharge > 0)
				$("[data-table='totalCWBCharge']").html(totalCWBCharge);
			else
				$("[data-table='totalCWBCharge']").html("0");
			
			if(totalWithPassCharge > 0)
				$("[data-table='totalWithPassCharge']").html(totalWithPassCharge);
			else
				$("[data-table='totalWithPassCharge']").html("0");
														
								
			if(totalParkingChg > 0)
				$("[data-table='totalParkingChg']").html(totalParkingChg);
			else
				$("[data-table='totalParkingChg']").html("0");
					
			if(deliverychargesforSrst > 0)
				$("[data-table='deliverychargesforSrst']").html(deliverychargesforSrst);
			else				
				$("[data-table='deliverychargesforSrst']").html("");
				
			if (grandTotalPanIndia > 0) {
				$("[data-table='grandTotalPanIndia']").html(grandTotalPanIndia);
				$("[data-bill='grandTotalPanIndiaInWords']").html(convertNumberToWord(Math.round(grandTotalPanIndia)) + ' ' + 'Only');
			} else{
				$("[data-table='grandTotalPanIndia']").html("");
				$("[data-bill='grandTotalPanIndiaInWords']").html("");
			}
			
			if(totaldocketCharge > 0)
				$(".docketChargePANINDIA").show();
			
			if(totalDoorCollection > 0)
				$(".DoorCollectionPANINDIA").show();
			
			if(totalDD > 0)
				$(".DDPANINDIA").show();
			
			if(totalOda > 0)
				$(".odaChargePANINDIA").show();
			
			if(totalFOV > 0)
				$(".FOVChargePANINDIA").show();
			
			if(totalHandling > 0)
				$(".HandlingChargePANINDIA").show();
			
			if(totalFuelSurCharge > 0)
				$(".FuelSurChargePANINDIA").show();
			
			if(totalOthercharge > 0)
				$(".OtherchargePANINDIA").show();
						
			if(totalHamaliDelyChrge > 0)
				$("[data-table='totalHamaliDelyChrge']").html(totalHamaliDelyChrge);	
			else
				$("[data-table='totalHamaliDelyChrge']").html("");
			
			if(totalDelyChrgExcHamali > 0)
				$("[data-table='totalDelyChrgExcHamali']").html(totalDelyChrgExcHamali);	
			else
				$("[data-table='totalDelyChrgExcHamali']").html("");
				
			if(grandBookingTotalDelyTotal > 0)
				$("[data-table='grandBookingTotalDelyTotal']").html(grandBookingTotalDelyTotal),
				$("[data-table='grandBookingTotalDelyTotalInWord']").html(convertNumberToWord(grandBookingTotalDelyTotal) + " " + "Only");
			else
				$("[data-table='grandBookingTotalDelyTotal']").html("");		 
				
			if(bookingTotalforGldts > 0)
				$("[data-table='bookingTotalforGldts']").html(bookingTotalforGldts);	
			else
				$("[data-table='bookingTotalforGldts']").html("");
				
			if (lrGrandTotalWithDelivery > 0)
				$("[data-table='lrGrandTotalWithDelivery']").html(lrGrandTotalWithDelivery);
			else
				$("[data-table='lrGrandTotalWithDelivery']").html("");	
			
			if(totalGCCharge > 0)
				$("[data-table='totalGCCharge']").html(totalGCCharge);
			else
				$("[data-table='totalGCCharge']").html("");
			
			if(totalOtherForSET > 0)
				$("[data-table='totalOtherForSET']").html(totalOtherForSET);
			else
				$("[data-table='totalOtherForSET']").html("");
				
			if(totalDDForSET > 0)
				$("[data-table='totalDDForSET']").html(totalDDForSET);
			else
				$("[data-table='totalDDForSET']").html("");
				
			$("[data-table='totalGrCharge']").html(totalGrCharge)
				
			$("[data-table='totalArticle']").html(
				tableData.map(d => d.totalArticle).reduce((a, b) => a + b, 0)
			)
			
			if(doorPickupCharge>0)
			$("[data-table='doorPickupCharge']").html(doorPickupCharge);
			else
			$("[data-table='doorPickupCharge']").html("");
			
			$("[data-table='totalNoOfInvoices']").html(
				tableData.map(d => {
					if (d.invoiceNo && d.invoiceNo !== "") {
						return d.invoiceNo.split(",").length;
					}
					return 0;
				}).reduce((a, b) => a + b, 0)
			)
		
			$("[data-table='totalOtherChargesForMGLLP']").html(totalOtherChargesForMGLLP)
			$("[data-table='totalGrandTotalForMGLLP']").html(totalGrandTotalForMGLLP)
			
			
			
		}, showPopup : function(billData, isExcel, showPrintWindowForDownldToExecl, isSearchBillPDFEmail,tableData,configuration){
			if(isExcel == true || isExcel == 'true'){
				setTimeout(function() {
					$('#popUpContent_650').hide();
				}, 100); 
				
				if($('#excelDownLoad').length == 0)
					$('body').append('<div id="excelDownLoad" style="left: 450px; position: absolute; top: 138px; z-index: 9999; opacity: 1;"></div>');
				
				$('#excelDownLoad').bPopup({
				}, function() {
					var _thisMod = this;
					
					if (configuration.isFromIVEditor)
					$(this).html("<div id='popUpDiv' class='confirm' style='width:280px;padding:16px;text-align:center;'><div style='font-size:20px;font-weight:bold;color:DodgerBlue;margin-bottom:16px;'>Print Option</div><div style='display:flex;gap:12px;justify-content:center;'><input type='button' id='excelButton' value='Excel' style='height:46px;width:80px;font-size:16px;'><input type='button' id='pdfButton' value='Pdf' style='height:46px;width:80px;font-size:16px;'><input type='button' id='cancelButton' value='Cancel' style='height:46px;width:80px;font-size:16px;'></div></div>");
					else
					$(this).html("<div id='popUpDiv' class='confirm' style='height:88px;width:200px; text-align: left;padding-top:12px; padding-left:12px;padding-bottom:50px;'>"
							+"<b style='font-size:18px; color:DodgerBlue;'>Print Option</b><br/><br/>"
							//+"<input type='button' id='laserPrintButton' value ='Print' style='height:50px;width:90px;font-size:20px;position:relative;'></input>"
							+"<input type='button' id='excelButton' value ='Excel' style='height:50px;width:90px;font-size:20px;position:relative;'></input>"
							+"<input type='button' id='cancelButton' value ='Cancel' style='height:50px;width:90px;font-size:20px;position:relative;'></input></div>"
							+"<input type='button' id='pdfButton' value ='Pdf' style='height:50px;width:90px;font-size:20px;position:relative;left: 98px;'></input></div>");

							$("#cancelButton").click(function(){
								_thisMod.close();
								setTimeout(function(){window.print();},200);
							})

							$("#excelButton").click(function(e) {
								_thisMod.close();
								var clonedTable = $('#downloadToExcel').clone();
								clonedTable.find('.hide').remove();
								clonedTable.find(".rupeeSymbol").html("Rs.");
								
								if(billData.branchId == NOID_BRANCHID_68313 || billData.branchId == GHAZIABAD_BRANCHID_68317)
									clonedTable.find('.hideGSTN').remove();
								else
									clonedTable.find('.hideHardCodeGSTN').remove();

								var path = 'data:application/vnd.ms-excel,' + encodeURIComponent(clonedTable.html());

//								var path = 'data:application/vnd.ms-excel,' + encodeURIComponent($('#downloadToExcel').html());
								window.open(path);

								e.preventDefault();
							});
							
					(function () {	
						$('#pdfButton').on('click', function () {  
							$('body').scrollTop(0);	 
							saveImageToPdf('downloadToExcel');
						});	 
					   
						function saveImageToPdf(idOfHtmlElement) {
						   var fbcanvas = document.getElementById(idOfHtmlElement);
						   html2canvas($(fbcanvas), {
							   onrendered: function (canvas) {

								var width = canvas.width;
								var height = canvas.height;
								var millimeters = {};
								millimeters.width = Math.floor(width * 0.264583);
								millimeters.height = Math.floor(height * 0.264583);

								var imgData = canvas.toDataURL('image/png');
								var doc = new jsPDF("p", "mm", "a4");
								doc.deletePage(1);
								doc.addPage(millimeters.width, millimeters.height);
								doc.addImage(imgData, 'PNG', 0, 0);
								doc.save('InvoicePrint.pdf');
							  }
							});
						}
					}());  
				});
				
			}
			
			let data	= {};
			
			data.totalCollection		= totalCollection;
			data.totalBookingDelivery	= totalBookingDelivery;
			data.totalLongLength		= totalLongLength;
			data.totalHandling			= totalHandling;
			data.totallrCharge			= totallrCharge;
			data.isBranchWisePrintFormatPopup	= isBranchWisePrintFormatPopup;
			data.totalAoc				= totalAoc;
			data.totalDD				= totalDD;
			data.totalhamali			= totalhamali;
			data.billDataForEMail       = billDataForEMail;
			data.tableData				= tableData;
			
			let path	= '/ivcargo/resources/js/module/view/invoiceprint/invoiceprintsetup_' + accountGroupId + '.js';
			if(urlExists(path)) {
				require([path], function(SheetSetUp) {
					SheetSetUp.setPopup(accountGroupId, data, isExcel);
				});
			} else if(configuration.enableInvoiceMasterPopup && (isExcel == false || isExcel == 'false') ){
			let path1	= '/ivcargo/resources/js/module/view/invoiceprint/invoiceMasterPopup.js';
				require([path1], function(invoiceMasterPopup) {
					invoiceMasterPopup.setPopup(accountGroupId, configuration);
				});
			}  else if(showPrintWindowForDownldToExecl && (isSearchBillPDFEmail == 'false' || isSearchBillPDFEmail == false) && (isExcel == false || isExcel == 'false')) {
				if(loadingPrintWindowOnrefresh)
					setTimeout(function(){window.print();},200);
			}
		}, generateBillPdf(billData, billPdfEmailAllowed, isSearchBillPDFEmail) {
			if(billPdfEmailAllowed == true || billPdfEmailAllowed == 'true') {
				$("#header").css('display','block');
				$(".removeLetterSpacing").css("letter-spacing", '10px');
				let jsonObject = new Object();
				jsonObject.billId		= billData.billId;
				jsonObject.invoicePrint = $("#mainContent").html();
				$("#header").css('display','none');
				$(".removeLetterSpacing").css("letter-spacing", '0px');
				invoicePdfEmail(billData);
			} else if(isSearchBillPDFEmail == true || isSearchBillPDFEmail == 'true') {
				if($('.pdfDownLoadEmail').length  == 0)
					$('body').append('<div class="pdfDownLoadEmail" style="left: 450px; position: absolute; top: 138px; z-index: 9999; opacity: 1;"></div>');
					
				$('.pdfDownLoadEmail').bPopup({
				}, function() {
					let _thisMod = this;
					$(this).html("<div style='height:250px;width:350px;'  class='confirm'><h1>Email option</h1><br><center><input type='text' name='emailAddress' id='emailAddress' style='margin-top:40px;width:250px;height:30px;' placeholder='Email Address' /></center> <br><br><button type='button' name='cancelButton' id='cancelButton' class='btn-danger'>Cancel</button><button type='button' name='emailButton' id='emailButton' class='btn-success' style='margin-left: 50px;'>Email</button>");
					
					if (billData.corporateAccountEmailAddress != undefined && billData.corporateAccountEmailAddress != null)
						$('#emailAddress').val(billData.corporateAccountEmailAddress);
					
					$("#cancelButton").click(function(){
						_thisMod.close();
					})

					$("#emailButton").click(function(e){
						if($('#emailAddress').val().trim().length > 0) {
							_thisMod.close();
							$("#header").css('display','block');
							$(".removeLetterSpacing").css("letter-spacing", '10px');
							$("#header").css('display','none');
							$(".removeLetterSpacing").css("letter-spacing", '0px');
							invoicePdfEmail(billData);
						} else {
							alert("Enter Email Address");
							$('#emailAddress').focus();
						}
					});
				});
			}
		}, getResponse() {
		
		}, getResponseAfterEmail(response) {
			hideLayer();
					
			if(response.message != undefined) {
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						
				setTimeout(() => {
					window.close();
				}, 2000);
			}
		},setDeductionCharges (response){
			let deductionCharges = response.deductionCharges;
			
			$('#deductionChargesTable').html('')
			deductionCharges.forEach((el)=>{
				let row = `
			        <tr>
			            <td class="width70per">${el.chargeTypeMasterName}</td>
			            <td class="textAlignRight paddingRight5px">${el.totalAmount}</td>
			        </tr>
			    `;
			$("[data-selector='chargeName"+el.chargeTypeMasterId+"']").html(el.chargeTypeMasterName);
			$("[data-selector='chargeValue"+el.chargeTypeMasterId+"']").html(el.totalAmount);
			$('#deductionChargesTable').append(row)

			})

			
		}
	}
});

function invoicePdfEmail(billData) {
	let jsonObject2 = new Object();
		
	showLayer();

	$.ajax({
		type: "POST",
		dataType: 'json',
		url: WEB_SERVICE_URL + "/creditorInvoiceWS/validateSessionBeforeRestHit.do",
		data: jsonObject2,
		success: function(response) {
			if (response != undefined && response.validatedSession) {
				let filename = 'Invoice_'+billData.billNumber+'.pdf';
				$(".removeLetterSpacing").css("letter-spacing", '10px !important');

				let elem = document.getElementById('mainContent');
				let opt = {
					filename: filename,
					margin: 10, // Adjust margins as needed (in mm)
					jsPDF: { unit: 'mm', format: 'a4', orientation: billData.invoicePrintPdfOrientation }, // Change orientation and paper size
					html2canvas: { scale: 2 }, // Increase resolution for better quality
					pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
				};

				html2pdf().set(opt).from(elem).output('blob').then((pdfData) => {
					let formData = new FormData();
					formData.append("files", pdfData, filename);
					formData.append("fileName", filename);
					formData.append("billId", billData.billId);
					formData.append("emailAddress", $('#emailAddress').val());
					formData.append("accountGroupId", response.accountGroupId);
					formData.append("branchId", response.branchId);
					formData.append("executiveId", response.executiveId);

					$(".removeLetterSpacing").css("letter-spacing", '0px !important');
						if (openInvoicePrintPopUpAfterBkgDly) {
							setTimeout(() => {
								window.close(); 
							}, 500); 
						}

						let xhr = new XMLHttpRequest();
						xhr.open('POST', '/ivwebservices/creditorInvoiceWS/generateInvoicePrintPdfByBillId.do?', true);
						xhr.onload = function() {
							hideLayer();
										
							if (xhr.status === 200)
								alert('Email sent successfully!');
							else if (openInvoicePrintPopUpAfterBkgDly)
								window.close();
						};
						
						xhr.send(formData);
					});
				}
				
				hideLayer();
			}
		});	
}

function getFinancialYear() {
	let year = new Date().getFullYear();
	let startYear = (new Date().getMonth() + 1) <= 3 ? year - 1 : year;
	return (startYear % 100) + "-" + ((startYear + 1) % 100);
}

function addDaysToDueDate(dateStr, days) {
	const [day, month, year] = dateStr.split('/').map(Number);
	const date = new Date(year, month - 1, day);

	date.setDate(date.getDate() + days);

	const newDay = String(date.getDate()).padStart(2, '0');
	const newMonth = String(date.getMonth() + 1).padStart(2, '0');
	const newYear = date.getFullYear();

	return `${newDay}/${newMonth}/${newYear}`;
}
