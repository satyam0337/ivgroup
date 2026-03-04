/**
 * 
 */

var lorryHire							= new $.Deferred();	//	lorryHire
var balanceAmount						= new $.Deferred();	//	Balance Amount

var jsondata 							= null;
var executive							= null;
var configuration						= null;
var LHPVConstant						= null;
var VehicleNumberMasterConstant			= null;
var LHPV_CREATE_ID						= 1;
var LHPV_APPEND_ID						= 2;
var driverarr  							= new Array();
var calculateAdvanceFromTruckDlyTopayLR	= false;
var isDisplayUnladenWeight			 	= false;	
var countAddedLS						= 0;
var truckNumberId						= 0;
var vehcileNumberArr					= new Array();
var	dispatchLedgerArr					= new Array();
var	pastDaysAllowed						= 0;
var	lhpvSequenceCounter					= null;
var	isSeqCounterPresent					= false;
var	lhpvChargesHshmp					= null;
var	lhpvLryHirChrgHshmp					= null;
var	lhpvStatChrgHshmp					= null;
var	lhpvAddChrgHshmp					= null;
var	lhpvSubChrgHshmp					= null;
var	ManualLHPVDaysAllowed				= 0;
var	VehicleDetails						= false;
var isAllowBackDateInAutoLhpv			= false;
var isAllowManualLhpv					= false;
var isLhpvLockingAfterLsCreation		= false;
var TruckLoadType						= null;
var lsDispatchLedgerId					= 0;
var vehicleTypeCapacity					= 0;
var tdsConfiguration					= null;
var VehicleOwnerConstant				= null;
var vehicleOwner 						= 0 ;
var allowSpecialCharacterInManualLHPV	= false;
var sameSequenceForLsAndLhpv			= false;
var calculateAdvanceFromTopayLRTotal	= false;
var disableLhpvCharges					= false;
var lhpvChargeIdsToDisableList			= null;
var	minDate								= null;
var maxDate								= null;
var hideAdvanceFromTruckDlyLRBySubrRegionIdExclude = 0;