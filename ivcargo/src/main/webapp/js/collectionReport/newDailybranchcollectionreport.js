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