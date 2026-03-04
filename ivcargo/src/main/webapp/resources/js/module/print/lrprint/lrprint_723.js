var QR_CODE_USING_CONSIGNMENT		= 1;
  var QR_CODE_USING_WAYBILL_NUMBER	= 2;
  var zerosReg = /[1-9]/g;
  var isQRPrintOnPopUpSelection = false;
  var whitespace = /S/;
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
                      _this.setQRDetails(responseOut);
                      loadLanguageWithParams(FilePath.loadLanguage(responseOut.lrPrintType));
              })
           /*setTimeout(function() { window.print();window.close();}, 500);*/
          }, setHeaderData : function(responseOut){
                  var accountGroupObj = responseOut.PrintHeaderModel;
              
              if(responseOut.transporterNameId > 0 && responseOut.transporterName != undefined)
                  $("*[data-account='name']").html(responseOut.transporterName);
              else 	
                  $("*[data-account='name']").html(accountGroupObj.accountGroupName);
              
              $("*[data-account='branch']").html(accountGroupObj.branchName);
          
              if(responseOut.isAgentBranch) {
                  $("*[data-accountajtc='name']").html("<font face='Courier'>" +accountGroupObj.accountGroupName+ "</font>");
                  $("*[data-accountajtc='ownerName']").html(accountGroupObj.ownerAccountGroupName);
              } else {
                  $("*[data-accountajtc='name']").html("<font face='BremenFonts'>" + accountGroupObj.accountGroupName + "</font>");
                  $("*[data-accountajtc='ownerName']").html('&nbsp;');
              }
              
              $("*[data-account='GroupPhoneNo']").html(accountGroupObj.accountGroupPhoneNo);
              $("*[data-account='companyWebsite']").html(accountGroupObj.companyWebsite);
              $("*[data-account='address']").html(accountGroupObj.branchAddress + ". ");
              $("*[data-account='branchaddress']").html(accountGroupObj.branchAddress);
              $("*[data-account='number']").html(accountGroupObj.branchContactDetailPhoneNumber);
              $("*[data-account='cityName']").html(accountGroupObj.cityName);
              $("*[data-account='branchAddressPincode']").html(accountGroupObj.branchAddressPincode);
              
              if(accountGroupObj.branchContactDetailPhoneNumber != undefined && accountGroupObj.branchContactDetailPhoneNumber != null)
                  $("*[data-account='branchNumber']").html('('+accountGroupObj.branchContactDetailPhoneNumber+')');
              else
                  $("*[data-account='branchNumber']").html('');
              
              if(accountGroupObj.branchContactDetailEmailAddress != undefined && accountGroupObj.branchContactDetailEmailAddress != null)
                  $("*[data-account='emailId']").html(accountGroupObj.branchContactDetailEmailAddress);
              else
                  $("*[data-account='emailId']").html('--');
              
              if(accountGroupObj.branchContactDetailMobileNumber != undefined && accountGroupObj.branchContactDetailMobileNumber != null && accountGroupObj.branchContactDetailMobileNumber != '0000000000')
                  $("*[data-account='branchMobileNo']").html(accountGroupObj.branchContactDetailMobileNumber);
              else
                  $("*[data-account='branchMobileNo']").html('--');
                  
                  if(accountGroupObj.branchContactDetailPhoneNumber != undefined && accountGroupObj.branchContactDetailPhoneNumber != null && accountGroupObj.branchContactDetailPhoneNumber != '0000000000')
                  $("*[data-account='branchPhoneNo']").html(accountGroupObj.branchContactDetailPhoneNumber);
              else
                  $("*[data-account='branchPhoneNo']").html('--');
  
              if(accountGroupObj.branchContactDetailMobileNumber2 != undefined && accountGroupObj.branchContactDetailMobileNumber2 != null && accountGroupObj.branchContactDetailMobileNumber2 != '0000000000')
                  $("*[data-account='branchMobileNo2']").html(accountGroupObj.branchContactDetailMobileNumber2);
              else
                  $("*[data-account='branchMobileNo2']").html('--');
                  
          
              
              if(accountGroupObj.branchContactDetailMobileNumber != undefined && accountGroupObj.branchContactDetailMobileNumber != null && accountGroupObj.branchContactDetailMobileNumber2 != undefined && accountGroupObj.branchContactDetailMobileNumber2 != null)
                  $("*[data-account='branchMobileNoBoth']").html(accountGroupObj.branchContactDetailMobileNumber+'/'+accountGroupObj.branchContactDetailMobileNumber2);
              else if(accountGroupObj.branchContactDetailMobileNumber != undefined && accountGroupObj.branchContactDetailMobileNumber != null && (accountGroupObj.branchContactDetailMobileNumber2 == undefined || accountGroupObj.branchContactDetailMobileNumber2 == null))
                  $("*[data-account='branchMobileNoBoth']").html(accountGroupObj.branchContactDetailMobileNumber+'/--');
              else if((accountGroupObj.branchContactDetailMobileNumber == undefined || accountGroupObj.branchContactDetailMobileNumber == null) && accountGroupObj.branchContactDetailMobileNumber2 != undefined && accountGroupObj.branchContactDetailMobileNumber2 != null)
                  $("*[data-account='branchMobileNoBoth']").html('--/'+accountGroupObj.branchContactDetailMobileNumber2);
              else
                  $("*[data-account='branchMobileNoBoth']").html('--');
              
              var branchContactDetailPhoneNumber 	= accountGroupObj.branchContactDetailPhoneNumber;
              var branchContactDetailMobileNumber = accountGroupObj.branchContactDetailMobileNumber;
  
              $("*[data-account='phoneAndMobieNumber']").html(branchContactDetailPhoneNumber+','+branchContactDetailMobileNumber);
              
              if(branchContactDetailPhoneNumber != undefined && branchContactDetailPhoneNumber != null
                      && branchContactDetailMobileNumber != undefined && branchContactDetailMobileNumber != null) {
                  if(branchContactDetailPhoneNumber.includes(',')) {
                      if(branchContactDetailPhoneNumber == branchContactDetailMobileNumber)
                          $("*[data-account='phoneWithMobileNumber']").html(branchContactDetailPhoneNumber);
                      else
                          $("*[data-account='phoneWithMobileNumber']").html(branchContactDetailPhoneNumber + ', ' + branchContactDetailMobileNumber);
                  } else
                      $("*[data-account='phoneWithMobileNumber']").html(branchContactDetailPhoneNumber);
              } else if(branchContactDetailMobileNumber != undefined && branchContactDetailMobileNumber != null && (branchContactDetailPhoneNumber == undefined || branchContactDetailPhoneNumber == null))
                  $("*[data-account='phoneWithMobileNumber']").html(branchContactDetailMobileNumber);
              else if(branchContactDetailPhoneNumber != undefined && branchContactDetailPhoneNumber != null)
                  $("*[data-account='phoneWithMobileNumber']").html(branchContactDetailPhoneNumber);
  
              $("*[data-account='gstn']").html(accountGroupObj.branchGSTN);
              $("*[data-account='PanNumber']").html(accountGroupObj.branchPanNumber);
              
              var sourceSubRegionId	= responseOut.sourceSubRegionId;
              var destinationRegionId	= responseOut.destinationRegionId;
  
      
              if((sourceSubRegionId == 2880 || sourceSubRegionId == 4308) && destinationRegionId == 770)
                  $("*[data-account='gstn']").html('27AMZPP5557A1ZI');
              
              if(accountGroupObj.branchGSTN != undefined && accountGroupObj.branchGSTN != null )
                  $("*[data-account='gstnwithbrackets']").html('('+accountGroupObj.branchGSTN+')');
  
              if(sourceSubRegionId == 5557 )// MUMBAI Subregion - CCI group
                  $("*[data-selector='headerccigrp']").remove();
              else
                  $("*[data-selector='headerccibranch']").remove();
                  
              if(responseOut.wayBillDestinationBranchId != 18165)
                  $(".NoteForAiroli").hide();
              
              if(accountGroupObj.accountGroupId == ACCOUNT_GROUP_ID_DEMO) {
                  $(".companyLogo").attr("src", "/ivcargo/images/Logo/396.png");
                  $(".companyLogo").removeClass('hide');
              } else
                  setLogo(accountGroupObj.accountGroupId);
                  
          }, setConsignorname : function(responseOut) {
                  var config				= responseOut.configuration;
              var consigneeGSTN		= responseOut.consigneeGstn;
              var consignorGSTN 		= responseOut.consignorGstn;
              var consignorName		= responseOut.consignorName;
              var consigneeName		= responseOut.consigneeName;
              var consignorAddress	= responseOut.consignorAddress;
              var consigneeAddress	= responseOut.consigneeAddress;
              var consignorPan		= responseOut.consignorPan;
              var consigneePan		= responseOut.consigneePan;
              var billingPartyPan		= responseOut.billingPartyPan;
              var consigneeEmail		= responseOut.consigneeEmail;
              var consignorEmail		= responseOut.consignorEmail;
              var consigneePhoneNumber = responseOut.consigneePhoneNumber;
              consignorName			= consignorName.toUpperCase();
              consigneeName			= consigneeName.toUpperCase();
  
              
            if(responseOut.wayBillTypeId == WAYBILL_TYPE_PAID){
                  $("*[data-lr='billingPartyNameForInvoicePrint']").html(consignorName);
                  $("*[data-lr='billingPartyAddressForInvoicePrint']").html(consgneeAdd);
                  $("*[data-lr='billingPartyGstnForInvoicePrint']").html(consignorGSTN);
                  
                  if(consignorPan != undefined)
                  $("*[data-lr='billingPartyPanNumberForInvoicePrint']").html(consignorPan.toUpperCase());
                  
              }else if(responseOut.wayBillTypeId == WAYBILL_TYPE_TO_PAY){
                    $("*[data-lr='billingPartyNameForInvoicePrint']").html(consigneeName);
                  $("*[data-lr='billingPartyAddressForInvoicePrint']").html(consgneeAdd);
                  $("*[data-lr='billingPartyGstnForInvoicePrint']").html(consigneeGSTN);
                  
                  if(consigneePan != undefined)
                  $("*[data-lr='billingPartyPanNumberForInvoicePrint']").html(consigneePan.toUpperCase());
                  }
  
              if (config.consignorNameSubstringLength > 0 && consignorName.length > config.consignorNameSubstringLength) {
                  var consignorNameWithSub	= consignorName.substring(0, config.consignorNameSubstringLength);
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
              
              if(consignorAddress != undefined) {
                  var consgneeAdd	= consignorAddress;
                  
                  if(config.consignorAddressSubstringLength > 0)
                      consgneeAdd	= consignorAddress.substring(0, config.consignorAddressSubstringLength);
                      
                  $("*[data-consignor='consignorAddress']").html(consignorAddress);
                  $("*[data-consignee='consigneeAddress']").html(consigneeAddress);
                  
                      
                  $("*[data-consignor='address']").html(consgneeAdd);
                  $("*[data-consignor='addressLowerCase']").html(consgneeAdd.toLowerCase());
                  $("*[data-consignor='address1']").html(consgneeAdd + '..');
                  $("*[data-consignor='customconsignoraddress']").html(consgneeAdd + '..');
                  $("*[data-consignor='customconsignoraddress1']").html(consgneeAdd + '..');
                  $("*[data-consignor='consignorNameWithAddress']").html(consignorName + '--' + consgneeAdd + '..');
              } else
                  $("*[data-consignor='consignorNameWithAddress']").html(consignorName);
  
              if(zerosReg.test(responseOut.consignorPhn)) {
                  var customerDetailsphoneNumber	= responseOut.consignorPhn;
                  $("*[data-consignor='number']").html(customerDetailsphoneNumber);
                  $("*[data-consignor='numberhide']").html(customerDetailsphoneNumber.substr(0, 1) + "******" + customerDetailsphoneNumber.substr(7, 10));
                  $("*[data-consignor='numberhide1']").html(customerDetailsphoneNumber.substr(0, 2) + "******" + customerDetailsphoneNumber.substr(8, 10));
                  $("*[data-consignor='numberhide2']").html(customerDetailsphoneNumber.substr(0, 2) + "xxxxxxxx");
                  $("*[data-consignor='numberwithbracket']").html('('+customerDetailsphoneNumber+')');
              }
  
              $("*[data-consignor='consignorNumberSBTR']").html(responseOut.consignorPhn); 
  
              $("*[data-consignorMobileWithGST='number']").html(responseOut.consignorPhn);
              
              if(consignorGSTN != undefined && consignorGSTN != null && consignorGSTN !='') {
                  consignorGSTN	= consignorGSTN.toUpperCase();
                  $("*[data-consignor='gstn']").html(consignorGSTN);
                  $("*[data-consignor='gstnWithBracket']").html('(GSTIN -&nbsp;'+consignorGSTN+')');
                  $("*[data-consignor='gstnForBatco']").html(consignorGSTN);
                  $("*[data-consignor='gstnforPooja']").html(consignorGSTN);
  
                  if(whitespace.test(consignorGSTN)) 
                      $("*[data-consignorMobileWithGST='number']").html(responseOut.consignorPhn + '&nbsp;(GSTN -&nbsp;' + consignorGSTN + ')');
              } else {
                  $("*[data-consignor='gstnWithBracket']").html('');
                  $("*[data-consignor='gstnForBatco']").html('URD');
                  $('.hideconsignegstskl').hide();
                  $("*[data-consignor='gstnforPooja']").html('--');
              }
              
              $("*[data-consignor='tinNo']").html(responseOut.consignorTin);
              $("*[data-consignor='consignorPartyMasterAddress']").html(responseOut.consignorPartyMasterAddress);
              
              if(consignorPan != undefined)
                  $("*[data-consignor='panNumber']").html(consignorPan.toUpperCase());
                  
              if(billingPartyPan != undefined)
                  $("*[data-consignor='panNumber']").html(billingPartyPan.toUpperCase());
                  
              $("*[data-consignor='pincode']").html(responseOut.consignorPin);	
  
              if(config.consigneeNameSubstringLength > 0 && consigneeName.length > config.consigneeNameSubstringLength) {
                  var consigneeNameWithSub	= consigneeName.substring(0, config.consigneeNameSubstringLength);
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
              
              if(consigneeName == 'SELF')
                  $("*[data-consignee='consigneeName']").html(consigneeName + " / "+ responseOut.invoiceNumber);
              else
                  $("*[data-consignee='consigneeName']").html(consigneeName);
               
              if(consigneeAddress != undefined) {
                  var consgneeAdd	= consigneeAddress;
                  
                  if(config.consigneeAddressSubstringLength > 0)
                      consgneeAdd	= consigneeAddress.substring(0, config.consigneeAddressSubstringLength);
                  
                  $("*[data-consignee='address']").html(consgneeAdd);
                  $("*[data-consignee='addressLowerCase']").html(consgneeAdd.toLowerCase());
                  $("*[data-consignee='address1']").html(consgneeAdd + '..');
                  $("*[data-consignee='customconsigneeaddress']").html(consgneeAdd + '..');
                  $("*[data-consignee='customconsigneeaddress1']").html(consgneeAdd + '..');
                  $("*[data-consignee='consigneeNameWithAddress']").html(consigneeName + '--' + consgneeAdd + '..');
              } else
                  $("*[data-consignee='consigneeNameWithAddress']").html(consigneeName);
  
              if(zerosReg.test(responseOut.consigneePhn)) {
                  var customerDetailsphoneNumber	= responseOut.consigneePhn;
                  $("*[data-consignee='number']").html(customerDetailsphoneNumber);
                  $("*[data-consignee='numberwithbracket']").html('('+customerDetailsphoneNumber+')');
                  $("*[data-consignee='numberhide']").html(customerDetailsphoneNumber.substr(0, 1) + "******" + customerDetailsphoneNumber.substr(7, 10));
                  $("*[data-consignee='numberhide1']").html(customerDetailsphoneNumber.substr(0, 2) + "******" + customerDetailsphoneNumber.substr(8, 10));
                  $("*[data-consignee='numberhide2']").html(customerDetailsphoneNumber.substr(0, 2) + "xxxxxxxx");
                  $("*[data-consignee='numberwithbracket']").html('('+customerDetailsphoneNumber+')');
              }
  
              $("*[data-consignee='consigneeNumberSBTR']").html(responseOut.consigneePhn);
              
              $("*[data-consignee='tinNo']").html(responseOut.consigneeTin);
              $("*[data-consigneeMobileWithGST='number']").html(responseOut.consigneePhn);
              $("*[data-consignee='consigneePartyMasterAddress']").html(responseOut.consigneePartyMasterAddress);
              
              if(consigneePan != undefined)
                  $("*[data-consignee='panNumber']").html(consigneePan.toUpperCase());
              
              if(consigneeGSTN != undefined && consigneeGSTN != null && consigneeGSTN !='') {
                  consigneeGSTN		= consigneeGSTN.toUpperCase();
                  $("*[data-consignee='gstn']").html(consigneeGSTN);
                  $("*[data-consignee='gstnWithBracket']").html('(GSTIN -&nbsp;' + consigneeGSTN + ')');
                  $("*[data-consignee='gstnforBatco']").html(consigneeGSTN);
                  $("*[data-consignee='gstnforPooja']").html(consigneeGSTN);
  
                  if(whitespace.test(consigneeGSTN))
                      $("*[data-consigneeMobileWithGST='number']").html(responseOut.consigneePhn + '&nbsp;(GSTN -&nbsp;' + consigneeGSTN + ')');
              } else {
                  $("*[data-consignee='gstnWithBracket']").html('');
                  $("*[data-consignee='gstnforBatco']").html('URD');
                  $('.hideConsigneegstnsks').hide();
                  $("*[data-consignee='gstnforPooja']").html('--');
              }
  
              if (responseOut.deliveryTo == DELIVERY_TO_BRANCH_ID && responseOut.wayBillDestinationBranchAddress != undefined)
                  $("*[data-lr='lrDestinationAddressforgodown']").html(responseOut.wayBillDestinationBranchAddress.replace(/ /g, "&nbsp;")); // used for Alpesh Roadways
  
              if (responseOut.deliveryTo == DELIVERY_TO_DOOR_ID)
                  $("*[data-consignee='addressforddly']").html(consigneeAddress); //used for Alpesh Roadways
              
              if(config.isRateConfigCondition == 'true') {
                  if(responseOut.consignorRateConfigured)
                      $("*[data-consignor='name']").html($("*[data-consignor='name']").html() + " * ");
                      
                  if(responseOut.consigneeRateConfigured)
                      $("*[data-consignee='name']").html($("*[data-consignee='name']").html() + " * ");
              }
              
              if(consigneeEmail != undefined && consigneeEmail != null && consigneeEmail != '')
                  $("*[data-consignee='consigneemail']").html(consigneeEmail);
                  
              if(consignorEmail != undefined && consignorEmail != null && consignorEmail != '')
                  $("*[data-consignor='consignormail']").html(consignorEmail);
  
              if(consigneePhoneNumber != undefined)
                  $("*[data-consignee='consigneePhoneNumber']").html(consigneePhoneNumber);
                  
              $("*[data-consignee='pincode']").html(responseOut.consigneePin);
              
          }, setLrDetails : function(responseOut) {
              
              var config					= responseOut.configuration;
              var formTypeDetail			= responseOut.formTypeWithNumber;
              var imagObject				= localStorage.getItem("imageObjet");
              var doNotShowSourceSubreion			= responseOut.doNotShowSourceSubreion;
              var doNotShowDestinationSubreion	= responseOut.doNotShowDestinationSubreion;
              var wayBillSourceBranchName			= responseOut.wayBillSourceBranchName;
              var wayBillDestinationBranchName	= responseOut.wayBillDestinationBranchName;
              var wayBillSourceSubregionName		= responseOut.wayBillSourceSubregionName;
              var wayBillDestinationSubregionName	= responseOut.wayBillDestinationSubregionName;
              var wayBillSourceCityName			= responseOut.wayBillSourceCityName;
              var wayBillDestinationCityName		= responseOut.wayBillDestinationCityName;
              var wayBillDestinationBranchMobileNumber	= responseOut.wayBillDestinationBranchMobileNumber;
              var wayBillDestinationBranchMobileNumber2	= responseOut.wayBillDestinationBranchMobileNumber2;
              var wayBillSourceBranchPhoneNumber			= responseOut.wayBillSourceBranchPhoneNumber;
              var wayBillSourceBranchPhoneNumber2			= responseOut.wayBillSourceBranchPhoneNumber2;
              var wayBillSourceBranchMobileNumber			= responseOut.wayBillSourceBranchMobileNumber;
              var wayBillSourceBranchMobileNumber2		= responseOut.wayBillSourceBranchMobileNumber2;
              let wayBillDestinationPhoneNumber2          = responseOut.wayBillDestinationPhoneNumber2;
              var wayBillTypeId							= responseOut.wayBillTypeId;
              var wayBillRemark							= responseOut.wayBillRemark;
              var consignmentSummaryDeliveryToAddress		= responseOut.consignmentSummaryDeliveryToAddress;
              var deliveryToString						= responseOut.deliveryToString;
              var consignmentSummaryDeliveryToContact		= responseOut.consignmentSummaryDeliveryToContact;
              let wayBillDestinationBranchPhoneNumber		= responseOut.wayBillDestinationBranchPhoneNumber;
              var eWayBillDateTimeString                 	= responseOut.eWayBillDateTimeString;
               var bookingCharges      					= responseOut.waybillBookingChargesList;
              var consignmentSummaryDeliveryToAddressPinCode		= responseOut.consignmentSummaryDeliveryToAddressPinCode;
              var wayBillSourceSubregionCode				= responseOut.wayBillSourceSubregionCode;
              //START :: Advance and Balance Calculation for Abbas LR Print - Ravi Prajapati
              var bookingTotal		= responseOut.bookingTotal;
              var receivedAmount 		= responseOut.bookingReceived;
                  
  
              if(responseOut.photoTransactionPhoto != undefined) {
                  var photoTransactionPhoto 	= responseOut.photoTransactionPhoto;
           
                  $("#imageId").attr('src', photoTransactionPhoto);
                  $("#imageId1").attr('src', photoTransactionPhoto);
              } else if(imagObject != undefined) {
                  $("#imageId").attr('src', imagObject);
                  $("#imageId1").attr('src', imagObject);
              }
              
              if(wayBillTypeId == WAYBILL_TYPE_PAID)
                  $(".showDriverCopyForPaidLr").removeClass('hide');
                  
              if(responseOut.destinationBranchId == 14943) {//TEEN IMLI - RCC
                  $(".destBranch").show();//display Delivery after 10 AM
              }
      
              if(responseOut.lrDestinationBranchCode != undefined)
                  $("*[data-lr='lrDestinationBranchCode']").html(responseOut.lrDestinationBranchCode);
                      
              if(responseOut.lrDestinationBranchGstn != undefined)
                  $("*[data-lr='lrDestBranchGstn']").html(responseOut.lrDestinationBranchGstn);
              
              if(responseOut.sourceBranchEmailAddress != undefined)
                  $("*[data-lr='lrSourceBranchEmailAddress']").html(responseOut.sourceBranchEmailAddress);
          
              if(responseOut.sourceBranchCode != undefined)
                  $("*[data-lr='lrSourceBranchCode']").html(responseOut.sourceBranchCode);
      
              if(responseOut.sourceBranchPanNumber != undefined)
                  $("*[data-lr='lrSourceBranchPanNumber']").html(responseOut.sourceBranchPanNumber);
                      
              if(responseOut.sourceBranchGSTN != undefined) {
                  $("*[data-lr='lrSrcBranchGstn']").html(responseOut.sourceBranchGSTN);
              }
              
              if((config.allowRegionWiseBookingPage == 'true') && ((consigneeGSTN != undefined && consigneeGSTN != null && consigneeGSTN !='') 
                  || (consignorGSTN != undefined && consignorGSTN != null && consignorGSTN !='')))
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
              $("*[data-lr='sourcecityandbranch']").html(wayBillSourceCityName + '(' +wayBillSourceBranchName +')');
              $("*[data-lr='destinationcityandbranch']").html(wayBillDestinationCityName + '(' +wayBillDestinationBranchName +')');
              $("*[data-lr='distance']").html(responseOut.distance);
              
              if(responseOut['formTypesObj_' + CC_ATTACHED_FORM_ID] != undefined) {
                  $("*[data-lr='cctype']").html('CC Attached');
              }
              
              if(responseOut['formTypesObj_' + HSN_CODE] != undefined)
                  $("*[data-lr='hsnCode']").html(responseOut['formTypesObj_' + HSN_CODE]);
              
              if(responseOut['formTypesObj_' + SAC_CODE] != undefined)
                  $("*[data-lr='sacCode']").html(responseOut['formTypesObj_' + SAC_CODE]);
              
              if(responseOut['formTypesObj_' + E_WAYBILL_ID] != undefined) {
                  var formNumber		= responseOut['formTypesObj_' + E_WAYBILL_ID];
                  
                  $("*[data-lr='EWayBillNo']").html(formNumber);
                  
                  var formNumberRow_270 = replaceSlash(formNumber,',',', ')
                  
                  $("*[data-lr='EWayBillNo_270']").html(formNumberRow_270);

                       
                  var ewaybillArr = formNumber.split(',');
                          
                  if(ewaybillArr.length > 1)
                      $("*[data-lr='EWayBillNoMinified']").html(ewaybillArr[0] + '.. and More');
                  else
                      $("*[data-lr='EWayBillNoMinified']").html(formNumber);
                      
                  if(config.hideFormTypeLevelIfEWaybill == "true")
                      $('.formType').hide();
              }
              
              $("*[data-lr='chargeType']").html(responseOut.chargeTypeName);
              
              if(responseOut.termAndConditionValue)
                  $("*[data-lr='termAndCondition']").html(responseOut.termAndConditionValue);
              else
                  $("*[data-lr='termAndCondition']").html(config.termsAndConditions);
              
              
              if(config.ShowBankDetails)
                  $("*[data-lr='bankName']").html(config.ShowBankName);
                  $("*[data-lr='IFSCCode']").html(config.ShowIFSCCode);
                  $("*[data-lr='accountNumber']").html(config.ShowBankAccountNumber);
                  $("*[data-lr='bankAddress']").html(config.ShowBankAccountBranchAddress);
                  
              if(responseOut.chargeTypeId == CHARGETYPE_ID_QUANTITY) {
                  if(wayBillTypeId != WAYBILL_TYPE_CREDIT) {
                      $("*[data-lr='rate']").html(responseOut.articleRate + '/Art');
                      $("*[data-lr='rateConsignor']").html(responseOut.articleRate + '/Art');
                      $("*[data-lr='rateConsignee']").html(responseOut.articleRate + '/Art');
                  } else{
                      $("*[data-lr='rate']").html(responseOut.articleRate);
                      $("*[data-lr='rateConsignor']").html(responseOut.articleRate);
                      $("*[data-lr='rateConsignee']").html(responseOut.articleRate);
                  }
              } else if(responseOut.chargeTypeId == CHARGETYPE_ID_WEIGHT) {
                  if(wayBillTypeId != WAYBILL_TYPE_CREDIT) {
                      $("*[data-lr='rate']").html(responseOut.weigthFreightRate + '/Kg');
                      $("*[data-lr='rateConsignor']").html(responseOut.weigthFreightRate + '/Kg');
                      $("*[data-lr='rateConsignee']").html(responseOut.weigthFreightRate + '/Kg');
                  } else {
                      $("*[data-lr='rate']").html(responseOut.weigthFreightRate);
                      $("*[data-lr='rateConsignor']").html(responseOut.weigthFreightRate);
                      $("*[data-lr='rateConsignee']").html(responseOut.weigthFreightRate);
                  }
              }
              
              if(responseOut.billingBranch != undefined)
                  $("*[data-lr='billingBranch']").html('at '+responseOut.billingBranch);
  
              $("*[data-lr='bookingBranchName']").html(responseOut.bookingBranchName);
              $("*[data-lr='insuredBy']").html(responseOut.insuredBy);
              $("*[data-lr='pickupTypeName']").html(responseOut.pickupTypeName);
          
              if(config.showAdvanceAmountFromInvoicePaymentInLrPrint == "true" && wayBillTypeId == WAYBILL_TYPE_CREDIT) {
                  if(responseOut.advanceAmount > 0) {
                      $("*[data-lr='advanceAmount']").html(responseOut.advanceAmount);
                  } else {
                      $('.advanceAmountHide').hide();
                  }
              } else {
                  $('.advanceAmountHide').hide();
              }
  
              if(responseOut.riskAllocation == CARRIER_RISK) {
                  $("*[data-lr='riskAllocationOwnerRisk']").html("NO");
                  $("*[data-lr='riskAllocationCarrierRisk']").html("YES");
                  $("*[data-lr='risk']").html(CARRIER_RISK_NAME);
              } else if(responseOut.riskAllocation == OWNER_RISK) {
                  $("*[data-lr='riskAllocationOwnerRisk']").html("YES");
                  $("*[data-lr='riskAllocationCarrierRisk']").html("NO");
                  $("*[data-lr='risk']").html(OWNER_RISK_NAME);
              }
  
              $("*[data-lr='formNameWithNumber']").html(formTypeDetail);
              $("*[data-lr='number']").html(responseOut.wayBillNumber);
              $("*[data-lr='bookingTypeName']").html(responseOut.bookingTypeName);
              
              if(responseOut.bookingTypeName != "FTL")
                  $(".ftlbookingtype").hide();
  
              if(config.isCTFormConditionRequired == 'true' && responseOut.consignmentSummaryFormTypeId == CT_FORM_NOT_RECEIVED_ID)
                  $("*[data-lr='number']").html("***" + responseOut.wayBillNumber);
              
              $("*[data-lr='purchaseOrderNumber']").html(responseOut.purchaseOrderNumber)
              $("*[data-lr='date']").html(responseOut.bookingDateTimeString);
              $("*[data-lr='dateTime']").html(responseOut.bookingDateTimeString +"(" +responseOut.bookingTimeString +")");
              
              try {
                  $("*[data-lr='dateWithSlash']").html((responseOut.bookingDateTimeString).replaceAll("-", "/"));
              } catch(err) {
                  $("*[data-lr='dateWithSlash']").html(responseOut.bookingDateTimeString);
              }
              
              $("*[data-lr='time']").html(responseOut.bookingTimeString);
              $("*[data-lr='sealNumber']").html(responseOut.sealNumber);
              $("*[data-lr='conatainerNumber']").html(responseOut.conatainerNumber);
              
              var destBranchTypeOfLocation    = responseOut.destBranchTypeOfLocation;
              var branchTypeOfLocation		= responseOut.branchTypeOfLocation;
              var handlingBranchName			= responseOut.handlingBranchName;
              var desthandlingBranchName		= responseOut.desthandlingBranchName;
              var desthandlingBranchNumber	= responseOut.desthandlingBranchNumber;
                      destBranchMobileNo  = wayBillDestinationBranchMobileNumber;
                
                if(config.appendHandlingBranchWithSourceBranch == 'true' && responseOut.bookingTypeId == BOOKING_TYPE_FTL_ID) {
                  if(branchTypeOfLocation != undefined && branchTypeOfLocation == TYPE_OF_LOCATION_OPERATIONAL_PLACE && handlingBranchName != undefined)
                      $("*[data-lr='lrSource']").html(handlingBranchName + '-' + wayBillSourceBranchName);
                  else
                      $("*[data-lr='lrSource']").html(wayBillSourceBranchName);
              } else {
                  $("*[data-lr='lrSource']").html(wayBillSourceBranchName);
                  $("*[data-lr='lrSourceLoweCase']").html(wayBillSourceBranchName.toLowerCase());
              }
              
              $("*[data-lr='lrSourceDisplayName']").html(responseOut.srcBranchDisplayName);
              
              $("*[data-lr='deliveryToAddressPinCode']").html(consignmentSummaryDeliveryToAddressPinCode);
              
              if( destBranchTypeOfLocation != undefined && destBranchTypeOfLocation == TYPE_OF_LOCATION_OPERATIONAL_PLACE && handlingBranchName != undefined)
                  $("*[data-lr='deliveryToCustomBranchAddress6']").html(consignmentSummaryDeliveryToAddress + "," + desthandlingBranchNumber + "," + " (" + responseOut.wayBillDestinationBranchContactPerson + ") ");
              else
                  $("*[data-lr='deliveryToCustomBranchAddress6']").html(consignmentSummaryDeliveryToAddress + "," + destBranchMobileNo + ", " + wayBillDestinationBranchPhoneNumber +  ", " + wayBillDestinationPhoneNumber2 + " (" + responseOut.wayBillDestinationBranchContactPerson + ") ");
              
              if(desthandlingBranchName != undefined) {
                  if(desthandlingBranchNumber != undefined) {
                      $("*[data-lr='lrDestHandling']").html(desthandlingBranchName + '(' + desthandlingBranchNumber + ')');
                      $("*[data-lr='lrDestHandlingForPrabhat']").html(desthandlingBranchName + ' MOB:' + desthandlingBranchNumber);
                  } else
                      $("*[data-lr='lrDestHandling']").html(desthandlingBranchName);
              }
              
              if(destBranchTypeOfLocation != undefined && destBranchTypeOfLocation == TYPE_OF_LOCATION_OPERATIONAL_PLACE) {
                  $("*[data-lr='controllingBranch']").html(desthandlingBranchName);
                  
                  if(responseOut.deliveryTo == DELIVERY_TO_BRANCH_ID) {
                      $(".loacation").hide();
                      $(".controllingBranch").show();
                  } else if(responseOut.deliveryTo == DELIVERY_TO_DOOR_ID) {
                      $(".loacation").show();
                      $(".controllingBranch").show();
                  }
                  
                  $("*[data-lr='lrDestinationWithHandling']").html(wayBillDestinationBranchName+'( '+desthandlingBranchName+' )');
              } else
                  $("*[data-lr='lrDestinationWithHandling']").html(wayBillDestinationBranchName);
              
              if(branchTypeOfLocation != undefined && branchTypeOfLocation == TYPE_OF_LOCATION_OPERATIONAL_PLACE )
                  $("*[data-lr='controllingBranchNumber']").html(desthandlingBranchNumber);
                  
              if(destBranchTypeOfLocation != undefined && destBranchTypeOfLocation == TYPE_OF_LOCATION_OPERATIONAL_PLACE  && zerosReg.test(wayBillDestinationBranchMobileNumber)){
                  $("*[data-lr='branchMobile']").html(wayBillDestinationBranchMobileNumber);	
                  $("*[data-lr='branchNameHandling']").html( wayBillDestinationBranchName);
               } else {
                  $("*[data-lr='branchMobile']").html(desthandlingBranchNumber);
                  $("*[data-lr='branchNameHandling']").html(desthandlingBranchName);
              }
              
              if(destBranchTypeOfLocation != undefined && destBranchTypeOfLocation == TYPE_OF_LOCATION_OPERATIONAL_PLACE){
                  $("*[data-lr='handlingBranchMobNo']").html(desthandlingBranchNumber);	
                  $("*[data-lr='nameHandlingBranch']").html( desthandlingBranchName);
               } else {
                  $("*[data-lr='handlingBranchMobNo']").html(wayBillDestinationBranchMobileNumber);
                  $("*[data-lr='nameHandlingBranch']").html(wayBillDestinationBranchName);
              }
          
              $("*[data-lr='lrSourceAbrvnCode']").html(responseOut.srcBranchAbrvtinCode);
              $("*[data-lr='lrDestination']").html(wayBillDestinationBranchName);
              $("*[data-lr='lrDestinationLowerCase']").html(wayBillDestinationBranchName.toLowerCase());
              
  
              if (wayBillSourceBranchName.length > 20)
                      $("*[data-lr='lrSourceWithSubString']").html(wayBillSourceBranchName.substring(0, 20) + ' ');
                  else
                      $("*[data-lr='lrSourceWithSubString']").html(wayBillSourceBranchName);
              
              if(wayBillDestinationBranchName != undefined) {
                  if (wayBillDestinationBranchName.length > 20)
                      $("*[data-lr='lrDestinationWithSubString']").html(wayBillDestinationBranchName.substring(0,20) + ' ');
                  else
                      $("*[data-lr='lrDestinationWithSubString']").html(wayBillDestinationBranchName);
              }
              
              $("*[data-lr='lrDestinationAbrvnCode']").html(responseOut.destBranchAbrvtinCode);
              $("*[data-lr='lrSourceSubregion']").html(wayBillSourceSubregionName);
              $("*[data-lr='lrSourceSubregionCode']").html(wayBillSourceSubregionCode);
              $("*[data-lr='lrDestinationSubregion']").html(wayBillDestinationSubregionName);
              $("*[data-lr='lrSourceCity']").html(wayBillSourceCityName);
              $("*[data-lr='lrSourceCityLoweCase']").html(wayBillSourceCityName.toLowerCase());
              $("*[data-lr='lrSourceBranchWithCity']").html(wayBillSourceBranchName + '(' + wayBillSourceCityName + ')');
              $("*[data-lr='lrdestinationBranchWithCity']").html(wayBillDestinationBranchName + '(' + wayBillDestinationCityName + ')');
              $("*[data-lr='lrDestinationCity']").html(wayBillDestinationCityName);
              $("*[data-lr='lrDestinationCityLoweCase']").html(wayBillDestinationCityName.toLowerCase());
              $("*[data-lr='lrCityWithSource']").html(wayBillSourceCityName + ' ( ' + wayBillSourceBranchName + ' )');
              $("*[data-lr='lrCityWithDestination']").html(wayBillDestinationCityName + ' ( ' + wayBillDestinationBranchName + ' )');
              $("*[data-lr='lrSourceBranchNameWithSubregionForShivam']").html(wayBillSourceBranchName + ' ( ' + wayBillSourceSubregionName + ')');
              $("*[data-lr='lrDestinationBranchNameWithSubregionForShivam']").html(wayBillDestinationBranchName + ' ( ' + wayBillDestinationSubregionName + ')');
              $("*[data-lr='lrSourceBranchAddressAndPhoneNumberSC']").html(responseOut.wayBillSourceBranchAddress.replace(/ /g, "&nbsp;") + '<br>( Contact Number ' + wayBillSourceBranchMobileNumber + ')<br>(G.T.A)');
              $("*[data-lr='lrDestinationMobileNumberIND']").html(wayBillDestinationBranchMobileNumber2);
              
              if(doNotShowSourceSubreion)
                  $("*[data-lr='lrSubregionWithSource']").html(wayBillSourceBranchName);
              else
                  $("*[data-lr='lrSubregionWithSource']").html(wayBillSourceSubregionName + ' ( ' + wayBillSourceBranchName + ' )');
              
              if(doNotShowDestinationSubreion)
                  $("*[data-lr='lrSubregionWithDestination']").html(wayBillDestinationBranchName);
              else
                  $("*[data-lr='lrSubregionWithDestination']").html(wayBillDestinationSubregionName + ' ( ' + wayBillDestinationBranchName + ' )');
              
              if(responseOut.tdsAmount > 0)
                  $("*[data-lr='tdsAmount']").html(responseOut.tdsAmount);
              else
                  $(".tdsAmount").hide();
  
              if (responseOut.wayBillSourceBranchAddress != undefined) {
                  $("*[data-lr='lrSourceAddress']").html(responseOut.wayBillSourceBranchAddress.replace(/ /g, "&nbsp;"));
                  $("*[data-lr='lrSourceAddressSubString']").html(responseOut.wayBillSourceBranchAddress.substring(0,30));	
              }
  
              if (responseOut.wayBillDestinationBranchAddress != undefined) {
                  $("*[data-lr='lrDestinationAddress']").html(responseOut.wayBillDestinationBranchAddress.replace(/ /g, "&nbsp;"));
                  $("*[data-lr='lrDestinationAddressSubString']").html(responseOut.wayBillDestinationBranchAddress.substring(0,30));
              }
  
              if(responseOut.srcBranchServiceTaxCode != undefined)
                  $("*[data-lr='branchServiceTaxCode']").html(responseOut.srcBranchServiceTaxCode);
  
              if(wayBillDestinationBranchMobileNumber != undefined && wayBillDestinationBranchMobileNumber != '0000000000') {
                  $("*[data-lr='lrDestinationAddresswithPhoneNo']").html(wayBillDestinationBranchName + '(' + wayBillDestinationBranchMobileNumber + ')');
                  $("*[data-lr='lrDestinationAddresswithPhoneNoWithString']").html(responseOut.wayBillDestinationBranchAddress + '(Contact No.:' + wayBillDestinationBranchMobileNumber + ')');
                  $("*[data-lr='lrDestAddresswithPhoneNo']").html(responseOut.wayBillDestinationBranchAddress + '(' + wayBillDestinationBranchMobileNumber + ')');
                  $("*[data-lr='lrDestAddresswithPhoneNoPooja']").html(responseOut.wayBillDestinationBranchAddress.substring(0, 100) + '('+wayBillDestinationBranchMobileNumber + ')');
              } else {
                  $("*[data-lr='lrDestinationAddresswithPhoneNo']").html(wayBillDestinationBranchName);
                  $("*[data-lr='lrDestAddresswithPhoneNo']").html(responseOut.wayBillDestinationBranchAddress);
                  $("*[data-lr='lrDestinationAddresswithPhoneNoWithString']").html(responseOut.wayBillDestinationBranchAddress + '(Contact No.:' + wayBillDestinationBranchMobileNumber + ')');
              
                  if(responseOut.wayBillDestinationBranchAddress != undefined && responseOut.wayBillDestinationBranchAddress != null)
                      $("*[data-lr='lrDestAddresswithPhoneNoPooja']").html(responseOut.wayBillDestinationBranchAddress.substring(0, 100));
              }
              
              let deliveryAdddressWithPhoneNumbers	= responseOut.wayBillDestinationBranchAddress;
              
              if(wayBillDestinationBranchPhoneNumber != undefined && wayBillDestinationPhoneNumber2 != undefined)
                  deliveryAdddressWithPhoneNumbers 	= deliveryAdddressWithPhoneNumbers + '(' + wayBillDestinationBranchPhoneNumber + '-' + wayBillDestinationPhoneNumber2 + ')';
              else if(wayBillDestinationBranchPhoneNumber != undefined)
                  deliveryAdddressWithPhoneNumbers	= deliveryAdddressWithPhoneNumbers + '(' + wayBillDestinationBranchPhoneNumber + ')';
              else if(wayBillDestinationPhoneNumber2 != undefined)
                  deliveryAdddressWithPhoneNumbers	= deliveryAdddressWithPhoneNumbers + '(' + wayBillDestinationPhoneNumber2 + ')';
              
              $("*[data-lr='lrDestAddresswithPhoneNoForSharma']").html(deliveryAdddressWithPhoneNumbers);
  
              if(wayBillSourceBranchMobileNumber != undefined)
                  $("*[data-lr='lrSourceMobNo']").html(','+ wayBillSourceBranchMobileNumber + '');
              else
                  $("*[data-lr='lrSourceMobNo']").html("");
                    
              if(wayBillSourceBranchPhoneNumber != undefined)
                  $("*[data-lr='lrSourcePhoneNo']").html(wayBillSourceBranchPhoneNumber);
              else
                  $("*[data-lr='lrSourcePhoneNo']").html("");
              //start : Printing Branch Phone No and Mobile number With 0 Validation - Ravi Prajapati
  
              if (wayBillSourceBranchPhoneNumber != undefined) {
                  if(zerosReg.test(wayBillSourceBranchPhoneNumber)) {
                      $("*[data-lr='SourceNumber']").html('(' + wayBillSourceBranchPhoneNumber + ')')
                  } else if(wayBillSourceBranchMobileNumber != undefined && zerosReg.test(wayBillSourceBranchMobileNumber)) {
                      $("*[data-lr='SourceNumber']").html('(' + wayBillSourceBranchMobileNumber + ')');
                      $("*[data-lr='SourceNumber1']").html(wayBillSourceBranchMobileNumber);
                  }
              } else if(wayBillSourceBranchMobileNumber != undefined && zerosReg.test(wayBillSourceBranchMobileNumber))
                  $("*[data-lr='SourceNumber']").html('(' + wayBillSourceBranchMobileNumber + ')');
              
              if (wayBillSourceBranchMobileNumber != undefined) {
                  if(zerosReg.test(wayBillSourceBranchMobileNumber)) {
                      $("*[data-lr='SourceMobileAndPhoneNumber']").html('(' + wayBillSourceBranchMobileNumber + ')')
                  } else if(wayBillSourceBranchPhoneNumber != undefined && zerosReg.test(wayBillSourceBranchPhoneNumber)) {
                      $("*[data-lr='SourceMobileAndPhoneNumber']").html('(' + wayBillSourceBranchPhoneNumber + ')');
                  }
              } else if(wayBillSourceBranchPhoneNumber != undefined && zerosReg.test(wayBillSourceBranchPhoneNumber))
                  $("*[data-lr='SourceMobileAndPhoneNumber']").html('(' + wayBillSourceBranchPhoneNumber + ')');
              
              if (wayBillDestinationBranchMobileNumber2 != undefined) {
                  if(zerosReg.test(wayBillDestinationBranchMobileNumber2))
                      $("*[data-lr='DestinationMobileAndPhoneNumber']").html('(' + wayBillDestinationBranchMobileNumber2 + ')')
                  else if(wayBillDestinationPhoneNumber2 != undefined && zerosReg.test(wayBillDestinationPhoneNumber2))
                      $("*[data-lr='DestinationMobileAndPhoneNumber']").html('(' + wayBillDestinationPhoneNumber2 + ')');
              } else if(wayBillDestinationPhoneNumber2 != undefined && zerosReg.test(wayBillDestinationPhoneNumber2))
                  $("*[data-lr='DestinationMobileAndPhoneNumber']").html('(' + wayBillDestinationPhoneNumber2 + ')');
              
              if (wayBillDestinationBranchPhoneNumber && wayBillDestinationBranchPhoneNumber != undefined) {
                  if(config.changeDestinationBranchNameInPrint == 'true') {
                      if(responseOut.wayBillMappedDestinationBranchId > 0)
                          $("*[data-lr='MappedDestinationBranchPhoneNumber']").html('(' + responseOut.wayBillMappedDestinationBranchPhoneNumber + ')')
                      else if(zerosReg.test(wayBillDestinationBranchPhoneNumber))
                          $("*[data-lr='MappedDestinationBranchPhoneNumber']").html('(' + wayBillDestinationBranchPhoneNumber + ')')
                      else if(wayBillDestinationBranchMobileNumber != undefined && zerosReg.test(wayBillDestinationBranchMobileNumber))
                          $("*[data-lr='MappedDestinationBranchPhoneNumber']").html('(' + wayBillDestinationBranchMobileNumber + ')')
                  }
  
                  if(zerosReg.test(wayBillDestinationBranchPhoneNumber)){
                      $("*[data-lr='DestinationNumber']").html('('+wayBillDestinationBranchPhoneNumber+')')
                      $("*[data-lr='DestinationNumber1']").html(wayBillDestinationBranchPhoneNumber)
                  }else if(wayBillDestinationBranchMobileNumber != undefined && zerosReg.test(wayBillDestinationBranchMobileNumber))
                      $("*[data-lr='DestinationNumber']").html('('+wayBillDestinationBranchMobileNumber+')');
              }  else if(wayBillDestinationBranchMobileNumber != undefined && zerosReg.test(wayBillDestinationBranchMobileNumber)) {
                  $("*[data-lr='DestinationNumber']").html('('+wayBillDestinationBranchMobileNumber+')');
  
                  if(config.changeDestinationBranchNameInPrint == 'true') {
                      if(responseOut.wayBillMappedDestinationBranchId > 0)
                          $("*[data-lr='MappedDestinationBranchPhoneNumber']").html('( '+responseOut.wayBillMappedDestinationBranchPhoneNumber+')')
                      else
                          $("*[data-lr='MappedDestinationBranchPhoneNumber']").html('( '+wayBillDestinationBranchMobileNumber+')')
                  }
              }
              
              if(wayBillSourceBranchMobileNumber != undefined && wayBillSourceBranchMobileNumber != '0000000000')
                  $("*[data-lr='lrSourceAddresswithPhoneNo']").html(wayBillSourceBranchName + '(' + wayBillSourceBranchMobileNumber + ')');
              else
                  $("*[data-lr='lrSourceAddresswithPhoneNo']").html(wayBillSourceBranchName);
              //End
  
              if (wayBillSourceBranchPhoneNumber != undefined && wayBillSourceBranchPhoneNumber != null) {
                  if(zerosReg.test(wayBillSourceBranchPhoneNumber))
                      $("*[data-lr='lrSourceNumber']").html(wayBillSourceBranchPhoneNumber);
                  else
                      $("*[data-lr='lrSourceNumber']").html("--");
              }
  
              if (wayBillSourceBranchPhoneNumber2 != undefined && wayBillSourceBranchPhoneNumber2 != null && zerosReg.test(wayBillSourceBranchPhoneNumber2)) {
                  if(wayBillSourceBranchPhoneNumber != undefined)
                      $("*[data-lr='lrSourceNumber2']").html(", " + wayBillSourceBranchPhoneNumber2);
                  else
                      $("*[data-lr='lrSourceNumber2']").html(wayBillSourceBranchPhoneNumber2);
              }
  
              // phone number pattern is 0000-00000000/00000000 for Source branch	, Destination Branch
              var lrSourcePhoneNumber1	= "--";
              var lrSourcePhoneNumber2	= "--";
  
              if(wayBillSourceBranchPhoneNumber != undefined && wayBillSourceBranchPhoneNumber != null && zerosReg.test(wayBillSourceBranchPhoneNumber))
                  lrSourcePhoneNumber1	= wayBillSourceBranchPhoneNumber;
  
              if(wayBillSourceBranchPhoneNumber2 != undefined && wayBillSourceBranchPhoneNumber2 != null && zerosReg.test(wayBillSourceBranchPhoneNumber2)) {
                  if(lrSourcePhoneNumber1	== "--")
                      lrSourcePhoneNumber2	= wayBillSourceBranchPhoneNumber2;
                  else
                      lrSourcePhoneNumber2	= wayBillSourceBranchPhoneNumber2.split("-")[1];
              }
  
              if(lrSourcePhoneNumber1 == '--' && lrSourcePhoneNumber2 == '--')
                  $("*[data-lr='lrSourcePhoneNumber']").html("");
              else
                  $("*[data-lr='lrSourcePhoneNumber']").html(lrSourcePhoneNumber1 + " / " + lrSourcePhoneNumber2);
  
              // phone number pattern is 0000-00000000/00000000 for Destination branch
              var lrDestinationPhoneNumber1	= "--";
              var lrDestinationPhoneNumber2	= "--";
  
              if(wayBillDestinationBranchPhoneNumber != undefined && wayBillDestinationBranchPhoneNumber != null
                      && zerosReg.test(wayBillDestinationBranchPhoneNumber)) {
                  lrDestinationPhoneNumber1	= wayBillDestinationBranchPhoneNumber;
              }
  
              if(wayBillDestinationPhoneNumber2 != undefined && wayBillDestinationPhoneNumber2 != null && zerosReg.test(wayBillDestinationPhoneNumber2)) {
                  if(lrDestinationPhoneNumber1 == "--")
                      lrDestinationPhoneNumber2	= wayBillDestinationPhoneNumber2
                  else
                      lrDestinationPhoneNumber2	= wayBillDestinationPhoneNumber2.split("-")[1];
              }
  
              if(lrDestinationPhoneNumber1 == '--' && lrDestinationPhoneNumber2 == '--')
                  $("*[data-lr='lrDestinationPhoneNumber']").html("");
              else
                  $("*[data-lr='lrDestinationPhoneNumber']").html(lrDestinationPhoneNumber1 + " / " + lrDestinationPhoneNumber2);
  
              /*End*/
  
              if (wayBillSourceBranchPhoneNumber != undefined && wayBillSourceBranchMobileNumber != undefined) {
                  var replacedString =  (wayBillSourceBranchPhoneNumber).replace('-','');
                  
                  if(zerosReg.test(replacedString)) {
                      $("*[data-lr='lrSourceNumber']").html(wayBillSourceBranchPhoneNumber);
                      $("*[data-lr='lrSourceMobileNo']").html(wayBillSourceBranchMobileNumber);
                      $("*[data-lr='lrSourceMobileNumber']").html(","+wayBillSourceBranchMobileNumber);
                      $("*[data-lr='lrSourceMobileNumberwithbracket']").html('('+wayBillSourceBranchMobileNumber+')');
                      $("*[data-lr='lrSourceMobileNumber1']").html(" "+wayBillSourceBranchMobileNumber);
                  } else {
                      $("*[data-lr='lrSourceMobileNo']").html(wayBillSourceBranchMobileNumber);
                      $("*[data-lr='lrSourceMobileNumber']").html(wayBillSourceBranchMobileNumber);
                      $("*[data-lr='lrSourceMobileNumber1']").html(wayBillSourceBranchMobileNumber);
                      $("*[data-lr='lrSourceMobileNumberwithbracket']").html('('+wayBillSourceBranchMobileNumber+')');
                  }
              } else if(wayBillSourceBranchMobileNumber != undefined) {
                  $("*[data-lr='lrSourceMobileNo']").html(wayBillSourceBranchMobileNumber);
                  $("*[data-lr='lrSourceMobileNumber']").html(", "+wayBillSourceBranchMobileNumber);
                  $("*[data-lr='lrSourceMobileNumber1']").html(wayBillSourceBranchMobileNumber);
                  $("*[data-lr='lrSourceMobileNumberwithbracket']").html('('+wayBillSourceBranchMobileNumber+')');
              }
          
              if(wayBillSourceBranchMobileNumber != undefined && wayBillSourceBranchMobileNumber != '0000000000')
                  $("*[data-lr='lrSourceMobileNumberctc']").html(", "+wayBillSourceBranchMobileNumber);
              else if(wayBillSourceBranchPhoneNumber != undefined && wayBillSourceBranchPhoneNumber != '0000000000')
                  $("*[data-lr='lrSourcePhoneNumberctc']").html(", "+wayBillSourceBranchPhoneNumber);
              
              if(wayBillDestinationBranchMobileNumber != undefined && wayBillDestinationBranchMobileNumber != '0000000000')
                  $("*[data-lr='lrDestinationMobileNumberctc']").html(", "+wayBillDestinationBranchMobileNumber);
              else if(wayBillDestinationBranchPhoneNumber != undefined && wayBillDestinationBranchPhoneNumber != '0000000000')
                  $("*[data-lr='lrDestinationPhoneNumberctc']").html(", "+responseOut.wayBillDestinationBranchPhoneNumber);
              
              if(wayBillSourceBranchMobileNumber != undefined && wayBillSourceBranchMobileNumber2 != undefined){
                  var replacedString =  (wayBillSourceBranchMobileNumber2).replace('-','');
              
                  if(zerosReg.test(replacedString))
                      $("*[data-lr='lrSourceMobileNumber2']").html(", "+wayBillSourceBranchMobileNumber2);
              } else if (wayBillSourceBranchMobileNumber2 != undefined) {
                  var replacedString =  (wayBillSourceBranchMobileNumber2).replace('-','');
                  
                  if(zerosReg.test(replacedString))
                      $("*[data-lr='lrSourceMobileNumber2']").html(wayBillSourceBranchMobileNumber2);
              }
  
              if (wayBillDestinationBranchPhoneNumber != undefined) {
                  var replacedString = (wayBillDestinationBranchPhoneNumber).replace('-','');
  
                  if(zerosReg.test(replacedString))
                      $("*[data-lr='lrDestinationNumber']").html(wayBillDestinationBranchPhoneNumber);
              }
              
              if (wayBillDestinationPhoneNumber2 != undefined) {
                  var replacedString = wayBillDestinationPhoneNumber2.replace('-','');
  
                  if(zerosReg.test(replacedString)) {
                      if(wayBillDestinationBranchPhoneNumber != undefined && zerosReg.test(wayBillDestinationBranchPhoneNumber.replace('-','')))
                          $("*[data-lr='lrDestinationNumber2']").html(", " + wayBillDestinationPhoneNumber2);
                      else
                          $("*[data-lr='lrDestinationNumber2']").html(wayBillDestinationPhoneNumber2);
                  }
              }
  
              if (wayBillDestinationBranchPhoneNumber != undefined && wayBillDestinationBranchMobileNumber != undefined) {
                  var replacedString = wayBillDestinationBranchPhoneNumber.replace('-','');
  
                  if(zerosReg.test(replacedString)) {
                      $("*[data-lr='lrDestinationNumber']").html(wayBillDestinationBranchPhoneNumber);
                          
                      if(wayBillDestinationBranchMobileNumber != undefined) {
                          $("*[data-lr='lrDestinationMobileNumber']").html(", "+wayBillDestinationBranchMobileNumber);
                          $("*[data-lr='lrDestinationMobileNumberwithbracket']").html('('+wayBillDestinationBranchMobileNumber+')');
                      }
                  } else
                      $("*[data-lr='lrDestinationMobileNumber']").html(wayBillDestinationBranchMobileNumber);
              } else if(wayBillDestinationBranchMobileNumber != undefined)
                  $("*[data-lr='lrDestinationMobileNumber']").html(wayBillDestinationBranchMobileNumber);
              
              if (wayBillDestinationBranchMobileNumber2 != undefined) {
                  var replacedString =  (wayBillDestinationBranchMobileNumber2).replace('-','');
  
                  if(zerosReg.test(replacedString)) {
                      if(wayBillDestinationBranchMobileNumber != undefined)
                          $("*[data-lr='lrDestinationMobileNumber2']").html(", "+wayBillDestinationBranchMobileNumber2);
                      else
                          $("*[data-lr='lrDestinationMobileNumber2']").html(wayBillDestinationBranchMobileNumber2);
                  }
              }
              
              for(var i = 1; i <= 4; i++) {
                  if(document.getElementById("barcode" + i)) {
                      var qrcode1 = new QRCode(document.getElementById("barcode" + i), {
                          width : config.QrCodeHeight,
                          height : config.QrCodeWidth
                      });
  
                  //	if (config.accountGroupId == 580)
                      //	qrcode1.makeCode('https://bhorgroup.com/');
                      //else
                          qrcode1.makeCode(responseOut.wayBillId + "~" + responseOut.wayBillNumber + "~" + QR_CODE_USING_WAYBILL_NUMBER + "~" + 0);
                  }
              }
              
              if(responseOut.invoiceNumber != undefined && responseOut.invoiceNumber != 'NULL') {
                  $("*[data-lr='consignorInvoiceNo']").html(responseOut.invoiceNumber);
                  $("*[data-lr='consignorInvoiceNumber1']").html(responseOut.invoiceNumber.substring(0,30));
              }
              
              if(responseOut.consignmentSummaryInvDate != undefined && responseOut.consignmentSummaryInvDate != 'NULL')
                  $("*[data-lr='consignorInvoiceDate']").html(responseOut.consignmentSummaryInvDate);
  
              if(responseOut.declaredValue == null || responseOut.declaredValue == undefined) {
                  $("*[data-lr='decalredValue']").html(0);
              }
              $("*[data-lr='decalredValue']").html(responseOut.declaredValue);
              $("*[data-lr='privateMark']").html(responseOut.privateMark);
              $("*[data-lr='actualWeight']").html(responseOut.actualWeight);
              $("*[data-lr='crossingAgentName']").html(responseOut.crossingAgentName);
              $("*[data-lr='actualWeightforpooja']").html(responseOut.actualWeight+' /Kg');
          
              if(responseOut.declaredValue != undefined)
                  $("*[data-lr='decalredValueComma']").html((responseOut.declaredValue).toString().replace(/B(?=(d{3})+(?!d))/g,","));
              
              if(responseOut.bookedBy != undefined && responseOut.bookedBy != 'NULL')
                  $("*[data-lr='bookedBy']").html((responseOut.bookedBy).toUpperCase());
          
              if(responseOut.isValuationCharge == true)
                  $("*[data-lr='inclusiveDecalredValue']").html(responseOut.declaredValue);
              else
                  $("*[data-lr='inclusiveDecalredValue']").html(config.defaultDeclareValue);
          
              if(responseOut.declaredValue == 0)
                  $('.hideDeclaredValueSks').hide();
              
              if(responseOut.chargeTypeId == CHARGETYPE_ID_WEIGHT)
                  $(".actualweightsection").show();
              
              $("*[data-lr='actualWeightConsignor']").html(responseOut.actualWeight);
              $("*[data-lr='actualWeightConsignee']").html(responseOut.actualWeight);
              $("*[data-lr='chargedWeight']").html(responseOut.chargedWeight);
              $("*[data-lr='chargedWeightConsignor']").html(responseOut.chargedWeight);
              $("*[data-lr='chargedWeightConsignee']").html(responseOut.chargedWeight);
              $("*[data-lr='bookingServicetax']").html(responseOut.bookingTimeServiceTax);
              $("*[data-lr='bookingDiscount']").html(responseOut.bookingDiscount);
              $("*[data-lr='chargedWeightforPooja']").html(responseOut.chargedWeight+' /Kg');
              
              if(config.showCFTWeightOnPrint == 'true' && responseOut.cftWeight > 0)
                  $(".cftWeightPrintDiv").show();
              
              $("*[data-lr='cftWeight']").html(responseOut.cftWeight);
              $("*[data-lr='cftLength']").html(responseOut.cftLength);
              $("*[data-lr='cftBreadth']").html(responseOut.cftBreadth);
              $("*[data-lr='cftHeight']").html(responseOut.cftHeight);
  
              if(config.showChargeWtZero == 'true')
                     $("*[data-lr='chargedWeight']").html(responseOut.chargedWeight == 0 ? "FIX" : responseOut.chargedWeight);
  
              if(config.showActualAndChargedWeightInMerticTon == 'true') {
                  var	actualWeightInMetric = responseOut.actualWeight;
                  var	chargeWeightInMetric = responseOut.chargedWeight;
  
                  if(responseOut.bookingTypeId == DIRECT_DELIVERY_DIRECT_VASULI_ID) {
                      if(wayBillTypeId != WAYBILL_TYPE_CREDIT)
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
                  
              if(responseOut.isPodRequiredForGroup) {
                  if(config.IsPartyWisePODRequiredForDisplay == 'true')
                      $("*[data-lr='podRequired']").html((responseOut.consignorPodRequired || responseOut.consigneePodRequired) ? "YES" : "NO");
                  else if(responseOut.podRequiredName != undefined)
                      $("*[data-lr='podRequired']").html(responseOut.podRequiredName);
                  else
                      $("*[data-lr='podRequired']").html(responseOut.podRequired ? "YES" : "NO");
              }
  
              $("*[data-lr='roadPermitNumber']").html(responseOut.roadPermitNumber);
              $("*[data-lr='exciseInvoiceName']").html(responseOut.exciseInvoiceName);
              $("*[data-lr='consignmentInsuredName']").html(responseOut.consignmentInsuredName);
  
              if(responseOut.bookingTimeServiceTax > 0) {
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
  
              if(responseOut.bookingTimeUnAddedTaxAmount > 0)
                  $("*[data-lr='unaddedTaxAmount']").html('(' + responseOut.bookingTimeUnAddedTaxAmount + '/-)');
  
              //for SNGT Case - start
              if(responseOut.bookingTimeServiceTax > 0)
                  $(".servicetax").show();
  
              //end
              $("*[data-lr='chargeSum']").html(responseOut.bookingChargesSum);
              
              
              
              $("*[data-lr='allChargeAmount']").html( responseOut.bookingTotal - responseOut.chargeAmount);
              
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
                              $("*[data-lr='grandTotalWithComma']").html((Math.round(bookingCharges[index].wayBillBookingChargeChargeAmount)).toLocaleString("en-US"));
                              break;
                          }
                      }
                  } else {
                      $("*[data-lr='grandTotal']").html(Math.round(responseOut.bookingTotal));
                      $("*[data-lr='grandTotalWithComma']").html((Math.round(responseOut.bookingTotal)).toLocaleString("en-US"));
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
                  
              var totalCartage				= 0;
              
              let str = responseOut.wayBillTypeName;
              const commonString = "(MANUAL)";
              const extractedString = str.replace(commonString, "");
  
              $("*[data-lr='lrTypeWithoutManualWord']").html((extractedString).toUpperCase());
              $("*[data-lr='lrType']").html((responseOut.wayBillTypeName).toUpperCase());
              $("*[data-lr='grandTotalKRL']").html(Math.round(responseOut.bookingTotal));
              $("*[data-lr='totalCartageAmount']").html(totalCartage);	
              
              if(wayBillTypeId == WAYBILL_TYPE_PAID) {
                  $("*[data-lr='grandTotalForGGS']").html(Math.round(responseOut.bookingTotal - responseOut.tdsAmount));
                  $("*[data-lr='bookingReceived1']").html(bookingTotal);				
                  $("*[data-lr='paymentTypeKHTC']").html("("+responseOut.paymentTypeName+")");
  
                  if(responseOut.consignmentSummaryPaymentType == PAYMENT_TYPE_CREDIT_ID) {
                      $("*[data-lr='lrTypeOnPaymentType']").html ('Credit');
                      $("*[data-lr='lrType']").html ((responseOut.wayBillTypeName).toUpperCase() + '- A/C');
                      $("*[data-lr='lrTypeWithoutManualWord']").html((responseOut.wayBillTypeName).toUpperCase() + '- A/C');
                      
                      //START :: Advance and Balance Calculation for Abbas LR Print - Ravi Prajapati
                      if((bookingTotal - receivedAmount) == 0) {
                          $("*[data-lr='bookingReceived']").html('0');
                          $("*[data-lr='bookingBalance']").html('0');
                      } else {
                          $("*[data-lr='bookingReceived']").html(receivedAmount);
                          $("*[data-lr='bookingBalance']").html(bookingTotal - receivedAmount);
                      }
                  }
                      
                  //work for KSC For Show Freight Amount If Way dy Type is Paid
                  if(config.showFrieghtChargeInsteadOfGranndTotal == 'true') {
                      $( "#FrieghtValue" ).removeClass('hide');
                      $( "#grandTotal" ).addClass('hide');
                  }
                  
                  
                  $("*[data-lr='consignorFreightTotal']").html(Math.round(responseOut.bookingTotal));
                  $("*[data-lr='consigneeFreightTotal']").html("PAID");
                  $("*[data-lr='driverFreightTotal']").html("PAID");
                  
                  if(responseOut.consignmentSummaryPaymentType == PAYMENT_TYPE_CASH_ID)
                      $("*[data-lr='lrTypeOnPaymentType']").html(responseOut.wayBillTypeName);
                  else if (responseOut.consignmentSummaryPaymentType == PAYMENT_TYPE_CHEQUE_ID)
                      $("*[data-lr='lrTypeOnPaymentType']").html(responseOut.wayBillTypeName + ' (CHQ)');
                      
                  if(responseOut.chequeNumber != undefined && responseOut.chequeNumber != 'undefined') {
                      $("*[data-lr='chequeNumberOnlyForPaid']").html(responseOut.chequeNumber);
                      $("*[data-lr='chequeNumber']").html(responseOut.chequeNumber);
                      $('.chequeLabel').html("Cheque No:");
                      $('.chequeNumber').html(responseOut.chequeNumber);
                  }
              } else {
                  $("*[data-lr='lrTypeOnPaymentType']").html(responseOut.wayBillTypeName);
                  $("*[data-lr='bookingReceived']").html('0');
                  $("*[data-lr='bookingBalance']").html('0');
              }
  
              var paidCharge = 0;
              
              if(wayBillTypeId == WAYBILL_TYPE_TO_PAY) {
                  $("*[data-lr='grandTotalForGGS']").html(Math.round(responseOut.bookingTotal - responseOut.tdsAmount));
                  $("*[data-lr='lrDestinationBranch']").html('/' +wayBillDestinationBranchName);
                  
                  var bookingCharges 			= responseOut.waybillBookingChargesList
              
                  for(var index in bookingCharges) {
                      if(bookingCharges[index].chargeTypeMasterId == PAID_HAMALI)
                          paidCharge += bookingCharges[index].wayBillBookingChargeChargeAmount;
                  }
                  
                  $(".lrTypeTable").removeClass('hide');
                  
                  $("*[data-lr='consignorFreightTotal']").html(Math.round(responseOut.bookingTotal));
                  $("*[data-lr='consigneeFreightTotal']").html(Math.round(responseOut.bookingTotal));
                  $("*[data-lr='driverFreightTotal']").html(Math.round(responseOut.bookingTotal));
                  $(".chequenumberhide").hide();
              } else {
                  $( ".hamali").removeClass('hide');
                  $( ".paidHamali").addClass('hide');
              }
              
              $("*[data-lr='maheshCargoGrandTotal']").html(Math.round(responseOut.bookingTotal - paidCharge));
              $("*[data-lr='maheshCargoGrandTotalInWord']").html(convertNumberToWord(Math.round(responseOut.bookingTotal - paidCharge)));
              
              if(wayBillTypeId == WAYBILL_TYPE_CREDIT) {
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
              
              //for Bhaskar hide LR Rate
              if(config.hideLrRateWhenLrTypeIsTBB == 'true') {
                  if(wayBillTypeId == WAYBILL_TYPE_CREDIT)
                      $(".Rate").addClass('hide');
                  else
                      $(".Rate").html(responseOut.articleRate);
              } 
              
              if(responseOut.transportationModeName != "null" && responseOut.transportationModeName != null && responseOut.transportationModeName != undefined)
                  $("*[data-lr='transportationModeName']").html(responseOut.transportationModeName);
  
              var isRePrint = responseOut.isReprint;
              
          
              if(isRePrint || isRePrint == "true"){
                  
                  $("*[data-lr='lrTypeWithDuplicateKeyword']").html("( Duplicate )");
                  $("*[data-lr='lrTypeWithDuplicateAndOrignalKeyword']").html("( Duplicate )");
              }else{
                  $("*[data-lr='lrTypeWithDuplicateKeyword']").html(" ");
                  $("*[data-lr='lrTypeWithDuplicateAndOrignalKeyword']").html("( Original )");
              }	
              
              if(!whitespace.test(wayBillRemark) || wayBillRemark == '')
                  $('.remarksection').hide();
              
              if(wayBillRemark != undefined && wayBillRemark != '') {
                  $("*[data-lr='remark']").html(wayBillRemark);
                  $("*[data-lr='remarkSubString']").html(wayBillRemark.substring(0,20));
              }
              
              $("*[data-lr='otherRemark']").html(responseOut.wayBillOtherRemark);
              
              if(deliveryToString == "select")
                $("*[data-lr='deliveryTo']").html("");
              else  
                $("*[data-lr='deliveryTo']").html(deliveryToString);
              
              if(responseOut.deliveryTo == DELIVERY_TO_DOOR_ID) {
                  $("*[data-lr='deliveryToDoorDelivery']").html('Door Delivery');
                  $("*[data-lr='delDoor']").html('at Ground Floor-Unload By Party');
                  $("*[data-lr='deliveryToCustom']").html('Door Delivery');
                  $("*[data-lr='deliveryToCustomMsg']").html('If LR booked for Door Delivery then Door delivery service will be provided for Ground floor only');
                  
                  //for printing godown address if delivery at GODOWN and bold letters for others -Ashish Maurya
                  $("*[data-lr='deliveryToDoorDeliverybold']").html('<b>DOOR DELIVERY</b>');
                  $("*[data-lr='deliveryToDoorLabel']").html('<b>-DOOR</b>'); // used for LMT
              }else if(responseOut.deliveryTo == DELIVERY_TO_BRANCH_ID && responseOut.sourceSubRegionId == 3840){
                  $("*[data-lr='deliveryToDoorDelivery']").html('Transport Godown');
              }  else {
                  $("*[data-lr='deliveryToDoorDelivery']").html(deliveryToString);
              }
              //end
              
              if(responseOut.deliveryTo == DELIVERY_TO_DOOR_ID) {
                 $("*[data-lr='delivery_at']").html('Door Delivery');
                 $("*[data-lr='delivery_address']").html('Door Delivery');
                  $("*[data-lr='delivery_addressmlt']").html('DOOR DELIVERY');
              } else if(responseOut.deliveryTo == DELIVERY_TO_BRANCH_ID) {
                 $("*[data-lr='delivery_at']").html('Office Delivery');
                 $("*[data-lr='delivery_address']").html('Godown Delivery');
                     $("*[data-lr='delivery_addressmlt']").html('GODOWN DELIVERY');
              }
              
              if(responseOut.deliveryTo == DELIVERY_TO_TRUCK_DELIVERY_ID)
                  $("*[data-lr='deliveryToDoorDeliverytruck']").html('<b>TRUCK DELIVERY</b>');
  
              //end
              if(consignmentSummaryDeliveryToAddress == undefined || typeof consignmentSummaryDeliveryToAddress == 'undefined')
                  consignmentSummaryDeliveryToAddress = "--";
              
              $(".showAddress").hide();
              
              if(responseOut.deliveryTo == DELIVERY_TO_BRANCH_ID) {
                  $("*[data-lr='deliveryToGod']").html('Godown');
                  $("*[data-lr='deliveryToGodown']").html(consignmentSummaryDeliveryToAddress);
                  $("*[data-lr='deliveryToBranchAddress']").html(consignmentSummaryDeliveryToAddress);
                  $("*[data-lr='deliveryToCustom']").html('Godown Delivery');
                  $(".address").removeClass("hide");
                  $(".showAddress").show();
                  var destBranchContactNo = "--";
                  var destBranchMobileNo = "--";
                  wayBillDestinationBranchPhoneNumber	= "--";
                  
                  if(typeof responseOut.wayBillDestinationBranchPhoneNumber != 'undefined')
                      wayBillDestinationBranchPhoneNumber	= responseOut.wayBillDestinationBranchPhoneNumber;
                  
                  if(consignmentSummaryDeliveryToContact != undefined) {
                      var replacedString =  consignmentSummaryDeliveryToContact.replace('-','');
                      
                      if(zerosReg.test(replacedString))
                          $("*[data-lr='deliveryToBranchAddresswithphone']").html(consignmentSummaryDeliveryToAddress+ ' ('+consignmentSummaryDeliveryToContact+')');
                      else
                          $("*[data-lr='deliveryToBranchAddresswithphone']").html(consignmentSummaryDeliveryToAddress);
  
                      $("*[data-lr='deliveryToBranchAddresswithphoneAndMobileBoth']").html(consignmentSummaryDeliveryToAddress+ ''+consignmentSummaryDeliveryToContact+''+','+wayBillDestinationBranchPhoneNumber);
                      $("*[data-lr='deliveryToBranchAddresswithphoneAndMobile']").html(consignmentSummaryDeliveryToAddress+ ' ('+consignmentSummaryDeliveryToContact+')'+','+wayBillDestinationBranchPhoneNumber);
                      $("*[data-lr='deliveryToBranchPhoneAndMobileBoth']").html(wayBillDestinationBranchPhoneNumber + ',' + consignmentSummaryDeliveryToContact);
                      $("*[data-lr='deliverymobileNo']").html(wayBillDestinationBranchMobileNumber);
                      destBranchContactNo = consignmentSummaryDeliveryToContact;
                      destBranchMobileNo  = wayBillDestinationBranchMobileNumber;
                      
                      
                      if(zerosReg.test(consignmentSummaryDeliveryToContact))
                          $("*[data-lr='deliveryToContact']").html(consignmentSummaryDeliveryToContact);
                      else
                          $("*[data-lr='deliveryToContact']").html("-");
                  }
              
                  $("*[data-lr='deliveryToCustomBranchAddress']").html(consignmentSummaryDeliveryToAddress);
                  $("*[data-lr='deliveryToCustomBranchAddress2']").html(consignmentSummaryDeliveryToAddress + "," + destBranchMobileNo + ", " + destBranchContactNo + " (" + responseOut.wayBillDestinationBranchContactPerson + ") ");
                  $("*[data-lr='deliveryToCustomBranchAddress4']").html(consignmentSummaryDeliveryToAddress + "," + destBranchMobileNo + ", " + wayBillDestinationBranchPhoneNumber + " (" + responseOut.wayBillDestinationBranchContactPerson + ") ");
                  $("*[data-lr='deliveryToCustomBranchAddress3']").html(consignmentSummaryDeliveryToAddress + "," + wayBillDestinationBranchPhoneNumber + " (" + responseOut.wayBillDestinationBranchContactPerson + ") ");
                  $("*[data-lr='deliveryToCustomBranchAddress5']").html(consignmentSummaryDeliveryToAddress + "," + destBranchMobileNo + " (" + responseOut.wayBillDestinationBranchContactPerson + ") ");
                  $("*[data-lr='deliveryToCustomBranchAddress7']").html(consignmentSummaryDeliveryToAddress + "," + destBranchMobileNo + ", " + wayBillDestinationBranchPhoneNumber +"");
  
              } else if(responseOut.deliveryTo == DELIVERY_TO_DOOR_ID || responseOut.deliveryTo == DELIVERY_TO_TRUCK_DELIVERY_ID) {
                  $("*[data-lr='deliveryToCustomBranchAddress']").html(DELIVERY_TO_DOOR_NAME);
                  $("*[data-lr='deliveryToCustomBranchAddress2']").html('Door Delivery');
                  $("*[data-lr='deliveryToCustomBranchAddress3']").html('Door Delivery');
                  $("*[data-lr='deliveryToCustomBranchAddress4']").html('Door Delivery');
                  $("*[data-lr='deliveryToCustomBranchAddress5']").html('Door Delivery');
              } else {
                  $(".conditionalDelToAddr").hide();
              }
              
              if(config.isSetDeliveryToWithBranchName == 'true') {
                  if(responseOut.deliveryTo == DELIVERY_TO_BRANCH_ID && wayBillDestinationBranchName != undefined)
                      $("*[data-lr='deliveryToGodownWithBranch']").html(wayBillDestinationBranchName.toUpperCase() + " - " + deliveryToString);
                  else if(responseOut.deliveryTo == DELIVERY_TO_DOOR_ID)
                      $("*[data-lr='deliveryToGodownWithBranch']").html("Door Delivery");
                  else
                      $("*[data-lr='deliveryToGodownWithBranch']").html(deliveryToString);
              }
              
              
              
              $("*[data-lr='deliveryToAddress']").html(consignmentSummaryDeliveryToAddress);
              $("*[data-lr='totalQuantity']").html(responseOut.consignmentSummaryQuantity);
              $("*[data-lr='vehicleNumber']").html(responseOut.vehicleNumber != undefined ? responseOut.vehicleNumber : "--");
              $("*[data-lr='vehicleNumberFTL']").html(responseOut.vehicleNumber != "" ? " ("+responseOut.vehicleNumber + ")" : "( -- )");
              
              if(responseOut.vehicleNumber != "") {
                  $('.vehicleNoForFTL').show();
                  $('.vehicleNoForOther').hide();
              } else {
                  $('.vehicleNoForOther').show();
                  $('.vehicleNoForFTL').hide();
              }
  
              if(responseOut.bookingTypeId == BOOKING_TYPE_FTL_ID)
                  $("*[data-lr='vehicleNumberOnFtl']").html(responseOut.vehicleNumber != undefined ? responseOut.vehicleNumber : "--");
              
              if(config.showVehicleTypeName == 'true' && responseOut.bookingTypeId == BOOKING_TYPE_FTL_ID) {
                  if(responseOut.vehicleTypeName  != undefined) {
                      $("*[data-lr='vehicleType']").html(responseOut.vehicleTypeName);
                      $("*[data-lr='chargedWeight']").html(responseOut.vehicleTypeName);
                  } else
                      $("*[data-lr='vehicleType']").html("--");
              }else
                  $("*[data-lr='vehicleType']").html("--");
              
  
              var billSelectionId			= responseOut.billSelectionId;
  
              if(billSelectionId == BOOKING_WITHOUT_BILL) {
                  $("*[data-selector='forCompanyName']").remove();
                  $("*[data-selector='gstn']").remove();
                  $("*[data-account='gstn']").remove();
              }
  
              $("*[data-charLimit]").html(_this.charLimit());
  
              $("*[data-lr='bookedByExecutive']").html(responseOut.wayBillBookedBy);
              $("*[data-executive='name']").html(responseOut.executiveName);
  
  
              
              if($("*[data-lr='totalQuantityInWord']").length != 0)
                  $("*[data-lr='totalQuantityInWord']").html(convertNumberToWord(responseOut.consignmentSummaryQuantity));
  
              if (responseOut.freightUptoBranch == "--")
                  $("*[data-selector='lrFreightUpto']").remove();
              else
                  $("*[data-lr='lrFreightUpto']").html(responseOut.freightUptoBranch);
  
              if(config.removeRemarkLabel  == "true" && wayBillRemark == '') {
                  $("*[data-selector='remark']").remove();
                  $("*[data-lr='remark']").remove();
              }
  
              if(config.removeInvoiceLable  == "true" && responseOut.invoiceNumber == '') {
                  $("*[data-selector='invoiceNo']").remove();
                  $("*[data-lr='consignorInvoiceNo']").remove();
              }
  
              if(config.removeServiceTaxLable == "true" && responseOut.consignmentSummaryTaxByString == "--") {
                  $("*[data-selector='serviceBy']").remove();
                  $("*[data-lr='taxPaidBy']").remove();
  
                  if(Number(responseOut.bookingTimeServiceTax) == 0) {
                      $("*[data-selector='rupee']").remove();
                      $("*[data-lr='bookingServicetax1']").remove();
                      $("*[data-lr='bookingServicetaxForCspl']").remove();
                  }
              }
  
              if(Number(responseOut.bookingTimeServiceTax) == 0)
                  $(".servicetaxlabel").remove();
  
              if(responseOut.freightUptoBranchMobileNo != undefined)
                  $("*[data-lr='frghtUptoBranchContactDetail']").html(responseOut.freightUptoBranchMobileNo);
  
              if($("*[data-lr='grandTotalInWord']").length != 0) {
                  if(config.showDecimalValueForGrandTotal	== true || config.showDecimalValueForGrandTotal	== 'true')
                      $("*[data-lr='grandTotalInWord']").html(convertNumberToWord(responseOut.bookingTotal));
                  else
                      $("*[data-lr='grandTotalInWord']").html(convertNumberToWord(Math.round(responseOut.bookingTotal)));
              }
              
              if(responseOut.consignmentSummaryPaymentType > 0)
                  $("*[data-lr='PaymentType']").html(responseOut.paymentTypeName);
  
              $("*[data-lr='txnWiseEngb']").html(responseOut.consignmentSummaryPaymentType != PAYMENT_TYPE_CHEQUE_ID ? 'Txn No : ' : 'Chq No : ');
              
              if(responseOut.bankName != undefined && responseOut.bankName != 'undefined')
                  $("*[data-lr='bankName']").html(responseOut.bankName);
              
              $("*[data-lr='serviceTypeName']").html(responseOut.serviceTypeName != undefined ? responseOut.serviceTypeName : "--");
              
              this.setSTPaidByDetails(responseOut);
              this.setBookingCharges(responseOut);
              _this.setGstTaxDetails(responseOut)
          }, setSTPaidByDetails : function(responseOut) {
              var STPaidBy				= responseOut.STPaidBy;
              var config					= responseOut.configuration;
              var consigneeName			= responseOut.consigneeName;
              var consignorName			= responseOut.consignorName;
                  
              $("*[data-lr='taxPaidBy']").html(responseOut.consignmentSummaryTaxByString);
              $("*[data-lr='stPaidBy']").html(responseOut.consignmentSummaryTaxByString);
              
              if(STPaidBy == TAX_PAID_BY_CONSINGOR_ID) {
                  $("*[data-lr='consignAndAmt']").html(responseOut.consignmentSummaryTaxByString +' ( Rs. ' + responseOut.bookingTimeUnAddedTaxAmount + ' )');
                  $("*[data-lr='stPaidByTaxAmnt']").html(responseOut.bookingTimeUnAddedTaxAmount);
                  $("*[data-lr='taxPaidByConsignorConsignee']").html('Consignor/Consignee');
                  $("*[data-lr='stPaidByName']").html(consignorName.substring(0,12) + '..');
                  
                  if(config.showBranchGSTNByGSTPaidBy == 'true')
                      $('.branchGSTN').css('display','none');
  
                  $('.stConsignee').css('display','none');
                  $('.stTransporter').css('display','none');
                  
                  $("*[data-lr='taxPaidByName']").html('GST Paid By ' + consignorName.substring(0, 20));
                  $("*[data-lr='taxPaidByName517']").html( consignorName.substring(0, 20));
                  
                  if(config.customGroupLabel == 'true' || config.customGroupLabel == true) {
                      $("*[data-lr='consignorYes']").html('YES');
                      $('.stPaidByLabel').html("Consignor :");
                      $('.stPaidByValue').html("YES");
                  }
              } else if(STPaidBy == TAX_PAID_BY_CONSINGEE_ID) {
                  $("*[data-lr='consignAndAmt']").html(responseOut.consignmentSummaryTaxByString +' ( Rs. ' + responseOut.bookingTimeUnAddedTaxAmount + ' )');
                  $("*[data-lr='stPaidByTaxAmnt']").html(responseOut.bookingTimeUnAddedTaxAmount);
                  $("*[data-lr='taxPaidByConsignorConsignee']").html('Consignor/Consignee');
                  $("*[data-lr='stPaidByName']").html(consigneeName.substring(0,12) + '..');
                  
                  if(config.showBranchGSTNByGSTPaidBy == 'true')
                      $('.branchGSTN').css('display','none');
                      
                  $('.stConsignor').css('display','none');
                  $('.stTransporter').css('display','none');
                  
                  $("*[data-lr='taxPaidByName']").html('GST Paid By ' + consigneeName.substring(0, 20));
                  $("*[data-lr='taxPaidByName517']").html(consigneeName.substring(0, 20));
                  
                  if(config.customGroupLabel == 'true' || config.customGroupLabel == true) {
                      $("*[data-lr='consigneeYes']").html('YES');
                      $('.stPaidByLabel').html("Consignee :");
                      $('.stPaidByValue').html("YES");
                  }
              } else if(STPaidBy == TAX_PAID_BY_TRANSPORTER_ID) {
                  $("*[data-lr='serviceTaxPaidBy']").html(responseOut.consignmentSummaryTaxByString);
                  $("*[data-lr='consignAndAmt']").html(responseOut.consignmentSummaryTaxByString);
                  $("*[data-lr='stPaidByTaxAmnt']").html("0");
                  $("*[data-lr='stPaidByName']").html("Transporter");
                  
                  $('.stConsignor').css('display','none');
                  $('.stConsignee').css('display','none');
                  
                  $("*[data-lr='taxPaidByName']").html("GST Paid By Transporter");
                  $("*[data-lr='taxPaidByName517']").html(" Transporter");
                  
                  if(config.customGroupLabel == 'true' || config.customGroupLabel == true) {
                      $('.stPaidByLabel').html("Transporter :");
                      $('.stPaidByValue').html("YES");
                  }
              } else {
                  $('.stConsignor').css('display','none');
                  $('.stConsignee').css('display','none');
                  $('.stTransporter').css('display','none');
              }
              
              if(STPaidBy == TAX_PAID_BY_NOT_APPLICABLE_ID)
                  $("*[data-lr='taxPaidByName']").html("GST Paid By Not Applicable");
              $("*[data-lr='taxPaidByName517']").html(" Not Applicable");
              
              if(STPaidBy == TAX_PAID_BY_NOT_APPLICABLE_ID && responseOut.sourceSubRegionId == 3840)
                  $("*[data-lr='taxPaidByCnorOrCnee']").html("Consignor AND/OR Consignee");
              else	
                   $("*[data-lr='taxPaidByCnorOrCnee']").html(responseOut.consignmentSummaryTaxByString);
              
              if (responseOut.serviceTaxString != undefined) {
                  $("*[data-lr='serviceTaxString']").html(responseOut.serviceTaxString);
                  $("*[data-lr='serviceTaxStringg']").html('GST Paid By ' + responseOut.consignmentSummaryTaxByString);
              }
          }, setBookingCharges : function(responseOut){
              var classNameofName 		= $("*[data-chargename='dynamic']").attr('class');
              var classNameofVal 			= $("*[data-chargevalue='dynamic']").attr('class');
              var configuration 			= responseOut.configuration;
              var wayBillTypeId			= responseOut.wayBillTypeId;
              var freight 			    = 0;
              var grandtotal				= 0;
              var noOfChargesToPrint		= configuration.noOfChargesToPrint;
              var chargeTypeModelArr		= responseOut.chargeTypeModelArr;
              var packingTypeMasterId		= responseOut.packingTypeMasterId;
  
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
              var calculateTotal			= 0;
  
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
                  
                  if(configuration.printLimitedCharges  == true || configuration.printLimitedCharges  == 'true') {
                      if(index == Number(noOfChargesToPrint))
                          break;
                      
                      if(chargeObj.wayBillBookingChargeChargeAmount > 0) {
                          calculateTotal	+= chargeObj.wayBillBookingChargeChargeAmount;
                          $("*[data-lr='calculateTotal']").html(calculateTotal);
                          $("*[data-lr='sssgrandtotal']").html(calculateTotal);
                      }
                  }
                  
                  if(configuration.showDecimalValueAfterCharge == true || configuration.showDecimalValueAfterCharge == 'true')
                      $("*[data-lr='calculateTotal']").html(Math.round(calculateTotal) + ".00");
  
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
                  
                  if(chargeObj.wayBillBookingChargeChargeAmount > 0)
                      $(".charge_section_" + chargeObj.chargeTypeMasterId).show();
  
                  if(chargeObj.chargeTypeMasterId == DDC)
                      $("*[data-lr='chargeDDCYesNo']").html(chargeObj.wayBillBookingChargeChargeAmount > 0 ? CHARGE_YES_NAME : CHARGE_NO_NAME)
  
                  if(chargeObj.chargeTypeMasterId == DOOR_DELIVERY_BOOKING) {
                      if(chargeObj.wayBillBookingChargeChargeAmount > 0)
                          $('.doorDeliveryCharges').removeClass('hide');
                      else
                          $('.doorDeliveryCharges').addClass('hide');
                  }
  
                  if(chargeObj.chargeTypeMasterId == ODA)
                      $("*[data-lr='chargeODAYesNo']").html(chargeObj.wayBillBookingChargeChargeAmount > 0 ? CHARGE_YES_NAME : CHARGE_NO_NAME);
  
                  if(chargeObj.chargeTypeMasterId == FOV)
                      $("*[data-lr='chargeFOVYesNo']").html(chargeObj.wayBillBookingChargeChargeAmount > 0 ? CHARGE_YES_NAME : CHARGE_NO_NAME);
  
                  if(chargeObj.chargeTypeMasterId == DOOR_DELIVERY_BOOKING) {
                      if(chargeObj.wayBillBookingChargeChargeAmount > 0) 
                          $('.doorDeliveryDlyTime').hide();
                      else
                          $('.doorDeliveryDlyTime').show();
                  }
              }
              
              if(configuration.onlyGrandTotalPrintForParticularPackingType == "true" && (packingTypeMasterId == PACKING_TYPE_LIFFAFA || packingTypeMasterId == PACKING_TYPE_PACKET || packingTypeMasterId == PACKING_TYPE_LETTER)){
                      $('.hideCharges').hide();
                  }
  
              if(configuration.showLRCharge == "true")
                  this.setLRCharge(sortedBookingChargeList);
              
              if(configuration.addCarreirRiskandInsurance == "true")
                  this.addCarreirRiskandInsurance(sortedBookingChargeList);
  
              if(configuration.removeStaticChargesWithZeroAmt  == "true") {
                  $("#chargesTable tbody tr td").each(function() {
                      var tdToRemove	= $(this).closest('td');
                      // Within td we find the last span child element and get content
                      var value	= $(this).find("span:last-child").html();
  
                      if((value !='' || value != undefined) && value == 0) {
                          tdToRemove.remove();
                      }
                  });
              }
  
              if(configuration.removeStaticChargesTrWithZeroAmt  == "true") {
                  $("#chargeTable tbody tr").each(function() {
                      var trToRemove	= $(this).closest('tr');
                      // Within tr we find the last td child element and get content
                      var value	= $(this).find("td:last-child").html();
                      
                      if((value !='' || value != undefined) && value == 0)
                          trToRemove.remove();
                  });
              }
  
              if(configuration.removeStaticChargesTrWithSpace  == "true") {
                  $("#chargeTable tbody tr").each(function() {
                      var value	= $(this).find("td:last-child").html();
  
                      if((value !='' || value != undefined) && value == 0)
                          $(this).find("td:last-child").html(" ");
                  });
              }
  
              $("*[data-chargevalue='dynamic']").parent().remove()
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
  
              if(wayBillTypeId == WAYBILL_TYPE_CREDIT) {
                  $(".freightColumn").html('TBB');
                  $(".Column").removeAttr('data-Selector');
                  $(".Column").html("");
              }
              
              if(configuration.removeChargesInDifferentCopies == true || configuration.removeChargesInDifferentCopies == "true") {
                  var allCharges = $(".ChargeRow");
                      for (var eleCharge = 0; eleCharge < allCharges.length; eleCharge++) {
                          
                      if( allCharges[eleCharge] != undefined) {
                          var id = allCharges[eleCharge].offsetParent.id;
                          
                          if(configuration.removeChargesFromThirdCopyOfToPay == true || configuration.removeChargesFromThirdCopyOfToPay == "true") {
                              if(wayBillTypeId == WAYBILL_TYPE_TO_PAY && id == "thirdCopyTbody") {
                                  allCharges[eleCharge].innerHTML = "";
                                  $(".grandTotalThirdCopy").html("");
                               }
                          } else if(configuration.showChargesOnThirdCopyForAllLR == true || configuration.showChargesOnThirdCopyForAllLR == "true") {
                              if(configuration.showChargesOnThirdCopyInPaidLr == true || configuration.showChargesOnThirdCopyInPaidLr == "true") {
                                  if((wayBillTypeId == WAYBILL_TYPE_PAID) && (id == "secondCopyTbody" || id == "firstCopyTbody")) {
                                      allCharges[eleCharge].innerHTML = "";
                                      $(".grandTotalFirstCopy").html("");
                                      $(".grandTotalSecondCopy").html("");
                                   }
                              } else if(id == "secondCopyTbody" || id == "firstCopyTbody") {
                                  allCharges[eleCharge].innerHTML = "0";
                                  $(".grandTotalFirstCopy").html("00");
                                  $(".grandTotalSecondCopy").html("00");
                              }
                          } else if(configuration.showChargesOnConsignorCopy == true || configuration.showChargesOnConsignorCopy == "true") {
                               if((wayBillTypeId == WAYBILL_TYPE_PAID || wayBillTypeId == WAYBILL_TYPE_CREDIT) && (id == "secondCopyTbody" || id == "firstCopyTbody"))
                                  allCharges[eleCharge].innerHTML = "";
                                else if ((wayBillTypeId == WAYBILL_TYPE_PAID || wayBillTypeId == WAYBILL_TYPE_CREDIT) && (id == "secondCopyAmountZero" || id == "firstCopyAmountZero")) {
                                    allCharges[eleCharge].innerHTML = "0";
                                    $(".grandTotalFirstCopy").html("00");
                                    $(".grandTotalSecondCopy").html("00");
                               }
                              
                              if (configuration.showChargesOnConsigneeCopy == true || configuration.showChargesOnConsigneeCopy == "true") {
                                  if ((wayBillTypeId == WAYBILL_TYPE_TO_PAY || wayBillTypeId == WAYBILL_TYPE_CREDIT) && (id == "secondCopyTbody" || id == "thirdCopyTbody"))
                                      allCharges[eleCharge].innerHTML = "";
                                  else if ((wayBillTypeId == WAYBILL_TYPE_TO_PAY || wayBillTypeId == WAYBILL_TYPE_CREDIT) && (id == "secondCopyAmountZero" || id == "thirdCopyAmountZero")) {
                                      allCharges[eleCharge].innerHTML = "0";
                                      $(".grandTotalThirdCopy").html("00");
                                      $(".grandTotalSecondCopy").html("00");
                                  }
                              }
                          } else if(configuration.replaceLrChargeWithPaidSecondThirdCopy == true || configuration.replaceLrChargeWithPaidSecondThirdCopy == "true") {
                              if(wayBillTypeId == WAYBILL_TYPE_PAID){
                                  if(configuration.replaceLrChargeWithPaidInAllCopy == true || configuration.replaceLrChargeWithPaidInAllCopy == "true"){
                                      $(".FirstCopy").html("PAID");
                                      $(".SecondCopy").html("PAID");	
                                      $(".cgst").removeAttr('data-gst');
                                      $(".sgst").removeAttr('data-gst');
                                      $(".igst").removeAttr('data-gst');
                                  } else if(id == "secondCopyTbody" || id == "thirdCopyTbody"){
                                      allCharges[eleCharge].innerHTML = "PAID";
                                      $(".grandTotalThirdCopy").html("PAID");
                                      $(".grandTotalSecondCopy").html("PAID");
                                  } 
                               }
                           } else if(wayBillTypeId == WAYBILL_TYPE_TO_PAY) {
                              if(id == "thirdCopyTbody") {
                                  allCharges[eleCharge].innerHTML = "";
                                  $(".grandTotalThirdCopy").html("");
                              }
                          } else if(wayBillTypeId == WAYBILL_TYPE_PAID) {
                              if(configuration.showChargesOnThirdCopyInPaidLr == true || configuration.showChargesOnThirdCopyInPaidLr == "true") {
                                  if(id == "secondCopyTbody" || id == "firstCopyTbody") {
                                      allCharges[eleCharge].innerHTML = "";
                                      $(".grandTotalFirstCopy").html("");
                                      $(".grandTotalSecondCopy").html("");
                                  } 
                              } else if(id == "secondCopyTbody" || id == "thirdCopyTbody" || id == "firstCopyTbody") {
                                  allCharges[eleCharge].innerHTML = "";
                                  $(".grandTotalFirstCopy").html("");
                                  $(".grandTotalSecondCopy").html("");
                                  $(".grandTotalThirdCopy").html("");
                              } 
                          }
                      }
                  }
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
              
              var rpsCharges = $(".rpsCharges");
              
              for(var i = 0; i < rpsCharges.length; i++) {
                  if(rpsCharges[i] != undefined){
                       var id = rpsCharges[i].offsetParent.id;
              
                       if(id == "thirdTableRPS")
                           rpsCharges[i].innerHTML = " ";
                  }
              }
              
              //For sjtc group
              if(sortedBookingChargeList != undefined ) {
                  for (var index in sortedBookingChargeList) {
                      if(sortedBookingChargeList[index].chargeTypeMasterId == FREIGHT) {
                          freight 	= sortedBookingChargeList[index].wayBillBookingChargeChargeAmount;
                          break;
                          
                      }
                  }
              }
              
              //show amount BY paid And Topay Column
              // for SURAT ANDHRA LOGISTICS 
              
              if(wayBillTypeId == WAYBILL_TYPE_PAID)
                  $(".chargeTableForSal").css('paddingLeft','105px');
              else if(wayBillTypeId == WAYBILL_TYPE_TO_PAY || wayBillTypeId == WAYBILL_TYPE_CREDIT)
                  $(".chargeTableForSal").css('paddingLeft','35px');
              
              if(wayBillTypeId == WAYBILL_TYPE_CREDIT) {
                  grandtotal =  responseOut.bookingTotal - freight;
                  $(".grandTotalFreight").html(Math.round(grandtotal));
              }
              _this.removePaidHamaliGrandTotal(responseOut);
              
              if(configuration.showReturnBookingCharges =="true" && responseOut.returnBookingWaybillId > 0)
                  $(".returnBookingChrg").css("display", "block");
              
              if((configuration.hideAllChargesForTbbLr == true || configuration.hideAllChargesForTbbLr == 'true') && wayBillTypeId == WAYBILL_TYPE_CREDIT)
                  $(".hideAllChargesForTbb").hide();
              
              if((configuration.hideAllChargesInConsignorCopyForPaidLr == true || configuration.hideAllChargesInConsignorCopyForPaidLr == 'true') && wayBillTypeId == WAYBILL_TYPE_PAID)
                  $(".hideAllChargesForPaid").hide();
          },setLRCharge : function(sortedBookingChargeList) {
              for(var index in sortedBookingChargeList) {
                  if(Number(sortedBookingChargeList[index].chargeTypeMasterId) == LR_CHARGE) {
                      if (Number(sortedBookingChargeList[index].wayBillBookingChargeChargeAmount) != 30) {
                          $( "#LRCharge" ).removeClass('hide');
                          $( "#LRCharge" ).addClass('show');
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
              var showQuantity 			= false;
              var showPackingType 		= false;
              var showSaidToContain 		= false;
              var showSaidToContain1 		= false;
              var showSeperater			= false;
              var showRateAmount			= false;
              var showSerialNo			= false;
              var freight					= false;
              var freightAmount			= 0;
              var cftLength				= false;
              var cftHeight				= false;
              var cftBreadth				= false;
              var length					= false;
              var breadth					= false;
              var height					= false;
              var config					= responseOut.configuration;
              var wayBillTypeId			= responseOut.wayBillTypeId;
              var chargedWeight			= false;
              
              var consignmentArr 				= responseOut.consignmentMap
              var classNameofSerialNO			= $("*[data-consignmentserialNo='dynamic']").attr('class');
              var classNameofQty 				= $("*[data-consignmentquantity='dynamic']").attr('class');
              var classNameofPackingType 		= $("*[data-consignmentpackingtype='dynamic']").attr('class');
              var classNameofSeperator 		= $("*[data-consignmentseperator='dynamic']").attr('class');
              var classNameofSaidToContain 	= $("*[data-consignmentsaidtocontain='dynamic']").attr('class');
              var classNameofSaidToContain1 	= $("*[data-consignmentsaidtocontain1='dynamic']").attr('class');
              var classNameofRateAmount		= $("*[data-consignmentrateamount='dynamic']").attr('class');
              var classNameofFreightAmount	= $("*[data-consignmentfreightamount='dynamic']").attr('class');
              var classNameofFreightAmountPaid	= $("*[data-consignmentfreightamountPaid='dynamic']").attr('class');
              var classNameofChargedWeight	= $("*[data-consignmentChargedWeight='dynamic']").attr('class');
              
              if(config.showLBHOnPrint == 'true' && responseOut.cftWeight > 0) {
              
                  var classNameofLength			= $("*[data-consignmentlength='dynamic']").attr('class');
                  var classNameofBreadth			= $("*[data-consignmentbreadth='dynamic']").attr('class');
                  var classNameofHeight			= $("*[data-consignmentheight='dynamic']").attr('class');
  
                  $("*[data-consignmentcftweight='dynamic']").each(function(){
                      cftWeight = true;
                  });
                  
                  $("*[data-consignmentcftlength='dynamic']").each(function(){
                      cftLength = true;
                  });
                  
                  $("*[data-consignmentcftbreadth='dynamic']").each(function(){
                      cftBreadth = true;
                  });
                  
                  $("*[data-consignmentcftheight='dynamic']").each(function(){
                      cftHeight = true;
                  });
                  
                  $("*[data-consignmentlength='dynamic']").each(function(){
                      length = true;
                  });
                  
                  $("*[data-consignmentbreadth='dynamic']").each(function(){
                      breadth = true;
                  });
                  
                  $("*[data-consignmentheight='dynamic']").each(function(){
                      height = true;
                  });
                  
              }
              
              $("*[data-consignmentquantity='dynamic']").each(function(){
                  showQuantity 			= true;
              });
  
              $("*[data-consignmentpackingtype='dynamic']").each(function(){
                  showPackingType 		= true;
              });
  
              $("*[data-consignmentseperator='dynamic']").each(function(){
                  showSeperater 		= true;
              });
              $("*[data-consignmentrateamount='dynamic']").each(function(){
                  showRateAmount 		= true;
              });
  
              $("*[data-consignmentsaidtocontain='dynamic']").each(function(){
                  showSaidToContain = true;
              });
              
              $("*[data-consignmentsaidtocontain1='dynamic']").each(function(){
                  showSaidToContain1 = true;
              });
              
              $("*[data-consignmentserialNo='dynamic']").each(function(){
                  showSerialNo = true;
              });
              
              $("*[data-consignmentfreightamount='dynamic']").each(function(){
                  freight = true;
              });
              
              $("*[data-consignmentfreightamountPaid='dynamic']").each(function(){
                  freight = true;
              });
              
              $("*[data-consignmentChargedWeight='dynamic']").each(function(){
                  chargedWeight = true;
              });
              
              
              var tbody = $("*[data-consignmentquantity='dynamic']").parent().parent();
              var tbody1= "";
              
              if((config.hideAllChargesInConsignorCopyForPaidLr == true || config.hideAllChargesInConsignorCopyForPaidLr == 'true') && wayBillTypeId == WAYBILL_TYPE_PAID)
                  tbody1 = $("*[data-consignmentfreightamountPaid='dynamic']").parent().parent();
              else
                  tbody1 = $("*[data-consignmentfreightamount='dynamic']").parent().parent();
              
              var count	= 1 ;
              
              for(var index in consignmentArr){
                  var newtr = $("<tr/>")
                  var newtr1 = $("<tr/>")
                  
                  if(consignmentArr[index].amount != 0)
                      freightAmount = consignmentArr[index].quantity * consignmentArr[index].amount;
                  else
                      freightAmount = responseOut.chargeAmount;
                  
                  if(showSerialNo) {
                      var newtdSrNO = $("<td></td>");
                      newtdSrNO.attr("class", classNameofSerialNO);
                      newtdSrNO.attr("data-selector",'sNo' + index);
                      newtdSrNO.html(count++);
                      newtr.append(newtdSrNO);
                  }
                  
                  if(showQuantity) {
                      var newtdQuantity = $("<td></td>");
                      newtdQuantity.attr("class", classNameofQty);
                      newtdQuantity.attr("data-selector",'qty' + consignmentArr[index].consignmentDetailsId);
                      newtr.append(newtdQuantity);
                  }
  
                  if(showPackingType) {
                      var newtdPackingType = $("<td></td>");
                      newtdPackingType.attr("class", classNameofPackingType);
                      newtdPackingType.attr("data-selector", 'packingtype' + consignmentArr[index].consignmentDetailsId);
                      newtr.append(newtdPackingType);
                  }
  
                  if(showSeperater) {
                      var newtdSeperator = $("<td></td>");
                      newtdSeperator.attr("class", classNameofSeperator);
                      newtdSeperator.attr("data-selector", 'seperator');
                      newtr.append(newtdSeperator);
                  }
  
                  if(showSaidToContain) {
                      var newtdSaidToContain = $("<td></td>");
                      newtdSaidToContain.attr("class", classNameofSaidToContain);
                      newtdSaidToContain.attr("data-selector", 'saidToCOntain' + consignmentArr[index].consignmentDetailsId);
                      newtr.append(newtdSaidToContain);
                  }
                  
                  if(showSaidToContain1) {
                      var newtdSaidToContain = $("<td></td>");
                      newtdSaidToContain.attr("class", classNameofSaidToContain1);
                      newtdSaidToContain.attr("data-selector", 'saidToCOntain1' + consignmentArr[index].consignmentDetailsId);
                      newtr.append(newtdSaidToContain);
                  }
                  
                  if(showRateAmount) {
                      var newtdSaidToContain = $("<td></td>");
                      newtdSaidToContain.attr("class", classNameofRateAmount);
                      newtdSaidToContain.attr("data-selector", 'amount' + consignmentArr[index].consignmentDetailsId);
                      newtr.append(newtdSaidToContain);
                  }
                  
                  if(chargedWeight){
                      var newtdChargedWeight = $("<td></td>");
                      newtdChargedWeight.attr("class",classNameofChargedWeight);
                      newtdChargedWeightn.attr("data-selector",'ChargedWeight'+consignmentArr[index].consignmentDetailsId);
                      newtr.append(newtdChargedWeight);
                  }
                  
                  if(freight) {
                      var newtdfreight = $("<td></td>");
                      
                      if((config.hideAllChargesForTbbLr == true || config.hideAllChargesForTbbLr == 'true') && wayBillTypeId == WAYBILL_TYPE_CREDIT) {
                          newtdfreight.attr("class", classNameofFreightAmount + "hideAllCharge");
                      } else if((config.hideAllChargesInConsignorCopyForPaidLr == true || config.hideAllChargesInConsignorCopyForPaidLr == 'true')) {
                          if(wayBillTypeId == WAYBILL_TYPE_PAID) {
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
                  
                  $(tbody).before(newtr);
                  $(tbody1).before(newtr1);
              }
  
              if((config.hideAllChargesForTbbLr == true || config.hideAllChargesForTbbLr == 'true') && wayBillTypeId == WAYBILL_TYPE_CREDIT)
                  $(".hideAllCharge").html("TBB");
  
              if((config.hideAllChargesInConsignorCopyForPaidLr == true || config.hideAllChargesInConsignorCopyForPaidLr == 'true')) {
                  if(wayBillTypeId == WAYBILL_TYPE_PAID)
                      $(".hideSelectorForTopay").hide();
                  else
                      $(".hideAllChargeForPaid").hide();
              }
              
              _this.setPackingTypeNameWithQuantity(consignmentArr, responseOut)
              _this.setConsignmentReverseOrder(responseOut)
              _this.setCurrentDateTime(responseOut)
              
          
              
          }, charLimit : function() {
              $('[data-charlimit]').each(function() {
                  var attrString = $(this).html();
                  var limitRange = $(this).data('charlimit');
                  if(attrString.length > limitRange) {
                      attrString	= attrString.substring(0, limitRange) + '..';
                      $(this).html(attrString);
                  }
              })
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
          },removePaidHamaliGrandTotal:function(responseOut){
              var configuration 					= responseOut.configuration;
              var wayBillTypeId					= responseOut.wayBillTypeId;
              var waybillBookingChargesList		= responseOut.waybillBookingChargesList;
              var paidhamali 						= 0;
              var freight 						= 0;
              var loading 						= 0;
              var cartage 						= 0;
              var crossing 						= 0;
  
              if(wayBillTypeId == WAYBILL_TYPE_TO_PAY) {
                  if(configuration.removePaidHamaliTotalAmount == 
                  "true") {
                      paidhamali = $("*[data-selector='chargeValue19']").html();
                      $("*[data-lr='grandTotalsrs']").html((responseOut.bookingTotal) - paidhamali)
                  }
              } else {
                  $("*[data-lr='grandTotalsrs']").html((responseOut.bookingTotal))
              }
  
              if(waybillBookingChargesList != undefined) {
                  for (var index in waybillBookingChargesList) {
                      if(waybillBookingChargesList[index].chargeTypeMasterId == FREIGHT)
                          freight 	= waybillBookingChargesList[index].wayBillBookingChargeChargeAmount;
                      else if(waybillBookingChargesList[index].chargeTypeMasterId == LOADING)
                          loading 	= waybillBookingChargesList[index].wayBillBookingChargeChargeAmount;
                      else if(waybillBookingChargesList[index].chargeTypeMasterId == CROSSING_BOOKING)
                          crossing 	= waybillBookingChargesList[index].wayBillBookingChargeChargeAmount;
                      else if(waybillBookingChargesList[index].chargeTypeMasterId == CARTAGE_CHARGE)
                          cartage 	= waybillBookingChargesList[index].wayBillBookingChargeChargeAmount;
                  }
              }
  
          }, setConsignmentReverseOrder : function(responseOut) {
              var showQuantity 			= false;
              var showPackingType 		= false;
              var showSaidToContain 		= false;
              var showSeperater			= false;
              var	showAmount				= false;
  
              var consignmentArr 				= responseOut.consignmentMap;
              var classNameofQty 				= $("*[data-consignmentquantityreverse='dynamic']").attr('class');
              var classNameofPackingType 		= $("*[data-consignmentpackingtypereverse='dynamic']").attr('class');
              var classNameofSeperator 		= $("*[data-consignmentseperatorreverse='dynamic']").attr('class');
              var classNameofSaidToContain 	= $("*[data-consignmentsaidtocontainreverse='dynamic']").attr('class');
              var classNameofAmount			= $("*[data-consignmentamountreverse='dynamic']").attr('class');
              var classNameofChargedWeight	= $("*[data-consignmentChargedWeightreverse='dynamic']").attr('class');
  
              $("*[data-consignmentquantityreverse='dynamic']").each(function(){
                  showQuantity 			= true;
              });
  
              $("*[data-consignmentpackingtypereverse='dynamic']").each(function(){
                  showPackingType 		= true;
              });
  
              $("*[data-consignmentseperatorreverse='dynamic']").each(function(){
                  showSeperater 		= true;
              });
  
              $("*[data-consignmentsaidtocontainreverse='dynamic']").each(function(){
                  showSaidToContain = true;
              });
  
              $("*[data-consignmentamountreverse='dynamic']").each(function(){
                  showAmount		= true;
              });
  
              var tbody = $("*[data-consignmentquantityreverse='dynamic']").parent().parent();
  
              for(var index in consignmentArr) {
                  var newtr = $("<tr/>")
  
                  if(showPackingType) {
                      var newtdPackingType = $("<td></td>");
                      newtdPackingType.attr("class", classNameofPackingType);
                      newtdPackingType.attr("data-selector", 'packingtype' + consignmentArr[index].consignmentDetailsId);
                      newtr.append(newtdPackingType);
                  }
  
                  if(showSeperater) {
                      var newtdSeperator = $("<td></td>");
                      newtdSeperator.attr("class", classNameofSeperator);
                      newtdSeperator.attr("data-selector", 'seperator');
                      newtr.append(newtdSeperator);
                  }
  
                  if(showSaidToContain) {
                      var newtdSaidToContain = $("<td></td>");
                      newtdSaidToContain.attr("class", classNameofSaidToContain);
                      newtdSaidToContain.attr("data-selector", 'saidToCOntain' + consignmentArr[index].consignmentDetailsId);
                      newtr.append(newtdSaidToContain);
                  }
  
                  if(showQuantity) {
                      var newtdQuantity = $("<td></td>");
                      newtdQuantity.attr("class", classNameofQty);
                      newtdQuantity.attr("data-selector", 'qty' + consignmentArr[index].consignmentDetailsId);
                      newtr.append(newtdQuantity);
                  }
  
                  if(showAmount) {
                      var newtdChargedWeight	= $("<td></td>");
                      newtdAmount.attr("class",classNameofChargedWeight);
                      newtdAmount.attr("data-selector",'amount'+consignmentArr[index].consignmentDetailsId);
                      newtr.append(newtdChargedWeight);
                  }
                  
                  if(showAmount){
                      var newtdAmount	= $("<td></td>");
                      newtdAmount.attr("class", classNameofAmount);
                      newtdAmount.attr("data-selector", 'amount' + consignmentArr[index].consignmentDetailsId);
                      newtr.append(newtdAmount);
                  }
                  if(showAmount){
                      var newtdPrivateMark	= $("<td></td>");
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
          }, setExecutiveDetails : function(responseOut) {
          }, showPopUp : function(responseOut) {
              hideLayer();
              var showPopup 						= false;
              var conf							= responseOut.configuration;
              var wayBillTypeId					= responseOut.wayBillTypeId;
              var showLrPrintConfirmationPopup 	= responseOut.showLrPrintConfirmationPopup;
              var isWayBillTypeWisePopupAllowed	= conf.isWayBillTypeWisePopupAllowed;
                  isQRPrintOnPopUpSelection		= conf.isQRPrintOnPopUpSelection;
              var bookingCharges 					= responseOut.waybillBookingChargesList;
              var chargeTypeModelArr				= responseOut.chargeTypeModelArr;
              var _thisQr = this;
              
              
              if(printFromDB)
                  _thisQr.printWindow(false);
              
              
              $("*[data-popup='popup']").each(function(){
                  showPopup 			= true;
              });
  
              $("*[data-popup='popup1']").each(function(){
                  showPopup 			= true;
              });
  
              $("*[data-popup='popup2']").each(function(){
                  showPopup 			= true;
              });
  
              if(isWayBillTypeWisePopupAllowed == 'true' || isWayBillTypeWisePopupAllowed == true) {
                  var wayBillTypeIdsForPopup 	= conf.wayBillTypeIdsForPopup;
                  var wayBillTypeIdList 		= wayBillTypeIdsForPopup.split(',');
                  
                  showPopup 			= isValueExistInArray(wayBillTypeIdList, responseOut.wayBillTypeId);
              }
  
              if(conf.isPopupAskToPrintFor == 'true' || conf.isPopupAskToPrintFor == true
                  || conf.showHidePrintData == 'true' || conf.duplicatePrint == 'true'
                  || ((conf.showPopForTopayFTLLr == 'true' || conf.showPopForTopayFTLLr == true) 
                      && wayBillTypeId == WAYBILL_TYPE_TO_PAY 
                      && responseOut.bookingTypeId == BOOKING_TYPE_FTL_ID)
                  || ((showLrPrintConfirmationPopup == 'true' || showLrPrintConfirmationPopup == true) 
                      && (wayBillTypeId == WAYBILL_TYPE_PAID || wayBillTypeId == WAYBILL_TYPE_TO_PAY))
                  || (conf.showPopUpContentForQrCodeOption == 'true' || conf.showPopUpContentForQrCodeOption == true)
                  || (conf.showPopUpContentForPaidChargesOption == 'true' || conf.showPopUpContentForPaidChargesOption == true)) {
                  showPopup 			= true;
              }
              
          if(showPopup) {
              ///// workhere
              	$('#popUpContent723').bPopup({
				}, function() {
					var _thisMod = this;

					$(this).html("<div class='confirm' style='height:150px;width:250px; padding:5px'>"
							+"<div style='font-size:18px; color:DodgerBlue;text-align:center;'><b>Print Option</b><div><br/>"
							+"<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox'  id='check'  />&nbsp;<b style='font-size:14px;'>Print Charges</b><div>"
							+"<button id='cancel'>Cancel</button>"
							+"<button autofocus id='printCharges'>Print</button></center></div>")

					$("#shortcut").html("Shortcut Keys : Enter = Print, Esc = Cancel")
					$("#confirm").focus();
					$('#printCharges').focus();

					$(document).on('keydown', function(event) {
						if (event.keyCode == 27) {
							window.close();
						}
					});
				
					$("#confirm").click(function(){
						_thisMod.close();
						_this.printWindow();
					})

					$("#cancel").click(function(){
						_thisMod.close();
						window.close();
						_this.printWindow();
					});
				
					$("#printCharges").click(function(){

					if ( $("#check").is(":checked") ) {
						$(".freight").show();
						$(".stCharges").show();
						$(".hamali").show();
						$(".CCA").show();
						$(".toll").show();
						$(".other").show();
						$(".doorDly").show();
						$(".doorColl").show();
						$(".total").show();

						$(".hideCharges").show();
						_thisMod.close();
						_this.printWindow();
					}else if ( $("#check").not(":checked") ) {
						$(".freight").hide();
						$(".stCharges").hide();
						$(".hamali").hide();
						$(".CCA").hide();
						$(".toll").hide();
						$(".other").hide();
						$(".doorDly").hide();
						$(".doorColl").hide();
						$(".total").hide();
						$(".hideCharges").hide();

						_thisMod.close();
						_this.printWindow();
					}})

				});
                  
              }
          },printWindow : function(isPdfExportAllow){
			if(!isPdfExportAllow){
				hideLayer();
				setTimeout(function(){ window.print();window.close();
				localStorage.removeItem("lrDataPrint");
				localStorage.removeItem("imageObjet");
				},500);
			}

		 },setCurrentDateTime : function(responseOut) {
              $("*[data-time='current']").html(responseOut.currentTime);
              $("*[data-date='current']").html(responseOut.currentDate);
              
          }, setPackingTypeNameWithQuantity : function(consignmentArr, responseOut) {
              var article 							= [];
              var commaSepratedSaidToContained 		= [];
              var commaSepratedSaidToContainedWithQty = [];
              var commaSepratedPackingTypeWithSubstr	= [];
              var commaSepratedQtyWithPackingTypeAndSaidToContained = [];
              var commaSepratedPackingType	 		= [];
              var	config					= responseOut.configuration;
              
              for(var index in consignmentArr) {
                  var pos 			= Number(index) + Number(1);
                  var qty				= consignmentArr[index].quantity;
                  var packingTypeName = consignmentArr[index].packingTypeName;
                  var saidToContain	= consignmentArr[index].saidToContain;
                  var amount			= consignmentArr[index].amount;
                  var privateMark		= consignmentArr[index].amount;
                  var freightAmount	= consignmentArr[index].freightAmount;
                  
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
                                  
                  if(responseOut.chargeTypeId == CHARGETYPE_ID_QUANTITY)
                      $("*[data-consignmentArticleRate='" + (pos) + "']").html(amount + "/Art");
                  
                  $("*[data-consignmentallpackingtype='" + (pos) + "']").html(packingTypeName + ' OF ' + saidToContain);
                    
                  if(config.showLBHOnPrint == 'true' && responseOut.cftWeight > 0) {
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
                  
                  if(saidToContain == "") {
                      $("*[data-selector='saidToCOntain1" + consignmentArr[index].consignmentDetailsId + "']").html("As Per Invoice");
                      $('.saidToContain').hide();
                  } else {
                      $("*[data-selector='saidToCOntain1" + consignmentArr[index].consignmentDetailsId + "']").html(saidToContain);
                  }
                  
                  article.push(qty + " " + packingTypeName);
                  commaSepratedQtyWithPackingTypeAndSaidToContained.push(qty + "-" + packingTypeName + "-" + saidToContain);
                  commaSepratedSaidToContained.push(saidToContain);
                  commaSepratedSaidToContainedWithQty.push(saidToContain + " " + qty);
                  commaSepratedPackingTypeWithSubstr.push((packingTypeName).substring(0, 10));
                  commaSepratedPackingType.push(packingTypeName);
              }
              
              $("*[data-lr='pkgNameWithQty']").html("(" + article.join(', ') + ")");
              $("*[data-lr='pkgNameWithQtynoBrace']").html(article.join(', '));
              $("*[data-lr='commaSepratedQtyWithPackingTypeAndSaidToContained']").html(commaSepratedQtyWithPackingTypeAndSaidToContained.join(', '));
              $("*[data-lr='commaSeparetedSaidToContained']").html(commaSepratedSaidToContained.join(', '));
              $("*[data-lr='commaSepratedPackingTypeWithSubstr']").html(commaSepratedPackingTypeWithSubstr.join(', '));
              $("*[data-lr='commaSepratedSaidToContainedWithQty']").html(commaSepratedSaidToContainedWithQty.join(', '));
              $("*[data-lr='commaSepratedPackingType']").html("(" + commaSepratedPackingType.join(',') + ")");
              $("*[data-lr='packingTypeName']").html(commaSepratedPackingType.join(', '));
              $("*[data-lr='saidtocontainname']").html(commaSepratedSaidToContained.join(', '));
              commaSepratedArticleType = commaSepratedPackingType.join(', ');
              
              if(responseOut.chargeTypeId == CHARGETYPE_ID_WEIGHT)
                  $("*[data-consignmentArticleRate='1']").html(responseOut.weigthFreightRate + '/Kg');
          },setGstTaxDetails : function(responseOut){
              var wayBillTaxTxnHM		= responseOut.wayBillTaxTxnHM;
              var configuration 		= responseOut.configuration;
              var isDisplayWayBillTypeWiseData	= configuration.isDisplayWayBillTypeWiseData;
              var wayBillTypeId					= responseOut.wayBillTypeId;
              var waybillBookingChargesList		= responseOut.waybillBookingChargesList;
              var chargeTypeModelArr				= responseOut.chargeTypeModelArr;
              var STPaidBy						= responseOut.STPaidBy;
              var cgstAddedUnAdded	= 0;
              var sgstAddedUnAdded	= 0;
              var igstAddedUnAdded	= 0;
              
              if(wayBillTaxTxnHM != undefined && wayBillTaxTxnHM != null) {
                  for (var key in wayBillTaxTxnHM) {
                      if(key == SERVICE_TAX_MASTER_ID)
                          $("*[data-gst='serviceTax']").html(wayBillTaxTxnHM[key].taxAmount);
                      
                      if(key == SGST_MASTER_ID) {
                          $("*[data-gst='sgst']").html(Math.round(wayBillTaxTxnHM[key].taxAmount));
                          $("*[data-gst='sgstWithNoRound']").html(wayBillTaxTxnHM[key].taxAmount);
                          $("*[data-gstwithdecimal='sgst']").html((wayBillTaxTxnHM[key].taxAmount).toFixed(2));
                          
                          if(STPaidBy == TAX_PAID_BY_CONSINGOR_ID || STPaidBy == TAX_PAID_BY_CONSINGEE_ID)
                              sgstAddedUnAdded = Math.round(wayBillTaxTxnHM[key].unAddedTaxAmount);
                          else if(STPaidBy == TAX_PAID_BY_TRANSPORTER_ID)
                              sgstAddedUnAdded = Math.round(wayBillTaxTxnHM[key].taxAmount);
  
                          $("*[data-gst='consignorsgst']").html(Math.round(wayBillTaxTxnHM[key].taxAmount));
                          $("*[data-gst='consigneesgst']").html(Math.round(wayBillTaxTxnHM[key].taxAmount));
                          $("*[data-gst='transportersgst']").html(Math.round(wayBillTaxTxnHM[key].taxAmount));
  
                          if(Math.round(wayBillTaxTxnHM[key].taxAmount) > 0)
                              $(".sgstText").show();
  
                          if(Math.round(wayBillTaxTxnHM[key].taxAmount) > 0)
                              $('.sgstTd').html('SGST @ 2.5%');
                          else
                              $('.sgstTd').html('SGST');
                      }
                      
                      if(key == CGST_MASTER_ID) {
                          $("*[data-gst='cgst']").html(Math.round(wayBillTaxTxnHM[key].taxAmount));
                          $("*[data-gst='cgstWithNoRound']").html(wayBillTaxTxnHM[key].taxAmount);
                          $("*[data-gstwithdecimal='cgst']").html((wayBillTaxTxnHM[key].taxAmount).toFixed(2));
                          
                          if(STPaidBy == TAX_PAID_BY_CONSINGOR_ID || STPaidBy == TAX_PAID_BY_CONSINGEE_ID)
                              cgstAddedUnAdded = Math.round(wayBillTaxTxnHM[key].unAddedTaxAmount);
                          else if(STPaidBy == TAX_PAID_BY_TRANSPORTER_ID)
                              cgstAddedUnAdded = Math.round(wayBillTaxTxnHM[key].taxAmount);
  
                          $("*[data-gst='consignorcgst']").html(Math.round(wayBillTaxTxnHM[key].taxAmount));
                          $("*[data-gst='consigneecgst']").html(Math.round(wayBillTaxTxnHM[key].taxAmount));
                          $("*[data-gst='transportercgst']").html(Math.round(wayBillTaxTxnHM[key].taxAmount));
  
                          if(Math.round(wayBillTaxTxnHM[key].taxAmount) > 0)
                              $(".cgstText").show();
  
                          if(Math.round(wayBillTaxTxnHM[key].taxAmount) > 0)
                              $('.cgstTd').html('CGST @ 2.5%');
                          else
                              $('.cgstTd').html('CGST');
                      }
                      
                      if(key == IGST_MASTER_ID) {
                          $("*[data-gst='igst']").html(Math.round(wayBillTaxTxnHM[key].taxAmount));
                          $("*[data-gst='igstWithNoRound']").html(wayBillTaxTxnHM[key].taxAmount);
                          $("*[data-gstwithdecimal='igst']").html((wayBillTaxTxnHM[key].taxAmount).toFixed(2));
                          
                          if(STPaidBy == TAX_PAID_BY_CONSINGOR_ID || STPaidBy == TAX_PAID_BY_CONSINGEE_ID)
                              igstAddedUnAdded = Math.round(wayBillTaxTxnHM[key].unAddedTaxAmount);
                          else if(STPaidBy == TAX_PAID_BY_TRANSPORTER_ID)
                              igstAddedUnAdded = Math.round(wayBillTaxTxnHM[key].taxAmount);
  
                          $("*[data-gst='consignorigst']").html(Math.round(wayBillTaxTxnHM[key].taxAmount));
                          $("*[data-gst='consigneeigst']").html(Math.round(wayBillTaxTxnHM[key].taxAmount));
                          $("*[data-gst='transporterigst']").html(Math.round(wayBillTaxTxnHM[key].taxAmount));
  
                          if(Math.round(wayBillTaxTxnHM[key].taxAmount) > 0)
                              $(".igstText").show();
  
                          if(Math.round(wayBillTaxTxnHM[key].taxAmount) > 0)
                              $('.igstTd').html('IGST @ 5%');
                          else
                              $('.igstTd').html('IGST');
                      }
                  }
  
                  if(STPaidBy == TAX_PAID_BY_CONSINGOR_ID || STPaidBy == TAX_PAID_BY_CONSINGEE_ID) {
                      if(cgstAddedUnAdded > 0 && sgstAddedUnAdded > 0) {
                          $("*[data-selector='addedUnAddedTaxDetails']").html(' (CGST:' + cgstAddedUnAdded + ', SGST:' + sgstAddedUnAdded + ')');
                          $("*[data-selector='addedUnAddedTaxDetail']").html(' CGST: &#8377 .' + cgstAddedUnAdded + ', SGST: &#8377.' + sgstAddedUnAdded);
                      } else if(igstAddedUnAdded > 0) {
                          $("*[data-selector='addedUnAddedTaxDetails']").html(' (IGST:' + igstAddedUnAdded + ')');
                          $("*[data-selector='addedUnAddedTaxDetail']").html(' IGST: &#8377 .' + igstAddedUnAdded + '');
                      }
                  } else if(STPaidBy == TAX_PAID_BY_TRANSPORTER_ID) {
                      if(cgstAddedUnAdded > 0 && sgstAddedUnAdded > 0){
                          $("*[data-selector='addedUnAddedTaxDetails']").html(' (CGST:' + cgstAddedUnAdded + ', SGST:' + sgstAddedUnAdded + ')');
                          $("*[data-selector='addedUnAddedTaxDetail']").html(' CGST: &#8377 .' + cgstAddedUnAdded + ', SGST: &#8377.' + sgstAddedUnAdded);
                      } else {
                          $("*[data-selector='addedUnAddedTaxDetails']").html(' (IGST:' + igstAddedUnAdded + ')');
                          $("*[data-selector='addedUnAddedTaxDetail']").html(' IGST: &#8377 .' + igstAddedUnAdded);
                      }
                  }
              }
  
              if(configuration.customGroupLabel == 'true' || configuration.customGroupLabel == true) {
                  if(wayBillTypeId == WAYBILL_TYPE_CREDIT) {
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
  
                      if(configuration.replaceZeroAmountChargesWithBlank == 'true')
                          $("*[data-gst='igst']").html('');
                      else
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
              
              if((configuration.showAmountInTransporterCopyOnly == 'true' || configuration.showAmountInTransporterCopyOnly == true)
                  && wayBillTypeId == WAYBILL_TYPE_PAID)
                      $(".hideAmountColumnForPaidLr").html('');
              
              // For kothari travels
              if(configuration.grandTotalForPaidLR == "true") {
                  var freight				= 0;
                  var loading				= 0;
                  var cartage				= 0;
                  var sgst				= 0;
                  var cgst				= 0;
                  var	igst				= 0;
                  var totalForKTPaidRhs 	= 0;
  
                  if(waybillBookingChargesList != undefined) {
                      for (var index in waybillBookingChargesList) {
                          if(waybillBookingChargesList[index].chargeTypeMasterId == FREIGHT)
                              freight = waybillBookingChargesList[index].wayBillBookingChargeChargeAmount;
                          else if(waybillBookingChargesList[index].chargeTypeMasterId == LOADING)
                              loading = waybillBookingChargesList[index].wayBillBookingChargeChargeAmount;
                          else if(waybillBookingChargesList[index].chargeTypeMasterId == CARTAGE_CHARGE)
                              cartage = waybillBookingChargesList[index].wayBillBookingChargeChargeAmount;
                      }
                  }
                  
                  for (var key in wayBillTaxTxnHM) {
                      if(key == SGST_MASTER_ID)
                          sgst = 	wayBillTaxTxnHM[key].taxAmount;
  
                      if(key == CGST_MASTER_ID)
                          cgst = 	wayBillTaxTxnHM[key].taxAmount;
  
                      if(key == IGST_MASTER_ID)
                          igst = 	wayBillTaxTxnHM[key].taxAmount;
                  }
  
                  $("*[data-selector='chargeValue1Rhs']").html(freight);
                  $("*[data-selector='chargeValue4Rhs']").html(loading);
                  $("*[data-selector='chargeValue59Rhs']").html(cartage);
  
                  if(wayBillTypeId == WAYBILL_TYPE_PAID) {
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
  
              if(isDisplayWayBillTypeWiseData == 'true') {
                  if(wayBillTypeId == WAYBILL_TYPE_PAID || wayBillTypeId == WAYBILL_TYPE_CREDIT ) {
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
  
                      if(wayBillTypeId == WAYBILL_TYPE_PAID) {
                          for (var key in wayBillTaxTxnHM) {
                              if(key == SERVICE_TAX_MASTER_ID)
                                  $("*[data-hidetbbgstamount='serviceTax']").html(wayBillTaxTxnHM[key].taxAmount);
                              
                              if(key == SGST_MASTER_ID) {
                                  $("*[data-hidetbbgstamount='sgst']").html(Math.round(wayBillTaxTxnHM[key].taxAmount));
  
                                  if(Math.round(wayBillTaxTxnHM[key].taxAmount) > 0)
                                      $(".sgstText").show();
                              }
  
                              if(key == CGST_MASTER_ID) {
                                  $("*[data-hidetbbgstamount='cgst']").html(Math.round(wayBillTaxTxnHM[key].taxAmount));
  
                                  if(Math.round(wayBillTaxTxnHM[key].taxAmount) > 0)
                                      $(".cgstText").show();
                              }
                              
                              if(key == IGST_MASTER_ID) {
                                  $("*[data-hidetbbgstamount='igst']").html(Math.round(wayBillTaxTxnHM[key].taxAmount));
  
                                  if(Math.round(wayBillTaxTxnHM[key].taxAmount) > 0)
                                      $(".igstText").show();
                              }
                          }
                      }
                  } else {
                      for (var key in wayBillTaxTxnHM) {
                          if(key == SERVICE_TAX_MASTER_ID) {
                              $("*[data-hidetbbpaidgstamount='serviceTax']").html(wayBillTaxTxnHM[key].taxAmount);
                              $("*[data-hidetbbgstamount='serviceTax']").html(wayBillTaxTxnHM[key].taxAmount);
                          }
                          
                          if(key == SGST_MASTER_ID) {
                              $("*[data-hidetbbpaidgstamount='sgst']").html(Math.round(wayBillTaxTxnHM[key].taxAmount));
                              $("*[data-hidetbbgstamount='sgst']").html(Math.round(wayBillTaxTxnHM[key].taxAmount));
  
                              if(Math.round(wayBillTaxTxnHM[key].taxAmount) > 0)
                                  $(".sgstText").show();
                          }
                          
                          if(key == CGST_MASTER_ID) {
                              $("*[data-hidetbbpaidgstamount='cgst']").html(Math.round(wayBillTaxTxnHM[key].taxAmount));
                              $("*[data-hidetbbgstamount='cgst']").html(Math.round(wayBillTaxTxnHM[key].taxAmount));
  
                              if(Math.round(wayBillTaxTxnHM[key].taxAmount) > 0)
                                  $(".cgstText").show();
                          }
                          
                          if(key == IGST_MASTER_ID) {
                              $("*[data-hidetbbpaidgstamount='igst']").html(Math.round(wayBillTaxTxnHM[key].taxAmount));
                              $("*[data-hidetbbgstamount='igst']").html(Math.round(wayBillTaxTxnHM[key].taxAmount));
  
                              if(Math.round(wayBillTaxTxnHM[key].taxAmount) > 0)
                                  $(".igstText").show();
                          }
                      }
                  }
              }
  
              if(configuration.replaceLrChargesWithTBB == 'true') {
                  var chargeIdArr = (configuration.ChargeIdsExceptionForTBBLabel).split(",");
                  
                  if(wayBillTypeId == WAYBILL_TYPE_CREDIT && chargeTypeModelArr != undefined) {
                      for(var index in chargeTypeModelArr) {
                          if(!isValueExistInArray(chargeIdArr, chargeTypeModelArr[index].chargeTypeMasterId))
                              $("*[data-selector='chargeValue" + chargeTypeModelArr[index].chargeTypeMasterId + "']").html("TBB ");
                      }
  
                      $("*[data-lr='grandTotal']").html("");
                      $("*[data-lr='bookingServicetax']").html("");
                  }
              }
              
              if(configuration.replaceLrChargesWithTBBInZero == 'true') {
                  var chargeIdArr = (configuration.ChargeIdsExceptionForTBBLabel).split(",");
                  
                  if(wayBillTypeId == WAYBILL_TYPE_CREDIT && chargeTypeModelArr != undefined) {
                      for(var index in chargeTypeModelArr) {
                          if(!isValueExistInArray(chargeIdArr, chargeTypeModelArr[index].chargeTypeMasterId))
                              $("*[data-selector='chargeValue" + chargeTypeModelArr[index].chargeTypeMasterId + "']").html("0");
                      }
  
                      $("*[data-lr='grandTotal']").html("0");
                      $("*[data-lr='bookingServicetax']").html("0");
                  }
              }
              
              var allCharges = $(".ChargeRow");
              
              for (var eleCharge = 0; eleCharge < allCharges.length; eleCharge++) {
                  if( allCharges[eleCharge] != undefined) {
                      var id = allCharges[eleCharge].offsetParent.id;
                      
                      if(configuration.replaceLrChargesWithTBB == 'true' && wayBillTypeId == WAYBILL_TYPE_CREDIT) {
                          if(configuration.replaceLrChargeWithTbbInAllCopy == true || configuration.replaceLrChargeWithTbbInAllCopy == "true") {
                              $(".FirstCopy").html("");
                              $(".SecondCopy").html("");	
                          } else if(id == "secondCopyTbody" || id == "thirdCopyTbody") {
                              allCharges[eleCharge].innerHTML = "TBB";
                              $(".grandTotalThirdCopy").html("TBB");
                              $(".grandTotalSecondCopy").html("TBB");
                          } 			
                      }
                  }
              }
               var allCharges = $(".ChargeRow");
              
              for (var eleCharge = 0; eleCharge < allCharges.length; eleCharge++) {
                  if( allCharges[eleCharge] != undefined) {
                      var id = allCharges[eleCharge].offsetParent.id;
                      
                      if(configuration.replaceLrChargesWithblank == 'true' && wayBillTypeId == WAYBILL_TYPE_CREDIT) {
                          if(configuration.replaceLrChargeWithTbbInAllCopy == true || configuration.replaceLrChargeWithTbbInAllCopy == "true") {
                              $(".FirstCopy").html("");
                              $(".SecondCopy").html("");	
                          } else if(id == "secondCopyTbody" || id == "thirdCopyTbody") {
                              allCharges[eleCharge].innerHTML = " ";
                              $(".grandTotalThirdCopy").html(" ");
                              $(".grandTotalSecondCopy").html(" ");
                          } 			
                      }
                  }
              }
              
              if(configuration.replaceZeroAmountChargesWithBlank == 'true') {
                  for (var key in wayBillTaxTxnHM) {
                      if(key == SGST_MASTER_ID && Math.round(wayBillTaxTxnHM[key].taxAmount) <= 0)
                          $("*[data-gst='sgst']").html('');
  
                      if(key == CGST_MASTER_ID && Math.round(wayBillTaxTxnHM[key].taxAmount) <= 0)
                          $("*[data-gst='cgst']").html('');
  
                      if(key == IGST_MASTER_ID && Math.round(wayBillTaxTxnHM[key].taxAmount) <= 0)
                          $("*[data-gst='igst']").html('');
                  }
              }
  
              if((configuration.removeGrandTotalForToPayAndTBB == true || configuration.removeGrandTotalForToPayAndTBB == 'true')
                  && (wayBillTypeId == WAYBILL_TYPE_CREDIT || wayBillTypeId == WAYBILL_TYPE_TO_PAY)
                  && ($("*[data-lr='grandTotal']").html() == '0'))
                      $("*[data-lr='grandTotal']").html('&nbsp;')
  
              var totalGst = responseOut.totalGst;
  
              $("*[data-gst='total']").html(Math.round(totalGst));
              $("*[data-gst='roundOffGst']").html((Math.round(totalGst) - totalGst).toFixed(2));
  
              if(totalGst > 0)
                  $(".gstToBePaidBy").css("display", "block");
              else
                  $(".gstToBePaidBy").css("display", "none");
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

					 if (QRCodePrintType == 'customQRCodePrint_438') {
						dataObjectColl.qrCodeSize = 8;
						dataObjectColl.bodyStyle = "white-space: nowrap;width:80%;font-size:45px;margin-left:80px;margin-top:-30px;padding:0;font-weight:20px;font-weight:bold;font-family:sans-serif;";
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
							
							isPrintIvcargoLableInQRCodePrint = false;

							if (isQrCodePrintBasedOnGSTN || isQrCodePrintBasedOnGSTN == true) {
								if (consigneeGSTN == '' && consignorGSTN == '')
									dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px;"><tr><td style="border-bottom: solid 1px; border-top:none; border-right: solid 1px; padding: 0px 10px 0px 10px;">LR No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.waybillNumber + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To City</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + responseOut.wayBillDestinationCityName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To Branch</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + responseOut.wayBillDestinationBranchName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Qty</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.currentPackage + ' of ' + dataObject.numberOfPackages + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">From</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.sourceFrom + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Type</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.lrType + '</td></tr></table>')({ dataObject: dataObject });
								else
									dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px;"><tr><td colspan="2" style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;text-align:center;">' + accountGroupObj.accountGroupName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">LR No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.waybillNumber + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To City</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + responseOut.wayBillDestinationCityName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To Branch</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + responseOut.wayBillDestinationBranchName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Qty</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.currentPackage + ' of ' + dataObject.numberOfPackages + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">From</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.sourceFrom + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Type</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.lrType + '</td></tr><tr style="width:25%; font-size: 20px;"><td></td><td style="text-align:right; padding: 0px 10px 0px 10px;">IVcargo</td></tr></table>')({ dataObject: dataObject });
							} else {
								if (isPrintIvcargoLableInQRCodePrint || isPrintIvcargoLableInQRCodePrint == true && false) {
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
								} else if (QRCodePrintType == 'customQRCodePrint_438') {
									var consignorName = responseOut.consignorName;
									if (consignorName.length > 12)
										consignorName = consignorName.substring(0, 12);
									if (consigneeName.length > 12)
										consigneeName = consigneeName.substring(0, 12);
									dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px;margin-top:50px;font-size:40px;"><tr><td style="border-bottom: solid 1px; border-left:solid 1px; border-top:solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">LR No:</td><td style="border-bottom: solid 1px; border-left:solid 1px; border-top:solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.waybillNumber + ' - '+ dataObject.numberOfPackages +' </td></tr><tr><td style="border-bottom: solid 1px; border-left:solid 1px; border-top:solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Src Branch Name:</td><td style="border-bottom: solid 1px; border-left:solid 1px; border-top:solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.sourceFrom + '</td></tr><tr><td style="border-bottom: solid 1px; border-left:solid 1px; border-top:solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;"> Dest Branch Name:</td><td style="border-bottom: solid 1px; border-left:solid 1px; border-top:solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">' + responseOut.wayBillDestinationBranchName + '</td></tr><tr><td style="border-bottom: solid 1px; border-left:solid 1px; border-top:solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Consignor Name:</td><td style="border-bottom: solid 1px; border-left:solid 1px; border-top:solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">' +consignorName + '</td></tr><tr><td style="border-bottom: solid 1px; border-left:solid 1px; border-top:solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Consignee Name: </td><td style="border-bottom: solid 1px; border-left:solid 1px; border-top:solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">' + consigneeName + '</td></tr><tr><td style="border-bottom: solid 1px;border-left:solid 1px;border-top:solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Booking Date:</td><td style="border-bottom: solid 1px; border-left:solid 1px; border-top:solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">' + dataObjectColl.bookingDate + ' ' + dataObjectColl.bookingTime + '</td></tr></table>')({ dataObject: dataObject });
									$('#popUpContentForQrCodeOption_438').bPopup({
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
													$(".hideCharges").show();
												else
													$(".hideCharges").hide();
											}
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
								}
								 else {
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

						if (isPrintIvcargoLableInQRCodePrint || isPrintIvcargoLableInQRCodePrint == true && false)
							dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px;"><tr><td colspan="2" style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + accountGroupObj.accountGroupName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">LR No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.waybillNumber + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + destBranchName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Total Qty</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.numberOfPackages + '**</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">From</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + srsBranchName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Type</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.lrType + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Invoice</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + invoiceNumberData + '</td></tr><tr><td></td><td style="text-align:right; padding: 0px 10px 0px 10px;">IVCARGO</td></tr></table>')({ dataObject: dataObject });
						else if (QRCodePrintType == 'customQRCodePrint_565')
							dataObject.htmlTemplate = _.template('<table style="border: solid 1px;verical-align: top;"><tr><td colspan="2" style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;font-size:46px;">' + accountGroupObj.accountGroupName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;font-size:35px;"><span>LR No :</span>&nbsp;&nbsp;&nbsp;<span>' + dataObject.waybillNumber + '</span></td></td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;font-size:35px;"><span>Booking Date:</span>&nbsp;&nbsp;&nbsp;<span>' + dataObjectColl.bookingDate + '</span></td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;font-size:35px;"><span>FromCity :</span>&nbsp;&nbsp;&nbsp;<span>' + dataObject.sourceFrom + '</span></td></td></tr><tr><td style="border-bottom: solid 1px;border-right:solid 1px; padding: 0px 10px 0px 10px;font-size:35px;"><span>ToCity :</span>&nbsp;&nbsp;&nbsp;<span>' + dataObject.destinationTo + '</span></td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;font-size:35px;"><span>Booking Branch:</span>&nbsp;&nbsp;&nbsp;<span>' + dataObjectColl.sourceBranch + '</span></td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;font-size:35px;"><span>Receiver :</span>&nbsp;&nbsp;&nbsp;<span>' + consigneeName + '</span></td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;font-size:35px;"><span>RecMobileNo:</span>&nbsp;&nbsp;&nbsp;<span>' + dataObjectColl.consigneePhn + '</span></td></tr><tr><td style="border-bottom: solid 1px;border-right:solid 1px; padding: 0px 10px 0px 10px;font-size:35px;"><span>Quantity:</span>&nbsp;&nbsp;&nbsp;<span>' + dataObject.numberOfPackages + '</span></td></tr><tr><td style="border-right: solid 1px; padding: 0px 10px 0px 10px;font-size:35px;"><span>Item TYPE:</span>&nbsp;&nbsp;&nbsp;<span>' + dataObject.currentPackingType + '</span></td></tr></table>')({ dataObject: dataObject });
						else
							dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px;"><tr><td colspan="2" style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + accountGroupObj.accountGroupName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">LR No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.waybillNumber + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + destBranchName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Total Qty</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.numberOfPackages + '**</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">From</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + srsBranchName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Type</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + dataObject.lrType + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Invoice</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">' + invoiceNumberData + '</td></tr></table>')({ dataObject: dataObject });

						dataObject.qrCodeString = dataObject.waybillId + "~" + dataObject.waybillNumber + "~" + QR_CODE_USING_WAYBILL_NUMBER + "~" + 0;
						templateArray.push(dataObject);
					}

					if (isQRPrintOnPopUpSelection == "false" || isQRPrintOnPopUpSelection == false) {
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
							if (isQRPrintOnPopUpSelection || isQRPrintOnPopUpSelection == true)
								this.printQRCode(largeTemplateArray[p]);
						}
					} else
						this.printQRCode(templateArray);
				}
			}, printQRCode: function(templateArray) {
				//genericfunction.js
				printQRCode(templateArray);
			}, breakArrays: function(myArray, chunk_size) {
				var results = [];
				results.push(myArray.splice(0, chunk_size));
				return results;
			}, printQRCodeWithoutLimit: async function(templateArray, breakSize) {
			    if (templateArray) {
					if (isQRPrintOnPopUpSelection == "true" || isQRPrintOnPopUpSelection == true) {
						printAllQRCodeWithoutLimit(templateArray);
					}
			    }
			},generatePdf(responseOut, isLrPdfAllow, isPdfExportAllow) {
				var config = responseOut.configuration;
				var accountGroupId = config.accountGroupId;



				if (isLrPdfAllow == true || isLrPdfAllow || isPdfExportAllow == true || isPdfExportAllow) {

					if (responseOut.lrPrintType == 'lrprint_669') {
						$(".fontSize30px").addClass('fontSize17px');
						$(".fontSize20px").addClass('fontSize14px');
						$(".fontSize24px").addClass('fontSize18px');
						$(".fontSize18px").addClass('fontSize10px');
						$("#barCodeHeight").addClass('height92px');
						$("#chargesCol").addClass('height92px');
						$(".printTd").addClass('pdfTd');
						$(".pdfTd").addClass('fontSize12px');

						$(".fontSize10px").removeClass('fontSize18px');
						$(".fontSize14px").removeClass('fontSize20px');
						$(".fontSize17px").removeClass('fontSize30px');
						$(".fontSize18px").removeClass('fontSize24px');
						$("#barcode1 img").css('height', '70px');
						$("#barCodeHeight").addClass('height162px');
						$("#chargesCol").addClass('width30per');
						$("td").css('height', '20px');
						$(".chargeTable").css('height', '350px');
						$(".watermark1").removeClass('hide');
						$(".pdfLogo").removeClass('hide');
						$(".pdfImg").removeClass('hide');
						$("#userName").css('height', '184px');
					}
					if (config.isAllowPhotoSubregionWise || config.isAllowPhotoSubregionWise == true) {
						$("#header").css('width', '100%');

						if (responseOut.wayBillSourceSubregionId == 3728
							|| responseOut.wayBillSourceSubregionId == 3840
							|| responseOut.wayBillSourceSubregionId == 37
							|| responseOut.wayBillSourceSubregionId == 40
							|| responseOut.wayBillSourceSubregionId == 41)
							$("#header").attr('src', accountGroupId + '_' + responseOut.wayBillSourceSubregionId + '.png');
					}

					if (config.headerImgPDF || config.headerImgPDF == true) {
						if (responseOut.lrPrintType == 'lrprint_498' || responseOut.lrPrintType == 'lrprint_226') {
							$("#header").attr('src', accountGroupId + '.png');
							$("#header").css('width', '100%');
						}
					}

					if (config.isAllowHeaderImageSubRegionWise || config.isAllowHeaderImageSubRegionWise == true) {
						$("#header").css('width', '100%');

						if (responseOut.wayBillSourceSubregionId == 37 || responseOut.wayBillSourceSubregionId == 41 || responseOut.wayBillSourceSubregionId == 40)
							console.log('hi')
						else
							$("#header").attr('src', '209_40.png');
					}

					$("#header").css('display', 'block');
					$(".dataPdf").hide();
					$(".transportname").hide();
					$(".carriergst").show();

					var _this = this;
					var jsonObject = new Object();
					jsonObject.waybillId = responseOut.wayBillId;
					jsonObject.lrPrint = $("#mainContent").html();

					$("#header").css('display', 'none');
					$("#headerpdfimg").css('display', 'none');
					$(".dataPdf").show();
					$(".transportname").show();
					$(".carriergst").hide();

				}

				if (isLrPdfAllow == true || isLrPdfAllow)
					getJSON(jsonObject, WEB_SERVICE_URL + '/lrPrintWS/generateLRPrintPdfBywayBillId.do?', _this.getResponse, EXECUTE_WITHOUT_ERROR);
				else if (isPdfExportAllow == true || isPdfExportAllow)
					getJSON(jsonObject, WEB_SERVICE_URL + '/lrPrintWS/generateLRPrintPdfExportByWayBillId.do?', _this.getResponseAfterExport, EXECUTE_WITH_ERROR);
			}, getResponseAfterExport(response) {
				generateFileToDownload(response);//calling from genericfunction.js
			}, getResponse() {
				hideAllMessages();
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

				if (responseOut.chargeTypeId == CHARGETYPE_ID_QUANTITY) {
					for (var index in consignmentArr) {
						if (consignmentArr[index].visibleRate != undefined && consignmentArr[index].visibleRate != 0)
							visibleFreightAmount += consignmentArr[index].quantity * consignmentArr[index].visibleRate;
						else if (consignmentArr[index].amount != 0)
							visibleFreightAmount += consignmentArr[index].quantity * consignmentArr[index].amount;
					}
				} else if (responseOut.chargeTypeId == CHARGETYPE_ID_WEIGHT) {
					if (visibleWeightRate != undefined && visibleWeightRate != 0)
						visibleFreightAmount += chargeWeight * visibleWeightRate;
					else
						visibleFreightAmount += chargeWeight * weightFreightRate;
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
								.append(i + " of " + length).append("<br>")
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
  
  