function redirectToAfterUpdate(jsondata) {
	var redirectTo		= jsondata.redirectTo;
	var wayBillId		= jsondata.wayBillId;

	if(redirectTo == 0) {
		window.close();
	}

	switch(redirectTo) {
	case 1: //For Transport LR View
	if(opener.document.wayBillForm != undefined) {
		opener.document.wayBillForm.pageId.value				= "3";
		opener.document.wayBillForm.eventId.value				= "8";
		opener.document.wayBillForm.wayBillId.value				= wayBillId;
		opener.document.wayBillForm.action						= "transportEdit.do";
		opener.document.wayBillForm.submit();

		window.close();
	 } else {
		window.close();
	 }
		break;
	case 2:
		window.close();
		break;
	case 3:
		window.close();
		break;
	case 4:
		window.close();
		break;
	case 5:
		opener.document.wayBillForm.pageId.value				= "3";
		opener.document.wayBillForm.eventId.value				= "8";
		opener.document.wayBillForm.wayBillId.value				= wayBillId;
		opener.document.wayBillForm.flag.value					= true;
		opener.document.wayBillForm.updateDestination.value 	= "1";
		opener.document.wayBillForm.action						= "create.do";
		opener.document.wayBillForm.submit();

		window.close();
		break;
	case 6:
		window.close();
		break;
	case 7: //coming from Generate CR
		opener.parent.getWaybillData(wayBillId); // to load opener window data on GenerateCR.jsp
		opener.parent.setViewStatusDetailsButtons(wayBillId); // to load opener window data on GenerateCR.jsp
		opener.parent.setViewDispatchDetailsButtons(wayBillId);// to load opener window data on GenerateCR.jsp
		opener.parent.setViewPartialDeliveryButtons(jsondata);// to load opener window data on GenerateCR.jsp
		window.close();
		break;
	case 8://For Transport update destination
		opener.document.wayBillForm.pageId.value				= "3";
		opener.document.wayBillForm.eventId.value				= "8";
		opener.document.wayBillForm.wayBillId.value				= wayBillId;
		opener.document.wayBillForm.updateDestination.value 	= "1";
		opener.document.wayBillForm.action						= "create.do";
		opener.document.wayBillForm.submit();
		
		window.close();
		break;
	case 9:// For Cargo Update Destination
		opener.document.wayBillForm.pageId.value				= "2";
		opener.document.wayBillForm.eventId.value				= "6";
		opener.document.wayBillForm.wayBillId.value				= wayBillId;
		opener.document.wayBillForm.updateDestination.value		= "1"; 
		opener.document.wayBillForm.flag.value					= true;
		opener.document.wayBillForm.action						= "create.do";
		opener.document.wayBillForm.submit();

		window.close();
		break;
	case 10: //For Cargo LR View
		opener.document.wayBillForm.pageId.value				= "2";
		opener.document.wayBillForm.eventId.value				= "6";
		opener.document.wayBillForm.wayBillId.value				= wayBillId;
		opener.document.wayBillForm.action						= "waybill.do";
		opener.document.wayBillForm.submit();

		window.close();
		break;
	case 11: //Redirect to Create Bill

		var grandTotal			= jsondata.grandTotal;
		var serviceTax			= jsondata.ServiceTax;
		var totalAmountForDD	= jsondata.totalAmountForDD;

		var preamount;
		var curamount;
		var totalamount;
		var addtotal; 

		if (grandTotal != 'null' && typeof grandTotal !== 'undefined') {
			if (typeof opener.document.getElementById('amount_' + wayBillId) !== 'undefined') {

				preamount	= opener.document.getElementById('amount_' + wayBillId).innerHTML;
				totalamount	= opener.document.getElementById('totalamount').innerHTML;
				addtotal 	= (parseInt(totalamount) - parseInt(preamount)) + parseInt(grandTotal);

				opener.document.getElementById('amount_' + wayBillId).innerHTML = grandTotal;
				opener.document.getElementById('totalamount').innerHTML 		= addtotal;
			}
		}
		
		if (jsondata.showBookingAndDeliveryCharges) {
			var bookingCharges	= jsondata.bookingCharges;
			
			for (const element of bookingCharges) {
				var newchargeamnt		= $('#wayBillCharge_' + element.chargeTypeMasterId).val();
				
				if (typeof opener.document.getElementById('bookingCharge_' + wayBillId +'_'+ element.chargeTypeMasterId) !== 'undefined' && opener.document.getElementById('bookingCharge_' + wayBillId +'_'+ element.chargeTypeMasterId) != null) {
					var prechargeamount	 	= opener.document.getElementById('bookingCharge_' + wayBillId +'_'+ element.chargeTypeMasterId).innerHTML;
					var chargetotalamount	= opener.document.getElementById('chargeAmount_' + element.chargeTypeMasterId).innerHTML;
					var chargeaddtotal 		= (parseInt(chargetotalamount) - parseInt(prechargeamount)) + parseInt(newchargeamnt);
					
					opener.document.getElementById('chargeAmount_' + element.chargeTypeMasterId).innerHTML = chargeaddtotal;
					
					opener.document.getElementById('bookingCharge_' + wayBillId +'_'+ element.chargeTypeMasterId).innerHTML = newchargeamnt;
				} else if (newchargeamnt > 0) {
					window.close();
					opener.$("#Find").trigger('click');
					break;
				}
			}
		}

		// setting services tax to opener page
		if (serviceTax != 'null' && typeof serviceTax !== 'undefined') {
			if (typeof opener.document.getElementById('ServiceTax_' + wayBillId) !== 'undefined') {

				if(opener.document.getElementById('ServiceTax_' + wayBillId) != null) {
					preamount	= opener.document.getElementById('ServiceTax_' + wayBillId).innerHTML;
				}

				if(opener.document.getElementById('totalservicetaxamount') != null) {
					totalamount	= opener.document.getElementById('totalservicetaxamount').innerHTML;
				}

				addtotal 	= (parseInt(totalamount) - parseInt(preamount)) + parseInt(serviceTax);

				if(opener.document.getElementById('ServiceTax_' + wayBillId) != null) {
					opener.document.getElementById('ServiceTax_' + wayBillId).innerHTML 	= serviceTax;
				}

				if(opener.document.getElementById('totalservicetaxamount') != null) {
					opener.document.getElementById('totalservicetaxamount').innerHTML 		= addtotal;
				}
			}
		}
		
		var pkgs 		= jsondata.package;
		var actWeight 	= jsondata.actWeight;


		// setting packages value and total packages tto opner page
		if (pkgs != 'null' && typeof pkgs !== 'undefined') {
			if (typeof opener.document.getElementById('packages_' + wayBillId) !== 'undefined') {

				preamount = '0';
				curamount = '0';
				var part		= pkgs.split(' ');
				var prepart		= (opener.document.getElementById('packages_' + wayBillId).innerHTML).split(' ');
				var thenum 		= '';

				for (var i = 0; i < part.length; i++) {

					// checking perpart value is avaliable
					if (typeof prepart[i] !== 'undefined') { 
						thenum = prepart[i].replace( /^\D+/g, '');

						if (thenum !=='') {
							preamount = parseInt(thenum) + parseInt(preamount);
						}
					}

					if (typeof part[i] !== 'undefined') {
						thenum = part[i].replace( /^\D+/g, '');

						if (thenum !=='') {
							curamount = parseInt(thenum) + parseInt(curamount);
						}
					}	
				}

				totalamount	= opener.document.getElementById('totalquantity').innerHTML;
				addtotal 	= (parseInt(totalamount) - parseInt(preamount)) + parseInt(curamount);

				opener.document.getElementById('packages_' + wayBillId).innerHTML 	= pkgs;
				opener.document.getElementById('totalquantity').innerHTML 			= addtotal;
			}
		}

		if (actWeight != 'null' && typeof actWeight !== 'undefined') {
			if (typeof opener.document.getElementById('actWght_' + wayBillId) !== 'undefined') {

				preamount	= opener.document.getElementById('actWght_' + wayBillId).innerHTML;
				totalamount	= opener.document.getElementById('totalactualweight').innerHTML;
				addtotal 	= (parseInt(totalamount) - parseInt(preamount)) + parseInt(actWeight);

				opener.document.getElementById('actWght_' + wayBillId).innerHTML 	= actWeight;
				opener.document.getElementById('totalactualweight').innerHTML 		= addtotal;

			}
		}

		var consignorName = jsondata.consignorName;
		var consigneeName = jsondata.consigneeName;

		if (consignorName != 'null' && typeof consignorName !== 'undefined') {
			if (typeof opener.document.getElementById('consignorName_' + wayBillId) !== 'undefined') {
				opener.document.getElementById('consignorName_' + wayBillId).innerHTML = consignorName;
			}
		}

		if (consigneeName != 'null' && typeof consigneeName !== 'undefined') {
			if (typeof opener.document.getElementById('consigneeName_' + wayBillId) !== 'undefined') {
				opener.document.getElementById('consigneeName_' + wayBillId).innerHTML = consigneeName;
			}
		}

		if(opener.document.getElementById('check1').getAttribute('onclick') != null) {
			var checkevent = opener.document.getElementById('check1').getAttribute('onclick');

			if (checkevent == 'calculateDataForSumm()') {
				opener.calculateDataForSumm();
			}
		}

		var destBranchName= jsondata.destBranchName;

		if (destBranchName != 'null' && typeof destBranchName !== 'undefined') {
			if (typeof opener.document.getElementById('destinationBranch_' + wayBillId) !== 'undefined') {
				opener.document.getElementById('destinationBranch_' + wayBillId).innerHTML = destBranchName;
			}
		}

		if (totalAmountForDD != 'null' && typeof totalAmountForDD !== 'undefined') {
			if (opener.document.getElementById('doorDly_' + wayBillId) != null && typeof opener.document.getElementById('doorDly_' + wayBillId) !== 'undefined') {

				var preamount	= opener.document.getElementById('doorDly_' + wayBillId).innerHTML;
				var totalamount	= opener.document.getElementById('totaldoordeliverycharge').innerHTML;
				var addtotal 	= (parseInt(totalamount) - parseInt(preamount)) + parseInt(totalAmountForDD);

				opener.document.getElementById('doorDly_' + wayBillId).innerHTML 	= totalAmountForDD;
				opener.document.getElementById('totaldoordeliverycharge').innerHTML = addtotal;
			}
		}

		var sourceBranchName	= jsondata.sourceBranchName;

		if (sourceBranchName != 'null' && typeof sourceBranchName !== 'undefined') {
			if (typeof opener.document.getElementById('sourceBranch_' + wayBillId) !== 'undefined') {
				opener.document.getElementById('sourceBranch_' + wayBillId).innerHTML = sourceBranchName;
			}
		}

		var invoiceNo	= jsondata.invoiceNo;

		if (invoiceNo != 'null' && typeof invoiceNo !== 'undefined') {
			if (typeof opener.document.getElementById('invoiceNo_' + wayBillId) !== 'undefined') {
				opener.document.getElementById('invoiceNo_' + wayBillId).innerHTML = invoiceNo;
			}
		}

		var transportationModeName	= jsondata.transportationModeName;
		var transportationModeId	= jsondata.transportationModeId;

		if (transportationModeName != 'null' && typeof transportationModeName !== 'undefined') {
			if (typeof opener.document.getElementById('transportModeId_' + wayBillId) !== 'undefined' && opener.document.getElementById('transportModeId_' + wayBillId) != null) {
				opener.document.getElementById('transportModeId_' + wayBillId).innerHTML = transportationModeName;
			}
		}

		if (transportationModeId > 0 && typeof transportationModeName !== 'undefined') {
			if (typeof opener.document.getElementById('transportMode_' + wayBillId) !== 'undefined' && opener.document.getElementById('transportMode_' + wayBillId) != null) {
				opener.document.getElementById('transportMode_' + wayBillId).value = transportationModeId;
			}
		}

		window.close();
		break;
	case 12: //Redirect to Edit Invoice
		if (typeof opener.document.getElementById('creditWayBillPaymentModuleGrandTotal_' + wayBillId) !== 'undefined' && opener.document.getElementById('creditWayBillPaymentModuleGrandTotal_' + wayBillId) != null) {

			if(jsondata.creditWayBillPaymentModuleGrandTotal != undefined && typeof jsondata.creditWayBillPaymentModuleGrandTotal != 'undefined') {
				opener.document.getElementById('creditWayBillPaymentModuleGrandTotal_' + wayBillId).innerHTML = jsondata.creditWayBillPaymentModuleGrandTotal;
			}

			if (typeof opener.document.getElementById('editInvoiceTr_' + wayBillId) !== 'undefined' && opener.document.getElementById('editInvoiceTr_' + wayBillId) != null) {
				let tableRow= opener.document.getElementById('editInvoiceTr_' + wayBillId);
				let tableTd = tableRow.children;

				for (const element of tableTd) {
					element.style.backgroundColor = "#FFE4B5";
				}
			}
		}		

		if(jsondata.creditWayBillPaymentModuleTotal != undefined && typeof jsondata.creditWayBillPaymentModuleTotal != 'undefined') {
			if (typeof opener.document.getElementById('creditWayBillPaymentModuleGrandTotal') !== 'undefined' && opener.document.getElementById('creditWayBillPaymentModuleGrandTotal') != null) {
				opener.document.getElementById('creditWayBillPaymentModuleGrandTotal').innerHTML = jsondata.creditWayBillPaymentModuleTotal;
			}
		}

		if(jsondata.billGrandTotal != undefined && typeof jsondata.billGrandTotal != 'undefined') {
			if (typeof opener.document.getElementById('BillTotal') !== 'undefined' && opener.document.getElementById('BillTotal') != null) {
				opener.document.getElementById('BillTotal').innerHTML = jsondata.billGrandTotal;
			}
		}

		var totalserviceTaxAmount	= jsondata.totalserviceTaxAmount;
		var igst					= jsondata.igst;
		var sgst					= jsondata.sgst;
		var cgst					= jsondata.cgst;

		if(totalserviceTaxAmount != undefined && typeof totalserviceTaxAmount != 'undefined' && totalserviceTaxAmount <= 0) {
			if (typeof opener.document.getElementById('taxDetailsTable') !== 'undefined' && opener.document.getElementById('taxDetailsTable') != null) {
				opener.document.getElementById('taxDetailsTable').classList.add("hide");
			} else
				opener.document.getElementById('taxDetailsTable').classList.remove("hide");

			if(typeof opener.document.getElementById('billServiceTaxonBill') !== 'undefined' && opener.document.getElementById('billServiceTaxonBill') != null) {
				opener.document.getElementById('billServiceTaxonBill').value = 0;
			}
		}

		if(igst != undefined && typeof igst != 'undefined') {
			if (typeof opener.document.getElementById('igst') !== 'undefined' && opener.document.getElementById('igst') != null) {
				opener.document.getElementById('igst').innerHTML = igst;
			}
		}

		if(sgst != undefined && typeof sgst != 'undefined') {
			if (typeof opener.document.getElementById('sgst') !== 'undefined' && opener.document.getElementById('sgst') != null) {
				opener.document.getElementById('sgst').innerHTML = sgst;
			}
		}

		if(cgst != undefined && typeof cgst != 'undefined') {
			if (typeof opener.document.getElementById('cgst') !== 'undefined' && opener.document.getElementById('cgst') != null) {
				opener.document.getElementById('cgst').innerHTML = cgst;
			}
		}

		if(totalserviceTaxAmount != undefined && typeof totalserviceTaxAmount != 'undefined') {
			if (typeof opener.document.getElementById('totaltaxamount') !== 'undefined' && opener.document.getElementById('totaltaxamount') != null) {
				opener.document.getElementById('totaltaxamount').innerHTML = totalserviceTaxAmount;
			}
		}

		var billTransportationModeName	= jsondata.billTransportationModeName;

		if(billTransportationModeName != undefined && typeof billTransportationModeName != 'undefined') {
			if (typeof opener.document.getElementById('transportationModeId') !== 'undefined' && opener.document.getElementById('transportationModeId') != null) {
				opener.document.getElementById('transportationModeId').innerHTML = billTransportationModeName;
			}
		}

		hideLayer();
		window.close();
		break;
	case 13: //For Transport Search
		opener.document.wayBillSearchForm.pageId.value				= "5";
		opener.document.wayBillSearchForm.eventId.value				= "3";
		opener.document.wayBillSearchForm.wayBillNumber.value		= jsondata.number;
		opener.document.wayBillSearchForm.TypeOfNumber.value		= jsondata.typeOfNumber;
		
		if(jsondata.branchId != undefined && typeof jsondata.branchId != 'undefined')
			opener.document.wayBillSearchForm.BranchId.value		= jsondata.branchId;
		
		opener.document.wayBillSearchForm.action					= "Search.do";
		opener.document.wayBillSearchForm.submit();

		window.close();
		break;

	case 14: // for Stbs Bill creation
		var grandTotal			= jsondata.grandTotal;
		var serviceTax			= jsondata.ServiceTax;
		var totalAmountForDD	= jsondata.totalAmountForDD;

		var preamount;
		var curamount;
		var totalamount;
		var addtotal; 

		if (grandTotal != 'null' && typeof grandTotal !== 'undefined') {
			if (typeof opener.document.getElementById('amount_' + wayBillId) !== 'undefined') {

				preamount	= opener.document.getElementById('amount_' + wayBillId).innerHTML;

				totalamount	= opener.document.getElementById('totalAmt').innerHTML;

				addtotal 	= (parseInt(totalamount) - parseInt(preamount)) + parseInt(grandTotal);

				opener.document.getElementById('amount_' + wayBillId).innerHTML =  Math.round(grandTotal);
				opener.document.getElementById('totalAmt').innerHTML 		= addtotal;
			}
		}

		// setting services tax to opener page
		if (serviceTax != 'null' && typeof serviceTax !== 'undefined') {
			if (typeof opener.document.getElementById('ServiceTax_' + wayBillId) !== 'undefined') {

				if(opener.document.getElementById('ServiceTax_' + wayBillId) != null)
					preamount	= opener.document.getElementById('ServiceTax_' + wayBillId).innerHTML;

				if(opener.document.getElementById('totalservicetaxamount') != null)
					totalamount	= opener.document.getElementById('totalservicetaxamount').innerHTML;

				addtotal 	= (parseInt(totalamount) - parseInt(preamount)) + parseInt(serviceTax);

				if(opener.document.getElementById('ServiceTax_' + wayBillId) != null)
					opener.document.getElementById('ServiceTax_' + wayBillId).innerHTML 	= serviceTax;

				if(opener.document.getElementById('totalservicetaxamount') != null)
					opener.document.getElementById('totalservicetaxamount').innerHTML 		= addtotal;
			}
		}

		var quantity 		= jsondata.totalQuantity;
		var actWeight 		= jsondata.actWeight;

		// setting packages value and total packages to opner page
		if (quantity != 'null' && typeof quantity !== 'undefined') {
			if (typeof opener.document.getElementById('packages_' + wayBillId) !== 'undefined') {

				preamount = opener.document.getElementById('packages_' + wayBillId).innerHTML;
				totalamount	= opener.document.getElementById('totalPkgs').innerHTML;
				addtotal 	= (parseInt(totalamount) - parseInt(preamount)) + parseInt(quantity);

				opener.document.getElementById('packages_' + wayBillId).innerHTML 	= quantity;
				opener.document.getElementById('totalPkgs').innerHTML 			= addtotal;
			}
		}

		if (actWeight != 'null' && typeof actWeight !== 'undefined') {
			if (typeof opener.document.getElementById('actWght_' + wayBillId) !== 'undefined') {

				preamount	= opener.document.getElementById('actWght_' + wayBillId).innerHTML;
				totalamount	= opener.document.getElementById('totalActWght').innerHTML;
				addtotal 	= (parseInt(totalamount) - parseInt(preamount)) + parseInt(actWeight);

				opener.document.getElementById('actWght_' + wayBillId).innerHTML 	= actWeight;
				opener.document.getElementById('totalActWght').innerHTML 		= addtotal;

			}
		}
		window.close();
		break;	
		
	case 15: //Redirect to Edit STBS
		if (typeof opener.document.getElementById('stbsWayBillPaymentModuleGrandTotal_' + wayBillId) !== 'undefined' && opener.document.getElementById('stbsWayBillPaymentModuleGrandTotal_' + wayBillId) != null
		&& jsondata.stbsWayBillGrandTotal != undefined && typeof jsondata.stbsWayBillGrandTotal != 'undefined')
			opener.document.getElementById('stbsWayBillPaymentModuleGrandTotal_' + wayBillId).innerHTML = jsondata.stbsWayBillGrandTotal;

		if(jsondata.stbsBillGrandTotal != undefined && typeof jsondata.stbsBillGrandTotal != 'undefined'
		&& typeof opener.document.getElementById('BillTotal') !== 'undefined' && opener.document.getElementById('BillTotal') != null)
			opener.document.getElementById('BillTotal').innerHTML = jsondata.stbsBillGrandTotal;

		hideLayer();
		window.close();
		break;
		
	case 16: //Redirect to Con BLHPV
		
		var prevBalanceAmount = Number(opener.document.getElementById('totalBalanceAmount').value);
		var prevRefundAmount  = Number(opener.document.getElementById('totalRefundAmount').value);
		var preActualBalance  = Number(opener.document.getElementById('charge_' + jsondata.lhpvCharges.lHPVId + '_20').value);
		var preActualRefund  = Number(opener.document.getElementById('charge_' + jsondata.lhpvCharges.lHPVId + '_21').value);

		var curActualBalance = 0;
		var curActualRefund  = 0;
		
		if (typeof opener.document.getElementById('lorryHire_' + jsondata.lhpvCharges.lHPVId) !== 'undefined' && opener.document.getElementById('lorryHire_' + jsondata.lhpvCharges.lHPVId) != null
		&& jsondata.lhpvCharges.totalLorryHireAmount != undefined && typeof jsondata.lhpvCharges.totalLorryHireAmount != 'undefined')
			opener.document.getElementById('lorryHire_' + jsondata.lhpvCharges.lHPVId).innerHTML = jsondata.lhpvCharges.totalLorryHireAmount;

		if (typeof opener.document.getElementById('advanceAmount_' + jsondata.lhpvCharges.lHPVId) !== 'undefined' && opener.document.getElementById('advanceAmount_' + jsondata.lhpvCharges.lHPVId) != null
		&& jsondata.lhpvCharges.advanceAmount != undefined && typeof jsondata.lhpvCharges.advanceAmount != 'undefined')
			opener.document.getElementById('advanceAmount_' + jsondata.lhpvCharges.lHPVId).value = jsondata.lhpvCharges.advanceAmount;
		
		if (typeof opener.document.getElementById('charge_' + jsondata.lhpvCharges.lHPVId + '_20') !== 'undefined' && opener.document.getElementById('charge_' + jsondata.lhpvCharges.lHPVId + '_20') != null) {
			if(jsondata.lhpvCharges.balanceAmount != undefined && typeof jsondata.lhpvCharges.balanceAmount != 'undefined') {
				opener.document.getElementById('charge_' + jsondata.lhpvCharges.lHPVId + '_20').value = jsondata.lhpvCharges.balanceAmount;
				curActualBalance 	= Number(opener.document.getElementById('charge_' + jsondata.lhpvCharges.lHPVId + '_20').value);
				curActualRefund 	= Number(opener.document.getElementById('charge_' + jsondata.lhpvCharges.lHPVId + '_21').value);
				
				if (preActualBalance < curActualBalance) {
					prevBalanceAmount += curActualBalance - preActualBalance;
				
					if(prevRefundAmount > 0)
						prevBalanceAmount = prevBalanceAmount - prevRefundAmount;
				} else if(preActualBalance > curActualBalance)
					prevBalanceAmount -= preActualBalance - curActualBalance;
				
				opener.document.getElementById('totalBalanceAmount').value = prevBalanceAmount; 
			}
		}
		
		if (typeof opener.document.getElementById('charge_' + jsondata.lhpvCharges.lHPVId +'_21') !== 'undefined' && opener.document.getElementById('charge_' + jsondata.lhpvCharges.lHPVId +'_21') != null) {
			if(jsondata.lhpvCharges.refundAmount != undefined && typeof jsondata.lhpvCharges.refundAmount != 'undefined') {
				opener.document.getElementById('charge_' + jsondata.lhpvCharges.lHPVId + '_21').value = jsondata.lhpvCharges.refundAmount;
				curActualRefund = Number(opener.document.getElementById('charge_' + jsondata.lhpvCharges.lHPVId + '_21').value);
				
				if (preActualRefund < curActualRefund) { // correct 
					prevBalanceAmount = prevBalanceAmount - curActualRefund;
					
					if(prevBalanceAmount < 0)
						prevRefundAmount = prevBalanceAmount;
				} else if (preActualRefund > curActualRefund) { // correct
					prevBalanceAmount += curActualRefund;
				
					if(prevRefundAmount > 0) {
						if(prevRefundAmount < curActualRefund)
							prevBalanceAmount = Math.abs(prevBalanceAmount - preActualRefund);

						if(curActualRefund > prevRefundAmount && curActualBalance < 0)
							prevBalanceAmount = preActualRefund - prevRefundAmount - curActualRefund;
						else if(preActualRefund > prevRefundAmount)	{
						 	prevBalanceAmount = Math.abs(prevBalanceAmount - curActualBalance);
						 	
						 	if(prevRefundAmount < preActualRefund && prevBalanceAmount < 0)
								prevBalanceAmount = preActualRefund - prevBalanceAmount - curActualBalance;
						}
					} else if (preActualRefund > 0)
						prevBalanceAmount += preActualRefund
				}
				
				if (prevBalanceAmount < 0) {
					opener.document.getElementById('totalRefundAmount').value = Math.abs(prevBalanceAmount);
					opener.document.getElementById('totalBalanceAmount').value = Math.abs(0);
				} else
					opener.document.getElementById('totalRefundAmount').value = Math.abs(0);
			  	
			  	opener.document.getElementById('totalBalanceAmount').value = prevBalanceAmount;
			}
			
		}

	  	window.close();
		break;
	case 17: //Redirect to Multiple Delivery
		var grandTotal			= jsondata.grandTotal;

		if (grandTotal != null && typeof grandTotal !== 'undefined') {
			let amountEl		= opener.document.getElementById('Amount_' + wayBillId);
			
			if (amountEl != null)
				amountEl.innerHTML = grandTotal;
		}  
		
		if (opener && typeof opener.receiveGrandTotal === 'function')
			opener.receiveGrandTotal(wayBillId, grandTotal, jsondata.wayBillTypeId);
		
		window.close();
		break;
	default:
		break;
	}
}