/**
 * 
 */

function getLorryHireDetailsByLorryHireNumberAndBranchIdForCancel() {

	var lorryHireNumber	= $('#lorryHireNumber').val();
	var str				= lorryHireNumber.replace(/\s/g, '');
	var selection		= 2;

	var jsonObject				= new Object();
	jsonObject.lorryHireNumber	= lorryHireNumber;
	jsonObject.selection		= selection;
	var jsonStr 				= JSON.stringify(jsonObject);

	showLayer();
	$.getJSON("jsp/transport/ajaxinterfaceForTransport2.jsp",
			{json:jsonStr,filter:37}, function(data) {

				if(jQuery.isEmptyObject(data)) {
					alert("Sorry, an error occurred in the system. Please report this problem to the System Administrator.");
					hideLayer();
					return false;
				} else if(data.error != null) {
					alert(data.error);
					hideLayer();
					return false;
				} else {
					var jsonObj		= data;
					addDataInTable2(jsonObj);
					hideLayer();
				}
			});
}

function openPrintForLH(lorryHireId,filter) {
	lorryHireId = document.getElementById('selectedLorryHireId').value;
	filter		= document.getElementById('filter').value;
	newwindow=window.open('LHPrint.do?pageId=350&eventId=4&lorryHireId='+lorryHireId+'&filter='+filter, 'newwindow', config='height=610,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function resetSearchTableData(){
	$('#searchTable').hide();
	$('#searchTable').find('tr').slice(2).remove();
	$('#cancellationReasonTbl').hide();
	$('#cancellationRemark').val("");
}

function validateSearchDetail() {

	var lorryHireNumber	= document.getElementById('lorryHireNumber');
	var str				= lorryHireNumber.value.replace(/\s/g, '');

	if(str.length == 0) {
		var ele = document.getElementById('error');
		showMessage('error',"Please, Enter Slip Number.");
		toogleElement('error','block');
		setTimeout(function(){if(lorryHireNumber)lorryHireNumber.focus();lorryHireNumber.select();},100);
		return false;
	} else {
		toogleElement('error','none');
		return true;
	}
}

function hideDuplicateNumError(){
    document.getElementById("duplicateLorryHireNumber").style.display = 'none';
}

function resetTableData(){
	var vehicleType     = document.getElementById('vehicleType');
	document.getElementById('percent').innerHTML = 0; 
	$('#lhMadeByBranchTable').hide();
	document.getElementById('lhMadeByBranch').innerHTML = '';
	resetField();
	resetElements(vehicleType);
	enableFullElements();
	$("#createLHButton").removeClass("btn_print_disabled").addClass("btn_print");
	$("#removeFromBranch").removeClass("btn_print_disabled").addClass("btn_print");
	$("#removeToBranch").removeClass("btn_print_disabled").addClass("btn_print");
	showAllElementsForEditRoute();
	deleteRow();
	searchVehicleNumber = null;
	row					= null;
	routeBranchArr 		= new Array();
	routeBranchArrForNotEdit = new Array();
	tableCol			= 3;
	branchCount			= 0;
	nextId				= 0;
}

function validate() {
	
}