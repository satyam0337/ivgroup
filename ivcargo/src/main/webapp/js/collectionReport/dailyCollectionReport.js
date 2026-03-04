/**
 *  @Author Anant Chaudhary	03-02-2016
 */
//alert(accountGroupId != southernGroupId);
function ViewDetails(){
	ValidateFormElement();
	document.reportform.pageId.value = '23';
	document.reportform.eventId.value = '24';
	document.reportform.submit();
}

function storeSelectedValues(){

	var selectedCity 		= document.getElementById('TosubRegion');
	var selectedBranch 		= document.getElementById('SelectDestBranch');
	var selectedExecutive 	= document.getElementById('Executive');
	
	if(selectedCity != null) {
		setValueToTextField('selectedCityName', selectedCity.options[selectedCity.selectedIndex].text);
	}

	if(selectedBranch != null) {
		setValueToTextField('selectedBranchName', selectedBranch.options[selectedBranch.selectedIndex].text);
	}

	if(selectedExecutive != null) {
		setValueToTextField('selectedExecutiveName', selectedExecutive.options[selectedExecutive.selectedIndex].text);
	}
	
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

function printCategoryWiseBooking(accountGroupName, branchAddress, branchPhoneNo, detailHeader) {
	if(accountGroupId == southernGroupId) {
		detailHeader = detailHeader.replace('Booking', 'Outgoing');
	}
	
	changeVisibility('categoryWiseBookingPrint', 'hidden');
	
	childwin = window.open ('jsp/print.jsp?accountGroupName='+accountGroupName+'&branchAddress='+branchAddress+'&branchPhoneNo='+branchPhoneNo+'&detailHeader='+detailHeader , 'newwindow', config='height=425,width=840, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	window.setTimeout(setAfterDelayBooking, 1000);
}

function setAfterDelayBooking() {
	childwin.document.getElementById('data').innerHTML = document.getElementById('categoryWiseBookingTableTd').innerHTML;
	
	changeVisibility('categoryWiseBookingPrint', 'visible');
	
	var dataTbl	= childwin.document.getElementById('categoryWiseBooking');
	var row 	= document.getElementById('searchParameters').rows[0];
	
	dataTbl.deleteRow(0);
	var newRow = dataTbl.insertRow(0);
    dataTbl.setAttribute("width", "800px")
  
    var divText = '<td colspan="10">';

	for (var i = 0; i < row.cells.length; i++) {
		divText += row.cells[i].innerHTML;
	}
	
	divText = divText + '</td>'
	newRow.innerHTML += divText;
	childwin.print();
}

function printReportData(accountGroupName, branchAddress, branchPhoneNo, detailHeader) {
	childwin = window.open ('jsp/print.jsp?accountGroupName='+accountGroupName+'&branchAddress='+branchAddress+'&branchPhoneNo='+branchPhoneNo+'&detailHeader='+detailHeader , 'newwindow', config='height=425,width=840, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	window.setTimeout(afterTimeDelay, 1000);
}

function afterTimeDelay() {
	childwin.document.getElementById('data').innerHTML=document.getElementById('reportData').innerHTML; 
	optimisePrint();
}

function optimisePrint(){
	var reportData 			= childwin.document.getElementById('data');
	var allContainedTables 	= reportData.getElementsByTagName('table');
	
	for(i = 0; i < allContainedTables.length - 1; i++){
		if(allContainedTables[i].id=='bookingTables' || allContainedTables[i].id=='deliveryTables') {continue;}
			var tbl = allContainedTables [i]; // table reference  
		 // var lastCol = tbl.rows[1].cells.length;  
		  // delete unwanted cells (for each row)  
		    for (var j = 2; j < 6; j++) {
		    	if(tbl.rows[1] != null && tbl.rows[1].cells[j] != null) {
		    		var cellValue	= tbl.rows[1].cells[j].innerText;

		    		if(cellValue == 'Booked By' || cellValue == 'Consignee' || cellValue == 'Consignor') {
		    			updateColumn(tbl, j);
		    		}

		    		if(cellValue== 'Destination' ||cellValue == 'Origin') {
		    			if(accountGroupId != southernGroupId)
		    				removeBranch(tbl, j );
		    			else {
		    				removeCity(tbl, j );
		    			}
		    		}
		    	} 
		  }
		  
	}
	childwin.print();
}

function deleteColumn(table , cellIndex) {  
  for (var i=0; i<table.rows.length; i++)
	  table.rows[i].deleteCell(cellIndex);  
} 

function updateColumn(table , cellIndex) {
  	for (var i=1; i<table.rows.length; i++)
  	{
  	  	var cellValue =table.rows[i].cells[cellIndex].innerText;
  	  	var trimmedValue=cellValue.substring(0,cellValue.lastIndexOf(' '));
	  	if(trimmedValue !='')
	  	table.rows[i].cells[cellIndex].innerText=trimmedValue;
  	}
}

function removeBranch(table , cellIndex) {
	for (var i=1; i<table.rows.length; i++)
  	{
  	  	var cellValue =table.rows[i].cells[cellIndex].innerText;
	  	table.rows[i].cells[cellIndex].innerText=cellValue.substring(0,cellValue.indexOf('(')-1);
  	}
} 

function removeCity(table , cellIndex){
	for (var i=2; i<table.rows.length-1; i++)
  	{
  	  	var cellValue =table.rows[i].cells[cellIndex].innerHTML;
	  	table.rows[i].cells[cellIndex].innerText=cellValue.substring(cellValue.indexOf('(')+1,cellValue.length-1);
  	}
} 

function printBookingData(accountGroupName, branchAddress, branchPhoneNo, detailHeader) {
	if(accountGroupId == southernGroupId) {
		detailHeader = detailHeader.replace('Booking', 'Outgoing');
	}
	
	childwin = window.open ('jsp/print.jsp?accountGroupName='+accountGroupName+'&branchAddress='+branchAddress+'&branchPhoneNo='+branchPhoneNo+'&detailHeader='+detailHeader , 'newwindow', config='height=425,width=840, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	window.setTimeout(afterDelayForBookingPrint, 1000);
}

function afterDelayForBookingPrint(){
	 childwin.document.getElementById('data').innerHTML = document.getElementById('bookingTables').innerHTML;
	 addNewRow('data', document.getElementById('categoryWiseBookingTableTd').innerHTML);
	 addNewRow('data', document.getElementById('finalRow').innerHTML);
	
	 var finalRowDesc 	= childwin.document.getElementById('grandTotalDesc').innerText;
	
	 childwin.document.getElementById('grandTotalDesc').innerText=finalRowDesc.substring(0,finalRowDesc.indexOf('+')-1);
	 childwin.document.getElementById('grandTotal').innerText = parseInt(totalBookingAmount)- parseInt(totalCancellationAmount);
	 optimisePrint();
}

function printDeliveryData(accountGroupName, branchAddress, branchPhoneNo, detailHeader) {

	 if(accountGroupId == southernGroupId) {
		 detailHeader = detailHeader.replace('Delivery', 'Incoming');
	 }
	 
	 childwin = window.open ('jsp/print.jsp?accountGroupName='+accountGroupName+'&branchAddress='+branchAddress+'&branchPhoneNo='+branchPhoneNo+'&detailHeader='+detailHeader , 'newwindow', config='height=425,width=840, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	 window.setTimeout(afterDelayForDeliveryPrint, 1000);
}

function afterDelayForDeliveryPrint() {
	 childwin.document.getElementById('data').innerHTML	= document.getElementById('deliveryTables').innerHTML;
	 addNewRow('data', document.getElementById('categoryWiseDeliveryTableTd').innerHTML);
	 addNewRow('data', document.getElementById('finalRow').innerHTML);
	
	 var finalRowDesc = childwin.document.getElementById('grandTotalDesc').innerText;
	 
	 childwin.document.getElementById('grandTotalDesc').innerText = finalRowDesc.substring(finalRowDesc.indexOf('+')+1, finalRowDesc.length);
	 childwin.document.getElementById('grandTotal').innerText = parseInt(totalDeliveryAmount);
	 optimisePrint();
}

function addNewRow(ref, tdData) {
	var myTable = childwin.document.getElementById(ref);
	//var tBody = myTable.getElementsByTagName('tbody')[0];
	var newTable= document.createElement('table');
	newTable.width='100%';
	
	var newTR = document.createElement('tr');
	var newTD = document.createElement('td');
	
	newTD.innerHTML = tdData;
	newTR.appendChild (newTD);
	newTable.appendChild(newTR);
	myTable.appendChild(newTable);
}