function setPendingLRDetails(response) {
	var PendingLRs				= response.PendingLRs;
	$('#pendingLRDetails tbody').empty();
	
	for(var i = 0; i < PendingLRs.length; i++){
		var pendingLRs		= PendingLRs[i];
		
		var tr	= $('<tr id="pendingLRsId_'+pendingLRs.wayBillId+'">');
		if(pendingLRs.wayBillStatus == WAYBILL_STATUS_DISPATCHED){
			var td1	= $("<td style='width:40%; background: tomato;'>"+ pendingLRs.statusName +"</td>");
			var td2	= $("<td style='width:40%;'><a target = '_blank' href='ReceiveWayBill.do?pageId=221&eventId=1'>"+ pendingLRs.wayBillNumber +"</a></td>");
		} else {//deliveryPageUrl from header
			var td1	= $("<td style='width:40%; background: lightblue;'>"+ pendingLRs.statusName +"</td>");
			var td2	= $("<td style='width:40%;'><a target = '_blank' href='" + deliveryPageUrl + "&waybillNo="+pendingLRs.wayBillNumber+"&waybillId="+pendingLRs.wayBillId+"' >"+ pendingLRs.wayBillNumber +"</a></td>");
		}
		var td3	= $("<td>"+ 	pendingLRs.statusStr 		+"</td>");
		var td4	= $("<td>"+ 	pendingLRs.wayBillType 		+"</td>");
		var td5	= $("<td>"+ 	pendingLRs.consignorName 	+"</td>");
		var td6	= $("<td>"+ 	pendingLRs.sourceBranch 	+"</td>");
		var td7	= $("<td>"+ 	pendingLRs.packageDetails 	+"</td>");
		//var td8	= $("<td>"+ 	pendingLRs.dispatchDateStr 	+"</td>");
		var td9	= $("<td>"+ 	pendingLRs.receiveDateStr 	+"</td>");
		
		$(tr).append(td1);
		$(tr).append(td2);
		$(tr).append(td3);
		$(tr).append(td4);
		$(tr).append(td5);
		$(tr).append(td6);
		$(tr).append(td7);
		//$(tr).append(td8);
		$(tr).append(td9);

		$('#pendingLRDetails tbody').append(tr);
	}
	
	
	$("#pendingLRDetailsHeaderMsg").html("Kindly Deliver these LRs.")
	
	$("#pendingLRDetailsModal").modal({
		backdrop: 'static',
		keyboard: false
	});
}
