var QR_CODE_USING_CONSIGNMENT = 1;
var QR_CODE_USING_WAYBILL_NUMBER = 2;
var zerosReg = /[1-9]/g;
var isQRPrintOnPopUpSelection = false;
var whitespace = /\S/;
var commaSepratedArticleType = '';
var PSR_BHILWARA_BRANCH_ID = 48364;
var PACKING_TYPE_PACKET = 342;
var PACKING_TYPE_LETTER = 335;
var PACKING_TYPE_LIFFAFA = 336;
var printQRCodeOnLimit = false;
var BOOKING_COMMISSION = 171;

define(['/ivcargo/resources/js/barcode/qrcode/qrcode.js'
]
	, function(QRCodeJS) {
		'use strict';// this basically give strictness to this specific js
		return {
			getConfiguration: function(lrPrintType, configuration, isPdfExportAllow, billSelectionId, isSundryBooking) {
				if (configuration.differentLRPrintForExportPdf && isPdfExportAllow)
					return '/ivcargo/template/lrprint/' + configuration.lrPdfType + '.html';
				else if (configuration.billSelectionWiseLrPrint && billSelectionId > 1)
					return '/ivcargo/template/lrprint/' + lrPrintType + '_2.html';
				else if (isSundryBooking)
					return '/ivcargo/template/lrprint/' + lrPrintType + '_1.html';
				else {
					let isPreview = new URLSearchParams(window.location.search).get("isPreview") === "true";
					if (isPreview) lrPrintType = `${lrPrintType}_preview`;
					return '/ivcargo/template/lrprint/' + lrPrintType + '.html';
				}
			}, getFilePathForLabel: function() {
				return '/ivcargo/resources/js/module/print/lrprint/lrprintfilepath.js';
			}, setHeaderDetails: function(responseOut) {
				var accountGroupObj = responseOut.PrintHeaderModel;
				
				if(responseOut.billSelectionId == BOOKING_WITH_BILL) {
					$('.headertableforssts').removeClass('hide')
					$('.tableBodyforssts').addClass('marginAuto')
					$('.tableBodyforssts').removeClass('tableposition')
					$('.showHeaderInWithoutBill').hide()
					$('.withoutBillTable').remove()

				}

				if (responseOut.transporterNameId > 0 && responseOut.transporterName != undefined)
					$("*[data-account='name']").html(responseOut.transporterName);
				else
					$("*[data-account='name']").html(accountGroupObj.accountGroupName);

				$("*[data-account='branch']").html(accountGroupObj.branchName);
				
				if (responseOut.isAgentBranch) {
					$("*[data-accountajtc='name']").html("<font face='Courier'>" + accountGroupObj.accountGroupName + "</font>");
					$("*[data-accountajtc='ownerName']").html(accountGroupObj.ownerAccountGroupName);
					$("*[data-accountDolphin='name']").html(responseOut.srcBranchDisplayName);
					$("*[data-accountDispalyName='name']").html(responseOut.srcBranchDisplayName);
					$(".branchNameHide").hide();
				} else {
					$("*[data-accountajtc='name']").html("<font face='BremenFonts'>" + accountGroupObj.accountGroupName + "</font>");
					$("*[data-accountajtc='ownerName']").html('&nbsp;');
					$("*[data-accountDolphin='name']").html("DOLPHIN TRAVEL HOUSE");
					$("*[data-accountDispalyName='name']").html(accountGroupObj.accountGroupName);
					$(".DispalyNameShow").show();
					$(".displayNameHide").hide();
				}
				$("*[data-account='displayName']").html(responseOut.PrintHeaderModel.branchDisplayName);
				$("*[data-account='GroupPhoneNo']").html(accountGroupObj.accountGroupPhoneNo);
				$("*[data-account='companyWebsite']").html(accountGroupObj.companyWebsite);
				$("*[data-account='address']").html(accountGroupObj.branchAddress + ". ");
				$("*[data-account='branchaddress']").html(accountGroupObj.branchAddress);
				$("*[data-account='number']").html(accountGroupObj.branchContactDetailPhoneNumber);
				$("*[data-account='number2']").html(accountGroupObj.branchContactDetailPhoneNumber2);
				
				$("*[data-account='phNumberForSharma']").html(accountGroupObj.branchContactDetailPhoneNumber + '-' + accountGroupObj.branchContactDetailPhoneNumber2 + '-' + accountGroupObj.branchContactDetailMobileNumber);
				$("*[data-account='cityName']").html(accountGroupObj.cityName);
				$("*[data-account='branchAddressPincode']").html(accountGroupObj.branchAddressPincode);
				
				if(responseOut.SourceBranchPinCode != undefined &&	responseOut.SourceBranchPinCode != null )
					$("*[data-account='branchAddressWithPincode']").html(accountGroupObj.branchAddress +' ' + responseOut.SourceBranchPinCode);
				else if(accountGroupObj.branchAddressPincode != undefined && accountGroupObj.branchAddressPincode != null)
					$("*[data-account='branchAddressWithPincode']").html(accountGroupObj.branchAddress +' ' + accountGroupObj.branchAddressPincode);
				else 
					$("*[data-account='branchAddressWithPincode']").html(accountGroupObj.branchAddress +' ' + ' ');
				  
				if (accountGroupObj.branchContactDetailPhoneNumber != undefined && accountGroupObj.branchContactDetailPhoneNumber != null)
					$("*[data-account='branchNumber']").html('(' + accountGroupObj.branchContactDetailPhoneNumber + ')');
				else
					$("*[data-account='branchNumber']").html('');

				if (accountGroupObj.branchContactDetailEmailAddress != undefined && accountGroupObj.branchContactDetailEmailAddress != null)
					$("*[data-account='emailId']").html(accountGroupObj.branchContactDetailEmailAddress);
				else
					$("*[data-account='emailId']").html('--');

				if (accountGroupObj.branchContactDetailMobileNumber != undefined && accountGroupObj.branchContactDetailMobileNumber != null && accountGroupObj.branchContactDetailMobileNumber != '0000000000')
					$("*[data-account='branchMobileNo']").html(accountGroupObj.branchContactDetailMobileNumber);
				else
					$("*[data-account='branchMobileNo']").html('--');

				if (accountGroupObj.branchContactDetailPhoneNumber != undefined && accountGroupObj.branchContactDetailPhoneNumber != null && accountGroupObj.branchContactDetailPhoneNumber != '0000000000')
					$("*[data-account='branchPhoneNo']").html(accountGroupObj.branchContactDetailPhoneNumber);
				else
					$("*[data-account='branchPhoneNo']").html('--');
					
				if (accountGroupObj.branchContactDetailPhoneNumber2 != undefined && accountGroupObj.branchContactDetailPhoneNumber2 != null && accountGroupObj.branchContactDetailPhoneNumber2 != '0000000000')
					$("*[data-account='branchPhoneNo2']").html(accountGroupObj.branchContactDetailPhoneNumber2);
				else
					$("*[data-account='branchPhoneNo2']").html('--');	

				if (accountGroupObj.branchContactDetailMobileNumber2 != undefined && accountGroupObj.branchContactDetailMobileNumber2 != null && accountGroupObj.branchContactDetailMobileNumber2 != '0000000000')
					$("*[data-account='branchMobileNo2']").html(accountGroupObj.branchContactDetailMobileNumber2);
				else
					$("*[data-account='branchMobileNo2']").html('--');

				if (accountGroupObj.branchId == PSR_BHILWARA_BRANCH_ID) {
					if (accountGroupObj.branchContactDetailMobileNumber != undefined && accountGroupObj.branchContactDetailMobileNumber2 != undefined)
						$("*[data-account='bhilwaraBranchMobileNo']").html(accountGroupObj.branchContactDetailMobileNumber + "," + accountGroupObj.branchContactDetailMobileNumber2);
					else if (accountGroupObj.branchContactDetailMobileNumber != undefined)
						$("*[data-account='bhilwaraBranchMobileNo']").html(accountGroupObj.branchContactDetailMobileNumber);
					else
						$("*[data-account='bhilwaraBranchMobileNo']").html(accountGroupObj.branchContactDetailMobileNumber2);
				}

				if (accountGroupObj.branchContactDetailMobileNumber != undefined && accountGroupObj.branchContactDetailMobileNumber != null && accountGroupObj.branchContactDetailMobileNumber2 != undefined && accountGroupObj.branchContactDetailMobileNumber2 != null)
					$("*[data-account='branchMobileNoBoth']").html(accountGroupObj.branchContactDetailMobileNumber + '/' + accountGroupObj.branchContactDetailMobileNumber2);
				else if (accountGroupObj.branchContactDetailMobileNumber != undefined && accountGroupObj.branchContactDetailMobileNumber != null && (accountGroupObj.branchContactDetailMobileNumber2 == undefined || accountGroupObj.branchContactDetailMobileNumber2 == null))
					$("*[data-account='branchMobileNoBoth']").html(accountGroupObj.branchContactDetailMobileNumber + '/--');
				else if ((accountGroupObj.branchContactDetailMobileNumber == undefined || accountGroupObj.branchContactDetailMobileNumber == null) && accountGroupObj.branchContactDetailMobileNumber2 != undefined && accountGroupObj.branchContactDetailMobileNumber2 != null)
					$("*[data-account='branchMobileNoBoth']").html('--/' + accountGroupObj.branchContactDetailMobileNumber2);
				else
					$("*[data-account='branchMobileNoBoth']").html('--');

				var branchContactDetailPhoneNumber = accountGroupObj.branchContactDetailPhoneNumber;
				var branchContactDetailMobileNumber = accountGroupObj.branchContactDetailMobileNumber;

				$("*[data-account='phoneAndMobieNumber']").html(branchContactDetailPhoneNumber + ',' + branchContactDetailMobileNumber);

				if (branchContactDetailPhoneNumber != undefined && branchContactDetailPhoneNumber != null
					&& branchContactDetailMobileNumber != undefined && branchContactDetailMobileNumber != null) {
					if (branchContactDetailPhoneNumber.includes(',')) {
						if (branchContactDetailPhoneNumber == branchContactDetailMobileNumber)
							$("*[data-account='phoneWithMobileNumber']").html(branchContactDetailPhoneNumber);
						else
							$("*[data-account='phoneWithMobileNumber']").html(branchContactDetailPhoneNumber + ', ' + branchContactDetailMobileNumber);
					} else
						$("*[data-account='phoneWithMobileNumber']").html(branchContactDetailPhoneNumber);
				} else if (branchContactDetailMobileNumber != undefined && branchContactDetailMobileNumber != null && (branchContactDetailPhoneNumber == undefined || branchContactDetailPhoneNumber == null))
					$("*[data-account='phoneWithMobileNumber']").html(branchContactDetailMobileNumber);
				else if (branchContactDetailPhoneNumber != undefined && branchContactDetailPhoneNumber != null)
					$("*[data-account='phoneWithMobileNumber']").html(branchContactDetailPhoneNumber);

				$("*[data-account='gstn']").html(accountGroupObj.branchGSTN);
				$("*[data-account='PanNumber']").html(accountGroupObj.branchPanNumber);

				var sourceSubRegionId = responseOut.sourceSubRegionId;
				var destinationRegionId = responseOut.destinationRegionId;

				/*
				 * 2880 (Subregion) - MUMBAI Bato
				 * 4308 (Subregion) - HYDERABAD Bato
				 * 770 (Region) - TAMUILNADU Bato
				 */

				/*
				if(sourceSubRegionId == 3840){
					$(".podrequired").addClass('hide');
					$(".risk").addClass('hide');
					$('.heightt').css('height','30px');
					$('.borderBottomRemove').css('border-bottom','0px');
					$('.widthh').css('width','31%');
					$(".fontWeightBold").addClass('font-weight','bold');
					
				}
				*/
				if ((sourceSubRegionId == 2880 || sourceSubRegionId == 4308) && destinationRegionId == 770)
					$("*[data-account='gstn']").html('27AMZPP5557A1ZI');

				if (accountGroupObj.branchGSTN != undefined && accountGroupObj.branchGSTN != null)
					$("*[data-account='gstnwithbrackets']").html('(' + accountGroupObj.branchGSTN + ')');

				if (sourceSubRegionId == 5557)// MUMBAI Subregion - CCI group
					$("*[data-selector='headerccigrp']").remove();
				else
					$("*[data-selector='headerccibranch']").remove();

				if (responseOut.wayBillDestinationBranchId != 18165)
					$(".NoteForAiroli").hide();
					
				if (destinationRegionId != 3161)
					$(".qrForBLPL").hide();	
					
					//Gowtham
				if(accountGroupObj.branchId == 37458)//Vijayawada Branch
					$(".duplicateMarkGowtham").hide();
				
				//ML (TAMILANADU REGION)
				if((responseOut.sourceRegionId == 2863 || responseOut.destinationRegionId == 2863) && (responseOut.wayBillTypeId == WAYBILL_TYPE_TO_PAY || responseOut.wayBillTypeId == WAYBILL_TYPE_CREDIT))
					$(".hideCharges").hide();
					
				if(responseOut.wayBillSourceSubregionId == 3728) {
					$(".logo").attr("src", "/ivcargo/images/Logo/270_3728.svg");							
					$("*[data-selector='termsAndCondition']").html('IT IS TAKEN INTO CONSIDERATION THAT YOU AGREED WITH ALL THE TERMS AND CONDITIONS MENTIONED OVERLEAF.-GST PAYABLE BY CONSIGNOR AND / OR CONSIGNEE.-SUNDAY IS WEEKLEY OFF.-OWNER RISK ONLY.');
				} else if(responseOut.wayBillSourceSubregionId == 3840) {
					$(".logo").attr("src", "/ivcargo/images/Logo/270_3840.svg");
					$("*[data-selector='termsAndCondition']").html('IT IS TAKEN INTO CONSIDERATION THAT YOU AGREED WITH ALL THE TERMS AND CONDITIONS MENTIONED OVERLEAF.-GST PAYABLE BY CONSIGNOR AND / OR CONSIGNEE.-SUNDAY IS WEEKLEY OFF.-OWNER RISK ONLY.');
				}
				
				let isPreview = new URLSearchParams(window.location.search).get("isPreview") === "true";
				if (!isPreview) { 
					setCompanyLogos(accountGroupObj.accountGroupId);
					setQrLogoSourceRegionWise(accountGroupObj.accountGroupId,responseOut.sourceRegionId);
					setQrSourceRegionAndSubRegionWise(accountGroupObj.accountGroupId,responseOut.sourceRegionId,responseOut.sourceSubRegionId);
					}
					
				const isLmtAccount = accountGroupObj.accountGroupId == ACCOUNT_GROUP_ID_LMT;

                    const shouldKeepQrDiv = responseOut.wayBillTypeId == WAYBILL_TYPE_PAID ||
                      (
                        [WAYBILL_TYPE_TO_PAY, WAYBILL_TYPE_CREDIT].includes(responseOut.wayBillTypeId) &&
                        responseOut.deliveryTo == DELIVERY_TO_DOOR_ID
                      );
                    
                    if (!(isLmtAccount && shouldKeepQrDiv)) {
                      $('.QrSourceRegionAndSubRegionWiseDiv').html('');
                    }
				var config = responseOut.configuration;
				
				if(config.showCompanyLogo){
					$(".companyLogo").removeClass('hide')
				}
				if(accountGroupObj.accountGroupId == MAHINDRA_GROUP)
				this.updateImagesByDivision(responseOut.divisionId);
				
			}, setConsignorname: function(responseOut) {
				var config = responseOut.configuration;
				var consigneeGSTN = responseOut.consigneeGstn;
				var consignorGSTN = responseOut.consignorGstn;
				var consignorName = responseOut.consignorName;
				var consigneeName = responseOut.consigneeName;
				var consignorAddress = responseOut.consignorAddress;
				var consigneeAddress = responseOut.consigneeAddress;
				var consignorPan = responseOut.consignorPan;
				var consigneePan = responseOut.consigneePan;
				var billingPartyPan = responseOut.billingPartyPan;
				var billingPartyName = responseOut.billingPartyName;
				var consigneeEmail = responseOut.consigneeEmail;
				var consignorEmail = responseOut.consignorEmail;
				var consigneePhoneNumber = responseOut.consigneePhoneNumber;
				consignorName = consignorName.toUpperCase();
				consigneeName = consigneeName.toUpperCase();

				if (responseOut.wayBillIsManual) {
					$("#batoLRPrintTable_2").hide();
					$("#batoLRPrintTable_3").hide();
				}
				
				if(responseOut.wayBillTypeId == WAYBILL_TYPE_PAID)
					$("*[data-lr='billingPartyName']").html(consignorName);
				else if(responseOut.wayBillTypeId == WAYBILL_TYPE_TO_PAY)
					$("*[data-lr='billingPartyName']").html(consigneeName);
				else if(responseOut.wayBillTypeId == WAYBILL_TYPE_CREDIT)
					$("*[data-lr='billingPartyName']").html(billingPartyName);
				else
					$("*[data-lr='billingPartyName']").html(" ");

				if (responseOut.wayBillTypeId == WAYBILL_TYPE_PAID) {
					$("*[data-lr='billingPartyNameForInvoicePrint']").html(consignorName);
					$("*[data-lr='billingPartyAddressForInvoicePrint']").html(consgneeAdd);
					$("*[data-lr='billingPartyGstnForInvoicePrint']").html(consignorGSTN);

					if (consignorPan != undefined)
						$("*[data-lr='billingPartyPanNumberForInvoicePrint']").html(consignorPan.toUpperCase());
				} else if (responseOut.wayBillTypeId == WAYBILL_TYPE_TO_PAY) {
					$("*[data-lr='billingPartyNameForInvoicePrint']").html(consigneeName);
					$("*[data-lr='billingPartyAddressForInvoicePrint']").html(consgneeAdd);
					$("*[data-lr='billingPartyGstnForInvoicePrint']").html(consigneeGSTN);

					if (consigneePan != undefined)
						$("*[data-lr='billingPartyPanNumberForInvoicePrint']").html(consigneePan.toUpperCase());
				}

				if (config.consignorNameSubstringLength > 0 && consignorName.length > config.consignorNameSubstringLength) {
					var consignorNameWithSub = consignorName.substring(0, config.consignorNameSubstringLength);
					$("*[data-consignor='name']").html(consignorNameWithSub + '..');
					$("*[data-consignor='customnameconsignor']").html(consignorNameWithSub + ' ');
					$("*[data-consignor='nameSubString']").html(consignorNameWithSub + '..');
					$("*[data-consignor='nameWithSubString']").html(consignorNameWithSub + ' ');
				} else {
					$("*[data-consignor='name']").html(consignorName);
					$("*[data-consignor='nameLowerCase']").html(consignorName.replace("( TBB )", " ").toLowerCase());
					$("*[data-consignor='customnameconsignor']").html(consignorName);
					$("*[data-consignor='nameSubString']").html(consignorName);
					$("*[data-consignor='nameWithSubString']").html(consignorName);
				}

				if (consignorName.length > 15) {
					$(".consignorName").removeClass('Font15Size')
					$(".consignorName").addClass('font11px')
				}

				if (consignorAddress != undefined) {
					var consgneeAdd = consignorAddress;

					if (config.consignorAddressSubstringLength > 0)
						consgneeAdd = consignorAddress.substring(0, config.consignorAddressSubstringLength);

					$("*[data-consignor='consignorAddress']").html(consignorAddress);
					$("*[data-consignor='consignorAddressForSRES']").html(consignorAddress.substring(0, 42));
					$("*[data-consignor='address']").html(consgneeAdd);
					$("*[data-consignor='addressLowerCase']").html(consgneeAdd.toLowerCase());
					$("*[data-consignor='address1']").html(consgneeAdd + '..');
					$("*[data-consignor='customconsignoraddress']").html(consgneeAdd + '..');
					$("*[data-consignor='customconsignoraddress1']").html(consgneeAdd + '..');
					$("*[data-consignor='consignorNameWithAddress']").html(consignorName + '--' + consgneeAdd + '..');
				} else
					$("*[data-consignor='consignorNameWithAddress']").html(consignorName);

				if (zerosReg.test(responseOut.consignorPhn)) {
					var customerDetailsphoneNumber = responseOut.consignorPhn;
					
					if(config.showMobileNumberWithAsterisk) {
						$("*[data-consignor='number']").html(customerDetailsphoneNumber.substr(0, 1) + "******" + customerDetailsphoneNumber.substr(7, 10));
						$("*[data-consignor='numberhide']").html(customerDetailsphoneNumber.substr(0, 1) + "******" + customerDetailsphoneNumber.substr(7, 10));
						$("*[data-consignor='numberhide1']").html(customerDetailsphoneNumber.substr(0, 2) + "******" + customerDetailsphoneNumber.substr(8, 10));
						$("*[data-consignor='numberhide2']").html(customerDetailsphoneNumber.substr(0, 2) + "xxxxxxxx");
						$("*[data-consignor='numberhide3']").html("xxxxxx" + customerDetailsphoneNumber.substr(6, 10) );
						$("*[data-consignor='numberhide4']").html("******" + customerDetailsphoneNumber.substr(6, 10) );
					} else {
						$("*[data-consignor='number']").html(customerDetailsphoneNumber);
						$("*[data-consignor='numberhide']").html(customerDetailsphoneNumber);
						$("*[data-consignor='numberhide1']").html(customerDetailsphoneNumber);
						$("*[data-consignor='numberhide2']").html(customerDetailsphoneNumber);
						$("*[data-consignor='numberhide3']").html(customerDetailsphoneNumber);
						$("*[data-consignor='numberhide4']").html("******" + customerDetailsphoneNumber.substr(6, 10) );
					}
					
					$("*[data-consignor='numberwithbracket']").html('(' + customerDetailsphoneNumber + ')');
				}

				$("*[data-consignor='consignorNumberSBTR']").html(responseOut.consignorPhn);

				$("*[data-consignorMobileWithGST='number']").html(responseOut.consignorPhn);

				if (consignorGSTN != undefined && consignorGSTN != null && consignorGSTN != '') {
					consignorGSTN = consignorGSTN.toUpperCase();
					$("*[data-consignor='gstn']").html(consignorGSTN);
					$("*[data-consignor='gstnWithBracket']").html('(GSTIN -&nbsp;' + consignorGSTN + ')');
					$("*[data-consignor='gstnForBatco']").html(consignorGSTN);
					$("*[data-consignor='gstnforPooja']").html(consignorGSTN);

					if (whitespace.test(consignorGSTN))
						$("*[data-consignorMobileWithGST='number']").html(responseOut.consignorPhn + '&nbsp;(GSTN -&nbsp;' + consignorGSTN + ')');
				} else {
					$("*[data-consignor='gstnWithBracket']").html('');
					$("*[data-consignor='gstnForBatco']").html('URD');
					$('.hideconsignegstskl').hide();
					$("*[data-consignor='gstnforPooja']").html('--');
				}

				$("*[data-consignor='tinNo']").html(responseOut.consignorTin);
				$("*[data-consignor='consignorPartyMasterAddress']").html(responseOut.consignorPartyMasterAddress);

				if (consignorPan != undefined)
					$("*[data-consignor='panNumber']").html(consignorPan.toUpperCase());

				if (billingPartyPan != undefined)
					$("*[data-consignor='panNumber']").html(billingPartyPan.toUpperCase());

				$("*[data-consignor='pincode']").html(responseOut.consignorPin);
				$("*[data-consignor='pincodeNoZero']").html(responseOut.consignorPin === 0 ? "" : responseOut.consignorPin);

				if (config.consigneeNameSubstringLength > 0 && consigneeName.length > config.consigneeNameSubstringLength) {
					var consigneeNameWithSub = consigneeName.substring(0, config.consigneeNameSubstringLength);
					$("*[data-consignee='name']").html(consigneeNameWithSub + '..');
					$("*[data-consignee='nameWithSubString']").html(consigneeNameWithSub + ' ');
					$("*[data-consignee='customnameconsignee']").html(consigneeNameWithSub + ' ');
					$("*[data-consignee='nameSubString']").html(consigneeNameWithSub + '..');
				} else {
					$("*[data-consignee='name']").html(consigneeName);
					$("*[data-consignee='nameLowerCase']").html(consigneeName.replace("( TBB )", " ").toLowerCase());
					$("*[data-consignee='nameWithSubString']").html(consigneeName);
					$("*[data-consignee='customnameconsignee']").html(consigneeName);
					$("*[data-consignee='nameSubString']").html(consigneeName);
				}

				if (consigneeName.length > 15) {
					$(".consigneeName").removeClass('Font15Size');
					$(".consigneeName").addClass('font11px');
				}

				if (consigneeName == 'SELF')
					$("*[data-consignee='consigneeName']").html(consigneeName + " / " + responseOut.invoiceNumber);
				else
					$("*[data-consignee='consigneeName']").html(consigneeName);

				if (consigneeAddress != undefined) {
					var consgneeAdd = consigneeAddress;

					if (config.consigneeAddressSubstringLength > 0)
						consgneeAdd = consigneeAddress.substring(0, config.consigneeAddressSubstringLength);

					$("*[data-consignee='address']").html(consgneeAdd);
					$("*[data-consignee='addressLowerCase']").html(consgneeAdd.toLowerCase());
					$("*[data-consignee='address1']").html(consgneeAdd + '..');
					$("*[data-consignee='customconsigneeaddress']").html(consgneeAdd + '..');
					$("*[data-consignee='customconsigneeaddress1']").html(consgneeAdd + '..');
					$("*[data-consignee='consigneeNameWithAddress']").html(consigneeName + '--' + consgneeAdd + '..');
					
					$("*[data-consignee='consigneeAddress']").html(consigneeAddress);
					$("*[data-consignee='consigneeAddressForSRES']").html(consigneeAddress.substring(0, 42));
					
				} else
					$("*[data-consignee='consigneeNameWithAddress']").html(consigneeName);

				if (zerosReg.test(responseOut.consigneePhn)) {
					var customerDetailsphoneNumber = responseOut.consigneePhn;
					
					if(config.showMobileNumberWithAsterisk) {
						$("*[data-consignee='number']").html(customerDetailsphoneNumber.substr(0, 1) + "******" + customerDetailsphoneNumber.substr(7, 10));
						$("*[data-consignee='numberhide']").html(customerDetailsphoneNumber.substr(0, 1) + "******" + customerDetailsphoneNumber.substr(7, 10));
						$("*[data-consignee='numberhide1']").html(customerDetailsphoneNumber.substr(0, 2) + "******" + customerDetailsphoneNumber.substr(8, 10));
						$("*[data-consignee='numberhide2']").html(customerDetailsphoneNumber.substr(0, 2) + "xxxxxxxx");
						$("*[data-consignee='numberhide3']").html("xxxxxx" + customerDetailsphoneNumber.substr(6, 10) );
						$("*[data-consignee='numberhide4']").html("******" + customerDetailsphoneNumber.substr(6, 10) );

					} else {
						$("*[data-consignee='number']").html(customerDetailsphoneNumber);
						$("*[data-consignee='numberhide']").html(customerDetailsphoneNumber);
						$("*[data-consignee='numberhide1']").html(customerDetailsphoneNumber);
						$("*[data-consignee='numberhide2']").html(customerDetailsphoneNumber);
						$("*[data-consignee='numberhide3']").html(customerDetailsphoneNumber);
						$("*[data-consignee='numberhide4']").html("******" + customerDetailsphoneNumber.substr(6, 10) );
					}
					
					$("*[data-consignee='numberwithbracket']").html('(' + customerDetailsphoneNumber + ')');
				}

				$("*[data-consignee='consigneeNumberSBTR']").html(responseOut.consigneePhn);

				$("*[data-consignee='tinNo']").html(responseOut.consigneeTin);
				$("*[data-consigneeMobileWithGST='number']").html(responseOut.consigneePhn);
				$("*[data-consignee='consigneePartyMasterAddress']").html(responseOut.consigneePartyMasterAddress);

				if (consigneePan != undefined)
					$("*[data-consignee='panNumber']").html(consigneePan.toUpperCase());

				if (consigneeGSTN != undefined && consigneeGSTN != null && consigneeGSTN != '') {
					consigneeGSTN = consigneeGSTN.toUpperCase();
					$("*[data-consignee='gstn']").html(consigneeGSTN);
					$("*[data-consignee='gstnWithBracket']").html('(GSTIN -&nbsp;' + consigneeGSTN + ')');
					$("*[data-consignee='gstnforBatco']").html(consigneeGSTN);
					$("*[data-consignee='gstnforPooja']").html(consigneeGSTN);

					if (whitespace.test(consigneeGSTN))
						$("*[data-consigneeMobileWithGST='number']").html(responseOut.consigneePhn + '&nbsp;(GSTN -&nbsp;' + consigneeGSTN + ')');
				} else {
					$("*[data-consignee='gstnWithBracket']").html('');
					$("*[data-consignee='gstnforBatco']").html('URD');
					$('.hideConsigneegstnsks').hide();
					$("*[data-consignee='gstnforPooja']").html('--');
				}

				if (responseOut.deliveryTo == DELIVERY_TO_BRANCH_ID && responseOut.wayBillDestinationBranchAddress != undefined) {
					$("*[data-lr='lrDestinationAddressforgodown']").html(responseOut.wayBillDestinationBranchAddress.replace(/ /g, "&nbsp;")); // used for Alpesh Roadways
					//used for SRST
					var phn =  responseOut.wayBillDestinationBranchPhoneNumber != undefined ? responseOut.wayBillDestinationBranchPhoneNumber : '--' 
					var addAndPhn = responseOut.wayBillDestinationBranchAddress + " Phone No.: " + "(" + phn + ")"
					$("*[data-lr='deliveryAddwithNumberSRST']").html(addAndPhn);
					$("*[data-lr='deliveryAddwithNumberNCM']").html(addAndPhn); 
				}
					 
				if (responseOut.deliveryTo == DELIVERY_TO_DOOR_ID) {
					$("*[data-consignee='addressforddly']").html(consigneeAddress); //used for Alpesh Roadways
					$(".showAdditionalremarkSRST").show();
					$("*[data-lr='deliveryAddwithNumberNCM']").html(consigneeAddress + " Phone No. : "+"(" + responseOut.consigneePhn + ")");
				} else
					$(".showAdditionalremarkSRST").hide();

				if (config.isRateConfigCondition) {
					if (responseOut.consignorRateConfigured)
						$("*[data-consignor='name']").html($("*[data-consignor='name']").html() + " * ");

					if (responseOut.consigneeRateConfigured)
						$("*[data-consignee='name']").html($("*[data-consignee='name']").html() + " * ");
				}

				if (consigneeEmail != undefined && consigneeEmail != null && consigneeEmail != '')
					$("*[data-consignee='consigneemail']").html(consigneeEmail);

				if (consignorEmail != undefined && consignorEmail != null && consignorEmail != '')
					$("*[data-consignor='consignormail']").html(consignorEmail);

				if (consigneePhoneNumber != undefined)
					$("*[data-consignee='consigneePhoneNumber']").html(consigneePhoneNumber);

				$("*[data-consignee='pincode']").html(responseOut.consigneePin);
				$("*[data-consignee='pincodeNoZero']").html(responseOut.consigneePin === 0 ? "" : responseOut.consigneePin);
			}, setLrDetails: function(responseOut) {
				var config										= responseOut.configuration;
				var formTypeDetail								= responseOut.formTypeWithNumber;
				var imagObject									= localStorage.getItem("imageObjet");
				var doNotShowSourceSubreion						= responseOut.doNotShowSourceSubreion;
				var doNotShowDestinationSubreion				= responseOut.doNotShowDestinationSubreion;
				var wayBillSourceBranchName						= responseOut.wayBillSourceBranchName;
				var wayBillDestinationBranchName				= responseOut.wayBillDestinationBranchName;
				var wayBillSourceSubregionName					= responseOut.wayBillSourceSubregionName;
				var wayBillDestinationSubregionName				= responseOut.wayBillDestinationSubregionName;
				var wayBillSourceCityName						= responseOut.wayBillSourceCityName;
				var wayBillDestinationCityName					= responseOut.wayBillDestinationCityName;
				var wayBillDestinationBranchMobileNumber		= responseOut.wayBillDestinationBranchMobileNumber;
				var wayBillDestinationBranchMobileNumber2		= responseOut.wayBillDestinationBranchMobileNumber2;
				var wayBillSourceBranchPhoneNumber				= responseOut.wayBillSourceBranchPhoneNumber;
				var wayBillSourceBranchPhoneNumber2				= responseOut.wayBillSourceBranchPhoneNumber2;
				var wayBillSourceBranchMobileNumber				= responseOut.wayBillSourceBranchMobileNumber;
				var wayBillSourceBranchMobileNumber2			= responseOut.wayBillSourceBranchMobileNumber2;
				let wayBillDestinationPhoneNumber2				= responseOut.wayBillDestinationPhoneNumber2;
				var wayBillTypeId								= responseOut.wayBillTypeId;
				var wayBillRemark								= responseOut.wayBillRemark;
				var consignmentSummaryDeliveryToAddress			= responseOut.consignmentSummaryDeliveryToAddress;
				var deliveryToString							= responseOut.deliveryToString;
				var consignmentSummaryDeliveryToContact			= responseOut.consignmentSummaryDeliveryToContact;
				let wayBillDestinationBranchPhoneNumber			= responseOut.wayBillDestinationBranchPhoneNumber;
				var eWayBillDateTimeString						= responseOut.eWayBillDateTimeString;
				var bookingCharges								= responseOut.waybillBookingChargesList;
				var consignmentSummaryDeliveryToAddressPinCode	= responseOut.consignmentSummaryDeliveryToAddressPinCode;
				var wayBillSourceSubregionCode					= responseOut.wayBillSourceSubregionCode;
				var lrInvoiceDetail								= responseOut.invoiceDetailsArr;
				var consignmentSummaryQuantity1					= responseOut.consignmentSummaryQuantity
				let isInsuranceGenerated						= responseOut.isInsuranceGenerated;
				let divisionId									= responseOut.divisionId || 0;
				
				if(isInsuranceGenerated)
					$('#insuranceDetails').empty();
				
				let totalDeclaredValue = 0;
				let totalQuantity = 0;
				
				let invoiceNumberLength 	= $('.multiple_invoice_details tr').length;
				let invoiceNumberArray		= [];
				let invoiceDateArray		= [];
				let partNumberArray			= [];
				let insuranceDetails		= $('#insuranceDetails');
				
				if(isInsuranceGenerated) {
					let tr 	= $("<tr>");
					let td	= $("<td>");
					
					td.append('<b>Insurance Policy Details:</b>');
					
					tr.append(td);
					insuranceDetails.append(tr);
				}
				
				for (let index in lrInvoiceDetail) {
					let pos = Number(index) + 1;
					let invoiceNumber	= lrInvoiceDetail[index].invoiceNumber;
					let invoiceDate		= lrInvoiceDetail[index].invoiceDate;
					let declaredValue	= lrInvoiceDetail[index].declaredValue;
					let description		= lrInvoiceDetail[index].description;
					let partNumber		= lrInvoiceDetail[index].partNumber;
					let quantity		= lrInvoiceDetail[index].quantity;

					$("[data-lr='multipleInvoiceNumber']").append($("<table>").html(invoiceNumber));
					$("[data-lr='multipleInvoiceDate']").append($("<table>").html(invoiceDate));
					$("[data-lr='multipleDeclaredValue']").append($("<table>").addClass("textAlignCenter").html(declaredValue));
					$("[data-lr='multipleDescription']").append($("<table>").html(description));
					$("[data-lr='multiplePartNumber']").append($("<table>").html(partNumber));
					$("[data-lr='multipleQuantity']").append($("<table>").html(quantity));
					
					if(invoiceNumberLength > 0) {
						if(pos > invoiceNumberLength) {
							invoiceNumberArray.push(invoiceNumber);
							invoiceDateArray.push(invoiceDate);
							partNumberArray.push(partNumber);
							continue;
						}
					} else {
						invoiceNumberArray.push(invoiceNumber);
						partNumberArray.push(partNumber);
						invoiceDateArray.push(invoiceDate)
					}
					
					totalDeclaredValue 	+= declaredValue;
					totalQuantity		+= quantity;
					
					$("*[data-invoiceNumber='" + pos + "']").html(invoiceNumber);
					$("*[data-invoiceDate='" + pos + "']").html(invoiceDate);
					$("*[data-delclarevalue='" + pos + "']").html(declaredValue);
					$("*[data-quantity='" + pos + "']").html(quantity);
					$("*[data-partNo='" + pos + "']").html(partNumber);
					
					if(isInsuranceGenerated) {
						let tr 	= $("<tr>");
						let td	= $("<td>");
						
						td.append('<b>Policy No. </b>' + lrInvoiceDetail[index].policyNumber + ', <b>Date: </b>' + lrInvoiceDetail[index].policyDateStr + ', <b>Amount:</b> ' + lrInvoiceDetail[index].premiumAmount);
						tr.append(td);
						
						insuranceDetails.append(tr);
					}
					
				}
				
				$("[data-lr='multipleInvoiceNumberinSpan']").append(invoiceNumberArray.join(', '));
				$("[data-lr='multiplePartNumberinSpan']").append(partNumberArray.join(', '));
				$("[data-lr='totalDeclaredValueOfInv']").html(totalDeclaredValue);
				$("[data-lr='totalQuantityOfInv']").html(totalQuantity);							
				$("[data-lr='multipleInvoiceDateinSpan']").append(invoiceDateArray.join(', '));

				
				let limitedMultipleInvoiceDetails = Number(config.printLimitedMultipleInvoiceDetails);
				
				if (limitedMultipleInvoiceDetails > 0) {
					for (let index in lrInvoiceDetail) {
						let count = Number(index) + 1;

						if (count > limitedMultipleInvoiceDetails)
							break;

						$("[data-lr='multipleInvoiceNumberLimit']").append($("<table>").html(lrInvoiceDetail[index].invoiceNumber));
						$("[data-lr='multipleInvoiceDateLimit']").append($("<table>").html(lrInvoiceDetail[index].invoiceDate));
						$("[data-lr='multipleDeclaredValueLimit']").append($("<table>").addClass("textAlignCenter").html(lrInvoiceDetail[index].declaredValue));
						$("[data-lr='multipleDescriptionLimit']").append($("<table>").html(lrInvoiceDetail[index].description));
						$("[data-lr='multiplePartNumberLimit']").append($("<table>").html(lrInvoiceDetail[index].partNumber));
						$("[data-lr='multipleQuantityLimit']").append($("<table>").html(lrInvoiceDetail[index].quantity));
					}
				}
				
				$("[data-lr='consignmentSummaryQuantity1']").append(consignmentSummaryQuantity1);

				var descriptions = [];

				for (var index in lrInvoiceDetail) {
					descriptions.push(lrInvoiceDetail[index].declaredValue);
				}

				$("[data-lr='multipleDeclaredVal']").html(descriptions.join(', '));

				//START :: Advance and Balance Calculation for Abbas LR Print - Ravi Prajapati
				var bookingTotal = responseOut.bookingTotal;
				var receivedAmount = responseOut.bookingReceived;

				if (config.showHideTextForSpecificBranches) {
					var dataHideBranchIds = config.branchIdsToHideSpecificData;
					var hideBranchArray = dataHideBranchIds.split(",");
					var hideBranchData = isValueExistInArray(hideBranchArray, responseOut.wayBillSourceBranchId);


					if (hideBranchData) {
						$(".hideGrandTotalData").addClass('hide');
					}
					
					if (responseOut.wayBillDestinationBranchId == 29082)
						$(".indoreOfficeData").show();
					else
						$(".indoreOfficeData").hide();

					if (responseOut.wayBillDestinationBranchId == 37974)
						$(".rajmohallaOfficeData").show();
					else
						$(".rajmohallaOfficeData").hide();

					if (responseOut.wayBillDestinationBranchId == 46903 || responseOut.wayBillDestinationBranchId == 46833) {
						$(".bangloreNTGS_554").hide();
						$(".bangloreNTGSHardCode_554").show();
					} else {
						$(".bangloreNTGS_554").show();
						$(".bangloreNTGSHardCode_554").hide();
					}

				}	

				if (wayBillTypeId == WAYBILL_TYPE_FOC)
					$(".showQRForAR").hide();
				else
					$(".showQRForAR").show();

				if (responseOut.wayBillSourceBranchId == 31691) {
					$(".rectusShowHardCoded").show();
					$(".rectusHideHardCoded").hide();
				} else {
					$(".rectusShowHardCoded").hide();
					$(".rectusHideHardCoded").show();
				}
				
				if (responseOut.wayBillDestinationBranchId != 50222)
					$(".jabbarDestinationMsg").hide();
				
				if (responseOut.photoTransactionPhoto != undefined) {
					var photoTransactionPhoto = responseOut.photoTransactionPhoto;

					$("#imageId").attr('src', photoTransactionPhoto);
					$("#imageId1").attr('src', photoTransactionPhoto);
				} else if (imagObject != undefined) {
					$("#imageId").attr('src', imagObject);
					$("#imageId1").attr('src', imagObject);
				}

				if (wayBillTypeId == WAYBILL_TYPE_TO_PAY) {
					$(".showQRForRenuka").show();
					$(".hideSelectorInTopayForSAL").hide(); // FOR SAL
					$(".showInToPayLr").removeClass("hide")
					$(".hideThirdCopy").hide(); //For NAVIN
				} else
					$(".showQRForRenuka").hide();

				if (wayBillTypeId == WAYBILL_TYPE_PAID) {
					$(".showDriverCopyForPaidLr").removeClass('hide');
					$(".hideChargesforSKM").hide();
					$(".hideSelectorForPaidAndTBBForSAL").hide(); // FOR SAL
					$(".showInToPaidLr").removeClass("hide")
					$(".hideThirdCopy").hide(); //For NAVIN
				}
				
				if (wayBillTypeId == WAYBILL_TYPE_CREDIT) {
					$(".showTBBLable").html('TBB');
					$(".hideChargesforSKM").hide();
					$(".hideRateForPatil").hide();
					$(".hideSelectorForPaidAndTBBForSAL").hide(); // FOR SAL
					$(".showInToTbbLr").removeClass("hide")
					$(".hideTermsCondition").hide(); //For NAVIN
				}
				
				//for TARASVIN
				if (wayBillTypeId === WAYBILL_TYPE_CREDIT && responseOut.executiveType !== EXECUTIVE_TYPE_GROUPADMIN)
					$(".TarasvinHideTbbCharge2copy").hide();
	
				//for BTLC BhiwandiBranch 
				if(responseOut.wayBillSourceBranchId == 57970)
					$(".weighthideforBTLCBhiwandiBranch").hide();

				//for TARASVINWork
				if (wayBillTypeId == WAYBILL_TYPE_CREDIT && responseOut.executiveType == EXECUTIVE_TYPE_GROUPADMIN && responseOut.wayBillSourceBranchId == responseOut.executiveBranchId) {
					$(".tbbChargeHide1tarasvin").show();
					$(".tbbChargeHide2tarasvin").show();
				} else if( wayBillTypeId == WAYBILL_TYPE_CREDIT && responseOut.executiveType != EXECUTIVE_TYPE_GROUPADMIN && responseOut.wayBillSourceBranchId != responseOut.executiveBranchId) {
					$(".tbbChargeHide1tarasvin").hide();
					$(".tbbChargeHide2tarasvin").hide();
				} else if( wayBillTypeId == WAYBILL_TYPE_CREDIT && responseOut.executiveType != EXECUTIVE_TYPE_GROUPADMIN)
					$(".tbbChargeHidetarasvin").hide();

				if (responseOut.destinationBranchId == 14943)//TEEN IMLI - RCC
					$(".destBranch").show();//display Delivery after 10 AM

				if (responseOut.lrDestinationBranchCode != undefined)
					$("*[data-lr='lrDestinationBranchCode']").html(responseOut.lrDestinationBranchCode);

				if (responseOut.lrDestinationBranchGstn != undefined)
					$("*[data-lr='lrDestBranchGstn']").html(responseOut.lrDestinationBranchGstn);

				if (responseOut.sourceBranchEmailAddress != undefined)
					$("*[data-lr='lrSourceBranchEmailAddress']").html(responseOut.sourceBranchEmailAddress);

				if (responseOut.sourceBranchCode != undefined)
					$("*[data-lr='lrSourceBranchCode']").html(responseOut.sourceBranchCode);

				if (responseOut.sourceBranchPanNumber != undefined)
					$("*[data-lr='lrSourceBranchPanNumber']").html(responseOut.sourceBranchPanNumber);

				if (responseOut.sourceBranchGSTN != undefined) {
					$("*[data-lr='lrSrcBranchGstn']").html(responseOut.sourceBranchGSTN);
					$("*[data-lr='lrSrcBranchGstnkcpl']").html(responseOut.sourceBranchGSTN);
				}

				if ((config.allowRegionWiseBookingPage) && ((consigneeGSTN != undefined && consigneeGSTN != null && consigneeGSTN != '')
					|| (consignorGSTN != undefined && consignorGSTN != null && consignorGSTN != '')))
					$("*[data-lr='invoiceValueSelector']").html('Invoice Value:');
				else
					$("*[data-lr='invoiceValueSelector']").html('Dec Value:');

				$("*[data-lr='cctype']").html('--');
				$("*[data-lr='EWayBillNo']").html(' --');
				$("*[data-lr='hsnCode']").html(' --');
				$("*[data-lr='EWayBillNo']").html('');
				$("*[data-lr='EWayBillNoMinified']").html('');
				$("*[data-lr='ccAttached_442']").html('Remark:-');
				$("*[data-lr='eWayBillDateTime']").html(eWayBillDateTimeString);
				$("*[data-lr='packingTypeMasterName']").html(responseOut.packingTypeMasterName);
				$("*[data-lr='saidToContain']").html(responseOut.saidToContain);
				$("*[data-lr='sourcecityandbranch']").html(wayBillSourceCityName + '(' + wayBillSourceBranchName + ')');
				$("*[data-lr='destinationcityandbranch']").html(wayBillDestinationCityName + '(' + wayBillDestinationBranchName + ')');
				$("*[data-lr='distance']").html(responseOut.distance);

				if (responseOut['formTypesObj_' + CC_ATTACHED_FORM_ID] != undefined) {
					$("*[data-lr='cctype']").html('CC Attached');
					$("*[data-lr='ccAttached_201']").html('CC ATTACHED');
					$("*[data-lr='ccAttached_442']").html('CC ATTACHED :-');
					$('.ccAtchedCheckbox').prop('checked', true);
				}

				if (responseOut['formTypesObj_' + HSN_CODE] != undefined)
					$("*[data-lr='hsnCode']").html(responseOut['formTypesObj_' + HSN_CODE]);

				if (responseOut['formTypesObj_' + SAC_CODE] != undefined)
					$("*[data-lr='sacCode']").html(responseOut['formTypesObj_' + SAC_CODE]);

				if (responseOut['formTypesObj_' + E_WAYBILL_ID] != undefined) {
					$("*[data-lr='ewayBillPresent']").html('YES');
					var formNumber = responseOut['formTypesObj_' + E_WAYBILL_ID];

					$("*[data-lr='EWayBillNo_201']").html(formNumber);

					//var formNumberRow = formNumber.replaceAll(',', '<br>');
					var formNumberRow_270 = replaceSlash(formNumber,',',', ')
					
					var formNumberRow = formNumber.replace(/,/g, '<br>');

					$("*[data-lr='EWayBillNoInRow']").html(formNumberRow);
					$("*[data-lr='EWayBillNo']").html(formNumber);
					$("*[data-lr='EWayBillNo_270']").html(formNumberRow_270);
					$("[data-lr='EWayBillNo2']").html(formNumber);
					 
					let ewayBillArray = formNumber.split(',');
					
					if (ewayBillArray.length > 4 ) {
						let firstFourEWayBills = ewayBillArray.slice(0, 4).join(',');
						let secondFourEWayBills = ewayBillArray.slice(4, 9).join(',');
						$("[data-lr='EWayBillNo2']").html(firstFourEWayBills+","); 
						
						if(ewayBillArray.length > 9)
							$("[data-lr='EWayBillNo2']").append("<br>" + secondFourEWayBills +"...");
						else
							$("[data-lr='EWayBillNo2']").append("<br>" + secondFourEWayBills);
					}
						
					var ewaybillArr = formNumber.split(',');

					if (ewaybillArr.length > 1) {
						$("*[data-lr='EWayBillNoMinified']").html(ewaybillArr[0] + '.. and More');
						$("*[data-lr='EWayBillNoMinifiedacipl']").html(ewaybillArr[0]);
						$("*[data-lr='EWayBillNoMinifiedasapan']").html(ewaybillArr[0] + '.. Total = '+ ewaybillArr.length);
					} else {
						$("*[data-lr='EWayBillNoMinified']").html(formNumber);
						$("*[data-lr='EWayBillNoMinifiedacipl']").html(formNumber);
						$("*[data-lr='EWayBillNoMinifiedasapan']").html(formNumber);
					}
					
					if (ewaybillArr.length > 2) {
                        $("*[data-lr='EWayBillTwoWithTotalCount']").html(ewaybillArr[0] +', '+ ewaybillArr[1] + '.. Total = '+ ewaybillArr.length);
                        $("*[data-lr='ewayBillForVEC']").html(ewaybillArr[0] +', '+ ewaybillArr[1] + '....');
                    } else {
                        $("*[data-lr='EWayBillTwoWithTotalCount']").html(formNumber);
                        $("*[data-lr='ewayBillForVEC']").html(formNumber);
                     }
					
					if(ewaybillArr.length > 5)
						$("*[data-lr='EWayBillNoMinifiedForVTIPL']").html(ewaybillArr[0] +', '+ewaybillArr[1] +', '+ewaybillArr[2] +', '+ewaybillArr[3] +', '+ewaybillArr[4]);
					else
						$("*[data-lr='EWayBillNoMinifiedForVTIPL']").html(formNumberRow_270);
					
					if(ewaybillArr.length > 3){
						$("*[data-lr='EWayBillNoMinifiedForAKTS']").html(ewaybillArr[0] +', '+ewaybillArr[1] +', '+ewaybillArr[2]);
						$("*[data-lr='ewayBillForMgllp']").html(ewaybillArr[0] +', '+ewaybillArr[1] +', '+ewaybillArr[2] + ',.....');
					}else{
						$("*[data-lr='EWayBillNoMinifiedForAKTS']").html(formNumberRow_270);
						$("*[data-lr='ewayBillForMgllp']").html(formNumberRow_270);
					}
					
					var container = $('#ewaybill-container');
					var chunks = [];
						
					for (var i = 0; i < ewaybillArr.length; i += 5) {
						chunks.push(ewaybillArr.slice(i, i + 5).join(', '));
					}
						
					container.html(chunks.join('<br>'));

					if (config.hideFormTypeLevelIfEWaybill)
						$('.formType').hide();
				}else{
					$("*[data-lr='ewayBillPresent']").html('NO');
				}

				$("*[data-lr='chargeType']").html(responseOut.chargeTypeName);
				$("*[data-lr='categoryTypeName']").html(responseOut.categoryTypeName)
				
				if(responseOut.categoryTypeName == 'Manohar Roadlines' && responseOut.categoryTypeName != undefined)
					$("*[data-lr='gstnumberArts']").html("27AGEPT6713D2ZD")
				
				if(responseOut.categoryTypeName == 'Abhyudaya Road Transport Services' && responseOut.categoryTypeName != undefined)
					$("*[data-lr='gstnumberArts']").html("27ACPPT3964P2ZE")

				if (responseOut.termAndConditionValue)
					$("*[data-lr='termAndCondition']").html(responseOut.termAndConditionValue);
				else
					$("*[data-lr='termAndCondition']").html(config.termsAndConditions);

				if (config.ShowBankDetails) {
					$("*[data-lr='bankName']").html(config.ShowBankName);
					$("*[data-lr='IFSCCode']").html(config.ShowIFSCCode);
					$("*[data-lr='accountNumber']").html(config.ShowBankAccountNumber);
					$("*[data-lr='bankAddress']").html(config.ShowBankAccountBranchAddress);
				}
				
				//for SAPAN
				if (responseOut.chargeTypeId == CHARGETYPE_ID_QUANTITY) {
					$("*[data-lr='rateForSapan']").html(responseOut.articleRate);
				} else if (responseOut.chargeTypeId == CHARGETYPE_ID_WEIGHT) {
					$("*[data-lr='rateForSapan']").html(responseOut.weigthFreightRate);
					$("*[data-lr='weightRate']").html(responseOut.weigthFreightRate);
					$('.rateHide').hide();
				}
				
				if (responseOut.chargeTypeId == CHARGETYPE_ID_QUANTITY) {
					if (wayBillTypeId != WAYBILL_TYPE_CREDIT) {
						$("*[data-lr='rate']").html(responseOut.articleRate + '/Art');
						$("*[data-lr='rateConsignor']").html(responseOut.articleRate + '/Art');
						$("*[data-lr='rateConsignee']").html(responseOut.articleRate + '/Art');
					} else {
						$("*[data-lr='rate']").html(responseOut.articleRate);
						$("*[data-lr='rateConsignor']").html(responseOut.articleRate);
						$("*[data-lr='rateConsignee']").html(responseOut.articleRate);
					}
				} else if (responseOut.chargeTypeId == CHARGETYPE_ID_WEIGHT) {
					if (wayBillTypeId != WAYBILL_TYPE_CREDIT) {
						$("*[data-lr='rate']").html(responseOut.weigthFreightRate + '/Kg');
						$("*[data-lr='rateConsignor']").html(responseOut.weigthFreightRate + '/Kg');
						$("*[data-lr='rateConsignee']").html(responseOut.weigthFreightRate + '/Kg');
					} else {
						$("*[data-lr='rate']").html(responseOut.weigthFreightRate);
						$("*[data-lr='rateConsignor']").html(responseOut.weigthFreightRate);
						$("*[data-lr='rateConsignee']").html(responseOut.weigthFreightRate);
					}
				}

				if (responseOut.billingBranch != undefined)
					$("*[data-lr='billingBranch']").html('at ' + responseOut.billingBranch);

				$("*[data-lr='exBranchName']").html(responseOut.exBranchName);
				$("*[data-lr='bookingBranchName']").html(responseOut.bookingBranchName);
				$("*[data-lr='insuredBy']").html(responseOut.insuredBy);
				$("*[data-lr='pickupTypeName']").html(responseOut.pickupTypeName);

				if (config.showAdvanceAmountFromInvoicePaymentInLrPrint && wayBillTypeId == WAYBILL_TYPE_CREDIT) {
					if (responseOut.advanceAmount > 0) {
						$("*[data-lr='advanceAmount']").html(responseOut.advanceAmount);
						$("*[data-lr='grandTotalForRglpl']").html(Math.round(responseOut.bookingTotal - responseOut.advanceAmount));
					} else {
						$('.advanceAmountHide').hide();
						$("*[data-lr='grandTotalForRglpl']").html(Math.round(responseOut.bookingTotal));
					}
				} else {
					$("*[data-lr='grandTotalForRglpl']").html(Math.round(responseOut.bookingTotal));
					$('.advanceAmountHide').hide();
				}

				if (responseOut.riskAllocation == CARRIER_RISK) {
					$("*[data-lr='riskAllocationOwnerRisk']").html("NO");
					$("*[data-lr='riskAllocationCarrierRisk']").html("YES");
					$("*[data-lr='risk']").html(CARRIER_RISK_NAME);
				} else if (responseOut.riskAllocation == OWNER_RISK) {
					$("*[data-lr='riskAllocationOwnerRisk']").html("YES");
					$("*[data-lr='riskAllocationCarrierRisk']").html("NO");
					$("*[data-lr='risk']").html(OWNER_RISK_NAME);
				}

				if (formTypeDetail != undefined) {
					let ewayBillNumber = formTypeDetail.match(/\d{12}/g);

					let result = ewayBillNumber ? ewayBillNumber.slice(0, 3) : [];
					let result1 = ewayBillNumber ? ewayBillNumber.slice(0, 7) : [];
					let result3 = ewayBillNumber ? ewayBillNumber.slice(0, 2) : [];
					
					$("*[data-lr='firstThreeNumbersEwayBillNumber']").html(result.join(", "));
					$("*[data-lr='EwayBillNumbers']").html(result1.join(", "));
					$("*[data-lr='firstTwoNumbersEwayBillNumber']").html(result3.join(", "));
				}

				$("*[data-lr='formNameWithNumber']").html(formTypeDetail);
				$("*[data-lr='number']").html(responseOut.wayBillNumber);
				$("*[data-lr='bookingTypeName']").html(responseOut.bookingTypeName);
				$("*[data-lr='deliveryType']").html(responseOut.branchServiceTypeName);
				
				var waybillNum = responseOut.wayBillNumber.split("/");
				
				$("*[data-lr='apexLRNum']").html(waybillNum[0]);
		
				if (responseOut.bookingTypeName != "FTL")
					$(".ftlbookingtype").hide();

				if (config.isCTFormConditionRequired && responseOut.consignmentSummaryFormTypeId == CT_FORM_NOT_RECEIVED_ID)
					$("*[data-lr='number']").html("***" + responseOut.wayBillNumber);

				$("*[data-lr='purchaseOrderNumber']").html(responseOut.purchaseOrderNumber)
				$("*[data-lr='rfqNumber']").html(responseOut.rfqNumber)
				$("*[data-lr='date']").html(responseOut.bookingDateTimeString);
				const formattedDate = this.formatDate(responseOut.bookingDateTimeString);
				$("*[data-lr='formatedDate']").html(formattedDate);

				$("*[data-lr='dateTime']").html(responseOut.bookingDateTimeString + "(" + responseOut.bookingTimeString + ")");

				try {
					$("*[data-lr='dateWithSlash']").html((responseOut.bookingDateTimeString).replaceAll("-", "/"));
				} catch (err) {
					$("*[data-lr='dateWithSlash']").html(responseOut.bookingDateTimeString);
				}
				
				let [day, month, year] = responseOut.bookingDateTimeString.split("-")
				$("*[data-lr='dateDay']").html(day)
				$("*[data-lr='dateMonth']").html(month)
				$("*[data-lr='dateYear']").html(year)

				$("*[data-lr='time']").html(responseOut.bookingTimeString);
				$("*[data-lr='sealNumber']").html(responseOut.sealNumber);
				$("*[data-lr='conatainerNumber']").html(responseOut.conatainerNumber);
				
				if( responseOut.conatainerSize != undefined && responseOut.conatainerSize != null && responseOut.conatainerSize != '')
					$("*[data-lr='conatainerNumberWithconatainerType']").html( responseOut.conatainerSize + '/' + responseOut.conatainerNumber);

				var destBranchTypeOfLocation 	= responseOut.destBranchTypeOfLocation;
				var branchTypeOfLocation 		= responseOut.branchTypeOfLocation;
				var handlingBranchName 			= responseOut.handlingBranchName;
				var desthandlingBranchName		= responseOut.desthandlingBranchName;
				var desthandlingBranchNumber	= responseOut.desthandlingBranchNumber;
				destBranchMobileNo 				= wayBillDestinationBranchMobileNumber;

				if (config.appendHandlingBranchWithSourceBranch && responseOut.bookingTypeId == BOOKING_TYPE_FTL_ID) {
					if (branchTypeOfLocation != undefined && branchTypeOfLocation == TYPE_OF_LOCATION_OPERATIONAL_PLACE && handlingBranchName != undefined)
						$("*[data-lr='lrSource']").html(handlingBranchName + '-' + wayBillSourceBranchName);
					else
						$("*[data-lr='lrSource']").html(wayBillSourceBranchName);
				} else {
					$("*[data-lr='lrSource']").html(wayBillSourceBranchName);
					$("*[data-lr='lrSourceLoweCase']").html(wayBillSourceBranchName.toLowerCase());
				}

				$("*[data-lr='lrSourceDisplayName']").html(responseOut.srcBranchDisplayName);
				$("*[data-lr='lrDestinationDisplayName']").html(responseOut.destBranchDisplayName);
				
				$("*[data-lr='deliveryToAddressPinCode']").html(consignmentSummaryDeliveryToAddressPinCode);
				$("*[data-lr='sourceBranchPincode']").html(responseOut.SourceBranchPinCode)

				if (destBranchTypeOfLocation != undefined && destBranchTypeOfLocation == TYPE_OF_LOCATION_OPERATIONAL_PLACE && handlingBranchName != undefined)
					$("*[data-lr='deliveryToCustomBranchAddress6']").html(consignmentSummaryDeliveryToAddress + "," + desthandlingBranchNumber + "," + " (" + responseOut.wayBillDestinationBranchContactPerson + ") ");
				else
					$("*[data-lr='deliveryToCustomBranchAddress6']").html(consignmentSummaryDeliveryToAddress + "," + destBranchMobileNo + ", " + wayBillDestinationBranchPhoneNumber + ", " + wayBillDestinationPhoneNumber2 + " (" + responseOut.wayBillDestinationBranchContactPerson + ") ");

				if (desthandlingBranchName != undefined) {
					$("*[data-lr='lrDestHandlingForSMST']").html(' ( '+ desthandlingBranchName + ' ) ');
					if (desthandlingBranchNumber != undefined) {
						$("*[data-lr='lrDestHandling']").html(desthandlingBranchName + '(' + desthandlingBranchNumber + ')');
						$("*[data-lr='lrDestHandlingForPrabhat']").html(desthandlingBranchName + ' MOB:' + desthandlingBranchNumber);
					} else
						$("*[data-lr='lrDestHandling']").html(desthandlingBranchName);
				}

				if (destBranchTypeOfLocation != undefined && destBranchTypeOfLocation == TYPE_OF_LOCATION_OPERATIONAL_PLACE) {
					$("*[data-lr='controllingBranch']").html(desthandlingBranchName);

					if (responseOut.deliveryTo == DELIVERY_TO_BRANCH_ID) {
						$(".loacation").hide();
						$(".controllingBranch").show();
					} else if (responseOut.deliveryTo == DELIVERY_TO_DOOR_ID) {
						$(".loacation").show();
						$(".controllingBranch").show();
					}
					
					$("*[data-lr='lrDestAddressForDestinationType']").html(responseOut.consigneeName);
					$("*[data-lr='lrHandlingWithDestination']").html(desthandlingBranchName + '( ' + wayBillDestinationBranchName + ' )');
					$("*[data-lr='lrDestinationWithHandling']").html(wayBillDestinationBranchName + '( ' + desthandlingBranchName + ' )');
				} else {
					$("*[data-lr='lrHandlingWithDestination']").html(wayBillDestinationBranchName);
					$("*[data-lr='lrDestinationWithHandling']").html(wayBillDestinationBranchName);
					$("*[data-lr='lrDestAddressForDestinationType']").html(responseOut.wayBillDestinationBranchAddress);

				}

				if (branchTypeOfLocation != undefined && branchTypeOfLocation == TYPE_OF_LOCATION_OPERATIONAL_PLACE)
					$("*[data-lr='controllingBranchNumber']").html(desthandlingBranchNumber);

				if (destBranchTypeOfLocation != undefined && destBranchTypeOfLocation == TYPE_OF_LOCATION_OPERATIONAL_PLACE && zerosReg.test(wayBillDestinationBranchMobileNumber)) {
					$("*[data-lr='branchMobile']").html(wayBillDestinationBranchMobileNumber);
					$("*[data-lr='branchNameHandling']").html(wayBillDestinationBranchName);
				} else {
					$("*[data-lr='branchMobile']").html(desthandlingBranchNumber);
					$("*[data-lr='branchNameHandling']").html(desthandlingBranchName);
				}

				if (destBranchTypeOfLocation != undefined && destBranchTypeOfLocation == TYPE_OF_LOCATION_OPERATIONAL_PLACE) {
					$("*[data-lr='handlingBranchMobNo']").html(desthandlingBranchNumber);
					$("*[data-lr='handlingBranchMobNo2']").html(responseOut.desthandlingBranchNumber2);
					$("*[data-lr='nameHandlingBranch']").html(desthandlingBranchName);
					$("*[data-lr='handlingBranchAddress']").html(responseOut.desthandlingBranchAddress)
					$("*[data-lr='handlingBranchEmail']").html(responseOut.desthandlingBranchEmail)
				} else {
					$("*[data-lr='handlingBranchMobNo']").html(wayBillDestinationBranchMobileNumber);
					$("*[data-lr='handlingBranchMobNo2']").html(wayBillDestinationBranchMobileNumber2);
					$("*[data-lr='nameHandlingBranch']").html(wayBillDestinationBranchName);
					$("*[data-lr='handlingBranchAddress']").html(responseOut.wayBillDestinationBranchAddress)
					$("*[data-lr='handlingBranchEmail']").html(responseOut.wayBillDestinationBranchEmail)

				}

				$("*[data-lr='lrSourceAbrvnCode']").html(responseOut.srcBranchAbrvtinCode);
				$("*[data-lr='lrDestination']").html(wayBillDestinationBranchName);
				$("*[data-lr='lrDestinationLowerCase']").html(wayBillDestinationBranchName.toLowerCase());

				//work for bato changed destination in consignor and consignee copy if dest branch is Kaveripatnam
				if (config.changeDestinationBranchNameInPrint) {
					if (responseOut.wayBillMappedDestinationBranchId != 0) {
						$("*[data-lr='lrDestinationConsignorCopy']").html(responseOut.wayBillMappedDestinationBranchName);
						$("*[data-lr='lrDestinationConsigneeCopy']").html(responseOut.wayBillMappedDestinationBranchName);
					} else {
						$("*[data-lr='lrDestinationConsignorCopy']").html(wayBillDestinationBranchName);
						$("*[data-lr='lrDestinationConsigneeCopy']").html(wayBillDestinationBranchName);
					}
				}
				//end

				if (wayBillSourceBranchName.length > 20)
					$("*[data-lr='lrSourceWithSubString']").html(wayBillSourceBranchName.substring(0, 20) + ' ');
				else
					$("*[data-lr='lrSourceWithSubString']").html(wayBillSourceBranchName);

				if (wayBillDestinationBranchName != undefined) {
					if (wayBillDestinationBranchName.length > 20)
						$("*[data-lr='lrDestinationWithSubString']").html(wayBillDestinationBranchName.substring(0, 20) + ' ');
					else
						$("*[data-lr='lrDestinationWithSubString']").html(wayBillDestinationBranchName);
				}

				//for DLTP
				if (responseOut.PrintHeaderModel.branchContactDetailMobileNumber != undefined)
					$("*[data-lr='lrBranchMob1']").html(responseOut.PrintHeaderModel.branchContactDetailMobileNumber);

				if (responseOut.PrintHeaderModel.branchContactDetailMobileNumber2 != undefined)
					$("*[data-lr='lrBranchMob2']").html(responseOut.PrintHeaderModel.branchContactDetailMobileNumber2);

				if (wayBillDestinationBranchMobileNumber != undefined)
					$("*[data-lr1='lrDestMob1']").html(wayBillDestinationBranchMobileNumber);

				if (wayBillDestinationBranchMobileNumber2 != undefined)
					$("*[data-lr2='lrDestMob2']").html(wayBillDestinationBranchMobileNumber2);

				// end	  
				$("*[data-lr='lrDestinationAbrvnCode']").html(responseOut.destBranchAbrvtinCode);
				$("*[data-lr='lrSourceSubregion']").html(wayBillSourceSubregionName);
				$("*[data-lr='lrSourceSubregionCode']").html(wayBillSourceSubregionCode);
				$("*[data-lr='lrDestinationSubregion']").html(wayBillDestinationSubregionName);
				$("*[data-lr='lrSourceCity']").html(wayBillSourceCityName);
				$("*[data-lr='lrSourceCityLoweCase']").html(wayBillSourceCityName.toLowerCase());
				$("*[data-lr='lrSourceBranchWithCity']").html(wayBillSourceBranchName + ' (' + wayBillSourceCityName + ')');
				$("*[data-lr='lrSourceBranchWithSubRegion']").html(wayBillSourceBranchName + ' (' + wayBillSourceSubregionName + ')');
				$("*[data-lr='lrdestinationBranchWithCity']").html(wayBillDestinationBranchName + ' (' + wayBillDestinationCityName + ')');
				$("*[data-lr='lrDestinationCity']").html(wayBillDestinationCityName);
				$("*[data-lr='lrDestinationCityLoweCase']").html(wayBillDestinationCityName != undefined ? wayBillDestinationCityName.toLowerCase() : "");
				$("*[data-lr='lrCityWithSource']").html(wayBillSourceCityName + ' ( ' + wayBillSourceBranchName + ' )');
				$("*[data-lr='lrCityWithDestination']").html(wayBillDestinationCityName + ' ( ' + wayBillDestinationBranchName + ' )');
				$("*[data-lr='lrSourceBranchAddressAndPhoneNumberSC']").html(responseOut.wayBillSourceBranchAddress.replace(/ /g, "&nbsp;") + '<br>( Contact Number ' + wayBillSourceBranchMobileNumber + ')<br>(G.T.A)');
				$("*[data-lr='lrDestinationMobileNumberIND']").html(wayBillDestinationBranchMobileNumber2);
				$("*[data-lr='lrDestinationBranchNameWithSubregion']").html(wayBillDestinationBranchName + ' (' + wayBillDestinationSubregionName + ')');
				$("*[data-lr='lrDestinationMobileNumberSTL']").html(wayBillDestinationBranchMobileNumber + " , " + wayBillDestinationBranchMobileNumber2);

				if (doNotShowSourceSubreion)
					$("*[data-lr='lrSubregionWithSource']").html(wayBillSourceBranchName);
				else
					$("*[data-lr='lrSubregionWithSource']").html(wayBillSourceSubregionName + ' ( ' + wayBillSourceBranchName + ' )');

				if (doNotShowDestinationSubreion)
					$("*[data-lr='lrSubregionWithDestination']").html(wayBillDestinationBranchName);
				else
					$("*[data-lr='lrSubregionWithDestination']").html(wayBillDestinationSubregionName + ' (' + wayBillDestinationBranchName + ')');

				if (responseOut.tdsAmount > 0)
					$("*[data-lr='tdsAmount']").html(responseOut.tdsAmount);
				else
					$(".tdsAmount").hide();
					
				if (responseOut.wayBillSourceBranchAddress != undefined) {
					$("*[data-lr='lrSourceAddress']").html(responseOut.wayBillSourceBranchAddress.replace(/ /g, "&nbsp;"));
					$("*[data-lr='lrSourceAddressSubString']").html(responseOut.wayBillSourceBranchAddress.substring(0, 30));
					$("*[data-lr='lrSourceAddressPATIL']").html(responseOut.wayBillSourceBranchAddress);
				}

				if (responseOut.wayBillDestinationBranchAddress != undefined) {
					$("*[data-lr='lrDestinationAddress']").html(responseOut.wayBillDestinationBranchAddress.replace(/ /g, "&nbsp;"));
					$("*[data-lr='lrDestinationAddressNoNbsp']").html(responseOut.wayBillDestinationBranchAddress);
					$("*[data-lr='lrDestinationAddressSubString']").html(responseOut.wayBillDestinationBranchAddress.substring(0, 30));
				}

				if (responseOut.srcBranchServiceTaxCode != undefined)
					$("*[data-lr='branchServiceTaxCode']").html(responseOut.srcBranchServiceTaxCode);

				if (wayBillDestinationBranchMobileNumber != undefined && wayBillDestinationBranchMobileNumber != '0000000000') {
					$("*[data-lr='lrDestinationAddresswithPhoneNo']").html(wayBillDestinationBranchName + ' (' + wayBillDestinationBranchMobileNumber + ')');
					$("*[data-lr='lrDestinationAddresswithPhoneNoWithString']").html(responseOut.wayBillDestinationBranchAddress + '(Contact No.:' + wayBillDestinationBranchMobileNumber + ')');
					$("*[data-lr='lrDestAddresswithPhoneNo']").html(responseOut.wayBillDestinationBranchAddress + '(' + wayBillDestinationBranchMobileNumber + ',' + wayBillDestinationBranchMobileNumber2 + ')');
					$("*[data-lr='lrDestAddresswithPhoneNoPooja']").html(responseOut.wayBillDestinationBranchAddress.substring(0, 100) + '(' + wayBillDestinationBranchMobileNumber + ')');

					if (responseOut.wayBillDestinationBranchAddress === undefined || responseOut.wayBillDestinationBranchAddress === null)
						responseOut.wayBillDestinationBranchAddress = "";

					$("*[data-lr='lrDestinationNameAndAddressWithPhoneNo']").html(wayBillDestinationBranchName + ', ' + responseOut.wayBillDestinationBranchAddress.substring(0, 100) + '(' + wayBillDestinationBranchMobileNumber + ')');
				} else {
					$("*[data-lr='lrDestinationAddresswithPhoneNo']").html(wayBillDestinationBranchName);
					$("*[data-lr='lrDestAddresswithPhoneNo']").html(responseOut.wayBillDestinationBranchAddress);
					$("*[data-lr='lrDestinationAddresswithPhoneNoWithString']").html(responseOut.wayBillDestinationBranchAddress + '(Contact No.:' + wayBillDestinationBranchMobileNumber + ')');

					if (responseOut.wayBillDestinationBranchAddress === undefined || responseOut.wayBillDestinationBranchAddress === null)
						responseOut.wayBillDestinationBranchAddress = "";

					$("*[data-lr='lrDestinationNameAndAddressWithPhoneNo']").html(wayBillDestinationBranchName + ', ' + responseOut.wayBillDestinationBranchAddress.substring(0, 100) + '(' + wayBillDestinationBranchPhoneNumber + ')');

					if (responseOut.wayBillDestinationBranchAddress != undefined && responseOut.wayBillDestinationBranchAddress != null)
						$("*[data-lr='lrDestAddresswithPhoneNoPooja']").html(responseOut.wayBillDestinationBranchAddress.substring(0, 100));
				}

				let deliveryAdddressWithPhoneNumbers = responseOut.wayBillDestinationBranchAddress;

				if (wayBillDestinationBranchPhoneNumber != undefined && wayBillDestinationPhoneNumber2 != undefined)
					deliveryAdddressWithPhoneNumbers = deliveryAdddressWithPhoneNumbers + '(' + wayBillDestinationBranchPhoneNumber + '-' + wayBillDestinationPhoneNumber2 + ')';
				else if (wayBillDestinationBranchPhoneNumber != undefined)
					deliveryAdddressWithPhoneNumbers = deliveryAdddressWithPhoneNumbers + '(' + wayBillDestinationBranchPhoneNumber + ')';
				else if (wayBillDestinationPhoneNumber2 != undefined)
					deliveryAdddressWithPhoneNumbers = deliveryAdddressWithPhoneNumbers + '(' + wayBillDestinationPhoneNumber2 + ')';

				$("*[data-lr='lrDestAddresswithPhoneNoForSharma']").html(deliveryAdddressWithPhoneNumbers);

				if (wayBillSourceBranchMobileNumber != undefined)
					$("*[data-lr='lrSourceMobNo']").html(',' + wayBillSourceBranchMobileNumber + '');

				if (wayBillSourceBranchPhoneNumber != undefined)
					$("*[data-lr='lrSourcePhoneNo']").html(wayBillSourceBranchPhoneNumber);
					
				if (wayBillDestinationPhoneNumber2 != undefined)
					$("*[data-lr='lrDestinationPhoneNo2']").html(wayBillDestinationPhoneNumber2);
				
				if (wayBillDestinationBranchPhoneNumber != undefined)
					$("*[data-lr='lrDestinationPhoneNo']").html(wayBillDestinationBranchPhoneNumber);
				
				if (responseOut.wayBillDestinationBranchEmail != undefined)
					$("*[data-lr='destinationBranchEmailId']").html(responseOut.wayBillDestinationBranchEmail);
				
				//start : Printing Branch Phone No and Mobile number With 0 Validation - Ravi Prajapati

				if (wayBillSourceBranchPhoneNumber != undefined) {
					if (zerosReg.test(wayBillSourceBranchPhoneNumber)) {
						$("*[data-lr='SourceNumber']").html('(' + wayBillSourceBranchPhoneNumber + ')');
						$("*[data-lr='SourceNumberWithoutBracket']").html(wayBillSourceBranchPhoneNumber);
					} else if (wayBillSourceBranchMobileNumber != undefined && zerosReg.test(wayBillSourceBranchMobileNumber)) {
						$("*[data-lr='SourceNumber']").html('(' + wayBillSourceBranchMobileNumber + ')');
						$("*[data-lr='SourceNumber1']").html(wayBillSourceBranchMobileNumber);
						$("*[data-lr='SourceNumberWithoutBracket']").html(wayBillSourceBranchMobileNumber);
					}
				} else if (wayBillSourceBranchMobileNumber != undefined && zerosReg.test(wayBillSourceBranchMobileNumber)) {
					$("*[data-lr='SourceNumber']").html('(' + wayBillSourceBranchMobileNumber + ')');
					$("*[data-lr='SourceNumberWithoutBracket']").html(wayBillSourceBranchMobileNumber);
				}

				if (wayBillSourceBranchMobileNumber != undefined) {
					if (zerosReg.test(wayBillSourceBranchMobileNumber))
						$("*[data-lr='SourceMobileAndPhoneNumber']").html('(' + wayBillSourceBranchMobileNumber + ')')
					else if (wayBillSourceBranchPhoneNumber != undefined && zerosReg.test(wayBillSourceBranchPhoneNumber))
						$("*[data-lr='SourceMobileAndPhoneNumber']").html('(' + wayBillSourceBranchPhoneNumber + ')');
				} else if (wayBillSourceBranchPhoneNumber != undefined && zerosReg.test(wayBillSourceBranchPhoneNumber))
					$("*[data-lr='SourceMobileAndPhoneNumber']").html('(' + wayBillSourceBranchPhoneNumber + ')');

				if (wayBillDestinationBranchMobileNumber2 != undefined) {
					if (zerosReg.test(wayBillDestinationBranchMobileNumber2)) {
						$("*[data-lr='DestinationMobileAndPhoneNumber']").html('(' + wayBillDestinationBranchMobileNumber2 + ')')
						$("*[data-lr='DestinationMobileAndPhoneNumberWithOutBracket']").html(wayBillDestinationBranchMobileNumber2)
					} else if (wayBillDestinationPhoneNumber2 != undefined && zerosReg.test(wayBillDestinationPhoneNumber2)) {
						$("*[data-lr='DestinationMobileAndPhoneNumber']").html('(' + wayBillDestinationPhoneNumber2 + ')');
						$("*[data-lr='DestinationMobileAndPhoneNumberWithOutBracket']").html(wayBillDestinationPhoneNumber2)
					}
				} else if (wayBillDestinationPhoneNumber2 != undefined && zerosReg.test(wayBillDestinationPhoneNumber2)) {
					$("*[data-lr='DestinationMobileAndPhoneNumber']").html('(' + wayBillDestinationPhoneNumber2 + ')');
					$("*[data-lr='DestinationMobileAndPhoneNumberWithOutBracket']").html(wayBillDestinationPhoneNumber2)
				}

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
						$("*[data-lr='DestinationNumberWithoutBracket']").html(wayBillDestinationBranchPhoneNumber)
					} else if (wayBillDestinationBranchMobileNumber != undefined && zerosReg.test(wayBillDestinationBranchMobileNumber))
						$("*[data-lr='DestinationNumber']").html('(' + wayBillDestinationBranchMobileNumber + ')');
						$("*[data-lr='DestinationNumberWithoutBracket']").html(wayBillDestinationBranchMobileNumber)
				} else if (wayBillDestinationBranchMobileNumber != undefined && zerosReg.test(wayBillDestinationBranchMobileNumber)) {
					$("*[data-lr='DestinationNumber']").html('(' + wayBillDestinationBranchMobileNumber + ')');
					$("*[data-lr='DestinationNumberWithoutBracket']").html(wayBillDestinationBranchMobileNumber)

					if (config.changeDestinationBranchNameInPrint) {
						if (responseOut.wayBillMappedDestinationBranchId > 0)
							$("*[data-lr='MappedDestinationBranchPhoneNumber']").html('( ' + responseOut.wayBillMappedDestinationBranchPhoneNumber + ')')
						else
							$("*[data-lr='MappedDestinationBranchPhoneNumber']").html('( ' + wayBillDestinationBranchMobileNumber + ')')
					}
				}

				if (wayBillSourceBranchMobileNumber != undefined && wayBillSourceBranchMobileNumber != '0000000000')
					$("*[data-lr='lrSourceAddresswithPhoneNo']").html(wayBillSourceBranchName + '(' + wayBillSourceBranchMobileNumber + ')');
				else
					$("*[data-lr='lrSourceAddresswithPhoneNo']").html(wayBillSourceBranchName);
				//End

				if (wayBillSourceBranchPhoneNumber != undefined && wayBillSourceBranchPhoneNumber != null) {
					if (zerosReg.test(wayBillSourceBranchPhoneNumber))
						$("*[data-lr='lrSourceNumber']").html(wayBillSourceBranchPhoneNumber);
					else
						$("*[data-lr='lrSourceNumber']").html("--");
				}

				if (wayBillSourceBranchPhoneNumber2 != undefined && wayBillSourceBranchPhoneNumber2 != null && zerosReg.test(wayBillSourceBranchPhoneNumber2)) {
					if (wayBillSourceBranchPhoneNumber != undefined)
						$("*[data-lr='lrSourceNumber2']").html(", " + wayBillSourceBranchPhoneNumber2);
					else
						$("*[data-lr='lrSourceNumber2']").html(wayBillSourceBranchPhoneNumber2);
				}

				// phone number pattern is 0000-00000000/00000000 for Source branch	, Destination Branch
				var lrSourcePhoneNumber1 = "--";
				var lrSourcePhoneNumber2 = "--";

				if (wayBillSourceBranchPhoneNumber != undefined && wayBillSourceBranchPhoneNumber != null && zerosReg.test(wayBillSourceBranchPhoneNumber))
					lrSourcePhoneNumber1 = wayBillSourceBranchPhoneNumber;

				if (wayBillSourceBranchPhoneNumber2 != undefined && wayBillSourceBranchPhoneNumber2 != null && zerosReg.test(wayBillSourceBranchPhoneNumber2)) {
					if (lrSourcePhoneNumber1 == "--")
						lrSourcePhoneNumber2 = wayBillSourceBranchPhoneNumber2;
					else
						lrSourcePhoneNumber2 = wayBillSourceBranchPhoneNumber2.split("-")[1];
				}

				if (lrSourcePhoneNumber1 == '--' && lrSourcePhoneNumber2 == '--')
					$("*[data-lr='lrSourcePhoneNumber']").html("");
				else
					$("*[data-lr='lrSourcePhoneNumber']").html(lrSourcePhoneNumber1 + " / " + lrSourcePhoneNumber2);

				// phone number pattern is 0000-00000000/00000000 for Destination branch
				var lrDestinationPhoneNumber1 = "--";
				var lrDestinationPhoneNumber2 = "--";

				if (wayBillDestinationBranchPhoneNumber != undefined && wayBillDestinationBranchPhoneNumber != null
					&& zerosReg.test(wayBillDestinationBranchPhoneNumber)) {
					lrDestinationPhoneNumber1 = wayBillDestinationBranchPhoneNumber;
				}

				if (wayBillDestinationPhoneNumber2 != undefined && wayBillDestinationPhoneNumber2 != null && zerosReg.test(wayBillDestinationPhoneNumber2)) {
					if (lrDestinationPhoneNumber1 == "--")
						lrDestinationPhoneNumber2 = wayBillDestinationPhoneNumber2
					else
						lrDestinationPhoneNumber2 = wayBillDestinationPhoneNumber2.split("-")[1];
				}

				if (lrDestinationPhoneNumber1 == '--' && lrDestinationPhoneNumber2 == '--')
					$("*[data-lr='lrDestinationPhoneNumber']").html("");
				else
					$("*[data-lr='lrDestinationPhoneNumber']").html(lrDestinationPhoneNumber1 + " / " + lrDestinationPhoneNumber2);

				/*End*/

				if (wayBillSourceBranchPhoneNumber != undefined && wayBillSourceBranchMobileNumber != undefined) {
					var replacedString = (wayBillSourceBranchPhoneNumber).replace('-', '');

					if (zerosReg.test(replacedString)) {
						$("*[data-lr='lrSourceNumber']").html(wayBillSourceBranchPhoneNumber);
						$("*[data-lr='lrSourceMobileNo']").html(wayBillSourceBranchMobileNumber);
						$("*[data-lr='lrSourceMobileNumber']").html("," + wayBillSourceBranchMobileNumber);
						$("*[data-lr='lrSourceMobileNumberwithbracket']").html('(' + wayBillSourceBranchMobileNumber + ')');
						$("*[data-lr='lrSourceMobileNumber1']").html(" " + wayBillSourceBranchMobileNumber);
					} else {
						$("*[data-lr='lrSourceMobileNo']").html(wayBillSourceBranchMobileNumber);
						$("*[data-lr='lrSourceMobileNumber']").html(wayBillSourceBranchMobileNumber);
						$("*[data-lr='lrSourceMobileNumber1']").html(wayBillSourceBranchMobileNumber);
						$("*[data-lr='lrSourceMobileNumberwithbracket']").html('(' + wayBillSourceBranchMobileNumber + ')');
					}
				} else if (wayBillSourceBranchMobileNumber != undefined) {
					$("*[data-lr='lrSourceMobileNo']").html(wayBillSourceBranchMobileNumber);
					$("*[data-lr='lrSourceMobileNumber']").html(", " + wayBillSourceBranchMobileNumber);
					$("*[data-lr='lrSourceMobileNumber1']").html(wayBillSourceBranchMobileNumber);
					$("*[data-lr='lrSourceMobileNumberwithbracket']").html('(' + wayBillSourceBranchMobileNumber + ')');
				}

				if (wayBillSourceBranchMobileNumber != undefined && wayBillSourceBranchMobileNumber != '0000000000')
					$("*[data-lr='lrSourceMobileNumberctc']").html(", " + wayBillSourceBranchMobileNumber);
				else if (wayBillSourceBranchPhoneNumber != undefined && wayBillSourceBranchPhoneNumber != '0000000000')
					$("*[data-lr='lrSourcePhoneNumberctc']").html(", " + wayBillSourceBranchPhoneNumber);

				if (wayBillDestinationBranchMobileNumber != undefined && wayBillDestinationBranchMobileNumber != '0000000000')
					$("*[data-lr='lrDestinationMobileNumberctc']").html(", " + wayBillDestinationBranchMobileNumber);
				else if (wayBillDestinationBranchPhoneNumber != undefined && wayBillDestinationBranchPhoneNumber != '0000000000')
					$("*[data-lr='lrDestinationPhoneNumberctc']").html(", " + responseOut.wayBillDestinationBranchPhoneNumber);

				if (wayBillSourceBranchMobileNumber != undefined && wayBillSourceBranchMobileNumber2 != undefined) {
					var replacedString = (wayBillSourceBranchMobileNumber2).replace('-', '');

					if (zerosReg.test(replacedString))
						$("*[data-lr='lrSourceMobileNumber2']").html(", " + wayBillSourceBranchMobileNumber2);
				} else if (wayBillSourceBranchMobileNumber2 != undefined) {
					var replacedString = (wayBillSourceBranchMobileNumber2).replace('-', '');

					if (zerosReg.test(replacedString))
						$("*[data-lr='lrSourceMobileNumber2']").html(wayBillSourceBranchMobileNumber2);
				}

				if (wayBillDestinationBranchPhoneNumber != undefined) {
					var replacedString = (wayBillDestinationBranchPhoneNumber).replace('-', '');

					if (zerosReg.test(replacedString))
						$("*[data-lr='lrDestinationNumber']").html(wayBillDestinationBranchPhoneNumber);
				}

				if (wayBillDestinationPhoneNumber2 != undefined) {
					var replacedString = wayBillDestinationPhoneNumber2.replace('-', '');

					if (zerosReg.test(replacedString)) {
						if (wayBillDestinationBranchPhoneNumber != undefined && zerosReg.test(wayBillDestinationBranchPhoneNumber.replace('-', '')))
							$("*[data-lr='lrDestinationNumber2']").html(", " + wayBillDestinationPhoneNumber2);
						else
							$("*[data-lr='lrDestinationNumber2']").html(wayBillDestinationPhoneNumber2);
					}
				}

				if (wayBillDestinationBranchPhoneNumber != undefined && wayBillDestinationBranchMobileNumber != undefined) {
					var replacedString = wayBillDestinationBranchPhoneNumber.replace('-', '');

					if (zerosReg.test(replacedString)) {
						$("*[data-lr='lrDestinationNumber']").html(wayBillDestinationBranchPhoneNumber);

						if (wayBillDestinationBranchMobileNumber != undefined) {
							$("*[data-lr='lrDestinationMobileNumber']").html(wayBillDestinationBranchMobileNumber);
							$("*[data-lr='lrDestinationMobileNumberwithbracket']").html('(' + wayBillDestinationBranchMobileNumber + ')');
						}
					} else
						$("*[data-lr='lrDestinationMobileNumber']").html(wayBillDestinationBranchMobileNumber);
				} else if (wayBillDestinationBranchMobileNumber != undefined) {
					$("*[data-lr='lrDestinationMobileNumber']").html(wayBillDestinationBranchMobileNumber);
					$("*[data-lr='lrDestinationNumber']").html(wayBillDestinationBranchMobileNumber);
				}

				if (wayBillDestinationBranchMobileNumber != undefined)
					$("*[data-lr='lrDestinationMobileNumberWithoutComma']").html(wayBillDestinationBranchMobileNumber);

				if (wayBillDestinationBranchMobileNumber2 != undefined) {
					var replacedString = (wayBillDestinationBranchMobileNumber2).replace('-', '');

					if (zerosReg.test(replacedString)) {
						if (wayBillDestinationBranchMobileNumber != undefined)
							$("*[data-lr='lrDestinationMobileNumber2']").html(", " + wayBillDestinationBranchMobileNumber2);
						else
							$("*[data-lr='lrDestinationMobileNumber2']").html(wayBillDestinationBranchMobileNumber2);
					}
				}

				for (var i = 1; i <= 4; i++) {
					if (document.getElementById("barcode" + i)) {
						var qrcode1 = new QRCode(document.getElementById("barcode" + i), {
							width: config.QrCodeHeight,
							height: config.QrCodeWidth
						});

						//	if (config.accountGroupId == 580)
						//	qrcode1.makeCode('https://bhorgroup.com/');
						//else
						qrcode1.makeCode(responseOut.wayBillId + "~" + responseOut.wayBillNumber + "~" + QR_CODE_USING_WAYBILL_NUMBER + "~" + 0);
					}
				}
				
				$(".barcodeForLrno").each(function () {
					let size = Number($(this).attr("data-qrcode-size")) || config.QrCodeWidth;
					let qr = new QRCode(this, {
						width: size,
						height: size
					});
					qr.makeCode(responseOut.wayBillNumber);
				});
				

				if (responseOut.configuration.isFromIVEditor) {
					$("[data-qrcode='true']").each(function() {
						let qrCode = new QRCode($(this)[0], {
							width: Number($(this).attr("data-qrcode-size")),
							height: Number($(this).attr("data-qrcode-size"))
						})
						qrCode.makeCode(responseOut.wayBillId + "~" + responseOut.wayBillNumber + "~" + QR_CODE_USING_WAYBILL_NUMBER + "~" + 0);
					})
				}
				
				if (responseOut.invoiceNumber != undefined && responseOut.invoiceNumber != 'NULL') {
					if(responseOut.insurancebkg)
						$("*[data-lr='consignorInsuranceNo']").html(responseOut.insurancebkg);
					else if(responseOut.insurance)
						$("*[data-lr='consignorInsuranceNo']").html(responseOut.insurance);
					else 
						$("*[data-lr='consignorInsuranceNo']").html("--");
					
					$("*[data-lr='consignorInvoiceNo']").html(responseOut.invoiceNumber);
					
					$("*[data-lr='consignorInvoiceNoSpaces']").html(
						responseOut.invoiceNumber
						.replace(/,/g, ", ")
						.replace(/\//g, "/ ")
					);

					if (responseOut.invoiceNumber.length > 15)
						$("*[data-lr='consignorInvoiceNo']").html(replaceSlash(responseOut.invoiceNumber,'/','/ '));

					$("*[data-lr='consignorInvoiceNumber1']").html(responseOut.invoiceNumber.substring(0, 30));
				}

				if (responseOut.bookingPrintDate != undefined && responseOut.bookingPrintDate != 'NULL' && responseOut.bookingPrintDate != 0 && responseOut.bookingPrintDate != '--')
					$("*[data-lr='bookingPrintDate']").html(responseOut.bookingPrintDate);
				else
					$("*[data-lr='bookingPrintDate']").html(responseOut.bookingDateTimeString);

				if (responseOut.consignmentSummaryInvDate != undefined && responseOut.consignmentSummaryInvDate != 'NULL')
					$("*[data-lr='consignorInvoiceDate']").html(responseOut.consignmentSummaryInvDate);

				$("*[data-lr='decalredValue']").html(responseOut.declaredValue);
				$("*[data-lr='decalredValueForMGLLP']").html(responseOut.declaredValue > 0 ? responseOut.declaredValue : '');
				$("*[data-lr='privateMark']").html(responseOut.privateMark);
				$("*[data-lr='actualWeight']").html(responseOut.actualWeight);
				$("*[data-lr='crossingAgentName']").html(responseOut.crossingAgentName);
				$("*[data-lr='actualWeightforpooja']").html(responseOut.actualWeight + ' /Kg');
				
				if(responseOut.bookingCommission != undefined){
					$("*[data-lr='wayBillBookingCommission']").html(parseFloat(responseOut.bookingCommission).toFixed(2));
				}

				if (responseOut.privateMark != null && responseOut.privateMark != undefined) {
						if (responseOut.privateMark.length > 20)
							$("*[data-lr='privateMarkSubString']").html(responseOut.privateMark.substring(0, 20));
						else
							$("*[data-lr='privateMarkSubString']").html(responseOut.privateMark);
					} else
						$("*[data-lr='privateMarkSubString']").html("--");
				
				if(responseOut.actualWeight > 0)
					$("*[data-lr='actualWeightFixed']").html(responseOut.actualWeight);
				else
					$("*[data-lr='actualWeightFixed']").html('FIXED');
				
				if (responseOut.declaredValue != undefined)
					$("*[data-lr='decalredValueComma']").html((responseOut.declaredValue).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));

				if (responseOut.bookedBy != undefined && responseOut.bookedBy != 'NULL')
					$("*[data-lr='bookedBy']").html((responseOut.bookedBy).toUpperCase());

				if (responseOut.isValuationCharge == true){
					$("*[data-lr='inclusiveDecalredValue']").html(responseOut.declaredValue);
					$("*[data-lr='inclusiveDecalredValueNew']").html(responseOut.declaredValue);
				}else{
					$("*[data-lr='inclusiveDecalredValue']").html(config.defaultDeclareValue);
					$("*[data-lr='inclusiveDecalredValueNew']").html('**As Per Carrier Act');
				}

				if (responseOut.declaredValue == 0) {
					$("*[data-lr='decalredValueSlpl']").html('');
					$('.hideDeclaredValueSks').hide();
				} else
					$("*[data-lr='decalredValueSlpl']").html(responseOut.declaredValue);
				
				if(responseOut.actualWeight == 0)
					$("*[data-lr='actualWeightSlpl']").html('');
				else
					$("*[data-lr='actualWeightSlpl']").html(responseOut.actualWeight);

				if (responseOut.chargeTypeId == CHARGETYPE_ID_WEIGHT)
					$(".actualweightsection").show();

				if (responseOut.chargeTypeId != CHARGETYPE_ID_QUANTITY) {
					$(".articleAmount").hide();
					$(".weigthAmount").show();
				} else {
					$(".articleAmount").show();
					$(".weigthAmount").hide();
				}

				$("*[data-lr='actualWeightConsignor']").html(responseOut.actualWeight);
				$("*[data-lr='actualWeightConsignee']").html(responseOut.actualWeight);
				$("*[data-lr='chargedWeight']").html(responseOut.chargedWeight);
				$("*[data-lr='chargedWeightConsignor']").html(responseOut.chargedWeight);
				$("*[data-lr='chargedWeightConsignee']").html(responseOut.chargedWeight);
				$("*[data-lr='bookingServicetax']").html(responseOut.bookingTimeServiceTax);
				$("*[data-lr='bookingDiscount']").html(responseOut.bookingDiscount);
				$("*[data-lr='chargedWeightforPooja']").html(responseOut.chargedWeight + ' /Kg');

				if(responseOut.chargedWeight > 0)
					$("*[data-lr='chargedWeightFixed']").html(responseOut.chargedWeight);
				else
					$("*[data-lr='chargedWeightFixed']").html('FIXED');
				
				if(responseOut.bookingTimeServiceTax == 0)
					$("*[data-lr='bookingServicetaxSLpl']").html('');
				else
					$("*[data-lr='bookingServicetaxSLpl']").html(responseOut.bookingTimeServiceTax);
				
				var consignmentArr = responseOut.consignmentMap;
				
				$("*[data-lr='length']").html(consignmentArr[0].length);
				$("*[data-lr='breadth']").html(consignmentArr[0].breadth);
				$("*[data-lr='height']").html(consignmentArr[0].height);
				$("*[data-lr='cftValue']").html(responseOut.cftValue);
				
				if (config.showCFTWeightOnPrint && responseOut.cftWeight > 0)
					$(".cftWeightPrintDiv").show();

				$("*[data-lr='cftWeight']").html(responseOut.cftWeight);
				$("*[data-lr='cftLength']").html(responseOut.cftLength);
				$("*[data-lr='cftBreadth']").html(responseOut.cftBreadth);
				$("*[data-lr='cftHeight']").html(responseOut.cftHeight);

				if (config.showChargeWtZero)
					$("*[data-lr='chargedWeight']").html(responseOut.chargedWeight == 0 ? "FIX" : responseOut.chargedWeight);

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
				if(responseOut.isPickupLr == 1)
					$("*[data-lr='bookedByExecutiveForGMT']").html(responseOut.consignorName);
	            else
					$("*[data-lr='bookedByExecutiveForGMT']").html(responseOut.wayBillBookedBy);
				
				if (responseOut.isPodRequiredForGroup) {
					if (config.IsPartyWisePODRequiredForDisplay)
						$("*[data-lr='podRequired']").html((responseOut.consignorPodRequired || responseOut.consigneePodRequired) ? "YES" : "NO");
					else if (responseOut.podRequiredName != undefined)
						$("*[data-lr='podRequired']").html(responseOut.podRequiredName);
					else
						$("*[data-lr='podRequired']").html(responseOut.podRequired ? "YES" : "NO");
				}

				$("*[data-lr='roadPermitNumber']").html(responseOut.roadPermitNumber);
				$("*[data-lr='exciseInvoiceName']").html(responseOut.exciseInvoiceName);
				$("*[data-lr='consignmentInsuredName']").html(responseOut.consignmentInsuredName);

				if (responseOut.bookingTimeServiceTax > 0) {
					$("*[data-lr='bookingServicetax1']").html(Math.round(responseOut.bookingTimeServiceTax));
					$("*[data-lr='bookingServicetaxForCspl']").html(Math.round(responseOut.bookingTimeServiceTax));
				} else {
					$("*[data-lr='bookingServicetax1']").html(Math.round(responseOut.bookingTimeUnAddedTaxAmount));
					$("*[data-lr='bookingServicetaxForCspl']").html(0);

					/*
					 *For RCC AND SSC Group
					 *If tax amount is 0
					 */
					$('.gstTaxDetailsWithoutZeroAmount').empty();
					$('.gstTaxDetailsWithZeroAmount').html(0);
				}

				if (responseOut.bookingTimeUnAddedTaxAmount > 0)
					$("*[data-lr='unaddedTaxAmount']").html('(' + responseOut.bookingTimeUnAddedTaxAmount + '/-)');

				//for SNGT Case - start
				if (responseOut.bookingTimeServiceTax > 0)
					$(".servicetax").show();
					
				//end
				$("*[data-lr='chargeSum']").html(responseOut.bookingChargesSum);
				$("*[data-lr='chargeSumroundoff']").html(Math.round(responseOut.bookingChargesSum));
				$("*[data-lr='allChargeAmount']").html(responseOut.bookingTotal - responseOut.chargeAmount);

				if (config.showDecimalValueAfterCharge == true || config.showDecimalValueAfterCharge) {
					if (config.showDecimalValueForGrandTotal == true || config.showDecimalValueForGrandTotal)
						$("*[data-lr='grandTotal']").html((parseFloat(responseOut.bookingTotal)));
					else
						$("*[data-lr='grandTotal']").html((Math.round(responseOut.bookingTotal + ".00")));
				} else if (config.BranchWiseDataHide || config.BranchWiseDataHide == true) {
					var branchIdsToHide = config.branchIdsToHide;
					var branchArray = branchIdsToHide.split(",");
					var branchAllowed = isValueExistInArray(branchArray, responseOut.executiveBranchId);

					if (branchAllowed) {
						for (var index in bookingCharges) {
							if (bookingCharges[index].chargeTypeMasterId == FREIGHT) {
								$("*[data-lr='grandTotal']").html(Math.round(bookingCharges[index].wayBillBookingChargeChargeAmount));
								$("*[data-lr='grandTotalWithComma']").html((Math.round(bookingCharges[index].wayBillBookingChargeChargeAmount)).toLocaleString("en-US"));
								break;
							}
						}
					} else {
						$("*[data-lr='grandTotal']").html(Math.round(responseOut.bookingTotal));
						$("*[data-lr='grandTotalWithComma']").html((Math.round(responseOut.bookingTotal)).toLocaleString("en-US"));
					}
				} else if (config.showVisibleAmount && bookingCharges != undefined && bookingCharges.length > 0) {
					let visibleFreightAmount = this.getVisibleRate(responseOut);
					let freightAmount = bookingCharges[0].wayBillBookingChargeChargeAmount;

					if (visibleFreightAmount > 0)
						$("*[data-lr='grandTotal']").html(Math.round(responseOut.bookingTotal + visibleFreightAmount - freightAmount));
					else
						$("*[data-lr='grandTotal']").html(Math.round(responseOut.bookingTotal));
				} else {
					$("*[data-lr='grandTotal']").html(Math.round(responseOut.bookingTotal));
					$("*[data-lr='grandTotalWithComma']").html((Math.round(responseOut.bookingTotal)).toLocaleString("en-US"));
					$("*[data-lr='grandTotalCSgst']").html(responseOut.bookingChargesSum + Math.round(responseOut.totalGst));
				}
				
				if (bookingCharges.some(c => c.chargeTypeMasterId === LOADING) && bookingCharges.some(c => c.chargeTypeMasterId === FREIGHT) && bookingCharges.every(c => [LOADING, FREIGHT].includes(c.chargeTypeMasterId)))
					$(".hideAllChargesForRT").hide();
				
				if (!bookingCharges.some(c => c.chargeTypeMasterId === CROSSING_BOOKING))
					$('.hideCrossing').hide();
				
				if (!bookingCharges.some(c => c.chargeTypeMasterId === LOADING))
					$('.hideLoading').hide();


				var totalCartage = 0;

				for (var index in bookingCharges) {
					if (bookingCharges[index].chargeTypeMasterId == COMMISSION_CARTAGE || bookingCharges[index].chargeTypeMasterId == RETURN_CARTAGE
						|| bookingCharges[index].chargeTypeMasterId == PICKUP_CARTAGE || bookingCharges[index].chargeTypeMasterId == DILIVERY_CARTAGE
						|| bookingCharges[index].chargeTypeMasterId == MISCELLANEOUS_CARTAGE || bookingCharges[index].chargeTypeMasterId == DROP_CARTAGE
						|| bookingCharges[index].chargeTypeMasterId == LOADING || bookingCharges[index].chargeTypeMasterId == CARTAGE_CHARGE
					)
						totalCartage += bookingCharges[index].wayBillBookingChargeChargeAmount;

					if (totalCartage != 0)
						$('.scTotalCartCharges_466').removeClass('hide');

					if (bookingCharges[index].chargeTypeMasterId == FUEL_SURCHARGE && bookingCharges[index].wayBillBookingChargeChargeAmount != 0)
						$('.scFuelCharges_466').removeClass('hide');

					if (bookingCharges[index].chargeTypeMasterId == DOCUMENT && bookingCharges[index].wayBillBookingChargeChargeAmount != 0)
						$('.scDocCharges_466').removeClass('hide');

					if (bookingCharges[index].chargeTypeMasterId == VALUATION && bookingCharges[index].wayBillBookingChargeChargeAmount != 0)
						$('.scValCharges_466').removeClass('hide');

					if (bookingCharges[index].chargeTypeMasterId == EXPRESS && bookingCharges[index].wayBillBookingChargeChargeAmount != 0)
						$('.expressCharge_269').removeClass('hide');

					if (bookingCharges[index].chargeTypeMasterId == OTHER_BOOKING && bookingCharges[index].wayBillBookingChargeChargeAmount != 0)
						$('.otherCharge_269').removeClass('hide');

					if (bookingCharges[index].chargeTypeMasterId == LOADING && bookingCharges[index].wayBillBookingChargeChargeAmount != 0)
						$('.loadingCharge_343').removeClass('hide');

					if (bookingCharges[index].chargeTypeMasterId == CARTAGE_CHARGE && bookingCharges[index].wayBillBookingChargeChargeAmount != 0)
						$('.cartageCharge_343').removeClass('hide');

					if (bookingCharges[index].chargeTypeMasterId == DILIVERY_CARTAGE && bookingCharges[index].wayBillBookingChargeChargeAmount != 0)
						$('.deliveryCartageCharge_343').removeClass('hide');

					if (bookingCharges[index].chargeTypeMasterId == LOADING && bookingCharges[index].wayBillBookingChargeChargeAmount != 0)
						$('.loadingChargeMtl').removeClass('hide');
					else
						$('.handlingChargeMtl').removeClass('hide');
						
					if (bookingCharges[index].chargeTypeMasterId == OTHER_BOOKING && bookingCharges[index].wayBillBookingChargeChargeAmount != 0)
						$('.otherchargeSES').removeClass('hide');
				}

				let str = responseOut.wayBillTypeName;
				const commonString = "(MANUAL)";
				const extractedString = str.replace(commonString, "");
				
				if(responseOut.wayBillIsManual)
					$("*[data-lr='lrTypeApex']").html((extractedString) + ' (MANUAL)');
				else
					$("*[data-lr='lrTypeApex']").html((extractedString).toUpperCase());

				$("*[data-lr='lrTypeWithoutManualWord']").html((extractedString).toUpperCase());
				$("*[data-lr='lrType']").html((responseOut.wayBillTypeName).toUpperCase());
				$("*[data-lr='grandTotalKRL']").html(Math.round(responseOut.bookingTotal));
				$("*[data-lr='totalCartageAmount']").html(totalCartage);
					
				if (wayBillTypeId == WAYBILL_TYPE_CREDIT) {
					$(".showTBB").removeClass('hide');
					//$(".showTBBLable").removeClass('hide');
					$(".showChargeSTL").hide();
					$(".otherCharges").hide();
					$(".hideTotal").hide();
					$(".hideChargesTBBsapan").hide();
					$(".hideChargesTBBSKLC").hide();
					$(".showZero").show();
					$('.tbbCheckbox').prop('checked', true);
					$("*[data-lr='lrTypeForNRT']").html('ON_CREDIT');
					$("*[data-lr='lrTypeSDK']").html("ON A/C");
				} else {
					$(".hideChargesTBBSKLC").show();
					$(".showZero").hide();
					$("*[data-lr='lrTypeForNRT']").html((responseOut.wayBillTypeName).toUpperCase());
					$("*[data-lr='lrTypeSDK']").html((responseOut.wayBillTypeName).toUpperCase());
				}

				if (wayBillTypeId == WAYBILL_TYPE_TO_PAY) {
					$(".hideChargesForJTM").show();
					$(".hideChargesForMTC").hide();
					$(".showChargeNameForMTC").show();
					$('.topayCheckbox').prop('checked', true);
				} else {
					$(".hideChargesForJTM").hide();
					$(".hideChargesForMTC").show();
					$(".showChargeNameForMTC").hide();
				}	
					
				if (wayBillTypeId == WAYBILL_TYPE_PAID) {
					$(".hidePaymentModeforBLPL").show();
					$("*[data-lr='grandTotalForGGS']").html(Math.round(responseOut.bookingTotal - responseOut.tdsAmount));
					$("*[data-lr='bookingReceived1']").html(bookingTotal);
					$("*[data-lr='paymentTypeKHTC']").html("(" + responseOut.paymentTypeName + ")");
					$("*[data-lr='paymentTypeSRE']").html(responseOut.paymentTypeName);

					$(".showDoorDeliveryForPaid").show();
					$(".hidePaid").removeClass('hide');

					if (responseOut.consignmentSummaryPaymentType == PAYMENT_TYPE_CREDIT_ID) {
						$("*[data-lr='lrTypeOnPaymentType']").html('Credit');
						$("*[data-lr='lrType']").html((responseOut.wayBillTypeName).toUpperCase() + '- A/C');
						$("*[data-lr='lrTypeWithoutManualWord']").html((responseOut.wayBillTypeName).toUpperCase() + '- A/C');

						//START :: Advance and Balance Calculation for Abbas LR Print - Ravi Prajapati
						if ((bookingTotal - receivedAmount) == 0) {
							$("*[data-lr='bookingReceived']").html('0');
							$("*[data-lr='bookingBalance']").html('0');
						} else {
							$("*[data-lr='bookingReceived']").html(receivedAmount);
							$("*[data-lr='bookingBalance']").html(bookingTotal - receivedAmount);
						}
					}

					//work for KSC For Show Freight Amount If Way dy Type is Paid
					if (config.showFrieghtChargeInsteadOfGranndTotal) {
						$("#FrieghtValue").removeClass('hide');
						$("#grandTotal").addClass('hide');
					}

					$("*[data-lr='consignorFreightTotal']").html(Math.round(responseOut.bookingTotal));
					$("*[data-lr='consigneeFreightTotal']").html("PAID");
					$("*[data-lr='driverFreightTotal']").html("PAID");

					if (responseOut.consignmentSummaryPaymentType == PAYMENT_TYPE_CASH_ID)
						$("*[data-lr='lrTypeOnPaymentType']").html(responseOut.wayBillTypeName);
					else if (responseOut.consignmentSummaryPaymentType == PAYMENT_TYPE_CHEQUE_ID)
						$("*[data-lr='lrTypeOnPaymentType']").html(responseOut.wayBillTypeName + ' (CHQ)');

					if (responseOut.chequeNumber != undefined && responseOut.chequeNumber != 'undefined') {
						$("*[data-lr='chequeNumberOnlyForPaid']").html(responseOut.chequeNumber);
						$("*[data-lr='chequeNumber']").html(responseOut.chequeNumber);
						$('.chequeLabel').html("Cheque No:");
						$('.chequeNumber').html(responseOut.chequeNumber);
					}
					$('.paidCheckbox').prop('checked', true);
					
				} else {
					$("*[data-lr='lrTypeOnPaymentType']").html(responseOut.wayBillTypeName);
					$("*[data-lr='bookingReceived']").html('0');
					$("*[data-lr='bookingBalance']").html('0');
					$(".showDoorDeliveryForPaid").hide();
				}

				var paidCharge = 0;

				if (wayBillTypeId == WAYBILL_TYPE_TO_PAY) {
					$("*[data-lr='grandTotalForGGS']").html(Math.round(responseOut.bookingTotal - responseOut.tdsAmount));
					$("*[data-lr='lrDestinationBranch']").html('/' + wayBillDestinationBranchName);

					var bookingCharges = responseOut.waybillBookingChargesList

					for (var index in bookingCharges) {
						if (bookingCharges[index].chargeTypeMasterId == PAID_HAMALI)
							paidCharge += bookingCharges[index].wayBillBookingChargeChargeAmount;
					}
					$(".hideChargeForSRK").hide();
					$(".lrTypeTable").removeClass('hide');

					$("*[data-lr='consignorFreightTotal']").html(Math.round(responseOut.bookingTotal));
					$("*[data-lr='consigneeFreightTotal']").html(Math.round(responseOut.bookingTotal));
					$("*[data-lr='driverFreightTotal']").html(Math.round(responseOut.bookingTotal));
					$(".chequenumberhide").hide();
				} else {
					$(".hamali").removeClass('hide');
					$(".paidHamali").addClass('hide');
				}

				$("*[data-lr='maheshCargoGrandTotal']").html(Math.round(responseOut.bookingTotal - paidCharge));
				$("*[data-lr='maheshCargoGrandTotalInWord']").html(convertNumberToWord(Math.round(responseOut.bookingTotal - paidCharge)));

				if (wayBillTypeId == WAYBILL_TYPE_CREDIT) {
					$("*[data-lr='grandTotalForGGS']").html(Math.round(responseOut.bookingTotal - responseOut.tdsAmount));
					//for Abbas
					$("*[data-lr='lrTypeWithSourceSubRegion']").html((responseOut.wayBillTypeName).toUpperCase() + '&nbsp;at ' + (wayBillSourceSubregionName));
					$("*[data-lr='lrType_TBBLabel']").html('TBB');
					$("*[data-lr='rateConfiguredChargedWeight']").html(responseOut.actualWeight);

					$("*[data-lr='consignorFreightTotal']").html("TBB");
					$("*[data-lr='consigneeFreightTotal']").html("TBB");
					$("*[data-lr='driverFreightTotal']").html("TBB");

					$("*[data-lr='billingPartyGstn']").html(responseOut.billingPartyGstn);
					$("*[data-lr='BillingPartyName']").html(responseOut.billingPartyName);
					$("*[data-lr='BillingPartyNamewithLabel']").html('Billing Party Name : ' + responseOut.billingPartyName);
					$(".billingPartyNamewithLabel").removeClass('hide');
					$("*[data-lr='wayBillPartyName']").html(responseOut.wayBillPartyName);


					$("*[data-lr='grandTotalWithoutTBB']").html('TBB');
					$(".chequenumberhide").hide();
				} else {
					$("*[data-lr='lrTypeWithSourceSubRegion']").html((responseOut.wayBillTypeName).toUpperCase());
					$("*[data-lr='lrType_TBBLabel']").html((responseOut.wayBillTypeName).toUpperCase());
					$("*[data-lr='rateConfiguredChargedWeight']").html(responseOut.chargedWeight);

					$(".billingParty").hide();

					$("*[data-lr='grandTotalWithoutTBB']").html(responseOut.bookingTotal);
				}

				if (wayBillTypeId == WAYBILL_TYPE_CREDIT)
					$(".hidelabelfordlsexpress").hide();
					
				//for Bhaskar hide LR Rate
				if (config.hideLrRateWhenLrTypeIsTBB) {
					if (wayBillTypeId == WAYBILL_TYPE_CREDIT)
						$(".Rate").addClass('hide');
					else
						$(".Rate").html(responseOut.articleRate);
				}

				if (responseOut.transportationModeName != "null" && responseOut.transportationModeName != null && responseOut.transportationModeName != undefined)
					$("*[data-lr='transportationModeName']").html(responseOut.transportationModeName);
					
           let transportationModeNameId = 'transportationMode'+responseOut.transportationModeId
				const checkboxes = document.querySelectorAll(`.${transportationModeNameId}`);
				checkboxes.forEach(checkbox => {
					checkbox.checked = true;
				});

				var isRePrint = responseOut.isReprint;

				if (isRePrint) {
					$("*[data-lr='lrTypeWithDuplicateKeyword']").html("( Duplicate )");
					$("*[data-lr='lrTypeWithDuplicateAndOrignalKeyword']").html("( Duplicate )");
					$('.hideCopyForReprint').hide();
				} else {
					$("*[data-lr='lrTypeWithDuplicateKeyword']").html(" ");
					$("*[data-lr='lrTypeWithDuplicateAndOrignalKeyword']").html("( Original )");
				}

				if (!whitespace.test(wayBillRemark) || wayBillRemark == '')
					$('.remarksection').hide();

				if (wayBillRemark != undefined && wayBillRemark != '') {
					$("*[data-lr='remark']").html(wayBillRemark);
					$("*[data-lr='remarkSubString']").html(wayBillRemark.substring(0, 20));
				}

				$("*[data-lr='otherRemark']").html(responseOut.wayBillOtherRemark);

				if (deliveryToString == "select")
					$("*[data-lr='deliveryTo']").html("");
				else
					$("*[data-lr='deliveryTo']").html(deliveryToString);
				if (responseOut.deliveryTo == DELIVERY_TO_DOOR_ID) {
					$("*[data-lr='deliveryToDoorDelivery']").html('Door Delivery');
					$("*[data-lr='delDoor']").html('at Ground Floor-Unload By Party');
					$("*[data-lr='deliveryToCustom']").html('Door Delivery');
					$("*[data-lr='deliveryToCustomMsg']").html('If LR booked for Door Delivery then Door delivery service will be provided for Ground floor only');

					//for printing godown address if delivery at GODOWN and bold letters for others -Ashish Maurya
					$("*[data-lr='deliveryToDoorDeliverybold']").html('<b>DOOR DELIVERY</b>');
					$("*[data-lr='deliveryToDoorLabel']").html('<b>-DOOR</b>'); // used for LMT
				} else if (responseOut.deliveryTo == DELIVERY_TO_BRANCH_ID) {
					$("*[data-lr='deliveryToDoorDelivery']").html('Transport Godown');
				} else {
					$("*[data-lr='deliveryToDoorDelivery']").html(deliveryToString);
				}
				//end

				if (responseOut.deliveryTo == DELIVERY_TO_DOOR_ID) {
					$("*[data-lr='delivery_at']").html('Door Delivery');
					$("*[data-lr='delivery_address']").html('Door Delivery');
					$("*[data-lr='delivery_addressmlt']").html('DOOR DELIVERY');
					
					$("*[data-lr='delveryAtforSipl']").html(responseOut.consigneeAddress);
				} else if (responseOut.deliveryTo == DELIVERY_TO_BRANCH_ID) {
					$("*[data-lr='delivery_at']").html('Office Delivery');
					$("*[data-lr='delivery_address']").html('Godown Delivery');
					$("*[data-lr='delivery_addressmlt']").html('GODOWN DELIVERY');
					$("*[data-lr='delveryAtforSipl']").html(responseOut.wayBillDestinationBranchAddress);
				} 

				if (responseOut.deliveryTo == DELIVERY_TO_TRUCK_DELIVERY_ID)
					$("*[data-lr='deliveryToDoorDeliverytruck']").html('<b>TRUCK DELIVERY</b>');

				//end
				if (consignmentSummaryDeliveryToAddress == undefined || typeof consignmentSummaryDeliveryToAddress == 'undefined')
					consignmentSummaryDeliveryToAddress = "--";

				$(".showAddress").hide();

				if (responseOut.deliveryTo == DELIVERY_TO_BRANCH_ID) {
					$("*[data-lr='deliveryToGod']").html('Godown');
					$("*[data-lr='deliveryToGodown']").html(consignmentSummaryDeliveryToAddress);
					$("*[data-lr='deliveryToBranchAddress']").html(consignmentSummaryDeliveryToAddress);
					$("*[data-lr='deliveryToCustom']").html('Godown Delivery');
					$(".address").removeClass("hide");
					$(".showAddress").show();
					var destBranchContactNo = "--";
					var destBranchMobileNo = "--";
					wayBillDestinationBranchPhoneNumber = "--";

					if (typeof responseOut.wayBillDestinationBranchPhoneNumber != 'undefined')
						wayBillDestinationBranchPhoneNumber = responseOut.wayBillDestinationBranchPhoneNumber;

					if (consignmentSummaryDeliveryToContact != undefined) {
						var replacedString = consignmentSummaryDeliveryToContact.replace('-', '');

						if (zerosReg.test(replacedString))
							$("*[data-lr='deliveryToBranchAddresswithphone']").html(consignmentSummaryDeliveryToAddress + ' (' + consignmentSummaryDeliveryToContact + ')');
						else
							$("*[data-lr='deliveryToBranchAddresswithphone']").html(consignmentSummaryDeliveryToAddress);

						$("*[data-lr='deliveryToBranchAddresswithphoneAndMobileBoth']").html(consignmentSummaryDeliveryToAddress + '' + consignmentSummaryDeliveryToContact + '' + ',' + wayBillDestinationBranchPhoneNumber);
						$("*[data-lr='deliveryToBranchAddresswithphoneAndMobile']").html(consignmentSummaryDeliveryToAddress + ' (' + consignmentSummaryDeliveryToContact + ')' + ',' + wayBillDestinationBranchPhoneNumber);
						$("*[data-lr='deliveryToBranchPhoneAndMobileBoth']").html(wayBillDestinationBranchPhoneNumber + ',' + consignmentSummaryDeliveryToContact);
						$("*[data-lr='deliverymobileNo']").html(wayBillDestinationBranchMobileNumber);
						destBranchContactNo = consignmentSummaryDeliveryToContact;
						destBranchMobileNo = wayBillDestinationBranchMobileNumber;


						if (zerosReg.test(consignmentSummaryDeliveryToContact))
							$("*[data-lr='deliveryToContact']").html(consignmentSummaryDeliveryToContact);
						else
							$("*[data-lr='deliveryToContact']").html("-");
					}
					let phone = wayBillDestinationBranchPhoneNumber ?? " ";
					
					$("*[data-lr='deliveryToCustomBranchAddress']").html(consignmentSummaryDeliveryToAddress);
					$("*[data-lr='deliveryToCustomBranchAddress2']").html(consignmentSummaryDeliveryToAddress + "," + destBranchMobileNo + ", " + destBranchContactNo + " (" + responseOut.wayBillDestinationBranchContactPerson + ") ");
					$("*[data-lr='deliveryToCustomBranchAddress4']").html(consignmentSummaryDeliveryToAddress + "," + destBranchMobileNo + ", " + phone + " (" + responseOut.wayBillDestinationBranchContactPerson + ") ");
					$("*[data-lr='deliveryToCustomBranchAddress3']").html(consignmentSummaryDeliveryToAddress + "," + wayBillDestinationBranchPhoneNumber + " (" + responseOut.wayBillDestinationBranchContactPerson + ") ");
					$("*[data-lr='deliveryToCustomBranchAddress5']").html(consignmentSummaryDeliveryToAddress + "," + destBranchMobileNo + " (" + responseOut.wayBillDestinationBranchContactPerson + ") ");
					$("*[data-lr='deliveryToCustomBranchAddress7']").html(consignmentSummaryDeliveryToAddress + "," + destBranchMobileNo + ", " + wayBillDestinationBranchPhoneNumber + "");
					$("*[data-lr='deliveryToCustomBranchAddress8']").html(consignmentSummaryDeliveryToAddress + "," + destBranchContactNo + " (" + responseOut.wayBillDestinationBranchContactPerson + ") ");

				} else if (responseOut.deliveryTo == DELIVERY_TO_DOOR_ID || responseOut.deliveryTo == DELIVERY_TO_TRUCK_DELIVERY_ID) {
					$("*[data-lr='deliveryToCustomBranchAddress']").html(DELIVERY_TO_DOOR_NAME);
					$("*[data-lr='deliveryToCustomBranchAddress2']").html('Door Delivery');
					$("*[data-lr='deliveryToCustomBranchAddress3']").html('Door Delivery');
					$("*[data-lr='deliveryToCustomBranchAddress4']").html('Door Delivery');
					$("*[data-lr='deliveryToCustomBranchAddress5']").html('Door Delivery');
					$("*[data-lr='deliveryToCustomBranchAddress8']").html('Door Delivery');
				} else {
					$(".conditionalDelToAddr").hide();
				}

				if (config.isSetDeliveryToWithBranchName) {
					if (responseOut.deliveryTo == DELIVERY_TO_BRANCH_ID && wayBillDestinationBranchName != undefined)
						$("*[data-lr='deliveryToGodownWithBranch']").html(wayBillDestinationBranchName.toUpperCase() + " - " + deliveryToString);
					else if (responseOut.deliveryTo == DELIVERY_TO_DOOR_ID)
						$("*[data-lr='deliveryToGodownWithBranch']").html("Door Delivery");
					else
						$("*[data-lr='deliveryToGodownWithBranch']").html(deliveryToString);
				}

				// for sangam 
				if(responseOut.wayBillTypeId == WAYBILL_TYPE_PAID)
					$('.paidcheckmark').text('✔')
				else if (responseOut.wayBillTypeId ==  WAYBILL_TYPE_TO_PAY)
					$('.topaycheckmark').text('✔')
				else if(responseOut.wayBillTypeId == WAYBILL_TYPE_CREDIT)
					$('.tbbcheckmark').text('✔')
				
				if(responseOut.deliveryTo == DELIVERY_TO_DOOR_ID)
					$('.Doorcheckmark').text('✔')
				else if(responseOut.deliveryTo == GODOWN)
					$('.Godwancheckmark').text('✔')
				
				$("*[data-lr='deliveryToAddress']").html(consignmentSummaryDeliveryToAddress);
				$("*[data-lr='totalQuantity']").html(responseOut.consignmentSummaryQuantity);
				$("*[data-lr='vehicleNumber']").html(responseOut.vehicleNumber != undefined ? responseOut.vehicleNumber : "--");
				$("*[data-lr='vehicleNumberFTL']").html(responseOut.vehicleNumber != "" ? " (" + responseOut.vehicleNumber + ")" : "( -- )");

				if (responseOut.vehicleNumber != "") {
					$('.vehicleNoForFTL').show();
					$('.vehicleNoForOther').hide();
				} else {
					$('.vehicleNoForOther').show();
					$('.vehicleNoForFTL').hide();
				}

				if (responseOut.bookingTypeId == BOOKING_TYPE_FTL_ID){
					$("*[data-lr='vehicleNumberOnFtl']").html(responseOut.vehicleNumber != undefined ? responseOut.vehicleNumber : "--");
					$('.showVehicalTypeAndNumber').show()
				}
				
				if(responseOut.bookingTypeId == BOOKING_TYPE_FTL_ID || responseOut.bookingTypeId == DIRECT_DELIVERY_DIRECT_VASULI_ID )
					$('.showVehicalTypeAndNumberForSANNIDHI').show()

				if (config.showVehicleTypeName && responseOut.bookingTypeId == BOOKING_TYPE_FTL_ID) {
					if (responseOut.vehicleTypeName != undefined) {
						$("*[data-lr='vehicleType']").html(responseOut.vehicleTypeName);
						$("*[data-lr='chargedWeight']").html(responseOut.vehicleTypeName);
					} else
						$("*[data-lr='vehicleType']").html("--");
				} else
					$("*[data-lr='vehicleType']").html("--");

				if (responseOut.vehicleTypeName != undefined && responseOut.vehicleTypeName != null && responseOut.vehicleTypeName !=  '--Truck Type--')
					$("*[data-lr='vehicleTypeNameForAllBookingType']").html(responseOut.vehicleTypeName);
					
				var billSelectionId = responseOut.billSelectionId;

				if (billSelectionId == BOOKING_WITHOUT_BILL) {
					$("*[data-selector='forCompanyName']").remove();
					$("*[data-selector='gstn']").remove();
					$("*[data-account='gstn']").remove();
					$('.showHeaderInWithBill').hide()
					$('.withBillTable').remove()
					$(".hideGSTandTaxPaidBy").remove();

				}
				
				$("*[data-charLimit]").html(this.charLimit());

				$("*[data-lr='bookedByExecutive']").html(responseOut.wayBillBookedBy);
				$("*[data-lr='additionalRemark']").html(responseOut.additionalRemark != undefined ? responseOut.additionalRemark : "");

				if ($("*[data-lr='totalQuantityInWord']").length != 0)
					$("*[data-lr='totalQuantityInWord']").html(convertNumberToWord(responseOut.consignmentSummaryQuantity));

				if (responseOut.freightUptoBranch == "--")
					$("*[data-selector='lrFreightUpto']").remove();
				else
					$("*[data-lr='lrFreightUpto']").html(responseOut.freightUptoBranch);

				if (config.removeRemarkLabel && wayBillRemark == '') {
					$("*[data-selector='remark']").remove();
					$("*[data-lr='remark']").remove();
				}

				if (config.removeInvoiceLable && responseOut.invoiceNumber == '') {
					$("*[data-selector='invoiceNo']").remove();
					$("*[data-lr='consignorInvoiceNo']").remove();
				}

				if (config.removeServiceTaxLable && responseOut.consignmentSummaryTaxByString == "--") {
					$("*[data-selector='serviceBy']").remove();
					$("*[data-lr='taxPaidBy']").remove();

					if (Number(responseOut.bookingTimeServiceTax) == 0) {
						$("*[data-selector='rupee']").remove();
						$("*[data-lr='bookingServicetax1']").remove();
						$("*[data-lr='bookingServicetaxForCspl']").remove();
					}
				}

				if (Number(responseOut.bookingTimeServiceTax) == 0)
					$(".servicetaxlabel").remove();

				if (responseOut.freightUptoBranchMobileNo != undefined)
					$("*[data-lr='frghtUptoBranchContactDetail']").html(responseOut.freightUptoBranchMobileNo);

				if ($("*[data-lr='grandTotalInWord']").length != 0) {
					if (config.showDecimalValueForGrandTotal == true || config.showDecimalValueForGrandTotal)
						$("*[data-lr='grandTotalInWord']").html(convertNumberToWord(responseOut.bookingTotal));
					else
						$("*[data-lr='grandTotalInWord']").html(convertNumberToWord(Math.round(responseOut.bookingTotal)));
				}

				if (responseOut.consignmentSummaryPaymentType > 0)
					$("*[data-lr='PaymentType']").html(responseOut.paymentTypeName);

				$("*[data-lr='txnWiseEngb']").html(responseOut.consignmentSummaryPaymentType != PAYMENT_TYPE_CHEQUE_ID ? 'Txn No : ' : 'Chq No : ');

				if (responseOut.bankName != undefined && responseOut.bankName != 'undefined')
					$("*[data-lr='bankName']").html(responseOut.bankName);

				$("*[data-lr='serviceTypeName']").html(responseOut.serviceTypeName != undefined ? responseOut.serviceTypeName : "--");
				
				this.setSTPaidByDetails(responseOut);
				this.setBookingCharges(responseOut);
				
				if (responseOut.isDeliveryTimeTBB != undefined && responseOut.isDeliveryTimeTBB) {
					let unoadingAmount	= responseOut.unoadingAmount;
					
					//Delivery Charges 
					if (unoadingAmount != undefined) {
						$("*[data-lr='unloading']").html(unoadingAmount);
						$("*[data-lr='grandTotalWithUnloading']").html(responseOut.bookingTotal + unoadingAmount);
					}
					
					$('.showChargesWithUnloading').show();
				} else
					$('.showChargesWithoutUnloading').show();

				$("[data-lr='insurancePolicyNumber']").html(responseOut.insurancePolicyNumber);
				if (responseOut.temperature != null && responseOut.temperature != undefined)
					$("[data-lr='temperature']").html(responseOut.temperature.replace(/\uFFFD/g, "\u00B0")); 
				$("[data-lr='forwardTypeName']").html(responseOut.forwardTypeName);
				$("[data-lr='declarationTypeName']").html(responseOut.declarationTypeName);
				$("[data-lr='consignmentHsnCode']").html(responseOut.hsnCode);
				$("[data-lr='connectivityTypeName']").html(responseOut.connectivityTypeName);
				$("[data-lr='dataLoggerNumber']").html(responseOut.dataLoggerNumber);
				
				
				// first  all  divisions hide 
				$('[class*="divisionSection"], [class^="defaultDivision"]').hide();
				
				// dynamic class genrated for show division part
				let divisionClass = divisionId == 0 ? 'defaultDivision0' : 'divisionSection' + divisionId;
				$('.' + divisionClass).show();


			}, setSTPaidByDetails: function(responseOut) {
				var STPaidBy = responseOut.STPaidBy;
				var config = responseOut.configuration;
				var consigneeName = responseOut.consigneeName;
				var consignorName = responseOut.consignorName;

				$("*[data-lr='taxPaidBy']").html(responseOut.consignmentSummaryTaxByString);
				$("*[data-lr='stPaidBy']").html(responseOut.consignmentSummaryTaxByString);
			
				if (STPaidBy == TAX_PAID_BY_CONSINGOR_ID) {
					$("*[data-lr='consignAndAmt']").html(responseOut.consignmentSummaryTaxByString + ' ( Rs. ' + responseOut.bookingTimeUnAddedTaxAmount + ' )');
					$("*[data-lr='stPaidByTaxAmnt']").html(responseOut.bookingTimeUnAddedTaxAmount);
					$("*[data-lr='taxPaidByConsignorConsignee']").html('Consignor/Consignee');
					$("*[data-lr='stPaidByName']").html(consignorName.substring(0, 12) + '..');
					
					if (config.showBranchGSTNByGSTPaidBy)
						$('.branchGSTN').css('display', 'none');

					$('.stConsignee').css('display', 'none');
					$('.stTransporter').css('display', 'none');

					$("*[data-lr='taxPaidByName']").html('GST Paid By ' + consignorName.substring(0, 20));
					$("*[data-lr='taxPaidByName517']").html(consignorName.substring(0, 20));
					$("*[data-lr='taxPaidBySSTPL']").html("YES");

					if (config.customGroupLabel || config.customGroupLabel == true) {
						$("*[data-lr='consignorYes']").html('YES');
						$('.stPaidByLabel').html("Consignor :");
						$('.stPaidByValue').html("YES");
					}
				} else if (STPaidBy == TAX_PAID_BY_CONSINGEE_ID) {
					$("*[data-lr='consignAndAmt']").html(responseOut.consignmentSummaryTaxByString + ' ( Rs. ' + responseOut.bookingTimeUnAddedTaxAmount + ' )');
					$("*[data-lr='stPaidByTaxAmnt']").html(responseOut.bookingTimeUnAddedTaxAmount);
					$("*[data-lr='taxPaidByConsignorConsignee']").html('Consignor/Consignee');
					$("*[data-lr='stPaidByName']").html(consigneeName.substring(0, 12) + '..');

					if (config.showBranchGSTNByGSTPaidBy)
						$('.branchGSTN').css('display', 'none');

					$('.stConsignor').css('display', 'none');
					$('.stTransporter').css('display', 'none');

					$("*[data-lr='taxPaidByName']").html('GST Paid By ' + consigneeName.substring(0, 20));
					$("*[data-lr='taxPaidByName517']").html(consigneeName.substring(0, 20));
					$("*[data-lr='taxPaidBySSTPL']").html("YES");

					if (config.customGroupLabel || config.customGroupLabel == true) {
						$("*[data-lr='consigneeYes']").html('YES');
						$('.stPaidByLabel').html("Consignee :");
						$('.stPaidByValue').html("YES");
					}
				} else if (STPaidBy == TAX_PAID_BY_TRANSPORTER_ID) {
					$("*[data-lr='serviceTaxPaidBy']").html(responseOut.consignmentSummaryTaxByString);
					$("*[data-lr='consignAndAmt']").html(responseOut.consignmentSummaryTaxByString);
					$("*[data-lr='stPaidByTaxAmnt']").html("0");
					$("*[data-lr='stPaidByName']").html("Transporter");

					$('.stConsignor').css('display', 'none');
					$('.stConsignee').css('display', 'none');

					$("*[data-lr='taxPaidByName']").html("GST Paid By Transporter");
					$("*[data-lr='taxPaidByName517']").html(" Transporter");
					$("*[data-lr='taxPaidBySSTPL']").html("No");

					if (config.customGroupLabel || config.customGroupLabel == true) {
						$('.stPaidByLabel').html("Transporter :");
						$('.stPaidByValue').html("YES");
					}
				} else {
					$('.stConsignor').css('display', 'none');
					$('.stConsignee').css('display', 'none');
					$('.stTransporter').css('display', 'none');
				}
				
				if(STPaidBy == TAX_PAID_BY_EXEMPTED_ID)
					$("*[data-lr='taxPaidBySSTPL']").html("NO/Exempted");

				if (STPaidBy == TAX_PAID_BY_NOT_APPLICABLE_ID)
					$("*[data-lr='taxPaidByName']").html("GST Paid By Not Applicable");
				$("*[data-lr='taxPaidByName517']").html(" Not Applicable");
				
				
				 if(responseOut.bookingTotal == 0)
					$("*[data-lr='taxPaidByCnorOrCnee']").html("As per government noms");
				else
					$("*[data-lr='taxPaidByCnorOrCnee']").html(responseOut.consignmentSummaryTaxByString);

				if (responseOut.serviceTaxString != undefined) {
					$("*[data-lr='serviceTaxString']").html(responseOut.serviceTaxString);
					$("*[data-lr='serviceTaxStringg']").html('GST Paid By ' + responseOut.consignmentSummaryTaxByString);
				}
				
				if(responseOut.bookingTotal == 0)
					$("*[data-lr='taxPaidByOnWayBillType']").html("As per government noms");
				else if(responseOut.wayBillTypeId == WAYBILL_TYPE_PAID || responseOut.wayBillTypeId == WAYBILL_TYPE_CREDIT)
					$("*[data-lr='taxPaidByOnWayBillType']").html("Consignor");
				else if(responseOut.wayBillTypeId == WAYBILL_TYPE_TO_PAY)		
					$("*[data-lr='taxPaidByOnWayBillType']").html("Consignee");
			}, setBookingCharges: function(responseOut) {
				var classNameofName = $("*[data-chargename='dynamic']").attr('class');
				var styleOfName = $("*[data-chargename='dynamic']").attr('style');
				var classNameofVal = $("*[data-chargevalue='dynamic']").attr('class');
				var styleOfVal = $("*[data-chargevalue='dynamic']").attr('style');
				var configuration = responseOut.configuration;
				var wayBillTypeId = responseOut.wayBillTypeId;
				var freight = 0;
				var grandtotal = 0; 
				var noOfChargesToPrint = configuration.noOfChargesToPrint;
				var chargeTypeModelArr = responseOut.chargeTypeModelArr;
				var packingTypeMasterId = responseOut.packingTypeMasterId;
				
				if (configuration.removeStaticChargesTrWithZeroAmt) {
					responseOut.waybillBookingChargesList = (responseOut.waybillBookingChargesList).filter(obj => { return obj.wayBillBookingChargeChargeAmount > 0;});
				}

				var sortedBookingChargeList = _.sortBy(responseOut.waybillBookingChargesList, 'wayBillBookingChargeSequenceNumber');

				if (configuration.showZeroAmountInLr && responseOut.executiveType != EXECUTIVE_TYPE_GROUPADMIN && wayBillTypeId == WAYBILL_TYPE_CREDIT)
					sortedBookingChargeList = '';

				var tbody = $("*[data-chargevalue='dynamic']").parent().parent();
				if (configuration.isFromIVEditor) {
					tbody = $("*[data-chargevalue='dynamic']").closest("tr");
				}

				let visibleFreightAmount = this.getVisibleRate(responseOut);
				
				var chargeIdList = (configuration.chargesToAddInFreightCharge || "").split(',').map(Number);

				var freightExtra = 0;
				
				for (let charge of sortedBookingChargeList) {
				    if (chargeIdList.includes(charge.chargeTypeMasterId) && charge.chargeTypeMasterId != FREIGHT) {
				        freightExtra += Number(charge.wayBillBookingChargeChargeAmount || 0);
				    }
				}
				
				for (var index in sortedBookingChargeList) {
					if (configuration.printLimitedCharges && index == Number(noOfChargesToPrint))
						break;
						
					let charge = sortedBookingChargeList[index];
					
				    if (chargeIdList.includes(charge.chargeTypeMasterId) && charge.chargeTypeMasterId != FREIGHT) {
				        continue;
				    }
					
					var newtr = $("<tr/>")
					
					var newtdChargename = $("<td></td>");
					newtdChargename.attr("class", classNameofName);
					newtdChargename.attr("style", styleOfName);
					
					if(accountGroupId == ACCOUNT_GROUP_ID_GURUKRUPA || accountGroupId == ACCOUNT_GROUP_ID_INDIA) {
						if(sortedBookingChargeList[index].chargeTypeMasterId != FREIGHT)
							newtdChargename.attr("data-selector", 'chargeName' + sortedBookingChargeList[index].chargeTypeMasterId);
					}else if(configuration.chargesAddInFreightCharge){
						newtdChargename.attr("data-selector", 'chargeName' + charge.chargeTypeMasterId);
					} else
						newtdChargename.attr("data-selector", 'chargeName' + sortedBookingChargeList[index].chargeTypeMasterId);
						
					newtr.append(newtdChargename);
					
					if(accountGroupId == ACCOUNT_GROUP_ID_SRLOGISTICS || accountGroupId == ACCOUNT_GROUP_ID_KONDUSKAR_S_R_TRAVELS) {
						var newtdDash = $("<td>-</td>");
						newtr.append(newtdDash);
					}
					
					var newtdChargeVal = $("<td></td>");
					newtdChargeVal.attr("class", classNameofVal);
					newtdChargeVal.attr("style", styleOfVal);
					
					let finalValue = charge.wayBillBookingChargeChargeAmount || 0;
				    if (charge.chargeTypeMasterId == FREIGHT) {
				        finalValue = Number(finalValue) + freightExtra; // Add extra charges into Freight
				    }

					if(accountGroupId == ACCOUNT_GROUP_ID_GURUKRUPA || accountGroupId == ACCOUNT_GROUP_ID_INDIA) {
						if(sortedBookingChargeList[index].chargeTypeMasterId != FREIGHT)
							newtdChargeVal.attr("data-selector", 'chargeValue' + sortedBookingChargeList[index].chargeTypeMasterId);
					}else if(configuration.chargesAddInFreightCharge){
						newtdChargeVal.text(finalValue);
					} else
						newtdChargeVal.attr("data-selector", 'chargeValue' + sortedBookingChargeList[index].chargeTypeMasterId);
					
					newtr.append(newtdChargeVal);

					$(tbody).before(newtr);
				}

				var tbody = $("*[data-chargevaluewithoutname='dynamic']").parent().parent();
				var calculateTotal = 0;

				for (var index in sortedBookingChargeList) {
					if (configuration.printLimitedCharges && index == Number(noOfChargesToPrint))
						break;
						
					var newtr = $("<tr/>")

					var newtdChargename = $("<td></td>");
					newtr.append(newtdChargename);

					var newtdChargeVal = $("<td></td>");
					newtdChargeVal.attr("class", $("*[data-chargevaluewithoutname='dynamic']").attr('class'));
					newtdChargeVal.attr("data-selector", 'chargeValue' + sortedBookingChargeList[index].chargeTypeMasterId);
					newtr.append(newtdChargeVal);

					$(tbody).before(newtr);
				}
				
				var tbody = $("*[data-chargeNameOnly='dynamic']").parent().parent();
				var calculateTotal = 0;

				for (var index in sortedBookingChargeList) {
					if (configuration.printLimitedCharges && index == Number(noOfChargesToPrint))
						break;
					
					var newtr = $("<tr/>")

					var newtdChargename = $("<td></td>");
					newtdChargename.attr("class", $("*[data-chargeNameOnly='dynamic']").attr('class'));
					newtdChargename.attr("data-selector", 'chargeName' + sortedBookingChargeList[index].chargeTypeMasterId);
					newtr.append(newtdChargename);
					
					var newtdChargeVal = $("<td></td>");
					newtr.append(newtdChargeVal);


					$(tbody).before(newtr);
				}
				
				$("*[data-lr='deliveryToForSre']").html('Godown')
				let OtherChargesForslpl = 0;
				for (var index in sortedBookingChargeList) {
					var chargeObj = sortedBookingChargeList[index];

					if (configuration.printLimitedCharges) {
						if (index == Number(noOfChargesToPrint))
							break;

						if (chargeObj.wayBillBookingChargeChargeAmount > 0) {
							calculateTotal += chargeObj.wayBillBookingChargeChargeAmount;
							$("*[data-lr='calculateTotal']").html(calculateTotal);
							$("*[data-lr='sssgrandtotal']").html(calculateTotal);
						}
					}

					let ChargesToPrint = chargeObj.chargeTypeMasterId

					if( ChargesToPrint == OTHER_BOOKING || ChargesToPrint == TRANSHIPMENT_CHARGE  ){
						OtherChargesForslpl += chargeObj.wayBillBookingChargeChargeAmount;
					}

					if (configuration.showDecimalValueAfterCharge)
						$("*[data-lr='calculateTotal']").html(Math.round(calculateTotal) + ".00");
						
					if (chargeObj.chargeTypeMasterDisplayName != undefined)
						$("*[data-selector='chargeName" + chargeObj.chargeTypeMasterId + "']").html(chargeObj.chargeTypeMasterDisplayName);
					else
						$("*[data-selector='chargeName" + chargeObj.chargeTypeMasterId + "']").html(chargeObj.chargeTypeMasterName);
						
					if (configuration.showDecimalValueAfterCharge)
						$("*[data-selector='chargeValue" + chargeObj.chargeTypeMasterId + "']").html(Math.round(chargeObj.wayBillBookingChargeChargeAmount) + ".00");
					else if (configuration.showRoundOffValue)
						$("*[data-selector='chargeValue" + chargeObj.chargeTypeMasterId + "']").html(Math.round(chargeObj.wayBillBookingChargeChargeAmount));
					else if (configuration.showVisibleAmount) {
						if (chargeObj.chargeTypeMasterId == FREIGHT && visibleFreightAmount > 0)
							$("*[data-selector='chargeValue" + chargeObj.chargeTypeMasterId + "']").html(visibleFreightAmount);
						else
							$("*[data-selector='chargeValue" + chargeObj.chargeTypeMasterId + "']").html(chargeObj.wayBillBookingChargeChargeAmount);
					} else
						$("*[data-selector='chargeValue" + chargeObj.chargeTypeMasterId + "']").html(chargeObj.wayBillBookingChargeChargeAmount);

					if (chargeObj.wayBillBookingChargeChargeAmount > 0)
						$(".charge_section_" + chargeObj.chargeTypeMasterId).show();

					if (chargeObj.chargeTypeMasterId == DDC)
						$("*[data-lr='chargeDDCYesNo']").html(chargeObj.wayBillBookingChargeChargeAmount > 0 ? CHARGE_YES_NAME : CHARGE_NO_NAME)
 
					if (chargeObj.chargeTypeMasterId == COLLECTION && chargeObj.wayBillBookingChargeChargeAmount > 0)
						$('.Collectioncheckmark').text('✔')
		
					if (chargeObj.chargeTypeMasterId == DOOR_DELIVERY_BOOKING) {
						if (chargeObj.wayBillBookingChargeChargeAmount > 0)
							$('.doorDeliveryCharges').removeClass('hide');
						else
							$('.doorDeliveryCharges').addClass('hide');
					}

					if (chargeObj.chargeTypeMasterId == ODA)
						$("*[data-lr='chargeODAYesNo']").html(chargeObj.wayBillBookingChargeChargeAmount > 0 ? CHARGE_YES_NAME : CHARGE_NO_NAME);

					if (chargeObj.chargeTypeMasterId == FOV)
						$("*[data-lr='chargeFOVYesNo']").html(chargeObj.wayBillBookingChargeChargeAmount > 0 ? CHARGE_YES_NAME : CHARGE_NO_NAME);

					if (chargeObj.chargeTypeMasterId == DOOR_DELIVERY_BOOKING) {
						if (chargeObj.wayBillBookingChargeChargeAmount > 0)
							$('.doorDeliveryDlyTime').hide();
						else
							$('.doorDeliveryDlyTime').show();
					}
					if (chargeObj.chargeTypeMasterId == DOOR_DELIVERY_BOOKING){
						$("*[data-lr='deliveryToForSre']").html('Door Dly')
					}
						
					if (accountGroupId == ACCOUNT_GROUP_ID_VPT) {
						if (wayBillTypeId == WAYBILL_TYPE_CREDIT) {
							$(".allBkgCharges").hide();
							if (chargeObj.chargeTypeMasterId == DOOR_DELIVERY_BOOKING) {
									$(".ddCharge").show();
							}
						} else {
							$(".allBkgCharges").show();
						}
						$(".thirdCopy .allBkgCharges").show();
					}
				}
					$("*[data-selector='OtherChargesForslpl']").html(OtherChargesForslpl);
				 
				for (var index in chargeTypeModelArr) {
					var chargeObj = chargeTypeModelArr[index];
					
					if (chargeObj.chargeTypeMasterDisplayName != undefined)
						$("*[data-selector='chargeName" + chargeObj.chargeTypeMasterId + "']").html(chargeObj.chargeTypeMasterDisplayName);
						
					if(chargeObj.chargeTypeMasterId == REIMBURSEMENT_OF_INSURANCE_PREMIUM)
						$('.chargeId' + REIMBURSEMENT_OF_INSURANCE_PREMIUM).removeClass('hide');
				}
				
				if(wayBillTypeId == WAYBILL_TYPE_PAID || wayBillTypeId == WAYBILL_TYPE_CREDIT) {
					var gstCalculationForSHARMT = Number(((responseOut.bookingTotal * 2.5) / 100).toFixed(2))	
					$("*[data-lr='gstForSharmaT']").html(gstCalculationForSHARMT);
					
					if(wayBillTypeId == WAYBILL_TYPE_PAID)
						$("*[data-lr='gstPaidByForSharmaT']").html('CONSIGNOR');
					else
						$("*[data-lr='gstPaidByForSharmaT']").html('BILLING PARTY');
					
					$(".hideIGSTForSharmaT").hide();
				} else if(wayBillTypeId == WAYBILL_TYPE_TO_PAY) {
					$("*[data-lr='gstPaidByForSharmaT']").html('CONSIGNEE');
					
					if(responseOut.waybillSourceStateId == responseOut.waybillDestinationStateId) {
						var gstCalculationForSHARMT = Number(((responseOut.bookingTotal * 2.5) / 100).toFixed(2))	
						$("*[data-lr='gstForSharmaT']").html(gstCalculationForSHARMT);
						$(".hideIGSTForSharmaT").hide();
					} else {
						var igstCalculationForSHARMT = Number(((responseOut.bookingTotal * 5) / 100).toFixed(2))
						$("*[data-lr='igstForSharmaT']").html(igstCalculationForSHARMT);
						$(".hideGSTForSharmaT").hide();	
					}
				} else
					$(".hideGstPaidBySharmaT").hide();
				
				if (configuration.onlyGrandTotalPrintForParticularPackingType && (packingTypeMasterId == PACKING_TYPE_LIFFAFA || packingTypeMasterId == PACKING_TYPE_PACKET || packingTypeMasterId == PACKING_TYPE_LETTER))
					$('.hideCharges').hide();
				
				if (configuration.showLRCharge)
					this.setLRCharge(sortedBookingChargeList);

				if (configuration.addCarreirRiskandInsurance)
					this.addCarreirRiskandInsurance(sortedBookingChargeList);

				if (configuration.removeStaticChargesWithZeroAmt) {
					$("#chargesTable tbody tr td").each(function() {
						var tdToRemove = $(this).closest('td');
						// Within td we find the last span child element and get content
						var value = $(this).find("span:last-child").html();

						if ((value != '' || value != undefined) && value == 0)
							tdToRemove.remove();
					});
				}

				if (configuration.removeStaticChargesTrWithZeroAmt) {
					$("#chargeTable tbody tr").each(function() {
						var trToRemove = $(this).closest('tr');
						// Within tr we find the last td child element and get content
						var value = $(this).find("td:last-child").html();

						if ((value != '' || value != undefined) && value == 0)
							trToRemove.remove();
					});
				}

				if (configuration.removeStaticChargesTrWithSpace) {
					$("#chargeTable tbody tr").each(function() {
						var value = $(this).find("td:last-child").html();

						if ((value != '' || value != undefined) && value == 0)
							$(this).find("td:last-child").html(" ");
					});
				}

				$("*[data-chargevalue='dynamic']").closest("tr").remove()
				if (responseOut.dummyWayBillId > 0) {
					$(".dummyClass").css("display", "block");
					$(".freightRow").css("display", "none");
					$(".builtyRow").css("display", "none");
					$(".hummaliRow").css("display", "none");
					$(".aocRow").css("display", "none");
					$(".collectionRow").css("display", "none");
					$(".doorRow").css("display", "none");
					$(".olocRow").css("display", "none");
					$(".crInsureRow").css("display", "none");
					$(".otherRow").css("display", "none");
					$(".carrierRiskRow").css("display", "none");
					$(".bhchgRow").css("display", "none");
					$(".fovRow").css("display", "none");
					$(".cartageRow").css("display", "none");
					$("*[data-lr='grandTotal']").html(0);
				}

				if (wayBillTypeId == WAYBILL_TYPE_CREDIT) {
					$(".freightColumn").html('TBB');
					$(".Column").removeAttr('data-Selector');
					$(".Column").html("");
				}

				if (configuration.removeChargesInDifferentCopies) {
					var allCharges = $(".ChargeRow");
					for (var eleCharge = 0; eleCharge < allCharges.length; eleCharge++) {

						if (allCharges[eleCharge] != undefined) {
							var id = allCharges[eleCharge].offsetParent.id;

							if (configuration.removeChargesFromThirdCopyOfToPay) {
								if (wayBillTypeId == WAYBILL_TYPE_TO_PAY && id == "thirdCopyTbody") {
									allCharges[eleCharge].innerHTML = "";
									$(".grandTotalThirdCopy").html("");
								}
							} else if (configuration.showChargesOnThirdCopyForAllLR) {
								if (configuration.showChargesOnThirdCopyInPaidLr) {
									if ((wayBillTypeId == WAYBILL_TYPE_PAID) && (id == "secondCopyTbody" || id == "firstCopyTbody")) {
										allCharges[eleCharge].innerHTML = "";
										$(".grandTotalFirstCopy").html("");
										$(".grandTotalSecondCopy").html("");
									}
								} else if (id == "secondCopyTbody" || id == "firstCopyTbody") {
									allCharges[eleCharge].innerHTML = "0";
									$(".grandTotalFirstCopy").html("00");
									$(".grandTotalSecondCopy").html("00");
								}
							} else if (configuration.showChargesOnConsignorCopy) {
								if ((wayBillTypeId == WAYBILL_TYPE_PAID || wayBillTypeId == WAYBILL_TYPE_CREDIT) && (id == "secondCopyTbody" || id == "firstCopyTbody"))
									allCharges[eleCharge].innerHTML = "";
								else if ((wayBillTypeId == WAYBILL_TYPE_PAID || wayBillTypeId == WAYBILL_TYPE_CREDIT) && (id == "secondCopyAmountZero" || id == "firstCopyAmountZero")) {
									allCharges[eleCharge].innerHTML = "0";
									$(".grandTotalFirstCopy").html("00");
									$(".grandTotalSecondCopy").html("00");
								}

								if (configuration.showChargesOnConsigneeCopy) {
									if ((wayBillTypeId == WAYBILL_TYPE_TO_PAY || wayBillTypeId == WAYBILL_TYPE_CREDIT) && (id == "secondCopyTbody" || id == "thirdCopyTbody"))
										allCharges[eleCharge].innerHTML = "";
									else if ((wayBillTypeId == WAYBILL_TYPE_TO_PAY || wayBillTypeId == WAYBILL_TYPE_CREDIT) && (id == "secondCopyAmountZero" || id == "thirdCopyAmountZero")) {
										allCharges[eleCharge].innerHTML = "0";
										$(".grandTotalThirdCopy").html("00");
										$(".grandTotalSecondCopy").html("00");
									}
								}
							} else if (configuration.replaceLrChargeWithPaidSecondThirdCopy) {
								if (wayBillTypeId == WAYBILL_TYPE_PAID) {
									if (configuration.replaceLrChargeWithPaidInAllCopy) {
										$(".FirstCopy").html("PAID");
										$(".SecondCopy").html("PAID");
										$(".cgst").removeAttr('data-gst');
										$(".sgst").removeAttr('data-gst');
										$(".igst").removeAttr('data-gst');
									} else if (id == "secondCopyTbody" || id == "thirdCopyTbody") {
										allCharges[eleCharge].innerHTML = "PAID";
										$(".grandTotalThirdCopy").html("PAID");
										$(".grandTotalSecondCopy").html("PAID");
									} 
								}
							} else if (wayBillTypeId == WAYBILL_TYPE_TO_PAY) {
								if (id == "thirdCopyTbody") {
									allCharges[eleCharge].innerHTML = "";
									$(".grandTotalThirdCopy").html("");
								}
							} else if (wayBillTypeId == WAYBILL_TYPE_PAID) {
								if (configuration.showChargesOnThirdCopyInPaidLr) {
									if (id == "secondCopyTbody" || id == "firstCopyTbody") {
										allCharges[eleCharge].innerHTML = "";
										$(".grandTotalFirstCopy").html("");
										$(".grandTotalSecondCopy").html("");
									}
								} else if (id == "secondCopyTbody" || id == "thirdCopyTbody" || id == "firstCopyTbody") {
									allCharges[eleCharge].innerHTML = "";
									$(".grandTotalFirstCopy").html("");
									$(".grandTotalSecondCopy").html("");
									$(".grandTotalThirdCopy").html("");
								}else if (id == "secondCopyTbodyGir" || id == "thirdCopyTbodyGir") {
										allCharges[eleCharge].innerHTML = "0";
										$(".grandTotalThirdCopy").html("0");
										$(".grandTotalSecondCopy").html("0");
								}
							}
						}
					}
				}

				if (configuration.showZeroAmountInLRPrintForGstnNumber) {
					var gstNumbersForZeroAmountInLRPrintArr = responseOut.configuration.gstNumbersForZeroAmountInLRPrint.split(",");

					if (isValueExistInArray(gstNumbersForZeroAmountInLRPrintArr, responseOut.consignorGstn) || isValueExistInArray(gstNumbersForZeroAmountInLRPrintArr, responseOut.consigneeGstn) || isValueExistInArray(gstNumbersForZeroAmountInLRPrintArr, responseOut.billingPartyGstn)) {
						for (var index in chargeTypeModelArr) {
							$("*[data-selector='chargeValue" + chargeTypeModelArr[index].chargeTypeMasterId + "']").html('0');
						}

						$("*[data-lr='grandTotal']").html('0');
					}
				}

				var rpsCharges = $(".rpsCharges");

				for (var i = 0; i < rpsCharges.length; i++) {
					if (rpsCharges[i] != undefined) {
						var id = rpsCharges[i].offsetParent.id;

						if (id == "thirdTableRPS")
							rpsCharges[i].innerHTML = " ";
					}
				}

				//For sjtc group
				if (sortedBookingChargeList != undefined) {
					for (var index in sortedBookingChargeList) {
						if (sortedBookingChargeList[index].chargeTypeMasterId == FREIGHT) {
							freight = sortedBookingChargeList[index].wayBillBookingChargeChargeAmount;
							break;
						}
					}
				}

				//show amount BY paid And Topay Column
				// for SURAT ANDHRA LOGISTICS 
				
				if (wayBillTypeId == WAYBILL_TYPE_PAID)
					$(".chargeTableForSal").css('paddingLeft', '105px');
				else if (wayBillTypeId == WAYBILL_TYPE_TO_PAY || wayBillTypeId == WAYBILL_TYPE_CREDIT)
					$(".chargeTableForSal").css('paddingLeft', '35px');

				if (wayBillTypeId == WAYBILL_TYPE_CREDIT) {
					grandtotal = responseOut.bookingTotal - freight;
					$(".grandTotalFreight").html(Math.round(grandtotal));
				}

				this.removePaidHamaliGrandTotal(responseOut);
				
				if (configuration.showReturnBookingCharges && responseOut.returnBookingWaybillId > 0)
					$(".returnBookingChrg").css("display", "block");

				if (configuration.hideAllChargesForTbbLr && wayBillTypeId == WAYBILL_TYPE_CREDIT)
					$(".hideAllChargesForTbb").hide();

				if (configuration.hideAllChargesInConsignorCopyForPaidLr && wayBillTypeId == WAYBILL_TYPE_PAID)
					$(".hideAllChargesForPaid").hide();
					
				if(configuration.hideAllChargesForToPayAndTbbLr && wayBillTypeId == WAYBILL_TYPE_CREDIT || wayBillTypeId == WAYBILL_TYPE_TO_PAY)
					$(".hideAllChargesForToPayTbb").hide();
				$("[data-lr='allChargesMinusFreight']").html(
					responseOut
					.waybillBookingChargesList
					.filter(x => x.chargeTypeMasterId !== FREIGHT)
					.map(x => x.wayBillBookingChargeChargeAmount)
					.reduce((a, b) => a + b, 0)
				)
				
			}, setLRCharge: function(sortedBookingChargeList) {
				for (var index in sortedBookingChargeList) {
					if (Number(sortedBookingChargeList[index].chargeTypeMasterId) == LR_CHARGE) {
						if (Number(sortedBookingChargeList[index].wayBillBookingChargeChargeAmount) != 30) {
							$("#LRCharge").removeClass('hide');
							$("#LRCharge").addClass('show');
							$("*[data-selector='chargeValue" + sortedBookingChargeList[index].chargeTypeMasterId + "']").html(sortedBookingChargeList[index].wayBillBookingChargeChargeAmount);
						}
					}
				}
			}, addCarreirRiskandInsurance: function(sortedBookingChargeList) {
				var carreirRiskCharge = 0;

				for (var index in sortedBookingChargeList) {
					if (Number(sortedBookingChargeList[index].chargeTypeMasterId) == CARRIER_RISK_CHARGE || Number(sortedBookingChargeList[index].chargeTypeMasterId) == CR_INSUR_BOOKING) {
						if (Number(sortedBookingChargeList[index].wayBillBookingChargeChargeAmount) > 0) {
							carreirRiskCharge += sortedBookingChargeList[index].wayBillBookingChargeChargeAmount;
						}
					}
				}

				$("*[data-selector='chargeValue121']").html(Math.round(carreirRiskCharge));
			}, setConsignment: function(responseOut) {
				if (responseOut.configuration.isFromIVEditor) {
					this.setConsignmentForIVEditor(responseOut)
					return;
				}
				var showQuantity = false;
				var showPackingType = false;
				var showSaidToContain = false;
				var showSaidToContain1 = false;
				var showSeperater = false;
				var showRateAmount = false;
				var showSerialNo = false;
				var showDescription = false;
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
				var styleOfSerialNO = $("*[data-consignmentserialNo='dynamic']").attr('style');
				
				var classNameofQty = $("*[data-consignmentquantity='dynamic']").attr('class');
				var styleOfQty = $("*[data-consignmentquantity='dynamic']").attr('style');
				
				var classNameofPackingType = $("*[data-consignmentpackingtype='dynamic']").attr('class');
				var styleOfPackingType = $("*[data-consignmentpackingtype='dynamic']").attr('style');
				
				var classNameofSeperator = $("*[data-consignmentseperator='dynamic']").attr('class');
				var styleOfSeperator = $("*[data-consignmentseperator='dynamic']").attr('style');
				
				var classNameofSaidToContain = $("*[data-consignmentsaidtocontain='dynamic']").attr('class');
				var styleOfSaidToContain = $("*[data-consignmentsaidtocontain='dynamic']").attr('style');
				
				var classNameofSaidToContain1 = $("*[data-consignmentsaidtocontain1='dynamic']").attr('class');
				var styleOfSaidToContain1 = $("*[data-consignmentsaidtocontain1='dynamic']").attr('style');
				
				var classNameofRateAmount = $("*[data-consignmentrateamount='dynamic']").attr('class');
				var styleOfRateAmount = $("*[data-consignmentrateamount='dynamic']").attr('style');
				
				var classNameofFreightAmount = $("*[data-consignmentfreightamount='dynamic']").attr('class');
				var styleOfFreightAmount = $("*[data-consignmentfreightamount='dynamic']").attr('style');
				
				var classNameofFreightAmountPaid = $("*[data-consignmentfreightamountPaid='dynamic']").attr('class');
				var styleOfFreightAmountPaid = $("*[data-consignmentfreightamountPaid='dynamic']").attr('style');
				
				var classNameofChargedWeight = $("*[data-consignmentChargedWeight='dynamic']").attr('class');
				var styleOfChargedWeight = $("*[data-consignmentChargedWeight='dynamic']").attr('style');
				
				var classNameOfDescription = $("*[data-consignmentDescription='dynamic']").attr('class');
				var styleOfDescription = $("*[data-consignmentDescription='dynamic']").attr('style');

				if (config.showLBHOnPrint && responseOut.cftWeight > 0) {

					var classNameofCFTLength = $("*[data-consignmentcftlength='dynamic']").attr('class');
					var styleOfCFTLength = $("*[data-consignmentcftlength='dynamic']").attr('style');
					
					var classNameofCFTBreadth = $("*[data-consignmentcftbreadth='dynamic']").attr('class');
					var styleOfCFTBreadth = $("*[data-consignmentcftbreadth='dynamic']").attr('style');
					
					var classNameofCFTHeight = $("*[data-consignmentcftheight='dynamic']").attr('class');
					var styleOfCFTHeight = $("*[data-consignmentcftheight='dynamic']").attr('style');
					
					var classNameofLength = $("*[data-consignmentlength='dynamic']").attr('class');
					var styleOfLength = $("*[data-consignmentlength='dynamic']").attr('style');
					
					var classNameofBreadth = $("*[data-consignmentbreadth='dynamic']").attr('class');
					var styleOfBreadth = $("*[data-consignmentbreadth='dynamic']").attr('style');
					
					var classNameofHeight = $("*[data-consignmentheight='dynamic']").attr('class');
					var styleOfHeight = $("*[data-consignmentheight='dynamic']").attr('style');


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
				
				$("*[data-consignmentDescription='dynamic']").each(function() {
					showDescription = true
				})


				var tbody = $("*[data-consignmentquantity='dynamic']").parent().parent()
				if (config.isFromIVEditor) {
					tbody = $("*[data-consignmentquantity='dynamic']").closest("tr")
				}
				var tbody1 = "";

				if ((config.hideAllChargesInConsignorCopyForPaidLr == true || config.hideAllChargesInConsignorCopyForPaidLr) && wayBillTypeId == WAYBILL_TYPE_PAID) {
					tbody1 = $("*[data-consignmentfreightamountPaid='dynamic']").parent().parent();
					if (config.isFromIVEditor) {
						tbody1 = $("*[data-consignmentfreightamountPaid='dynamic']").closest("tr");
					}
				} else {
 					tbody1 = $("*[data-consignmentfreightamount='dynamic']").parent().parent();
 					if (config.isFromIVEditor) {
						tbody1 = $("*[data-consignmentfreightamount='dynamic']").closest("tr");
					}
 				}

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
						newtdSrNO.attr("style", styleOfSerialNO);
						newtdSrNO.attr("data-selector", 'sNo' + index);
						newtdSrNO.html(count++);
						newtr.append(newtdSrNO);
					}

					if (showQuantity) {
						var newtdQuantity = $("<td></td>");
						newtdQuantity.attr("class", classNameofQty);
						newtdQuantity.attr("style", styleOfQty);
						newtdQuantity.attr("data-selector", 'qty' + consignmentArr[index].consignmentDetailsId);
						newtr.append(newtdQuantity);
					}

					if (showPackingType) {
						var newtdPackingType = $("<td></td>");
						newtdPackingType.attr("class", classNameofPackingType);
						newtdPackingType.attr("style", styleOfPackingType);
						newtdPackingType.attr("data-selector", 'packingtype' + consignmentArr[index].consignmentDetailsId);
						newtr.append(newtdPackingType);
					}

					if (showSeperater) {
						var newtdSeperator = $("<td></td>");
						newtdSeperator.attr("class", classNameofSeperator);
						newtdSeperator.attr("style", styleOfSeperator);
						newtdSeperator.attr("data-selector", 'seperator');
						newtr.append(newtdSeperator);
					}

					if (showSaidToContain) {
						var newtdSaidToContain = $("<td></td>");
						newtdSaidToContain.attr("class", classNameofSaidToContain);
						newtdSaidToContain.attr("style", styleOfSaidToContain);
						newtdSaidToContain.attr("data-selector", 'saidToCOntain' + consignmentArr[index].consignmentDetailsId);
						newtr.append(newtdSaidToContain);
					}

					if (showSaidToContain1) {
						var newtdSaidToContain = $("<td></td>");
						newtdSaidToContain.attr("class", classNameofSaidToContain1);
						newtdSaidToContain.attr("style", styleOfSaidToContain1);
						newtdSaidToContain.attr("data-selector", 'saidToCOntain1' + consignmentArr[index].consignmentDetailsId);
						newtr.append(newtdSaidToContain);
					}
					
					if (showDescription) {
						var newtdDescription = $("<td></td>");
						newtdDescription.attr("class", classNameOfDescription);
						newtdDescription.attr("style", styleOfDescription);
						newtdDescription.append(`<span data-selector="${'packingtype' + consignmentArr[index].consignmentDetailsId}"></span>`);
						newtdDescription.append(`<span> of </span>`);
						newtdDescription.append(`<span data-selector="${'saidToCOntain' + consignmentArr[index].consignmentDetailsId}"></span>`);
						newtr.append(newtdDescription);
					}

					if (showRateAmount) {
						var newtdSaidToContain = $("<td></td>");
						newtdSaidToContain.attr("class", classNameofRateAmount);
						newtdSaidToContain.attr("style", styleOfRateAmount);
						newtdSaidToContain.attr("data-selector", 'amount' + consignmentArr[index].consignmentDetailsId);
						newtr.append(newtdSaidToContain);
					}

					if (chargedWeight) {
						var newtdChargedWeight = $("<td></td>");
						newtdChargedWeight.attr("class", classNameofChargedWeight);
						newtdChargedWeight.attr("style", styleOfChargedWeight);
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
								newtdfreight.attr("style", styleOfFreightAmountPaid);
							} else {
								newtdfreight.attr("class", classNameofFreightAmountPaid + "hideAllChargeForPaid");
								newtdfreight.attr("class", classNameofFreightAmount + "hideSelectorForTopay");
							}
						} else {
							newtdfreight.attr("class", classNameofFreightAmount);
							newtdfreight.attr("style", styleOfFreightAmount);
						}

						newtdfreight.attr("data-selector", 'freight' + index);
						newtdfreight.html(freightAmount);
						newtr1.append(newtdfreight);
					}

					if (config.showLBHOnPrint && responseOut.cftWeight > 0) {
						if (cftLength) {
							var newtdcftLength = $("<td></td>");
							newtdcftLength.attr("class", classNameofCFTLength);
							newtdcftLength.attr("style", styleOfCFTLength);
							newtdcftLength.attr("data-selector", 'cftLength' + consignmentArr[index].consignmentDetailsId);
							//newtdcftWeight.html(freightAmount);
							newtr1.append(newtdcftLength);
						}

						if (cftHeight) {
							var newtdcftHeight = $("<td></td>");
							newtdcftHeight.attr("class", classNameofCFTHeight);
							newtdcftHeight.attr("style", styleOfCFTHeight);
							newtdcftHeight.attr("data-selector", 'freight' + consignmentArr[index].consignmentDetailsId);
							//newtdfreight.html(freightAmount);
							newtr1.append(newtdcftHeight);
						}

						if (cftBreadth) {
							var newtdcftBreadth = $("<td></td>");
							newtdcftBreadth.attr("class", classNameofCFTBreadth);
							newtdcftBreadth.attr("style", styleOfCFTBreadth);
							newtdcftBreadth.attr("data-selector", 'cftBreadth' + consignmentArr[index].consignmentDetailsId);
							//newtdcftBreadth.html(freightAmount);
							newtr1.append(newtdcftBreadth);
						}

						if (length) {
							var newtdlength = $("<td></td>");
							newtdlength.attr("class", classNameofLength);
							newtdlength.attr("style", styleOfLength);
							newtdlength.attr("data-selector", 'length');
							newtr.append(newtdlength);
						}

						if (breadth) {
							var newtdbreadth = $("<td></td>");
							newtdbreadth.attr("class", classNameofBreadth);
							newtdbreadth.attr("style", styleOfBreadth);
							newtdbreadth.attr("data-selector", 'breadth');
							newtr.append(newtdbreadth);
						}

						if (height) {
							var newtdheight = $("<td></td>");
							newtdheight.attr("class", classNameofHeight);
							newtdheight.attr("style", styleOfHeight);
							newtdheight.attr("data-selector", 'height');
							newtr.append(newtdheight);
						}
					}

					$(tbody).before(newtr);
					$(tbody1).before(newtr1);
				}
				if (config.isFromIVEditor) {
					$(tbody).remove();
					$(tbody1).remove();
				}

				if (config.hideAllChargesForTbbLr && wayBillTypeId == WAYBILL_TYPE_CREDIT)
					$(".hideAllCharge").html("TBB");

				if (wayBillTypeId == WAYBILL_TYPE_PAID){
					$('.paymentTypeForPaid').show()
					$(".hideAllChargePaidForSakar").html(" ");
				}

				if (wayBillTypeId == WAYBILL_TYPE_TO_PAY)
					$(".hideAllChargeTopayForSakar").html(" ");

				if (wayBillTypeId == WAYBILL_TYPE_CREDIT)
					$(".hideAllChargeTBBForSakar").html(" ");
					
				if ((wayBillTypeId == WAYBILL_TYPE_TO_PAY || wayBillTypeId == WAYBILL_TYPE_CREDIT) && responseOut. wayBillSourceBranchId != HIMMAT_NAGAR_BRANCH_520 && responseOut.wayBillSourceBranchId == responseOut.executiveBranchId)
					$(".ShowZeroChargesForPooja").html("0");

				if (config.hideAllChargesInConsignorCopyForPaidLr) {
					if (wayBillTypeId == WAYBILL_TYPE_PAID)
						$(".hideSelectorForTopay").hide();
					else
						$(".hideAllChargeForPaid").hide();
				}

				this.setPackingTypeNameWithQuantity(consignmentArr, responseOut)
				this.setConsignmentReverseOrder(responseOut)
			}, setConsignmentForIVEditor: function(responseOut) {
				let attributes = {
					"serialNo": "sNo",
					"quantity": "qty",
					"packingtype": "packingtype",
					"seperator": "seperator",
					"saidtocontain": "saidToCOntain",
					"rateamount": "amount",
					"freightamount": "freight",
					"ChargedWeight": "ChargedWeight",
					"Description": "Description",
					"cftlength": "cftLength",
					"cftbreadth": "cftBreadth",
					"cftheight": "cftHeight"
				};
				
				
				let $specTrs = $([...new Set([
					...Object.keys(attributes)
					.flatMap(a => [...$(`[data-consignment${a}='dynamic']`).closest("tr")])
				])]);

				$specTrs.each(function() {
					let $tr = $(this);
					$tr.before(
						responseOut.consignmentMap
						.map((consignment, rowIndex) =>
							$("<tr/>")
							.append(
								[...$tr.children()]
								.map(td => $(td))
								.map($specTd => {
									let attributeKey = Object.keys(attributes).find(key => 
										$specTd.attr(`data-consignment${key}`) === 'dynamic'
									)
									if (!attributeKey) return $("<td/>")

									if (attributeKey === "Description") {
										return (
											$("<td/>")
											.attr("class", $specTd.attr("class"))
											.attr("style", $specTd.attr("style"))
											.append(`<span data-selector="${'packingtype' + consignment.consignmentDetailsId}"></span>`)
											.append(`<span> of </span>`)
											.append(`<span data-selector="${'saidToCOntain' + consignment.consignmentDetailsId}"></span>`)
										)
									}
									
									if (attributeKey === "serialNo") {
										return (
											$("<td/>")
											.attr("class", $specTd.attr("class"))
											.attr("style", $specTd.attr("style"))
											.html(rowIndex + 1)
										)
									}
									
									if (attributeKey === "seperator") {
										return (
											$("<td/>")
											.attr("class", $specTd.attr("class"))
											.attr("style", $specTd.attr("style"))
											.html(" of ")
										)
									}
									
									if (attributeKey === "freightamount") {
										return (
											$("<td/>")
											.attr("class", $specTd.attr("class"))
											.attr("style", $specTd.attr("style"))
											.html(
												consignment.amount != 0
													? consignment.quantity * consignment.amount
													: consignment.chargeAmount
											)
										)
									}

									return (
										$("<td/>")
										.attr("class", $specTd.attr("class"))
										.attr("style", $specTd.attr("style"))
										.attr("data-selector", attributes[attributeKey] + consignment.consignmentDetailsId)
									)
								})
							)
						)
					);
				})
				$specTrs.remove();
				
				this.setPackingTypeNameWithQuantity(responseOut.consignmentMap, responseOut);
				this.setConsignmentReverseOrder(responseOut);
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
			}, setExecutiveDetails: function(responseOut) {
				$("*[data-executive='name']").html(responseOut.executiveName);
			}, setCurrentDateTime: function(responseOut) {
				$("*[data-time='current']").html(responseOut.currentTime);
				$("*[data-date='current']").html(responseOut.currentDate);
			}, setPackingTypeNameWithQuantity: function(consignmentArr, responseOut) {
				var article = [];
				var article1 = []
				var artQuantity=0;
				var commaSepratedSaidToContained = [];
				var commaSepratedSaidToContainedWithQty = [];
				var commaSepratedPackingTypeWithSubstr = [];
				var commaSepratedQtyWithPackingTypeAndSaidToContained = [];
				var commaSepratedPackingType = [];
				var config = responseOut.configuration;
				var commaSeperatedQuantity = [];
				
				if(consignmentArr.length > 1) {
					$('.invoiceNumber').show();
					
					if (responseOut.wayBillTypeId ==  WAYBILL_TYPE_CREDIT)
						$(".hideRateForPatil").hide();
				}

				var commaSepratedRate = [];

				for (var index in consignmentArr) {
					var pos 				= Number(index) + Number(1);
					var qty 				= consignmentArr[index].quantity;
					var packingTypeName 	= consignmentArr[index].packingTypeName;
					var saidToContain 		= consignmentArr[index].saidToContain;
					var amount 				= consignmentArr[index].amount;
					var privateMark 		= consignmentArr[index].amount;
					var freightAmount 		= consignmentArr[index].freightAmount;
					var length 				= consignmentArr[index].length;
					var breadth 			= consignmentArr[index].breadth;
					var height 				= consignmentArr[index].height;
					
					function numberToWords(num) {
					    const belowTwenty = ['','one','two','three','four','five','six','seven','eight','nine','ten',
					                         'eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
					    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
					
					    if (num === 0) return 'zero';
					    
					    const words = (n) => 
					        n < 20 ? belowTwenty[n] :
					        n < 100 ? tens[Math.floor(n / 10)] + (n % 10 ? ' ' + belowTwenty[n % 10] : '') :
					        n < 1000 ? belowTwenty[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + words(n % 100) : '') :
					        '';
					
					    return (num >= 1000 ? words(Math.floor(num / 1000)) + ' thousand ' : '') + words(num % 1000).trim();
					}
					var quantityIntoWord = numberToWords(qty);

					// [data-consignmentquantity='1'] [data-consignmentquantity='2'] [data-consignmentquantity='3'] [data-consignmentquantity='4'] [data-consignmentquantity='5'] [data-consignmentquantity='6']
					$("*[data-consignmentquantity='" + (pos) + "']").html(qty);
					// [data-consignmentserialNo='1'] [data-consignmentserialNo='2'] [data-consignmentserialNo='3'] [data-consignmentserialNo='4'] [data-consignmentserialNo='5'] [data-consignmentserialNo='6']  
					$("*[data-consignmentserialNo='" + (pos) + "']").html(pos);
					// [data-consignmentpackingtype='1'] [data-consignmentpackingtype='2'] [data-consignmentpackingtype='3'] [data-consignmentpackingtype='4'] [data-consignmentpackingtype='5'] [data-consignmentpackingtype='6']
					$("*[data-consignmentpackingtype='" + (pos) + "']").html(packingTypeName);
					// [data-consignmentseperator='1'] [data-consignmentseperator='2'] [data-consignmentseperator='3'] [data-consignmentseperator='4'] [data-consignmentseperator='5'] [data-consignmentseperator='6'] 
					$("*[data-consignmentseperator='" + (pos) + "']").html('of ');
					// [data-consignmentquantityInWord='1'] [data-consignmentquantityInWord='2'] [data-consignmentquantityInWord='3'] [data-consignmentquantityInWord='4'] [data-consignmentquantityInWord='5'] [data-consignmentquantityInWord='6']
					$("*[data-consignmentquantityInWord='" + (pos) + "']").html(quantityIntoWord+' ONLY ');
					
					if(saidToContain != undefined)
						saidToContain	= saidToContain.replace("(New)", "");
					
					// [data-consignmentsaidtocontain='1'] [data-consignmentsaidtocontain='2'] [data-consignmentsaidtocontain='3'] [data-consignmentsaidtocontain='4'] [data-consignmentsaidtocontain='5'] [data-consignmentsaidtocontain='6']
					$("*[data-consignmentsaidtocontain='" + (pos) + "']").html(saidToContain);
					// [data-consignmentrateamount='1'] [data-consignmentrateamount='2'] [data-consignmentrateamount='3'] [data-consignmentrateamount='4'] [data-consignmentrateamount='5'] [data-consignmentrateamount='6']
					$("*[data-consignmentrateamount='" + (pos) + "']").html(amount);
					// [data-consignmentpackingtype='1'] [data-consignmentpackingtype='2'] [data-consignmentpackingtype='3']  [data-consignmentpackingtype='4']  [data-consignmentpackingtype='5']  [data-consignmentpackingtype='6']
					$("*[data-consignmentpackingtype='" + (pos) + "']").html(packingTypeName);
					$("*[data-consignmentsaidtocontainwithbracket='" + (pos) + "']").html("(" + saidToContain + ")");
					// [data-consignmentChargedWeight='1'] [data-consignmentChargedWeight='2'] [data-consignmentChargedWeight='3'] [data-consignmentChargedWeight='4'] [data-consignmentChargedWeight='5'] [data-consignmentChargedWeight='6']
					$("*[data-consignmentChargedWeight='" + (pos) + "']").html(consignmentArr[index].chargeWeight);
					// [data-consignmentPrivateMark='1'] [data-consignmentPrivateMark='2'] [data-consignmentPrivateMark='3'] [data-consignmentPrivateMark='4'] [data-consignmentPrivateMark='5'] [data-consignmentPrivateMark='6']
					$("*[data-consignmentPrivateMark='" + (pos) + "']").html(privateMark);
					// [data-consignmentfreightamount='1'] [data-consignmentfreightamount='2'] [data-consignmentfreightamount='3'] [data-consignmentfreightamount='4'] [data-consignmentfreightamount='5'] [data-consignmentfreightamount='6']
					$("*[data-consignmentfreightamount='" + (pos) + "']").html(qty * amount);
					// [data-consignmentffreightAmount='1'] [data-consignmentffreightAmount='2'] [data-consignmentffreightAmount='3'] [data-consignmentffreightAmount='4'] [data-consignmentffreightAmount='5'] [data-consignmentffreightAmount='6']
					$("*[data-consignmentffreightAmount='" + (pos) + "']").html(freightAmount);
					// [data-length='1'] [data-length='2'] [data-length='3'] [data-length='4'] [data-length='5'] [data-length='6']
					$("*[data-length='" + (pos) + "']").html(length);
					// [data-breadth='1'] [data-breadth='2'] [data-breadth='3'] [data-breadth='4'] [data-breadth='5'] [data-breadth='6']
					$("*[data-breadth='" + (pos) + "']").html(breadth);
					// [data-height='1'] [data-height='2'] [data-height='3'] [data-height='4'] [data-height='5'] [data-height='6']
					$("*[data-height='" + (pos) + "']").html(height);
					// [data-consignmentcft='1'] [data-consignmentcft='2'] [data-consignmentcft='3'] [data-consignmentcft='4'] [data-consignmentcft='5'] [data-consignmentcft='6']
					$("*[data-consignmentcft='" + (pos) + "']").html(responseOut.cftWeight);

					if (responseOut.chargeTypeId == CHARGETYPE_ID_QUANTITY){
						if(responseOut.wayBillTypeId ==  WAYBILL_TYPE_CREDIT || responseOut.wayBillTypeId ==  WAYBILL_TYPE_PAID){
							// [data-consignmentArticleRateStil='1'] [data-consignmentArticleRateStil='2'] [data-consignmentArticleRateStil='3'] [data-consignmentArticleRateStil='4'] [data-consignmentArticleRateStil='5'] [data-consignmentArticleRateStil='6']
							$("*[data-consignmentArticleRateStil='" + (pos) + "']").html("");
						}else{
							$("*[data-consignmentArticleRateStil='" + (pos) + "']").html(amount + "/Art");
						}
						// [data-consignmentArticleRate='1'] [data-consignmentArticleRate='2'] [data-consignmentArticleRate='3'] [data-consignmentArticleRate='4'] [data-consignmentArticleRate='5'] [data-consignmentArticleRate='6']
						$("*[data-consignmentArticleRate='" + (pos) + "']").html(amount + "/Art");
						// [data-consignmentArticleRateFix='1'] [data-consignmentArticleRateFix='2'] [data-consignmentArticleRateFix='3'] [data-consignmentArticleRateFix='4'] [data-consignmentArticleRateFix='5'] [data-consignmentArticleRateFix='6']
						$("*[data-consignmentArticleRateFix='" + (pos) + "']").html(amount + "/Art");
						// [data-consignmentArticleRateFix='1'] [data-consignmentArticleRateFix='2'] [data-consignmentArticleRateFix='3'] [data-consignmentArticleRateFix='4'] [data-consignmentArticleRateFix='5'] [data-consignmentArticleRateFix='6']
						$("*[data-consignmentArticleRateForSAL='" + (pos) + "']").html(amount);
						// [data-consignmentArticleRateForWCL='1'] [data-consignmentArticleRateForWCL='2'] [data-consignmentArticleRateForWCL='3'] [data-consignmentArticleRateForWCL='4'] [data-consignmentArticleRateForWCL='5'] [data-consignmentArticleRateForWCL='6']
						$("*[data-consignmentArticleRateForWCL='" + (pos) + "']").html(	 " X " + amount);
					}

					// [data-consignmentallpackingtype='1'] [data-consignmentallpackingtype='2'] [data-consignmentallpackingtype='3'] [data-consignmentallpackingtype='4'] [data-consignmentallpackingtype='5'] [data-consignmentallpackingtype='6']
					$("*[data-consignmentallpackingtype='" + (pos) + "']").html(packingTypeName + ' OF ' + saidToContain);

					if (config.showLBHOnPrint && (consignmentArr[index].length > 0 || consignmentArr[index].breadth > 0 || consignmentArr[index].height > 0) ) {
						// [data-consignmentcftlength='1'] [data-consignmentcftlength='2'] [data-consignmentcftlength='3'] [data-consignmentcftlength='4'] [data-consignmentcftlength='5'] [data-consignmentcftlength='6']
						$("*[data-consignmentcftlength='" + (pos) + "']").html(consignmentArr[index].length);
						// [data-consignmentcftbreadth='1'] [data-consignmentcftbreadth='2'] [data-consignmentcftbreadth='3'] [data-consignmentcftbreadth='4'] [data-consignmentcftbreadth='5'] [data-consignmentcftbreadth='6']
						$("*[data-consignmentcftbreadth='" + (pos) + "']").html(consignmentArr[index].breadth);
						// [data-consignmentcftheight='1'] [data-consignmentcftheight='2'] [data-consignmentcftheight='3'] [data-consignmentcftheight='4'] [data-consignmentcftheight='5'] [data-consignmentcftheight='6']
						$("*[data-consignmentcftheight='" + (pos) + "']").html(consignmentArr[index].height);
						// [data-consignmentcftweight='1'] [data-consignmentcftweight='2'] [data-consignmentcftweight='3'] [data-consignmentcftweight='4'] [data-consignmentcftweight='5'] [data-consignmentcftweight='6']
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
					
					commaSeperatedQuantity.push(qty);
					article.push(qty + " " + packingTypeName);
					article1.push(packingTypeName + " ( " + qty + " ) " );
					artQuantity = artQuantity + qty;
					commaSepratedQtyWithPackingTypeAndSaidToContained.push(qty + "-" + packingTypeName + "-" + saidToContain);
					commaSepratedSaidToContained.push(saidToContain);
					commaSepratedSaidToContainedWithQty.push(saidToContain + " " + qty);
					if (packingTypeName != undefined) {
						commaSepratedPackingTypeWithSubstr.push((packingTypeName).substring(0, 10));
					}
					commaSepratedPackingType.push(packingTypeName);
					commaSepratedRate.push(amount)
				}

				$("*[data-lr='pkgNameWithQty']").html("(" + article.join(', ') + ")");
				$("*[data-lr='artQuantity']").html(artQuantity);
				$("*[data-lr='pkgNameWithQtynoBrace']").html(article.join(', '));
				$("*[data-lr='pkgNameWithQtynoSmts']").html(article1.join(', '));
				$("*[data-lr='commaSepratedQtyWithPackingTypeAndSaidToContained']").html(commaSepratedQtyWithPackingTypeAndSaidToContained.join(', '));
				$("*[data-lr='commaSeparetedSaidToContained']").html(commaSepratedSaidToContained.join(', '));
				$("*[data-lr='commaSepratedPackingTypeWithSubstr']").html(commaSepratedPackingTypeWithSubstr.join(', '));
				$("*[data-lr='commaSepratedSaidToContainedWithQty']").html(commaSepratedSaidToContainedWithQty.join(', '));
				$("*[data-lr='commaSepratedPackingType']").html("(" + commaSepratedPackingType.join(',') + ")");
				$("*[data-lr='packingTypeName']").html(commaSepratedPackingType.join(', '));
				$("*[data-lr='saidtocontainname']").html(commaSepratedSaidToContained.join(', '));
				commaSepratedArticleType = commaSepratedPackingType.join(', ');
				$("*[data-lr='commaSeparetedRate']").html(commaSepratedRate.join(', '));
				$("*[data-lr='commaSeperatedQuantity']").html(commaSeperatedQuantity.join(', '));

				if (responseOut.chargeTypeId == CHARGETYPE_ID_WEIGHT){
					$("*[data-consignmentArticleRate='1']").html(responseOut.weigthFreightRate + '/Kg');
					$("*[data-consignmentArticleRateFix='1']").html(responseOut.weigthFreightRate + '/Kg');
					$("*[data-consignmentArticleRateForSAL='1']").html(responseOut.weigthFreightRate);
					$("*[data-consignmentArticleRateForWCL='1']").html(' X ' + responseOut.weigthFreightRate);
					
				}
				
				if (responseOut.chargeTypeId != CHARGETYPE_ID_WEIGHT && responseOut.chargeTypeId != CHARGETYPE_ID_QUANTITY)
					$("*[data-consignmentArticleRateFix='1']").html(responseOut.wayBillBookingChargeChargeAmount);
			}, setDataOnWayBillType: function(responseOut) {
				var configuration	= responseOut.configuration;
				var bookingCharges	= responseOut.waybillBookingChargesList;
				var wayBillTypeId	= responseOut.wayBillTypeId;
				var isDisplayWayBillTypeWiseData = configuration.isDisplayWayBillTypeWiseData;
				
				for (var index in bookingCharges) {
					$("*[data-showTbbAmountForThrid='chargeValue" + bookingCharges[index].chargeTypeMasterId + "']").html(bookingCharges[index].wayBillBookingChargeChargeAmount);
				}

				if (isDisplayWayBillTypeWiseData) {
					if (wayBillTypeId == WAYBILL_TYPE_PAID || wayBillTypeId == WAYBILL_TYPE_CREDIT) {
						$("#chargeValue1").hide();
						$("#chargeValue3").hide();
						$("#chargeValue49").hide();
						$("#bookingServicetax").hide();
						$("#chargeSum").hide();
						$(".paidLRCon").html(0);

						$("#showtbbpaidamount1").show();
						$("#showtbbpaidamount3").show();
						$("#showtbbpaidamount49").show();
						$("#tbbpaidbookingServicetax").show();
						$("#tbbpaidchargeSum").show();
						$("*[data-decimal='lrDecimal']").html(' ');

						for (var index in bookingCharges) {
							$("*[data-selector='chargeValue" + bookingCharges[index].chargeTypeMasterId + "']").html(' ');
							$("*[data-showtbbpaidamount='chargeValue" + bookingCharges[index].chargeTypeMasterId + "']").html(bookingCharges[index].wayBillBookingChargeChargeAmount);
							$("*[data-consignor-selector='chargeValue" + bookingCharges[index].chargeTypeMasterId + "']").html(bookingCharges[index].wayBillBookingChargeChargeAmount);
							$("*[data-showTbbAmountForThrid='chargeValue" + bookingCharges[index].chargeTypeMasterId + "']").html(bookingCharges[index].wayBillBookingChargeChargeAmount);
							
							if (wayBillTypeId == WAYBILL_TYPE_PAID)
								$("*[data-hidetbbmount='chargeValue" + bookingCharges[index].chargeTypeMasterId + "']").html(bookingCharges[index].wayBillBookingChargeChargeAmount);
							else
								$("*[data-hidetbbamount='chargeValue" + bookingCharges[index].chargeTypeMasterId + "']").html(0);

							$("*[data-hidetbbpaidamount='chargeValue" + bookingCharges[index].chargeTypeMasterId + "']").html('0');
						}

						$("*[data-lr='bookingServicetax']").html(' ');
						$("*[data-lr='chargeSum']").html(' ');
						$("*[data-lr='tbbpaidbookingServicetax']").html(responseOut.bookingTimeServiceTax);
						$("*[data-lr='tbbpaidchargeSum']").html(responseOut.bookingChargesSum);
						$("*[data-lr='consignorbookingServicetax']").html(responseOut.bookingTimeServiceTax);
						$("*[data-lr='consigneebookingServicetax']").html('0');
						$("*[data-lr='consigneegrandTotal']").html('0');
						$("*[data-lr='transporterbookingServicetax']").html('0');

						if (wayBillTypeId == WAYBILL_TYPE_PAID)
							$("*[data-lr='consignorgrandTotal']").html(responseOut.bookingTotal);
						else
							$("*[data-lr='consignorgrandTotal']").html('0');
					} else {
						for (var index in bookingCharges) {
							$("*[data-consignor-selector='chargeValue" + bookingCharges[index].chargeTypeMasterId + "']").html(bookingCharges[index].wayBillBookingChargeChargeAmount);
							$("*[data-hidetbbpaidamount='chargeValue" + bookingCharges[index].chargeTypeMasterId + "']").html(bookingCharges[index].wayBillBookingChargeChargeAmount);
							$("*[data-hidetbbmount='chargeValue" + bookingCharges[index].chargeTypeMasterId + "']").html(bookingCharges[index].wayBillBookingChargeChargeAmount);
						}

						$("*[data-lr='consignorbookingServicetax']").html(responseOut.bookingTimeServiceTax);
						$("*[data-lr='consigneebookingServicetax']").html(responseOut.bookingTimeServiceTax);
						$("*[data-lr='consigneegrandTotal']").html(responseOut.bookingTotal);
						$("*[data-lr='transporterbookingServicetax']").html(responseOut.bookingTimeServiceTax);
						$("*[data-lr='transportergrandTotal']").html(responseOut.bookingTotal);
						$("*[data-lr='consignorgrandTotal']").html(responseOut.bookingTotal);
					}
				}

				if (wayBillTypeId == WAYBILL_TYPE_PAID || wayBillTypeId == WAYBILL_TYPE_CREDIT) {
					$("#topay").children().children().html(' ');
					$(".topaylgl").hide();
					$(".paidlgl").show();
				} else {
					$("#paidtbb").children().children().html(' ');
					$(".paidlgl").hide();
					$(".topaylgl").show();
				}

				if (wayBillTypeId == WAYBILL_TYPE_PAID)
					$("*[data-lr='goodsValue']").html('Paid');
				else if (wayBillTypeId == WAYBILL_TYPE_CREDIT)
					$("*[data-lr='goodsValue']").html('Tbb');

				if (configuration.replaceZeroAmountChargesWithBlank || configuration.replaceZeroAmountChargesWithBlank == true) {
					for (var index in bookingCharges) {
						if (bookingCharges[index].wayBillBookingChargeChargeAmount > 0)
							$("*[data-selector='chargeValue" + bookingCharges[index].chargeTypeMasterId + "']").html(bookingCharges[index].wayBillBookingChargeChargeAmount);
						else
							$("*[data-selector='chargeValue" + bookingCharges[index].chargeTypeMasterId + "']").html(' ');
					}

					setTimeout(function() {
						if ($('.cgst_342').val() == 0) $('.cgst_342').html(' ');
						if ($('.sgst_342').val() == 0) $('.sgst_342').html(' ');
						if ($('.igst_342').val() == 0) $('.igst_342').html(' ');
					}, 100);
				}
			}, hideChargesForConditions: function(responseOut) {
				var conf = responseOut.configuration;
				var wayBillTypeId = responseOut.wayBillTypeId;

				if (conf.hideChargesForLRConditions) {
					if (wayBillTypeId == WAYBILL_TYPE_TO_PAY) {
						$(".truckCopyCharges_topay tbody tr td").each(function() {
							var tdToRemove = $(this).closest('td');
							var value = tdToRemove.html();

							if (value != '') {
								tdToRemove.html('&nbsp;');
							}
						});
					}

					if (wayBillTypeId == WAYBILL_TYPE_PAID) {
						$(".truckCopyCharges_paid tbody tr td").each(function() {
							var tdToRemove = $(this).closest('td');
							var value = tdToRemove.html();

							if (value != '') {
								tdToRemove.html('&nbsp;');
							}
						});
					}

					if (wayBillTypeId == WAYBILL_TYPE_CREDIT) {
						$("#truckCopyCharges_tbb tbody tr td").each(function() {
							var tdToRemove = $(this).closest('td');
							var value = tdToRemove.html();

							if (value != '') {
								tdToRemove.html('&nbsp;');
							}
						});
					}
				}
			}, isShowPopUp : function(responseOut, printFromDB) {
				var showPopup = false;
				var conf = responseOut.configuration;
				var wayBillTypeId = responseOut.wayBillTypeId;
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

				if (conf.isWayBillTypeWisePopupAllowed) {
					var wayBillTypeIdsForPopup = conf.wayBillTypeIdsForPopup;
					var wayBillTypeIdList = wayBillTypeIdsForPopup.split(',');

					showPopup = isValueExistInArray(wayBillTypeIdList, responseOut.wayBillTypeId);
				}
				if (conf.isPopupAskToPrintFor
					|| conf.showHidePrintData || conf.duplicatePrint
					|| (conf.showPopForTopayFTLLr && wayBillTypeId == WAYBILL_TYPE_TO_PAY && responseOut.bookingTypeId == BOOKING_TYPE_FTL_ID)
					|| (responseOut.showLrPrintConfirmationPopup && (wayBillTypeId == WAYBILL_TYPE_PAID || wayBillTypeId == WAYBILL_TYPE_TO_PAY))
					|| conf.showPopUpContentForQrCodeOption
					|| conf.showPopUpContentForPaidChargesOption) {
					showPopup = true;
				}

				if (conf.setCustomMarginFromCookie) {
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
				
				return showPopup;
			}, showPopUp: function(responseOut, isPdfExportAllow, printFromDB) {
				hideLayer();
				var bookingCharges = responseOut.waybillBookingChargesList;

				var conf = responseOut.configuration;
				var wayBillTypeId = responseOut.wayBillTypeId;
				isQRPrintOnPopUpSelection = conf.isQRPrintOnPopUpSelection;
				var chargeTypeModelArr = responseOut.chargeTypeModelArr;
				//TEMPORARY
				if(conf.QRCodePrintType == 'customQRCodePrint_441' && responseOut.billSelectionId == BOOKING_WITHOUT_BILL)
					isQRPrintOnPopUpSelection	= false;
				
				var _this	= this;
				
				let showPopup	= _this.isShowPopUp(responseOut, printFromDB);
				
				if (showPopup) {
					$('#popUpDataForNETPL').bPopup({
					}, function() {
						var _thisMod = this;
						$(this).html("<div class='confirm'><table align='center'><tr><td colspan='3' style='text-align:center'></td></tr>" +
							"<tr><td colspan='3'>&nbsp;</td></tr></table>" +
							"<tr><td colspan='3'><input type='radio' id='check1' >Print Single LR Copy</td></tr></table>" +
							"<button id='cancelButton'>NO</button><button autofocus id='confirm'>YES</button></div>");

						$('#confirm').focus();

						$("#confirm").click(function() {
							if ($('#check1').prop('checked') == true) {
								$("#table2").show();
								$("#table3").hide();
								$("#table4").hide();
							}

							_thisMod.close();
							_this.printWindow(isPdfExportAllow);
						});

						$("#confirm").on('keydown', function(e) {
							if (e.which == 27) {  //escape
								_thisMod.close();
								//window.close();
							}
						});

						$("#cancelButton").click(function() {
							_thisMod.close();
							_this.printWindow(isPdfExportAllow);
						})
					});

					$('#popUpDataForSRLIPL').bPopup({}, function() {
						var _thisMod = this;
						$(this).html("<div class='confirm' style='height:200px;width:360px; text-align: left; padding:5px'><table align='center'><tr><td colspan='2' style='text-align:center'><h1> Print Options</h1></td></tr>"
							+ "<tr><td><input type='radio' id='declareValue' name='radio' checked>Show Declare Value</td>"
							+ "<td><input type='radio' name='radio'	 id='hidedeclareValue'>Hide Declare Value</td></tr>"
							+ "<tr><td><input type='radio' name='radio1' id='articleDetails' checked>Show Article Details</td>"
							+ "<td><input type='radio' name='radio1' id='hideArticleDetails'>Hide Article Details</td></tr>"
							+ "<button id='cancelButton'>NO</button><button autofocus id='confirm'>YES</button></div></div>");

						$("#confirm").focus();

						$('input[id="declareValue"]').click(function() {
							if ($("#declareValue").prop("checked")) {
								$(".declareValue").show();
							}
						});

						$('input[id="hidedeclareValue"]').click(function() {
							if ($("#hidedeclareValue").prop("checked")) {
								$(".declareValue").hide();
							}
						});

						$('input[id="articleDetails"]').click(function() {
							if ($("#articleDetails").prop("checked")) {
								$(".articleDetails").show();
							}
						});
						$('input[id="hideArticleDetails"]').click(function() {
							if ($("#hideArticleDetails").prop("checked")) {
								$(".articleDetails").hide();
							}
						});

						$("#confirm").click(function() {
							_thisMod.close();
							_this.printWindow(isPdfExportAllow);
						});

						$(document).on('keydown', function(e) {
							if (e.which == 27) {  //escape
								_thisMod.close();
								_this.clearCharges(responseOut);
							}
						});

						$("#cancelButton").click(function() {
							_thisMod.close();
							_this.printWindow(isPdfExportAllow);
						});
					});


					//249
					$('#popUpContent').bPopup({
					}, function() {
						var _thisMod = this;
						$(this).html("<div class='confirm'><h1>Are you want to print Charges ? </h1><p>Shortcut Keys : Enter = Yes, Esc = No</p><button id='cancelButton'>NO</button><button autofocus id='confirm'>YES</button></div>")
						$("#confirm").focus();
						$("#confirm").click(function() {
							_thisMod.close();
							_this.printWindow(isPdfExportAllow);
						})
						$("#confirm").on('keydown', function(e) {
							if (e.which == 27) {  //escape
								_thisMod.close();
								_this.clearCharges(responseOut);
							}
						});
						$("#cancelButton").click(function() {
							_thisMod.close();
							_this.clearCharges(responseOut);
						})
					});

					$('#genericPopUpContent').bPopup({
					}, function() {

						var _thisMod = this;
						$(this).html("<div class='confirm'><h1>Are you want to print Charges ? </h1><p id='shortcut'></p><button id='cancelButton'>NO</button><button id='confirm'>YES</button></div>")
						$("#shortcut").html("Shortcut Keys : Enter = Yes, Esc = No")
						$("#confirm").focus();

						$("#confirm").click(function() {
							_thisMod.close();
							_this.printWindow(isPdfExportAllow);
						})

						$("#confirm").on('keydown', function(e) {
							if (e.which == 27) {  //escape
								_thisMod.close();
								_this.clearCharges(responseOut);
							}
						});

						$("#cancelButton").click(function() {
							$(".freight").hide();
							$(".stCharges").hide();
							$(".hamali").hide();
							$(".CCA").hide();
							$(".toll").hide();
							$(".other").hide();
							$(".doorDly").hide();
							$(".doorColl").hide();
							$(".total").hide();
							_thisMod.close();
							_this.clearCharges(responseOut);
						})
					});

					//POPUP FOR TBB AMOUNT

					$('#popupForTbbAmount').bPopup({}, function() {
						var _thisMod = this;

						if (wayBillTypeId == WAYBILL_TYPE_CREDIT) {
							$(this).html("<div class='confirm' style='height:150px;width:250px; padding:5px'>"
								+ "<div style='font-size:18px; color:DodgerBlue;text-align:center;'><b>Print Option</b><div><br/>"
								+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' id='check1'	/>&nbsp;<b style='font-size:14px;'>Print Charges</b><div>"
								+ "<p style='color:red'>Shortcut Keys : Enter = Yes, Esc = No</p>"
								+ "<button id='cancel'>Cancel</button>"
								+ "<button autofocus id='printCharges1'>Print</button></center></div>");


							$("#confirm").click(function() {
								_thisMod.close();
							});
							for (var index in bookingCharges) {
								if (bookingCharges[index].wayBillBookingChargeChargeAmount != 0) {
									$("*[data-selector='chargeValue" + bookingCharges[index].chargeTypeMasterId + "']").html('0');
									$("*[data-lr='advanceAmount']").html('0');
									$("*[data-lr='grandTotal']").html('0');
									$("*[data-lr='calculateTotal']").html('0');
									
								}
							}
							$("#cancel").click(function() {
								_thisMod.close();
								_this.printWindow(isPdfExportAllow);
							});
							$("#printCharges1").click(function() {
								if ($("#check1").is(":checked")) {
									for (var index in bookingCharges) {
										if (bookingCharges[index].wayBillBookingChargeChargeAmount != 0) {
											$("*[data-selector='chargeValue" + bookingCharges[index].chargeTypeMasterId + "']").html(bookingCharges[index].wayBillBookingChargeChargeAmount);
											$("*[data-lr='advanceAmount']").html(responseOut.advanceAmount);
											$("*[data-lr='calculateTotal']").html(responseOut.bookingTotal);
											
										}
									}
									_thisMod.close();
								}
								_thisMod.close();
								_this.printWindow(isPdfExportAllow);
							});
						} else {
							for (var index in bookingCharges) {
								if (bookingCharges[index].wayBillBookingChargeChargeAmount != 0) {
									$("*[data-selector='chargeValue" + bookingCharges[index].chargeTypeMasterId + "']").html(bookingCharges[index].wayBillBookingChargeChargeAmount);
									$("*[data-lr='advanceAmount']").html(responseOut.advanceAmount);
									$("*[data-lr='calculateTotal']").html(responseOut.bookingTotal);
								}
							}
							_thisMod.close();
							_this.printWindow(isPdfExportAllow);
						}
					});
					$('#popupForTbbAmount730').bPopup({}, function() {
						var _thisMod = this;

						if (wayBillTypeId == WAYBILL_TYPE_CREDIT) {
							$(this).html("<div class='confirm' style='height:150px;width:250px; padding:5px'>"
								+ "<div style='font-size:18px; color:DodgerBlue;text-align:center;'><b>Print Option</b><div><br/>"
								+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' id='check1'	/>&nbsp;<b style='font-size:14px;'>Print Charges</b><div>"
								+ "<p style='color:red'>Shortcut Keys : Enter = Yes, Esc = No</p>"
								+ "<button id='cancel'>Cancel</button>"
								+ "<button autofocus id='printCharges1'>Print</button></center></div>");


							$("#confirm").click(function() {
								_thisMod.close();
							});
							for (var index in bookingCharges) {
								if (bookingCharges[index].wayBillBookingChargeChargeAmount != 0) {
									$("*[data-selector='chargeValue" + bookingCharges[index].chargeTypeMasterId + "']").html('0');
									$("*[data-lr='advanceAmount']").html('0');
									$("*[data-lr='grandTotal']").html('0');
									$("*[data-lr='calculateTotal']").html('0');
									$("*[data-lr='chargeSum']").html('0');

								}
							}
							$("#cancel").click(function() {
								_thisMod.close();
								_this.printWindow(isPdfExportAllow);
							});
							$("#printCharges1").click(function() {
								if ($("#check1").is(":checked")) {
									for (var index in bookingCharges) {
										if (bookingCharges[index].wayBillBookingChargeChargeAmount != 0) {
											$("*[data-selector='chargeValue" + bookingCharges[index].chargeTypeMasterId + "']").html(bookingCharges[index].wayBillBookingChargeChargeAmount);
											$("*[data-lr='advanceAmount']").html(responseOut.advanceAmount);
											$("*[data-lr='calculateTotal']").html(responseOut.bookingTotal);
											$("*[data-lr='chargeSum']").html(responseOut.bookingChargesSum);
											$("*[data-lr='grandTotal']").html(responseOut.bookingTotal);
											
										}
									}
									_thisMod.close();
								}
								_thisMod.close();
								_this.printWindow(isPdfExportAllow);
							});
						} else {
							for (var index in bookingCharges) {
								if (bookingCharges[index].wayBillBookingChargeChargeAmount != 0) {
									$("*[data-selector='chargeValue" + bookingCharges[index].chargeTypeMasterId + "']").html(bookingCharges[index].wayBillBookingChargeChargeAmount);
									$("*[data-lr='advanceAmount']").html(responseOut.advanceAmount);
									$("*[data-lr='calculateTotal']").html(responseOut.bookingTotal);
									$("*[data-lr='chargeSum']").html(responseOut.bookingChargesSum);
									$("*[data-lr='grandTotal']").html(responseOut.bookingTotal);
											
								}
							}
							_thisMod.close();
							_this.printWindow(isPdfExportAllow);
						}
					});

					var isRePrint = responseOut.isReprint;

					if (isRePrint) {
						$('#printDuplicate').bPopup({
						}, function() {
							var _thisMod = this;
							$(this).html("<div class='confirm' style='height:200px;'><h1>Print Option </h1><input type='checkbox' id='duplicate' /><b>Print Duplicate</b><br><br><p id='shortcut' style='color: red;'></p><button id='cancelButton'>NO</button><button id='confirm'>YES</button></div>")
							$("#shortcut").html("Shortcut Keys : Enter = Yes, Esc = No")
							$("#confirm").focus();

							$("#confirm").click(function() {
								if ($('input[id="duplicate"]').prop("checked") == true) {
									$("#secondCopy").css("display", "none");
									$("#thirdCopy").css("display", "none");
								} else if ($('input[id="duplicate"]').prop("checked") == false) {
									$("#firstCopy").css("display", "block");
									$("#secondCopy").css("display", "block");
									$("#thirdCopy").css("display", "block");
								}
								_thisMod.close();
								_this.printWindow(isPdfExportAllow);
							})

							$("#confirm").on('keydown', function(e) {
								if (e.which == 27) {  //escape
									if ($('input[id="duplicate"]').prop("checked") == true) {
										$("#secondCopy").css("display", "none");
										$("#thirdCopy").css("display", "none");
									} else if ($('input[id="duplicate"]').prop("checked") == false) {
										$("#firstCopy").css("display", "block");
										$("#secondCopy").css("display", "block");
										$("#thirdCopy").css("display", "block");
									}
									_thisMod.close();
									_this.printWindow(isPdfExportAllow);
									_this.clearCharges(responseOut);
								}
							});
							$("#cancelButton").click(function() {
								$("#firstCopy").css("display", "block");
								$("#secondCopy").css("display", "block");
								$("#thirdCopy").css("display", "block");
								_thisMod.close();
								_this.printWindow(isPdfExportAllow);
								_this.clearCharges(responseOut);
							})
						});
					} else if (conf.duplicatePrint) {
						_this.printWindow(isPdfExportAllow);
					}

					$('#popUpContent233').bPopup({
					}, function() {
						var _thisMod = this;
						$(this).html("<div class='confirm'><table align='center'><tr><td colspan='2' style='text-align:center'><h1>Lr Print Options</h1>Edit LR Details<br/><br/></td></tr>"
							+ "<tr><td><input type='radio' name='actualWeight' value='true' checked>Show Actual Weight</td>"
							+ "<td><input type='radio'	name='actualWeight' value='false'>Hide Actual Weight</td></tr>"
							+ "<tr><td><input type='radio' name='chargedWeight' value='true' checked>Show Charged Weight</td>"
							+ "<td><input type='radio' name='chargedWeight' value='false'>Hide Charged Weight</td></tr>"
							+ "<tr><td><input type='radio' name='rate' value='true' checked >Show Rate</td>"
							+ "<td><input type='radio' name='rate' value='false'>Hide Rate</td></tr>"
							+ "<tr ><td class='headerbato'	><input type='radio' name='header' value='true'	 >Show Header</td>"
							+ "<td class='headerbato'><input type='radio' name='header' value='false' checked>Hide Header</td></tr></table>"
							+ "<button id='cancelButton'>NO</button><button autofocus id='confirm'>YES</button></div></div>")
						$('#confirm').focus();

						if (!responseOut.headerPopContentForLr)
							$('.headerbato').hide();

						$("#confirm").click(function() {
							$("#batoLRPrintTable_3").css({ 'margin-top': '912px' });
							$("#batoLRPrintTable_3").css({ 'position': 'absolute' });
							$("#batoLRPrintTable_2").css({ 'margin-top': '500px' });
							$("#batoLRPrintTable_2").css({ 'position': 'absolute' });
							$("#batoLRPrintTable_1").css({ 'margin-top': '100px' });
							$("#batoLRPrintTable_1").css({ 'position': 'absolute' });
							
							var	actualWeightVal = $("input[name='actualWeight']:checked").val();
							
							if (actualWeightVal == 'false') {
								$("*[data-selector='actualWeightConsignor']").remove();
								$("*[data-lr='actualWeightConsignor']").remove();
								$("*[data-selector='actualWeightConsignee']").remove();
								$("*[data-lr='actualWeightConsignee']").remove();
							}
							
							var chargedWeightVal = $("input[name='chargedWeight']:checked").val();
							
							if (chargedWeightVal == 'false') {
								$("*[data-selector='chargedWeightConsignor']").remove();
								$("*[data-lr='chargedWeightConsignor']").remove();
								$("*[data-selector='chargedWeightConsignee']").remove();
								$("*[data-lr='chargedWeightConsignee']").remove();
							}
							
							var rateVal = $("input[name='rate']:checked").val();
						
							if (rateVal == 'false') {
								$("*[data-selector='rateConsignor']").remove();
								$("*[data-lr='rateConsignor']").remove();
								$("*[data-selector='rateConsignee']").remove();
								$("*[data-lr='rateConsignee']").remove();
							}

							var	header = $("input[name='header']:checked").val();

							if (responseOut.headerPopContentForLr) {
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

					$('#popUpDataUpdateApt').bPopup({//399,435
					}, function() {
						var _thisMod = this;
						$(this).html("<div class='confirm'><table align='center'><tr><td colspan='2' style='text-align:center'><h1>Lr Print Options</h1>Edit LR Details<br/><br/></td></tr><tr><td><input type='radio' name='actualWeight' value='true' checked>Show Actual Weight</td><td><input type='radio'	name='actualWeight' value='false'>Hide Actual Weight</td></tr><tr><td><input type='radio' name='chargedWeight' value='true' checked>Show Charged Weight</td><td><input type='radio' name='chargedWeight' value='false'>Hide Charged Weight</td></tr><tr><td><input type='radio' name='rate' value='true' checked >Show Rate</td><td><input type='radio' name='rate' value='false'>Hide Rate</td></tr><tr><td><input type='radio' name='charges' value='true' checked >Show Charges</td><td><input type='radio' name='charges' value='false'>Hide Charges</td></tr></table><button id='cancelButton'>NO</button><button autofocus id='confirm'>YES</button></div></div>");
						var actualWeightVal;
						var chargedWeightVal;
						var rateVal;
						var charges
						$('#confirm').focus();

						$("#confirm").click(function() {
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
							charges = $("input[name='charges']:checked").val();
							if (charges == 'false') {
								$("*[data-selector='freight']").remove();
								$("*[data-lr='grandTotal']").remove();
								$("*[data-selector='grandTotal']").remove();
								$("*[data-lr='grandTotal']").remove();
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
							_thisMod.close();
							_this.printWindow(isPdfExportAllow);
						})

					});

					$('#popUpDataTBBCharge').bPopup({//285, 346
					}, function() {
						var _thisMod = this;
						$(this).html("<div class='confirm'><h1>Print option</h1><br><center><input type='checkbox' name='setCharges' id='setCharges' style='font-weight: bold;font-size: 20px;' checked />Print All Charges</center> <br><br><button type='button' name='cancel' id='cancel' class='btn-primary'>Cancel</button><button type='button' name='printCharges' id='printCharges' class='btn-primary' style='margin-left: 50px;'>Print</button>");

						$('.confirm').focus();
						$('#printCharges').focus();

						$("#cancel").click(function() {
							_thisMod.close();
							$('#removeCharges').css('display', 'table');
							_this.printWindow(isPdfExportAllow);
						})

						$("#printCharges").click(function() {
							_thisMod.close();
							if ($("#setCharges").prop("checked")) {
								$('#removeCharges').css('display', 'table');
								_this.printWindow(isPdfExportAllow);
							} else {
								$('#removeCharges').css('display', 'none');
								_this.printWindow(isPdfExportAllow);
							}
						})
					});
					//popup for Print Amount
					if (responseOut.lrPrintType == 'lrprint_204' || responseOut.lrPrintType == 'lrprint_dot_matrix_204' || responseOut.lrPrintType == 'lrprint_A4_204') {
			if(wayBillTypeId == WAYBILL_TYPE_CREDIT){
				$('#popUpContent204').bPopup({
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
							$("[data-lr='rate']").html(0);
							_this.printWindow();
						})

						$("#printCharges").click(function() {
							if ($("#setAmount").is(":checked")) {
								_thisMod.close();
								_this.printWindow();
							} else if ($("#setAmount").not(":checked")) {
								_this.setZeroAmount(chargeTypeModelArr);
								$("[data-lr='rate']").html(0);
								_thisMod.close();
								_this.printWindow();
							}
						});

					});
					}else{
						_this.printWindow();
					}
					}

					// common popup
					$('#popupTbbPrintZeroCharges').bPopup({}, function() {
						var _thisMod = this;
						$(this).html("<div class='confirm' style='height:180px'><h1>Print option</h1><br><center>" +
							"<label><input type='checkbox' id='printCharges' style='font-weight: bold;font-size: 20px;' checked />Print Charges</label> " +
							"<br><br><button type='button' name='cancel' id='cancel' class='btn-primary'>Cancel</button>" +
							"<button type='button' id='print' class='btn-primary' style='margin-left: 50px;'>Print</button>");

						$('#print').focus();

						$("#cancel").click(function() {
							if ($("#printCharges").is(":checked")) {
								_thisMod.close();
							} else if ($("#printCharges").not(":checked")) {
								_this.setZeroAmount(chargeTypeModelArr);
								_thisMod.close();
							}
						})

						$("#print").click(function() {
							if ($("#printCharges").is(":checked")) {
								_thisMod.close();
								_this.printWindow();
							} else if ($("#printCharges").not(":checked")) {
								_this.setZeroAmount(chargeTypeModelArr);
								_thisMod.close();
								_this.printWindow();
							}
						});
					});

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
					$('#popUpDataPrabhatTBBLrprint').bPopup({
					}, function() {
						_this.hideCharges(chargeTypeModelArr);

						var _thisMod = this;
						$(this).html("<div class='confirm' style='height:180px'><h1>Print option</h1><br><center>" +
							"<input type='checkbox'	 name='setAmount' id='setAmount' style='font-weight: bold;font-size: 20px;' checked />Print Charges</center> " +
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
								_this.showCharges(chargeTypeModelArr);
								_thisMod.close();
								_this.printWindow();
							} else if ($("#setAmount").not(":checked")) {
								_this.setZeroAmount(chargeTypeModelArr);
								_thisMod.close();
								_this.printWindow();
							}
						});

					});

					function tbbPrint() {

						$('#popUpContent301').bPopup({
						}, function() {
							_this.hideCharges(chargeTypeModelArr);

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
									_this.showCharges(chargeTypeModelArr);
									_thisMod.close();
									_this.printWindow();
								} else if ($("#setAmount").not(":checked")) {
									_this.setZeroAmount(chargeTypeModelArr);
									_thisMod.close();
									_this.printWindow();
								}
							});

						});
					}

					if (document.getElementById('popUpContent45') != null) {
						if (responseOut.popupToAllowShowHideCharges) {
							$('#popUpContent45').bPopup({
							}, function() {
								_this.hideCharges(chargeTypeModelArr);
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
										_this.showCharges(chargeTypeModelArr);
										_thisMod.close();
										_this.printWindow();
									} else if ($("#setAmount").not(":checked")) {
										_this.setZeroAmount(chargeTypeModelArr);
										_thisMod.close();
										_this.printWindow();
									}
								});

							});
						} else
							_this.printWindow(isPdfExportAllow);
					}

					// lr print

					$('#popUpContent342').bPopup({
					}, function() {
						var _thisMod = this;

						$(this).html("<div class='confirm' style='height:150px;width:250px; padding:5px'>"
							+ "<div style='font-size:18px; color:DodgerBlue;text-align:center;'><b>Print Option</b><div><br/>"
							+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' id='check'/>&nbsp;<b style='font-size:14px;'>Print Charges</b><div>"

							+ "<button id='cancel'>Cancel</button>"
							+ "<button autofocus id='printCharges'>Print</button></center></div>")
						$("#shortcut").html("Shortcut Keys : Enter = Print, Esc = Cancel")
						$("#confirm").focus();
						$('#printCharges').focus();
						$(".otherCharges").hide();
						$(".showChargeSTL").hide();

						$(document).on('keydown', function(event) {
							if (event.keyCode == 27) {
								window.close();
							}
						});
						$("#confirm").click(function() {
							_thisMod.close();
							_this.printWindow(isPdfExportAllow);
						})

						$("#cancel").click(function() {
							_thisMod.close();
							window.close();
						});

						$("#printCharges").click(function() {
							if ($("#check").is(":checked")) {
								$(".showChargeSTL").show();
								$(".otherCharges").hide();
							} else if ($("#check").not(":checked")) {
								$(".showChargeSTL").hide();
								$(".otherCharges").hide();
							}

							_thisMod.close();
							_this.printWindow(isPdfExportAllow);
						})

					});

					$('#popUpContentForQrCodeOption').bPopup({
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
						})

						$('#confirm').click(function() {
							if ($('#printLR').prop('checked') && $('#printQR').prop('checked')) {
								_thisMod.close();
								_this.printBillWindow();
								_this.setQRDetails();
							} else if ($('#printLR').prop('checked')) {
								_thisMod.close();
								_this.printBillWindow();
							} else if ($('#printQR').prop('checked')) {
								_thisMod.close();
								_this.setQRDetails();
								window.close();
							} else {
								window.close();
							}
							_thisMod.close();
						});
						$('#confirm').on('keydown', function(e) {
							if (e.which == 27) {  //escape
								//	window.close();
							}
						});
					});

					
					
					$('#popUpContent810').bPopup({
					}, function() {
						var _thisMod = this;
						$(this).html("<div class='confirm' style='height:150px; width: 200px;'><br><br><center>" +
							"<label><input type='checkbox' id='printStationary' style='font-weight: bold;font-size: 20px;' checked />Print Stationary</label></center> " +
							"<br><button type='button' id='cancelBtn' class='btn-primary'>Cancel</button>" +
							"<button type='button' id='printBtn' class='btn-primary' style='margin-left: 50px;'>Print</button>");

						$('#printBtn').focus();
						$('#printBtn').click(function() {
							if (!$("#printStationary").is(":checked")) {
								$("body").addClass("preprinted")
							}
							_thisMod.close();
							_this.printWindow();
						})
						$("#cancelBtn").click(function() {
							_thisMod.close();
						})

					});
					
			if (responseOut.lrPrintType == 'lrprint_604') {
						
				 if (wayBillTypeId == WAYBILL_TYPE_CREDIT) {
					$('#popupForTbbAmount604').bPopup({}, function() {
						var _thisMod = this;

						
							$(this).html("<div class='confirm' style='height:150px;width:250px; padding:5px'>"
								+ "<div style='font-size:18px; color:DodgerBlue;text-align:center;'><b>Print Option</b><div><br/>"
								+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' id='check1'	/>&nbsp;<b style='font-size:14px;'>Print Charges</b><div>"
								+ "<p style='color:red'>Shortcut Keys : Enter = Yes, Esc = No</p>"
								+ "<button id='cancel'>Cancel</button>"
								+ "<button autofocus id='printCharges1'>Print</button></center></div>");

							$("#confirm").click(function() {
								_thisMod.close();
							});
							for (var index in bookingCharges) {
								if (bookingCharges[index].wayBillBookingChargeChargeAmount != 0) {
									$("*[data-selector='chargeValue" + bookingCharges[index].chargeTypeMasterId + "']").html(' ');
									$("*[data-lr='grandTotal']").html(' ');
									$("*[data-lr='chargeSum']").html(' ')
									$("*[data-selector='chargeValue29']").html(' ');
									$("*[data-selector='chargeValue24']").html(' ');
									$("*[data-selector='chargeValue25']").html(' ');
									$("*[data-selector='chargeValue101']").html(' ');
									$("*[data-selector='chargeValue8']").html(' ');
									
								}
							}
							$("#cancel").click(function() {
								_thisMod.close();
								_this.printWindow(isPdfExportAllow);
							});
							$("#printCharges1").click(function() {
								if ($("#check1").is(":checked")) {
									for (var index in bookingCharges) {
										if (bookingCharges[index].wayBillBookingChargeChargeAmount != 0) {
											$("*[data-selector='chargeValue" + bookingCharges[index].chargeTypeMasterId + "']").html(bookingCharges[index].wayBillBookingChargeChargeAmount);
											$("*[data-lr='grandTotal']").html(responseOut.bookingTotal);
											$("*[data-lr='actualWeight']").html(responseOut.actualWeight);
											$("*[data-lr='rate']").html(responseOut.articleRate + '/Art');
											$("*[data-lr='chargeSum']").html(responseOut.bookingChargesSum);
										}
									}
									_thisMod.close();
								}
								_thisMod.close();
								_this.printWindow(isPdfExportAllow);
							});
						
					});
						}else{
						_this.printWindow(isPdfExportAllow);
					}
				}if(responseOut.lrPrintType == 'lrprint_A4_806')
                    _this.printWindow(isPdfExportAllow);
			} else if (!isQRPrintOnPopUpSelection)
				_this.printWindow(isPdfExportAllow);
			}, printWindow: function(isPdfExportAllow) {
				if (!isPdfExportAllow) {
					hideLayer();
					setTimeout(function() {
						window.print(); window.close();
						localStorage.removeItem("imageObjet");
					}, 500);
				}

			}, clearCharges: function(responseOut) {
				var wayBillTypeId = responseOut.wayBillTypeId;

				$("*[data-popup='popup']").children().children().children().html('0');
				$("*[data-popup='popup1']").children().children().children().html(' ');
				$("*[data-popup='popup2']").children().children().html(' ');
				$("*[data-popup='popup3']").children().children().children().html(' ');
				$("*[data-popup='popup5']").html(' ');
				$('.popup3').remove();

				if (wayBillTypeId == WAYBILL_TYPE_CREDIT) {
					$("*[data-lr='chargeSum']").empty();
					$("*[data-lr='rate']").empty();
				}

				setTimeout(function() { window.print(); window.close(); }, 500);
			}, charLimit: function() {
				$('[data-charlimit]').each(function() {
					var attrString = $(this).html();
					var limitRange = $(this).data('charlimit');
					if (attrString.length > limitRange) {
						attrString = attrString.substring(0, limitRange) + '..';
						$(this).html(attrString);
					}
				})
			}, setGstTaxDetails: function(responseOut) {
				let wayBillTaxTxnHM = responseOut.wayBillTaxTxnHM;
				let configuration = responseOut.configuration;
				let isDisplayWayBillTypeWiseData = configuration.isDisplayWayBillTypeWiseData;
				let wayBillTypeId = responseOut.wayBillTypeId;
				let waybillBookingChargesList = responseOut.waybillBookingChargesList;
				let chargeTypeModelArr = responseOut.chargeTypeModelArr;
				let STPaidBy = responseOut.STPaidBy;
				let taxTypeId = responseOut.taxTypeId;
				
				let cgstAddedUnAdded = 0;
				let sgstAddedUnAdded = 0;
				let igstAddedUnAdded = 0;

				if (wayBillTaxTxnHM != undefined && wayBillTaxTxnHM != null) {
					for (var key in wayBillTaxTxnHM) {
						if (key == SERVICE_TAX_MASTER_ID)
							$("*[data-gst='serviceTax']").html(wayBillTaxTxnHM[key].taxAmount);

						if (key == SGST_MASTER_ID) {
							$("*[data-gst='sgstAmount']").html(Math.round(wayBillTaxTxnHM[key].taxAmount));
							$("*[data-gst='sgst']").html(Math.round(wayBillTaxTxnHM[key].taxAmount));
							$("*[data-gst='sgstWithNoRound']").html(wayBillTaxTxnHM[key].taxAmount);
							$("*[data-gstwithdecimal='sgst']").html((wayBillTaxTxnHM[key].taxAmount).toFixed(2));

							if (STPaidBy == TAX_PAID_BY_CONSINGOR_ID || STPaidBy == TAX_PAID_BY_CONSINGEE_ID)
								sgstAddedUnAdded = Math.round(wayBillTaxTxnHM[key].unAddedTaxAmount);
							else if (STPaidBy == TAX_PAID_BY_TRANSPORTER_ID)
								sgstAddedUnAdded = Math.round(wayBillTaxTxnHM[key].taxAmount);

							$("*[data-gst='consignorsgst']").html(Math.round(wayBillTaxTxnHM[key].taxAmount));
							$("*[data-gst='consigneesgst']").html(Math.round(wayBillTaxTxnHM[key].taxAmount));
							$("*[data-gst='transportersgst']").html(Math.round(wayBillTaxTxnHM[key].taxAmount));

							if (Math.round(wayBillTaxTxnHM[key].taxAmount) > 0){
								$(".sgstText").show();
								$(".sgstAmount").show();
							}

							if (Math.round(wayBillTaxTxnHM[key].taxAmount) > 0)
								$('.sgstTd').html('SGST @ 2.5%');
							else
								$('.sgstTd').html('SGST');
						}

						if (key == CGST_MASTER_ID) {
							$("*[data-gst='cgstAmount']").html(Math.round(wayBillTaxTxnHM[key].taxAmount));
							$("*[data-gst='cgst']").html(Math.round(wayBillTaxTxnHM[key].taxAmount));
							$("*[data-gst='cgstWithNoRound']").html(wayBillTaxTxnHM[key].taxAmount);
							$("*[data-gstwithdecimal='cgst']").html((wayBillTaxTxnHM[key].taxAmount).toFixed(2));

							if (STPaidBy == TAX_PAID_BY_CONSINGOR_ID || STPaidBy == TAX_PAID_BY_CONSINGEE_ID)
								cgstAddedUnAdded = Math.round(wayBillTaxTxnHM[key].unAddedTaxAmount);
							else if (STPaidBy == TAX_PAID_BY_TRANSPORTER_ID)
								cgstAddedUnAdded = Math.round(wayBillTaxTxnHM[key].taxAmount);

							$("*[data-gst='consignorcgst']").html(Math.round(wayBillTaxTxnHM[key].taxAmount));
							$("*[data-gst='consigneecgst']").html(Math.round(wayBillTaxTxnHM[key].taxAmount));
							$("*[data-gst='transportercgst']").html(Math.round(wayBillTaxTxnHM[key].taxAmount));

							if (Math.round(wayBillTaxTxnHM[key].taxAmount) > 0) {
								$(".cgstAmount").show();
								$(".cgstText").show();
							}

							if (Math.round(wayBillTaxTxnHM[key].taxAmount) > 0)
								$('.cgstTd').html('CGST @ 2.5%');
							else
								$('.cgstTd').html('CGST');
								
							$("*[data-gst='totalGstPercent']").html(wayBillTaxTxnHM[key].percentTaxAmount * 2);
						}

						if (key == IGST_MASTER_ID) {
							$("*[data-gst='igstAmount']").html(Math.round(wayBillTaxTxnHM[key].taxAmount));
							$("*[data-gst='igst']").html(Math.round(wayBillTaxTxnHM[key].taxAmount));
							$("*[data-gst='igstWithNoRound']").html(wayBillTaxTxnHM[key].taxAmount);
							$("*[data-gstwithdecimal='igst']").html((wayBillTaxTxnHM[key].taxAmount).toFixed(2));

							if (STPaidBy == TAX_PAID_BY_CONSINGOR_ID || STPaidBy == TAX_PAID_BY_CONSINGEE_ID)
								igstAddedUnAdded = Math.round(wayBillTaxTxnHM[key].unAddedTaxAmount);
							else if (STPaidBy == TAX_PAID_BY_TRANSPORTER_ID)
								igstAddedUnAdded = Math.round(wayBillTaxTxnHM[key].taxAmount);

							$("*[data-gst='consignorigst']").html(Math.round(wayBillTaxTxnHM[key].taxAmount));
							$("*[data-gst='consigneeigst']").html(Math.round(wayBillTaxTxnHM[key].taxAmount));
							$("*[data-gst='transporterigst']").html(Math.round(wayBillTaxTxnHM[key].taxAmount));

							if (Math.round(wayBillTaxTxnHM[key].taxAmount) > 0) {
								$(".igstAmount").show();
								$(".igstText").show();
								$('.igstTd').html('IGST @ 5%');
							} else
								$('.igstTd').html('IGST');
								
							$("*[data-gst='totalGstPercent']").html(wayBillTaxTxnHM[key].percentTaxAmount);
						}
					}

					if (STPaidBy == TAX_PAID_BY_CONSINGOR_ID || STPaidBy == TAX_PAID_BY_CONSINGEE_ID) {
						if (cgstAddedUnAdded > 0 && sgstAddedUnAdded > 0) {
							$("*[data-selector='addedUnAddedTaxDetails']").html(' (CGST:' + cgstAddedUnAdded + ', SGST:' + sgstAddedUnAdded + ')');
							$("*[data-selector='addedUnAddedTaxDetail']").html(' CGST: &#8377 .' + cgstAddedUnAdded + ', SGST: &#8377.' + sgstAddedUnAdded);
						} else if (igstAddedUnAdded > 0) {
							$("*[data-selector='addedUnAddedTaxDetails']").html(' (IGST:' + igstAddedUnAdded + ')');
							$("*[data-selector='addedUnAddedTaxDetail']").html(' IGST: &#8377 .' + igstAddedUnAdded + '');
						}
					} else if (STPaidBy == TAX_PAID_BY_TRANSPORTER_ID) {
						if (cgstAddedUnAdded > 0 && sgstAddedUnAdded > 0) {
							$("*[data-selector='addedUnAddedTaxDetails']").html(' (CGST:' + cgstAddedUnAdded + ', SGST:' + sgstAddedUnAdded + ')');
							$("*[data-selector='addedUnAddedTaxDetail']").html(' CGST: &#8377 .' + cgstAddedUnAdded + ', SGST: &#8377.' + sgstAddedUnAdded);
						} else {
							$("*[data-selector='addedUnAddedTaxDetails']").html(' (IGST:' + igstAddedUnAdded + ')');
							$("*[data-selector='addedUnAddedTaxDetail']").html(' IGST: &#8377 .' + igstAddedUnAdded);
						}
					}
				}
				
				if (configuration.customGroupLabel || configuration.customGroupLabel == true) {
					if (wayBillTypeId == WAYBILL_TYPE_CREDIT) {
						$(".freightColumn").html('TBB');
						$(".freightColumn_347").html('TBB');
						$(".BiltyColumn").html('');
						$(".hamaliColumn").html('');
						$(".hamaliColumn2").html('TBB');
						$(".AocColumn").html('');
						$(".AocColumn3").html('TBB');
						$(".LrChargeColumn").html('TBB');
						$(".collectionColumn").html('');
						$(".collectionColumn4").html('TBB');
						$(".DoordeliveryColumn").html('');
						$(".DoordeliveryColumn5").html('TBB');
						$(".TotalColumn").html('TBB');
						$(".CgstColumn").html('TBB');
						$(".SgstColumn").html('TBB');
						$(".freightColumn_342").html('TBB');
						$(".BiltyColumn_342").html('');
						$(".hamaliColumn_342").html('');
						$(".AocColumn_342").html('');
						$(".collectionColumn_342").html('');
						$(".DoordeliveryColumn_342").html('');
						$(".CgstColumn_342").html('');
						$(".SgstColumn_342").html('');
						$(".grandTotalcolum_342").html('TBB');
						$(".grandTotalInWord_342").html('--');
						$(".grandTotalInWord").html('--');
						$("*[data-gst='igst']").html('');
						$(".staxColumn").html('');
						$(".grandTotalcolum").html('TBB');
						$(".grandTotalcolum6").html('TBB');
						$(".Column").removeAttr('data-Selector');
						$(".Column").html("");
					} else if (wayBillTypeId == WAYBILL_TYPE_PAID) {
						$(".freightColumn").html('PAID');
						$(".BiltyColumn").html('');
						$(".hamaliColumn").html('');
						$(".AocColumn").html('');
						$(".collectionColumn").html('');
						$(".DoordeliveryColumn").html('');
						$(".staxColumn").html('');
						$(".grandTotalcolum").html('PAID');
						$(".grandTotalInWord_342").html('--');
					}
				}

				if ((configuration.showAmountInTransporterCopyOnly || configuration.showAmountInTransporterCopyOnly == true)
					&& wayBillTypeId == WAYBILL_TYPE_PAID)
					$(".hideAmountColumnForPaidLr").html('');

				// For kothari travels
				if (configuration.grandTotalForPaidLR) {
					var freight = 0;
					var loading = 0;
					var cartage = 0;
					var sgst = 0;
					var cgst = 0;
					var igst = 0;
					var totalForKTPaidRhs = 0;

					if (waybillBookingChargesList != undefined) {
						for (var index in waybillBookingChargesList) {
							if (waybillBookingChargesList[index].chargeTypeMasterId == FREIGHT)
								freight = waybillBookingChargesList[index].wayBillBookingChargeChargeAmount;
							else if (waybillBookingChargesList[index].chargeTypeMasterId == LOADING)
								loading = waybillBookingChargesList[index].wayBillBookingChargeChargeAmount;
							else if (waybillBookingChargesList[index].chargeTypeMasterId == CARTAGE_CHARGE)
								cartage = waybillBookingChargesList[index].wayBillBookingChargeChargeAmount;
						}
					}

					for (var key in wayBillTaxTxnHM) {
						if (key == SGST_MASTER_ID)
							sgst = wayBillTaxTxnHM[key].taxAmount;

						if (key == CGST_MASTER_ID)
							cgst = wayBillTaxTxnHM[key].taxAmount;

						if (key == IGST_MASTER_ID)
							igst = wayBillTaxTxnHM[key].taxAmount;
					}

					$("*[data-selector='chargeValue1Rhs']").html(freight);
					$("*[data-selector='chargeValue4Rhs']").html(loading);
					$("*[data-selector='chargeValue59Rhs']").html(cartage);
					
					if (wayBillTypeId == WAYBILL_TYPE_PAID) {
						$("*[data-selector='fre']").hide();
						$("*[data-selector='load']").hide();
						$("*[data-selector='cartge']").hide();

						$("*[data-selector='chargeValue1Rhs']").hide();
						$("*[data-selector='chargeValue4Rhs']").hide();
						$("*[data-selector='chargeValue59Rhs']").hide();

						totalForKTPaidRhs = freight + sgst + cgst + igst;
						$("#paidRhsTotalKT").html(Math.round(totalForKTPaidRhs));
					}
				}

				if (isDisplayWayBillTypeWiseData) {
					if (wayBillTypeId == WAYBILL_TYPE_PAID || wayBillTypeId == WAYBILL_TYPE_CREDIT) {
						$("*[data-hidetbbpaidgstamount='serviceTax']").html(0);
						$("*[data-hidetbbpaidgstamount='sgst']").html(0);
						$("*[data-hidetbbpaidgstamount='cgst']").html(0);
						$("*[data-hidetbbpaidgstamount='igst']").html(0);

						$("*[data-gst='consigneesgst']").html('0');
						$("*[data-gst='transportersgst']").html('0');
						$("*[data-gst='consigneecgst']").html('0');
						$("*[data-gst='transportercgst']").html('0');
						$("*[data-gst='consigneeigst']").html('0');
						$("*[data-gst='transporterigst']").html('0');

						if (wayBillTypeId == WAYBILL_TYPE_PAID) {
							for (var key in wayBillTaxTxnHM) {
								if (key == SERVICE_TAX_MASTER_ID)
									$("*[data-hidetbbgstamount='serviceTax']").html(wayBillTaxTxnHM[key].taxAmount);

								if (key == SGST_MASTER_ID) {
									$("*[data-hidetbbgstamount='sgst']").html(Math.round(wayBillTaxTxnHM[key].taxAmount));

									if (Math.round(wayBillTaxTxnHM[key].taxAmount) > 0)
										$(".sgstText").show();
								}

								if (key == CGST_MASTER_ID) {
									$("*[data-hidetbbgstamount='cgst']").html(Math.round(wayBillTaxTxnHM[key].taxAmount));

									if (Math.round(wayBillTaxTxnHM[key].taxAmount) > 0)
										$(".cgstText").show();
								}

								if (key == IGST_MASTER_ID) {
									$("*[data-hidetbbgstamount='igst']").html(Math.round(wayBillTaxTxnHM[key].taxAmount));

									if (Math.round(wayBillTaxTxnHM[key].taxAmount) > 0)
										$(".igstText").show();
								}
							}
						}
					} else {
						for (var key in wayBillTaxTxnHM) {
							if (key == SERVICE_TAX_MASTER_ID) {
								$("*[data-hidetbbpaidgstamount='serviceTax']").html(wayBillTaxTxnHM[key].taxAmount);
								$("*[data-hidetbbgstamount='serviceTax']").html(wayBillTaxTxnHM[key].taxAmount);
							}

							if (key == SGST_MASTER_ID) {
								$("*[data-hidetbbpaidgstamount='sgst']").html(Math.round(wayBillTaxTxnHM[key].taxAmount));
								$("*[data-hidetbbgstamount='sgst']").html(Math.round(wayBillTaxTxnHM[key].taxAmount));

								if (Math.round(wayBillTaxTxnHM[key].taxAmount) > 0)
									$(".sgstText").show();
							}

							if (key == CGST_MASTER_ID) {
								$("*[data-hidetbbpaidgstamount='cgst']").html(Math.round(wayBillTaxTxnHM[key].taxAmount));
								$("*[data-hidetbbgstamount='cgst']").html(Math.round(wayBillTaxTxnHM[key].taxAmount));

								if (Math.round(wayBillTaxTxnHM[key].taxAmount) > 0)
									$(".cgstText").show();
							}

							if (key == IGST_MASTER_ID) {
								$("*[data-hidetbbpaidgstamount='igst']").html(Math.round(wayBillTaxTxnHM[key].taxAmount));
								$("*[data-hidetbbgstamount='igst']").html(Math.round(wayBillTaxTxnHM[key].taxAmount));

								if (Math.round(wayBillTaxTxnHM[key].taxAmount) > 0)
									$(".igstText").show();
							}
						}
					}
				}

				var chargeIdArr = (configuration.ChargeIdsExceptionForTBBLabel).split(",");
				
				if (configuration.replaceLrChargesWithTBB) {
					if (wayBillTypeId == WAYBILL_TYPE_CREDIT && chargeTypeModelArr != undefined) {
						for (var index in chargeTypeModelArr) {
							if (!isValueExistInArray(chargeIdArr, chargeTypeModelArr[index].chargeTypeMasterId))
								$("*[data-selector='chargeValue" + chargeTypeModelArr[index].chargeTypeMasterId + "']").html("TBB ");
						}

						$("*[data-lr='grandTotal']").html("");
						$("*[data-lr='bookingServicetax']").html("");
					}
				}
				
				$("*[data-lr='grandTotal2']").html(responseOut.bookingTotal);
				
				if (configuration.replaceLrChargesWithTBBInZero) {
					if (wayBillTypeId == WAYBILL_TYPE_CREDIT && chargeTypeModelArr != undefined) {
						for (var index in chargeTypeModelArr) {
							if (!isValueExistInArray(chargeIdArr, chargeTypeModelArr[index].chargeTypeMasterId))
								$("*[data-selector='chargeValue" + chargeTypeModelArr[index].chargeTypeMasterId + "']").html("0");
						}

						$("*[data-gst='sgst']").html("");
						$("*[data-gst='cgst']").html("");
						$("*[data-gst='igst']").html("");
						$("*[data-lr='grandTotal']").html("0");
						$("*[data-lr='grandTotal2']").html("TBB");
						$("*[data-lr='bookingServicetax']").html("0");
						$("*[data-lr='rate']").html("0");
						$(".hideBookingCharges").html("0");
					} else if(accountGroupId == ACCOUNT_GROUP_ID_NSMT && wayBillTypeId == WAYBILL_TYPE_PAID) {
						$(".truckCopy *[data-selector^='chargeValue']").html("&nbsp;")
						$(".truckCopy *[data-lr='grandTotal2']").html("&nbsp;")
						$(".consigneeCopy *[data-selector^='chargeValue']").html("&nbsp;")
						$(".consigneeCopy *[data-lr='grandTotal2']").html("&nbsp;")
					}
				}

				var allCharges = $(".ChargeRow");

				for (const element of allCharges) {
					if (element != undefined && element.offsetParent != null) {
						var id = element.offsetParent.id;

						if (configuration.replaceLrChargesWithTBB && wayBillTypeId == WAYBILL_TYPE_CREDIT) {
							if (configuration.replaceLrChargeWithTbbInAllCopy == true || configuration.replaceLrChargeWithTbbInAllCopy) {
								$(".FirstCopy").html("");
								$(".SecondCopy").html("");
							} else if (id == "secondCopyTbody" || id == "thirdCopyTbody" || id == "firstCopyTbody1") {
								element.innerHTML = "TBB";
								$(".grandTotalThirdCopy").html("TBB");
								$(".grandTotalSecondCopy").html("TBB");
							}
						}
						
						if (configuration.replaceLrChargesWithblank && wayBillTypeId == WAYBILL_TYPE_CREDIT) {
							if (configuration.replaceLrChargeWithTbbInAllCopy == true || configuration.replaceLrChargeWithTbbInAllCopy) {
								$(".FirstCopy").html("");
								$(".SecondCopy").html("");
							} else if (id == "secondCopyTbody" || id == "thirdCopyTbody") {
								element.innerHTML = " ";
								$(".grandTotalThirdCopy").html(" ");
								$(".grandTotalSecondCopy").html(" ");
							}
						}
					}
				}

				if (configuration.replaceZeroAmountChargesWithBlank) {
					for (var key in wayBillTaxTxnHM) {
						if (key == SGST_MASTER_ID && Math.round(wayBillTaxTxnHM[key].taxAmount) <= 0)
							$("*[data-gst='sgst']").html('');

						if (key == CGST_MASTER_ID && Math.round(wayBillTaxTxnHM[key].taxAmount) <= 0)
							$("*[data-gst='cgst']").html('');

						if (key == IGST_MASTER_ID && Math.round(wayBillTaxTxnHM[key].taxAmount) <= 0)
							$("*[data-gst='igst']").html('');
					}
				}

				if ((responseOut.destinationSubRegionId == 10638 && wayBillTypeId == WAYBILL_TYPE_PAID) || wayBillTypeId == WAYBILL_TYPE_PAID) {
					$(".hidegrandtotalforslplPOD").show();
				} else if ( wayBillTypeId == WAYBILL_TYPE_CREDIT) {
					$(".hidegrandtotalforslpl").html('&nbsp;');
					$(".hidegrandtotalforslplPOD").hide();
				}

				if (configuration.removeGrandTotalForToPayAndTBB
					&& (wayBillTypeId == WAYBILL_TYPE_CREDIT || wayBillTypeId == WAYBILL_TYPE_TO_PAY)
					&& ($("*[data-lr='grandTotal']").html() == '0'))
					$("*[data-lr='grandTotal']").html('&nbsp;')

				let totalGst = responseOut.totalGst;

				$("*[data-gst='total']").html(Math.round(totalGst));
				$("*[data-gst='roundOffGst']").html((Math.round(totalGst) - totalGst).toFixed(2));

				if (totalGst > 0) {
					$(".gstToBePaidBy").css("display", "block");
					$("*[data-gst='gstCollect']").html("NO");
					$(".gstToBePaidByRow").addClass("hide");
				} else {
					$(".gstToBePaidBy").css("display", "none");
					$("*[data-gst='gstCollect']").html("YES");
				}
					
				if((accountGroupId == 595 || accountGroupId == 905) && (STPaidBy == TAX_PAID_BY_CONSINGOR_ID && responseOut.wayBillTypeId == WAYBILL_TYPE_PAID 
						|| STPaidBy == TAX_PAID_BY_CONSINGEE_ID && responseOut.wayBillTypeId == WAYBILL_TYPE_TO_PAY)) {
					let gstAmt 		= responseOut.bookingTimeUnAddedTaxAmount;
					let cgstSgst	= Math.round(gstAmt/2);
					let igstAmt		= Math.round(gstAmt);
					
					if(responseOut.waybillDestinationStateId == responseOut.waybillSourceStateId) {
						$("*[data-gst='cgstAmount']").html(cgstSgst);
						$("*[data-gst='sgstAmount']").html(cgstSgst);
						$(".cgstAmount").show();
						$(".sgstAmount").show();
					} else {
						$("*[data-gst='igstAmount']").html(igstAmt);
						$(".igstAmount").show();
					}
				}
				
				let consigneeGSTN = responseOut.consigneeGstn;
				let consignorGSTN = responseOut.consignorGstn;
					
				if (responseOut.wayBillTypeId == WAYBILL_TYPE_PAID && consignorGSTN != undefined) {
					if (consignorGSTN.substring(0, 2) == "29") {
						$(".gstForChittor").html(0);
						$(".igstForChittorRow").attr("style", "display: none !important");
						$(".gstForChittorRow").removeClass("hide");
						$(".cgstForChittorLabel").html("CGST@2.5%");
						$(".sgstForChittorLabel").html("SGST@2.5%");
					} else {
						$(".igstForChittor").html(0);
						$(".gstForChittorRow").addClass("hide");
						$(".igstForChittorRow").removeClass("hide");
						$(".igstForChittorLabel").html("IGST@5%");
					}
				} else if (responseOut.wayBillTypeId == WAYBILL_TYPE_TO_PAY && consigneeGSTN != undefined) {
					if (consigneeGSTN.substring(0, 2) == "29") {
						$(".gstForChittor").html(0);
						$(".igstForChittorRow").attr("style", "display: none !important");
						$(".gstForChittorRow").removeClass("hide");
						$(".cgstForChittorLabel").html("CGST@2.5%");
						$(".sgstForChittorLabel").html("SGST@2.5%");
					} else {
						$(".igstForChittor").html(0);
						$(".gstForChittorRow").addClass("hide");
						$(".igstForChittorRow").removeClass("hide");
						$(".igstForChittorLabel").html("IGST@5%");
					}
				}
				
				if(taxTypeId == TAX_TYPE_FCM) {
					$("*[data-lable='igstLable']").html('18%');
					$("*[data-lable='cgstSgstLable']").html('9%');
					$('.taxTypewiseshowHide').removeClass('hide')
				} else if (taxTypeId == TAX_TYPE_RCM) {
					$("*[data-lable='igstLable']").html('5%');
					$("*[data-lable='cgstSgstLable']").html('2.5%');
					$('.taxTypewiseshowHide').addClass('hide')
				}
				
			}, setBranchDetails: function(responseOut) {
				let configuration = responseOut.configuration;

				let showBranchWisePrint = configuration.showBranchWisePrint;
				let branchIdWisePrint = configuration.BranchIdWisePrint;

				if (showBranchWisePrint) {
					let branchIDs = branchIdWisePrint.split(",");

					if (isValueExistInArray(branchIDs, responseOut.executiveBranchId))
						$("#table4").hide();
				}
			}, removePaidHamaliGrandTotal: function(responseOut) {
				var configuration = responseOut.configuration;
				var wayBillTypeId = responseOut.wayBillTypeId;
				var waybillBookingChargesList = responseOut.waybillBookingChargesList;
				var paidhamali = 0;
				var freight = 0;
				var loading = 0;
				var cartage = 0;
				var crossing = 0;
				var grandTotalForRT = 0;
				var grandTotalForRTPaidRhs = 0;
				var commission = 0;
				var gstCharge =0;
				var docket =0;
				var doordly =0;
				var handling =0;
				var pickup =0;
				var transhipment =0;
				var insurance =0;
				var fuelCharge =0;
				var otherCharge =0;
				var tempoBhada	= 0;

				if (wayBillTypeId == WAYBILL_TYPE_TO_PAY) {
					if (configuration.removePaidHamaliTotalAmount) {
						paidhamali = $("*[data-selector='chargeValue19']").html();
						$("*[data-lr='grandTotalsrs']").html((responseOut.bookingTotal) - paidhamali)
					}
				} else {
					$("*[data-lr='grandTotalsrs']").html((responseOut.bookingTotal))
				}

				if (waybillBookingChargesList != undefined) {
					for (var index in waybillBookingChargesList) {
						if (waybillBookingChargesList[index].chargeTypeMasterId == FREIGHT)
							freight = waybillBookingChargesList[index].wayBillBookingChargeChargeAmount;
						else if (waybillBookingChargesList[index].chargeTypeMasterId == LOADING)
							loading = waybillBookingChargesList[index].wayBillBookingChargeChargeAmount;
						else if (waybillBookingChargesList[index].chargeTypeMasterId == CROSSING_BOOKING)
							crossing = waybillBookingChargesList[index].wayBillBookingChargeChargeAmount;
						else if (waybillBookingChargesList[index].chargeTypeMasterId == CARTAGE_CHARGE)
							cartage = waybillBookingChargesList[index].wayBillBookingChargeChargeAmount;
						else if (waybillBookingChargesList[index].chargeTypeMasterId == BOOKING_COMMISSION)
							commission = waybillBookingChargesList[index].wayBillBookingChargeChargeAmount;
						else if (waybillBookingChargesList[index].chargeTypeMasterId == GST_CHARGE)
							gstCharge = waybillBookingChargesList[index].wayBillBookingChargeChargeAmount;
						else if (waybillBookingChargesList[index].chargeTypeMasterId == DOCKET_CHARGE)
							docket = waybillBookingChargesList[index].wayBillBookingChargeChargeAmount;
						else if (waybillBookingChargesList[index].chargeTypeMasterId == DOOR_DLY_BOOKING)
							doordly = waybillBookingChargesList[index].wayBillBookingChargeChargeAmount;
						else if (waybillBookingChargesList[index].chargeTypeMasterId == SRS_HAMALI_BOOKING)
							handling = waybillBookingChargesList[index].wayBillBookingChargeChargeAmount;
						else if (waybillBookingChargesList[index].chargeTypeMasterId == PICKUP)
							pickup = waybillBookingChargesList[index].wayBillBookingChargeChargeAmount;
						else if (waybillBookingChargesList[index].chargeTypeMasterId == TRANSHIPMENT_CHARGE)
							transhipment = waybillBookingChargesList[index].wayBillBookingChargeChargeAmount;
						 else if (waybillBookingChargesList[index].chargeTypeMasterId == INSURANCE)
							insurance = waybillBookingChargesList[index].wayBillBookingChargeChargeAmount;
						else if (waybillBookingChargesList[index].chargeTypeMasterId == FUEL_SURCHARGE)
							fuelCharge = waybillBookingChargesList[index].wayBillBookingChargeChargeAmount;
						else if (waybillBookingChargesList[index].chargeTypeMasterId == OTHER_BOOKING)
							otherCharge = waybillBookingChargesList[index].wayBillBookingChargeChargeAmount;
						if (waybillBookingChargesList[index].chargeTypeMasterId == TEMPO_BHADA)
							tempoBhada = waybillBookingChargesList[index].wayBillBookingChargeChargeAmount;
					}

				}

 				let finalChargeTotal = docket + doordly + handling + pickup + transhipment + insurance + fuelCharge + otherCharge;
 				
				$("*[data-lr='grandTotalforslpl']").html((Math.round(responseOut.bookingTotal)));
				$("*[data-lr='freightWithCommissionforslpl']").html((Math.round(freight + commission)));
				$("*[data-lr='freightWithCommissionforbtlc']").html((Math.round(freight + commission + tempoBhada)));
				$("*[data-lr='otherChargeTotal']").html((Math.round(finalChargeTotal)));

				if (gstCharge > 0) {
					$(".gstChargeAmount").show();
					$("*[data-lr='gstChargeValue']").html(Math.round(gstCharge));
				} else {
					$(".gstChargeAmount").hide();
				}
				
				//for rajasthan travals
				if (responseOut.wayBillTypeId == WAYBILL_TYPE_PAID) {
					grandTotalForRTPaidRhs = freight + crossing;
					grandTotalForRT = freight + cartage + loading + crossing;
					$("*[data-lr='grandTotalForRTLhs']").html(Math.round(grandTotalForRT));
					$("*[data-lr='grandTotalForRTRhs']").html(Math.round(grandTotalForRTPaidRhs));
					$("*[data-lr='paidGrandTotal']").html(Math.round(responseOut.bookingTotal));
				} else {
					grandTotalForRT = freight + cartage + loading + crossing;
					$("*[data-lr='grandTotalForRTLhs']").html(Math.round(grandTotalForRT));
					$("*[data-lr='grandTotalForRTRhs']").html(Math.round(grandTotalForRT));
					$('.showChareges').show();
					$("*[data-lr='paidGrandTotal']").html(Math.round(responseOut.bookingTotal));
				}
			}, setBlankOrZeroCharge: function(responseOut) {

				var configuration			= responseOut.configuration;
				var chargeTypeModelArr		= responseOut.chargeTypeModelArr;
				var wayBillTypeId			= responseOut.wayBillTypeId;
				var showTBBLableInCharge	= configuration.showTBBLableInCharge;
				
				
				if ((configuration.showZeroAmountInLr == true || configuration.showZeroAmountInLr) && responseOut.executiveType != EXECUTIVE_TYPE_GROUPADMIN)
					configuration.LRTypeWiseBlankOrZeroCharge = true;
				
				if (configuration.LRTypeWiseBlankOrZeroCharge) {
					var lrTypeList		= (configuration.LRTypeForBlankCharge).split(',');
					var zeroLRTypeList	= (configuration.LRTypeForZeroCharge).split(',');

					if (isValueExistInArray(lrTypeList, wayBillTypeId))
						this.setBlankAmount(chargeTypeModelArr, responseOut.wayBillTypeName);

					if ((showTBBLableInCharge == true || showTBBLableInCharge) && wayBillTypeId == WAYBILL_TYPE_CREDIT) {
						$("*[data-lr='chargeSum']").html('TBB');
						$("*[data-lr='grandTotal']").html('TBB');
						//$("*[data-selector='chargeValue1']").remove();
					}

					if (isValueExistInArray(zeroLRTypeList, wayBillTypeId)) {
						if (configuration.isDestBranchWiseLrPrintAllowed) {
							var destBranch = configuration.destBranchIds
							var destBranchList = destBranch.split(',');

							if (isValueExistInArray(destBranchList, responseOut.wayBillDestinationBranchId))
								this.setZeroAmount(chargeTypeModelArr);
						} else if (configuration.removeChargesInTbbExceptGroupAdmin == true || configuration.removeChargesInTbbExceptGroupAdmin) {
							if (responseOut.executiveType != EXECUTIVE_TYPE_GROUPADMIN) {
								this.setZeroAmount(chargeTypeModelArr);
								$("*[data-lr='bookingServicetax1']").html('&nbsp;');
							}
						} else {
							this.setZeroAmount(chargeTypeModelArr);
							$("*[data-lr='bookingServicetax1']").html('&nbsp;');
						}
					}
				}

				if (configuration.HideChargeNameOnZeroAmount) {
					var chargeIdList = (configuration.ChargeIdsToHideChargeName).split(',');

					for (var chargeId of chargeIdList) {
						if ($("*[data-selector='chargeValue" + chargeId + "']").html() == '&nbsp;'
							|| Number($("*[data-selector='chargeValue" + chargeId + "']").html()) == 0) {
							$("*[data-selector='chargeName" + chargeId + "']").addClass('hide');
							$("#chargeValue" + chargeId).attr('colspan', '2');
						}
					}
				}

				if (configuration.isInsuranceShow && (Number($('#chargeValue2').html()) == 0 || $('#chargeValue2').html() == '' || $('#chargeValue2').html() == undefined)) {
					$('#insurance').addClass('hide');
					$('#chargeValue2').addClass('hide');
					$('#insurancetr').show();
				}
				
				if (wayBillTypeId == WAYBILL_TYPE_CREDIT) {
						$(".showTbbLabel").html('TBB')
				}
			}, setBlankAmount: function(chargeTypeModelArr, wayBillType) {
				for (var index in chargeTypeModelArr) {
					$("*[data-consignor-selector='chargeValue" + chargeTypeModelArr[index].chargeTypeMasterId + "']").html('&nbsp;');
					$("*[data-selector='chargeValue" + chargeTypeModelArr[index].chargeTypeMasterId + "']").html('&nbsp;');
				}
				
				$("*[data-lr='chargeSum']").html('&nbsp;');
				$("*[data-lr='grandTotal']").html('&nbsp;');
				$("*[data-lr='bookingServicetax']").html('&nbsp;');
				$("*[data-lr='bookingReceived']").html('&nbsp;');
				$("*[data-lr='bookingBalance']").html('&nbsp;');
				$("*[data-lr='grandTotalKRL']").html(wayBillType.toUpperCase());
				$("*[data-gst='sgst']").html('&nbsp');
				$("*[data-gst='cgst']").html('&nbsp');
				$("*[data-gst='igst']").html('&nbsp');
				$("*[data-gst='consignorsgst']").html('&nbsp');
				$("*[data-gst='consignorcgst']").html('&nbsp');
				$("*[data-gst='consignorigst']").html('&nbsp');
				$("*[data-gst='consigneeigst']").html('&nbsp');
				$("*[data-gst='transporterigst']").html('&nbsp');
				$("*[data-lr='grandTotalforslpl']").html('&nbsp');

				$("*[data-lr='freightWithCommissionforslpl']").html('&nbsp');

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
				$("[data-lr='rate']").html('0');
			}, hideCharges: function(chargeTypeModelArr) {
				for (var index in chargeTypeModelArr) {
					//$("*[data-selector='chargeValue" + chargeTypeModelArr[index].chargeTypeMasterId + "']").hide();
					$("*[data-selector='chargeValue" + chargeTypeModelArr[index].chargeTypeMasterId + "']").css("visibility", "hidden");
				}

				$(".grandTotal").css("visibility", "hidden");
				$("*[data-lr='bookingServicetax']").css("visibility", "hidden");
			}, showCharges: function(chargeTypeModelArr) {
				for (var index in chargeTypeModelArr) {
					//$("*[data-selector='chargeValue" + chargeTypeModelArr[index].chargeTypeMasterId + "']").show();
					$("*[data-selector='chargeValue" + chargeTypeModelArr[index].chargeTypeMasterId + "']").css("visibility", "visible");
				}

				$(".grandTotal").css("visibility", "visible");
				$(".removeChargest").show();
				$("*[data-lr='bookingServicetax']").css("visibility", "visible");
			}, setDotMatrixPrint: function(responseOut) {
				var dataObject = new Object();
				var templateArray = new Array();
				dataObject.htmlTemplate = _.template('<table><tr><td>Hello World</td></tr></table>')
				templateArray.push(dataObject);

				//genericfunction.js
				printDotMatrixQRCode(templateArray);
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
				var consigneePhn = "";
				if(customerDetailsphoneNumber1 != undefined){
					 consigneePhn = customerDetailsphoneNumber1.substr(0, 2) + "******" + customerDetailsphoneNumber1.substr(8, 10);
				}
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
				
				var chargesHideUserIds = configuration.userIdsForShowChargesOnPaidLR;
				var hideUserIdsArray = chargesHideUserIds ? chargesHideUserIds.split(",") : [];
				var chargeHideUserIdWise = isValueExistInArray(hideUserIdsArray, responseOut.executiveId);	
					
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
					//	dataObjectColl.numberOfPackages				= responseOut.quantity;
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
						
					if (QRCodePrintType == 'customQRCodePrint_466') {
						dataObjectColl.qrCodeSize = 8;
						dataObjectColl.bodyStyle = "white-space: nowrap;width:70%;font-size:45px;margin-left:20px;margin-top:-100px;padding:0;font-weight:20px;font-weight:bold;font-family:sans-serif;";
					} else if (QRCodePrintType == 'customQRCodePrint_565') {
						dataObjectColl.qrCodeSize = 8;
						dataObjectColl.bodyStyle = "white-space: nowrap;width:80%;font-size:40px;margin-left:px;margin-top:20px;padding:0;font-weight:20px;font-weight:bold;font-family:sans-serif;";
					} else if (QRCodePrintType == 'customQRCodePrint_341') {
						dataObjectColl.qrCodeSize = 8;
						dataObjectColl.bodyStyle = "white-space: nowrap;width:70%;font-size:45px;margin-left:20px;margin-top:-100px;padding:0;font-weight:20px;font-weight:bold;font-family:sans-serif;";
					} else if (QRCodePrintType == 'customQRCodePrint_474') {
						dataObjectColl.qrCodeSize = 8;
						dataObjectColl.bodyStyle = "white-space: nowrap;width:70%;font-size:45px;margin-left:20px;margin-top:-30px;padding:0;font-weight:20px;font-weight:bold;font-family:sans-serif;";
					} else if (QRCodePrintType == 'customQRCodePrint_201') {
						dataObjectColl.qrCodeSize = 6;
						dataObjectColl.bodyStyle = "white-space: nowrap;width:70%;font-size:25px;margin-left:-65px;margin-top:-30px;padding:0;font-weight:17px;font-weight:bold;font-family:sans-serif;";
					} else if (QRCodePrintType == 'customQRCodePrint_573') {
						dataObjectColl.qrCodeSize = 8;
						dataObjectColl.bodyStyle = "white-space: nowrap;width:80%;font-size:40px;margin-left:px;margin-top:20px;padding:0;font-weight:20px;font-weight:bold;font-family:sans-serif;";
					}else if (QRCodePrintType == 'customQRCodePrint_22') {
						dataObjectColl.qrCodeSize = 8;
						dataObjectColl.bodyStyle = "white-space: nowrap;width:80%;font-size:40px;margin-left:px;margin-top:20px;padding:0;font-weight:20px;font-weight:bold;font-family:sans-serif;";
					}else if (QRCodePrintType == 'customQRCodePrint_567') {
						dataObjectColl.qrCodeSize = 12;
						dataObjectColl.bodyStyle = "white-space: nowrap;width:80%;font-size:40px;margin-left:px;margin-top:20px;padding:0;font-weight:20px;font-weight:bold;font-family:sans-serif;";
					}else if (QRCodePrintType == 'customQRCodePrint_50') {
						dataObjectColl.qrCodeSize = 8;
						dataObjectColl.bodyStyle = "white-space: nowrap;width:80%;margin-left:px;margin-top:20px;padding:0;font-weight:20px;font-weight:bold;font-family:sans-serif;";
					}else if (QRCodePrintType == 'customQRCodePrint_1004') {
						dataObjectColl.qrCodeSize = 8;
						dataObjectColl.bodyStyle = "white-space: nowrap;width:80%;margin-left:px;margin-top:20px;padding:0;font-weight:20px;font-weight:bold;font-family:sans-serif;";
					}else if (QRCodePrintType == 'customQRCodePrint_348') {
						dataObjectColl.qrCodeSize = 12;
						dataObjectColl.bodyStyle = "white-space: nowrap;width:80%;margin-left:px;padding:0;font-weight:20px;font-weight:bold;font-family:sans-serif;";
					}else if (QRCodePrintType == 'customQRCodePrint_960') {
						dataObjectColl.qrCodeSize = 8;
						dataObjectColl.bodyStyle = "white-space: nowrap;width:80%;margin-left:px;margin-top:20px;padding:0;font-weight:20px;font-weight:bold;font-family:sans-serif;";
					}else if (QRCodePrintType == 'customQRCodePrint_621') {
						dataObjectColl.qrCodeSize = 14;
						dataObjectColl.bodyStyle = "white-space: nowrap;width:80%;margin-left:px;margin-top:20px;padding:0;font-weight:20px;font-weight:bold;font-family:sans-serif;";
					}else if (QRCodePrintType == 'customQRCodePrint_396') {
						dataObjectColl.qrCodeSize = 12;
						dataObjectColl.bodyStyle = "white-space: nowrap;width:80%;margin-left:px;margin-top:20px;padding:0;font-weight:20px;font-weight:bold;font-family:sans-serif;";
					}else if (QRCodePrintType == 'customQRCodePrint_270') {
						dataObjectColl.qrCodeSize = 8;
						dataObjectColl.bodyStyle = "white-space: nowrap;width:100%;margin-left:px;margin-top:20px;padding:0;font-weight:20px;font-weight:bold;font-family:sans-serif;";
					}else if (QRCodePrintType == 'customQRCodePrint_860') {
						dataObjectColl.qrCodeSize = 10;
						dataObjectColl.bodyStyle = "white-space: nowrap;width:100%;font-size:40px;margin-left:px;margin-top:20px;padding:0;font-weight:20px;font-weight:bold;font-family:sans-serif;";
					}else if (QRCodePrintType == 'customQRCodePrint_840') {
						dataObjectColl.qrCodeSize = 8;
						dataObjectColl.bodyStyle = "white-space: nowrap;width:80%;font-size:40px;margin-left:px;margin-top:20px;padding:0;font-weight:20px;font-weight:bold;font-family:sans-serif;";
					}else if (QRCodePrintType == 'customQRCodePrint_799') {
						dataObjectColl.qrCodeSize = 12;
						dataObjectColl.bodyStyle = "white-space: nowrap;width:80%;font-size:40px;margin-left:px;margin-top:20px;padding:0;font-weight:20px;font-weight:bold;font-family:sans-serif;";
					}else if (QRCodePrintType == 'customQRCodePrint_441') {
						dataObjectColl.qrCodeSize = 8;
						dataObjectColl.bodyStyle = "white-space: nowrap;width:80%;font-size:40px;margin-left:px;margin-top:20px;padding:0;font-weight:20px;font-weight:bold;font-family:sans-serif;";
					} else if (QRCodePrintType == 'customQRCodePrint_572') {
						dataObjectColl.qrCodeSize = 8;
						dataObjectColl.bodyStyle = "white-space: nowrap;width:80%;font-size:40px;margin-left:px;margin-top:20px;padding:0;font-weight:20px;font-weight:bold;font-family:sans-serif;";
					} else if (QRCodePrintType == 'customQRCodePrint_593') {
						dataObjectColl.qrCodeSize = 8;
						dataObjectColl.bodyStyle = "white-space: nowrap;width:70%;font-size:45px;margin-left:20px;margin-top:-30px;padding:0;font-weight:20px;font-weight:bold;font-family:sans-serif;";
					} else if (QRCodePrintType == 'customQRCodePrint_617') {
						dataObjectColl.qrCodeSize = 8;
						dataObjectColl.bodyStyle = "white-space: nowrap;width:70%;font-size:45px;margin-left:20px;margin-top:-30px;padding:0;font-weight:20px;font-weight:bold;font-family:sans-serif;";
					}else if (QRCodePrintType == 'customQRCodePrint_754') {
						dataObjectColl.qrCodeSize = 12;
						dataObjectColl.bodyStyle = "white-space: nowrap;width:70%;margin-left:20px;margin-top:-30px;padding:0;font-weight:20px;font-weight:bold;font-family:sans-serif;";
					} else if (QRCodePrintType == 'customQRCodePrint_641') {
						dataObjectColl.qrCodeSize = 8;
						dataObjectColl.bodyStyle = "white-space: nowrap;width:80%;font-size:40px;margin-left:px;margin-top:20px;padding:0;font-weight:20px;font-weight:bold;font-family:sans-serif;";
					} else if (QRCodePrintType == 'customQRCodePrint_557') {
						dataObjectColl.qrCodeSize = 8;
						dataObjectColl.bodyStyle = "white-space: nowrap;width:70%;font-size:45px;margin-left:20px;margin-top:-30px;padding:0;font-weight:20px;font-weight:bold;font-family:sans-serif;";
					} else if (QRCodePrintType == 'customQRCodePrint_650') {
						dataObjectColl.qrCodeSize = 12;
						dataObjectColl.bodyStyle = "white-space: nowrap;width:80%;font-size:40px;margin-left:px;margin-top:20px;padding:0;font-weight:20px;font-weight:bold;font-family:sans-serif;";
					} else if (QRCodePrintType == 'customQRCodePrint_324') {
						dataObjectColl.qrCodeSize = 12;
						dataObjectColl.bodyStyle = "white-space: nowrap;width:80%;font-size:40px;margin-left:px;margin-top:20px;padding:0;font-weight:20px;font-weight:bold;font-family:sans-serif;";
					} else if (QRCodePrintType == 'customQRCodePrint_367') {
						dataObjectColl.qrCodeSize = 8;
						dataObjectColl.bodyStyle = "white-space: nowrap;width:80%;font-size:45px;margin-left:80px;margin-top:-30px;padding:0;font-weight:20px;font-weight:bold;font-family:sans-serif;";
					} else if (QRCodePrintType == 'customQRCodePrint_252') {
						dataObjectColl.qrCodeSize = 12;
						dataObjectColl.bodyStyle = "white-space: nowrap;width:80%;font-size:45px;margin-left:20px;margin-top:-30px;padding:0;font-weight:20px;font-weight:bold;font-family:sans-serif;";
					}  else if (QRCodePrintType == 'customQRCodePrint_609') {
						dataObjectColl.qrCodeSize = 12;
						dataObjectColl.bodyStyle = "white-space: nowrap;width:80%;font-size:45px;margin-left:20px;margin-top:-30px;padding:0;font-weight:20px;font-weight:bold;font-family:sans-serif;";
					}else if (QRCodePrintType == 'customQRCodePrint_299') {
						dataObjectColl.qrCodeSize = 12;
						dataObjectColl.bodyStyle = "white-space: nowrap;width:100%;font-size:45px;margin:0;padding:0;font-weight:20px;font-weight:bold;font-family:sans-serif;";
					}else if (QRCodePrintType == 'customQRCodePrint_731') {
                        dataObjectColl.qrCodeSize = 8;
                        dataObjectColl.bodyStyle = "white-space: nowrap;width:70%;font-size:45px;margin-left:20px;margin-top:-30px;padding:0;font-weight:20px;font-weight:bold;font-family:sans-serif;";
					}else if (QRCodePrintType == 'customQRCodePrint_764') {
                        dataObjectColl.qrCodeSize = 8;
                        dataObjectColl.bodyStyle = "white-space: nowrap;width:70%;font-size:45px;margin-left:20px;margin-top:-30px;padding:0;font-weight:20px;font-weight:bold;font-family:sans-serif;";
					} else {
						dataObjectColl.qrCodeSize = 12;
						dataObjectColl.bodyStyle = "white-space: nowrap;width:100%;font-size:45px;margin:0;padding:0;font-weight:20px;font-weight:bold;font-family:sans-serif;";
					}

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
									dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px;"><tr><td colspan="2" style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">Mahasagar Logistics</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">LR No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.waybillNumber + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + destinationBranchName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Qty</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.currentPackage + ' of ' + dataObject.numberOfPackages + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">From</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.sourceFrom + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Type</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.lrType + '</td></tr><tr><td></td><td style="text-align:right; padding: 0px 10px 0px 10px;">IVCARGO</td></tr></table>')({ dataObject: dataObject });

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
								} else if (QRCodePrintType == 'customQRCodePrint_466') {
									if (consigneeName.length > 12)
										consigneeName = consigneeName.substring(0, 12);
									dataObject.htmlTemplate = _.template('<table style="margin-right:60px;margin-left:10px; border: solid 1px;width:40%;margin-top:-30px;"><tr><td	style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;font-size:55px;height:60px;valign=top;">' + accountGroupObj.accountGroupName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;font-size:45px;height:45px;valign=top;"><span>LR No:</span><span style="font-size:40px;">' + dataObject.waybillNumber + '</span></td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;font-size:50px;height:40px;valign=top;"><span>Quantity:</span><span>' + dataObject.currentPackage + ' of ' + dataObject.numberOfPackages + '</span></td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;font-size:45px;height:40px;valign=top;"><span>Booking Date:</span><span>' + dataObjectColl.bookingDate + '</span></td></tr><tr><td colspan=""  style=" padding: 0px 10px 0px 10px;font-size:45px;valign=top;">' + dataObject.sourceFrom + '</td></tr><tr><td colspan="" style=" padding: 0px 10px 0px 10px;font-size:45px;font-weight:bold;valign=top;"><span style="font-weight: bold;">' + responseOut.wayBillDestinationCityName + '</span>:<span style="font-weight: bold;">' + dataObject.destinationTo + '</span></td></tr><tr><td colspan="" style=" padding: 0px 10px 0px 10px;font-size:45px;valign=top;"><span>ConsigneeName:</span><span>' + consigneeName + '</span></td></tr><tr><td colspan="" style=" padding: 0px 10px 0px 10px;font-size:45px;valign=top;"><span>ConsigeePhn:</span><span>' + consigneePhn + '</span></td></tr><tr><td colspan="" style=" padding: 0px 10px 0px 10px;font-size:45px;valign=top;"><span>Weight:</span><span>' + responseOut.actualWeight + '</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp&nbsp;<span style="font-size:50px;">LR Type:</span><span style="font-size:45px;">' + dataObject.lrType + '</span></</td></tr><tr><td colspan="" style=" padding: 0px 10px 0px 10px;font-size:45px;valign=top;"><span>Item Details:</span><span>' + commaSepratedArticleType + '</span></td></tr></table>')({ dataObject: dataObject });
									$('#popUpContentForQrCodeOption_466').bPopup({
									}, function() {
										var _thisMod = this;
										$(this).html("<div class='confirm' style='height:150px;width:300px; padding:5px'>"
											+ "<div style='font-size:18px; color:DodgerBlue;text-align:center;'><b>Print Option</b><div><br/>"
											+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' checked='checked' id='printLR'/>&nbsp;<b style='font-size:14px;'>Print LR</b><div><br/>"
											+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' checked='checked' id='printQR'/>&nbsp;<b style='font-size:14px;'>Print QR</b><div><br/>"
											//+"<div style='text-align:left;color:black;font-size:17px;'><input type='radio' checked='checked' id='regularPrint' name='print'/>&nbsp;<b style='font-size:14px;'>Regular Print</b><div><br/>"
											//+"<div style='text-align:left;color:black;font-size:17px;'><input type='radio' checked='checked' id='a4Print' name='print'/>&nbsp;<b style='font-size:14px;'>A4 Print</b><div><br/>"
											+ "<button id='cancelButton'>Cancel</button>"
											+ "<button autofocus id='confirm'>Print</button></center></div>")

										$("#confirm").focus();

										//	$("#regularPrint").prop("checked", true);
										$("#cancelButton").click(function() {
											$('.showHideFirstTable').css('display', 'block');
											$('.showHideSecondTable').css('display', 'none');
											_thisMod.close();

										});
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
											} else {
												_thisMod.close();
												window.print();
											}

											//if($('#regularPrint').prop('checked'))
											//	$('.showHideFirstTable').css('display', 'block');
											//else if($('#a4Print').prop('checked')) {
											//	$('.showHideSecondTable').css('display', 'block');
											//	$('.showHideFirstTable').css('display', 'none');
											//	$('.showHideSecondTableId').css('display', 'revert');
											// }

											_thisMod.close();
										});

										$('#confirm').on('keydown', function(e) {
											if (e.which == 27) {  //escape
												window.close();
											}
										});

									});
								} else if (QRCodePrintType == 'customQRCodePrint_347') {
									if (consigneeName.length > 12)
										consigneeName = consigneeName.substring(0, 12);

									dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px;"><tr><td colspan="2" style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + accountGroupObj.accountGroupName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">LR No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.waybillNumber + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.destinationTo + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Qty</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.currentPackage + ' of ' + dataObject.numberOfPackages + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">From</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.sourceFrom + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Consignee</td><td style="word-wrap: break-word;word-break: break-all;white-space: normal;border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + consigneeName + '</td></tr><tr><td></td><td style="text-align:right; padding: 0px 10px 0px 10px;">IVCARGO</td></tr></table>')({ dataObject: dataObject });
									$('#popUpContentForQrCodeOption_347').bPopup({
									}, function() {
										var _thisMod = this;
										$(this).html("<div class='confirm' style='height:200px;width:250px; padding:5px'>"
											+ "<div style='font-size:18px; color:DodgerBlue;text-align:center;'><b>Print Option</b><div><br/>"
											+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' checked='checked' id='printLR'/>&nbsp;<b style='font-size:14px;'>Print LR</b><div><br/>"
											+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' checked='checked' id='printQR'/>&nbsp;<b style='font-size:14px;'>Print QR</b><div><br/>"
											+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' checked='checked' id='printCharge'/>&nbsp;<b style='font-size:14px;'>Print Charges</b><div><br/>"
											+ "<button id='cancelButton'>Cancel</button>"
											+ "<button autofocus id='confirm'>Print</button></center></div>")
										
										if (responseOut.wayBillTypeId == WAYBILL_TYPE_CREDIT) {
											$('#printCharge').prop('checked', false);
										}

										if (responseOut.wayBillTypeId != WAYBILL_TYPE_CREDIT) {
											$('#printCharge').prop('disabled', true);
										}
										   
										
										$("#confirm").focus();

										$("#cancelButton").click(function() {
											window.close();
											_thisMod.close();
										})

										$('#confirm').click(function() {
											if ($('#printLR').prop('checked') && $('#printQR').prop('checked') && !$('#printCharge').prop('checked')) {
												_this.printAndCloseQRCodePrint();
												
												if (dataObject.numberOfPackages <= 50)
													_this.printQRCodeOnLimt(templateArray, 30);
												
												if (responseOut.wayBillTypeId == WAYBILL_TYPE_CREDIT)
													$(".chargesShowTBB").html('TBB');

												_thisMod.close();
											}else if ($('#printLR').prop('checked') && $('#printQR').prop('checked') && $('#printCharge').prop('checked')) {
												_this.printAndCloseQRCodePrint();
												
												if (dataObject.numberOfPackages <= 50)
													_this.printQRCodeOnLimt(templateArray, 30);
												
												_thisMod.close();
											} else if ($('#printLR').prop('checked') && !$('#printCharge').prop('checked')) {
												_this.printAndCloseQRCodePrint();
												
												$(".chargesShowHide").html(' ');
												$(".chargesShowTBB").html('TBB');
												
												_thisMod.close();
											} else if ($('#printQR').prop('checked')) {
												if (dataObject.numberOfPackages <= 50)
													_this.printQRCodeOnLimt(templateArray, 30);
												
												_thisMod.close();
												window.close();
											} else {
												window.close();
											}
											_thisMod.close();
										});
										$('#confirm').on('keydown', function(e) {
											if (e.which == 27) {  //escape
												window.close();
											}
										});

									});

								} else if (QRCodePrintType == 'customQRCodePrint_316') {
									if (consigneeName.length > 12)
										consigneeName = (consigneeName.substring(0, 16) + '....');
									var consignorName = responseOut.consignorName;
									if (consignorName.length > 12)
										consignorName = (consignorName.substring(0, 16) + '....');

									dataObject.htmlTemplate = _.template('<table width="100%" style="margin-left:10px; border: solid 1px;"><tr><td style="border-bottom: solid 1px; border-right: solid 1px;border-left:solid 1px; padding: 0px 10px 0px 10px;">To</td><td style="word-wrap: break-word;word-break: break-all;border-bottom: solid 1px;border-right: solid 1px; padding: 0px 10px 0px 10px;"><span>' + dataObject.destinationTo + '</span><br><span>(' + dataObjectColl.desthandlingBranchName + ')</span></td></tr><tr style="border-bottom:solid 1px; "><td style="border-bottom: solid 1px; border-top: solid 0px;border-right: solid 1px; padding: 0px 10px 0px 10px;border-left:solid 1px;">Consignor</td><td style="border-bottom: solid 1px;border-top: solid 0px; padding: 0px 10px 0px 10px;border-right: solid 1px;">' + consignorName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;border-left:solid 1px;">Consignee</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;border-right: solid 1px;">' + consigneeName + '</td></tr><tr><td colspan="2" style="border-bottom: solid 0px; border-right: solid 1px; padding: 0px 10px 0px 10px;border-right: solid 1px;border-left:solid 1px;">Date : ' + dataObjectColl.bookingDate + ' ' + dataObjectColl.bookingTime + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;border-right: solid 1px;border-left:solid 1px;border-top:solid 1px;">' + dataObject.currentPackage + ' of ' + dataObject.numberOfPackages + '</td><td style="border-bottom: solid 0px; padding: 0px 10px 0px 10px;border-top:solid 1px;">LR.No:' + dataObject.waybillNumber + '</td></tr></table>')({ dataObject: dataObject });
									$('#popUpContentForLrAndQr').bPopup({
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
												//window.resizeTo(0,0);
												//window.moveTo(0,0);
												setTimeout(function() {
													if (responseOut.wayBillTypeId != WAYBILL_TYPE_CREDIT) {
														window.print();
														window.close();
													}
												}, 500);

												if (dataObject.numberOfPackages <= 30)
													_this.printQRCodeOnLimt(templateArray, 10);

												_thisMod.close();
											} else if ($('#printLR').prop('checked') == true) {
												//window.resizeTo(0,0);
												//window.moveTo(0,0);
												setTimeout(function() {
													if (responseOut.wayBillTypeId != WAYBILL_TYPE_CREDIT) {
														window.print();
														window.close();
													}
												}, 500);

												_thisMod.close();
											} else if ($('#printQR').prop('checked') == true) {
												if (dataObject.numberOfPackages <= 30)
													_this.printQRCodeOnLimt(templateArray, 10);

												if (responseOut.wayBillTypeId != WAYBILL_TYPE_CREDIT) {
													_thisMod.close();
													window.close();
												}
											} else if (responseOut.wayBillTypeId != WAYBILL_TYPE_CREDIT)
												window.close();

											_thisMod.close();
										});
										$('#confirm').on('keydown', function(e) {
											if (e.which == 27) {  //escape
												window.close();
											}
										});

									});

								} else if (QRCodePrintType == 'customQRCodePrint_433') {
									dataObject.htmlTemplate = _.template('<table width="70%" style="margin-left:5px; border: solid 1px;"><thead><tr style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;"><td style=" padding: 0px 10px 0px 10px; text-align: center; text-align: center;"><center>ALI LORRY TRANSPORT</center></td></tr></thead><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px; text-align:center;"></td><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To</td><td style="word-wrap: break-word;word-break: break-all;white-space: normal;border-bottom: solid 1px;border-top: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.destinationTo + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Consignee</td><td style="word-wrap: break-word;word-break: break-all;white-space: normal;border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + consigneeName + '</td></tr><tr><td colspan="2" style="border-bottom: solid 1px;  padding: 0px 10px 0px 10px;">Date : ' + dataObjectColl.bookingDate + ' ' + dataObjectColl.bookingTime + '</td></tr><tr><td style="  padding: 0px 10px 0px 10px;">' + dataObject.currentPackage + ' of ' + dataObject.numberOfPackages + '</td><td style=" padding: 0px 10px 0px 10px;">LR.No:' + dataObject.waybillNumber + '</td></tr></table>')({ dataObject: dataObject });
									$('#popUpContentForQrCodeOption_433').bPopup({
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
											if ($('#printLR').prop('checked') == true && $('#printQR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();

												if (dataObject.numberOfPackages <= 200)
													_this.printQRCodeOnLimt(templateArray, 10);

												_thisMod.close();
											} else if ($('#printLR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_thisMod.close();
											} else if ($('#printQR').prop('checked') == true) {
												if (dataObject.numberOfPackages <= 200)
													_this.printQRCodeOnLimt(templateArray, 10);

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
								} else if (QRCodePrintType == 'customQRCodePrint_341' && branchWiseQRPrintData) {
									dataObject.htmlTemplate = _.template('<table style="margin-top:36px;margin-left:10px; border: solid 1px;"><tr><td colspan="2" style="border-bottom: solid 1px;border-top:solid 1px; padding: 0px 10px 0px 10px;font-size:60px;">' + accountGroupObj.accountGroupName + '</td></tr><tr><td  colspan="2" style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;font-size:60px;">' + dataObject.waybillNumber + '</td></tr><tr><td style=" padding: 0px 10px 0px 10px;"><span style="font-size:45px;">To :</span>&nbsp;<span style="font-size:60px;">' + responseOut.wayBillDestinationBranchName + '</span></td></tr><tr><td style="padding: 0px 10px 0px 10px;border-bottom:solid 1px;border-top:solid 1px"><span style:"font-size:50px;">Qty :</span>&nbsp;&nbsp;&nbsp;<span style="font-size:60px;">' + dataObject.numberOfPackages + '</span></td></tr></table>')({ dataObject: dataObject });
									
									$('#printDuplicate').remove();
									$('#popUpContentForQrCodeOption_341').bPopup({

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
											if ($('#printLR').prop('checked') == true && $('#printQR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_this.printQRCodeWithoutLimit(templateArray, 5);
												_thisMod.close();
											} else if ($('#printLR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_thisMod.close();
											} else if ($('#printQR').prop('checked') == true) {
												_this.printQRCodeWithoutLimit(templateArray, 5);
												_thisMod.close();
												window.close();
											}
											else {
												window.close();
											}
											_thisMod.close();

										});
										$('#confirm').on('keydown', function(e) {
											if (e.which == 27) {  //escape
												window.close();
											}
										});

									});
								} else if (QRCodePrintType == 'customQRCodePrint_201') {
									if (consigneeName.length > 14)
										consigneeName = (consigneeName.substring(0, 14) + '..');

									dataObject.htmlTemplate = _.template('<table style="margin-top:15px;margin-left:40px; border: solid 1px;"><tr><td style="width:100%"><table style="width:100%"><tr><td	style="border-bottom:solid 1px;"><span style="font-size:50px;font-weight: bold;">LMT CO.</span>&nbsp;&nbsp;&nbsp;<span style="font-size:30px;">C/NEE:</span>&nbsp;<span style="font-size:30px;">' + consigneeName + '</span></td></tr><tr><td style="border-bottom: solid 1px;"><span style="font-size:50px;">From :</span>&nbsp;<span style="font-size:50px;">' + dataObjectColl.sourceBranch + '</span></td></tr><tr><td	style="border-bottom: solid 1px;font-weight:bold"><span style="font-size:60px;">LR.</span><span style="font-size:90px;">' + dataObject.waybillNumber + '</span></td></tr><tr><td style="border-bottom: solid 1px;"><span style="font-size:50px;">To :</span>&nbsp;<span style="font-size:50px;">' + responseOut.wayBillDestinationBranchName + '</span></td></tr><tr><td><span style:"font-size:50px;">Qty :</span>&nbsp;&nbsp;&nbsp;<span style="font-size:50px;">' + dataObject.currentPackage + ' / ' + dataObject.numberOfPackages + '</span>&nbsp;&nbsp;&nbsp;&nbsp;<span style="font-size:30px;">' + dataObject.currentPackingType + '</span></td></tr></table></td></tr>')({ dataObject: dataObject });									

									$('#popUpContentForQrCodeOption_201').bPopup({
									}, function() {
										var _thisMod = this;
										$(this).html("<div class='confirm' style='height:210px;width:250px; padding:5px'>"
											+ "<div style='font-size:18px; color:DodgerBlue;text-align:center;'><b>Print Option</b><div><br/>"
											+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' checked='checked' id='printLR'/>&nbsp;<b style='font-size:14px;'>Print LR</b><div><br/>"
											+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' checked='checked' id='printQR'/>&nbsp;<b style='font-size:14px;'>Print QR</b><div><br/>"
											+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' checked='checked' id='printCharges'/>&nbsp;<b style='font-size:14px;'>Print Charges</b><div><br/>"
											+ "<button id='cancelButton'>Cancel</button>"
											+ "<button autofocus id='confirm'>Print</button></center></div>")

										$("#confirm").focus();

										$("#cancelButton").click(function() {
											window.close();
											_thisMod.close();
										})

										$('#confirm').click(function() {
											if ($('#printCharges').prop('checked') == true){
											   $('.printCharges').css("display", "block");
											} else {
											   $('.printChargesA4').addClass('hide');
												$('.printCharges').css("display", "none");
											}

											if ($('#printLR').prop('checked') == true && $('#printQR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();

												if (dataObject.numberOfPackages <= 200 && branchAllowedforQr)
													_this.printQRCodeOnLinux(templateArray, 10);
												else if(dataObject.numberOfPackages <= 200)
													_this.printQRCodeOnLimt(templateArray, 10);

												_thisMod.close();
											} else if ($('#printLR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_thisMod.close();
											} else if ($('#printQR').prop('checked') == true) {
												if (dataObject.numberOfPackages <= 200 && branchAllowedforQr)
													_this.printQRCodeOnLinux(templateArray, 10);
												else if(dataObject.numberOfPackages <= 200)
													_this.printQRCodeOnLimt(templateArray, 10);

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
								} else if (QRCodePrintType == 'customQRCodePrint_39') {
									dataObject.htmlTemplate = _.template('<table style="margin-top:30px;"><tr><td><span style="font-weight:bold;font-size:45px;">To : </span><span style="font-size:55px;font-weight:bold;">' + dataObjectColl.destinationBranch + '</span></td></tr><tr><td style="font-weight:bold;font-size:45px;"><span>LR No : </span><span style="font-size:55px;">' + dataObject.waybillNumber + '</span></td></tr><tr><td style=""><span style="font-weight:bold;font-size:45px;">Type : </span><span style="font-size:45px;">' + dataObject.lrType + '</span></td></tr><tr><td><span style="font-weight:bold;font-size:45px;">Qty : </span><span style="font-size:45px;">' + dataObject.currentPackage + ' of ' + dataObject.numberOfPackages + '</span></td></tr><tr><td><span style="font-weight:bold;font-size:45px;">From : </span><span style="font-size:45px;">' + dataObjectColl.sourceBranch + '</span></td></tr></table>')({ dataObject: dataObject });
									$('#popUpContentForQrCodeOption_39').bPopup({
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
											if ($('#printLR').prop('checked') == true && $('#printQR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();

												if (dataObject.numberOfPackages <= 200)
													_this.printQRCodeOnLimt(templateArray, 25);

												_thisMod.close();
											} else if ($('#printLR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_thisMod.close();
											} else if ($('#printQR').prop('checked') == true) {
												if (dataObject.numberOfPackages <= 200)
													_this.printQRCodeOnLimt(templateArray, 25);

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
								} else if (QRCodePrintType == 'customQRCodePrint_14') {
									dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px;"><tr><td colspan="2" style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + accountGroupObj.accountGroupName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">LR No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.waybillNumber + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.destinationTo + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Qty</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.currentPackage + ' of ' + dataObject.numberOfPackages + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">From</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.sourceFrom + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Type</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.lrType + '</td></tr><tr><td colspan="2" style=" padding: 0px 10px 0px 10px;">IVCargo</td></tr></table>')({ dataObject: dataObject });
									$('#popUpContentForQrCodeOption_14').bPopup({

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
											if ($('#printLR').prop('checked') == true && $('#printQR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_this.printQRCodeWithoutLimit(templateArray, 2000);
												_thisMod.close();
											} else if ($('#printLR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_thisMod.close();
											} else if ($('#printQR').prop('checked') == true) {
												_this.printQRCodeWithoutLimit(templateArray, 2000);
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
								} else if (QRCodePrintType == 'customQRCodePrint_474') {
									dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px;margin-top:50px;"><tr><td colspan="2" style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;font-weight:bold;">' + accountGroupObj.accountGroupName + '</td></tr><tr><td style="border-bottom: solid 1px; border-top:none; border-right: solid 1px; padding: 0px 10px 0px 10px;">LR No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.waybillNumber + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To City</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + responseOut.wayBillDestinationCityName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To Branch</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + responseOut.wayBillDestinationBranchName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Qty</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.currentPackage + ' of ' + dataObject.numberOfPackages + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">From</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.sourceFrom + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Type</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.lrType + '</td></tr></table>')({ dataObject: dataObject });
									
									$('#popUpContentForQrCodeOption_474').bPopup({

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
											if ($('#printLR').prop('checked') == true && $('#printQR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_this.printQRCodeOnLimt(templateArray, 27);
												_thisMod.close();
											} else if ($('#printLR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_thisMod.close();
											} else if ($('#printQR').prop('checked') == true) {
												_this.printQRCodeOnLimt(templateArray, 27);
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
								} else if (QRCodePrintType == 'customQRCodePrint_593') {
									dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px;margin-top:50px;font-size:40px;"><tr><td colspan="2" style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;font-weight:bold;">Shree Ganesh Travels & Cargo</td></tr><tr><td style="border-bottom: solid 1px; border-top:none; border-right: solid 1px; padding: 0px 10px 0px 10px;">LR No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.waybillNumber + '</td></tr><tr><td style="border-bottom: solid 1px; border-top:none; border-right: solid 1px; padding: 0px 10px 0px 10px;">Mob No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + accountGroupObj.branchContactDetailMobileNumber + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To Branch:</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + responseOut.wayBillDestinationBranchName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Qty</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.currentPackage + ' of ' + dataObject.numberOfPackages + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">From</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.sourceFrom + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Type</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.lrType + '</td></tr></table>')({ dataObject: dataObject });

									$('#popUpContentForQrCodeOption_593').bPopup({

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
											if ($('#printLR').prop('checked') == true && $('#printQR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_this.printQRCodeOnLimt(templateArray, 27);
												_thisMod.close();
											} else if ($('#printLR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_thisMod.close();
											} else if ($('#printQR').prop('checked') == true) {
												_this.printQRCodeOnLimt(templateArray, 27);
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
								} else if (QRCodePrintType == 'customQRCodePrint_617') {
									if (consigneeName.length > 12)
									consigneeName = consigneeName.substring(0, 20);
									
									dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px;margin-top:50px;font-size:40px;"><tr><td colspan="2" style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;font-weight:bold;text-align: center;">ANAND TRAVELS</td></tr><tr><td style="border-bottom: solid 1px; border-top:none; border-right: solid 1px; padding: 0px 10px 0px 10px;">LR No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.waybillNumber + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;word-wrap: break-word;word-break: normal;white-space: normal;">' + responseOut.wayBillDestinationBranchName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Consignee</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;word-wrap: break-word;word-break: normal;white-space: normal;">' + consigneeName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Qty</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.currentPackage + ' of ' + dataObject.numberOfPackages + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">From</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;word-wrap: break-word;word-break: normal;white-space: normal;">' + dataObject.sourceFrom + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">LR Type</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.lrType + '</td></tr></table>')({ dataObject: dataObject });

									$('#popUpContentForQrCodeOption_617').bPopup({
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
											if ($('#printLR').prop('checked') == true && $('#printQR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_this.printQRCodeWithoutLimit(templateArray, 1000);

												_thisMod.close();
											} else if ($('#printLR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_thisMod.close();
											} else if ($('#printQR').prop('checked') == true) {
												_this.printQRCodeWithoutLimit(templateArray, 1000);

												_thisMod.close();
												window.close();
											} else {
												window.close();
											}
											_thisMod.close();
										});
										$('#confirm').on('keydown', function(e) {
											if (e.which == 27) {  //escape
												window.close();
											}
										});

									});
								}else if (QRCodePrintType == 'customQRCodePrint_754') {
									
									dataObject.htmlTemplate = _.template('<table cellpadding="0" cellspacing="0" style="margin-left:10px; border: solid 1px;margin-top:50px;" width="100%"><tr><td width="100%" colspan="2" style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;font-weight:bold;text-align: center;word-wrap: break-word;word-break: normal;white-space: normal;font-size:40px;">VEER TRAVELS AND PARCEL SERVICE</td></tr><tr><td width="100%" colspan="2" style="border-bottom: solid 1px; border-top:none; border-right: solid 1px; padding: 0px 10px 0px 10px;word-wrap: break-word;word-break: normal;white-space: normal;">DEST : ' + responseOut.wayBillDestinationBranchName + '</td></tr><tr><td width="100%" colspan="2" style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">LR NO : ' + dataObject.waybillNumber + ' X ' + dataObject.numberOfPackages + '</td></tr><tr><td width="70%" style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;"></td><td width="30%" style="text-align: center;border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.currentPackage + '</td></tr></table>')({ dataObject: dataObject });

									$('#popUpContentForQrCodeOption_754').bPopup({
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
											if ($('#printLR').prop('checked') == true && $('#printQR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_this.printQRCodeWithoutLimit(templateArray, 1000);

												_thisMod.close();
											} else if ($('#printLR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_thisMod.close();
											} else if ($('#printQR').prop('checked') == true) {
												_this.printQRCodeWithoutLimit(templateArray, 1000);

												_thisMod.close();
												window.close();
											} else {
												window.close();
											}
											_thisMod.close();
										});
										$('#confirm').on('keydown', function(e) {
											if (e.which == 27) {  //escape
												window.close();
											}
										});

									});
								} else if (QRCodePrintType == 'customQRCodePrint_731' && branchWiseQRPrintData) {
									dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px;margin-top:50px;font-size:40px;"><tr><td colspan="2" style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;font-weight:bold;">Dolphin Travels  House</td></tr><tr><td style="border-bottom: solid 1px; border-top:none; border-right: solid 1px; padding: 0px 10px 0px 10px;">LR No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.waybillNumber + '</td></tr><tr><td style="border-bottom: solid 1px; border-top:none; border-right: solid 1px; padding: 0px 10px 0px 10px;">Mob No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + accountGroupObj.branchContactDetailMobileNumber + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To Branch:</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + responseOut.wayBillDestinationBranchName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Qty</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.currentPackage + ' of ' + dataObject.numberOfPackages + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">From</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.sourceFrom + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Type</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.lrType + '</td></tr></table>')({ dataObject: dataObject });
									if(responseOut.isQrBtnClicked) 
										printAllQRCodeWithoutLimitAsync(templateArray);

									$('#popUpContentForQrCodeOption_731').bPopup({

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
											if ($('#printLR').prop('checked') == true && $('#printQR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_this.printQRCodeWithoutLimit(templateArray, 27);
												_thisMod.close();
											} else if ($('#printLR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_thisMod.close();
											} else if ($('#printQR').prop('checked') == true) {
												_this.printQRCodeWithoutLimit(templateArray, 27);
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
								}else if (QRCodePrintType == 'customQRCodePrint_764') {
									dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px;margin-top:50px;font-size:40px;"><tr><td colspan="2" style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;font-weight:bold;text-align: center;">VTIPL</td></tr><tr><td style="border-bottom: solid 1px; border-top:none; border-right: solid 1px; padding: 0px 10px 0px 10px;">LR No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.waybillNumber + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">TO</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + responseOut.wayBillDestinationBranchName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Qty</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.currentPackage + ' of ' + dataObject.numberOfPackages + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">From</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.sourceFrom + '</td></tr><tr><td style="border-right: solid 1px; padding: 0px 10px 0px 10px;">Type</td><td style=" padding: 0px 10px 0px 10px;">' + dataObject.lrType + '</td></tr></table>')({ dataObject: dataObject });
									if(responseOut.isQrBtnClicked) 
										printAllQRCodeWithoutLimitAsync(templateArray);

									var wayBillTypeId = responseOut.wayBillTypeId;
									$('#popUpContentForQrCodeOption_764').bPopup({

									}, function() {
										var _thisMod = this;
										if (wayBillTypeId == WAYBILL_TYPE_CREDIT && responseOut.wayBillSourceBranchId != 67413){
											$(this).html("<div class='confirm' style='height:200px;width:250px; padding:5px'>"
											+ "<div style='font-size:18px; color:DodgerBlue;text-align:center;'><b>Print Option</b><div><br/>"
											+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' checked='checked' id='printLR'/>&nbsp;<b style='font-size:14px;'>Print LR</b><div><br/>"
											+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' checked='checked' id='printQR'/>&nbsp;<b style='font-size:14px;'>Print QR</b><div><br/>"
											+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' id='check1'/>&nbsp;<b style='font-size:14px;'>Print Charge</b><div><br/>"
											+ "<button id='cancelButton'>Cancel</button>"
											+ "<button autofocus id='confirm'>Print</button></center></div>")
										}else{
											$(this).html("<div class='confirm' style='height:150px;width:250px; padding:5px'>"
											+ "<div style='font-size:18px; color:DodgerBlue;text-align:center;'><b>Print Option</b><div><br/>"
											+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' checked='checked' id='printLR'/>&nbsp;<b style='font-size:14px;'>Print LR</b><div><br/>"
											+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' checked='checked' id='printQR'/>&nbsp;<b style='font-size:14px;'>Print QR</b><div><br/>"
											+ "<button id='cancelButton'>Cancel</button>"
											+ "<button autofocus id='confirm'>Print</button></center></div>")	
										}

										$("#confirm").focus();
										$("#cancelButton").click(function() {
											window.close();
											_thisMod.close();
										})
										
										if (wayBillTypeId == WAYBILL_TYPE_CREDIT && responseOut.wayBillSourceBranchId != 67413){
											$('#confirm').click(function() {
												if ($('#printLR').prop('checked') == true && $('#printQR').prop('checked') == true && $("#check1").is(":checked")) {
													$(".showChrges").show();
													_this.printAndCloseQRCodePrint();
													_this.printQRCodeWithoutLimit(templateArray, 27);
													_thisMod.close();
												} else if ($('#printLR').prop('checked') == true && $("#check1").is(":checked")) {
													$(".showChrges").show();
													_this.printAndCloseQRCodePrint();
													_thisMod.close();
												} else if ($('#printQR').prop('checked') == true && $("#check1").is(":checked")){
													$(".showChrges").show();
													_this.printQRCodeWithoutLimit(templateArray, 27);
													_thisMod.close();
													window.close();
												}else if ($('#printLR').prop('checked') == true && $('#printQR').prop('checked') == true && !$("#check1").is(":checked")) {
													$(".showChrges").hide();
													_this.printAndCloseQRCodePrint();
													_this.printQRCodeWithoutLimit(templateArray, 27);
													_thisMod.close();
												} else if ($('#printLR').prop('checked') == true && !$("#check1").is(":checked")) {
													$(".showChrges").hide();
													_this.printAndCloseQRCodePrint();
													_thisMod.close();
												} else if ($('#printQR').prop('checked') == true && !$("#check1").is(":checked")){
													$(".showChrges").hide();
													_this.printQRCodeWithoutLimit(templateArray, 27);
													_thisMod.close();
													window.close();
												} else
													window.close();
	
												_thisMod.close();
											});
										}else{
											$('#confirm').click(function() {
												if ($('#printLR').prop('checked') == true && $('#printQR').prop('checked') == true) {
													_this.printAndCloseQRCodePrint();
													_this.printQRCodeWithoutLimit(templateArray, 27);
													_thisMod.close();
												} else if ($('#printLR').prop('checked') == true) {
													_this.printAndCloseQRCodePrint();
													_thisMod.close();
												} else if ($('#printQR').prop('checked') == true) {
													_this.printQRCodeWithoutLimit(templateArray, 27);
													_thisMod.close();
													window.close();
												} else
													window.close();
	
												_thisMod.close();
											});
										}
										
										$('#confirm').on('keydown', function(e) {
											if (e.which == 27) {  //escape
												window.close();
											}
										});

									});
								} else if (QRCodePrintType == 'customQRCodePrint_557') {
									
									if (consigneeName.length > 12)
									consigneeName = consigneeName.substring(0, 20);
									
									dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 3px;margin-top:20px;font-size:50px;vertical-align:top;" cellpadding="0" cellspacing="0"><tr><td style="border-bottom: solid 3px;border-top: solid 3px; border-top:none; border-right: solid 3px;border-bottom: solid 3px; padding: 0px 10px 0px 10px;font-size:42px;">LR No</td><td style="border-bottom: solid 3px; padding: 0px 10px 0px 10px;font-weight: bold;font-size:58px;">' + dataObject.waybillNumber + '</td></tr><tr><td style="border-bottom: solid 3px;border-top: solid 0px; border-right: solid 3px; padding: 0px 10px 0px 10px;font-size:45px;">Qty</td><td style="border-bottom: solid 3px;border-top: solid 0px; padding: 0px 10px 0px 10px;font-size:60px;">' + dataObject.numberOfPackages + '</td></tr><tr><td	style="border-bottom: solid 3px; padding: 0px 10px 0px 10px;font-size:37px;border-right: solid 3px;"><span>Consignee Name</span></td><td style="font-size:35px;border-bottom: solid 3px;word-wrap: break-word;word-break: normal;white-space: normal;">' + consigneeName + '</td></tr><tr><td	style="border-bottom: solid 3px; border-right: solid 3px;border-top: solid 3px; padding: 0px 10px 0px 10px;"><span>To Branch</span></td><td style="border-bottom: solid 3px;border-top: solid 3px;word-wrap: break-word;word-break: normal;white-space: normal;">' + responseOut.wayBillDestinationBranchName + '</td></tr><tr><td style="border-bottom: solid 3px; border-right: solid 3px; padding: 0px 10px 0px 10px;">From</td><td style="border-bottom: solid 3px;padding: 0px 10px 0px 10px;word-wrap: break-word;word-break: normal;white-space: normal;">' + dataObject.sourceFrom + '</td></tr><tr><td style="border-bottom: solid 0px; border-right: solid 3px; padding: 0px 10px 0px 10px;">Type</td><td style="border-bottom: solid 0px;padding: 0px 10px 0px 10px;">' + dataObject.lrType + '</td></tr></table>')({ dataObject: dataObject });

									$('#popUpContentForQrCodeOption_557').bPopup({

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
											if ($('#printLR').prop('checked') == true && $('#printQR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_this.printQRCodeOnLimt(templateArray, 27);
												_thisMod.close();
											} else if ($('#printLR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_thisMod.close();
											} else if ($('#printQR').prop('checked') == true) {
												_this.printQRCodeOnLimt(templateArray, 27);
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
								} else if (QRCodePrintType == 'customQRCodePrint_650') {
									if (consigneeName.length > 12)
										consigneeName = consigneeName.substring(0, 12);
										
									var consignorName = responseOut.consignorName;	
									if (consignorName.length > 12)
										consignorName = consignorName.substring(0, 12);	
									
									if (consignorName.length > 4) 
										consignorName = consignorName.substring(0, 4) + '*'.repeat(consignorName.length - 4);


									dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px;margin-top:70px;font-size:40px;"><tr><td style="border-bottom: solid 1px; border-top:none; border-right: solid 1px; padding: 0px 10px 0px 10px;height:70px">CN No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;height:70px;border-right: solid 1px">' + dataObject.waybillNumber + '</td></tr><tr><td style="border-bottom: solid 1px; border-top:none; border-right: solid 1px; padding: 0px 10px 0px 10px;height:70px">Sender</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;height:70px;border-right: solid 1px">' + consignorName + '</td></tr><tr><td style="border-bottom: solid 1px; border-top:none; border-right: solid 1px; padding: 0px 10px 0px 10px;height:70px">Item</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;height:70px;border-right: solid 1px">' + dataObject.saidToContain + '</td></tr><tr><td style="border-bottom: solid 1px; border-top:none; border-right: solid 1px; padding: 0px 10px 0px 10px;height:70px">Receiver</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;height:70px;border-right: solid 1px">' + consigneeName + '</td></tr><tr><td style="border-bottom: solid 1px; border-top:none; border-right: solid 1px; padding: 0px 10px 0px 10px;height:70px">Mob No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;height:70px;border-right: solid 1px">' + responseOut.consigneePhn + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;height:70px">To</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;height:70px;border-right: solid 1px">' + responseOut.wayBillDestinationBranchName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;height:70px;border-top: solid 0px">Qty</td><td style="font-weight: bold; padding: 0px 10px 0px 10px;;height:70px;border-right: solid 1px;border-top: solid 0px"><span>' + dataObject.currentPackage + ' of ' + dataObject.numberOfPackages +  '</span>&nbsp;&nbsp;&nbsp;<span style="font-weight: bold;font-size: 15px;">'+ 'Dt: '+ '</span><span style="font-size: 20px;">'+dataObjectColl.bookingDate+'</span></td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;height:70px;border-top: solid 1px">From</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;;height:70px;border-right: solid 1px;border-top: solid 1px">' + dataObject.sourceFrom + '</td></tr></table>')({ dataObject: dataObject });
									$('#popUpContentForQrCodeOption_650').bPopup({

									}, function() {
										var _thisMod = this;
										$(this).html("<div class='confirm' style='height:300px;width:250px; padding:5px'>"
											+ "<div style='font-size:18px; color:DodgerBlue;text-align:center;'><b>Print Option</b><div><br/>"
											+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' checked='checked' id='printLR'/>&nbsp;<b style='font-size:14px;'>Print LR</b><div><br/>"
											+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' checked='checked' id='printQR'/>&nbsp;<b style='font-size:14px;'><span id= 'thermal'>Print QR</span></b><div>"
											+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' checked='checked' id='printQRLaser'/>&nbsp;<b style='font-size:14px;'><span id= 'laser'>Print QR Lasser</span></b><div><br/>"
											+ "<div style='text-align:center;color:black;font-size:17px;' class='hide' id='hideChargesDiv'>"
											+ "  <b style='font-size:14px;'>Hide Charges</b><br/><br/>"

											+ "  <input type='checkbox'  id='firstCopy' /> "
											+ "  <span style='font-size:13px;'>1st Copy</span>"

											+ "  <input type='checkbox'  id='secondCopy' /> "
											+ "  <span style='font-size:13px;'>2nd Copy</span>"

											+ "  <input type='checkbox'  id='thirdCopy' /> "
											+ "  <span style='font-size:13px;'>3rd Copy</span>"
											+ "</div><br/>"
											+ "<button id='cancelButton'>Cancel</button>"
											+ "<button autofocus id='confirm'>Print</button></center></div>")

										$("#confirm").focus();
										$("#cancelButton").click(function() {
											window.close();
											_thisMod.close();
										})
										if (branchAllowedforQr) {
											$('#printQR').hide();
											$('#thermal').hide();
										} else {
											$('#printQRLaser').hide();
											$('#laser').hide();
										}
										if(chargeHideUserIdWise && responseOut.wayBillTypeId == WAYBILL_TYPE_PAID)
											$('#hideChargesDiv').show();
										else if(responseOut.wayBillTypeId == WAYBILL_TYPE_PAID)
										    $('#hideTBBCharges').hide();
										else
											$('#firstCopy, #secondCopy, #thirdCopy').prop('checked', false);
										
										$('#confirm').click(function() {
											
											$(".hideChargesFirstCopy").toggle(!$('#firstCopy').prop('checked'));
											$(".hideChargesSecondCopy").toggle(!$('#secondCopy').prop('checked'));
											$(".hideChargesThirdCopy").toggle(!$('#thirdCopy').prop('checked'));
											
											if ($('#printLR').prop('checked') == true && $('#printQR').prop('checked') == true && !branchAllowedforQr) {
												_this.printAndCloseQRCodePrint();
												_this.printQRCodeWithoutLimit(templateArray, 27);
												_thisMod.close();
											} else if ($('#printLR').prop('checked') == true && !branchAllowedforQr) {
												_this.printAndCloseQRCodePrint();
												_thisMod.close();
											} else if ($('#printQR').prop('checked') == true && !branchAllowedforQr) {
												_this.printQRCodeWithoutLimit(templateArray, 27);
												_thisMod.close();
												window.close();
											} else if ($('#printQRLaser').prop('checked') == true && branchAllowedforQr) {
												_this.getqrcode(responseOut);
												_thisMod.close();
												setTimeout(function() {
													window.print();
													window.close();
												}, 1500);

											}else
												window.close();
											
											_thisMod.close();
												
										});
										$('#confirm').on('keydown', function(e) {
											if (e.which == 27) {  //escape
												window.close();
											}
										});

									});

								} else if (QRCodePrintType == 'customQRCodePrint_324') {
									if (consigneeName.length > 12)
										consigneeName = consigneeName.substring(0, 12);

									dataObject.htmlTemplate = _.template('<table style="margin-left:1px; border: solid 0px;margin-top:20px;vertical-align:top;padding-left:150px;text-align:right"><tr><td style="font-weight:bold;text-align:right;padding-right:110px;font-size:68px">SRE PUNE</td></tr></table><table style="margin-left:10px; border: solid 0px;margin-top:8px;"><tr><td style="border-bottom: solid 0px; border-top:none; border-right: solid 0px; padding: 0px 10px 0px 10px;height:80px"><span>LR No:</span><span style="border-bottom: solid 0px; padding: 0px 10px 0px 10px;height:80px">' + dataObject.waybillNumber + '</span>&nbsp;&nbsp;&nbsp;<span style="height:80px"><span>Quantity:</span>&nbsp<span>' + dataObject.numberOfPackages + '</span></td></tr><tr><td style="border-bottom: solid 0px; border-right: solid 0px; padding: 0px 10px 0px 10px;;height:80px"><span>From Branch :</span>&nbsp;<span>' + responseOut.wayBillSourceBranchName + '</span></td></tr><tr><td style="border-bottom: solid 0px; border-right: solid 0px; padding: 0px 10px 0px 10px;height:80px"><span>To Branch :</span>&nbsp;<span>' + responseOut.wayBillDestinationBranchName + '</span></td></tr><tr><td style="border-bottom: solid 0px; border-right: solid 0px; padding: 0px 10px 0px 10px;;height:80px"><span>Receiver :</span>&nbsp;<span>' + consigneeName + '</span></td></tr><tr><td style="border-bottom: solid 0px; border-right: solid 0px; padding: 0px 10px 0px 10px;height:80px"><span>LR Type:</span>&nbsp;<span>' + dataObject.lrType + '</span></td></tr><tr><td style="border-bottom: solid 0px; border-right: solid 0px; padding: 0px 10px 0px 10px;height:80px"><span>Item Type:</span>&nbsp;<span>' + dataObject.currentPackingType + '</span></td></tr></table>')({ dataObject: dataObject });
									$('#popUpContentForQrCodeOption_324').bPopup({

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
											if ($('#printLR').prop('checked') == true && $('#printQR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_this.printQRCodeOnLimt(templateArray, 5);
												_thisMod.close();
											} else if ($('#printLR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_thisMod.close();
											} else if ($('#printQR').prop('checked') == true) {
												_this.printQRCodeOnLimt(templateArray, 5);
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

								} else if (QRCodePrintType == 'customQRCodePrint_367') {
									var consignorName = responseOut.consignorName;
									if (consignorName.length > 12)
										consignorName = consignorName.substring(0, 30);
									if (consigneeName.length > 12)
										consigneeName = consigneeName.substring(0, 30);
									dataObject.htmlTemplate = _.template('<table style="width: 50%; margin-left: 40px; margin-top: 80px; font-size: 40px;"><tr><td colspan="2"style="padding: 0px 10px 0px 10px; font-weight: bold; font-size: 40px"></td></tr><tr><td style="padding: 0px 10px 0px 10px; font-size: 25px; width: 35%;">Date :</td><td style="padding: 0px 10px 0px 10px; font-weight: bold; font-size: 40px;width:65%;">' + dataObjectColl.bookingDate + ' ' + dataObjectColl.bookingTime + '</td></tr><tr><td style="padding: 0px 10px 0px 10px; font-size: 25px; width: 35%;">From</td><td  style="padding: 0px 10px 0px 10px; font-weight: bold; font-size: 50px;width:65%;">' + dataObjectColl.sourceFrom + '</td></tr><tr><td style="padding: 0px 10px 0px 10px; font-size: 25px; width: 35%;"><span>To</span></td><td style="padding: 0px 10px 0px 10px; font-weight: bold; font-size: 50px;width:65%;">' + responseOut.wayBillDestinationBranchName + '</td></tr><tr><td style="padding: 0px 10px 0px 10px; font-size: 25px; width: 35%;">Consignor :</td><td style="padding: 0px 10px 0px 10px; font-size: 20px;width:65%;">' + consignorName + '</td></tr><tr><td style="padding: 0px 10px 0px 10px; font-size: 25px; width: 35%;">Consignee :</td><td style="padding: 0px 10px 0px 10px; font-size: 20px;width:65%;">' + consigneeName + '</td></tr><tr><td style="padding: 0px 10px 0px 10px; width: 35%; ">LR NO:</td><td style="padding: 0px 10px 0px 10px; font-weight: bold; font-size: 59px;width:65%;">' + dataObject.waybillNumber + ' X ' + dataObjectColl.numberOfPackages + '</td></tr></table>')({ dataObject: dataObject });
									$('#popUpContentForQrCodeOption_367').bPopup({
									}, function() {
										var _thisMod = this;
										$(this).html("<div class='confirm' style='height:210px;width:250px; padding:5px'>"
											+ "<div style='font-size:18px; color:DodgerBlue;text-align:center;'><b>Print Option</b><div><br/>"
											+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' checked='checked' id='printLR'/> <b style='font-size:14px;'>Print LR</b><div><br/>"
											+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' checked='checked' id='printQR'/> <b style='font-size:14px;'>Print QR</b><div><br/>"
											+ "<div style='text-align:left;color:black;font-size:17px;' ><input type='checkbox' class='printData' id='printCharges'/> <span class='printData'><b style='font-size:14px;'>Print Charges</b></span><div><br/>"
											+ "<button id='cancelButton'>Cancel</button>"
											+ "<button autofocus id='confirm'>Print</button></center></div>")

										$("#confirm").focus();

										if (responseOut.wayBillTypeId != WAYBILL_TYPE_CREDIT) {
											$(".printData").hide();
										}

										$("#cancelButton").click(function() {
											window.close();
											_thisMod.close();
										})

										$('#confirm').click(function() {
											if (responseOut.wayBillTypeId == WAYBILL_TYPE_CREDIT) {
												if ($('#printCharges').prop('checked') == true)
													$(".removeChargest").show();
												else
													$(".removeChargest").hide();
											}
											if ($('#printLR').prop('checked') == true && $('#printQR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_this.printQRCodeWithoutLimit(templateArray, 1000);
												_thisMod.close();
											} else if ($('#printLR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_thisMod.close();
											} else if ($('#printQR').prop('checked') == true) {
												_this.printQRCodeWithoutLimit(templateArray, 1000);
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
								} else if (QRCodePrintType == 'customQRCodePrint_565') {
									if (consigneeName.length > 12)
										consigneeName = consigneeName.substring(0, 12);

									dataObject.htmlTemplate = _.template('<table style="border: solid 1px;verical-align: top;"><tr><td colspan="2" style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;font-size:46px;">' + accountGroupObj.accountGroupName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;font-size:35px;"><span>LR No :</span>&nbsp;&nbsp;&nbsp;<span>' + dataObject.waybillNumber + '</span></td></td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;font-size:35px;"><span>Booking Date:</span>&nbsp;&nbsp;&nbsp;<span>' + dataObjectColl.bookingDate + '</span></td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;font-size:35px;"><span>FromCity :</span>&nbsp;&nbsp;&nbsp;<span>' + dataObject.sourceFrom + '</span></td></td></tr><tr><td style="border-bottom: solid 1px;border-right:solid 1px; padding: 0px 10px 0px 10px;font-size:35px;"><span>ToCity :</span>&nbsp;&nbsp;&nbsp;<span>' + dataObject.destinationTo + '</span></td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;font-size:35px;"><span>Booking Branch:</span>&nbsp;&nbsp;&nbsp;<span>' + dataObjectColl.sourceBranch + '</span></td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;font-size:35px;"><span>Receiver :</span>&nbsp;&nbsp;&nbsp;<span>' + consigneeName + '</span></td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;font-size:35px;"><span>RecMobileNo:</span>&nbsp;&nbsp;&nbsp;<span>' + dataObjectColl.consigneePhn + '</span></td></tr><tr><td style="border-bottom: solid 1px;border-right:solid 1px; padding: 0px 10px 0px 10px;font-size:35px;"><span>Quantity:</span>&nbsp;&nbsp;&nbsp;<span>' + dataObject.numberOfPackages + '</span></td></tr><tr><td style="border-right: solid 1px; padding: 0px 10px 0px 10px;font-size:35px;"><span>Item TYPE:</span>&nbsp;&nbsp;&nbsp;<span>' + dataObject.currentPackingType + '</span></td></tr></table>')({ dataObject: dataObject });

									$('#popUpContentForQrCodeOption_565').bPopup({

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
											if ($('#printLR').prop('checked') == true && $('#printQR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();

												if (dataObject.numberOfPackages <= 50)
													_this.printQRCodeOnLimt(templateArray, 10);

												_thisMod.close();
											} else if ($('#printLR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_thisMod.close();
											} else if ($('#printQR').prop('checked') == true) {
												if (dataObject.numberOfPackages <= 50)
													_this.printQRCodeOnLimt(templateArray, 10);

												_thisMod.close();
												window.close();
											} else {
												window.close();
											}
											_thisMod.close();
										});
										$('#confirm').on('keydown', function(e) {
											if (e.which == 27) {  //escape
												window.close();
											}
										});

									});
								} else if (QRCodePrintType == 'customQRCodePrint_641') {
									dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px;margin-top:50px;font-size:40px;"><tr><td colspan="2" style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;font-weight:bold;">Shree Sai Travels</td></tr><tr><td style="border-bottom: solid 1px; border-top:none; border-right: solid 1px; padding: 0px 10px 0px 10px;">LR No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.waybillNumber + '</td></tr><tr><td style="border-bottom: solid 1px; border-top:none; border-right: solid 1px; padding: 0px 10px 0px 10px;">Mob No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + accountGroupObj.branchContactDetailMobileNumber + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To Branch:</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + responseOut.wayBillDestinationBranchName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Qty</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.currentPackage + ' of ' + dataObject.numberOfPackages + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">From</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.sourceFrom + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Type</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.lrType + '</td></tr></table>')({ dataObject: dataObject });

									$('#popUpContentForQrCodeOption_641').bPopup({

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
											if ($('#printLR').prop('checked') == true && $('#printQR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_this.printQRCodeOnLimt(templateArray, 27);
												_thisMod.close();
											} else if ($('#printLR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_thisMod.close();
											} else if ($('#printQR').prop('checked') == true) {
												_this.printQRCodeOnLimt(templateArray, 27);
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
								} else if (QRCodePrintType == 'customQRCodePrint_573') {
									if (consigneeName.length > 12)
										consigneeName = consigneeName.substring(0, 12);

									dataObject.htmlTemplate = _.template('<table style="border: solid 1px;verical-align: top;width:100%;"><tr><td style="width:100%"><table style="width:100%"><tr><td style="width:20%"><table style="width:100%"><tr><td style="border-bottom: solid 1px; border-right:solid 1px black;height:65px;"><img src="" width="160px" height="100%"></td></tr><tr><td style="border-bottom: solid 1px;border-right:solid 1px black;text-align:center;">DKT NO :</td></tr><tr><td	 style="border-bottom: solid 1px;border-right:solid 1px black;text-align:center;">FROM :</td></tr><tr><td style="border-right:solid 1px black;text-align:center;">TO :</td></tr></table></td><td style="width:80%;"><table style="width:100%;"><tr><td style="font:70px courier new;font-weight:bold; border-bottom:solid 1px black;padding: 0px 0px 0px 0px; text-transform: uppercase; ">' + accountGroupObj.accountGroupName + '</td></tr><tr><td style="border-bottom:solid 1px black;width:20%;padding-left:40px"><span>' + dataObject.waybillNumber + '</span></td></tr><tr><td style="border-bottom:solid 1px black;padding-left:40px;"><span>' + dataObject.sourceBranchCode + '</span> <span style="border-left:solid 1px;border-right:solid 1px;padding-left:50px;">NO PKG</span><span style="padding-left:60px">' + dataObject.numberOfPackages + '</span></td></tr><tr><td><span style="padding-left:40px">' + dataObject.DeliveryToAddress + '</span></td></tr></td></tr></table></td></tr></table></td></tr><tr><td style="width:100%;border-top:1px solid black;"><table style="width:100%"><tr><td style="word-break: normal;white-space: normal;font-size:30px;padding-left:45px;"><span>info@localwheels.in,www.localwheels.in</span></td></tr></table></td></tr></table>')({ dataObject: dataObject });

									$('#popUpContentForQrCodeOption_573').bPopup({
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
											if ($('#printLR').prop('checked') == true && $('#printQR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();

												if (dataObject.numberOfPackages <= 50)
													_this.printQRCodeOnLimt(templateArray, 10);

												_thisMod.close();
											} else if ($('#printLR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_thisMod.close();
											} else if ($('#printQR').prop('checked') == true) {
												if (dataObject.numberOfPackages <= 50)
													_this.printQRCodeOnLimt(templateArray, 10);

												_thisMod.close();
												window.close();
											} else {
												window.close();
											}
											_thisMod.close();
										});
										$('#confirm').on('keydown', function(e) {
											if (e.which == 27) {  //escape
												window.close();
											}
										});

									});
								} else if (QRCodePrintType == 'customQRCodePrint_22') {
									var consignorName = responseOut.consignorName;
										
									dataObject.htmlTemplate = _.template('<table style=" margin-left: 40px; margin-top: 0px; font-size: 40px;"><tr><td style="padding: 0px 10px 0px 10px; font-size: 25px; width: 35%;">Date :</td><td style="padding: 0px 10px 0px 10px; font-weight: bold; font-size: 40px;width:65%;">' + dataObjectColl.bookingDate + '</td></tr><tr><td style="padding: 0px 10px 0px 10px; font-size: 25px; width: 35%;">From</td><td	style="padding: 0px 10px 0px 10px; font-weight: bold; font-size: 40px;width:65%;">' + responseOut.wayBillSourceBranchName + '</td></tr><tr><td style="padding: 0px 10px 0px 10px; font-size: 25px; width: 35%;"><span>To</span></td><td style="padding: 0px 10px 0px 10px; font-weight: bold; font-size: 40px;width:65%;">' + responseOut.wayBillDestinationBranchName + '</td></tr><tr><td style="padding: 0px 10px 0px 10px; font-size: 25px; width: 35%;">Consignor :</td><td style="padding: 0px 10px 0px 10px; font-size: 20px;width:65%;">' + consignorName + '</td></tr><tr><td style="padding: 0px 10px 0px 10px; font-size: 25px; width: 35%;">Consignee :</td><td style="padding: 0px 10px 0px 10px; font-size: 20px;width:65%;">' + consigneeName + '</td></tr><tr><td style="padding: 0px 10px 0px 10px; width: 35%; ">LR NO:</td><td style="padding: 0px 10px 0px 10px; font-weight: bold; font-size: 40px;width:65%;">' + dataObject.waybillNumber + ' X ' + dataObject.currentPackage + '</td></tr></table>')({ dataObject: dataObject });
									$('#popUpContentForQrCodeOption_22').bPopup({
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
											if ($('#printLR').prop('checked') == true && $('#printQR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_this.printQRCodeWithoutLimit(templateArray, 1000);

												_thisMod.close();
											} else if ($('#printLR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_thisMod.close();
											} else if ($('#printQR').prop('checked') == true) {
												_this.printQRCodeWithoutLimit(templateArray, 1000);

												_thisMod.close();
												window.close();
											} else {
												window.close();
											}
											_thisMod.close();
										});
										$('#confirm').on('keydown', function(e) {
											if (e.which == 27) {  //escape
												window.close();
											}
										});

									});
								} else if (QRCodePrintType == 'customQRCodePrint_567') {
									var consignorName = responseOut.consignorName;
									if (consignorName.length > 12)
										consignorName = consignorName.substring(0, 16);
									if (consigneeName.length > 12)
										consigneeName = consigneeName.substring(0, 16);	
									dataObject.htmlTemplate = _.template('<table cellpadding="0" cellspacing="0" style=" margin-left: 0px; margin-top: 0px; font-size: 35px;"><tr><td colspan="2" height="110px" style="border-top: 3px solid #333333; border-bottom: 3px solid #333333; border-left: 3px solid #333333; border-right: 3px solid #333333; padding: 0px 10px 0px 10px; font-size: 60px; width: 100%;">KAVI LOGISTICS</td></tr><tr><td style="border-bottom: 3px solid #333333; border-left: 3px solid #333333; border-right: 3px solid #333333; padding: 0px 10px 0px 10px;	width: 35%;"><span>To</span></td><td style="border-bottom: 3px solid #333333; border-right: 3px solid #333333; padding: 0px 10px 0px 10px; font-weight: bold; width:65%;word-wrap: break-word;word-break: normal;white-space: normal;">' + responseOut.wayBillDestinationBranchName + '</td></tr><tr><td style="border-bottom: 3px solid #333333; border-left: 3px solid #333333; border-right: 3px solid #333333; padding: 0px 10px 0px 10px;	width: 35%;">Consignee </td><td style="border-bottom: 3px solid #333333; border-right: 3px solid #333333; padding: 0px 10px 0px 10px; width:65%;word-wrap: break-word;word-break: normal;white-space: normal;">' + consigneeName + '</td></tr><tr><td colspan="2" style="border-bottom: 3px solid #333333; border-right: 3px solid #333333;border-left: 3px solid #333333; padding: 0px 10px 0px 10px; font-weight: bold; width:65%;"><span>Date :</span> <span style="text-transform: uppercase;">' + dataObjectColl.bookingDate + ' ' + dataObjectColl.bookingTime + '</span></td></tr><tr><td style="border-bottom: 3px solid #333333; border-left: 3px solid #333333; border-right: 3px solid #333333; padding: 0px 10px 0px 10px; width: 35%; "> ' + dataObject.currentPackage + ' of ' + dataObject.numberOfPackages + '</td><td style="border-bottom: 3px solid #333333; border-right: 3px solid #333333; padding: 0px 10px 0px 10px; font-weight: bold; width:65%;">LR.NO : ' + dataObject.waybillNumber + '</td></tr></table>')({ dataObject: dataObject });
									$('#popUpContentForQrCodeOption_567').bPopup({
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
											if ($('#printLR').prop('checked') == true && $('#printQR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_this.printQRCodeWithoutLimit(templateArray, 1000);

												_thisMod.close();
											} else if ($('#printLR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_thisMod.close();
											} else if ($('#printQR').prop('checked') == true) {
												_this.printQRCodeWithoutLimit(templateArray, 1000);

												_thisMod.close();
												window.close();
											} else {
												window.close();
											}
											_thisMod.close();
										});
										$('#confirm').on('keydown', function(e) {
											if (e.which == 27) {  //escape
												window.close();
											}
										});

									});
								}else if (QRCodePrintType == 'customQRCodePrint_50') {
									
									if (consigneeName.length > 12)
										consigneeName = consigneeName.substring(0, 16);	
									
									dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 3px; " cellpadding="0" cellspacing="0"><tr><td style="border-bottom: solid 3px; border-right: solid 3px; padding: 0px 10px 0px 10px;">LR No</td><td style="border-bottom: solid 3px; padding: 0px 10px 0px 10px;">' + dataObject.waybillNumber + '</td></tr><tr><td style="border-bottom: solid 3px; border-right: solid 3px; padding: 0px 10px 0px 10px;">To<br>Branch</td><td style="border-bottom: solid 3px; padding: 0px 10px 0px 10px;word-wrap: break-word;word-break: normal;white-space: normal;">' + destinationBranchName + '</td></tr><tr><td style="border-bottom: solid 3px; border-right: solid 3px; padding: 0px 10px 0px 10px;">Qty</td><td style="border-bottom: solid 3px; padding: 0px 10px 0px 10px;">' + dataObject.currentPackage + ' of ' + dataObject.numberOfPackages + '</td></tr><tr><td style=" border-right: solid 3px; padding: 0px 10px 0px 10px;">Consignee</td><td style=" padding: 0px 10px 0px 10px;word-wrap: break-word;word-break: normal;white-space: normal;">' + consigneeName + '</td></tr></table>')({ dataObject: dataObject });	
									
									$('#popUpContentForQrCodeOption_50').bPopup({
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
											if ($('#printLR').prop('checked') == true && $('#printQR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_this.printQRCodeWithoutLimit(templateArray, 1000);

												_thisMod.close();
											} else if ($('#printLR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_thisMod.close();
											} else if ($('#printQR').prop('checked') == true) {
												_this.printQRCodeWithoutLimit(templateArray, 1000);

												_thisMod.close();
												window.close();
											} else {
												window.close();
											}
											_thisMod.close();
										});
										$('#confirm').on('keydown', function(e) {
											if (e.which == 27) {  //escape
												window.close();
											}
										});

									});
								}else if (QRCodePrintType == 'customQRCodePrint_1004') {
									dataObject.htmlTemplate = _.template('<table style="margin-left:10px;"><tr><td><span style="font-weight:bold;">To : </span><span style="font-size:70px;font-weight:bold;">' + destinationBranchName + '</span></td></tr><tr><td style="font-weight:bold;"><span>LR No : </span><span style="font-size:70px;">' + dataObject.waybillNumber + '</span></td></tr><tr><td style=""><span style="font-weight:bold;">Type : </span><span style="">' + dataObject.lrType + '</span></td></tr><tr><td><span style="font-weight:bold;">Qty : </span><span style="">' + dataObject.currentPackage + ' of ' + dataObject.numberOfPackages + '</span></td></tr><tr><td><span style="font-weight:bold;">From : </span><span style="">' + dataObjectColl.sourceBranch + '</span></td></tr></table>')({ dataObject: dataObject });	
									
									$('#popUpContentForQrCodeOption_1004').bPopup({
									}, function() {
										var _thisMod = this;
										$(this).html("<div class='confirm' style='height:180px;width:250px; padding:5px'>"
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
											if ($('#printLR').prop('checked') == true && $('#printQR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_this.printQRCodeWithoutLimit(templateArray, 1000);

												_thisMod.close();
											} else if ($('#printLR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_thisMod.close();
											} else if ($('#printQR').prop('checked') == true) {
												_this.printQRCodeWithoutLimit(templateArray, 1000);

												_thisMod.close();
												window.close();
											} else {
												window.close();
											}
											_thisMod.close();
										});
										$('#confirm').on('keydown', function(e) {
											if (e.which == 27) {  //escape
												window.close();
											}
										});

									});
								}else if (QRCodePrintType == 'customQRCodePrint_348') {

									dataObject.htmlTemplate = _.template('<table style=" border: solid 3px;" cellpadding="0" cellspacing="0"><tr><td colspan="2" style="border-bottom: solid 3px; padding: 0px 10px 0px 10px;">' + accountGroupObj.accountGroupName + '</td></tr><tr><td style="border-bottom: solid 3px; border-right: solid 3px; padding: 0px 10px 0px 10px;">LR No</td><td style="border-bottom: solid 3px; padding: 0px 10px 0px 10px;">' + dataObject.waybillNumber + '</td></tr><tr><td style="border-bottom: solid 3px; border-right: solid 3px; padding: 0px 10px 0px 10px;">To</td><td style="border-bottom: solid 3px; padding: 0px 10px 0px 10px;">' + dataObject.destinationTo + '</td></tr><tr><td style="border-bottom: solid 3px; border-right: solid 3px; padding: 0px 10px 0px 10px;">Qty</td><td style="border-bottom: solid 3px; padding: 0px 10px 0px 10px;">' + dataObject.currentPackage + ' of ' + dataObject.numberOfPackages + '</td></tr><tr><td style="border-bottom: solid 3px; border-right: solid 3px; padding: 0px 10px 0px 10px;">From</td><td style="border-bottom: solid 3px; padding: 0px 10px 0px 10px;">' + dataObject.sourceFrom + '</td></tr><tr><td style="border-bottom: solid 3px; border-right: solid 3px; padding: 0px 10px 0px 10px;">Type</td><td style="border-bottom: solid 3px; padding: 0px 10px 0px 10px;">' + dataObject.lrType + '</td></tr></table>')({ dataObject: dataObject });
									
									$('#popUpContentForQrCodeOption_348').bPopup({
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
											if ($('#printLR').prop('checked') == true && $('#printQR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_this.printQRCodeWithoutLimit(templateArray, 1000);

												_thisMod.close();
											} else if ($('#printLR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_thisMod.close();
											} else if ($('#printQR').prop('checked') == true) {
												_this.printQRCodeWithoutLimit(templateArray, 1000);

												_thisMod.close();
												window.close();
											} else {
												window.close();
											}
											_thisMod.close();
										});
										$('#confirm').on('keydown', function(e) {
											if (e.which == 27) {  //escape
												window.close();
											}
										});

									});
								}else if (QRCodePrintType == 'customQRCodePrint_960') {
									
									dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 3px;" cellpadding="0" cellspacing="0"><tr><td colspan="2" style="border-bottom: solid 3px;; padding: 0px 10px 0px 10px;">AADINATH BULK PVT LTD</td></tr><tr><td style="border-bottom: solid 3px;; border-right: solid 3px;; padding: 0px 10px 0px 10px;">LR No</td><td style="border-bottom: solid 3px;; padding: 0px 10px 0px 10px;">' + dataObject.waybillNumber + '</td></tr><tr><td style="border-bottom: solid 3px;; border-right: solid 3px;; padding: 0px 10px 0px 10px;">To</td><td style="border-bottom: solid 3px;; padding: 0px 10px 0px 10px;">' + destinationBranchName + '</td></tr><tr><td style="border-bottom: solid 3px;; border-right: solid 3px;; padding: 0px 10px 0px 10px;">Qty</td><td style="border-bottom: solid 3px;; padding: 0px 10px 0px 10px;">' + dataObject.currentPackage + ' of ' + dataObject.numberOfPackages + '</td></tr><tr><td style="border-bottom: solid 3px;; border-right: solid 3px;; padding: 0px 10px 0px 10px;">From</td><td style="border-bottom: solid 3px;; padding: 0px 10px 0px 10px;">' + dataObject.sourceFrom + '</td></tr><tr><td style="border-bottom: solid 3px;; border-right: solid 3px;; padding: 0px 10px 0px 10px;">Type</td><td style="border-bottom: solid 3px;; padding: 0px 10px 0px 10px;">' + dataObject.lrType + '</td></tr><tr><td></td><td style="text-align:right; padding: 0px 10px 0px 10px;">IVCARGO</td></tr></table>')({ dataObject: dataObject });
									
									$('#popUpContentForQrCodeOption_960').bPopup({
									}, function() {
										var _thisMod = this;
										$(this).html("<div class='confirm' style='height:180px;width:250px; padding:5px'>"
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
											if ($('#printLR').prop('checked') == true && $('#printQR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_this.printQRCodeWithoutLimit(templateArray, 1000);

												_thisMod.close();
											} else if ($('#printLR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_thisMod.close();
											} else if ($('#printQR').prop('checked') == true) {
												_this.printQRCodeWithoutLimit(templateArray, 1000);

												_thisMod.close();
												window.close();
											} else {
												window.close();
											}
											_thisMod.close();
										});
										$('#confirm').on('keydown', function(e) {
											if (e.which == 27) {  //escape
												window.close();
											}
										});

									});
								}else if (QRCodePrintType == 'customQRCodePrint_621') {
									
									if (consigneeName.length > 12)
										consigneeName = consigneeName.substring(0, 16);	
									
									dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 3px; " cellpadding="0" cellspacing="0"><tr><td style="border-bottom: solid 3px; border-right: solid 3px; padding: 0px 10px 0px 10px;">Consignee</td><td style="border-bottom: solid 3px; padding: 0px 10px 0px 10px;word-wrap: none;word-break: break-all;white-space: normal;">' + consigneeName + '</td></tr><tr><td style="border-bottom: solid 3px; border-right: solid 3px; padding: 0px 10px 0px 10px;">Destination</td><td style="border-bottom: solid 3px; padding: 0px 10px 0px 10px;word-wrap: none;word-break: break-all;white-space: normal;">' + destinationBranchName + '</td></tr><tr><td style="border-bottom: solid 3px; border-right: solid 3px; padding: 0px 10px 0px 10px;">Qty</td><td style="border-bottom: solid 3px; padding: 0px 10px 0px 10px;">' + dataObject.currentPackage + ' of ' + dataObject.numberOfPackages + '</td></tr></table>')({ dataObject: dataObject });	
									
									$('#popUpContentForQrCodeOption_621').bPopup({
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
											if ($('#printLR').prop('checked') == true && $('#printQR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_this.printQRCodeWithoutLimit(templateArray, 1000);

												_thisMod.close();
											} else if ($('#printLR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_thisMod.close();
											} else if ($('#printQR').prop('checked') == true) {
												_this.printQRCodeWithoutLimit(templateArray, 1000);

												_thisMod.close();
												window.close();
											} else {
												window.close();
											}
											_thisMod.close();
										});
										$('#confirm').on('keydown', function(e) {
											if (e.which == 27) {  //escape
												window.close();
											}
										});

									});
								}else if (QRCodePrintType == 'customQRCodePrint_396') {
									
									if (consigneeName.length > 12)
										consigneeName = consigneeName.substring(0, 12);
										
									var consignorName = responseOut.consignorName;	
									if (consignorName.length > 12)
										consignorName = consignorName.substring(0, 12);	
									
									if (consignorName.length > 4) 
										consignorName = consignorName.substring(0, 4) + '*'.repeat(consignorName.length - 4);


									dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px;margin-top:70px;font-size:40px;"><tr><td style="border-bottom: solid 1px; border-top:none; border-right: solid 1px; padding: 0px 10px 0px 10px;height:70px">CN No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;height:70px;border-right: solid 1px">' + dataObject.waybillNumber + '</td></tr><tr><td style="border-bottom: solid 1px; border-top:none; border-right: solid 1px; padding: 0px 10px 0px 10px;height:70px">Sender</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;height:70px;border-right: solid 1px">' + consignorName + '</td></tr><tr><td style="border-bottom: solid 1px; border-top:none; border-right: solid 1px; padding: 0px 10px 0px 10px;height:70px">Item</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;height:70px;border-right: solid 1px">' + dataObject.saidToContain + '</td></tr><tr><td style="border-bottom: solid 1px; border-top:none; border-right: solid 1px; padding: 0px 10px 0px 10px;height:70px">Receiver</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;height:70px;border-right: solid 1px">' + consigneeName + '</td></tr><tr><td style="border-bottom: solid 1px; border-top:none; border-right: solid 1px; padding: 0px 10px 0px 10px;height:70px">Mob No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;height:70px;border-right: solid 1px">' + responseOut.consigneePhn + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;height:70px">To</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;height:70px;border-right: solid 1px">' + responseOut.wayBillDestinationBranchName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;height:70px;border-top: solid 0px">Qty</td><td style="font-weight: bold; padding: 0px 10px 0px 10px;;height:70px;border-right: solid 1px;border-top: solid 0px"><span>' + dataObject.currentPackage + ' of ' + dataObject.numberOfPackages +  '</span>&nbsp;&nbsp;&nbsp;<span style="font-weight: bold;font-size: 15px;">'+ 'Dt: '+ '</span><span style="font-size: 20px;">'+dataObjectColl.bookingDate+'</span></td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;height:70px;border-top: solid 1px">From</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;;height:70px;border-right: solid 1px;border-top: solid 1px">' + dataObject.sourceFrom + '</td></tr></table>')({ dataObject: dataObject });
									
									$('#popUpContentForQrCodeOption_396').bPopup({
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
											if ($('#printLR').prop('checked') == true && $('#printQR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_this.printQRCodeWithoutLimit(templateArray, 1000);

												_thisMod.close();
											} else if ($('#printLR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_thisMod.close();
											} else if ($('#printQR').prop('checked') == true) {
												_this.printQRCodeWithoutLimit(templateArray, 1000);

												_thisMod.close();
												window.close();
											} else {
												window.close();
											}
											_thisMod.close();
										});
										$('#confirm').on('keydown', function(e) {
											if (e.which == 27) {  //escape
												window.close();
											}
										});

									});
								}else if (QRCodePrintType == 'customQRCodePrint_270') {
									
									if (consigneeName.length > 12)
										consigneeName = consigneeName.substring(0, 12);
										
									var consignorName = responseOut.consignorName;	
									if (consignorName.length > 12)
										consignorName = consignorName.substring(0, 12);	
									
									dataObject.htmlTemplate = _.template('<table cellpadding="0" width="100%" cellspacing="0" style=" border: solid 1px;"><tr><td height="125px" width="100%" colspan="2" style="border-top: 1px solid #333333;border-right: 1px solid #333333;border-left: 1px solid #333333;"><table width="100%"><tr><td  style="  padding: 0px 10px 0px 10px; -webkit-transform: rotate(-90deg); font-size: 15px;text-align: center;"width="10%">TO</td><td style=" padding: 0px 10px 0px 10px; font-size: 90px;">' + responseOut.wayBillDestinationBranchName + '</td></tr></table></td></tr><tr><td height="125px" width="50%" style="border-top: 1px solid #333333;border-right: 1px solid #333333;border-left: 1px solid #333333;"><table width="100%"><tr><td style=" padding: 0px 10px 0px 10px; -webkit-transform: rotate(-90deg); font-size: 15px;text-align: center;" width="10%">QTY</td><td style=" font-weight: bold; padding: 0px 10px 0px 10px;font-size: 90px;">' + dataObject.currentPackage + '/' + dataObject.numberOfPackages + '</td></tr></table></td><td width="50%" style="border-top: 1px solid #333333;border-right: 1px solid #333333;"><table width="100%"><tr><td style="padding: 0px 10px 0px 10px; -webkit-transform: rotate(-90deg); font-size: 15px; text-align: center;" width="10%">FROM</td><td style=" padding: 0px 10px 0px 10px; font-size: 90px;">' + dataObjectColl.sourceFrom + '</td></tr></table></td></tr><tr><td height="85px" width="100%" colspan="2" style="border-top: 1px solid #333333;border-right: 1px solid #333333;border-left: 1px solid #333333;"><table width="100%"><tr><td style="   padding: 0px 10px 0px 10px; -webkit-transform: rotate(-90deg); font-size: 15px; text-align: center;"width="10%">CNEE</td><td style=" padding: 0px 10px 0px 10px; font-size: 55px;">' + consigneeName + '</td></tr></table></td></tr><tr><td height="80px" width="100%" colspan="2" style="border-top: 1px solid #333333;border-right: 1px solid #333333;border-left: 1px solid #333333;"><table width="100%"><tr><td style="   padding: 0px 10px 0px 10px; -webkit-transform: rotate(-90deg); font-size: 15px;text-align: center;"width="10%">CNOR</td><td style=" padding: 0px 10px 0px 10px; font-size: 35px;">' + consignorName + '</td></tr></table></td></tr></table>')({ dataObject: dataObject });									
									var isRePrint = responseOut.isReprint;
									

									$('#popUpContentForQrCodeOption_270').bPopup({
									}, function() {
										var _thisMod = this;
										if (isRePrint) {
											$(this).html("<div class='confirm' style='height:200px;width:250px; padding:5px'>"
												+ "<div style='font-size:18px; color:DodgerBlue;text-align:center;'><b>Print Option</b><div><br/>"
												+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' checked='checked' id='duplicate'/>&nbsp;<b style='font-size:14px;'>Print Duplicate</b><div><br/>"
												+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' checked='checked' id='printLR'/>&nbsp;<b style='font-size:14px;'>Print LR</b><div><br/>"
												+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' checked='checked' id='printQR'/>&nbsp;<b style='font-size:14px;'>Print QR</b><div><br/>"
												+ "<button id='cancelButton'>Cancel</button>"
												+ "<button autofocus id='confirm'>Print</button></center></div>")
										}else{
											$(this).html("<div class='confirm' style='height:150px;width:250px; padding:5px'>"
												+ "<div style='font-size:18px; color:DodgerBlue;text-align:center;'><b>Print Option</b><div><br/>"
												+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' checked='checked' id='printLR'/>&nbsp;<b style='font-size:14px;'>Print LR</b><div><br/>"
												+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' checked='checked' id='printQR'/>&nbsp;<b style='font-size:14px;'>Print QR</b><div><br/>"
												+ "<button id='cancelButton'>Cancel</button>"
												+ "<button autofocus id='confirm'>Print</button></center></div>")
										}	
										$("#confirm").focus();
										$("#cancelButton").click(function() {
											window.close();
											_thisMod.close();
										})

										$('#confirm').click(function() {
											if ($('input[id="duplicate"]').prop("checked") == true) {
												$("#secondCopy").css("display", "none");
												$("#thirdCopy").css("display", "none");
												_this.printAndCloseQRCodePrint();
												_thisMod.close();
											} else if ($('input[id="duplicate"]').prop("checked") == false) {
												$("#firstCopy").css("display", "block");
												$("#secondCopy").css("display", "block");
												$("#thirdCopy").css("display", "block");
											}
											if ($('#printLR').prop('checked') == true && $('#printQR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_this.printQRCodeWithoutLimit(templateArray, 1000);

												_thisMod.close();
											} else if ($('#printLR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_thisMod.close();
											} else if ($('#printQR').prop('checked') == true) {
												_this.printQRCodeWithoutLimit(templateArray, 1000);

												_thisMod.close();
												window.close();
											} else {
												window.close();
											}
											_thisMod.close();
										});
										$('#confirm').on('keydown', function(e) {
											if (e.which == 27) {  //escape
												if ($('input[id="duplicate"]').prop("checked") == true) {
														$("#secondCopy").css("display", "none");
														$("#thirdCopy").css("display", "none");
													} else if ($('input[id="duplicate"]').prop("checked") == false) {
														$("#firstCopy").css("display", "block");
														$("#secondCopy").css("display", "block");
														$("#thirdCopy").css("display", "block");
													}
													_thisMod.close();
													_this.printWindow(isPdfExportAllow);
													_this.clearCharges(responseOut);
												window.close();
											}
										});

									});
								}else if (QRCodePrintType == 'customQRCodePrint_860') {
									if (consigneeName.length > 12)
									consigneeName = consigneeName.substring(0, 20);
									
									dataObject.htmlTemplate = _.template('<table width="100%" cellpadding="0" cellspacing="0" style="margin-left: 0px; margin-top: 0px;"><tr><td colspan="2"  style="font-size: 60px; font-weight: bold; width:100%;text-align: center;">City Express Parcel</td></tr><tr><td colspan="2"  style="font-weight: bold; width:100%;font-size: 50px;">' + dataObject.waybillNumber + '</td></tr><tr><td colspan="2"  style="font-size: 35px; font-weight: bold; width:100%;max-width: 85px;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;"><span>' + responseOut.wayBillSourceBranchName + '</span><span>-</span><span>' + responseOut.wayBillDestinationBranchName + '</span></td></tr><tr><td style="border-Left: 3px solid #333333;border-bottom: 3px solid #333333; border-top: 3px solid #333333; border-right: 3px solid #333333;font-size: 50px; font-weight: bold; width:30%;text-align: center;">' + dataObject.currentPackage + ' - ' + dataObject.numberOfPackages + '</td><td style="font-size: 35px; font-weight: bold; width:70%;"><span>' + consigneeName + '</span></br><span>' + dataObjectColl.bookingDate + '</span></td></tr></table>')({ dataObject: dataObject });
										
									$('#popUpContentForQrCodeOption_860').bPopup({
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
											if ($('#printLR').prop('checked') == true && $('#printQR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_this.printQRCodeWithoutLimit(templateArray, 1000);

												_thisMod.close();
											} else if ($('#printLR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_thisMod.close();
											} else if ($('#printQR').prop('checked') == true) {
												_this.printQRCodeWithoutLimit(templateArray, 1000);

												_thisMod.close();
												window.close();
											} else {
												window.close();
											}
											_thisMod.close();
										});
										$('#confirm').on('keydown', function(e) {
											if (e.which == 27) {  //escape
												window.close();
											}
										});

									});
								}else if (QRCodePrintType == 'customQRCodePrint_840') {
									var consignorName = responseOut.consignorName;
									if (consignorName.length > 12)
										consignorName = consignorName.substring(0, 16);
									if (consigneeName.length > 12)
										consigneeName = consigneeName.substring(0, 16);	
										
									dataObject.htmlTemplate = _.template('<table width="100%" style="margin-left:10px; border: solid 1px;"><tr><td style="border-bottom: solid 1px; border-right: solid 1px;border-left:solid 1px; padding: 0px 10px 0px 10px;">To</td><td style="word-wrap: break-word;word-break: break-all;border-bottom: solid 1px;border-right: solid 1px; padding: 0px 10px 0px 10px;"><span>' + dataObject.destinationTo + '</span><br><span>(' + dataObjectColl.desthandlingBranchName + ')</span></td></tr><tr style="border-bottom:solid 1px; "><td style="border-bottom: solid 1px; border-top: solid 0px;border-right: solid 1px; padding: 0px 10px 0px 10px;border-left:solid 1px;">Consignor</td><td style="border-bottom: solid 1px;border-top: solid 0px; padding: 0px 10px 0px 10px;border-right: solid 1px;">' + consignorName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;border-left:solid 1px;">Consignee</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;border-right: solid 1px;">' + consigneeName + '</td></tr><tr><td colspan="2" style="border-bottom: solid 0px; border-right: solid 1px; padding: 0px 10px 0px 10px;border-right: solid 1px;border-left:solid 1px;">Date : ' + dataObjectColl.bookingDate + ' ' + dataObjectColl.bookingTime + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;border-right: solid 1px;border-left:solid 1px;border-top:solid 1px;">' + dataObject.currentPackage + ' of ' + dataObject.numberOfPackages + '</td><td style="border-bottom: solid 0px; padding: 0px 10px 0px 10px;border-top:solid 1px;">LR.No:' + dataObject.waybillNumber + '</td></tr></table>')({ dataObject: dataObject });
										
									$('#popUpContentForQrCodeOption_840').bPopup({
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
											if ($('#printLR').prop('checked') == true && $('#printQR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_this.printQRCodeWithoutLimit(templateArray, 1000);

												_thisMod.close();
											} else if ($('#printLR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_thisMod.close();
											} else if ($('#printQR').prop('checked') == true) {
												_this.printQRCodeWithoutLimit(templateArray, 1000);

												_thisMod.close();
												window.close();
											} else {
												window.close();
											}
											_thisMod.close();
										});
										$('#confirm').on('keydown', function(e) {
											if (e.which == 27) {  //escape
												window.close();
											}
										});

									});
								}else if (QRCodePrintType == 'customQRCodePrint_799') {
									var consignorName = responseOut.consignorName;
									if (consignorName.length > 12)
										consignorName = consignorName.substring(0, 16);
									if (consigneeName.length > 12)
										consigneeName = consigneeName.substring(0, 16);	
										
									dataObject.htmlTemplate = _.template('<table cellpadding="0" cellspacing="0" style=" margin-left: 0px; margin-top: 0px; font-size: 30px;"><tr><td colspan="2" height="50px" style="border-top: 3px solid #333333; border-bottom: 3px solid #333333; border-left: 3px solid #333333; border-right: 3px solid #333333; padding: 0px 10px 0px 10px; font-size: 45px; width: 100%;text-align: center;">MS CARGO COURIER<br> SPEED PARCEL SERVICE</td></tr><tr><td style="border-bottom: 3px solid #333333; border-left: 3px solid #333333; border-right: 3px solid #333333; padding: 0px 10px 0px 10px;	width: 30%;"><span>From</span></td><td style="border-bottom: 3px solid #333333; border-right: 3px solid #333333; padding: 0px 10px 0px 10px; font-weight: bold; width:70%;word-wrap: break-word;word-break: normal;white-space: normal;"><span>' + responseOut.consignorName + '</span><br><span>' + responseOut.consignorAddress + '</span><br><span>' + responseOut.consignorPhn + '</span></td></tr><tr><td style="border-bottom: 3px solid #333333; border-left: 3px solid #333333; border-right: 3px solid #333333; padding: 0px 10px 0px 10px;	width: 30%;"><span>To</span></td><td style="border-bottom: 3px solid #333333; border-right: 3px solid #333333; padding: 0px 10px 0px 10px; font-weight: bold; width:70%;word-wrap: break-word;word-break: normal;white-space: normal;"><span>' + responseOut.consigneeName + '</span><br><span>' + responseOut.consigneeAddress + '</span><br><span>' + responseOut.consigneePhn + '</span></td></tr><tr><td colspan="2" style="border-bottom: 3px solid #333333; border-right: 3px solid #333333;border-left: 3px solid #333333; padding: 0px 10px 0px 10px; font-weight: bold; width:70%;"><span>Date :</span> <span style="text-transform: uppercase;">' + dataObjectColl.bookingDate + ' ' + dataObjectColl.bookingTime + '</span></td></tr><tr><td style="border-bottom: 3px solid #333333; border-left: 3px solid #333333; border-right: 3px solid #333333; padding: 0px 10px 0px 10px; width: 30%; "> LR Type : ' + responseOut.wayBillTypeName + '</td><td style="border-bottom: 3px solid #333333; border-right: 3px solid #333333; padding: 0px 10px 0px 10px; font-weight: bold; width:70%;">LR.NO : ' + dataObject.waybillNumber + '</td></tr><tr><td colspan="2" style="border-bottom: 3px solid #333333; border-right: 3px solid #333333;border-left: 3px solid #333333; padding: 0px 10px 0px 10px; font-weight: bold; width:70%;"><span>Article :</span> <span style="text-transform: uppercase;">' + dataObject.currentPackage + '(' + dataObject.currentPackingType +')' + '</span></td></tr></table>')({ dataObject: dataObject });
									$('#popUpContentForQrCodeOption_799').bPopup({
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
											if ($('#printLR').prop('checked') == true && $('#printQR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_this.printQRCodeWithoutLimit(templateArray, 1000);

												_thisMod.close();
											} else if ($('#printLR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_thisMod.close();
											} else if ($('#printQR').prop('checked') == true) {
												_this.printQRCodeWithoutLimit(templateArray, 1000);

												_thisMod.close();
												window.close();
											} else {
												window.close();
											}
											_thisMod.close();
										});
										$('#confirm').on('keydown', function(e) {
											if (e.which == 27) {  //escape
												window.close();
											}
										});

									});
								} else if (configuration.QRCodePrintType == 'customQRCodePrint_441') {
									var consignorName = responseOut.consignorName;
									if (consignorName.length > 12)
										consignorName = consignorName.substring(0, 30);
									if (consigneeName.length > 12)
										consigneeName = consigneeName.substring(0, 30);	
									dataObject.htmlTemplate = _.template('<table cellpadding="0" cellspacing="0" style=" margin-left: 0px; margin-top: 0px;	 font-size: 40px;"><tr><td style="border-top: 1px solid #333333;border-bottom: 1px solid #333333; border-left: 1px solid #333333; border-right: 1px solid #333333; padding: 0px 10px 0px 10px;	width: 35%;"><span>LR No</span></td><td style="border-top: 1px solid #333333;border-bottom: 1px solid #333333; border-right: 1px solid #333333; padding: 0px 10px 0px 10px; font-weight: bold; width:65%;">' + dataObject.waybillNumber + '</td></tr><tr><td style="border-bottom: 1px solid #333333; border-left: 1px solid #333333; border-right: 1px solid #333333; padding: 0px 10px 0px 10px;	width: 35%;">From</td><td style="border-bottom: 1px solid #333333; border-right: 1px solid #333333; padding: 0px 10px 0px 10px; width:65%;word-wrap: break-word;word-break: normal;white-space: normal;">' + responseOut.wayBillSourceBranchName + '</td></tr><tr><td style="border-bottom: 1px solid #333333; border-left: 1px solid #333333; border-right: 1px solid #333333; padding: 0px 10px 0px 10px;	 width: 35%;"><span>To</span></td><td style="border-bottom: 1px solid #333333; border-right: 1px solid #333333; padding: 0px 10px 0px 10px; font-weight: bold; width:65%;word-wrap: break-word;word-break: normal;white-space: normal;">' + responseOut.wayBillDestinationBranchName + '</td></tr><tr><td style="border-bottom: 1px solid #333333; border-left: 1px solid #333333; border-right: 1px solid #333333; padding: 0px 10px 0px 10px;	 width: 35%;">Qty </td><td style="border-bottom: 1px solid #333333; border-right: 1px solid #333333; padding: 0px 10px 0px 10px; width:65%;">' + dataObject.currentPackage + ' of ' + dataObject.numberOfPackages + '</td></tr><tr><td style="border-bottom: 1px solid #333333; border-left: 1px solid #333333; border-right: 1px solid #333333; padding: 0px 10px 0px 10px;  width: 35%;vertical-align: top;">Consignee </td><td style="border-bottom: 1px solid #333333; border-right: 1px solid #333333; padding: 0px 10px 0px 10px; width:65%;word-wrap: break-word;word-break: normal;white-space: normal;">' + consigneeName + '</td></tr></table>')({ dataObject: dataObject });
									
									$('#popUpContentForQrCodeOption_441').bPopup({
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
											if ($('#printLR').prop('checked') == true && $('#printQR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();

													//if (dataObject.numberOfPackages <= 50)
													_this.printQRCodeWithoutLimit(templateArray, 1000);

												_thisMod.close();
											} else if ($('#printLR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_thisMod.close();
											} else if ($('#printQR').prop('checked') == true) {
													//if (dataObject.numberOfPackages <= 50)
													_this.printQRCodeWithoutLimit(templateArray, 1000);  

												_thisMod.close();
												window.close();
											} else {
												window.close();
											}
											_thisMod.close();
										});
										$('#confirm').on('keydown', function(e) {
											if (e.which == 27) {  //escape
												window.close();
											}
										});

									});
								} else if (QRCodePrintType == 'customQRCodePrint_572') {
									if (consigneeName.length > 12)
										consigneeName = consigneeName.substring(0, 12);

									dataObject.htmlTemplate = _.template('<table style="border: solid 1px;verical-align: top;width:100%;"><tr><td style="width:100%"><table style="width:100%"><tr><td style="width:20%"><table style="width:100%"><tr><td style="border-bottom: solid 1px; border-right:solid 1px black;height:65px;"><img src="" width="160px" height="100%"></td></tr><tr><td style="border-bottom: solid 1px;border-right:solid 1px black;text-align:center;">DKT NO :</td></tr><tr><td	 style="border-bottom: solid 1px;border-right:solid 1px black;text-align:center;">FROM :</td></tr><tr><td style="border-right:solid 1px black;text-align:center;">TO :</td></tr></table></td><td style="width:80%;"><table style="width:100%;"><tr><td style="font:70px courier new;font-weight:bold; border-bottom:solid 1px black;padding: 0px 0px 0px 0px; text-transform: uppercase; ">' + accountGroupObj.accountGroupName + '</td></tr><tr><td style="border-bottom:solid 1px black;width:20%;padding-left:40px"><span>' + dataObject.waybillNumber + '</span></td></tr><tr><td style="border-bottom:solid 1px black;padding-left:40px;"><span>' + dataObject.sourceBranchCode + '</span> <span style="border-left:solid 1px;border-right:solid 1px;padding-left:50px;">NO PKG</span><span style="padding-left:60px">' + dataObject.numberOfPackages + '</span></td></tr><tr><td><span style="padding-left:40px">' + dataObject.DeliveryToAddress + '</span></td></tr></td></tr></table></td></tr></table></td></tr><tr><td style="width:100%;border-top:1px solid black;"><table style="width:100%"><tr><td style="word-break: normal;white-space: normal;font-size:30px;padding-left:45px;"><span>info@tcslogistics.in,www.tcslogistics.in</span></td></tr></table></td></tr></table>')({ dataObject: dataObject });

									$('#popUpContentForQrCodeOption_573').bPopup({
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
											if ($('#printLR').prop('checked') == true && $('#printQR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();

												if (dataObject.numberOfPackages <= 50)
													_this.printQRCodeOnLimt(templateArray, 10);

												_thisMod.close();
											} else if ($('#printLR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_thisMod.close();
											} else if ($('#printQR').prop('checked') == true) {
												if (dataObject.numberOfPackages <= 50)
													_this.printQRCodeOnLimt(templateArray, 10);

												_thisMod.close();
												window.close();
											} else {
												window.close();
											}
											_thisMod.close();
										});
										$('#confirm').on('keydown', function(e) {
											if (e.which == 27) {  //escape
												window.close();
											}
										});

									});
								} else if (QRCodePrintType == 'customQRCodePrint_252') {
									dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px; padding-top:30px; font-size:45px;"><tr><td colspan="2" style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;font-weight:bold; ">Dhariwal Transport</td></tr><tr><td style="border-bottom: solid 1px; border-top:none; border-right: solid 1px; padding: 0px 10px 0px 10px; font-size: 40px; padding-top:20px;">LR No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;padding-top:20px;">' + dataObject.waybillNumber + '</td></tr><tr><td style="border-bottom: solid 1px; border-top:none; border-right: solid 1px; padding: 0px 10px 0px 10px; padding-top:20px;">Mob No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;padding-top:20px;">' + accountGroupObj.branchContactDetailMobileNumber + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px; padding-top:20px;">To Branch:</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;padding-top:20px;">' + responseOut.wayBillDestinationBranchName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px; padding-top:20px;">Qty</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;padding-top:20px;">' + dataObject.currentPackage + ' of ' + dataObject.numberOfPackages + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px; padding-top:20px;">From</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;padding-top:20px;">' + dataObject.sourceFrom + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px; padding-top:20px;">Type</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px; padding-top:20px;">' + dataObject.lrType + '</td></tr></table>')({ dataObject: dataObject });
										
									$('#popUpContentForQrCodeOption_252').bPopup({

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
											if ($('#printLR').prop('checked') == true && $('#printQR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_this.printQRCodeOnLimt(templateArray, 27);
												_thisMod.close();
											} else if ($('#printLR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_thisMod.close();
											} else if ($('#printQR').prop('checked') == true) {
												_this.printQRCodeOnLimt(templateArray, 27);
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
								} else if (QRCodePrintType == 'customQRCodePrint_609') {
									if (consigneeName.length > 15)
										consigneeName = consigneeName.substring(0, 15);
										
									var consignorName = responseOut.consignorName;	
									if (consignorName.length > 15)
										consignorName = consignorName.substring(0, 15);	
										
									dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px; padding-top:; font-size:55px;"><tr><td style="border-bottom: solid 1px; border-top:none; border-right: solid 2px; padding: 0px 10px 0px 10px; font-size: 50px; padding-top:20px;">CONGR: </td><td style="border-bottom: solid 2px; padding: 0px 10px 0px 10px;padding-top:20px;font-size:45px;">' + consignorName + '</td></tr><tr><td style="border-bottom: solid 1px; border-top:none; border-right: solid 2px; padding: 0px 10px 0px 10px; padding-top:20px;">CONGE: </td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;padding-top:20px;font-size:45px">' + consigneeName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 2px; padding: 0px 10px 0px 10px; padding-top:20px;">LR NO:</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;padding-top:20px;">' + dataObject.waybillNumber + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 2px; padding: 0px 10px 0px 10px; padding-top:20px;">QTY: </td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;padding-top:20px;">' +dataObject.currentPackage + ' of ' + dataObject.numberOfPackages + '</td></tr><tr><td style="border-right: solid 2px; padding: 0px 10px 0px 10px; padding-top:20px;">DEST:</td><td style="padding: 0px 10px 0px 10px;padding-top:20px; word-wrap:break-word; word-break: break-all;white-space: normal;">' + responseOut.wayBillDestinationBranchName + '</td></tr></table>')({ dataObject: dataObject });
								
									$('#popUpContentForQrCodeOption_609').bPopup({

									}, function() {
										var _thisMod = this;
										if(responseOut.wayBillTypeId == WAYBILL_TYPE_PAID || responseOut.wayBillTypeId == WAYBILL_TYPE_CREDIT) {
										$(this).html("<div class='confirm' style='height:200px;width:250px; padding:5px'>"
											+ "<div style='font-size:18px; color:DodgerBlue;text-align:center;'><b>Print Option</b><div><br/>"
											+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' checked='checked' id='printLR'/>&nbsp;<b style='font-size:14px;'>Print LR</b><div><br/>"
											+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' checked='checked' id='printCharges'/>&nbsp;<b style='font-size:14px;'>Print Charges</b><div><br/>"
											+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' checked='checked' id='printQR'/>&nbsp;<b style='font-size:14px;'>Print QR</b><div><br/>"
											+ "<button id='cancelButton'>Cancel</button>"
											+ "<button autofocus id='confirm'>Print</button></center></div>")
										}else {
											$(this).html("<div class='confirm' style='height:150px;width:250px; padding:5px'>"
											+ "<div style='font-size:18px; color:DodgerBlue;text-align:center;'><b>Print Option</b><div><br/>"
											+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' checked='checked' id='printLR'/>&nbsp;<b style='font-size:14px;'>Print LR</b><div><br/>"
											+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' checked='checked' id='printQR'/>&nbsp;<b style='font-size:14px;'>Print QR</b><div><br/>"
											+ "<button id='cancelButton'>Cancel</button>"
											+ "<button autofocus id='confirm'>Print</button></center></div>")
										}
										
										$("#confirm").focus();
										$("#cancelButton").click(function() {
											window.close();
											_thisMod.close();
										})
										
										$('#confirm').click(function() {
											if(responseOut.wayBillTypeId == WAYBILL_TYPE_PAID || responseOut.wayBillTypeId == WAYBILL_TYPE_CREDIT){
											if ($('#printLR').prop('checked') == true && $('#printQR').prop('checked') == true && $('#printCharges').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												
												_this.printQRCodeWithoutLimit(templateArray, 1000);;
												
												_thisMod.close();
											}else if ($('#printLR').prop('checked') == true && $('#printQR').prop('checked') == true && $('#printCharges').prop('checked', false)) {
												$('.hideCharges').each(function() {
													$(this).text('0');
												});
												_this.printQRCodeWithoutLimit(templateArray, 1000);;
												_this.printAndCloseQRCodePrint();
											}
											else if ($('#printQR').prop('checked') == false && $('#printLR').prop('checked') == true && $('#printCharges').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
											} 
											else if ($('#printLR').prop('checked') == false && $('#printQR').prop('checked') == true && $('#printCharges').prop('checked') == false) {
												$('.hideCharges').each(function() {
													$(this).text('0');
												});
												_this.printQRCodeWithoutLimit(templateArray, 1000);;
											}
											else if ($('#printLR').prop('checked') == true && $('#printQR').prop('checked') == false && $('#printCharges').prop('checked') == false){
												$('.hideCharges').each(function() {
													$(this).text('0');
												});
												_this.printAndCloseQRCodePrint();
											}
											else if ($('#printLR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_thisMod.close();
											} else if ($('#printQR').prop('checked') == true) {
												
												_this.printQRCodeWithoutLimit(templateArray, 1000);;
												
												_thisMod.close();
												window.close();
											} else
												window.close();

											_thisMod.close();
										}else {
											if ($('#printLR').prop('checked') == true && $('#printQR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												
												_this.printQRCodeWithoutLimit(templateArray, 1000);;
												
												_thisMod.close();
											}else if ($('#printLR').prop('checked') == false && $('#printQR').prop('checked') == true) {
												_this.printQRCodeWithoutLimit(templateArray, 1000);;
												_this.printAndCloseQRCodePrint();
											}else if ($('#printLR').prop('checked') == true && $('#printQR').prop('checked') == false) {
												_this.printAndCloseQRCodePrint();
											}else if ($('#printLR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_thisMod.close();
											} else if ($('#printQR').prop('checked') == true) {
												_this.printQRCodeWithoutLimit(templateArray, 1000);;
												
												_thisMod.close();
												window.close();
											}else
												window.close();

											_thisMod.close();
										}
										});
										$('#confirm').on('keydown', function(e) {
											if (e.which == 27) {  //escape
												window.close();
											}
										});

									});
								}else if (QRCodePrintType == 'customQRCodePrint_299') {
									if (consigneeName.length > 12)
										consigneeName = (consigneeName.substring(0, 16) + '....');
									
									var consignorName = responseOut.consignorName;
									
									if (consignorName.length > 12)
										consignorName = (consignorName.substring(0, 16) + '....');
	
									dataObject.htmlTemplate = _.template('<table width="100%" style="margin-left:10px; border: solid 1px;"><tr><td style="border-bottom: solid 1px; border-right: solid 1px;border-left:solid 1px; padding: 0px 10px 0px 10px;">To</td><td style="word-wrap: break-word;word-break: break-all;border-bottom: solid 1px;border-right: solid 1px; padding: 0px 10px 0px 10px;"><span>' + responseOut.wayBillDestinationBranchName + '</span></td></tr><tr style="border-bottom:solid 1px; "><td style="border-bottom: solid 1px; border-top: solid 0px;border-right: solid 1px; padding: 0px 10px 0px 10px;border-left:solid 1px;">Consignor</td><td style="border-bottom: solid 1px;border-top: solid 0px; padding: 0px 10px 0px 10px;border-right: solid 1px;">' + consignorName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;border-left:solid 1px;">Consignee</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;border-right: solid 1px;">' + consigneeName + '</td></tr><tr><td colspan="2" style="border-bottom: solid 0px; border-right: solid 1px; padding: 0px 10px 0px 10px;border-right: solid 1px;border-left:solid 1px;">Date : ' + dataObjectColl.bookingDate + ' ' + dataObjectColl.bookingTime + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;border-right: solid 1px;border-left:solid 1px;border-top:solid 1px;">' + dataObject.currentPackage + ' of ' + dataObject.numberOfPackages + '</td><td style="border-bottom: solid 0px; padding: 0px 10px 0px 10px;border-top:solid 1px;">LR.No:' + dataObject.waybillNumber + '</td></tr></table>')({ dataObject: dataObject });
								
									$('#popUpContentForQrCodeOption_299').bPopup({
	
									}, function() {
										var _thisMod = this;
										if(responseOut.wayBillTypeId == WAYBILL_TYPE_CREDIT) {
										$(this).html("<div class='confirm' style='height:200px;width:250px; padding:5px'>"
											+ "<div style='font-size:18px; color:DodgerBlue;text-align:center;'><b>Print Option</b><div><br/>"
											+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' checked='checked' id='printLR'/>&nbsp;<b style='font-size:14px;'>Print LR</b><div><br/>"
											+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' id='printCharges'/>&nbsp;<b style='font-size:14px;'>Print Amount</b><div><br/>"
											+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox'  id='printQR'/>&nbsp;<b style='font-size:14px;'>Print QR</b><div><br/>"
											+ "<button id='cancelButton'>Cancel</button>"
											+ "<button autofocus id='confirm'>Print</button></center></div>")
										}else {
											$(this).html("<div class='confirm' style='height:200px;width:250px; padding:5px'>"
											+ "<div style='font-size:18px; color:DodgerBlue;text-align:center;'><b>Print Option</b><div><br/>"
											+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' checked='checked' id='printLR'/>&nbsp;<b style='font-size:14px;'>Print LR</b><div><br/>"
											+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' id='printQR'/>&nbsp;<b style='font-size:14px;'>Print QR</b><div><br/>"
											+ "<button id='cancelButton'>Cancel</button>"
											+ "<button autofocus id='confirm'>Print</button></center></div>")
										}
										
										$("#confirm").focus();
										$("#cancelButton").click(function() {
											window.close();
											_thisMod.close();
										})
										
										$('#confirm').click(function() {
											if(responseOut.wayBillTypeId == WAYBILL_TYPE_CREDIT){
											if ($('#printLR').prop('checked') == true && $('#printQR').prop('checked') == true && $('#printCharges').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_this.printQRCodeWithoutLimit(templateArray, 1000);;
												
												_thisMod.close();
											}else if ($('#printLR').prop('checked') == true && $('#printQR').prop('checked') == true && $('#printCharges').prop('checked', false)) {
												$('.hideCharges').each(function() {
													$(this).text(' ');
												});
												_this.printQRCodeWithoutLimit(templateArray, 1000);;
												_this.printAndCloseQRCodePrint();
											}
											else if ($('#printQR').prop('checked') == false && $('#printLR').prop('checked') == true && $('#printCharges').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
											} 
											else if ($('#printLR').prop('checked') == false && $('#printQR').prop('checked') == true && $('#printCharges').prop('checked') == false) {
												$('.hideCharges').each(function() {
													$(this).text(' ');
												});
												_this.printQRCodeWithoutLimit(templateArray, 1000);;
											}
											else if ($('#printLR').prop('checked') == true && $('#printQR').prop('checked') == false && $('#printCharges').prop('checked') == false){
												$('.hideCharges').each(function() {
													$(this).text(' ');
												});
												_this.printAndCloseQRCodePrint();
											}
											else if ($('#printLR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_thisMod.close();
											} else if ($('#printQR').prop('checked') == true) {
												
												_this.printQRCodeWithoutLimit(templateArray, 1000);;
												
												_thisMod.close();
												window.close();
											} else
												window.close();
	
											_thisMod.close();
										}else {
											if ($('#printLR').prop('checked') == true && $('#printQR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												
												_this.printQRCodeWithoutLimit(templateArray, 1000);;
												
												_thisMod.close();
											}else if ($('#printLR').prop('checked') == false && $('#printQR').prop('checked') == true) {
												_this.printQRCodeWithoutLimit(templateArray, 1000);;
												_this.printAndCloseQRCodePrint();
											}else if ($('#printLR').prop('checked') == true && $('#printQR').prop('checked') == false) {
												_this.printAndCloseQRCodePrint();
											}else if ($('#printLR').prop('checked') == true) {
												_this.printAndCloseQRCodePrint();
												_thisMod.close();
											} else if ($('#printQR').prop('checked') == true) {
												_this.printQRCodeWithoutLimit(templateArray, 1000);;
												
												_thisMod.close();
												window.close();
											}else
												window.close();
	
											_thisMod.close();
										}
										});
										$('#confirm').on('keydown', function(e) {
											if (e.which == 27) {  //escape
												window.close();
											}
										});
	
									});
								} else {
									console.log('kkkk')
									if (showInvoiceNumberInQRCodePrint || showInvoiceNumberInQRCodePrint == true) {
										if (totalArticleSize <= printQRCodeRange) {
											var srsBranchName = _this.getLimitedLengthofBranches(dataObjectColl.sourceFrom);
											var destBranchName = _this.getLimitedLengthofBranches(destinationBranchName);
											dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px;"><tr><td colspan="2" style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + accountGroupObj.accountGroupName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">LR No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.waybillNumber + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + destBranchName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Qty</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.currentPackage + ' of ' + dataObject.numberOfPackages + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">From</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + srsBranchName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Type</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.lrType + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Invoice</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + invoiceNumberData + '</td></tr><tr><td></td></table>')({ dataObject: dataObject });
											dataObject.qrCodeString = dataObject.waybillId + "~" + consignmentDetailsArr[i].consignmentId + "~" + QR_CODE_USING_CONSIGNMENT + "~" + j;
										}
									} else if (isPrintPrivateMarkaInQRCodePrint)
										dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px;"><tr><td colspan="2" style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + accountGroupObj.accountGroupName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">LR No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.waybillNumber + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.destinationTo + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Qty</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.currentPackage + ' of ' + dataObject.numberOfPackages + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">From</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.sourceFrom + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Type</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.lrType + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Pvt Mark</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObjectColl.privateMark + '</td></tr></table>')({ dataObject: dataObject });
									else{
										_this.printWindow();
										_thisMod.close();
										dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px;"><tr><td colspan="2" style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + accountGroupObj.accountGroupName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">LR No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.waybillNumber + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.destinationTo + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Qty</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.currentPackage + ' of ' + dataObject.numberOfPackages + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">From</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.sourceFrom + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Type</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.lrType + '</td></tr></table>')({ dataObject: dataObject });
									}
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
			}, printBillWindow: function() {
				window.resizeTo(0, 0);
				window.moveTo(0, 0);
				setTimeout(function() {
					window.print();
					window.close();
				}, 500);
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

			}, printQRCodeOnLinux: function(templateArray, breakSize) {
				if (templateArray) {
					if (templateArray.length > breakSize) {
						var largeTemplateArray = breakArrays(templateArray, breakSize);
						if (printQRCodeOnLimit)
							largeTemplateArray.length = 1;

						for (var p = 0; p < largeTemplateArray.length; p++) {
							if (isQRPrintOnPopUpSelection)
								this.printQRCodeOnLinux(largeTemplateArray[p]);
						}
					} else
						this.printQRCodeOnLinux(templateArray);
				}
			}, printQRCode: function(templateArray) {
				//genericfunction.js
				printQRCode(templateArray);
			}, printQRCodeOnLinux: function(templateArray) {
				//genericfunction.js
				printQRCodeOnLinux(templateArray);
			}, breakArrays: function(myArray, chunk_size) {
				var results = [];
				results.push(myArray.splice(0, chunk_size));
				return results;
			},printQRCodeWithoutLimit: async function(templateArray, breakSize) {
				
				if (printQRCodeOnLimit && templateArray.length > breakSize)
					templateArray = templateArray.slice(0, breakSize);
				
				if (templateArray) {
					if (isQRPrintOnPopUpSelection == "true" || isQRPrintOnPopUpSelection == true) {
						printAllQRCodeWithoutLimit(templateArray);
					}
				}
			}, getLimitedLengthofBranches(branchName) {
				var newbranchName = "";

				if (typeof branchName != 'undefined' && branchName != undefined && branchName.length > 0)
					newbranchName = branchName.substring(0, 10);

				return newbranchName;
			}, getVisibleRate: function(responseOut) {
				let visibleWeightRate = responseOut.visibleRate;
				let consignmentArr = responseOut.consignmentMap;
				let weightFreightRate = responseOut.weigthFreightRate;
				let chargeWeight = responseOut.chargedWeight;
				let visibleFreightAmount = 0;
				let bookingCharges		= responseOut.waybillBookingChargesList;
				let freightAmount		= 0;
				
				if(bookingCharges != undefined && bookingCharges.length > 0) {
					let newArray = bookingCharges.filter(obj => { return obj.chargeTypeMasterId == FREIGHT;});
					
					if(newArray.length > 0)
						freightAmount	= newArray[0].wayBillBookingChargeChargeAmount;
				}

				if (responseOut.chargeTypeId == CHARGETYPE_ID_QUANTITY) {
					for (var index in consignmentArr) {
						if (consignmentArr[index].visibleRate != undefined && consignmentArr[index].visibleRate != 0)
							visibleFreightAmount += consignmentArr[index].quantity * consignmentArr[index].visibleRate;
						else if (consignmentArr[index].amount != 0)
							visibleFreightAmount += consignmentArr[index].quantity * consignmentArr[index].amount;
					}
				} else if (responseOut.chargeTypeId == CHARGETYPE_ID_WEIGHT) {
					if (visibleWeightRate != undefined && visibleWeightRate != 0)
						visibleFreightAmount	= chargeWeight * visibleWeightRate;
					else if(freightAmount > 0)
						visibleFreightAmount	= freightAmount;
					else
						visibleFreightAmount	= chargeWeight * weightFreightRate;
				}

				return visibleFreightAmount;
			}, getqrcode: function(responseOut) {
			
				$('#qrDiv').show();
				$('#qrTable').show();
				$(document).ready(function() {
					var consignmentArr = responseOut.consignmentMap;
					var wayBillNumber = responseOut.wayBillNumber;
					var wayBillSourceBranchName = responseOut.wayBillSourceBranchName;
					var wayBillDestinationBranchName = responseOut.wayBillDestinationBranchName;
					var consigneeName = (responseOut.consigneeName).substring(0, 8);
					var consigneePhNum = responseOut.consigneePhn;
					var config = responseOut.configuration;
					var accountGroupObj = responseOut.PrintHeaderModel;
					var accountGroupName = accountGroupObj.accountGroupName;
					var wayBillTypeName = responseOut.wayBillTypeName;
					var bookingDate		=responseOut.bookingDateTimeString	;

					var packingTypeMasterName = responseOut.packingTypeMasterName

					var qrTable = $("#qrTable");

					var tablesContainer = $("<div style='display: grid; grid-template-columns: repeat(2, 1fr);justify-content: space-between;'>").css("clear", "both");

					var consignmentArr = responseOut.consignmentMap;

					for (var index in consignmentArr) {
						var consignment = consignmentArr[index];
						var length = consignmentArr[index].quantity;
						for (var i = 1; i <= length; i++) {

							var consignmentDetailsId = consignment.consignmentDetailsId;
							var saidToContain = consignment.saidToContain;


							var mainTable = $("<table style='margin:auto; margin-top:180px; font-size:17px; font-weight: bold;'>");
							var mainThead = $("<thead>");
							var mainHeaderRow = $("<tr>");

							if (length % 2 === 0) {
								mainTable.css("float", "left");
							} else {
								mainTable.css("float", "right");
							}


							var firstColumn = $("<th>").css("width", "30%");
							mainHeaderRow.append(firstColumn);

							var secondColumn = $("<th>").css("width", "70%");
							mainHeaderRow.append(secondColumn);

							mainThead.append(mainHeaderRow);
							mainTable.append(mainThead);

							var mainTbody = $("<tbody>");

							var mainRow = $("<tr>");

							var firstCell = $("<td>").css({
								"width": "30%",
								"vertical-align": "bottom",
								"padding": "10px"
							}).attr("id", "barcode" + consignmentDetailsId + i);

							mainRow.append(firstCell);

							var secondCell = $("<td>").css("width", "70%");

							var nestedTable = $("<table>");
							var nestedTbody = $("<tbody>");
							var nestedRow1 = $("<tr>");
							var name = $("<td>").css({
								"border": "1px solid black",
								"font-weight": "bold"
							}).attr("colspan", "2");
							name.append(accountGroupName)

							var nestedRow = $("<tr>");

							var nameCell = $("<td>").css("border", "1px solid black");
							nameCell.append("CN No").append("<br>")
								.append("Sender").append("<br>")
								.append("Item").append("<br>")
								.append("Receiver").append("<br>")
								.append("Mob No").append("<br>")
								.append("To").append("<br>")
								.append("Qty").append("<br>")
								.append("From");

							var valueCell = $("<td>").css("border", "1px solid black");
							valueCell.append(wayBillNumber).append("<br>")
								.append(wayBillTypeName).append("<br>")
								.append(saidToContain).append("<br>")
								.append(consigneeName).append("<br>")
								.append(consigneePhNum).append("<br>")
								.append(wayBillDestinationBranchName).append("<br>")
								.append(i + " of " + length+"\u00A0\u00A0\u00A0").append($("<span>").css("font-size", "12px").text("Dt: " + bookingDate)).append("<br>")
								.append(wayBillSourceBranchName);



							nestedRow1.append(name);
							nestedRow.append(nameCell);
							nestedRow.append(valueCell);

							nestedTbody.append(nestedRow1);
							nestedTbody.append(nestedRow);
							nestedTable.append(nestedTbody);


							secondCell.append(nestedTable);
							mainRow.append(secondCell);

							mainTbody.append(mainRow);
							mainTable.append(mainTbody);
							tablesContainer.append(mainTable);

							$("body").append(tablesContainer);
						}
					}

					qrTable.append(tablesContainer);

					for (var index in consignmentArr) {
						var consignment = consignmentArr[index];
						var length = consignmentArr[index].quantity;
						for (var i = 1; i <= length; i++) {
							var consignmentDetailsId = consignment.consignmentDetailsId;

							if ($("#barcode" + consignmentDetailsId + i).length) {
								var qrcode1 = new QRCode($("#barcode" + consignmentDetailsId + i)[0], {
									width: config.QrCodeHeight,
									height: config.QrCodeWidth

								});

								qrcode1.makeCode(responseOut.wayBillId + "~" + consignmentArr[index].consignmentDetailsId + "~" + QR_CODE_USING_CONSIGNMENT + "~" + i);
							}
						}
					}
				});

			}, formatDate: function(dateString) {

				const [day, month, year] = dateString.split('-');

				const months = [
					'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
					'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
				];

				const monthName = months[parseInt(month) - 1]; 

				return `${day} ${monthName} ${year}`;
			},  updateImagesByDivision : function (divisionId) {
			    if (!divisionId || divisionId == 0) return; // 0 ya blank ho to original image hi rahega
			    $('.companyLogo, .companyQRLogo').each(function () {
			        let $img = $(this);
			        let src = $img.attr('src');
			        if (!src) return;
			
			        let newSrc = src.replace(/(\d+)(\.(png|jpg|jpeg))$/i, `$1_${divisionId}$2`);
						console.log(newSrc,"newSrc")

			        $img.attr('src', newSrc);
			    });
			}

		};
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

function window_focus() {
	window.removeEventListener('focus', window_focus, false);
	// window.URL.revokeObjectURL(downloadLink.href);
	setTimeout(function() { window.close(); }, 600);
}

function setCookie(cookieName, cookieValue, expirationDays) {
	var d = new Date();
	d.setTime(d.getTime() + (expirationDays * 24 * 60 * 60 * 1000));
	var expires = "expires=" + d.toUTCString();
	document.cookie = cookieName + "=" + cookieValue + ";" + expires + ";path=/";
}

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

function replaceSlash(str,oldChar,replaceChar) {
	var charArray = str.split('');

	for (var i = 0; i < charArray.length; i++) {
		if (charArray[i] === oldChar) {
			charArray[i] = replaceChar;
		}
	}

	return charArray.join('');
}

