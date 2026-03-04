
var jsondata 						= null;
var configuration					= null;
var executive						= null;
var execFldPermissions				= null;

var TransportCommonMaster			= null;
var WayBill							= null;
var Branch							= null;
var ChargeTypeMaster				= null;
var WayBillType						= null;
var CorporateAccount				= null;
var FeildPermissionsConstant		= null;
var   fontStyleSmall				= "";
var   fontStyleBig					= "";

var execFeildPermission	= null;

var isDeliveryDiscountAllow			= false;
var octroiServiceCharge				= null;
var isOctroiServiceApplicable		= true;

var enterCount		= 0;
var taxableAmount					= 0;
var checkedManualCRSave 	= null;
var checkedManualCROnCancel = null;

var showbillCredit					= false;
var taxvalue	= null;
var validateIfExecutiveSelected = false;

var BOOKING_CHARGE	= 1;
var DELIVERY_CHARGE	= 2;
var tableId 		= 'multipleLRTBL';
var headerCount     = 1;
var tableRowId		= 1;
var searchedCRNumber					= -1;

function initializeCancelCR() {
	initializeBranchAutoComplete();
}

function canelCR () {

	if(!validateRemark()) {return false;}
	cancelCR();
}

function validateSearch () {

	if(!validateCRNumber()) {return false;}

	if(!validateBranch()) {return false;}
	getCrData();
}


function validateCRNumber () {

	if(document.getElementById("crNumber")) {
		if(!validateInput(1, "crNumber", "crNumber", 1,  "Please, enter valid CR Number !! "))
			return false;
	}

	return true;
}

function validateRemark () {

	if(document.getElementById("crCancellationRemark")) {
		if(!validateInput(1, "crCancellationRemark", "crCancellationRemark", 1,  "Please, enter remark !! "))
			return false;
	}

	return true;
}

function validateBranch () {

	if(document.getElementById("Branch")) {
		if(!validateInput(1, "Branch", "Branch", 1,  "Please, Select Branch !! "))
			return false;
	}

	if(document.getElementById("branchId")) {
		if(!validateInput(1, "branchId", "branch", 1,  "Please, Select Branch !! "))
			return false;
	}

	return true;
}

function addHeaderDeliveryTable(){
	var table    = document.getElementById(tableId);
	var rowCount = table.rows.length;	
	var header   = table.createTHead();
	var k 		 = 0;
	row   		 = header.insertRow(rowCount);

	createElementAfterCheckintConfigurationExists("true","LR No.",k++,'titletd',true,true,null);
	createElementAfterCheckintConfigurationExists("true","Bkg. Date",k++,'titletd',true,true,null);
	createElementAfterCheckintConfigurationExists("true","Dly. Date",k++,'titletd',true,true,null);
	createElementAfterCheckintConfigurationExists("true","From",k++,'titletd',true,true,null);
	createElementAfterCheckintConfigurationExists("true","To",k++,'titletd',true,true,null);
	createElementAfterCheckintConfigurationExists("true","C/nor",k++,'titletd',true,true,null);
	createElementAfterCheckintConfigurationExists("true","C/nor No",k++,'titletd',true,true,null);
	createElementAfterCheckintConfigurationExists("true","C/nee",k++,'titletd',true,true,null);
	createElementAfterCheckintConfigurationExists("true","C/nee No",k++,'titletd',true,true,null);
	createElementAfterCheckintConfigurationExists("true","Booking Total",k++,'titletd',true,true,null);
	createElementAfterCheckintConfigurationExists("true","Delivery Total",k++,'titletd',true,true,null);
	createElementAfterCheckintConfigurationExists("true","Grand Total",k++,'titletd',true,true,null);
	createElementAfterCheckintConfigurationExists("true","LR Type",k++,'titletd',true,true,null);
	createElementAfterCheckintConfigurationExists("true","Art.",k++,'titletd',true,true,null)
	createElementAfterCheckintConfigurationExists("true","Weight",k++,'titletd',true,true,null);
	createElementAfterCheckintConfigurationExists("true","Payment Type",k++,'titletd',true,true,null);
	createElementAfterCheckintConfigurationExists("true","Remark",k++,'titletd',true,true,null);
}

function addDataInDeliveryTable(data,showCancelleddByExecutiveList){
	var deliveryArr				= null;
	var dcdModel			    = null;
	validateIfExecutiveSelected	= false;
	
	var table    = document.getElementById(tableId);
	var rowCount = table.rows.length;	
	
	if(headerCount == 1) {
		tBody =  document.createElement('tbody');
		table.appendChild(tBody);
	}
	
	if(data)
		deliveryArr = data;

	if(deliveryArr != null) {
		for (var i = 0 ; i < deliveryArr.length ; i++) {
			var k 	= 0;
			row 	= tBody.insertRow(i);
			row.id  = (tableRowId);
			
			dcdModel = deliveryArr[i];
		
			if(dcdModel.consignorPhoneNo == undefined)
				dcdModel.consignorPhoneNo = '0000000000'
			
			if(dcdModel.consigneePhoneNumber == undefined)
				dcdModel.consigneePhoneNumber = '0000000000'
			
			createElementAfterCheckintConfigurationExists("true",dcdModel.wayBillNumber,k++,'datatd',false,false,'LrNumber_'+dcdModel.wayBillId);
			createElementAfterCheckintConfigurationExists("true",date(dcdModel.bookingDateTime,'-'),k++,'datatd',false,false,'BookingDate_'+dcdModel.wayBillId);
			createElementAfterCheckintConfigurationExists("true",date(dcdModel.deliveryDateTime,'-'),k++,'datatd',false,false,'DeliveryDate_'+dcdModel.wayBillId);
			createElementAfterCheckintConfigurationExists("true",dcdModel.source,k++,'datatd',false,false,'FromBranch_'+dcdModel.wayBillId);
			createElementAfterCheckintConfigurationExists("true",dcdModel.destination,k++,'datatd',false,false,false,'ToBranch_'+dcdModel.wayBillId);
			createElementAfterCheckintConfigurationExists("true",dcdModel.consignorName,k++,'datatd',false,false,'ConsignorName_'+dcdModel.wayBillId);
			createElementAfterCheckintConfigurationExists("true",dcdModel.consignorPhoneNo,k++,'datatd',false,false,'ConsignorNo_'+dcdModel.wayBillId);
			createElementAfterCheckintConfigurationExists("true",dcdModel.consigneeName,k++,'datatd',false,false,'ConsigneeName_'+dcdModel.wayBillId);
			createElementAfterCheckintConfigurationExists("true",dcdModel.consigneePhoneNumber,k++,'datatd',false,false,'ConsigneeNo_'+dcdModel.wayBillId);
			createElementAfterCheckintConfigurationExists("true",dcdModel.bookingTotal,k++,'datatd',false,false,'Amount_'+dcdModel.wayBillId);
			createElementAfterCheckintConfigurationExists("true",dcdModel.deliveryTotal,k++,'datatd',false,false,'DeliveryTotal_'+dcdModel.wayBillId);
			createElementAfterCheckintConfigurationExists("true",dcdModel.grandTotal,k++,'datatd',false,false,'GrandTotal_'+dcdModel.wayBillId);
			createElementAfterCheckintConfigurationExists("true",dcdModel.wayBillType,k++,'datatd',false,false,'LRType_'+dcdModel.wayBillId);
			createElementAfterCheckintConfigurationExists("true",dcdModel.packageDetails,k++,'datatd',false,false,'Article_'+dcdModel.wayBillId);
			createElementAfterCheckintConfigurationExists("true",dcdModel.actualWeight,k++,'datatd',false,false,'Weight_'+dcdModel.wayBillId);
			createElementAfterCheckintConfigurationExists("true",dcdModel.paymentTypeName,k++,'datatd',false,false,'PaymentTypeName_'+dcdModel.wayBillId);
			createElementAfterCheckintConfigurationExists("true",dcdModel.remark,k++,'datatd',false,false,'Remark_'+dcdModel.wayBillId);

			createHiddenElement(dcdModel,k++);
			tableRowId++;
		}

		if(showCancelleddByExecutiveList) {
			execReqd = true;
			populateExecutiveForId(deliveryArr[0].deliveryBranchId, false, true); 
			$('#cancelCrForExecutiveTRId').show();
			validateIfExecutiveSelected = true;
		}   
	}
	
	$('#middle-border-boxshadow').switchClass("show", "hide");
	$('#cancelCRData').switchClass("show", "hide");
}

function createHiddenElement(model,position){
	var ele 	 = null;
	var newCell = row.insertCell(position);
	ele = createElement(model.consignorId,'ConsignorId_'+model.wayBillId,30,'width-100px text-align-left','none',null,'hidden',false);
	appendChild(newCell,ele);
	ele = createElement(model.consigneeId,'ConsigneeId_'+model.wayBillId,30,'width-100px text-align-left','none',null,'hidden',false);
	appendChild(newCell,ele);
	ele = createElement(model.consignorName,'ConsignorName_'+model.wayBillId,30,'width-100px text-align-left','none',null,'hidden',false);
	appendChild(newCell,ele);
	ele = createElement(model.consigneeName,'ConsigneeName_'+model.wayBillId,30,'width-100px text-align-left','none',null,'hidden',false);
	appendChild(newCell,ele);
	ele = createElement(model.crId,'CRId_'+model.wayBillId,30,'width-100px text-align-left','none',null,'hidden',false);
	appendChild(newCell,ele);
	ele =createElement(model.wayBillId,'LRRow_'+row.id,30,'width-100px text-align-left','none',null,'hidden',false);
	appendChild(newCell,ele);

	newCell.style.display     = 'none';
	row.appendChild(newCell);
}


function createElementAfterCheckintConfigurationExists(property, displayName, position, className, isHeaderFooter, fontWeight, cellId){
	if(property == "true"){
		createNewCell(displayName,className,'center',position,fontStyleSmall,fontWeight,cellId,isHeaderFooter,null);
	}
}

function appendChild(cell,element){
	cell.appendChild(element);
}

function createNewCell(value,className,align,position,fontSizeValue,fontWeight,cellId,isHeaderFooter,style){

	var newCell = null;
	if(isHeaderFooter){
		newCell = document.createElement('th');
	} else {
		newCell = row.insertCell(position);
	}
	row.appendChild(newCell);
	newCell.innerHTML = value;
	newCell.className = className;
	newCell.align     = align;
	if(fontSizeValue != null){
		newCell.style.fontSize  = fontSizeValue;
	}
	if(fontWeight){
		newCell.style.fontWeight  = 'bold';
	}
	if(cellId != null && cellId.length > 0){
		newCell.id     = cellId;
	}
	if(style != null){
		newCell.style.display     = style;
	}
}

function createElement(value,elementId,lenght,className,style,placeHolder,type,isReadOnly){
	var ele = document.createElement("input");
	if(elementId != null && elementId.length > 0){
		ele.id     = elementId;
		ele.name   = elementId;
	}
	ele.className	= className;
	ele.maxLength 	= lenght;
	ele.value 		= value;
	if(style != null){
		ele.style.display = style;
	}
	if(placeHolder != null){
		ele.placeholder = placeHolder;
	}
	if(type != null){
		ele.type = type;
	}
	if(isReadOnly){
		ele.readOnly = true;
	}
	return ele;
}

function setEventOnElement(ele){
	ele.onblur		= function(){return checkDate(this.value,ele.id,true);};
	ele.onkeypress	= function(){return charsForDate(event);};
}


function createInputElement(value,elementId,position,lenght, className,isReadOnly){
	var ele     = createElement(value,elementId,lenght,className, null, null, null, isReadOnly);
	var newCell = row.insertCell(position);
	newCell.appendChild(ele);
	row.appendChild(newCell);
	return ele;
}

function checkEventforProcess(event) {

	var key	= getKeyCode(event);

	if (key == 13) {
		getWaybillData();
		resetWayBillNumer();
		return;
	} 
}

function getCRNumber() {
	var crNumber =	$('#crNumber').val();
	return crNumber.replace(/\s+/g, "");
}

function getCrData() {
	var jsonObject					= new Object();
	var crNumber					= null;
	crNumber						= getCRNumber();

	if(crNumber == ''){
		return;
	}

	jsonObject.filter			= 1;
	jsonObject.crNumber			= crNumber;
	jsonObject.branchId			= $('#branchId').val();

	var jsonStr = JSON.stringify(jsonObject);

	resetData();
	showLayer();

	$.post("CancelCRAjax.do?pageId=288&eventId=7",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.userErrorDescription) {
					showMessage('error', data.userErrorDescription); // show message to show system processing error massage on top of the window.
					hideLayer();
				} else {
				
				if (data.userErrorDescription) {
					showMessage('error', data.userErrorDescription);
					hideLayer();
					return;
				} else {
					hideAllMessages();
					const crIds = new Set();
					let deliveryDetails = [];

					// Step 1: Collect unique crIds and create delivery details for each unique one
					data.deliveryArr.forEach(delivery => {
						const crId = delivery.crId;

						if (crIds.has(crId)) {
							return false;
						}
						crIds.add(crId);

						let deliveryDetailsObject = {
							"crId": crId,
							"wayBillDeliveryNumber": delivery.wayBillDeliveryNumber,
							"destination": delivery.destination,
							"deliveryDateTime": formatDate(delivery.deliveryDateTime)
						};

						deliveryDetails.push(deliveryDetailsObject);
					});

					const filterByCrId = (data, crId) => {
						return data.deliveryArr.filter(delivery => delivery.crId === crId);
					};

					let filteredDataByCrId = data;

					if (crIds.size === 1) {
						addHeaderDeliveryTable();
						addDataInDeliveryTable(data.deliveryArr, data.showCancelleddByExecutiveList);
					} else {
						$('#yearSelection').html(''); // you can rename this to #crSelection if you want

						deliveryDetails.forEach(el => {
							$('#yearSelection').append(`
								<tr>
									<td role="button" id='filterby${el.crId}'>
										<a>${el.wayBillDeliveryNumber}</a>
									</td>
									<td>${el.destination}</td>
									<td>${el.deliveryDateTime}</td>
								</tr>
							`);

							// Step 4: Add click handler
							$('#filterby' + el.crId).on('click', function() {
								filteredDataByCrId = filterByCrId(data, el.crId);
								addHeaderDeliveryTable();
								addDataInDeliveryTable(filteredDataByCrId, data.showCancelleddByExecutiveList);
								$('#yearModal').modal('hide'); // optional rename to #crModal
							});
						});

						$('#yearModal').modal('show');
					}
				}
					hideLayer();
				}
			});
}

function cancelCR() {
	
	if (validateIfExecutiveSelected && Number($('#Executive').val()) <= 0) {
		hideLayer();
		showMessage('error', "Select Executive Name First..!");
		enableButton();
		return false;
	}

	var jsonObject					= new Object();
	jsonObject.filter				= 2;
	jsonObject.cancelCrForExecutiveId		= $('#Executive').val();
	
	showLayer();
	disableButton();

	if(!validateRemark ()){
		enableButton();
		hideLayer();
		return false;
	}

	ans = confirm("Are you sure you want to cancel CR ?");
	if (!ans) {
		enableButton();
		hideLayer();
		return false;
	} 

	getUrlForSubmit(jsonObject);

	var jsonStr = JSON.stringify(jsonObject);
	showLayer();

	$.post("CancelCRAjax.do?pageId=288&eventId=7",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription); // show message to show system processing error massage on top of the window.
					hideLayer();
				} else {
					resetData();
					resetCRData();
					enableButton();
					hideLayer();
					if (data.status) {
						alert("CR cancelled successfully.");
					}
				}
			});
}

function disableButton(){
	var cancelButton = document.getElementById('cancelButton');
	if(cancelButton != null){
		cancelButton.className = 'btn_print_disabled';
		cancelButton.style.display ='none'; 
		cancelButton.disabled=true;
	}
}

function enableButton(){
	var cancelButton = document.getElementById('cancelButton');
	if(cancelButton != null){
		cancelButton.style.display ='block'; 
		cancelButton.disabled=false;
	}
}

function getUrlForSubmit(jsonObject) {

	var tableEl 	= document.getElementById(tableId);
	var wayBillId 	= 0;
	var jsonObjectArray = [];
	var jsonObjectdata = null; 
	var wayBillIds     = "";

	for (var i = 1, row; row = tableEl.rows[i]; i++) {
		if(document.getElementById('LRRow_'+row.id)){
			wayBillId = document.getElementById('LRRow_'+row.id).value;
		}
		
		if(wayBillId > 0){
			jsonObjectdata = new Object();
			jsonObjectdata.wayBillId		= wayBillId;
			jsonObjectdata.consignorId		= $('#ConsignorId_'+wayBillId).val();
			jsonObjectdata.consigneeId		= $('#ConsigneeId_'+wayBillId).val();
			jsonObjectdata.consignorName	= $('#ConsignorName_'+wayBillId).val();
			jsonObjectdata.crId				= $('#CRId_'+wayBillId).val();

			jsonObjectArray.push(jsonObjectdata);
			wayBillIds = (wayBillId+","+wayBillIds); 
		}
	}
	jsonObject.lrWiseJsonValueObject = jsonObjectArray;
	if(wayBillIds.length > 0){
		wayBillIds = wayBillIds.substring(0, wayBillIds.length - 1);
	}
	jsonObject.wayBillIds	 = wayBillIds;
	var CrCancellationRemark = $('#crCancellationRemark').val();
	jsonObject.remark	= CrCancellationRemark;
}


function resetOnDelete(e){
	var keynum = getKeyCode(e);

	if(keynum == 8  || keynum == 46 ){
		$('#selectedDeliveryCreditorId').val(0);
	}
}

function resetData() {

	$('#middle-border-boxshadow').switchClass("hide", "show");
	hideAllMessages();
	hideInfo();

	$('#' + tableId).empty();
	$('#crCancellationRemark').val('');
	$('#ErrorForNorecords').html('');
}

function resetCRData(){
	$('#crNumber').val('');
	$('#Branch').val('');
	$('#branchId').val(0);
}

function charsForDate(e){
	var keynum = getKeyCode(e);

	if(keynum == 8 || keynum == 45){
		return true;
	}
	if (keynum < 48 || keynum > 57 ) {
		return false;
	}
	return true;
}
function formatDate(dateTimeString) {
    let datePart = dateTimeString.split(' ')[0];
    let [year, month, day] = datePart.split('-');
    return `${day}-${month}-${year}`;
}