/**
 * Anant 19-11-2024
 */

var isEditMode = true;
var curName = null;
var selctedCityId = 0;
var vehicleOwner = 0;
var configuration = null;

function loadVehicleAgent() {
	
	showLayer();
	
	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/vehicleAgentMasterWS/loadCreateVehicleAgent.do',
		data		: '',
		dataType	: 'json',
		success: function(data) {
			configuration	= data;
			
			document.getElementById('searchVehicleAgent').focus(); 
			
			if(configuration.showVehicleAgentBankDetailsFields)
				$('.bankDetails').removeClass('hide');
			else
				$('.bankDetails').remove();
				
			if(configuration.validateVehicleAgentBankDetailsFields)
				$('.validateBankDetails').removeClass('hide');
				
			if(configuration.validateVehicleAgentPanNumber)
				$('.validatePanNumber').removeClass('hide');
				
			if (configuration.validateBeneficiaryName)
				$('.validateBeneficiaryName').removeClass('hide');
				
			if (configuration.showBeneficiaryNameInBankDetails)
				$('.beneficiaryNameDetails').removeClass('hide');

			if(data.tdsOwnerTypeList != undefined)
				setTDSOwnerTypeList(data.tdsOwnerTypeList);
				
			if(configuration.showTdsDeductible)
				$('#tdsDeductibleRow').removeClass('hide');
			else
				$('#tdsDeductibleRow').remove();
				
			if(configuration.showIsSpecified)
				$('#isSpecifiedRow').removeClass('hide');
			else
				$('#isSpecifiedRow').remove();
			
			if(configuration.showOwnerType)
				$('#ownerTypeRow').removeClass('hide');
			else
				$('#ownerTypeRow').remove();
		}
	});
}

function setTDSOwnerTypeList(tdsOwnerTypeList) {
	operationOnSelectTag('ownerType', 'removeAll', '', '');
	operationOnSelectTag('ownerType', 'addNew', '---- Select Owner Type ----', 0);

	tdsOwnerTypeList.forEach(value => {
		operationOnSelectTag('ownerType', 'addNew', value.tdsTypeName, value.tdsTypeId);
	});
}

function getVehicleAgentDetails(vehicleAgentMasterId) {
	let jsonObject	= {};
	jsonObject.vehicleAgentMasterId	= vehicleAgentMasterId;
	
	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/vehicleAgentMasterWS/getVehicleAgentMasterDetailById.do',
		data		: jsonObject,
		dataType	: 'json',
		success: function(data) {
			var vehicleAgentMaster	= data.vehicleAgentMaster;
			
			document.vehicleAgentMasterForm.selectedVehicleAgentId.value = vehicleAgentMaster.vehicleAgentMasterId;
			document.vehicleAgentMasterForm.name.value = vehicleAgentMaster.name;
			curName = vehicleAgentMaster.name;
			document.vehicleAgentMasterForm.address.value = vehicleAgentMaster.address;
			
			if(vehicleAgentMaster.phoneNumber != undefined && (vehicleAgentMaster.phoneNumber).length > 0){
				var stdCodeAndPhNo = new Array();
				stdCodeAndPhNo = (vehicleAgentMaster.phoneNumber).split("-");
				document.vehicleAgentMasterForm.stdCode1.value = stdCodeAndPhNo[0];
				document.vehicleAgentMasterForm.phNumber1.value = stdCodeAndPhNo[1];
				document.vehicleAgentMasterForm.phoneNumber1.value = vehicleAgentMaster.phoneNumber;
			}
			
			document.vehicleAgentMasterForm.mobileNumber1.value = vehicleAgentMaster.mobileNumber;
			selctedCityId = vehicleAgentMaster.cityId;
			selectOptionByValue(document.vehicleAgentMasterForm.city, vehicleAgentMaster.cityId);

			document.vehicleAgentMasterForm.pinCode.value = vehicleAgentMaster.pincode;
			document.vehicleAgentMasterForm.contactPerson.value = vehicleAgentMaster.contactPerson;
			document.vehicleAgentMasterForm.emailAddress.value = vehicleAgentMaster.emailId;

			if(vehicleAgentMaster.phoneNumber2 != undefined && (vehicleAgentMaster.phoneNumber2).length > 0){
				var stdCodeAndPhNo = new Array();
				stdCodeAndPhNo = (vehicleAgentMaster.phoneNumber2).split("-");
				document.vehicleAgentMasterForm.stdCode2.value = stdCodeAndPhNo[0];
				document.vehicleAgentMasterForm.phNumber2.value = stdCodeAndPhNo[1];
				document.vehicleAgentMasterForm.phoneNumber2.value = vehicleAgentMaster.phoneNumber2;
			}
					
			document.vehicleAgentMasterForm.mobileNumber2.value = vehicleAgentMaster.mobileNumber2;
			vehicleOwner = vehicleAgentMaster.vehicleOwnerId;
			selectOptionByValue(document.vehicleAgentMasterForm.vehicleOwner, vehicleAgentMaster.vehicleOwnerId);
			document.vehicleAgentMasterForm.panNo.value = vehicleAgentMaster.panNo;
			document.vehicleAgentMasterForm.gstn.value = vehicleAgentMaster.gstn;
			document.vehicleAgentMasterForm.status.value = vehicleAgentMaster.status;
			
			if(vehicleAgentMaster.status == 0) {
				$('.deactivateBtn').removeClass("hide");
				$('.activateBtn').addClass('hide');
			} else {
				$('.activateBtn').removeClass('hide');
				$('.deactivateBtn').addClass('hide');
			}
					
			if (configuration.showVehicleAgentBankDetailsFields) {
				selectOptionByValue(document.vehicleAgentMasterForm.bankName, vehicleAgentMaster.bankNameId);
				document.vehicleAgentMasterForm.accountNo.value = vehicleAgentMaster.accountNo;
				document.vehicleAgentMasterForm.ifscCode.value = vehicleAgentMaster.ifscCode;
				document.vehicleAgentMasterForm.branchAddress.value = vehicleAgentMaster.bankBranchAddress;
				document.vehicleAgentMasterForm.description.value = vehicleAgentMaster.description;
				if (configuration.showBeneficiaryNameInBankDetails)
					document.vehicleAgentMasterForm.beneficiaryName.value = vehicleAgentMaster.beneficiaryName;
			}
					
			if(document.vehicleAgentMasterForm.tdsDeductible != null) {
				if(vehicleAgentMaster.tdsDeductible)
					document.vehicleAgentMasterForm.tdsDeductible[0].checked = true;
				else
					document.vehicleAgentMasterForm.tdsDeductible[1].checked = true;
			}
					
			if(document.vehicleAgentMasterForm.isSpecified != null) {
				if(vehicleAgentMaster.isSpecified)
					document.vehicleAgentMasterForm.isSpecified[0].checked = true;
				else
					document.vehicleAgentMasterForm.isSpecified[1].checked = true;
			}
					
			if(document.vehicleAgentMasterForm.ownerType != null)
				selectOptionByValue(document.vehicleAgentMasterForm.ownerType, vehicleAgentMaster.ownerTypeId);
		}
	});
}

function getBanksForAutoComplete() {
    
    document.getElementById('bankName').options.length = 1;
    document.getElementById('bankName').options[0].text = '------Select Bank  ----';
    document.getElementById('bankName').options[0].value = 0;

    var xhr = new XMLHttpRequest();
    xhr.open('POST', WEB_SERVICE_URL + '/selectOptionsWS/getBankMasterListOption.do', true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var data = JSON.parse(xhr.responseText);
                console.log(data);

                operationOnSelectTag('bankName', 'removeAll', '', '');
                operationOnSelectTag('bankName', 'addNew', '---- Select Bank ----', 0);

                if (data && data.bankList && Array.isArray(data.bankList)) {
                    data.bankList.forEach(function (bank) {
                        operationOnSelectTag('bankName', 'addNew', bank.bankName + ' (' + bank.abbreviation + ')', bank.bankId);
                    });
                }

                hideLayer();
            } else {
                console.error('Error:', xhr.statusText);
            }
        }
    };

    xhr.onerror = function () {
        console.error('Request failed.');
    };

    xhr.send(null);
}

function formValidations() {
	if(!validateElement('name','Name')){return false;}
	if(!validateElement('city','City')){return false;}
	if(!validateElement('vehicleOwner','vehicleOwner')){return false;}
	
	if(!validatePhoneNumber(7, 'phNumber2')){return false;}
	if(!validateElement('mobileNumber1','Mobile Number')){return false;}
	if(!validateLengthOfMobileNumber(5, 'mobileNumber1')) {return false;}
	if(!validateLengthOfMobileNumber(5, 'mobileNumber2')) {return false;}
	if(!validateEmailAddress('emailAddress','emailAddress')){return false;}
	
	if(configuration.validateVehicleAgentPanNumber) {
		if(!validateElement('panNo','Pan Number')){return false;}
	}
	
	if(configuration.validateVehicleAgentBankDetailsFields) {
		if(!validateElement('bankName','Bank Name')){return false;}
		if(!validateElement('accountNo','Account Number')){return false;}
		if(!validateElement('ifscCode','IFSC Code')){return false;}
		if(!validateElement('branchAddress','Branch Address')){return false;}
		if(!validateElement('description','Description')){return false;}
	}
	
	if(configuration.validateBeneficiaryName) {
		if(!validateElement('beneficiaryName','Beneficiary Name')){return false;}
	}
	
	if(!checkValidPanNum('panNo')){return false;}
	if(!validateGstn('gstn','GSTN')){return false;}
	
	var el = document.getElementById('details').getElementsByTagName('input');
	for (var i = 0; i < el.length; i++) {
        if (el[i].type == 'text') {
        	el[i].value = el[i].value.toUpperCase();
        }
    }

	el = document.getElementById('details').getElementsByTagName('textarea');
	for (var i = 0; i < el.length; i++) {
       	el[i].value = el[i].value.toUpperCase();
    }

	// All validation check done
	return true;
}

function getSeletedItemData(vehicleAgentId){
	disableElements();
	getVehicleAgentDetails(vehicleAgentId);
	document.vehicleAgentMasterForm.edit.disabled = false ;
	document.vehicleAgentMasterForm.edit.className = 'btn_print';
	document.vehicleAgentMasterForm.deleteItem.disabled = false ;
	document.vehicleAgentMasterForm.deleteItem.className = 'btn_print';

	document.vehicleAgentMasterForm.editBottom.disabled = false ;
	document.vehicleAgentMasterForm.editBottom.className = 'btn_print';
	document.vehicleAgentMasterForm.deleteItemBottom.disabled = false ;
	document.vehicleAgentMasterForm.deleteItemBottom.className = 'btn_print';
}

function addVehicleAgentAfterCheckDuplicate(){
	  var name = document.vehicleAgentMasterForm.name.value;
		 if(formValidations()){	
				$.get("/ivcargo/jsp/masters/MasterAjaxInterface2.jsp",{
					filter:23,name:name},function(data){
				   var response = $.trim(data);
					//alert(response);
				   if(response == 'true'){
					   var msg ="Vehicle Agent Already Exists. Please Choose Different Name !"; 
						showMessage('error',msg);
						toogleElement('error','block');
						changeError1('name','0','0');
					}else{
						 if(confirm('Are you sure you want to add this Agent ?')){  
							 addVehicleAgent();
						 }
					}
		 		});
		 }	
	}
	
function addVehicleAgent(){
			capitalizeWords('name');
			capitalizeWords('address');
			capitalizeWords('contactPerson');
			document.vehicleAgentMasterForm.filter.value = 1;
			document.vehicleAgentMasterForm.submit();
}
function viewAllAgents(){
	childwin = window.open ('viewDetails.do?pageId=340&eventId=2&modulename=vehicleAgentMasterDetails','newwindow', config='height=450,width=1900, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function resetCombo(target){
	var d=document.getElementById(target);
	d.options.length=1;
	d.options[0].text= '------ Select ------';
	d.options[0].value=0;
}

function editVehicleAgentAfterCheckDuplicate(){
	var reg = /\s/g; 
	if (document.vehicleAgentMasterForm.edit.value == 'Edit' ||
		document.vehicleAgentMasterForm.editBottom.value == 'Edit'){
		document.vehicleAgentMasterForm.add.disabled = true ;
		document.vehicleAgentMasterForm.add.className = 'btn_print_disabled';	
		document.vehicleAgentMasterForm.edit.value= 'Save';
		document.vehicleAgentMasterForm.deleteItem.value= 'Cancel';
		document.vehicleAgentMasterForm.editBottom.value= 'Save';
		document.vehicleAgentMasterForm.deleteItemBottom.value= 'Cancel';
		enableElements();
		document.vehicleAgentMasterForm.name.focus();
		isEditMode ==true;
		}else {
	if(document.vehicleAgentMasterForm.selectedVehicleAgentId.value > 0){
		var name= $("#name").val(); 
		var str = $("#name").val().replace(reg, '');
	  if($("#name").is('[readonly]') == false   && str.length >0 && isEditMode ==true && name.toUpperCase() !=curName.toUpperCase()  ){
		   $.get("/ivcargo/jsp/masters/MasterAjaxInterface2.jsp",{
			   filter:23,name:name},function(data){
				   var response = $.trim(data);
					//alert(response);
				   if(response == 'true'){
					   var msg ="Vehicle Agent Already Exists. Please Choose Different Name !"; 
						showMessage('error',msg);
						toogleElement('error','block');
						changeError1('name','0','0');
					}else{
						// if(confirm('Are you sure you want to Update this Party ?')){  
							 editVehicleAgent();
					//	 }
					}
		 });
} else{
		if (formValidations()){
			// if (confirm('Are you sure you want to Update this Party ?')){  
				 editVehicleAgent();
			// }
		  } 
	  }
}
}

}

function editVehicleAgent(){
	
if (formValidations()){
	if(document.vehicleAgentMasterForm.selectedVehicleAgentId.value > 0){
		if(confirm('Are you sure you want to Update this Agent ?')){ 
			capitalizeWords('name');
			capitalizeWords('address');
			capitalizeWords('contactPerson');
			capitalizeWords('panNo');
			document.vehicleAgentMasterForm.filter.value = 2;
			document.vehicleAgentMasterForm.submit();
		}
	 }	
	} else {
		 	alert('Error : Please try again.');
		 	resetElements();
	}
}

function deleteVehicleAgent(){
	if(document.vehicleAgentMasterForm.deleteItem.value=='Delete'||
		document.vehicleAgentMasterForm.deleteItemBottom.value=='Delete'){
		if (document.vehicleAgentMasterForm.selectedVehicleAgentId.value > 0){
			if (confirm('Are you sure you want to delete the Vehicle Agent ?')){
				document.vehicleAgentMasterForm.filter.value=3;
				document.vehicleAgentMasterForm.submit();
			}
		}
	}else {
		resetElements();
	}
}

function setPhoneNumber(flag){
	var stdCode	 = document.getElementById('stdCode'+flag);
	var phNumber = document.getElementById('phNumber'+flag);
	var phoneNumber = document.getElementById('phoneNumber'+flag);
		if(stdCode.value.length > 0 && phNumber.value.length <= 0){
			phoneNumber.value = stdCode.value;
		} else {
			if(phNumber.value.length > 0 && stdCode.value.length <= 0){
				phoneNumber.value = phNumber.value;
			} else{
				if(phNumber.value.length > 0 && stdCode.value.length > 0){
					phoneNumber.value = stdCode.value +'-'+ phNumber.value;
			}
		}
	}
}

function enableElements(){
	var myTable = document.getElementById('details');
	var controls = myTable.getElementsByTagName("input"); 
	for( var i = 0; i < controls.length; i++) {
	    control = controls[i];
	    control.readOnly = false;        
	}
	controls= myTable.getElementsByTagName("select"); 
	for( var i = 0; i < controls.length; i++) {
	    control = controls[i];
	    control.readOnly = false;        
	}
	document.vehicleAgentMasterForm.address.readOnly= false;
}
function disableElements(){
	document.vehicleAgentMasterForm.add.disabled = true ;
	document.vehicleAgentMasterForm.add.className = 'btn_print_disabled';
	document.vehicleAgentMasterForm.addBottom.disabled = true ;
	document.vehicleAgentMasterForm.addBottom.className = 'btn_print_disabled';
	var myTable = document.getElementById('details');
	var controls= myTable.getElementsByTagName("input"); 
	for( var i = 0; i < controls.length; i++) {
	    control = controls[i];
	    control.readOnly = true;        
	}
	var controls= myTable.getElementsByTagName("select"); 
	for( var i = 0; i < controls.length; i++) {
	    control = controls[i];
	    control.readOnly = true;        
	}
	document.vehicleAgentMasterForm.address.readOnly= true;
}
function resetElements(){
	document.vehicleAgentMasterForm.add.disabled = false ;
	document.vehicleAgentMasterForm.add.className = 'btn_print';
	document.vehicleAgentMasterForm.edit.disabled = true ;
	document.vehicleAgentMasterForm.edit.className = 'btn_print_disabled';
	document.vehicleAgentMasterForm.deleteItem.disabled = true ;
	document.vehicleAgentMasterForm.deleteItem.className = 'btn_print_disabled';
	document.vehicleAgentMasterForm.edit.value = 'Edit';
	document.vehicleAgentMasterForm.deleteItem.value = 'Delete';

	document.vehicleAgentMasterForm.addBottom.disabled = false ;
	document.vehicleAgentMasterForm.addBottom.className = 'btn_print';
	document.vehicleAgentMasterForm.editBottom.disabled = true ;
	document.vehicleAgentMasterForm.editBottom.className = 'btn_print_disabled';
	document.vehicleAgentMasterForm.deleteItemBottom.disabled = true ;
	document.vehicleAgentMasterForm.deleteItemBottom.className = 'btn_print_disabled';
	document.vehicleAgentMasterForm.editBottom.value = 'Edit';
	document.vehicleAgentMasterForm.deleteItemBottom.value = 'Delete';
	
	var myTable = document.getElementById('details');
	
	var controls = myTable.getElementsByTagName("input"); 
	for( var i = 0; i < controls.length; i++) {
	    control = controls[i];
	    control.value='';
	    control.readOnly = false;        
	}
	controls= myTable.getElementsByTagName("select"); 
	for( var i = 0; i < controls.length; i++) {
	    control = controls[i];
	    control.selectedIndex = 0;        
	    control.readOnly = false;        
	}
	document.vehicleAgentMasterForm.address.value= '';
	document.vehicleAgentMasterForm.address.readOnly= false;
	
	if(document.vehicleAgentMasterForm.description != null)
		document.vehicleAgentMasterForm.description.value= '';
	
	document.vehicleAgentMasterForm.searchVehicleAgent.value= '';
	document.vehicleAgentMasterForm.selectedVehicleAgentId.value = 0 ;
	toogleElement('error','none');
	toogleElement('msg','none');
	document.vehicleAgentMasterForm.searchVehicleAgent.focus();
	
}

function capitalizeWords(id){
	document.getElementById(id).value = document.getElementById(id).value.capitalize();
}

function resetError(el){
	toogleElement('error','none');
	removeError(el.id);
};

function validateElement(id,msg){

	var el = document.getElementById(id);
	if(el != null) {

		var chkValue = 0;
		if(el.type == 'text') {
			var reg = /\s/g; //Match any white space including space, tab, form-feed, etc.
			var str = el.value.replace(reg, '');
			chkValue = str.length;
			msg = 'Please Enter '+msg+' !';
		} else if(el.type == 'select-one') {
			chkValue = el.value;
			msg = 'Please Select '+msg+' !';
		} else if(el.type == 'textarea') {
			var reg = /\s/g; //Match any white space including space, tab, form-feed, etc.
			var str = el.value.replace(reg, '');
			chkValue = str.length;
			msg = 'Please Enter '+msg+' !';
		}
		if(chkValue <= 0) {
			showMessage('error',msg);
			toogleElement('error','block');
			changeError1(id,'0','0');
			return false;
		} else {
			toogleElement('error','none');
			removeError(id);
		}
		return true;
	}
}

function activateDeactivateVehicleAgent(){
		if(document.vehicleAgentMasterForm.selectedVehicleAgentId.value > 0){	
			if(document.vehicleAgentMasterForm.status.value == 0){
				if(confirm('Are you sure you want to Deactivate Vehicle Agent ?')){
					document.vehicleAgentMasterForm.status.value = 1
					document.vehicleAgentMasterForm.filter.value = 4;
					document.vehicleAgentMasterForm.submit();
				}
			}else{
				if(confirm("Are You sure you want to Activate Vehicle Agent ?")){
					document.vehicleAgentMasterForm.status.value = 0
					document.vehicleAgentMasterForm.filter.value = 4;
					document.vehicleAgentMasterForm.submit();
				}
			}
		}
}

function selectOptionByValue(selObj, val){
	var A= selObj.options, L= A.length;
  
	while(L) {
		if (A[--L].value == val) {
			selObj.selectedIndex= L;
			L= 0;
		}
	}
}

function validateGstn() {
	
	var gstn = $('#gstn').val();
	
	if(gstn != "") {
		if(!validateInputTextFeild(9, 'gstn', 'gstn', 'info', gstnErrMsg)) {
			return false;
		}
	}
	
	return true;
}