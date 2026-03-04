/**
 * 
 */

var totalCrossingRate		= 0;
//var deliveryCommission		= 0;
var otherCharge				= 0;
var balanceAmount			= 0;
var totalPayable			= 0;
var totalCollection			= 0;
var issueCity				= null;
var bookingTypeId			= 0;



/*function printLhpvWindow() {
	$("#tableContain").load( "/ivcargo/jsp/print/lhpv/239/aciplLHPVPrint.html", function() {
		window.setTimeout(printAfterDelay, 500);	
		setPrintData();
	});
}*/
/*
function printAfterDelay() {
	window.print();
	window.close();
}*/

function setPrintData() {
	setDataInTable();
	setVehicleDetails();
	setDriverDetails();
	setLoadingSheetDetails();
	setCharges();
	//setLoadingUnloadingCharge();
	setCrossingRate();
	setTotalPayable();
	setDebitCredit();
	setCompanyDetails(reportViewModel.accountGroupName);
}

function setDataInTable() {
	var destAddress = null;
	setValueToHtmlTag('issuedBranch', loggedInBranchDetails.name);
	setValueToHtmlTag('from', lhpvModel.sourceBranch);
	setValueToHtmlTag('to', lhpvModel.destinationBranch);
	setValueToHtmlTag('lhpvNo', lhpvModel.lhpvNumber);
	setValueToHtmlTag('lhpvDate', getDateFromTimestamp(lhpvModel.creationDateTimeStamp, 2));
	setValueToHtmlTag('remark', lhpvModel.remark);
	setValueToHtmlTag('createdBy', executive.name);
	issueCity = "("+executive.subRegionName+")";
	setValueToHtmlTag('issueCity', issueCity);
	destAddress = lhpvModel.destinationBranch+" ("+lhpvModel.destinationAddress.substring(0, 28)+" )";
	setValueToHtmlTag('destAddress',destAddress );
	//setValueToHtmlTag('lsNumber', lhpvModel.lsNumber);
	setValueToHtmlTag('AgentName', lhpvModel.vehicleAgentName);
}

function setVehicleDetails() {
	setValueToHtmlTag('registerdAt', vehicleNumberMaster.registeredAtRTO);
	setValueToHtmlTag('make', vehicleNumberMaster.make);
	setValueToHtmlTag('model', vehicleNumberMaster.model);
	//setValueToHtmlTag('color', '');
	setValueToHtmlTag('chasisNo', vehicleNumberMaster.chasisNumber);
	setValueToHtmlTag('engineNo', vehicleNumberMaster.engineNumber);
	//setValueToHtmlTag('fitnessValidUpto', vehicleNumberMaster.registeredAtRTO);
	//setValueToHtmlTag('permitNo', vehicleNumberMaster.registeredAtRTO);
	//setValueToHtmlTag('date', vehicleNumberMaster.registeredAtRTO);
	//setValueToHtmlTag('validUpto', vehicleNumberMaster.registeredAtRTO);
	//setValueToHtmlTag('insuredWith', vehicleNumberMaster.registeredAtRTO);
	//setValueToHtmlTag('divnNo', vehicleNumberMaster.registeredAtRTO);
	setValueToHtmlTag('lorryNo', vehicleNumberMaster.vehicleNumber);
	setValueToHtmlTag('registeredOwner', vehicleNumberMaster.registeredOwner);
	setValueToHtmlTag('ownerPanNo', vehicleNumberMaster.panNumber);
}

function setDriverDetails() {
	if(driverMasterModel.name != null) {
		setValueToHtmlTag('driverName', driverMasterModel.name);
	} else {
		setValueToHtmlTag('driverName', 'NA');
	}
	
	if(driverMasterModel.address != null) {
		setValueToHtmlTag('address', driverMasterModel.address);
	} else {
		setValueToHtmlTag('address', 'NA');
	}
	
	if(driverMasterModel.mobileNumber != null) {
		setValueToHtmlTag('mobileNo', driverMasterModel.mobileNumber);
	} else {
		setValueToHtmlTag('mobileNo', 'NA');
	}
	
	if(driverMasterModel.licenceNumber != null) {
		setValueToHtmlTag('licenseNo', driverMasterModel.licenceNumber);
	} else {
		setValueToHtmlTag('licenseNo', 'NA');
	}
	
	if(driverMasterModel.issueDate != null) {
		setValueToHtmlTag('licenseDate', driverMasterModel.issueDate);
	} else {
		setValueToHtmlTag('licenseDate', 'NA');
	}
	
	if(driverMasterModel.issuedBy != null) {
		setValueToHtmlTag('issuedBy', driverMasterModel.issuedBy);
	} else {
		setValueToHtmlTag('issuedBy', 'NA');
	}
	
	if(driverMasterModel.validUptoDate != null) {
		setValueToHtmlTag('licenseValidUpto', driverMasterModel.validUptoDate);
	} else {
		setValueToHtmlTag('licenseValidUpto', 'NA');
	}
}

function setLoadingSheetDetails() {
	
	var totalPakgs			= 0;
	var totalWeight			= 0;
	var wayBillTypeSummary	= null;
	var topayGTAmount		= 0;
	totalCollection			= 0;
	var totalWeightDelComm	= 0;
	var paidGTAmount		= 0;
	var tbbGTAmount			= 0;
	var totalAmount			= 0;
	var totalAmountOfLs		= 0;
	
	if(dispatchLedgerArrlist != null) {
		for(var i = 0; i < dispatchLedgerArrlist.length; i++) {
			var sourceSubRegion = null;
			var destSubRegion	= null;
			var loadingSheet	= dispatchLedgerArrlist[i];
			bookingTypeId		= loadingSheet.bookingTypeId;
			var lsNumber		= loadingSheet.lsNumber;
			var packgs			= loadingSheet.totalNoOfPackages;
			var weight			= loadingSheet.totalActualWeight;
			var totalNoOfWayBills	= loadingSheet.totalNoOfWayBills;
			 	sourceSubRegion	= "( "+loadingSheet.sourceSubRegion+" )";
			 	destBranch	= loadingSheet.destinationBranch;
			if(waybillTypeHshmp != null) {
				for(var key in waybillTypeHshmp) {
					if(key == loadingSheet.dispatchLedgerId) {
						wayBillTypeSummary	= waybillTypeHshmp[key];
						
						topayGTAmount	= wayBillTypeSummary.totalToPayAmount;
						paidGTAmount	= wayBillTypeSummary.totalPaidAmount;
						tbbGTAmount		= wayBillTypeSummary.totalCreditAmount;
					}
				}
			}
			
			totalCollection			+= topayGTAmount;
			totalPakgs				+= packgs;
			totalPaidCollection		+= paidGTAmount;
			totalTbbCollection		+= tbbGTAmount;
			totalAmount				= topayGTAmount + paidGTAmount + tbbGTAmount;
			totalAmountOfLs			+= totalAmount;
			console.log("totalAmountOfLs_0 ",totalAmountOfLs)
			
			if(loadingSheet.bookingTypeId != bookingTypeConstant.DIRECT_DELIVERY_DIRECT_VASULI_ID){
				totalWeight			+= weight;
			}
			
			var row				= createRowInTable('loadingSheet_' + (i + 1), '', 'height: 10px;');
			
			var srNoCol			= createColumnInRow(row, 'srNumber_' + (i + 1), '', '', '', '', '');
			var lsCol			= createColumnInRow(row, 'lsNumber_' + (i + 1), '', '', '', '', '');
			var destCol			= createColumnInRow(row, 'dest_' + (i + 1), '', '', '', '', '');
			var totalNoOfLrsCol		= createColumnInRow(row, 'totalNoOfLrs_' + (i + 1), '', '', '', '', '');
			var totalAmtCol		= createColumnInRow(row, 'totalAmt_' + (i + 1), '', '', '', '', '');
			var totalTbbCollection	= createColumnInRow(row, 'totalTbbCollection_' + (i + 1), '', '', '', '', '');
			var totalPaidCollection	= createColumnInRow(row, 'totalPaidCollection_' + (i + 1), '', '', '', '', '');
			var packgsCol		= createColumnInRow(row, 'packgs_' + (i + 1), '', '', '', '', '');
			var weightCol		= createColumnInRow(row, 'weight_' + (i + 1), '', '', '', '', '');
			var totalAmountCol		= createColumnInRow(row, 'totalAmount_' + (i + 1), '', '', '', '', '');
			appendValueInTableCol(srNoCol, i + 1);
			appendValueInTableCol(lsCol, lsNumber);
			appendValueInTableCol(destCol, destBranch);
			appendValueInTableCol(totalNoOfLrsCol, totalNoOfWayBills);
			appendValueInTableCol(totalAmtCol, Math.round(topayGTAmount));
			appendValueInTableCol(totalTbbCollection, Math.round(tbbGTAmount));
			appendValueInTableCol(totalPaidCollection, Math.round(paidGTAmount));
			appendValueInTableCol(packgsCol, Math.round(packgs));
			appendValueInTableCol(weightCol, Math.round(weight));
			appendValueInTableCol(totalAmountCol, Math.round(totalAmount));
			
			appendRowInTable('loadingSheetDetails', row);
			
			if(dispatchLedgerArrlist.length == 1){
				$("#totalRow").css("display","none");
			}
		}
		
		totalWeightDelComm = truckDeliverySummaryValObject.tdActWeightForDelComm;
		
		  if(sourceSubRegion != null) {
			  setValueToHtmlTag('sourceSubRegion', sourceSubRegion);
		  }
		  if(destSubRegion != null) {
			  setValueToHtmlTag('destSubRegion', destSubRegion);
		  }
		setValueToHtmlTag('totalCollection', Math.round(totalCollection));
		setValueToHtmlTag('recievingPkgs', Math.round(totalPakgs));
		setValueToHtmlTag('totalAmountOfLs', Math.round(totalAmountOfLs));
		setValueToHtmlTag('totalPakgs', Math.round(totalPakgs));
		setValueToHtmlTag('totalWeight', Math.round(totalWeight));
		//deliveryCommission	= 0.05 * totalWeightDelComm;
		//deliveryCommission	= 0.05 * totalWeight;
		//setValueToHtmlTag('deliveryCommission', Math.round(deliveryCommission));
		setValueToHtmlTag('noInWords', convertNumberToWord(totalPakgs));
	}
}

function setCharges() {
	
	var lhpvSettlementCharges	= null;
	var lorryHireAmt			= 0;
	var advancedPaid			= 0;
	balanceAmount				= 0;
	
	if(lhpvChargesAmt != null) {
		
		for(var key in lhpvChargesAmt) {
			if(key == LHPVChargeTypeConstant.LORRY_HIRE) {
				lhpvSettlementCharges	= lhpvChargesAmt[key];
				lorryHireAmt			= lhpvSettlementCharges.chargeAmount;
				setValueToHtmlTag('lorryHireAmt', lorryHireAmt);
			} else if(key == LHPVChargeTypeConstant.ADVANCE_AMOUNT) {
				lhpvSettlementCharges	= lhpvChargesAmt[key];
				advancedPaid			= lhpvSettlementCharges.chargeAmount;
				setValueToHtmlTag('advancedPaid', advancedPaid);
			} else if(key == LHPVChargeTypeConstant.OTHER_ADDITIONAL) {
				lhpvSettlementCharges	= lhpvChargesAmt[key];
				otherCharge				= lhpvSettlementCharges.chargeAmount;
				setValueToHtmlTag('otherCharge', otherCharge);
			}
		}
		
		balanceAmount		= Math.round(lorryHireAmt - advancedPaid);
		
		setValueToHtmlTag('balanceAmt', balanceAmount);
	}
}

function setLoadingUnloadingCharge() {
	
	var wayBillViewModel	= null;
	var netLoading			= 0;
	var netUnloading		= 0;
	
	if(lhpvModels != null) {
		for(var i = 0; i < lhpvModels.length; i++) {
			
			var row			= createRowInTable('', '', '');
			
			if(netLoadUnloadChargeHM != null) {
				for(var key in netLoadUnloadChargeHM) {
					if(key == lhpvModels[i].dispatchLedgerId) {
						wayBillViewModel	= netLoadUnloadChargeHM[key];
						
						netLoading			= wayBillViewModel.netLoading;
						netUnloading		= wayBillViewModel.netUnloading;
					}
				}
			}
			
			var netLoadingCol			= createColumnInRow(row, 'netLoading_' + (i + 1), '', '', '', '', '');
			var netUnloadingCol			= createColumnInRow(row, 'netUnloading_' + (i + 1), '', '', '', '', '');
			
			appendValueInTableCol(netLoadingCol, netLoading);
			appendValueInTableCol(netUnloadingCol, netUnloading);
			
			appendRowInTable('netLoadingUnloadingCharge', row);
		}
	}
}

function setCrossingRate() {
	var crossingRate		= null;
	var crossingRateAmt		= 0;
	
	totalCrossingRate		= 0;
	
	if(lhpvModels != null) {
		for(var i = 0; i < lhpvModels.length; i++) {
			
			var row			= createRowInTable('', '', '');
			
			if(totalCrossingRateHM != null) {
				for(var key in totalCrossingRateHM) {
					if(key == lhpvModels[i].dispatchLedgerId) {
						crossingRate	= totalCrossingRateHM[key];
						
						crossingRateAmt	= crossingRate.rate;
					}
				}
			}
			
			totalCrossingRate	+= crossingRateAmt;
			
			var totalCrossingRateCol		= createColumnInRow(row, 'totalCrossingRateCol_' + (i + 1), '', '', '', '', '');
			
			appendValueInTableCol(totalCrossingRateCol, crossingRateAmt);
			
			//appendRowInTable('totalCrossingRate', row);
		}
		
		setValueToHtmlTag('crossingHire', totalCrossingRate);
	}
}

function setTotalPayable() {
	totalPayable	= 0;
	
	totalPayable	= Math.round(balanceAmount + totalCrossingRate + otherCharge);
	
	setValueToHtmlTag('totalPayable', totalPayable);
}

function setDebitCredit() {
	var debitCreditRuppes			= totalCollection - totalPayable;
	
	setValueToHtmlTag('pleasePayRuppes', Math.round(totalPayable));
	setValueToHtmlTag('pleasePayRuppesInWords', convertNumberToWord(Math.round(totalPayable)) + ' Rs. only');
	setValueToHtmlTag('debitCredit', Math.round(debitCreditRuppes));
}
function setCompanyDetails(companyName){
	setValueToHtmlTag('companyName', companyName);
	setValueToHtmlTag('companyAddress', reportViewModel.branchAddress);
	if(reportViewModel.branchContactDetailMobileNumber != null){
		setValueToHtmlTag('companyMob', reportViewModel.branchContactDetailMobileNumber);
	}else if(reportViewModel.branchContactDetailMobileNumber2 != null) {
		setValueToHtmlTag('companyMob', reportViewModel.branchContactDetailMobileNumber2);
	}else{
		setValueToHtmlTag('companyMob', " ");
	}
}