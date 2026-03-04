var stPaidBy = 0;
function formValidation() {
	let reg = /\s/g; //Match any white space including space, tab, form-feed, etc.
	let qty = 0;
	let packingType = 0;
	let consignmentGoodsId = 0;
	let saidtoContain = null;
	isEmpty 	= false;
	
		
	for(let i = 0; i < noOfConsignmentToAdd ; i++) {
		qty 				= $('#qty_' + i).val();
		packingType 		= $('#packingType_' + i).val();
		saidtoContain		= $('#saidtoContain_' + i).val().replace(reg, '');
		consignmentGoodsId 	= $('#consignmentGoodsId_' + i).val();
		
		if(qty > 0 && packingType <= 0) {
			showMessage('error', 'Please Select Article Type !!');
			toogleElement('basicError','block');
			document.getElementById('packingType_' + i).selectedIndex = 0;
			changeTextFieldColor('#packingType_' + i, '', '', 'red');
			return false;
		}
		
		if(qty > 0 && packingType > 0 && consignmentGoodsId <= 0 && groupConfiguration.SaidToContain && groupConfiguration.SaidToContainValidate) {
			showMessage('error', 'Please Enter Said To Contain !!');
			toogleElement('basicError','block');
			$('#saidtoContain_' + i).val('');
			changeTextFieldColor('#saidtoContain_' + i, '', '', 'red');
			return false;
		}
		
		if(qty > 0 && packingType <= 0 && saidtoContain.length > 0) {
			showMessage('error', 'Please Select Article Type !!');
			toogleElement('basicError','block');
			document.getElementById('packingType_' + i).selectedIndex = 0;
			changeTextFieldColor('#packingType_' + i, '', '', 'red');
			return false;
		}
		
		if(qty <= 0 && packingType > 0 && saidtoContain.length > 0) {
			showMessage('error', 'Please Enter Quantity !!');
			toogleElement('basicError','block');
			$('#qty_' + i).val('0');
			changeTextFieldColor('#qty_' + i, '', '', 'red');
			return false;
		}
		
		if(qty > 0 && packingType <= 0 && consignmentGoodsId <= 0 && groupConfiguration.SaidToContain && groupConfiguration.SaidToContainValidate) {
			showMessage('error', 'Please Enter Said To Contain !!');
			toogleElement('basicError','block');
			$('#saidtoContain_' + i).val('');
			changeTextFieldColor('#saidtoContain_' + i, '', '', 'red');
			document.getElementById('packingType_' + i).selectedIndex = 0;
			changeTextFieldColor('#packingType_' + i, '', '', 'red');
			return false;
		}
		
		if(qty <= 0 && packingType <= 0 && saidtoContain.length > 0) {
			showMessage('error', 'Please Select Article Type !!');
			toogleElement('basicError','block');
			document.getElementById('packingType_' + i).selectedIndex = 0;
			changeTextFieldColor('#packingType_' + i, '', '', 'red');
			$('#qty_' + i).val(0);
			changeTextFieldColor('#qty_' + i, '', '', 'red');
			return false;
		}
		
		if(qty <= 0 && packingType > 0 && saidtoContain.length == 0) {
			showMessage('error', 'Please Enter Quantity !!');
			toogleElement('basicError','block');
			$('#qty_' + i).val(0);
			changeTextFieldColor('#qty_' + i, '', '', 'red');
			$('#saidtoContain_' + i).val('');
			changeTextFieldColor('#saidtoContain_' + i, '', '', 'red');
			return false;
		}

		if(qty > 0 && (chargeType == CHARGETYPE_ID_CUBIC_RATE || $('#newChargeType').val() == CHARGETYPE_ID_CUBIC_RATE || groupConfiguration.VolumetricWiseAddArticle || groupConfiguration.VolumetricRate)
			&& $('#volumetric').is(':checked')) {
				
			let length 		= $('#length_' + i).val();
			let breadth 	= $('#breadth_' + i).val();
			let height 		= $('#height_' + i).val();
			let cftUnitId 	= $('#artCftUnitId_' + i).val();
			let volumetricFactorId 	= $('#volumetricFactorId_' + i).val();
			
			if(groupConfiguration.cftUnitSelection && cftUnitId == 0) {
				showMessage('error', 'Select CFT Unit !');
				changeTextFieldColor('artCftUnitId_' + i, '', '', 'red');
				return false;
			}
			
			if(!groupConfiguration.hideCFTValueFieldOnBookingPage) {
				let cftValue = $('#artCftValue_' + i).val();
								
				if((cftValue == '' || cftValue == 0)) {
					showMessage('error', 'Enter CFT Value !nnnn');
					changeTextFieldColor('artCftValue_' + i, '', '', 'red');
					return false
				}
			}
				
			if(length == '' || length == 0) {
				showMessage('error', lengthErrMsg);
				changeTextFieldColor('length_' + i, '', '', 'red');
				return false;
			}
			
			if(breadth == '' || breadth == 0) {
				showMessage('error', breadthErrMsg);
				changeTextFieldColor('breadth_' + i, '', '', 'red');
				return false;
			}
			
			if(height == '' || height == 0) {
				showMessage('error', heightErrMsg);
				changeTextFieldColor('height_' + i, '', '', 'red');
				return false;
			}
			
			if(groupConfiguration.volumetricWeightCalculationBasedOnVolumetricFactor && volumetricFactorId == 0) {
				showMessage('error', volumetricFactorErrMsg);
				changeTextFieldColor('volumetricFactorId_' + i, '', '', 'red');
				return false;
			}
			
			if(groupConfiguration.showVolumetricActualWeight
				&& !validateInputTextFeild(1, 'artActualWeight_' + i, 'artActualWeight_' + i, 'error',  '<i class="fa fa-times-circle"></i> Enter Actual Weight !'))
				return false;
		}
		
		if(parseInt(qty,10) > 0 && parseInt(packingType,10) > 0 && saidtoContain.length > 0)
			isEmpty = true;
	}
	
	if(!editConsignmentProperties.allowZeroChargeWeight && $('#actualWeight').val() > 0 && (Number($('#actualWeight').val()) <= 0 || Number($('#chWeight').val()) <= 0)) {
		showMessage('error', 'You can not enter Weight zero !');
		toogleElement('basicError','block');
		$('#chWeight').val(0);
		$('#actWeight').val(0);
		changeTextFieldColor('#chWeight', '', '', 'red');
		changeTextFieldColor('#actWeight', '', '', 'red');
		return false;
	}
	
	if($('#actualWeight').val() > 0) {
		let actualWeight  	= Number($('#actWeight').val());
		let chargedWeight 	= Number($('#chWeight').val());

		if($('#actualWeight').val() > 0) {
			if(actualWeight <= minWeight) {
				if(chargedWeight < minWeight) {
					showMessage('error', 'You can not enter Charged Weight less than ' + minWeight);
					_this.calculateChargedWeight();
					return false;
				}
			} else if(chargedWeight < actualWeight) {
				showMessage('error', 'You can not enter Charged Weight less than ' + actualWeight);
				_this.calculateChargedWeight();
				return false;
			}
		}
	}
	
	if(wayBillTypeId != WAYBILL_TYPE_FOC && jsondata.editBookingChargeType && !checkLRForZeroAmount(wayBill.wayBillTypeId)) {
		if($('#newChargeType').val() > 0) {
			if($('#newChargeType').val() == CHARGETYPE_ID_WEIGHT && $('#weightFreightRate').val() <= 0) {
				showMessage('error', 'Enter Weight Rate !');
				toogleElement('basicError','block');
				changeError1('weightFreightRate','0','0');
				return false;
			} else if($('#newChargeType').val() == CHARGETYPE_ID_FIX && $('#fixAmount').val() <= 0) {
				showMessage('error', 'Enter Fix Amount !');
				toogleElement('basicError','block');
				changeError1('fixAmount','0','0');
				return false;
			} else if($('#newChargeType').val() == CHARGETYPE_ID_CFT) {
				if($('#cftFreightRate').val() <= 0) {
					showMessage('error', 'Enter CFT Rate !');
					toogleElement('basicError','block');
					changeError1('cftFreightRate','0','0');
					return false;
				} else if($('#cftAmount').val() <= 0){
					showMessage('error', 'Enter CFT Amount !');
					toogleElement('basicError','block');
					changeError1('cftAmount','0','0');
					return false;
				}
			} else if($('#newChargeType').val() == CHARGETYPE_ID_CBM) {
				if($('#cbmFreightRate').val() <= 0) {
					showMessage('error', 'Enter CBM Rate !');
					toogleElement('basicError','block');
					changeError1('cbmFreightRate','0','0');
					return false;
				} else if($('#cbmAmount').val() <= 0) {
					showMessage('error', 'Enter CBM Amount !');
					toogleElement('basicError','block');
					changeError1('cbmAmount','0','0');
					return false;
				}
			}
		}
	}
	
	if(editConsignmentProperties.allowToInsertRemark && !validateRemark(1, 'remark', 'remark')) {
		$('#remark').val('');
		return false;
	}
	
	return true;
}

function checkLRForZeroAmount(wayBillTypeId) {
	return wayBillTypeId == WAYBILL_TYPE_TO_PAY && groupConfiguration.allowZeroAmountInToPay
		|| wayBillTypeId == WAYBILL_TYPE_PAID && groupConfiguration.allowZeroAmountInPaid
		|| wayBillTypeId == WAYBILL_TYPE_CREDIT && groupConfiguration.allowZeroAmountInTBB;
}

function checktotalAmountForSum() {
	 if(document.getElementById('isRateAutoMaster') && document.getElementById('isRateAutoMaster').checked && Number($('#wayBillCharge_1').val()) <= 0) {
		showMessage('error','Rate Not Defined !!');
		toogleElement('basicError','block');
		return false;
	}	 
	
	return true;
}

function saveWayBillCharges() {
	if(formValidation()) {
		if(!isEmpty && groupConfiguration.SaidToContain && groupConfiguration.SaidToContainValidate) {
			if(groupConfiguration.SaidToContain && groupConfiguration.SaidToContainValidate) {
				showMessage('error', 'Please Add Atleast One Consignment !!');
				return false;
			}
			
			return true;
		} else if(checktotalAmountForSum()) {
			if($("#isRateAutoMaster").prop("checked"))
				totalGrandTotalAmt	= parseInt($("#grandTotal").val());
			else
				totalGrandTotalAmt	= calculateGrandTotal();
					
			if(allowToDecreaseConsignmentFreightAmount && !allowToDecreaseConsignmentAmount) {
				if(wayBill.wayBillTypeId == WAYBILL_TYPE_TO_PAY || wayBill.wayBillTypeId == WAYBILL_TYPE_CREDIT) {
					if(wayBill.wayBillStatus != WAYBILL_STATUS_BOOKED && parseInt(totalGrandTotalAmt) < wayBill.wayBillGrandTotal) {
						showMessage('info', "You can not enter amount less than the Original Amount "+ parseInt(wayBill.wayBillGrandTotal) + " Rs /-");
						return false;
					}
				} else if(parseInt(totalGrandTotalAmt) < wayBill.wayBillGrandTotal) {
					showMessage('info', "You can not enter amount less than the Original Amount "+ parseInt(wayBill.wayBillGrandTotal) + " Rs /-");
					return false;
				}
			}
				
			stPaidBy = $('#stPaidBy').val();
				
			if(editConsignmentProperties.allowToEditStPaidBy) {
				if(totalGrandTotalAmt > leastTaxableAmount && stPaidBy == "0") {
					$('#stPaidBy').focus();
					showMessage('info', " Select GST PAID BY Amount Is Greater Than " + leastTaxableAmount + "/-!");
					return false;
				} else if(totalGrandTotalAmt <= leastTaxableAmount)
					stPaidBy = 0;
			}
				
			if(groupConfiguration.shortCreditConfigLimitAllowed && wayBill.wayBillTypeId == WAYBILL_TYPE_PAID && wayBill.paymentType == PAYMENT_TYPE_CREDIT_ID
				&& shortCreditConfigLimit != null) {
				if(shortCreditConfigLimit.creditType == 1 && parseInt(totalGrandTotalAmt) > shortCreditConfigLimit.creditLimit) {
					showMessage('info', " Short Credit Amount Limit of " + shortCreditConfigLimit.creditLimit + " Exceeded !");
					return false;
				} else if(shortCreditConfigLimit.creditType == 2 && parseInt(totalGrandTotalAmt) > shortCreditConfigLimit.balance) {
					showMessage('info', " Short Credit Balance Limit of " + shortCreditConfigLimit.balance + " Exceeded !");
					return false;
				}
			}
				
			if(isAgentBranchComissionBillCreated && parseInt(totalGrandTotalAmt) != wayBill.wayBillGrandTotal) {
				showMessage('info', "Edit LR Consignment not Allowed after agent bill creation ! ");
				return false;
			}
			
			articleArray	= getTotalAmountAfterEditConsignmentAmount();
				
			if(!minimumLrBookingTotal(groupConfiguration, wayBill.wayBillTypeId, totalGrandTotalAmt, wayBill.wayBillInfoBookingBranchId))
				return false;
				
			if(!doneTheStuff) {
				$('#Update').addClass('hide');
				doneTheStuff = true;
				let answer = confirm ("Are you sure you want to Update Article Details ?");
				
				if (answer) {
					//Disable page
					showLayer();
					let jsonObject		= new Object();
					
					jsonObject["waybillId"]							= wayBill.wayBillId;
					jsonObject["billId"]							= billId;
					jsonObject["length"] 							= $('#length').val();
					jsonObject["height"] 							= $('#height').val();
					jsonObject["breadth"] 							= $('#breadth').val();
				
					jsonObject["isRateAutoMaster"] 					= $('#isRateAutoMaster').is(":checked");
					jsonObject["weightFreightRate"] 				= $('#weightFreightRate').val();
					jsonObject["newChargeType"] 					= $('#newChargeType').val();
					jsonObject["fixAmount"] 						= $('#fixAmount').val();
					jsonObject["redirectTo"] 						= redirectFilter;
					jsonObject["creditorId"]						= creditorId;
					jsonObject["rateApplyOnChargeType"]				= rateApplyOnChargeType;
					jsonObject["remark"]							= $('#remark').val();
					jsonObject["actWeight"] 						= $('#actWeight').val();
					jsonObject["chWeight"] 							= $('#chWeight').val();
					jsonObject["stPaidBY"] 							= stPaidBy;
					jsonObject["cftValue"] 							= $('#cftAmount').val();
					jsonObject["cftRate"] 							= $('#cftFreightRate').val();
					jsonObject["cbmValue"] 							= $('#cbmAmount').val();
					jsonObject["cbmRate"] 							= $('#cbmFreightRate').val();
					jsonObject.shortCreditCollLedgerId 				= shortCreditCollLedgerId;
					jsonObject.stbsTxnTypeId						= txnTypeId;
					
					if(groupConfiguration.applyPartyCommissionFromPartyMaster && applyRateEditConsignmentConfig.checkApplyRateAutomatically && typeof partyIdForCommission !== 'undefined' && partyIdForCommission > 0)
						jsonObject["partyIdForCommission"] 			= partyIdForCommission;
					
					jsonObject.ArticleArray = JSON.stringify(articleArray);
					getBookingChargeDetails(jsonObject);
					
					showLayer();
					$.ajax({
						type		: 	"POST",
						url			: 	WEB_SERVICE_URL + '/editConsignmentWS/updateConsignment.do',
						data		:	jsonObject,
						dataType	: 	'json',
						success		: 	function(response) {
							if (response.message != undefined) {
								let errorMessage = response.message;
								showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
								doneTheStuff = false;
								$('#Update').removeClass('hide');
								hideLayer();
							} else {
								redirectToAfterUpdate(response);
								hideLayer();
							}
						}
					});
				} else {
					doneTheStuff = false;
					setTimeout(() => {
						$("#Update").removeClass('hide');
					}, 200);
				}
			}
		}
	}
	
	return false;
}

function getTotalAmountAfterEditConsignmentAmount() {
	consignmentDetailsList = [];

	for(let i = 0; i < noOfConsignmentToAdd; i++) {
		let articleData = new Object();

		articleData.quantity	 			= $('#qty_' + i).val();
		
		if($('#newqtyAmt_' + i).val() > 0)
			articleData.NewqtyAmt			= $('#newqtyAmt_' + i).val();
		else
			articleData.NewqtyAmt			= $('#qtyAmt_' + i).val();
		
		articleData.consignmentGoodsId		= $('#consignmentGoodsId_' + i).val();
		articleData.SaidToContain			= $('#saidtoContain_' + i).val();
		articleData.packingTypeMasterId		= $('#packingType_' + i).val();
		articleData.ConsignmentDetailsId	= $('#consignmentDetailsId_' + i).val();
		articleData.cftUnitId				= $('#artCftUnitId_' + i).val();
		articleData.length					= $('#length_' + i).val();
		articleData.breadth					= $('#breadth_' + i).val();
		articleData.height					= $('#height_' + i).val();
		articleData.volumetricFactor		= $('#volumetricFactorId_' + i).val();
		articleData.actualWeight			= $('#artActualWeight_' + i).val();
		articleData.chargedWeight			= $('#artChargeWeight_' + i).val();
		articleData.cftRate					= $('#artCftValue_' + i).val();

		consignmentDetailsList.push(articleData);
	}

	return consignmentDetailsList;
}

function getBookingChargeDetails(jsonObject) {
	let chargesColl 	= new Object(); 

	if(bookingCharges != null) {
		for (const element of bookingCharges)
			chargesColl["charge_" + element.chargeTypeMasterId] = $('#wayBillCharge_' + element.chargeTypeMasterId).val();
		
		jsonObject.lrBookingCharges 	= JSON.stringify(chargesColl);
	}
}

function calculateGrandTotal() {
	let consignmentLength	= $('#consignmentRowToEdit tr').length;
	let totalGrandTotal	= 0;
	let	articleAmt		= 0;
	let qty				= 0;
	let chargeWeight 	= 0;
	let cftAmount 		= 0;
	let cbmAmount 		= 0;
	
	if($('#newChargeType').val() > 0)
		chargeType	= $('#newChargeType').val();

	if(chargeType == CHARGETYPE_ID_QUANTITY) {
		for(let i = 0; i < consignmentLength; i++) {
			articleAmt	= parseInt($('#qtyAmt_' + i).val());
			qty			= parseInt($('#qty_' + i).val());
			
			if(articleAmt != null && articleAmt > 0)
				totalGrandTotal	+= articleAmt * qty;
		}
	} else if(chargeType == CHARGETYPE_ID_WEIGHT) {
		chargeWeight	= parseInt($('#chWeight').val());

		totalGrandTotal	= chargeWeight * consignmentSummary.consignmentSummaryWeightFreightRate;
	} else if(chargeType == CHARGETYPE_ID_CFT) {
		cftAmount	= parseInt($('#cftAmount').val());

		totalGrandTotal	= cftAmount * consignmentSummary.cftRate;
	} else if(chargeType == CHARGETYPE_ID_CBM) {
		cbmAmount	= parseInt($('#cbmAmount').val());

		totalGrandTotal	= cbmAmount * consignmentSummary.cbmRate;
	} else if(chargeType == CHARGETYPE_ID_FIX)
		totalGrandTotal	= parseInt($('#fixAmount').val());
	
	return Math.round(totalGrandTotal) + (wayBill.wayBillGrandTotal - consignmentSummary.consignmentSummaryAmount);
}

function changeError1(id,xaxis,yaxis){
	document.getElementById(id).style.borderStyle="solid";
	document.getElementById(id).style.borderColor="red";
	document.getElementById(id).focus();
}