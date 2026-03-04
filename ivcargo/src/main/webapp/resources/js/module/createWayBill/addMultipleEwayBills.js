var textBoxCount = 1;
var escapePressed = false;
var closeOrSubmitClicked = false;
var conrDetails = {};
var coneeDetails = {};
var billingDetails = {};
var mainDetailsObj = {};
var ewaybillValidDetails = {};
let setConrAddressFromEwaybillNoAPI = false;
let setConeeAddressFromEwaybillNoAPI = false;

function addMultipleEwayBillNo() {
	isValidateEwaybillFromPopup = true;
	eWayBillNumberArray = new Array();
	isFromViewEWayBill	= false;
	$('.ewaybillViewMsg').remove();
	
	textBoxCount;
	$('#ewaybill0').focus();
	$('#ewaybill0').css("color", "#555");
	$('#ewaybill0').css("border", "1px solid #ccc");
	
	$("#addEwayBillModal").modal({
		backdrop: 'static',
		keyboard: false
	});
	
	if(configuration.showEwaybillPopUpOnLoad  == 'true' || accountGroupId == 442 || accountGroupId == 454 || accountGroupId == 467 || accountGroupId == 399 
			|| accountGroupId == 3 || accountGroupId == 285 || accountGroupId == 227 || accountGroupId == 466 || accountGroupId == 402
			|| accountGroupId == 233 || accountGroupId == 293 || accountGroupId == 573 || accountGroupId == 580 || accountGroupId == 592||  accountGroupId == 566 ||  accountGroupId == 544 || accountGroupId == 609 || accountGroupId == 617 || accountGroupId == 572 || accountGroupId == 644 || accountGroupId == 669 || accountGroupId == 581 || accountGroupId == 22 || accountGroupId == 709 || accountGroupId == 724 || accountGroupId == 520
			|| accountGroupId == 772 || accountGroupId == 792 || accountGroupId == 918
			) {
		escapePressed = false;
		closeOrSubmitClicked = false;
	
		$("#addEwayBillModal").on('keydown', function(e) {
			if (e.which == 27) {  //escape button // or enter on selected focus
				$('#addEwayBillModal').modal('hide');
	
				if($('#isValidEwaybillMsg').is(':visible'))
					escapePressed = true;
	
				$("#addMutipleEwayBill").click(function() {
					escapePressed = true;
				});
	
				setNextPrevAfterEwayBillEscape(escapePressed);
			}
		});
		
		$("#addMutipleEwayBill").click(function() {
			closeOrSubmitClicked = true;
		});
		
		$("#btnClose").click(function() {
			setNextPrevAfterEwayBillSubmit(closeOrSubmitClicked);
		});
		
	}
	setTimeout(function(){ $('#ewaybill0').focus(); }, 500);
}

function addNewRow() {
	let inputCount = document.getElementById('eWayBillNumberId').getElementsByTagName('input').length;

	for(let i = 0; i < inputCount; i++) {
		let ewaybillVal		= $('#ewaybill' + i).val();

		if(ewaybillVal == '') {
			showMessage('error', 'Enter E-Way Bill Number');
			$('#ewaybill' + i).css('border-color', 'red');
			$('#ewaybill' + i).focus();
			return false;
		} else if(ewaybillVal!= null && ewaybillVal.length != 12) {
			showMessage('error', '<i class="fa fa-times-circle"></i> Enter 12 digit E-Way Bill Number');
			$('#ewaybill' + i).focus();
			next	= "ewaybill"+ i;
			return false;
		}
	}

	$('#ewaybill0')
	.clone().val('')      // CLEAR VALUE.
	.attr('style', 'margin:3px 0;')
	.attr('id', 'ewaybill' + textBoxCount)     // GIVE IT AN ID.
	.appendTo("#eWayBillNumberId");

	textBoxCount = textBoxCount + 1;

	let	count	= textBoxCount - 1;
		next	= "ewaybill" + count;
		$('#ewaybill' + count).focus();
	
}

function resetModel() {
	if(document.getElementById('eWayBillNumberId') == null) return;
	
	let textBoxCount = document.getElementById('eWayBillNumberId').getElementsByTagName('input').length;
	$('#ewaybill0').val('');

	if (textBoxCount != 1) {
		for(let i = 1; i < textBoxCount; i++) {
			$('#ewaybill' + i).remove();
		}
	}
}

function removeTextValue() {
	if (textBoxCount != 1) {
		if(validateEwaybillNumberThroughApi) {
			if(eWayBillNumberArray != null && eWayBillNumberArray.length > 0) {
				for(let i = 0; i < eWayBillNumberArray.length; i++) {
					if(eWayBillNumberArray[i] == $('#ewaybill' + (textBoxCount - 1)).val().trim()) {
						if($('#ewaybillMsg' + i).exists())
							$('#ewaybillMsg' + i).remove();
						
						eWayBillNumberArray.splice(i,1);
					}
				}
			}
		}

		$('#ewaybill' + (textBoxCount - 1)).remove(); textBoxCount = textBoxCount - 1;
	}	
}

function addEwayBillData() {
	let inputCount = document.getElementById('eWayBillNumberId').getElementsByTagName('input').length;
	let temp = new Array();

	for(let i = 0; i < inputCount; i++) {
		let ewaybillVal		= $('#ewaybill' + i).val();
		
		if(ewaybillVal != undefined) {
			if(ewaybillVal == '' && inputCount == 1) {
				showMessage('error', 'Enter E-Way Bill Number');
				$('#ewaybill' + i).css('border-color', 'red');
				$('#ewaybill' + i).focus();
				return false;
			 } else if(ewaybillVal != '' && ewaybillVal.length != 12) {
				showMessage('error', '<i class="fa fa-times-circle"></i> Enter 12 digit E-Way Bill ' + ewaybillVal);
				$('#ewaybill' + i).css('border-color', 'red');
				$('#ewaybill' + i).focus();
				next	= "ewaybill" + i;
				return false;
			 }
			
			for(let j = 0; j < ewaybillVal.length; j++) {
				let code = ewaybillVal.charCodeAt(j);

				if(!(code >= 65 && code <= 91) && !(code >= 97 && code <= 121) && !(code >= 48 && code <= 57)) { 
					$('#ewaybill' + i).val('');
					$('#ewaybillNumber' + i).val('');
					showMessage('error', 'Enter Only Numbers !!');
					return false;
				}
			}
		}
	}

	if(validateEwaybillNumberThroughApi) {
		eWayBillNumberArray	= new Array();
		
		for(let i = 0; i < inputCount; i++) {
			if($('#ewaybill' + i).exists() && $('#ewaybill' + i).val() != '' && $('#ewaybill' + i).val().length == 12)
				eWayBillNumberArray.push($('#ewaybill' + i).val());
		}
	} else {
		if(checkBoxArray.length == 0) {
			for(let i = 0; i < inputCount; i++) {
				if($('#ewaybill' + i).exists() && $('#ewaybill' + i).val() != '')
					checkBoxArray.push($('#ewaybill' + i).val());
			}
		} else {
			for(let i = 0; i < inputCount; i++) {
				if($('#ewaybill' + i).exists() && $('#ewaybill' + i).val() != '' && !isValueExistInArray(checkBoxArray, $('#ewaybill' + i).val()))
					temp.push($('#ewaybill' + i).val());
			}
			
			if(temp.length > 0) {
				for(let i = 0; i < temp.length; i++)
					checkBoxArray.push(temp[i]);
			}
		}

		resetModel();
		textBoxCount = 1;
		$('#addEwayBillModal').modal('hide');
		if(accountGroupId == 854){
			$('#STPaidBy').focus();
		}
	}
	
	return true;
}

function addEwayBillDataAfterApiValidation() {
	if(document.getElementById('eWayBillNumberId')) {
		let inputCount = document.getElementById('eWayBillNumberId').getElementsByTagName('input').length;
		let temp = new Array();

		if(checkBoxArray.length == 0) {
			for(let i = 0; i < inputCount; i++) {
				if($('#ewaybill' + i).exists() && $('#ewaybill' + i).val() != ''
					&& typeof eWayBillValidationHM !== 'undefined' && eWayBillValidationHM != null) {
					for(let key in eWayBillValidationHM) {
						let eWayBillValidationDetails	= eWayBillValidationHM[key];

						if(eWayBillValidationDetails.ewaybillNumber == $('#ewaybill' + i).val().trim()
							&& eWayBillValidationDetails.validEWayBill)
								checkBoxArray.push($('#ewaybill' + i).val());
					}
				}
			}
		} else {
			for(let i = 0; i < inputCount; i++) {
				if(isValueExistInArray(checkBoxArray, $('#ewaybill' + i).val())) {
					showMessage('error', '<i class="fa fa-times-circle"></i>' + $("#ewaybill" + i).val() + ' E-Way Bill Number already added');
					return false;
				} else if(typeof eWayBillValidationHM !== 'undefined' && eWayBillValidationHM != null) {
					for(let key in eWayBillValidationHM) {
						let eWayBillValidationDetails	= eWayBillValidationHM[key];

						if(eWayBillValidationDetails.ewaybillNumber == $('#ewaybill' + i).val().trim()
							&& eWayBillValidationDetails.validEWayBill)
							temp.push($('#ewaybill' + i).val());
					}
				}
			}
			
			if(temp.length > 0 && typeof eWayBillValidationHM !== 'undefined' && eWayBillValidationHM != null) {
				for(const element of temp) {
					for(let key in eWayBillValidationHM) {
						let eWayBillValidationDetails	= eWayBillValidationHM[key];

						if(eWayBillValidationDetails.ewaybillNumber == element && eWayBillValidationDetails.validEWayBill)
							checkBoxArray.push(element);
					}
				}
			}
		}
		
		resetModel();
		textBoxCount = 1;
		$('#addEwayBillModal').modal('hide');
		if(accountGroupId == 854){
			$('#STPaidBy').focus();
		}

		if(configuration.showEwaybillPopUpOnLoad == 'true' && configuration.DefaultFormType == 1018) {
			$('#singleFormTypes').val(1018);
			$('#eWayBillNumberDiv').css('display', 'inline');
		}
		
		if(validateEwaybillNumberThroughApi || configuration.showEwaybillPopUpOnLoad == 'true') {
			if(checkBoxArray.length > 0) {
				$("#isValidEwaybillMsg").removeClass('hide');
				$("#noEwaybillMsg").addClass('hide');
			} else {
				$("#isValidEwaybillMsg").addClass('hide');
				$("#noEwaybillMsg").removeClass('hide');
				eWayBillHM	= {};
				eWayBillDetailsIdHM = {};
			}

			$('.ewaybillViewMsg').remove();
			
			if($('#sourceBranch').exists() && $('#sourceBranch').is(":visible")) {
				//$('#sourceBranch').focus();
			}
		}
	}	
}

function reCalculateEwayBillAfterApiValidation() {
	checkBoxArray	= new Array();
	
	$('#eWayBillDetails tr').each(function() {
		$(this).find('input').each(function() {
			if($(this).val() != '')
				checkBoxArray.push($(this).val());
		})
	});

	$('#myModal').modal('hide');
	$('.ewaybillViewMsg').remove();
	
	if(checkBoxArray.length > 0) {
		$("#isValidEwaybillMsg").removeClass('hide');
		$("#noEwaybillMsg").addClass('hide');
	} else {
		$("#isValidEwaybillMsg").addClass('hide');
		$("#noEwaybillMsg").removeClass('hide');
		eWayBillHM	= {};
		eWayBillDetailsIdHM = {};
	}
}

function viewEwayBillNo() {
	$("#myModal").modal({
		backdrop: 'static',
		keyboard: false
	});

	setTimeout(function(){
		if(checkBoxArray.length == 0) {
			$('#eWayBillDetails').html('&#9746; No records found !');
			return false;
		}

		$('#eWayBillDetails').empty();

		for(let i = 0; i < checkBoxArray.length; i++) {
			let row		= createRowInTable("eway" + i, '', '');

			let col		= createColumnInRow(row, "ewaybill_" + i, '', '95%', '', '', '');
			let col2	= createColumnInRow(row, "td_" + i, '', '5%', '', '', '');

			let inputAttr		= new Object();
			let input			= null;

			inputAttr.id			= 'ewaybillNumber' + i;
			inputAttr.type			= 'text';
			inputAttr.value			= checkBoxArray[i];
			inputAttr.name			= 'ewaybill' + i;
			inputAttr.class			= 'form-control';
			inputAttr.style			= 'width: 100%;text-align: left;';
			inputAttr.onkeyup		= 'validateEwayBillNumber(this);';
			inputAttr.onblur		= 'validateEwayBillNumber(this)';
			inputAttr.onkeypress	="return noNumbers(event)"
			inputAttr.maxlength	= 12;

			input	= createInput(col, inputAttr);
			input.attr( {
				'data-value' : i
			});

			let buttonRemoveJS		= new Object();
			let buttonRemove		= null;

			buttonRemoveJS.id		= 'remove' + i;
			buttonRemoveJS.name		= 'remove' + i;
			buttonRemoveJS.value	= 'Remove';
			buttonRemoveJS.type		= 'button';
			buttonRemoveJS.class	= 'btn btn-danger glyphicon glyphicon-remove';
			buttonRemoveJS.onclick	= 'removeEwayBill(this);';
			buttonRemoveJS.style	= 'width: 36px;';

			buttonRemove			= createButton(col2, buttonRemoveJS);
			buttonRemove.attr({
				'data-value' : i
			});

			col2.append('&emsp;');
			$('#eWayBillDetails').append(row);
		}
		//let eWayBillCount = document.getElementById('eWayBillDetails').getElementsByTagName('input').length;

		$('#btOk').prop('disabled', false);
		
	},100);
}

function resetEwayBillData() {
	$('#eWayBillDetails').empty();
	resetModel();
}

function validateEwayBill(eWaybill) {
	if(eWaybill.value.length == 12) {
		let textBoxCount = document.getElementById('eWayBillNumberId').getElementsByTagName('input').length;
		addNewRow();
		for(let i = 0; i < textBoxCount; i++) {
			let ele = document.getElementById('ewaybill' + i);
			
			if(eWaybill.id != ele.id) {
				if(eWaybill.value == $('#ewaybill' + i).val()) {
					showMessage('error', '<i class="fa fa-times-circle"></i> Enter another EwayBill No.');
					$('#' + eWaybill.id).val('');
					return false;
				} else
					$('#btSubmit').prop('disabled', false);
			} else if(accountGroupId == 374)
				$('#btAddNew').focus();
			else {
				$('#btSubmit').prop('disabled', false);
				$('#btSubmit').focus();
			}
		}
	}
}

function submitEWayBillData() {
	if(!addEwayBillData())
		return false;

	if(accountGroupId == 374)
		$('#STPaidBy').focus();
	else if(!validateEwayBillNumberByApi())
		return false;
	else if(accountGroupId == 573) {
		setTimeout(function() {
			$('#STPaidBy').focus();
			next = "STPaidBy";
		}, 2000);
	} else if(checkDisplayConditions('STPaidBy')) {
		if(accountGroupId == 383)
			next = "declaredValue";
		else if(accountGroupId == 434) {
			$('#deliveryTo').focus();
			next = "STPaidBy"
		} else if(accountGroupId == 740) {
			if (configuration.BranchCode == 'true' && !isAutoSequenceCounter) {
				if(isManual)
					$("#sourceBranch").focus();
				else
					$("#lrNumberManual").focus();	
			} else if(isManual)
				$("#sourceBranch").focus();
			else
				$("#destination").focus();	
		} else {
			$('#STPaidBy').focus();
			next = "STPaidBy";
			
			if (configuration.invoiceNumberBeforeFormType == 'false' && configuration.InvoiceNo == 'true') {
	 			$('#STPaidBy').keypress(function () {
					next = "invoiceNo";
	 			});
 			} else if (configuration.DeliveryAt == 'true') {
				$('#STPaidBy').keypress(function () {
					next = "deliveryTo";
	 			});
			}
		}
	} else {
		$('#invoiceNo').focus();
		next = "invoiceNo";

		$('#invoiceNo').keypress(function () {
			next	= 'declaredValue';
		});
	}
	
	setTimeout(function() {
		if(!$("#addEwayBillModal").is(":visible"))
			setNextPrevAfterEwayBillSubmit(closeOrSubmitClicked);
	}, 500);

	if(typeof calculateCustomFormCharge != 'undefined') calculateCustomFormCharge();
	setConvenienceCharge();
}

function validateEwayBillNumber(eWaybill) {
	if(eWaybill.value.length == 12) {
		let textBoxCount = document.getElementById('eWayBillDetails').getElementsByTagName('input').length;
		
		for(let i = 0; i < textBoxCount; i++) {
			let ele = document.getElementById('ewaybillNumber' + i);
			
			if(ele == null)
				continue;
			
			if(eWaybill.id != ele.id) {
				if(eWaybill.value == $('#ewaybillNumber' + i).val()) {
					showMessage('error', '<i class="fa fa-times-circle"></i> Enter another EwayBill No.');
					changeTextFieldColor(eWaybill.id, '', '', 'red');
					$('#' + eWaybill.id).val('');
					$('#' + eWaybill.id).focus();
					return false;
				} else {
					changeTextFieldColor(eWaybill.id, '', '', 'blue');
					$('#btOk').prop('disabled', false);
				}
			} else {
				changeTextFieldColor(eWaybill.id, '', '', 'blue');
				$('#btOk').prop('disabled', false);
			}
		}
	}
}

function reCalculateEwayBill() {
	//checkBoxArray	= new Array();
	textBoxCount	= 1;
	let eWayBillCount = document.getElementById('eWayBillDetails').getElementsByTagName('input').length;
	let validEwabill	= true;

	$('#eWayBillDetails tr').each(function() {
		$(this).find('input').each(function() {
			if($(this).val() == '') {
				showMessage('error', 'Enter E-Way Bill Number');
				validEwabill	= false;
			} else if($(this).val().length != 12) {
				showMessage('error', '<i class="fa fa-times-circle"></i> Enter 12 digit E-Way Bill ' + $(this).val());
				validEwabill	= false;
			}
		});
	});
	
	if(validEwabill) {
		if(validateEwaybillNumberThroughApi) {
			eWayBillNumberArray	= new Array();
			isFromViewEWayBill	= true;
			
			let inputCount = document.getElementById('eWayBillDetails').getElementsByTagName('input').length;
			
			if(inputCount > 0) {
				$('#eWayBillDetails tr').each(function() {
					$(this).find('input').each(function() {
						if($(this).val() != '')
							eWayBillNumberArray.push($(this).val());
					})
				});
				
				validateEwayBillNumberByApi();
			} else
				reCalculateEwayBillAfterApiValidation();
		} else {
			checkBoxArray	= new Array();
			
			$('#eWayBillDetails tr').each(function() {
				$(this).find('input').each(function() {
					if($(this).val() != '')
						checkBoxArray.push($(this).val());
				})
			});
			
			$('#myModal').modal('hide');
		}
	}

	if(typeof calculateCustomFormCharge != 'undefined') calculateCustomFormCharge();
}

function removeEwayBill(obj) {
	let dataValue 		= $(obj).data('value');
	let ewaybillNumber	= $('#ewaybillNumber' + dataValue).val();
	
	$('#eway' + dataValue).remove();
	$('#btOk').prop('disabled', false);
	
	if(checkBoxArray != undefined && checkBoxArray.length > 0)
		checkBoxArray 		= checkBoxArray.filter(item => item !== dataValue);
	
	if(eWayBillHM != undefined) {
		delete eWayBillHM[ewaybillNumber];
		setMultipleInvoiceAndDeclareValue();
	}
	
	if(eWayBillDetailsIdHM != undefined) {
		delete eWayBillDetailsIdHM[ewaybillNumber];
	}
	
	if(checkBoxArray.length == 0) {
		groupWiseCompanyId	= 0;
		groupWiseCompanyNameId	= 0;
	}
	
	$('#singleEwaybillNo').val('');
	setConvenienceCharge();
	if(typeof calculateCustomFormCharge != 'undefined') calculateCustomFormCharge();
}

function setConvenienceCharge() {
	if(configuration.setConvenienceChargeEwayBillWise == 'true') {
		let corporateBillingPartyId 		= $('#billingPartyId').val();
		let ewayBillCount  					= checkBoxArray.length;
		let	branchId 			 			= configuration.branchIdForConvenienceCharge.split(',');
		let	billingPartyId 		 			= configuration.billingPartyIdForConvenienceCharge.split(',');
		let bracnhIdsForDisableCharges		= configuration.bracnhIdsForDisableCharges;
		let bracnhIdsForDisableChargesArr	= bracnhIdsForDisableCharges.split(",")
		
		if(isValueExistInArray(bracnhIdsForDisableChargesArr, executive.branchId)
			|| $('#wayBillType').val() == WAYBILL_TYPE_FOC)
				 $('#charge' + BookingChargeConstant.CONVENIENCE).val(0);
		else if(isValueExistInArray(branchId, executive.branchId) && isValueExistInArray(billingPartyId, corporateBillingPartyId))
			$('#charge' + BookingChargeConstant.CONVENIENCE).val(ewayBillCount * 10);
		else
			$('#charge' + BookingChargeConstant.CONVENIENCE).val(ewayBillCount * configuration.ConvenienceChargeAmountPerEwayBill);
			
		calcTotal();
	}
}

function setNextFocus() {
	if(accountGroupId == 466)
		return;
	
	if(accountGroupId == 526 && $('#invoiceDate').exists())
		next = "invoiceDate";
	else if($('#STPaidBy').exists())
		next = "STPaidBy";
	else if($('#invoiceNo').exists())
		next = "invoiceNo";
	else
		next = "declaredValue";
	
	if($('#purchaseOrderNumber').exists())
		next = "purchaseOrderNumber";
}

function setFocus() {
	let count = document.getElementById('eWayBillNumberId').getElementsByTagName('input').length;
	let ewayBillVal		= $('#ewaybill' + (count - 1)).val();
	
	if($('#ewaybill' + (count - 1)).val() == '') {
		showMessage('error', 'Enter E-Way Bill');
		$('#ewaybill' + (count - 1)).css('border-color', 'red');
		$('#ewaybill' + (count - 1)).focus();
		next = "ewaybill" + (count - 1);
		return false;
	} else if(ewayBillVal.length != 12) {
		showMessage('error', 'Enter 12 digit E-Way Bill Number');
		$('#ewaybill' + (count - 1)).focus();
		next = "ewaybill" + (count - 1);
		return false;
	} 
	
	if(ewayBillVal != '' && ewayBillVal.length == 12)
		next = "btSubmit";
}

function validateEwayBillNumberByApi() {
	if(validateEwaybillNumberThroughApi
		&& eWayBillNumberArray != null && eWayBillNumberArray.length > 0) {
			showLayer();

			eWayBillValidationHM	= new Map();
			let jsonObject			= new Object();

			jsonObject.eWayBillNumberArray	= eWayBillNumberArray.join(",");
			jsonObject.moduleId             = 105;
			jsonObject.allowPartyPopupOnEwayBillsGstNumber	= configuration.allowPartyPopupOnEwayBillsGstNumber;
			
			$.ajax({
				type		: 	"POST",
				url			: 	WEB_SERVICE_URL + '/FetchEwayBillDataWS/validateEwayBillNumberByApi.do',
				data		:	jsonObject,
				dataType	: 	'json',
				success		: 	function(data) {
					hideLayer();
					
					if(data == undefined) {
						showMessage('error', 'No Record Found !');
						return;
					}
					
					if(data.message != undefined && data.message.messageId == GOVT_EWAYBILL_SITE_ISSUE) {
						showMessage(data.message.typeName, data.message.description);
						$('#singleEwaybillNo').val('');
						return;
					}
						
					if(data.exceptionCode == 404) {
						showMessage('error', 'Server not found !');
						
						eWayBillNumberArray	= new Array();
						let inputCount = textBoxCount;
					
						for(let i = 0; i < inputCount; i++) {
							if($('#ewaybill' + i).exists() && $('#ewaybill' + i).val() != '' && $('#ewaybill' + i).val().length == 12) {
								eWayBillNumberArray.push($('#ewaybill' + i).val());
								checkBoxArray.push($('#ewaybill' + i).val());
							}
						}

						resetModel();
						textBoxCount = 1;
						$('#addEwayBillModal').modal('hide');
						
						if(accountGroupId == 854)
							$('#STPaidBy').focus();
						
						return;
					}
					
					ewaybillValidDetails  	= data.ewaybillDetailsObj;

					if(data.exceptionCode == 204 && (configuration.showExtraSingleEwaybillField == 'true' || configuration.showExtraSingleEwaybillField == true)) {
						setTimeout(() => {showMessage('error', 'Enter Valid E-Way Bill Number !');},0);
						
						$("#isValidEwaybillMsg").addClass('hide');
						removeEwaybillFromArray();
						
						if(configuration.resetSingleEWayBillField == 'true' || configuration.resetSingleEWayBillField == true)
							$('#singleEwaybillNo').val('');
							
						$("#singleEwaybillNo").focus();
						return;
					}

					eWayBillValidationHM 	= data.eWayBillValidationHM;
					
					if(data.eWayBillHM != undefined) {
						for (let key in data.eWayBillHM)
							eWayBillHM[key] = (data.eWayBillHM)[key];
					}
					
					if(data.eWayBillDetailsIdHM != undefined) {
						for (let key in data.eWayBillDetailsIdHM)
							eWayBillDetailsIdHM[key] = (data.eWayBillDetailsIdHM)[key];
					}
					
					if(configuration.autoSelectEwaybillFormTypeOnSingleEwaybillInput == 'true' && (configuration.FormsWithSingleSlection == 'true' || configuration.FormsWithMultipleSelection == 'true'))
						selectEwaybillDropDownOnSingleEwaybill();
					
					if((configuration.showExtraSingleEwaybillField == 'true' || configuration.showExtraSingleEwaybillField == true)
					&& $('#singleEwaybillNo').val() != ''
					&& typeof eWayBillValidationHM !== 'undefined' && eWayBillValidationHM != null) {
						for(let key in eWayBillValidationHM) {
							let eWayBillValidationDetails	= eWayBillValidationHM[key];
						
							if(!eWayBillValidationDetails.validEWayBill) {
								setTimeout(() => {showMessage('error', 'Enter Valid E-Way Bill Number !');},100);
								
								$("#isValidEwaybillMsg").addClass('hide');
								removeEwaybillFromArray();
								
								if(configuration.resetSingleEWayBillField == 'true' || configuration.resetSingleEWayBillField == true)
									$('#singleEwaybillNo').val('');
									
								$("#singleEwaybillNo").focus();
								return;
							}		
						}
					}
					
					if((configuration.validateDuplicateEwaybillNumberOnLrNumber == 'true' || configuration.validateDuplicateEwaybillNumberOnLrNumber == true) 
					 && typeof eWayBillValidationHM !== 'undefined' && eWayBillValidationHM != null) {
						for(let key in eWayBillValidationHM) {
							let ewayBillDetail	= eWayBillValidationHM[key];
						
							if(ewayBillDetail.usedEWayBillNumber) {
								showMessage('error', "E-Waybill number is already added in this LR. " + ewayBillDetail.usedEwayBillLrNo);
								
								$("#isValidEwaybillMsg").addClass('hide');
								removeEwaybillFromArray();
								
								if(configuration.resetSingleEWayBillField == 'true' || configuration.resetSingleEWayBillField == true)
									$('#singleEwaybillNo').val('');
									
								$("#singleEwaybillNo").focus();
								return;
							}		
						}
					}
					
					if(data.setInvoiceNoFromEwaybillNoAPI != undefined && data.setInvoiceNoFromEwaybillNoAPI) {
						if(data.getEwaybillDetails != undefined)
							$("#invoiceNo").val(data.getEwaybillDetails.documentNo);
						
						if(ewaybillValidDetails != undefined) {
							$("#invoiceNo").val(ewaybillValidDetails.document_number);
		
							if(ewaybillValidDetails.documentNo != undefined)
								$("#invoiceNumber").val(ewaybillValidDetails.documentNo);
						}
					}

					setConrAddressFromEwaybillNoAPI		= data.setConrAddressFromEwaybillNoAPI != undefined && data.setConrAddressFromEwaybillNoAPI;
					setConeeAddressFromEwaybillNoAPI	= data.setConeeAddressFromEwaybillNoAPI != undefined && data.setConeeAddressFromEwaybillNoAPI;

					if(setConrAddressFromEwaybillNoAPI) {
						if(data.getEwaybillDetails != null && data.getEwaybillDetails != undefined
							&& data.getEwaybillDetails.consginorAddress != undefined && data.getEwaybillDetails.consginorAddress != "" && data.getEwaybillDetails.consginorAddress != null) 
								$("#consignorAddress").val(data.getEwaybillDetails.consginorAddress);
						
						if(ewaybillValidDetails != null && ewaybillValidDetails != undefined
							&& ewaybillValidDetails.consginorAddress != undefined && ewaybillValidDetails.consginorAddress != "" && ewaybillValidDetails.consginorAddress != null)
								$("#consignorAddress").val(ewaybillValidDetails.consginorAddress);
					}

					if(setConeeAddressFromEwaybillNoAPI) {
						if(data.getEwaybillDetails != null && data.getEwaybillDetails != undefined
							&& data.getEwaybillDetails.consgineeAddress != undefined && data.getEwaybillDetails.consgineeAddress != "" && data.getEwaybillDetails.consgineeAddress != null)
								$("#consigneeAddress").val(data.getEwaybillDetails.consgineeAddress);
						
						if(ewaybillValidDetails != null && ewaybillValidDetails != undefined
							&& ewaybillValidDetails.consginorAddress != undefined && ewaybillValidDetails.consgineeAddress != "" &&  ewaybillValidDetails.consgineeAddress != null)
								$("#consigneeAddress").val(data.getEwaybillDetails.consgineeAddress);
					}
					
					let showPartyDataByEwaybillApi	= configuration.showDataByEwaybillApiOnBookingScreen == "true" || configuration.showDataByEwaybillApiOnBookingScreen == true;

					if(configuration.branchWiseShowDataByEwaybillApi == "true" || configuration.branchWiseShowDataByEwaybillApi == true) {
						let branchArr	= (configuration.branchIdsForShowDataByEwaybillApi).split(",");
						showPartyDataByEwaybillApi	= isValueExistInArray(branchArr, executive.branchId);
					}

					if(typeof eWayBillValidationHM !== 'undefined' && eWayBillValidationHM != null) {
						if(showPartyDataByEwaybillApi) {
							if((configuration.allowPartyPopupOnEwayBillsGstNumber == 'true' || configuration.allowPartyPopupOnEwayBillsGstNumber == true)
								&& data.consignorGstnList != undefined && data.consigneeGstnList != undefined && data.consignorGstnList.length > 0 && data.consigneeGstnList.length > 0){
								showPartyDetailsPopUpOnMultipleGstn(data);
							} else
								showDataByEwaybillApi(data);
						}
						
						return validateEWayBillNumbers();
					}
				}
			});
	}

	return true;
}

function validateEWayBillNumbers() {
	
	if(validateEwaybillNumberThroughApi) {
		if(isFromViewEWayBill) {
			if(!displayEWayBillMsgOnViewEWayBill(eWayBillValidationHM))
				return false;
		} else if(!displayEWayBillMsg(eWayBillValidationHM))
			return false;
			
		if(allowToCheckSameCompanyGstnOnEwayBill && !checkCompanyNameOnGstn())
			return false;
					
		if(isFromViewEWayBill)
			reCalculateEwayBillAfterApiValidation();
		else
			addEwayBillDataAfterApiValidation();
	}
	
	if(isTokenThroughLRBooking && (ewaybillValidDetails == null || ewaybillValidDetails == undefined)) {
		$("#isValidEwaybillMsg").addClass('hide');
		removeEwaybillFromArray();
	}

	if(typeof calculateCustomFormCharge != 'undefined') calculateCustomFormCharge();
	setConvenienceCharge();
	return true;
}

function removeEwaybillFromArray() {
	let ewaybillVal = $('#singleEwaybillNo').val();
	
	if(typeof eWayBillNumberArray !== 'undefined' && eWayBillNumberArray != null && eWayBillNumberArray.includes(ewaybillVal)) {
		eWayBillNumberArray = eWayBillNumberArray.filter(item => item !== ewaybillVal);
		checkBoxArray 		= checkBoxArray.filter(item => item !== ewaybillVal);
	}
}

function displayEWayBillMsg(eWayBillValidationHM) {
	
	//	let inputCount = document.getElementById('eWayBillNumberId').getElementsByTagName('input').length;
	let inputCount = 0;
	const parentEl = document.getElementById('eWayBillNumberId');

	if (parentEl !== null) {
		inputCount = parentEl.getElementsByTagName('input').length;
	}
	
	let isInvalidEWayBill	= false;
	$('.ewaybillViewMsg').remove();
	
	for(let i = 0; i < inputCount; i++) {
		if($('#ewaybill' + i).exists() && $('#ewaybill' + i).val() != '') {
			if(typeof eWayBillValidationHM !== 'undefined' && eWayBillValidationHM != null) {
				for(let key in eWayBillValidationHM) {
					let eWayBillValidationDetails	= eWayBillValidationHM[key];
					
					if($('#ewaybill' + i).val().trim() == eWayBillValidationDetails.ewaybillNumber) {
						if(eWayBillValidationDetails.validEWayBill) {
							changeTextFieldColor('ewaybill' + i , '', '', 'green');
							$('#ewaybill' + i).css("color", "green").val(eWayBillValidationDetails.ewaybillNumber);
							$('#ewaybill' + i).after( "<span class='ewaybillViewMsg' id='ewaybillMsg" + i +"' style='display:block'><font color='green'><b>Valid E-WayBill</b></font></span>");
						} else {
							changeTextFieldColor('ewaybill' + i, '', '', 'red');
							$('#ewaybill' + i).css("color", "red").val(eWayBillValidationDetails.ewaybillNumber);
							$('#ewaybill' + i).after( "<span class='ewaybillViewMsg' id='ewaybillMsg" + i +"' style='display:block'><font color='red'><b>Invalid E-WayBill</b></font></span>");
							isInvalidEWayBill = true;
						}
					} 
				}
			}
		}
	}

	return !isInvalidEWayBill;
}

function displayEWayBillMsgOnViewEWayBill(eWayBillValidationHM) {
	let isInvalidEWayBill	= false;
	$('.ewaybillViewMsg').remove();
	
	$('#eWayBillDetails :input').map(function() {
		let type = $(this).prop("type");
		
		if(type == "text") {
			if(typeof eWayBillValidationHM !== 'undefined' && eWayBillValidationHM != null) {
				for(let key in eWayBillValidationHM) {
					let eWayBillValidationDetails	= eWayBillValidationHM[key];
					
					if($(this).val().trim() == eWayBillValidationDetails.ewaybillNumber) {
						if(!eWayBillValidationDetails.validEWayBill) {
							changeTextFieldColor($(this).id, '', '', 'red');
							$('#' + $(this).id).css("color", "red").val(eWayBillValidationDetails.ewaybillNumber);
							$('#' + $(this).id).after( "<span class='ewaybillViewMsg' id='ewaybillViewMsg" + $(this).data('value') +"' style='display:block'><font color='red'><b>Invalid E-WayBill</b></font></span>");
							isInvalidEWayBill = true;
						} else {
							changeTextFieldColor($(this).id , '', '', 'green');
							$('#' + $(this).id).css("color", "green").val(eWayBillValidationDetails.ewaybillNumber);
							$('#' + $(this).id).after( "<span class='ewaybillViewMsg' id='ewaybillViewMsg" + $(this).data('value') +"' style='display:block'><font color='green'><b>Valid E-WayBill</b></font></span>");
						}
					} 
				}
			}
		}
	});
	
	return !isInvalidEWayBill;
}

function showDataByEwaybillApi(data) {
	let ewayBillData 		= data.ewaybillDetailsObj;
	let ewayBilldetails		= data.getEwaybillDetails;
	
	let consignorGstn 	= null;
	let consigneeGstn 	= null;
	let declareValue	= 0;
	let consginorName	= null;
	let consgineeName	= null;
	let consignorAddress	= null;
	let consigneeAddress	= null;
							
	if(ewayBillData) {
		if(ewayBillData.gstin_of_consignor && ewayBillData.gstin_of_consignor != "")
			consignorGstn = ewayBillData.gstin_of_consignor;
									
		if(ewayBillData.gstin_of_consignee && ewayBillData.gstin_of_consignee != "")
			consigneeGstn = ewayBillData.gstin_of_consignee;
									
		if(ewayBillData.declareValue > 0)
			declareValue	= ewayBillData.declareValue;
			
		consignorAddress	= ewayBillData.consginorAddress;
		consigneeAddress	= ewayBillData.consgineeAddress;
	}
							
	if(ewayBilldetails) {
		consginorName	= ewayBilldetails.consginorName;
		consgineeName	= ewayBilldetails.consgineeName;
				
		if(consignorGstn == null)
			consignorGstn = ewayBilldetails.gstin_of_consignor;
									
		if(consigneeGstn == null)
			consigneeGstn = ewayBilldetails.gstin_of_consignee;
								
		if(declareValue == 0)
			declareValue = ewayBilldetails.declareValue;
			
		consignorAddress	= ewayBilldetails.consginorAddress;
		consigneeAddress	= ewayBilldetails.consgineeAddress;
	}
							
	$("#declaredValue").val(declareValue);
	
	setMultipleInvoiceAndDeclareValue();
	
	if(consignorGstn != null && consignorGstn != undefined) {
		consignorGstn	= consignorGstn.trim();
		
		if(consignorGstn.toUpperCase() == configuration.urpValidationConstant) {
			consignorGstn  = null
			configuration.ConsignorNameAutocomplete = 'false';
		}
	}
	
	if(consigneeGstn != null && consigneeGstn != undefined) {
		consigneeGstn	= consigneeGstn.trim();
		
		if(consigneeGstn.toUpperCase() == configuration.urpValidationConstant) {
			consigneeGstn  = null
			configuration.ConsigneeNameAutocomplete = 'false';
		}
	}
	
	let jsonObject				= new Object();
	jsonObject.consignorGstn		= consignorGstn;
	jsonObject.consigneeGstn		= consigneeGstn;
	jsonObject.consignorName		= consginorName;
	jsonObject.consigneeName		= consgineeName;
	jsonObject.consignorAddress		= consignorAddress;
	jsonObject.consigneeAddress		= consigneeAddress;
	
	if(ewayBillData != undefined && $('#consignorName').val() == '' && $('#consigneeName').val() == ''
		|| ewayBillData != undefined && $('#consignorName').val() != '' && $('#consigneeName').val() != '' && executive.accountGroupId == 3)
		partyCheckingOnGstNumber(jsonObject);
}

function partyCheckingOnGstNumber(jsonObject) {
	jsonObject.isAlloWPartyAtAnyLevel	= true;
	jsonObject.isTokenWayBill		= isTokenWayBill;
	jsonObject.singleEwaybillNo		= $('#singleEwaybillNo').val();
	jsonObject.destinationBranchId	= $('#destinationBranchId').val();
	jsonObject.wayBillTypeId		= $('#wayBillType').val();
	jsonObject.applyRateAuto		= !isManualWayBill && (configuration.applyRateAuto == 'true' || configuration.applyRateAuto == true) || isManualWayBill && (configuration.ApplyRateInManual == 'true' || configuration.ApplyRateInManual == true);
	
	if((configuration.showExtraSingleEwaybillFieldBranchWise == 'true' || configuration.showExtraSingleEwaybillFieldBranchWise == true) && $('#destination').val() == ""){
		if(showEwayBillPopupOnLoad == false || showEwayBillPopupOnLoad == 'false'){
			$("#destination").focus();
			showMessage('error', 'Enter Destination !');
			return false;
		}
	} else {
		showLayer();

		$.ajax({
			type: "POST",
			url: WEB_SERVICE_URL + '/partyMasterWS/checkAndInsertPartyOnGSTEwaybill.do',
			data: jsonObject,
			dataType: 'json',
			success: function(data) {
				let consignorDetails = data.ConsignorDetails;
				let consigneeDetails = data.ConsigneeDetails;
				isConsignorTBBParty	= data.isConsignorTBBParty;
				isConsigneeTBBParty	= data.isConsigneeTBBParty;
					
				doNotAllowTBBPartyForConsignorAndConsigneeInPaidAndToPayBooking(isConsignorTBBParty, isConsigneeTBBParty);
						
				if (!isTokenWayBill) {
					if (data.wayBillRates) {
						wayBillRates 				= data.wayBillRates;
						consignorPartyWayBillRates 	= data.consignorPartyWayBillRates;
						consigneeWayBillRates 		= data.consigneeWayBillRates;
						isBranchRate 				= data.isBranchRate;
						freightRatePartyId			= data.corporateAccountId;
					}

					if (data.chargesConfigRates) {
						chargesConfigRates 				= data.chargesConfigRates;
						destinationWiseLRLevelCharges 	= data.destinationWiseLRLevelCharges;
						consignorPartyChargeConfigRates = data.consignorPartyChargeConfigRates;
						consigneeChargeConfigRates 		= data.consigneeChargeConfigRates;
						isBranchChargeConfigRate 		= data.isBranchChargeConfigRate;
					}

					if (data.chargeWeightConfig)
						chargeWeightConfig = data.chargeWeightConfig;

					if (data.packingTypeList != undefined)
						packingTypeList = data.packingTypeList;

					if (data.consignmentGoodsListHM != undefined)
						consignmentGoodsListHM = data.consignmentGoodsListHM;
				}

				hideLayer();

				cnorPartyDeliveryAt = 0
				cneePartyDeliveryAt	= 0;
							
				if (consignorDetails != undefined) {
					isConsignorGSTNPresent = true;
					cnorPartyDeliveryAt	= consignorDetails.deliveryAt;
					setConsignorEwaybill(consignorDetails, jsonObject.consignorGstn);
					
					if(!isFtlBooking)
						getMinimumValueConfiguration(data, consignorDetails);
					
					if(configuration.showExtraSingleEwaybillFieldBranchWise == 'true' || configuration.showExtraSingleEwaybillFieldBranchWise == true)
						AddRemoveRateTypeOptions(CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_ID, 'partyMasterId');
				} else {
					$("#consignorName").val(jsonObject.consignorName);
				}

				if (consigneeDetails != undefined) {
					cneePartyDeliveryAt	= consigneeDetails.deliveryAt;
					setConsigneeEwaybill(consigneeDetails, jsonObject.consigneeGstn);
										
					if(configuration.showExtraSingleEwaybillFieldBranchWise == 'true' || configuration.showExtraSingleEwaybillFieldBranchWise == true)
						AddRemoveRateTypeOptions(CustomerDetails.CUSTOMER_TYPE_CONSIGNEE_ID, 'consigneePartyMasterId');
				} else {
					$("#consigneeName").val(jsonObject.consigneeName);
				}

				if ((configuration.showExtraSingleEwaybillField == 'true' || configuration.showExtraSingleEwaybillField == true)
					&& $('#singleEwaybillNo').val() > 0) {
					if (isTokenWayBill && isTokenThroughLRBooking) {
						setTimeout(function() {
							applyRateThroughTokenAndEwaybill();//Rate_442.js
						}, 300);

						setTimeout(function() {
							if (isFreightChargeEnable && $('#consignorName').val() != '' && $('#consigneeName').val() != ''
								&& ($('#chargeType').val() == null || Number($('#chargeType').val()) == 0)) {
								$("#chargeType").focus();
							}
						}, 350);
					} else if (!isTokenWayBill && consignorDetails != undefined && consigneeDetails != undefined) {
						if($('#billingPartyId').val() == 0 && $('#wayBillType').val() == WAYBILL_TYPE_CREDIT) {
							$('#billingPartyName').focus();
							next = 'chargeType';
						} else
							$("#chargeType").focus();
					}
				}

				if ($('#destination').val() == "" && typeof ewaybillOperationFromTokenBooking !== 'undefined' && ewaybillOperationFromTokenBooking != undefined && !ewaybillOperationFromTokenBooking) {
					setFocusOnBookingType();
				} else {
					let famt = $('#charge' + BookingChargeConstant.FREIGHT).val();

					if (typeof ewaybillOperationFromTokenBooking !== 'undefined' && ewaybillOperationFromTokenBooking != undefined && ewaybillOperationFromTokenBooking) {
						//setFocusOnTokenDestn();
					} else if (!isValidateEwaybillFromPopup && famt < 0) {
						//$("#chargeType").focus();
					} else if (isValidateEwaybillFromPopup && $("#STPaidBy").val() != 0) {
						$("#STPaidBy").focus();
					} else if ((configuration.showExtraSingleEwaybillFieldBranchWise == 'true' || configuration.showExtraSingleEwaybillFieldBranchWise == true) && consignorDetails != undefined) {
						$("#chargeType").focus();
					} else {
						ewaybillsetNextPrev();
					}
					
					if(isValidGSTChecking()) {
						if($("#destination").val() == '')
							setFocusOnTokenDestn();
						else
							setfocusOnQuantity();							
					}
				}
				
				setDeliveryAtFromPartyMaster();
			}
		});
	}
}

function setConsignorEwaybill(party, gstn) {
	$("#consignorName").val(party.corporateAccountDisplayName);
	$("#consignorGstn").val(gstn);
	$("#consignoCorprGstn").val(gstn);
	$('#consignorEmail').val(party.corporateAccountEmailAddress);
	
	if(configuration.disablePartyEmailIfFromPartyMaster == 'true')
		$('#consignorEmail').prop('readonly', party.corporateAccountEmailAddress != undefined && party.corporateAccountEmailAddress != '');
	
	isValidConsignorGst		= true;
	validatedConsignorGst	= gstn;
	$("#consignorPhn").val(party.corporateAccountMobileNumber);
	
	if(party.smsRequiredId > 0) 
		$('#isSmsSendToConr').prop( "checked", true );
		
	if(configuration.disablePartyPhoneIfFromPartyMaster == 'true')
		$('#consignorPhn').prop('readonly', party.corporateAccountMobileNumber != undefined && party.corporateAccountMobileNumber != '');
	
	if(!setConrAddressFromEwaybillNoAPI || $("#consignorAddress").val() == '')
		$("#consignorAddress").val(party.corporateAccountAddress);
	
	$("#consignorCorpId").val(party.corporateAccountId);
	$("#partyMasterId").val(party.corporateAccountId);
	$('#partyOrCreditorId').val(party.corporateAccountId);
	
	if(party.corporateAccountTBBParty && $('#wayBillType').val() == WAYBILL_TYPE_CREDIT) {
		$('#billingPartyId').val(party.corporateAccountId);
		$('#billingPartyName').val(party.corporateAccountDisplayName);
		$('#billingPartyCreditorId').val(party.corporateAccountId);
		
		if(configuration.VolumetricWiseAddArticle == 'true')
			getPartyCftUnitAndValue(party);
	} else if(configuration.VolumetricWiseAddArticle == 'true' && $('#wayBillType').val() == WAYBILL_TYPE_PAID)
		getPartyCftUnitAndValue(party);
		
	if(configuration.IncreaseChargeWeight == 'true')
		getFlavourWiseChargeWeightToIncrease(party.corporateAccountId, CUSTOMER_TYPE_CONSIGNOR_ID);
}

function setConsigneeEwaybill(party, gstn) {
	$("#consigneeName").val(party.corporateAccountDisplayName);
	$("#consigneeGstn").val(gstn);
	$("#consigneeCorpGstn").val(gstn);
	$('#consigneeEmail').val(party.corporateAccountEmailAddress);
	
	if(configuration.disablePartyEmailIfFromPartyMaster == 'true')
		$('#consigneeEmail').prop('readonly', party.corporateAccountEmailAddress != undefined && party.corporateAccountEmailAddress != '');
	
	isValidConsigneeGst   = true;
	validatedConsigneeGst = gstn;
	$("#consigneePhn").val(party.corporateAccountMobileNumber);
	
	if(party.smsRequiredId > 0) 
		$('#isSmsSendToConee').prop( "checked", true );

	if(configuration.disablePartyPhoneIfFromPartyMaster == 'true')
		$('#consigneePhn').prop('readonly', party.corporateAccountMobileNumber != undefined && party.corporateAccountMobileNumber != '');
						
	if(!setConeeAddressFromEwaybillNoAPI || $("#consigneeAddress").val() == '')
		$("#consigneeAddress").val(party.corporateAccountAddress);
		
	$("#consigneeCorpId").val(party.corporateAccountId);
	$("#consigneePartyMasterId").val(party.corporateAccountId);
	
	if(configuration.VolumetricWiseAddArticle == 'true' && $('#wayBillType').val() == WAYBILL_TYPE_TO_PAY)
		getPartyCftUnitAndValue(party);
		
	if(configuration.IncreaseChargeWeight == 'true')
		getFlavourWiseChargeWeightToIncrease(party.corporateAccountId, CUSTOMER_TYPE_CONSIGNEE_ID);	
}

function setFocusOnTokenDestn() {
	$("#destination").focus();
	
	if($('#billingPartyId').val() == 0 && $('#wayBillType').val() == WAYBILL_TYPE_CREDIT && $("#consignorName").val() != '')
		next = 'billingPartyName';
	else if($("#chargeType").exists() && $("#consignorName").val() != '' && $("#consigneeName").val() != '') {
		if(accountGroupId == 201)
			next = 'quantity';
		else
			next = 'chargeType';
	}
}

function setfocusOnQuantity() {
	if($("#consignorName").val() == '')
		$("#consignorName").focus();
	else if($("#consigneeName").val() == '')
		$("#consigneeName").focus();
	else
		$("#quantity").focus();
}

function ewaybillsetNextPrev() {
	if(accountGroupId == 442 || accountGroupId == 399 ||  accountGroupId == 566 ||  accountGroupId == 544) {
		if($('#billSelectionDialog').is(':visible'))
			next = "billSelection";
	} else if(accountGroupId == 523 || accountGroupId == 233 || accountGroupId == 573 || accountGroupId == 567 || accountGroupId == 285 || accountGroupId == 580 || accountGroupId == 592 || accountGroupId == 609 || accountGroupId == 772 || accountGroupId == 750)
		$("#chargeType").focus();
	else if(accountGroupId == 201 || accountGroupId == 454 || accountGroupId == 617 || accountGroupId == 271  || accountGroupId == 39 || accountGroupId == 627  || accountGroupId == 221 || accountGroupId == 619|| accountGroupId == 226 || accountGroupId == 336 ||
	 accountGroupId == 650 || accountGroupId == 657 || accountGroupId == 669 || accountGroupId == 581 || accountGroupId == 22|| accountGroupId == 709 || accountGroupId == 724 || accountGroupId == 520 || accountGroupId == 740 || accountGroupId == 746 || accountGroupId == 744 || accountGroupId == 787 || accountGroupId == 768
	 || accountGroupId == 684
	 )
		$("#quantity").focus();
	else
		setFocusOnTokenDestn();
}

function setMultipleInvoiceAndDeclareValue() {
	if (isInsuranceServiceAllow && eWayBillHM != undefined) {
		invoiceDetailArray	= [];
		
		for(let key in eWayBillHM) {
			invoiceDetailArray.push(eWayBillHM[key]);
		}
		
		createInsurance(invoiceDetailArray);
	}
	
	if(configuration.addMultipleInvoiceAndDeclareValueOfAllEWaybill == 'false')
		return;
	
	let invoiceArr	= [];
	let declareArr	= [];
	
	for(let key in eWayBillHM) {
		let data	= eWayBillHM[key];
		
		if(data.invoiceNumber != undefined)
			invoiceArr.push(data.invoiceNumber);
			
		declareArr.push(data.declareValue);
	}
	
	$("#invoiceNo").val(invoiceArr.join("/"));
	$("#declaredValue").val(declareArr.reduce(function(pv, cv) { return pv + cv; }, 0));
	
	if(typeof calculateValuationCharge != 'undefined') calculateValuationCharge();
}

function checkCompanyNameOnGstn() {
	let groupWiseCompanyId = 0;

	if(isFromViewEWayBill) {
		let inputCoun1 = document.getElementById('eWayBillDetails').getElementsByTagName('input').length;
		
		if(inputCoun1 > 0) {
			for (let i = 0; i < inputCoun1; i++) {
				let ewayBillNo = $('#ewaybillNumber' + i).val();
				
				if (typeof eWayBillValidationHM !== 'undefined' && eWayBillValidationHM != null) {
					var eWayBillValidationObj = Object.values(eWayBillValidationHM).find(function(model) {
						return model.ewaybillNumber === ewayBillNo;
					});
		
					var dataObj = Object.values(groupWiseCompanyNameHm).find(function(model) {
						return model.groupWiseCompanyNameGstn === eWayBillValidationObj.transporterGstn;
					});
		
					if (groupWiseCompanyId > 0 && groupWiseCompanyId != dataObj.groupWiseCompanyNameId) {
						showMessage('error', 'Enter Same Company Eway Bill Number !');
						$('#ewaybillNumber' + i).val()
						return false;
					} else
						groupWiseCompanyId = dataObj.groupWiseCompanyNameId;
				}
			}
		} else 
			groupWiseCompanyId = 0;
	} else if(document.getElementById('eWayBillNumberId')) {
		let inputCount = document.getElementById('eWayBillNumberId').getElementsByTagName('input').length;
	
		for (let i = 0; i < inputCount; i++) {
			let ewayBillNo = $('#ewaybill' + i).val();
				
			if (typeof eWayBillValidationHM !== 'undefined' && eWayBillValidationHM != null) {
				var eWayBillValidationObj = Object.values(eWayBillValidationHM).find(function(model) {
					return model.ewaybillNumber === ewayBillNo;
				});
				
				var dataObj = Object.values(groupWiseCompanyNameHm).find(function(model) {
					return model.groupWiseCompanyNameGstn === eWayBillValidationObj.transporterGstn;
				});
	
				if (groupWiseCompanyId > 0 && groupWiseCompanyId != dataObj.groupWiseCompanyNameId) {
					showMessage('error', 'Enter Same Company Eway Bill Number !');
					$('#ewaybill' + i).val('');
					return false;
				} else
					groupWiseCompanyId = dataObj.groupWiseCompanyNameId;
			}
		}
	}
	
	if(isFromViewEWayBill)
		groupWiseCompanyNameId = groupWiseCompanyId;
		
	if (groupWiseCompanyNameId > 0 && groupWiseCompanyNameId == groupWiseCompanyId)
		groupWiseCompanyNameId = groupWiseCompanyId;
	else if (groupWiseCompanyNameId > 0 && groupWiseCompanyNameId != groupWiseCompanyId) {
		showMessage('error', 'Enter Same Company Eway Bill Number !');
		return false;
	} else
		groupWiseCompanyNameId = groupWiseCompanyId;

	return true;
}
