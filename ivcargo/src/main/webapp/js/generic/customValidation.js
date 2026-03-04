/**
 * Anant 29-Jan-2024 3:37:11 pm 2024
 */

var RFC822 = /^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*$/;
var emailRegEx = /^[\W]*([\w+\-.%]+@[\w\-.]+\.[A-Za-z]{2,4}[\W]*,{1}[\W]*)*([\w+\-.%]+@[\w\-.]+\.[A-Za-z]{2,4})[\W]*$/;

let objectArray	= [];

function customValidation() {
	function add(obj) {
		if(Array.isArray(obj.validate)) {
			if (!Array.isArray(object.errorMessage)) {
				let errorMsg = 'If you pass in `validate:...` as an ' +
					' array, then `errorMessage:...` also needs to be an ' +
					' array. "' + object.validate + '", and "' + object.errorMessage + '"';
	
	             	throw Error(errorMsg);
			}
			
			let validateArray		= object.validate;
			let errorMessageArray	= object.errorMessage;
			
			if(validateArray.length != errorMessageArray.length) {
				let errorMsg	= '';
				throw Error(errorMsg);
			}
			
			let defaultErrorMessages= customMessage();
			
			validateArray.forEach(function (validate, i) {
				if(validate.search(":") > -1) {
					let arr = validate.split(':');
					let f	= arr[0];
	            	let errormsg	= arr.length > 1 ? defaultErrorMessages[f] + ' :' + arr[1] : defaultErrorMessages[f];
	            	
	            	if(errorMessageArray[i] == '' && defaultErrorMessages[f] != undefined)
	            		errorMessageArray[i] = errormsg;
				}
	
				obj.validate		= validate;
				obj.errorMessage	= errorMessageArray[i];
				objectArray.push(obj);
			});
		} else
			objectArray.push(obj);
	}
	
	function removeElement(selector) {
		objectArray.removeIf( function(item, ids) {
		    return item.selector == selector;
		});
	}
	
	function validate() {
		for(let object of objectArray) {
			let value			= $(object.selector).val();
			let validate		= object.validate;
			let errorMessage	= object.errorMessage;
			let args			= [];
				
			if(validate.toString().search(":") > -1) {
				let arr = validate.split(':');
	            			
	            args	= [];
	            		
	            args.push(value);
	            args.push(arr[1]);
	            
	            validate	= arr[0];
			} else
				args	= [value];
				
			if(typeof customValidation.checkFunctions[validate] === 'function' && !customValidation.checkFunctions[validate].apply(null, args)) {
				showMessage('error', errorMessage);
				return false;
			}
		}
		
		return true;
	}
	/**
     * Internal functions that are exposed to the public.
     */
    let nodInstace = {
        add:                    add,
        remove:                 removeElement,
        areAll:                 validate
    };

    return nodInstace;
}

function customMessage() {
	let defaultErrorMessages = new Object();
	defaultErrorMessages.presence 			= 'Cannot be left blank';
	defaultErrorMessages.exact 				= 'Value should be same';
	defaultErrorMessages.contains 			= 'Should contain specific value';
	defaultErrorMessages.not 				= 'Should not be same to specified value';
	defaultErrorMessages['min-length'] 		= 'Value should contain minimum length';
	defaultErrorMessages['mix-length'] 		= 'Value should contain maximum length';
	defaultErrorMessages['exact-length'] 	= 'Value should contain exact length';
	defaultErrorMessages['between-length'] 	= 'Value should contain specified length range';
	defaultErrorMessages['max-number'] 		= 'Value should not be more than maximum number allowed';
	defaultErrorMessages['min-number'] 		= 'Value should not be less than minimum number allowed';
	defaultErrorMessages['between-number'] 	= 'Value should be between minimum and maximum number allowed';
	defaultErrorMessages.integer 			= 'Value should be non-decimal number';
	defaultErrorMessages.float 				= 'Value should be decimal number';
	defaultErrorMessages['same-as'] 		= 'Has be same element';
	defaultErrorMessages['one-of'] 			= 'One of the value should be same';
	defaultErrorMessages['only-one-of'] 	= 'Only one of the values should be same';
	defaultErrorMessages.checked 			= 'Atleast one option should be checked';
	defaultErrorMessages['some-radio'] 		= 'Atleast one radio element option should be checked';
	defaultErrorMessages.regexp 			= 'Value should be according to the expresion specified';
	defaultErrorMessages.email 				= 'Provide valid email-id';
	defaultErrorMessages.panNum 			= 'Provide valid Pan number';
	defaultErrorMessages.tanNum 			= 'Provide valid Tan number';
	defaultErrorMessages.gstNum 			= 'Provide valid GST number';
	
	return defaultErrorMessages;
}

customValidation.checkFunctions = {
    'presence': function presence(value) {
        return value != undefined && value.length > 0;
    }, 'min-length': function minLength(value, minimumLength) {
    	return value != undefined && value.length > minimumLength;
    }, 'max-length': function maxLength(value, maximumLength) {
       return value != undefined && value.length > maximumLength;
    }, 'integer': function integer(value) {
        return /^\s*\d+\s*$/.test(value);
    }, 'float': function float(value) {
        return /^[-+]?[0-9]+(\.[0-9]+)?$/.test(value);
    }, 'email': function email(value) {
		return value != undefined && value.length > 0 && RFC822.test(value);
    }, 'multipleEmail': function multipleEmail(value) {
        return value != undefined && value.length > 0 && emailRegEx.test(value)
    }, 'panNum': function panNum(value) {
    	return /[A-Za-z]{5}\d{4}[A-Za-z]{1}/.test(value);
    }, 'tanNum': function tanNum(value) {
    	return /[A-Za-z]{4}\d{5}[A-Za-z]{1}/.test(value);
    }, 'gstNum': function gstNum(value){
		return /\d{2}[a-zA-Z]{5}\d{4}[a-zA-Z]{1}\d[zZ]{1}[a-zA-Z\d]{1}/.test(value);
	},
};