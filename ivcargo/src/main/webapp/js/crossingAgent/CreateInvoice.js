/**
 * JS for creating Crossing agent Invoice
 */
function reportFormValidations() {

	var cAcc=document.getElementById('CrossingAgentId');
	if(cAcc.value == 0){
		var ele = document.getElementById('basicError');
		showSpecificErrors('basicError',"Please, Select Crossing Agent !");
		toogleElement('basicError','block');
		changeError1('CrossingAgentId','0','0');
		return false;
	} else {
		toogleElement('basicError','none');
		removeError('CrossingAgentId');
	}
	if(isShowType){ 
		var taxType = document.getElementById('txnType');
		if(taxType.value == 0){
			showSpecificErrors('basicError',"Please, Select Transaction Type !");
			toogleElement('basicError','block');
			changeError1('txnType','0','0');
			return false;
		} else {
			toogleElement('basicError','none');
			removeError('txnType');
		}
	}

	return true;
}

function storeSelectedValues(){
	var selectedCrossingAgent = document.getElementById('CrossingAgentId');
	if(selectedCrossingAgent!= null){
		document.getElementById('selectedCrossingAgent').value = selectedCrossingAgent.options[selectedCrossingAgent.selectedIndex].text;
	}
}
function changeSpecificError(id){
	var obj = document.getElementById(id);
	//alert(id);
	var posiArr = findPos(obj);
	changeError1(id,posiArr[0],posiArr[1]);
}
function resetErrorMessages(id){
	hideAllMessages();
	removeError(id);
}
function chkDate(manualInvoiceDate,creationDateTime,lsNumber,selection) {
	var manualDate = new Date();
	if(isValidDate(manualInvoiceDate)) {
		var currentDate  = new Date(curDate);
		var previousDate = new Date(curDate);
		var manualLHPVDate = new Date(curDate);
		if(pastDaysAllowed < '0'){
			showMessage('error','There is no LS to delete');
			changeSpecificError('manualInvoiceDate');
			return false;
		}
		
		previousDate.setDate(previousDate.getDate() - parseInt(pastDaysAllowed,10));
		previousDate.setHours(0,0,0,0);
		var manualLHPVDateParts = new String(manualInvoiceDate).split("-");
		manualLHPVDate.setFullYear(parseInt(manualLHPVDateParts[2],10));
		manualLHPVDate.setMonth(parseInt(manualLHPVDateParts[1]-1,10));
		manualLHPVDate.setDate(parseInt(manualLHPVDateParts[0],10));
		var lsDateParts = new String(creationDateTime).split("-");
		manualDate.setHours(0,0,0,0);
		manualDate.setFullYear(parseInt(lsDateParts[2],10));
		manualDate.setMonth(parseInt(lsDateParts[1]-1,10));
		manualDate.setDate(parseInt(lsDateParts[0],10));

		if(manualDate != null){
			if(manualLHPVDate.getTime() < manualDate.getTime()){
				showMessage( 'error','Invoice Date is  earlier than LS date Of LS Number ' +lsNumber+ ' not allowed !!');
				changeSpecificError('manualInvoiceDate');
				return false;
			}else{
				if(manualLHPVDate.getTime() > currentDate.getTime()) {
					showMessage('error','Future Date not allowed !!');
					changeSpecificError('manualInvoiceDate');
					return false;
				}else{
					if(manualLHPVDate.getTime() > previousDate.getTime()) {
						resetErrorMessages('manualInvoiceDate');
						return true;
					} else {
						showMessage('error','Please enter date till '+pastDaysAllowed+' days back from today !!');
						changeSpecificError('manualInvoiceDate');
						return false;
					};
				};
			};
		} else{
			if(manualLHPVDate.getTime() > currentDate.getTime()) {
				showMessage('error','Future Date not allowed !!');
				changeSpecificError('manualInvoiceDate');
				return false;
			}else{
				if(manualLHPVDate.getTime() > previousDate.getTime()) {
					changeSpecificError('manualInvoiceDate');
					return true;
				} else {
					showMessage('error','Please enter date till '+pastDaysAllowed+' days back from today !!');
					changeSpecificError('manualInvoiceDate');
					return false;
				};
			};
		};
	} else {
		showMessage('error','Please, Enter Valid Date !');
		changeSpecificError('manualInvoiceDate');
		return false;
	}
	return true;
}
function createBill() {
	var chk 		= document.getElementById("isManualInvoice");
	var lsDate 	 	= null;
	var lsNumber 	= null;
	var tbl  		=  document.getElementById('reportTable');
	var rowCount 	= tbl.rows.length;
	var lsId 		= 0;
	
	if(chk != null) {
		if(chk.checked) {
			var manualInvoiceNumber		= document.getElementById("manualInvoiceNumber");
			if(manualInvoiceNumber != null) {
				if(manualInvoiceNumber.value.length <= 0 || manualInvoiceNumber.value == 'Invoice Date') {
					showMessage('error',"Please Enter Manual Invoice Number !!");
					toogleElement('basicError2','block');
					var elPos = getPosition('manualInvoiceNumber');
					changeError1('manualInvoiceNumber',elPos.x,elPos.y);
					//window.scrollByPages(1);
					$("#manualInvoiceNumber").focus(); 
					return false;
				} 
			}
		}
	}
	
	var manualInvoiceDate		= document.getElementById("manualInvoiceDate");
	
	if(manualInvoiceDate != null) {
		if(manualInvoiceDate.value.length <= 0 || manualInvoiceDate.value == 'Invoice Date') {
			showMessage('error',"Please Enter Manual Invoice Date !!");
			toogleElement('basicError2','block');
			var elPos = getPosition('manualInvoiceDate');
			changeError1('manualInvoiceDate',elPos.x,elPos.y);
			//window.scrollByPages(1);
			$("#manualInvoiceDate").focus(); 
			return false;
		} 

		for(var index=0; index < rowCount-2; index++){
			if(tbl.rows[index].cells[0].children[0].checked){
				if(index!=0){
					lsId 	 = tbl.rows[index].cells[0].children[0].value;
					lsDate 	 = tbl.rows[index].cells[2].innerHTML;
					lsNumber = tbl.rows[index].cells[1].innerHTML;
					if(chkDate(manualInvoiceDate.value,lsDate,lsNumber,1)){
					} else {
						return false;
						break;
					};  
				}
			};
		}
	}
	
	var tableEl = document.getElementById("reportTable");
	var flag = false;
	var flag1 = false;
	var i;
	for (i = 1; i < tableEl.rows.length -1; i++){
		if(tableEl.rows[i].cells[0].getElementsByTagName("input")[0] != null && tableEl.rows[i].cells[0].getElementsByTagName("input")[0].checked){
			flag=true;
		}

	}
	
	if(flag == false){
		showMessage('error',"Please select LS No.");
		toogleElement('basicError','block');
		return false;
	} else {
		
	var manualInvoiceDateValue = $('#manualInvoiceDate').val().split("-");
	var manualInvoiceDate = new Date(manualInvoiceDateValue[2], manualInvoiceDateValue[1] - 1, manualInvoiceDateValue[0]);
	var previousDateValue = previousDate1.split("-");
	var backDate = new Date(previousDateValue[2], previousDateValue[1] - 1, previousDateValue[0]);
	var currentDate  = new Date(curDate);
    
	  if(manualInvoiceDate == null || manualInvoiceDate == '' || manualInvoiceDate == 'Invalid Date' ) {
		  showMessage('error',"Please Select Date.");
		toogleElement('basicError','block');
		return false;
	} else if(manualInvoiceDate < backDate){
		
		flag1 = false;
	} else if(manualInvoiceDate > currentDate.getTime()) {
		showMessage('error','Future Date not allowed !!');
		changeSpecificError('manualInvoiceDate');
		return false;
	} else{
		flag1 = true;
	}
	if(flag1 == false){
		showMessage('error',"Please Select "+noOfDays+" Days back Date Only OR Todays.");
		toogleElement('basicError','block');
		return false;
	} else {
		var remark = document.getElementById("remark");
		if(remark.value=='Remark' || remark.value=='REMARK'){
			remark.value='';
		}
		toogleElement('basicError','none');
		var answer = confirm ("Are you sure you want to Create Bill ?");
		if (answer){
			document.createBillForm.pageId.value  	= 	'249';
			document.createBillForm.eventId.value 	= 	'3' ;
			document.createBillForm.action			=	"createBillForm.do";
			//Disable page
			disableButtons();
			showLayer();
			document.createBillForm.submit();
		}
		else{return false;}

	}
	}

}

function createLRWiseCrossingAgentBill() {
	var chk 		= document.getElementById("isManualInvoice");
	var lsDate 	 	= null;
	var lsNumber 	= null;
	var tbl  		=  document.getElementById('reportTable');
	var rowCount 	= tbl.rows.length;
	
	if(chk != null) {
		if(chk.checked) {
			var manualInvoiceNumber		= document.getElementById("manualInvoiceNumber");
			if(manualInvoiceNumber != null) {
				if(manualInvoiceNumber.value.length <= 0 || manualInvoiceNumber.value == 'Invoice Date') {
					showMessage('error',"Please Enter Manual Invoice Number !!");
					toogleElement('basicError2','block');
					var elPos = getPosition('manualInvoiceNumber');
					changeError1('manualInvoiceNumber',elPos.x,elPos.y);
					//window.scrollByPages(1);
					$("#manualInvoiceNumber").focus(); 
					return false;
				} 
			}
		}
	}
	
	var manualInvoiceDate		= document.getElementById("manualInvoiceDate");
	
	if(manualInvoiceDate != null) {
		if(manualInvoiceDate.value.length <= 0 || manualInvoiceDate.value == 'Invoice Date') {
			showMessage('error',"Please Enter Manual Invoice Date !!");
			toogleElement('basicError2','block');
			var elPos = getPosition('manualInvoiceDate');
			changeError1('manualInvoiceDate',elPos.x,elPos.y);
			//window.scrollByPages(1);
			$("#manualInvoiceDate").focus(); 
			return false;
		} 

		for(var index=0; index < rowCount-2; index++){
			if(tbl.rows[index].cells[0].children[0].checked){
				if(index!=0){
					lsDate 	 = tbl.rows[index].cells[2].innerHTML;
					lsNumber = tbl.rows[index].cells[1].innerHTML;
					if(chkDate(manualInvoiceDate.value,lsDate,lsNumber,1)){
					} else {
						return false;
						break;
					};  
				}
			};
		}
	}
	
	var tableEl = document.getElementById("reportTable");
	var flag = false;
	var flag1 = false;
	var i;
	for (i = 1; i < tableEl.rows.length -1; i++){
		if(tableEl.rows[i].cells[0].getElementsByTagName("input")[0] != null && tableEl.rows[i].cells[0].getElementsByTagName("input")[0].checked){
			flag=true;
		}

	}
	
	if(flag == false){
		showMessage('error',"Please select LR No.");
		toogleElement('basicError','block');
		return false;
	} else {
		
	var manualInvoiceDateValue = $('#manualInvoiceDate').val().split("-");
	var manualInvoiceDate = new Date(manualInvoiceDateValue[2], manualInvoiceDateValue[1] - 1, manualInvoiceDateValue[0]);
	var previousDateValue = previousDate1.split("-");
	var backDate = new Date(previousDateValue[2], previousDateValue[1] - 1, previousDateValue[0]);
	var currentDate  = new Date(curDate);
    
	  if(manualInvoiceDate == null || manualInvoiceDate == '' || manualInvoiceDate == 'Invalid Date' ) {
		  showMessage('error',"Please Select Date.");
		toogleElement('basicError','block');
		return false;
	} else if(manualInvoiceDate < backDate){
		
		flag1 = false;
	} else if(manualInvoiceDate > currentDate.getTime()) {
		showMessage('error','Future Date not allowed !!');
		changeSpecificError('manualInvoiceDate');
		return false;
	} else{
		flag1 = true;
	}
	if(flag1 == false){
		showMessage('error',"Please Select "+noOfDays+" Days back Date Only OR Todays.");
		toogleElement('basicError','block');
		return false;
	} else {
		var remark = document.getElementById("remark");
		if(remark.value=='Remark' || remark.value=='REMARK'){
			remark.value='';
		}
		toogleElement('basicError','none');
		var answer = confirm ("Are you sure you want to Create Bill ?");
		if (answer){
			document.createBillForm.pageId.value  	= 	'249';
			document.createBillForm.eventId.value 	= 	'6' ;
			document.createBillForm.action			=	"createBillForm.do";
			//Disable page
			disableButtons();
			showLayer();
			document.createBillForm.submit();
		}
		else{return false;}

	}
	}

}
function selectAllLSToCreateBill(param){
	var tab 	= document.getElementById("reportTable");
	var count 	= parseFloat(tab.rows.length-1);
	var row;

	if(param == true) {
		for (row = count-1; row > 0; row--) {
			if(tab.rows[row].cells[0].getElementsByTagName("input")[0] != null && !tab.rows[row].cells[0].getElementsByTagName("input")[0].checked) {
				tab.rows[row].cells[0].getElementsByTagName("input")[0].checked = true;
			}
		}
	} else if(param == false) {
		for (row = count-1; row > 0; row--) {
			if(tab.rows[row].cells[0].getElementsByTagName("input")[0] != null && tab.rows[row].cells[0].getElementsByTagName("input")[0].checked) {
				tab.rows[row].cells[0].getElementsByTagName("input")[0].checked = false;
			}
		}
	}
	showCreditDebitInfo();
}

function fillclearText(text,text1) {
	var textValue = text.value;
	if(textValue == '') {
		text.value = text1;
	} else {
		text.value = textValue;
	}
}

function resetError(el){
	toogleElement('basicError','none');
	toogleElement('msg','none');
	removeError(el.id);
}

function disableButtons(){
	var saveUp = document.getElementById('generateBillUpButton');
	var saveDown = document.getElementById('generateBillDownButton');
	var find = document.getElementById('find');
	if(saveUp != null){
		saveUp.style.display = 'none';
		saveUp.disabled = true;
	}
	if(saveDown != null){
		saveDown.style.display = 'none';
		saveDown.disabled = true;
	}
	if(find != null){
		find.disabled = true;
		find.style.display = 'none';
	}
}
function goToManualSelection(){
	var chk = document.getElementById("isManualInvoice");
	if(chk != null) {
		if(chk.checked) {
			document.getElementById("selectionCriteria").style.display = 'table-cell';
			document.getElementById("manualInvoiceNumber").focus();
		} else {
			document.getElementById("selectionCriteria").style.display = 'none';
			document.getElementById("manualInvoiceNumber").value='';
			document.getElementById("manualInvoiceDate").value='';
			$('#msgbox').fadeTo('fast', 0);
		};
	};
}

