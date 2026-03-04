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
var actUnloadWeightErrMsg					= iconForErrMsg+' Please, Enter Act. Unload Weight !';
var addConsignmentErrMsg					= iconForErrMsg+' Please, Add at least one Consignment !';
var addressErrMsg							= iconForErrMsg+' Please, Enter Address !';
var amountEnterErrMsg						= iconForErrMsg+' Please, Enter Amount.';
var amountGTZeroInfoMsg						= iconForInfoMsg+' Amount Must be Greater than 0 !';
var areaSelectErrMsg						= iconForErrMsg+' Please, Select Area !';
var articleTypeErrMsg						= iconForErrMsg+' Plaese, Select Article Type !';
var agentNameErrMsg						    = iconForErrMsg+' Please Enter Agent Name!';
var bankErrMsg								= iconForErrMsg+' Please, Select Bank !';
var bankNameErrMsg							= iconForErrMsg+' Please, Select Proper Bank Name !';
var billErrMsg						        = iconForErrMsg+' Please, Select Bills !';
var billNumberErrMsg						= iconForErrMsg+' Please, Enter Bill Number.';
var billingPartyErrMsg						= iconForErrMsg+' Please, Select Billing Party !';
var billToCancelErrMsg						= iconForErrMsg+' Please, select the Bill to cancle.';
var billAmountForReceiveErrMsg	  		    = iconForErrMsg+' Please, provide atleast one Bill Amount for Receive payment !!';
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
var consineeAddressErrMsg					= iconForErrMsg+' Please, Enter Consinee Address !';
var consineeMobileNumberErrMsg				= iconForErrMsg+' Please, Enter Consinee Mobile no !';
var consineeMobileNumberLenErrMsg			= iconForErrMsg+' Please, Enter 10 Digit Consinee Mobile no !';
var consineeNameErrMsg						= iconForErrMsg+' Please, Enter Consignee Name !';
var consineePartyAlreadyExist				= iconForInfoMsg+' Consinee Party already Exist, Please enter different name !';
var consinorMobileNumberErrMsg				= iconForErrMsg+' Please, Enter Consignor Mobile no !';
var consinorMobileNumberLenErrMsg			= iconForErrMsg+' Please, Enter 10 Digit Consinor Mobile no !';
var consinorNameErrMsg						= iconForErrMsg+' Please, Enter Consignor Name !';
var consinorPartyAlreadyExist				= iconForInfoMsg+' Consinor Party already Exist, Please enter different name !';
var crNumberErrMsg							= iconForErrMsg+' Please, Enter CR Number !';

var consinorTinNumberErrMsg					= iconForErrMsg+' Please, Enter Consignor Tin Number !';
var consineeTinNumberErrMsg					= iconForErrMsg+' Please, Enter Consignee Tin Number !';
var consineeTinNumberLenErrMsg				= iconForErrMsg+' Please, Enter 11 Digit Consignee Tin Number !';
var consinorTinNumberLenErrMsg				= iconForErrMsg+' Please, Enter 11 Digit Consignor Tin Number !';
var corporateAccountErrMsg		     		= iconForErrMsg+' Please, Select Corporate Account !';
var creditorSelectErrMsg		       		= iconForErrMsg+' Please, Select Creditor !';
var crossingAgentErrMsg		        		= iconForErrMsg+' Please Enter Crossing Agent !';

var dataSelectErrMsg		        		= iconForErrMsg+' Please, Select Type Of Data';
var dateInProperFormatErrMsg				= iconForErrMsg+' Please, Insert Date In Proper Format (dd-mm-yyyy) !';
var dateErrMsg								= iconForErrMsg+' Please, Enter Date !';

var declaredValueErrMsg						= iconForErrMsg+' Please, Enter Declared Value !';
var deliverdNameErrMsg						= iconForErrMsg+' Please, Select or Enter Delivered To Name !';
var deliverdPhoneNumErrMsg					= iconForErrMsg+' Please, Enter Delivered To PhoneNo !';
var deliveryCreditorErrMsg					= iconForErrMsg+' Please, Select Delivery Creditor';
var destinationBranchErrMsg					= iconForErrMsg+' Please, Select Destination Branch !';
var destinationErrMsg						= iconForErrMsg+' Please, Enter Destination !';
var subRegionErrMsg							= iconForErrMsg+' Please, Enter SubRegion Destination !';
var destinationRegionErrMsg					= iconForErrMsg+' Please, Select Destination Region !';
var destinationSubRegionErrMsg				= iconForErrMsg+' Please, Select Destination Sub Region !';
var destinationAreaErrMsg				    = iconForErrMsg+' Please, Select Destination Area !';
var destinationTypeErrMsg					= iconForErrMsg+' Please, Select Destination Type !';
var discountTypeErrMsg						= iconForErrMsg+' Please, Select Discount Type !';
var displayNameErrMsg						= iconForErrMsg+' Please, Select Display Name !';
var detailTypeErrMsg						= iconForErrMsg+' Please, Select Detail Type !';
var destinationErrMsgForRevereEntry			= iconForErrMsg+' Please, Enter Destination first for Reverse LR booking !';

var emailInfoMsg						    = iconForInfoMsg+' Please, enter a valid email address';
var executiveNameErrMsg						= iconForErrMsg+' Please, Select Executive !';
var executiveNotAvailableInfoMsg			= iconForInfoMsg+' Executive not available !';
var expenseTypeErrMsg						= iconForInfoMsg+' Please, Select Expense Type !';

var form_403_402ErrMsg						= iconForErrMsg+' Please, Select Form !';
var freightChargeRequired					= iconForErrMsg+' Please, Enter Freight Charge !';
var frieghtUptoDestinationErrMsg			= iconForErrMsg+' Please, Enter Freight Upto Destination !';
var fundTypeErrMsg         	         		= iconForErrMsg+' Please, Select Fund Type !';
var futureDateNotAllowdErrMsg				= iconForErrMsg+' Future Date not allowed !';
var lrDateBeforeForReverseEntry				= iconForErrMsg+' Please enter LR date that is before from Current date for Reverse LR booking!';


var godownErrMsg				            = iconForErrMsg+' Please, First Select Godown !';
var godownDoesNotExistErrMsg				= iconForErrMsg+' Godown Not Found ! Please, create Godown for your Branch !';

var headNameErrMsg							= iconForErrMsg+' Please, Select Valid Head Name!';
var heightErrMsg							= iconForErrMsg+' Please, Enter Height !';

var incomeTypeErrMsg						= iconForErrMsg+' Please, Select Income Type !';
var incomeExpSelectErrMsg                   = iconForErrMsg+' Please, Select Income/Expense !';
var invalidCharacterInBranchNameWarningMsg	= iconForWarningMsg+' Inavlid Character In Branch Name !';
var invalidCreditorNameErrMsg				= iconForErrMsg+' Invalid Creditor Name, Please enter again !';
var invoiceNumberErrMsg						= iconForErrMsg+' Please, Enter Invoice No !';
var invoiceDateErrMsg						= iconForErrMsg+' Please, Enter Manual Invoice Date !';

var locationSelectErrMsg					= iconForErrMsg+' Please, Select Valid Location Type !';
var lrSelectToSaveErrMsg					= iconForErrMsg+' Please, Select LRs To Save !';
var lrSelectTypeErrMsg						= iconForErrMsg+' Please, Select LR Type';
var lrSelectErrMsg							= iconForErrMsg+' Please, Select the LR.';
var lengthErrMsg							= iconForErrMsg+' Please, Enter Length !';

var mobileNumberErrMsg						= iconForErrMsg+' Please, Enter Mobile no !';
var mobileNumberLenErrMsg					= iconForInfoMsg+' Please, Enter 10 digits Mobile No !';
var manualCrNumberErrMsg					= iconForErrMsg+' Please, Enter Manual CR Number !!';
var manualCrDateErrMsg					    = iconForErrMsg+' Please, Enter Manual CR Date !!';

var nameErrMsg								= iconForErrMsg+' Please, Enter Name !';
var noLSToDeleteInfoMsg						= iconForInfoMsg+' There is no LS to delete !';
var numberErrMsg							= iconForErrMsg+' Please, Enter Number !';

var packingTypeErrMsg						= iconForErrMsg+' Please, Select Packing Type !';
var packingGroupErrMsg						= iconForErrMsg+' Please, Select Packing Group !';
var packingTypeAddedSuccessMsg				= iconForSuccessMsg+' Packing Type Added Successfully !';
var packingTypeAlreadyExistInfoMsg			= iconForWarningMsg+' Packing Type Already Exists !';
var packingTypeNameErrMsg					= iconForErrMsg+' Please, Enter Packing Type Name !';
var packingTypeAddedToGroupInfoMsg			= iconForInfoMsg+' Packing Type Added to Group !';
var packingTypeAddedAndMapInfoMsg			= iconForInfoMsg+' Packing Type Added to Group And Mapping Done Also !';
var packingTypeUpdateInfoMsg				= iconForInfoMsg+' Packing Type Updated Successfully !';
var packingTypeDeleteInfoMsg				= iconForInfoMsg+' Packing Type Deleted Successfully !';
var packingTypeDeleteFromMappInfoMsg		= iconForInfoMsg+' Packing Type Deleted from Mapping Successfully !';
var packingTypeGrpErrMsg					= iconForErrMsg+' Please, Select Packing Type Group !';
var partyNameErrMsg							= iconForErrMsg+' Please, Enter Party Name !';
var partyAlreadyExist						= iconForInfoMsg+' Party already Exist, Please enter different name !';
var partyNotFoundInfoMsg					= iconForInfoMsg+' Party not found !';
var partyTypeErrMsg							= iconForErrMsg+' Please, Select Party Type !';
var paymentTypeErrMsg						= iconForErrMsg+' Please, Select Payment Type !';
var phoneNumberIncoorectErrMsg              = iconForErrMsg+ 'Phone Number may be incorrect, Please Check !';
var phoneNumberIncorrectErrMsg				= iconForErrMsg+ 'Phone Number may be incorrect, Please Check !';
var phoneNumberErrMsg				        = iconForErrMsg+ 'Please, Enter Valid Phone Number !';
var privateMarkErrMsg						= iconForErrMsg+' Please, Enter Private Mark !';
var deliveryAtErrMsg						= iconForErrMsg+' Please, Select DeliveryAt !';
var stPaidByErrMsg							= iconForErrMsg+' Please, Select StPaidBy !';
var paymentTypeErrMsg						= iconForErrMsg+' Please, Select Proper Payment Type !';
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

var receiveDocumentsErrMsg					= iconForErrMsg+' Please, Receive All documents first.';
var receivedAmountErrMsg					= iconForErrMsg+' Please, Provide Received Amount !';
var receivedDeliveryAsErrMsg				= iconForErrMsg+' Please, Select Rcv Dly As !';
var recordNotFoundInfoMsg					= iconForInfoMsg+' Record not Found, Try Again !';

var regionNameErrMsg						= iconForErrMsg+' Please, Select Region !';
var regionNameErrMsg1						= iconForErrMsg+' Region Already Exists. Please Choose Different Name !';
var ramarkErrMsg							= iconForErrMsg+' Please, Enter Remark !';
var reportTypeErrMsg						= iconForErrMsg+' Please Select Report Type !';

var saidToContaionErrMsg					= iconForErrMsg+' Please, Enter Said To Contain!';
var unitErrMsg								= iconForErrMsg+' Please, Select Unit!';
var sameDestinationBranchInfoMsg			= iconForInfoMsg+' You are selecting same Destination Branch, Please select another Destination Branch !';
var selectAtleasetOneHeadInfoMsg			= iconForInfoMsg+' Please, Select atleast One Head !';
var selectCheckBoxErrMsg					= iconForErrMsg+' Please, Select atleast one check box !';
var selectBranchServiceTypeErrMsg			= iconForErrMsg+' Please, Select Branch Service Delivery Type !';
var sourceBranchErrMsg						= iconForErrMsg+' Please, Select Source Branch !';
var sourceSubRegionErrMsg					= iconForErrMsg+' Please, Select Source SubRegion';
var sourceDestinationBranchErrMsg			= iconForErrMsg+' Please, select Source and Destination Branch.';
var sourceDestinationSubregionErrMsg		= iconForErrMsg+' Please, Select Source SubRegion Or Destination SubRegion !';
var sourceDestinationBranchNotBeSameInfoMsg	= iconForInfoMsg+' Source And Destination Could not be same, Please select another Destination Branch !';
var stateSelectErrMsg						= iconForErrMsg+' Please, select State first!';
var stPaidByErrMsg							= iconForErrMsg+' Please, Select or Enter ST Paid By !';
var subBranchNameErrMsg						= iconForErrMsg+' Please, Select SubBranch !';
var subRegionNameErrMsg						= iconForErrMsg+' Please, Select Sub-Region !';
var subRegionEnterNameErrMsg				= iconForErrMsg+' Please, Enter Sub Region Name!';

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
var validCollectionPersionErrMsg			= iconForErrMsg+' Please, Provide valid Collection Person !';
var validConsineeMobileErrMsg				= iconForErrMsg+' Please, Enter valid Consignee MOBILE No. !';
var validConsineePartyErrMsg				= iconForErrMsg+' Please, Enter valid Consignee Party. !';
var validConsinorMobileErrMsg				= iconForErrMsg+' Please, Enter valid Consignor MOBILE No. !';
var validConsinorNameErrMsg					= iconForErrMsg+' Please, Enter Valid Consignor Name !';
var validBillingPartyErrMsg					= iconForErrMsg+' Please, Enter valid Billing Party !';
var validCreditorErrMsg						= iconForErrMsg+' Please, Enter valid Creditor !';
var validDateErrMsg							= iconForErrMsg+' Please, Enter valid date !';
var validLRNumberErrMsg						= iconForErrMsg+' Please, Provide valid LR Number !';
var validPartyNameErrMsg					= iconForErrMsg+' Please, enter Valid Party Name!';
var validGstNumberErrMsg					= iconForErrMsg+' Please, enter Valid Gst Number!';
var validPhoneNumberErrMsg					= iconForErrMsg+' Please, Enter Valid Phone Number !';
var validSourceBranchErrMsg					= iconForErrMsg+' Please, Select Valid Source Branch !';

var vehicleNumberErrMsg						= iconForErrMsg+' Please, Enter Truck Number !';
var vehicleNumberErrMsg1					= iconForErrMsg+' Please, Select Vehicle No. !';
var vehicleNumberInfoMsg					= iconForInfoMsg+' Vehicle Agent Already Exists. Please Choose Different Name !';
var wayBillSelectErrMsg		            	= iconForErrMsg+' Please, Select the waybill !';

var crNumberAlreadyCreatedInfoMsg			= iconForInfoMsg+' CR number already created for current year. Please enter another CR number !';
var topayBookingNotAllowedForBranch			= iconForInfoMsg+' Topay Booking is not allowed for this destination branch  !';
var ForCreateLhpvMsg			        	= iconForErrMsg+' Please create or attach the LHPV to take the print !';
var invalidCollectionPersonNameErrMsg		= iconForErrMsg+' Invalid Collection Person Name, Please enter again !';
var hsnCodeErrMsg							= iconForErrMsg+' Please, Select HSN Code !';

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

//Variable for LR

var selectLrErrMsg							= iconForErrMsg+' Please, Select atleast one LR !';
var selectLrToReceiveErrMsg					= iconForErrMsg+' Please, Select atleast one LR to Receive !';
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
var turNumberErrMsg							= iconForErrMsg+' Please, Enter TUR Number !';
var privateMarkErrMsg						= iconForErrMsg+' Please, Enter Private Mark !';
var deliveryAtErrMsg						= iconForErrMsg+' Please, Select DeliveryAt !';
var stPaidByErrMsg							= iconForErrMsg+' Please, Select StPaidBy !';
var vehicleNumberErrMsg						= iconForErrMsg+' Please, Enter Truck Number !';
var branchNameErrMsg						= iconForErrMsg+' Please, Select Branch Name !';
var lounchByPartyErrMsg						= iconForErrMsg+' Please, Enter Lounch By Party !';
var claimAmountErrMsg						= iconForErrMsg+' Please, Enter Claim Amount !';
var claimTypeErrMsg							= iconForErrMsg+' Please, Enter Claim Type !';
var claimPersonErrMsg						= iconForErrMsg+' Please, Enter Claim Discussion Person !';
var claimNumberErrMsg						= iconForErrMsg+' Please, Enter Claim Number !';
var ramarkErrMsg							= iconForErrMsg+' Please, Enter Remark !';
var selectErrMsg							= iconForErrMsg+' Please, Select Short Number !';
var lessExcessArtiErrMsg					= iconForErrMsg+' Select Only one short Entry  !';
var excessErrMsg							= iconForErrMsg+' Please, Enter Excess Article !';
var excessMoreThanShortErrMsg				= iconForErrMsg+' Excess Number is more than total Short !';
var articleTypeErrMsg						= iconForErrMsg+' Plaese, Select Article Type !';
var excessArticleErrMsg						= iconForErrMsg+' Please, Enter Excess Article !';
var excessPackingErrMsg						= iconForErrMsg+' Please, Select Article Type !';
var excessWeightErrMsg						= iconForErrMsg+' Please, Enter Excess Weight !';
var shortArticleErrMsg						= iconForErrMsg+' Please, Enter Short Article !';
var damageArticleErrMsg						= iconForErrMsg+' Please, Enter Damage Article !';
var actWeightErrMsg							= iconForErrMsg+' Please, Enter Actual Weight !';
var wgtFrghtRateErrMsg						= iconForErrMsg+' Please, Enter Weight Rate !';
var wayBillNumberErrMsg						= iconForErrMsg+' Please, Enter Way Bill Number !';
var actUnloadWeightErrMsg					= iconForErrMsg+' Please, Enter Act. Unload Weight !';
var shortWeightErrMsg						= iconForErrMsg+' Please, Enter Short Weight !';
var damageWeightErrMsg						= iconForErrMsg+' Please, Enter Damage Weight !';
var shortAmountErrMsg						= iconForErrMsg+' Please, Enter Short Amount !';
var damageAmountErrMsg						= iconForErrMsg+' Please, Enter Damage Amount !';
var shortSettleWayErrMsg					= iconForErrMsg+' Please, Select Short Settlement Type !';
var damageSettleWayErrMsg					= iconForErrMsg+' Please, Select Damage Settlement Type !';
var excessSettleWayErrMsg					= iconForErrMsg+' Please, Select Excess Settlement Type !';
var selectLrToReceiveErrMsg					= iconForErrMsg+' Please, Select atleast one LR to Receive !';
var selectShortDetailsErrMsg				= iconForErrMsg+' Please, Select checkbox to delete Short details !';
var selectExcessDetailsErrMsg				= iconForErrMsg+' Please, Select checkbox to delete Excess details !';
var lrNumberProperErrMsg					= iconForErrMsg+' LR number not found in system. Please, Enter valid LR number !';

var shortArtGrTErrMsg						= iconForErrMsg+' Short Article can not be greater than Total Article !';
var damageArtGrTErrMsg						= iconForErrMsg+' Damage Article can not be greater than Total Article !';
var shortDamageArtGrTErrMsg					= iconForErrMsg+' Short + Damage Article can not be greater than Total Article !';
var shortDamageArticleErrMsg				= iconForErrMsg+' Please, Enter atleast one Short or Damage Article !';
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

var shortEntryDoneSuccessMsg				= iconForSuccessMsg+' Short Entries saved successfully !';
var shortSettlementDoneSuccessMsg			= iconForSuccessMsg+' Short Settlement has been done successfully !';
var excessSettlementDoneSuccessMsg			= iconForSuccessMsg+' Excess Settlement has been done successfully !';
var excessUpdateSuccessMsg					= iconForSuccessMsg+' Excess Register Detail successfully Updated !';
var selectTypeErrMsg						= iconForErrMsg+'</i> Please, Type !';

function alreadyEnteredMoreThanTotalArt(shortLrNumber, articleType) {
	var alreadyEnteredMoreThanTotalArt 		= iconForInfoMsg+' You have already entered short and damage article equal to total article for this LR ' + openFontTag + shortLrNumber + closeFontTag + ' and Article ' + openFontTag + articleType + closeFontTag +' !'	
	return alreadyEnteredMoreThanTotalArt;
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
var truckArrivalDetailAddedSuccessMsg		= iconForSuccessMsg+ ' Truck Arrival Successfully Added !';

function turNumberCreatedForLsInfoMsg(turNumber) {
	var turNumberCreatedForLsInfoMsg		= iconForInfoMsg+ ' [ TUR No. ' + turNumber + ' created for this LS ]';
	return turNumberCreatedForLsInfoMsg;
}

//Variable for BranchCrossing Map

var selectBranchesFromLeftErrMsg			= iconForErrMsg+' Please, Select branches from left box !';
var selectCrossingBranchesFromLeftErrMsg	= iconForErrMsg+' Please, Select crossing branches from left box !';
var selectCrossingBranchesFromRightErrMsg	= iconForErrMsg+' Please, Select crossing branches from right box !';
var selectBranchesFromRightErrMsg			= iconForErrMsg+' Please, Select branches from right box !';
var crBranchesNotFoundForSeletedErrMsg		= iconForErrMsg+' Crossing Branches not Found for selected Branch';

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

//Variable for DDM Module

var ddmNumberErrMsg							= iconForErrMsg+' Please, Enter DDM Number !';

function ddmAlreadySearchedWarningMsg(ddmNumber) {
	var ddmAlreadySearchedWarningMsg		= iconForWarningMsg+' DDM Number ' + openFontTag + ddmNumber + closeFontTag + ' Already Searched !';
	return ddmAlreadySearchedWarningMsg;
}

//Variable for Create WayBill

//Variable for Create Bill

var addSaidToContainAlertMsg				= 'Said to contain does not exist, do you want to add ?';
var createBillAlertMsg						= 'Are you sure you want to Create Bill ?';
var selectionErrMsg							= iconForErrMsg+' Please, Select Selection !';

function chargedWeightLessThanInfoMsg(actualWeight) {
	var chargedWeightLessThanInfoMsg		= iconForInfoMsg+' You can not enter Charged Weight less than ' + actualWeight;
	return chargedWeightLessThanInfoMsg;
}

function weightRateLessThanInfoMsg(weightRate) {
	var weightRateLessThanInfoMsg			= iconForInfoMsg+' You can not enter Weight Rate less than ' + weightRate;
	return weightRateLessThanInfoMsg;
}

function qtyAmountLessThanInfoMsg(qtyAmount) {
	var qtyAmountLessThanInfoMsg			= iconForInfoMsg+' You can not enter Qty Amount less than ' + qtyAmount;
	return qtyAmountLessThanInfoMsg;
}

var fixAmountRequiredErrMsg					= iconForErrMsg+' Fix Amount can not be 0 !';
var weightRateRequiredErrMsg				= iconForErrMsg+' Weight Rate can not be 0 !';

function chargeWeightIncreases(increaseChargeWeight) {
	var chargeWeightIncreases				= iconForInfoMsg+ ' ' + increaseChargeWeight + ' kg Charge Weight Increases !';
	return chargeWeightIncreases;
}

/*
*	Rate Master Variable
*/

var deleteChargeConfirmMsg					= 'Are you sure you want to Delete Charge ?';
var destinationAreaAlertMsg					= 'Please Select at least 1 destination area';
var destinationBranchAlertMsg				= 'Please Select at least 1 destination branch';
var minimumPartyWeightErrMsg				= iconForErrMsg+' Please, Enter minimum Party weight !';
var rateTypeErrMsg							= iconForErrMsg+' Please, Select rate type !';
var routeAmountErrMsg						= iconForErrMsg+' Please, Enter Amount For Route !';
var saveChargeConfirmMsg					= 'Are you sure you want to save Charge ?';
var saveMinimumAmountConfirmMsg				= 'Are you sure you want to save minimum amount ?';
var selectCategoryType						= iconForErrMsg+' Please, Select category type !';
var selectOnlyPartyErrMsg					= iconForErrMsg+' Please, Select only Party !';
var slabErrMsg								= iconForErrMsg+' Please, Select Slab !';
var articleWiseWeightDiffDeletedSuccessMsg	= iconForSuccessMsg+' Article Wise Wieght Difference mapping deleted successfully !';
var selectGSTType							= iconForErrMsg+' Please, Select GST type !';


/*
*	Bill Clearance Variable
*/

var paymentModeErrMsg						= iconForErrMsg+' Please, Select Payment Mode !';
var receivedAmountCantBeBlankErrMsg			= iconForErrMsg+' Received Amount can not be Blank !';
var selectChecqueNoOrTXNNoErrMsg			= iconForErrMsg+' Please, Select Cheque No OR TXN. No !';


function receivedAmtCantBeGTToatlAmtInfoMsg(totalAmount) {
	var receivedAmtCantBeGTToatlAmtInfoMsg	= iconForInfoMsg+' Received Amount cannot be greater than Total Amount ' + openFontTag + totalAmount + closeFontTag + ' !';
	return receivedAmtCantBeGTToatlAmtInfoMsg;
}

function receivedAmtCantBeGTBalanceAmtInfoMsg(balanceAmount) {
	var receivedAmtCantBeGTBalanceAmtInfoMsg= iconForInfoMsg+' Received Amount cannot be greater than Balanace Amount ' + openFontTag + balanceAmount + closeFontTag + ' !';
	return receivedAmtCantBeGTBalanceAmtInfoMsg;
}

/*
*	Slab Master Variable
*/

var maxValueGTOneErrMsg						= iconForErrMsg+' Please, Enter max Value Greater Than 1 !';
var minValueGTZeroErrMsg					= iconForErrMsg+' Please, Enter Min Value Greater Than 0 !';
var maxValueGTMinValueErrMsg				= iconForErrMsg+' Please, Enter Max Value Greater Than min value !';
var slabForPartyErrMsg						= iconForErrMsg+' Please, Select Slab !';
var saveSlabConfirmMsg						= 'Are you sure you want to save Slab ?';
var deleteSlabForPartyConfirmMsg			= 'Are you sure you want to Delete Slab For Party ?';
var deleteSlabConfirmMsg					= 'Are you sure you want to Delete Slab ?';
var slabDeletedSuccessMsg					= iconForSuccessMsg+' Slab is Deleted !';
var slabIsUsedForPartyWarningMsg			= iconForWarningMsg+ ' This Slab is Used By Following Party, Delete That Mapping To Proceed ahead !';

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
var nextValGTZeroErrMsg						= iconForErrMsg+' Next Value Must Be Greater than 0 !'; 
var differentNextValueErrMsg				= iconForErrMsg+' Please Enter the Different Next Value !';
var lrSequnceCounterAlreadyExistInfoMsg		= iconForInfoMsg+' Lr Sequence already exits for another Branch, Please check and provide Different Range !';
var lrSequnceCounterNotFoundInfoMsg			= iconForInfoMsg+' LR Sequence counter not found !';
var lsSequnceCounterNotFoundInfoMsg			= iconForInfoMsg+' LS Sequence counter not found !';
var srcDestWiseSeqCounterNotFoundInfoMsg	= iconForInfoMsg+' WayBill Number not define for Source to Destintion, Please add waybill number first !';
var firstDestinationBranchErrMsg			= iconForErrMsg+' LR Number not Define for Destination Branch. Please, Define LR Number First !';
var manualLRSequnceAlreadyExistInfoMsg		= iconForInfoMsg+' Manual LR Sequence already exits !';
var manualSequenceCounterAddedSuccessMsg	= iconForSuccessMsg+' Manual Sequence Counter Successfully Added !';
var maxRangeGTMinRangeErrMsg				= iconForErrMsg+' Max Range Must Be Greater then Min Range !';
var nextValueErrMsg							= iconForErrMsg+' Please, Enter the Next Value !';
var nextValueGTMinRangeAndLTMaxRangeInfoMsg	= iconForErrMsg+' Next Value Should be Greater than Min Range And Less than Max Range !';
var sequenceCounterAddedSuccessMsg			= iconForSuccessMsg+' Sequence Counter Successfully Added !';
var updateSeqCounterSuccessMsg				= iconForSuccessMsg+' Sequence Updated Successfully !';
var updateNextValueSuccessMsg				= iconForSuccessMsg+' Next Value Updated Successfully !';

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
var balancePayableBranchErrMsg				= iconForErrMsg+ 'Please, Select a Balance Payable Branch !';
var balancePayableSubBranchErrMsg			= iconForErrMsg+ 'Please, Select a Balance Payable Sub Branch !';
var branchAsTruckDestinationBranchWarningMag= iconForWarningMsg+ ' You can not select your Branch as Truck Destination Branch !';
var lhpvNumberAlreadyCreatedInfoMsg			= iconForInfoMsg+' LHPV number already created for current year. Please enter another LHPV number !';
var lhpvNumberErrMsg						= iconForErrMsg+ ' Please, Enter LHPV Number !';
var lorryHireAmountLTZeroInfoMag			= iconForInfoMsg+ ' You can not enter Lorry Hire Amount Less then 0 !';
var manualLHPVNumberErrMsg					= iconForErrMsg+ ' Please, Enter Manual LHPV Number !';
var manualLHPVDateErrMsg					= iconForErrMsg+ ' Please, Enter Manual LHPV Date !';
var noLSToDeleteWarningMsg					= iconForWarningMsg+ ' There is no LS to delete !';
var selectLSToAppendInLHPVErrMsg			= iconForErrMsg+ ' Please, Select LS which you want in this LHPV !';
var selectLSToDeleteInfoMsg					= iconForWarningMsg+ ' Please select atleast one LS to delete !';
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
var manualBLHPVWithinRangeInfoMsg			= iconForInfoMsg+' Please Enter Manual BLHPV Number within a range !';
var waybillStatusErrorMsg					= iconForErrMsg+' Please, Select WayBill Status !';
var selectedViewErrorMsg					= iconForErrMsg+' Please Select View !';
var specialCharacterNumberAllowWarningMsg	= iconForWarningMsg+' Only Special Characters and 0-9 allowed, No other Character Allowed !'; 
var configureManualDDMDaysWarningMsg	    = iconForWarningMsg+' Please Configure Manual DDM Days Allowed For Branch !';
var otherCharacterAllowWarningMsg	        = iconForWarningMsg+' Other character not allowed !';
var validConsinorAndConsigneeMobileErrMsg	= iconForErrMsg+' Please, Enter valid Either Consignor And Consignee MOBILE No. !';
var fromPartyNameErrMsg						= iconForErrMsg+' Please, Enter From Party Name !';
var selectTransferToGroup					= iconForErrMsg+' Please, Select Transfer To Group !'
var billSettlementTypeErrMsg				= iconForErrMsg+' Please, Provide Settlement Type !';