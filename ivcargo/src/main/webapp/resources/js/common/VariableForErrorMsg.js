/**
 * @Author Anant Chaudhary	13-10-2015
 */

var errorDivId				= 'basicError';
var iconForErrMsg			= '<i class="fa fa-times-circle"></i>';
var iconForSuccessMsg		= '<i class="fa fa-check"></i>';
var iconForInfoMsg			= '<i class="fa fa-info-circle"></i>';
var iconForWarningMsg		= '<i class="fa fa-warning"></i>';
var iconForQuestionMsg		= '<i class="fa fa-question"></i>';
var openFontTag				= '<font size="5" color="red">';
var closeFontTag			= '</font>';

//Common variable

var tempWeightErrMsg						= iconForErrMsg+' Please, Enter Weight !';
var actWeightErrMsg							= iconForErrMsg+' Please, Enter Actual Weight !';
var wgtFrghtRateErrMsg						= iconForErrMsg+' Please, Enter Weight Rate !';
var actUnloadWeightErrMsg					= iconForErrMsg+' Please, Enter Act. Unload Weight !';
var addConsignmentErrMsg					= iconForErrMsg+' Please, Add at least one Consignment !';
var addressErrMsg							= iconForErrMsg+' Please, Enter Address !';
var amountEnterErrMsg						= iconForErrMsg+' Please, Enter Amount.';
var amountGTZeroInfoMsg						= iconForInfoMsg+' Amount Must be Greater than 0 !';
var areaSelectErrMsg						= iconForErrMsg+' Please, Select Area !';
var hsnCodeErrMsg							= iconForErrMsg+' Please, Select HSN Code !';
var articleTypeErrMsg						= iconForErrMsg+' Plaese, Select Article Type !';
var agentNameErrMsg						    = iconForErrMsg+' Please Enter Agent Name!';
var bankErrMsg								= iconForErrMsg+' Please, Select Bank !';
var bankNameErrMsg							= iconForErrMsg+' Please, Select Proper Bank Name !';
var billErrMsg						        = iconForErrMsg+' Please, Select Bills !';
var billNumberErrMsg						= iconForErrMsg+' Please, Enter Bill Number.';
var billingPartyErrMsg						= iconForErrMsg+' Please, Select Billing Party !';
var billToCancelErrMsg						= iconForErrMsg+' Please, select the Bill to cancle.';
var billAmountForReceiveErrMsg	  		    = iconForErrMsg+' Please, Provide atleast one Bill Amount for Receive Payment !!';
var bookingTypeErrMsg						= iconForErrMsg+' Please, Select Booking Type !';
var branchAlreadyExistInfoMsg				= iconForInfoMsg+ 'This Branch already exists !';
var branchNameErrMsg						= iconForErrMsg+' Please, Select Branch Name !';
var branchNameErrMsg1						= iconForErrMsg+' Please, Enter Branch Name !';
var branchCodeAlreadyExistInfoMsg           = iconForInfoMsg+ 'This Branch Code already exists!';
var breadthErrMsg							= iconForErrMsg+' Please, Enter Breadth !';

var chargeErrMsg							= iconForErrMsg+' Please, Select Charge !';
var chargeNameErrMsg						= iconForErrMsg+' Please, Enter Charge Name!';
var chargeErrMsg1							= iconForErrMsg+' Please, Select Atleast One Charge !';
var chargeTypeErrMsg						= iconForErrMsg+' Please, Select Charge Type!';
var chargeWeightErrMsg						= iconForErrMsg+' Please, Enter Charge Weight!';
var capacityErrMsg	   					    = iconForErrMsg+' Please, Enter the Capacity !';
var chequeAmountErrMsg						= iconForErrMsg+' Please, Enter Cheque Amount !';
var chequeDateErrMsg						= iconForErrMsg+' Please, Enter Cheque Date !';
var chequeNumberErrMsg						= iconForErrMsg+' Please, Enter Cheque No. !';
var cityNameErrMsg							= iconForErrMsg+' Please, Select City !';

var collectionPersonErrMsg					= iconForErrMsg+' Please, Select Collection Person !';
var collectionPersonErrMsg1					= iconForErrMsg+' Please, Provide Collection Person Name !';
var commodityTypeErrMsg						= iconForErrMsg+' Please, Select Commodity Type !';
var consineeAddressErrMsg					= iconForErrMsg+' Please, Enter Valid Consignee Address !';
var consineeMobileNumberErrMsg				= iconForErrMsg+' Please, Enter Consignee Mobile no !';
var consineeMobileNumberLenErrMsg			= iconForErrMsg+' Please, Enter 10 Digit Consinee Mobile no !';
var consineeNameErrMsg						= iconForErrMsg+' Please, Enter Consignee Name !';
var consineePartyAlreadyExist				= iconForInfoMsg+' Consinee Party already Exist, Please enter different name !';
var consinorMobileNumberErrMsg				= iconForErrMsg+' Please, Enter Consignor Mobile no !';
var consinorMobileNumberLenErrMsg			= iconForErrMsg+' Please, Enter 10 Digit Consinor Mobile no !';
var consinorNameErrMsg						= iconForErrMsg+' Please, Enter Consignor Name !';
var consinorPartyAlreadyExist				= iconForInfoMsg+' Consinor Party already Exist, Please enter different name !';
var consigneePincodeErrMsg					= iconForErrMsg+' Please, Enter Consignee Pincode !';
var consignorPincodeErrMsg					= iconForErrMsg+' Please, Enter Consignor Pincode !';
var crNumberErrMsg							= iconForErrMsg+' Please, Enter CR Number !';

var consinorTinNumberErrMsg					= iconForErrMsg+' Please, Enter Consignor Tin Number !';
var consineeTinNumberErrMsg					= iconForErrMsg+' Please, Enter Consignee Tin Number !';
var consineeTinNumberLenErrMsg				= iconForErrMsg+' Please, Enter 11 Digit Consignee Tin Number !';
var consinorTinNumberLenErrMsg				= iconForErrMsg+' Please, Enter 11 Digit Consignor Tin Number !';
var corporateAccountErrMsg		     		= iconForErrMsg+' Please, Select Corporate Account !';
var creditorSelectErrMsg		       		= iconForErrMsg+' Please, Select Creditor !';
var crossingAgentErrMsg		        		= iconForErrMsg+' Please, Select Crossing Agent !';

var dataSelectErrMsg		        		= iconForErrMsg+' Please, Select Type Of Data';
var dateInProperFormatErrMsg				= iconForErrMsg+' Please, Insert Date In Proper Format (dd-mm-yyyy) !';
var dateErrMsg								= iconForErrMsg+' Please, Enter Date !';

var declaredValueErrMsg						= iconForErrMsg+' Please, Enter Declared Value !';
var deliverdNameErrMsg						= iconForErrMsg+' Please, Select or Enter Delivered To Name !';
var deliverdPhoneNumErrMsg					= iconForErrMsg+' Please, Enter Delivered To PhoneNo !';
var deliveryCreditorErrMsg					= iconForErrMsg+' Please, Select Delivery Creditor';
var destinationBranchErrMsg					= iconForErrMsg+' Please, Select Destination Branch !';
var destinationPincodeErrMsg				= iconForErrMsg+' Please, Enter Destination Pincode !';
var destinationErrMsg						= iconForErrMsg+' Please, Enter Destination !';
var subRegionErrMsg							= iconForErrMsg+' Please, Enter SubRegion Destination !';
var destinationRegionErrMsg					= iconForErrMsg+' Please, Select Destination Region !';
var destinationSubRegionErrMsg				= iconForErrMsg+' Please, Select Destination Sub Region !';
var destinationAreaErrMsg				    = iconForErrMsg+' Please, Select Destination Area !';
var destinationTypeErrMsg					= iconForErrMsg+' Please, Select Destination Type !';
var detailTypeErrMsg						= iconForErrMsg+' Please, Select Detail Type !';
var discountTypeErrMsg						= iconForErrMsg+' Please, Select Discount Type !';
var displayNameErrMsg						= iconForErrMsg+' Please, Select Display Name !';
var doorDeliveryErrMsg						= iconForErrMsg+' Please, Select Door Delivery !';
var expressChargeErrMsg						= iconForErrMsg+' Express Charge Is Required !';
var expressDeliveryErrMsg					= iconForErrMsg+' Please, Select Express Delivery !';
var driverNameErrMsg						= iconForErrMsg+' Please, Enter Driver Name !';
var driveryNumberErrMsg						= iconForErrMsg+' Please, Enter Driver Number !';
var destinationErrMsgForRevereEntry			= iconForErrMsg+' Please, Enter Destination first for Reverse LR booking !';

var emailInfoMsg						    = iconForInfoMsg+' Please, enter a valid email address';
var executiveNameErrMsg						= iconForErrMsg+' Please, Select Executive !';
var executiveNotAvailableInfoMsg			= iconForInfoMsg+' Executive not available !';
var expenseTypeErrMsg						= iconForInfoMsg+' Please, Select Expense Type !';

var form_403_402ErrMsg						= iconForErrMsg+' Please, Select 1st form_403_402 !';
var freightChargeRequired					= iconForErrMsg+' Please, Enter Freight Charge !';
var frieghtUptoDestinationErrMsg			= iconForErrMsg+' Please, Enter Freight Upto Destination !';
var fundTypeErrMsg         	         		= iconForErrMsg+' Please, Select Fund Type !';
var futureDateNotAllowdErrMsg				= iconForErrMsg+' Future Date not allowed !';
var lrDateBeforeForReverseEntry				= iconForErrMsg+' Please enter LR date that is before from Current date for Reverse LR booking!';

var godownErrMsg				            = iconForErrMsg+' Please, First Select Godown !';
var godownDoesNotExistErrMsg				= iconForErrMsg+' Godown Not Found ! Please, create Godown for your Branch !';

var headNameErrMsg							= iconForErrMsg+' Please, Select Valid Head Name!';
var heightErrMsg							= iconForErrMsg+' Please, Enter Height !';
var volumetricFactorErrMsg					= iconForErrMsg+' Select Volumetric Factor !';

var incomeTypeErrMsg						= iconForErrMsg+' Please, Select Income Type !';
var incomeExpSelectErrMsg                   = iconForErrMsg+' Please, Select Income/Expense !';
var invalidCharacterInBranchNameWarningMsg	= iconForWarningMsg+' Inavlid Character In Branch Name !';
var invalidCreditorNameErrMsg				= iconForErrMsg+' Invalid Creditor Name, Please enter again !';
var invoiceNumberErrMsg						= iconForErrMsg+' Please, Enter Invoice No !';
var invoiceDateErrMsg						= iconForErrMsg+' Please, Enter Invoice Date !';

var locationSelectErrMsg					= iconForErrMsg+' Please, Select Valid Location Type !';
var lrSelectToSaveErrMsg					= iconForErrMsg+' Please, Select LRs To Save !';
var lrSelectTypeErrMsg						= iconForErrMsg+' Please, Select LR Type';
var lrSelectErrMsg							= iconForErrMsg+' Please, Select the LR.';
var lengthErrMsg							= iconForErrMsg+' Please, Enter Length !';

var mobileNumberErrMsg						= iconForErrMsg+' Please, Enter Mobile no !';
var mobileNumberLenErrMsg					= iconForInfoMsg+' Please, Enter 10 digits Mobile No !';
var manualLSNumberErrMsg					= iconForErrMsg+' Please Enter Manual LS Number !';

var nameErrMsg								= iconForErrMsg+' Please, Enter Name !';
var noLSToDeleteInfoMsg						= iconForInfoMsg+' There is no LS to delete !';
var numberErrMsg							= iconForErrMsg+' Please, Enter Number !';

var panNumberErrMsg							= iconForErrMsg+' Please, Enter PAN Number !';
var packingTypeErrMsg						= iconForErrMsg+' Please, Select Packing Type !';
var packingGroupErrMsg						= iconForErrMsg+' Please, Select Packing Group !';
var packingTypeAddedSuccessMsg				= iconForSuccessMsg+ ' Packing Type Added Successfully !';
var packingTypeAlreadyExistInfoMsg			= iconForWarningMsg+ ' Packing Type Already Exists ! Please Search And Add To Group';
var packingTypeNameErrMsg					= iconForErrMsg+ ' Please, Enter Packing Type Name !';
var packingTypeAddedToGroupInfoMsg			= iconForInfoMsg+ ' Packing Type Added to Group !';
var packingTypeAddedAndMapInfoMsg			= iconForInfoMsg+ ' Packing Type Added to Group And Mapping Also Done !';
var packingTypeUpdateInfoMsg				= iconForInfoMsg+ ' Packing Type Updated Successfully !';
var packingTypeDeleteInfoMsg				= iconForInfoMsg+ ' Packing Type Deleted Successfully !';
var packingTypeDeleteFromMappInfoMsg		= iconForInfoMsg+ ' Packing Type Deleted from Mapping Successfully !';
var packingTypeGrpErrMsg					= iconForErrMsg+ ' Please, Select Packing Type Group !';
var partyNameErrMsg							= iconForErrMsg+ ' Please, Enter Party Name !';
var partyAlreadyExist						= iconForWarningMsg+ ' Party already Exist, Please enter different name !';
var partyAddedSuccessInfoMsg				= iconForInfoMsg+ ' Party added successfully !';
var partyUpdatedSuccessInfoMsg				= iconForInfoMsg+ ' Party updated successfully !';
var partyNotFoundInfoMsg					= iconForInfoMsg+ ' Party not found !';
var partyTypeErrMsg							= iconForErrMsg+ ' Please, Select Party Type !';
var paymentTypeErrMsg						= iconForErrMsg+' Please, Select Payment Type !';
var phoneNumberIncorrectErrMsg				= iconForErrMsg+ ' Phone Number may be incorrect, Please Check !';
var phoneNumberErrMsg				        = iconForErrMsg+ ' Please, Enter Valid Phone/Mobile Number !';
var pincodeLengthInfoMsg					= iconForInfoMsg+ ' Please, Enter 6 digit Pincode !';
var privateMarkErrMsg						= iconForErrMsg+' Please, Enter Private Mark !';
var deliveryAtErrMsg						= iconForErrMsg+' Please, Select DeliveryAt !';
var stPaidByErrMsg							= iconForErrMsg+' Please, Select StPaidBy !';
var properBranchNameErrMsg					= iconForErrMsg+' Please, Select Proper Branch !';
var properExpenseTypeErrMsg					= iconForErrMsg+' Please, Select Proper Expense Type !';
var properDeliveredToName					= iconForErrMsg+' Please, Select or Insert Proper Delivered To Name !';
var properDeliveryCreditorNameErrMsg		= iconForErrMsg+' Please, Select or Insert proper Delivery Creditor !';
var properDestinationErrMsg					= iconForErrMsg+' Please, Enter proper Destination !';
var properSubRegionDestinationErrMsg		= iconForErrMsg+' Please, Enter proper SubRegion Destination !';
var properFrieghtUptoDestinationErrMsg		= iconForErrMsg+' Please, Enter proper Freight Upto Destination !';
var properIncomeTypeErrMsg					= iconForErrMsg+' Please, Select Proper Income Type !';
var properSaidToContaionErrMsg				= iconForErrMsg+' Please, Select Proper Contains!';
var properTruckNumberErrMsg					= iconForErrMsg+' Please, Select Proper Truck Number';

var quantityAmountErrMsg					= iconForErrMsg+' Please, Enter Quantity Amount !';
var quantityErrMsg							= iconForErrMsg+' Please, Enter Quantity !';

var lrNumberErrMsg							= iconForErrMsg+' Please, Enter LR Number !';
var lsNumberErrMsg							= iconForErrMsg+' Please, Enter LS Number !';
var tlNumberErrMsg							= iconForErrMsg+' Please, Enter TL Number !';

var receiveDocumentsErrMsg					= iconForErrMsg+' Please, Receive All documents first.';
var receivedAmountErrMsg					= iconForErrMsg+' Please, Provide Received Amount !';
var receivedDeliveryAsErrMsg				= iconForErrMsg+' Please, Select Rcv Dly As !';
var recordNotFoundInfoMsg					= iconForInfoMsg+' Record not Found, Try Again !';

var regionNameErrMsg						= iconForErrMsg+' Please, Select Region !';
var regionNameErrMsg1						= iconForErrMsg+' Region Already Exists. Please Choose Different Name !';
var ramarkErrMsg							= iconForErrMsg+' Please, Enter Remark !';
var reportTypeErrMsg						= iconForErrMsg+' Please Select Report Type !';

var saidToContaionErrMsg					= iconForErrMsg+' Please, Enter Said To Contain!';
var unitErrMsg								= iconForErrMsg+' Please, Select Unit!'
var sameBillingPartyInfoMsg					= iconForInfoMsg+' You are selecting same Billing Party, Please select another Billing Party !';
var sameDestinationBranchInfoMsg			= iconForInfoMsg+' You are selecting same Destination Branch, Please select another Destination Branch !';
var selectAtleasetOneHeadInfoMsg			= iconForInfoMsg+' Please, Select atleast One Head !';
var selectCheckBoxErrMsg					= iconForErrMsg+' Please, Select atleast one check box !';
var sourceBranchErrMsg						= iconForErrMsg+' Please, Select Source Branch !';
var sourceSubRegionErrMsg					= iconForErrMsg+' Please, Select Source SubRegion';
var sourceDestinationBranchErrMsg			= iconForErrMsg+' Please, select Source and Destination Branch.';
var sourceDestinationSubregionErrMsg		= iconForErrMsg+' Please, Select Source SubRegion Or Destination SubRegion !';
var sourceDestinationBranchNotBeSameInfoMsg	= iconForInfoMsg+' Source And Destination Could not be same, Please select another Destination Branch !';
var stateSelectErrMsg						= iconForErrMsg+' Please, select State first!';
var stPaidByErrMsg							= iconForErrMsg+' Please, Select or Enter ST Paid By !';
var deliverySTPaidByErrMsg					= iconForErrMsg+' Please Select Delivery ST Paid By !';
var stPaidByTransporterErrMsg				= iconForErrMsg+' Please, Select ST Paid By Transporter !';
var subBranchNameErrMsg						= iconForErrMsg+' Please, Select SubBranch !';
var subRegionNameErrMsg						= iconForErrMsg+' Please, Select Sub-Region !';
var subRegionEnterNameErrMsg				= iconForErrMsg+' Please, Enter Sub Region Name!';

var tanNumberErrMsg							= iconForErrMsg+' Please, Enter TAN Number !';
var timeDurationErrMsg						= iconForErrMsg+' Please, Select Time Duration !';
var tinNumberErrMsg							= iconForErrMsg+' Please, Enter Tin Number !';
var tinNumberLenErrMsg						= iconForErrMsg+' Please, Enter 11 Digit Tin Number !';
var trafficCongErrMsg						= iconForErrMsg+' Please, Select Traffic Configuration.';
var transactionTypeErrMsg					= iconForErrMsg+' Please, Select Transaction Type !';
var transferToErrMsg					    = iconForErrMsg+' Please, Select Transfer To !';
var truckDestinationBranchErrMsg			= iconForErrMsg+' Please, Select a Truck Destination Branch !';
var driverMasterErrMsg						= iconForErrMsg+' Please, Select a Driver From Master !';
var truckNumberErrMsg						= iconForErrMsg+' Please, Select Truck Number !';
var WeighBridgeErrMsg						= iconForErrMsg+' Please, Enter Weigh Bridge !';

var truckTypeErrMsg							= iconForErrMsg+' Please, Select Truck Type !';
var turNumberErrMsg							= iconForErrMsg+' Please, Enter TUR Number !';
var turAlreadyCreatedInfoMsg				= iconForInfoMsg+' TUR number already created for current year. Please enter another TUR number !';
var typeSelectErrMsg			        	= iconForErrMsg+' Please, Select Type !';

var WeightRateErrMsg			        	= iconForErrMsg+' Article rate - weight should be less than or equal to 25 KG and for Weight rate - weight should be greater than 25 KG !';
var ArticleWeightErrMsg			        	= iconForErrMsg+' Article Rate Invalid For Weight !';

var validBranchNameErrMsg					= iconForErrMsg+' Please, Enter Valid Branch !';
var validBillingPartyErrMsg					= iconForErrMsg+' Please, Enter valid Billing Party !';
var validCollectionPersionErrMsg			= iconForErrMsg+' Please, Provide valid Collection Person !';
var validConsineeMobileErrMsg				= iconForErrMsg+' Please, Enter valid Consignee MOBILE No. !';
var validConsineePartyErrMsg				= iconForErrMsg+' Please, Enter valid Consignee Party. !';
var validConsigneePincodeErrMsg				= iconForErrMsg+' Please, Enter Valid Consignee Pincode !';
var validConsinorMobileErrMsg				= iconForErrMsg+' Please, Enter valid Consignor MOBILE No. !';
var validConsinorNameErrMsg					= iconForErrMsg+' Please, Enter Valid Consignor Name !';
var validCreditorErrMsg						= iconForErrMsg+' Please, Enter valid Creditor !';
var validDateErrMsg							= iconForErrMsg+' Please, Enter valid date !';
var validLRNumberErrMsg						= iconForErrMsg+' Please, Provide valid LR Number !';
var validMobileNumberErrMsg					= iconForErrMsg+' Please, Enter Valid Mobile Number !';
var validPanNumberErrMsg					= iconForErrMsg+' Invalid, PAN Card Number !';
var validTanNumberErrMsg					= iconForErrMsg+' Invalid, TAN Card Number !';
var validPartyNameErrMsg					= iconForErrMsg+' Please, Enter Valid Party Name!';
var validPhoneNumberErrMsg					= iconForErrMsg+' Please, Enter Valid Phone Number !';
var validSourceBranchErrMsg					= iconForErrMsg+' Please, Select Valid Source Branch !';

var vehicleNumberErrMsg						= iconForErrMsg+' Please, Enter Truck Number !';
var vehicleNumberErrMsg1					= iconForErrMsg+' Please, Select Vehicle No. !';
var vehicleNumberInfoMsg					= iconForInfoMsg+' Vehicle Agent Already Exists. Please Choose Different Name !';
var vehicleNumberErrorMsg					= iconForInfoMsg+' Vehicle Number Already Exists. Please Choose Different Name !';
var vehicleAgentErrorMsg					= iconForInfoMsg+' Vehicle Agent Already Exists. Please Choose Different Name !';
var vehicleTypeErrorMsg						= iconForInfoMsg+' Vehicle Type Already Exists. Please Choose Different Name !';
var wayBillNumberErrMsg						= iconForErrMsg+' Please, Enter Way Bill Number !';
var eSugamNumberErrMsg						= iconForErrMsg+' Please, Enter E-Sugam Number !';
var eSugamNumberLenErrMsg					= iconForErrMsg+' Please, Enter 11 Digit E-Sugam Number !';
var wayBillSelectErrMsg		            	= iconForErrMsg+' Please, Select the waybill !';
var eWaybillNumberLenErrMsg					= iconForErrMsg+' Please, Enter 12 digit E-Waybill Number !';

var topayBookingNotAllowedForBranch			= iconForInfoMsg+' Topay Booking is not allowed for this destination branch  !';
var validConsignorPhoneOrMobileNumber		= iconForErrMsg+' Please Enter Valid Consignor Mobile / Land Line number !';
var validConsigneePhoneOrMobileNumber		= iconForErrMsg+' Please Enter Valid Consignee Mobile / Land Line number !';
var validConsinorAndConsigneeMobileErrMsg	= iconForErrMsg+' Please, Enter valid Either Consignor And Consignee MOBILE No. !';
var doorDeliveyAddressErrMsg				= iconForErrMsg+' Please, Enter Door Delivey Address !';
var invalidCollectionPersonNameErrMsg		= iconForErrMsg+' Invalid Collection Person Name, Please enter again !';
var driverPhoneNumErrMsg					= iconForErrMsg+' Please, Enter Driver To PhoneNo !';

function lrNumberNotFound(wayBillNumber) {
	var lrNumberInfoMsg						= iconForInfoMsg+' LR Number ' + openFontTag +  wayBillNumber + closeFontTag + ' Not Found !';	
	return lrNumberInfoMsg;
}

function recordNotFoundForLrNumber(wayBillNumber) {
	var recordNotFoundForLrNumber			= iconForInfoMsg+' No record found for this LR Number ' + openFontTag +  wayBillNumber + closeFontTag + ', Please try again !';	
	return recordNotFoundForLrNumber;
}

function lsNumberNotFound(lsNumber) {
	var lsNumberInfoMsg						= iconForInfoMsg+' LS Number ' + openFontTag +  lsNumber + closeFontTag + ' Not Found !';	
	return lsNumberInfoMsg;
}

function lsNumberAlreadyAddedInfoMsg(lsNumber) {
	var lsNumberAlreadyAddedInfoMsg			= iconForInfoMsg+' LS Number ' + openFontTag +  lsNumber + closeFontTag + ' Already Added !';	
	return lsNumberAlreadyAddedInfoMsg;
}

function lsNumberSameInVehicleNumberInfoMsg(lsNumber, vehicleNumber) {
	var lsNumberSameInVehicleNumberInfoMsg	= iconForInfoMsg+' LS Number ' + openFontTag +  lsNumber + closeFontTag + ' should be of same Vehicle Number ' + openFontTag +  vehicleNumber + closeFontTag;	
	return lsNumberSameInVehicleNumberInfoMsg;
}

function articleNotFound(typeOfPacking, lrNumber) {
	var articleTypeInfoMsg					= iconForInfoMsg+' Article ' + openFontTag + typeOfPacking+'</font> Not Found For this LR ' + openFontTag + lrNumber + closeFontTag + ' !';	
	return articleTypeInfoMsg;
}

function actualWeightInfoMsg(actWeight) {
	var actWeightInfoMsg					= iconForInfoMsg+' You can not enter weight more than ' + openFontTag + actWeight + closeFontTag + ' !';	
	return actWeightInfoMsg;
}

function noOfArtToAddInfoMsg(noOfArtToAdd) {
	var noOfArtToAddInfoMsg					= iconForInfoMsg+' You can not enter more than ' + openFontTag + noOfArtToAdd + closeFontTag + ' Articles !';	
	return noOfArtToAddInfoMsg;
}

//Variable for LR

var selectLrErrMsg							= iconForErrMsg+' Please, Select atleast one LR !';
var selectLrToDispatchErrMsg				= iconForErrMsg+' Please, Provide atleast one LR to Dispatch !';
var selectLrToReceiveErrMsg					= iconForErrMsg+' Please, Select atleast one LR to Receive !';
var selectLrToDeliverErrMsg					= iconForErrMsg+' Please, Select atleast one LR to Delivery !';
var lrNumberProperErrMsg					= iconForErrMsg+' LR number not found in system. Please, Enter valid LR number !';

var selectLrAlertMsg						= 'Please, Select atleast one LR !';

//Variable for LR Status
function lrNumberAlreadyAdded(lrNumber) {
	var lrNumberAlreadyAddedInfoMsg			= iconForInfoMsg+' The LR number ' + openFontTag + lrNumber + closeFontTag + ' has been already added once !';	
	return lrNumberAlreadyAddedInfoMsg;
}

function lrNumberAlreadyDelivered(lrNumber) {
	var lrNumberAlreadyDeliveredInfoMsg		= iconForInfoMsg+' The LR number ' + openFontTag + lrNumber + closeFontTag + ' has been already delivered !';	
	return lrNumberAlreadyDeliveredInfoMsg;
}

function lrNumberInBookedStatus(lrNumber) {
	var lrNumberInBookedStatusInfoMsg		= iconForInfoMsg+' This LR number ' + openFontTag + lrNumber + closeFontTag + ' is at booked status !';	
	return lrNumberInBookedStatusInfoMsg;
}

function lrNumberInDispatchedStatus(lrNumber) {
	var lrNumberInDispatchedStatusInfoMsg	= iconForInfoMsg+' This LR number ' + openFontTag + lrNumber + closeFontTag + ' has not been received !';	
	return lrNumberInDispatchedStatusInfoMsg;
}

function lrNumberInCancelledStatus(lrNumber) {
	var lrNumberInCancelledStatusInfoMsg	= iconForInfoMsg+' This LR number ' + openFontTag + lrNumber + closeFontTag + ' has been cancelled !';	
	 return lrNumberInCancelledStatusInfoMsg;
}

//Variable for Short/Excess Module

var shortNumberErrMsg 						= iconForErrMsg+' Please, Enter Short Number !';
var excessNumberErrMsg						= iconForErrMsg+' Please, Enter Excess Number !';
var damageNumberErrMsg						= iconForErrMsg+' Please, Enter Damage Number !';
var lrNumberErrMsg							= iconForErrMsg+' Please, Enter LR Number !';
var lsNumberErrMsg							= iconForErrMsg+' Please, Enter LS Number !';
var turNumberErrMsg							= iconForErrMsg+' Please, Enter TUR Number !';
var privateMarkErrMsg						= iconForErrMsg+' Please, Enter Private Mark !';
var deliveryAtErrMsg						= iconForErrMsg+' Please, Select DeliveryAt !';
var stPaidByErrMsg							= iconForErrMsg+' Please, Select StPaidBy !';
var subRegionNameErrMsg						= iconForErrMsg+' Please, Select Sub-Region !';
var lounchByPartyErrMsg						= iconForErrMsg+' Please, Enter Lounch By Party !';
var claimAmountErrMsg						= iconForErrMsg+' Please, Enter Claim Amount !';
var claimTypeErrMsg							= iconForErrMsg+' Please, Enter Claim Type !';
var claimPersonErrMsg						= iconForErrMsg+' Please, Enter Claim Discussion Person !';
var claimNumberErrMsg						= iconForErrMsg+' Please, Enter Claim Number !';
var selectErrMsg							= iconForErrMsg+' Please, Select Short Number !';
var lessExcessArtiErrMsg					= iconForErrMsg+' Select Only one short Entry  !';
var excessErrMsg							= iconForErrMsg+' Please, Enter Excess Article !';
var excessMoreThanShortErrMsg				= iconForErrMsg+' Excess Number is more than total Short !';
var articleTypeErrMsg						= iconForErrMsg+' Plaese, Select Article Type !';
var excessArticleErrMsg						= iconForErrMsg+' Please, Enter Excess Article !';
var excessPackingErrMsg						= iconForErrMsg+' Please, Select Article Type !';
var excessWeightErrMsg						= iconForErrMsg+' Please, Enter Excess Weight !';
var actWeightErrMsg							= iconForErrMsg+' Please, Enter Actual Weight !';
var actUnloadWeightErrMsg					= iconForErrMsg+' Please, Enter Act. Unload Weight !';
var shortWeightErrMsg						= iconForErrMsg+' Please, Enter Short Weight !';
var damageWeightErrMsg						= iconForErrMsg+' Please, Enter Damage Weight !';
var shortAmountErrMsg						= iconForErrMsg+' Please, Enter Short Amount !';
var damageAmountErrMsg						= iconForErrMsg+' Please, Enter Damage Amount !';
var shortSettleWayErrMsg					= iconForErrMsg+' Please, Select Short Settlement Type !';
var damageSettleWayErrMsg					= iconForErrMsg+' Please, Select Damage Settlement Type !';
var excessSettleWayErrMsg					= iconForErrMsg+' Please, Select Excess Settlement Type !';
var selectShortDetailsErrMsg				= iconForErrMsg+' Please, Select checkbox to delete Short details !';
var selectDamageDetailsErrMsg				= iconForErrMsg+' Please, Select checkbox to delete Damage details !';
var selectExcessDetailsErrMsg				= iconForErrMsg+' Please, Select checkbox to delete Excess details !';
var lrNumberProperErrMsg					= iconForErrMsg+' LR number not found in system. Please, Enter valid LR number !';

var shortArtGrTErrMsg						= iconForErrMsg+' Short Article can not be greater than Total Article !';
var damageArtGrTErrMsg						= iconForErrMsg+' Damage Article can not be greater than Total Article !';
var shortDamageArtGrTErrMsg					= iconForErrMsg+' Short + Damage Article can not be greater than Total Article !';
var shortArticleErrMsg						= iconForErrMsg+' Please, Enter atleast one Short Article !';
var damageArticleErrMsg						= iconForErrMsg+' Please, Enter atleast one Damage Article !';

var selectCheckBoxErrMsg					= iconForErrMsg+' Please, Select atleast one check box !';

var partyNotFoundInfoMsg					= iconForInfoMsg+' Party not found !';

var settleWithClaimInfoMsg					= iconForInfoMsg+' You cannot settle with claim amount !';
var settleWithNoClaimInfoMsg				= iconForInfoMsg+' You cannot settle with no claim before 1 year !';
var shortEntriesNotFoundInfoMsg				= iconForInfoMsg+' Short entries not found !';
var excessEntriesNotFoundInfoMsg			= iconForInfoMsg+' Excess Entries Not found !';
var turAlreadyCreatedInfoMsg				= iconForInfoMsg+' TUR number already created for current year. Please enter another TUR number !';
var turBranchAndExecutiveBranchSameInfoMsg	= iconForInfoMsg+' For entry short entry TUR branch and Executive branch should be same !';
var otherUserCannotSettleInfoMsg			= iconForInfoMsg+' You do not have right permission to settle other User or Branch Short Article !';
var settleWithClaimOrNoclaimInfoMsg			= iconForInfoMsg+' Please, Settle with Claim or Noclaim !';

var damageEntryDoneSuccessMsg				= iconForSuccessMsg+' Damage Entries saved successfully !';
var shortEntryDoneSuccessMsg				= iconForSuccessMsg+' Short Entries saved successfully !';
var shortSettlementDoneSuccessMsg			= iconForSuccessMsg+' Short Settlement has been done successfully !';
var damageSettlementDoneSuccessMsg			= iconForSuccessMsg+' Damage Settlement has been done successfully !';
var excessSettlementDoneSuccessMsg			= iconForSuccessMsg+' Excess Settlement has been done successfully !';
var excessUpdateSuccessMsg					= iconForSuccessMsg+' Excess Register Detail successfully Updated !';
var selectTypeErrMsg						= iconForErrMsg+' Please, Type !';
var bussinesErrMsg							= iconForErrMsg+' Please Select Business Type !';
var forwardTypeErrMsg						= iconForErrMsg+' Please Select Forward Type !';

function lrNumberWithinRangeInfoMsg(minRange, maxRange) {
	var lrNumberWithinRangeInfoMsg			= iconForInfoMsg+' Please Enter LR Number Within ' + openFontTag + minRange + closeFontTag + ' - ' + openFontTag + maxRange + closeFontTag + ' !';
	return lrNumberWithinRangeInfoMsg;
}

function alreadyEnteredMoreThanTotalArt(shortLrNumber, articleType) {
	var alreadyEnteredMoreThanTotalArt 		= iconForInfoMsg+' You have already entered short and damage article equal to total article for this LR ' + openFontTag + shortLrNumber + closeFontTag + ' and Article ' + openFontTag + articleType + closeFontTag +' !';	
	return alreadyEnteredMoreThanTotalArt;
}

function alreadyEnteredTotalArt(wayBillNum, nonOfArt) {
	var alreadyEnteredTotalArt 				= iconForInfoMsg+' You have already entered total ' + openFontTag + nonOfArt + closeFontTag + ' article for this LR ' + openFontTag + wayBillNum + closeFontTag + ' !';	
	return alreadyEnteredTotalArt;
}

function alreadyEnteredMoreThanTotalShortArt(shortLrNumber, articleType) {
	var alreadyEnteredMoreThanTotalShortArt = iconForInfoMsg+' You have already entered short article equal to total article for this LR ' + openFontTag + shortLrNumber + closeFontTag + ' and Article ' + openFontTag + articleType + closeFontTag + ' !';	
	return alreadyEnteredMoreThanTotalShortArt;
}

function alreadyEnteredMoreThanTotalDamageArt(shortLrNumber, articleType) {
	var alreadyEnteredMoreThanTotalDamageArt = iconForInfoMsg+' You have already entered damage article equal to total article for this LR ' + openFontTag + shortLrNumber + closeFontTag + ' and Article ' + openFontTag + articleType + closeFontTag + ' !';	
	return alreadyEnteredMoreThanTotalDamageArt;
}

function excessEntryDoneSuccessMsg(excessNumber) {
	var excessEntryDoneSuccessMsg			= iconForSuccessMsg+' Excess Entries has been done successfully ! Excess number is ' + openFontTag + excessNumber + closeFontTag;	
	return excessEntryDoneSuccessMsg;
}

function excessNumberAvailable(excessNumber) {
	var excessNumberAvailableMsg			= iconForInfoMsg+' Excess Number ' + openFontTag + excessNumber + closeFontTag + ' is available !';	
	return excessNumberAvailableMsg;
}

function excessNumberNotAvailable(excessNumber) {
	var excessNumberNotAvailable			= iconForInfoMsg+' Excess Number ' + openFontTag + excessNumber + closeFontTag + ' is not available. Please Try other number !';	
	return excessNumberNotAvailable;
}

function excessLRPhotoUploadedSuccessMsg(excessNumber) {
	var excessLRPhotoUploadedSuccessMsg		= iconForSuccessMsg+' Excess LR Photo has been uploaded successfully for this Excess Number ' + openFontTag + excessNumber + closeFontTag + ' !'; 	
	return excessLRPhotoUploadedSuccessMsg;
}

function excessLRPhotoUpdateSuccessMsg(excessNumber) {
	var excessLRPhotoUpdateSuccessMsg		= iconForSuccessMsg+' Excess LR Photo has been updated successfully for this Excess Number ' + openFontTag + excessNumber + closeFontTag + ' !'; 	
	return excessLRPhotoUpdateSuccessMsg;
}

function claimNumberNotFound(claimNumber, lrNumber) {
	var claimNumberInfoMsg					= iconForInfoMsg+' Claim Number ' + openFontTag + claimNumber + closeFontTag + ' , Not Found for This LR ' + openFontTag + lrNumber + closeFontTag + ' !'; 	
	return claimNumberInfoMsg;
}

function claimAlreadyDone(lrNumber) {
	var claimNumberInfoMsg					= iconForInfoMsg+' You have already done Claim for this LR ' + openFontTag + lrNumber + closeFontTag + ' !'; 	
	return claimNumberInfoMsg;
}

function shortDeletedDone(shortNumber) {	
	var shortDeletedSuccesMsg				= iconForInfoMsg+' Short Register Details ' + openFontTag + shortNumber + closeFontTag + ' successfully deleted !';	
	return shortDeletedSuccesMsg;
}

function excessDeletedDone(excessNumber) {	
	var excessDeletedSuccesMsg				= iconForInfoMsg+' Excess Register Details ' + openFontTag + excessNumber + closeFontTag + ' successfully deleted !';	
	return excessDeletedSuccesMsg;
}

function claimDoneSuccessMsg(claimNumber) {
	var claimDoneSuccessMsg					= iconForSuccessMsg+' Claim has been done successfully !'+' Your claim number is '+ openFontTag + claimNumber + closeFontTag;	
	return claimDoneSuccessMsg;
}

function validateToAddTotalShortAndDamageEntry(wayBillNum) {
	var validateToAddTotalShortAndDamageEntry= iconForInfoMsg+' You have already entered Short Article or Damage Article equal to Total Article for this LR ' + openFontTag + wayBillNum + closeFontTag + ' !';
	return	validateToAddTotalShortAndDamageEntry;
}

//Variable for TUR Screen

var configureManualTURDaysWarningMsg		= iconForWarningMsg+' Please Configure Manual TUR Days Allowed For Branch !';
var manualTurErrMsg							= iconForErrMsg+' Please, Enter Manual TUR Number !';
var manualTurDateErrMsg						= iconForErrMsg+' Please Enter Manual TUR Date !';
var manualTurWithinRngeErrMsg				= iconForErrMsg+' Please, Enter Manual TUR Number within a range !';
var manualTurSequenceNotDefinedInfoMsg		= iconForInfoMsg+ ' TUR Manual Sequence not defined !';
var selectUserErrMsg						= iconForErrMsg+' Please, Select user first !';
var selectUnloadedByErrMsg					= iconForErrMsg+' Please, Select Unloaded By !';
var selectUnloadedInErrMsg					= iconForErrMsg+' Please, Select Unloaded In !';
var selectGoDownErrMsg						= iconForErrMsg+' Please, Select Godown !';
var truckArrivalDetailAddedSuccessMsg		= iconForSuccessMsg+ ' Truck Arrived Successfully !';
var truckArrivalDetailAlreadyExistInfoMsg	= iconForInfoMsg+ ' Truck Already Arrived !';
var truckUnloadedByErrMsg					= iconForErrMsg+ ' Please, Enter Truck unloaded by !';

function truckArrivedInfoMsg(arrivalDate, arrivalTime, truckArrivalNumber) {
	if(truckArrivalNumber != undefined){
		var truckArrivedInfoMsg					= iconForInfoMsg+ ' Truck has been arrived at ' + openFontTag + arrivalTime + closeFontTag + ' on ' + openFontTag + arrivalDate + closeFontTag + ' </br> Truck Arrival Number : '+ openFontTag + truckArrivalNumber + closeFontTag + ' !';
	} else {
		var truckArrivedInfoMsg					= iconForInfoMsg+ ' Truck has been arrived at ' + openFontTag + arrivalTime + closeFontTag + ' on ' + openFontTag + arrivalDate + closeFontTag + ' !';
	}
	return truckArrivedInfoMsg;
}

function turNumberCreatedForLsInfoMsg(turNumber) {
	var turNumberCreatedForLsInfoMsg		= iconForInfoMsg+ ' [ TUR No. ' + openFontTag + turNumber + closeFontTag + ' created for this LS ]';
	return turNumberCreatedForLsInfoMsg;
}

function createGodownInfoMsg(branchName) {
	var createGodownInfoMsg					= iconForInfoMsg+ ' Please, Contact to Head Office to Create Godown for this Branch ' + openFontTag + branchName + closeFontTag + ' !';
	return createGodownInfoMsg;
}

//Variable for BranchCrossing Map

var selectBranchesFromLeftErrMsg			= iconForErrMsg+' Please, Select branches from left box !';
var selectCrossingBranchesFromLeftErrMsg	= iconForErrMsg+' Please, Select crossing branches from left box !';
var selectCrossingBranchesFromRightErrMsg	= iconForErrMsg+' Please, Select crossing branches from right box !';
var selectBranchesFromRightErrMsg			= iconForErrMsg+' Please, Select branches from right box !';
var crBranchesNotFoundForSeletedErrMsg		= iconForErrMsg+' Crossing Branches not Found for selected Branch !';

var noBranchFoundToMoveFromLeft				= iconForInfoMsg+' Branches not found to move from left box !';
var noBranchFoundToMove						= iconForInfoMsg+' Branches not found to move from right box !';
var noCrossingBranchFoundToMove				= iconForInfoMsg+' Crossing branches not found to move from right box !';

var crossingBranchMapSaveSuccess			= iconForSuccessMsg+' Crossing Branch Map Detail successfully saved !';
var crossingBranchMapDeleteSuccess			= iconForSuccessMsg+' Crossing Branch Map Detail successfully deleted !';
var crossingBranchMapDeactivatedSuccess		= iconForSuccessMsg+' Crossing Branch Map Detail successfully deactivated !';

var questionToSaveCrossingBranches			= 'Are you sure you want to save Crossing Branches ?';
var questionToDeleteCrossingBranches		= 'Are you sure you want to delete Crossing Branches ?';
var questionToDeactivateCrossingBranches	= 'Are you sure you want to deactivate the Crossing Branches ?';
var questionToRemoveCrossingBranches		= 'Do you want to remove Crossing Branches ?';

function noCrossingBranchFound(branchNames) {
	var crossingBranchNotFound				= iconForInfoMsg+' Crossing Branch not found for this Branch ' + openFontTag + branchNames + closeFontTag;	
	return crossingBranchNotFound;
}

function crossingBranchFound(branchNames) {
	var crossingBranchFoundInfoMsg			= iconForInfoMsg+' Crossing Branch found for this Branch ' + openFontTag + branchNames + closeFontTag;	
	return crossingBranchFoundInfoMsg;
}

//Variable for generate CR Module

var approvedByNameErrMsg					= iconForErrMsg+' Please, Enter Approved By !';
var changePaidLoadingChargeAlertMsg			= 'Please, Change Paid Loading charge with other charge for LR from Edit LR Rate because Paid Loading is only applicable for ToPay LR and after Bill Credit LR Type will Change From ToPay to TBB !';
var configManualDeliverErrMsg				= iconForErrMsg+' Please Configure Manual Delivery Days Allowed For Branch !';
var configManualBokingErrMsg				= iconForErrMsg+' Please Configure Manual Booking Days Allowed For Branch !';
var crNumberNotInRangeErrMsg				= iconForErrMsg+' CR Number not in Range !';
var deliveryDateErlThanBookDateInfoMsg		= iconForInfoMsg+' Delivery Date earlier than booking date not allowed !';
var enterFutureDateErrMsg					= iconForErrMsg+' You can not enter a future date !';
var lrPaymentTypeSameInfoMsg				= iconForInfoMsg+" All LR's Payment Type should be same !";
var manualCrNumberErrMsg					= iconForErrMsg+' Please, Enter Manual CR Number !';
var manualCrDateErrMsg						= iconForErrMsg+' Please, Enter Manual CR Date !';
var manualCrWithinRange						= iconForErrMsg+' Please, Enter Manual CR Number within a range !';
var crNumberAlreadyCreatedInfoMsg			= iconForInfoMsg+' CR number already created for current year. Please enter another CR number !';
var octroiAmtLessThanConfiguredAmtAlertMsg	= 'You can not enter octroi amount less than Configured Amount !';
var lrAccountGroupSameInfoMsg				= iconForInfoMsg+" You can not deliver different account group LR's together!";

function octroiSrvMinInfoMsg(octroiSrvMin) {
	var octroiSrvMinInfoMsg					= iconForInfoMsg+" You can't enter less than " + openFontTag + octroiSrvMin + closeFontTag + " amount !";	
	return octroiSrvMinInfoMsg;
}

function dateTillDayFromTodayInfoMsg(pastDaysAllowed) {
	var dateTillDayFromTodayInfoMsg			= iconForInfoMsg+' Please enter date till ' + openFontTag + pastDaysAllowed + closeFontTag + " days back from today !";	
	return dateTillDayFromTodayInfoMsg;
}

function futureDayFromTodayInfoMsg(futureDaysAllowed) {
	var dateTillDayFromTodayInfoMsg			= iconForInfoMsg+' Please enter future date till ' + openFontTag + futureDaysAllowed + closeFontTag + " days from today !";	
	return dateTillDayFromTodayInfoMsg;
}

//Variable for DDM Module

var deliveryForErrMsg						= iconForErrMsg+' Please, Select Delivery For !';
var ddmNumberErrMsg							= iconForErrMsg+' Please, Enter DDM Number !';
var lorryHireAmountErrMsg					= iconForErrMsg+' Please, Enter Lorry Hire Amount !';
var validDdmNumberErrMsg					= iconForErrMsg+' Please, Enter proper DDM Number !';
var billSelectionErrMsg						= iconForErrMsg+' Please, Select Bill Selection !';
var divisionSelectionErrMsg					= iconForErrMsg+' Please, Please Select Division Type !';

function ddmAlreadySearchedWarningMsg(ddmNumber) {
	var ddmAlreadySearchedWarningMsg		= iconForWarningMsg+' DDM Number ' + openFontTag + ddmNumber + closeFontTag + ' Already Searched !';
	return ddmAlreadySearchedWarningMsg;
}

//Variable for Create WayBill

var addSaidToContainAlertMsg				= 'Said to contain does not exist, do you want to add ?';
var selectionErrMsg							= iconForErrMsg+' Please, Select Selection !';

function chargedWeightLessThanInfoMsg(actualWeight) {
	var chargedWeightLessThanInfoMsg		= iconForInfoMsg+' You can not enter Charged Weight less than ' + actualWeight;
	return chargedWeightLessThanInfoMsg;
}

function freightAmountLessThanInfoMsg(preFreight) {
	var freightAmountLessThanInfoMsg		= iconForInfoMsg+' You Can Not Edit Freight Lower then ' + openFontTag + preFreight + closeFontTag;
	return freightAmountLessThanInfoMsg;
}

function weightRateLessThanInfoMsg(weightRate) {
	var weightRateLessThanInfoMsg			= iconForInfoMsg+' You can not enter Weight Rate less than ' + openFontTag + weightRate + closeFontTag;
	return weightRateLessThanInfoMsg;
}

function qtyAmountLessThanInfoMsg(qtyAmount) {
	var qtyAmountLessThanInfoMsg			= iconForInfoMsg+' You can not enter Qty Amount less than ' + openFontTag + qtyAmount + closeFontTag;
	return qtyAmountLessThanInfoMsg;
}

var fixAmountRequiredErrMsg					= iconForErrMsg+' Fix Amount can not be 0 !';
var freightAmountRequiredErrMsg				= iconForErrMsg+' You can not enter Freight Amount 0 !';
var weightRateRequiredErrMsg				= iconForErrMsg+' Weight Rate can not be 0 !';

function chargeWeightIncreases(increaseChargeWeight) {
	var chargeWeightIncreases				= iconForInfoMsg+ ' ' + increaseChargeWeight + ' kg Charge Weight Increases !';
	return chargeWeightIncreases;
}


//Variable for Create Bill
var createBillAlertMsg						= 'Are you sure you want to Create Bill ?';

function podUploadedToCreateInvoiveInfoMsg(wayBillNumber) {
	var podUploadedToCreateInvoiveInfoMsg	= iconForInfoMsg+ ' You cannot create Bill for This LR No. ' + openFontTag + wayBillNumber + closeFontTag + ' because POD not uploaded !';
	return podUploadedToCreateInvoiveInfoMsg;
}

function podReceivedToCreateInvoiveInfoMsg(wayBillNumber) {
	var podReceivedToCreateInvoiveInfoMsg	= iconForInfoMsg+ ' You cannot create Bill for This LR No. ' + openFontTag + wayBillNumber + closeFontTag + ' because POD not received !';
	return podReceivedToCreateInvoiveInfoMsg;
}

/*
*	Rate Master Variable
*/

var chargeGTZeroInfoMsg						= iconForInfoMsg+' Please, Insert charge greater than zero !';
var ctFormTypeErrMsg						= iconForErrMsg+' Please, Select CT Form Type !';
var ctFormTypeAmountErrMsg					= iconForErrMsg+' Please, Enter Amount For CT Form Type !';
var deleteChargeConfirmMsg					= 'Are you sure you want to Delete Charge ?';
var destinationRegionInfoMsg				= iconForInfoMsg+' Please Select at least 1 destination region';
var destinationAreaInfoMsg					= iconForInfoMsg+' Please Select at least 1 destination area';
var destinationBranchInfoMsg				= iconForInfoMsg+' Please Select at least 1 destination branch';
var formTypeErrMsg							= iconForErrMsg+' Please, Select Form Type !';
var formTypeAmountErrMsg					= iconForErrMsg+' Please, Enter Amount For Form Type !';
var minimumPartyWeightErrMsg				= iconForErrMsg+' Please, Enter minimum Party weight !';
var rateNotFoundInfoMsg						= iconForInfoMsg+' Rates Not Found !';
var rateTypeErrMsg							= iconForErrMsg+' Please, Select rate type !';
var routeAmountErrMsg						= iconForErrMsg+' Please, Enter Amount For Route !';
var saveChargeConfirmMsg					= 'Are you sure you want to save Charge ?';
var saveMinimumAmountConfirmMsg				= 'Are you sure you want to save minimum amount ?';
var selectCategoryType						= iconForErrMsg+' Please, Select category type !';
var selectChargeTypeSection					= iconForErrMsg+' Please, Select Charge Type Section !';
var selectOnlyPartyErrMsg					= iconForErrMsg+' Please, Select only Party !';
var slabErrMsg								= iconForErrMsg+' Please, Select Slab !';
var articleWiseWeightDiffDeletedSuccessMsg	= iconForSuccessMsg+' Article Wise Wieght Difference mapping deleted successfully !';
var selectGSTType							= iconForErrMsg+' Please, Select GST type !';
var enterBookedByErrMsg						= iconForErrMsg+' Please, Enter Booked By Name !';
var selectBranchServiceTypeErrMsg			= iconForErrMsg+' Please, Select Branch Service Delivery Type !';
var selectMixArticleMsg						= iconForErrMsg+' You Cannot Mix FOV Exempted Article!';
var enterMinimumWeightMsg					= iconForErrMsg+' Please, Enter Minimum Weight !';


/*
*	Bill Clearance Variable
*/

var paymentModeErrMsg						= iconForErrMsg+' Please, Select Payment Mode !';
var panNumberErrMsg							= iconForErrMsg+' Please, Insert PAN Number !';
var receivedAmountCantBeBlankErrMsg			= iconForErrMsg+' Received Amount can not be Blank !';
var selectChecqueNoOrTXNNoErrMsg			= iconForErrMsg+' Please, Select Cheque No OR TXN. No !';
var selectBillNumberErrMsg					= iconForErrMsg+' Please, Select Bill Number !';
var partialPaymentTypeErrMsg				= iconForErrMsg+' Please, Select Partial Payment type !';
var txnAmountErrMsg							= iconForErrMsg+' Txn Amount can not be blank !';
var otherPaymentTypeSelectionWarningMsg		= iconForWarningMsg+' You can not select other Payment Type, if you have received total amount !';

function receivedAmtCantBeGTToatlAmtInfoMsg(totalAmount) {
	var receivedAmtCantBeGTToatlAmtInfoMsg	= iconForInfoMsg+' Received Amount cannot be greater than Total Amount ' + openFontTag + totalAmount + closeFontTag + ' !';
	return receivedAmtCantBeGTToatlAmtInfoMsg;
}

function receivedAmtCantBeGTBalanceAmtInfoMsg(balanceAmount) {
	var receivedAmtCantBeGTBalanceAmtInfoMsg= iconForInfoMsg+' Received Amount cannot be greater than Balanace Amount ' + openFontTag + balanceAmount + closeFontTag + ' !';
	return receivedAmtCantBeGTBalanceAmtInfoMsg;
}

function billClearanceNotAllowed(noOfDays) {
	var billClearanceNotAllowed				= iconForInfoMsg+' Bill Clearance Not allowed before ' + openFontTag + noOfDays + closeFontTag + ' Days !';
	return billClearanceNotAllowed;
}

function billNumberAlreadyAddedInfoMsg(billNumber) {
	var billNumberAlreadyAddedInfoMsg		= iconForInfoMsg+' The Bill number ' + openFontTag + billNumber + closeFontTag + ' has already been added once !';
	return billNumberAlreadyAddedInfoMsg;
}

function billAmountExceedInfoMsg(balanceAmt) {
	var billAmountExceedInfoMsg				= iconForInfoMsg+' Enter Amount Not More than ' + openFontTag + balanceAmt + closeFontTag + ' !';
	return billAmountExceedInfoMsg;
}

/*
*	Slab Master Variable
*/

var maxValueGTOneErrMsg						= iconForErrMsg+' Please, Enter max Value Greater Than 1 !';
var minValueGTZeroErrMsg					= iconForErrMsg+' Please, Enter Min Value Greater Than 0 !';
var maxValueGTMinValueErrMsg				= iconForErrMsg+' Please, Enter Max Value Greater Than min value !';
var slabForPartyErrMsg						= iconForErrMsg+' Please, Select Slab For Party !';
var saveSlabConfirmMsg						= 'Are you sure you want to save Slab ?';
var deleteSlabForPartyConfirmMsg			= 'Are you sure you want to Delete Slab For Party ?';
var deleteSlabConfirmMsg					= 'Are you sure you want to Delete Slab ?';
var slabDeletedSuccessMsg					= iconForSuccessMsg+ ' Slab is Deleted !';

function slabIsUsedForPartyWarningMsg(type) {
	return iconForWarningMsg + ' This Slab is Used By Following ' + type + ', Delete That Mapping To Proceed ahead !';
}

/*
	LR View Variable
*/

var updateDestinationConfirmMsg				= 'Are you sure you want change the Destination ?';

/*
 	Transport Search WayBill Variable
 */

var manualLSCancelInfoMsg					= iconForInfoMsg+' You cannot cancel Manual LS !';
var lsCancelAfterLHPVCreationInfoMsg		= iconForInfoMsg+' You cannot cancel LS after LHPV Creation !';
var lsCancelAlertMsg						= 'Are you sure you want to cancel LS ?';

/*
	Sequence counter Variable
*/

var billSelectionErrMsg						= iconForErrMsg+' Please, Please Select Bill Type !';
var minRangeGTZeroErrMsg					= iconForErrMsg+' Min Range Must Be Greater than 0 !'; 
var maxRangeGTZeroErrMsg					= iconForErrMsg+' Max Range Must Be Greater than 0 !'; 
var differentNextValueErrMsg				= iconForErrMsg+' Please Enter the Different Next Value !';
var lrSequnceCounterAlreadyExistInfoMsg		= iconForInfoMsg+' Lr Sequence already exits for another Branch, Please check and provide Different Range !';
var lrSequnceCounterNotFoundInfoMsg			= iconForInfoMsg+' LR Sequence counter not found !';
var lsSequnceCounterNotFoundInfoMsg			= iconForInfoMsg+' LS Sequence counter not found !';
var srcDestWiseSeqCounterNotFoundInfoMsg	= iconForInfoMsg+' WayBill Number not define for Source to Destination, Please add LR number first !';
var firstDestinationBranchErrMsg			= iconForErrMsg+' LR Number not Define for Destination Branch. Please, Define LR Number First !';
var manualLRSequnceAlreadyExistInfoMsg		= iconForInfoMsg+' Manual LR Sequence already exits !';
var manualSequenceCounterAddedSuccessMsg	= iconForSuccessMsg+' Manual Sequence Counter Successfully Added !';
var maxRangeGTMinRangeErrMsg				= iconForErrMsg+' Max Range Must Be Greater then Min Range !';
var nextValueErrMsg							= iconForErrMsg+' Please, Enter the Next Value !';
var nextValueGTMinRangeAndLTMaxRangeInfoMsg	= iconForErrMsg+' Next Value Should be Greater than Min Range And Less than Max Range !';
var sequenceCounterAddedSuccessMsg			= iconForSuccessMsg+' Sequence Counter Successfully Added !';
var updateNextValueSuccessMsg				= iconForSuccessMsg+' Next Value Updated Successfully !';

//Partial Payment On Booking Page
var enterReceivedAmountErrMsg				= iconForErrMsg+' Please Enter Received Amount !';
var enterChequeNumberErrMsg					= iconForErrMsg+' Please Enter Cheque Number !';
var enterBankNumberErrMsg					= iconForErrMsg+' Please Enter Bank Name !';
var enterReceivedAmountEqualErrMsg			= iconForErrMsg+' If You Are Receive Full Amount, Then Please Select Cash Payment Type !';
var enterReceivedAmountExcessErrMsg			= iconForErrMsg+' You Can Not Enter Excess Amount !';

/*
 * 		LHPV Module Variable
 */

function appendLSWithinDaysInfoMsg(lsNumber, appendLSinLHPVWithinDays) {
	var appendLSWithinDaysInfoMsg			= iconForWarningMsg+ ' You cannot append LS Number ' + openFontTag + lsNumber + closeFontTag + ' after ' + openFontTag + appendLSinLHPVWithinDays + closeFontTag + ' days of LHPV Date !'
	return appendLSWithinDaysInfoMsg;
}

function enterDateTillDaysInfoMsg(pastDaysAllowed) {
	var enterDateTillDaysInfoMsg			= iconForInfoMsg+ ' Please enter date till ' + openFontTag + pastDaysAllowed + closeFontTag + ' days back from today !';
	return enterDateTillDaysInfoMsg;
}

function lHPVDateIsEarlierThanLSDateInfoMsg(lsNumber) {
	var lHPVDateIsEarlierThanLSDateInfoMsg	= iconForWarningMsg+ ' LHPV Date is  earlier than LS date Of LS Number ' + openFontTag + lsNumber + closeFontTag + ' not allowed !';
	return lHPVDateIsEarlierThanLSDateInfoMsg;
}

function appendLSInLHPVConfirmMsg(lhpvNo) {
	var appendLSInLHPVConfirmMsg			= 'Are you sure you want to append these LS to LHPV No. ' + lhpvNo + ' ?';
	return appendLSInLHPVConfirmMsg;
}

var addLSAlertMsg							= 'Please add LS first !';
var advanceAmountMTBalanaceAmtWarningMag	= iconForWarningMsg+ ' You can not enter Advance Amount more than Balance Amount !';
var createLHPVConfirmMsg					= 'Are you sure you want to create LHPV ?';
var balancePayableBranchErrMsg				= iconForErrMsg+ ' Please, Select a Balance Payable Branch !';
var balancePayableSubBranchErrMsg			= iconForErrMsg+ ' Please, Select a Balance Payable Sub Branch !';
var branchAsTruckDestinationBranchWarningMag= iconForWarningMsg+ ' You can not select your Branch as Truck Destination Branch !';
var lhpvNumberAlreadyCreatedInfoMsg			= iconForInfoMsg+' LHPV number already created for current year. Please enter another LHPV number !';
var lhpvNumberErrMsg						= iconForErrMsg+ ' Please, Enter LHPV Number !';
var lorryHireAmountLTZeroInfoMag			= iconForInfoMsg+ ' You can not enter Lorry Hire Amount Less then 0 !';
var manualLHPVNumberErrMsg					= iconForErrMsg+ ' Please, Enter Manual LHPV Number !';
var manualLHPVDateErrMsg					= iconForErrMsg+ ' Please, Enter Manual LHPV Date !';
var noLSToDeleteWarningMsg					= iconForWarningMsg+ ' There is no LS to delete !';
var selectLSToAppendInLHPVErrMsg			= iconForErrMsg+ ' Please, Select LS which you want in this LHPV !';
var selectLSToDeleteInfoMsg					= iconForWarningMsg+ ' Please select atleast one LS to delete !';
var validLhpvNumberErrMsg					= iconForErrMsg+' Please, Enter proper LHPV Number !';
var weighBridgeErrMsg						= iconForErrMsg+ ' Please, Enter Weigh Bridge !';
var vehiclePanNumberErrMsg					= iconForErrMsg+ ' Vehicle Pan Number Not Registered Please Update  !';

function manualLHPVNumberWithinRangeInfoMsg(minRange, maxRange) {
	var manualLHPVNumberWithinRangeInfoMsg	= iconForInfoMsg+ ' Please Enter Manual LHPV Number within a Range ' + openFontTag + minRange + closeFontTag + ' - ' + openFontTag + maxRange + closeFontTag + ' !';
	return manualLHPVNumberWithinRangeInfoMsg;
}

/*
		BLHPV Module Variable
*/

var blhpvNumberAlreadyCreatedInfoMsg		= iconForInfoMsg+' BLHPV number already created for current year. Please enter another BLHPV number !';
var manualblhpvDateErrMsg					= iconForErrMsg+' Please Enter Manual BLHPV Date !';
var manualblhpvNumerErrMsg					= iconForErrMsg+' Please Enter Manual BLHPV Number !';
var manualBLHPVWithinRangeInfoMsg			= iconForInfoMsg+' Please Enter Manual BLHPV Number within a range !';

function otherPaymentTypeOnReceivedAmountWarningMsg(totalAmount) {
	var otherPaymentTypeOnReceivedAmountWarningMsg	= iconForWarningMsg+' Please, Select other Payment Type if you received total amount ' + openFontTag + totalAmount + closeFontTag + ' !';
	return otherPaymentTypeOnReceivedAmountWarningMsg;
}

var paymentModeToNameErrMsg					= iconForErrMsg+ ' Please, Enter Payment made to Name !';
/*
		Party Transfer Module Variable
*/

var enterDifferentPartiesErrMsg				= iconForErrMsg+ ' Please, Enter different Parties !';
var enterValidToPartyErrMsg					= iconForErrMsg+ ' Please, Enter valid To Party !';
var enterValidFromPartyErrMsg				= iconForErrMsg+ ' Please, Enter valid From Party !';
var enterPartyNameErrMsg					= iconForErrMsg+ ' Please, Enter Party names !';

/*
		Truck engagement Slip Module Variable
*/

var truckEngagementSlipNumErrMsg			= iconForErrMsg+ ' Please, Insert Truck Engagement Slip Number !';	
var updateKMReadingErrMsg					= iconForInfoMsg+ ' Please, Update kilometer reading first !';
var sameCrossingDestinationBranchInfoMsg	= iconForInfoMsg+ ' Please, Select a Destination Branch matching with Agent Branch !';
var sameCrossingDestinationBranchWarningMsg	= iconForWarningMsg+ ' Selected LRs Drop point not matching with Agent Branch, Please delete that LRs. !';
var doNotAllowToDispatchOtherLRWithDDDv		= iconForInfoMsg+ ' You can not Dispatch Other LR with Direct Delivery Direct Vasuli !';
var doNotAllowToDispatchOtherLRWithDoorDly	= iconForInfoMsg+ ' Door Delivery LRs Not Allowed with Other LRs';
var sameDestinationMultipleDDDVLrError		= iconForInfoMsg+ ' You can not Dispatch Direct Delivery Direct Vasuli LRs With Different Destination !';
var dispatchWithDifferentAgentWarningMsg	= iconForWarningMsg+ " You can not dispatch different Crossing Agent LR's at same time, Please delete that LR's. !";

function enterCrossingHireAmountErrMsg(wayBillNumber) {
	var enterCrossingHireAmountErrMsg		= iconForErrMsg+' Please, Enter Crossing Hire Amount for this LR  ' + wayBillNumber + ' !';
	return enterCrossingHireAmountErrMsg;
}

/**
 *Error Msg constant for Truck Hisab Voucher 
 **/
var truckHisabTruckErrMsg					= iconForErrMsg+ ' Invalid Truck number !';
var DailyAllowanceFromDateErrMsg			= iconForErrMsg+ ' Please, Select Proper From Date!';
var DailyAllowanceToDateErrMsg				= iconForErrMsg+ ' Please, Select Proper To Date!';
var DailyAllowanceTotdaysErrMsg				= iconForErrMsg+ ' Please, Total Number Of Days!';
var DailyDriverAllowanceErrMsg				= iconForErrMsg+ ' Please, Select Proper Driver Allowance!';
var DailyAllowanceToalErrMsg				= iconForErrMsg+ ' Please, Select Proper Total!';
var DailyTollNameErrMsg						= iconForErrMsg+ ' Please, Select Toll Name!';
var DailyTollAmountErrMsg					= iconForErrMsg+ ' Please, Proper Toll Amount!';
var DailyRemarkErrMsg						= iconForErrMsg+ ' Please, Select Remark!';
var MiscNameErrMsg							= iconForErrMsg+ ' Please, Select Misc Name!';
var MiscAmountErrMsg						= iconForErrMsg+ ' Please, Misc Proper Amount!';
var finalErrMsgFLv							= iconForErrMsg+ ' Insert Atlist One Expense!';
var MiscRemarkErrMsg						= iconForErrMsg+ ' Please, Select Remark!';
var DriverErrMsg							= iconForErrMsg+ ' Please, Select Driver!';
var FinalErrMsg								= iconForErrMsg+ ' You can not Settle with Zero(0)!';
var TollDataErrMsg							= iconForErrMsg+ ' Please Enter Truck number !';
/**
 *End for Truck Hisab voucher  
 **/

/* LS Variable */

function manualLsNumberWithinRangeInfoMsg(minRange, maxRange) {
	var manualLsNumberWithinRangeInfoMsg	= iconForInfoMsg+' Please Enter Manual LS Number Within ' + openFontTag + minRange + closeFontTag + ' - ' + openFontTag + maxRange + closeFontTag + ' !';
	return manualLsNumberWithinRangeInfoMsg;
}

var manualLSRangeNotPrrsentInfoMsg			= iconForErrMsg+ ' Manual LS Sequence not Found !';

/* Fund Transfer Varaibale */

var fundReceiveSuccessMsg					= iconForSuccessMsg+ ' Fund Received Successfully done !';
var fundRejectSuccessMsg					= iconForSuccessMsg+ ' Fund Reject Successfully done !';

var partyExpenseForReceiveErrMsg	  		= iconForErrMsg+' Please, select atleast one Party Expense Voucher for Receive payment !';
var packingTypeErrorOnWeight				= iconForInfoMsg+ ' Only Document articles are allowed for weight below 500 grams. ! ';
var gstnErrMsg								= iconForErrMsg+' Please, Enter 15 digit GST Number !';
var gstnValidationErrMsg					= iconForErrMsg+' Please, Enter Valid GST Number !';

function commissionError(agentCommissionValueAllowed) {
	var commissionInfoMsg					= iconForInfoMsg+' You can not enter Commission more than ' + agentCommissionValueAllowed;
	return commissionInfoMsg;
}

var selectFileToUploadErrMsg				= iconForErrMsg+' Please, Select atleast 1 file to upload !';
var validImageFileInfoMsg					= iconForInfoMsg+ ' Please, Select valid image file !';

function maxFileSizeInfoMsg(maxSizeOfFileToUpload) {
	var maxFileSizeInfoMsg					= iconForInfoMsg+ ' File Size cannot be greater than ' + maxSizeOfFileToUpload;
	return maxFileSizeInfoMsg;
}

var taxErrMsg								= iconForInfoMsg+' GST Paid By Transporter Not Allowed !';
var manualCrSequenceErr						= iconForInfoMsg+' CR Manual Sequence not defined !';

function packingGroupError(typeofPackingVal) {
	var	packingGroupErrorMsg						= iconForInfoMsg+'Topay Booking Not Allowed for document '+typeofPackingVal; 
	return packingGroupErrorMsg;
}

var backDateInCurrentMonthOnlyErrMsg		= iconForInfoMsg+'Back Date Allowed Only For Current Month';
var chargeRemarkError						= iconForInfoMsg+'Please enter Remark !';
var expressChargeErr						= iconForInfoMsg+'Charge Value Required !';

var deliveryExecutiveErrMsg					= iconForErrMsg+ 'Please Enter Delivery Executive Name!';
var deliveryExecutiveNumberErrMsg			= iconForErrMsg+ 'Please Enter Delivery Executive Number!';
var eWayBillNumberErrMsg					= iconForErrMsg+ 'Please Enter E-WayBill Number!';
var partySequenceCounterError				= iconForInfoMsg+ 'Party LR Sequence Not Found Normal Sequence Will Be used For LR Booking !';
var expressAmtLessthanFreightError			= iconForInfoMsg+ 'Express Charge Less Than Freight Not Allowed !';
var hsnCodeErrorMsg							= iconForErrMsg+ 'Please Enter HSN Code';
var formTypeSelectionErrorMsg				= iconForErrMsg+ 'Please Select E-WayBill Or HSN Code';
var selectOnlyEWayBillErrorMsg				= iconForErrMsg+ 'You can not change form type other than E-Waybill if Declared Value greater than ';
var selectHSNCodeErrorMsg					= iconForErrMsg+ 'You can not change form type other than HSN Code if Declared Value greater than ';
var enterAnyOneGstnErrorMsg					= iconForErrMsg+ 'Please Enter Consignor Or Consignee Gstn !';
var enterBothGstnErrorMsg					= iconForErrMsg+ 'Please Enter Consignor And Consigneee Gstn !';
var bothPartiesCheckForEstimateBillError	= iconForErrMsg+ 'Consignor And Consignee Party Has GST Number. Please Book With Bill LR !'
var consignorPartyForEstimateBillError		= iconForErrMsg+ 'Consignor Party Has GST Number. Please Book With Bill LR !';
var consigneePartyForEstimateBillError		= iconForErrMsg+ 'Consignee Party Has GST Number. Please Book With Bill LR !';

var enterGstnErrorMsgConsignor              = iconForErrMsg+ 'Please Enter Consignor Gstn !';
var enterGstnErrorMsgConsignee              = iconForErrMsg+ 'Please Enter Consignee Gstn !';
var enterGstnErrorMsgBillingParty           = iconForErrMsg+ 'Please Enter Billing Party Name !';
/* Agent Commission Billing Module Variable */
var NoCommissionOnLRErrorMsg				= iconForErrMsg+ 'Please Enter Commission On LR No. ';

var NoLhpvCreatedForLSErrorMsg				= iconForErrMsg+ 'Before creating LS please create LHPV or append to LHPV for the previously created loading sheet ';
var ddmAlreadyCreatedInfoMsg				= iconForInfoMsg+' DDM number already created for current year. Please enter another DDM number !';
var manualDDMWithinRngeErrMsg				= iconForErrMsg+' Please, Enter Manual DDM Number within a range !';
var manualDDMErrMsg							= iconForErrMsg+' Please, Enter Manual DDM Number !';
var manualDDMDateErrMsg						= iconForErrMsg+' Please Enter Manual DDM Date !';
var configureManualDDMDaysWarningMsg		= iconForWarningMsg+' Please Configure Manual DDM Days Allowed For Branch !';
var otherCharacterAllowWarningMsg			= iconForWarningMsg+' Other character not allowed !';

var minChargeAmountAmountErrMsg				= iconForErrMsg+' Please Enter Minimum Charge Amount !';
var extraChargeAmountPerSqftErrMsg			= iconForErrMsg+' Please Enter Extra Charge Per Sqft Amount !';
var slabWiseLoadingAmounErrMsg				= iconForErrMsg+' Please Enter Loading Charge Amount Per Article !';
var increasedChargeAmounPerKgErrMsg			= iconForErrMsg+' Please Enter Increased Charge Amount Per KG !';
var alphaNumericAllowWarningMsg				= iconForWarningMsg+' Only A-Z and 0-9 allowed, No other Character Allowed !';
var billingBranchErrMsg						= iconForErrMsg+' Please, Enter Billing Branch !';
var openingKilometerErrMsg					= iconForErrMsg+ 'Please Enter Opening Kilometer!';
var eWayBillNumberWarningMsg				= iconForWarningMsg+ 'Declare value is more than 50000 please enter E-way bill number!';


//variable for FTL

var LSDateErlThanLRInfoMsg						= iconForInfoMsg+' LS Date earlier than LR date not allowed !';
var LHPVDateErlThanLSInfoMsg					= iconForInfoMsg+' LHPV Date earlier than LS date not allowed !';
var InvoiceDateErlThanLSInfoMsg					= iconForInfoMsg+' INVOICE Date earlier than LR date not allowed !';

var validInterBranchLSNumberErrMsg			= iconForErrMsg+' Please, Enter proper Inter Branch LS Number !';
var PartyAdvDateErlThanLSInfoMsg				= iconForInfoMsg+' PARTY ADV Date earlier than INVOICE date not allowed !';
var PartyAdvDateErrMsg							= iconForInfoMsg+' Please, Enter Party Advance Date !';
var InvoiceBalnceErrMsg							= iconForInfoMsg+' Advance Amount Cannot be Greater than Invoice Value !';
var panNoErrMsg									= iconForErrMsg+' Please, Enter Valid Pan Number !';

var subCommodityErrMsg						= iconForErrMsg+' Plaese, Select Sub Commodity Type !';


function blockGSTNumberErrorMsg(gstn) {
	return iconForErrMsg +' Booking not allowed for this GST No ' + gstn;
}

var cannotLeftBlankMsg		= 'Cannot be left blank';
var shouldBeNumericMsg		= 'Should be numeric';

function validPartyNameErrorMsg(elementName) {
	return iconForErrMsg + ' Please, Enter Valid ' + elementName + ' Name !';
}

function consineeAddressErrorMsg(elementName) {
	return iconForErrMsg + ' Please, Enter ' + elementName + ' Address !';
}

function consineeAddressErrorLengthMsg(elementName,length) {
	return iconForErrMsg + ' Please, Enter Minimum '+length +' Characters For' + elementName + ' Address !';
}

var sameGroupErrMsg		= iconForWarningMsg + " From and To AccountGroup will not be same !";

function blockMobileNumberErrorMsg(mobNo) {
	return iconForErrMsg +' Booking not allowed for this Mobile No ' + mobNo;
}

function ewayBillNumberErrorMsgOnDeclareValue(declareValue) {
	return iconForErrMsg + 'Declare value is more than ' + declareValue + ' please enter E-way bill number!';
}

function ewayBillNumberWarningMsgOnDeclareValue(declareValue) {
	return iconForWarningMsg + 'Declare value is more than ' + declareValue + ' please enter E-way bill number!';
}

function podUploadedRequiredForDispatch(wayBillNumber, deliveryDateString) {
	return iconForInfoMsg+ ' Please Upload POD For Following LR : ' + '<font size="5" color="white">' + '<strong>' + wayBillNumber + '</strong>' + " With Date : " + '<strong>' + deliveryDateString + '</strong>' + '</font>';
}

var validRCErorMsg				= iconForErrMsg + ' RC For This Vehicle Is Expired, Please Select Different Vehicle !';
var lrAccountGroupSameInfoMsg	= iconForInfoMsg + " You can not deliver different account group LR's together!";
var validateLSReceiveErrMsg		= iconForErrMsg + " You don't have permission to Receive Loading Sheet !";