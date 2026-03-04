/**
 * 
 */

var jsondata 						= null;
var configuration					= null;
var executive						= null;
var execFldPermissions				= null;
var taxes							= null;

var TransportCommonMaster			= null;
var ReceivableTypeConstant			= null;
var WayBill							= null;
var Branch							= null;
var ChargeTypeMaster				= null;
var PartyMaster						= null;
var WayBillType						= null;
var CorporateAccount				= null;
var FeildPermissionsConstant		= null;
var InfoForDeliveryConstant			= null;
var TaxPaidByConstant				= null;

var execFeildPermission				= null;

var isDeliveryDiscountAllow			= false;
//var octroiServiceCharge				= null;
var isOctroiServiceApplicable		= true;

var enterCount						= 0;
var taxableAmount					= 0;
var checkedManualCRSave 			= null;
var checkedManualCROnCancel 		= null;

var showbillCredit					= false;

var BOOKING_CHARGE					= 1;
var DELIVERY_CHARGE					= 2;

var isCRCreating					= false;
var branchId						= 0;
var destBranchId					= 0;

var DeliveryChargeConfiguration		= null;
var	DeliveryRateMaster				= null;
var	RateMaster						= null;
var displayStatusDetails			= false;
var displayDispatchDetails			= false;
var	RateMaster						= null;
var servicePermission				= null;
var PaymentTypeConstant				= null;
var WayBillTypeConstant				= null;
var DeliveryChargeConstant			= null;
var isTDSAllow						= false;
var isDeliveryDiscountAllow			= false;
var isPanNumberMandetory			= false;
var deliveryTdsRate					= null;
var chargeIdsForTDSCalculation		= 0;
var bookingServiceTax				= 0;		
var dbWiseSelfPartCA				= null;
var BookingChargeConstant			= null;
var sourceBranchStateId				= 0;
var destinationBranchStateId		= 0;
var consignorGstn					= null;
var consigneeGstn					= null;
var blackListed						= null;
var discountOnTxnType				= null;
var deliveryTo						= null;
var moduleId						= 0;
var ModuleIdentifierConstant		= null;
var incomeExpenseModuleId			= 0;
var podDocumentTypeArr				= null;
var ExecutiveTypeConstant			= null;
var	deliveryAllowed					= true;
var godownList						= null;
var ChargeTypeConstant				= null;
var transportModeId					= 1;
var wayBillConsignmentDetails;
var wayBillConsignmentSummary;
var LR_SEARCH_TYPE_ID				= 1;
var paymentTypeArr					= null;
var sendOTPForLrDelivery			= false;
var OTPNumber						= null;
var blackListed						= null;
var	consignorBlackListed 			= 0;
var	consigneeBlackListed			= 0;
var	tbbBlackListed					= 0;
var	tbbPartyName					= null;
var	groupConfiguration				= null;
var podConfiguration				= null;
var unloadingChargeAmount           = 0;
var idProofConstantArr				= null;
var IDProofConstant					= null;
var isAllowToEnterIDProof			= false;
var maxFileSizeToAllow				= 0;
var deliveryReminderLRDetails		= null;
var isAllowDeliveryLockingWhenChequeBounce  = false;
var discountInPercent				= 0;
var isAllowDeliveryLockingWhenChequeBounce	= false;
var dlyTotal						= 0.00;
var shortCreditConfigLimit			= null;
var vehicleNumber					= null;
var vehicleNumberMasterId			= 0;
var allowAutoGenerateConEWaybill	= false;
var showTruckNumberField			= false;
var matadiChargesApplicable			= false;

var completeDeliveryLocking			= false;
var shortCreditDeliveryLocking		= false;
var ConsigneeName					= null;
var isCrPdfAllow					= false;
var matadiChargesApplicableForBillCredit = false;

var isCrPdfAllow					= false;
var consignorEmail					= null;
var consigneeEmail					= null;
var billSelectionId					= 0;
var consignmentSummary				= null;
var branchWisePrepaidAmount			= null;
var allowPrepaidAmount    = false;
var	prepaidAmountId					= 0;
var stbsCreationAllowCheckBoxBySubregionIds = 0;
var headOfficeSubregionArr 					= null;
var imageCount								= 0;
var imageArr								= new Array();
var ConsigneePartyMasterIdArr				= new Array();
var NIGERIA	= 2;
var GeneralConfiguration = null;
var consignorCorpId		= 0;
var consigneeCorpId		= 0;
var billingPartyId		= 0;
var changeStPaidbyOnPartyGSTN		= false;

var optForDelivery       = 0;
var allowDeliveryTimeOtp	= false;
var tdsConfiguration	= null;

var wayBillTax		= null;
var bookingTimeTaxBy	= 0;
var partialConsignmentDataArr = new Array();
var pendingDeliveryArticles		= null;
var pendingDeliveryFlag		= false;
var showPatialDeliveryButton = false;
var isPaidByDynamicQRCode	= false;
var isConsigneePartyTbb		= false;
var deliveryCreditorId      = 0;
