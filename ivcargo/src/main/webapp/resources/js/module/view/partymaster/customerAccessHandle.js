$('#customerAccessTabElements a').click(function(e) {
	e.preventDefault();
	$(this).tab('show');
});

$(function() {
	$('#customerAccessTabElements a:first').tab('show');
})

function onPartySelectSelect() {
	$("#partyDisplayNameEle").val($("#" + $(this).attr("id")).val());
}

function onSubmitCA() {
	jsonObject = new Object();
	var $inputs = $('#addNewAccess :input');
	$inputs.each(function(index) {
		if ($(this).val() != "") {
			jsonObject[$(this).attr('name')] = $.trim($(this).val());
		}
	});
	getJSON(jsonObject, WEB_SERVICE_URL + '/customerAccessWS/addCustomerAccess.do?',afterSaveCA, EXECUTE_WITHOUT_ERROR);
}

function onUpdateCA() {
	jsonObject = new Object();
	let $inputs = $('#editAccess :input');
	$inputs.each(function(index) {
		if ($(this).val() != "") {
			jsonObject[$(this).attr('name')] = $.trim($(this).val());
		}
	});
	jsonObject.customerAccessId	= customerAccessId;
	getJSON(jsonObject, WEB_SERVICE_URL + '/customerAccessWS/updateCustomerAccess.do?',afterUpdateCA, EXECUTE_WITHOUT_ERROR);
}

function onEditCA() {
	$("#updateBtnCA").removeClass("hide");
}

function afterUpdateCA(response) {
	$("#addCA").trigger("click")
}

function afterSaveCA(response) {
	customerAccessId = response.CustomerAccessId
	showLayer();
	$("#editCA").trigger("click");
	jsonObject = new Object();
	jsonObject.customerAccessId = customerAccessId;
	getJSON(jsonObject, WEB_SERVICE_URL + '/customerAccessWS/getCustomerAccessByCustomerAccessId.do?', setDataInEditTabCA, EXECUTE_WITHOUT_ERROR);
}

function getDataForEdit() {
	customerAccessId = $("#partyNameEle_primary_key").val();
	jsonObject = new Object();
	jsonObject.customerAccessId = customerAccessId;
	getJSON(jsonObject, WEB_SERVICE_URL + '/customerAccessWS/getCustomerAccessByCustomerAccessId.do?', setDataInEditTabCA, EXECUTE_WITHOUT_ERROR);
}

function setDataInEditTabCA(response) {
	var object = response.CustomerAccess;
	setTimeout(function(){
		$("#partyNameDiv").addClass("hide");
		$("#partyNameEle").val(object.customerAccessName);
		$("#partyNameEle_primary_key").val(object.corporateAccountId);
		$("#partyDisplayNameEle").val(object.customerAccessName);
		$("#userNameEle").val(object.customerAccessLogin);
		$("#passwordEle").val(object.customerAccessPassword); 
		hideLayer();
	}, 1000);
}