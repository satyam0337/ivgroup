function checkDuplicateAgentCode(){
	if(document.getElementById('agentCode') == null)
		return true;
	
	var agentCode = document.getElementById('agentCode').value;
	 
	var jsonObject = {};
	 
	jsonObject.agentCode = agentCode;
	 
	showLayer();
	 
	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/crossingAgentMasterWS/checkDuplicateAgentCode.do',
		data		: jsonObject,
		dataType	: 'json',
		success: function(data) {
			hideLayer();
			
			if(data.message != undefined) {
				showMessage('error', data.message.description);
				toogleElement('error','block');
 				changeError1('agentCode','0','0');
 				document.crossingAgentMasterForm.agentCode.focus();	
 				$("#"+agentCode).val('');
			}
		}
	});
}

function checkDuplicateAgentName(name) {
	var jsonObject = {};
	 
	jsonObject.name = name;
	
	isCrossingAgentExits = false;
	$("#msgbox").html('').removeClass();
	 
	showLayer();
	 
	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/crossingAgentMasterWS/checkDuplicateAgentName.do',
		data		: jsonObject,
		dataType	: 'json',
		success: function(data) {
			hideLayer();
			
			if(data.message != undefined) {
				$("#msgbox").fadeTo(200, 0.1, function() { //start fading the messagebox
					$(this).html(data.message.description).addClass('messageboxerror').fadeTo(900,1);
					$('#name').focus();
				});
				
				isCrossingAgentExits = true;
			}
		}
	});
}

function getCrossingAgentDetails(crossingAgentId) {
	$('#selectedCrossingAgentId').val(crossingAgentId);
	
	showLayer();
	
	let jsonObject = {};
	
	jsonObject.crossingAgentId = crossingAgentId;
		 
	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/crossingAgentMasterWS/getDetailsForEdit.do',
		data		: jsonObject,
		dataType	: 'json',
		success: function(data) {
			hideLayer();
			
			let crossingAgentMaster	= data.CrossingAgentMaster;
			
			curName = crossingAgentMaster.name;
			
			$('#name').val(crossingAgentMaster.name);
			$('#address').val(crossingAgentMaster.address);
			
			let phoneNumber	= crossingAgentMaster.phoneNumber;
			
			if(phoneNumber.length > 0) {
				let stdCodeAndPhNo = phoneNumber.split("-");
				$('#stdCode1').val(stdCodeAndPhNo[0]);
				$('#phNumber1').val(stdCodeAndPhNo[1]);
				$('#phoneNumber1').val(phoneNumber);
			}
			
			let phoneNumber2	= crossingAgentMaster.phoneNumber2;
						
			if(phoneNumber2.length > 0) {
				let stdCodeAndPhNo = phoneNumber2.split("-");
				$('#stdCode2').val(stdCodeAndPhNo[0]);
				$('#phNumber2').val(stdCodeAndPhNo[1]);
				$('#phoneNumber2').val(phoneNumber2);
			}
			
			$('#mobileNumber1').val(crossingAgentMaster.mobileNumber);
			$('#mobileNumber2').val(crossingAgentMaster.mobileNumber2);
			$('#pinCode').val(crossingAgentMaster.pincode);
			$('#contactPerson').val(crossingAgentMaster.contactPerson);
			$('#emailAddress').val(crossingAgentMaster.emailId);
			$('#faxNumber').val(crossingAgentMaster.faxNumber);
			
			if(document.crossingAgentMasterForm.crossingAgentType != undefined)
				selectOptionByValue(document.crossingAgentMasterForm.crossingAgentType, crossingAgentMaster.crossingAgentType);
			
			$('#gstNumber').val(crossingAgentMaster.gstNumber);
			$('#agentCode').val(crossingAgentMaster.agentCode);
			
			let lrTypesId	= crossingAgentMaster.lrTypesId;
			
			if(lrTypesId != undefined) {
				$(":checkbox").attr("checked", false);
				let tempQty2 = lrTypesId.split(",");
				
				for(let i = 0; i < tempQty2.length; i++) {
					$(":checkbox[value=" + tempQty2[i] + "]").attr("checked", true);
				}
			}
			
			document.crossingAgentMasterForm.edit.disabled = false ;
			document.crossingAgentMasterForm.edit.className = 'btn_print';
			document.crossingAgentMasterForm.deleteItem.disabled = false ;
			document.crossingAgentMasterForm.deleteItem.className = 'btn_print';

			document.crossingAgentMasterForm.editBottom.disabled = false ;
			document.crossingAgentMasterForm.editBottom.className = 'btn_print';
			document.crossingAgentMasterForm.deleteItemBottom.disabled = false ;
			document.crossingAgentMasterForm.deleteItemBottom.className = 'btn_print';
			
			$('#viewLog').removeClass('hide');
			$('#addTransporter').removeClass('hide');
		}
	});
}

function getSeletedItemData(crossingAgentId) {
	disableElements();
	getCrossingAgentDetails(crossingAgentId);
}

function selectOptionByValue(selObj, val){
	var A= selObj.options, L= A.length;
    while(L){
        if (A[--L].value== val){
            selObj.selectedIndex= L;
            L= 0;
        }
    }
}

function addCrossingAgentAfterDuplicateCheck(){
	  var name = document.crossingAgentMasterForm.name.value.trim();
		 if(formValidations()){	
			 addCrossingAgent();
		 }	
	}

function addCrossingAgent(){
	   if(formValidations()){
	 	 if(isCheck  && !isCrossingAgentExits){
		 	 if (confirm('Are you sure you want to add this  Agent ?')){
					capitalizeWords('name');
					capitalizeWords('address');
					capitalizeWords('contactPerson');
					document.crossingAgentMasterForm.filter.value = 1;
					document.crossingAgentMasterForm.submit();
		 		}	
		 	}else{
			 	alert('Error : Please try again.');
				resetElements();
			}
		}else{
  		  	alert("Please Enter Agent Name");
    	}
	}

function resetCombo(target){
	var d=document.getElementById(target);
	d.options.length=1;
	d.options[0].text= '------ Select ------';
	d.options[0].value=0;
}

function editCrossingAgentAfterDuplicateCheck(){
	if (document.crossingAgentMasterForm.edit.value == 'Edit' ||
		document.crossingAgentMasterForm.editBottom.value == 'Edit'){
		document.crossingAgentMasterForm.add.disabled = true ;
		document.crossingAgentMasterForm.add.className = 'btn_print_disabled';	
		document.crossingAgentMasterForm.edit.value= 'Save';
		document.crossingAgentMasterForm.deleteItem.value= 'Cancel';

		document.crossingAgentMasterForm.addBottom.disabled = true ;
		document.crossingAgentMasterForm.addBottom.className = 'btn_print_disabled';	
		document.crossingAgentMasterForm.editBottom.value= 'Save';
		document.crossingAgentMasterForm.deleteItemBottom.value= 'Cancel';
		enableElements();
		document.crossingAgentMasterForm.name.focus();
		isEditMode = true;
		} else {
		    if(isCheck){	
			   var agentName = document.crossingAgentMasterForm.name.value.toUpperCase().trim();
		       var searchAgentName = document.crossingAgentMasterForm.searchCrossingAgent.value.toUpperCase();
				if(agentName == searchAgentName){
					isCrossingAgentExits=false;
					$("#msgbox").html('').removeClass();
				}
				  if (formValidations()){
					  editCrossingAgent();
     				}
   			}
		}
	}

function editCrossingAgent(){
	if (formValidations()){
	   if(document.crossingAgentMasterForm.selectedCrossingAgentId.value > 0){
		  if (confirm('Are you sure you want to update the  Agent ?')){
				capitalizeWords('name');
				capitalizeWords('address');
				capitalizeWords('contactPerson');
				document.crossingAgentMasterForm.filter.value = 2;
				document.crossingAgentMasterForm.submit();
			}
		}else{
			alert('Error : Please try again.');
		 	resetElements();
		}
	}
}
				
function deleteCrossingAgent(){
	if(document.crossingAgentMasterForm.deleteItem.value=='Delete'||
		document.crossingAgentMasterForm.deleteItemBottom.value=='Delete'){
		if (document.crossingAgentMasterForm.selectedCrossingAgentId.value > 0){
			if (confirm('Are you sure you want to delete the Agent ?')){
				document.crossingAgentMasterForm.filter.value=3;
				document.crossingAgentMasterForm.submit();
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
	document.crossingAgentMasterForm.address.readOnly= false;
}

function disableElements(){
	document.crossingAgentMasterForm.add.disabled = true ;
	document.crossingAgentMasterForm.add.className = 'btn_print_disabled';
	document.crossingAgentMasterForm.addBottom.disabled = true ;
	document.crossingAgentMasterForm.addBottom.className = 'btn_print_disabled';
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

	document.crossingAgentMasterForm.address.readOnly= true;
}

function resetElements(){
	$("#msgbox").html('').removeClass();
	document.crossingAgentMasterForm.add.disabled = false ;
	document.crossingAgentMasterForm.add.className = 'btn_print';
	document.crossingAgentMasterForm.edit.disabled = true ;
	document.crossingAgentMasterForm.edit.className = 'btn_print_disabled';
	document.crossingAgentMasterForm.deleteItem.disabled = true ;
	document.crossingAgentMasterForm.deleteItem.className = 'btn_print_disabled';
	document.crossingAgentMasterForm.edit.value = 'Edit';
	document.crossingAgentMasterForm.deleteItem.value = 'Delete';

	document.crossingAgentMasterForm.addBottom.disabled = false ;
	document.crossingAgentMasterForm.addBottom.className = 'btn_print';
	document.crossingAgentMasterForm.editBottom.disabled = true ;
	document.crossingAgentMasterForm.editBottom.className = 'btn_print_disabled';
	document.crossingAgentMasterForm.deleteItemBottom.disabled = true ;
	document.crossingAgentMasterForm.deleteItemBottom.className = 'btn_print_disabled';
	document.crossingAgentMasterForm.editBottom.value = 'Edit';
	document.crossingAgentMasterForm.deleteItemBottom.value = 'Delete';
	curName = null;
	
	var myTable = document.getElementById('details');
	
	var controls = myTable.getElementsByTagName("input"); 
	
	for( var i = 0; i < controls.length; i++) {
		control = controls[i];
	
		if(control.type != "checkbox"){
			control.value='';
		    control.readOnly = false;			
		}
	}
	
	controls= myTable.getElementsByTagName("select"); 
	
	for( var i = 0; i < controls.length; i++) {
	    control = controls[i];
	    control.selectedIndex = 0;        
	    control.readOnly = false;        
	}
	
	document.crossingAgentMasterForm.address.value= '';
	document.crossingAgentMasterForm.address.readOnly= false;
	document.crossingAgentMasterForm.searchCrossingAgent.value= '';
	document.crossingAgentMasterForm.selectedCrossingAgentId.value = 0 ;
	$(":checkbox").attr("checked",false);
	toogleElement('error','none');
	toogleElement('msg','none');
	document.crossingAgentMasterForm.searchCrossingAgent.focus();
}

function viewAllDetails() {
	childwin = window.open ('viewDetails.do?pageId=340&eventId=2&modulename=viewAllCrossingAgentMasterData','newwindow', config='height=450,width=1900, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function viewLogDetails() {
	let crossingAgentId = $('#selectedCrossingAgentId').val();
	
	if(crossingAgentId == undefined || crossingAgentId == 0) {
		showMessage('error', 'Please, Select Crossing Agent !');
		return;
	}
	
	childwin = window.open ('viewDetails.do?pageId=340&eventId=2&modulename=viewCrossingAgentMasterLogsData&masterid='+crossingAgentId,'newwindow', config='height=450,width=1900, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}