var maxSizeOfFileToUpload	= 1;
var WAYBILL_TYPE_PAID		= 1;
var WAYBILL_TYPE_TO_PAY		= 2;
var WAYBILL_TYPE_FOC		= 3;
var WAYBILL_TYPE_CREDIT		= 4;
var PARTY_TYPE_CONSIGNOR	= 1;
var PARTY_TYPE_CONSIGNEE	= 2;
var PARTY_TYPE_BOTH			= 3;
var zipFileName	= 'ivcargo_photo_';
 
var gstRegex		= /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;	
var gstRegexn		= /^[0-9]{2}[A-Z]{4}[0-9]{5}[A-Z]{1}[1-9]{1}[A-Z]{2}$/;
var gstRegexF1		= /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}[1-9A-JSZ]{1}[1-9A-Z]{1}$/;
var gstRegexF2		= /^[0-9]{12}[NUOT]{1}[FNRM]{1}[0-9TP]{1}$/;
var invalidNumberRegex		= /^(\d)\1{9}$|^(\d)(?!\2)(\d)\3{8}$|^(\d)\4{8}(?!\4)(\d)$|^\d{8,9}$/;
var monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
var monthFullNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var weekNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

var colors = [
	"#39add1", // light blue
	"#3079ab", // dark blue
	"#c25975", // mauve
	"#e15258", // red
	"#f9845b", // orange
	"#838cc7", // lavender
	"#7d669e", // purple
	"#53bbb4", // aqua
	"#51b46d", // green
	"#e0ab18", // mustard
	"#637a91", // dark gray
	"#f092b0", // pink
	"#b7c0c7"  // light gray
];

var imageExtensionArr = ['.jpeg', '.jpg', '.png', '.GIF', '.gif']

/**
 * @author Anant Chaudhary	11 - Apr - 2016
 */

/*
 * Function created to refresh and hide page with different behavior
 */
function refreshAndHidePartOfPage(divId, behavior) {	
	let ele		= document.getElementById(divId);
	
	if(ele != null) {
		if(behavior == 'hide')
			$("#"+divId).hide();
		else if(behavior == 'hideAndRefresh') {
			$("#"+divId).load(location.href+" #"+divId+">*", "");
			$("#"+divId).hide();
		} else if(behavior == 'refresh')
			$("#"+divId).load(location.href+" #"+divId+">*", "");
	}	
}

/*
 * Show part of the page
 */
function showPartOfPage(divId) {
	let ele		= document.getElementById(divId);
	
	if(ele != null)
		$("#"+divId).show();
}

/*
 * Change display property
 */
function changeDisplayProperty(id, displayType) {
	let ele		= document.getElementById(id);

	if(ele != null)	
		ele.style.display	= displayType;		
}

function changePageScrolling(id, scrollType) {
	let ele		= document.getElementById(id);

	if(ele != null)	
		ele.style.overflow	= scrollType;		
}

function changePageHeight(id, height) {
	let ele		= document.getElementById(id);

	if(ele != null)	
		ele.style.height	= height;		
}

function changePageWidth(id, width) {
	let ele		= document.getElementById(id);

	if(ele != null)	
		ele.style.width	= width;		
}

/*
 * Change visibility 
 */
function changeVisibility(eleId, visibleType) {
	let ele		= document.getElementById(eleId);

	if(ele != null)
		ele.style.visibility = visibleType;
}

/*
 * Remove table rows 
 */
function removeTableRows(tableId, type) {
	let ele		= document.getElementById(tableId);
	
	if(ele != null) {
		if(type == 'table')
			$("#"+tableId+" tr").remove();
		else if(type == 'tbody')
			$("#"+tableId+" tbody tr").remove();
		else if(type == 'tfoot')
			$("#"+tableId+" tfoot tr").remove();
		else if(type == 'thead')
			$("#"+tableId+" thead tr").remove();
	}	
}

/*
 * Remove Html tag attribute with id or class
 */
function removeHtmlAttribute(filter, id, attribute) {
	if(filter == 1)	//with class
		$("." + id).removeAttr(attribute);
	else if(filter == 2)	//with id
		$("#" + id).removeAttr(attribute);
}

/*
 * Function created to get difference between two days
 */
function diffBetweenTwoDays(id) {
	let ele		= document.getElementById(id);
	
	let oldDate		= null;
	
	if(ele != null)
		oldDate		= ele.value;
	
	if(oldDate == null)
		return 0;
	
	let newDate		= oldDate.split('-');	
	
	let start		= new Date(newDate[2], +newDate[1]-1, newDate[0]);
	
	let currentDate	= new Date();	
	let oneDay		= 24 * 60 * 60 * 1000;
	let diffDays	= (currentDate.getTime() - start.getTime())/oneDay;
	
	let days		= Math.round(diffDays);
	
	return days;
}

/*
 * Function created to get difference between two date
 */
function diffBetweenTwoDate(currentDate, futureDate) {
	let oneDay		= 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
	
	let diffTime	= futureDate.getTime() - currentDate.getTime();

	return Math.round(diffTime / oneDay);
}

//remove row from array with particular index
function removeRowFromArray(totalSD, uniqueVal) {
	for(let i = totalSD.length - 1; i >= 0; i--) {
		if(totalSD[i] === uniqueVal)
			totalSD.splice(i, 1);
	}
	
	return totalSD;
}

/*
 * Reload the page within 1.5 second
 */
function reloadPage() {
	setTimeout(function(){
		window.location.reload(1);
	}, 1500); 
}

/*
 * Change text field color and set focus
 */
function changeTextFieldColor(textId, textColor, bgColorCode, borderColorCode) {
	let ele		= document.getElementById(textId);
	
	if(ele != null) {
		ele.style.color				= textColor;
		ele.style.borderColor		= borderColorCode;
		ele.style.backgroundColor	= bgColorCode;
		ele.style.borderStyle		= 'solid';
		ele.focus();
	}
}

/*
 * Change text field color and set focus New 
 */
function changeTextFieldColorNew(ele, textColor, bgColorCode, borderColorCode) {
	if(ele != null) {
		ele.css("border","1px solid red");
		//ele.focus();
	}
}

function resetError(obj) {
	if(document.getElementById(obj.id) != null) {
		document.getElementById(obj.id).borderStyle = '';
		document.getElementById(obj.id).borderColor = 'green';
	}
}

/*
 * Change text field color without focus
 */
function changeTextFieldColorWithoutFocus(textId, textColor, bgColorCode, borderColorCode) {
	let ele		= document.getElementById(textId);
	
	if(ele != null) {
		ele.style.color				= textColor;
		ele.style.borderColor		= borderColorCode;
		ele.style.backgroundColor	= bgColorCode;
		ele.style.borderStyle		= 'solid';
	}
}

function changeHtmlTagColor(textId, textColor, bgColorCode, borderColorCode, borderStyle) {
	let ele		= document.getElementById(textId);
	
	if(ele != null) {
		ele.style.color				= textColor;
		ele.style.borderColor		= borderColorCode;
		ele.style.backgroundColor	= bgColorCode;
		ele.style.borderStyle		= borderStyle;
	}
}

function showMessageWithTimeout(messageType, errorMsg) {
	setTimeout(function() {
		showMessage(messageType, errorMsg);
	}, 300);
}
/*
 * validate input elements with different cases 
 */


function validateInputTextFeild(filter, elementID, errorElementId, messageType, errorMsg) {
	let element = document.getElementById(elementID);

	if(!element) {
		console.log('Element not found');
		return true;
	}

	switch (Number(filter)) {
	case 1:
		if (element.value == '' || element.value == 0) {
			showMessageWithTimeout(messageType, errorMsg);
			changeTextFieldColor(errorElementId, '', '', 'red');
			isValidationError	= true;
			return false;
		} else {
			hideAllMessages();
			changeTextFieldColorWithoutFocus(errorElementId, '', '', 'green');
			isValidationError	= false;
		}
		break;

	case 2:
		var reg = /^[6789]\d{9}$/ig;
		
		if(element.value.length != 10 || !element.value.match(reg)) {
			showMessageWithTimeout(messageType, errorMsg);
			changeTextFieldColor(errorElementId, '', '', 'red');
			isValidationError	= true;
			return false;
		} else {
			hideAllMessages();
			changeTextFieldColorWithoutFocus(errorElementId, '', '', 'green');
		}
		break;

	case 3:
		if (element.value == '' || element.value == -1) {
			showMessageWithTimeout(messageType, errorMsg);
			changeTextFieldColor(errorElementId, '', '', 'red');
			isValidationError	= true;
			return false;
		} else {
			hideAllMessages();
			changeTextFieldColorWithoutFocus(errorElementId, '', '', 'green');
		}
		break;

	case 4:
		if (element.value != '' && element.value != null && element.value.length != 11) {
			showMessageWithTimeout(messageType, errorMsg);
			changeTextFieldColor(errorElementId, '', '', 'red');
			isValidationError	= true;
			return false;
		} else {
			hideAllMessages();
			changeTextFieldColorWithoutFocus(errorElementId, '', '', 'green');
		}
		break;
		
	case 5:
		if (element.value != '' && element.value != null && element.value.length != 10) {
			showMessageWithTimeout(messageType, errorMsg);
			changeTextFieldColor(errorElementId, '', '', 'red');
			isValidationError	= true;
			return false;
		} else {
			hideAllMessages();
			changeTextFieldColorWithoutFocus(errorElementId, '', '', 'green');
		}
		break;
		
	case 6:
		if (element.value < 0) {
			showMessageWithTimeout(messageType, errorMsg);
			changeTextFieldColor(errorElementId, '', '', 'red');
			isValidationError	= true;
			return false;
		} else {
			hideAllMessages();
			changeTextFieldColorWithoutFocus(errorElementId, '', '', 'green');
		}
		break;
		
	case 7:		//filter to validate for phone number
		if(element.value.length > 5 && element.value.length < 9 || element.value.length == 10 || element.value.length == 0) {
			changeDisplayProperty(elementID, 'none');
			changeTextFieldColorWithoutFocus(errorElementId, '', '', 'green');
			return true;
		} else if(element.value != '0000000000') {
			showMessageWithTimeout(messageType, errorMsg);
			changeDisplayProperty(elementID, 'block');
			changeTextFieldColor(errorElementId, '', '', 'red');
			isValidationError	= true;
			return false;
		}
		break;
	case 8:		//filter to validate for Pan Number
		var pattern		= /^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/;
		
		if(element.value != null && element.value != '' && element.value != 'PAN NUMBER') {
			if(!element.value.match(pattern)) {
				showMessageWithTimeout(messageType, errorMsg);
				changeTextFieldColor(elementID, '', '', 'red');
				isValidationError	= true;
				return false;
			} else {
				hideAllMessages();
				changeTextFieldColorWithoutFocus(elementID, '', '', 'green');
				return true;
			}
		}
		break;
	case 9:
	case 10:
		if (!validateValidGSTNumber(elementID, messageType))
			return false;
		else {
			hideAllMessages();
			changeTextFieldColorWithoutFocus(errorElementId, '', '', 'green');
		}
		break;
		
	case 11:
		if (element.value != '' && element.value != 0 && element.value.length != 6) {
			showMessageWithTimeout(messageType, errorMsg);
			changeTextFieldColor(errorElementId, '', '', 'red');
			element.focus();
			isValidationError	= true;
			return false;			
		} else {
			hideAllMessages();
			changeTextFieldColorWithoutFocus(errorElementId, '', '', 'green');
		}
		break;
	case 12:
		if(element.value.length == 12) {
			//changeDisplayProperty(elementID, 'none');
			changeTextFieldColorWithoutFocus(errorElementId, '', '', 'green');
		} else {
			showMessageWithTimeout(messageType, errorMsg);
			isValidationError	= true;
			element.focus();
			changeTextFieldColor(errorElementId, '', '', 'red');
			return false;
		}
		break;
	case 13:		//filter to validate for Tan Number
		var pattern		= /^([a-zA-Z]){4}([0-9]){5}([a-zA-Z]){1}?$/;
		
		if(element.value != null && element.value != '' && element.value != 'TAN NUMBER') {
			if(!element.value.match(pattern)) {
				showMessageWithTimeout(messageType, errorMsg);
				changeTextFieldColor(elementID, '', '', 'red');
				isValidationError	= true;
				return false;
			} else {
				hideAllMessages();
				changeTextFieldColorWithoutFocus(elementID, '', '', 'green');
				return true;
			}
		}
		break;
	case 14:		//filter to validate for Aadhar Card Number
		var adharcardTwelveDigit	= /^\d{12}$/;
		var adharSixteenDigit		= /^\d{16}$/;
		
		if(element.value != null && element.value != '') {
			if (element.value.match(adharcardTwelveDigit) || element.value.match(adharSixteenDigit)) {
				hideAllMessages();
				changeTextFieldColorWithoutFocus(elementID, '', '', 'green');
				return true;
			} else {
				showMessageWithTimeout(messageType, errorMsg);
				changeTextFieldColor(elementID, '', '', 'red');
				isValidationError	= true;
				return false;
			}
		}
		break;
	case 15:        //filter to validate for Email Address
         if(element.value != null && element.value != '') {
			var emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i;
                
			if(!element.value.match(emailPattern)) {
				showMessageWithTimeout(messageType, errorMsg);
				changeTextFieldColor(elementID, '', '', 'red');
				isValidationError    = true;
				return false;
			} else {
				hideAllMessages();
				changeTextFieldColorWithoutFocus(elementID, '', '', 'green');
				return true;
			}
		}
		break;
	default:
		break;
	}

	return true;
}

/*
 * Get value from html tag
 */
function getValueFromHtmlTag(tagId) {
	let value	= null;
	let ele		= document.getElementById(tagId);
	
	if(ele != null)
		value	= $("#"+tagId).html();
	
	return value;
}

/*
 * Set Value to html tag
 */
function setValueToHtmlTag(tagId, value) {
	let ele		= document.getElementById(tagId);
	
	if(ele != null)
		ele.innerHTML	= value;
}

/*
 * Get value from input field
 */
function getValueFromInputField(id) {
	let value	= null;
	let ele		= document.getElementById(id);
	
	if(ele != null)
		value	= $("#"+id).val();
	
	return value;
}

/*
 * Get option text from option selected
 */
function getValueTextFromOptionField(id) {
	let value	= null;
	let ele		= document.getElementById(id);
	
	if(ele != null)
		value	= $("#"+id+" option:selected").text();
	
	return value;
}

/*
 * Set value to input field
 */
function setValueToTextField(id, value) {
	let ele		= document.getElementById(id);
	
	let newValue	= value;
	
	if(ele != null)
		ele.value	= newValue;
}

/*
 * create new options in HTML select pass HTMl select id , option key and value with Different Id and Value.
 */
function createOptionInSelectTag(id, optionId, optionValue, htmlText) {
	var newOption = $("<option/>");
	
	$('#'+id).append(newOption);
	
	newOption.attr('id', optionId);
	newOption.val(optionValue);
	newOption.html(htmlText);
}

/*
 * create new options in HTML select pass HTMl select id , option key and value.
 */
function createOption(Id,key,value) {
	let newOption = $("<option />");
	$('#'+Id).append(newOption);
	newOption.attr('id',key);
	newOption.val(key);
	newOption.html(value);
}

/*
 * create new options in html on secong position select pass HTMl select id , option key and value.
 */
function createSecondOptionsInSelectTag(id, key, value) {
	$('#'+id+' option:first').after(
		$('<option />', {
			value :	key,
			text  :	value
		})
	);
}

/*
 * Remove option value from dropdown list with respect to value
 */
function removeOptionValFromList(id, value) {
	let ele		= document.getElementById(id);
	
	if(ele != null)
		$("#"+id+" option[value='"+value+"']").remove();
}

/*
 * Get option Text from from dropdown list with respect to value
 */
function getOptionTextFromList(id, value) {
	let selectedName	= null;
	let ele		= document.getElementById(id);
	
	if(ele != null)
		selectedName	= $("#"+id+" option[value='"+value+"']").text();
	
	return selectedName;
}

/*
 * Get selected text from dropdown list
 */
function getSeletedTextFromList(id) {
	
	let selectedText	= null;
	let ele		= document.getElementById(id);

	if(ele != null)
		selectedText	 = $("#"+id+" option:selected").text();
	
	return selectedText;
}

/*
 * Get selected value from dropdown list
 */
function getSeletedValueFromList(id) {
	let selectedVal		= null;
	
	let	ele		= document.getElementById(id);
	
	if(ele != null)
		selectedVal	 = $("#"+id+" option:selected").val();
	
	return selectedVal;
}

/*
 * Get all option value from dropdown list to Array
 */
function getAllOptionValueFromList(listId) {
	let optionArray		= [];
	let list			= null;
	
	let	ele		= document.getElementById(listId);
	
	if(ele != null) {
		list = ele.options;
		
		optionArray		= new Array(list.length);
		
		for(let i = 0; i < list.length; i++) {
			if( list[i].value == "undefined")
				optionArray[i]	= "0";
			else
				optionArray[i]	= list[i].value;
		}
	}
	
	return optionArray;
}

/*
 * Remove All option form Select tag
 */
function removeAllOption(listId) {
	
	let ele	= document.getElementById(listId);
	
	if(ele != null)
		ele.options.length = 0;
}

/*
 * Check value in array
 */
function isValueExistInArray(arr, value) {
	
	if(arr == null) return false;

	for(const element of arr) {
		if(element == value)
			return true;
	}
	
	return false;
}

function operationOnSelectTag(selectId, optType, text, value) {
	let ele				= null;
	
	ele		= document.getElementById(selectId);
	
	if(ele != null) {
		if(optType == 'remove')
			$("#"+selectId+" option[value='"+value+"']").remove();
		else if(optType == 'removeAll')
			$('#'+selectId).find('option').remove().end();
		else if(optType == 'replaceAllAndAddNew')
			$('#'+selectId).find('option').remove().end().append('<option value="'+value+'">'+text+'</option>');
		else if(optType == 'addNew')
			$('#'+selectId).append('<option value="'+value+'" id="'+value+'">'+text+'</option>');
		else if(optType == 'prepend')
			$('#'+selectId).prepend("<option value='"+value+"' selected='selected'>"+text+"</option>");
	}
}

function createTable(id, className, border, width) {
	let	table	= $(document.createElement('table'));
	
	table.attr("id", id);
	table.attr("class", className);
	table.attr("border", border);
	table.attr("width", width);
	
	return table; 
}

function createTableInHtml(id, className, border, width, style) {
	let	table	= $(document.createElement('table'));
	
	table.attr("id", id);
	table.attr("class", className);
	table.attr("border", border);
	table.attr("width", width);
	table.attr("style", style);
	
	return table; 
}

//Create row in HTML table
function createRowInTable(Id, Class, Style){
	let newRow	=  $('<tr/>');
	
	newRow.attr({
		id		: Id,
		class	: Class,
		style	: Style
	});
	
	return newRow;
}

/*
 * create new column with parent id which have to append it and some general configuration.
 */
function createColumnInRow(tableRow, Id, Class, Width, Align, Style, Collspan) {
	let newCol	=  $('<td/>');
	
	newCol.attr({
		id			: Id,
		class		: Class,
		width		: Width,
		align		: Align,
		colspan		: Collspan,
		style		: Style,
		valign		: "top"
	});
	
	$(tableRow).append(newCol);
	
	return newCol;
}

/*
 * Append value in column of table
 */
function appendValueInTableCol(col, value) {
	$(col).append(value);
}

/*
 * Append row in table
 */
function appendRowInTable(tableId, tableRow) {
	let ele		= document.getElementById(tableId);
	
	if(ele != null)
		$('#'+tableId).append(tableRow);
}

/*
 * Hide or Show table column
 */
function hideShowTableCol(colId, type) {
	let ele		= document.getElementById(colId);
	
	if(ele != null) {
		if(type == 'hide')
			$('#'+colId).hide();
		else if(type == 'show')
			$('#'+colId).show();
	}
}

/*
 * Switch old class to new class of any html tag
 */
function switchHtmlTagClass(tagId, newClass, oldClass) {
	let ele		= document.getElementById(tagId);

	if(ele != null)
		$('#'+tagId).switchClass(newClass, oldClass);
}

/*
 * Set value to any html tag or text-field
 */
function setValueToContent(id, contentType, value) {
	let ele		= document.getElementById(id);
	
	if(ele != null) {
		if(contentType == 'text')
			$('#' + id).text(value);
		else if(contentType == 'htmlTag')
			$('#' + id).html(value);
		else if(contentType == 'formField')
			$('#' + id).val(value);
	}
}

/*
 * Create <ul> tag with parentId as id of tag to append and jsonobject of attribute
 */

function createUlTag(parentId, jsonObject) {
	let newItem = $("<ul />");
	$('#'+parentId).append(newItem);

	newItem.attr({
		id		: jsonObject.id
	});

	if(jsonObject.style) {
		newItem.attr( {
			style : jsonObject.style
		});
	};

	if(jsonObject.class) {
		newItem.attr( {
			class : jsonObject.class
		});
	};

	if(jsonObject.html) {
		newItem.html(jsonObject.html);
	};

	return newItem;
}


/*
 * Create <li> tag with parentId as id of tag to append and jsonobject of attribute 
 */
function createLiTag(parentId, jsonObject) {
	let newItem = $("<li />");
	$('#'+parentId).append(newItem);

	newItem.attr({
		id		: jsonObject.id
	});

	if(jsonObject.style) {
		newItem.attr( {
			style : jsonObject.style
		});
	};

	if(jsonObject.class) {
		newItem.attr( {
			class : jsonObject.class
		});
	};

	if(jsonObject.html) {
		newItem.html(jsonObject.html);
	};

	return newItem;
}

/*
 * create new <Span> with parent id which have to append it and some general configuration.
 */
function createSpanTag(parentId, jsonObject) {
	let newSpan		=  $('<span/>');

	newSpan.attr({
		id		: jsonObject.id,
		class	: jsonObject.class
	});

	if(jsonObject.style) {
		newSpan.attr( {
			style : jsonObject.style
		});
	};

	if(jsonObject.align) {
		newSpan.attr( {
			align : jsonObject.align
		});
	};

	if(jsonObject.html) {
		newSpan.attr( {
			html : jsonObject.html
		});
	};

	parentId.append(newSpan);
	return newSpan;
}

/*
 * create new <Div> with parent id which have to append it and some general configuration.
 */
function createDivTag(parentId, jsonObject) {
	let newDiv	=  $('<div/>');

	$('#'+parentId).append(newDiv);
	
	newDiv.attr({
		id		: jsonObject.id,
		class	: jsonObject.class
	});

	if(jsonObject.style) {
		newDiv.attr( {
			style : jsonObject.style
		});
	};

	if(jsonObject.align) {
		newDiv.attr( {
			align : jsonObject.align
		});
	};

	if(jsonObject.html) {
		newDiv.attr( {
			html : jsonObject.html
		});
	};

	return newDiv;
}

/*
 * create new label with parent id which have to append it and some general configuration.
 */
function createLabel(parentEle, Id, Value, Style, Class, For) {
	let labels = $('<label/>');
	$(parentEle).append(labels);

	labels.attr( {
		id			: Id,
		style		: Style,
		class		: Class,
		'for'		: For
	});

	labels.html(Value);
	return labels;
}

//Function to set check to check-box
function checkedUnchecked(id, trueFalse) {
	let ele		= document.getElementById(id);
	
	if(ele != null) {
		if(trueFalse == 'true')
			$('#'+id).prop('checked', true);
		else if(trueFalse == 'false')
			$('#'+id).prop('checked', false);
	}
}

//Function to enable and disable input field
function enableDisableInputField(id, trueFalse) {
	let ele		= document.getElementById(id);
	
	if(ele != null) {
		if(trueFalse == 'true')
			ele.disabled  = true;
		else if(trueFalse == 'false')
			ele.disabled  = false;
	}
}

//Function to get single check-box value
function getCheckedValue(id) {
	let value			= null;
	
	let ele		= document.getElementById(id);
	
	if(ele != null)
		value	= $('#'+id+':checked').val();
	
	return value;
}

function isCheckBoxChecked(id) {
	let value			= false;
	
	let ele		= document.getElementById(id);
	
	if(ele != null)
		value	= ele.checked;
	
	return value;
}

//Function to get All selected check-box value in array
function getAllCheckBoxSelectValue(inputName) {
	let checkBoxArray	= [];
	
	$.each($("input[name="+inputName+"]:checked"), function() { 
		checkBoxArray.push($(this).val());
	});
	
	return checkBoxArray;
}

function getAllCheckBoxSelectValueByClassName(className) {
	let checkBoxArray	= new Array();
	
	$.each($("."+className+":checkbox:checked"), function() { 
		checkBoxArray.push($(this).val());
	});
	
	return checkBoxArray;
}

/*
 * Function to dispable the div tag
 */
function disableDiv(id, dis) {
	$('#'+id + ' :input').attr("disabled", dis);
}

function removeAllWhiteSpace(value) {
	value	= value.replace(/\s/g, '');
	value	= value.replace(/[()]/g, "");
	
	return value;
}

/*
 * Function to set class name table tag
 */
function setClassName(id, className) {
	let ele				= null;
	
	ele		= document.getElementById(id);
	
	if(ele != null) {
		ele.className	= className;
	}
}

/*
 * Function to remove column with sum of Zero in Table
 */
function removeColumnWithZeroTotal(id) {
	let ele	= document.getElementById(id);
	
	if(ele != null) {
		//Remove 0 value cols
		let lastRow		= $('#'+id+' tr:last')[0];
		let firstRow	= $('#'+id+' tr:first')[0];
		let noOfCells	= lastRow.cells.length;
		let cellIndex	= 0;
		let zeroCols	= new Array();
		let idx			= 0;
		
		for(let i = 0; i < noOfCells; i++) {
			if(lastRow.cells[i].colSpan > 1) {
				cellIndex = cellIndex + lastRow.cells[i].colSpan - 1;
			} else {
				cellIndex++;
			};
			
			if(parseInt(lastRow.cells[i].innerHTML, 10) == 0) {
				zeroCols[idx] = cellIndex;
				idx++;
			}
		}
		
		let delColNo	= 0;
		let colNo		= 0;
	
		for(const element of zeroCols) {
			colNo = (element - delColNo);
			$('#'+id+' td:nth-child('+colNo+')').remove();
			delColNo++;
		}

		lastRow = $('#'+id+' tr:last')[0];
		
		for(let k = 0; k < lastRow.cells.length; k++) {
			if(parseInt(lastRow.cells[k].innerHTML, 10) == 0) {
				firstRow.deleteCell(k);
				lastRow.deleteCell(k);
				k--;
			};
		}	
	}
}

/*
 * Function to set readOnly to text field
 */
function setReadOnly(id, trueFalse) {
	let ele	= document.getElementById(id);
	
	if(ele != null)
		ele.readOnly	= trueFalse;
}

/*
 * Function to remove child element from List at particular position
 */
function removeChildEleFromList(id, position) {
	let list = document.getElementById(id);
	
	if(list != null)
		list.removeChild(list.childNodes[position]);
}

/*
 * Function to remove child element from parent element
 */
function removeChildEleFromParent(id) {
	let row = document.getElementById(id);
	
	if(row != null)
		row.parentElement.removeChild(row);
}

/*
 * Function to check value in table column 
 */
function checkValueInTableColumn(tableId, value) {
	let selectedTable	= document.getElementById(tableId);

	let result	= false;
	
	if(selectedTable != null) {
		if(selectedTable.rows.length > 0) {
			for(const element of selectedTable.rows) {
				let colValue	= element.cells[0].innerHTML;
				
				if(value == colValue) {
					result	= true;
					break;
				}
			}
		}
	}
	
	return result;
}

/*
 * Function added to open div as Popup window
 */
function openDialog(id) {
	$("#"+id).dialog({
		modal: true,
		width:'auto',
		height: 'auto',
		minWidth: 700,
		maxWidth: 600,
		// minHeight: 500,
		//position: ['center', 50],
		position: { 
			my: "center", 
			at: "center", 
			of: window 
		},
		closeOnEscape: false,
		resizable: false,
		show: {
			effect: "blind",
			duration: 1000
		},
		hide: {
			effect: "explode",
			duration: 1000
		},
		draggable: true,
		
		open: function() {
			$(this).closest(".ui-dialog")
			.find(".ui-dialog-titlebar-close")
			.removeClass("ui-dialog-titlebar-close")
			.html("<span class='ui-button-icon-primary ui-icon ui-icon-closethick'></span>");
		},
		
		close: function(ev, ui) {
			
		}
	}).css("font-size", "12px");
	
	$(".ui-widget-header .ui-icon").css('background-color', 'red');
	$(".ui-widget-header button").css('padding', '0px');
	$(".ui-widget-header button").css('float', 'right');
}

/*
 * Function added to close jQuery popup window
 */
function closeJqueryDialog(id) {
	let ele		= document.getElementById(id);
	
	if(ele != null)
		$('#'+id).dialog('close');
}

/*
 * Function to select all checkBox with one click
 */
function selectAllCheckBox(param, id) {
	let ele		= document.getElementById(id);
	
	if(ele != null) {
		let count	= parseFloat(ele.rows.length - 1);
	
		for (let row = count; row > 0; row--) {
			if(ele.rows[row].style.display == '')
				ele.rows[row].cells[0].firstChild.checked = param;
		}
	}
}

/*
 * Function created to empty inner value of any html tag
 */
function emptyInnerValue(id) {
	$('#'+id).empty();
}

/*
 * Function created to empty child value of any html tag
 */
function emptyChildInnerValue(id, childTag) {
	$('#'+id).children(childTag).empty();
}

/*
 * Function to delete row from table with index
 */
function deleteTableRow(id, index) {
	let row = document.getElementById(id);
	
	if(row != null)
		row.deleteRow(index);
}

/*
 * Function to count row in table
 */
function countTableRow(id) {
	let table = document.getElementById(id);
	
	let length = 0;
	
	if(table != null) {
		length = table.rows.length;
	}
	
	return length;
}

/*
 * This function is used to change the text to uppercase, lowercase or to capitalized.
 */
function setTextTransform(id, transFormType) {
	let ele		= document.getElementById(id);
	
	if(ele != null)
		ele.style.textTransform = transFormType;
}

function getCurrentDate() {
	
	let today;
	
	if(typeof curDate !== 'undefined')
		today		= new Date(curDate);
	else
		today		= new Date();
	
	let currentdate	= null;
	let dd			= today.getDate();
	let mm			= today.getMonth() + 1; //January is 0!

	let yyyy = today.getFullYear();

	if(dd < 10)
	   dd = '0' + dd;
	
	if(mm < 10)
		mm = '0' + mm;
	
	currentdate = dd + '-' + mm + '-' + yyyy;
	
	return currentdate;
}

/*
 * Convert datetimestamp to Date & time 
 */
function toJSDate (dateTime) {

	dateTime = dateTime.split(" ");//dateTime[0] = date, dateTime[1] = time

	let date = dateTime[0].split("-");
	let time = dateTime[1].split(":");

	//(year, month, day, hours, minutes, seconds, milliseconds)
	return new Date(date[0], date[1]-1, date[2], time[0], time[1], time[2], 0);
	   
}

function changeAttributeOfJSEvent(id, eventType, value) {
	$('#'+id).attr(eventType, value);
}

/*
 * create All kind of input tag passed in json object with parent id which have to append it and some general configuration.
 */
function createInput(parentEle, jsonObject) {

	let inputs = $('<input type=' + jsonObject.type + ' />');
	
	parentEle.append(inputs);

	inputs.attr ({
		id			: jsonObject.id
		,name		: jsonObject.name
		,value		: jsonObject.value
	});

	if(jsonObject.style) {
		inputs.attr( {
			style : jsonObject.style
		});
	};

	if(jsonObject.class) {
		inputs.attr( {
			class : jsonObject.class
		});
	};

	if(jsonObject.disabled) {
		inputs.attr( {
			disabled : jsonObject.disabled
		});
	};

	if(jsonObject.maxlength) {
		inputs.attr( {
			maxlength : jsonObject.maxlength
		});
	};

	if(jsonObject.readonly) {
		inputs.attr( {
			readonly : jsonObject.readonly
		});
	};

	if(jsonObject.onblur) {
		inputs.attr( {
			onblur : jsonObject.onblur
		});
	};

	if(jsonObject.onkeypress) {
		inputs.attr( {
			onkeypress : jsonObject.onkeypress
		});
	};

	if(jsonObject.onfocus) {
		inputs.attr( {
			onfocus : jsonObject.onfocus
		});
	};

	if(jsonObject.onkeydown) {
		inputs.attr( {
			onkeydown : jsonObject.onkeydown
		});
	};

	if(jsonObject.onkeyup) {
		inputs.attr( {
			onkeyup : jsonObject.onkeyup
		});
	};

	if(jsonObject.onclick) {
		inputs.attr( {
			onclick : jsonObject.onclick
		});
	};

	if(jsonObject.onmouseup) {
		inputs.attr( {
			onmouseup : jsonObject.onmouseup
		});
	};

	if(jsonObject.onmousedown) {
		inputs.attr( {
			onmousedown : jsonObject.onmousedown
		});
	};
	
	if(jsonObject.onpaste) {
		inputs.attr( {
			onpaste : jsonObject.onpaste
		});
	};

	if(jsonObject.placeholder) {
		inputs.attr( {
			placeholder : jsonObject.placeholder
		});
	};
	
	if(jsonObject.checked) {
		inputs.attr( {
			checked : jsonObject.checked
		});
	};

	return inputs;
}

/*
 * create new <div> with parent id which have to append it and some general configuration.
 */

function createButton(parentEle, jsonObject) {
	let button = $('<button type=' + jsonObject.type +' />');
	
	parentEle.append(button);

	button.attr ({
		id			: jsonObject.id
		,name		: jsonObject.name
		,value		: jsonObject.value
	});

	if(jsonObject.class) {
		button.attr( {
			class : jsonObject.class
		});
	};

	if(jsonObject.onclick) {
		button.attr( {
			onclick : jsonObject.onclick
		});
	};

	if(jsonObject.html) {
		button.html(jsonObject.html);
	};

	if(jsonObject.style) {
		button.attr( {
			style : jsonObject.style
		});
	};

	if(jsonObject.onmouseover) {
		button.attr( {
			onmouseover : jsonObject.onmouseover
		});
	};

	return button;
}

/*
 * Create <a> tag with id and value as html 
 */
function createHyperLink(jsonObject) {
	let newItem = $("<a />");

	newItem.attr({
		id		: jsonObject.id
	});

	newItem.attr({
		href		: jsonObject.href
	});

	if(jsonObject.style) {
		newItem.attr( {
			style : jsonObject.style
		});
	};

	if(jsonObject.class) {
		newItem.attr( {
			class : jsonObject.class
		});
	};

	if(jsonObject.html) {
		newItem.html(jsonObject.html);
	};

	if(jsonObject.onClick) {
		newItem.attr( {
			onClick : jsonObject.onClick
		});
	};

	return newItem;
}

function convertNumberToWords(amount) {
	let singleDigits = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
	let doubleDigits = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
	let tensMultiple = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
	
	let isDecimal = amount.toString().indexOf('.') > -1;

	function numberToWords(n) {
		let output = "";

		if (n > 19)
			output += tensMultiple[Math.floor(n / 10)] + " " + singleDigits[n % 10];
		else
			output += (n > 9 ? doubleDigits[n % 10] : singleDigits[n]);

		return output.trim();
	}

	function convertToIndianWords(num) {
		let result = "";

		let crore = Math.floor(num / 10000000);
		num %= 10000000;
		if (crore > 0) result += numberToWords(crore) + " crore ";

		let lakh = Math.floor(num / 100000);
		num %= 100000;
		if (lakh > 0) result += numberToWords(lakh) + " lakh ";

		let thousand = Math.floor(num / 1000);
		num %= 1000;
		if (thousand > 0) result += numberToWords(thousand) + " thousand ";

		let hundred = Math.floor(num / 100);
		num %= 100;
		if (hundred > 0) result += numberToWords(hundred) + " hundred ";

		if (num > 0) {
			 if (!isDecimal && result !== "") result += "and ";
			result += numberToWords(num);
		}

		return result.trim();
	}

	function convert(amount) {
		let parts = amount.toString().split('.');
		let rupees = parseInt(parts[0], 10);
		let paisa = parts.length > 1 ? parseInt(parts[1], 10) : 0;

		let rupeeWords = convertToIndianWords(rupees) + " rupees";
		let paisaWords = paisa > 0 ? convertToIndianWords(paisa) + " paisa" : "";

		return rupeeWords + (paisaWords ? " and " + paisaWords : "");
	}

	return convert(amount);
}

function convertNumberToWord(inputNumber) {
	let str		= new String(inputNumber)
	let splt	= str.split("");
	let rev		= splt.reverse();
	let once	= ['Zero', ' One', ' Two', ' Three', ' Four', ' Five', ' Six', ' Seven', ' Eight', ' Nine'];
	let twos	= ['Ten', ' Eleven', ' Twelve', ' Thirteen', ' Fourteen', ' Fifteen', ' Sixteen', ' Seventeen', ' Eighteen', ' Nineteen'];
	let tens	= ['', 'Ten', ' Twenty', ' Thirty', ' Forty', ' Fifty', ' Sixty', ' Seventy', ' Eighty', ' Ninety'];

	let numLength	= rev.length;
	let word	= new Array();
	let j		= 0;

	if (inputNumber == 0) {
		 return 'Zero';
	}
	
	for (i = 0; i < numLength; i++) {
		switch (i) {
			case 0:
				if ((rev[i] == 0) || (rev[i + 1] == 1)) {
					word[j] = '';
				} else {
					word[j] = '' + once[rev[i]];
				}
				word[j] = word[j];
				break;

			case 1:
				aboveTens();
				break;

			case 2:
				if (rev[i] == 0) {
					word[j] = '';
				} else if ((rev[i - 1] == 0) || (rev[i - 2] == 0)) {
					word[j] = once[rev[i]] + " Hundred ";
				} else {
					word[j] = once[rev[i]] + " Hundred and";
				}
				break;

			case 3:
				if (rev[i] == 0 || rev[i + 1] == 1) {
					word[j] = '';
				} else {
					word[j] = once[rev[i]];
				}
				
				if ((rev[i + 1] != 0) || (rev[i] > 0)) {
					word[j] = word[j] + " Thousand";
				}
				break;

				
			case 4:
				aboveTens();
				break;

			case 5:
				if ((rev[i] == 0) || (rev[i + 1] == 1)) {
					word[j] = '';
				} else {
					word[j] = once[rev[i]];
				}
				
				if (rev[i + 1] !== '0' || rev[i] > '0') {
					word[j] = word[j] + " Lakh";
				}
				 
				break;

			case 6:
				aboveTens();
				break;

			case 7:
				if ((rev[i] == 0) || (rev[i + 1] == 1)) {
					word[j] = '';
				} else {
					word[j] = once[rev[i]];
				}
			   
				if (rev[i + 1] !== '0' || rev[i] > '0') {
					word[j] = word[j] + " Crore";
				}				 
				break;

			case 8:
				aboveTens();
				break;

			default: break;
		}
		j++;
	}

	function aboveTens() {
		if (rev[i] == 0) { word[j] = ''; }
		else if (rev[i] == 1) { word[j] = twos[rev[i - 1]]; }
		else { word[j] = tens[rev[i]]; }
	}

	word.reverse();
	let finalOutput = '';
   
	for (i = 0; i < numLength; i++) {
		finalOutput = finalOutput + word[i];
	}
	
	return finalOutput;	   
}

function getDateFromTimestamp(timestamp, filter) {
	let date	= timestamp;
	date	= date.substring(0, date.length - 5);

	if(filter == 1) {		//only for date
		date	= date.substring(0, 10);
	} else if(filter == 2) {	//date in AM - PM
		let date1	= date.substring(0, 10);
		let time	= date.substring(14, 16);

		let hour = date.substring(11, 13);
		
		if(hour > 12)
			date = date1 + " " + (hour - 12) + ":" + time + " PM";
		else
			date = date + " AM";
	}
	
	return date;
}

function convertTimestamp(timestamp) {
	let d	= new Date(timestamp * 1000),	// Convert the passed timestamp to milliseconds
	
	yyyy	= d.getFullYear(),
	mm		= ('0' + (d.getMonth() + 1)).slice(-2),	// Months are zero based. Add leading 0.
	dd		= ('0' + d.getDate()).slice(-2),			// Add leading 0.
	hh		= d.getHours(),
	h		= hh,
	min		= ('0' + d.getMinutes()).slice(-2),		// Add leading 0.
	ampm	= 'AM',
	time;

	if (hh > 12) {
		h		= hh - 12;
		ampm	= 'PM';
	} else if (hh === 12) {
		h		= 12;
		ampm	= 'PM';
	} else if (hh == 0) {
		h		= 12;
	}

	// ie: 2013-02-18, 8:35 AM	
	time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;

	return time;
}

function setMonthYear(obj) {
	if((obj.value.length == 1 && obj.value > 31) || (obj.value.length == 2 && obj.value > 31)) {
		obj.value	= '';
		return true;
	}

	if(obj.value.length == 2) {
		if(isValidDateFormat(curDate)) {
			let currMonth	= curDate.split('-')[1];
			let currYear	= curDate.split('-')[2];
			obj.value	= obj.value + '-' + currMonth + '-' + currYear;
			return;	
		}
		
		let today		= curDate;
		let currMonth	= today.getMonth() + 1;
		
		if (currMonth / 10 < 1)
			currMonth = '0' + currMonth;

		let currYear	= today.getFullYear();
		obj.value		= obj.value + '-' + currMonth + '-' + currYear;
	}
}

function getDateInDMYFromTimestamp(timestamp) {
	let dateInDMY	= '';
	
	if(timestamp != undefined) {
		let Date	= (timestamp).substring(0, 16) ;
		let year	= Date.substring(0, 4);
		let month	= Date.substring(5, 7);
		let day		= Date.substring(8, 10);
		
		dateInDMY	= day + "-" + month + "-" + year;
	}
	
	return dateInDMY;
}

//Validates Date in mm-dd-yyyy format
function isValidDate(date) {
	if ( date.match(/^(\d{1,2})\-(\d{1,2})\-(\d{4})$/) ) {
		let dd = RegExp.$1;
		let mm = RegExp.$2;
		let yy = RegExp.$3;

		// try to create the same date using Date Object
		let dt = new Date(parseFloat(yy), parseFloat(mm) - 1, parseFloat(dd), 0, 0, 0, 0);
		// invalid day
		if ( parseFloat(dd) != dt.getDate() ) { return false; }
		// invalid month
		if ( parseFloat(mm)-1 != dt.getMonth() ) { return false; }
		// invalid year
		return !(parseFloat(yy) != dt.getFullYear());
	} else {
		// not even a proper date
		return false;
	}
}

function resetTextFeild(obj, defaultVal) {
	let value		= obj.value;
	
	if(value == defaultVal) {
		obj.value	= '';
	}
}

function clearIfNotNumeric(obj, text) {
	let textValue = obj.value;

	if(obj.value.length > 0 && isNaN(obj.value)) {
		obj.value	= text;
		alert('Invalid Number !');
		setTimeout(function(){if(obj)obj.focus();obj.select();},100); // Used to set focus as obj.focus(); doesn't work after alert90
		return false;
	} else if(textValue == '') {
		obj.value = text;
	} else {
		text.value = textValue;
	}
	
	return false;
}

function getKeyCode(event) {
	return event.which || event.keyCode;
}

function closeJqueryDialog(id) {
	if(document.getElementById(id) != null)
		$('#'+id).dialog('close');
}

function fillclearText(text, text1) {
	let textValue = text.value;
	
	if(textValue == '') {
		text.value = text1;
	} else {
		text.value = textValue;
	};
}

function fillclearTextArea(text, text1) {
	let textValue = text.value;
	
	if(textValue == '') {
		text.value = text1;
	};
}

function noNumbers(evt){
	if (evt.ctrlKey ==1){
		return true;
	}else{
		let keynum = null;
		if(window.event){ // IE
			keynum = evt.keyCode;
		} else if(evt.which){ // Netscape/Firefox/Opera
			keynum = evt.which;
		}
		if(keynum!=null){
			if(keynum == 8){
				return true;
			} else if(keynum == 45 || keynum == 47) {
				return true;
			} else if (keynum < 48 || keynum > 57 ) {
				return false;
			}
		}
		return true;
	}
}

function validateFloatKeyPress(evt,_this) {
	if (evt.ctrlKey ==1){
		return true;
	} else{
		let charCode = (evt.which) ? evt.which : evt.keyCode;
		if (charCode != null) {
			if (charCode == 8) {
				return true;
			} else if (charCode == 46) {
				return _this.value.indexOf('.') === -1;
			} else if (charCode > 31
					 && (charCode < 48 || charCode > 57))
					return false;
		}
	}
	//get the carat position
	let number = _this.value.split('.');
	let caratPos = getSelectionStart(_this);
	let dotPos = _this.value.indexOf(".");
	
	return !(caratPos > dotPos && dotPos>-1 && (number[1].length > 1));
}

function getSelectionStart(o) {
	if (o.createTextRange) {
		let r = document.selection.createRange().duplicate()
		r.moveEnd('character', o.value.length)
		if (r.text == '') return o.value.length
		return o.value.lastIndexOf(r.text)
	} else return o.selectionStart
}

function sortDropDownList(targetId) {
	let ddl				= document.getElementById(targetId);
	let selectedValue	= ddl.options[ddl.selectedIndex].value;
	let selectedIndex	= null;
	let arrTexts		= new Array();
	let txtAndVal		= new Array();

	for(let i = 0; i < ddl.length; i++) {
		arrTexts[i]		= ddl.options[i].text.toLowerCase() + '$$' + ddl.options[i].text + '^^' + ddl.options[i].value;
	}
	
	arrTexts.sort();
	
	for(i = 0; i< ddl.length; i++) {
		txtAndVal				= arrTexts[i].split("$$")[1].split("^^");
		ddl.options[i].text		= txtAndVal[0];
		ddl.options[i].value	= txtAndVal[1];
		
		if(txtAndVal[1] == selectedValue) {
			selectedIndex = i;
		}
	}
	
	ddl.options.selectedIndex	= selectedIndex;
}

function parseDate(str) {
	let mdy = str.split('-');
	return new Date(mdy[2], mdy[1] - 1, mdy[0]);
}

/*
 * pass date object with identifier and get normal for view
 */
function dateWithDateFormatForCalender(dateObject, identifier) {
	let d = new Date(dateObject);

	if(d == 'Invalid Date' || d == 'NaN') {
		let t = dateObject.split(/[- :]/);
		d = new Date(t[0], t[1]-1, t[2], t[3], t[4], t[5]);
	}

	let day		= d.getDate();
	let month	= d.getMonth() + 1;
	let year	= d.getFullYear();
	
	if (day < 10)
		day = "0" + day;
	
	if (month < 10)
		month = "0" + month;
	
	let date = day + identifier + month + identifier + year;

	return date;
}

function timeWithTimeFormatForCalender(timeObject, identifier) {
	let t = new Date(timeObject);

	if (isNaN(t.getTime())) {
		let t = timeObject.split(/[- :]/);
		t = new Date(t[0], t[1] - 1, t[2], t[3], t[4], t[5]);
	}

	let hours = t.getHours();
	let minutes = t.getMinutes();
	let amPm = hours >= 12 ? 'PM' : 'AM';

	hours = hours % 12;
	hours = hours ? hours : 12;
	minutes = minutes < 10 ? '0' + minutes : minutes;

	let time = hours + identifier + minutes + ' ' + amPm;

	return time;
}

function goToPosition(elementId, slideSpeed) {
	$('html,body').animate({
		scrollTop: $("#" + elementId).offset().top},
		slideSpeed);
}

//######################################################################

function pad2(n) { return n < 10 ? '0' + n : n; }
function pad3(n) { return n < 10 ? '00' + n : (n < 100 ? '0' + n : n); }

//class Date : method toDateTimeString extension
//Date+Time
function toDateTimeString(x) {
	x = x instanceof Date ? x : this instanceof Date ? this : new Date;
	
	return x.getFullYear() + '-' +
	 pad2(x.getMonth() + 1) + '-' +
	 pad2(x.getDate()) + ' ' +
	 pad2(x.getHours()) + ':' +
	 pad2(x.getMinutes()) + ':' +
	 pad2(x.getSeconds()) + '.' +
	 pad3(x.getMilliseconds());
}

//Date
function toDateString(x, filter) {
  x = x instanceof Date ? x : this instanceof Date ? this : new Date;
  
  let date	= '';

  switch (filter) {
  case 1: //dd-mm-YYYY
	  date	= pad2(x.getDate()) + '-' + pad2(x.getMonth() + 1) + '-' + x.getFullYear();
	  break;
  case 2://YYYY-mm-dd
	  date	= x.getFullYear() + '-' + pad2(x.getMonth() + 1) + '-' + pad2(x.getDate());
	  break;
  default:
	  break;
  }

  return date;
}

//Time
function toTimeString(x) {
  x = x instanceof Date ? x : this instanceof Date ? this : new Date;
  
  return pad2(x.getHours()) + ':' +
	pad2(x.getMinutes()) + ':' +
	pad2(x.getSeconds()) + '.' +
	pad3(x.getMilliseconds());
}

//######################################################################

// class Date : method toHttpDate extension
// Date+Time
// "Thu, 01 Dec 1994 16:00:00 GMT"
function toHttpDate(x) {
  x = x instanceof Date ? x : this instanceof Date ? this : new Date;
  
  return weekNames[x.getUTCDay()] + ', ' +
	pad2(x.getUTCDate()) + ' ' +
	monthNames[x.getUTCMonth()] + ' ' +
	x.getUTCFullYear() + ' ' +
	pad2(x.getUTCHours()) + ':' +
	pad2(x.getUTCMinutes()) + ':' +
	pad2(x.getUTCSeconds()) + ' GMT';
}

function destroyBTModel() {
	$( '.modal' ).modal( 'hide' ).data( 'bs.modal', null );
	$('.modal').remove();
	$('.modal-backdrop').remove();
	$('body').removeClass( "modal-open" );
}

function noSpclChars(e){

	let keynum =null;

	if(window.event){ // IE
		keynum = e.keyCode;
	} else if(e.which) {// Netscape/Firefox/Opera
		keynum = e.which;
	}
	
	if(keynum == 8 || keynum == 95 ){
		return true;
	}
	
	return !((keynum > 32 && keynum < 48)|| (keynum > 57 && keynum < 65)|| (keynum > 90 && keynum < 97)|| (keynum > 122 && keynum < 127));
}

function validAmount(evt){
	if (evt.ctrlKey ==1){
		return true;
	}else{
		let keynum = null;
		if(window.event){ // IE
			keynum = evt.keyCode;
		} else if(evt.which){ // Netscape/Firefox/Opera
			keynum = evt.which;
		}
		if(keynum!=null){
			if(keynum == 8	|| keynum == 46 ){
				return true;
			}
			if (keynum < 48 || keynum > 57 ) {
				return false;
			}
		}
		return true;
	}
}

function validateFileTypeAndSize() {
	$('#photo').bind('change', function() {
		if (this.files && this.files[0]) {
			let sFileName		= this.files[0].name;
			let fileSize		= this.files[0].size / 1048576;	 //size in mb 
			let fileSizeInKB	= this.files[0].size / 1024;  //size in kb 
			
			let sFileExtension	= sFileName.split('.')[sFileName.split('.').length - 1].toLowerCase();
			
			if(!(sFileExtension === 'jpg' || sFileExtension === 'jpeg' || sFileExtension === 'png')) {
				showMessage('info', validImageFileInfoMsg);
				$.trim($(this).val(''));
				return false;	
			} else if(maxSizeOfFileToUpload > 0) {
				if(maxSizeOfFileToUpload.toString().length == 1 && fileSize > maxSizeOfFileToUpload) { //in mb
					showMessage('info', maxFileSizeInfoMsg(maxSizeOfFileToUpload + ' MB !'));
					$.trim($(this).val(''));
					return false;	
				} else if(maxSizeOfFileToUpload.toString().length > 1 && fileSizeInKB > maxSizeOfFileToUpload) { //in kb
					showMessage('info', maxFileSizeInfoMsg(maxSizeOfFileToUpload + ' KB !'));
					$.trim($(this).val(''));
					return false;	
				}
			}
			
			let fileReader	= new FileReader();

			fileReader.readAsDataURL(this.files[0]);
		}
		
		return true;
	});
}

function validateFileTypeAndSizeForMultiPhoto(noOfFileToUpload, maxSizeOfFileToUpload, uploadPdfInPod) {
	for(let i = 1; i <= noOfFileToUpload; i++) {
		$('#photo_' + i).bind('change', function() {
			if (this.files && this.files[0]) {
				let files			= this.files[0];
				let sFileName		= files.name;
				let fileSize		= files.size / 1048576;	 //size in mb 
				let fileSizeInKB	= files.size / 1024;  //size in kb 
				let elementId		= $(this).attr('id');
				
				let sFileExtension	= sFileName.split('.')[sFileName.split('.').length - 1].toLowerCase();
				
				if(!(sFileExtension === 'jpg' || sFileExtension === 'jpeg' || sFileExtension === 'png' || (uploadPdfInPod && sFileExtension === 'pdf'))) {
					emptyImage(this);
					showMessage('info', validImageFileInfoMsg);
					return false;	
				} else if(maxSizeOfFileToUpload > 0) {
					if(maxSizeOfFileToUpload.toString().length == 1 && fileSize > maxSizeOfFileToUpload) {
						emptyImage(this);
						showMessage('info', maxFileSizeInfoMsg(maxSizeOfFileToUpload + ' MB !'));
						return false;	
					} else if(maxSizeOfFileToUpload.toString().length > 1 && fileSizeInKB > maxSizeOfFileToUpload) {
						emptyImage(this);
						showMessage('info', maxFileSizeInfoMsg(maxSizeOfFileToUpload + ' KB !'));
						return false;	
					}
				}
				
				let fileReader	= new FileReader();
				
				fileReader.addEventListener("load", function(e) {
					displayImagePreview(elementId, e);
				}); 
	
				fileReader.readAsDataURL(files);
			}
			
			return true;
		});
	}
	
	return true;
}

function emptyImage(obj) {
	let elementId		= $(obj).attr('id');
	$('#displayImg_' + elementId.split('_')[1]).attr('style', 'display: none');
	$('#img_' + elementId.split('_')[1]).attr('src', '');
	$.trim($(obj).val(''));
}

function displayImagePreview(elementId, e) {
	$('#displayImg_' + elementId.split('_')[1]).attr('style', 'display: inline-block');
	$('#img_' + elementId.split('_')[1]).attr('src', e.target.result);
}

function saveImageToPdf(idOfHtmlElement) {
   let fbcanvas = document.getElementById(idOfHtmlElement);
   html2canvas($(fbcanvas),
		{
			onrendered: function (canvas) {
				let millimeters = {};
				millimeters.width	= Math.floor(canvas.width * 0.264583);
				millimeters.height	= Math.floor(canvas.height * 0.264583);

				let imgData = canvas.toDataURL('image/png');
				let doc = new jsPDF("p", "mm", "a4");
				doc.deletePage(1);
				doc.addPage(millimeters.width, millimeters.height);
				doc.addImage(imgData, 'PNG', 0, 0);
				doc.save('LoadingSheetPrint.pdf');
			}
		});
}

function exportPDF(documentOBJ, fileName) {
	html2canvas(documentOBJ.body, {
		dpi: 144,
		scale: 2,
		onrendered: function(canvas) {
			 let millimeters = {};
			 millimeters.width	= Math.floor(canvas.width * 0.264583);
			 millimeters.height = Math.floor(canvas.height * 0.264583);
			 
			 let imgData = canvas.toDataURL('image/png');
			 let doc = new jsPDF("p", "mm", "a4");
			 doc.deletePage(1);
			 doc.addPage(millimeters.width, millimeters.height);
			 doc.addImage(imgData, 'JPEG', 0, 0);
			 doc.save(fileName);
		}
	});
}

function exportTableToExcel(documentOBJ,fileName){
	let downloadLink;
	let dataType = 'application/vnd.ms-excel';
	let tableSelect =  documentOBJ.body;
	let tableHTML = tableSelect.outerHTML.replace(/ /g, '%20');
	
	// Specify file name
	fileName = fileName?fileName+'.xls':'excel_data.xls';
	
	// Create download link element
	downloadLink = document.createElement("a");
	
	document.body.appendChild(downloadLink);
	
	if(navigator.msSaveOrOpenBlob){
		let blob = new Blob(['\ufeff', tableHTML], {
			type: dataType
		});
		navigator.msSaveOrOpenBlob( blob, fileName);
	}else{
		// Create a link to the file
		downloadLink.href = 'data:' + dataType + ', ' + tableHTML;
	
		// Setting the file name
		downloadLink.download = fileName;
		
		//triggering the function
		downloadLink.click();
	}
}

function checkValidMobileNumber(elementId) {
	let element = document.getElementById(elementId);
	let reg = /^[6789]\d{9}$/ig;
	
	if(element.value.length > 0 && (element.value.length != 10 || !element.value.match(reg))) {
		changeTextFieldColor(elementId, '', '', 'red');
		isValidationError	= true;
		return false;
	}else {
		changeTextFieldColorWithoutFocus(elementId, '', '', 'green');
	}
	
	return true;
}

function printQRCode(templateArray) {
	let finalObj = new Object();
	finalObj.templateArray = templateArray;
	
	$.ajax({
		url : "http://127.0.0.1:60080/printQrCode",
		data : finalObj,
		success : function(result) {
			console.log(result);
		}
	});
}

function printQRCodeOnLinux(templateArray) {
	let finalObj = new Object();
	finalObj.templateArray = templateArray;
	
	$.ajax({
		url : "http://127.0.0.1:60081/printQrCode",
		data : finalObj,
		success : function(result) {
			console.log(result);
		}
	});
}

function printAllQRCodeWithoutLimit(templateArray) {
	let requestData = {
		templateArray: templateArray
	};

	$.ajax({
		url: "http://127.0.0.1:60080/printQrCode",
		method: "POST",
		contentType: "application/json",
		data: JSON.stringify(requestData),
		success: function(result) {
			console.log(result);
		}, error: function(xhr, status, error) {
			console.error("Error:", error);
		}
	});
}

function printDotMatrixQRCode(templateArray) {
	let finalObj = new Object();
	finalObj.templateArray = templateArray;
	
	$.ajax({
		url : "http://127.0.0.1:60081/dotMatrixPrint",
		data : finalObj,
		success : function(result) {
			console.log(result);
		}
	});
}

function generateFileToDownload(response) {
	downloadFileWithContentType(response.fileName, "Ajax.do?pageId=356&eventId=1&FilePath=" + response.FilePath, 'application/x-www-form-urlencoded; charset=UTF-8');
}

function downloadFile(response, webServiceUrl) {
	downloadFileWithContentType(response.fileName, webServiceUrl + '/readExcelWS/downloadExcelFile.do?FilePath=' + response.FilePath, 'application/x-www-form-urlencoded; charset=UTF-8');
}

function downloadZipFile(response, webServiceUrl) {
	downloadFileWithContentType(response.fileName, webServiceUrl + '/readExcelWS/downloadExcelFile.do?FilePath=' + response.FilePath, 'application/zip, application/octet-stream; charset=UTF-8')
}

function downloadJsonFile(response, webServiceUrl) {
	downloadFileWithContentType(response.fileName, webServiceUrl + '/readExcelWS/downloadExcelFile.do?FilePath=' + response.FilePath, 'application/json, application/octet-stream; charset=UTF-8')
}

function downloadFileWithContentType(fileName, uri, contentType) {
	if(fileName == undefined) return;
	
	let request = new XMLHttpRequest();
	request.open('GET', encodeURI(uri), true);
	request.setRequestHeader('Content-Type', contentType);
	request.responseType = 'blob';

	request.onload = function(e) {
		console.log(e)
		if (this.status === 200) {
			hideLayer();
					
			let blob = this.response;
			
			if(window.navigator.msSaveOrOpenBlob) {
				window.navigator.msSaveBlob(blob, fileName);
			} else {
				let downloadLink		= window.document.createElement('a');
				downloadLink.href		= window.URL.createObjectURL(new Blob([blob], { type: request.getResponseHeader("Content-Type") }));
				downloadLink.download	= fileName;
				document.body.appendChild(downloadLink);
				downloadLink.click();
						
				document.body.removeChild(downloadLink);
			}
		}
	};
	
	request.send();
}

function disableEvents(event) {
	let pressedKey = String.fromCharCode(event.keyCode).toLowerCase();
	
	if (event.keyCode == 123) { // Prevent F12
		showMessage('info', '<i class="fa fa-info-circle"></i> Not allowed !');
		return false;
	} else if (event.ctrlKey && event.shiftKey && (event.keyCode == 73 || event.keyCode == 74 || event.keyCode == 75)) { // Prevent Ctrl+Shift+I  and J and K
		showMessage('info', '<i class="fa fa-info-circle"></i> Not allowed !');
		return false;
	} else if (event.ctrlKey && (event.keyCode == 85 || pressedKey == "u")) { // Prevent Ctrl+U
		showMessage('info', '<i class="fa fa-info-circle"></i> Not allowed !');
		return false;
	}
}

function toFixedWhenDecimal(x) {
	return Number((x * 1.0).toFixed(2).replace(/[.,]00$/, ""));
}

function addAutocompleteElementInNode(myNod, eleId, errorMessage) {
	myNod.add({
		selector		: '#' + eleId,
		validate		: 'validateAutocomplete:#' + eleId + '_primary_key',
		errorMessage	: errorMessage
	});
}

function addAutocompleteElementInNode1(myNod, eleId, errorMessage) {
	myNod.add({
		selector		: '#' + eleId,
		validate		: 'validateAutocomplete:#' + eleId,
		errorMessage	: errorMessage
	});
}

function addElementToCheckEmptyInNode(myNod, eleId, errorMessage) {
	myNod.add({
		selector		: '#' + eleId,
		validate		: 'presence',
		errorMessage	: errorMessage
	});
}

function addElementToCheckEmptyInNode1(myNod, eleId, errorMessage) {
	addElementToCheckEmptyInNode(myNod, eleId, errorMessage)
}

function addElementToCheckNumericInNode(myNod, eleId, errorMessage) {
	myNod.add({
		selector		: '#' + eleId,
		validate		: 'integer',
		errorMessage	: errorMessage
	});
}

function addElementToCheckFloatInNode(myNod, eleId, errorMessage) {
	myNod.add({
		selector		: '#' + eleId,
		validate		: 'float',
		errorMessage	: errorMessage
	});
}

function addElementToCheckLength10InNode(myNod, eleId, errorMessage) {
	myNod.add({
		selector		: '#' + eleId,
		validate		: 'max-length:10',
		errorMessage	: errorMessage
	});
}

function addElementToCheckLength6InNode(myNod, eleId, errorMessage) {
	myNod.add({
		selector		: '#' + eleId,
		validate		: 'max-length:6',
		errorMessage	: errorMessage
	});
}


function removeElementFromCheckEmptyInNode(myNod, eleId) {
	myNod.remove('#' + eleId);
	$('#'+eleId).removeClass('error-boder')
}

function getBrowserName() {
	let userAgent = navigator.userAgent;
	let browserName;
	
	if(userAgent.match(/chrome|chromium|crios/i))
		browserName = "chrome";
	else if(userAgent.match(/firefox|fxios/i))
		browserName = "firefox";
	else if(userAgent.match(/safari/i))
		browserName = "safari";
	else if(userAgent.match(/opr\//i))
		browserName = "opera";
	else if(userAgent.match(/edg/i))
		browserName = "edge";
	else
		browserName = "No browser detection";
	
	return browserName;
}

function getMultiplePhotosToUpload(event) {
	/*
		call this function on event
	*/
	let photoArray	= [];
	
	let files	= event.target.files; //FileList object

	for (let i = 0; i < files.length; i++) {
		let file = files[i];

		//Only pics
		if (!file.type.match('image'))
			continue;

		let picReader = new FileReader();

		picReader.addEventListener("load", function(event) {
			let picFile		= event.target;
				
			let jsonObject	= new Object();

			jsonObject.name		= picFile.name;
			jsonObject.result	= picFile.result;
			
			photoArray.push(jsonObject);
		});

		//Read the image
		picReader.readAsDataURL(file);
	}

	return photoArray;
}

function viewWayBillDetails(wayBillId, wayBillNumber) {
	window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId=' + wayBillId + '&NumberType=' + 1 + '&wayBillNumber=' + wayBillNumber);
}

function noSpclCharsExcludingForwardSlash(e) {
	let keynum = null;

	if(window.event) { // IE
		keynum = e.keyCode;
	} else if(e.which) {// Netscape/Firefox/Opera
		keynum = e.which;
	}

	if(keynum == 8 || keynum == 95 || keynum == 47)
		return true;

	return !((keynum > 32 && keynum < 48)|| (keynum > 57 && keynum < 65)|| (keynum > 90 && keynum < 97)|| (keynum > 122 && keynum < 127));
}

function imageSrcExists(url) {
	let http = new XMLHttpRequest();

	http.open('HEAD', url, false);
	http.send();

	return http.status != 404;
}

function downloadAsZip(data) {
	const a = document.createElement("a")
	a.href = "data:application/zip;base64," + data
	a.setAttribute("download", zipFileName + new Date().toJSON().slice(0,10) + ".zip")
	a.style.display = "none"
	a.addEventListener("click", e => e.stopPropagation()) // not relevant for modern browsers
	document.body.appendChild(a)
	
	setTimeout(() => { // setTimeout - not relevant for modern browsers
		a.click()
		document.body.removeChild(a) 
	}, 0)
}

function downloadAllImageAsZip(fileName, photoModelList) {
	const zip = new JSZip();
	const extensionMap = {
		1: 'pdf',
		2: 'jpg',
		3: 'jpeg',
		4: 'png',
		5: 'webp',
	};

	let index = 0;

	if (photoModelList && photoModelList.length > 0) {
		photoModelList.forEach((photoModel) => {
			const base64Data = photoModel?.photoTransactionPhoto;
			const extType = photoModel?.photoExtentionTypeId;

			if (base64Data && extType && extType > 0) {
				const extension = extensionMap[extType] || 'jpg';
				const cleanBase64 = base64Data.replace(/^data:.*?base64,/, '');
				zip.file(`img${index}.${extension}`, cleanBase64, { base64: true });
				index++;
			}
		});
	}

	// Fallback if no model or nothing added
	if (index === 0) {
		const images = document.querySelectorAll(".dl");
		images.forEach((img) => {
			const src = img?.src;
			if (src && src.startsWith("data:image/")) {
				const cleanBase64 = src.replace(/^data:.*?base64,/, '');
				zip.file(`img${index}.jpg`, cleanBase64, { base64: true });
				index++;
			}
		});
	}

	if (index === 0) {
		alert("No valid images found to download.");
		return;
	}

	// Generate and trigger download
	zip.generateAsync({ type: "blob" })
		.then((blob) => {
			const link = document.createElement("a");
			link.href = URL.createObjectURL(blob);
			link.download = (fileName || "images") + ".zip";
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(link.href);
		})
		.catch((err) => {
			console.error("Zip creation failed:", err);
			alert("Failed to create ZIP. Check console for details.");
		});
}


function validateFileTypeAndSizeForMultipartPhotos(maxSizeOfFileToUpload, elementId) {
	let files = $('#' + elementId).prop('files');
	
	let isValid	= true;
	
	$.each(files, function(index, file) {
		let sFileName		= file.name;
		let fileSize		= file.size / 1048576;	//size in mb 
		let fileSizeInKB	= file.size / 1024;	 //size in kb 
						
		let sFileExtension	= sFileName.split('.')[sFileName.split('.').length - 1].toLowerCase();
				
		if(!(sFileExtension === 'jpg' || sFileExtension === 'jpeg' || sFileExtension === 'png')) {
			showMessage('info', validImageFileInfoMsg);
			isValid	= false;
			return false;
		} else if(maxSizeOfFileToUpload > 0) {
			if(maxSizeOfFileToUpload.toString().length == 1 && fileSize > maxSizeOfFileToUpload) {
				showMessage('info', maxFileSizeInfoMsg(maxSizeOfFileToUpload + ' MB !'));
				isValid	= false;
				return false;
			} else if(maxSizeOfFileToUpload.toString().length > 1 && fileSizeInKB > maxSizeOfFileToUpload) {
				showMessage('info', maxFileSizeInfoMsg(maxSizeOfFileToUpload + ' KB !'));
				isValid	= false;
				return false;
			}
		}
	});
	
	return isValid;
}

function getCurrentFormattedDate(curDate) {
	let currentDate		= new Date(curDate);
	
	return getFormattedDate1(currentDate.getDate()) + "-" + getFormattedMonth1(currentDate.getMonth()) + "-" + currentDate.getFullYear();
}

function getFormattedDate1(date) {
	return date < 10 ? "0" + (date) : date;
}

function getFormattedMonth1(month) {
	return (month + 1) < 10 ? "0" + (month + 1) : month + 1;
} 

function validateFileTypeAndSizeForUploadPdf(noOfFileToUpload, maxSizeOfFileToUpload) {
	return validateDifferentFileTypeAndSize(noOfFileToUpload, maxSizeOfFileToUpload, ['pdf']);
}

function validateDifferentFileTypeAndSize(noOfFileToUpload, maxSizeOfFileToUpload, fileTypes) {
	for(let i = 1; i <= noOfFileToUpload; i++) {
		$('#document_' + i).bind('change', function() {
			if (this.files && this.files[0]) {
				let files			= this.files[0];
				let sFileName		= files.name;
				let fileSize		= files.size / 1048576;	 //size in mb 
				let fileSizeInKB	= files.size / 1024;  //size in kb 
				let elementId		= $(this).attr('id');
				
				let sFileExtension	= sFileName.split('.')[sFileName.split('.').length - 1].toLowerCase();
				
				if(!fileTypes.includes(sFileExtension)) {
					emptyPdfFile(this);
					showMessage('info', "Please Select Valid File!");
					return false;	
				} else if(maxSizeOfFileToUpload > 0) {
					if(maxSizeOfFileToUpload.toString().length == 1 && fileSize > maxSizeOfFileToUpload) {
						emptyPdfFile(this);
						showMessage('info', maxFileSizeInfoMsg(maxSizeOfFileToUpload + ' MB !'));
						return false;	
					} else if(maxSizeOfFileToUpload.toString().length > 1 && fileSizeInKB > maxSizeOfFileToUpload) {
						emptyPdfFile(this);
						showMessage('info', maxFileSizeInfoMsg(maxSizeOfFileToUpload + ' KB !'));
						return false;	
					}
				}
				
				let fileReader	= new FileReader();
				
				fileReader.addEventListener("load", function(e) {
					displayPdfPreview(elementId, e);
				}); 
	
				fileReader.readAsDataURL(files);
			}
			
			return true;
		});
	}
	
	return true;
}

function emptyPdfFile(obj) {
	let elementId		= $(obj).attr('id');
	$('#displayPdf_' + elementId.split('_')[1]).attr('style', 'display: none');
	$('#pdf_' + elementId.split('_')[1]).attr('src', '');
	$.trim($(obj).val(''));
}

function displayPdfPreview(elementId, e) {
	$('#displayPdf_' + elementId.split('_')[1]).attr('style', 'display: inline-block');
	$('#pdf_' + elementId.split('_')[1]).attr('src', e.target.result);
}

function urlExists(url) {
	let http = new XMLHttpRequest();
	http.open('HEAD', url, false);
	http.send();
	return http.status == 200;
}

function setLogo(accountGroupId) {
	let imgPath	= $('#companyLogoSrcPath').val();
	
	if(imgPath != undefined && imageSrcExists(imgPath))
		$(".companyLogo").attr("src", imgPath);
	else {
		imgPath	= "/ivcargo/images/Logo/" + accountGroupId;
		setLogos(imgPath, 'companyLogo');
	}
}

function setLogos(imgPath, className) {
	for (const element of imageExtensionArr) {
		if(imageSrcExists(imgPath + element)) {
			$("." + className).attr("src", imgPath + element);
			break;
		}
	}
}

function setQRLogo(accountGroupId) {
	let imgPath	= "/ivcargo/images/QR/" + accountGroupId;
	setLogos(imgPath, 'companyQRLogo');
}

function setLogoHeader(accountGroupId) {
	let imgPath	= "/ivcargo/images/logoheader/" + accountGroupId;
	setLogos(imgPath, 'companyHeaderLogo');
}

function setSignLogo(accountGroupId) {
	let imgPath	= "/ivcargo/images/Sign/" + accountGroupId;
	setLogos(imgPath, 'companySignLogo');
}

function setWaterMarkLogo(accountGroupId) {
	let imgPath	= "/ivcargo/images/wmk/" + accountGroupId;
	setLogos(imgPath, 'companyWaterMarkLogo');
}

function setGodLogo(accountGroupId) {
	let imgPath	= "/ivcargo/images/godlogo/" + accountGroupId;
	setLogos(imgPath, 'companyGodLogo');
}

function setCompanyLogos(accountGroupId) {
	if (accountGroupId == ACCOUNT_GROUP_ID_DEMO) {
		$(".companyLogo").attr("src", "/ivcargo/images/Logo/396.png");
		$(".companyLogo").removeClass('hide');
	} else
		setLogo(accountGroupId);
					
	setLogoHeader(accountGroupId);
	setQRLogo(accountGroupId);
	setSignLogo(accountGroupId);
	setWaterMarkLogo(accountGroupId);
	setGodLogo(accountGroupId);
}
function setQrLogoSourceRegionWise(accountGroupId,sourceRegionId) {
	let imgPath	= "/ivcargo/images/QR/" + accountGroupId +"/"+ sourceRegionId;
	setLogos(imgPath, 'QrLogoSourceRegionWise');	
}

function setQrSourceRegionAndSubRegionWise(accountGroupId,sourceRegionId,sourceSubRegionId) {
	let regionPath		= "/ivcargo/images/QR/" + accountGroupId +"/Region/"+ sourceRegionId;
	let subRegionPath	= "/ivcargo/images/QR/" + accountGroupId +"/SubRegion/"+ sourceSubRegionId;
	let regionImageFound = false;
		for (const ext of imageExtensionArr) {
			if (imageSrcExists(regionPath + ext)) {
			regionImageFound = true;
				break;
			}
		}
	
		if (regionImageFound) {
			setLogos(regionPath, 'QrSourceRegionAndSubRegionWise');
		}
		else {
			setLogos(subRegionPath, 'QrSourceRegionAndSubRegionWise');
		}
}

function validateValidGSTNumber(elementID, messageType) {
	let element		= document.getElementById(elementID);
	
	if(element == null || element == undefined)
		return true;
	
	let value		= element.value;
	let regex		= new RegExp(gstRegex);
	let regex1		= new RegExp(gstRegexn);
	let regex2		= new RegExp(gstRegexF1);
			
	if (value != '' && value.length > 0 && value.length != 15) {
		showMessage(messageType, gstnErrMsg);
		changeTextFieldColor(elementID, '', '', 'red');
		element.focus();
		isValidationError	= true;
		return false;
	} else if(value.length == 15 && !regex.test(value.toUpperCase()) && !regex1.test(value.toUpperCase()) && !regex2.test(value.toUpperCase())) {
		showMessage(messageType, gstnValidationErrMsg);
		changeTextFieldColor(elementID, '', '', 'red');
		element.focus();
		isValidationError = true;
		return false;
	}

	return true;
}

function validateDifferentFormateGSTNo(elementID, messageType){
	let regex		= new RegExp(gstRegexF1);
	let regexn		= new RegExp(gstRegexF2);
	let element		= document.getElementById(elementID);
	let value		= element.value;
	
	if(/^-?\d+(\.\d+)?$/.test(value.slice(0, 12))) {
		if(value.length == 15 && !regexn.test(value.toUpperCase())) {
			showMessage(messageType, gstnValidationErrMsg);
			changeTextFieldColor(elementID, '', '', 'red');
			element.focus();
			element.value = '';
			isValidationError = true;
			return false;
		}
	} else if(value.length == 15 && !regex.test(value.toUpperCase())) {
		showMessage(messageType, gstnValidationErrMsg);
		changeTextFieldColor(elementID, '', '', 'red');
		element.focus();
		element.value = '';
		isValidationError = true;
		return false;
	}
		
	return true;
}

function exportToPdfWithMail(response) {
	/*
		<script type="text/javascript" src="/ivcargo/js/jspdf/html2canvas.js"></script>
		<script type="text/javascript" src="/ivcargo/js/jspdf/jspdf.min.js"></script>
		<script src="/ivcargo/resources/js/html2pdf/pdfmake.min.js"></script>
		<script src="/ivcargo/resources/js/html2pdf/vfs_fonts.js"></script>
		<script src="/ivcargo/resources/js/html2pdf/html2pdf.bundle.min.js"></script>
	*/
	
	$('body').scrollTop(0);
							
	let opt = {
		margin: [20, 10],
		filename: response.filename,
		image: { type: 'jpeg', quality: 1.20 },
		html2canvas: { scale: 5, logging: true, dpi: 192, letterRendering: true, },
		jsPDF: { unit: 'pt', format: 'a4', orientation: 'landscape' },
		pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
	};
							
	const elem = document.getElementById(response.tableId);
						
	html2pdf().set(opt).from(elem).outputPdf('blob').then((result) => {
		let formData = new FormData();
		formData.append("files", result, opt.filename);
		formData.append("fileName", opt.filename);
		formData.append("billId", response.billId);
		formData.append("emailAddress", $('#emailAddress').val());
		formData.append("accountGroupId", response.accountGroupId);
		formData.append("branchId", response.branchId);
		formData.append("executiveId", response.executiveId);
		formData.append("WebSitePath", $('#website_path').val());
		formData.append("sendWhatsApp", response.sendWhatsApp);
								
		let xhr = new XMLHttpRequest();
		xhr.open('POST', response.url, true);
		xhr.onload = function () {
			if (xhr.status === 200) {
				alert('Email sent successfully!');
			} else {
				alert('Error sending email.');
			}
						
			hideLayer();
			window.close();
		};
	
		xhr.send(formData);
	});
}

function isValidLatitude(latitude) {
	return latitude >= -90 && latitude <= 90;
}

function isValidLongitude(longitude) {
	return longitude >= -180 && longitude <= 180;
}

function getParamsForNewWindow(width, height) {
	let params	= 'width=' + width;
	params += ', height=' + height;
	params += ', top=0, left=0'
	params += ', fullscreen=yes';
	params += ', directories=no';
	params += ', location=no';
	params += ', menubar=no';
	params += ', resizable=no';
	params += ', scrollbars=no';
	params += ', status=no';
	params += ', toolbar=no';
	
	return params;
}

function getRandomColor() {
	return colors[Math.floor(Math.random() * colors.length)];
}

function getAllUrlParams(url) {
	// get query string from url (optional) or window
	let queryString = url ? url.split('?')[1] : window.location.search.slice(1);

	// we'll store the parameters here
	let obj = {};

	// if query string exists
	if (queryString) {
		// stuff after # is not part of query string, so get rid of it
		queryString = queryString.split('#')[0];

		// split our query string into its component parts
		let arr = queryString.split('&');

		for (let i = 0; i < arr.length; i++) {
			// separate the keys and the values
			let a = arr[i].split('=');

			// set parameter name and value (use 'true' if empty)
			let paramName = a[0];
			let paramValue = typeof (a[1]) === 'undefined' ? true : a[1];

			// (optional) keep case consistent
			//paramName = paramName.toLowerCase();
			
			if (typeof paramValue === 'string') paramValue = paramValue.toLowerCase();

			// if the paramName ends with square brackets, e.g. colors[] or colors[2]
			if (paramName.match(/\[(\d+)?\]$/)) {
				// create key if it doesn't exist
				let key = paramName.replace(/\[(\d+)?\]/, '');
					
				if (!obj[key]) obj[key] = [];

				// if it's an indexed array e.g. colors[2]
				if (paramName.match(/\[\d+\]$/)) {
					// get the index value and add the entry at the appropriate position
					let index = /\[(\d+)\]/.exec(paramName)[1];
					obj[key][index] = paramValue;
				} else {
					// otherwise add the value to the end of the array
					obj[key].push(paramValue);
				}
			} else {
				// we're dealing with a string
				if (!obj[paramName]) {
					// if it doesn't exist, create property
					obj[paramName] = paramValue;
				} else if (obj[paramName] && typeof obj[paramName] === 'string') {
					// if property does exist and it's a string, convert it to an array
					obj[paramName] = [obj[paramName]];
					obj[paramName].push(paramValue);
				} else {
					// otherwise add the property
					obj[paramName].push(paramValue);
				}
			}
		}
	}

	return obj;
}

function loadJS(file) {
	// DOM: Create the script element
	let jsElm = document.createElement("script");
	// set the type attribute
	jsElm.type = "text/javascript";
	// make the script element load file
	jsElm.src = file;
	// finally insert the element to the body element in order to load the script
	document.body.appendChild(jsElm);
}

function limitOnDigits(input) {
	let value = input.value.trim(); // Remove leading and trailing whitespace
	let decimalIndex = value.indexOf('.'); // Find the index of the decimal point

	// If the input has more than 9 characters (including the decimal point), truncate it
	if (value.length > 9) {
		input.value = value.slice(0, 9);
	}

	// If the input contains a decimal point
	if (decimalIndex !== -1) {
		let integerPart = value.slice(0, decimalIndex); // Extract the integer part
		let decimalPart = value.slice(decimalIndex + 1); // Extract the decimal part

		// If the integer part has more than 6 digits, truncate it
		if (integerPart.length > 6) {
			input.value = value.slice(0, 6);
		}

		// If the decimal part has more than 2 digits, truncate it
		if (decimalPart.length > 3) {
			input.value = integerPart + '.' + decimalPart.slice(0, 2);
		}
	} else {
		// If there's no decimal point and the input has more than 6 digits, truncate it
		if (value.length > 6) {
			input.value = value.slice(0, 6);
		}
	}
}

function isValidDateFormat(dateString) {
	const regex = /^\d{2}-\d{2}-\d{4}$/;
	return regex.test(dateString);
}

function getStateCode(gstn) {
	if(gstn == null || gstn == undefined || gstn == 'undefined')
		return 0;
		
	return gstn.slice(0, 2);
}

function convertDateToOtheFormat(inputDate, filter, sep) {
	const [day, month, year] = inputDate.split(sep);
	const monthName = monthNames[parseInt(month, 10) - 1];
	const monthFullName = monthFullNames[parseInt(month, 10) - 1];
	
	if(filter == 1)
		return `${monthName}-${year}`;
	
	if (filter == 2)
		return `${monthFullName} ${year}`;
		
	if (filter == 3)
		return `${monthFullName.slice(0, 3)} '${year.slice(-2)}`;
		
	if (filter == 4)
		return `${year}-${month}-${day}`
		
	return `${day}-${monthName}-${year}`;
}

function clearFormElements(className) {
	jQuery("." + className).find(':input').each(function() {
		switch(this.type) {
			case 'password':
			case 'text':
			case 'textarea':
			case 'file':
			case 'select-one':
			case 'select-multiple':
			case 'date':
			case 'number':
			case 'tel':
			case 'email':
				jQuery(this).val('');
				break;
			case 'checkbox':
			case 'radio':
				this.checked = false;
				break;
		}
	});
}

function filterDivData(id, value, tag) {
	$('#' + id +  ' ' + tag).each(function() {
		// If the list item does not contain the text phrase fade it out
		if ($(this).text().toLowerCase().search(new RegExp(value, "i")) < 0)
			$(this).hide();
		else
			$(this).show();
	});
}

function filterTableData(value, tableId) {
	let filter	= value.toUpperCase();
	let table	= document.getElementById(tableId);
	let tr		= table.getElementsByTagName("tr");
	
	for (const element of tr) {
		let td = element.getElementsByTagName("td");
		
		let found	= false;
		
		for (let j = 0; j < td.length; j++) {
			let txtValue = td[j].textContent || td[j].innerText;
			
			if (txtValue.toUpperCase().indexOf(filter) > -1) {
				found = true;
				break;
			} else
				element.style.display = "none";
		}	
		
		if(found)
			element.style.display = "";
	}
}

function hideInfo() {
	document.getElementById('info').style.display = 'none';
}

function filterDivs(id, value, tag) {
	const divs = Array.from(document.querySelectorAll('#' + id +  ' ' + tag)); // Convert NodeList to Array
	const filterTextLower = value.toLowerCase();

	divs.forEach(div => {
		const textContent = div.textContent.toLowerCase();
		div.style.display = textContent.includes(filterTextLower) ? 'block' : 'none';
	});
}

function getIdOfYoutube(url) {
	let ID = '';
	url = url.replace(/(>|<)/gi,'').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
  
	if(url[2] !== undefined) {
		ID = url[2].split(/[^0-9a-z_\-]/i);
		ID = ID[0];
	} else {
		ID = url;
	}
    
	return ID;
}

function saveImageOnClick() {
	document.getElementById("downloadableImage").addEventListener("click", function () {
		const image = this;
		const link = document.createElement('a');
		link.href = image.src;
		link.download = (image.src).split('/').pop(); // You can change this filename
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
				
		showMessage('success', 'Photo downloaded successfully !');
	});
}

function base64ToBlob(base64, mimeType) {
	let byteCharacters = atob(base64);
	let byteNumbers = new Array(byteCharacters.length);
			
	for (let i = 0; i < byteCharacters.length; i++) {
		byteNumbers[i] = byteCharacters.charCodeAt(i);
	}
			
	let byteArray = new Uint8Array(byteNumbers);
						
	return new Blob([byteArray], { type: mimeType });
}

function getMimeType(fileName) {
	const extension = fileName.split('.').pop().toLowerCase();
	
	switch(extension) {
		case 'pdf':		return 'application/pdf';
		case 'png':		return 'image/png';
		case 'jpeg':	return 'image/jpeg';
		case 'jpg':		return 'image/jpg';
		default:		return 'application/octet-stream';
	}
}

function downloadDocument(fileData, name) {
	let mimeType 	= getMimeType(name); // Get the MIME type based on the file extension
	let blob 		= base64ToBlob(fileData, mimeType);
			
	// Create a URL for the Blob
	let blobUrl = URL.createObjectURL(blob);
			
	// Create an anchor element for downloading
	let a = document.createElement('a');
	a.href = blobUrl;
	a.download = name;
	a.style.display = 'none';
			
	// Append the anchor element to the document
	document.body.appendChild(a);
			
	// Trigger a click event on the anchor element
	a.click();
			
	// Remove the anchor element
	document.body.removeChild(a);
			
	// Revoke the Blob URL to release resources
	URL.revokeObjectURL(blobUrl);
}

function readUploadedPdf(fileData) {
	const byteArrays = [];
	const byteCharacters = atob(fileData);
							
	for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
		const slice = byteCharacters.slice(offset, offset + 1024);
		const byteArray = new Uint8Array(slice.length);

		for (let i = 0; i < slice.length; i++) {
			byteArray[i] = slice.charCodeAt(i);
		}
								
		byteArrays.push(byteArray);
	}
							
	const blob = new Blob(byteArrays, { type: 'application/pdf' });
	
	return URL.createObjectURL(blob);
}

function checkPasswordStrength(newPwd) {
	let strength = 0;

	// Handle bad/common passwords early
	if (['123', '1234', '12345'].includes(newPwd)) {
		strength = 10; // very weak
	} else if (newPwd.length > 0) {
		// Basic length-based scoring
		if (newPwd.length >= 6)
			strength = 40;
		else if (newPwd.length >= 4)
			strength = 20;
		else if (newPwd.length >= 2)
			strength = 10;
		else
			strength = 5;

		// Bonus for complexity
		const hasLower = /[a-z]/.test(newPwd);
		const hasUpper = /[A-Z]/.test(newPwd);
		const hasDigit = /\d/.test(newPwd);
		const hasSpecial = /[^A-Za-z0-9]/.test(newPwd);

		let complexityBonus = 0;

		if (hasLower && hasDigit || hasUpper && hasDigit)
			complexityBonus = 30;
					
		if (hasLower && hasUpper && hasDigit && hasSpecial && newPwd.length >= 8)
			complexityBonus = 60;

		strength += complexityBonus;

		// Cap at 100
		strength = Math.min(strength, 100);
	}

	// Update UI
	$('#password-strength-meter').val(strength);
}

function getDeviceType() {
	const ua = navigator.userAgent;

	if (/Mobi|Android|iPhone/i.test(ua))
		return "Mobile";
	else if (/iPad|Tablet/i.test(ua))
		return "Tablet";

	return "Desktop";
}

function truncateToTwoDecimals(number) {
	//do not change 1000
	return Math.round(number * 1000) / 1000;
}

function round2(n) {
	return Math.round((n + Number.EPSILON) * 100) / 100;
}

function parseDateTime(dateTimeStr) {
	if(!dateTimeStr.match(/\b(AM|PM)\b/i))
		return dateTimeStr;
	
	const [datePart, timePart, meridian] = dateTimeStr.split(' ');
	const [day, month, year] = datePart.split('-').map(Number);
	let [hour, minute, second] = timePart.split(':').map(Number);

	// Convert 12-hour to 24-hour format
	if (meridian === 'PM' && hour !== 12) hour += 12;
	if (meridian === 'AM' && hour === 12) hour = 0;
	
	return new Date(year, month - 1, day, hour, minute, second);
}

function setTagsForTemplate(formGroup, bookingSmsTags) {
	const div1 = document.createElement("div");
	div1.id = 'tagsContainer';
					
	formGroup.append('<input type="text" id="tagsSearch" placeholder="Search variables..." autocomplete="off"/>');
	formGroup.append(div1);
					
	const container = document.getElementById("tagsContainer");
					
	Object.entries(bookingSmsTags).forEach(([key, value]) => {
		const div = document.createElement("span");
		div.className = "tags-var";
		div.draggable = true;
		div.dataset.value = key;   // ${lrNumber}
		div.textContent = value;   // LR Number

		container.appendChild(div);
	});
					
	enableTagsAndVariableSearch();
	enableTagsDragAndDrop();
}

function enableTagsAndVariableSearch() {
	const searchInput = document.getElementById("tagsSearch");
	
	if(searchInput == null) return;
	
	const variables = document.querySelectorAll("#tagsContainer .tags-var");

	searchInput.addEventListener("input", function () {
		const query = this.value.toLowerCase();
	
		variables.forEach(v => {
			const text = v.textContent.toLowerCase();
			const value = v.dataset.value.toLowerCase();
	
			v.style.display = text.includes(query) || value.includes(query) ? "inline-flex" : "none";
		 });
	});
}

function enableTagsDragAndDrop() {
	let draggedValue = "";

	document.querySelectorAll(".tags-var").forEach(el => {
		el.addEventListener("dragstart", e => {
			draggedValue = e.target.dataset.value;
			e.dataTransfer.setData("text/plain", draggedValue);
		});
	});

	const textarea = document.getElementById("input-field");
				
	if(textarea == null) return;

	textarea.addEventListener("dragover", e => {
		e.preventDefault(); // REQUIRED
	});

	textarea.addEventListener("drop", e => {
		e.preventDefault();

		const value = e.dataTransfer.getData("text/plain");

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const text = textarea.value;

		textarea.value = text.substring(0, start) + value + text.substring(end);

		// move cursor after inserted text
		textarea.selectionStart = textarea.selectionEnd = start + value.length;

		textarea.focus();
	});
}
    
function isDateDifferenceAllowed(minDate, maxDate, allowedDays) {
	const parseDate = (dateStr) => {
		const [dd, mm, yyyy] = dateStr.split('-').map(Number);
		return new Date(yyyy, mm - 1, dd); // built-in Date
	};

	const startDate = parseDate(minDate);
	const endDate	= parseDate(maxDate);

	const diffInMs	 = Math.abs(endDate - startDate);
	const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

	return diffInDays >= allowedDays;
}

function addElementToCheckNoMoreThanFourDuplicateInNode(myNod, eleId, errorMessage) {
	myNod.add({
		selector: '#' + eleId,
		validate: function (callback, value) {
			if (!value && value !== 0) {
				callback(true);
				return;
			}
			
			const strValue = String(value);
			const charCount = {};
			
			for (let char of strValue) {
				charCount[char] = (charCount[char] || 0) + 1;
			}
			
			const hasMoreThanFive = Object.values(charCount).some(count => count >= 5);
			
			callback(!hasMoreThanFive);
		},
		errorMessage: errorMessage
	});
}

function setCookie(name, value, days) {
	let expires = "";
	
	if (days) {
		let date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		expires = "; expires=" + date.toUTCString();
	}

	document.cookie = name + "=" + encodeURIComponent(JSON.stringify(value))
		+ expires + "; path=/; SameSite=Strict";
}

function getCookie(name) {
	let match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
	return match ? JSON.parse(decodeURIComponent(match[2])) : null;
}