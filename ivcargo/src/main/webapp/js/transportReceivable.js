function printTUR(lsId) {

	var pageId				= document.getElementById('pageIdForPrint').value;
	var eventId				= document.getElementById('eventIdForPrint').value;
	var receivedLedgerId	= document.getElementById('TUR_'+lsId).value;
	var dispatchLedgerId	= document.getElementById('LS_'+lsId).value;

	childwin = window.open ('TURPrint.do?pageId='+pageId+'&eventId='+eventId+'&receivedLedgerId='+receivedLedgerId+'&dispatchLedgerId='+dispatchLedgerId,'newwindow',config='height=600,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function checkIfExists(wayBillId,tableEl){
	var row=0;
	for (row = tableEl.rows.length-1; (row+1) > 0; row--) {
		if(tableEl.rows[row].cells[9].firstChild.nodeValue == wayBillId) {
			return true;
		}
	}
	return false;
}

function add(wayBillNo,wayBillType,sourceCity,destinationCity,sourceBranch,destinationBranch,date,amount,wayBillId,dispatchLedgerId){
	var tableDEST =  document.getElementById('tableBody');
	if(!checkIfExists(wayBillId,tableDEST)){

		var NewRow = document.createElement("tr");
		var one = document.createElement("td");
		var two = document.createElement("td");
		var three = document.createElement("td");
		var four = document.createElement("td");
		var five = document.createElement("td");
		var six = document.createElement("td");
		var seven = document.createElement("td");
		var eight = document.createElement("td");
		var nine = document.createElement("td");
		var ten = document.createElement("td");
		var elev = document.createElement("td");

		one.innerHTML = "<input name='wayBills' id='wayBills' type=checkbox checked value="+wayBillId+">";
		two.innerHTML = wayBillNo;
		three.innerHTML = wayBillType;
		four.innerHTML = sourceCity;
		five.innerHTML =destinationCity;
		six.innerHTML= sourceBranch;
		seven.innerHTML= destinationBranch;
		eight.innerHTML= date;
		nine.innerHTML= amount;
		ten.innerHTML= wayBillId;
		elev.innerHTML= "<input type=hidden name='dl"+wayBillId+"' value="+dispatchLedgerId+">";

		ten.style.display='none';
		elev.style.display='none';

		NewRow.appendChild(one);
		NewRow.appendChild(two);
		NewRow.appendChild(three);
		NewRow.appendChild(four);
		NewRow.appendChild(five);
		NewRow.appendChild(six);
		NewRow.appendChild(seven);
		NewRow.appendChild(eight);
		NewRow.appendChild(nine);
		NewRow.appendChild(ten);
		NewRow.appendChild(elev);

		tableDEST.appendChild(NewRow);

	}
	else{
		showSpecificErrors('errorSubmit',"the LR "+wayBillNo +" is already been added once");
		toogleElement('errorSubmit','block');
		return false;
	}
}

function validationFormElement() {

	var lsNo = document.getElementById('dispatchLedgerId').value;
	if(lsNo != null) {
		if(lsNo != "" && lsNo != "0") {
			return true;
		}
	}

	var searchVehicle = document.getElementById('searchVehicle').value;
	if(searchVehicle != null) {
		if(searchVehicle != "" && searchVehicle != "0") {
			return true;
		}
	}

	var selectedVehicleNoId = document.getElementById('selectedVehicleNoId').value;
	if(selectedVehicleNoId != null) {
		if(selectedVehicleNoId != "" && selectedVehicleNoId != "0") {
			return true;
		}
	}
	
	var regionId = $("#region").val();
	var subRegionId = $("#subRegion").val();
	var branchId = $("#branch").val();
	if(regionId <=0){
		showSpecificErrors('basicError','Please Select Region !');
		toogleElement('basicError','block');
		changeError1('region','0','0');
		$("#region").focus();
		return false;
	}
	return true;
}

function populateSubRegions(obj){
	allReqd = true;
	var subRegion =document.getElementById('subRegion');
	subRegion.options.length	= 1;
	subRegion.options[0].text	= (allReqd)?'ALL':'---- Sub Region ----';
	//subRegion.options[0].text	= '---- Area ----';
	subRegion.options[0].value	= 0;
	subRegion.selectedIndex = 0;
	populateSubRegionsByRegionId(obj.value,'subRegion',false,true);
	var branch =document.getElementById('branch');
	branch.options.length	= 1;
	branch.options[0].text	= (allReqd)?'ALL':'---- Select Branch ----';
	branch.options[0].value	= 0;
	branch.selectedIndex = 0;
}

function populateBranches(obj,id){
	document.getElementById('branch').options.length=1;;
	document.getElementById('branch').options[0].text ='------Select Branch  ----';
	document.getElementById('branch').options[0].value=0;
	//populateBranchesBySubRegionId(obj.value,id,false,true);
	populatePhysicalBranchesOnlyBySubRegionId(obj.value,id,false,true);
}

function populateAssignedLocations(obj,id){
	allReqd = true;
	document.getElementById('locationId').options.length=1;;
	document.getElementById('locationId').options[0].text ='ALL';
	document.getElementById('locationId').options[0].value=0;
	populateAssignedLocationsByLocationId(obj.value,id,false,true);
}


function resetError(el){
	toogleElement('basicError','none');
	toogleElement('msg','none');
	removeError(el.id);
}

function findValue(li) {
	if( li == null ) return alert("No match!");
	if( !!li.extra ) var sValue = li.extra[0];
	else var sValue = li.selectValue;
	if (sValue > 0 ){
		document.TransportReceivables.selectedVehicleNoId.value = sValue;
		//alert(document.TransportReceivables.selectedVehicleNoId.value);
	}else{
		alert('Unable to get Data, Please enter again.');
	}
}

function selectItem(li) {
	findValue(li);
}

function lookupAjax(){
	var oSuggest = null;
	oSuggest = $("#searchVehicle")[0].autocompleter;
	oSuggest.findValue();
	return false;
}

function getSeletedItemData(vehicleNoId){
	document.TransportReceivables.selectedVehicleNoId.value = vehicleNoId;
}

$(document).ready(function() {
	 
	 $("#searchVehicle").autocomplete({
		 source: "PendingBLHPVLedgerReport.do?pageId=50&eventId=149&filter=3&routeTypeId : <%= VehicleNumberMaster.ROUTE_TYPE_ROUTING_AND_BOTH%>",		
			minLength: 2,
			delay: 10,
			autoFocus: true,
			select: function(event, ui) {
				 if(ui.item.id != 0) {
					 getSeletedItemData(ui.item.id);
				} 
			},
			
		});
	 $('input[type="text"]').css("text-transform","uppercase");
}); 


function disableButtons(){
	 var findButton = document.getElementById("findButton");
	 if(findButton != null){
		 findButton.disabled = true;
		 findButton.style.display = 'none';
	 };
}