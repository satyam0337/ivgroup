/**
 * 
 */
var totalBookingTotal=0;
var totalDeliveryTotal=0;

function searchSingleWayBill(event){
	//alert("adding rows function");
	if(event.which){ // Netscape/Firefox/Opera
		var keycode = event.which;

		if(keycode == 13 && $('#wbNumber').val() != ''){
			var txnType = document.getElementById("txnType");
			
			if(!validateTxnTypeSelection()) return;
		
			var jsonObject	= new Object();
			
			let filter	= 1;
			
			jsonObject.wayBillNumber		= $('#wbNumber').val().trim();
			jsonObject.destinationBranchId	= branchId.value;
			jsonObject.txnTypeId			= txnType.value;
			jsonObject.billSelectionTypeId	= $('#billSelectionTypeId').val();
			jsonObject.filter				= filter;
							
			$.ajax({
				type		: "POST",
				url			: WEB_SERVICE_URL+'/creditPaymentModuleWS/getCreditPaymentData.do',
				data		: jsonObject,
				dataType	: 'json',
				success: function(data) {
					if(typeof data.message !== 'undefined') {
						var errorMessage = data.message;
						showMessage(errorMessage.typeName, errorMessage.description);
						$('#wbNumber').val('');
						document.getElementById('wbNumber').focus();
						hideLayer();
						return;
					} else {
						hideLayer();

						var creditPaymentDataList	= data.creditPaymentDataList;
					
						if(typeof creditPaymentDataList !== 'undefined')
							setLRDetails(creditPaymentDataList, data, filter);
					}
				}
			});
		};
	};
}

function validateTxnTypeSelection() {
	var billSelectionTypeId		= $('#billSelectionTypeId').val();
	var txnType 				= document.getElementById("txnType");
	
	if(txnType.value == 0) {
		showMessage('error',"Please Select Transaction Type !");
		toogleElement('error','block');
		changeError1('txnType','0','0');
		$("#txnType").focus(); 
		return false;
	}
	
	if(showBillSelectionTypeId && billSelectionTypeId == 0) {
		showMessage('error',"Please Select Bill Type !");
		toogleElement('error','block');
		changeError1('billSelectionTypeId','0','0');
		$("#billSelectionTypeId").focus(); 
		return false;
	}
	
	return true;
}

function searchSingleCR(branchId){
	if(allowToCalculateTDS && $('#applyTDSCheck').is(':visible'))
		$('#applyTDS').prop('checked', false);
	
	if(!validateTxnTypeSelection() || $('#crNumber').val() == '') return;
	
	let filter = 2;

	showLayer();
			
	var jsonObject	= new Object();
			
	jsonObject.crNumber				= $('#crNumber').val().trim();
	jsonObject.destinationBranchId	= branchId;
	jsonObject.txnTypeId			= txnType.value;
	jsonObject.filter				= filter;
			
	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/creditPaymentModuleWS/getCreditPaymentData.do',
		data		: jsonObject,
		dataType	: 'json',
		success: function(data) {
			if(typeof data.message !== 'undefined') {
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.description);
				$('#crNumber').val('');
				document.getElementById('crNumber').focus();
				hideLayer();
				return;
			} else {
				hideLayer();
				
				var creditPaymentDataList	= data.creditPaymentDataList;
				
				if(typeof creditPaymentDataList !== 'undefined')
					setLRDetails(creditPaymentDataList, data, filter);
			}
		}
	});
}

function setLRDetails(creditPaymentDataList, data, filter) {
	var tbl 		= document.getElementById("reportTable");
	var rowCount 	= tbl.rows.length;
	
	for(let j = 0; j < creditPaymentDataList.length; j++) {
		var wb 	= creditPaymentDataList[j];
		
		//Check if already added
		for (var i = 1; i < rowCount; i++) {
			if(tbl.rows[i].cells[1] != undefined){
				var addedWbNo = Number($('#billId_' + i).val());
							
				if(addedWbNo == Number(wb.wayBillId)) {
					if(filter == 1)	
						showMessage('error',"The LR Number : " + wb.wayBillNumber + " has already added !");
					else if(filter == 2)
						showMessage('error',"The CR Number : " + wb.wayBillDeliveryNumber + " has already added !");
					toogleElement('error','block');
					
					if(filter == 1)
						$('#wbNumber').val('');
					else if(filter == 2)
						$('#crNumber').val('');
						
					return;
				} else {
					toogleElement('error','none');
				}
			}
		}
								
		if (lrCreditConfig.validateLRCreditPaymentOnBranch && !receiveOtherBranchPaymentInLrCredit) {
			if (wb.branchId != data.executiveBranchId) {
				showMessage('error', "Cannot Receive Other Branch LR Credit Payment..!!");
				toogleElement('error', 'block');

				if(filter == 1) {
					$('#wbNumber').val('');
					document.getElementById('wbNumber').focus();
				} else if(filter == 2) {
					$('#crNumber').val('');
					document.getElementById('crNumber').focus();
				}
				
				$('#CreditPaymentModuleId').removeClass('hide');
				return;
			}
		}

		if(wb.paymentStatus == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_DUE_PAYMENT_ID || lrCreditConfig.allowPartialPaymentInMultipleClear) {
			if(isCheck) {
				document.getElementById('branchIdForCheck').value = wb.branchId;
				document.getElementById('partyMasterIdforCheck').value = wb.partyMasterId;
				isCheck = false;
			}
			
			// Make configuration for party checking
			if(lrCreditConfig.checkSameBranchId) {
				if($('#branchIdForCheck').val() != wb.branchId) {
					if(filter == 1)
						alert('Please Enter LR Number Of Same Branch And Same Party!');
					else if(filter == 2)
						alert('Please Enter CR Number Of Same Branch And Same Party!');
						
					return;
				}
			}
				
			if (lrCreditConfig.checkPartyMasterId) {
				if($('#partyMasterIdforCheck').val() != wb.partyMasterId) {
					if(filter == 1)
						alert('Please Enter LR Number Of Same Party!');
					else if(filter == 2)
						alert('Please Enter LR Number Of Same Party!');
						
					return;
				}
			}
			
			rowstoAdd(wb);
		} else {
			if(filter == 1)
				alert('Please Enter LR Number Of Due Payment !');
			else if(filter == 2)
				alert('Please Enter LR Number Of Due Payment !');
		}
								
		if(filter == 1) {
			$('#wbNumber').val('');
			document.getElementById('wbNumber').focus();
		} else if(filter == 2) {
			$('#crNumber').val('');
			document.getElementById('crNumber').focus();
		}
				
		$('#CreditPaymentModuleId').removeClass('hide');
	}
}

/*Calling from getDataToCreateLRCreditBillBySingleWayBill.js*/
function rowstoAdd(cpd){
	
	if(lrCreditConfig.isCRNoColumnDisplay) {
		rowstoAddWithCRNo(cpd);
	} else {
		var table    = document.getElementById('reportTable');
		document.getElementById('headerRow_0').style.display 		 = 'table-row';
		document.getElementById('upSaveTable').style.display     	 = 'table';
		document.getElementById('downSaveTable').style.display   	 = 'table';
		var rowCount = table.rows.length;
		var curRow   = table.rows[rowCount-1];
		var partyMasterIdAdded	= false;

		curId        = parseInt(getRowNo(curRow));

		var nextId 	 = curId+1;

		document.getElementById("mainFeildSet").style.display = 'block';
		var row = table.insertRow(rowCount);
		row.id = 'CreditRow_'+nextId;

		var cell1 			= row.insertCell(0);
		var element1 		= document.getElementById('check1').cloneNode(true);
		element1.value 		= nextId;
		element1.id			= 'check1_'+nextId;
		element1.className	= 'checkbox';
		element1.name		= 'check1_'+nextId;
		cell1.appendChild(element1);

		var cell2 			= row.insertCell(1);
		cell2.innerHTML 	= cpd.wayBillNumber;
		cell2.className 	= 'datatd';
		cell2.align			= 'left';

if(lrCreditConfig.showBookingAndDeliveryDateInSeparateColumn) {
		var cell3 			= row.insertCell(2);		
		if (cpd.bookingDateTime) {
				let bkgDateObj = new Date(cpd.bookingDateTime);

				if (!isNaN(bkgDateObj.getTime()))
					cell3.innerHTML = formatDate(bkgDateObj);
				else 
					cell3.innerHTML = "--"; 
				
			} else{
				cell3.innerHTML = "--";
		}
		cell3.className		= 'datatd';
		cell3.align			= 'left';
		}else{
		var cell3 			= row.insertCell(2);
		cell3.innerHTML		= cpd.creationDateTime;
		cell3.className		= 'datatd';
		cell3.align			= 'left';
		}
		
		

		var cell4 			= row.insertCell(3);
		cell4.innerHTML 	= cpd.sourceBranch;
		cell4.className		= 'datatd';
		cell4.align			= 'left';

		var cell5 			= row.insertCell(4);
		cell5.innerHTML 	= cpd.destinationBranch;
		cell5.className		= 'datatd';
		cell5.align			= 'left';

		var cell6 			= row.insertCell(5);
		cell6.innerHTML		= cpd.consignor;
		cell6.className		= 'datatd';
		cell6.align			= 'left';

		var cell7 			= row.insertCell(6);
		cell7.innerHTML		= cpd.consignee;
		cell7.className		= 'datatd';
		cell7.align			= 'left';

		var cell8 			= row.insertCell(7);
		cell8.id			= 'actWght_'+nextId;
		cell8.name			= 'actWght_'+nextId;
		cell8.innerHTML		= cpd.actualWeight;
		cell8.className		= 'datatd';
		cell8.align			= 'right';

		var cell9 			= row.insertCell(8);
		cell9.id			= 'packages_'+nextId;
		cell9.name			= 'packages_'+nextId;
		cell9.innerHTML		= cpd.quantity;
		cell9.className		= 'datatd';
		cell9.align			= 'right';

		if(tdsConfiguration.IsTdsAllow && (tdsConfiguration.IsPANNumberRequired || tdsConfiguration.IsTANNumberRequired)) {
			if(tdsConfiguration.IsPANNumberRequired && tdsConfiguration.IsTANNumberRequired) {
				var cell10 			= row.insertCell(9);
				var element29 		= document.getElementById('panNumber').cloneNode(true);
				element29.id 		= 'panNumber_'+nextId;
				element29.name 		= 'panNumber_'+nextId;
				cell10.appendChild(element29);

				var cell10 			= row.insertCell(10);
				var element29 		= document.getElementById('tanNumber').cloneNode(true);
				element29.id 		= 'tanNumber_'+nextId;
				element29.name 		= 'tanNumber_'+nextId;
				cell10.appendChild(element29);

				var cell11 			= row.insertCell(11);
				var element101 		= document.getElementById('hiddenPaymentMode').cloneNode(true);
				element101.id 		= 'hiddenPaymentMode_'+nextId;
				element101.name 	= 'hiddenPaymentMode_'+nextId;
				element101.type 	= 'hidden';
				cell11.appendChild(element101);

				var element10 		= document.getElementById('paymentMode').cloneNode(true);
				element10.id 		= 'paymentMode_'+nextId;
				element10.name 		= 'paymentMode_'+nextId;
				cell11.appendChild(element10);
				cell11.className	= 'datatd';
				cell11.align		= 'center';

				var cell12 			= row.insertCell(12);
				var element11 		= document.getElementById('remark').cloneNode(true);
				element11.id 		= 'remark_'+nextId;
				element11.name 		= 'remark_'+nextId;
				cell12.appendChild(element11);

				if(!bankPaymentOperationRequired) {
					var element12 		= document.getElementById('chequeNumber').cloneNode(true);
					element12.id 		= 'chequeNumber_'+nextId;
					element12.name 		= 'chequeNumber_'+nextId;
					element12.readOnly 	= true;
					cell12.appendChild(element12);

					var element13 		= document.getElementById('bankName').cloneNode(true);
					element13.id 		= 'bankName_'+nextId;
					element13.name 		= 'bankName_'+nextId;
					element13.readOnly 	= true;
					cell12.appendChild(element13);

					var element14 		= document.getElementById('chequeDate').cloneNode(true);
					element14.id 		= 'chequeDate_'+nextId;
					element14.name 		= 'chequeDate_'+nextId;
					cell12.appendChild(element14);

					setChequeDate('chequeDate_' + nextId);
				}

				var cell13 			= row.insertCell(13);

				var element161 		= document.getElementById('hiddenPaymentStatus').cloneNode(true);
				element161.id 		= 'hiddenPaymentStatus_' + nextId;
				element161.name 	= 'hiddenPaymentStatus_' + nextId;
				element161.type 	= 'hidden';
				cell13.appendChild(element161);

				var element16 		= document.getElementById('paymentStatus').cloneNode(true);
				element16.id 		= 'paymentStatus_' + nextId;
				element16.name 		= 'paymentStatus_' + nextId;
				cell13.appendChild(element16);

				var cell14 			= row.insertCell(14);
				var element17 		= document.getElementById('grandTotal').cloneNode(true);
				element17.id 		= 'grandTotal_'+nextId;
				element17.name 		= 'grandTotal_'+nextId;
				element17.value 	= cpd.grandTotal;
				cell14.appendChild(element17);

				var cell15 			= row.insertCell(15);
				var element27 		= document.getElementById('txnAmount').cloneNode(true);
				element27.id 		= 'txnAmount_'+nextId;
				element27.name 		= 'txnAmount_'+nextId;
				element27.value 	= 0;
				cell15.appendChild(element27);

				var cell16 			= row.insertCell(16);
				var element26 		= document.getElementById('tdsAmt').cloneNode(true);
				element26.id 		= 'tdsAmt_'+nextId;
				element26.name 		= 'tdsAmt_'+nextId;
				element26.value 	= 0;
				
				if(tdsConfiguration.calculateTdsOnTotal && cpd.tdsAmount > 0)
					element26.readOnly 	= true;
				
				cell16.appendChild(element26);

				var element28 		= document.getElementById('tdsAmtLimit').cloneNode(true);
				element28.id 		= 'tdsAmtLimit_'+nextId;
				element28.name 		= 'tdsAmtLimit_'+nextId;
				element28.value 	= 0;
				cell16.appendChild(element28);

				var cell17 			= row.insertCell(17);
				var element18 		= document.getElementById('receiveAmt').cloneNode(true);
				element18.id 		= 'receiveAmt_'+nextId;
				element18.name 		= 'receiveAmt_'+nextId;
				cell17.appendChild(element18);

				var element5 		= document.getElementById('receivedAmtLimit').cloneNode(true);
				element5.id 		= 'receivedAmtLimit_'+nextId;
				element5.name 		= 'receivedAmtLimit_'+nextId;
				
				if(lrCreditConfig.allowPartialPaymentInMultipleClear)
					element5.value 		=  cpd.receivedAmount;
				
				cell17.appendChild(element5);

				var element25 		= document.getElementById('creditWayBillTxnId').cloneNode(true);
				element25.id 		= 'creditWayBillTxnId_'+nextId;
				element25.name 		= 'creditWayBillTxnId_'+nextId;
				element25.value 	= cpd.creditWayBillTxnId;
				cell17.appendChild(element25);

				var element34 		= document.getElementById('partyMasterIdNo').cloneNode(true);
				element34.id 		= 'partyMasterIdNo_'+nextId;
				element34.name 		= 'partyMasterIdNo_'+nextId;
				element34.value 	= cpd.partyMasterId;
				cell17.appendChild(element34);
				partyMasterIdAdded	=	true;

				var element6 		= document.getElementById('txnTypeId').cloneNode(true);
				element6.id 		= 'txnTypeId_'+nextId;
				element6.name 		= 'txnTypeId_'+nextId;
				element6.value 		= cpd.txnTypeId;
				cell17.appendChild(element6);

				var cell18 			= row.insertCell(18);
				var element19 		= document.getElementById('balanceAmt').cloneNode(true);
				element19.id 		= 'balanceAmt_'+nextId;
				element19.name 		= 'balanceAmt_'+nextId;
				element19.value		= cpd.grandTotal - cpd.receivedAmount;
					
				cell18.appendChild(element19);

				var element20 		= document.getElementById('billId').cloneNode(true);
				element20.id 		= 'billId_'+nextId;
				element20.name 		= 'billId_'+nextId;
				element20.value		= cpd.wayBillId;
				cell18.appendChild(element20);

				var element21 		= document.getElementById('billNumber').cloneNode(true);
				element21.id 		= 'billNumber_'+nextId;
				element21.name 		= 'billNumber_'+nextId;
				element21.value		= cpd.wayBillNumber;
				cell18.appendChild(element21);

				var element22 		= document.getElementById('branchId').cloneNode(true);
				element22.id 		= 'branchId_'+nextId;
				element22.name 		= 'branchId_'+nextId;
				element22.value		= cpd.branchId;
				cell18.appendChild(element22);

				if(searchByCollectionPersonAllow) {
					var cell19 			= row.insertCell(19);
					cell19.innerHTML	= cpd.collectionPersonName;
					cell19.className	= 'datatd';
					cell19.align		= 'left'; 
				}else{
					var cell19 				= row.insertCell(19);
					cell19.className		='datatd';
					cell19.innerHTML		= '-----';
					cell19.style.display	='none';
				}

				if(lrCreditConfig.isViewColumnDisplay) {
					var cell20 				= row.insertCell(20);
					cell20.className		='datatd';
					cell20.innerHTML		= '-----';
				}

				if(lrCreditConfig.isDiscountColumnDisplay) {
					var cell21 			= row.insertCell(21);
					var element23 		= document.getElementById('discountTypes').cloneNode(true);
					element23.id 		='discountTypes_'+nextId;
					element23.name 		='discountTypes_'+nextId;
					cell21.className	='datatd';
					cell21.appendChild(element23);
				}
			} else {
				var cell10 			= row.insertCell(9);
				var element29 		= document.getElementById('panNumber').cloneNode(true);
				element29.id 		= 'panNumber_'+nextId;
				element29.name 		= 'panNumber_'+nextId;
				cell10.appendChild(element29);

				var cell11 			= row.insertCell(10);
				var element101 		= document.getElementById('hiddenPaymentMode').cloneNode(true);
				element101.id 		= 'hiddenPaymentMode_'+nextId;
				element101.name 	= 'hiddenPaymentMode_'+nextId;
				element101.type 	= 'hidden';
				cell11.appendChild(element101);

				var element10 		= document.getElementById('paymentMode').cloneNode(true);
				element10.id 		= 'paymentMode_'+nextId;
				element10.name 		= 'paymentMode_'+nextId;
				cell11.appendChild(element10);
				cell11.className	= 'datatd';
				cell11.align		= 'center';

				var cell12 			= row.insertCell(11);
				var element11 		= document.getElementById('remark').cloneNode(true);
				element11.id 		= 'remark_'+nextId;
				element11.name 		= 'remark_'+nextId;
				cell12.appendChild(element11);

				if(!bankPaymentOperationRequired) {
					var element12 		= document.getElementById('chequeNumber').cloneNode(true);
					element12.id 		= 'chequeNumber_'+nextId;
					element12.name 		= 'chequeNumber_'+nextId;
					element12.readOnly 	= true;
					cell12.appendChild(element12);

					var element13 		= document.getElementById('bankName').cloneNode(true);
					element13.id 		= 'bankName_'+nextId;
					element13.name 		= 'bankName_'+nextId;
					element13.readOnly 	= true;
					cell12.appendChild(element13);

					var element14 		= document.getElementById('chequeDate').cloneNode(true);
					element14.id 		= 'chequeDate_'+nextId;
					element14.name 		= 'chequeDate_'+nextId;
					cell12.appendChild(element14);

					setChequeDate('chequeDate_' + nextId);
				}

				var cell13 			= row.insertCell(12);

				var element161 		= document.getElementById('hiddenPaymentStatus').cloneNode(true);
				element161.id 		= 'hiddenPaymentStatus_' + nextId;
				element161.name 	= 'hiddenPaymentStatus_' + nextId;
				element161.type 	= 'hidden';
				cell13.appendChild(element161);

				var element16 		= document.getElementById('paymentStatus').cloneNode(true);
				element16.id 		= 'paymentStatus_' + nextId;
				element16.name 		= 'paymentStatus_' + nextId;
				cell13.appendChild(element16);

				var cell14 			= row.insertCell(13);
				var element17 		= document.getElementById('grandTotal').cloneNode(true);
				element17.id 		= 'grandTotal_'+nextId;
				element17.name 		= 'grandTotal_'+nextId;
				element17.value 	= cpd.grandTotal;
				cell14.appendChild(element17);

				var cell15 			= row.insertCell(14);
				var element27 		= document.getElementById('txnAmount').cloneNode(true);
				element27.id 		= 'txnAmount_'+nextId;
				element27.name 		= 'txnAmount_'+nextId;
				element27.value 	= 0;
				cell15.appendChild(element27);

				var cell16 			= row.insertCell(15);
				var element26 		= document.getElementById('tdsAmt').cloneNode(true);
				element26.id 		= 'tdsAmt_'+nextId;
				element26.name 		= 'tdsAmt_'+nextId;
				element26.value 	= 0;
				
				if(tdsConfiguration.calculateTdsOnTotal && cpd.tdsAmount > 0)
					element26.readOnly 	= true;
				
				cell16.appendChild(element26);

				var element28 		= document.getElementById('tdsAmtLimit').cloneNode(true);
				element28.id 		= 'tdsAmtLimit_'+nextId;
				element28.name 		= 'tdsAmtLimit_'+nextId;
				element28.value 	= 0;
				cell16.appendChild(element28);

				var cell17 			= row.insertCell(16);
				var element18 		= document.getElementById('receiveAmt').cloneNode(true);
				element18.id 		= 'receiveAmt_'+nextId;
				element18.name 		= 'receiveAmt_'+nextId;
				cell17.appendChild(element18);

				var element5 		= document.getElementById('receivedAmtLimit').cloneNode(true);
				element5.id 		= 'receivedAmtLimit_'+nextId;
				element5.name 		= 'receivedAmtLimit_'+nextId;
			
				if(lrCreditConfig.allowPartialPaymentInMultipleClear)
					element5.value 		=  cpd.receivedAmount;
				
				cell17.appendChild(element5);

				var element25 		= document.getElementById('creditWayBillTxnId').cloneNode(true);
				element25.id 		= 'creditWayBillTxnId_'+nextId;
				element25.name 		= 'creditWayBillTxnId_'+nextId;
				element25.value 	= cpd.creditWayBillTxnId;
				cell17.appendChild(element25);

				var element34 		= document.getElementById('partyMasterIdNo').cloneNode(true);
				element34.id 		= 'partyMasterIdNo_'+nextId;
				element34.name 		= 'partyMasterIdNo_'+nextId;
				element34.value 	= cpd.partyMasterId;
				cell17.appendChild(element34);
				partyMasterIdAdded	=	true;

				var element6 		= document.getElementById('txnTypeId').cloneNode(true);
				element6.id 		= 'txnTypeId_'+nextId;
				element6.name 		= 'txnTypeId_'+nextId;
				element6.value 		= cpd.txnTypeId;
				cell17.appendChild(element6);

				var cell18 			= row.insertCell(17);
				var element19 		= document.getElementById('balanceAmt').cloneNode(true);
				element19.id 		= 'balanceAmt_'+nextId;
				element19.name 		= 'balanceAmt_'+nextId;
				element19.value		= cpd.grandTotal - cpd.receivedAmount;
					
				cell18.appendChild(element19);

				var element20 		= document.getElementById('billId').cloneNode(true);
				element20.id 		= 'billId_'+nextId;
				element20.name 		= 'billId_'+nextId;
				element20.value		= cpd.wayBillId;
				cell18.appendChild(element20);

				var element21 		= document.getElementById('billNumber').cloneNode(true);
				element21.id 		= 'billNumber_'+nextId;
				element21.name 		= 'billNumber_'+nextId;
				element21.value		= cpd.wayBillNumber;
				cell18.appendChild(element21);

				var element22 		= document.getElementById('branchId').cloneNode(true);
				element22.id 		= 'branchId_'+nextId;
				element22.name 		= 'branchId_'+nextId;
				element22.value		= cpd.branchId;
				cell18.appendChild(element22);

				if(searchByCollectionPersonAllow) {
					var cell19 			= row.insertCell(18);
					cell19.innerHTML	= cpd.collectionPersonName;
					cell19.className	= 'datatd';
					cell19.align		= 'left'; 
				} else {
					var cell19 				= row.insertCell(18);
					cell19.className		='datatd';
					cell19.innerHTML		= '-----';
					cell19.style.display	='none';
				}

				if(lrCreditConfig.isViewColumnDisplay) {
					var cell20 				= row.insertCell(19);
					cell20.className		='datatd';
					cell20.innerHTML		= '-----';
				}

				if(lrCreditConfig.isDiscountColumnDisplay) {
					var cell21 			= row.insertCell(20);
					var element23 		= document.getElementById('discountTypes').cloneNode(true);
					element23.id 		='discountTypes_'+nextId;
					element23.name 		='discountTypes_'+nextId;
					cell21.className	='datatd';
					cell21.appendChild(element23);
				}
			}
		}  else {

			var cell10 			= row.insertCell(9);

			var element101 		= document.getElementById('hiddenPaymentMode').cloneNode(true);
			element101.id 		= 'hiddenPaymentMode_' + nextId;
			element101.name 	= 'hiddenPaymentMode_' + nextId;
			element101.type 	= 'hidden';
			cell10.appendChild(element101);

			var element10 		= document.getElementById('paymentMode').cloneNode(true);
			element10.id 		= 'paymentMode_'+nextId;
			element10.name 		= 'paymentMode_'+nextId;
			cell10.appendChild(element10);
			cell10.className	= 'datatd';
			cell10.align		= 'center';

			var cell11 			= row.insertCell(10);
			var element11 		= document.getElementById('remark').cloneNode(true);
			element11.id 		= 'remark_'+nextId;
			element11.name 		= 'remark_'+nextId;
			cell11.appendChild(element11);

			if(document.getElementById('chequeNumber') != null) {
				var element12 		= document.getElementById('chequeNumber').cloneNode(true);
				element12.id 		= 'chequeNumber_'+nextId;
				element12.name 		= 'chequeNumber_'+nextId;
				element12.readOnly 	= true;
				cell11.appendChild(element12);
			}

			if(!bankPaymentOperationRequired) {
				if(document.getElementById('bankName') != null) {
					var element13 		= document.getElementById('bankName').cloneNode(true);
					element13.id 		= 'bankName_'+nextId;
					element13.name 		= 'bankName_'+nextId;
					element13.readOnly 	= true;
					cell11.appendChild(element13);
				}

				if(document.getElementById('chequeDate') != null) {
					var element14 		= document.getElementById('chequeDate').cloneNode(true);
					element14.id 		= 'chequeDate_'+nextId;
					element14.name 		= 'chequeDate_'+nextId;
					cell11.appendChild(element14);

					setChequeDate('chequeDate_' + nextId);
				}
			}

			var cell12 			= row.insertCell(11);

			var element161 		= document.getElementById('hiddenPaymentStatus').cloneNode(true);
			element161.id 		= 'hiddenPaymentStatus_' + nextId;
			element161.name 	= 'hiddenPaymentStatus_' + nextId;
			element161.type 	= 'hidden';
			cell12.appendChild(element161);

			var element16 		= document.getElementById('paymentStatus').cloneNode(true);
			element16.id 		= 'paymentStatus_' + nextId;
			element16.name 		= 'paymentStatus_' + nextId;
			cell12.appendChild(element16);

			var cell13 			= row.insertCell(12);
			var element17 		= document.getElementById('grandTotal').cloneNode(true);
			element17.id 		= 'grandTotal_'+nextId;
			element17.name 		= 'grandTotal_'+nextId;
			element17.value 	= cpd.grandTotal;
			cell13.appendChild(element17);
			
			if(tdsConfiguration.IsTdsAllow) {
				var cell23 			= row.insertCell(13);
				var element27 		= document.getElementById('txnAmount').cloneNode(true);
				element27.id 		= 'txnAmount_'+nextId;
				element27.name 		= 'txnAmount_'+nextId;
				element27.value 	= 0;
				cell23.appendChild(element27);

				var cell24 			= row.insertCell(14);
				var element26 		= document.getElementById('tdsAmt').cloneNode(true);
				element26.id 		= 'tdsAmt_'+nextId;
				element26.name 		= 'tdsAmt_'+nextId;
				element26.value 	= 0;
				
				if(tdsConfiguration.calculateTdsOnTotal && cpd.tdsAmount > 0)
					element26.readOnly 	= true;
				
				cell24.appendChild(element26);

				var element28 		= document.getElementById('tdsAmtLimit').cloneNode(true);
				element28.id 		= 'tdsAmtLimit_'+nextId;
				element28.name 		= 'tdsAmtLimit_'+nextId;
				element28.value 	= 0;
				cell24.appendChild(element28);

				var cell14 			= row.insertCell(15);
				var element18 		= document.getElementById('receiveAmt').cloneNode(true);
				element18.id 		= 'receiveAmt_'+nextId;
				element18.name 		= 'receiveAmt_'+nextId;
				cell14.appendChild(element18);

				var element5 		= document.getElementById('receivedAmtLimit').cloneNode(true);
				element5.id 		= 'receivedAmtLimit_'+nextId;
				element5.name 		= 'receivedAmtLimit_'+nextId;
				
				if(lrCreditConfig.allowPartialPaymentInMultipleClear)
					element5.value 		=  cpd.receivedAmount;

				cell14.appendChild(element5);

				var element25 		= document.getElementById('creditWayBillTxnId').cloneNode(true);
				element25.id 		= 'creditWayBillTxnId_'+nextId;
				element25.name 		= 'creditWayBillTxnId_'+nextId;
				element25.value 	= cpd.creditWayBillTxnId;
				cell14.appendChild(element25);

				var element6 		= document.getElementById('txnTypeId').cloneNode(true);
				element6.id 		= 'txnTypeId_'+nextId;
				element6.name 		= 'txnTypeId_'+nextId;
				element6.value 		= cpd.txnTypeId;
				cell14.appendChild(element6);

				var cell15 			= row.insertCell(16);
				var element19 		= document.getElementById('balanceAmt').cloneNode(true);
				element19.id 		= 'balanceAmt_'+nextId;
				element19.name 		= 'balanceAmt_'+nextId;
				element19.value		= cpd.grandTotal - cpd.receivedAmount;

				cell15.appendChild(element19);

				var element20 		= document.getElementById('billId').cloneNode(true);
				element20.id 		= 'billId_'+nextId;
				element20.name 		= 'billId_'+nextId;
				element20.value		= cpd.wayBillId;
				cell15.appendChild(element20);

				var element21 		= document.getElementById('billNumber').cloneNode(true);
				element21.id 		= 'billNumber_'+nextId;
				element21.name 		= 'billNumber_'+nextId;
				element21.value		= cpd.wayBillNumber;
				cell15.appendChild(element21);

				var element22 		= document.getElementById('branchId').cloneNode(true);
				element22.id 		= 'branchId_'+nextId;
				element22.name 		= 'branchId_'+nextId;
				element22.value		= cpd.branchId;
				cell15.appendChild(element22);

				if(searchByCollectionPersonAllow) {
					var cell16 			= row.insertCell(17);
					cell16.innerHTML	= cpd.collectionPersonName;
					cell16.className	= 'datatd';
					cell16.align		= 'left'; 
				}else{
					var cell16 				= row.insertCell(17);
					cell16.className		='datatd';
					cell16.innerHTML		= '-----';
					cell16.style.display	='none';
				}

				if(lrCreditConfig.isViewColumnDisplay) {
					var cell17 				= row.insertCell(18);
					cell17.className		='datatd';
					cell17.innerHTML		= '-----';
				}

				var element23 		= document.getElementById('discountTypes').cloneNode(true);
				element23.id 		='discountTypes_'+nextId;
				element23.name 		='discountTypes_'+nextId;

				if(!lrCreditConfig.isViewColumnDisplay && lrCreditConfig.isDiscountColumnDisplay) {
					var cell17 			= row.insertCell(18);
					cell17.className	='datatd';
					cell17.appendChild(element23);
				} else if(lrCreditConfig.isViewColumnDisplay && lrCreditConfig.isDiscountColumnDisplay) {
					var cell18 			= row.insertCell(19);
					cell18.className	='datatd';
					cell18.appendChild(element23);
				}
			} else {
				var cell14 			= row.insertCell(13);
				var element18 		= document.getElementById('receiveAmt').cloneNode(true);
				element18.id 		= 'receiveAmt_'+nextId;
				element18.name 		= 'receiveAmt_'+nextId;
				cell14.appendChild(element18);

				var element5 		= document.getElementById('receivedAmtLimit').cloneNode(true);
				element5.id 		= 'receivedAmtLimit_'+nextId;
				element5.name 		= 'receivedAmtLimit_'+nextId;
				
				if(lrCreditConfig.allowPartialPaymentInMultipleClear)
					element5.value 		=  cpd.receivedAmount;
				
				cell14.appendChild(element5);

				var element25 		= document.getElementById('creditWayBillTxnId').cloneNode(true);
				element25.id 		= 'creditWayBillTxnId_'+nextId;
				element25.name 		= 'creditWayBillTxnId_'+nextId;
				element25.value 	= cpd.creditWayBillTxnId;
				cell14.appendChild(element25);

				var element6 		= document.getElementById('txnTypeId').cloneNode(true);
				element6.id 		= 'txnTypeId_'+nextId;
				element6.name 		= 'txnTypeId_'+nextId;
				element6.value 		= cpd.txnTypeId;
				cell14.appendChild(element6);

				var cell15 			= row.insertCell(14);
				var element19 		= document.getElementById('balanceAmt').cloneNode(true);
				element19.id 		= 'balanceAmt_'+nextId;
				element19.name 		= 'balanceAmt_'+nextId;
				element19.value		= cpd.grandTotal - cpd.receivedAmount;
				
				cell15.appendChild(element19);

				var element20 		= document.getElementById('billId').cloneNode(true);
				element20.id 		= 'billId_'+nextId;
				element20.name 		= 'billId_'+nextId;
				element20.value		= cpd.wayBillId;
				cell15.appendChild(element20);

				var element21 		= document.getElementById('billNumber').cloneNode(true);
				element21.id 		= 'billNumber_'+nextId;
				element21.name 		= 'billNumber_'+nextId;
				element21.value		= cpd.wayBillNumber;
				cell15.appendChild(element21);

				var element22 		= document.getElementById('branchId').cloneNode(true);
				element22.id 		= 'branchId_'+nextId;
				element22.name 		= 'branchId_'+nextId;
				element22.value		= cpd.branchId;
				cell15.appendChild(element22);

				if(searchByCollectionPersonAllow) {
					var cell16 			= row.insertCell(15);
					cell16.innerHTML	= cpd.collectionPersonName;
					cell16.className	= 'datatd';
					cell16.align		= 'left'; 
				}else{
					var cell16 				= row.insertCell(15);
					cell16.className		='datatd';
					cell16.innerHTML		= '-----';
					cell16.style.display	='none';
				}

				if(lrCreditConfig.isViewColumnDisplay) {
					var cell17 				= row.insertCell(16);
					cell17.className		='datatd';
					cell17.innerHTML		= '-----';
				}

				var element23 		= document.getElementById('discountTypes').cloneNode(true);
				element23.id 		='discountTypes_'+nextId;
				element23.name 		='discountTypes_'+nextId;

				if(!lrCreditConfig.isViewColumnDisplay && lrCreditConfig.isDiscountColumnDisplay) {
					var cell17 			= row.insertCell(16);
					cell17.className	='datatd';
					cell17.appendChild(element23);
				} else if(lrCreditConfig.isViewColumnDisplay && lrCreditConfig.isDiscountColumnDisplay) {
					var cell18 			= row.insertCell(17);
					cell18.className	='datatd';
					cell18.appendChild(element23);
				}
			}
		}
		
		if(tdsConfiguration.IsTdsAllow) {
			if(lrCreditConfig.showChargeWeightInActualWeightColumnForPrint) {
				var cell22				= row.insertCell(20);
				cell22.id				= 'charWght_'+nextId;
				cell22.name				= 'charWght_'+nextId;
				cell22.innerHTML		= cpd.chargeWeight;
				cell22.className		= 'datatd';
				cell22.align			= 'right';
				cell22.style.display	='none';
			}
		} else {
			if(lrCreditConfig.showChargeWeightInActualWeightColumnForPrint) {
				var cell22				= row.insertCell(18);
				cell22.id				= 'charWght_'+nextId;
				cell22.name				= 'charWght_'+nextId;
				cell22.innerHTML		= cpd.chargeWeight;
				cell22.className		= 'datatd';
				cell22.align			= 'right';
				cell22.style.display	='none';
			}
		}
		
		if(!partyMasterIdAdded){
			var element34 		= document.getElementById('partyMasterIdNo').cloneNode(true);
			element34.id 		= 'partyMasterIdNo_'+nextId;
			element34.name 		= 'partyMasterIdNo_'+nextId;
			element34.value 	= cpd.partyMasterId;
			if(cell17 != undefined) {
				cell17.appendChild(element34);
			}
		}
	
		if(lrCreditConfig.showInvoiceNumber){
			var cell23				= row.insertCell(row.cells.length);
			cell23.id				= 'charWght_'+nextId;
			cell23.name				= 'charWght_'+nextId;
			cell23.innerHTML		= cpd.invoiceNo	;
			cell23.className		= 'datatd';
			cell23.align			= 'right';
		}

		if (lrCreditConfig.showStatementNumber) {
			var element23 		= document.getElementById('statementNo').cloneNode(true);

			element23.id = 'statementNo_' + nextId;
			element23.name = 'statementNo_' + nextId;
			
			var statementCell = row.insertCell(row.cells.length);
			statementCell.className = 'datatd';
			statementCell.align = 'center';

			statementCell.appendChild(element23);
		}

		if (lrCreditConfig.showBookingAndDeliveryDateInSeparateColumn) {
			var cellA = row.insertCell(18);
			cellA.id = 'DlyDateCol_' + nextId;
			cellA.name = 'DlyDateCol_' + nextId;

			if (cpd.waybillDeliveryDate) {
				let dlyDateObj = new Date(cpd.waybillDeliveryDate);

				if (!isNaN(dlyDateObj.getTime()))
					cellA.innerHTML = formatDate(dlyDateObj);
				else 
					cellA.innerHTML = "--"; 
				
			} else
				cellA.innerHTML = "--";
				
			cellA.className = 'datatd';
			cellA.align = 'right';
		}
		if (lrCreditConfig.showDispatchDateColumn) {
			var cellB = row.insertCell(19);
			cellB.id = 'DispatchDateCol_' + nextId;
			cellB.name = 'DispatchDateCol_' + nextId;
			if (cpd.wayBillDispatchDateTime) {
				let dispatchDateObj = new Date(cpd.wayBillDispatchDateTime);
				if (!isNaN(dispatchDateObj.getTime())) 
					cellB.innerHTML = formatDate(dispatchDateObj);
				else 
					cellB.innerHTML = "--";  
			} else 
				cellB.innerHTML = "--"; 
			
			cellB.className = 'datatd';
			cellB.align = 'right';
		}

		if (lrCreditConfig.showDeliveredToNameColumn) {
			var cellC = row.insertCell(20);
			cellC.id = 'deliveredToNameCol_' + nextId;
			cellC.name = 'deliveredToNameCol_' + nextId;
			cellC.innerHTML = cpd.deliveredToName ? cpd.deliveredToName : '--';
			cellC.className = 'datatd';
			cellC.align = 'right';
		}
		//validateTxnAmountForMultipleClear();
		

		var tableForDwldExcel    = document.getElementById('reportTable2');
		var rowCountForDwldExcel = tableForDwldExcel.rows.length;

		var rowForDwldExcel = tableForDwldExcel.insertRow(rowCountForDwldExcel);
		rowForDwldExcel.id = 'CreditClearanceRow_'+nextId;
		var i =0
		var dwldExcelcell1 			= rowForDwldExcel.insertCell(i);
		dwldExcelcell1.id			='actWght_'+nextId;
		dwldExcelcell1.name			='actWght_'+nextId;
		dwldExcelcell1.innerHTML	=nextId;
		dwldExcelcell1.className	='datatd';
		dwldExcelcell1.align		='right'; 
		i++;
		var dwldExcelcell2 			= rowForDwldExcel.insertCell(i);
		dwldExcelcell2.id			='actWght_'+nextId;
		dwldExcelcell2.name			='actWght_'+nextId;
		dwldExcelcell2.innerHTML	= cpd.wayBillNumber;
		dwldExcelcell2.className	='datatd';
		dwldExcelcell2.align		='right'; 
		i++;

		if (lrCreditConfig.showBookingAndDeliveryDateInSeparateColumn) {
			var dwldExcelcell3 = rowForDwldExcel.insertCell(i);
			dwldExcelcell3.id = 'actWght_' + nextId;
			dwldExcelcell3.name = 'actWght_' + nextId;
			if (cpd.bookingDateTime) {
				let bkgDateObj = new Date(cpd.bookingDateTime);

				if (!isNaN(bkgDateObj.getTime()))
					dwldExcelcell3.innerHTML = formatDate(bkgDateObj);
				else
					dwldExcelcell3.innerHTML = "--";

			} else {
				dwldExcelcell3.innerHTML = "--";
			}
			dwldExcelcell3.className = 'datatd';
			dwldExcelcell3.align = 'left';
			i++;

		} else if (lrCreditConfig.showBookingDateColumnInPrint) {
			var dwldExcelcell3 = rowForDwldExcel.insertCell(i);
			dwldExcelcell3.id = 'actWght_' + nextId;
			dwldExcelcell3.name = 'actWght_' + nextId;
			dwldExcelcell3.innerHTML = cpd.creationDateTime;
			dwldExcelcell3.className = 'datatd';
			dwldExcelcell3.align = 'right';
			i++;
		}
		if(lrCreditConfig.showSourceBranchColumnInPrint){
			var dwldExcelcell4			= rowForDwldExcel.insertCell(i);
			dwldExcelcell4.id			='actWght_'+nextId;
			dwldExcelcell4.name			='actWght_'+nextId;
			dwldExcelcell4.innerHTML	= cpd.sourceBranch;
			dwldExcelcell4.className	='datatd';
			dwldExcelcell4.align		='left'; 
			i++;
		}

		if(lrCreditConfig.showDestinationBranchColumnInPrint){
			var dwldExcelcell5 			= rowForDwldExcel.insertCell(i);
			dwldExcelcell5.id			='actWght_'+nextId;
			dwldExcelcell5.name			='actWght_'+nextId;
			dwldExcelcell5.innerHTML	= cpd.destinationBranch;
			dwldExcelcell5.className	='datatd';
			dwldExcelcell5.align		='right'; 
			i++;
		}

		if (!lrCreditConfig.hideConsignorColumnInPrint) {
			var dwldExcelcell6 = rowForDwldExcel.insertCell(i);
			dwldExcelcell6.id = 'actWght_' + nextId;
			dwldExcelcell6.name = 'actWght_' + nextId;
			dwldExcelcell6.innerHTML = cpd.consignor;
			dwldExcelcell6.className = 'datatd';
			dwldExcelcell6.align = 'right';
			i++;
		}
		var dwldExcelcell7 			= rowForDwldExcel.insertCell(i);
		dwldExcelcell7.id			='actWght_'+nextId;
		dwldExcelcell7.name			='actWght_'+nextId;
		dwldExcelcell7.innerHTML	= cpd.consignee;
		dwldExcelcell7.className	='datatd';
		dwldExcelcell7.align		='right'; 
		i++;


		if (!lrCreditConfig.hideWeightColumnInPrint) {
			if (lrCreditConfig.showChargeWeightInActualWeightColumnForPrint) {
				var dwldExcelcell8 = rowForDwldExcel.insertCell(i);
				dwldExcelcell8.id = 'actWght_' + nextId;
				dwldExcelcell8.name = 'actWght_' + nextId;
				dwldExcelcell8.innerHTML = cpd.chargeWeight;
				dwldExcelcell8.className = 'datatd';
				dwldExcelcell8.align = 'right';
				i++;
			} else {
				var dwldExcelcell8 = rowForDwldExcel.insertCell(i);
				dwldExcelcell8.id = 'actWght_' + nextId;
				dwldExcelcell8.name = 'actWght_' + nextId;
				dwldExcelcell8.innerHTML = cpd.actualWeight;
				dwldExcelcell8.className = 'datatd';
				dwldExcelcell8.align = 'right';
				i++;
			}
		}

		var dwldExcelcell9 			= rowForDwldExcel.insertCell(i);
		dwldExcelcell9.id			='actWght_'+nextId;
		dwldExcelcell9.name			='actWght_'+nextId;
		dwldExcelcell9.innerHTML	= cpd.quantity;
		dwldExcelcell9.className	='datatd';
		dwldExcelcell9.align		='right'; 
		i++;
		
		if(lrCreditConfig.showBookingTotalColumnInPrint){
			var dwldExcelcell10 		= rowForDwldExcel.insertCell(i);
			dwldExcelcell10.id			='actWght_'+nextId;
			dwldExcelcell10.name		='actWght_'+nextId;

			if((cpd.wayBillTypeId == WAYBILL_TYPE_PAID && cpd.txnTypeId == 2) || cpd.wayBillTypeId == WAYBILL_TYPE_CREDIT)
				dwldExcelcell10.innerHTML	= 0;	
			else{
				dwldExcelcell10.innerHTML	= cpd.bookingTotal;
				totalBookingTotal+=parseInt(cpd.bookingTotal);
			}
		
			dwldExcelcell10.className	='datatd';
			dwldExcelcell10.align		='right'; 
			i++;
		}
		
		if(lrCreditConfig.showDeliveryChargesColumnInPrint) {
			var dwldExcelcell11 		= rowForDwldExcel.insertCell(i);
			dwldExcelcell11.id			='actWght_'+nextId;
			dwldExcelcell11.name		='actWght_'+nextId;

			if(cpd.txnTypeId == 1)
				dwldExcelcell11.innerHTML	=0;
			else{
				dwldExcelcell11.innerHTML	= cpd.deliveryTotal;
				totalDeliveryTotal	+= parseInt(cpd.deliveryTotal);
			}
			
			dwldExcelcell11.className	='datatd';
			dwldExcelcell11.align		='right'; 
			i++;
		}
		
		var dwldExcelcell12 		= rowForDwldExcel.insertCell(i);
		dwldExcelcell12.id			='actWght_'+nextId;
		dwldExcelcell12.name		='actWght_'+nextId;
		dwldExcelcell12.innerHTML	= cpd.grandTotal;
		dwldExcelcell12.className	='datatd';
		dwldExcelcell12.align		='right'; 
		i++;
		
		if(lrCreditConfig.showRecievedAmountColumnInPrint) {
			var dwldExcelcell13 		= rowForDwldExcel.insertCell(i);
			dwldExcelcell13.id			='actWght_'+nextId;
			dwldExcelcell13.name		='actWght_'+nextId;
			dwldExcelcell13.innerHTML	= 0;
			dwldExcelcell13.className	='datatd';
			dwldExcelcell13.align		='right'; 
			i++;
		}
		
		if(lrCreditConfig.showBalanceColumnInPrint) {
			var dwldExcelcell14 		= rowForDwldExcel.insertCell(i);
			dwldExcelcell14.id			='actWght_'+nextId;
			dwldExcelcell14.name		='actWght_'+nextId;
			dwldExcelcell14.innerHTML	= cpd.grandTotal;
			dwldExcelcell14.className	='datatd';
			dwldExcelcell14.align		='right'; 
			i++;
		}
			if(lrCreditConfig.showInvoiceNumber){
			var dwldExcelcell15 		= rowForDwldExcel.insertCell(i);
			dwldExcelcell15.id			='actWght_'+nextId;
			dwldExcelcell15.name		='actWght_'+nextId;
			dwldExcelcell15.innerHTML	= cpd.invoiceNo;
			dwldExcelcell15.className	='datatd';
			dwldExcelcell15.align		='right';
			} 
			
		if (lrCreditConfig.showBookingAndDeliveryDateInSeparateColumn) {
			var dwldExcelcell16 = rowForDwldExcel.insertCell(i);
			dwldExcelcell16.id = 'actWght_' + nextId;
			dwldExcelcell16.name = 'actWght_' + nextId;
			if (cpd.waybillDeliveryDate) {
				let dlyDateObj = new Date(cpd.waybillDeliveryDate);

				if (!isNaN(dlyDateObj.getTime()))
					dwldExcelcell16.innerHTML = formatDate(dlyDateObj);
				else
					dwldExcelcell16.innerHTML = "--";
			} else
				dwldExcelcell16.innerHTML = "--";

			dwldExcelcell16.className = 'datatd';
			dwldExcelcell16.align = 'right';
			i++;
		}

		if (lrCreditConfig.showDispatchDateColumn) {
			var dwldExcelcell17 = rowForDwldExcel.insertCell(i);
			dwldExcelcell17.id = 'actWght_' + nextId;
			dwldExcelcell17.name = 'actWght_' + nextId;
			if (cpd.wayBillDispatchDateTime) {
				let dispatchDateObj = new Date(cpd.wayBillDispatchDateTime);
				if (!isNaN(dispatchDateObj.getTime()))
					dwldExcelcell17.innerHTML = formatDate(dispatchDateObj);
				else
					dwldExcelcell17.innerHTML = "--";
			} else
				dwldExcelcell17.innerHTML = "--";

			dwldExcelcell17.className = 'datatd';
			dwldExcelcell17.align = 'right';
			i++;
		}

		if (lrCreditConfig.showDeliveredToNameColumn) {
			var dwldExcelcell18 = rowForDwldExcel.insertCell(i);
			dwldExcelcell18.id = 'actWght_' + nextId;
			dwldExcelcell18.name = 'actWght_' + nextId;
			dwldExcelcell18.innerHTML = cpd.deliveredToName ? cpd.deliveredToName : '--';
			dwldExcelcell18.className = 'datatd';
			dwldExcelcell18.align = 'right';
			i++;
		}

			
		calculateDataForSumm(cpd.receivedAmount);
		
		changeView("reportData","block");
	}

	$('#errorMessage').empty();
}

function rowstoAddWithCRNo(cpd) {

    var balAmt = 0;
	var table    = document.getElementById('reportTable');
	document.getElementById('headerRow_0').style.display 		 = 'table-row';
	document.getElementById('upSaveTable').style.display     	 = 'table';
	document.getElementById('downSaveTable').style.display   	 = 'table';
	var rowCount = table.rows.length;
	var curRow   = table.rows[rowCount-1];
	var partyMasterIdAdded	= false;

	curId        = parseInt(getRowNo(curRow));
	var nextId 	 = curId+1;

	if(lrCreditConfig.allowPartialPaymentInMultipleClear)
    	balAmt = cpd.grandTotal - Math.round(cpd.receivedAmount);

	document.getElementById("mainFeildSet").style.display = 'block';
	var row = table.insertRow(rowCount);
	row.id = 'CreditRow_'+nextId;

	var cell1 			= row.insertCell(0);
	var element1 		= document.getElementById('check1').cloneNode(true);
	element1.id			= 'check1_'+nextId;
	element1.value 		= nextId;
	element1.className	= 'checkbox';
	element1.name		= "check1_"+nextId;
	cell1.appendChild(element1);


	if(lrCreditConfig.showLinkOnLrNumber){
		var cell2 			= row.insertCell(1);
		cell2.innerHTML 	= "<a href='#' style='cursor:pointer;' onclick='openWindowForView(" + cpd.wayBillId + " ,1,0);'>"+ cpd.wayBillNumber +"</a>";
		cell2.className 	= 'datatd';
		cell2.align			= 'left';
	}else{
		var cell2 			= row.insertCell(1);
		cell2.innerHTML 	= cpd.wayBillNumber;
		cell2.className 	= 'datatd';
		cell2.align			= 'left';
	}
	
	var cell3 			= row.insertCell(2);
	cell3.innerHTML		= cpd.wayBillDeliveryNumber;
	cell3.className		= 'datatd';
	cell3.align			= 'left';

	var cell4 			= row.insertCell(3);
	cell4.innerHTML		= cpd.creationDateTime;
	cell4.className		= 'datatd';
	cell4.align			= 'left';

	var cell5 			= row.insertCell(4);
	cell5.innerHTML 	= cpd.sourceBranch;
	cell5.className		= 'datatd';
	cell5.align			= 'left';

	var cell6 			= row.insertCell(5);
	cell6.innerHTML 	= cpd.destinationBranch;
	cell6.className		= 'datatd';
	cell6.align			= 'left';

	var cell7 			= row.insertCell(6);
	cell7.innerHTML		= cpd.consignor;
	cell7.className		= 'datatd';
	cell7.align			= 'left';

	var cell8 			= row.insertCell(7);
	cell8.innerHTML		= cpd.consignee;
	cell8.className		= 'datatd';
	cell8.align			= 'left';

	var cell9 			= row.insertCell(8);
	cell9.id			= 'actWght_'+nextId;
	cell9.name			= 'actWght_'+nextId;
	cell9.innerHTML		= cpd.actualWeight;
	cell9.className		= 'datatd';
	cell9.align			= 'right';

	var cell10 			= row.insertCell(9);
	cell10.id			= 'packages_'+nextId;
	cell10.name			= 'packages_'+nextId;
	cell10.innerHTML	= cpd.quantity;
	cell10.className	= 'datatd';
	cell10.align		= 'right';

	if(tdsConfiguration.IsTdsAllow && (tdsConfiguration.IsPANNumberRequired || tdsConfiguration.IsTANNumberRequired)) {
		if(tdsConfiguration.IsPANNumberRequired) {
			var cell11 			= row.insertCell(10);
			var element29 		= document.getElementById('panNumber').cloneNode(true);
			element29.id 		= 'panNumber_'+nextId;
			element29.name 		= 'panNumber_'+nextId;
			cell11.appendChild(element29);
		} else {
			var cell11 			= row.insertCell(10);
			var element29 		= document.getElementById('tanNumber').cloneNode(true);
			element29.id 		= 'tanNumber_'+nextId;
			element29.name 		= 'tanNumber_'+nextId;
			cell11.appendChild(element29);
		}

		var cell12 			= row.insertCell(11);

		var element101 		= document.getElementById('hiddenPaymentMode').cloneNode(true);
		element101.id 		= 'hiddenPaymentMode_' + nextId;
		element101.name 	= 'hiddenPaymentMode_' + nextId;
		element101.type 	= 'hidden';
		cell12.appendChild(element101);

		var element10 		= document.getElementById('paymentMode').cloneNode(true);
		element10.id 		= 'paymentMode_'+nextId;
		element10.name 		= 'paymentMode_'+nextId;
		cell12.appendChild(element10);
		cell12.className	= 'datatd';
		cell12.align		= 'center';

		var cell13 			= row.insertCell(12);
		var element11 		= document.getElementById('remark').cloneNode(true);
		element11.id 		= 'remark_'+nextId;
		element11.name 		= 'remark_'+nextId;
		cell13.appendChild(element11);

		if(!bankPaymentOperationRequired) {
			var element12 		= document.getElementById('chequeNumber').cloneNode(true);
			element12.id 		= 'chequeNumber_'+nextId;
			element12.name 		= 'chequeNumber_'+nextId;
			element12.readOnly 	= true;
			cell13.appendChild(element12);

			var element13 		= document.getElementById('bankName').cloneNode(true);
			element13.id 		= 'bankName_'+nextId;
			element13.name 		= 'bankName_'+nextId;
			element13.readOnly 	= true;
			cell13.appendChild(element13);

			var element14 		= document.getElementById('chequeDate').cloneNode(true);
			element14.id 		= 'chequeDate_'+nextId;
			element14.name 		= 'chequeDate_'+nextId;
			cell13.appendChild(element14);

			setChequeDate('chequeDate_' + nextId);
		}

		var cell14 			= row.insertCell(13);

		var element161 		= document.getElementById('hiddenPaymentStatus').cloneNode(true);
		element161.id 		= 'hiddenPaymentStatus_' + nextId;
		element161.name 	= 'hiddenPaymentStatus_' + nextId;
		element161.type 	= 'hidden';
		cell14.appendChild(element161);

		var element16 		= document.getElementById('paymentStatus').cloneNode(true);
		element16.id 		= 'paymentStatus_'+nextId;
		element16.name 		= 'paymentStatus_'+nextId;
		cell14.appendChild(element16);

		var cell15 			= row.insertCell(14);
		var element17 		= document.getElementById('grandTotal').cloneNode(true);
		element17.id 		= 'grandTotal_'+nextId;
		element17.name 		= 'grandTotal_'+nextId;
		element17.value 	= cpd.grandTotal;
		cell15.appendChild(element17);

		var cell16 			= row.insertCell(15);
		var element27 		= document.getElementById('txnAmount').cloneNode(true);
		element27.id 		= 'txnAmount_'+nextId;
		element27.name 		= 'txnAmount_'+nextId;
		element27.value 	= 0;
		cell16.appendChild(element27);

		var cell17 			= row.insertCell(16);
		var element26 		= document.getElementById('tdsAmt').cloneNode(true);
		element26.id 		= 'tdsAmt_'+nextId;
		element26.name 		= 'tdsAmt_'+nextId;
		element26.value 	= 0;
		
		if(tdsConfiguration.calculateTdsOnTotal && cpd.tdsAmount > 0)
			element26.readOnly 	= true;
		
		cell17.appendChild(element26);

		var element28 		= document.getElementById('tdsAmtLimit').cloneNode(true);
		element28.id 		= 'tdsAmtLimit_'+nextId;
		element28.name 		= 'tdsAmtLimit_'+nextId;
		element28.value 	= 0;
		cell17.appendChild(element28);

		var cell18 			= row.insertCell(17);
		var element18 		= document.getElementById('receiveAmt').cloneNode(true);
		element18.id 		= 'receiveAmt_'+nextId;
		element18.name 		= 'receiveAmt_'+nextId;
		cell18.appendChild(element18);

		var element5 		= document.getElementById('receivedAmtLimit').cloneNode(true);
		element5.id 		= 'receivedAmtLimit_'+nextId;
		element5.name 		= 'receivedAmtLimit_'+nextId;
		
		if(lrCreditConfig.allowPartialPaymentInMultipleClear)
			element5.value 		= cpd.receivedAmount;
		
		cell18.appendChild(element5);

		var element25 		= document.getElementById('creditWayBillTxnId').cloneNode(true);
		element25.id 		= 'creditWayBillTxnId_'+nextId;
		element25.name 		= 'creditWayBillTxnId_'+nextId;
		element25.value 	= cpd.creditWayBillTxnId;
		cell18.appendChild(element25);

		var element34 		= document.getElementById('partyMasterIdNo').cloneNode(true);
		element34.id 		= 'partyMasterIdNo_'+nextId;
		element34.name 		= 'partyMasterIdNo_'+nextId;
		element34.value 	= cpd.partyMasterId;
		cell17.appendChild(element34);
		partyMasterIdAdded	=	true;

		var element6 		= document.getElementById('txnTypeId').cloneNode(true);
		element6.id 		= 'txnTypeId_'+nextId;
		element6.name 		= 'txnTypeId_'+nextId;
		element6.value 		= cpd.txnTypeId;
		cell18.appendChild(element6);

		if(lrCreditConfig.isAllowClaimEntry){

			var cell19 			= row.insertCell(18);
			var element32 		= document.getElementById('claimAmt').cloneNode(true);
			element32.id 		= 'claimAmt_'+nextId;
			element32.name 		= 'claimAmt_'+nextId;
			element32.value 	= 0;
			cell19.appendChild(element32);

			var cell20 			= row.insertCell(19);
			var element19 		= document.getElementById('balanceAmt').cloneNode(true);
			element19.id 		= 'balanceAmt_'+nextId;
			element19.name 		= 'balanceAmt_'+nextId;
			
			if(lrCreditConfig.allowPartialPaymentInMultipleClear)
				element19.value		=  parseInt(balAmt);
			else
				element19.value		=  parseInt(cpd.grandTotal);
			
			cell20.appendChild(element19);

			var element20 		= document.getElementById('billId').cloneNode(true);
			element20.id 		= 'billId_'+nextId;
			element20.name 		= 'billId_'+nextId;
			element20.value		= cpd.wayBillId;
			cell20.appendChild(element20);

			var element21 		= document.getElementById('billNumber').cloneNode(true);
			element21.id 		= 'billNumber_'+nextId;
			element21.name 		= 'billNumber_'+nextId;
			element21.value		= cpd.wayBillNumber;
			cell20.appendChild(element21);

			var element22 		= document.getElementById('branchId').cloneNode(true);
			element22.id 		= 'branchId_'+nextId;
			element22.name 		= 'branchId_'+nextId;
			element22.value		= cpd.branchId;
			cell20.appendChild(element22);

			if(searchByCollectionPersonAllow) {
				var cell21 			= row.insertCell(20);
				cell21.innerHTML	= cpd.collectionPersonName;
				cell21.className	= 'datatd';
				cell21.align		= 'left'; 
			}else{
				var cell21 				= row.insertCell(20);
				cell21.className		='datatd';
				cell21.innerHTML		= '-----';
				cell21.style.display	='none';
			}

			var cell22 				= row.insertCell(21);
			cell22.className		='datatd';
			cell22.innerHTML		= '-----';
			
			if(lrCreditConfig.isDiscountColumnDisplay) {
				var cell23 			= row.insertCell(22);
				var element23 		= document.getElementById('discountTypes').cloneNode(true);
				element23.id 		='discountTypes_'+nextId;
				element23.name 		='discountTypes_'+nextId;
				cell23.className	='datatd';
				cell23.appendChild(element23);
			}
			
		} else{
			var cell19 			= row.insertCell(18);
			var element19 		= document.getElementById('balanceAmt').cloneNode(true);
			element19.id 		= 'balanceAmt_'+nextId;
			element19.name 		= 'balanceAmt_'+nextId;
			
			if(lrCreditConfig.allowPartialPaymentInMultipleClear)
				element19.value		=  parseInt(balAmt);
			else
				element19.value		=  parseInt(cpd.grandTotal);
			
			cell19.appendChild(element19);

			var element20 		= document.getElementById('billId').cloneNode(true);
			element20.id 		= 'billId_'+nextId;
			element20.name 		= 'billId_'+nextId;
			element20.value		= cpd.wayBillId;
			cell19.appendChild(element20);

			var element21 		= document.getElementById('billNumber').cloneNode(true);
			element21.id 		= 'billNumber_'+nextId;
			element21.name 		= 'billNumber_'+nextId;
			element21.value		= cpd.wayBillNumber;
			cell19.appendChild(element21);

			var element22 		= document.getElementById('branchId').cloneNode(true);
			element22.id 		= 'branchId_'+nextId;
			element22.name 		= 'branchId_'+nextId;
			element22.value		= cpd.branchId;
			cell19.appendChild(element22);

			if(searchByCollectionPersonAllow) {
				var cell20 			= row.insertCell(19);
				cell20.innerHTML	= cpd.collectionPersonName;
				cell20.className	= 'datatd';
				cell20.align		= 'left'; 
			}else{

				var cell20 				= row.insertCell(19);
				cell20.className		='datatd';
				cell20.innerHTML		= '-----';
				cell20.style.display	='none';
			}

			var cell21 				= row.insertCell(20);
			cell21.className		='datatd';
			cell21.innerHTML		= '-----';

			if(lrCreditConfig.isDiscountColumnDisplay) {
				var cell22 			= row.insertCell(21);
				var element23 		= document.getElementById('discountTypes').cloneNode(true);
				element23.id 		='discountTypes_'+nextId;
				element23.name 		='discountTypes_'+nextId;
				cell22.className	='datatd';
				cell22.appendChild(element23);
			}
		}
	} else {

		var cell11 			= row.insertCell(10);

		var element101 		= document.getElementById('hiddenPaymentMode').cloneNode(true);
		element101.id 		= 'hiddenPaymentMode_' + nextId;
		element101.name 	= 'hiddenPaymentMode_' + nextId;
		element101.type 	= 'hidden';
		cell11.appendChild(element101);

		var element10 		= document.getElementById('paymentMode').cloneNode(true);
		element10.id 		= 'paymentMode_'+nextId;
		element10.name 		= 'paymentMode_'+nextId;
		cell11.appendChild(element10);
		cell11.className	= 'datatd';
		cell11.align		= 'center';

		var cell12 			= row.insertCell(11);
		var element11 		= document.getElementById('remark').cloneNode(true);
		element11.id 		= 'remark_'+nextId;
		element11.name 		= 'remark_'+nextId;
		cell12.appendChild(element11);

		if(!bankPaymentOperationRequired) {
			var element12 		= document.getElementById('chequeNumber').cloneNode(true);
			element12.id 		= 'chequeNumber_'+nextId;
			element12.name 		= 'chequeNumber_'+nextId;
			element12.readOnly 	= true;
			cell12.appendChild(element12);

			var element13 		= document.getElementById('bankName').cloneNode(true);
			element13.id 		= 'bankName_'+nextId;
			element13.name 		= 'bankName_'+nextId;
			element13.readOnly 	= true;
			cell12.appendChild(element13);

			var element14 		= document.getElementById('chequeDate').cloneNode(true);
			element14.id 		= 'chequeDate_'+nextId;
			element14.name 		= 'chequeDate_'+nextId;
			cell12.appendChild(element14);

			setChequeDate('chequeDate_' + nextId);
		}

		var cell13 			= row.insertCell(12);

		var element161 		= document.getElementById('hiddenPaymentStatus').cloneNode(true);
		element161.id 		= 'hiddenPaymentStatus_' + nextId;
		element161.name 	= 'hiddenPaymentStatus_' + nextId;
		element161.type 	= 'hidden';
		cell13.appendChild(element161);

		var element16 		= document.getElementById('paymentStatus').cloneNode(true);
		element16.id 		= 'paymentStatus_'+nextId;
		element16.name 		= 'paymentStatus_'+nextId;
		cell13.appendChild(element16);

		var cell14 			= row.insertCell(13);
		var element17 		= document.getElementById('grandTotal').cloneNode(true);
		element17.id 		= 'grandTotal_'+nextId;
		element17.name 		= 'grandTotal_'+nextId;
		element17.value 	= cpd.grandTotal;
		cell14.appendChild(element17);
		
		if(tdsConfiguration.IsTdsAllow) {
			
			var cell23 			= row.insertCell(14);
			var element27 		= document.getElementById('txnAmount').cloneNode(true);
			element27.id 		= 'txnAmount_'+nextId;
			element27.name 		= 'txnAmount_'+nextId;
			element27.value 	= 0;
			cell23.appendChild(element27);

			var cell24 			= row.insertCell(15);
			var element26 		= document.getElementById('tdsAmt').cloneNode(true);
			element26.id 		= 'tdsAmt_'+nextId;
			element26.name 		= 'tdsAmt_'+nextId;
			element26.value 	= 0;
			
			if(tdsConfiguration.calculateTdsOnTotal && cpd.tdsAmount > 0)
				element26.readOnly 	= true;
			
			cell24.appendChild(element26);

			var element28 		= document.getElementById('tdsAmtLimit').cloneNode(true);
			element28.id 		= 'tdsAmtLimit_'+nextId;
			element28.name 		= 'tdsAmtLimit_'+nextId;
			element28.value 	= 0;
			cell24.appendChild(element28);

			var cell15 			= row.insertCell(16);
			var element18 		= document.getElementById('receiveAmt').cloneNode(true);
			element18.id 		= 'receiveAmt_'+nextId;
			element18.name 		= 'receiveAmt_'+nextId;
			cell15.appendChild(element18);
			
			var element5 		= document.getElementById('receivedAmtLimit').cloneNode(true);
			element5.id 		= 'receivedAmtLimit_'+nextId;
			element5.name 		= 'receivedAmtLimit_'+nextId;
		
			if(lrCreditConfig.allowPartialPaymentInMultipleClear)
				element5.value 		= cpd.receivedAmount;
			
			cell15.appendChild(element5);

			var element25 		= document.getElementById('creditWayBillTxnId').cloneNode(true);
			element25.id 		= 'creditWayBillTxnId_'+nextId;
			element25.name 		= 'creditWayBillTxnId_'+nextId;
			element25.value 	= cpd.creditWayBillTxnId;
			cell15.appendChild(element25);

			var element6 		= document.getElementById('txnTypeId').cloneNode(true);
			element6.id 		= 'txnTypeId_'+nextId;
			element6.name 		= 'txnTypeId_'+nextId;
			element6.value 		= cpd.txnTypeId;
			cell15.appendChild(element6);
			
			if(lrCreditConfig.isAllowClaimEntry){
				var cell16 			= row.insertCell(17);
				var element33 		= document.getElementById('claimAmt').cloneNode(true);
				element33.id 		= 'claimAmt_'+nextId;
				element33.name 		= 'claimAmt_'+nextId;
				element33.value 	= 0;
				cell16.appendChild(element33);
				
				var cell17 			= row.insertCell(18);
				var element19 		= document.getElementById('balanceAmt').cloneNode(true);
				element19.id 		= 'balanceAmt_'+nextId;
				element19.name 		= 'balanceAmt_'+nextId;
				
				if(lrCreditConfig.allowPartialPaymentInMultipleClear)
					element19.value		=  parseInt(balAmt);
				else
					element19.value		=  parseInt(cpd.grandTotal);
				
				cell17.appendChild(element19);

				var element20 		= document.getElementById('billId').cloneNode(true);
				element20.id 		= 'billId_'+nextId;
				element20.name 		= 'billId_'+nextId;
				element20.value		= cpd.wayBillId;
				cell17.appendChild(element20);

				var element21 		= document.getElementById('billNumber').cloneNode(true);
				element21.id 		= 'billNumber_'+nextId;
				element21.name 		= 'billNumber_'+nextId;
				element21.value		= cpd.wayBillNumber;
				cell17.appendChild(element21);

				var element22 		= document.getElementById('branchId').cloneNode(true);
				element22.id 		= 'branchId_'+nextId;
				element22.name 		= 'branchId_'+nextId;
				element22.value		= cpd.branchId;
				cell17.appendChild(element22);

				if(searchByCollectionPersonAllow) {
					var cell18 			= row.insertCell(19);
					cell18.innerHTML	= cpd.collectionPersonName;
					cell18.className	= 'datatd';
					cell18.align		= 'left'; 
				}else{
					var cell18 				= row.insertCell(19);
					cell18.className		='datatd';
					cell18.innerHTML		= '-----';
					cell18.style.display	='none';
				}

				if(lrCreditConfig.isViewColumnDisplay) {
					var cell19 				= row.insertCell(20);
					cell19.className		='datatd';
					cell19.innerHTML		= '-----';
				}

				var element23 		= document.getElementById('discountTypes').cloneNode(true);
				element23.id 		='discountTypes_'+nextId;
				element23.name 		='discountTypes_'+nextId;

				if(!lrCreditConfig.isViewColumnDisplay && lrCreditConfig.isDiscountColumnDisplay) {
					var cell20 			= row.insertCell(20);
					cell20.className	='datatd';
					cell20.appendChild(element23);
				} else if(lrCreditConfig.isViewColumnDisplay && lrCreditConfig.isDiscountColumnDisplay) {
					var cell20 			= row.insertCell(21);
					cell20.className	='datatd';
					cell20.appendChild(element23);
				}
				
			} else{
				var cell16 			= row.insertCell(17);
				var element19 		= document.getElementById('balanceAmt').cloneNode(true);
				element19.id 		= 'balanceAmt_'+nextId;
				element19.name 		= 'balanceAmt_'+nextId;
			
				if(lrCreditConfig.allowPartialPaymentInMultipleClear)
					element19.value		=  parseInt(balAmt);
				else
					element19.value		=  parseInt(cpd.grandTotal);
				
				cell16.appendChild(element19);

				var element20 		= document.getElementById('billId').cloneNode(true);
				element20.id 		= 'billId_'+nextId;
				element20.name 		= 'billId_'+nextId;
				element20.value		= cpd.wayBillId;
				cell16.appendChild(element20);

				var element21 		= document.getElementById('billNumber').cloneNode(true);
				element21.id 		= 'billNumber_'+nextId;
				element21.name 		= 'billNumber_'+nextId;
				element21.value		= cpd.wayBillNumber;
				cell16.appendChild(element21);

				var element22 		= document.getElementById('branchId').cloneNode(true);
				element22.id 		= 'branchId_'+nextId;
				element22.name 		= 'branchId_'+nextId;
				element22.value		= cpd.branchId;
				cell16.appendChild(element22);

				if(searchByCollectionPersonAllow) {
					var cell17 			= row.insertCell(18);
					cell17.innerHTML	= cpd.collectionPersonName;
					cell17.className	= 'datatd';
					cell17.align		= 'left'; 
				}else{
					var cell17 				= row.insertCell(18);
					cell17.className		='datatd';
					cell17.innerHTML		= '-----';
					cell17.style.display	='none';
				}

				if(lrCreditConfig.isViewColumnDisplay) {
					var cell18 				= row.insertCell(19);
					cell18.className		='datatd';
					cell18.innerHTML		= '-----';
				}

				var element23 		= document.getElementById('discountTypes').cloneNode(true);
				element23.id 		='discountTypes_'+nextId;
				element23.name 		='discountTypes_'+nextId;

				if(!lrCreditConfig.isViewColumnDisplay && lrCreditConfig.isDiscountColumnDisplay) {
					var cell18 			= row.insertCell(19);
					cell18.className	='datatd';
					cell18.appendChild(element23);
				} else if(lrCreditConfig.isViewColumnDisplay && lrCreditConfig.isDiscountColumnDisplay) {
					var cell19 			= row.insertCell(20);
					cell19.className	='datatd';
					cell19.appendChild(element23);
				}
			}
			
		} else {
			
			var cell15 			= row.insertCell(14);
			var element18 		= document.getElementById('receiveAmt').cloneNode(true);
			element18.id 		= 'receiveAmt_'+nextId;
			element18.name 		= 'receiveAmt_'+nextId;
			cell15.appendChild(element18);

			var element5 		= document.getElementById('receivedAmtLimit').cloneNode(true);
			element5.id 		= 'receivedAmtLimit_'+nextId;
			element5.name 		= 'receivedAmtLimit_'+nextId;
			
			if(lrCreditConfig.allowPartialPaymentInMultipleClear)
				element5.value 		=  cpd.receivedAmount;
			
			cell15.appendChild(element5);

			var element25 		= document.getElementById('creditWayBillTxnId').cloneNode(true);
			element25.id 		= 'creditWayBillTxnId_'+nextId;
			element25.name 		= 'creditWayBillTxnId_'+nextId;
			element25.value 	= cpd.creditWayBillTxnId;
			cell15.appendChild(element25);

			var element6 		= document.getElementById('txnTypeId').cloneNode(true);
			element6.id 		= 'txnTypeId_'+nextId;
			element6.name 		= 'txnTypeId_'+nextId;
			element6.value 		= cpd.txnTypeId;
			cell15.appendChild(element6);
			
			if(lrCreditConfig.isAllowClaimEntry){
				var cell16 			= row.insertCell(15);
				var element33 		= document.getElementById('claimAmt').cloneNode(true);
				element33.id 		= 'claimAmt_'+nextId;
				element33.name 		= 'claimAmt_'+nextId;
				element33.value 	= 0;
				cell16.appendChild(element33);
				
				var cell17 			= row.insertCell(16);
				var element19 		= document.getElementById('balanceAmt').cloneNode(true);
				element19.id 		= 'balanceAmt_'+nextId;
				element19.name 		= 'balanceAmt_'+nextId;
			
				if(lrCreditConfig.allowPartialPaymentInMultipleClear)
					element19.value		=  parseInt(balAmt);
				else
					element19.value		=  parseInt(cpd.grandTotal);
				
				cell17.appendChild(element19);

				var element20 		= document.getElementById('billId').cloneNode(true);
				element20.id 		= 'billId_'+nextId;
				element20.name 		= 'billId_'+nextId;
				element20.value		= cpd.wayBillId;
				cell17.appendChild(element20);

				var element21 		= document.getElementById('billNumber').cloneNode(true);
				element21.id 		= 'billNumber_'+nextId;
				element21.name 		= 'billNumber_'+nextId;
				element21.value		= cpd.wayBillNumber;
				cell17.appendChild(element21);

				var element22 		= document.getElementById('branchId').cloneNode(true);
				element22.id 		= 'branchId_'+nextId;
				element22.name 		= 'branchId_'+nextId;
				element22.value		= cpd.branchId;
				cell17.appendChild(element22);

				if(searchByCollectionPersonAllow) {
					var cell18 			= row.insertCell(17);
					cell18.innerHTML	= cpd.collectionPersonName;
					cell18.className	= 'datatd';
					cell18.align		= 'left'; 
				}else{
					var cell18 				= row.insertCell(17);
					cell18.className		='datatd';
					cell18.innerHTML		= '-----';
					cell18.style.display	='none';
				}

				if(lrCreditConfig.isViewColumnDisplay) {
					var cell19 				= row.insertCell(18);
					cell19.className		='datatd';
					cell19.innerHTML		= '-----';
				}

				var element23 		= document.getElementById('discountTypes').cloneNode(true);
				element23.id 		='discountTypes_'+nextId;
				element23.name 		='discountTypes_'+nextId;

				if(!lrCreditConfig.isViewColumnDisplay && lrCreditConfig.isDiscountColumnDisplay) {
					var cell20 			= row.insertCell(19);
					cell20.className	='datatd';
					cell20.appendChild(element23);
				} else if(lrCreditConfig.isViewColumnDisplay && lrCreditConfig.isDiscountColumnDisplay) {
					var cell20 			= row.insertCell(19);
					cell20.className	='datatd';
					cell20.appendChild(element23);
				}
				
			} else{
				var cell16 			= row.insertCell(15);
				var element19 		= document.getElementById('balanceAmt').cloneNode(true);
				element19.id 		= 'balanceAmt_'+nextId;
				element19.name 		= 'balanceAmt_'+nextId;
				
				if(lrCreditConfig.allowPartialPaymentInMultipleClear)
					element19.value		=  parseInt(balAmt);
				else
					element19.value		=  parseInt(cpd.grandTotal);
				
				cell16.appendChild(element19);

				var element20 		= document.getElementById('billId').cloneNode(true);
				element20.id 		= 'billId_'+nextId;
				element20.name 		= 'billId_'+nextId;
				element20.value		= cpd.wayBillId;
				cell16.appendChild(element20);

				var element21 		= document.getElementById('billNumber').cloneNode(true);
				element21.id 		= 'billNumber_'+nextId;
				element21.name 		= 'billNumber_'+nextId;
				element21.value		= cpd.wayBillNumber;
				cell16.appendChild(element21);

				var element22 		= document.getElementById('branchId').cloneNode(true);
				element22.id 		= 'branchId_'+nextId;
				element22.name 		= 'branchId_'+nextId;
				element22.value		= cpd.branchId;
				cell16.appendChild(element22);

				if(searchByCollectionPersonAllow) {
					var cell17 			= row.insertCell(16);
					cell17.innerHTML	= cpd.collectionPersonName;
					cell17.className	= 'datatd';
					cell17.align		= 'left'; 
				}else{
					var cell17 				= row.insertCell(16);
					cell17.className		='datatd';
					cell17.innerHTML		= '-----';
					cell17.style.display	='none';
				}

				if(lrCreditConfig.isViewColumnDisplay) {
					var cell18 				= row.insertCell(17);
					cell18.className		='datatd';
					cell18.innerHTML		= '-----';
				}

				var element23 		= document.getElementById('discountTypes').cloneNode(true);
				element23.id 		='discountTypes_'+nextId;
				element23.name 		='discountTypes_'+nextId;

				if(!lrCreditConfig.isViewColumnDisplay && lrCreditConfig.isDiscountColumnDisplay) {
					var cell18 			= row.insertCell(17);
					cell18.className	='datatd';
					cell18.appendChild(element23);
				} else if(lrCreditConfig.isViewColumnDisplay && lrCreditConfig.isDiscountColumnDisplay) {
					var cell19 			= row.insertCell(18);
					cell19.className	='datatd';
					cell19.appendChild(element23);
				}
			}
		}
	}
	
	if(lrCreditConfig.showChargeWeightInActualWeightColumnForPrint){
		var cell24				= row.insertCell(23);
		cell24.id				= 'charWght_'+nextId;
		cell24.name				= 'charWght_'+nextId;
		cell24.innerHTML		= cpd.chargeWeight;
		cell24.className		= 'datatd';
		cell24.align			= 'right';
		cell24.style.display	='none';
	}
	
	if(!partyMasterIdAdded) {
		var element34 		= document.getElementById('partyMasterIdNo').cloneNode(true);
		element34.id 		= 'partyMasterIdNo_'+nextId;
		element34.name 		= 'partyMasterIdNo_'+nextId;
		element34.value 	= cpd.partyMasterId;
		cell17.appendChild(element34);
	}
	
	if(lrCreditConfig.showInvoiceNumber){
		var cell25 			= row.insertCell(row.cells.length);
		cell25.innerHTML	= cpd.invoiceNo;
		cell25.className	= 'datatd';
		cell25.align		= 'right';
	}
	if (lrCreditConfig.showStatementNumber) {
		var element23 		= document.getElementById('statementNo').cloneNode(true);

		element23.id = 'statementNo_' + nextId;
		element23.name = 'statementNo_' + nextId;
						
		var statementCell = row.insertCell(row.cells.length);
		statementCell.className = 'datatd';
		statementCell.align = 'center';

		statementCell.appendChild(element23);
	}
	
	//validateTxnAmountForMultipleClear();
	
	var tableForDwldExcel    = document.getElementById('reportTable2');
	var rowCountForDwldExcel = tableForDwldExcel.rows.length;

	var rowForDwldExcel = tableForDwldExcel.insertRow(rowCountForDwldExcel);
	rowForDwldExcel.id = 'CreditClearanceRow_'+nextId;

	var i =0
	var dwldExcelcell1 			= rowForDwldExcel.insertCell(i);
	dwldExcelcell1.id			='actWght_'+nextId;
	dwldExcelcell1.name			='actWght_'+nextId;
	dwldExcelcell1.innerHTML	=nextId;
	dwldExcelcell1.className	='datatd';
	dwldExcelcell1.align		='right'; 
	i++;
	var dwldExcelcell2 			= rowForDwldExcel.insertCell(i);
	dwldExcelcell2.id			='actWght_'+nextId;
	dwldExcelcell2.name			='actWght_'+nextId;
	dwldExcelcell2.innerHTML	= cpd.wayBillNumber;
	dwldExcelcell2.className	='datatd';
	dwldExcelcell2.align		='right'; 
	i++;
	
	if(lrCreditConfig.showBookingDateColumnInPrint){
		var dwldExcelcell3 			= rowForDwldExcel.insertCell(i);
		dwldExcelcell3.id			='actWght_'+nextId;
		dwldExcelcell3.name			='actWght_'+nextId;
		dwldExcelcell3.innerHTML	= cpd.creationDateTime;
		dwldExcelcell3.className	='datatd';
		dwldExcelcell3.align		='right'; 
		i++;
	}
	
	if(lrCreditConfig.showSourceBranchColumnInPrint){
		var dwldExcelcell4			= rowForDwldExcel.insertCell(i);
		dwldExcelcell4.id			='actWght_'+nextId;
		dwldExcelcell4.name			='actWght_'+nextId;
		dwldExcelcell4.innerHTML	= cpd.sourceBranch;
		dwldExcelcell4.className	='datatd';
		dwldExcelcell4.align		='left'; 
		i++;
	}
	
	if(lrCreditConfig.showDestinationBranchColumnInPrint){
		var dwldExcelcell5 			= rowForDwldExcel.insertCell(i);
		dwldExcelcell5.id			='actWght_'+nextId;
		dwldExcelcell5.name			='actWght_'+nextId;
		dwldExcelcell5.innerHTML	= cpd.destinationBranch;
		dwldExcelcell5.className	='datatd';
		dwldExcelcell5.align		='right'; 
		i++;
	}

	if (!lrCreditConfig.hideConsignorColumnInPrint) {
		var dwldExcelcell6 = rowForDwldExcel.insertCell(i);
		dwldExcelcell6.id = 'actWght_' + nextId;
		dwldExcelcell6.name = 'actWght_' + nextId;
		dwldExcelcell6.innerHTML = cpd.consignor;
		dwldExcelcell6.className = 'datatd';
		dwldExcelcell6.align = 'right';
		i++;
	}
	var dwldExcelcell7 			= rowForDwldExcel.insertCell(i);
	dwldExcelcell7.id			='actWght_'+nextId;
	dwldExcelcell7.name			='actWght_'+nextId;
	dwldExcelcell7.innerHTML	= cpd.consignee;
	dwldExcelcell7.className	='datatd';
	dwldExcelcell7.align		='right'; 
	i++;

	if (!lrCreditConfig.hideWeightColumnInPrint) {
		if (lrCreditConfig.showChargeWeightInActualWeightColumnForPrint) {
			var dwldExcelcell8 = rowForDwldExcel.insertCell(i);
			dwldExcelcell8.id = 'actWght_' + nextId;
			dwldExcelcell8.name = 'actWght_' + nextId;
			dwldExcelcell8.innerHTML = cpd.chargeWeight;
			dwldExcelcell8.className = 'datatd';
			dwldExcelcell8.align = 'right';
			i++;
		} else {
			var dwldExcelcell8 = rowForDwldExcel.insertCell(i);
			dwldExcelcell8.id = 'actWght_' + nextId;
			dwldExcelcell8.name = 'actWght_' + nextId;
			dwldExcelcell8.innerHTML = cpd.actualWeight;
			dwldExcelcell8.className = 'datatd';
			dwldExcelcell8.align = 'right';
			i++;
		}
	}

	var dwldExcelcell9 			= rowForDwldExcel.insertCell(i);
	dwldExcelcell9.id			='actWght_'+nextId;
	dwldExcelcell9.name			='actWght_'+nextId;
	dwldExcelcell9.innerHTML	= cpd.quantity;
	dwldExcelcell9.className	='datatd';
	dwldExcelcell9.align		='right'; 
	i++;

	if(lrCreditConfig.showBookingTotalColumnInPrint) {
		var dwldExcelcell10 		= rowForDwldExcel.insertCell(i);
		dwldExcelcell10.id			='actWght_'+nextId;
		dwldExcelcell10.name		='actWght_'+nextId;
		
		if((cpd.wayBillTypeId == WAYBILL_TYPE_PAID && cpd.txnTypeId == 2) || cpd.wayBillTypeId == WAYBILL_TYPE_CREDIT)
			dwldExcelcell10.innerHTML	= "";	
		else
			dwldExcelcell10.innerHTML	= cpd.bookingTotal;
		
		dwldExcelcell10.className	='datatd';
		dwldExcelcell10.align		='right'; 
		i++;
	}

	if(lrCreditConfig.showDeliveryChargesColumnInPrint){
		var dwldExcelcell11 		= rowForDwldExcel.insertCell(i);
		dwldExcelcell11.id			='actWght_'+nextId;
		dwldExcelcell11.name		='actWght_'+nextId;
		
		if(cpd.txnTypeId == 1)
			dwldExcelcell11.innerHTML	=0;
		else
			dwldExcelcell11.innerHTML	= cpd.deliveryTotal;
		
		dwldExcelcell11.className	='datatd';
		dwldExcelcell11.align		='right'; 
		i++;
	}

	var dwldExcelcell12 		= rowForDwldExcel.insertCell(i);
	dwldExcelcell12.id			='actWght_'+nextId;
	dwldExcelcell12.name		='actWght_'+nextId;
	dwldExcelcell12.innerHTML	= cpd.grandTotal;
	dwldExcelcell12.className	='datatd';
	dwldExcelcell12.align		='right'; 
	
	i++;
	
	if(lrCreditConfig.showRecievedAmountColumnInPrint) {
		var dwldExcelcell13 		= rowForDwldExcel.insertCell(i);
		dwldExcelcell13.id			='actWght_'+nextId;
		dwldExcelcell13.name		='actWght_'+nextId;
		dwldExcelcell13.innerHTML	= 0;
		dwldExcelcell13.className	='datatd';
		dwldExcelcell13.align		='right'; 
		i++;
	}
	
	if(lrCreditConfig.showBalanceColumnInPrint) {
		var dwldExcelcell14 		= rowForDwldExcel.insertCell(i);
		dwldExcelcell14.id			='actWght_'+nextId;
		dwldExcelcell14.name		='actWght_'+nextId;
		dwldExcelcell14.innerHTML	= cpd.grandTotal;
		dwldExcelcell14.className	='datatd';
		dwldExcelcell14.align		='right'; 
		i++;
	}
	
	if(lrCreditConfig.showDeliveryRemarkColumnInPrint){
		var dwldExcelcell15 		= rowForDwldExcel.insertCell(i);
		dwldExcelcell15.id			='actWght_'+nextId;
		dwldExcelcell15.name		='actWght_'+nextId;
		
		if(cpd.txnTypeId == 1)
			dwldExcelcell15.innerHTML	=' ';
		else
			dwldExcelcell15.innerHTML	=cpd.deliveryRemark;
			
		dwldExcelcell15.className	='datatd';
		dwldExcelcell15.align		='right'; 
		i++;
	}
	if(lrCreditConfig.showInvoiceNumber){
		var dwldExcelcell15 		= rowForDwldExcel.insertCell(i);
		dwldExcelcell15.id			='actWght_'+nextId;
		dwldExcelcell15.name		='actWght_'+nextId;
		dwldExcelcell15.innerHTML	= cpd.invoiceNo;
		dwldExcelcell15.className	='datatd';
		dwldExcelcell15.align		='right'; 
		i++;
	}
	if (lrCreditConfig.showBookingAndDeliveryDateInSeparateColumn) {
			var dwldExcelcell16 = rowForDwldExcel.insertCell(i);
			dwldExcelcell16.id = 'actWght_' + nextId;
			dwldExcelcell16.name = 'actWght_' + nextId;
			if (cpd.waybillDeliveryDate) {
				let dlyDateObj = new Date(cpd.waybillDeliveryDate);

				if (!isNaN(dlyDateObj.getTime()))
					dwldExcelcell16.innerHTML = formatDate(dlyDateObj);
				else
					dwldExcelcell16.innerHTML = "--";
			} else
				dwldExcelcell16.innerHTML = "--";

			dwldExcelcell16.className = 'datatd';
			dwldExcelcell16.align = 'right';
					i++;
		}

		if (lrCreditConfig.showDispatchDateColumn) {
			var dwldExcelcell17 = rowForDwldExcel.insertCell(i);
			dwldExcelcell17.id = 'actWght_' + nextId;
			dwldExcelcell17.name = 'actWght_' + nextId;
			if (cpd.wayBillDispatchDateTime) {
				let dispatchDateObj = new Date(cpd.wayBillDispatchDateTime);
				if (!isNaN(dispatchDateObj.getTime()))
					dwldExcelcell17.innerHTML = formatDate(dispatchDateObj);
				else
					dwldExcelcell17.innerHTML = "--";
			} else
				dwldExcelcell17.innerHTML = "--";

			dwldExcelcell17.className = 'datatd';
			dwldExcelcell17.align = 'right';
					i++;
		}

		if (lrCreditConfig.showDeliveredToNameColumn) {
			var dwldExcelcell18 = rowForDwldExcel.insertCell(i);
			dwldExcelcell18.id = 'actWght_' + nextId;
			dwldExcelcell18.name = 'actWght_' + nextId;
			dwldExcelcell18.innerHTML = cpd.deliveredToName ? cpd.deliveredToName : '--';
			dwldExcelcell18.className = 'datatd';
			dwldExcelcell18.align = 'right';
					i++;
		}
	
	calculateDataForSumm(cpd.receivedAmount);
	
	changeView("reportData","block");
}


function getRowNo(element){
	return element.id.split("_")[1];
}

function calculateDataForSumm(receivedAmt){
	var tableEl 		= document.getElementById("reportTable");
	var flagToShow 		= false;
	var totalLrs 		= 0;
	var totalAmount 	= 0;
	var totalPkgs 		= 0;
	var totalActWght 	= 0;
	var totalCharWght 	= 0;
	var balAmt          = 0;
	var grandTotalNew		= 0;
	
	for (var i = 1; i <= tableEl.rows.length -1; i++){
		if(tableEl.rows[i].cells[0].getElementsByTagName("input")[0] != null){
			var wayBillId 	= tableEl.rows[i].cells[0].getElementsByTagName("input")[0].value;
			totalLrs 		+= 1;
			
			if(lrCreditConfig.allowPartialPaymentInMultipleClear)
				balAmt          += parseInt($('#balanceAmt_' + wayBillId).val());
			else
				totalAmount 	+= parseInt($('#grandTotal_' + wayBillId).val());
				
			grandTotalNew += parseInt($('#grandTotal_' + wayBillId).val());
			
			totalPkgs 		+= parseInt($('#packages_' + wayBillId).html());
			totalActWght 	+= parseInt($('#actWght_' + wayBillId).html());
			totalCharWght 	+= parseInt($('#charWght_' + wayBillId).html()); ;

			flagToShow 		= true;	
		};
	}
	
	if(lrCreditConfig.allowPartialPaymentInMultipleClear)
		totalAmount 	+= parseInt(balAmt);
	
	if(flagToShow){
		var nextId  ='CreditClearanceTable'+"-"+document.getElementById('typeOfSelection').value;
		
		if(document.getElementById('CreditClearanceRow_'+nextId) == null){
			var table    = document.getElementById('summDataTable');
			document.getElementById('summDataTable').style.display 	 = 'table';
			document.getElementById('summDataTableHeaderRow').style.display	 = 'table-row';
			var rowCount = table.rows.length;

			var row = table.insertRow(rowCount);
			row.id = 'CreditClearanceRow_'+nextId;
			
			if(lrCreditConfig.showChargeWeightInActualWeightColumnForPrint) {
				var cell1 			= row.insertCell(0);
				cell1.id			= 'actWght_'+nextId;
				cell1.name			= 'actWght_'+nextId;
				cell1.innerHTML		= totalCharWght;
				cell1.className		= 'datatd';
				cell1.align			= 'right';
			} else {
				var cell1 			= row.insertCell(0);
				cell1.id			= 'actWght_'+nextId;
				cell1.name			= 'actWght_'+nextId;
				cell1.innerHTML		= totalActWght;
				cell1.className		= 'datatd';
				cell1.align			= 'right';
			}

			var cell2 			= row.insertCell(1);
			cell2.id			= 'packages_'+nextId;
			cell2.name			= 'packages_'+nextId;
			cell2.innerHTML		= totalPkgs;
			cell2.className		= 'datatd';
			cell2.align			= 'right';

			if(!bankPaymentOperationRequired) {
				var cell3			= row.insertCell(2);
				var element1 		= document.getElementById('paymentMode').cloneNode(true);
				element1.id 		= 'paymentMode_'+nextId;
				element1.onchange 	= function (){setAllPaymentMode(this,'reportTable');};
				element1.name 		= 'paymentMode_'+nextId;
				cell3.appendChild(element1);
				cell3.className		= 'datatd';
				cell3.align			= 'center';

				var cell4 			= row.insertCell(3);
				var element2 		= document.getElementById('remark').cloneNode(true);
				element2.id 		= 'remark_'+nextId;
				element2.name 		= 'remark_'+nextId;
				cell4.appendChild(element2);
				
				var element3 		= document.getElementById('chequeNumber').cloneNode(true);
				element3.id 		= 'chequeNumber_'+nextId;
				element3.name 		= 'chequeNumber_'+nextId;
				element3.onkeyup 	= function (){setChequeNumber('reportTable');};
				cell4.appendChild(element3);

				var element4 		= document.getElementById('bankName').cloneNode(true);
				element4.id 		= 'bankName_'+nextId;
				element4.name 		= 'bankName_'+nextId;
				element4.onkeyup 	= function (){setBankName('reportTable');};
				cell4.appendChild(element4);

				var element5 		= document.getElementById('chequeDate').cloneNode(true);
				element5.id   		= 'chequeDate_'+nextId;
				element5.name 		= 'chequeDate_'+nextId;
				cell4.appendChild(element5);
				
				setChequeDate('chequeDate_' + nextId);
				
				var cell5 			= row.insertCell(4);
				var element7 		= document.getElementById('paymentStatus').cloneNode(true);
				element7.onchange 	= function (){setAllPaymentStatus(this,'reportTable');};
				element7.id 		= 'paymentStatus_'+nextId;
				element7.name 		= 'paymentStatus_'+nextId;
				cell5.appendChild(element7);
				
				$('#paymentReceivedAs').html('<b>Payment Mode</b>');
				$('#paymentModeLabel').html('<b>Payment Rcvd As</b>');
			} else {
				var cell3			= row.insertCell(2);
				
				var element161 		= document.getElementById('hiddenPaymentStatus').cloneNode(true);
				element161.id 		= 'hiddenPaymentStatus_' + nextId;
				element161.name 	= 'hiddenPaymentStatus_' + nextId;
				element161.type 	= 'hidden';
				cell3.appendChild(element161);
				
				var element1 		= document.getElementById('paymentStatus').cloneNode(true);
				element1.id 		= 'paymentStatus_' + nextId;
				element1.onchange 	= function (){setAllPaymentStatus(this,'reportTable');};
				element1.name 		= 'paymentStatus_' + nextId;
				cell3.appendChild(element1);
				cell3.className		= 'datatd';
				cell3.align			= 'center';

				var cell4 			= row.insertCell(3);
				var element2 		= document.getElementById('remark').cloneNode(true);
				element2.id 		= 'remark_'+nextId;
				element2.name 		= 'remark_'+nextId;
				cell4.appendChild(element2);
				
				var cell5 			= row.insertCell(4);
				var element7 		= document.getElementById('paymentMode').cloneNode(true);
				element7.onchange 	= function (){setAllPaymentMode(this,'reportTable');};
				element7.id 		= 'paymentMode_'+nextId;
				element7.name 		= 'paymentMode_'+nextId;
				cell5.appendChild(element7);
			}

			var cell6 			= row.insertCell(5);
			var element8 		= document.getElementById('grandTotal').cloneNode(true);
			element8.id 		='grandTotal_'+nextId;
			element8.name 		='grandTotal_'+nextId;
			element8.value 		= grandTotalNew;
			cell6.appendChild(element8);

			if(tdsConfiguration.IsTdsAllow) {
				var cell7 			= row.insertCell(6);
				var element13 		= document.getElementById('txnAmount').cloneNode(true);
				element13.id 		='txnAmount_'+nextId;
				element13.onkeyup 	= function (){setAllTxnAmount(this,'reportTable');};
				element13.name 		='txnAmount_'+nextId;
				element13.readOnly 	= true;
				cell7.appendChild(element13);

				var cell8 			= row.insertCell(7);
				var element14 		= document.getElementById('tdsAmt').cloneNode(true);
				element14.id 		='tdsAmt_'+nextId;
				element14.name 		='tdsAmt_'+nextId;
				element14.readOnly 	= true;
				element14.value		= 0;
				cell8.appendChild(element14);

				var element12 		= document.getElementById('tdsAmtLimit').cloneNode(true);
				element12.id 		='tdsAmtLimit_'+nextId;
				element12.name 		='tdsAmtLimit_'+nextId;
				element12.value	 	= 0;
				cell8.appendChild(element12);

				var cell9 			= row.insertCell(8);
				var element9 		= document.getElementById('receiveAmt').cloneNode(true);
				element9.id 		='receiveAmt_'+nextId;
				element9.name 		='receiveAmt_'+nextId;
				element9.readOnly  = 'true';
				cell9.appendChild(element9);

				var element10 		= document.getElementById('receivedAmtLimit').cloneNode(true);
				element10.id 		='receivedAmtLimit_'+nextId;
				element10.name 		='receivedAmtLimit_'+nextId;
				cell9.appendChild(element10);

				var cell10 			= row.insertCell(9);
				var element11 		= document.getElementById('balanceAmt').cloneNode(true);
				element11.id 		='balanceAmt_'+nextId;
				element11.name 		='balanceAmt_'+nextId;
				element11.value		= totalAmount;
				cell10.appendChild(element11);

				if(lrCreditConfig.showCentralizeDiscountType) {
					var cell11 			= row.insertCell(10);
					var element15 		= document.getElementById('discountTypes').cloneNode(true);
					element15.id 		='discountTypes_'+nextId;
					element15.onchange 	= function (){setAllDiscountTypes(this,'reportTable');};
					element15.name 		='discountTypes_'+nextId;
					element15.readOnly 	= true;
					cell11.appendChild(element15);
				}
				
			} else {
				var cell7 		= row.insertCell(6);
				var element9 	= document.getElementById('receiveAmt').cloneNode(true);
				element9.id 	= 'receiveAmt_'+nextId;
				element9.name 	= 'receiveAmt_'+nextId;
				element9.readOnly = 'true';
				cell7.appendChild(element9);

				var element10 	= document.getElementById('receivedAmtLimit').cloneNode(true);
				element10.id 	= 'receivedAmtLimit_'+nextId;
				element10.name 	= 'receivedAmtLimit_'+nextId;
				cell7.appendChild(element10);

				var cell8 		= row.insertCell(7);
				var element11 	= document.getElementById('balanceAmt').cloneNode(true);
				element11.id 	= 'balanceAmt_'+nextId;
				element11.name 	= 'balanceAmt_'+nextId;
				element11.value = totalAmount;
				cell8.appendChild(element11);	    	
			}

			calTotalForDwldExcel();
		} else {
			$('#grandTotal_' + nextId).val(grandTotalNew);
			$('#balanceAmt_' + nextId).val(totalAmount);
			$('#packages_' + nextId).html(totalPkgs);
			$('#receivedAmtLimit_CreditClearanceTable-1').val(receivedAmt)
			
			if(lrCreditConfig.showChargeWeightInActualWeightColumnForPrint)
				$('#actWght_' + nextId).html(totalCharWght);
			else
				$('#actWght_' + nextId).html(totalActWght);

			calTotalForDwldExcel();
		}
	}
}

function calTotalForDwldExcel(){
	if(document.getElementById("totalForDwnloadExcel") == null){
		var nextId = 1;
		var tableForDwldExcel    = document.getElementById('reportTable2');
		var rowCountForDwldExcel = tableForDwldExcel.rows.length;
		var i=0;
		var rowForDwldExcel = tableForDwldExcel.insertRow(rowCountForDwldExcel);

		rowForDwldExcel.id = 'totalForDwnloadExcel';

		var dwldExcelcell1 			= rowForDwldExcel.insertCell(i);
		dwldExcelcell1.id			='actWght_'+nextId;
		dwldExcelcell1.name			='actWght_'+nextId;
		dwldExcelcell1.innerHTML	="";
		dwldExcelcell1.className	='datatd';
		dwldExcelcell1.align		='right'; 
		i++;
		var dwldExcelcell2 			= rowForDwldExcel.insertCell(i);
		dwldExcelcell2.id			='actWght_'+nextId;
		dwldExcelcell2.name			='actWght_'+nextId;
		dwldExcelcell2.innerHTML	="";
		dwldExcelcell2.className	='datatd';
		dwldExcelcell2.align		='right'; 

		i++;

		if(lrCreditConfig.showBookingDateColumnInPrint){
			var dwldExcelcell3 			= rowForDwldExcel.insertCell(i);
			dwldExcelcell3.id			='actWght_'+nextId;
			dwldExcelcell3.name			='actWght_'+nextId;
			dwldExcelcell3.innerHTML	="";
			dwldExcelcell3.className	='datatd';
			dwldExcelcell3.align		='right'; 
			i++;
		}
		
		if(lrCreditConfig.showSourceBranchColumnInPrint){
			var dwldExcelcell4 			= rowForDwldExcel.insertCell(i);
			dwldExcelcell4.id			='actWght_'+nextId;
			dwldExcelcell4.name			='actWght_'+nextId;
			dwldExcelcell4.innerHTML	="";
			dwldExcelcell4.className	='datatd';
			dwldExcelcell4.align		='right'; 
			i++;
		}
		
		if(lrCreditConfig.showDestinationBranchColumnInPrint){
			var dwldExcelcell5 			= rowForDwldExcel.insertCell(i);
			dwldExcelcell5.id			='actWght_'+nextId;
			dwldExcelcell5.name			='actWght_'+nextId;
			dwldExcelcell5.innerHTML	="";
			dwldExcelcell5.className	='datatd';
			dwldExcelcell5.align		='right'; 
			i++;
		}
		
		if (!lrCreditConfig.hideConsignorColumnInPrint) {
			var dwldExcelcell6 = rowForDwldExcel.insertCell(i);
			dwldExcelcell6.id = 'actWght_' + nextId;
			dwldExcelcell6.name = 'actWght_' + nextId;
			dwldExcelcell6.innerHTML = "";
			dwldExcelcell6.className = 'datatd';
			dwldExcelcell6.align = 'right';
			i++;
		}
		var dwldExcelcell7 			= rowForDwldExcel.insertCell(i);
		dwldExcelcell7.id			='actWght_'+nextId;
		dwldExcelcell7.name			='actWght_'+nextId;
		dwldExcelcell7.innerHTML	="Total";
		dwldExcelcell7.className	='datatd';
		dwldExcelcell7.align		='right'; 
		i++;

		if (!lrCreditConfig.hideWeightColumnInPrint) {
			var dwldExcelcell8 = rowForDwldExcel.insertCell(i);
			dwldExcelcell8.id = 'total_actWght';
			dwldExcelcell8.name = 'total_actWght';
			dwldExcelcell8.innerHTML = $("#actWght_CreditClearanceTable-1").html();
			dwldExcelcell8.className = 'datatd';
			dwldExcelcell8.align = 'right';
			i++;
		}
		var dwldExcelcell9 			= rowForDwldExcel.insertCell(i);
		dwldExcelcell9.id			='total_packages';
		dwldExcelcell9.name			='total_packages';
		dwldExcelcell9.innerHTML	= $("#packages_CreditClearanceTable-1").html();
		dwldExcelcell9.className	='datatd';
		dwldExcelcell9.align		='right'; 
		
		i++;
		
		if(lrCreditConfig.showBookingTotalColumnInPrint){
			var dwldExcelcell10 		= rowForDwldExcel.insertCell(i);
			dwldExcelcell10.id			='total_grandTotal';
			dwldExcelcell10.name		='total_grandTotal';
			dwldExcelcell10.innerHTML	= totalBookingTotal;	
			dwldExcelcell10.className	='datatd';
			dwldExcelcell10.align		='right'; 
			i++;
		}
		
		if(lrCreditConfig.showDeliveryChargesColumnInPrint){
			var dwldExcelcell11			= rowForDwldExcel.insertCell(i);
			dwldExcelcell11.id			='actWght_'+nextId;
			dwldExcelcell11.name		='actWght_'+nextId;
			dwldExcelcell11.innerHTML	= totalDeliveryTotal;
			dwldExcelcell11.className	='datatd';
			dwldExcelcell11.align		='right'; 
			i++;
		}

		var dwldExcelcell12 		= rowForDwldExcel.insertCell(i);
		dwldExcelcell12.id			='actWght_'+nextId;
		dwldExcelcell12.name		='actWght_'+nextId;
		dwldExcelcell12.innerHTML	= $("#grandTotal_CreditClearanceTable-1").val();
		dwldExcelcell12.className	='datatd';
		dwldExcelcell12.align		='right'; 
		i++;

		if(lrCreditConfig.showRecievedAmountColumnInPrint) {
			var dwldExcelcell13 		= rowForDwldExcel.insertCell(i);
			dwldExcelcell13.id			='actWght_'+nextId;
			dwldExcelcell13.name		='actWght_'+nextId;
			dwldExcelcell13.innerHTML	="";
			dwldExcelcell12.className	='datatd';
			dwldExcelcell13.align		='right'; 
			i++;
		}
		
		if(lrCreditConfig.showBalanceColumnInPrint){
			var dwldExcelcell14 		= rowForDwldExcel.insertCell(i);
			dwldExcelcell14.id			='actWght_'+nextId;
			dwldExcelcell14.name		='actWght_'+nextId;
			dwldExcelcell14.innerHTML	="";
			dwldExcelcell14.className	='datatd';
			dwldExcelcell14.align		='right';
			i++;
		}
		if(lrCreditConfig.showDeliveryRemarkColumnInPrint){
			var dwldExcelcell15 		= rowForDwldExcel.insertCell(i);
			dwldExcelcell15.id			='actWght_'+nextId;
			dwldExcelcell15.name		='actWght_'+nextId;
			dwldExcelcell15.innerHTML	="";
			dwldExcelcell15.className	='datatd';
			dwldExcelcell15.align		='right';
			i++;
		}
		
		if(lrCreditConfig.showInvoiceNumber){
			var dwldExcelcell16 		= rowForDwldExcel.insertCell(i);
			dwldExcelcell16.id			='actWght_'+nextId;
			dwldExcelcell16.name		='actWght_'+nextId;
			dwldExcelcell16.innerHTML	="";
			dwldExcelcell16.className	='datatd';
			dwldExcelcell16.align		='right';
					i++;
		}
		if (lrCreditConfig.showBookingAndDeliveryDateInSeparateColumn) {
			var dwldExcelcell17 = rowForDwldExcel.insertCell(i);
			dwldExcelcell17.id = 'actWght_' + nextId;
			dwldExcelcell17.name = 'actWght_' + nextId;
			dwldExcelcell17.innerHTML = "--";
			dwldExcelcell17.className = 'datatd';
			dwldExcelcell17.align = 'right';
					i++;
		}

		if (lrCreditConfig.showDispatchDateColumn) {
			var dwldExcelcell18 = rowForDwldExcel.insertCell(i);
			dwldExcelcell18.id = 'actWght_' + nextId;
			dwldExcelcell18.name = 'actWght_' + nextId;
			dwldExcelcell18.innerHTML = "--";
			dwldExcelcell18.className = 'datatd';
			dwldExcelcell18.align = 'right';
					i++;
		}

		if (lrCreditConfig.showDeliveredToNameColumn) {
			var dwldExcelcell19 = rowForDwldExcel.insertCell(i);
			dwldExcelcell19.id = 'actWght_' + nextId;
			dwldExcelcell19.name = 'actWght_' + nextId;
			dwldExcelcell19.innerHTML = "--";
			dwldExcelcell19.className = 'datatd';
			dwldExcelcell19.align = 'right';
					i++;
		}
		
	}else{
		var tableForDwldExcel    = document.getElementById('reportTable2');
		document.getElementById('reportTable2').deleteRow(tableForDwldExcel.rows.length-2);

		var nextId = 1;
		var tableForDwldExcel    = document.getElementById('reportTable2');
		var rowCountForDwldExcel = tableForDwldExcel.rows.length;

		var rowForDwldExcel = tableForDwldExcel.insertRow(rowCountForDwldExcel);

		rowForDwldExcel.id = 'totalForDwnloadExcel';
		var i =0;

		var dwldExcelcell1 			= rowForDwldExcel.insertCell(i);
		dwldExcelcell1.id			='actWght_'+nextId;
		dwldExcelcell1.name			='actWght_'+nextId;
		dwldExcelcell1.innerHTML	="";
		dwldExcelcell1.className	='datatd';
		dwldExcelcell1.align		='right'; 
		i++;
		var dwldExcelcell2 			= rowForDwldExcel.insertCell(i);
		dwldExcelcell2.id			='actWght_'+nextId;
		dwldExcelcell2.name			='actWght_'+nextId;
		dwldExcelcell2.innerHTML	="";
		dwldExcelcell2.className	='datatd';
		dwldExcelcell2.align		='right'; 
		i++;
		
		if(lrCreditConfig.showBookingDateColumnInPrint) {
			var dwldExcelcell3 			= rowForDwldExcel.insertCell(i);
			dwldExcelcell3.id			='actWght_'+nextId;
			dwldExcelcell3.name			='actWght_'+nextId;
			dwldExcelcell3.innerHTML	="";
			dwldExcelcell3.className	='datatd';
			dwldExcelcell3.align		='right'; 
			i++;
		}
		
		if(lrCreditConfig.showSourceBranchColumnInPrint) {
			var dwldExcelcell4 			= rowForDwldExcel.insertCell(i);
			dwldExcelcell4.id			='actWght_'+nextId;
			dwldExcelcell4.name			='actWght_'+nextId;
			dwldExcelcell4.innerHTML	="";
			dwldExcelcell4.className	='datatd';
			dwldExcelcell4.align		='right'; 
			i++;
		}
		
		if(lrCreditConfig.showDestinationBranchColumnInPrint) {
			var dwldExcelcell5 			= rowForDwldExcel.insertCell(i);
			dwldExcelcell5.id			='actWght_'+nextId;
			dwldExcelcell5.name			='actWght_'+nextId;
			dwldExcelcell5.innerHTML	="";
			dwldExcelcell5.className	='datatd';
			dwldExcelcell5.align		='right'; 
			i++;
		}
	
		if (!lrCreditConfig.hideConsignorColumnInPrint) {
			var dwldExcelcell6 = rowForDwldExcel.insertCell(i);
			dwldExcelcell6.id = 'actWght_' + nextId;
			dwldExcelcell6.name = 'actWght_' + nextId;
			dwldExcelcell6.innerHTML = "";
			dwldExcelcell6.className = 'datatd';
			dwldExcelcell6.align = 'right';
			i++;
		}
		var dwldExcelcell7 			= rowForDwldExcel.insertCell(i);
		dwldExcelcell7.id			='actWght_'+nextId;
		dwldExcelcell7.name			='actWght_'+nextId;
		dwldExcelcell7.innerHTML	="Total";
		dwldExcelcell7.className	='datatd';
		dwldExcelcell7.align		='right'; 
		i++;

		if (!lrCreditConfig.hideWeightColumnInPrint) {
			var dwldExcelcell8 = rowForDwldExcel.insertCell(i);
			dwldExcelcell8.id = 'total_actWght';
			dwldExcelcell8.name = 'total_actWght';
			dwldExcelcell8.innerHTML = $("#actWght_CreditClearanceTable-1").html();
			dwldExcelcell8.className = 'datatd';
			dwldExcelcell8.align = 'right';
			i++;
		}
		var dwldExcelcell9 			= rowForDwldExcel.insertCell(i);
		dwldExcelcell9.id			='total_packages';
		dwldExcelcell9.name			='total_packages';
		dwldExcelcell9.innerHTML	= $("#packages_CreditClearanceTable-1").html();
		dwldExcelcell9.className	='datatd';
		dwldExcelcell9.align		='right'; 
		i++;
		
		if(lrCreditConfig.showBookingTotalColumnInPrint){
			var dwldExcelcell10 		= rowForDwldExcel.insertCell(i);
			dwldExcelcell10.id			='total_grandTotal';
			dwldExcelcell10.name		='total_grandTotal';
			dwldExcelcell10.innerHTML	= totalBookingTotal;	
			dwldExcelcell10.className	='datatd';
			dwldExcelcell10.align		='right'; 
			i++;
		}
		
		if(lrCreditConfig.showDeliveryChargesColumnInPrint){
			var dwldExcelcell11			= rowForDwldExcel.insertCell(i);
			dwldExcelcell11.id			='actWght_'+nextId;
			dwldExcelcell11.name		='actWght_'+nextId;
			dwldExcelcell11.innerHTML	=totalDeliveryTotal;
			dwldExcelcell11.className	='datatd';
			dwldExcelcell11.align		='right'; 
			i++;
		}

		var dwldExcelcell12 			= rowForDwldExcel.insertCell(i);
		dwldExcelcell12.id			='actWght_'+nextId;
		dwldExcelcell12.name			='actWght_'+nextId;
		dwldExcelcell12.innerHTML	= $("#grandTotal_CreditClearanceTable-1").val();
		dwldExcelcell12.className	='datatd';
		dwldExcelcell12.align		='right'; 
		i++;

		if(lrCreditConfig.showRecievedAmountColumnInPrint){
			var dwldExcelcell13 		= rowForDwldExcel.insertCell(i);
			dwldExcelcell13.id			='actWght_'+nextId;
			dwldExcelcell13.name		='actWght_'+nextId;
			dwldExcelcell13.innerHTML	="";
			dwldExcelcell12.className	='datatd';
			dwldExcelcell13.align		='right'; 
			i++;
		}
		
		if(lrCreditConfig.showBalanceColumnInPrint){
			var dwldExcelcell14 		= rowForDwldExcel.insertCell(i);
			dwldExcelcell14.id			='actWght_'+nextId;
			dwldExcelcell14.name		='actWght_'+nextId;
			dwldExcelcell14.innerHTML	="";
			dwldExcelcell14.className	='datatd';
			dwldExcelcell14.align		='right';
			i++;
		}
		
		if(lrCreditConfig.showDeliveryRemarkColumnInPrint){
			var dwldExcelcell15 		= rowForDwldExcel.insertCell(i);
			dwldExcelcell15.id			='actWght_'+nextId;
			dwldExcelcell15.name		='actWght_'+nextId;
			dwldExcelcell15.innerHTML	="";
			dwldExcelcell15.className	='datatd';
			dwldExcelcell15.align		='right';
			i++;
		}
		if(lrCreditConfig.showInvoiceNumber){
			var dwldExcelcell15 		= rowForDwldExcel.insertCell(i);
			dwldExcelcell15.id			='actWght_'+nextId;
			dwldExcelcell15.name		='actWght_'+nextId;
			dwldExcelcell15.innerHTML	="";
			dwldExcelcell15.className	='datatd';
			dwldExcelcell1.align		='right';
		}
		if (lrCreditConfig.showBookingAndDeliveryDateInSeparateColumn) {
			var dwldExcelcell16 		= rowForDwldExcel.insertCell(i);
			dwldExcelcell16.id			='actWght_'+nextId;
			dwldExcelcell16.name		='actWght_'+nextId;
			dwldExcelcell16.innerHTML	="";
			dwldExcelcell16.className	='datatd';
			dwldExcelcell16.align		='right';
					i++;

		}
			if (lrCreditConfig.showDispatchDateColumn) {
			var dwldExcelcell17 		= rowForDwldExcel.insertCell(i);
			dwldExcelcell17.id			='actWght_'+nextId;
			dwldExcelcell17.name		='actWght_'+nextId;
			dwldExcelcell17.innerHTML	="";
			dwldExcelcell17.className	='datatd';
			dwldExcelcell17.align		='right';
					i++;

		}
		if (lrCreditConfig.showDeliveredToNameColumn) {
			var dwldExcelcell18		= rowForDwldExcel.insertCell(i);
			dwldExcelcell18.id			='actWght_'+nextId;
			dwldExcelcell18.name		='actWght_'+nextId;
			dwldExcelcell18.innerHTML	="";
			dwldExcelcell18.className	='datatd';
			dwldExcelcell18.align		='right';
					i++;

		}
	}
}

function setChequeNumber(tableId) {

	var tableEl 		= document.getElementById(tableId);

	var rowCount = tableEl.rows.length;
	
	for (var j = 1; j <= rowCount - 1; j++) {
		if(document.getElementById('chequeNumber_'+j)!= null) {
			$('#chequeNumber_' + j).val($('#chequeNumber_CreditClearanceTable-1').val());
		}
	}
}

function setBankName(tableId) {

	var tableEl 		= document.getElementById(tableId);

	var rowCount = tableEl.rows.length;
	
	for (var j = 1; j <= rowCount - 1; j++) {
		if(document.getElementById('bankName_' + j) != null) {
			$('#bankName_'+j).val($('#bankName_CreditClearanceTable-1').val());
		}
	}
}

function setChequeDate(elementId) {
	$( function() {
		$('#' + elementId).val(dateWithDateFormatForCalender(new Date(),"-"));
		$('#' + elementId).datepicker({
			maxDate		: new Date(),
			showAnim	: "fold",
			dateFormat	: 'dd-mm-yy'
		});
	} );
}
function openWindowForView(id,type,branchId) {    
    window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId='+id+'&WayBillTypeId='+type+'&BranchId='+branchId);
}
function formatDate(dateObj) {
    let d = String(dateObj.getDate()).padStart(2, '0');
    let m = String(dateObj.getMonth() + 1).padStart(2, '0');
    let y = dateObj.getFullYear();
    return d + '-' + m + '-' + y;
}
