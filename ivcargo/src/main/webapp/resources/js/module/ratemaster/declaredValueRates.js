
function addDeclaredValueCharge() {
		
	if (!validateDeclaredField()) return false;
	if (!validateFieldsDeclaredValue($('#declaredValueAmount').attr('id'))) return false;

	$.confirm({
		text: "Are you sure you want to save Charge ?",
		
		confirm: function() {
			showLayer();
			var jsonObject		= new Object();
			
			jsonObject["branchId"]				= $('#branchId').val();
			jsonObject["corporateAccountId"]	= $('#partyId').val();
			jsonObject["chargeTypeMasterId"]	= $('#chargesDropDown5').val();
			jsonObject["slabMasterId"]			= $('#slabs2').val();
			jsonObject["rate"] 					= $('#declaredValueAmount').val();
			
			$.ajax({
				type		: 	"POST",
				url			: 	WEB_SERVICE_URL + '/rateMasterWS/insertDeclaredValueRates.do',
				data		:	jsonObject,
				dataType	: 	'json',
				success		: 	function(data) {
					if(data.message != undefined) {
						var errorMessage = data.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						resetdeclaredValueCharges();
						hideLayer();
						return;
					} else
					hideLayer();
				}
			});
		},
		cancel: function() {
			return false;
		},
		dialogClass			: "modal-dialog modal-sm",
		position			: 'center',
		confirmButton		: 'Yes',
		cancelButton		: 'NO',
		confirmButtonClass	: 'btn-info',
		cancelButtonClass	: 'btn-danger'
	});	
}

function validateDeclaredField() {
	
	if(!validateInput(1, 'chargesDropDown5', 'chargesDropDown5', 'basicError', 'Please, Select Charge !')) {
		return false;
	}
	if (!validateInput(1, 'slabs2', 'slabs2', 'basicError', 'Please, Select Slab !')) {
		return false;
	}
	return true;
}


function validateFieldsDeclaredValue(textBox, select2) {
	if(!validateInput(1, textBox, textBox, 'basicError', 'Please, Insert charge greater than zero !'))
		return false;
	
	if(!validateInput(1, select2, select2, 'basicError', 'Select Applicable on !'))
		return false;
	
	return true;
}


function resetdeclaredValueCharges() {
	//$('#chargesDropDown5').empty();
	//$('#slabs2').empty();
	$('#declaredValueAmount').val("0");
}

//get declared value rates to edit
function getDecalredValueCharges() {
	if(!validateMainSection(1)) return false;
			
	$("#editDeclaredValueModal").modal({
		backdrop: 'static',
		keyboard: false
	});

	showLayer();

	var jsonObject				= new Object();
	
	jsonObject["branchId"]				= $('#branchId').val();
	jsonObject["corporateAccountId"]	= $('#partyId').val();
	jsonObject["chargeTypeMasterId"]	= $('#chargesDropDown5').val();
	jsonObject["slabMasterId"]			= $('#slabs2').val();
	jsonObject["rate"] 					= $('#declaredValueAmount').val();
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/rateMasterWS/getDeclaredValueSlabRates.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			if(data.message != undefined) {
				var errorMessage = data.message;
				$('#declaredValueDetails').html(message.typeSymble + ' ' + message.description);
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
				return;
			} else {
				createRatesEditDataForDelclareValues(data.rateMaster);
			}
			hideLayer();
		}
	});
	$("#myModal").modal();
}

function createRatesEditDataForDelclareValues(rateMaster) {
	$('#declaredValueDetails').empty();

	for (var i = 0; i < rateMaster.length; i++) {
		var rmId	= rateMaster[i].declaredValueSlabMasterId;
		var row		= createRow("tr_"+rmId, '');
		
		var col0	= createColumn(row, "td_"+rmId, '2%', 'right', '', '');
		
		var chargeTypeId	= createColumn(row, "td_"+rmId, '15', 'left', '', '');
		var partyCol		= createColumn(row, "td_"+rmId, '15%', 'left', '', '');
		var branchcCol	    = createColumn(row, "td_"+rmId, '15%', 'left', '', '');
		var minValueCol	    = createColumn(row, "td_"+rmId, '15%', 'left', '', '');
		var maxValueCol	    = createColumn(row, "td_"+rmId, '15%', 'left', '', '');
		var declaredValueCol= createColumn(row, "td_"+rmId, '15%', 'right', '', '');
		var col12			= createColumn(row, "td_"+rmId, '15%',  'left', '', '');
		var col13			= createColumn(row, "td_"+rmId, '20%', 'left', '', '');
		
		col0.append(i + 1);
		
		setHtml(chargeTypeId, rateMaster[i].chargeTypeMasterName);
		setHtml(partyCol, rateMaster[i].partyName);
		setHtml(branchcCol, rateMaster[i].branchName);
		setHtml(minValueCol, rateMaster[i].minValue);
		setHtml(maxValueCol, rateMaster[i].maxValue);
		setHtml(declaredValueCol, rateMaster[i].rate);

		var inputAttr1		= new Object();
		var input			= null;

		inputAttr1.id			= 'rate'+rmId;
		inputAttr1.type			= 'text';
		inputAttr1.value		= rateMaster[i].rate;
		inputAttr1.name			= 'rate'+rmId;
		inputAttr1.class		= 'form-control';
		inputAttr1.style		= 'width: 100px;text-align: right;';
		inputAttr1.onkeypress	= 'return validAmount(event);if(getKeyCode(event) == 17){return false;}';
		inputAttr1.onfocus		= 'if(this.value==0)this.value='+"''"+';';
		inputAttr1.onblur		= 'clearIfNotNumeric(this,0);';
		inputAttr1.disabled		= 'true';

		input	= createInput(col12,inputAttr1);
		input.attr( {
			'data-value' : rmId
		});

		var buttonEditJS		= new Object();
		var buttonEdit			= null;

		buttonEditJS.id			= 'edit'+rmId;
		buttonEditJS.name		= 'edit'+rmId;
		buttonEditJS.value		= 'Edit';
		buttonEditJS.html		= 'Edit';
		buttonEditJS.class		= 'btn btn-warning';
		buttonEditJS.onclick	= 'editDeclareValueRate(this);';
		buttonEditJS.style		= 'width: 60px;';

		buttonEdit			= createButton(col13, buttonEditJS);
		buttonEdit.attr({
			'data-value' : rmId
		});

		col12.append('&emsp;');

		var buttonSaveJS		= new Object();
		var buttonSave			= null;

		buttonSaveJS.id			= 'save'+rmId;
		buttonSaveJS.name		= 'save'+rmId;
		buttonSaveJS.value		= 'Save';
		buttonSaveJS.html		= 'Save';
		buttonSaveJS.class		= 'btn btn-primary';
		buttonSaveJS.onclick	= 'updateDeclareValueRate(this);';
		buttonSaveJS.style		= 'width: 60px;';

		buttonSave			= createButton(col13, buttonSaveJS);
		buttonSave.attr({
			'data-value' 	: rmId
		});

		col13.append('&emsp;');

		var buttonDeleteJS		= new Object();
		var buttonDelete			= null;

		buttonDeleteJS.id			= 'Delete'+rmId;
		buttonDeleteJS.name			= 'Delete'+rmId;
		buttonDeleteJS.value		= 'Delete';
		buttonDeleteJS.html			= 'Delete';
		buttonDeleteJS.class		= 'btn btn-danger';
		buttonDeleteJS.onclick		= 'deleteDeclareValueRate(this);';
		buttonDeleteJS.style		= 'width: 60px;';

		buttonDelete			= createButton(col13, buttonDeleteJS);
		buttonDelete.attr({
			'data-value' 	: rmId
		});

		$('#declaredValueDetails').append(row);
	}
}

function editDeclareValueRate(obj) {
	var rmId	= obj.getAttribute('data-value');
	$('#declaredValueDetails #rate'+rmId).removeAttr('disabled');
	$('#declaredValueDetails #save'+rmId).show();
	$(obj).hide();
}

function updateDeclareValueRate(obj) {
	var rmId		= obj.getAttribute('data-value');
	var rateValue	= $('#declaredValueDetails #rate'+rmId).val();

	updateDeclareValueRateMasterRate(rmId, rateValue);
	$('#declaredValueDetails #rate' + rmId).prop('disabled', true);
	$('#declaredValueDetails #edit' + rmId).show();
	$(obj).hide();
}

function deleteDeclareValueRate(obj) {
	var rmId		= obj.getAttribute('data-value');
	deleteDeclaredValueRate(rmId);
	$(obj).closest("tr").remove(); // closest function find closest tag of given id.
}

function deleteDeclaredValueRate(declaredValueId) {
	let jsonObject				= new Object();
	
	jsonObject["declaredValueId"]		= declaredValueId;
	
	showLayer();

	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/rateMasterWS/deleteDeclaredValueRate.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			hideLayer();
			
			if(data.message != undefined) {
				let errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			}
		}
	});
}


function updateDeclareValueRateMasterRate(declaredValueId, rate) {
	var jsonObject				= new Object();
	
	jsonObject["declaredValueId"]	= declaredValueId;
	jsonObject["rate"]				= rate;

	showLayer();

	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/rateMasterWS/updateDeclaredValueRates.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			hideLayer();
			
			if(data.message != undefined) {
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				return;
			}
		}
	});
}