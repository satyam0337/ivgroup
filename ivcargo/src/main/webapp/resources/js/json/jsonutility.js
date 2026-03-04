/**
 * get data from server
 */
function getJSON(jsonObject, url, callbackfun, filter) {
	let Model = Backbone.Model.extend({});
	let model = new Model();

	model.url = url;
	
	if (jsonObject == null)
		jsonObject	= new Object();

	jsonObject.CorporateAccountId	= localStorage.getItem("currentCorporateAccountId");
	jsonObject.userId				= localStorage.getItem("currentUserId");
	jsonObject.crmAccountGroupId	= localStorage.getItem("currentCorporateAccountGroupId");
	
	if(jsonObject.customerAccessId == undefined)
		jsonObject.customerAccessId		= localStorage.getItem("customerAccessId");
	
	if(typeof jsonObject.isCRMPage !== "undefined" && jsonObject.isCRMPage !== null && jsonObject.isCRMPage) {
		const executiveValue	= localStorage.getItem('currentExecutiveId');
		const accountGroupValue = localStorage.getItem('currentCorporateAccountGroupId');
		
		if (isValidLocalStorageValue(executiveValue))
			jsonObject.executiveId = executiveValue;
		
		if (isValidLocalStorageValue(accountGroupValue))
			jsonObject.accountGroupId = accountGroupValue;
	}

	model.fetch({
		type: 'POST',
		data : jsonObject,
		success : function(collection, response, options) {
			let errorMessage	= response.message;
			hideLayer();
			
			if(errorMessage != undefined) {
				let messageId	= errorMessage.messageId;
				
				if(messageId == 4 && filter != EXECUTE_WITHOUT_ERROR_MESSAGE) {//never change this 
					showResponseMessage(response);
				} else if(messageId == 3 || messageId == 403 || messageId == 588) {//never change this
					localStorage.setItem('errorMessage', errorMessage.description);
					window.location	= 'error.do?pageId=340&eventId=1&modulename=errorPage';
				} else if(messageId == 556) {//never change this
					localStorage.setItem('errorMessage', errorMessage.description);
					window.location	= 'error.do?pageId=340&eventId=1&modulename=reportErrorPage';
				} else
					executeGetJsonResult(response, callbackfun, filter);
			} else
				executeGetJsonResult(response, callbackfun, filter);
		}, error : function(err) {
			console.log(err)
			hideLayer();
		}
	});

	return true;
}

/**
 * execute JSON response
 */
function executeGetJsonResult (response, callbackfun, filter) {
	switch (filter) {
	case EXECUTE_WITHOUT_ERROR :

		/**
		 * display response message
		 */
		showResponseMessage(response);

		/**
		 * check if error found
		 */
		if (isError(response))
			return false;

		/**
		 * execute callback function
		 */
		callbackfun(response);
		break;
	case EXECUTE_WITHOUT_ERROR_MESSAGE :
		/**
		 * check if error found
		 */
		if (isError(response))
			return false;

		/**
		 * execute callback function
		 */
		callbackfun(response);
		break;
	case EXECUTE_WITH_ERROR : 
		/**
		 * display response message
		 */
		showResponseMessage(response);

		/**
		 * execute callback function
		 */
		callbackfun(response);
		break;
	case EXECUTE_WITH_NEW_ERROR : 
		/**
		 * display response message
		 */
		showNewResponseMessage(response);
		/**
		 * execute callback function
		 */
		callbackfun(response);
		break;
	default:

		/**
		 * execute callback function
		 */
		callbackfun(response);
		break;
	}
	
	return true;
}

function getAllInputElementJSONObject() {
	let jsonOutObject = new Object();
	/**
	 * return values of input values as element name and element value pair 
	 */
	$('body :input').each(function (index){if($(this).val() != ""){jsonOutObject[$(this).attr('name')] = $.trim($(this).val());}});
	return jsonOutObject;
}

function getInputElementJSONObjectByDivId(divId) {
	let jsonOutObject = new Object();
	/**
	 * return values of input values as element name and element value pair 
	 */
	$('#'+divId +' :input').each(function (index){if($(this).val() != ""){jsonOutObject[$(this).attr('name')] = $.trim($(this).val());}});
	return jsonOutObject;
}

function getInputElementJSONObjectByElementIdArray(elementIdArray) {
	let jsonOutObject = new Object();
	/**
	 * return values of input values as element name and element value pair 
	 */
	$.each(elementIdArray, function( index, value ) {
		if($('#'+value).val() != ""){jsonOutObject[$('#'+value).attr('name')] = $.trim($('#'+value).val());};
	});

	return jsonOutObject;
}

function getJsonDataThroughAjax(inObject){
	$.getJSON(inObject.url, {json:JSON.stringify(inObject.inObject)}, function(data) {
		inObject.callbackFunction(data);
	}).error(function(e) { 
		showMessage('error', 'Not able to execute process !');
		hideLayer();
	})
}

function checkErrorInData(jsonInObj){
	if(jsonInObj.message != null && jsonInObj.message != undefined ){
		showMessage('error',jsonInObj.message.description);
		hideLayer();
		return false;
	}
	
	return true;
}

function getAjax(jsonObject, url, callbackfun, filter) {
	if (jsonObject == null)
		jsonObject	= new Object();
	
	if(typeof jsonObject.isCRMPage !== "undefined" && jsonObject.isCRMPage !== null && jsonObject.isCRMPage) {
		const executiveValue	= localStorage.getItem('currentExecutiveId');
		const accountGroupValue = localStorage.getItem('currentCorporateAccountGroupId');
			
		if (isValidLocalStorageValue(executiveValue))
			jsonObject.executiveId = executiveValue;
			
		if (isValidLocalStorageValue(accountGroupValue))
			jsonObject.accountGroupId = accountGroupValue;
	}
	
	let isCRMPage	= typeof jsonObject.isCRMPage !== "undefined" && jsonObject.isCRMPage !== null && jsonObject.isCRMPage;
	
	$.ajax({
		url: url,
		type: 'POST',
		data: jsonObject,
		dataType: 'json',
		contentType: isCRMPage ? "application/x-www-form-urlencoded" : "application/json",
		success : function (response) {
			let errorMessage	= response.message;
			hideLayer();
			
			if(errorMessage != undefined) {
				let messageId	= errorMessage.messageId;
				
				if(messageId == 4) {//never change this 
					if(filter == EXECUTE_WITH_NEW_ERROR)
						showNewResponseMessage(response);
					else
						showResponseMessage(response);
				} else if(messageId == 3 || messageId == 403 || messageId == 588) {//never change this
					localStorage.setItem('errorMessage', errorMessage.description);
					window.location	= 'error.do?pageId=340&eventId=1&modulename=errorPage';
				} else if(messageId == 556) {//never change this
					localStorage.setItem('errorMessage', errorMessage.description);
					window.location	= 'error.do?pageId=340&eventId=1&modulename=reportErrorPage';
				} else
					executeGetJsonResult(response, callbackfun, filter);
			} else
				executeGetJsonResult(response, callbackfun, filter);
		}, error : function(err) {
			console.log(err)
			hideLayer();
		}
	});

	return true;
}

function isValidLocalStorageValue(value) {
	return value !== null && value !== 'null' && value !== undefined && value !== 'undefined';
}