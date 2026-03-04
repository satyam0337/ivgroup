function renderFuelHisabVoucherPrint() {
	$("#fuelHisabVoucher").load( "/ivcargo/html/truckhisabmodule/print/fuelHisabVoucherPrint.html", function() {
		renderPrintData();
	});
}

function renderPrintData() {
	var columnArray	= new Array();

	var totalFuel		= 0;
	var totalFuelFilled	= 0;
	var openingFuel		= 0;

	if (pumpReceiptObject.length == 0) {
		$("*[data-parent='parentTableRow2']").addClass("hide");
	} else {
		for (var i=0; i<pumpReceiptObject.length; i++) {
			var fuelReceipt	= pumpReceiptObject[i];
			columnArray.push("<td data-child='fuelPumpName' class='center'>" + fuelReceipt.pumpName + "</td>");
			columnArray.push("<td data-child='fuelReceiptNumber' class='center'>" + fuelReceipt.pumpReceiptNumber + "</td>");
			columnArray.push("<td data-child='fuelReceiptDate' class='center'>" + fuelReceipt.createDateTimeString + "</td>");
			columnArray.push("<td data-child='fuelLitre' class='right'>" + fuelReceipt.fuelToFillUp + "</td>");
			$('#fuelReceiptDetailsTable tr:last').after('<tr data-child="fuelReceiptDetailsTableBodyRow">' + columnArray.join(' ') + '</tr>');
			columnArray	= [];
			totalFuelFilled += parseInt(fuelReceipt.fuelToFillUp);
		}
		
		columnArray.push("<td colspan='3' data-child='fuelLitreTotalLabel' class='right total'>TOTAL</td>");
		columnArray.push("<td data-child='fuelLitreTotal' class='right total'>" + totalFuelFilled + "</td>");
		$('#fuelReceiptDetailsTable tr:last').after('<tr data-child="fuelReceiptDetailsTableBodyRow">' + columnArray.join(' ') + '</tr>');
		columnArray	= [];
	}

	totalFuel += fuelHisabObject.fuelUsed
	totalFuel += fuelHisabObject.fuelBalance
	totalFuel -= fuelHisabObject.fuelDeduction;
	openingFuel	= totalFuel - totalFuelFilled;

	$("*[data-grandchild='slipNo']").html(fuelHisabObject.fuelHisabVoucherNumber);
	$("*[data-grandchild='fuelHisabDate']").html(fuelHisabObject.creationDateTimeString);
	$("*[data-grandchild='vehicleNo']").html(fuelHisabObject.vehicleNumber);
	$("*[data-grandchild='branch']").html(fuelHisabObject.branchName);
	$("*[data-grandchild='openingBal']").html(openingFuel);
	$("*[data-grandchild='driver']").html(fuelHisabObject.driverName);
	$("*[data-grandchild='license']").html(fuelHisabObject.driverLic);
	$("*[data-grandchild='fuelHisabFrom']").html(fuelHisabObject.previousHisabDateTimeString);
	$("*[data-grandchild='fuelHisabTo']").html(fuelHisabObject.creationDateTimeString);
	$("*[data-child='startKM']").html(fuelHisabObject.startKilometer);
	$("*[data-child='endKM']").html(fuelHisabObject.voucherKilometer);
	$("*[data-child='runningKM']").html(parseInt(fuelHisabObject.voucherKilometer) - parseInt(fuelHisabObject.startKilometer));
	$("*[data-child='totalKM']").html(fuelHisabObject.voucherTotalRunning);
	$("*[data-child='differenceKM']").html((parseInt(fuelHisabObject.voucherKilometer) - parseInt(fuelHisabObject.startKilometer)) - parseInt(fuelHisabObject.voucherTotalRunning));
	$("*[data-child='openingFuel']").html(openingFuel);
	$("*[data-child='filledFuel']").html(totalFuelFilled);
	$("*[data-child='totalFuel']").html(totalFuel);
	$("*[data-child='average']").html(fuelHisabObject.vehicleAverage);
	$("*[data-child='usedFuel']").html(fuelHisabObject.fuelUsed);
	$("*[data-child='adjustment']").html(fuelHisabObject.fuelDeduction);
	$("*[data-child='balanceFuel']").html(fuelHisabObject.fuelBalance);
	if (fuelHisabObject.vehicleAverageRemark) {
		$("*[data-child='averageRemark']").html(fuelHisabObject.vehicleAverageRemark);		
	}
	if (fuelHisabObject.fuelDeductionRemark) {
		$("*[data-child='adjustmentRemark']").html(fuelHisabObject.fuelDeductionRemark);
	}
	if (fuelHisabObject.remark) {
		$("*[data-child='voucherRemark']").html(fuelHisabObject.remark);
	}
	$("*[data-child='hisabTakenBy']").html(fuelHisabObject.executiveName);
	//$("*[data-child='printTakenBy']").html(fuelHisabObject.printTakenByExecutive);
	var lhpvKM	= 0;
	var lhpvWeight = 0;
	if (lhpvObject.length == 0) {
		$("*[data-parent='parentTableRow3']").addClass("hide");
	} else {
		for (var i=0; i<lhpvObject.length; i++) {
			var lhpv	= lhpvObject[i];
			columnArray.push("<td data-child='lhpvNumber' class='center'>" + lhpv.lhpvNumber + "</td>");
			columnArray.push("<td data-child='lhpvDate' class='center'>" + lhpv.lhpvFuelHisabCreationDateTimeString + "</td>");
			columnArray.push("<td data-child='lhpvRoute' class='center'>" + lhpv.routeBranchString + "</td>");
			columnArray.push("<td data-child='lhpvWeight' class='right'>" + lhpv.lhpvWeight + "</td>");
			columnArray.push("<td data-child='lhpvKilometer' class='right'>" + lhpv.lhpvDistance + "</td>");
			$('#lhpvDetailsTable tr:last').after('<tr data-child="lhpvDetailsTableBodyRow">' + columnArray.join(' ') + '</tr>');
			columnArray	= [];
			lhpvKM += lhpv.lhpvDistance;
			lhpvWeight += lhpv.lhpvWeight;
		}

		columnArray.push("<td colspan='3' data-child='lhpvWeightTotalLabel' class='right total'>TOTAL</td>");
		columnArray.push("<td data-child='lhpvWeightTotal' class='right total'>" + lhpvWeight + "</td>");
		//columnArray.push("<td colspan='3' data-child='lhpvKilometerTotalLabel' class='right total'>TOTAL</td>");
		columnArray.push("<td data-child='lhpvKilometerTotal' class='right total'>" + lhpvKM + "</td>");
		$('#lhpvDetailsTable tr:last').after('<tr data-child="lhpvDetailsTableBodyRow">' + columnArray.join(' ') + '</tr>');
		columnArray	= [];
	}


	var ddmKM	= 0;
	if (ddmObject.length == 0) {
		$("*[data-parent='parentTableRow4']").addClass("hide");
	} else {
		for (var i=0; i<ddmObject.length; i++) {
			var ddm	= ddmObject[i];
			columnArray.push("<td data-child='ddmNumber' class='center'>" + ddm.ddmNumber + "</td>");
			columnArray.push("<td data-child='ddmDate' class='center'>" + ddm.ddmFuelHisabCreationDateTimeString + "</td>");
			columnArray.push("<td data-child='ddmFrom' class='center'>" + ddm.ddmFromBranchName + "</td>");
			columnArray.push("<td data-child='ddmTo' class='center'>" + ddm.ddmToBranchName + "</td>");
			columnArray.push("<td data-child='ddmKilometer' class='right'>" + ddm.ddmDistance + "</td>");
			$('#ddmDetailsTable tr:last').after('<tr data-child="ddmDetailsTableBodyRow">' + columnArray.join(' ') + '</tr>');
			columnArray	= [];
			ddmKM += ddm.ddmDistance;
		}

		columnArray.push("<td colspan='4' data-child='ddmKilometerTotalLabel' class='right total'>TOTAL</td>");
		columnArray.push("<td data-child='ddmKilometerTotal' class='right total'>" + ddmKM + "</td>");
		$('#ddmDetailsTable tr:last').after('<tr data-child="ddmDetailsTableBodyRow">' + columnArray.join(' ') + '</tr>');
		columnArray	= [];
	}

	var collectionKM	= 0;
	if (collectionObject.length == 0) {
		$("*[data-parent='parentTableRow5']").addClass("hide");
	} else {
		for (var i=0; i<collectionObject.length; i++) {
			var collection	= collectionObject[i];
			columnArray.push("<td data-child='collectionDate' class='center'>" + collection.collectionDate + "</td>");
			columnArray.push("<td data-child='collectionFrom' class='center'>" + collection.collectionFromString + "</td>");
			columnArray.push("<td data-child='collectionTo' class='center'>" + collection.collectionTo + "</td>");
			columnArray.push("<td data-child='collectionKilometer' class='right'>" + collection.collectionDistance + "</td>");
			$('#collectionDetailsTable tr:last').after('<tr data-child="collectionDetailsTableBodyRow">' + columnArray.join(' ') + '</tr>');
			columnArray	= [];
			collectionKM += collection.collectionDistance;
		}

		columnArray.push("<td colspan='3' data-child='collectionKilometerTotalLabel' class='right total'>TOTAL</td>");
		columnArray.push("<td data-child='collectionKilometerTotal' class='right total'>" + collectionKM + "</td>");
		$('#collectionDetailsTable tr:last').after('<tr data-child="collectionDetailsTableBodyRow">' + columnArray.join(' ') + '</tr>');
		columnArray	= [];
	}
	var intLSKM	= 0;
	if (intLSObject.length == 0) {
		$("*[data-parent='parentTableRow9']").addClass("hide");
	} else {
		for (var i=0; i<intLSObject.length; i++) {
			var intLS	= intLSObject[i];
			columnArray.push("<td data-child='intLSNumber' class='center'>" + intLS.intBranchLSNumber + "</td>");
			columnArray.push("<td data-child='intLSDate' class='center'>" + intLS.intBranchLSFuelHisabCreationDateTimeString + "</td>");
			columnArray.push("<td data-child='intLSFrom' class='center'>" + intLS.intBranchLSFromBranchName + "</td>");
			columnArray.push("<td data-child='intLSTo' class='center'>" + intLS.intBranchLSToBranchName + "</td>");
			columnArray.push("<td data-child='intLSKilometer' class='right'>" + intLS.intBranchLSDistance + "</td>");
			$('#intLSDetailsTable tr:last').after('<tr data-child="intLSDetailsTableBodyRow">' + columnArray.join(' ') + '</tr>');
			columnArray	= [];
			intLSKM += intLS.intBranchLSDistance;
		}

		columnArray.push("<td colspan='4' data-child='intLSKilometerTotalLabel' class='right total'>TOTAL</td>");
		columnArray.push("<td data-child='intLSKilometerTotal' class='right total'>" + intLSKM + "</td>");
		$('#intLSDetailsTable tr:last').after('<tr data-child="intLSDetailsTableBodyRow">' + columnArray.join(' ') + '</tr>');
		columnArray	= [];
	}


	var localKM	= 0;
	if (localObject.length == 0) {
		$("*[data-parent='parentTableRow6']").addClass("hide");
	} else {
		for (var i=0; i<localObject.length; i++) {
			var local	= localObject[i];
			columnArray.push("<td data-child='localDate' class='center'>" + local.localDate + "</td>");
			columnArray.push("<td data-child='localFrom' class='center'>" + local.localFrom + "</td>");
			columnArray.push("<td data-child='localTo' class='center'>" + local.localTo + "</td>");
			columnArray.push("<td data-child='localKilometer' class='right total'>" + local.localDistance + "</td>");
			$('#localDetailsTable tr:last').after('<tr data-child="localDetailsTableBodyRow">' + columnArray.join(' ') + '</tr>');
			columnArray	= [];
			localKM += local.localDistance;
		}
		
		columnArray.push("<td colspan='3' data-child='localKilometerTotalLabel' class='right total'>TOTAL</td>");
		columnArray.push("<td data-child='localKilometerTotal' class='right total'>" + localKM + "</td>");
		$('#localDetailsTable tr:last').after('<tr data-child="localDetailsTableBodyRow">' + columnArray.join(' ') + '</tr>');
		columnArray	= [];

	}
	window.print();
}

function getFuelHisabVoucherPrint(fuelHisabVoucherId) {
	var filter	= 3;
	var id = parseInt(fuelHisabVoucherId)
	childwin = window.open('fuelHisabSettlementGetDetails.do?pageId=345&eventId=5&fuelHisabSettlementId='+id+'&dataFilter='+filter, 'newwindow', config='height=600,width=850, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}