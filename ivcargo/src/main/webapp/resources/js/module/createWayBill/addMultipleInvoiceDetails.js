var  currentDate = getCurrentDate();

function addMultipleInvoiceDetails() {
	if (configuration.showQtyPartNoAndDescriptionInInvoiceDetails == 'true') {
		$('.DescCol').removeClass('hide');
		document.styleSheets[0].insertRule('.invoice-modal-content { width: 70% !important; }', 0);
	}
	
	if (isInsuranceServiceAllow) {
		$('.subCommodityCol').removeClass('hide');
		createSubCommodityOption('subCommodity0');
		
		setTimeout(function() {
			$("#subCommodity0").change(function() {
				validateInvalidSubcommdityForInsurance(this.id, this.value);
			});
		}, 20);
	}

	$('#invoiceNo0').focus();
	
	$("#addInvoiceDetailModal").modal({
		backdrop: 'static',
		keyboard: false
	});

	let inputCount = $("#invoiceDetailsTable tr").length;
	
	if (configuration.showInvoiceDateBydefaultSameAsLRBookingDateInMultipleInvoiceDetails == 'true' || configuration.showInvoiceDateBydefaultSameAsLRBookingDateInMultipleInvoiceDetails == true) {
		if (isManualWayBill) {
			for (let i = 0; i < inputCount; i++) {
				$('#invoiceDate' + i).val($('#lrDateManual').val());
			}
		} else
			$('#invoiceDate0').val(currentDate);
	}

	setTimeout(function(){ $('#invoiceNo0').focus(); }, 500);
}
	
function viewMultipleInvoiceDetails() {
	$('#invDetails').html("");
	
	$("#invmodel").modal({
		backdrop: 'static',
		keyboard: false
	});
	
	setTimeout(function() {
		if(invoiceDetailArray.length == 0) {
			$('#invDetails').html('No records found !');
			
			$("#btnOk").click(function() {
				$('#invmodel').modal('hide');
				return false;
			});
		}
		
		$('#viewInvDetailTable tbody').empty();
		
		let columnArray		= new Array();
		
		for (const element of invoiceDetailArray) {
			let obj		= element;
			
			columnArray.push("<td style='text-align: center; vertical-align: middle; font-size: 15px;'>" + (obj.invoiceNumber) + "</td>");          
			columnArray.push("<td style='text-align: center; vertical-align: middle; font-size: 15px;'>" + (obj.invoiceDate) + "</td>");			
			columnArray.push("<td style='text-align: center; vertical-align: middle; font-size: 15px;'>" + (obj.declaredValue) + "</td>");
			
			if (configuration.showQtyPartNoAndDescriptionInInvoiceDetails == 'true') {
				columnArray.push("<td style='text-align: center; vertical-align: middle; font-size: 15px;'>" + (obj.quantity) + "</td>");  
				columnArray.push("<td style='text-align: center; vertical-align: middle; font-size: 15px;'>" + (obj.partNumber) + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle; font-size: 15px;'>" + (obj.description) + "</td>");
			}
			
			if (isInsuranceServiceAllow)
				columnArray.push("<td style='text-align: center; vertical-align: middle; font-size: 15px;'>" + (obj.subCommodity) + "</td>");
			
			columnArray.push("<td style='text-align: center; vertical-align: middle; font-size: 15px;'id='remove1" + obj.idNum + "'" +"'>" + "<button class='btn btn-danger glyphicon glyphicon-remove' type='button' onclick='removeInvDetails(this);' id='remove_" + obj.idNum + "' value='Remove'> </button></td>");

			$('#viewInvDetailTable tbody').append('<tr id="invoiceNumber' + obj.idNum + '">' + columnArray.join(' ') + '</tr>');
			columnArray = []
		}
		
		$('#btnOk').prop('disabled', false);
		$("#btnOk").click(function() {
			$('#invmodel').modal('hide');
		});
	},100);
}
	
function submitInvoiceDetailsData() {
	let inputCount = $("#invoiceDetailsTable tr").length;
	
	for(let i = 0; i < inputCount; i++) {
		if(!validateInvoiceFeilds(i))
			return;
	}
	
	invoiceDetailArray = [];
	
	let i = 0;
	
	$("#invoiceDetailsTable tr").each(function() {
		let invoiceDetailsObject = {};
		
		invoiceDetailsObject.idNum	= i + 1;
		invoiceDetailsObject.accountGroupId	= accountGroupId;
		
		$(this).find("input, select").each(function() {
			const id	= $(this).attr("id");
			
			if(id == 'invoiceNo' + i)
				invoiceDetailsObject.invoiceNumber		= $(this).val();
			
			if(id == 'invoiceDate' + i)	 
				invoiceDetailsObject.invoiceDate		= $(this).val();
			
			if(id == 'declaredValue' + i)
				invoiceDetailsObject.declaredValue		= $(this).val();
			
			if(id == 'qty' + i)
				invoiceDetailsObject.quantity			= $(this).val();
				
			if(id == 'partNo' + i)
				invoiceDetailsObject.partNumber			= $(this).val();
				
			if(id == 'invDesc' + i)
				invoiceDetailsObject.description		= $(this).val();
				
			if(id == 'subCommodity' + i) {
				invoiceDetailsObject.subCommodityMasterId	= $(this).val();
				invoiceDetailsObject.subCommodity			= $("#subCommodity" + i + " option:selected").text();
			}
			
			$(this).val('');
		});
		
		i++;

		invoiceDetailArray.push(invoiceDetailsObject);
	});
	
	$("#invoiceDetailsTable").find("tr:gt(0)").remove();
	
	$('#addInvoiceDetailModal').modal('hide');
	
	if (isInsuranceServiceAllow && $('#wayBillType').val() != WAYBILL_TYPE_FOC)
		createInsurance();
	
	$("#btSubmit1").click(function() {
		$('#STPaidBy').focus();
	});
}

function removeInvDetails(obj) {
	let rowId =	(obj.id).split('_')[1];
	let row = $('#remove_' + rowId).closest('tr');
	
	setTimeout(function() {
		row.remove();
	}, 100);
		
	let idNum	= Number(rowId);
	invoiceDetailArray = invoiceDetailArray.filter(function(el) { return el.idNum != idNum; });
	
	if (isInsuranceServiceAllow)
		createInsurance();
}

function validateInvoiceFeilds(i) {
	let invoiceNoVal		= $('#invoiceNo' + i).val();
	let invoiceDateVal		= $('#invoiceDate' + i).val();
	let declaredValueVal	= $('#declaredValue' + i).val();
	let subCommodityVal		= $('#subCommodity' + i).val();
	let partNoVal			= $('#partNo' + i).val();
	
	if(invoiceNoVal == '' ){
		showMessage('error', 'Enter Invoice  Number');
		$('#invoiceNo' + i).css('border-color', 'red');
		$('#invoiceNo' + i).focus();
		return false;
	} else if(invoiceDateVal == '') {
		showMessage('error', 'Enter invoice Date');
		$('#invoiceDate' + i).css('border-color', 'red');
		$('#invoiceDate' + i).focus();
		return false;
	} else if (!isValidDateFormat(invoiceDateVal)) {
		showMessage('error', 'Invalid date format. Use "dd-mm-yyyy".');
		$('#invoiceDate' + i).css('border-color', 'red');
		$('#invoiceDate' + i).focus();
		return false;  // Break out of the loop
	} else if((configuration.validateDeclaredValueInMultipleInvoiceDetails == 'true' || isInsuranceServiceAllow) && declaredValueVal == '') {
		showMessage('error', 'Enter declared Value');
		$('#declaredValue' + i).css('border-color', 'red');
		$('#declaredValue' + i).focus();
		return false;
	}
	
	if(validatePartNumber && partNoVal =='') {
		showMessage('error', 'Enter Part Number !');
		$('#partNo' + i).css('border-color', 'red');
		$('#partNo' + i).focus();
		return false;
	}
			
	if(validateInvoiceNumber && invoiceNoVal == '') {
		showMessage('error', 'Enter Invoice Number !');
		$('#invoiceNo' + i).css('border-color', 'red');
		$('#invoiceNo' + i).focus();
		return false;
	}
	
	if(isInsuranceServiceAllow && (subCommodityVal == null || subCommodityVal == undefined || subCommodityVal == 0)) {
		showMessage('error', 'Select Sub-Commodity');
		$('#subCommodity' + i).css('border-color', 'red');
		$('#subCommodity' + i).focus();
		return false;
	}
	
	return true;
}

function addNewRows() {
	let inputCount = $("#invoiceDetailsTable tr").length;
	
	for(let i = 0; i < inputCount; i++) {
		if(!validateInvoiceFeilds(i))
			return;
	}
	
	let row = $("#invoiceDetailsTable tr").last().clone();
	let oldId = Number(row.attr('id').slice(-1));
	let id = 1 + oldId;

	row.attr('id', 'invoiceDetails' + id );
	row.find('#invoiceNo' + oldId).attr('id', 'invoiceNo' + id);
	row.find('#invoiceDate' + oldId).attr('id', 'invoiceDate' + id);
	row.find('#declaredValue' + oldId).attr('id', 'declaredValue' + id);
	row.find('#qty' + oldId).attr('id', 'qty' + id);
	row.find('#partNo' + oldId).attr('id', 'partNo' + id);
	row.find('#invDesc' + oldId).attr('id', 'invDesc' + id);
	
	if (isInsuranceServiceAllow)
		row.find('#subCommodity' + oldId).attr('id', 'subCommodity' + id);
  
	$('#invoiceDetailsTable').append(row);
	$('#invoiceNo' + id).val('');
	$('#invoiceDate' + id).val('');
	$('#declaredValue' + id).val('');
	$('#qty' + id).val('');
	$('#partNo' + id).val('');
	$('#invDesc' + id).val('');
	$('#invoiceNo' + id).focus();
	
	if (configuration.showInvoiceDateBydefaultSameAsLRBookingDateInMultipleInvoiceDetails == 'true') {
		if (isManualWayBill)
			$('#invoiceDate' + id).val($('#lrDateManual').val());
		else
			$('#invoiceDate' + id).val(currentDate);
	}
	
	if (isInsuranceServiceAllow) {
		createSubCommodityOption('subCommodity' + id);
		
		setTimeout(function() {
			$("#subCommodity" + id).change(function() {
				validateInvalidSubcommdityForInsurance(this.id, this.value);
			});
		}, 20);
	}
	
	next	= "invoiceDate" + id;
}

function removeTextValue1() {
	let count = $('#invoiceDetailsTable tr').length;
			
	if(count == 1) {
		showMessage('error', 'You cannot remove last row !');
		return;
	}
	
	let $last = $('#invoiceDetailsTable').find("tr:last");
	$last.remove();
}

function resetInvoiceDetails() {
	invoiceDetailArray=[];
	$("#subCommodityType").val(0);
}