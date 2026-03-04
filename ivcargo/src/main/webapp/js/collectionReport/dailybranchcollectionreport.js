function storeSelectedValues(){

	var selectedCity = document.getElementById('subRegion');
	if(selectedCity != null){
		document.getElementById('selectedCityName').value = selectedCity.options[selectedCity.selectedIndex].text;
	}

	var selectedBranch = document.getElementById('branch');
	if(selectedBranch != null){
		document.getElementById('selectedBranchName').value = selectedBranch.options[selectedBranch.selectedIndex].text;
	}

	var selectedDestCity = document.getElementById('TosubRegion');
	if(selectedDestCity != null){
		document.getElementById('selectedDestinationCityName').value = selectedDestCity.options[selectedDestCity.selectedIndex].text;
	}
	
	var selectedPaymentType = document.getElementById('paymentType');
	if(selectedPaymentType != null){
		document.getElementById('selectedPaymentTypeName').value = selectedPaymentType.options[selectedPaymentType.selectedIndex].text;
	}
	
}

function afterTimeDelay() {
	childwin.document.getElementById('data').innerHTML=document.getElementById('reportData').innerHTML;
	optimisePrint();
}

function deleteColumn(table, cellIndex, headerRowPos){
	for (var i=headerRowPos; i<table.rows.length; i++)
		table.rows[i].deleteCell(cellIndex);
}

function updateColumn(table , cellIndex, headerRowPos){
	for (var i=headerRowPos+1; i<table.rows.length; i++){
		var cellValue =table.rows[i].cells[cellIndex].innerText;
		var trimmedValue=cellValue.substring(0,cellValue.lastIndexOf(' '));
		if(trimmedValue !='')
			table.rows[i].cells[cellIndex].innerText=trimmedValue;
	}
}

function removeBranch(table , cellIndex, headerRowPos){
	for (var i=headerRowPos+1; i<table.rows.length-1; i++){
		var cellValue =table.rows[i].cells[cellIndex].innerText;
		table.rows[i].cells[cellIndex].innerText=cellValue.substring(0,cellValue.indexOf('(')-1);
	}
}

function removeCity(table , cellIndex, headerRowPos){
	for (var i=headerRowPos+1; i<table.rows.length-1; i++){
		var cellValue =table.rows[i].cells[cellIndex].innerHTML;
		table.rows[i].cells[cellIndex].innerText=cellValue.substring(cellValue.indexOf('(')+1,cellValue.length-1);
	}
}

function setAfterDelayBooking() {
	childwin.document.getElementById('data').innerHTML= document.getElementById('categoryWiseBookingTableTd').innerHTML;
	document.getElementById('categoryWiseBookingPrint').style.visibility='visible';
	var dataTbl= childwin.document.getElementById('categoryWiseBooking');
	var row = document.getElementById('searchParameters').rows[1];
	dataTbl.deleteRow(0);
	var newRow = dataTbl.insertRow(0);
	dataTbl.setAttribute("width","800px");
	var divText='<td colspan="10">';

	for (var i=0; i<row.cells.length;i++) {
		divText+=row.cells[i].innerHTML;
	}
	divText=divText+'</td>';
	newRow.innerHTML += divText;
	childwin.print();
}

function setAfterDelayDelivery() {
	childwin.document.getElementById('data').innerHTML= document.getElementById('categoryWiseDeliveryTableTd').innerHTML;
	document.getElementById('categoryWiseDeliveryPrint').style.visibility='visible';
	var dataTbl= childwin.document.getElementById('categoryWiseDelivery');
	var row = document.getElementById('searchParameters').rows[1];
	dataTbl.deleteRow(0);
	var newRow = dataTbl.insertRow(0);
	dataTbl.setAttribute("width","800px");
	var divText='<td colspan="10">';

	for (var i=0; i<row.cells.length;i++){
		divText+=row.cells[i].innerHTML;
	}
	divText=divText+'</td>';
	newRow.innerHTML += divText;
	childwin.print();
}

function addNewRow(ref,tdData){
	var myTable = childwin.document.getElementById(ref);
	var newTable= document.createElement('table');
	newTable.width='100%';
	var newTR = document.createElement('tr');
	var newTD = document.createElement('td');
	newTD.innerHTML = tdData;
	newTR.appendChild (newTD);
	newTable.appendChild(newTR);
	myTable.appendChild(newTable);
}


function ViewDetails(){
	if(ValidateFormElement()){
		document.reportform.pageId.value = '23';
		document.reportform.eventId.value = '20';
		document.reportform.submit();
	};
}

function afterDelayForBookingPrint(){
	childwin.document.getElementById('data').innerHTML= document.getElementById('bookingTables').innerHTML;
	var dataTbl= childwin.document.getElementById('showSelectionCriteria');
	var row = document.getElementById('searchParameters').rows[1];
	var newRow = dataTbl.insertRow(0);
	dataTbl.setAttribute("width","800px");
	var divText='<td colspan="10">';
	for(var i=0; i<row.cells.length;i++) {
			divText+=row.cells[i].innerHTML;
	}
	divText=divText+'</td>';
	newRow.innerHTML += divText;
	if(document.getElementById('categoryWiseBookingTableTd'))addNewRow('data',document.getElementById('categoryWiseBookingTableTd').innerHTML);
	if(document.getElementById('cityWiseDetailsTableTd'))addNewRow('data',document.getElementById('cityWiseDetailsTableTd').innerHTML);
	if(document.getElementById('finalRow'))addNewRow('data',document.getElementById('finalRow').innerHTML);
	var finalRowDesc = childwin.document.getElementById('grandTotalDesc').innerText;
	if(finalRowDesc){
		childwin.document.getElementById('grandTotalDesc').innerText=finalRowDesc.substring(0,finalRowDesc.indexOf('+')-1);
	}
	childwin.document.getElementById('grandTotal').innerText = parseInt(totalBookingAmount)- parseInt(totalCancellationAmount);
	optimisePrint();
}

function afterDelayForDeliveryPrint(){
	childwin.document.getElementById('data').innerHTML= document.getElementById('deliveryTables').innerHTML;
	var dataTbl= childwin.document.getElementById('showSelectionCriteriaForDelivery');
	var row = document.getElementById('searchParameters').rows[1];
	var newRow = dataTbl.insertRow(0);
	dataTbl.setAttribute("width","800px");
	var divText='<td colspan="10">';
	for(var i=0; i<row.cells.length;i++) {
			divText+=row.cells[i].innerHTML;
	}
	divText=divText+'</td>';
	newRow.innerHTML += divText;
	addNewRow('data',document.getElementById('categoryWiseDeliveryTableTd').innerHTML);
	addNewRow('data',document.getElementById('finalRow').innerHTML);
	var finalRowDesc =childwin.document.getElementById('grandTotalDesc').innerText;
	childwin.document.getElementById('grandTotalDesc').innerText=finalRowDesc.substring(finalRowDesc.indexOf('+')+1,finalRowDesc.length);
	childwin.document.getElementById('grandTotal').innerText = parseInt(totalDeliveryAmount);
	optimisePrint();
}
function formatIncomingOutgoing(){
	var searchWord =/book...[cfpt ]^d|[dp][er]/ig,
	searchWord2 =/delivery.[dpt][reo]/ig,
	replaceWord =/book.../ig,
	replaceWord2 =/delivery/ig,
    queue = [document.body],
    curr;
while (curr = queue.pop()) {
    if (!curr.textContent.match(searchWord) && !curr.textContent.match(searchWord2)) continue;
    for (var i = 0; i < curr.childNodes.length; ++i) {
        switch (curr.childNodes[i].nodeType) {
            case Node.TEXT_NODE : // 3
                if (curr.childNodes[i].textContent.match(searchWord)) {
                    var text=curr.childNodes[i].textContent;
                    curr.childNodes[i].textContent=text.replace(replaceWord,'Outgoing ');
                }
                if (curr.childNodes[i].textContent.match(searchWord2)) {
                    var text=curr.childNodes[i].textContent;
                    curr.childNodes[i].textContent=text.replace(replaceWord2,'Incoming ');
                }
                break;
            case Node.ELEMENT_NODE : // 1
                queue.push(curr.childNodes[i]);
                break;
        }
    }
}
}
function setAfterDelayOtherBranchBooking() {
	childwin.document.getElementById('data').innerHTML= document.getElementById('categoryWiseOtherBranchBookingTableTd').innerHTML;
	document.getElementById('categoryWiseOtherBranchBookingPrint').style.visibility='visible';
	var dataTbl= childwin.document.getElementById('categoryWiseOtherBranchBooking');
	var row = document.getElementById('searchParameters').rows[1];
	dataTbl.deleteRow(0);
	var newRow = dataTbl.insertRow(0);
	dataTbl.setAttribute("width","800px");
	var divText='<td colspan="10">';

	for (var i=0; i<row.cells.length;i++) {
		divText+=row.cells[i].innerHTML;
	}
	divText=divText+'</td>';
	newRow.innerHTML += divText;
	childwin.print();
}
