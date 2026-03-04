/**
 * @Anant Chaudhary 10-07-2016
 */

function insertTruckArrival() {
	if(truckAlreadyArrived) {
		showMessage('info', truckArrivalDetailAlreadyExistInfoMsg);
		return;
	}
	
	var jsonObject		= new Object();
	
	jsonObject["dispatchLedgerId"]		= $('#dispatchLedgerId').val();
	
	if(isAllowBackDateInArrival && $('#arrivalDate').exists() && $('#arrivalDate').is(":visible")) {
		jsonObject["arrivalDate"]	= $('#arrivalDate').val();
		jsonObject["arrivalTime"] 	= $('#arrivalTime').val();
	}
	
	var checkBoxArray	= new Array();

	$.each($("input[name=wayBills]:checked"), function() { 
		checkBoxArray.push($(this).val());
	});
	
	jsonObject["wayBills"]				= checkBoxArray.join(',');
	
	getWayBillGodown(jsonObject);
	
	showLayer();
	
	$.ajax({
		type: "POST",
		url: WEB_SERVICE_URL+'/receiveWs/insertTruckArrivalDetail.do',
		data:jsonObject,
		dataType: 'json',
		success: function(data) {
			if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
				hideLayer();
			} else {
				if(data.message != undefined && data.message.type == 2) {
					showMessage('error', data.message.description);
					hideLayer();
					return;
				}

				var success						= data.success;
				var isExist						= data.isExist;
				isAllWayBillReadyToDeliver		= data.isAllWayBillReadyToDeliver;
				truckAlreadyArrived				= data.truckAlreadyArrived;
				
				if(isExist)
					showMessage('info', truckArrivalDetailAlreadyExistInfoMsg);
				else if(success)
					showMessage('success', truckArrivalDetailAddedSuccessMsg);
				
				if(subRegionExistForReceiveAndDispatch && isReceiveAndDispatchAllow) {
					$('#receiveDispatchButton').removeClass('hide disabled');
					$('#arrivalButton').addClass('disabled');
					$('#receiveButtonId').addClass('hide');
					
					$("#receiveDispatchButton").bind("click", function() {
						ReceiveDispatchWayBills('results');
					});
				} else {
					$('#receiveButtonId').removeClass('hide');
					$('#arrivalButton').addClass('disabled');
				}
				
				arrivalDate	= data.arrivalDate;
				
				if(data.truckArrivalNumberNeeded)
					setTruckArrivedMessage(data.truckAlreadyArrived, data.arrivalDate, data.arrivalTime, data.truckArrivalNumber);
				else
					setTruckArrivedMessage(data.truckAlreadyArrived, data.arrivalDate, data.arrivalTime, undefined);

				if(data.arrivalDateTime != undefined)
					$('#arrivalDateTime').val(data.arrivalDateTime);
				
				if(isAllWayBillReadyToDeliver)
					$('#receiveButtonId').addClass('hide');
				
				if(isAllowBackDateInArrival) {
					location.reload();
					setReceiveDateAfterArrival(arrivalDate);
				}
				
				hideLayer();
			}
		}
	});
}

function setTruckArrivedMessage(truckAlreadyArrived, arrivalDate, arrivalTime, truckArrivalNumber) {
	if(truckAlreadyArrived != undefined && truckAlreadyArrived != null) {
		$('.msg').empty();
		$('.msg').append('<span style="color: #20B2AA;" id="truckArrivedMsg">' + truckArrivedInfoMsg(arrivalDate, arrivalTime, truckArrivalNumber) + '</span>')
		//setValueToHtmlTag('truckArrivedMsg', truckArrivedInfoMsg(arrivalDate, arrivalTime, truckArrivalNumber));
	}
}

function getWayBillGodown(jsonObject) {
	var godownList		= new Array();
	
	for(var k = 0; k < wayBillReceivableModel.length; k++) {
		var wayBillId		= wayBillReceivableModel[k].wayBillId;
		
		if($('#wayBills_' + wayBillId).is(':checked')) {
			var godownId	= $('#godownId_' + wayBillId).val();
			
			godownList.push(wayBillId + '_' + godownId);
		}
	}
	
	jsonObject["godownList"]		= godownList.join(',');
}