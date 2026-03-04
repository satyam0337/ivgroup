/**
 * will show message received in data object
 */
function showResponseMessage(data) {
	if (!isMessage(data))
		return true;
	
	let errorMessage = data.message;
	
	try {
		Swal.fire({
			icon: errorMessage.typeName,
			html: errorMessage.description,
		});
	} catch(e) {
		showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
	}

	return true;
}

/**
 * check if error message found in data
 * return true if found else false
 */
function isError(data) {
	let message = data.message;

	return message != undefined && message.type == MESSAGE_TYPE_ERROR;
}

/**
 * check if error message found in data
 * return true if founf else false
 */
function isMessage(data) {
	return data.message;
}

function showNewResponseMessage(data) {
	if (!isMessage(data))
		return;

	let errorMessage = data.message;
	showAlertMessage(errorMessage.typeName, errorMessage.description);
}

function showAlertMessage(iconType, message) {
	try {
		Swal.fire({
			icon: iconType,
			html: message,
		});
	} catch(e) {
		showMessage(iconType, message);
	}
}