/**
 *  modified by manish singh 26-07-2016
 */

var totalCrossingRate		= 0;
var deliveryCommission		= 0;
var otherCharge				= 0;
var balanceAmount			= 0;
var totalPayable			= 0;
var totalCollection			= 0;
var truckLoadType			= 0;
var groupData;
var groupObj;

function printLhpvWindow() {
	$("#tableContain").load( "/ivcargo/jsp/print/lhpv/368/nmlLHPVPrint.html", function() {
		printAfterDelay();

		//setPrintData();
		selectCompany();
	});
}


function selectCompany(){
	var lhpvDetails = lhpvCompanyDetails;

	groupData = _.groupBy(lhpvDetails, function(num){ return num['accountGroupPrintConstant']; });
	groupObj = _.keys(groupData)
	if(groupObj.length < 2 ){
		return;
	}
	$('#selectCompanyName').append($('<label><input type="radio" name="groupName" value="Original">Original Print </label><br>'))
	_.each(groupObj,function(grouName){
		$('#selectCompanyName').append($('<label><input type="radio" name="groupName" value="'+grouName+'">'+grouName+' </label><br>'))
	})

}

$("#print").click(function(){
	getCompanyName();
	window.print();
})

$("#view").click(function(){
	getCompanyName();
})

function printAfterDelay() {
	ShowDialogForPrint();
	/*window.print();
	window.close();*/
}

function setPrintData() {
	setCompanyDetails(reportViewModel.accountGroupName);
	setDataInTable();
	setLoadingSheetDetails();
	setCharges();
}

function setDataInTable() {
	setValueToHtmlTag('from', reportData.sourceBranchString);
	setValueToHtmlTag('to', reportData.destinationBranchString);
	setValueToHtmlTag('lhpvNo', lhpvModel.lhpvNumber);
	setValueToHtmlTag('lhpvDate', getDateInDMYFromTimestamp(lhpvModel.creationDateTimeStamp, 1));
	setValueToHtmlTag('remark', lhpvModel.remark);
	setValueToHtmlTag('createdBy', executive.name);
	setValueToHtmlTag('lsNumber', reportData.lsNumber);
	setValueToHtmlTag('agentName', reportData.vehicleAgentName);
	setValueToHtmlTag('panNumber', reportData.panNumber);
	setValueToHtmlTag('lorryNo', reportData.vehicleNumber);
	setValueToHtmlTag('balancePayableAtBranch', reportData.balancePayableAtBranch);
}


function setLoadingSheetDetails() {
	var lrs			= 0;
	var pkgs		= 0;
	var wgt			= 0;
	var dds			= 0;
	var capacity	= 0;
	var actWgt		= 0;
	var lessWgt		= 0;
	var boliWgt		= 0;
	var actwghtfroNml	= 0; 
	
	if(loadingSheetDetails != null) {
		truckLoadType 	= loadingSheetDetails[0].truckLoadType;
		for(var i = 0; i < loadingSheetDetails.length; i++) {
			lrs 		+= loadingSheetDetails[i].totalNoOfWayBills;
			pkgs		+= loadingSheetDetails[i].totalNoOfPackages;
			wgt			+= loadingSheetDetails[i].totalActualWeight;
			dds			+= loadingSheetDetails[i].totalNoOfDoorDelivery;
			actWgt		+= loadingSheetDetails[i].totalActualWeight;
			boliWgt		= loadingSheetDetails[i].boliWeight;
			truckLoadType	= loadingSheetDetails[i].truckLoadType;
			//actwghtfroNml	= actWgt -(5 * pkgs);
		}
		setValueToHtmlTag('lrs', lrs);
		setValueToHtmlTag('pkgs', pkgs);
		setValueToHtmlTag('wgt', wgt);
		setValueToHtmlTag('dds', dds);
		setValueToHtmlTag('actWgt', actWgt);
		setValueToHtmlTag('boliWgt', boliWgt);
		setValueToHtmlTag('actwghtfroNml', wgt);
		if(truckLoadTypeConstant[truckLoadType] != undefined){
			setValueToHtmlTag('loadType', truckLoadTypeConstant[truckLoadType]);
		}else{
			setValueToHtmlTag('loadType', '--');
		}
	}
}

function setCompanyDetails(companyName) {
	setValueToHtmlTag('companyName', companyName);
	setValueToHtmlTag('companyAddress', reportViewModel.branchAddress);
}

function calculateCharges(){
	var lhpvSettlementCharges	= null;
	var lorryHireAmt			= 0;
	var hamali					= 0;
	var oh						= 0;
	var ol						= 0;
	var lc						= 0;
	var doorDelivery			= 0;
	var crossingLH				= 0;
	var crossingHamali			= 0;
	var cartage					= 0;
	var other1					= 0;
	var co_LH					= 0;
	var total					= 0; 
	var advance					= 0;
	var balance					= 0;
	var other2					= 0;
	var ratepmt					= 0;

	if(lhpvChargesAmt != null) {

		for(var key in lhpvChargesAmt) {
			if(key == LHPVChargeTypeConstant.LORRY_HIRE) {
				lhpvSettlementCharges	= lhpvChargesAmt[key];
				lorryHireAmt			= lhpvSettlementCharges.chargeAmount;
			} else if(key == LHPVChargeTypeConstant.HAMALI_DEDUCT) {
				lhpvSettlementCharges	= lhpvChargesAmt[key];
				hamali					= lhpvSettlementCharges.chargeAmount;
			} else if(key == LHPVChargeTypeConstant.OH) {
				lhpvSettlementCharges	= lhpvChargesAmt[key];
				oh						= lhpvSettlementCharges.chargeAmount;
			} else if(key == LHPVChargeTypeConstant.OL) {
				lhpvSettlementCharges	= lhpvChargesAmt[key];
				ol						= lhpvSettlementCharges.chargeAmount;
			} else if(key == LHPVChargeTypeConstant.LC) {
				lhpvSettlementCharges	= lhpvChargesAmt[key];
				lc						= lhpvSettlementCharges.chargeAmount;
			} else if(key == LHPVChargeTypeConstant.DOOR_DELIVERY) {
				lhpvSettlementCharges	= lhpvChargesAmt[key];
				doorDelivery			= lhpvSettlementCharges.chargeAmount;
			} else if(key == LHPVChargeTypeConstant.CROSSING_LH) {
				lhpvSettlementCharges	= lhpvChargesAmt[key];
				crossingLH				= lhpvSettlementCharges.chargeAmount;
			} else if(key == LHPVChargeTypeConstant.CROSSING_HAMALI) {
				lhpvSettlementCharges	= lhpvChargesAmt[key];
				crossingHamali			= lhpvSettlementCharges.chargeAmount;
			} else if(key == LHPVChargeTypeConstant.CARTAGE) {
				lhpvSettlementCharges	= lhpvChargesAmt[key];
				cartage					= lhpvSettlementCharges.chargeAmount;
			} else if(key == LHPVChargeTypeConstant.OTHER_ADDITIONAL) {
				lhpvSettlementCharges	= lhpvChargesAmt[key];
				other1					= lhpvSettlementCharges.chargeAmount;
			} else if(key == LHPVChargeTypeConstant.CO_LH) {
				lhpvSettlementCharges	= lhpvChargesAmt[key];
				co_LH					= lhpvSettlementCharges.chargeAmount;
			} else if(key == LHPVChargeTypeConstant.ADVANCE_AMOUNT) {
				lhpvSettlementCharges	= lhpvChargesAmt[key];
				advance					= lhpvSettlementCharges.chargeAmount;
			} 
			else if(key == LHPVChargeTypeConstant.OTHER_NEGATIVE) {
				lhpvSettlementCharges	= lhpvChargesAmt[key];
				other2					= lhpvSettlementCharges.chargeAmount;
			}
			else if(key == LHPVChargeTypeConstant.RATE_PMT) {
				lhpvSettlementCharges	= lhpvChargesAmt[key];
				ratepmt					= lhpvSettlementCharges.chargeAmount;
			}
		}
		total   = Math.round(lorryHireAmt + hamali + oh + ol + lc + doorDelivery + crossingLH + crossingHamali + cartage + other1 + co_LH );
		balance	= Math.round(total - advance - other2);
	}
	return {
			lorryHireAmt:lorryHireAmt,
			hamali:hamali,
			oh:oh,
			ol:ol,
			lc:lc,
			doorDelivery:doorDelivery,
			crossingLH:crossingLH,
			crossingHamali:crossingHamali,
			cartage:cartage,
			other1:other1,
			co_LH:co_LH,
			total:total,
			advance:advance,
			balance:balance,
			other2:other2,
			ratepmt:ratepmt
	}
}

function setCharges() {
	var chargesColl = calculateCharges();
	
		if(chargesColl.ratepmt != 0) {  
			createTableRow("Rate Per Ton", chargesColl.ratepmt, 'chrgTable');
		}
		if(chargesColl.lorryHireAmt != 0) {  
			createTableRow("Lorry Hire", chargesColl.lorryHireAmt, 'chrgTable');
		}
		if(chargesColl.hamali != 0) {
			createTableRow("Hamali", chargesColl.hamali, 'chrgTable');
		}
		if(chargesColl.oh != 0){
			createTableRow("OH", chargesColl.oh, 'chrgTable');
		}
		if(chargesColl.ol != 0){
			createTableRow("OL", chargesColl.ol, 'chrgTable');
		}
		if(chargesColl.lc != 0){
			createTableRow("LC", chargesColl.lc, 'chrgTable');
		}
		if(chargesColl.doorDelivery != 0) {
			createTableRow("Door Delivery", chargesColl.doorDelivery, 'chrgTable');
		}
		if(chargesColl.crossingLH != 0) {
			createTableRow("Crossing LH", chargesColl.crossingLH, 'chrgTable');
		}
		if(chargesColl.crossingHamali != 0) {
			createTableRow("Crossing Hamali", chargesColl.crossingHamali, 'chrgTable');
		}
		if(chargesColl.cartage != 0){
			createTableRow("Cartage", chargesColl.cartage, 'chrgTable');
		}
		if(chargesColl.other1 != 0){
			createTableRow("Other1", chargesColl.other1, 'chrgTable');
		}
		if(chargesColl.co_LH) {
			createTableRow("Co. LH", chargesColl.co_LH, 'chrgTable');
		}

		if(chargesColl.total != 0) {
			createTableRow('TOTAL',chargesColl.total,'chrgTable');
		}

		createTableRow("Advance", chargesColl.advance, 'chrgTable');
		createTableRow("Other2", chargesColl.other2, 'chrgTable');
		if(chargesColl.balance != 0) {
			createTableRow('BALANCE',chargesColl.balance,'chrgTable');
		}
		setValueToHtmlTag('balanceAmt', 'Rs. '+Math.round(chargesColl.balance)+' /-');
		setValueToHtmlTag('balance', convertNumberToWord(Math.round(chargesColl.balance)) + ' Rs. only');
}

function createTableRow(name,value,tableId) {
	var i = 1;
	var chrgName = null;
	var chrgAmt = null;
	tableRow		= createRow(i,'');

	chrgName		= createColumnInRow(tableRow, name, '', '20%', 'left', 'padding-top: 1px; height:20px; border-right: 0px solid black;', '');
	chrgAmt			= createColumnInRow(tableRow, name, '', '20%', 'right', 'padding-top: 1px; height:20px; border-right: 0px solid black;', '');

	appendValueInTableCol(chrgName, name);
	appendValueInTableCol(chrgAmt, value);

	appendRowInTable(tableId, tableRow);
}

function ShowDialogForPrint(){
	$("#companyNameOverlay").show();
	$("#companyNameDialog").fadeIn(300);
	$('#print').focus();
}

Number.prototype.round = function(p) {
	  p = p || 10;
	  return parseFloat( this.toFixed(p) );
	};

function getCompanyName(){
	var companyName = $("#selectCompanyName input:radio:checked").val();
	if(companyName == undefined){
		if(groupObj.length < 2 ){
			setPrintData();
			HideSaidToContainDialog();
			return;
		}else{
			alert('Please Select Print Type');
			return false;
		}
	}
	if(companyName == "Original"){
		setPrintData();
		HideSaidToContainDialog();
		return;
	}
	var chargesColl = calculateCharges();
	var totalAmount = chargesColl.total;
	var totalActualWeight = 0;
	var averageAmount = 0;
	var totalDoorDeliveryLrs = 0;
	var actualWeightOfCompny = 0;
	var totalNoOfPackages = 0;
	var advanceAmount = 0;
	var boliWeightOfCompany = 0;
	var truckLoadType		= 0;  
	var actualWeightOfNmlCompny		= 0;  
	setCompanyDetails(companyName)
	setDataInTable();
	var objColl = groupData[companyName];
	
	if(loadingSheetDetails != null) {
		truckLoadType		= loadingSheetDetails[0].truckLoadType;
		boliWeightOfCompany = loadingSheetDetails[0].boliWeight;
		_.each(loadingSheetDetails,function(lsdetails){
			totalActualWeight += parseFloat(lsdetails.totalActualWeight,10);
		})
	}

	averageAmount = (totalAmount/totalActualWeight);

	_.each(objColl ,function(obj){
		actualWeightOfCompny += parseFloat(obj.actualWeight);
		//boliWeightOfCompany	 += parseFloat(obj.boliWeight);
		actualWeightOfNmlCompny	 += parseFloat(obj.actualWeight -(5 * obj.quantity));
		totalNoOfPackages += parseFloat(obj.quantity);
		if(obj.deliveryTo == 2){
			totalDoorDeliveryLrs++;
		}
	})
	
	lorryHireAmt = parseFloat(actualWeightOfCompny*averageAmount);

	//setCharges();
	if(lorryHireAmt != 0) {  
		createTableRow("Lorry Hire", Math.round(lorryHireAmt), 'chrgTable');
	}
	
	var lrCount = groupObj.length;
	if(isNaN(lrCount)){
		lrCount = 0;
	}
	var advAmount = 0 ;
	if(lhpvChargesAmt[LHPVChargeTypeConstant.ADVANCE_AMOUNT] != undefined){
		advAmount =lhpvChargesAmt[LHPVChargeTypeConstant.ADVANCE_AMOUNT]['chargeAmount']; 
	}
	
	advanceAmount = (advAmount / lrCount);
	if(isNaN(advanceAmount)){
		advanceAmount = 0;
	}

	createTableRow("Advance", Math.round(advanceAmount), 'chrgTable');

	setValueToHtmlTag('lrs', objColl.length);
	setValueToHtmlTag('pkgs', totalNoOfPackages);
	setValueToHtmlTag('wgt', actualWeightOfCompny);
	setValueToHtmlTag('dds', totalDoorDeliveryLrs);
	setValueToHtmlTag('actWgt', actualWeightOfCompny);		
	setValueToHtmlTag('boliWgt', boliWeightOfCompany);
	setValueToHtmlTag('actwghtfroNml', actualWeightOfNmlCompny);
	
	if(truckLoadTypeConstant[truckLoadType] != undefined){
		setValueToHtmlTag('loadType', truckLoadTypeConstant[truckLoadType]);
	}else{
		setValueToHtmlTag('loadType', '--');
	}
	var balance = lorryHireAmt - advanceAmount;
	if(balance != 0) {
		createTableRow('BALANCE',Math.round(balance),'chrgTable');
	}

	setValueToHtmlTag('balanceAmt', 'Rs. '+Math.round(balance)+' /-');
	setValueToHtmlTag('balance', convertNumberToWord(Math.round(balance)) + ' Rs. only');
	
	HideSaidToContainDialog();
}

function HideSaidToContainDialog(){
	$("#companyNameOverlay").hide();
	$("#companyNameDialog").fadeOut(0);

	//window.print();
}
function HideSaidToContainDialogForView(){
	$("#companyNameOverlay").hide();
	$("#companyNameDialog").fadeOut(0);
}

function setView() {
	HideSaidToContainDialogForView();
}
