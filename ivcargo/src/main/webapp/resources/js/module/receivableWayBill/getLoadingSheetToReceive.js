/**
 * 
 */

var receivablesModelList						= null;
var executive									= null;
var configuration								= null;
var recieveConfiguration						= null;
var VehicleNumberMasterConstant					= null;
var receiveAndDeliverLR							= false;
var ExecutiveTypeConstant						= null;
var isForceReceive								= false;
var isShowOctroiConfig							= false;
var state										= null;
var searchByBranch								= 1;
var searchByVehicleNumber						= 2;
var searchByLSNumber							= 3;
var searchByTLNumber							= 4;
var isColorCodeWiseReceiveAllowedByDays			= false;
var colorCodeWiseReceiveAllowedMinHours			= 0;
var popupWindowToReceiveLS						= false;
var isInterBranchLs								= 'false';
var allowReceiveLocking							= 'false';
var isPendingReceive							= false;
var reportModelHM								= null;
var limit										= 0;
let showDateSelectionOnSearchByBranch			= false;
let transferLedgersList							= null;
let isActiveTCEGroup							= false;
let showRegionSelectionForRegionAdmin			= false;

function initialize() {
	var jsonObject		= new Object();
	
	jsonObject.filter				= 1;
	
	var jsonStr = JSON.stringify(jsonObject);
	//alert(jsonStr);
	$.getJSON("ViewReceivableWayBillAjaxAction.do?pageId=221&eventId=11",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription); // show message to show system processing error massage on top of the window.
				} else { 
					if(typeof createVideoLink != 'undefined') createVideoLink(data);
					executive					= data.executive;
					configuration				= data.configuration;
					VehicleNumberMasterConstant	= data.VehicleNumberMasterConstant;
					receiveAndDeliverLR			= data.receiveAndDeliverLR;
					ExecutiveTypeConstant		= data.ExecutiveTypeConstant;
					popupWindowToReceiveLS		= data.popupWindowToReceiveLS;
					isInterBranchLs				= configuration.isInterBranchLs;
					limit						= data.limit;
					isActiveTCEGroup			= data.isActiveTCEGroup;
					
					if(executive.executiveType == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN)
						showRegionSelectionForRegionAdmin	= configuration.showRegionSelectionForRegionAdmin;
					
					$('#limitMessage').html('Only top ' + limit + ' Loading Sheet will be allow to receive !');
					
					$('#dateEle').DatePickerCus({});
					
					setOperationSelection();
					getGrupSubRegionArrList();
					populateRegionSubregionBranchesByExecutiveType();
					vehicleNumberAutocomplete();
				}
			}
			);
}

function setOperationSelection() {
	operationOnSelectTag('operationSelectionEle', 'addNew', '---Select Search By---', 0);
	operationOnSelectTag('operationSelectionEle', 'addNew', 'Branch', searchByBranch);
	operationOnSelectTag('operationSelectionEle', 'addNew', 'Truck Number', searchByVehicleNumber);
	
	if(configuration.displayLSNumberPanel)
		operationOnSelectTag('operationSelectionEle', 'addNew', 'LS Number', searchByLSNumber);
		
	if(isActiveTCEGroup)
		operationOnSelectTag('operationSelectionEle', 'addNew', 'TL Number', searchByTLNumber);
}

function selectOperations() {
	let operationSelectionEle	= Number($('#operationSelectionEle').val());
	
	if(operationSelectionEle == searchByBranch) {
		$('#branchSelection').removeClass('hide');
		$('#tlnumberpanel').addClass('hide');
		$('#vehicleNumberPanel').addClass('hide');
		$('#lsnumberpanel').addClass('hide');
		$('#vehicleNumber').val('');
		$('#vehicleNumberId').val(0);
		$('#lsNumber').val('');
		$('#tlNumber').val('');
		
		if(showRegionSelectionForRegionAdmin)
		changeDisplayProperty('displayRegion', 'block');

		if(configuration.showDateSelectionOnSearchByBranch)
			$('#searchByDatePanel').removeClass('hide');
		else
			$('#searchByDatePanel').remove();
	} else if(operationSelectionEle == searchByVehicleNumber) {
		$('#vehicleNumberPanel').removeClass('hide');
		$('#tlnumberpanel').addClass('hide');
		$('#branchSelection').addClass('hide');
		$('#lsnumberpanel').addClass('hide');
		$('#region').val(0);
		$('#subRegion').val(0);
		$('#branch').val(0);
		$('#locationId').val(0);
		$('#lsNumber').val('');
		$('#tlNumber').val('');
		$('#searchByDatePanel').addClass('hide');
		$("#searchByDate").prop("checked", false);
	} else if(operationSelectionEle == searchByLSNumber) {
		$('#lsnumberpanel').removeClass('hide');
		$('#tlnumberpanel').addClass('hide');
		$('#branchSelection').addClass('hide');
		$('#vehicleNumberPanel').addClass('hide');
		$('#region').val(0);
		$('#subRegion').val(0);
		$('#branch').val(0);
		$('#locationId').val(0);
		$('#vehicleNumber').val('');
		$('#tlNumber').val('');
		$('#vehicleNumberId').val(0);
		$('#searchByDatePanel').addClass('hide');
		$("#searchByDate").prop("checked", false);
	} else if(operationSelectionEle == searchByTLNumber) {
		$('#tlnumberpanel').removeClass('hide');
		$('#lsnumberpanel').addClass('hide');
		$('#branchSelection').addClass('hide');
		$('#vehicleNumberPanel').addClass('hide');
		$('#region').val(0);
		$('#subRegion').val(0);
		$('#branch').val(0);
		$('#locationId').val(0);
		$('#vehicleNumber').val('');
		$('#vehicleNumberId').val(0);
		$('#searchByDatePanel').addClass('hide');
		$("#searchByDate").prop("checked", false);
	} else {
		$('#branchSelection').addClass('hide');
		$('#vehicleNumberPanel').addClass('hide');
		$('#lsnumberpanel').addClass('hide');
		$('#tlnumberpanel').addClass('hide');
		$('#region').val(0);
		$('#subRegion').val(0);
		$('#branch').val(0);
		$('#locationId').val(0);
		$('#vehicleNumber').val('');
		$('#vehicleNumberId').val(0);
		$('#lsNumber').val('');
		$('#tlNumber').val('');
		$('#searchByDatePanel').addClass('hide');
		$("#searchByDate").prop("checked", false);
	}
	
	showHideDate();
	
	refreshAndHidePartOfPage('bottom-border-boxshadow', 'hideAndRefresh');
	refreshAndHidePartOfPage('middle-border-boxshadow', 'hideAndRefresh');
	refreshAndHidePartOfPage('left-border-boxshadow', 'hideAndRefresh');
}

function validateSelection() {
	var operationSelectionEle	= Number($('#operationSelectionEle').val());
	
	if(operationSelectionEle == 0) {
		if(!validateInputTextFeild(1, 'operationSelectionEle', 'operationSelectionEle', 'error', iconForErrMsg + ' Please, Select Search By !'))
			return false;
	} else if(operationSelectionEle == searchByBranch) {
		if(!validationFormElement()) {return false;}
	} else if(operationSelectionEle == searchByVehicleNumber) {
		if(!validateInputTextFeild(1, 'vehicleNumberId', 'vehicleNumber', 'error', vehicleNumberErrMsg))
			return false;
	} else if(operationSelectionEle == searchByLSNumber && !validateInputTextFeild(1, 'lsNumber', 'lsNumber', 'error', lsNumberErrMsg))
		return false;
	else if(operationSelectionEle == searchByTLNumber && !validateInputTextFeild(1, 'tlNumber', 'tlNumber', 'error', tlNumberErrMsg))
		return false;
	
	return true;
}

function validationFormElement() {

	let lsNo = $('#lsNumber').val();
	
	if(lsNo != null && lsNo != "" && lsNo != "0")
		return true;

	let searchVehicle = $('#vehicleNumber').val();
	
	if(searchVehicle != null && searchVehicle != "" && searchVehicle != "0")
		return true;

	let selectedVehicleNoId = $('#vehicleNumberId').val();
	
	if(selectedVehicleNoId != null && selectedVehicleNoId != "" && selectedVehicleNoId != "0")
		return true;
	
	if(executive.executiveType == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN || showRegionSelectionForRegionAdmin) {
		if(!region('region')) {return false;}
		
		if($('#subRegion').val() < 0) {
			showMessage('error', subRegionNameErrMsg);
			changeTextFieldColor('subRegion', '', '', 'red');
			return false;
		} else {
			changeTextFieldColorWithoutFocus('subRegion', '', '', 'green');
		}
		
		if($('#branch').val() < 0) {
			showMessage('error', branchNameErrMsg);
			changeTextFieldColor('branch', '', '', 'red');
			return false;
		} else {
			changeTextFieldColorWithoutFocus('branch', '', '', 'green');
		}
	} else if(executive.executiveType == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN) {
		if($('#subRegion').val() < 0) {
			showMessage('error', subRegionNameErrMsg);
			changeTextFieldColor('subRegion', '', '', 'red');
			return false;
		} else {
			changeTextFieldColorWithoutFocus('subRegion', '', '', 'green');
		}
		
		if($('#branch').val() < 0) {
			showMessage('error', branchNameErrMsg);
			changeTextFieldColor('branch', '', '', 'red');
			return false;
		} else {
			changeTextFieldColorWithoutFocus('branch', '', '', 'green');
		}
	} else if(executive.executiveType == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN) {
		if($('#branch').val() < 0) {
			showMessage('error', branchNameErrMsg);
			changeTextFieldColor('branch', '', '', 'red');
			return false;
		} else {
			changeTextFieldColorWithoutFocus('branch', '', '', 'green');
		}
	}
	
	/*if(executive.executiveType == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN || executive.executiveType == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN || executive.executiveType == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN) {
		if(!validateSubBranch()) {return false;}
	}*/
	
	return true;
}

function validateSubBranch() {
	return branchName(1, 'branch');
}

function getLSDetailsToReceive() {
	if(!validateSelection())
		return false;
	
	let operationSelectionEle	= Number($('#operationSelectionEle').val());
	let jsonObject		= new Object();
	
	jsonObject.selectSubRegion	= $('#selectSubRegion').val();
	jsonObject.vehicleNumberId	= $('#vehicleNumberId').val();
	jsonObject.lsNumber			= $('#lsNumber').val();
	jsonObject.tlNumber			= $('#tlNumber').val();
	jsonObject.locationId		= Number($('#locationId').val());
	jsonObject.regionId			= Number($('#region').val());
	jsonObject.subRegionId		= Number($('#subRegion').val());
	jsonObject.branchId			= Number($('#branch').val());
		
	if($("#searchByDate").prop("checked") && operationSelectionEle == searchByBranch) {
		if($("#dateEle").attr('data-startdate') != undefined)
			jsonObject.fromDate = $("#dateEle").attr('data-startdate'); 

		if($("#dateEle").attr('data-enddate') != undefined)
			jsonObject.toDate 	= $("#dateEle").attr('data-enddate');
	}
	
	jsonObject.filter			= 2;
	
	let jsonStr = JSON.stringify(jsonObject);
	
	showLayer();
	
	$.getJSON("ViewReceivableWayBillAjaxAction.do?pageId=221&eventId=11",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription); // show message to show system processing error massage on top of the window.
					hideLayer();
				} else { 
					if(data.recordnotfound) {
						showMessage('info', iconForInfoMsg + ' ' + data.recordnotfound);
						hideLayer();
						changeDisplayProperty('bottom-border-boxshadow', 'none');
						changeDisplayProperty('middle-border-boxshadow', 'none');
						changeDisplayProperty('left-border-boxshadow', 'none');
						$('#resultsForTransfer thead').empty();
						$('#resultsForTransfer tbody').empty();
						return;
					} 
					
					receivablesModelList					= data.receivablesModel;
					isForceReceive							= data.isForceReceive;
					isShowOctroiConfig						= data.isShowOctroiConfig;
					state									= data.State;
					isPendingReceive						= data.isPendingReceive;
					recieveConfiguration					= data.receiveConfiguration;
					isColorCodeWiseReceiveAllowedByDays		= data.isColorCodeWiseReceiveAllowedByDays;
					colorCodeWiseReceiveAllowedMinHours		= data.colorCodeWiseReceiveAllowedMinHours;
					reportModelHM							= data.reportModelHM;
					transferLedgersList						= data.CorporateAccount;
					
					createHeader();
					
					$('#resultsForTransfer thead').empty();
					$('#resultsForTransfer tbody').empty();
					
					if(transferLedgersList != undefined && transferLedgersList.length > 0) {
						$('#left-border-boxshadow').removeClass('hide');
						changeDisplayProperty('left-border-boxshadow', 'block');
						makeHead(data);
						makeBody(data);
						makeFooter(data);
					} else
						$('#left-border-boxshadow').addClass('hide');
					
					setResult(data);
					
					if(receivablesModelList != null && receivablesModelList != undefined && receivablesModelList.length > 0) {
						changeDisplayProperty('bottom-border-boxshadow', 'block');
						changeDisplayProperty('middle-border-boxshadow', 'block');
					} else {
						changeDisplayProperty('bottom-border-boxshadow', 'none');
						changeDisplayProperty('middle-border-boxshadow', 'none');
					}
						
					if(configuration.vehicleNumberWiseUnloadingSheetPrint)
						$('#preUnloadingButtondiv').removeClass('hide');
					else
						$('#preUnloadingButtondiv').remove();
					
					if(transferLedgersList != undefined && transferLedgersList.length > 0)
						goToPosition('left-border-boxshadow', 500);
					else
						goToPosition('middle-border-boxshadow', 500);
					
					hideLayer();
				}
			}
			);
}

function createHeader() {
	$('#headingtr').empty();
	
	var createRow			= createRowInTable('', 'danger', '');
	
	if(configuration.vehicleNumberWiseUnloadingSheetPrint)
		var selectAllCol	= createColumnInRow(createRow, '', '', '', '', '', '');	
	
	var srNoCol				= createColumnInRow(createRow, '', '', '', 'center', '', '');

	var truckNoCol			= createColumnInRow(createRow, '', '', '', 'center', '', '');
	var lsNumberCol			= createColumnInRow(createRow, '', '', '', 'center', '', '');
	var lsDateTimeCol		= createColumnInRow(createRow, '', '', '', 'center', '', '');
	
	if(configuration.showFromSubRegionColumnByLS)
		var fromSubRegionCol = createColumnInRow(createRow, '', '', '', 'center', '', '');
	
	var fromBranchCol		= createColumnInRow(createRow, '', '', '', 'center', '', '');
	
	if(configuration.showToBranchColumnByLs)
		var toBranchCol			= createColumnInRow(createRow, '', '', '', 'center', '', '');

	if(configuration.showTotalNoOfWayBillsByLs)
		var noOfLrCol			= createColumnInRow(createRow, '', '', '', 'center', '', '');
	
	if(configuration.showTotalNoOfPendingWayBillsByLs)
		var noOfPendingLrCol	= createColumnInRow(createRow, '', '', '', 'center', '', '');

	if(configuration.showTotalNoOfPackagesByLs)
		var noOfArtCol			= createColumnInRow(createRow, '', '', '', 'center', '', '');

	if(configuration.showTotalNoOfPendingPackagesByLs)
		var noOfPendingArtCol	= createColumnInRow(createRow, '', '', '', 'center', '', '');

	if(configuration.showTotalNoOfActualWeightByls)
		var actWeightCol		= createColumnInRow(createRow, '', '', '', 'center', '', '');
	
	if(configuration.showTotalNoOfPendingActualWeightByLs)
		var actPendingWeightCol	= createColumnInRow(createRow, '', '', '', 'center', '', '');

	if(configuration.showLHPVNumberColumn)
		var lhpvNumberCol		= createColumnInRow(createRow, '', '', '', 'center', '', '');
	
	var driverICol			= createColumnInRow(createRow, '', '', '', 'center', '', '');
	
	if(configuration.showDriverMobileNumberCol)
		var driverMobileNoCol	= createColumnInRow(createRow, '', '', '', 'center', '', '');
	
	if(configuration.showDriver2Col)
		var driver2Col			= createColumnInRow(createRow, '', '', '', 'center', '', '');
	
	if(configuration.showTruckArrivalNumberCol)
		var trucArrivalNumber	= createColumnInRow(createRow, '', '', '', 'center', '', '');
	
	if(configuration.showTotalPaidAmountColumn)
		var totalPaidCol		= createColumnInRow(createRow, '', '', '', 'center', '', '');
	
	if(configuration.showTotalToPayAmountColumn)
		var totalToPayCol		= createColumnInRow(createRow, '', '', '', 'center', '', '');
	
	if(configuration.showTotalTBBAmountColumn)
		var totalTBBCol			= createColumnInRow(createRow, '', '', '', 'center', '', '');
		
	if(configuration.showTypeOfLSColumn)
		var typeOfLSCol			= createColumnInRow(createRow, '', '', '', 'center', '', '');
	
	let receiveCol			= createColumnInRow(createRow, '', '', '', 'center', '', '');
	let printTurCol			= createColumnInRow(createRow, '', '', '', 'center', '', '');
	
	if(configuration.showPrintPreloadingSheetButton)
		var printPreloadingSheetCol	 = createColumnInRow(createRow, '', '', '', 'center', '', '');
	
	if(configuration.vehicleNumberWiseUnloadingSheetPrint)
		appendValueInTableCol(selectAllCol, '<b>ALL</b>');
	
	appendValueInTableCol(srNoCol, '<b>Sr No.</b>');

	
	appendValueInTableCol(truckNoCol, '<b>Truck No.</b>');
	appendValueInTableCol(lsNumberCol, '<b>LS No.</b>');
	appendValueInTableCol(lsDateTimeCol, '<b>LS Date/Time</b>');
	
	if(configuration.showFromSubRegionColumnByLS) appendValueInTableCol(fromSubRegionCol, '<b>From SubRegion</b>');
	
	appendValueInTableCol(fromBranchCol, '<b>From Branch<br>/Loaded From</b>');
	
	if(configuration.showToBranchColumnByLs) appendValueInTableCol(toBranchCol, '<b>To Branch</b>');
	if(configuration.showTotalNoOfWayBillsByLs) appendValueInTableCol(noOfLrCol, '<b>Total LRs</b>');
	if(configuration.showTotalNoOfPendingWayBillsByLs) appendValueInTableCol(noOfPendingLrCol, '<b>Pending LRs</b>');
	if(configuration.showTotalNoOfPackagesByLs) appendValueInTableCol(noOfArtCol, '<b>Total Art.</b>');
	if(configuration.showTotalNoOfPendingPackagesByLs) appendValueInTableCol(noOfPendingArtCol, '<b>Pending Art.</b>');
	if(configuration.showTotalNoOfActualWeightByls) appendValueInTableCol(actWeightCol, '<b>Total Act. Wgt</b>');
	if(configuration.showTotalNoOfPendingActualWeightByLs) appendValueInTableCol(actPendingWeightCol, '<b>Pending Act. Wgt</b>');
	if(configuration.showLHPVNumberColumn) appendValueInTableCol(lhpvNumberCol, '<b>LHPV No.</b>');
	
	appendValueInTableCol(driverICol, '<b>Driver1 (Name / Lic No)</b>');
	
	if(configuration.showDriverMobileNumberCol) appendValueInTableCol(driverMobileNoCol, '<b>Driver1 (Mobile No)</b>');
	if(configuration.showDriver2Col) appendValueInTableCol(driver2Col, '<b>Driver2 (Name / Lic No)</b>');
	if(configuration.showTruckArrivalNumberCol) appendValueInTableCol(trucArrivalNumber, '<b>Truck Arrival No</b>');
	if(configuration.showTotalPaidAmountColumn) appendValueInTableCol(totalPaidCol, '<b>Paid</b>');
	if(configuration.showTotalToPayAmountColumn) appendValueInTableCol(totalToPayCol, '<b>To Pay</b>');
	if(configuration.showTotalTBBAmountColumn) appendValueInTableCol(totalTBBCol, '<b>TBB</b>');
	if(configuration.showTypeOfLSColumn) appendValueInTableCol(typeOfLSCol, '<b>Type Of LS</b>');
		
	appendValueInTableCol(receiveCol, '<b>Receive</b>');
	appendValueInTableCol(printTurCol, '<b>Print TUR</b>');
	
	if(configuration.showPrintPreloadingSheetButton)appendValueInTableCol(printPreloadingSheetCol, '<b>Print All</b>');
	
	if(configuration.vehicleNumberWiseUnloadingSheetPrint)
		createSelectAllCheckBoxFeild(selectAllCol);
	
	appendRowInTable('headingtr', createRow);
	
	//Header for total summary.
	$('#summaryHeaderTR').empty();
	
	var createRowForTotalSummary	= createRowInTable('', 'danger', '');
	
	var LRCount				= createColumnInRow(createRowForTotalSummary, '', '', '', 'center', '', '');
	var totalQuantity		= createColumnInRow(createRowForTotalSummary, '', '', '', 'center', '', '');
	var totalActualWeight	= createColumnInRow(createRowForTotalSummary, '', '', '', 'center', '', '');
	var paid				= createColumnInRow(createRowForTotalSummary, '', '', '', 'center', '', '');
	var toPay				= createColumnInRow(createRowForTotalSummary, '', '', '', 'center', '', '');
	
	if(configuration.showTotalTBBAmountColumn)
		var tbb				= createColumnInRow(createRowForTotalSummary, '', '', '', 'center', '', '');
	
	appendValueInTableCol(LRCount, '<b>LR Count</b>');
	appendValueInTableCol(totalQuantity, '<b>Total Quantity</b>');
	appendValueInTableCol(totalActualWeight, '<b>Total Receivable Weight</b>');
	appendValueInTableCol(paid, '<b>Paid</b>');
	appendValueInTableCol(toPay, '<b>To-Pay</b>');
	
	if(configuration.showTotalTBBAmountColumn)
		appendValueInTableCol(tbb, '<b>TBB</b>');
	
	appendRowInTable('summaryHeaderTR', createRowForTotalSummary);
	//Header for total summary END
}

function setResult(data) {
	if(receivablesModelList != null) {
		removeTableRows('results', 'tbody');
		removeTableRows('resultsSummaryOfTotal', 'tbody');
		
		for(let i = 0; i < receivablesModelList.length; i++) {
			var receivablesModelObj			= receivablesModelList[i];
			var srNo						= i + 1;
			var vehicleNumberId				= receivablesModelObj.vehicleNumberId;

			var dispatchLedgerId			= receivablesModelObj.dispatchLedgerId;
			var lsNumber					= receivablesModelObj.lsNumber;
			var	hours						= receivablesModelObj.hours;
			var	hoursDiffWithCurrentDay		= receivablesModelObj.hoursDiffWithCurrentDay;
			
			var createRow					= createRowInTable('checkBoxtr', receivablesModelObj.colorCode , '');
			
			if(configuration.vehicleNumberWiseUnloadingSheetPrint)
				var checkBoxCol					= createColumnInRow(createRow, '', 'expressLrs_'+ dispatchLedgerId+ ' dayWiseColorCode_'+ dispatchLedgerId, '', '', '', '');
			
			var srNoCol							= createColumnInRow(createRow, '', 'expressLrs_'+ dispatchLedgerId+ ' dayWiseColorCode_'+ dispatchLedgerId, '', '', '', '');
			var vehicleNumberCol				= createColumnInRow(createRow, '', 'expressLrs_'+ dispatchLedgerId+ ' dayWiseColorCode_'+ dispatchLedgerId, '', '', '', '');
			var receiveLinkCol					= createColumnInRow(createRow, 'DL' + dispatchLedgerId ,'expressLrs_'+ dispatchLedgerId+ ' dayWiseColorCode_'+ dispatchLedgerId,'', '', '', '');
			var dateCol							= createColumnInRow(createRow,  '', 'expressLrs_'+ dispatchLedgerId+ ' dayWiseColorCode_'+ dispatchLedgerId, '', 'right', '', '');
			
			if(configuration.showFromSubRegionColumnByLS)
				var fromSubRegionCol			= createColumnInRow(createRow,  '', 'expressLrs_'+ dispatchLedgerId+ ' dayWiseColorCode_'+ dispatchLedgerId, '', '', '', '');
				
			var wayBillSourceBranchCol			= createColumnInRow(createRow,  '', 'expressLrs_'+ dispatchLedgerId+ ' dayWiseColorCode_'+ dispatchLedgerId, '', '', '', '');
			
			if(configuration.showToBranchColumnByLs) 
				var wayBillDestinationBranchCol		= createColumnInRow(createRow,  '', 'expressLrs_'+ dispatchLedgerId+ ' dayWiseColorCode_'+ dispatchLedgerId, '', '', '', '');
		
			if(configuration.showTotalNoOfWayBillsByLs)
				var totalNoOfWayBillsCol			= createColumnInRow(createRow, '', 'expressLrs_'+ dispatchLedgerId+ ' dayWiseColorCode_'+ dispatchLedgerId, '', 'right', '', '');
			
			if(configuration.showTotalNoOfPendingWayBillsByLs)
				var totalNoOfPendingWayBillsCol		= createColumnInRow(createRow, '', 'expressLrs_'+ dispatchLedgerId+ ' dayWiseColorCode_'+ dispatchLedgerId, '', 'right', '', '');
			
			if(configuration.showTotalNoOfPackagesByLs)
				var totalNoOfPackagesCol			= createColumnInRow(createRow, 'WC' + dispatchLedgerId ,'expressLrs_'+ dispatchLedgerId+ ' dayWiseColorCode_'+ dispatchLedgerId, '', 'right', '', '');
			
			if(configuration.showTotalNoOfPendingPackagesByLs)
				var totalNoOfPendingPackagesCol		= createColumnInRow(createRow, 'WC' + dispatchLedgerId ,'expressLrs_'+ dispatchLedgerId+ ' dayWiseColorCode_'+ dispatchLedgerId, '', 'right', '', '');

			if(configuration.showTotalNoOfActualWeightByls)
				var totalActualWeightCol			= createColumnInRow(createRow, '', 'expressLrs_'+ dispatchLedgerId+ ' dayWiseColorCode_'+ dispatchLedgerId, '', 'right', '', '');
			
			if(configuration.showTotalNoOfPendingActualWeightByLs)
				var totalPendingActualWeightCol		= createColumnInRow(createRow, '', 'expressLrs_'+ dispatchLedgerId+ ' dayWiseColorCode_'+ dispatchLedgerId, '', 'right', '', '');
			
			if(configuration.showLHPVNumberColumn)
				var lhpvNumberCol				= createColumnInRow(createRow, '', 'expressLrs_'+ dispatchLedgerId+ ' dayWiseColorCode_'+ dispatchLedgerId, '', 'center', '', '');
			
			var driverCol						= createColumnInRow(createRow, '', 'expressLrs_'+ dispatchLedgerId+ ' dayWiseColorCode_'+ dispatchLedgerId, '', '', '', '');
			
			if(configuration.showDriver2Col)
				var driver2NameCol				= createColumnInRow(createRow, '', 'expressLrs_'+ dispatchLedgerId+ ' dayWiseColorCode_'+ dispatchLedgerId, '', 'center', '', '');
			
			if(configuration.showDriverMobileNumberCol)
				var driverMobileNoCol			= createColumnInRow(createRow, '', 'expressLrs_'+ dispatchLedgerId+ ' dayWiseColorCode_'+ dispatchLedgerId, '', '', '', '');

			if(configuration.showTruckArrivalNumberCol)
				var truckArrivalNumberCol			= createColumnInRow(createRow, '', 'expressLrs_'+ dispatchLedgerId+ ' dayWiseColorCode_'+ dispatchLedgerId, '', '', '', '');
			
			if(configuration.showTotalPaidAmountColumn)
				var totalPaidAmountCol			= createColumnInRow(createRow, '' + dispatchLedgerId ,'expressLrs_'+ dispatchLedgerId+ ' dayWiseColorCode_'+ dispatchLedgerId, '', 'right', '', '');
			
			if(configuration.showTotalToPayAmountColumn)
				var totalToPayAmountCol			= createColumnInRow(createRow, '' + dispatchLedgerId ,'expressLrs_'+ dispatchLedgerId+ ' dayWiseColorCode_'+ dispatchLedgerId, '', 'right', '', '');
			
			if(configuration.showTotalTBBAmountColumn)
				var totalTBBAmountCol			= createColumnInRow(createRow, '' + dispatchLedgerId ,'expressLrs_'+ dispatchLedgerId+ ' dayWiseColorCode_'+ dispatchLedgerId, '', 'right', '', '');
			
			if(configuration.showTypeOfLSColumn)
				var typeOfLS			= createColumnInRow(createRow, '' + dispatchLedgerId ,'expressLrs_'+ dispatchLedgerId+ ' dayWiseColorCode_'+ dispatchLedgerId, '', 'right', '', '');
			
			let receiveButtonCol				= createColumnInRow(createRow, '', 'expressLrs_'+ dispatchLedgerId+ ' dayWiseColorCode_'+ dispatchLedgerId, '', '', '', '');
			let printButtonCol					= createColumnInRow(createRow, '', '', '', '', '', '');
			
			if(configuration.showPrintPreloadingSheetButton)
				var printPreloadingSheetButtonCol	= createColumnInRow(createRow, '', '', '', '', '', '');
			
			appendValueInTableCol(srNoCol, srNo);
			appendValueInTableCol(vehicleNumberCol, receivablesModelObj.vehicleNumber);
			
			let receiveLinkFeild		= new Object();
			
			if(lsNumber == null)
				lsNumber = dispatchLedgerId;
				
			if(receivablesModelObj.isTransferLS)
				dispatchLedgerId	= receivablesModelObj.transferLedgerId;
			
			receiveLinkFeild.id			= 'receiveLink_' + dispatchLedgerId;
			receiveLinkFeild.html		=  lsNumber;
			receiveLinkFeild.style		= 'cursor: pointer';
			
			let receiveLinkAttr				= createHyperLink(receiveLinkFeild);
			
			appendValueInTableCol(receiveLinkCol, receiveLinkAttr);
			
			if(checkBoxCol != null) createCheckBoxFeild(checkBoxCol, dispatchLedgerId);
			
			createVehicleNoHiddenFeild(dateCol, dispatchLedgerId, vehicleNumberId);
			createTurInHiddenFeild(dateCol, dispatchLedgerId);
			createLsHiddenFeild(dateCol, dispatchLedgerId);
			appendValueInTableCol(dateCol, receivablesModelObj.dispatchDateTime);
			
			if(fromSubRegionCol != null) appendValueInTableCol(fromSubRegionCol, receivablesModelObj.wayBillSourceSubRegion);
			
			appendValueInTableCol(wayBillSourceBranchCol, receivablesModelObj.wayBillSourceBranch);

			if(wayBillDestinationBranchCol != null) appendValueInTableCol(wayBillDestinationBranchCol, receivablesModelObj.wayBillDestinationBranch);
			if(totalNoOfWayBillsCol != null) appendValueInTableCol(totalNoOfWayBillsCol, receivablesModelObj.totalNoOfWayBills);
			if(totalNoOfPendingWayBillsCol != null) appendValueInTableCol(totalNoOfPendingWayBillsCol, receivablesModelObj.totalNoOfPendingWayBills);
			if(totalNoOfPackagesCol != null) appendValueInTableCol(totalNoOfPackagesCol, receivablesModelObj.totalNoOfPackages);
			if(totalNoOfPendingPackagesCol != null) appendValueInTableCol(totalNoOfPendingPackagesCol, receivablesModelObj.totalNoOfPendingPackages);
			if(totalActualWeightCol != null) appendValueInTableCol(totalActualWeightCol, truncateToTwoDecimals(receivablesModelObj.totalActualWeight));
			if(totalPendingActualWeightCol != null) appendValueInTableCol(totalPendingActualWeightCol, truncateToTwoDecimals(receivablesModelObj.totalPendingActualWeight));
			if(lhpvNumberCol != null) appendValueInTableCol(lhpvNumberCol, receivablesModelObj.lHPVNumber);

			appendValueInTableCol(driverCol, (receivablesModelObj.driver).replace("\\", ""));
			
			if(configuration.showDriver2Col) appendValueInTableCol(driver2NameCol, receivablesModelObj.driver2Name);
			
			createReceiveButton(receiveButtonCol, dispatchLedgerId);
			createPrintButton(printButtonCol, dispatchLedgerId);
			
			if(printPreloadingSheetButtonCol != null) createPrintPreloadingSheetButton(printPreloadingSheetButtonCol, dispatchLedgerId);
			
			if(driverMobileNoCol != null) appendValueInTableCol(driverMobileNoCol, receivablesModelObj.driverMobileNumber);
			if(truckArrivalNumberCol != null) appendValueInTableCol(truckArrivalNumberCol, receivablesModelObj.truckArrivalNumber);
			if(totalPaidAmountCol != null) appendValueInTableCol(totalPaidAmountCol, receivablesModelObj.lsWisePaidBookingTotal);
			if(totalToPayAmountCol != null) appendValueInTableCol(totalToPayAmountCol, receivablesModelObj.lsWiseToPayBookingTotal);
			if(totalTBBAmountCol != null) appendValueInTableCol(totalTBBAmountCol, receivablesModelObj.lsWiseTbbBookingTotal);
			if(typeOfLS != null) appendValueInTableCol(typeOfLS, receivablesModelObj.typeOfLSName);
			
			appendRowInTable('results', createRow);
			
			$("#receiveLink_" + dispatchLedgerId).bind("click", function() {
				openWindowForReceivables(this);
			});
			
			$("#receiveButton_" + dispatchLedgerId).bind("click", function() {
				openWindowForReceivables(this);
			});
			
			$("#printPreloadingSheetButton_" + dispatchLedgerId).bind("click", function(event) {
				event.preventDefault();
				printPreloadingSheet(this);
			});
			
			if(receivablesModelObj.shaded) setColorToRow(dispatchLedgerId);
			
			if(receivablesModelObj.isExpressLRDispatch != undefined && receivablesModelObj.isExpressLRDispatch) {
				$('.expressLrs_' + dispatchLedgerId).css('background-color', '#00BFFF');
				$('.expressLrs_' + dispatchLedgerId).css('font-weight', 'bold');
				$('.expressLrs_' + dispatchLedgerId).css('font-style', 'oblique');
				$('.expressLrs_' + dispatchLedgerId).css('color', '#fbf5fb');
			}
			
			if(isColorCodeWiseReceiveAllowedByDays) {
				var diffHours = Number(hours) - Number(hoursDiffWithCurrentDay);
				
				if(Number(hoursDiffWithCurrentDay) > Number(hours)) {
					$('.dayWiseColorCode_' + dispatchLedgerId).css('background-color' , '#F38E8E');
					$('.dayWiseColorCode_' + dispatchLedgerId).css('font-weight' , 'bold');
					$('.dayWiseColorCode_' + dispatchLedgerId).css('font-style' , 'oblique');
				} else if(Number(hoursDiffWithCurrentDay) <= Number(hours) && Number(diffHours) <= Number(colorCodeWiseReceiveAllowedMinHours)) {
					$('.dayWiseColorCode_' + dispatchLedgerId).css('background-color' , '#32CD32');
					$('.dayWiseColorCode_' + dispatchLedgerId).css('font-weight' , 'bold');
					$('.dayWiseColorCode_' + dispatchLedgerId).css('font-style' , 'oblique');
				}
			}
			
			if(receivablesModelObj.isTceDispatch != undefined && receivablesModelObj.isTceDispatch) {
				$('.expressLrs_' + dispatchLedgerId).css({'background-color': '#1878f3', 'color': 'white'});
				$('#receiveLink_' + dispatchLedgerId).css({'background': 'white', 'padding': '2px', 'border-radius': '3px'});
				$('#receiveButton_' + dispatchLedgerId).addClass('btn-success')
				$('#receiveButton_' + dispatchLedgerId).removeClass('btn-primary')
			}
		}
		
		//Data for total summary.
		let createRowForTotalSummaryData	= createRowInTable('','dark' , '');
		
		let totalNoOfLRsColumn				= createColumnInRow(createRowForTotalSummaryData, '', '', '', 'center', '', '');
		let totalLRsQuantityColumn			= createColumnInRow(createRowForTotalSummaryData, '', '', '', 'center', '', '');
		let totalActualWeightColumn			= createColumnInRow(createRowForTotalSummaryData, '', '', '', 'center', '', '');
		let totalPaidColumn					= createColumnInRow(createRowForTotalSummaryData, '', '', '', 'center', '', '');
		let totalToPayColumn				= createColumnInRow(createRowForTotalSummaryData, '', '', '', 'center', '', '');
		
		if(configuration.showTotalTBBAmountColumn)
			var totalTBBColumn				= createColumnInRow(createRowForTotalSummaryData, '', '', '', 'center', '', '');
		
		appendValueInTableCol(totalNoOfLRsColumn, data.totalLRS);
		appendValueInTableCol(totalLRsQuantityColumn, data.totalDispatchQuantity);
		appendValueInTableCol(totalActualWeightColumn, data.totalDispatchedWeight);
		appendValueInTableCol(totalPaidColumn, data.paidBookingTotal);
		appendValueInTableCol(totalToPayColumn, data.toPayBookingTotal);
		
		if(totalTBBColumn != null)
			appendValueInTableCol(totalTBBColumn, data.tbbBookingTotal);
		
		appendRowInTable('resultsSummaryOfTotal', createRowForTotalSummaryData);
		//Data for total summary END.
	}
}

function checkAll() {
	$('.datatdCheckBox').prop('checked', $("#selectAllCol").prop("checked"));
}

function createSelectAllCheckBoxFeild(checkBoxCol) {
	let checkBoxFeild		= new Object();

	checkBoxFeild.type		= 'checkbox';
	checkBoxFeild.name		= 'selectAllCol';
	checkBoxFeild.id		= 'selectAllCol';
	checkBoxFeild.class		= 'datatd';
	checkBoxFeild.value		= 'Select All';
	checkBoxFeild.onclick	= 'checkAll();';

	createInput(checkBoxCol, checkBoxFeild);
}

function createCheckBoxFeild(checkBoxCol, dispatchLedgerId) {
	let checkBoxFeild		= new Object();
	checkBoxFeild.type		= 'checkbox';
	checkBoxFeild.name		= 'dispatchLedgerIds';
	checkBoxFeild.id		= 'dispatchLedgerId_' + dispatchLedgerId;
	checkBoxFeild.class		= 'datatdCheckBox';
	checkBoxFeild.value		= dispatchLedgerId;

	createInput(checkBoxCol, checkBoxFeild);
}

function createVehicleNoHiddenFeild(checkBoxCol, dispatchLedgerId, vehicleNumberId) {
	let checkBoxFeild		= new Object();

	checkBoxFeild.type		= 'hidden';
	checkBoxFeild.name		= 'vehicleMasterIds';
	checkBoxFeild.id		= 'vehicleMasterId_' + dispatchLedgerId;
	checkBoxFeild.class		= 'datatd';
	checkBoxFeild.value		= vehicleNumberId;
	
	createInput(checkBoxCol, checkBoxFeild);
}

function createTurInHiddenFeild(dateCol, dispatchLedgerId) {
	let turInHiddenFeild		= new Object();
	
	turInHiddenFeild.type		= 'hidden';
	turInHiddenFeild.name		= 'TUR_' + dispatchLedgerId;
	turInHiddenFeild.id			= 'TUR_' + dispatchLedgerId;
	
	createInput(dateCol, turInHiddenFeild);
}

function createLsHiddenFeild(dateCol, dispatchLedgerId) {
	let lsHiddenFeild			= new Object();
	
	lsHiddenFeild.type			= 'hidden';
	lsHiddenFeild.name			= 'LS_' + dispatchLedgerId;
	lsHiddenFeild.id			= 'LS_' + dispatchLedgerId;
	
	createInput(dateCol, lsHiddenFeild);
}

function createPrintPreloadingSheetButton(printPreloadingSheetButtonCol, dispatchLedgerId) {
	let printPreloadingSheetButton			= new Object();
	
	printPreloadingSheetButton.name			= 'printPreloadingSheetButton_' + dispatchLedgerId;
	printPreloadingSheetButton.id			= 'printPreloadingSheetButton_' + dispatchLedgerId;
	printPreloadingSheetButton.html			= 'PrintAll';
	printPreloadingSheetButton.type			= 'button';
	printPreloadingSheetButton.class		= 'btn btn-primary';
	
	createButton(printPreloadingSheetButtonCol, printPreloadingSheetButton);
}

function createPrintButton(printButtonCol, dispatchLedgerId) {
	let printButton			= new Object();
	
	printButton.name		= 'printButton_' + dispatchLedgerId;
	printButton.id			= 'printButton_' + dispatchLedgerId;
	printButton.value		= 'Print';
	printButton.class		= 'btn blue';
	printButton.onclick		= 'printTUR("'+dispatchLedgerId+'")';
	printButton.disabled	= 'disabled';
	printButton.type		= 'button';
	
	createInput(printButtonCol, printButton);
}

function createReceiveButton(receiveButtonCol, dispatchLedgerId) {
	var receiveButton		= new Object();
	
	receiveButton.name		= 'receiveButton_' + dispatchLedgerId;
	receiveButton.id		= 'receiveButton_' + dispatchLedgerId;
	receiveButton.html		= 'Receive';
	receiveButton.type		= 'button';
	receiveButton.class		= 'btn btn-primary';
	
	createButton(receiveButtonCol, receiveButton);
}

function printPreloadingSheet(obj) {
	let dispatchLedgerId	= (obj.id).split('_')[1];
	window.open('/ivcargo/SearchWayBill.do?pageId=340&eventId=10&modulename=preunloadingsheet&masterid=' + dispatchLedgerId,  'newwindow', config='height=600,width=850, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function openWindowForReceivables(obj) {
	let selecteFilter		= 1;
	let dispatchLedgerId	= (obj.id).split('_')[1];
	
	if(reportModelHM == null || !reportModelHM.hasOwnProperty(dispatchLedgerId))
		return;
	
	let	receivablesModelObj	= reportModelHM[dispatchLedgerId];

	let isFlagToReceive		= receivablesModelObj.flagToReceive;
	let lsDesBranchId		= receivablesModelObj.destinationBranchId;
	let handlingBranchId	= receivablesModelObj.handlingBranchId;
	let isInterBranchLs		= receivablesModelObj.interBranchLs;
	let isReceiveLock		= receivablesModelObj.receiveLock;
	let lhpvId				= receivablesModelObj.lhpvId;
	
	if (configuration.validateLhpvForUnloadLS && lhpvId == 0) {
		showMessage('error', "LHPV Not Created, Please Create LHPV First Then Unload the Vehicle !");
		return false;  
	}
	
	if(configuration.allowReceiveLsWithLhpvCreated) {
		if(lhpvId == 0 && !isInterBranchLs) {//3 Inter branch 
			allwoReceiver(receivablesModelObj);
			return;
		} else if(configuration.allowReceiveInterBranchLs && isInterBranchLs) {
			if(executive.branchId == lsDesBranchId || executive.branchId == handlingBranchId) {
				//allow to receive
			} else {
				doNotAllowReceive();
				return;
			}
		}
	}
	
	if(configuration.allowReceiveLocking && isPendingReceive && isReceiveLock) {
		showMessage('info', iconForInfoMsg + ' Please first RECEIVE THE loading sheet  older than ' + configuration.noOfDaysAfterLSCreated + ' days.');
		return;
	}
	
	let parameters = '&selecteFilter='+selecteFilter+'&dispatchLedgerId='+dispatchLedgerId+'&flag='+isFlagToReceive+'&isForceReceive='+isForceReceive;
	
	if(isShowOctroiConfig && !isInterBranchLs) {
		if(executive.stateId == state.STATE_ID_MAHARASHTRA) {
			let answer = confirm ("Do you want to configure Octroi for LS No " + $('#receiveLink_' + dispatchLedgerId).html() + " ?");
			
			if(answer)
				openOctroiConfig(parameters);
			else
				veiwReceivables(parameters);
		} else
			veiwReceivables(parameters);
	} else
		veiwReceivables(parameters);
}

function openOctroiConfig(parameters) {
	childwin = window.open ('ChargeConfig.do?pageId=219&eventId=3' + parameters , 'newwindow',config='height=600,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function veiwReceivables(parameters) {
	if(popupWindowToReceiveLS)
		childwin = window.open ('ViewReceivableWaybill.do?pageId=221&eventId=3' + parameters, 'newwindow', config='height=600,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	else
		window.open ('ViewReceivableWaybill.do?pageId=221&eventId=3' + parameters , config='height=600,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function allwoReceiver(receivablesModelObj) {
	if(configuration.allowReceiveLocking && isPendingReceive && receivablesModelObj.receiveLock) {
		showMessage('info', iconForInfoMsg + ' Please first RECEIVE THE loading sheet  older than ' + configuration.noOfDaysAfterLSCreated + ' days.');
		return;
	}
	
	let jsonObject		= new Object();
	jsonObject.vehicleNumberId			= receivablesModelObj.vehicleNumberId;
	jsonObject.wayBillSourceBranchId	= receivablesModelObj.wayBillSourceBranchId;
	jsonObject.nextDate					= receivablesModelObj.nextDate;
	jsonObject.dispatchDate				= receivablesModelObj.dispatchDateStr;
	jsonObject.accountGroupId			= receivablesModelObj.accountGroupId;
	jsonObject.wayBillDestBranchId		= receivablesModelObj.destinationBranchId;
	jsonObject.filter					= 5;
	
	let vehicleNumber					= receivablesModelObj.vehicleNumber;

	let jsonStr = JSON.stringify(jsonObject);
	
	$.getJSON("LHPVAjaxAction.do?pageId=228&eventId=3",
			{json:jsonStr}, function(data) {	
				if(data.recivablesModel != undefined) {
					let billNumber = data.recivablesModel.LHPVNumber;

					if(billNumber != undefined && (billNumber > 0 || billNumber != "0"))
						showMessage('info', iconForInfoMsg + ' Please append LS in LHPV No. ' + billNumber);
					else
						showMessage('info', iconForInfoMsg + ' LHPV not found. Please create LHPV On Vechile No. ' + vehicleNumber);
				}
			});
	
}

function setColorToRow(id) {
	$("#DL" + id).css('background-color','#a2a19c9e');
}

function doNotAllowReceive() {
	showMessage('info', iconForInfoMsg + ' Can not Receive Inter Branch LS in other Destination Branch !');
}
	
function getPreUnloadingSheetForPrint() {
	let selectedDispatchLedgerIdArray	= getAllCheckBoxSelectValue('dispatchLedgerIds');
		
	if(selectedDispatchLedgerIdArray.length == 0) {
		showMessage('error', 'Please Select Atleast 1 LS !');
		return;
	}
		
	let vehicleMasterIds	= getAllCheckBoxSelectValue('vehicleMasterIds');
	let vehicleidArray		= new Array();
		
	for(const element of selectedDispatchLedgerIdArray) {
		vehicleidArray.push($('#vehicleMasterId_' + element).val());
	}
		
	const uniqueElements = new Set(vehicleidArray);
		
	if(uniqueElements.size > 1) {
		showMessage('error', 'Please Select LS of same Vehicle!'); 
		return;
	}
		
	let selectedDispatchLedgerIds	= selectedDispatchLedgerIdArray.join(",");

	if(selectedDispatchLedgerIds != "") {
		localStorage.setItem("selectedDispatchLedgerIds", selectedDispatchLedgerIds);
		window.open('/ivcargo/SearchWayBill.do?pageId=340&eventId=10&modulename=preunloadingsheet',  'newwindow', config='height=600,width=850, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	}
}

function showHideDate() {
	if($("#searchByDate").prop("checked"))
		$('#dateRangeSelection').removeClass('hide');
	else
		$('#dateRangeSelection').addClass('hide');
}

function openWindowForReceiveTransferLS(obj) {
	var transferLedgerId	= (obj.id).split('_')[1];
	
	window.open ('ViewReceivableWaybill.do?pageId=340&eventId=1&modulename=transferReceiveLedger&masterid=' + transferLedgerId, config='height=600,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}