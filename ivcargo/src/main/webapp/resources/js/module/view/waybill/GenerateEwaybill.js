let idNumofConsignment = 0;
let GenconsignmentDataHM = {}

			
	
$('.Genclickable-legend-1').on('click', function() {
	$('.GenpartyDetail').toggleClass('hide')
	$('#Genarrow-icon1').toggleClass('arrowrotate')
	$('#GenpartyDetailsDiv').toggleClass('scheduler-border')
})


$(document).ready(function() {

	$(function() {
		$("#GeninvoiceDateEle").datepicker({
            dateFormat: 'dd/mm/yy', 
            maxDate: 0
        });
	});
}) 

for (let packing of packingTypeList) {
	operationOnSelectTag('GenpackingTypeEle', 'addNew', packing.packingTypeName, packing.packingTypeId)
}
$("#GenconsignorGstnEle").blur(function() {
    validateGstNumberByApi(1);
});
$("#GenconsigneeGstnEle").blur(function() {
    validateGstNumberByApi(2);
});
$("#GenhsnCodeEle").blur(function(event) {
	getSaidToContainOnHSNCode(this);
});

$('#GenaddConsignmentEle').click(async function(event) {

	if (validatePartyDetails() && validateAddArticle()) {
		if ($('#GenmyTable thead tr').length == 0)
				addConsignmentTableStructure();
				addConsignment();
	}

});

$('#GenquantityEle').on('keyup', function(event) {
	if (event.keyCode === 13) {
		$('.GenpartyDetail').addClass('hide')
		$('#Genarrow-icon1').addClass('arrowrotate')
		$('#GenpartyDetailsDiv').addsClass('scheduler-border')
	}
})		
/*$('#GensaidToContainEle').on('change', function() {
	$('#GenpackingTypeEle').focus()
});*/

function generateEwaybill() {
	if ($('#GenmyTable tbody tr').length ==0){
		showmessage('error','Please add atleast one consignment !')
		return false;
	}else if(!validatePartyDetails()){
		return false;
	}
	
	let jsonObject = getDataToGenerateEwayBill();
	
	showLayer();

	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL+'/tceBookingWS/processEWayBillGeneration.do?',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(response) {
			console.log('respajaxonse ',response)
			if(response.eWaybillGenerated && response.ewayBillNo){
				showMessage('success',`Your E-Way Bill Generated ${response.ewayBillNo} `)
				setEwayBillResponse(response);
				hideLayer();
			}else{
				showMessage('error',` ${response.exceptionString} `)
				hideLayer();
			}
		}
	});
		
}
function getDataToGenerateEwayBill() {
			let itemList 	= [];
			
			//itemList.push(GenconsignmentDataHM);
			for (let k in GenconsignmentDataHM) {
				itemList.push(GenconsignmentDataHM[k]);
			}
			
			let finalObj = new Object();
			finalObj.item_list 				= JSON.stringify(itemList);
			finalObj.invoiceDates			= $('#GeninvoiceDateEle').val()
			finalObj.invoiceNumber			= $('#GeninvoiceNumberEle').val()
			finalObj.consignorGstn 			= $('#GenconsignorGstnEle').val()
			finalObj.consignorName 			= $('#GenconsignorNameEle').val()
			finalObj.consignorPincode		= $('#GenconsignorPincodeEle').val();
			finalObj.consignorAddress 		= $('#GenconsignorAddressEle').val()
			finalObj.place_of_consignor		= $('#GenconsignorPlaceEle').val()
			finalObj.state_of_consignor		= $('#GenconsignorStateEle').val()
						
			finalObj.consigneeGstn 			= $('#GenconsigneeGstnEle').val()	
			finalObj.consigneeName 			= $('#GenconsigneeNameEle').val();
			finalObj.consigneePincode		= $('#GenconsigneePincodeEle').val();
			finalObj.consigneeAddress 		= $('#GenconsigneeAddressEle').val();
			finalObj.place_of_consignee		= $('#GenconsigneePlaceEle').val()
			finalObj.state_of_consignee		= $('#GenconsigneeStateEle').val()
			
			return finalObj;
			
	}
	
function setEwayBillResponse(response){
			$('#GenerateEwayBill').find('input, select, textarea').each(function () {
		     if (this.type === 'text' || this.type === 'number' || this.type === 'email' || this.type === 'textarea') {
			 	$(this).val(''); // Clear text, number, email, and textarea fields
			 } else if (this.type === 'checkbox' || this.type === 'radio') {
				 $(this).prop('checked', false); // Uncheck checkboxes and radio buttons
			 } else if (this.tagName === 'SELECT') {
				$(this).prop('selectedIndex', 0); // Reset select dropdowns
			 }
		});
					
	$('#GenmyTable thead').empty();
	$('#GenmyTable tbody').empty();

	$('#GenerateEwayBill').modal('hide');
	$('#ewaybillEle').val(response.ewayBillNo);
	$('#ewaybillEle').blur();
}		

function deleteConsignmentTableRow(deleteButtonId){
	idNumofConsignment--;
			let num = deleteButtonId;
			let indexVal = Number(num.split('_')[1]);
			$('#GenarticleTableRow_' + indexVal).remove();
			delete GenconsignmentDataHM[indexVal];
			
			if (Object.keys(GenconsignmentDataHM).length === 0) {
				$('#GenconsignmentTables').addClass('hide');
			}
}

function addConsignmentTableStructure() {
	let tr = $('<tr>');
	tr.append('<th class="routeth" style="background-color:#0073BA; color:white; font-size:18px; text-align: center;	padding: 5px; white-space: nowrap;" >Qty</th>');
	tr.append('<th class="routeth" style="background-color:#0073BA; color:white; font-size:18px; text-align: center;	padding: 5px; white-space: nowrap;">Packing Type</th>');
	tr.append('<th class="routeth" style="background-color:#0073BA; color:white; font-size:18px; text-align: center;	padding: 5px; white-space: nowrap;">Said To Contain</th>');
	tr.append('<th class="routeth" style="background-color:#0073BA; color:white; font-size:18px; text-align: center;	padding: 5px; white-space: nowrap;">HSN Code</th>');
	tr.append('<th class="routeth" style="background-color:#0073BA; color:white; font-size:18px; text-align: center;	padding: 5px; white-space: nowrap;"> Amount </th>');
	tr.append('<th class="routeth" style="background-color:#0073BA; color:white; font-size:18px; text-align: center;	padding: 5px; white-space: nowrap;">CGST Rate </th>');
	tr.append('<th class="routeth" style="background-color:#0073BA; color:white; font-size:18px; text-align: center;	padding: 5px; white-space: nowrap;">SGST Rate </th>');
	tr.append('<th class="routeth" style="background-color:#0073BA; color:white; font-size:18px; text-align: center;	padding: 5px; white-space: nowrap;">IGST Rate </th>');
	tr.append('<th class="routeth" style="background-color:#0073BA; color:white; font-size:18px; text-align: center;	padding: 5px; white-space: nowrap;">CESS Rate </th>');
	
	$('#GenmyTable thead').append(tr);
}

function addConsignment(){
	let consignmentObject = {};
			
			let quantity 			= $('#GenquantityEle').val();
			let packingTypeId 		= $('#GenpackingTypeEle').val();
			let packingType 		= $("#GenpackingTypeEle option:selected").text();
			//let consignmentGoodsId 	= $('#GensaidToContainEle').val();
			let saidToContain 		= $("#GensaidToContainEle option:selected").text();
			let hsnCode 			= $('#GenhsnCodeEle').val();
			let amount 				= $('#GenamountEle').val();
			let cgstRate 				= $('#GencgstRateEle').val();
			let sgstRate 				= $('#GensgstRateEle').val();
			let igstRate 				= $('#GenigstRateEle').val();
			let cessRate 				= $('#GencessRateEle').val();
			
			consignmentObject.quantity 				= quantity;
			consignmentObject.packingTypeId 		= packingTypeId;
			consignmentObject.packingType 			= packingType;
			consignmentObject.saidToContain 		= saidToContain;
			consignmentObject.amount 				= amount;
			consignmentObject.hsnCode 				= hsnCode;
			consignmentObject.cgstRate 				= cgstRate;
			consignmentObject.sgstRate 				= sgstRate;
			consignmentObject.igstRate 				= igstRate;
			consignmentObject.cessRate 				= cessRate;
				
			
			idNumofConsignment++;
			GenconsignmentDataHM[idNumofConsignment] = consignmentObject;
				
			let tr = $('<tr class="text-center" id = "GenarticleTableRow_' + idNumofConsignment + '">');

			tr.append('<td>' + quantity + '</td>');
			tr.append('<td>' + packingType + '</td>');
			tr.append('<td class="elipsis" data-bs-toggle="tooltip" title="'+saidToContain+'" >' + saidToContain + '</td>');
			tr.append('<td>' + hsnCode + '</td>');
			tr.append('<td>' + amount + '</td>');
			tr.append('<td>' + cgstRate + '</td>');
			tr.append('<td>' + sgstRate + '</td>');
			tr.append('<td>' + igstRate + '</td>');
			tr.append('<td>' + cessRate + '</td>');
			tr.append('<td>' + "<button id='deleteConsignment_" + idNumofConsignment + "'class='deleteConsignment btn btn-danger' style='text-decoration: none;cursor:pointer'>Delete</button>" + '</td>');

			$('#GenconsignmentTables').removeClass('hide');
			$('#GenmyTable tbody').append(tr);

			$('.deleteConsignment').click(function(e) {
				e.stopPropagation()
				deleteConsignmentTableRow(this.id);
			});

			resetArticleDetails();
}

function resetArticleDetails(){
	$('#GenquantityEle').val('');
	$('#GenpackingTypeEle').val('');
	$('#GensaidToContainEle').html('');
	$('#GenhsnCodeEle').val('');
	$('#GenamountEle').val('');
	$('#GencgstRateEle').val('');
	$('#GensgstRateEle').val('');
	$('#GenigstRateEle').val('');
	$('#GencessRateEle').val('');
	$('#heightEle').val('');
}
function validateAddArticle() {
	if (!validateInputTextFeild(1, 'GenquantityEle', 'GenquantityEle', 'error', quantityErrMsg))
		return false;

	if (!validateInputTextFeild(1, 'GenpackingTypeEle', 'GenpackingTypeEle', 'error', articleTypeErrMsg))
		return false;

	if (!validateInputTextFeild(1, 'GensaidToContainEle', 'GensaidToContainEle', 'error', saidToContaionErrMsg))
		return false;

	if (!validateInputTextFeild(1, 'GenhsnCodeEle', 'GenhsnCodeEle', 'error', 'Enter hsn Code' ))
		return false;
		
	if (!validateInputTextFeild(1, 'GenamountEle', 'GenamountEle', 'error' , 'Enter Amount '))
		return false;
		
		if(Number($('#GencgstRateEle').val())> 0)	{
			if (!validateInputTextFeild(1, 'GensgstRateEle', 'GensgstRateEle', 'error', 'Enter SGST Rate'))
				return false;
		}
		if(Number($('#GensgstRateEle').val()) > 0)	{
			if (!validateInputTextFeild(1, 'GencgstRateEle', 'GencgstRateEle', 'error', 'Enter CGST Rate'))
				return false;
		}
		if(Number($('#GensgstRateEle').val()) <= 0 && Number($('#GencgstRateEle').val()) <= 0)	{
			if (!validateInputTextFeild(1, 'GenigstRateEle', 'GenigstRateEle', 'error', 'Enter IGST Rate'))
				return false;
		}
		if(Number($('#GensgstRateEle').val()) > 0 && Number($('#GencgstRateEle').val()) > 0 && Number($('#GenigstRateEle').val()) > 0)	{
			showMessage('error', 'CSGT SGST & IGST all rates cannot be applied at same time !');
				return false;
		}
	
	/*if (!validateInputTextFeild(1, 'GencgstRateEle', 'GencgstRateEle', 'error', 'Enter CGST Rate'))
		return false;
	
	if (!validateInputTextFeild(1, 'GensgstRateEle', 'GensgstRateEle', 'error', 'Enter SGST Rate'))
		return false;
	
	if (!validateInputTextFeild(1, 'GenigstRateEle', 'GenigstRateEle', 'error', 'Enter IGST Rate'))
		return false;
				
	if (!validateInputTextFeild(1, 'GencessRateEle', 'GencessRateEle', 'error', 'Enter CESS Rate'))
		return false;*/	
		
	return true;	
}		

function validatePartyDetails() {

	if (!validateInputTextFeild(1, 'GenconsignorGstnEle', 'GenconsignorGstnEle', 'error', 'Enter Consignor GST')
		|| !validateInputTextFeild(1, 'GenconsignorNameEle', 'GenconsignorNameEle', 'error', validPartyNameErrorMsg('Consignor'))
		|| !validateInputTextFeild(1, 'GenconsigneePincodeEle', 'GenconsigneePincodeEle', 'error', 'Enter Pincode ')
		|| !validateInputTextFeild(1, 'GenconsignorAddressEle', 'GenconsignorAddressEle', 'error', 'Enter Consignor Address')
		
		|| !validateInputTextFeild(1, 'GenconsigneeGstnEle', 'GenconsigneeGstnEle', 'error', 'Enter Consignee GST')
		|| !validateInputTextFeild(1, 'GenconsigneeNameEle', 'GenconsigneeNameEle', 'error', validPartyNameErrorMsg('Consignee'))
		|| !validateInputTextFeild(1, 'GenconsignorPincodeEle', 'GenconsignorPincodeEle', 'error', 'Enter Pincode ')
		|| !validateInputTextFeild(1, 'GenconsigneeAddressEle', 'GenconsigneeAddressEle', 'error', 'Enter Consignee Address')
		
		|| !validateInputTextFeild(1, 'GeninvoiceDateEle', 'GeninvoiceDateEle', 'error', 'Enter Invoice Date')
		|| !validateInputTextFeild(1, 'GeninvoiceNumberEle', 'GeninvoiceNumberEle', 'error', 'Enter Invoice Number')) {
		return false;
	}

	return true;
}
function setSaidToContains(response) {
	let saidToContainList = response.saidToContainList;

	if (saidToContainList != undefined && saidToContainList.length > 0) {
		for (let packing of saidToContainList) {
			operationOnSelectTag('GensaidToContainEle', 'addNew', packing.saidToContainName, packing.saidToContainId)
		}
	} else
		showMessage('error', 'Said To Contains not found for this HSN Code !');
}
function getSaidToContainOnHSNCode(obj) {
	let jsonObject = {};
	jsonObject.hsnCode = obj.value;
	$('#GensaidToContainEle').empty();

	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL+'/tceBookingWS/getSaidToContainListByHSN.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(response) {
			console.log('respajaxonse ',response)
				setSaidToContains(response);
		}
	});
}

function resetPartyDetails(partyTypeId,urp) {

	if (partyTypeId == CUSTOMER_TYPE_CONSIGNOR_ID) {
		$('#GenconsignorGstnEle, #GenconsignorNameEle, #GenconsignorPincodeEle, #GenconsignorAddressEle').val('').prop('disabled', false);
		if(urp){
		$('#GenconsignorGstnEle').val('URP')
		}
	} else {
		$('#GenconsigneeGstnEle, #GenconsigneeNameEle, #GenconsigneePincodeEle, #GenconsigneeAddressEle').val('').prop('disabled', false);
	if(urp){
		$('#GenconsigneeGstnEle').val('URP')
	}
	}
}

function setPartyDetailsOnGST(response,partyTypeId){
	hideLayer();
			if (!response.isValidGSTNumber) {	
					resetPartyDetails(partyTypeId);
					showMessage('error', 'Please, Enter valid GST Number !');
			}else{
				
				var gstDetails = response.gstDetails;
				
				if(partyTypeId == CUSTOMER_TYPE_CONSIGNOR_ID){
				$('#GenconsignorNameEle').val(gstDetails.legalBusinessName).attr('title', gstDetails.legalBusinessName);
				$('#GenconsignorPincodeEle').val(gstDetails.pinCode);
				
				if(gstDetails.fullAddress != null && gstDetails.fullAddress.trim() != '')
					$('#GenconsignorAddressEle').val(gstDetails.fullAddress).attr('title', gstDetails.fullAddress);
				else
					$('#GenconsignorAddressEle').prop('disabled', false);
				$('#GenconsignorPlaceEle').val(gstDetails.district);
				$('#GenconsignorStateEle').val(gstDetails.state);
				
			    $('#GenconsignorAddressEle').prop("disabled", true);
				$('#GenconsignorNameEle').prop("disabled", true);
				$('#GenconsignorPincodeEle').prop("disabled", true);
				$('#GenconsignorAddressEle').prop("disabled", true);
				$('#GenconsignorPlaceEle').prop("disabled", true);
				$('#GenconsignorStateEle').prop("disabled", true);
	
				}else{
				$('#GenconsigneeNameEle').val(gstDetails.legalBusinessName).attr('title', gstDetails.legalBusinessName);
				$('#GenconsigneePincodeEle').val(gstDetails.pinCode);
				$('#GenconsigneePlaceEle').val(gstDetails.district);
				$('#GenconsigneeStateEle').val(gstDetails.state);
				
				if(gstDetails.fullAddress != null && gstDetails.fullAddress.trim() != '')
					$('#GenconsigneeAddressEle').val(gstDetails.fullAddress).attr('title', gstDetails.fullAddress);
				else
					$('#GenconsigneeAddressEle').prop('disabled', false);
					
				$('#GenconsigneeAddressEle').prop("disabled", true);
				$('#GenconsigneeNameEle').prop("disabled", true);
				$('#GenconsigneePincodeEle').prop("disabled", true);
				$('#GenconsigneeAddressEle').prop("disabled", true);
				$('#GenconsigneePlaceEle').prop("disabled", true);
				$('#GenconsigneeStateEle').prop("disabled", true);
								
				}
				
			}
}

function validateGstNumberByApi(partyType) {
    let gstNumber;
    
	if (partyType === CUSTOMER_TYPE_CONSIGNOR_ID) {
        gstNumber = $('#GenconsignorGstnEle').val();
    } else {
        gstNumber = $('#GenconsigneeGstnEle').val();
    }
     gstNumber = gstNumber.trim().toUpperCase();

    if (gstNumber === 'URP') {
		resetPartyDetails(partyType,'urp')
        console.log('GST Number:', gstNumber);
        return;
    }
    
    if (partyType === CUSTOMER_TYPE_CONSIGNOR_ID) {
        if (!validateInputTextFeild(9, 'GenconsignorGstnEle', 'GenconsignorGstnEle', 'info', gstnErrMsg)) {
            return;
        }
    } else {
        if (!validateInputTextFeild(9, 'GenconsigneeGstnEle', 'GenconsigneeGstnEle', 'info', gstnErrMsg)) {
            return;
        }
    }
    
   

    let jsonObject = {
        gstNumber: gstNumber,
        partyTypeId: partyType
    };

    showLayer();
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL+'/tceBookingWS/fetchDataByGSTNumber.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(response) {
			console.log('respajaxonse ',response)
				setPartyDetailsOnGST(response,partyType);
		},
		complete: hideLayer

	});

}
