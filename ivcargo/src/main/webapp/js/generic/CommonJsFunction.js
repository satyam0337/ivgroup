/**
 * @author Anant Chaudhary	10 - Dec - 2015
 */

/*
 * Function created to refresh and hide page with different behavior
 */
function refreshAndHidePartOfPage(divId, behavior) {	
	
	var ele				= null;
	
	ele		= document.getElementById(divId);
	
	if(ele != null) {
		
		if(behavior == 'hide') {
			$("#"+divId).hide();
		} else if(behavior == 'hideAndRefresh') {
			$("#"+divId).load(location.href+" #"+divId+">*", "");
			$("#"+divId).hide();
		} else if(behavior == 'refresh') {
			$("#"+divId).load(location.href+" #"+divId+">*", "");
		}
	}	
}

/*
 * Show part of the page
 */
function showPartOfPage(divId) {
	var ele				= null;
	
	ele		= document.getElementById(divId);
	
	if(ele != null) {
		$("#"+divId).show();
	}
	
}

/*
 * Change display property
 */
function changeDisplayProperty(id, displayType) {
	var ele				= null;
	
	ele		= document.getElementById(id);

	if(ele != null) {		
		ele.style.display	= displayType;		
	}
}

/*
 * Change visibility 
 */
function changeVisibility(eleId, visibleType) {
	var ele				= null;
	
	ele		= document.getElementById(eleId);

	if(ele != null) {
		ele.style.visibility = visibleType;
	}
}

/*
 * Remove table rows 
 */
function removeTableRows(tableId, type) {
	var ele				= null;
	
	ele		= document.getElementById(tableId);
	
	if(ele != null) {
		
		if(type == 'table') {
			$("#"+tableId+" tr").remove();
		} else if(type == 'tbody') {
			$("#"+tableId+" tbody tr").remove();
		} else if(type == 'tfoot') {
			$("#"+tableId+" tfoot tr").remove();
		} else if(type == 'thead') {
			$("#"+tableId+" thead tr").remove();	
		}	
	}
}

/*
 * Function created to get difference between two days
 */
function diffBetweenTwoDays(id) {
	var ele				= null;
	
	ele		= document.getElementById(id);
	
	var oldDate		= null;
	
	if(ele != null) {
		oldDate		= ele.innerHTML;
	}
	
	var newDate		= oldDate.split('/');	
	
	var start 		= new Date(newDate[2], +newDate[1]-1, newDate[0]);
	
	var currentDate	= new Date();	
	var oneDay 		= 24 * 60 * 60 * 1000;
	var diffDays 	= (currentDate.getTime() - start.getTime())/oneDay;
	
	var days 		= Math.round(diffDays);
	
	return days;
}


//remove row from array with particular index
function removeRowFromArray(totalSD, uniqueVal) {
	for(var i = totalSD.length - 1; i >= 0; i--) {
		if(totalSD[i] === uniqueVal) {
			totalSD.splice(i, 1);
		}
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
	var ele				= null;
	
	ele		= document.getElementById(textId);
	
	if(ele != null) {
		ele.style.color				= textColor;
		ele.style.borderColor 		= borderColorCode;
		ele.style.backgroundColor	= bgColorCode;
		ele.style.borderStyle		= 'solid';
		ele.focus();
	}
}

/*
 * Change text field color without focus
 */
function changeTextFieldColorWithoutFocus(textId, textColor, bgColorCode, borderColorCode) {
	var ele				= null;
	
	ele		= document.getElementById(textId);
	
	if(ele != null) {
		ele.style.color				= textColor;
		ele.style.borderColor 		= borderColorCode;
		ele.style.backgroundColor	= bgColorCode;
		ele.style.borderStyle		= 'solid';
	}
}

/*
 * Get value from html tag
 */
function getValueFromHtmlTag(tagId) {
	var value	= null;
	var ele		= null;
	
	ele		= document.getElementById(tagId);
	
	if(ele != null) {
		value 	= $("#"+tagId).html();
	}
	
	return value;
}

/*
 * Set Value to html tag
 */
function setValueToHtmlTag(tagId, value) {
	var ele				= null;
	
	ele		= document.getElementById(tagId);
	
	if(ele != null) {
		ele.innerHTML	= value;
	}
}

/*
 * Get value from input field
 */
function getValueFromInputField(id) {
	var value	= null;
	var ele		= null;
	
	ele		= document.getElementById(id);
	
	if(ele != null) {
		value	= $("#"+id).val();
	}
	
	return value;
}

/*
 * Set value to input field
 */
function setValueToTextField(id, value) {
	var ele				= null;
	
	ele		= document.getElementById(id);
	
	var newValue	= value;
	
	if(ele != null) {
		ele.value	= newValue;
	}
}

/*
 * Remove option value from dropdown list with respect to value
 */
function removeOptionValFromList(id, value) {
	var ele				= null;
	
	ele		= document.getElementById(id);
	
	if(ele != null) {
		$("#"+id+" option[value='"+value+"']").remove();
	}
}

/*
 * Get option Text from from dropdown list with respect to value
 */
function getOptionTextFromList(id, value) {
	var selectedName	= null;
	var ele				= null;
	
	ele		= document.getElementById(id);
	
	if(ele != null) {
		selectedName	= $("#"+id+" option[value='"+value+"']").text();
	}
	
	return selectedName;
}

/*
 * Get selected text from dropdown list
 */
function getSeletedTextFromList(id) {
	
	var selectedText  	= null;
	var ele				= null;
	
	ele		= document.getElementById(id);

	if(ele != null) {
		selectedText	 = $("#"+id+" option:selected").text();
	}
	
	return selectedText;
}

/*
 * Get selected value from dropdown list
 */
function getSeletedValueFromList(id) {
	var ele				= null;
	var selectedVal  	= null;
	
	ele		= document.getElementById(id);
	
	if(ele != null) {
		selectedVal	 = $("#"+id+" option:selected").val();
	}
	
	return selectedVal;
}

/*
 * Get all option value from dropdown list to Array
 */
function getAllOptionValueFromList(listId) {
	var ele				= null;
	var optionArray		= [];
	var list			= null;
	
	ele		= document.getElementById(listId);
	
	if(ele != null) {
		list = ele.options;
		
		optionArray		= new Array(list.length);
		
		for(var i = 0; i < list.length; i++) {
			optionArray[i]	= list[i].value;
		}
	}
	
	return optionArray;
}

/*
 * Remove All option form Select tag
 */
function removeAllOption(listId) {
	
	var ele	= document.getElementById(listId);
	
	if(ele != null) {
		ele.options.length = 0;
	}
}

/*
 * Check value in array
 */
function isValueExistInArray(arr, value) {

	for(var i = 0; i < arr.length; i++) {
		if(arr[i] == value) {
			return true;
		}
	}
	
	return false;
}

function operationOnSelectTag(selectId, optType, text, value) {
	var ele				= null;
	
	ele		= document.getElementById(selectId);
	
	if(ele != null) {
		if(optType == 'remove') {
			$("#"+id+" option[value='"+value+"']").remove();
		} else if(optType == 'removeAll') {
			$('#'+selectId).find('option').remove().end();
		} else if(optType == 'replaceAllAndAddNew') {
			$('#'+selectId).find('option').remove().end().append('<option value="'+value+'">'+text+'</option>');
		} else if(optType == 'addNew') {
			$('#'+selectId).append('<option value="'+value+'" id="'+value+'">'+text+'</option>');
		}		 
	}
}

//Create row in HTML table
function createRowInTable(Id, Class, Style){
	var newRow 	=  $('<tr/>');
	
	newRow.attr({
		id 		: Id,
		class	: Class,
		style	: Style
	});
	
	return newRow;
}

/*
 * create new column with parent id which have to append it and some general configuration.
 */
function createColumnInRow(tableRow, Id, Class, Width, Align, Style, Collspan) {
	var newCol 	=  $('<td/>');
	
	newCol.attr({
		id 			: Id,
		class		: Class,
		width		: Width,
		align		: Align,
		colspan 	: Collspan,
		style		: Style
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
	var ele				= null;
	
	ele		= document.getElementById(tableId);
	
	if(ele != null) {
		$('#'+tableId).append(tableRow);
	}
}

/*
 * Hide or Show table column
 */
function hideShowTableCol(colId, type) {
	var ele				= null;
	
	ele		= document.getElementById(colId);
	
	if(ele != null) {
		if(type == 'hide') {
			$('#'+colId).hide();
		} else if(type == 'show') {
			$('#'+colId).show();
		}
	}
}

/*
 * Switch old class to new class of any html tag
 */
function switchHtmlTagClass(tagId, newClass, oldClass) {
	var ele				= null;
	
	ele		= document.getElementById(tagId);

	if(ele != null) {
		$('#'+tagId).switchClass(newClass, oldClass);
	}
}

/*
 * Set value to any html tag or text-field
 */
function setValueToContent(id, contentType, value) {
	var ele				= null;
	
	ele		= document.getElementById(id);
	
	if(ele != null) {
		if(contentType == 'text') {
			$('#' + id).text(value);
		} else if(contentType == 'htmlTag') {
			$('#' + id).html(value);
		} else if(contentType == 'formField') {
			$('#' + id).val(value);
		}
	}
}

/*
 * Create <ul> tag with parentId as id of tag to append and jsonobject of attribute
 */

function createUlTag(parentId, jsonObject) {
	var newItem = $("<ul />");
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
	var newItem = $("<li />");
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
	var newSpan 	=  $('<span/>');

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
	var newDiv 	=  $('<div/>');

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

//Function to set check to check-box
function checkedUnchecked(id, trueFalse) {
	var ele				= null;
	
	ele		= document.getElementById(id);
	
	if(ele != null) {
		if(trueFalse == 'true') {
			$('#'+id).prop('checked', true);
		} else if(trueFalse == 'false') {
			$('#'+id).prop('checked', false);
		}
	}
}

//Function to enable and disable input field
function enableDisableInputField(id, trueFalse) {
	var ele				= null;
	
	ele		= document.getElementById(id);
	
	if(ele != null) {
		if(trueFalse == 'true') {
			ele.disabled  = true;
		} else if(trueFalse == 'false') {
			ele.disabled  = false;
		}
	}
}

//Function to get single check-box value
function getCheckedValue(id) {
	var ele				= null;
	var value			= null;
	
	ele		= document.getElementById(id);
	
	if(ele != null) {
		value	= $('#'+id+':checked').val();
	}
	
	return value;
}

//Function to get All selected check-box value in array
function getAllCheckBoxSelectValue(inputName) {
	
	var checkBoxArray	= [];
	
	checkBoxArray	= new Array();
	
	$.each($("input[name="+inputName+"]:checked"), function() { 
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

/*
 * Function to set class name table tag
 */
function setClassName(id, className) {
	var ele				= null;
	
	ele		= document.getElementById(id);
	
	if(ele != null) {
		ele.className	= className;
	}
}

/*
 * Function to remove column with sum of Zero in Table
 */
function removeColumnWithZeroTotal(id) {
	var ele	= document.getElementById(id);
	
	if(ele != null) {
		//Remove 0 value cols
		var lastRow  	= $('#'+id+' tr:last')[0];
		var firstRow 	= $('#'+id+' tr:first')[0];
		var noOfCells 	= lastRow.cells.length;
		var cellIndex 	= 0;
		var zeroCols 	= new Array();
		var idx 		= 0;
		
		for(var i = 0; i < noOfCells; i++) {
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
		
		var delColNo 	= 0;
		var colNo 		= 0;
	
		for(var i = 0; i < zeroCols.length; i++) {
			colNo = (zeroCols[i] - delColNo);
			$('#'+id+' td:nth-child('+colNo+')').remove();
			delColNo++;
		}

		lastRow = $('#'+id+' tr:last')[0];
		
		for(var k = 0; k < lastRow.cells.length; k++) {
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
	var ele	= document.getElementById(id);
	
	if(ele != null) {
		ele.readOnly	= trueFalse;
	}
}

/*
 * Function to remove child element from List at particular position
 */
function removeChildEleFromList(id, position) {
	var list = document.getElementById(id);
	
	if(list != null) {
		list.removeChild(list.childNodes[position]);
	}
}

/*
 * Function to remove child element from parent element
 */
function removeChildEleFromParent(id) {
	var row = document.getElementById(id);
	
	if(row != null) {
		row.parentElement.removeChild(row);
	}
}

/*
 * Function to check value in table column 
 */
function checkValueInTableColumn(tableId, value) {
	var selectedTable	= document.getElementById(tableId);

	var result	= false;
	
	if(selectedTable != null) {
		if(selectedTable.rows.length > 0) {
			for(var i = 0; i < selectedTable.rows.length; i++) {
				var colValue	= selectedTable.rows[i].cells[0].innerHTML;
				
				if(value == colValue) {
					result	= true;
					break;
				} else {
					result	= false;
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
		close: function(ev, ui) {
			
		}
	}).css("font-size", "12px");
}

/*
 * Function added to close jQuery popup window
 */
function closeJqueryDialog(id) {
	
	var ele		= document.getElementById(id);
	
	if(ele != null) {
		$('#'+id).dialog('close');
	}
}

/*
 * Function to select all checkBox with one click
 */
function selectAllCheckBox(param, id) {
	var ele 	= document.getElementById(id);
	
	if(ele != null) {
		var count 	= parseFloat(ele.rows.length - 1);
	
		if(param == true) {
			for (var row = count; row > 0; row--) {
				if(ele.rows[row].style.display == '') {
					ele.rows[row].cells[0].firstChild.checked = true;
				}
			}
		} else if(param == false) {
	
			for (row = count; row > 0; row--) {
				if(ele.rows[row].style.display == '') {
					ele.rows[row].cells[0].firstChild.checked = false;
				}
			}
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
	var row = document.getElementById(id);
	
	if(row != null) {
		row.deleteRow(index);
	}
}

/*
 * Function to count row in table
 */
function countTableRow(id) {
	var table = document.getElementById(id);
	
	var length = 0;
	
	if(table != null) {
		length = table.rows.length;
	}
	
	return length;
}

/*
 * This function is used to change the text to uppercase, lowercase or to capitalized.
 */
function setTextTransform(id, transFormType) {
	var ele 	= document.getElementById(id);
	
	if(ele != null) {
		ele.style.textTransform = transFormType;
	}
}

function getCurrentDate() {
	var today 		= new Date();
	var currentdate	= null;
	var dd 			= today.getDate();
	var mm 			= today.getMonth() + 1; //January is 0!

	var yyyy = today.getFullYear();

	if(dd < 10){
	   dd = '0' + dd;
	}  
	
	if(mm < 10) {
	    mm = '0' + mm;
	} 
	
	currentdate = dd + '-' + mm + '-' + yyyy;
	
	return currentdate;
}

/*
 * Convert datetimestamp to Date & time 
 */
function toJSDate (dateTime) {

	var dateTime = dateTime.split(" ");//dateTime[0] = date, dateTime[1] = time

	var date = dateTime[0].split("-");
	var time = dateTime[1].split(":");

	//(year, month, day, hours, minutes, seconds, milliseconds)
	return new Date(date[0], date[1]-1, date[2], time[0], time[1], time[2], 0);
	   
}

function changeAttributeOfJSEvent(id, eventType, value) {
	$('#'+id).attr(eventType, value);
}

function changeInputFieldBgColor(id) {
	
	var ele	= document.getElementById(id);
	
	if(ele != null) {
		ele.style.backgroundColor 	= "#F0F0F0";
		ele.style.borderColor		= "#F0F0F0";
		ele.style.color				= "#000000";
	}
}