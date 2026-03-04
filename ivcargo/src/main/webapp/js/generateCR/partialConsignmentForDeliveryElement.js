function viewPartialDetails() {
	
	$('#partialConsignmentData').empty();
	$('#partialWeightData thead').empty();
	
	for(var i=0;i<pendingDeliveryArticles.length;i++){
		
		var deliveryQuantity	= pendingDeliveryArticles[i].pendingQuantity;
		var deliveryWeight		= pendingDeliveryArticles[0].weight;
		var packingTypeName = pendingDeliveryArticles[i].packingTypeName;
		var pendingArts		= pendingDeliveryArticles[i].pendingQuantity;
		
		if(partialConsignmentDataArr != null && partialConsignmentDataArr.length > 0){
			var dataObj = partialConsignmentDataArr.find(function(consignment) {
				if(consignment.pendingDeliveryStockArticleDetailsId == pendingDeliveryArticles[i].pendingDeliveryStockArticleDetailsId)
					return consignment;
			});
			deliveryQuantity = dataObj.quantity;
			deliveryWeight	 = dataObj.weight;
		} 
		 	
		var pendingDeliveryStockArticleDetailsId	= pendingDeliveryArticles[i].pendingDeliveryStockArticleDetailsId;
		var dataColumnArray			= new Array();
		$(".creditlevel").css("font-size", "16px");
		
		dataColumnArray.push("<td class ='thead-inverse textClass'>"+packingTypeName+"</td>");
		dataColumnArray.push("<td class ='thead-inverse textClass'>"+pendingArts+"</td>");
		dataColumnArray.push("<td style='display:none'><input id='pendingQty_"+pendingDeliveryStockArticleDetailsId+"'  value='"+pendingArts+"'></td>");
		dataColumnArray.push("<td class ='thead-inverse textClass' ><input class='widthInPx' type='number' id='deliverQuantity_"+pendingDeliveryStockArticleDetailsId+"' value='"+deliveryQuantity+"' max='"+pendingArts+"' min='1' maxlength='4' onkeypress='return noNumbers(event);' onblur='hideInfo();clearIfNotNumeric(this,0);validatePartialQuantity("+pendingDeliveryStockArticleDetailsId+");'></td>");
		$('#partialConsignmentData').append('<tr>' + dataColumnArray.join(' ') + '</tr>');
	
		$(".textClass").css("font-size", "16px");
		$(".widthInPx").css("width", "70px");
	}
	var dataColumnArray2	= new Array();
	
	dataColumnArray2.push("<td class ='thead-inverse textClass' style='width:30%'><span style='width:60%'>Weight : <span style='padding-left:20px'><span id= 'totalWeight'>"+pendingDeliveryArticles[0].weight+"</span></td>");
	dataColumnArray2.push("<td class ='thead-inverse textClass' style='width:30%'><span>Deliver Weight</span></td>");
	dataColumnArray2.push("<td class ='thead-inverse textClass' style='width:30%'><input readonly disabled  id='deliverWeight' value='"+deliveryWeight+"'></td>");
	
	$('#partialWeightData thead').append('<tr>' + dataColumnArray2.join(' ') + '</tr>');
	
	$(".textClass").css("font-size", "16px");
	$(".widthInPx").css("width", "70px");
	
	$("#partialLrDeliveryModal").modal({
		backdrop: 'static',
		keyboard: false
	});
}

function updatePartialDetailsData(){
	
	partialConsignmentDataArr = [];
	
	var totalQtyForDeliver = 0;
	for(var i=0;i<pendingDeliveryArticles.length;i++){
		var id = pendingDeliveryArticles[i].pendingDeliveryStockArticleDetailsId;
		if(Number($('#deliverQuantity_'+id).val()) > 0){
			totalQtyForDeliver += Number($('#deliverQuantity_'+id).val());
		}
	}
	var singleQtyWeight = pendingDeliveryArticles[0].weight / pendingDeliveryArticles[0].totalQuantity;
	var dlyWeight = totalQtyForDeliver * singleQtyWeight;
	
	for(var i=0;i<pendingDeliveryArticles.length;i++){
		var id = pendingDeliveryArticles[i].pendingDeliveryStockArticleDetailsId;
		if(Number($('#deliverQuantity_'+id).val()) > 0){
			
			var parQuantity = Number($('#deliverQuantity_'+id).val());
			var pendingQty = Number($('#pendingQty_'+id).val());
			
			if(Number(parQuantity) > Number(pendingQty)){
				showMessage('error', 'You can not enter Quantity greater than '+pendingQty+'!');
				$('#deliverQuantity_'+id).val(0)
				return false;
			}
			var obj = new Object();
			obj.packingTypeMasterId	= pendingDeliveryArticles[i].packingTypeMasterId;
			obj.quantity 	= $('#deliverQuantity_'+pendingDeliveryArticles[i].pendingDeliveryStockArticleDetailsId).val();
			obj.consignmentDetailsId = pendingDeliveryArticles[i].consignmentDetailsId;
			obj.wayBillId			= pendingDeliveryArticles[i].wayBillId;
			obj.pendingDeliveryStockArticleDetailsId			= pendingDeliveryArticles[i].pendingDeliveryStockArticleDetailsId;
			obj.weight			= dlyWeight;
			partialConsignmentDataArr.push(obj);
		}
	}
	
	if(partialConsignmentDataArr != null && partialConsignmentDataArr.length > 0){
		$('#paymentDetailsTable').addClass('hide');
		$('.hideDlyCharges').addClass('hide');
		pendingDeliveryFlag	= true;
	}
	$('#partialLrDeliveryModal').modal('hide');
}
function cancelPartialDetailsData(){
	partialConsignmentDataArr = [];
	$('#partialLrDeliveryModal').modal('hide');
	$('#paymentDetailsTable').removeClass('hide');
	$('.hideDlyCharges').removeClass('hide');
	pendingDeliveryFlag = false;
}

function validatePartialQuantity(id){
	
	var parQuantity = Number($('#deliverQuantity_'+id).val());
	var pendingQty = Number($('#pendingQty_'+id).val());
	
	if(Number(parQuantity) > Number(pendingQty)){
		showMessage('error', 'You can not enter Quantity greater than '+pendingQty+'!');
		$('#deliverQuantity_'+id).val(0)
		return false;
	} else if(parQuantity < 0){
		showMessage('error', 'You can not enter Quantity less than 0!');
		$('#deliverQuantity_'+id).val(0)
		return false;
	} else if(parQuantity == pendingQty){
		showMessage('error', 'You can not deliver all quantity in partial delivery!');
		$('#deliverQuantity_'+id).val(0)
		return false;
	}
	
	var singleQtyWeight = pendingDeliveryArticles[0].weight / pendingDeliveryArticles[0].totalQuantity;
	
	var totalQtyForDeliver = 0;
	
	for(var i=0;i<pendingDeliveryArticles.length;i++){
		var id = pendingDeliveryArticles[i].pendingDeliveryStockArticleDetailsId;
		if(Number($('#deliverQuantity_'+id).val()) > 0){
			totalQtyForDeliver += Number($('#deliverQuantity_'+id).val());
		}
	}
	$('#deliverWeight').val(totalQtyForDeliver * singleQtyWeight);
}
