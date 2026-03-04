/**
 * 
 */

function receiveFund(el) {
	var status 			= 0;
	var selection 		= 1;
	var branchId 		= 0;
	var row 			= (el.id.substr(el.id.lastIndexOf('_') + 1, el.id.length));
	var rowArr 			= row.split(";");
	var fundTransferId 	= parseInt(rowArr[0]);
	var count 			= parseInt(rowArr[1]);
	
	var fundTransferBranch = document.getElementById('receiveBranchId_' + fundTransferId).innerText;
	
	if(!validate('receive',fundTransferBranch)){ 
		return false;
	 } 
	 
	if(!validateRemark(1, 'remark_' + count, 'remark_' + count)) {
		return false;
	}
	
	if( $('#fromDate_'+fundTransferId).val() != undefined){
		if(!validateDateBy(fundTransferId)){ 
			return false;
		 } 
	}
	var	remark = $('#remark_' + count).val();

	if(document.getElementById('receive_' + fundTransferId + ";" + count).value = 'Receive') {
		status = 3; //FundTransfer.FUNDTRANSFER_STATUS_RECEIVING
	}

	$.confirm({
		text: 'Are you sure you want to Receive Fund ?',
		confirm: function() {
			disableButtons(fundTransferId, count);
			showLayer();

			var jsonObject				= new Object();

			jsonObject.filter			= 1;
			jsonObject.fundTransferId	= fundTransferId;
			jsonObject.status			= status;
			jsonObject.remark			= remark;
			jsonObject.branchId			= branchId;
			jsonObject.selection		= selection;
			if( $('#fromDate_'+fundTransferId).val() != undefined){
				jsonObject.fromDate			= $('#fromDate_'+fundTransferId).val();
			}
			
			$.ajax({
				type		: 	"POST",
				url			: 	WEB_SERVICE_URL + '/fundReceiveWS/fundReceive.do',
				data		:	jsonObject,
				dataType	: 	'json',
				success		: 	function(data) {
					console.log(data);
			        hideLayer();
							
					setTimeout(function() {
						submitForm();
					}, 200);
				}
			});

		},
		cancel: function() {
			return false;
		},
		dialogClass			: "modal-dialog modal-sm",
		position			: 'center',
		confirmButton		: 'Yes',
		cancelButton		: 'NO',
		confirmButtonClass	: 'btn-info',
		cancelButtonClass	: 'btn-danger'
	});
}

function  validate(str,receivedBranch){
	var exeBranchId 	= document.getElementById('exeBranchId').value;
	var selectedBranch  = document.getElementById('selectedBranch').value;

		if(receivedBranch !=undefined && selectedBranch == 0)
			selectedBranch = receivedBranch;
				
	if(exeBranchId != selectedBranch){
		showMessage('error', "You can not "+str+ " other branch fund !");
		return false;		
	}
	return true;
}
/**
 * 
 */

function rejectFund(el) {
	var status 			= 0;
	var selection 		= 1;
	var branchId 		= 0;
	var row 			= (el.id.substr(el.id.lastIndexOf('_') + 1, el.id.length));
	var rowArr 			= row.split(";");
	var fundTransferId 	= parseInt(rowArr[0]);
	var count 			= parseInt(rowArr[1]);
	var rejectStatus 	= 0;
	var fundTransferBranch = document.getElementById('receiveBranchId_' + fundTransferId).innerText;

	if(!validate('reject',fundTransferBranch)){ 
		return false;
	 } 
	
	if(!validateRemark(1, 'remark_' + count, 'remark_' + count)) {
		return false;
	}

	var	remark = $('#remark_' + count).val();

	if(document.getElementById('receive_' + fundTransferId + ";" + count).value = 'Receive') {
		status = 2; //FundTransfer.FUNDTRANSFER_STATUS_REJECTED
	}
	if(executiveAccoutGroupId > accountGroupId || isAllowFundRejectEntryCreditSide){
		status = 3;
		rejectStatus = 2;
		
	}

	$.confirm({
		text: 'Are you sure you want to Reject Fund ?',
		confirm: function() {
			disableButtons(fundTransferId, count);
			showLayer();

			let jsonObject				= new Object();

			jsonObject.filter			= 1;
			jsonObject.fundTransferId	= fundTransferId;
			jsonObject.status			= status;
			jsonObject.remark			= remark;
			jsonObject.branchId			= branchId;
			jsonObject.selection		= selection;
			jsonObject.rejectStatus		= rejectStatus;
			
			$.ajax({
				type		: 	"POST",
				url			: 	WEB_SERVICE_URL + '/fundReceiveWS/rejectFundReceive.do',
				data		:	jsonObject,
				dataType	: 	'json',
				success		: 	function(data) {
					console.log(data);
			        hideLayer();
			        setTimeout(function() {
						submitForm();
					}, 200);
				}
			});

		},
		cancel: function() {
			return false;
		},
		dialogClass			: "modal-dialog modal-sm",
		position			: 'center',
		confirmButton		: 'Yes',
		cancelButton		: 'NO',
		confirmButtonClass	: 'btn-info',
		cancelButtonClass	: 'btn-danger'
	});
}

function disableButtons(fundTransferId, count) {
	document.getElementById('receive_' + fundTransferId + ";" + count).disabled 		= true;
	document.getElementById('receive_' + fundTransferId + ";" + count).className 		= 'btn_print_disabled';
	document.getElementById('receive_' + fundTransferId + ";" + count).style.display 	= 'none';
	document.getElementById('reject_' + fundTransferId + ";" + count).disabled			= true;
	document.getElementById('reject_' + fundTransferId + ";" + count).className 		= 'btn_print_disabled';
	document.getElementById('reject_' + fundTransferId + ";" + count).style.display 	= 'none';
}

function validateDateBy(fundTransferId){
	
	var dateString 				= $('#fromDate_'+fundTransferId).val(); 
	var fundTransferDateString 	= $('#fundTransferDate_'+fundTransferId).val(); 
	var currentDate 			= new Date(curDate);
	var previoustDate 			= new Date();
	
	previoustDate.setDate(previoustDate.getDate() - noOfDays);//declear in ReceivingFund.jsp
	
	var fundTransferDateYear,currentDateYear;
	
	var fundReceiveDateStringParts 		= dateString.split('-');
	var fundTransferDateStringPart 		= fundTransferDateString.split('-');
	
	var fundReceiveDate = new Date(fundReceiveDateStringParts[2],fundReceiveDateStringParts[1]-1,fundReceiveDateStringParts[0],currentDate.getHours(),currentDate.getMinutes(),currentDate.getSeconds(),currentDate.getMilliseconds());
	
	var fundTransferDate = new Date(fundTransferDateStringPart[2],fundTransferDateStringPart[1]-1,fundTransferDateStringPart[0],currentDate.getHours(),currentDate.getMinutes(),currentDate.getSeconds(),currentDate.getMilliseconds());
	
		
	fundTransferDateYear = fundTransferDate.getYear();
	currentDateYear 	 = currentDate.getYear();
	
	if(fundTransferDateYear < currentDateYear ){
		
		if(fundReceiveDate.getTime() > currentDate.getTime()){
			showMessage('error', 'You can not Select Future Date');
			return false;
		}else if(fundReceiveDate.getTime() < previoustDate.getTime()){
			showMessage('error', 'You Can not Select  Date Before 100 Day ');
			return false;
		}
		
	}else if(fundReceiveDate.getTime() > currentDate.getTime()){
		showMessage('error', 'You Can not Select Future Date');
		return false;
	}else if(fundReceiveDate.getTime() < fundTransferDate.getTime()){
		showMessage('error', 'You Can not Select  Date less than Fund Transfer Date');
		return false;
	}
	
	return true;
}

function submitForm(){
	if(!ValidateFundReceiveElement())
		return false;

	storeSelectedValues();
	document.FundReceivables.filter.value = 1;
	document.FundReceivables.submit();
}

function storeSelectedValues() {
	var selectedRegion = document.getElementById('region');
		
	if(selectedRegion != null)
		document.getElementById('selectedRegion').value = selectedRegion.options[selectedRegion.selectedIndex].text;

	var selectedSubRegion = document.getElementById('subRegion');

	if(selectedSubRegion != null)
		document.getElementById('selectedSubRegion').value = selectedSubRegion.options[selectedSubRegion.selectedIndex].text;

	var selectedBranch = document.getElementById('branch');

	if(selectedBranch != null)
		document.getElementById('selectedBranch').value = document.getElementById('branch').value; 
}
	
function resetError(el){
	toogleElement('error','none');
	removeError(el.id);
};

function ValidateFundReceiveElement() {
	let region = $('#region');
	let subRegion = $('#subRegion');
	let branch = $('#branch');

	if (region != null) {
		if (!validateRegion(3, 'region'))
			return false;
	}
	if (subRegion != null) {
		if (!validateSubRegion(3, 'subRegion'))
			return false;
	}
	if (branch != null) {
		if (!validateBranch(3, 'branch'))
			return false;
	}
	return true;
}

