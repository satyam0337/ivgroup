/**
 * @Author Nagesh 
 */
function printBillWindow() {
	window.resizeTo(0, 0);
	window.moveTo(0, 0);
	$("#tableContain").load( "/ivcargo/html/print/waybill/203_waybillPrint.html", function() {
		window.setTimeout(printAfterDelay, 500);	
		setPrintData();
	});
}

function printAfterDelay() {
	window.print();
	window.close();
}

function setPrintData() {

	$('.waybillNumber').append(wayBill.wayBillNumber);
	$('.bookingDate').append(getDateInDMYFromTimestamp(wayBill.creationDateTimeStamp));
	$('.consignor').append((consignorDetails.name).toUpperCase());
	$('.consignor_city').append(consignorDetails.address);
	$('.consignee').append((consigneeDetails.name).toUpperCase());
	$('.consignee_city').append(consigneeDetails.address);
	$('.srcbranch').append(sourceBranch.name);
	$('.declaredValue').append(consignmentSummary.declaredValue);
	$('.remark').append(wayBill.remark);
	$('.lrType').append(wayBill.wayBillType);

	if(taxPaidBy != null && taxPaidBy != '--'){
		changeDisplayProperty('seriveTaxPaidById', 'block');
		setValueToHtmlTag('seriveTaxPaidBy', taxPaidBy);
	}

	$('.actualWeight').append(consignmentSummary.actualWeight);
	$('.chargedWeight').append(consignmentSummary.chargeWeight);
	$('.invoice').append(wayBill.consignorInvoiceNo);
	$('.destBranch').append(destinationBranch.name);

	setConsignment();
	setGodown();
	setCharges();
	setTaxAmount();
}

function setConsignment() {

	var noOfArt				= 0;
	var tableRow			= null;
	var quantityCol			= null;
	var saidToContain		= null;
	

	if(consignmentDetails != null ) {
		for(var i = 0; i < consignmentDetails.length; i++) {
			tableRow		= createRow(i,'');

			quantityCol		= createColumnInRow(tableRow, '', i+1, '10%', 'left', 'font-family: Courier New;padding-left : 30px; font-size : 14px; letter-spacing: 1px; font-weight : bold;', '');
			saidToContain	= createColumnInRow(tableRow, '', i+2, '', 'left', 'font-family: Courier New;padding-left : 30px; font-size : 14px;letter-spacing: 1px; font-weight : bold;', '');


			noOfArt += consignmentDetails[i].quantity;

			appendValueInTableCol(quantityCol,  (consignmentDetails[i].quantity));
			appendValueInTableCol(saidToContain,consignmentDetails[i].packingTypeName + " of " + consignmentDetails[i].saidToContain);
			$('.ConsignmentDetails').append(tableRow);
		}
	}

	$('.totalarticles').append(noOfArt);
}

function setCharges() {

	var freight				= 0;
	var handling  			= 0;
	var statical			= 0;
	var cartage				= 0;
	var door_dly			= 0;
	var other				= 0;
	var surcharge			= 0;
	var risk_charge         = 0;

	if(wayBillCharges != undefined) {
		wayBillChrg	= wayBillCharges[ChargeTypeMaster.FREIGHT];

		if (wayBillChrg != null) {
			freight			= (wayBillChrg.chargeAmount).toFixed();
		}

		wayBillChrg	= wayBillCharges[ChargeTypeMaster.HANDLING];

		if (wayBillChrg != null) {
			handling		= (wayBillChrg.chargeAmount).toFixed();	
		}

		wayBillChrg	= wayBillCharges[ChargeTypeMaster.DOOR_DLY_BOOKING];

		if (wayBillChrg != null) {
			door_dly		= (wayBillChrg.chargeAmount).toFixed();	
		}

		wayBillChrg	= wayBillCharges[ChargeTypeMaster.STATISTICAL];

		if (wayBillChrg != null) {
			statical				= (wayBillChrg.chargeAmount).toFixed();
		}

		wayBillChrg	= wayBillCharges[ChargeTypeMaster.CARTAGE_CHARGE];

		if (wayBillChrg != null) {
			cartage					= (wayBillChrg.chargeAmount).toFixed();
		}

		wayBillChrg	= wayBillCharges[ChargeTypeMaster.SUR_CHARGE];

		if (wayBillChrg != null) {
			surcharge 	= (wayBillChrg.chargeAmount).toFixed();
		}

		wayBillChrg	= wayBillCharges[ChargeTypeMaster.OTHER_BOOKING];

		if (wayBillChrg != null) {
			other 	= (wayBillChrg.chargeAmount).toFixed();
		}

		wayBillChrg	= wayBillCharges[ChargeTypeMaster.RISK_CHARGE];

		if (wayBillChrg != null) {
			risk_charge 	= (wayBillChrg.chargeAmount).toFixed();
		}

	}

	if(wayBillTaxTxn != null && wayBillTaxTxn.length > 0) {
		ser_tax	= wayBillTaxTxn[0].taxAmount;
	}

	var Total = 0;
	Total = Number(freight)+Number(handling)+Number(statical)+Number(cartage)+Number(door_dly)+Number(other)+Number(surcharge)+Number(risk_charge);

	var noOfCharges			= 0;
	var tableRow		= null;
	var name     		= null;
	var tbb   	 		= null;
	var amount      	= null;
	var i					= 0;

	if(wayBill.wayBillTypeId == WayBillType.WAYBILL_TYPE_PAID || wayBill.wayBillTypeId == WayBillType.WAYBILL_TYPE_CREDIT) {
		tableRow		= createRowInTable(i, '', '');

		name			= createColumnInRow(tableRow, '1', i+1, '40%', 'left', 'font-family: Courier New;padding-left : 6px; font-size : 15px;', '');
		amount			= createColumnInRow(tableRow, '1', i+2, '25%', 'right', 'font-family: Courier New;padding-left : 6px; font-size : 15px;', '');
		tbb   			= createColumnInRow(tableRow, '1', i+3, '35%', '', '', '');						

		appendValueInTableCol(name, '');
		appendValueInTableCol(amount,freight);
		i++;
		$('.charges').append(tableRow);

		if(handling > 0) {

			tableRow		= createRowInTable(i,'');

			name			= createColumnInRow(tableRow, '1', i+1, '40%', 'left', 'font-family: Courier New;padding-left : 6px; font-size : 15px;', '');
			amount			= createColumnInRow(tableRow, '1', i+2, '25%', 'right', 'font-family: Courier New;padding-left : 6px; font-size : 15px;', '');
			tbb   			= createColumnInRow(tableRow, '1', i+3, '35%', '', '', '');						

			appendValueInTableCol(name, 'Handling');
			appendValueInTableCol(amount,handling);
			i++;
			$('.charges').append(tableRow);
		}

		if(door_dly>0){
			tableRow		= createRowInTable(i,'');

			name			= createColumnInRow(tableRow, '1', i+1, '40%', 'left', 'font-family: Courier New;padding-left : 6px; font-size : 15px;', '');
			amount			= createColumnInRow(tableRow, '1', i+2, '25%', 'right', 'font-family: Courier New;padding-left : 6px; font-size : 15px;', '');
			tbb   			= createColumnInRow(tableRow, '1', i+3, '35%', '', '', '');		

			appendValueInTableCol(name,  'Door Dly.');
			appendValueInTableCol(amount,door_dly);
			//wayBillCharges[58].chargeAmount=0;
			i++;
			$('.charges').append(tableRow);



		}

		if(statical>0){

			tableRow		= createRowInTable(i,'');

			name			= createColumnInRow(tableRow, '1', i+1, '40%', 'left', 'font-family: Courier New;padding-left : 6px; font-size : 15px;', '');
			amount			= createColumnInRow(tableRow, '1', i+2, '25%', 'right', 'font-family: Courier New;padding-left : 6px; font-size : 15px;', '');
			tbb   			= createColumnInRow(tableRow, '1', i+3, '35%', '', '', '');		

			appendValueInTableCol(name,  'Stat.');
			appendValueInTableCol(amount,statical);
			i++;
			$('.charges').append(tableRow);



		}

		if(surcharge>0){

			tableRow		= createRowInTable(i,'');
			name			= createColumnInRow(tableRow, '1', i+1, '40%', 'left', 'font-family: Courier New;padding-left : 6px; font-size : 15px;', '');
			amount			= createColumnInRow(tableRow, '1', i+2, '25%', 'right', 'font-family: Courier New;padding-left : 6px; font-size : 15px;', '');
			tbb   			= createColumnInRow(tableRow, '1', i+3, '35%', '', '', '');		

			appendValueInTableCol(name,  'Surcharge');
			appendValueInTableCol(amount,surcharge);
			i++;
			$('.charges').append(tableRow);
		}	

		if(cartage>0){

			tableRow		= createRowInTable(i,'');
			name			= createColumnInRow(tableRow, '1', i+1, '40%', 'left', 'font-family: Courier New;padding-left : 6px; font-size : 15px;', '');
			amount			= createColumnInRow(tableRow, '1', i+2, '25%', 'right', 'font-family: Courier New;padding-left : 6px; font-size : 15px;', '');
			tbb   			= createColumnInRow(tableRow, '1', i+3, '35%', '', '', '');		

			appendValueInTableCol(name,  'Cartage');
			appendValueInTableCol(amount,cartage);
			i++;
			$('.charges').append(tableRow);
		}		

		if(risk_charge>0){

			tableRow		= createRowInTable(i,'');

			name			= createColumnInRow(tableRow, '1', i+1, '40%', 'left', 'font-family: Courier New;padding-left : 6px; font-size : 15px;', '');
			amount			= createColumnInRow(tableRow, '1', i+2, '25%', 'right', 'font-family: Courier New;padding-left : 6px; font-size : 15px;', '');
			tbb   			= createColumnInRow(tableRow, '1', i+3, '35%', '', '', '');		

			appendValueInTableCol(name,  'Risk Chg');
			appendValueInTableCol(amount,risk_charge);
			i++;
			$('.charges').append(tableRow);
		}			

		if(other>0){

			tableRow		= createRowInTable(i,'');

			name			= createColumnInRow(tableRow, '1', i+1, '40%', 'left', 'font-family: Courier New;padding-left : 6px; font-size : 15px;', '');
			amount			= createColumnInRow(tableRow, '1', i+2, '25%', 'right', 'font-family: Courier New;padding-left : 6px; font-size : 15px;', '');
			tbb   			= createColumnInRow(tableRow, '1', i+3, '35%', '', '', '');		

			appendValueInTableCol(name,'Other');
			appendValueInTableCol(amount,other);
			i++;
			$('.charges').append(tableRow);
		}			

		tableRow		= createRowInTable(i,'');

		name		= createColumnInRow(tableRow, '1', i+1, '40%', 'valign="bottom"', 'style="line-height: 0;margin-top: 0;margin-bottom: 0"', '');
		amount   	= createColumnInRow(tableRow, '1', i+2, '25%', 'right', 'style="line-height: 0;margin-top: 0;margin-bottom: 0"', '');
		tbb			= createColumnInRow(tableRow, '1', i+3, '35%', '', 'style="line-height: 0;margin-top: 0;margin-bottom: 0"', '');

		appendValueInTableCol(name,  ("------------"));
		appendValueInTableCol(amount,"   ---------------");
		$('.charges').append(tableRow);

		tableRow		= createRowInTable(i,'');

		name			= createColumnInRow(tableRow, '1', i+1, '40%', 'left', 'font-family: Courier New;padding-left : 6px; font-size : 15px;', '');
		amount			= createColumnInRow(tableRow, '1', i+2, '25%', 'right', 'font-family: Courier New;padding-left : 6px; font-size : 15px;', '');
		tbb   			= createColumnInRow(tableRow, '1', i+3, '35%', '', '', '');		

		appendValueInTableCol(name,'Total');
		appendValueInTableCol(amount,Total);
		$('.charges').append(tableRow);

	} else {
		if(wayBill.wayBillTypeId == WayBillType.WAYBILL_TYPE_TO_PAY) {
			tableRow		= createRowInTable(i, '', '');

			name			= createColumnInRow(tableRow, '1', i+1, '40%', 'left', 'font-family: Courier New;padding-left : 6px; font-size : 15px;', '');
			tbb   			= createColumnInRow(tableRow, '1', i+2, '25%', '', '', '');
			amount			= createColumnInRow(tableRow, '1', i+3, '35%', 'right', 'font-family: Courier New;padding-left : 6px; font-size : 15px;', '');

			appendValueInTableCol(name,'');
			appendValueInTableCol(amount,freight);
			i++;
			$('.charges').append(tableRow);

			if(handling > 0) {

				tableRow		= createRowInTable(i,'');

				name			= createColumnInRow(tableRow, '1', i+1, '40%', 'left', 'font-family: Courier New;padding-left : 6px; font-size : 15px;', '');
				tbb   			= createColumnInRow(tableRow, '1', i+2, '25%', '', '', '');
				amount			= createColumnInRow(tableRow, '1', i+3, '35%', 'right', 'font-family: Courier New;padding-left : 6px; font-size : 15px;', '');

				appendValueInTableCol(name,'Handling');
				appendValueInTableCol(amount,handling);
				i++;
				$('.charges').append(tableRow);
			}

			if(door_dly>0){

				tableRow		= createRowInTable(i,'');

				name			= createColumnInRow(tableRow, '1', i+1, '40%', 'left', 'font-family: Courier New;padding-left : 6px; font-size : 15px;', '');
				tbb   			= createColumnInRow(tableRow, '1', i+2, '25%', '', '', '');
				amount			= createColumnInRow(tableRow, '1', i+3, '35%', 'right', 'font-family: Courier New;padding-left : 6px; font-size : 15px;', '');

				appendValueInTableCol(name,  'Door Dly.');
				appendValueInTableCol(amount,door_dly);
				//wayBillCharges[58].chargeAmount=0;
				i++;
				$('.charges').append(tableRow);
			}

			if(statical>0){

				tableRow		= createRowInTable(i,'');

				name			= createColumnInRow(tableRow, '1', i+1, '40%', 'left', 'font-family: Courier New;padding-left : 6px; font-size : 15px;', '');
				tbb   			= createColumnInRow(tableRow, '1', i+2, '25%', '', '', '');
				amount			= createColumnInRow(tableRow, '1', i+3, '35%', 'right', 'font-family: Courier New;padding-left : 6px; font-size : 15px;', '');

				appendValueInTableCol(name, 'Stat.');
				appendValueInTableCol(amount,statical);
				i++;
				$('.charges').append(tableRow);
			}

			if(surcharge>0){

				tableRow		= createRowInTable(i,'');
				name			= createColumnInRow(tableRow, '1', i+1, '40%', 'left', 'font-family: Courier New;padding-left : 6px; font-size : 15px;', '');
				tbb   			= createColumnInRow(tableRow, '1', i+2, '25%', '', '', '');
				amount			= createColumnInRow(tableRow, '1', i+3, '35%', 'right', 'font-family: Courier New;padding-left : 6px; font-size : 15px;', '');

				appendValueInTableCol(name,  'Surcharge');
				appendValueInTableCol(amount,surcharge);
				i++;
				$('.charges').append(tableRow);
			}	

			if(cartage>0){

				tableRow		= createRowInTable(i,'');
				name			= createColumnInRow(tableRow, '1', i+1, '40%', 'left', 'font-family: Courier New;padding-left : 6px; font-size : 15px;', '');
				tbb   			= createColumnInRow(tableRow, '1', i+2, '25%', '', '', '');
				amount			= createColumnInRow(tableRow, '1', i+3, '35%', 'right', 'font-family: Courier New;padding-left : 6px; font-size : 15px;', '');

				appendValueInTableCol(name,  'Cartage');
				appendValueInTableCol(amount,cartage);
				i++;
				$('.charges').append(tableRow);
			}		

			if(risk_charge>0){

				tableRow		= createRowInTable(i,'');

				name			= createColumnInRow(tableRow, '1', i+1, '40%', 'left', 'font-family: Courier New;padding-left : 6px; font-size : 15px;', '');
				tbb   			= createColumnInRow(tableRow, '1', i+2, '25%', '', '', '');
				amount			= createColumnInRow(tableRow, '1', i+3, '35%', 'right', 'font-family: Courier New;padding-left : 6px; font-size : 15px;', '');

				appendValueInTableCol(name,  'Risk Chg');
				appendValueInTableCol(amount,risk_charge);
				i++;
				$('.charges').append(tableRow);
			}			

			if(other>0){

				tableRow		= createRowInTable(i,'');

				name			= createColumnInRow(tableRow, '1', i+1, '40%', 'left', 'font-family: Courier New;padding-left : 6px; font-size : 15px;', '');
				tbb   			= createColumnInRow(tableRow, '1', i+2, '25%', '', '', '');
				amount			= createColumnInRow(tableRow, '1', i+3, '35%', 'right', 'font-family: Courier New;padding-left : 6px; font-size : 15px;', '');

				appendValueInTableCol(name,  'Other');
				appendValueInTableCol(amount,other);
				i++;
				$('.charges').append(tableRow);
			}			


			tableRow		= createRowInTable(i,'');

			name		= createColumnInRow(tableRow, '1', i+1, '40%', 'valign="bottom"', 'style="line-height: 0;margin-top: 0;margin-bottom: 0"', '');
			tbb   		= createColumnInRow(tableRow, '1', i+2, '25%', 'bottom"', 'style="line-height: 0;margin-top: 0;margin-bottom: 0"', '');
			amount		= createColumnInRow(tableRow, '1', i+3, '35%', 'right', 'style="line-height: 0;margin-top: 0;margin-bottom: 0"', '');

			appendValueInTableCol(name,  ("------------"));
			appendValueInTableCol(amount,"   ---------------");
			$('.charges').append(tableRow);

			tableRow		= createRowInTable(i,'');

			name			= createColumnInRow(tableRow, '1', i+1, '40%', 'left', 'font-family: Courier New;padding-left : 6px; font-size : 15px;', '');
			tbb   			= createColumnInRow(tableRow, '1', i+2, '25%', '', '', '');
			amount			= createColumnInRow(tableRow, '1', i+3, '35%', 'right', 'font-family: Courier New;padding-left : 6px; font-size : 15px;', '');

			appendValueInTableCol(name,'Total');
			appendValueInTableCol(amount,Total);
			$('.charges').append(tableRow);

		}				


		if(wayBill.wayBillTypeId == WayBillType.WAYBILL_TYPE_FOC){

			tableRow	= createRowInTable(i,'');

			name		= createColumnInRow(tableRow, '1', i+1, '40%', 'valign="bottom"', 'style="line-height: 0;margin-top: 0;margin-bottom: 0"', '');
			tbb   		= createColumnInRow(tableRow, '1', i+2, '25%', 'bottom"', 'style="line-height: 0;margin-top: 0;margin-bottom: 0"', '');
			amount		= createColumnInRow(tableRow, '1', i+3, '35%', 'right', 'style="line-height: 0;margin-top: 0;margin-bottom: 0"', '');

			appendValueInTableCol(name,  ("------------"));
			appendValueInTableCol(amount,"   ---------------");
			$('.charges').append(tableRow);

			tableRow		= createRowInTable(i,'');

			name			= createColumnInRow(tableRow, '1', i+1, '40%', 'left', 'font-family: Courier New;padding-left : 6px; font-size : 15px;', '');
			tbb   			= createColumnInRow(tableRow, '1', i+2, '25%', '', '', '');
			amount			= createColumnInRow(tableRow, '1', i+3, '35%', 'right', 'font-family: Courier New;padding-left : 6px; font-size : 15px;', '');

			appendValueInTableCol(name,  'Total');
			appendValueInTableCol(amount,"         ");
			$('.charges').append(tableRow);
		}
	}
}

function setTaxAmount() {

	if(( wayBillTaxTxn[0] != undefined )) {
		if (wayBillTaxTxn[0].unAddedTaxAmount != undefined){
			setValueToHtmlTag('tax_amount', 'Rs. '+ wayBillTaxTxn[0].unAddedTaxAmount);
		}
	}

}

function setGodown() {
	if(wayBill.deliveryTypeId == TransportCommonMaster.DELIVERY_TO_BRANCH_ID) {
		$('.godown').append("Godown");  
	} else if(wayBill.deliveryTypeId == TransportCommonMaster.DELIVERY_TO_DOOR_ID) {
		$('.godown').append("Door Dly");
	}
}