/**
 * 
 */
var textBoxCount = 0;
var validateDuplicatePinCode	= false;

function addMultiplePinnumber() {
	if($('#branch').val() == 0) {
		showMessage('error', branchNameErrMsg);
		$('#branch').css('border-color', 'red');
		$('#branch').focus();
		return;
	}
	
	textBoxCount = 1;
	
	$("#addPincodeModal").modal({
		backdrop: 'static',
	    keyboard: false
	});
	
	let jsonObject			= new Object();

	jsonObject["configBranchId"]		= $('#branch').val();
	
	showLayer();

	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/branchPincodeConfigurationWS/getBranchPincodeConfigByBranch.do',
		data		: jsonObject,
		dataType	: 'json',
		success: function(data) {
			if (data.success) {
				createPincodeEditData(data.branchPincodeConfigList);
			} else if(data.message) {
				let message	= data.message;
				$('#multiplePinCodeDetails').html(message.typeSymble + ' ' + message.description);
			}
			
			validateDuplicatePinCode	= data.validateDuplicatePinCode;

			hideLayer();
		}
	});

	$("#myModal").modal();
}

function addNewRow() {

	let inputCount = document.getElementById('container').getElementsByTagName('input').length;
	
	for(let i = 0; i < inputCount; i++) {
		let pincodeVal		= $('#pincode' + i).val();
		
		if(pincodeVal == '') {
			showMessage('error', 'Enter Pincode');
			$('#pincode' + i).css('border-color', 'red');
			$('#pincode' + i).focus();
			return false;
		} else if(pincodeVal.length != 6) {
			showMessage('error', '<i class="fa fa-times-circle"></i> Enter 6 digit Pincode');
			return false;
		}
	}
	
	$('#pincode0')
		.clone().val('')      // CLEAR VALUE.
		.attr('style', 'margin:3px 0;')
		.attr('id', 'pincode' + textBoxCount)     // GIVE IT AN ID.
		.appendTo("#container");
		
	textBoxCount = textBoxCount + 1;
		
	if(validateDuplicatePinCode) {
		if(textBoxCount > 1) {
			for(let i = 0; i < textBoxCount - 1; i++){
				setTimeout(function(){
				$("#pincode"+(textBoxCount - 1)).keyup(function(){
					validatePin($("#pincode"+(textBoxCount-1)).val());
				});
				}, 1000);
			}
		}
	}
}

function removeTextValue() {
	if (textBoxCount != 1) { 
		$('#pincode' + (textBoxCount - 1)).remove(); textBoxCount = textBoxCount - 1; 
	}
}

function addPincodeData() {
	let checkBoxArray	= new Array();
	
	let inputCount = document.getElementById('container').getElementsByTagName('input').length;
	
	let pincodeVal		= $('#pincode0').val();
	
	if($('#pincode0').val() == '') {
		showMessage('error', 'Enter Pincode');
		$('#pincode0').css('border-color', 'red');
		$('#pincode0').focus();
		return false;
	} else if(pincodeVal.length != 6) {
		showMessage('error', 'Enter 6 digit Pincode');
		return false;
	}
	
	for(let i = 0; i < inputCount; i++) {
		if($('#pincode' + i).val() != '') {
			let jsonObject = {};
			jsonObject["pincode"] 			= $('#pincode' + i).val();
			jsonObject["configBranchId"]	= $('#selectedBranchId').val();
			jsonObject["hours"]	= 0;
			jsonObject["distance"]	= 0;
			checkBoxArray.push(jsonObject);
		}
	}

	let jsonObject = {};
	jsonObject.dataArray 		= JSON.stringify(checkBoxArray);
	jsonObject["configBranchId"]	= $('#selectedBranchId').val();

	showLayer();
	
	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/branchPincodeConfigurationWS/addBranchPincodeConfigDataByAssignBranchId.do',
		data		: jsonObject,
		dataType	: 'json',
		success: function(response) {
			if (response.message) {
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			}

			resetModel();
			$('#addPincodeModal').modal('hide');
			
			hideLayer();
		}
	});
} 

function resetModel() {
	removeTextValue();
	$('#pincode0').val('');
	refreshAndHidePartOfPage('addPincodeModal', 'refresh');
}

function createPincodeEditData(branchPincodeConfigList) {

	$('#multiplePinCodeDetails').empty();
	
	let i = 0;

	for(const element of branchPincodeConfigList) {
		let rmId	= element.branchPincodeConfigurationId;
		let row		= createRowInTable("tr_" + rmId, '', '');

		let col0	= createColumnInRow(row, "td_" + rmId, '2%', 'right', '', '', '');
		let col1	= createColumnInRow(row, "td_" + rmId, '2%', 'right', '', '', '');
		let col2	= createColumnInRow(row, "td_" + rmId, '10%', 'left', '', '', '');
		
		col0.append(++i);
		
		let inputAttr1		= new Object();

		inputAttr1.id			= 'pincode' + rmId;
		inputAttr1.type			= 'text';
		inputAttr1.value		= element.pincode;
		inputAttr1.name			= 'pincode' + rmId;
		inputAttr1.class		= 'form-control';
		inputAttr1.style		= 'width: 100px;text-align: right;';
		inputAttr1.onfocus		= 'if(this.value==0)this.value='+"''"+';';
		inputAttr1.onblur		= 'clearIfNotNumeric(this,0);';
		inputAttr1.disabled		= 'true';
		inputAttr1.maxlength	= 6;
		inputAttr1.onkeyup		= 'checkDuplicatePincode(this,true)';

		let	input	= createInput(col1, inputAttr1);
		input.attr( {
			'data-value' : rmId
		});

		col2.append('&emsp;');
		col2.append('&emsp;');

		let buttonDeleteJS		= new Object();

		buttonDeleteJS.id			= 'Delete' + rmId;
		buttonDeleteJS.name			= 'Delete' + rmId;
		buttonDeleteJS.value		= 'Delete';
		buttonDeleteJS.type			= 'button';
		buttonDeleteJS.html			= 'Delete';
		buttonDeleteJS.class		= 'btn btn-danger';
		buttonDeleteJS.onclick		= 'deletePincode(this);';
		buttonDeleteJS.style		= 'width: 60px;';

		let	buttonDelete			= createButton(col2, buttonDeleteJS);
		buttonDelete.attr({
			'data-value' : rmId
		});

		$('#multiplePinCodeDetails').append(row);
	}
}

function deletePincode(obj) {
	let rmId		= obj.getAttribute('data-value');
	deletePincodeData(rmId);
	$(obj).closest("tr").remove(); // closest function find closest tag of given id.
}

function deletePincodeData(branchPincodeConfigId) {

	let jsonObject		= new Object();

	jsonObject["branchPincodeConfigurationId"]	= branchPincodeConfigId;
	jsonObject["configBranchId"]				= $('#selectedBranchId').val();
	jsonObject["pinCode"]						= $('#pincode' + branchPincodeConfigId).val();

	showLayer();
	
	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/branchPincodeConfigurationWS/deletePincodeConfigDataByPincodeConfigId.do',
		data		: jsonObject,
		dataType	: 'json',
		success: function(response) {
			if (response.message) {
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			}

			hideLayer();
		}
	});
}

function checkDuplicatePincode(obj, flag){
	if(validateDuplicatePinCode) {
		let	pincodeId				= obj.id;
		
		if(flag)
			var rmId	= obj.getAttribute('data-value');
		
		if(obj.textLength == 6){
			let jsonObject				= new Object();
			jsonObject["pincode"]		= obj.value;
			
			$.ajax({
			type		: "POST",
			url			: WEB_SERVICE_URL+'/branchPincodeConfigurationWS/checkDuplicatePincodeByBranch.do',
			data		: jsonObject,
			dataType	: 'json',
			success: function(response) {
				if (response.message) {
					let errorMessage = response.message;
					
					if(errorMessage.typeName == 'error') {
						$('#'+pincodeId).val('');
						
						if(flag)
							$('#save' + rmId).prop('disabled', true);
						
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + 'Pincode already exist in ' + response.branchName + ' Branch !');
					} else {
						if(flag)
							$('#save' + rmId).prop('disabled', false);
						
						$('#btSubmit').prop('disabled', false);
					}
				}
			}
		});
		}
	}
}

function validatePin(pincodeValue){
	let inputCount = document.getElementById('container').getElementsByTagName('input').length;
	
	if(pincodeValue.length == 6){
		for(let i = 0; i < inputCount-1; i++){
			if(pincodeValue == $('#pincode' + i).val()){
				showMessage('error', '<i class="fa fa-times-circle"></i> Pincode already Entered.Please Enter another Pincode !');
				$('#pincode'+(inputCount-1)).val('');
				return false;
			}
		}
	}
}